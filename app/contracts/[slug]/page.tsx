import { notFound } from "next/navigation";
import {
  getContractSlug,
  getIntegrationContractBySlug,
  integrationContracts
} from "../../lib/integrationContracts";

export function generateStaticParams() {
  return integrationContracts.map((contract) => ({
    slug: getContractSlug(contract)
  }));
}

export default async function ContractDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const contract = getIntegrationContractBySlug(slug);

  if (!contract) {
    notFound();
  }

  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/integrations">Integrations</a>
        <p className="eyebrow">{contract.sourceType} contract</p>
        <h1>{contract.name}</h1>
        <p className="hero-text">{contract.purpose}</p>
      </section>

      <section className="section-band hub-summary" aria-label="Contract summary">
        <article>
          <span>Status</span>
          <strong>{contract.status}</strong>
        </article>
        <article>
          <span>Source</span>
          <strong>{contract.sourceType}</strong>
        </article>
        <article>
          <span>Signals</span>
          <strong>{contract.requiredSignals.length}</strong>
        </article>
        <article>
          <span>Safeguards</span>
          <strong>{contract.safeguards.length}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Required signals</p>
          <h2>The minimum data shape expected before implementation.</h2>
        </div>
        <div className="layer-list">
          {contract.requiredSignals.map((signal, index) => (
            <div className="layer-row" key={signal}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{signal}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band principle-grid" aria-label="Contract safeguards">
        {contract.safeguards.map((safeguard) => (
          <article key={safeguard}>
            <h3>{safeguard}</h3>
            <p>Required before this contract can move from planning into live integration work.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
