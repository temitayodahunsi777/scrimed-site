"use client";

import { useState, type FormEvent } from "react";
import type { ProtectedMetricRollupRecord } from "../lib/protectedMetricRollups";
import {
  protectedMetricTrendCostAllocationPolicy,
  protectedMetricTrendDataBoundary,
  protectedMetricTrendReviewAttestation,
  type ProtectedMetricTrendDashboard,
  type ProtectedMetricTrendReviewInput,
  type ProtectedMetricTrendReviewRecord
} from "../lib/protectedMetricTrends";

type FormState = {
  currentSnapshotId: string;
  comparisonSnapshotId: string;
  trendPeriodLabel: string;
  reviewNote: string;
};

function defaultTrendLabel() {
  const now = new Date();

  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")} board trend`;
}

function defaultFormState(snapshots: ProtectedMetricRollupRecord[]): FormState {
  return {
    currentSnapshotId: snapshots[0]?.id ?? "",
    comparisonSnapshotId: snapshots[1]?.id ?? "",
    trendPeriodLabel: defaultTrendLabel(),
    reviewNote: "monthly no-phi protected metric trend review"
  };
}

function formatNumber(value: number | null, suffix = "") {
  if (value === null) {
    return "pending";
  }

  return `${value.toLocaleString(undefined, { maximumFractionDigits: 4 })}${suffix}`;
}

function stateClass(state: string) {
  if (state === "improving") return "status-pill status-pill-pass";
  if (state === "watch") return "status-pill status-pill-warn";
  return "status-pill";
}

export default function ProtectedMetricTrendsPanel({
  busyReview,
  dashboard,
  packetBusyId,
  reviews,
  rollupSnapshots,
  onCreateReview,
  onDownloadPacket
}: {
  busyReview: boolean;
  dashboard: ProtectedMetricTrendDashboard | null;
  packetBusyId: string | null;
  reviews: ProtectedMetricTrendReviewRecord[];
  rollupSnapshots: ProtectedMetricRollupRecord[];
  onCreateReview: (input: ProtectedMetricTrendReviewInput) => Promise<void>;
  onDownloadPacket: (review: ProtectedMetricTrendReviewRecord) => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(() => defaultFormState(rollupSnapshots));
  const latestReview = reviews[0] ?? null;
  const rollupSnapshotIds = new Set(rollupSnapshots.map((snapshot) => snapshot.id));
  const selectedCurrentSnapshotId = rollupSnapshotIds.has(form.currentSnapshotId)
    ? form.currentSnapshotId
    : rollupSnapshots[0]?.id ?? "";
  const selectedComparisonSnapshotId =
    rollupSnapshotIds.has(form.comparisonSnapshotId) &&
    form.comparisonSnapshotId !== selectedCurrentSnapshotId
      ? form.comparisonSnapshotId
      : rollupSnapshots.find((snapshot) => snapshot.id !== selectedCurrentSnapshotId)?.id ?? "";
  const canCreateTrend =
    !busyReview &&
    rollupSnapshots.length >= 2 &&
    Boolean(selectedCurrentSnapshotId) &&
    Boolean(selectedComparisonSnapshotId) &&
    selectedCurrentSnapshotId !== selectedComparisonSnapshotId;

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitTrendReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onCreateReview({
      currentSnapshotId: selectedCurrentSnapshotId,
      comparisonSnapshotId: selectedComparisonSnapshotId,
      trendPeriodLabel: form.trendPeriodLabel.trim(),
      reviewerAttestation: protectedMetricTrendReviewAttestation,
      dataBoundary: protectedMetricTrendDataBoundary,
      costAllocationPolicy: protectedMetricTrendCostAllocationPolicy,
      reviewNote: form.reviewNote.trim()
    });
  }

  return (
    <section className="table-section" aria-label="Protected metric trend reviews">
      <div className="section-heading">
        <p className="eyebrow">Monthly Variance and Agent Improvement</p>
        <h2>Compare protected rollups to steer reach, competitive advantage, and agent learning.</h2>
        <p className="section-copy">
          Trend reviews compare no-PHI rollup snapshots, surface variance, and convert operating signals into
          reach expansion, competitive proof, and Agent Commander improvement actions. Cost allocation remains
          model-cost-only until finance approves the full labor, infrastructure, support, delivery, and reviewer
          methodology.
        </p>
      </div>

      <div className="hub-summary demo-readiness-summary" aria-label="Metric trend summary">
        <article>
          <span>Trend state</span>
          <strong className={stateClass(dashboard?.latestTrendState ?? "pending")}>
            {dashboard?.latestTrendState ?? "pending"}
          </strong>
        </article>
        <article>
          <span>Trend reviews</span>
          <strong>{dashboard?.reviewCount ?? reviews.length}</strong>
        </article>
        <article>
          <span>Rollups available</span>
          <strong>{dashboard?.availableSnapshotCount ?? rollupSnapshots.length}</strong>
        </article>
        <article>
          <span>Latest review</span>
          <strong>{dashboard?.latestReviewAt ?? "pending"}</strong>
        </article>
      </div>

      <form className="evaluation-form" onSubmit={submitTrendReview}>
        <div className="form-section">
          <label className="form-field">
            <span>Current rollup</span>
            <select
              onChange={(event) => updateField("currentSnapshotId", event.target.value)}
              required
              value={selectedCurrentSnapshotId}
            >
              <option value="">Select current snapshot</option>
              {rollupSnapshots.map((snapshot) => (
                <option key={snapshot.id} value={snapshot.id}>
                  {snapshot.createdAt} - {snapshot.capturedMetricTypes}/{snapshot.requiredMetricTypes}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Comparison rollup</span>
            <select
              onChange={(event) => updateField("comparisonSnapshotId", event.target.value)}
              required
              value={selectedComparisonSnapshotId}
            >
              <option value="">Select comparison snapshot</option>
              {rollupSnapshots.map((snapshot) => (
                <option key={snapshot.id} value={snapshot.id}>
                  {snapshot.createdAt} - {snapshot.capturedMetricTypes}/{snapshot.requiredMetricTypes}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Trend period</span>
            <input
              onChange={(event) => updateField("trendPeriodLabel", event.target.value)}
              required
              value={form.trendPeriodLabel}
            />
            <small>Use an internal operating label, not a buyer, patient, contract, or member identifier.</small>
          </label>
          <label className="form-field form-field-wide">
            <span>Review note</span>
            <input
              maxLength={280}
              onChange={(event) => updateField("reviewNote", event.target.value)}
              required
              value={form.reviewNote}
            />
            <small>No PHI, credentials, external financial claims, source contracts, or patient data.</small>
          </label>
        </div>
        <div className="form-actions">
          <button
            className="primary-action"
            disabled={!canCreateTrend}
            type="submit"
          >
            {busyReview ? "Creating Trend Review" : "Create Trend Review"}
          </button>
        </div>
      </form>

      {latestReview ? (
        <div className="agent-readiness-grid demo-readiness-brief" aria-label="Latest trend metrics">
          {latestReview.trendMetrics.map((metric) => (
            <article key={metric.metricId}>
              <span>{metric.state}</span>
              <strong>{metric.label}</strong>
              <p>
                Current {formatNumber(metric.current)}, comparison {formatNumber(metric.comparison)}, delta{" "}
                {formatNumber(metric.delta)}, change {formatNumber(metric.percentChange, "%")}.
              </p>
            </article>
          ))}
        </div>
      ) : null}

      <div className="demo-runbook" aria-label="Metric trend review history">
        <div className="section-heading">
          <p className="eyebrow">Trend history</p>
          <h2>Audited trend packets convert variance into operating action.</h2>
        </div>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <article className="module-row" key={review.id}>
              <div>
                <span>{review.createdAt}</span>
                <h2>{review.trendPeriodLabel}</h2>
              </div>
              <p>
                State {review.boardTrendState}; cost policy {review.costAllocationPolicy}; agent actions{" "}
                {review.agentImprovementActions.length}.
              </p>
              <div>
                <strong>{review.costAllocationStatus}</strong>
                <button
                  className="secondary-action"
                  disabled={packetBusyId === review.id}
                  onClick={() => void onDownloadPacket(review)}
                  type="button"
                >
                  {packetBusyId === review.id ? "Downloading Packet" : "Download Trend Packet"}
                </button>
              </div>
            </article>
          ))
        ) : (
          <article className="module-row">
            <div>
              <span>no reviews</span>
              <h2>{dashboard?.nextTrendAction ?? "Create two rollups before trend review."}</h2>
            </div>
            <p>
              Trend reviews need at least two no-PHI rollup snapshots and remain internal until finance and
              counsel approve external use.
            </p>
          </article>
        )}
      </div>

      <div className="demo-runbook" aria-label="Reach and agent improvement signals">
        <div className="section-heading">
          <p className="eyebrow">Reach, edge, and agent loops</p>
          <h2>Use variance to improve the operating system, not just report numbers.</h2>
        </div>
        {(dashboard?.reachExpansionSignals ?? []).map((signal) => (
          <article className="module-row" key={signal}>
            <div>
              <span>reach</span>
              <h2>{signal}</h2>
            </div>
          </article>
        ))}
        {(dashboard?.competitiveAdvantages ?? []).map((advantage) => (
          <article className="module-row" key={advantage}>
            <div>
              <span>advantage</span>
              <h2>{advantage}</h2>
            </div>
          </article>
        ))}
        {(dashboard?.agentImprovementActions ?? []).map((action) => (
          <article className="module-row" key={action}>
            <div>
              <span>agent loop</span>
              <h2>{action}</h2>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
