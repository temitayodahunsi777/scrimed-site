#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/healthcareValueRealization.ts",
  "app/api/healthcare-value-realization/route.ts",
  "app/api/healthcare-value-realization/brief/route.ts",
  "app/healthcare-value-realization/page.tsx",
  "docs/healthcare-value-realization.md",
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
    throw new Error(`${path} is missing required SCRIMED Healthcare Value Realization text: ${expected}`);
  }
}

function requireNotIncludes(path, text, forbidden) {
  if (text.toLowerCase().includes(forbidden.toLowerCase())) {
    throw new Error(`${path} contains forbidden SCRIMED Healthcare Value Realization claim: ${forbidden}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/healthcareValueRealization.ts"];
const api = files["app/api/healthcare-value-realization/route.ts"];
const brief = files["app/api/healthcare-value-realization/brief/route.ts"];
const page = files["app/healthcare-value-realization/page.tsx"];
const docs = files["docs/healthcare-value-realization.md"];
const navigation = files["app/lib/siteNavigation.ts"];
const audit = files["app/lib/navigationAudit.ts"];
const productConsole = files["app/lib/productConsole.ts"];
const productPage = files["app/product/page.tsx"];
const smoke = files["scripts/public-production-smoke.mjs"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "healthcare-value-realization-active-synthetic-no-roi-guarantee",
  "HealthcareValueMetric",
  "HealthcareValuePackage",
  "HealthcareValueRiskControl",
  "getHealthcareValueRealizationSummary",
  "buildHealthcareValueRealizationBrief",
  "not-roi-guarantee",
  "not-audited-financial-report",
  "not-authorized-production-phi",
  "not-authorized-live-care",
  "ROI guarantee",
  "revenue guarantee",
  "profit guarantee",
  "measurement framework only"
]) {
  requireIncludes("app/lib/healthcareValueRealization.ts", source, expected);
}

for (const expected of [
  "X-SCRIMED-Financial-Authority",
  "not-audited-financial-report",
  "X-SCRIMED-ROI-Authority",
  "not-roi-guarantee",
  "X-SCRIMED-Revenue-Authority",
  "not-revenue-guarantee",
  "X-SCRIMED-PHI-Authority",
  "not-authorized-production-phi",
  "X-SCRIMED-Production-Authorization",
  "not-production-authorized"
]) {
  requireIncludes("app/api/healthcare-value-realization/route.ts", api, expected);
}

for (const expected of [
  "buildHealthcareValueRealizationBrief",
  "scrimed-healthcare-value-realization-brief.md",
  "text/markdown",
  "X-SCRIMED-ROI-Authority"
]) {
  requireIncludes("app/api/healthcare-value-realization/brief/route.ts", brief, expected);
}

for (const expected of [
  "Healthcare Value Realization",
  "Value metrics",
  "Buyer proof packages",
  "Risk controls",
  "summary.boundary"
]) {
  requireIncludes("app/healthcare-value-realization/page.tsx", page, expected);
}

for (const expected of [
  "SCRIMED Healthcare Value Realization",
  "synthetic-only measurement layer",
  "Safety Boundary",
  "npm run smoke:healthcare-value-realization"
]) {
  requireIncludes("docs/healthcare-value-realization.md", docs, expected);
}

for (const expected of [
  "Value Realization",
  "/healthcare-value-realization",
  "outcome evidence"
]) {
  requireIncludes("app/lib/siteNavigation.ts", navigation, expected);
}

for (const expected of [
  "expectedApiRoutePatternCount = 443",
  "\"/healthcare-value-realization\""
]) {
  requireIncludes("app/lib/navigationAudit.ts", audit, expected);
}

for (const expected of [
  "getHealthcareValueRealizationSummary",
  "healthcareValueRealizationSummary",
  "healthcareValueRealization: healthcareValueRealizationStatus",
  "healthcareValueRealizationMetricCount",
  "healthcareValueRealizationPackageCount"
]) {
  requireIncludes("app/lib/productConsole.ts", productConsole, expected);
}

for (const expected of [
  "Healthcare value realization",
  "Open Value Realization",
  "Download Value Brief",
  "summary.healthcareValueRealizationSummary.boundary"
]) {
  requireIncludes("app/product/page.tsx", productPage, expected);
}

for (const expected of [
  "checkHealthcareValueRealization",
  "/api/healthcare-value-realization",
  "/api/healthcare-value-realization/brief",
  "pass healthcare value realization"
]) {
  requireIncludes("scripts/public-production-smoke.mjs", smoke, expected);
}

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:healthcare-value-realization\": \"node scripts/healthcare-value-realization-contract-check.mjs\""
);

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/healthcare-value-realization-contract-check.mjs"
);

for (const path of [
  "app/lib/healthcareValueRealization.ts",
  "app/api/healthcare-value-realization/route.ts",
  "app/api/healthcare-value-realization/brief/route.ts",
  "app/healthcare-value-realization/page.tsx",
  "docs/healthcare-value-realization.md"
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

console.log("pass SCRIMED Healthcare Value Realization contract check");
