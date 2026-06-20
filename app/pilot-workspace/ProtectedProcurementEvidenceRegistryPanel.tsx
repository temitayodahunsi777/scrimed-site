"use client";

import { useState } from "react";
import type { ProtectedProviderSecurityReviewWorkflow } from "../lib/protectedProviderSecurityReviews";
import {
  protectedProcurementBuyerAudiences,
  protectedProcurementDomains,
  protectedProcurementEvidenceClasses,
  protectedProcurementEvidenceRegistryAttestation,
  protectedProcurementEvidenceRegistryDataBoundary,
  protectedProcurementRiskTiers,
  type ProtectedProcurementBuyerAudience,
  type ProtectedProcurementDomain,
  type ProtectedProcurementEvidenceClass,
  type ProtectedProcurementEvidenceRegistryInput,
  type ProtectedProcurementEvidenceRegistryWorkflow,
  type ProtectedProcurementRiskTier
} from "../lib/protectedProcurementEvidenceRegistry";

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

export default function ProtectedProcurementEvidenceRegistryPanel({
  busy,
  onDownloadPacket,
  onRecordRegistry,
  packetBusy,
  providerSecurityWorkflow,
  workflow
}: {
  busy: boolean;
  onDownloadPacket: () => Promise<void>;
  onRecordRegistry: (input: ProtectedProcurementEvidenceRegistryInput) => Promise<void>;
  packetBusy: boolean;
  providerSecurityWorkflow: ProtectedProviderSecurityReviewWorkflow | null;
  workflow: ProtectedProcurementEvidenceRegistryWorkflow | null;
}) {
  const [targetAudience, setTargetAudience] =
    useState<ProtectedProcurementBuyerAudience>("provider-health-system");
  const [procurementDomain, setProcurementDomain] =
    useState<ProtectedProcurementDomain>("security-questionnaire");
  const [evidenceClass, setEvidenceClass] =
    useState<ProtectedProcurementEvidenceClass>("questionnaire-response-routing");
  const [procurementOwnerLabel, setProcurementOwnerLabel] = useState(
    "enterprise procurement evidence owner"
  );
  const [buyerSegmentLabel, setBuyerSegmentLabel] = useState(
    "health system security procurement reviewer"
  );
  const [externalSystemLabel, setExternalSystemLabel] = useState(
    "qualified external diligence system"
  );
  const [evidenceRoutingLabel, setEvidenceRoutingLabel] = useState(
    "metadata only evidence routing label"
  );
  const [evidenceRoutingLocator, setEvidenceRoutingLocator] = useState(
    "external-system:procurement-evidence-room"
  );
  const [responseCadence, setResponseCadence] = useState(
    "review before buyer diligence response"
  );
  const [procurementRiskTier, setProcurementRiskTier] =
    useState<ProtectedProcurementRiskTier>("not-assessed");
  const [reviewNote, setReviewNote] = useState(
    "procurement routing metadata only no questionnaires no reports no credentials no phi"
  );
  const availableProviderSecurityReviews =
    workflow?.availableProviderSecurityReviews &&
    workflow.availableProviderSecurityReviews.length > 0
      ? workflow.availableProviderSecurityReviews
      : providerSecurityWorkflow?.records.filter(
          (record) =>
            record.reviewStatus === "provider-security-review-ready-not-approval" &&
            record.missingSecurityControls.length === 0 &&
            record.externalSecurityReviewRetained &&
            record.phiProcessingDisabled &&
            record.credentialStorageDisabled &&
            record.signedAgreementStorageDisabled &&
            record.liveIntegrationDisabled &&
            record.humanApprovalRequired &&
            (record.providerSecurityRisk === "low" || record.providerSecurityRisk === "moderate")
        ) ?? [];
  const selectedProviderSecurityReviewRecordIds = availableProviderSecurityReviews
    .map((record) => record.id)
    .slice(0, 10);
  const canRecord = selectedProviderSecurityReviewRecordIds.length > 0 && !busy;

  async function recordRegistry() {
    await onRecordRegistry({
      providerSecurityReviewRecordIds: selectedProviderSecurityReviewRecordIds,
      targetAudience,
      procurementDomain,
      evidenceClass,
      procurementOwnerLabel: procurementOwnerLabel.trim(),
      buyerSegmentLabel: buyerSegmentLabel.trim(),
      externalSystemLabel: externalSystemLabel.trim(),
      evidenceRoutingLabel: evidenceRoutingLabel.trim(),
      evidenceRoutingLocator: evidenceRoutingLocator.trim(),
      responseCadence: responseCadence.trim(),
      procurementRiskTier,
      securityQuestionnaireRetainedExternally: true,
      socReportRetainedExternally: true,
      pentestReportRetainedExternally: true,
      signedLegalArtifactsRetainedExternally: true,
      credentialStorageDisabled: true,
      phiProcessingDisabled: true,
      confidentialAnswerStorageDisabled: true,
      humanApprovalRequired: true,
      externalDistributionDisabled: true,
      attestation: protectedProcurementEvidenceRegistryAttestation,
      dataBoundary: protectedProcurementEvidenceRegistryDataBoundary,
      reviewNote: reviewNote.trim()
    });
  }

  return (
    <section className="table-section" aria-label="Protected procurement evidence registry">
      <div className="section-heading">
        <p className="eyebrow">Procurement Evidence Registry</p>
        <h2>Route buyer diligence evidence without storing questionnaires, reports, credentials, PHI, or signed artifacts.</h2>
        <p className="section-copy">
          This registry turns security, privacy, legal, vendor-risk, technical, commercial,
          data-governance, and implementation diligence into buyer-specific routing metadata.
          It stores no questionnaire answers, SOC reports, penetration-test reports, signed
          legal artifacts, source contracts, credentials, URLs, PHI, or production approval.
        </p>
      </div>

      <div className="hub-summary demo-readiness-summary" aria-label="Procurement evidence summary">
        <article>
          <span>Registry state</span>
          <strong>{workflow?.registryState ?? "procurement-evidence-routing-open"}</strong>
        </article>
        <article>
          <span>Distribution</span>
          <strong>{workflow?.externalDistributionState ?? "distribution-disabled"}</strong>
        </article>
        <article>
          <span>Procurement controls</span>
          <strong>
            {workflow?.summary.linkedProcurementControlCount ?? 0}/
            {workflow?.summary.requiredProcurementControlCount ?? 14}
          </strong>
        </article>
        <article>
          <span>Ready security reviews</span>
          <strong>
            {workflow?.summary.availableProviderSecurityReviewCount ??
              selectedProviderSecurityReviewRecordIds.length}
          </strong>
        </article>
      </div>

      <div className="evaluation-form">
        <div className="form-section">
          <label className="form-field">
            <span>Target audience</span>
            <select
              onChange={(event) =>
                setTargetAudience(event.target.value as ProtectedProcurementBuyerAudience)
              }
              value={targetAudience}
            >
              {protectedProcurementBuyerAudiences.map((audience) => (
                <option key={audience.id} value={audience.id}>
                  {audience.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Procurement domain</span>
            <select
              onChange={(event) =>
                setProcurementDomain(event.target.value as ProtectedProcurementDomain)
              }
              value={procurementDomain}
            >
              {protectedProcurementDomains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Evidence class</span>
            <select
              onChange={(event) =>
                setEvidenceClass(event.target.value as ProtectedProcurementEvidenceClass)
              }
              value={evidenceClass}
            >
              {protectedProcurementEvidenceClasses.map((record) => (
                <option key={record.id} value={record.id}>
                  {record.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Procurement owner label</span>
            <input
              maxLength={140}
              onChange={(event) => setProcurementOwnerLabel(event.target.value)}
              required
              value={procurementOwnerLabel}
            />
          </label>
          <label className="form-field">
            <span>Buyer segment label</span>
            <input
              maxLength={140}
              onChange={(event) => setBuyerSegmentLabel(event.target.value)}
              required
              value={buyerSegmentLabel}
            />
          </label>
          <label className="form-field">
            <span>External system label</span>
            <input
              maxLength={140}
              onChange={(event) => setExternalSystemLabel(event.target.value)}
              required
              value={externalSystemLabel}
            />
            <small>Use a non-secret system label only; do not paste a URL, token, report, or questionnaire.</small>
          </label>
          <label className="form-field">
            <span>Evidence routing label</span>
            <input
              maxLength={140}
              onChange={(event) => setEvidenceRoutingLabel(event.target.value)}
              required
              value={evidenceRoutingLabel}
            />
          </label>
          <label className="form-field">
            <span>Evidence routing locator</span>
            <input
              maxLength={160}
              onChange={(event) => setEvidenceRoutingLocator(event.target.value)}
              required
              value={evidenceRoutingLocator}
            />
            <small>Use metadata such as external-system:evidence-room; URLs and secrets are blocked.</small>
          </label>
          <label className="form-field">
            <span>Response cadence</span>
            <input
              maxLength={120}
              onChange={(event) => setResponseCadence(event.target.value)}
              required
              value={responseCadence}
            />
          </label>
          <label className="form-field">
            <span>Procurement risk</span>
            <select
              onChange={(event) =>
                setProcurementRiskTier(event.target.value as ProtectedProcurementRiskTier)
              }
              value={procurementRiskTier}
            >
              {protectedProcurementRiskTiers.map((tier) => (
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
          <button className="button-primary" disabled={!canRecord} onClick={recordRegistry} type="button">
            {busy ? "Recording..." : "Record Procurement Evidence Routing"}
          </button>
          <button
            className="button-secondary"
            disabled={packetBusy}
            onClick={onDownloadPacket}
            type="button"
          >
            {packetBusy ? "Preparing..." : "Download Procurement Evidence Packet"}
          </button>
        </div>

        {!canRecord ? (
          <p className="form-note">
            Record a low or moderate risk provider security review with all required controls before
            creating procurement evidence routing metadata.
          </p>
        ) : null}
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Audience</th>
              <th>Domain</th>
              <th>Status</th>
              <th>Risk</th>
              <th>Distribution</th>
              <th>Recorded</th>
            </tr>
          </thead>
          <tbody>
            {workflow?.records.length ? (
              workflow.records.map((record) => (
                <tr key={record.id}>
                  <td>
                    <strong>{record.targetAudienceLabel}</strong>
                    <span>{record.buyerSegmentLabel}</span>
                  </td>
                  <td>
                    <strong>{record.procurementDomainLabel}</strong>
                    <span>{record.evidenceClassLabel}</span>
                  </td>
                  <td>
                    <span className={statusClass(record.registryStatus)}>
                      {record.registryStatus}
                    </span>
                  </td>
                  <td>{record.procurementRiskTier}</td>
                  <td>{record.externalDistributionDisabled ? "disabled" : "blocked"}</td>
                  <td>{formatDate(record.recordedAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>No protected procurement evidence routing metadata recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="quality-grid">
        <article>
          <h3>Target Audiences</h3>
          <ul>
            {(workflow?.targetAudienceExpansion ?? []).slice(0, 5).map((audience) => (
              <li key={audience}>{audience}</li>
            ))}
          </ul>
        </article>
        <article>
          <h3>Competitive Edge</h3>
          <ul>
            {(workflow?.competitiveEdges ?? []).slice(0, 4).map((edge) => (
              <li key={edge}>{edge}</li>
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
