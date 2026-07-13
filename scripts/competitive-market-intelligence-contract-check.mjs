#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/competitiveMarketIntelligence.ts",
  "app/api/competitive-intelligence/route.ts",
  "app/competitive-intelligence/page.tsx",
  "docs/competitive-market-intelligence.md",
  "scripts/public-production-smoke.mjs",
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "package.json"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} missing required competitive market intelligence text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/competitiveMarketIntelligence.ts"];

for (const expected of [
  "CleanRoomCompetitivePlay",
  "CompetitiveResearchSignal",
  "cleanRoomCompetitivePlays",
  "competitiveResearchSignals",
  "proof-before-pilot-command",
  "trust-center-as-sales-asset",
  "connector-trust-catalog",
  "payer-policy-evidence-loop",
  "imaging-to-action-without-interpretation",
  "audience-specific-revenue-packaging",
  "Redox",
  "Health Gorilla",
  "Aidoc",
  "Notable Trust Center",
  "legalExtractionRule",
  "prohibitedCopying",
  "scrimedOriginalImplementation",
  "privacyAndTrustControl",
  "reviewedAt: \"2026-07-08\"",
  "does not copy third-party code"
]) {
  requireIncludes("app/lib/competitiveMarketIntelligence.ts", source, expected);
}

for (const expected of [
  "getCompetitiveMarketIntelligenceSummary",
  "NextResponse.json"
]) {
  requireIncludes("app/api/competitive-intelligence/route.ts", files["app/api/competitive-intelligence/route.ts"], expected);
}

for (const expected of [
  "Clean-room market response",
  "Fresh public research signals",
  "summary.cleanRoomPlayCount",
  "summary.researchSignalCount",
  "summary.cleanRoomPlays",
  "summary.researchSignals",
  "Legal extraction rule",
  "Do not copy"
]) {
  requireIncludes("app/competitive-intelligence/page.tsx", files["app/competitive-intelligence/page.tsx"], expected);
}

for (const expected of [
  "Reviewed: 2026-07-08",
  "Clean-Room Market Response",
  "Allowed: high-level public patterns",
  "Blocked: third-party code",
  "Revenue And Sales Implications",
  "Privacy, Legal, And Public Relations Controls",
  "Redox",
  "Health Gorilla",
  "Aidoc",
  "Notable Trust Center"
]) {
  requireIncludes("docs/competitive-market-intelligence.md", files["docs/competitive-market-intelligence.md"], expected);
}

for (const expected of [
  "body.cleanRoomPlayCount",
  "body.researchSignalCount",
  "trust-center-as-sales-asset",
  "imaging-to-action-without-interpretation"
]) {
  requireIncludes("scripts/public-production-smoke.mjs", files["scripts/public-production-smoke.mjs"], expected);
}

for (const expected of [
  "\"smoke:competitive-market-intelligence\""
]) {
  requireIncludes("package.json", files["package.json"], expected);
}

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "scripts/competitive-market-intelligence-contract-check.mjs"
);

const forbiddenClaimParts = [
  ["HIPAA", " certified"],
  ["SOC 2", " certified"],
  ["HITRUST", " certified"],
  ["FDA", " cleared"],
  ["security", " certified"],
  ["guaranteed", " ROI"],
  ["guaranteed", " reimbursement"],
  ["autonomous", " diagnosis"],
  ["autonomous", " treatment"],
  ["EHR writeback", " enabled"],
  ["payer submission", " enabled"],
  ["customer go-live", " approved"],
  ["replaces", " doctors"]
];

for (const path of [
  "app/lib/competitiveMarketIntelligence.ts",
  "app/competitive-intelligence/page.tsx",
  "docs/competitive-market-intelligence.md"
]) {
  const lower = files[path].toLowerCase();

  for (const parts of forbiddenClaimParts) {
    const forbidden = parts.join("").toLowerCase();
    if (lower.includes(forbidden)) {
      throw new Error(`${path} contains forbidden competitive market intelligence claim: ${forbidden}`);
    }
  }
}

console.log("pass competitive market intelligence contract check");
