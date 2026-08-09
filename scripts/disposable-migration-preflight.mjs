#!/usr/bin/env node

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

const args = new Set(process.argv.slice(2));
const allowedArgs = new Set(["--execute", "--json", "--self-test", "--strict"]);
const unknownArgs = [...args].filter((arg) => !allowedArgs.has(arg));
if (unknownArgs.length) {
  throw new Error(`Unsupported disposable migration option: ${unknownArgs.join(", ")}`);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function commandPath(command) {
  const result = spawnSync("/usr/bin/which", [command], {
    encoding: "utf8",
    shell: false
  });
  return result.status === 0 ? result.stdout.trim() : null;
}

export function classifyDisposableToolchain(input) {
  const missing = Object.entries(input)
    .filter(([, value]) => !value)
    .map(([name]) => name);
  return {
    ready: missing.length === 0,
    missing,
    status: missing.length === 0 ? "READY" : "ENVIRONMENT_UNAVAILABLE"
  };
}

function runNode(argsToRun) {
  return spawnSync(process.execPath, argsToRun, {
    cwd: process.cwd(),
    encoding: "utf8",
    shell: false,
    maxBuffer: 16 * 1024 * 1024
  });
}

if (args.has("--self-test")) {
  assert.deepEqual(
    classifyDisposableToolchain({ supabase: "/bin/supabase", docker: "/bin/docker" }),
    { ready: true, missing: [], status: "READY" }
  );
  assert.deepEqual(
    classifyDisposableToolchain({ supabase: null, docker: "/bin/docker" }).missing,
    ["supabase"]
  );
  console.log("pass SCRIMED disposable migration preflight self-test");
  process.exit(0);
}

const staticResult = runNode([
  "scripts/pending-migration-authorization-check.mjs",
  "--json",
  "--strict"
]);
if (staticResult.status !== 0) {
  process.stderr.write(staticResult.stderr || staticResult.stdout);
  process.exit(staticResult.status ?? 1);
}
const staticReport = JSON.parse(staticResult.stdout);
const exactSet = staticReport.migrations.map(({ path, actualSha256 }) => ({
  path,
  sha256: actualSha256
}));
const authorizationToken = sha256(JSON.stringify(exactSet));
const tools = {
  supabase: commandPath("supabase"),
  docker: commandPath("docker")
};
const toolchain = classifyDisposableToolchain(tools);
const executionRequested = args.has("--execute");
const authorizationMatches =
  process.env.SCRIMED_DISPOSABLE_MIGRATION_AUTHORIZATION === authorizationToken;

let execution = {
  attempted: false,
  passed: false,
  status: toolchain.ready ? "NOT_REQUESTED" : "ENVIRONMENT_UNAVAILABLE",
  migrationListObserved: false,
  outputDigest: null
};

if (executionRequested) {
  if (!toolchain.ready) {
    execution = { ...execution, status: "ENVIRONMENT_UNAVAILABLE" };
  } else if (!authorizationMatches) {
    execution = { ...execution, status: "EXACT_SET_AUTHORIZATION_REQUIRED" };
  } else {
    const statusResult = spawnSync(tools.supabase, ["status", "--output", "json"], {
      cwd: process.cwd(),
      encoding: "utf8",
      shell: false
    });
    if (statusResult.status !== 0) {
      execution = { ...execution, attempted: true, status: "LOCAL_STACK_UNAVAILABLE" };
    } else {
      const resetResult = spawnSync(
        tools.supabase,
        ["db", "reset", "--local", "--no-seed"],
        { cwd: process.cwd(), encoding: "utf8", shell: false, maxBuffer: 32 * 1024 * 1024 }
      );
      const migrationList = spawnSync(
        tools.supabase,
        ["migration", "list", "--local"],
        { cwd: process.cwd(), encoding: "utf8", shell: false }
      );
      const safeOutput = `${resetResult.stdout ?? ""}\n${migrationList.stdout ?? ""}`
        .replace(/[A-Za-z0-9+/=_-]{32,}/g, "[REDACTED]");
      execution = {
        attempted: true,
        passed: resetResult.status === 0 && migrationList.status === 0,
        status:
          resetResult.status === 0 && migrationList.status === 0
            ? "DISPOSABLE_DRY_RUN_PASSED"
            : "DISPOSABLE_DRY_RUN_FAILED",
        migrationListObserved: migrationList.status === 0,
        outputDigest: sha256(safeOutput)
      };
    }
  }
}

const reportWithoutHash = {
  service: "scrimed-disposable-migration-preflight",
  staticPacketFingerprint: staticReport.packetFingerprint,
  migrationSetAuthorizationToken: authorizationToken,
  migrationCount: exactSet.length,
  migrations: staticReport.migrations.map((migration) => ({
    path: migration.path,
    sha256: migration.actualSha256,
    staticReviewPassed: migration.staticReviewPassed,
    staticClassification: migration.staticReviewPassed ? "READY" : "NEEDS_REVISION",
    dryRunClassification: execution.passed ? "DRY-RUN PASSED" : "BLOCKED"
  })),
  toolchain: {
    ...toolchain,
    tools: Object.fromEntries(
      Object.entries(tools).map(([name, value]) => [name, Boolean(value)])
    )
  },
  execution,
  productionConnectionAllowed: false,
  productionMigrationAuthorized: false,
  nextAction: execution.passed
    ? "Obtain named database-owner approval bound to this exact migration set and candidate."
    : "Run with an isolated local Supabase stack and the exact printed authorization token; never target production."
};
const report = {
  ...reportWithoutHash,
  reportFingerprint: sha256(JSON.stringify(reportWithoutHash))
};

if (args.has("--json")) console.log(JSON.stringify(report, null, 2));
else {
  console.log(
    `${execution.passed ? "pass" : "blocked"} SCRIMED disposable migration preflight: ${execution.status}`
  );
  console.log(
    `migrations=${report.migrationCount} authorization_token=${authorizationToken} report=${report.reportFingerprint.slice(0, 16)}`
  );
  if (toolchain.missing.length) console.log(`missing_toolchain=${toolchain.missing.join(",")}`);
  console.log("production_connection_allowed=false production_migration_authorized=false");
}

if (args.has("--strict") && !execution.passed) process.exitCode = 1;
