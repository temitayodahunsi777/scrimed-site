import Link from "next/link";
import { getBoundaryResolutionSummary } from "../lib/boundaryResolution";

export const metadata = {
  title: "SCRIMED Boundary Resolution Register",
  description:
    "A cross-system register for SCRIMED clinical, PHI, legal, regional, reimbursement, security, QA, public-market, and production-readiness boundaries."
};

export default function BoundaryResolutionPage() {
  const summary = getBoundaryResolutionSummary();
  const priorityRecords = summary.records.filter((record) => record.state !== "active-control");
  const categoryEntries = Object.entries(summary.countsByCategory);
  const stateEntries = Object.entries(summary.countsByState);

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">Boundary Resolution Register</p>
        <h1>SCRIMED addresses known boundaries with controls, workarounds, owners, and hard gates.</h1>
        <p className="hero-text">
          This register unifies clinical authority, PHI, legal, regional, reimbursement, security certification,
          QA evidence, public-market, and production-readiness boundaries without pretending external approvals are complete.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Boundary Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/clinical-authority-readiness">Clinical Authority</Link>
          <Link className="secondary-action" href="/qa-evidence">QA Evidence</Link>
          <Link className="secondary-action" href="/pilot-workspace/access">Protected Workspace</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Boundary resolution summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Records</span>
          <strong>{summary.recordCount}</strong>
        </article>
        <article>
          <span>Active controls</span>
          <strong>{summary.activeControlCount}</strong>
        </article>
        <article>
          <span>Workarounds</span>
          <strong>{summary.safeWorkaroundCount}</strong>
        </article>
        <article>
          <span>Human AAL2</span>
          <strong>{summary.humanAal2RequiredCount}</strong>
        </article>
        <article>
          <span>External gates</span>
          <strong>{summary.externalGateCount}</strong>
        </article>
        <article>
          <span>Blocked</span>
          <strong>{summary.blockedBeforeApprovalCount}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Operating boundary</p>
          <h2>Every known boundary is managed; not every boundary is externally cleared.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {stateEntries.map(([state, count], index) => (
            <div className="layer-row" key={state}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{state}: {count}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Boundary categories">
        <div className="section-heading">
          <p className="eyebrow">Coverage</p>
          <h2>Boundary coverage spans product, clinical, trust, QA, commercial, and investor-readiness systems.</h2>
          <p className="section-copy">{summary.addressedPosition}</p>
        </div>
        {categoryEntries.map(([category, count]) => (
          <article className="module-row" key={category}>
            <div>
              <span>category</span>
              <h2>{category}</h2>
            </div>
            <p>{count} boundary records are tracked for this source system.</p>
            <Link className="module-link" href={summary.apiRoute}>
              Inspect register
            </Link>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Priority boundary records">
        <div className="section-heading">
          <p className="eyebrow">Priority gates</p>
          <h2>These records are not approved yet; they stay controlled until the retained gate is satisfied.</h2>
          <p className="section-copy">{summary.safeCommercialPosition}</p>
        </div>
        {priorityRecords.slice(0, 16).map((record) => (
          <article className="module-row" key={record.id}>
            <div>
              <span>{record.state}</span>
              <h2>{record.name}</h2>
            </div>
            <p>{record.currentBoundary}</p>
            <div>
              <strong>{record.remainingGate}</strong>
              <ul className="compact-list">
                <li>Owner: {record.owner}</li>
                <li>Workaround: {record.safeWorkaround}</li>
                <li>Proof: {record.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Operating rules">
        <div className="section-heading">
          <p className="eyebrow">Operator rules</p>
          <h2>SCRIMED keeps moving by using safe evidence instead of crossing hard gates early.</h2>
        </div>
        {summary.operatingRules.map((rule, index) => (
          <article className="module-row" key={rule}>
            <div>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>Boundary rule</h2>
            </div>
            <p>{rule}</p>
            <Link className="module-link" href="/trust-center">
              Review Trust Center
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
