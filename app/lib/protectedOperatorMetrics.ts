export const protectedOperatorMetricCaptureStatus =
  "aal2-protected-operator-metric-capture-no-phi";
export const protectedOperatorMetricAttestation =
  "no-phi-finance-readiness-operator-metric";
export const protectedOperatorMetricDataBoundary =
  "synthetic-business-workflow-only";
export const protectedOperatorMetricFinancialAuthority =
  "not-audited-financial-report";
export const protectedOperatorMetricSecuritiesAuthority =
  "not-securities-offering-material";

export const protectedOperatorMetricBoundary =
  "Protected Operator Metric Capture stores tenant-scoped no-PHI operating metric metadata for Public Market Readiness, unit-economics discipline, and internal board review. It does not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, clinical validation, reimbursement assurance, compliance certification, production authorization, or live clinical execution approval.";

export const protectedOperatorMetricKeys = [
  "model-cost-usd",
  "review-time-minutes",
  "delivery-hours",
  "proof-packet-count",
  "workflow-volume"
] as const;

export type ProtectedOperatorMetricKey = (typeof protectedOperatorMetricKeys)[number];

export type ProtectedOperatorMetricUnit =
  | "usd"
  | "minutes"
  | "hours"
  | "count";

export type ProtectedOperatorMetricCatalogItem = {
  metricKey: ProtectedOperatorMetricKey;
  label: string;
  unit: ProtectedOperatorMetricUnit;
  publicMarketKpiId: string;
  description: string;
  proofRoute: string;
  costDiscipline: string;
};

export type ProtectedOperatorMetricInput = {
  metricKey: ProtectedOperatorMetricKey;
  metricValue: number;
  workflowKey: string;
  measurementWindowStart: string;
  measurementWindowEnd: string;
  sourceRoute: string;
  evidenceReference: string;
  operatorAttestation: typeof protectedOperatorMetricAttestation;
  dataBoundary: typeof protectedOperatorMetricDataBoundary;
};

export type ProtectedOperatorMetricRecord = ProtectedOperatorMetricInput & {
  id: string;
  tenantId: string;
  workspaceId: string;
  metricLabel: string;
  metricUnit: ProtectedOperatorMetricUnit;
  publicMarketKpiId: string;
  financialReportingAuthority: typeof protectedOperatorMetricFinancialAuthority;
  securitiesAuthority: typeof protectedOperatorMetricSecuritiesAuthority;
  createdBy: string;
  createdAt: string;
  boundary: string;
};

export type ProtectedOperatorMetricDashboard = {
  service: "scrimed-protected-operator-metrics";
  status: typeof protectedOperatorMetricCaptureStatus;
  metricCount: number;
  latestMetricAt: string | null;
  totals: Array<{
    metricKey: ProtectedOperatorMetricKey;
    label: string;
    unit: ProtectedOperatorMetricUnit;
    total: number;
    count: number;
    publicMarketKpiId: string;
  }>;
  metricCatalog: ProtectedOperatorMetricCatalogItem[];
  financeReadiness: {
    capturedMetricTypes: number;
    requiredMetricTypes: number;
    readyForFinanceReview: boolean;
    remainingMetricTypes: ProtectedOperatorMetricKey[];
  };
  safeWorkarounds: string[];
  boundary: string;
};

export const protectedOperatorMetricCatalog: ProtectedOperatorMetricCatalogItem[] = [
  {
    metricKey: "model-cost-usd",
    label: "Model cost",
    unit: "usd",
    publicMarketKpiId: "model-cost-per-trust-card",
    description: "Model, routing, retrieval, validation, and retry cost for a governed workflow window.",
    proofRoute: "/public-market-readiness",
    costDiscipline: "Use model routing, smaller task-specific models, retrieval-first execution, and retry budgets."
  },
  {
    metricKey: "review-time-minutes",
    label: "Human review time",
    unit: "minutes",
    publicMarketKpiId: "time-saved-per-clinician",
    description: "Operator, reviewer, clinician-adjacent, or sales-engineering review minutes for a governed workflow window.",
    proofRoute: "/pilot-workspace/access",
    costDiscipline: "Track review load so SCRIMED can price human-in-the-loop safety without hiding labor cost."
  },
  {
    metricKey: "delivery-hours",
    label: "Delivery hours",
    unit: "hours",
    publicMarketKpiId: "gross-margin-by-offer",
    description: "Implementation, QA, sales engineering, governance, or delivery hours spent on a scoped no-PHI workflow window.",
    proofRoute: "/pricing",
    costDiscipline: "Separate implementation services from platform license and protect enterprise gross margin."
  },
  {
    metricKey: "proof-packet-count",
    label: "Proof packet count",
    unit: "count",
    publicMarketKpiId: "compliance-log-completeness",
    description: "Audited or generated proof packets released for a governed workflow window.",
    proofRoute: "/qa-evidence",
    costDiscipline: "Treat proof production as a repeatable evidence factory, not one-off consulting labor."
  },
  {
    metricKey: "workflow-volume",
    label: "Workflow volume",
    unit: "count",
    publicMarketKpiId: "cost-per-workflow",
    description: "Completed synthetic, protected-pilot, or buyer-demo workflow packets in a measurement window.",
    proofRoute: "/workflows/results",
    costDiscipline: "Normalize operating cost by workflow output so SCRIMED can price against value and throughput."
  }
];

const metricCatalogByKey = new Map(
  protectedOperatorMetricCatalog.map((metric) => [metric.metricKey, metric])
);

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
  /social security/i
];

function isMetricKey(value: string): value is ProtectedOperatorMetricKey {
  return protectedOperatorMetricKeys.includes(value as ProtectedOperatorMetricKey);
}

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

export function validateProtectedOperatorMetricInput(value: unknown):
  | { ok: true; input: ProtectedOperatorMetricInput }
  | { ok: false; errors: string[] } {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
  const errors: string[] = [];
  const metricKey = safeShortText(record.metricKey, 64);
  const catalog = isMetricKey(metricKey) ? metricCatalogByKey.get(metricKey) : null;
  const metricValue = Number(record.metricValue);
  const workflowKey = safeShortText(record.workflowKey, 120);
  const sourceRoute = safeShortText(record.sourceRoute, 180);
  const evidenceReference = safeShortText(record.evidenceReference, 220);
  const windowStart = parseIsoDate(safeShortText(record.measurementWindowStart, 64));
  const windowEnd = parseIsoDate(safeShortText(record.measurementWindowEnd, 64));
  const attestation = safeShortText(record.operatorAttestation, 80);
  const dataBoundary = safeShortText(record.dataBoundary, 80);

  if (!catalog) {
    errors.push("Metric key must be one of the approved Public Market Readiness metric types.");
  }

  if (!Number.isFinite(metricValue) || metricValue < 0 || metricValue > 10000000) {
    errors.push("Metric value must be a finite non-negative number no greater than 10,000,000.");
  }

  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{2,119}$/.test(workflowKey)) {
    errors.push("Workflow key must be a short non-PHI operational identifier.");
  }

  if (!sourceRoute.startsWith("/") || sourceRoute.length > 180 || /\s/.test(sourceRoute)) {
    errors.push("Source route must be an internal SCRIMED proof route.");
  }

  if (evidenceReference.length < 3 || evidenceReference.length > 220) {
    errors.push("Evidence reference must be a short non-PHI proof reference.");
  }

  if (!windowStart || !windowEnd) {
    errors.push("Measurement window start and end must be valid timestamps.");
  } else {
    const startTime = Date.parse(windowStart);
    const endTime = Date.parse(windowEnd);
    const now = Date.now();

    if (startTime > endTime) {
      errors.push("Measurement window start must be before end.");
    }

    if (endTime > now + 5 * 60 * 1000) {
      errors.push("Measurement window cannot end in the future.");
    }

    if (endTime - startTime > 1000 * 60 * 60 * 24 * 90) {
      errors.push("Measurement window cannot exceed 90 days.");
    }

    if (startTime < now - 1000 * 60 * 60 * 24 * 365) {
      errors.push("Measurement window cannot start more than one year ago.");
    }
  }

  if (attestation !== protectedOperatorMetricAttestation) {
    errors.push("Operator metric capture requires the fixed no-PHI finance-readiness attestation.");
  }

  if (dataBoundary !== protectedOperatorMetricDataBoundary) {
    errors.push("Operator metric capture requires the synthetic business workflow data boundary.");
  }

  if (containsForbiddenContent(workflowKey, sourceRoute, evidenceReference)) {
    errors.push("Metric capture cannot contain PHI, credentials, tokens, diagnosis details, or payer member data.");
  }

  if (errors.length > 0 || !catalog || !windowStart || !windowEnd) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    input: {
      metricKey: metricKey as ProtectedOperatorMetricKey,
      metricValue,
      workflowKey,
      measurementWindowStart: windowStart,
      measurementWindowEnd: windowEnd,
      sourceRoute,
      evidenceReference,
      operatorAttestation: protectedOperatorMetricAttestation,
      dataBoundary: protectedOperatorMetricDataBoundary
    }
  };
}

export function metricCatalogItem(metricKey: ProtectedOperatorMetricKey) {
  return metricCatalogByKey.get(metricKey) ?? protectedOperatorMetricCatalog[0];
}

export function buildProtectedOperatorMetricDashboard(
  records: ProtectedOperatorMetricRecord[]
): ProtectedOperatorMetricDashboard {
  const totals = protectedOperatorMetricCatalog.map((metric) => {
    const matching = records.filter((record) => record.metricKey === metric.metricKey);

    return {
      metricKey: metric.metricKey,
      label: metric.label,
      unit: metric.unit,
      total: Number(matching.reduce((sum, record) => sum + record.metricValue, 0).toFixed(4)),
      count: matching.length,
      publicMarketKpiId: metric.publicMarketKpiId
    };
  });
  const capturedMetricKeys = new Set(records.map((record) => record.metricKey));
  const remainingMetricTypes = protectedOperatorMetricKeys.filter(
    (metricKey) => !capturedMetricKeys.has(metricKey)
  );

  return {
    service: "scrimed-protected-operator-metrics",
    status: protectedOperatorMetricCaptureStatus,
    metricCount: records.length,
    latestMetricAt: records[0]?.createdAt ?? null,
    totals,
    metricCatalog: protectedOperatorMetricCatalog,
    financeReadiness: {
      capturedMetricTypes: capturedMetricKeys.size,
      requiredMetricTypes: protectedOperatorMetricKeys.length,
      readyForFinanceReview: remainingMetricTypes.length === 0,
      remainingMetricTypes
    },
    safeWorkarounds: [
      "Use metric definitions from Public Market Readiness when the protected ledger is unavailable.",
      "Use external finance-reviewed spreadsheets for audited reporting until cost accounting is approved.",
      "Record only aggregate workflow and cost metadata; keep PHI, patient identifiers, payer member data, credentials, and source contracts outside SCRIMED."
    ],
    boundary: protectedOperatorMetricBoundary
  };
}
