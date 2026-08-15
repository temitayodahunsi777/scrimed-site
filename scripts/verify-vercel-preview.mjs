#!/usr/bin/env node

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const selfTest = args.includes("--self-test");
const strict = args.includes("--strict");
const json = args.includes("--json");
const valueArg = (name, fallback = null) =>
  args.find((argument) => argument.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const hash = (value) => createHash("sha256").update(String(value)).digest("hex");
const gitShaPattern = /^[0-9a-f]{40}$/i;

const expectedRoutes = [
  "/",
  "/validation-evidence",
  "/investor-demo-command-room",
  "/scrimed-proof-packet-studio",
  "/api/health",
  "/api/readiness",
  "/api/build-info"
];

const prohibitedClaims = [
  "autonomous diagnosis",
  "autonomous treatment",
  "clinically proven",
  "deployment ready",
  "dr. emily carter",
  "fda approved",
  "fda cleared",
  "hipaa compliant",
  "live clinical deployment",
  "predictive patient monitoring",
  "revolutionized our practice",
  "soc 2 certified",
  "world's first"
];

function normalizeOrigin(value) {
  if (!value) throw new Error("Preview verification requires a base URL.");
  const parsed = new URL(value);
  if (parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== "/") {
    throw new Error("Preview URL must be a credential-free bare origin.");
  }
  const local = new Set(["127.0.0.1", "localhost"]).has(parsed.hostname);
  if ((!local && parsed.protocol !== "https:") || (local && !new Set(["http:", "https:"]).has(parsed.protocol))) {
    throw new Error("Preview URL must use HTTPS except for localhost verification.");
  }
  return parsed.origin;
}

export function evaluateVercelPreviewEvidence(snapshot) {
  const failures = [];
  const build = snapshot.buildInfo;
  const health = snapshot.health;
  const readiness = snapshot.readiness;
  if (!gitShaPattern.test(snapshot.expectedCandidateSha)) failures.push("EXPECTED_CANDIDATE_SHA_INVALID");
  if (build.commitSha !== snapshot.expectedCandidateSha.toLowerCase()) failures.push("CANDIDATE_SHA_MISMATCH");
  if (build.environment !== "preview") failures.push("NON_PREVIEW_ENVIRONMENT");
  if (build.productionReleaseAuthorized !== false || build.customerActivationAuthorized !== false) failures.push("BUILD_AUTHORITY_BOUNDARY_FAILED");
  if (health.ok !== true || health.operatingMode !== "synthetic-no-phi") failures.push("HEALTH_BOUNDARY_FAILED");
  if (readiness.ok !== true || readiness.status !== "ready-synthetic-read-only") failures.push("READINESS_FAILED");
  if (readiness.productionReleaseAuthorized !== false || readiness.customerActivationAuthorized !== false || readiness.externalDistributionAuthorized !== false) {
    failures.push("READINESS_AUTHORITY_BOUNDARY_FAILED");
  }
  const mode = readiness.operatingMode ?? {};
  if (!mode.syntheticOnly || mode.allowPHI || mode.liveClinicalExecution || mode.productionEHRConnections || mode.medicalDeviceConnections) {
    failures.push("UNSAFE_OPERATING_MODE");
  }
  for (const route of snapshot.routes) {
    if (route.status < 200 || route.status >= 400) failures.push(`ROUTE_FAILED:${route.path}:${route.status}`);
    if (route.redirectLoop) failures.push(`REDIRECT_LOOP:${route.path}`);
  }
  const content = snapshot.publicHtml.toLowerCase().replaceAll("\u2019", "'");
  for (const phrase of prohibitedClaims) {
    if (content.includes(phrase)) failures.push(`PROHIBITED_CLAIM:${phrase}`);
  }
  if (!content.includes("synthetic") || !content.includes("no phi")) failures.push("PUBLIC_BOUNDARY_BANNER_MISSING");
  if (!snapshot.uiEvidence?.passed) failures.push("DESKTOP_MOBILE_UI_EVIDENCE_REQUIRED");
  if ((snapshot.uiEvidence?.consoleErrorCount ?? 1) > 0) failures.push("BROWSER_CONSOLE_ERRORS");
  if ((snapshot.uiEvidence?.http4xxCount ?? 1) > 0) failures.push("BROWSER_HTTP_4XX");
  if ((snapshot.uiEvidence?.http5xxCount ?? 1) > 0) failures.push("BROWSER_HTTP_5XX");

  return {
    passed: failures.length === 0,
    failures,
    checksPassed: 9 - new Set(failures.map((failure) => failure.split(":", 1)[0])).size,
    checkCount: 9
  };
}

if (selfTest) {
  const candidate = "a".repeat(40);
  const snapshot = {
    expectedCandidateSha: candidate,
    buildInfo: { commitSha: candidate, environment: "preview", productionReleaseAuthorized: false, customerActivationAuthorized: false },
    health: { ok: true, operatingMode: "synthetic-no-phi" },
    readiness: {
      ok: true,
      status: "ready-synthetic-read-only",
      productionReleaseAuthorized: false,
      customerActivationAuthorized: false,
      externalDistributionAuthorized: false,
      operatingMode: { syntheticOnly: true, allowPHI: false, liveClinicalExecution: false, productionEHRConnections: false, medicalDeviceConnections: false }
    },
    routes: expectedRoutes.map((route) => ({ path: route, status: 200, redirectLoop: false })),
    publicHtml: "Synthetic demonstration environment - no PHI - human review.",
    uiEvidence: { passed: true, consoleErrorCount: 0, http4xxCount: 0, http5xxCount: 0 }
  };
  assert.equal(evaluateVercelPreviewEvidence(snapshot).passed, true);
  assert.ok(evaluateVercelPreviewEvidence({ ...snapshot, buildInfo: { ...snapshot.buildInfo, commitSha: "b".repeat(40) } }).failures.includes("CANDIDATE_SHA_MISMATCH"));
  assert.ok(evaluateVercelPreviewEvidence({ ...snapshot, uiEvidence: null }).failures.includes("DESKTOP_MOBILE_UI_EVIDENCE_REQUIRED"));
  console.log("pass SCRIMED Vercel preview evidence verifier self-test");
  process.exit(0);
}

const baseUrl = normalizeOrigin(valueArg("base-url", process.env.SCRIMED_PREVIEW_BASE_URL));
const expectedCandidateSha = valueArg("candidate-sha", process.env.SCRIMED_PREVIEW_CANDIDATE_SHA)?.toLowerCase();
if (!gitShaPattern.test(expectedCandidateSha ?? "")) throw new Error("Preview verification requires an exact 40-character candidate SHA.");
const uiEvidencePath = valueArg("ui-evidence", "artifacts/ui-verification/preview-ui-verification.json");
let uiReport = null;
try {
  uiReport = JSON.parse(await readFile(uiEvidencePath, "utf8"));
} catch {
  // Strict evaluation below records the missing browser evidence without inventing a pass.
}

async function fetchBounded(route, responseType = "json") {
  const response = await fetch(`${baseUrl}${route}`, {
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
    headers: { Accept: responseType === "json" ? "application/json" : "text/html" }
  });
  const finalUrl = new URL(response.url);
  const redirectLoop = finalUrl.origin !== baseUrl || finalUrl.pathname !== route;
  return {
    status: response.status,
    redirectLoop,
    body: responseType === "json" ? await response.json() : await response.text()
  };
}

const [buildResponse, healthResponse, readinessResponse, homeResponse] = await Promise.all([
  fetchBounded("/api/build-info"),
  fetchBounded("/api/health"),
  fetchBounded("/api/readiness"),
  fetchBounded("/", "text")
]);
const routeResults = [];
for (const route of expectedRoutes) {
  const response = await fetch(`${baseUrl}${route}`, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(15_000) });
  const finalUrl = new URL(response.url);
  routeResults.push({ path: route, status: response.status, redirectLoop: finalUrl.origin !== baseUrl || finalUrl.pathname !== route });
}
const uiEvidence = uiReport
  ? {
      passed: uiReport.passed === true,
      consoleErrorCount: uiReport.results?.reduce((total, result) => total + (result.consoleErrors?.length ?? 0), 0) ?? 0,
      http4xxCount: uiReport.results?.reduce((total, result) => total + (result.http4xx?.length ?? 0), 0) ?? 0,
      http5xxCount: uiReport.results?.reduce((total, result) => total + (result.http5xx?.length ?? 0), 0) ?? 0,
      evidencePath: uiEvidencePath
    }
  : null;
const snapshot = {
  expectedCandidateSha,
  buildInfo: buildResponse.body,
  health: healthResponse.body,
  readiness: readinessResponse.body,
  routes: routeResults,
  publicHtml: homeResponse.body,
  uiEvidence
};
const evaluation = evaluateVercelPreviewEvidence(snapshot);
const report = {
  service: "scrimed-vercel-preview-evidence",
  version: "scrimed-vercel-preview-evidence-v1-2026-08-12",
  baseUrl,
  expectedCandidateSha,
  capturedAt: new Date().toISOString(),
  ...evaluation,
  routes: routeResults,
  buildInfo: snapshot.buildInfo,
  health: snapshot.health,
  readiness: snapshot.readiness,
  uiEvidence,
  target: "preview",
  productionPromotionPerformed: false,
  boundary: "Preview evidence only; no production promotion, migration, PHI processing, customer activation, or external distribution authority."
};
const output = { ...report, evidenceFingerprint: hash(JSON.stringify(report)) };
await mkdir(path.dirname(valueArg("output", "artifacts/vercel/vercel-preview-evidence.json")), { recursive: true });
await writeFile(valueArg("output", "artifacts/vercel/vercel-preview-evidence.json"), `${JSON.stringify(output, null, 2)}\n`, "utf8");
if (json) console.log(JSON.stringify(output, null, 2));
else console.log(`${output.passed ? "pass" : "blocked"} SCRIMED exact-candidate Vercel preview verification (${output.checksPassed}/${output.checkCount})`);
if (strict && !output.passed) process.exitCode = 1;
