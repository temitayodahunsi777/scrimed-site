import { integrationContracts } from "../lib/integrationContracts";

export default function IntegrationsPage() {
  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/hub">Hub</a>
        <p className="eyebrow">Integration contracts</p>
        <h1>SCRIMED defines data boundaries before connecting clinical, financial, or operational systems.</h1>
        <p className="hero-text">
          These contracts describe the expected signals, purpose, and safeguards for future FHIR, HL7, claims, pricing, and synthetic test integrations.
        </p>
      </section>

      <section className="table-section" aria-label="SCRIMED integration contracts">
        {integrationContracts.map((contract) => (
          <article className="module-row" key={contract.name}>
            <div>
              <span>{contract.status}</span>
              <h2>{contract.name}</h2>
            </div>
            <p>{contract.sourceType}</p>
            <a className="module-link" href={contract.route}>{contract.purpose}</a>
          </article>
        ))}
      </section>
    </main>
  );
}
