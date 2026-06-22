#!/usr/bin/env node

const baseUrl = (process.env.SCRIMED_BASE_URL ?? "https://app.scrimedsolutions.com").replace(/\/$/, "");
const workspaceSlug = process.env.SCRIMED_WORKSPACE_SLUG ?? "atlas-synthetic-evaluation";
const bearerToken = process.env.SCRIMED_BEARER_TOKEN?.trim();
const requireAuthenticatedSmoke = ["1", "true", "yes"].includes(
  (process.env.SCRIMED_REQUIRE_AUTHORITY_REFERENCE_QA ?? "").toLowerCase()
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

function requireHeader(label, response, header, expected) {
  const actual = response.headers.get(header);

  if (actual !== expected) {
    throw new Error(`${label} expected ${header} ${expected} but received ${actual}.`);
  }
}

function isoDaysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  return date.toISOString();
}

const listPath = `/api/pilot-workspaces/${workspaceSlug}/authority-artifact-references`;
const renewalQueuePath = `${listPath}/renewal-queue`;
const packetPath = `${listPath}/packet`;

const unauthenticated = await request(renewalQueuePath);
requireStatus("unauthenticated authority renewal queue", unauthenticated.response.status, [401, 503]);
requireHeader(
  "unauthenticated authority renewal queue",
  unauthenticated.response,
  "x-scrimed-clinical-care-authority",
  "not-authorized-live-care"
);
console.log(
  `pass unauthenticated authority renewal queue fail-closed check: ${unauthenticated.response.status} ${unauthenticated.response.statusText}`
);

if (!bearerToken) {
  const missingTokenMessage =
    "set SCRIMED_BEARER_TOKEN to a short-lived tenant-admin or pilot-lead AAL2 bearer token";

  if (requireAuthenticatedSmoke) {
    throw new Error(
      `authenticated authority reference QA required but no bearer token was provided; ${missingTokenMessage}.`
    );
  }

  console.log(`skip authenticated authority reference QA harness: ${missingTokenMessage}.`);
  process.exit(0);
}

const authHeaders = {
  Authorization: `Bearer ${bearerToken}`,
  "Content-Type": "application/json"
};

const listResult = await request(listPath, {
  headers: { Authorization: `Bearer ${bearerToken}` }
});
requireStatus("authenticated authority reference list", listResult.response.status, 200);
requireHeader(
  "authenticated authority reference list",
  listResult.response,
  "x-scrimed-clinical-care-authority",
  "not-authorized-live-care"
);

const checklistItems =
  listResult.body.json?.checklist?.items ??
  listResult.body.json?.workflow?.intakeChecklist?.items ??
  [];
const selectedItem = checklistItems[0];

if (!selectedItem) {
  throw new Error("authenticated authority reference list did not return a checklist item.");
}

console.log(
  `pass authenticated authority reference list: ${listResult.body.json?.records?.length ?? 0} visible references`
);

const referenceKey = Date.now().toString(36);
const createResult = await request(listPath, {
  body: JSON.stringify({
    artifactIntakeItemId: selectedItem.id,
    authorityKey: selectedItem.authorityKey,
    authorityLabel: selectedItem.authorityName,
    ownerAssignmentId: selectedItem.ownerAssignmentId,
    ownerRole: selectedItem.ownerRole,
    ownerLabel: selectedItem.ownerLabel,
    ownerSide: selectedItem.ownerSide,
    referenceStatus: "review-pending",
    externalSystemLabel: "SCRIMED external authority QA registry",
    externalReferenceId: `external-reference:qa-harness-${referenceKey}`,
    reviewerLabel: "SCRIMED authority QA reviewer",
    reviewerRole: "governance QA operator",
    validatedAt: isoDaysFromNow(0),
    expiresAt: isoDaysFromNow(45),
    renewalAlertAt: isoDaysFromNow(14),
    artifactRetainedExternally: true,
    artifactUploadDisabled: true,
    phiStorageDisabled: true,
    sensitiveArtifactStorageDisabled: true,
    authorityGranted: false,
    humanReviewRequired: true,
    attestation: "authority-artifact-reference-metadata-no-artifact-storage",
    dataBoundary: "metadata-only-no-phi-no-artifact-storage",
    reviewNote: "metadata only qa harness no artifact no url no phi no authority grant"
  }),
  headers: authHeaders,
  method: "POST"
});
requireStatus("authenticated authority reference create", createResult.response.status, 201);

const referenceId = createResult.body.json?.referenceId;

if (!referenceId) {
  throw new Error("authenticated authority reference create did not return a referenceId.");
}

console.log(`pass authenticated authority reference create: ${referenceId}`);

const renewalQueueResult = await request(renewalQueuePath, {
  headers: { Authorization: `Bearer ${bearerToken}` }
});
requireStatus("authenticated authority renewal queue", renewalQueueResult.response.status, 200);
requireHeader(
  "authenticated authority renewal queue",
  renewalQueueResult.response,
  "x-scrimed-proof-stack",
  "aal2-authority-renewal-queue-no-artifact-storage"
);

if (!Array.isArray(renewalQueueResult.body.json?.renewalQueue)) {
  throw new Error("authenticated authority renewal queue did not return a renewalQueue array.");
}

if (
  renewalQueueResult.body.json?.qaHarness?.status !==
  "aal2-authority-reference-qa-harness-token-boundary"
) {
  throw new Error("authenticated authority renewal queue did not return QA harness status.");
}

console.log(
  `pass authenticated authority renewal queue: ${renewalQueueResult.body.json.renewalQueue.length} open actions`
);

const packetResult = await request(packetPath, {
  headers: { Authorization: `Bearer ${bearerToken}` }
});
requireStatus("authenticated authority reference packet", packetResult.response.status, 200);

const packetType = packetResult.response.headers.get("content-type") ?? "";

if (!packetType.includes("text/markdown")) {
  throw new Error(`authenticated authority reference packet expected markdown but received ${packetType}.`);
}

if (!packetResult.body.text.includes("## Renewal Queue")) {
  throw new Error("authenticated authority reference packet missing renewal queue section.");
}

if (!packetResult.body.text.includes("## QA Harness")) {
  throw new Error("authenticated authority reference packet missing QA harness section.");
}

const packetAuditEventId = packetResult.body.text.match(
  /Audit Event:\s*([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/i
)?.[1];

if (!packetAuditEventId) {
  throw new Error("authenticated authority reference packet did not expose the packet audit event ID.");
}

console.log("pass authenticated authority reference packet with renewal queue and QA harness");
console.log(`safe evidence workflowKind=authority-reference-qa`);
console.log(`safe evidence intakeId=${workspaceSlug}`);
console.log(`safe evidence createdSessionId=${referenceId}`);
console.log(`safe evidence packetAuditEventId=${packetAuditEventId}`);
console.log(
  "operator action required: dispose of the short-lived SCRIMED_BEARER_TOKEN outside the application after this run."
);
