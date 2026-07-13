#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/scrimedOSImplementationPlan.ts",
  "app/scrimed-os/page.tsx",
  "app/api/scrimed-os/implementation-plan/route.ts",
  "app/api/scrimed-os/implementation-plan/brief/route.ts",
  "app/lib/siteNavigation.ts",
  "docs/scrimed-os-implementation-plan.md",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required SCRIMED OS implementation-plan text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/scrimedOSImplementationPlan.ts"];
const page = files["app/scrimed-os/page.tsx"];
const api = files["app/api/scrimed-os/implementation-plan/route.ts"];
const brief = files["app/api/scrimed-os/implementation-plan/brief/route.ts"];
const nav = files["app/lib/siteNavigation.ts"];
const docs = files["docs/scrimed-os-implementation-plan.md"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "SCRIMED Event Mesh",
  "Agent Identity Registry",
  "Secure MCP Gateway",
  "CodeMode Runtime for agents",
  "Clinical Workflow Orchestrator",
  "Agent Registry",
  "Prompt Registry",
  "Policy Registry",
  "Model Registry",
  "Evaluation Registry",
  "FHIR Validation Agent",
  "Imaging Integration Layer",
  "Configuration Drift Agent",
  "AI Cost Intelligence Agent",
  "Observability Platform",
  "Autonomous Remediation Agent",
  "Clinical QA Engine",
  "Continuous Outcome Learning Engine",
  "Infrastructure-as-Code Engine",
  "Kubernetes Deployment Engine",
  "Zero-Trust Audit Ledger",
  "SQL/FHIR Query Validation Middleware",
  "Deployment Approval Pipeline",
  "Secure RAG/Data Ingestion Pipeline",
  "Human-in-the-loop Clinical Safety Sandbox",
  "No direct LLM-to-database access.",
  "Governed MCP middleware",
  "pages, tables, labels, values, units, citations, images, and references",
  "Patient Engagement Agent",
  "all-requested-capabilities-mapped",
  "human-in-the-loop-clinical-safety",
  "production-mutation-blocked",
  "NO-GO for live PHI"
]) {
  requireIncludes("app/lib/scrimedOSImplementationPlan.ts", source, expected);
}

for (const expected of [
  "SCRIMED OS Implementation Plan",
  "Healthcare Intelligence Operating System",
  "Inspect Plan API",
  "Download Brief",
  "Capability architecture",
  "Agents to build",
  "Starter architecture"
]) {
  requireIncludes("app/scrimed-os/page.tsx", page, expected);
}

for (const expected of [
  "getScrimedOSImplementationPlanSummary",
  "evaluateScrimedSafetyGate",
  "X-SCRIMED-OS-Implementation-Plan",
  "synthetic-no-phi-only"
]) {
  requireIncludes("app/api/scrimed-os/implementation-plan/route.ts", api, expected);
}

for (const expected of [
  "buildScrimedOSImplementationPlanBrief",
  "Content-Type",
  "text/markdown",
  "scrimed-os-implementation-plan.md"
]) {
  requireIncludes("app/api/scrimed-os/implementation-plan/brief/route.ts", brief, expected);
}

for (const expected of [
  "SCRIMED OS",
  "/scrimed-os",
  "Healthcare Intelligence Operating System implementation plan"
]) {
  requireIncludes("app/lib/siteNavigation.ts", nav, expected);
}

for (const expected of [
  "/scrimed-os",
  "/api/scrimed-os/implementation-plan",
  "Current NO-GO Scope",
  "Capabilities Covered",
  "Roadmap Phases",
  "First Implementation Step",
  "does not authorize PHI"
]) {
  requireIncludes("docs/scrimed-os-implementation-plan.md", docs, expected);
}

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:scrimed-os-plan\": \"node scripts/scrimed-os-implementation-plan-contract-check.mjs\""
);

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/scrimed-os-implementation-plan-contract-check.mjs"
);

console.log("pass SCRIMED OS implementation plan contract check");
