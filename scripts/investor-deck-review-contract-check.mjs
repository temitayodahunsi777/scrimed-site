#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "scripts/investor-deck-review.mjs",
  "docs/investor-artifact-review.md",
  "app/lib/releaseCandidateReadiness.ts",
  "app/api/release-candidate-readiness/route.ts",
  "app/api/release-candidate-readiness/brief/route.ts",
  "docs/release-candidate-readiness.md",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required investor artifact review text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const reviewer = files["scripts/investor-deck-review.mjs"];
const docs = files["docs/investor-artifact-review.md"];
const readiness = files["app/lib/releaseCandidateReadiness.ts"];
const route = files["app/api/release-candidate-readiness/route.ts"];
const briefRoute = files["app/api/release-candidate-readiness/brief/route.ts"];
const readinessDocs = files["docs/release-candidate-readiness.md"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "extractPptxSlideTexts",
  "evaluateInvestorDeckReview",
  "maximumArchiveBytes",
  "maximumEntryBytes",
  "Encrypted PowerPoint entries are not accepted",
  "artifact-automated-review-passed-human-release-review-required",
  "artifact-remediation-required",
  "artifact-missing-operator-action-required",
  "humanReleaseReviewRequired: true",
  "externalDistributionAuthorized: false",
  "investorOutreachAuthorized: false",
  "releasePromotionAllowed: false",
  "slideTextPrinted: false",
  "artifactPathPrinted: false",
  "hipaa-certified",
  "autonomous-clinical-authority",
  "openai-relationship-claim",
  "relationship-disclaimer",
  "source-attribution"
]) {
  requireIncludes("scripts/investor-deck-review.mjs", reviewer, expected);
}

for (const expected of [
  "SCRIMED Investor Artifact Review",
  "npm run review:investor-deck:strict",
  "SHA-256 fingerprint",
  "does not print the artifact path or slide text",
  "founder, counsel/claims, and finance",
  "not legal review",
  "external distribution approval"
]) {
  requireIncludes("docs/investor-artifact-review.md", docs, expected);
}

for (const expected of [
  "recorded-evidence-revalidation-required",
  "command-catalog-not-runtime-attestation",
  "automated-review-command-available-human-release-review-required",
  "npm run review:investor-deck:strict",
  "externalArtifactDistributionAuthority: \"not-authorized\"",
  "investorArtifactFingerprintAuthority: false"
]) {
  requireIncludes("app/lib/releaseCandidateReadiness.ts", readiness, expected);
}

for (const [path, text] of [
  ["app/api/release-candidate-readiness/route.ts", route],
  ["app/api/release-candidate-readiness/brief/route.ts", briefRoute]
]) {
  requireIncludes(path, text, "X-SCRIMED-Investor-Artifact-Review");
  requireIncludes(path, text, "X-SCRIMED-Validation-Evidence");
  requireIncludes(path, text, "recorded-catalog-revalidation-required");
}

for (const expected of [
  "command and boundary catalog, not a runtime attestation",
  "npm run review:investor-deck:strict",
  "never prints slide text or artifact paths",
  "founder, counsel/claims, finance"
]) {
  requireIncludes("docs/release-candidate-readiness.md", readinessDocs, expected);
}

for (const expected of [
  "\"review:investor-deck\": \"node scripts/investor-deck-review.mjs\"",
  "\"review:investor-deck:strict\": \"node scripts/investor-deck-review.mjs --strict\"",
  "\"test:investor-deck-review\": \"node scripts/investor-deck-review.mjs --self-test\"",
  "\"contract:investor-deck-review\": \"node scripts/investor-deck-review-contract-check.mjs\""
]) {
  requireIncludes("package.json", packageJson, expected);
}

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/investor-deck-review-contract-check.mjs"
);
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/investor-deck-review.mjs"
);

console.log("pass SCRIMED investor deck review contract check");
