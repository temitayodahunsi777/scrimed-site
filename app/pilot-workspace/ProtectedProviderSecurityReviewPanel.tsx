"use client";

import { useState } from "react";
import type { ProtectedEvidenceRoomProviderAdapterWorkflow } from "../lib/protectedEvidenceRoomProviderAdapters";
import {
  protectedProviderSecurityReviewAttestation,
  protectedProviderSecurityReviewDataBoundary,
  protectedProviderSecurityReviewDomains,
  protectedProviderSecurityRiskTiers,
  type ProtectedProviderSecurityReviewDomain,
  type ProtectedProviderSecurityReviewInput,
  type ProtectedProviderSecurityReviewWorkflow,
  type ProtectedProviderSecurityRiskTier
} from "../lib/protectedProviderSecurityReviews";

function statusClass(status: string) {
  if (status.includes("ready")) {
    return "status-pill status-pill-pass";
  }

  if (status.includes("blocked") || status.includes("missing") || status.includes("disabled")) {
    return "status-pill status-pill-warn";
  }

  return "status-pill";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "pending";

  const time = new Date(value).getTime();

  return Number.isFinite(time) ? new Date(time).toISOString() : "pending";
}

export default function ProtectedProviderSecurityReviewPanel({
  busy,
  onDownloadPacket,
  onRecordReview,
  packetBusy,
  providerAdapterWorkflow,
  workflow
}: {
  busy: boolean;
  onDownloadPacket: () => Promise<void>;
  onRecordReview: (input: ProtectedProviderSecurityReviewInput) => Promise<void>;
  packetBusy: boolean;
  providerAdapterWorkflow: ProtectedEvidenceRoomProviderAdapterWorkflow | null;
  workflow: ProtectedProviderSecurityReviewWorkflow | null;
}) {
  const [reviewDomain, setReviewDomain] =
    useState<ProtectedProviderSecurityReviewDomain>("security-architecture");
  const [securityOwnerLabel, setSecurityOwnerLabel] = useState(
    "enterprise security review owner"
  );
  const [privacyOwnerLabel, setPrivacyOwnerLabel] = useState(
    "enterprise privacy review owner"
  );
  const [agreementPathLabel, setAgreementPathLabel] = useState(
    "baa dpa readiness path defined"
  );
  const [incidentResponsePathLabel, setIncidentResponsePathLabel] = useState(
    "incident response path defined"
  );
  const [retentionResidencyPathLabel, setRetentionResidencyPathLabel] = useState(
    "retention residency review path"
  );
  const [rollbackPlanLabel, setRollbackPlanLabel] = useState(
    "go live rollback plan defined"
  );
  const [reviewCadence, setReviewCadence] = useState(
    "review before production connector activation"
  );
  const [providerSecurityRisk, setProviderSecurityRisk] =
    useState<ProtectedProviderSecurityRiskTier>("not-assessed");
  const [reviewNote, setReviewNote] = useState(
    "security review metadata only no credentials no signed legal artifacts"
  );
  const availableProviderAdapters =
    workflow?.availableProviderAdapters && workflow.availableProviderAdapters.length > 0
      ? workflow.availableProviderAdapters
      : providerAdapterWorkflow?.records.filter(
          (record) =>
            record.adapterStatus === "provider-adapter-contract-ready-not-integration-approval" &&
            record.missingProviderControls.length === 0 &&
            record.externalProviderAuthorityRetained &&
            record.rawLogImportDisabled &&
            record.credentialStorageDisabled &&
            record.exportDisabled &&
            (record.providerRiskTier === "low" || record.providerRiskTier === "moderate")
        ) ?? [];
  const selectedProviderAdapterRecordIds = availableProviderAdapters
    .map((record) => record.id)
    .slice(0, 10);
  const canRecord = selectedProviderAdapterRecordIds.length > 0 && !busy;

  async function recordReview() {
    await onRecordReview({
      providerAdapterRecordIds: selectedProviderAdapterRecordIds,
      reviewDomain,
      securityOwnerLabel: securityOwnerLabel.trim(),
      privacyOwnerLabel: privacyOwnerLabel.trim(),
      agreementPathLabel: agreementPathLabel.trim(),
      incidentResponsePathLabel: incidentResponsePathLabel.trim(),
      retentionResidencyPathLabel: retentionResidencyPathLabel.trim(),
      rollbackPlanLabel: rollbackPlanLabel.trim(),
      reviewCadence: reviewCadence.trim(),
      providerSecurityRisk,
      externalSecurityReviewRetained: true,
      phiProcessingDisabled: true,
      credentialStorageDisabled: true,
      signedAgreementStorageDisabled: true,
      liveIntegrationDisabled: true,
      humanApprovalRequired: true,
      attestation: protectedProviderSecurityReviewAttestation,
      dataBoundary: protectedProviderSecurityReviewDataBoundary,
      reviewNote: reviewNote.trim()
    });
  }

  return (
    <section className="table-section" aria-label="Protected provider security review workbench">
      <div className="section-heading">
        <p className="eyebrow">Provider Security Review Workbench</p>
        <h2>Prepare security, privacy, BAA/DPA, credential, and go-live review without storing sensitive artifacts.</h2>
        <p className="section-copy">
          This workbench records no-PHI metadata after provider adapter contracts are ready.
          It stores no credentials, URLs, signed agreements, legal opinions, SOC reports,
          security questionnaires, raw logs, PHI, or production authorization. Live integration remains disabled.
        </p>
      </div>

      <div className="hub-summary demo-readiness-summary" aria-label="Provider security review summary">
        <article>
          <span>Review state</span>
          <strong>{workflow?.reviewState ?? "provider-security-review-open"}</strong>
        </article>
        <article>
          <span>Legal state</span>
          <strong>{workflow?.legalState ?? "baa-dpa-readiness-only-not-executed-agreement"}</strong>
        </article>
        <article>
          <span>Security controls</span>
          <strong>
            {workflow?.summary.linkedSecurityControlCount ?? 0}/
            {workflow?.summary.requiredSecurityControlCount ?? 12}
          </strong>
        </article>
        <article>
          <span>Ready adapters</span>
          <strong>
            {workflow?.summary.availableProviderAdapterCount ??
              selectedProviderAdapterRecordIds.length}
          </strong>
        </article>
      </div>

      <div className="evaluation-form">
        <div className="form-section">
          <label className="form-field">
            <span>Review domain</span>
            <select
              onChange={(event) =>
                setReviewDomain(event.target.value as ProtectedProviderSecurityReviewDomain)
              }
              value={reviewDomain}
            >
              {protectedProviderSecurityReviewDomains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Security owner label</span>
            <input
              maxLength={140}
              onChange={(event) => setSecurityOwnerLabel(event.target.value)}
              required
              value={securityOwnerLabel}
            />
          </label>
          <label className="form-field">
            <span>Privacy owner label</span>
            <input
              maxLength={140}
              onChange={(event) => setPrivacyOwnerLabel(event.target.value)}
              required
              value={privacyOwnerLabel}
            />
          </label>
          <label className="form-field">
            <span>BAA/DPA path label</span>
            <input
              maxLength={140}
              onChange={(event) => setAgreementPathLabel(event.target.value)}
              required
              value={agreementPathLabel}
            />
            <small>Use a readiness label only; do not paste signed agreements or legal opinions.</small>
          </label>
          <label className="form-field">
            <span>Incident response path</span>
            <input
              maxLength={140}
              onChange={(event) => setIncidentResponsePathLabel(event.target.value)}
              required
              value={incidentResponsePathLabel}
            />
          </label>
          <label className="form-field">
            <span>Retention and residency path</span>
            <input
              maxLength={140}
              onChange={(event) => setRetentionResidencyPathLabel(event.target.value)}
              required
              value={retentionResidencyPathLabel}
            />
          </label>
          <label className="form-field">
            <span>Rollback plan label</span>
            <input
              maxLength={140}
              onChange={(event) => setRollbackPlanLabel(event.target.value)}
              required
              value={rollbackPlanLabel}
            />
          </label>
          <label className="form-field">
            <span>Review cadence</span>
            <input
              maxLength={120}
              onChange={(event) => setReviewCadence(event.target.value)}
              required
              value={reviewCadence}
            />
          </label>
          <label className="form-field">
            <span>Provider security risk</span>
            <select
              onChange={(event) =>
                setProviderSecurityRisk(event.target.value as ProtectedProviderSecurityRiskTier)
              }
              value={providerSecurityRisk}
            >
              {protectedProviderSecurityRiskTiers.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.label}
                </option>
              ))}
            </select>
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

        <div className="form-actions">
          <button className="button-primary" disabled={!canRecord} onClick={recordReview} type="button">
            {busy ? "Recording..." : "Record Provider Security Review"}
          </button>
          <button
            className="button-secondary"
            disabled={packetBusy}
            onClick={onDownloadPacket}
            type="button"
          >
            {packetBusy ? "Preparing..." : "Download Security Review Packet"}
          </button>
        </div>

        {!canRecord ? (
          <p className="form-note">
            Record a low or moderate risk provider adapter contract with all required provider controls
            before creating provider security review metadata.
          </p>
        ) : null}
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Domain</th>
              <th>Status</th>
              <th>Risk</th>
              <th>BAA/DPA path</th>
              <th>Integration</th>
              <th>Recorded</th>
            </tr>
          </thead>
          <tbody>
            {workflow?.records.length ? (
              workflow.records.map((record) => (
                <tr key={record.id}>
                  <td>
                    <strong>{record.reviewDomainLabel}</strong>
                    <span>{record.securityOwnerLabel}</span>
                  </td>
                  <td>
                    <span className={statusClass(record.reviewStatus)}>
                      {record.reviewStatus}
                    </span>
                  </td>
                  <td>{record.providerSecurityRisk}</td>
                  <td>{record.agreementPathLabel}</td>
                  <td>{record.liveIntegrationDisabled ? "disabled" : "blocked"}</td>
                  <td>{formatDate(record.recordedAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>No protected provider security review metadata recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="quality-grid">
        <article>
          <h3>Required Controls</h3>
          <ul>
            {(workflow?.requiredSecurityControls ?? []).map((control) => (
              <li key={control}>{control}</li>
            ))}
          </ul>
        </article>
        <article>
          <h3>Available Provider Adapters</h3>
          <ul>
            {(availableProviderAdapters.length
              ? availableProviderAdapters.map(
                  (adapter) => `${adapter.providerClassLabel}: ${adapter.externalProviderLabel}`
                )
              : ["none"]
            ).map((adapter) => (
              <li key={adapter}>{adapter}</li>
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
