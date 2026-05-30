import { notFound } from "next/navigation";
import { validateIntegrationFixtureBySlug } from "../../../lib/integrationFixtureValidation";
import {
  getIntegrationFixtureBySlug,
  integrationFixtures
} from "../../../lib/integrationFixtures";

export function generateStaticParams() {
  return integrationFixtures.map((fixture) => ({
    slug: fixture.contractSlug
  }));
}

export default async function IntegrationFixturePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fixture = getIntegrationFixtureBySlug(slug);
  const validation = validateIntegrationFixtureBySlug(slug);

  if (!fixture || !validation) {
    notFound();
  }

  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/integrations/fixtures">Integration Fixtures</a>
        <p className="eyebrow">{fixture.request.sourceSystem}</p>
        <h1>{fixture.contractSlug}</h1>
        <p className="hero-text">{fixture.expectedResponse.reviewBeforeLive}</p>
      </section>

      <section className="section-band hub-summary" aria-label="Integration fixture summary">
        <article>
          <span>Status</span>
          <strong>{validation.status}</strong>
        </article>
        <article>
          <span>Fingerprint</span>
          <strong>{validation.diff.fingerprint}</strong>
        </article>
        <article>
          <span>Signals</span>
          <strong>{fixture.expectedResponse.normalizedSignals.length}</strong>
        </article>
        <article>
          <span>Trace steps</span>
          <strong>{fixture.expectedResponse.requiredTrace.length}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Request signals</p>
          <h2>{fixture.request.fixtureId}</h2>
          <p className="section-copy">
            {fixture.request.schemaVersion} fixture from {fixture.request.sourceSystem}
          </p>
        </div>
        <div className="layer-list">
          {Object.entries(fixture.request.requestSignals).map(([signal, detail], index) => (
            <div className="layer-row" key={signal}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{signal}: {detail}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band principle-grid" aria-label="Integration fixture expected response">
        <article>
          <span>Normalized signals</span>
          <h3>Expected signals produced after contract normalization.</h3>
          <ul className="compact-list">
            {fixture.expectedResponse.normalizedSignals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        </article>
        <article>
          <span>Rejected if missing</span>
          <h3>Signals that block fixture acceptance when absent.</h3>
          <ul className="compact-list">
            {fixture.expectedResponse.rejectedIfMissing.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        </article>
        <article>
          <span>Prohibited actions</span>
          <h3>Unsafe connector behavior that must stay blocked.</h3>
          <ul className="compact-list">
            {fixture.expectedResponse.prohibitedActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="section-band principle-grid" aria-label="Integration fixture validation checks">
        {validation.checks.map((check) => (
          <article key={check.id}>
            <span>{check.status}</span>
            <h3>{check.label}</h3>
            <p>{check.detail}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
