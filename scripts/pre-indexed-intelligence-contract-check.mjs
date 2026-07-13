#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/preIndexedIntelligence.ts",
  "app/lib/scrimedBuildRoadmap.ts",
  "app/scrimed-build-roadmap/page.tsx",
  "docs/scrimed-build-roadmap.md",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required Pre-Indexed Intelligence text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/preIndexedIntelligence.ts"];
const roadmap = files["app/lib/scrimedBuildRoadmap.ts"];
const page = files["app/scrimed-build-roadmap/page.tsx"];
const docs = files["docs/scrimed-build-roadmap.md"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "PreIndexedDocumentFamily",
  "preIndexedIntelligenceBoundary",
  "pre-indexed-intelligence-ready-synthetic-only",
  "fhir_bundle",
  "prior_auth_policy_summary",
  "referral_packet",
  "clinical_guideline_summary",
  "trial_protocol_summary",
  "rcm_denial_playbook",
  "patient_matching",
  "document_similarity",
  "clinical_retrieval",
  "payer_policy_lookup",
  "recommendation_search",
  "rawPayloadStored: false",
  "rawSchemaExposedToAgents: false",
  "productionConnectorApproved: false",
  "humanReviewRequired: true",
  "buildPreIndexedIndexRecord",
  "evaluatePreIndexedRetrievalTask",
  "getPreIndexedIntelligenceSummary",
  "synthetic-metadata-only",
  "retrieval-tasks-covered",
  "structure-preservation-covered",
  "production-connectors-blocked",
  "human-review-required"
]) {
  requireIncludes("app/lib/preIndexedIntelligence.ts", source, expected);
}

for (const expected of [
  "getPreIndexedIntelligenceSummary",
  "preIndexedIntelligence",
  "Pre-Indexed Intelligence"
]) {
  requireIncludes("app/lib/scrimedBuildRoadmap.ts", roadmap, expected);
}

for (const expected of [
  "Pre-Indexed Intelligence",
  "summary.preIndexedIntelligence",
  "Raw payload storage",
  "Candidate sources",
  "Human review required"
]) {
  requireIncludes("app/scrimed-build-roadmap/page.tsx", page, expected);
}

for (const expected of [
  "Pre-Indexed Intelligence",
  "app/lib/preIndexedIntelligence.ts",
  "synthetic FHIR bundle metadata",
  "patient matching",
  "payer-policy lookup",
  "provenance chains",
  "does not ingest live PHI",
  "does not ingest live PHI, store raw connector payloads, expose raw schemas to agents"
]) {
  requireIncludes("docs/scrimed-build-roadmap.md", docs, expected);
}

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:pre-indexed-intelligence\": \"node scripts/pre-indexed-intelligence-contract-check.mjs\""
);

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/pre-indexed-intelligence-contract-check.mjs"
);

console.log("pass Pre-Indexed Intelligence contract check");
