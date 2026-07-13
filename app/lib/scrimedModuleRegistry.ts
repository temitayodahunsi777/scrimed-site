export type ScrimedModuleDomain =
  | "clinical-evaluation"
  | "scientific-reasoning"
  | "workflow-orchestration"
  | "evidence-intelligence"
  | "runtime"
  | "trust-safety"
  | "continuous-evaluation"
  | "outcome-learning"
  | "knowledge-memory"
  | "multi-agent-ai";

export type ScrimedModuleStage =
  | "architecture-ready"
  | "synthetic-demo-ready"
  | "starter-build-ready"
  | "protected-pilot-prep"
  | "blocked-before-clinical-production";

export type ScrimedModule = {
  name: string;
  slug: string;
  domain: ScrimedModuleDomain;
  stage: ScrimedModuleStage;
  objective: string;
  coreCapabilities: string[];
  primaryInputs: string[];
  primaryOutputs: string[];
  dependencies: string[];
  allowedDemoMode: string;
  blockedProductionMode: string;
  safetyControls: string[];
  firstImplementationMilestone: string;
  investorNarrative: string;
};

export const scrimedModuleRegistryRoute = "/scrimed-modules";
export const scrimedModuleRegistryApiRoute = "/api/scrimed-modules";
export const scrimedModuleRegistryStatus =
  "scrimed-module-registry-active-no-phi";
export const scrimedModuleRegistryUpdatedAt = "2026-06-30";

export const scrimedModuleRegistryBoundary =
  "SCRIMED module registry is a no-PHI product architecture and build-control surface. It does not authorize live PHI, autonomous diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, production connector use, clinical validation, certification, reimbursement claims, or customer go-live.";

const standardBlockedProductionMode =
  "No live PHI, autonomous diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, production connector use, clinical validation, certification, reimbursement claim, or customer go-live.";

const standardSafetyControls = [
  "No-PHI synthetic fixtures only",
  "Human review required for protected clinical workflows",
  "Evidence and source attribution required",
  "Confidence, limitation, and escalation criteria required",
  "Audit event required for every module output",
  "No direct LLM-to-database access",
  "No autonomous system-of-record mutation"
];

export const scrimedModules: ScrimedModule[] = [
  {
    name: "SCRIMED ClinicalBench",
    slug: "clinicalbench",
    domain: "clinical-evaluation",
    stage: "synthetic-demo-ready",
    objective:
      "Create SCRIMED's domain-specific clinical benchmark suite for adversarial, missing-data, noisy-note, unit, guideline, citation, bias, and reviewer-gate evaluation.",
    coreCapabilities: [
      "Synthetic scenario library",
      "Clinical readiness scorecards",
      "Regression suites by module and agent",
      "Reviewer-calibrated pass/fail rubrics"
    ],
    primaryInputs: ["synthetic cases", "expected safe behaviors", "evidence references", "reviewer rubrics"],
    primaryOutputs: ["clinical readiness scores", "failure reports", "release gate status", "review queue items"],
    dependencies: ["Clinical Robustness Lab", "Evaluation Registry", "Trust Score", "Benchmark Studio"],
    allowedDemoMode: "Run no-PHI clinical benchmark scorecards for demos, pilots, investor diligence, and release evidence.",
    blockedProductionMode: standardBlockedProductionMode,
    safetyControls: standardSafetyControls,
    firstImplementationMilestone:
      "Bind ClinicalBench scenarios to each SCRIMED clinical module and require passing synthetic scorecards before buyer-facing expansion.",
    investorNarrative:
      "Shows that SCRIMED measures clinical reliability with healthcare-specific tests rather than generic leaderboard claims."
  },
  {
    name: "SCRIMED Scientific Reasoning Engine",
    slug: "scientific-reasoning-engine",
    domain: "scientific-reasoning",
    stage: "architecture-ready",
    objective:
      "Structure hypothesis, evidence ranking, contradiction detection, guideline comparison, and uncertainty reporting for scientific and clinical research workflows.",
    coreCapabilities: [
      "Hypothesis decomposition",
      "Evidence quality grading",
      "Contradiction detection",
      "Guideline and literature comparison"
    ],
    primaryInputs: ["research question", "literature references", "guideline references", "population criteria"],
    primaryOutputs: ["evidence matrix", "contradiction report", "confidence summary", "human-review recommendation"],
    dependencies: ["Evidence Graph", "ResearchOps", "Research Memory", "Multi-Model Router"],
    allowedDemoMode: "Run synthetic or public-reference research simulations with citations and uncertainty labels.",
    blockedProductionMode:
      "No clinical trial enrollment decision, treatment recommendation, patient-specific research advice, or claim of scientific validation.",
    safetyControls: standardSafetyControls,
    firstImplementationMilestone:
      "Create a no-PHI research reasoning packet format with claim, evidence, contradiction, confidence, and reviewer fields.",
    investorNarrative:
      "Positions SCRIMED as a research-grade reasoning platform for healthcare organizations, pharma-adjacent pilots, and academic partners."
  },
  {
    name: "SCRIMED Workflow Planner",
    slug: "workflow-planner",
    domain: "workflow-orchestration",
    stage: "protected-pilot-prep",
    objective:
      "Generate deterministic workflow plans that map task goals to agents, tools, approvals, evidence, rollback, and audit requirements.",
    coreCapabilities: [
      "Workflow graph drafting",
      "Agent/tool sequencing",
      "Approval gate insertion",
      "Rollback and fallback planning"
    ],
    primaryInputs: ["workflow goal", "policy constraints", "agent registry", "tool registry", "risk level"],
    primaryOutputs: ["workflow plan", "approval map", "rollback path", "audit event plan"],
    dependencies: ["Clinical Work Graph", "Policy Registry", "Multi-Agent Runtime", "Adaptive Workflow Selector"],
    allowedDemoMode: "Draft no-PHI workflow plans and review packets for demos, operations, and protected pilots.",
    blockedProductionMode:
      "No autonomous workflow execution, connector mutation, patient outreach, payer submission, or EHR writeback.",
    safetyControls: standardSafetyControls,
    firstImplementationMilestone:
      "Create a workflow-plan schema with deterministic states, required approvals, evidence bindings, and rollback behavior.",
    investorNarrative:
      "Turns SCRIMED into an operating layer that can plan healthcare workflows safely before execution."
  },
  {
    name: "SCRIMED Clinical Judgment Engine",
    slug: "clinical-judgment-engine",
    domain: "clinical-evaluation",
    stage: "blocked-before-clinical-production",
    objective:
      "Assist qualified reviewers by structuring evidence, uncertainty, contraindication flags, escalation criteria, and reviewer disposition for clinical judgment support.",
    coreCapabilities: [
      "Evidence sufficiency check",
      "Uncertainty and limitation surfacing",
      "Escalation criteria generation",
      "Reviewer disposition support"
    ],
    primaryInputs: ["synthetic clinical context", "evidence cards", "policy rules", "reviewer rubric"],
    primaryOutputs: ["judgment support packet", "risk label", "confidence and limitations", "escalation criteria"],
    dependencies: ["ClinicalBench", "Evidence Graph", "Clinical QA Engine", "Trust Score"],
    allowedDemoMode: "Prepare synthetic, reviewer-held judgment support packets that never become clinical decisions.",
    blockedProductionMode:
      "No autonomous diagnosis, treatment recommendation, prescribing, triage replacement, or patient-specific medical advice.",
    safetyControls: standardSafetyControls,
    firstImplementationMilestone:
      "Add a clinical judgment packet schema with explicit not-for-care boundary, evidence sufficiency, and reviewer signoff state.",
    investorNarrative:
      "Creates high-value clinical intelligence while keeping medical authority with qualified humans."
  },
  {
    name: "SCRIMED Evidence Graph",
    slug: "evidence-graph",
    domain: "evidence-intelligence",
    stage: "architecture-ready",
    objective:
      "Represent claims, sources, citations, guidelines, patient-safe synthetic facts, conflicts, provenance, and confidence as a traceable evidence graph.",
    coreCapabilities: [
      "Claim-source graph",
      "Citation verification",
      "Conflict and contradiction edges",
      "Evidence provenance and freshness tracking"
    ],
    primaryInputs: ["documents", "guidelines", "evidence cards", "clinical or research claims"],
    primaryOutputs: ["evidence graph", "citation map", "conflict graph", "source freshness report"],
    dependencies: ["Secure RAG/Data Ingestion Pipeline", "Scientific Reasoning Engine", "Trust Score"],
    allowedDemoMode: "Build synthetic or public-reference evidence graphs for demos and diligence.",
    blockedProductionMode:
      "No live PHI indexing, unsupported clinical claims, source-less recommendations, or clinical validation claims.",
    safetyControls: standardSafetyControls,
    firstImplementationMilestone:
      "Define graph node and edge schemas for claim, source, citation, guideline, conflict, freshness, and review status.",
    investorNarrative:
      "Makes SCRIMED outputs defensible, inspectable, and harder to reduce to generic chatbot text."
  },
  {
    name: "SCRIMED ResearchOps",
    slug: "researchops",
    domain: "scientific-reasoning",
    stage: "architecture-ready",
    objective:
      "Coordinate literature review, evidence ranking, trial matching simulation, contradiction review, and research workflow operations.",
    coreCapabilities: [
      "Research workflow queue",
      "Literature and guideline tasking",
      "Trial matching simulation",
      "Research reviewer handoff"
    ],
    primaryInputs: ["hypothesis", "public literature references", "trial criteria", "population definition"],
    primaryOutputs: ["research packet", "evidence ranking", "trial simulation report", "reviewer task"],
    dependencies: ["Scientific Reasoning Engine", "Evidence Graph", "Research Memory", "LongTask Runtime"],
    allowedDemoMode: "Run no-PHI research operations simulations with public references and human-review gates.",
    blockedProductionMode:
      "No patient recruitment, enrollment guarantee, trial recommendation, IRB bypass, or patient-specific research action.",
    safetyControls: standardSafetyControls,
    firstImplementationMilestone:
      "Create a research pipeline state machine from hypothesis to evidence ranking to reviewer packet.",
    investorNarrative:
      "Expands SCRIMED into research operations while preserving strict boundaries around patient and trial authority."
  },
  {
    name: "SCRIMED LongTask Runtime",
    slug: "longtask-runtime",
    domain: "runtime",
    stage: "protected-pilot-prep",
    objective:
      "Run durable, resumable, review-gated tasks for research, evaluation, workflow planning, ingestion, and audit packet generation.",
    coreCapabilities: [
      "Durable task state",
      "Checkpoint and resume",
      "Human approval pause points",
      "Timeout, retry, and dead-letter handling"
    ],
    primaryInputs: ["task plan", "agent identity", "policy decision", "approval requirements"],
    primaryOutputs: ["task trace", "checkpoint state", "review packet", "final artifact hash"],
    dependencies: ["Event Mesh", "Zero-Trust Audit Ledger", "Multi-Agent Runtime", "Workflow Planner"],
    allowedDemoMode: "Run no-PHI long tasks for evidence packet generation and synthetic evaluations.",
    blockedProductionMode:
      "No unattended production mutation, connector write, patient outreach, payer submission, or EHR writeback.",
    safetyControls: standardSafetyControls,
    firstImplementationMilestone:
      "Create a durable task contract with checkpoint, pause-for-review, resume, retry, timeout, and dead-letter states.",
    investorNarrative:
      "Gives SCRIMED enterprise-grade execution depth for work that cannot fit inside single model calls."
  },
  {
    name: "SCRIMED Clinical Work Graph",
    slug: "clinical-work-graph",
    domain: "workflow-orchestration",
    stage: "architecture-ready",
    objective:
      "Model clinical and administrative work as nodes, dependencies, evidence, owners, risk labels, approval states, and blocked actions.",
    coreCapabilities: [
      "Workflow dependency graph",
      "Risk-aware node labeling",
      "Review-state tracking",
      "Blocked-action visibility"
    ],
    primaryInputs: ["workflow plan", "clinical policy", "evidence refs", "review requirements"],
    primaryOutputs: ["clinical work graph", "dependency map", "review-state view", "blocked-action map"],
    dependencies: ["Workflow Planner", "Clinical QA Engine", "Policy Registry", "Event Mesh"],
    allowedDemoMode: "Visualize synthetic clinical workflows and dependencies with no live-care authority.",
    blockedProductionMode:
      "No autonomous clinical workflow execution or production connector action.",
    safetyControls: standardSafetyControls,
    firstImplementationMilestone:
      "Define a graph schema for work nodes, evidence refs, owner, risk, state, approval, and rollback.",
    investorNarrative:
      "Turns healthcare workflow complexity into an inspectable operating graph that supports pilots and enterprise sales."
  },
  {
    name: "SCRIMED Trust Score",
    slug: "trust-score",
    domain: "trust-safety",
    stage: "synthetic-demo-ready",
    objective:
      "Compute module, agent, model, prompt, workflow, and output trust posture from evidence quality, eval performance, reviewer outcomes, drift, incidents, and policy decisions.",
    coreCapabilities: [
      "Trust score rubric",
      "Evidence quality scoring",
      "Reviewer outcome weighting",
      "Release gate recommendation"
    ],
    primaryInputs: ["eval results", "evidence graph", "reviewer dispositions", "policy decisions", "incident events"],
    primaryOutputs: ["trust score", "risk band", "release recommendation", "improvement tasks"],
    dependencies: ["ClinicalBench", "Continuous Evaluation Platform", "Zero-Trust Audit Ledger", "Evidence Graph"],
    allowedDemoMode: "Show synthetic trust scores for modules, agents, and outputs in diligence packets.",
    blockedProductionMode:
      "No trust score may be treated as clinical validation, certification, or autonomous approval.",
    safetyControls: standardSafetyControls,
    firstImplementationMilestone:
      "Create a deterministic trust score formula with explainable components and release-gate thresholds.",
    investorNarrative:
      "Makes reliability legible to buyers and investors by turning safety evidence into a visible operating signal."
  },
  {
    name: "SCRIMED Continuous Evaluation Platform",
    slug: "continuous-evaluation-platform",
    domain: "continuous-evaluation",
    stage: "protected-pilot-prep",
    objective:
      "Continuously evaluate modules, agents, prompts, model routes, workflows, RAG, memory, and trust score regressions.",
    coreCapabilities: [
      "Scheduled eval runs",
      "Regression detection",
      "Release gate blocking",
      "Reviewer calibration tracking"
    ],
    primaryInputs: ["eval suites", "module versions", "agent versions", "prompt versions", "model routes"],
    primaryOutputs: ["eval report", "regression alert", "release block", "review task"],
    dependencies: ["Evaluation Registry", "ClinicalBench", "Benchmark Studio", "Trust Score"],
    allowedDemoMode: "Run no-secret, no-PHI eval suites for synthetic module readiness.",
    blockedProductionMode:
      "No synthetic eval result may claim live clinical validation or certification.",
    safetyControls: standardSafetyControls,
    firstImplementationMilestone:
      "Add module-version eval mapping and require continuous eval status in release evidence.",
    investorNarrative:
      "Creates a quality moat through constant measurement, regression awareness, and release discipline."
  },
  {
    name: "SCRIMED Outcome Intelligence",
    slug: "outcome-intelligence",
    domain: "outcome-learning",
    stage: "blocked-before-clinical-production",
    objective:
      "Analyze approved synthetic, de-identified, or governed outcome signals to understand workflow value, safety, quality, and operational impact.",
    coreCapabilities: [
      "Outcome signal modeling",
      "Reviewer outcome linkage",
      "Workflow impact analysis",
      "Safety and quality trend detection"
    ],
    primaryInputs: ["approved outcome signals", "reviewer labels", "workflow events", "quality metrics"],
    primaryOutputs: ["outcome insight", "trend report", "risk signal", "improvement recommendation"],
    dependencies: ["Continuous Outcome Learning Engine", "Event Mesh", "Clinical Work Graph", "Trust Score"],
    allowedDemoMode: "Use synthetic or approved de-identified outcome simulations for value analysis.",
    blockedProductionMode:
      "No live patient outcome learning without legal, privacy, clinical, consent, and customer approval.",
    safetyControls: standardSafetyControls,
    firstImplementationMilestone:
      "Define outcome signal schema with consent/data-use status, de-identification status, evidence link, and reviewer owner.",
    investorNarrative:
      "Moves SCRIMED toward measurable ROI and learning loops while preserving strict data governance."
  },
  {
    name: "SCRIMED Knowledge Evolution Engine",
    slug: "knowledge-evolution-engine",
    domain: "knowledge-memory",
    stage: "architecture-ready",
    objective:
      "Version and evolve approved knowledge, evidence, guidelines, memory, prompts, and module policies through review-gated updates.",
    coreCapabilities: [
      "Knowledge versioning",
      "Guideline freshness tracking",
      "Change proposal workflow",
      "Regression-triggered knowledge review"
    ],
    primaryInputs: ["evidence graph changes", "guideline updates", "eval failures", "reviewer feedback"],
    primaryOutputs: ["knowledge update proposal", "freshness report", "deprecation notice", "release task"],
    dependencies: ["Evidence Graph", "Research Memory", "Clinical Memory", "Continuous Evaluation Platform"],
    allowedDemoMode: "Show no-PHI knowledge update proposals and freshness dashboards.",
    blockedProductionMode:
      "No automatic clinical knowledge update may affect live care without governance approval.",
    safetyControls: standardSafetyControls,
    firstImplementationMilestone:
      "Create knowledge version records with source, owner, policy, eval impact, reviewer, and rollback fields.",
    investorNarrative:
      "Gives SCRIMED a controlled learning system without unsafe automatic medical drift."
  },
  {
    name: "SCRIMED Multi-Agent Runtime",
    slug: "multi-agent-runtime",
    domain: "multi-agent-ai",
    stage: "protected-pilot-prep",
    objective:
      "Coordinate planner, specialist, verifier, evidence, QA, safety, cost, and supervisor agents with scoped identities and audit traces.",
    coreCapabilities: [
      "Agent orchestration",
      "Supervisor checks",
      "Role-scoped tool access",
      "Run trace and replay"
    ],
    primaryInputs: ["workflow plan", "agent identities", "tool scopes", "policy decisions", "evaluation requirements"],
    primaryOutputs: ["agent run trace", "handoff map", "supervisor verdict", "review packet"],
    dependencies: ["Agent Identity Registry", "Secure MCP Gateway", "LongTask Runtime", "Trust Score"],
    allowedDemoMode: "Run synthetic multi-agent plans and review traces without production side effects.",
    blockedProductionMode:
      "No autonomous protected workflow execution or production tool access.",
    safetyControls: standardSafetyControls,
    firstImplementationMilestone:
      "Define multi-agent run envelope with planner, specialist, verifier, supervisor, cost, policy, and trace fields.",
    investorNarrative:
      "Shows SCRIMED as a governable agent operating system rather than a single-model chatbot."
  },
  {
    name: "SCRIMED Multi-Model Router",
    slug: "multi-model-router",
    domain: "multi-agent-ai",
    stage: "starter-build-ready",
    objective:
      "Route tasks across frontier, open, local, edge, and fallback models by cost, risk, latency, quality, privacy, and policy.",
    coreCapabilities: [
      "Provider-neutral routing",
      "Risk-tier model selection",
      "Fallback and circuit breaker",
      "Cost and latency telemetry"
    ],
    primaryInputs: ["task type", "risk level", "privacy boundary", "budget", "latency target", "quality requirement"],
    primaryOutputs: ["model route decision", "routing rationale", "fallback plan", "usage telemetry"],
    dependencies: ["Model Registry", "AI Cost Intelligence Agent", "Trust Score", "Policy Registry"],
    allowedDemoMode: "Route synthetic tasks through provider-neutral metadata and synthetic fallback provider.",
    blockedProductionMode:
      "No unapproved external provider calls, PHI routing, or hard-coded single-provider dependency.",
    safetyControls: standardSafetyControls,
    firstImplementationMilestone:
      "Bind module-level task classes to the existing SCRIMED model router and cost guardrails.",
    investorNarrative:
      "Keeps SCRIMED flexible as model markets shift while preserving cost and privacy governance."
  },
  {
    name: "SCRIMED Adaptive Workflow Selector",
    slug: "adaptive-workflow-selector",
    domain: "workflow-orchestration",
    stage: "architecture-ready",
    objective:
      "Select the safest workflow template based on task type, clinical risk, data completeness, policy, user role, and reviewer capacity.",
    coreCapabilities: [
      "Workflow template matching",
      "Risk-aware routing",
      "Missing-data-aware fallback",
      "Reviewer capacity consideration"
    ],
    primaryInputs: ["task request", "policy decision", "risk label", "data completeness", "reviewer availability"],
    primaryOutputs: ["selected workflow", "fallback workflow", "review queue", "selection rationale"],
    dependencies: ["Workflow Planner", "Clinical Work Graph", "Policy Registry", "Trust Score"],
    allowedDemoMode: "Select synthetic workflow templates and explain rationale for demos and pilots.",
    blockedProductionMode:
      "No autonomous protected workflow selection that executes side effects without review.",
    safetyControls: standardSafetyControls,
    firstImplementationMilestone:
      "Create workflow selection rules with risk gates, missing-data fallbacks, and reviewer queue constraints.",
    investorNarrative:
      "Creates operational intelligence that adapts to context without handing control to a model."
  },
  {
    name: "SCRIMED Clinical Memory",
    slug: "clinical-memory",
    domain: "knowledge-memory",
    stage: "blocked-before-clinical-production",
    objective:
      "Store approved, task-scoped clinical context memory with consent, provenance, purpose-of-use, retention, and deletion controls.",
    coreCapabilities: [
      "Purpose-bound memory",
      "Source attribution",
      "Retention and deletion policy",
      "Clinical context recall with review"
    ],
    primaryInputs: ["approved clinical context", "evidence refs", "purpose-of-use", "reviewer approval"],
    primaryOutputs: ["memory reference", "source trace", "retrieval packet", "deletion event"],
    dependencies: ["Context Engine", "Policy Registry", "Evidence Graph", "Zero-Trust Audit Ledger"],
    allowedDemoMode: "Use synthetic clinical memory references only.",
    blockedProductionMode:
      "No live PHI memory without consent, BAA/DPA, retention, deletion, audit, and customer approval.",
    safetyControls: standardSafetyControls,
    firstImplementationMilestone:
      "Define a no-PHI memory record with source, purpose, scope, TTL, reviewer, and deletion event fields.",
    investorNarrative:
      "Prepares SCRIMED for personalization and continuity while respecting healthcare privacy constraints."
  },
  {
    name: "SCRIMED Research Memory",
    slug: "research-memory",
    domain: "knowledge-memory",
    stage: "architecture-ready",
    objective:
      "Retain approved research hypotheses, evidence trails, search strategies, trial criteria, contradictions, and reviewer outcomes.",
    coreCapabilities: [
      "Research trail memory",
      "Evidence and contradiction recall",
      "Search strategy versioning",
      "Reviewer outcome linkage"
    ],
    primaryInputs: ["research packet", "literature references", "evidence grades", "reviewer outcomes"],
    primaryOutputs: ["research memory reference", "evidence lineage", "search replay packet", "update task"],
    dependencies: ["ResearchOps", "Scientific Reasoning Engine", "Evidence Graph", "Knowledge Evolution Engine"],
    allowedDemoMode: "Use public-reference or synthetic research memory for simulations.",
    blockedProductionMode:
      "No patient-specific research memory or trial action without approval.",
    safetyControls: standardSafetyControls,
    firstImplementationMilestone:
      "Create research memory schema with hypothesis, sources, search method, contradictions, reviewer, and update status.",
    investorNarrative:
      "Improves research continuity and defensibility for enterprise research operations."
  },
  {
    name: "SCRIMED Physician Preference Memory",
    slug: "physician-preference-memory",
    domain: "knowledge-memory",
    stage: "blocked-before-clinical-production",
    objective:
      "Capture approved clinician workflow preferences for drafting style, routing, documentation support, and non-clinical defaults without overriding clinical judgment.",
    coreCapabilities: [
      "Preference capture",
      "Scope and consent tracking",
      "Preference-aware drafting",
      "Preference audit and reset"
    ],
    primaryInputs: ["clinician-approved preference", "scope", "version", "review owner"],
    primaryOutputs: ["preference memory reference", "drafting hint", "audit event", "reset event"],
    dependencies: ["Clinical Memory", "Policy Registry", "Audit Ledger", "Prompt Registry"],
    allowedDemoMode: "Use synthetic preference examples to tailor draft formatting and workflow routing.",
    blockedProductionMode:
      "No hidden preference learning, clinical decision override, patient-specific action, or unapproved clinician profiling.",
    safetyControls: standardSafetyControls,
    firstImplementationMilestone:
      "Define opt-in preference memory with scope, owner, TTL, version, reset, and audit fields.",
    investorNarrative:
      "Supports sticky clinician workflows while preventing unsafe personalization or silent profiling."
  },
  {
    name: "SCRIMED Benchmark Studio",
    slug: "benchmark-studio",
    domain: "continuous-evaluation",
    stage: "synthetic-demo-ready",
    objective:
      "Give SCRIMED operators a studio for designing, running, comparing, and publishing internal synthetic benchmarks and release evidence.",
    coreCapabilities: [
      "Benchmark authoring",
      "Scenario set comparison",
      "Model/agent/prompt comparison",
      "Release evidence export"
    ],
    primaryInputs: ["benchmark definition", "scenario suite", "model route", "agent version", "prompt version"],
    primaryOutputs: ["benchmark report", "comparison chart", "release evidence packet", "regression alert"],
    dependencies: ["ClinicalBench", "Continuous Evaluation Platform", "Model Registry", "Prompt Registry"],
    allowedDemoMode: "Run and display no-PHI internal benchmarks for diligence and release review.",
    blockedProductionMode:
      "No benchmark result may claim certification, clinical validation, or live-care approval.",
    safetyControls: standardSafetyControls,
    firstImplementationMilestone:
      "Create benchmark definition schema with scenario set, run metadata, score rubric, comparison targets, and release packet export.",
    investorNarrative:
      "Turns SCRIMED's testing discipline into a visible platform capability for enterprise diligence."
  }
];

function countBy<T extends string>(values: T[]) {
  return values.reduce<Record<T, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {} as Record<T, number>);
}

export function validateScrimedModuleRegistry() {
  const requiredNames = [
    "SCRIMED ClinicalBench",
    "SCRIMED Scientific Reasoning Engine",
    "SCRIMED Workflow Planner",
    "SCRIMED Clinical Judgment Engine",
    "SCRIMED Evidence Graph",
    "SCRIMED ResearchOps",
    "SCRIMED LongTask Runtime",
    "SCRIMED Clinical Work Graph",
    "SCRIMED Trust Score",
    "SCRIMED Continuous Evaluation Platform",
    "SCRIMED Outcome Intelligence",
    "SCRIMED Knowledge Evolution Engine",
    "SCRIMED Multi-Agent Runtime",
    "SCRIMED Multi-Model Router",
    "SCRIMED Adaptive Workflow Selector",
    "SCRIMED Clinical Memory",
    "SCRIMED Research Memory",
    "SCRIMED Physician Preference Memory",
    "SCRIMED Benchmark Studio"
  ];
  const moduleNames = new Set(scrimedModules.map((module) => module.name));
  const checks = [
    {
      check: "all-requested-modules-registered",
      passed:
        scrimedModules.length === 19 &&
        requiredNames.every((moduleName) => moduleNames.has(moduleName)),
      detail: "All 19 requested SCRIMED modules must be present in the registry."
    },
    {
      check: "human-review-boundary",
      passed: scrimedModules.every((module) =>
        module.safetyControls.some((control) => control.toLowerCase().includes("human review"))
      ),
      detail: "Every module must preserve human review for protected clinical workflows."
    },
    {
      check: "no-direct-llm-database-access",
      passed: scrimedModules.every((module) =>
        module.safetyControls.some((control) => control.includes("No direct LLM-to-database access"))
      ),
      detail: "Every module must retain the no direct LLM-to-database invariant."
    },
    {
      check: "blocked-production-boundaries",
      passed: scrimedModules.every((module) => module.blockedProductionMode.toLowerCase().includes("no")),
      detail: "Every module must declare blocked production modes."
    },
    {
      check: "evidence-and-audit-required",
      passed: scrimedModules.every(
        (module) =>
          module.safetyControls.some((control) => control.toLowerCase().includes("evidence")) &&
          module.safetyControls.some((control) => control.toLowerCase().includes("audit"))
      ),
      detail: "Every module must require evidence and auditability."
    }
  ];

  return {
    status: checks.every((check) => check.passed) ? "pass" : "fail",
    checks
  };
}

export function getScrimedModuleRegistrySummary() {
  const validation = validateScrimedModuleRegistry();

  return {
    service: "scrimed-module-registry",
    route: scrimedModuleRegistryRoute,
    apiRoute: scrimedModuleRegistryApiRoute,
    status: scrimedModuleRegistryStatus,
    updated: scrimedModuleRegistryUpdatedAt,
    boundary: scrimedModuleRegistryBoundary,
    currentGoScope:
      "GO for no-PHI module architecture, synthetic demos, internal planning, benchmark design, diligence packets, and protected-pilot preparation.",
    noGoScope:
      "NO-GO for live PHI, autonomous clinical action, patient outreach, payer submission, EHR writeback, production connector use, certification claims, clinical validation claims, or customer go-live.",
    moduleCount: scrimedModules.length,
    domainCounts: countBy(scrimedModules.map((module) => module.domain)),
    stageCounts: countBy(scrimedModules.map((module) => module.stage)),
    modules: scrimedModules,
    validation,
    nextImplementationStep:
      "Promote SCRIMED ClinicalBench, Trust Score, Benchmark Studio, and Continuous Evaluation Platform first so every new module has measurable safety and readiness evidence before workflow execution expands."
  };
}

export function buildScrimedModuleRegistryBrief() {
  const summary = getScrimedModuleRegistrySummary();

  return [
    "# SCRIMED Module Registry",
    "",
    `Status: ${summary.status}`,
    `Updated: ${summary.updated}`,
    `Modules: ${summary.moduleCount}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## GO / NO-GO",
    `- ${summary.currentGoScope}`,
    `- ${summary.noGoScope}`,
    "",
    "## Modules",
    ...summary.modules.map(
      (module) =>
        `- ${module.name}: ${module.stage}; ${module.domain}; ${module.objective} First milestone: ${module.firstImplementationMilestone}`
    ),
    "",
    "## Validation",
    ...summary.validation.checks.map(
      (check) => `- ${check.passed ? "PASS" : "FAIL"} ${check.check}: ${check.detail}`
    ),
    "",
    "## Next Implementation Step",
    summary.nextImplementationStep,
    ""
  ].join("\n");
}
