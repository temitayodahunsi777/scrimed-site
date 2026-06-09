import Link from "next/link";
import { getIdentityAccessReadinessSummary } from "../../lib/identityAccessReadiness";

export default function IdentityAccessReadinessPage() {
  const summary = getIdentityAccessReadinessSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/workflows/implementation-readiness">Implementation readiness</Link>
        <p className="eyebrow">Identity and access readiness</p>
        <h1>Governed execution stays blocked until identity, tenant, role, and patient-context boundaries are explicit.</h1>
        <p className="hero-text">
          SCRIMED can expose deny-by-default workflow endpoints today, but production execution requires approved authentication, authorization, tenant isolation, service identity, consent, break-glass, audit linkage, and regional identity controls.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Identity and access readiness summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Controls</span>
          <strong>{summary.controlCount}</strong>
        </article>
        <article>
          <span>Defined</span>
          <strong>{summary.defined}</strong>
        </article>
        <article>
          <span>Decisions</span>
          <strong>{summary.decisionRequired}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Active replacement</p>
          <h2>{summary.runtimeBoundary}</h2>
          <p className="section-copy">{summary.activeReplacement}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>01</span>
            <strong>{summary.requiredBeforeExecution}</strong>
          </div>
          <div className="layer-row">
            <span>02</span>
            <strong>No executable workflow should trust a user, tenant, service, patient context, or delegated role until these controls are approved.</strong>
          </div>
        </div>
      </section>

      <section className="table-section" aria-label="Identity and access readiness controls">
        {summary.controls.map((control) => (
          <article className="module-row" key={control.name}>
            <div>
              <span>{control.state}</span>
              <h2>{control.name}</h2>
            </div>
            <p>{control.owner}</p>
            <Link className="module-link" href="/workflows/identity-access">
              {control.requirement}
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
