export const faithCorePublicCopy = {
  heading: "FaithCore — Optional Faith-Aligned Experience",
  body:
    "FaithCore is an optional, user-selected experience for individuals and organizations seeking faith-aligned engagement. It does not influence diagnosis, treatment, clinical recommendations, eligibility, prioritization, risk scoring, or access to care.",
  supportingStatement:
    "FaithCore is not a medical service and does not modify clinical logic or healthcare decisions.",
  cta: "Explore Optional FaithCore Experience",
  seoTitle: "FaithCore by SCRIMED | Optional Faith-Aligned Care Experience",
  metaDescription:
    "FaithCore is an optional, user-selected faith-aligned experience. It does not influence diagnosis, treatment, eligibility, prioritization, risk scoring, medical recommendations, or access to care."
} as const;

export type FaithCoreRequestedUse =
  | "faith-aligned-engagement"
  | "clinical-logic"
  | "operational-decision"
  | "diagnosis"
  | "treatment"
  | "eligibility"
  | "prioritization"
  | "risk-scoring"
  | "medical-recommendation"
  | "access-to-care";

export type FaithCoreUseDecision = {
  allowed: boolean;
  decision: "ALLOW" | "BLOCK";
  reasonCode: "optional-engagement-allowed" | "explicit-opt-in-required" | "clinical-influence-prohibited";
  humanReviewRequired: boolean;
  clinicalDecisionAuthority: false;
  operationalDecisionAuthority: false;
};

export function evaluateFaithCoreUse(input: {
  userSelected: boolean;
  requestedUse: FaithCoreRequestedUse;
}): FaithCoreUseDecision {
  if (!input.userSelected) {
    return {
      allowed: false,
      decision: "BLOCK",
      reasonCode: "explicit-opt-in-required",
      humanReviewRequired: false,
      clinicalDecisionAuthority: false,
      operationalDecisionAuthority: false
    };
  }

  if (input.requestedUse !== "faith-aligned-engagement") {
    return {
      allowed: false,
      decision: "BLOCK",
      reasonCode: "clinical-influence-prohibited",
      humanReviewRequired: true,
      clinicalDecisionAuthority: false,
      operationalDecisionAuthority: false
    };
  }

  return {
    allowed: true,
    decision: "ALLOW",
    reasonCode: "optional-engagement-allowed",
    humanReviewRequired: false,
    clinicalDecisionAuthority: false,
    operationalDecisionAuthority: false
  };
}

export function getFaithCoreBoundarySummary() {
  return {
    service: "scrimed-faithcore-boundary",
    status: "optional-user-selected-only",
    optInRequired: true,
    clinicalDecisionAuthority: false as const,
    operationalDecisionAuthority: false as const,
    allowedUse: "faith-aligned-engagement" as const,
    prohibitedUses: [
      "clinical-logic",
      "operational-decision",
      "diagnosis",
      "treatment",
      "eligibility",
      "prioritization",
      "risk-scoring",
      "medical-recommendation",
      "access-to-care"
    ] as const,
    copy: faithCorePublicCopy
  };
}
