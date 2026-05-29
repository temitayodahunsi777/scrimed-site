import { syntheticScenarios } from "../lib/syntheticClinical";

export default function SyntheticClinicalPage() {
  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/hub">Hub</a>
        <p className="eyebrow">Synthetic clinical environment</p>
        <h1>SCRIMED validates workflows against synthetic scenarios before clinical data is connected.</h1>
        <p className="hero-text">
          These fixtures provide deterministic workflow validation for CarePath AI, DocuTwin, TrialCore, and Watchtower without using production identifiers or live patient records.
        </p>
      </section>

      <section className="table-section" aria-label="Synthetic clinical scenarios">
        {syntheticScenarios.map((scenario) => (
          <article className="module-row" key={scenario.id}>
            <div>
              <span>{scenario.status}</span>
              <h2>{scenario.id}</h2>
            </div>
            <p>{scenario.contractSlug}</p>
            <a className="module-link" href={scenario.route}>{scenario.expectedOutcome}</a>
          </article>
        ))}
      </section>
    </main>
  );
}
