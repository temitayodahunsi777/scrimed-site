"use client";

import { useMemo, useState } from "react";
import {
  protectedFinanceMethodologyAttestation,
  protectedFinanceMethodologyDataBoundary,
  type ProtectedFinanceMethodologyGateId,
  type ProtectedFinanceMethodologyInput,
  type ProtectedFinanceMethodologyWorkflow
} from "../lib/protectedFinanceMethodology";
import type { ProtectedBoardScorecardRecord } from "../lib/protectedBoardScorecards";

function statusClass(status: string) {
  if (status === "readiness-attested-no-phi") return "status-pill status-pill-pass";
  if (status === "not-recorded") return "status-pill status-pill-warn";
  return "status-pill";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "pending";

  const time = new Date(value).getTime();

  return Number.isFinite(time) ? new Date(time).toISOString() : "pending";
}

export default function ProtectedFinanceMethodologyPanel({
  busyGateId,
  onDownloadPacket,
  onRecordGate,
  packetBusy,
  scorecards,
  workflow
}: {
  busyGateId: string | null;
  onDownloadPacket: () => Promise<void>;
  onRecordGate: (input: ProtectedFinanceMethodologyInput) => Promise<void>;
  packetBusy: boolean;
  scorecards: ProtectedBoardScorecardRecord[];
  workflow: ProtectedFinanceMethodologyWorkflow | null;
}) {
  const defaultScorecardId = scorecards[0]?.id ?? "";
  const [selectedScorecardId, setSelectedScorecardId] = useState(defaultScorecardId);
  const [reviewNote, setReviewNote] = useState("no-phi finance methodology gate readiness");
  const effectiveScorecardId = selectedScorecardId || defaultScorecardId;
  const selectedScorecard = useMemo(
    () => scorecards.find((scorecard) => scorecard.id === effectiveScorecardId) ?? null,
    [effectiveScorecardId, scorecards]
  );
  const gates = workflow?.gates ?? [];

  async function recordGate(gateId: ProtectedFinanceMethodologyGateId) {
    await onRecordGate({
      gateId,
      boardScorecardId: selectedScorecard?.id || undefined,
      attestation: protectedFinanceMethodologyAttestation,
      dataBoundary: protectedFinanceMethodologyDataBoundary,
      reviewNote: reviewNote.trim()
    });
  }

  return (
    <section className="table-section" aria-label="Protected finance methodology gates">
      <div className="section-heading">
        <p className="eyebrow">Finance Methodology Gates</p>
        <h2>Convert internal board evidence into governed release readiness.</h2>
        <p className="section-copy">
          These gates record no-PHI internal readiness for cost allocation, buyer proof, and external-use
          controls. They keep audited finance, securities, advertising, reimbursement, clinical validation,
          and live-care authority explicitly blocked until qualified approvals exist.
        </p>
      </div>

      <div className="hub-summary demo-readiness-summary" aria-label="Finance methodology summary">
        <article>
          <span>Methodology state</span>
          <strong>{workflow?.financeMethodologyState ?? "methodology-readiness-open"}</strong>
        </article>
        <article>
          <span>External use</span>
          <strong>{workflow?.externalUseReleaseStatus ?? "external-use-blocked-pending-gate-attestation"}</strong>
        </article>
        <article>
          <span>Gates recorded</span>
          <strong>
            {workflow?.summary.recordedGateCount ?? 0}/{workflow?.summary.gateCount ?? gates.length}
          </strong>
        </article>
        <article>
          <span>Scorecard link</span>
          <strong>{selectedScorecard?.boardPeriodLabel ?? "pending"}</strong>
        </article>
      </div>

      <div className="evaluation-form">
        <div className="form-section">
          <label className="form-field">
            <span>Related board scorecard</span>
            <select
              onChange={(event) => setSelectedScorecardId(event.target.value)}
              value={effectiveScorecardId}
            >
              <option value="">No scorecard link</option>
              {scorecards.map((scorecard) => (
                <option key={scorecard.id} value={scorecard.id}>
                  {scorecard.boardPeriodLabel} - {scorecard.scorecardState}
                </option>
              ))}
            </select>
            <small>Optional no-PHI linkage to the internal board scorecard that triggered review.</small>
          </label>
          <label className="form-field form-field-wide">
            <span>Gate review note</span>
            <input
              maxLength={280}
              onChange={(event) => setReviewNote(event.target.value)}
              required
              value={reviewNote}
            />
            <small>No PHI, credentials, customer contracts, audited financial claims, securities claims, or public claims.</small>
          </label>
        </div>
        <div className="form-actions">
          <button
            className="secondary-action"
            disabled={packetBusy}
            onClick={() => void onDownloadPacket()}
            type="button"
          >
            {packetBusy ? "Downloading Packet" : "Download Finance Gate Packet"}
          </button>
        </div>
      </div>

      <div className="demo-runbook" aria-label="Finance methodology gate list">
        {gates.length > 0 ? (
          gates.map((gate) => (
            <article className="module-row" key={gate.id}>
              <div>
                <span>{gate.reviewerRole}</span>
                <h2>{gate.label}</h2>
              </div>
              <p>
                {gate.valueLine} Latest record {formatDate(gate.latestRecord?.signedAt)}. Boundary:{" "}
                {gate.boundary}
              </p>
              <div>
                <strong className={statusClass(gate.gateStatus)}>{gate.gateStatus}</strong>
                <button
                  className="secondary-action"
                  disabled={busyGateId === gate.id}
                  onClick={() => void recordGate(gate.id)}
                  type="button"
                >
                  {busyGateId === gate.id ? "Recording Gate" : "Record Gate"}
                </button>
              </div>
            </article>
          ))
        ) : (
          <article className="module-row">
            <div>
              <span>safe fallback</span>
              <h2>Finance methodology gates are loading or unavailable.</h2>
            </div>
            <p>
              Use board scorecards internally only, and route any external materials through external
              finance, counsel, privacy, security, communications, and customer-specific review.
            </p>
          </article>
        )}
      </div>

      <div className="demo-runbook" aria-label="Finance methodology retained blockers">
        <div className="section-heading">
          <p className="eyebrow">Retained blockers</p>
          <h2>External release stays blocked by design.</h2>
        </div>
        {(workflow?.safeWorkarounds ?? []).map((workaround) => (
          <article className="module-row" key={workaround}>
            <div>
              <span>safe workaround</span>
              <h2>{workaround}</h2>
            </div>
          </article>
        ))}
        {(workflow?.unavailableSections ?? []).map((section) => (
          <article className="module-row" key={section}>
            <div>
              <span>unavailable section</span>
              <h2>{section}</h2>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
