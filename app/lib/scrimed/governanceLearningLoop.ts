import { generateScrimedAuditHash } from "../scrimedIntelligencePlatform";
import { scrimedSafetyPolicyVersion } from "../scrimedSafetyGovernance";

export type ScrimedGovernanceDecision = "allow" | "deny" | "require_review";
export type ScrimedGovernanceRiskTier = "low" | "medium" | "high" | "blocked";
export type ScrimedSkillMaturity = "defined" | "lab_ready" | "review_ready" | "blocked_for_production";

export type ScrimedAgentSessionState = {
  sessionId: string;
  agentId: string;
  declaredScope: string[];
  touchedPhi: boolean;
  readConfidentialDocument: boolean;
  readUntrustedExternalContent: boolean;
  requestedExternalAction: boolean;
  estimatedCostUsd: number;
  clinicalFacingOutput: boolean;
  payerSubmissionRequested: boolean;
  ehrWritebackRequested: boolean;
  diagnosisTreatmentOrPrescribingRequested: boolean;
  toolHistory: string[];
};

export type ScrimedContextualPolicyDecision = {
  decision: ScrimedGovernanceDecision;
  riskScore: number;
  riskTier: ScrimedGovernanceRiskTier;
  reason: string;
  requiredReviewerRole: string | null;
  blockedActions: string[];
  allowedActions: string[];
  auditHash: string;
};

export type ScrimedCorrectionArtifact = {
  artifactId: string;
  sourceTraceId: string;
  correctionType: "policy" | "prompt" | "workflow" | "retrieval" | "training" | "documentation";
  memorySummary: string;
  learningUpdate: string;
  approvalRequired: boolean;
  retestRequired: boolean;
  monitorMetric: string;
  auditHash: string;
};

export type ScrimedGovernanceAuditEvent = {
  eventId: string;
  actor: string;
  action: string;
  decision: ScrimedGovernanceDecision;
  policyVersion: string;
  timestamp: string;
  rationale: string;
  auditHash: string;
};

export type ScrimedSkillActivation = {
  id: string;
  name: string;
  purpose: string;
  inputs: string[];
  outputs: string[];
  guardrails: string[];
  activationStatus: "active" | "lab_only" | "review_ready" | "blocked";
  maturityLevel: ScrimedSkillMaturity;
  nextAction: string;
};

export type ScrimedWorkflowValueMetric = {
  metricId: string;
  name: string;
  buyerValue: string;
  pricingSignal: string;
  measuredWith: string;
  boundary: string;
};

export const SCRIMED_CLINICAL_BOUNDARIES = [
  "No live PHI or source patient records.",
  "No autonomous clinical decisioning.",
  "No diagnosis, treatment, prescribing, or final triage authority.",
  "No EHR writeback, order entry, chart mutation, or payer submission.",
  "Clinical-facing outputs stay decision support, education, workflow support, or administrative automation.",
  "Human review, audit evidence, and escalation remain required for clinical-facing and irreversible workflows."
];

export const SCRIMED_AGENT_POLICY_LEVELS = [
  {
    level: "public_safe",
    decision: "allow" as ScrimedGovernanceDecision,
    description: "Synthetic, public-safe, no-PHI educational or governance content.",
    requiredControl: "Audit hash and boundary statement."
  },
  {
    level: "review_required",
    decision: "require_review" as ScrimedGovernanceDecision,
    description: "Clinical-facing, confidential, external-action, or high-cost work that stays inside no-PHI limits.",
    requiredControl: "Human approval before external use or artifact promotion."
  },
  {
    level: "blocked",
    decision: "deny" as ScrimedGovernanceDecision,
    description: "PHI export, payer submission, EHR writeback, diagnosis, treatment, prescribing, or irreversible production action.",
    requiredControl: "Fail closed and route to boundary-release approvals."
  }
];

export const SCRIMED_GOVERNANCE_LEARNING_LOOP = [
  {
    stage: "observe",
    purpose: "Capture metadata-only traces, policy decisions, reviewer notes, route outcomes, and safety flags.",
    output: "Memory artifact"
  },
  {
    stage: "evaluate",
    purpose: "Score schema fidelity, evidence quality, safety, workflow value, and reviewer disposition.",
    output: "Evaluation packet"
  },
  {
    stage: "correct",
    purpose: "Create a correction artifact only after the failure mode is understood.",
    output: "Correction artifact"
  },
  {
    stage: "approve",
    purpose: "Require human approval before changing prompts, policies, workflows, demos, or buyer-facing claims.",
    output: "Approval record"
  },
  {
    stage: "update_artifact",
    purpose: "Update the prompt, policy, workflow, registry, benchmark, or documentation artifact.",
    output: "Versioned artifact"
  },
  {
    stage: "retest",
    purpose: "Run contract, smoke, benchmark, and regression checks before promotion.",
    output: "Retest evidence"
  },
  {
    stage: "monitor",
    purpose: "Track drift, cost, latency, reviewer outcomes, safety flags, and buyer-value metrics.",
    output: "Monitoring signal"
  }
];

export const SCRIMED_A2A_MCP_READINESS = {
  status: "metadata_ready_no_production_connectors",
  a2a: {
    purpose: "Allow SCRIMED agents to hand off tasks with identity, scope, risk, memory summary, and approval state.",
    requiredControls: ["agent identity", "permission scope", "audit event", "human review for high-risk work"]
  },
  mcp: {
    purpose: "Expose governed tool access through scoped middleware instead of direct agent-to-system access.",
    requiredControls: ["deny-by-default tools", "scoped tokens", "tool-level authorization", "revocation", "audit logs"]
  },
  boundary: "No production connector approval, raw schema exposure, payer submission, EHR writeback, or live PHI access."
};

export const SCRIMED_REGULATORY_WATCH_SCOPE = [
  {
    domain: "HIPAA privacy and security readiness",
    watchItems: ["BAA readiness", "minimum necessary principle", "audit trail", "de-identification", "retention"],
    currentUse: "Readiness monitoring only; no certification claim."
  },
  {
    domain: "HTI-6 and ONC interoperability signals",
    watchItems: ["FHIR APIs", "USCDI alignment", "algorithm transparency", "information blocking risk"],
    currentUse: "Product roadmap and evidence-gap tracking."
  },
  {
    domain: "FHIR and identity rules",
    watchItems: ["FHIR R4/R5 readiness", "SMART launch", "patient matching", "HHS identity policy"],
    currentUse: "Synthetic validation and architecture planning."
  },
  {
    domain: "OCR and HHS enforcement signals",
    watchItems: ["privacy enforcement", "AI guidance", "cybersecurity guidance", "patient access rules"],
    currentUse: "Governance watch only; legal review required before claims or production use."
  }
];

export const SCRIMED_VALUE_PRICING_FRAMEWORK: ScrimedWorkflowValueMetric[] = [
  {
    metricId: "denial-risk-reduction",
    name: "Denial risk reduction",
    buyerValue: "Find missing documentation, policy-risk language, and appeal-readiness gaps before submission.",
    pricingSignal: "Price by recovered staff time, reduced rework, and prevented avoidable denials.",
    measuredWith: "Synthetic prior-auth and documentation-before-authorization scorecards.",
    boundary: "No payer submission or reimbursement guarantee."
  },
  {
    metricId: "documentation-time-saved",
    name: "Documentation time saved",
    buyerValue: "Reduce review, packet assembly, and handoff effort for human-reviewed workflows.",
    pricingSignal: "Price by workflow volume, role burden, and validated time-saved estimate.",
    measuredWith: "No-PHI task timing, reviewer disposition, and acceptance criteria.",
    boundary: "No autonomous chart filing, diagnosis, treatment, or EHR writeback."
  },
  {
    metricId: "workflow-throughput",
    name: "Workflow throughput",
    buyerValue: "Increase referral, scheduling, intake, and care-coordination visibility without live patient automation.",
    pricingSignal: "Price by routed workflow count, dashboard readiness, and governance overhead reduced.",
    measuredWith: "Synthetic queue, status, and escalation metrics.",
    boundary: "No patient outreach or live clinical action."
  },
  {
    metricId: "governance-readiness",
    name: "Governance readiness",
    buyerValue: "Give leadership an audit-ready operating model for AI review, safety, and evidence.",
    pricingSignal: "Price as recurring readiness retainer, evidence packet, or governance implementation work.",
    measuredWith: "Policy coverage, smoke coverage, boundary register, and audit hash completeness.",
    boundary: "No certification, legal approval, security assurance, or customer go-live claim."
  }
];

export const SCRIMED_SKILL_ACTIVATION_REGISTRY: ScrimedSkillActivation[] = [
  {
    id: "governance-skill",
    name: "Governance Skill",
    purpose: "Route every sensitive SCRIMED action through policy, review, audit, and retained boundaries.",
    inputs: ["agent session", "requested action", "tool scope", "safety policy"],
    outputs: ["policy decision", "risk score", "audit event"],
    guardrails: SCRIMED_CLINICAL_BOUNDARIES,
    activationStatus: "active",
    maturityLevel: "review_ready",
    nextAction: "Bind governance decisions to every future clinical-facing route and demo artifact."
  },
  {
    id: "agent-learning-skill",
    name: "Agent Learning Skill",
    purpose: "Turn reviewed failures into correction artifacts, retests, and monitored improvements.",
    inputs: ["trace metadata", "reviewer note", "benchmark result"],
    outputs: ["correction artifact", "regression test candidate", "learning update"],
    guardrails: ["Memory is not learning until evaluated, approved, retested, and monitored."],
    activationStatus: "active",
    maturityLevel: "lab_ready",
    nextAction: "Promote failed synthetic traces into reusable regression cases."
  },
  {
    id: "clinical-safety-skill",
    name: "Clinical Safety Skill",
    purpose: "Keep clinical-facing content in decision-support and human-review lanes.",
    inputs: ["clinical-facing flag", "risk score", "evidence status"],
    outputs: ["review requirement", "red flag", "boundary statement"],
    guardrails: SCRIMED_CLINICAL_BOUNDARIES,
    activationStatus: "active",
    maturityLevel: "review_ready",
    nextAction: "Map every clinical module to reviewer role, escalation reason, and benchmark domain."
  },
  {
    id: "regulatory-watch-skill",
    name: "Regulatory Watch Skill",
    purpose: "Track HIPAA, HTI-6, FHIR, OCR, HHS identity, and adjacent AI governance signals.",
    inputs: ["regulatory domain", "source category", "impact note"],
    outputs: ["watch item", "owner", "roadmap implication"],
    guardrails: ["Legal review required before claims, policy changes, or production release."],
    activationStatus: "lab_only",
    maturityLevel: "defined",
    nextAction: "Attach owners and update cadence for each watch domain."
  },
  {
    id: "ai-visibility-skill",
    name: "AI Visibility Skill",
    purpose: "Help AI search engines describe SCRIMED accurately using public boundaries and canonical routes.",
    inputs: ["llms.txt", "canonical page map", "approved claims"],
    outputs: ["AI-safe overview", "product map", "description guardrails"],
    guardrails: ["No autonomous clinical care framing, no certification claim, no live PHI claim."],
    activationStatus: "active",
    maturityLevel: "lab_ready",
    nextAction: "Add structured page metadata recommendations to high-value public routes."
  },
  {
    id: "value-pricing-skill",
    name: "Value Pricing Skill",
    purpose: "Tie price to measurable workflow value rather than token usage or generic chatbot access.",
    inputs: ["workflow metric", "buyer segment", "proof route"],
    outputs: ["pricing signal", "pilot offer", "margin guardrail"],
    guardrails: ["No ROI guarantee, revenue guarantee, reimbursement assurance, or audited financial claim."],
    activationStatus: "active",
    maturityLevel: "review_ready",
    nextAction: "Create audience-specific pricing proof packets for clinics, health systems, and strategic partners."
  },
  {
    id: "radiology-workflow-skill",
    name: "Radiology Workflow Skill",
    purpose: "Convert imaging workflow metadata into follow-up, routing, documentation, and review readiness.",
    inputs: ["synthetic imaging metadata", "turnaround status", "follow-up flag"],
    outputs: ["workflow action recommendation", "review requirement", "audit event"],
    guardrails: ["No final imaging interpretation or diagnostic authority."],
    activationStatus: "lab_only",
    maturityLevel: "defined",
    nextAction: "Bind imaging-to-action scenarios to DICOM metadata, specialist review, and closed-loop follow-up status."
  },
  {
    id: "wearables-intelligence-skill",
    name: "Wearables Intelligence Skill",
    purpose: "Prepare no-PHI trend, adherence, access, and escalation workflows for wearable and remote monitoring data.",
    inputs: ["synthetic time-series", "device status", "trend summary"],
    outputs: ["review signal", "accessibility note", "workflow escalation"],
    guardrails: ["No diagnosis, emergency triage replacement, or patient outreach automation."],
    activationStatus: "lab_only",
    maturityLevel: "defined",
    nextAction: "Define synthetic time-series scenarios and human escalation thresholds."
  },
  {
    id: "interoperability-skill",
    name: "Interoperability Skill",
    purpose: "Keep A2A, MCP, FHIR, HIE, and identity integration plans governed and connector-safe.",
    inputs: ["standard", "tool scope", "identity context"],
    outputs: ["readiness status", "blocked action", "integration boundary"],
    guardrails: ["No production connector activation or raw system-of-record access."],
    activationStatus: "active",
    maturityLevel: "lab_ready",
    nextAction: "Map MCP tools to explicit per-agent authorization scopes."
  },
  {
    id: "observability-skill",
    name: "Observability Skill",
    purpose: "Trace cost, latency, tool calls, policy events, reviewer outcomes, and safety signals.",
    inputs: ["agent trace", "policy event", "benchmark result"],
    outputs: ["trace summary", "audit hash", "monitoring signal"],
    guardrails: ["No token, secret, PHI, or raw connector payload logging."],
    activationStatus: "active",
    maturityLevel: "review_ready",
    nextAction: "Attach learning-loop stages to AI Flight Recorder outputs."
  },
  {
    id: "devsecops-skill",
    name: "DevSecOps Skill",
    purpose: "Protect the build with contract checks, smoke tests, boundary scans, and route integrity.",
    inputs: ["source diff", "contract check", "smoke result"],
    outputs: ["pass/fail evidence", "blocker", "release note"],
    guardrails: ["No deployment promotion without explicit human approval."],
    activationStatus: "active",
    maturityLevel: "review_ready",
    nextAction: "Add governance-learning loop to nonsecret and public smoke coverage."
  },
  {
    id: "investor-narrative-skill",
    name: "Investor Narrative Skill",
    purpose: "Translate governance, safety, workflow value, and platform architecture into a diligence-ready story.",
    inputs: ["proof route", "scorecard", "value metric"],
    outputs: ["pitch point", "demo path", "safe claim"],
    guardrails: ["No securities advice, valuation assurance, certification claim, or customer go-live claim."],
    activationStatus: "active",
    maturityLevel: "review_ready",
    nextAction: "Build a founder run-of-show connecting value pricing, governance, and proof routes."
  }
];

export const SCRIMED_RADIOLOGY_IMAGING_TO_ACTION = {
  status: "lab_only_workflow_metadata",
  purpose:
    "Convert synthetic imaging workflow signals into routing, follow-up, documentation, and specialist-review readiness without final interpretation.",
  actions: [
    "flag delayed imaging turnaround",
    "route to human imaging reviewer",
    "prepare follow-up checklist",
    "bind provenance to synthetic DICOM metadata",
    "track closed-loop follow-up status"
  ],
  boundary: "No final medical interpretation, diagnosis, treatment, or autonomous patient outreach."
};

export const SCRIMED_WEARABLES_INTELLIGENCE_FOUNDATION = {
  status: "lab_only_synthetic_time_series",
  purpose: "Prepare future RPM and wearable-data workflows around trends, access, adherence, and review queues.",
  signals: ["device connectivity gap", "trend anomaly", "adherence risk", "accessibility barrier", "review threshold reached"],
  boundary: "No emergency triage replacement, diagnosis, prescribing, patient outreach, or live-monitoring claim."
};

export function createScrimedCorrectionArtifact(input: Omit<ScrimedCorrectionArtifact, "auditHash">): ScrimedCorrectionArtifact {
  return {
    ...input,
    auditHash: generateScrimedAuditHash({
      ...input,
      safetyPolicyVersion: scrimedSafetyPolicyVersion
    })
  };
}

export function createScrimedGovernanceAuditEvent(
  input: Omit<ScrimedGovernanceAuditEvent, "policyVersion" | "timestamp" | "auditHash">
): ScrimedGovernanceAuditEvent {
  const timestamp = "2026-07-07T00:00:00.000Z";
  const event = {
    ...input,
    policyVersion: scrimedSafetyPolicyVersion,
    timestamp
  };

  return {
    ...event,
    auditHash: generateScrimedAuditHash(event)
  };
}

export function getScrimedGovernanceLearningLoopSummary() {
  const sampleCorrection = createScrimedCorrectionArtifact({
    artifactId: "correction-synthetic-policy-review-001",
    sourceTraceId: "trace-synthetic-agent-review-001",
    correctionType: "policy",
    memorySummary: "The trace stored what happened: an agent attempted a clinical-facing output after reading untrusted content.",
    learningUpdate:
      "The next attempt must require human review, evidence grounding, prompt-injection risk elevation, and retest before artifact promotion.",
    approvalRequired: true,
    retestRequired: true,
    monitorMetric: "clinical-facing outputs with reviewer approval before promotion"
  });

  return {
    service: "scrimed-governance-learning-loop",
    mission:
      "SCRIMED governance turns memory, auditability, policy enforcement, learning artifacts, value pricing, regulatory watch, and interoperability readiness into a healthcare AI operating advantage.",
    status: "active-synthetic-no-phi-governance-layer",
    activeModules: [
      "Governance + Learning Loop Control Plane",
      "Contextual Agent Policy Engine",
      "A2A + MCP Readiness Layer",
      "AI Visibility Layer",
      "Value-Based Pricing Framework",
      "Healthcare AI Governance Dashboard",
      "Radiology Imaging-to-Action Workflow",
      "Wearables Intelligence Foundation",
      "Regulatory Watch Layer",
      "Agent Observability + Audit Trail",
      "Skills Activation Registry"
    ],
    policyVersion: scrimedSafetyPolicyVersion,
    clinicalBoundaries: SCRIMED_CLINICAL_BOUNDARIES,
    policyLevels: SCRIMED_AGENT_POLICY_LEVELS,
    learningLoopStages: SCRIMED_GOVERNANCE_LEARNING_LOOP,
    pricingModel: SCRIMED_VALUE_PRICING_FRAMEWORK,
    regulatoryWatchScope: SCRIMED_REGULATORY_WATCH_SCOPE,
    a2aMcpReadiness: SCRIMED_A2A_MCP_READINESS,
    skillsActivated: SCRIMED_SKILL_ACTIVATION_REGISTRY,
    radiologyImagingToAction: SCRIMED_RADIOLOGY_IMAGING_TO_ACTION,
    wearablesIntelligence: SCRIMED_WEARABLES_INTELLIGENCE_FOUNDATION,
    sampleCorrectionArtifact: sampleCorrection,
    recommendedNextBuildStep:
      "Bind the governance-learning loop to AI Flight Recorder traces so failed synthetic traces can become reviewed regression cases before any artifact promotion.",
    productionReadiness: false,
    noPhiConfirmed: true,
    safetyStatement:
      "Research/demo use only. SCRIMED supports human-reviewed decision support, education, workflow support, and administrative automation only."
  };
}
