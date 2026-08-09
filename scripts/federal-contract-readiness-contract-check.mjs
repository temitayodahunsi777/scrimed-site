#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/federalContractReadiness.ts",
  "app/lib/capitalAcquisitionReadiness.ts",
  "app/lib/capitalVitality.ts",
  "app/capital-vitality/FederalContractReadinessWorkbench.tsx",
  "app/capital-vitality/page.tsx",
  "app/api/capital-vitality/route.ts",
  "app/api/capital-vitality/brief/route.ts",
  "docs/capital-vitality.md",
  "package.json",
  "scripts/federal-contract-readiness-policy-test.mjs",
  "scripts/public-production-smoke.mjs",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

const files = Object.fromEntries(
  await Promise.all(requiredFiles.map(async (path) => [path, await readFile(path, "utf8")]))
);

function requireIncludes(path, expected) {
  if (!files[path].includes(expected)) {
    throw new Error(`${path} is missing federal contract readiness contract text: ${expected}`);
  }
}

for (const expected of [
  "evaluateFederalContractReadiness",
  "buildFederalContractReadinessPacket",
  "buildFederalContractReadinessPacketMarkdown",
  "sam-far-readiness-active-operator-evidence-required",
  "operator-input-required",
  "federal-market-entry-review-ready",
  "externalSubmissionAuthorized: false",
  "samRegistrationVerified: false",
  "primeOfferAuthorized: false",
  "containsUei: false",
  "containsCageOrNcage: false",
  "containsTin: false",
  "containsBankingData: false",
  "createClinicalEvidenceHash",
  "containsPhiRisk",
  "containsTokenLikeField",
  "sam-account-and-authorized-administrator",
  "representations-certifications-complete",
  "annual-renewal-maintenance-plan",
  "sba-business-profile"
]) {
  requireIncludes("app/lib/federalContractReadiness.ts", expected);
}

for (const officialUrl of [
  "https://sam.gov/entity-registration",
  "https://sam.gov/sites/default/files/2024-11/entity-checklist.pdf",
  "https://www.acquisition.gov/far/52.204-7",
  "https://www.acquisition.gov/far/52.204-13",
  "https://www.sba.gov/federal-contracting/contracting-guide/how-win-contracts",
  "https://www.sba.gov/federal-contracting/contracting-guide/prime-subcontracting"
]) {
  requireIncludes("app/lib/capitalAcquisitionReadiness.ts", officialUrl);
}

for (const expected of [
  "FederalContractReadinessWorkbench",
  "Federal readiness checkpoints",
  "Default SAM decision"
]) {
  requireIncludes("app/capital-vitality/page.tsx", expected);
}

for (const expected of [
  "This local workbench records checkpoint states only.",
  "Open official SAM registration",
  "Open registration checklist",
  "Compare prime and subcontract paths",
  "Next controlled action",
  "Download internal federal readiness packet",
  "Execution authorized by SCRIMED: no"
]) {
  requireIncludes("app/capital-vitality/FederalContractReadinessWorkbench.tsx", expected);
}

for (const forbidden of ["fetch(", "localStorage", "sessionStorage", "document.cookie"]) {
  if (files["app/capital-vitality/FederalContractReadinessWorkbench.tsx"].includes(forbidden)) {
    throw new Error(`Federal Contract Readiness Workbench must remain local-only; found ${forbidden}`);
  }
}

for (const route of ["app/api/capital-vitality/route.ts", "app/api/capital-vitality/brief/route.ts"]) {
  for (const expected of [
    '"Cache-Control": "no-store"',
    '"X-SCRIMED-Federal-Offer-Authority": "not-authorized"',
    '"X-SCRIMED-Government-Registration": "not-verified"',
    '"X-SCRIMED-Public-Sector-Submission": "not-authorized"',
    '"X-SCRIMED-SAM-Control": "operator-evidence-required"'
  ]) {
    requireIncludes(route, expected);
  }
}

for (const expected of [
  "Federal Contract Readiness",
  "SAM/FAR Entity Readiness",
  "14 checkpoints",
  "Annual maintenance",
  "Subcontracting lane",
  "External submission remains not authorized"
]) {
  requireIncludes("docs/capital-vitality.md", expected);
}

requireIncludes(
  "package.json",
  '"test:federal-contract-readiness": "node --disable-warning=ExperimentalWarning --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-loader=./scripts/lib/ts-extension-loader.mjs scripts/federal-contract-readiness-policy-test.mjs"'
);
requireIncludes(
  "package.json",
  '"smoke:federal-contract-readiness": "node scripts/federal-contract-readiness-contract-check.mjs"'
);
requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", "scripts/federal-contract-readiness-policy-test.mjs");
requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", "scripts/federal-contract-readiness-contract-check.mjs");
requireIncludes("scripts/public-production-smoke.mjs", "sam-far-readiness-active-operator-evidence-required");
requireIncludes("scripts/public-production-smoke.mjs", "x-scrimed-sam-control");

const combined = Object.values(files).join("\n").toLowerCase();
for (const forbidden of [
  "sam registration verified by scrimed",
  "prime offer authorized: true",
  "externalsubmissionauthorized: true",
  "government contract guaranteed",
  "government endorsement confirmed"
]) {
  if (combined.includes(forbidden)) {
    throw new Error(`Federal contract readiness contains forbidden authority or guarantee: ${forbidden}`);
  }
}

console.log(
  "pass federal contract readiness contract (official SAM/FAR/SBA sources, local-only evidence states, controlled operator action, no registration or submission authority)"
);
