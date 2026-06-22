import { getClinicalAuthorityReadinessSummary } from "./clinicalAuthorityReadiness";
import { getClinicalCareActivationSummary } from "./clinicalCareActivation";
import { getPersistentAgentWorkspaceSummary } from "./persistentAgentWorkspace";
import { getPublicMarketReadinessSummary } from "./publicMarketReadiness";
import { getQaEvidenceActivationPlan, getQaEvidenceLedger } from "./qaEvidenceLedger";

export type BoundaryResolutionCategory =
  | "clinical-authority"
  | "clinical-care-activation"
  | "agent-workspace"
  | "qa-evidence"
  | "public-market-readiness";

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
  "SCRIMED Boundary Resolution Register organizes known product, clinical, PHI, legal, regional, reimbursement, security, QA, public-market, and production-readiness boundaries into owned controls, safe workarounds, proof routes, and remaining gates. It does not authorize live clinical care, PHI processing, legal approval, regional regulatory approval, reimbursement certainty, security certification, production clinical authorization, autonomous clinical decisions, patient outreach, payer submission, EHR writeback, public customer claims, or securities offering material.";

const universalProhibitedClaims = [
  "live clinical care authorized",
  "PHI processing authorized",
  "HIPAA certified",
  "SOC 2 certified",
  "FDA cleared",
  "regional regulatory approval granted",
  "reimbursement guaranteed",
  "production clinical authorization granted",
  "autonomous diagnosis or treatment permitted"
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
      "public-market-readiness": 0
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
      "/qa-launch-kit",
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

  const records = [
    ...authorityRecords,
    ...clinicalCareRecords,
    ...agentWorkspaceRecords,
    ...qaWorkflowRecords,
    ...qaKnownLimitationRecords,
    ...publicMarketRecords
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
      "Do not claim live clinical authority, legal approval, reimbursement certainty, security certification, regional regulatory approval, or production go-live before signed external evidence exists.",
      "Use protected AAL2 workspaces and no-secret evidence packets for operator proof.",
      "Use synthetic fixtures, metadata-only references, and external evidence-room references while sensitive artifacts remain outside SCRIMED.",
      "Escalate high-risk clinical, legal, privacy, security, payer, public-claims, or production connector requests to the retained owner instead of improvising."
    ],
    nextRecommendedBuildStep:
      "Use /qa-claim-guard to keep buyer and external language inside current evidence while /qa-human-run-packet dispatches the first human AAL2 QA workflow, /qa-completion-bridge validates candidate metadata, protected persistence records the safe evidence packet, /qa-activation-seal confirms final seal posture, /qa-proof-promotion gates retained packet language, and /qa-buyer-proof-release decides whether Buyer Diligence may reference retained proof.",
    records,
    updated: "2026-06-22"
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
