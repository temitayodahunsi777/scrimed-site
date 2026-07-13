#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/scrimedBuildRoadmap.ts",
  "app/api/scrimed-build-roadmap/route.ts",
  "app/api/scrimed-build-roadmap/brief/route.ts",
  "app/scrimed-build-roadmap/page.tsx",
  "app/lib/siteNavigation.ts",
  "docs/scrimed-build-roadmap.md",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required SCRIMED build-roadmap text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/scrimedBuildRoadmap.ts"];
const api = files["app/api/scrimed-build-roadmap/route.ts"];
const brief = files["app/api/scrimed-build-roadmap/brief/route.ts"];
const page = files["app/scrimed-build-roadmap/page.tsx"];
const nav = files["app/lib/siteNavigation.ts"];
const docs = files["docs/scrimed-build-roadmap.md"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "llms-interface-layer",
  "Treat LLMs as the interface layer, not the whole system.",
  "world-model-context-layers",
  "active-ontology-semantic-graph",
  "long-term-memory-traces",
  "dynamic-context-injection",
  "deep planning summaries",
  "skill/module",
  "avoid-self-correction-trap",
  "Structured-output validator",
  "Human-review gate",
  "workforce-talent-module",
  "healthcare hiring",
  "vacancy-risk",
  "labor-cost",
  "project-resource-management",
  "compute, storage, quota, model usage, pipeline cost, agent workload",
  "healthcare-world-models",
  "time-series",
  "geography",
  "physical constraints",
  "payer rules",
  "patient journey state",
  "benchmark-layer",
  "reasoning-validity",
  "operational-accuracy",
  "ScrimedBuildRoadmapPriorityStackItem",
  "scrimedBuildRoadmapPriorityPrinciple",
  "SCRIMED must be a governed healthcare meta-harness",
  "omnigent-style-meta-harness",
  "Omnigent-style Meta-Harness",
  "documentation-before-authorization-engine",
  "Documentation-Before-Authorization Engine",
  "symptom language",
  "functional status",
  "visit timing",
  "medical-necessity",
  "edge-clinical-trial-evidence-layer",
  "Edge Clinical Trial Evidence Layer",
  "on-device-deidentification",
  "PDFs, scans, images, HL7 v2, CDA, FHIR, CSV, NDJSON, and chat logs",
  "clinical-ai-benchmark-lab",
  "Clinical AI Benchmark Lab",
  "accuracy, utility, source quality, verifiability, and completeness",
  "automation-orchestrator",
  "Automation Orchestrator",
  "pre-indexed-intelligence",
  "Pre-Indexed Intelligence",
  "AI Medical Education Layer",
  "priority-stack-items-present",
  "governed-healthcare-meta-harness-principle",
  "priorityStackCount",
  "priorityStack",
  "all-user-directives-applied",
  "self-correction-not-trusted-alone",
  "world-model-layers-covered",
  "workforce-and-resource-modules-present"
]) {
  requireIncludes("app/lib/scrimedBuildRoadmap.ts", source, expected);
}

for (const expected of [
  "getScrimedBuildRoadmapSummary",
  "evaluateScrimedSafetyGate",
  "X-SCRIMED-Build-Roadmap",
  "synthetic-no-phi-only"
]) {
  requireIncludes("app/api/scrimed-build-roadmap/route.ts", api, expected);
}

for (const expected of [
  "buildScrimedBuildRoadmapBrief",
  "scrimed-build-roadmap.md",
  "text/markdown"
]) {
  requireIncludes("app/api/scrimed-build-roadmap/brief/route.ts", brief, expected);
}

for (const expected of [
  "SCRIMED Build Roadmap",
  "Inspect Roadmap API",
  "Priority Stack",
  "governed healthcare meta-harness",
  "summary.priorityStack",
  "World models",
  "Dynamic Context Injection Engine",
  "Operational Benchmark Layer"
]) {
  requireIncludes("app/scrimed-build-roadmap/page.tsx", page, expected);
}

for (const expected of [
  "Build Roadmap",
  "/scrimed-build-roadmap",
  "world models"
]) {
  requireIncludes("app/lib/siteNavigation.ts", nav, expected);
}

for (const expected of [
  "/scrimed-build-roadmap",
  "/api/scrimed-build-roadmap",
  "Applied Directives",
  "Dynamic Context Injection Engine",
  "Decision Memory Ledger",
  "Workforce / Talent Intelligence",
  "Project / Resource Management Intelligence",
  "Operational Benchmark Layer",
  "Governed Healthcare Meta-Harness Priority Stack",
  "Omnigent-style Meta-Harness",
  "Documentation-Before-Authorization Engine",
  "Edge Clinical Trial Evidence Layer",
  "On-Device De-Identification",
  "Clinical AI Benchmark Lab",
  "Automation Orchestrator",
  "Pre-Indexed Intelligence",
  "AI Medical Education Layer",
  "must not trust model self-verification alone",
  "does not authorize live PHI"
]) {
  requireIncludes("docs/scrimed-build-roadmap.md", docs, expected);
}

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:scrimed-build-roadmap\": \"node scripts/scrimed-build-roadmap-contract-check.mjs\""
);

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/scrimed-build-roadmap-contract-check.mjs"
);

console.log("pass SCRIMED build roadmap contract check");
