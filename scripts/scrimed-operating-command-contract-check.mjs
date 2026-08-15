#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/scrimedOperatingCommandCenter.ts",
  "app/api/scrimed-operating-command/route.ts",
  "app/api/scrimed-operating-command/brief/route.ts",
  "app/scrimed-operating-command/page.tsx",
  "app/lib/productConsole.ts",
  "app/product/page.tsx",
  "app/lib/scrimedHub.ts",
  "app/hub/page.tsx",
  "app/lib/siteNavigation.ts",
  "app/lib/navigationAudit.ts",
  "docs/scrimed-operating-command-center.md",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required SCRIMED operating-command text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/scrimedOperatingCommandCenter.ts"];
const api = files["app/api/scrimed-operating-command/route.ts"];
const brief = files["app/api/scrimed-operating-command/brief/route.ts"];
const page = files["app/scrimed-operating-command/page.tsx"];
const productConsole = files["app/lib/productConsole.ts"];
const productPage = files["app/product/page.tsx"];
const hub = files["app/lib/scrimedHub.ts"];
const hubPage = files["app/hub/page.tsx"];
const navigation = files["app/lib/siteNavigation.ts"];
const audit = files["app/lib/navigationAudit.ts"];
const docs = files["docs/scrimed-operating-command-center.md"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "scrimed-operating-command-center",
  "scrimed-operating-command-center-ready-no-phi",
  "agent-runtime-context-binding",
  "workflow-orchestration-release-train",
  "infrastructure-reliability-control-loop",
  "product-interface-command-surface",
  "service-product-packaging-loop",
  "interoperability-safety-adapter-lane",
  "mlops-evaluation-feedback-loop",
  "governance-revenue-approval-stack",
  "covers-core-operating-domains",
  "p0-lanes-have-human-or-gate-control",
  "no-autonomous-production-execution",
  "proof-and-api-routes-present",
  "kpis-are-measurable",
  "preserved-boundaries-explicit",
  "ScrimedOperatingEvidencePacket",
  "buildScrimedOperatingEvidencePackets",
  "evidence-packets-cover-every-lane",
  "protected-packets-require-aal2",
  "evidence-packets-do-not-authorize-production",
  "evidence-packets-have-deterministic-hashes",
  "protectedOperatorEvidencePacketCount",
  "boundaryReleaseEvidencePacketCount",
  "syntheticCompleteEvidencePacketCount",
  "buildScrimedOperatingCommandCenterBrief"
]) {
  requireIncludes("app/lib/scrimedOperatingCommandCenter.ts", source, expected);
}

for (const expected of [
  "evaluateScrimedSafetyGate",
  "X-SCRIMED-Operating-Command",
  "synthetic-no-phi-metadata-only",
  "planning-and-recommendation-only"
]) {
  requireIncludes("app/api/scrimed-operating-command/route.ts", api, expected);
}

for (const expected of [
  "buildScrimedOperatingCommandCenterBrief",
  "scrimed-operating-command-center.md",
  "text/markdown",
  "X-SCRIMED-Execution-Authority"
]) {
  requireIncludes("app/api/scrimed-operating-command/brief/route.ts", brief, expected);
}

for (const expected of [
  "SCRIMED Operating Command Center",
  "systems, agents, infrastructure, workflows, services, products, and UI",
  "P0 Operating Lanes",
  "Evidence Packets",
  "Protected packets",
  "Boundary packets",
  "Synthetic complete",
  "Packet hash",
  "Proof + Metrics",
  "Operating cadence",
  "Validation"
]) {
  requireIncludes("app/scrimed-operating-command/page.tsx", page, expected);
}

for (const expected of [
  "getScrimedOperatingCommandCenterSummary",
  "operatingCommandCenterSummary",
  "operatingCommandCenterLaneCount",
  "operatingCommandCenterP0LaneCount",
  "operatingCommandCenterHighControlLaneCount",
  "operatingCommandCenterEvidencePacketCount",
  "operatingCommandCenterProtectedEvidencePacketCount",
  "operatingCommandCenterBoundaryReleaseEvidencePacketCount",
  "operatingCommandCenterNextBuildStep"
]) {
  requireIncludes("app/lib/productConsole.ts", productConsole, expected);
}

for (const expected of [
  "SCRIMED operating command center",
  "Command lanes",
  "P0 command",
  "Review-gated lanes",
  "Command packets",
  "Protected packets",
  "Boundary packets",
  "Open Command Center",
  "Download Command Brief"
]) {
  requireIncludes("app/product/page.tsx", productPage, expected);
}

for (const expected of [
  "SCRIMED Operating Command Center",
  "getScrimedOperatingCommandCenterSummary",
  "operatingCommandCenterSummary",
  "systems, agents, infrastructure, workflows, services, products, UI"
]) {
  requireIncludes("app/lib/scrimedHub.ts", hub, expected);
}

for (const expected of [
  "Operating Command Center",
  "Operating command",
  "Operating evidence packets",
  "Command lanes",
  "P0 command",
  "Review-gated lanes",
  "Command packets",
  "Protected packets",
  "Boundary packets",
  "Open Command Center",
  "Download Command Brief"
]) {
  requireIncludes("app/hub/page.tsx", hubPage, expected);
}

for (const expected of [
  "Ops Command",
  "/scrimed-operating-command",
  "Operating Command"
]) {
  requireIncludes("app/lib/siteNavigation.ts", navigation, expected);
}

for (const expected of [
  "expectedApiRoutePatternCount = 452",
  "\"/scrimed-operating-command\""
]) {
  requireIncludes("app/lib/navigationAudit.ts", audit, expected);
}

for (const expected of [
  "SCRIMED Operating Command Center",
  "/api/scrimed-operating-command",
  "synthetic/no-PHI",
  "does not authorize live PHI",
  "agent runtime context binding",
  "governed workflow release train",
  "infrastructure reliability control loop",
  "Evidence Packets",
  "deterministic evidence packet",
  "fresh AAL2 operator run",
  "protected operator persistence"
]) {
  requireIncludes("docs/scrimed-operating-command-center.md", docs, expected);
}

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:scrimed-operating-command\": \"node scripts/scrimed-operating-command-contract-check.mjs\""
);

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/scrimed-operating-command-contract-check.mjs"
);

console.log("pass SCRIMED operating command contract check");
