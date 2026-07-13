#!/usr/bin/env node

import { redactSensitive } from "./lib/aal2-token-policy.mjs";

const baseUrl = (process.env.SCRIMED_BASE_URL ?? "https://app.scrimedsolutions.com").replace(/\/$/, "");

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

async function request(path) {
  let response;

  try {
    response = await fetch(endpoint(path));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const cause = error instanceof Error && error.cause instanceof Error ? ` Cause: ${error.cause.message}` : "";

    throw new Error(
      redactSensitive(`deployment drift target smoke could not reach ${endpoint(path)}. ${message}.${cause}`)
    );
  }

  const body = await readResponse(response);
  return { body, response };
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

function requireHeader(label, response, header, expected) {
  const actual = response.headers.get(header);

  if (actual !== expected) {
    throw new Error(`${label} expected ${header} ${expected} but received ${actual}.`);
  }
}

const api = await request("/api/deployment-drift-guard");
requireStatus("deployment drift guard API", api.response.status, 200);
requireHeader(
  "deployment drift guard API",
  api.response,
  "x-scrimed-deployment-drift-guard",
  "deployment-drift-guard-active-no-secret-route-alignment"
);
requireHeader(
  "deployment drift guard API",
  api.response,
  "x-scrimed-phi-authority",
  "not-authorized-production-phi"
);
requireHeader(
  "deployment drift guard API",
  api.response,
  "x-scrimed-deployment-authority",
  "not-deployed-by-this-route"
);

const body = requireJson("deployment drift guard API", api.body);

if (body.service !== "scrimed-deployment-drift-guard") {
  throw new Error(`deployment drift guard expected service scrimed-deployment-drift-guard but received ${body.service}.`);
}

if (body.dataBoundary !== "synthetic-and-metadata-only") {
  throw new Error(`deployment drift guard expected synthetic-and-metadata-only boundary but received ${body.dataBoundary}.`);
}

if (body.deploymentAuthority !== "not-deployed-by-this-route") {
  throw new Error(`deployment drift guard expected no deploy authority but received ${body.deploymentAuthority}.`);
}

if (!Array.isArray(body.guardRoutes) || body.guardRoutes.length < 5) {
  throw new Error("deployment drift guard expected at least five guarded routes.");
}

for (const route of body.guardRoutes) {
  if (!route.path || !Number.isInteger(route.expectedStatus)) {
    throw new Error("deployment drift guard route is missing path or expectedStatus.");
  }

  const result = await request(route.path);
  requireStatus(`deployment drift target route ${route.path}`, result.response.status, route.expectedStatus);
  console.log(`pass deployment drift route ${route.path}: ${result.response.status}`);
}

const brief = await request("/api/deployment-drift-guard/brief");
requireStatus("deployment drift guard brief", brief.response.status, 200);

if (!(brief.response.headers.get("content-type") ?? "").includes("text/markdown")) {
  throw new Error("deployment drift guard brief expected text/markdown content-type.");
}

if (/SCRIMED_BEARER_TOKEN\s*=|Bearer\s+eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(brief.body.text)) {
  throw new Error("deployment drift guard brief must not expose bearer token values.");
}

console.log("pass deployment drift target smoke");
