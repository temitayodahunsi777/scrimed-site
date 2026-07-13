import type {
  ArtifactType,
  AutonomyLevel,
  DataClassification,
  DefinitionOfDoneContract,
  RiskLevel,
  WorkSession,
  WorkspaceDomain
} from "./types";

export type ParsedResult<T> = { ok: true; value: T } | { ok: false; reason: string; rejectedField?: string };

const workspaceDomains: WorkspaceDomain[] = [
  "clinical",
  "operations",
  "executive",
  "research",
  "engineering",
  "patient-access",
  "revenue-cycle",
  "trust-governance"
];

const autonomyLevels: AutonomyLevel[] = [
  "observe",
  "recommend",
  "prepare",
  "execute_with_approval",
  "execute_preapproved"
];

const riskLevels: RiskLevel[] = ["low", "moderate", "high", "prohibited"];

const artifactTypes: ArtifactType[] = [
  "clinical-summary",
  "patient-education",
  "care-coordination-brief",
  "prior-authorization-draft",
  "appeal-letter-draft",
  "research-brief",
  "executive-report",
  "payer-report",
  "quality-report",
  "board-brief",
  "fhir-bundle-preview",
  "workflow-runbook"
];

const phiPatterns = [
  /\b\d{3}-\d{2}-\d{4}\b/,
  /\b(?:mrn|medical record number|member id|subscriber id|policy id)\s*[:#]?\s*[a-z0-9-]{4,}\b/i,
  /\b(?:dob|date of birth)\s*[:#]?\s*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/i,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/
];

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
}

export function containsPhiRisk(value: unknown): boolean {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "");
  return phiPatterns.some((pattern) => pattern.test(text));
}

export function containsTokenLikeField(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;

  return Object.entries(value as Record<string, unknown>).some(([key, entry]) => {
    if (/token|secret|password|credential|authorization|cookie/i.test(key)) return true;
    if (entry && typeof entry === "object") return containsTokenLikeField(entry);
    if (typeof entry === "string" && /\b(?:Bearer\s+|sk-)[A-Za-z0-9._-]+/i.test(entry)) return true;
    return false;
  });
}

export function classifyWorkInput(value: unknown): DataClassification {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "");

  if (containsPhiRisk(text) || /\b(live phi|real patient|production patient|source chart)\b/i.test(text)) {
    return "phi-blocked";
  }

  if (/\b(deidentified|redacted)\b/i.test(text)) return "deidentified";
  if (/\b(synthetic|no-phi|fixture|demo)\b/i.test(text)) return "synthetic-no-phi";
  if (text.trim().length > 0) return "metadata-only";
  return "unknown";
}

export function validateDefinitionOfDoneContract(value: unknown): ParsedResult<DefinitionOfDoneContract> {
  if (!isObject(value)) {
    return { ok: false, reason: "Definition of Done contract must be an object.", rejectedField: "definitionOfDone" };
  }

  const contract: DefinitionOfDoneContract = {
    goal: typeof value.goal === "string" ? value.goal : "",
    allowedScope: stringArray(value.allowedScope),
    prohibitedActions: stringArray(value.prohibitedActions),
    requiredEvidence: stringArray(value.requiredEvidence),
    successCriteria: stringArray(value.successCriteria),
    stoppingConditions: stringArray(value.stoppingConditions),
    timeoutMs: Number(value.timeoutMs),
    maximumSteps: Number(value.maximumSteps),
    maximumToolCalls: Number(value.maximumToolCalls),
    maximumEstimatedCostUsd: Number(value.maximumEstimatedCostUsd),
    humanApprovalRequired: value.humanApprovalRequired === true,
    rollbackPlan: typeof value.rollbackPlan === "string" ? value.rollbackPlan : "",
    verificationChecks: stringArray(value.verificationChecks)
  };

  const missing = [
    contract.goal ? "" : "goal",
    contract.allowedScope.length > 0 ? "" : "allowedScope",
    contract.prohibitedActions.length > 0 ? "" : "prohibitedActions",
    contract.requiredEvidence.length > 0 ? "" : "requiredEvidence",
    contract.successCriteria.length > 0 ? "" : "successCriteria",
    contract.stoppingConditions.length > 0 ? "" : "stoppingConditions",
    contract.rollbackPlan ? "" : "rollbackPlan",
    contract.verificationChecks.length > 0 ? "" : "verificationChecks"
  ].find(Boolean);

  if (missing) {
    return { ok: false, reason: `Definition of Done contract is missing ${missing}.`, rejectedField: missing };
  }

  if (!Number.isFinite(contract.timeoutMs) || contract.timeoutMs < 1_000 || contract.timeoutMs > 3_600_000) {
    return { ok: false, reason: "timeoutMs must be between 1000 and 3600000.", rejectedField: "timeoutMs" };
  }

  if (!Number.isFinite(contract.maximumSteps) || contract.maximumSteps < 1 || contract.maximumSteps > 50) {
    return { ok: false, reason: "maximumSteps must be between 1 and 50.", rejectedField: "maximumSteps" };
  }

  if (!Number.isFinite(contract.maximumToolCalls) || contract.maximumToolCalls < 0 || contract.maximumToolCalls > 100) {
    return { ok: false, reason: "maximumToolCalls must be between 0 and 100.", rejectedField: "maximumToolCalls" };
  }

  if (!Number.isFinite(contract.maximumEstimatedCostUsd) || contract.maximumEstimatedCostUsd < 0 || contract.maximumEstimatedCostUsd > 25) {
    return { ok: false, reason: "maximumEstimatedCostUsd must be between 0 and 25.", rejectedField: "maximumEstimatedCostUsd" };
  }

  return { ok: true, value: contract };
}

export type WorkSessionCreateInput = {
  tenantId: string;
  organizationScope: string;
  workspaceDomain: WorkspaceDomain;
  title: string;
  objective: string;
  requestedAutonomy: AutonomyLevel;
  riskLevel: RiskLevel;
  definitionOfDone: DefinitionOfDoneContract;
};

export function parseWorkSessionCreateInput(value: unknown): ParsedResult<WorkSessionCreateInput> {
  if (!isObject(value)) return { ok: false, reason: "Request body must be an object." };
  if (containsTokenLikeField(value)) return { ok: false, reason: "Token-like or credential fields are not accepted.", rejectedField: "token" };
  if (containsPhiRisk(value)) return { ok: false, reason: "Potential PHI or identifiers are not accepted in SCRIMED Work requests.", rejectedField: "input" };

  const definition = validateDefinitionOfDoneContract(value.definitionOfDone);
  if (!definition.ok) return definition;

  const workspaceDomain = value.workspaceDomain;
  const requestedAutonomy = value.requestedAutonomy;
  const riskLevel = value.riskLevel;

  if (!workspaceDomains.includes(workspaceDomain as WorkspaceDomain)) {
    return { ok: false, reason: "Unknown workspace domain.", rejectedField: "workspaceDomain" };
  }

  if (!autonomyLevels.includes(requestedAutonomy as AutonomyLevel)) {
    return { ok: false, reason: "Unknown requested autonomy level.", rejectedField: "requestedAutonomy" };
  }

  if (!riskLevels.includes(riskLevel as RiskLevel)) {
    return { ok: false, reason: "Unknown risk level.", rejectedField: "riskLevel" };
  }

  return {
    ok: true,
    value: {
      tenantId: typeof value.tenantId === "string" ? value.tenantId : "synthetic-tenant",
      organizationScope: typeof value.organizationScope === "string" ? value.organizationScope : "synthetic-organization",
      workspaceDomain: workspaceDomain as WorkspaceDomain,
      title: typeof value.title === "string" ? value.title : "Untitled SCRIMED Work Session",
      objective: typeof value.objective === "string" ? value.objective : definition.value.goal,
      requestedAutonomy: requestedAutonomy as AutonomyLevel,
      riskLevel: riskLevel as RiskLevel,
      definitionOfDone: definition.value
    }
  };
}

export function parseArtifactRequest(value: unknown): ParsedResult<{ sessionId: string; type: ArtifactType; title: string }> {
  if (!isObject(value)) return { ok: false, reason: "Artifact request must be an object." };
  if (containsTokenLikeField(value) || containsPhiRisk(value)) return { ok: false, reason: "Artifact request contains blocked sensitive fields." };

  if (!artifactTypes.includes(value.type as ArtifactType)) {
    return { ok: false, reason: "Unknown artifact type.", rejectedField: "type" };
  }

  return {
    ok: true,
    value: {
      sessionId: typeof value.sessionId === "string" ? value.sessionId : "synthetic-session",
      type: value.type as ArtifactType,
      title: typeof value.title === "string" ? value.title : "SCRIMED Work Artifact"
    }
  };
}

export function summarizeSessionForSchema(session: WorkSession) {
  return {
    id: session.id,
    tenantId: session.tenantId,
    workspaceDomain: session.workspaceDomain,
    status: session.statusHistory.at(-1)?.status ?? "draft",
    riskLevel: session.riskLevel,
    approvedAutonomy: session.approvedAutonomy,
    artifactCount: session.artifacts.length,
    approvalCount: session.approvalCheckpoints.length
  };
}
