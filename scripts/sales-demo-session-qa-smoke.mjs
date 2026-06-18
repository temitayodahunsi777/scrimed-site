#!/usr/bin/env node

import {
  analyzeSalesDemoSessionQaTokenFromEnv,
  formatSalesDemoSessionQaTokenReport
} from "./lib/sales-demo-session-qa-token-policy.mjs";

const baseUrl = (process.env.SCRIMED_BASE_URL ?? "https://app.scrimedsolutions.com").replace(/\/$/, "");
const bearerToken = process.env.SCRIMED_SALES_QA_BEARER_TOKEN?.trim();
const intakeId = process.env.SCRIMED_SALES_QA_INTAKE_ID?.trim();
const requireQa = ["1", "true", "yes"].includes(
  (process.env.SCRIMED_REQUIRE_SALES_QA ?? "").toLowerCase()
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

if (!bearerToken) {
  const message =
    "set SCRIMED_SALES_QA_BEARER_TOKEN to a short-lived tenant-admin AAL2 bearer token and SCRIMED_SALES_QA_INTAKE_ID to an explicit QA target";

  if (requireQa) {
    throw new Error(`sales demo session QA smoke required but no bearer token was provided; ${message}.`);
  }

  console.log(`skip sales demo session QA happy path: ${message}.`);
  process.exit(0);
}

if (!intakeId) {
  throw new Error(
    "sales demo session QA smoke requires SCRIMED_SALES_QA_INTAKE_ID when SCRIMED_SALES_QA_BEARER_TOKEN is supplied."
  );
}

const tokenPolicyResult = analyzeSalesDemoSessionQaTokenFromEnv(process.env);

if (!tokenPolicyResult.ok) {
  throw new Error(`sales demo session QA token preflight failed: ${tokenPolicyResult.errors.join(" ")}`);
}

for (const warning of tokenPolicyResult.warnings) {
  console.warn(`warn sales demo session QA token preflight: ${warning}`);
}

console.log(`pass sales demo session QA token preflight: ${formatSalesDemoSessionQaTokenReport(tokenPolicyResult)}`);

const response = await fetch(endpoint("/api/sales-operations/qa/buyer-demo-sessions"), {
  body: JSON.stringify({ intakeId }),
  headers: {
    Authorization: `Bearer ${bearerToken}`,
    "Content-Type": "application/json"
  },
  method: "POST"
});
const body = await readResponse(response);
const json = requireJson("sales demo session QA", body);

requireStatus("sales demo session QA", response.status, 200);

if (json.service !== "scrimed-sales-demo-session-qa") {
  throw new Error(`sales demo session QA expected service scrimed-sales-demo-session-qa but received ${json.service}.`);
}

if (json.status !== "passed") {
  throw new Error(`sales demo session QA expected passed but received ${json.status}.`);
}

if (!json.qaRun?.createdSessionId) {
  throw new Error("sales demo session QA did not return a createdSessionId.");
}

if (!json.qaRun?.packetAuditEventId) {
  throw new Error("sales demo session QA did not return a packetAuditEventId.");
}

if (
  json.qaRun.proofStackStatus !==
  "aal2-operator-buyer-demo-session-qa-short-lived-token-compatible"
) {
  throw new Error("sales demo session QA returned an unexpected proof-stack posture.");
}

console.log(`pass sales demo session QA session: ${json.qaRun.createdSessionId}`);
console.log(`pass sales demo session QA packet audit: ${json.qaRun.packetAuditEventId}`);
console.log("SCRIMED Sales Demo Session QA smoke completed.");
