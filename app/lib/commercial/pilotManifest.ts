import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import { getPilotTemplate, pilotTemplateRegistryVersion } from "./pilotTemplateRegistry";

export const pilotManifestVersion = "scrimed-p34-pilot-manifest-v1-2026-08-27";

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
  datasetVersion: string;
  candidateReference: string;
  modelPolicyVersion: string;
  evidencePolicyVersion: string;
  costCeilingUsd: number;
  durationDays: number;
  successCriteria: PilotSuccessCriterion[];
  exclusions: string[];
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

function validCriterion(criterion: PilotSuccessCriterion) {
  return safeIdPattern.test(criterion.metricId)
    && criterion.label.trim().length >= 3
    && criterion.unit.trim().length >= 1
    && Number.isFinite(criterion.baseline)
    && Number.isFinite(criterion.target)
    && criterion.evidenceSourceId.trim().length >= 3;
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
  if (!versionPattern.test(input.datasetVersion)) reasons.push("DATASET_VERSION_REQUIRED");
  if (!candidatePattern.test(input.candidateReference)) reasons.push("EXACT_CANDIDATE_REFERENCE_REQUIRED");
  if (!versionPattern.test(input.modelPolicyVersion)) reasons.push("MODEL_POLICY_VERSION_REQUIRED");
  if (!versionPattern.test(input.evidencePolicyVersion)) reasons.push("EVIDENCE_POLICY_VERSION_REQUIRED");
  if (!Number.isFinite(input.costCeilingUsd) || input.costCeilingUsd <= 0) reasons.push("POSITIVE_COST_CEILING_REQUIRED");
  if (!Number.isInteger(input.durationDays) || input.durationDays < 1 || input.durationDays > 90) {
    reasons.push("BOUNDED_DURATION_REQUIRED");
  }
  if (input.successCriteria.length === 0 || input.successCriteria.some((criterion) => !validCriterion(criterion))) {
    reasons.push("OBJECTIVE_SUCCESS_CRITERIA_REQUIRED");
  }
  if (!validatePilotControlContract(input.controlContract)) reasons.push("PILOT_CONTROL_CONTRACT_INCOMPLETE");
  if (template && !template.exclusions.every((exclusion) => input.exclusions.includes(exclusion))) {
    reasons.push("TEMPLATE_EXCLUSIONS_MISSING");
  }

  const approvalValid = validApproval(input, scopeFingerprint, now);
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
