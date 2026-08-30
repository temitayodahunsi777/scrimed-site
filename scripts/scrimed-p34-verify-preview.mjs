#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { p34RuntimeEvidencePath, sha256 } from "./lib/p34-candidate-state.mjs";

function parseTarget(value) {
  if (!value) throw new Error("Set TARGET_URL to the exact p.34 Vercel preview origin.");
  const url = new URL(value);
  if (
    url.protocol !== "https:"
    || !url.hostname.endsWith(".vercel.app")
    || url.username
    || url.password
    || url.pathname !== "/"
    || url.search
    || url.hash
  ) throw new Error("TARGET_URL must be a bare HTTPS vercel.app preview origin; production aliases are prohibited.");
  return url.origin;
}

function run(id, script, args, env) {
  const startedAt = Date.now();
  const result = spawnSync(process.execPath, [script, ...args], {
    encoding: "utf8",
    shell: false,
    timeout: 20 * 60 * 1_000,
    maxBuffer: 64 * 1024 * 1024,
    env
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  return {
    id,
    passed: result.status === 0 && !result.error,
    exitCode: result.status ?? null,
    durationMs: Date.now() - startedAt,
    outputFingerprint: sha256(`${result.stdout ?? ""}\n${result.stderr ?? ""}`)
  };
}

const targetUrl = parseTarget(process.env.TARGET_URL ?? process.env.SCRIMED_P34_PREVIEW_URL);
const manifest = JSON.parse(await readFile(p34RuntimeEvidencePath, "utf8"));
if (manifest.dirty) throw new Error("Preview verification requires evidence generated from a clean exact candidate commit.");
const buildStartedAt = Date.now();
const buildResponse = await fetch(`${targetUrl}/api/build-info`, {
  redirect: "error",
  signal: AbortSignal.timeout(20_000),
  headers: { Accept: "application/json" }
});
if (buildResponse.status !== 200) throw new Error(`Preview build-info returned ${buildResponse.status}.`);
const buildInfo = await buildResponse.json();
const buildInfoLatencyMs = Date.now() - buildStartedAt;
if (buildInfo.commitSha !== manifest.commit) {
  throw new Error(`Preview commit mismatch: expected ${manifest.commit}, received ${buildInfo.commitSha ?? "unbound"}.`);
}
if (buildInfo.environment !== "preview") throw new Error(`Expected Vercel preview environment, received ${buildInfo.environment}.`);
if (buildInfo.nodeMajor !== 24) throw new Error(`Expected Node 24 preview, received ${buildInfo.nodeMajor}.`);

const env = { ...process.env, SCRIMED_BASE_URL: targetUrl, SCRIMED_PREVIEW_BASE_URL: targetUrl };
const checks = [
  run("public-smoke", "scripts/public-production-smoke.mjs", [], env),
  run("desktop-mobile-browser", "scripts/verify-preview-ui.mjs", [
    `--base-url=${targetUrl}`,
    "--canonical-origin=https://app.scrimedsolutions.com",
    "--output-dir=artifacts/ui-verification/p34-exact-preview",
    "--strict"
  ], env)
];
const passed = checks.every((check) => check.passed);
const reportBase = {
  schemaVersion: "scrimed-p34-exact-preview-verification-v1",
  status: passed ? "EXACT_NONPRODUCTION_PREVIEW_VERIFIED_ACCEPTANCE_REQUIRED" : "PREVIEW_VERIFICATION_FAILED_CLOSED",
  targetUrl,
  commit: manifest.commit,
  tree: manifest.tree,
  candidateFingerprint: manifest.candidateFingerprint,
  sourceFingerprint: manifest.sourceFingerprint,
  deploymentCommit: buildInfo.commitSha,
  runtime: buildInfo.runtime,
  nodeMajor: buildInfo.nodeMajor,
  environment: buildInfo.environment,
  checks,
  productionAliasAttached: false,
  dataBoundary: "synthetic-no-phi",
  aal2Status: "OPERATOR_ACTION_REQUIRED",
  releaseStewardAcceptanceStatus: "OPERATOR_ACTION_REQUIRED",
  productionAuthorityGranted: false,
  customerActivationAuthorized: false
};
const report = { ...reportBase, previewFingerprint: sha256(reportBase) };
await mkdir("artifacts/release", { recursive: true });
await writeFile("artifacts/release/p34-preview-verification.json", `${JSON.stringify(report, null, 2)}\n`, "utf8");
const observabilityBase = {
  schemaVersion: "scrimed-p40-preview-observability-v1",
  status: passed
    ? "AUTOMATED_OBSERVABILITY_COMPLETE_RELEASE_STEWARD_ACCEPTANCE_REQUIRED"
    : "PREVIEW_OBSERVABILITY_FAILED_CLOSED",
  targetUrl,
  deploymentId: manifest.preview?.deploymentId ?? null,
  commit: manifest.commit,
  tree: manifest.tree,
  candidateFingerprint: manifest.candidateFingerprint,
  sourceFingerprint: manifest.sourceFingerprint,
  environment: buildInfo.environment,
  nodeMajor: buildInfo.nodeMajor,
  buildInfoLatencyMs,
  routesCovered: [
    "/",
    "/product",
    "/synthetic-pilot",
    "/scrimed-p34",
    "/api/health",
    "/api/readiness",
    "/api/build-info",
    "/api/scrimed-control-plane/review-readiness",
    "/api/synthetic-pilot"
  ],
  checks,
  desktopAndMobile390Covered: checks.find((check) => check.id === "desktop-mobile-browser")?.passed === true,
  publicAndProtectedApiBoundaryCovered: checks.find((check) => check.id === "public-smoke")?.passed === true,
  productionAliasAttached: false,
  releaseStewardAcceptanceRequired: true,
  productionAuthorityGranted: false,
  phiAuthorized: false
};
const observability = { ...observabilityBase, observabilityFingerprint: sha256(observabilityBase) };
await mkdir("artifacts/vercel", { recursive: true });
await writeFile("artifacts/vercel/p40-observability.json", `${JSON.stringify(observability, null, 2)}\n`, "utf8");
if (!passed) process.exitCode = 1;
else console.log(`pass exact nonproduction preview verification fingerprint=${report.previewFingerprint}`);
