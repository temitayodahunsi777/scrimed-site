#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/pilotHandoffCommand.ts",
  "app/api/pilot-handoff-command/route.ts",
  "app/api/pilot-handoff-command/brief/route.ts",
  "app/pilot-handoff-command/page.tsx",
  "docs/pilot-handoff-command.md",
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
    throw new Error(`${path} is missing required SCRIMED Pilot Handoff Command text: ${expected}`);
  }
}

function requireNotIncludes(path, text, forbidden) {
  if (text.toLowerCase().includes(forbidden.toLowerCase())) {
    throw new Error(`${path} contains forbidden SCRIMED Pilot Handoff Command claim: ${forbidden}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/pilotHandoffCommand.ts"];
const api = files["app/api/pilot-handoff-command/route.ts"];
const brief = files["app/api/pilot-handoff-command/brief/route.ts"];
const page = files["app/pilot-handoff-command/page.tsx"];
const docs = files["docs/pilot-handoff-command.md"];
const navigation = files["app/lib/siteNavigation.ts"];
const audit = files["app/lib/navigationAudit.ts"];
const productConsole = files["app/lib/productConsole.ts"];
const productPage = files["app/product/page.tsx"];
const smoke = files["scripts/public-production-smoke.mjs"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "pilot-handoff-command-active-synthetic-human-review-required",
  "PilotHandoffPacket",
  "PilotHandoffChecklistItem",
  "PilotHandoffRiskControl",
  "getPilotHandoffCommandSummary",
  "buildPilotHandoffCommandBrief",
  "human-review-required",
  "not-binding-commercial-offer",
  "not-customer-go-live-approval",
  "not-authorized-production-phi",
  "external send without human review",
  "binding commercial offer",
  "ROI guarantee"
]) {
  requireIncludes("app/lib/pilotHandoffCommand.ts", source, expected);
}

for (const expected of [
  "X-SCRIMED-External-Send-Authority",
  "human-review-required",
  "X-SCRIMED-Automation-Authority",
  "recommendation-only",
  "X-SCRIMED-Commercial-Authority",
  "not-binding-commercial-offer",
  "X-SCRIMED-Customer-Activation",
  "not-customer-go-live-approval",
  "X-SCRIMED-Patient-Outreach-Authority",
  "human-review-and-consent-required",
  "X-SCRIMED-PHI-Authority",
  "not-authorized-production-phi"
]) {
  requireIncludes("app/api/pilot-handoff-command/route.ts", api, expected);
}

for (const expected of [
  "buildPilotHandoffCommandBrief",
  "scrimed-pilot-handoff-command-brief.md",
  "text/markdown",
  "X-SCRIMED-External-Send-Authority"
]) {
  requireIncludes("app/api/pilot-handoff-command/brief/route.ts", brief, expected);
}

for (const expected of [
  "Pilot Handoff Command",
  "Handoff packets",
  "Hard stops",
  "Owner checklist",
  "summary.boundary"
]) {
  requireIncludes("app/pilot-handoff-command/page.tsx", page, expected);
}

for (const expected of [
  "SCRIMED Pilot Handoff Command",
  "role-specific handoff packets",
  "Safety Boundary",
  "npm run smoke:pilot-handoff-command"
]) {
  requireIncludes("docs/pilot-handoff-command.md", docs, expected);
}

for (const expected of [
  "Pilot Handoff",
  "/pilot-handoff-command",
  "human-reviewed handoff"
]) {
  requireIncludes("app/lib/siteNavigation.ts", navigation, expected);
}

for (const expected of [
  "expectedApiRoutePatternCount = 452",
  "\"/pilot-handoff-command\""
]) {
  requireIncludes("app/lib/navigationAudit.ts", audit, expected);
}

for (const expected of [
  "getPilotHandoffCommandSummary",
  "pilotHandoffCommandSummary",
  "pilotHandoffCommand: pilotHandoffCommandStatus",
  "pilotHandoffCommandPacketCount",
  "pilotHandoffCommandHardStopCount"
]) {
  requireIncludes("app/lib/productConsole.ts", productConsole, expected);
}

for (const expected of [
  "Pilot handoff command",
  "Open Handoff Command",
  "Download Handoff Brief",
  "summary.pilotHandoffCommandSummary.boundary"
]) {
  requireIncludes("app/product/page.tsx", productPage, expected);
}

for (const expected of [
  "checkPilotHandoffCommand",
  "/api/pilot-handoff-command",
  "/api/pilot-handoff-command/brief",
  "pass pilot handoff command"
]) {
  requireIncludes("scripts/public-production-smoke.mjs", smoke, expected);
}

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:pilot-handoff-command\": \"node scripts/pilot-handoff-command-contract-check.mjs\""
);

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/pilot-handoff-command-contract-check.mjs"
);

for (const path of [
  "app/lib/pilotHandoffCommand.ts",
  "app/api/pilot-handoff-command/route.ts",
  "app/api/pilot-handoff-command/brief/route.ts",
  "app/pilot-handoff-command/page.tsx",
  "docs/pilot-handoff-command.md"
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

console.log("pass pilot handoff command contract");
