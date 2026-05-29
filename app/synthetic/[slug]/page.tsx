import { notFound } from "next/navigation";
import {
  getSyntheticScenarioBySlug,
  syntheticScenarios
} from "../../lib/syntheticClinical";
import { getSyntheticValidationResultBySlug } from "../../lib/syntheticValidation";

export function generateStaticParams() {
  return syntheticScenarios.map((scenario) => ({
    slug: scenario.id
  }));
}

export default async function SyntheticScenarioPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const scenario = getSyntheticScenarioBySlug(slug);
  const validation = getSyntheticValidationResultBySlug(slug);

  if (!scenario || !validation) {
    notFound();
  }

  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/synthetic">Synthetic</a>
        <p className="eyebrow">Synthetic scenario</p>
        <h1>{scenario.id}</h1>
        <p className="hero-text">{scenario.scenario}</p>
      </section>

      <section className="section-band hub-summary" aria-label="Synthetic scenario summary">
        <article>
          <span>Status</span>
          <strong>{scenario.status}</strong>
        </article>
        <article>
          <span>Risk markers</span>
          <strong>{scenario.riskMarkers.length}</strong>
        </article>
        <article>
          <span>Trace steps</span>
          <strong>{scenario.workflowTrace.length}</strong>
        </article>
        <article>
          <span>Assertions</span>
          <strong>{scenario.assertions.length}</strong>
        </article>
      </section>

      <section className="section-band hub-summary" aria-label="Synthetic validation result">
        <article>
          <span>Validation</span>
          <strong>{validation.status}</strong>
        </article>
        <article>
          <span>Passed</span>
          <strong>{validation.passed}</strong>
        </article>
        <article>
          <span>Failed</span>
          <strong>{validation.failed}</strong>
        </article>
        <article>
          <span>API</span>
          <strong>/api/synthetic/validation/{scenario.id}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Expected outcome</p>
          <h2>{scenario.expectedOutcome}</h2>
          <p className="section-copy">{scenario.patientProfile}</p>
        </div>
        <div className="layer-list">
          {scenario.workflowTrace.map((step, index) => (
            <div className="layer-row" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band principle-grid" aria-label="Synthetic scenario assertions">
        {scenario.assertions.map((assertion) => (
          <article key={assertion}>
            <h3>{assertion}</h3>
            <p>Required for this synthetic workflow to be considered valid.</p>
          </article>
        ))}
      </section>

      <section className="section-band principle-grid" aria-label="Synthetic validation checks">
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
