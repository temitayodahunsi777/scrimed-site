#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  getScrimedNodeRuntimeStatus,
  parseNodeMajor
} from "../app/lib/platform/nodeRuntime.ts";
import {
  getScrimedBuildInfo,
  getScrimedReleaseReadiness
} from "../app/lib/release/vercelReleaseAssurance.ts";
import {
  getProductConsoleApiSummary,
  getProductConsoleSummary,
  getProductRuntimePresentation
} from "../app/lib/productConsole.ts";
import { getScrimedPlatformGraph } from "../app/lib/scrimed-control-plane/platformGraph.ts";
import { buildDevelopmentContinuityPlan } from "../app/lib/scrimed-work/developmentContinuity.ts";
import { getScrimedOperatingCommandCenterSummary } from "../app/lib/scrimedOperatingCommandCenter.ts";
import { createTelemetryEvent } from "../app/lib/observability/logger.ts";
import { createScrimedRequestContext } from "../app/lib/observability/requestContext.ts";

const safeEnv = {
  NODE_ENV: "test",
  SCRIMED_SYNTHETIC_ONLY: "true",
  SCRIMED_ALLOW_PHI: "false",
  SCRIMED_LIVE_CLINICAL_EXECUTION: "false",
  SCRIMED_CONSEQUENTIAL_ACTIONS_ENABLED: "false",
  SCRIMED_EXTERNAL_PROVIDER_CALLS_ENABLED: "false",
  SCRIMED_AI_PROVIDER_CALLS_ENABLED: "false",
  SCRIMED_SCHEDULES_ENABLED: "false",
  PRIVATE_SECRET_THAT_MUST_NOT_LEAK: "synthetic-secret-marker"
};

assert.equal(parseNodeMajor("24.19.0"), 24);
assert.equal(getScrimedNodeRuntimeStatus({ env: safeEnv, runtimeVersion: "24.0.0" }).certified, true);
assert.equal(getScrimedNodeRuntimeStatus({ env: safeEnv, runtimeVersion: "22.0.0" }).runtimeUpgradeRequired, true);

const buildInfo = getScrimedBuildInfo(safeEnv, "24.0.0");
assert.equal(buildInfo.runtime, "nodejs");
assert.equal(buildInfo.nodeMajor, 24);
assert.equal(buildInfo.nodeTarget, "24.x");
assert.equal(buildInfo.productionReleaseAuthorized, false);
assert.equal(JSON.stringify(buildInfo).includes("synthetic-secret-marker"), false);

const previewBuildInfo = getScrimedBuildInfo(
  {
    ...safeEnv,
    VERCEL_ENV: "preview",
    VERCEL_GIT_COMMIT_SHA: "a".repeat(40),
    SCRIMED_PREVIEW_CANDIDATE_SHA256: "b".repeat(64),
    VERCEL_PROJECT_PRODUCTION_URL: "app.scrimedsolutions.com"
  },
  "24.0.0"
);
assert.equal(previewBuildInfo.candidateFingerprintDeclared, true);
assert.equal(previewBuildInfo.candidateFingerprintBound, false);
assert.equal(previewBuildInfo.candidateFingerprintVerificationStatus, "DECLARED_UNVERIFIED");
assert.deepEqual(getProductRuntimePresentation(previewBuildInfo), {
  runtimeCompatibilityLabel: "verified in preview",
  vercelBuildStatus: "preview active"
});
assert.deepEqual(getProductRuntimePresentation(buildInfo), {
  runtimeCompatibilityLabel: "certified locally",
  vercelBuildStatus: "preview pending"
});

const ready = getScrimedReleaseReadiness(safeEnv, "24.0.0");
assert.equal(ready.ok, true);
assert.equal(ready.checks.find((entry) => entry.id === "node24-runtime-certified")?.status, "pass");
assert.equal(getScrimedReleaseReadiness(safeEnv, "22.0.0").ok, false);
assert.equal(
  getScrimedReleaseReadiness({ ...safeEnv, SCRIMED_CONSEQUENTIAL_ACTIONS_ENABLED: "true" }, "24.0.0").ok,
  false
);

const context = createScrimedRequestContext({
  route: "/api/synthetic-test?patient=do-not-log",
  tenantId: "synthetic-tenant",
  workflowId: "synthetic-workflow"
});
const telemetry = createTelemetryEvent({
  ...context,
  event: "request",
  modelRoute: null,
  riskTier: "low",
  latencyMs: 25,
  status: "success",
  errorCategory: null,
  costCategory: "none"
});
assert.equal(telemetry.durationMs, 25);
assert.equal(telemetry.route, "/api/synthetic-test");
assert.equal(telemetry.operationalErrorCategory, null);
assert.equal(/^[0-9a-f]{64}$/.test(telemetry.releaseFingerprint), true);
assert.equal(JSON.stringify(telemetry).includes("synthetic-tenant"), false);

const graph = getScrimedPlatformGraph();
assert.equal(graph.validation.valid, true);
assert.equal(graph.nodes.some((entry) => entry.id === "runtime:nodejs-24"), true);

const continuity = buildDevelopmentContinuityPlan({ operatingMode: ready.operatingMode });
assert.equal(continuity.runtimeLifecycle.targetNodeMajor, 24);
assert.equal(continuity.runtimeLifecycle.riskInput, "none");

const commandCenter = getScrimedOperatingCommandCenterSummary();
assert.equal(commandCenter.runtimeStatus.targetNodeMajor, 24);

const budgets = JSON.parse(await readFile("config/performance-budgets.json", "utf8"));
const productConsoleApi = getProductConsoleApiSummary();
const productConsoleBytes = Buffer.byteLength(JSON.stringify(productConsoleApi));
const productConsoleFullBytes = Buffer.byteLength(JSON.stringify(getProductConsoleSummary()));
assert.equal(productConsoleApi.payloadProfile, "compact-api-v2");
assert.ok(
  productConsoleApi.healthcareOptimizationCommandSummary.blockedActions.includes(
    "live PHI processing"
  )
);
assert.equal(Boolean(productConsoleApi.executionAttemptEnvelopeSummary), true);
assert.equal(Boolean(productConsoleApi.healthcareIntelligenceOSSummary), true);
assert.equal(Boolean(productConsoleApi.strategicPlatformIntelligenceSummary), true);
assert.equal(
  productConsoleApi.strategicPlatformIntelligenceSummary.executionCommands.some(
    ({ slug }) => slug === "clinical-global-approval-command"
  ),
  true
);
assert.ok(productConsoleBytes <= budgets.budgets.productConsoleApiBytes);
assert.ok(productConsoleBytes <= productConsoleFullBytes * 0.4);

console.log(
  `pass SCRIMED Node 24 runtime policy tests (27 checks; Product Console API ${productConsoleBytes} bytes, full model ${productConsoleFullBytes} bytes)`
);
