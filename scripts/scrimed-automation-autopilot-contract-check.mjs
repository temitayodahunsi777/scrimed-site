#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/scrimedAutomationAutopilot.ts",
  "app/api/scrimed-automation-autopilot/route.ts",
  "app/api/scrimed-automation-autopilot/brief/route.ts",
  "app/scrimed-automation-autopilot/page.tsx",
  "docs/scrimed-automation-autopilot.md",
  "app/lib/productConsole.ts",
  "app/product/page.tsx",
  "app/lib/scrimedHub.ts",
  "app/hub/page.tsx",
  "app/lib/siteNavigation.ts",
  "app/lib/navigationAudit.ts",
  "scripts/public-production-smoke.mjs",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required SCRIMED Automation Autopilot text: ${expected}`);
  }
}

function requireNotIncludes(path, text, forbidden) {
  if (text.toLowerCase().includes(forbidden.toLowerCase())) {
    throw new Error(`${path} contains forbidden SCRIMED Automation Autopilot claim: ${forbidden}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/scrimedAutomationAutopilot.ts"];
const api = files["app/api/scrimed-automation-autopilot/route.ts"];
const brief = files["app/api/scrimed-automation-autopilot/brief/route.ts"];
const page = files["app/scrimed-automation-autopilot/page.tsx"];
const docs = files["docs/scrimed-automation-autopilot.md"];
const productConsole = files["app/lib/productConsole.ts"];
const productPage = files["app/product/page.tsx"];
const hub = files["app/lib/scrimedHub.ts"];
const hubPage = files["app/hub/page.tsx"];
const navigation = files["app/lib/siteNavigation.ts"];
const audit = files["app/lib/navigationAudit.ts"];
const smoke = files["scripts/public-production-smoke.mjs"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "scrimed-automation-autopilot-active-synthetic-no-phi",
  "ScrimedAutomationAutopilotCapability",
  "ScrimedAutomationAutopilotDecision",
  "manual-only",
  "recommendation-only",
  "review-gated-automation",
  "synthetic-autopilot",
  "evaluateScrimedAutomationAutopilotRequest",
  "allow-synthetic-autopilot",
  "require-human-review",
  "block-production-action",
  "productionAuthority: false",
  "humanReviewRequired: true",
  "universalBlockedAutonomy",
  "getScrimedAutomationAutopilotSummary",
  "buildScrimedAutomationAutopilotBrief"
]) {
  requireIncludes("app/lib/scrimedAutomationAutopilot.ts", source, expected);
}

for (const expected of [
  "X-SCRIMED-Automation-Autopilot",
  "X-SCRIMED-Autonomy-Authority",
  "synthetic-and-review-gated-only",
  "X-SCRIMED-Production-Remediation",
  "not-authorized",
  "not-authorized-live-care",
  "not-customer-go-live-approval"
]) {
  requireIncludes("app/api/scrimed-automation-autopilot/route.ts", api, expected);
}

for (const expected of [
  "buildScrimedAutomationAutopilotBrief",
  "scrimed-automation-autopilot-brief.md",
  "text/markdown",
  "X-SCRIMED-Autonomy-Authority"
]) {
  requireIncludes("app/api/scrimed-automation-autopilot/brief/route.ts", brief, expected);
}

for (const expected of [
  "SCRIMED Automation Autopilot",
  "Autonomy Boundary",
  "Automation Map",
  "Bottleneck Workarounds",
  "Decision Samples",
  "human approval",
  "Production authority"
]) {
  requireIncludes("app/scrimed-automation-autopilot/page.tsx", page, expected);
}

for (const expected of [
  "SCRIMED Automation Autopilot",
  "synthetic/no-PHI",
  "Preserved Boundaries",
  "does not authorize live PHI",
  "autonomous clinical care",
  "customer go-live"
]) {
  requireIncludes("docs/scrimed-automation-autopilot.md", docs, expected);
}

for (const expected of [
  "getScrimedAutomationAutopilotSummary",
  "automationAutopilotSummary",
  "automationAutopilotCapabilityCount",
  "automationAutopilotReviewRequiredCount",
  "automationAutopilotProductionAuthorityBlockedCount",
  "automationAutopilotBottleneckWorkaroundCount",
  "automationAutopilot: scrimedAutomationAutopilotStatus",
  "automationAutopilotBrief: scrimedAutomationAutopilotBriefStatus"
]) {
  requireIncludes("app/lib/productConsole.ts", productConsole, expected);
}

for (const expected of [
  "Automation Autopilot",
  "Open Automation Autopilot",
  "Download Autopilot Brief",
  "Production authority: blocked",
  "summary.automationAutopilotSummary.boundary"
]) {
  requireIncludes("app/product/page.tsx", productPage, expected);
}

for (const expected of [
  "getScrimedAutomationAutopilotSummary",
  "scrimedAutomationAutopilotRoute",
  "scrimedAutomationAutopilotApiRoute",
  "scrimedAutomationAutopilotBriefRoute",
  "automationAutopilotSummary"
]) {
  requireIncludes("app/lib/scrimedHub.ts", hub, expected);
}

for (const expected of [
  "Automation Autopilot",
  "summary.automationAutopilotSummary.capabilityCount",
  "summary.automationAutopilotSummary.productionAuthorityBlockedCount",
  "Open Automation Autopilot",
  "production authority blocked"
]) {
  requireIncludes("app/hub/page.tsx", hubPage, expected);
}

for (const expected of [
  "Automation Autopilot",
  "/scrimed-automation-autopilot",
  "Automation control"
]) {
  requireIncludes("app/lib/siteNavigation.ts", navigation, expected);
}

for (const expected of [
  "expectedApiRoutePatternCount = 434",
  "\"/scrimed-automation-autopilot\""
]) {
  requireIncludes("app/lib/navigationAudit.ts", audit, expected);
}

for (const expected of [
  "checkScrimedAutomationAutopilot",
  "/api/scrimed-automation-autopilot",
  "/api/scrimed-automation-autopilot/brief",
  "body.proofStack?.automationAutopilot",
  "automationAutopilotProductionAuthorityBlockedCount",
  "pass SCRIMED Automation Autopilot"
]) {
  requireIncludes("scripts/public-production-smoke.mjs", smoke, expected);
}

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:scrimed-automation-autopilot\": \"node scripts/scrimed-automation-autopilot-contract-check.mjs\""
);

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/scrimed-automation-autopilot-contract-check.mjs"
);

for (const path of [
  "app/lib/scrimedAutomationAutopilot.ts",
  "app/api/scrimed-automation-autopilot/route.ts",
  "app/api/scrimed-automation-autopilot/brief/route.ts",
  "app/scrimed-automation-autopilot/page.tsx",
  "docs/scrimed-automation-autopilot.md"
]) {
  const text = files[path];

  for (const forbidden of [
    "HIPAA certified",
    "SOC 2 certified",
    "FDA cleared",
    "autonomous diagnosis enabled",
    "autonomous treatment enabled",
    "prescribes for patients",
    "EHR writeback enabled",
    "payer submission enabled",
    "customer go-live approved"
  ]) {
    requireNotIncludes(path, text, forbidden);
  }
}

console.log("pass SCRIMED Automation Autopilot contract check");
