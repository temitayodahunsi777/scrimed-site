import { scrimedModules } from "../scrimedModuleRegistry";
import {
  computeTrustOpsScore,
  trustOpsSchemaVersion,
  validateTrustOpsModuleBrief,
  type TrustOpsModule,
  type TrustOpsModuleBrief,
  type TrustOpsModuleCategory,
  type TrustOpsScoreInputs
} from "./trustops-schema";

type TrustOpsModuleDraft = Omit<
  TrustOpsModule,
  "trustScore" | "governanceScore" | "automationRisk" | "interoperabilityReadiness"
> & {
  scoreInputs: TrustOpsScoreInputs;
};

export type TrustOpsOrchestrationLane = {
  id: string;
  name: string;
  trigger: string;
  moduleIds: string[];
  sequence: string[];
  humanGate: string;
  safeOutputs: string[];
  blockedActions: string[];
};

export const scrimedTrustOpsRoute = "/scrimed-trustops";
export const scrimedTrustOpsApiRoute = "/api/scrimed-trustops";
export const scrimedTrustOpsStatus = "scrimed-trustops-synthetic-ready";

export const scrimedTrustOpsPositioning =
  "SCRIMED TrustOps Intelligence Layer is a synthetic-only architecture layer that prepares SCRIMED for safe healthcare agent orchestration by combining module governance, signal detection, structured validation, semantic intelligence, and human-in-the-loop remediation recommendations.";

export const scrimedTrustOpsSafetyBoundary =
  "Demo/synthetic only. SCRIMED TrustOps does not authorize live PHI, autonomous diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, billing submission, production connector use, certification claims, compliance completion claims, or customer go-live.";

const standardSafetyBoundaries = [
  "Demo/synthetic only; no live PHI or patient identifiers.",
  "Human review required for clinical, payer, EHR, compliance, outreach, or billing-impacting work.",
  "Recommendations only; no autonomous diagnosis, treatment, prescribing, outreach, payer submission, EHR writeback, billing submission, or production connector use.",
  "Evidence, schema validation, and auditability required before any pilot-facing output.",
  "No claim of HIPAA, SOC 2, HITRUST, FDA, ONC, clinical validation, or compliance completion."
];

const standardEvidenceRequirements = [
  "Synthetic input fixture",
  "Structured output schema validation",
  "Safety-boundary statement",
  "Human-review disposition placeholder",
  "Evidence and audit trace reference"
];

function createTrustOpsModule(draft: TrustOpsModuleDraft): TrustOpsModule {
  const { scoreInputs, ...module } = draft;
  const trustScore = computeTrustOpsScore(scoreInputs);

  return {
    ...module,
    trustScore,
    governanceScore: trustScore.governance,
    automationRisk: trustScore.riskPenalty,
    interoperabilityReadiness: trustScore.interoperability
  };
}

function moduleDraft(input: {
  id: string;
  name: string;
  category: TrustOpsModuleCategory;
  description: string;
  strategicValue: number;
  capabilities: string[];
  requiredData: string[];
  syntheticInputs: string[];
  structuredOutputs: string[];
  scoreInputs: TrustOpsScoreInputs;
  recommendedNextBuildStep: string;
}): TrustOpsModule {
  return createTrustOpsModule({
    ...input,
    safetyBoundaries: standardSafetyBoundaries,
    evidenceRequirements: standardEvidenceRequirements
  });
}

export const trustOpsModules: TrustOpsModule[] = [
  moduleDraft({
    id: "patient-journey-memory",
    name: "Patient Journey Memory",
    category: "memory",
    description:
      "Purpose-bound synthetic memory for longitudinal journey context, handoff continuity, care-gap visibility, and reviewer-approved recall.",
    strategicValue: 92,
    capabilities: ["Journey timeline synthesis", "Handoff context recall", "Care-gap context flags", "Preference-safe memory scoping"],
    requiredData: ["Synthetic journey events", "Synthetic encounter milestones", "Consent and purpose placeholders"],
    syntheticInputs: ["Demo journey timeline", "No-PHI care-gap fixture", "Synthetic handoff note"],
    structuredOutputs: ["journey_memory_brief", "care_gap_context_packet", "memory_scope_audit"],
    scoreInputs: { safety: 89, evidence: 84, workflowValue: 92, governance: 88, interoperability: 78, riskPenalty: 42 },
    recommendedNextBuildStep:
      "Bind synthetic journey memory to module brief validation with purpose, TTL, reviewer, and deletion-event fields."
  }),
  moduleDraft({
    id: "clinical-intelligence",
    name: "Clinical Intelligence",
    category: "clinical-intelligence",
    description:
      "Human-reviewed synthetic clinical reasoning support that surfaces evidence, uncertainty, missing data, and escalation criteria without clinical authority.",
    strategicValue: 96,
    capabilities: ["Evidence synthesis", "Missing-data risk flags", "Clinical uncertainty reporting", "Escalation criteria drafting"],
    requiredData: ["Synthetic clinical scenarios", "Public guideline references", "Reviewer rubric"],
    syntheticInputs: ["Synthetic note", "Synthetic labs", "Synthetic guideline card"],
    structuredOutputs: ["clinical_intelligence_brief", "evidence_gap_report", "human_review_packet"],
    scoreInputs: { safety: 91, evidence: 88, workflowValue: 95, governance: 90, interoperability: 74, riskPenalty: 48 },
    recommendedNextBuildStep:
      "Require ClinicalBench pass/fail evidence and Trust Score explanation before expanding any clinical-intelligence demo."
  }),
  moduleDraft({
    id: "rcm-denials",
    name: "RCM / Denials",
    category: "revenue-cycle",
    description:
      "Synthetic denial-pattern intelligence for root-cause analysis, documentation packet readiness, and manual follow-up recommendations.",
    strategicValue: 91,
    capabilities: ["Denial spike detection", "Documentation gap mapping", "Appeal packet draft requirements", "RCM owner routing"],
    requiredData: ["Synthetic denial events", "Synthetic claim metadata", "Payer-rule placeholders"],
    syntheticInputs: ["Denied claim spike fixture", "Missing modifier fixture", "Synthetic denial reason codes"],
    structuredOutputs: ["denial_signal_report", "documentation_gap_packet", "manual_routing_recommendation"],
    scoreInputs: { safety: 87, evidence: 82, workflowValue: 93, governance: 86, interoperability: 80, riskPenalty: 55 },
    recommendedNextBuildStep:
      "Add no-submission denial packet generation with manual verification and payer-action hard stops."
  }),
  moduleDraft({
    id: "prior-authorization",
    name: "Prior Authorization",
    category: "revenue-cycle",
    description:
      "Synthetic prior-authorization workflow intelligence for stalled tasks, missing packets, evidence requirements, and human-reviewed next steps.",
    strategicValue: 90,
    capabilities: ["PA stall detection", "Missing documentation checklist", "Evidence packet regeneration", "Manual verification queueing"],
    requiredData: ["Synthetic authorization events", "Synthetic document checklist", "Policy placeholders"],
    syntheticInputs: ["Prior auth stalled fixture", "Missing packet fixture", "Synthetic payer criteria"],
    structuredOutputs: ["prior_auth_status_packet", "missing_packet_checklist", "manual_review_queue_item"],
    scoreInputs: { safety: 88, evidence: 83, workflowValue: 91, governance: 89, interoperability: 77, riskPenalty: 57 },
    recommendedNextBuildStep:
      "Connect prior-auth recommendations to durable review packets without enabling payer submission."
  }),
  moduleDraft({
    id: "patient-access",
    name: "Patient Access",
    category: "patient-access",
    description:
      "Synthetic access operations intelligence for intake friction, eligibility-ready packets, scheduling handoffs, and service-line routing.",
    strategicValue: 87,
    capabilities: ["Access bottleneck detection", "Eligibility packet readiness", "Service-line routing recommendation", "Intake completeness scoring"],
    requiredData: ["Synthetic access events", "Synthetic intake forms", "Eligibility placeholders"],
    syntheticInputs: ["Access delay fixture", "Incomplete intake fixture", "Synthetic eligibility metadata"],
    structuredOutputs: ["access_readiness_score", "intake_gap_packet", "manual_routing_recommendation"],
    scoreInputs: { safety: 90, evidence: 79, workflowValue: 88, governance: 86, interoperability: 76, riskPenalty: 39 },
    recommendedNextBuildStep:
      "Add synthetic access-score trend view with owner assignment and escalation boundaries."
  }),
  moduleDraft({
    id: "scheduling",
    name: "Scheduling",
    category: "patient-access",
    description:
      "Synthetic scheduling intelligence for wait-time signals, capacity constraints, referral handoffs, and manual appointment-workflow recommendations.",
    strategicValue: 86,
    capabilities: ["Wait-time signal detection", "Capacity bottleneck summaries", "Referral handoff readiness", "Manual scheduling task routing"],
    requiredData: ["Synthetic scheduling events", "Synthetic capacity slots", "Synthetic referral statuses"],
    syntheticInputs: ["Referral delay fixture", "Capacity squeeze fixture", "Wait-time fixture"],
    structuredOutputs: ["scheduling_signal_report", "capacity_gap_packet", "manual_queue_recommendation"],
    scoreInputs: { safety: 91, evidence: 78, workflowValue: 87, governance: 85, interoperability: 79, riskPenalty: 38 },
    recommendedNextBuildStep:
      "Create synthetic scheduling replay scenarios before any calendar or patient-facing integration is considered."
  }),
  moduleDraft({
    id: "referral-management",
    name: "Referral Management",
    category: "patient-access",
    description:
      "Synthetic closed-loop referral intelligence for leakage, delays, owner routing, wait-time risk, and feedback packet generation.",
    strategicValue: 93,
    capabilities: ["Referral delay detection", "Leakage risk scoring", "Closed-loop status tracking", "Provider-matching readiness"],
    requiredData: ["Synthetic referral events", "Synthetic provider directory", "Insurance verification placeholders"],
    syntheticInputs: ["Referral delay fixture", "Referral leakage fixture", "Provider matching fixture"],
    structuredOutputs: ["referral_signal_report", "leakage_risk_packet", "closed_loop_feedback_packet"],
    scoreInputs: { safety: 89, evidence: 82, workflowValue: 94, governance: 88, interoperability: 83, riskPenalty: 47 },
    recommendedNextBuildStep:
      "Bind referral intelligence to human-reviewed owner routing and no-outreach hard stops."
  }),
  moduleDraft({
    id: "imaging-intelligence",
    name: "Imaging Intelligence",
    category: "imaging",
    description:
      "Synthetic imaging operations intelligence for turnaround delays, DICOM workflow status, report-readiness gaps, and manual escalation packets.",
    strategicValue: 89,
    capabilities: ["Imaging turnaround detection", "DICOM metadata readiness", "Report-delay summaries", "Radiology workflow escalation"],
    requiredData: ["Synthetic DICOM metadata", "Synthetic imaging worklist events", "Synthetic report status"],
    syntheticInputs: ["Imaging turnaround fixture", "DICOM status fixture", "Report delay fixture"],
    structuredOutputs: ["imaging_signal_report", "turnaround_delay_packet", "radiology_review_queue_item"],
    scoreInputs: { safety: 90, evidence: 81, workflowValue: 88, governance: 87, interoperability: 86, riskPenalty: 44 },
    recommendedNextBuildStep:
      "Add imaging-operation fixtures for modality, site, report status, and reviewer escalation without image diagnosis."
  }),
  moduleDraft({
    id: "population-health",
    name: "Population Health",
    category: "population-health",
    description:
      "Synthetic population-risk intelligence for care-gap patterns, outreach-ready-but-blocked tasks, stratification explainability, and reviewer queues.",
    strategicValue: 88,
    capabilities: ["Care-gap signal detection", "Synthetic cohort stratification", "Population trend summaries", "Manual intervention queueing"],
    requiredData: ["Synthetic cohort events", "Quality measure placeholders", "Reviewer policy rules"],
    syntheticInputs: ["Care gap fixture", "Synthetic cohort fixture", "Risk trend fixture"],
    structuredOutputs: ["population_signal_report", "care_gap_packet", "manual_review_queue_item"],
    scoreInputs: { safety: 89, evidence: 80, workflowValue: 89, governance: 87, interoperability: 78, riskPenalty: 50 },
    recommendedNextBuildStep:
      "Add de-identification and consent-state placeholders before any non-synthetic population workflow design."
  }),
  moduleDraft({
    id: "quality-hedis-star",
    name: "Quality / HEDIS / STAR",
    category: "quality",
    description:
      "Synthetic quality intelligence for measure-gap detection, evidence readiness, denominator/numerator traceability, and reviewer-owned remediation queues.",
    strategicValue: 87,
    capabilities: ["Measure-gap detection", "Evidence readiness scoring", "Quality packet drafting", "Reviewer disposition tracking"],
    requiredData: ["Synthetic quality events", "Synthetic measure definitions", "Evidence placeholders"],
    syntheticInputs: ["HEDIS gap fixture", "STAR measure fixture", "Synthetic evidence packet"],
    structuredOutputs: ["quality_signal_report", "measure_gap_packet", "reviewer_disposition_item"],
    scoreInputs: { safety: 90, evidence: 84, workflowValue: 87, governance: 89, interoperability: 81, riskPenalty: 45 },
    recommendedNextBuildStep:
      "Create measure-specific synthetic validation packs with no payer submission or performance-guarantee claims."
  }),
  moduleDraft({
    id: "governance-compliance",
    name: "Governance / Compliance",
    category: "governance",
    description:
      "Synthetic governance intelligence for sensitive-task triage, audit readiness, policy gates, evidence completeness, and compliance escalation recommendations.",
    strategicValue: 95,
    capabilities: ["Policy-gate enforcement", "Sensitive-task detection", "Evidence completeness checks", "Compliance escalation packets"],
    requiredData: ["Synthetic policy decisions", "Audit event metadata", "Control checklist placeholders"],
    syntheticInputs: ["Compliance-sensitive task fixture", "Missing evidence fixture", "Policy exception fixture"],
    structuredOutputs: ["governance_decision_packet", "compliance_escalation_packet", "audit_readiness_report"],
    scoreInputs: { safety: 96, evidence: 87, workflowValue: 90, governance: 96, interoperability: 78, riskPenalty: 33 },
    recommendedNextBuildStep:
      "Make governance/compliance the required supervisor lane for every TrustOps recommendation."
  }),
  moduleDraft({
    id: "signal-detection",
    name: "Signal Detection",
    category: "operations",
    description:
      "Synthetic event analysis that detects operational issues, low-confidence outputs, integration drift, and safety-sensitive workflow conditions.",
    strategicValue: 94,
    capabilities: ["Synthetic event rule evaluation", "Severity assignment", "Owner routing", "Human-review recommendation generation"],
    requiredData: ["Synthetic operational events", "Threshold rules", "Workflow owner map"],
    syntheticInputs: ["Signal fixture set", "Threshold config fixture", "Synthetic event stream"],
    structuredOutputs: ["synthetic_signal", "owner_routing_packet", "review_required_flag"],
    scoreInputs: { safety: 94, evidence: 85, workflowValue: 93, governance: 92, interoperability: 82, riskPenalty: 36 },
    recommendedNextBuildStep:
      "Promote signal rules into versioned policy-controlled fixtures with replayable synthetic traces."
  }),
  moduleDraft({
    id: "self-healing-operations",
    name: "Self-Healing Operations",
    category: "operations",
    description:
      "Recommendation-only remediation planning for retry, validation, investigation, review, duplicate reconciliation, and automation pause workflows.",
    strategicValue: 91,
    capabilities: ["Recommendation-only remediation", "Human-review gating", "Blocked-action enforcement", "Operational owner routing"],
    requiredData: ["Synthetic signals", "Workflow policy", "Owner map", "Run trace metadata"],
    syntheticInputs: ["Failed sync fixture", "Duplicate context fixture", "Low-confidence output fixture"],
    structuredOutputs: ["self_healing_recommendation", "manual_verification_task", "automation_pause_packet"],
    scoreInputs: { safety: 93, evidence: 82, workflowValue: 92, governance: 94, interoperability: 80, riskPenalty: 41 },
    recommendedNextBuildStep:
      "Connect recommendation outputs to human-run packets and keep all real-world execution disabled."
  }),
  moduleDraft({
    id: "semantic-intelligence-graph",
    name: "Semantic Intelligence Graph",
    category: "semantic-infrastructure",
    description:
      "Synthetic semantic graph linking modules, signals, evidence requirements, safety controls, workflow owners, and remediation recommendations.",
    strategicValue: 90,
    capabilities: ["Module-signal graphing", "Evidence lineage", "Safety-boundary traversal", "Owner and workflow mapping"],
    requiredData: ["Module registry", "Synthetic signals", "Evidence requirements", "Governance controls"],
    syntheticInputs: ["Registry fixture", "Signal fixture", "Evidence graph fixture"],
    structuredOutputs: ["semantic_graph_node", "evidence_lineage_packet", "trustops_dependency_map"],
    scoreInputs: { safety: 92, evidence: 84, workflowValue: 88, governance: 91, interoperability: 84, riskPenalty: 35 },
    recommendedNextBuildStep:
      "Use graph nodes to make every TrustOps output traceable to module, signal, evidence, and governance-control sources."
  }),
  moduleDraft({
    id: "secure-middleware-gateway",
    name: "Secure Middleware Gateway",
    category: "secure-middleware",
    description:
      "Governed middleware abstraction for future MCP/tool access, authorization, schema validation, rate limits, audit logs, and no-direct-system access.",
    strategicValue: 95,
    capabilities: ["Tool authorization map", "Schema validation boundary", "No direct LLM-to-system access", "Audit and revocation readiness"],
    requiredData: ["Tool registry placeholders", "Role scope placeholders", "Synthetic tool-call traces"],
    syntheticInputs: ["Synthetic tool request", "Permission scope fixture", "Blocked connector fixture"],
    structuredOutputs: ["tool_authorization_decision", "middleware_audit_event", "blocked_action_packet"],
    scoreInputs: { safety: 97, evidence: 86, workflowValue: 91, governance: 96, interoperability: 87, riskPenalty: 31 },
    recommendedNextBuildStep:
      "Require middleware authorization decisions for every future tool call before real connector evaluation."
  })
];

export const trustOpsOrchestrationLayer: TrustOpsOrchestrationLane[] = [
  {
    id: "clinical-and-memory-supervision",
    name: "Clinical and Memory Supervision",
    trigger: "Synthetic clinical, journey, or population-health output needs evidence and reviewer disposition.",
    moduleIds: ["patient-journey-memory", "clinical-intelligence", "population-health", "governance-compliance"],
    sequence: ["classify synthetic context", "validate structured brief", "attach evidence requirements", "route to human review"],
    humanGate: "Qualified clinical or governance reviewer must approve before any pilot-facing claim.",
    safeOutputs: ["validated synthetic brief", "evidence gap report", "review queue item"],
    blockedActions: ["diagnosis", "treatment", "prescribing", "patient outreach", "EHR writeback"]
  },
  {
    id: "administrative-operations-supervision",
    name: "Administrative Operations Supervision",
    trigger: "Synthetic RCM, prior-auth, access, scheduling, referral, or quality signal crosses threshold.",
    moduleIds: ["rcm-denials", "prior-authorization", "patient-access", "scheduling", "referral-management", "quality-hedis-star"],
    sequence: ["detect synthetic signal", "score workflow value", "recommend owner", "generate manual verification packet"],
    humanGate: "Operational owner must review before any real payer, billing, outreach, or connector action.",
    safeOutputs: ["manual verification packet", "blocked-action note", "owner routing recommendation"],
    blockedActions: ["payer submission", "billing submission", "patient outreach", "production connector use"]
  },
  {
    id: "platform-self-healing-supervision",
    name: "Platform Self-Healing Supervision",
    trigger: "Synthetic integration, confidence, duplicate-context, compliance-sensitive, or failed-sync signal appears.",
    moduleIds: ["signal-detection", "self-healing-operations", "semantic-intelligence-graph", "secure-middleware-gateway"],
    sequence: ["classify signal", "validate recommendation schema", "pause unsafe automation", "open human-run packet"],
    humanGate: "Platform or compliance owner must approve remediation before any production change.",
    safeOutputs: ["recommendation-only remediation plan", "investigation ticket draft", "automation pause packet"],
    blockedActions: ["autonomous remediation", "production connector mutation", "PHI-impacting action"]
  }
];

export const trustOpsGovernanceChecklist = [
  "Every TrustOps module is demo/synthetic only.",
  "Every module brief must pass structured-output validation.",
  "Every signal requires human review.",
  "Every self-healing output is recommendation-only.",
  "No live PHI, diagnosis, treatment, prescribing, outreach, payer submission, EHR writeback, billing submission, or production connector action is authorized.",
  "Safety and governance carry the highest weights in TrustOps scoring.",
  "Secure Middleware Gateway remains the required future path between agents and systems of record.",
  "Semantic Intelligence Graph links modules, signals, evidence, owners, safety controls, and recommendations."
];

export function buildTrustOpsModuleBrief(module: TrustOpsModule): TrustOpsModuleBrief {
  return {
    schemaVersion: trustOpsSchemaVersion,
    moduleId: module.id,
    moduleName: module.name,
    syntheticOnly: true,
    category: module.category,
    trustScore: module.trustScore,
    strategicValue: module.strategicValue,
    capabilities: module.capabilities,
    evidenceRequirements: module.evidenceRequirements,
    safetyBoundaries: module.safetyBoundaries,
    recommendedNextBuildStep: module.recommendedNextBuildStep
  };
}

export function buildTrustOpsModuleBriefs() {
  return trustOpsModules.map(buildTrustOpsModuleBrief);
}

export function validateTrustOpsRegistry() {
  const requiredNames = [
    "Patient Journey Memory",
    "Clinical Intelligence",
    "RCM / Denials",
    "Prior Authorization",
    "Patient Access",
    "Scheduling",
    "Referral Management",
    "Imaging Intelligence",
    "Population Health",
    "Quality / HEDIS / STAR",
    "Governance / Compliance",
    "Signal Detection",
    "Self-Healing Operations",
    "Semantic Intelligence Graph",
    "Secure Middleware Gateway"
  ];
  const moduleNames = new Set(trustOpsModules.map((module) => module.name));
  const moduleBriefValidations = buildTrustOpsModuleBriefs().map(validateTrustOpsModuleBrief);
  const checks = [
    {
      check: "all-required-trustops-modules-registered",
      passed: trustOpsModules.length === 15 && requiredNames.every((name) => moduleNames.has(name)),
      detail: "All 15 requested TrustOps capability modules must be present."
    },
    {
      check: "trust-score-ranges-valid",
      passed: trustOpsModules.every((module) => module.trustScore.total >= 0 && module.trustScore.total <= 100),
      detail: "Every module trust score must stay within 0-100."
    },
    {
      check: "safety-and-governance-weighted",
      passed: trustOpsModules.every((module) => module.trustScore.formula.includes("safety*0.30") && module.trustScore.formula.includes("governance*0.25")),
      detail: "TrustOps scoring must weight safety and governance highest."
    },
    {
      check: "synthetic-only-boundaries-present",
      passed: trustOpsModules.every((module) =>
        module.safetyBoundaries.some((boundary) => boundary.toLowerCase().includes("demo/synthetic only"))
      ),
      detail: "Every module must clearly state demo/synthetic only."
    },
    {
      check: "no-autonomous-production-actions",
      passed: trustOpsModules.every((module) =>
        module.safetyBoundaries.some((boundary) => boundary.toLowerCase().includes("recommendations only"))
      ),
      detail: "Every module must block autonomous real-world clinical, payer, billing, EHR, outreach, or connector actions."
    },
    {
      check: "module-briefs-schema-valid",
      passed: moduleBriefValidations.every((result) => result.valid),
      detail: "Every generated module brief must pass lightweight structured-output validation."
    }
  ];

  return {
    status: checks.every((check) => check.passed) ? "pass" : "fail",
    checks,
    moduleBriefValidations
  };
}

export function getTrustOpsRegistrySummary() {
  const validation = validateTrustOpsRegistry();

  return {
    service: "scrimed-trustops-registry",
    status: scrimedTrustOpsStatus,
    route: scrimedTrustOpsRoute,
    apiRoute: scrimedTrustOpsApiRoute,
    schemaVersion: trustOpsSchemaVersion,
    positioning: scrimedTrustOpsPositioning,
    safetyBoundaryStatement: scrimedTrustOpsSafetyBoundary,
    existingScrimedModuleRegistryCount: scrimedModules.length,
    trustOpsModuleCount: trustOpsModules.length,
    averageTrustScore: Math.round(
      trustOpsModules.reduce((sum, module) => sum + module.trustScore.total, 0) / trustOpsModules.length
    ),
    topModulesByStrategicValue: [...trustOpsModules]
      .sort((first, second) => second.strategicValue - first.strategicValue)
      .slice(0, 5),
    highestRiskModules: [...trustOpsModules]
      .sort((first, second) => second.automationRisk - first.automationRisk)
      .slice(0, 5),
    modules: trustOpsModules,
    moduleBriefs: buildTrustOpsModuleBriefs(),
    orchestrationLayer: trustOpsOrchestrationLayer,
    governanceChecklist: trustOpsGovernanceChecklist,
    validation,
    recommendedNextBuildStep:
      "Promote Governance / Compliance, Signal Detection, Self-Healing Operations, Semantic Intelligence Graph, and Secure Middleware Gateway as the TrustOps supervisor layer before enabling any deeper workflow automation."
  };
}
