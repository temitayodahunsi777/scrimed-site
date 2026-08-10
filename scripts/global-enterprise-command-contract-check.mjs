#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/globalEnterpriseCommand.ts",
  "app/api/global-enterprise-command/route.ts",
  "app/api/global-enterprise-command/brief/route.ts",
  "app/global-enterprise-command/page.tsx",
  "docs/global-enterprise-command.md",
  "app/lib/siteNavigation.ts",
  "app/lib/navigationAudit.ts",
  "app/lib/productConsole.ts",
  "scripts/public-production-smoke.mjs",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required SCRIMED Global Enterprise Command text: ${expected}`);
  }
}

function requireNotIncludes(path, text, forbidden) {
  if (text.toLowerCase().includes(forbidden.toLowerCase())) {
    throw new Error(`${path} contains forbidden SCRIMED Global Enterprise Command claim: ${forbidden}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/globalEnterpriseCommand.ts"];
const api = files["app/api/global-enterprise-command/route.ts"];
const brief = files["app/api/global-enterprise-command/brief/route.ts"];
const page = files["app/global-enterprise-command/page.tsx"];
const docs = files["docs/global-enterprise-command.md"];
const navigation = files["app/lib/siteNavigation.ts"];
const audit = files["app/lib/navigationAudit.ts"];
const productConsole = files["app/lib/productConsole.ts"];
const smoke = files["scripts/public-production-smoke.mjs"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "global-enterprise-command-active-no-production-authority",
  "GlobalEnterpriseRegionCommand",
  "GlobalEnterpriseSalesPlaybook",
  "GlobalEnterpriseInteroperabilityLane",
  "GlobalEnterpriseCommunicationLane",
  "getGlobalEnterpriseCommandSummary",
  "buildGlobalEnterpriseCommandBrief",
  "globalEnterpriseCommandBoundary",
  "human-reviewed-templates-only",
  "synthetic-conformance-only",
  "not-production-authorized",
  "not-authorized-production-phi",
  "not-authorized-live-care"
]) {
  requireIncludes("app/lib/globalEnterpriseCommand.ts", source, expected);
}

for (const expected of [
  "X-SCRIMED-Global-Authority",
  "readiness-only-not-legal-approval",
  "X-SCRIMED-Communication-Authority",
  "human-reviewed-templates-only",
  "X-SCRIMED-Interoperability-Authority",
  "synthetic-conformance-only",
  "X-SCRIMED-Production-Authorization",
  "not-production-authorized"
]) {
  requireIncludes("app/api/global-enterprise-command/route.ts", api, expected);
}

for (const expected of [
  "buildGlobalEnterpriseCommandBrief",
  "scrimed-global-enterprise-command-brief.md",
  "text/markdown",
  "X-SCRIMED-Global-Authority"
]) {
  requireIncludes("app/api/global-enterprise-command/brief/route.ts", brief, expected);
}

for (const expected of [
  "SCRIMED Global Enterprise Command",
  "Global sales performance",
  "Global interoperability",
  "Global communication",
  "Blocked claim",
  "Human review required"
]) {
  requireIncludes("app/global-enterprise-command/page.tsx", page, expected);
}

for (const expected of [
  "SCRIMED Global Enterprise Command",
  "metadata-only control plane",
  "human-reviewed communication",
  "blocked claims",
  "npm run smoke:global-enterprise-command"
]) {
  requireIncludes("docs/global-enterprise-command.md", docs, expected);
}

for (const expected of [
  "Global Enterprise Command",
  "/global-enterprise-command",
  "international enterprise readiness"
]) {
  requireIncludes("app/lib/siteNavigation.ts", navigation, expected);
}

for (const expected of [
  "expectedApiRoutePatternCount = 450",
  "\"/global-enterprise-command\""
]) {
  requireIncludes("app/lib/navigationAudit.ts", audit, expected);
}

for (const expected of [
  "getGlobalEnterpriseCommandSummary",
  "globalEnterpriseCommandSummary",
  "globalEnterpriseCommand: globalEnterpriseCommandStatus",
  "globalEnterpriseCommandRegionCount",
  "globalEnterpriseCommandSalesPlaybookCount"
]) {
  requireIncludes("app/lib/productConsole.ts", productConsole, expected);
}

for (const expected of [
  "checkGlobalEnterpriseCommand",
  "/api/global-enterprise-command",
  "/api/global-enterprise-command/brief",
  "pass global enterprise command"
]) {
  requireIncludes("scripts/public-production-smoke.mjs", smoke, expected);
}

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:global-enterprise-command\": \"node scripts/global-enterprise-command-contract-check.mjs\""
);

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/global-enterprise-command-contract-check.mjs"
);

for (const path of [
  "app/lib/globalEnterpriseCommand.ts",
  "app/api/global-enterprise-command/route.ts",
  "app/api/global-enterprise-command/brief/route.ts",
  "app/global-enterprise-command/page.tsx",
  "docs/global-enterprise-command.md"
]) {
  const text = files[path];

  for (const forbidden of [
    "HIPAA certified",
    "SOC 2 certified",
    "FDA cleared",
    "NHS approved",
    "autonomous diagnosis enabled",
    "autonomous treatment enabled",
    "prescribes for patients",
    "payer submission enabled",
    "EHR writeback enabled",
    "customer go-live approved"
  ]) {
    requireNotIncludes(path, text, forbidden);
  }
}

console.log("pass SCRIMED Global Enterprise Command contract check");
