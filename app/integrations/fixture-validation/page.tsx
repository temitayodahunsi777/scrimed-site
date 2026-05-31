import { getIntegrationFixtureValidationResults } from "../../lib/integrationFixtureValidation";

export default function IntegrationFixtureValidationPage() {
  const summary = getIntegrationFixtureValidationResults();

  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/integrations">Integrations</a>
        <p className="eyebrow">Fixture validation</p>
        <h1>Integration fixture diffs expose contract coverage before connector buildout.</h1>
        <p className="hero-text">
          Each non-synthetic integration contract is checked for fixture presence, synthetic-only gating, required signal coverage, safeguard mapping, deterministic traces, live-review requirements, and diff fingerprints.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Integration fixture validation summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Passed contracts</span>
          <strong>{summary.passedContracts}</strong>
        </article>
        <article>
          <span>Failed contracts</span>
          <strong>{summary.failedContracts}</strong>
        </article>
        <article>
          <span>Failed checks</span>
          <strong>{summary.failedChecks}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="Integration fixture validation results">
        <article className="module-row">
          <div>
            <span>review gate</span>
            <h2>Fixture change review</h2>
          </div>
          <p>expected-output fingerprint approval</p>
          <a className="module-link" href="/fixtures/change-review">
            Review fixture fingerprints before workflows or connectors depend on changed outputs.
          </a>
        </article>
        {summary.results.map((result) => (
          <article className="module-row" key={result.contractSlug}>
            <div>
              <span>{result.status}</span>
              <h2>{result.contractSlug}</h2>
            </div>
            <p>{result.diff.fingerprint}</p>
            <a className="module-link" href={result.fixtureRoute ?? result.route}>
              {result.passed} passed, {result.failed} failed
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
