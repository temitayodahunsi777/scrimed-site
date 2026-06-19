#!/usr/bin/env node

import {
  analyzeSalesDemoSessionQaTokenFromEnv,
  formatSalesDemoSessionQaTokenReport
} from "./lib/sales-demo-session-qa-token-policy.mjs";

const baseUrl = (process.env.SCRIMED_BASE_URL ?? "https://app.scrimedsolutions.com").replace(/\/$/, "");
const bearerToken = process.env.SCRIMED_SALES_QA_BEARER_TOKEN?.trim();
const intakeId = process.env.SCRIMED_SALES_QA_INTAKE_ID?.trim();
const requireQa = ["1", "true", "yes"].includes(
  (process.env.SCRIMED_REQUIRE_SALES_COMMAND_CENTER_QA ?? process.env.SCRIMED_REQUIRE_SALES_QA ?? "").toLowerCase()
);

function endpoint(path) {
  return `${baseUrl}${path}`;
}

async function readResponse(response) {
  const text = await response.text();

  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

function requireStatus(label, actual, expected) {
  const expectedValues = Array.isArray(expected) ? expected : [expected];

  if (!expectedValues.includes(actual)) {
    throw new Error(`${label} expected ${expectedValues.join(" or ")} but received ${actual}.`);
  }
}

function requireJson(label, body) {
  if (!body.json) {
    throw new Error(`${label} expected JSON response.`);
  }

  return body.json;
}

function requireBusinessBoundary(label, response) {
  const boundary = response.headers.get("x-scrimed-data-boundary");

  if (boundary !== "business-contact-and-workflow-scope-only") {
    throw new Error(
      `${label} expected x-scrimed-data-boundary business-contact-and-workflow-scope-only but received ${boundary}.`
    );
  }
}

const unauthenticatedTarget = intakeId ?? "smoke-test";
const unauthenticatedResponse = await fetch(
  endpoint(`/api/sales-operations/opportunities/${encodeURIComponent(unauthenticatedTarget)}/command-center`)
);
const unauthenticatedBody = await readResponse(unauthenticatedResponse);
requireStatus("unauthenticated Sales Command Center", unauthenticatedResponse.status, [401, 503]);
requireBusinessBoundary("unauthenticated Sales Command Center", unauthenticatedResponse);
requireJson("unauthenticated Sales Command Center", unauthenticatedBody);
console.log(
  `pass unauthenticated Sales Command Center fail-closed check: ${unauthenticatedResponse.status} ${unauthenticatedResponse.statusText}`
);

if (!bearerToken) {
  const message =
    "set SCRIMED_SALES_QA_BEARER_TOKEN to a short-lived tenant-admin AAL2 bearer token and SCRIMED_SALES_QA_INTAKE_ID to an explicit Sales Operations opportunity";

  if (requireQa) {
    throw new Error(`Sales Command Center QA smoke required but no bearer token was provided; ${message}.`);
  }

  console.log(`skip authenticated Sales Command Center happy path: ${message}.`);
  process.exit(0);
}

if (!intakeId) {
  throw new Error(
    "Sales Command Center QA smoke requires SCRIMED_SALES_QA_INTAKE_ID when SCRIMED_SALES_QA_BEARER_TOKEN is supplied."
  );
}

const tokenPolicyResult = analyzeSalesDemoSessionQaTokenFromEnv(process.env);

if (!tokenPolicyResult.ok) {
  throw new Error(`Sales Command Center token preflight failed: ${tokenPolicyResult.errors.join(" ")}`);
}

for (const warning of tokenPolicyResult.warnings) {
  console.warn(`warn Sales Command Center token preflight: ${warning}`);
}

console.log(`pass Sales Command Center token preflight: ${formatSalesDemoSessionQaTokenReport(tokenPolicyResult)}`);

const response = await fetch(
  endpoint(`/api/sales-operations/opportunities/${encodeURIComponent(intakeId)}/command-center`),
  {
    headers: {
      Authorization: `Bearer ${bearerToken}`
    }
  }
);
const body = await readResponse(response);
const json = requireJson("authenticated Sales Command Center", body);

requireStatus("authenticated Sales Command Center", response.status, 200);
requireBusinessBoundary("authenticated Sales Command Center", response);

if (json.service !== "scrimed-sales-command-center") {
  throw new Error(
    `Sales Command Center expected service scrimed-sales-command-center but received ${json.service}.`
  );
}

if (json.commandCenter?.status !== "opportunity-command-timeline-ready") {
  throw new Error(
    `Sales Command Center expected opportunity-command-timeline-ready but received ${json.commandCenter?.status}.`
  );
}

if (json.commandCenter?.proofStackStatus !== "aal2-sales-command-intelligence-timeline") {
  throw new Error("Sales Command Center returned an unexpected proof-stack posture.");
}

if (json.commandCenter?.safeMode?.dataBoundary !== "business-contact-workflow-and-synthetic-command-posture-only") {
  throw new Error("Sales Command Center returned an unexpected safe-mode data boundary.");
}

if (typeof json.commandCenter?.commercialReadiness?.score !== "number") {
  throw new Error("Sales Command Center did not return a commercial readiness score.");
}

if (typeof json.commandCenter?.commandPosture?.snapshotCount !== "number") {
  throw new Error("Sales Command Center did not return command snapshot posture.");
}

if (!Array.isArray(json.commandCenter?.timeline) || json.commandCenter.timeline.length < 1) {
  throw new Error("Sales Command Center did not return a retained opportunity timeline.");
}

if (!json.boundary?.includes("It does not accept PHI")) {
  throw new Error("Sales Command Center boundary did not preserve no-PHI language.");
}

console.log(`pass Sales Command Center opportunity: ${json.commandCenter.opportunity.intakeId}`);
console.log(`pass Sales Command Center readiness: ${json.commandCenter.commercialReadiness.score}%`);
console.log(`pass Sales Command Center timeline: ${json.commandCenter.timeline.length} retained events`);
console.log("SCRIMED Sales Command Center smoke completed.");
