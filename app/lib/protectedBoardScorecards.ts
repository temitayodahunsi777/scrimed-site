import {
  protectedMetricRollupClinicalAuthority,
  protectedMetricRollupDataBoundary,
  protectedMetricRollupFinancialAuthority,
  protectedMetricRollupSecuritiesAuthority
} from "./protectedMetricRollups";
import type {
  ProtectedMetricTrendMetric,
  ProtectedMetricTrendReviewRecord
} from "./protectedMetricTrends";

export const protectedBoardScorecardStatus =
  "aal2-rolling-quarter-board-scorecards-no-phi";
export const protectedBoardScorecardPacketProofStackStatus =
  "aal2-audited-board-scorecard-packets-no-phi";
export const protectedBoardScorecardAttestation =
  "finance-methodology-pending-no-phi-board-scorecard";
export const protectedBoardScorecardDataBoundary =
  protectedMetricRollupDataBoundary;
export const protectedBoardScorecardAllocationProfileStatus =
  "finance-allocation-profile-pending";
export const protectedBoardScorecardBoundary =
  "Protected Board Scorecards convert no-PHI protected metric trend reviews into internal rolling-quarter operating scorecards, finance-allocation readiness, buyer-segment cohort signals, competitive advantage tracking, and agent improvement priorities. They do not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, legal advice, valuation assurance, revenue guarantee, clinical validation, reimbursement assurance, compliance certification, production authorization, or live clinical execution approval.";

export type ProtectedBoardScorecardState =
  | "scale-ready"
  | "optimize"
  | "watch"
  | "insufficient-data";

export type ProtectedBoardScorecardBuyerSegmentFocus =
  | "multi-segment"
  | "provider-operations"
  | "payer-operations"
  | "employer-population-health"
  | "government-public-health"
  | "global-health";

export type ProtectedBoardScorecardInput = {
  primaryTrendReviewId: string;
  secondaryTrendReviewId?: string;
  tertiaryTrendReviewId?: string;
  boardPeriodLabel: string;
  buyerSegmentFocus: ProtectedBoardScorecardBuyerSegmentFocus;
  operatorAttestation: typeof protectedBoardScorecardAttestation;
  dataBoundary: typeof protectedBoardScorecardDataBoundary;
  allocationProfileStatus: typeof protectedBoardScorecardAllocationProfileStatus;
  reviewNote: string;
};

export type ProtectedBoardScorecardMetricSummary = {
  metricId: ProtectedMetricTrendMetric["metricId"];
  label: string;
  direction: ProtectedMetricTrendMetric["direction"];
  latestValue: number | null;
  latestPercentChange: number | null;
  improvingCount: number;
  stableCount: number;
  watchCount: number;
  insufficientDataCount: number;
};

export type ProtectedBoardFinanceAllocationProfile = {
  status: typeof protectedBoardScorecardAllocationProfileStatus;
  currentMethodology: "model-cost-only";
  components: Array<{
    component: string;
    status: "pending-finance-methodology" | "available";
    boundary: string;
  }>;
  nextGate: string;
};

export type ProtectedBoardBuyerSegmentCohort = {
  segment: ProtectedBoardScorecardBuyerSegmentFocus;
  label: string;
  motion: string;
  proofUse: string;
  boundary: string;
};

export type ProtectedBoardScorecardRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  primaryTrendReviewId: string;
  secondaryTrendReviewId: string | null;
  tertiaryTrendReviewId: string | null;
  boardPeriodLabel: string;
  scorecardState: ProtectedBoardScorecardState;
  trendReviewCount: number;
  rollingQuarterMetrics: ProtectedBoardScorecardMetricSummary[];
  financeAllocationProfile: ProtectedBoardFinanceAllocationProfile;
  buyerSegmentFocus: ProtectedBoardScorecardBuyerSegmentFocus;
  buyerSegmentCohorts: ProtectedBoardBuyerSegmentCohort[];
  competitiveAdvantages: string[];
  agentImprovementPriorities: string[];
  strategicActions: string[];
  recommendations: string[];
  limitations: string[];
  operatorAttestation: typeof protectedBoardScorecardAttestation;
  reviewNote: string;
  dataBoundary: typeof protectedBoardScorecardDataBoundary;
  allocationProfileStatus: typeof protectedBoardScorecardAllocationProfileStatus;
  financialReportingAuthority: typeof protectedMetricRollupFinancialAuthority;
  securitiesAuthority: typeof protectedMetricRollupSecuritiesAuthority;
  clinicalExecutionAuthority: typeof protectedMetricRollupClinicalAuthority;
  createdBy: string;
  createdAt: string;
  boundary: string;
};

export type ProtectedBoardScorecardDashboard = {
  service: "scrimed-protected-board-scorecards";
  status: typeof protectedBoardScorecardStatus;
  packetStatus: typeof protectedBoardScorecardPacketProofStackStatus;
  scorecardCount: number;
  latestScorecardAt: string | null;
  latestScorecardState: ProtectedBoardScorecardState | "pending";
  availableTrendReviewCount: number;
  scorecardReady: boolean;
  nextScorecardAction: string;
  financeAllocationStatus: typeof protectedBoardScorecardAllocationProfileStatus;
  buyerSegmentFocus: ProtectedBoardScorecardBuyerSegmentFocus;
  buyerSegmentCohorts: ProtectedBoardBuyerSegmentCohort[];
  competitiveAdvantages: string[];
  agentImprovementPriorities: string[];
  safeWorkarounds: string[];
  boundary: string;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const allowedBuyerSegmentFocus: ProtectedBoardScorecardBuyerSegmentFocus[] = [
  "multi-segment",
  "provider-operations",
  "payer-operations",
  "employer-population-health",
  "government-public-health",
  "global-health"
];

const forbiddenContentPatterns = [
  /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
  /sk-[A-Za-z0-9_-]{12,}/i,
  /sbp_[A-Za-z0-9_-]{12,}/i,
  /bearer\s+[A-Za-z0-9._-]+/i,
  /patient[ _-]?(id|identifier|mrn)/i,
  /member[ _-]?(id|identifier)/i,
  /medical record/i,
  /protected health information/i,
  /\bphi\b/i,
  /payer member/i,
  /diagnosis code/i,
  /social security/i,
  /audited financial/i,
  /investment recommendation/i,
  /securities offering/i,
  /valuation guarantee/i,
  /revenue guarantee/i
];

function safeShortText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength + 1) : "";
}

function containsForbiddenContent(...values: string[]) {
  const candidate = values.join(" ");

  return forbiddenContentPatterns.some((pattern) => pattern.test(candidate));
}

function optionalUuid(value: unknown) {
  const text = safeShortText(value, 64);

  return text || undefined;
}

function metricSummaries(reviews: ProtectedMetricTrendReviewRecord[]) {
  const metricMap = new Map<string, ProtectedBoardScorecardMetricSummary>();

  for (const review of reviews) {
    for (const metric of review.trendMetrics) {
      const existing =
        metricMap.get(metric.metricId) ??
        ({
          metricId: metric.metricId,
          label: metric.label,
          direction: metric.direction,
          latestValue: metric.current,
          latestPercentChange: metric.percentChange,
          improvingCount: 0,
          stableCount: 0,
          watchCount: 0,
          insufficientDataCount: 0
        } satisfies ProtectedBoardScorecardMetricSummary);

      existing.latestValue ??= metric.current;
      existing.latestPercentChange ??= metric.percentChange;

      if (metric.state === "improving") existing.improvingCount += 1;
      if (metric.state === "stable") existing.stableCount += 1;
      if (metric.state === "watch") existing.watchCount += 1;
      if (metric.state === "insufficient-data") existing.insufficientDataCount += 1;

      metricMap.set(metric.metricId, existing);
    }
  }

  return Array.from(metricMap.values());
}

function scorecardState(reviews: ProtectedMetricTrendReviewRecord[]): ProtectedBoardScorecardState {
  if (reviews.length === 0 || reviews.some((review) => review.boardTrendState === "insufficient-data")) {
    return "insufficient-data";
  }

  if (reviews.some((review) => review.boardTrendState === "watch")) {
    return "watch";
  }

  if (reviews.some((review) => review.boardTrendState === "improving")) {
    return "scale-ready";
  }

  return "optimize";
}

function financeAllocationProfile(): ProtectedBoardFinanceAllocationProfile {
  const pendingBoundary =
    "Pending finance-approved methodology. Do not use for audited reporting, margin reporting, valuation, securities materials, or external financial claims.";

  return {
    status: protectedBoardScorecardAllocationProfileStatus,
    currentMethodology: "model-cost-only",
    components: [
      { component: "Model cost", status: "available", boundary: "Protected model-cost signals only." },
      { component: "Reviewer labor", status: "pending-finance-methodology", boundary: pendingBoundary },
      { component: "Implementation labor", status: "pending-finance-methodology", boundary: pendingBoundary },
      { component: "Infrastructure", status: "pending-finance-methodology", boundary: pendingBoundary },
      { component: "Support and success", status: "pending-finance-methodology", boundary: pendingBoundary },
      { component: "Delivery operations", status: "pending-finance-methodology", boundary: pendingBoundary }
    ],
    nextGate:
      "Finance must approve labor, infrastructure, support, delivery, and reviewer allocation before scorecards can support gross-margin or full cost-per-workflow reporting."
  };
}

export function buyerSegmentCohorts(
  focus: ProtectedBoardScorecardBuyerSegmentFocus
): ProtectedBoardBuyerSegmentCohort[] {
  const cohorts: ProtectedBoardBuyerSegmentCohort[] = [
    {
      segment: "provider-operations",
      label: "Provider operations",
      motion: "Use workflow friction, documentation quality, access bottlenecks, and governed automation proof to sell operational pilots.",
      proofUse: "Board scorecard packets can support provider executive demos after counsel and finance review.",
      boundary: "No clinical outcome, live-care authorization, or autonomous diagnosis claim."
    },
    {
      segment: "payer-operations",
      label: "Payer operations",
      motion: "Use denial-risk, prior-authorization support, policy evidence, and revenue-leakage signals for payer operations pilots.",
      proofUse: "Scorecards can show protected workflow discipline before payer integration or submission authority.",
      boundary: "No reimbursement guarantee, coverage determination, coding authority, or payer submission."
    },
    {
      segment: "employer-population-health",
      label: "Employer and population health",
      motion: "Use care-gap, access, risk-horizon, and navigation readiness signals for benefits and population intelligence buyers.",
      proofUse: "Scorecards can package no-PHI cohort strategy without employee or patient-level data.",
      boundary: "No patient outreach, risk scoring, benefits determination, or medical advice."
    },
    {
      segment: "government-public-health",
      label: "Government and public health",
      motion: "Use interoperability, access bottleneck, governance, and sovereign deployment readiness for public-sector pilots.",
      proofUse: "Scorecards can support procurement conversations around trust, audit, and operational intelligence.",
      boundary: "No public-health surveillance claim, emergency triage, regulatory approval, or sovereign authorization."
    },
    {
      segment: "global-health",
      label: "Global health",
      motion: "Use multilingual readiness, low-PHI deployment paths, and governed workflow evidence for global access partnerships.",
      proofUse: "Scorecards can prioritize channels where synthetic pilots create value without moving sensitive clinical data.",
      boundary: "No cross-border data transfer authorization, clinical validation, or care-delivery approval."
    }
  ];

  if (focus === "multi-segment") {
    return cohorts;
  }

  return cohorts.filter((cohort) => cohort.segment === focus);
}

export function validateProtectedBoardScorecardInput(value: unknown):
  | { ok: true; input: ProtectedBoardScorecardInput }
  | { ok: false; errors: string[] } {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
  const errors: string[] = [];
  const primaryTrendReviewId = safeShortText(record.primaryTrendReviewId, 64);
  const secondaryTrendReviewId = optionalUuid(record.secondaryTrendReviewId);
  const tertiaryTrendReviewId = optionalUuid(record.tertiaryTrendReviewId);
  const boardPeriodLabel = safeShortText(record.boardPeriodLabel, 96);
  const buyerSegmentFocus = safeShortText(record.buyerSegmentFocus, 64);
  const operatorAttestation = safeShortText(record.operatorAttestation, 90);
  const dataBoundary = safeShortText(record.dataBoundary, 90);
  const allocationProfileStatus = safeShortText(record.allocationProfileStatus, 90);
  const reviewNote = safeShortText(record.reviewNote, 280);
  const reviewIds = [primaryTrendReviewId, secondaryTrendReviewId, tertiaryTrendReviewId].filter(
    Boolean
  ) as string[];

  if (!uuidPattern.test(primaryTrendReviewId)) {
    errors.push("Primary trend review id must be a valid protected metric trend review id.");
  }

  for (const reviewId of [secondaryTrendReviewId, tertiaryTrendReviewId]) {
    if (reviewId && !uuidPattern.test(reviewId)) {
      errors.push("Optional trend review ids must be valid protected metric trend review ids.");
    }
  }

  if (new Set(reviewIds).size !== reviewIds.length) {
    errors.push("Board scorecards require unique trend review ids.");
  }

  if (!/^[A-Za-z0-9][A-Za-z0-9 ._:-]{2,95}$/.test(boardPeriodLabel)) {
    errors.push("Board period label must be a short non-PHI operating review label.");
  }

  if (!allowedBuyerSegmentFocus.includes(buyerSegmentFocus as ProtectedBoardScorecardBuyerSegmentFocus)) {
    errors.push("Buyer segment focus must be an approved no-PHI segment.");
  }

  if (operatorAttestation !== protectedBoardScorecardAttestation) {
    errors.push("Board scorecards require the fixed finance-methodology-pending no-PHI attestation.");
  }

  if (dataBoundary !== protectedBoardScorecardDataBoundary) {
    errors.push("Board scorecards require the synthetic business workflow data boundary.");
  }

  if (allocationProfileStatus !== protectedBoardScorecardAllocationProfileStatus) {
    errors.push("Board scorecards require the finance-allocation-profile-pending status.");
  }

  if (reviewNote.length > 280) {
    errors.push("Review note must stay under 280 characters.");
  }

  if (containsForbiddenContent(boardPeriodLabel, reviewNote)) {
    errors.push("Board scorecard metadata cannot contain PHI, credentials, patient identifiers, payer member data, or external financial claims.");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    input: {
      primaryTrendReviewId,
      secondaryTrendReviewId,
      tertiaryTrendReviewId,
      boardPeriodLabel,
      buyerSegmentFocus: buyerSegmentFocus as ProtectedBoardScorecardBuyerSegmentFocus,
      operatorAttestation: protectedBoardScorecardAttestation,
      dataBoundary: protectedBoardScorecardDataBoundary,
      allocationProfileStatus: protectedBoardScorecardAllocationProfileStatus,
      reviewNote
    }
  };
}

export function deriveProtectedBoardScorecard(
  reviews: ProtectedMetricTrendReviewRecord[],
  input: ProtectedBoardScorecardInput
): Omit<
  ProtectedBoardScorecardRecord,
  "id" | "tenantId" | "workspaceId" | "createdBy" | "createdAt"
> {
  const state = scorecardState(reviews);

  return {
    primaryTrendReviewId: input.primaryTrendReviewId,
    secondaryTrendReviewId: input.secondaryTrendReviewId ?? null,
    tertiaryTrendReviewId: input.tertiaryTrendReviewId ?? null,
    boardPeriodLabel: input.boardPeriodLabel,
    scorecardState: state,
    trendReviewCount: reviews.length,
    rollingQuarterMetrics: metricSummaries(reviews),
    financeAllocationProfile: financeAllocationProfile(),
    buyerSegmentFocus: input.buyerSegmentFocus,
    buyerSegmentCohorts: buyerSegmentCohorts(input.buyerSegmentFocus),
    competitiveAdvantages: [
      "SCRIMED links workflow evidence to board operating discipline instead of depending on generic AI usage claims.",
      "Scorecards preserve no-PHI, AAL2, tenant-scoped, write-before-release evidence for enterprise diligence.",
      "Buyer-segment cohorts turn proof into specific provider, payer, employer, government, and global-health motions without weakening safety boundaries.",
      "Agent improvement priorities keep the operating system adaptive while retaining human review."
    ],
    agentImprovementPriorities: [
      "Route watch-state metrics into TrustQA review, model-router budget checks, and workflow retry analysis.",
      "Promote scale-ready workflows into reusable buyer demos, agent playbooks, and implementation templates.",
      "Keep all degraded trends behind human review instead of increasing autonomous execution.",
      "Use scorecard packets to prioritize product roadmap work that compounds trust, interoperability, and measurable operational value."
    ],
    strategicActions: [
      state === "watch"
        ? "Hold expansion until finance/product review resolves watch-state variance."
        : "Prepare buyer-segment operating motions using scorecard evidence after finance and counsel review.",
      "Convert scorecard output into operator tasks for Agent Commander, TrustQA, and sales readiness.",
      "Maintain external-use approval gates before sharing scorecards in fundraising, PR, marketing, advertising, or buyer diligence."
    ],
    recommendations: [
      "Approve full cost allocation before reporting gross margin, full cost per workflow, or margin by offer.",
      "Use scorecards internally to guide product, sales, agent, and market-expansion decisions.",
      "Keep clinical, privacy, security, legal, finance, and executive review gates active before production or external claims."
    ],
    limitations: [
      protectedBoardScorecardBoundary,
      "Scorecards compare protected no-PHI trend reviews only and do not prove clinical outcomes, reimbursement outcomes, audited financial performance, market share, or valuation.",
      "Allocation profiles remain pending until finance approves labor, infrastructure, support, delivery, implementation, and reviewer allocation methodology.",
      "Buyer-segment cohorts are strategy signals, not revenue guarantees, investment recommendations, legal advice, or advertising claim substantiation."
    ],
    operatorAttestation: protectedBoardScorecardAttestation,
    reviewNote: input.reviewNote,
    dataBoundary: protectedBoardScorecardDataBoundary,
    allocationProfileStatus: protectedBoardScorecardAllocationProfileStatus,
    financialReportingAuthority: protectedMetricRollupFinancialAuthority,
    securitiesAuthority: protectedMetricRollupSecuritiesAuthority,
    clinicalExecutionAuthority: protectedMetricRollupClinicalAuthority,
    boundary: protectedBoardScorecardBoundary
  };
}

export function buildProtectedBoardScorecardDashboard(
  trendReviews: ProtectedMetricTrendReviewRecord[],
  scorecards: ProtectedBoardScorecardRecord[]
): ProtectedBoardScorecardDashboard {
  const latestScorecard = scorecards[0] ?? null;

  return {
    service: "scrimed-protected-board-scorecards",
    status: protectedBoardScorecardStatus,
    packetStatus: protectedBoardScorecardPacketProofStackStatus,
    scorecardCount: scorecards.length,
    latestScorecardAt: latestScorecard?.createdAt ?? null,
    latestScorecardState: latestScorecard?.scorecardState ?? "pending",
    availableTrendReviewCount: trendReviews.length,
    scorecardReady: trendReviews.length >= 1,
    nextScorecardAction:
      trendReviews.length >= 1
        ? "Create a protected board scorecard from one to three no-PHI trend reviews and keep external use gated by finance and counsel."
        : "Create at least one protected metric trend review before board scorecard creation.",
    financeAllocationStatus:
      latestScorecard?.allocationProfileStatus ?? protectedBoardScorecardAllocationProfileStatus,
    buyerSegmentFocus: latestScorecard?.buyerSegmentFocus ?? "multi-segment",
    buyerSegmentCohorts: latestScorecard?.buyerSegmentCohorts ?? buyerSegmentCohorts("multi-segment"),
    competitiveAdvantages: latestScorecard?.competitiveAdvantages ?? [
      "SCRIMED compounds value by connecting protected workflow metrics, governance, buyer motions, and agent improvement priorities."
    ],
    agentImprovementPriorities: latestScorecard?.agentImprovementPriorities ?? [
      "Use scorecards to prioritize Agent Commander work, TrustQA review, model-routing budget checks, and workflow playbook promotion."
    ],
    safeWorkarounds: [
      "Use protected trend packets plus external finance-reviewed board materials when scorecard storage is unavailable.",
      "Keep scorecards internal until finance, counsel, privacy, security, clinical governance, and executive review approve external use.",
      "Treat allocation profiles as pending until finance approves full cost methodology."
    ],
    boundary: protectedBoardScorecardBoundary
  };
}

function formatMetricValue(value: number | null) {
  if (value === null) {
    return "pending";
  }

  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function buildProtectedBoardScorecardPacket(
  scorecard: ProtectedBoardScorecardRecord,
  options: {
    workspaceSlug: string;
    workspaceName: string;
    auditEventId?: string | null;
  }
) {
  return [
    "# SCRIMED Protected Board Scorecard Packet",
    "",
    `Workspace: ${options.workspaceName} (${options.workspaceSlug})`,
    `Scorecard ID: ${scorecard.id}`,
    `Packet audit event: ${options.auditEventId ?? "pending"}`,
    `Board period: ${scorecard.boardPeriodLabel}`,
    `State: ${scorecard.scorecardState}`,
    `Trend reviews included: ${scorecard.trendReviewCount}`,
    `Primary trend review: ${scorecard.primaryTrendReviewId}`,
    `Secondary trend review: ${scorecard.secondaryTrendReviewId ?? "none"}`,
    `Tertiary trend review: ${scorecard.tertiaryTrendReviewId ?? "none"}`,
    `Created: ${scorecard.createdAt}`,
    "",
    "## Boundary",
    scorecard.boundary,
    "",
    "## Authorities",
    `Allocation profile status: ${scorecard.allocationProfileStatus}`,
    `Financial authority: ${scorecard.financialReportingAuthority}`,
    `Securities authority: ${scorecard.securitiesAuthority}`,
    `Clinical execution authority: ${scorecard.clinicalExecutionAuthority}`,
    `Operator attestation: ${scorecard.operatorAttestation}`,
    "",
    "## Rolling-Quarter Metrics",
    ...scorecard.rollingQuarterMetrics.map(
      (metric) =>
        `- ${metric.label}: latest ${formatMetricValue(metric.latestValue)}, latest percent change ${formatMetricValue(metric.latestPercentChange)}%, improving ${metric.improvingCount}, stable ${metric.stableCount}, watch ${metric.watchCount}, insufficient ${metric.insufficientDataCount}, direction ${metric.direction}.`
    ),
    "",
    "## Finance Allocation Profile",
    `- Status: ${scorecard.financeAllocationProfile.status}`,
    `- Current methodology: ${scorecard.financeAllocationProfile.currentMethodology}`,
    `- Next gate: ${scorecard.financeAllocationProfile.nextGate}`,
    ...scorecard.financeAllocationProfile.components.map(
      (component) =>
        `- ${component.component}: ${component.status}. Boundary: ${component.boundary}`
    ),
    "",
    "## Buyer-Segment Cohorts",
    ...scorecard.buyerSegmentCohorts.map(
      (cohort) =>
        `- ${cohort.label}: ${cohort.motion} Proof use: ${cohort.proofUse} Boundary: ${cohort.boundary}`
    ),
    "",
    "## Competitive Advantages",
    ...scorecard.competitiveAdvantages.map((advantage) => `- ${advantage}`),
    "",
    "## Agent Improvement Priorities",
    ...scorecard.agentImprovementPriorities.map((priority) => `- ${priority}`),
    "",
    "## Strategic Actions",
    ...scorecard.strategicActions.map((action) => `- ${action}`),
    "",
    "## Recommendations",
    ...scorecard.recommendations.map((recommendation) => `- ${recommendation}`),
    "",
    "## Limitations",
    ...scorecard.limitations.map((limitation) => `- ${limitation}`),
    "",
    "## Review Note",
    scorecard.reviewNote || "No reviewer note supplied.",
    "",
    "## Required Next Review",
    "- Finance must approve full allocation methodology before margin or full cost-per-workflow reporting.",
    "- Counsel must approve any investor, securities, valuation, fundraising, PR, marketing, advertising, or external buyer use.",
    "- Clinical, privacy, security, customer, and regulatory review remain required before live clinical execution."
  ].join("\n");
}
