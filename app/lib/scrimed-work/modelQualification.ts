import { createAuditHash } from "./audit";
import { scrimedWorkAgents } from "./agentRegistry";
import { scrimedWorkProviderRegistry } from "./providerRegistry";
import type { ProviderRoutingClass, RiskLevel } from "./types";

export const scrimedModelQualificationPolicyVersion =
  "scrimed-model-agent-qualification-v1-2026-08-01";

export type QualificationEvidenceStatus =
  | "pass-synthetic"
  | "fail"
  | "not-evaluated"
  | "external-review-required";

export type ModelAgentApprovalPassport = {
  passportId: string;
  subjectType: "model" | "agent";
  subjectId: string;
  providerId: string;
  modelId: string | null;
  modelVersion: string;
  releaseDate: string | null;
  deploymentEnvironment: "synthetic-local" | "configured-provider" | "future-private";
  hostingJurisdiction: string;
  licenseStatus: "internal-synthetic" | "unverified" | "external-review-required";
  dataUseTermsStatus: "internal-synthetic" | "unverified" | "external-review-required";
  intendedUses: string[];
  prohibitedUses: string[];
  supportedModalities: ProviderRoutingClass[];
  contextLimit: number | null;
  toolUseCapability: boolean;
  evaluation: {
    safety: QualificationEvidenceStatus;
    factuality: QualificationEvidenceStatus;
    abstention: QualificationEvidenceStatus;
    security: QualificationEvidenceStatus;
    promptInjection: QualificationEvidenceStatus;
    code: QualificationEvidenceStatus;
    healthcare: QualificationEvidenceStatus;
  };
  economics: {
    costEvidence: "simulated" | "unverified";
    latencyEvidence: "simulated" | "unverified";
  };
  approvalStatus: "approved-synthetic-evaluation" | "evaluation-only" | "blocked";
  reviewBy: string;
  rollbackStrategy: string;
  fallbackSubjectId: string | null;
  phiAuthorization: false;
  clinicalAuthorization: false;
  sovereignDeploymentEligibility: "not-evaluated" | "synthetic-local-only";
  externalApprovalReferences: string[];
  passportHash: string;
};

type ModelAgentApprovalPassportInput = Omit<ModelAgentApprovalPassport, "passportHash">;

function uniqueSorted<T extends string>(values: T[]) {
  return [...new Set(values)].sort();
}

export function createModelAgentApprovalPassport(
  input: ModelAgentApprovalPassportInput
): ModelAgentApprovalPassport {
  if (!input.passportId.trim() || !input.subjectId.trim() || !input.providerId.trim()) {
    throw new Error("Model and agent passports require stable identities.");
  }
  if (!Number.isFinite(Date.parse(input.reviewBy))) {
    throw new Error("Model and agent passports require a valid review date.");
  }
  if (!input.intendedUses.length || !input.prohibitedUses.length) {
    throw new Error("Model and agent passports require intended and prohibited uses.");
  }
  if (
    input.phiAuthorization !== false ||
    input.clinicalAuthorization !== false ||
    input.externalApprovalReferences.some((reference) => !reference.trim())
  ) {
    throw new Error("Local passport construction cannot grant PHI or clinical authority.");
  }

  const evaluationStatuses = Object.values(input.evaluation);
  if (
    input.approvalStatus === "approved-synthetic-evaluation" &&
    evaluationStatuses.some((status) => status !== "pass-synthetic")
  ) {
    throw new Error("Synthetic evaluation approval requires every qualification gate to pass.");
  }
  if (
    input.approvalStatus !== "blocked" &&
    evaluationStatuses.some((status) => status === "fail")
  ) {
    throw new Error("A failed qualification gate blocks the passport.");
  }

  const base = {
    ...input,
    intendedUses: uniqueSorted(input.intendedUses),
    prohibitedUses: uniqueSorted(input.prohibitedUses),
    supportedModalities: uniqueSorted(input.supportedModalities),
    externalApprovalReferences: uniqueSorted(input.externalApprovalReferences)
  };

  return {
    ...base,
    passportHash: createAuditHash({
      type: "scrimed-model-agent-approval-passport",
      policyVersion: scrimedModelQualificationPolicyVersion,
      base
    })
  };
}

const allSyntheticPass = {
  safety: "pass-synthetic",
  factuality: "pass-synthetic",
  abstention: "pass-synthetic",
  security: "pass-synthetic",
  promptInjection: "pass-synthetic",
  code: "pass-synthetic",
  healthcare: "pass-synthetic"
} as const;

const allUnverified = {
  safety: "not-evaluated",
  factuality: "not-evaluated",
  abstention: "not-evaluated",
  security: "not-evaluated",
  promptInjection: "not-evaluated",
  code: "not-evaluated",
  healthcare: "not-evaluated"
} as const;

const sharedProhibitedUses = [
  "autonomous diagnosis",
  "autonomous treatment",
  "clinical sign-off",
  "customer go-live",
  "EHR writeback",
  "live PHI processing",
  "payer submission",
  "production deployment"
];

export const scrimedModelAgentApprovalPassports: ModelAgentApprovalPassport[] = [
  ...scrimedWorkProviderRegistry.map((provider) => {
    const syntheticApproved = provider.providerId === "synthetic-fallback";
    return createModelAgentApprovalPassport({
      passportId: `passport-model-${provider.providerId}`,
      subjectType: "model",
      subjectId: provider.modelId,
      providerId: provider.providerId,
      modelId: provider.modelId,
      modelVersion: syntheticApproved ? "deterministic-policy-fixture-v1" : "configured-at-runtime",
      releaseDate: null,
      deploymentEnvironment:
        provider.providerId === "local-private"
          ? "future-private"
          : syntheticApproved
            ? "synthetic-local"
            : "configured-provider",
      hostingJurisdiction: provider.dataResidency,
      licenseStatus: syntheticApproved ? "internal-synthetic" : "unverified",
      dataUseTermsStatus: syntheticApproved ? "internal-synthetic" : "external-review-required",
      intendedUses: syntheticApproved
        ? ["deterministic local policy testing", "synthetic workflow preparation"]
        : ["offline provider conformance evaluation"],
      prohibitedUses: sharedProhibitedUses,
      supportedModalities: provider.capabilities,
      contextLimit: provider.contextLimit,
      toolUseCapability: provider.toolCalling,
      evaluation: syntheticApproved ? allSyntheticPass : allUnverified,
      economics: {
        costEvidence: syntheticApproved ? "simulated" : "unverified",
        latencyEvidence: syntheticApproved ? "simulated" : "unverified"
      },
      approvalStatus: syntheticApproved ? "approved-synthetic-evaluation" : "blocked",
      reviewBy: "2026-10-30T00:00:00.000Z",
      rollbackStrategy: "Disable the provider feature flag and route to deterministic human handoff.",
      fallbackSubjectId: syntheticApproved ? "scrimed-independent-policy-handoff" : null,
      phiAuthorization: false,
      clinicalAuthorization: false,
      sovereignDeploymentEligibility: syntheticApproved ? "synthetic-local-only" : "not-evaluated",
      externalApprovalReferences: []
    });
  }),
  ...scrimedWorkAgents.map((agent) =>
    createModelAgentApprovalPassport({
      passportId: `passport-agent-${agent.agentId}`,
      subjectType: "agent",
      subjectId: agent.agentId,
      providerId: "scrimed-internal",
      modelId: null,
      modelVersion: agent.auditHash,
      releaseDate: null,
      deploymentEnvironment: "synthetic-local",
      hostingJurisdiction: "local-policy-runtime",
      licenseStatus: "internal-synthetic",
      dataUseTermsStatus: "internal-synthetic",
      intendedUses: [agent.purpose],
      prohibitedUses: [...sharedProhibitedUses, ...agent.blockedActions],
      supportedModalities: ["balanced"],
      contextLimit: null,
      toolUseCapability: agent.allowedToolCategories.length > 0,
      evaluation: allSyntheticPass,
      economics: { costEvidence: "simulated", latencyEvidence: "simulated" },
      approvalStatus: "approved-synthetic-evaluation",
      reviewBy: "2026-10-30T00:00:00.000Z",
      rollbackStrategy: "Disable the agent registry entry and preserve its audit history.",
      fallbackSubjectId: "reviewer-agent",
      phiAuthorization: false,
      clinicalAuthorization: false,
      sovereignDeploymentEligibility: "synthetic-local-only",
      externalApprovalReferences: []
    })
  )
];

export const claudeOpus5UnverifiedCandidate = {
  candidateId: "anthropic-claude-opus-5-unverified-candidate",
  requestedCandidateName: "Claude Opus 5",
  providerId: "anthropic-compatible",
  verifiedModelId: null,
  verificationStatus: "awaiting_verified_model_id",
  latestVerifiedOpusFamilyVersionAtReview: "Claude Opus 4.8",
  checkedAt: "2026-08-01T00:00:00.000Z",
  officialCatalogReference: "https://www.anthropic.com/claude/opus",
  featureFlag: "SCRIMED_CLAUDE_OPUS_5_EVALUATION_ENABLED",
  featureEnabled: false,
  providerCallsAllowed: false,
  phiAuthorization: false,
  clinicalAuthorization: false,
  publicPerformanceClaimsAllowed: false,
  admissionRequirements: {
    exactProviderModelId: "required-from-authoritative-provider-source",
    verificationSource: "official-provider-documentation-or-connected-provider-metadata",
    releaseOrVersion: "required",
    capabilities: ["structured-output", "tool-calling", "context-limit", "failure-semantics"],
    effortLevelMapping: ["low", "medium", "high", "xhigh", "max"],
    qualificationResults: "required-before-disabled-offline-profile-registration",
    allowedWorkloadsAfterQualification: ["synthetic-offline-evaluation"],
    prohibitedWorkloads: [
      "phi-processing",
      "clinical-execution",
      "diagnosis",
      "treatment",
      "payer-decision",
      "production-fallback"
    ],
    reviewDate: "2026-08-01"
  },
  nextAction:
    "Verify an official model ID, API capability, terms, pricing, residency, retention, and qualification evidence before creating an enabled profile."
} as const;

export type ModelAdmissionEvidence = {
  sourceType: "official-api-enumeration" | "official-provider-documentation" | "connected-provider-metadata";
  sourceUrl: string;
  exactModelId: string;
  releaseOrVersion: string;
  retrievedAt: string;
  supportedEffortLevels: ModelEffortLevel[];
  contextLimit: number;
  pricingSourceDate: string;
};

export function evaluateUnverifiedModelAdmission(input: {
  requestedCandidate: typeof claudeOpus5UnverifiedCandidate;
  environmentRequestedEnabled: boolean;
  configuredModelId: string | null;
  officialEvidence: ModelAdmissionEvidence | null;
  providerTermsReviewed: boolean;
  securityReviewPassed: boolean;
  offlineQualificationPassed: boolean;
}) {
  const reasonCodes: string[] = [];
  const evidence = input.officialEvidence;
  if (!evidence) reasonCodes.push("verified-official-model-evidence-required");
  if (!input.configuredModelId?.trim()) reasonCodes.push("exact-model-id-required");
  if (evidence && input.configuredModelId !== evidence.exactModelId) {
    reasonCodes.push("configured-model-id-does-not-match-official-evidence");
  }
  if (
    evidence &&
    (!evidence.sourceUrl.trim() ||
      !evidence.releaseOrVersion.trim() ||
      !Number.isFinite(Date.parse(evidence.retrievedAt)) ||
      !Number.isFinite(Date.parse(evidence.pricingSourceDate)) ||
      !Number.isInteger(evidence.contextLimit) ||
      evidence.contextLimit < 1 ||
      evidence.supportedEffortLevels.length === 0)
  ) {
    reasonCodes.push("official-model-evidence-incomplete");
  }
  if (!input.providerTermsReviewed) reasonCodes.push("provider-terms-review-required");
  if (!input.securityReviewPassed) reasonCodes.push("security-review-required");
  if (!input.offlineQualificationPassed) reasonCodes.push("offline-qualification-required");
  if (input.environmentRequestedEnabled && reasonCodes.length > 0) {
    reasonCodes.push("environment-flag-cannot-bypass-model-admission");
  }

  const status = reasonCodes.length
    ? "awaiting_verified_model_id"
    : "ready-for-disabled-offline-evaluation-registration";
  const base = {
    status,
    reasonCodes: uniqueSorted(reasonCodes),
    registryMutationAuthorized: false as const,
    featureEnabled: false as const,
    providerCallAllowed: false as const,
    phiAuthorization: false as const,
    clinicalAuthorization: false as const,
    productionAuthorization: false as const
  };
  return {
    ...base,
    decisionHash: createAuditHash({
      type: "scrimed-unverified-model-admission-decision",
      policyVersion: scrimedModelQualificationPolicyVersion,
      input,
      base
    })
  };
}

export type ModelEffortLevel = "low" | "medium" | "high" | "xhigh" | "max";

export type EffortRoutingInput = {
  taskClass:
    | "extraction"
    | "formatting"
    | "classification"
    | "bounded-synthesis"
    | "routine-subagent"
    | "architecture"
    | "policy-analysis"
    | "security-review"
    | "long-horizon-implementation"
    | "exceptional-frontier";
  riskLevel: RiskLevel;
  providerSupportsEffortLevels: boolean;
  failedEffortLevels: ModelEffortLevel[];
  explicitMaxApproval: boolean;
  estimatedCostUsd?: number;
  maximumCostUsd?: number;
  estimatedTokens?: number;
  maximumTokens?: number;
  estimatedLatencyMs?: number;
  maximumLatencyMs?: number;
  estimatedToolCalls?: number;
  maximumToolCalls?: number;
  retryCount?: number;
  maximumRetries?: number;
  providerAvailable?: boolean;
  fallbackAvailable?: boolean;
  fallbackSafetyTierPreserved?: boolean;
  fallbackAttemptCount?: number;
  maximumFallbackAttempts?: number;
};

export type EffortRoutingDecision = {
  status: "selected-for-offline-evaluation" | "blocked" | "provider-setting-unavailable";
  effortLevel: ModelEffortLevel | null;
  reasonCodes: string[];
  requiresHumanReview: boolean;
  budgetStatus: "within-budget" | "budget-exhausted" | "not-evaluated";
  fallbackAction: "none" | "qualified-fallback-evaluation" | "human-handoff";
  circuitBreakerOpen: boolean;
  providerCallAllowed: false;
  clinicalAuthorityGranted: false;
  decisionHash: string;
};

const effortOrder: ModelEffortLevel[] = ["low", "medium", "high", "xhigh", "max"];

const initialEffortByTask: Record<EffortRoutingInput["taskClass"], ModelEffortLevel> = {
  extraction: "low",
  formatting: "low",
  classification: "low",
  "bounded-synthesis": "medium",
  "routine-subagent": "medium",
  architecture: "high",
  "policy-analysis": "high",
  "security-review": "high",
  "long-horizon-implementation": "xhigh",
  "exceptional-frontier": "xhigh"
};

export function routeModelEvaluationEffort(input: EffortRoutingInput): EffortRoutingDecision {
  let status: EffortRoutingDecision["status"] = "selected-for-offline-evaluation";
  let effortLevel: ModelEffortLevel | null = initialEffortByTask[input.taskClass];
  const reasonCodes = [`task-minimum-${effortLevel}`];
  const budgetPairs = [
    [input.estimatedCostUsd, input.maximumCostUsd, "cost-budget-exhausted"],
    [input.estimatedTokens, input.maximumTokens, "token-budget-exhausted"],
    [input.estimatedLatencyMs, input.maximumLatencyMs, "latency-budget-exhausted"],
    [input.estimatedToolCalls, input.maximumToolCalls, "tool-call-budget-exhausted"],
    [input.retryCount, input.maximumRetries, "retry-budget-exhausted"],
    [input.fallbackAttemptCount, input.maximumFallbackAttempts, "fallback-budget-exhausted"]
  ] as const;
  const budgetConfigured = budgetPairs.some(
    ([observed, maximum]) => observed !== undefined || maximum !== undefined
  );
  const exhaustedBudgets = budgetPairs
    .filter(
      ([observed, maximum]) =>
        observed !== undefined &&
        maximum !== undefined &&
        (!Number.isFinite(observed) ||
          !Number.isFinite(maximum) ||
          observed < 0 ||
          maximum < 0 ||
          observed > maximum)
    )
    .map(([, , reason]) => reason);
  let fallbackAction: EffortRoutingDecision["fallbackAction"] = "none";
  let circuitBreakerOpen = false;

  if (exhaustedBudgets.length > 0) {
    status = "blocked";
    effortLevel = null;
    reasonCodes.push(...exhaustedBudgets);
    if (exhaustedBudgets.includes("fallback-budget-exhausted")) {
      reasonCodes.push("fallback-loop-detected");
    }
    circuitBreakerOpen = true;
    fallbackAction = "human-handoff";
  } else if (input.riskLevel === "prohibited") {
    status = "blocked";
    effortLevel = null;
    reasonCodes.push("prohibited-risk");
  } else if (!input.providerSupportsEffortLevels) {
    status = "provider-setting-unavailable";
    effortLevel = null;
    reasonCodes.push("provider-effort-contract-unverified");
  } else if (effortLevel) {
    const failed = new Set(input.failedEffortLevels);
    let currentIndex = effortOrder.indexOf(effortLevel);
    while (currentIndex < effortOrder.length - 1 && failed.has(effortOrder[currentIndex])) {
      currentIndex += 1;
      effortLevel = effortOrder[currentIndex];
      reasonCodes.push(`escalated-after-${effortOrder[currentIndex - 1]}-failure`);
    }

    if (effortLevel === "max" && !input.explicitMaxApproval) {
      status = "blocked";
      effortLevel = null;
      reasonCodes.push("max-effort-requires-explicit-human-approval");
    }
  }

  if (status === "selected-for-offline-evaluation" && input.providerAvailable === false) {
    if (input.fallbackAvailable && input.fallbackSafetyTierPreserved) {
      fallbackAction = "qualified-fallback-evaluation";
      reasonCodes.push("provider-unavailable-qualified-fallback-evaluation");
    } else {
      status = "blocked";
      effortLevel = null;
      fallbackAction = "human-handoff";
      circuitBreakerOpen = true;
      reasonCodes.push("provider-unavailable-no-policy-compliant-fallback");
    }
  }

  const base = {
    status,
    effortLevel,
    reasonCodes: uniqueSorted(reasonCodes),
    requiresHumanReview: input.riskLevel === "high" || input.taskClass === "exceptional-frontier",
    budgetStatus: exhaustedBudgets.length
      ? ("budget-exhausted" as const)
      : budgetConfigured
        ? ("within-budget" as const)
        : ("not-evaluated" as const),
    fallbackAction,
    circuitBreakerOpen,
    providerCallAllowed: false as const,
    clinicalAuthorityGranted: false as const
  };

  return {
    ...base,
    decisionHash: createAuditHash({
      type: "scrimed-model-effort-routing-decision",
      policyVersion: scrimedModelQualificationPolicyVersion,
      input,
      base
    })
  };
}

export function getScrimedModelQualificationSummary() {
  return {
    policyVersion: scrimedModelQualificationPolicyVersion,
    passports: scrimedModelAgentApprovalPassports,
    passportCount: scrimedModelAgentApprovalPassports.length,
    modelPassportCount: scrimedModelAgentApprovalPassports.filter(
      (passport) => passport.subjectType === "model"
    ).length,
    agentPassportCount: scrimedModelAgentApprovalPassports.filter(
      (passport) => passport.subjectType === "agent"
    ).length,
    unverifiedCandidates: [claudeOpus5UnverifiedCandidate],
    unverifiedCandidateAdmission: evaluateUnverifiedModelAdmission({
      requestedCandidate: claudeOpus5UnverifiedCandidate,
      environmentRequestedEnabled: false,
      configuredModelId: null,
      officialEvidence: null,
      providerTermsReviewed: false,
      securityReviewPassed: false,
      offlineQualificationPassed: false
    }),
    providerCallsAllowed: false,
    phiAuthorization: false,
    clinicalAuthorization: false,
    boundary:
      "Passports qualify exact configured subjects for synthetic evaluation only. Public leaderboards, vendor marketing, model names, or fluency cannot grant PHI, clinical, external-call, production, release, or customer-go-live authority."
  };
}
