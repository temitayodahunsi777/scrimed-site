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
        `boundary-release evidence intake smoke could not reach ${endpoint(path)}. Verify SCRIMED_BASE_URL, local server state, or approved network access. ${message}.${cause}`
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

function requireContentType(label, response, expected) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes(expected)) {
    throw new Error(`${label} expected content-type containing ${expected} but received ${contentType}.`);
  }
}

function requireHeader(label, response, headerName, expected) {
  const actual = response.headers.get(headerName);

  if (actual !== expected) {
    throw new Error(`${label} expected ${headerName}=${expected} but received ${actual}.`);
  }
}

function requireProtectedBoundary(label, response) {
  const dataBoundary = response.headers.get("x-scrimed-data-boundary");
  const releaseAuthority = response.headers.get("x-scrimed-release-authority");
  const phiAuthority = response.headers.get("x-scrimed-phi-authority");
  const clinicalCareAuthority = response.headers.get("x-scrimed-clinical-care-authority");

  if (dataBoundary !== "synthetic-only") {
    throw new Error(`${label} expected synthetic-only data boundary but received ${dataBoundary}.`);
  }

  if (releaseAuthority !== "not-authorized-boundary-release") {
    throw new Error(`${label} expected release authority to remain blocked but received ${releaseAuthority}.`);
  }

  if (phiAuthority !== "not-authorized-production-phi") {
    throw new Error(`${label} expected PHI authority to remain blocked but received ${phiAuthority}.`);
  }

  if (clinicalCareAuthority !== "not-authorized-live-care") {
    throw new Error(`${label} expected clinical care authority to remain blocked but received ${clinicalCareAuthority}.`);
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

function externalSystemForBoundary(boundaryId) {
  if (boundaryId === "live-phi" || boundaryId === "ehr-writeback") {
    return "security-grc";
  }

  if (
    boundaryId === "clinical-decision-support" ||
    boundaryId === "autonomous-clinical-action" ||
    boundaryId === "clinical-research-outcomes-learning"
  ) {
    return "external-secure-channel";
  }

  if (boundaryId === "customer-go-live") {
    return "customer-procurement-portal";
  }

  if (boundaryId === "security-certification-claims") {
    return "counsel-data-room";
  }

  return "external-secure-channel";
}

const matrixResult = await request("/api/boundary-release-approvals");
requireStatus("boundary release approval matrix", matrixResult.response.status, 200, matrixResult.body);
requireContentType("boundary release approval matrix", matrixResult.response, "application/json");
const matrixBody = requireJson("boundary release approval matrix", matrixResult.body);

const workItem =
  matrixBody.evidenceWorkQueue?.find(
    (item) =>
      item?.boundaryId === "live-phi" &&
      item?.kind === "approval-step-evidence" &&
      item?.workItemHash?.length === 64
  ) ?? matrixBody.evidenceWorkQueue?.find((item) => item?.workItemHash?.length === 64);

if (!workItem?.id || !workItem?.workItemHash || !workItem?.boundaryId) {
  throw new Error("Boundary Release Approval Matrix did not expose a valid metadata-only evidence work item.");
}

const protectedPath = `/api/pilot-workspaces/${workspaceSlug}/boundary-release-evidence-intake`;
const packetPath = `${protectedPath}/packet`;
const payload = {
  workItemId: workItem.id,
  workItemHash: workItem.workItemHash,
  externalReferenceLabel: "Smoke boundary evidence reference",
  externalSystem: externalSystemForBoundary(workItem.boundaryId),
  referenceLocator: `security-grc:boundary-intake-smoke-${Date.now().toString(36)}`,
  referenceOwner: "qualified security reviewer",
  evidenceRetainedExternally: true,
  rawEvidenceStoredInScrimed: false,
  boundaryReleaseRequested: false,
  clinicalAuthorityRequested: false,
  humanReviewStatus: "queued",
  attestation: "boundary-release-evidence-intake-no-phi",
  reviewNote: "smoke metadata only boundary intake"
};

const unauthRead = await request(protectedPath);
requireStatus("unauthenticated boundary-release evidence intake read", unauthRead.response.status, [401, 503], unauthRead.body);
requireContentType("unauthenticated boundary-release evidence intake read", unauthRead.response, "application/json");
requireProtectedBoundary("unauthenticated boundary-release evidence intake read", unauthRead.response);
console.log(
  `pass unauthenticated boundary-release evidence intake read fail-closed: ${unauthRead.response.status} ${unauthRead.response.statusText}`
);

const unauthWrite = await request(protectedPath, {
  body: JSON.stringify(payload),
  headers: { "Content-Type": "application/json" },
  method: "POST"
});
requireStatus("unauthenticated boundary-release evidence intake write", unauthWrite.response.status, [401, 503], unauthWrite.body);
requireContentType("unauthenticated boundary-release evidence intake write", unauthWrite.response, "application/json");
requireProtectedBoundary("unauthenticated boundary-release evidence intake write", unauthWrite.response);
console.log(
  `pass unauthenticated boundary-release evidence intake write fail-closed: ${unauthWrite.response.status} ${unauthWrite.response.statusText}`
);

const unauthPacket = await request(packetPath);
requireStatus(
  "unauthenticated boundary-release evidence intake packet",
  unauthPacket.response.status,
  [401, 503],
  unauthPacket.body
);
requireContentType("unauthenticated boundary-release evidence intake packet", unauthPacket.response, "application/json");
requireProtectedBoundary("unauthenticated boundary-release evidence intake packet", unauthPacket.response);
console.log(
  `pass unauthenticated boundary-release evidence intake packet fail-closed: ${unauthPacket.response.status} ${unauthPacket.response.statusText}`
);

if (!bearerToken) {
  const missingTokenMessage =
    "set SCRIMED_BEARER_TOKEN to a tenant-admin, pilot-lead, or reviewer AAL2 bearer token";

  if (requireAuthenticatedSmoke) {
    failClosed(
      `authenticated boundary-release evidence intake smoke required but no bearer token was provided; ${missingTokenMessage}.`
    );
  }

  console.log(`skip authenticated boundary-release evidence intake happy path: ${missingTokenMessage}.`);
  process.exit(0);
}

const tokenAnalysis = analyzeAal2BearerToken({ bearerToken, workspaceSlug });

if (!tokenAnalysis.ok) {
  const tokenFailureMessage = `authenticated boundary-release evidence intake token preflight failed: ${tokenAnalysis.errors.join(" ")}`;

  if (requireAuthenticatedSmoke) {
    failClosed(tokenFailureMessage);
  }

  console.log(`skip authenticated boundary-release evidence intake happy path: ${redactSensitive(tokenFailureMessage)}`);
  process.exit(0);
}

for (const warning of tokenAnalysis.warnings) {
  console.warn(`warn authenticated boundary-release evidence intake token preflight: ${redactSensitive(warning)}`);
}

console.log(`pass authenticated boundary-release evidence intake token preflight: ${formatAal2TokenReport(tokenAnalysis)}`);

const authHeaders = {
  Authorization: `Bearer ${bearerToken}`,
  "Content-Type": "application/json"
};

const authRead = await request(protectedPath, {
  headers: { Authorization: `Bearer ${bearerToken}` }
});
requireStatus("authenticated boundary-release evidence intake read", authRead.response.status, 200, authRead.body);
requireContentType("authenticated boundary-release evidence intake read", authRead.response, "application/json");
requireProtectedBoundary("authenticated boundary-release evidence intake read", authRead.response);
const authReadBody = requireJson("authenticated boundary-release evidence intake read", authRead.body);

if (
  authReadBody.service !== "scrimed-protected-boundary-release-evidence-intake" ||
  authReadBody.status !== "protected-boundary-release-evidence-intake-aal2-metadata-only"
) {
  throw new Error("authenticated boundary-release evidence intake read returned unexpected service/status.");
}

if (authReadBody.summary?.rawEvidenceAccepted !== false) {
  throw new Error("authenticated boundary-release evidence intake read must not accept raw evidence.");
}

console.log(`pass authenticated boundary-release evidence intake read: ${authReadBody.summary?.workItemCount ?? 0} work items`);

const authWrite = await request(protectedPath, {
  body: JSON.stringify(payload),
  headers: authHeaders,
  method: "POST"
});
requireStatus("authenticated boundary-release evidence intake write", authWrite.response.status, 201, authWrite.body);
requireContentType("authenticated boundary-release evidence intake write", authWrite.response, "application/json");
requireProtectedBoundary("authenticated boundary-release evidence intake write", authWrite.response);

if (authWrite.response.headers.get("x-scrimed-boundary-release-evidence-persisted") !== "true") {
  throw new Error("authenticated boundary-release evidence intake write did not expose persisted evidence header.");
}

const authWriteBody = requireJson("authenticated boundary-release evidence intake write", authWrite.body);

if (!authWriteBody.referenceId) {
  throw new Error("authenticated boundary-release evidence intake write did not return a protected reference id.");
}

if (
  authWriteBody.intake?.rawEvidenceStoredInScrimed !== false ||
  authWriteBody.intake?.boundaryReleaseRequested !== false ||
  authWriteBody.intake?.clinicalAuthorityRequested !== false ||
  authWriteBody.intake?.releaseAuthority !== "not-authorized-boundary-release"
) {
  throw new Error("authenticated boundary-release evidence intake write weakened preserved safety boundaries.");
}

const linkedQueueItem = authWriteBody.queue?.find((item) => item.id === workItem.id);

if (!linkedQueueItem || linkedQueueItem.linkedReferenceCount < 1 || linkedQueueItem.rawEvidenceAccepted !== false) {
  throw new Error("authenticated boundary-release evidence intake write did not link the metadata reference to the work item.");
}

console.log(`pass authenticated boundary-release evidence intake metadata reference: ${authWriteBody.referenceId}`);

const authPacket = await request(packetPath, {
  headers: { Authorization: `Bearer ${bearerToken}` }
});
requireStatus("authenticated boundary-release evidence intake packet", authPacket.response.status, 200, authPacket.body);
requireContentType("authenticated boundary-release evidence intake packet", authPacket.response, "text/markdown");
requireProtectedBoundary("authenticated boundary-release evidence intake packet", authPacket.response);
requireHeader(
  "authenticated boundary-release evidence intake packet",
  authPacket.response,
  "x-scrimed-proof-stack",
  "aal2-audited-boundary-release-evidence-intake-packets-no-phi"
);

if (!authPacket.body.text.includes("# SCRIMED Protected Boundary Release Evidence Intake Packet")) {
  throw new Error("authenticated boundary-release evidence intake packet did not include the expected title.");
}

for (const expected of [
  "Release authority: not-authorized-boundary-release",
  "PHI authority: not-authorized-production-phi",
  "Clinical care authority: not-authorized-live-care",
  "Raw evidence accepted: false",
  "No work item can relieve boundary: true",
  "This packet is metadata-only. It is not a release approval"
]) {
  if (!authPacket.body.text.includes(expected)) {
    throw new Error(`authenticated boundary-release evidence intake packet is missing safety text: ${expected}`);
  }
}

console.log("pass authenticated boundary-release evidence intake packet: text/markdown no-PHI diligence artifact");
console.log("SCRIMED Boundary Release Evidence Intake authenticated smoke completed.");
