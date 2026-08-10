import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";
import type { PolicyDecision } from "./scrimed-work/p32Contracts";

export const scrimedP32RcmVoiceVersion = "scrimed-p32-rcm-voice-v1-2026-07-20";

export const scrimedP32RcmVoiceBoundary =
  "The payer voice worker is a synthetic, feature-flagged state machine for low-risk administrative status retrieval. It does not place live calls, retain raw audio, submit payer transactions, negotiate, make clinical statements, or write to a payer or EHR.";

export type RcmVoiceUseCase =
  | "eligibility-benefit-status"
  | "prior-authorization-status"
  | "claim-status"
  | "credentialing-status"
  | "appeal"
  | "medical-necessity"
  | "coding-change"
  | "patient-collection"
  | "settlement-negotiation"
  | "payer-submission";

export type RcmVoiceState =
  | "work-item-received"
  | "authorization-check"
  | "identity-check"
  | "script-check"
  | "simulated-contact"
  | "outcome-structured"
  | "consistency-validation"
  | "approval-wait"
  | "human-exception-queue"
  | "completed-synthetic"
  | "abandoned"
  | "blocked";

export type PayerVoiceRoute = {
  routeId: string;
  payerId: string;
  permittedUseCases: RcmVoiceUseCase[];
  approvedScriptIds: string[];
  identityFactorsRequired: number;
  recordingPolicy: "disabled" | "consent-required";
  maximumAttempts: number;
  responseTimeoutMs: number;
  liveEndpointConfigured: false;
};

export type RcmVoiceWorkItem = {
  workItemId: string;
  tenantId: string;
  actor: { actorId: string; role: string; authenticated: boolean };
  payerId: string;
  useCase: RcmVoiceUseCase;
  scriptId: string;
  identityFactorsVerified: number;
  authorizationVerified: boolean;
  consentConfigurationVerified: boolean;
  syntheticOnly: true;
  noPhiConfirmed: true;
  transcript: string;
  structuredOutcome: {
    statusCode: string;
    statusLabel: string;
    referenceHash: string;
    confidence: number;
    ambiguous: boolean;
    contradictory: boolean;
  };
  attempt: number;
  proposedWritebackRequested: boolean;
  idempotencyKey: string;
  correlationId: string;
};

export type RcmVoiceEvaluation = {
  workItemId: string;
  decision: PolicyDecision;
  states: RcmVoiceState[];
  routeId: string | null;
  reasonCodes: string[];
  transcriptHash: string;
  rawTranscriptStored: false;
  rawAudioStored: false;
  outcomeHash: string | null;
  proposedWriteback: null | {
    idempotencyKey: string;
    statusCode: string;
    outcomeHash: string;
    humanApprovalRequired: true;
  };
  writebackExecuted: false;
  externalCallExecuted: false;
  humanQueueRequired: boolean;
  retryAllowed: boolean;
  policyVersion: typeof scrimedP32RcmVoiceVersion;
  correlationId: string;
  auditHash: string;
};

const permittedUseCases: RcmVoiceUseCase[] = [
  "eligibility-benefit-status",
  "prior-authorization-status",
  "claim-status",
  "credentialing-status"
];

const sensitivePattern = /\b(?:\d{3}-\d{2}-\d{4}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|bearer\s+[A-Za-z0-9._-]+|(?:token|secret|password)\s*[:=])\b/i;

export function isP32RcmVoiceEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.SCRIMED_P32_RCM_VOICE_ENABLED === "true";
}

export const syntheticPayerVoiceRoutes: PayerVoiceRoute[] = [
  {
    routeId: "synthetic-payer-status-route",
    payerId: "synthetic-payer",
    permittedUseCases,
    approvedScriptIds: ["status-retrieval-script-v1"],
    identityFactorsRequired: 2,
    recordingPolicy: "consent-required",
    maximumAttempts: 2,
    responseTimeoutMs: 60_000,
    liveEndpointConfigured: false
  }
];

export function evaluateRcmVoiceWorkItem(input: {
  workItem: RcmVoiceWorkItem;
  routes?: PayerVoiceRoute[];
  env?: NodeJS.ProcessEnv;
}): RcmVoiceEvaluation {
  const { workItem } = input;
  if (!workItem.syntheticOnly || !workItem.noPhiConfirmed || sensitivePattern.test(workItem.transcript)) {
    throw new Error("RCM voice evaluation accepts synthetic, no-PHI transcript fixtures only");
  }
  const states: RcmVoiceState[] = ["work-item-received", "authorization-check"];
  const reasonCodes: string[] = [];
  const featureEnabled = isP32RcmVoiceEnabled(input.env);
  const route = (input.routes ?? syntheticPayerVoiceRoutes).find((candidate) => candidate.payerId === workItem.payerId);

  if (!featureEnabled) reasonCodes.push("FEATURE_FLAG_DISABLED");
  if (!workItem.actor.authenticated || !workItem.authorizationVerified) reasonCodes.push("AUTHORIZATION_REQUIRED");
  states.push("identity-check");
  if (!route) reasonCodes.push("NO_APPROVED_PAYER_ROUTE");
  if (!permittedUseCases.includes(workItem.useCase)) reasonCodes.push("PROHIBITED_RCM_VOICE_ACTION");
  if (route && !route.permittedUseCases.includes(workItem.useCase)) reasonCodes.push("USE_CASE_OUTSIDE_PAYER_ROUTE");
  if (route && workItem.identityFactorsVerified < route.identityFactorsRequired) reasonCodes.push("IDENTITY_VERIFICATION_INSUFFICIENT");
  states.push("script-check");
  if (route && !route.approvedScriptIds.includes(workItem.scriptId)) reasonCodes.push("SCRIPT_NOT_APPROVED");
  if (route?.recordingPolicy === "consent-required" && !workItem.consentConfigurationVerified) reasonCodes.push("CONSENT_CONFIGURATION_REQUIRED");
  if (!Number.isFinite(workItem.structuredOutcome.confidence) || workItem.structuredOutcome.confidence < 0 || workItem.structuredOutcome.confidence > 1) {
    reasonCodes.push("INVALID_OUTCOME_CONFIDENCE");
  }
  if (route && workItem.attempt > route.maximumAttempts) reasonCodes.push("RETRY_BUDGET_EXHAUSTED");

  const preflightBlocked = reasonCodes.some((code) => [
    "FEATURE_FLAG_DISABLED",
    "AUTHORIZATION_REQUIRED",
    "NO_APPROVED_PAYER_ROUTE",
    "PROHIBITED_RCM_VOICE_ACTION",
    "USE_CASE_OUTSIDE_PAYER_ROUTE",
    "IDENTITY_VERIFICATION_INSUFFICIENT",
    "SCRIPT_NOT_APPROVED",
    "CONSENT_CONFIGURATION_REQUIRED",
    "INVALID_OUTCOME_CONFIDENCE"
  ].includes(code));
  const exhausted = reasonCodes.includes("RETRY_BUDGET_EXHAUSTED");

  if (preflightBlocked) states.push("blocked");
  else if (exhausted) states.push("abandoned", "human-exception-queue");
  else {
    states.push("simulated-contact", "outcome-structured", "consistency-validation");
    if (
      workItem.structuredOutcome.ambiguous ||
      workItem.structuredOutcome.contradictory ||
      workItem.structuredOutcome.confidence < 0.9
    ) {
      reasonCodes.push("AMBIGUOUS_OR_UNVERIFIED_OUTCOME");
      states.push("human-exception-queue");
    } else if (workItem.proposedWritebackRequested) {
      reasonCodes.push("PROPOSED_WRITEBACK_REQUIRES_HUMAN_APPROVAL");
      states.push("approval-wait");
    } else {
      states.push("completed-synthetic");
    }
  }

  const outcomeEligible = !preflightBlocked && !exhausted && !reasonCodes.includes("AMBIGUOUS_OR_UNVERIFIED_OUTCOME");
  const outcomeHash = outcomeEligible ? createClinicalEvidenceHash({
    workItemId: workItem.workItemId,
    statusCode: workItem.structuredOutcome.statusCode,
    statusLabel: workItem.structuredOutcome.statusLabel,
    referenceHash: workItem.structuredOutcome.referenceHash,
    confidence: workItem.structuredOutcome.confidence
  }) : null;
  const proposedWriteback = outcomeHash && workItem.proposedWritebackRequested ? {
    idempotencyKey: workItem.idempotencyKey,
    statusCode: workItem.structuredOutcome.statusCode,
    outcomeHash,
    humanApprovalRequired: true as const
  } : null;
  const decision: PolicyDecision = preflightBlocked
    ? "BLOCK"
    : exhausted || reasonCodes.includes("AMBIGUOUS_OR_UNVERIFIED_OUTCOME") || proposedWriteback
      ? "REQUIRE_HUMAN"
      : "ALLOW";
  const withoutHash = {
    workItemId: workItem.workItemId,
    decision,
    states,
    routeId: route?.routeId ?? null,
    reasonCodes: reasonCodes.length ? reasonCodes : ["SYNTHETIC_STATUS_RETRIEVAL_VALIDATED"],
    transcriptHash: createClinicalEvidenceHash({ transcript: workItem.transcript }),
    rawTranscriptStored: false as const,
    rawAudioStored: false as const,
    outcomeHash,
    proposedWriteback,
    writebackExecuted: false as const,
    externalCallExecuted: false as const,
    humanQueueRequired: states.includes("human-exception-queue") || states.includes("approval-wait"),
    retryAllowed: Boolean(route) && workItem.attempt < (route?.maximumAttempts ?? 0) && !preflightBlocked,
    policyVersion: scrimedP32RcmVoiceVersion as typeof scrimedP32RcmVoiceVersion,
    correlationId: workItem.correlationId
  };
  return { ...withoutHash, auditHash: createClinicalEvidenceHash({ workItem: { ...workItem, transcript: withoutHash.transcriptHash }, result: withoutHash }) };
}
