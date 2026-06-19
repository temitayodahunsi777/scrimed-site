"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  protectedOperatorMetricAttestation,
  protectedOperatorMetricCatalog,
  protectedOperatorMetricDataBoundary,
  type ProtectedOperatorMetricDashboard,
  type ProtectedOperatorMetricInput,
  type ProtectedOperatorMetricKey,
  type ProtectedOperatorMetricRecord
} from "../lib/protectedOperatorMetrics";

type FormState = {
  metricKey: ProtectedOperatorMetricKey;
  metricValue: string;
  workflowKey: string;
  measurementWindowStart: string;
  measurementWindowEnd: string;
  sourceRoute: string;
  evidenceReference: string;
};

function toDatetimeLocal(value: Date) {
  return value.toISOString().slice(0, 16);
}

function defaultFormState(): FormState {
  const now = new Date();
  const start = new Date(now.getTime() - 60 * 60 * 1000);

  return {
    metricKey: "workflow-volume",
    metricValue: "1",
    workflowKey: "public-market-readiness",
    measurementWindowStart: toDatetimeLocal(start),
    measurementWindowEnd: toDatetimeLocal(now),
    sourceRoute: "/public-market-readiness",
    evidenceReference: "protected-operator-metric-window"
  };
}

function isoFromDatetimeLocal(value: string) {
  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : value;
}

function formatMetricValue(value: number, unit: string) {
  if (unit === "usd") {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }

  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unit}`;
}

function readinessClass(ready: boolean) {
  return ready ? "status-pill status-pill-pass" : "status-pill status-pill-warn";
}

export default function ProtectedOperatorMetricsPanel({
  busy,
  dashboard,
  metrics,
  onRecordMetric
}: {
  busy: boolean;
  dashboard: ProtectedOperatorMetricDashboard | null;
  metrics: ProtectedOperatorMetricRecord[];
  onRecordMetric: (input: ProtectedOperatorMetricInput) => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(() => defaultFormState());
  const latestMetric = metrics[0] ?? null;
  const selectedMetric = useMemo(
    () => protectedOperatorMetricCatalog.find((metric) => metric.metricKey === form.metricKey),
    [form.metricKey]
  );
  const totals = dashboard?.totals ?? [];
  const remainingMetricTypes = dashboard?.financeReadiness.remainingMetricTypes ?? [];

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitMetric(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onRecordMetric({
      metricKey: form.metricKey,
      metricValue: Number(form.metricValue),
      workflowKey: form.workflowKey.trim(),
      measurementWindowStart: isoFromDatetimeLocal(form.measurementWindowStart),
      measurementWindowEnd: isoFromDatetimeLocal(form.measurementWindowEnd),
      sourceRoute: form.sourceRoute.trim(),
      evidenceReference: form.evidenceReference.trim(),
      operatorAttestation: protectedOperatorMetricAttestation,
      dataBoundary: protectedOperatorMetricDataBoundary
    });
  }

  return (
    <section className="table-section" aria-label="Protected operator metric capture">
      <div className="section-heading">
        <p className="eyebrow">Public Market Operator Metrics</p>
        <h2>Capture no-PHI unit-economics signals for buyer, board, and finance review.</h2>
        <p className="section-copy">
          This protected AAL2 ledger records aggregate workflow operating metadata only. It supports cost discipline,
          proof-stack visibility, pricing review, and investor-readiness operating cadence without becoming audited
          financial reporting, securities material, clinical validation, reimbursement assurance, or live care authority.
        </p>
      </div>

      <div className="hub-summary demo-readiness-summary" aria-label="Operator metric summary">
        <article>
          <span>Captured metrics</span>
          <strong>{dashboard?.metricCount ?? metrics.length}</strong>
        </article>
        <article>
          <span>Metric coverage</span>
          <strong className={readinessClass(Boolean(dashboard?.financeReadiness.readyForFinanceReview))}>
            {dashboard
              ? `${dashboard.financeReadiness.capturedMetricTypes}/${dashboard.financeReadiness.requiredMetricTypes}`
              : "loading"}
          </strong>
        </article>
        <article>
          <span>Latest capture</span>
          <strong>{latestMetric?.createdAt ?? "pending"}</strong>
        </article>
        <article>
          <span>Authority</span>
          <strong>{latestMetric?.financialReportingAuthority ?? "not-audited-financial-report"}</strong>
        </article>
      </div>

      <form className="evaluation-form" onSubmit={submitMetric}>
        <div className="form-section">
          <label className="form-field">
            <span>Metric type</span>
            <select
              onChange={(event) =>
                updateField("metricKey", event.target.value as ProtectedOperatorMetricKey)
              }
              value={form.metricKey}
            >
              {protectedOperatorMetricCatalog.map((metric) => (
                <option key={metric.metricKey} value={metric.metricKey}>
                  {metric.label}
                </option>
              ))}
            </select>
            <small>{selectedMetric?.description}</small>
          </label>
          <label className="form-field">
            <span>Metric value</span>
            <input
              inputMode="decimal"
              min="0"
              onChange={(event) => updateField("metricValue", event.target.value)}
              required
              step="0.0001"
              type="number"
              value={form.metricValue}
            />
            <small>{selectedMetric ? `Unit: ${selectedMetric.unit}` : "Use the approved metric unit."}</small>
          </label>
          <label className="form-field">
            <span>Workflow key</span>
            <input
              onChange={(event) => updateField("workflowKey", event.target.value)}
              required
              value={form.workflowKey}
            />
            <small>Use a short operational key, not a patient, member, payer, or contract identifier.</small>
          </label>
          <label className="form-field">
            <span>Source route</span>
            <input
              onChange={(event) => updateField("sourceRoute", event.target.value)}
              required
              value={form.sourceRoute}
            />
            <small>{selectedMetric ? `Suggested proof route: ${selectedMetric.proofRoute}` : ""}</small>
          </label>
          <label className="form-field">
            <span>Window start</span>
            <input
              onChange={(event) => updateField("measurementWindowStart", event.target.value)}
              required
              type="datetime-local"
              value={form.measurementWindowStart}
            />
          </label>
          <label className="form-field">
            <span>Window end</span>
            <input
              onChange={(event) => updateField("measurementWindowEnd", event.target.value)}
              required
              type="datetime-local"
              value={form.measurementWindowEnd}
            />
          </label>
          <label className="form-field form-field-wide">
            <span>Evidence reference</span>
            <input
              onChange={(event) => updateField("evidenceReference", event.target.value)}
              required
              value={form.evidenceReference}
            />
            <small>Reference the no-PHI proof artifact, packet, workflow window, or board-review note.</small>
          </label>
        </div>
        <div className="form-actions">
          <button className="primary-action" disabled={busy} type="submit">
            {busy ? "Recording Metric" : "Record Protected Metric"}
          </button>
        </div>
      </form>

      <div className="agent-readiness-grid demo-readiness-brief" aria-label="Operator metric totals">
        {totals.map((metric) => (
          <article key={metric.metricKey}>
            <span>{metric.publicMarketKpiId}</span>
            <strong>{metric.label}</strong>
            <p>{formatMetricValue(metric.total, metric.unit)} captured across {metric.count} entries.</p>
          </article>
        ))}
      </div>

      {remainingMetricTypes.length > 0 ? (
        <article className="module-row">
          <div>
            <span>finance review gap</span>
            <h2>Remaining metric types need at least one no-PHI capture.</h2>
          </div>
          <ul className="compact-list">
            {remainingMetricTypes.map((metricKey) => (
              <li key={metricKey}>{metricKey}</li>
            ))}
          </ul>
        </article>
      ) : null}

      <div className="demo-runbook" aria-label="Protected metric workarounds">
        <div className="section-heading">
          <p className="eyebrow">Safe workarounds</p>
          <h2>Keep finance, legal, and privacy boundaries explicit while capture matures.</h2>
        </div>
        {(dashboard?.safeWorkarounds ?? []).map((workaround) => (
          <article className="module-row" key={workaround}>
            <div>
              <span>workaround</span>
              <h2>{workaround}</h2>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
