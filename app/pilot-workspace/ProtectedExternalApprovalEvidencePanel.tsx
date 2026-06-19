"use client";

import { useMemo, useState } from "react";
import {
  protectedExternalApprovalEvidenceAttestation,
  protectedExternalApprovalEvidenceDataBoundary,
  protectedExternalApprovalEvidenceDomains,
  type ProtectedExternalApprovalEvidenceDomainId,
  type ProtectedExternalApprovalEvidenceInput,
  type ProtectedExternalApprovalEvidenceSystem,
  type ProtectedExternalApprovalEvidenceWorkflow
} from "../lib/protectedExternalApprovalEvidence";
import type { ProtectedFinanceMethodologyWorkflow } from "../lib/protectedFinanceMethodology";

const defaultSystem: ProtectedExternalApprovalEvidenceSystem = "external-secure-channel";

function statusClass(status: string) {
  if (status === "metadata-reference-recorded") return "status-pill status-pill-pass";
  if (status === "not-recorded") return "status-pill status-pill-warn";
  return "status-pill";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "pending";

  const time = new Date(value).getTime();

  return Number.isFinite(time) ? new Date(time).toISOString() : "pending";
}

export default function ProtectedExternalApprovalEvidencePanel({
  busyDomainId,
  financeWorkflow,
  onDownloadPacket,
  onRecordReference,
  packetBusy,
  workflow
}: {
  busyDomainId: string | null;
  financeWorkflow: ProtectedFinanceMethodologyWorkflow | null;
  onDownloadPacket: () => Promise<void>;
  onRecordReference: (input: ProtectedExternalApprovalEvidenceInput) => Promise<void>;
  packetBusy: boolean;
  workflow: ProtectedExternalApprovalEvidenceWorkflow | null;
}) {
  const [selectedDomainId, setSelectedDomainId] =
    useState<ProtectedExternalApprovalEvidenceDomainId>("finance-methodology-policy");
  const [selectedFinanceGateRecordId, setSelectedFinanceGateRecordId] = useState("");
  const [externalSystem, setExternalSystem] =
    useState<ProtectedExternalApprovalEvidenceSystem>(defaultSystem);
  const [externalReferenceLabel, setExternalReferenceLabel] =
    useState("External approval reference no PHI");
  const [referenceLocator, setReferenceLocator] =
    useState("external-secure-channel:approval-reference");
  const [referenceOwner, setReferenceOwner] = useState("qualified external reviewer");
  const [reviewNote, setReviewNote] = useState("metadata-only external approval reference");
  const selectedDomain = useMemo(
    () =>
      protectedExternalApprovalEvidenceDomains.find((domain) => domain.id === selectedDomainId) ??
      protectedExternalApprovalEvidenceDomains[0],
    [selectedDomainId]
  );
  const candidateFinanceGateRecords = useMemo(
    () =>
      (financeWorkflow?.records ?? []).filter(
        (record) => record.gateId === selectedDomain.relatedFinanceGateId
      ),
    [financeWorkflow?.records, selectedDomain.relatedFinanceGateId]
  );
  const selectedFinanceGateRecord =
    candidateFinanceGateRecords.find((record) => record.id === selectedFinanceGateRecordId) ??
    candidateFinanceGateRecords[0] ??
    null;
  const domains = workflow?.domains ?? protectedExternalApprovalEvidenceDomains.map((domain) => ({
    ...domain,
    referenceStatus: "not-recorded" as const,
    latestRecord: null,
    linkedFinanceGateRecord: null
  }));

  function onSelectDomain(domainId: ProtectedExternalApprovalEvidenceDomainId) {
    const nextDomain = protectedExternalApprovalEvidenceDomains.find((domain) => domain.id === domainId);

    setSelectedDomainId(domainId);
    setSelectedFinanceGateRecordId("");
    setExternalSystem(nextDomain?.acceptableExternalSystems.includes(externalSystem)
      ? externalSystem
      : defaultSystem);
  }

  async function recordReference(domainId: ProtectedExternalApprovalEvidenceDomainId = selectedDomainId) {
    const targetDomain =
      protectedExternalApprovalEvidenceDomains.find((domain) => domain.id === domainId) ??
      selectedDomain;
    const financeGateRecord =
      (financeWorkflow?.records ?? []).find(
        (record) =>
          record.id === selectedFinanceGateRecordId ||
          record.gateId === targetDomain.relatedFinanceGateId
      ) ?? null;
    const targetExternalSystem = targetDomain.acceptableExternalSystems.includes(externalSystem)
      ? externalSystem
      : defaultSystem;

    await onRecordReference({
      domainId,
      financeGateRecordId: financeGateRecord?.id || undefined,
      externalReferenceLabel: externalReferenceLabel.trim(),
      externalSystem: targetExternalSystem,
      referenceLocator: referenceLocator.trim(),
      referenceOwner: referenceOwner.trim(),
      evidenceRetainedExternally: true,
      attestation: protectedExternalApprovalEvidenceAttestation,
      dataBoundary: protectedExternalApprovalEvidenceDataBoundary,
      reviewNote: reviewNote.trim()
    });
  }

  return (
    <section className="table-section" aria-label="Protected external approval evidence linkage">
      <div className="section-heading">
        <p className="eyebrow">External Approval Evidence</p>
        <h2>Reference qualified approvals without storing sensitive artifacts.</h2>
        <p className="section-copy">
          This layer records metadata-only links to externally retained finance, counsel, security, clinical,
          claims, executive, and buyer-permission evidence. It does not create approval or release authority;
          external use stays blocked until qualified reviewers approve the actual retained artifacts.
        </p>
      </div>

      <div className="hub-summary demo-readiness-summary" aria-label="External approval evidence summary">
        <article>
          <span>Evidence linkage</span>
          <strong>{workflow?.evidenceLinkageState ?? "external-approval-linkage-open"}</strong>
        </article>
        <article>
          <span>Release readiness</span>
          <strong>
            {workflow?.releaseReadinessStatus ??
              "external-use-blocked-pending-qualified-approval-references"}
          </strong>
        </article>
        <article>
          <span>Domains recorded</span>
          <strong>
            {workflow?.summary.recordedDomainCount ?? 0}/{workflow?.summary.domainCount ?? domains.length}
          </strong>
        </article>
        <article>
          <span>Linked finance gates</span>
          <strong>{workflow?.summary.linkedFinanceGateRecordCount ?? 0}</strong>
        </article>
      </div>

      <div className="evaluation-form">
        <div className="form-section">
          <label className="form-field">
            <span>Evidence domain</span>
            <select
              onChange={(event) =>
                onSelectDomain(event.target.value as ProtectedExternalApprovalEvidenceDomainId)
              }
              value={selectedDomainId}
            >
              {protectedExternalApprovalEvidenceDomains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.label}
                </option>
              ))}
            </select>
            <small>{selectedDomain.referencePurpose}</small>
          </label>
          <label className="form-field">
            <span>Related finance gate</span>
            <select
              onChange={(event) => setSelectedFinanceGateRecordId(event.target.value)}
              value={selectedFinanceGateRecord?.id ?? ""}
            >
              <option value="">No recorded gate link</option>
              {candidateFinanceGateRecords.map((record) => (
                <option key={record.id} value={record.id}>
                  {record.gateLabel} - {formatDate(record.signedAt)}
                </option>
              ))}
            </select>
            <small>Optional no-PHI linkage to the matching finance methodology gate record.</small>
          </label>
          <label className="form-field">
            <span>External system</span>
            <select
              onChange={(event) =>
                setExternalSystem(event.target.value as ProtectedExternalApprovalEvidenceSystem)
              }
              value={externalSystem}
            >
              {selectedDomain.acceptableExternalSystems.map((system) => (
                <option key={system} value={system}>
                  {system}
                </option>
              ))}
            </select>
            <small>The actual approval artifact must stay outside SCRIMED.</small>
          </label>
          <label className="form-field">
            <span>Reference label</span>
            <input
              maxLength={120}
              onChange={(event) => setExternalReferenceLabel(event.target.value)}
              required
              value={externalReferenceLabel}
            />
          </label>
          <label className="form-field">
            <span>Reference locator</span>
            <input
              maxLength={160}
              onChange={(event) => setReferenceLocator(event.target.value)}
              required
              value={referenceLocator}
            />
            <small>Use a short non-secret locator, not a signed URL, password, token, or source document.</small>
          </label>
          <label className="form-field">
            <span>Reference owner</span>
            <input
              maxLength={80}
              onChange={(event) => setReferenceOwner(event.target.value)}
              required
              value={referenceOwner}
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
            <small>No PHI, credentials, source contracts, signed BAAs/DPAs, legal opinions, audited financials, securities material, clinical validation, or customer approval artifacts.</small>
          </label>
        </div>
        <div className="form-actions">
          <button
            className="primary-action"
            disabled={busyDomainId === selectedDomainId}
            onClick={() => void recordReference()}
            type="button"
          >
            {busyDomainId === selectedDomainId ? "Recording Reference" : "Record Metadata Reference"}
          </button>
          <button
            className="secondary-action"
            disabled={packetBusy}
            onClick={() => void onDownloadPacket()}
            type="button"
          >
            {packetBusy ? "Downloading Packet" : "Download Evidence Linkage Packet"}
          </button>
        </div>
      </div>

      <div className="demo-runbook" aria-label="External approval evidence domains">
        {domains.map((domain) => (
          <article className="module-row" key={domain.id}>
            <div>
              <span>{domain.reviewerRole}</span>
              <h2>{domain.label}</h2>
            </div>
            <p>
              {domain.referencePurpose} Latest reference{" "}
              {formatDate(domain.latestRecord?.recordedAt)}. Boundary: {domain.boundary}
            </p>
            <div>
              <strong className={statusClass(domain.referenceStatus)}>{domain.referenceStatus}</strong>
              <button
                className="secondary-action"
                disabled={busyDomainId === domain.id}
                onClick={() => {
                  onSelectDomain(domain.id);
                  void recordReference(domain.id);
                }}
                type="button"
              >
                {busyDomainId === domain.id ? "Recording" : "Record This Domain"}
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="demo-runbook" aria-label="External approval evidence safeguards">
        <div className="section-heading">
          <p className="eyebrow">Safe workarounds</p>
          <h2>Approval artifacts stay externally retained.</h2>
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
