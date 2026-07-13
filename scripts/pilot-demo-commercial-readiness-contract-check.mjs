#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/pilotDemoCommercialReadiness.ts",
  "app/api/pilot-demo-commercial-readiness/route.ts",
  "app/api/pilot-demo-commercial-readiness/brief/route.ts",
  "app/pilot-demo-commercial-readiness/page.tsx",
  "docs/pilot-demo-commercial-readiness.md",
  "scripts/public-production-smoke.mjs",
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "package.json"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} missing required Pilot Demo Commercial Readiness text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/pilotDemoCommercialReadiness.ts"];

for (const expected of [
  "PilotDemoBuyerConversionPacket",
  "buildPilotDemoBuyerConversionPackets",
  "buyerConversionPackets",
  "buyerConversionPacketCount",
  "sponsorRole",
  "workflowOwnerRole",
  "reviewCadence",
  "decisionWindow",
  "proofBundle",
  "acceptanceCriteria",
  "noPhiIntakeFields",
  "paidDiligenceTriggers",
  "disqualifiers",
  "pricingGuardrail",
  "minimumPaidStep",
  "closePlan",
  "humanReviewRequired: true",
  "syntheticOnly: true",
  "generateScrimedAuditHash",
  "non-PHI operating pain statement",
  "carepath-access-operations",
  "docutwin-documentation-review",
  "trialcore-research-operations",
  "atlas-interoperability-readiness",
  "agentos-governance-evaluation"
]) {
  requireIncludes("app/lib/pilotDemoCommercialReadiness.ts", source, expected);
}

for (const expected of [
  "Buyer conversion packets",
  "buyerConversionPacketCount",
  "summary.buyerConversionPackets",
  "Human review",
  "Audit hash"
]) {
  requireIncludes("app/pilot-demo-commercial-readiness/page.tsx", files["app/pilot-demo-commercial-readiness/page.tsx"], expected);
}

for (const expected of [
  "Buyer Conversion Packets",
  "sponsor role",
  "workflow owner role",
  "paid diligence triggers",
  "human review requirement",
  "audit hash"
]) {
  requireIncludes("docs/pilot-demo-commercial-readiness.md", files["docs/pilot-demo-commercial-readiness.md"], expected);
}

for (const expected of [
  "buyerConversionPackets",
  "CarePath buyer conversion packet controls",
  "non-PHI operating pain statement",
  "Buyer Conversion Packets"
]) {
  requireIncludes("scripts/public-production-smoke.mjs", files["scripts/public-production-smoke.mjs"], expected);
}

for (const expected of [
  "\"smoke:pilot-demo-commercial-readiness\"",
  "scripts/pilot-demo-commercial-readiness-contract-check.mjs"
]) {
  const target = expected.startsWith("\"smoke")
    ? files["package.json"]
    : files["scripts/scrimed-nonsecret-test-suite.mjs"];
  const path = expected.startsWith("\"smoke") ? "package.json" : "scripts/scrimed-nonsecret-test-suite.mjs";
  requireIncludes(path, target, expected);
}

const forbiddenPhrases = [
  "binding quote created",
  "customer go-live approved",
  "production connector approved",
  "payer submission enabled",
  "EHR writeback enabled",
  "autonomous clinical care enabled",
  "ROI guaranteed",
  "revenue guaranteed"
];

for (const path of [
  "app/lib/pilotDemoCommercialReadiness.ts",
  "app/pilot-demo-commercial-readiness/page.tsx",
  "docs/pilot-demo-commercial-readiness.md"
]) {
  const lower = files[path].toLowerCase();

  for (const phrase of forbiddenPhrases) {
    if (lower.includes(phrase.toLowerCase())) {
      throw new Error(`${path} contains forbidden Pilot Demo Commercial Readiness phrase: ${phrase}`);
    }
  }
}

console.log("pass pilot demo commercial readiness contract check");
