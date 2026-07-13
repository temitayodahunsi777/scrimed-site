#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  ".gitignore",
  ".vercelignore",
  "README.md",
  "app/lib/limitationsWorkaroundOperations.ts",
  "app/limitations-workarounds/page.tsx",
  "app/api/limitations-workarounds/route.ts",
  "app/api/limitations-workarounds/brief/route.ts",
  "app/lib/productConsole.ts",
  "docs/limitations-workaround-operations.md",
  "eslint.config.mjs",
  "package.json",
  "scripts/execution-attempt-durable-store-authenticated-smoke.mjs",
  "scripts/aal2-smoke-readiness-preflight.mjs",
  "scripts/limitations-workaround-contract-check.mjs",
  "scripts/public-production-smoke.mjs",
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "tsconfig.json"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required limitations-workaround contract text: ${expected}`);
  }
}

function requireLine(path, text, expectedLine) {
  const lines = text.split(/\r?\n/);

  if (!lines.includes(expectedLine)) {
    throw new Error(`${path} is missing required exact line: ${expectedLine}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const limitationsSource = files["app/lib/limitationsWorkaroundOperations.ts"];
const page = files["app/limitations-workarounds/page.tsx"];
const publicSmoke = files["scripts/public-production-smoke.mjs"];
const durableSmoke = files["scripts/execution-attempt-durable-store-authenticated-smoke.mjs"];
const aal2ReadinessPreflight = files["scripts/aal2-smoke-readiness-preflight.mjs"];
const productConsole = files["app/lib/productConsole.ts"];
const docs = files["docs/limitations-workaround-operations.md"];
const packageJson = files["package.json"];

for (const expected of [
  "limitationsResolutionWorkOrders",
  "limitationsWorkaroundExecutionLedger",
  "LimitationsBoundaryWorkaroundPlaybookItem",
  "limitationsBoundaryWorkaroundPlaybook",
  "Boundary Workaround Playbook",
  "boundaryWorkaroundPlaybookCount",
  "playbook-live-phi-request",
  "playbook-clinical-authority-request",
  "playbook-ehr-writeback-connector-request",
  "playbook-payer-submission-request",
  "playbook-autonomous-agent-action-request",
  "playbook-security-certification-request",
  "playbook-api-sla-scale-request",
  "playbook-legal-finance-investor-request",
  "playbook-global-regional-approval-request",
  "playbook-customer-go-live-release-request",
  "playbook-public-quantum-claim-request",
  "validationCommand",
  "failClosedExpectation",
  "graduationEvidence",
  "LimitationsBoundaryPreflightRequest",
  "LimitationsBoundaryPreflightEvaluation",
  "limitationsBoundaryPreflightRequests",
  "evaluateLimitationsBoundaryPreflightRequest",
  "boundaryPreflightEvaluationCount",
  "failClosedPreflightCount",
  "safeWorkaroundPreflightCount",
  "preflight-live-phi-upload",
  "preflight-payer-submit",
  "preflight-agent-remediate",
  "preflight-security-certification",
  "preflight-safe-synthetic-assessment",
  "block-fail-closed",
  "safe-workaround-only",
  "externalExecutionAllowed: false",
  "phiProcessingAllowed: false",
  "autonomousActionAllowed: false",
  "scrimed-limit-",
  "Recent Workaround Execution Ledger",
  "Known Limit Resolution Queue",
  "Known blocker resolution queue",
  "executionLedgerCount",
  "resolvedExecutionLedgerCount",
  "resolutionWorkOrderCount",
  "unresolvedResolutionWorkOrderCount",
  "tenant-admin-workspace-bootstrap-complete",
  "aal2-token-helper-source-precedence",
  "durable-store-phi-guard-precision-applied",
  "strict-aal2-durable-store-smoke-passed",
  "vercel-archive-deploy-hygiene-active",
  "aal2-durable-store-token-smoke",
  "durable-store-protected-writes-flag",
  "sandbox-dns-network-boundary",
  "supabase-password-posture",
  "local-next-swc-signature-boundary",
  "dirty-worktree-release-hygiene",
  "SCRIMED_BEARER_TOKEN",
  "SCRIMED_EXECUTION_ATTEMPT_DURABLE_STORE_ENABLED",
  "ENOTFOUND",
  "app.scrimedsolutions.com",
  "not-authorized-production-phi",
  "not-authorized-live-care",
  "not-security-certified",
  "no-autonomous-production-remediation",
  "public quantum capability"
]) {
  requireIncludes("app/lib/limitationsWorkaroundOperations.ts", limitationsSource, expected);
}

for (const expected of [
  "Known limit resolution queue",
  "Boundary workaround playbook",
  "Every preserved NO-GO boundary",
  "Boundary preflight evaluator",
  "summary.boundaryPreflightEvaluations",
  "External execution allowed",
  "PHI processing allowed",
  "Autonomous action allowed",
  "mappedPacket",
  "Fail closed",
  "Recent workaround execution ledger",
  "Resolved controls",
  "Known blockers",
  "Unresolved blockers",
  "tenant-admin workspace bootstrap",
  "strict AAL2 durable-store smoke",
  "AAL2 operator proof",
  "durable-store feature flags",
  "sandbox DNS",
  "Supabase identity posture",
  "local build tooling",
  "release hygiene"
]) {
  requireIncludes("app/limitations-workarounds/page.tsx", page, expected);
}

for (const expected of [
  "resolutionWorkOrderCount",
  "unresolvedResolutionWorkOrderCount",
  "executionLedgerCount",
  "resolvedExecutionLedgerCount",
  "strict-aal2-durable-store-smoke-passed",
  "aal2-durable-store-token-smoke",
  "sandbox-dns-network-boundary",
  "supabase-password-posture",
  "local-next-swc-signature-boundary",
  "dirty-worktree-release-hygiene",
  "Known limit resolution queue"
]) {
  requireIncludes("scripts/public-production-smoke.mjs", publicSmoke, expected);
}

for (const expected of [
  "public smoke could not reach",
  "SCRIMED_BASE_URL",
  "network access",
  "redactSensitive"
]) {
  requireIncludes("scripts/public-production-smoke.mjs", publicSmoke, expected);
}

for (const expected of [
  "durable-store smoke could not reach",
  "SCRIMED_BASE_URL",
  "network access",
  "redactSensitive"
]) {
  requireIncludes("scripts/execution-attempt-durable-store-authenticated-smoke.mjs", durableSmoke, expected);
}

for (const expected of [
  "scrimed-aal2-smoke-readiness-preflight",
  "strictAttemptReady",
  "operator-token-blocked",
  "protected APIs remain the source of truth"
]) {
  requireIncludes("scripts/aal2-smoke-readiness-preflight.mjs", aal2ReadinessPreflight, expected);
}

for (const expected of [
  "limitationsResolutionWorkOrderCount",
  "limitationsUnresolvedResolutionWorkOrderCount",
  "limitationsWorkaroundExecutionLedgerCount",
  "limitationsWorkaroundResolvedExecutionLedgerCount",
  "limitationsWorkaroundSummary.resolutionWorkOrderCount"
]) {
  requireIncludes("app/lib/productConsole.ts", productConsole, expected);
}

for (const expected of [
  "npm run test:nonsecret",
  "npm run smoke:limitations-workarounds",
  "Recent Workaround Execution Ledger",
  "Boundary Workaround Playbook",
  "Boundary Preflight Evaluator",
  "evaluateLimitationsBoundaryPreflightRequest()",
  "live PHI upload and patient matching request",
  "payer submission and reimbursement guarantee request",
  "autonomous agent production remediation and email-send request",
  "unsupported SOC 2/HIPAA certification claim request",
  "safe no-PHI synthetic assessment request",
  "external execution allowed: false",
  "PHI processing allowed: false",
  "autonomous action allowed: false",
  "Live PHI request",
  "Clinical authority request",
  "EHR/writeback connector request",
  "Payer submission request",
  "Autonomous agent action request",
  "Security certification request",
  "API/SLA/scale request",
  "Customer go-live release request",
  "Public quantum claim request",
  "Tenant-admin workspace bootstrap",
  "AAL2 token helper source precedence",
  "Durable-store PHI guard precision",
  "Strict AAL2 durable-store smoke passed",
  "AAL2 durable-store token smoke",
  "npm run smoke:aal2:readiness",
  "Durable-store protected writes flag",
  "Sandbox DNS/network boundary",
  "Supabase password posture",
  "Local Next.js SWC signature warning",
  "Dirty worktree release hygiene"
]) {
  requireIncludes("docs/limitations-workaround-operations.md", docs, expected);
}

for (const expected of [
  "\"test\": \"node scripts/scrimed-nonsecret-test-suite.mjs\"",
  "\"test:nonsecret\": \"node scripts/scrimed-nonsecret-test-suite.mjs\"",
  "\"smoke:limitations-workarounds\": \"node scripts/limitations-workaround-contract-check.mjs\""
]) {
  requireIncludes("package.json", packageJson, expected);
}

for (const expected of [
  "scripts/aal2-token-policy-selftest.mjs",
  "scripts/execution-attempt-durable-store-contract-check.mjs",
  "scripts/limitations-workaround-contract-check.mjs",
  "scripts/sales-demo-session-qa-token-policy-selftest.mjs"
]) {
  requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", files["scripts/scrimed-nonsecret-test-suite.mjs"], expected);
}

for (const expectedLine of ["node_modules", "node_modules/", ".env.local", ".env.*.local"]) {
  requireLine(".gitignore", files[".gitignore"], expectedLine);
}

for (const expectedLine of ["node_modules", ".env.*"]) {
  requireLine(".vercelignore", files[".vercelignore"], expectedLine);
}

requireIncludes("tsconfig.json", files["tsconfig.json"], "\"node_modules 2\"");
requireIncludes("eslint.config.mjs", files["eslint.config.mjs"], "\"node_modules 2/**\"");

console.log("pass limitations workaround contract check");
