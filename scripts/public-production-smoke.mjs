#!/usr/bin/env node

const baseUrl = (process.env.SCRIMED_BASE_URL ?? "https://app.scrimedsolutions.com").replace(/\/$/, "");
const workspaceSlug = process.env.SCRIMED_WORKSPACE_SLUG ?? "atlas-synthetic-evaluation";

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
  const response = await fetch(endpoint(path));
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

function requireContentType(label, response, expected) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes(expected)) {
    throw new Error(`${label} expected content-type containing ${expected} but received ${contentType}.`);
  }
}

function requireSyntheticBoundary(label, response) {
  const boundary = response.headers.get("x-scrimed-data-boundary");

  if (boundary !== "synthetic-only") {
    throw new Error(`${label} expected x-scrimed-data-boundary synthetic-only but received ${boundary}.`);
  }
}

async function checkHtml(path) {
  const result = await request(path);
  requireStatus(path, result.response.status, 200);
  requireContentType(path, result.response, "text/html");
  console.log(`pass html route ${path}: ${result.response.status}`);
}

async function checkProductConsole() {
  const result = await request("/api/product/console");
  requireStatus("product console", result.response.status, 200);
  requireContentType("product console", result.response, "application/json");
  const body = requireJson("product console", result.body);

  if (body.service !== "scrimed-product-console") {
    throw new Error(`product console expected service scrimed-product-console but received ${body.service}.`);
  }

  if (body.proofStack?.passkeyTenantAuthentication !== "passkey-or-magic-link-plus-aal2") {
    throw new Error("product console missing passkey tenant authentication proof-stack posture.");
  }

  if (body.proofStack?.passkeyManagement !== "self-service-list-rename-register-revoke") {
    throw new Error("product console missing passkey management proof-stack posture.");
  }

  if (body.proofStack?.enterpriseProofPackets !== "tenant-admin-aggregate-write-before-release") {
    throw new Error("product console missing enterprise proof packet proof-stack posture.");
  }

  if (body.proofStack?.tenantSessionVerification !== "browser-aal2-no-secret-protected-route-checks") {
    throw new Error("product console missing tenant-session verification proof-stack posture.");
  }

  if (body.proofStack?.pilotDemoReadinessCommandCenter !== "protected-workspace-demo-readiness-command-center") {
    throw new Error("product console missing pilot demo readiness command-center proof-stack posture.");
  }

  if (body.proofStack?.pilotDemoReadinessPackets !== "aal2-audited-demo-readiness-snapshot-packets") {
    throw new Error("product console missing pilot demo readiness packet proof-stack posture.");
  }

  if (body.proofStack?.publicProductionSmoke !== "no-secret-route-readiness-and-fail-closed-checks") {
    throw new Error("product console missing public production smoke proof-stack posture.");
  }

  if (body.salesOperationsSummary?.authentication !== "passkey-or-magic-link-plus-totp") {
    throw new Error("product console missing passkey-aware Sales Operations authentication posture.");
  }

  console.log("pass product console passkey posture");
}

async function checkReadiness() {
  const result = await request("/api/pilot-workspaces/readiness");
  requireStatus("protected pilot readiness", result.response.status, 200);
  requireContentType("protected pilot readiness", result.response, "application/json");
  const body = requireJson("protected pilot readiness", result.body);

  if (body.service !== "scrimed-protected-pilot-workspaces") {
    throw new Error(`protected pilot readiness expected service scrimed-protected-pilot-workspaces but received ${body.service}.`);
  }

  console.log("pass protected pilot readiness");
}

async function checkProtectedFailClosed(path, label) {
  const result = await request(path);
  requireStatus(label, result.response.status, [401, 503]);
  requireContentType(label, result.response, "application/json");
  requireSyntheticBoundary(label, result.response);
  console.log(`pass ${label} fail-closed: ${result.response.status} ${result.response.statusText}`);
}

await checkHtml("/pilot-workspace/access");
await checkHtml("/sales-operations");
await checkProductConsole();
await checkReadiness();
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/demo-readiness`,
  "Demo readiness snapshots protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/enterprise-proof-packet`,
  "Enterprise proof packet protected API"
);
await checkProtectedFailClosed(
  `/api/pilot-workspaces/${workspaceSlug}/trust-safety-incidents`,
  "TrustOps protected API"
);
await checkProtectedFailClosed(
  `/api/agent-workspaces/${workspaceSlug}/work-orders`,
  "Agent Workspace protected API"
);

console.log("pass public production smoke");
