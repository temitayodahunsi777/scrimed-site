"use client";

import type { ProtectedClinicalAuthorityOwnerMatrix } from "../lib/protectedClinicalAuthorityOwnerMatrix";

function statusClass(status: string) {
  if (status.includes("metadata-owner-assigned")) return "status-pill status-pill-pass";
  if (status.includes("stale") || status.includes("required")) return "status-pill status-pill-warn";

  return "status-pill";
}

function formatDate(value: string | null) {
  if (!value) return "not recorded";

  const time = new Date(value).getTime();

  return Number.isFinite(time) ? new Date(time).toISOString() : "not recorded";
}

export default function ProtectedClinicalAuthorityOwnerMatrixPanel({
  matrix,
  onDownloadPacket,
  packetBusy
}: {
  matrix: ProtectedClinicalAuthorityOwnerMatrix | null;
  onDownloadPacket: () => Promise<void>;
  packetBusy: boolean;
}) {
  const domains = matrix?.domains ?? [];

  return (
    <section
      className="table-section"
      id="clinical-authority-owner-matrix"
      aria-label="Protected Clinical Authority Owner Matrix"
    >
      <div className="section-heading">
        <p className="eyebrow">Clinical Authority Owner Matrix</p>
        <h2>Map every clinical go-live hard gate to customer, SCRIMED, and qualified external approvers.</h2>
        <p className="section-copy">
          This protected matrix turns the authority evidence room into customer-specific owner routing. It keeps
          owner labels metadata-only, retains all signed artifacts externally, and keeps live care, PHI, legal,
          reimbursement, security, connector, and production authority blocked until qualified approval exists.
        </p>
      </div>

      <div className="hub-summary demo-readiness-summary" aria-label="Clinical authority owner matrix summary">
        <article>
          <span>Authority state</span>
          <strong>{matrix?.authorityState ?? "blocked-before-live-clinical-authority"}</strong>
        </article>
        <article>
          <span>Owner assignments</span>
          <strong>{matrix?.summary.requiredOwnerAssignmentCount ?? 24}</strong>
        </article>
        <article>
          <span>Customer owners</span>
          <strong>{matrix?.summary.customerOwnerCount ?? 8}</strong>
        </article>
        <article>
          <span>External reviewers</span>
          <strong>{matrix?.summary.externalOwnerCount ?? 8}</strong>
        </article>
        <article>
          <span>Blocked assignments</span>
          <strong>{matrix?.summary.blockedAssignmentCount ?? 24}</strong>
        </article>
      </div>

      <div className="form-actions">
        <button
          className="primary-action"
          disabled={packetBusy}
          onClick={() => void onDownloadPacket()}
          type="button"
        >
          {packetBusy ? "Preparing Owner Matrix" : "Download Owner Matrix Packet"}
        </button>
      </div>

      {domains.length > 0 ? (
        domains.map((domain) => (
          <article className="module-row" key={domain.authorityKey}>
            <div>
              <span className="status-pill status-pill-warn">{domain.blockedAssignmentCount} blocked</span>
              <h2>{domain.name}</h2>
            </div>
            <div>
              <p>
                Customer owners: {domain.customerOwnerCount}. SCRIMED owners: {domain.scrimedOwnerCount}.
                Qualified external owners: {domain.externalOwnerCount}. Metadata assigned:
                {" "}{domain.metadataAssignedCount}.
              </p>
              <ul className="compact-list">
                {domain.assignments.map((assignment) => (
                  <li key={assignment.id}>
                    <span className={statusClass(assignment.status)}>{assignment.status}</span>
                    {" "}{assignment.ownerLabel}: {assignment.requiredExternalArtifact}. Latest evidence:
                    {" "}{formatDate(assignment.latestEvidenceAt)}.
                  </li>
                ))}
              </ul>
            </div>
            <strong>{domain.nextAction}</strong>
          </article>
        ))
      ) : (
        <article className="module-row">
          <div>
            <span>owner matrix open</span>
            <h2>Owner routing appears after the protected workspace loads the authority evidence room.</h2>
          </div>
          <p>
            Continue using the evidence room, provider security, procurement, external approval, and clinical
            activation panels to build no-PHI source evidence.
          </p>
          <strong>No authority granted.</strong>
        </article>
      )}

      {matrix?.retainedBoundaryGates.length ? (
        <div className="timeline-list" aria-label="Retained clinical authority gates">
          {matrix.retainedBoundaryGates.map((gate) => (
            <article key={gate}>
              <span>retained gate</span>
              <strong>{gate}</strong>
              <p>No live execution until qualified external authority is recorded outside SCRIMED.</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
