import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSyntheticFixtureBySlug,
  syntheticFixtures
} from "../../../lib/syntheticFixtures";

export function generateStaticParams() {
  return syntheticFixtures.map((fixture) => ({
    slug: fixture.scenarioId
  }));
}

export default async function SyntheticFixturePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fixture = getSyntheticFixtureBySlug(slug);

  if (!fixture) {
    notFound();
  }

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/synthetic/fixtures">Fixtures</Link>
        <p className="eyebrow">Synthetic fixture</p>
        <h1>{fixture.scenarioId}</h1>
        <p className="hero-text">{fixture.request.workflowRequest}</p>
      </section>

      <section className="section-band hub-summary" aria-label="Synthetic fixture summary">
        <article>
          <span>Module</span>
          <strong>{fixture.request.module}</strong>
        </article>
        <article>
          <span>Signals</span>
          <strong>{fixture.request.inputSignals.length}</strong>
        </article>
        <article>
          <span>Trace</span>
          <strong>{fixture.expectedOutput.requiredTrace.length}</strong>
        </article>
        <article>
          <span>Claims blocked</span>
          <strong>{fixture.expectedOutput.prohibitedClaims.length}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Expected output</p>
          <h2>{fixture.expectedOutput.decisionState}</h2>
          <p className="section-copy">{fixture.expectedOutput.requiredReview}</p>
        </div>
        <div className="layer-list">
          {fixture.expectedOutput.requiredTrace.map((step, index) => (
            <div className="layer-row" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band principle-grid" aria-label="Synthetic fixture guardrails">
        {fixture.request.guardrails.map((guardrail) => (
          <article key={guardrail}>
            <span>guardrail</span>
            <h3>{guardrail}</h3>
            <p>Required before this fixture can support workflow or connector implementation.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
