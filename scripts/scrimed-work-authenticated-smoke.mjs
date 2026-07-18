#!/usr/bin/env node

import { randomUUID } from "node:crypto";
import { analyzeAal2BearerToken, formatAal2TokenReport, redactSensitive } from "./lib/aal2-token-policy.mjs";
import { loadLocalEnv } from "./lib/local-env.mjs";

loadLocalEnv();

const baseUrl = (process.env.SCRIMED_BASE_URL ?? "https://app.scrimedsolutions.com").replace(/\/$/, "");
const workspaceSlug = process.env.SCRIMED_WORKSPACE_SLUG ?? process.env.SCRIMED_WORK_DEFAULT_WORKSPACE_SLUG ?? "atlas-synthetic-evaluation";
const bearerToken = process.env.SCRIMED_BEARER_TOKEN?.trim();
const strict = ["1", "true", "yes"].includes((process.env.SCRIMED_REQUIRE_AUTHENTICATED_SMOKE ?? "").toLowerCase()) || process.argv.includes("--strict");
const nonBrowserRequestContext = "operator-smoke-v1";

function endpoint(path) {
  return `${baseUrl}${path}`;
}

async function readResponse(response) {
  const text = await response.text();

  try {
    return { text, json: JSON.parse(text) };
  } catch {
    return { text, json: null };
  }
}

async function request(path, init = {}) {
  let response;

  try {
    response = await fetch(endpoint(path), init);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const cause = error instanceof Error && error.cause instanceof Error ? ` Cause: ${error.cause.message}` : "";

    throw new Error(
      redactSensitive(
        `SCRIMED Work smoke could not reach ${endpoint(path)}. Verify SCRIMED_BASE_URL, local server state, or approved network access. ${message}.${cause}`
      )
    );
  }

  const body = await readResponse(response);
  return { response, body };
}

function summarizeBody(body) {
  const value = body?.json ?? body?.text ?? "";
  const summary = typeof value === "string" ? value : JSON.stringify(value);

  return redactSensitive(summary).slice(0, 1200);
}

function requireStatus(label, actual, expected, body = null) {
  const expectedValues = Array.isArray(expected) ? expected : [expected];

  if (!expectedValues.includes(actual)) {
    const bodySummary = body ? ` Body: ${summarizeBody(body)}` : "";

    throw new Error(`${label} expected ${expectedValues.join(" or ")} but received ${actual}.${bodySummary}`);
  }
}

function requireJson(label, body) {
  if (!body.json || typeof body.json !== "object") {
    throw new Error(`${label} did not return JSON.`);
  }

  return body.json;
}

function failClosed(message) {
  console.error(redactSensitive(message));
  process.exit(1);
}

function buildSessionPayload(uniqueSuffix) {
  return {
    workspaceSlug,
    tenantId: "synthetic-tenant",
    organizationScope: "synthetic-health-system",
    workspaceDomain: "operations",
    title: `SCRIMED Work durable smoke ${uniqueSuffix}`,
    objective: "Prepare a no-PHI governed work-session record for durable-store validation.",
    requestedAutonomy: "recommend",
    riskLevel: "moderate",
    definitionOfDone: {
      goal: "Record a synthetic SCRIMED Work session with evidence, rollback, and human review metadata.",
      allowedScope: ["synthetic metadata", "durable audit event", "human review queue"],
      prohibitedActions: ["live PHI", "diagnosis", "treatment", "prescribing", "payer submission", "EHR writeback"],
      requiredEvidence: ["SCRIMED Work durable-store migration", "AAL2 governance token"],
      successCriteria: ["session persisted", "idempotency reused", "artifact draft recorded"],
      stoppingConditions: ["PHI detected", "missing idempotency", "authorization denied"],
      timeoutMs: 300000,
      maximumSteps: 8,
      maximumToolCalls: 5,
      maximumEstimatedCostUsd: 0.1,
      humanApprovalRequired: true,
      rollbackPlan: "Cancel the synthetic session, preserve metadata audit events, and do not distribute artifacts.",
      verificationChecks: ["schema validity", "citation presence", "policy compliance", "rollback readiness"]
    }
  };
}

const summaryResult = await request("/api/scrimed-work");
requireStatus("SCRIMED Work public summary", summaryResult.response.status, 200, summaryResult.body);

const summary = requireJson("SCRIMED Work public summary", summaryResult.body);
const summaryData = summary.data ?? summary;

if (summaryData.status !== "scrimed-work-intelligence-platform-active-synthetic-no-phi") {
  throw new Error(`SCRIMED Work public summary returned unexpected status ${summaryData.status}.`);
}

const unauthPayload = buildSessionPayload("unauthenticated-check");
const unauth = await request("/api/scrimed-work/sessions", {
  body: JSON.stringify(unauthPayload),
  headers: {
    "Content-Type": "application/json",
    "idempotency-key": `scrimed-work-unauth-${Date.now()}`,
    "x-scrimed-request-context": nonBrowserRequestContext,
    "x-scrimed-workspace-slug": workspaceSlug
  },
  method: "POST"
});
requireStatus("unauthenticated SCRIMED Work session create", unauth.response.status, [401, 503], unauth.body);
console.log(`pass unauthenticated SCRIMED Work session create fail-closed: ${unauth.response.status} ${unauth.response.statusText}`);

if (!bearerToken) {
  const missingTokenMessage = "set SCRIMED_BEARER_TOKEN to a tenant-admin, pilot-lead, or reviewer AAL2 bearer token";

  if (strict) {
    failClosed(`authenticated SCRIMED Work smoke required but no bearer token was provided; ${missingTokenMessage}.`);
  }

  console.log(`skip authenticated SCRIMED Work happy path: ${missingTokenMessage}.`);
  process.exit(0);
}

const tokenAnalysis = analyzeAal2BearerToken({ bearerToken, workspaceSlug });

if (!tokenAnalysis.ok) {
  const tokenFailureMessage = `authenticated SCRIMED Work smoke token preflight failed: ${tokenAnalysis.errors.join(" ")}`;

  if (strict) {
    failClosed(tokenFailureMessage);
  }

  console.log(`skip authenticated SCRIMED Work happy path: ${redactSensitive(tokenFailureMessage)}`);
  process.exit(0);
}

for (const warning of tokenAnalysis.warnings) {
  console.warn(`warn authenticated SCRIMED Work smoke token preflight: ${redactSensitive(warning)}`);
}

console.log(`pass authenticated SCRIMED Work token preflight: ${formatAal2TokenReport(tokenAnalysis)}`);

if (summaryData.persistence?.durableStoreEnabled !== true) {
  const disabledMessage = "SCRIMED_WORK_DURABLE_STORE_ENABLED is not true for the target app";

  if (strict) {
    failClosed(`authenticated SCRIMED Work smoke required but protected durable writes are disabled; ${disabledMessage}.`);
  }

  console.log(`skip authenticated SCRIMED Work happy path: ${disabledMessage}.`);
  process.exit(0);
}

const uniqueSuffix = randomUUID().replaceAll("-", "").slice(0, 12);
const createIdempotencyKey = `scrimed-work-create-${uniqueSuffix}`;
const authHeaders = {
  Authorization: `Bearer ${bearerToken}`,
  "Content-Type": "application/json",
  "idempotency-key": createIdempotencyKey,
  "x-scrimed-request-context": nonBrowserRequestContext,
  "x-scrimed-workspace-slug": workspaceSlug
};
const createPayload = buildSessionPayload(uniqueSuffix);

const createResult = await request("/api/scrimed-work/sessions", {
  body: JSON.stringify(createPayload),
  headers: authHeaders,
  method: "POST"
});
requireStatus("authenticated SCRIMED Work session create", createResult.response.status, [200, 201], createResult.body);

if (createResult.response.headers.get("x-scrimed-csrf-protection") !== "exact-same-origin-or-explicit-non-browser") {
  throw new Error("authenticated SCRIMED Work session create did not expose the request-provenance protection header.");
}

const rateLimitMode = createResult.response.headers.get("x-scrimed-rate-limit-mode");
const rateLimitProvider = createResult.response.headers.get("x-scrimed-rate-limit-provider");

if (createResult.response.headers.get("x-scrimed-rate-limit-decision") !== "allowed") {
  throw new Error("authenticated SCRIMED Work session create did not expose an allowed mutation rate-limit decision.");
}

if (
  !["distributed-required", "bounded-memory"].includes(rateLimitMode ?? "") ||
  (rateLimitMode === "distributed-required" && rateLimitProvider !== "upstash-redis") ||
  (rateLimitMode === "bounded-memory" && rateLimitProvider !== "bounded-memory")
) {
  throw new Error("authenticated SCRIMED Work session create returned an invalid mutation rate-limit provider posture.");
}

const createBody = requireJson("authenticated SCRIMED Work session create", createResult.body);
const createData = createBody.data;
const sessionId = createData?.session?.id;

if (!sessionId || createData?.durableStore?.persisted !== true) {
  throw new Error("authenticated SCRIMED Work session create did not return a durable persisted session.");
}

console.log(`pass authenticated SCRIMED Work session create: ${sessionId} rate_limit=${rateLimitMode}/${rateLimitProvider}`);

const idempotentResult = await request("/api/scrimed-work/sessions", {
  body: JSON.stringify(createPayload),
  headers: authHeaders,
  method: "POST"
});
requireStatus("authenticated SCRIMED Work idempotent create", idempotentResult.response.status, 200, idempotentResult.body);

const idempotentBody = requireJson("authenticated SCRIMED Work idempotent create", idempotentResult.body);

if (idempotentBody.data?.durableStore?.idempotentReplay !== true) {
  throw new Error("authenticated SCRIMED Work idempotent retry did not reuse the durable session.");
}

console.log(`pass authenticated SCRIMED Work idempotency reuse: ${idempotentBody.data.durableStore.eventId}`);

const protectedReadHeaders = {
  Authorization: `Bearer ${bearerToken}`,
  "x-scrimed-workspace-slug": workspaceSlug
};
const readResult = await request(`/api/scrimed-work/sessions/${sessionId}`, {
  headers: protectedReadHeaders
});
requireStatus("authenticated SCRIMED Work durable session read", readResult.response.status, 200, readResult.body);
const readBody = requireJson("authenticated SCRIMED Work durable session read", readResult.body);

if (readBody.data?.id !== sessionId) {
  throw new Error("authenticated SCRIMED Work durable session read did not return the authoritative session.");
}

console.log(`pass authenticated SCRIMED Work durable session read: ${sessionId}`);

const verificationResult = await request(`/api/scrimed-work/sessions/${sessionId}/verify`, {
  headers: protectedReadHeaders,
  method: "POST"
});
requireStatus("authenticated SCRIMED Work durable session verification", verificationResult.response.status, 200, verificationResult.body);
const verificationBody = requireJson("authenticated SCRIMED Work durable session verification", verificationResult.body);

if (
  verificationBody.data?.allPass !== false ||
  verificationBody.data?.eligibleForCompletion !== false ||
  !verificationBody.data?.failedCriteria?.includes("human-approval-state")
) {
  throw new Error("authenticated SCRIMED Work verification did not preserve the pending human-review completion gate.");
}

console.log("pass authenticated SCRIMED Work verification evidence: human review gate held");

const transitionResult = await request(`/api/scrimed-work/sessions/${sessionId}/plan`, {
  body: JSON.stringify({ workspaceSlug }),
  headers: {
    ...authHeaders,
    "idempotency-key": `scrimed-work-plan-${uniqueSuffix}`
  },
  method: "POST"
});
requireStatus("authenticated SCRIMED Work session plan", transitionResult.response.status, 200, transitionResult.body);

const transitionBody = requireJson("authenticated SCRIMED Work session plan", transitionResult.body);

if (transitionBody.data?.durableStore?.transitioned !== true) {
  throw new Error("authenticated SCRIMED Work plan transition did not record durable transition metadata.");
}

console.log(`pass authenticated SCRIMED Work durable transition: ${transitionBody.data.durableStore.eventId}`);

const transitionReplayResult = await request(`/api/scrimed-work/sessions/${sessionId}/plan`, {
  body: JSON.stringify({ workspaceSlug }),
  headers: {
    ...authHeaders,
    "idempotency-key": `scrimed-work-plan-${uniqueSuffix}`
  },
  method: "POST"
});
requireStatus("authenticated SCRIMED Work transition replay", transitionReplayResult.response.status, 200, transitionReplayResult.body);
const transitionReplayBody = requireJson("authenticated SCRIMED Work transition replay", transitionReplayResult.body);
if (transitionReplayBody.data?.durableStore?.idempotentReplay !== true) {
  throw new Error("authenticated SCRIMED Work transition replay did not reuse the durable lifecycle decision.");
}
console.log(`pass authenticated SCRIMED Work transition idempotency: ${transitionReplayBody.data.durableStore.eventId}`);

const invalidTransitionResult = await request(`/api/scrimed-work/sessions/${sessionId}/resume`, {
  body: JSON.stringify({ workspaceSlug }),
  headers: {
    ...authHeaders,
    "idempotency-key": `scrimed-work-invalid-resume-${uniqueSuffix}`
  },
  method: "POST"
});
requireStatus("authenticated SCRIMED Work invalid lifecycle transition", invalidTransitionResult.response.status, [409, 422], invalidTransitionResult.body);
console.log(`pass authenticated SCRIMED Work invalid lifecycle transition fail-closed: ${invalidTransitionResult.response.status}`);

const artifactResult = await request("/api/scrimed-work/artifacts", {
  body: JSON.stringify({
    workspaceSlug,
    sessionId,
    type: "executive-report",
    title: `SCRIMED Work smoke artifact ${uniqueSuffix}`
  }),
  headers: {
    ...authHeaders,
    "idempotency-key": `scrimed-work-artifact-${uniqueSuffix}`
  },
  method: "POST"
});
requireStatus("authenticated SCRIMED Work artifact create", artifactResult.response.status, [200, 201], artifactResult.body);

const artifactBody = requireJson("authenticated SCRIMED Work artifact create", artifactResult.body);

if (!artifactBody.data?.artifact?.artifactId || artifactBody.data?.durableStore?.persisted !== true) {
  throw new Error("authenticated SCRIMED Work artifact create did not return durable artifact metadata.");
}

console.log(`pass authenticated SCRIMED Work artifact create: ${artifactBody.data.artifact.artifactId}`);
console.log("SCRIMED Work authenticated durable-store smoke completed.");
