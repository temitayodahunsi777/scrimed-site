import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";

export type ScrimedAgentGovernanceDecision = "allow" | "deny" | "require_review";
export type ScrimedGovernedAgentRole =
  | "clinical_intelligence"
  | "payer_workflow"
  | "rcm_operations"
  | "research_assistant"
  | "trust_safety"
  | "patient_context";

export type ScrimedAgentSessionState = {
  sessionId: string;
  agentId: string;
  declaredScope: ScrimedGovernedAgentRole;
  requestedAction: string;
  phiAccessed: boolean;
  confidentialDocumentAccessed: boolean;
  untrustedContentRead: boolean;
  externalActionRequested: boolean;
  costUsd: number;
  clinicalRecommendationRequested: boolean;
  targetTool: string;
};

export type ScrimedAgentGovernancePolicy = {
  id: string;
  trigger: string;
  decision: ScrimedAgentGovernanceDecision;
  riskDelta: number;
  reason: string;
  humanApprovalRequired: boolean;
};

export type ScrimedAgentGovernanceEvaluation = {
  decision: ScrimedAgentGovernanceDecision;
  dynamicRiskScore: number;
  humanApprovalRequired: boolean;
  matchedPolicies: string[];
  safeBoundary: string;
  auditHash: string;
};

export const scrimedAgentGovernanceApiRoute = "/api/scrimed-agent-governance";
export const scrimedAgentGovernanceBriefRoute = "/api/scrimed-agent-governance/brief";
export const scrimedAgentGovernanceStatus = "scrimed-agent-governance-active-synthetic-no-phi";
export const scrimedAgentGovernanceBoundary =
  "SCRIMED Agent Governance is a synthetic/no-PHI control plane. It evaluates metadata-only agent session state and does not authorize PHI export, autonomous clinical care, diagnosis, treatment, prescribing, EHR writeback, payer submission, production deployment, certification claims, or customer go-live.";

export const scrimedAgentIdentityRegistry = [
  {
    agentId: "sentinel-supervisor",
    name: "Project SENTINEL Supervisor",
    declaredScope: "trust_safety",
    allowedTools: ["policy_preview", "audit_hash", "review_queue"],
    blockedTools: ["ehr_writeback", "payer_submit", "patient_message", "external_export"],
    owner: "Trust and Safety"
  },
  {
    agentId: "prior-auth-documentation-agent",
    name: "Prior Authorization Documentation Agent",
    declaredScope: "payer_workflow",
    allowedTools: ["policy_gap_check", "packet_draft", "citation_review"],
    blockedTools: ["payer_submit", "patient_message", "ehr_writeback"],
    owner: "RCM Governance"
  },
  {
    agentId: "clinical-context-agent",
    name: "Clinical Context Agent",
    declaredScope: "clinical_intelligence",
    allowedTools: ["synthetic_context_retrieval", "evidence_map", "review_packet"],
    blockedTools: ["diagnose", "prescribe", "ehr_writeback", "patient_message"],
    owner: "Clinical Safety"
  }
] as const;

export const scrimedAgentGovernancePolicies: ScrimedAgentGovernancePolicy[] = [
  {
    id: "phi-touched-block-export",
    trigger: "If PHI touched, block export and require human review.",
    decision: "require_review",
    riskDelta: 45,
    reason: "PHI access changes the action boundary; export cannot proceed without qualified approval.",
    humanApprovalRequired: true
  },
  {
    id: "untrusted-content-restrict-tools",
    trigger: "If untrusted external content read, restrict tool actions.",
    decision: "require_review",
    riskDelta: 25,
    reason: "Untrusted content can inject instructions or poison retrieval context.",
    humanApprovalRequired: true
  },
  {
    id: "cost-threshold-requires-approval",
    trigger: "If agent cost exceeds threshold, require approval.",
    decision: "require_review",
    riskDelta: 15,
    reason: "Cost guardrails prevent runaway agent loops and unexpected billing exposure.",
    humanApprovalRequired: true
  },
  {
    id: "external-communication-review",
    trigger: "If action attempts external communication, require review.",
    decision: "require_review",
    riskDelta: 30,
    reason: "External communication can create legal, clinical, patient, or payer consequences.",
    humanApprovalRequired: true
  },
  {
    id: "outside-declared-scope-deny",
    trigger: "If agent task is outside declared scope, deny.",
    decision: "deny",
    riskDelta: 50,
    reason: "Agents are deny-by-default outside their declared identity and permission scope.",
    humanApprovalRequired: true
  },
  {
    id: "clinical-recommendation-decision-support-only",
    trigger: "If clinical recommendation requested, return decision-support-only boundary.",
    decision: "require_review",
    riskDelta: 40,
    reason: "Clinical content can support review but cannot become autonomous diagnosis, treatment, or prescribing.",
    humanApprovalRequired: true
  }
];

export const sampleScrimedAgentSession: ScrimedAgentSessionState = {
  sessionId: "synthetic-session-agent-governance-001",
  agentId: "clinical-context-agent",
  declaredScope: "clinical_intelligence",
  requestedAction: "summarize synthetic care context for reviewer decision support",
  phiAccessed: false,
  confidentialDocumentAccessed: false,
  untrustedContentRead: true,
  externalActionRequested: false,
  costUsd: 7.5,
  clinicalRecommendationRequested: true,
  targetTool: "evidence_map"
};

function actionOutsideDeclaredScope(session: ScrimedAgentSessionState) {
  const scopePatterns: Record<ScrimedGovernedAgentRole, RegExp> = {
    clinical_intelligence: /\b(clinical|care|evidence|context|review|summary)\b/i,
    payer_workflow: /\b(prior auth|authorization|payer|appeal|medical necessity|policy)\b/i,
    rcm_operations: /\b(rcm|claim|denial|coding|revenue|billing)\b/i,
    research_assistant: /\b(research|trial|literature|evidence synthesis)\b/i,
    trust_safety: /\b(policy|audit|safety|governance|review)\b/i,
    patient_context: /\b(patient context|continuity|journey|consent|hie)\b/i
  };

  return !scopePatterns[session.declaredScope].test(session.requestedAction);
}

export function evaluateScrimedAgentGovernance(
  session: ScrimedAgentSessionState = sampleScrimedAgentSession
): ScrimedAgentGovernanceEvaluation {
  const matchedPolicies = scrimedAgentGovernancePolicies.filter((policy) => {
    switch (policy.id) {
      case "phi-touched-block-export":
        return session.phiAccessed;
      case "untrusted-content-restrict-tools":
        return session.untrustedContentRead;
      case "cost-threshold-requires-approval":
        return session.costUsd > 10;
      case "external-communication-review":
        return session.externalActionRequested;
      case "outside-declared-scope-deny":
        return actionOutsideDeclaredScope(session);
      case "clinical-recommendation-decision-support-only":
        return session.clinicalRecommendationRequested;
      default:
        return false;
    }
  });
  const dynamicRiskScore = Math.min(
    100,
    matchedPolicies.reduce((score, policy) => score + policy.riskDelta, session.confidentialDocumentAccessed ? 15 : 0)
  );
  const decision: ScrimedAgentGovernanceDecision = matchedPolicies.some((policy) => policy.decision === "deny")
    ? "deny"
    : matchedPolicies.some((policy) => policy.decision === "require_review")
      ? "require_review"
      : "allow";

  return {
    decision,
    dynamicRiskScore,
    humanApprovalRequired: decision !== "allow" || matchedPolicies.some((policy) => policy.humanApprovalRequired),
    matchedPolicies: matchedPolicies.map((policy) => policy.id),
    safeBoundary:
      "Decision support only. Human approval is required for PHI, clinical, external, payer, EHR, deployment, or out-of-scope actions.",
    auditHash: generateScrimedAuditHash({
      session,
      matchedPolicies: matchedPolicies.map((policy) => policy.id),
      decision,
      safetyPolicyVersion: scrimedSafetyPolicyVersion
    })
  };
}

export function getScrimedAgentGovernanceSummary() {
  const evaluation = evaluateScrimedAgentGovernance();

  return {
    service: "scrimed-agent-governance",
    status: scrimedAgentGovernanceStatus,
    apiRoute: scrimedAgentGovernanceApiRoute,
    briefRoute: scrimedAgentGovernanceBriefRoute,
    boundary: scrimedAgentGovernanceBoundary,
    identityRegistry: scrimedAgentIdentityRegistry,
    policies: scrimedAgentGovernancePolicies,
    sampleSession: sampleScrimedAgentSession,
    sampleEvaluation: evaluation,
    productionReadiness: false,
    noPhiConfirmed: true
  };
}

export function buildScrimedAgentGovernanceBrief() {
  const summary = getScrimedAgentGovernanceSummary();

  return [
    "# SCRIMED Agent Governance Control Plane",
    "",
    summary.boundary,
    "",
    "## Current Status",
    `- Status: ${summary.status}`,
    `- API: ${summary.apiRoute}`,
    `- Brief: ${summary.briefRoute}`,
    `- Production readiness: ${summary.productionReadiness}`,
    "",
    "## Policy Decisions",
    ...summary.policies.map(
      (policy) =>
        `- ${policy.id}: ${policy.decision}; ${policy.trigger} Reason: ${policy.reason}`
    ),
    "",
    "## Sample Evaluation",
    `- Decision: ${summary.sampleEvaluation.decision}`,
    `- Dynamic risk score: ${summary.sampleEvaluation.dynamicRiskScore}`,
    `- Human approval required: ${summary.sampleEvaluation.humanApprovalRequired}`,
    `- Audit hash: ${summary.sampleEvaluation.auditHash}`,
    "",
    "No production deploy, certification, customer go-live, PHI, EHR writeback, payer submission, diagnosis, treatment, or prescribing authority is granted."
  ].join("\n");
}
