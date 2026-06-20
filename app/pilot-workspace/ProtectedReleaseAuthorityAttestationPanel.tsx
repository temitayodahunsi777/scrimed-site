"use client";

import { useState } from "react";
import type {
  ProtectedDistributionAudience,
  ProtectedDistributionLockboxWorkflow
} from "../lib/protectedDistributionLockbox";
import {
  protectedReleaseAuthorityAttestationAttestation,
  protectedReleaseAuthorityAttestationDataBoundary,
  protectedReleaseAuthorityDomains,
  type ProtectedReleaseAuthorityAttestationInput,
  type ProtectedReleaseAuthorityAttestationWorkflow,
  type ProtectedReleaseAuthorityDomain
} from "../lib/protectedReleaseAuthorityAttestations";

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

export default function ProtectedReleaseAuthorityAttestationPanel({
  busy,
  lockboxWorkflow,
  onDownloadPacket,
  onRecordAttestation,
  packetBusy,
  workflow
}: {
  busy: boolean;
  lockboxWorkflow: ProtectedDistributionLockboxWorkflow | null;
  onDownloadPacket: () => Promise<void>;
  onRecordAttestation: (input: ProtectedReleaseAuthorityAttestationInput) => Promise<void>;
  packetBusy: boolean;
  workflow: ProtectedReleaseAuthorityAttestationWorkflow | null;
}) {
  const [authorityDomain, setAuthorityDomain] =
    useState<ProtectedReleaseAuthorityDomain>("qualified-counsel");
  const [distributionAudience, setDistributionAudience] =
    useState<ProtectedDistributionAudience>("buyer-diligence-room");
  const [releaseAuthorityReferenceLabel, setReleaseAuthorityReferenceLabel] = useState(
    "external release authority attestation"
  );
  const [releaseAuthorityReferenceLocator, setReleaseAuthorityReferenceLocator] = useState(
    "release-authority-room:attestation"
  );
  const [authorityOwnerLabel, setAuthorityOwnerLabel] = useState("external authority owner");
  const [attestedManifestVersion, setAttestedManifestVersion] = useState("distribution-v1.0.0");
  const [authorityWindowStart, setAuthorityWindowStart] = useState(() => defaultDate(1));
  const [authorityWindowEnd, setAuthorityWindowEnd] = useState(() => defaultDate(90));
  const [releaseScope, setReleaseScope] = useState("controlled buyer diligence release review");
  const [revocationTrigger, setRevocationTrigger] = useState(
    "revoke release scope and re-review authority if audience changes"
  );
  const [reviewNote, setReviewNote] = useState("metadata-only release authority reference no phi");
  const availableLockboxes =
    workflow?.availableLockboxes && workflow.availableLockboxes.length > 0
      ? workflow.availableLockboxes
      : lockboxWorkflow?.records.filter(
          (record) =>
            record.distributionDisabled &&
            record.externalApprovalsRetained &&
            record.lockboxStatus === "ready-for-external-distribution-lockbox-review-not-release-authority"
        ) ?? [];
  const selectedLockboxIds = availableLockboxes.map((record) => record.id).slice(0, 14);
  const canRecord = selectedLockboxIds.length > 0 && !busy;

  async function recordAttestation() {
    await onRecordAttestation({
      lockboxRecordIds: selectedLockboxIds,
      authorityDomain,
      distributionAudience,
      releaseAuthorityReferenceLabel: releaseAuthorityReferenceLabel.trim(),
      releaseAuthorityReferenceLocator: releaseAuthorityReferenceLocator.trim(),
      authorityOwnerLabel: authorityOwnerLabel.trim(),
      attestedManifestVersion: attestedManifestVersion.trim(),
      authorityWindowStart,
      authorityWindowEnd,
      releaseScope: releaseScope.trim(),
      revocationTrigger: revocationTrigger.trim(),
      externalAuthorityRetained: true,
      releaseDisabled: true,
      attestation: protectedReleaseAuthorityAttestationAttestation,
      dataBoundary: protectedReleaseAuthorityAttestationDataBoundary,
      reviewNote: reviewNote.trim()
    });
  }

  return (
    <section className="table-section" aria-label="Protected release authority attestations">
      <div className="section-heading">
        <p className="eyebrow">Release Authority Attestations</p>
        <h2>Close the last buyer-release gap without storing approval artifacts.</h2>
        <p className="section-copy">
          This control records only no-PHI metadata references to externally retained release authority
          across counsel, customer permission, executive, privacy, finance, clinical governance, and
          marketing claims owners. It keeps release disabled until real authority is executed outside
          SCRIMED and independently reviewed.
        </p>
      </div>

      <div className="hub-summary demo-readiness-summary" aria-label="Release authority summary">
        <article>
          <span>Authority state</span>
          <strong>{workflow?.authorityState ?? "release-authority-open"}</strong>
        </article>
        <article>
          <span>Release state</span>
          <strong>{workflow?.releaseState ?? "release-disabled"}</strong>
        </article>
        <article>
          <span>Authority domains</span>
          <strong>
            {workflow?.summary.linkedAuthorityDomainCount ?? 0}/
            {workflow?.summary.requiredAuthorityDomainCount ?? protectedReleaseAuthorityDomains.length}
          </strong>
        </article>
        <article>
          <span>Ready lockboxes</span>
          <strong>{workflow?.summary.readyLockboxCount ?? availableLockboxes.length}</strong>
        </article>
      </div>

      <div className="evaluation-form">
        <div className="form-section">
          <label className="form-field">
            <span>Authority domain</span>
            <select
              onChange={(event) =>
                setAuthorityDomain(event.target.value as ProtectedReleaseAuthorityDomain)
              }
              value={authorityDomain}
            >
              {protectedReleaseAuthorityDomains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.label}
                </option>
              ))}
            </select>
          </label>
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
            <span>Reference label</span>
            <input
              maxLength={140}
              onChange={(event) => setReleaseAuthorityReferenceLabel(event.target.value)}
              required
              value={releaseAuthorityReferenceLabel}
            />
          </label>
          <label className="form-field">
            <span>Reference locator</span>
            <input
              maxLength={140}
              onChange={(event) => setReleaseAuthorityReferenceLocator(event.target.value)}
              required
              value={releaseAuthorityReferenceLocator}
            />
            <small>Use external locator metadata only, not a URL, signed approval, contract, or secret.</small>
          </label>
          <label className="form-field">
            <span>Authority owner label</span>
            <input
              maxLength={100}
              onChange={(event) => setAuthorityOwnerLabel(event.target.value)}
              required
              value={authorityOwnerLabel}
            />
          </label>
          <label className="form-field">
            <span>Manifest version</span>
            <input
              maxLength={40}
              onChange={(event) => setAttestedManifestVersion(event.target.value)}
              required
              value={attestedManifestVersion}
            />
          </label>
          <label className="form-field">
            <span>Window start</span>
            <input
              onChange={(event) => setAuthorityWindowStart(event.target.value)}
              required
              type="date"
              value={authorityWindowStart}
            />
          </label>
          <label className="form-field">
            <span>Window end</span>
            <input
              onChange={(event) => setAuthorityWindowEnd(event.target.value)}
              required
              type="date"
              value={authorityWindowEnd}
            />
          </label>
          <label className="form-field form-field-wide">
            <span>Release scope</span>
            <input
              maxLength={160}
              onChange={(event) => setReleaseScope(event.target.value)}
              required
              value={releaseScope}
            />
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
            {busy ? "Recording Attestation" : "Record Release Authority Metadata"}
          </button>
          <button
            className="secondary-action"
            disabled={packetBusy}
            onClick={() => void onDownloadPacket()}
            type="button"
          >
            {packetBusy ? "Downloading Packet" : "Download Authority Packet"}
          </button>
        </div>
      </div>

      <div className="demo-runbook" aria-label="Release authority domain coverage">
        {(workflow?.requiredAuthorityDomains ?? protectedReleaseAuthorityDomains).map((domain) => {
          const linked = workflow?.linkedAuthorityDomains.includes(domain.id) ?? false;
          const missing = workflow?.missingAuthorityDomains.includes(domain.id) ?? true;

          return (
            <article className="module-row" key={domain.id}>
              <div>
                <span>{domain.id}</span>
                <h2>{domain.label}</h2>
              </div>
              <p>{domain.requiredScope}</p>
              <strong className={statusClass(missing ? "missing" : "linked")}>
                {linked ? "linked" : "missing"}
              </strong>
            </article>
          );
        })}
      </div>

      <div className="demo-runbook" aria-label="Release authority attestation records">
        {(workflow?.records ?? []).length > 0 ? (
          workflow?.records.map((record) => (
            <article className="module-row" key={record.id}>
              <div>
                <span>{record.authorityDomainLabel}</span>
                <h2>
                  {record.attestedManifestVersion}: {record.releaseAuthorityReferenceLabel}
                </h2>
              </div>
              <p>
                {record.releaseScope} stays {record.releaseDisabled ? "disabled" : "review-required"} for{" "}
                {record.distributionAudience}. Window: {formatDate(record.authorityWindowStart)} to{" "}
                {formatDate(record.authorityWindowEnd)}.
              </p>
              <strong className={statusClass(record.attestationStatus)}>
                {record.attestationStatus}
              </strong>
            </article>
          ))
        ) : (
          <article className="module-row">
            <div>
              <span>authority metadata</span>
              <h2>No protected release authority metadata recorded yet.</h2>
            </div>
            <p>
              Record attestation metadata only after disabled distribution lockboxes exist and actual
              authority artifacts are retained outside SCRIMED.
            </p>
            <strong>Release remains disabled.</strong>
          </article>
        )}
      </div>

      <div className="demo-runbook" aria-label="Release authority safeguards">
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
