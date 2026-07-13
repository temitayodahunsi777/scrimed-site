#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const workflowPaths = [
  ".github/workflows/ci.yml",
  ".github/workflows/agent-workspace-governance-smoke.yml",
  ".github/workflows/authority-reference-qa-smoke.yml",
  ".github/workflows/sales-demo-session-qa-smoke.yml"
];

const files = Object.fromEntries(
  await Promise.all(workflowPaths.map(async (pathname) => [pathname, await readFile(pathname, "utf8")]))
);

function requireIncludes(pathname, expected) {
  if (!files[pathname].includes(expected)) {
    throw new Error(`${pathname} missing required CI workflow control: ${expected}`);
  }
}

function forbidIncludes(pathname, forbidden) {
  if (files[pathname].includes(forbidden)) {
    throw new Error(`${pathname} contains forbidden CI workflow pattern: ${forbidden}`);
  }
}

for (const pathname of workflowPaths) {
  requireIncludes(pathname, "permissions:\n  contents: read");
  requireIncludes(pathname, "uses: actions/checkout@v6");
  requireIncludes(pathname, "uses: actions/setup-node@v6");
  requireIncludes(pathname, "node-version: 22");

  for (const forbidden of [
    "continue-on-error: true",
    "|| true",
    "set -x",
    "printenv",
    "cat .env",
    "echo $SCRIMED_BEARER_TOKEN",
    "echo ${SCRIMED_BEARER_TOKEN",
    "echo $SCRIMED_SALES_QA_BEARER_TOKEN",
    "echo ${SCRIMED_SALES_QA_BEARER_TOKEN",
    "echo ${{ secrets."
  ]) {
    forbidIncludes(pathname, forbidden);
  }
}

for (const expected of [
  "npm ci",
  "npm run release:provenance:strict",
  "npm audit --audit-level=moderate",
  "npm run security:dependency-floor",
  "node scripts/check-generated-integrity.mjs",
  "npm run smoke:execution-attempt-durable-store",
  "npm run smoke:scrimed-intelligence-safety-stack",
  "npm run test:nonsecret",
  "npm run lint",
  "npm run typecheck",
  "npm run build"
]) {
  requireIncludes(".github/workflows/ci.yml", expected);
}

for (const pathname of [
  ".github/workflows/agent-workspace-governance-smoke.yml",
  ".github/workflows/authority-reference-qa-smoke.yml",
  ".github/workflows/sales-demo-session-qa-smoke.yml"
]) {
  requireIncludes(pathname, "workflow_dispatch:");
  requireIncludes(pathname, "timeout-minutes: 10");
  requireIncludes(pathname, "concurrency:");
  requireIncludes(pathname, "cancel-in-progress: false");
  requireIncludes(pathname, "require_authenticated_path");
}

for (const expected of [
  "SCRIMED_BEARER_TOKEN: ${{ secrets.SCRIMED_BEARER_TOKEN }}",
  "SCRIMED_REQUIRE_AUTHENTICATED_SMOKE",
  "node scripts/agent-workspace-authenticated-smoke.mjs",
  "node scripts/trustops-authenticated-smoke.mjs",
  "bearer_token_present=true",
  "bearer_token_present=false"
]) {
  requireIncludes(".github/workflows/agent-workspace-governance-smoke.yml", expected);
}

for (const expected of [
  "SCRIMED_BEARER_TOKEN: ${{ secrets.SCRIMED_BEARER_TOKEN }}",
  "SCRIMED_REQUIRE_AUTHORITY_REFERENCE_QA",
  "node scripts/authority-artifact-reference-qa-token-preflight.mjs",
  "node scripts/authority-artifact-reference-qa-smoke.mjs",
  "Do not copy bearer tokens, refresh tokens, credentials, PHI"
]) {
  requireIncludes(".github/workflows/authority-reference-qa-smoke.yml", expected);
}

for (const expected of [
  "SCRIMED_SALES_QA_BEARER_TOKEN: ${{ secrets.SCRIMED_SALES_QA_BEARER_TOKEN }}",
  "SCRIMED_REQUIRE_SALES_QA",
  "node scripts/sales-demo-session-qa-token-preflight.mjs",
  "node scripts/sales-demo-session-qa-smoke.mjs"
]) {
  requireIncludes(".github/workflows/sales-demo-session-qa-smoke.yml", expected);
}

console.log(`pass SCRIMED CI workflow contract check (${workflowPaths.length} workflows verified)`);
