import { generateScrimedAuditHash } from "../scrimedIntelligencePlatform";
import { scrimedSafetyPolicyVersion } from "../scrimedSafetyGovernance";
import type {
  ScrimedAgentSessionState,
  ScrimedContextualPolicyDecision,
  ScrimedGovernanceAuditEvent,
  ScrimedGovernanceDecision,
  ScrimedGovernanceRiskTier
} from "./governanceLearningLoop";

export type ScrimedRequestedTool =
  | "public_education"
  | "internal_summary"
  | "external_send"
  | "clinical_output"
  | "payer_submission"
  | "ehr_writeback"
  | "diagnosis_support"
  | "treatment_planning"
  | "prescribing"
  | "audit_log"
  | "mcp_tool"
  | "a2a_handoff";

export type ScrimedPolicyAction =
  | ScrimedRequestedTool
  | "external_communication"
  | "cost_continue"
  | "clinical_facing_output"
  | "public_safe_educational_output";

export const SCRIMED_CONTEXTUAL_AGENT_POLICY_STATUS = "scrimed-contextual-agent-policy-active-deny-by-default";

function riskTier(score: number): ScrimedGovernanceRiskTier {
  if (score >= 100) return "blocked";
  if (score >= 70) return "high";
  if (score >= 35) return "medium";
  return "low";
}

function buildDecision(input: {
  decision: ScrimedGovernanceDecision;
  session: ScrimedAgentSessionState;
  reason: string;
  blockedActions?: string[];
  allowedActions?: string[];
  requiredReviewerRole?: string | null;
  riskScore: number;
}): ScrimedContextualPolicyDecision {
  const payload = {
    agentId: input.session.agentId,
    blockedActions: input.blockedActions ?? [],
    decision: input.decision,
    policyVersion: scrimedSafetyPolicyVersion,
    reason: input.reason,
    riskScore: input.riskScore,
    sessionId: input.session.sessionId
  };

  return {
    decision: input.decision,
    riskScore: input.riskScore,
    riskTier: riskTier(input.riskScore),
    reason: input.reason,
    requiredReviewerRole: input.requiredReviewerRole ?? null,
    blockedActions: input.blockedActions ?? [],
    allowedActions: input.allowedActions ?? [],
    auditHash: generateScrimedAuditHash(payload)
  };
}

export function assessAgentRisk(session: ScrimedAgentSessionState): ScrimedContextualPolicyDecision {
  let riskScore = 0;
  const blockedActions: string[] = [];
  const allowedActions: string[] = [];

  if (session.touchedPhi) {
    riskScore += 100;
    blockedActions.push("PHI export", "external sharing", "tool calls beyond contained review");
  }

  if (session.readConfidentialDocument) riskScore += 30;
  if (session.readUntrustedExternalContent) riskScore += 25;
  if (session.requestedExternalAction) riskScore += 25;
  if (session.estimatedCostUsd > 25) riskScore += 20;
  if (session.clinicalFacingOutput) riskScore += 35;

  if (session.payerSubmissionRequested) {
    riskScore += 100;
    blockedActions.push("payer submission");
  }

  if (session.ehrWritebackRequested) {
    riskScore += 100;
    blockedActions.push("EHR writeback");
  }

  if (session.diagnosisTreatmentOrPrescribingRequested) {
    riskScore += 100;
    blockedActions.push("diagnosis/treatment/prescribing authority");
  }

  if (blockedActions.length > 0 || riskScore >= 100) {
    return buildDecision({
      decision: "deny",
      session,
      reason: "Session crossed a blocked SCRIMED boundary and must fail closed.",
      blockedActions,
      requiredReviewerRole: "Governance lead",
      riskScore
    });
  }

  if (
    session.readConfidentialDocument ||
    session.readUntrustedExternalContent ||
    session.requestedExternalAction ||
    session.estimatedCostUsd > 25 ||
    session.clinicalFacingOutput
  ) {
    return buildDecision({
      decision: "require_review",
      session,
      reason: "Session remains metadata-only but requires human review because risk context changed.",
      blockedActions,
      allowedActions: ["internal review", "audit logging", "synthetic retest"],
      requiredReviewerRole: session.clinicalFacingOutput ? "Clinical reviewer" : "Governance reviewer",
      riskScore
    });
  }

  allowedActions.push("public-safe educational output", "internal synthetic summary", "audit logging");

  return buildDecision({
    decision: "allow",
    session,
    reason: "Session is public-safe, no-PHI, synthetic or metadata-only, and inside declared scope.",
    allowedActions,
    riskScore
  });
}

export function requiresHumanApproval(session: ScrimedAgentSessionState, action: ScrimedPolicyAction): boolean {
  if (session.touchedPhi) return true;
  if (session.readConfidentialDocument && action === "external_send") return true;
  if (session.readUntrustedExternalContent && action !== "audit_log") return true;
  if (session.estimatedCostUsd > 25) return true;
  if (session.clinicalFacingOutput || action === "clinical_output" || action === "clinical_facing_output") return true;
  if (session.requestedExternalAction || action === "external_communication") return true;
  return false;
}

export function decideToolPermission(
  session: ScrimedAgentSessionState,
  requestedTool: ScrimedRequestedTool
): ScrimedContextualPolicyDecision {
  const scopeAllowsTool = session.declaredScope.includes(requestedTool) || session.declaredScope.includes("governance");

  if (!scopeAllowsTool) {
    return buildDecision({
      decision: "deny",
      session,
      reason: "Requested tool is outside the agent's declared scope.",
      blockedActions: [requestedTool],
      requiredReviewerRole: "Agent governance owner",
      riskScore: 100
    });
  }

  if (["payer_submission", "ehr_writeback", "diagnosis_support", "treatment_planning", "prescribing"].includes(requestedTool)) {
    return buildDecision({
      decision: "deny",
      session,
      reason: "Requested tool maps to a blocked clinical, payer, EHR, or prescribing boundary.",
      blockedActions: [requestedTool],
      requiredReviewerRole: "Boundary release authority",
      riskScore: 100
    });
  }

  if (requiresHumanApproval(session, requestedTool)) {
    return buildDecision({
      decision: "require_review",
      session,
      reason: "Requested tool requires human approval under the contextual agent policy.",
      allowedActions: ["prepare review packet", "record audit event", "run synthetic validation"],
      requiredReviewerRole: requestedTool === "clinical_output" ? "Clinical reviewer" : "Governance reviewer",
      riskScore: assessAgentRisk(session).riskScore
    });
  }

  return buildDecision({
    decision: "allow",
    session,
    reason: "Requested tool is in scope and stays inside public-safe educational or internal synthetic use.",
    allowedActions: [requestedTool],
    riskScore: assessAgentRisk(session).riskScore
  });
}

export function recordPolicyEvent(
  event: Omit<ScrimedGovernanceAuditEvent, "policyVersion" | "timestamp" | "auditHash">
): ScrimedGovernanceAuditEvent {
  const timestamp = "2026-07-07T00:00:00.000Z";
  const policyEvent = {
    ...event,
    policyVersion: scrimedSafetyPolicyVersion,
    timestamp
  };

  return {
    ...policyEvent,
    auditHash: generateScrimedAuditHash(policyEvent)
  };
}

export const SCRIMED_DEFAULT_CONTEXTUAL_POLICIES = [
  "confidential-document-read -> external-send requires approval",
  "untrusted-external-content-read -> elevated prompt-injection risk",
  "cost-threshold exceeded -> ask approval",
  "clinical-facing output -> human review required",
  "payer submission -> deny",
  "EHR writeback -> deny",
  "diagnosis/treatment/prescribing -> deny",
  "public-safe educational output -> allow"
];
