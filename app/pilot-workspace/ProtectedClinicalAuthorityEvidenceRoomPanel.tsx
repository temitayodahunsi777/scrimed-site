"use client";

import type { ProtectedClinicalAuthorityEvidenceRoom } from "../lib/protectedClinicalAuthorityEvidenceRoom";

function statusClass(status: string) {
  if (status.includes("recorded")) return "status-pill status-pill-pass";
  if (status.includes("expired") || status.includes("blocked")) return "status-pill status-pill-warn";
  return "status-pill";
}

function formatDate(value: string | null) {
  if (!value) return "not recorded";

  const time = new Date(value).getTime();

  return Number.isFinite(time) ? new Date(time).toISOString() : "not recorded";
}

export default function ProtectedClinicalAuthorityEvidenceRoomPanel({
  onDownloadPacket,
  packetBusy,
  room
}: {
  onDownloadPacket: () => Promise<void>;
  packetBusy: boolean;
  room: ProtectedClinicalAuthorityEvidenceRoom | null;
}) {
  const domains = room?.domains ?? [];

  return (
    <section
      className="table-section"
      id="clinical-authority-evidence-room"
      aria-label="Protected Clinical Authority Evidence Room"
    >
      <div className="section-heading">
        <p className="eyebrow">Clinical Authority Evidence Room</p>
        <h2>Unify live-care, PHI, legal, regulatory, reimbursement, security, connector, and production authority gates.</h2>
        <p className="section-copy">
          This protected room assembles no-PHI authority readiness evidence from the existing workspace proof
          stack. It tracks reviewer owners, retained gates, evidence links, expiration posture, and audit history
          without storing approval artifacts or granting clinical authority.
        </p>
      </div>

      <div className="hub-summary demo-readiness-summary" aria-label="Clinical authority evidence summary">
        <article>
          <span>Authority state</span>
          <strong>{room?.authorityState ?? "blocked-before-live-clinical-authority"}</strong>
        </article>
        <article>
          <span>Domains</span>
          <strong>{room?.summary.domainCount ?? 8}</strong>
        </article>
        <article>
          <span>Metadata recorded</span>
          <strong>{room?.summary.metadataRecordedDomainCount ?? 0}</strong>
        </article>
        <article>
          <span>Evidence links</span>
          <strong>{room?.summary.evidenceReferenceCount ?? 0}</strong>
        </article>
        <article>
          <span>Audit events</span>
          <strong>{room?.summary.auditEventCount ?? 0}</strong>
        </article>
      </div>

      <div className="form-actions">
        <button
          className="primary-action"
          disabled={packetBusy}
          onClick={() => void onDownloadPacket()}
          type="button"
        >
          {packetBusy ? "Preparing Authority Packet" : "Download Authority Evidence Packet"}
        </button>
      </div>

      <div className="evidence-grid">
        {(room
          ? [
              ["PHI", room.phiState],
              ["Legal", room.legalState],
              ["Reimbursement", room.reimbursementState],
              ["Security", room.securityState],
              ["Production", room.productionState]
            ]
          : [
              ["PHI", "phi-processing-disabled"],
              ["Legal", "legal-approval-required"],
              ["Reimbursement", "no-reimbursement-guarantee"],
              ["Security", "security-certification-required"],
              ["Production", "production-clinical-authorization-required"]
            ]
        ).map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      {domains.length > 0 ? (
        domains.map((domain) => (
          <article className="module-row" key={domain.authorityKey}>
            <div>
              <span className={statusClass(domain.domainStatus)}>{domain.domainStatus}</span>
              <h2>{domain.name}</h2>
            </div>
            <div>
              <p>
                Owner: {domain.primaryOwner}. Reviewer status: {domain.reviewerStatus}. Latest evidence:
                {" "}{formatDate(domain.latestEvidenceAt)}. Expires: {formatDate(domain.expiresAt)}.
              </p>
              <ul className="compact-list">
                <li>{domain.retainedGate}</li>
                <li>{domain.nextAction}</li>
                <li>{domain.evidenceReferenceCount} no-PHI evidence references assembled.</li>
              </ul>
            </div>
            <strong>{domain.expirationState}</strong>
          </article>
        ))
      ) : (
        <article className="module-row">
          <div>
            <span>evidence room open</span>
            <h2>Authority evidence will appear after the protected workspace loads.</h2>
          </div>
          <p>
            Keep using the existing approval, security, procurement, and clinical activation panels to build the
            source evidence.
          </p>
          <strong>No PHI or live clinical authority.</strong>
        </article>
      )}

      {room?.auditHistory.length ? (
        <div className="timeline-list" aria-label="Clinical authority audit history">
          {room.auditHistory.map((event) => (
            <article key={event.id}>
              <span>{event.createdAt}</span>
              <strong>{event.eventType}</strong>
              <p>{event.packetType ?? "workspace evidence event"}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
