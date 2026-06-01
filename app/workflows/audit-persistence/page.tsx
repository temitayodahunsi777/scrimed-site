import { getAuditPersistenceReadinessSummary } from "../../lib/auditPersistenceReadiness";

export default function AuditPersistenceReadinessPage() {
  const summary = getAuditPersistenceReadinessSummary();

  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/workflows/execution-audit">Execution audit</a>
        <p className="eyebrow">Audit persistence readiness</p>
        <h1>Durable audit logging remains blocked until the persistence model is explicit.</h1>
        <p className="hero-text">
          SCRIMED can observe denied execution attempts through metadata-only evidence headers today, but durable audit storage requires approved decisions for retention, access, encryption, incident response, regional residency, and Watchtower alerting.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Audit persistence readiness summary">
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
            <strong>No request bodies, PHI, clinical free text, connector payloads, secrets, or insurance identifiers are approved for denied-event persistence.</strong>
          </div>
        </div>
      </section>

      <section className="table-section" aria-label="Audit persistence readiness controls">
        {summary.controls.map((control) => (
          <article className="module-row" key={control.name}>
            <div>
              <span>{control.state}</span>
              <h2>{control.name}</h2>
            </div>
            <p>{control.owner}</p>
            <a className="module-link" href="/workflows/audit-persistence">
              {control.requirement}
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
