import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";
import type { PolicyDecision } from "./scrimed-work/p32Contracts";

export const scrimedP32CarePolicyVersion = "scrimed-p32-care-context-policy-v1-2026-07-20";

export const scrimedP32CarePolicyBoundary =
  "Care-context policy grants bounded decision-support and administrative preparation only. It never grants autonomous diagnosis, prescribing, medical orders, patient disposition, payer submission, EHR writeback, or customer go-live authority.";

export type CareContext =
  | "ambulatory_self_service"
  | "ambulatory_clinician"
  | "acute_clinician"
  | "acute_critical";

export type TaskRisk = "low" | "moderate" | "high" | "prohibited";

export type CareCapability =
  | "education"
  | "scheduling-read"
  | "scheduling-draft"
  | "reminder-draft"
  | "documentation-draft"
  | "longitudinal-navigation"
  | "clinical-context-read"
  | "evidence-summary"
  | "alert-preparation"
  | "patient-outreach"
  | "diagnosis"
  | "prescribing"
  | "medical-order"
  | "patient-disposition"
  | "payer-submission"
  | "ehr-writeback";

export type CarePolicyRequest = {
  requestId: string;
  tenantId: string;
  actor: { actorId: string; role: string; authenticated: boolean };
  context: CareContext;
  taskRisk: TaskRisk;
  requestedAction: string;
  requestedCapabilities: CareCapability[];
  patientFacing: boolean;
  currentClinicalContextAvailable: boolean;
  contextFreshnessMinutes: number | null;
  evidencePointers: string[];
  identityCertain: boolean;
  contradictoryEvidence: boolean;
  redFlagDetected: boolean;
  worseningSymptomsReported: boolean;
  clinicianConfirmation: boolean;
  signedHumanAuthorization: boolean;
  correlationId: string;
};

export type CarePolicyDecision = {
  policyVersion: typeof scrimedP32CarePolicyVersion;
  requestId: string;
  tenantId: string;
  careContext: CareContext;
  taskRisk: TaskRisk;
  decision: PolicyDecision;
  grantedCapabilities: CareCapability[];
  deniedCapabilities: CareCapability[];
  reasonCodes: string[];
  reasons: string[];
  evidencePointers: string[];
  responsibleHumanRole: string;
  humanReviewRequired: boolean;
  executionAuthorityGranted: false;
  escalationRequired: boolean;
  correlationId: string;
  auditHash: string;
};

const prohibitedCapabilities: CareCapability[] = [
  "diagnosis",
  "prescribing",
  "medical-order",
  "patient-disposition",
  "payer-submission",
  "ehr-writeback"
];

const contextCapabilityCeilings: Record<CareContext, CareCapability[]> = {
  ambulatory_self_service: ["education", "scheduling-read", "scheduling-draft", "reminder-draft", "longitudinal-navigation"],
  ambulatory_clinician: [
    "education",
    "scheduling-read",
    "scheduling-draft",
    "reminder-draft",
    "documentation-draft",
    "longitudinal-navigation",
    "clinical-context-read",
    "evidence-summary",
    "alert-preparation"
  ],
  acute_clinician: ["clinical-context-read", "evidence-summary", "documentation-draft", "alert-preparation"],
  acute_critical: ["clinical-context-read", "evidence-summary", "alert-preparation"]
};

const maximumFreshnessMinutes: Record<CareContext, number> = {
  ambulatory_self_service: 1_440,
  ambulatory_clinician: 240,
  acute_clinician: 15,
  acute_critical: 5
};

function responsibleRole(context: CareContext) {
  if (context === "acute_critical") return "authenticated acute-care clinician";
  if (context === "acute_clinician") return "authenticated treating clinician";
  if (context === "ambulatory_clinician") return "authenticated ambulatory clinician";
  return "patient-access or licensed clinical escalation owner";
}

export function evaluateCareContextPolicy(request: CarePolicyRequest): CarePolicyDecision {
  const reasonCodes: string[] = [];
  const reasons: string[] = [];
  const ceiling = contextCapabilityCeilings[request.context];
  const prohibitedRequested = request.requestedCapabilities.filter((capability) => prohibitedCapabilities.includes(capability));
  const outsideCeiling = request.requestedCapabilities.filter((capability) => !ceiling.includes(capability));
  const deniedCapabilities = [...new Set([...prohibitedRequested, ...outsideCeiling])].sort() as CareCapability[];
  const grantedCapabilities = request.requestedCapabilities
    .filter((capability) => ceiling.includes(capability) && !prohibitedCapabilities.includes(capability))
    .sort() as CareCapability[];

  if (!request.tenantId || !request.actor.actorId || !request.correlationId) {
    reasonCodes.push("ATTRIBUTION_REQUIRED");
    reasons.push("Tenant, actor, and correlation attribution are mandatory.");
  }
  if (request.taskRisk === "prohibited" || prohibitedRequested.length > 0) {
    reasonCodes.push("PROHIBITED_CLINICAL_OR_WRITE_ACTION");
    reasons.push("The requested action includes a capability that current SCRIMED policy never grants autonomously.");
  }
  if (outsideCeiling.length > 0) {
    reasonCodes.push("CAPABILITY_ELEVATION_DENIED");
    reasons.push("A task cannot elevate itself beyond the static capability ceiling for its care context.");
  }
  if ((request.context === "acute_clinician" || request.context === "acute_critical") && !request.actor.authenticated) {
    reasonCodes.push("AUTHENTICATED_CLINICIAN_REQUIRED");
    reasons.push("Acute decision support requires an authenticated clinician identity.");
  }
  if (request.context === "acute_critical" && !request.signedHumanAuthorization) {
    reasonCodes.push("ACUTE_CRITICAL_FAIL_CLOSED");
    reasons.push("Acute-critical work fails closed without action-scoped signed human authorization.");
  }
  if ((request.context === "acute_clinician" || request.context === "acute_critical") && !request.currentClinicalContextAvailable) {
    reasonCodes.push("CURRENT_CLINICAL_CONTEXT_REQUIRED");
    reasons.push("Acute support requires current clinical context.");
  }
  if ((request.context === "acute_clinician" || request.context === "acute_critical") && request.evidencePointers.length === 0) {
    reasonCodes.push("CLINICAL_EVIDENCE_REQUIRED");
    reasons.push("Acute support requires source evidence and citations.");
  }
  const freshnessRequired =
    request.context === "acute_clinician" ||
    request.context === "acute_critical" ||
    request.currentClinicalContextAvailable ||
    request.requestedCapabilities.includes("clinical-context-read");
  if (freshnessRequired && (
    request.contextFreshnessMinutes === null ||
    !Number.isFinite(request.contextFreshnessMinutes) ||
    request.contextFreshnessMinutes < 0 ||
    request.contextFreshnessMinutes > maximumFreshnessMinutes[request.context]
  )) {
    reasonCodes.push("CONTEXT_FRESHNESS_UNACCEPTABLE");
    reasons.push("Clinical context is missing, invalid, or older than the care-context limit.");
  }
  if (!request.identityCertain) {
    reasonCodes.push("IDENTITY_UNCERTAINTY_ESCALATION");
    reasons.push("Subject identity uncertainty requires human reconciliation.");
  }
  if (request.contradictoryEvidence) {
    reasonCodes.push("CONTRADICTORY_EVIDENCE_ESCALATION");
    reasons.push("Contradictory evidence must remain visible and requires human review.");
  }
  if (request.redFlagDetected || request.worseningSymptomsReported) {
    reasonCodes.push("PATIENT_SAFETY_ESCALATION");
    reasons.push("Red flags or worsening symptoms require an appropriate human pathway.");
  }
  if ((request.context === "acute_clinician" || request.context === "acute_critical") && !request.clinicianConfirmation) {
    reasonCodes.push("CLINICIAN_CONFIRMATION_REQUIRED");
    reasons.push("Acute advisory output requires authenticated clinician confirmation.");
  }
  if (request.taskRisk === "high") {
    reasonCodes.push("HIGH_RISK_HUMAN_REVIEW_REQUIRED");
    reasons.push("High-risk tasks cannot progress beyond reviewable preparation without human approval.");
  }

  const blockingCodes = new Set([
    "ATTRIBUTION_REQUIRED",
    "PROHIBITED_CLINICAL_OR_WRITE_ACTION",
    "AUTHENTICATED_CLINICIAN_REQUIRED",
    "ACUTE_CRITICAL_FAIL_CLOSED",
    "CURRENT_CLINICAL_CONTEXT_REQUIRED",
    "CLINICAL_EVIDENCE_REQUIRED",
    "CONTEXT_FRESHNESS_UNACCEPTABLE"
  ]);
  const blocked = reasonCodes.some((code) => blockingCodes.has(code));
  const reviewRequired = !blocked && (
    request.context !== "ambulatory_self_service" ||
    request.taskRisk !== "low" ||
    request.patientFacing ||
    reasonCodes.length > 0
  );
  const decision: PolicyDecision = blocked ? "BLOCK" : reviewRequired ? "REQUIRE_HUMAN" : "ALLOW";
  const withoutHash = {
    policyVersion: scrimedP32CarePolicyVersion as typeof scrimedP32CarePolicyVersion,
    requestId: request.requestId,
    tenantId: request.tenantId,
    careContext: request.context,
    taskRisk: request.taskRisk,
    decision,
    grantedCapabilities: decision === "BLOCK" ? [] : grantedCapabilities,
    deniedCapabilities,
    reasonCodes: reasonCodes.length ? reasonCodes : ["BOUNDED_LOW_RISK_SUPPORT_ALLOWED"],
    reasons: reasons.length ? reasons : ["The request remains inside the bounded low-risk support ceiling."],
    evidencePointers: request.evidencePointers,
    responsibleHumanRole: responsibleRole(request.context),
    humanReviewRequired: decision !== "ALLOW",
    executionAuthorityGranted: false as const,
    escalationRequired: reasonCodes.some((code) => code.endsWith("ESCALATION")) || decision === "BLOCK",
    correlationId: request.correlationId
  };
  return { ...withoutHash, auditHash: createClinicalEvidenceHash({ request, decision: withoutHash }) };
}

export const careContextPolicyMatrix = (Object.keys(contextCapabilityCeilings) as CareContext[]).flatMap((context) =>
  (["low", "moderate", "high", "prohibited"] as TaskRisk[]).map((taskRisk) => ({
    context,
    taskRisk,
    capabilityCeiling: contextCapabilityCeilings[context],
    maximumFreshnessMinutes: maximumFreshnessMinutes[context],
    acuteCriticalFailClosed: context === "acute_critical",
    autonomousClinicalAuthority: false as const
  }))
);
