import { getProductConsoleSummary } from "../lib/productConsole";

export default function ProductConsolePage() {
  const summary = getProductConsoleSummary();

  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/hub">Hub</a>
        <p className="eyebrow">Product console</p>
        <h1>SCRIMED is packaged as a sellable healthcare operating-system pilot.</h1>
        <p className="hero-text">
          This console turns SCRIMED from a readiness foundation into a commercial product surface: buyer offers, workflow demos, proof routes, deployment stages, and production safety boundaries.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED product summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Offers</span>
          <strong>{summary.offerCount}</strong>
        </article>
        <article>
          <span>Sellable pilots</span>
          <strong>{summary.sellablePilots}</strong>
        </article>
        <article>
          <span>Workflows</span>
          <strong>{summary.workflowCount}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Commercial offer</p>
          <h2>{summary.nextCommercialMove}</h2>
          <p className="section-copy">{summary.productionBoundary}</p>
        </div>
        <div className="layer-list">
          {Object.entries(summary.proofStack).map(([name, status], index) => (
            <div className="layer-row" key={name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{name}: {status}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="SCRIMED sellable product offers">
        {summary.productOffers.map((offer) => (
          <article className="module-row" key={offer.name}>
            <div>
              <span>{offer.status}</span>
              <h2>{offer.name}</h2>
            </div>
            <p>{offer.buyer}. {offer.problem}</p>
            <a className="module-link" href={offer.proofRoutes[0]}>
              {offer.pilotOutcome}
            </a>
          </article>
        ))}
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Buyer workflow demos</p>
          <h2>Each demo connects a business problem to a governed workflow and inspectable result.</h2>
        </div>
        <div className="layer-list">
          {summary.productWorkflows.map((workflow, index) => (
            <a className="layer-row" href={workflow.workflowRoute} key={workflow.name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{workflow.module}: {workflow.name}</strong>
            </a>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="SCRIMED deployment stages">
        {summary.deploymentStages.map((stage) => (
          <article className="module-row" key={stage.stage}>
            <div>
              <span>deployment</span>
              <h2>{stage.stage}</h2>
            </div>
            <p>{stage.buyerDecision}</p>
            <a className="module-link" href="/quality">
              {stage.scrimedProof}
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
