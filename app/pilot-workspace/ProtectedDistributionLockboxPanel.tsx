"use client";

import { useState } from "react";
import {
  protectedDistributionLockboxAttestation,
  protectedDistributionLockboxDataBoundary,
  type ProtectedDistributionAudience,
  type ProtectedDistributionChannelControl,
  type ProtectedDistributionLockboxInput,
  type ProtectedDistributionLockboxWorkflow
} from "../lib/protectedDistributionLockbox";
import type { ProtectedNamedReviewerSignoffWorkflow } from "../lib/protectedNamedReviewerSignoffs";

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

const channelControlOptions: Array<{
  value: ProtectedDistributionChannelControl;
  label: string;
}> = [
  { value: "external-data-room", label: "External data room" },
  { value: "counsel-reviewed-room", label: "Counsel-reviewed room" },
  { value: "procurement-portal", label: "Procurement portal" },
  { value: "board-governance-room", label: "Board governance room" },
  { value: "marketing-release-queue", label: "Marketing release queue" },
  { value: "pr-release-queue", label: "PR release queue" },
  { value: "customer-permission-room", label: "Customer permission room" }
];

function statusClass(status: string) {
  if (status.includes("ready") || status.includes("linked")) {
    return "status-pill status-pill-pass";
  }

  if (status.includes("blocked") || status.includes("missing") || status.includes("expired")) {
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

export default function ProtectedDistributionLockboxPanel({
  busy,
  onDownloadPacket,
  onRecordLockbox,
  packetBusy,
  signoffWorkflow,
  workflow
}: {
  busy: boolean;
  onDownloadPacket: () => Promise<void>;
  onRecordLockbox: (input: ProtectedDistributionLockboxInput) => Promise<void>;
  packetBusy: boolean;
  signoffWorkflow: ProtectedNamedReviewerSignoffWorkflow | null;
  workflow: ProtectedDistributionLockboxWorkflow | null;
}) {
  const [distributionAudience, setDistributionAudience] =
    useState<ProtectedDistributionAudience>("buyer-diligence-room");
  const [distributionChannelControl, setDistributionChannelControl] =
    useState<ProtectedDistributionChannelControl>("counsel-reviewed-room");
  const [manifestVersion, setManifestVersion] = useState("distribution-v1.0.0");
  const [manifestTitle, setManifestTitle] = useState("SCRIMED controlled buyer diligence packet");
  const [artifactManifestLabel, setArtifactManifestLabel] = useState(
    "controlled distribution manifest"
  );
  const [artifactManifestLocator, setArtifactManifestLocator] = useState(
    "external-lockbox:controlled-manifest"
  );
  const [customerPermissionReference, setCustomerPermissionReference] = useState(
    "external-permission-channel:pending"
  );
  const [counselReviewReference, setCounselReviewReference] = useState(
    "counsel-review-channel:pending"
  );
  const [distributionWindowStart, setDistributionWindowStart] = useState(() => defaultDate(1));
  const [distributionWindowEnd, setDistributionWindowEnd] = useState(() => defaultDate(90));
  const [recipientScope, setRecipientScope] = useState("named buyer diligence reviewers");
  const [revocationPlan, setRevocationPlan] = useState(
    "revoke access and re-review claims if scope changes"
  );
  const [reviewNote, setReviewNote] = useState("metadata-only disabled lockbox no phi");
  const availableSignoffs =
    workflow?.availableSignoffs && workflow.availableSignoffs.length > 0
      ? workflow.availableSignoffs
      : signoffWorkflow?.records.filter(
          (record) =>
            record.externalSignoffRetained &&
            !signoffWorkflow.expiredRoles.includes(record.reviewerRole)
        ) ?? [];
  const selectedSignoffIds = availableSignoffs.map((record) => record.id).slice(0, 14);
  const canRecord = selectedSignoffIds.length > 0 && !busy;

  async function recordLockbox() {
    await onRecordLockbox({
      signoffRecordIds: selectedSignoffIds,
      distributionAudience,
      distributionChannelControl,
      manifestVersion: manifestVersion.trim(),
      manifestTitle: manifestTitle.trim(),
      artifactManifestLabel: artifactManifestLabel.trim(),
      artifactManifestLocator: artifactManifestLocator.trim(),
      customerPermissionReference: customerPermissionReference.trim(),
      counselReviewReference: counselReviewReference.trim(),
      distributionWindowStart,
      distributionWindowEnd,
      recipientScope: recipientScope.trim(),
      revocationPlan: revocationPlan.trim(),
      externalApprovalsRetained: true,
      distributionDisabled: true,
      attestation: protectedDistributionLockboxAttestation,
      dataBoundary: protectedDistributionLockboxDataBoundary,
      reviewNote: reviewNote.trim()
    });
  }

  return (
    <section className="table-section" aria-label="Protected distribution lockbox">
      <div className="section-heading">
        <p className="eyebrow">Distribution Lockbox</p>
        <h2>Package approved evidence only as disabled, externally governed metadata.</h2>
        <p className="section-copy">
          This layer records no-PHI metadata for controlled buyer, investor, sales, marketing, PR, and
          customer-proof distribution paths. It keeps distribution disabled until real external approvals,
          customer permissions, and counsel-reviewed scope are retained outside SCRIMED.
        </p>
      </div>

      <div className="hub-summary demo-readiness-summary" aria-label="Distribution lockbox summary">
        <article>
          <span>Lockbox state</span>
          <strong>{workflow?.lockboxState ?? "distribution-lockbox-open"}</strong>
        </article>
        <article>
          <span>Distribution</span>
          <strong>{workflow?.distributionState ?? "external-distribution-disabled"}</strong>
        </article>
        <article>
          <span>Reviewer roles</span>
          <strong>
            {workflow?.summary.linkedReviewerRoleCount ?? 0}/
            {workflow?.summary.requiredReviewerRoleCount ?? 7}
          </strong>
        </article>
        <article>
          <span>Ready records</span>
          <strong>{workflow?.summary.readyForReviewCount ?? 0}</strong>
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
            <span>Channel control</span>
            <select
              onChange={(event) =>
                setDistributionChannelControl(
                  event.target.value as ProtectedDistributionChannelControl
                )
              }
              value={distributionChannelControl}
            >
              {channelControlOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Manifest version</span>
            <input
              maxLength={40}
              onChange={(event) => setManifestVersion(event.target.value)}
              required
              value={manifestVersion}
            />
          </label>
          <label className="form-field">
            <span>Manifest title</span>
            <input
              maxLength={140}
              onChange={(event) => setManifestTitle(event.target.value)}
              required
              value={manifestTitle}
            />
          </label>
          <label className="form-field">
            <span>Manifest label</span>
            <input
              maxLength={120}
              onChange={(event) => setArtifactManifestLabel(event.target.value)}
              required
              value={artifactManifestLabel}
            />
          </label>
          <label className="form-field">
            <span>Manifest locator</span>
            <input
              maxLength={140}
              onChange={(event) => setArtifactManifestLocator(event.target.value)}
              required
              value={artifactManifestLocator}
            />
            <small>Use an external locator label only, not a URL, secret, signed document, or artifact.</small>
          </label>
          <label className="form-field">
            <span>Customer permission reference</span>
            <input
              maxLength={140}
              onChange={(event) => setCustomerPermissionReference(event.target.value)}
              required
              value={customerPermissionReference}
            />
          </label>
          <label className="form-field">
            <span>Counsel review reference</span>
            <input
              maxLength={140}
              onChange={(event) => setCounselReviewReference(event.target.value)}
              required
              value={counselReviewReference}
            />
          </label>
          <label className="form-field">
            <span>Window start</span>
            <input
              onChange={(event) => setDistributionWindowStart(event.target.value)}
              required
              type="date"
              value={distributionWindowStart}
            />
          </label>
          <label className="form-field">
            <span>Window end</span>
            <input
              onChange={(event) => setDistributionWindowEnd(event.target.value)}
              required
              type="date"
              value={distributionWindowEnd}
            />
          </label>
          <label className="form-field form-field-wide">
            <span>Recipient scope</span>
            <input
              maxLength={140}
              onChange={(event) => setRecipientScope(event.target.value)}
              required
              value={recipientScope}
            />
          </label>
          <label className="form-field form-field-wide">
            <span>Revocation plan</span>
            <input
              maxLength={180}
              onChange={(event) => setRevocationPlan(event.target.value)}
              required
              value={revocationPlan}
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
          <button className="primary-action" disabled={!canRecord} onClick={recordLockbox} type="button">
            {busy ? "Recording Lockbox" : "Record Disabled Lockbox Metadata"}
          </button>
          <button
            className="secondary-action"
            disabled={packetBusy}
            onClick={() => void onDownloadPacket()}
            type="button"
          >
            {packetBusy ? "Downloading Packet" : "Download Lockbox Packet"}
          </button>
        </div>
      </div>

      <div className="demo-runbook" aria-label="Distribution lockbox sign-off coverage">
        {(workflow?.requiredReviewerRoles ?? []).map((role) => {
          const linked = workflow?.linkedReviewerRoles.includes(role.id) ?? false;
          const missing = workflow?.missingReviewerRoles.includes(role.id) ?? true;
          const expired = workflow?.expiredSignoffRoles.includes(role.id) ?? false;

          return (
            <article className="module-row" key={role.id}>
              <div>
                <span>{role.domain}</span>
                <h2>{role.label}</h2>
              </div>
              <p>{role.requiredScope}</p>
              <strong className={statusClass(expired ? "expired" : missing ? "missing" : "linked")}>
                {expired ? "expired" : linked ? "linked" : "missing"}
              </strong>
            </article>
          );
        })}
      </div>

      <div className="demo-runbook" aria-label="Distribution lockbox records">
        {(workflow?.records ?? []).length > 0 ? (
          workflow?.records.map((record) => (
            <article className="module-row" key={record.id}>
              <div>
                <span>{record.distributionAudience}</span>
                <h2>
                  {record.manifestVersion}: {record.manifestTitle}
                </h2>
              </div>
              <p>
                {record.distributionChannelControl} stays disabled for {record.recipientScope}. Window:
                {" "}
                {formatDate(record.distributionWindowStart)} to {formatDate(record.distributionWindowEnd)}.
              </p>
              <strong className={statusClass(record.lockboxStatus)}>{record.lockboxStatus}</strong>
            </article>
          ))
        ) : (
          <article className="module-row">
            <div>
              <span>lockbox metadata</span>
              <h2>No protected distribution lockbox metadata recorded yet.</h2>
            </div>
            <p>
              Record lockbox metadata only after reviewer sign-offs and actual external approvals are
              retained outside SCRIMED.
            </p>
            <strong>External distribution remains disabled.</strong>
          </article>
        )}
      </div>

      <div className="demo-runbook" aria-label="Distribution lockbox safeguards">
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
