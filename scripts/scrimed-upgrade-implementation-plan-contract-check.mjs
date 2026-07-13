#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "SCRIMED_UPGRADE_IMPLEMENTATION_PLAN.md",
  "app/lib/scrimedUpgradeImplementationPlan.ts",
  "app/api/scrimed-upgrade-implementation-plan/route.ts",
  "app/api/scrimed-upgrade-implementation-plan/brief/route.ts",
  "app/scrimed-upgrade-implementation-plan/page.tsx",
  "docs/scrimed-upgrade-implementation-plan.md",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required SCRIMED upgrade implementation text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/scrimedUpgradeImplementationPlan.ts"];
const api = files["app/api/scrimed-upgrade-implementation-plan/route.ts"];
const brief = files["app/api/scrimed-upgrade-implementation-plan/brief/route.ts"];
const page = files["app/scrimed-upgrade-implementation-plan/page.tsx"];
const docs = files["docs/scrimed-upgrade-implementation-plan.md"];
const rootPlan = files["SCRIMED_UPGRADE_IMPLEMENTATION_PLAN.md"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "scrimed-upgrade-implementation-plan-ready-synthetic-no-phi",
  "ScrimedUpgradeDomainId",
  "Secure Agent Runtime",
  "Contextual Policy Engine",
  "Observability Layer",
  "Clinical Evaluation Harness",
  "Multi-Model Router",
  "Knowledge Operating System",
  "Healthcare Workflow Automation",
  "DevSecOps / CI-CD",
  "Local-First / Edge AI",
  "Strategic Product Direction",
  "PHI-aware access control",
  "dynamic session-state permissions",
  "secret scanning",
  "tool-call allow/deny/approval rules",
  "cost ceilings",
  "untrusted-content risk scoring",
  "immutable audit logs",
  "emergency stop / human escalation",
  "read-PHI restriction escalation",
  "untrusted web content risk scoring",
  "cost threshold approval",
  "patient safety / billing / legal / outbound review gate",
  "destructive mutation elevated approval",
  "token usage telemetry",
  "retrieval quality scoring",
  "clinical safety flags",
  "FHIR/HL7 validity checks",
  "prior authorization documentation quality checks",
  "clinical_reasoning",
  "prior_authorization",
  "medical_imaging",
  "document_parsing_ocr",
  "patient_education_translation",
  "reusable playbook generation",
  "knowledge graph update",
  "release-of-information requests",
  "medication shortage visibility",
  "clinical trial evidence management",
  "PHI leakage tests",
  "clinical safety regression tests",
  "browser-side de-identification",
  "on-device PHI redaction",
  "edge inference for low-connectivity clinics",
  "all-ten-upgrade-domains-present",
  "contextual-policy-engine-fail-closes",
  "multi-model-router-covers-required-task-types",
  "workflow-automation-remains-review-gated",
  "devsecops-controls-block-unsafe-release",
  "no-domain-authorizes-production-or-clinical-authority",
  "buildScrimedUpgradeImplementationPlanBrief"
]) {
  requireIncludes("app/lib/scrimedUpgradeImplementationPlan.ts", source, expected);
}

for (const expected of [
  "getScrimedUpgradeImplementationPlanSummary",
  "evaluateScrimedSafetyGate",
  "X-SCRIMED-Upgrade-Implementation-Plan",
  "synthetic-no-phi-architecture-only"
]) {
  requireIncludes("app/api/scrimed-upgrade-implementation-plan/route.ts", api, expected);
}

for (const expected of [
  "buildScrimedUpgradeImplementationPlanBrief",
  "scrimed-upgrade-implementation-plan.md",
  "text/markdown"
]) {
  requireIncludes("app/api/scrimed-upgrade-implementation-plan/brief/route.ts", brief, expected);
}

for (const expected of [
  "SCRIMED Upgrade Implementation Plan",
  "Secure agents, governed workflows, continuous evaluation, and local-first healthcare AI",
  "Contextual Policy Engine",
  "Multi-Model Router",
  "Workflow Automation",
  "DevSecOps / CI-CD",
  "This is architecture authority, not production authority"
]) {
  requireIncludes("app/scrimed-upgrade-implementation-plan/page.tsx", page, expected);
}

for (const expected of [
  "/api/scrimed-upgrade-implementation-plan",
  "Secure Agent Runtime",
  "Contextual Policy Engine",
  "Observability Layer",
  "Clinical Evaluation Harness",
  "Multi-Model Router",
  "Knowledge Operating System",
  "Healthcare Workflow Automation",
  "DevSecOps / CI-CD",
  "Local-First / Edge AI",
  "Strategic Product Direction",
  "does not authorize live PHI",
  "does not authorize live PHI, autonomous clinical action"
]) {
  requireIncludes("docs/scrimed-upgrade-implementation-plan.md", docs, expected);
}

for (const expected of [
  "SCRIMED Most Recent Upgrade Implementation Plan",
  "SCRIMED_UPGRADE_IMPLEMENTATION_PLAN.md",
  "metadata-only contextual policy preview API"
]) {
  requireIncludes("SCRIMED_UPGRADE_IMPLEMENTATION_PLAN.md", rootPlan, expected);
}

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:scrimed-upgrade-implementation-plan\": \"node scripts/scrimed-upgrade-implementation-plan-contract-check.mjs\""
);

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/scrimed-upgrade-implementation-plan-contract-check.mjs"
);

console.log("pass SCRIMED upgrade implementation plan contract check");
