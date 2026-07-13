export type TrustOpsModuleCategory =
  | "memory"
  | "clinical-intelligence"
  | "revenue-cycle"
  | "patient-access"
  | "interoperability"
  | "imaging"
  | "population-health"
  | "quality"
  | "governance"
  | "operations"
  | "semantic-infrastructure"
  | "secure-middleware";

export type AutomationEligibility =
  | "recommendation-only"
  | "manual-review-required"
  | "blocked-real-world-action";

export type SignalSeverity = "low" | "medium" | "high" | "critical";

export type SelfHealingAction =
  | "retry workflow"
  | "regenerate missing packet"
  | "request human review"
  | "escalate to compliance"
  | "queue for manual verification"
  | "reconcile duplicate records"
  | "re-run validation"
  | "open investigation ticket"
  | "pause automation";

export type TrustOpsScoreInputs = {
  safety: number;
  evidence: number;
  workflowValue: number;
  governance: number;
  interoperability: number;
  riskPenalty: number;
};

export type TrustOpsScore = TrustOpsScoreInputs & {
  total: number;
  formula: string;
};

export type TrustOpsModule = {
  id: string;
  name: string;
  category: TrustOpsModuleCategory;
  description: string;
  strategicValue: number;
  capabilities: string[];
  requiredData: string[];
  syntheticInputs: string[];
  structuredOutputs: string[];
  safetyBoundaries: string[];
  trustScore: TrustOpsScore;
  governanceScore: number;
  automationRisk: number;
  interoperabilityReadiness: number;
  evidenceRequirements: string[];
  recommendedNextBuildStep: string;
};

export type TrustOpsModuleBrief = {
  schemaVersion: string;
  moduleId: string;
  moduleName: string;
  syntheticOnly: true;
  category: TrustOpsModuleCategory;
  trustScore: TrustOpsScore;
  strategicValue: number;
  capabilities: string[];
  evidenceRequirements: string[];
  safetyBoundaries: string[];
  recommendedNextBuildStep: string;
};

export type SyntheticTrustOpsEvent = {
  id: string;
  type: string;
  affectedWorkflow: string;
  observedValue: number;
  threshold: number;
  unit: string;
  synthetic: true;
  occurredAt: string;
};

export type SyntheticOperationalSignal = {
  id: string;
  severity: SignalSeverity;
  affectedWorkflow: string;
  recommendedOwner: string;
  recommendedAction: string;
  automationEligibility: AutomationEligibility;
  humanReviewRequired: boolean;
  reason: string;
  safetyBoundary: string;
};

export type SelfHealingRecommendation = {
  id: string;
  signalId: string;
  action: SelfHealingAction;
  recommendedOwner: string;
  steps: string[];
  automationEligibility: AutomationEligibility;
  humanReviewRequired: boolean;
  expectedOutcome: string;
  blockedActions: string[];
  safetyBoundary: string;
};

export type SemanticIntelligenceNode = {
  id: string;
  label: string;
  kind: "module" | "signal" | "recommendation" | "governance-control";
  connectsTo: string[];
  evidenceRequired: string[];
  safetyBoundary: string;
};

export type TrustOpsDurableEvidenceBinding = {
  attemptId: string;
  idempotencyKey: string;
  replayToken: string;
  workflowSlug: string;
  durableStoreRecordRoute: string;
  durableStoreReplayRoute: string;
  durableStoreReviewDispositionRoute: string;
  recordRequest: {
    workspaceSlug: string;
    attemptId: string;
    idempotencyKey: string;
    region: "us";
    retentionUntil: string;
  };
  replayRequest: {
    workspaceSlug: string;
    replayToken: string;
  };
  reviewDispositionRequest: {
    workspaceSlug: string;
    attemptId: string;
    disposition: "approved-for-synthetic-release" | "changes-requested" | "rejected" | "escalated";
    reviewerRole: string;
    reasonCode: string;
    reviewNote: string;
    humanReviewAttestation: "no-phi-human-review-no-clinical-authority";
  };
  packetHash: string;
  evidenceEnvelopeHash: string;
  persistenceStatus: "ready-for-aal2-protected-durable-store-not-persisted";
  safetyBoundary: string;
};

export type TrustOpsReviewPacket = {
  packetId: string;
  packetVersion: string;
  createdAt: string;
  signalId: string;
  recommendationId: string;
  moduleIds: string[];
  affectedWorkflow: string;
  severity: SignalSeverity;
  recommendedOwner: string;
  reviewerQueue: string;
  syntheticOnly: true;
  humanReviewRequired: true;
  automationExecutionAllowed: false;
  signal: SyntheticOperationalSignal;
  recommendation: SelfHealingRecommendation;
  evidenceRefs: string[];
  durableEvidenceBinding: TrustOpsDurableEvidenceBinding;
  safetyBoundary: string;
};

export type ValidationResult = {
  schemaVersion: string;
  valid: boolean;
  errors: string[];
};

export const trustOpsSchemaVersion = "scrimed-trustops-schema-v2026-06-30";

const trustOpsScoreFormula =
  "total = safety*0.30 + governance*0.25 + evidence*0.18 + workflowValue*0.15 + interoperability*0.12 - riskPenalty*0.30";

function clampScore(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeTrustOpsScore(input: TrustOpsScoreInputs): TrustOpsScore {
  const safety = clampScore(input.safety);
  const evidence = clampScore(input.evidence);
  const workflowValue = clampScore(input.workflowValue);
  const governance = clampScore(input.governance);
  const interoperability = clampScore(input.interoperability);
  const riskPenalty = clampScore(input.riskPenalty);
  const total = clampScore(
    safety * 0.3 +
      governance * 0.25 +
      evidence * 0.18 +
      workflowValue * 0.15 +
      interoperability * 0.12 -
      riskPenalty * 0.3
  );

  return {
    safety,
    evidence,
    workflowValue,
    governance,
    interoperability,
    riskPenalty,
    total,
    formula: trustOpsScoreFormula
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === "string" && item.length > 0);
}

function isScore(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

function validateStringArrayField(errors: string[], field: string, value: unknown) {
  if (!isStringArray(value)) {
    errors.push(`${field} must be a non-empty string array.`);
  }
}

export function validateTrustOpsModuleBrief(brief: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isObject(brief)) {
    return {
      schemaVersion: trustOpsSchemaVersion,
      valid: false,
      errors: ["brief must be an object."]
    };
  }

  const candidate = brief as Partial<TrustOpsModuleBrief>;

  for (const field of ["schemaVersion", "moduleId", "moduleName", "category", "recommendedNextBuildStep"] as const) {
    if (typeof candidate[field] !== "string" || candidate[field]?.length === 0) {
      errors.push(`${field} must be a non-empty string.`);
    }
  }

  if (candidate.syntheticOnly !== true) {
    errors.push("syntheticOnly must be true.");
  }

  if (!isObject(candidate.trustScore)) {
    errors.push("trustScore must be an object.");
  } else {
    for (const field of ["safety", "evidence", "workflowValue", "governance", "interoperability", "riskPenalty", "total"] as const) {
      if (!isScore(candidate.trustScore[field])) {
        errors.push(`trustScore.${field} must be a 0-100 number.`);
      }
    }
  }

  if (!isScore(candidate.strategicValue)) {
    errors.push("strategicValue must be a 0-100 number.");
  }

  validateStringArrayField(errors, "capabilities", candidate.capabilities);
  validateStringArrayField(errors, "evidenceRequirements", candidate.evidenceRequirements);
  validateStringArrayField(errors, "safetyBoundaries", candidate.safetyBoundaries);

  if (!candidate.safetyBoundaries?.some((boundary) => boundary.toLowerCase().includes("demo/synthetic only"))) {
    errors.push("safetyBoundaries must include the demo/synthetic only boundary.");
  }

  return {
    schemaVersion: trustOpsSchemaVersion,
    valid: errors.length === 0,
    errors
  };
}

export function validateSyntheticOperationalSignal(signal: SyntheticOperationalSignal): ValidationResult {
  const errors: string[] = [];

  for (const field of ["id", "severity", "affectedWorkflow", "recommendedOwner", "recommendedAction", "automationEligibility", "reason", "safetyBoundary"] as const) {
    if (typeof signal[field] !== "string" || signal[field].length === 0) {
      errors.push(`${field} must be a non-empty string.`);
    }
  }

  if (signal.humanReviewRequired !== true) {
    errors.push("humanReviewRequired must remain true for TrustOps signals.");
  }

  if (!signal.safetyBoundary.toLowerCase().includes("synthetic")) {
    errors.push("safetyBoundary must preserve synthetic-only language.");
  }

  return {
    schemaVersion: trustOpsSchemaVersion,
    valid: errors.length === 0,
    errors
  };
}

export function validateSelfHealingRecommendation(recommendation: SelfHealingRecommendation): ValidationResult {
  const errors: string[] = [];

  for (const field of ["id", "signalId", "action", "recommendedOwner", "automationEligibility", "expectedOutcome", "safetyBoundary"] as const) {
    if (typeof recommendation[field] !== "string" || recommendation[field].length === 0) {
      errors.push(`${field} must be a non-empty string.`);
    }
  }

  validateStringArrayField(errors, "steps", recommendation.steps);
  validateStringArrayField(errors, "blockedActions", recommendation.blockedActions);

  if (recommendation.humanReviewRequired !== true) {
    errors.push("humanReviewRequired must remain true for remediation recommendations.");
  }

  if (!recommendation.safetyBoundary.toLowerCase().includes("recommendation")) {
    errors.push("safetyBoundary must state that remediation is recommendation-only.");
  }

  return {
    schemaVersion: trustOpsSchemaVersion,
    valid: errors.length === 0,
    errors
  };
}

export function validateTrustOpsReviewPacket(packet: TrustOpsReviewPacket): ValidationResult {
  const errors: string[] = [];

  for (const field of ["packetId", "packetVersion", "createdAt", "signalId", "recommendationId", "affectedWorkflow", "severity", "recommendedOwner", "reviewerQueue", "safetyBoundary"] as const) {
    if (typeof packet[field] !== "string" || packet[field].length === 0) {
      errors.push(`${field} must be a non-empty string.`);
    }
  }

  validateStringArrayField(errors, "moduleIds", packet.moduleIds);
  validateStringArrayField(errors, "evidenceRefs", packet.evidenceRefs);

  if (packet.syntheticOnly !== true) {
    errors.push("syntheticOnly must be true.");
  }

  if (packet.humanReviewRequired !== true) {
    errors.push("humanReviewRequired must be true.");
  }

  if (packet.automationExecutionAllowed !== false) {
    errors.push("automationExecutionAllowed must be false.");
  }

  if (!packet.packetId.startsWith("trustops_packet_")) {
    errors.push("packetId must use the TrustOps packet namespace.");
  }

  if (!packet.durableEvidenceBinding.attemptId.startsWith("att_")) {
    errors.push("durableEvidenceBinding.attemptId must reference an execution-attempt envelope.");
  }

  if (packet.durableEvidenceBinding.persistenceStatus !== "ready-for-aal2-protected-durable-store-not-persisted") {
    errors.push("durableEvidenceBinding.persistenceStatus must remain protected-persistence-ready and not persisted.");
  }

  if (packet.durableEvidenceBinding.reviewDispositionRequest.humanReviewAttestation !== "no-phi-human-review-no-clinical-authority") {
    errors.push("review disposition must retain the no-PHI human-review attestation.");
  }

  if (!packet.safetyBoundary.toLowerCase().includes("recommendation-only")) {
    errors.push("safetyBoundary must preserve recommendation-only language.");
  }

  return {
    schemaVersion: trustOpsSchemaVersion,
    valid: errors.length === 0,
    errors
  };
}
