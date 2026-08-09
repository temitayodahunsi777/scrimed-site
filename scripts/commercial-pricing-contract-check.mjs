#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/commercialStrategy.ts",
  "app/api/commercial/pricing/route.ts",
  "app/pricing/page.tsx",
  "app/pricing/PricingScopeGuard.tsx",
  "app/pricing/PricingValuePlanner.tsx",
  "app/globals.css",
  "docs/commercial-pricing-and-positioning.md",
  "scripts/commercial-pricing-policy-test.mjs",
  "scripts/public-production-smoke.mjs",
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "package.json"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} missing required commercial pricing text: ${expected}`);
  }
}

function requireNotIncludes(path, text, forbidden) {
  if (text.toLowerCase().includes(forbidden.toLowerCase())) {
    throw new Error(`${path} contains prohibited commercial pricing claim: ${forbidden}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/commercialStrategy.ts"];
const route = files["app/api/commercial/pricing/route.ts"];
const page = files["app/pricing/page.tsx"];
const scopeGuard = files["app/pricing/PricingScopeGuard.tsx"];
const planner = files["app/pricing/PricingValuePlanner.tsx"];
const docs = files["docs/commercial-pricing-and-positioning.md"];

for (const expected of [
  "CommercialPriceRange",
  "CommercialValueScenarioInput",
  "CommercialReadinessControl",
  "CompetitivePositioningPillar",
  "GlobalCommercialProfile",
  "calculateCommercialValueScenario",
  "assessMarketPricingEvidence",
  "buildCommercialScopeDecision",
  "MarketPricingEvidenceReview",
  "reviewDue",
  "competitiveComparisonAllowed",
  "non-binding-planning-model",
  "commercial-planning-model-active-pre-commercial",
  "value-hypothesis-not-yet-supported-by-inputs",
  "bindingQuoteAuthorized: false",
  "productionAuthorityGranted: false",
  "not-customer-go-live-approval",
  "first-party-public",
  "2026-08-01"
]) {
  requireIncludes("app/lib/commercialStrategy.ts", source, expected);
}

for (const expected of [
  "X-SCRIMED-Commercial-Authority",
  "not-binding-commercial-offer",
  "X-SCRIMED-Competitive-Comparison",
  "blocked-pending-evidence-review",
  "X-SCRIMED-Market-Evidence",
  "X-SCRIMED-Data-Boundary",
  "synthetic-only",
  "X-SCRIMED-Clinical-Care-Authority",
  "not-authorized-live-care",
  "X-SCRIMED-PHI-Authority",
  "not-authorized-production-phi",
  "X-SCRIMED-Payer-Authority",
  "X-SCRIMED-EHR-Writeback",
  "X-SCRIMED-Production-Authorization",
  "not-production-authorized"
]) {
  requireIncludes("app/api/commercial/pricing/route.ts", route, expected);
}

for (const expected of [
  "Pre-commercial pricing built around verified workflow value",
  "PricingScopeGuard",
  "PricingValuePlanner",
  "Commercial control plane",
  "Competitive position",
  "Global positioning",
  "summary.commercialReadinessControls",
  "summary.competitivePositioningPillars",
  "summary.globalCommercialProfiles",
  "benchmark.sourceUrl"
]) {
  requireIncludes("app/pricing/page.tsx", page, expected);
}

for (const expected of [
  '"use client"',
  "buildCommercialScopeDecision",
  "Governed scope guard",
  "Controlled inputs only",
  "Binding quote: blocked",
  "Production authority: blocked",
  "Human review: required",
  "Protected environment requested"
]) {
  requireIncludes("app/pricing/PricingScopeGuard.tsx", scopeGuard, expected);
}

for (const expected of [
  '"use client"',
  "calculateCommercialValueScenario",
  "browser-only model stores nothing",
  "Value-to-cost hypothesis",
  "Cost per verified workflow",
  "planning hypotheses, not quotes",
  "reimbursement estimates, or ROI guarantees"
]) {
  requireIncludes("app/pricing/PricingValuePlanner.tsx", planner, expected);
}

for (const expected of [
  "SCRIMED Commercial Pricing and Positioning",
  "pre-commercial planning model",
  "cost per verified workflow",
  "Market Evidence",
  "Global Position",
  "Known Limitations",
  "npm run test:commercial-pricing"
]) {
  requireIncludes("docs/commercial-pricing-and-positioning.md", docs, expected);
}

for (const path of [
  "app/lib/commercialStrategy.ts",
  "app/api/commercial/pricing/route.ts",
  "app/pricing/page.tsx",
  "app/pricing/PricingScopeGuard.tsx",
  "app/pricing/PricingValuePlanner.tsx",
  "docs/commercial-pricing-and-positioning.md"
]) {
  const text = files[path];
  for (const forbidden of [
    "guaranteed savings",
    "guaranteed revenue",
    "guaranteed ROI",
    "clinically proven",
    "deployment ready",
    "diagnoses patients autonomously",
    "provides autonomous treatment"
  ]) {
    requireNotIncludes(path, text, forbidden);
  }
}

requireIncludes(
  "package.json",
  files["package.json"],
  '"test:commercial-pricing": "node --disable-warning=ExperimentalWarning --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-loader=./scripts/lib/ts-extension-loader.mjs scripts/commercial-pricing-policy-test.mjs"'
);
requireIncludes(
  "package.json",
  files["package.json"],
  '"smoke:commercial-pricing": "node scripts/commercial-pricing-contract-check.mjs"'
);
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "scripts/commercial-pricing-policy-test.mjs"
);
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "scripts/commercial-pricing-contract-check.mjs"
);
requireIncludes("scripts/public-production-smoke.mjs", files["scripts/public-production-smoke.mjs"], 'checkHtml("/pricing")');
requireIncludes("scripts/public-production-smoke.mjs", files["scripts/public-production-smoke.mjs"], "checkCommercialPricing");

console.log("pass commercial pricing contract");
