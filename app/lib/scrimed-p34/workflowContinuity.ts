import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import { evaluateCapabilityAdmission, p34AdaptiveGovernanceVersion } from "./adaptiveGovernance";
import type {
  ActionMaturityEvent,
  ActionMaturityState,
  ActionMaturityTransitionDecision,
  ActionMaturityTransitionInput,
  CareTeamRelationshipPeriod,
  ChallengerEvaluationDecision,
  ChallengerEvaluationRun,
  ChallengerModelProfile,
  ContinuityAssessment,
  ContinuityEvent,
  PilotExpansionEvidence,
  ProviderCapabilityEntry,
  PublicSectorReadinessDecision,
  PublicSectorReadinessEvidenceProfile,
  TrustExpansionDecision,
  WorkflowContract,
  WorkflowContractDecision,
  WorkflowModelFitDecision,
  WorkflowReleaseEvidence,
  WorkflowRoiDashboard,
  CapabilityRegistry,
  AgentOperationView,
  P34DataClassification
} from "./types";

export const p34WorkflowContinuityVersion =
  "scrimed-p34-workflow-model-fit-action-continuity-v1-2026-08-19";

export const p34WorkflowContinuityBoundary =
  "SCRIMED p.34 workflow continuity is a synthetic/no-PHI contract, routing, action-maturity, operational-continuity, and evidence-readiness layer. It does not authorize external providers, PHI, clinical or payer decisions, EHR or system-of-record writes, pilot expansion, public-sector eligibility claims, production model promotion, deployment, or customer activation.";

const hashPattern = /^[0-9a-f]{64}$/i;
const idPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,159}$/;
const requiredWorkflowEvidenceTypes: WorkflowReleaseEvidence["evidenceType"][] = [
  "baseline",
  "safety",
  "quality",
  "privacy",
  "security",
  "rollback"
];
const systemOfRecordTargets = new Set([
  "clinical-system-of-record",
  "payer-system",
  "ehr",
  "other-system-of-record"
]);
const allowedTransitions: Record<ActionMaturityState, ActionMaturityState[]> = {
  ANSWER_ONLY: ["RECOMMENDATION", "FAILED_OR_REVERSED"],
  RECOMMENDATION: ["DRAFT_ACTION", "FAILED_OR_REVERSED"],
  DRAFT_ACTION: ["PENDING_APPROVAL", "FAILED_OR_REVERSED"],
  PENDING_APPROVAL: ["AUTHORIZED_EXECUTION", "FAILED_OR_REVERSED"],
  AUTHORIZED_EXECUTION: ["VERIFIED_OUTCOME", "FAILED_OR_REVERSED"],
  VERIFIED_OUTCOME: ["FAILED_OR_REVERSED"],
  FAILED_OR_REVERSED: []
};

function canonical(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isHash(value: unknown): value is string {
  return typeof value === "string" && hashPattern.test(value);
}

function isIso(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function boundedScore(value: number) {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

function recordHash(type: string, payload: unknown) {
  return createClinicalEvidenceHash({ type, version: p34WorkflowContinuityVersion, payload });
}

export function validateWorkflowContract(
  contract: Partial<WorkflowContract> | null | undefined,
  evaluatedAt: string
): WorkflowContractDecision {
  const reasonCodes: string[] = [];
  if (!isIso(evaluatedAt)) reasonCodes.push("EVALUATION_TIME_INVALID");
  if (!contract) reasonCodes.push("WORKFLOW_CONTRACT_REQUIRED");
  if (contract?.schemaVersion !== "scrimed-workflow-contract-v1") reasonCodes.push("WORKFLOW_SCHEMA_VERSION_INVALID");
  if (!isText(contract?.workflowId) || !idPattern.test(contract.workflowId)) reasonCodes.push("WORKFLOW_ID_REQUIRED");
  if (!isText(contract?.intendedUse)) reasonCodes.push("INTENDED_USE_REQUIRED");
  if (!isText(contract?.namedOwner)) reasonCodes.push("NAMED_OWNER_REQUIRED");
  if (!isText(contract?.targetUser)) reasonCodes.push("TARGET_USER_REQUIRED");
  if (!contract?.baselineMeasurement || !isHash(contract.baselineMeasurement.evidenceHash) || !isIso(contract.baselineMeasurement.measuredAt)) {
    reasonCodes.push("BASELINE_MEASUREMENT_EVIDENCE_REQUIRED");
  }
  if (!contract?.outcomeKpis?.length) reasonCodes.push("OUTCOME_KPIS_REQUIRED");
  if (!contract?.safetyKpis?.length) reasonCodes.push("SAFETY_KPIS_REQUIRED");
  if (!contract?.dataSources?.length || contract.dataSources.some((source) =>
    !isText(source.sourceId) || !isHash(source.evidenceHash)
  )) reasonCodes.push("DATA_SOURCE_EVIDENCE_REQUIRED");
  if (!contract?.dataClassification) reasonCodes.push("DATA_CLASSIFICATION_REQUIRED");
  if (contract?.dataClassification === "phi-restricted") reasonCodes.push("LIVE_PHI_WORKFLOW_DISABLED");
  if (!contract?.dataLocality || !isText(contract.dataLocality.jurisdiction) || !isText(contract.dataLocality.region) || !isText(contract.dataLocality.environmentId)) {
    reasonCodes.push("DATA_LOCALITY_REQUIRED");
  }
  if (!contract?.requiredAuthority?.length || contract.requiredAuthority.some((authority) => !isText(authority))) {
    reasonCodes.push("REQUIRED_AUTHORITY_MISSING");
  }
  if (!contract?.approvalPolicy?.requiredRoles?.length || contract.approvalPolicy.exactPayloadBinding !== true || contract.approvalPolicy.approvalTtlMinutes <= 0) {
    reasonCodes.push("APPROVAL_POLICY_INCOMPLETE");
  }
  if (!contract?.rollbackPolicy || !isText(contract.rollbackPolicy.ownerRole) || !contract.rollbackPolicy.rollbackSteps?.length || !isHash(contract.rollbackPolicy.testedEvidenceHash)) {
    reasonCodes.push("ROLLBACK_POLICY_EVIDENCE_REQUIRED");
  }
  if (!contract?.riskClass) reasonCodes.push("RISK_CLASS_REQUIRED");
  if (contract?.riskClass === "prohibited") reasonCodes.push("PROHIBITED_WORKFLOW_RISK");
  if (contract?.clinicalReviewRequired && !contract.approvalPolicy?.requiredRoles?.includes("clinical-reviewer")) {
    reasonCodes.push("CLINICAL_REVIEW_ROLE_REQUIRED");
  }
  if (!isIso(contract?.effectiveAt) || !isIso(contract?.expiresAt)) {
    reasonCodes.push("WORKFLOW_EFFECTIVE_WINDOW_REQUIRED");
  } else if (isIso(evaluatedAt) && (Date.parse(contract.effectiveAt) > Date.parse(evaluatedAt) || Date.parse(contract.expiresAt) <= Date.parse(evaluatedAt))) {
    reasonCodes.push("WORKFLOW_CONTRACT_EXPIRED_OR_NOT_EFFECTIVE");
  }

  const evidence = contract?.releaseEvidence ?? [];
  if (!evidence.length) reasonCodes.push("RELEASE_EVIDENCE_REQUIRED");
  for (const evidenceType of requiredWorkflowEvidenceTypes) {
    if (!evidence.some((item) => item.evidenceType === evidenceType)) {
      reasonCodes.push(`RELEASE_EVIDENCE_${evidenceType.toUpperCase()}_MISSING`);
    }
  }
  let evidenceFreshness: WorkflowContractDecision["evidenceFreshness"] = evidence.length ? "fresh" : "missing";
  for (const item of evidence) {
    if (!isHash(item.evidenceHash) || !isText(item.source) || !isIso(item.recordedAt) || !isIso(item.expiresAt)) {
      reasonCodes.push("RELEASE_EVIDENCE_MALFORMED");
      evidenceFreshness = "missing";
      continue;
    }
    if (!["verified-local", "verified-documentary"].includes(item.status)) {
      reasonCodes.push("RELEASE_EVIDENCE_UNVERIFIED");
    }
    if (isIso(evaluatedAt) && Date.parse(item.expiresAt) <= Date.parse(evaluatedAt)) {
      reasonCodes.push("RELEASE_EVIDENCE_STALE");
      evidenceFreshness = "stale";
    }
  }

  const normalizedReasons = canonical(reasonCodes);
  const contractValid = normalizedReasons.length === 0;
  const decision = !contractValid
    ? "BLOCK" as const
    : contract?.clinicalReviewRequired
      ? "REQUIRE_HUMAN" as const
      : "ALLOW" as const;
  return {
    decision,
    contractValid,
    executionEligibleForPolicyEvaluation: contractValid,
    executionAuthorized: false,
    reasonCodes: normalizedReasons,
    evidenceFreshness,
    contractHash: recordHash("p34-workflow-contract-decision", { contract: contract ?? null, evaluatedAt, reasonCodes: normalizedReasons })
  };
}

export function selectWorkflowModelFitRoute(input: {
  contract: WorkflowContract;
  registry: CapabilityRegistry;
  taskClass: string;
  productPath: string;
  requiredInputModality: ProviderCapabilityEntry["inputModalities"][number];
  requiredOutputModality: ProviderCapabilityEntry["outputModalities"][number];
  requiredCompatibility: Array<"ehr" | "fhir" | "dicom">;
  requiredToolIds: string[];
  requiredContextTokens: number;
  minimumQuality: number;
  minimumReliability: number;
  preferredMaximumLatencyMs: number;
  preferredMaximumCostUsd: number;
  deterministicSufficient: boolean;
  degradationJustificationByRoute: Record<string, string>;
  evaluatedAt: string;
}): WorkflowModelFitDecision {
  const contractDecision = validateWorkflowContract(input.contract, input.evaluatedAt);
  const rejectedRoutes: WorkflowModelFitDecision["rejectedRoutes"] = [];
  const softConstraintJustifications: string[] = [];
  const routeReasons: string[] = [];
  if (!contractDecision.contractValid) {
    return {
      decision: "BLOCK",
      selectedRouteId: null,
      selectedTechnique: null,
      eligibleRouteIds: [],
      rejectedRoutes: [{ routeId: "workflow-contract", reasonCodes: contractDecision.reasonCodes }],
      routeReasons: ["WORKFLOW_CONTRACT_FAILED"],
      softConstraintJustifications,
      publicBenchmarkRankUsed: false,
      providerCallExecuted: false,
      decisionHash: recordHash("p34-workflow-model-fit", { input, contractDecision })
    };
  }

  const eligible: ProviderCapabilityEntry[] = [];
  for (const route of input.registry.providers) {
    const reasons: string[] = [];
    const admission = evaluateCapabilityAdmission(input.registry, {
      routeId: route.routeId,
      taskClass: input.taskClass,
      riskTier: input.contract.riskClass,
      dataClassification: input.contract.dataClassification,
      region: input.contract.dataLocality.region,
      environmentId: input.contract.dataLocality.environmentId,
      requiredInputModality: input.requiredInputModality,
      requiredOutputModality: input.requiredOutputModality,
      requiredToolIds: input.requiredToolIds,
      productPath: input.productPath,
      requiredCompatibility: input.requiredCompatibility,
      maximumLatencyMs: Number.MAX_SAFE_INTEGER,
      maximumCostUsd: Number.MAX_SAFE_INTEGER,
      evaluatedAt: input.evaluatedAt
    });
    reasons.push(...admission.reasonCodes);
    if (route.localEvaluation.overallScore < input.minimumQuality) reasons.push("QUALITY_FLOOR_NOT_MET");
    if (route.localEvaluation.reliability < input.minimumReliability) reasons.push("RELIABILITY_FLOOR_NOT_MET");
    if (route.localEvaluation.criticalErrorRate > 0) reasons.push("CRITICAL_ERROR_FLOOR_NOT_MET");
    if (route.contextLimit < input.requiredContextTokens) reasons.push("CONTEXT_LIMIT_INSUFFICIENT");
    if (input.deterministicSufficient && route.deploymentLocation !== "local") reasons.push("DETERMINISTIC_ROUTE_REQUIRED");
    const latencyDegraded = route.localEvaluation.p95LatencyMs > input.preferredMaximumLatencyMs;
    const costDegraded = route.localEvaluation.costPerCompletedWorkflowUsd > input.preferredMaximumCostUsd;
    if (latencyDegraded || costDegraded) {
      const justification = input.degradationJustificationByRoute[route.routeId]?.trim();
      if (!justification) {
        reasons.push("SOFT_CONSTRAINT_DEGRADATION_JUSTIFICATION_REQUIRED");
      } else {
        softConstraintJustifications.push(`${route.routeId}:${justification}`);
      }
    }
    const normalizedReasons = canonical(reasons);
    if (admission.decision === "ALLOW" && normalizedReasons.length === 0) eligible.push(route);
    else rejectedRoutes.push({ routeId: route.routeId, reasonCodes: normalizedReasons });
  }

  eligible.sort((left, right) =>
    right.localEvaluation.overallScore - left.localEvaluation.overallScore ||
    right.localEvaluation.reliability - left.localEvaluation.reliability ||
    left.localEvaluation.costPerCompletedWorkflowUsd - right.localEvaluation.costPerCompletedWorkflowUsd ||
    left.localEvaluation.p95LatencyMs - right.localEvaluation.p95LatencyMs ||
    left.routeId.localeCompare(right.routeId)
  );
  const selected = eligible[0] ?? null;
  if (!selected) routeReasons.push("NO_ELIGIBLE_ROUTE");
  else {
    routeReasons.push(input.deterministicSufficient ? "DETERMINISTIC_SUFFICIENT" : "BEST_LOCAL_VALIDATED_FIT");
    routeReasons.push("QUALITY_OPTIMIZED_AFTER_HARD_FLOORS");
  }
  const decision = selected
    ? selected.providerId === "scrimed-local-runtime" ? "ALLOW" as const : "REQUIRE_HUMAN" as const
    : "BLOCK" as const;
  return {
    decision,
    selectedRouteId: selected?.routeId ?? null,
    selectedTechnique: selected?.deploymentLocation === "local" ? "validation-rules" : selected ? "generative-model" : null,
    eligibleRouteIds: eligible.map((route) => route.routeId),
    rejectedRoutes,
    routeReasons: canonical(routeReasons),
    softConstraintJustifications: canonical(softConstraintJustifications),
    publicBenchmarkRankUsed: false,
    providerCallExecuted: false,
    decisionHash: recordHash("p34-workflow-model-fit", {
      contractHash: contractDecision.contractHash,
      request: input,
      eligibleRouteIds: eligible.map((route) => route.routeId),
      selectedRouteId: selected?.routeId ?? null,
      rejectedRoutes,
      routeReasons
    })
  };
}

function actionEventPayload(event: Omit<ActionMaturityEvent, "eventHash">) {
  return { ...event };
}

export function transitionActionMaturity(
  input: ActionMaturityTransitionInput,
  existingEvents: ActionMaturityEvent[] = []
): ActionMaturityTransitionDecision {
  const reasonCodes: string[] = [];
  const previous = existingEvents.at(-1) ?? null;
  if (!idPattern.test(input.eventId) || !idPattern.test(input.actionId) || !idPattern.test(input.workflowId)) reasonCodes.push("ACTION_IDENTIFIER_INVALID");
  if (!isHash(input.actorIdHash) || input.inputHashes.some((value) => !isHash(value))) reasonCodes.push("ACTION_INPUT_PROVENANCE_INVALID");
  if (!isIso(input.occurredAt)) reasonCodes.push("ACTION_TIMESTAMP_INVALID");
  if (existingEvents.some((event) => event.eventId === input.eventId)) reasonCodes.push("DUPLICATE_ACTION_EVENT");
  if (existingEvents.some((event) => event.idempotencyKey === input.idempotencyKey)) reasonCodes.push("DUPLICATE_EXECUTION_ATTEMPT");
  if (previous && previous.nextState !== input.fromState) reasonCodes.push("ACTION_STATE_MISMATCH");
  if (!previous && (input.fromState !== null || input.toState !== "ANSWER_ONLY")) reasonCodes.push("ACTION_MUST_BEGIN_ANSWER_ONLY");
  if (input.fromState && !allowedTransitions[input.fromState].includes(input.toState)) reasonCodes.push("ACTION_TRANSITION_NOT_ALLOWED");
  if (!isHash(input.resultHash)) reasonCodes.push("ACTION_RESULT_EVIDENCE_REQUIRED");
  if (input.toState === "FAILED_OR_REVERSED" && !["completed", "failed"].includes(input.rollbackStatus)) {
    reasonCodes.push("ROLLBACK_DISPOSITION_REQUIRED");
  }

  let approvalConsumed = false;
  if (input.toState === "AUTHORIZED_EXECUTION") {
    const approval = input.approval;
    if (!approval) reasonCodes.push("EXPLICIT_ACTION_AUTHORIZATION_REQUIRED");
    else {
      if (existingEvents.some((event) => event.approvalId === approval.approvalId)) reasonCodes.push("ACTION_APPROVAL_REPLAY_DETECTED");
      if (approval.tenantId !== input.tenantId) reasonCodes.push("ACTION_APPROVAL_TENANT_MISMATCH");
      if (approval.workflowId !== input.workflowId || approval.actionId !== input.actionId) reasonCodes.push("ACTION_APPROVAL_SCOPE_MISMATCH");
      if (approval.candidateHash !== input.candidateHash) reasonCodes.push("ACTION_APPROVAL_CANDIDATE_MISMATCH");
      if (approval.payloadHash !== input.payloadHash) reasonCodes.push("ACTION_APPROVAL_PAYLOAD_MISMATCH");
      if (!isHash(approval.approverIdHash) || approval.approverIdHash === input.actorIdHash) reasonCodes.push("INDEPENDENT_APPROVER_REQUIRED");
      if (!isIso(approval.issuedAt) || !isIso(approval.expiresAt) || Date.parse(approval.issuedAt) > Date.parse(input.occurredAt) || Date.parse(approval.expiresAt) <= Date.parse(input.occurredAt)) {
        reasonCodes.push("ACTION_APPROVAL_EXPIRED_OR_NOT_EFFECTIVE");
      }
      approvalConsumed = reasonCodes.length === 0;
    }
  }
  if (input.executionMode === "external" || (systemOfRecordTargets.has(input.targetClass) && input.toState === "AUTHORIZED_EXECUTION")) {
    reasonCodes.push("EXTERNAL_SYSTEM_OF_RECORD_WRITE_DISABLED");
  }

  const normalizedReasons = canonical(reasonCodes);
  if (normalizedReasons.length) {
    return {
      decision: "BLOCK",
      transitionAccepted: false,
      reasonCodes: normalizedReasons,
      event: null,
      externalWriteAuthorized: false,
      approvalConsumed: false,
      decisionHash: recordHash("p34-action-maturity-decision", { input, previousEventHash: previous?.eventHash ?? null, reasonCodes: normalizedReasons })
    };
  }
  const payload: Omit<ActionMaturityEvent, "eventHash"> = {
    eventId: input.eventId,
    actionId: input.actionId,
    workflowId: input.workflowId,
    tenantId: input.tenantId,
    previousState: input.fromState,
    nextState: input.toState,
    actorIdHash: input.actorIdHash,
    authority: input.authority,
    inputHashes: canonical(input.inputHashes),
    policyVersion: input.policyVersion,
    occurredAt: input.occurredAt,
    resultHash: input.resultHash,
    rollbackStatus: input.rollbackStatus,
    approvalId: input.approval?.approvalId ?? null,
    idempotencyKey: input.idempotencyKey,
    previousEventHash: previous?.eventHash ?? null,
    containsRawPhi: false,
    containsSecrets: false
  };
  const event = { ...payload, eventHash: recordHash("p34-action-maturity-event", actionEventPayload(payload)) };
  return {
    decision: input.toState === "PENDING_APPROVAL" ? "REQUIRE_HUMAN" : "ALLOW",
    transitionAccepted: true,
    reasonCodes: [],
    event,
    externalWriteAuthorized: false,
    approvalConsumed,
    decisionHash: recordHash("p34-action-maturity-decision", { eventHash: event.eventHash, transitionAccepted: true })
  };
}

export function verifyActionMaturityChain(events: ActionMaturityEvent[]) {
  const failures: Array<{ eventId: string; reasonCode: string }> = [];
  events.forEach((event, index) => {
    const { eventHash, ...payload } = event;
    if (recordHash("p34-action-maturity-event", actionEventPayload(payload)) !== eventHash) {
      failures.push({ eventId: event.eventId, reasonCode: "ACTION_EVENT_HASH_MISMATCH" });
    }
    const expectedPrevious = index === 0 ? null : events[index - 1].eventHash;
    if (event.previousEventHash !== expectedPrevious) failures.push({ eventId: event.eventId, reasonCode: "ACTION_EVENT_PREDECESSOR_MISMATCH" });
    if (index > 0 && event.previousState !== events[index - 1].nextState) failures.push({ eventId: event.eventId, reasonCode: "ACTION_STATE_CHAIN_MISMATCH" });
  });
  return {
    valid: failures.length === 0,
    eventCount: events.length,
    failures,
    chainHash: recordHash("p34-action-maturity-chain", events.map((event) => event.eventHash))
  };
}

export function evaluateTrustExpansion(
  evidence: PilotExpansionEvidence,
  evaluatedAt: string
): TrustExpansionDecision {
  const reasonCodes: string[] = [];
  const thresholds = evidence.thresholds;
  const observed = evidence.observed;
  if (!isIso(evaluatedAt) || !isIso(evidence.pilotStartedAt) || !isIso(evidence.pilotEndedAt) || Date.parse(evidence.pilotEndedAt) <= Date.parse(evidence.pilotStartedAt)) {
    reasonCodes.push("PILOT_DURATION_INVALID");
  }
  if (!evidence.cohort.description.trim() || evidence.cohort.size < 1 || evidence.cohort.syntheticOnly !== true) reasonCodes.push("DEFINED_SYNTHETIC_COHORT_REQUIRED");
  const evidenceFresh = isIso(evidence.evidenceRecordedAt) && isIso(evidence.evidenceExpiresAt) && isIso(evaluatedAt) && Date.parse(evidence.evidenceExpiresAt) > Date.parse(evaluatedAt);
  if (!evidenceFresh) reasonCodes.push("EXPANSION_EVIDENCE_STALE");
  if (!evidence.evidenceHashes.length || evidence.evidenceHashes.some((value) => !isHash(value))) reasonCodes.push("EXPANSION_EVIDENCE_HASHES_REQUIRED");
  if (observed.taskCompletionRate < thresholds.minimumTaskCompletionRate) reasonCodes.push("TASK_COMPLETION_THRESHOLD_MISSED");
  if (observed.verifiedOutcomeRate < thresholds.minimumVerifiedOutcomeRate) reasonCodes.push("VERIFIED_OUTCOME_THRESHOLD_MISSED");
  if (observed.criticalErrorRate > thresholds.maximumCriticalErrorRate) reasonCodes.push("CRITICAL_ERROR_THRESHOLD_EXCEEDED");
  if (observed.overrideRate > thresholds.maximumOverrideRate) reasonCodes.push("OVERRIDE_THRESHOLD_EXCEEDED");
  if (observed.rollbackRate > thresholds.maximumRollbackRate) reasonCodes.push("ROLLBACK_THRESHOLD_EXCEEDED");
  if (observed.reviewMinutesPerWorkflow > thresholds.maximumReviewMinutesPerWorkflow) reasonCodes.push("REVIEW_BURDEN_THRESHOLD_EXCEEDED");
  if (observed.abandonmentRate > thresholds.maximumAbandonmentRate) reasonCodes.push("ABANDONMENT_THRESHOLD_EXCEEDED");
  if (observed.p95LatencyMs > thresholds.maximumP95LatencyMs) reasonCodes.push("LATENCY_THRESHOLD_EXCEEDED");
  if (observed.costPerCompletedWorkflowUsd > thresholds.maximumCostPerCompletedWorkflowUsd) reasonCodes.push("COST_THRESHOLD_EXCEEDED");
  const requiredRoles: PilotExpansionEvidence["approvals"][number]["role"][] = ["clinical", "privacy-security", "operational"];
  for (const role of requiredRoles) {
    const approval = evidence.approvals.find((candidate) => candidate.role === role);
    if (!approval || approval.status !== "approved" || !isHash(approval.approverIdHash) || !isHash(approval.evidenceHash) || !isIso(approval.expiresAt) || Date.parse(approval.expiresAt) <= Date.parse(evaluatedAt)) {
      reasonCodes.push(`NAMED_${role.toUpperCase().replace("-", "_")}_APPROVAL_REQUIRED`);
    }
  }
  const thresholdReasons = reasonCodes.filter((reason) => reason.includes("THRESHOLD") || reason.includes("PILOT_") || reason.includes("COHORT"));
  const approvalReasons = reasonCodes.filter((reason) => reason.startsWith("NAMED_"));
  const thresholdsPassed = thresholdReasons.length === 0;
  const namedApprovalsComplete = approvalReasons.length === 0;
  const blockingEvidenceFailure = !evidenceFresh || reasonCodes.includes("EXPANSION_EVIDENCE_HASHES_REQUIRED") || !thresholdsPassed;
  const decision = blockingEvidenceFailure ? "BLOCK" as const : "REQUIRE_HUMAN" as const;
  const normalizedReasons = canonical(reasonCodes.length ? reasonCodes : ["TRUST_EXPANSION_FEATURE_DISABLED"]);
  return {
    decision,
    reasonCodes: normalizedReasons,
    thresholdsPassed,
    evidenceFresh,
    namedApprovalsComplete,
    eligibleForExpansionReview: thresholdsPassed && evidenceFresh,
    expansionAuthorized: false,
    decisionHash: recordHash("p34-trust-expansion", { evidence, evaluatedAt, reasonCodes: normalizedReasons })
  };
}

export function evaluateContinuityOfCare(input: {
  tenantId: string;
  relationships: CareTeamRelationshipPeriod[];
  events: ContinuityEvent[];
  evaluatedAt: string;
}): ContinuityAssessment {
  const reasonCodes: string[] = [];
  if (!isIso(input.evaluatedAt)) reasonCodes.push("CONTINUITY_EVALUATION_TIME_INVALID");
  if (!input.relationships.length) reasonCodes.push("NAMED_CARE_TEAM_RELATIONSHIP_REQUIRED");
  if (input.relationships.some((relationship) =>
    relationship.tenantId !== input.tenantId || !isHash(relationship.subjectReferenceHash) || !isHash(relationship.careTeamReferenceHash) || !isText(relationship.ownerRole) || !isIso(relationship.startedAt) || (relationship.endedAt !== null && !isIso(relationship.endedAt))
  )) reasonCodes.push("CONTINUITY_RELATIONSHIP_INVALID_OR_CROSS_TENANT");
  if (input.events.some((event) =>
    event.tenantId !== input.tenantId || !isHash(event.subjectReferenceHash) || !isHash(event.sourceEvidenceHash) || !isIso(event.occurredAt)
  )) reasonCodes.push("CONTINUITY_EVENT_INVALID_OR_CROSS_TENANT");

  const relationships = [...input.relationships].sort((left, right) => Date.parse(left.startedAt) - Date.parse(right.startedAt));
  const events = [...input.events].sort((left, right) => Date.parse(left.occurredAt) - Date.parse(right.occurredAt));
  const firstStart = relationships[0]?.startedAt ?? input.evaluatedAt;
  const lastEnd = relationships.reduce((latest, relationship) => {
    const value = relationship.endedAt ?? input.evaluatedAt;
    return Date.parse(value) > Date.parse(latest) ? value : latest;
  }, firstStart);
  const continuityDurationDays = Math.max(0, Math.floor((Date.parse(lastEnd) - Date.parse(firstStart)) / 86_400_000));
  const transferCount = events.filter((event) => event.type === "transfer").length;
  const interruptionCount = events.filter((event) => event.type === "interruption").length;
  const reconnectCount = events.filter((event) => event.type === "reconnect").length;
  let openInterruptions = 0;
  for (const event of events) {
    if (event.type === "interruption") openInterruptions += 1;
    if (event.type === "reconnect" && openInterruptions > 0) openInterruptions -= 1;
  }
  const providerTransitionRiskSignals: string[] = [];
  if (transferCount > 0) providerTransitionRiskSignals.push("CARE_TEAM_TRANSFER_REVIEW");
  if (openInterruptions > 0) providerTransitionRiskSignals.push("INTERRUPTION_RECONNECT_PENDING");
  relationships.slice(1).forEach((relationship, index) => {
    const previous = relationships[index];
    if (previous.endedAt && Date.parse(relationship.startedAt) - Date.parse(previous.endedAt) > 30 * 86_400_000) {
      providerTransitionRiskSignals.push("RELATIONSHIP_GAP_REVIEW");
    }
  });
  reasonCodes.push(...providerTransitionRiskSignals);
  const signals = canonical(providerTransitionRiskSignals);
  const followUpWorkQueue = signals.map((reasonCode) => ({
    workItemId: recordHash("p34-continuity-work-item", { tenantId: input.tenantId, reasonCode }).slice(0, 24),
    ownerRole: "care-coordination-reviewer",
    reasonCode,
    priority: reasonCode === "INTERRUPTION_RECONNECT_PENDING" ? "elevated" as const : "routine" as const,
    humanReviewRequired: true as const
  }));
  const segmentedKpis = relationships.map((relationship) => ({
    segmentHash: recordHash("p34-continuity-segment", { tenantId: input.tenantId, relationshipId: relationship.relationshipId, ownerRole: relationship.ownerRole }),
    relationshipDays: Math.max(0, Math.floor((Date.parse(relationship.endedAt ?? input.evaluatedAt) - Date.parse(relationship.startedAt)) / 86_400_000)),
    transfers: events.filter((event) => event.type === "transfer" && event.toCareTeamReferenceHash === relationship.careTeamReferenceHash).length,
    interruptions: events.filter((event) => event.type === "interruption" && event.fromCareTeamReferenceHash === relationship.careTeamReferenceHash).length,
    reconnects: events.filter((event) => event.type === "reconnect" && event.toCareTeamReferenceHash === relationship.careTeamReferenceHash).length
  }));
  const decision = reasonCodes.some((reason) => reason.includes("INVALID") || reason.includes("REQUIRED"))
    ? "BLOCK" as const
    : signals.length ? "REQUIRE_HUMAN" as const : "ALLOW" as const;
  return {
    decision,
    continuityDurationDays,
    transferCount,
    interruptionCount,
    reconnectCount,
    unresolvedInterruptionCount: openInterruptions,
    providerTransitionRiskSignals: signals,
    followUpWorkQueue,
    segmentedKpis,
    containsRawPhi: false,
    causalClaimAuthorized: false,
    therapeuticClaimAuthorized: false,
    assessmentHash: recordHash("p34-continuity-assessment", { input, reasonCodes: canonical(reasonCodes), segmentedKpis })
  };
}

export function evaluatePublicSectorReadiness(
  profile: PublicSectorReadinessEvidenceProfile,
  evaluatedAt: string
): PublicSectorReadinessDecision {
  const groups: WorkflowReleaseEvidence[][] = [
    profile.securityControls,
    profile.dataResidencyEvidence,
    profile.auditabilityEvidence,
    profile.accessibilityEvidence,
    profile.procurementArtifacts,
    profile.contractVehicleReferences
  ];
  const reasonCodes: string[] = [];
  if (!isText(profile.evidenceOwner)) reasonCodes.push("PUBLIC_SECTOR_EVIDENCE_OWNER_REQUIRED");
  if (!isIso(evaluatedAt) || !isIso(profile.recordedAt) || !isIso(profile.expiresAt) || Date.parse(profile.expiresAt) <= Date.parse(evaluatedAt)) {
    reasonCodes.push("PUBLIC_SECTOR_PROFILE_STALE");
  }
  let covered = 0;
  groups.forEach((group, index) => {
    const valid = group.some((item) =>
      item.status === "verified-documentary" && isHash(item.evidenceHash) && isIso(item.expiresAt) && Date.parse(item.expiresAt) > Date.parse(evaluatedAt)
    );
    if (valid) covered += 1;
    else reasonCodes.push(`PUBLIC_SECTOR_DOCUMENTARY_LANE_${index + 1}_MISSING`);
  });
  const documentaryCoverage = covered / groups.length;
  const readyForProcurementReview = documentaryCoverage === 1 && ["review-ready", "approved-documentary"].includes(profile.status);
  return {
    decision: readyForProcurementReview ? "REQUIRE_HUMAN" : "BLOCK",
    reasonCodes: canonical(reasonCodes.length ? reasonCodes : ["NAMED_PUBLIC_SECTOR_REVIEW_REQUIRED"]),
    evidenceFresh: !reasonCodes.includes("PUBLIC_SECTOR_PROFILE_STALE"),
    documentaryCoverage,
    readyForProcurementReview,
    complianceClaimAuthorized: false,
    purchasingEligibilityClaimAuthorized: false,
    decisionHash: recordHash("p34-public-sector-readiness", { profile, evaluatedAt, reasonCodes: canonical(reasonCodes) })
  };
}

export const p34IsolatedChallengerProfiles: ChallengerModelProfile[] = [
  {
    challengerId: "challenger-qwen3-8-unverified",
    modelReference: "Qwen3.8",
    sourceClassification: "unverified-research-input",
    supportedTaskCandidates: ["bounded-code-evaluation", "structured-extraction"],
    modalities: ["text", "structured", "tool-call"],
    licenseStatus: "unverified",
    infrastructureRequirements: ["not-locally-verified"],
    isolatedNonPhiOnly: true,
    phiPermitted: false,
    productionRegistered: false,
    providerCallsEnabled: false,
    enabled: false
  },
  {
    challengerId: "challenger-mai-code-unverified",
    modelReference: "MAI-Code",
    sourceClassification: "unverified-research-input",
    supportedTaskCandidates: ["bounded-code-evaluation"],
    modalities: ["text", "structured", "tool-call"],
    licenseStatus: "unverified",
    infrastructureRequirements: ["not-locally-verified"],
    isolatedNonPhiOnly: true,
    phiPermitted: false,
    productionRegistered: false,
    providerCallsEnabled: false,
    enabled: false
  }
];

export function evaluateIsolatedChallenger(
  profile: ChallengerModelProfile | null,
  run: ChallengerEvaluationRun
): ChallengerEvaluationDecision {
  const reasonCodes: string[] = [];
  if (!profile || profile.challengerId !== run.challengerId) reasonCodes.push("CHALLENGER_PROFILE_NOT_FOUND");
  if (!profile?.isolatedNonPhiOnly || !["public", "synthetic-no-phi"].includes(run.dataClassification)) reasonCodes.push("CHALLENGER_NON_PHI_ISOLATION_REQUIRED");
  if (run.providerCallExecuted) reasonCodes.push("CHALLENGER_PROVIDER_CALL_PROHIBITED");
  if (!isHash(run.fixtureSetHash) || !isHash(run.harnessHash) || !isIso(run.evaluatedAt)) reasonCodes.push("CHALLENGER_REPRODUCIBILITY_EVIDENCE_REQUIRED");
  if (!run.locallyReproduced) reasonCodes.push("LOCAL_REPRODUCTION_REQUIRED");
  if (!isHash(run.licenseEvidenceHash) || !isHash(run.infrastructureEvidenceHash)) reasonCodes.push("LICENSE_AND_INFRASTRUCTURE_EVIDENCE_REQUIRED");
  if (!Object.values(run.metrics).every(Number.isFinite)) reasonCodes.push("CHALLENGER_METRICS_INVALID");
  if (!boundedScore(run.metrics.quality) || run.metrics.quality < 0.9) reasonCodes.push("CHALLENGER_QUALITY_FLOOR_MISSED");
  if (!boundedScore(run.metrics.instructionFollowing) || run.metrics.instructionFollowing < 0.9) reasonCodes.push("CHALLENGER_INSTRUCTION_FLOOR_MISSED");
  if (!boundedScore(run.metrics.toolAccuracy) || run.metrics.toolAccuracy < 0.95) reasonCodes.push("CHALLENGER_TOOL_FLOOR_MISSED");
  if (!boundedScore(run.metrics.reliability) || run.metrics.reliability < 0.95) reasonCodes.push("CHALLENGER_RELIABILITY_FLOOR_MISSED");
  const normalizedReasons = canonical(reasonCodes);
  const locallyReproducedEvidenceAccepted = normalizedReasons.length === 0;
  return {
    decision: locallyReproducedEvidenceAccepted ? "REQUIRE_HUMAN" : "BLOCK",
    reasonCodes: normalizedReasons.length ? normalizedReasons : ["NAMED_CHALLENGER_PROMOTION_REVIEW_REQUIRED"],
    locallyReproducedEvidenceAccepted,
    eligibleForNamedReview: locallyReproducedEvidenceAccepted,
    productionPromotionAuthorized: false,
    phiAuthorized: false,
    decisionHash: recordHash("p34-isolated-challenger", { profile, run, reasonCodes: normalizedReasons })
  };
}

export function redactWorkflowTelemetry(value: Record<string, unknown>) {
  const sensitiveKey = /(?:patient|subject|name|dob|birth|email|phone|address|diagnos|medical|note|prompt|content|secret|token|password|credential)/i;
  const redact = (input: unknown): unknown => {
    if (Array.isArray(input)) return input.map(redact);
    if (typeof input === "string" && /(?:\b\d{3}-\d{2}-\d{4}\b|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|\b(?:\+?1[-. ]?)?\(?\d{3}\)?[-. ]\d{3}[-. ]\d{4}\b)/i.test(input)) return "[REDACTED]";
    if (!input || typeof input !== "object") return input;
    return Object.fromEntries(Object.entries(input as Record<string, unknown>).map(([key, item]) => [
      key,
      sensitiveKey.test(key) ? "[REDACTED]" : redact(item)
    ]));
  };
  return redact(value) as Record<string, unknown>;
}

export function buildWorkflowRoiDashboard(input: {
  actionEvents: ActionMaturityEvent[];
  operations: AgentOperationView[];
  continuity: ContinuityAssessment;
  routingDecisions: WorkflowModelFitDecision[];
  expansion: TrustExpansionDecision;
  humanReviewMinutes: number;
  completedWorkflowCostsUsd: number[];
  evidenceFreshness: WorkflowContractDecision["evidenceFreshness"];
}): WorkflowRoiDashboard {
  const asking = input.actionEvents.filter((event) => ["ANSWER_ONLY", "RECOMMENDATION"].includes(event.nextState)).length;
  const doing = input.actionEvents.length - asking;
  const completedCost = input.completedWorkflowCostsUsd.filter((value) => Number.isFinite(value) && value >= 0);
  const distribution = new Map<string, { providerId: string; modelId: string; workflowCount: number }>();
  for (const operation of input.operations) {
    const key = `${operation.providerId}:${operation.modelId}`;
    const current = distribution.get(key) ?? { providerId: operation.providerId, modelId: operation.modelId, workflowCount: 0 };
    current.workflowCount += 1;
    distribution.set(key, current);
  }
  const payload = {
    schemaVersion: "scrimed-workflow-roi-v1" as const,
    askingVersusDoing: { asking, doing, total: input.actionEvents.length },
    verifiedOutcomes: input.actionEvents.filter((event) => event.nextState === "VERIFIED_OUTCOME").length,
    failedOrRolledBackActions: input.actionEvents.filter((event) => event.nextState === "FAILED_OR_REVERSED").length,
    humanReviewMinutes: Math.max(0, input.humanReviewMinutes),
    continuity: {
      relationshipDays: input.continuity.continuityDurationDays,
      transfers: input.continuity.transferCount,
      interruptions: input.continuity.interruptionCount,
      reconnects: input.continuity.reconnectCount
    },
    costPerCompletedWorkflowUsd: completedCost.length ? completedCost.reduce((sum, value) => sum + value, 0) / completedCost.length : null,
    providerDistribution: [...distribution.values()].sort((left, right) => `${left.providerId}:${left.modelId}`.localeCompare(`${right.providerId}:${right.modelId}`)),
    routingRationale: canonical(input.routingDecisions.flatMap((decision) => decision.routeReasons)),
    evidenceFreshness: input.evidenceFreshness,
    expansionGateStatus: input.expansion.decision,
    containsRawPhi: false as const
  };
  return { ...payload, dashboardHash: recordHash("p34-workflow-roi-dashboard", payload) };
}

function syntheticEvidence(evidenceType: WorkflowReleaseEvidence["evidenceType"]): WorkflowReleaseEvidence {
  return {
    evidenceId: `p34-${evidenceType}-evidence`,
    evidenceType,
    evidenceHash: recordHash("p34-synthetic-workflow-evidence", evidenceType),
    source: "repository synthetic policy tests",
    status: "verified-local",
    recordedAt: "2026-08-19T00:00:00.000Z",
    expiresAt: "2026-11-19T00:00:00.000Z"
  };
}

export function createP34SyntheticWorkflowContract(): WorkflowContract {
  return {
    schemaVersion: "scrimed-workflow-contract-v1",
    workflowId: "p34-synthetic-context-validation",
    intendedUse: "Validate synthetic workflow metadata and prepare a human-reviewable result.",
    namedOwner: "pilot-operations-owner",
    targetUser: "internal-synthetic-evaluator",
    baselineMeasurement: {
      metricId: "synthetic-completion-rate",
      value: 0.9,
      unit: "rate",
      measuredAt: "2026-08-19T00:00:00.000Z",
      evidenceHash: recordHash("p34-synthetic-baseline", "completion-rate")
    },
    outcomeKpis: [{ metricId: "verified-outcome-rate", label: "Verified outcome rate", unit: "rate", direction: "increase", threshold: 0.95 }],
    safetyKpis: [{ metricId: "critical-error-rate", label: "Critical error rate", unit: "rate", direction: "maintain", threshold: 0 }],
    dataSources: [{ sourceId: "p34-synthetic-fixture-set", sourceType: "repository-fixture", required: true, evidenceHash: recordHash("p34-synthetic-data-source", "fixture-set") }],
    dataClassification: "synthetic-no-phi",
    dataLocality: { jurisdiction: "local", region: "local", environmentId: "env-local-sandbox-v1" },
    requiredAuthority: ["pilot-operations-owner"],
    approvalPolicy: { requiredRoles: ["pilot-operations-owner"], exactPayloadBinding: true, approvalTtlMinutes: 30 },
    rollbackPolicy: {
      ownerRole: "platform-operations-owner",
      rollbackSteps: ["cancel synthetic run", "revert to last reviewed fixture output"],
      maximumRecoveryMinutes: 15,
      testedEvidenceHash: recordHash("p34-synthetic-rollback", "tested")
    },
    riskClass: "moderate",
    clinicalReviewRequired: false,
    releaseEvidence: requiredWorkflowEvidenceTypes.map(syntheticEvidence),
    effectiveAt: "2026-08-19T00:00:00.000Z",
    expiresAt: "2026-11-19T00:00:00.000Z"
  };
}

export function createP34SyntheticActionHistory(candidateHash: string, payloadHash: string) {
  const events: ActionMaturityEvent[] = [];
  const actorIdHash = recordHash("p34-synthetic-action-actor", "operator");
  const states: ActionMaturityState[] = ["ANSWER_ONLY", "RECOMMENDATION", "DRAFT_ACTION", "PENDING_APPROVAL"];
  states.forEach((toState, index) => {
    const fromState = index === 0 ? null : states[index - 1];
    const result = transitionActionMaturity({
      eventId: `p34-action-event-${index + 1}`,
      actionId: "p34-synthetic-review-action",
      workflowId: "p34-synthetic-context-validation",
      tenantId: "synthetic-tenant",
      fromState,
      toState,
      actorIdHash,
      authority: "prepare-synthetic-review",
      inputHashes: [payloadHash],
      policyVersion: p34AdaptiveGovernanceVersion,
      occurredAt: `2026-08-19T12:0${index}:00.000Z`,
      resultHash: recordHash("p34-synthetic-action-result", toState),
      rollbackStatus: "ready",
      approval: null,
      candidateHash,
      payloadHash,
      idempotencyKey: `p34-action-idempotency-${index + 1}`,
      targetClass: "internal-metadata",
      executionMode: "synthetic-simulation"
    }, events);
    if (!result.event) throw new Error(`Synthetic action fixture failed: ${result.reasonCodes.join(",")}`);
    events.push(result.event);
  });
  return events;
}

export function createP34SyntheticExpansionEvidence(): PilotExpansionEvidence {
  return {
    expansionId: "p34-synthetic-expansion-review",
    workflowId: "p34-synthetic-context-validation",
    cohort: { description: "Bounded synthetic workflow fixture cohort", size: 24, syntheticOnly: true },
    pilotStartedAt: "2026-08-01T00:00:00.000Z",
    pilotEndedAt: "2026-08-15T00:00:00.000Z",
    evidenceRecordedAt: "2026-08-19T00:00:00.000Z",
    evidenceExpiresAt: "2026-09-19T00:00:00.000Z",
    thresholds: {
      minimumTaskCompletionRate: 0.9,
      minimumVerifiedOutcomeRate: 0.9,
      maximumCriticalErrorRate: 0,
      maximumOverrideRate: 0.1,
      maximumRollbackRate: 0.05,
      maximumReviewMinutesPerWorkflow: 10,
      maximumAbandonmentRate: 0.1,
      maximumP95LatencyMs: 2_000,
      maximumCostPerCompletedWorkflowUsd: 0.5
    },
    observed: {
      taskCompletionRate: 0.96,
      verifiedOutcomeRate: 0.92,
      criticalErrorRate: 0,
      overrideRate: 0.05,
      rollbackRate: 0,
      reviewMinutesPerWorkflow: 4,
      abandonmentRate: 0.04,
      p95LatencyMs: 240,
      costPerCompletedWorkflowUsd: 0
    },
    approvals: [
      { role: "clinical", approverIdHash: recordHash("p34-pending-approver", "clinical"), status: "pending", evidenceHash: recordHash("p34-expansion-approval", "clinical"), expiresAt: "2026-09-19T00:00:00.000Z" },
      { role: "privacy-security", approverIdHash: recordHash("p34-pending-approver", "privacy-security"), status: "pending", evidenceHash: recordHash("p34-expansion-approval", "privacy-security"), expiresAt: "2026-09-19T00:00:00.000Z" },
      { role: "operational", approverIdHash: recordHash("p34-pending-approver", "operational"), status: "pending", evidenceHash: recordHash("p34-expansion-approval", "operational"), expiresAt: "2026-09-19T00:00:00.000Z" }
    ],
    evidenceHashes: [recordHash("p34-expansion-evidence", "synthetic-results")]
  };
}

export function createP34SyntheticContinuityAssessment() {
  const tenantId = "synthetic-tenant";
  const subjectReferenceHash = recordHash("p34-synthetic-continuity-subject", "subject");
  const firstCareTeam = recordHash("p34-synthetic-care-team", "first");
  const secondCareTeam = recordHash("p34-synthetic-care-team", "second");
  return evaluateContinuityOfCare({
    tenantId,
    evaluatedAt: "2026-08-19T12:00:00.000Z",
    relationships: [
      { relationshipId: "p34-relationship-1", tenantId, subjectReferenceHash, careTeamReferenceHash: firstCareTeam, ownerRole: "care-coordination-owner", startedAt: "2026-05-01T00:00:00.000Z", endedAt: "2026-07-31T00:00:00.000Z" },
      { relationshipId: "p34-relationship-2", tenantId, subjectReferenceHash, careTeamReferenceHash: secondCareTeam, ownerRole: "care-coordination-owner", startedAt: "2026-08-01T00:00:00.000Z", endedAt: null }
    ],
    events: [
      { eventId: "p34-continuity-transfer", tenantId, subjectReferenceHash, type: "transfer", occurredAt: "2026-08-01T00:00:00.000Z", fromCareTeamReferenceHash: firstCareTeam, toCareTeamReferenceHash: secondCareTeam, reasonCode: "planned-provider-transition", sourceEvidenceHash: recordHash("p34-continuity-source", "transfer") },
      { eventId: "p34-continuity-interruption", tenantId, subjectReferenceHash, type: "interruption", occurredAt: "2026-08-02T00:00:00.000Z", fromCareTeamReferenceHash: secondCareTeam, toCareTeamReferenceHash: null, reasonCode: "follow-up-pending", sourceEvidenceHash: recordHash("p34-continuity-source", "interruption") },
      { eventId: "p34-continuity-reconnect", tenantId, subjectReferenceHash, type: "reconnect", occurredAt: "2026-08-03T00:00:00.000Z", fromCareTeamReferenceHash: null, toCareTeamReferenceHash: secondCareTeam, reasonCode: "follow-up-reconnected", sourceEvidenceHash: recordHash("p34-continuity-source", "reconnect") }
    ]
  });
}

export function createP34SyntheticPublicSectorProfile(): PublicSectorReadinessEvidenceProfile {
  return {
    profileId: "p34-public-sector-evidence-collection",
    evidenceOwner: "public-sector-readiness-owner",
    recordedAt: "2026-08-19T00:00:00.000Z",
    expiresAt: "2026-09-19T00:00:00.000Z",
    securityControls: [],
    dataResidencyEvidence: [],
    auditabilityEvidence: [],
    accessibilityEvidence: [],
    procurementArtifacts: [],
    contractVehicleReferences: [],
    status: "evidence-collection"
  };
}

export function p34DataClassificationAllowsLocalResearch(value: P34DataClassification) {
  return value === "public" || value === "synthetic-no-phi";
}
