#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/scrimedEnterpriseAcceleration.ts",
  "app/api/scrimed-enterprise-acceleration/route.ts",
  "app/api/scrimed-enterprise-acceleration/brief/route.ts",
  "app/scrimed-enterprise-acceleration/page.tsx",
  "docs/scrimed-enterprise-acceleration.md",
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
    throw new Error(`${path} missing required SCRIMED Enterprise Acceleration text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/scrimedEnterpriseAcceleration.ts"];

for (const expected of [
  "scrimed-enterprise-acceleration-active-synthetic-no-phi",
  "ScrimedAccelerationLaneId",
  "systems-infrastructure",
  "agents-process",
  "functionality-ui",
  "performance-efficiency",
  "accuracy-validity",
  "competitive-edge",
  "investor-readiness",
  "revenue-sales",
  "pitch-demo",
  "production-readiness",
  "innovation-capability",
  "investorConfidence",
  "buyerDraw",
  "salesReadiness",
  "systemVitality",
  "validityPosture",
  "performancePosture",
  "investor_pitch",
  "sales_pitch",
  "demo_script",
  "proof_packet",
  "Workflow Intelligence Assessment",
  "Governed Synthetic Pilot",
  "Enterprise AI Readiness Retainer",
  "No PHI",
  "No autonomous clinical care",
  "No production deploy claim",
  "No certification claim",
  "No customer go-live claim",
  "buildScrimedEnterpriseAccelerationBrief"
]) {
  requireIncludes("app/lib/scrimedEnterpriseAcceleration.ts", source, expected);
}

for (const expected of [
  "getScrimedEnterpriseAccelerationSummary",
  "evaluateScrimedSafetyGate",
  "scrimedSafetyHeaders",
  "X-SCRIMED-Enterprise-Acceleration",
  "synthetic-no-phi-metadata-only"
]) {
  requireIncludes("app/api/scrimed-enterprise-acceleration/route.ts", files["app/api/scrimed-enterprise-acceleration/route.ts"], expected);
}

for (const expected of [
  "buildScrimedEnterpriseAccelerationBrief",
  "scrimed-enterprise-acceleration.md",
  "text/markdown"
]) {
  requireIncludes("app/api/scrimed-enterprise-acceleration/brief/route.ts", files["app/api/scrimed-enterprise-acceleration/brief/route.ts"], expected);
}

for (const expected of [
  "SCRIMED Enterprise Acceleration",
  "Investor confidence",
  "Buyer draw",
  "Sales readiness",
  "Pitches + Demos",
  "Revenue Motions",
  "Production readiness remains false"
]) {
  requireIncludes("app/scrimed-enterprise-acceleration/page.tsx", files["app/scrimed-enterprise-acceleration/page.tsx"], expected);
}

for (const expected of [
  "SCRIMED Enterprise Acceleration Command",
  "/api/scrimed-enterprise-acceleration",
  "Systems + Infrastructure Upgrade",
  "Revenue Generation + Sales Performance",
  "Safety Boundary"
]) {
  requireIncludes("docs/scrimed-enterprise-acceleration.md", files["docs/scrimed-enterprise-acceleration.md"], expected);
}

requireIncludes("package.json", files["package.json"], "\"smoke:scrimed-enterprise-acceleration\"");
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "scripts/scrimed-enterprise-acceleration-contract-check.mjs"
);
requireIncludes("app/lib/siteNavigation.ts", files["app/lib/siteNavigation.ts"], "/scrimed-enterprise-acceleration");
requireIncludes("app/lib/navigationAudit.ts", files["app/lib/navigationAudit.ts"], "/scrimed-enterprise-acceleration");
requireIncludes("scripts/public-production-smoke.mjs", files["scripts/public-production-smoke.mjs"], "/scrimed-enterprise-acceleration");

console.log("pass SCRIMED Enterprise Acceleration contract check");
