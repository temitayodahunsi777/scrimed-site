import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";
import type { PolicyDecision } from "./scrimed-work/p32Contracts";

export const scrimedP32ApplicationRationalizationVersion = "scrimed-p32-application-rationalization-v1-2026-07-20";

export const scrimedP32ApplicationRationalizationBoundary =
  "Application rationalization produces evidence-backed recommendations only. It cannot retire software, terminate a contract, migrate data, change a vendor, or override legal, security, clinical, retention, recovery, or workflow-owner review.";

export type ApplicationDisposition = "retain" | "consolidate" | "archive" | "replace" | "retire";
export type RiskRating = "low" | "moderate" | "high" | "critical";

export type UsageEvidence = {
  activeUsers30Days: number;
  workflowExecutions30Days: number;
  lastObservedAt: string;
  telemetryCoverage: number;
  sourceReference: string;
};

export type InterfaceRecord = {
  interfaceId: string;
  standard: string;
  direction: "inbound" | "outbound" | "bidirectional";
  criticality: RiskRating;
  replacementValidated: boolean;
};

export type PortabilityAssessment = {
  exportAvailable: boolean;
  exportFormat: string;
  exportTested: boolean;
  vendorIndependentRecoveryTested: boolean;
  estimatedTransitionDays: number;
  evidenceReference: string;
};

export type ApplicationRecord = {
  applicationId: string;
  tenantId: string;
  owner: string;
  workflows: string[];
  userEvidence: UsageEvidence;
  dataClasses: string[];
  interfaces: InterfaceRecord[];
  dependencies: string[];
  annualCost?: number;
  cyberRisk: RiskRating;
  clinicalCriticality: RiskRating;
  evidenceOfValue: string[];
  portability: PortabilityAssessment;
  requestedDisposition?: ApplicationDisposition;
};

export type ApplicationRetirementEvidence = {
  exportComplete: boolean;
  retentionPlanApproved: boolean;
  exportHashVerified: boolean;
  replacementValidated: boolean;
  rollbackTested: boolean;
  downtimePlanApproved: boolean;
  recoveryTested: boolean;
  legalReviewComplete: boolean;
  securityReviewComplete: boolean;
  clinicalOwnerApprovalComplete: boolean;
  workflowOwnerApprovalComplete: boolean;
  evidencePointers: string[];
};

export type ApplicationDispositionDecision = {
  applicationId: string;
  recommendation: ApplicationDisposition;
  decision: PolicyDecision;
  reasonCodes: string[];
  retirementEligibleForHumanApproval: boolean;
  retirementExecuted: false;
  rollbackRequired: boolean;
  evidencePointers: string[];
  auditHash: string;
};

export type VendorChangeEventType =
  | "acquisition-change-of-control"
  | "api-restriction"
  | "terms-of-service-change"
  | "baa-change"
  | "subprocessor-change"
  | "residency-change"
  | "pricing-change"
  | "service-degradation"
  | "roadmap-discontinuation";

export type VendorChangeEvent = {
  eventId: string;
  vendorId: string;
  type: VendorChangeEventType;
  material: boolean;
  detectedAt: string;
  evidenceReference: string;
  reviewed: boolean;
  approved: boolean;
  portabilityRouteId: string | null;
  affectedWorkflows: string[];
};

export type VendorChangeDecision = {
  eventId: string;
  decision: PolicyDecision;
  newDeploymentsAllowed: boolean;
  writesFrozen: boolean;
  requiredReviewLanes: Array<"legal" | "security" | "clinical" | "privacy" | "portability" | "finance">;
  reasonCodes: string[];
  auditHash: string;
};

function retirementChecks(evidence: ApplicationRetirementEvidence) {
  return {
    EXPORT_COMPLETE: evidence.exportComplete,
    RETENTION_PLAN_APPROVED: evidence.retentionPlanApproved,
    EXPORT_HASH_VERIFIED: evidence.exportHashVerified,
    REPLACEMENT_VALIDATED: evidence.replacementValidated,
    ROLLBACK_TESTED: evidence.rollbackTested,
    DOWNTIME_PLAN_APPROVED: evidence.downtimePlanApproved,
    RECOVERY_TESTED: evidence.recoveryTested,
    LEGAL_REVIEW_COMPLETE: evidence.legalReviewComplete,
    SECURITY_REVIEW_COMPLETE: evidence.securityReviewComplete,
    CLINICAL_OWNER_APPROVAL_COMPLETE: evidence.clinicalOwnerApprovalComplete,
    WORKFLOW_OWNER_APPROVAL_COMPLETE: evidence.workflowOwnerApprovalComplete
  };
}

export function evaluateApplicationDisposition(input: {
  application: ApplicationRecord;
  retirementEvidence: ApplicationRetirementEvidence;
}): ApplicationDispositionDecision {
  const { application, retirementEvidence } = input;
  const reasonCodes: string[] = [];
  if (!application.owner || application.workflows.length === 0) reasonCodes.push("OWNERSHIP_OR_WORKFLOW_MAP_INCOMPLETE");
  if (application.userEvidence.telemetryCoverage < 0.8) reasonCodes.push("USAGE_TELEMETRY_INSUFFICIENT");
  if (application.evidenceOfValue.length === 0) reasonCodes.push("VALUE_EVIDENCE_MISSING");
  if (application.dependencies.length > 0 && !application.portability.vendorIndependentRecoveryTested) {
    reasonCodes.push("DEPENDENCY_PORTABILITY_UNPROVEN");
  }

  const requested = application.requestedDisposition;
  let recommendation: ApplicationDisposition = requested ?? "retain";
  if (!requested) {
    if (application.userEvidence.workflowExecutions30Days === 0 && application.clinicalCriticality === "low") recommendation = "archive";
    else if (application.cyberRisk === "critical" && application.portability.exportTested) recommendation = "replace";
    else recommendation = "retain";
  }

  const checks = retirementChecks(retirementEvidence);
  const failedRetirementChecks = Object.entries(checks).filter(([, passed]) => !passed).map(([code]) => code);
  const retirementRequested = recommendation === "retire";
  if (retirementRequested && failedRetirementChecks.length) {
    reasonCodes.push(...failedRetirementChecks.map((code) => `RETIREMENT_${code}_REQUIRED`));
  }
  if (retirementRequested && application.clinicalCriticality === "critical" && !retirementEvidence.clinicalOwnerApprovalComplete) {
    reasonCodes.push("CRITICAL_CLINICAL_APPLICATION_FAIL_CLOSED");
  }
  const retirementEligibleForHumanApproval = retirementRequested && failedRetirementChecks.length === 0;
  const decision: PolicyDecision = retirementRequested
    ? retirementEligibleForHumanApproval
      ? "REQUIRE_HUMAN"
      : "BLOCK"
    : reasonCodes.length
      ? "REQUIRE_HUMAN"
      : "ALLOW";
  const withoutHash = {
    applicationId: application.applicationId,
    recommendation,
    decision,
    reasonCodes: reasonCodes.length ? [...new Set(reasonCodes)] : ["EVIDENCE_BASED_DISPOSITION_READY"],
    retirementEligibleForHumanApproval,
    retirementExecuted: false as const,
    rollbackRequired: recommendation !== "retain",
    evidencePointers: [...new Set([
      application.userEvidence.sourceReference,
      application.portability.evidenceReference,
      ...application.evidenceOfValue,
      ...retirementEvidence.evidencePointers
    ])].sort()
  };
  return { ...withoutHash, auditHash: createClinicalEvidenceHash({ application, retirementEvidence, decision: withoutHash }) };
}

export function evaluateVendorChangeEvent(event: VendorChangeEvent): VendorChangeDecision {
  const requiredReviewLanes = [...new Set([
    "legal" as const,
    "security" as const,
    "portability" as const,
    ...(event.type === "baa-change" || event.type === "subprocessor-change" || event.type === "residency-change"
      ? ["privacy" as const]
      : []),
    ...(event.affectedWorkflows.some((workflow) => /clinical|patient|care|imaging/i.test(workflow))
      ? ["clinical" as const]
      : []),
    ...(event.type === "pricing-change" ? ["finance" as const] : [])
  ])];
  const unresolvedMaterial = event.material && (!event.reviewed || !event.approved);
  const portabilityMissing = event.material && !event.portabilityRouteId;
  const decision: PolicyDecision = unresolvedMaterial || portabilityMissing
    ? "BLOCK"
    : event.material
      ? "REQUIRE_HUMAN"
      : "ALLOW";
  const reasonCodes = [
    ...(unresolvedMaterial ? ["MATERIAL_VENDOR_CHANGE_UNRESOLVED"] : []),
    ...(portabilityMissing ? ["PORTABILITY_ROUTE_REQUIRED"] : []),
    ...(event.material && event.reviewed && event.approved ? ["MATERIAL_CHANGE_APPROVED_REAUTHORIZATION_REQUIRED"] : []),
    ...(!event.material ? ["NONMATERIAL_CHANGE_MONITOR"] : [])
  ];
  const withoutHash = {
    eventId: event.eventId,
    decision,
    newDeploymentsAllowed: decision === "ALLOW",
    writesFrozen: decision !== "ALLOW",
    requiredReviewLanes,
    reasonCodes
  };
  return { ...withoutHash, auditHash: createClinicalEvidenceHash({ event, decision: withoutHash }) };
}

export type ExternalVendorClaimHypothesis = {
  hypothesisId: string;
  vendorId: string;
  claim: string;
  sourceReference: string;
  sourceKind: "vendor-case-study" | "social-media" | "press-release" | "independent-research";
  status: "unverified-external-hypothesis";
  eligibleForClinicalOrCommercialClaim: false;
  requiredScrimedEvidence: string[];
  auditHash: string;
};

export function recordExternalVendorClaimHypothesis(
  input: Omit<ExternalVendorClaimHypothesis, "status" | "eligibleForClinicalOrCommercialClaim" | "auditHash">
): ExternalVendorClaimHypothesis {
  const withoutHash = {
    ...input,
    status: "unverified-external-hypothesis" as const,
    eligibleForClinicalOrCommercialClaim: false as const
  };
  return { ...withoutHash, auditHash: createClinicalEvidenceHash(withoutHash) };
}
