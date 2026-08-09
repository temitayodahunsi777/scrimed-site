#!/usr/bin/env node

import {
  analyzeAal2BearerToken,
  formatAal2TokenReport,
  redactSensitive
} from "./lib/aal2-token-policy.mjs";
import { loadLocalEnv } from "./lib/local-env.mjs";

loadLocalEnv();

const workspaceSlug = process.env.SCRIMED_WORKSPACE_SLUG ?? "atlas-synthetic-evaluation";
const baseUrl = (process.env.SCRIMED_BASE_URL ?? "https://app.scrimedsolutions.com").replace(/\/$/, "");
const bearerToken = process.env.SCRIMED_BEARER_TOKEN?.trim() ?? "";
const jsonMode = process.argv.includes("--json");
const strictMode = process.argv.includes("--strict");

function isLocalTarget(value) {
  return /^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?$/i.test(value);
}

function envFlag(name) {
  const value = (process.env[name] ?? "").trim();

  if (!value) {
    return "missing";
  }

  return ["1", "true", "yes"].includes(value.toLowerCase()) ? "enabled" : "set-disabled";
}

function gate(id, status, detail, nextAction = "") {
  return { id, status, detail: redactSensitive(detail), nextAction };
}

const tokenAnalysis = analyzeAal2BearerToken({ bearerToken, workspaceSlug });
const localTarget = isLocalTarget(baseUrl);
const localSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
);
const localServerTokenConfigured = Boolean(process.env.SCRIMED_PILOT_INTAKE_PERSISTENCE_TOKEN);
const protectedWritesFlag = envFlag("SCRIMED_EXECUTION_ATTEMPT_DURABLE_STORE_ENABLED");
const operatorReady = tokenAnalysis.ok;
const browserSessionWorkaround = {
  url: "https://app.scrimedsolutions.com/pilot-workspace/access",
  requires: "Fresh AAL2 tenant-admin or pilot-lead browser session",
  actions: ["Run SCRIMED Work Verification", "Run Tenant Verification"],
  retainedBoundary:
    "Uses the active browser session without exporting a bearer token; synthetic metadata only."
};

const gates = [
  gate(
    "workspace-slug",
    tokenAnalysis.errors.some((error) => error.includes("SCRIMED_WORKSPACE_SLUG")) ? "fail" : "pass",
    `workspace=${tokenAnalysis.workspaceSlug || "missing"}`,
    "Set SCRIMED_WORKSPACE_SLUG to an explicit protected workspace slug."
  ),
  gate(
    "aal2-bearer-token",
    operatorReady ? "pass" : "fail",
    operatorReady
      ? formatAal2TokenReport(tokenAnalysis)
      : `token preflight blocked: ${tokenAnalysis.errors.join(" ")}`,
    "Refresh the signed-in operator session, complete MFA, then run npm run smoke:aal2:token -- --prompt-token --write-env-local."
  ),
  gate(
    "role-verification",
    operatorReady ? "target-required" : "blocked",
    operatorReady
      ? "Protected SCRIMED APIs remain the source of truth for tenant-admin, pilot-lead, or reviewer authorization."
      : "CLI role verification requires a valid short-lived token. The protected browser verifier can use an active AAL2 session without exporting bearer material.",
    "Use a tenant-admin, pilot-lead, or reviewer session for durable-store; stored-vector registration requires tenant-admin or pilot-lead."
  ),
  gate(
    "durable-store-feature-flag",
    protectedWritesFlag === "enabled" ? "local-enabled" : "target-required",
    protectedWritesFlag === "enabled"
      ? "Local environment has SCRIMED_EXECUTION_ATTEMPT_DURABLE_STORE_ENABLED enabled."
      : "The target app must have SCRIMED_EXECUTION_ATTEMPT_DURABLE_STORE_ENABLED=true for strict durable-store writes.",
    "Confirm the runtime flag on the target deployment before strict durable-store smoke."
  ),
  gate(
    "protected-supabase-runtime",
    localTarget
      ? localSupabaseConfigured && localServerTokenConfigured
        ? "local-configured"
        : "local-missing"
      : "target-required",
    localTarget
      ? localSupabaseConfigured && localServerTokenConfigured
        ? "Local Supabase URL, publishable key, and protected server token are configured."
        : "Local protected Supabase runtime credentials are incomplete; protected writes should fail closed."
      : "Production or remote targets keep Supabase runtime credentials server-side; protected APIs verify them during smoke.",
    "For local protected writes, configure NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY, and SCRIMED_PILOT_INTAKE_PERSISTENCE_TOKEN."
  ),
  gate(
    "no-secret-output",
    "pass",
    "Readiness output includes token fingerprints and redacted diagnostics only; bearer tokens are never printed.",
    "Keep .env.local gitignored and remove SCRIMED_BEARER_TOKEN after strict smoke."
  )
];

const report = {
  service: "scrimed-aal2-smoke-readiness-preflight",
  status: operatorReady ? "operator-token-ready" : "operator-token-blocked",
  strictAttemptReady: operatorReady,
  baseUrl,
  workspaceSlug: tokenAnalysis.workspaceSlug || workspaceSlug,
  tokenFingerprint: tokenAnalysis.tokenFingerprint,
  remainingSeconds: tokenAnalysis.remainingSeconds,
  tokenLifetimeSeconds: tokenAnalysis.tokenLifetimeSeconds,
  localTarget,
  gates,
  browserSessionWorkaround,
  nextCommands: operatorReady
    ? [
        "npm run smoke:aal2:durable-store:strict",
        "npm run smoke:scrimed-stored-vector-rpc:strict"
      ]
    : [
        "npm run smoke:aal2:token -- --prompt-token --write-env-local",
        "npm run smoke:aal2:readiness"
      ],
  preservedBoundaries: [
    "no PHI",
    "no live patient data",
    "no autonomous diagnosis, treatment, prescribing, outreach, payer submission, billing submission, or EHR writeback",
    "no token logging",
    "browser-session verification is preferred when interactive AAL2 access is available",
    "protected APIs remain the source of truth for signature, role, AAL2 session, tenant membership, server token, and feature flags"
  ]
};

if (jsonMode) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`SCRIMED AAL2 smoke readiness: ${report.status}`);
  console.log(`target: ${report.baseUrl}`);
  console.log(`workspace: ${report.workspaceSlug}`);
  console.log(`token_fingerprint: ${report.tokenFingerprint ?? "missing"}`);

  for (const item of report.gates) {
    console.log(`${item.status} ${item.id}: ${item.detail}`);
  }

  if (!operatorReady) {
    console.log("browser-safe alternative:");
    console.log(`  Open ${browserSessionWorkaround.url}`);
    for (const action of browserSessionWorkaround.actions) {
      console.log(`  ${action}`);
    }
    console.log(`  ${browserSessionWorkaround.retainedBoundary}`);
  }

  console.log("next:");
  for (const command of report.nextCommands) {
    console.log(`  ${command}`);
  }
}

if (strictMode && !report.strictAttemptReady) {
  process.exit(1);
}
