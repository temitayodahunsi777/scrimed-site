import {
  protectedOperatorMetricBoundary,
  protectedOperatorMetricCatalog,
  protectedOperatorMetricKeys,
  type ProtectedOperatorMetricKey,
  type ProtectedOperatorMetricRecord,
  type ProtectedOperatorMetricUnit
} from "./protectedOperatorMetrics";

export const protectedMetricRollupStatus =
  "aal2-finance-reviewed-metric-rollups-no-phi";
export const protectedMetricRollupPacketProofStackStatus =
  "aal2-audited-board-metric-packets-no-phi";
export const protectedMetricRollupAttestation =
  "finance-reviewed-no-phi-operating-rollup";
export const protectedMetricRollupDataBoundary =
  "synthetic-business-workflow-only";
export const protectedMetricRollupFinancialAuthority =
  "not-audited-financial-report";
export const protectedMetricRollupSecuritiesAuthority =
  "not-securities-offering-material";
export const protectedMetricRollupClinicalAuthority =
  "not-authorized-live-care";

export const protectedMetricRollupBoundary =
  "Protected Metric Rollups convert tenant-scoped no-PHI operator metrics into internal board operating snapshots and audited packet downloads for Public Market Readiness. They do not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, legal advice, valuation assurance, clinical validation, reimbursement assurance, compliance certification, production authorization, or live clinical execution approval.";

export type ProtectedMetricRollupInput = {
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  reviewerAttestation: typeof protectedMetricRollupAttestation;
  dataBoundary: typeof protectedMetricRollupDataBoundary;
  reviewNote: string;
};

export type ProtectedMetricRollupTotal = {
  metricKey: ProtectedOperatorMetricKey;
  label: string;
  unit: ProtectedOperatorMetricUnit;
  total: number;
  count: number;
  publicMarketKpiId: string;
};

export type ProtectedMetricRollupRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  metricCount: number;
  capturedMetricTypes: number;
  requiredMetricTypes: number;
  readyForBoardReview: boolean;
  modelCostUsd: number;
  modelCostPerWorkflow: number | null;
  reviewTimeMinutes: number;
  reviewMinutesPerWorkflow: number | null;
  deliveryHours: number;
  deliveryHoursPerWorkflow: number | null;
  proofPacketCount: number;
  proofPacketsPerWorkflow: number | null;
  workflowVolume: number;
  costPerWorkflow: number | null;
  totals: ProtectedMetricRollupTotal[];
  recommendations: string[];
  limitations: string[];
  reviewerAttestation: typeof protectedMetricRollupAttestation;
  reviewNote: string;
  dataBoundary: typeof protectedMetricRollupDataBoundary;
  financialReportingAuthority: typeof protectedMetricRollupFinancialAuthority;
  securitiesAuthority: typeof protectedMetricRollupSecuritiesAuthority;
  clinicalExecutionAuthority: typeof protectedMetricRollupClinicalAuthority;
  createdBy: string;
  createdAt: string;
  boundary: string;
};

export type ProtectedMetricRollupDashboard = {
  service: "scrimed-protected-metric-rollups";
  status: typeof protectedMetricRollupStatus;
  packetStatus: typeof protectedMetricRollupPacketProofStackStatus;
  liveRollup: Omit<
    ProtectedMetricRollupRecord,
    "id" | "tenantId" | "workspaceId" | "createdBy" | "createdAt"
  >;
  snapshotCount: number;
  latestSnapshotAt: string | null;
  readyForBoardReview: boolean;
  nextBoardAction: string;
  safeWorkarounds: string[];
  boundary: string;
};

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

function parseIsoDate(value: string) {
  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function fixedNumber(value: number | null, precision = 4) {
  if (value === null || !Number.isFinite(value)) {
    return null;
  }

  return Number(value.toFixed(precision));
}

function ratio(numerator: number, denominator: number) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return null;
  }

  return fixedNumber(numerator / denominator);
}

function metricTotal(
  metricKey: ProtectedOperatorMetricKey,
  records: ProtectedOperatorMetricRecord[]
): ProtectedMetricRollupTotal {
  const catalog = protectedOperatorMetricCatalog.find((metric) => metric.metricKey === metricKey);
  const matching = records.filter((record) => record.metricKey === metricKey);

  return {
    metricKey,
    label: catalog?.label ?? metricKey,
    unit: catalog?.unit ?? "count",
    total: Number(matching.reduce((sum, record) => sum + record.metricValue, 0).toFixed(4)),
    count: matching.length,
    publicMarketKpiId: catalog?.publicMarketKpiId ?? "public-market-readiness"
  };
}

function recommendationsForRollup(
  totals: ProtectedMetricRollupTotal[],
  workflowVolume: number,
  readyForBoardReview: boolean
) {
  const captured = new Set(
    totals.filter((total) => total.count > 0).map((total) => total.metricKey)
  );
  const missing = protectedOperatorMetricKeys.filter((metricKey) => !captured.has(metricKey));
  const recommendations = [
    "Keep rollups internal until finance, counsel, and qualified advisors approve external use.",
    "Use this packet to guide pricing posture, buyer proof review, model-routing discipline, and delivery scope decisions."
  ];

  if (missing.length > 0) {
    recommendations.unshift(
      `Capture remaining no-PHI metric types before board review: ${missing.join(", ")}.`
    );
  }

  if (workflowVolume <= 0) {
    recommendations.unshift(
      "Capture workflow-volume before relying on per-workflow unit economics."
    );
  }

  if (readyForBoardReview) {
    recommendations.unshift(
      "Route this rollup to finance-reviewed monthly operating review before sharing with investors or enterprise buyers."
    );
  }

  return recommendations;
}

export function validateProtectedMetricRollupInput(value: unknown):
  | { ok: true; input: ProtectedMetricRollupInput }
  | { ok: false; errors: string[] } {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
  const errors: string[] = [];
  const reportingPeriodStart = parseIsoDate(
    safeShortText(record.reportingPeriodStart, 64)
  );
  const reportingPeriodEnd = parseIsoDate(safeShortText(record.reportingPeriodEnd, 64));
  const reviewerAttestation = safeShortText(record.reviewerAttestation, 90);
  const dataBoundary = safeShortText(record.dataBoundary, 90);
  const reviewNote = safeShortText(record.reviewNote, 280);

  if (!reportingPeriodStart || !reportingPeriodEnd) {
    errors.push("Reporting period start and end must be valid timestamps.");
  } else {
    const startTime = Date.parse(reportingPeriodStart);
    const endTime = Date.parse(reportingPeriodEnd);
    const now = Date.now();

    if (startTime > endTime) {
      errors.push("Reporting period start must be before end.");
    }

    if (endTime > now + 5 * 60 * 1000) {
      errors.push("Reporting period cannot end in the future.");
    }

    if (endTime - startTime > 1000 * 60 * 60 * 24 * 365) {
      errors.push("Reporting period cannot exceed 365 days.");
    }

    if (startTime < now - 1000 * 60 * 60 * 24 * 365) {
      errors.push("Reporting period cannot start more than one year ago.");
    }
  }

  if (reviewerAttestation !== protectedMetricRollupAttestation) {
    errors.push("Metric rollups require the fixed finance-reviewed no-PHI attestation.");
  }

  if (dataBoundary !== protectedMetricRollupDataBoundary) {
    errors.push("Metric rollups require the synthetic business workflow data boundary.");
  }

  if (reviewNote.length > 280) {
    errors.push("Review note must stay under 280 characters.");
  }

  if (containsForbiddenContent(reviewNote)) {
    errors.push("Review note cannot contain PHI, credentials, patient identifiers, payer member data, or external financial claims.");
  }

  if (errors.length > 0 || !reportingPeriodStart || !reportingPeriodEnd) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    input: {
      reportingPeriodStart,
      reportingPeriodEnd,
      reviewerAttestation: protectedMetricRollupAttestation,
      dataBoundary: protectedMetricRollupDataBoundary,
      reviewNote
    }
  };
}

export function deriveProtectedMetricRollup(
  records: ProtectedOperatorMetricRecord[],
  input?: ProtectedMetricRollupInput
): Omit<
  ProtectedMetricRollupRecord,
  "id" | "tenantId" | "workspaceId" | "createdBy" | "createdAt"
> {
  const totals = protectedOperatorMetricKeys.map((metricKey) => metricTotal(metricKey, records));
  const totalByKey = new Map(totals.map((total) => [total.metricKey, total.total]));
  const modelCostUsd = totalByKey.get("model-cost-usd") ?? 0;
  const reviewTimeMinutes = totalByKey.get("review-time-minutes") ?? 0;
  const deliveryHours = totalByKey.get("delivery-hours") ?? 0;
  const proofPacketCount = totalByKey.get("proof-packet-count") ?? 0;
  const workflowVolume = totalByKey.get("workflow-volume") ?? 0;
  const capturedMetricTypes = totals.filter((total) => total.count > 0).length;
  const readyForBoardReview =
    capturedMetricTypes === protectedOperatorMetricKeys.length && workflowVolume > 0;
  const start =
    input?.reportingPeriodStart ??
    records.at(-1)?.measurementWindowStart ??
    new Date().toISOString();
  const end =
    input?.reportingPeriodEnd ??
    records[0]?.measurementWindowEnd ??
    new Date().toISOString();

  return {
    reportingPeriodStart: start,
    reportingPeriodEnd: end,
    metricCount: records.length,
    capturedMetricTypes,
    requiredMetricTypes: protectedOperatorMetricKeys.length,
    readyForBoardReview,
    modelCostUsd: fixedNumber(modelCostUsd) ?? 0,
    modelCostPerWorkflow: ratio(modelCostUsd, workflowVolume),
    reviewTimeMinutes: fixedNumber(reviewTimeMinutes) ?? 0,
    reviewMinutesPerWorkflow: ratio(reviewTimeMinutes, workflowVolume),
    deliveryHours: fixedNumber(deliveryHours) ?? 0,
    deliveryHoursPerWorkflow: ratio(deliveryHours, workflowVolume),
    proofPacketCount: fixedNumber(proofPacketCount) ?? 0,
    proofPacketsPerWorkflow: ratio(proofPacketCount, workflowVolume),
    workflowVolume: fixedNumber(workflowVolume) ?? 0,
    costPerWorkflow: ratio(modelCostUsd, workflowVolume),
    totals,
    recommendations: recommendationsForRollup(totals, workflowVolume, readyForBoardReview),
    limitations: [
      protectedOperatorMetricBoundary,
      "Current rollups use aggregate operating metadata only and exclude labor-dollar allocation until finance-reviewed cost accounting exists.",
      "Per-workflow cost is model-cost-only until infrastructure, support, delivery, and review-labor allocations are approved.",
      "Rollups are internal operating evidence, not audited financial reporting, securities offering material, investment advice, valuation assurance, clinical validation, reimbursement assurance, or live care authorization."
    ],
    reviewerAttestation:
      input?.reviewerAttestation ?? protectedMetricRollupAttestation,
    reviewNote: input?.reviewNote ?? "",
    dataBoundary: input?.dataBoundary ?? protectedMetricRollupDataBoundary,
    financialReportingAuthority: protectedMetricRollupFinancialAuthority,
    securitiesAuthority: protectedMetricRollupSecuritiesAuthority,
    clinicalExecutionAuthority: protectedMetricRollupClinicalAuthority,
    boundary: protectedMetricRollupBoundary
  };
}

export function buildProtectedMetricRollupDashboard(
  records: ProtectedOperatorMetricRecord[],
  snapshots: ProtectedMetricRollupRecord[]
): ProtectedMetricRollupDashboard {
  const liveRollup = deriveProtectedMetricRollup(records);
  const latestSnapshot = snapshots[0] ?? null;

  return {
    service: "scrimed-protected-metric-rollups",
    status: protectedMetricRollupStatus,
    packetStatus: protectedMetricRollupPacketProofStackStatus,
    liveRollup,
    snapshotCount: snapshots.length,
    latestSnapshotAt: latestSnapshot?.createdAt ?? null,
    readyForBoardReview: latestSnapshot?.readyForBoardReview ?? liveRollup.readyForBoardReview,
    nextBoardAction: latestSnapshot?.readyForBoardReview
      ? "Use the latest finance-reviewed no-PHI snapshot for internal board operating review."
      : "Complete missing protected operator metric coverage before board packet reliance.",
    safeWorkarounds: [
      "Use the Public Market Readiness KPI definitions when durable rollup storage is unavailable.",
      "Use external finance-reviewed spreadsheets for audited reporting until accounting controls are approved.",
      "Share only counsel-reviewed summaries externally; keep these packets internal until securities and finance review is complete."
    ],
    boundary: protectedMetricRollupBoundary
  };
}

function formatOptionalMetric(value: number | null, suffix = "") {
  if (value === null) {
    return "pending denominator";
  }

  return `${value.toLocaleString(undefined, { maximumFractionDigits: 4 })}${suffix}`;
}

export function buildProtectedMetricBoardPacket(
  snapshot: ProtectedMetricRollupRecord,
  options: {
    workspaceSlug: string;
    workspaceName: string;
    auditEventId?: string | null;
  }
) {
  return [
    "# SCRIMED Protected Metric Board Packet",
    "",
    `Workspace: ${options.workspaceName} (${options.workspaceSlug})`,
    `Snapshot ID: ${snapshot.id}`,
    `Packet audit event: ${options.auditEventId ?? "pending"}`,
    `Reporting period: ${snapshot.reportingPeriodStart} to ${snapshot.reportingPeriodEnd}`,
    `Created: ${snapshot.createdAt}`,
    "",
    "## Boundary",
    snapshot.boundary,
    "",
    `Financial authority: ${snapshot.financialReportingAuthority}`,
    `Securities authority: ${snapshot.securitiesAuthority}`,
    `Clinical execution authority: ${snapshot.clinicalExecutionAuthority}`,
    `Data boundary: ${snapshot.dataBoundary}`,
    `Reviewer attestation: ${snapshot.reviewerAttestation}`,
    "",
    "## Operating Rollup",
    `Metric count: ${snapshot.metricCount}`,
    `Metric coverage: ${snapshot.capturedMetricTypes}/${snapshot.requiredMetricTypes}`,
    `Ready for board review: ${snapshot.readyForBoardReview ? "yes" : "no"}`,
    `Model cost: $${snapshot.modelCostUsd.toLocaleString(undefined, { maximumFractionDigits: 4 })}`,
    `Workflow volume: ${snapshot.workflowVolume.toLocaleString(undefined, { maximumFractionDigits: 4 })}`,
    `Model cost per workflow: $${formatOptionalMetric(snapshot.modelCostPerWorkflow)}`,
    `Review minutes per workflow: ${formatOptionalMetric(snapshot.reviewMinutesPerWorkflow)}`,
    `Delivery hours per workflow: ${formatOptionalMetric(snapshot.deliveryHoursPerWorkflow)}`,
    `Proof packets per workflow: ${formatOptionalMetric(snapshot.proofPacketsPerWorkflow)}`,
    "",
    "## Metric Totals",
    ...snapshot.totals.map(
      (total) =>
        `- ${total.label} (${total.metricKey}): ${total.total.toLocaleString(undefined, {
          maximumFractionDigits: 4
        })} ${total.unit} across ${total.count} entries. KPI: ${total.publicMarketKpiId}`
    ),
    "",
    "## Recommendations",
    ...snapshot.recommendations.map((recommendation) => `- ${recommendation}`),
    "",
    "## Limitations",
    ...snapshot.limitations.map((limitation) => `- ${limitation}`),
    "",
    "## Review Note",
    snapshot.reviewNote || "No reviewer note supplied.",
    "",
    "## Required Next Review",
    "- Finance review is required before audited reporting or investor diligence use.",
    "- Counsel review is required before external fundraising, securities, valuation, or public claims use.",
    "- Clinical, privacy, security, customer, and regulatory review remain required before live clinical execution."
  ].join("\n");
}
