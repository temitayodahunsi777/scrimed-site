export type ProductDemoStatus = "executable-demo" | "guided-demo";
export type PilotProgramStatus = "sellable-now" | "protected-pilot";

export type DemoProofRoute = {
  label: string;
  route: string;
  evidence: string;
};

export type ProductDemo = {
  slug: string;
  name: string;
  route: string;
  apiRoute: string;
  status: ProductDemoStatus;
  buyer: string;
  product: string;
  agent: string;
  objective: string;
  scenario: string;
  runRoute: string;
  runLabel: string;
  proofRoutes: DemoProofRoute[];
  guidedSteps: string[];
  inspectableOutcomes: string[];
  successSignals: string[];
  governanceBoundaries: string[];
  productionExclusions: string[];
};

export type PilotProgram = {
  slug: string;
  name: string;
  route: string;
  apiRoute: string;
  status: PilotProgramStatus;
  duration: string;
  buyer: string;
  engagementModel: string;
  objective: string;
  demoSlugs: string[];
  deliverables: string[];
  successMetrics: string[];
  buyerInputs: string[];
  governanceGates: string[];
  productionExclusions: string[];
  requestRoute: string;
};

export const demoPilotBoundary =
  "SCRIMED demos and pilot programs are governed synthetic evaluations for enterprise buyers. They do not ingest live PHI, diagnose, treat, submit payer transactions, contact patients, mutate production records, or autonomously execute clinical care.";

export const productDemos: ProductDemo[] = [
  {
    slug: "carepath-access-operations",
    name: "CarePath Access Operations Demo",
    route: "/demos/carepath-access-operations",
    apiRoute: "/api/demos/carepath-access-operations",
    status: "executable-demo",
    buyer: "Patient access, care navigation, discharge, and population health leaders",
    product: "CarePath AI",
    agent: "Scheduling Agent",
    objective:
      "Demonstrate how a fragmented high-risk follow-up queue becomes a reviewable operational routing packet.",
    scenario:
      "A deterministic synthetic access packet is organized into routing rationale, missing evidence, escalation signals, reviewer ownership, and blocked unsafe actions.",
    runRoute: "/workflows/carepath-high-risk-followup-routing",
    runLabel: "Run CarePath workflow demo",
    proofRoutes: [
      {
        label: "Workflow result",
        route: "/workflows/results/carepath-high-risk-followup-routing",
        evidence: "Deterministic output signals, review state, blocked actions, and Watchtower trace."
      },
      {
        label: "CarePath module",
        route: "/modules/carepath-ai",
        evidence: "Module scope, buyer value, and clinical safety boundary."
      },
      {
        label: "Synthetic validation",
        route: "/synthetic/validation",
        evidence: "Fixture-backed checks without production patient data."
      }
    ],
    guidedSteps: [
      "Inspect the synthetic workflow objective and execution steps.",
      "Review routing rationale, missing evidence, and human-review requirements.",
      "Inspect the deterministic result fixture and Watchtower trace.",
      "Confirm patient outreach and live routing remain blocked."
    ],
    inspectableOutcomes: [
      "Structured access workqueue",
      "Routing and escalation rationale",
      "Reviewer ownership",
      "Blocked patient-facing actions"
    ],
    successSignals: [
      "Access bottlenecks surfaced",
      "Manual review time targeted for reduction",
      "Escalation reasons made inspectable",
      "Trust trace retained"
    ],
    governanceBoundaries: [
      "Human review is required before any external action.",
      "Synthetic fixtures only.",
      "Every blocked action remains visible in the result packet."
    ],
    productionExclusions: [
      "No live patient routing",
      "No emergency triage replacement",
      "No autonomous outreach",
      "No diagnosis or treatment recommendation"
    ]
  },
  {
    slug: "docutwin-documentation-review",
    name: "DocuTwin Documentation Review Demo",
    route: "/demos/docutwin-documentation-review",
    apiRoute: "/api/demos/docutwin-documentation-review",
    status: "executable-demo",
    buyer: "Clinical documentation, ambulatory operations, and quality leaders",
    product: "DocuTwin",
    agent: "Documentation Agent",
    objective:
      "Demonstrate draft-only documentation support that preserves authorship, source trace, missing context, and review control.",
    scenario:
      "A synthetic documentation packet produces a reviewable draft state, source trace, missing-context prompts, and blocked final-signature action.",
    runRoute: "/workflows/docutwin-draft-note-review",
    runLabel: "Run DocuTwin workflow demo",
    proofRoutes: [
      {
        label: "Workflow result",
        route: "/workflows/results/docutwin-draft-note-review",
        evidence: "Draft-only result fixture with source trace and review state."
      },
      {
        label: "DocuTwin module",
        route: "/modules/docutwin",
        evidence: "Documentation workflow scope and clinician-control boundary."
      },
      {
        label: "AgentOS evaluation",
        route: "/evaluation",
        evidence: "Interactive synthetic document evaluation with Trust Card output."
      }
    ],
    guidedSteps: [
      "Inspect the draft-only workflow contract.",
      "Review missing-context prompts and source-trace evidence.",
      "Inspect the deterministic result and validation state.",
      "Confirm final note signature and EHR filing remain blocked."
    ],
    inspectableOutcomes: [
      "Draft note structure",
      "Source trace",
      "Missing-context prompts",
      "Clinician review checklist"
    ],
    successSignals: [
      "Documentation review friction reduced",
      "Source trace completeness",
      "Missing context surfaced",
      "Clinician control retained"
    ],
    governanceBoundaries: [
      "Licensed clinician review remains required.",
      "Synthetic encounter packet only.",
      "Draft output cannot become a final clinical record."
    ],
    productionExclusions: [
      "No final note",
      "No EHR filing",
      "No diagnosis insertion",
      "No autonomous clinical documentation"
    ]
  },
  {
    slug: "trialcore-research-operations",
    name: "TrialCore Research Operations Demo",
    route: "/demos/trialcore-research-operations",
    apiRoute: "/api/demos/trialcore-research-operations",
    status: "executable-demo",
    buyer: "Research operations, oncology programs, academic medical centers, and trial networks",
    product: "TrialCore",
    agent: "Trial Matching Agent",
    objective:
      "Demonstrate an explainable synthetic eligibility review queue with criteria trace and evidence-gap visibility.",
    scenario:
      "A synthetic research packet is evaluated against review criteria while missing evidence, exclusion flags, and researcher approvals remain explicit.",
    runRoute: "/workflows/trialcore-eligibility-review-queue",
    runLabel: "Run TrialCore workflow demo",
    proofRoutes: [
      {
        label: "Workflow result",
        route: "/workflows/results/trialcore-eligibility-review-queue",
        evidence: "Eligibility review result fixture, criteria trace, and blocked actions."
      },
      {
        label: "TrialCore module",
        route: "/modules/trialcore",
        evidence: "Research operations scope and enrollment boundary."
      },
      {
        label: "Workflow validation",
        route: "/workflows/results/validation",
        evidence: "Result diff checks for review state, trace, and blocked actions."
      }
    ],
    guidedSteps: [
      "Inspect the synthetic eligibility-review sequence.",
      "Review criteria trace, missing evidence, and exclusion flags.",
      "Inspect the deterministic result and validation checks.",
      "Confirm patient outreach and enrollment claims remain blocked."
    ],
    inspectableOutcomes: [
      "Eligibility review queue",
      "Criteria trace",
      "Missing-evidence list",
      "Research review requirements"
    ],
    successSignals: [
      "Screening friction surfaced",
      "Evidence gaps structured",
      "Eligibility rationale made inspectable",
      "Research review retained"
    ],
    governanceBoundaries: [
      "Research-team review remains required.",
      "Synthetic research packet only.",
      "Eligibility output is operational screening support, not enrollment approval."
    ],
    productionExclusions: [
      "No patient outreach",
      "No enrollment decision",
      "No treatment recommendation",
      "No production research-record mutation"
    ]
  },
  {
    slug: "atlas-interoperability-readiness",
    name: "Atlas Interoperability Readiness Demo",
    route: "/demos/atlas-interoperability-readiness",
    apiRoute: "/api/demos/atlas-interoperability-readiness",
    status: "executable-demo",
    buyer: "CIOs, integration leaders, security teams, and healthcare platform owners",
    product: "SCRIMED Atlas",
    agent: "Interoperability Agent",
    objective:
      "Demonstrate standards-aware synthetic conformance evidence with exact live-use blockers retained.",
    scenario:
      "FHIR R4 and US Core, SMART App Launch, and DICOMweb test kits run deterministic checks against synthetic fixtures and connector contracts.",
    runRoute: "/interoperability/evaluations",
    runLabel: "Inspect conformance evaluations",
    proofRoutes: [
      {
        label: "FHIR R4 and US Core kit",
        route: "/interoperability/evaluations/fhir-r4-us-core-intake",
        evidence: "Synthetic profile checks and deployment-specific live blockers."
      },
      {
        label: "SMART App Launch kit",
        route: "/interoperability/evaluations/smart-app-launch-authorization",
        evidence: "Synthetic launch controls with identity and authorization blockers."
      },
      {
        label: "DICOMweb kit",
        route: "/interoperability/evaluations/dicomweb-imaging-exchange",
        evidence: "Synthetic imaging exchange checks and partner acceptance blockers."
      }
    ],
    guidedSteps: [
      "Inspect aggregate synthetic conformance status.",
      "Open a standards-specific evaluation kit.",
      "Review passed deterministic checks and linked evidence.",
      "Confirm certification, partner acceptance, and live exchange remain blocked."
    ],
    inspectableOutcomes: [
      "Standards target registry",
      "Deterministic conformance results",
      "Evidence artifact links",
      "Exact live-use blocker list"
    ],
    successSignals: [
      "Interoperability gaps surfaced",
      "Standards ownership clarified",
      "Pre-live requirements made inspectable",
      "Connector claims kept truthful"
    ],
    governanceBoundaries: [
      "Synthetic connector evidence only.",
      "Every standards kit retains deployment-specific blockers.",
      "Partner testing and production acceptance remain separate gates."
    ],
    productionExclusions: [
      "No live healthcare data exchange",
      "No connector certification claim",
      "No trading-partner acceptance claim",
      "No production record mutation"
    ]
  },
  {
    slug: "agentos-governance-evaluation",
    name: "AgentOS Governance Evaluation Demo",
    route: "/demos/agentos-governance-evaluation",
    apiRoute: "/api/demos/agentos-governance-evaluation",
    status: "executable-demo",
    buyer: "AI governance, compliance, innovation, clinical transformation, and executive leaders",
    product: "SCRIMED AgentOS",
    agent: "Planner, Router, Specialist Agents, and TrustQA",
    objective:
      "Demonstrate how a synthetic enterprise workflow packet becomes a governed multi-agent plan and Atlas Trust Card.",
    scenario:
      "An interactive synthetic packet is assigned structural document intelligence, routed through AgentOS, checked by TrustQA, and packaged with approvals, audit preview, and observability signals.",
    runRoute: "/evaluation",
    runLabel: "Run AgentOS evaluation",
    proofRoutes: [
      {
        label: "Agent registry",
        route: "/agents",
        evidence: "Planner, router, specialist registry, permissions, and review policies."
      },
      {
        label: "Audit governance",
        route: "/audit",
        evidence: "Approval checkpoints, AI Asset Registry, and audit channels."
      },
      {
        label: "Trust layer",
        route: "/trust",
        evidence: "TrustQA, provenance, Trust Cards, and production boundaries."
      }
    ],
    guidedSteps: [
      "Choose a synthetic evaluation scenario.",
      "Generate an AgentOS task plan and structural parser assignment.",
      "Inspect the Atlas Trust Card, evidence sources, and confidence posture.",
      "Review approval checkpoints, audit preview, and denied capabilities."
    ],
    inspectableOutcomes: [
      "Multi-agent task plan",
      "Atlas Trust Card",
      "Human approval checkpoints",
      "Audit and observability preview"
    ],
    successSignals: [
      "Governance gaps surfaced",
      "Agent responsibilities clarified",
      "Trust completeness made inspectable",
      "Denied capabilities retained"
    ],
    governanceBoundaries: [
      "Synthetic document packets only.",
      "Human approval checkpoints remain required.",
      "Production requests are denied by default."
    ],
    productionExclusions: [
      "No live PHI ingestion",
      "No autonomous clinical execution",
      "No production connector access",
      "No payer or patient-facing action"
    ]
  }
];

export const pilotPrograms: PilotProgram[] = [
  {
    slug: "30-day-workflow-intelligence-sprint",
    name: "30-Day Workflow Intelligence Sprint",
    route: "/pilots/30-day-workflow-intelligence-sprint",
    apiRoute: "/api/pilots/30-day-workflow-intelligence-sprint",
    status: "sellable-now",
    duration: "30 days",
    buyer: "Healthcare operators selecting the first high-value workflow for governed AI transformation",
    engagementModel: "Recommended fixed-fee range: $15k-$35k",
    objective:
      "Convert one to three fragmented workflows into a prioritized operating map, measurable value hypothesis, and governed pilot decision.",
    demoSlugs: ["carepath-access-operations", "docutwin-documentation-review", "agentos-governance-evaluation"],
    deliverables: [
      "Current-state workflow and friction map",
      "Automation candidate scorecard",
      "Agent, reviewer, and interoperability responsibility map",
      "Baseline measurement plan",
      "Executive pilot recommendation"
    ],
    successMetrics: [
      "Priority workflow approved",
      "Baseline and target metrics defined",
      "Governance gaps assigned owners",
      "Pilot scope and decision criteria approved"
    ],
    buyerInputs: [
      "Executive or operational sponsor",
      "One to three workflow descriptions without PHI",
      "Current friction and handoff context",
      "Governance and interoperability requirements"
    ],
    governanceGates: [
      "No PHI or patient-level records",
      "Human-review operating model defined",
      "Synthetic evidence scope approved",
      "Production requirements listed separately"
    ],
    productionExclusions: [
      "No live workflow integration",
      "No autonomous action",
      "No production data processing",
      "No clinical outcome claim"
    ],
    requestRoute: "/pilot?offer=workflow-intelligence-assessment"
  },
  {
    slug: "60-day-governed-automation-pilot",
    name: "60-Day Governed Automation Pilot",
    route: "/pilots/60-day-governed-automation-pilot",
    apiRoute: "/api/pilots/60-day-governed-automation-pilot",
    status: "sellable-now",
    duration: "60 days",
    buyer: "Enterprise healthcare teams validating workflow value, trust, and human-review design before integration",
    engagementModel: "Recommended fixed-fee range: $35k-$95k",
    objective:
      "Run a selected workflow through deterministic synthetic evidence, AgentOS orchestration, TrustQA, observability, and executive review.",
    demoSlugs: ["carepath-access-operations", "docutwin-documentation-review", "trialcore-research-operations"],
    deliverables: [
      "Configured synthetic workflow packet",
      "AgentOS orchestration and approval map",
      "Atlas Trust Cards and proof packet",
      "Measured synthetic workflow outcome report",
      "Protected-pilot readiness decision register"
    ],
    successMetrics: [
      "Time and friction baseline compared",
      "Trust and trace completeness measured",
      "Escalation and override design validated",
      "Protected-pilot business case approved or declined"
    ],
    buyerInputs: [
      "Named sponsor, workflow owner, and review team",
      "Approved synthetic scenario and success metrics",
      "Current-state process documentation without PHI",
      "Security, governance, and interoperability constraints"
    ],
    governanceGates: [
      "Synthetic data only",
      "Human review before every external action",
      "Audit and blocked-action evidence retained",
      "No production connector access"
    ],
    productionExclusions: [
      "No diagnosis or treatment",
      "No payer submission",
      "No patient outreach",
      "No production medical-record processing"
    ],
    requestRoute: "/pilot?offer=synthetic-pilot-evaluation"
  },
  {
    slug: "90-day-enterprise-atlas-pilot",
    name: "90-Day Enterprise Atlas Pilot",
    route: "/pilots/90-day-enterprise-atlas-pilot",
    apiRoute: "/api/pilots/90-day-enterprise-atlas-pilot",
    status: "protected-pilot",
    duration: "90 days",
    buyer: "Health systems, payers, governments, and enterprise operators preparing controlled deployment",
    engagementModel: "Recommended protected-pilot range: $150k-$400k",
    objective:
      "Design the tenant, governance, interoperability, audit, runtime safety, and value model required for a controlled enterprise deployment.",
    demoSlugs: ["atlas-interoperability-readiness", "agentos-governance-evaluation", "carepath-access-operations"],
    deliverables: [
      "Enterprise Atlas operating model",
      "Tenant, role, and reviewer design",
      "Connector and conformance implementation plan",
      "Runtime safety and durable audit decision register",
      "Enterprise license and phased deployment proposal"
    ],
    successMetrics: [
      "Identity and access decisions approved",
      "Connector scope and conformance plan approved",
      "Runtime safety and audit owners assigned",
      "Annual license decision supported by measured value"
    ],
    buyerInputs: [
      "Executive steering sponsor",
      "Security, privacy, compliance, and legal participation",
      "Workflow and integration owners",
      "Approved baseline and value methodology"
    ],
    governanceGates: [
      "BAA and data-boundary decisions defined before live data",
      "Tenant identity and roles approved",
      "Durable audit and incident response approved",
      "Human-review procedures approved"
    ],
    productionExclusions: [
      "No live clinical execution until every required control is approved",
      "No unsupported clinical or reimbursement claims",
      "No connector activation without partner acceptance",
      "No autonomous diagnosis or treatment"
    ],
    requestRoute: "/pilot?offer=clinical-operations-automation-blueprint"
  },
  {
    slug: "ai-governance-interoperability-readiness",
    name: "AI Governance + Interoperability Readiness Pilot",
    route: "/pilots/ai-governance-interoperability-readiness",
    apiRoute: "/api/pilots/ai-governance-interoperability-readiness",
    status: "sellable-now",
    duration: "45-60 days",
    buyer: "CIO, compliance, security, clinical governance, and integration leadership teams",
    engagementModel: "Custom fixed-fee assessment based on organizations, workflows, and standards scope",
    objective:
      "Create an actionable AI asset, governance, interoperability, and production-readiness register before healthcare AI deployment.",
    demoSlugs: ["atlas-interoperability-readiness", "agentos-governance-evaluation"],
    deliverables: [
      "AI Asset Registry and shadow-AI findings",
      "Governance and approval gap report",
      "Standards, connector, and conformance target map",
      "Trust, audit, identity, and runtime safety decision register",
      "Executive remediation roadmap"
    ],
    successMetrics: [
      "AI assets and owners inventoried",
      "High-risk governance gaps assigned",
      "Interoperability targets and blockers approved",
      "Deployment decision path made explicit"
    ],
    buyerInputs: [
      "AI, integration, workflow, and vendor inventory",
      "Security and compliance policies",
      "Target standards and trading partners",
      "Executive risk and deployment priorities"
    ],
    governanceGates: [
      "Assessment access follows least privilege",
      "No patient records required",
      "Findings require accountable owner and disposition",
      "Production authorization remains outside the assessment"
    ],
    productionExclusions: [
      "No certification claim",
      "No live connector implementation",
      "No production AI authorization",
      "No clinical advice"
    ],
    requestRoute: "/pilot?offer=ai-readiness-governance-audit"
  }
];

export function getProductDemos() {
  return productDemos;
}

export function getProductDemoBySlug(slug: string) {
  return productDemos.find((demo) => demo.slug === slug);
}

export function getPilotPrograms() {
  return pilotPrograms;
}

export function getPilotProgramBySlug(slug: string) {
  return pilotPrograms.find((pilot) => pilot.slug === slug);
}

export function getDemosForPilot(pilot: PilotProgram) {
  return pilot.demoSlugs
    .map((slug) => getProductDemoBySlug(slug))
    .filter((demo): demo is ProductDemo => Boolean(demo));
}

export function getDemoPilotProgramSummary() {
  return {
    service: "scrimed-demo-pilot-center",
    status: "buyer-ready-synthetic-evaluations",
    demoRoute: "/demos",
    demoApiRoute: "/api/demos",
    pilotRoute: "/pilots",
    pilotApiRoute: "/api/pilots",
    boundary: demoPilotBoundary,
    demoCount: productDemos.length,
    executableDemos: productDemos.filter((demo) => demo.status === "executable-demo").length,
    pilotCount: pilotPrograms.length,
    sellableNow: pilotPrograms.filter((pilot) => pilot.status === "sellable-now").length,
    protectedPilots: pilotPrograms.filter((pilot) => pilot.status === "protected-pilot").length,
    productDemos,
    pilotPrograms,
    updated: "2026-06-09"
  };
}
