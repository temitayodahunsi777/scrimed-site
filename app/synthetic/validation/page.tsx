import { getSyntheticValidationResults } from "../../lib/syntheticValidation";

export default function SyntheticValidationPage() {
  const validation = getSyntheticValidationResults();

  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/synthetic">Synthetic</a>
        <p className="eyebrow">Synthetic validation</p>
        <h1>Executable checks keep SCRIMED synthetic workflows honest before live integrations.</h1>
        <p className="hero-text">
          Each scenario is evaluated for synthetic-only labeling, identifier safety, contract boundaries, risk markers, workflow trace completeness, assertions, and human review guardrails.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Synthetic validation summary">
        <article>
          <span>Status</span>
          <strong>{validation.status}</strong>
        </article>
        <article>
          <span>Scenarios</span>
          <strong>{validation.scenarioCount}</strong>
        </article>
        <article>
          <span>Passed checks</span>
          <strong>{validation.passedChecks}</strong>
        </article>
        <article>
          <span>Failed checks</span>
          <strong>{validation.failedChecks}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="Synthetic validation results">
        {validation.results.map((result) => (
          <article className="module-row" key={result.scenarioId}>
            <div>
              <span>{result.status}</span>
              <h2>{result.scenarioId}</h2>
            </div>
            <p>{result.passed} passed, {result.failed} failed</p>
            <a className="module-link" href={result.fixtureRoute ?? `/synthetic/${result.scenarioId}`}>
              Review fixture and assertions
            </a>
          </article>
        ))}
      </section>

      <section className="section-band principle-grid" aria-label="Synthetic validation checks">
        {validation.results.flatMap((result) =>
          result.checks.map((check) => (
            <article key={`${result.scenarioId}-${check.id}`}>
              <span>{check.status}</span>
              <h3>{check.label}</h3>
              <p>{check.detail}</p>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
