import Link from "next/link";
import { syntheticScenarios } from "../lib/syntheticClinical";
import { getSyntheticValidationResults } from "../lib/syntheticValidation";

export default function SyntheticClinicalPage() {
  const validation = getSyntheticValidationResults();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/hub">Hub</Link>
        <p className="eyebrow">Synthetic clinical environment</p>
        <h1>SCRIMED validates workflows against synthetic scenarios before clinical data is connected.</h1>
        <p className="hero-text">
          These fixtures provide deterministic workflow validation for CarePath AI, DocuTwin, TrialCore, and Watchtower without using production identifiers or live patient records.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Synthetic validation summary">
        <article>
          <span>Validation</span>
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
          <span>Runner</span>
          <strong>/api/synthetic/validation</strong>
        </article>
      </section>

      <section className="table-section" aria-label="Synthetic clinical scenarios">
        {syntheticScenarios.map((scenario) => (
          <article className="module-row" key={scenario.id}>
            <div>
              <span>{scenario.status}</span>
              <h2>{scenario.id}</h2>
            </div>
            <p>{scenario.contractSlug}</p>
            <Link className="module-link" href={scenario.route}>{scenario.expectedOutcome}</Link>
          </article>
        ))}
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Validation runner</p>
          <h2>Scenario assertions are now evaluated as a managed quality gate.</h2>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>01</span>
            <Link className="module-link" href="/synthetic/validation">Open validation results</Link>
          </div>
          <div className="layer-row">
            <span>02</span>
            <Link className="module-link" href="/synthetic/fixtures">Open fixture contracts</Link>
          </div>
          <div className="layer-row">
            <span>03</span>
            {/* API inspection intentionally uses a document navigation instead of the App Router. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a className="module-link" href="/api/synthetic/validation">Inspect validation API</a>
          </div>
        </div>
      </section>
    </main>
  );
}
