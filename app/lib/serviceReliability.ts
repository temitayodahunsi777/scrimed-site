import { getBoundaryResolutionSummary } from "./boundaryResolution";
import { getNavigationAuditSummary } from "./navigationAudit";
import { getQaManualExecutionConsoleSummary } from "./qaManualExecutionConsole";
import { getReleaseContinuitySummary } from "./releaseContinuity";
import { getTrustSafetyOperationsSummary } from "./trustSafetyOperations";

export type ServiceReliabilityControlStatus =
  | "active"
  | "resolved"
  | "contained"
  | "operator-required"
  | "external-review-required"
  | "protected-gated";

export type ProductServiceControl = {
  name: string;
  owner: string;
  productSurface: string;
  status: ServiceReliabilityControlStatus;
  barrier: string;
  mitigation: string;
  proofRoutes: string[];
  retainedBoundary: string;
  nextAction: string;
};

export type ReliabilityFaultClass = {
  name: string;
  severity: "watch" | "high";
  likelySource: string;
  control: string;
  detectionRoutes: string[];
  failClosedBehavior: string;
};

export type EfficiencyImprovement = {
  name: string;
  impact: string;
  proof: string;
  owner: string;
};

export const serviceReliabilityRoute = "/service-reliability";
export const serviceReliabilityApiRoute = "/api/service-reliability";
export const serviceReliabilityBriefRoute = "/api/service-reliability/brief";
export const serviceReliabilityProofStackStatus = "service-reliability-hardening-active";
export const serviceReliabilityBriefProofStackStatus = "service-reliability-brief-ready";
export const serviceReliabilityUpdatedAt = "2026-06-23";

export const serviceReliabilityBoundary =
  "SCRIMED Service Reliability maps products, services, agents, barriers, fault classes, mitigations, owners, proof routes, and retained approval boundaries into one operating lane. It strengthens execution discipline, but it does not certify security or compliance, grant legal approval, approve buyer release, bypass AAL2, authorize PHI processing, approve production connectors, guarantee reimbursement, authorize public customer claims, or authorize live clinical care.";

export const productServiceControls: ProductServiceControl[] = [
  {
    name: "Product Console and OS Hub discoverability",
    owner: "Product Console + Release Steward",
    productSurface: "Product, Hub, Homepage, Navigation Audit",
    status: "resolved",
    barrier: "Route sprawl made it easy for high-value proof surfaces to become hard to find.",
    mitigation:
      "Navigation Audit, Product Console, Hub, and homepage now cross-link the command surfaces and route inventory.",
    proofRoutes: ["/product", "/hub", "/navigation", "/api/navigation-audit"],
    retainedBoundary: "Route discoverability is operating evidence, not protected execution proof or release approval.",
    nextAction: "Keep new buyer-critical pages inside the navigation audit, hub view, and smoke scope."
  },
  {
    name: "Release continuity and source-control alignment",
    owner: "Release Steward",
    productSurface: "Release Continuity",
    status: "contained",
    barrier:
      "Production can drift from source control if deployments, tags, smoke proof, and no-secret boundaries are not checkpointed together.",
    mitigation:
      "Release Continuity ties deployment proof, GitHub baselines, public smoke, protected fail-closed checks, and AAL2 operator limits into one lane.",
    proofRoutes: ["/release-continuity", "/api/release-continuity", "/api/release-continuity/brief"],
    retainedBoundary: "Continuity proof does not mint tokens, store secrets, bypass AAL2, or approve buyer release.",
    nextAction: "Run public smoke and update the checkpoint after each production deployment."
  },
  {
    name: "Clinical, legal, security, and approval authority",
    owner: "Founder + qualified external reviewers",
    productSurface: "Approvals Readiness, Clinical Authority, Boundary Resolution",
    status: "external-review-required",
    barrier:
      "SCRIMED can prepare approval evidence but cannot self-certify HIPAA, SOC 2, HITRUST, FDA, ONC, legal, reimbursement, or clinical authority.",
    mitigation:
      "Approvals Readiness and Boundary Resolution keep external evidence requirements, owners, workarounds, and prohibited claims visible.",
    proofRoutes: ["/approvals-readiness", "/clinical-authority-readiness", "/boundary-resolution", "/qa-claim-guard"],
    retainedBoundary:
      "Qualified counsel, security assessors, regulatory experts, customer approvers, and applicable certification bodies retain authority.",
    nextAction: "Route claims and buyer-specific evidence through external review before expanding public language."
  },
  {
    name: "Manual AAL2 protected proof",
    owner: "Approved tenant-admin or pilot-lead operator",
    productSurface: "Protected Pilot Workspace, QA Evidence, Buyer Release Control",
    status: "operator-required",
    barrier:
      "Public checks prove fail-closed behavior, but authenticated protected mutations require a fresh human AAL2 session.",
    mitigation:
      "Manual QA Execution Console, QA Run Control, Human Run Packet, and protected workspace panels preserve no-secret human-run proof.",
    proofRoutes: [
      "/pilot-workspace/access",
      "/qa-manual-execution-console",
      "/qa-run-control",
      "/qa-human-run-packet",
      "/buyer-release-control-run"
    ],
    retainedBoundary:
      "No code path may retain, print, store, or reuse bearer tokens; protected happy path proof stays human-operated.",
    nextAction: "Use the browser AAL2 workspace for protected proof or a deliberate one-time token run with no retention."
  },
  {
    name: "Buyer release and external sharing",
    owner: "Buyer Diligence + Release Steward + qualified reviewers",
    productSurface: "Buyer Release Control, protected release verifier, distribution lockbox",
    status: "protected-gated",
    barrier:
      "Buyer-specific external sharing requires retained release decisions, named reviewer signoffs, recipient controls, authority attestations, and access-log reconciliation.",
    mitigation:
      "Buyer Release Control Runbook sequences protected verifier records, packets, timeline, reconciliation, remediation, and disabled lockbox controls.",
    proofRoutes: [
      "/buyer-release-control-run",
      "/pilot-workspace/access#buyer-release-control-verifier",
      "/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run"
    ],
    retainedBoundary:
      "Internal protected diligence can prepare evidence; external buyer sharing remains blocked until qualified release authority is retained.",
    nextAction: "Complete the release-control chain before any buyer-specific external distribution."
  },
  {
    name: "Commercial buyer path",
    owner: "Sales operations + Buyer Diligence",
    productSurface: "Pilot Deal Room, Pricing, Demos, Pilots, Sales Operations",
    status: "active",
    barrier:
      "Buyer value, proof routes, pricing, demos, protected evidence, and pilot intake can fragment across separate surfaces.",
    mitigation:
      "Pilot Deal Room, Product Console, pricing, demos, pilot programs, and sales operations now present a continuous buyer path.",
    proofRoutes: ["/pilot-deal-room", "/pricing", "/demos", "/pilots", "/sales-operations"],
    retainedBoundary:
      "Commercial readiness does not authorize customer production activation, PHI, live clinical execution, or public customer claims.",
    nextAction: "Keep offers focused on governed synthetic pilots until customer-specific production controls are approved."
  },
  {
    name: "Agent and workflow operating system",
    owner: "AgentOS + Workflow Runtime",
    productSurface: "Agents, Workflows, Evaluation, Runtime Safety, Audit",
    status: "contained",
    barrier:
      "Agent execution can become unsafe if runtime, identity, audit, connector, and human-review gates are not explicit.",
    mitigation:
      "Workflow contracts, deny-by-default implementation readiness, runtime safety, execution audit, and AgentOS evaluation keep execution synthetic and review-gated.",
    proofRoutes: [
      "/agents",
      "/workflows",
      "/workflows/contracts",
      "/workflows/runtime-safety",
      "/workflows/execution-audit",
      "/evaluation"
    ],
    retainedBoundary:
      "Agents cannot mutate medical records, contact patients, submit payer actions, or execute production connectors without approved gates.",
    nextAction: "Add blocked actions, human checkpoints, audit events, and packet evidence before new agent capabilities move forward."
  },
  {
    name: "Interoperability and synthetic validation",
    owner: "Interoperability Control Plane + Validation Trust Lab",
    productSurface: "Interoperability, Integrations, Synthetic Validation",
    status: "contained",
    barrier:
      "Connector confidence can be overstated if synthetic conformance and live production authorization are not separated.",
    mitigation:
      "Standards registry, fixture validation, conformance evaluations, and synthetic validation keep connector readiness inspectable before live use.",
    proofRoutes: ["/interoperability", "/interoperability/evaluations", "/integrations", "/synthetic/validation"],
    retainedBoundary:
      "Synthetic conformance does not approve live connectors, PHI ingestion, payer submission, EHR writeback, or partner acceptance.",
    nextAction: "Keep live connector claims blocked until buyer, legal, security, privacy, and interoperability approvals exist."
  },
  {
    name: "Trust, claims, and incident operations",
    owner: "Trust Safety Ops + Legal + Security + Claims Governance",
    productSurface: "Trust Safety Operations, Trust Center, Claims",
    status: "active",
    barrier:
      "Public language, trust operations, incident posture, and enterprise diligence can diverge from retained evidence.",
    mitigation:
      "Trust Safety Operations, Claims Register, Enterprise Readiness, and QA Claim Guard keep evidence and claim posture aligned.",
    proofRoutes: ["/trust-safety-operations", "/trust-center", "/claims", "/qa-claim-guard"],
    retainedBoundary:
      "Trust operations define controls and escalation posture; managed 24/7 production coverage and certifications require approved staffing and review.",
    nextAction: "Review buyer, investor, PR, advertising, and operator language before publication."
  },
  {
    name: "Public market and global expansion",
    owner: "Founder + Finance + Global Partnerships + qualified regional reviewers",
    productSurface: "Public Market Readiness, Global Reach, Deployment Profiles",
    status: "external-review-required",
    barrier:
      "Financial, regional, procurement, reimbursement, and legal claims can outpace current evidence without external review.",
    mitigation:
      "Public Market Readiness, Global Reach, and Deployment Profiles separate operating discipline from audited financial or regional approval claims.",
    proofRoutes: ["/public-market-readiness", "/global-reach", "/deployment-profiles", "/market-activation"],
    retainedBoundary:
      "These routes are readiness and operating discipline, not audited financial statements, securities material, legal advice, or regional approval.",
    nextAction: "Keep public-market, procurement, and regional expansion claims qualified until external evidence is retained."
  }
];

export const reliabilityFaultClasses: ReliabilityFaultClass[] = [
  {
    name: "Route inventory drift",
    severity: "watch",
    likelySource: "New App Router pages or APIs added without Navigation Audit and smoke updates.",
    control: "Navigation Audit source totals, hub route inventory, and public smoke source-count checks.",
    detectionRoutes: ["/navigation", "/api/navigation-audit"],
    failClosedBehavior: "Release steward updates inventory or keeps the route out of buyer-critical claims."
  },
  {
    name: "Protected token handling",
    severity: "high",
    likelySource: "Attempting to automate AAL2 protected proof with retained bearer tokens.",
    control: "Manual QA runbooks, no-secret smoke, protected fail-closed APIs, and browser-session verification.",
    detectionRoutes: ["/qa-run-control", "/qa-launch-kit", "/qa-manual-execution-console"],
    failClosedBehavior: "Reject token storage and require a fresh human AAL2 session or one-time external token disposal."
  },
  {
    name: "External approval overclaim",
    severity: "high",
    likelySource: "Copy, buyer materials, or operator notes implying certification, legal approval, PHI authority, or live-care authority.",
    control: "Approvals Readiness, Boundary Resolution, Claim Guard, no-authority headers, and prohibited-claim lists.",
    detectionRoutes: ["/approvals-readiness", "/boundary-resolution", "/qa-claim-guard"],
    failClosedBehavior: "Downgrade to readiness language and route to qualified external review."
  },
  {
    name: "Dynamic route smoke gap",
    severity: "watch",
    likelySource: "Dynamic pages compile but are not all crawled by public smoke.",
    control: "TypeScript, build, dynamic page inventory, and targeted smoke for buyer-critical slug routes.",
    detectionRoutes: ["/navigation", "/demos", "/pilots", "/workflows"],
    failClosedBehavior: "Keep canonical entry points smoked and add slug-specific smoke when needed."
  },
  {
    name: "Generated cache conflict",
    severity: "watch",
    likelySource: "Local `.next` or quarantine output interfering with checks.",
    control: "Generated cache cleanup before build/typecheck and generated-integrity check.",
    detectionRoutes: ["/release-continuity", "/operations"],
    failClosedBehavior: "Clean generated output and rebuild from source."
  },
  {
    name: "Protected environment missing locally",
    severity: "watch",
    likelySource: "Local shells without Supabase/Vercel protected environment or active AAL2 session.",
    control: "Fail-closed protected smoke, route-level no-authority headers, and operator workaround instructions.",
    detectionRoutes: ["/pilot-workspace/access", "/release-continuity"],
    failClosedBehavior: "Treat public checks as fail-closed proof and require an approved operator for protected proof."
  },
  {
    name: "PHI or live-care boundary breach",
    severity: "high",
    likelySource: "Inputs, artifacts, or routes attempting to store patient identifiers, clinical records, diagnosis details, or live-care actions.",
    control: "Synthetic-only boundaries, prohibited data lists, no-PHI protected panels, intake rejection, and live-care authority headers.",
    detectionRoutes: ["/clinical-authority-readiness", "/clinical-care-activation", "/pilot"],
    failClosedBehavior: "Reject or strip prohibited data and keep live-care actions blocked."
  },
  {
    name: "Public distribution lockbox gap",
    severity: "high",
    likelySource: "Buyer proof referenced outside protected diligence before release-control chain completion.",
    control: "Buyer Release Control Runbook, protected verifier, disabled distribution lockbox, recipient attestations, and access-log reconciliation.",
    detectionRoutes: ["/buyer-release-control-run", "/pilot-workspace/access#buyer-release-control-verifier"],
    failClosedBehavior: "Keep distribution internal-only until retained release decisions and recipient controls exist."
  }
];

export const efficiencyImprovements: EfficiencyImprovement[] = [
  {
    name: "One route map for every operating surface",
    impact: "Reduces release uncertainty and navigation search time for operators and buyers.",
    proof: "/navigation reports page routes, API patterns, smoke pages, groups, and bottlenecks.",
    owner: "Product Console + Release Steward"
  },
  {
    name: "Reliability counters inside Product Console",
    impact: "Lets executives see controls, fault classes, open gates, and efficiency work without reading every page.",
    proof: "/product and /api/product/console include Service Reliability posture.",
    owner: "Founder + Product Console"
  },
  {
    name: "No-authority headers on reliability APIs",
    impact: "Prevents a reliability route from being mistaken for approval, certification, PHI, release, or live-care authority.",
    proof: "/api/service-reliability and /api/service-reliability/brief expose explicit no-authority headers.",
    owner: "TrustOS + Release Steward"
  },
  {
    name: "Source-count smoke checks",
    impact: "Catches route-count drift when pages or API handlers are added.",
    proof: "Public production smoke checks navigation counts and service reliability route/API/brief.",
    owner: "Release Steward"
  },
  {
    name: "Fail-closed protected posture",
    impact: "Keeps protected proof blocked publicly while still allowing browser-session operator verification.",
    proof: "Protected routes fail closed in public smoke and remain AAL2 gated.",
    owner: "Security + Operator"
  },
  {
    name: "Downloadable executive brief",
    impact: "Turns the reliability map into a reviewable artifact for founders, operators, reviewers, and buyers.",
    proof: "/api/service-reliability/brief",
    owner: "Founder + Release Steward"
  }
];

function countControls(status: ServiceReliabilityControlStatus) {
  return productServiceControls.filter((control) => control.status === status).length;
}

export function getServiceReliabilitySummary() {
  const navigationAudit = getNavigationAuditSummary();
  const releaseContinuity = getReleaseContinuitySummary();
  const boundaryResolution = getBoundaryResolutionSummary();
  const manualQaExecution = getQaManualExecutionConsoleSummary();
  const trustSafetyOperations = getTrustSafetyOperationsSummary();
  const operatorRequiredControlCount = countControls("operator-required");
  const externalReviewControlCount = countControls("external-review-required");
  const protectedGateControlCount = countControls("protected-gated");
  const highSeverityFaultClassCount = reliabilityFaultClasses.filter(
    (faultClass) => faultClass.severity === "high"
  ).length;

  return {
    service: "scrimed-service-reliability",
    route: serviceReliabilityRoute,
    apiRoute: serviceReliabilityApiRoute,
    briefRoute: serviceReliabilityBriefRoute,
    status: serviceReliabilityProofStackStatus,
    briefStatus: serviceReliabilityBriefProofStackStatus,
    boundary: serviceReliabilityBoundary,
    authority: {
      dataBoundary: "synthetic-only",
      clinicalCareAuthority: "not-authorized-live-care",
      phiAuthority: "not-authorized-production-phi",
      releaseAuthority: "not-release-approval",
      approvalAuthority: "external-review-required",
      securityCertification: "not-security-certified",
      financialAuthority: "not-audited-financial-report"
    },
    sourceAlignment: {
      pageRouteCount: navigationAudit.sourceTotals.pageRouteCount,
      apiRoutePatternCount: navigationAudit.sourceTotals.apiRoutePatternCount,
      smokeCoveredHtmlRouteCount: navigationAudit.coverage.smokeCoveredHtmlRouteCount,
      navigationGroupCount: navigationAudit.coverage.navigationGroupCount,
      missingInventoryLinkCount: navigationAudit.coverage.missingInventoryLinkCount,
      releaseContinuityGateCount: releaseContinuity.gateCount,
      releaseContinuityPassedCheckCount: releaseContinuity.passedCheckCount,
      boundaryResolutionRecordCount: boundaryResolution.recordCount,
      boundaryResolutionSafeWorkaroundCount: boundaryResolution.safeWorkaroundCount,
      manualQaExecutionStageCount: manualQaExecution.stageCount,
      trustSafetyControlCount: trustSafetyOperations.controlCount
    },
    controlCount: productServiceControls.length,
    activeControlCount: countControls("active"),
    resolvedControlCount: countControls("resolved"),
    containedControlCount: countControls("contained"),
    operatorRequiredControlCount,
    externalReviewControlCount,
    protectedGateControlCount,
    openGateCount:
      operatorRequiredControlCount + externalReviewControlCount + protectedGateControlCount,
    faultClassCount: reliabilityFaultClasses.length,
    highSeverityFaultClassCount,
    efficiencyImprovementCount: efficiencyImprovements.length,
    productServiceControls,
    faultClasses: reliabilityFaultClasses,
    efficiencyImprovements,
    nextOperatorActions: [
      "Use /service-reliability before each release to confirm every product/service barrier has an owner, proof route, and retained boundary.",
      "Keep Navigation Audit and public smoke source-count checks updated whenever routes or API handlers are added.",
      "Keep protected happy-path proof human-operated through AAL2 and never retain token values.",
      "Route approval, PHI, live-care, customer-proof, public-market, reimbursement, legal, and security-certification claims through qualified external review.",
      "Add any newly discovered fault class to this lane before expanding product claims or buyer materials."
    ],
    updated: serviceReliabilityUpdatedAt
  };
}

export function buildServiceReliabilityBrief() {
  const summary = getServiceReliabilitySummary();

  return [
    "# SCRIMED Service Reliability Brief",
    "",
    `Status: ${summary.status}`,
    `Controls: ${summary.controlCount}`,
    `Open gates: ${summary.openGateCount}`,
    `Fault classes: ${summary.faultClassCount}`,
    `High-severity fault classes: ${summary.highSeverityFaultClassCount}`,
    `Efficiency improvements: ${summary.efficiencyImprovementCount}`,
    `Page routes: ${summary.sourceAlignment.pageRouteCount}`,
    `API route patterns: ${summary.sourceAlignment.apiRoutePatternCount}`,
    `Smoke-covered HTML routes: ${summary.sourceAlignment.smokeCoveredHtmlRouteCount}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is not release approval, legal approval, security certification, HIPAA certification, FDA clearance, ONC certification, PHI processing approval, production connector approval, token authorization, public customer approval, reimbursement assurance, or live clinical authorization.",
    "",
    "## Product And Service Controls",
    ...summary.productServiceControls.map(
      (control) =>
        `- ${control.name} (${control.status}): ${control.barrier} Mitigation: ${control.mitigation} Owner: ${control.owner} Proof: ${control.proofRoutes.join(", ")} Boundary: ${control.retainedBoundary}`
    ),
    "",
    "## Fault Classes",
    ...summary.faultClasses.map(
      (faultClass) =>
        `- ${faultClass.name} (${faultClass.severity}): ${faultClass.likelySource} Control: ${faultClass.control} Fail closed: ${faultClass.failClosedBehavior}`
    ),
    "",
    "## Efficiency Improvements",
    ...summary.efficiencyImprovements.map(
      (improvement) =>
        `- ${improvement.name}: ${improvement.impact} Proof: ${improvement.proof} Owner: ${improvement.owner}`
    ),
    "",
    "## Next Operator Actions",
    ...summary.nextOperatorActions.map((action) => `- ${action}`),
    "",
    `Updated: ${summary.updated}`
  ].join("\n");
}
