#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "scripts/release-candidate-validation.mjs",
  "docs/release-candidate-validation.md",
  "app/lib/releaseCandidateReadiness.ts",
  "docs/release-candidate-readiness.md",
  ".gitignore",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required candidate validation text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const validator = files["scripts/release-candidate-validation.mjs"];
const docs = files["docs/release-candidate-validation.md"];
const readiness = files["app/lib/releaseCandidateReadiness.ts"];
const readinessDocs = files["docs/release-candidate-readiness.md"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "evaluateReleaseCandidateValidation",
  "automated-candidate-validation-passed-human-review-required",
  "candidate-validation-failed-closed",
  "candidateStable",
  "sourceCommitSha",
  "sourceCommitStable",
  "sourceReviewReady",
  "artifactReviewPassed",
  "artifactReviewDetected",
  "validationEvidenceHashSha256",
  "classifyCommandWarnings",
  "npm-unavailable-direct-node-fallback",
  "direct-node-fallback",
  "fallbackStages",
  "next-swc-native-binding-unavailable-wasm-fallback",
  "warningCodes",
  "commandOutputRetained: false",
  "rawDiffRetained: false",
  "pathsPrinted: false",
  "humanReviewRequired: true",
  "sourceCommitAuthorized: false",
  "deploymentAuthorized: false",
  "migrationApplyAuthorized: false",
  "externalDistributionAuthorized: false",
  "investorOutreachAuthorized: false",
  "releasePromotionAllowed: false",
  "scripts/release-candidate-manifest.mjs",
  "scripts/investor-deck-review.mjs",
  "git diff --check",
  "npm run test:nonsecret",
  "npm run build"
]) {
  requireIncludes("scripts/release-candidate-validation.mjs", validator, expected);
}

requireIncludes(
  ".gitignore",
  files[".gitignore"],
  "outputs/SCRIMED_Strategic_Investor_Deck.pptx"
);

for (const expected of [
  "SCRIMED Release Candidate Validation",
  "npm run release:candidate-validate:strict",
  "fingerprints the candidate before and after",
  "does not retain child-process output",
  "normalized warning codes",
  "does not authorize a commit, deployment, migration, external distribution",
  "Any source or artifact change invalidates"
]) {
  requireIncludes("docs/release-candidate-validation.md", docs, expected);
}

for (const expected of [
  "npm run release:candidate-validate:strict",
  "automated-validation-command-available-human-review-required",
  "candidateValidationAuthority: false"
]) {
  requireIncludes("app/lib/releaseCandidateReadiness.ts", readiness, expected);
}

for (const expected of [
  "npm run release:candidate-validate:strict",
  "candidate, source, artifact, and validation-evidence fingerprints"
]) {
  requireIncludes("docs/release-candidate-readiness.md", readinessDocs, expected);
}

for (const expected of [
  "\"release:candidate-validate\": \"node scripts/release-candidate-validation.mjs\"",
  "\"release:candidate-validate:strict\": \"node scripts/release-candidate-validation.mjs --strict\"",
  "\"test:release-candidate-validation\": \"node scripts/release-candidate-validation.mjs --self-test\"",
  "\"contract:release-candidate-validation\": \"node scripts/release-candidate-validation-contract-check.mjs\""
]) {
  requireIncludes("package.json", packageJson, expected);
}

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/release-candidate-validation.mjs"
);
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/release-candidate-validation-contract-check.mjs"
);

console.log("pass SCRIMED release candidate validation contract check");
