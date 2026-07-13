#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const runnerPath = "scripts/scrimed-local-quality-runner.mjs";
const documentationPath = "docs/local-quality-runner.md";
const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const runner = await readFile(runnerPath, "utf8");
const documentation = await readFile(documentationPath, "utf8");

function requireIncludes(label, source, expected) {
  if (!source.includes(expected)) {
    throw new Error(`${label} missing required quality control: ${expected}`);
  }
}

for (const expected of [
  "process.execPath",
  "shell: false",
  "sensitiveEnvironmentName",
  "discoverSensitiveLocalEnvironmentNames",
  ".env.local",
  "scripts/clean-generated-cache.mjs",
  "scripts/check-generated-integrity.mjs",
  "scripts/workspace-hygiene-contract-check.mjs",
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "node_modules/typescript/bin/tsc",
  "node_modules/eslint/bin/eslint.js",
  "node_modules/next/dist/bin/next",
  "--noEmit",
  "build",
  "--webpack",
  "post-run generated integrity"
]) {
  requireIncludes(runnerPath, runner, expected);
}

for (const forbidden of ["npm install", "npm ci", "pnpm install", "yarn install", "shell: true"]) {
  if (runner.includes(forbidden)) {
    throw new Error(`${runnerPath} contains forbidden package-manager or shell behavior: ${forbidden}`);
  }
}

if (packageJson.scripts?.["quality:direct-node"] !== `node ${runnerPath}`) {
  throw new Error("package.json must expose quality:direct-node through the direct runner.");
}

for (const expected of [
  "No package installation",
  "Synthetic and no-secret",
  "node scripts/scrimed-local-quality-runner.mjs",
  "--no-build",
  "fails closed"
]) {
  requireIncludes(documentationPath, documentation, expected);
}

const secretSentinel = "SCRIMED_CONTRACT_SECRET_SENTINEL_7d4d26";
const preflight = spawnSync(process.execPath, [runnerPath, "--preflight"], {
  env: {
    ...process.env,
    SCRIMED_BEARER_TOKEN: secretSentinel,
    SCRIMED_TEST_API_KEY: secretSentinel
  },
  encoding: "utf8",
  shell: false
});
const preflightOutput = `${preflight.stdout ?? ""}${preflight.stderr ?? ""}`;

if (preflight.status !== 0) {
  throw new Error(`Direct-Node preflight failed: ${preflightOutput.trim()}`);
}

if (preflightOutput.includes(secretSentinel)) {
  throw new Error("Direct-Node preflight exposed a sensitive environment value.");
}

for (const expected of ["toolchain preflight", "sensitive_values_present=0"]) {
  requireIncludes("direct-Node preflight output", preflightOutput, expected);
}

console.log("pass SCRIMED direct-Node quality runner contract check");
