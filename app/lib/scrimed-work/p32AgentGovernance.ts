import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import type { PolicyDecision } from "./p32Contracts";
import type { DataClassification, RiskLevel } from "./types";

export const scrimedP32AgentGovernanceVersion =
  "scrimed-p32-agent-governance-v1-2026-07-30";

export const scrimedP32AgentGovernanceBoundary =
  "SCRIMED p.32 agent jobs, delegations, and oversight plans are bounded metadata controls. They cannot grant live PHI, clinical authority, payer submission, EHR/RCM writeback, production deployment, or customer activation.";

export type GovernedActionClass =
  | "READ"
  | "DRAFT"
  | "RECOMMEND"
  | "REQUEST_APPROVAL"
  | "EXECUTE"
  | "PROHIBITED";

export type ApprovedActionRegistryEntry = {
  actionPattern: string;
  actionClass: GovernedActionClass;
  permittedRisk: RiskLevel[];
  independentHumanApprovalRequired: boolean;
  executionGrantRequired: boolean;
  correctionPathRequired: boolean;
  externalEffectAllowed: false;
};

export const p32ApprovedActionRegistry: ApprovedActionRegistryEntry[] = [
  {
    actionPattern: "read-authorized-metadata",
    actionClass: "READ",
    permittedRisk: ["low", "moderate"],
    independentHumanApprovalRequired: false,
    executionGrantRequired: false,
    correctionPathRequired: false,
    externalEffectAllowed: false
  },
  {
    actionPattern: "draft-reviewable-artifact",
    actionClass: "DRAFT",
    permittedRisk: ["low", "moderate", "high"],
    independentHumanApprovalRequired: false,
    executionGrantRequired: false,
    correctionPathRequired: true,
    externalEffectAllowed: false
  },
  {
    actionPattern: "recommend-decision-support",
    actionClass: "RECOMMEND",
    permittedRisk: ["low", "moderate", "high"],
    independentHumanApprovalRequired: true,
    executionGrantRequired: false,
    correctionPathRequired: true,
    externalEffectAllowed: false
  },
  {
    actionPattern: "request-independent-approval",
    actionClass: "REQUEST_APPROVAL",
    permittedRisk: ["low", "moderate", "high"],
    independentHumanApprovalRequired: true,
    executionGrantRequired: false,
    correctionPathRequired: true,
    externalEffectAllowed: false
  },
  {
    actionPattern: "execute-separately-authorized-operation",
    actionClass: "EXECUTE",
    permittedRisk: ["low", "moderate"],
    independentHumanApprovalRequired: true,
    executionGrantRequired: true,
    correctionPathRequired: true,
    externalEffectAllowed: false
  },
  {
    actionPattern:
      "diagnosis-treatment-prescribing-payer-ehr-production-or-self-promotion",
    actionClass: "PROHIBITED",
    permittedRisk: [],
    independentHumanApprovalRequired: true,
    executionGrantRequired: true,
    correctionPathRequired: true,
    externalEffectAllowed: false
  }
];

export type ReviewerCapacityBudget = {
  budgetId: string;
  tenantId: string;
  reviewerRole: string;
  maximumConcurrentReviews: number;
  maximumReviewsPerHour: number;
  maximumReviewsPerDay: number;
  assignedConcurrentReviews: number;
  completedReviewsThisHour: number;
  completedReviewsToday: number;
  oldestPendingReviewAgeMinutes: number;
  maximumPendingReviewAgeMinutes: number;
  state: "available" | "near-capacity" | "paused-capacity-exceeded";
  automaticPauseRequired: boolean;
  evaluatedAt: string;
  budgetHash: string;
};

export function buildReviewerCapacityBudget(
  input: Omit<
    ReviewerCapacityBudget,
    "state" | "automaticPauseRequired" | "budgetHash"
  >
): ReviewerCapacityBudget {
  const numericValues = [
    input.maximumConcurrentReviews,
    input.maximumReviewsPerHour,
    input.maximumReviewsPerDay,
    input.assignedConcurrentReviews,
    input.completedReviewsThisHour,
    input.completedReviewsToday,
    input.oldestPendingReviewAgeMinutes,
    input.maximumPendingReviewAgeMinutes
  ];
  if (
    numericValues.some((value) => !Number.isFinite(value) || value < 0) ||
    input.maximumConcurrentReviews < 1 ||
    input.maximumReviewsPerHour < 1 ||
    input.maximumReviewsPerDay < 1 ||
    input.maximumPendingReviewAgeMinutes < 1
  ) {
    throw new Error("Reviewer capacity budgets require finite positive limits");
  }
  if (!input.budgetId.trim() || !input.tenantId.trim() || !input.reviewerRole.trim()) {
    throw new Error("Reviewer capacity budgets require identity, tenant, and role");
  }
  if (!Number.isFinite(Date.parse(input.evaluatedAt))) {
    throw new Error("Reviewer capacity evaluation requires an ISO timestamp");
  }
  const exceeded =
    input.assignedConcurrentReviews >= input.maximumConcurrentReviews ||
    input.completedReviewsThisHour >= input.maximumReviewsPerHour ||
    input.completedReviewsToday >= input.maximumReviewsPerDay ||
    input.oldestPendingReviewAgeMinutes > input.maximumPendingReviewAgeMinutes;
  const nearCapacity =
    input.assignedConcurrentReviews / input.maximumConcurrentReviews >= 0.8 ||
    input.completedReviewsThisHour / input.maximumReviewsPerHour >= 0.8 ||
    input.completedReviewsToday / input.maximumReviewsPerDay >= 0.8;
  const payload = {
    ...input,
    state: exceeded
      ? ("paused-capacity-exceeded" as const)
      : nearCapacity
        ? ("near-capacity" as const)
        : ("available" as const),
    automaticPauseRequired: exceeded
  };
  return {
    ...payload,
    budgetHash: createClinicalEvidenceHash({
      type: "reviewer-capacity-budget",
      payload
    })
  };
}

export type HumanOversightPlan = {
  planId: string;
  tenantId: string;
  workflowId: string;
  requiredReviewerRole: string;
  namedReviewerIdentityHash: string | null;
  competenceEvidenceReferences: string[];
  requiredEvidenceReferences: string[];
  reviewSlaMinutes: number;
  capacityBudgetHash: string;
  escalationRole: string;
  abstentionPath: string;
  separationOfDutiesRequired: true;
  alertFatigueControls: string[];
  rubberStampDetectionRules: string[];
  decision: PolicyDecision;
  reasonCodes: string[];
  evaluatedAt: string;
  planHash: string;
};

export function buildHumanOversightPlan(
  input: Omit<
    HumanOversightPlan,
    "separationOfDutiesRequired" | "decision" | "reasonCodes" | "planHash"
  >,
  capacity: ReviewerCapacityBudget
): HumanOversightPlan {
  if (
    !input.planId.trim() ||
    !input.tenantId.trim() ||
    !input.workflowId.trim() ||
    !input.requiredReviewerRole.trim() ||
    !input.escalationRole.trim() ||
    !input.abstentionPath.trim()
  ) {
    throw new Error("Human oversight plans require workflow, role, escalation, and abstention");
  }
  if (
    !Number.isFinite(input.reviewSlaMinutes) ||
    input.reviewSlaMinutes <= 0 ||
    !Number.isFinite(Date.parse(input.evaluatedAt))
  ) {
    throw new Error("Human oversight plans require a positive SLA and ISO timestamp");
  }
  if (
    capacity.tenantId !== input.tenantId ||
    capacity.budgetHash !== input.capacityBudgetHash ||
    capacity.reviewerRole !== input.requiredReviewerRole
  ) {
    throw new Error("Human oversight capacity must bind the same tenant and reviewer role");
  }

  const reasonCodes: string[] = [];
  if (!input.namedReviewerIdentityHash) reasonCodes.push("NAMED_REVIEWER_REQUIRED");
  if (!input.competenceEvidenceReferences.length) {
    reasonCodes.push("REVIEWER_COMPETENCE_EVIDENCE_REQUIRED");
  }
  if (!input.requiredEvidenceReferences.length) {
    reasonCodes.push("REVIEW_CONTEXT_EVIDENCE_REQUIRED");
  }
  if (!input.alertFatigueControls.length || !input.rubberStampDetectionRules.length) {
    reasonCodes.push("OVERSIGHT_HUMAN_FACTORS_CONTROLS_REQUIRED");
  }
  if (capacity.automaticPauseRequired) {
    reasonCodes.push("REVIEWER_CAPACITY_EXCEEDED_WORK_PAUSED");
  }
  const decision: PolicyDecision = capacity.automaticPauseRequired
    ? "BLOCK"
    : reasonCodes.length
      ? "REQUIRE_HUMAN"
      : "ALLOW";
  const payload = {
    ...input,
    competenceEvidenceReferences: [...new Set(input.competenceEvidenceReferences)].sort(),
    requiredEvidenceReferences: [...new Set(input.requiredEvidenceReferences)].sort(),
    alertFatigueControls: [...new Set(input.alertFatigueControls)].sort(),
    rubberStampDetectionRules: [...new Set(input.rubberStampDetectionRules)].sort(),
    separationOfDutiesRequired: true as const,
    decision,
    reasonCodes: [...new Set(reasonCodes)].sort()
  };
  return {
    ...payload,
    planHash: createClinicalEvidenceHash({ type: "human-oversight-plan", payload })
  };
}

export type DelegationEnvelope = {
  delegationId: string;
  tenantId: string;
  issuerIdentityHash: string;
  recipientIdentityHash: string;
  purpose: string;
  permittedTools: string[];
  permittedResources: string[];
  permittedDataClasses: DataClassification[];
  maximumRisk: RiskLevel;
  parentDelegationHash: string | null;
  delegationChainIdentityHashes: string[];
  issuedAt: string;
  expiresAt: string;
  selfApprovalAllowed: false;
  circularDelegationDetected: boolean;
  valid: boolean;
  reasonCodes: string[];
  delegationHash: string;
};

export function createDelegationEnvelope(
  input: Omit<
    DelegationEnvelope,
    | "selfApprovalAllowed"
    | "circularDelegationDetected"
    | "valid"
    | "reasonCodes"
    | "delegationHash"
  >
): DelegationEnvelope {
  if (
    !input.delegationId.trim() ||
    !input.tenantId.trim() ||
    !input.purpose.trim() ||
    !input.permittedTools.length ||
    !input.permittedResources.length ||
    !input.permittedDataClasses.length
  ) {
    throw new Error("Delegation envelopes require bounded identity, purpose, and scopes");
  }
  if (
    !Number.isFinite(Date.parse(input.issuedAt)) ||
    !Number.isFinite(Date.parse(input.expiresAt)) ||
    Date.parse(input.expiresAt) <= Date.parse(input.issuedAt)
  ) {
    throw new Error("Delegation envelope timestamps are invalid");
  }
  const chain = [
    ...input.delegationChainIdentityHashes,
    input.issuerIdentityHash,
    input.recipientIdentityHash
  ];
  const circularDelegationDetected =
    input.issuerIdentityHash === input.recipientIdentityHash ||
    new Set(chain).size !== chain.length;
  const reasonCodes = circularDelegationDetected
    ? ["CIRCULAR_OR_SELF_DELEGATION_PROHIBITED"]
    : [];
  const payload = {
    ...input,
    permittedTools: [...new Set(input.permittedTools)].sort(),
    permittedResources: [...new Set(input.permittedResources)].sort(),
    permittedDataClasses: [...new Set(input.permittedDataClasses)].sort(),
    delegationChainIdentityHashes: [...input.delegationChainIdentityHashes],
    selfApprovalAllowed: false as const,
    circularDelegationDetected,
    valid: reasonCodes.length === 0,
    reasonCodes
  };
  return {
    ...payload,
    delegationHash: createClinicalEvidenceHash({ type: "delegation-envelope", payload })
  };
}

export type AgentJobManifest = {
  jobId: string;
  tenantId: string;
  actorId: string;
  agentId: string;
  purpose: string;
  actionClass: GovernedActionClass;
  requestedActions: string[];
  permittedResources: string[];
  dataClassifications: DataClassification[];
  toolContractHash: string;
  riskProfileHash: string;
  delegationHash: string | null;
  oversightPlanHash: string | null;
  idempotencyKey: string;
  limits: {
    maximumDurationMs: number;
    maximumTokens: number;
    maximumCostUsd: number;
    maximumRetries: number;
    maximumConcurrency: number;
    maximumToolCalls: number;
  };
  issuedAt: string;
  expiresAt: string;
  emergencyStopState: "clear" | "active";
  decision: PolicyDecision;
  reasonCodes: string[];
  manifestHash: string;
};

export function buildAgentJobManifest(
  input: Omit<AgentJobManifest, "decision" | "reasonCodes" | "manifestHash">,
  options: {
    delegation?: DelegationEnvelope;
    oversight?: HumanOversightPlan;
  } = {}
): AgentJobManifest {
  if (
    !input.jobId.trim() ||
    !input.tenantId.trim() ||
    !input.actorId.trim() ||
    !input.agentId.trim() ||
    !input.purpose.trim() ||
    !input.idempotencyKey.trim()
  ) {
    throw new Error("Agent jobs require stable identity, purpose, and idempotency");
  }
  if (
    !Number.isFinite(Date.parse(input.issuedAt)) ||
    !Number.isFinite(Date.parse(input.expiresAt)) ||
    Date.parse(input.expiresAt) <= Date.parse(input.issuedAt)
  ) {
    throw new Error("Agent job timestamps are invalid");
  }
  if (
    Object.values(input.limits).some((value) => !Number.isFinite(value) || value < 0) ||
    input.limits.maximumRetries > 5 ||
    input.limits.maximumConcurrency > 16 ||
    input.limits.maximumDurationMs <= 0 ||
    input.limits.maximumToolCalls <= 0
  ) {
    throw new Error("Agent job limits exceed the bounded runtime policy");
  }
  const reasonCodes: string[] = [];
  if (input.actionClass === "PROHIBITED") reasonCodes.push("PROHIBITED_ACTION_CLASS");
  if (input.emergencyStopState === "active") reasonCodes.push("EMERGENCY_STOP_ACTIVE");
  if (
    input.delegationHash &&
    (!options.delegation ||
      options.delegation.delegationHash !== input.delegationHash ||
      options.delegation.tenantId !== input.tenantId ||
      !options.delegation.valid)
  ) {
    reasonCodes.push("DELEGATION_INVALID_OR_UNBOUND");
  }
  if (
    ["RECOMMEND", "REQUEST_APPROVAL", "EXECUTE"].includes(input.actionClass) &&
    (!options.oversight ||
      options.oversight.planHash !== input.oversightPlanHash ||
      options.oversight.tenantId !== input.tenantId ||
      options.oversight.decision !== "ALLOW")
  ) {
    reasonCodes.push("READY_HUMAN_OVERSIGHT_PLAN_REQUIRED");
  }
  const decision: PolicyDecision = reasonCodes.some((reason) =>
    [
      "PROHIBITED_ACTION_CLASS",
      "EMERGENCY_STOP_ACTIVE",
      "DELEGATION_INVALID_OR_UNBOUND"
    ].includes(reason)
  )
    ? "BLOCK"
    : reasonCodes.length
      ? "REQUIRE_HUMAN"
      : "ALLOW";
  const payload = {
    ...input,
    requestedActions: [...new Set(input.requestedActions)].sort(),
    permittedResources: [...new Set(input.permittedResources)].sort(),
    dataClassifications: [...new Set(input.dataClassifications)].sort(),
    decision,
    reasonCodes: [...new Set(reasonCodes)].sort()
  };
  return {
    ...payload,
    manifestHash: createClinicalEvidenceHash({ type: "agent-job-manifest", payload })
  };
}

export function getP32AgentGovernanceSummary() {
  return {
    version: scrimedP32AgentGovernanceVersion,
    records: [
      "AgentJobManifest",
      "ApprovedActionRegistry",
      "DelegationEnvelope",
      "HumanOversightPlan",
      "ReviewerCapacityBudget"
    ],
    actionClasses: p32ApprovedActionRegistry.map((entry) => entry.actionClass),
    defaultDecision: "deny",
    emergencyStopRequired: true,
    productionExecutionAuthority: false,
    boundary: scrimedP32AgentGovernanceBoundary
  } as const;
}
