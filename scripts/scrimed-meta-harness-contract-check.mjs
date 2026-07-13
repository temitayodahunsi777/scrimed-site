#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/scrimedMetaHarness.ts",
  "app/lib/scrimedBuildRoadmap.ts",
  "app/scrimed-build-roadmap/page.tsx",
  "docs/scrimed-build-roadmap.md",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required SCRIMED Meta-Harness text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/scrimedMetaHarness.ts"];
const roadmap = files["app/lib/scrimedBuildRoadmap.ts"];
const page = files["app/scrimed-build-roadmap/page.tsx"];
const docs = files["docs/scrimed-build-roadmap.md"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "ScrimedMetaHarnessAgentIdentity",
  "scrimedMetaHarnessBoundary",
  "coding_agent",
  "clinical_agent",
  "documentation_agent",
  "evidence_agent",
  "operations_agent",
  "trust_safety_agent",
  "scrimedMetaHarnessSafeTools",
  "scrimedMetaHarnessBlockedTools",
  "ehr_writeback",
  "payer_submission",
  "patient_outreach",
  "production_connector_activation",
  "raw_payload_logger",
  "synthetic_shared_session_ready",
  "human_approval_required_for_high_stakes",
  "evaluateScrimedMetaHarnessRequest",
  "getScrimedMetaHarnessSummary",
  "agent-identity-registry-complete",
  "permissions-declared",
  "shared-session-no-phi",
  "high-stakes-human-review",
  "protected-actions-blocked"
]) {
  requireIncludes("app/lib/scrimedMetaHarness.ts", source, expected);
}

for (const expected of [
  "getScrimedMetaHarnessSummary",
  "metaHarness",
  "Omnigent-Style Meta-Harness"
]) {
  requireIncludes("app/lib/scrimedBuildRoadmap.ts", roadmap, expected);
}

for (const expected of [
  "Omnigent-style Meta-Harness",
  "summary.metaHarness",
  "No external side effects",
  "Assigned agents",
  "approvalGate"
]) {
  requireIncludes("app/scrimed-build-roadmap/page.tsx", page, expected);
}

for (const expected of [
  "Omnigent-Style Meta-Harness",
  "app/lib/scrimedMetaHarness.ts",
  "coding agent",
  "clinical agent",
  "trust and safety agent",
  "allowed tools",
  "blocked tools",
  "Protected payer submission",
  "does not execute tools against systems of record",
  "does not grant autonomous clinical authority"
]) {
  requireIncludes("docs/scrimed-build-roadmap.md", docs, expected);
}

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:scrimed-meta-harness\": \"node scripts/scrimed-meta-harness-contract-check.mjs\""
);

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/scrimed-meta-harness-contract-check.mjs"
);

console.log("pass SCRIMED Meta-Harness contract check");
