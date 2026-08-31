#!/usr/bin/env node

import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

async function collectSource(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) files.push(...await collectSource(path));
    else if (/\.(?:ts|tsx|js|jsx|mjs)$/.test(entry.name)) {
      files.push({ path, content: await readFile(path, "utf8") });
    }
  }
  return files;
}

const paths = [
  "app/lib/release/supabasePasswordlessAssurance.ts",
  "app/lib/scrimed-p33/index.ts",
  "app/lib/scrimed-p34/reviewReadiness.ts",
  "app/lib/productConsole.ts",
  "scripts/verify-supabase-security.mjs",
  "scripts/lib/p34-candidate-state.mjs",
  "scripts/generate-preproduction-assurance.mjs",
  "scripts/generate-p34-follow-on-artifacts.mjs",
  "scripts/scrimed-p34-evidence.mjs",
  "scripts/scrimed-p34-certify.mjs",
  "docs/security/SUPABASE_FREE_PLAN_PASSWORDLESS_COMPENSATING_CONTROLS.md",
  "docs/release/P34_FINAL_SYNTHETIC_CANONICAL_STATE.md",
  "docs/review/P34_FINAL_EXACT_HEAD_REVIEW_BRIEF.md",
  "artifacts/review/p34-final-risk-ranked-diff.json",
  "package.json"
];
const files = Object.fromEntries(await Promise.all(paths.map(async (path) => [
  path,
  await readFile(path, "utf8")
])));
const policy = files[paths[0]];

for (const required of [
  "COMPENSATING_CONTROL_ACTIVE",
  "DEFERRED_PLATFORM_CONTROL",
  "DEFERRED_HARDENING_FOR_PASSWORD_AUTH",
  "PASSWORD_AUTH_REQUIRES_VERIFIED_LEAKED_PASSWORD_PROTECTION",
  'protectedProductionAuth: "DENY"',
  "SUPABASE_AUTH_EVIDENCE_STALE_OR_INVALID"
]) assert.ok(policy.includes(required), required);

for (const integrationPath of paths.slice(1, 10)) {
  assert.ok(
    files[integrationPath].includes("COMPENSATING_CONTROL_ACTIVE")
      || files[integrationPath].includes("supabasePasswordlessAssurance")
      || files[integrationPath].includes("supabasePasswordlessProtectedAccess"),
    integrationPath
  );
  assert.ok(
    files[integrationPath].includes("DEFERRED_PLATFORM_CONTROL")
      || files[integrationPath].includes("supabaseAssurance")
      || files[integrationPath].includes("supabaseLeakedPasswordProtection"),
    integrationPath
  );
}

const appSource = await collectSource("app");
assert.equal(appSource.some((file) => file.content.includes("signInWithPassword(")), false);
const otpCallers = appSource.filter((file) => file.content.includes("signInWithOtp("));
assert.equal(otpCallers.length, 2);
assert.ok(otpCallers.every((file) => /shouldCreateUser\s*:\s*false/.test(file.content)));

const protectedStore = await readFile("app/lib/protectedPilotStore.ts", "utf8");
assert.ok(protectedStore.includes('claims?.aal !== "aal2"'));
assert.ok(protectedStore.includes("claims.session_id"));

const docs = files["docs/security/SUPABASE_FREE_PLAN_PASSWORDLESS_COMPENSATING_CONTROLS.md"];
assert.ok(docs.includes("warning remains open"));
assert.ok(docs.includes("Activation Trigger"));
assert.ok(docs.includes("password-based protected authentication"));
assert.ok(docs.includes("2026-09-30"));

const risk = JSON.parse(files["artifacts/review/p34-final-risk-ranked-diff.json"]);
assert.equal(risk.unexplainedFileCount, 0);
assert.equal(risk.rankOrder[0], "CRITICAL");
assert.equal(risk.rankOrder.at(-1), "DOCS");

const packageJson = JSON.parse(files["package.json"]);
assert.equal(typeof packageJson.scripts["test:supabase-passwordless-assurance"], "string");
assert.equal(typeof packageJson.scripts["contract:supabase-passwordless-assurance"], "string");

console.log(`pass SCRIMED Supabase passwordless assurance contract (${paths.length} surfaces, ${otpCallers.length} OTP callers)`);
