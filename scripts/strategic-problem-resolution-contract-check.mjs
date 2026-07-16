#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/strategicProblemResolution.ts",
  "app/api/strategic-problem-resolution/route.ts",
  "app/api/strategic-problem-resolution/brief/route.ts",
  "app/strategic-problem-resolution/page.tsx",
  "docs/strategic-problem-resolution.md",
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
    throw new Error(`${path} is missing required SCRIMED Strategic Problem Resolution text: ${expected}`);
  }
}

function requireNotIncludes(path, text, forbidden) {
  if (text.toLowerCase().includes(forbidden.toLowerCase())) {
    throw new Error(`${path} contains forbidden SCRIMED Strategic Problem Resolution claim: ${forbidden}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/strategicProblemResolution.ts"];
const api = files["app/api/strategic-problem-resolution/route.ts"];
const brief = files["app/api/strategic-problem-resolution/brief/route.ts"];
const page = files["app/strategic-problem-resolution/page.tsx"];
const docs = files["docs/strategic-problem-resolution.md"];
const navigation = files["app/lib/siteNavigation.ts"];
const audit = files["app/lib/navigationAudit.ts"];
const productConsole = files["app/lib/productConsole.ts"];
const productPage = files["app/product/page.tsx"];
const smoke = files["scripts/public-production-smoke.mjs"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "strategic-problem-resolution-engine-active-no-production-authority",
  "StrategicProblemRecord",
  "StrategicProblemDomain",
  "StrategicResolutionStatus",
  "getStrategicProblemResolutionSummary",
  "buildStrategicProblemResolutionBrief",
  "criticalProblemCount",
  "averagePriorityScore",
  "humanReviewRequiredCount",
  "recommendation-and-control-plane-only",
  "not-production-authorized",
  "not-authorized-production-phi",
  "not-authorized-live-care"
]) {
  requireIncludes("app/lib/strategicProblemResolution.ts", source, expected);
}

for (const expected of [
  "X-SCRIMED-Execution-Authority",
  "recommendation-and-control-plane-only",
  "X-SCRIMED-Production-Authorization",
  "not-production-authorized",
  "X-SCRIMED-Valuation-Authority",
  "not-valuation-assurance"
]) {
  requireIncludes("app/api/strategic-problem-resolution/route.ts", api, expected);
}

for (const expected of [
  "buildStrategicProblemResolutionBrief",
  "scrimed-strategic-problem-resolution-brief.md",
  "text/markdown",
  "X-SCRIMED-Execution-Authority"
]) {
  requireIncludes("app/api/strategic-problem-resolution/brief/route.ts", brief, expected);
}

for (const expected of [
  "Strategic Problem Resolution",
  "Priority queue",
  "Resolution sprints",
  "Hard stops",
  "Human review"
]) {
  requireIncludes("app/strategic-problem-resolution/page.tsx", page, expected);
}

for (const expected of [
  "SCRIMED Strategic Problem Resolution Engine",
  "metadata-only operating layer",
  "Safety Boundary",
  "npm run smoke:strategic-problem-resolution"
]) {
  requireIncludes("docs/strategic-problem-resolution.md", docs, expected);
}

for (const expected of [
  "Strategic Problem Resolution",
  "/strategic-problem-resolution",
  "owner-bound execution"
]) {
  requireIncludes("app/lib/siteNavigation.ts", navigation, expected);
}

for (const expected of [
  "expectedApiRoutePatternCount = 440",
  "\"/strategic-problem-resolution\""
]) {
  requireIncludes("app/lib/navigationAudit.ts", audit, expected);
}

for (const expected of [
  "getStrategicProblemResolutionSummary",
  "strategicProblemResolutionSummary",
  "strategicProblemResolution: strategicProblemResolutionStatus",
  "strategicProblemResolutionProblemCount",
  "strategicProblemResolutionAveragePriorityScore"
]) {
  requireIncludes("app/lib/productConsole.ts", productConsole, expected);
}

for (const expected of [
  "Strategic problem resolution",
  "Open Problem Resolution",
  "Download Resolution Brief",
  "summary.strategicProblemResolutionSummary.boundary"
]) {
  requireIncludes("app/product/page.tsx", productPage, expected);
}

for (const expected of [
  "checkStrategicProblemResolution",
  "/api/strategic-problem-resolution",
  "/api/strategic-problem-resolution/brief",
  "pass strategic problem resolution"
]) {
  requireIncludes("scripts/public-production-smoke.mjs", smoke, expected);
}

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:strategic-problem-resolution\": \"node scripts/strategic-problem-resolution-contract-check.mjs\""
);

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/strategic-problem-resolution-contract-check.mjs"
);

for (const path of [
  "app/lib/strategicProblemResolution.ts",
  "app/api/strategic-problem-resolution/route.ts",
  "app/api/strategic-problem-resolution/brief/route.ts",
  "app/strategic-problem-resolution/page.tsx",
  "docs/strategic-problem-resolution.md"
]) {
  const text = files[path];

  for (const forbidden of [
    "HIPAA certified",
    "SOC 2 certified",
    "FDA cleared",
    "autonomous diagnosis enabled",
    "autonomous treatment enabled",
    "prescribes for patients",
    "payer submission enabled",
    "EHR writeback enabled",
    "customer go-live approved",
    "trillion dollar valuation guaranteed"
  ]) {
    requireNotIncludes(path, text, forbidden);
  }
}

console.log("pass SCRIMED Strategic Problem Resolution contract check");
