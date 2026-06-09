import Link from "next/link";
import { integrationContracts } from "../lib/integrationContracts";
import { getInteroperabilitySummary } from "../lib/interoperabilityStandards";

export default function IntegrationsPage() {
  const interoperability = getInteroperabilitySummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/hub">Hub</Link>
        <p className="eyebrow">Integration contracts</p>
        <h1>SCRIMED defines data boundaries before connecting clinical, financial, or operational systems.</h1>
        <p className="hero-text">
          These contracts bind expected signals and safeguards to governed standards targets including FHIR, HL7 v2, DICOM/DICOMweb, X12, IHE profiles, clinical terminology, and synthetic test evidence.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Interoperability contract summary">
        <article>
          <span>Standards</span>
          <strong>{interoperability.standardCount}</strong>
        </article>
        <article>
          <span>Contracts</span>
          <strong>{integrationContracts.length}</strong>
        </article>
        <article>
          <span>Active controls</span>
          <strong>{interoperability.activeControls}</strong>
        </article>
        <article>
          <span>Live connectors</span>
          <strong>0</strong>
        </article>
      </section>

      <section className="table-section" aria-label="SCRIMED integration contracts">
        <article className="module-row">
          <div>
            <span>{interoperability.status}</span>
            <h2>Interoperability control plane</h2>
          </div>
          <p>standards registry and conformance controls</p>
          <Link className="module-link" href="/interoperability">
            Inspect standards, profiles, conformance evidence, required controls, and unresolved terminology before connector implementation.
          </Link>
        </article>
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
            <p>{contract.sourceType} · {contract.standardIds.length} standards</p>
            <Link className="module-link" href={contract.route}>{contract.purpose}</Link>
          </article>
        ))}
      </section>
    </main>
  );
}
