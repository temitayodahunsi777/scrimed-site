import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import type { PilotProfileEvaluation, PilotProfileId } from "./types";

export const p33PilotProfilePolicyVersion =
  "scrimed-p33-pilot-profiles-v1-2026-08-13";

export const p33PilotProfileBoundary =
  "Only the non-PHI controlled pilot can become technically eligible in this local candidate. PHI-capable and Linux local-agent pilots remain fail-closed until every external control is evidenced; no environment variable or local feature flag can bypass the gate.";

export type PilotProfileEvidence = {
  syntheticOrApprovedDeidentifiedData: boolean;
  applicableBaa: boolean;
  hipaaEligibleProductPath: boolean;
  freshAal2Evidence: boolean;
  tenantIsolation: boolean;
  rlsVerified: boolean;
  encryptionVerified: boolean;
  durableAuditVerified: boolean;
  retentionDeletionApproved: boolean;
  subprocessorsApproved: boolean;
  incidentHandlingApproved: boolean;
  privacySecurityReviewApproved: boolean;
  clinicalSafetyReviewApproved: boolean;
  minimumNecessaryValidated: boolean;
  officialLinuxSupportEvidence: boolean;
  localSandboxValidated: boolean;
  localFilesystemPolicyValidated: boolean;
  localNetworkPolicyValidated: boolean;
  localUpdatePolicyValidated: boolean;
  localAuditPolicyValidated: boolean;
};

const evidenceLabels: Record<keyof PilotProfileEvidence, string> = {
  syntheticOrApprovedDeidentifiedData: "synthetic-or-approved-deidentified-data",
  applicableBaa: "applicable-baa",
  hipaaEligibleProductPath: "hipaa-eligible-product-path",
  freshAal2Evidence: "fresh-aal2-evidence",
  tenantIsolation: "tenant-isolation",
  rlsVerified: "rls-verification",
  encryptionVerified: "encryption-verification",
  durableAuditVerified: "durable-audit",
  retentionDeletionApproved: "retention-and-deletion",
  subprocessorsApproved: "approved-subprocessors",
  incidentHandlingApproved: "incident-handling",
  privacySecurityReviewApproved: "privacy-security-review",
  clinicalSafetyReviewApproved: "clinical-safety-review",
  minimumNecessaryValidated: "minimum-necessary-validation",
  officialLinuxSupportEvidence: "official-linux-platform-support",
  localSandboxValidated: "local-sandbox-validation",
  localFilesystemPolicyValidated: "local-filesystem-policy",
  localNetworkPolicyValidated: "local-network-policy",
  localUpdatePolicyValidated: "local-update-policy",
  localAuditPolicyValidated: "local-audit-policy"
};

const requiredEvidenceByProfile: Record<PilotProfileId, Array<keyof PilotProfileEvidence>> = {
  NON_PHI_CONTROLLED_PILOT: [
    "syntheticOrApprovedDeidentifiedData",
    "tenantIsolation",
    "durableAuditVerified",
    "privacySecurityReviewApproved"
  ],
  PHI_CAPABLE_PILOT: [
    "applicableBaa",
    "hipaaEligibleProductPath",
    "freshAal2Evidence",
    "tenantIsolation",
    "rlsVerified",
    "encryptionVerified",
    "durableAuditVerified",
    "retentionDeletionApproved",
    "subprocessorsApproved",
    "incidentHandlingApproved",
    "privacySecurityReviewApproved",
    "clinicalSafetyReviewApproved",
    "minimumNecessaryValidated"
  ],
  LINUX_LOCAL_AGENT_PILOT: [
    "officialLinuxSupportEvidence",
    "localSandboxValidated",
    "localFilesystemPolicyValidated",
    "localNetworkPolicyValidated",
    "localUpdatePolicyValidated",
    "localAuditPolicyValidated",
    "privacySecurityReviewApproved",
    "clinicalSafetyReviewApproved"
  ]
};

export function evaluatePilotProfile(
  profileId: PilotProfileId,
  evidence: PilotProfileEvidence,
  input: { requestedEnabled: boolean }
): PilotProfileEvaluation {
  const required = requiredEvidenceByProfile[profileId];
  const missing = required.filter((key) => !evidence[key]);
  const reasonCodes = missing.map((key) => `MISSING_${evidenceLabels[key].toUpperCase().replaceAll("-", "_")}`);
  if (profileId !== "NON_PHI_CONTROLLED_PILOT") {
    reasonCodes.push("RESTRICTED_PROFILE_REQUIRES_SEPARATE_EXTERNAL_AUTHORIZATION");
  }
  if (input.requestedEnabled && reasonCodes.length) {
    reasonCodes.push("ENVIRONMENT_FLAG_CANNOT_BYPASS_PROFILE_GATE");
  }
  const status = profileId === "NON_PHI_CONTROLLED_PILOT" && reasonCodes.length === 0
    ? "PASS" as const
    : missing.length === 0
      ? "OPERATOR_REQUIRED" as const
      : "BLOCKED" as const;
  const payload = {
    profileId,
    status,
    reasonCodes: [...new Set(reasonCodes)].sort(),
    requiredEvidence: required.map((key) => evidenceLabels[key]),
    bypassAllowed: false as const,
    livePhiAllowed: false as const,
    liveClinicalOperationAllowed: false as const
  };
  return {
    ...payload,
    integrityHash: createClinicalEvidenceHash({
      type: "p33-pilot-profile-evaluation",
      version: p33PilotProfilePolicyVersion,
      evidence,
      input,
      payload
    })
  };
}

export function getP33FeatureFlags(env: NodeJS.ProcessEnv = process.env) {
  return {
    p33IntegratedUpgradesEnabled: env.SCRIMED_P33_INTEGRATED_UPGRADES_ENABLED !== "false",
    clinicalContextFabricEnabled: env.SCRIMED_P33_CONTEXT_FABRIC_ENABLED !== "false",
    clinicalSignalCompressionEnabled: env.SCRIMED_P33_CLINICAL_SIGNAL_COMPRESSION_ENABLED !== "false",
    decisionEvidenceLedgerEnabled: env.SCRIMED_P33_DECISION_LEDGER_ENABLED !== "false",
    oversightDriftSentinelEnabled: env.SCRIMED_P33_OVERSIGHT_SENTINEL_ENABLED !== "false",
    traceToEvalFoundryEnabled: env.SCRIMED_P33_TRACE_TO_EVAL_ENABLED !== "false",
    ruralTransformationEnabled: env.SCRIMED_P33_RURAL_TRANSFORMATION_ENABLED !== "false",
    vendorContinuityEnabled: env.SCRIMED_P33_VENDOR_CONTINUITY_ENABLED !== "false",
    hybridPlacementEnabled: env.SCRIMED_P33_HYBRID_PLACEMENT_ENABLED !== "false",
    ruralCareSignalEnabled: false,
    epaReadinessEnabled: false,
    qpaReplayEnabled: false,
    paceRateLensEnabled: false,
    clinicianReengagementEnabled: false,
    externalProviderCallsEnabled: false,
    externalOutreachEnabled: false,
    payerSubmissionEnabled: false,
    ehrWritebackEnabled: false,
    livePhiEnabled: false,
    liveClinicalOperationEnabled: false,
    phiCapablePilotEnabled: false,
    linuxLocalAgentPilotEnabled: false,
    productionTraceMiningEnabled: false
  } as const;
}

export const p33FeatureFlagDefaults = {
  SCRIMED_P33_INTEGRATED_UPGRADES_ENABLED: "true",
  SCRIMED_P33_CONTEXT_FABRIC_ENABLED: "true",
  SCRIMED_P33_CLINICAL_SIGNAL_COMPRESSION_ENABLED: "true",
  SCRIMED_P33_DECISION_LEDGER_ENABLED: "true",
  SCRIMED_P33_OVERSIGHT_SENTINEL_ENABLED: "true",
  SCRIMED_P33_TRACE_TO_EVAL_ENABLED: "true",
  SCRIMED_P33_RURAL_TRANSFORMATION_ENABLED: "true",
  SCRIMED_P33_VENDOR_CONTINUITY_ENABLED: "true",
  SCRIMED_P33_HYBRID_PLACEMENT_ENABLED: "true",
  SCRIMED_P33_RURAL_CARE_SIGNAL_ENABLED: "false",
  SCRIMED_P33_EPA_READINESS_ENABLED: "false",
  SCRIMED_P33_QPA_REPLAY_ENABLED: "false",
  SCRIMED_P33_PACE_RATE_LENS_ENABLED: "false",
  SCRIMED_P33_CLINICIAN_REENGAGEMENT_ENABLED: "false",
  SCRIMED_P33_EXTERNAL_PROVIDER_CALLS_ENABLED: "false",
  SCRIMED_P33_EXTERNAL_OUTREACH_ENABLED: "false",
  SCRIMED_P33_LIVE_PHI_ENABLED: "false",
  SCRIMED_P33_LIVE_CLINICAL_OPERATION_ENABLED: "false",
  SCRIMED_P33_PHI_CAPABLE_PILOT_ENABLED: "false",
  SCRIMED_P33_LINUX_LOCAL_AGENT_PILOT_ENABLED: "false",
  SCRIMED_P33_PRODUCTION_TRACE_MINING_ENABLED: "false"
} as const;

export function getP33PilotProfileSummary() {
  const nonPhiEvidence: PilotProfileEvidence = {
    syntheticOrApprovedDeidentifiedData: true,
    applicableBaa: false,
    hipaaEligibleProductPath: false,
    freshAal2Evidence: false,
    tenantIsolation: true,
    rlsVerified: false,
    encryptionVerified: false,
    durableAuditVerified: true,
    retentionDeletionApproved: false,
    subprocessorsApproved: false,
    incidentHandlingApproved: false,
    privacySecurityReviewApproved: true,
    clinicalSafetyReviewApproved: false,
    minimumNecessaryValidated: false,
    officialLinuxSupportEvidence: false,
    localSandboxValidated: true,
    localFilesystemPolicyValidated: true,
    localNetworkPolicyValidated: true,
    localUpdatePolicyValidated: false,
    localAuditPolicyValidated: true
  };
  return {
    version: p33PilotProfilePolicyVersion,
    featureFlags: getP33FeatureFlags(),
    environmentDefaults: p33FeatureFlagDefaults,
    profiles: [
      evaluatePilotProfile("NON_PHI_CONTROLLED_PILOT", nonPhiEvidence, { requestedEnabled: true }),
      evaluatePilotProfile("PHI_CAPABLE_PILOT", nonPhiEvidence, { requestedEnabled: true }),
      evaluatePilotProfile("LINUX_LOCAL_AGENT_PILOT", nonPhiEvidence, { requestedEnabled: true })
    ],
    boundary: p33PilotProfileBoundary
  };
}
