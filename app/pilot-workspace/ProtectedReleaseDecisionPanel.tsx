"use client";

import { useMemo, useState } from "react";
import type { ProtectedExternalApprovalEvidenceWorkflow } from "../lib/protectedExternalApprovalEvidence";
import {
  protectedClaimCategories,
  protectedReleaseAudiences,
  protectedReleaseDecisionAttestation,
  protectedReleaseDecisionDataBoundary,
  type ProtectedClaimCategory,
  type ProtectedReleaseAudience,
  type ProtectedReleaseDecisionInput,
  type ProtectedReleaseDecisionWorkflow
} from "../lib/protectedReleaseDecisionWorkflow";

function statusClass(status: string) {
  if (status === "ready-for-qualified-release-review-not-release-authority") {
    return "status-pill status-pill-pass";
  }

  if (status.includes("blocked") || status.includes("missing")) {
    return "status-pill status-pill-warn";
  }

  return "status-pill";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "pending";

  const time = new Date(value).getTime();

  return Number.isFinite(time) ? new Date(time).toISOString() : "pending";
}

export default function ProtectedReleaseDecisionPanel({
  busy,
  externalWorkflow,
  onDownloadPacket,
  onRecordDecision,
  packetBusy,
  workflow
}: {
  busy: boolean;
  externalWorkflow: ProtectedExternalApprovalEvidenceWorkflow | null;
  onDownloadPacket: () => Promise<void>;
  onRecordDecision: (input: ProtectedReleaseDecisionInput) => Promise<void>;
  packetBusy: boolean;
  workflow: ProtectedReleaseDecisionWorkflow | null;
}) {
  const [releaseAudience, setReleaseAudience] =
    useState<ProtectedReleaseAudience>("buyer-diligence");
  const [claimCategory, setClaimCategory] = useState<ProtectedClaimCategory>("governance");
  const [claimVersion, setClaimVersion] = useState("claims-v1.0.0");
  const [claimText, setClaimText] = useState(
    "SCRIMED provides governed synthetic pilot evidence for healthcare workflow intelligence review."
  );
  const [distributionChannel, setDistributionChannel] = useState("buyer-data-room");
  const [reviewNote, setReviewNote] = useState("no-phi release decision readiness review");
  const latestEvidenceRecords = useMemo(
    () =>
      (externalWorkflow?.domains ?? [])
        .map((domain) => domain.latestRecord)
        .filter((record): record is NonNullable<typeof record> => Boolean(record)),
    [externalWorkflow?.domains]
  );
  const selectedAudience =
    protectedReleaseAudiences.find((audience) => audience.id === releaseAudience) ??
    protectedReleaseAudiences[0];
  const selectedCategory =
    protectedClaimCategories.find((category) => category.id === claimCategory) ??
    protectedClaimCategories[0];
  const missingDomains = workflow?.missingApprovalDomains ?? selectedCategory.requiredApprovalDomains;

  async function recordDecision() {
    await onRecordDecision({
      releaseAudience,
      claimCategory,
      claimVersion: claimVersion.trim(),
      claimText: claimText.trim(),
      distributionChannel: distributionChannel.trim(),
      externalApprovalEvidenceRecordIds: latestEvidenceRecords.map((record) => record.id),
      attestation: protectedReleaseDecisionAttestation,
      dataBoundary: protectedReleaseDecisionDataBoundary,
      reviewNote: reviewNote.trim()
    });
  }

  return (
    <section className="table-section" aria-label="Protected release decision workflow">
      <div className="section-heading">
        <p className="eyebrow">Release Decision Workflow</p>
        <h2>Version claims before any buyer, investor, PR, or public release.</h2>
        <p className="section-copy">
          This layer turns external approval evidence into a guarded claim registry decision. It can mark
          language ready for qualified release review, but it cannot approve public release, clinical use,
          securities claims, customer references, or advertising substantiation.
        </p>
      </div>

      <div className="hub-summary demo-readiness-summary" aria-label="Release decision summary">
        <article>
          <span>Claim registry</span>
          <strong>{workflow?.claimRegistryState ?? "claim-registry-open"}</strong>
        </article>
        <article>
          <span>Release decision</span>
          <strong>{workflow?.releaseDecisionState ?? "release-blocked-pending-external-evidence"}</strong>
        </article>
        <article>
          <span>Approval domains</span>
          <strong>
            {workflow?.summary.linkedDomainCount ?? latestEvidenceRecords.length}/
            {workflow?.summary.requiredDomainCount ?? selectedCategory.requiredApprovalDomains.length}
          </strong>
        </article>
        <article>
          <span>Ready decisions</span>
          <strong>{workflow?.summary.readyForReviewCount ?? 0}</strong>
        </article>
      </div>

      <div className="evaluation-form">
        <div className="form-section">
          <label className="form-field">
            <span>Release audience</span>
            <select
              onChange={(event) => setReleaseAudience(event.target.value as ProtectedReleaseAudience)}
              value={releaseAudience}
            >
              {protectedReleaseAudiences.map((audience) => (
                <option key={audience.id} value={audience.id}>
                  {audience.label}
                </option>
              ))}
            </select>
            <small>{selectedAudience.requiredDistributionControl}</small>
          </label>
          <label className="form-field">
            <span>Claim category</span>
            <select
              onChange={(event) => setClaimCategory(event.target.value as ProtectedClaimCategory)}
              value={claimCategory}
            >
              {protectedClaimCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
            <small>{selectedCategory.boundary}</small>
          </label>
          <label className="form-field">
            <span>Claim version</span>
            <input
              maxLength={40}
              onChange={(event) => setClaimVersion(event.target.value)}
              required
              value={claimVersion}
            />
          </label>
          <label className="form-field">
            <span>Distribution channel</span>
            <input
              maxLength={120}
              onChange={(event) => setDistributionChannel(event.target.value)}
              required
              value={distributionChannel}
            />
            <small>Use a channel label only, not a URL, token, signed document, or secret.</small>
          </label>
          <label className="form-field form-field-wide">
            <span>Claim text</span>
            <input
              maxLength={220}
              onChange={(event) => setClaimText(event.target.value)}
              required
              value={claimText}
            />
            <small>
              Keep language bounded, non-diagnostic, non-certified, non-guaranteed, and synthetic-pilot safe.
            </small>
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
          <button className="primary-action" disabled={busy} onClick={recordDecision} type="button">
            {busy ? "Recording Decision" : "Record Release Decision"}
          </button>
          <button
            className="secondary-action"
            disabled={packetBusy}
            onClick={() => void onDownloadPacket()}
            type="button"
          >
            {packetBusy ? "Downloading Packet" : "Download Claim Registry Packet"}
          </button>
        </div>
      </div>

      <div className="demo-runbook" aria-label="Release decision approval coverage">
        <article className="module-row">
          <div>
            <span>external evidence</span>
            <h2>
              {latestEvidenceRecords.length} latest approval metadata references linked for the next decision.
            </h2>
          </div>
          <p>
            External evidence state:{" "}
            {externalWorkflow?.releaseReadinessStatus ??
              "external-use-blocked-pending-qualified-approval-references"}
            . Latest reference {formatDate(externalWorkflow?.summary.latestReferenceAt)}.
          </p>
          <strong className={statusClass(missingDomains.length ? "blocked" : "ready")}>
            {missingDomains.length ? `${missingDomains.length} domains missing` : "all domains linked"}
          </strong>
        </article>
        {missingDomains.map((domainId) => (
          <article className="module-row" key={domainId}>
            <div>
              <span>missing approval domain</span>
              <h2>{domainId}</h2>
            </div>
            <p>Record metadata-only external approval evidence for this domain before qualified release review.</p>
            <strong className="status-pill status-pill-warn">release blocked</strong>
          </article>
        ))}
      </div>

      <div className="demo-runbook" aria-label="Release decision records">
        {(workflow?.records ?? []).length > 0 ? (
          workflow?.records.map((record) => (
            <article className="module-row" key={record.id}>
              <div>
                <span>{record.releaseAudience}</span>
                <h2>
                  {record.claimVersion}: {record.claimCategory}
                </h2>
              </div>
              <p>
                {record.claimText} Recorded {formatDate(record.recordedAt)}. Distribution channel:{" "}
                {record.distributionChannel}.
              </p>
              <strong className={statusClass(record.decisionStatus)}>{record.decisionStatus}</strong>
            </article>
          ))
        ) : (
          <article className="module-row">
            <div>
              <span>claim registry</span>
              <h2>No release decisions recorded yet.</h2>
            </div>
            <p>Record a bounded no-PHI claim version after external approval evidence metadata is linked.</p>
            <strong>Public distribution remains blocked.</strong>
          </article>
        )}
      </div>

      <div className="demo-runbook" aria-label="Release decision safeguards">
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
