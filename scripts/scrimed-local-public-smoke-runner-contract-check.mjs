#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const runnerPath = "scripts/scrimed-local-public-smoke-runner.mjs";
const documentationPath = "docs/local-quality-runner.md";
const nonsecretSuitePath = "scripts/scrimed-nonsecret-test-suite.mjs";
const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const runner = await readFile(runnerPath, "utf8");
const documentation = await readFile(documentationPath, "utf8");
const nonsecretSuite = await readFile(nonsecretSuitePath, "utf8");

function requireIncludes(label, source, expected) {
  if (!source.includes(expected)) {
    throw new Error(`${label} missing required local-smoke control: ${expected}`);
  }
}

for (const expected of [
  "127.0.0.1",
  "assertLocalPortAvailable",
  "createNonsecretEnvironment",
  "discoverLocalEnvironmentNames",
  ".env.local",
  "SCRIMED_ALLOW_PHI",
  "SCRIMED_WORK_PROTECTED_WRITES_ENABLED",
  "SCRIMED_AI_PROVIDER_CALLS_ENABLED",
  "scripts/public-production-smoke.mjs",
  "scripts/check-generated-integrity.mjs",
  "scripts/clean-generated-cache.mjs",
  "Production build output unavailable",
  "post-smoke generated integrity",
  "SIGTERM",
  "SIGKILL",
  "server_stopped=true",
  "shell: false"
]) {
  requireIncludes(runnerPath, runner, expected);
}

for (const forbidden of ["shell: true", "env: process.env", "...process.env", "npm install", "npm ci"]) {
  if (runner.includes(forbidden)) {
    throw new Error(`${runnerPath} contains forbidden environment, shell, or package behavior: ${forbidden}`);
  }
}

if (packageJson.scripts?.["smoke:public:local"] !== `node ${runnerPath}`) {
  throw new Error("package.json must expose smoke:public:local through the managed runner.");
}

for (const expected of [
  "smoke:public:local",
  "localhost-only",
  "shuts the server down",
  "generated integrity"
]) {
  requireIncludes(documentationPath, documentation, expected);
}

requireIncludes(nonsecretSuitePath, nonsecretSuite, runnerPath.replace(".mjs", "-contract-check.mjs"));
requireIncludes(
  "scripts/public-production-smoke.mjs",
  await readFile("scripts/public-production-smoke.mjs", "utf8"),
  'process.env.SCRIMED_WORKSPACE_SLUG?.trim() || "atlas-synthetic-evaluation"'
);

const secretSentinel = "SCRIMED_LOCAL_SMOKE_SECRET_SENTINEL_36cd30";
const selfTest = spawnSync(process.execPath, [runnerPath, "--self-test"], {
  env: {
    ...process.env,
    SCRIMED_BEARER_TOKEN: secretSentinel,
    SCRIMED_TEST_API_KEY: secretSentinel
  },
  encoding: "utf8",
  shell: false
});
const output = `${selfTest.stdout ?? ""}${selfTest.stderr ?? ""}`;

if (selfTest.status !== 0) {
  throw new Error(`Local public smoke self-test failed: ${output.trim()}`);
}

if (output.includes(secretSentinel)) {
  throw new Error("Local public smoke self-test exposed a sensitive environment value.");
}

requireIncludes("local public smoke self-test output", output, "local public smoke runner self-test");

console.log("pass SCRIMED local public smoke runner contract check");
