import Link from "next/link";
import { getBoundaryReleaseApprovalMatrixSummary } from "../lib/boundaryReleaseApprovalMatrix";

export const metadata = {
  title: "SCRIMED Boundary Release Approvals",
  description:
    "A fail-closed approval matrix for the legal, clinical, security, privacy, payer, EHR, certification, global, and customer gates required before SCRIMED can relieve preserved boundaries."
};

export default function BoundaryReleaseApprovalsPage() {
  const summary = getBoundaryReleaseApprovalMatrixSummary();
  const priorityPaths = summary.approvalPaths.filter((path) => path.blockedUntil.length > 0);

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/boundary-resolution">Boundary Register</Link>
        <p className="eyebrow">Boundary Release Approval Matrix</p>
        <h1>SCRIMED can track every required approval without prematurely unlocking any preserved boundary.</h1>
        <p className="hero-text">
          This matrix turns the approval path into owned steps, evidence requirements, signoff lanes, and release
          hashes. It documents what is prepared, what remains externally required, and why production authority stays
          fail-closed until named human approvals exist.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Approval Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/clinical-production-readiness">Clinical Readiness</Link>
          <Link className="secondary-action" href="/global-certification-readiness">Global Approvals</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Boundary release approval summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Release candidates</span>
          <strong>{summary.releaseCandidateCount}</strong>
        </article>
        <article>
          <span>Released</span>
          <strong>{summary.releasedBoundaryCount}</strong>
        </article>
        <article>
          <span>Blocked</span>
          <strong>{summary.blockedBoundaryCount}</strong>
        </article>
        <article>
          <span>Steps</span>
          <strong>{summary.stepCount}</strong>
        </article>
        <article>
          <span>Prepared steps</span>
          <strong>{summary.internallyPreparedStepCount}</strong>
        </article>
        <article>
          <span>Pending signoffs</span>
          <strong>{summary.pendingSignoffCount}</strong>
        </article>
        <article>
          <span>Evidence queue</span>
          <strong>{summary.evidenceWorkQueueSummary.workItemCount}</strong>
        </article>
        <article>
          <span>Raw evidence</span>
          <strong>{summary.evidenceWorkQueueSummary.acceptsRawEvidence ? "accepted" : "blocked"}</strong>
        </article>
        <article>
          <span>Step tracking</span>
          <strong>{summary.allApprovalStepsDocumented ? "complete" : "incomplete"}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Release rule</p>
          <h2>Documented is not approved. SCRIMED still requires named release authority.</h2>
          <p className="section-copy">{summary.boundary}</p>
          <p className="section-copy">{summary.operatorRule}</p>
        </div>
        <div className="layer-list">
          {summary.noGoClaims.map((claim, index) => (
            <div className="layer-row" key={claim}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{claim}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Approval paths">
        <div className="section-heading">
          <p className="eyebrow">Approval path</p>
          <h2>Each preserved boundary has an approval path, missing evidence, signoff lanes, and a safe workaround.</h2>
          <p className="section-copy">{summary.nextAction}</p>
        </div>
        {priorityPaths.map((path) => (
          <article className="module-row" key={path.id}>
            <div>
              <span>{path.status}</span>
              <h2>{path.name}</h2>
            </div>
            <p>{path.preservedBoundary}</p>
            <div>
              <strong>Release decision: {path.releaseDecision}</strong>
              <ul className="compact-list">
                <li>Can relieve now: {String(path.canRelieveBoundary)}</li>
                <li>Unlocks only after: {path.unlocksOnlyAfter}</li>
                <li>Release hash: {path.releaseHash.slice(0, 16)}</li>
                <li>Safe workaround: {path.safeWorkaround}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Evidence work queue">
        <div className="section-heading">
          <p className="eyebrow">Evidence work queue</p>
          <h2>Pending approvals become metadata-only work items; raw evidence stays outside public SCRIMED surfaces.</h2>
          <p className="section-copy">
            {summary.evidenceWorkQueueSummary.status}. {summary.evidenceWorkQueueSummary.workItemCount} work items are
            required before any boundary can move toward a named human release decision.
          </p>
        </div>
        {summary.evidenceWorkQueue.slice(0, 18).map((item) => (
          <article className="module-row" key={item.id}>
            <div>
              <span>{item.priority} / {item.status}</span>
              <h2>{item.evidenceName}</h2>
            </div>
            <p>{item.missingBecause}</p>
            <div>
              <strong>{item.boundaryName}</strong>
              <ul className="compact-list">
                <li>Owner: {item.owner}</li>
                <li>Kind: {item.kind}</li>
                <li>Accepts raw evidence: {String(item.acceptsRawEvidence)}</li>
                <li>Hash: {item.workItemHash.slice(0, 16)}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Approval steps">
        <div className="section-heading">
          <p className="eyebrow">Step ledger</p>
          <h2>Every step is noted; unresolved steps remain blockers instead of implied approvals.</h2>
        </div>
        {summary.approvalPaths.map((path) => (
          <article className="module-row" key={`${path.id}-steps`}>
            <div>
              <span>{path.id}</span>
              <h2>{path.name}</h2>
            </div>
            <div>
              <strong>Required steps</strong>
              <ul className="compact-list">
                {path.approvalSteps.map((approvalStep) => (
                  <li key={approvalStep.id}>
                    {approvalStep.order}. {approvalStep.name}: {approvalStep.status}; evidence satisfied:{" "}
                    {String(approvalStep.releaseEvidenceSatisfied)}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <strong>Required signoffs</strong>
              <ul className="compact-list">
                {path.requiredSignoffs.map((signoff) => (
                  <li key={signoff.lane}>
                    {signoff.lane}: {signoff.status}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
