"use client";

import { useState } from "react";
import type { ProtectedDistributionAudience } from "../lib/protectedDistributionLockbox";
import type { ProtectedReleaseAuthorityAttestationWorkflow } from "../lib/protectedReleaseAuthorityAttestations";
import {
  protectedEvidenceRoomRecipientAttestation,
  protectedEvidenceRoomRecipientAttestationDataBoundary,
  protectedEvidenceRoomRecipientSegments,
  type ProtectedEvidenceRoomRecipientAttestationInput,
  type ProtectedEvidenceRoomRecipientAttestationWorkflow,
  type ProtectedEvidenceRoomRecipientSegment,
  type ProtectedEvidenceRoomRevocationState
} from "../lib/protectedEvidenceRoomRecipientAttestations";

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

const revocationStateOptions: Array<{
  value: ProtectedEvidenceRoomRevocationState;
  label: string;
}> = [
  { value: "access-not-issued", label: "Access not issued" },
  { value: "revocation-ready", label: "Revocation ready" },
  { value: "revoked", label: "Revoked" }
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

export default function ProtectedEvidenceRoomRecipientAttestationPanel({
  authorityWorkflow,
  busy,
  onDownloadPacket,
  onRecordAttestation,
  packetBusy,
  workflow
}: {
  authorityWorkflow: ProtectedReleaseAuthorityAttestationWorkflow | null;
  busy: boolean;
  onDownloadPacket: () => Promise<void>;
  onRecordAttestation: (input: ProtectedEvidenceRoomRecipientAttestationInput) => Promise<void>;
  packetBusy: boolean;
  workflow: ProtectedEvidenceRoomRecipientAttestationWorkflow | null;
}) {
  const [distributionAudience, setDistributionAudience] =
    useState<ProtectedDistributionAudience>("buyer-diligence-room");
  const [recipientSegment, setRecipientSegment] =
    useState<ProtectedEvidenceRoomRecipientSegment>("named-buyer-reviewers");
  const [recipientScopeLabel, setRecipientScopeLabel] = useState(
    "named buyer diligence reviewer group"
  );
  const [evidenceRoomReferenceLabel, setEvidenceRoomReferenceLabel] = useState(
    "external evidence room recipient control"
  );
  const [evidenceRoomReferenceLocator, setEvidenceRoomReferenceLocator] = useState(
    "evidence-room:recipient-control"
  );
  const [packetReferenceLabel, setPacketReferenceLabel] = useState(
    "controlled recipient proof packet"
  );
  const [packetReferenceLocator, setPacketReferenceLocator] = useState(
    "evidence-room:packet-reference"
  );
  const [accessWindowStart, setAccessWindowStart] = useState(() => defaultDate(1));
  const [accessWindowEnd, setAccessWindowEnd] = useState(() => defaultDate(45));
  const [revocationState, setRevocationState] =
    useState<ProtectedEvidenceRoomRevocationState>("access-not-issued");
  const [revocationTrigger, setRevocationTrigger] = useState(
    "revoke and re-review evidence room access if scope changes"
  );
  const [reviewNote, setReviewNote] = useState("metadata-only recipient attestation no phi");
  const availableAuthorityRecords =
    workflow?.availableReleaseAuthorityAttestations &&
    workflow.availableReleaseAuthorityAttestations.length > 0
      ? workflow.availableReleaseAuthorityAttestations
      : authorityWorkflow?.records.filter(
          (record) =>
            record.releaseDisabled &&
            record.externalAuthorityRetained &&
            record.attestationStatus ===
              "all-release-authority-metadata-complete-not-release-approval" &&
            record.missingAuthorityDomains.length === 0
        ) ?? [];
  const selectedAuthorityRecordIds = availableAuthorityRecords
    .map((record) => record.id)
    .slice(0, 14);
  const canRecord = selectedAuthorityRecordIds.length > 0 && !busy;

  async function recordAttestation() {
    await onRecordAttestation({
      releaseAuthorityAttestationRecordIds: selectedAuthorityRecordIds,
      distributionAudience,
      recipientSegment,
      recipientScopeLabel: recipientScopeLabel.trim(),
      evidenceRoomReferenceLabel: evidenceRoomReferenceLabel.trim(),
      evidenceRoomReferenceLocator: evidenceRoomReferenceLocator.trim(),
      packetReferenceLabel: packetReferenceLabel.trim(),
      packetReferenceLocator: packetReferenceLocator.trim(),
      accessWindowStart,
      accessWindowEnd,
      revocationState,
      revocationTrigger: revocationTrigger.trim(),
      externalRecipientAuthorityRetained: true,
      exportDisabled: true,
      attestation: protectedEvidenceRoomRecipientAttestation,
      dataBoundary: protectedEvidenceRoomRecipientAttestationDataBoundary,
      reviewNote: reviewNote.trim()
    });
  }

  return (
    <section className="table-section" aria-label="Protected evidence-room recipient attestations">
      <div className="section-heading">
        <p className="eyebrow">Evidence Room Recipient Attestations</p>
        <h2>Control who proof packets are intended for without storing recipient lists.</h2>
        <p className="section-copy">
          This layer records no-PHI metadata for intended recipient segments, access windows, packet
          references, and revocation posture after release authority metadata is complete. It does not
          store emails, exact recipient lists, signed approvals, legal opinions, or distribution artifacts,
          and export remains disabled.
        </p>
      </div>

      <div className="hub-summary demo-readiness-summary" aria-label="Recipient attestation summary">
        <article>
          <span>Recipient state</span>
          <strong>{workflow?.recipientState ?? "recipient-attestation-open"}</strong>
        </article>
        <article>
          <span>Export state</span>
          <strong>{workflow?.exportState ?? "export-disabled"}</strong>
        </article>
        <article>
          <span>Recipient controls</span>
          <strong>
            {workflow?.summary.linkedRecipientControlCount ?? 0}/
            {workflow?.summary.requiredRecipientControlCount ?? 7}
          </strong>
        </article>
        <article>
          <span>Ready authority records</span>
          <strong>
            {workflow?.summary.readyReleaseAuthorityAttestationCount ??
              availableAuthorityRecords.length}
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
            <span>Recipient segment</span>
            <select
              onChange={(event) =>
                setRecipientSegment(event.target.value as ProtectedEvidenceRoomRecipientSegment)
              }
              value={recipientSegment}
            >
              {protectedEvidenceRoomRecipientSegments.map((segment) => (
                <option key={segment.id} value={segment.id}>
                  {segment.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Recipient scope label</span>
            <input
              maxLength={140}
              onChange={(event) => setRecipientScopeLabel(event.target.value)}
              required
              value={recipientScopeLabel}
            />
            <small>Use a role or group label only, never emails or exact recipient names.</small>
          </label>
          <label className="form-field">
            <span>Evidence room label</span>
            <input
              maxLength={140}
              onChange={(event) => setEvidenceRoomReferenceLabel(event.target.value)}
              required
              value={evidenceRoomReferenceLabel}
            />
          </label>
          <label className="form-field">
            <span>Evidence room locator</span>
            <input
              maxLength={140}
              onChange={(event) => setEvidenceRoomReferenceLocator(event.target.value)}
              required
              value={evidenceRoomReferenceLocator}
            />
          </label>
          <label className="form-field">
            <span>Packet label</span>
            <input
              maxLength={140}
              onChange={(event) => setPacketReferenceLabel(event.target.value)}
              required
              value={packetReferenceLabel}
            />
          </label>
          <label className="form-field">
            <span>Packet locator</span>
            <input
              maxLength={140}
              onChange={(event) => setPacketReferenceLocator(event.target.value)}
              required
              value={packetReferenceLocator}
            />
          </label>
          <label className="form-field">
            <span>Window start</span>
            <input
              onChange={(event) => setAccessWindowStart(event.target.value)}
              required
              type="date"
              value={accessWindowStart}
            />
          </label>
          <label className="form-field">
            <span>Window end</span>
            <input
              onChange={(event) => setAccessWindowEnd(event.target.value)}
              required
              type="date"
              value={accessWindowEnd}
            />
          </label>
          <label className="form-field">
            <span>Revocation state</span>
            <select
              onChange={(event) =>
                setRevocationState(event.target.value as ProtectedEvidenceRoomRevocationState)
              }
              value={revocationState}
            >
              {revocationStateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field form-field-wide">
            <span>Revocation trigger</span>
            <input
              maxLength={180}
              onChange={(event) => setRevocationTrigger(event.target.value)}
              required
              value={revocationTrigger}
            />
          </label>
          <label className="form-field form-field-wide">
            <span>Review note</span>
            <input
              maxLength={280}
              onChange={(event) => setReviewNote(event.target.value)}
              required
              value={reviewNote}
            />
          </label>
        </div>
        <div className="form-actions">
          <button
            className="primary-action"
            disabled={!canRecord}
            onClick={recordAttestation}
            type="button"
          >
            {busy ? "Recording Recipient Metadata" : "Record Recipient Attestation"}
          </button>
          <button
            className="secondary-action"
            disabled={packetBusy}
            onClick={() => void onDownloadPacket()}
            type="button"
          >
            {packetBusy ? "Downloading Packet" : "Download Recipient Packet"}
          </button>
        </div>
      </div>

      <div className="demo-runbook" aria-label="Recipient segment coverage">
        {(workflow?.recipientSegments ?? protectedEvidenceRoomRecipientSegments).map((segment) => {
          const hasRecord =
            workflow?.records.some((record) => record.recipientSegment === segment.id) ?? false;

          return (
            <article className="module-row" key={segment.id}>
              <div>
                <span>{segment.id}</span>
                <h2>{segment.label}</h2>
              </div>
              <p>{segment.requiredScope}</p>
              <strong className={statusClass(hasRecord ? "linked" : "missing")}>
                {hasRecord ? "recorded" : "available"}
              </strong>
            </article>
          );
        })}
      </div>

      <div className="demo-runbook" aria-label="Evidence-room recipient records">
        {(workflow?.records ?? []).length > 0 ? (
          workflow?.records.map((record) => (
            <article className="module-row" key={record.id}>
              <div>
                <span>{record.recipientSegmentLabel}</span>
                <h2>{record.packetReferenceLabel}</h2>
              </div>
              <p>
                {record.recipientScopeLabel} stays {record.exportDisabled ? "export-disabled" : "review-required"} for{" "}
                {record.distributionAudience}. Window: {formatDate(record.accessWindowStart)} to{" "}
                {formatDate(record.accessWindowEnd)}.
              </p>
              <strong className={statusClass(record.attestationStatus)}>
                {record.attestationStatus}
              </strong>
            </article>
          ))
        ) : (
          <article className="module-row">
            <div>
              <span>recipient metadata</span>
              <h2>No evidence-room recipient metadata recorded yet.</h2>
            </div>
            <p>
              Record metadata only after release authority attestations are complete and exact recipient
              access remains controlled outside SCRIMED.
            </p>
            <strong>Export remains disabled.</strong>
          </article>
        )}
      </div>

      <div className="demo-runbook" aria-label="Evidence-room recipient safeguards">
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
