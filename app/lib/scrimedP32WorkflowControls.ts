import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";
import type {
  AttentionEvent,
  ConnectorPolicy,
  ICPProfile,
  IntentEnvelope,
  OutcomeEvent,
  PolicyDecision,
  TrialCandidateReview
} from "./scrimed-work/p32Contracts";

export const scrimedP32WorkflowControlsVersion = "scrimed-p32-workflow-controls-v1-2026-07-20";

export const scrimedP32WorkflowBoundary =
  "SCRIMED p.32 workflow controls are synthetic, public-material, or metadata-only. They do not authorize autonomous clinical action, trial enrollment, randomization, patient outreach, payer submission, EHR writeback, connector activation, or mass outreach.";

export type StreamedContentBlock = {
  type?: unknown;
  text?: unknown;
  content?: unknown;
};

export function normalizeModelMessageContent(content: unknown) {
  if (typeof content === "string") {
    return { text: content.trim(), malformedBlockCount: 0, valid: content.trim().length > 0 };
  }
  if (!Array.isArray(content)) return { text: "", malformedBlockCount: 1, valid: false };

  let malformedBlockCount = 0;
  const parts = content.flatMap((block) => {
    if (!block || typeof block !== "object") {
      malformedBlockCount += 1;
      return [];
    }
    const candidate = block as StreamedContentBlock;
    if (candidate.type !== undefined && candidate.type !== "text" && candidate.type !== "output_text") {
      return [];
    }
    const value = typeof candidate.text === "string"
      ? candidate.text
      : typeof candidate.content === "string"
        ? candidate.content
        : null;
    if (value === null) {
      malformedBlockCount += 1;
      return [];
    }
    return value.trim() ? [value.trim()] : [];
  });
  return { text: parts.join("\n"), malformedBlockCount, valid: parts.length > 0 && malformedBlockCount === 0 };
}

export type NormalizedModelToolCall = {
  callId: string;
  toolName: string;
  arguments: Record<string, unknown>;
};

export type NormalizedModelCitation = {
  sourceId: string;
  locator: string;
};

export type NormalizedModelExecutionOutput = {
  text: string;
  toolCalls: NormalizedModelToolCall[];
  citations: NormalizedModelCitation[];
  structuredResponse: Record<string, unknown> | null;
  malformedBlockCount: number;
  valid: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function normalizeModelExecutionOutput(content: unknown): NormalizedModelExecutionOutput {
  if (typeof content === "string") {
    const text = content.trim();
    return { text, toolCalls: [], citations: [], structuredResponse: null, malformedBlockCount: 0, valid: text.length > 0 };
  }

  const blocks = Array.isArray(content)
    ? content
    : isRecord(content)
      ? [
          ...(Array.isArray(content.blocks)
            ? content.blocks
            : Array.isArray(content.content)
              ? content.content
              : "text" in content || "type" in content
                ? [content]
                : []),
          ...(Array.isArray(content.toolCalls)
            ? content.toolCalls.map((toolCall) => isRecord(toolCall) ? { type: "tool_call", ...toolCall } : toolCall)
            : []),
          ...(Array.isArray(content.citations)
            ? content.citations.map((citation) => isRecord(citation) ? { type: "citation", ...citation } : citation)
            : []),
          ...(isRecord(content.structuredResponse)
            ? [{ type: "structured", structuredResponse: content.structuredResponse }]
            : [])
        ]
      : [];
  if (!blocks.length) {
    return { text: "", toolCalls: [], citations: [], structuredResponse: null, malformedBlockCount: 1, valid: false };
  }

  const textParts: string[] = [];
  const toolCalls: NormalizedModelToolCall[] = [];
  const citations: NormalizedModelCitation[] = [];
  let structuredResponse: Record<string, unknown> | null = null;
  let malformedBlockCount = 0;

  for (const rawBlock of blocks) {
    if (!isRecord(rawBlock)) {
      malformedBlockCount += 1;
      continue;
    }
    const type = typeof rawBlock.type === "string"
      ? rawBlock.type
      : "text" in rawBlock || "content" in rawBlock
        ? "text"
        : "structuredResponse" in rawBlock || "structured" in rawBlock
          ? "structured"
          : "unknown";

    if (type === "text" || type === "output_text") {
      const value = typeof rawBlock.text === "string"
        ? rawBlock.text
        : typeof rawBlock.content === "string"
          ? rawBlock.content
          : null;
      if (value?.trim()) textParts.push(value.trim());
      else malformedBlockCount += 1;
      continue;
    }

    if (type === "tool_call" || type === "tool-call") {
      const callId = typeof rawBlock.callId === "string"
        ? rawBlock.callId
        : typeof rawBlock.id === "string"
          ? rawBlock.id
          : null;
      const toolName = typeof rawBlock.toolName === "string"
        ? rawBlock.toolName
        : typeof rawBlock.name === "string"
          ? rawBlock.name
          : null;
      const args = isRecord(rawBlock.arguments)
        ? rawBlock.arguments
        : isRecord(rawBlock.input)
          ? rawBlock.input
          : null;
      if (callId && toolName && args) toolCalls.push({ callId, toolName, arguments: args });
      else malformedBlockCount += 1;
      continue;
    }

    if (type === "citation") {
      const sourceId = typeof rawBlock.sourceId === "string" ? rawBlock.sourceId : null;
      const locator = typeof rawBlock.locator === "string"
        ? rawBlock.locator
        : typeof rawBlock.url === "string"
          ? rawBlock.url
          : null;
      if (sourceId && locator) citations.push({ sourceId, locator });
      else malformedBlockCount += 1;
      continue;
    }

    if (type === "structured" || type === "structured_response") {
      const value = isRecord(rawBlock.structuredResponse)
        ? rawBlock.structuredResponse
        : isRecord(rawBlock.structured)
          ? rawBlock.structured
          : isRecord(rawBlock.data)
            ? rawBlock.data
            : null;
      if (value && structuredResponse === null) structuredResponse = value;
      else malformedBlockCount += 1;
      continue;
    }

    malformedBlockCount += 1;
  }

  const normalized = {
    text: textParts.join("\n"),
    toolCalls,
    citations,
    structuredResponse,
    malformedBlockCount,
    valid: malformedBlockCount === 0 && (textParts.length > 0 || toolCalls.length > 0 || citations.length > 0 || structuredResponse !== null)
  };
  return normalized;
}

const prohibitedIntentPatterns = [
  /\b(diagnose|diagnosis|prescribe|treat(?:ment)? decision)\b/i,
  /\b(enroll|randomize)\b.*\b(patient|participant|trial)\b/i,
  /\b(submit|send|file)\b.*\b(claim|payer|prior auth)\b/i,
  /\b(write|post|commit|send)\b.*\b(ehr|electronic health record|patient message)\b/i
];

const protectedInferencePatterns = [
  /\b(emotional state|mental state|decisional capacity|race|ethnicity|religion|sexual orientation)\b/i,
  /\bmust feel|secretly wants|hidden intent\b/i
];

export type CompileIntentEnvelopeInput = {
  intentId: string;
  tenantId: string;
  actor: IntentEnvelope["actor"];
  content: unknown;
  statedGoal: string;
  setting: IntentEnvelope["setting"];
  urgency: IntentEnvelope["urgency"];
  explicitConstraints: string[];
  verifiedFacts: string[];
  proposedInferences: string[];
  missingCriticalInformation: string[];
  contradictions: string[];
  confidence: number;
  requestedAction: string;
  evidenceRequirements: string[];
  proposedWorkflow: string;
};

export function compileIntentEnvelope(input: CompileIntentEnvelopeInput): IntentEnvelope {
  const normalized = normalizeModelMessageContent(input.content);
  const confidence = Math.max(0, Math.min(1, input.confidence));
  const protectedInference = input.proposedInferences.some((item) => protectedInferencePatterns.some((pattern) => pattern.test(item)));
  const prohibitedAction = prohibitedIntentPatterns.some((pattern) => pattern.test(input.requestedAction));
  const ambiguousClinical = input.setting === "clinical" && (
    input.missingCriticalInformation.length > 0 || input.contradictions.length > 0 || confidence < 0.85
  );
  const malformed = !normalized.valid;
  const policyDecision: PolicyDecision = prohibitedAction || protectedInference || malformed
    ? "BLOCK"
    : ambiguousClinical || input.setting === "clinical"
      ? "REQUIRE_HUMAN"
      : "ALLOW";
  const requiredApproval: IntentEnvelope["requiredApproval"] = input.setting === "clinical"
    ? "clinician"
    : policyDecision === "REQUIRE_HUMAN"
      ? "operator"
      : "none";
  const envelopeWithoutHash = {
    intentId: input.intentId,
    tenantId: input.tenantId,
    statedGoal: input.statedGoal,
    actor: input.actor,
    setting: input.setting,
    urgency: input.urgency,
    explicitConstraints: input.explicitConstraints,
    verifiedFacts: input.verifiedFacts,
    proposedInferences: input.proposedInferences,
    missingCriticalInformation: [
      ...input.missingCriticalInformation,
      ...(malformed ? ["model message content could not be normalized safely"] : []),
      ...(protectedInference ? ["prohibited protected or hidden-state inference was requested"] : [])
    ],
    contradictions: input.contradictions,
    confidence,
    requestedAction: input.requestedAction,
    evidenceRequirements: input.evidenceRequirements,
    proposedWorkflow: input.proposedWorkflow,
    requiredApproval,
    policyDecision,
    interpretedIntentConfirmationRequired: policyDecision !== "BLOCK"
  };
  return { ...envelopeWithoutHash, auditHash: createClinicalEvidenceHash(envelopeWithoutHash) };
}

export type TrialProtocol = {
  protocolId: string;
  version: string;
  inclusionRules: Array<{ criterionId: string; factKey: string; expectedValue: string }>;
  exclusionRules: Array<{ criterionId: string; factKey: string; prohibitedValue: string }>;
  requiredMeasurements: string[];
  externalRandomizationSystemId: string;
  activeForSyntheticReview: boolean;
};

export type SyntheticTrialCandidate = {
  syntheticSubjectId: string;
  facts: Record<string, string>;
  measurementKeys: string[];
};

export function isTrialCoreEnablementEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.SCRIMED_TRIALCORE_ENABLEMENT_ENABLED === "true";
}

export function reviewSyntheticTrialCandidate(input: {
  reviewId: string;
  tenantId: string;
  protocol: TrialProtocol;
  candidate: SyntheticTrialCandidate;
}): TrialCandidateReview {
  if (!input.candidate.syntheticSubjectId.startsWith("synthetic-")) {
    throw new Error("TrialCore p.32 accepts synthetic subject identifiers only");
  }
  const matchedCriteria = input.protocol.inclusionRules
    .filter((rule) => input.candidate.facts[rule.factKey] === rule.expectedValue)
    .map((rule) => rule.criterionId);
  const unmatchedCriteria = input.protocol.exclusionRules
    .filter((rule) => input.candidate.facts[rule.factKey] === rule.prohibitedValue)
    .map((rule) => rule.criterionId);
  const missingCriteria = [
    ...input.protocol.inclusionRules
      .filter((rule) => input.candidate.facts[rule.factKey] === undefined)
      .map((rule) => rule.criterionId),
    ...input.protocol.requiredMeasurements
      .filter((measurement) => !input.candidate.measurementKeys.includes(measurement))
      .map((measurement) => `measurement:${measurement}`)
  ];
  const preliminaryEligibility: TrialCandidateReview["preliminaryEligibility"] = !input.protocol.activeForSyntheticReview || missingCriteria.length
    ? "insufficient-information"
    : unmatchedCriteria.length
      ? "unlikely"
      : matchedCriteria.length === input.protocol.inclusionRules.length
        ? "possible"
        : "insufficient-information";
  const withoutHash = {
    reviewId: input.reviewId,
    tenantId: input.tenantId,
    protocolId: input.protocol.protocolId,
    protocolVersion: input.protocol.version,
    syntheticSubjectId: input.candidate.syntheticSubjectId,
    preliminaryEligibility,
    matchedCriteria,
    unmatchedCriteria,
    missingCriteria,
    consentStatus: "not-requested" as const,
    coordinatorConfirmation: "pending" as const,
    randomizationSystem: "external-authorized-only" as const,
    enrollmentAllowed: false as const,
    randomizationAllowed: false as const,
    investigationalInterventionProven: false as const,
    policyDecision: "REQUIRE_HUMAN" as const,
    humanReviewRequired: true as const
  };
  return { ...withoutHash, auditHash: createClinicalEvidenceHash(withoutHash) };
}

export function buildAttentionEvent(input: Omit<AttentionEvent, "auditHash">): AttentionEvent {
  if (!input.eventId || !input.tenantId || !input.deduplicationKey || !input.ownerRole) {
    throw new Error("Attention events require stable identity, tenant, owner, and deduplication metadata");
  }
  if (input.level !== "BACKGROUND" && (!input.actionableRecommendation || input.evidenceSourceIds.length === 0)) {
    throw new Error("Clinician-facing attention events require an actionable recommendation and evidence");
  }
  if (input.level === "HARD_STOP" && (!input.humanReviewRequired || input.suppressionAllowed)) {
    throw new Error("Hard stops require human review and cannot be silently suppressed");
  }
  if (!Number.isFinite(Date.parse(input.expiresAt)) || input.cooldownSeconds < 0) {
    throw new Error("Attention event expiry or cooldown is invalid");
  }
  return { ...input, auditHash: createClinicalEvidenceHash(input) };
}

export function deduplicateAttentionEvents(events: AttentionEvent[]) {
  const selected = new Map<string, AttentionEvent>();
  const levelWeight: Record<AttentionEvent["level"], number> = {
    BACKGROUND: 0,
    INBOX: 1,
    INTERRUPTIVE: 2,
    HARD_STOP: 3
  };
  for (const event of events) {
    const key = `${event.tenantId}:${event.deduplicationKey}`;
    const prior = selected.get(key);
    const higherPriority = prior && levelWeight[event.level] > levelWeight[prior.level];
    const samePriorityWithLaterExpiry =
      prior && levelWeight[event.level] === levelWeight[prior.level] && event.expiresAt > prior.expiresAt;
    if (!prior || higherPriority || samePriorityWithLaterExpiry) {
      selected.set(key, event);
    }
  }
  return [...selected.values()].sort((left, right) => left.eventId.localeCompare(right.eventId));
}

export type ConnectorActionRequest = {
  tenantId: string;
  actorId: string;
  capability: string;
  operation: "read" | "write";
  credentialMethod: ConnectorPolicy["credentialMethod"];
  officialApi: boolean;
  humanApprovalRecorded: boolean;
  idempotencyKey: string;
  requestedAt: string;
};

export function evaluateConnectorAction(policy: ConnectorPolicy, request: ConnectorActionRequest) {
  const blockers: string[] = [];
  const reviewReasons: string[] = [];
  if (policy.killSwitchActive) blockers.push("connector kill switch is active");
  if (policy.termsChangeState !== "current") blockers.push("connector terms require review; writes and new automation are frozen");
  if (policy.agentUsePermission === "prohibited" || policy.agentUsePermission === "human-only") {
    blockers.push("agent use is not permitted by the connector policy");
  }
  if (policy.officialApiRequired && !request.officialApi) blockers.push("official API access is required");
  if (request.credentialMethod !== policy.credentialMethod) blockers.push("credential method is not authorized");
  if (!policy.permittedCapabilities.includes(request.capability)) blockers.push("requested connector capability is outside policy scope");
  const scopes = request.operation === "read" ? policy.readScopes : policy.writeScopes;
  if (!scopes.includes(request.capability)) blockers.push(`requested ${request.operation} scope is not authorized`);
  if (request.operation === "write" && policy.humanApprovalRequiredForWrites && !request.humanApprovalRecorded) {
    reviewReasons.push("write requires action-scoped human approval");
  }
  if (policy.agentUsePermission === "review-required") reviewReasons.push("connector agent use requires human review");
  const decision: PolicyDecision = blockers.length ? "BLOCK" : reviewReasons.length ? "REQUIRE_HUMAN" : "ALLOW";
  return {
    decision,
    blockers,
    reviewReasons,
    safeDegradation: decision === "ALLOW" ? "none" as const : "disable-write-and-return-reviewable-read-only-status" as const,
    writeExecuted: false as const,
    auditReceipt: createClinicalEvidenceHash({
      policyId: policy.policyId,
      termsVersion: policy.governingTermsVersion,
      reviewedTermsHash: policy.reviewedTermsHash,
      tenantId: request.tenantId,
      actorId: request.actorId,
      capability: request.capability,
      operation: request.operation,
      idempotencyKey: request.idempotencyKey,
      requestedAt: request.requestedAt,
      decision,
      blockers,
      reviewReasons
    })
  };
}

export const scrimedAgentReadyInteroperabilityContract = {
  version: "scrimed-agent-ready-interoperability-v1",
  authentication: "scoped-oauth-or-service-identity",
  agentIdentityRequired: true,
  granularCapabilitiesRequired: true,
  auditReceiptsRequired: true,
  rateLimitsRequired: true,
  consentAndPurposeRequired: true,
  revocationRequired: true,
  portableExportRequired: true,
  autonomousWritesEnabled: false,
  prohibitedAccess: ["credential sharing", "session hijacking", "CAPTCHA bypass", "prohibited scraping"]
} as const;

export type ApprovedPublicSalesMaterial = {
  materialId: string;
  publicUrl: string;
  approved: boolean;
  valuePropositions: string[];
  supportedUseCases: string[];
  buyerRoles: string[];
  healthSystemSegments: string[];
  geographies: string[];
  evidenceRequirements: string[];
  organizationalFitSignals: string[];
  containsPersonalData: boolean;
  provenanceHash: string;
};

export function isGrowthOsEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.SCRIMED_GROWTH_OS_ENABLED === "true";
}

export function compileIcpProfile(input: {
  profileId: string;
  materials: ApprovedPublicSalesMaterial[];
  prohibitedSignals?: string[];
}): ICPProfile {
  if (!input.materials.length || input.materials.some((material) => !material.approved || material.containsPersonalData)) {
    throw new Error("GrowthOS accepts approved public organizational materials without personal data only");
  }
  const unique = (values: string[]) => [...new Set(values)].sort();
  const sourceMaterialIds = input.materials.map((material) => material.materialId).sort();
  const withoutHash = {
    profileId: input.profileId,
    sourceMaterialIds,
    proposedSegments: unique(input.materials.flatMap((material) => material.healthSystemSegments)),
    buyerRoles: unique(input.materials.flatMap((material) => material.buyerRoles)),
    supportedUseCases: unique(input.materials.flatMap((material) => material.supportedUseCases)),
    geographies: unique(input.materials.flatMap((material) => material.geographies)),
    evidenceRequirements: unique(input.materials.flatMap((material) => material.evidenceRequirements)),
    valuePropositions: unique(input.materials.flatMap((material) => material.valuePropositions)),
    organizationalFitSignals: unique(input.materials.flatMap((material) => material.organizationalFitSignals)),
    prohibitedSignals: unique([
      "patient data",
      "protected attributes",
      "sensitive personal profiling",
      "deceptive personalization",
      ...(input.prohibitedSignals ?? [])
    ]),
    approvalStatus: "draft" as const,
    automaticOutreachAllowed: false as const,
    sensitiveProfilingAllowed: false as const,
    optOutRequired: true as const
  };
  return {
    ...withoutHash,
    provenanceHash: createClinicalEvidenceHash({
      ...withoutHash,
      sourceProvenance: input.materials.map((material) => material.provenanceHash)
    })
  };
}

export function buildOutcomeEvent(input: Omit<
  OutcomeEvent,
  "totalCostUsd" | "costPerAcceptedOutcomeUsd"
>): OutcomeEvent {
  const totalCostUsd = [
    input.inferenceCostUsd,
    input.retrievalCostUsd,
    input.infrastructureCostUsd,
    input.retryCostUsd,
    input.humanReviewCostUsd,
    input.latencyBurdenCostUsd,
    input.failureOverrideCostUsd
  ].reduce((total, value) => total + Math.max(0, value), 0);
  return {
    ...input,
    totalCostUsd: Number(totalCostUsd.toFixed(6)),
    costPerAcceptedOutcomeUsd: input.acceptedByHuman ? Number(totalCostUsd.toFixed(6)) : null
  };
}
