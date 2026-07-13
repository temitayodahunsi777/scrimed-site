#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/scrimedGuidedExecution.ts",
  "app/api/scrimed-guided-execution/route.ts",
  "app/scrimed-guided-execution/page.tsx",
  "docs/scrimed-guided-execution.md",
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
    throw new Error(`${path} missing required SCRIMED Guided Execution text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/scrimedGuidedExecution.ts"];

for (const expected of [
  "scrimed-guided-execution-active-synthetic-no-phi",
  "ScrimedGuidedAudience",
  "ScrimedGuidedExecutionPath",
  "ScrimedGuidedExecutionRunbook",
  "hospital-buyer",
  "faith-based-clinic",
  "investor",
  "pilot-lead",
  "implementation-partner",
  "internal-operator",
  "proofRoutes",
  "pricingMotion",
  "trustObjectionsHandled",
  "requiredArtifacts",
  "successMetrics",
  "nextHumanAction",
  "retainedBoundary",
  "scrimedGuidedExecutionFrictionReducers",
  "scrimedGuidedExecutionRunbooks",
  "getScrimedGuidedExecutionSummary",
  "No PHI",
  "no autonomous clinical care",
  "no payer submission",
  "no EHR writeback",
  "no customer go-live"
]) {
  requireIncludes("app/lib/scrimedGuidedExecution.ts", source, expected);
}

for (const expected of [
  "getScrimedGuidedExecutionSummary",
  "evaluateScrimedSafetyGate",
  "scrimedSafetyHeaders",
  "X-SCRIMED-Guided-Execution",
  "synthetic-and-metadata-only"
]) {
  requireIncludes("app/api/scrimed-guided-execution/route.ts", files["app/api/scrimed-guided-execution/route.ts"], expected);
}

for (const expected of [
  "SCRIMED Guided Execution Path",
  "Audience Paths",
  "Presentation + Demo Runbooks",
  "Friction Reducers",
  "Production"
]) {
  requireIncludes("app/scrimed-guided-execution/page.tsx", files["app/scrimed-guided-execution/page.tsx"], expected);
}

for (const expected of [
  "SCRIMED Guided Execution Path",
  "Audience Paths",
  "Sales And Investor Use",
  "Safety Boundary",
  "Next Build Step"
]) {
  requireIncludes("docs/scrimed-guided-execution.md", files["docs/scrimed-guided-execution.md"], expected);
}

const forbiddenClaimParts = [
  ["HIPAA", " certified"],
  ["FDA", " cleared"],
  ["autonomous", " diagnosis"],
  ["autonomous", " treatment"],
  ["pres", "cribes"],
  ["replaces", " doctors"],
  ["EHR writeback", " enabled"],
  ["payer submission", " enabled"],
  ["customer go-live", " approved"]
];

for (const path of [
  "app/lib/scrimedGuidedExecution.ts",
  "app/api/scrimed-guided-execution/route.ts",
  "app/scrimed-guided-execution/page.tsx",
  "docs/scrimed-guided-execution.md"
]) {
  const lower = files[path].toLowerCase();

  for (const parts of forbiddenClaimParts) {
    const forbidden = parts.join("").toLowerCase();
    if (lower.includes(forbidden)) {
      throw new Error(`${path} contains forbidden SCRIMED claim: ${forbidden}`);
    }
  }
}

requireIncludes("package.json", files["package.json"], "\"smoke:scrimed-guided-execution\"");
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "scripts/scrimed-guided-execution-contract-check.mjs"
);
requireIncludes("app/lib/siteNavigation.ts", files["app/lib/siteNavigation.ts"], "/scrimed-guided-execution");
requireIncludes("app/lib/navigationAudit.ts", files["app/lib/navigationAudit.ts"], "/scrimed-guided-execution");
requireIncludes("scripts/public-production-smoke.mjs", files["scripts/public-production-smoke.mjs"], "/scrimed-guided-execution");

console.log("pass SCRIMED Guided Execution contract check");
