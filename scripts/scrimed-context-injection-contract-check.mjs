#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/scrimedDynamicContextInjection.ts",
  "app/api/scrimed-build-roadmap/context-manifest/route.ts",
  "app/api/scrimed-build-roadmap/context-manifest/brief/route.ts",
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
    throw new Error(`${path} is missing required SCRIMED context-injection text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/scrimedDynamicContextInjection.ts"];
const api = files["app/api/scrimed-build-roadmap/context-manifest/route.ts"];
const brief = files["app/api/scrimed-build-roadmap/context-manifest/brief/route.ts"];
const page = files["app/scrimed-build-roadmap/page.tsx"];
const docs = files["docs/scrimed-build-roadmap.md"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "scrimed-dynamic-context-injection-engine",
  "pre-agent-run",
  "selectedModules",
  "relevantSkills",
  "includedEveryTurn",
  "activeTaskReminders",
  "requiredBeforeNextRun",
  "omittedContext",
  "hidden-chain-of-thought",
  "lazyCapabilityLoadout",
  "loadedNow",
  "deferredUntilNeeded",
  "blockedUntilApproval",
  "Structured Output Schema Validator",
  "Evidence and Source Validator",
  "Deterministic Rule Validator",
  "Human Review Gate",
  "Operational Benchmark Layer",
  "metadata-only-decision-memory-ledger",
  "none-context-manifest-does-not-grant-permissions",
  "metadata-rationale-summary-not-hidden-chain-of-thought",
  "validateScrimedDynamicContextManifest",
  "pre-agent-run-context-manifest-ready",
  "selected-modules-listed-every-turn",
  "task-reminders-versioned",
  "validators-avoid-self-correction-trap",
  "memory-plan-metadata-only-no-hidden-cot",
  "buildScrimedDynamicContextInjectionBrief"
]) {
  requireIncludes("app/lib/scrimedDynamicContextInjection.ts", source, expected);
}

for (const expected of [
  "getScrimedDynamicContextInjectionSummary",
  "evaluateScrimedSafetyGate",
  "X-SCRIMED-Context-Injection",
  "synthetic-no-phi-only"
]) {
  requireIncludes("app/api/scrimed-build-roadmap/context-manifest/route.ts", api, expected);
}

for (const expected of [
  "buildScrimedDynamicContextInjectionBrief",
  "scrimed-dynamic-context-injection.md",
  "text/markdown"
]) {
  requireIncludes("app/api/scrimed-build-roadmap/context-manifest/brief/route.ts", brief, expected);
}

for (const expected of [
  "getScrimedDynamicContextInjectionSummary",
  "Context Manifest",
  "Dynamic Context Injection Engine",
  "pre-agent-run context manifest",
  "Lazy capability loadout",
  "task reminder v",
  "metadata-only"
]) {
  requireIncludes("app/scrimed-build-roadmap/page.tsx", page, expected);
}

for (const expected of [
  "/api/scrimed-build-roadmap/context-manifest",
  "Dynamic Context Injection Engine",
  "pre-agent-run context manifest",
  "skill/module listing every turn",
  "versioned task reminders",
  "omitted context log",
  "lazy capability loadout",
  "metadata-only decision memory write plan",
  "does not grant tool permissions",
  "hidden chain-of-thought"
]) {
  requireIncludes("docs/scrimed-build-roadmap.md", docs, expected);
}

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:scrimed-context-injection\": \"node scripts/scrimed-context-injection-contract-check.mjs\""
);

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/scrimed-context-injection-contract-check.mjs"
);

console.log("pass SCRIMED context injection contract check");
