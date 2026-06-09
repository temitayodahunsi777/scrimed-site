import Link from "next/link";
import {
  getInteroperabilitySummary,
  interoperabilityStandards
} from "../lib/interoperabilityStandards";
import { getInteroperabilityConformanceEvaluationSummary } from "../lib/interoperabilityConformanceEvaluations";

export const metadata = {
  title: "SCRIMED Interoperability Control Plane",
  description:
    "SCRIMED standards registry, conformance controls, and synthetic-first healthcare connector boundaries."
};

export default function InteroperabilityPage() {
  const summary = getInteroperabilitySummary();
  const evaluations = getInteroperabilityConformanceEvaluationSummary();

  return (
    <main>
      <section className="page-hero trust-hero">
        <Link className="back-link" href="/integrations">Integrations</Link>
        <p className="eyebrow">Interoperability control plane</p>
        <h1>Standards become testable contracts before they become live healthcare connectors.</h1>
        <p className="hero-text">{summary.boundary}</p>
        <div className="hero-actions">
          <Link className="primary-action" href="/interoperability/evaluations">Run synthetic conformance review</Link>
          <Link className="secondary-action" href="/integrations">Review connector contracts</Link>
          <Link className="secondary-action" href="/integrations/fixture-validation">Inspect synthetic validation</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Interoperability summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Standards</span>
          <strong>{summary.standardCount}</strong>
        </article>
        <article>
          <span>Active controls</span>
          <strong>{summary.activeControls}</strong>
        </article>
        <article>
          <span>Required before live</span>
          <strong>{summary.requiredBeforeLive}</strong>
        </article>
        <article>
          <span>Test kits</span>
          <strong>{evaluations.evaluationCount}</strong>
        </article>
        <article>
          <span>Live blocked</span>
          <strong>{evaluations.liveBlocked}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="Executable interoperability conformance evaluations">
        <div className="section-heading">
          <p className="eyebrow">Executable evidence</p>
          <h2>Synthetic test kits make conformance targets inspectable while retaining every production blocker.</h2>
        </div>
        {evaluations.evaluations.map((evaluation) => (
          <article className="module-row" key={evaluation.slug}>
            <div>
              <span>{evaluation.status}</span>
              <h2>{evaluation.name}</h2>
            </div>
            <p>{evaluation.liveReadiness} · {evaluation.blockedChecks} pre-live checks blocked</p>
            <Link className="module-link" href={evaluation.route}>{evaluation.targetProfile}</Link>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Healthcare interoperability standards registry">
        <div className="section-heading">
          <p className="eyebrow">Standards registry</p>
          <h2>Exchange, imaging, payer, pharmacy, device, profile, and terminology boundaries.</h2>
        </div>
        {interoperabilityStandards.map((standard) => (
          <article className="module-row" key={standard.slug}>
            <div>
              <span>{standard.status}</span>
              <h2>{standard.acronym}</h2>
            </div>
            <p>{standard.kind} · {standard.steward}</p>
            <Link className="module-link" href={`/interoperability/${standard.slug}`}>
              {standard.implementationTarget}
            </Link>
          </article>
        ))}
      </section>

      <section className="section-band principle-grid" aria-label="Interoperability conformance controls">
        {summary.conformanceControls.map((control) => (
          <article key={control.id}>
            <span>{control.status}</span>
            <h3>{control.control}</h3>
            <p>{control.evidence}</p>
            <ul className="compact-list">
              <li>{control.liveBoundary}</li>
            </ul>
          </article>
        ))}
      </section>

      <section className="section-band split-band" aria-label="Terminology resolutions">
        <div>
          <p className="eyebrow">Discrepancy control</p>
          <h2>SCRIMED does not invent interoperability claims when a requested term is ambiguous.</h2>
        </div>
        <div className="layer-list">
          {summary.terminologyResolutions.map((resolution) => (
            <div className="layer-row" key={resolution.requestedTerm}>
              <span>{resolution.status}</span>
              <strong>{resolution.requestedTerm}: {resolution.resolution}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
