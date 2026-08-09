#!/usr/bin/env node

import { redactSensitive } from "./lib/aal2-token-policy.mjs";
import { access } from "node:fs/promises";
import { createRequire } from "node:module";

const baseUrl = (process.env.SCRIMED_BASE_URL ?? "http://127.0.0.1:3025").replace(/\/$/, "");
const syntheticSessionId = "work_session_care_coordination_synthetic";
const compiledMode = process.argv.includes("--compiled");
let compiledRoute = null;

if (compiledMode) {
  await access(".next/server/app/scrimed-control-plane/page.js");
  const require = createRequire(import.meta.url);
  const routeBundle = require("../.next/server/app/api/scrimed-control-plane/[[...path]]/route.js");
  compiledRoute = routeBundle.routeModule.userland;
  console.log("pass compiled /scrimed-control-plane page module");
}

async function request(path, init = {}) {
  if (compiledMode) {
    const prefix = "/api/scrimed-control-plane";
    if (!path.startsWith(prefix)) {
      throw new Error(`Compiled smoke cannot dispatch non-API path ${path}.`);
    }
    const suffix = path.slice(prefix.length).replace(/^\//, "");
    const routePath = suffix ? suffix.split("/") : undefined;
    const handler = (init.method ?? "GET") === "POST" ? compiledRoute?.POST : compiledRoute?.GET;
    if (!handler) throw new Error(`Compiled control-plane handler missing for ${init.method ?? "GET"}.`);
    return handler(new Request(`${baseUrl}${path}`, init), { params: Promise.resolve({ path: routePath }) });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    return await fetch(`${baseUrl}${path}`, { ...init, signal: controller.signal, redirect: "manual" });
  } catch (error) {
    throw new Error(redactSensitive(`Control-plane smoke could not reach ${path}: ${error instanceof Error ? error.message : String(error)}`));
  } finally {
    clearTimeout(timeout);
  }
}

async function requireGet(path, expectedText, contentType) {
  const response = await request(path);
  const body = await response.text();
  if (response.status !== 200) {
    throw new Error(`${path} expected 200 but received ${response.status}.`);
  }
  if (contentType && !(response.headers.get("content-type") ?? "").includes(contentType)) {
    throw new Error(`${path} missing expected content type ${contentType}.`);
  }
  if (!body.includes(expectedText)) {
    throw new Error(`${path} missing expected control-plane marker: ${expectedText}`);
  }
  if (/Bearer\s+eyJ[A-Za-z0-9_-]+\.|sk-[A-Za-z0-9_-]{12,}/.test(body)) {
    throw new Error(`${path} exposed a token-like value.`);
  }
  console.log(`pass GET ${path}`);
}

async function requireProtectedPost(path, body) {
  const response = await request(path, {
    method: "POST",
    headers: { "content-type": "application/json", "idempotency-key": "smoke-no-auth-control-plane" },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  if (![401, 403, 503].includes(response.status)) {
    throw new Error(`${path} expected fail-closed 401, 403, or 503 but received ${response.status}.`);
  }
  if (!text.includes('"ok":false')) {
    throw new Error(`${path} fail-closed response missing typed error envelope.`);
  }
  if (text.includes("smoke-no-auth-control-plane")) {
    throw new Error(`${path} echoed idempotency metadata unexpectedly.`);
  }
  console.log(`pass POST ${path} fail-closed (${response.status})`);
}

if (!compiledMode) {
  await requireGet("/scrimed-control-plane", "SCRIMED Intelligence Control Plane", "text/html");
}
await requireGet("/api/scrimed-control-plane", '"service":"scrimed-intelligence-control-plane"', "application/json");
await requireGet("/api/scrimed-control-plane/brief", "# SCRIMED Intelligence Control Plane", "text/markdown");
await requireGet("/api/scrimed-control-plane/sessions", '"sessions"', "application/json");
await requireGet(`/api/scrimed-control-plane/sessions/${syntheticSessionId}`, syntheticSessionId, "application/json");
await requireGet("/api/scrimed-control-plane/agents", '"agents"', "application/json");
await requireGet("/api/scrimed-control-plane/skills", '"skills"', "application/json");
await requireGet("/api/scrimed-control-plane/workflows", '"workflows"', "application/json");
await requireGet("/api/scrimed-control-plane/providers", '"policyProfiles"', "application/json");
await requireGet("/api/scrimed-control-plane/compute-resilience", '"scrimed-compute-resilience"', "application/json");
await requireGet("/api/scrimed-control-plane/capital-intelligence", '"outboundAllowed":false', "application/json");
await requireGet("/api/scrimed-control-plane/outcomes", '"baseline":null', "application/json");
await requireGet("/api/scrimed-control-plane/approvals", '"technicalGateAchieved":true', "application/json");
await requireGet("/api/scrimed-control-plane/platform-evidence", '"productionPromotionAllowed":false', "application/json");
await requireGet(
  "/api/scrimed-control-plane/platform-strategy",
  '"service":"scrimed-platform-capability-registry"',
  "application/json"
);

await requireProtectedPost("/api/scrimed-control-plane/sessions", {
  tenantId: "synthetic-tenant",
  organizationScope: "synthetic-health-system",
  workspaceDomain: "operations",
  title: "Synthetic smoke session",
  objective: "Prepare a synthetic metadata-only workflow brief.",
  requestedAutonomy: "recommend",
  riskLevel: "moderate",
  definitionOfDone: {
    goal: "Prepare a verified synthetic brief.",
    allowedScope: ["synthetic metadata"],
    prohibitedActions: ["external action"],
    requiredEvidence: ["citation"],
    successCriteria: ["schema valid"],
    stoppingConditions: ["missing evidence"],
    timeoutMs: 60000,
    maximumSteps: 5,
    maximumToolCalls: 5,
    maximumEstimatedCostUsd: 0.25,
    humanApprovalRequired: true,
    rollbackPlan: "Cancel draft and preserve audit evidence.",
    verificationChecks: ["schema", "citation", "policy"]
  }
});
await requireProtectedPost("/api/scrimed-control-plane/route-model", { taskType: "synthetic operations routing", consequence: "low" });
await requireProtectedPost("/api/scrimed-control-plane/context/search", { query: "synthetic care coordination evidence", tenantId: "synthetic-tenant" });
await requireProtectedPost(`/api/scrimed-control-plane/sessions/${syntheticSessionId}/verify`, {});
await requireProtectedPost(`/api/scrimed-control-plane/sessions/${syntheticSessionId}/approve`, {});
await requireProtectedPost("/api/scrimed-control-plane/benchmarks/run", { scores: {} });
await requireProtectedPost("/api/scrimed-control-plane/voice/simulate", { transcript: "Prepare a synthetic brief.", consentAcknowledged: true });

console.log("pass SCRIMED Intelligence Control Plane runtime smoke");
