#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/documentationBeforeAuthorization.ts",
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
    throw new Error(`${path} is missing required Documentation-Before-Authorization text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/documentationBeforeAuthorization.ts"];
const roadmap = files["app/lib/scrimedBuildRoadmap.ts"];
const page = files["app/scrimed-build-roadmap/page.tsx"];
const docs = files["docs/scrimed-build-roadmap.md"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "DocumentationBeforeAuthorizationRequirementId",
  "documentationBeforeAuthorizationBoundary",
  "Documentation-Before-Authorization Engine is synthetic/no-PHI pre-submission intelligence",
  "symptom_language",
  "functional_status",
  "visit_timing",
  "medical_necessity_rationale",
  "prior_therapy_history",
  "diagnosis_specific_evidence",
  "policy_reference",
  "recent_visit_note",
  "reviewer_attestation",
  "payerSubmissionAllowed: false",
  "humanReviewRequired: true",
  "evaluateDocumentationBeforeAuthorizationPacket",
  "getDocumentationBeforeAuthorizationSummary",
  "missing-documentation-detected",
  "payer-submission-blocked",
  "synthetic-no-phi-only"
]) {
  requireIncludes("app/lib/documentationBeforeAuthorization.ts", source, expected);
}

for (const expected of [
  "getDocumentationBeforeAuthorizationSummary",
  "documentationBeforeAuthorization",
  "Documentation-Before-Authorization Engine"
]) {
  requireIncludes("app/lib/scrimedBuildRoadmap.ts", roadmap, expected);
}

for (const expected of [
  "Documentation-Before-Authorization Engine",
  "Prior-auth risk",
  "Payer submission allowed",
  "summary.documentationBeforeAuthorization"
]) {
  requireIncludes("app/scrimed-build-roadmap/page.tsx", page, expected);
}

for (const expected of [
  "Documentation-Before-Authorization Engine",
  "symptom language",
  "functional status",
  "visit timing",
  "payer submission blocked status",
  "does not submit prior authorizations",
  "does not encode live UHC"
]) {
  requireIncludes("docs/scrimed-build-roadmap.md", docs, expected);
}

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:documentation-before-authorization\": \"node scripts/documentation-before-authorization-contract-check.mjs\""
);

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/documentation-before-authorization-contract-check.mjs"
);

console.log("pass Documentation-Before-Authorization contract check");
