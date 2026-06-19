import {
  protectedMetricRollupBoundary,
  protectedMetricRollupClinicalAuthority,
  protectedMetricRollupDataBoundary,
  protectedMetricRollupFinancialAuthority,
  protectedMetricRollupSecuritiesAuthority,
  type ProtectedMetricRollupRecord
} from "./protectedMetricRollups";

export const protectedMetricTrendReviewStatus =
  "aal2-board-trend-review-no-phi";
export const protectedMetricTrendPacketProofStackStatus =
  "aal2-audited-board-trend-packets-no-phi";
export const protectedMetricTrendReviewAttestation =
  "finance-reviewed-no-phi-board-trend";
export const protectedMetricTrendDataBoundary =
  protectedMetricRollupDataBoundary;
export const protectedMetricTrendCostAllocationPolicy =
  "model-cost-only-finance-allocation-pending";
export const protectedMetricTrendCostAllocationStatus =
  "finance-approved-cost-allocation-required";

export const protectedMetricTrendBoundary =
  "Protected Metric Trend Reviews compare no-PHI protected rollup snapshots for internal monthly operating review, cost discipline, reach expansion planning, competitive advantage tracking, and agent improvement loops. They do not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, legal advice, valuation assurance, clinical validation, reimbursement assurance, compliance certification, production authorization, or live clinical execution approval.";

export type ProtectedMetricTrendReviewInput = {
  currentSnapshotId: string;
  comparisonSnapshotId: string;
  trendPeriodLabel: string;
  reviewerAttestation: typeof protectedMetricTrendReviewAttestation;
  dataBoundary: typeof protectedMetricTrendDataBoundary;
  costAllocationPolicy: typeof protectedMetricTrendCostAllocationPolicy;
  reviewNote: string;
};

export type ProtectedMetricTrendMetric = {
  metricId:
    | "model-cost-per-workflow"
    | "review-minutes-per-workflow"
    | "delivery-hours-per-workflow"
    | "proof-packets-per-workflow"
    | "workflow-volume";
  label: string;
  current: number | null;
  comparison: number | null;
  delta: number | null;
  percentChange: number | null;
  direction: "lower-is-better" | "higher-is-better";
  state: "improving" | "stable" | "watch" | "insufficient-data";
};

export type ProtectedMetricTrendReviewRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  currentSnapshotId: string;
  comparisonSnapshotId: string;
  trendPeriodLabel: string;
  boardTrendState: "improving" | "stable" | "watch" | "insufficient-data";
  trendMetrics: ProtectedMetricTrendMetric[];
  reachExpansionSignals: string[];
  competitiveAdvantages: string[];
  agentImprovementActions: string[];
  recommendations: string[];
  limitations: string[];
  reviewerAttestation: typeof protectedMetricTrendReviewAttestation;
  reviewNote: string;
  dataBoundary: typeof protectedMetricTrendDataBoundary;
  costAllocationPolicy: typeof protectedMetricTrendCostAllocationPolicy;
  costAllocationStatus: typeof protectedMetricTrendCostAllocationStatus;
  financialReportingAuthority: typeof protectedMetricRollupFinancialAuthority;
  securitiesAuthority: typeof protectedMetricRollupSecuritiesAuthority;
  clinicalExecutionAuthority: typeof protectedMetricRollupClinicalAuthority;
  createdBy: string;
  createdAt: string;
  boundary: string;
};

export type ProtectedMetricTrendDashboard = {
  service: "scrimed-protected-metric-trends";
  status: typeof protectedMetricTrendReviewStatus;
  packetStatus: typeof protectedMetricTrendPacketProofStackStatus;
  reviewCount: number;
  latestReviewAt: string | null;
  latestTrendState: ProtectedMetricTrendReviewRecord["boardTrendState"] | "pending";
  availableSnapshotCount: number;
  trendReady: boolean;
  nextTrendAction: string;
  reachExpansionSignals: string[];
  competitiveAdvantages: string[];
  agentImprovementActions: string[];
  safeWorkarounds: string[];
  boundary: string;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
  /valuation guarantee/i
];

function safeShortText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength + 1) : "";
}

function containsForbiddenContent(...values: string[]) {
  const candidate = values.join(" ");

  return forbiddenContentPatterns.some((pattern) => pattern.test(candidate));
}

function fixedNumber(value: number | null, precision = 4) {
  if (value === null || !Number.isFinite(value)) {
    return null;
  }

  return Number(value.toFixed(precision));
}

function percentChange(current: number | null, comparison: number | null) {
  if (
    current === null ||
    comparison === null ||
    !Number.isFinite(current) ||
    !Number.isFinite(comparison) ||
    comparison === 0
  ) {
    return null;
  }

  return fixedNumber(((current - comparison) / comparison) * 100);
}

function metricState(
  current: number | null,
  comparison: number | null,
  direction: ProtectedMetricTrendMetric["direction"]
): ProtectedMetricTrendMetric["state"] {
  if (current === null || comparison === null || comparison === 0) {
    return "insufficient-data";
  }

  const delta = current - comparison;
  const percent = Math.abs(((current - comparison) / comparison) * 100);

  if (percent < 2) {
    return "stable";
  }

  if (direction === "lower-is-better") {
    return delta < 0 ? "improving" : "watch";
  }

  return delta > 0 ? "improving" : "watch";
}

function trendMetric(
  metricId: ProtectedMetricTrendMetric["metricId"],
  label: string,
  current: number | null,
  comparison: number | null,
  direction: ProtectedMetricTrendMetric["direction"]
): ProtectedMetricTrendMetric {
  return {
    metricId,
    label,
    current,
    comparison,
    delta:
      current === null || comparison === null
        ? null
        : fixedNumber(current - comparison),
    percentChange: percentChange(current, comparison),
    direction,
    state: metricState(current, comparison, direction)
  };
}

function boardTrendState(metrics: ProtectedMetricTrendMetric[]) {
  if (metrics.some((metric) => metric.state === "insufficient-data")) {
    return "insufficient-data" as const;
  }

  const watchCount = metrics.filter((metric) => metric.state === "watch").length;
  const improvingCount = metrics.filter((metric) => metric.state === "improving").length;

  if (watchCount >= 2) {
    return "watch" as const;
  }

  if (improvingCount >= 2 && watchCount === 0) {
    return "improving" as const;
  }

  return "stable" as const;
}

export function validateProtectedMetricTrendReviewInput(value: unknown):
  | { ok: true; input: ProtectedMetricTrendReviewInput }
  | { ok: false; errors: string[] } {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
  const errors: string[] = [];
  const currentSnapshotId = safeShortText(record.currentSnapshotId, 64);
  const comparisonSnapshotId = safeShortText(record.comparisonSnapshotId, 64);
  const trendPeriodLabel = safeShortText(record.trendPeriodLabel, 96);
  const reviewerAttestation = safeShortText(record.reviewerAttestation, 90);
  const dataBoundary = safeShortText(record.dataBoundary, 90);
  const costAllocationPolicy = safeShortText(record.costAllocationPolicy, 90);
  const reviewNote = safeShortText(record.reviewNote, 280);

  if (!uuidPattern.test(currentSnapshotId)) {
    errors.push("Current snapshot id must be a valid protected rollup snapshot id.");
  }

  if (!uuidPattern.test(comparisonSnapshotId)) {
    errors.push("Comparison snapshot id must be a valid protected rollup snapshot id.");
  }

  if (currentSnapshotId === comparisonSnapshotId) {
    errors.push("Trend review requires two different protected rollup snapshots.");
  }

  if (!/^[A-Za-z0-9][A-Za-z0-9 ._:-]{2,95}$/.test(trendPeriodLabel)) {
    errors.push("Trend period label must be a short non-PHI operating review label.");
  }

  if (reviewerAttestation !== protectedMetricTrendReviewAttestation) {
    errors.push("Trend reviews require the fixed finance-reviewed no-PHI board trend attestation.");
  }

  if (dataBoundary !== protectedMetricTrendDataBoundary) {
    errors.push("Trend reviews require the synthetic business workflow data boundary.");
  }

  if (costAllocationPolicy !== protectedMetricTrendCostAllocationPolicy) {
    errors.push("Trend reviews require the model-cost-only finance-allocation-pending policy.");
  }

  if (reviewNote.length > 280) {
    errors.push("Review note must stay under 280 characters.");
  }

  if (containsForbiddenContent(trendPeriodLabel, reviewNote)) {
    errors.push("Trend review metadata cannot contain PHI, credentials, patient identifiers, payer member data, or external financial claims.");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    input: {
      currentSnapshotId,
      comparisonSnapshotId,
      trendPeriodLabel,
      reviewerAttestation: protectedMetricTrendReviewAttestation,
      dataBoundary: protectedMetricTrendDataBoundary,
      costAllocationPolicy: protectedMetricTrendCostAllocationPolicy,
      reviewNote
    }
  };
}

export function deriveProtectedMetricTrendReview(
  current: ProtectedMetricRollupRecord,
  comparison: ProtectedMetricRollupRecord,
  input: ProtectedMetricTrendReviewInput
): Omit<
  ProtectedMetricTrendReviewRecord,
  "id" | "tenantId" | "workspaceId" | "createdBy" | "createdAt"
> {
  const trendMetrics = [
    trendMetric(
      "model-cost-per-workflow",
      "Model cost per workflow",
      current.modelCostPerWorkflow,
      comparison.modelCostPerWorkflow,
      "lower-is-better"
    ),
    trendMetric(
      "review-minutes-per-workflow",
      "Review minutes per workflow",
      current.reviewMinutesPerWorkflow,
      comparison.reviewMinutesPerWorkflow,
      "lower-is-better"
    ),
    trendMetric(
      "delivery-hours-per-workflow",
      "Delivery hours per workflow",
      current.deliveryHoursPerWorkflow,
      comparison.deliveryHoursPerWorkflow,
      "lower-is-better"
    ),
    trendMetric(
      "proof-packets-per-workflow",
      "Proof packets per workflow",
      current.proofPacketsPerWorkflow,
      comparison.proofPacketsPerWorkflow,
      "higher-is-better"
    ),
    trendMetric(
      "workflow-volume",
      "Workflow volume",
      current.workflowVolume,
      comparison.workflowVolume,
      "higher-is-better"
    )
  ];
  const state = boardTrendState(trendMetrics);

  return {
    currentSnapshotId: current.id,
    comparisonSnapshotId: comparison.id,
    trendPeriodLabel: input.trendPeriodLabel,
    boardTrendState: state,
    trendMetrics,
    reachExpansionSignals: [
      "Package repeatable low-friction workflow patterns for provider, payer, employer, government, and global health buyers.",
      "Prioritize regions and buyer segments where protected-pilot proof can be sold without PHI movement or production clinical execution.",
      "Use trend packets as internal operating evidence for channel partnerships, investor updates, and enterprise account expansion after counsel review."
    ],
    competitiveAdvantages: [
      "Workflow-owned unit economics rather than generic model usage metrics.",
      "AAL2 protected, no-PHI, write-before-release board evidence.",
      "Model-cost discipline with open/closed model optionality and task-specific agent routing.",
      "Trust, governance, audit, and human-review boundaries built into the product surface."
    ],
    agentImprovementActions: [
      "Route workflows with rising review minutes into specialized TrustQA and documentation-review agents.",
      "Promote low-cost high-proof workflows into reusable agent playbooks and buyer demo templates.",
      "Feed variance signals into Agent Commander priorities, model-router budgets, and workflow retry limits.",
      "Escalate degraded metrics to human review instead of increasing autonomous execution."
    ],
    recommendations: [
      state === "watch"
        ? "Open a finance/product operating review before expanding this workflow pattern."
        : "Use this trend review to prioritize scalable workflow packages and repeatable buyer proof.",
      "Keep all external use behind finance, counsel, privacy, security, and executive approval.",
      "Add approved labor, infrastructure, support, and implementation allocation before reporting gross margin or full cost per workflow."
    ],
    limitations: [
      protectedMetricRollupBoundary,
      "Trend reviews compare protected no-PHI rollup snapshots only and do not prove clinical outcomes, reimbursement outcomes, or audited financial performance.",
      "Cost allocation remains model-cost-only until finance approves labor, infrastructure, support, delivery, and reviewer allocation methodology.",
      "Reach and competitive signals are internal strategy recommendations, not investor solicitation, revenue guarantee, market-share claim, or legal advice."
    ],
    reviewerAttestation: protectedMetricTrendReviewAttestation,
    reviewNote: input.reviewNote,
    dataBoundary: protectedMetricTrendDataBoundary,
    costAllocationPolicy: protectedMetricTrendCostAllocationPolicy,
    costAllocationStatus: protectedMetricTrendCostAllocationStatus,
    financialReportingAuthority: protectedMetricRollupFinancialAuthority,
    securitiesAuthority: protectedMetricRollupSecuritiesAuthority,
    clinicalExecutionAuthority: protectedMetricRollupClinicalAuthority,
    boundary: protectedMetricTrendBoundary
  };
}

export function buildProtectedMetricTrendDashboard(
  snapshots: ProtectedMetricRollupRecord[],
  reviews: ProtectedMetricTrendReviewRecord[]
): ProtectedMetricTrendDashboard {
  const latestReview = reviews[0] ?? null;
  const trendReady = snapshots.length >= 2;

  return {
    service: "scrimed-protected-metric-trends",
    status: protectedMetricTrendReviewStatus,
    packetStatus: protectedMetricTrendPacketProofStackStatus,
    reviewCount: reviews.length,
    latestReviewAt: latestReview?.createdAt ?? null,
    latestTrendState: latestReview?.boardTrendState ?? "pending",
    availableSnapshotCount: snapshots.length,
    trendReady,
    nextTrendAction: trendReady
      ? "Create a protected trend review from two no-PHI rollup snapshots and use it for internal monthly operating review."
      : "Create at least two protected rollup snapshots before trend comparison.",
    reachExpansionSignals: latestReview?.reachExpansionSignals ?? [
      "Use protected rollup evidence to identify repeatable workflows that can expand into provider, payer, employer, government, and global health channels."
    ],
    competitiveAdvantages: latestReview?.competitiveAdvantages ?? [
      "SCRIMED turns healthcare workflow evidence, governance, and cost discipline into protected operating intelligence."
    ],
    agentImprovementActions: latestReview?.agentImprovementActions ?? [
      "Use variance signals to tune Agent Commander priorities, model-routing budgets, and human-review checkpoints."
    ],
    safeWorkarounds: [
      "Use rollup snapshots and external finance-reviewed spreadsheets when durable trend review storage is unavailable.",
      "Keep trend packets internal until finance and counsel approve external materials.",
      "Use model-cost-only trend analysis until full cost allocation is reviewed and approved."
    ],
    boundary: protectedMetricTrendBoundary
  };
}

function formatMetricValue(value: number | null) {
  if (value === null) {
    return "pending";
  }

  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function buildProtectedMetricTrendPacket(
  review: ProtectedMetricTrendReviewRecord,
  options: {
    workspaceSlug: string;
    workspaceName: string;
    auditEventId?: string | null;
  }
) {
  return [
    "# SCRIMED Protected Metric Trend Packet",
    "",
    `Workspace: ${options.workspaceName} (${options.workspaceSlug})`,
    `Review ID: ${review.id}`,
    `Packet audit event: ${options.auditEventId ?? "pending"}`,
    `Trend period: ${review.trendPeriodLabel}`,
    `Current snapshot: ${review.currentSnapshotId}`,
    `Comparison snapshot: ${review.comparisonSnapshotId}`,
    `Created: ${review.createdAt}`,
    "",
    "## Boundary",
    review.boundary,
    "",
    `Board trend state: ${review.boardTrendState}`,
    `Cost allocation policy: ${review.costAllocationPolicy}`,
    `Cost allocation status: ${review.costAllocationStatus}`,
    `Financial authority: ${review.financialReportingAuthority}`,
    `Securities authority: ${review.securitiesAuthority}`,
    `Clinical execution authority: ${review.clinicalExecutionAuthority}`,
    `Reviewer attestation: ${review.reviewerAttestation}`,
    "",
    "## Variance Metrics",
    ...review.trendMetrics.map(
      (metric) =>
        `- ${metric.label}: current ${formatMetricValue(metric.current)}, comparison ${formatMetricValue(metric.comparison)}, delta ${formatMetricValue(metric.delta)}, percent change ${formatMetricValue(metric.percentChange)}%, state ${metric.state}, direction ${metric.direction}.`
    ),
    "",
    "## Reach Expansion Signals",
    ...review.reachExpansionSignals.map((signal) => `- ${signal}`),
    "",
    "## Competitive Advantages",
    ...review.competitiveAdvantages.map((advantage) => `- ${advantage}`),
    "",
    "## Agent Improvement Actions",
    ...review.agentImprovementActions.map((action) => `- ${action}`),
    "",
    "## Recommendations",
    ...review.recommendations.map((recommendation) => `- ${recommendation}`),
    "",
    "## Limitations",
    ...review.limitations.map((limitation) => `- ${limitation}`),
    "",
    "## Review Note",
    review.reviewNote || "No reviewer note supplied.",
    "",
    "## Required Next Review",
    "- Finance must approve full cost allocation before gross margin or complete cost-per-workflow reporting.",
    "- Counsel must approve any investor, securities, valuation, fundraising, PR, marketing, or external buyer use.",
    "- Clinical, privacy, security, customer, and regulatory review remain required before live clinical execution."
  ].join("\n");
}
