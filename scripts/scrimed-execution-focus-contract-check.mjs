#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/scrimedExecutionFocus.ts",
  "app/api/scrimed-execution-focus/route.ts",
  "app/api/scrimed-execution-focus/brief/route.ts",
  "app/scrimed-execution-focus/page.tsx",
  "docs/scrimed-execution-focus.md",
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
    throw new Error(`${path} missing required SCRIMED Execution Focus text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/scrimedExecutionFocus.ts"];

for (const expected of [
  "scrimed-execution-focus-active-synthetic-no-phi",
  "ScrimedFocusLane",
  "ScrimedFocusHorizon",
  "ScrimedFocusItem",
  "focusScore",
  "proofRoute",
  "humanReviewRequired: true",
  "syntheticOnly: true",
  "buyer-proof-to-pilot",
  "security-diligence-trust-center",
  "investor-diligence-narrative",
  "execution-hygiene-command-surface",
  "clinical-production-approval-ladder",
  "interoperability-proof-catalog",
  "validated-demo-pitch-runbooks",
  "aal2-protected-smoke-operator",
  "live-phi-and-clinical-authority",
  "blockedActions",
  "generateScrimedAuditHash",
  "productionReadiness: false",
  "buildScrimedExecutionFocusBrief"
]) {
  requireIncludes("app/lib/scrimedExecutionFocus.ts", source, expected);
}

for (const expected of [
  "getScrimedExecutionFocusSummary",
  "evaluateScrimedSafetyGate",
  "scrimedSafetyHeaders",
  "X-SCRIMED-Execution-Focus",
  "synthetic-prioritization-metadata-only",
  "recommendation-only-human-reviewed"
]) {
  requireIncludes("app/api/scrimed-execution-focus/route.ts", files["app/api/scrimed-execution-focus/route.ts"], expected);
}

for (const expected of [
  "buildScrimedExecutionFocusBrief",
  "scrimed-execution-focus.md",
  "text/markdown",
  "X-SCRIMED-Execution-Focus"
]) {
  requireIncludes(
    "app/api/scrimed-execution-focus/brief/route.ts",
    files["app/api/scrimed-execution-focus/brief/route.ts"],
    expected
  );
}

for (const expected of [
  "SCRIMED Execution Focus Engine",
  "Now Focus",
  "Next Focus",
  "Blocked Until Approved",
  "Operating Rules",
  "recommendation-only"
]) {
  requireIncludes("app/scrimed-execution-focus/page.tsx", files["app/scrimed-execution-focus/page.tsx"], expected);
}

for (const expected of [
  "SCRIMED Execution Focus Engine",
  "Architecture",
  "Scoring",
  "Safety Boundary",
  "npm run smoke:scrimed-execution-focus"
]) {
  requireIncludes("docs/scrimed-execution-focus.md", files["docs/scrimed-execution-focus.md"], expected);
}

const forbiddenClaims = [
  "HIPAA certified",
  "SOC 2 certified",
  "HITRUST certified",
  "FDA cleared",
  "clinically validated",
  "security certified",
  "autonomous diagnosis",
  "autonomous treatment",
  "prescribes",
  "replaces doctors",
  "EHR writeback enabled",
  "payer submission enabled",
  "customer go-live approved",
  "guaranteed ROI",
  "guaranteed revenue"
];

for (const path of [
  "app/lib/scrimedExecutionFocus.ts",
  "app/api/scrimed-execution-focus/route.ts",
  "app/api/scrimed-execution-focus/brief/route.ts",
  "app/scrimed-execution-focus/page.tsx",
  "docs/scrimed-execution-focus.md"
]) {
  const lower = files[path].toLowerCase();

  for (const claim of forbiddenClaims) {
    if (lower.includes(claim.toLowerCase())) {
      throw new Error(`${path} contains forbidden SCRIMED Execution Focus claim: ${claim}`);
    }
  }
}

requireIncludes("package.json", files["package.json"], "\"smoke:scrimed-execution-focus\"");
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "scripts/scrimed-execution-focus-contract-check.mjs"
);
requireIncludes("app/lib/siteNavigation.ts", files["app/lib/siteNavigation.ts"], "/scrimed-execution-focus");
requireIncludes("app/lib/navigationAudit.ts", files["app/lib/navigationAudit.ts"], "/scrimed-execution-focus");
requireIncludes("app/lib/navigationAudit.ts", files["app/lib/navigationAudit.ts"], "expectedApiRoutePatternCount = 452");
requireIncludes("scripts/public-production-smoke.mjs", files["scripts/public-production-smoke.mjs"], "/scrimed-execution-focus");
requireIncludes(
  "scripts/public-production-smoke.mjs",
  files["scripts/public-production-smoke.mjs"],
  "checkScrimedExecutionFocusApi"
);

console.log("pass SCRIMED Execution Focus contract check");
