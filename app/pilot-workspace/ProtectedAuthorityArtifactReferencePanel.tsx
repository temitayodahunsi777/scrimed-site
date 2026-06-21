"use client";

import { useState } from "react";
import {
  protectedAuthorityArtifactReferenceAttestation,
  protectedAuthorityArtifactReferenceDataBoundary,
  protectedAuthorityArtifactReferenceStatuses,
  type ProtectedAuthorityArtifactReferenceInput,
  type ProtectedAuthorityArtifactReferenceStatus,
  type ProtectedAuthorityArtifactReferenceWorkflow
} from "../lib/protectedAuthorityArtifactReferences";

function statusClass(status: string) {
  if (status.includes("accepted")) {
    return "status-pill status-pill-pass";
  }

  if (
    status.includes("needed") ||
    status.includes("renewal") ||
    status.includes("rejected") ||
    status.includes("expired")
  ) {
    return "status-pill status-pill-warn";
  }

  return "status-pill";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "pending";

  const time = new Date(value).getTime();

  return Number.isFinite(time) ? new Date(time).toISOString() : "pending";
}

function toDateTimeLocal(value: Date) {
  const offset = value.getTimezoneOffset() * 60000;

  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
}

function defaultValidatedAt() {
  return toDateTimeLocal(new Date());
}

function defaultExpiresAt() {
  const date = new Date();
  date.setDate(date.getDate() + 90);

  return toDateTimeLocal(date);
}

function defaultRenewalAlertAt() {
  const date = new Date();
  date.setDate(date.getDate() + 75);

  return toDateTimeLocal(date);
}

function toIsoTimestamp(value: string) {
  const time = new Date(value).getTime();

  return Number.isFinite(time) ? new Date(time).toISOString() : value;
}

export default function ProtectedAuthorityArtifactReferencePanel({
  busy,
  onDownloadPacket,
  onRecordReference,
  packetBusy,
  workflow
}: {
  busy: boolean;
  onDownloadPacket: () => Promise<void>;
  onRecordReference: (input: ProtectedAuthorityArtifactReferenceInput) => Promise<void>;
  packetBusy: boolean;
  workflow: ProtectedAuthorityArtifactReferenceWorkflow | null;
}) {
  const [artifactIntakeItemId, setArtifactIntakeItemId] = useState("");
  const [referenceStatus, setReferenceStatus] =
    useState<ProtectedAuthorityArtifactReferenceStatus>("review-pending");
  const [externalSystemLabel, setExternalSystemLabel] = useState(
    "qualified external authority system"
  );
  const [externalReferenceId, setExternalReferenceId] = useState(
    "external-reference:authority-artifact"
  );
  const [reviewerLabel, setReviewerLabel] = useState("qualified authority reviewer");
  const [reviewerRole, setReviewerRole] = useState("clinical governance reviewer");
  const [validatedAt, setValidatedAt] = useState(defaultValidatedAt);
  const [expiresAt, setExpiresAt] = useState(defaultExpiresAt);
  const [renewalAlertAt, setRenewalAlertAt] = useState(defaultRenewalAlertAt);
  const [reviewNote, setReviewNote] = useState(
    "metadata only reference no artifact no url no phi no approval"
  );
  const intakeItems = workflow?.intakeChecklist.items ?? [];
  const selectedItem =
    intakeItems.find((item) => item.id === artifactIntakeItemId) ?? intakeItems[0] ?? null;
  const selectedItemId = selectedItem?.id ?? "";
  const canRecord = Boolean(selectedItem && !busy);

  async function recordReference() {
    if (!selectedItem) {
      return;
    }

    await onRecordReference({
      artifactIntakeItemId: selectedItem.id,
      authorityKey: selectedItem.authorityKey,
      authorityLabel: selectedItem.authorityName,
      ownerAssignmentId: selectedItem.ownerAssignmentId,
      ownerRole: selectedItem.ownerRole,
      ownerLabel: selectedItem.ownerLabel,
      ownerSide: selectedItem.ownerSide,
      referenceStatus,
      externalSystemLabel: externalSystemLabel.trim(),
      externalReferenceId: externalReferenceId.trim(),
      reviewerLabel: reviewerLabel.trim(),
      reviewerRole: reviewerRole.trim(),
      validatedAt: toIsoTimestamp(validatedAt),
      expiresAt: toIsoTimestamp(expiresAt),
      renewalAlertAt: toIsoTimestamp(renewalAlertAt),
      artifactRetainedExternally: true,
      artifactUploadDisabled: true,
      phiStorageDisabled: true,
      sensitiveArtifactStorageDisabled: true,
      authorityGranted: false,
      humanReviewRequired: true,
      attestation: protectedAuthorityArtifactReferenceAttestation,
      dataBoundary: protectedAuthorityArtifactReferenceDataBoundary,
      reviewNote: reviewNote.trim()
    });
  }

  return (
    <section
      className="table-section"
      id="authority-artifact-references"
      aria-label="Protected authority artifact reference status capture"
    >
      <div className="section-heading">
        <p className="eyebrow">Authority Artifact References</p>
        <h2>Capture external artifact reference status without storing artifacts or granting authority.</h2>
        <p className="section-copy">
          Operators can record sanitized external reference IDs, reviewer roles, validation
          timestamps, expirations, renewal alerts, and status flags for clinical authority
          artifacts. SCRIMED still stores no PHI, URLs, credentials, signed artifacts, legal
          opinions, security reports, production approvals, or live-care authorization.
        </p>
      </div>

      <div className="hub-summary demo-readiness-summary" aria-label="Authority artifact reference summary">
        <article>
          <span>Reference state</span>
          <strong>{workflow?.referenceState ?? "external-reference-capture-open"}</strong>
        </article>
        <article>
          <span>References</span>
          <strong>
            {workflow?.summary.referencedItemCount ?? 0}/{workflow?.summary.intakeItemCount ?? 0}
          </strong>
        </article>
        <article>
          <span>Accepted metadata</span>
          <strong>{workflow?.summary.acceptedMetadataOnlyCount ?? 0}</strong>
        </article>
        <article>
          <span>Renewal queue</span>
          <strong>
            {(workflow?.summary.renewalRequiredCount ?? 0) +
              (workflow?.summary.rejectedOrExpiredCount ?? 0)}
          </strong>
        </article>
      </div>

      <div className="evaluation-form">
        <div className="form-section">
          <label className="form-field form-field-wide">
            <span>Artifact intake item</span>
            <select
              onChange={(event) => setArtifactIntakeItemId(event.target.value)}
              value={selectedItemId}
            >
              {intakeItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.authorityName} - {item.ownerRole}
                </option>
              ))}
            </select>
            <small>Select from the protected clinical authority artifact intake checklist.</small>
          </label>
          <label className="form-field">
            <span>Reference status</span>
            <select
              onChange={(event) =>
                setReferenceStatus(event.target.value as ProtectedAuthorityArtifactReferenceStatus)
              }
              value={referenceStatus}
            >
              {protectedAuthorityArtifactReferenceStatuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>External system label</span>
            <input
              maxLength={140}
              onChange={(event) => setExternalSystemLabel(event.target.value)}
              required
              value={externalSystemLabel}
            />
            <small>Use a non-secret label only; URLs and artifact content are blocked.</small>
          </label>
          <label className="form-field">
            <span>External reference ID</span>
            <input
              maxLength={160}
              onChange={(event) => setExternalReferenceId(event.target.value)}
              required
              value={externalReferenceId}
            />
            <small>Use a metadata locator such as external-reference:artifact-id.</small>
          </label>
          <label className="form-field">
            <span>Reviewer label</span>
            <input
              maxLength={140}
              onChange={(event) => setReviewerLabel(event.target.value)}
              required
              value={reviewerLabel}
            />
          </label>
          <label className="form-field">
            <span>Reviewer role</span>
            <input
              maxLength={140}
              onChange={(event) => setReviewerRole(event.target.value)}
              required
              value={reviewerRole}
            />
          </label>
          <label className="form-field">
            <span>Validated at</span>
            <input
              onChange={(event) => setValidatedAt(event.target.value)}
              required
              type="datetime-local"
              value={validatedAt}
            />
          </label>
          <label className="form-field">
            <span>Expires at</span>
            <input
              onChange={(event) => setExpiresAt(event.target.value)}
              required
              type="datetime-local"
              value={expiresAt}
            />
          </label>
          <label className="form-field">
            <span>Renewal alert at</span>
            <input
              onChange={(event) => setRenewalAlertAt(event.target.value)}
              required
              type="datetime-local"
              value={renewalAlertAt}
            />
          </label>
          <label className="form-field form-field-wide">
            <span>Review note</span>
            <textarea
              maxLength={300}
              onChange={(event) => setReviewNote(event.target.value)}
              value={reviewNote}
            />
          </label>
        </div>

        {selectedItem ? (
          <div className="quality-grid">
            <article>
              <h3>Selected Gate</h3>
              <p>{selectedItem.requiredExternalArtifact}</p>
            </article>
            <article>
              <h3>Qualified Reviewer</h3>
              <p>{selectedItem.qualifiedReviewer}</p>
            </article>
            <article>
              <h3>Boundary</h3>
              <p>{selectedItem.blockedUntil}</p>
            </article>
          </div>
        ) : null}

        <div className="form-actions">
          <button
            className="button-primary"
            disabled={!canRecord}
            onClick={recordReference}
            type="button"
          >
            {busy ? "Recording..." : "Record Artifact Reference"}
          </button>
          <button
            className="button-secondary"
            disabled={packetBusy}
            onClick={onDownloadPacket}
            type="button"
          >
            {packetBusy ? "Preparing..." : "Download Reference Packet"}
          </button>
        </div>

        {!canRecord ? (
          <p className="form-note">
            Load the Clinical Authority Artifact Intake Checklist before recording reference
            metadata.
          </p>
        ) : null}
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Authority</th>
              <th>Status</th>
              <th>External reference</th>
              <th>Reviewer</th>
              <th>Expiration</th>
              <th>Recorded</th>
            </tr>
          </thead>
          <tbody>
            {workflow?.records.length ? (
              workflow.records.map((record) => (
                <tr key={record.id}>
                  <td>
                    <strong>{record.authorityLabel}</strong>
                    <span>{record.ownerRole}</span>
                  </td>
                  <td>
                    <span className={statusClass(record.referenceStatus)}>
                      {record.referenceStatus}
                    </span>
                  </td>
                  <td>
                    <strong>{record.externalSystemLabel}</strong>
                    <span>{record.externalReferenceId}</span>
                  </td>
                  <td>
                    <strong>{record.reviewerRole}</strong>
                    <span>{record.reviewerLabel}</span>
                  </td>
                  <td>{formatDate(record.expiresAt)}</td>
                  <td>{formatDate(record.recordedAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>No protected authority artifact references recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="quality-grid">
        <article>
          <h3>Safe Workarounds</h3>
          <ul>
            {(workflow?.safeWorkarounds ?? []).slice(0, 3).map((workaround) => (
              <li key={workaround}>{workaround}</li>
            ))}
          </ul>
        </article>
        <article>
          <h3>Next Actions</h3>
          <ul>
            {(workflow?.nextActions ?? []).slice(0, 3).map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </article>
        <article>
          <h3>Missing Controls</h3>
          <ul>
            {(workflow?.missingReferenceControls.length
              ? workflow.missingReferenceControls
              : ["none recorded yet"]
            )
              .slice(0, 4)
              .map((control) => (
                <li key={control}>{control}</li>
              ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
