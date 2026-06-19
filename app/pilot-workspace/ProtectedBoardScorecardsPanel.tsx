"use client";

import { useState, type FormEvent } from "react";
import {
  protectedBoardScorecardAllocationProfileStatus,
  protectedBoardScorecardAttestation,
  protectedBoardScorecardDataBoundary,
  type ProtectedBoardScorecardBuyerSegmentFocus,
  type ProtectedBoardScorecardDashboard,
  type ProtectedBoardScorecardInput,
  type ProtectedBoardScorecardRecord
} from "../lib/protectedBoardScorecards";
import type { ProtectedMetricTrendReviewRecord } from "../lib/protectedMetricTrends";

type FormState = {
  primaryTrendReviewId: string;
  secondaryTrendReviewId: string;
  tertiaryTrendReviewId: string;
  boardPeriodLabel: string;
  buyerSegmentFocus: ProtectedBoardScorecardBuyerSegmentFocus;
  reviewNote: string;
};

const buyerSegments: Array<{
  value: ProtectedBoardScorecardBuyerSegmentFocus;
  label: string;
}> = [
  { value: "multi-segment", label: "Multi-segment" },
  { value: "provider-operations", label: "Provider operations" },
  { value: "payer-operations", label: "Payer operations" },
  { value: "employer-population-health", label: "Employer / population health" },
  { value: "government-public-health", label: "Government / public health" },
  { value: "global-health", label: "Global health" }
];

function defaultBoardPeriodLabel() {
  const now = new Date();
  const month = now.getUTCMonth();
  const quarter = Math.floor(month / 3) + 1;

  return `${now.getUTCFullYear()} Q${quarter} board scorecard`;
}

function defaultFormState(reviews: ProtectedMetricTrendReviewRecord[]): FormState {
  return {
    primaryTrendReviewId: reviews[0]?.id ?? "",
    secondaryTrendReviewId: reviews[1]?.id ?? "",
    tertiaryTrendReviewId: reviews[2]?.id ?? "",
    boardPeriodLabel: defaultBoardPeriodLabel(),
    buyerSegmentFocus: "multi-segment",
    reviewNote: "rolling-quarter no-phi board scorecard"
  };
}

function stateClass(state: string) {
  if (state === "scale-ready") return "status-pill status-pill-pass";
  if (state === "watch") return "status-pill status-pill-warn";
  return "status-pill";
}

function formatNumber(value: number | null, suffix = "") {
  if (value === null) {
    return "pending";
  }

  return `${value.toLocaleString(undefined, { maximumFractionDigits: 4 })}${suffix}`;
}

export default function ProtectedBoardScorecardsPanel({
  busyScorecard,
  dashboard,
  packetBusyId,
  scorecards,
  trendReviews,
  onCreateScorecard,
  onDownloadPacket
}: {
  busyScorecard: boolean;
  dashboard: ProtectedBoardScorecardDashboard | null;
  packetBusyId: string | null;
  scorecards: ProtectedBoardScorecardRecord[];
  trendReviews: ProtectedMetricTrendReviewRecord[];
  onCreateScorecard: (input: ProtectedBoardScorecardInput) => Promise<void>;
  onDownloadPacket: (scorecard: ProtectedBoardScorecardRecord) => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(() => defaultFormState(trendReviews));
  const latestScorecard = scorecards[0] ?? null;
  const reviewIds = new Set(trendReviews.map((review) => review.id));
  const selectedPrimaryId = reviewIds.has(form.primaryTrendReviewId)
    ? form.primaryTrendReviewId
    : trendReviews[0]?.id ?? "";
  const selectedSecondaryId =
    reviewIds.has(form.secondaryTrendReviewId) &&
    form.secondaryTrendReviewId !== selectedPrimaryId
      ? form.secondaryTrendReviewId
      : "";
  const selectedTertiaryId =
    reviewIds.has(form.tertiaryTrendReviewId) &&
    form.tertiaryTrendReviewId !== selectedPrimaryId &&
    form.tertiaryTrendReviewId !== selectedSecondaryId
      ? form.tertiaryTrendReviewId
      : "";
  const canCreateScorecard =
    !busyScorecard && trendReviews.length >= 1 && Boolean(selectedPrimaryId);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitScorecard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onCreateScorecard({
      primaryTrendReviewId: selectedPrimaryId,
      secondaryTrendReviewId: selectedSecondaryId || undefined,
      tertiaryTrendReviewId: selectedTertiaryId || undefined,
      boardPeriodLabel: form.boardPeriodLabel.trim(),
      buyerSegmentFocus: form.buyerSegmentFocus,
      operatorAttestation: protectedBoardScorecardAttestation,
      dataBoundary: protectedBoardScorecardDataBoundary,
      allocationProfileStatus: protectedBoardScorecardAllocationProfileStatus,
      reviewNote: form.reviewNote.trim()
    });
  }

  return (
    <section className="table-section" aria-label="Protected board scorecards">
      <div className="section-heading">
        <p className="eyebrow">Board Scorecards and Buyer Cohorts</p>
        <h2>Package trend evidence into rolling-quarter operating decisions.</h2>
        <p className="section-copy">
          Board scorecards connect no-PHI trend reviews to finance allocation readiness, buyer-segment
          cohorts, competitive advantage, and Agent Commander priorities. Allocation profiles stay pending
          until finance approves full labor, infrastructure, support, delivery, and reviewer methodology.
        </p>
      </div>

      <div className="hub-summary demo-readiness-summary" aria-label="Board scorecard summary">
        <article>
          <span>Scorecard state</span>
          <strong className={stateClass(dashboard?.latestScorecardState ?? "pending")}>
            {dashboard?.latestScorecardState ?? "pending"}
          </strong>
        </article>
        <article>
          <span>Scorecards</span>
          <strong>{dashboard?.scorecardCount ?? scorecards.length}</strong>
        </article>
        <article>
          <span>Trend reviews</span>
          <strong>{dashboard?.availableTrendReviewCount ?? trendReviews.length}</strong>
        </article>
        <article>
          <span>Finance allocation</span>
          <strong>{dashboard?.financeAllocationStatus ?? protectedBoardScorecardAllocationProfileStatus}</strong>
        </article>
      </div>

      <form className="evaluation-form" onSubmit={submitScorecard}>
        <div className="form-section">
          <label className="form-field">
            <span>Primary trend review</span>
            <select
              onChange={(event) => updateField("primaryTrendReviewId", event.target.value)}
              required
              value={selectedPrimaryId}
            >
              <option value="">Select primary review</option>
              {trendReviews.map((review) => (
                <option key={review.id} value={review.id}>
                  {review.createdAt} - {review.trendPeriodLabel} - {review.boardTrendState}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Second trend review</span>
            <select
              onChange={(event) => updateField("secondaryTrendReviewId", event.target.value)}
              value={selectedSecondaryId}
            >
              <option value="">No second review</option>
              {trendReviews
                .filter((review) => review.id !== selectedPrimaryId)
                .map((review) => (
                  <option key={review.id} value={review.id}>
                    {review.createdAt} - {review.trendPeriodLabel} - {review.boardTrendState}
                  </option>
                ))}
            </select>
          </label>
          <label className="form-field">
            <span>Third trend review</span>
            <select
              onChange={(event) => updateField("tertiaryTrendReviewId", event.target.value)}
              value={selectedTertiaryId}
            >
              <option value="">No third review</option>
              {trendReviews
                .filter(
                  (review) => review.id !== selectedPrimaryId && review.id !== selectedSecondaryId
                )
                .map((review) => (
                  <option key={review.id} value={review.id}>
                    {review.createdAt} - {review.trendPeriodLabel} - {review.boardTrendState}
                  </option>
                ))}
            </select>
          </label>
          <label className="form-field">
            <span>Buyer segment focus</span>
            <select
              onChange={(event) =>
                updateField(
                  "buyerSegmentFocus",
                  event.target.value as ProtectedBoardScorecardBuyerSegmentFocus
                )
              }
              required
              value={form.buyerSegmentFocus}
            >
              {buyerSegments.map((segment) => (
                <option key={segment.value} value={segment.value}>
                  {segment.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Board period</span>
            <input
              onChange={(event) => updateField("boardPeriodLabel", event.target.value)}
              required
              value={form.boardPeriodLabel}
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
            <small>No PHI, credentials, securities materials, external valuation claims, or source contracts.</small>
          </label>
        </div>
        <div className="form-actions">
          <button className="primary-action" disabled={!canCreateScorecard} type="submit">
            {busyScorecard ? "Creating Scorecard" : "Create Board Scorecard"}
          </button>
        </div>
      </form>

      {latestScorecard ? (
        <div className="agent-readiness-grid demo-readiness-brief" aria-label="Latest scorecard metrics">
          {latestScorecard.rollingQuarterMetrics.map((metric) => (
            <article key={metric.metricId}>
              <span>{metric.direction}</span>
              <strong>{metric.label}</strong>
              <p>
                Latest {formatNumber(metric.latestValue)}, change{" "}
                {formatNumber(metric.latestPercentChange, "%")}; improving {metric.improvingCount},
                stable {metric.stableCount}, watch {metric.watchCount}.
              </p>
            </article>
          ))}
        </div>
      ) : null}

      <div className="demo-runbook" aria-label="Board scorecard history">
        <div className="section-heading">
          <p className="eyebrow">Scorecard history</p>
          <h2>Audited board packets keep operating decisions traceable.</h2>
        </div>
        {scorecards.length > 0 ? (
          scorecards.map((scorecard) => (
            <article className="module-row" key={scorecard.id}>
              <div>
                <span>{scorecard.createdAt}</span>
                <h2>{scorecard.boardPeriodLabel}</h2>
              </div>
              <p>
                State {scorecard.scorecardState}; segment {scorecard.buyerSegmentFocus}; trends{" "}
                {scorecard.trendReviewCount}; allocation {scorecard.allocationProfileStatus}.
              </p>
              <div>
                <strong>{scorecard.financialReportingAuthority}</strong>
                <button
                  className="secondary-action"
                  disabled={packetBusyId === scorecard.id}
                  onClick={() => void onDownloadPacket(scorecard)}
                  type="button"
                >
                  {packetBusyId === scorecard.id ? "Downloading Packet" : "Download Scorecard Packet"}
                </button>
              </div>
            </article>
          ))
        ) : (
          <article className="module-row">
            <div>
              <span>no scorecards</span>
              <h2>{dashboard?.nextScorecardAction ?? "Create a trend review before scorecards."}</h2>
            </div>
            <p>
              Scorecards remain internal until finance allocation methodology, counsel review, privacy,
              security, clinical governance, and executive approval are complete.
            </p>
          </article>
        )}
      </div>

      <div className="demo-runbook" aria-label="Buyer cohort and agent priorities">
        <div className="section-heading">
          <p className="eyebrow">Cohorts and agent loops</p>
          <h2>Turn operating proof into focused market expansion and product improvement.</h2>
        </div>
        {(dashboard?.buyerSegmentCohorts ?? []).map((cohort) => (
          <article className="module-row" key={cohort.segment}>
            <div>
              <span>{cohort.label}</span>
              <h2>{cohort.motion}</h2>
            </div>
            <p>{cohort.boundary}</p>
          </article>
        ))}
        {(dashboard?.agentImprovementPriorities ?? []).map((priority) => (
          <article className="module-row" key={priority}>
            <div>
              <span>agent priority</span>
              <h2>{priority}</h2>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
