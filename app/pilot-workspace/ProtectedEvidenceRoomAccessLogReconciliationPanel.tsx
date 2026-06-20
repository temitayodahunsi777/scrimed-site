"use client";

import { useState } from "react";
import type { ProtectedDistributionAudience } from "../lib/protectedDistributionLockbox";
import type { ProtectedEvidenceRoomRecipientAttestationWorkflow } from "../lib/protectedEvidenceRoomRecipientAttestations";
import {
  protectedEvidenceRoomAccessLogReconciliation,
  protectedEvidenceRoomAccessLogReconciliationDataBoundary,
  protectedEvidenceRoomAccessLogReconciliationScopes,
  type ProtectedEvidenceRoomAccessLogAnomalyState,
  type ProtectedEvidenceRoomAccessLogReconciliationInput,
  type ProtectedEvidenceRoomAccessLogReconciliationScope,
  type ProtectedEvidenceRoomAccessLogReconciliationWorkflow,
  type ProtectedEvidenceRoomAccessLogRevocationExerciseState
} from "../lib/protectedEvidenceRoomAccessLogReconciliation";

const distributionAudienceOptions: Array<{
  value: ProtectedDistributionAudience;
  label: string;
}> = [
  { value: "buyer-diligence-room", label: "Buyer diligence room" },
  { value: "investor-data-room", label: "Investor data room" },
  { value: "board-room", label: "Board room" },
  { value: "sales-collateral-channel", label: "Sales collateral channel" },
  { value: "marketing-site-release", label: "Marketing site release" },
  { value: "public-relations-channel", label: "Public relations channel" },
  { value: "customer-case-study-channel", label: "Customer case study channel" }
];

const anomalyStateOptions: Array<{
  value: ProtectedEvidenceRoomAccessLogAnomalyState;
  label: string;
}> = [
  { value: "none-observed", label: "None observed" },
  { value: "needs-review", label: "Needs review" },
  { value: "revocation-triggered", label: "Revocation triggered" },
  { value: "log-unavailable", label: "Log unavailable" }
];

const revocationExerciseOptions: Array<{
  value: ProtectedEvidenceRoomAccessLogRevocationExerciseState;
  label: string;
}> = [
  { value: "not-issued", label: "Access not issued" },
  { value: "not-required", label: "Not required" },
  { value: "ready", label: "Revocation ready" },
  { value: "exercised", label: "Revocation exercised" }
];

function statusClass(status: string) {
  if (status.includes("complete") || status.includes("ready") || status.includes("linked")) {
    return "status-pill status-pill-pass";
  }

  if (status.includes("blocked") || status.includes("missing") || status.includes("disabled")) {
    return "status-pill status-pill-warn";
  }

  return "status-pill";
}

function defaultDate(daysFromNow: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromNow);

  return date.toISOString().slice(0, 10);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "pending";

  const time = new Date(value).getTime();

  return Number.isFinite(time) ? new Date(time).toISOString() : "pending";
}

export default function ProtectedEvidenceRoomAccessLogReconciliationPanel({
  busy,
  onDownloadPacket,
  onRecordReconciliation,
  packetBusy,
  recipientWorkflow,
  workflow
}: {
  busy: boolean;
  onDownloadPacket: () => Promise<void>;
  onRecordReconciliation: (input: ProtectedEvidenceRoomAccessLogReconciliationInput) => Promise<void>;
  packetBusy: boolean;
  recipientWorkflow: ProtectedEvidenceRoomRecipientAttestationWorkflow | null;
  workflow: ProtectedEvidenceRoomAccessLogReconciliationWorkflow | null;
}) {
  const [distributionAudience, setDistributionAudience] =
    useState<ProtectedDistributionAudience>("buyer-diligence-room");
  const [reconciliationScope, setReconciliationScope] =
    useState<ProtectedEvidenceRoomAccessLogReconciliationScope>("pre-release-access-log-review");
  const [externalLogSystemLabel, setExternalLogSystemLabel] = useState(
    "external evidence room access ledger"
  );
  const [accessLogReferenceLabel, setAccessLogReferenceLabel] = useState(
    "metadata access log reconciliation"
  );
  const [accessLogReferenceLocator, setAccessLogReferenceLocator] = useState(
    "evidence-room:access-log-ledger"
  );
  const [reconciliationWindowStart, setReconciliationWindowStart] = useState(() =>
    defaultDate(-30)
  );
  const [reconciliationWindowEnd, setReconciliationWindowEnd] = useState(() => defaultDate(0));
  const [observedAccessEventCount, setObservedAccessEventCount] = useState(0);
  const [expectedRecipientSegmentCount, setExpectedRecipientSegmentCount] = useState(1);
  const [anomalyState, setAnomalyState] =
    useState<ProtectedEvidenceRoomAccessLogAnomalyState>("none-observed");
  const [revocationExerciseState, setRevocationExerciseState] =
    useState<ProtectedEvidenceRoomAccessLogRevocationExerciseState>("not-issued");
  const [anomalyEscalationPath, setAnomalyEscalationPath] = useState(
    "escalate to governance owner and keep export disabled"
  );
  const [reviewNote, setReviewNote] = useState(
    "metadata-only access log reconciliation no phi"
  );
  const availableRecipientRecords =
    workflow?.availableRecipientAttestations && workflow.availableRecipientAttestations.length > 0
      ? workflow.availableRecipientAttestations
      : recipientWorkflow?.records.filter(
          (record) =>
            record.externalRecipientAuthorityRetained &&
            record.exportDisabled &&
            record.attestationStatus === "recipient-metadata-complete-not-export-approval" &&
            record.missingRecipientControls.length === 0
        ) ?? [];
  const selectedRecipientRecordIds = availableRecipientRecords
    .map((record) => record.id)
    .slice(0, 14);
  const canRecord = selectedRecipientRecordIds.length > 0 && !busy;

  async function recordReconciliation() {
    await onRecordReconciliation({
      recipientAttestationRecordIds: selectedRecipientRecordIds,
      distributionAudience,
      reconciliationScope,
      externalLogSystemLabel: externalLogSystemLabel.trim(),
      accessLogReferenceLabel: accessLogReferenceLabel.trim(),
      accessLogReferenceLocator: accessLogReferenceLocator.trim(),
      reconciliationWindowStart,
      reconciliationWindowEnd,
      observedAccessEventCount,
      expectedRecipientSegmentCount,
      anomalyState,
      revocationExerciseState,
      anomalyEscalationPath: anomalyEscalationPath.trim(),
      externalLogAuthorityRetained: true,
      exportDisabled: true,
      attestation: protectedEvidenceRoomAccessLogReconciliation,
      dataBoundary: protectedEvidenceRoomAccessLogReconciliationDataBoundary,
      reviewNote: reviewNote.trim()
    });
  }

  return (
    <section className="table-section" aria-label="Protected evidence-room access log reconciliation">
      <div className="section-heading">
        <p className="eyebrow">Evidence Room Access Logs</p>
        <h2>Reconcile external access logs without storing raw log data.</h2>
        <p className="section-copy">
          This layer records metadata-only reconciliation against externally retained evidence-room
          access logs after recipient attestations are complete. It stores no raw logs, recipient
          identifiers, addresses, device identifiers, secrets, legal opinions, or distribution artifacts,
          and export remains disabled.
        </p>
      </div>

      <div className="hub-summary demo-readiness-summary" aria-label="Access log reconciliation summary">
        <article>
          <span>Reconciliation state</span>
          <strong>{workflow?.reconciliationState ?? "access-log-reconciliation-open"}</strong>
        </article>
        <article>
          <span>Export state</span>
          <strong>{workflow?.exportState ?? "export-disabled"}</strong>
        </article>
        <article>
          <span>Access-log controls</span>
          <strong>
            {workflow?.summary.linkedAccessLogControlCount ?? 0}/
            {workflow?.summary.requiredAccessLogControlCount ?? 7}
          </strong>
        </article>
        <article>
          <span>Ready recipient records</span>
          <strong>
            {workflow?.summary.readyRecipientAttestationCount ?? availableRecipientRecords.length}
          </strong>
        </article>
      </div>

      <div className="evaluation-form">
        <div className="form-section">
          <label className="form-field">
            <span>Audience</span>
            <select
              onChange={(event) =>
                setDistributionAudience(event.target.value as ProtectedDistributionAudience)
              }
              value={distributionAudience}
            >
              {distributionAudienceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Reconciliation scope</span>
            <select
              onChange={(event) =>
                setReconciliationScope(
                  event.target.value as ProtectedEvidenceRoomAccessLogReconciliationScope
                )
              }
              value={reconciliationScope}
            >
              {protectedEvidenceRoomAccessLogReconciliationScopes.map((scope) => (
                <option key={scope.id} value={scope.id}>
                  {scope.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>External log system label</span>
            <input
              maxLength={140}
              onChange={(event) => setExternalLogSystemLabel(event.target.value)}
              required
              value={externalLogSystemLabel}
            />
            <small>Use a system label only, never raw logs, addresses, tokens, or recipients.</small>
          </label>
          <label className="form-field">
            <span>Access-log reference label</span>
            <input
              maxLength={140}
              onChange={(event) => setAccessLogReferenceLabel(event.target.value)}
              required
              value={accessLogReferenceLabel}
            />
          </label>
          <label className="form-field">
            <span>Access-log reference locator</span>
            <input
              maxLength={140}
              onChange={(event) => setAccessLogReferenceLocator(event.target.value)}
              required
              value={accessLogReferenceLocator}
            />
          </label>
          <label className="form-field">
            <span>Window start</span>
            <input
              onChange={(event) => setReconciliationWindowStart(event.target.value)}
              required
              type="date"
              value={reconciliationWindowStart}
            />
          </label>
          <label className="form-field">
            <span>Window end</span>
            <input
              onChange={(event) => setReconciliationWindowEnd(event.target.value)}
              required
              type="date"
              value={reconciliationWindowEnd}
            />
          </label>
          <label className="form-field">
            <span>Observed event count</span>
            <input
              min={0}
              max={1000000}
              onChange={(event) => setObservedAccessEventCount(Number(event.target.value))}
              required
              type="number"
              value={observedAccessEventCount}
            />
          </label>
          <label className="form-field">
            <span>Expected segment count</span>
            <input
              min={1}
              max={1000}
              onChange={(event) => setExpectedRecipientSegmentCount(Number(event.target.value))}
              required
              type="number"
              value={expectedRecipientSegmentCount}
            />
          </label>
          <label className="form-field">
            <span>Anomaly state</span>
            <select
              onChange={(event) =>
                setAnomalyState(event.target.value as ProtectedEvidenceRoomAccessLogAnomalyState)
              }
              value={anomalyState}
            >
              {anomalyStateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Revocation exercise</span>
            <select
              onChange={(event) =>
                setRevocationExerciseState(
                  event.target.value as ProtectedEvidenceRoomAccessLogRevocationExerciseState
                )
              }
              value={revocationExerciseState}
            >
              {revocationExerciseOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field form-field-wide">
            <span>Anomaly escalation path</span>
            <input
              maxLength={180}
              onChange={(event) => setAnomalyEscalationPath(event.target.value)}
              required
              value={anomalyEscalationPath}
            />
          </label>
          <label className="form-field form-field-wide">
            <span>Review note</span>
            <textarea
              maxLength={280}
              onChange={(event) => setReviewNote(event.target.value)}
              value={reviewNote}
            />
          </label>
        </div>

        <div className="form-actions">
          <button className="button-primary" disabled={!canRecord} onClick={recordReconciliation} type="button">
            {busy ? "Recording..." : "Record Access-Log Reconciliation"}
          </button>
          <button
            className="button-secondary"
            disabled={packetBusy}
            onClick={onDownloadPacket}
            type="button"
          >
            {packetBusy ? "Preparing..." : "Download Access-Log Packet"}
          </button>
        </div>

        {!canRecord ? (
          <p className="form-note">
            Complete protected evidence-room recipient attestations before recording access-log
            reconciliation metadata.
          </p>
        ) : null}
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Scope</th>
              <th>Status</th>
              <th>Anomaly</th>
              <th>Events</th>
              <th>Window</th>
              <th>Recorded</th>
            </tr>
          </thead>
          <tbody>
            {workflow?.records.length ? (
              workflow.records.map((record) => (
                <tr key={record.id}>
                  <td>
                    <strong>{record.reconciliationScopeLabel}</strong>
                    <span>{record.accessLogReferenceLabel}</span>
                  </td>
                  <td>
                    <span className={statusClass(record.reconciliationStatus)}>
                      {record.reconciliationStatus}
                    </span>
                  </td>
                  <td>{record.anomalyState}</td>
                  <td>{record.observedAccessEventCount}</td>
                  <td>
                    {formatDate(record.reconciliationWindowStart)}
                    <br />
                    {formatDate(record.reconciliationWindowEnd)}
                  </td>
                  <td>{formatDate(record.recordedAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>No protected access-log reconciliation metadata recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="quality-grid">
        <article>
          <h3>Required Controls</h3>
          <ul>
            {(workflow?.requiredAccessLogControls ?? []).map((control) => (
              <li key={control}>{control}</li>
            ))}
          </ul>
        </article>
        <article>
          <h3>Missing Controls</h3>
          <ul>
            {(workflow?.missingAccessLogControls.length
              ? workflow.missingAccessLogControls
              : ["none"]
            ).map((control) => (
              <li key={control}>{control}</li>
            ))}
          </ul>
        </article>
        <article>
          <h3>Safe Workarounds</h3>
          <ul>
            {(workflow?.safeWorkarounds ?? []).slice(0, 3).map((workaround) => (
              <li key={workaround}>{workaround}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
