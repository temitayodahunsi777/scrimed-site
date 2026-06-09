import Link from "next/link";
import { syntheticFixtures } from "../../lib/syntheticFixtures";

export default function SyntheticFixturesPage() {
  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/synthetic">Synthetic</Link>
        <p className="eyebrow">Synthetic fixtures</p>
        <h1>Structured request and expected-output fixtures make SCRIMED validation repeatable.</h1>
        <p className="hero-text">
          Each fixture defines safe synthetic inputs, workflow guardrails, required traces, expected output signals, and prohibited claims before live clinical connectors are introduced.
        </p>
      </section>

      <section className="table-section" aria-label="Synthetic fixture contracts">
        {syntheticFixtures.map((fixture) => (
          <article className="module-row" key={fixture.scenarioId}>
            <div>
              <span>{fixture.request.module}</span>
              <h2>{fixture.scenarioId}</h2>
            </div>
            <p>{fixture.expectedOutput.decisionState}</p>
            <Link className="module-link" href={fixture.route}>
              Open fixture contract
            </Link>
          </article>
        ))}
      </section>

      <section className="section-band principle-grid" aria-label="Synthetic fixture safeguards">
        {syntheticFixtures.flatMap((fixture) =>
          fixture.request.guardrails.map((guardrail) => (
            <article key={`${fixture.scenarioId}-${guardrail}`}>
              <span>{fixture.scenarioId}</span>
              <h3>{guardrail}</h3>
              <p>Required fixture guardrail before workflow execution or connector implementation.</p>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
