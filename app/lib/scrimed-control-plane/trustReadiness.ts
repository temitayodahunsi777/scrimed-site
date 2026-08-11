import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import { platformCapabilityRegistry } from "./platformStrategy";
import type {
  DataClassification,
  ProviderClass,
  ToolRiskClass
} from "./types";

export const scrimedTrustReadinessVersion = "scrimed-trust-readiness-v1-2026-08-11";
export const scrimedTrustReadinessBoundary =
  "Trust Readiness is an internal engineering signal, not certification, compliance assurance, clinical validation, production authorization, customer activation, or distribution authority.";

export type TrustReadinessDecision = "ALLOW_SYNTHETIC" | "REQUIRE_HUMAN" | "BLOCK";

export type TrustReadinessInput = {
  capabilityId: string;
  environment: "local" | "test" | "preview" | "protected-pilot" | "production";
  dataClassification: DataClassification;
  providerClass: ProviderClass;
  toolClass: ToolRiskClass;
  jurisdiction: string;
  evidenceReferences: string[];
  approvalReferences: string[];
  reviewFresh: boolean;
  candidateBound: boolean;
  rollbackAvailable: boolean;
  externalDistributionRequested: boolean;
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function evaluateTrustReadiness(input: TrustReadinessInput) {
  const capability = platformCapabilityRegistry.find((entry) => entry.id === input.capabilityId);
  const blocks: string[] = [];
  const reviews: string[] = [];

  if (!capability) blocks.push("UNKNOWN_CAPABILITY");
  if (input.environment === "production") blocks.push("PRODUCTION_AUTHORITY_NOT_GRANTED");
  if (input.dataClassification === "phi-prohibited") blocks.push("PHI_OR_PROHIBITED_DATA_BLOCKED");
  if (input.externalDistributionRequested) reviews.push("EXTERNAL_DISTRIBUTION_AUTHORITY_REQUIRED");
  if (!input.candidateBound) reviews.push("EXACT_CANDIDATE_BINDING_REQUIRED");
  if (!input.rollbackAvailable) reviews.push("ROLLBACK_EVIDENCE_REQUIRED");
  if (!input.reviewFresh) reviews.push("REVIEW_FRESHNESS_REQUIRED");

  if (capability) {
    if (
      input.environment !== "production" &&
      !capability.environmentSupport.includes(input.environment)
    ) {
      blocks.push("ENVIRONMENT_NOT_AUTHORIZED");
    }
    if (!capability.allowedDataClassifications.includes(input.dataClassification)) {
      blocks.push("DATA_CLASSIFICATION_NOT_AUTHORIZED");
    }
    if (!capability.allowedProviderClasses.includes(input.providerClass)) {
      blocks.push("MODEL_PROVIDER_CLASS_NOT_AUTHORIZED");
    }
    if (!capability.allowedToolClasses.includes(input.toolClass)) {
      blocks.push("TOOL_CLASS_NOT_AUTHORIZED");
    }
    if (!capability.permittedJurisdictions.includes(input.jurisdiction)) {
      reviews.push("JURISDICTION_REVIEW_REQUIRED");
    }
    if (capability.externalActionsEnabled !== false || capability.externalSideEffects.length > 0) {
      blocks.push("UNDECLARED_EXTERNAL_SIDE_EFFECT");
    }
    const missingEvidence = capability.requiredEvidence.filter(
      (required) => !input.evidenceReferences.includes(required)
    );
    if (missingEvidence.length) reviews.push("REQUIRED_EVIDENCE_INCOMPLETE");
    if (capability.riskTier === "high") reviews.push("HIGH_RISK_HUMAN_REVIEW_REQUIRED");
    if (
      input.environment === "protected-pilot" &&
      input.approvalReferences.length < capability.requiredApprovals.length
    ) {
      reviews.push("PROTECTED_PILOT_APPROVALS_INCOMPLETE");
    }
  }

  const uniqueBlocks = [...new Set(blocks)];
  const uniqueReviews = [...new Set(reviews)];
  const decision: TrustReadinessDecision = uniqueBlocks.length
    ? "BLOCK"
    : uniqueReviews.length
      ? "REQUIRE_HUMAN"
      : "ALLOW_SYNTHETIC";

  const dimensions = {
    identityAndScope: clamp(input.candidateBound ? 100 : 45),
    dataEligibility: clamp(uniqueBlocks.some((reason) => reason.includes("DATA") || reason.includes("PHI")) ? 0 : 100),
    modelAndToolEligibility: clamp(uniqueBlocks.some((reason) => reason.includes("MODEL") || reason.includes("TOOL")) ? 0 : 100),
    evidenceCompleteness: clamp(capability ? (input.evidenceReferences.length / Math.max(capability.requiredEvidence.length, 1)) * 100 : 0),
    reviewFreshness: input.reviewFresh ? 100 : 25,
    rollbackReadiness: input.rollbackAvailable ? 100 : 20,
    jurisdictionReadiness: uniqueReviews.includes("JURISDICTION_REVIEW_REQUIRED") ? 30 : 100,
    environmentEligibility: uniqueBlocks.includes("ENVIRONMENT_NOT_AUTHORIZED") || uniqueBlocks.includes("PRODUCTION_AUTHORITY_NOT_GRANTED") ? 0 : 100
  };
  const internalScore = Math.round(
    Object.values(dimensions).reduce((total, value) => total + value, 0) /
      Object.values(dimensions).length
  );

  const result = {
    service: "scrimed-trust-readiness",
    version: scrimedTrustReadinessVersion,
    decision,
    reasonCodes: decision === "BLOCK" ? uniqueBlocks : uniqueReviews,
    blockedReasonCodes: uniqueBlocks,
    reviewReasonCodes: uniqueReviews,
    internalScore,
    dimensions,
    capability: capability
      ? {
          id: capability.id,
          product: capability.product,
          riskTier: capability.riskTier,
          activationStatus: capability.activationStatus,
          externalActionsEnabled: capability.externalActionsEnabled
        }
      : null,
    requiredHumanApproval: decision === "REQUIRE_HUMAN" || decision === "BLOCK",
    productionAuthorityGranted: false as const,
    distributionAuthorityGranted: false as const,
    certificationClaimAllowed: false as const,
    boundary: scrimedTrustReadinessBoundary,
    input
  };

  return {
    ...result,
    auditHash: createClinicalEvidenceHash(result)
  };
}

export function getTrustReadinessSummary() {
  const syntheticModelRoute = evaluateTrustReadiness({
    capabilityId: "model-compute-gateway",
    environment: "test",
    dataClassification: "internal",
    providerClass: "deterministic",
    toolClass: "read-only",
    jurisdiction: "synthetic-internal-global",
    evidenceReferences: ["model passport", "task evaluation", "route rationale", "fallback compatibility", "effective cost"],
    approvalReferences: [],
    reviewFresh: true,
    candidateBound: true,
    rollbackAvailable: true,
    externalDistributionRequested: false
  });
  const protectedClinicalDraft = evaluateTrustReadiness({
    capabilityId: "clinical-context-lens",
    environment: "protected-pilot",
    dataClassification: "deidentified-clinical",
    providerClass: "specialist",
    toolClass: "read-only",
    jurisdiction: "synthetic-internal-global",
    evidenceReferences: ["citations", "freshness", "missing evidence", "uncertainty", "clinician review"],
    approvalReferences: [],
    reviewFresh: true,
    candidateBound: true,
    rollbackAvailable: true,
    externalDistributionRequested: false
  });
  const prohibitedPhiRoute = evaluateTrustReadiness({
    capabilityId: "clinical-context-lens",
    environment: "production",
    dataClassification: "phi-prohibited",
    providerClass: "frontier",
    toolClass: "clinical",
    jurisdiction: "unapproved",
    evidenceReferences: [],
    approvalReferences: [],
    reviewFresh: false,
    candidateBound: false,
    rollbackAvailable: false,
    externalDistributionRequested: true
  });

  const scenarios = [syntheticModelRoute, protectedClinicalDraft, prohibitedPhiRoute];
  const summary = {
    service: "scrimed-trust-readiness-summary",
    version: scrimedTrustReadinessVersion,
    status: "INTERNAL_ENGINEERING_SIGNAL_ONLY" as const,
    decisions: {
      allowSynthetic: scenarios.filter((entry) => entry.decision === "ALLOW_SYNTHETIC").length,
      requireHuman: scenarios.filter((entry) => entry.decision === "REQUIRE_HUMAN").length,
      blocked: scenarios.filter((entry) => entry.decision === "BLOCK").length
    },
    scenarios,
    noncompensableGates: [
      "data eligibility",
      "model and tool eligibility",
      "environment authorization",
      "exact candidate binding",
      "human accountability",
      "external distribution authority"
    ],
    boundary: scrimedTrustReadinessBoundary,
    productionAuthorityGranted: false as const
  };

  return {
    ...summary,
    auditHash: createClinicalEvidenceHash(summary)
  };
}
