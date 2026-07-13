#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "docs/scrimed-design-source-of-truth.md",
  "app/globals.css",
  "app/lib/scrimed-control-plane/platformEvidence.ts",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];
const files = Object.fromEntries(
  await Promise.all(requiredFiles.map(async (path) => [path, await readFile(path, "utf8")]))
);

function requireIncludes(path, expected) {
  if (!files[path].includes(expected)) {
    throw new Error(`${path} missing design-governance control: ${expected}`);
  }
}

for (const expected of [
  "No editable canonical Figma file",
  "view-only seat",
  "app/globals.css",
  "release SHA",
  "Figma Promotion Gate",
  "accessibility",
  "does not claim a Figma design system exists"
]) {
  requireIncludes("docs/scrimed-design-source-of-truth.md", expected);
}

for (const token of ["--ink", "--muted", "--line", "--surface", "--green", "--gold", "--blue", "--coral"]) {
  requireIncludes("app/globals.css", token);
}

requireIncludes("app/lib/scrimed-control-plane/platformEvidence.ts", "figma-design-governance");
requireIncludes("package.json", '"contract:design-governance": "node scripts/design-governance-contract-check.mjs"');
requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", "scripts/design-governance-contract-check.mjs");

console.log(`pass SCRIMED design governance contract check (${requiredFiles.length} files verified)`);
