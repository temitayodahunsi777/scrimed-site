#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  claudeOpus5UnverifiedCandidate,
  createAgentTeamTemplate,
  createModelAgentApprovalPassport,
  evaluateUnverifiedModelAdmission,
  evaluateProcurementReadiness,
  evaluateWorkforceTransitionProposal,
  getScrimedAgentTeamSummary,
  getScrimedImpactGovernanceSummary,
  getScrimedModelQualificationSummary,
  routeModelEvaluationEffort,
  scrimedPublicBenefitProcurementFields,
  scrimedSovereignHealthcareDeploymentProfile
} from "../app/lib/scrimed-work/index.ts";
import {
  calculateHealthcareValueReturned,
  calculateVerifiedIntelligenceYield
} from "../app/lib/scrimed-work/impactGovernance.ts";

const teams = getScrimedAgentTeamSummary();
assert.equal(teams.templateCount, 10);
assert.equal(teams.externalExecutionAllowed, false);
assert.equal(teams.clinicalAuthorityGranted, false);
assert.equal(teams.releaseAuthorityGranted, false);
for (const template of teams.templates) {
  const implementer = template.assignments.find((item) => item.teamRole === "implementer");
  const reviewer = template.assignments.find((item) => item.teamRole === "reviewer");
  const releaseVerifier = template.assignments.find((item) => item.teamRole === "release-verifier");
  assert.notEqual(implementer?.agentId, reviewer?.agentId);
  assert.notEqual(implementer?.agentId, releaseVerifier?.agentId);
  assert.equal(template.humanApprovalGateway.agentMaySatisfyGateway, false);
  assert.equal(template.unresolvedConflictAction, "escalate-to-human");
  assert.ok(template.costCeilingUsd > 0);
  assert.ok(template.runtimeCeilingMs > 0);
  assert.ok(template.actionCeiling > 0);
  assert.ok(template.toolAllowlist.length > 0);
  assert.deepEqual(template.networkAllowlist, []);
  assert.ok(template.safeStopConditions.includes("nonprogress detected"));
  assert.equal(template.auditTrailRequired, true);
  assert.equal(template.idempotencyRequired, true);
  assert.equal(template.independentReviewerIdentityRequired, true);
  assert.equal(template.outputLaunderingBlocked, true);
  assert.equal(template.externalExecutionAllowed, false);
}

const validTeam = teams.templates[0];
assert.throws(
  () =>
    createAgentTeamTemplate({
      ...validTeam,
      assignments: validTeam.assignments.map((assignment) =>
        assignment.teamRole === "reviewer"
          ? { ...assignment, agentId: "unknown-agent" }
          : assignment
      ),
      templateHash: undefined
    }),
  /unknown agent/
);
assert.throws(
  () =>
    createAgentTeamTemplate({
      ...validTeam,
      assignments: validTeam.assignments.map((assignment) =>
        assignment.teamRole === "reviewer"
          ? {
              ...assignment,
              agentId: validTeam.assignments.find((item) => item.teamRole === "implementer").agentId
            }
          : assignment
      ),
      templateHash: undefined
    }),
  /independent/
);
assert.throws(
  () =>
    createAgentTeamTemplate({
      ...validTeam,
      maximumDelegationDepth: 4,
      templateHash: undefined
    }),
  /delegation or retry budget/
);
assert.throws(
  () =>
    createAgentTeamTemplate({
      ...validTeam,
      costCeilingUsd: 1_000,
      templateHash: undefined
    }),
  /cost, runtime, action, or circuit-breaker bounds/
);
assert.throws(
  () =>
    createAgentTeamTemplate({
      ...validTeam,
      outputLaunderingBlocked: false,
      templateHash: undefined
    }),
  /weaken independent review/
);

const qualification = getScrimedModelQualificationSummary();
assert.equal(qualification.passportCount, qualification.modelPassportCount + qualification.agentPassportCount);
assert.equal(qualification.providerCallsAllowed, false);
assert.equal(qualification.phiAuthorization, false);
assert.equal(qualification.clinicalAuthorization, false);
assert.equal(claudeOpus5UnverifiedCandidate.verifiedModelId, null);
assert.equal(claudeOpus5UnverifiedCandidate.featureEnabled, false);
assert.equal(claudeOpus5UnverifiedCandidate.providerCallsAllowed, false);
assert.equal(claudeOpus5UnverifiedCandidate.verificationStatus, "awaiting_verified_model_id");

const environmentBypassDenied = evaluateUnverifiedModelAdmission({
  requestedCandidate: claudeOpus5UnverifiedCandidate,
  environmentRequestedEnabled: true,
  configuredModelId: "guessed-opus-model-id",
  officialEvidence: null,
  providerTermsReviewed: false,
  securityReviewPassed: false,
  offlineQualificationPassed: false
});
assert.equal(environmentBypassDenied.status, "awaiting_verified_model_id");
assert.equal(environmentBypassDenied.featureEnabled, false);
assert.equal(environmentBypassDenied.providerCallAllowed, false);
assert.ok(
  environmentBypassDenied.reasonCodes.includes("environment-flag-cannot-bypass-model-admission")
);

const syntheticPassport = qualification.passports.find(
  (passport) => passport.passportId === "passport-model-synthetic-fallback"
);
assert.ok(syntheticPassport);
assert.equal(syntheticPassport.approvalStatus, "approved-synthetic-evaluation");
assert.equal(syntheticPassport.phiAuthorization, false);
assert.throws(
  () =>
    createModelAgentApprovalPassport({
      ...syntheticPassport,
      passportId: "attempted-authority-escalation",
      phiAuthorization: true,
      passportHash: undefined
    }),
  /cannot grant PHI or clinical authority/
);
assert.throws(
  () =>
    createModelAgentApprovalPassport({
      ...syntheticPassport,
      passportId: "failed-gate-passport",
      evaluation: { ...syntheticPassport.evaluation, safety: "fail" },
      passportHash: undefined
    }),
  /requires every qualification gate to pass/
);

const lowEffort = routeModelEvaluationEffort({
  taskClass: "extraction",
  riskLevel: "low",
  providerSupportsEffortLevels: true,
  failedEffortLevels: [],
  explicitMaxApproval: false
});
assert.equal(lowEffort.status, "selected-for-offline-evaluation");
assert.equal(lowEffort.effortLevel, "low");
assert.equal(lowEffort.providerCallAllowed, false);

const budgetExhausted = routeModelEvaluationEffort({
  taskClass: "bounded-synthesis",
  riskLevel: "moderate",
  providerSupportsEffortLevels: true,
  failedEffortLevels: [],
  explicitMaxApproval: false,
  estimatedCostUsd: 6,
  maximumCostUsd: 5,
  retryCount: 2,
  maximumRetries: 2
});
assert.equal(budgetExhausted.status, "blocked");
assert.equal(budgetExhausted.budgetStatus, "budget-exhausted");
assert.equal(budgetExhausted.circuitBreakerOpen, true);
assert.equal(budgetExhausted.fallbackAction, "human-handoff");

const policyCompliantFallback = routeModelEvaluationEffort({
  taskClass: "classification",
  riskLevel: "low",
  providerSupportsEffortLevels: true,
  failedEffortLevels: [],
  explicitMaxApproval: false,
  providerAvailable: false,
  fallbackAvailable: true,
  fallbackSafetyTierPreserved: true,
  fallbackAttemptCount: 0,
  maximumFallbackAttempts: 1
});
assert.equal(policyCompliantFallback.status, "selected-for-offline-evaluation");
assert.equal(policyCompliantFallback.fallbackAction, "qualified-fallback-evaluation");
assert.equal(policyCompliantFallback.providerCallAllowed, false);

const fallbackLoopBlocked = routeModelEvaluationEffort({
  taskClass: "classification",
  riskLevel: "low",
  providerSupportsEffortLevels: true,
  failedEffortLevels: [],
  explicitMaxApproval: false,
  providerAvailable: false,
  fallbackAvailable: true,
  fallbackSafetyTierPreserved: true,
  fallbackAttemptCount: 2,
  maximumFallbackAttempts: 1
});
assert.equal(fallbackLoopBlocked.status, "blocked");
assert.ok(fallbackLoopBlocked.reasonCodes.includes("fallback-budget-exhausted"));
assert.ok(fallbackLoopBlocked.reasonCodes.includes("fallback-loop-detected"));

const escalatedEffort = routeModelEvaluationEffort({
  taskClass: "extraction",
  riskLevel: "moderate",
  providerSupportsEffortLevels: true,
  failedEffortLevels: ["low", "medium"],
  explicitMaxApproval: false
});
assert.equal(escalatedEffort.effortLevel, "high");

const maxBlocked = routeModelEvaluationEffort({
  taskClass: "exceptional-frontier",
  riskLevel: "high",
  providerSupportsEffortLevels: true,
  failedEffortLevels: ["xhigh"],
  explicitMaxApproval: false
});
assert.equal(maxBlocked.status, "blocked");
assert.equal(maxBlocked.effortLevel, null);
assert.ok(maxBlocked.reasonCodes.includes("max-effort-requires-explicit-human-approval"));

const maxApprovedForOfflineEvaluation = routeModelEvaluationEffort({
  taskClass: "exceptional-frontier",
  riskLevel: "high",
  providerSupportsEffortLevels: true,
  failedEffortLevels: ["xhigh"],
  explicitMaxApproval: true
});
assert.equal(maxApprovedForOfflineEvaluation.effortLevel, "max");
assert.equal(maxApprovedForOfflineEvaluation.providerCallAllowed, false);
assert.equal(maxApprovedForOfflineEvaluation.requiresHumanReview, true);

assert.equal(
  routeModelEvaluationEffort({
    taskClass: "architecture",
    riskLevel: "prohibited",
    providerSupportsEffortLevels: true,
    failedEffortLevels: [],
    explicitMaxApproval: true
  }).status,
  "blocked"
);
assert.deepEqual(
  routeModelEvaluationEffort({
    taskClass: "architecture",
    riskLevel: "prohibited",
    providerSupportsEffortLevels: false,
    failedEffortLevels: [],
    explicitMaxApproval: true
  }).reasonCodes,
  ["prohibited-risk", "task-minimum-high"]
);
assert.equal(
  routeModelEvaluationEffort({
    taskClass: "architecture",
    riskLevel: "low",
    providerSupportsEffortLevels: false,
    failedEffortLevels: [],
    explicitMaxApproval: false
  }).status,
  "provider-setting-unavailable"
);

const verifiedYield = calculateVerifiedIntelligenceYield({
  acceptedOutputs: {
    metricId: "accepted",
    label: "Accepted",
    value: 10,
    unit: "accepted-output-count",
    evidenceStatus: "verified",
    evidenceReference: "reviewed-evidence"
  },
  inferenceCostUsd: {
    metricId: "inference",
    label: "Inference",
    value: 1,
    unit: "usd",
    evidenceStatus: "verified",
    evidenceReference: "reviewed-evidence"
  },
  latencyBurdenUsd: {
    metricId: "latency",
    label: "Latency",
    value: 1,
    unit: "usd",
    evidenceStatus: "verified",
    evidenceReference: "reviewed-evidence"
  },
  humanCorrectionBurdenUsd: {
    metricId: "correction",
    label: "Correction",
    value: 3,
    unit: "usd",
    evidenceStatus: "verified",
    evidenceReference: "reviewed-evidence"
  }
});
assert.equal(verifiedYield.totalBurdenUsd, 5);
assert.equal(verifiedYield.yieldPerUsd, 2);
assert.equal(verifiedYield.evidenceStatus, "verified");
assert.equal(verifiedYield.publicRoiClaimAllowed, false);

assert.throws(
  () =>
    calculateVerifiedIntelligenceYield({
      acceptedOutputs: {
        metricId: "invalid",
        label: "Invalid",
        value: -1,
        unit: "accepted-output-count",
        evidenceStatus: "simulated",
        evidenceReference: "fixture"
      },
      inferenceCostUsd: {
        metricId: "cost",
        label: "Cost",
        value: 1,
        unit: "usd",
        evidenceStatus: "simulated",
        evidenceReference: "fixture"
      },
      latencyBurdenUsd: {
        metricId: "latency",
        label: "Latency",
        value: 1,
        unit: "usd",
        evidenceStatus: "simulated",
        evidenceReference: "fixture"
      },
      humanCorrectionBurdenUsd: {
        metricId: "correction",
        label: "Correction",
        value: 1,
        unit: "usd",
        evidenceStatus: "simulated",
        evidenceReference: "fixture"
      }
    }),
  /invalid/
);

const valueReturned = calculateHealthcareValueReturned({
  valueMetrics: [
    {
      metricId: "time",
      label: "Time returned",
      value: 12,
      unit: "normalized-value-points",
      category: "clinician-time",
      evidenceStatus: "estimated",
      evidenceReference: "approved-estimation-method"
    }
  ],
  totalOperatingAndAiCostUsd: {
    metricId: "cost",
    label: "Cost",
    value: 4,
    unit: "usd",
    evidenceStatus: "verified",
    evidenceReference: "reviewed-cost-record"
  },
  normalizationMethodReference: "approved-normalization-method"
});
assert.equal(valueReturned.normalizedValuePerUsd, 3);
assert.equal(valueReturned.evidenceStatus, "estimated");
assert.equal(valueReturned.syntheticOrEstimatedLabelRequired, true);
assert.equal(valueReturned.auditedFinancialMetric, false);

const incompleteWorkforce = evaluateWorkforceTransitionProposal({
  proposalId: "incomplete",
  workflowRedesignCompleted: false,
  trainingAndUpskillingPlan: false,
  redeploymentConsidered: false,
  workloadImpactMeasured: false,
  clinicianTimeProtectionPlan: false,
  transparentHumanReviewScheduled: false,
  roleEliminationProposed: false
});
assert.equal(incompleteWorkforce.decision, "blocked");
assert.equal(incompleteWorkforce.employmentActionAuthorized, false);

const roleElimination = evaluateWorkforceTransitionProposal({
  proposalId: "role-elimination",
  workflowRedesignCompleted: true,
  trainingAndUpskillingPlan: true,
  redeploymentConsidered: true,
  workloadImpactMeasured: true,
  clinicianTimeProtectionPlan: true,
  transparentHumanReviewScheduled: true,
  roleEliminationProposed: true
});
assert.equal(roleElimination.decision, "blocked");
assert.ok(roleElimination.reasonCodes.includes("employment-decision-external-authority"));

const impact = getScrimedImpactGovernanceSummary();
assert.equal(impact.workforceTransition.decision, "review-ready");
assert.equal(impact.intelligenceYield.evidenceStatus, "simulated");
assert.equal(impact.healthcareValueReturned.publicRoiClaimAllowed, false);
assert.equal(impact.procurement.status, "external-evidence-required");
assert.equal(scrimedSovereignHealthcareDeploymentProfile.productionActivationAllowed, false);

const verifiedProcurement = evaluateProcurementReadiness(
  scrimedPublicBenefitProcurementFields.map((field) => ({
    ...field,
    evidenceStatus: "verified",
    evidenceReference: `reviewed-${field.fieldId}`
  }))
);
assert.equal(verifiedProcurement.status, "human-review-ready");
assert.equal(verifiedProcurement.procurementApprovalGranted, false);
assert.equal(verifiedProcurement.contractAuthorityGranted, false);

console.log(
  `pass SCRIMED qualification and impact policy (${teams.templateCount} teams, ${qualification.passportCount} passports, ${scrimedPublicBenefitProcurementFields.length} procurement fields)`
);
