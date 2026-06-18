import { getCommercialStrategySummary } from "./commercialStrategy";
import { getDemoPilotProgramSummary } from "./demoPilotPrograms";
import { getEnterpriseReadinessSummary } from "./enterpriseReadiness";
import { getHealthcareIntelligenceOSSummary } from "./healthcareIntelligenceOS";
import { getProductConsoleSummary } from "./productConsole";
import { getProtectedPilotWorkspaceSummary } from "./protectedPilotWorkspace";
import { getSalesOperationsSummary } from "./salesOperations";
import { getPersistentAgentWorkspaceSummary } from "./persistentAgentWorkspace";
import { getQaEvidenceLedger } from "./qaEvidenceLedger";

export type PilotEvidenceCard = {
  name: string;
  status: string;
  route: string;
  apiRoute: string;
  buyerQuestion: string;
  currentEvidence: string;
  boundary: string;
};

export type PilotEvidenceReadinessTrack = {
  track: string;
  status: string;
  owner: string;
  evidence: string;
  nextGate: string;
};

export type PilotEvidenceAction = {
  label: string;
  href: string;
  purpose: string;
};

export type PilotEvidenceMetric = {
  metric: string;
  signal: string;
  proof: string;
  measurementBoundary: string;
};

export const pilotEvidenceBoundary =
  "This dashboard summarizes SCRIMED's governed synthetic pilot and enterprise evaluation evidence. It is not a clinical validation report, legal opinion, compliance certification, regulatory clearance, or authorization for live healthcare execution.";

export function getPilotEvidenceDashboard() {
  const product = getProductConsoleSummary();
  const healthcareOS = getHealthcareIntelligenceOSSummary();
  const protectedWorkspace = getProtectedPilotWorkspaceSummary();
  const persistentWorkspace = getPersistentAgentWorkspaceSummary();
  const demoPilot = getDemoPilotProgramSummary();
  const enterpriseReadiness = getEnterpriseReadinessSummary();
  const commercial = getCommercialStrategySummary();
  const salesOperations = getSalesOperationsSummary();
  const qaEvidenceLedger = getQaEvidenceLedger();

  const evidenceCards: PilotEvidenceCard[] = [
    {
      name: "Healthcare Intelligence OS foundation",
      status: healthcareOS.status,
      route: healthcareOS.route,
      apiRoute: healthcareOS.apiRoute,
      buyerQuestion: "Is SCRIMED an operating layer rather than a disconnected healthcare chatbot?",
      currentEvidence:
        `${healthcareOS.architecture.length} phased architecture tracks connect Agent Runtime, Clinical Knowledge Graph, Validation Trust Lab, workspaces, model routing, sovereign deployment, risk, and population intelligence.`,
      boundary: healthcareOS.boundary
    },
    {
      name: "Agent Runtime",
      status: healthcareOS.agentRuntime.status,
      route: healthcareOS.agentRuntime.route,
      apiRoute: healthcareOS.agentRuntime.apiRoute,
      buyerQuestion: "Can SCRIMED coordinate specialized agents with shared governance?",
      currentEvidence:
        `${healthcareOS.agentRuntime.controlPlaneCount} control-plane components, ${healthcareOS.agentRuntime.specialistServiceCount} specialist services, and ${healthcareOS.agentRuntime.workflowExecutionCount} workflow execution contracts are inspectable.`,
      boundary:
        "AgentOS generates governed synthetic plans and denies production execution until tenant identity, connector, audit, privacy, and human operating controls are approved."
    },
    {
      name: "Clinical Knowledge Graph foundation",
      status: healthcareOS.clinicalKnowledgeGraph.status,
      route: healthcareOS.route,
      apiRoute: healthcareOS.apiRoute,
      buyerQuestion: "Can SCRIMED reason across clinical, payer, research, imaging, and interoperability context?",
      currentEvidence:
        `${healthcareOS.clinicalKnowledgeGraph.standards.length} standard families, ${healthcareOS.clinicalKnowledgeGraph.nodeTypes.length} node types, and ${healthcareOS.clinicalKnowledgeGraph.relationshipTypes.length} relationship contracts are defined.`,
      boundary: healthcareOS.clinicalKnowledgeGraph.boundary
    },
    {
      name: "Validation and Trust Lab",
      status: healthcareOS.validationTrustLab.status,
      route: healthcareOS.validationTrustLab.route,
      apiRoute: healthcareOS.validationTrustLab.apiRoute,
      buyerQuestion: "Does every AI output carry evidence, confidence, review state, and auditability?",
      currentEvidence:
        `${healthcareOS.validationTrustLab.fields.length} validation fields, ${healthcareOS.validationTrustLab.trustOSControlCount} TrustOS controls, and ${healthcareOS.validationTrustLab.atlasTrustCardCount} Atlas Trust Cards are exposed.`,
      boundary: healthcareOS.validationTrustLab.boundary
    },
    {
      name: "Protected pilot workspace",
      status: protectedWorkspace.status,
      route: protectedWorkspace.route,
      apiRoute: "/api/pilot-workspaces",
      buyerQuestion: "Can SCRIMED host tenant-authenticated synthetic evaluations with durable proof?",
      currentEvidence:
        `${protectedWorkspace.capabilities.length} protected workspace capabilities cover sessions, audit events, TrustOS decisions, governance packets, onboarding, activation, and proof packets.`,
      boundary: protectedWorkspace.boundary
    },
    {
      name: "Persistent Agent Workspace",
      status: persistentWorkspace.status,
      route: persistentWorkspace.route,
      apiRoute: persistentWorkspace.apiRoute,
      buyerQuestion: "Can SCRIMED keep agent work resumable, auditable, review-gated, and proof-ready across sessions?",
      currentEvidence:
        `${persistentWorkspace.workOrderCount} work-order templates, ${persistentWorkspace.modelRouterDecisionCount} model-router policies, ${persistentWorkspace.reviewerCheckpointCount} reviewer checkpoints, and ${persistentWorkspace.limitationCount} limitation-resolution paths are inspectable.`,
      boundary: persistentWorkspace.boundary
    },
    {
      name: "Demo and pilot commercial proof",
      status: demoPilot.status,
      route: demoPilot.demoRoute,
      apiRoute: demoPilot.demoApiRoute,
      buyerQuestion: "Can a buyer inspect demos and convert them into a governed pilot path?",
      currentEvidence:
        `${demoPilot.executableDemos} executable demos and ${demoPilot.pilotCount} pilot programs connect workflow pain, proof routes, metrics, and explicit exclusions.`,
      boundary: demoPilot.boundary
    },
    {
      name: "Enterprise readiness and claims control",
      status: enterpriseReadiness.status,
      route: enterpriseReadiness.route,
      apiRoute: enterpriseReadiness.apiRoute,
      buyerQuestion: "Are legal, security, privacy, governance, marketing, and sales claims controlled?",
      currentEvidence:
        `${enterpriseReadiness.domainCount} readiness domains, ${enterpriseReadiness.claims.total} controlled claims, and ${enterpriseReadiness.externalReviewsRequired} external-review requirements are visible.`,
      boundary: enterpriseReadiness.boundary
    },
    {
      name: "Commercial model and sales operations",
      status: commercial.status,
      route: commercial.route,
      apiRoute: commercial.apiRoute,
      buyerQuestion: "Can SCRIMED turn product interest into a qualified pilot or enterprise assessment?",
      currentEvidence:
        `${product.serviceOfferCount} enterprise offers, ${product.pilotProgramCount} pilot programs, and Sales Operations status ${salesOperations.status} support retained buyer intake and proposal workflows.`,
      boundary: commercial.boundary
    },
    {
      name: "QA evidence and operator-token readiness",
      status: qaEvidenceLedger.status,
      route: qaEvidenceLedger.route,
      apiRoute: qaEvidenceLedger.apiRoute,
      buyerQuestion: "Can SCRIMED show release proof, fail-closed controls, and remaining manual gates clearly?",
      currentEvidence:
        `${qaEvidenceLedger.recordedEvidenceCount} QA evidence entries show ${qaEvidenceLedger.passed} passed checks, ${qaEvidenceLedger.failClosed} fail-closed controls, and ${qaEvidenceLedger.manualGates} manual AAL2 gate.`,
      boundary: qaEvidenceLedger.boundary
    }
  ];

  const readinessTracks: PilotEvidenceReadinessTrack[] = [
    {
      track: "Tenant identity",
      status: protectedWorkspace.infrastructure.identity.configured ? "configured" : "activation-required",
      owner: "Protected Pilot Workspace",
      evidence: protectedWorkspace.infrastructure.identity.control,
      nextGate: "Approve customer SSO, MFA posture, account lifecycle, and reviewer authority before production workflow use."
    },
    {
      track: "Durable workspace storage",
      status: protectedWorkspace.infrastructure.durableStore.configured ? "configured" : "activation-required",
      owner: "Protected Pilot Workspace",
      evidence: protectedWorkspace.infrastructure.durableStore.control,
      nextGate: "Approve retention, deletion, access review, encryption, residency, legal hold, and incident export."
    },
    {
      track: "Distributed rate limiting",
      status: protectedWorkspace.infrastructure.rateLimit.configured ? "configured" : "fallback-active",
      owner: "Runtime safety",
      evidence: protectedWorkspace.infrastructure.rateLimit.fallback,
      nextGate: "Add tenant, user, workflow, region, and emergency-shutdown limits before high-volume production use."
    },
    {
      track: "Persistent agent work orders",
      status: persistentWorkspace.status,
      owner: "Persistent Agent Workspace",
      evidence:
        `${persistentWorkspace.workOrderCount} work orders map to saved state, model-router policy, Trust Cards, audit events, reviewer checkpoints, and proof packets.`,
      nextGate: persistentWorkspace.nextImplementationStep
    },
    {
      track: "Clinical validation",
      status: "external-review-required",
      owner: "Validation and Trust Lab",
      evidence: "Validation fields are defined for correctness, completeness, safety, confidence, evidence, model route, reviewer status, and audit log.",
      nextGate: "Licensed clinician rubric, validation study, intended-use review, and customer safety governance."
    },
    {
      track: "Sovereign deployment",
      status: healthcareOS.sovereignDeployment.status,
      owner: "Platform architecture",
      evidence:
        `${healthcareOS.sovereignDeployment.profiles.length} deployment profiles cover managed cloud, private cloud, hospital-controlled, government, and edge/on-prem needs.`,
      nextGate: "Validate private-network, regional, identity, local audit, and model route controls for each customer environment."
    },
    {
      track: "Sales Demo Session QA evidence",
      status: qaEvidenceLedger.manualGates > 0 ? "manual-aal2-gate" : "verified",
      owner: "SCRIMED operator",
      evidence: qaEvidenceLedger.buyerSafeSummary,
      nextGate: qaEvidenceLedger.nextRecommendedBuildStep
    }
  ];

  const buyerActions: PilotEvidenceAction[] = [
    {
      label: "Request Pilot",
      href: "/pilot?offer=synthetic-pilot-evaluation",
      purpose: "Start a governed synthetic pilot or enterprise evaluation conversation."
    },
    {
      label: "View Product Console",
      href: "/product",
      purpose: "Inspect offers, agents, workflows, proof stack, and production boundaries."
    },
    {
      label: "Open Healthcare Intelligence OS",
      href: healthcareOS.route,
      purpose: "Review the operating-system architecture, phase plan, knowledge graph, validation lab, and deployment gates."
    },
    {
      label: "Open Agent Workspace",
      href: persistentWorkspace.route,
      purpose: "Inspect long-running agent work orders, saved state, model routing, audit timeline, reviewer checkpoints, and limitation-resolution controls."
    },
    {
      label: "Open Protected Pilot Workspace",
      href: protectedWorkspace.route,
      purpose: "Inspect tenant isolation, durable synthetic sessions, audit controls, activation workflow, and proof packets."
    },
    {
      label: "Download Evidence Brief",
      href: "/api/pilot-evidence/brief",
      purpose: "Export a concise enterprise proof brief for buyer, investor, or internal diligence."
    },
    {
      label: "Open QA Evidence Ledger",
      href: qaEvidenceLedger.route,
      purpose: "Review release QA evidence, fail-closed controls, token-policy readiness, and remaining manual gates."
    }
  ];

  const proofStack = Object.entries(product.proofStack).map(([name, status]) => ({
    name,
    status,
    route: product.route
  }));

  const evidenceMetrics: PilotEvidenceMetric[] = product.evidenceMetrics.map((metric) => ({
    metric: metric.metric,
    signal: metric.signal,
    proof: metric.proof,
    measurementBoundary: metric.measurementBoundary
  }));

  return {
    service: "scrimed-pilot-evidence-dashboard",
    route: "/pilot-evidence",
    apiRoute: "/api/pilot-evidence",
    briefRoute: "/api/pilot-evidence/brief",
    status: "enterprise-evidence-ready",
    boundary: pilotEvidenceBoundary,
    currentProductBoundary: product.productionBoundary,
    investorThesis: demoPilot.investorReadiness.thesis,
    conversionPath: demoPilot.investorReadiness.demoToPilotConversionPath,
    operatingSystemRoute: healthcareOS.route,
    evidenceCardCount: evidenceCards.length,
    readinessTrackCount: readinessTracks.length,
    proofStackCount: proofStack.length,
    metricCount: evidenceMetrics.length,
    architecturePhaseCount: healthcareOS.architecture.length,
    evidenceCards,
    readinessTracks,
    architecture: healthcareOS.architecture,
    evidenceMetrics,
    proofStack,
    buyerActions,
    qaEvidenceLedger,
    dataPosture: healthcareOS.currentStack.dataPosture,
    externalReviewGates: healthcareOS.todoGates,
    updated: "2026-06-18"
  };
}

export function buildPilotEvidenceBrief() {
  const dashboard = getPilotEvidenceDashboard();

  return [
    "# SCRIMED Enterprise Pilot Evidence Brief",
    "",
    `Status: ${dashboard.status}`,
    `Boundary: ${dashboard.boundary}`,
    `Current product boundary: ${dashboard.currentProductBoundary}`,
    "",
    "## Investor and Buyer Thesis",
    dashboard.investorThesis,
    "",
    "## Demo-to-Pilot Conversion Path",
    dashboard.conversionPath,
    "",
    "## Evidence Cards",
    ...dashboard.evidenceCards.map(
      (card) =>
        `- ${card.name} (${card.status}): ${card.currentEvidence} Route: ${card.route}. Boundary: ${card.boundary}`
    ),
    "",
    "## Readiness Tracks",
    ...dashboard.readinessTracks.map(
      (track) => `- ${track.track} (${track.status}): ${track.evidence} Next gate: ${track.nextGate}`
    ),
    "",
    "## Measurable Pilot Outcomes",
    ...dashboard.evidenceMetrics.map(
      (metric) =>
        `- ${metric.metric}: ${metric.signal} Proof: ${metric.proof} Measurement boundary: ${metric.measurementBoundary}`
    ),
    "",
    "## Required External Review and Production Gates",
    ...dashboard.externalReviewGates.map((gate) => `- ${gate}`),
    "",
    "## QA Evidence Ledger",
    `- Status: ${dashboard.qaEvidenceLedger.status}`,
    `- Recorded evidence entries: ${dashboard.qaEvidenceLedger.recordedEvidenceCount}`,
    `- Manual AAL2 gates remaining: ${dashboard.qaEvidenceLedger.manualGates}`,
    `- Manual run packet route: ${dashboard.qaEvidenceLedger.manualRunEvidenceCapture.route}`,
    `- Buyer-safe summary: ${dashboard.qaEvidenceLedger.buyerSafeSummary}`,
    "",
    "## Key Routes",
    `- Pilot evidence dashboard: ${dashboard.route}`,
    `- Pilot evidence API: ${dashboard.apiRoute}`,
    `- QA evidence ledger: ${dashboard.qaEvidenceLedger.route}`,
    `- Healthcare Intelligence OS: ${dashboard.operatingSystemRoute}`,
    `- Product Console: /product`,
    `- Protected Pilot Workspace: /pilot-workspace`
  ].join("\n");
}
