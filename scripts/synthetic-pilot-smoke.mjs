#!/usr/bin/env node

import {
  boundedPublicFetch,
  normalizePublicSmokeBaseUrl,
  parsePublicSmokeMaxResponseBytes,
  parsePublicSmokeTimeoutMs,
  readBoundedResponseText
} from "./lib/bounded-public-fetch.mjs";

const baseUrl = normalizePublicSmokeBaseUrl(
  process.env.SCRIMED_BASE_URL,
  "http://127.0.0.1:3000"
);
const timeoutMs = parsePublicSmokeTimeoutMs(process.env.SCRIMED_SMOKE_REQUEST_TIMEOUT_MS);
const maxBytes = parsePublicSmokeMaxResponseBytes(process.env.SCRIMED_SMOKE_MAX_RESPONSE_BYTES);

async function get(path) {
  const response = await boundedPublicFetch(`${baseUrl}${path}`, {}, {
    timeoutMs,
    maxAttempts: 2
  });
  const text = await readBoundedResponseText(response, maxBytes, { timeoutMs });
  if (response.status !== 200) throw new Error(`${path} returned HTTP ${response.status}.`);
  return { response, text };
}

function parseJson(path, text) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${path} did not return valid JSON.`);
  }
}

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

const page = await get("/synthetic-pilot");
for (const required of [
  "SCRIMED Synthetic Workflow Pilot",
  "SYNTHETIC / NON-PRODUCTION",
  "No PHI",
  "Customer activation"
]) requireValue(page.text.includes(required), `/synthetic-pilot missing ${required}.`);

const pilotResponse = await get("/api/synthetic-pilot");
const pilot = parseJson("/api/synthetic-pilot", pilotResponse.text);
requireValue(pilot.status === "READY", "Synthetic pilot readiness is not READY.");
requireValue(pilot.package?.noPhi === true, "Synthetic pilot no-PHI boundary is missing.");
requireValue(pilot.package?.nonproduction === true, "Synthetic pilot nonproduction boundary is missing.");
requireValue(pilot.budgetDecision?.status === "PASS", "Synthetic pilot budget did not pass.");
requireValue(pilot.commercialReadiness?.customerActivation === "BLOCKED", "Customer activation is not blocked.");
requireValue(pilot.evidencePack?.bindingQuoteAuthorized === false, "Binding quote authority must remain false.");
requireValue(pilot.evidencePack?.productionAuthorityGranted === false, "Production authority must remain false.");
requireValue(
  pilotResponse.response.headers.get("x-scrimed-authority") === "no-production-authority",
  "Synthetic pilot API is missing its no-production-authority header."
);

const reviewResponse = await get("/api/scrimed-control-plane/review-readiness");
const reviewEnvelope = parseJson("/api/scrimed-control-plane/review-readiness", reviewResponse.text);
requireValue(reviewEnvelope.ok === true, "Review readiness envelope must be successful.");
const review = reviewEnvelope.data;
requireValue(review && typeof review === "object", "Review readiness envelope is missing data.");
requireValue(review.review?.independentlyVerifiedByRuntime === false, "Runtime must not self-verify human review.");
requireValue(review.mergeAuthority?.granted === false, "Merge authority must remain false.");
requireValue(review.productionAuthorityGranted === false, "Review readiness must not grant production authority.");

const healthResponse = await get("/api/health");
const health = parseJson("/api/health", healthResponse.text);
requireValue(health.scope === "process-and-application-health-only", "Health scope is ambiguous.");
requireValue(health.productionReadinessClaimed === false, "Health must not claim production readiness.");

const readinessResponse = await get("/api/readiness");
const readiness = parseJson("/api/readiness", readinessResponse.text);
requireValue(
  readiness.scope === "current-environment-operational-readiness-only",
  "Readiness scope is ambiguous."
);
requireValue(readiness.currentEnvironmentOnly === true, "Readiness must be environment-scoped.");
requireValue(readiness.productionReadinessClaimed === false, "Readiness must not claim production readiness.");
requireValue(readiness.productionReleaseAuthorized === false, "Production release authority must remain false.");

console.log(`pass synthetic pilot HTTP smoke (${baseUrl}, no PHI, no production authority)`);
