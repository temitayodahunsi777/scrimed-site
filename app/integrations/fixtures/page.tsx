import Link from "next/link";
import { getIntegrationFixtureValidationResults } from "../../lib/integrationFixtureValidation";
import { integrationFixtures } from "../../lib/integrationFixtures";

export default function IntegrationFixturesPage() {
  const validation = getIntegrationFixtureValidationResults();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/integrations">Integrations</Link>
        <p className="eyebrow">Integration fixtures</p>
        <h1>Connector contracts now have synthetic request and expected-response fixtures.</h1>
        <p className="hero-text">
          FHIR, HL7, claims, and pricing integrations are backed by deterministic fixture contracts so live connector work stays gated behind coverage, traceability, review, and prohibited-action checks.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Integration fixture validation summary">
        <article>
          <span>Status</span>
          <strong>{validation.status}</strong>
        </article>
        <article>
          <span>Contracts</span>
          <strong>{validation.contractCount}</strong>
        </article>
        <article>
          <span>Fixtures</span>
          <strong>{validation.fixtureCount}</strong>
        </article>
        <article>
          <span>Checks passed</span>
          <strong>{validation.passedChecks}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="Integration fixture contracts">
        {integrationFixtures.map((fixture) => (
          <article className="module-row" key={fixture.contractSlug}>
            <div>
              <span>{fixture.request.schemaVersion}</span>
              <h2>{fixture.contractSlug}</h2>
            </div>
            <p>{fixture.request.sourceSystem}</p>
            <Link className="module-link" href={fixture.route}>
              {fixture.expectedResponse.reviewBeforeLive}
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
