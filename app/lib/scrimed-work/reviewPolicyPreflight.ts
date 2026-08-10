import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import {
  getScrimedOperatingModeSummary,
  validateScrimedOperatingMode,
  type ScrimedOperatingMode
} from "../operatingMode";
import {
  evaluateReviewPolicy,
  getReviewRequirement,
  scrimedReviewPolicyVersion,
  type ReviewAction,
  type ReviewDataClassification,
  type ReviewEnvironment,
  type ReviewPolicyContext
} from "./reviewPolicyEngine";
import { containsPhiRisk, containsTokenLikeField, type ParsedResult } from "./schemas";

export const scrimedReviewPolicyPreflightVersion =
  "scrimed-review-policy-preflight-v2-2026-08-08";
export const scrimedReviewPolicyPreflightRoute =
  "/api/scrimed-work/continuity/preflight";

export type ReviewPolicyPreflightStatus =
  | "PREFLIGHT_PASSED"
  | "EVIDENCE_REQUIRED"
  | "FOUNDER_ACCEPTANCE_REQUIRED"
  | "QUALIFIED_REVIEW_REQUIRED"
  | "PRODUCTION_AUTHORIZATION_REQUIRED"
  | "CONTEXT_REJECTED"
  | "POLICY_CONDITION_BLOCKED"
  | "BLOCKED_BY_OPERATING_MODE"
  | "PROHIBITED";

export type ReviewPolicyPreflightRequest = Pick<
  ReviewPolicyContext,
  | "action"
  | "environment"
  | "dataClassification"
  | "intendedUse"
  | "candidateFingerprint"
  | "assuranceManifestFingerprint"
  | "evidenceReferences"
  | "activeConditions"
> & {
  workspaceSlug?: string;
};

export type ReviewPreflightToolClass =
  | "read-only"
  | "reversible-write"
  | "consequential-write"
  | "external-communication"
  | "clinical"
  | "financial"
  | "identity"
  | "data-export";

export type ReviewPreflightBlocker = {
  category: "evidence" | "policy" | "operating-mode" | "human-approval";
  code: string;
  owner: string;
};

const reviewActions: ReviewAction[] = [
  "source-commit",
  "preview-deployment",
  "wix-publication",
  "synthetic-demonstration",
  "disposable-migration-dry-run",
  "production-migration",
  "production-deployment",
  "phi-processing",
  "ehr-connection",
  "device-connection",
  "clinical-alerting",
  "clinical-execution",
  "diagnosis-support",
  "treatment-support",
  "payer-decision",
  "customer-activation",
  "legal-policy-adoption",
  "contract-execution"
];
const reviewEnvironments: ReviewEnvironment[] = [
  "local",
  "test",
  "disposable",
  "preview",
  "public-content",
  "production"
];
const reviewDataClassifications: ReviewDataClassification[] = [
  "public",
  "synthetic",
  "metadata",
  "phi",
  "restricted-phi"
];
const allowedRequestKeys = new Set([
  "action",
  "environment",
  "dataClassification",
  "intendedUse",
  "candidateFingerprint",
  "assuranceManifestFingerprint",
  "evidenceReferences",
  "activeConditions",
  "workspaceSlug"
]);
const sha256Pattern = /^[0-9a-f]{64}$/i;
const referencePattern = /^[a-z0-9][a-z0-9._:-]{0,95}$/;

const actionToolClasses: Partial<Record<ReviewAction, ReviewPreflightToolClass[]>> = {
  "synthetic-demonstration": ["read-only", "reversible-write"],
  "source-commit": ["read-only", "reversible-write"],
  "disposable-migration-dry-run": ["read-only", "reversible-write"],
  "preview-deployment": ["read-only", "consequential-write"],
  "wix-publication": ["read-only", "external-communication"],
  "legal-policy-adoption": ["read-only", "reversible-write"],
  "contract-execution": ["read-only", "external-communication", "financial"],
  "production-migration": ["read-only", "consequential-write"],
  "production-deployment": ["read-only", "consequential-write"],
  "customer-activation": ["read-only", "identity", "consequential-write"],
  "phi-processing": ["read-only", "data-export"],
  "ehr-connection": ["read-only", "clinical", "consequential-write"],
  "device-connection": ["read-only", "clinical"],
  "clinical-execution": ["read-only", "clinical", "consequential-write"],
  "clinical-alerting": ["clinical", "external-communication"],
  "diagnosis-support": ["clinical"],
  "treatment-support": ["clinical"],
  "payer-decision": ["financial", "external-communication", "consequential-write"]
};

function resourcePolicyForAction(action: ReviewAction) {
  if (action === "synthetic-demonstration") {
    return {
      expectedCost: { classification: "low" as const, maximumEstimatedCostUsd: 1 },
      expectedDuration: { classification: "short" as const, maximumDurationMinutes: 30 }
    };
  }
  if (["source-commit", "preview-deployment", "wix-publication"].includes(action)) {
    return {
      expectedCost: { classification: "low" as const, maximumEstimatedCostUsd: 10 },
      expectedDuration: { classification: "bounded" as const, maximumDurationMinutes: 120 }
    };
  }
  if (action === "disposable-migration-dry-run") {
    return {
      expectedCost: { classification: "moderate" as const, maximumEstimatedCostUsd: 25 },
      expectedDuration: { classification: "bounded" as const, maximumDurationMinutes: 180 }
    };
  }
  return {
    expectedCost: { classification: "not-admitted" as const, maximumEstimatedCostUsd: 0 },
    expectedDuration: { classification: "not-admitted" as const, maximumDurationMinutes: 0 }
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseReferenceArray(
  value: unknown,
  field: "evidenceReferences" | "activeConditions"
): ParsedResult<string[]> {
  if (!Array.isArray(value) || value.length > 32) {
    return {
      ok: false,
      reason: `${field} must be an array containing no more than 32 metadata references.`,
      rejectedField: field
    };
  }

  if (
    value.some(
      (entry) =>
        typeof entry !== "string" ||
        !referencePattern.test(entry) ||
        containsPhiRisk(entry)
    )
  ) {
    return {
      ok: false,
      reason: `${field} accepts bounded lowercase metadata identifiers only.`,
      rejectedField: field
    };
  }

  return {
    ok: true,
    value: [...new Set(value as string[])].sort()
  };
}

export function parseReviewPolicyPreflightRequest(
  value: unknown
): ParsedResult<ReviewPolicyPreflightRequest> {
  if (!isObject(value)) {
    return { ok: false, reason: "Review-policy preflight request must be an object." };
  }
  if (containsTokenLikeField(value) || containsPhiRisk(value)) {
    return {
      ok: false,
      reason: "Review-policy preflight accepts metadata only and rejects secrets, tokens, PHI, and direct identifiers.",
      rejectedField: "payload"
    };
  }

  const unsupportedKey = Object.keys(value).find((key) => !allowedRequestKeys.has(key));
  if (unsupportedKey) {
    return {
      ok: false,
      reason:
        "Approval assertions, evaluation timestamps, and unknown fields cannot be supplied by the caller.",
      rejectedField: unsupportedKey
    };
  }
  if (!reviewActions.includes(value.action as ReviewAction)) {
    return { ok: false, reason: "Unknown review action.", rejectedField: "action" };
  }
  if (!reviewEnvironments.includes(value.environment as ReviewEnvironment)) {
    return {
      ok: false,
      reason: "Unknown review environment.",
      rejectedField: "environment"
    };
  }
  if (
    !reviewDataClassifications.includes(
      value.dataClassification as ReviewDataClassification
    )
  ) {
    return {
      ok: false,
      reason: "Unknown review data classification.",
      rejectedField: "dataClassification"
    };
  }
  if (
    typeof value.intendedUse !== "string" ||
    !referencePattern.test(value.intendedUse)
  ) {
    return {
      ok: false,
      reason: "intendedUse must be a registered metadata identifier.",
      rejectedField: "intendedUse"
    };
  }
  if (
    typeof value.candidateFingerprint !== "string" ||
    !sha256Pattern.test(value.candidateFingerprint)
  ) {
    return {
      ok: false,
      reason: "candidateFingerprint must be an exact SHA-256 fingerprint.",
      rejectedField: "candidateFingerprint"
    };
  }
  if (
    typeof value.assuranceManifestFingerprint !== "string" ||
    !sha256Pattern.test(value.assuranceManifestFingerprint)
  ) {
    return {
      ok: false,
      reason: "assuranceManifestFingerprint must be an exact SHA-256 fingerprint.",
      rejectedField: "assuranceManifestFingerprint"
    };
  }

  const evidenceReferences = parseReferenceArray(
    value.evidenceReferences,
    "evidenceReferences"
  );
  if (!evidenceReferences.ok) return evidenceReferences;
  const activeConditions = parseReferenceArray(
    value.activeConditions ?? [],
    "activeConditions"
  );
  if (!activeConditions.ok) return activeConditions;
  if (
    value.workspaceSlug !== undefined &&
    (typeof value.workspaceSlug !== "string" ||
      !referencePattern.test(value.workspaceSlug) ||
      containsPhiRisk(value.workspaceSlug))
  ) {
    return {
      ok: false,
      reason: "workspaceSlug must be a bounded metadata identifier when supplied.",
      rejectedField: "workspaceSlug"
    };
  }

  return {
    ok: true,
    value: {
      action: value.action as ReviewAction,
      environment: value.environment as ReviewEnvironment,
      dataClassification: value.dataClassification as ReviewDataClassification,
      intendedUse: value.intendedUse,
      candidateFingerprint: value.candidateFingerprint.toLowerCase(),
      assuranceManifestFingerprint:
        value.assuranceManifestFingerprint.toLowerCase(),
      evidenceReferences: evidenceReferences.value,
      activeConditions: activeConditions.value,
      ...(typeof value.workspaceSlug === "string"
        ? { workspaceSlug: value.workspaceSlug }
        : {})
    }
  };
}

export function getReviewActionOperatingModeBlockReason(
  action: ReviewAction,
  mode: ScrimedOperatingMode
) {
  const validation = validateScrimedOperatingMode(mode);
  if (!validation.valid) {
    return `unsafe-operating-mode:${validation.violations.join(",")}`;
  }
  if (action === "phi-processing" && !mode.allowPHI) return "phi-processing-disabled";
  if (action === "ehr-connection" && !mode.productionEHRConnections) {
    return "production-ehr-connections-disabled";
  }
  if (action === "device-connection" && !mode.medicalDeviceConnections) {
    return "medical-device-connections-disabled";
  }
  if (action === "clinical-execution" && !mode.liveClinicalExecution) {
    return "live-clinical-execution-disabled";
  }
  return null;
}

function statusForPreflight(input: {
  riskTier: 0 | 1 | 2 | 3 | "PROHIBITED";
  reasonCodes: string[];
  missingEvidence: string[];
  operatingModeBlockReason: string | null;
}): ReviewPolicyPreflightStatus {
  if (input.riskTier === "PROHIBITED") return "PROHIBITED";
  if (input.operatingModeBlockReason) return "BLOCKED_BY_OPERATING_MODE";
  if (input.reasonCodes.some((reason) => reason.startsWith("PROHIBITED_CONDITION:"))) {
    return "POLICY_CONDITION_BLOCKED";
  }
  if (
    input.reasonCodes.some((reason) =>
      [
        "ENVIRONMENT_OUTSIDE_REGISTERED_SCOPE",
        "DATA_CLASSIFICATION_OUTSIDE_REGISTERED_SCOPE",
        "INTENDED_USE_OUTSIDE_REGISTERED_SCOPE"
      ].includes(reason)
    )
  ) {
    return "CONTEXT_REJECTED";
  }
  if (input.missingEvidence.length) return "EVIDENCE_REQUIRED";
  if (input.riskTier === 1) return "FOUNDER_ACCEPTANCE_REQUIRED";
  if (input.riskTier === 2) return "QUALIFIED_REVIEW_REQUIRED";
  if (input.riskTier === 3) return "PRODUCTION_AUTHORIZATION_REQUIRED";
  return "PREFLIGHT_PASSED";
}

function normalizeRiskTier(
  value: string | number
): 0 | 1 | 2 | 3 | "PROHIBITED" {
  if (value === "PROHIBITED" || value === 0 || value === 1 || value === 2 || value === 3) {
    return value;
  }
  throw new Error(`Unsupported SCRIMED review risk tier: ${String(value)}`);
}

export function buildReviewPolicyPreflight(input: {
  request: ReviewPolicyPreflightRequest;
  evaluatedAt: string;
  operatingMode?: ScrimedOperatingMode;
}) {
  const mode = input.operatingMode ?? getScrimedOperatingModeSummary().mode;
  const requirement = getReviewRequirement(input.request.action);
  if (!requirement) {
    throw new Error(`Review-policy preflight action is not registered: ${input.request.action}`);
  }
  const operatingModeBlockReason = getReviewActionOperatingModeBlockReason(
    input.request.action,
    mode
  );
  const policy = evaluateReviewPolicy({
    ...input.request,
    evaluatedAt: input.evaluatedAt,
    qualifiedApprovals: [],
    founderAcceptance: null
  });
  const riskTier = normalizeRiskTier(requirement.riskTier);
  const status = statusForPreflight({
    riskTier,
    reasonCodes: policy.reasonCodes,
    missingEvidence: policy.missingEvidence,
    operatingModeBlockReason
  });
  const policyGatePassed =
    status === "PREFLIGHT_PASSED" &&
    policy.reasonCodes.length === 0 &&
    policy.missingEvidence.length === 0;
  const resourcePolicy = resourcePolicyForAction(input.request.action);
  const approvalsNeeded = [
    ...new Set([
      ...policy.requiredReviewerRoles,
      ...(riskTier === 1 ? ["founder"] : [])
    ])
  ].sort();
  const blockers: ReviewPreflightBlocker[] = [
    ...policy.missingEvidence.map((code) => ({
      category: "evidence" as const,
      code,
      owner: "evidence-owner"
    })),
    ...policy.reasonCodes.map((code) => ({
      category: "policy" as const,
      code,
      owner: "policy-owner"
    })),
    ...(operatingModeBlockReason
      ? [{
          category: "operating-mode" as const,
          code: operatingModeBlockReason,
          owner: "security-and-release-owner"
        }]
      : []),
    ...(riskTier !== 0 && riskTier !== "PROHIBITED"
      ? approvalsNeeded.map((owner) => ({
          category: "human-approval" as const,
          code: `approval-required:${owner}`,
          owner
        }))
      : [])
  ];
  const receipt = {
    service: "scrimed-review-policy-preflight" as const,
    version: scrimedReviewPolicyPreflightVersion,
    policyVersion: scrimedReviewPolicyVersion,
    evaluatedAt: input.evaluatedAt,
    action: input.request.action,
    environment: input.request.environment,
    dataClassification: input.request.dataClassification,
    intendedUse: input.request.intendedUse,
    tenantScope: input.request.workspaceSlug ?? "authenticated-tenant-context",
    candidateFingerprint: input.request.candidateFingerprint,
    assuranceManifestFingerprint: input.request.assuranceManifestFingerprint,
    exactFingerprintBinding: true as const,
    status,
    policyDecision: policy.decision,
    policyGatePassed,
    reasonCodes: policy.reasonCodes,
    requiredEvidence: policy.requiredEvidence,
    suppliedEvidence: input.request.evidenceReferences,
    missingEvidence: policy.missingEvidence,
    requiredReviewerRoles: policy.requiredReviewerRoles,
    approvalsNeeded,
    founderAcceptanceRequired: riskTier === 1,
    eligibleToolClassesAfterAuthorization: actionToolClasses[input.request.action] ?? ["read-only"],
    toolAccessStatus: "NOT_AUTHORIZED" as const,
    expectedCost: resourcePolicy.expectedCost,
    expectedDuration: resourcePolicy.expectedDuration,
    blockers,
    operatingModeBlockReason,
    declaredConditionsOnly: true as const,
    callerSuppliedApprovalsAccepted: false as const,
    authorizationStatus: "NOT_EVALUATED" as const,
    executionAuthorized: false as const,
    externalMutationAllowed: false as const,
    productionAuthorityGranted: false as const,
    nextStep:
      status === "PREFLIGHT_PASSED"
        ? "Use the separate action-specific authorization path; this receipt grants no execution authority."
        : "Resolve the listed evidence, policy, operating-mode, or human-approval requirement before requesting separate authorization."
  };

  return {
    ...receipt,
    auditHash: createClinicalEvidenceHash({
      ...receipt,
      policyAuditHash: policy.auditHash
    })
  };
}

export function getReviewPolicyPreflightSummary() {
  return {
    service: "scrimed-review-policy-preflight" as const,
    version: scrimedReviewPolicyPreflightVersion,
    route: scrimedReviewPolicyPreflightRoute,
    method: "POST" as const,
    access: "authenticated-aal2-tenant-scoped" as const,
    serverOwnedEvaluationTime: true as const,
    callerSuppliedApprovalsAccepted: false as const,
    toolAccessStatus: "NOT_AUTHORIZED" as const,
    resourceBudgetsAreAdvisory: true as const,
    authorizationStatus: "NOT_EVALUATED" as const,
    executionAuthorized: false as const,
    productionAuthorityGranted: false as const
  };
}
