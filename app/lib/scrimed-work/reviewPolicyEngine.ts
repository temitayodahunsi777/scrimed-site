import reviewRequirements from "../../../config/review-requirements.json" with { type: "json" };
import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";

export const scrimedReviewPolicyVersion = reviewRequirements.schemaVersion;

export type ReviewPolicyDecision =
  | "PERMITTED_AUTOMATICALLY"
  | "FOUNDER_INTERIM_ACCEPTANCE_REQUIRED"
  | "TARGETED_QUALIFIED_REVIEW_REQUIRED"
  | "PRODUCTION_ACTIVATION_APPROVAL_REQUIRED"
  | "PROHIBITED";

export type ReviewTier = 0 | 1 | 2 | 3;
export type ReviewAction =
  | "source-commit"
  | "preview-deployment"
  | "wix-publication"
  | "synthetic-demonstration"
  | "disposable-migration-dry-run"
  | "production-migration"
  | "production-deployment"
  | "phi-processing"
  | "ehr-connection"
  | "device-connection"
  | "clinical-alerting"
  | "clinical-execution"
  | "diagnosis-support"
  | "treatment-support"
  | "payer-decision"
  | "customer-activation"
  | "legal-policy-adoption"
  | "contract-execution";

export type ReviewEnvironment =
  | "local"
  | "test"
  | "disposable"
  | "preview"
  | "public-content"
  | "production";

export type ReviewDataClassification =
  | "public"
  | "synthetic"
  | "metadata"
  | "phi"
  | "restricted-phi";

export type QualifiedApprovalReference = {
  approvalId: string;
  reviewerRole: string;
  reviewerIdentity: string;
  candidateFingerprint: string;
  assuranceManifestFingerprint: string;
  issuedAt: string;
  expiresAt: string;
  signatureVerified: boolean;
  decision: "approved" | "rejected";
};

export type FounderAcceptanceReference = {
  acceptanceId: string;
  candidateFingerprint: string;
  assuranceManifestFingerprint: string;
  permittedActivities: string[];
  prohibitedActivities: string[];
  issuedAt: string;
  expiresAt: string;
  signatureVerified: boolean;
};

export type ReviewPolicyContext = {
  action: ReviewAction;
  environment: ReviewEnvironment;
  dataClassification: ReviewDataClassification;
  intendedUse: string;
  candidateFingerprint: string;
  assuranceManifestFingerprint: string;
  evaluatedAt: string;
  evidenceReferences: string[];
  activeConditions: string[];
  qualifiedApprovals: QualifiedApprovalReference[];
  founderAcceptance: FounderAcceptanceReference | null;
};

type MatrixRequirement = (typeof reviewRequirements.requirements)[number];
const sha256Pattern = /^[0-9a-f]{64}$/i;

function isCurrent(timestamp: string, evaluatedAt: string) {
  const expiresAt = Date.parse(timestamp);
  const checkedAt = Date.parse(evaluatedAt);
  return Number.isFinite(expiresAt) && Number.isFinite(checkedAt) && expiresAt > checkedAt;
}

function decisionForTier(tier: MatrixRequirement["riskTier"]): ReviewPolicyDecision {
  if (tier === "PROHIBITED") return "PROHIBITED";
  if (tier === 0) return "PERMITTED_AUTOMATICALLY";
  if (tier === 1) return "FOUNDER_INTERIM_ACCEPTANCE_REQUIRED";
  if (tier === 2) return "TARGETED_QUALIFIED_REVIEW_REQUIRED";
  return "PRODUCTION_ACTIVATION_APPROVAL_REQUIRED";
}

function validApproval(
  approval: QualifiedApprovalReference,
  context: ReviewPolicyContext,
  role: string
) {
  return (
    approval.reviewerRole === role &&
    approval.decision === "approved" &&
    approval.signatureVerified &&
    approval.candidateFingerprint === context.candidateFingerprint &&
    approval.assuranceManifestFingerprint === context.assuranceManifestFingerprint &&
    isCurrent(approval.expiresAt, context.evaluatedAt)
  );
}

function validFounderAcceptance(context: ReviewPolicyContext) {
  const acceptance = context.founderAcceptance;
  return Boolean(
    acceptance &&
      acceptance.signatureVerified &&
      acceptance.candidateFingerprint === context.candidateFingerprint &&
      acceptance.assuranceManifestFingerprint === context.assuranceManifestFingerprint &&
      acceptance.permittedActivities.includes(context.action) &&
      !acceptance.prohibitedActivities.includes(context.action) &&
      isCurrent(acceptance.expiresAt, context.evaluatedAt)
  );
}

export function evaluateReviewPolicy(context: ReviewPolicyContext) {
  const requirement = reviewRequirements.requirements.find(
    (candidate) => candidate.action === context.action
  );
  const reasonCodes: string[] = [];

  if (!requirement) reasonCodes.push("REVIEW_ACTION_NOT_REGISTERED");
  if (!sha256Pattern.test(context.candidateFingerprint)) {
    reasonCodes.push("CANDIDATE_FINGERPRINT_INVALID");
  }
  if (!sha256Pattern.test(context.assuranceManifestFingerprint)) {
    reasonCodes.push("ASSURANCE_MANIFEST_FINGERPRINT_INVALID");
  }
  if (!Number.isFinite(Date.parse(context.evaluatedAt))) {
    reasonCodes.push("EVALUATION_TIMESTAMP_INVALID");
  }

  if (!requirement) {
    return {
      decision: "PROHIBITED" as const,
      tier: null,
      reasonCodes,
      requiredEvidence: [],
      missingEvidence: [],
      requiredReviewerRoles: [],
      missingReviewerRoles: [],
      founderAcceptanceValid: false,
      authorizationEvidenceSatisfied: false as const,
      executionAuthorized: false as const,
      productionAuthorityGranted: false as const,
      environmentVariableBypassAllowed: false as const,
      auditHash: createClinicalEvidenceHash({ context, reasonCodes })
    };
  }

  const initialDecision = decisionForTier(requirement.riskTier);
  const prohibited = requirement.riskTier === "PROHIBITED";
  if (prohibited) reasonCodes.push("ACTION_PROHIBITED_BY_CURRENT_BOUNDARY");
  if (!prohibited && !requirement.environments.includes(context.environment as never)) {
    reasonCodes.push("ENVIRONMENT_OUTSIDE_REGISTERED_SCOPE");
  }
  if (!prohibited && !requirement.dataClassifications.includes(context.dataClassification as never)) {
    reasonCodes.push("DATA_CLASSIFICATION_OUTSIDE_REGISTERED_SCOPE");
  }
  if (!prohibited && !requirement.intendedUses.includes(context.intendedUse as never)) {
    reasonCodes.push("INTENDED_USE_OUTSIDE_REGISTERED_SCOPE");
  }

  const activeProhibitedConditions = context.activeConditions.filter((condition) =>
    requirement.prohibitedConditions.includes(condition)
  );
  if (activeProhibitedConditions.length) {
    reasonCodes.push(...activeProhibitedConditions.map((condition) => `PROHIBITED_CONDITION:${condition}`));
  }

  const missingEvidence = requirement.requiredEvidence.filter(
    (evidence) => !context.evidenceReferences.includes(evidence)
  );
  if (missingEvidence.length) reasonCodes.push("REQUIRED_EVIDENCE_MISSING");

  const missingReviewerRoles = requirement.requiredReviewerRoles.filter(
    (role) => !context.qualifiedApprovals.some((approval) => validApproval(approval, context, role))
  );
  if (missingReviewerRoles.length) reasonCodes.push("REQUIRED_QUALIFIED_APPROVAL_MISSING");

  const founderAcceptanceValid = validFounderAcceptance(context);
  if (requirement.riskTier === 1 && !founderAcceptanceValid) {
    reasonCodes.push("FOUNDER_INTERIM_ACCEPTANCE_MISSING_OR_INVALID");
  }

  const hardFailure = reasonCodes.some((reason) =>
    [
      "REVIEW_ACTION_NOT_REGISTERED",
      "CANDIDATE_FINGERPRINT_INVALID",
      "ASSURANCE_MANIFEST_FINGERPRINT_INVALID",
      "EVALUATION_TIMESTAMP_INVALID",
      "ACTION_PROHIBITED_BY_CURRENT_BOUNDARY",
      "ENVIRONMENT_OUTSIDE_REGISTERED_SCOPE",
      "DATA_CLASSIFICATION_OUTSIDE_REGISTERED_SCOPE",
      "INTENDED_USE_OUTSIDE_REGISTERED_SCOPE",
      "REQUIRED_EVIDENCE_MISSING",
      "REQUIRED_QUALIFIED_APPROVAL_MISSING",
      "FOUNDER_INTERIM_ACCEPTANCE_MISSING_OR_INVALID"
    ].includes(reason) || reason.startsWith("PROHIBITED_CONDITION:")
  );

  const decision: ReviewPolicyDecision = hardFailure ? initialDecision : "PERMITTED_AUTOMATICALLY";
  const payload = {
    decision,
    tier: requirement.riskTier === "PROHIBITED" ? null : requirement.riskTier,
    reasonCodes: [...new Set(reasonCodes)].sort(),
    requiredEvidence: [...requirement.requiredEvidence],
    missingEvidence,
    requiredReviewerRoles: [...requirement.requiredReviewerRoles],
    missingReviewerRoles,
    founderAcceptanceValid,
    founderAcceptanceEligible: requirement.founderAcceptanceEligible,
    authorizationEvidenceSatisfied: !hardFailure,
    executionAuthorized: false as const,
    environmentVariableBypassAllowed: false as const,
    productionAuthorityGranted: false as const
  };

  return {
    ...payload,
    auditHash: createClinicalEvidenceHash({
      policyVersion: scrimedReviewPolicyVersion,
      context: {
        ...context,
        qualifiedApprovals: context.qualifiedApprovals.map((approval) => approval.approvalId),
        founderAcceptance: context.founderAcceptance?.acceptanceId ?? null
      },
      payload
    })
  };
}

export function getReviewRequirement(action: ReviewAction) {
  return reviewRequirements.requirements.find((requirement) => requirement.action === action) ?? null;
}

export function getReviewRequirementsSummary() {
  return {
    version: scrimedReviewPolicyVersion,
    requirementCount: reviewRequirements.requirements.length,
    tierCounts: reviewRequirements.requirements.reduce<Record<string, number>>((counts, requirement) => {
      const key = String(requirement.riskTier);
      counts[key] = (counts[key] ?? 0) + 1;
      return counts;
    }, {}),
    defaultDecision: reviewRequirements.defaultDecision,
    productionAuthorityGranted: false as const
  };
}
