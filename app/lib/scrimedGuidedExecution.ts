import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";

export type ScrimedGuidedAudience =
  | "hospital-buyer"
  | "faith-based-clinic"
  | "investor"
  | "pilot-lead"
  | "implementation-partner"
  | "internal-operator";

export type ScrimedGuidedExecutionStatus = "ready-for-demo" | "ready-for-diligence" | "ready-for-scoped-pilot" | "blocked-for-production";

export type ScrimedGuidedExecutionPath = {
  id: ScrimedGuidedAudience;
  title: string;
  audience: string;
  objective: string;
  landingRoute: string;
  demoSequence: string[];
  proofRoutes: string[];
  pitchAngle: string;
  pricingMotion: string;
  trustObjectionsHandled: string[];
  requiredArtifacts: string[];
  successMetrics: string[];
  nextHumanAction: string;
  status: ScrimedGuidedExecutionStatus;
  retainedBoundary: string;
  auditHash: string;
};

export type ScrimedGuidedExecutionFrictionReducer = {
  id: string;
  friction: string;
  resolution: string;
  owner: string;
  metric: string;
  boundary: string;
};

export type ScrimedGuidedExecutionRunbook = {
  id: string;
  name: string;
  audience: ScrimedGuidedAudience;
  openingFrame: string;
  mustShowRoutes: string[];
  proofMoment: string;
  closeQuestion: string;
  followUpArtifact: string;
  hardStops: string[];
};

export const scrimedGuidedExecutionApiRoute = "/api/scrimed-guided-execution";
export const scrimedGuidedExecutionPageRoute = "/scrimed-guided-execution";
export const scrimedGuidedExecutionStatus = "scrimed-guided-execution-active-synthetic-no-phi";
export const scrimedGuidedExecutionBoundary =
  "SCRIMED Guided Execution Path is a synthetic/no-PHI buyer, investor, pilot, partner, and operator guidance layer. It maps audiences to demo routes, proof routes, pricing motions, review artifacts, human next steps, and retained boundaries without authorizing live PHI, autonomous clinical care, diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, production connector approval, certification claims, investment advice, or customer go-live.";

const retainedBoundary =
  "No PHI, no autonomous clinical care, no diagnosis/treatment/prescribing, no patient outreach, no payer submission, no EHR writeback, no production connector approval, no certification claim, no investment advice, and no customer go-live.";

function guidedHash(id: string, title: string, objective: string) {
  return generateScrimedAuditHash({
    id,
    title,
    objective,
    safetyPolicyVersion: scrimedSafetyPolicyVersion
  });
}

export const scrimedGuidedExecutionPaths: ScrimedGuidedExecutionPath[] = [
  {
    id: "hospital-buyer",
    title: "Hospital Buyer Guided Path",
    audience: "Hospital executive, operational sponsor, clinical transformation leader, or procurement champion",
    objective: "Move from interest to a governed no-PHI workflow assessment or synthetic pilot decision.",
    landingRoute: "/pilot-demo-commercial-readiness",
    demoSequence: [
      "/scrimed-enterprise-acceleration",
      "/scrimed-governance-learning-loop",
      "/scrimed-clinical-benchmark-suite",
      "/offerings",
      "/pilot"
    ],
    proofRoutes: [
      "/clinical-production-readiness",
      "/risk-register",
      "/boundary-release-approvals",
      "/scrimed-llmops-observability"
    ],
    pitchAngle: "SCRIMED reduces workflow ambiguity by turning AI governance, proof, and operational readiness into a buyer-safe pilot path.",
    pricingMotion: "30-day Workflow Intelligence Assessment or 60-90 day Governed Synthetic Pilot.",
    trustObjectionsHandled: ["safety boundaries", "clinical review", "auditability", "implementation path", "workflow value"],
    requiredArtifacts: ["buyer-safe proof packet", "no-PHI intake scope", "demo run-of-show", "pilot acceptance criteria"],
    successMetrics: ["qualified pilot request", "selected workflow lane", "named reviewer role", "accepted no-go boundary"],
    nextHumanAction: "Schedule a guided no-PHI workflow assessment scoping call.",
    status: "ready-for-scoped-pilot",
    retainedBoundary,
    auditHash: guidedHash("hospital-buyer", "Hospital Buyer Guided Path", "Move from interest to governed pilot decision.")
  },
  {
    id: "faith-based-clinic",
    title: "Faith-Based Clinic Guided Path",
    audience: "Faith-based clinic sponsor, clinic director, community care leader, or donor-backed operating partner",
    objective: "Show SCRIMED's clinic-friendly value without overclaiming clinical, regulatory, or financial outcomes.",
    landingRoute: "/investor-audience-readiness",
    demoSequence: ["/offerings", "/service-delivery", "/client-onboarding", "/health-records", "/pilot"],
    proofRoutes: ["/company-assessment", "/limitations-workarounds", "/global-reach", "/scrimed-patient-context-gateway"],
    pitchAngle: "SCRIMED supports clinic operations with governed, human-reviewed workflow intelligence and no-PHI readiness services.",
    pricingMotion: "Fixed-scope readiness package with margin-safe implementation support.",
    trustObjectionsHandled: ["budget sensitivity", "staff burden", "community trust", "privacy boundaries", "implementation simplicity"],
    requiredArtifacts: ["clinic readiness brief", "service delivery scope", "human-review workflow map", "safe claims checklist"],
    successMetrics: ["selected service package", "named clinic owner", "implementation readiness score", "approved communication boundary"],
    nextHumanAction: "Confirm clinic pain points and choose one scoped no-PHI workflow package.",
    status: "ready-for-demo",
    retainedBoundary,
    auditHash: guidedHash("faith-based-clinic", "Faith-Based Clinic Guided Path", "Show clinic-friendly value safely.")
  },
  {
    id: "investor",
    title: "Investor Guided Diligence Path",
    audience: "Angel investor, strategic corporate investor, private investor, healthcare infrastructure investor, or board reviewer",
    objective: "Make SCRIMED's platform, moat, revenue motion, safety posture, and next milestones easy to diligence.",
    landingRoute: "/investor-readiness",
    demoSequence: [
      "/scrimed-enterprise-acceleration",
      "/scrimed-guided-execution",
      "/scrimed-governance-learning-loop",
      "/scrimed-intelligence-platform",
      "/capital-vitality"
    ],
    proofRoutes: ["/risk-register", "/production-architecture", "/navigation", "/scrimed-compute-fabric"],
    pitchAngle: "SCRIMED is healthcare AI infrastructure: governed agents, evidence, workflow value, model routing, and safe commercial pathways.",
    pricingMotion: "Capital supports product hardening, proof-packaging, protected pilots, governance services, and enterprise delivery capacity.",
    trustObjectionsHandled: ["moat clarity", "revenue path", "clinical boundary discipline", "technical proof", "scalability"],
    requiredArtifacts: ["investor run-of-show", "readiness scorecard", "revenue motion map", "risk register summary"],
    successMetrics: ["diligence packet reviewed", "capital milestone accepted", "follow-up questions logged", "safe claim alignment"],
    nextHumanAction: "Walk through the investor command path and capture diligence questions as tracked follow-ups.",
    status: "ready-for-diligence",
    retainedBoundary,
    auditHash: guidedHash("investor", "Investor Guided Diligence Path", "Make SCRIMED easier to diligence.")
  },
  {
    id: "pilot-lead",
    title: "Pilot Lead Guided Path",
    audience: "Pilot owner, implementation sponsor, transformation manager, or SCRIMED delivery lead",
    objective: "Convert an approved no-PHI demo into scoped pilot artifacts, review roles, and acceptance criteria.",
    landingRoute: "/pilot-deal-room",
    demoSequence: ["/pilot-demo-commercial-readiness", "/service-delivery", "/qa-evidence", "/boundary-release-approvals", "/pilot"],
    proofRoutes: ["/qa-buyer-proof-release", "/qa-run-control", "/qa-human-run-packet", "/workflows/execution-attempts"],
    pitchAngle: "SCRIMED pilots win when scope, proof, acceptance, evidence, and boundaries are explicit before work expands.",
    pricingMotion: "Governed Synthetic Pilot with acceptance milestones and no-PHI work order.",
    trustObjectionsHandled: ["scope creep", "unclear ownership", "proof quality", "workflow acceptance", "review bottlenecks"],
    requiredArtifacts: ["pilot work order", "acceptance checklist", "reviewer matrix", "proof-packet manifest"],
    successMetrics: ["work order ready", "review owner named", "proof route accepted", "pilot start criteria met"],
    nextHumanAction: "Create or approve the scoped no-PHI pilot work order.",
    status: "ready-for-scoped-pilot",
    retainedBoundary,
    auditHash: guidedHash("pilot-lead", "Pilot Lead Guided Path", "Convert demo into scoped pilot artifacts.")
  },
  {
    id: "implementation-partner",
    title: "Implementation Partner Guided Path",
    audience: "Systems integrator, interoperability partner, implementation consultant, or enterprise AI partner",
    objective: "Show how partners can align to SCRIMED's governed delivery model without production connector authority.",
    landingRoute: "/interoperability",
    demoSequence: ["/scrimed-os", "/scrimed-governance-learning-loop", "/health-records", "/clinical-data-fabric", "/service-delivery"],
    proofRoutes: ["/clinical-context-gateway", "/clinical-data-governance", "/scrimed-hybrid-retrieval", "/limitations-workarounds"],
    pitchAngle: "SCRIMED gives partners a governed AI and interoperability framework with clear tool, data, and review boundaries.",
    pricingMotion: "Partner implementation readiness package plus scoped integration planning.",
    trustObjectionsHandled: ["data access", "connector authority", "role boundaries", "delivery ownership", "standards readiness"],
    requiredArtifacts: ["partner boundary map", "standards readiness brief", "tool authorization matrix", "delivery handoff plan"],
    successMetrics: ["partner lane selected", "tool scope drafted", "synthetic fixture path chosen", "production boundary retained"],
    nextHumanAction: "Define a synthetic integration planning lane and owner map.",
    status: "ready-for-diligence",
    retainedBoundary,
    auditHash: guidedHash("implementation-partner", "Implementation Partner Guided Path", "Align partners to governed delivery.")
  },
  {
    id: "internal-operator",
    title: "Internal Operator Guided Path",
    audience: "SCRIMED founder, operator, product owner, release steward, or delivery manager",
    objective: "Prioritize the next safest build, sales, proof, and delivery action from one execution map.",
    landingRoute: "/scrimed-operating-command",
    demoSequence: [
      "/scrimed-guided-execution",
      "/scrimed-enterprise-acceleration",
      "/scrimed-governance-learning-loop",
      "/operational-efficiency",
      "/release-continuity"
    ],
    proofRoutes: ["/navigation", "/service-reliability", "/qa-evidence", "/limitations-workarounds"],
    pitchAngle: "SCRIMED compounds faster when every build artifact becomes a proof route, every proof route maps to a buyer path, and every buyer path keeps boundaries visible.",
    pricingMotion: "Use current no-PHI offers while tracking future approval gates separately.",
    trustObjectionsHandled: ["priority overload", "route sprawl", "unclear next action", "safety drift", "commercial handoff"],
    requiredArtifacts: ["weekly execution queue", "proof-route delta", "sales next-action map", "boundary exception log"],
    successMetrics: ["one next action per audience", "stale route count zero", "new smoke added", "safe claim coverage"],
    nextHumanAction: "Use the guided execution page as the weekly operating agenda.",
    status: "ready-for-diligence",
    retainedBoundary,
    auditHash: guidedHash("internal-operator", "Internal Operator Guided Path", "Prioritize next safest build and commercial action.")
  }
];

export const scrimedGuidedExecutionFrictionReducers: ScrimedGuidedExecutionFrictionReducer[] = [
  {
    id: "proof-route-sprawl",
    friction: "Buyers and investors can see many proof surfaces but may not know which one matters to them.",
    resolution: "Map each audience to a landing route, demo sequence, proof routes, next action, and retained boundary.",
    owner: "Product + Founder",
    metric: "Lower demo confusion and faster follow-up artifact selection.",
    boundary: retainedBoundary
  },
  {
    id: "commercial-handoff-gap",
    friction: "A strong demo can lose momentum if it does not end with a clear offer and human next step.",
    resolution: "Attach every path to one pricing motion, one required artifact set, and one human action.",
    owner: "Sales Operations",
    metric: "More qualified scoped-pilot conversations.",
    boundary: retainedBoundary
  },
  {
    id: "trust-objection-lag",
    friction: "Safety, privacy, certification, connector, and clinical authority concerns can arrive late in diligence.",
    resolution: "Surface trust objections and hard stops early, before custom work expands.",
    owner: "Trust + Governance",
    metric: "Fewer unresolved boundary questions after demos.",
    boundary: retainedBoundary
  },
  {
    id: "operator-priority-drift",
    friction: "Internal execution can spread across many valid priorities without one audience-specific agenda.",
    resolution: "Use guided paths to choose the next build, proof, sales, or delivery artifact by audience.",
    owner: "Operating Command",
    metric: "Weekly execution queue tied to proof routes and smoke coverage.",
    boundary: retainedBoundary
  }
];

export const scrimedGuidedExecutionRunbooks: ScrimedGuidedExecutionRunbook[] = [
  {
    id: "investor-15-minute-runbook",
    name: "15-minute investor walkthrough",
    audience: "investor",
    openingFrame: "SCRIMED is a governed healthcare intelligence operating system, not a chatbot.",
    mustShowRoutes: ["/investor-readiness", "/scrimed-enterprise-acceleration", "/scrimed-governance-learning-loop"],
    proofMoment: "Show safety boundaries, route-count integrity, nonsecret tests, and proof-route mapping.",
    closeQuestion: "Which diligence question should become the next tracked proof artifact?",
    followUpArtifact: "Investor proof packet and capital milestone map.",
    hardStops: ["No investment advice", "No valuation assurance", "No certification claim", "No customer go-live claim"]
  },
  {
    id: "buyer-20-minute-runbook",
    name: "20-minute buyer workflow walkthrough",
    audience: "hospital-buyer",
    openingFrame: "SCRIMED helps buyers move from workflow pain to governed no-PHI pilot proof.",
    mustShowRoutes: ["/pilot-demo-commercial-readiness", "/offerings", "/scrimed-clinical-benchmark-suite"],
    proofMoment: "Show how a workflow becomes a scoped offer, acceptance criteria, and review artifact.",
    closeQuestion: "Which no-PHI workflow should SCRIMED scope first?",
    followUpArtifact: "Workflow Intelligence Assessment scope and proof checklist.",
    hardStops: ["No PHI", "No autonomous clinical care", "No payer submission", "No EHR writeback"]
  },
  {
    id: "operator-weekly-runbook",
    name: "Weekly SCRIMED execution agenda",
    audience: "internal-operator",
    openingFrame: "Every build step must improve proof, buyer clarity, safety, or delivery leverage.",
    mustShowRoutes: ["/scrimed-operating-command", "/scrimed-guided-execution", "/navigation"],
    proofMoment: "Show new route, contract, public smoke, and retained boundary before planning the next layer.",
    closeQuestion: "What is the highest-leverage artifact that removes friction for one audience this week?",
    followUpArtifact: "Weekly execution queue with owner, route, smoke, proof, and hard stop.",
    hardStops: ["No production deploy without approval", "No boundary relief without approval matrix", "No secret or PHI exposure"]
  }
];

export function getScrimedGuidedExecutionSummary() {
  const productionBlockedPaths = scrimedGuidedExecutionPaths.filter((path) => path.status === "blocked-for-production");

  return {
    service: "scrimed-guided-execution",
    status: scrimedGuidedExecutionStatus,
    apiRoute: scrimedGuidedExecutionApiRoute,
    pageRoute: scrimedGuidedExecutionPageRoute,
    boundary: scrimedGuidedExecutionBoundary,
    paths: scrimedGuidedExecutionPaths,
    frictionReducers: scrimedGuidedExecutionFrictionReducers,
    runbooks: scrimedGuidedExecutionRunbooks,
    productionBlockedPaths,
    audienceCount: scrimedGuidedExecutionPaths.length,
    recommendedNextBuildStep:
      "Convert guided paths into downloadable audience-specific proof packets with owner, route, smoke, pricing motion, and retained boundary.",
    productionReadiness: false,
    noPhiConfirmed: true
  };
}
