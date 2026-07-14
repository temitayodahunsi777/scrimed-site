#!/usr/bin/env node

import { emitKeypressEvents } from "node:readline";
import { readFileSync, chmodSync, existsSync, writeFileSync } from "node:fs";
import { stdin, stdout } from "node:process";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { loadLocalEnv } from "./lib/local-env.mjs";
import {
  analyzeAal2BearerToken,
  aal2SignatureVerification,
  extractBearerTokenFromSessionJson,
  formatAal2TokenReport,
  isDurableStoreAuthorizedRole,
  redactSensitive,
  userFingerprint
} from "./lib/aal2-token-policy.mjs";

loadLocalEnv();

const args = process.argv.slice(2);

function hasFlag(flag) {
  return args.includes(flag);
}

function optionValue(name) {
  const index = args.indexOf(name);

  if (index === -1) {
    return "";
  }

  return args[index + 1] ?? "";
}

function usage() {
  return [
    "SCRIMED AAL2 bearer token helper",
    "",
    "Safe inputs:",
    "  SCRIMED_BEARER_TOKEN=... npm run smoke:aal2:token",
    "  npm run smoke:aal2:token -- --session-file /tmp/scrimed-session.json --write-env-local",
    "  npm run smoke:aal2:token -- --clipboard-token --clear-clipboard --write-env-local",
    "  npm run smoke:aal2:token -- --prompt-token --write-env-local",
    "  npm run smoke:aal2:token -- --prompt-token --token-env SCRIMED_REVIEWER_BEARER_TOKEN --required-role reviewer --write-env-local",
    "",
    "The helper validates aal=aal2, short lifetime, session_id, Supabase Auth verification, and tenant role when Supabase env is configured.",
    "It never prints bearer-token values. Token output keys are restricted to SCRIMED_BEARER_TOKEN or SCRIMED_REVIEWER_BEARER_TOKEN."
  ].join("\n");
}

function readClipboardToken() {
  if (process.platform !== "darwin") {
    throw new Error("--clipboard-token is currently supported only on macOS.");
  }

  let clipboard = "";

  try {
    clipboard = execFileSync("/usr/bin/pbpaste", {
      encoding: "utf8",
      maxBuffer: 1024 * 1024
    }).trim();
  } catch {
    throw new Error("Could not read macOS clipboard. Use --prompt-token or --session-file instead.");
  }

  if (!clipboard) {
    throw new Error("macOS clipboard is empty. Run copy(findToken()) in the signed-in browser console again.");
  }

  if (clipboard.includes("...")) {
    throw new Error(
      "macOS clipboard contains a shortened token preview with '...'. Run copy(findToken()) again and do not copy the preview line."
    );
  }

  const extracted = extractBearerTokenFromSessionJson(clipboard);

  if (extracted) {
    return extracted;
  }

  const match = clipboard.match(/[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/);

  if (match?.[0]) {
    return match[0];
  }

  const dotCount = (clipboard.match(/\./g) ?? []).length;
  const startsLikeJwt = clipboard.startsWith("eyJ") ? "yes" : "no";

  throw new Error(
    `macOS clipboard does not contain a full JWT bearer token. Safe diagnosis: length=${clipboard.length}, dots=${dotCount}, starts_with_eyJ=${startsLikeJwt}. Run copy(findToken()) in the signed-in browser console again.`
  );
}

function clearClipboard() {
  if (process.platform !== "darwin") {
    return;
  }

  try {
    execFileSync("/usr/bin/pbcopy", {
      input: "",
      stdio: ["pipe", "ignore", "ignore"]
    });
  } catch {
    console.warn("warn could not clear macOS clipboard; clear it manually after smoke.");
  }
}

async function readHiddenToken() {
  if (!stdin.isTTY || !stdout.isTTY) {
    throw new Error("--prompt-token requires an interactive terminal.");
  }

  return new Promise((resolve, reject) => {
    let token = "";
    const wasRaw = stdin.isRaw;

    function cleanup() {
      stdout.write("\n");
      stdin.off("keypress", onKeypress);
      stdin.pause();

      if (typeof stdin.setRawMode === "function") {
        stdin.setRawMode(Boolean(wasRaw));
      }
    }

    function onKeypress(character, key = {}) {
      if (key.name === "return" || key.name === "enter") {
        cleanup();
        resolve(token.trim());
        return;
      }

      if (key.ctrl && key.name === "c") {
        cleanup();
        reject(new Error("Token prompt cancelled."));
        return;
      }

      if (key.name === "backspace" || key.name === "delete") {
        token = token.slice(0, -1);
        return;
      }

      if (character && !key.ctrl && !key.meta) {
        token += character;
      }
    }

    stdout.write("Paste short-lived AAL2 bearer token (input hidden): ");
    emitKeypressEvents(stdin);
    stdin.on("keypress", onKeypress);

    if (typeof stdin.setRawMode === "function") {
      stdin.setRawMode(true);
    }

    stdin.resume();
  });
}

function readSessionFile(path) {
  if (!path) {
    throw new Error("--session-file requires a path.");
  }

  return readFileSync(path, "utf8");
}

function envFileLine(key, value) {
  const escaped = String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `${key}="${escaped}"`;
}

function mergeEnvLocal(updates) {
  const path = ".env.local";
  const existing = existsSync(path) ? readFileSync(path, "utf8") : "";
  const keys = new Set(Object.keys(updates));
  const retained = existing
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      const equalsIndex = trimmed.indexOf("=");
      const key = equalsIndex > 0 ? trimmed.slice(0, equalsIndex).trim() : "";
      return !keys.has(key);
    })
    .filter((line, index, lines) => line.trim() || index < lines.length - 1);
  const next = [
    ...retained,
    retained.length ? "" : "# SCRIMED local AAL2 smoke secrets. Do not commit.",
    ...Object.entries(updates).map(([key, value]) => envFileLine(key, value)),
    ""
  ].join("\n");

  writeFileSync(path, next, { mode: 0o600 });
  chmodSync(path, 0o600);
}

async function verifyWithSupabase({ bearerToken, workspaceSlug }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    "";

  if (!supabaseUrl || !publishableKey) {
    return {
      ok: true,
      skipped: true,
      warning:
        "Supabase URL/publishable key missing locally; protected SCRIMED API will still verify the bearer during smoke."
    };
  }

  const client = createClient(supabaseUrl, publishableKey, {
    global: {
      headers: { Authorization: `Bearer ${bearerToken}` }
    },
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    }
  });
  const userResult = await client.auth.getUser(bearerToken);

  if (userResult.error || !userResult.data.user) {
    return {
      ok: false,
      status: 401,
      error: "Supabase Auth did not verify the provided bearer token."
    };
  }

  const user = userResult.data.user;
  const workspaceResult = await client
    .from("pilot_workspaces")
    .select("id, tenant_id, slug")
    .eq("slug", workspaceSlug)
    .maybeSingle();

  if (workspaceResult.error || !workspaceResult.data) {
    return {
      ok: false,
      status: 403,
      error: "Workspace is unavailable to this verified user, or the workspace slug is wrong."
    };
  }

  const membershipResult = await client
    .from("pilot_memberships")
    .select("role")
    .eq("tenant_id", workspaceResult.data.tenant_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipResult.error || !membershipResult.data?.role) {
    return {
      ok: false,
      status: 403,
      error: "Verified user is not a member of the target workspace tenant."
    };
  }

  if (!isDurableStoreAuthorizedRole(membershipResult.data.role)) {
    return {
      ok: false,
      status: 403,
      error: `Verified user role is ${membershipResult.data.role}; durable-store smoke requires tenant-admin, pilot-lead, or reviewer.`
    };
  }

  return {
    ok: true,
    skipped: false,
    role: membershipResult.data.role,
    userFingerprint: userFingerprint(user.id)
  };
}

if (hasFlag("--help") || hasFlag("-h")) {
  console.log(usage());
  process.exit(0);
}

let bearerToken = "";
const allowedTokenEnvironmentNames = new Set([
  "SCRIMED_BEARER_TOKEN",
  "SCRIMED_REVIEWER_BEARER_TOKEN"
]);
const tokenEnvironmentName = optionValue("--token-env") || "SCRIMED_BEARER_TOKEN";
const requiredRole = optionValue("--required-role");

if (!allowedTokenEnvironmentNames.has(tokenEnvironmentName)) {
  console.error("--token-env must be SCRIMED_BEARER_TOKEN or SCRIMED_REVIEWER_BEARER_TOKEN.");
  process.exit(1);
}

if (requiredRole && !["tenant-admin", "pilot-lead", "reviewer"].includes(requiredRole)) {
  console.error("--required-role must be tenant-admin, pilot-lead, or reviewer.");
  process.exit(1);
}

const sessionFile = optionValue("--session-file");
const sessionJsonEnv =
  optionValue("--session-json-env") ||
  (tokenEnvironmentName === "SCRIMED_REVIEWER_BEARER_TOKEN"
    ? "SCRIMED_REVIEWER_SUPABASE_SESSION_JSON"
    : "SCRIMED_SUPABASE_SESSION_JSON");
const workspaceSlug = optionValue("--workspace") || process.env.SCRIMED_WORKSPACE_SLUG || "atlas-synthetic-evaluation";
const baseUrl = optionValue("--base-url") || process.env.SCRIMED_BASE_URL || "https://app.scrimedsolutions.com";

try {
  if (sessionFile) {
    bearerToken = extractBearerTokenFromSessionJson(readSessionFile(sessionFile));
  }

  if (!bearerToken && hasFlag("--clipboard-token")) {
    bearerToken = readClipboardToken();
  }

  if (!bearerToken && hasFlag("--prompt-token")) {
    bearerToken = await readHiddenToken();
  }

  if (!bearerToken && process.env[sessionJsonEnv]) {
    bearerToken = extractBearerTokenFromSessionJson(process.env[sessionJsonEnv]);
  }

  if (!bearerToken) {
    bearerToken = process.env[tokenEnvironmentName]?.trim() ?? "";
  }

  if (!bearerToken) {
    console.log(usage());
    throw new Error(
      `No bearer token found. Provide ${tokenEnvironmentName}, --session-file, ${sessionJsonEnv}, or --prompt-token.`
    );
  }

  const analysis = analyzeAal2BearerToken({ bearerToken, workspaceSlug });

  if (!analysis.ok) {
    throw new Error(`AAL2 token preflight failed: ${analysis.errors.map(redactSensitive).join(" ")}`);
  }

  for (const warning of analysis.warnings) {
    console.warn(`warn AAL2 token preflight: ${redactSensitive(warning)}`);
  }

  const verification = await verifyWithSupabase({ bearerToken, workspaceSlug });

  if (!verification.ok) {
    throw new Error(`AAL2 token verification failed: ${redactSensitive(verification.error)}`);
  }

  if (verification.warning) {
    console.warn(`warn AAL2 token verification: ${redactSensitive(verification.warning)}`);
  }

  if (requiredRole && !verification.skipped && verification.role !== requiredRole) {
    throw new Error(`AAL2 token verification failed: verified role is ${verification.role}; ${requiredRole} is required.`);
  }

  if (requiredRole && verification.skipped) {
    console.warn(`warn AAL2 role verification: ${requiredRole} role remains pending protected API verification.`);
  }

  if (hasFlag("--write-env-local")) {
    const updates = {
      SCRIMED_BASE_URL: baseUrl,
      SCRIMED_WORKSPACE_SLUG: workspaceSlug,
      SCRIMED_REQUIRE_AUTHENTICATED_SMOKE: "true",
      [tokenEnvironmentName]: bearerToken
    };

    if (tokenEnvironmentName === "SCRIMED_REVIEWER_BEARER_TOKEN") {
      updates.SCRIMED_REQUIRE_TWO_IDENTITY_SMOKE = "true";
    }

    mergeEnvLocal(updates);
    console.log(`pass ${tokenEnvironmentName} stored in .env.local with mode 0600`);
  }

  if (hasFlag("--clear-clipboard")) {
    clearClipboard();
    console.log("pass macOS clipboard cleared");
  }

  console.log(
    [
      "pass AAL2 bearer token preflight:",
      formatAal2TokenReport(analysis, {
        signatureVerification: verification.skipped
          ? aal2SignatureVerification.pendingProtectedApi
          : aal2SignatureVerification.supabaseAuth
      }),
      verification.role
        ? `role=${verification.role}`
        : verification.skipped
          ? "role=pending-protected-api-verification"
          : "role=verified-by-supabase-auth",
      verification.userFingerprint ? `user=${verification.userFingerprint}` : ""
    ]
      .filter(Boolean)
      .join(" ")
  );
  console.log(
    tokenEnvironmentName === "SCRIMED_REVIEWER_BEARER_TOKEN"
      ? "next: npm run smoke:scrimed-work:two-identity:strict"
      : "next: npm run smoke:aal2:durable-store:strict"
  );
} catch (error) {
  console.error(redactSensitive(error instanceof Error ? error.message : String(error)));
  process.exit(1);
}
