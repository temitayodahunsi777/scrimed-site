"use client";

import { useMemo, useState } from "react";
import {
  protectedNamedReviewerSignoffAttestation,
  protectedNamedReviewerSignoffDataBoundary,
  protectedReviewerRoles,
  type ProtectedNamedReviewerSignoffInput,
  type ProtectedNamedReviewerSignoffWorkflow,
  type ProtectedReviewerRole
} from "../lib/protectedNamedReviewerSignoffs";
import type { ProtectedReleaseDecisionWorkflow } from "../lib/protectedReleaseDecisionWorkflow";

function statusClass(status: string) {
  if (status === "ready-for-controlled-distribution-review-not-release-authority") {
    return "status-pill status-pill-pass";
  }

  if (status.includes("blocked") || status.includes("missing") || status.includes("expired")) {
    return "status-pill status-pill-warn";
  }

  return "status-pill";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "pending";

  const time = new Date(value).getTime();

  return Number.isFinite(time) ? new Date(time).toISOString() : "pending";
}

function defaultExpiryDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 90);

  return date.toISOString().slice(0, 10);
}

export default function ProtectedNamedReviewerSignoffPanel({
  busy,
  onDownloadPacket,
  onRecordSignoff,
  packetBusy,
  releaseWorkflow,
  workflow
}: {
  busy: boolean;
  onDownloadPacket: () => Promise<void>;
  onRecordSignoff: (input: ProtectedNamedReviewerSignoffInput) => Promise<void>;
  packetBusy: boolean;
  releaseWorkflow: ProtectedReleaseDecisionWorkflow | null;
  workflow: ProtectedNamedReviewerSignoffWorkflow | null;
}) {
  const [reviewerRole, setReviewerRole] = useState<ProtectedReviewerRole>("qualified-counsel");
  const [releaseDecisionId, setReleaseDecisionId] = useState("");
  const [reviewerDisplayName, setReviewerDisplayName] = useState("qualified reviewer");
  const [reviewerOrganization, setReviewerOrganization] = useState("external review channel");
  const [signoffReferenceLabel, setSignoffReferenceLabel] = useState("bounded reviewer signoff");
  const [signoffReferenceLocator, setSignoffReferenceLocator] = useState("review-room:claim-signoff");
  const [artifactScope, setArtifactScope] = useState("claim registry and buyer diligence packet");
  const [approvedClaimVersion, setApprovedClaimVersion] = useState("claims-v1.0.0");
  const [distributionScope, setDistributionScope] = useState("controlled buyer diligence review");
  const [expiresAt, setExpiresAt] = useState(defaultExpiryDate);
  const [reviewNote, setReviewNote] = useState("metadata-only signoff reference no phi");
  const readyReleaseDecisions = useMemo(
    () =>
      releaseWorkflow?.records.filter(
        (record) =>
          record.decisionStatus === "ready-for-qualified-release-review-not-release-authority"
      ) ?? [],
    [releaseWorkflow?.records]
  );
  const selectedRole =
    protectedReviewerRoles.find((role) => role.id === reviewerRole) ?? protectedReviewerRoles[0];

  async function recordSignoff() {
    const selectedDecision =
      readyReleaseDecisions.find((record) => record.id === releaseDecisionId) ??
      readyReleaseDecisions[0] ??
      null;

    await onRecordSignoff({
      reviewerRole,
      releaseDecisionId: releaseDecisionId || selectedDecision?.id,
      reviewerDisplayName: reviewerDisplayName.trim(),
      reviewerOrganization: reviewerOrganization.trim(),
      signoffReferenceLabel: signoffReferenceLabel.trim(),
      signoffReferenceLocator: signoffReferenceLocator.trim(),
      artifactScope:
        artifactScope.trim() ||
        (selectedDecision ? `${selectedDecision.claimCategory} claim registry version` : ""),
      approvedClaimVersion: approvedClaimVersion.trim() || selectedDecision?.claimVersion || "",
      distributionScope:
        distributionScope.trim() ||
        (selectedDecision ? `${selectedDecision.releaseAudience} controlled review` : ""),
      expiresAt,
      externalSignoffRetained: true,
      attestation: protectedNamedReviewerSignoffAttestation,
      dataBoundary: protectedNamedReviewerSignoffDataBoundary,
      reviewNote: reviewNote.trim()
    });
  }

  return (
    <section className="table-section" aria-label="Protected named reviewer sign-offs">
      <div className="section-heading">
        <p className="eyebrow">Named Reviewer Sign-Offs</p>
        <h2>Complete reviewer coverage before controlled distribution review.</h2>
        <p className="section-copy">
          This layer records metadata references to externally retained sign-offs from finance, counsel,
          executive, privacy, clinical governance, marketing, and buyer-permission reviewers. It can show
          readiness for controlled distribution review, but it is not public release authority.
        </p>
      </div>

      <div className="hub-summary demo-readiness-summary" aria-label="Named reviewer sign-off summary">
        <article>
          <span>Sign-off state</span>
          <strong>{workflow?.signoffState ?? "named-signoff-open"}</strong>
        </article>
        <article>
          <span>Distribution review</span>
          <strong>
            {workflow?.controlledDistributionReviewState ??
              "blocked-pending-release-decision-and-signoffs"}
          </strong>
        </article>
        <article>
          <span>Reviewer roles</span>
          <strong>
            {workflow?.summary.linkedReviewerRoleCount ?? 0}/
            {workflow?.summary.requiredReviewerRoleCount ?? protectedReviewerRoles.length}
          </strong>
        </article>
        <article>
          <span>Ready decisions</span>
          <strong>{workflow?.summary.readyReleaseDecisionCount ?? readyReleaseDecisions.length}</strong>
        </article>
      </div>

      <div className="evaluation-form">
        <div className="form-section">
          <label className="form-field">
            <span>Reviewer role</span>
            <select
              onChange={(event) => setReviewerRole(event.target.value as ProtectedReviewerRole)}
              value={reviewerRole}
            >
              {protectedReviewerRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label}
                </option>
              ))}
            </select>
            <small>{selectedRole.requiredScope}</small>
          </label>
          <label className="form-field">
            <span>Release decision</span>
            <select
              onChange={(event) => {
                const nextDecisionId = event.target.value;
                const decision = readyReleaseDecisions.find((record) => record.id === nextDecisionId);

                setReleaseDecisionId(nextDecisionId);
                if (decision) {
                  setApprovedClaimVersion(decision.claimVersion);
                  setArtifactScope(`${decision.claimCategory} claim registry version`);
                  setDistributionScope(`${decision.releaseAudience} controlled review`);
                }
              }}
              value={releaseDecisionId}
            >
              <option value="">Use latest ready release decision when available</option>
              {readyReleaseDecisions.map((record) => (
                <option key={record.id} value={record.id}>
                  {record.claimVersion} - {record.releaseAudience}
                </option>
              ))}
            </select>
            <small>Link only to release decisions already ready for qualified review.</small>
          </label>
          <label className="form-field">
            <span>Reviewer display name</span>
            <input
              maxLength={80}
              onChange={(event) => setReviewerDisplayName(event.target.value)}
              required
              value={reviewerDisplayName}
            />
            <small>Use a bounded label, not an email, phone number, signature, or credential.</small>
          </label>
          <label className="form-field">
            <span>Reviewer organization</span>
            <input
              maxLength={100}
              onChange={(event) => setReviewerOrganization(event.target.value)}
              required
              value={reviewerOrganization}
            />
          </label>
          <label className="form-field">
            <span>External reference label</span>
            <input
              maxLength={120}
              onChange={(event) => setSignoffReferenceLabel(event.target.value)}
              required
              value={signoffReferenceLabel}
            />
          </label>
          <label className="form-field">
            <span>External reference locator</span>
            <input
              maxLength={140}
              onChange={(event) => setSignoffReferenceLocator(event.target.value)}
              required
              value={signoffReferenceLocator}
            />
            <small>Use an external-system locator only, not a URL, token, signed document, or secret.</small>
          </label>
          <label className="form-field form-field-wide">
            <span>Artifact scope</span>
            <input
              maxLength={160}
              onChange={(event) => setArtifactScope(event.target.value)}
              required
              value={artifactScope}
            />
          </label>
          <label className="form-field">
            <span>Approved claim version</span>
            <input
              maxLength={40}
              onChange={(event) => setApprovedClaimVersion(event.target.value)}
              required
              value={approvedClaimVersion}
            />
          </label>
          <label className="form-field">
            <span>Expires</span>
            <input
              onChange={(event) => setExpiresAt(event.target.value)}
              required
              type="date"
              value={expiresAt}
            />
          </label>
          <label className="form-field form-field-wide">
            <span>Distribution scope</span>
            <input
              maxLength={140}
              onChange={(event) => setDistributionScope(event.target.value)}
              required
              value={distributionScope}
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
          <button className="primary-action" disabled={busy} onClick={recordSignoff} type="button">
            {busy ? "Recording Sign-Off" : "Record Sign-Off Metadata"}
          </button>
          <button
            className="secondary-action"
            disabled={packetBusy}
            onClick={() => void onDownloadPacket()}
            type="button"
          >
            {packetBusy ? "Downloading Packet" : "Download Sign-Off Packet"}
          </button>
        </div>
      </div>

      <div className="demo-runbook" aria-label="Named reviewer role coverage">
        {protectedReviewerRoles.map((role) => {
          const linked = workflow?.linkedReviewerRoles.includes(role.id) ?? false;
          const missing = workflow?.missingReviewerRoles.includes(role.id) ?? true;
          const expired = workflow?.expiredRoles.includes(role.id) ?? false;
          const expiringSoon = workflow?.expiringSoonRoles.includes(role.id) ?? false;

          return (
            <article className="module-row" key={role.id}>
              <div>
                <span>{role.domain}</span>
                <h2>{role.label}</h2>
              </div>
              <p>{role.requiredScope}</p>
              <strong
                className={statusClass(
                  expired ? "expired" : missing ? "missing" : expiringSoon ? "expiring" : "ready"
                )}
              >
                {expired ? "expired" : linked ? (expiringSoon ? "expiring soon" : "linked") : "missing"}
              </strong>
            </article>
          );
        })}
      </div>

      <div className="demo-runbook" aria-label="Named reviewer sign-off records">
        {(workflow?.records ?? []).length > 0 ? (
          workflow?.records.map((record) => (
            <article className="module-row" key={record.id}>
              <div>
                <span>{record.reviewerRole}</span>
                <h2>
                  {record.reviewerRoleLabel}: {record.approvedClaimVersion}
                </h2>
              </div>
              <p>
                {record.artifactScope} for {record.distributionScope}. Reference:{" "}
                {record.signoffReferenceLabel}. Expires {formatDate(record.expiresAt)}.
              </p>
              <strong className={statusClass(record.signoffStatus)}>{record.signoffStatus}</strong>
            </article>
          ))
        ) : (
          <article className="module-row">
            <div>
              <span>sign-off metadata</span>
              <h2>No named reviewer sign-off metadata recorded yet.</h2>
            </div>
            <p>
              Record metadata references after the actual reviewer approvals are retained outside SCRIMED.
            </p>
            <strong>Distribution review remains blocked.</strong>
          </article>
        )}
      </div>

      <div className="demo-runbook" aria-label="Named reviewer sign-off safeguards">
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
