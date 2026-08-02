#!/usr/bin/env node

import assert from "node:assert/strict";

import { createClinicalEvidenceHash } from "../app/lib/clinicalEvidenceControls.ts";
import {
  createCapabilityManifest,
  createExecutionGrant,
  createGovernedExecutionReceipt,
  createInMemoryReplayProtectionStore,
  evaluateGovernedExecution
} from "../app/lib/scrimed-work/governedRuntime.ts";
import {
  assessClinicalSerializationComplexity,
  buildCanonicalLongitudinalFact,
  selectSafeClinicalSerialization
} from "../app/lib/scrimedP32ClinicalDataViews.ts";
import {
  detectMultimodalFactConflicts,
  normalizeMultimodalFact,
  readTenantMultimodalFacts
} from "../app/lib/scrimedP32MultimodalNormalization.ts";
import {
  appendArtifactRevision,
  createRecoverableRestoreRevision,
  createRecoverableTrashRevision,
  createStableDocumentId,
  verifyArtifactBackup,
  verifyArtifactLedger
} from "../app/lib/scrimedP32ArtifactLedger.ts";
import {
  buildRemoteRepoControlReport,
  createDeveloperSessionReceipt,
  scanSecretLikeMaterial
} from "../app/lib/scrimedP32RepoOps.ts";
import {
  buildP32ReleaseGateRegistry,
  createP32ApprovalEvidence,
  createP32AutomatedGateEvidence
} from "../app/lib/scrimedP32ReleaseGates.ts";

const hash = (value) => createClinicalEvidenceHash({ value });
const issuedAt = "2026-07-20T12:00:00.000Z";
const evaluatedAt = "2026-07-20T12:15:00.000Z";
const expiresAt = "2026-07-20T13:00:00.000Z";
const candidateFingerprint = hash("candidate");
const sourceFingerprint = hash("source");
const manifest = createCapabilityManifest({
  manifestId: "manifest-synthetic-agent",
  actor: { actorId: "agent-synthetic-reviewer", actorType: "agent", role: "reviewer", authenticated: true },
  tenantId: "tenant-alpha",
  purpose: "synthetic artifact review",
  permittedTools: ["artifact-draft"],
  permittedResources: ["scrimed-work:session-alpha"],
  permittedDataClasses: ["synthetic-no-phi", "metadata-only"],
  maximumRisk: "moderate",
  limits: {
    requestsPerMinute: 10,
    maximumTokens: 1_000,
    maximumDurationMs: 30_000,
    maximumSpendUsd: 1,
    maximumToolCalls: 2
  },
  prohibitedActions: ["payer-submission", "ehr-writeback"],
  issuedAt,
  expiresAt
});
const baseRequest = {
  stage: "execute",
  action: "artifact-draft",
  toolId: "artifact-draft",
  toolCategory: "reversible-write",
  resource: "scrimed-work:session-alpha",
  dataClassification: "synthetic-no-phi",
  riskLevel: "moderate",
  tenantId: "tenant-alpha",
  actorId: "agent-synthetic-reviewer",
  environment: "test",
  candidateFingerprint,
  sourceFingerprint,
  idempotencyKey: "idem-synthetic-artifact-001",
  budgetUsage: { requestsThisMinute: 1, tokens: 100, durationMs: 100, spendUsd: 0.01, toolCalls: 1 },
  evidencePointers: ["synthetic-evidence-001"],
  humanApprovalReferences: ["approval-synthetic-001"]
};
const grantInput = {
  grantId: "grant-synthetic-001",
  issuer: "reviewer-synthetic-001",
  audience: "scrimed-governed-runtime",
  subject: manifest.actor.actorId,
  tenantId: manifest.tenantId,
  purpose: manifest.purpose,
  scope: {
    tools: [baseRequest.toolId],
    resources: [baseRequest.resource],
    dataClasses: [baseRequest.dataClassification],
    action: baseRequest.action,
    stage: "execute"
  },
  candidateFingerprint,
  sourceFingerprint,
  environment: "test",
  issuedAt,
  expiresAt,
  nonce: "nonce-synthetic-001",
  requiredApprovalReferences: ["approval-synthetic-001"]
};
const grant = createExecutionGrant(grantInput);
const replayStore = createInMemoryReplayProtectionStore();
const allowed = evaluateGovernedExecution({ manifest, request: baseRequest, grant, evaluatedAt, replayStore });
assert.equal(allowed.decision, "allow");
assert.equal(allowed.executionAuthorized, true);
assert.equal(allowed.replayProtected, true);
const replayed = evaluateGovernedExecution({ manifest, request: baseRequest, grant, evaluatedAt, replayStore });
assert.equal(replayed.decision, "deny");
assert.equal(replayed.reasonCodes.includes("GRANT_REPLAY_DETECTED"), true);

const expiredGrant = createExecutionGrant({
  ...grantInput,
  grantId: "grant-synthetic-expired",
  nonce: "nonce-synthetic-expired",
  issuedAt: "2026-07-20T10:00:00.000Z",
  expiresAt: "2026-07-20T10:30:00.000Z"
});
assert.equal(
  evaluateGovernedExecution({ manifest, request: baseRequest, grant: expiredGrant, evaluatedAt }).reasonCodes.includes("GRANT_EXPIRED_OR_NOT_YET_VALID"),
  true
);
const wrongCandidateGrant = createExecutionGrant({
  ...grantInput,
  grantId: "grant-synthetic-wrong-candidate",
  nonce: "nonce-synthetic-wrong-candidate",
  candidateFingerprint: hash("other-candidate")
});
assert.equal(
  evaluateGovernedExecution({ manifest, request: baseRequest, grant: wrongCandidateGrant, evaluatedAt }).reasonCodes.includes("GRANT_CANDIDATE_MISMATCH"),
  true
);
assert.equal(
  evaluateGovernedExecution({ manifest, request: { ...baseRequest, toolId: "unknown-tool" }, grant, evaluatedAt }).reasonCodes.includes("TOOL_NOT_PERMITTED"),
  true
);
assert.equal(
  evaluateGovernedExecution({ manifest, request: { ...baseRequest, action: "payer-submission", toolId: "artifact-draft" }, grant, evaluatedAt }).reasonCodes.includes("CURRENT_POLICY_HARD_BLOCK"),
  true
);
assert.equal(
  evaluateGovernedExecution({ manifest, request: { ...baseRequest, dataClassification: "phi-blocked" }, grant, evaluatedAt }).decision,
  "deny"
);

const receipt = createGovernedExecutionReceipt({
  receiptId: "receipt-synthetic-001",
  tenantId: "tenant-alpha",
  actorId: "agent-synthetic-reviewer",
  purpose: "synthetic artifact review",
  stage: "verify",
  action: "artifact-draft",
  toolId: "artifact-draft",
  policyDecisionHash: allowed.auditHash,
  inputDigest: hash("input"),
  outputDigest: hash("output"),
  evidencePointers: ["synthetic-evidence-001"],
  costUsd: 0.01,
  latencyMs: 100,
  finalDisposition: "verified",
  correlationId: "corr-synthetic-001",
  previousReceiptHash: null,
  createdAt: evaluatedAt
});
assert.equal(receipt.containsRawPhi, false);
assert.equal(receipt.containsSecrets, false);

function fact(index, overrides = {}) {
  return buildCanonicalLongitudinalFact({
    factId: `fact-${index}`,
    tenantId: "tenant-alpha",
    syntheticSubjectId: "synthetic-complex-001",
    entity: "Observation",
    conceptCode: `synthetic-code-${index}`,
    conceptSystem: "https://example.invalid/synthetic",
    source: {
      sourceId: `source-${index}`,
      channel: "fhir",
      systemOfRecord: true,
      recordPointerHash: hash(`pointer-${index}`),
      sourceDigest: hash(`source-${index}`),
      sourceTimestamp: "2026-07-20T10:00:00.000Z",
      receivedAt: "2026-07-20T10:01:00.000Z"
    },
    transformation: { version: "synthetic-transform-v1", transformedAt: "2026-07-20T10:02:00.000Z", derived: true, confidence: 0.99 },
    clinicalState: {
      severity: "moderate",
      duration: "synthetic-duration",
      temporalCourse: "stable",
      controlStatus: "unknown",
      uncertainty: [],
      measurements: [{ name: `synthetic-measure-${index}`, value: index, unit: "synthetic-unit", observedAt: "2026-07-20T10:00:00.000Z" }],
      ...(overrides.clinicalState ?? {})
    },
    syntheticOnly: true,
    noPhiConfirmed: true,
    ...overrides
  });
}

const complexFacts = [
  fact(1, { clinicalState: { severity: "critical", duration: "synthetic-duration", temporalCourse: "worsening", controlStatus: "uncontrolled", uncertainty: ["synthetic-conflict"], measurements: [{ name: "synthetic-measure-1", value: 1, unit: "synthetic-unit", observedAt: "2026-07-20T10:00:00.000Z" }] } }),
  ...Array.from({ length: 8 }, (_, index) => fact(index + 2))
];
assert.equal(assessClinicalSerializationComplexity(complexFacts).level, "high-risk-complex");
const refusedSerialization = selectSafeClinicalSerialization({
  facts: complexFacts,
  maximumContextTokens: 10_000,
  validatedStrategies: ["compact-structured", "clinical-narrative"]
});
assert.equal(refusedSerialization.status, "SAFE_REFUSAL");
assert.equal(refusedSerialization.truncationAllowed, false);
assert.equal(
  selectSafeClinicalSerialization({ facts: complexFacts, maximumContextTokens: 100_000, validatedStrategies: ["raw-structured"] }).status,
  "SELECTED"
);

function multimodalFact(id, value, confidence = 0.99) {
  return normalizeMultimodalFact({
    factId: id,
    tenantId: "tenant-alpha",
    syntheticSubjectId: "synthetic-multimodal-001",
    source: { documentId: `doc-${id}`, documentDigest: hash(`doc-${id}`), sourceKind: "scan", receivedAt: issuedAt },
    extraction: {
      method: "ocr",
      version: "synthetic-ocr-v1",
      location: { page: 1, spanStart: 10, spanEnd: 20, geometry: [0.1, 0.1, 0.2, 0.2], path: null },
      confidence,
      extractedAt: issuedAt
    },
    concept: { code: "synthetic-code", system: "https://example.invalid/synthetic", display: "Synthetic observation" },
    value,
    unit: "synthetic-unit",
    observedAt: issuedAt,
    transformationHistory: [{ stepId: "step-1", method: "ocr", version: "v1", inputDigest: hash(`input-${id}`), outputDigest: hash(`output-${id}`), occurredAt: issuedAt }],
    humanCorrectionHistory: [],
    conflictingFactIds: []
  });
}
const lowConfidenceFact = multimodalFact("mm-1", "synthetic-value-a", 0.7);
assert.equal(lowConfidenceFact.verificationStatus, "human-review-required");
const conflictingFacts = [multimodalFact("mm-2", "synthetic-value-a"), multimodalFact("mm-3", "synthetic-value-b")];
assert.equal(detectMultimodalFactConflicts(conflictingFacts).length, 1);
assert.throws(() => readTenantMultimodalFacts("tenant-beta", conflictingFacts), /Cross-tenant/);

const documentId = createStableDocumentId({ tenantId: "tenant-alpha", sourceIdentity: "synthetic-source", artifactType: "research-brief" });
const initialRevision = appendArtifactRevision({
  documentId,
  tenantId: "tenant-alpha",
  artifactType: "research-brief",
  contentDigest: hash("artifact-v1"),
  parentRevisionId: null,
  sourceArtifactIds: ["synthetic-source"],
  transformationVersion: "synthetic-transform-v1",
  status: "active",
  retentionClass: "internal-evidence",
  createdByIdentityHash: hash("actor"),
  createdAt: issuedAt,
  previousLedgerHash: null
}, null);
const trashedRevision = createRecoverableTrashRevision({ priorRevision: initialRevision, actorIdentityHash: hash("actor"), createdAt: evaluatedAt });
const restoredRevision = createRecoverableRestoreRevision({ trashedRevision, actorIdentityHash: hash("actor"), createdAt: "2026-07-20T12:20:00.000Z" });
assert.equal(verifyArtifactLedger([initialRevision, trashedRevision, restoredRevision]).valid, true);
assert.equal(verifyArtifactLedger([{ ...initialRevision, containsRawPhi: true }]).valid, false);
assert.equal(verifyArtifactBackup({ ledgerHeadHash: restoredRevision.revisionHash, backupHeadHash: restoredRevision.revisionHash, restoredContentDigest: restoredRevision.contentDigest, expectedContentDigest: restoredRevision.contentDigest }).verified, true);
assert.equal(createStableDocumentId({ tenantId: "tenant-alpha", sourceIdentity: "synthetic-source", artifactType: "research-brief" }), documentId);
assert.notEqual(hash("artifact-v1"), hash("artifact-v2"));

assert.equal(scanSecretLikeMaterial(`access_token="${"A".repeat(32)}"`).length, 1);
assert.equal(scanSecretLikeMaterial(`access_token="synthetic-${"A".repeat(24)}"`).length, 0);
const developerReceipt = createDeveloperSessionReceipt({
  receiptId: "dev-session-receipt-001",
  issueReference: "SCRIMED-P32",
  sessionId: "session-synthetic-001",
  actorIdentityHash: hash("developer"),
  candidateFingerprint,
  sourceFingerprint,
  changeSetDigest: hash("change-set"),
  testEvidence: [{ checkId: "p32-hardening", status: "passed", evidenceHash: hash("test") }],
  pullRequestReference: null,
  reviewEvidenceReferences: [],
  releaseEvidenceReferences: [],
  createdAt: evaluatedAt
});
assert.equal(developerReceipt.productionMutationAuthorized, false);
assert.equal(buildRemoteRepoControlReport().every((control) => control.status === "UNVERIFIED_REMOTE_OPERATOR_REQUIRED"), true);

const expectedFingerprints = {
  sourceCommit: "a".repeat(40),
  sourceTree: "b".repeat(64),
  artifact: "c".repeat(64),
  validationEvidence: "d".repeat(64),
  reviewPacket: "e".repeat(64)
};
const candidateEvidence = createP32AutomatedGateEvidence({
  evidenceId: "candidate-validation",
  status: "passed",
  sourceCommit: expectedFingerprints.sourceCommit,
  sourceTreeFingerprint: expectedFingerprints.sourceTree,
  artifactFingerprint: expectedFingerprints.artifact,
  validationEvidenceFingerprint: expectedFingerprints.validationEvidence,
  reviewPacketFingerprint: expectedFingerprints.reviewPacket,
  identityAssurance: "local-deterministic-runner",
  generatedAt: issuedAt,
  checkedAt: issuedAt,
  expiresAt,
  evidencePointer: "candidate-validation:synthetic"
});
const rejectedApproval = createP32ApprovalEvidence({
  approvalId: "approval-rejected",
  gateId: "named-reviewer-approval",
  reviewerId: hash("reviewer"),
  reviewerRole: "principal-engineer",
  identityAssurance: "aal2-protected-workspace",
  tenantScopeHash: hash("tenant-alpha"),
  decision: "rejected",
  sourceCommit: expectedFingerprints.sourceCommit,
  sourceTreeFingerprint: expectedFingerprints.sourceTree,
  artifactFingerprint: expectedFingerprints.artifact,
  validationEvidenceFingerprint: expectedFingerprints.validationEvidence,
  evidencePointer: "review-record:synthetic",
  approvedAt: issuedAt,
  expiresAt,
  releaseAuthorityGranted: false
});
const gateRegistry = buildP32ReleaseGateRegistry({
  expectedFingerprints,
  worktreeClean: true,
  automatedEvidence: [candidateEvidence],
  approvals: [rejectedApproval],
  evaluatedAt
});
const rejectedGate = gateRegistry.gates.find((gate) => gate.gateId === "named-reviewer-approval");
assert.equal(rejectedGate.status, "FAIL");
assert.equal(rejectedGate.operatorAction.candidateFingerprints.sourceTree, expectedFingerprints.sourceTree);
assert.equal(gateRegistry.gates.find((gate) => gate.gateId === "legal-signoff").status, "OPERATOR_REQUIRED");
assert.equal(gateRegistry.summary.failed >= 1, true);

console.log("pass SCRIMED p.32 release hardening policy tests");
