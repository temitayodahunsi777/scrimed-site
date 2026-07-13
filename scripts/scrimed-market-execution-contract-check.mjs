#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/scrimedMarketExecution.ts",
  "app/api/scrimed-market-execution/route.ts",
  "app/api/scrimed-market-execution/brief/route.ts",
  "app/scrimed-market-execution/page.tsx",
  "docs/scrimed-market-execution.md",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "app/lib/siteNavigation.ts",
  "app/lib/navigationAudit.ts",
  "scripts/public-production-smoke.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} missing required SCRIMED Market Execution text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/scrimedMarketExecution.ts"];

for (const expected of [
  "scrimed-market-execution-active-clean-room-no-phi",
  "ScrimedMarketExecutionLane",
  "ScrimedMarketExecutionScorecard",
  "ScrimedMarketExecutionRiskControl",
  "proof-before-pilot-command",
  "trust-center-as-sales-asset",
  "connector-trust-catalog",
  "payer-policy-evidence-loop",
  "imaging-to-action-without-interpretation",
  "audience-specific-revenue-packaging",
  "publicRelationsPosition",
  "privacyLegalControl",
  "revenueLever",
  "investorNarrative",
  "humanReviewRequired: true",
  "No PHI or live patient data",
  "No EHR writeback, payer submission",
  "No competitor proprietary copying",
  "productionReadiness: false",
  "buildScrimedMarketExecutionBrief"
]) {
  requireIncludes("app/lib/scrimedMarketExecution.ts", source, expected);
}

for (const expected of [
  "getScrimedMarketExecutionSummary",
  "evaluateScrimedSafetyGate",
  "scrimedSafetyHeaders",
  "X-SCRIMED-Market-Execution",
  "synthetic-business-and-market-metadata-only",
  "public-sources-only-no-proprietary-copying"
]) {
  requireIncludes("app/api/scrimed-market-execution/route.ts", files["app/api/scrimed-market-execution/route.ts"], expected);
}

for (const expected of [
  "buildScrimedMarketExecutionBrief",
  "scrimed-market-execution.md",
  "text/markdown",
  "X-SCRIMED-Market-Execution"
]) {
  requireIncludes(
    "app/api/scrimed-market-execution/brief/route.ts",
    files["app/api/scrimed-market-execution/brief/route.ts"],
    expected
  );
}

for (const expected of [
  "SCRIMED Market Execution Engine",
  "Clean-Room Doctrine",
  "Execution Lanes",
  "Risk Controls",
  "Hard Stops",
  "Production readiness remains false"
]) {
  requireIncludes("app/scrimed-market-execution/page.tsx", files["app/scrimed-market-execution/page.tsx"], expected);
}

for (const expected of [
  "SCRIMED Market Execution Engine",
  "Clean-Room Rules",
  "Execution Lanes",
  "Safety Boundary",
  "npm run smoke:scrimed-market-execution"
]) {
  requireIncludes("docs/scrimed-market-execution.md", files["docs/scrimed-market-execution.md"], expected);
}

const forbiddenClaims = [
  "HIPAA certified",
  "SOC 2 certified",
  "HITRUST certified",
  "FDA cleared",
  "clinically validated",
  "security certified",
  "guaranteed ROI",
  "guaranteed reimbursement",
  "guaranteed revenue",
  "guaranteed valuation",
  "replaces doctors",
  "EHR writeback enabled",
  "payer submission enabled",
  "customer go-live approved"
];

for (const path of [
  "app/lib/scrimedMarketExecution.ts",
  "app/api/scrimed-market-execution/route.ts",
  "app/api/scrimed-market-execution/brief/route.ts",
  "app/scrimed-market-execution/page.tsx",
  "docs/scrimed-market-execution.md"
]) {
  const lower = files[path].toLowerCase();

  for (const claim of forbiddenClaims) {
    if (lower.includes(claim.toLowerCase())) {
      throw new Error(`${path} contains forbidden SCRIMED Market Execution claim: ${claim}`);
    }
  }
}

requireIncludes("package.json", files["package.json"], "\"smoke:scrimed-market-execution\"");
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "scripts/scrimed-market-execution-contract-check.mjs"
);
requireIncludes("app/lib/siteNavigation.ts", files["app/lib/siteNavigation.ts"], "/scrimed-market-execution");
requireIncludes("app/lib/navigationAudit.ts", files["app/lib/navigationAudit.ts"], "/scrimed-market-execution");
requireIncludes("scripts/public-production-smoke.mjs", files["scripts/public-production-smoke.mjs"], "/scrimed-market-execution");

console.log("pass SCRIMED Market Execution contract check");
