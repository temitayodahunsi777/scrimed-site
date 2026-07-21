#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  buildCaseEvidencePacket,
  verifyCaseEvidencePacketIntegrity
} from "../app/lib/clinicalEvidenceControls.ts";
import {
  analyzeImagingFleetVariance,
  evaluateImagingWorkflow,
  isExternalImagingAdapterEnabled,
  recordImagingReviewEvent,
  syntheticImagingWorkflowFixture
} from "../app/lib/imagingWorkflowIntelligence.ts";
import {
  advanceOutcomeLearningController,
  createOutcomeLearningController,
  evaluateOutcomeLearningPromotion
} from "../app/lib/scrimed-work/learningLoop.ts";
import {
  buildFoundryBlueprint,
  evaluateFoundryPromotion,
  priorAuthorizationFoundryBlueprint,
  priorAuthorizationFoundryTemplate
} from "../app/lib/scrimed-work/foundry.ts";
import { getScrimedWorkFeatureFlags } from "../app/lib/scrimed-work/featureFlags.ts";
import { routeScrimedWorkModel } from "../app/lib/scrimed-work/modelRouter.ts";
import {
  evaluateClinicalAgentSre,
  syntheticClinicalAgentSreSnapshot,
  validatePhiSafeAgentTelemetry
} from "../app/lib/clinicalAgentSre.ts";
import {
  buildRenewalEvidenceDossier,
  documentationBeforeAuthorizationValueContract
} from "../app/lib/valueContractEvidence.ts";

const generatedAt = "2026-07-17T12:10:00.000Z";

const imaging = evaluateImagingWorkflow(syntheticImagingWorkflowFixture, generatedAt);
assert.equal(imaging.status, "review-ready");
assert.equal(imaging.fhirPreview?.imagingStudy.resourceType, "ImagingStudy");
assert.equal(imaging.fhirPreview?.diagnosticReport.status, "preliminary");
assert.equal(imaging.fhirPreview?.diagnosticReport.conclusion, null);
assert.equal(imaging.structuredHandoff.ehrWritebackAllowed, false);
assert.equal(imaging.clinicianReview.diagnosticFinalizationAllowed, false);
assert.equal(imaging.boundary.includes("does not inspect production pixels"), true);

const incompleteImaging = evaluateImagingWorkflow(
  {
    ...syntheticImagingWorkflowFixture,
    series: syntheticImagingWorkflowFixture.series.slice(0, 1),
    measurements: []
  },
  generatedAt
);
assert.equal(incompleteImaging.status, "incomplete");
assert.equal(incompleteImaging.remoteSpecialistEscalation.required, true);

const blockedImaging = evaluateImagingWorkflow(
  { ...syntheticImagingWorkflowFixture, requestedAction: "finalize-diagnostic-report" },
  generatedAt
);
assert.equal(blockedImaging.status, "blocked");
assert.equal(blockedImaging.fhirPreview, null);
assert.equal(blockedImaging.structuredHandoff.finalReportAllowed, false);
const reviewEvent = recordImagingReviewEvent({
  result: imaging,
  reviewerId: "synthetic-imaging-reviewer",
  action: "corrected",
  reasonCode: "synthetic-measurement-correction",
  occurredAt: generatedAt
});
assert.equal(reviewEvent.diagnosticAuthorityGranted, false);
assert.equal(reviewEvent.reviewerIdHash.length, 64);
assert.equal(analyzeImagingFleetVariance([syntheticImagingWorkflowFixture])[0].humanReviewRequired, true);
assert.equal(isExternalImagingAdapterEnabled({}), false);

function advanceToPromotion(feedbackMode) {
  let controller = createOutcomeLearningController({
    controllerId: `synthetic-${feedbackMode}`,
    sourceSessionId: "synthetic-research-session-100",
    researchOwner: "research-ops",
    hypothesis: "A governed retrieval policy may improve synthetic evidence completeness.",
    proposedAction: "Evaluate one versioned policy change in the sandbox.",
    feedbackMode,
    fixedEvaluationSetId: "synthetic-fixed-evaluation-v1",
    capabilityThreshold: 0.9
  });
  controller = advanceOutcomeLearningController(controller, { nextStage: "proposed_action", reason: "proposal recorded" });
  controller = advanceOutcomeLearningController(controller, {
    nextStage: "authorization",
    reason: "sandbox authorization reviewed",
    authorizationStatus: "approved-for-sandbox"
  });
  controller = advanceOutcomeLearningController(controller, { nextStage: "execution", reason: "bounded sandbox execution" });
  controller = advanceOutcomeLearningController(controller, {
    nextStage: "measurement",
    reason: "fixed evaluation measured",
    measuredCapability: 0.94
  });
  controller = advanceOutcomeLearningController(controller, {
    nextStage: "feedback_classification",
    reason: "feedback arm classified",
    feedbackProvenance: ["synthetic-feedback-evidence-001"]
  });
  controller = advanceOutcomeLearningController(controller, { nextStage: "updated_hypothesis", reason: "hypothesis update drafted" });
  controller = advanceOutcomeLearningController(controller, { nextStage: "next_proposed_action", reason: "next experiment proposed" });
  controller = advanceOutcomeLearningController(controller, {
    nextStage: "promotion_review",
    reason: "human review, canary, and rollback evidence attached",
    humanReviewStatus: "approved",
    canaryStatus: "passed",
    rollbackStatus: "tested"
  });
  return controller;
}

const noFeedbackController = advanceToPromotion("no-feedback-control");
const noFeedbackPromotion = evaluateOutcomeLearningPromotion(noFeedbackController);
assert.equal(noFeedbackPromotion.eligible, false);
assert.equal(noFeedbackPromotion.blockers.includes("no-feedback control cannot justify promotion"), true);
assert.equal(noFeedbackPromotion.clinicalProductionMutationAllowed, false);

const measuredController = advanceToPromotion("measured-feedback");
const measuredPromotion = evaluateOutcomeLearningPromotion(measuredController);
assert.equal(measuredPromotion.eligible, true);
assert.equal(measuredPromotion.deploymentAuthority, "not-granted");
assert.equal(measuredPromotion.requiredAction, "request-separate-promotion-approval");

assert.equal(priorAuthorizationFoundryBlueprint.sandbox.consequentialActionsEnabled, false);
assert.equal(priorAuthorizationFoundryBlueprint.deploymentManifest.productionActivationAllowed, false);
assert.equal(priorAuthorizationFoundryBlueprint.permissionsManifest.every((permission) => permission.decision === "allow-sandbox"), true);
assert.throws(
  () => buildFoundryBlueprint({
    ...priorAuthorizationFoundryTemplate,
    definitionId: "prior-authorization-overreach-test",
    allowedToolIds: ["payer-submission"]
  }),
  /not eligible for sandbox access/
);
const foundryPromotion = evaluateFoundryPromotion(priorAuthorizationFoundryBlueprint, {
  lambGovernance: "approved",
  trustQa: "approved",
  worstCellTesting: "passed",
  integrationValidation: "passed",
  clinicalOrOperationalSignoff: "approved",
  namedOwnerConfirmed: true,
  canaryConfigured: true,
  rollbackTested: true
});
assert.equal(foundryPromotion.eligibleForSeparateCanaryApproval, true);
assert.equal(foundryPromotion.productionDeploymentAllowed, false);

const validatedCell = {
  cellId: "synthetic-high-risk-cell",
  modelId: "scrimed-synthetic-no-call",
  status: "pass",
  qualityScore: 0.96,
  acceptedOutcomeRate: 0.8,
  sampleSize: 80,
  minimumSampleSize: 40
};
const highRiskRoute = routeScrimedWorkModel({
  taskType: "synthetic high-risk evidence synthesis",
  risk: "high",
  requiredCapability: "reasoning",
  dataClassification: "synthetic-no-phi",
  latencyTargetMs: 5_000,
  budgetUsd: 1,
  tenantPolicy: "human review required",
  reasoningRequirement: "high",
  qualityThreshold: 0.9,
  domainCellId: validatedCell.cellId,
  validatedDomainCells: [validatedCell],
  costComponents: { retrievalUsd: 0.02, validationUsd: 0.04, humanReviewUsd: 0.4 },
  maximumFallbacks: 1
});
assert.equal(highRiskRoute.routingStatus, "selected");
assert.equal(highRiskRoute.requiresHumanReview, true);
assert.deepEqual(highRiskRoute.validatedCellIds, [validatedCell.cellId]);
assert.equal(highRiskRoute.estimatedCostPerAcceptedOutcomeUsd > 0, true);
assert.equal(highRiskRoute.fallbackPolicy.silentFallbackAllowed, false);

const noEligibleRoute = routeScrimedWorkModel({
  taskType: "synthetic unsupported specialty cell",
  risk: "high",
  requiredCapability: "reasoning",
  dataClassification: "synthetic-no-phi",
  latencyTargetMs: 5_000,
  budgetUsd: 1,
  tenantPolicy: "human review required",
  reasoningRequirement: "high",
  qualityThreshold: 0.95,
  domainCellId: "synthetic-unvalidated-cell",
  validatedDomainCells: [{ ...validatedCell, cellId: "different-cell" }]
});
assert.equal(noEligibleRoute.routingStatus, "abstained-no-eligible-model");
assert.equal(noEligibleRoute.selectedModel, "blocked-no-model-selected");
assert.deepEqual(noEligibleRoute.fallbackModels, []);

assert.equal(validatePhiSafeAgentTelemetry({ route: "synthetic", latencyMs: 50 }).safe, true);
assert.equal(validatePhiSafeAgentTelemetry({ patientName: "Synthetic Name" }).safe, false);
const sreReady = evaluateClinicalAgentSre(syntheticClinicalAgentSreSnapshot);
assert.equal(sreReady.status, "synthetic-sre-ready");
assert.equal(sreReady.controls.protectedChainOfThoughtStored, false);
const sreRetryStorm = evaluateClinicalAgentSre({
  ...syntheticClinicalAgentSreSnapshot,
  retryCount: 5,
  maximumRetries: 2
});
assert.equal(sreRetryStorm.status, "blocked");
assert.equal(sreRetryStorm.blockers.some((blocker) => blocker.includes("retry budget")), true);

const caseEvidenceInput = {
  tenantId: "synthetic-tenant",
  siteId: "synthetic-site",
  syntheticCaseId: "synthetic-renewal-case-001",
  workflowCaseId: "workflow-renewal-case-001",
  workflowId: "documentation-before-authorization",
  cohortDefinition: "Registered synthetic authorization-review case.",
  eligibilityCriteria: ["synthetic fixture", "no PHI"],
  baselineComparator: "Synthetic descriptive baseline.",
  intervention: { label: "Deterministic documentation review", startedAt: generatedAt, completedAt: generatedAt },
  eventTimestamps: {
    eligibleAt: generatedAt,
    baselineObservedAt: generatedAt,
    interventionStartedAt: generatedAt,
    dispositionedAt: generatedAt
  },
  sourceLineage: ["synthetic-evidence-renewal-001"],
  versions: { model: "not-used", prompt: "not-used", tools: ["deterministic-rules"], policy: "synthetic-policy-v1" },
  clinicianAction: "accepted",
  overrideReasonCode: null,
  workflowDisposition: "accepted-for-internal-use",
  outcomes: [{
    metricId: "documentation-review-minutes",
    category: "operational",
    baselineValue: 30,
    observedValue: 18,
    unit: "minutes-per-accepted-review-packet",
    observedAt: generatedAt,
    sourceRef: "synthetic-evidence-renewal-001",
    interpretation: "descriptive-only"
  }],
  patientReportedOutcomes: [],
  safetyEventCodes: [],
  missingness: [],
  confounders: ["synthetic fixture", "uncontrolled comparison"],
  siteAttributes: ["synthetic site"],
  subgroupAttributes: ["synthetic authorization workflow"],
  latencyMs: 500,
  utilizationCount: 1,
  adoptionStatus: "accepted",
  costPerAcceptedOutcomeUsd: 0.3,
  traceId: "trace-renewal-case-001",
  correlationId: "correlation-renewal-case-001",
  governance: {
    consentStatus: "not-applicable-synthetic",
    duaStatus: "not-applicable-single-tenant",
    aggregationAuthorization: "single-tenant-only",
    purposeOfUse: "synthetic-renewal-evaluation"
  },
  analysisPlanStatus: "approved-for-synthetic-analysis",
  trustQaStatus: "approved-for-internal-synthetic-use",
  humanReviewRequired: true,
  syntheticOnly: true,
  noPhi: true
};
const approvedEvidence = buildCaseEvidencePacket(caseEvidenceInput, generatedAt);
assert.equal(verifyCaseEvidencePacketIntegrity(approvedEvidence), true);
const completedContract = {
  ...documentationBeforeAuthorizationValueContract,
  reviews: documentationBeforeAuthorizationValueContract.reviews.map((review) => ({ ...review, status: "completed" }))
};
const approvedDossier = buildRenewalEvidenceDossier({
  contract: completedContract,
  caseEvidence: [approvedEvidence],
  proposedClaims: [{
    claimId: "observed-review-time-change",
    statement: "The synthetic reviewed case recorded 18 minutes per accepted review packet versus a 30-minute descriptive baseline.",
    strength: "observed-fact",
    evidencePacketHashes: [approvedEvidence.evidencePacketHash],
    analysisMethod: "descriptive observation"
  }],
  generatedAt
});
assert.equal(approvedDossier.status, "ready-for-qualified-internal-review");
assert.equal(approvedDossier.externalDistributionAllowed, false);
assert.equal(approvedDossier.causalClaimAllowed, false);

const blockedDossier = buildRenewalEvidenceDossier({
  contract: completedContract,
  caseEvidence: [approvedEvidence],
  proposedClaims: [{
    claimId: "unverified-roi",
    statement: "Unverified workflow claim.",
    strength: "unverified-claim",
    evidencePacketHashes: [],
    analysisMethod: "none"
  }],
  generatedAt
});
assert.equal(blockedDossier.claims[0].status, "blocked");
assert.equal(blockedDossier.status, "evidence-or-review-gap");

const flags = getScrimedWorkFeatureFlags({});
assert.equal(flags.foundryDeploymentEnabled, false);
assert.equal(flags.caseEvidenceDurableStoreEnabled, false);
assert.equal(flags.externalImagingAdaptersEnabled, false);
assert.equal(flags.consequentialActionsEnabled, false);

console.log(
  "pass SCRIMED P31 workstreams (imaging QA, outcome learning, Foundry, value routing, Clinical Agent SRE, and renewal evidence)"
);
