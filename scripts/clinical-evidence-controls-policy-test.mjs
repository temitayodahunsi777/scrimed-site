#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  buildCaseEvidencePacket,
  createClinicalEvidenceHash,
  evaluateClinicalContextLens,
  evaluateWorstCellReleaseGate
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
  trustTier: "reviewed",
  effectiveAt: "2026-07-01T00:00:00.000Z",
  expiresAt: "2026-08-01T00:00:00.000Z",
  provenanceHash: "a".repeat(64)
};

const publicContext = evaluateClinicalContextLens(
  {
    mode: "public-evidence",
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
    taskType: "synthetic-care-coordination-context",
    dataClassification: "metadata",
    authenticated: true,
    tenantScoped: true,
    minimumNecessary: true,
    consentVerified: true,
    humanReviewRequired: true,
    patientFit: "not-assessed",
    relevantHistory: ["semantic-concept:encounter"],
    sources: [source],
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
    taskType: "live-phi-request",
    dataClassification: "phi",
    authenticated: true,
    tenantScoped: true,
    minimumNecessary: true,
    consentVerified: true,
    humanReviewRequired: true,
    patientFit: "not-assessed",
    relevantHistory: [],
    sources: [source],
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

const caseEvidenceInput = {
  syntheticCaseId: "synthetic-case-001",
  workflowId: "documentation-before-authorization",
  cohortDefinition: "Registered synthetic workflow case.",
  eligibilityCriteria: ["synthetic fixture", "no PHI"],
  baselineComparator: "Descriptive baseline only.",
  intervention: {
    label: "Deterministic documentation review",
    startedAt: generatedAt,
    completedAt: generatedAt
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
  safetyEventCodes: ["human-review-required"],
  missingness: ["reviewer disposition"],
  confounders: ["synthetic fixture"],
  siteAttributes: ["synthetic site"],
  subgroupAttributes: ["synthetic subgroup"],
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
assert.equal("syntheticCaseId" in packetOne, false);
assert.throws(
  () => buildCaseEvidencePacket({ ...caseEvidenceInput, syntheticCaseId: "patient-name" }, generatedAt),
  /Invalid synthetic case evidence input/
);

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
