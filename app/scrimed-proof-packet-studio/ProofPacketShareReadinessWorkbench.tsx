"use client";

import Link from "next/link";
import { useState } from "react";
import type {
  ProofPacketShareReadinessAssessment,
  ProofPacketShareReadinessOption
} from "../lib/proofPacketShareReadiness";

type ConfirmationState = {
  routeFreshnessConfirmed: boolean;
  limitationDisclosuresConfirmed: boolean;
  recipientClassConfirmed: boolean;
  noSensitiveDataConfirmed: boolean;
  protectedHandoffOnlyConfirmed: boolean;
};

type AssessmentResponse = {
  ok: boolean;
  data?: ProofPacketShareReadinessAssessment;
  error?: {
    code: string;
    message: string;
    fields?: string[];
  };
};

type Props = {
  apiRoute: string;
  packets: ProofPacketShareReadinessOption[];
  requiredConfirmations: string[];
};

const emptyConfirmations: ConfirmationState = {
  routeFreshnessConfirmed: false,
  limitationDisclosuresConfirmed: false,
  recipientClassConfirmed: false,
  noSensitiveDataConfirmed: false,
  protectedHandoffOnlyConfirmed: false
};

const confirmationFields: Array<{
  key: keyof ConfirmationState;
  label: string;
}> = [
  {
    key: "routeFreshnessConfirmed",
    label: "Canonical proof routes were checked for freshness."
  },
  {
    key: "limitationDisclosuresConfirmed",
    label: "Packet limitation disclosures remain visible."
  },
  {
    key: "recipientClassConfirmed",
    label: "Only a recipient category is represented; no identity or contact data is included."
  },
  {
    key: "noSensitiveDataConfirmed",
    label: "The packet contains no PHI, credentials, secrets, or protected workspace payloads."
  },
  {
    key: "protectedHandoffOnlyConfirmed",
    label: "This prepares protected intake and does not authorize or send an external share."
  }
];

function displayValue(value: string) {
  return value.replaceAll("_", " ").replaceAll("-", " ");
}

function buildReceipt(assessment: ProofPacketShareReadinessAssessment) {
  return [
    `# ${assessment.packet.title} - Protected Share Handoff`,
    "",
    `- Decision: ${assessment.decision}`,
    `- Assessment hash: ${assessment.assessmentHash}`,
    `- Packet fingerprint: ${assessment.packet.auditHash}`,
    `- Policy status: ${assessment.status}`,
    `- Assessed at: ${assessment.assessedAt}`,
    `- Recipient class: ${assessment.request.recipientClass}`,
    `- Purpose: ${assessment.request.purpose}`,
    `- Channel control: ${assessment.request.channelControl}`,
    `- External distribution authorized: ${assessment.authorities.externalDistributionAuthorized}`,
    "",
    "## Protected Handoff Draft",
    "",
    `- Route: ${assessment.protectedHandoff.route}`,
    `- Panel: ${assessment.protectedHandoff.panel}`,
    `- Distribution audience: ${assessment.protectedHandoff.distributionAudience}`,
    `- Manifest version: ${assessment.protectedHandoff.manifestVersion}`,
    `- Manifest locator: ${assessment.protectedHandoff.artifactManifestLocator}`,
    `- Distribution disabled: ${assessment.protectedHandoff.distributionDisabled}`,
    "",
    "## Missing External Evidence",
    "",
    ...assessment.missingExternalEvidence.map((item) => `- ${item}`),
    "",
    "## Retained Boundary",
    "",
    assessment.boundary,
    ""
  ].join("\n");
}

export default function ProofPacketShareReadinessWorkbench({
  apiRoute,
  packets,
  requiredConfirmations
}: Props) {
  const [selectedPacketId, setSelectedPacketId] = useState(packets[0]?.packetId ?? "");
  const selectedPacket =
    packets.find((packet) => packet.packetId === selectedPacketId) ?? packets[0];
  const [channelControl, setChannelControl] = useState(
    selectedPacket?.allowedChannels[0] ?? "counsel-reviewed-room"
  );
  const [confirmations, setConfirmations] =
    useState<ConfirmationState>(emptyConfirmations);
  const [assessment, setAssessment] =
    useState<ProofPacketShareReadinessAssessment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);

  if (!selectedPacket) {
    return <p>No external-facing proof packet manifests are configured.</p>;
  }

  function selectPacket(packetId: string) {
    const nextPacket = packets.find((packet) => packet.packetId === packetId);

    setSelectedPacketId(packetId);
    setChannelControl(nextPacket?.allowedChannels[0] ?? "counsel-reviewed-room");
    setConfirmations(emptyConfirmations);
    setAssessment(null);
    setError(null);
  }

  function updateConfirmation(key: keyof ConfirmationState, checked: boolean) {
    setConfirmations((current) => ({ ...current, [key]: checked }));
    setAssessment(null);
    setError(null);
  }

  async function assessReadiness() {
    setIsAssessing(true);
    setError(null);
    setAssessment(null);

    try {
      const response = await fetch(apiRoute, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packetId: selectedPacket.packetId,
          packetAuditHash: selectedPacket.auditHash,
          recipientClass: selectedPacket.recipientClass,
          purpose: selectedPacket.purpose,
          channelControl,
          ...confirmations
        })
      });
      const payload = (await response.json()) as AssessmentResponse;

      if (!payload.data) {
        const fields = payload.error?.fields?.join(" ");
        setError(
          [payload.error?.message ?? "Share-readiness assessment failed.", fields]
            .filter(Boolean)
            .join(" ")
        );
        return;
      }

      setAssessment(payload.data);
    } catch {
      setError("Share-readiness assessment could not be completed. No packet was sent or recorded.");
    } finally {
      setIsAssessing(false);
    }
  }

  function downloadReceipt() {
    if (!assessment || assessment.decision !== "READY_FOR_PROTECTED_INTAKE") {
      return;
    }

    const blob = new Blob([buildReceipt(assessment)], {
      type: "text/markdown;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${assessment.packet.id}-protected-share-handoff.md`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  const confirmationsComplete = Object.values(confirmations).every(Boolean);

  return (
    <div className="proof-share-workbench">
      <form
        className="proof-share-form"
        onSubmit={(event) => {
          event.preventDefault();
          void assessReadiness();
        }}
      >
        <label className="proof-share-field">
          <span>Proof packet</span>
          <select
            onChange={(event) => selectPacket(event.target.value)}
            value={selectedPacket.packetId}
          >
            {packets.map((packet) => (
              <option key={packet.packetId} value={packet.packetId}>
                {packet.title}
              </option>
            ))}
          </select>
        </label>

        <div className="proof-share-policy-grid" aria-label="Selected packet policy">
          <div>
            <span>Recipient class</span>
            <strong>{displayValue(selectedPacket.recipientClass)}</strong>
          </div>
          <div>
            <span>Purpose</span>
            <strong>{displayValue(selectedPacket.purpose)}</strong>
          </div>
          <div>
            <span>Packet fingerprint</span>
            <strong>{selectedPacket.auditHash}</strong>
          </div>
          <div>
            <span>Proof routes</span>
            <strong>{selectedPacket.proofRouteCount}</strong>
          </div>
        </div>

        <label className="proof-share-field">
          <span>Protected channel control</span>
          <select
            onChange={(event) => {
              setChannelControl(
                event.target.value as ProofPacketShareReadinessOption["allowedChannels"][number]
              );
              setAssessment(null);
              setError(null);
            }}
            value={channelControl}
          >
            {selectedPacket.allowedChannels.map((channel) => (
              <option key={channel} value={channel}>
                {displayValue(channel)}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="proof-share-confirmations">
          <legend>Operator preflight confirmations</legend>
          {confirmationFields.map((confirmation, index) => (
            <label className="proof-share-confirmation" key={confirmation.key}>
              <input
                checked={confirmations[confirmation.key]}
                onChange={(event) =>
                  updateConfirmation(confirmation.key, event.target.checked)
                }
                type="checkbox"
              />
              <span>{requiredConfirmations[index] ?? confirmation.label}</span>
            </label>
          ))}
        </fieldset>

        <div className="proof-share-actions">
          <button disabled={isAssessing} type="submit">
            {isAssessing ? "Assessing" : "Assess protected handoff"}
          </button>
          <button
            onClick={() => {
              setConfirmations(emptyConfirmations);
              setAssessment(null);
              setError(null);
            }}
            type="button"
          >
            Reset
          </button>
        </div>
        <p className="proof-share-form-note">
          {confirmationsComplete
            ? "All operator confirmations are present. Protected review is still required."
            : "Complete every confirmation before the packet can enter protected review."}
        </p>
      </form>

      <div aria-live="polite" className="proof-share-result">
        <p className="eyebrow">Preflight decision</p>
        {!assessment && !error ? (
          <>
            <h3>Not assessed</h3>
            <p>
              No recipient identity, external message, approval artifact, or packet content is
              stored by this workbench.
            </p>
          </>
        ) : null}
        {error ? (
          <>
            <h3>Assessment unavailable</h3>
            <p>{error}</p>
          </>
        ) : null}
        {assessment ? (
          <>
            <h3>{displayValue(assessment.decision)}</h3>
            <p>{assessment.boundary}</p>
            <dl className="proof-share-result-list">
              <div>
                <dt>Assessment hash</dt>
                <dd>{assessment.assessmentHash}</dd>
              </div>
              <div>
                <dt>Protected intake</dt>
                <dd>{assessment.protectedHandoff.route}</dd>
              </div>
              <div>
                <dt>Distribution</dt>
                <dd>disabled</dd>
              </div>
              <div>
                <dt>Reviewer roles</dt>
                <dd>{assessment.requiredReviewerRoles.length}</dd>
              </div>
            </dl>
            <h4>External evidence still required</h4>
            <ul className="compact-list">
              {assessment.missingExternalEvidence.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="proof-share-actions">
              <button
                disabled={assessment.decision !== "READY_FOR_PROTECTED_INTAKE"}
                onClick={downloadReceipt}
                type="button"
              >
                Download handoff receipt
              </button>
              <Link href={assessment.protectedHandoff.route}>Open protected intake</Link>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
