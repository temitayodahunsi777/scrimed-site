#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "scripts/release-candidate-manifest.mjs",
  "app/lib/releaseCandidateReadiness.ts",
  "app/api/release-candidate-readiness/route.ts",
  "app/api/release-candidate-readiness/brief/route.ts",
  "docs/release-provenance.md",
  "docs/release-candidate-readiness.md",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

const files = Object.fromEntries(
  await Promise.all(requiredFiles.map(async (path) => [path, await readFile(path, "utf8")]))
);

function requireIncludes(path, expected) {
  if (!files[path].includes(expected)) {
    throw new Error(`${path} missing candidate-manifest control: ${expected}`);
  }
}

for (const expected of [
  "evaluateReleaseCandidateManifest",
  "baseHeadSha",
  "candidateDigestSha256",
  "sourceCandidateDigestSha256",
  "nonSourceDeliverablesDigestSha256",
  "trackedDiffSha256",
  "untrackedContentSha256",
  "dirty-candidate-manifest-ready-review-required",
  "dirty-candidate-partitioned-review-required",
  "dirty-candidate-manifest-remediation-required",
  "strictProvenanceEligible",
  "releasePromotionAllowed: false",
  "pathsPrinted: false",
  "fileContentsPrinted: false",
  "rawDiffPrinted: false",
  "candidateMode",
  "clean-commit",
  "parentCommitSha",
  "headTreeSha",
  "emptyGitTreeSha",
  "nonSourceDeliverableCount",
  "sourceReviewReady",
  "artifactReviewRequired",
  "sensitivePathCount",
  "disposableArtifactCount",
  "Database migration owner",
  "Clinical safety reviewer",
  "Claims and legal reviewer",
  "--strict",
  "--self-test"
]) {
  requireIncludes("scripts/release-candidate-manifest.mjs", expected);
}

for (const expected of [
  "required-before-source-review",
  "npm run release:candidate-manifest",
  "npm run release:candidate-manifest:strict",
  "candidateManifestPathDisclosure: false",
  "candidateManifestReleaseAuthority: false",
  "blocked-until-clean-reviewed-immutable-revision"
]) {
  requireIncludes("app/lib/releaseCandidateReadiness.ts", expected);
}

for (const path of [
  "app/api/release-candidate-readiness/route.ts",
  "app/api/release-candidate-readiness/brief/route.ts"
]) {
  requireIncludes(path, '"Cache-Control": "no-store"');
  requireIncludes(path, '"X-SCRIMED-Release-Candidate-Manifest": "required-before-source-review"');
}

for (const path of ["docs/release-provenance.md", "docs/release-candidate-readiness.md"]) {
  requireIncludes(path, "npm run release:candidate-manifest");
  requireIncludes(path, "npm run release:candidate-manifest:strict");
  requireIncludes(path, "without printing filenames, file contents, or raw diffs");
}

for (const expected of [
  '"release:candidate-manifest": "node scripts/release-candidate-manifest.mjs"',
  '"release:candidate-manifest:strict": "node scripts/release-candidate-manifest.mjs --strict"',
  '"test:release-candidate-manifest": "node scripts/release-candidate-manifest.mjs --self-test"'
]) {
  requireIncludes("package.json", expected);
}

requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", "scripts/release-candidate-manifest.mjs");
requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", "scripts/release-candidate-manifest-contract-check.mjs");

console.log(`pass SCRIMED release candidate manifest contract check (${requiredFiles.length} files verified)`);
