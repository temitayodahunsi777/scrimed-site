#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/healthcareOptimizationCommand.ts",
  "app/api/healthcare-optimization-command/route.ts",
  "app/api/healthcare-optimization-command/brief/route.ts",
  "app/healthcare-optimization-command/page.tsx",
  "docs/healthcare-optimization-command.md",
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
    throw new Error(`${path} is missing required SCRIMED Healthcare Optimization Command text: ${expected}`);
  }
}

function requireNotIncludes(path, text, forbidden) {
  if (text.toLowerCase().includes(forbidden.toLowerCase())) {
    throw new Error(`${path} contains forbidden SCRIMED Healthcare Optimization Command claim: ${forbidden}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/healthcareOptimizationCommand.ts"];
const api = files["app/api/healthcare-optimization-command/route.ts"];
const brief = files["app/api/healthcare-optimization-command/brief/route.ts"];
const page = files["app/healthcare-optimization-command/page.tsx"];
const docs = files["docs/healthcare-optimization-command.md"];
const navigation = files["app/lib/siteNavigation.ts"];
const audit = files["app/lib/navigationAudit.ts"];
const productConsole = files["app/lib/productConsole.ts"];
const productPage = files["app/product/page.tsx"];
const smoke = files["scripts/public-production-smoke.mjs"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "healthcare-optimization-command-active-synthetic-no-production-authority",
  "HealthcareOptimizationLane",
  "HealthcareOptimizationDomain",
  "HealthcareOptimizationPlaybook",
  "HealthcareInnovationTrack",
  "getHealthcareOptimizationCommandSummary",
  "buildHealthcareOptimizationCommandBrief",
  "agentCapabilityCount",
  "interoperableStandardCount",
  "measurableOutcomeCount",
  "not-authorized-production-phi",
  "not-authorized-live-care",
  "human-review-and-consent-required",
  "not-final-medical-interpretation"
]) {
  requireIncludes("app/lib/healthcareOptimizationCommand.ts", source, expected);
}

for (const expected of [
  "X-SCRIMED-Patient-Outreach-Authority",
  "human-review-and-consent-required",
  "X-SCRIMED-Interoperability-Authority",
  "synthetic-conformance-only",
  "X-SCRIMED-Imaging-Authority",
  "not-final-medical-interpretation",
  "X-SCRIMED-Production-Authorization",
  "not-production-authorized"
]) {
  requireIncludes("app/api/healthcare-optimization-command/route.ts", api, expected);
}

for (const expected of [
  "buildHealthcareOptimizationCommandBrief",
  "scrimed-healthcare-optimization-command-brief.md",
  "text/markdown",
  "X-SCRIMED-Patient-Outreach-Authority"
]) {
  requireIncludes("app/api/healthcare-optimization-command/brief/route.ts", brief, expected);
}

for (const expected of [
  "Healthcare Optimization Command",
  "Optimization lanes",
  "Governed playbooks",
  "Innovation tracks",
  "summary.boundary"
]) {
  requireIncludes("app/healthcare-optimization-command/page.tsx", page, expected);
}

for (const expected of [
  "SCRIMED Healthcare Optimization Command",
  "synthetic-only operating layer",
  "Safety Boundary",
  "npm run smoke:healthcare-optimization-command"
]) {
  requireIncludes("docs/healthcare-optimization-command.md", docs, expected);
}

for (const expected of [
  "Healthcare Optimization",
  "/healthcare-optimization-command",
  "clinical workflow optimization"
]) {
  requireIncludes("app/lib/siteNavigation.ts", navigation, expected);
}

for (const expected of [
  "expectedApiRoutePatternCount = 450",
  "\"/healthcare-optimization-command\""
]) {
  requireIncludes("app/lib/navigationAudit.ts", audit, expected);
}

for (const expected of [
  "getHealthcareOptimizationCommandSummary",
  "healthcareOptimizationCommandSummary",
  "healthcareOptimizationCommand: healthcareOptimizationCommandStatus",
  "healthcareOptimizationCommandLaneCount",
  "healthcareOptimizationCommandAgentCapabilityCount"
]) {
  requireIncludes("app/lib/productConsole.ts", productConsole, expected);
}

for (const expected of [
  "Healthcare optimization command",
  "Open Optimization Command",
  "Download Optimization Brief",
  "summary.healthcareOptimizationCommandSummary.boundary"
]) {
  requireIncludes("app/product/page.tsx", productPage, expected);
}

for (const expected of [
  "checkHealthcareOptimizationCommand",
  "/api/healthcare-optimization-command",
  "/api/healthcare-optimization-command/brief",
  "pass healthcare optimization command"
]) {
  requireIncludes("scripts/public-production-smoke.mjs", smoke, expected);
}

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:healthcare-optimization-command\": \"node scripts/healthcare-optimization-command-contract-check.mjs\""
);

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/healthcare-optimization-command-contract-check.mjs"
);

for (const path of [
  "app/lib/healthcareOptimizationCommand.ts",
  "app/api/healthcare-optimization-command/route.ts",
  "app/api/healthcare-optimization-command/brief/route.ts",
  "app/healthcare-optimization-command/page.tsx",
  "docs/healthcare-optimization-command.md"
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

console.log("pass SCRIMED Healthcare Optimization Command contract check");
