#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  buildContextPacket,
  buildCaseEvidencePacket,
  createClinicalEvidenceHash,
  evaluateCaseEvidenceAggregation,
  evaluateClinicalContextLens,
  evaluateWorstCellReleaseGate,
  exportCaseEvidenceForAnalysis,
  InMemoryCaseEvidenceEventStore,
  verifyCaseEvidencePacketIntegrity
} from "../app/lib/clinicalEvidenceControls.ts";
import {
  documentationBeforeAuthorizationRequirements,
  runDocumentationBeforeAuthorizationWorkbench
} from "../app/lib/documentationBeforeAuthorization.ts";

const generatedAt = "2026-07-17T12:00:00.000Z";
assert.equal(
  createClinicalEvidenceHash("abc"),
  "6cc43f858fbb763301637b5af970e2a46b46f461f27e5a0f41e009c59b827b25"
);
const source = {
  id: "public-guideline-001",
  title: "Synthetic reviewed guideline contract",
  uri: "https://evidence.example/guideline-001",
  tenantScope: "public",
  trustTier: "reviewed",
  effectiveAt: "2026-07-01T00:00:00.000Z",
  expiresAt: "2026-08-01T00:00:00.000Z",
  provenanceHash: "a".repeat(64)
};

const publicContext = evaluateClinicalContextLens(
  {
    mode: "public-evidence",
    tenantId: null,
    taskType: "public-evidence-review",
    dataClassification: "public",
    authenticated: false,
    tenantScoped: false,
    minimumNecessary: true,
    consentVerified: true,
    humanReviewRequired: false,
    patientFit: "not-applicable",
    relevantHistory: [],
    sources: [source],
    missingData: [],
    confidenceScore: 0.9,
    calibrationStatus: "synthetic-calibrated",
    contraindications: [],
    policyConstraints: ["no patient-specific action"],
    proposedNextAction: "Review public evidence summary."
  },
  generatedAt
);
assert.equal(publicContext.status, "context-ready");
assert.equal(publicContext.containsPhi, false);
assert.equal(publicContext.sources[0].uri, source.uri);
assert.equal(publicContext.actionAuthority, "decision-support-only");

const clinicalContext = evaluateClinicalContextLens(
  {
    mode: "clinical-context",
    tenantId: "synthetic-tenant-a",
    taskType: "synthetic-care-coordination-context",
    dataClassification: "metadata",
    authenticated: true,
    tenantScoped: true,
    minimumNecessary: true,
    consentVerified: true,
    humanReviewRequired: true,
    patientFit: "not-assessed",
    relevantHistory: ["semantic-concept:encounter"],
    sources: [{ ...source, tenantScope: "synthetic-tenant-a" }],
    missingData: ["verify-at-runtime:source timestamp"],
    confidenceScore: 0.8,
    calibrationStatus: "not-evaluated",
    contraindications: [],
    policyConstraints: ["no autonomous clinical action"],
    proposedNextAction: "Queue qualified human review."
  },
  generatedAt
);
assert.equal(clinicalContext.status, "review-required");
assert.equal(clinicalContext.humanReviewRequired, true);
const crossTenantClinical = evaluateClinicalContextLens(
  {
    ...clinicalContext,
    tenantId: "synthetic-tenant-a",
    sources: [{ ...source, tenantScope: "synthetic-tenant-b" }],
    proposedNextAction: "Blocked."
  },
  generatedAt
);
assert.equal(crossTenantClinical.status, "blocked");
assert.equal(crossTenantClinical.abstentionReasons.some((reason) => reason.includes("requesting tenant")), true);

const unauthenticatedClinical = evaluateClinicalContextLens(
  {
    ...clinicalContext,
    status: undefined,
    auditHash: undefined,
    boundary: undefined,
    actionAuthority: undefined,
    containsPhi: undefined,
    freshness: undefined,
    actionReason: undefined,
    abstentionReasons: undefined,
    nextAction: "Queue review.",
    dataClassification: "metadata",
    authenticated: false,
    tenantScoped: true,
    minimumNecessary: true,
    consentVerified: true,
    humanReviewRequired: true,
    proposedNextAction: "Queue review."
  },
  generatedAt
);
assert.equal(unauthenticatedClinical.status, "blocked");

const staleContext = evaluateClinicalContextLens(
  {
    mode: "public-evidence",
    tenantId: null,
    taskType: "stale-public-evidence-review",
    dataClassification: "public",
    authenticated: false,
    tenantScoped: false,
    minimumNecessary: true,
    consentVerified: true,
    humanReviewRequired: false,
    patientFit: "not-applicable",
    relevantHistory: [],
    sources: [{ ...source, expiresAt: "2026-07-10T00:00:00.000Z" }],
    missingData: [],
    confidenceScore: 0.9,
    calibrationStatus: "synthetic-calibrated",
    contraindications: [],
    policyConstraints: [],
    proposedNextAction: "Do not surface stale context."
  },
  generatedAt
);
assert.equal(staleContext.status, "abstained");
assert.equal(staleContext.nextAction, null);
assert.deepEqual(staleContext.freshness.expiredSourceIds, [source.id]);

const phiContext = evaluateClinicalContextLens(
  {
    mode: "clinical-context",
    tenantId: "synthetic-tenant-a",
    taskType: "live-phi-request",
    dataClassification: "phi",
    authenticated: true,
    tenantScoped: true,
    minimumNecessary: true,
    consentVerified: true,
    humanReviewRequired: true,
    patientFit: "not-assessed",
    relevantHistory: [],
    sources: [{ ...source, tenantScope: "synthetic-tenant-a" }],
    missingData: [],
    confidenceScore: 0.9,
    calibrationStatus: "not-evaluated",
    contraindications: [],
    policyConstraints: [],
    proposedNextAction: "Blocked."
  },
  generatedAt
);
assert.equal(phiContext.status, "blocked");

const mislabeledPhiContext = evaluateClinicalContextLens(
  {
    ...clinicalContext,
    relevantHistory: ["contact patient@example.com"],
    proposedNextAction: "Blocked."
  },
  generatedAt
);
assert.equal(mislabeledPhiContext.status, "blocked");
assert.equal(
  mislabeledPhiContext.abstentionReasons.some((reason) => reason.includes("prohibited PHI")),
  true
);

const contextPacket = buildContextPacket(
  {
    tenantId: "synthetic-tenant-a",
    subjectReference: { kind: "workflow-subject", reference: "synthetic-workflow-subject-001" },
    encounterOrWorkflowReference: "workflow-documentation-review-001",
    requestingActor: {
      actorId: "synthetic-reviewer-001",
      role: "rcm-reviewer",
      purposeOfUse: "synthetic-documentation-review"
    },
    operatingMode: "clinical-context",
    lensInput: {
      mode: "clinical-context",
      tenantId: "synthetic-tenant-a",
      taskType: "synthetic-documentation-review",
      dataClassification: "metadata",
      authenticated: true,
      tenantScoped: true,
      minimumNecessary: true,
      consentVerified: true,
      humanReviewRequired: true,
      patientFit: "not-assessed",
      relevantHistory: ["synthetic-evidence-001"],
      sources: [{ ...source, tenantScope: "synthetic-tenant-a" }],
      missingData: [],
      confidenceScore: 0.9,
      calibrationStatus: "synthetic-calibrated",
      contraindications: [],
      policyConstraints: ["human-review-required"],
      proposedNextAction: "Queue qualified review."
    },
    supportingEvidence: ["synthetic-evidence-001"],
    contradictoryEvidenceSourceIds: [],
    versions: {
      model: "not-used",
      prompt: "not-used",
      tools: ["context-lens"],
      policy: "synthetic-policy-v1",
      retrieval: "synthetic-retrieval-v1"
    },
    correlationId: "correlation-context-001",
    traceId: "trace-context-001"
  },
  generatedAt
);
assert.equal(contextPacket.operatingMode, "clinical-context");
assert.equal(contextPacket.requiredReviewLevel, "clinical-authority-review");
assert.equal(contextPacket.containsPhi, false);
assert.throws(
  () => buildContextPacket({
    ...contextPacket,
    lensInput: {
      ...clinicalContext,
      dataClassification: "public",
      proposedNextAction: "Blocked.",
      authenticated: false,
      tenantScoped: false,
      minimumNecessary: true,
      consentVerified: true,
      humanReviewRequired: false
    },
    operatingMode: "public-evidence",
    tenantId: "synthetic-tenant-a",
    subjectReference: null,
    supportingEvidence: [],
    contradictoryEvidenceSourceIds: [],
    versions: contextPacket.versions
  }, generatedAt),
  /Public Evidence mode cannot bind a clinical tenant/
);

const caseEvidenceInput = {
  tenantId: "synthetic-tenant-a",
  siteId: "synthetic-site-a",
  syntheticCaseId: "synthetic-case-001",
  workflowCaseId: "workflow-case-001",
  workflowId: "documentation-before-authorization",
  cohortDefinition: "Registered synthetic workflow case.",
  eligibilityCriteria: ["synthetic fixture", "no PHI"],
  baselineComparator: "Descriptive baseline only.",
  intervention: {
    label: "Deterministic documentation review",
    startedAt: generatedAt,
    completedAt: generatedAt
  },
  eventTimestamps: {
    eligibleAt: generatedAt,
    baselineObservedAt: generatedAt,
    interventionStartedAt: generatedAt,
    dispositionedAt: generatedAt
  },
  sourceLineage: ["synthetic-evidence-001"],
  versions: {
    model: "not-used",
    prompt: "not-used",
    tools: ["deterministic-rules"],
    policy: "synthetic-policy-v1"
  },
  clinicianAction: "awaiting-review",
  overrideReasonCode: null,
  workflowDisposition: "prepared-for-review",
  outcomes: [
    {
      metricId: "documentation-completeness",
      category: "operational",
      baselineValue: null,
      observedValue: 80,
      unit: "percent",
      observedAt: generatedAt,
      sourceRef: "synthetic-evidence-001",
      interpretation: "descriptive-only"
    }
  ],
  patientReportedOutcomes: [],
  safetyEventCodes: ["human-review-required"],
  missingness: ["reviewer disposition"],
  confounders: ["synthetic fixture"],
  siteAttributes: ["synthetic site"],
  subgroupAttributes: ["synthetic subgroup"],
  latencyMs: 250,
  utilizationCount: 1,
  adoptionStatus: "offered",
  costPerAcceptedOutcomeUsd: null,
  traceId: "trace-case-evidence-001",
  correlationId: "correlation-case-evidence-001",
  governance: {
    consentStatus: "not-applicable-synthetic",
    duaStatus: "not-applicable-single-tenant",
    aggregationAuthorization: "single-tenant-only",
    purposeOfUse: "synthetic-workflow-evaluation"
  },
  analysisPlanStatus: "draft",
  trustQaStatus: "review-required",
  humanReviewRequired: true,
  syntheticOnly: true,
  noPhi: true
};
const packetOne = buildCaseEvidencePacket(caseEvidenceInput, generatedAt);
const packetTwo = buildCaseEvidencePacket(caseEvidenceInput, generatedAt);
assert.deepEqual(packetOne, packetTwo);
assert.equal(packetOne.caseIdHash.length, 64);
assert.equal(packetOne.evidencePacketHash.length, 64);
assert.equal(packetOne.causalClaimAllowed, false);
assert.equal(packetOne.externalDistributionAllowed, false);
assert.equal(packetOne.completeness.completenessPercent, 100);
assert.equal(packetOne.tenantIdHash.length, 64);
assert.equal(packetOne.traceId, caseEvidenceInput.traceId);
assert.equal("syntheticCaseId" in packetOne, false);
assert.throws(
  () => buildCaseEvidencePacket({ ...caseEvidenceInput, syntheticCaseId: "patient-name" }, generatedAt),
  /Invalid synthetic case evidence input/
);
assert.throws(
  () => buildCaseEvidencePacket({ ...caseEvidenceInput, cohortDefinition: "MRN: ABCD-1234" }, generatedAt),
  /prohibited PHI/
);

const tamperedPacket = { ...packetOne, cohortDefinition: "MRN: ABCD-1234" };
const tamperedPacketPayload = { ...tamperedPacket };
delete tamperedPacketPayload.evidencePacketHash;
tamperedPacket.evidencePacketHash = createClinicalEvidenceHash(tamperedPacketPayload);
assert.equal(verifyCaseEvidencePacketIntegrity(tamperedPacket), false);

const eventStore = new InMemoryCaseEvidenceEventStore();
const firstAppend = eventStore.append(packetOne);
const duplicateAppend = eventStore.append(packetOne);
assert.equal(firstAppend.status, "appended");
assert.equal(duplicateAppend.status, "duplicate");
assert.equal(firstAppend.event.eventHash, duplicateAppend.event.eventHash);
assert.equal(eventStore.listForTenant(packetOne.tenantIdHash).length, 1);
assert.equal(eventStore.listForTenant(createClinicalEvidenceHash({ tenantId: "synthetic-tenant-b" })).length, 0);
assert.throws(() => eventStore.append(tamperedPacket), /integrity verification failed/);
assert.equal(exportCaseEvidenceForAnalysis(packetOne).interpretation, "descriptive-only");
assert.equal(evaluateCaseEvidenceAggregation([packetOne]).allowed, true);
const aggregationNotAuthorizedPacket = buildCaseEvidencePacket(
  {
    ...caseEvidenceInput,
    syntheticCaseId: "synthetic-case-no-aggregation",
    workflowCaseId: "workflow-case-no-aggregation",
    governance: {
      ...caseEvidenceInput.governance,
      aggregationAuthorization: "not-authorized"
    }
  },
  generatedAt
);
assert.equal(evaluateCaseEvidenceAggregation([aggregationNotAuthorizedPacket]).allowed, false);
const tenantBPacket = buildCaseEvidencePacket(
  {
    ...caseEvidenceInput,
    tenantId: "synthetic-tenant-b",
    siteId: "synthetic-site-b",
    syntheticCaseId: "synthetic-case-002",
    workflowCaseId: "workflow-case-002"
  },
  generatedAt
);
assert.equal(evaluateCaseEvidenceAggregation([packetOne, tenantBPacket]).allowed, false);

const baseCell = {
  task: "synthetic benchmark",
  diseaseSubtype: "synthetic-subtype",
  patientSubgroup: "synthetic-subgroup",
  site: "synthetic-site",
  modality: "text",
  language: "en",
  workflowState: "review",
  riskLevel: "moderate",
  metric: "precision",
  direction: "higher-is-better",
  threshold: 0.8,
  minimumSampleSize: 40,
  evidenceComplete: true,
  humanReviewComplete: true,
  material: true
};
const worstCellGate = evaluateWorstCellReleaseGate([
  { ...baseCell, cellId: "strong-cell", value: 1, sampleSize: 100 },
  { ...baseCell, cellId: "failed-cell", value: 0.7, sampleSize: 100 }
]);
assert.equal(worstCellGate.decision, "blocked");
assert.equal(worstCellGate.worstMaterialCell?.cellId, "failed-cell");
assert.equal(worstCellGate.globalAverageMayOverride, false);
assert.equal(worstCellGate.eligibleForClinicalAuthority, false);

const sparseGate = evaluateWorstCellReleaseGate([
  { ...baseCell, cellId: "sparse-cell", value: 0.9, sampleSize: 10 }
]);
assert.equal(sparseGate.decision, "restricted");
assert.equal(sparseGate.summary.sparse, 1);
const emptyGate = evaluateWorstCellReleaseGate([]);
assert.equal(emptyGate.decision, "blocked");
assert.equal(emptyGate.requiredActions.some((action) => action.includes("at least one material domain cell")), true);

const workbench = runDocumentationBeforeAuthorizationWorkbench(
  {
    scenarioPacketId: "doc-auth-imaging-synthetic-review-ready",
    documentedRequirementIds: documentationBeforeAuthorizationRequirements
      .filter((requirement) => requirement.required)
      .map((requirement) => requirement.id),
    reviewerStatus: "reviewed_for_demo",
    requestedAction: "draft_reviewer_packet",
    dataBoundaryAcknowledged: true
  },
  generatedAt
);
assert.equal(workbench.valid, true);
if (workbench.valid) {
  assert.equal(workbench.packet.caseEvidence.noPhi, true);
  assert.equal(workbench.packet.caseEvidence.causalClaimAllowed, false);
  assert.equal(workbench.packet.caseEvidence.humanReviewRequired, true);
  assert.equal(workbench.packet.caseEvidence.evidencePacketHash.length, 64);
}

console.log(
  "pass SCRIMED P31 clinical evidence controls (Context Lens isolation, first-case evidence, and worst-material-cell release gating)"
);
