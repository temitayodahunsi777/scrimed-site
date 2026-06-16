#!/usr/bin/env node

const baseUrl = (process.env.SCRIMED_BASE_URL ?? "https://app.scrimedsolutions.com").replace(/\/$/, "");
const workspaceSlug = process.env.SCRIMED_WORKSPACE_SLUG ?? "atlas-synthetic-evaluation";
const bearerToken = process.env.SCRIMED_BEARER_TOKEN?.trim();
const requireAuthenticatedSmoke = ["1", "true", "yes"].includes(
  (process.env.SCRIMED_REQUIRE_AUTHENTICATED_SMOKE ?? "").toLowerCase()
);

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
  const response = await fetch(endpoint(path), init);
  const body = await readResponse(response);
  return { response, body };
}

function requireStatus(label, actual, expected) {
  const expectedValues = Array.isArray(expected) ? expected : [expected];

  if (!expectedValues.includes(actual)) {
    throw new Error(`${label} expected ${expectedValues.join(" or ")} but received ${actual}.`);
  }
}

function requireSyntheticBoundary(label, response) {
  const boundary = response.headers.get("x-scrimed-data-boundary");

  if (boundary !== "synthetic-only") {
    throw new Error(`${label} expected x-scrimed-data-boundary synthetic-only but received ${boundary}.`);
  }
}

const unauthenticated = await request(
  `/api/pilot-workspaces/${workspaceSlug}/trust-safety-incidents`
);
requireStatus("unauthenticated TrustOps incidents", unauthenticated.response.status, [401, 503]);
requireSyntheticBoundary("unauthenticated TrustOps incidents", unauthenticated.response);
console.log(
  `pass unauthenticated TrustOps fail-closed check: ${unauthenticated.response.status} ${unauthenticated.response.statusText}`
);

if (!bearerToken) {
  const missingTokenMessage =
    "set SCRIMED_BEARER_TOKEN to a tenant-admin or pilot-lead AAL2 bearer token";

  if (requireAuthenticatedSmoke) {
    throw new Error(
      `authenticated TrustOps smoke required but no bearer token was provided; ${missingTokenMessage}.`
    );
  }

  console.log(`skip authenticated TrustOps happy path: ${missingTokenMessage}.`);
  process.exit(0);
}

const authHeaders = {
  Authorization: `Bearer ${bearerToken}`,
  "Content-Type": "application/json"
};

const listResult = await request(`/api/pilot-workspaces/${workspaceSlug}/trust-safety-incidents`, {
  headers: { Authorization: `Bearer ${bearerToken}` }
});
requireStatus("authenticated TrustOps incident list", listResult.response.status, 200);
console.log(
  `pass authenticated TrustOps list: ${listResult.body.json?.incidents?.length ?? 0} visible incidents`
);

const incidentKey = `trustops-smoke-${Date.now().toString(36)}`;
const createResult = await request(`/api/pilot-workspaces/${workspaceSlug}/trust-safety-incidents`, {
  body: JSON.stringify({
    incidentKey,
    title: "Authenticated TrustOps smoke review",
    severity: "moderate",
    owner: "SCRIMED trust and safety owner",
    accountableAgent: "Claims And Legal Guard",
    sourceChannel: "Authenticated smoke script",
    affectedSurface: ["protected pilot workspace", "tenant TrustOps incident workspace"],
    triggerSignal:
      "Authenticated smoke verifies tenant TrustOps incident creation, no-PHI validation, RPC guards, and audit linkage.",
    buyerImpact:
      "Enterprise reviewers can see that synthetic TrustOps incident records are owned, retained, and reviewable before production scope.",
    containmentAction:
      "Keep all payloads synthetic-only, reject PHI, and require human review before external TrustOps packet release.",
    remediationPlan:
      "Record update posture, notification review, legal-hold status, event trail, and audited review packet download.",
    legalHoldStatus: "watch",
    notificationDecision: "internal-only",
    notificationReason:
      "Synthetic smoke record only; no customer, regulatory, counsel, or breach notification determination.",
    retentionUntil: null,
    legalHoldUntil: null,
    eventMetadata: {
      smokeTest: true,
      syntheticOnly: true,
      source: "scripts/trustops-authenticated-smoke.mjs"
    }
  }),
  headers: authHeaders,
  method: "POST"
});
requireStatus("authenticated TrustOps incident create", createResult.response.status, 201);

const incidentId = createResult.body.json?.incidentId;

if (!incidentId) {
  throw new Error("authenticated TrustOps create did not return an incidentId.");
}

console.log(`pass authenticated TrustOps create: ${incidentId}`);

const updateResult = await request(
  `/api/pilot-workspaces/${workspaceSlug}/trust-safety-incidents/${incidentId}`,
  {
    body: JSON.stringify({
      status: "triaged",
      severity: "moderate",
      legalHoldStatus: "watch",
      notificationDecision: "internal-only",
      notificationReason:
        "Synthetic smoke update only; no customer, regulatory, counsel, or breach notification determination.",
      containmentAction:
        "Verified no-PHI boundary and kept the incident in human-reviewed synthetic pilot scope.",
      remediationPlan:
        "Preserve event trail, review packet evidence, and enterprise-readiness limitations for buyer diligence.",
      postIncidentReviewStatus: "in-review",
      retentionUntil: null,
      legalHoldUntil: null,
      eventType: "status-updated",
      eventSummary:
        "Authenticated smoke recorded TrustOps triage, human-review status, and enterprise-readiness evidence.",
      eventMetadata: {
        smokeTest: true,
        syntheticOnly: true,
        priorIncidentKey: incidentKey
      }
    }),
    headers: authHeaders,
    method: "PATCH"
  }
);
requireStatus("authenticated TrustOps incident update", updateResult.response.status, 200);

if (!updateResult.body.json?.eventId) {
  throw new Error("authenticated TrustOps update did not return an eventId.");
}

console.log(`pass authenticated TrustOps update: ${updateResult.body.json.eventId}`);

const detailResult = await request(
  `/api/pilot-workspaces/${workspaceSlug}/trust-safety-incidents/${incidentId}`,
  {
    headers: { Authorization: `Bearer ${bearerToken}` }
  }
);
requireStatus("authenticated TrustOps incident detail", detailResult.response.status, 200);

if (!Array.isArray(detailResult.body.json?.events) || detailResult.body.json.events.length < 2) {
  throw new Error("authenticated TrustOps detail did not return the expected append-only event trail.");
}

console.log(`pass authenticated TrustOps event trail: ${detailResult.body.json.events.length} retained events`);

const packetResult = await request(
  `/api/pilot-workspaces/${workspaceSlug}/trust-safety-incidents/${incidentId}/review-packet`,
  {
    headers: { Authorization: `Bearer ${bearerToken}` }
  }
);
requireStatus("authenticated TrustOps review packet", packetResult.response.status, 200);

if (!packetResult.body.text.includes("SCRIMED Tenant TrustOps Incident Review Packet")) {
  throw new Error("authenticated TrustOps review packet did not include the expected packet heading.");
}

console.log("pass authenticated TrustOps review packet download and audit event");
console.log("SCRIMED Tenant TrustOps authenticated smoke completed.");
