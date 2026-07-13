import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";

export type ScrimedMetaHarnessAgentId =
  | "coding_agent"
  | "clinical_agent"
  | "documentation_agent"
  | "evidence_agent"
  | "operations_agent"
  | "trust_safety_agent";

export type ScrimedMetaHarnessRiskTier = "low" | "moderate" | "high" | "critical";

export type ScrimedMetaHarnessToolId =
  | "synthetic_context_loader"
  | "schema_validator"
  | "policy_gate"
  | "evidence_binder"
  | "audit_recorder"
  | "human_approval_queue"
  | "read_only_code_inspector"
  | "ehr_writeback"
  | "payer_submission"
  | "patient_outreach"
  | "production_connector_activation"
  | "raw_payload_logger";

export type ScrimedMetaHarnessReviewerRole =
  | "platform_reviewer"
  | "clinical_reviewer"
  | "payer_policy_reviewer"
  | "privacy_security_reviewer";

export type ScrimedMetaHarnessAgentIdentity = {
  agentId: ScrimedMetaHarnessAgentId;
  name: string;
  purpose: string;
  riskTier: ScrimedMetaHarnessRiskTier;
  allowedTools: ScrimedMetaHarnessToolId[];
  blockedTools: ScrimedMetaHarnessToolId[];
  reviewerRole: ScrimedMetaHarnessReviewerRole;
  canAccessPhi: false;
  canExecuteProtectedAction: false;
  telemetryRequired: true;
};

export type ScrimedMetaHarnessSession = {
  sessionId: string;
  status: "synthetic_shared_session_ready";
  syntheticOnly: true;
  noPhiConfirmed: true;
  rawConnectorPayloadsAllowed: false;
  sharedContextRefs: string[];
  policyRefs: string[];
  guardrails: string[];
  approvalGate: "human_approval_required_for_high_stakes";
};

export type ScrimedMetaHarnessRequest = {
  requestId: string;
  sessionId: string;
  task: string;
  requestedAgentIds: ScrimedMetaHarnessAgentId[];
  requestedTools: ScrimedMetaHarnessToolId[];
  riskTier: ScrimedMetaHarnessRiskTier;
  requestedAction: "synthetic_planning" | "draft_reviewer_packet" | "protected_action_attempt";
};

export type ScrimedMetaHarnessToolDecision = {
  toolId: ScrimedMetaHarnessToolId;
  status: "allowed" | "blocked";
  reason: string;
};

export type ScrimedMetaHarnessDecision = {
  requestId: string;
  status: "allowed" | "human_review_required" | "blocked";
  assignedAgents: ScrimedMetaHarnessAgentId[];
  toolDecisions: ScrimedMetaHarnessToolDecision[];
  blockedActions: string[];
  approvalGate:
    | "not_required_for_low_risk_synthetic_metadata"
    | "human_review_required"
    | "blocked_before_execution";
  noPhiConfirmed: true;
  syntheticOnly: true;
  noExternalSideEffects: true;
  auditHash: string;
  boundary: typeof scrimedMetaHarnessBoundary;
};

export const scrimedMetaHarnessStatus = "scrimed-meta-harness-ready-synthetic-only";

export const scrimedMetaHarnessBoundary =
  "SCRIMED Meta-Harness is a synthetic/no-PHI orchestration control plane for coding, clinical, documentation, evidence, operations, and trust/safety agents. It coordinates shared sessions, policies, guardrails, permissions, human approval gates, and audit metadata. It does not process live PHI, grant autonomous clinical authority, submit payer work, write to EHRs, activate production connectors, log raw payloads, or execute protected actions.";

export const scrimedMetaHarnessSafeTools: ScrimedMetaHarnessToolId[] = [
  "synthetic_context_loader",
  "schema_validator",
  "policy_gate",
  "evidence_binder",
  "audit_recorder",
  "human_approval_queue",
  "read_only_code_inspector"
];

export const scrimedMetaHarnessBlockedTools: ScrimedMetaHarnessToolId[] = [
  "ehr_writeback",
  "payer_submission",
  "patient_outreach",
  "production_connector_activation",
  "raw_payload_logger"
];

export const scrimedMetaHarnessAgents: ScrimedMetaHarnessAgentIdentity[] = [
  agent("coding_agent", "Coding Agent", "Inspects code and proposes safe implementation plans.", "moderate", ["read_only_code_inspector", "schema_validator", "audit_recorder"], "platform_reviewer"),
  agent("clinical_agent", "Clinical Agent", "Synthesizes synthetic clinical workflow context with evidence and review gates.", "high", ["synthetic_context_loader", "schema_validator", "evidence_binder", "human_approval_queue", "audit_recorder"], "clinical_reviewer"),
  agent("documentation_agent", "Documentation Agent", "Creates synthetic documentation gap packets and reviewer-ready drafts.", "moderate", ["synthetic_context_loader", "schema_validator", "policy_gate", "evidence_binder", "audit_recorder"], "payer_policy_reviewer"),
  agent("evidence_agent", "Evidence Agent", "Binds sources, provenance, policy refs, and audit hashes.", "moderate", ["schema_validator", "evidence_binder", "audit_recorder"], "privacy_security_reviewer"),
  agent("operations_agent", "Operations Agent", "Routes synthetic workflow states, bottlenecks, owners, and queue readiness.", "moderate", ["synthetic_context_loader", "policy_gate", "audit_recorder"], "platform_reviewer"),
  agent("trust_safety_agent", "Trust & Safety Agent", "Verifies boundaries, blocked tools, approval gates, and audit requirements.", "critical", ["schema_validator", "policy_gate", "human_approval_queue", "audit_recorder"], "privacy_security_reviewer")
];

export const scrimedMetaHarnessSession: ScrimedMetaHarnessSession = {
  sessionId: "meta-harness-synthetic-session-001",
  status: "synthetic_shared_session_ready",
  syntheticOnly: true,
  noPhiConfirmed: true,
  rawConnectorPayloadsAllowed: false,
  sharedContextRefs: [
    "scrimed-build-roadmap-priority-stack",
    "scrimed-dynamic-context-manifest",
    "scrimed-intelligence-platform-evaluator",
    "scrimed-trustops-boundary-policy"
  ],
  policyRefs: [
    "scrimed-safety-governance-v2026-06-29",
    "no-live-phi",
    "human-review-high-stakes",
    "no-system-of-record-mutation"
  ],
  guardrails: [
    "no raw connector payloads",
    "no autonomous diagnosis, treatment, prescribing, outreach, payer submission, or EHR writeback",
    "all high-risk clinical, payer, and connector actions require human review",
    "models may draft or summarize but cannot execute protected actions"
  ],
  approvalGate: "human_approval_required_for_high_stakes"
};

export const scrimedMetaHarnessSampleRequests: ScrimedMetaHarnessRequest[] = [
  {
    requestId: "meta-harness-low-risk-code-review",
    sessionId: scrimedMetaHarnessSession.sessionId,
    task: "Synthetic code inspection and implementation plan with no live data.",
    requestedAgentIds: ["coding_agent", "trust_safety_agent"],
    requestedTools: ["read_only_code_inspector", "schema_validator", "audit_recorder"],
    riskTier: "moderate",
    requestedAction: "synthetic_planning"
  },
  {
    requestId: "meta-harness-clinical-review-packet",
    sessionId: scrimedMetaHarnessSession.sessionId,
    task: "Draft a synthetic clinical documentation review packet with evidence binding.",
    requestedAgentIds: ["clinical_agent", "documentation_agent", "evidence_agent", "trust_safety_agent"],
    requestedTools: ["synthetic_context_loader", "schema_validator", "policy_gate", "evidence_binder", "human_approval_queue", "audit_recorder"],
    riskTier: "high",
    requestedAction: "draft_reviewer_packet"
  },
  {
    requestId: "meta-harness-blocked-protected-action",
    sessionId: scrimedMetaHarnessSession.sessionId,
    task: "Attempt to send protected payer, outreach, and EHR actions.",
    requestedAgentIds: ["operations_agent", "trust_safety_agent"],
    requestedTools: ["payer_submission", "patient_outreach", "ehr_writeback", "raw_payload_logger"],
    riskTier: "critical",
    requestedAction: "protected_action_attempt"
  }
];

function agent(
  agentId: ScrimedMetaHarnessAgentId,
  name: string,
  purpose: string,
  riskTier: ScrimedMetaHarnessRiskTier,
  allowedTools: ScrimedMetaHarnessToolId[],
  reviewerRole: ScrimedMetaHarnessReviewerRole
): ScrimedMetaHarnessAgentIdentity {
  return {
    agentId,
    name,
    purpose,
    riskTier,
    allowedTools,
    blockedTools: scrimedMetaHarnessBlockedTools,
    reviewerRole,
    canAccessPhi: false,
    canExecuteProtectedAction: false,
    telemetryRequired: true
  };
}

function agentRegistryById() {
  return new Map(scrimedMetaHarnessAgents.map((agentIdentity) => [agentIdentity.agentId, agentIdentity]));
}

function evaluateTool(
  toolId: ScrimedMetaHarnessToolId,
  requestedAgents: ScrimedMetaHarnessAgentIdentity[]
): ScrimedMetaHarnessToolDecision {
  if (scrimedMetaHarnessBlockedTools.includes(toolId)) {
    return {
      toolId,
      status: "blocked",
      reason: "Tool is outside SCRIMED's current no-PHI, no-system-of-record, no-protected-action boundary."
    };
  }

  const allowedByAtLeastOneAgent = requestedAgents.some((agentIdentity) =>
    agentIdentity.allowedTools.includes(toolId)
  );

  return {
    toolId,
    status: allowedByAtLeastOneAgent ? "allowed" : "blocked",
    reason: allowedByAtLeastOneAgent
      ? "Tool is explicitly permissioned for at least one assigned agent inside the synthetic session."
      : "Tool was not permissioned by any assigned agent identity."
  };
}

export function evaluateScrimedMetaHarnessRequest(
  request: ScrimedMetaHarnessRequest
): ScrimedMetaHarnessDecision {
  const agentsById = agentRegistryById();
  const assignedAgents = request.requestedAgentIds
    .map((agentId) => agentsById.get(agentId))
    .filter((agentIdentity): agentIdentity is ScrimedMetaHarnessAgentIdentity => Boolean(agentIdentity));
  const toolDecisions = request.requestedTools.map((toolId) => evaluateTool(toolId, assignedAgents));
  const blockedActions = [
    ...toolDecisions
      .filter((decision) => decision.status === "blocked")
      .map((decision) => `blocked tool: ${decision.toolId}`),
    request.requestedAction === "protected_action_attempt" ? "protected action attempt blocked" : ""
  ].filter(Boolean);
  const highStakes =
    request.riskTier === "high" ||
    request.riskTier === "critical" ||
    assignedAgents.some((agentIdentity) => agentIdentity.riskTier === "high" || agentIdentity.riskTier === "critical");
  const status: ScrimedMetaHarnessDecision["status"] =
    blockedActions.length > 0
      ? "blocked"
      : highStakes
        ? "human_review_required"
        : "allowed";
  const approvalGate: ScrimedMetaHarnessDecision["approvalGate"] =
    status === "blocked"
      ? "blocked_before_execution"
      : status === "human_review_required"
        ? "human_review_required"
        : "not_required_for_low_risk_synthetic_metadata";

  return {
    requestId: request.requestId,
    status,
    assignedAgents: assignedAgents.map((agentIdentity) => agentIdentity.agentId),
    toolDecisions,
    blockedActions,
    approvalGate,
    noPhiConfirmed: true,
    syntheticOnly: true,
    noExternalSideEffects: true,
    auditHash: generateScrimedAuditHash({
      requestId: request.requestId,
      assignedAgents: assignedAgents.map((agentIdentity) => agentIdentity.agentId),
      toolDecisions,
      status,
      approvalGate
    }),
    boundary: scrimedMetaHarnessBoundary
  };
}

export function getScrimedMetaHarnessSummary() {
  const decisions = scrimedMetaHarnessSampleRequests.map((request) =>
    evaluateScrimedMetaHarnessRequest(request)
  );

  return {
    service: "scrimed-meta-harness",
    status: scrimedMetaHarnessStatus,
    syntheticOnly: true,
    noPhiConfirmed: true,
    noExternalSideEffects: true,
    boundary: scrimedMetaHarnessBoundary,
    session: scrimedMetaHarnessSession,
    agentCount: scrimedMetaHarnessAgents.length,
    agents: scrimedMetaHarnessAgents,
    safeTools: scrimedMetaHarnessSafeTools,
    blockedTools: scrimedMetaHarnessBlockedTools,
    sampleRequests: scrimedMetaHarnessSampleRequests,
    decisions,
    validation: {
      status:
        scrimedMetaHarnessAgents.every(
          (agentIdentity) =>
            !agentIdentity.canAccessPhi &&
            !agentIdentity.canExecuteProtectedAction &&
            agentIdentity.telemetryRequired &&
            agentIdentity.allowedTools.length > 0 &&
            agentIdentity.blockedTools.length > 0
        ) &&
        decisions.some((decision) => decision.status === "allowed") &&
        decisions.some((decision) => decision.status === "human_review_required") &&
        decisions.some((decision) => decision.status === "blocked") &&
        decisions.every((decision) => decision.syntheticOnly && decision.noPhiConfirmed && decision.noExternalSideEffects)
          ? "pass"
          : "fail",
      checks: [
        {
          check: "agent-identity-registry-complete",
          passed: scrimedMetaHarnessAgents.length >= 6,
          detail: "Coding, clinical, documentation, evidence, operations, and trust/safety agents must have identities."
        },
        {
          check: "permissions-declared",
          passed: scrimedMetaHarnessAgents.every(
            (agentIdentity) => agentIdentity.allowedTools.length > 0 && agentIdentity.blockedTools.length > 0
          ),
          detail: "Every agent must declare allowed tools, blocked tools, risk tier, reviewer role, and telemetry requirement."
        },
        {
          check: "shared-session-no-phi",
          passed:
            scrimedMetaHarnessSession.syntheticOnly &&
            scrimedMetaHarnessSession.noPhiConfirmed &&
            !scrimedMetaHarnessSession.rawConnectorPayloadsAllowed,
          detail: "The shared session cannot contain PHI, secrets, or raw connector payloads."
        },
        {
          check: "high-stakes-human-review",
          passed: decisions.some((decision) => decision.status === "human_review_required"),
          detail: "High-risk clinical, payer, connector, or trust/safety orchestration must require human review."
        },
        {
          check: "protected-actions-blocked",
          passed: decisions.some(
            (decision) =>
              decision.status === "blocked" &&
              decision.blockedActions.includes("protected action attempt blocked")
          ),
          detail: "Protected payer submission, outreach, EHR writeback, connector activation, and raw-payload logging remain blocked."
        }
      ]
    }
  };
}
