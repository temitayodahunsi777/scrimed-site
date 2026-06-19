"use client";

import Link from "next/link";
import {
  deriveClinicalActivationDossier,
  type ClinicalActivationSignOffStatus
} from "../lib/clinicalActivationDossier";
import type { CommandIntelligenceSnapshotRecord } from "../lib/commandIntelligenceHub";
import type { PilotDemoReadinessSnapshotRecord } from "../lib/pilotDemoReadiness";
import type {
  PilotAuditEventRecord,
  PilotSessionRecord,
  PilotWorkspaceRecord
} from "../lib/protectedPilotWorkspace";
import type { QaManualRunEvidencePacketRecord } from "../lib/qaEvidenceLedger";

function statusLabel(status: ClinicalActivationSignOffStatus) {
  if (status === "unsigned-required") return "Unsigned";
  if (status === "external-review-required") return "External Review";
  if (status === "customer-specific-required") return "Customer Specific";
  return "Draft Required";
}

function statusClass(status: ClinicalActivationSignOffStatus) {
  if (status === "unsigned-required") return "status-pill status-pill-warn";
  if (status === "customer-specific-required") return "status-pill status-pill-warn";
  return "status-pill status-pill-fail";
}

export default function ClinicalActivationDossierPanel({
  auditEvents,
  commandSnapshots,
  demoSnapshots,
  manualQaEvidencePackets,
  onDownloadPacket,
  packetBusy,
  sessions,
  workspace
}: {
  auditEvents: PilotAuditEventRecord[];
  commandSnapshots: CommandIntelligenceSnapshotRecord[];
  demoSnapshots: PilotDemoReadinessSnapshotRecord[];
  manualQaEvidencePackets: QaManualRunEvidencePacketRecord[];
  onDownloadPacket: () => Promise<void>;
  packetBusy: boolean;
  sessions: PilotSessionRecord[];
  workspace: PilotWorkspaceRecord;
}) {
  const dossier = deriveClinicalActivationDossier({
    workspace,
    sessions,
    auditEvents,
    demoSnapshots,
    manualQaEvidencePackets,
    commandSnapshots,
    unavailableSections: []
  });

  return (
    <section className="table-section" aria-label="SCRIMED Clinical Activation Dossier">
      <div className="section-heading">
        <p className="eyebrow">Clinical Activation Dossier</p>
        <h2>Package gate ownership, reviewer assignments, sign-off metadata, and go-live blockers.</h2>
        <p className="section-copy">{dossier.boundary}</p>
        <div className="form-actions">
          <button
            className="primary-action"
            disabled={packetBusy}
            onClick={() => void onDownloadPacket()}
            type="button"
          >
            {packetBusy ? "Preparing Dossier" : "Download Clinical Activation Dossier"}
          </button>
          <Link className="secondary-action" href="/clinical-care-activation">
            Public Activation Readiness
          </Link>
          <a className="secondary-action" href="/api/clinical-care-activation/brief">
            Readiness Brief
          </a>
        </div>
      </div>

      <div className="hub-summary demo-readiness-summary" aria-label="Clinical activation dossier summary">
        <article>
          <span>Go-live</span>
          <strong>{dossier.goLiveDecision.status}</strong>
        </article>
        <article>
          <span>Readiness</span>
          <strong>{dossier.readiness.score}%</strong>
        </article>
        <article>
          <span>Hard gates</span>
          <strong>{dossier.readiness.hardGateCount}</strong>
        </article>
        <article>
          <span>Blocked gates</span>
          <strong>{dossier.readiness.blockedGateCount}</strong>
        </article>
        <article>
          <span>Unsigned approvals</span>
          <strong>{dossier.readiness.unsignedApprovalCount}</strong>
        </article>
        <article>
          <span>No-PHI evidence</span>
          <strong>{dossier.readiness.protectedEvidenceCount}</strong>
        </article>
        <article>
          <span>Sign-off packets</span>
          <strong>{dossier.signOffPackets.length}</strong>
        </article>
        <article>
          <span>Care authority</span>
          <strong>{dossier.clinicalGoLiveAuthority}</strong>
        </article>
      </div>

      <div className="demo-runbook" aria-label="Clinical activation sign-off packet set">
        <div className="section-heading">
          <p className="eyebrow">Sign-off packet set</p>
          <h2>Required packets stay draft or review-gated until real signatures exist.</h2>
        </div>
        {dossier.signOffPackets.map((packet) => (
          <article className="module-row" key={packet.name}>
            <div>
              <span>{packet.owner}</span>
              <h2>{packet.name}</h2>
            </div>
            <strong className={statusClass(packet.status)}>{statusLabel(packet.status)}</strong>
            <p>
              {packet.includedGateIds.length} gates. Export readiness: {packet.exportReadiness}.
            </p>
          </article>
        ))}
      </div>

      <div className="demo-runbook" aria-label="Clinical activation approval metadata">
        <div className="section-heading">
          <p className="eyebrow">Signed approval metadata</p>
          <h2>Approval slots are explicit and unsigned until accountable humans sign them.</h2>
        </div>
        {dossier.signedApprovalMetadata.map((approval) => (
          <article className="module-row" key={approval.domain}>
            <div>
              <span>{approval.domain}</span>
              <h2>{approval.requiredSignatures.join(", ")}</h2>
            </div>
            <strong className={statusClass(approval.status)}>{statusLabel(approval.status)}</strong>
            <p>
              Signed by: {approval.signedBy ?? "not signed"}. Signed at:{" "}
              {approval.signedAt ?? "not signed"}. {approval.approvedScope}
            </p>
          </article>
        ))}
      </div>

      <div className="demo-runbook" aria-label="Clinical activation reviewer assignments">
        <div className="section-heading">
          <p className="eyebrow">Reviewer assignments</p>
          <h2>Each hard-gate category has an accountable reviewer role before go-live.</h2>
        </div>
        {dossier.reviewerAssignments.map((assignment) => (
          <article className="module-row" key={assignment.category}>
            <div>
              <span>{assignment.category}</span>
              <h2>{assignment.reviewerRole}</h2>
            </div>
            <strong className={statusClass(assignment.assignmentStatus)}>
              {statusLabel(assignment.assignmentStatus)}
            </strong>
            <p>{assignment.requiredBefore}</p>
          </article>
        ))}
      </div>

      <div className="agent-readiness-grid demo-readiness-brief" aria-label="Clinical activation evidence references">
        {dossier.evidenceReferences.map((reference) => (
          <article key={reference.label}>
            <span>{reference.evidenceType}</span>
            <strong>
              {reference.label}
              {typeof reference.count === "number" ? `: ${reference.count}` : ""}
            </strong>
            <p>{reference.boundary}</p>
            <Link className="module-link" href={reference.route}>
              Inspect evidence
            </Link>
          </article>
        ))}
      </div>

      <article className="module-row">
        <div>
          <span>rollback required</span>
          <h2>{dossier.rollbackPlan.status}</h2>
        </div>
        <p>{dossier.rollbackPlan.owner}</p>
        <ul className="compact-list">
          {dossier.rollbackPlan.requiredControls.map((control) => (
            <li key={control}>{control}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}
