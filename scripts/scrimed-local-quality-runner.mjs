#!/usr/bin/env node

import { constants as fsConstants } from "node:fs";
import { access, lstat, readFile, realpath } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const requestedOptions = new Set(process.argv.slice(2));
const supportedOptions = new Set(["--no-build", "--preflight"]);
const unknownOptions = [...requestedOptions].filter((option) => !supportedOptions.has(option));

if (unknownOptions.length > 0) {
  throw new Error(`Unsupported quality-runner option: ${unknownOptions.join(", ")}`);
}

const entrypoints = {
  cleanup: "scripts/clean-generated-cache.mjs",
  integrity: "scripts/check-generated-integrity.mjs",
  postflight: "scripts/generated-output-postflight.mjs",
  publicReleaseVerifier: "scripts/verify-public-release.mjs",
  workspaceHygiene: "scripts/workspace-hygiene-contract-check.mjs",
  nonsecret: "scripts/scrimed-nonsecret-test-suite.mjs",
  typescript: "node_modules/typescript/bin/tsc",
  eslint: "node_modules/eslint/bin/eslint.js",
  next: "node_modules/next/dist/bin/next"
};

const sensitiveEnvironmentName =
  /(TOKEN|SECRET|PASSWORD|PASSCODE|PRIVATE_KEY|SERVICE_ROLE|API_KEY|AUTHORIZATION|COOKIE|SESSION_JSON|CREDENTIAL)/i;

const localEnvironmentFiles = [
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
  ".env.development",
  ".env.development.local",
  ".env.test",
  ".env.test.local"
];

async function discoverSensitiveLocalEnvironmentNames() {
  const names = new Set();

  for (const filePath of localEnvironmentFiles) {
    let contents;
    try {
      contents = await readFile(path.join(root, filePath), "utf8");
    } catch (error) {
      if (error?.code === "ENOENT") {
        continue;
      }

      throw error;
    }

    for (const line of contents.split(/\r?\n/)) {
      const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(line);
      if (match && sensitiveEnvironmentName.test(match[1])) {
        names.add(match[1]);
      }
    }
  }

  return names;
}

function createNonsecretEnvironment(localSensitiveNames) {
  const environment = {};

  for (const [name, value] of Object.entries(process.env)) {
    environment[name] = sensitiveEnvironmentName.test(name) ? "" : value;
  }

  for (const name of localSensitiveNames) {
    environment[name] = "";
  }

  environment.CI = "1";
  environment.NEXT_TELEMETRY_DISABLED = "1";
  return environment;
}

async function assertEntrypoints() {
  await Promise.all(
    Object.entries(entrypoints).map(async ([label, relativePath]) => {
      try {
        await access(path.join(root, relativePath), fsConstants.R_OK);
      } catch {
        throw new Error(`Required ${label} entrypoint is unavailable: ${relativePath}`);
      }
    })
  );
}

async function dependencyMode() {
  try {
    const stats = await lstat(path.join(root, "node_modules"));
    if (!stats.isSymbolicLink()) {
      return stats.isDirectory() ? "local-directory" : "invalid";
    }

    await realpath(path.join(root, "node_modules"));
    return "readable-symlink";
  } catch {
    return "missing";
  }
}

function runStage(stage, environment) {
  const startedAt = Date.now();
  console.log(`\nrun ${stage.label}`);

  const result = spawnSync(process.execPath, stage.args, {
    cwd: root,
    env: environment,
    stdio: "inherit",
    timeout: stage.timeoutMs,
    shell: false
  });

  const durationMs = Date.now() - startedAt;

  if (result.error) {
    const timedOut = result.error.code === "ETIMEDOUT";
    throw new Error(
      `${stage.label} ${timedOut ? "timed out" : "could not start"} after ${durationMs}ms.`
    );
  }

  if (result.status !== 0) {
    throw new Error(
      `${stage.label} failed with exit ${result.status ?? "unknown"}${result.signal ? ` (${result.signal})` : ""}.`
    );
  }

  console.log(`pass ${stage.label} (${durationMs}ms)`);
  return { id: stage.id, durationMs, status: "passed" };
}

await assertEntrypoints();
const mode = await dependencyMode();
const localSensitiveNames = await discoverSensitiveLocalEnvironmentNames();
const environment = createNonsecretEnvironment(localSensitiveNames);
const unmaskedSensitiveNames = Object.entries(environment)
  .filter(([name, value]) => sensitiveEnvironmentName.test(name) && Boolean(value))
  .map(([name]) => name);

if (mode === "missing" || mode === "invalid") {
  throw new Error(`Local dependency tree is ${mode}; direct-Node quality gates cannot run.`);
}

if (unmaskedSensitiveNames.length > 0) {
  throw new Error(
    `Nonsecret environment preparation failed for ${unmaskedSensitiveNames.length} sensitive variable names.`
  );
}

console.log(
  `pass SCRIMED direct-Node toolchain preflight: node=${process.version} dependency_mode=${mode} sensitive_values_present=0`
);

if (requestedOptions.has("--preflight")) {
  process.exit(0);
}

const stages = [
  {
    id: "cleanup",
    label: "generated-output cleanup",
    args: [entrypoints.cleanup, "--preserve-next-cache"],
    timeoutMs: 30_000
  },
  {
    id: "integrity",
    label: "generated integrity",
    args: [entrypoints.integrity],
    timeoutMs: 30_000
  },
  {
    id: "hygiene",
    label: "workspace hygiene",
    args: [entrypoints.workspaceHygiene],
    timeoutMs: 60_000
  },
  {
    id: "nonsecret",
    label: "nonsecret contract suite",
    args: [entrypoints.nonsecret],
    timeoutMs: 180_000
  },
  {
    id: "typecheck",
    label: "TypeScript typecheck",
    args: [entrypoints.typescript, "--noEmit"],
    timeoutMs: 180_000
  },
  {
    id: "lint",
    label: "ESLint",
    args: [entrypoints.eslint, "."],
    timeoutMs: 180_000
  }
];

if (!requestedOptions.has("--no-build")) {
  stages.push({
    id: "build",
    label: "Next.js production build",
    args: [entrypoints.next, "build", "--webpack"],
    timeoutMs: 600_000
  });
  stages.push({
    id: "postflight",
    label: "generated-output postflight",
    args: [entrypoints.postflight],
    timeoutMs: 60_000
  });
  stages.push({
    id: "built-public-release-verification",
    label: "built public release verification",
    args: [entrypoints.publicReleaseVerifier, "--require-build"],
    timeoutMs: 60_000
  });
}

stages.push({
  id: "post-build-integrity",
  label: "post-run generated integrity",
  args: [entrypoints.integrity],
  timeoutMs: 30_000
});

const startedAt = Date.now();
const results = [];

try {
  for (const stage of stages) {
    results.push(runStage(stage, environment));
  }
} catch (error) {
  console.error(`fail SCRIMED direct-Node quality runner: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

console.log(
  `\npass SCRIMED direct-Node quality runner: gates=${results.length} duration_ms=${Date.now() - startedAt} build=${
    requestedOptions.has("--no-build") ? "skipped-by-operator" : "passed"
  }`
);
