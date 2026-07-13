import Link from "next/link";
import { getOmegaPlatformAuditSummary } from "../lib/omegaPlatformAudit";

export const metadata = {
  title: "SCRIMED Omega Platform Audit",
  description:
    "Complete SCRIMED product, AI, workflow, service, API, agent, infrastructure, safety, and upgrade audit control plane."
};

export default function OmegaAuditPage() {
  const summary = getOmegaPlatformAuditSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">SCRIMED Omega Platform Audit</p>
        <h1>Every SCRIMED product now has a product-grade audit, safety boundary, proof route, and upgrade lane.</h1>
        <p className="hero-text">
          This control plane discovers SCRIMED products, modules, agents, workflows, APIs, UI surfaces,
          backend processes, and infrastructure components, then audits each product across architecture,
          debt, performance, security, clinical safety, accessibility, scalability, maintainability,
          reliability, user experience, developer experience, and compliance.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.apiRoute}>
            Inspect Omega API
          </a>
          <a className="secondary-action" href={summary.briefRoute}>
            Download Brief
          </a>
          <Link className="secondary-action" href="/clinical-production-readiness">
            Clinical Readiness
          </Link>
          <Link className="secondary-action" href="/platform-power">
            Platform Power
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Omega platform audit summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Products</span>
          <strong>{summary.productCount}</strong>
        </article>
        <article>
          <span>Audit lenses</span>
          <strong>{summary.auditLensCount}</strong>
        </article>
        <article>
          <span>Total checks</span>
          <strong>{summary.totalAuditCheckCount}</strong>
        </article>
        <article>
          <span>Avg score</span>
          <strong>{summary.averageReadinessScore}</strong>
        </article>
        <article>
          <span>Implemented</span>
          <strong>{summary.implementedProductCount}</strong>
        </article>
        <article>
          <span>High risk</span>
          <strong>{summary.highRiskProductCount}</strong>
        </article>
        <article>
          <span>Controlled gaps</span>
          <strong>{summary.controlledGapFindingCount}</strong>
        </article>
        <article>
          <span>Blocked checks</span>
          <strong>{summary.blockedFindingCount}</strong>
        </article>
        <article>
          <span>Upgrade lanes</span>
          <strong>{summary.implementationLaneCount}</strong>
        </article>
        <article>
          <span>Proof routes</span>
          <strong>{summary.proofRouteCount}</strong>
        </article>
        <article>
          <span>Hard stops</span>
          <strong>{summary.hardStopCount}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Omega audit boundary">
        <div>
          <p className="eyebrow">Operating boundary</p>
          <h2>Omega is an execution control plane, not approval authority.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {Object.entries(summary.authority).map(([key, value]) => (
            <div className="layer-row" key={key}>
              <span>{key}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band" aria-label="Discovered SCRIMED platform surfaces">
        <div className="section-heading">
          <p className="eyebrow">Discovered platform surface</p>
          <h2>Products, modules, services, APIs, agents, workflows, UI routes, backend processes, and infrastructure are now visible together.</h2>
        </div>
        <div className="principle-grid">
          <article>
            <span>{summary.discoveredSurfaces.products.length}</span>
            <h3>Products</h3>
            <p>{summary.discoveredSurfaces.products.join(", ")}</p>
          </article>
          <article>
            <span>{summary.discoveredSurfaces.modules.length}</span>
            <h3>Modules</h3>
            <p>{summary.discoveredSurfaces.modules.join(", ")}</p>
          </article>
          <article>
            <span>{summary.discoveredSurfaces.services.length}</span>
            <h3>Services</h3>
            <p>{summary.discoveredSurfaces.services.join(", ")}</p>
          </article>
          <article>
            <span>{summary.discoveredSurfaces.apis.length}</span>
            <h3>APIs</h3>
            <p>{summary.discoveredSurfaces.apis.slice(0, 16).join(", ")}</p>
          </article>
          <article>
            <span>{summary.discoveredSurfaces.agents.length}</span>
            <h3>Agents</h3>
            <p>{summary.discoveredSurfaces.agents.join(", ")}</p>
          </article>
          <article>
            <span>{summary.discoveredSurfaces.workflows.length}</span>
            <h3>Workflows</h3>
            <p>{summary.discoveredSurfaces.workflows.join(", ")}</p>
          </article>
          <article>
            <span>{summary.discoveredSurfaces.backendProcesses.length}</span>
            <h3>Backend processes</h3>
            <p>{summary.discoveredSurfaces.backendProcesses.join(", ")}</p>
          </article>
          <article>
            <span>{summary.discoveredSurfaces.infrastructure.length}</span>
            <h3>Infrastructure</h3>
            <p>{summary.discoveredSurfaces.infrastructure.join(", ")}</p>
          </article>
        </div>
      </section>

      <section className="table-section" aria-label="Omega implementation lanes">
        <div className="section-heading">
          <p className="eyebrow">Upgrade lanes</p>
          <h2>Highest-impact work is now sequenced into clinical robustness, agent runtime, private AI, payer/referral/RCM, observability, and enterprise infrastructure lanes.</h2>
        </div>
        {summary.implementationLanes.map((lane) => (
          <article className="module-row" key={lane.slug}>
            <div>
              <span>{lane.priority}</span>
              <h2>{lane.lane}</h2>
            </div>
            <p>{lane.objective}</p>
            <div>
              <strong>{lane.appliesTo.join(", ")}</strong>
              <ul className="compact-list">
                <li>Pattern: {lane.implementationPattern.join(", ")}</li>
                <li>Proof routes: {lane.proofRoutes.join(", ")}</li>
                <li>Hard stops: {lane.hardStops.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Omega audit lenses">
        <div className="section-heading">
          <p className="eyebrow">Twelve-lens audit standard</p>
          <h2>Every product is inspected against the same production-quality standard.</h2>
        </div>
        <div className="principle-grid">
          {summary.auditLenses.map((lens) => (
            <article key={lens.lens}>
              <span>{lens.lens}</span>
              <h3>{lens.minimumStandard}</h3>
              <p>{lens.question}</p>
              <ul className="compact-list">
                <li>{lens.failClosedBoundary}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Omega product audit registry">
        <div className="section-heading">
          <p className="eyebrow">Product audit registry</p>
          <h2>SCRIMED products are now scored, bounded, routed, and assigned next actions.</h2>
          <p className="section-copy">
            Scores indicate engineering readiness inside the current no-PHI, no-live-care boundary.
            They are not clinical validation, certification, production approval, or buyer release.
          </p>
        </div>
        {summary.products.map((product) => (
          <article className="module-row" key={product.slug}>
            <div>
              <span>{product.status} / score {product.readinessScore}</span>
              <h2>{product.name}</h2>
            </div>
            <p>{product.biggestGap}</p>
            <div>
              <strong>{product.strongestAsset}</strong>
              <ul className="compact-list">
                <li>Category: {product.category}</li>
                <li>Clinical risk: {product.clinicalRisk}</li>
                <li>Buyers: {product.primaryBuyers.join(", ")}</li>
                <li>Capabilities: {product.coreCapabilities.join(", ")}</li>
                <li>Agents: {product.aiAgents.join(", ")}</li>
                <li>Workflows: {product.workflows.join(", ")}</li>
                <li>Boundary: {product.dataBoundary}</li>
                <li>Next: {product.nextActions.join(", ")}</li>
                <li>Routes: {product.linkedRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Omega next step">
        <div className="section-heading">
          <p className="eyebrow">Next highest-impact implementation</p>
          <h2>{summary.nextHighestImpactStep}</h2>
        </div>
      </section>
    </main>
  );
}
