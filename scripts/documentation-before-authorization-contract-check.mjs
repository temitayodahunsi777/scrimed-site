#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/documentationBeforeAuthorization.ts",
  "app/lib/demoPilotPrograms.ts",
  "app/lib/pilotDemoCommercialReadiness.ts",
  "app/lib/siteNavigation.ts",
  "app/lib/navigationAudit.ts",
  "app/documentation-before-authorization/page.tsx",
  "app/documentation-before-authorization/DocumentationWorkbench.tsx",
  "app/api/documentation-before-authorization/route.ts",
  "app/api/documentation-before-authorization/scrimed-work-handoff/route.ts",
  "app/lib/scrimed-work/payerIqHandoff.ts",
  "app/lib/scrimedBuildRoadmap.ts",
  "app/scrimed-build-roadmap/page.tsx",
  "docs/documentation-before-authorization.md",
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
const demoRegistry = files["app/lib/demoPilotPrograms.ts"];
const commercialReadiness = files["app/lib/pilotDemoCommercialReadiness.ts"];
const siteNavigation = files["app/lib/siteNavigation.ts"];
const navigationAudit = files["app/lib/navigationAudit.ts"];
const workbenchPage = files["app/documentation-before-authorization/page.tsx"];
const workbenchClient = files["app/documentation-before-authorization/DocumentationWorkbench.tsx"];
const workbenchApi = files["app/api/documentation-before-authorization/route.ts"];
const protectedHandoffApi = files["app/api/documentation-before-authorization/scrimed-work-handoff/route.ts"];
const protectedHandoff = files["app/lib/scrimed-work/payerIqHandoff.ts"];
const workbenchDocs = files["docs/documentation-before-authorization.md"];
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
  "runDocumentationBeforeAuthorizationWorkbench",
  "DocumentationBeforeAuthorizationReviewPacket",
  "readinessScore",
  "workSessionHandoff",
  "estimatedReviewMinutesReallocated",
  "freeTextAccepted: false",
  "exportAllowed: false",
  "Only enumerated synthetic workbench fields are accepted",
  "getDocumentationBeforeAuthorizationSummary",
  "buildDocumentationBeforeAuthorizationBrief",
  "missing-documentation-detected",
  "payer-submission-blocked",
  "synthetic-no-phi-only"
]) {
  requireIncludes("app/lib/documentationBeforeAuthorization.ts", source, expected);
}

for (const expected of [
  "prior-authorization-support",
  "PayerIQ Documentation Readiness Demo",
  "/documentation-before-authorization",
  "Documentation-Before-Authorization Agent",
  "No prior-authorization or appeal submission"
]) {
  requireIncludes("app/lib/demoPilotPrograms.ts", demoRegistry, expected);
}

for (const expected of [
  "prior-authorization-support",
  "VP Revenue Cycle",
  "buyer-approved completeness",
  "No live PHI, medical-necessity determination, payer submission"
]) {
  requireIncludes("app/lib/pilotDemoCommercialReadiness.ts", commercialReadiness, expected);
}

requireIncludes("app/lib/siteNavigation.ts", siteNavigation, "PayerIQ Workbench");
requireIncludes("app/lib/siteNavigation.ts", siteNavigation, "/documentation-before-authorization");
requireIncludes("app/lib/navigationAudit.ts", navigationAudit, "/documentation-before-authorization");

for (const expected of [
  "SCRIMED PayerIQ",
  "DocumentationWorkbench",
  "Run Synthetic Workbench",
  "Payer submission",
  "blocked"
]) {
  requireIncludes("app/documentation-before-authorization/page.tsx", workbenchPage, expected);
}

for (const expected of [
  "Evaluate Documentation Readiness",
  "Test blocked payer action",
  "Payer action was denied as designed",
  "Human review required",
  "Review packet held"
]) {
  requireIncludes("app/documentation-before-authorization/DocumentationWorkbench.tsx", workbenchClient, expected);
}

for (const expected of [
  "runDocumentationBeforeAuthorizationWorkbench",
  "X-SCRIMED-Payer-Submission",
  "not-authorized",
  "payer-action-denied",
  "status: 423",
  "status: 422",
  "status: 415",
  "status: 413"
]) {
  requireIncludes("app/api/documentation-before-authorization/route.ts", workbenchApi, expected);
}

for (const expected of [
  "parsePayerIqProtectedHandoffInput",
  "buildPayerIqProtectedWorkSession",
  "reviewerStatus !== \"queued\"",
  "requestedAction !== \"draft_reviewer_packet\"",
  "prior-authorization-draft",
  "payerSubmissionAllowed: false",
  "externalDistributionAllowed: false"
]) {
  requireIncludes("app/lib/scrimed-work/payerIqHandoff.ts", protectedHandoff, expected);
}

for (const expected of [
  "guardedCreatePayerIqProtectedHandoff",
  "X-SCRIMED-PayerIQ-Handoff",
  "independent-aal2-reviewer-required",
  "X-SCRIMED-External-Distribution",
  "not-authorized"
]) {
  requireIncludes(
    "app/api/documentation-before-authorization/scrimed-work-handoff/route.ts",
    protectedHandoffApi,
    expected
  );
}

for (const expected of [
  "PayerIQ",
  "registered scenario IDs",
  "Fail closed with 423",
  "No medical-necessity determination",
  "60-Day Governed Automation Pilot",
  "Protected Handoff",
  "different AAL2 member"
]) {
  requireIncludes("docs/documentation-before-authorization.md", workbenchDocs, expected);
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
