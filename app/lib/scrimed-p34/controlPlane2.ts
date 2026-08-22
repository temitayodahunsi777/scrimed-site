import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import type { AutonomyTier, P34DataClassification, P34RiskTier } from "./types";
import {
  evaluateP34EvidenceSet,
  type P34EvidenceEnvelope,
  type P34EvidenceType
} from "./evidenceExpiry";
import { evaluateTrustedTimeWindow, FixedTrustedClock, type TrustedClock } from "./trustedClock";

export const p34ControlPlane2Version = "scrimed-p34-control-plane-v2.1-2026-08-21";
export const p34ControlPlane2Boundary =
  "Synthetic/no-PHI policy evidence only. Control Plane 2.0 cannot authorize A3, external providers, clinical or payer actions, EHR/device writes, production mutations, customer activation, external distribution, migrations, or compliance claims.";

export type P34KillSwitchMode = "NORMAL" | "RESTRICTED" | "READ_ONLY" | "HALTED";
export type P34CapabilityMaturity =
  | "EXPERIMENTAL"
  | "SYNTHETIC_VALIDATED"
  | "REVIEW_READY"
  | "PILOT_READY"
  | "PRODUCTION_CANDIDATE"
  | "AUTHORIZED_PRODUCTION";
export type P34ExternalSideEffectClass =
  | "none"
  | "reversible-synthetic-internal"
  | "external-communication"
  | "clinical"
  | "payer"
  | "ehr-device"
  | "production-mutation"
  | "external-distribution";
export type P34RollbackClass = "not-required" | "discard-only" | "reversible" | "operator-runbook";
export type P34ReleaseState =
  | "DEVELOPMENT"
  | "CANDIDATE"
  | "EXACT_REVIEW_REQUIRED"
  | "REVIEWED"
  | "PREVIEW_READY"
  | "PREVIEW_VERIFIED"
  | "MERGE_AUTHORIZATION_REQUIRED"
  | "MERGED"
  | "PRODUCTION_AUTHORIZATION_REQUIRED"
  | "PRODUCTION_DEPLOYED"
  | "PRODUCTION_VERIFIED";
export type P34PolicyErrorCode =
  | "POLICY_DENIED"
  | "APPROVAL_REQUIRED"
  | "EVIDENCE_EXPIRED"
  | "UNAUTHORIZED_ENVIRONMENT"
  | "AUTONOMY_NOT_PERMITTED"
  | "OPERATOR_ACTION_REQUIRED";

export type P34GovernedActionDeclaration = {
  schemaVersion: "scrimed-p34-governed-action-v2";
  actionId: string;
  tenantId: string;
  actorIdHash: string;
  candidateFingerprint: string;
  policyVersion: string;
  autonomyClass: AutonomyTier;
  riskTier: P34RiskTier;
  dataClassification: P34DataClassification;
  allowedEnvironments: string[];
  requiredEvidenceTypes: P34EvidenceType[];
  requiredApproval: "none-read-only" | "named-human" | "targeted-specialist";
  allowedTools: string[];
  allowedModels: string[];
  executionMaturity: P34CapabilityMaturity;
  rollbackClass: P34RollbackClass;
  externalSideEffectClass: P34ExternalSideEffectClass;
  jurisdictionConstraints: string[];
  expiresAt: string;
};

export type P34GovernedActionRequest = {
  declaration: P34GovernedActionDeclaration;
  environmentId: string;
  jurisdiction: string;
  requestedToolIds: string[];
  requestedModelIds: string[];
  evidence: P34EvidenceEnvelope[];
  killSwitchMode: P34KillSwitchMode;
  clock: TrustedClock;
};

export type P34GovernedActionDecision = {
  decision: "ALLOW" | "REQUIRE_HUMAN" | "BLOCK";
  reasonCodes: string[];
  errorCodes: P34PolicyErrorCode[];
  evidenceFresh: boolean;
  diagnosticsVisible: boolean;
  executionAuthorized: false;
  a3Available: false;
  externalSideEffectAuthorized: false;
  currentMaturity: P34CapabilityMaturity;
  releaseStateCeiling: "EXACT_REVIEW_REQUIRED";
  decisionHash: string;
};

export type P34OversightSignalInput = {
  privilegeDrift: boolean;
  maturityDrift: boolean;
  evidenceExpired: boolean;
  retryCount: number;
  maximumRetries: number;
  delegationDepth: number;
  maximumDelegationDepth: number;
  budgetUsedRatio: number;
  modelSubstitution: boolean;
  policyMutation: boolean;
  unexpectedNetworkTargets: string[];
  tenantLeakageDetected: boolean;
  approvalReplayDetected: boolean;
  unauthorizedDistributionAttempt: boolean;
};

export type P34OversightIncident = {
  incidentId: string;
  severity: "SEV0" | "SEV1" | "SEV2" | "SEV3";
  signal: string;
  containment: "HALTED" | "READ_ONLY" | "RESTRICTED";
  executionAuthorityGranted: false;
  incidentHash: string;
};

const sha256Pattern = /^[0-9a-f]{64}$/i;
const idPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,159}$/;
const maturityRank: Record<P34CapabilityMaturity, number> = {
  EXPERIMENTAL: 0,
  SYNTHETIC_VALIDATED: 1,
  REVIEW_READY: 2,
  PILOT_READY: 3,
  PRODUCTION_CANDIDATE: 4,
  AUTHORIZED_PRODUCTION: 5
};
const autonomyClasses = new Set<AutonomyTier>(["A0", "A1", "A2", "A3"]);
const riskTiers = new Set<P34RiskTier>(["low", "moderate", "high", "prohibited"]);
const dataClassifications = new Set<P34DataClassification>([
  "public", "synthetic-no-phi", "deidentified-approved", "phi-restricted"
]);
const requiredApprovalClasses = new Set<P34GovernedActionDeclaration["requiredApproval"]>([
  "none-read-only", "named-human", "targeted-specialist"
]);
const capabilityMaturities = new Set<P34CapabilityMaturity>(Object.keys(maturityRank) as P34CapabilityMaturity[]);
const rollbackClasses = new Set<P34RollbackClass>([
  "not-required", "discard-only", "reversible", "operator-runbook"
]);
const externalSideEffectClasses = new Set<P34ExternalSideEffectClass>([
  "none", "reversible-synthetic-internal", "external-communication", "clinical", "payer",
  "ehr-device", "production-mutation", "external-distribution"
]);
const killSwitchModes = new Set<P34KillSwitchMode>(["NORMAL", "RESTRICTED", "READ_ONLY", "HALTED"]);
const releaseStates: P34ReleaseState[] = [
  "DEVELOPMENT", "CANDIDATE", "EXACT_REVIEW_REQUIRED", "REVIEWED", "PREVIEW_READY",
  "PREVIEW_VERIFIED", "MERGE_AUTHORIZATION_REQUIRED", "MERGED",
  "PRODUCTION_AUTHORIZATION_REQUIRED", "PRODUCTION_DEPLOYED", "PRODUCTION_VERIFIED"
];
const evidenceTypes = new Set<P34EvidenceType>([
  "candidate-manifest", "validation-packet", "gate-packet", "security-evidence",
  "review-packet", "migration-report", "public-claims", "investor-artifact"
]);

function canonical(values: readonly unknown[]) {
  return [...new Set(values.filter((value): value is string => typeof value === "string")
    .map((value) => value.trim()).filter(Boolean))].sort();
}

function isBoundedIdentifier(value: unknown): value is string {
  return typeof value === "string" && idPattern.test(value);
}

function isSha256(value: unknown): value is string {
  return typeof value === "string" && sha256Pattern.test(value);
}

function isBoundedIdentifierList(value: unknown, allowEmpty = true) {
  return Array.isArray(value) && value.length <= 64 && (allowEmpty || value.length > 0) &&
    value.every(isBoundedIdentifier);
}

function isWriteSideEffect(sideEffect: unknown) {
  return sideEffect !== "none";
}

function killSwitchReasons(request: P34GovernedActionRequest) {
  const { declaration, killSwitchMode } = request;
  if (killSwitchMode === "HALTED") return ["KILL_SWITCH_HALTED"];
  if (killSwitchMode === "READ_ONLY" && (isWriteSideEffect(declaration.externalSideEffectClass) || declaration.autonomyClass === "A2" || declaration.autonomyClass === "A3")) {
    return ["KILL_SWITCH_READ_ONLY"];
  }
  if (killSwitchMode === "RESTRICTED" && (declaration.autonomyClass === "A2" || declaration.autonomyClass === "A3")) {
    return ["KILL_SWITCH_RESTRICTED"];
  }
  return [];
}

export function resolveP34KillSwitchMode(env: NodeJS.ProcessEnv = process.env): P34KillSwitchMode {
  const value = env.SCRIMED_P34_KILL_SWITCH_MODE?.trim().toUpperCase();
  return value === "NORMAL" || value === "RESTRICTED" || value === "READ_ONLY" || value === "HALTED"
    ? value
    : "READ_ONLY";
}

export function evaluateP34GovernedAction(request: P34GovernedActionRequest): P34GovernedActionDecision {
  const record = (request && typeof request === "object" ? request : {}) as Partial<P34GovernedActionRequest>;
  const declaration = (record.declaration && typeof record.declaration === "object"
    ? record.declaration
    : {}) as P34GovernedActionDeclaration;
  const normalizedRequest = {
    declaration,
    killSwitchMode: record.killSwitchMode
  } as P34GovernedActionRequest;
  const reasonCodes: string[] = [];
  if (record !== request || declaration !== record.declaration) reasonCodes.push("ACTION_REQUEST_INVALID");
  const schemaValid = declaration.schemaVersion === "scrimed-p34-governed-action-v2";
  const autonomyValid = autonomyClasses.has(declaration.autonomyClass);
  const riskValid = riskTiers.has(declaration.riskTier);
  const dataClassificationValid = dataClassifications.has(declaration.dataClassification);
  const requiredApprovalValid = requiredApprovalClasses.has(declaration.requiredApproval);
  const maturityValid = capabilityMaturities.has(declaration.executionMaturity);
  const rollbackValid = rollbackClasses.has(declaration.rollbackClass);
  const sideEffectValid = externalSideEffectClasses.has(declaration.externalSideEffectClass);
  const killSwitchValid = killSwitchModes.has(record.killSwitchMode as P34KillSwitchMode);
  if (!schemaValid) reasonCodes.push("ACTION_DECLARATION_SCHEMA_INVALID");
  if (!autonomyValid || !riskValid || !dataClassificationValid || !requiredApprovalValid ||
      !maturityValid || !rollbackValid || !sideEffectValid) {
    reasonCodes.push("ACTION_DECLARATION_ENUM_INVALID");
  }
  if (!killSwitchValid) reasonCodes.push("KILL_SWITCH_MODE_INVALID");
  for (const value of [declaration.actionId, declaration.tenantId, declaration.policyVersion]) {
    if (!isBoundedIdentifier(value)) reasonCodes.push("ACTION_DECLARATION_IDENTIFIER_INVALID");
  }
  if (!isSha256(declaration.actorIdHash) || !isSha256(declaration.candidateFingerprint)) {
    reasonCodes.push("ACTION_DECLARATION_IDENTITY_OR_CANDIDATE_INVALID");
  }
  const allowedEnvironmentsValid = isBoundedIdentifierList(declaration.allowedEnvironments, false);
  const jurisdictionsValid = isBoundedIdentifierList(declaration.jurisdictionConstraints, false);
  const allowedToolsValid = isBoundedIdentifierList(declaration.allowedTools);
  const allowedModelsValid = isBoundedIdentifierList(declaration.allowedModels);
  const requestedToolsValid = isBoundedIdentifierList(record.requestedToolIds);
  const requestedModelsValid = isBoundedIdentifierList(record.requestedModelIds);
  const requiredEvidenceTypesValid = Array.isArray(declaration.requiredEvidenceTypes) &&
    declaration.requiredEvidenceTypes.length > 0 && declaration.requiredEvidenceTypes.length <= 16 &&
    declaration.requiredEvidenceTypes.every((type) => evidenceTypes.has(type));
  if (!allowedEnvironmentsValid || !jurisdictionsValid || !allowedToolsValid || !allowedModelsValid ||
      !requestedToolsValid || !requestedModelsValid || !requiredEvidenceTypesValid ||
      !isBoundedIdentifier(record.environmentId) || !isBoundedIdentifier(record.jurisdiction)) {
    reasonCodes.push("ACTION_DECLARATION_INCOMPLETE");
  }
  const allowedEnvironments = allowedEnvironmentsValid ? canonical(declaration.allowedEnvironments) : [];
  const jurisdictions = jurisdictionsValid ? canonical(declaration.jurisdictionConstraints) : [];
  const allowedTools = allowedToolsValid ? canonical(declaration.allowedTools) : [];
  const allowedModels = allowedModelsValid ? canonical(declaration.allowedModels) : [];
  const requestedTools = requestedToolsValid ? canonical(record.requestedToolIds as string[]) : [];
  const requestedModels = requestedModelsValid ? canonical(record.requestedModelIds as string[]) : [];
  const requiredEvidenceTypes = requiredEvidenceTypesValid ? [...declaration.requiredEvidenceTypes] : [];
  const rawEvidenceItems = Array.isArray(record.evidence) ? record.evidence : [];
  const evidenceItems = rawEvidenceItems.filter(
    (item): item is P34EvidenceEnvelope => Boolean(item) && typeof item === "object"
  );
  if (!Array.isArray(record.evidence) || evidenceItems.length !== rawEvidenceItems.length) {
    reasonCodes.push("ACTION_EVIDENCE_SET_INVALID");
  }

  const declarationWindow = evaluateTrustedTimeWindow({
    issuedAt: evidenceItems.map((item) => item.generatedAt).filter((value) => typeof value === "string").sort()[0] ?? declaration.expiresAt,
    expiresAt: declaration.expiresAt
  }, record.clock as TrustedClock);
  if (!declarationWindow.valid) reasonCodes.push("ACTION_DECLARATION_EXPIRED_OR_INVALID");

  const evidence = evaluateP34EvidenceSet({
    evidence: evidenceItems,
    requiredTypes: requiredEvidenceTypes,
    expectedCandidate: declaration.candidateFingerprint,
    clock: record.clock as TrustedClock
  });
  if (!evidence.fresh) reasonCodes.push("REQUIRED_EVIDENCE_MISSING_OR_EXPIRED");
  if (!allowedEnvironments.includes(record.environmentId ?? "")) reasonCodes.push("ENVIRONMENT_NOT_ALLOWED");
  if (!jurisdictions.includes(record.jurisdiction ?? "")) reasonCodes.push("JURISDICTION_NOT_ALLOWED");
  if (requestedTools.some((toolId) => !allowedTools.includes(toolId))) {
    reasonCodes.push("TOOL_NOT_ALLOWED");
  }
  if (requestedModels.some((modelId) => !allowedModels.includes(modelId))) {
    reasonCodes.push("MODEL_NOT_ALLOWED");
  }
  if (declaration.dataClassification === "phi-restricted") reasonCodes.push("LIVE_PHI_DISABLED");
  if (declaration.riskTier === "prohibited") reasonCodes.push("PROHIBITED_RISK");
  if (declaration.autonomyClass === "A3") reasonCodes.push("A3_UNAVAILABLE_IN_CURRENT_CANDIDATE");
  if ((declaration.autonomyClass === "A0" || declaration.autonomyClass === "A1") && isWriteSideEffect(declaration.externalSideEffectClass)) {
    reasonCodes.push("A0_A1_CANNOT_MUTATE");
  }
  if (declaration.autonomyClass === "A2") {
    reasonCodes.push("A2_REQUIRES_NAMED_REVIEW");
    if (declaration.requiredApproval === "none-read-only") reasonCodes.push("A2_APPROVAL_POLICY_INVALID");
  }
  if (requiredApprovalValid && declaration.requiredApproval !== "none-read-only") {
    reasonCodes.push("DECLARED_APPROVAL_REQUIRED");
  }
  if (declaration.riskTier === "high") reasonCodes.push("HIGH_RISK_REQUIRES_HUMAN");
  if (declaration.requiredApproval === "none-read-only" && isWriteSideEffect(declaration.externalSideEffectClass)) {
    reasonCodes.push("APPROVAL_POLICY_INCOMPATIBLE_WITH_SIDE_EFFECT");
  }
  if (maturityValid && maturityRank[declaration.executionMaturity] > maturityRank.REVIEW_READY) {
    reasonCodes.push("MATURITY_EXCEEDS_CURRENT_EVIDENCE");
  }
  if (declaration.externalSideEffectClass !== "none" && declaration.externalSideEffectClass !== "reversible-synthetic-internal") {
    reasonCodes.push("EXTERNAL_SIDE_EFFECT_DISABLED");
  }
  reasonCodes.push(...killSwitchReasons(normalizedRequest));

  const normalizedReasons = canonical(reasonCodes);
  const reviewOnly = new Set([
    "A2_REQUIRES_NAMED_REVIEW",
    "DECLARED_APPROVAL_REQUIRED",
    "HIGH_RISK_REQUIRES_HUMAN"
  ]);
  const blocking = normalizedReasons.some((reason) => !reviewOnly.has(reason));
  const decision = blocking ? "BLOCK" as const : normalizedReasons.length ? "REQUIRE_HUMAN" as const : "ALLOW" as const;
  const errorCodes = canonical([
    ...(blocking ? ["POLICY_DENIED"] : []),
    ...(normalizedReasons.some((reason) => reason.includes("EVIDENCE")) ? ["EVIDENCE_EXPIRED"] : []),
    ...(normalizedReasons.some((reason) => reason.includes("ENVIRONMENT")) ? ["UNAUTHORIZED_ENVIRONMENT"] : []),
    ...(normalizedReasons.some((reason) => reason.includes("A2") || reason.includes("A3")) ? ["AUTONOMY_NOT_PERMITTED"] : []),
    ...(decision === "REQUIRE_HUMAN" ? ["APPROVAL_REQUIRED", "OPERATOR_ACTION_REQUIRED"] : [])
  ]) as P34PolicyErrorCode[];
  const payload = {
    declaration: {
      schemaVersion: schemaValid ? declaration.schemaVersion : "invalid",
      actionId: isBoundedIdentifier(declaration.actionId) ? declaration.actionId : "invalid",
      tenantIdHash: createClinicalEvidenceHash(isBoundedIdentifier(declaration.tenantId) ? declaration.tenantId : "invalid"),
      actorIdHash: isSha256(declaration.actorIdHash) ? declaration.actorIdHash : "invalid",
      candidateFingerprint: isSha256(declaration.candidateFingerprint) ? declaration.candidateFingerprint : "invalid",
      policyVersion: isBoundedIdentifier(declaration.policyVersion) ? declaration.policyVersion : "invalid",
      autonomyClass: autonomyValid ? declaration.autonomyClass : "invalid",
      riskTier: riskValid ? declaration.riskTier : "invalid",
      dataClassification: dataClassificationValid ? declaration.dataClassification : "invalid",
      requiredApproval: requiredApprovalValid ? declaration.requiredApproval : "invalid",
      executionMaturity: maturityValid ? declaration.executionMaturity : "invalid",
      rollbackClass: rollbackValid ? declaration.rollbackClass : "invalid",
      externalSideEffectClass: sideEffectValid ? declaration.externalSideEffectClass : "invalid",
      allowedEnvironments,
      jurisdictions,
      allowedTools,
      allowedModels
    },
    environmentId: isBoundedIdentifier(record.environmentId) ? record.environmentId : "invalid",
    jurisdiction: isBoundedIdentifier(record.jurisdiction) ? record.jurisdiction : "invalid",
    requestedToolIds: requestedTools,
    requestedModelIds: requestedModels,
    evidenceSetHash: evidence.setHash,
    killSwitchMode: killSwitchValid ? record.killSwitchMode : "invalid",
    evaluatedAt: declarationWindow.evaluatedAt,
    decision,
    reasonCodes: normalizedReasons,
    errorCodes
  };
  return {
    decision,
    reasonCodes: normalizedReasons,
    errorCodes,
    evidenceFresh: evidence.fresh,
    diagnosticsVisible: true,
    executionAuthorized: false,
    a3Available: false,
    externalSideEffectAuthorized: false,
    currentMaturity: maturityValid ? declaration.executionMaturity : "EXPERIMENTAL",
    releaseStateCeiling: "EXACT_REVIEW_REQUIRED",
    decisionHash: createClinicalEvidenceHash({ type: "p34-governed-action-decision", payload })
  };
}

export function evaluateP34ReleaseTransition(input: {
  currentState: P34ReleaseState;
  requestedState: P34ReleaseState;
  exactReviewEvidencePresent: boolean;
  externalAuthorizationPresent: boolean;
}) {
  const record = (input && typeof input === "object" ? input : {}) as Partial<typeof input>;
  const reasonCodes: string[] = [];
  if (record !== input) reasonCodes.push("RELEASE_TRANSITION_INPUT_INVALID");
  const currentIndex = releaseStates.indexOf(record.currentState as P34ReleaseState);
  const requestedIndex = releaseStates.indexOf(record.requestedState as P34ReleaseState);
  const reviewCeilingIndex = releaseStates.indexOf("EXACT_REVIEW_REQUIRED");
  if (currentIndex < 0 || requestedIndex < 0) reasonCodes.push("RELEASE_STATE_INVALID");
  if (requestedIndex > reviewCeilingIndex) reasonCodes.push("CURRENT_CANDIDATE_RELEASE_CEILING");
  if (record.exactReviewEvidencePresent !== true && requestedIndex > reviewCeilingIndex) {
    reasonCodes.push("EXACT_CANDIDATE_REVIEW_REQUIRED");
  }
  if (record.externalAuthorizationPresent !== true && requestedIndex > reviewCeilingIndex) {
    reasonCodes.push("EXTERNAL_RELEASE_AUTHORIZATION_REQUIRED");
  }
  if (currentIndex >= 0 && requestedIndex > currentIndex + 1) {
    reasonCodes.push("RELEASE_STATE_SKIP_PROHIBITED");
  }
  const normalizedReasons = canonical(reasonCodes);
  const accepted = normalizedReasons.length === 0;
  return {
    decision: accepted ? "ALLOW" as const : "BLOCK" as const,
    accepted,
    resultingState: accepted
      ? record.requestedState as P34ReleaseState
      : currentIndex >= 0 ? record.currentState as P34ReleaseState : "DEVELOPMENT" as const,
    reasonCodes: normalizedReasons,
    productionAuthorityGranted: false as const,
    decisionHash: createClinicalEvidenceHash({
      type: "p34-release-transition",
      input: {
        currentState: currentIndex >= 0 ? record.currentState : "invalid",
        requestedState: requestedIndex >= 0 ? record.requestedState : "invalid",
        exactReviewEvidencePresent: record.exactReviewEvidencePresent === true,
        externalAuthorizationPresent: record.externalAuthorizationPresent === true
      },
      reasonCodes: normalizedReasons
    })
  };
}

export function evaluateP34OversightSentinel(input: P34OversightSignalInput) {
  const record = (input && typeof input === "object" ? input : {}) as Partial<P34OversightSignalInput>;
  const booleanSignals = [
    record.privilegeDrift, record.maturityDrift, record.evidenceExpired, record.modelSubstitution,
    record.policyMutation, record.tenantLeakageDetected, record.approvalReplayDetected,
    record.unauthorizedDistributionAttempt
  ];
  const counterValues = [record.retryCount, record.maximumRetries, record.delegationDepth, record.maximumDelegationDepth];
  const unexpectedNetworkTargetsValid = isBoundedIdentifierList(record.unexpectedNetworkTargets);
  const inputInvalid = record !== input || booleanSignals.some((value) => typeof value !== "boolean") ||
    counterValues.some((value) => typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) ||
    !Number.isFinite(record.budgetUsedRatio) || (record.budgetUsedRatio ?? -1) < 0 ||
    !unexpectedNetworkTargetsValid;
  const unexpectedNetworkTargets = unexpectedNetworkTargetsValid
    ? canonical(record.unexpectedNetworkTargets as string[])
    : [];
  const signals: Array<{ active: boolean; name: string; severity: P34OversightIncident["severity"]; containment: P34OversightIncident["containment"] }> = [
    { active: inputInvalid, name: "SENTINEL_INPUT_INVALID", severity: "SEV0", containment: "HALTED" },
    { active: record.tenantLeakageDetected === true, name: "TENANT_LEAKAGE", severity: "SEV0", containment: "HALTED" },
    { active: record.approvalReplayDetected === true, name: "APPROVAL_REPLAY", severity: "SEV1", containment: "HALTED" },
    { active: record.privilegeDrift === true, name: "PRIVILEGE_DRIFT", severity: "SEV1", containment: "HALTED" },
    { active: record.unauthorizedDistributionAttempt === true, name: "UNAUTHORIZED_DISTRIBUTION", severity: "SEV1", containment: "HALTED" },
    { active: record.policyMutation === true, name: "POLICY_MUTATION", severity: "SEV1", containment: "READ_ONLY" },
    { active: record.modelSubstitution === true, name: "MODEL_SUBSTITUTION", severity: "SEV1", containment: "READ_ONLY" },
    { active: record.maturityDrift === true, name: "MATURITY_DRIFT", severity: "SEV2", containment: "READ_ONLY" },
    { active: record.evidenceExpired === true, name: "EVIDENCE_EXPIRED", severity: "SEV2", containment: "READ_ONLY" },
    { active: Number.isSafeInteger(record.retryCount) && Number.isSafeInteger(record.maximumRetries) && (record.retryCount ?? 0) > (record.maximumRetries ?? 0), name: "RETRY_BUDGET_EXCEEDED", severity: "SEV2", containment: "RESTRICTED" },
    { active: Number.isSafeInteger(record.delegationDepth) && Number.isSafeInteger(record.maximumDelegationDepth) && (record.delegationDepth ?? 0) > (record.maximumDelegationDepth ?? 0), name: "DELEGATION_DEPTH_EXCEEDED", severity: "SEV2", containment: "RESTRICTED" },
    { active: Number.isFinite(record.budgetUsedRatio) && (record.budgetUsedRatio ?? 0) > 1, name: "BUDGET_EXCEEDED", severity: "SEV2", containment: "RESTRICTED" },
    { active: unexpectedNetworkTargets.length > 0, name: "UNEXPECTED_NETWORK_TARGET", severity: "SEV1", containment: "HALTED" }
  ];
  const incidents = signals.filter((signal) => signal.active).map((signal, index) => {
    const payload = { signal: signal.name, severity: signal.severity, containment: signal.containment, ordinal: index };
    return {
      incidentId: `p34-sentinel-${signal.name.toLowerCase().replaceAll("_", "-")}`,
      severity: signal.severity,
      signal: signal.name,
      containment: signal.containment,
      executionAuthorityGranted: false as const,
      incidentHash: createClinicalEvidenceHash({ type: "p34-oversight-incident", payload })
    };
  });
  const recommendedMode: P34KillSwitchMode = incidents.some((item) => item.containment === "HALTED")
    ? "HALTED"
    : incidents.some((item) => item.containment === "READ_ONLY")
      ? "READ_ONLY"
      : incidents.length ? "RESTRICTED" : "NORMAL";
  return {
    decision: incidents.length ? "REQUIRE_HUMAN" as const : "ALLOW" as const,
    incidents,
    recommendedMode,
    executionAuthorityGranted: false as const,
    sentinelHash: createClinicalEvidenceHash({
      type: "p34-oversight-sentinel",
      input: {
        privilegeDrift: record.privilegeDrift === true,
        maturityDrift: record.maturityDrift === true,
        evidenceExpired: record.evidenceExpired === true,
        retryCount: Number.isSafeInteger(record.retryCount) ? record.retryCount : null,
        maximumRetries: Number.isSafeInteger(record.maximumRetries) ? record.maximumRetries : null,
        delegationDepth: Number.isSafeInteger(record.delegationDepth) ? record.delegationDepth : null,
        maximumDelegationDepth: Number.isSafeInteger(record.maximumDelegationDepth) ? record.maximumDelegationDepth : null,
        budgetUsedRatio: Number.isFinite(record.budgetUsedRatio) ? record.budgetUsedRatio : null,
        modelSubstitution: record.modelSubstitution === true,
        policyMutation: record.policyMutation === true,
        tenantLeakageDetected: record.tenantLeakageDetected === true,
        approvalReplayDetected: record.approvalReplayDetected === true,
        unauthorizedDistributionAttempt: record.unauthorizedDistributionAttempt === true,
        unexpectedNetworkTargetHashes: unexpectedNetworkTargets.map((target) => createClinicalEvidenceHash(target)),
      },
      incidents,
      recommendedMode
    })
  };
}

export function createP34TraceEvaluationRecord(input: {
  traceId: string;
  actionId: string;
  tenantId: string;
  modelId: string;
  promptVersion: string;
  toolIds: string[];
  evidenceHashes: string[];
  resultHash: string;
  evaluationHash: string;
  reviewerCorrectionHash: string | null;
  accepted: boolean;
  latencyMs: number;
  costUsd: number;
}) {
  const record = (input && typeof input === "object" ? input : {}) as Partial<typeof input>;
  const evidenceHashes = Array.isArray(record.evidenceHashes) ? record.evidenceHashes : [];
  const toolIds = Array.isArray(record.toolIds) ? record.toolIds : [];
  if (!Array.isArray(record.evidenceHashes) || evidenceHashes.length === 0 || evidenceHashes.length > 128) {
    throw new Error("Trace-to-eval requires a bounded nonempty evidence set");
  }
  if (!isBoundedIdentifierList(record.toolIds) || toolIds.length > 64) {
    throw new Error("Trace-to-eval tool identifiers must be bounded");
  }
  for (const value of [...evidenceHashes, record.resultHash, record.evaluationHash, record.reviewerCorrectionHash]) {
    if (value !== null && !isSha256(value)) throw new Error("Trace-to-eval evidence must use SHA-256 fingerprints");
  }
  if ([record.traceId, record.actionId, record.tenantId, record.modelId, record.promptVersion]
    .some((value) => typeof value !== "string" || !idPattern.test(value))) {
    throw new Error("Trace-to-eval identifiers must be bounded");
  }
  if (typeof record.accepted !== "boolean" || !Number.isFinite(record.latencyMs) || !Number.isFinite(record.costUsd) ||
      (record.latencyMs ?? -1) < 0 || (record.costUsd ?? -1) < 0) {
    throw new Error("Trace telemetry must be finite and nonnegative");
  }
  const payload = {
    traceId: record.traceId as string,
    actionId: record.actionId as string,
    tenantId: record.tenantId as string,
    modelId: record.modelId as string,
    promptVersion: record.promptVersion as string,
    toolIds: canonical(toolIds),
    evidenceHashes: canonical(evidenceHashes),
    resultHash: record.resultHash as string,
    evaluationHash: record.evaluationHash as string,
    reviewerCorrectionHash: record.reviewerCorrectionHash ?? null,
    accepted: record.accepted as boolean,
    latencyMs: record.latencyMs as number,
    costUsd: record.costUsd as number,
    containsRawPhi: false as const,
    containsSecrets: false as const,
    hiddenChainOfThoughtStored: false as const
  };
  return {
    ...payload,
    traceEvaluationHash: createClinicalEvidenceHash({ type: "p34-trace-to-eval", payload })
  };
}

export function createP34ControlPlane2Summary(env: NodeJS.ProcessEnv = process.env) {
  const clock = new FixedTrustedClock("2026-08-21T04:00:00.000Z");
  const killSwitchMode = resolveP34KillSwitchMode(env);
  const candidateFingerprint = createClinicalEvidenceHash("p34-control-plane-2-synthetic-candidate");
  const evidence: P34EvidenceEnvelope[] = ["candidate-manifest", "validation-packet", "security-evidence"].map(
    (evidenceType, index) => ({
      evidenceId: `p34-control-plane-evidence-${index + 1}`,
      evidenceType: evidenceType as P34EvidenceType,
      sourceCandidate: candidateFingerprint,
      validationVersion: p34ControlPlane2Version,
      generatedAt: "2026-08-21T03:30:00.000Z",
      expiresAt: "2026-08-22T05:11:03.000Z",
      evidenceHash: createClinicalEvidenceHash(`p34-control-plane-evidence-${evidenceType}`)
    })
  );
  const declaration: P34GovernedActionDeclaration = {
    schemaVersion: "scrimed-p34-governed-action-v2",
    actionId: "inspect-synthetic-governance-evidence",
    tenantId: "synthetic-tenant",
    actorIdHash: createClinicalEvidenceHash("p34-control-plane-actor"),
    candidateFingerprint,
    policyVersion: p34ControlPlane2Version,
    autonomyClass: "A0",
    riskTier: "low",
    dataClassification: "synthetic-no-phi",
    allowedEnvironments: ["local-synthetic"],
    requiredEvidenceTypes: ["candidate-manifest", "validation-packet", "security-evidence"],
    requiredApproval: "none-read-only",
    allowedTools: ["evidence-reader"],
    allowedModels: ["deterministic-policy-engine-v1"],
    executionMaturity: "REVIEW_READY",
    rollbackClass: "not-required",
    externalSideEffectClass: "none",
    jurisdictionConstraints: ["local"],
    expiresAt: "2026-08-22T05:11:03.000Z"
  };
  const action = evaluateP34GovernedAction({
    declaration,
    environmentId: "local-synthetic",
    jurisdiction: "local",
    requestedToolIds: ["evidence-reader"],
    requestedModelIds: ["deterministic-policy-engine-v1"],
    evidence,
    killSwitchMode,
    clock
  });
  const oversightBaseInput: P34OversightSignalInput = {
    privilegeDrift: false,
    maturityDrift: false,
    evidenceExpired: false,
    retryCount: 0,
    maximumRetries: 2,
    delegationDepth: 1,
    maximumDelegationDepth: 3,
    budgetUsedRatio: 0.1,
    modelSubstitution: false,
    policyMutation: false,
    unexpectedNetworkTargets: [],
    tenantLeakageDetected: false,
    approvalReplayDetected: false,
    unauthorizedDistributionAttempt: false
  };
  const oversight = evaluateP34OversightSentinel(oversightBaseInput);
  const oversightDetectorCases: Array<{
    signal: string;
    input: Partial<P34OversightSignalInput>;
  }> = [
    { signal: "PRIVILEGE_DRIFT", input: { privilegeDrift: true } },
    { signal: "MATURITY_DRIFT", input: { maturityDrift: true } },
    { signal: "EVIDENCE_EXPIRED", input: { evidenceExpired: true } },
    { signal: "RETRY_BUDGET_EXCEEDED", input: { retryCount: 3 } },
    { signal: "DELEGATION_DEPTH_EXCEEDED", input: { delegationDepth: 4 } },
    { signal: "BUDGET_EXCEEDED", input: { budgetUsedRatio: 1.01 } },
    { signal: "MODEL_SUBSTITUTION", input: { modelSubstitution: true } },
    { signal: "POLICY_MUTATION", input: { policyMutation: true } },
    { signal: "UNEXPECTED_NETWORK_TARGET", input: { unexpectedNetworkTargets: ["unexpected.example"] } },
    { signal: "TENANT_LEAKAGE", input: { tenantLeakageDetected: true } },
    { signal: "APPROVAL_REPLAY", input: { approvalReplayDetected: true } },
    { signal: "UNAUTHORIZED_DISTRIBUTION", input: { unauthorizedDistributionAttempt: true } }
  ];
  const oversightDetectorCoverage = oversightDetectorCases.map(({ signal, input }) => {
    const result = evaluateP34OversightSentinel({ ...oversightBaseInput, ...input });
    return {
      signal,
      detected: result.incidents.some((incident) => incident.signal === signal),
      recommendedMode: result.recommendedMode,
      executionAuthorityGranted: result.executionAuthorityGranted,
      sentinelHash: result.sentinelHash
    };
  });
  const release = evaluateP34ReleaseTransition({
    currentState: "CANDIDATE",
    requestedState: "EXACT_REVIEW_REQUIRED",
    exactReviewEvidencePresent: false,
    externalAuthorizationPresent: false
  });
  const trace = createP34TraceEvaluationRecord({
    traceId: "trace-p34-control-plane-2",
    actionId: declaration.actionId,
    tenantId: declaration.tenantId,
    modelId: "deterministic-policy-engine-v1",
    promptVersion: "not-applicable-deterministic",
    toolIds: ["evidence-reader"],
    evidenceHashes: evidence.map((item) => item.evidenceHash),
    resultHash: action.decisionHash,
    evaluationHash: createClinicalEvidenceHash("p34-control-plane-evaluation"),
    reviewerCorrectionHash: null,
    accepted: true,
    latencyMs: 3,
    costUsd: 0
  });
  const payload = {
    version: p34ControlPlane2Version,
    boundary: p34ControlPlane2Boundary,
    evidenceContext: {
      classification: "synthetic-fixture-only" as const,
      trustedClockMode: "fixed-synthetic-test" as const,
      exactCandidateEvidenceVerified: false,
      releaseEvidenceAuthorityGranted: false
    },
    killSwitchMode,
    declaration,
    action,
    oversight,
    oversightDetectorCoverage,
    release,
    evidence,
    trace,
    runtime: {
      nodeTarget: "24.x" as const,
      vercelState: "preview-only" as const,
      migrationState: "three-unapplied-static-ready" as const,
      aal2State: "fresh-operator-evidence-required" as const,
      reviewState: "exact-candidate-independent-review-required" as const
    },
    providerCallsExecuted: false,
    phiProcessed: false,
    governedWritesExecuted: false,
    productionAuthorityGranted: false
  };
  return {
    ...payload,
    summaryHash: createClinicalEvidenceHash({ type: "p34-control-plane-2-summary", payload })
  };
}
