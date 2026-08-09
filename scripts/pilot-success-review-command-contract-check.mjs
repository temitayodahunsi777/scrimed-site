#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/pilotSuccessReviewCommand.ts",
  "app/api/pilot-success-review-command/route.ts",
  "app/api/pilot-success-review-command/brief/route.ts",
  "app/pilot-success-review-command/page.tsx",
  "docs/pilot-success-review-command.md",
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
    throw new Error(`${path} is missing required SCRIMED Pilot Success Review Command text: ${expected}`);
  }
}

function requireNotIncludes(path, text, forbidden) {
  if (text.toLowerCase().includes(forbidden.toLowerCase())) {
    throw new Error(`${path} contains forbidden SCRIMED Pilot Success Review Command claim: ${forbidden}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/pilotSuccessReviewCommand.ts"];
const api = files["app/api/pilot-success-review-command/route.ts"];
const brief = files["app/api/pilot-success-review-command/brief/route.ts"];
const page = files["app/pilot-success-review-command/page.tsx"];
const docs = files["docs/pilot-success-review-command.md"];
const navigation = files["app/lib/siteNavigation.ts"];
const audit = files["app/lib/navigationAudit.ts"];
const productConsole = files["app/lib/productConsole.ts"];
const productPage = files["app/product/page.tsx"];
const smoke = files["scripts/public-production-smoke.mjs"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "pilot-success-review-command-active-synthetic-no-roi-guarantee",
  "PilotSuccessReviewPlan",
  "PilotSuccessEvidenceGap",
  "PilotExpansionReadinessItem",
  "getPilotSuccessReviewCommandSummary",
  "buildPilotSuccessReviewCommandBrief",
  "not-roi-guarantee",
  "not-revenue-guarantee",
  "not-binding-commercial-offer",
  "not-customer-go-live-approval",
  "not-authorized-production-phi",
  "ROI guarantee",
  "binding commercial offer"
]) {
  requireIncludes("app/lib/pilotSuccessReviewCommand.ts", source, expected);
}

for (const expected of [
  "X-SCRIMED-External-Distribution-Authority",
  "human-review-required",
  "X-SCRIMED-Commercial-Authority",
  "not-binding-commercial-offer",
  "X-SCRIMED-Customer-Activation",
  "not-customer-go-live-approval",
  "X-SCRIMED-Financial-Authority",
  "not-audited-financial-report",
  "X-SCRIMED-PHI-Authority",
  "not-authorized-production-phi",
  "X-SCRIMED-ROI-Authority",
  "not-roi-guarantee"
]) {
  requireIncludes("app/api/pilot-success-review-command/route.ts", api, expected);
}

for (const expected of [
  "buildPilotSuccessReviewCommandBrief",
  "scrimed-pilot-success-review-command-brief.md",
  "text/markdown",
  "X-SCRIMED-External-Distribution-Authority"
]) {
  requireIncludes("app/api/pilot-success-review-command/brief/route.ts", brief, expected);
}

for (const expected of [
  "Pilot Success Review Command",
  "Review plans",
  "Evidence gaps",
  "Expansion readiness",
  "summary.boundary"
]) {
  requireIncludes("app/pilot-success-review-command/page.tsx", page, expected);
}

for (const expected of [
  "SCRIMED Pilot Success Review Command",
  "30/60/90-day review plans",
  "Safety Boundary",
  "npm run smoke:pilot-success-review-command"
]) {
  requireIncludes("docs/pilot-success-review-command.md", docs, expected);
}

for (const expected of [
  "Pilot Success Review",
  "/pilot-success-review-command",
  "claims-safe success review"
]) {
  requireIncludes("app/lib/siteNavigation.ts", navigation, expected);
}

for (const expected of [
  "expectedApiRoutePatternCount = 448",
  "\"/pilot-success-review-command\""
]) {
  requireIncludes("app/lib/navigationAudit.ts", audit, expected);
}

for (const expected of [
  "getPilotSuccessReviewCommandSummary",
  "pilotSuccessReviewCommandSummary",
  "pilotSuccessReviewCommand: pilotSuccessReviewCommandStatus",
  "pilotSuccessReviewCommandReviewPlanCount",
  "pilotSuccessReviewCommandBlockedClaimCount"
]) {
  requireIncludes("app/lib/productConsole.ts", productConsole, expected);
}

for (const expected of [
  "Pilot success review command",
  "Open Success Review",
  "Download Success Brief",
  "summary.pilotSuccessReviewCommandSummary.boundary"
]) {
  requireIncludes("app/product/page.tsx", productPage, expected);
}

for (const expected of [
  "checkPilotSuccessReviewCommand",
  "/api/pilot-success-review-command",
  "/api/pilot-success-review-command/brief",
  "pass pilot success review command"
]) {
  requireIncludes("scripts/public-production-smoke.mjs", smoke, expected);
}

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:pilot-success-review-command\": \"node scripts/pilot-success-review-command-contract-check.mjs\""
);

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/pilot-success-review-command-contract-check.mjs"
);

for (const path of [
  "app/lib/pilotSuccessReviewCommand.ts",
  "app/api/pilot-success-review-command/route.ts",
  "app/api/pilot-success-review-command/brief/route.ts",
  "app/pilot-success-review-command/page.tsx",
  "docs/pilot-success-review-command.md"
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

console.log("pass pilot success review command contract");
