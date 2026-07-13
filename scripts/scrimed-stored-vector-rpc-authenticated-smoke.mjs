#!/usr/bin/env node

import { analyzeAal2BearerToken, formatAal2TokenReport, redactSensitive } from "./lib/aal2-token-policy.mjs";
import { loadLocalEnv } from "./lib/local-env.mjs";

loadLocalEnv();

const baseUrl = (process.env.SCRIMED_BASE_URL ?? "https://app.scrimedsolutions.com").replace(/\/$/, "");
const workspaceSlug = process.env.SCRIMED_WORKSPACE_SLUG ?? "atlas-synthetic-evaluation";
const bearerToken = process.env.SCRIMED_BEARER_TOKEN?.trim();
const requireAuthenticatedSmoke =
  ["1", "true", "yes"].includes((process.env.SCRIMED_REQUIRE_AUTHENTICATED_SMOKE ?? "").toLowerCase()) ||
  process.argv.includes("--strict");
const route = "/api/scrimed-build-roadmap/stored-vector-rpc-smoke";

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
        `stored-vector RPC smoke could not reach ${endpoint(path)}. Verify SCRIMED_BASE_URL, local server state, deployment state, or approved network access. ${message}.${cause}`
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

function requireStoredVectorBoundary(label, response) {
  const boundary = response.headers.get("x-scrimed-data-boundary");
  const embeddingReturn = response.headers.get("x-scrimed-embedding-return");

  if (boundary !== "synthetic-no-phi-only") {
    throw new Error(`${label} expected x-scrimed-data-boundary synthetic-no-phi-only but received ${boundary}.`);
  }

  if (embeddingReturn !== "disabled") {
    throw new Error(`${label} expected x-scrimed-embedding-return disabled but received ${embeddingReturn}.`);
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

const unauthResult = await request(route, {
  body: JSON.stringify({
    workspaceSlug,
    syntheticOnly: true,
    noPhiAssertion: true
  }),
  headers: { "Content-Type": "application/json" },
  method: "POST"
});
requireStatus("unauthenticated stored-vector RPC smoke", unauthResult.response.status, [401, 503], unauthResult.body);
requireStoredVectorBoundary("unauthenticated stored-vector RPC smoke", unauthResult.response);
console.log(
  `pass unauthenticated stored-vector RPC smoke fail-closed: ${unauthResult.response.status} ${unauthResult.response.statusText}`
);

if (!bearerToken) {
  const missingTokenMessage =
    "set SCRIMED_BEARER_TOKEN to a tenant-admin or pilot-lead AAL2 bearer token for vector registration";

  if (requireAuthenticatedSmoke) {
    failClosed(`authenticated stored-vector RPC smoke required but no bearer token was provided; ${missingTokenMessage}.`);
  }

  console.log(`skip authenticated stored-vector RPC happy path: ${missingTokenMessage}.`);
  process.exit(0);
}

const tokenAnalysis = analyzeAal2BearerToken({ bearerToken, workspaceSlug });

if (!tokenAnalysis.ok) {
  const tokenFailureMessage = `stored-vector RPC smoke token preflight failed: ${tokenAnalysis.errors.join(" ")}`;

  if (requireAuthenticatedSmoke) {
    failClosed(tokenFailureMessage);
  }

  console.log(`skip authenticated stored-vector RPC happy path: ${redactSensitive(tokenFailureMessage)}`);
  process.exit(0);
}

for (const warning of tokenAnalysis.warnings) {
  console.warn(`warn stored-vector RPC smoke token preflight: ${redactSensitive(warning)}`);
}

console.log(`pass stored-vector RPC smoke token preflight: ${formatAal2TokenReport(tokenAnalysis)}`);

const authenticatedResult = await request(route, {
  body: JSON.stringify({
    workspaceSlug,
    syntheticOnly: true,
    noPhiAssertion: true
  }),
  headers: {
    Authorization: `Bearer ${bearerToken}`,
    "Content-Type": "application/json"
  },
  method: "POST"
});

if (authenticatedResult.response.status === 503 && !requireAuthenticatedSmoke) {
  const body = requireJson("authenticated stored-vector RPC smoke skip response", authenticatedResult.body);
  const message = body?.error?.message ?? "target app is not configured for protected stored-vector RPC writes";

  console.log(`skip authenticated stored-vector RPC happy path: ${redactSensitive(message)}.`);
  process.exit(0);
}

requireStatus("authenticated stored-vector RPC smoke", authenticatedResult.response.status, 201, authenticatedResult.body);
requireStoredVectorBoundary("authenticated stored-vector RPC smoke", authenticatedResult.response);

const smoke = requireJson("authenticated stored-vector RPC smoke", authenticatedResult.body);

if (
  smoke.status !== "stored-vector-rpc-smoke-passed" ||
  smoke.syntheticOnly !== true ||
  smoke.noPhiAssertion !== true ||
  smoke.embeddingReturned !== false ||
  smoke.humanReviewRequired !== true ||
  typeof smoke.sourceVectorId !== "string" ||
  typeof smoke.targetVectorId !== "string" ||
  typeof smoke.evidenceEnvelopeHash !== "string" ||
  typeof smoke.outputHash !== "string" ||
  typeof smoke.targetMatchScore !== "number" ||
  smoke.targetMatchScore < 0.99
) {
  throw new Error("authenticated stored-vector RPC smoke did not return the expected synthetic no-PHI evidence contract.");
}

console.log(
  `pass authenticated stored-vector RPC smoke: source=${smoke.sourceVectorId} target=${smoke.targetVectorId} match=${smoke.targetMatchScore}`
);
console.log("SCRIMED stored-vector RPC authenticated smoke completed.");
