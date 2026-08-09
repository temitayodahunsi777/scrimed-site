#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const paths = [
  "app/lib/pr25FrozenReviewBaseline.ts",
  "app/lib/exactHeadReviewBinding.ts",
  "app/lib/releaseStateMachine.ts",
  "app/lib/mergeReadiness.ts",
  "app/lib/postPr25PlatformAdvance.ts",
  "app/api/scrimed-work/review/route.ts",
  "app/scrimed-work/review/page.tsx",
  "app/globals.css",
  "docs/release/PR25_FROZEN_REVIEW_BASELINE.md",
  "docs/review/PR25_REVIEWER_BRIEF.md",
  "docs/release/PRODUCTION_AUTHORIZATION_PACKET.md",
  "scripts/verify-merge-readiness.mjs",
  "package.json"
];
const files = Object.fromEntries(
  await Promise.all(paths.map(async (path) => [path, await readFile(path, "utf8")]))
);
const combined = Object.values(files).join("\n");

for (const required of [
  "c15a79c76d59a2f94bb7f999469da8bbc1618d8c",
  "REVIEW_REQUESTED",
  "APPROVE_EXACT_HEAD",
  "READY_FOR_MERGE_AUTHORIZATION",
  "NOT_READY_FOR_MERGE",
  "releaseAuthorityGranted: false",
  "productionAuthorityGranted: false"
]) {
  assert.ok(combined.includes(required), `missing review-control contract: ${required}`);
}

for (const forbidden of [
  "review approval automatically merges",
  "merge automatically deploys",
  "production authority granted by review"
]) {
  assert.equal(combined.toLowerCase().includes(forbidden), false);
}

assert.match(files["app/scrimed-work/review/page.tsx"], /read-only/i);
assert.match(files["app/scrimed-work/review/page.tsx"], /exact-head-identity/);
assert.match(files["app/globals.css"], /\.exact-head-identity code/);
assert.match(files["app/api/scrimed-work/review/route.ts"], /none-read-only-summary/);
assert.match(files["package.json"], /test:exact-head-review-binding/);
assert.match(files["package.json"], /evidence:post-pr25-platform:check/);

console.log(
  "pass SCRIMED Work exact-head reviewer contract (frozen identity, read-only UI/API, release separation, merge preflight, and operator boundaries)"
);
