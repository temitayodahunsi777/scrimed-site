"use client";

import type {
  ProtectedClinicalAuthorityArtifactIntakeChecklist,
  ProtectedClinicalAuthorityArtifactIntakeStatus
} from "../lib/protectedClinicalAuthorityArtifactIntake";

function statusClass(status: ProtectedClinicalAuthorityArtifactIntakeStatus) {
  if (status === "external-artifact-reference-required") return "status-pill status-pill-warn";
  if (status === "qualified-reviewer-required") return "status-pill status-pill-warn";
  if (status === "revalidation-required") return "status-pill status-pill-fail";

  return "status-pill";
}

function formatDate(value: string | null) {
  if (!value) return "not recorded";

  const time = new Date(value).getTime();

  return Number.isFinite(time) ? new Date(time).toISOString() : "not recorded";
}

export default function ProtectedClinicalAuthorityArtifactIntakePanel({
  checklist,
  onDownloadPacket,
  packetBusy
}: {
  checklist: ProtectedClinicalAuthorityArtifactIntakeChecklist | null;
  onDownloadPacket: () => Promise<void>;
  packetBusy: boolean;
}) {
  const domains = checklist?.domains ?? [];

  return (
    <section
      className="table-section"
      id="clinical-authority-artifact-intake"
      aria-label="Protected Clinical Authority Artifact Intake Checklist"
    >
      <div className="section-heading">
        <p className="eyebrow">Authority Artifact Intake</p>
        <h2>Turn owner routing into external artifact requirements without storing sensitive evidence.</h2>
        <p className="section-copy">
          This protected checklist tells operators which external system, reviewer role, validation timestamp,
          expiration cadence, and metadata fields are required before SCRIMED can even consider clinical, PHI,
          legal, reimbursement, security, connector, regional, or production authority review.
        </p>
      </div>

      <div className="hub-summary demo-readiness-summary" aria-label="Clinical authority artifact intake summary">
        <article>
          <span>Authority state</span>
          <strong>{checklist?.authorityState ?? "blocked-before-signed-external-authority-artifacts"}</strong>
        </article>
        <article>
          <span>Checklist items</span>
          <strong>{checklist?.summary.intakeItemCount ?? 24}</strong>
        </article>
        <article>
          <span>External systems</span>
          <strong>{checklist?.summary.acceptedExternalSystemCount ?? 0}</strong>
        </article>
        <article>
          <span>Reviewer items</span>
          <strong>{checklist?.summary.qualifiedReviewerItemCount ?? 8}</strong>
        </article>
        <article>
          <span>Blocked items</span>
          <strong>{checklist?.summary.blockedItemCount ?? 24}</strong>
        </article>
      </div>

      <div className="form-actions">
        <button
          className="primary-action"
          disabled={packetBusy}
          onClick={() => void onDownloadPacket()}
          type="button"
        >
          {packetBusy ? "Preparing Intake Checklist" : "Download Intake Checklist Packet"}
        </button>
      </div>

      {checklist?.prohibitedContent.length ? (
        <article className="module-row">
          <div>
            <span className="status-pill status-pill-fail">never store in SCRIMED</span>
            <h2>Prohibited intake content</h2>
          </div>
          <ul className="compact-list">
            {checklist.prohibitedContent.slice(0, 8).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <strong>No artifact uploads.</strong>
        </article>
      ) : null}

      {domains.length > 0 ? (
        domains.map((domain) => (
          <article className="module-row" key={domain.authorityKey}>
            <div>
              <span className="status-pill status-pill-warn">{domain.itemCount} intake items</span>
              <h2>{domain.name}</h2>
            </div>
            <div>
              <p>
                Reviewer-required items: {domain.qualifiedReviewerCount}. Owner routing required:
                {" "}{domain.ownerRoutingRequiredCount}. Revalidation required:
                {" "}{domain.revalidationRequiredCount}.
              </p>
              <p>Expiration cadence: {domain.expirationCadence}.</p>
              <ul className="compact-list">
                {domain.items.map((item) => (
                  <li key={item.id}>
                    <span className={statusClass(item.intakeStatus)}>{item.intakeStatus}</span>
                    {" "}{item.ownerLabel}: {item.requiredExternalArtifact}. Reviewer:
                    {" "}{item.qualifiedReviewer}. Latest evidence: {formatDate(item.latestEvidenceAt)}.
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
            <span>artifact intake open</span>
            <h2>Artifact checklist appears after the protected workspace loads the owner matrix.</h2>
          </div>
          <p>
            Continue using the authority evidence room and owner matrix to prepare customer, SCRIMED, and
            qualified external reviewer routing.
          </p>
          <strong>No authority granted.</strong>
        </article>
      )}

      {checklist?.acceptedExternalSystems.length ? (
        <div className="timeline-list" aria-label="Accepted external artifact systems">
          {checklist.acceptedExternalSystems.slice(0, 10).map((system) => (
            <article key={system}>
              <span>external system</span>
              <strong>{system}</strong>
              <p>Store artifacts externally; SCRIMED records metadata references only.</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
