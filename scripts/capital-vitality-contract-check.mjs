#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/capitalAcquisitionCapturePacket.ts",
  "app/lib/capitalAcquisitionReadiness.ts",
  "app/lib/capitalPlanning.ts",
  "app/lib/capitalVitality.ts",
  "app/lib/federalContractReadiness.ts",
  "app/capital-vitality/CapitalReadinessWorkbench.tsx",
  "app/capital-vitality/FederalContractReadinessWorkbench.tsx",
  "app/capital-vitality/PublicSectorOpportunityWorkbench.tsx",
  "app/capital-vitality/page.tsx",
  "app/api/capital-vitality/route.ts",
  "app/api/capital-vitality/brief/route.ts",
  "docs/capital-vitality.md",
  "package.json",
  "scripts/capital-planning-policy-test.mjs",
  "scripts/capital-acquisition-readiness-policy-test.mjs",
  "scripts/federal-contract-readiness-policy-test.mjs",
  "scripts/public-production-smoke.mjs",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

const files = Object.fromEntries(
  await Promise.all(requiredFiles.map(async (path) => [path, await readFile(path, "utf8")]))
);

function requireIncludes(path, expected) {
  if (!files[path].includes(expected)) {
    throw new Error(`${path} is missing Capital Vitality contract text: ${expected}`);
  }
}

for (const expected of [
  "evaluatePublicSectorOpportunity",
  "ready-for-human-submission-review",
  "externalSubmissionAuthorized: false",
  "not-contract-award",
  "not-grant-award",
  "not-registration-verification",
  "not-certification-verification",
  "sam-entity-registration",
  "sam-contract-opportunities",
  "sbir-sttr-eligibility",
  "requiresAutonomousClinicalAction",
  "requiresEhrWriteback",
  "requiresPayerSubmission"
]) {
  requireIncludes("app/lib/capitalAcquisitionReadiness.ts", expected);
}

for (const expected of [
  "evaluateFederalContractReadiness",
  "buildFederalContractReadinessPacket",
  "sam-far-readiness-active-operator-evidence-required",
  "sam-record-active",
  "annual-renewal-maintenance-plan",
  "externalSubmissionAuthorized: false"
]) {
  requireIncludes("app/lib/federalContractReadiness.ts", expected);
}

for (const expected of [
  "buildCapitalAcquisitionCapturePacket",
  "buildCapitalAcquisitionCapturePacketMarkdown",
  "internal-human-submission-review-packet-ready",
  "complete-unverified-human-review-required",
  "containsRawProposal: false",
  "containsRegistrationIdentifiers: false",
  "externalReleaseAuthorized: false",
  "investorSolicitationAuthorized: false",
  "externalSubmissionAuthorized: false",
  "not-government-endorsement",
  "/api/release-continuity/diligence-packet-manifest",
  "/api/release-continuity/diligence-packet-share-guard"
]) {
  requireIncludes("app/lib/capitalAcquisitionCapturePacket.ts", expected);
}

for (const expected of [
  "scrimed-capital-plan-v1",
  "evaluateCapitalPlan",
  "evaluateFundraisingReleaseReadiness",
  "investorDiligenceManifest",
  "ready-for-qualified-release-review",
  "externalReleaseAuthorized: false",
  "acceptsRawEvidence: false",
  "not-securities-offering-material",
  "not-audited-financial-report"
]) {
  requireIncludes("app/lib/capitalPlanning.ts", expected);
}

for (const expected of [
  "CapitalReadinessWorkbench",
  "FederalContractReadinessWorkbench",
  "PublicSectorOpportunityWorkbench",
  "capitalAcquisitionCapturePacket",
  "Capital access strategy",
  "Government acquisition controls",
  "Official source registry",
  "Investor diligence manifest",
  "External release authorized: no."
]) {
  requireIncludes("app/capital-vitality/page.tsx", expected);
}

for (const expected of [
  "This browser-only evaluator stores and transmits nothing.",
  "evaluatePublicSectorOpportunity",
  "Current NO-GO requirements",
  "External submission",
  "not authorized",
  "Clear readiness states",
  "Download internal capture packet",
  "Internal capture packet",
  "External release"
]) {
  requireIncludes("app/capital-vitality/PublicSectorOpportunityWorkbench.tsx", expected);
}

for (const expected of [
  "This local workbench records checkpoint states only.",
  "Open official SAM registration",
  "Next controlled action",
  "Download internal federal readiness packet"
]) {
  requireIncludes("app/capital-vitality/FederalContractReadinessWorkbench.tsx", expected);
}

for (const expected of [
  "Figures stay in this browser tab.",
  "evaluateCapitalPlan",
  "Qualified review remains mandatory",
  "Clear entered figures"
]) {
  requireIncludes("app/capital-vitality/CapitalReadinessWorkbench.tsx", expected);
}

for (const forbidden of ["fetch(", "localStorage", "sessionStorage", "document.cookie"]) {
  if (files["app/capital-vitality/CapitalReadinessWorkbench.tsx"].includes(forbidden)) {
    throw new Error(`Capital Readiness Workbench must remain local-only; found ${forbidden}`);
  }
  if (files["app/capital-vitality/PublicSectorOpportunityWorkbench.tsx"].includes(forbidden)) {
    throw new Error(`Public-Sector Opportunity Workbench must remain local-only; found ${forbidden}`);
  }
  if (files["app/capital-vitality/FederalContractReadinessWorkbench.tsx"].includes(forbidden)) {
    throw new Error(`Federal Contract Readiness Workbench must remain local-only; found ${forbidden}`);
  }
}

for (const route of ["app/api/capital-vitality/route.ts", "app/api/capital-vitality/brief/route.ts"]) {
  for (const expected of [
    '"Cache-Control": "no-store"',
    '"X-SCRIMED-Capital-Input-Persistence": "none-local-browser-only"',
    '"X-SCRIMED-Capture-Packet": "internal-metadata-only-not-release-authority"',
    '"X-SCRIMED-Fundraising-Release": "not-authorized"',
    '"X-SCRIMED-Federal-Offer-Authority": "not-authorized"',
    '"X-SCRIMED-Government-Award-Authority": "not-contract-or-grant-award"',
    '"X-SCRIMED-Government-Registration": "not-verified"',
    '"X-SCRIMED-Public-Sector-Submission": "not-authorized"',
    '"X-SCRIMED-SAM-Control": "operator-evidence-required"'
  ]) {
    requireIncludes(route, expected);
  }
}

for (const expected of [
  "Capital Readiness Workbench",
  "Investor Diligence Manifest",
  "External fundraising release: not authorized",
  "External public-sector submission: not authorized",
  "Capital And Public-Sector Acquisition Readiness",
  "Official Source Registry",
  "ready-for-human-submission-review",
  "Internal Capital Acquisition Capture Packet",
  "internal-human-submission-review-packet-ready",
  "Federal Contract Readiness",
  "SAM/FAR Entity Readiness",
  "recipient-scoped human release decision"
]) {
  requireIncludes("docs/capital-vitality.md", expected);
}

requireIncludes(
  "package.json",
  '"test:capital-planning": "node --disable-warning=ExperimentalWarning --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-loader=./scripts/lib/ts-extension-loader.mjs scripts/capital-planning-policy-test.mjs"'
);
requireIncludes(
  "package.json",
  '"test:capital-acquisition-readiness": "node --disable-warning=ExperimentalWarning --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-loader=./scripts/lib/ts-extension-loader.mjs scripts/capital-acquisition-readiness-policy-test.mjs"'
);
requireIncludes(
  "package.json",
  '"test:federal-contract-readiness": "node --disable-warning=ExperimentalWarning --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-loader=./scripts/lib/ts-extension-loader.mjs scripts/federal-contract-readiness-policy-test.mjs"'
);
requireIncludes(
  "package.json",
  '"smoke:federal-contract-readiness": "node scripts/federal-contract-readiness-contract-check.mjs"'
);
requireIncludes(
  "package.json",
  '"smoke:capital-vitality": "node scripts/capital-vitality-contract-check.mjs"'
);
requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", "scripts/capital-planning-policy-test.mjs");
requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", "scripts/capital-acquisition-readiness-policy-test.mjs");
requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", "scripts/federal-contract-readiness-policy-test.mjs");
requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", "scripts/federal-contract-readiness-contract-check.mjs");
requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", "scripts/capital-vitality-contract-check.mjs");
requireIncludes("scripts/public-production-smoke.mjs", "capital-planning-workbench-ready-local-only");
requireIncludes("scripts/public-production-smoke.mjs", "investor-diligence-manifest-active-metadata-only");
requireIncludes(
  "scripts/public-production-smoke.mjs",
  "capital-acquisition-capture-packet-active-internal-metadata-only"
);
requireIncludes(
  "scripts/public-production-smoke.mjs",
  "sam-far-readiness-active-operator-evidence-required"
);

const combined = Object.values(files).join("\n").toLowerCase();
for (const forbidden of [
  "scrimed guarantees funding",
  "scrimed is an investment adviser",
  "externalreleaseauthorized: true",
  "acceptsrawevidence: true",
  "externalsubmissionauthorized: true",
  "government award confirmed",
  "sam registration verified by scrimed"
]) {
  if (combined.includes(forbidden)) {
    throw new Error(`Capital Vitality contains forbidden authority or guarantee: ${forbidden}`);
  }
}

console.log(
  "pass capital vitality contract (local-only capital model, metadata-only diligence, evidence-gated public-sector qualification, fail-closed external release)"
);
