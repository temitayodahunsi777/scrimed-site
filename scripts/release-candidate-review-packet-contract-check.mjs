#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "scripts/release-candidate-review-packet.mjs",
  "docs/release-candidate-validation.md",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

async function load(filePath) {
  return [filePath, await readFile(filePath, "utf8")];
}

function requireIncludes(filePath, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${filePath} is missing required reviewer packet text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const packet = files["scripts/release-candidate-review-packet.mjs"];
const docs = files["docs/release-candidate-validation.md"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "buildCandidateReviewPacket",
  "ready-for-named-reviewer-disposition",
  "review-packet-failed-closed",
  "candidateReviewPacketSha256",
  "Release steward",
  "Principal engineer",
  "Clinical safety reviewer",
  "Claims and legal reviewer",
  "fileCountMatchesManifest",
  "sourceFileCountMatchesManifest",
  "candidate-files-withheld-or-unreviewable",
  "defaultOutputContainsPaths: false",
  "fileContentsIncluded: false",
  "rawDiffIncluded: false",
  "sourceCommitAuthorized: false",
  "deploymentAuthorized: false",
  "migrationApplyAuthorized: false",
  "externalDistributionAuthorized: false",
  "investorOutreachAuthorized: false",
  "releasePromotionAllowed: false",
  "parseCommittedNameStatus",
  "manifest.candidateMode === \"clean-commit\""
]) {
  requireIncludes("scripts/release-candidate-review-packet.mjs", packet, expected);
}

for (const expected of [
  "Candidate Reviewer Packet",
  "npm run release:candidate-review-packet:strict",
  "candidate, source, and review-packet SHA-256",
  "does not authorize review approval, a commit, deployment, migration, release promotion, or external distribution",
  "Any source change invalidates the packet",
  "first-parent `HEAD^..HEAD` change set"
]) {
  requireIncludes("docs/release-candidate-validation.md", docs, expected);
}

for (const expected of [
  "\"release:candidate-review-packet\": \"node scripts/release-candidate-review-packet.mjs\"",
  "\"release:candidate-review-packet:strict\": \"node scripts/release-candidate-review-packet.mjs --strict\"",
  "\"test:release-candidate-review-packet\": \"node scripts/release-candidate-review-packet.mjs --self-test\"",
  "\"contract:release-candidate-review-packet\": \"node scripts/release-candidate-review-packet-contract-check.mjs\""
]) {
  requireIncludes("package.json", packageJson, expected);
}

requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", suite, "scripts/release-candidate-review-packet.mjs");
requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", suite, "scripts/release-candidate-review-packet-contract-check.mjs");

console.log("pass SCRIMED release candidate review packet contract check");
