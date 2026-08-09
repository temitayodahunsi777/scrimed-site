import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import {
  createPatientDataGrant,
  revokePatientDataGrant,
  type PatientDataGrant
} from "../scrimedP32PatientRecords";
import type { PolicyDecision } from "./p32Contracts";

export const scrimedP32HumanGovernanceVersion =
  "scrimed-p32-human-governance-v1-2026-07-30";

export const scrimedP32HumanGovernanceBoundary =
  "SCRIMED p.32 human governance keeps consent, communication, clinical capability, launch, and value evidence attributable and reviewable. Engagement, marketplace status, or unsigned metrics cannot override safety or authorize clinical production.";

export type PatientConsentGrant = PatientDataGrant;
export const createPatientConsentGrant = createPatientDataGrant;
export const revokePatientConsentGrant = revokePatientDataGrant;

export type EngagementObjective = {
  objectiveId: string;
  tenantId: string;
  purpose: string;
  consentGrantId: string;
  meaningfulOutcomeMetricIds: string[];
  prohibitedOptimizationMetrics: string[];
  safetyConstraints: string[];
  objectiveHash: string;
};

export function buildEngagementObjective(
  input: Omit<EngagementObjective, "objectiveHash">
): EngagementObjective {
  if (
    !input.objectiveId.trim() ||
    !input.tenantId.trim() ||
    !input.purpose.trim() ||
    !input.consentGrantId.trim() ||
    !input.meaningfulOutcomeMetricIds.length ||
    !input.safetyConstraints.length
  ) {
    throw new Error("Engagement objectives require purpose, consent, outcomes, and safety");
  }
  const payload = {
    ...input,
    meaningfulOutcomeMetricIds: [
      ...new Set(input.meaningfulOutcomeMetricIds)
    ].sort(),
    prohibitedOptimizationMetrics: [
      ...new Set(input.prohibitedOptimizationMetrics)
    ].sort(),
    safetyConstraints: [...new Set(input.safetyConstraints)].sort()
  };
  return {
    ...payload,
    objectiveHash: createClinicalEvidenceHash({
      type: "engagement-objective",
      payload
    })
  };
}

export type CommunicationDeliveryPolicy = {
  policyId: string;
  tenantId: string;
  purpose: string;
  consentGrantId: string;
  allowedChannels: Array<"in-app" | "sms" | "email" | "voice">;
  quietHours: { startsAtLocalHour: number; endsAtLocalHour: number };
  maximumContactsPerDay: number;
  maximumContactsPerWeek: number;
  accessibilityPreferences: string[];
  languagePreferences: string[];
  urgentEscalationRole: string;
  emailAuthentication: {
    spf: "verified" | "unverified" | "not-applicable";
    dkim: "verified" | "unverified" | "not-applicable";
    dmarc: "verified" | "unverified" | "not-applicable";
  };
  phiSafeOutboundOnly: true;
  automaticSendAllowed: false;
  engagementMetricsCanOverrideSafety: false;
  policyHash: string;
};

export function buildCommunicationDeliveryPolicy(
  input: Omit<
    CommunicationDeliveryPolicy,
    | "phiSafeOutboundOnly"
    | "automaticSendAllowed"
    | "engagementMetricsCanOverrideSafety"
    | "policyHash"
  >
): CommunicationDeliveryPolicy {
  if (
    !input.policyId.trim() ||
    !input.tenantId.trim() ||
    !input.purpose.trim() ||
    !input.consentGrantId.trim() ||
    !input.allowedChannels.length ||
    !input.urgentEscalationRole.trim()
  ) {
    throw new Error("Communication policy requires purpose, consent, channel, and escalation");
  }
  if (
    !Number.isInteger(input.quietHours.startsAtLocalHour) ||
    !Number.isInteger(input.quietHours.endsAtLocalHour) ||
    input.quietHours.startsAtLocalHour < 0 ||
    input.quietHours.startsAtLocalHour > 23 ||
    input.quietHours.endsAtLocalHour < 0 ||
    input.quietHours.endsAtLocalHour > 23 ||
    !Number.isInteger(input.maximumContactsPerDay) ||
    !Number.isInteger(input.maximumContactsPerWeek) ||
    input.maximumContactsPerDay < 0 ||
    input.maximumContactsPerWeek < input.maximumContactsPerDay
  ) {
    throw new Error("Communication quiet hours or fatigue budgets are invalid");
  }
  const payload = {
    ...input,
    allowedChannels: [...new Set(input.allowedChannels)].sort(),
    accessibilityPreferences: [
      ...new Set(input.accessibilityPreferences)
    ].sort(),
    languagePreferences: [...new Set(input.languagePreferences)].sort(),
    phiSafeOutboundOnly: true as const,
    automaticSendAllowed: false as const,
    engagementMetricsCanOverrideSafety: false as const
  };
  return {
    ...payload,
    policyHash: createClinicalEvidenceHash({
      type: "communication-delivery-policy",
      payload
    })
  };
}

export function evaluateCommunicationDelivery(input: {
  objective: EngagementObjective;
  policy: CommunicationDeliveryPolicy;
  consent: PatientConsentGrant;
  localHour: number;
  contactsToday: number;
  contactsThisWeek: number;
  requestedChannel: CommunicationDeliveryPolicy["allowedChannels"][number];
  containsPhiOrSensitiveClinicalContent: boolean;
  urgent: boolean;
}): {
  decision: PolicyDecision;
  reasonCodes: string[];
  humanSendAuthorizationRequired: true;
  auditHash: string;
} {
  const reasonCodes: string[] = [];
  if (
    input.objective.tenantId !== input.policy.tenantId ||
    input.policy.tenantId !== input.consent.tenantId ||
    input.objective.consentGrantId !== input.consent.grantId ||
    input.policy.consentGrantId !== input.consent.grantId
  ) {
    reasonCodes.push("COMMUNICATION_CONSENT_OR_TENANT_MISMATCH");
  }
  if (input.consent.state !== "active") reasonCodes.push("COMMUNICATION_CONSENT_INACTIVE");
  if (!input.policy.allowedChannels.includes(input.requestedChannel)) {
    reasonCodes.push("COMMUNICATION_CHANNEL_NOT_ALLOWED");
  }
  const { startsAtLocalHour, endsAtLocalHour } = input.policy.quietHours;
  const inQuietHours =
    startsAtLocalHour > endsAtLocalHour
      ? input.localHour >= startsAtLocalHour || input.localHour < endsAtLocalHour
      : input.localHour >= startsAtLocalHour && input.localHour < endsAtLocalHour;
  if (inQuietHours && !input.urgent) reasonCodes.push("COMMUNICATION_QUIET_HOURS");
  if (
    input.contactsToday >= input.policy.maximumContactsPerDay ||
    input.contactsThisWeek >= input.policy.maximumContactsPerWeek
  ) {
    reasonCodes.push("COMMUNICATION_FATIGUE_BUDGET_EXCEEDED");
  }
  if (input.containsPhiOrSensitiveClinicalContent) {
    reasonCodes.push("UNSAFE_OUTBOUND_CLINICAL_CONTENT_BLOCKED");
  }
  if (
    input.requestedChannel === "email" &&
    ["spf", "dkim", "dmarc"].some(
      (key) =>
        input.policy.emailAuthentication[
          key as keyof CommunicationDeliveryPolicy["emailAuthentication"]
        ] !== "verified"
    )
  ) {
    reasonCodes.push("OUTBOUND_EMAIL_AUTHENTICATION_UNVERIFIED");
  }
  const hardBlock = reasonCodes.some((reason) =>
    [
      "COMMUNICATION_CONSENT_OR_TENANT_MISMATCH",
      "COMMUNICATION_CONSENT_INACTIVE",
      "COMMUNICATION_CHANNEL_NOT_ALLOWED",
      "COMMUNICATION_FATIGUE_BUDGET_EXCEEDED",
      "UNSAFE_OUTBOUND_CLINICAL_CONTENT_BLOCKED",
      "OUTBOUND_EMAIL_AUTHENTICATION_UNVERIFIED"
    ].includes(reason)
  );
  const decision: PolicyDecision = hardBlock
    ? "BLOCK"
    : "REQUIRE_HUMAN";
  const payload = {
    decision,
    reasonCodes: reasonCodes.length
      ? [...new Set(reasonCodes)].sort()
      : ["HUMAN_SEND_AUTHORIZATION_REQUIRED"],
    humanSendAuthorizationRequired: true as const
  };
  return {
    ...payload,
    auditHash: createClinicalEvidenceHash({
      type: "communication-delivery-decision",
      objectiveHash: input.objective.objectiveHash,
      policyHash: input.policy.policyHash,
      consentHash: input.consent.grantHash,
      payload
    })
  };
}

export type CompetencyEvidence = {
  evidenceId: string;
  roleId: string;
  siteId: string;
  deviceOrProtocolId: string | null;
  evidenceDigest: string;
  supervisorIdentityHash: string;
  status: "current" | "expired" | "remediation-required";
  issuedAt: string;
  expiresAt: string;
};

export type RoleCapabilityProfile = {
  roleId: string;
  permittedCapabilityIds: string[];
  prohibitedActions: string[];
  minimumCompetencyEvidenceCount: number;
};

export type ClinicalCapabilityRegistry = {
  registryId: string;
  capabilityId: string;
  intendedUse: string;
  modality: string;
  jurisdiction: string;
  regulatoryEvidenceStatus: "unverified" | "review-required" | "externally-verified";
  interoperabilityRequirements: string[];
  siteValidationRequired: true;
  driftMonitoringRequired: true;
  evidenceGrade: "low" | "moderate" | "high" | "ungraded";
  responsibleOwnerRole: string;
  marketplaceListingIsApproval: false;
  registryHash: string;
};

export function buildClinicalCapabilityRegistry(
  input: Omit<
    ClinicalCapabilityRegistry,
    | "siteValidationRequired"
    | "driftMonitoringRequired"
    | "marketplaceListingIsApproval"
    | "registryHash"
  >
): ClinicalCapabilityRegistry {
  if (
    !input.registryId.trim() ||
    !input.capabilityId.trim() ||
    !input.intendedUse.trim() ||
    !input.modality.trim() ||
    !input.jurisdiction.trim() ||
    !input.interoperabilityRequirements.length ||
    !input.responsibleOwnerRole.trim()
  ) {
    throw new Error("Clinical capability registry entries require intended use, jurisdiction, integration, and ownership");
  }
  const payload = {
    ...input,
    interoperabilityRequirements: [
      ...new Set(input.interoperabilityRequirements)
    ].sort(),
    siteValidationRequired: true as const,
    driftMonitoringRequired: true as const,
    marketplaceListingIsApproval: false as const
  };
  return {
    ...payload,
    registryHash: createClinicalEvidenceHash({
      type: "clinical-capability-registry",
      payload
    })
  };
}

export type ClinicalLaunchCell = {
  launchCellId: string;
  tenantId: string;
  clinicalSponsorIdentityHash: string | null;
  workflowOwnerIdentityHash: string | null;
  patientEducationOrDomainSpecialistIdentityHash: string | null;
  privacySecurityOwnerIdentityHash: string | null;
  integrationOwnerIdentityHash: string | null;
  evaluationSafetyOwnerIdentityHash: string | null;
  intendedUse: string;
  prohibitedUse: string[];
  exceptionReviewReferences: string[];
  contentFreshnessEvidence: string[];
  syntheticSimulationEvidence: string[];
  signedAcceptanceCriteriaDigest: string | null;
  decision: PolicyDecision;
  reasonCodes: string[];
  productionActivationAllowed: false;
  launchCellHash: string;
};

export function buildClinicalLaunchCell(
  input: Omit<
    ClinicalLaunchCell,
    "decision" | "reasonCodes" | "productionActivationAllowed" | "launchCellHash"
  >
): ClinicalLaunchCell {
  const reasonCodes: string[] = [];
  if (
    [
      input.clinicalSponsorIdentityHash,
      input.workflowOwnerIdentityHash,
      input.patientEducationOrDomainSpecialistIdentityHash,
      input.privacySecurityOwnerIdentityHash,
      input.integrationOwnerIdentityHash,
      input.evaluationSafetyOwnerIdentityHash
    ].some((identity) => identity === null)
  ) {
    reasonCodes.push("CLINICAL_LAUNCH_ROLES_INCOMPLETE");
  }
  if (!input.intendedUse.trim() || !input.prohibitedUse.length) {
    reasonCodes.push("CLINICAL_INTENDED_AND_PROHIBITED_USE_REQUIRED");
  }
  if (
    !input.exceptionReviewReferences.length ||
    !input.contentFreshnessEvidence.length ||
    !input.syntheticSimulationEvidence.length
  ) {
    reasonCodes.push("CLINICAL_CHANGE_MANAGEMENT_EVIDENCE_REQUIRED");
  }
  if (!input.signedAcceptanceCriteriaDigest) {
    reasonCodes.push("SIGNED_ACCEPTANCE_CRITERIA_REQUIRED");
  }
  const payload = {
    ...input,
    prohibitedUse: [...new Set(input.prohibitedUse)].sort(),
    exceptionReviewReferences: [...new Set(input.exceptionReviewReferences)].sort(),
    contentFreshnessEvidence: [...new Set(input.contentFreshnessEvidence)].sort(),
    syntheticSimulationEvidence: [...new Set(input.syntheticSimulationEvidence)].sort(),
    decision: reasonCodes.length ? ("REQUIRE_HUMAN" as const) : ("ALLOW" as const),
    reasonCodes: reasonCodes.length
      ? [...new Set(reasonCodes)].sort()
      : ["CLINICAL_LAUNCH_CELL_READY_FOR_EXTERNAL_REVIEW"],
    productionActivationAllowed: false as const
  };
  return {
    ...payload,
    launchCellHash: createClinicalEvidenceHash({
      type: "clinical-launch-cell",
      payload
    })
  };
}

export type AIValueCase = {
  valueCaseId: string;
  tenantId: string;
  workflowId: string;
  baselineEvidenceDigest: string;
  outcomeEvidenceDigests: string[];
  clinicianTimeReturnedMinutes: number;
  correctionCount: number;
  overrideCount: number;
  escalationCount: number;
  abandonmentCount: number;
  totalCostUsd: number;
  validatedSuccessfulTaskCount: number;
  costPerValidatedSuccessfulTaskUsd: number | null;
  evidenceStrength: "low" | "moderate" | "high";
  valueCaseHash: string;
};

export function buildAIValueCase(
  input: Omit<AIValueCase, "costPerValidatedSuccessfulTaskUsd" | "valueCaseHash">
): AIValueCase {
  const numeric = [
    input.clinicianTimeReturnedMinutes,
    input.correctionCount,
    input.overrideCount,
    input.escalationCount,
    input.abandonmentCount,
    input.totalCostUsd,
    input.validatedSuccessfulTaskCount
  ];
  if (numeric.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error("AI value case measures must be finite and nonnegative");
  }
  const payload = {
    ...input,
    outcomeEvidenceDigests: [...new Set(input.outcomeEvidenceDigests)].sort(),
    costPerValidatedSuccessfulTaskUsd:
      input.validatedSuccessfulTaskCount > 0
        ? input.totalCostUsd / input.validatedSuccessfulTaskCount
        : null
  };
  return {
    ...payload,
    valueCaseHash: createClinicalEvidenceHash({ type: "ai-value-case", payload })
  };
}

export type BenefitsRealizationReview = {
  reviewId: string;
  valueCaseHash: string;
  intervalDays: 30 | 90 | 120;
  accountableOwnerIdentityHash: string;
  signedEvidenceDigest: string | null;
  decision: "continue" | "pause" | "rollback" | "external-review-required";
  reviewHash: string;
};

export function buildBenefitsRealizationReview(
  input: Omit<BenefitsRealizationReview, "decision" | "reviewHash">
): BenefitsRealizationReview {
  const decision = input.signedEvidenceDigest
    ? ("external-review-required" as const)
    : ("pause" as const);
  const payload = { ...input, decision };
  return {
    ...payload,
    reviewHash: createClinicalEvidenceHash({
      type: "benefits-realization-review",
      payload
    })
  };
}

export type BoardOutcomeSnapshot = {
  snapshotId: string;
  valueCaseHash: string;
  benefitsReviewHash: string;
  metrics: Array<{
    metricId: string;
    value: number;
    evidenceDigest: string;
    evidenceSignatureDigest: string | null;
  }>;
  publishable: boolean;
  reasonCodes: string[];
  snapshotHash: string;
};

export function buildBoardOutcomeSnapshot(
  input: Omit<BoardOutcomeSnapshot, "publishable" | "reasonCodes" | "snapshotHash">
): BoardOutcomeSnapshot {
  if (!input.metrics.length) throw new Error("Board outcome snapshot requires metrics");
  const reasonCodes = input.metrics.some((metric) => !metric.evidenceSignatureDigest)
    ? ["BOARD_METRIC_SIGNED_EVIDENCE_REQUIRED"]
    : [];
  const payload = {
    ...input,
    metrics: [...input.metrics].sort((left, right) =>
      left.metricId.localeCompare(right.metricId)
    ),
    publishable: reasonCodes.length === 0,
    reasonCodes: reasonCodes.length
      ? reasonCodes
      : ["BOARD_METRICS_RESOLVE_TO_SIGNED_EVIDENCE"]
  };
  return {
    ...payload,
    snapshotHash: createClinicalEvidenceHash({
      type: "board-outcome-snapshot",
      payload
    })
  };
}

export type MarketSignal = {
  signalId: string;
  sourceUrl: string;
  sourceType:
    | "primary-source"
    | "vendor-announcement"
    | "social-media"
    | "funding-announcement"
    | "market-analysis";
  claimDigest: string;
  corroboratingSourceDigests: string[];
  confidence: number;
  trustedConfigurationEligible: false;
  productClaimEligible: false;
  signalHash: string;
};

export function buildMarketSignal(
  input: Omit<
    MarketSignal,
    "trustedConfigurationEligible" | "productClaimEligible" | "signalHash"
  >
): MarketSignal {
  if (
    !input.signalId.trim() ||
    !input.sourceUrl.trim() ||
    !Number.isFinite(input.confidence) ||
    input.confidence < 0 ||
    input.confidence > 1
  ) {
    throw new Error("Market signals require source identity and bounded confidence");
  }
  const payload = {
    ...input,
    corroboratingSourceDigests: [
      ...new Set(input.corroboratingSourceDigests)
    ].sort(),
    trustedConfigurationEligible: false as const,
    productClaimEligible: false as const
  };
  return {
    ...payload,
    signalHash: createClinicalEvidenceHash({ type: "market-signal", payload })
  };
}

export function getP32HumanGovernanceSummary() {
  return {
    version: scrimedP32HumanGovernanceVersion,
    patientConsent: "purpose-bound-revocable",
    communication: "human-authorized-quiet-hours-fatigue-bounded",
    clinicalLaunch: "named-multidisciplinary-owners-and-synthetic-simulation",
    boardMetrics: "signed-evidence-required",
    marketSignals: "hypothesis-ledger-only",
    automaticOutboundCommunicationAllowed: false,
    productionClinicalActivationAllowed: false,
    boundary: scrimedP32HumanGovernanceBoundary
  } as const;
}
