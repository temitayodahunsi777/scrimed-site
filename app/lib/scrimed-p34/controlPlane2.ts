import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import type { AutonomyTier, P34DataClassification, P34RiskTier } from "./types";
import {
  createSyntheticP34EvidenceSignature,
  createSyntheticP34EvidenceVerifier,
  evaluateP34EvidenceSet,
  type P34EvidenceEnvelope,
  type P34EvidenceType,
  type P34EvidenceVerificationContext
} from "./evidenceExpiry";
import { evaluateTrustedTimeWindow, FixedTrustedClock, type TrustedClock } from "./trustedClock";

export const p34ControlPlane2Version = "scrimed-p34-control-plane-v2.3-2026-08-23";
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
  resourceId: string;
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
  evidenceVerificationContext: P34EvidenceVerificationContext;
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
  evaluatedAt: string;
  decisionHash: string;
};

export type P34DynamicGovernanceStatus =
  | "PERMITTED"
  | "PERMITTED_WITH_REVIEW"
  | "OPERATOR_ACTION_REQUIRED"
  | "TARGETED_SPECIALIST_REVIEW_REQUIRED"
  | "PROHIBITED";

export type P34DynamicGovernanceInput = {
  actionId: string;
  actorIdentityHash: string;
  tenantId: string;
  environmentId: string;
  autonomyTier: AutonomyTier;
  actionMaturity: P34CapabilityMaturity;
  evidenceFresh: boolean;
  dataClassification: P34DataClassification;
  jurisdiction: string;
  modelQualified: boolean;
  toolQualified: boolean;
  approvalState: "not-required" | "missing" | "synthetic-only" | "trusted-valid" | "expired" | "replayed";
  deploymentState: "local-synthetic" | "preview-synthetic" | "preproduction" | "production";
  riskTier: P34RiskTier;
  externalSideEffectClass: P34ExternalSideEffectClass;
};

export type P34DynamicGovernanceDecision = {
  status: P34DynamicGovernanceStatus;
  reasonCodes: string[];
  humanReviewRequired: boolean;
  executionAuthorized: false;
  clinicalAuthorityGranted: false;
  productionAuthorityGranted: false;
  decisionHash: string;
};

export type P34OversightSignalInput = {
  autonomyEscalation: boolean;
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
  routeDivergence: boolean;
  unexpectedNetworkTargets: string[];
  tenantLeakageDetected: boolean;
  approvalReplayDetected: boolean;
  egressFirewallTriggered: boolean;
  anomalousToolEscalation: boolean;
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
  "review-packet", "migration-report", "model-qualification", "aal2", "public-claims",
  "investor-artifact", "preview-validation", "specialist-review"
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

export function evaluateP34DynamicGovernance(
  input: P34DynamicGovernanceInput
): P34DynamicGovernanceDecision {
  const record = (input && typeof input === "object" ? input : {}) as Partial<P34DynamicGovernanceInput>;
  const reasonCodes: string[] = [];
  const approvalStates = new Set<P34DynamicGovernanceInput["approvalState"]>([
    "not-required", "missing", "synthetic-only", "trusted-valid", "expired", "replayed"
  ]);
  const deploymentStates = new Set<P34DynamicGovernanceInput["deploymentState"]>([
    "local-synthetic", "preview-synthetic", "preproduction", "production"
  ]);
  if (record !== input || !isBoundedIdentifier(record.actionId) || !isSha256(record.actorIdentityHash) ||
      !isBoundedIdentifier(record.tenantId) || !isBoundedIdentifier(record.environmentId) ||
      !isBoundedIdentifier(record.jurisdiction)) {
    reasonCodes.push("DYNAMIC_GOVERNANCE_INPUT_INVALID");
  }
  if (!autonomyClasses.has(record.autonomyTier as AutonomyTier) ||
      !capabilityMaturities.has(record.actionMaturity as P34CapabilityMaturity) ||
      !dataClassifications.has(record.dataClassification as P34DataClassification) ||
      !riskTiers.has(record.riskTier as P34RiskTier) ||
      !externalSideEffectClasses.has(record.externalSideEffectClass as P34ExternalSideEffectClass) ||
      !approvalStates.has(record.approvalState as P34DynamicGovernanceInput["approvalState"]) ||
      !deploymentStates.has(record.deploymentState as P34DynamicGovernanceInput["deploymentState"]) ||
      typeof record.evidenceFresh !== "boolean" || typeof record.modelQualified !== "boolean" ||
      typeof record.toolQualified !== "boolean") {
    reasonCodes.push("DYNAMIC_GOVERNANCE_ENUM_OR_STATE_INVALID");
  }
  if (record.riskTier === "prohibited") reasonCodes.push("PROHIBITED_RISK");
  if (record.dataClassification === "phi-restricted") reasonCodes.push("LIVE_PHI_DISABLED");
  if (record.deploymentState === "production") reasonCodes.push("PRODUCTION_AUTHORIZATION_REQUIRED");
  if (record.autonomyTier === "A3") reasonCodes.push("A3_UNAVAILABLE_IN_CURRENT_CANDIDATE");
  if (record.evidenceFresh === false) reasonCodes.push("EVIDENCE_STALE_OR_MISSING");
  if (record.modelQualified === false) reasonCodes.push("MODEL_QUALIFICATION_REQUIRED");
  if (record.toolQualified === false) reasonCodes.push("TOOL_QUALIFICATION_REQUIRED");
  if (record.approvalState === "missing" || record.approvalState === "synthetic-only") {
    reasonCodes.push("TRUSTED_APPROVAL_REQUIRED");
  }
  if (record.approvalState === "expired") reasonCodes.push("APPROVAL_EXPIRED");
  if (record.approvalState === "replayed") reasonCodes.push("APPROVAL_REPLAY_DETECTED");
  if (record.autonomyTier === "A2") reasonCodes.push("A2_NAMED_REVIEW_REQUIRED");
  if (record.riskTier === "high") reasonCodes.push("HIGH_RISK_SPECIALIST_REVIEW_REQUIRED");
  if (record.externalSideEffectClass !== "none" && record.externalSideEffectClass !== "reversible-synthetic-internal") {
    reasonCodes.push("CONSEQUENTIAL_SIDE_EFFECT_PROHIBITED");
  }
  if ((record.autonomyTier === "A0" || record.autonomyTier === "A1") && record.externalSideEffectClass !== "none") {
    reasonCodes.push("A0_A1_CANNOT_MUTATE");
  }

  const normalizedReasons = canonical(reasonCodes);
  const prohibitedReasons = new Set([
    "DYNAMIC_GOVERNANCE_INPUT_INVALID",
    "DYNAMIC_GOVERNANCE_ENUM_OR_STATE_INVALID",
    "PROHIBITED_RISK",
    "LIVE_PHI_DISABLED",
    "PRODUCTION_AUTHORIZATION_REQUIRED",
    "A3_UNAVAILABLE_IN_CURRENT_CANDIDATE",
    "APPROVAL_REPLAY_DETECTED",
    "CONSEQUENTIAL_SIDE_EFFECT_PROHIBITED",
    "A0_A1_CANNOT_MUTATE"
  ]);
  const specialistReasons = new Set([
    "MODEL_QUALIFICATION_REQUIRED",
    "TOOL_QUALIFICATION_REQUIRED",
    "HIGH_RISK_SPECIALIST_REVIEW_REQUIRED"
  ]);
  const operatorReasons = new Set([
    "EVIDENCE_STALE_OR_MISSING",
    "TRUSTED_APPROVAL_REQUIRED",
    "APPROVAL_EXPIRED"
  ]);
  const status: P34DynamicGovernanceStatus = normalizedReasons.some((reason) => prohibitedReasons.has(reason))
    ? "PROHIBITED"
    : normalizedReasons.some((reason) => specialistReasons.has(reason))
      ? "TARGETED_SPECIALIST_REVIEW_REQUIRED"
      : normalizedReasons.some((reason) => operatorReasons.has(reason))
        ? "OPERATOR_ACTION_REQUIRED"
        : normalizedReasons.includes("A2_NAMED_REVIEW_REQUIRED")
          ? "PERMITTED_WITH_REVIEW"
          : "PERMITTED";
  const payload = {
    actionId: isBoundedIdentifier(record.actionId) ? record.actionId : "invalid",
    actorIdentityHash: isSha256(record.actorIdentityHash) ? record.actorIdentityHash : "invalid",
    tenantIdHash: createClinicalEvidenceHash(isBoundedIdentifier(record.tenantId) ? record.tenantId : "invalid"),
    environmentId: isBoundedIdentifier(record.environmentId) ? record.environmentId : "invalid",
    autonomyTier: autonomyClasses.has(record.autonomyTier as AutonomyTier) ? record.autonomyTier : "invalid",
    actionMaturity: capabilityMaturities.has(record.actionMaturity as P34CapabilityMaturity) ? record.actionMaturity : "invalid",
    evidenceFresh: record.evidenceFresh === true,
    dataClassification: dataClassifications.has(record.dataClassification as P34DataClassification) ? record.dataClassification : "invalid",
    jurisdiction: isBoundedIdentifier(record.jurisdiction) ? record.jurisdiction : "invalid",
    modelQualified: record.modelQualified === true,
    toolQualified: record.toolQualified === true,
    approvalState: approvalStates.has(record.approvalState as P34DynamicGovernanceInput["approvalState"]) ? record.approvalState : "invalid",
    deploymentState: deploymentStates.has(record.deploymentState as P34DynamicGovernanceInput["deploymentState"]) ? record.deploymentState : "invalid",
    riskTier: riskTiers.has(record.riskTier as P34RiskTier) ? record.riskTier : "invalid",
    externalSideEffectClass: externalSideEffectClasses.has(record.externalSideEffectClass as P34ExternalSideEffectClass)
      ? record.externalSideEffectClass
      : "invalid",
    status,
    reasonCodes: normalizedReasons
  };
  return {
    status,
    reasonCodes: normalizedReasons,
    humanReviewRequired: status !== "PERMITTED",
    executionAuthorized: false,
    clinicalAuthorityGranted: false,
    productionAuthorityGranted: false,
    decisionHash: createClinicalEvidenceHash({ type: "p34-dynamic-governance-decision", payload })
  };
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
  for (const value of [declaration.actionId, declaration.resourceId, declaration.tenantId, declaration.policyVersion]) {
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
    clock: record.clock as TrustedClock,
    verificationContext: record.evidenceVerificationContext as P34EvidenceVerificationContext
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
      resourceId: isBoundedIdentifier(declaration.resourceId) ? declaration.resourceId : "invalid",
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
    evaluatedAt: declarationWindow.evaluatedAt,
    decisionHash: createClinicalEvidenceHash({ type: "p34-governed-action-decision", payload })
  };
}

export function revalidateP34GovernedActionImmediatelyBeforeEffect(input: {
  immediateRequest: P34GovernedActionRequest;
  expectedCandidateFingerprint: string;
  expectedEnvironmentId: string;
  expectedTenantId: string;
  expectedActionId: string;
  expectedResourceId: string;
  expectedAutonomyClass: AutonomyTier;
  expectedMaturity: P34CapabilityMaturity;
  expectedInitialDecisionHash: string;
  initialDecision: P34GovernedActionDecision;
  atomicApprovalReceipt?: {
    receiptHash: string;
    structurallyVerified: boolean;
    approvalConsumed: boolean;
    executionAuthorized: boolean;
  } | null;
  clock: TrustedClock;
}) {
  const record = (input && typeof input === "object" ? input : {}) as Partial<typeof input>;
  const immediateRequest = (record.immediateRequest && typeof record.immediateRequest === "object"
    ? record.immediateRequest
    : {}) as P34GovernedActionRequest;
  const declaration = (immediateRequest.declaration && typeof immediateRequest.declaration === "object"
    ? immediateRequest.declaration
    : {}) as P34GovernedActionDeclaration;
  const initialDecision = (record.initialDecision && typeof record.initialDecision === "object"
    ? record.initialDecision
    : {}) as P34GovernedActionDecision;
  const immediateDecision = evaluateP34GovernedAction(immediateRequest);
  const reasonCodes: string[] = [];
  if (record !== input || immediateRequest !== record.immediateRequest ||
      declaration !== immediateRequest.declaration || initialDecision !== record.initialDecision) {
    reasonCodes.push("RUNTIME_REVALIDATION_INPUT_INVALID");
  }
  if (!isSha256(record.expectedCandidateFingerprint) || !isSha256(record.expectedInitialDecisionHash)) {
    reasonCodes.push("RUNTIME_REVALIDATION_FINGERPRINT_INVALID");
  }
  for (const value of [record.expectedEnvironmentId, record.expectedTenantId, record.expectedActionId, record.expectedResourceId]) {
    if (!isBoundedIdentifier(value)) reasonCodes.push("RUNTIME_REVALIDATION_BINDING_INVALID");
  }
  if (declaration.candidateFingerprint !== record.expectedCandidateFingerprint) reasonCodes.push("TOCTOU_CANDIDATE_CHANGED");
  if (immediateRequest.environmentId !== record.expectedEnvironmentId) reasonCodes.push("TOCTOU_ENVIRONMENT_CHANGED");
  if (declaration.tenantId !== record.expectedTenantId) reasonCodes.push("TOCTOU_TENANT_CHANGED");
  if (declaration.actionId !== record.expectedActionId) reasonCodes.push("TOCTOU_ACTION_CHANGED");
  if (declaration.resourceId !== record.expectedResourceId) reasonCodes.push("TOCTOU_RESOURCE_CHANGED");
  if (declaration.autonomyClass !== record.expectedAutonomyClass) reasonCodes.push("TOCTOU_AUTONOMY_CHANGED");
  if (declaration.executionMaturity !== record.expectedMaturity) reasonCodes.push("TOCTOU_MATURITY_CHANGED");
  if (initialDecision.decisionHash !== record.expectedInitialDecisionHash) reasonCodes.push("TOCTOU_INITIAL_DECISION_CHANGED");
  if (initialDecision.decision !== "ALLOW") reasonCodes.push("INITIAL_PREFLIGHT_NOT_PERMITTED");
  if (immediateDecision.decision !== "ALLOW") reasonCodes.push("IMMEDIATE_PREFLIGHT_NOT_PERMITTED");
  if (declaration.externalSideEffectClass !== "none") {
    reasonCodes.push("CURRENT_CANDIDATE_WRITE_CEILING");
    const approval = record.atomicApprovalReceipt;
    if (!approval || !isSha256(approval.receiptHash) || approval.structurallyVerified !== true ||
        approval.approvalConsumed !== true || approval.executionAuthorized !== true) {
      reasonCodes.push("TRUSTED_ATOMIC_APPROVAL_REQUIRED");
    }
  }
  let evaluatedAt = new Date(0).toISOString();
  try {
    const now = record.clock?.now();
    if (!(now instanceof Date) || !Number.isFinite(now.getTime())) throw new Error("invalid clock");
    evaluatedAt = now.toISOString();
  } catch {
    reasonCodes.push("RUNTIME_REVALIDATION_CLOCK_INVALID");
  }
  const normalizedReasons = canonical(reasonCodes);
  const preflightValid = normalizedReasons.length === 0;
  const payload = {
    candidateFingerprint: isSha256(declaration.candidateFingerprint) ? declaration.candidateFingerprint : "invalid",
    tenantIdHash: createClinicalEvidenceHash(isBoundedIdentifier(declaration.tenantId) ? declaration.tenantId : "invalid"),
    actionId: isBoundedIdentifier(declaration.actionId) ? declaration.actionId : "invalid",
    resourceId: isBoundedIdentifier(declaration.resourceId) ? declaration.resourceId : "invalid",
    environmentId: isBoundedIdentifier(immediateRequest.environmentId) ? immediateRequest.environmentId : "invalid",
    expectedEnvironmentId: isBoundedIdentifier(record.expectedEnvironmentId) ? record.expectedEnvironmentId : "invalid",
    autonomyClass: autonomyClasses.has(declaration.autonomyClass) ? declaration.autonomyClass : "invalid",
    executionMaturity: capabilityMaturities.has(declaration.executionMaturity) ? declaration.executionMaturity : "invalid",
    initialDecisionHash: isSha256(initialDecision.decisionHash) ? initialDecision.decisionHash : "invalid",
    immediateDecisionHash: isSha256(immediateDecision.decisionHash) ? immediateDecision.decisionHash : "invalid",
    evaluatedAt,
    preflightValid,
    reasonCodes: normalizedReasons
  };
  return {
    decision: preflightValid ? "ALLOW" as const : "BLOCK" as const,
    preflightValid,
    executionAuthorized: false as const,
    externalSideEffectAuthorized: false as const,
    reasonCodes: normalizedReasons,
    evaluatedAt,
    decisionHash: createClinicalEvidenceHash({ type: "p34-immediate-runtime-revalidation", payload })
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
    record.autonomyEscalation, record.privilegeDrift, record.maturityDrift, record.evidenceExpired,
    record.modelSubstitution, record.policyMutation, record.routeDivergence,
    record.tenantLeakageDetected, record.approvalReplayDetected, record.egressFirewallTriggered,
    record.anomalousToolEscalation, record.unauthorizedDistributionAttempt
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
    { active: record.autonomyEscalation === true, name: "AUTONOMY_ESCALATION", severity: "SEV1", containment: "HALTED" },
    { active: record.anomalousToolEscalation === true, name: "ANOMALOUS_TOOL_ESCALATION", severity: "SEV1", containment: "HALTED" },
    { active: record.egressFirewallTriggered === true, name: "EGRESS_FIREWALL_TRIGGER", severity: "SEV1", containment: "HALTED" },
    { active: record.privilegeDrift === true, name: "PRIVILEGE_DRIFT", severity: "SEV1", containment: "HALTED" },
    { active: record.unauthorizedDistributionAttempt === true, name: "UNAUTHORIZED_DISTRIBUTION", severity: "SEV1", containment: "HALTED" },
    { active: record.policyMutation === true, name: "POLICY_DRIFT", severity: "SEV1", containment: "READ_ONLY" },
    { active: record.routeDivergence === true, name: "ROUTE_DIVERGENCE", severity: "SEV1", containment: "READ_ONLY" },
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
        autonomyEscalation: record.autonomyEscalation === true,
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
        routeDivergence: record.routeDivergence === true,
        tenantLeakageDetected: record.tenantLeakageDetected === true,
        approvalReplayDetected: record.approvalReplayDetected === true,
        egressFirewallTriggered: record.egressFirewallTriggered === true,
        anomalousToolEscalation: record.anomalousToolEscalation === true,
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

export const p34CausalTraceStages = [
  "request",
  "context",
  "policy",
  "model",
  "agent",
  "tool",
  "evidence",
  "response",
  "evaluation",
  "correction",
  "accepted-result"
] as const;

export type P34CausalTraceStage = typeof p34CausalTraceStages[number];

export function createP34CausalTraceGraph(input: {
  traceId: string;
  tenantId: string;
  artifacts: Record<P34CausalTraceStage, string>;
  accepted: boolean;
}) {
  const record = (input && typeof input === "object" ? input : {}) as Partial<typeof input>;
  if (!isBoundedIdentifier(record.traceId) || !isBoundedIdentifier(record.tenantId) ||
      !record.artifacts || typeof record.artifacts !== "object" || typeof record.accepted !== "boolean") {
    throw new Error("Causal trace graph requires bounded identifiers, artifacts, and acceptance state");
  }
  const artifacts = record.artifacts as Partial<Record<P34CausalTraceStage, string>>;
  for (const stage of p34CausalTraceStages) {
    if (!isSha256(artifacts[stage])) throw new Error(`Causal trace stage ${stage} requires a SHA-256 artifact`);
  }
  let parentReference: string | null = null;
  const nodes = p34CausalTraceStages.map((stage) => {
    const payload = {
      traceId: record.traceId as string,
      tenantIdHash: createClinicalEvidenceHash(record.tenantId as string),
      stage,
      artifactHash: artifacts[stage] as string,
      parentReference
    };
    const immutableReference = createClinicalEvidenceHash({ type: "p34-causal-trace-node", payload });
    const node = { ...payload, immutableReference };
    parentReference = immutableReference;
    return node;
  });
  const payload = {
    traceId: record.traceId as string,
    tenantIdHash: createClinicalEvidenceHash(record.tenantId as string),
    accepted: record.accepted as boolean,
    nodes
  };
  return {
    ...payload,
    containsRawPhi: false as const,
    hiddenChainOfThoughtStored: false as const,
    graphHash: createClinicalEvidenceHash({ type: "p34-causal-trace-graph", payload })
  };
}

export function explainP34AcceptedOutput(graph: ReturnType<typeof createP34CausalTraceGraph>) {
  const nodeByStage = new Map(graph.nodes.map((node) => [node.stage, node]));
  const acceptedNode = nodeByStage.get("accepted-result");
  const evaluationNode = nodeByStage.get("evaluation");
  const policyNode = nodeByStage.get("policy");
  const evidenceNode = nodeByStage.get("evidence");
  const explainable = graph.accepted && Boolean(acceptedNode && evaluationNode && policyNode && evidenceNode);
  return {
    explainable,
    accepted: graph.accepted,
    reasonCodes: explainable
      ? ["POLICY_EVALUATED", "EVIDENCE_LINKED", "EVALUATION_ACCEPTED", "RESULT_IMMUTABLY_LINKED"]
      : ["OUTPUT_NOT_ACCEPTED_OR_TRACE_INCOMPLETE"],
    references: explainable
      ? {
        policy: policyNode?.immutableReference ?? null,
        evidence: evidenceNode?.immutableReference ?? null,
        evaluation: evaluationNode?.immutableReference ?? null,
        acceptedResult: acceptedNode?.immutableReference ?? null
      }
      : null,
    graphHash: graph.graphHash,
    explanationHash: createClinicalEvidenceHash({
      type: "p34-causal-trace-acceptance-explanation",
      graphHash: graph.graphHash,
      accepted: graph.accepted,
      explainable
    })
  };
}

export function compareP34TraceEvaluations(
  left: ReturnType<typeof createP34CausalTraceGraph>,
  right: ReturnType<typeof createP34CausalTraceGraph>
) {
  const leftByStage = new Map(left.nodes.map((node) => [node.stage, node.artifactHash]));
  const rightByStage = new Map(right.nodes.map((node) => [node.stage, node.artifactHash]));
  const changedStages = p34CausalTraceStages.filter((stage) => leftByStage.get(stage) !== rightByStage.get(stage));
  return {
    changed: left.graphHash !== right.graphHash,
    changedStages,
    acceptanceChanged: left.accepted !== right.accepted,
    leftGraphHash: left.graphHash,
    rightGraphHash: right.graphHash,
    comparisonHash: createClinicalEvidenceHash({
      type: "p34-causal-trace-comparison",
      leftGraphHash: left.graphHash,
      rightGraphHash: right.graphHash,
      changedStages,
      acceptanceChanged: left.accepted !== right.accepted
    })
  };
}

export function createP34ControlPlane2Summary(env: NodeJS.ProcessEnv = process.env) {
  const clock = new FixedTrustedClock("2026-08-21T04:00:00.000Z");
  const killSwitchMode = resolveP34KillSwitchMode(env);
  const candidateFingerprint = createClinicalEvidenceHash("p34-control-plane-2-synthetic-candidate");
  const evidenceVerifierId = "p34-control-plane-synthetic-evidence-verifier";
  const evidenceIssuerIdentityHash = createClinicalEvidenceHash("p34-control-plane-synthetic-evidence-issuer");
  const evidence: P34EvidenceEnvelope[] = ["candidate-manifest", "validation-packet", "security-evidence"].map(
    (evidenceType, index) => {
      const unsigned: Omit<P34EvidenceEnvelope, "signature"> = {
        schemaVersion: "scrimed-p34-evidence-envelope-v2",
        evidenceId: `p34-control-plane-evidence-${index + 1}`,
        evidenceType: evidenceType as P34EvidenceType,
        sourceCandidate: candidateFingerprint,
        validationVersion: p34ControlPlane2Version,
        generatedAt: "2026-08-21T03:30:00.000Z",
        expiresAt: "2026-08-22T05:11:03.000Z",
        evidenceHash: createClinicalEvidenceHash(`p34-control-plane-evidence-${evidenceType}`),
        issuerIdentityHash: evidenceIssuerIdentityHash,
        trustClass: "synthetic-test-only"
      };
      return {
        ...unsigned,
        signature: createSyntheticP34EvidenceSignature(unsigned, evidenceVerifierId)
      };
    }
  );
  const evidenceVerificationContext: P34EvidenceVerificationContext = {
    usage: "synthetic-test-only",
    expectedValidationVersion: p34ControlPlane2Version,
    expectedIssuerIdentityHash: evidenceIssuerIdentityHash,
    verifier: createSyntheticP34EvidenceVerifier(evidenceVerifierId)
  };
  const declaration: P34GovernedActionDeclaration = {
    schemaVersion: "scrimed-p34-governed-action-v2",
    actionId: "inspect-synthetic-governance-evidence",
    resourceId: "synthetic-governance-evidence",
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
  const governedRequest: P34GovernedActionRequest = {
    declaration,
    environmentId: "local-synthetic",
    jurisdiction: "local",
    requestedToolIds: ["evidence-reader"],
    requestedModelIds: ["deterministic-policy-engine-v1"],
    evidence,
    evidenceVerificationContext,
    killSwitchMode,
    clock
  };
  const action = evaluateP34GovernedAction(governedRequest);
  const dynamicGovernance = evaluateP34DynamicGovernance({
    actionId: declaration.actionId,
    actorIdentityHash: declaration.actorIdHash,
    tenantId: declaration.tenantId,
    environmentId: "local-synthetic",
    autonomyTier: declaration.autonomyClass,
    actionMaturity: declaration.executionMaturity,
    evidenceFresh: action.evidenceFresh,
    dataClassification: declaration.dataClassification,
    jurisdiction: "local",
    modelQualified: true,
    toolQualified: true,
    approvalState: "not-required",
    deploymentState: "local-synthetic",
    riskTier: declaration.riskTier,
    externalSideEffectClass: declaration.externalSideEffectClass
  });
  const runtimeRevalidation = revalidateP34GovernedActionImmediatelyBeforeEffect({
    immediateRequest: governedRequest,
    expectedCandidateFingerprint: declaration.candidateFingerprint,
    expectedEnvironmentId: governedRequest.environmentId,
    expectedTenantId: declaration.tenantId,
    expectedActionId: declaration.actionId,
    expectedResourceId: declaration.resourceId,
    expectedAutonomyClass: declaration.autonomyClass,
    expectedMaturity: declaration.executionMaturity,
    expectedInitialDecisionHash: action.decisionHash,
    initialDecision: action,
    atomicApprovalReceipt: null,
    clock
  });
  const oversightBaseInput: P34OversightSignalInput = {
    autonomyEscalation: false,
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
    routeDivergence: false,
    unexpectedNetworkTargets: [],
    tenantLeakageDetected: false,
    approvalReplayDetected: false,
    egressFirewallTriggered: false,
    anomalousToolEscalation: false,
    unauthorizedDistributionAttempt: false
  };
  const oversight = evaluateP34OversightSentinel(oversightBaseInput);
  const oversightDetectorCases: Array<{
    signal: string;
    input: Partial<P34OversightSignalInput>;
  }> = [
    { signal: "AUTONOMY_ESCALATION", input: { autonomyEscalation: true } },
    { signal: "PRIVILEGE_DRIFT", input: { privilegeDrift: true } },
    { signal: "MATURITY_DRIFT", input: { maturityDrift: true } },
    { signal: "EVIDENCE_EXPIRED", input: { evidenceExpired: true } },
    { signal: "RETRY_BUDGET_EXCEEDED", input: { retryCount: 3 } },
    { signal: "DELEGATION_DEPTH_EXCEEDED", input: { delegationDepth: 4 } },
    { signal: "BUDGET_EXCEEDED", input: { budgetUsedRatio: 1.01 } },
    { signal: "MODEL_SUBSTITUTION", input: { modelSubstitution: true } },
    { signal: "POLICY_DRIFT", input: { policyMutation: true } },
    { signal: "ROUTE_DIVERGENCE", input: { routeDivergence: true } },
    { signal: "UNEXPECTED_NETWORK_TARGET", input: { unexpectedNetworkTargets: ["unexpected.example"] } },
    { signal: "TENANT_LEAKAGE", input: { tenantLeakageDetected: true } },
    { signal: "APPROVAL_REPLAY", input: { approvalReplayDetected: true } },
    { signal: "EGRESS_FIREWALL_TRIGGER", input: { egressFirewallTriggered: true } },
    { signal: "ANOMALOUS_TOOL_ESCALATION", input: { anomalousToolEscalation: true } },
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
  const causalArtifacts = Object.fromEntries(p34CausalTraceStages.map((stage) => [
    stage,
    createClinicalEvidenceHash(`p34-control-plane-causal-${stage}`)
  ])) as Record<P34CausalTraceStage, string>;
  const causalTrace = createP34CausalTraceGraph({
    traceId: "trace-p34-control-plane-causal",
    tenantId: declaration.tenantId,
    artifacts: causalArtifacts,
    accepted: true
  });
  const acceptedOutputExplanation = explainP34AcceptedOutput(causalTrace);
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
    dynamicGovernance,
    runtimeRevalidation,
    oversight,
    oversightDetectorCoverage,
    release,
    evidence,
    trace,
    causalTrace,
    acceptedOutputExplanation,
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
