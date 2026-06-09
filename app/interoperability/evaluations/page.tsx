import Link from "next/link";
import { getInteroperabilityConformanceEvaluationSummary } from "../../lib/interoperabilityConformanceEvaluations";

export const metadata = {
  title: "SCRIMED Interoperability Conformance Evaluations",
  description:
    "Executable synthetic conformance test kits with explicit production healthcare data exchange blockers."
};

export default function InteroperabilityEvaluationsPage() {
  const summary = getInteroperabilityConformanceEvaluationSummary();

  return (
    <main>
      <section className="page-hero trust-hero">
        <Link className="back-link" href="/interoperability">Interoperability</Link>
        <p className="eyebrow">Executable conformance evaluations</p>
        <h1>Synthetic test kits turn standards targets into inspectable evidence without overstating live readiness.</h1>
        <p className="hero-text">{summary.boundary}</p>
      </section>

      <section className="section-band hub-summary" aria-label="Conformance evaluation summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Test kits</span>
          <strong>{summary.evaluationCount}</strong>
        </article>
        <article>
          <span>Synthetic pass</span>
          <strong>{summary.syntheticPassed}</strong>
        </article>
        <article>
          <span>Live blocked</span>
          <strong>{summary.liveBlocked}</strong>
        </article>
        <article>
          <span>Checks passed</span>
          <strong>{summary.passedChecks}</strong>
        </article>
        <article>
          <span>Pre-live blockers</span>
          <strong>{summary.blockedChecks}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="Interoperability conformance test kits">
        <div className="section-heading">
          <p className="eyebrow">Test-kit registry</p>
          <h2>Evidence, agent ownership, standards targets, and production blockers stay attached to every evaluation.</h2>
        </div>
        {summary.evaluations.map((evaluation) => (
          <article className="module-row" key={evaluation.slug}>
            <div>
              <span>{evaluation.status}</span>
              <h2>{evaluation.name}</h2>
            </div>
            <p>{evaluation.agentOwner} · {evaluation.liveReadiness}</p>
            <Link className="module-link" href={evaluation.route}>
              {evaluation.targetProfile}
            </Link>
          </article>
        ))}
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Truthful readiness</p>
          <h2>A synthetic pass proves deterministic evaluation behavior, not production conformance.</h2>
          <p className="section-copy">
            Identity, consent, purpose-of-use, durable audit, partner testing, certification, and deployment approval remain explicit requirements before live exchange.
          </p>
        </div>
        <div className="layer-list">
          {summary.evaluations.map((evaluation, index) => (
            <div className="layer-row" key={evaluation.slug}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{evaluation.name}: {evaluation.liveBlockers.length} live blockers retained</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
