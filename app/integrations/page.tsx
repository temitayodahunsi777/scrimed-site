import Link from "next/link";
import { integrationContracts } from "../lib/integrationContracts";

export default function IntegrationsPage() {
  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/hub">Hub</Link>
        <p className="eyebrow">Integration contracts</p>
        <h1>SCRIMED defines data boundaries before connecting clinical, financial, or operational systems.</h1>
        <p className="hero-text">
          These contracts describe the expected signals, purpose, and safeguards for future FHIR, HL7, claims, pricing, and synthetic test integrations.
        </p>
      </section>

      <section className="table-section" aria-label="SCRIMED integration contracts">
        <article className="module-row">
          <div>
            <span>active validation</span>
            <h2>Integration fixture validation</h2>
          </div>
          <p>synthetic request and expected-response fixtures</p>
          <Link className="module-link" href="/integrations/fixture-validation">
            Review coverage, safeguard mapping, and fixture diff fingerprints before live connector work.
          </Link>
        </article>
        {integrationContracts.map((contract) => (
          <article className="module-row" key={contract.name}>
            <div>
              <span>{contract.status}</span>
              <h2>{contract.name}</h2>
            </div>
            <p>{contract.sourceType}</p>
            <Link className="module-link" href={contract.route}>{contract.purpose}</Link>
          </article>
        ))}
      </section>
    </main>
  );
}
