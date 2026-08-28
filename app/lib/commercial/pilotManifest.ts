import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import { getPilotTemplate, pilotTemplateRegistryVersion } from "./pilotTemplateRegistry";

export const pilotManifestVersion = "scrimed-p34-pilot-manifest-v2-2026-08-28";

export const syntheticPilotControlContract = {
  noPhi: true,
  nonproduction: true,
  noClinicalExecution: true,
  noCustomerSystemWrites: true,
  noPayerSubmission: true,
  noEhrWriteback: true,
  noDeviceWriteback: true
} as const;

export type PilotApprovalState =
  | "DRAFT"
  | "HUMAN_SCOPE_REVIEW_REQUIRED"
  | "APPROVED_FOR_SYNTHETIC_EXECUTION";

export type PilotDataClassification =
  | "PUBLIC"
  | "SYNTHETIC"
  | "DEIDENTIFIED_RESEARCH";

export type PilotCommercialAuthorityState =
  | "NO_BINDING_AUTHORITY"
  | "HUMAN_COMMERCIAL_APPROVAL_REQUIRED";

export type ProtectedPilotExpansionState = "PROTECTED_PILOT_NOT_AUTHORIZED";

export type PilotSuccessCriterion = {
  metricId: string;
  label: string;
  unit: string;
  direction: "increase" | "decrease" | "at-least" | "at-most";
  baseline: number;
  target: number;
  mandatory: boolean;
  evidenceSourceId: string;
};

export type PilotManifestInput = {
  pilotId: string;
  prospectAlias: string;
  templateId: string;
  scope: string;
  environment: "synthetic-nonproduction";
  dataSourceClassification: PilotDataClassification[];
  datasetVersion: string;
  scenarioVersion: string;
  candidateReference: string;
  modelPolicyVersion: string;
  agentPolicyVersion: string;
  toolPolicyVersion: string;
  evidencePolicyVersion: string;
  costCeilingUsd: number;
  runtimeCeilingMinutes: number;
  retryCeiling: number;
  modelCallCeiling: number;
  toolCallCeiling: number;
  agentDepthCeiling: number;
  evidenceStorageCeilingBytes: number;
  durationDays: number;
  startsAt: string;
  endsAt: string;
  successCriteria: PilotSuccessCriterion[];
  exclusions: string[];
  commercialAuthorityState: PilotCommercialAuthorityState;
  protectedPilotExpansionState: ProtectedPilotExpansionState;
  approvalState: PilotApprovalState;
  approvalEvidence?: {
    approverId: string;
    approvedAt: string;
    expiresAt: string;
    candidateReference: string;
    scopeFingerprint: string;
  } | null;
  controlContract: typeof syntheticPilotControlContract;
};

export type PilotManifest = PilotManifestInput & {
  schemaVersion: typeof pilotManifestVersion;
  templateTitle: string;
  templateHash: string;
  scopeFingerprint: string;
  executionAuthorized: boolean;
  productionAuthorityGranted: false;
  manifestHash: string;
};

export type PilotManifestDecision = {
  status: "READY_FOR_SYNTHETIC_EXECUTION" | "HUMAN_SCOPE_REVIEW_REQUIRED" | "BLOCKED";
  reasonCodes: string[];
  manifest: PilotManifest | null;
  productionAuthorityGranted: false;
  decisionHash: string;
};

const safeIdPattern = /^[a-z0-9][a-z0-9-]{2,79}$/;
const versionPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{1,119}$/;
const candidatePattern = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/i;

function validCriterion(criterion: unknown) {
  if (!criterion || typeof criterion !== "object" || Array.isArray(criterion)) return false;
  const value = criterion as Partial<PilotSuccessCriterion>;
  return safeIdPattern.test(typeof value.metricId === "string" ? value.metricId : "")
    && (typeof value.label === "string" ? value.label.trim().length : 0) >= 3
    && (typeof value.unit === "string" ? value.unit.trim().length : 0) >= 1
    && Number.isFinite(value.baseline)
    && Number.isFinite(value.target)
    && (typeof value.evidenceSourceId === "string" ? value.evidenceSourceId.trim().length : 0) >= 3;
}

export function validatePilotControlContract(contract: unknown) {
  if (!contract || typeof contract !== "object") return false;
  const value = contract as Record<string, unknown>;
  return Object.entries(syntheticPilotControlContract).every(
    ([key, expected]) => value[key] === expected
  );
}

function validApproval(input: PilotManifestInput, scopeFingerprint: string, now: Date) {
  if (input.approvalState !== "APPROVED_FOR_SYNTHETIC_EXECUTION") return false;
  const evidence = input.approvalEvidence;
  const approvedAt = Date.parse(evidence?.approvedAt ?? "");
  const expiresAt = Date.parse(evidence?.expiresAt ?? "");
  const nowMs = now.getTime();
  return Boolean(
    evidence
      && safeIdPattern.test(evidence.approverId)
      && Number.isFinite(approvedAt)
      && Number.isFinite(expiresAt)
      && Number.isFinite(nowMs)
      && approvedAt <= nowMs + 5 * 60_000
      && expiresAt > nowMs
      && expiresAt > approvedAt
      && expiresAt - approvedAt <= 90 * 24 * 60 * 60_000
      && evidence.candidateReference === input.candidateReference
      && evidence.scopeFingerprint === scopeFingerprint
  );
}

export function createPilotManifest(
  input: PilotManifestInput,
  now: Date = new Date()
): PilotManifestDecision {
  const raw = input && typeof input === "object" && !Array.isArray(input)
    ? input as Partial<PilotManifestInput>
    : {};
  const safeString = (value: unknown) => typeof value === "string" ? value : "";
  const normalizedApproval = raw.approvalEvidence && typeof raw.approvalEvidence === "object" && !Array.isArray(raw.approvalEvidence)
    ? {
        approverId: safeString(raw.approvalEvidence.approverId),
        approvedAt: safeString(raw.approvalEvidence.approvedAt),
        expiresAt: safeString(raw.approvalEvidence.expiresAt),
        candidateReference: safeString(raw.approvalEvidence.candidateReference),
        scopeFingerprint: safeString(raw.approvalEvidence.scopeFingerprint)
      }
    : null;
  input = {
    pilotId: safeString(raw.pilotId),
    prospectAlias: safeString(raw.prospectAlias),
    templateId: safeString(raw.templateId),
    scope: safeString(raw.scope),
    environment: raw.environment as PilotManifestInput["environment"],
    dataSourceClassification: Array.isArray(raw.dataSourceClassification)
      ? raw.dataSourceClassification.filter((entry): entry is PilotDataClassification => typeof entry === "string")
      : [],
    datasetVersion: safeString(raw.datasetVersion),
    scenarioVersion: safeString(raw.scenarioVersion),
    candidateReference: safeString(raw.candidateReference),
    modelPolicyVersion: safeString(raw.modelPolicyVersion),
    agentPolicyVersion: safeString(raw.agentPolicyVersion),
    toolPolicyVersion: safeString(raw.toolPolicyVersion),
    evidencePolicyVersion: safeString(raw.evidencePolicyVersion),
    costCeilingUsd: raw.costCeilingUsd as number,
    runtimeCeilingMinutes: raw.runtimeCeilingMinutes as number,
    retryCeiling: raw.retryCeiling as number,
    modelCallCeiling: raw.modelCallCeiling as number,
    toolCallCeiling: raw.toolCallCeiling as number,
    agentDepthCeiling: raw.agentDepthCeiling as number,
    evidenceStorageCeilingBytes: raw.evidenceStorageCeilingBytes as number,
    durationDays: raw.durationDays as number,
    startsAt: safeString(raw.startsAt),
    endsAt: safeString(raw.endsAt),
    successCriteria: Array.isArray(raw.successCriteria) ? raw.successCriteria : [],
    exclusions: Array.isArray(raw.exclusions)
      ? raw.exclusions.filter((entry): entry is string => typeof entry === "string")
      : [],
    commercialAuthorityState: raw.commercialAuthorityState as PilotCommercialAuthorityState,
    protectedPilotExpansionState: raw.protectedPilotExpansionState as ProtectedPilotExpansionState,
    approvalState: raw.approvalState as PilotApprovalState,
    approvalEvidence: normalizedApproval,
    controlContract: raw.controlContract as typeof syntheticPilotControlContract
  };
  const effectiveNow = now instanceof Date ? now : new Date(Number.NaN);
  const reasons: string[] = [];
  const template = getPilotTemplate(input.templateId);
  const scopeFingerprint = createClinicalEvidenceHash({
    templateId: input.templateId,
    scope: input.scope,
    exclusions: [...input.exclusions].sort()
  });

  if (!safeIdPattern.test(input.pilotId)) reasons.push("INVALID_PILOT_ID");
  if (!/^prospect-[a-z0-9-]{3,60}$/.test(input.prospectAlias)) {
    reasons.push("NON_IDENTIFYING_PROSPECT_ALIAS_REQUIRED");
  }
  if (!template) reasons.push("UNKNOWN_TEMPLATE");
  if (input.scope.trim().length < 20) reasons.push("BOUNDED_SCOPE_REQUIRED");
  if (input.environment !== "synthetic-nonproduction") reasons.push("SYNTHETIC_NONPRODUCTION_ENVIRONMENT_REQUIRED");
  if (
    input.dataSourceClassification.length === 0
    || input.dataSourceClassification.some((entry) => !new Set(["PUBLIC", "SYNTHETIC", "DEIDENTIFIED_RESEARCH"]).has(entry))
    || input.dataSourceClassification.some((entry) => entry !== "SYNTHETIC")
  ) {
    reasons.push("SYNTHETIC_DATA_CLASSIFICATION_REQUIRED");
  }
  if (!versionPattern.test(input.datasetVersion)) reasons.push("DATASET_VERSION_REQUIRED");
  if (!versionPattern.test(input.scenarioVersion)) reasons.push("SCENARIO_VERSION_REQUIRED");
  if (!candidatePattern.test(input.candidateReference)) reasons.push("EXACT_CANDIDATE_REFERENCE_REQUIRED");
  if (!versionPattern.test(input.modelPolicyVersion)) reasons.push("MODEL_POLICY_VERSION_REQUIRED");
  if (!versionPattern.test(input.agentPolicyVersion)) reasons.push("AGENT_POLICY_VERSION_REQUIRED");
  if (!versionPattern.test(input.toolPolicyVersion)) reasons.push("TOOL_POLICY_VERSION_REQUIRED");
  if (!versionPattern.test(input.evidencePolicyVersion)) reasons.push("EVIDENCE_POLICY_VERSION_REQUIRED");
  if (!Number.isFinite(input.costCeilingUsd) || input.costCeilingUsd <= 0) reasons.push("POSITIVE_COST_CEILING_REQUIRED");
  if (!Number.isInteger(input.runtimeCeilingMinutes) || input.runtimeCeilingMinutes < 1 || input.runtimeCeilingMinutes > 1_440) {
    reasons.push("BOUNDED_RUNTIME_CEILING_REQUIRED");
  }
  if (!Number.isInteger(input.retryCeiling) || input.retryCeiling < 0 || input.retryCeiling > 10) {
    reasons.push("BOUNDED_RETRY_CEILING_REQUIRED");
  }
  for (const [value, reason] of [
    [input.modelCallCeiling, "BOUNDED_MODEL_CALL_CEILING_REQUIRED"],
    [input.toolCallCeiling, "BOUNDED_TOOL_CALL_CEILING_REQUIRED"],
    [input.agentDepthCeiling, "BOUNDED_AGENT_DEPTH_CEILING_REQUIRED"],
    [input.evidenceStorageCeilingBytes, "BOUNDED_EVIDENCE_STORAGE_CEILING_REQUIRED"]
  ] as const) {
    if (!Number.isInteger(value) || value < 1) reasons.push(reason);
  }
  if (!Number.isInteger(input.durationDays) || input.durationDays < 1 || input.durationDays > 90) {
    reasons.push("BOUNDED_DURATION_REQUIRED");
  }
  const startsAt = Date.parse(input.startsAt);
  const endsAt = Date.parse(input.endsAt);
  if (
    !Number.isFinite(startsAt)
    || !Number.isFinite(endsAt)
    || endsAt <= startsAt
    || endsAt - startsAt > 90 * 24 * 60 * 60_000
  ) {
    reasons.push("BOUNDED_PILOT_WINDOW_REQUIRED");
  }
  if (input.successCriteria.length === 0 || input.successCriteria.some((criterion) => !validCriterion(criterion))) {
    reasons.push("OBJECTIVE_SUCCESS_CRITERIA_REQUIRED");
  }
  if (!validatePilotControlContract(input.controlContract)) reasons.push("PILOT_CONTROL_CONTRACT_INCOMPLETE");
  if (input.commercialAuthorityState !== "NO_BINDING_AUTHORITY") {
    reasons.push("NO_BINDING_COMMERCIAL_AUTHORITY_REQUIRED");
  }
  if (input.protectedPilotExpansionState !== "PROTECTED_PILOT_NOT_AUTHORIZED") {
    reasons.push("PROTECTED_PILOT_NOT_AUTHORIZED_REQUIRED");
  }
  if (template && !template.exclusions.every((exclusion) => input.exclusions.includes(exclusion))) {
    reasons.push("TEMPLATE_EXCLUSIONS_MISSING");
  }

  const approvalValid = validApproval(input, scopeFingerprint, effectiveNow);
  if (input.approvalState === "APPROVED_FOR_SYNTHETIC_EXECUTION" && !approvalValid) {
    reasons.push("SYNTHETIC_EXECUTION_APPROVAL_INVALID");
  }

  if (reasons.length > 0 || !template) {
    const decision = {
      status: "BLOCKED" as const,
      reasonCodes: [...new Set(reasons)].sort(),
      manifest: null,
      productionAuthorityGranted: false as const
    };
    return {
      ...decision,
      decisionHash: createClinicalEvidenceHash({ version: pilotManifestVersion, decision })
    };
  }

  const executionAuthorized = approvalValid;
  const base = {
    ...input,
    schemaVersion: pilotManifestVersion as typeof pilotManifestVersion,
    templateTitle: template.title,
    templateHash: template.templateHash,
    scopeFingerprint,
    executionAuthorized,
    productionAuthorityGranted: false as const
  };
  const manifest: PilotManifest = {
    ...base,
    manifestHash: createClinicalEvidenceHash({
      version: pilotManifestVersion,
      registryVersion: pilotTemplateRegistryVersion,
      base
    })
  };
  const decision = {
    status: executionAuthorized
      ? ("READY_FOR_SYNTHETIC_EXECUTION" as const)
      : ("HUMAN_SCOPE_REVIEW_REQUIRED" as const),
    reasonCodes: executionAuthorized ? [] : ["NAMED_SYNTHETIC_SCOPE_APPROVAL_REQUIRED"],
    manifest,
    productionAuthorityGranted: false as const
  };
  return {
    ...decision,
    decisionHash: createClinicalEvidenceHash({ version: pilotManifestVersion, decision })
  };
}
