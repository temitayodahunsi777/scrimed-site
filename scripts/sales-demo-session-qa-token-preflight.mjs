#!/usr/bin/env node

import {
  analyzeSalesDemoSessionQaTokenFromEnv,
  formatSalesDemoSessionQaTokenReport
} from "./lib/sales-demo-session-qa-token-policy.mjs";

const bearerToken = process.env.SCRIMED_SALES_QA_BEARER_TOKEN?.trim();
const requireQa = ["1", "true", "yes"].includes(
  (process.env.SCRIMED_REQUIRE_SALES_QA ?? "").toLowerCase()
);

if (!bearerToken) {
  const message =
    "set SCRIMED_SALES_QA_BEARER_TOKEN and SCRIMED_SALES_QA_INTAKE_ID only for a deliberate short-lived AAL2 QA run";

  if (requireQa) {
    throw new Error(`sales demo session QA token preflight required but no bearer token was provided; ${message}.`);
  }

  console.log(`skip sales demo session QA token preflight: ${message}.`);
  process.exit(0);
}

const result = analyzeSalesDemoSessionQaTokenFromEnv(process.env);

if (!result.ok) {
  throw new Error(`sales demo session QA token preflight failed: ${result.errors.join(" ")}`);
}

for (const warning of result.warnings) {
  console.warn(`warn sales demo session QA token preflight: ${warning}`);
}

console.log(`pass sales demo session QA token preflight: ${formatSalesDemoSessionQaTokenReport(result)}`);
