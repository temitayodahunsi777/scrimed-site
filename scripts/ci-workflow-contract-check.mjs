#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const workflowPaths = [
  ".github/workflows/ci.yml",
  ".github/workflows/agent-workspace-governance-smoke.yml",
  ".github/workflows/authority-reference-qa-smoke.yml",
  ".github/workflows/sales-demo-session-qa-smoke.yml",
  ".github/workflows/migration-dry-run.yml",
  ".github/workflows/preview-validation.yml"
];
const securityWorkflowPaths = [
  ".github/workflows/dependency-review.yml",
  ".github/workflows/codeql.yml",
  ".github/workflows/dependency-security.yml"
];

const files = Object.fromEntries(
  await Promise.all([...workflowPaths, ...securityWorkflowPaths].map(async (pathname) => [pathname, await readFile(pathname, "utf8")]))
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
  "uses: actions/cache@v5",
  "path: .next/cache",
  "runner.os }}-next-${{ hashFiles('package-lock.json')",
  "npm run release:provenance:strict",
  "npm audit --audit-level=moderate",
  "npm run security:dependency-floor",
  "npm run security:secret-scan",
  "npm run security:sbom",
  "npm run release:migration-packet",
  "node scripts/check-generated-integrity.mjs",
  "npm run smoke:execution-attempt-durable-store",
  "npm run smoke:scrimed-intelligence-safety-stack",
  "npm run test:nonsecret",
  "npm run lint",
  "npm run typecheck",
  "npm run build",
  "npm run verify:public-release"
]) {
  requireIncludes(".github/workflows/ci.yml", expected);
}

for (const pathname of securityWorkflowPaths) {
  requireIncludes(pathname, "permissions:\n  contents: read");
  requireIncludes(pathname, "uses: actions/checkout@v6");
  for (const forbidden of ["continue-on-error: true", "|| true", "set -x", "printenv", "cat .env", "echo ${{ secrets."]) {
    forbidIncludes(pathname, forbidden);
  }
}

for (const expected of [
  "pull_request:",
  "uses: actions/dependency-review-action@v4",
  "fail-on-severity: moderate",
  "license-check: true"
]) {
  requireIncludes(".github/workflows/dependency-review.yml", expected);
}

for (const expected of [
  "uses: github/codeql-action/init@v4",
  "languages: javascript-typescript",
  "build-mode: none",
  "uses: github/codeql-action/analyze@v4",
  "security-events: write"
]) {
  requireIncludes(".github/workflows/codeql.yml", expected);
}

for (const expected of [
  "image: postgres:17",
  "SCRIMED_DISPOSABLE_DATABASE: \"true\"",
  "node scripts/verify-migration-dry-run.mjs --execute --strict",
  "SCRIMED_DISPOSABLE_DATABASE_URL: postgresql://postgres:postgres@127.0.0.1:5432/scrimed_migration_ci"
]) {
  requireIncludes(".github/workflows/migration-dry-run.yml", expected);
}

for (const expected of [
  "SCRIMED_SYNTHETIC_ONLY: \"true\"",
  "SCRIMED_ALLOW_PHI: \"false\"",
  "SCRIMED_CONSEQUENTIAL_ACTIONS_ENABLED: \"false\"",
  "npm run test:preproduction-assurance",
  "node scripts/verify-preview-ui.mjs --strict",
  "retention-days: 7"
]) {
  requireIncludes(".github/workflows/preview-validation.yml", expected);
}

for (const expected of [
  "npm audit --audit-level=high --json",
  "npm audit --audit-level=critical",
  "npm run security:dependency-floor",
  "npm run security:sbom",
  "actions/dependency-review-action@v4"
]) {
  requireIncludes(".github/workflows/dependency-security.yml", expected);
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

console.log(`pass SCRIMED CI workflow contract check (${workflowPaths.length + securityWorkflowPaths.length} workflows verified)`);
