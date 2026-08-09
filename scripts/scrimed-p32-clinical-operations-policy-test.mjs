#!/usr/bin/env node

import assert from "node:assert/strict";

import { createClinicalEvidenceHash } from "../app/lib/clinicalEvidenceControls.ts";
import {
  approveSharedEncounterBrief,
  authorizeHealthAction,
  buildClinicianCopilotPolicy,
  buildPatientCopilotPolicy,
  buildSharedEncounterBrief,
  createActionPolicy,
  createContextGrant,
  createConversationHandoff,
  createHealthContextBoundary,
  revokeContextGrant
} from "../app/lib/scrimedP32HealthConversationFabric.ts";
import {
  authorizePatientDataConnection,
  buildAmbientEncounterDraft,
  buildAmbientOutcomeLedger,
  buildLongitudinalRecordManifest,
  createAudioConsentRecord,
  createPatientDataGrant,
  createRetentionPolicy,
  evaluateAudioRetention,
  recordAmbientClinicianDecision,
  revokePatientDataGrant,
  withdrawAudioConsent
} from "../app/lib/scrimedP32PatientRecords.ts";
import {
  activateEmergencyRevocation,
  createAgentEnvironmentSpec,
  createAgentTrace,
  createCapabilityLease,
  createForkGrant,
  createModelAccessPolicy,
  createRunReceipt,
  createSnapshotManifest,
  createWorkloadIdentity,
  evaluateAgentAdmission
} from "../app/lib/scrimed-work/agentExecution.ts";
import {
  DeterministicBiologicalEmbeddingProvider,
  buildBiologicalHypothesis,
  buildRegistryVersionHistory,
  buildTrialEvidenceSnapshot,
  buildTrialFailureInvestigation,
  createAdversarialReview,
  evaluateBiologicalValidationRun,
  queryBiologicalSimilarity,
  recordTrialHumanReview
} from "../app/lib/scrimedP32ResearchIntelligence.ts";
import {
  buildImagingDriftMonitor,
  buildImagingOutcomeLedger,
  buildQueueRecommendation,
  createDicomContract,
  createImagingModelCard,
  createQueuePolicy,
  evaluateImagingSiteValidation,
  recordImagingOverride
} from "../app/lib/imagingWorkflowIntelligence.ts";
import {
  buildLongitudinalMrdTrend,
  buildMrdClinicalReview,
  createAssayComparabilityDecision,
  createMrdAssayVersion,
  createMrdTestProfile,
  createSpecimenProfile
} from "../app/lib/scrimedP32OncologyIntelligence.ts";
import {
  analyzePriorAuthorizationProportionality,
  buildAdministrativeBurdenCase,
  buildNetworkVarianceMonitor,
  buildPolicyEvidencePacket,
  createFacilityPerformanceNode
} from "../app/lib/scrimedP32NetworkIntelligence.ts";
import {
  createModelArtifactManifest,
  createTaskEvaluationProfile,
  evaluateModelPromotion,
  evaluateProviderConformanceRun
} from "../app/lib/scrimed-work/providerRegistry.ts";
import { routeScrimedWorkModel } from "../app/lib/scrimed-work/modelRouter.ts";
import { getScrimedWorkFeatureFlags } from "../app/lib/scrimed-work/featureFlags.ts";
import { getScrimedP32ControlPlaneSummary } from "../app/lib/scrimedP32ControlPlane.ts";

const at = "2026-07-28T12:00:00.000Z";
const later = "2026-07-28T12:30:00.000Z";
const expires = "2026-07-28T13:00:00.000Z";
const hash = (value) => createClinicalEvidenceHash(value);

const patientPolicy = buildPatientCopilotPolicy();
const clinicianPolicy = buildClinicianCopilotPolicy();
const boundary = createHealthContextBoundary({
  boundaryId: "health-boundary-alpha",
  tenantId: "tenant-alpha",
  healthContextId: "health-context-alpha",
  permittedDataClassifications: ["synthetic-no-phi", "metadata-only", "deidentified"]
});
const patientReadPolicy = createActionPolicy({
  actionPolicyId: "patient-read-policy",
  actionClass: "read",
  requiredAgentKind: "patient-copilot",
  requiredPurpose: "patient-education",
  requiredHumanRole: null,
  consequential: false
});

// 1. Non-health context is denied without an explicit grant.
const noCrossDomainGrant = authorizeHealthAction({
  authorizationId: "auth-no-grant",
  boundary,
  agentPolicy: patientPolicy,
  actionPolicy: patientReadPolicy,
  tenantId: "tenant-alpha",
  sourceContext: "non-health",
  toolId: "patient-navigation.read",
  resourceReference: "synthetic-resource-001",
  dataClassification: "synthetic-no-phi",
  purpose: "patient-education",
  evaluatedAt: at
});
assert.equal(noCrossDomainGrant.decision, "BLOCK");
assert.equal(noCrossDomainGrant.reasonCodes.includes("EXPLICIT_CROSS_DOMAIN_GRANT_REQUIRED"), true);

const activeContextGrant = createContextGrant({
  grantId: "context-grant-alpha",
  tenantId: "tenant-alpha",
  subjectReferenceHash: hash("synthetic-subject-alpha"),
  sourceContextId: "general-context-alpha",
  targetHealthContextId: boundary.healthContextId,
  purpose: "patient-education",
  permittedDataClassifications: ["synthetic-no-phi"],
  permittedResourceReferences: ["synthetic-resource-001"],
  issuedByActorIdHash: hash("synthetic-actor-alpha"),
  issuedAt: at,
  expiresAt: expires
});
const allowedGrantUse = authorizeHealthAction({
  authorizationId: "auth-with-grant",
  boundary,
  agentPolicy: patientPolicy,
  actionPolicy: patientReadPolicy,
  tenantId: "tenant-alpha",
  sourceContext: "non-health",
  toolId: "patient-navigation.read",
  resourceReference: "synthetic-resource-001",
  dataClassification: "synthetic-no-phi",
  purpose: "patient-education",
  contextGrant: activeContextGrant,
  evaluatedAt: later
});
assert.equal(allowedGrantUse.decision, "ALLOW");

// 2. Revocation stops all future context access.
const revokedContextGrant = revokeContextGrant(activeContextGrant, {
  revokedAt: later,
  reason: "purpose completed"
});
const revokedGrantUse = authorizeHealthAction({
  authorizationId: "auth-revoked-grant",
  boundary,
  agentPolicy: patientPolicy,
  actionPolicy: patientReadPolicy,
  tenantId: "tenant-alpha",
  sourceContext: "non-health",
  toolId: "patient-navigation.read",
  resourceReference: "synthetic-resource-001",
  dataClassification: "synthetic-no-phi",
  purpose: "patient-education",
  contextGrant: revokedContextGrant,
  evaluatedAt: later
});
assert.equal(revokedGrantUse.decision, "BLOCK");
assert.equal(revokedGrantUse.reasonCodes.includes("CONTEXT_GRANT_INACTIVE"), true);

// Cross-tenant access also fails.
const crossTenantUse = authorizeHealthAction({
  authorizationId: "auth-cross-tenant",
  boundary,
  agentPolicy: patientPolicy,
  actionPolicy: patientReadPolicy,
  tenantId: "tenant-beta",
  sourceContext: "health",
  toolId: "patient-navigation.read",
  resourceReference: "synthetic-resource-001",
  dataClassification: "synthetic-no-phi",
  purpose: "patient-education",
  evaluatedAt: later
});
assert.equal(crossTenantUse.reasonCodes.includes("CROSS_TENANT_CONTEXT_DENIED"), true);

// 3. Patient agents cannot invoke clinician-only or mutation tools.
const clinicianAction = createActionPolicy({
  actionPolicyId: "clinician-action-policy",
  actionClass: "clinician-only",
  requiredAgentKind: "clinician-copilot",
  requiredPurpose: "patient-education",
  requiredHumanRole: "named-clinician",
  consequential: true
});
const patientEscalation = authorizeHealthAction({
  authorizationId: "auth-patient-escalation",
  boundary,
  agentPolicy: patientPolicy,
  actionPolicy: clinicianAction,
  tenantId: "tenant-alpha",
  sourceContext: "health",
  toolId: "clinical-diagnosis",
  resourceReference: "synthetic-resource-001",
  dataClassification: "synthetic-no-phi",
  purpose: "patient-education",
  evaluatedAt: later
});
assert.equal(patientEscalation.decision, "BLOCK");
assert.equal(patientEscalation.reasonCodes.includes("PATIENT_AGENT_CLINICIAN_ACTION_DENIED"), true);
assert.equal(patientEscalation.diagnosisAuthorityGranted, false);

// 4. Shared briefs cannot publish without named clinician approval.
const draftBrief = buildSharedEncounterBrief({
  briefId: "brief-alpha",
  tenantId: "tenant-alpha",
  subjectReferenceHash: hash("synthetic-subject-alpha"),
  encounterReferenceHash: hash("synthetic-encounter-alpha"),
  approvedFacts: [{
    factId: "fact-alpha",
    summary: "Synthetic source fact for workflow review.",
    sourceReference: "source-alpha",
    sourceTimestamp: at,
    provenanceHash: hash("fact-alpha-provenance"),
    approvalState: "approved"
  }],
  unresolvedQuestions: ["Confirm workflow owner."],
  patientGoals: ["Understand the reviewed synthetic workflow."],
  clinicianReviewedActions: ["No action until named review."],
  approvals: [],
  createdAt: at,
  updatedAt: at
});
assert.equal(draftBrief.internalHandoffAllowed, false);
const approvedBrief = approveSharedEncounterBrief(draftBrief, {
  approvalId: "brief-approval-alpha",
  reviewerIdentityHash: hash("named-clinician-alpha"),
  reviewerRole: "named-clinician",
  decision: "approved",
  decidedAt: later
});
assert.equal(approvedBrief.internalHandoffAllowed, true);
assert.equal(approvedBrief.recordWritebackAllowed, false);
const handoff = createConversationHandoff({
  handoffId: "handoff-alpha",
  tenantId: "tenant-alpha",
  fromAgent: "patient-copilot",
  toAgent: "clinician-copilot",
  purpose: "patient-education",
  brief: approvedBrief,
  contextGrant: activeContextGrant,
  transferredReferenceHashes: [hash(approvedBrief)],
  createdAt: later
});
assert.equal(handoff.rawConversationTransferred, false);
assert.equal(handoff.rawPhiRecordedInAudit, false);
assert.throws(
  () =>
    createConversationHandoff({
      handoffId: "handoff-unapproved",
      tenantId: "tenant-alpha",
      fromAgent: "patient-copilot",
      toAgent: "clinician-copilot",
      purpose: "patient-education",
      brief: draftBrief,
      contextGrant: activeContextGrant,
      transferredReferenceHashes: [hash(draftBrief)],
      createdAt: later
    }),
  /approved shared encounter brief/
);

// 5. EHR requests exceeding declared scope are blocked and auditable.
const ehrAction = createActionPolicy({
  actionPolicyId: "ehr-mutation-policy",
  actionClass: "clinical-mutation",
  requiredAgentKind: "clinician-copilot",
  requiredPurpose: "clinical-documentation-draft",
  requiredHumanRole: "named-clinician",
  consequential: true
});
const blockedEhr = authorizeHealthAction({
  authorizationId: "auth-ehr-block",
  boundary,
  agentPolicy: clinicianPolicy,
  actionPolicy: ehrAction,
  tenantId: "tenant-alpha",
  sourceContext: "health",
  toolId: "ehr-writeback",
  resourceReference: "fhir-preview-alpha",
  dataClassification: "synthetic-no-phi",
  purpose: "clinical-documentation-draft",
  evaluatedAt: later
});
assert.equal(blockedEhr.decision, "BLOCK");
assert.equal(blockedEhr.ehrWritebackAllowed, false);
assert.equal(blockedEhr.auditHash.startsWith("scrimed-intel-"), true);

const parentIdentity = createWorkloadIdentity({
  identityId: "identity-parent-alpha",
  tenantId: "tenant-alpha",
  agentId: "agent-parent-alpha",
  parentIdentityId: null,
  mtlsBindingHash: hash("parent-mtls"),
  issuedAt: at,
  expiresAt: expires
});
const environment = createAgentEnvironmentSpec({
  environmentId: "environment-parent-alpha",
  tenantId: "tenant-alpha",
  purpose: "synthetic evidence review",
  dataClassification: "synthetic-no-phi",
  allowedDestinations: [{ destination: "https://approved.invalid", purpose: "approved-public-reference" }],
  limits: {
    cpuMillis: 10_000,
    memoryBytes: 128_000_000,
    wallTimeMs: 60_000,
    maximumToolCalls: 5,
    maximumTokens: 5_000,
    maximumSpendUsd: 1
  },
  snapshotPolicy: "encrypted-synthetic-only"
});
const parentLease = createCapabilityLease({
  leaseId: "lease-parent-alpha",
  identityId: parentIdentity.identityId,
  tenantId: "tenant-alpha",
  purpose: "synthetic evidence review",
  permittedTools: ["evidence.read"],
  permittedDestinations: ["https://approved.invalid"],
  permittedDataClassifications: ["synthetic-no-phi"],
  maximumRisk: "moderate",
  issuedAt: at,
  expiresAt: expires,
  parentLeaseId: null
});
const modelPolicy = createModelAccessPolicy({
  policyId: "model-access-alpha",
  allowedProviderIds: ["synthetic-fallback"],
  allowedModelIds: ["scrimed-synthetic-no-call"],
  requiredDataResidency: "local-only",
  maximumRisk: "moderate"
});

// 6. Direct, DNS, and proxy egress escapes fail closed.
for (const [index, destination] of [
  "https://unapproved.invalid",
  "dns://metadata.internal",
  "https://approved.invalid/proxy?target=unapproved.invalid"
].entries()) {
  const admission = evaluateAgentAdmission({
    decisionId: `admission-egress-${index}`,
    environment,
    identity: parentIdentity,
    lease: parentLease,
    modelPolicy,
    requestedTool: "evidence.read",
    requestedDestination: destination,
    requestedDestinationPurpose: "approved-public-reference",
    dataClassification: "synthetic-no-phi",
    risk: "low",
    evaluatedAt: later
  });
  assert.equal(admission.decision, "deny");
  assert.equal(admission.reasonCodes.includes("UNVERIFIED_EGRESS_DENIED"), true);
}
const classificationMismatch = evaluateAgentAdmission({
  decisionId: "admission-classification-mismatch",
  environment,
  identity: parentIdentity,
  lease: parentLease,
  modelPolicy,
  requestedTool: "evidence.read",
  requestedDestination: null,
  requestedDestinationPurpose: null,
  dataClassification: "metadata-only",
  risk: "low",
  evaluatedAt: later
});
assert.equal(classificationMismatch.decision, "deny");
assert.equal(
  classificationMismatch.reasonCodes.includes("ENVIRONMENT_DATA_CLASS_MISMATCH"),
  true
);

// 7. Snapshots are encrypted, digest-only, and contain no secrets, tokens, or raw PHI.
const snapshot = createSnapshotManifest({
  snapshotId: "snapshot-alpha",
  environmentId: environment.environmentId,
  tenantId: "tenant-alpha",
  encryptionKeyReferenceHash: hash("snapshot-key-reference"),
  stateArtifactDigests: [hash("snapshot-state")],
  createdAt: at,
  expiresAt: expires
});
assert.equal(snapshot.encrypted, true);
assert.equal(snapshot.containsSecrets, false);
assert.equal(snapshot.containsTokens, false);
assert.equal(snapshot.containsRawPhi, false);

// 8. Forks receive unique identities and cannot reuse parent credentials.
const childIdentity = createWorkloadIdentity({
  identityId: "identity-child-alpha",
  tenantId: "tenant-alpha",
  agentId: "agent-child-alpha",
  parentIdentityId: parentIdentity.identityId,
  mtlsBindingHash: hash("child-mtls"),
  issuedAt: at,
  expiresAt: expires
});
const childEnvironment = createAgentEnvironmentSpec({
  ...environment,
  environmentId: "environment-child-alpha",
  allowedDestinations: []
});
const childLease = createCapabilityLease({
  leaseId: "lease-child-alpha",
  identityId: childIdentity.identityId,
  tenantId: "tenant-alpha",
  purpose: "synthetic evidence review",
  permittedTools: ["evidence.read"],
  permittedDestinations: [],
  permittedDataClassifications: ["synthetic-no-phi"],
  maximumRisk: "low",
  issuedAt: at,
  expiresAt: expires,
  parentLeaseId: parentLease.leaseId
}, parentLease);
const fork = createForkGrant({
  forkGrantId: "fork-alpha",
  parentEnvironment: environment,
  childEnvironment,
  parentIdentity,
  childIdentity,
  parentLease,
  childLease,
  issuedAt: at,
  expiresAt: expires
});
assert.equal(fork.parentTokenReuseAllowed, false);
assert.equal(fork.childPrivilegeSubsetVerified, true);
assert.throws(() => createForkGrant({
  forkGrantId: "fork-invalid",
  parentEnvironment: environment,
  childEnvironment,
  parentIdentity,
  childIdentity: { ...childIdentity, identityId: parentIdentity.identityId },
  parentLease,
  childLease,
  issuedAt: at,
  expiresAt: expires
}), /unique identity/);
assert.throws(
  () =>
    createForkGrant({
      forkGrantId: "fork-cross-tenant",
      parentEnvironment: environment,
      childEnvironment,
      parentIdentity,
      childIdentity: { ...childIdentity, tenantId: "tenant-beta" },
      parentLease,
      childLease,
      issuedAt: at,
      expiresAt: expires
    }),
  /Fork lineage is invalid/
);

// 9. Expired capability leases block tool execution.
const expiredAdmission = evaluateAgentAdmission({
  decisionId: "admission-expired",
  environment,
  identity: parentIdentity,
  lease: parentLease,
  modelPolicy,
  requestedTool: "evidence.read",
  requestedDestination: null,
  requestedDestinationPurpose: null,
  dataClassification: "synthetic-no-phi",
  risk: "low",
  evaluatedAt: "2026-07-28T14:00:00.000Z"
});
assert.equal(expiredAdmission.decision, "deny");
assert.equal(expiredAdmission.reasonCodes.includes("IDENTITY_OR_LEASE_EXPIRED"), true);

const traceEventTypes = ["intent", "plan", "model", "retrieval", "tool", "approval", "mutation", "result", "cost"];
const trace = createAgentTrace({
  traceId: "trace-alpha",
  tenantId: "tenant-alpha",
  environmentId: environment.environmentId,
  identityId: parentIdentity.identityId,
  correlationId: "correlation-alpha",
  events: traceEventTypes.map((type, index) => ({
    eventId: `trace-event-${index}`,
    parentEventId: index ? `trace-event-${index - 1}` : null,
    type,
    status: type === "mutation" ? "blocked" : "completed",
    summary: `Synthetic ${type} event`,
    metadata:
      type === "intent"
        ? {
            contact: "synthetic@example.com",
            patientName: "Synthetic Person",
            callback: "404-555-0123",
            mrn: "MRN-12345"
          }
        : { reference: `metadata-${index}` },
    occurredAt: new Date(Date.parse(at) + index * 1000).toISOString(),
    eventHash: ""
  })),
  totalLatencyMs: 500,
  totalCostUsd: 0.04
});

// 10. Raw PHI does not appear in normal traces.
assert.equal(trace.rawPhiRecorded, false);
assert.equal(trace.protectedChainOfThoughtStored, false);
assert.equal(trace.events[0].metadata.contact, "[REDACTED_EMAIL]");
assert.equal(JSON.stringify(trace).includes("synthetic@example.com"), false);
assert.equal(trace.events[0].metadata.patientName, "[REDACTED]");
assert.equal(trace.events[0].metadata.callback, "[REDACTED_PHONE]");
assert.equal(trace.events[0].metadata.mrn, "[REDACTED]");

// Emergency stop blocks new actions and revokes active leases.
const emergency = activateEmergencyRevocation({
  revocationId: "revocation-alpha",
  scope: "tenant",
  targetId: "tenant-alpha",
  reasonCode: "operator-stop",
  activatedAt: later,
  activatedByIdentityHash: hash("operator-alpha")
});
const stoppedAdmission = evaluateAgentAdmission({
  decisionId: "admission-stopped",
  environment,
  identity: parentIdentity,
  lease: parentLease,
  modelPolicy,
  requestedTool: "evidence.read",
  requestedDestination: null,
  requestedDestinationPurpose: null,
  dataClassification: "synthetic-no-phi",
  risk: "low",
  evaluatedAt: later,
  emergencyRevocations: [emergency]
});
assert.equal(stoppedAdmission.emergencyStopActive, true);
assert.equal(stoppedAdmission.decision, "deny");

const retention = createRetentionPolicy({
  policyId: "retention-none",
  rawAudioRetention: "none",
  rawAudioTtlMinutes: 0,
  transcriptTtlDays: 7
});
const consent = createAudioConsentRecord({
  consentId: "consent-alpha",
  tenantId: "tenant-alpha",
  syntheticSubjectReferenceHash: hash("synthetic-subject-alpha"),
  encounterReferenceHash: hash("synthetic-encounter-alpha"),
  grantedAt: at,
  retentionPolicyId: retention.policyId,
  actorIdentityHash: hash("consenting-actor-alpha")
});
const ambientDraft = buildAmbientEncounterDraft({
  draftId: "ambient-draft-alpha",
  tenantId: "tenant-alpha",
  encounterReferenceHash: hash("synthetic-encounter-alpha"),
  consentId: consent.consentId,
  sourceAudioDigest: hash("synthetic-audio"),
  originalDraftDigest: hash("ambient-original"),
  currentDraftDigest: hash("ambient-current"),
  clinicianEditDigests: [],
  rejectionReason: null,
  reviewerIdentityHash: null,
  reviewedAt: null,
  status: "draft",
  createdAt: at
}, consent);

// 11. Ambient drafts cannot be included without clinician sign-off.
assert.equal(ambientDraft.recordInclusionAllowed, false);
assert.equal(ambientDraft.ehrWritebackAllowed, false);
const signedDraft = recordAmbientClinicianDecision(ambientDraft, {
  reviewerIdentityHash: hash("ambient-clinician"),
  decision: "sign",
  currentDraftDigest: hash("ambient-reviewed"),
  clinicianEditDigest: hash("ambient-edit"),
  reviewedAt: later
}, consent);
assert.equal(signedDraft.recordInclusionAllowed, true);
assert.equal(signedDraft.ehrWritebackAllowed, false);
const withdrawnConsent = withdrawAudioConsent(consent, later);
assert.throws(
  () =>
    recordAmbientClinicianDecision(
      ambientDraft,
      {
        reviewerIdentityHash: hash("ambient-clinician-after-withdrawal"),
        decision: "sign",
        currentDraftDigest: hash("ambient-reviewed-after-withdrawal"),
        reviewedAt: later
      },
      withdrawnConsent
    ),
  /Active ambient documentation consent is required/
);
const outcomeLedger = buildAmbientOutcomeLedger({
  ledgerId: "ambient-ledger-alpha",
  tenantId: "tenant-alpha",
  encounterReferenceHash: ambientDraft.encounterReferenceHash,
  baselineDocumentationMinutes: 25,
  assistedDocumentationMinutes: 12,
  afterHoursChartingMinutes: 4,
  normalizedEditDistance: 0.2,
  disposition: "accepted",
  unsupportedStatementCount: 0,
  omittedRelevantInformationCount: 0,
  clinicianOverrideMinutes: 3,
  encounterAdopted: true,
  inferenceCostUsd: 0.2,
  reviewCostUsd: 1,
  observedAt: later
});
assert.equal(outcomeLedger.costPerValidatedSuccessfulEncounterUsd, 1.2);

// 12. Audio-retention expiry produces a verified deletion event.
const audioDeletion = evaluateAudioRetention({
  eventId: "audio-delete-alpha",
  consent,
  policy: retention,
  sourceAudioDigest: hash("synthetic-audio"),
  evaluatedAt: later,
  deletionVerified: true
});
assert.equal(audioDeletion.status, "verified-deleted");
assert.equal(audioDeletion.rawAudioPresentAfterDeletion, false);

const patientGrant = createPatientDataGrant({
  grantId: "patient-data-grant-alpha",
  tenantId: "tenant-alpha",
  subjectReferenceHash: hash("synthetic-subject-alpha"),
  connectorId: "synthetic-fhir-preview",
  purpose: "patient-education",
  permittedSourceIds: ["source-alpha"],
  permittedOperations: ["read", "export-preview"],
  issuedAt: at,
  expiresAt: expires
});
assert.equal(authorizePatientDataConnection({
  receiptId: "connection-alpha",
  grant: patientGrant,
  tenantId: "tenant-alpha",
  connectorId: "synthetic-fhir-preview",
  operation: "read",
  sourceIds: ["source-alpha"],
  evaluatedAt: later
}).rawPayloadLogged, false);
const revokedPatientGrant = revokePatientDataGrant(patientGrant, {
  receiptId: "revoke-patient-alpha",
  revokedAt: later,
  reason: "patient revoked access"
});
assert.equal(revokedPatientGrant.receipt.futureConnectorAccessAllowed, false);
assert.throws(() => authorizePatientDataConnection({
  receiptId: "connection-revoked",
  grant: revokedPatientGrant.grant,
  tenantId: "tenant-alpha",
  connectorId: "synthetic-fhir-preview",
  operation: "read",
  sourceIds: ["source-alpha"],
  evaluatedAt: later
}), /not authorized/);

const longitudinal = buildLongitudinalRecordManifest({
  manifestId: "longitudinal-alpha",
  tenantId: "tenant-alpha",
  subjectReferenceHash: hash("synthetic-subject-alpha"),
  entries: [{
    entryId: "entry-alpha",
    sourceId: "source-alpha",
    sourceTimestamp: at,
    originalValueDigest: hash("original-source-value"),
    normalizedDisplayValue: "Synthetic display value",
    normalizationVersion: "normalization-v1",
    provenanceHash: hash("source-provenance"),
    explanation: "Educational explanation only.",
    explanationIsDiagnosisOrTreatment: false
  }],
  sourceCoverage: {
    requiredSourceTypes: ["synthetic-fhir"],
    availableSourceIds: ["source-alpha"],
    missingSourceTypes: [],
    coveragePercent: 100,
    freshnessWarnings: [],
    manifestHash: ""
  },
  purpose: "patient-education",
  exportStatus: "preview-ready",
  deletionStatus: "not-requested",
  createdAt: later
});
assert.equal(longitudinal.entries[0].originalValueDigest, hash("original-source-value"));
assert.equal(longitudinal.clinicalDecisionAuthority, false);

const registryHistory = buildRegistryVersionHistory({
  registryId: "NCT00000001",
  versions: [
    {
      versionId: "registry-v1",
      observedAt: at,
      status: "RECRUITING",
      eligibilityDigest: hash("eligibility-v1"),
      endpointDigest: hash("endpoint-v1"),
      enrollment: 100,
      completionDate: null,
      sourceHash: hash("registry-source-v1")
    },
    {
      versionId: "registry-v2",
      observedAt: later,
      status: "TERMINATED",
      eligibilityDigest: hash("eligibility-v1"),
      endpointDigest: hash("endpoint-v1"),
      enrollment: 62,
      completionDate: "2026-07-28",
      sourceHash: hash("registry-source-v2")
    }
  ]
});
const factAtom = {
  evidenceId: "evidence-fact",
  classification: "FACT",
  statement: "The synthetic registry status changed to terminated.",
  sourceType: "official-registry",
  sourceIdentifier: "NCT00000001",
  sourceUrl: "https://clinicaltrials.gov/study/NCT00000001",
  sourceVersion: "registry-v2",
  sourceSpan: "Overall status: Terminated",
  publicationDate: at,
  retrievedAt: later,
  provenanceHash: hash("fact-atom")
};
const contradictionAtom = {
  ...factAtom,
  evidenceId: "evidence-contradiction",
  classification: "CONTRADICTION",
  statement: "A separate public source still described recruitment as active.",
  sourceType: "other-public-source",
  sourceIdentifier: "public-source-alpha",
  sourceUrl: "https://example.invalid/trial-alpha",
  sourceVersion: "public-v1",
  sourceSpan: "Recruitment remains active.",
  provenanceHash: hash("contradiction-atom")
};
const snapshotEvidence = buildTrialEvidenceSnapshot({
  snapshotId: "trial-snapshot-alpha",
  trialReference: { nctId: "NCT00000001", sponsor: null, title: null },
  officialRegistryEvidenceIds: ["evidence-fact"],
  publicationEvidenceIds: ["evidence-contradiction"],
  evidenceAtoms: [factAtom, contradictionAtom],
  registryHistory,
  capturedAt: later,
  modelVersion: "synthetic-no-call-v1",
  promptVersion: "trial-failure-prompt-v1",
  toolVersion: "registry-fixture-v1"
});
const adversarialReview = createAdversarialReview({
  reviewId: "adversarial-alpha",
  reviewerComponentId: "trial-adversarial-judge",
  challengedHypothesisIds: ["hypothesis-recruitment"],
  unsupportedClaimIds: [],
  omittedContradictionIds: [],
  challengeSummary: "Recruitment is plausible but not established as the cause.",
  completedAt: later
});
const investigationInput = {
  investigationId: "investigation-alpha",
  tenantId: "tenant-alpha",
  producerComponentIds: ["trial-hypothesis-component"],
  producerIdentityHashes: [hash("trial-hypothesis-producer")],
  snapshot: snapshotEvidence,
  hypotheses: [{
    hypothesisId: "hypothesis-recruitment",
    category: "recruitment",
    statement: "Recruitment constraints may have contributed.",
    supportingEvidenceIds: ["evidence-fact"],
    contradictingEvidenceIds: ["evidence-contradiction"],
    confidence: 0.55,
    renderedAsEstablishedFact: false
  }],
  contradictions: [{
    contradictionId: "contradiction-alpha",
    evidenceIds: ["evidence-contradiction"],
    summary: "Registry and public source status differ.",
    resolutionState: "unresolved"
  }],
  alternativeExplanations: [{
    explanationId: "alternative-efficacy",
    statement: "Efficacy could be an alternative explanation, but evidence is unavailable.",
    evidenceIds: [],
    status: "plausible-unverified"
  }],
  missingEvidence: [{
    missingEvidenceId: "missing-results",
    description: "No public result dataset is available.",
    materiality: "high",
    consequence: "requires-human-review"
  }],
  confidenceBasis: {
    confidence: 0.55,
    factCount: 0,
    inferenceCount: 0,
    hypothesisCount: 0,
    contradictionCount: 0,
    unknownCount: 0,
    limitations: ["Synthetic fixture; no causal conclusion."]
  },
  adversarialReview
};
const investigation = buildTrialFailureInvestigation(investigationInput);

// 13. Trial hypotheses always remain distinct from facts.
assert.equal(investigation.hypotheses[0].renderedAsEstablishedFact, false);
assert.equal(investigation.status, "awaiting-human-review");
assert.equal(investigation.decisionGradeOutputAllowed, false);

// 14. Contradictory evidence cannot be silently omitted.
assert.throws(
  () => buildTrialFailureInvestigation({ ...investigationInput, contradictions: [] }),
  /Contradictory evidence cannot be silently omitted/
);

// 15. Judge agents cannot self-approve.
assert.throws(() => recordTrialHumanReview(investigation, {
  decisionId: "trial-review-invalid",
  reviewerIdentityHash: hash("trial-reviewer"),
  reviewerRole: "named-scientific-reviewer",
  reviewerComponentId: "trial-adversarial-judge",
  decision: "approved-for-internal-research-use",
  decidedAt: later,
  conditions: []
}, {
  authenticatedIdentityHash: hash("trial-reviewer"),
  authenticatedComponentId: "trial-adversarial-judge",
  actorType: "human",
  assuranceLevel: "aal2",
  verifiedAt: at,
  authenticationEvidenceHash: hash("trial-reviewer-auth")
}), /cannot approve its own conclusion/);
assert.throws(() => recordTrialHumanReview(investigation, {
  decisionId: "trial-review-producer-alias",
  reviewerIdentityHash: hash("trial-hypothesis-producer"),
  reviewerRole: "named-scientific-reviewer",
  reviewerComponentId: "renamed-human-review",
  decision: "approved-for-internal-research-use",
  decidedAt: later,
  conditions: []
}, {
  authenticatedIdentityHash: hash("trial-hypothesis-producer"),
  authenticatedComponentId: "renamed-human-review",
  actorType: "human",
  assuranceLevel: "aal2",
  verifiedAt: at,
  authenticationEvidenceHash: hash("trial-producer-auth")
}), /cannot approve its own conclusion/);
const reviewedInvestigation = recordTrialHumanReview(investigation, {
  decisionId: "trial-review-valid",
  reviewerIdentityHash: hash("trial-human-reviewer"),
  reviewerRole: "named-scientific-reviewer",
  reviewerComponentId: "independent-human-review",
  decision: "approved-for-internal-research-use",
  decidedAt: later,
  conditions: ["Internal research use only."]
}, {
  authenticatedIdentityHash: hash("trial-human-reviewer"),
  authenticatedComponentId: "independent-human-review",
  actorType: "human",
  assuranceLevel: "aal2",
  verifiedAt: at,
  authenticationEvidenceHash: hash("trial-human-reviewer-auth")
});
assert.equal(reviewedInvestigation.decisionGradeOutputAllowed, true);
assert.equal(reviewedInvestigation.externalClaimAllowed, false);

const signatureA = {
  signatureId: "signature-a",
  datasetAccession: "SYNTHETIC-001",
  studyId: "study-a",
  sampleIdHash: hash("sample-a"),
  organism: "synthetic-organism",
  tissue: "synthetic-tissue",
  diseaseContext: "synthetic-context",
  assay: "synthetic-assay",
  platform: "platform-a",
  laboratory: "lab-a",
  featureValues: { geneA: 1, geneB: 0.5 },
  sourceHash: hash("signature-a")
};
const signatureB = {
  ...signatureA,
  signatureId: "signature-b",
  datasetAccession: "SYNTHETIC-002",
  studyId: "study-b",
  sampleIdHash: hash("sample-b"),
  platform: "platform-b",
  laboratory: "lab-b",
  featureValues: { geneA: 0.9, geneB: 0.4 },
  sourceHash: hash("signature-b")
};
const biologicalProvider = new DeterministicBiologicalEmbeddingProvider();
const similarity = queryBiologicalSimilarity(biologicalProvider, {
  queryId: "similarity-alpha",
  querySignature: signatureA,
  candidateSignatures: [signatureB],
  maximumResults: 1,
  metric: "cosine",
  researchPurpose: "synthetic cross-study validation",
  clinicalActionRequested: false
});

// 16. Sample-level leakage across one study is rejected.
const leakingValidation = evaluateBiologicalValidationRun({
  validationRunId: "bio-validation-leak",
  providerId: biologicalProvider.providerId,
  providerVersion: biologicalProvider.modelVersion,
  trainingStudyIds: ["study-a"],
  evaluationStudyIds: ["study-a"],
  trainingLaboratories: ["lab-a"],
  evaluationLaboratories: ["lab-a"],
  trainingPlatforms: ["platform-a"],
  evaluationPlatforms: ["platform-a"],
  splitUnit: "sample",
  negativeControlCount: 1,
  knownPositiveCount: 1,
  uncertaintyReported: true
});
assert.equal(leakingValidation.status, "fail");
assert.equal(leakingValidation.reasonCodes.includes("STUDY_LEVEL_LEAKAGE_DETECTED"), true);
const normalizedLeakage = evaluateBiologicalValidationRun({
  validationRunId: "bio-validation-normalized-leak",
  providerId: biologicalProvider.providerId,
  providerVersion: biologicalProvider.modelVersion,
  trainingStudyIds: ["Study-A"],
  evaluationStudyIds: [" study-a "],
  trainingLaboratories: ["lab-a"],
  evaluationLaboratories: ["lab-b"],
  trainingPlatforms: ["platform-a"],
  evaluationPlatforms: ["platform-b"],
  splitUnit: "study",
  negativeControlCount: 1,
  knownPositiveCount: 1,
  uncertaintyReported: true
});
assert.equal(normalizedLeakage.status, "fail");
assert.equal(normalizedLeakage.reasonCodes.includes("STUDY_LEVEL_LEAKAGE_DETECTED"), true);
assert.throws(
  () =>
    queryBiologicalSimilarity(biologicalProvider, {
      queryId: "similarity-unbounded",
      querySignature: signatureA,
      candidateSignatures: [signatureB],
      maximumResults: 101,
      metric: "cosine",
      researchPurpose: "synthetic boundary test",
      clinicalActionRequested: false
    }),
  /bounded result count/
);

// 17. Research hypotheses cannot cross into clinical-action workflows.
const biologicalHypothesis = buildBiologicalHypothesis({
  hypothesisId: "bio-hypothesis-alpha",
  statement: "The synthetic signatures may share a research-relevant pattern.",
  sourceSimilarityResultHash: hash(similarity),
  uncertainty: ["Deterministic fixture only.", "Requires cross-laboratory validation."]
});
assert.equal(biologicalHypothesis.status, "research-hypothesis");
assert.equal(biologicalHypothesis.diagnosisAuthorityGranted, false);
assert.equal(biologicalHypothesis.treatmentSelectionAllowed, false);
assert.equal(biologicalHypothesis.patientMatchingAllowed, false);

const imagingCard = createImagingModelCard({
  modelCardId: "imaging-card-alpha",
  modelId: "synthetic-imaging-model",
  modelVersion: "1",
  artifactDigest: hash("imaging-artifact"),
  intendedUse: "Offline synthetic queue recommendation evaluation.",
  prohibitedUses: ["diagnostic finalization", "live queue mutation"],
  modalities: ["CT"],
  anatomy: ["synthetic-thorax"],
  regulatoryScopes: [{
    jurisdiction: "US",
    status: "unverified",
    intendedUseScope: "research-only synthetic evaluation",
    evidenceReferences: [],
    independentlyVerified: false
  }],
  evidenceGrade: "ungraded",
  accountableOwner: "imaging-governance-owner",
  admittedModes: ["offline", "shadow"]
});
const dicomContract = createDicomContract({
  contractId: "dicom-contract-alpha",
  version: "1",
  acceptedTransferSyntaxUids: ["1.2.840.10008.1.2.1"],
  supportedModalities: ["CT"],
  pacsRisIntegrationMode: "offline-contract-test",
  requiredFhirResources: ["ImagingStudy", "DiagnosticReport", "Observation", "Provenance"],
  tenantIsolationVerified: true
});
const queuePolicy = createQueuePolicy({
  policyId: "queue-policy-alpha",
  maximumDelayMinutesByPriority: { routine: 120, urgent: 30, stat: 5 }
});
const failedSiteValidation = evaluateImagingSiteValidation({
  validationRunId: "site-validation-fail",
  siteId: "site-alpha",
  modelCardId: imagingCard.modelCardId,
  dicomContractId: dicomContract.contractId,
  mode: "shadow",
  caseCount: 10,
  sensitivity: 0.95,
  specificity: 0.92,
  calibrationError: 0.04,
  falseNegativeCount: 1,
  subgroupChecksComplete: true,
  integrationContractPassed: true,
  humanReviewComplete: true,
  minimumCaseCount: 40,
  minimumSensitivity: 0.9,
  minimumSpecificity: 0.9,
  maximumCalibrationError: 0.1
});

// 18. Imaging models cannot affect a queue before site validation.
const blockedQueue = buildQueueRecommendation({
  recommendationId: "queue-recommendation-blocked",
  siteId: "site-alpha",
  studyReferenceHash: hash("study-alpha"),
  originalQueuePosition: 5,
  recommendedQueuePosition: 2,
  priorityClass: "urgent",
  reasonCodes: ["synthetic-review-signal"],
  evidenceReferences: ["synthetic-evidence"],
  generatedAt: at,
  expiresAt: expires,
  expectedDelayMinutes: 10,
  policy: queuePolicy,
  siteValidationRun: failedSiteValidation
});
assert.equal(blockedQueue.status, "blocked-site-validation");
assert.equal(blockedQueue.recommendedQueuePosition, blockedQueue.originalQueuePosition);
assert.equal(blockedQueue.liveQueueMutationAllowed, false);

const passedSiteValidation = evaluateImagingSiteValidation({
  ...failedSiteValidation,
  validationRunId: "site-validation-pass",
  caseCount: 100,
  minimumCaseCount: 40,
  minimumSensitivity: 0.9,
  minimumSpecificity: 0.9,
  maximumCalibrationError: 0.1
});

// 19. Maximum-delay and radiologist-override safeguards are enforced.
const delayBlockedQueue = buildQueueRecommendation({
  recommendationId: "queue-recommendation-delay",
  siteId: "site-alpha",
  studyReferenceHash: hash("study-beta"),
  originalQueuePosition: 2,
  recommendedQueuePosition: 8,
  priorityClass: "stat",
  reasonCodes: ["synthetic-lower-rank"],
  evidenceReferences: ["synthetic-evidence"],
  generatedAt: at,
  expiresAt: expires,
  expectedDelayMinutes: 10,
  policy: queuePolicy,
  siteValidationRun: passedSiteValidation
});
assert.equal(delayBlockedQueue.status, "blocked-maximum-delay");
assert.equal(delayBlockedQueue.recommendedQueuePosition, 2);
const imagingOverride = recordImagingOverride({
  overrideId: "imaging-override-alpha",
  recommendationId: delayBlockedQueue.recommendationId,
  radiologistIdentityHash: hash("radiologist-alpha"),
  disposition: "reject",
  finalQueuePosition: 1,
  reasonCode: "radiologist-reviewed-context",
  occurredAt: later
});
assert.equal(imagingOverride.radiologistRetainsAuthority, true);
const drift = buildImagingDriftMonitor({
  monitorId: "drift-alpha",
  modelCardId: imagingCard.modelCardId,
  siteId: "site-alpha",
  windowStartsAt: at,
  windowEndsAt: later,
  observedCalibrationError: 0.2,
  observedOverrideRate: 0.2,
  observedFalseNegativeRate: 0.08,
  baselineCalibrationError: 0.04,
  maximumCalibrationDelta: 0.05,
  maximumOverrideRate: 0.1,
  maximumFalseNegativeRate: 0.05
});
assert.equal(drift.driftStatus, "blocked");
assert.equal(drift.queueRecommendationsPaused, true);
assert.equal(buildImagingOutcomeLedger({
  ledgerId: "imaging-ledger-alpha",
  modelCardId: imagingCard.modelCardId,
  siteId: "site-alpha",
  sensitivity: 0.9,
  specificity: 0.91,
  calibrationError: 0.05,
  falseNegativeRate: 0.04,
  medianTimeToDiagnosisMinutes: null,
  medianTimeToReportMinutes: 25,
  subgroupResults: [{ subgroupId: "synthetic-subgroup", sampleSize: 50, sensitivity: 0.89, specificity: 0.9 }],
  workloadMinutes: 500,
  alertAcceptanceRate: 0.7,
  unintendedDelayCount: 0,
  measuredAt: later
}).clinicalClaimsAllowed, false);

const mrdProfile = createMrdTestProfile({
  testProfileId: "mrd-profile-alpha",
  name: "Synthetic MRD profile",
  tumorTypes: ["synthetic-tumor"],
  analyte: "synthetic-analyte",
  methodology: "synthetic-method",
  intendedUse: "Research evidence organization.",
  laboratory: "synthetic-laboratory",
  regulatoryStatus: "unverified",
  reimbursementEvidenceIds: []
});
const assayA = createMrdAssayVersion({
  assayVersionId: "assay-a",
  testProfileId: mrdProfile.testProfileId,
  version: "1",
  limitOfDetection: 0.01,
  limitOfDetectionUnit: "copies/mL",
  reportingUnit: "copies/mL",
  effectiveAt: at,
  retiredAt: null
});
const assayB = createMrdAssayVersion({
  ...assayA,
  assayVersionId: "assay-b",
  version: "2",
  reportingUnit: "molecules/mL"
});
const specimen = createSpecimenProfile({
  specimenProfileId: "specimen-alpha",
  specimenType: "synthetic-plasma",
  collectionTiming: "synthetic-baseline",
  processingMethod: "synthetic-process",
  sourceReferenceHash: hash("specimen-source"),
  collectedAt: at
});
const observations = [
  {
    observationId: "mrd-observation-a",
    assayVersionId: assayA.assayVersionId,
    specimenProfileId: specimen.specimenProfileId,
    observedAt: at,
    value: 0.1,
    unit: assayA.reportingUnit,
    qualifier: "detected",
    sourceReferenceHash: hash("mrd-source-a"),
    provenanceHash: hash("mrd-provenance-a")
  },
  {
    observationId: "mrd-observation-b",
    assayVersionId: assayB.assayVersionId,
    specimenProfileId: specimen.specimenProfileId,
    observedAt: later,
    value: 0.2,
    unit: assayB.reportingUnit,
    qualifier: "detected",
    sourceReferenceHash: hash("mrd-source-b"),
    provenanceHash: hash("mrd-provenance-b")
  }
];

// 20. Incompatible MRD assays cannot be combined into a single trend.
const blockedMrdTrend = buildLongitudinalMrdTrend({
  observations,
  assayVersions: [assayA, assayB],
  comparabilityDecisions: []
});
assert.equal(blockedMrdTrend.status, "blocked-incompatible-assays");
assert.equal(blockedMrdTrend.normalizedTrendProduced, false);
const comparability = createAssayComparabilityDecision({
  decisionId: "comparability-alpha",
  leftAssayVersionId: assayA.assayVersionId,
  rightAssayVersionId: assayB.assayVersionId,
  status: "validated-comparable",
  allowedTransform: "Synthetic test conversion only.",
  evidenceIds: ["synthetic-comparability-evidence"],
  reviewerIdentityHash: hash("mrd-reviewer"),
  reviewedAt: later
});
const reviewableMrdTrend = buildLongitudinalMrdTrend({
  observations,
  assayVersions: [assayA, assayB],
  comparabilityDecisions: [comparability]
});
assert.equal(reviewableMrdTrend.status, "reviewable");
assert.equal(reviewableMrdTrend.normalizedTrendProduced, false);
assert.equal(
  reviewableMrdTrend.reasonCodes.includes("NORMALIZED_VALUE_TRANSFORM_REQUIRES_SEPARATE_VALIDATION"),
  true
);
assert.equal(buildMrdClinicalReview({
  reviewId: "mrd-review-alpha",
  tenantId: "tenant-alpha",
  clinicianIdentityHash: hash("mrd-clinician"),
  observationIds: observations.map((observation) => observation.observationId),
  evidenceSummary: "Synthetic MRD evidence summary for clinician review.",
  missingEvidence: [],
  reviewState: "reviewed-for-internal-evidence-support",
  reviewedAt: later
}).payerSubmissionAllowed, false);

const artifact = createModelArtifactManifest({
  manifestId: "model-artifact-alpha",
  providerId: "synthetic-fallback",
  modelId: "scrimed-synthetic-no-call",
  modelVersion: "1",
  modelOrWeightDigest: hash("model-weight"),
  tokenizerDigest: hash("tokenizer"),
  quantization: "none",
  runtimeDigest: hash("runtime"),
  serializationContractDigest: hash("serialization"),
  toolContractDigest: hash("tool-contract"),
  createdAt: at,
  signatureStatus: "verified-synthetic"
});
const conformanceChecks = Object.fromEntries(
  ["json-mode", "function-calling", "streaming", "bounded-retries", "timeouts", "rate-limits", "context-window", "vision", "structured-failure"]
    .map((capability) => [capability, {
      status: capability === "streaming" ? "fail" : "pass",
      evidenceReference: `synthetic-${capability}-evidence`
    }])
);
const failedConformance = evaluateProviderConformanceRun({
  runId: "conformance-fail-alpha",
  providerId: artifact.providerId,
  modelId: artifact.modelId,
  artifactManifestHash: artifact.manifestHash,
  evaluatedAt: later,
  checks: conformanceChecks,
  transportEquivalencePassed: false,
  safetyTierPreservedOnFailure: true
});
const evaluationProfile = createTaskEvaluationProfile({
  evaluationProfileId: "evaluation-profile-alpha",
  taskType: "synthetic clinical evidence drafting",
  risk: "high",
  lane: "clinical",
  minimumCorrectness: 0.95,
  minimumSafety: 0.99,
  minimumCitationQuality: 0.95,
  minimumHumanAcceptance: 0.9,
  maximumLatencyMs: 2_000,
  maximumCostPerValidatedTaskUsd: 1,
  requiredConformanceCapabilities: ["json-mode", "streaming", "structured-failure"]
});

// 21. Public leaderboard metadata cannot trigger model promotion.
const leaderboardPromotion = evaluateModelPromotion({
  decisionId: "promotion-leaderboard",
  artifact,
  conformance: failedConformance,
  evaluationProfile,
  measured: {
    correctness: 1,
    safety: 1,
    citationQuality: 1,
    humanAcceptance: 1,
    latencyMs: 100,
    costPerValidatedTaskUsd: 0.01
  },
  regressionPassed: true,
  canaryConfigured: true,
  rollbackReady: true,
  promotionBasis: "public-leaderboard"
});
assert.equal(leaderboardPromotion.decision, "blocked");
assert.equal(leaderboardPromotion.publicLeaderboardSufficient, false);
assert.equal(leaderboardPromotion.automaticPromotionAllowed, false);
const invalidMetricPromotion = evaluateModelPromotion({
  decisionId: "promotion-invalid-metrics",
  artifact,
  conformance: failedConformance,
  evaluationProfile,
  measured: {
    correctness: Number.NaN,
    safety: Number.POSITIVE_INFINITY,
    citationQuality: 1,
    humanAcceptance: 1,
    latencyMs: Number.NaN,
    costPerValidatedTaskUsd: Number.NEGATIVE_INFINITY
  },
  regressionPassed: true,
  canaryConfigured: true,
  rollbackReady: true,
  promotionBasis: "measured-task-fitness"
});
assert.equal(invalidMetricPromotion.decision, "blocked");
assert.equal(
  invalidMetricPromotion.reasonCodes.includes("INVALID_MEASURED_EVALUATION"),
  true
);

// 22. Provider conformance failures produce explicit abstention.
const noConformantProvider = routeScrimedWorkModel({
  taskType: "synthetic bounded operations extraction",
  risk: "low",
  requiredCapability: "balanced",
  dataClassification: "synthetic-no-phi",
  latencyTargetMs: 3_000,
  budgetUsd: 1,
  tenantPolicy: "no PHI",
  reasoningRequirement: "medium",
  qualityThreshold: 0.8,
  providerConformanceRuns: [failedConformance]
});
assert.equal(noConformantProvider.routingStatus, "abstained-no-eligible-model");
assert.equal(noConformantProvider.fallbackPolicy.silentFallbackAllowed, false);

const facilityA = createFacilityPerformanceNode({
  facilityId: "facility-a",
  tenantId: "tenant-alpha",
  facilityType: "hospital",
  region: "synthetic-region",
  metrics: {
    utilizationRate: 0.8,
    accessWaitDays: 4,
    documentationMinutesPerCase: 20,
    denialRate: 0.1,
    netReimbursementPerCase: 200,
    aiAdoptionRate: 0.2,
    safetyEventRate: 0.01,
    outcomeAcceptanceRate: 0.9,
    costPerCase: 100
  },
  subgroupMetrics: [{
    subgroupId: "subgroup-a",
    sampleSize: 25,
    accessWaitDays: 5,
    denialRate: 0.12,
    outcomeAcceptanceRate: 0.88
  }],
  evidenceIds: ["facility-evidence-a"]
});
const facilityB = createFacilityPerformanceNode({
  ...facilityA,
  facilityId: "facility-b",
  metrics: { ...facilityA.metrics, accessWaitDays: 12, denialRate: 0.3, outcomeAcceptanceRate: 0.7 },
  subgroupMetrics: [{
    subgroupId: "subgroup-b",
    sampleSize: 10,
    accessWaitDays: 15,
    denialRate: 0.35,
    outcomeAcceptanceRate: 0.65
  }],
  evidenceIds: ["facility-evidence-b"]
});

// 23. Facility and subgroup variance remains visible.
const variance = buildNetworkVarianceMonitor({
  monitorId: "variance-alpha",
  tenantId: "tenant-alpha",
  nodes: [facilityA, facilityB],
  minimumSubgroupSampleSize: 20,
  materialDenialVariance: 0.05,
  generatedAt: later
});
assert.equal(variance.siteAndSubgroupVariancePreserved, true);
assert.equal(variance.facilityResults.length, 2);
assert.equal(variance.subgroupResults.length, 2);
assert.equal(variance.sparseSubgroupIds.includes("facility-b:subgroup-b"), true);

const burdenCase = buildAdministrativeBurdenCase({
  caseId: "burden-alpha",
  tenantId: "tenant-alpha",
  facilityId: "facility-a",
  workflow: "synthetic prior authorization review",
  administrativeMinutes: 60,
  staffCostUsd: 80,
  expectedReimbursementUsd: 100,
  sourceEvidenceIds: ["burden-evidence-alpha"]
});
const proportionality = analyzePriorAuthorizationProportionality({
  analysisId: "proportionality-alpha",
  administrativeBurdenCase: burdenCase,
  serviceCode: "synthetic-service",
  policyVersion: "policy-v1",
  criteria: [{
    criterionId: "criterion-alpha",
    criterionText: "Synthetic documentation criterion.",
    addressesReviewedService: false,
    evidenceIds: ["policy-evidence-alpha"]
  }],
  specialtyParitySignals: [{
    specialty: "synthetic-specialty",
    comparableBurdenMinutes: 20,
    parityConcern: true
  }],
  accessEffect: { expectedDelayDays: 3, evidenceIds: ["access-evidence-alpha"] },
  missingEvidence: []
});

// 24. Prior-authorization analysis cannot submit or mutate payer records.
assert.equal(proportionality.humanReviewRequired, true);
assert.equal(proportionality.coverageDecisionAllowed, false);
assert.equal(proportionality.payerSubmissionAllowed, false);
assert.equal(proportionality.payerMutationAllowed, false);
const policyPacket = buildPolicyEvidencePacket({
  packetId: "policy-packet-alpha",
  analysis: proportionality,
  policyReferences: ["policy-v1"],
  evidenceIds: ["policy-evidence-alpha"],
  observedFacts: ["The criterion does not directly address the synthetic service."],
  analystInferences: ["The burden may be disproportionate."],
  unresolvedQuestions: ["Named payer-policy review is pending."],
  reviewState: "draft",
  reviewerIdentityHash: null,
  generatedAt: later
});
assert.equal(policyPacket.submissionAllowed, false);
assert.equal(policyPacket.appealAllowed, false);
assert.equal(policyPacket.tenantId, burdenCase.tenantId);

// 25. One causal trace reconstructs model, retrieval, tool, approval, mutation, result, and cost.
assert.equal(trace.completeCausalReconstruction, true);
const runReceipt = createRunReceipt({
  receiptId: "run-receipt-alpha",
  traceId: trace.traceId,
  tenantId: "tenant-alpha",
  environmentId: environment.environmentId,
  identityId: parentIdentity.identityId,
  leaseId: parentLease.leaseId,
  inputDigest: hash("run-input"),
  outputDigest: hash("run-output"),
  selectedToolIds: ["evidence.read"],
  policyDecisionHashes: [allowedGrantUse.auditHash],
  evidenceReferences: ["synthetic-evidence-alpha"],
  finalDisposition: "completed",
  costUsd: 0.04,
  latencyMs: 500,
  createdAt: later
});
assert.equal(runReceipt.containsRawPhi, false);
assert.equal(runReceipt.containsSecrets, false);

// All new high-risk capabilities remain disabled by default.
const flags = getScrimedWorkFeatureFlags({});
assert.equal(flags.healthConversationFabricEnabled, true);
assert.equal(flags.containedAgentExecutionEnabled, false);
assert.equal(flags.ambientDocumentationEnabled, false);
assert.equal(flags.patientControlledRecordsEnabled, false);
assert.equal(flags.trialFailureIntelligenceEnabled, false);
assert.equal(flags.biologicalSignatureRetrievalEnabled, false);
assert.equal(flags.imagingQueueRecommendationsEnabled, false);
assert.equal(flags.mrdIntelligenceEnabled, false);
assert.equal(flags.providerConformanceEnabled, true);
assert.equal(flags.networkIntelligenceEnabled, false);
assert.equal(flags.consequentialActionsEnabled, false);

const controlPlane = getScrimedP32ControlPlaneSummary({});
assert.equal(controlPlane.productionReadiness, false);
assert.equal(controlPlane.releaseAuthorityGranted, false);
assert.equal(controlPlane.healthConversationFabric.autonomousClinicalAuthority, false);
assert.equal(controlPlane.patientRecords.ehrWritebackAllowed, false);
assert.equal(controlPlane.researchIntelligence.clinicalActionAllowed, false);
assert.equal(controlPlane.oncologyIntelligence.payerSubmissionAllowed, false);
assert.equal(controlPlane.networkIntelligence.payerMutationAllowed, false);

console.log("pass SCRIMED p.32 clinical operations and contained-agent policy tests (25 enforceable boundaries)");
