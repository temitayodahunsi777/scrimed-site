"use client";

import { useState } from "react";
import type { ProtectedDistributionAudience } from "../lib/protectedDistributionLockbox";
import type { ProtectedEvidenceRoomAccessLogReconciliationWorkflow } from "../lib/protectedEvidenceRoomAccessLogReconciliation";
import {
  protectedEvidenceRoomAuditLogImportFormats,
  protectedEvidenceRoomProviderAdapterAttestation,
  protectedEvidenceRoomProviderAdapterDataBoundary,
  protectedEvidenceRoomProviderClasses,
  protectedEvidenceRoomProviderIntegrationModes,
  type ProtectedEvidenceRoomAuditLogImportFormat,
  type ProtectedEvidenceRoomProviderAdapterInput,
  type ProtectedEvidenceRoomProviderAdapterWorkflow,
  type ProtectedEvidenceRoomProviderClass,
  type ProtectedEvidenceRoomProviderIntegrationMode,
  type ProtectedEvidenceRoomProviderRiskTier
} from "../lib/protectedEvidenceRoomProviderAdapters";

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

const providerRiskOptions: Array<{
  value: ProtectedEvidenceRoomProviderRiskTier;
  label: string;
}> = [
  { value: "not-assessed", label: "Not assessed" },
  { value: "low", label: "Low" },
  { value: "moderate", label: "Moderate" },
  { value: "high", label: "High" }
];

function statusClass(status: string) {
  if (status.includes("ready") || status.includes("linked")) {
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

export default function ProtectedEvidenceRoomProviderAdapterPanel({
  accessLogWorkflow,
  busy,
  onDownloadPacket,
  onRecordAdapter,
  packetBusy,
  workflow
}: {
  accessLogWorkflow: ProtectedEvidenceRoomAccessLogReconciliationWorkflow | null;
  busy: boolean;
  onDownloadPacket: () => Promise<void>;
  onRecordAdapter: (input: ProtectedEvidenceRoomProviderAdapterInput) => Promise<void>;
  packetBusy: boolean;
  workflow: ProtectedEvidenceRoomProviderAdapterWorkflow | null;
}) {
  const [distributionAudience, setDistributionAudience] =
    useState<ProtectedDistributionAudience>("buyer-diligence-room");
  const [providerClass, setProviderClass] =
    useState<ProtectedEvidenceRoomProviderClass>("evidence-room-platform");
  const [integrationMode, setIntegrationMode] =
    useState<ProtectedEvidenceRoomProviderIntegrationMode>("contract-only");
  const [externalProviderLabel, setExternalProviderLabel] = useState(
    "qualified external evidence room provider"
  );
  const [adapterContractReferenceLabel, setAdapterContractReferenceLabel] = useState(
    "provider adapter contract metadata"
  );
  const [adapterContractReferenceLocator, setAdapterContractReferenceLocator] = useState(
    "provider-adapter:contract-readiness"
  );
  const [auditLogImportStubLabel, setAuditLogImportStubLabel] = useState(
    "metadata-only audit log import stub"
  );
  const [auditLogImportStubLocator, setAuditLogImportStubLocator] = useState(
    "provider-adapter:audit-log-import-stub"
  );
  const [supportedAuditLogFormat, setSupportedAuditLogFormat] =
    useState<ProtectedEvidenceRoomAuditLogImportFormat>("access-review-report");
  const [verificationCadence, setVerificationCadence] = useState(
    "review before each external release window"
  );
  const [providerRiskTier, setProviderRiskTier] =
    useState<ProtectedEvidenceRoomProviderRiskTier>("not-assessed");
  const [reviewNote, setReviewNote] = useState(
    "provider adapter contract metadata only no credentials no raw logs"
  );
  const availableAccessLogRecords =
    workflow?.availableAccessLogReconciliations &&
    workflow.availableAccessLogReconciliations.length > 0
      ? workflow.availableAccessLogReconciliations
      : accessLogWorkflow?.records.filter(
          (record) =>
            record.externalLogAuthorityRetained &&
            record.exportDisabled &&
            record.reconciliationStatus === "access-log-reconciliation-complete-not-export-approval" &&
            record.missingAccessLogControls.length === 0 &&
            record.anomalyState === "none-observed"
        ) ?? [];
  const selectedAccessLogRecordIds = availableAccessLogRecords
    .map((record) => record.id)
    .slice(0, 14);
  const canRecord = selectedAccessLogRecordIds.length > 0 && !busy;

  async function recordAdapter() {
    await onRecordAdapter({
      accessLogReconciliationRecordIds: selectedAccessLogRecordIds,
      distributionAudience,
      providerClass,
      integrationMode,
      externalProviderLabel: externalProviderLabel.trim(),
      adapterContractReferenceLabel: adapterContractReferenceLabel.trim(),
      adapterContractReferenceLocator: adapterContractReferenceLocator.trim(),
      auditLogImportStubLabel: auditLogImportStubLabel.trim(),
      auditLogImportStubLocator: auditLogImportStubLocator.trim(),
      supportedAuditLogFormat,
      verificationCadence: verificationCadence.trim(),
      providerRiskTier,
      externalProviderAuthorityRetained: true,
      rawLogImportDisabled: true,
      credentialStorageDisabled: true,
      exportDisabled: true,
      attestation: protectedEvidenceRoomProviderAdapterAttestation,
      dataBoundary: protectedEvidenceRoomProviderAdapterDataBoundary,
      reviewNote: reviewNote.trim()
    });
  }

  return (
    <section className="table-section" aria-label="Protected evidence-room provider adapter contracts">
      <div className="section-heading">
        <p className="eyebrow">Evidence Room Provider Adapters</p>
        <h2>Model provider contracts and audit-log import stubs without live integration.</h2>
        <p className="section-copy">
          This layer records metadata-only provider adapter readiness after access-log reconciliation.
          It stores no raw logs, URLs, credentials, tokens, recipient identifiers, signed agreements,
          legal opinions, or customer permission artifacts. Integrations and exports remain disabled.
        </p>
      </div>

      <div className="hub-summary demo-readiness-summary" aria-label="Provider adapter summary">
        <article>
          <span>Adapter state</span>
          <strong>{workflow?.adapterState ?? "provider-adapter-contract-open"}</strong>
        </article>
        <article>
          <span>Integration state</span>
          <strong>{workflow?.integrationState ?? "integration-disabled"}</strong>
        </article>
        <article>
          <span>Provider controls</span>
          <strong>
            {workflow?.summary.linkedProviderControlCount ?? 0}/
            {workflow?.summary.requiredProviderControlCount ?? 8}
          </strong>
        </article>
        <article>
          <span>Ready access logs</span>
          <strong>
            {workflow?.summary.readyAccessLogReconciliationCount ??
              availableAccessLogRecords.length}
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
            <span>Provider class</span>
            <select
              onChange={(event) =>
                setProviderClass(event.target.value as ProtectedEvidenceRoomProviderClass)
              }
              value={providerClass}
            >
              {protectedEvidenceRoomProviderClasses.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Integration mode</span>
            <select
              onChange={(event) =>
                setIntegrationMode(
                  event.target.value as ProtectedEvidenceRoomProviderIntegrationMode
                )
              }
              value={integrationMode}
            >
              {protectedEvidenceRoomProviderIntegrationModes.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Provider label</span>
            <input
              maxLength={140}
              onChange={(event) => setExternalProviderLabel(event.target.value)}
              required
              value={externalProviderLabel}
            />
            <small>Use a provider class label only, never credentials, URLs, tokens, or users.</small>
          </label>
          <label className="form-field">
            <span>Adapter contract label</span>
            <input
              maxLength={140}
              onChange={(event) => setAdapterContractReferenceLabel(event.target.value)}
              required
              value={adapterContractReferenceLabel}
            />
          </label>
          <label className="form-field">
            <span>Adapter contract locator</span>
            <input
              maxLength={140}
              onChange={(event) => setAdapterContractReferenceLocator(event.target.value)}
              required
              value={adapterContractReferenceLocator}
            />
          </label>
          <label className="form-field">
            <span>Audit-log stub label</span>
            <input
              maxLength={140}
              onChange={(event) => setAuditLogImportStubLabel(event.target.value)}
              required
              value={auditLogImportStubLabel}
            />
          </label>
          <label className="form-field">
            <span>Audit-log stub locator</span>
            <input
              maxLength={140}
              onChange={(event) => setAuditLogImportStubLocator(event.target.value)}
              required
              value={auditLogImportStubLocator}
            />
          </label>
          <label className="form-field">
            <span>Audit-log summary format</span>
            <select
              onChange={(event) =>
                setSupportedAuditLogFormat(
                  event.target.value as ProtectedEvidenceRoomAuditLogImportFormat
                )
              }
              value={supportedAuditLogFormat}
            >
              {protectedEvidenceRoomAuditLogImportFormats.map((format) => (
                <option key={format.id} value={format.id}>
                  {format.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Verification cadence</span>
            <input
              maxLength={120}
              onChange={(event) => setVerificationCadence(event.target.value)}
              required
              value={verificationCadence}
            />
          </label>
          <label className="form-field">
            <span>Provider risk tier</span>
            <select
              onChange={(event) =>
                setProviderRiskTier(event.target.value as ProtectedEvidenceRoomProviderRiskTier)
              }
              value={providerRiskTier}
            >
              {providerRiskOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
          <button className="button-primary" disabled={!canRecord} onClick={recordAdapter} type="button">
            {busy ? "Recording..." : "Record Provider Adapter Contract"}
          </button>
          <button
            className="button-secondary"
            disabled={packetBusy}
            onClick={onDownloadPacket}
            type="button"
          >
            {packetBusy ? "Preparing..." : "Download Provider Adapter Packet"}
          </button>
        </div>

        {!canRecord ? (
          <p className="form-note">
            Complete protected access-log reconciliation with no observed anomalies before recording
            provider adapter contract metadata.
          </p>
        ) : null}
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Provider</th>
              <th>Status</th>
              <th>Mode</th>
              <th>Format</th>
              <th>Risk</th>
              <th>Recorded</th>
            </tr>
          </thead>
          <tbody>
            {workflow?.records.length ? (
              workflow.records.map((record) => (
                <tr key={record.id}>
                  <td>
                    <strong>{record.providerClassLabel}</strong>
                    <span>{record.externalProviderLabel}</span>
                  </td>
                  <td>
                    <span className={statusClass(record.adapterStatus)}>
                      {record.adapterStatus}
                    </span>
                  </td>
                  <td>{record.integrationModeLabel}</td>
                  <td>{record.supportedAuditLogFormat}</td>
                  <td>{record.providerRiskTier}</td>
                  <td>{formatDate(record.recordedAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>No protected provider adapter contract metadata recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="quality-grid">
        <article>
          <h3>Required Controls</h3>
          <ul>
            {(workflow?.requiredProviderControls ?? []).map((control) => (
              <li key={control}>{control}</li>
            ))}
          </ul>
        </article>
        <article>
          <h3>Missing Controls</h3>
          <ul>
            {(workflow?.missingProviderControls.length
              ? workflow.missingProviderControls
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
