import type { ToolCategory, WorkAgentRole } from "./types";

export type ScrimedWorkAgent = {
  agentId: string;
  role: WorkAgentRole;
  name: string;
  owner: string;
  purpose: string;
  allowedToolCategories: ToolCategory[];
  blockedActions: string[];
  leastPrivilegeScope: string;
  humanEscalationRequired: boolean;
  trustTier: "synthetic_lab" | "review_ready" | "protected_operator_required";
  auditHash: string;
};

export const scrimedWorkAgents: ScrimedWorkAgent[] = [
  {
    agentId: "work-coordinator",
    role: "coordinator",
    name: "Work Coordinator",
    owner: "SCRIMED Platform",
    purpose: "Builds bounded plans, enforces Definition of Done, and coordinates specialist handoffs.",
    allowedToolCategories: ["read-only", "reversible-write"],
    blockedActions: ["autonomous clinical care", "payer submission", "EHR writeback", "external communication"],
    leastPrivilegeScope: "plan and coordinate synthetic work only",
    humanEscalationRequired: true,
    trustTier: "review_ready",
    auditHash: "agent_work_coordinator_audit_hash"
  },
  {
    agentId: "clinical-context-agent",
    role: "clinical-context",
    name: "Clinical Context Agent",
    owner: "Clinical Governance",
    purpose: "Retrieves synthetic clinical context and flags human-review requirements.",
    allowedToolCategories: ["read-only", "clinical"],
    blockedActions: ["diagnosis", "treatment selection", "prescribing", "final imaging interpretation"],
    leastPrivilegeScope: "decision-support context retrieval only",
    humanEscalationRequired: true,
    trustTier: "protected_operator_required",
    auditHash: "agent_clinical_context_audit_hash"
  },
  {
    agentId: "interoperability-agent",
    role: "interoperability",
    name: "Interoperability Agent",
    owner: "Data Platform",
    purpose: "Maps FHIR, payer, scheduling, and ontology concepts into safe previews.",
    allowedToolCategories: ["read-only", "reversible-write"],
    blockedActions: ["production connector activation", "EHR writeback", "raw connector payload logging"],
    leastPrivilegeScope: "FHIR preview and validation metadata only",
    humanEscalationRequired: true,
    trustTier: "review_ready",
    auditHash: "agent_interoperability_audit_hash"
  },
  {
    agentId: "patient-access-agent",
    role: "patient-access",
    name: "Patient Access Agent",
    owner: "Operations",
    purpose: "Prepares scheduling, referral, and access workflow recommendations.",
    allowedToolCategories: ["read-only", "scheduling"],
    blockedActions: ["patient outreach", "appointment booking without approval"],
    leastPrivilegeScope: "synthetic patient-access workflow preparation",
    humanEscalationRequired: true,
    trustTier: "review_ready",
    auditHash: "agent_patient_access_audit_hash"
  },
  {
    agentId: "research-agent",
    role: "research",
    name: "Research Agent",
    owner: "Research Ops",
    purpose: "Prepares cited research briefs and contradiction checks.",
    allowedToolCategories: ["read-only", "reversible-write"],
    blockedActions: ["clinical recommendation", "therapeutic claim", "trial enrollment decision"],
    leastPrivilegeScope: "synthetic research synthesis only",
    humanEscalationRequired: true,
    trustTier: "review_ready",
    auditHash: "agent_research_audit_hash"
  },
  {
    agentId: "revenue-cycle-agent",
    role: "revenue-cycle",
    name: "Revenue Cycle Agent",
    owner: "RCM Governance",
    purpose: "Prepares prior authorization and appeal drafts without submission.",
    allowedToolCategories: ["read-only", "reversible-write", "financial"],
    blockedActions: ["claim submission", "payer submission", "coverage determination", "payment execution"],
    leastPrivilegeScope: "documentation and draft packet support only",
    humanEscalationRequired: true,
    trustTier: "protected_operator_required",
    auditHash: "agent_revenue_cycle_audit_hash"
  },
  {
    agentId: "verification-agent",
    role: "verification",
    name: "Verification Agent",
    owner: "Trust Engineering",
    purpose: "Runs schema, citation, scope, PHI, loop, budget, and approval checks.",
    allowedToolCategories: ["read-only"],
    blockedActions: ["self-certifying completion without evidence"],
    leastPrivilegeScope: "verification-only",
    humanEscalationRequired: false,
    trustTier: "review_ready",
    auditHash: "agent_verification_audit_hash"
  },
  {
    agentId: "safety-policy-agent",
    role: "safety-policy",
    name: "Safety Policy Agent",
    owner: "Trust + Safety",
    purpose: "Applies no-PHI, no-live-care, no-payer-submission, no-EHR-writeback boundaries.",
    allowedToolCategories: ["read-only"],
    blockedActions: ["policy bypass", "silent provider downgrade", "unsafe authorization expansion"],
    leastPrivilegeScope: "policy evaluation only",
    humanEscalationRequired: false,
    trustTier: "review_ready",
    auditHash: "agent_safety_policy_audit_hash"
  },
  {
    agentId: "artifact-writer-agent",
    role: "artifact-writer",
    name: "Artifact Writer",
    owner: "Product Operations",
    purpose: "Creates reviewable Markdown/JSON artifacts from verified evidence.",
    allowedToolCategories: ["read-only", "reversible-write"],
    blockedActions: ["unreviewed external distribution", "clinical authority claims"],
    leastPrivilegeScope: "draft artifacts only",
    humanEscalationRequired: true,
    trustTier: "review_ready",
    auditHash: "agent_artifact_writer_audit_hash"
  },
  {
    agentId: "executive-brief-agent",
    role: "executive-brief",
    name: "Executive Brief Agent",
    owner: "Executive Operations",
    purpose: "Summarizes verified work into board, investor, and executive briefs.",
    allowedToolCategories: ["read-only", "reversible-write"],
    blockedActions: ["securities material", "valuation assurance", "audited financial reporting"],
    leastPrivilegeScope: "claims-safe executive drafts",
    humanEscalationRequired: true,
    trustTier: "review_ready",
    auditHash: "agent_executive_brief_audit_hash"
  },
  {
    agentId: "reviewer-agent",
    role: "reviewer",
    name: "Reviewer Agent",
    owner: "Human Review Ops",
    purpose: "Organizes review queue metadata and never approves itself.",
    allowedToolCategories: ["read-only"],
    blockedActions: ["self-approval", "approval-token generation"],
    leastPrivilegeScope: "review queue metadata only",
    humanEscalationRequired: true,
    trustTier: "review_ready",
    auditHash: "agent_reviewer_audit_hash"
  }
];
