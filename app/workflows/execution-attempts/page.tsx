import { getExecutionAttemptReadinessSummary } from "../../lib/executionAttemptReadiness";

export default function ExecutionAttemptReadinessPage() {
  const summary = getExecutionAttemptReadinessSummary();

  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/workflows/implementation-readiness">Implementation readiness</a>
        <p className="eyebrow">Execution attempt readiness</p>
        <h1>Governed execution cannot create attempts until idempotency, replay, concurrency, and failure paths are explicit.</h1>
        <p className="hero-text">
          SCRIMED keeps executable workflow attempts disabled while the platform defines attempt identity, idempotency, durable state, retry behavior, failure quarantine, rate limits, privacy boundaries, and global compliance expectations.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Execution attempt readiness summary">
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
            <strong>No executable workflow should create, replay, retry, or release an attempt without a durable idempotency and audit-linked state model.</strong>
          </div>
        </div>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Attempt envelope</p>
          <h2>Every future attempt needs stable identity before it can run.</h2>
        </div>
        <div className="layer-list">
          {summary.attemptEnvelope.map((field, index) => (
            <div className="layer-row" key={field}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{field}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Execution attempt state machine">
        {summary.stateMachine.map((state) => (
          <article className="module-row" key={state.state}>
            <div>
              <span>state</span>
              <h2>{state.state}</h2>
            </div>
            <p>attempt lifecycle</p>
            <a className="module-link" href="/workflows/execution-attempts">
              {state.disposition}
            </a>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Execution attempt readiness controls">
        {summary.controls.map((control) => (
          <article className="module-row" key={control.name}>
            <div>
              <span>{control.state}</span>
              <h2>{control.name}</h2>
            </div>
            <p>{control.owner}</p>
            <a className="module-link" href="/workflows/execution-attempts">
              {control.requirement}
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
