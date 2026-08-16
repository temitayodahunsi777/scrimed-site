import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import type {
  AgentActionApproval,
  AgentActionAuthorization,
  AgentActionPolicyDecision,
  AgentActionPolicyRequest,
  ContinuousAssuranceDecisionRecord,
  ContinuousAssuranceGateId,
  ContinuousAssuranceGateRecord,
  ContextDataClassification,
  PilotReadinessDecision,
  PilotReadinessProfileId,
  PilotValueRealizationContract,
  ProviderDependencyFootprint,
  ProviderFailoverDecision,
  QualityRatchetDecision,
  QualityRatchetScore
} from "./types";

export const p33ContinuousAssuranceVersion =
  "scrimed-p33-continuous-assurance-v1-2026-08-15";

export const p33ContinuousAssuranceBoundary =
  "Continuous Assurance evaluates synthetic, no-PHI governance evidence and prepares human review. It does not authorize PHI, clinical action, provider calls, migration, deployment, customer activation, or external distribution; exact-candidate and operator evidence remain non-bypassable.";

const hashPattern = /^[0-9a-f]{64}$/i;
const idPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,159}$/;

function canonical(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

function assertHash(value: string | null, label: string) {
  if (value !== null && !hashPattern.test(value)) {
    throw new Error(`${label} must be a SHA-256 fingerprint`);
  }
}

function assertId(value: string, label: string) {
  if (!idPattern.test(value)) throw new Error(`${label} must be a bounded identifier`);
}

function validDate(value: string) {
  return Number.isFinite(Date.parse(value));
}

function pathWithinRoot(path: string, root: string) {
  if (!path.startsWith("/") || path.includes("..") || root === "/") return false;
  return path === root || path.startsWith(`${root}/`);
}

function approvalMismatchReasons(
  request: AgentActionPolicyRequest,
  approval: AgentActionApproval,
  now: string
) {
  const reasons: string[] = [];
  if (approval.disposition !== "approved") reasons.push("APPROVAL_REJECTED");
  if (approval.nonce !== request.approvalNonce) reasons.push("APPROVAL_NONCE_MISMATCH");
  if (approval.idempotencyKey !== request.idempotencyKey) reasons.push("APPROVAL_IDEMPOTENCY_KEY_MISMATCH");
  if (approval.actorIdHash !== request.actorIdHash) reasons.push("APPROVAL_ACTOR_MISMATCH");
  if (approval.approverIdHash === request.actorIdHash) reasons.push("SELF_APPROVAL_PROHIBITED");
  if (approval.tenantId !== request.tenantId) reasons.push("APPROVAL_TENANT_MISMATCH");
  if (approval.candidateHash !== request.candidateHash) reasons.push("APPROVAL_CANDIDATE_MISMATCH");
  if (approval.actionId !== request.actionId) reasons.push("APPROVAL_ACTION_MISMATCH");
  if (approval.argumentsHash !== request.argumentsHash) reasons.push("APPROVAL_ARGUMENTS_MISMATCH");
  if (approval.target !== request.target) reasons.push("APPROVAL_TARGET_MISMATCH");
  if (approval.policyVersion !== request.policyVersion) reasons.push("APPROVAL_POLICY_MISMATCH");
  if (!validDate(approval.issuedAt) || !validDate(approval.expiresAt)) {
    reasons.push("APPROVAL_TIME_INVALID");
  } else if (Date.parse(approval.issuedAt) > Date.parse(now)) {
    reasons.push("APPROVAL_NOT_YET_VALID");
  } else if (Date.parse(approval.expiresAt) <= Date.parse(now)) {
    reasons.push("APPROVAL_EXPIRED");
  }
  return reasons;
}

export function evaluateAgentActionPolicy(input: {
  request: AgentActionPolicyRequest;
  authorization: AgentActionAuthorization;
  approval: AgentActionApproval | null;
  discoveredToolIds: string[];
  usedApprovalIds: string[];
  now: string;
}): AgentActionPolicyDecision {
  const { request, authorization } = input;
  assertId(request.actionId, "action id");
  assertId(request.approvalNonce, "approval nonce");
  assertId(request.idempotencyKey, "idempotency key");
  assertId(request.tenantId, "tenant id");
  assertHash(request.actorIdHash, "actor identity");
  assertHash(request.candidateHash, "candidate");
  assertHash(request.argumentsHash, "arguments");
  assertHash(authorization.candidateHash, "authorization candidate");
  if (!validDate(input.now) || !validDate(authorization.expiresAt)) {
    throw new Error("Agent policy evaluation requires valid timestamps");
  }

  const reasonCodes: string[] = [];
  const humanApprovalRequired = request.actionClass !== "read";
  if (!input.discoveredToolIds.includes(request.toolId)) reasonCodes.push("TOOL_NOT_DISCOVERED");
  if (!authorization.authorizedToolIds.includes(request.toolId)) reasonCodes.push("TOOL_NOT_AUTHORIZED");
  if (authorization.tenantId !== request.tenantId) reasonCodes.push("AUTHORIZATION_TENANT_MISMATCH");
  if (authorization.candidateHash !== request.candidateHash) reasonCodes.push("AUTHORIZATION_CANDIDATE_MISMATCH");
  if (Date.parse(authorization.expiresAt) <= Date.parse(input.now)) reasonCodes.push("AUTHORIZATION_EXPIRED");
  if (request.dataClassification === "phi-prohibited") reasonCodes.push("PHI_INPUT_PROHIBITED");
  if (request.environment === "production" || /(?:^|[.:/-])production(?:$|[.:/-])/i.test(request.target)) {
    reasonCodes.push("PRODUCTION_TARGET_PROHIBITED");
  }
  if (request.networkDestinations.some((destination) =>
    destination === "*" ||
    destination === "internet" ||
    !authorization.allowedNetworkDestinations.includes(destination)
  )) {
    reasonCodes.push("NETWORK_DESTINATION_NOT_ALLOWLISTED");
  }
  if (request.filesystemPaths.some((path) =>
    !authorization.allowedFilesystemRoots.some((root) => pathWithinRoot(path, root))
  )) {
    reasonCodes.push("FILESYSTEM_PATH_NOT_ALLOWLISTED");
  }
  if (humanApprovalRequired) {
    if (!input.approval) {
      reasonCodes.push("EXACT_HUMAN_APPROVAL_REQUIRED");
    } else {
      if (input.usedApprovalIds.includes(input.approval.approvalId)) {
        reasonCodes.push("APPROVAL_REPLAY_DETECTED");
      }
      reasonCodes.push(...approvalMismatchReasons(request, input.approval, input.now));
    }
  }
  if (request.actionClass !== "read" && request.mode === "execute") {
    reasonCodes.push("CONSEQUENTIAL_EXECUTION_DISABLED_IN_LOCAL_CANDIDATE");
  }

  const blockingReasons = new Set([
    "TOOL_NOT_AUTHORIZED",
    "TOOL_NOT_DISCOVERED",
    "AUTHORIZATION_TENANT_MISMATCH",
    "AUTHORIZATION_CANDIDATE_MISMATCH",
    "AUTHORIZATION_EXPIRED",
    "PHI_INPUT_PROHIBITED",
    "PRODUCTION_TARGET_PROHIBITED",
    "NETWORK_DESTINATION_NOT_ALLOWLISTED",
    "FILESYSTEM_PATH_NOT_ALLOWLISTED",
    "APPROVAL_REJECTED",
    "APPROVAL_REPLAY_DETECTED",
    "APPROVAL_NONCE_MISMATCH",
    "APPROVAL_IDEMPOTENCY_KEY_MISMATCH",
    "APPROVAL_ACTOR_MISMATCH",
    "SELF_APPROVAL_PROHIBITED",
    "APPROVAL_TENANT_MISMATCH",
    "APPROVAL_CANDIDATE_MISMATCH",
    "APPROVAL_ACTION_MISMATCH",
    "APPROVAL_ARGUMENTS_MISMATCH",
    "APPROVAL_TARGET_MISMATCH",
    "APPROVAL_POLICY_MISMATCH",
    "APPROVAL_TIME_INVALID",
    "APPROVAL_NOT_YET_VALID",
    "APPROVAL_EXPIRED",
    "CONSEQUENTIAL_EXECUTION_DISABLED_IN_LOCAL_CANDIDATE"
  ]);
  const normalizedReasons = canonical(reasonCodes);
  const decision = normalizedReasons.some((reason) => blockingReasons.has(reason))
    ? "BLOCK" as const
    : normalizedReasons.length
      ? "REQUIRE_HUMAN" as const
      : "ALLOW" as const;
  const payload = {
    decision,
    reasonCodes: normalizedReasons,
    discoveryGrantsAuthority: false as const,
    dryRunRequired: request.actionClass !== "read",
    externalExecutionAuthorized: false as const,
    humanApprovalRequired
  };
  return {
    ...payload,
    policyReceiptHash: createClinicalEvidenceHash({
      type: "p33-agent-action-policy-decision",
      version: p33ContinuousAssuranceVersion,
      request,
      authorization,
      approval: input.approval,
      usedApprovalIds: canonical(input.usedApprovalIds),
      discoveredToolIds: canonical(input.discoveredToolIds),
      evaluatedAt: input.now,
      payload
    })
  };
}

const dependencyKeys: Array<keyof Omit<ProviderDependencyFootprint, "providerId" | "safetyTier" | "privacyTier" | "eligible">> = [
  "controllingCorporateFamily",
  "cloud",
  "region",
  "acceleratorPool",
  "identityProvider",
  "network",
  "jurisdiction"
];

export function evaluateProviderFailover(
  primary: ProviderDependencyFootprint,
  fallback: ProviderDependencyFootprint | null
): ProviderFailoverDecision {
  const reasonCodes: string[] = [];
  const sharedMaterialDependencies = fallback
    ? dependencyKeys.filter((key) => primary[key] === fallback[key]).map(String)
    : [];
  if (!primary.eligible) reasonCodes.push("PRIMARY_NOT_ELIGIBLE");
  if (!fallback) reasonCodes.push("INDEPENDENT_FALLBACK_REQUIRED");
  if (fallback && !fallback.eligible) reasonCodes.push("FALLBACK_NOT_ELIGIBLE");
  if (fallback && fallback.providerId === primary.providerId) reasonCodes.push("FALLBACK_PROVIDER_NOT_DISTINCT");
  if (sharedMaterialDependencies.length) reasonCodes.push("FALLBACK_NOT_MATERIALLY_INDEPENDENT");
  if (fallback && fallback.safetyTier < primary.safetyTier) reasonCodes.push("FALLBACK_SAFETY_TIER_DOWNGRADE");
  if (fallback && fallback.privacyTier < primary.privacyTier) reasonCodes.push("FALLBACK_PRIVACY_TIER_DOWNGRADE");
  const payload = {
    decision: reasonCodes.length ? "BLOCK" as const : "ALLOW" as const,
    primaryProviderId: primary.providerId,
    fallbackProviderId: fallback?.providerId ?? null,
    sharedMaterialDependencies: canonical(sharedMaterialDependencies),
    reasonCodes: canonical(reasonCodes),
    silentDowngradeAllowed: false as const,
    providerCallExecuted: false as const
  };
  return {
    ...payload,
    evidenceHash: createClinicalEvidenceHash({
      type: "p33-provider-failover-decision",
      version: p33ContinuousAssuranceVersion,
      primary,
      fallback,
      payload
    })
  };
}

export function evaluateProviderResilienceDrill(input: {
  failoverDecision: ProviderFailoverDecision;
  primaryFailureDetected: boolean;
  circuitOpened: boolean;
  retryCount: number;
  maximumRetries: number;
  fallbackCompleted: boolean;
  auditContinuityPreserved: boolean;
}) {
  if (!Number.isInteger(input.retryCount) || !Number.isInteger(input.maximumRetries) || input.retryCount < 0 || input.maximumRetries < 0) {
    throw new Error("Provider resilience retries must be nonnegative integers");
  }
  const reasonCodes: string[] = [];
  if (!input.primaryFailureDetected) reasonCodes.push("PRIMARY_FAILURE_NOT_DETECTED");
  if (!input.circuitOpened) reasonCodes.push("CIRCUIT_BREAKER_DID_NOT_OPEN");
  if (input.retryCount > input.maximumRetries) reasonCodes.push("RETRY_BUDGET_EXHAUSTED");
  if (input.failoverDecision.decision !== "ALLOW") reasonCodes.push("QUALIFIED_INDEPENDENT_FALLBACK_UNAVAILABLE");
  if (!input.fallbackCompleted) reasonCodes.push("FALLBACK_RECOVERY_NOT_COMPLETED");
  if (!input.auditContinuityPreserved) reasonCodes.push("AUDIT_CONTINUITY_NOT_PRESERVED");
  const payload = {
    status: reasonCodes.length ? "BLOCKED" as const : "PASS" as const,
    reasonCodes: canonical(reasonCodes),
    boundedRetries: input.retryCount <= input.maximumRetries,
    primaryReentryAuthorized: false as const,
    providerCallExecuted: false as const
  };
  return {
    ...payload,
    drillHash: createClinicalEvidenceHash({
      type: "p33-provider-resilience-drill",
      version: p33ContinuousAssuranceVersion,
      input,
      payload
    })
  };
}

export function evaluateProviderPortability(input: {
  adapterContractVersion: string;
  configurationExportHash: string;
  failoverDecision: ProviderFailoverDecision;
  exitRunbookId: string;
  proprietaryCredentialMaterialIncluded: boolean;
}) {
  assertId(input.adapterContractVersion, "adapter contract version");
  assertHash(input.configurationExportHash, "configuration export");
  assertId(input.exitRunbookId, "exit runbook id");
  const reasonCodes: string[] = [];
  if (input.failoverDecision.decision !== "ALLOW") reasonCodes.push("INDEPENDENT_ROUTE_TEST_FAILED");
  if (input.proprietaryCredentialMaterialIncluded) reasonCodes.push("EXPORT_CONTAINS_CREDENTIAL_MATERIAL");
  const payload = {
    status: reasonCodes.length ? "BLOCKED" as const : "PASS" as const,
    reasonCodes: canonical(reasonCodes),
    providerNeutral: true as const,
    credentialMaterialIncluded: false as const,
    activationAuthorized: false as const
  };
  return {
    ...payload,
    evidenceHash: createClinicalEvidenceHash({
      type: "p33-provider-portability-evidence",
      version: p33ContinuousAssuranceVersion,
      input,
      payload
    })
  };
}

function validateQualityScore(score: QualityRatchetScore, label: string) {
  for (const key of ["taskQuality", "severeErrorRate", "unauthorizedActionRate", "grounding"] as const) {
    if (!Number.isFinite(score[key]) || score[key] < 0 || score[key] > 1) {
      throw new Error(`${label} ${key} must be between zero and one`);
    }
  }
  if (score.costPerCompletedTaskUsd < 0 || score.p95LatencyMs < 0) {
    throw new Error(`${label} cost and latency must be nonnegative`);
  }
}

export function evaluateQualityRatchet(input: {
  baseline: QualityRatchetScore;
  challenger: QualityRatchetScore;
  hardFloors: {
    safety: boolean;
    authorization: boolean;
    privacy: boolean;
    clinical: boolean;
    provenance: boolean;
  };
  worstMaterialCellPassed: boolean;
  taskLevelEvidenceComplete: boolean;
  softRegressionApproved: boolean;
  independentHumanReviewComplete: boolean;
}): QualityRatchetDecision {
  validateQualityScore(input.baseline, "baseline");
  validateQualityScore(input.challenger, "challenger");
  const reasonCodes: string[] = [];
  const failedHardFloors = Object.entries(input.hardFloors)
    .filter(([, passed]) => !passed)
    .map(([key]) => `HARD_FLOOR_${key.toUpperCase()}_FAILED`);
  reasonCodes.push(...failedHardFloors);
  if (!input.worstMaterialCellPassed) reasonCodes.push("WORST_MATERIAL_CELL_FAILED");
  if (!input.taskLevelEvidenceComplete) reasonCodes.push("TASK_LEVEL_EVIDENCE_INCOMPLETE");
  if (input.challenger.taskQuality < input.baseline.taskQuality) reasonCodes.push("TASK_QUALITY_REGRESSION");
  if (input.challenger.grounding < input.baseline.grounding) reasonCodes.push("GROUNDING_REGRESSION");
  if (input.challenger.severeErrorRate > input.baseline.severeErrorRate) reasonCodes.push("SEVERE_ERROR_REGRESSION");
  if (input.challenger.unauthorizedActionRate > 0) reasonCodes.push("UNAUTHORIZED_ACTION_RATE_NONZERO");
  const softRegression =
    input.challenger.costPerCompletedTaskUsd > input.baseline.costPerCompletedTaskUsd ||
    input.challenger.p95LatencyMs > input.baseline.p95LatencyMs;
  if (softRegression && !input.softRegressionApproved) reasonCodes.push("SOFT_REGRESSION_APPROVAL_REQUIRED");
  if (!input.independentHumanReviewComplete) reasonCodes.push("INDEPENDENT_HUMAN_REVIEW_REQUIRED");

  const hardFloorsPassed = failedHardFloors.length === 0 && input.worstMaterialCellPassed;
  const qualityNonRegressionPassed = !reasonCodes.some((reason) => [
    "TASK_QUALITY_REGRESSION",
    "GROUNDING_REGRESSION",
    "SEVERE_ERROR_REGRESSION",
    "UNAUTHORIZED_ACTION_RATE_NONZERO",
    "TASK_LEVEL_EVIDENCE_INCOMPLETE"
  ].includes(reason));
  const blocking = !hardFloorsPassed || !qualityNonRegressionPassed;
  const normalizedReasons = canonical(reasonCodes);
  const payload = {
    decision: blocking
      ? "BLOCK" as const
      : normalizedReasons.length
        ? "REQUIRE_HUMAN" as const
        : "ALLOW" as const,
    reasonCodes: normalizedReasons,
    hardFloorsPassed,
    qualityNonRegressionPassed,
    softRegressionApprovalRequired: softRegression,
    automaticPromotionAllowed: false as const,
    eligibleForIndependentReview: hardFloorsPassed && qualityNonRegressionPassed
  };
  return {
    ...payload,
    decisionHash: createClinicalEvidenceHash({
      type: "p33-quality-ratchet-decision",
      version: p33ContinuousAssuranceVersion,
      input,
      payload
    })
  };
}

export function evaluatePilotValueContract(contract: PilotValueRealizationContract) {
  assertId(contract.contractId, "value contract id");
  assertId(contract.tenantId, "value contract tenant");
  const reasonCodes: string[] = [];
  const textFields = [
    contract.workflow,
    contract.baseline,
    contract.comparator,
    contract.intendedUser,
    contract.businessOwnerRole,
    contract.measurementWindow
  ];
  if (textFields.some((value) => !value.trim())) reasonCodes.push("VALUE_CONTRACT_REQUIRED_FIELD_MISSING");
  const listFields: Array<[string, string[]]> = [
    ["success-thresholds", contract.successThresholds],
    ["safety-stop-thresholds", contract.safetyStopThresholds],
    ["rollback-criteria", contract.rollbackCriteria],
    ["cost-capacity-metrics", contract.costAndCapacityMetrics],
    ["adoption-training-plan", contract.adoptionAndTrainingPlan],
    ["affected-systems", contract.affectedSystems],
    ["exit-export-plan", contract.exitAndExportPlan]
  ];
  for (const [label, values] of listFields) {
    if (!canonical(values).length) reasonCodes.push(`VALUE_CONTRACT_${label.toUpperCase().replaceAll("-", "_")}_MISSING`);
  }
  if (!contract.approvedByActorHashes.length) reasonCodes.push("NAMED_OWNER_APPROVAL_REQUIRED");
  for (const hash of contract.approvedByActorHashes) assertHash(hash, "value contract approver");
  const normalizedReasons = canonical(reasonCodes);
  const hardMissing = normalizedReasons.some((reason) => reason !== "NAMED_OWNER_APPROVAL_REQUIRED");
  const payload = {
    status: hardMissing
      ? "BLOCKED" as const
      : normalizedReasons.length
        ? "OPERATOR_REQUIRED" as const
        : "PASS" as const,
    reasonCodes: normalizedReasons,
    roiGuaranteeAuthorized: false as const,
    externalClaimAuthorized: false as const
  };
  return {
    ...payload,
    contractHash: createClinicalEvidenceHash({
      type: "p33-pilot-value-realization-contract",
      version: p33ContinuousAssuranceVersion,
      contract,
      payload
    })
  };
}

export function evaluateShadowPilotRehearsal(input: {
  syntheticOnly: boolean;
  externalActionsExecuted: boolean;
  policyDecision: AgentActionPolicyDecision;
  valueContractStatus: "PASS" | "OPERATOR_REQUIRED" | "BLOCKED";
  stopRulesConfigured: boolean;
  rollbackTested: boolean;
  trainingSteps: string[];
  namedPilotOwnerApproved: boolean;
}) {
  const reasonCodes: string[] = [];
  if (!input.syntheticOnly) reasonCodes.push("SHADOW_REHEARSAL_MUST_BE_SYNTHETIC");
  if (input.externalActionsExecuted) reasonCodes.push("SHADOW_REHEARSAL_EXECUTED_EXTERNAL_ACTION");
  if (input.policyDecision.externalExecutionAuthorized) reasonCodes.push("POLICY_GRANTED_EXTERNAL_EXECUTION");
  if (input.policyDecision.decision === "ALLOW" && input.policyDecision.humanApprovalRequired) {
    reasonCodes.push("HUMAN_APPROVAL_BOUNDARY_NOT_RETAINED");
  }
  if (input.valueContractStatus === "BLOCKED") reasonCodes.push("VALUE_CONTRACT_BLOCKED");
  if (!input.stopRulesConfigured) reasonCodes.push("STOP_RULES_NOT_CONFIGURED");
  if (!input.rollbackTested) reasonCodes.push("ROLLBACK_NOT_TESTED");
  if (!canonical(input.trainingSteps).length) reasonCodes.push("TRAINING_PLAN_MISSING");
  const technicalReasons = canonical(reasonCodes);
  const payload = {
    technicalStatus: technicalReasons.length ? "BLOCKED" as const : "PASS" as const,
    status: technicalReasons.length
      ? "BLOCKED" as const
      : input.namedPilotOwnerApproved
        ? "PASS" as const
        : "OPERATOR_REQUIRED" as const,
    reasonCodes: canonical([
      ...technicalReasons,
      ...(input.namedPilotOwnerApproved ? [] : ["NAMED_PILOT_OWNER_APPROVAL_REQUIRED"])
    ]),
    externalActionsExecuted: false as const,
    clinicalActionsAuthorized: false as const,
    livePhiAllowed: false as const
  };
  return {
    ...payload,
    rehearsalHash: createClinicalEvidenceHash({
      type: "p33-shadow-pilot-rehearsal",
      version: p33ContinuousAssuranceVersion,
      input,
      payload
    })
  };
}

export type StrategicGateEvidenceSignal = {
  evidenceId: string;
  present: boolean;
  artifactHash: string | null;
  candidateHash: string;
  issuedAt: string;
  expiresAt: string;
};

export type StrategicGateEvidence = Record<ContinuousAssuranceGateId, {
  signals: StrategicGateEvidenceSignal[];
  operatorApprovalComplete: boolean;
}>;

const strategicGateDefinitions: Record<ContinuousAssuranceGateId, {
  key: string;
  description: string;
  ownerRole: string;
  requiredEvidence: string[];
  externalApprovalRequired: boolean;
  operatorEvidence: string[];
  remediationSteps: string[];
}> = {
  G21: {
    key: "dependency-resilience-provider-failover",
    description: "Dependency resilience and materially independent provider failover.",
    ownerRole: "platform-security-owner",
    requiredEvidence: ["qualified-primary-route", "materially-independent-fallback", "circuit-breaker-recovery-test"],
    externalApprovalRequired: false,
    operatorEvidence: [],
    remediationSteps: ["Retest primary failure and independent fallback without lowering safety, privacy, or jurisdiction requirements."]
  },
  G22: {
    key: "value-realization-contract",
    description: "Pilot value-realization contract with baselines, stop rules, owners, measurement, and exit plan.",
    ownerRole: "business-and-clinical-owners",
    requiredEvidence: ["complete-value-contract", "baseline-and-comparator", "named-owner-approval"],
    externalApprovalRequired: true,
    operatorEvidence: ["named-owner-approval"],
    remediationSteps: ["Obtain candidate-bound business and clinical owner approval of the complete value contract."]
  },
  G23: {
    key: "behavior-adoption-shadow-pilot-readiness",
    description: "Behavior adoption, training, shadow rehearsal, stop rules, and controlled pilot readiness.",
    ownerRole: "pilot-owner",
    requiredEvidence: ["shadow-rehearsal", "adoption-training-plan", "stop-and-rollback-rules", "named-pilot-owner-approval"],
    externalApprovalRequired: true,
    operatorEvidence: ["named-pilot-owner-approval"],
    remediationSteps: ["Complete a synthetic shadow rehearsal and obtain named pilot-owner approval."]
  },
  G24: {
    key: "evidence-freshness-attestation-candidate-binding",
    description: "Evidence freshness, attestation, expiry, and exact-candidate binding.",
    ownerRole: "release-owner-and-independent-reviewer",
    requiredEvidence: ["exact-source-manifest", "fresh-validation-packet", "candidate-bound-reviewer-attestation"],
    externalApprovalRequired: true,
    operatorEvidence: ["candidate-bound-reviewer-attestation"],
    remediationSteps: ["Regenerate evidence after the final source mutation and obtain an exact-candidate reviewer attestation."]
  },
  G25: {
    key: "build-buy-exitability-provider-portability",
    description: "Build/buy exitability, provider-neutral contracts, export path, and tested portability.",
    ownerRole: "platform-owner",
    requiredEvidence: ["provider-neutral-adapter-contract", "configuration-export-path", "independent-route-test", "exit-runbook"],
    externalApprovalRequired: false,
    operatorEvidence: [],
    remediationSteps: ["Retest provider removal, configuration export, and independent-route activation."]
  }
};

export function evaluateStrategicAssuranceGates(input: {
  candidateHash: string;
  evaluatedAt: string;
  evidence: StrategicGateEvidence;
}): ContinuousAssuranceGateRecord[] {
  assertHash(input.candidateHash, "strategic gate candidate");
  if (!validDate(input.evaluatedAt)) throw new Error("Strategic gate evaluation requires a valid timestamp");
  const evaluatedAt = Date.parse(input.evaluatedAt);
  return (Object.keys(strategicGateDefinitions) as ContinuousAssuranceGateId[]).map((gateId) => {
    const definition = strategicGateDefinitions[gateId];
    const supplied = input.evidence[gateId];
    const observedEvidence = supplied.signals.filter((signal) => signal.present).map((signal) => signal.evidenceId);
    const reasonCodes: string[] = [];
    const byId = new Map(supplied.signals.map((signal) => [signal.evidenceId, signal]));
    for (const required of definition.requiredEvidence) {
      const signal = byId.get(required);
      if (!signal?.present) {
        reasonCodes.push(`${definition.operatorEvidence.includes(required) ? "OPERATOR_REQUIRED" : "MISSING"}_${required.toUpperCase().replaceAll("-", "_")}`);
        continue;
      }
      assertHash(signal.artifactHash, `${gateId} evidence artifact`);
      assertHash(signal.candidateHash, `${gateId} evidence candidate`);
      if (signal.candidateHash !== input.candidateHash) reasonCodes.push(`STALE_${required.toUpperCase().replaceAll("-", "_")}_CANDIDATE`);
      if (!validDate(signal.issuedAt) || !validDate(signal.expiresAt)) {
        reasonCodes.push(`INVALID_${required.toUpperCase().replaceAll("-", "_")}_TIME`);
      } else if (Date.parse(signal.expiresAt) <= evaluatedAt) {
        reasonCodes.push(`EXPIRED_${required.toUpperCase().replaceAll("-", "_")}`);
      }
    }
    if (definition.externalApprovalRequired && !supplied.operatorApprovalComplete) {
      reasonCodes.push("NAMED_OPERATOR_APPROVAL_REQUIRED");
    }
    const hardFailure = reasonCodes.some((reason) => reason.startsWith("MISSING_") || reason.startsWith("STALE_") || reason.startsWith("INVALID_") || reason.startsWith("EXPIRED_"));
    const status = hardFailure
      ? "BLOCKED" as const
      : reasonCodes.length
        ? "OPERATOR_REQUIRED" as const
        : "PASS" as const;
    const validIssued = supplied.signals.filter((signal) => validDate(signal.issuedAt));
    const oldestIssuedAt = validIssued.length
      ? Math.min(...validIssued.map((signal) => Date.parse(signal.issuedAt)))
      : null;
    const validExpiries = supplied.signals.filter((signal) => validDate(signal.expiresAt));
    const earliestExpiry = validExpiries.length
      ? new Date(Math.min(...validExpiries.map((signal) => Date.parse(signal.expiresAt)))).toISOString()
      : null;
    const payload = {
      gateId,
      key: definition.key,
      description: definition.description,
      status,
      ownerRole: definition.ownerRole,
      requiredEvidence: definition.requiredEvidence,
      observedEvidence: canonical(observedEvidence),
      reasonCodes: canonical(reasonCodes),
      candidateHash: input.candidateHash,
      evidenceAgeHours: oldestIssuedAt === null ? null : Math.max(0, (evaluatedAt - oldestIssuedAt) / 3_600_000),
      expiresAt: earliestExpiry,
      remediationSteps: definition.remediationSteps
    };
    return {
      ...payload,
      evidenceDigest: createClinicalEvidenceHash({
        type: "p33-continuous-assurance-gate",
        version: p33ContinuousAssuranceVersion,
        supplied,
        payload
      })
    };
  });
}

type ReadinessEvidence = {
  localValidationPassed: boolean;
  exactCandidateEvidencePassed: boolean;
  namedReviewPassed: boolean;
  freshAal2EvidencePassed: boolean;
  migrationsAuthorized: boolean;
  intendedUseApproved: boolean;
  legalClaimsApproved: boolean;
  clinicalSafetyApproved: boolean;
  securityPrivacyApproved: boolean;
  platformApproved: boolean;
  officialLinuxSupportVerified: boolean;
  linuxIsolationControlsPassed: boolean;
  applicableBaaVerified: boolean;
  phiEligibleProductCoverageVerified: boolean;
  phiDataFlowApproved: boolean;
  deploymentAuthorized: boolean;
  postDeploymentEvidencePassed: boolean;
  customerActivationAuthorized: boolean;
};

const readinessRequirements: Record<PilotReadinessProfileId, Array<keyof ReadinessEvidence>> = {
  LOCAL_TECHNICAL_CANDIDATE: ["localValidationPassed"],
  CONTROLLED_NON_PHI_PILOT: [
    "localValidationPassed",
    "exactCandidateEvidencePassed",
    "namedReviewPassed",
    "freshAal2EvidencePassed",
    "migrationsAuthorized",
    "intendedUseApproved",
    "securityPrivacyApproved",
    "platformApproved"
  ],
  LINUX_NON_PHI_PILOT: [
    "localValidationPassed",
    "exactCandidateEvidencePassed",
    "namedReviewPassed",
    "freshAal2EvidencePassed",
    "officialLinuxSupportVerified",
    "linuxIsolationControlsPassed",
    "securityPrivacyApproved",
    "platformApproved"
  ],
  PHI_CAPABLE_PILOT: [
    "localValidationPassed",
    "exactCandidateEvidencePassed",
    "namedReviewPassed",
    "freshAal2EvidencePassed",
    "migrationsAuthorized",
    "intendedUseApproved",
    "legalClaimsApproved",
    "clinicalSafetyApproved",
    "securityPrivacyApproved",
    "platformApproved",
    "applicableBaaVerified",
    "phiEligibleProductCoverageVerified",
    "phiDataFlowApproved"
  ],
  PRODUCTION_CUSTOMER_GO_LIVE: [
    "localValidationPassed",
    "exactCandidateEvidencePassed",
    "namedReviewPassed",
    "freshAal2EvidencePassed",
    "migrationsAuthorized",
    "intendedUseApproved",
    "legalClaimsApproved",
    "clinicalSafetyApproved",
    "securityPrivacyApproved",
    "platformApproved",
    "deploymentAuthorized",
    "postDeploymentEvidencePassed",
    "customerActivationAuthorized"
  ]
};

const operatorEvidence = new Set<keyof ReadinessEvidence>([
  "namedReviewPassed",
  "freshAal2EvidencePassed",
  "migrationsAuthorized",
  "intendedUseApproved",
  "legalClaimsApproved",
  "clinicalSafetyApproved",
  "securityPrivacyApproved",
  "platformApproved",
  "officialLinuxSupportVerified",
  "applicableBaaVerified",
  "phiEligibleProductCoverageVerified",
  "phiDataFlowApproved",
  "deploymentAuthorized",
  "postDeploymentEvidencePassed",
  "customerActivationAuthorized"
]);

export function evaluatePilotReadinessProfiles(evidence: ReadinessEvidence): PilotReadinessDecision[] {
  return (Object.keys(readinessRequirements) as PilotReadinessProfileId[]).map((profileId) => {
    const missing = readinessRequirements[profileId].filter((key) => !evidence[key]);
    const reasonCodes = missing.map((key) => `MISSING_${key.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase()}`);
    const technicalMissing = missing.some((key) => !operatorEvidence.has(key));
    const restrictedProfile = profileId === "LINUX_NON_PHI_PILOT" || profileId === "PHI_CAPABLE_PILOT" || profileId === "PRODUCTION_CUSTOMER_GO_LIVE";
    const status = missing.length === 0
      ? restrictedProfile
        ? "OPERATOR_REQUIRED" as const
        : "PASS" as const
      : restrictedProfile || technicalMissing
        ? "BLOCKED" as const
        : "OPERATOR_REQUIRED" as const;
    const payload = {
      profileId,
      status,
      reasonCodes: canonical(reasonCodes),
      requiredEvidence: readinessRequirements[profileId].map((key) => key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()),
      livePhiAllowed: false as const,
      clinicalActionAllowed: false as const,
      deploymentAuthorized: false as const,
      customerActivationAuthorized: false as const
    };
    return {
      ...payload,
      decisionHash: createClinicalEvidenceHash({
        type: "p33-pilot-readiness-decision",
        version: p33ContinuousAssuranceVersion,
        evidence,
        payload
      })
    };
  });
}

export type ContinuousAssuranceDecisionRecordInput = Omit<
  ContinuousAssuranceDecisionRecord,
  "containsRawPhi" | "containsSecrets" | "hiddenChainOfThoughtStored" | "evidenceDigest"
>;

function decisionRecordPayload(input: ContinuousAssuranceDecisionRecordInput) {
  return {
    ...input,
    authority: canonical(input.authority),
    authorizedScope: canonical(input.authorizedScope),
    inputClassifications: [...new Set(input.inputClassifications)].sort() as ContextDataClassification[],
    toolSchemaHashes: canonical(input.toolSchemaHashes),
    retrievedSources: [...input.retrievedSources].sort((left, right) => left.sourceId.localeCompare(right.sourceId)),
    proposedToolCalls: canonical(input.proposedToolCalls),
    executedToolCalls: canonical(input.executedToolCalls),
    executionScope: {
      ...input.executionScope,
      filesystemRoots: canonical(input.executionScope.filesystemRoots),
      networkDestinations: canonical(input.executionScope.networkDestinations)
    },
    safetyChecks: canonical(input.safetyChecks),
    reviewerOverrides: canonical(input.reviewerOverrides),
    rollbackOrCompensation: canonical(input.rollbackOrCompensation),
    containsRawPhi: false as const,
    containsSecrets: false as const,
    hiddenChainOfThoughtStored: false as const
  };
}

export function createContinuousAssuranceDecisionRecord(
  input: ContinuousAssuranceDecisionRecordInput,
  existingRecords: ContinuousAssuranceDecisionRecord[] = []
): ContinuousAssuranceDecisionRecord {
  for (const [label, value] of [
    ["event id", input.eventId],
    ["tenant id", input.tenantId],
    ["workspace id", input.workspaceId]
  ] as const) assertId(value, label);
  assertHash(input.actorIdentityHash, "actor identity");
  assertHash(input.promptConfigHash, "prompt configuration");
  assertHash(input.outputHash, "output");
  assertHash(input.previousRecordHash, "previous record");
  input.toolSchemaHashes.forEach((hash) => assertHash(hash, "tool schema"));
  input.retrievedSources.forEach((source) => assertHash(source.sourceHash, "retrieved source"));
  if (!validDate(input.occurredAt)) throw new Error("Continuous assurance record requires a valid timestamp");
  if (input.inputClassifications.includes("phi-prohibited")) {
    throw new Error("Continuous assurance records reject PHI-prohibited inputs in this candidate");
  }
  if (existingRecords.some((record) => record.eventId === input.eventId)) {
    throw new Error("Continuous assurance event IDs are append-only and cannot be reused");
  }
  const tenantRecords = existingRecords.filter((record) =>
    record.tenantId === input.tenantId && record.workspaceId === input.workspaceId
  );
  if ((tenantRecords.at(-1)?.evidenceDigest ?? null) !== input.previousRecordHash) {
    throw new Error("Continuous assurance previous-record hash does not match the ledger head");
  }
  if (input.approval.disposition === "approved" && !input.approval.reviewerIdHash) {
    throw new Error("Approved assurance evidence requires a reviewer identity hash");
  }
  if (input.approval.reviewerIdHash) assertHash(input.approval.reviewerIdHash, "reviewer identity");
  assertId(input.retentionPolicy.policyId, "retention policy id");
  if (!validDate(input.retentionPolicy.expiresAt) || Date.parse(input.retentionPolicy.expiresAt) <= Date.parse(input.occurredAt)) {
    throw new Error("Continuous assurance retention must expire after the event");
  }
  if (!Object.values(input.metrics).every((value) => typeof value === "boolean" || (Number.isFinite(value) && value >= 0))) {
    throw new Error("Continuous assurance metrics must be nonnegative finite values");
  }
  const payload = decisionRecordPayload(input);
  return {
    ...payload,
    evidenceDigest: createClinicalEvidenceHash({
      type: "p33-continuous-assurance-decision-record",
      version: p33ContinuousAssuranceVersion,
      payload
    })
  };
}

export function verifyContinuousAssuranceDecisionChain(records: ContinuousAssuranceDecisionRecord[]) {
  const failures: Array<{ eventId: string; reason: string }> = [];
  const heads = new Map<string, string | null>();
  const ids = new Set<string>();
  for (const record of records) {
    const key = `${record.tenantId}:${record.workspaceId}`;
    if (ids.has(record.eventId)) failures.push({ eventId: record.eventId, reason: "DUPLICATE_EVENT_ID" });
    ids.add(record.eventId);
    if (record.previousRecordHash !== (heads.get(key) ?? null)) {
      failures.push({ eventId: record.eventId, reason: "CHAIN_PREDECESSOR_MISMATCH" });
    }
    const { evidenceDigest, ...input } = record;
    const expected = createClinicalEvidenceHash({
      type: "p33-continuous-assurance-decision-record",
      version: p33ContinuousAssuranceVersion,
      payload: input
    });
    if (expected !== evidenceDigest) failures.push({ eventId: record.eventId, reason: "EVIDENCE_DIGEST_MISMATCH" });
    if (record.containsRawPhi || record.containsSecrets || record.hiddenChainOfThoughtStored) {
      failures.push({ eventId: record.eventId, reason: "PROHIBITED_CONTENT_FLAG" });
    }
    heads.set(key, evidenceDigest);
  }
  return {
    valid: failures.length === 0,
    recordCount: records.length,
    failures,
    chainDigest: createClinicalEvidenceHash({
      type: "p33-continuous-assurance-chain",
      heads: [...heads.entries()].sort(([left], [right]) => left.localeCompare(right))
    })
  };
}

export function buildContinuousAssuranceExport(record: ContinuousAssuranceDecisionRecord) {
  return {
    eventId: record.eventId,
    evidenceDigest: record.evidenceDigest,
    tenantId: record.tenantId,
    workspaceId: record.workspaceId,
    occurredAt: record.occurredAt,
    actorIdentityHash: record.actorIdentityHash,
    policyVersion: record.policyVersion,
    model: record.model,
    evidenceReferences: record.retrievedSources.map((source) => ({
      sourceId: source.sourceId,
      sourceHash: source.sourceHash,
      page: source.page,
      span: source.span
    })),
    toolActivity: {
      proposed: record.proposedToolCalls,
      executed: record.executedToolCalls
    },
    approval: record.approval,
    finalDisposition: record.finalDisposition,
    metrics: record.metrics,
    rawInputIncluded: false,
    rawPhiIncluded: false,
    secretsIncluded: false,
    hiddenChainOfThoughtIncluded: false,
    replayAuthorized: false,
    boundary: p33ContinuousAssuranceBoundary
  };
}

function gateSignal(
  evidenceId: string,
  candidateHash: string,
  overrides: Partial<StrategicGateEvidenceSignal> = {}
): StrategicGateEvidenceSignal {
  return {
    evidenceId,
    present: true,
    artifactHash: createClinicalEvidenceHash(`p33-continuous-assurance-${evidenceId}`),
    candidateHash,
    issuedAt: "2026-08-15T12:00:00.000Z",
    expiresAt: "2026-08-22T12:00:00.000Z",
    ...overrides
  };
}

export function getP33ContinuousAssuranceSummary() {
  const candidateHash = createClinicalEvidenceHash("p33-continuous-assurance-local-candidate-unbound");
  const actorHash = createClinicalEvidenceHash("synthetic-continuous-assurance-agent");
  const argumentsHash = createClinicalEvidenceHash("synthetic-shadow-arguments");
  const policyRequest: AgentActionPolicyRequest = {
    actionId: "action-synthetic-shadow-write",
    approvalNonce: "nonce-synthetic-shadow-write",
    idempotencyKey: "idempotency-synthetic-shadow-write",
    tenantId: "synthetic-tenant",
    actorIdHash: actorHash,
    candidateHash,
    policyVersion: p33ContinuousAssuranceVersion,
    toolId: "synthetic-artifact-prepare",
    actionClass: "write",
    argumentsHash,
    target: "synthetic-review-queue",
    environment: "preview",
    mode: "shadow",
    dataClassification: "synthetic-no-phi",
    networkDestinations: [],
    filesystemPaths: ["/workspace/synthetic-fixtures/output.json"]
  };
  const policyDecision = evaluateAgentActionPolicy({
    request: policyRequest,
    authorization: {
      tenantId: "synthetic-tenant",
      candidateHash,
      authorizedToolIds: ["synthetic-artifact-prepare"],
      allowedNetworkDestinations: [],
      allowedFilesystemRoots: ["/workspace/synthetic-fixtures"],
      expiresAt: "2026-08-16T12:00:00.000Z"
    },
    approval: null,
    discoveredToolIds: ["synthetic-artifact-prepare", "synthetic-artifact-read"],
    usedApprovalIds: [],
    now: "2026-08-15T12:00:00.000Z"
  });

  const failoverDecision = evaluateProviderFailover({
    providerId: "synthetic-local-primary",
    controllingCorporateFamily: "scrimed-local",
    cloud: "local-lab-a",
    region: "test-region-a",
    acceleratorPool: "cpu-pool-a",
    identityProvider: "synthetic-identity-a",
    network: "isolated-network-a",
    safetyTier: 3,
    privacyTier: 3,
    jurisdiction: "synthetic-jurisdiction-a",
    eligible: true
  }, {
    providerId: "synthetic-local-fallback",
    controllingCorporateFamily: "independent-test-operator",
    cloud: "local-lab-b",
    region: "test-region-b",
    acceleratorPool: "cpu-pool-b",
    identityProvider: "synthetic-identity-b",
    network: "isolated-network-b",
    safetyTier: 3,
    privacyTier: 3,
    jurisdiction: "synthetic-jurisdiction-b",
    eligible: true
  });
  const resilienceDrill = evaluateProviderResilienceDrill({
    failoverDecision,
    primaryFailureDetected: true,
    circuitOpened: true,
    retryCount: 1,
    maximumRetries: 2,
    fallbackCompleted: true,
    auditContinuityPreserved: true
  });
  const portabilityEvidence = evaluateProviderPortability({
    adapterContractVersion: "provider-neutral-adapter-v1",
    configurationExportHash: createClinicalEvidenceHash("synthetic-provider-configuration-export"),
    failoverDecision,
    exitRunbookId: "p33-operator-provider-exit",
    proprietaryCredentialMaterialIncluded: false
  });

  const qualityRatchet = evaluateQualityRatchet({
    baseline: {
      taskQuality: 0.9,
      severeErrorRate: 0,
      unauthorizedActionRate: 0,
      grounding: 1,
      costPerCompletedTaskUsd: 0.1,
      p95LatencyMs: 1_000
    },
    challenger: {
      taskQuality: 0.91,
      severeErrorRate: 0,
      unauthorizedActionRate: 0,
      grounding: 1,
      costPerCompletedTaskUsd: 0.08,
      p95LatencyMs: 900
    },
    hardFloors: { safety: true, authorization: true, privacy: true, clinical: true, provenance: true },
    worstMaterialCellPassed: true,
    taskLevelEvidenceComplete: true,
    softRegressionApproved: false,
    independentHumanReviewComplete: false
  });

  const valueContract: PilotValueRealizationContract = {
    contractId: "value-synthetic-pilot-readiness",
    tenantId: "synthetic-tenant",
    workflow: "Synthetic administrative evidence packet preparation",
    baseline: "Measure manual synthetic packet assembly time, correction count, and review burden.",
    comparator: "Compare against a shadow SCRIMED-assisted run using the same synthetic cases.",
    intendedUser: "Authorized pilot operations reviewer",
    businessOwnerRole: "pilot-business-owner",
    clinicalOwnerRole: null,
    measurementWindow: "One bounded synthetic rehearsal cycle",
    successThresholds: ["verified artifact completion", "no safety-gate regression"],
    safetyStopThresholds: ["any unauthorized action", "any prohibited-content signal"],
    rollbackCriteria: ["failed hard floor", "unresolved evidence mismatch"],
    costAndCapacityMetrics: ["cost per completed task", "review minutes", "capacity returned"],
    adoptionAndTrainingPlan: ["operator walkthrough", "shadow rehearsal", "review feedback"],
    affectedSystems: ["synthetic SCRIMED preview only"],
    exitAndExportPlan: ["export digest-only evidence", "disable feature flag", "retain audit chain"],
    approvedByActorHashes: []
  };
  const valueContractDecision = evaluatePilotValueContract(valueContract);
  const shadowRehearsal = evaluateShadowPilotRehearsal({
    syntheticOnly: true,
    externalActionsExecuted: false,
    policyDecision,
    valueContractStatus: valueContractDecision.status,
    stopRulesConfigured: true,
    rollbackTested: true,
    trainingSteps: ["operator walkthrough", "shadow review", "stop-rule exercise"],
    namedPilotOwnerApproved: false
  });

  const staleCandidateHash = createClinicalEvidenceHash("prior-p33-candidate");
  const strategicGates = evaluateStrategicAssuranceGates({
    candidateHash,
    evaluatedAt: "2026-08-15T13:00:00.000Z",
    evidence: {
      G21: {
        operatorApprovalComplete: true,
        signals: [
          gateSignal("qualified-primary-route", candidateHash),
          gateSignal("materially-independent-fallback", candidateHash, { artifactHash: failoverDecision.evidenceHash }),
          gateSignal("circuit-breaker-recovery-test", candidateHash, { artifactHash: resilienceDrill.drillHash })
        ]
      },
      G22: {
        operatorApprovalComplete: false,
        signals: [
          gateSignal("complete-value-contract", candidateHash, { artifactHash: valueContractDecision.contractHash }),
          gateSignal("baseline-and-comparator", candidateHash),
          gateSignal("named-owner-approval", candidateHash, { present: false, artifactHash: null })
        ]
      },
      G23: {
        operatorApprovalComplete: false,
        signals: [
          gateSignal("shadow-rehearsal", candidateHash, { artifactHash: shadowRehearsal.rehearsalHash }),
          gateSignal("adoption-training-plan", candidateHash),
          gateSignal("stop-and-rollback-rules", candidateHash),
          gateSignal("named-pilot-owner-approval", candidateHash, { present: false, artifactHash: null })
        ]
      },
      G24: {
        operatorApprovalComplete: false,
        signals: [
          gateSignal("exact-source-manifest", staleCandidateHash),
          gateSignal("fresh-validation-packet", staleCandidateHash),
          gateSignal("candidate-bound-reviewer-attestation", staleCandidateHash, { present: false, artifactHash: null })
        ]
      },
      G25: {
        operatorApprovalComplete: true,
        signals: [
          gateSignal("provider-neutral-adapter-contract", candidateHash, { artifactHash: portabilityEvidence.evidenceHash }),
          gateSignal("configuration-export-path", candidateHash, { artifactHash: portabilityEvidence.evidenceHash }),
          gateSignal("independent-route-test", candidateHash, { artifactHash: failoverDecision.evidenceHash }),
          gateSignal("exit-runbook", candidateHash, { artifactHash: portabilityEvidence.evidenceHash })
        ]
      }
    }
  });

  const readinessProfiles = evaluatePilotReadinessProfiles({
    localValidationPassed: true,
    exactCandidateEvidencePassed: false,
    namedReviewPassed: false,
    freshAal2EvidencePassed: false,
    migrationsAuthorized: false,
    intendedUseApproved: false,
    legalClaimsApproved: false,
    clinicalSafetyApproved: false,
    securityPrivacyApproved: false,
    platformApproved: false,
    officialLinuxSupportVerified: false,
    linuxIsolationControlsPassed: false,
    applicableBaaVerified: false,
    phiEligibleProductCoverageVerified: false,
    phiDataFlowApproved: false,
    deploymentAuthorized: false,
    postDeploymentEvidencePassed: false,
    customerActivationAuthorized: false
  });

  const decisionRecord = createContinuousAssuranceDecisionRecord({
    eventId: "assurance-synthetic-shadow-001",
    occurredAt: "2026-08-15T12:00:00.000Z",
    tenantId: "synthetic-tenant",
    workspaceId: "workspace-synthetic-p33",
    operatingMode: "synthetic-development",
    actorType: "agent",
    actorIdentityHash: actorHash,
    authority: ["prepare-synthetic-artifact"],
    authorizedScope: ["synthetic-review-queue"],
    policyVersion: p33ContinuousAssuranceVersion,
    inputClassifications: ["synthetic-no-phi"],
    model: {
      providerId: "synthetic-fallback",
      modelId: "deterministic-policy-fixture-v1",
      harnessId: "scrimed-continuous-assurance-harness-v1",
      version: "1",
      reasoningEffort: "standard"
    },
    promptConfigHash: createClinicalEvidenceHash("synthetic-continuous-assurance-prompt-config"),
    toolSchemaHashes: [createClinicalEvidenceHash("synthetic-artifact-prepare-v1")],
    retrievedSources: [{
      sourceId: "synthetic-assurance-source",
      sourceHash: createClinicalEvidenceHash("synthetic-assurance-source"),
      page: 1,
      span: "section:pilot-readiness"
    }],
    proposedToolCalls: ["synthetic-artifact-prepare"],
    executedToolCalls: [],
    executionScope: {
      filesystemRoots: ["/workspace/synthetic-fixtures"],
      networkDestinations: [],
      sandboxId: "sandbox-synthetic-p33"
    },
    approval: { approvalId: null, disposition: "pending", reviewerIdHash: null },
    outputHash: null,
    finalDisposition: "review-required",
    safetyChecks: ["no-phi", "no-provider-call", "no-production-target", "exact-approval-required"],
    reviewerOverrides: [],
    rollbackOrCompensation: ["discard synthetic shadow output", "retain evidence digest"],
    metrics: { latencyMs: 12, inputTokens: 0, outputTokens: 0, costUsd: 0, cacheHit: true },
    retentionPolicy: {
      policyId: "synthetic-assurance-retention-v1",
      expiresAt: "2026-09-15T12:00:00.000Z",
      legalHold: false
    },
    previousRecordHash: null
  });
  const ledgerVerification = verifyContinuousAssuranceDecisionChain([decisionRecord]);

  const summary = {
    version: p33ContinuousAssuranceVersion,
    status: "local-continuous-assurance-active-exact-candidate-review-pending",
    candidateBinding: {
      status: "unbound-until-final-release-validation",
      localReferenceHash: candidateHash,
      externalAuthorityGranted: false
    },
    policyDecision,
    failoverDecision,
    resilienceDrill,
    portabilityEvidence,
    qualityRatchet,
    valueContract: { contract: valueContract, decision: valueContractDecision },
    shadowRehearsal,
    strategicGates,
    strategicGateCounts: {
      PASS: strategicGates.filter((gate) => gate.status === "PASS").length,
      OPERATOR_REQUIRED: strategicGates.filter((gate) => gate.status === "OPERATOR_REQUIRED").length,
      BLOCKED: strategicGates.filter((gate) => gate.status === "BLOCKED").length,
      FAIL: strategicGates.filter((gate) => gate.status === "FAIL").length
    },
    readinessProfiles,
    decisionEvidence: {
      record: decisionRecord,
      verification: ledgerVerification,
      export: buildContinuousAssuranceExport(decisionRecord)
    },
    productionReadiness: false,
    livePhiAllowed: false,
    liveClinicalOperationAllowed: false,
    externalDistributionAuthorized: false,
    boundary: p33ContinuousAssuranceBoundary
  };
  return {
    ...summary,
    summaryHash: createClinicalEvidenceHash({
      type: "p33-continuous-assurance-summary",
      version: p33ContinuousAssuranceVersion,
      summary
    })
  };
}
