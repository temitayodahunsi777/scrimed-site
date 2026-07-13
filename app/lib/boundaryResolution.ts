import { getClinicalAuthorityReadinessSummary } from "./clinicalAuthorityReadiness";
import { getClinicalCareActivationSummary } from "./clinicalCareActivation";
import { getContinuousReviewAuditSummary } from "./continuousReviewAudit";
import { getGlobalCertificationReadinessSummary } from "./globalCertificationReadiness";
import { getHealthRecordsSafetyExchangeSummary } from "./healthRecordsSafetyExchange";
import { getPersistentAgentWorkspaceSummary } from "./persistentAgentWorkspace";
import { getProductServicePortfolioSummary } from "./productServicePortfolio";
import { getClientOnboardingCommunicationsSummary } from "./clientOnboardingCommunications";
import { getEnterpriseScalabilityOperationsSummary } from "./enterpriseScalabilityOperations";
import { getLimitationsWorkaroundSummary } from "./limitationsWorkaroundOperations";
import { getPlatformPowerSummary } from "./platformPowerOperations";
import { getPublicMarketReadinessSummary } from "./publicMarketReadiness";
import { getQaEvidenceActivationPlan, getQaEvidenceLedger } from "./qaEvidenceLedger";

export type BoundaryResolutionCategory =
  | "clinical-authority"
  | "clinical-care-activation"
  | "agent-workspace"
  | "qa-evidence"
  | "public-market-readiness"
  | "global-certification-readiness"
  | "continuous-review-audit"
  | "health-records-safety-exchange"
  | "product-service-offerings"
  | "client-onboarding-communications"
  | "enterprise-scalability-operations"
  | "limitations-workaround-operations"
  | "platform-power-operations"
  | "enterprise-growth-operations";

export type BoundaryResolutionState =
  | "active-control"
  | "safe-workaround-active"
  | "human-aal2-required"
  | "customer-specific-required"
  | "external-approval-required"
  | "blocked-before-approval";

export type BoundaryResolutionRecord = {
  id: string;
  category: BoundaryResolutionCategory;
  name: string;
  state: BoundaryResolutionState;
  buyerImpact: string;
  currentBoundary: string;
  currentControl: string;
  safeWorkaround: string;
  remainingGate: string;
  owner: string;
  proofRoutes: string[];
  nextAction: string;
  prohibitedClaims: string[];
};

export const boundaryResolutionStatus = "boundary-resolution-register-active";
export const boundaryResolutionProofStackStatus =
  "cross-system-boundary-resolution-register-no-authority-claim";
export const boundaryResolutionBriefProofStackStatus =
  "boundary-resolution-brief-no-approval-claim";

export const boundaryResolutionRoute = "/boundary-resolution";
export const boundaryResolutionApiRoute = "/api/boundary-resolution";
export const boundaryResolutionBriefRoute = "/api/boundary-resolution/brief";

export const boundaryResolutionBoundary =
  "SCRIMED Boundary Resolution Register organizes known product, service-packaging, client-onboarding, communications, calendar, demo, presentation, scalability, SLO/SLA, managed-service, support, incident, regional hosting, API, UI, AI model-routing, agent execution, evidence retrieval, accessibility, limitation-workaround, clinical, PHI, health-records, legal, regional, reimbursement, security, QA, public-market, global certification, continuous review, innovation, enterprise legal/finance, revenue, and production-readiness boundaries into owned controls, safe workarounds, proof routes, and remaining gates. It does not authorize live clinical care, PHI processing, legal approval, regional regulatory approval, reimbursement certainty, security certification, accessibility certification, production clinical authorization, autonomous clinical decisions, live autonomous AI, production model routing, public API SLAs, patient outreach, autonomous email send, autonomous calendar invite creation, contract approval, procurement approval, contractual SLAs, uptime guarantees, managed service commitments, production support guarantees, data-residency approval, payer submission, EHR writeback, public customer claims, audited financial reporting, revenue or profit guarantees, managed 24/7 SOC/MDR coverage, public quantum capability claims, trillion-dollar-scale equivalence claims, or securities offering material.";

const universalProhibitedClaims = [
  "live clinical care authorized",
  "PHI processing authorized",
  "HIPAA certified",
  "SOC 2 certified",
  "FDA cleared",
  "regional regulatory approval granted",
  "reimbursement guaranteed",
  "production clinical authorization granted",
  "autonomous diagnosis or treatment permitted",
  "managed 24/7 SOC or MDR coverage active",
  "quantum-safe certified",
  "audited financial reporting completed",
  "revenue or profit margin guaranteed",
  "legal accounting or tax advice provided",
  "contractual SLA approved",
  "managed service commitment active",
  "production support guaranteed",
  "public API SLA approved",
  "live autonomous AI approved",
  "production model routing approved",
  "accessibility certified",
  "trillion-dollar company parity guaranteed"
];

const enterpriseGrowthBoundaryRecords: BoundaryResolutionRecord[] = [
  {
    id: "enterprise-growth-legal-finance-authority",
    category: "enterprise-growth-operations",
    name: "Enterprise legal, finance, accounting, and tax authority",
    state: "external-approval-required",
    buyerImpact:
      "Enterprise deals can be prepared, priced, scoped, and routed, but SCRIMED cannot self-approve legal, accounting, tax, or contract conclusions.",
    currentBoundary:
      "Enterprise Business Operations is operating-readiness material only; qualified counsel, accounting, tax, finance, and executive approvers retain authority.",
    currentControl:
      "Deal desk, quote-to-contract packet, price-floor review, scope control, counsel review, accounting/revenue-recognition triage, tax awareness, and billing readiness.",
    safeWorkaround:
      "Use business-contact and metadata-only deal packets with explicit approval slots instead of presenting signed authority or professional advice.",
    remainingGate:
      "Qualified counsel/accountant/tax review, executive contract approval, customer sign-off, and retained billing evidence.",
    owner: "Founder, deal desk, legal, finance, accounting, tax, and executive approver",
    proofRoutes: ["/enterprise-business-ops", "/api/enterprise-business-ops", "/growth-engine", "/capital-vitality"],
    nextAction:
      "Route every enterprise proposal through deal desk with price, scope, data-boundary, payment-term, and review evidence before external release.",
    prohibitedClaims: [
      ...universalProhibitedClaims,
      "legal advice provided",
      "accounting advice provided",
      "tax advice provided",
      "contract approved"
    ]
  },
  {
    id: "enterprise-growth-revenue-margin-claims",
    category: "enterprise-growth-operations",
    name: "Revenue, ROI, and profit-margin claims",
    state: "external-approval-required",
    buyerImpact:
      "SCRIMED can package sellable assessments, synthetic pilots, diligence rooms, and operating licenses without guaranteeing buyer revenue, savings, reimbursement, ROI, or margin.",
    currentBoundary:
      "Growth, Capital Vitality, Public Market Readiness, and Enterprise Business Ops are readiness lanes; they are not audited financial reports or revenue guarantees.",
    currentControl:
      "Price floors, paid diligence packaging, buyer-approved baselines, finance methodology gates, claim guard, and counsel-reviewed external-use language.",
    safeWorkaround:
      "Sell fixed-scope no-PHI assessments and synthetic pilots with buyer-approved measurement plans while keeping ROI and reimbursement language qualified.",
    remainingGate:
      "Buyer-approved baseline, finance methodology, qualified legal/finance review, customer permission, and retained measurement evidence.",
    owner: "Founder, enterprise sales, finance, legal, customer sponsor, and revenue operations",
    proofRoutes: ["/growth-engine", "/capital-vitality", "/public-market-readiness", "/enterprise-business-ops"],
    nextAction:
      "Attach each commercial conversation to one proof route, one value metric, one measurement boundary, and one retained approval gate.",
    prohibitedClaims: [
      ...universalProhibitedClaims,
      "revenue guaranteed",
      "ROI guaranteed",
      "profit margin guaranteed",
      "reimbursement guaranteed"
    ]
  },
  {
    id: "enterprise-growth-investor-securities-boundary",
    category: "enterprise-growth-operations",
    name: "Investor, securities, valuation, and fundraising language",
    state: "external-approval-required",
    buyerImpact:
      "Capital and board materials can organize diligence readiness, but they cannot become securities offering material, investment advice, or valuation assurance.",
    currentBoundary:
      "Capital Vitality and Public Market Readiness are operating-discipline surfaces, not audited financial statements or fundraising documents.",
    currentControl:
      "Investor milestone register, public-market claim controls, board cadence, protected release decisions, and external-review gates.",
    safeWorkaround:
      "Use internal readiness summaries and route investment, valuation, securities, tax, or fundraising language to qualified advisors before sharing externally.",
    remainingGate:
      "Qualified securities counsel, finance/accounting review, advisor review, recipient context, and approved release decision.",
    owner: "Founder, finance, counsel, investor relations, and board/advisor reviewers",
    proofRoutes: ["/capital-vitality", "/public-market-readiness", "/boundary-resolution", "/qa-claim-guard"],
    nextAction:
      "Keep investor-facing material in readiness mode until qualified counsel and finance/accounting reviewers approve exact language and recipients.",
    prohibitedClaims: [
      ...universalProhibitedClaims,
      "securities offering material approved",
      "investment advice provided",
      "valuation assured",
      "audited financial statements complete"
    ]
  },
  {
    id: "enterprise-growth-global-partner-claims",
    category: "enterprise-growth-operations",
    name: "Global partner, public-sector, and regional procurement claims",
    state: "external-approval-required",
    buyerImpact:
      "SCRIMED can pursue global partner discovery and localization packs without claiming country launch, public-sector approval, data-residency approval, or government endorsement.",
    currentBoundary:
      "Global Reach and Growth Engine prepare regional conversations only; local legal, privacy, security, procurement, hosting, and partner authority remain external gates.",
    currentControl:
      "Regional packs, deployment profiles, public-sector questions, data-residency review, partner authority register, and claim guard.",
    safeWorkaround:
      "Frame global work as synthetic/no-personal-data discovery and buyer localization until regional approval evidence exists.",
    remainingGate:
      "Regional counsel, privacy/security review, hosting decision, procurement authority, partner signoff, and customer-specific approval.",
    owner: "Founder, global partnerships, regional counsel, privacy, security, procurement, and partner operations",
    proofRoutes: ["/global-reach", "/global-certification-readiness", "/deployment-profiles", "/growth-engine"],
    nextAction:
      "Pair every regional or public-sector conversation with a deployment-profile gate and qualified regional review owner.",
    prohibitedClaims: [
      ...universalProhibitedClaims,
      "country launch approved",
      "public-sector procurement approved",
      "government endorsed",
      "data residency approved"
    ]
  }
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function clinicalAuthorityState(status: string): BoundaryResolutionState {
  if (status === "contained-with-workaround") {
    return "safe-workaround-active";
  }

  if (status === "customer-specific-required") {
    return "customer-specific-required";
  }

  if (status === "external-approval-required") {
    return "external-approval-required";
  }

  return "blocked-before-approval";
}

function clinicalCareGateState(status: string): BoundaryResolutionState {
  if (status === "foundation-ready") {
    return "active-control";
  }

  if (status === "customer-specific") {
    return "customer-specific-required";
  }

  if (status === "external-review-required") {
    return "external-approval-required";
  }

  return "blocked-before-approval";
}

function agentLimitationState(status: string): BoundaryResolutionState {
  if (status === "active-control") {
    return "active-control";
  }

  if (status === "quality-process-replacement") {
    return "safe-workaround-active";
  }

  return "external-approval-required";
}

function qaLimitationState(status: string): BoundaryResolutionState {
  if (status === "contained") {
    return "safe-workaround-active";
  }

  if (status === "manual-action-required") {
    return "human-aal2-required";
  }

  return "external-approval-required";
}

function certificationTrackState(status: string): BoundaryResolutionState {
  if (status === "foundation-active") {
    return "active-control";
  }

  if (status === "evidence-build-required") {
    return "safe-workaround-active";
  }

  if (status === "external-review-required") {
    return "external-approval-required";
  }

  return "blocked-before-approval";
}

function continuousReviewState(status: string): BoundaryResolutionState {
  if (status === "active-control-plane") {
    return "active-control";
  }

  if (status === "internal-research-only") {
    return "blocked-before-approval";
  }

  return "external-approval-required";
}

function productServiceState(status: string): BoundaryResolutionState {
  if (status === "active-control") {
    return "active-control";
  }

  if (status === "human-review-required") {
    return "customer-specific-required";
  }

  if (status === "blocked-before-approval") {
    return "blocked-before-approval";
  }

  return "external-approval-required";
}

function clientOnboardingState(status: string): BoundaryResolutionState {
  if (status === "ready") {
    return "active-control";
  }

  if (status === "human-review-required" || status === "buyer-input-required") {
    return "customer-specific-required";
  }

  if (status === "blocked-before-approval") {
    return "blocked-before-approval";
  }

  return "external-approval-required";
}

function enterpriseScalabilityState(status: string): BoundaryResolutionState {
  if (status === "active-control-plane") {
    return "active-control";
  }

  if (status === "human-review-required") {
    return "customer-specific-required";
  }

  if (status === "blocked-before-approval") {
    return "blocked-before-approval";
  }

  return "external-approval-required";
}

function platformPowerState(status: string): BoundaryResolutionState {
  if (status === "active-control-plane") {
    return "active-control";
  }

  if (status === "human-review-required") {
    return "human-aal2-required";
  }

  if (status === "blocked-before-approval") {
    return "blocked-before-approval";
  }

  return "external-approval-required";
}

function limitationsWorkaroundState(status: string): BoundaryResolutionState {
  if (status === "resolved-with-control") {
    return "active-control";
  }

  if (status === "workaround-active") {
    return "safe-workaround-active";
  }

  if (status === "human-review-required") {
    return "human-aal2-required";
  }

  if (status === "blocked-until-approved") {
    return "blocked-before-approval";
  }

  return "external-approval-required";
}

function stateCounts(records: BoundaryResolutionRecord[]) {
  return records.reduce(
    (counts, record) => ({
      ...counts,
      [record.state]: counts[record.state] + 1
    }),
    {
      "active-control": 0,
      "safe-workaround-active": 0,
      "human-aal2-required": 0,
      "customer-specific-required": 0,
      "external-approval-required": 0,
      "blocked-before-approval": 0
    } satisfies Record<BoundaryResolutionState, number>
  );
}

function categoryCounts(records: BoundaryResolutionRecord[]) {
  return records.reduce(
    (counts, record) => ({
      ...counts,
      [record.category]: counts[record.category] + 1
    }),
    {
      "clinical-authority": 0,
      "clinical-care-activation": 0,
      "agent-workspace": 0,
      "qa-evidence": 0,
      "public-market-readiness": 0,
      "global-certification-readiness": 0,
      "continuous-review-audit": 0,
      "health-records-safety-exchange": 0,
      "product-service-offerings": 0,
      "client-onboarding-communications": 0,
      "enterprise-scalability-operations": 0,
      "limitations-workaround-operations": 0,
      "platform-power-operations": 0,
      "enterprise-growth-operations": 0
    } satisfies Record<BoundaryResolutionCategory, number>
  );
}

function boundaryRecordLines(records: BoundaryResolutionRecord[]) {
  return records
    .map(
      (record) =>
        `- ${record.name} (${record.category}, ${record.state}): ${record.currentBoundary} Control: ${record.currentControl} Workaround: ${record.safeWorkaround} Remaining gate: ${record.remainingGate}`
    )
    .join("\n");
}

function markdownItems(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export function getBoundaryResolutionSummary() {
  const clinicalAuthority = getClinicalAuthorityReadinessSummary();
  const clinicalCare = getClinicalCareActivationSummary();
  const agentWorkspace = getPersistentAgentWorkspaceSummary();
  const qaLedger = getQaEvidenceLedger();
  const qaActivationPlan = getQaEvidenceActivationPlan();
  const publicMarket = getPublicMarketReadinessSummary();
  const globalCertification = getGlobalCertificationReadinessSummary();
  const continuousReviewAudit = getContinuousReviewAuditSummary();
  const healthRecords = getHealthRecordsSafetyExchangeSummary();
  const productServicePortfolio = getProductServicePortfolioSummary();
  const clientOnboarding = getClientOnboardingCommunicationsSummary();
  const enterpriseScalability = getEnterpriseScalabilityOperationsSummary();
  const limitationsWorkarounds = getLimitationsWorkaroundSummary();
  const platformPower = getPlatformPowerSummary();

  const authorityRecords: BoundaryResolutionRecord[] = clinicalAuthority.domains.map((domain) => ({
    id: `authority-${domain.key}`,
    category: "clinical-authority",
    name: domain.name,
    state: clinicalAuthorityState(domain.status),
    buyerImpact: domain.currentBoundary,
    currentBoundary: domain.currentBoundary,
    currentControl: domain.preparationNow,
    safeWorkaround: domain.safeWorkaround,
    remainingGate: domain.retainedGate,
    owner: domain.accountableOwners.join(", "),
    proofRoutes: domain.proofRoutes,
    nextAction: domain.requiredEvidence[0] ?? domain.retainedGate,
    prohibitedClaims: universalProhibitedClaims
  }));

  const clinicalCareRecords: BoundaryResolutionRecord[] = clinicalCare.gates.map((gate) => ({
    id: `care-${gate.id}`,
    category: "clinical-care-activation",
    name: gate.name,
    state: clinicalCareGateState(gate.status),
    buyerImpact: gate.requiredBefore,
    currentBoundary: `${gate.name} is ${gate.status}; blocked capabilities: ${gate.blockedCapabilities.join(", ")}.`,
    currentControl: gate.evidence,
    safeWorkaround: gate.safeWorkaround,
    remainingGate: gate.requiredBefore,
    owner: gate.owner,
    proofRoutes: [clinicalCare.route, clinicalCare.apiRoute],
    nextAction: gate.evidence,
    prohibitedClaims: universalProhibitedClaims
  }));

  const agentWorkspaceRecords: BoundaryResolutionRecord[] =
    agentWorkspace.limitationResolutionRegister.map((limitation) => ({
      id: `agent-${slugify(limitation.limitation)}`,
      category: "agent-workspace",
      name: limitation.limitation,
      state: agentLimitationState(limitation.resolutionStatus),
      buyerImpact: limitation.impact,
      currentBoundary: limitation.impact,
      currentControl: limitation.replacementProcess,
      safeWorkaround: limitation.replacementProcess,
      remainingGate: limitation.remainingGate,
      owner: "AgentOS, TrustOS, platform, security, clinical governance, and customer operator owners",
      proofRoutes: [limitation.proofRoute],
      nextAction: limitation.remainingGate,
      prohibitedClaims: universalProhibitedClaims
    }));

  const qaWorkflowRecords: BoundaryResolutionRecord[] = qaActivationPlan.workflows.map((workflow) => ({
    id: `qa-workflow-${workflow.workflowKind}`,
    category: "qa-evidence",
    name: workflow.name,
    state: "human-aal2-required",
    buyerImpact: workflow.buyerDiligenceImpact,
    currentBoundary: workflow.currentBoundary,
    currentControl: workflow.workaround,
    safeWorkaround: workflow.workaround,
    remainingGate: "Fresh human AAL2 run, temporary secret disposal, protected persistence, packet hash, and Buyer Diligence export.",
    owner: "SCRIMED operator, release engineering, and tenant governance owner",
    proofRoutes: [
      "/qa-execution-readiness",
      "/qa-run-control",
      "/qa-launch-kit",
      qaLedger.qaAal2RunEvidence.route,
      qaLedger.qaAal2RunEvidence.apiRoute,
      "/qa-manual-execution-console",
      "/qa-completion-bridge",
      "/qa-claim-guard",
      "/qa-activation-seal",
      "/qa-proof-promotion",
      "/qa-buyer-proof-release",
      qaActivationPlan.route,
      qaActivationPlan.briefRoute,
      workflow.workflowPath,
      workflow.persistenceTarget
    ],
    nextAction: workflow.nextAction,
    prohibitedClaims: [
      ...universalProhibitedClaims,
      "authenticated QA completed without a human AAL2 run",
      "bearer token retained as evidence"
    ]
  }));

  const qaKnownLimitationRecords: BoundaryResolutionRecord[] = qaLedger.knownLimitations.map((limitation) => ({
    id: `qa-limitation-${slugify(limitation.title)}`,
    category: "qa-evidence",
    name: limitation.title,
    state: qaLimitationState(limitation.status),
    buyerImpact: limitation.impact,
    currentBoundary: limitation.impact,
    currentControl: limitation.currentControl,
    safeWorkaround: limitation.currentControl,
    remainingGate: limitation.resolutionPath,
    owner: "QA, TrustOS, release engineering, and operator governance",
    proofRoutes: [
      qaLedger.route,
      qaLedger.apiRoute,
      qaLedger.briefRoute,
      qaLedger.qaAal2RunEvidence.route,
      qaLedger.qaAal2RunEvidence.apiRoute,
      qaLedger.qaAal2RunEvidence.protectedRoute,
      "/qa-launch-kit",
      "/qa-manual-execution-console",
      "/qa-completion-bridge",
      "/qa-claim-guard",
      "/qa-activation-seal",
      "/qa-proof-promotion",
      "/qa-buyer-proof-release"
    ],
    nextAction: limitation.resolutionPath,
    prohibitedClaims: universalProhibitedClaims
  }));

  const publicMarketRecords: BoundaryResolutionRecord[] = publicMarket.limitations.map((limitation) => ({
    id: `public-market-${slugify(limitation.limitation)}`,
    category: "public-market-readiness",
    name: limitation.limitation,
    state: "external-approval-required",
    buyerImpact: limitation.impact,
    currentBoundary: limitation.impact,
    currentControl: limitation.workaround,
    safeWorkaround: limitation.workaround,
    remainingGate: limitation.graduationGate,
    owner: "Founder, finance, legal, investor relations, security, privacy, and customer sponsor as applicable",
    proofRoutes: [publicMarket.route, publicMarket.apiRoute, publicMarket.briefRoute],
    nextAction: limitation.graduationGate,
    prohibitedClaims: [
      ...universalProhibitedClaims,
      "audited financial reporting completed",
      "securities offering material approved",
      "valuation guaranteed"
    ]
  }));

  const globalCertificationRecords: BoundaryResolutionRecord[] = globalCertification.tracks.map((track) => ({
    id: `global-certification-${track.slug}`,
    category: "global-certification-readiness",
    name: track.title,
    state: certificationTrackState(track.status),
    buyerImpact: track.operatingGoal,
    currentBoundary: `${track.title} remains ${track.status}; blocked claims: ${track.blockedClaims.join(", ")}.`,
    currentControl: track.implementationWork[0] ?? track.operatingGoal,
    safeWorkaround: track.operatingGoal,
    remainingGate: track.externalAuthority,
    owner: track.accountableOwners.join(", "),
    proofRoutes: [globalCertification.route, globalCertification.apiRoute, globalCertification.briefRoute, ...track.proofRoutes],
    nextAction: track.nextAction,
    prohibitedClaims: [...universalProhibitedClaims, ...track.blockedClaims]
  }));

  const continuousReviewAgentRecords: BoundaryResolutionRecord[] =
    continuousReviewAudit.agents.map((agent) => ({
      id: `continuous-review-agent-${agent.slug}`,
      category: "continuous-review-audit",
      name: agent.name,
      state: continuousReviewState(agent.status),
      buyerImpact: agent.mission,
      currentBoundary: `${agent.name} may ${agent.allowedActions.join(", ")}; blocked actions: ${agent.blockedActions.join(", ")}.`,
      currentControl: `${agent.cadence} Watches: ${agent.watches.join(", ")}.`,
      safeWorkaround: "Flag, route, recommend, and preserve evidence while humans retain approval authority.",
      remainingGate: `Escalate on: ${agent.escalationTriggers.join(", ")}.`,
      owner: `${agent.name} plus accountable domain owner`,
      proofRoutes: [
        continuousReviewAudit.route,
        continuousReviewAudit.apiRoute,
        continuousReviewAudit.briefRoute,
        ...agent.evidenceRoutes
      ],
      nextAction: agent.escalationTriggers[0] ?? "Route to accountable owner before external use.",
      prohibitedClaims: [...universalProhibitedClaims, ...agent.blockedActions]
    }));

  const continuousAuditControlRecords: BoundaryResolutionRecord[] =
    continuousReviewAudit.controls.map((control) => ({
      id: `continuous-audit-control-${slugify(control.control)}`,
      category: "continuous-review-audit",
      name: control.control,
      state: continuousReviewState(control.status),
      buyerImpact: control.purpose,
      currentBoundary: `Hard stops: ${control.hardStops.join(", ")}.`,
      currentControl: control.requiredEvidence.join(", "),
      safeWorkaround: "Create review evidence and route exceptions to the accountable owner before claims or production change.",
      remainingGate: control.hardStops.join(", "),
      owner: control.owner,
      proofRoutes: [continuousReviewAudit.route, continuousReviewAudit.apiRoute, continuousReviewAudit.briefRoute],
      nextAction: control.requiredEvidence[0] ?? "Retain evidence before expanding the control.",
      prohibitedClaims: [...universalProhibitedClaims, ...control.hardStops]
    }));

  const healthRecordsBoundaryRecords: BoundaryResolutionRecord[] =
    healthRecords.boundaryResolutions.map((resolution) => ({
      id: `health-records-${slugify(resolution.boundary)}`,
      category: "health-records-safety-exchange",
      name: resolution.boundary,
      state: "blocked-before-approval",
      buyerImpact: resolution.riskIfIgnored,
      currentBoundary: resolution.riskIfIgnored,
      currentControl: resolution.currentControl,
      safeWorkaround: resolution.safeWorkaround,
      remainingGate: resolution.remainingGate,
      owner: resolution.owner,
      proofRoutes: resolution.proofRoutes,
      nextAction: resolution.safeWorkaround,
      prohibitedClaims: [
        ...universalProhibitedClaims,
        "live PHI ingestion authorized",
        "production EHR access approved",
        "patient matching approved",
        "EHR writeback approved",
        "payer submission approved"
      ]
    }));

  const productServiceBoundaryRecords: BoundaryResolutionRecord[] =
    productServicePortfolio.productServiceBoundaryResolutions.map((resolution) => ({
      id: `product-service-${resolution.slug}`,
      category: "product-service-offerings",
      name: resolution.boundary,
      state: productServiceState(resolution.status),
      buyerImpact: resolution.riskIfIgnored,
      currentBoundary: resolution.riskIfIgnored,
      currentControl: resolution.currentControl,
      safeWorkaround: resolution.safeWorkaround,
      remainingGate: resolution.remainingGate,
      owner: resolution.owner,
      proofRoutes: resolution.proofRoutes,
      nextAction: resolution.safeWorkaround,
      prohibitedClaims: [...universalProhibitedClaims, ...resolution.prohibitedClaims]
    }));

  const clientOnboardingBoundaryRecords: BoundaryResolutionRecord[] =
    clientOnboarding.clientOnboardingControls.map((control) => ({
      id: `client-onboarding-${control.slug}`,
      category: "client-onboarding-communications",
      name: control.control,
      state: clientOnboardingState(control.status),
      buyerImpact: control.purpose,
      currentBoundary:
        `${control.control} remains ${control.status}; hard stops: ${control.hardStops.join(", ")}.`,
      currentControl: control.requiredEvidence.join(", "),
      safeWorkaround:
        "Use human-reviewed templates, calendar-safe packets, proof routes, owner handoffs, and no-PHI meeting notes before external communication or buyer commitment.",
      remainingGate: control.hardStops.join(", "),
      owner: control.owner,
      proofRoutes: [clientOnboarding.route, clientOnboarding.apiRoute, clientOnboarding.briefRoute],
      nextAction: control.requiredEvidence[0] ?? "Assign owner and retain communication review evidence.",
      prohibitedClaims: [...universalProhibitedClaims, ...control.hardStops, ...clientOnboarding.blockedContent]
    }));

  const enterpriseScalabilityControlRecords: BoundaryResolutionRecord[] =
    enterpriseScalability.controls.map((control) => ({
      id: `enterprise-scale-control-${control.slug}`,
      category: "enterprise-scalability-operations",
      name: control.control,
      state: enterpriseScalabilityState(control.status),
      buyerImpact: control.purpose,
      currentBoundary:
        `${control.control} remains ${control.status}; hard stops: ${control.hardStops.join(", ")}.`,
      currentControl: control.requiredEvidence.join(", "),
      safeWorkaround:
        "Use scale readiness evidence, no-SLA language, capacity assumptions, tenant owners, support-tier review, and qualified external review before commitments expand.",
      remainingGate: control.hardStops.join(", "),
      owner: control.owner,
      proofRoutes: [
        enterpriseScalability.route,
        enterpriseScalability.apiRoute,
        enterpriseScalability.briefRoute
      ],
      nextAction: control.requiredEvidence[0] ?? "Assign scale owner and retain evidence.",
      prohibitedClaims: [...universalProhibitedClaims, ...control.hardStops, ...enterpriseScalability.blockedClaims]
    }));

  const limitationsWorkaroundRecords: BoundaryResolutionRecord[] =
    limitationsWorkarounds.tracks.map((track) => ({
      id: `limitations-workaround-${track.slug}`,
      category: "limitations-workaround-operations",
      name: track.title,
      state: limitationsWorkaroundState(track.state),
      buyerImpact: track.riskIfIgnored,
      currentBoundary:
        `${track.title} remains ${track.state}; blocked claims: ${track.blockedClaims.join(", ")}.`,
      currentControl: track.operatingControl,
      safeWorkaround: track.safeWorkaround,
      remainingGate: track.graduationGate,
      owner: track.owner,
      proofRoutes: [
        limitationsWorkarounds.route,
        limitationsWorkarounds.apiRoute,
        limitationsWorkarounds.briefRoute,
        ...track.proofRoutes
      ],
      nextAction: track.escalationTrigger,
      prohibitedClaims: [...universalProhibitedClaims, ...track.blockedClaims, ...limitationsWorkarounds.blockedClaims]
    }));

  const platformPowerControlRecords: BoundaryResolutionRecord[] =
    platformPower.controls.map((control) => ({
      id: `platform-power-control-${control.slug}`,
      category: "platform-power-operations",
      name: control.control,
      state: platformPowerState(control.status),
      buyerImpact: control.purpose,
      currentBoundary:
        `${control.control} remains ${control.status}; hard stops: ${control.hardStops.join(", ")}.`,
      currentControl: control.requiredEvidence.join(", "),
      safeWorkaround:
        "Use API contract packets, role-based UI command paths, model-route registers, agent approval triggers, eval evidence, and explicit no-live-AI/no-PHI boundaries before claims expand.",
      remainingGate: control.hardStops.join(", "),
      owner: control.owner,
      proofRoutes: [platformPower.route, platformPower.apiRoute, platformPower.briefRoute],
      nextAction: control.requiredEvidence[0] ?? "Assign platform owner and retain evidence.",
      prohibitedClaims: [...universalProhibitedClaims, ...control.hardStops, ...platformPower.blockedClaims]
    }));

  const records = [
    ...authorityRecords,
    ...clinicalCareRecords,
    ...agentWorkspaceRecords,
    ...qaWorkflowRecords,
    ...qaKnownLimitationRecords,
    ...publicMarketRecords,
    ...globalCertificationRecords,
    ...continuousReviewAgentRecords,
    ...continuousAuditControlRecords,
    ...healthRecordsBoundaryRecords,
    ...productServiceBoundaryRecords,
    ...clientOnboardingBoundaryRecords,
    ...enterpriseScalabilityControlRecords,
    ...limitationsWorkaroundRecords,
    ...platformPowerControlRecords,
    ...enterpriseGrowthBoundaryRecords
  ];
  const countsByState = stateCounts(records);
  const countsByCategory = categoryCounts(records);
  const externalGateCount =
    countsByState["customer-specific-required"] +
    countsByState["external-approval-required"] +
    countsByState["blocked-before-approval"];

  return {
    service: "scrimed-boundary-resolution-register",
    route: boundaryResolutionRoute,
    apiRoute: boundaryResolutionApiRoute,
    briefRoute: boundaryResolutionBriefRoute,
    status: boundaryResolutionStatus,
    proofStackStatus: boundaryResolutionProofStackStatus,
    briefProofStackStatus: boundaryResolutionBriefProofStackStatus,
    boundary: boundaryResolutionBoundary,
    recordCount: records.length,
    countsByState,
    countsByCategory,
    activeControlCount: countsByState["active-control"],
    safeWorkaroundCount: countsByState["safe-workaround-active"],
    humanAal2RequiredCount: countsByState["human-aal2-required"],
    externalGateCount,
    blockedBeforeApprovalCount: countsByState["blocked-before-approval"],
    addressedPosition:
      "Every known boundary in this register has an owner, proof route, safe workaround, and remaining gate. Boundaries that require licensed clinicians, counsel, customer approval, security certification, reimbursement review, regional approval, or human AAL2 evidence remain explicitly unresolved until the right external evidence exists.",
    safeCommercialPosition:
      "SCRIMED remains sellable as a governed synthetic pilot, workflow intelligence assessment, AI readiness and governance audit, and clinical operations automation blueprint while live clinical care, PHI processing, production connectors, public claims, and reimbursement actions stay gated.",
    operatingRules: [
      "Do not enter PHI, payer member data, production credentials, source contracts, medical records, or patient identifiers into current public or synthetic pilot workflows.",
      "Use Health Records Safety Exchange for no-PHI extraction planning, patient-safety lint, source attribution, and live-data workaround routing before any record workflow expands.",
      "Use Product and Services Portfolio before pricing, pilots, diligence, implementation, or enterprise-license work expands so every opportunity has one package, one offer, one proof route, one margin control, and one retained boundary.",
      "Use Client Onboarding and Communications before buyer meetings, demo follow-up, pilot workshops, decks, emails, and calendar-ready agendas leave SCRIMED; humans must approve sends and events.",
      "Use Enterprise Scalability Operations before enterprise traffic, tenant scale, support tiers, SLO/SLA language, regional hosting, disaster recovery, or cost commitments expand.",
      "Use Platform Power Operations before API, UI, AI, model-routing, agent-tool, evidence-retrieval, accessibility, or trillion-scale positioning claims expand.",
      "Use Limitations and Workaround Operations when an issue is blocked so every safe alternative has a packet, owner, proof route, escalation trigger, expiration rule, and graduation gate.",
      "Do not claim live clinical authority, legal approval, reimbursement certainty, security certification, regional regulatory approval, or production go-live before signed external evidence exists.",
      "Do not claim HIPAA, SOC 2, HITRUST, ISO, FDA, ONC, EU AI Act, GDPR, NHS, MHRA, Essential Eight, or other certification/approval status before the qualified external authority exists.",
      "Do not position 24/7 review agents as managed SOC/MDR coverage, autonomous remediation, error-free AI review, clinical validation, or public quantum capability.",
      "Do not present revenue, ROI, profit margin, valuation, fundraising, legal, accounting, or tax conclusions without qualified review and retained release authority.",
      "Use protected AAL2 workspaces and no-secret evidence packets for operator proof.",
      "Use synthetic fixtures, metadata-only references, and external evidence-room references while sensitive artifacts remain outside SCRIMED.",
      "Escalate high-risk clinical, legal, privacy, security, payer, public-claims, or production connector requests to the retained owner instead of improvising."
    ],
    nextRecommendedBuildStep:
      "Turn the register into a release preflight: require every buyer, investor, regional, certification, 24/7 review, innovation, API, UI, AI, model-route, agent-tool, legal/finance, workaround, and clinical claim to resolve to an approved route, explicit boundary, owner, prohibited-claim list, safe packet, and retained evidence gate before external use.",
    records,
    updated: "2026-06-26"
  };
}

export function buildBoundaryResolutionBrief() {
  const summary = getBoundaryResolutionSummary();

  return [
    "# SCRIMED Boundary Resolution Register Brief",
    "",
    `Status: ${summary.status}`,
    `Proof stack: ${summary.proofStackStatus}`,
    `Record count: ${summary.recordCount}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Operating Position",
    summary.addressedPosition,
    "",
    "## Safe Commercial Position",
    summary.safeCommercialPosition,
    "",
    "## Counts By State",
    ...Object.entries(summary.countsByState).map(([state, count]) => `- ${state}: ${count}`),
    "",
    "## Counts By Category",
    ...Object.entries(summary.countsByCategory).map(([category, count]) => `- ${category}: ${count}`),
    "",
    "## Operating Rules",
    markdownItems(summary.operatingRules),
    "",
    "## Boundary Records",
    boundaryRecordLines(summary.records),
    "",
    "## Next Recommended Build Step",
    summary.nextRecommendedBuildStep
  ].join("\n");
}
