import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";

export type ScrimedUpgradeDomainId =
  | "secure-agent-runtime"
  | "contextual-policy-engine"
  | "observability-layer"
  | "clinical-evaluation-harness"
  | "multi-model-router"
  | "knowledge-operating-system"
  | "healthcare-workflow-automation"
  | "devsecops-ci-cd"
  | "local-first-edge-ai"
  | "strategic-product-direction";

export type ScrimedUpgradeReadiness =
  | "architecture-ready"
  | "implementation-scaffold-ready"
  | "protected-pilot-prep"
  | "blocked-before-production";

export type ScrimedUpgradeDomain = {
  id: ScrimedUpgradeDomainId;
  title: string;
  objective: string;
  requiredCapabilities: string[];
  implementationArtifacts: string[];
  telemetrySignals: string[];
  humanReviewGate: string;
  blockedActions: string[];
  readiness: ScrimedUpgradeReadiness;
  nextBuildStep: string;
  auditHash: string;
};

export type ContextualPolicyRule = {
  ruleId: string;
  trigger: string;
  decision: "allow_metadata_only" | "increase_risk_score" | "request_approval" | "require_human_review" | "require_elevated_approval";
  rationale: string;
  failClosedBehavior: string;
};

export type UpgradeModelRoutingLane = {
  taskType: string;
  preferredRoute: string;
  privacyRequirement: "standard" | "restricted" | "phi-local-only";
  decisionCriteria: string[];
  humanGate: string;
  blockedUse: string;
};

export type UpgradeWorkflowLane = {
  workflow: string;
  prioritizedUse: string;
  automationBoundary: string;
  requiredReview: string;
  trackedMetrics: string[];
};

export type UpgradeDevSecOpsControl = {
  control: string;
  requiredCheck: string;
  failureMode: "block_merge" | "block_deploy" | "require_review";
  evidence: string;
};

export type UpgradeValidationCheck = {
  check: string;
  passed: boolean;
  detail: string;
};

export const scrimedUpgradeImplementationPlanApiRoute = "/api/scrimed-upgrade-implementation-plan";
export const scrimedUpgradeImplementationPlanBriefRoute = "/api/scrimed-upgrade-implementation-plan/brief";
export const scrimedUpgradeImplementationPlanStatus =
  "scrimed-upgrade-implementation-plan-ready-synthetic-no-phi";

export const scrimedUpgradeImplementationPlanBoundary =
  "SCRIMED Upgrade Implementation Plan is a synthetic/no-PHI architecture and control-plane roadmap. It does not authorize live PHI access, autonomous diagnosis, treatment, prescribing, patient outreach, payer submission, billing submission, EHR writeback, production connector use, production deployment, certification claims, clinical validation claims, or customer go-live.";

const blockedProductionActions = [
  "live PHI processing",
  "autonomous clinical care",
  "diagnosis or treatment authority",
  "prescribing",
  "patient outreach",
  "payer submission",
  "billing submission",
  "EHR writeback",
  "production connector approval",
  "production deploy",
  "certification or clinical validation claim",
  "customer go-live approval"
];

function domainHash(id: string, title: string, requiredCapabilities: string[]) {
  return generateScrimedAuditHash({
    id,
    title,
    requiredCapabilities,
    safetyPolicyVersion: scrimedSafetyPolicyVersion
  });
}

export const scrimedUpgradeDomains: ScrimedUpgradeDomain[] = [
  {
    id: "secure-agent-runtime",
    title: "Secure Agent Runtime",
    objective:
      "Wrap every SCRIMED agent with PHI-aware access control, dynamic session-state permissions, secret scanning, tool-call approval rules, cost ceilings, untrusted-content scoring, immutable audit logs, and emergency stop escalation.",
    requiredCapabilities: [
      "PHI-aware access control",
      "dynamic session-state permissions",
      "secret scanning",
      "tool-call allow/deny/approval rules",
      "cost ceilings",
      "untrusted-content risk scoring",
      "immutable audit logs",
      "emergency stop / human escalation"
    ],
    implementationArtifacts: [
      "Project SENTINEL policy gate",
      "AI Flight Recorder",
      "review-packet registry",
      "regression promotion gate",
      "runtime stop decision metadata"
    ],
    telemetrySignals: ["risk_score", "tool_calls", "cost_usd", "phi_detected", "escalation_events"],
    humanReviewGate: "Required for irreversible, PHI-impacting, clinical, payer, legal, outbound, or deployment actions.",
    blockedActions: blockedProductionActions,
    readiness: "implementation-scaffold-ready",
    nextBuildStep: "Bind Sentinel policy decisions to the protected durable-store path after fresh AAL2 and boundary-release approval.",
    auditHash: domainHash("secure-agent-runtime", "Secure Agent Runtime", [
      "PHI-aware access control",
      "tool-call allow/deny/approval rules"
    ])
  },
  {
    id: "contextual-policy-engine",
    title: "Contextual Policy Engine",
    objective:
      "Evaluate what an agent has read, done, spent, retrieved, and attempted before allowing the next action.",
    requiredCapabilities: [
      "read-PHI restriction escalation",
      "untrusted web content risk scoring",
      "cost threshold approval",
      "patient safety / billing / legal / outbound review gate",
      "destructive mutation elevated approval"
    ],
    implementationArtifacts: ["contextual policy registry", "session-state policy evaluator", "fail-closed approval reasons"],
    telemetrySignals: ["read_phi", "read_untrusted_content", "cost_threshold", "attempted_action", "policy_decision"],
    humanReviewGate: "Required when policy risk crosses protected workflow thresholds.",
    blockedActions: blockedProductionActions,
    readiness: "architecture-ready",
    nextBuildStep: "Add a typed policy evaluation request route that previews policy outcomes without executing tools.",
    auditHash: domainHash("contextual-policy-engine", "Contextual Policy Engine", [
      "read-PHI restriction escalation",
      "cost threshold approval"
    ])
  },
  {
    id: "observability-layer",
    title: "Observability Layer",
    objective:
      "Track token usage, cost, latency, tool calls, retrieval quality, clinical safety flags, PHI events, failed workflows, model selection, and escalation events.",
    requiredCapabilities: [
      "token usage telemetry",
      "cost tracking",
      "latency tracking",
      "tool-call tracing",
      "retrieval quality scoring",
      "clinical safety flags",
      "PHI event metadata",
      "failed workflow traces",
      "model selection metadata",
      "escalation events"
    ],
    implementationArtifacts: ["MedLog-style usage schema", "flight recorder traces", "model-router audit metadata"],
    telemetrySignals: ["tokens_input", "tokens_output", "latency_ms", "model_selected", "retrieval_quality"],
    humanReviewGate: "Required for clinical safety flags, PHI events, and failed protected workflows.",
    blockedActions: blockedProductionActions,
    readiness: "implementation-scaffold-ready",
    nextBuildStep: "Create a unified no-secret telemetry envelope for agent, model, retrieval, policy, and reviewer events.",
    auditHash: domainHash("observability-layer", "Observability Layer", [
      "token usage telemetry",
      "clinical safety flags"
    ])
  },
  {
    id: "clinical-evaluation-harness",
    title: "Clinical Evaluation Harness",
    objective:
      "Evaluate accuracy, source grounding, hallucination risk, clinical usefulness, completeness, verifiability, safety escalation, FHIR/HL7 validity, and prior-authorization documentation quality.",
    requiredCapabilities: [
      "accuracy checks",
      "source grounding checks",
      "hallucination risk checks",
      "clinical usefulness scoring",
      "completeness scoring",
      "verifiability scoring",
      "safety escalation checks",
      "FHIR/HL7 validity checks",
      "prior authorization documentation quality checks"
    ],
    implementationArtifacts: ["clinical robustness lab", "FHIR/HL7 contract checks", "Documentation-Before-Authorization checks"],
    telemetrySignals: ["grounding_score", "hallucination_risk", "fhir_validity", "prior_auth_gap_count"],
    humanReviewGate: "Clinician or qualified reviewer remains final authority for high-risk outputs.",
    blockedActions: blockedProductionActions,
    readiness: "implementation-scaffold-ready",
    nextBuildStep: "Promote validated synthetic failures into nonsecret regression datasets through the Sentinel review gate.",
    auditHash: domainHash("clinical-evaluation-harness", "Clinical Evaluation Harness", [
      "source grounding checks",
      "FHIR/HL7 validity checks"
    ])
  },
  {
    id: "multi-model-router",
    title: "Multi-Model Router",
    objective:
      "Route tasks by purpose, accuracy, latency, privacy, local/on-device availability, cost, and regulatory sensitivity.",
    requiredCapabilities: [
      "clinical reasoning routing",
      "coding routing",
      "medical imaging routing",
      "document parsing / OCR routing",
      "DICOM classification routing",
      "speech-to-text routing",
      "patient education routing",
      "prior authorization routing",
      "summarization routing",
      "translation routing",
      "compliance review routing"
    ],
    implementationArtifacts: ["compute fabric router", "model governance metadata", "local/private inference preference rules"],
    telemetrySignals: ["task_type", "privacy_requirement", "latency_requirement", "cost_class", "selected_model_tier"],
    humanReviewGate: "Required for high-risk clinical, PHI-heavy, payer, imaging, or regulated workflow outputs.",
    blockedActions: blockedProductionActions,
    readiness: "implementation-scaffold-ready",
    nextBuildStep: "Unify compute-fabric route decisions with Sentinel policy and observability envelopes.",
    auditHash: domainHash("multi-model-router", "Multi-Model Router", [
      "clinical reasoning routing",
      "compliance review routing"
    ])
  },
  {
    id: "knowledge-operating-system",
    title: "Knowledge Operating System",
    objective:
      "Turn every completed workflow into a reusable playbook, evaluation case, structured lesson, agent memory artifact, knowledge graph update, and workflow improvement recommendation.",
    requiredCapabilities: [
      "reusable playbook generation",
      "evaluation case generation",
      "structured lesson capture",
      "agent memory artifact",
      "knowledge graph update",
      "workflow improvement recommendation"
    ],
    implementationArtifacts: ["semantic intelligence graph", "decision memory", "reviewer-gated regression manifest"],
    telemetrySignals: ["workflow_completed", "reviewer_disposition", "lesson_hash", "playbook_hash"],
    humanReviewGate: "Knowledge artifacts cannot become precedent until reviewer disposition is complete.",
    blockedActions: blockedProductionActions,
    readiness: "architecture-ready",
    nextBuildStep: "Create nonsecret knowledge artifact envelopes from completed synthetic workflows.",
    auditHash: domainHash("knowledge-operating-system", "Knowledge Operating System", [
      "reusable playbook generation",
      "knowledge graph update"
    ])
  },
  {
    id: "healthcare-workflow-automation",
    title: "Healthcare Workflow Automation",
    objective:
      "Prioritize governed workflows for prior authorization, referral routing, intake, documentation, coding, scheduling, patient follow-up, care coordination, release-of-information, medication shortage visibility, and clinical-trial evidence management.",
    requiredCapabilities: [
      "prior authorization",
      "referral routing",
      "intake",
      "documentation",
      "coding",
      "scheduling",
      "patient follow-up",
      "care coordination",
      "release-of-information requests",
      "medication shortage visibility",
      "clinical trial evidence management"
    ],
    implementationArtifacts: ["workflow registry", "human approval gates", "workflow evidence packets"],
    telemetrySignals: ["workflow_type", "approval_gate", "documentation_gaps", "status", "human_owner"],
    humanReviewGate: "All patient, payer, clinical, outbound, billing, and EHR-impacting steps require human review.",
    blockedActions: blockedProductionActions,
    readiness: "protected-pilot-prep",
    nextBuildStep: "Add per-workflow authority matrices that separate draft, review, and protected execution states.",
    auditHash: domainHash("healthcare-workflow-automation", "Healthcare Workflow Automation", [
      "prior authorization",
      "clinical trial evidence management"
    ])
  },
  {
    id: "devsecops-ci-cd",
    title: "DevSecOps / CI-CD",
    objective:
      "Add automated tests, security scans, dependency scans, PHI leakage tests, FHIR validation, clinical safety regression tests, canary checklist, rollback plan, and infrastructure health checks.",
    requiredCapabilities: [
      "automated tests",
      "security scans",
      "dependency scans",
      "PHI leakage tests",
      "FHIR validation",
      "clinical safety regression tests",
      "canary deployment checklist",
      "rollback plan",
      "infrastructure health checks"
    ],
    implementationArtifacts: ["nonsecret test suite", "contract smoke checks", "build/typecheck/lint gates"],
    telemetrySignals: ["test_status", "dependency_risk", "phi_leakage_check", "rollback_ready"],
    humanReviewGate: "Production changes require release owner approval and rollback evidence.",
    blockedActions: blockedProductionActions,
    readiness: "implementation-scaffold-ready",
    nextBuildStep: "Add a release gate manifest that binds smoke results, reviewer signoff, and rollback readiness.",
    auditHash: domainHash("devsecops-ci-cd", "DevSecOps / CI-CD", [
      "PHI leakage tests",
      "clinical safety regression tests"
    ])
  },
  {
    id: "local-first-edge-ai",
    title: "Local-First / Edge AI",
    objective:
      "Support browser-side de-identification, on-device PHI redaction, offline clinical utilities, local model fallback, DICOM preprocessing, and edge inference for low-connectivity clinics.",
    requiredCapabilities: [
      "browser-side de-identification",
      "on-device PHI redaction",
      "offline clinical utilities",
      "local model fallback",
      "DICOM preprocessing",
      "edge inference for low-connectivity clinics"
    ],
    implementationArtifacts: ["on-device de-identification scaffold", "edge runtime plan", "private inference mode"],
    telemetrySignals: ["execution_target", "redaction_status", "offline_mode", "edge_model_selected"],
    humanReviewGate: "Raw imaging, PHI, and production clinic deployment require explicit authorization.",
    blockedActions: blockedProductionActions,
    readiness: "architecture-ready",
    nextBuildStep: "Define edge runtime capability manifest with PHI transfer defaults set to blocked.",
    auditHash: domainHash("local-first-edge-ai", "Local-First / Edge AI", [
      "browser-side de-identification",
      "edge inference for low-connectivity clinics"
    ])
  },
  {
    id: "strategic-product-direction",
    title: "Strategic Product Direction",
    objective:
      "Position SCRIMED as an AI-native healthcare operating system combining secure agents, clinical intelligence, workflow automation, local-first privacy, governed deployment, and continuous learning infrastructure.",
    requiredCapabilities: [
      "secure agents",
      "clinical intelligence",
      "workflow automation",
      "local-first privacy",
      "governed deployment",
      "continuous learning infrastructure"
    ],
    implementationArtifacts: ["public narrative guardrails", "buyer diligence language", "platform roadmap"],
    telemetrySignals: ["product_readiness_stage", "boundary_status", "buyer_proof_artifact"],
    humanReviewGate: "Public claims require legal, clinical, security, and compliance review before use.",
    blockedActions: blockedProductionActions,
    readiness: "implementation-scaffold-ready",
    nextBuildStep: "Bind this upgrade plan into investor-readiness and operating-command summaries.",
    auditHash: domainHash("strategic-product-direction", "Strategic Product Direction", [
      "governed deployment",
      "continuous learning infrastructure"
    ])
  }
];

export const contextualPolicyRules: ContextualPolicyRule[] = [
  {
    ruleId: "phi-external-action-block",
    trigger: "If agent reads PHI, restrict external actions.",
    decision: "require_human_review",
    rationale: "PHI exposure changes the allowed action boundary for every downstream tool call.",
    failClosedBehavior: "Block outbound communication, external sharing, EHR writeback, payer submission, and model calls outside approved private runtime."
  },
  {
    ruleId: "untrusted-content-risk-score",
    trigger: "If agent reads untrusted web content, increase risk score.",
    decision: "increase_risk_score",
    rationale: "Untrusted content can carry prompt injection, poisoned retrieval, or unsafe workflow instructions.",
    failClosedBehavior: "Require evidence verification and disable privileged tools until reviewer disposition."
  },
  {
    ruleId: "cost-threshold-approval",
    trigger: "If cost exceeds threshold, request approval.",
    decision: "request_approval",
    rationale: "Long agent loops and model routing errors can create API abuse or billing spikes.",
    failClosedBehavior: "Pause the run and return a safe budget-approval request."
  },
  {
    ruleId: "high-stakes-action-review",
    trigger: "If action touches patient safety, billing, legal, or outbound communication, require human review.",
    decision: "require_human_review",
    rationale: "Protected healthcare workflows need accountable human ownership.",
    failClosedBehavior: "Queue the action for reviewer disposition and keep all outputs in draft mode."
  },
  {
    ruleId: "destructive-mutation-elevated-approval",
    trigger: "If action attempts destructive data mutation, require elevated approval.",
    decision: "require_elevated_approval",
    rationale: "Deletion, schema changes, access revocation, and production deploys are irreversible or high blast-radius actions.",
    failClosedBehavior: "Block mutation and require privileged operator approval with rollback plan."
  }
];

export const upgradeModelRoutingLanes: UpgradeModelRoutingLane[] = [
  {
    taskType: "clinical_reasoning",
    preferredRoute: "highest_accuracy_clinical_model_or_validated_private_model",
    privacyRequirement: "restricted",
    decisionCriteria: ["accuracy", "privacy requirements", "regulatory sensitivity", "source grounding"],
    humanGate: "clinician review required",
    blockedUse: "No autonomous diagnosis, treatment, prescribing, or live patient care."
  },
  {
    taskType: "prior_authorization",
    preferredRoute: "payer_policy_reasoning_model",
    privacyRequirement: "restricted",
    decisionCriteria: ["policy match quality", "documentation completeness", "cost", "latency"],
    humanGate: "staff review required before submission",
    blockedUse: "No payer submission or medical-necessity determination."
  },
  {
    taskType: "medical_imaging",
    preferredRoute: "vision_medical_model_or_local_dicom_pipeline",
    privacyRequirement: "phi-local-only",
    decisionCriteria: ["modality support", "local availability", "uncertainty handling", "regulatory sensitivity"],
    humanGate: "radiology or qualified clinical review required",
    blockedUse: "No final imaging interpretation."
  },
  {
    taskType: "document_parsing_ocr",
    preferredRoute: "document_vision_model_with_local_redaction_precheck",
    privacyRequirement: "restricted",
    decisionCriteria: ["layout preservation", "PHI redaction", "latency", "cost"],
    humanGate: "review required for extracted clinical or legal evidence",
    blockedUse: "No raw connector payload logging."
  },
  {
    taskType: "patient_education_translation",
    preferredRoute: "plain_language_medical_model",
    privacyRequirement: "standard",
    decisionCriteria: ["readability", "translation quality", "clinical safety", "cost"],
    humanGate: "clinical review required before patient use",
    blockedUse: "No patient outreach or individualized medical instruction."
  }
];

export const upgradeWorkflowLanes: UpgradeWorkflowLane[] = [
  {
    workflow: "prior authorization",
    prioritizedUse: "Detect missing criteria, documentation language gaps, and submission risk before human-reviewed packet preparation.",
    automationBoundary: "Draft and checklist only.",
    requiredReview: "Human review before payer submission.",
    trackedMetrics: ["documentation_gaps_found", "cycle_time_reduction", "denial_risk_reduced"]
  },
  {
    workflow: "referral routing",
    prioritizedUse: "Match referral metadata to routing rules, wait-time signals, and closed-loop status tracking.",
    automationBoundary: "Recommendation-only routing and status metadata.",
    requiredReview: "Human review before outreach or scheduling changes.",
    trackedMetrics: ["referral_completion", "leakage_risk", "wait_time"]
  },
  {
    workflow: "intake and documentation",
    prioritizedUse: "Summarize intake, draft notes, detect missing fields, and route follow-up questions.",
    automationBoundary: "Draft notes and missing-data flags only.",
    requiredReview: "Clinician signoff before chart use.",
    trackedMetrics: ["documentation_time_saved", "missing_field_rate", "reviewer_edits"]
  },
  {
    workflow: "coding and RCM",
    prioritizedUse: "Support coding review, denial prevention, documentation completeness, and work queue triage.",
    automationBoundary: "Coding support and denial-risk explanation only.",
    requiredReview: "Coder or revenue-cycle reviewer approval before billing action.",
    trackedMetrics: ["denial_rate", "coder_review_time", "documentation_defect_rate"]
  },
  {
    workflow: "clinical trial evidence management",
    prioritizedUse: "Secure, validate, hash, and sync decentralized trial evidence metadata.",
    automationBoundary: "Evidence integrity metadata only.",
    requiredReview: "Research compliance review before production trial use.",
    trackedMetrics: ["evidence_hash_coverage", "site_sync_status", "protocol_deviation_flags"]
  }
];

export const upgradeDevSecOpsControls: UpgradeDevSecOpsControl[] = [
  {
    control: "automated tests",
    requiredCheck: "typecheck, lint, nonsecret smoke, build",
    failureMode: "block_merge",
    evidence: "CI logs and contract-check output"
  },
  {
    control: "PHI leakage tests",
    requiredCheck: "reject PHI-like notes, token-like fields, raw connector payloads, and secret fixtures",
    failureMode: "block_deploy",
    evidence: "nonsecret test suite and Sentinel preview validators"
  },
  {
    control: "FHIR validation",
    requiredCheck: "FHIR/HL7 contract checks and clinical data fabric validation",
    failureMode: "require_review",
    evidence: "clinical data fabric and interoperability smoke artifacts"
  },
  {
    control: "clinical safety regression tests",
    requiredCheck: "clinical robustness lab and Sentinel regression promotion gate",
    failureMode: "block_deploy",
    evidence: "synthetic regression manifest and reviewer disposition metadata"
  },
  {
    control: "rollback plan",
    requiredCheck: "release gate includes rollback owner and blast-radius controls",
    failureMode: "require_review",
    evidence: "release-candidate readiness and boundary-release evidence"
  }
];

export function validateScrimedUpgradeImplementationPlan(): {
  status: "pass" | "fail";
  checks: UpgradeValidationCheck[];
} {
  const checks: UpgradeValidationCheck[] = [
    {
      check: "all-ten-upgrade-domains-present",
      passed: scrimedUpgradeDomains.length === 10,
      detail: "The plan covers secure runtime, policy, observability, evals, routing, knowledge, workflows, DevSecOps, edge AI, and strategy."
    },
    {
      check: "domains-have-human-review-and-blocked-actions",
      passed: scrimedUpgradeDomains.every(
        (domain) => domain.humanReviewGate.length > 0 && domain.blockedActions.includes("live PHI processing")
      ),
      detail: "Every domain carries a human review gate and explicit production/PHI hard stops."
    },
    {
      check: "contextual-policy-engine-fail-closes",
      passed: contextualPolicyRules.every((rule) => rule.failClosedBehavior.length > 0),
      detail: "Contextual policies define fail-closed behavior for PHI, untrusted content, cost, high-stakes actions, and destructive mutations."
    },
    {
      check: "multi-model-router-covers-required-task-types",
      passed: ["clinical_reasoning", "prior_authorization", "medical_imaging", "document_parsing_ocr", "patient_education_translation"].every(
        (taskType) => upgradeModelRoutingLanes.some((lane) => lane.taskType === taskType)
      ),
      detail: "Model routing lanes cover clinical, payer, imaging, document/OCR, and patient-language workloads."
    },
    {
      check: "workflow-automation-remains-review-gated",
      passed: upgradeWorkflowLanes.every(
        (lane) =>
          lane.automationBoundary.length > 0 &&
          lane.requiredReview.toLowerCase().includes("review")
      ),
      detail: "Workflow automation lanes stay draft, recommendation, or metadata-only until human review."
    },
    {
      check: "devsecops-controls-block-unsafe-release",
      passed: upgradeDevSecOpsControls.some((control) => control.control === "PHI leakage tests") &&
        upgradeDevSecOpsControls.some((control) => control.control === "clinical safety regression tests") &&
        upgradeDevSecOpsControls.some((control) => control.control === "rollback plan"),
      detail: "DevSecOps controls include PHI leakage tests, clinical safety regression, and rollback evidence."
    },
    {
      check: "no-domain-authorizes-production-or-clinical-authority",
      passed: scrimedUpgradeDomains.every(
        (domain) =>
          domain.blockedActions.includes("production deploy") &&
          domain.blockedActions.includes("customer go-live approval") &&
          domain.blockedActions.includes("diagnosis or treatment authority")
      ),
      detail: "The upgrade plan does not grant production deploy, customer go-live, diagnosis, or treatment authority."
    }
  ];

  return {
    status: checks.every((check) => check.passed) ? "pass" : "fail",
    checks
  };
}

export function getScrimedUpgradeImplementationPlanSummary() {
  const validation = validateScrimedUpgradeImplementationPlan();

  return {
    service: "scrimed-upgrade-implementation-plan",
    status: scrimedUpgradeImplementationPlanStatus,
    apiRoute: scrimedUpgradeImplementationPlanApiRoute,
    briefRoute: scrimedUpgradeImplementationPlanBriefRoute,
    policyVersion: scrimedSafetyPolicyVersion,
    boundary: scrimedUpgradeImplementationPlanBoundary,
    strategicPositioning:
      "SCRIMED is an AI-native healthcare operating system combining secure agents, clinical intelligence, workflow automation, local-first privacy, governed deployment, and continuous learning infrastructure.",
    domains: scrimedUpgradeDomains,
    contextualPolicyRules,
    modelRoutingLanes: upgradeModelRoutingLanes,
    workflowLanes: upgradeWorkflowLanes,
    devsecopsControls: upgradeDevSecOpsControls,
    validation,
    recommendedNextBuildStep:
      "Implement a metadata-only contextual policy preview API that accepts session-state facts and returns fail-closed policy decisions without executing tools."
  };
}

export function buildScrimedUpgradeImplementationPlanBrief() {
  const summary = getScrimedUpgradeImplementationPlanSummary();

  return [
    "# SCRIMED Most Recent Upgrade Implementation Plan",
    "",
    `Status: ${summary.status}`,
    `API: ${summary.apiRoute}`,
    `Brief: ${summary.briefRoute}`,
    `Safety policy: ${summary.policyVersion}`,
    "",
    "## Objective",
    "Implement the newest SCRIMED architecture upgrades around secure agent runtime, clinical AI governance, DevSecOps, observability, multi-model routing, knowledge compounding, and healthcare workflow automation.",
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Strategic Product Direction",
    summary.strategicPositioning,
    "",
    "## Upgrade Domains",
    ...summary.domains.map(
      (domain) =>
        `- ${domain.title}: ${domain.objective} Readiness: ${domain.readiness}. Next: ${domain.nextBuildStep}`
    ),
    "",
    "## Contextual Policy Engine",
    ...summary.contextualPolicyRules.map(
      (rule) => `- ${rule.ruleId}: ${rule.trigger} -> ${rule.decision}. Fail closed: ${rule.failClosedBehavior}`
    ),
    "",
    "## Multi-Model Router",
    ...summary.modelRoutingLanes.map(
      (lane) => `- ${lane.taskType}: ${lane.preferredRoute}; privacy ${lane.privacyRequirement}; gate ${lane.humanGate}`
    ),
    "",
    "## Healthcare Workflow Automation",
    ...summary.workflowLanes.map(
      (lane) => `- ${lane.workflow}: ${lane.prioritizedUse} Boundary: ${lane.automationBoundary} Review: ${lane.requiredReview}`
    ),
    "",
    "## DevSecOps / CI-CD",
    ...summary.devsecopsControls.map(
      (control) => `- ${control.control}: ${control.requiredCheck}; failure mode ${control.failureMode}`
    ),
    "",
    "## Validation",
    ...summary.validation.checks.map(
      (check) => `- ${check.passed ? "PASS" : "FAIL"} ${check.check}: ${check.detail}`
    ),
    "",
    "## Next Build Step",
    summary.recommendedNextBuildStep,
    ""
  ].join("\n");
}
