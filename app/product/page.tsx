import Link from "next/link";
import { getProductConsoleSummary } from "../lib/productConsole";

export default function ProductConsolePage() {
  const summary = getProductConsoleSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/hub">Hub</Link>
        <p className="eyebrow">SCRIMED Product Console</p>
        <h1>SCRIMED Product Console packages a sellable healthcare operating-system pilot.</h1>
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
          <span>Ops blockers</span>
          <strong>{summary.companyOperationsSummary.blocked}</strong>
        </article>
        <article>
          <span>Ops actions</span>
          <strong>{summary.companyOperationsSummary.manualAction}</strong>
        </article>
        <article>
          <span>Services</span>
          <strong>{summary.serviceOfferCount}</strong>
        </article>
        <article>
          <span>Agents</span>
          <strong>{summary.agentCount}</strong>
        </article>
        <article>
          <span>Workflow engine</span>
          <strong>{summary.workflowEngineCount}</strong>
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

      <section className="table-section" aria-label="SCRIMED enterprise services and offers">
        <div className="section-heading">
          <p className="eyebrow">Services and offers</p>
          <h2>Sellable enterprise packages for governed healthcare AI transformation.</h2>
          <p className="section-copy">
            SCRIMED can be sold today as a synthetic pilot, workflow intelligence assessment, governance audit, and automation blueprint while live clinical execution stays gated.
          </p>
        </div>
        {summary.enterpriseServiceOffers.map((offer) => (
          <article className="module-row" key={offer.name}>
            <div>
              <span>{offer.status}</span>
              <h2>{offer.name}</h2>
            </div>
            <p>{offer.buyer}</p>
            <div>
              <Link className="module-link" href="/product">{offer.deliverable}</Link>
              <ul className="compact-list">
                <li>{offer.proof}</li>
                <li>{offer.boundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED agents">
        <div className="section-heading">
          <p className="eyebrow">SCRIMED Agents</p>
          <h2>Named agents with scoped capabilities, workflow ownership, and governance flags.</h2>
          <p className="section-copy">
            Agents are specialized by workflow domain and remain auditable, review-gated, and bounded to non-diagnostic operational intelligence.
          </p>
        </div>
        {summary.productAgents.map((agent) => (
          <article className="module-row" key={agent.name}>
            <div>
              <span>{agent.status}</span>
              <h2>{agent.name}</h2>
            </div>
            <p>{agent.domain}. {agent.owner}</p>
            <div>
              <Link className="module-link" href={agent.workflowRoute}>{agent.capability}</Link>
              <ul className="compact-list">
                {agent.governanceFlags.map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED workflow engine examples">
        <div className="section-heading">
          <p className="eyebrow">Workflow engine</p>
          <h2>Example workflows turn fragmented healthcare work into decision-grade review queues.</h2>
          <p className="section-copy">
            These workflows demonstrate the operating layer without claiming autonomous treatment, diagnosis, payer submission, or live patient execution.
          </p>
        </div>
        {summary.workflowEngineExamples.map((workflow) => (
          <article className="module-row" key={workflow.name}>
            <div>
              <span>{workflow.status}</span>
              <h2>{workflow.name}</h2>
            </div>
            <p>{workflow.agent}. {workflow.buyerValue}</p>
            <div>
              <strong>{workflow.inspectableOutput}</strong>
              <ul className="compact-list">
                <li>{workflow.governanceBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="SCRIMED trust and governance controls">
        <div className="section-heading">
          <p className="eyebrow">Trust and governance</p>
          <h2>Clinical safety boundaries stay visible before any production execution.</h2>
          <p className="section-copy">
            SCRIMED presents as healthcare operational intelligence with human oversight, synthetic-first validation, auditability, privacy discipline, and planned role-based controls.
          </p>
        </div>
        <div className="principle-grid">
          {summary.governanceControls.map((control) => (
            <article key={control.control}>
              <span>{control.status}</span>
              <h3>{control.control}</h3>
              <p>{control.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band" aria-label="SCRIMED evidence and proof stack">
        <div className="section-heading">
          <p className="eyebrow">Evidence and proof stack</p>
          <h2>Buyer value is framed as measurable pilot evidence, not unsupported clinical claims.</h2>
        </div>
        <div className="principle-grid">
          {summary.evidenceMetrics.map((metric) => (
            <article key={metric.metric}>
              <span>Evidence</span>
              <h3>{metric.metric}</h3>
              <p>{metric.signal}</p>
              <ul className="compact-list">
                <li>{metric.proof}</li>
                <li>{metric.measurementBoundary}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band product-actions" aria-label="SCRIMED buyer actions">
        <div className="section-heading">
          <p className="eyebrow">Buyer actions</p>
          <h2>Move from evaluation to a governed enterprise pilot.</h2>
        </div>
        <div className="action-grid">
          {summary.buyerActions.map((action) => (
            <Link className="action-card" href={action.href} key={action.label}>
              <span>{action.label}</span>
              <strong>{action.purpose}</strong>
              <p>{action.boundary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="SCRIMED sellable product offers">
        <div className="section-heading">
          <p className="eyebrow">Product offers</p>
          <h2>Pilot offers connect buyer problems to proof routes and governed synthetic demonstrations.</h2>
        </div>
        {summary.productOffers.map((offer) => (
          <article className="module-row" key={offer.name}>
            <div>
              <span>{offer.status}</span>
              <h2>{offer.name}</h2>
            </div>
            <p>{offer.buyer}. {offer.problem}</p>
            <Link className="module-link" href={offer.proofRoutes[0]}>
              {offer.pilotOutcome}
            </Link>
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
            <Link className="layer-row" href={workflow.workflowRoute} key={workflow.name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{workflow.module}: {workflow.name}</strong>
            </Link>
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
            <Link className="module-link" href="/quality">
              {stage.scrimedProof}
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
