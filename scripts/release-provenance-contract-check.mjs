#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "scripts/release-provenance-preflight.mjs",
  "docs/release-provenance.md",
  ".github/workflows/ci.yml",
  ".env.example",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];
const files = Object.fromEntries(
  await Promise.all(requiredFiles.map(async (path) => [path, await readFile(path, "utf8")]))
);

function requireIncludes(path, expected) {
  if (!files[path].includes(expected)) {
    throw new Error(`${path} missing release provenance control: ${expected}`);
  }
}

for (const expected of [
  "evaluateReleaseProvenance",
  "working-tree-clean",
  "github-sha-matches-head",
  "production-attestation-enabled",
  "vercel-sha-matches-approved-release",
  "production-main-branch-only",
  "releasePromotionAllowed",
  "release-provenance-observed-drift",
  "SCRIMED_RELEASE_PROVENANCE_ENFORCED",
  "SCRIMED_APPROVED_RELEASE_SHA",
  "productionMutationPerformed: false",
  "--self-test"
]) {
  requireIncludes("scripts/release-provenance-preflight.mjs", expected);
}

for (const expected of [
  "npm run release:provenance:strict",
  "SCRIMED_APPROVED_RELEASE_SHA",
  "dirty source tree",
  "does not deploy"
]) {
  requireIncludes("docs/release-provenance.md", expected);
}

requireIncludes(".github/workflows/ci.yml", "Release provenance");
requireIncludes(".github/workflows/ci.yml", "npm run release:provenance:strict");
requireIncludes(".env.example", "SCRIMED_RELEASE_PROVENANCE_ENFORCED=false");
requireIncludes(".env.example", "SCRIMED_APPROVED_RELEASE_SHA=");
requireIncludes("package.json", '"release:provenance": "node scripts/release-provenance-preflight.mjs"');
requireIncludes("package.json", '"release:provenance:strict": "node scripts/release-provenance-preflight.mjs --strict"');
requireIncludes("package.json", '"contract:release-provenance": "node scripts/release-provenance-contract-check.mjs"');
requireIncludes("package.json", "release-provenance-preflight.mjs --deployment-aware");
requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", "scripts/release-provenance-contract-check.mjs");
requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", "scripts/release-provenance-preflight.mjs");

console.log(`pass SCRIMED release provenance contract check (${requiredFiles.length} files verified)`);
