import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";
import {
  calculateEconomicUnitModel,
  evaluateCapitalEfficiencyBudget
} from "./economicUnitModel";
import { getInvestorReadinessScorecard } from "./investorReadinessScorecard";
import { evaluateMergeReadiness } from "./mergeReadiness";
import { getScrimedOperatingModeSummary } from "./operatingMode";
import {
  buildPostPr25EvidenceGraph,
  verifyPlatformEvidenceGraph
} from "./platformEvidenceGraph";
import { getPr25FrozenReviewBaseline } from "./pr25FrozenReviewBaseline";
import { resolvePublicClaim } from "./publicClaimResolver";
import { getReleaseStateSummary } from "./releaseStateMachine";
import {
  getPlatformStrategySummary,
  platformMoatRegistry
} from "./scrimed-control-plane/platformStrategy";
import { getStrategicPartnerReadinessSummary } from "./strategicPartnerReadiness";
import {
  buildDocumentationAuthorizationPilot,
  buildSyntheticPilotEvidencePack
} from "./syntheticPilotFactory";

export const postPr25PlatformAdvanceVersion =
  "scrimed-post-pr25-platform-advance-v1-2026-08-09";

export type CeoDecisionCategory =
  | "strategy"
  | "capital"
  | "partnership"
  | "customer"
  | "legal"
  | "production"
  | "security"
  | "regulatory";

export type CeoDecision = {
  decisionId: string;
  category: CeoDecisionCategory;
  context: string;
  recommendation: string;
  alternatives: string[];
  financialImpact: string;
  risk: string;
  deadline: string | null;
  defaultSafeAction: string;
  evidence: string[];
  approvalState: "NOT_REQUESTED" | "REQUESTED" | "EXTERNAL_REVIEW_REQUIRED";
};

const ceoDecisions: CeoDecision[] = [
  {
    decisionId: "decision-pr25-merge-authorization",
    category: "production",
    context:
      "PR #25 is frozen at an exact head and awaits a fresh independent disposition before merge authorization can be considered.",
    recommendation:
      "Do not authorize merge until the fresh reviewer approval validates against every frozen fingerprint.",
    alternatives: ["Request changes", "Keep candidate open without merge"],
    financialImpact: "No committed spend; delaying merge preserves review integrity.",
    risk: "A stale approval could authorize code the reviewer did not evaluate.",
    deadline: null,
    defaultSafeAction: "Hold PR #25 at REVIEW_REQUESTED.",
    evidence: ["docs/release/PR25_FROZEN_REVIEW_BASELINE.md", "docs/review/PR25_REVIEWER_BRIEF.md"],
    approvalState: "REQUESTED"
  },
  {
    decisionId: "decision-investor-artifact-distribution",
    category: "capital",
    context:
      "Investor materials can be prepared internally, but external distribution needs exact-artifact founder, finance, and counsel/claims approval.",
    recommendation:
      "Complete the recipient-specific claims and finance review before distribution.",
    alternatives: ["Keep materials internal", "Use a reduced no-claims technical brief"],
    financialImpact: "Fundraising terms and spend remain uncommitted.",
    risk: "Unsupported claims or unreviewed assumptions can reduce diligence credibility.",
    deadline: null,
    defaultSafeAction: "Keep investor artifacts internal and nonbinding.",
    evidence: ["docs/investor/DATA_ROOM_INDEX.md", "/investor-readiness"],
    approvalState: "EXTERNAL_REVIEW_REQUIRED"
  },
  {
    decisionId: "decision-protected-pilot-activation",
    category: "customer",
    context:
      "Synthetic demonstrations are available; protected pilot activation still requires legal, security, privacy, clinical, identity, migration, and customer-specific authorization.",
    recommendation:
      "Sell a bounded no-PHI assessment first and keep protected execution disabled.",
    alternatives: ["Run an internal synthetic pilot only", "Pause external pilot discussions"],
    financialImpact: "Use nonbinding assessment pricing; no revenue is assumed.",
    risk: "Premature activation could exceed current authority and evidence.",
    deadline: null,
    defaultSafeAction: "Synthetic/no-PHI mode remains active; all external writes remain off.",
    evidence: ["/offerings", "/pilot-demo-commercial-readiness", "/approvals-readiness"],
    approvalState: "NOT_REQUESTED"
  }
];

export function getPostPr25PlatformAdvanceSummary() {
  const baseline = getPr25FrozenReviewBaseline();
  const release = getReleaseStateSummary();
  const operatingMode = getScrimedOperatingModeSummary().mode;
  const platformStrategy = getPlatformStrategySummary();
  const investorReadiness = getInvestorReadinessScorecard();
  const partnerReadiness = getStrategicPartnerReadinessSummary();
  const evidenceGraph = buildPostPr25EvidenceGraph();
  const evidenceGraphIntegrity = verifyPlatformEvidenceGraph(evidenceGraph);
  const pilot = buildDocumentationAuthorizationPilot();
  const pilotEvidencePack = buildSyntheticPilotEvidencePack(pilot);
  const unitEconomics = calculateEconomicUnitModel({
    scenarioId: "documentation-authorization-synthetic-scenario",
    evidenceTag: "SIMULATED",
    attemptedTasks: 10,
    verifiedSuccessfulTasks: 0,
    inferenceCostUsd: 0,
    infrastructureCostUsd: 0,
    reviewCostUsd: 0,
    implementationCostUsd: 0,
    supportCostUsd: 0,
    retryCostUsd: 0,
    correctionCostUsd: 0,
    workflowValuePerVerifiedTaskUsd: null,
    contractedRevenuePerVerifiedTaskUsd: null
  });
  const capitalEfficiency = evaluateCapitalEfficiencyBudget({
    budget: {
      dailyCapUsd: 25,
      monthlyCapUsd: 250,
      taskCapUsd: 5,
      providerConcentrationCap: 0.7
    },
    currentDailySpendUsd: 0,
    currentMonthlySpendUsd: 0,
    proposedTaskCostUsd: 0,
    providerConcentration: 0
  });
  const platformNarrativeClaim = resolvePublicClaim({
    claim: {
      claimId: "claim:investor-platform-narrative",
      text: "SCRIMED is building governed healthcare intelligence infrastructure.",
      evidenceIds: ["claim:investor-platform-narrative", "source:pr25-exact-head"],
      evidenceMaturityRequired: "local-verified",
      owner: "Founder + Product Governance",
      reviewDate: "2026-08-09T21:01:09.000Z",
      publicationAuthorized: false,
      syntheticOrEstimated: false
    },
    graph: evidenceGraph
  });
  const mergeReadiness = evaluateMergeReadiness({
    exactHeadApproval: baseline.review.exactHeadApprovalRecorded,
    exactHeadApprovalMatches: baseline.review.exactHeadApprovalRecorded,
    ciPassed:
      baseline.validation.githubActionsPassed === baseline.validation.githubActionsTotal,
    secretScanPassed: baseline.validation.secretScanFindings === 0,
    sbomPassed: baseline.validation.dependencyDelta === 0,
    publicClaimsPassed: baseline.validation.publicClaimsPassed,
    unreviewedMigrationsAdded: !baseline.validation.migrationStaticReviewPassed,
    syntheticOnly: operatingMode.syntheticOnly,
    phiEnabled: operatingMode.allowPHI,
    clinicalExecutionEnabled: operatingMode.liveClinicalExecution,
    ehrWritebackEnabled: operatingMode.productionEHRConnections,
    deviceWritebackEnabled: operatingMode.medicalDeviceConnections,
    customerActivationEnabled: false,
    productionAutoDeployFromMainEnabled:
      baseline.releaseControls.automaticProductionDeploymentFromMain
  });
  const summary = {
    service: "scrimed-post-pr25-platform-advance" as const,
    version: postPr25PlatformAdvanceVersion,
    status: "follow-on-development-no-release-authority" as const,
    frozenReviewBaseline: baseline,
    exactHeadReview: {
      status: baseline.review.state,
      approvalRecorded: baseline.review.exactHeadApprovalRecorded,
      acceptedHistoricalApproval: false as const,
      bindingVersion: "scrimed-exact-head-review-binding-v1-2026-08-09",
      allowedDispositions: [
        "APPROVE_EXACT_HEAD",
        "APPROVE_WITH_NONBLOCKING_NOTES",
        "REQUEST_CHANGES",
        "BLOCK"
      ],
      recommendedDisposition:
        "Independent reviewer must inspect the exact frozen head; this dashboard does not recommend or record approval."
    },
    release,
    mergeReadiness,
    investorReadiness,
    partnerReadiness,
    moatRegistry: {
      count: platformMoatRegistry.length,
      entries: platformMoatRegistry,
      strategyEvidenceHash: platformStrategy.auditHash
    },
    evidence: {
      graph: evidenceGraph,
      integrity: evidenceGraphIntegrity,
      publicClaimResolution: platformNarrativeClaim
    },
    economics: {
      unitScenario: unitEconomics,
      capitalEfficiency
    },
    pilot: {
      definition: pilot,
      evidencePack: pilotEvidencePack
    },
    externalReadiness: {
      supabaseLeakedPasswordProtection: "EXTERNAL_VERIFICATION_REQUIRED" as const,
      pendingMigrations: 3,
      productionMigrationsApplied: false as const,
      wixDesktopClaimsAudit: "PASSED_RECORDED_BASELINE" as const,
      wixTrueMobileVariantVerification: "OWNER_ACTION_REQUIRED" as const,
      aal2OperatorEvidence: "OPERATOR_REQUIRED_WHEN_EXACT_ACTION_IS_REQUESTED" as const,
      providerCallsExecuted: false as const
    },
    ceoDecisions,
    boundary:
      "Post-PR25 development is synthetic/no-PHI and advisory. It grants no review, merge, deployment, migration, legal, clinical, payer, EHR, certification, customer, partner, investment, or commercial authority.",
    productionAuthorityGranted: false as const,
    externalActionsExecuted: false as const
  };

  return {
    ...summary,
    summaryHash: createClinicalEvidenceHash(summary)
  };
}

export function getPr25ReviewerDashboardSummary() {
  const summary = getPostPr25PlatformAdvanceSummary();

  return {
    service: "scrimed-pr25-reviewer-dashboard" as const,
    frozenCandidate: summary.frozenReviewBaseline,
    review: summary.exactHeadReview,
    releaseState: summary.release,
    mergeReadiness: summary.mergeReadiness,
    architectureDeltas: [
      "Vercel automatic production deployment from main is disabled while preview remains enabled.",
      "The candidate contains provider-neutral governance, evidence, model routing, clinical-safety, and protected-pilot foundations.",
      "The follow-on branch is isolated from PR #25 and does not alter the frozen review head."
    ],
    unresolvedIssues: [
      "Fresh independent approval is not recorded for the frozen head.",
      "Merge authorization remains separate and absent.",
      "Production, migrations, PHI, clinical actions, payer/EHR actions, certification, and customer go-live remain blocked."
    ],
    reviewerTargetMinutes: 15,
    approvalMutationAvailable: false as const,
    dashboardHash: createClinicalEvidenceHash({
      frozenCandidateHash: summary.frozenReviewBaseline.evidenceHash,
      summaryHash: summary.summaryHash
    })
  };
}
