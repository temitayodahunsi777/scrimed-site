#!/usr/bin/env node

const baseUrl = (process.env.SCRIMED_BASE_URL ?? "https://app.scrimedsolutions.com").replace(/\/$/, "");
const workspaceSlug = process.env.SCRIMED_WORKSPACE_SLUG ?? "atlas-synthetic-evaluation";
const bearerToken = process.env.SCRIMED_BEARER_TOKEN;

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
  `/api/agent-workspaces/${workspaceSlug}/work-orders?governanceStatus=needs-review`
);
requireStatus("unauthenticated work-order list", unauthenticated.response.status, [401, 503]);
requireSyntheticBoundary("unauthenticated work-order list", unauthenticated.response);
console.log(
  `pass unauthenticated fail-closed check: ${unauthenticated.response.status} ${unauthenticated.response.statusText}`
);

const unauthenticatedLedger = await request(
  `/api/agent-workspaces/${workspaceSlug}/governance-ledger`
);
requireStatus("unauthenticated governance-ledger list", unauthenticatedLedger.response.status, [401, 503]);
requireSyntheticBoundary("unauthenticated governance-ledger list", unauthenticatedLedger.response);
console.log(
  `pass unauthenticated governance-ledger fail-closed check: ${unauthenticatedLedger.response.status} ${unauthenticatedLedger.response.statusText}`
);

if (!bearerToken) {
  console.log(
    "skip authenticated happy path: set SCRIMED_BEARER_TOKEN to a tenant-admin or pilot-lead AAL2 bearer token."
  );
  process.exit(0);
}

const authHeaders = {
  Authorization: `Bearer ${bearerToken}`,
  "Content-Type": "application/json"
};

const listResult = await request(`/api/agent-workspaces/${workspaceSlug}/work-orders`, {
  headers: { Authorization: `Bearer ${bearerToken}` }
});
requireStatus("authenticated work-order list", listResult.response.status, 200);

const createResult = await request(`/api/agent-workspaces/${workspaceSlug}/work-orders`, {
  body: JSON.stringify({
    workOrderType: "security-scan",
    objective:
      "Run an authenticated synthetic smoke work order that validates Agent Workspace creation, governance boundaries, audit linkage, and reviewer transition behavior.",
    agentOwner: "Governance Agent + Watchtower",
    modelRouterPolicy: "No secrets in prompts; deny credential handling and production access tokens.",
    memoryScopes: ["operational", "knowledge"],
    toolScopes: ["quality gate runner", "runtime log review", "security-header inspector"],
    reviewerCheckpoints: ["Security review", "Governance review"],
    blockedActions: [
      "secrets capture",
      "credential rotation without owner",
      "claiming SOC 2/HIPAA certification",
      "destructive remediation"
    ],
    trustCard: {
      requirement: "Authenticated smoke evidence with synthetic-only boundary and human-review status.",
      validationStatus: "human-review-required",
      sourceAttribution: "SCRIMED authenticated smoke script",
      confidence: "not-clinically-validated",
      syntheticOnly: true
    }
  }),
  headers: authHeaders,
  method: "POST"
});
requireStatus("authenticated work-order create", createResult.response.status, 201);

const createdWorkOrderId = createResult.body.json?.workOrder?.id;

if (!createdWorkOrderId) {
  throw new Error("authenticated work-order create did not return a workOrder.id.");
}

console.log(`pass authenticated create: ${createdWorkOrderId}`);

const transitionResult = await request(
  `/api/agent-workspaces/${workspaceSlug}/work-orders/${createdWorkOrderId}`,
  {
    body: JSON.stringify({
      nextState: "human-review",
      eventMetadata: {
        smokeTest: true,
        legalBoundary: "Not legal advice, clinical advice, certification, or production authorization.",
        auditBoundary: "Append-only synthetic work-order event and pilot audit event.",
        processingBoundary: "Synthetic-only; no live PHI or production connector use.",
        predictiveAnalyticsBoundary: "Control-gap trend detection only; no certification or formal risk rating.",
        syntheticOnly: true
      },
      resultSummary:
        "Authenticated smoke transition recorded synthetic reviewer queue movement and continuous-improvement metrics.",
      outcomeMetrics: {
        timeSavedMinutes: 12,
        workflowFrictionReducedPct: 8,
        escalationRatePct: 0,
        overrideRatePct: 0,
        confidenceScore: 78,
        syntheticOnly: true
      },
      failureReason: "",
      assignedReviewerId: null
    }),
    headers: authHeaders,
    method: "PATCH"
  }
);
requireStatus("authenticated work-order transition", transitionResult.response.status, 200);

if (!transitionResult.body.json?.eventId) {
  throw new Error("authenticated transition did not return an eventId.");
}

console.log(`pass authenticated transition: ${transitionResult.body.json.eventId}`);

const detailResult = await request(
  `/api/agent-workspaces/${workspaceSlug}/work-orders/${createdWorkOrderId}`,
  {
    headers: { Authorization: `Bearer ${bearerToken}` }
  }
);
requireStatus("authenticated work-order detail", detailResult.response.status, 200);

if (!Array.isArray(detailResult.body.json?.events) || detailResult.body.json.events.length < 2) {
  throw new Error("authenticated detail did not return the expected append-only event trail.");
}

console.log(`pass authenticated event trail: ${detailResult.body.json.events.length} retained events`);

const proofPacketResult = await request(
  `/api/agent-workspaces/${workspaceSlug}/work-orders/${createdWorkOrderId}/proof-packet`,
  {
    headers: { Authorization: `Bearer ${bearerToken}` }
  }
);
requireStatus("authenticated work-order proof packet", proofPacketResult.response.status, 200);

if (!proofPacketResult.body.text.includes("SCRIMED Agent Workspace Work-Order Proof Packet")) {
  throw new Error("authenticated proof packet did not include the expected packet heading.");
}

console.log("pass authenticated proof packet download and audit event");

const retentionUntil = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
const governanceLedgerResult = await request(`/api/agent-workspaces/${workspaceSlug}/governance-ledger`, {
  body: JSON.stringify({
    actionType: "retention-policy-recorded",
    reason:
      "Authenticated smoke recorded synthetic pilot retention control evidence for enterprise governance verification.",
    workOrderId: createdWorkOrderId,
    retentionUntil,
    legalHoldUntil: null,
    incidentSeverity: "not-applicable",
    eventMetadata: {
      smokeTest: true,
      syntheticOnly: true,
      retentionUntil
    }
  }),
  headers: authHeaders,
  method: "POST"
});
requireStatus("authenticated governance-ledger retention record", governanceLedgerResult.response.status, 201);

if (!governanceLedgerResult.body.json?.ledgerId) {
  throw new Error("authenticated governance-ledger record did not return a ledgerId.");
}

console.log(`pass authenticated governance-ledger record: ${governanceLedgerResult.body.json.ledgerId}`);

const incidentExportResult = await request(
  `/api/agent-workspaces/${workspaceSlug}/governance-ledger/incident-export`,
  {
    body: JSON.stringify({
      actionType: "incident-export-requested",
      reason:
        "Authenticated smoke requested a server-audited synthetic incident export to verify write-before-release governance behavior.",
      workOrderId: createdWorkOrderId,
      retentionUntil: null,
      legalHoldUntil: null,
      incidentSeverity: "moderate",
      eventMetadata: {
        smokeTest: true,
        syntheticOnly: true,
        exportPurpose: "ci-governance-ledger-smoke"
      }
    }),
    headers: authHeaders,
    method: "POST"
  }
);
requireStatus("authenticated incident export", incidentExportResult.response.status, 200);

if (!incidentExportResult.body.text.includes("SCRIMED Agent Workspace Incident Export")) {
  throw new Error("authenticated incident export did not include the expected packet heading.");
}

console.log("pass authenticated incident export download and governance-ledger audit event");
console.log("SCRIMED Agent Workspace authenticated smoke completed.");
