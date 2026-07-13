#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/scrimedModuleRegistry.ts",
  "app/scrimed-modules/page.tsx",
  "app/api/scrimed-modules/route.ts",
  "app/api/scrimed-modules/brief/route.ts",
  "app/lib/siteNavigation.ts",
  "docs/scrimed-module-registry.md",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required SCRIMED module registry text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/scrimedModuleRegistry.ts"];
const page = files["app/scrimed-modules/page.tsx"];
const api = files["app/api/scrimed-modules/route.ts"];
const brief = files["app/api/scrimed-modules/brief/route.ts"];
const nav = files["app/lib/siteNavigation.ts"];
const docs = files["docs/scrimed-module-registry.md"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "SCRIMED ClinicalBench",
  "SCRIMED Scientific Reasoning Engine",
  "SCRIMED Workflow Planner",
  "SCRIMED Clinical Judgment Engine",
  "SCRIMED Evidence Graph",
  "SCRIMED ResearchOps",
  "SCRIMED LongTask Runtime",
  "SCRIMED Clinical Work Graph",
  "SCRIMED Trust Score",
  "SCRIMED Continuous Evaluation Platform",
  "SCRIMED Outcome Intelligence",
  "SCRIMED Knowledge Evolution Engine",
  "SCRIMED Multi-Agent Runtime",
  "SCRIMED Multi-Model Router",
  "SCRIMED Adaptive Workflow Selector",
  "SCRIMED Clinical Memory",
  "SCRIMED Research Memory",
  "SCRIMED Physician Preference Memory",
  "SCRIMED Benchmark Studio",
  "all-requested-modules-registered",
  "human-review-boundary",
  "no-direct-llm-database-access",
  "evidence-and-audit-required",
  "No-PHI synthetic fixtures only",
  "Human review required for protected clinical workflows",
  "No direct LLM-to-database access",
  "No autonomous system-of-record mutation",
  "NO-GO for live PHI"
]) {
  requireIncludes("app/lib/scrimedModuleRegistry.ts", source, expected);
}

for (const expected of [
  "SCRIMED Module Registry",
  "Inspect Registry API",
  "Download Brief",
  "Nineteen requested modules",
  "Module architecture can advance now"
]) {
  requireIncludes("app/scrimed-modules/page.tsx", page, expected);
}

for (const expected of [
  "getScrimedModuleRegistrySummary",
  "evaluateScrimedSafetyGate",
  "X-SCRIMED-Module-Registry",
  "synthetic-no-phi-only"
]) {
  requireIncludes("app/api/scrimed-modules/route.ts", api, expected);
}

for (const expected of [
  "buildScrimedModuleRegistryBrief",
  "Content-Type",
  "text/markdown",
  "scrimed-module-registry.md"
]) {
  requireIncludes("app/api/scrimed-modules/brief/route.ts", brief, expected);
}

for (const expected of [
  "Modules",
  "/scrimed-modules",
  "SCRIMED module registry"
]) {
  requireIncludes("app/lib/siteNavigation.ts", nav, expected);
}

for (const expected of [
  "/scrimed-modules",
  "/api/scrimed-modules",
  "Modules Added",
  "Required Safety Controls",
  "First Implementation Priority",
  "does not authorize PHI"
]) {
  requireIncludes("docs/scrimed-module-registry.md", docs, expected);
}

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:scrimed-modules\": \"node scripts/scrimed-module-registry-contract-check.mjs\""
);

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/scrimed-module-registry-contract-check.mjs"
);

console.log("pass SCRIMED module registry contract check");
