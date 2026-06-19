"use client";

import { useState, type FormEvent } from "react";
import {
  protectedMetricRollupAttestation,
  protectedMetricRollupDataBoundary,
  type ProtectedMetricRollupDashboard,
  type ProtectedMetricRollupInput,
  type ProtectedMetricRollupRecord
} from "../lib/protectedMetricRollups";

type FormState = {
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  reviewNote: string;
};

function toDatetimeLocal(value: Date) {
  return value.toISOString().slice(0, 16);
}

function defaultFormState(): FormState {
  const now = new Date();
  const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    reportingPeriodStart: toDatetimeLocal(start),
    reportingPeriodEnd: toDatetimeLocal(now),
    reviewNote: "finance-reviewed no-phi operating rollup"
  };
}

function isoFromDatetimeLocal(value: string) {
  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : value;
}

function formatCurrency(value: number | null) {
  if (value === null) {
    return "pending";
  }

  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
}

function formatNumber(value: number | null, suffix = "") {
  if (value === null) {
    return "pending";
  }

  return `${value.toLocaleString(undefined, { maximumFractionDigits: 4 })}${suffix}`;
}

function readinessClass(ready: boolean) {
  return ready ? "status-pill status-pill-pass" : "status-pill status-pill-warn";
}

export default function ProtectedMetricRollupsPanel({
  busySnapshot,
  dashboard,
  packetBusyId,
  snapshots,
  onCreateSnapshot,
  onDownloadPacket
}: {
  busySnapshot: boolean;
  dashboard: ProtectedMetricRollupDashboard | null;
  packetBusyId: string | null;
  snapshots: ProtectedMetricRollupRecord[];
  onCreateSnapshot: (input: ProtectedMetricRollupInput) => Promise<void>;
  onDownloadPacket: (snapshot: ProtectedMetricRollupRecord) => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(() => defaultFormState());
  const rollup = dashboard?.liveRollup ?? snapshots[0] ?? null;

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitSnapshot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onCreateSnapshot({
      reportingPeriodStart: isoFromDatetimeLocal(form.reportingPeriodStart),
      reportingPeriodEnd: isoFromDatetimeLocal(form.reportingPeriodEnd),
      reviewerAttestation: protectedMetricRollupAttestation,
      dataBoundary: protectedMetricRollupDataBoundary,
      reviewNote: form.reviewNote.trim()
    });
  }

  return (
    <section className="table-section" aria-label="Protected metric rollups">
      <div className="section-heading">
        <p className="eyebrow">Finance-Reviewed Metric Rollups</p>
        <h2>Turn no-PHI operating captures into internal board-ready proof packets.</h2>
        <p className="section-copy">
          This protected AAL2 workspace derives aggregate unit-economics signals from the operator metric ledger,
          creates immutable no-PHI rollup snapshots, and audits every board packet download. It remains internal
          operating evidence, not audited financial reporting, securities material, valuation assurance, clinical
          validation, reimbursement assurance, or live care authority.
        </p>
      </div>

      <div className="hub-summary demo-readiness-summary" aria-label="Metric rollup summary">
        <article>
          <span>Board readiness</span>
          <strong className={readinessClass(Boolean(rollup?.readyForBoardReview))}>
            {rollup ? (rollup.readyForBoardReview ? "ready" : "review") : "loading"}
          </strong>
        </article>
        <article>
          <span>Metric coverage</span>
          <strong>
            {rollup
              ? `${rollup.capturedMetricTypes}/${rollup.requiredMetricTypes}`
              : "loading"}
          </strong>
        </article>
        <article>
          <span>Snapshots</span>
          <strong>{dashboard?.snapshotCount ?? snapshots.length}</strong>
        </article>
        <article>
          <span>Latest snapshot</span>
          <strong>{dashboard?.latestSnapshotAt ?? "pending"}</strong>
        </article>
      </div>

      {rollup ? (
        <div className="agent-readiness-grid demo-readiness-brief" aria-label="Metric rollup ratios">
          <article>
            <span>model cost per workflow</span>
            <strong>{formatCurrency(rollup.modelCostPerWorkflow)}</strong>
            <p>Model-cost-only until finance approves labor and infrastructure allocation.</p>
          </article>
          <article>
            <span>review minutes per workflow</span>
            <strong>{formatNumber(rollup.reviewMinutesPerWorkflow)}</strong>
            <p>Human-in-the-loop load stays visible before scaling pilots.</p>
          </article>
          <article>
            <span>delivery hours per workflow</span>
            <strong>{formatNumber(rollup.deliveryHoursPerWorkflow)}</strong>
            <p>Implementation effort stays tied to workflow volume.</p>
          </article>
          <article>
            <span>proof packets per workflow</span>
            <strong>{formatNumber(rollup.proofPacketsPerWorkflow)}</strong>
            <p>Evidence production is measured as an operating system, not one-off consulting.</p>
          </article>
        </div>
      ) : null}

      <form className="evaluation-form" onSubmit={submitSnapshot}>
        <div className="form-section">
          <label className="form-field">
            <span>Reporting start</span>
            <input
              onChange={(event) => updateField("reportingPeriodStart", event.target.value)}
              required
              type="datetime-local"
              value={form.reportingPeriodStart}
            />
          </label>
          <label className="form-field">
            <span>Reporting end</span>
            <input
              onChange={(event) => updateField("reportingPeriodEnd", event.target.value)}
              required
              type="datetime-local"
              value={form.reportingPeriodEnd}
            />
          </label>
          <label className="form-field form-field-wide">
            <span>Review note</span>
            <input
              maxLength={280}
              onChange={(event) => updateField("reviewNote", event.target.value)}
              required
              value={form.reviewNote}
            />
            <small>No PHI, credentials, source contracts, patient data, payer member data, or external claims.</small>
          </label>
        </div>
        <div className="form-actions">
          <button className="primary-action" disabled={busySnapshot} type="submit">
            {busySnapshot ? "Creating Snapshot" : "Create Board Rollup Snapshot"}
          </button>
        </div>
      </form>

      <div className="demo-runbook" aria-label="Metric rollup snapshots">
        <div className="section-heading">
          <p className="eyebrow">Snapshot history</p>
          <h2>Every packet download writes an audit event before release.</h2>
        </div>
        {snapshots.length > 0 ? (
          snapshots.map((snapshot) => (
            <article className="module-row" key={snapshot.id}>
              <div>
                <span>{snapshot.createdAt}</span>
                <h2>{snapshot.readyForBoardReview ? "Ready for internal board review" : "Needs metric coverage"}</h2>
              </div>
              <p>
                Coverage {snapshot.capturedMetricTypes}/{snapshot.requiredMetricTypes}; model cost per workflow{" "}
                {formatCurrency(snapshot.modelCostPerWorkflow)}; workflow volume{" "}
                {formatNumber(snapshot.workflowVolume)}.
              </p>
              <div>
                <strong>{snapshot.financialReportingAuthority}</strong>
                <button
                  className="secondary-action"
                  disabled={packetBusyId === snapshot.id}
                  onClick={() => void onDownloadPacket(snapshot)}
                  type="button"
                >
                  {packetBusyId === snapshot.id ? "Downloading Packet" : "Download Board Packet"}
                </button>
              </div>
            </article>
          ))
        ) : (
          <article className="module-row">
            <div>
              <span>no snapshots</span>
              <h2>Create the first finance-reviewed no-PHI rollup after metric capture.</h2>
            </div>
            <p>{dashboard?.nextBoardAction ?? "Protected operator metrics are the safe temporary source."}</p>
          </article>
        )}
      </div>

      <div className="demo-runbook" aria-label="Metric rollup workarounds">
        <div className="section-heading">
          <p className="eyebrow">Known boundaries</p>
          <h2>Board packets stay internal until finance and counsel approve external use.</h2>
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
