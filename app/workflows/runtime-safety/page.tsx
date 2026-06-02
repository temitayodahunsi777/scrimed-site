import { getRuntimeSafetyReadinessSummary } from "../../lib/runtimeSafetyReadiness";

export default function RuntimeSafetyReadinessPage() {
  const summary = getRuntimeSafetyReadinessSummary();

  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/workflows/execution-attempts">Execution attempts</a>
        <p className="eyebrow">Runtime safety readiness</p>
        <h1>Governed execution stays locked until abuse throttles and emergency shutdown controls are explicit.</h1>
        <p className="hero-text">
          SCRIMED keeps executable requests disabled while the platform defines runtime safety envelopes, throttles, abuse signals, connector containment, shutdown authority, Watchtower escalation, restoration protocol, and synthetic safety drills.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Runtime safety readiness summary">
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
            <strong>{summary.shutdownBoundary}</strong>
          </div>
        </div>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Runtime envelope</p>
          <h2>Every future executable request needs safety context before it can run.</h2>
        </div>
        <div className="layer-list">
          {summary.safetyEnvelope.map((field, index) => (
            <div className="layer-row" key={field}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{field}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Runtime safety state model">
        {summary.states.map((state) => (
          <article className="module-row" key={state.state}>
            <div>
              <span>state</span>
              <h2>{state.state}</h2>
            </div>
            <p>runtime safety lifecycle</p>
            <a className="module-link" href="/workflows/runtime-safety">
              {state.disposition}
            </a>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Runtime safety readiness controls">
        {summary.controls.map((control) => (
          <article className="module-row" key={control.name}>
            <div>
              <span>{control.state}</span>
              <h2>{control.name}</h2>
            </div>
            <p>{control.owner}</p>
            <a className="module-link" href="/workflows/runtime-safety">
              {control.requirement}
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
