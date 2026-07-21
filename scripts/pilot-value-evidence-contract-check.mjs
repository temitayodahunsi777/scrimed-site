#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/pilotValueEvidence.ts",
  "app/api/pilot-value-evidence/route.ts",
  "app/api/pilot-value-evidence/brief/route.ts",
  "app/pilot-value-evidence/page.tsx",
  "docs/pilot-value-evidence.md",
  "app/lib/siteNavigation.ts",
  "app/lib/navigationAudit.ts",
  "app/lib/productConsole.ts",
  "app/product/page.tsx",
  "scripts/public-production-smoke.mjs",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required SCRIMED Pilot Value Evidence text: ${expected}`);
  }
}

function requireNotIncludes(path, text, forbidden) {
  if (text.toLowerCase().includes(forbidden.toLowerCase())) {
    throw new Error(`${path} contains forbidden SCRIMED Pilot Value Evidence claim: ${forbidden}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/pilotValueEvidence.ts"];
const api = files["app/api/pilot-value-evidence/route.ts"];
const brief = files["app/api/pilot-value-evidence/brief/route.ts"];
const page = files["app/pilot-value-evidence/page.tsx"];
const docs = files["docs/pilot-value-evidence.md"];
const navigation = files["app/lib/siteNavigation.ts"];
const audit = files["app/lib/navigationAudit.ts"];
const productConsole = files["app/lib/productConsole.ts"];
const productPage = files["app/product/page.tsx"];
const smoke = files["scripts/public-production-smoke.mjs"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "pilot-value-evidence-packets-active-synthetic-no-commercial-guarantee",
  "PilotValueEvidenceArtifact",
  "PilotValueEvidencePacket",
  "PilotValueReviewerCheckpoint",
  "PilotValueClaimControl",
  "getPilotValueEvidenceSummary",
  "buildPilotValueEvidenceBrief",
  "not-binding-commercial-offer",
  "not-customer-go-live-approval",
  "not-roi-guarantee",
  "not-authorized-production-phi",
  "binding commercial offer",
  "ROI guarantee"
]) {
  requireIncludes("app/lib/pilotValueEvidence.ts", source, expected);
}

for (const expected of [
  "X-SCRIMED-Commercial-Authority",
  "not-binding-commercial-offer",
  "X-SCRIMED-Customer-Activation",
  "not-customer-go-live-approval",
  "X-SCRIMED-ROI-Authority",
  "not-roi-guarantee",
  "X-SCRIMED-Revenue-Authority",
  "not-revenue-guarantee",
  "X-SCRIMED-PHI-Authority",
  "not-authorized-production-phi"
]) {
  requireIncludes("app/api/pilot-value-evidence/route.ts", api, expected);
}

for (const expected of [
  "buildPilotValueEvidenceBrief",
  "scrimed-pilot-value-evidence-brief.md",
  "text/markdown",
  "X-SCRIMED-Customer-Activation"
]) {
  requireIncludes("app/api/pilot-value-evidence/brief/route.ts", brief, expected);
}

for (const expected of [
  "Pilot Value Evidence",
  "Evidence packets",
  "Evidence artifacts",
  "Claim controls",
  "summary.boundary"
]) {
  requireIncludes("app/pilot-value-evidence/page.tsx", page, expected);
}

for (const expected of [
  "SCRIMED Pilot Value Evidence",
  "synthetic value metrics",
  "Safety Boundary",
  "npm run smoke:pilot-value-evidence"
]) {
  requireIncludes("docs/pilot-value-evidence.md", docs, expected);
}

for (const expected of [
  "Pilot Value Evidence",
  "/pilot-value-evidence",
  "buyer-ready evidence"
]) {
  requireIncludes("app/lib/siteNavigation.ts", navigation, expected);
}

for (const expected of [
  "expectedApiRoutePatternCount = 443",
  "\"/pilot-value-evidence\""
]) {
  requireIncludes("app/lib/navigationAudit.ts", audit, expected);
}

for (const expected of [
  "getPilotValueEvidenceSummary",
  "pilotValueEvidenceSummary",
  "pilotValueEvidence: pilotValueEvidenceStatus",
  "pilotValueEvidencePacketCount",
  "pilotValueEvidenceArtifactCount"
]) {
  requireIncludes("app/lib/productConsole.ts", productConsole, expected);
}

for (const expected of [
  "Pilot value evidence",
  "Open Evidence Packets",
  "Download Evidence Brief",
  "summary.pilotValueEvidenceSummary.boundary"
]) {
  requireIncludes("app/product/page.tsx", productPage, expected);
}

for (const expected of [
  "checkPilotValueEvidence",
  "/api/pilot-value-evidence",
  "/api/pilot-value-evidence/brief",
  "pass pilot value evidence"
]) {
  requireIncludes("scripts/public-production-smoke.mjs", smoke, expected);
}

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:pilot-value-evidence\": \"node scripts/pilot-value-evidence-contract-check.mjs\""
);

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/pilot-value-evidence-contract-check.mjs"
);

for (const path of [
  "app/lib/pilotValueEvidence.ts",
  "app/api/pilot-value-evidence/route.ts",
  "app/api/pilot-value-evidence/brief/route.ts",
  "app/pilot-value-evidence/page.tsx",
  "docs/pilot-value-evidence.md"
]) {
  const text = files[path];

  for (const forbidden of [
    "HIPAA certified",
    "SOC 2 certified",
    "FDA cleared",
    "ROI guaranteed",
    "revenue guaranteed",
    "profit guaranteed",
    "autonomous diagnosis enabled",
    "autonomous treatment enabled",
    "payer submission enabled",
    "EHR writeback enabled",
    "customer go-live approved",
    "trillion dollar valuation guaranteed"
  ]) {
    requireNotIncludes(path, text, forbidden);
  }
}

console.log("pass SCRIMED Pilot Value Evidence contract check");
