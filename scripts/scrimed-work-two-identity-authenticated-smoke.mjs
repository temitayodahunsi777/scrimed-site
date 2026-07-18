#!/usr/bin/env node

import { randomUUID } from "node:crypto";

import { redactSensitive } from "./lib/aal2-token-policy.mjs";
import { loadLocalEnv } from "./lib/local-env.mjs";
import {
  analyzeTwoIdentityAal2Tokens,
  formatTwoIdentityAal2Report,
  twoIdentityTokenEnvironment
} from "./lib/two-identity-aal2-policy.mjs";

loadLocalEnv();

const baseUrl = (process.env.SCRIMED_BASE_URL ?? "https://app.scrimedsolutions.com").replace(/\/$/, "");
const workspaceSlug =
  process.env.SCRIMED_WORKSPACE_SLUG ??
  process.env.SCRIMED_WORK_DEFAULT_WORKSPACE_SLUG ??
  "atlas-synthetic-evaluation";
const operatorToken = process.env[twoIdentityTokenEnvironment.operator]?.trim() ?? "";
const reviewerToken = process.env[twoIdentityTokenEnvironment.reviewer]?.trim() ?? "";
const strict =
  ["1", "true", "yes"].includes(
    (process.env.SCRIMED_REQUIRE_TWO_IDENTITY_SMOKE ?? "").toLowerCase()
  ) || process.argv.includes("--strict");
const expectedReleaseSha = (
  process.env.SCRIMED_EXPECTED_RELEASE_SHA ??
  process.env.SCRIMED_APPROVED_RELEASE_SHA ??
  ""
).trim().toLowerCase();
const nonBrowserRequestContext = "operator-smoke-v1";

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
  try {
    const response = await fetch(endpoint(path), init);
    return { response, body: await readResponse(response) };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const cause =
      error instanceof Error && error.cause instanceof Error
        ? ` Cause: ${error.cause.message}`
        : "";

    throw new Error(
      redactSensitive(
        `SCRIMED Work two-identity smoke could not reach ${endpoint(path)}. Verify SCRIMED_BASE_URL, target deployment, or approved network access. ${message}.${cause}`
      )
    );
  }
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
    throw new Error(
      `${label} expected ${expectedValues.join(" or ")} but received ${actual}.${bodySummary}`
    );
  }
}

function requireJson(label, body) {
  if (!body.json || typeof body.json !== "object") {
    throw new Error(`${label} did not return JSON.`);
  }

  return body.json;
}

function requireHeader(label, response, name, expected) {
  const actual = response.headers.get(name);
  if (actual !== expected) {
    throw new Error(`${label} expected ${name}=${expected} but received ${actual ?? "missing"}.`);
  }
}

function currentSessionStatus(session) {
  const history = Array.isArray(session?.statusHistory) ? session.statusHistory : [];
  const latest = history.at(-1);
  return latest && typeof latest === "object" && typeof latest.status === "string"
    ? latest.status
    : "";
}

function failClosed(message) {
  console.error(redactSensitive(message));
  process.exit(1);
}

function readHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    "x-scrimed-workspace-slug": workspaceSlug
  };
}

function writeHeaders(token, idempotencyKey) {
  return {
    ...readHeaders(token),
    "Content-Type": "application/json",
    "idempotency-key": idempotencyKey,
    "x-scrimed-request-context": nonBrowserRequestContext
  };
}

function buildSessionPayload(uniqueSuffix) {
  return {
    workspaceSlug,
    tenantId: "synthetic-tenant",
    organizationScope: "synthetic-health-system",
    workspaceDomain: "operations",
    title: `SCRIMED Work two-identity canary ${uniqueSuffix}`,
    objective:
      "Prove a no-PHI work artifact can complete only after independent AAL2 approval, review, and verification.",
    requestedAutonomy: "recommend",
    riskLevel: "moderate",
    definitionOfDone: {
      goal: "Bind a synthetic artifact to independent approval, review, and completion evidence.",
      allowedScope: [
        "synthetic metadata",
        "tenant-scoped reviewer queue",
        "internal-use artifact review",
        "durable audit evidence"
      ],
      prohibitedActions: [
        "live PHI",
        "diagnosis",
        "treatment",
        "prescribing",
        "patient outreach",
        "payer submission",
        "EHR writeback",
        "external distribution"
      ],
      requiredEvidence: [
        "distinct AAL2 operator and reviewer identities",
        "reviewer-only queue evidence",
        "mandatory verification result"
      ],
      successCriteria: [
        "self-approval denied",
        "reviewer queue item observed",
        "artifact independently reviewed",
        "verified internal completion recorded"
      ],
      stoppingConditions: [
        "PHI detected",
        "identity separation missing",
        "authorization denied",
        "verification failed"
      ],
      timeoutMs: 300000,
      maximumSteps: 10,
      maximumToolCalls: 8,
      maximumEstimatedCostUsd: 0.1,
      humanApprovalRequired: true,
      rollbackPlan:
        "Retain append-only synthetic evidence and keep all external, payer, EHR, and clinical actions blocked.",
      verificationChecks: [
        "schema validity",
        "citation presence",
        "policy compliance",
        "human approval",
        "artifact review",
        "rollback readiness"
      ]
    }
  };
}

const summaryResult = await request("/api/scrimed-work");
requireStatus("SCRIMED Work public summary", summaryResult.response.status, 200, summaryResult.body);
const summary = requireJson("SCRIMED Work public summary", summaryResult.body);
const summaryData = summary.data ?? summary;

if (summaryData.status !== "scrimed-work-intelligence-platform-active-synthetic-no-phi") {
  throw new Error(`SCRIMED Work public summary returned unexpected status ${summaryData.status}.`);
}

const unauthenticatedQueue = await request("/api/scrimed-work/review-queue?limit=25");
requireStatus(
  "unauthenticated SCRIMED Work reviewer queue",
  unauthenticatedQueue.response.status,
  [401, 503],
  unauthenticatedQueue.body
);
requireHeader(
  "unauthenticated SCRIMED Work reviewer queue",
  unauthenticatedQueue.response,
  "X-SCRIMED-Review-Queue",
  "fail-closed"
);
console.log(
  `pass unauthenticated SCRIMED Work reviewer queue fail-closed: ${unauthenticatedQueue.response.status} ${unauthenticatedQueue.response.statusText}`
);

if (!operatorToken || !reviewerToken) {
  const missing = [
    !operatorToken ? twoIdentityTokenEnvironment.operator : "",
    !reviewerToken ? twoIdentityTokenEnvironment.reviewer : ""
  ].filter(Boolean);
  const message = `set ${missing.join(" and ")} to fresh AAL2 bearer tokens from different authenticated users`;

  if (strict) {
    failClosed(`two-identity SCRIMED Work smoke required but token evidence is incomplete; ${message}.`);
  }

  console.log(`skip two-identity SCRIMED Work happy path: ${message}.`);
  process.exit(0);
}

const tokenAnalysis = analyzeTwoIdentityAal2Tokens({
  operatorToken,
  reviewerToken,
  workspaceSlug
});

if (!tokenAnalysis.ok) {
  const message = `two-identity SCRIMED Work token preflight failed: ${tokenAnalysis.errors.join(" ")}`;
  if (strict) failClosed(message);
  console.log(`skip two-identity SCRIMED Work happy path: ${redactSensitive(message)}`);
  process.exit(0);
}

for (const warning of tokenAnalysis.warnings) {
  console.warn(`warn two-identity SCRIMED Work token preflight: ${redactSensitive(warning)}`);
}

console.log(`pass two-identity AAL2 token preflight: ${formatTwoIdentityAal2Report(tokenAnalysis)}`);

if (summaryData.persistence?.durableStoreEnabled !== true) {
  const message = "SCRIMED_WORK_DURABLE_STORE_ENABLED is not true for the target app";
  if (strict) failClosed(`two-identity SCRIMED Work smoke required but ${message}.`);
  console.log(`skip two-identity SCRIMED Work happy path: ${message}.`);
  process.exit(0);
}

const operatorQueue = await request("/api/scrimed-work/review-queue?limit=25", {
  headers: readHeaders(operatorToken)
});
requireStatus(
  "operator SCRIMED Work reviewer queue",
  operatorQueue.response.status,
  403,
  operatorQueue.body
);
const operatorQueueBody = requireJson("operator SCRIMED Work reviewer queue", operatorQueue.body);
if (operatorQueueBody.error?.code !== "scrimed_work_review_queue_reviewer_required") {
  throw new Error("operator reviewer-queue denial did not prove the reviewer-only policy.");
}
requireHeader(
  "operator SCRIMED Work reviewer queue",
  operatorQueue.response,
  "X-SCRIMED-Review-Queue",
  "fail-closed"
);
console.log("pass operator reviewer-queue access denied: reviewer role required");

const initialReviewerQueue = await request("/api/scrimed-work/review-queue?limit=25", {
  headers: readHeaders(reviewerToken)
});
requireStatus(
  "reviewer SCRIMED Work reviewer queue",
  initialReviewerQueue.response.status,
  200,
  initialReviewerQueue.body
);
const initialReviewerQueueBody = requireJson(
  "reviewer SCRIMED Work reviewer queue",
  initialReviewerQueue.body
);
if (
  initialReviewerQueueBody.data?.authorization?.memberRole !== "reviewer" ||
  initialReviewerQueueBody.data?.queue?.reviewerRoleRequired !== true
) {
  throw new Error("reviewer queue did not return protected reviewer authorization evidence.");
}
requireHeader(
  "reviewer SCRIMED Work reviewer queue",
  initialReviewerQueue.response,
  "X-SCRIMED-Review-Queue",
  "reviewer-only-aal2-tenant-scoped-metadata"
);
console.log(
  `pass reviewer-only queue authorization: audit_event=${initialReviewerQueueBody.data.queue.auditEventId}`
);

const uniqueSuffix = randomUUID().replaceAll("-", "").slice(0, 12);
const createPayload = buildSessionPayload(uniqueSuffix);
const createResult = await request("/api/scrimed-work/sessions", {
  body: JSON.stringify(createPayload),
  headers: writeHeaders(operatorToken, `scrimed-work-two-identity-create-${uniqueSuffix}`),
  method: "POST"
});
requireStatus("operator SCRIMED Work session create", createResult.response.status, [200, 201], createResult.body);
requireHeader(
  "operator SCRIMED Work session create",
  createResult.response,
  "X-SCRIMED-CSRF-Protection",
  "exact-same-origin-or-explicit-non-browser"
);
requireHeader(
  "operator SCRIMED Work session create",
  createResult.response,
  "X-SCRIMED-Rate-Limit-Decision",
  "allowed"
);
const mutationRateLimitMode = createResult.response.headers.get("x-scrimed-rate-limit-mode");
const mutationRateLimitProvider = createResult.response.headers.get("x-scrimed-rate-limit-provider");
if (
  !["distributed-required", "bounded-memory"].includes(mutationRateLimitMode ?? "") ||
  (mutationRateLimitMode === "distributed-required" && mutationRateLimitProvider !== "upstash-redis") ||
  (mutationRateLimitMode === "bounded-memory" && mutationRateLimitProvider !== "bounded-memory")
) {
  throw new Error("operator session create returned an invalid mutation rate-limit provider posture.");
}
const createBody = requireJson("operator SCRIMED Work session create", createResult.body);
const sessionId = createBody.data?.session?.id;

if (!sessionId || createBody.data?.durableStore?.persisted !== true) {
  throw new Error("operator session create did not return a durable synthetic SCRIMED Work session.");
}
console.log(`pass operator durable session create: ${sessionId} rate_limit=${mutationRateLimitMode}/${mutationRateLimitProvider}`);

const planResult = await request(`/api/scrimed-work/sessions/${sessionId}/plan`, {
  body: JSON.stringify({ workspaceSlug }),
  headers: writeHeaders(operatorToken, `scrimed-work-two-identity-plan-${uniqueSuffix}`),
  method: "POST"
});
requireStatus("operator SCRIMED Work session plan", planResult.response.status, 200, planResult.body);
const planBody = requireJson("operator SCRIMED Work session plan", planResult.body);
if (
  currentSessionStatus(planBody.data?.session) !== "planning" ||
  planBody.data?.durableStore?.transitioned !== true
) {
  throw new Error("operator plan did not record the expected durable planning transition.");
}
console.log(`pass operator durable planning transition: ${planBody.data.durableStore.eventId}`);

const artifactResult = await request("/api/scrimed-work/artifacts", {
  body: JSON.stringify({
    workspaceSlug,
    sessionId,
    type: "executive-report",
    title: `SCRIMED Work two-identity evidence ${uniqueSuffix}`
  }),
  headers: writeHeaders(operatorToken, `scrimed-work-two-identity-artifact-${uniqueSuffix}`),
  method: "POST"
});
requireStatus("operator SCRIMED Work artifact create", artifactResult.response.status, [200, 201], artifactResult.body);
const artifactBody = requireJson("operator SCRIMED Work artifact create", artifactResult.body);
const artifactId = artifactBody.data?.artifact?.artifactId;

if (!artifactId || artifactBody.data?.durableStore?.persisted !== true) {
  throw new Error("operator artifact create did not return durable synthetic artifact metadata.");
}
console.log(`pass operator durable artifact create: ${artifactId}`);

const runResult = await request(`/api/scrimed-work/sessions/${sessionId}/run`, {
  body: JSON.stringify({ workspaceSlug }),
  headers: writeHeaders(operatorToken, `scrimed-work-two-identity-run-${uniqueSuffix}`),
  method: "POST"
});
requireStatus("operator SCRIMED Work run", runResult.response.status, 200, runResult.body);
const runBody = requireJson("operator SCRIMED Work run", runResult.body);
if (
  currentSessionStatus(runBody.data?.session) !== "awaiting_approval" ||
  runBody.data?.durableStore?.transitioned !== true
) {
  throw new Error("operator run did not pause at the mandatory human approval gate.");
}
console.log(`pass run paused for independent approval: ${runBody.data.durableStore.eventId}`);

const selfApprovalResult = await request(`/api/scrimed-work/sessions/${sessionId}/approve`, {
  body: JSON.stringify({ workspaceSlug }),
  headers: writeHeaders(operatorToken, `scrimed-work-two-identity-self-approve-${uniqueSuffix}`),
  method: "POST"
});
requireStatus(
  "operator self-approval",
  selfApprovalResult.response.status,
  [403, 422],
  selfApprovalResult.body
);
const selfApprovalBody = requireJson("operator self-approval", selfApprovalResult.body);
if (!String(selfApprovalBody.error?.code ?? "").includes("separation_of_duties_required")) {
  throw new Error("operator self-approval denial did not prove separation of duties.");
}
requireHeader(
  "operator self-approval",
  selfApprovalResult.response,
  "X-SCRIMED-Approval-Authority",
  "fail-closed"
);
console.log("pass operator self-approval fail-closed: independent reviewer required");

const reviewerApprovalResult = await request(`/api/scrimed-work/sessions/${sessionId}/approve`, {
  body: JSON.stringify({ workspaceSlug }),
  headers: writeHeaders(reviewerToken, `scrimed-work-two-identity-reviewer-approve-${uniqueSuffix}`),
  method: "POST"
});
requireStatus(
  "reviewer SCRIMED Work approval",
  reviewerApprovalResult.response.status,
  200,
  reviewerApprovalResult.body
);
const reviewerApprovalBody = requireJson(
  "reviewer SCRIMED Work approval",
  reviewerApprovalResult.body
);
if (
  currentSessionStatus(reviewerApprovalBody.data?.session) !== "verifying" ||
  reviewerApprovalBody.data?.durableStore?.transitioned !== true
) {
  throw new Error("reviewer approval did not durably transition the session to verifying.");
}
requireHeader(
  "reviewer SCRIMED Work approval",
  reviewerApprovalResult.response,
  "X-SCRIMED-Approval-Authority",
  "independent-role-verified-aal2-durable-write"
);
console.log(
  `pass independent reviewer approval: ${reviewerApprovalBody.data.durableStore.eventId}`
);

const reviewQueueResult = await request("/api/scrimed-work/review-queue?limit=50", {
  headers: readHeaders(reviewerToken)
});
requireStatus("reviewer queue after approval", reviewQueueResult.response.status, 200, reviewQueueResult.body);
const reviewQueueBody = requireJson("reviewer queue after approval", reviewQueueResult.body);
const queueItem = reviewQueueBody.data?.queue?.items?.find(
  (item) => item.sessionId === sessionId && item.artifactId === artifactId
);

if (
  !queueItem ||
  queueItem.approvalsReady !== true ||
  queueItem.syntheticOnly !== true ||
  queueItem.noPhi !== true ||
  queueItem.externalDistributionAllowed !== false ||
  queueItem.payerSubmissionAllowed !== false
) {
  throw new Error("reviewer queue did not expose the expected bounded, approved, synthetic/no-PHI item.");
}
console.log(
  `pass reviewer queue evidence located: audit_event=${reviewQueueBody.data.queue.auditEventId}`
);

const reviewResult = await request(
  `/api/scrimed-work/sessions/${sessionId}/artifacts/${artifactId}/review`,
  {
    body: JSON.stringify({
      workspaceSlug,
      disposition: "approved_for_internal_use",
      reasonCode: "evidence_and_boundaries_confirmed"
    }),
    headers: writeHeaders(reviewerToken, `scrimed-work-two-identity-review-${uniqueSuffix}`),
    method: "POST"
  }
);
requireStatus("independent artifact review", reviewResult.response.status, 200, reviewResult.body);
const reviewBody = requireJson("independent artifact review", reviewResult.body);
if (
  reviewBody.data?.decision?.allowed !== true ||
  reviewBody.data?.decision?.verificationEligible !== true ||
  reviewBody.data?.durableStore?.reviewed !== true ||
  reviewBody.data?.decision?.externalDistributionAllowed !== false ||
  reviewBody.data?.decision?.payerSubmissionAllowed !== false
) {
  throw new Error("independent artifact review did not bind verified internal-use-only evidence.");
}
requireHeader(
  "independent artifact review",
  reviewResult.response,
  "X-SCRIMED-External-Distribution",
  "not-authorized"
);
requireHeader(
  "independent artifact review",
  reviewResult.response,
  "X-SCRIMED-Payer-Submission",
  "not-authorized"
);
console.log(
  `pass independent artifact review bound: review=${reviewBody.data.durableStore.reviewId} audit_event=${reviewBody.data.durableStore.eventId}`
);

const verificationResult = await request(`/api/scrimed-work/sessions/${sessionId}/verify`, {
  headers: readHeaders(operatorToken),
  method: "POST"
});
requireStatus(
  "post-review SCRIMED Work verification",
  verificationResult.response.status,
  200,
  verificationResult.body
);
const verificationBody = requireJson("post-review SCRIMED Work verification", verificationResult.body);
if (
  verificationBody.data?.allPass !== true ||
  verificationBody.data?.eligibleForCompletion !== true ||
  verificationBody.data?.failedCriteria?.length !== 0
) {
  throw new Error("post-review verification did not satisfy every mandatory completion criterion.");
}
console.log("pass post-review mandatory verification: all criteria satisfied");

const completionResult = await request(`/api/scrimed-work/sessions/${sessionId}/complete`, {
  body: JSON.stringify({ workspaceSlug }),
  headers: writeHeaders(operatorToken, `scrimed-work-two-identity-complete-${uniqueSuffix}`),
  method: "POST"
});
requireStatus("verified internal completion", completionResult.response.status, 200, completionResult.body);
const completionBody = requireJson("verified internal completion", completionResult.body);
if (
  currentSessionStatus(completionBody.data?.session) !== "completed" ||
  completionBody.data?.durableStore?.transitioned !== true
) {
  throw new Error("verified internal completion did not durably reach completed status.");
}
requireHeader(
  "verified internal completion",
  completionResult.response,
  "X-SCRIMED-Work-Completion",
  "verified-internal-work-complete"
);
requireHeader(
  "verified internal completion",
  completionResult.response,
  "X-SCRIMED-External-Distribution",
  "not-authorized"
);
requireHeader(
  "verified internal completion",
  completionResult.response,
  "X-SCRIMED-Payer-Submission",
  "not-authorized"
);
console.log(
  `pass verified internal completion: ${completionBody.data.durableStore.eventId}`
);

const finalReadResult = await request(`/api/scrimed-work/sessions/${sessionId}`, {
  headers: readHeaders(operatorToken)
});
requireStatus("final authoritative SCRIMED Work read", finalReadResult.response.status, 200, finalReadResult.body);
const finalReadBody = requireJson("final authoritative SCRIMED Work read", finalReadResult.body);
const finalArtifact = finalReadBody.data?.artifacts?.find((artifact) => artifact.artifactId === artifactId);

if (
  finalReadBody.data?.id !== sessionId ||
  finalReadBody.data?.status !== "completed" ||
  finalArtifact?.reviewStatus !== "reviewed" ||
  finalArtifact?.verification?.eligibleForCompletion !== true ||
  finalArtifact?.reviewMetadata?.externalDistributionAllowed !== false ||
  finalArtifact?.reviewMetadata?.payerSubmissionAllowed !== false
) {
  throw new Error("final authoritative read did not retain completed, reviewed, internal-use-only evidence.");
}

console.log(
  `pass final authoritative evidence: session=${sessionId} artifact=${artifactId} status=completed`
);

const completionEvidenceResult = await request(
  "/api/scrimed-work/completion-queue?mode=evidence&limit=50",
  { headers: readHeaders(operatorToken) }
);
requireStatus(
  "completed SCRIMED Work evidence history",
  completionEvidenceResult.response.status,
  200,
  completionEvidenceResult.body
);
const completionEvidenceBody = requireJson(
  "completed SCRIMED Work evidence history",
  completionEvidenceResult.body
);
const completionEvidenceItem = completionEvidenceBody.data?.evidence?.items?.find(
  (item) => item.sessionId === sessionId && item.artifactId === artifactId
);
const canaryAttestation = completionEvidenceBody.data?.canaryAttestation;
const canaryCompletedAtMs = Date.parse(canaryAttestation?.freshness?.completedAt ?? "");
const canaryEvaluatedAtMs = Date.parse(canaryAttestation?.freshness?.evaluatedAt ?? "");
const canaryAgeMs = canaryEvaluatedAtMs - canaryCompletedAtMs;

if (
  completionEvidenceBody.data?.mode !== "evidence" ||
  !completionEvidenceItem ||
  completionEvidenceItem.sessionStatus !== "completed" ||
  completionEvidenceItem.verificationAllPass !== true ||
  completionEvidenceItem.verificationPassRate !== 100 ||
  completionEvidenceItem.reviewEventId !== reviewBody.data.durableStore.eventId ||
  completionEvidenceItem.completionEventId !== completionBody.data.durableStore.eventId ||
  completionEvidenceItem.reviewerSeparationEnforced !== true ||
  completionEvidenceItem.internalUseOnly !== true ||
  completionEvidenceItem.externalDistributionAllowed !== false ||
  completionEvidenceItem.payerSubmissionAllowed !== false ||
  completionEvidenceItem.ehrWritebackAllowed !== false ||
  !/^scrimed-work-completion-evidence-[a-f0-9]{64}$/.test(
    completionEvidenceItem.evidencePacketHash ?? ""
  )
) {
  throw new Error("completed evidence history did not bind the independent review and completion events.");
}
if (
  canaryAttestation?.service !== "scrimed-work-release-bound-canary-attestation" ||
  canaryAttestation?.status !== "verified_release_bound" ||
  canaryAttestation?.eligibleForReleaseBinding !== true ||
  !/^scrimed-work-canary-[a-f0-9]{64}\.[a-f0-9]{64}$/.test(canaryAttestation?.evidenceId ?? "") ||
  !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(canaryAttestation?.releaseSha ?? "") ||
  canaryAttestation?.releaseShaFingerprint !== canaryAttestation.releaseSha.slice(0, 12) ||
  canaryAttestation?.workspaceSlug !== workspaceSlug ||
  canaryAttestation?.freshness?.fresh !== true ||
  canaryAttestation?.freshness?.maxAgeHours !== 72 ||
  canaryAttestation?.freshness?.clockSkewMinutes !== 5 ||
  !Number.isFinite(canaryCompletedAtMs) ||
  !Number.isFinite(canaryEvaluatedAtMs) ||
  canaryAgeMs < -(5 * 60 * 1000) ||
  canaryAgeMs > 72 * 60 * 60 * 1000 ||
  canaryAttestation?.source?.sessionId !== sessionId ||
  canaryAttestation?.source?.artifactId !== artifactId ||
  canaryAttestation?.source?.reviewEventId !== completionEvidenceItem.reviewEventId ||
  canaryAttestation?.source?.completionEventId !== completionEvidenceItem.completionEventId ||
  canaryAttestation?.source?.evidencePacketHash !== completionEvidenceItem.evidencePacketHash ||
  canaryAttestation?.source?.readAuditEventId !== completionEvidenceBody.data.evidence.auditEventId ||
  canaryAttestation?.configuration?.values?.verified !== "true" ||
  canaryAttestation?.configuration?.values?.evidenceId !== canaryAttestation.evidenceId ||
  canaryAttestation?.configuration?.values?.releaseSha !== canaryAttestation.releaseSha ||
  canaryAttestation?.configuration?.values?.completedAt !== canaryAttestation.freshness.completedAt ||
  canaryAttestation?.configuration?.values?.workspaceSlug !== workspaceSlug ||
  canaryAttestation?.configuration?.variableNames?.completedAt !== "SCRIMED_WORK_TWO_IDENTITY_CANARY_COMPLETED_AT" ||
  canaryAttestation?.configuration?.variableNames?.workspaceSlug !== "SCRIMED_WORKSPACE_SLUG" ||
  canaryAttestation?.controls?.independentReviewerRequired !== true ||
  canaryAttestation?.controls?.exactReleaseRequired !== true ||
  canaryAttestation?.controls?.exactWorkspaceRequired !== true ||
  canaryAttestation?.controls?.freshnessRequired !== true ||
  canaryAttestation?.controls?.noPhi !== true ||
  canaryAttestation?.controls?.externalDistributionAllowed !== false ||
  canaryAttestation?.controls?.payerSubmissionAllowed !== false ||
  canaryAttestation?.controls?.ehrWritebackAllowed !== false ||
  canaryAttestation?.controls?.productionAuthorization !== false
) {
  throw new Error("completed evidence did not produce a valid release-bound canary attestation.");
}
if (
  expectedReleaseSha &&
  (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(expectedReleaseSha) ||
    canaryAttestation.releaseSha !== expectedReleaseSha)
) {
  throw new Error("release-bound canary attestation did not match SCRIMED_EXPECTED_RELEASE_SHA.");
}
requireHeader(
  "completed SCRIMED Work evidence history",
  completionEvidenceResult.response,
  "X-SCRIMED-Completion-Read-Mode",
  "evidence"
);
requireHeader(
  "completed SCRIMED Work evidence history",
  completionEvidenceResult.response,
  "X-SCRIMED-Canary-Attestation",
  "verified_release_bound"
);
requireHeader(
  "completed SCRIMED Work evidence history",
  completionEvidenceResult.response,
  "X-SCRIMED-Canary-Freshness",
  "fresh"
);
requireHeader(
  "completed SCRIMED Work evidence history",
  completionEvidenceResult.response,
  "X-SCRIMED-External-Distribution",
  "not-authorized"
);
console.log(
  `pass immutable completion evidence: packet=${completionEvidenceItem.evidencePacketHash} audit_event=${completionEvidenceBody.data.evidence.auditEventId}`
);
console.log(
  `pass release-bound canary attestation: evidence_id=${canaryAttestation.evidenceId} release=${canaryAttestation.releaseShaFingerprint} workspace=${canaryAttestation.workspaceSlug} completed_at=${canaryAttestation.freshness.completedAt}`
);
console.log("SCRIMED Work two-identity AAL2 lifecycle canary completed.");
