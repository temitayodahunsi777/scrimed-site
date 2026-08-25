#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/pilotActivationPlanner.ts",
  "app/api/pilot-activation-planner/route.ts",
  "app/api/pilot-activation-planner/brief/route.ts",
  "app/pilot-activation-planner/page.tsx",
  "docs/pilot-activation-planner.md",
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
    throw new Error(`${path} is missing required SCRIMED Pilot Activation Planner text: ${expected}`);
  }
}

function requireNotIncludes(path, text, forbidden) {
  if (text.toLowerCase().includes(forbidden.toLowerCase())) {
    throw new Error(`${path} contains forbidden SCRIMED Pilot Activation Planner claim: ${forbidden}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/pilotActivationPlanner.ts"];
const api = files["app/api/pilot-activation-planner/route.ts"];
const brief = files["app/api/pilot-activation-planner/brief/route.ts"];
const page = files["app/pilot-activation-planner/page.tsx"];
const docs = files["docs/pilot-activation-planner.md"];
const navigation = files["app/lib/siteNavigation.ts"];
const audit = files["app/lib/navigationAudit.ts"];
const productConsole = files["app/lib/productConsole.ts"];
const productPage = files["app/product/page.tsx"];
const smoke = files["scripts/public-production-smoke.mjs"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "pilot-activation-planner-active-synthetic-no-customer-go-live-authority",
  "PilotActivationStep",
  "PilotActivationPlan",
  "PilotActivationBlocker",
  "PilotActivationHandoff",
  "getPilotActivationPlannerSummary",
  "buildPilotActivationPlannerBrief",
  "not-binding-commercial-offer",
  "not-customer-go-live-approval",
  "not-authorized-production-phi",
  "qualified-review-required",
  "step.activationMode === \"external-approval-required\"",
  "binding commercial offer",
  "ROI guarantee"
]) {
  requireIncludes("app/lib/pilotActivationPlanner.ts", source, expected);
}

for (const expected of [
  "X-SCRIMED-Commercial-Authority",
  "not-binding-commercial-offer",
  "X-SCRIMED-Customer-Activation",
  "not-customer-go-live-approval",
  "X-SCRIMED-Legal-Authority",
  "qualified-review-required",
  "X-SCRIMED-Patient-Outreach-Authority",
  "human-review-and-consent-required",
  "X-SCRIMED-PHI-Authority",
  "not-authorized-production-phi"
]) {
  requireIncludes("app/api/pilot-activation-planner/route.ts", api, expected);
}

for (const expected of [
  "buildPilotActivationPlannerBrief",
  "scrimed-pilot-activation-planner-brief.md",
  "text/markdown",
  "X-SCRIMED-Customer-Activation"
]) {
  requireIncludes("app/api/pilot-activation-planner/brief/route.ts", brief, expected);
}

for (const expected of [
  "Pilot Activation Planner",
  "Activation plans",
  "Activation steps",
  "Blockers and workarounds",
  "summary.boundary"
]) {
  requireIncludes("app/pilot-activation-planner/page.tsx", page, expected);
}

for (const expected of [
  "SCRIMED Pilot Activation Planner",
  "review-gated activation plans",
  "Safety Boundary",
  "npm run smoke:pilot-activation-planner"
]) {
  requireIncludes("docs/pilot-activation-planner.md", docs, expected);
}

for (const expected of [
  "Pilot Activation",
  "/pilot-activation-planner",
  "review-gated activation"
]) {
  requireIncludes("app/lib/siteNavigation.ts", navigation, expected);
}

for (const expected of [
  "expectedApiRoutePatternCount = 453",
  "\"/pilot-activation-planner\""
]) {
  requireIncludes("app/lib/navigationAudit.ts", audit, expected);
}

for (const expected of [
  "getPilotActivationPlannerSummary",
  "pilotActivationPlannerSummary",
  "pilotActivationPlanner: pilotActivationPlannerStatus",
  "pilotActivationPlannerPlanCount",
  "pilotActivationPlannerStepCount"
]) {
  requireIncludes("app/lib/productConsole.ts", productConsole, expected);
}

for (const expected of [
  "Pilot activation planner",
  "Open Activation Planner",
  "Download Activation Brief",
  "summary.pilotActivationPlannerSummary.boundary"
]) {
  requireIncludes("app/product/page.tsx", productPage, expected);
}

for (const expected of [
  "checkPilotActivationPlanner",
  "/api/pilot-activation-planner",
  "/api/pilot-activation-planner/brief",
  "pass pilot activation planner"
]) {
  requireIncludes("scripts/public-production-smoke.mjs", smoke, expected);
}

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:pilot-activation-planner\": \"node scripts/pilot-activation-planner-contract-check.mjs\""
);

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/pilot-activation-planner-contract-check.mjs"
);

for (const path of [
  "app/lib/pilotActivationPlanner.ts",
  "app/api/pilot-activation-planner/route.ts",
  "app/api/pilot-activation-planner/brief/route.ts",
  "app/pilot-activation-planner/page.tsx",
  "docs/pilot-activation-planner.md"
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
    "trillion dollar valuation guaranteed",
    "production deployment approved"
  ]) {
    requireNotIncludes(path, text, forbidden);
  }
}

console.log("pass pilot activation planner contract");
