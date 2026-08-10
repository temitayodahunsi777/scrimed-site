#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
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
    throw new Error(`${path} is missing required release-candidate readiness text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/releaseCandidateReadiness.ts"];
const route = files["app/api/release-candidate-readiness/route.ts"];
const briefRoute = files["app/api/release-candidate-readiness/brief/route.ts"];
const docs = files["docs/release-candidate-readiness.md"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "scrimed-release-candidate-readiness",
  "release-candidate-validation-passed-source-provenance-blocked",
  "/api/release-candidate-readiness",
  "/api/release-candidate-readiness/brief",
  "scrimed-release-candidate-working-tree-uncommitted",
  "not-committed-by-this-route",
  "not-deployed-by-this-route",
  "blocked-until-clean-reviewed-immutable-revision",
  "blocked-uncommitted-working-tree",
  "npm run release:provenance:strict",
  "deployment-required",
  "blocked-production-delta",
  "SCRIMED_BASE_URL=https://app.scrimedsolutions.com npm run smoke:public",
  "npm run release:candidate-manifest",
  "npm run release:candidate-manifest:strict",
  "required-before-source-review",
  "candidateManifestPathDisclosure: false",
  "candidateManifestReleaseAuthority: false",
  "recorded-evidence-revalidation-required",
  "command-catalog-not-runtime-attestation",
  "currentCandidateAttested: false",
  "automated-review-command-available-human-release-review-required",
  "automated-validation-command-available-human-review-required",
  "npm run release:candidate-validate:strict",
  "candidateValidationAuthority: false",
  "npm run review:investor-deck:strict",
  "investorArtifactFingerprintAuthority: false",
  "externalArtifactDistributionAuthority: \"not-authorized\"",
  "no live PHI",
  "no autonomous diagnosis, treatment, prescribing, or final imaging interpretation",
  "no payer submission or claim submission",
  "no EHR writeback or production connector approval",
  "no HIPAA, SOC, FDA, security certification, clinical validation, or customer go-live claim"
]) {
  requireIncludes("app/lib/releaseCandidateReadiness.ts", source, expected);
}

for (const expected of [
  "getReleaseCandidateReadinessSummary",
  "X-SCRIMED-Release-Candidate-Readiness",
  "validation-passed-source-provenance-blocked",
  "X-SCRIMED-Deployment-Authority",
  "not-deployed-by-this-route",
  "X-SCRIMED-Commit-Authority",
  "not-committed-by-this-route",
  "X-SCRIMED-Data-Boundary",
  "synthetic-and-metadata-only",
  "X-SCRIMED-Investor-Artifact-Review",
  "X-SCRIMED-Candidate-Validation",
  "X-SCRIMED-Validation-Evidence",
  "recorded-catalog-revalidation-required"
]) {
  requireIncludes("app/api/release-candidate-readiness/route.ts", route, expected);
}

requireIncludes(
  "app/api/release-candidate-readiness/route.ts",
  route,
  "X-SCRIMED-Release-Candidate-Manifest"
);

for (const expected of [
  "buildReleaseCandidateReadinessBrief",
  "scrimed-release-candidate-readiness.md",
  "text/markdown",
  "X-SCRIMED-Release-Candidate-Readiness"
]) {
  requireIncludes("app/api/release-candidate-readiness/brief/route.ts", briefRoute, expected);
}

for (const expected of [
  "SCRIMED Release Candidate Readiness",
  "blocked-until-clean-reviewed-immutable-revision",
  "scrimed-release-candidate-working-tree-uncommitted",
  "recorded-evidence-revalidation-required",
  "command-catalog-not-runtime-attestation",
  "npm run release:candidate-manifest",
  "npm run release:candidate-manifest:strict",
  "npm run release:candidate-validate:strict",
  "npm run review:investor-deck:strict",
  "npm run release:provenance:strict",
  "Protected AAL2 durable-store happy paths and Compute Fabric migration apply remain separate operator workflows"
]) {
  requireIncludes("docs/release-candidate-readiness.md", docs, expected);
}

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:release-candidate-readiness\": \"node scripts/release-candidate-readiness-contract-check.mjs\""
);

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/release-candidate-readiness-contract-check.mjs"
);

console.log("pass SCRIMED release candidate readiness contract check");
