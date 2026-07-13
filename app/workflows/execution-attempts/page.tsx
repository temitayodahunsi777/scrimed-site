import Link from "next/link";
import { getExecutionAttemptDurableStoreSummary } from "../../lib/executionAttemptDurableStore";
import { getExecutionAttemptEnvelopeSummary } from "../../lib/executionAttemptEnvelope";
import { getExecutionAttemptReadinessSummary } from "../../lib/executionAttemptReadiness";

export default function ExecutionAttemptReadinessPage() {
  const summary = getExecutionAttemptReadinessSummary();
  const envelopeSummary = getExecutionAttemptEnvelopeSummary();
  const durableStoreSummary = getExecutionAttemptDurableStoreSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/workflows/implementation-readiness">Implementation readiness</Link>
        <p className="eyebrow">Execution attempt readiness</p>
        <h1>Execution attempts now have a no-PHI envelope contract, replay metadata, and scorecards before execution authority.</h1>
        <p className="hero-text">
          SCRIMED keeps protected workflow execution disabled while the platform defines attempt identity, idempotency, durable state, replay behavior, failure quarantine, model-route telemetry, runtime-safety handoff, privacy boundaries, and global compliance expectations.
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

      <section className="section-band hub-summary" aria-label="Execution attempt envelope summary">
        <article>
          <span>Envelope</span>
          <strong>{envelopeSummary.status}</strong>
        </article>
        <article>
          <span>Attempts</span>
          <strong>{envelopeSummary.envelopeCount}</strong>
        </article>
        <article>
          <span>Replay-ready</span>
          <strong>{envelopeSummary.replayReadyCount}</strong>
        </article>
        <article>
          <span>Scorecards</span>
          <strong>{envelopeSummary.passingScorecardCount}/{envelopeSummary.scorecardCount}</strong>
        </article>
        <article>
          <span>Robustness scenarios</span>
          <strong>{envelopeSummary.clinicalRobustnessScenarioBindingCount}</strong>
        </article>
        <article>
          <span>Robustness perturbations</span>
          <strong>{envelopeSummary.clinicalRobustnessPerturbationBindingCount}</strong>
        </article>
      </section>

      <section className="section-band hub-summary" aria-label="Execution attempt durable store summary">
        <article>
          <span>Durable store</span>
          <strong>{durableStoreSummary.status}</strong>
        </article>
        <article>
          <span>Recordable</span>
          <strong>{durableStoreSummary.recordableEnvelopeCount}</strong>
        </article>
        <article>
          <span>AI OS lanes</span>
          <strong>{durableStoreSummary.healthcareAIPriorityCount}</strong>
        </article>
        <article>
          <span>Validation</span>
          <strong>{durableStoreSummary.validation.status}</strong>
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
          <p className="eyebrow">Envelope contract</p>
          <h2>Metadata can be replayed; protected actions still cannot run.</h2>
          <p className="section-copy">{envelopeSummary.readinessAssessment}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>API</span>
            <strong>{envelopeSummary.apiRoute}</strong>
          </div>
          <div className="layer-row">
            <span>Brief</span>
            <strong>{envelopeSummary.briefRoute}</strong>
          </div>
          <div className="layer-row">
            <span>Replay</span>
            <strong>{envelopeSummary.replayAuthority}</strong>
          </div>
          <div className="layer-row">
            <span>Model</span>
            <strong>{envelopeSummary.modelRoutingAuthority}</strong>
          </div>
        </div>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Durable store</p>
          <h2>Attempt metadata now has a tenant-scoped persistence and review path.</h2>
          <p className="section-copy">{durableStoreSummary.readinessAssessment}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>Summary</span>
            <strong>{durableStoreSummary.apiRoute}</strong>
          </div>
          <div className="layer-row">
            <span>Record</span>
            <strong>{durableStoreSummary.recordRoute}</strong>
          </div>
          <div className="layer-row">
            <span>Replay</span>
            <strong>{durableStoreSummary.replayRoute}</strong>
          </div>
          <div className="layer-row">
            <span>Review</span>
            <strong>{durableStoreSummary.reviewDispositionRoute}</strong>
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

      <section className="table-section" aria-label="Execution attempt envelopes">
        {envelopeSummary.envelopes.map((envelope) => (
          <article className="module-row" key={envelope.attemptId}>
            <div>
              <span>{envelope.lifecycleState}</span>
              <h2>{envelope.workflowSlug}</h2>
            </div>
            <p>
              {envelope.modelRouteTelemetry.routeProfile}; robustness scenarios {envelope.evaluationBindings.clinicalRobustness.scenarioRefs.join(", ")}
            </p>
            <Link className="module-link" href={envelopeSummary.apiRoute}>
              {envelope.idempotencyKey} | {envelope.replayMetadata.replayToken}
            </Link>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="No-PHI execution attempt scorecards">
        {envelopeSummary.scorecards.map((scorecard) => (
          <article className="module-row" key={scorecard.scorecardId}>
            <div>
              <span>{scorecard.status}</span>
              <h2>{scorecard.scenarioSlug}</h2>
            </div>
            <p>{scorecard.category}</p>
            <Link className="module-link" href={envelopeSummary.briefRoute}>
              {scorecard.releaseDecision}; human review {scorecard.requiredHumanReview ? "required" : "missing"}
            </Link>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Execution attempt durable store architecture">
        {durableStoreSummary.clinicalAIOperatingSystemFoundation.map((priority) => (
          <article className="module-row" key={priority.priority}>
            <div>
              <span>AI OS</span>
              <h2>{priority.priority}</h2>
            </div>
            <p>{priority.implementedBy}</p>
            <Link className="module-link" href={durableStoreSummary.briefRoute}>
              {priority.productionGate}
            </Link>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Execution attempt state machine">
        {summary.stateMachine.map((state) => (
          <article className="module-row" key={state.state}>
            <div>
              <span>state</span>
              <h2>{state.state}</h2>
            </div>
            <p>attempt lifecycle</p>
            <Link className="module-link" href="/workflows/execution-attempts">
              {state.disposition}
            </Link>
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
            <Link className="module-link" href="/workflows/execution-attempts">
              {control.requirement}
            </Link>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Execution attempt hard stops">
        {envelopeSummary.hardStops.map((stop) => (
          <article className="module-row" key={stop}>
            <div>
              <span>hard stop</span>
              <h2>Protected authority remains blocked</h2>
            </div>
            <p>boundary</p>
            <Link className="module-link" href="/production-architecture">
              {stop}
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
