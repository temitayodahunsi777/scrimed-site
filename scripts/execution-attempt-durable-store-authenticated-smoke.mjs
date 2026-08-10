#!/usr/bin/env node

import { analyzeAal2BearerToken, formatAal2TokenReport, redactSensitive } from "./lib/aal2-token-policy.mjs";
import { loadLocalEnv } from "./lib/local-env.mjs";

loadLocalEnv();

const baseUrl = (process.env.SCRIMED_BASE_URL ?? "https://app.scrimedsolutions.com").replace(/\/$/, "");
const workspaceSlug = process.env.SCRIMED_WORKSPACE_SLUG ?? "atlas-synthetic-evaluation";
const bearerToken = process.env.SCRIMED_BEARER_TOKEN?.trim();
const region = process.env.SCRIMED_EXECUTION_ATTEMPT_DEFAULT_REGION ?? "us";
const requireAuthenticatedSmoke = ["1", "true", "yes"].includes(
  (process.env.SCRIMED_REQUIRE_AUTHENTICATED_SMOKE ?? "").toLowerCase()
) || process.argv.includes("--strict");

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
        `durable-store smoke could not reach ${endpoint(path)}. Verify SCRIMED_BASE_URL, local server state, or approved network access. ${message}.${cause}`
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

function requireDurableBoundary(label, response) {
  const boundary = response.headers.get("x-scrimed-data-boundary");

  if (boundary !== "synthetic-and-metadata-only") {
    throw new Error(`${label} expected x-scrimed-data-boundary synthetic-and-metadata-only but received ${boundary}.`);
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

const summaryResult = await request("/api/workflows/execution-attempts/durable-store");
requireStatus("durable-store public summary", summaryResult.response.status, 200, summaryResult.body);
requireDurableBoundary("durable-store public summary", summaryResult.response);

const summary = requireJson("durable-store public summary", summaryResult.body);

if (summary.status !== "execution-attempt-durable-store-contract-active-no-phi") {
  throw new Error(`durable-store public summary returned unexpected status ${summary.status}.`);
}

const sampleAttempt = Array.isArray(summary.sampleRecordableAttempts)
  ? summary.sampleRecordableAttempts[0]
  : null;

if (!sampleAttempt?.attemptId || !sampleAttempt?.idempotencyKey || !sampleAttempt?.replayToken) {
  throw new Error("durable-store public summary did not expose a no-PHI sample recordable attempt.");
}

const unauthHeaders = { "Content-Type": "application/json" };
const unauthRecord = await request("/api/workflows/execution-attempts/durable-store/record", {
  body: JSON.stringify({
    workspaceSlug,
    attemptId: sampleAttempt.attemptId,
    region
  }),
  headers: unauthHeaders,
  method: "POST"
});
requireStatus("unauthenticated durable-store record", unauthRecord.response.status, [401, 503], unauthRecord.body);
requireDurableBoundary("unauthenticated durable-store record", unauthRecord.response);
console.log(
  `pass unauthenticated durable-store record fail-closed: ${unauthRecord.response.status} ${unauthRecord.response.statusText}`
);

const unauthReplay = await request("/api/workflows/execution-attempts/durable-store/replay", {
  body: JSON.stringify({
    workspaceSlug,
    idempotencyKey: sampleAttempt.idempotencyKey
  }),
  headers: unauthHeaders,
  method: "POST"
});
requireStatus("unauthenticated durable-store replay", unauthReplay.response.status, [401, 503], unauthReplay.body);
requireDurableBoundary("unauthenticated durable-store replay", unauthReplay.response);
console.log(
  `pass unauthenticated durable-store replay fail-closed: ${unauthReplay.response.status} ${unauthReplay.response.statusText}`
);

const unauthReview = await request("/api/workflows/execution-attempts/durable-store/review-disposition", {
  body: JSON.stringify({
    workspaceSlug,
    attemptId: sampleAttempt.attemptId,
    disposition: "escalated",
    reviewerRole: "Governance reviewer",
    reasonCode: "unauthenticated-smoke",
    reviewNote: "Unauthenticated durable-store smoke must remain fail-closed.",
    humanReviewAttestation: "no-phi-human-review-no-clinical-authority"
  }),
  headers: unauthHeaders,
  method: "POST"
});
requireStatus("unauthenticated durable-store review", unauthReview.response.status, [401, 503], unauthReview.body);
requireDurableBoundary("unauthenticated durable-store review", unauthReview.response);
console.log(
  `pass unauthenticated durable-store review fail-closed: ${unauthReview.response.status} ${unauthReview.response.statusText}`
);

if (!bearerToken) {
  const missingTokenMessage =
    "set SCRIMED_BEARER_TOKEN to a tenant-admin, pilot-lead, or reviewer AAL2 bearer token";

  if (requireAuthenticatedSmoke) {
    failClosed(`authenticated durable-store smoke required but no bearer token was provided; ${missingTokenMessage}.`);
  }

  console.log(`skip authenticated durable-store happy path: ${missingTokenMessage}.`);
  process.exit(0);
}

const tokenAnalysis = analyzeAal2BearerToken({ bearerToken, workspaceSlug });

if (!tokenAnalysis.ok) {
  const tokenFailureMessage = `authenticated durable-store smoke token preflight failed: ${tokenAnalysis.errors.join(" ")}`;

  if (requireAuthenticatedSmoke) {
    failClosed(tokenFailureMessage);
  }

  console.log(`skip authenticated durable-store happy path: ${redactSensitive(tokenFailureMessage)}`);
  process.exit(0);
}

for (const warning of tokenAnalysis.warnings) {
  console.warn(`warn authenticated durable-store smoke token preflight: ${redactSensitive(warning)}`);
}

console.log(`pass authenticated durable-store token preflight: ${formatAal2TokenReport(tokenAnalysis)}`);

if (summary.protectedWritesEnabled !== true) {
  const disabledMessage =
    "SCRIMED_EXECUTION_ATTEMPT_DURABLE_STORE_ENABLED is not true for the target app";

  if (requireAuthenticatedSmoke) {
    failClosed(`authenticated durable-store smoke required but protected writes are disabled; ${disabledMessage}.`);
  }

  console.log(`skip authenticated durable-store happy path: ${disabledMessage}.`);
  process.exit(0);
}

const authHeaders = {
  Authorization: `Bearer ${bearerToken}`,
  "Content-Type": "application/json"
};
const retentionUntil = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

const recordResult = await request("/api/workflows/execution-attempts/durable-store/record", {
  body: JSON.stringify({
    workspaceSlug,
    attemptId: sampleAttempt.attemptId,
    region,
    retentionUntil
  }),
  headers: authHeaders,
  method: "POST"
});
requireStatus("authenticated durable-store record", recordResult.response.status, [200, 201], recordResult.body);
requireDurableBoundary("authenticated durable-store record", recordResult.response);

const recordBody = requireJson("authenticated durable-store record", recordResult.body);

if (!recordBody.record?.id || recordBody.record?.noPhiAssertion !== true) {
  throw new Error("authenticated durable-store record did not return a no-PHI durable record.");
}

console.log(`pass authenticated durable-store record: ${recordBody.record.id}`);

const idempotentResult = await request("/api/workflows/execution-attempts/durable-store/record", {
  body: JSON.stringify({
    workspaceSlug,
    attemptId: sampleAttempt.attemptId,
    region,
    retentionUntil
  }),
  headers: authHeaders,
  method: "POST"
});
requireStatus("authenticated durable-store idempotent record", idempotentResult.response.status, 200, idempotentResult.body);

const idempotentBody = requireJson("authenticated durable-store idempotent record", idempotentResult.body);

if (idempotentBody.status !== "execution-attempt-idempotent-replay") {
  throw new Error("authenticated durable-store idempotent retry did not reuse the existing attempt.");
}

console.log(`pass authenticated durable-store idempotency reuse: ${idempotentBody.eventId}`);

const replayResult = await request("/api/workflows/execution-attempts/durable-store/replay", {
  body: JSON.stringify({
    workspaceSlug,
    idempotencyKey: sampleAttempt.idempotencyKey
  }),
  headers: authHeaders,
  method: "POST"
});
requireStatus("authenticated durable-store replay", replayResult.response.status, 200, replayResult.body);

const replayBody = requireJson("authenticated durable-store replay", replayResult.body);

if (replayBody.status !== "execution-attempt-metadata-replayed" || !replayBody.eventId) {
  throw new Error("authenticated durable-store replay did not return replay metadata and an event id.");
}

console.log(`pass authenticated durable-store replay: ${replayBody.eventId}`);

const reviewResult = await request("/api/workflows/execution-attempts/durable-store/review-disposition", {
  body: JSON.stringify({
    workspaceSlug,
    attemptId: sampleAttempt.attemptId,
    disposition: "escalated",
    reviewerRole: "Governance reviewer",
    reasonCode: "authenticated-smoke",
    reviewNote:
      "Authenticated no-PHI durable-store smoke recorded human review disposition after replay.",
    humanReviewAttestation: "no-phi-human-review-no-clinical-authority"
  }),
  headers: authHeaders,
  method: "POST"
});
requireStatus("authenticated durable-store review disposition", reviewResult.response.status, 201, reviewResult.body);

const reviewBody = requireJson("authenticated durable-store review disposition", reviewResult.body);

if (!reviewBody.dispositionId || !reviewBody.eventId) {
  throw new Error("authenticated durable-store review disposition did not return disposition and event ids.");
}

console.log(`pass authenticated durable-store review disposition: ${reviewBody.dispositionId}`);
console.log("safe evidence workflowKind=execution-attempt-durable-store-qa");
console.log(`safe evidence workspaceTarget=${workspaceSlug}`);
console.log(`safe evidence durableRecordId=${recordBody.record.id}`);
console.log(`safe evidence reviewAuditEventId=${reviewBody.eventId}`);
console.log("SCRIMED execution-attempt durable-store authenticated smoke completed.");
