import Link from "next/link";
import { getPilotDemoCommercialReadinessSummary } from "../lib/pilotDemoCommercialReadiness";
import { getProductServicePortfolioSummary } from "../lib/productServicePortfolio";
import { getServiceDeliverySummary } from "../lib/serviceDelivery";

export const metadata = {
  title: "SCRIMED Offers | Buy Governed Healthcare AI",
  description:
    "Buy SCRIMED healthcare AI assessments, synthetic pilots, protected enterprise pilots, governance reviews, and delivery packages with clear proof routes and boundaries."
};

export default function OfferingsPage() {
  const summary = getProductServicePortfolioSummary();
  const deliverySummary = getServiceDeliverySummary();
  const pilotDemoReadiness = getPilotDemoCommercialReadinessSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">Buy SCRIMED</p>
        <h1>Choose a clear healthcare AI package your team can fund, review, and govern.</h1>
        <p className="hero-text">
          SCRIMED gives healthcare buyers a practical path from workflow pain to assessment, synthetic pilot,
          protected enterprise activation, or governance review, with deliverables, proof routes, price discipline,
          and boundaries visible before custom work begins.
        </p>
        <div className="hero-actions">
          <Link className="primary-action" href="/pilot?offer=workflow-intelligence-assessment">
            Request Scoped Intake
          </Link>
          <a className="secondary-action" href={summary.briefRoute}>
            Download Buyer Brief
          </a>
          <Link className="secondary-action" href={deliverySummary.route}>
            See Delivery Model
          </Link>
          <Link className="secondary-action" href={pilotDemoReadiness.route}>
            Match Demo to Package
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Portfolio summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Offers</span>
          <strong>{summary.offerCount}</strong>
        </article>
        <article>
          <span>Packages</span>
          <strong>{summary.packageCount}</strong>
        </article>
        <article>
          <span>Margin controls</span>
          <strong>{summary.marginControlCount}</strong>
        </article>
        <article>
          <span>Boundary fixes</span>
          <strong>{summary.boundaryResolutionCount}</strong>
        </article>
        <article>
          <span>Proof routes</span>
          <strong>{summary.proofRouteCount}</strong>
        </article>
        <article>
          <span>Demo price paths</span>
          <strong>{pilotDemoReadiness.demoPathCount}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="Demo accelerator package routing">
        <div className="section-heading">
          <p className="eyebrow">From interest to purchase path</p>
          <h2>Every public demo now points to a package, price band, proof list, and no-PHI intake route.</h2>
        </div>
        {pilotDemoReadiness.demoOfferPaths.slice(0, 5).map((path) => (
          <article className="module-row" key={path.slug}>
            <div>
              <span>{path.recommendedOffer}</span>
              <h2>{path.name}</h2>
            </div>
            <p>{path.buyerFit}</p>
            <div>
              <strong>{path.pricingBand}</strong>
              <ul className="compact-list">
                <li>Pilot: {path.recommendedPilotName}</li>
                <li>{path.retainedBoundary}</li>
              </ul>
              <Link className="module-link" href={path.fastPathCta}>
                Scope this path
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band split-band" aria-label="Portfolio operating rule">
        <div>
          <p className="eyebrow">Canonical packaging rule</p>
          <h2>Every buyer conversation resolves to one package, one offer, one proof route, one margin control, and one retained boundary.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.primaryRevenuePath.map((step, index) => (
            <div className="layer-row" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="SCRIMED product service packages">
        <div className="section-heading">
          <p className="eyebrow">Packages</p>
          <h2>Offer packaging protects margin while making the buying path easier to approve.</h2>
        </div>
        {summary.productServicePackages.map((pack) => (
          <article className="module-row" key={pack.slug}>
            <div>
              <span>{pack.status}</span>
              <h2>{pack.name}</h2>
            </div>
            <p>{pack.bestFor}</p>
            <div>
              <strong>{pack.commercialModel}</strong>
              <ul className="compact-list">
                <li>Window: {pack.deliveryWindow}</li>
                <li>Includes: {pack.includedOffers.join(", ")}</li>
                <li>Expansion: {pack.expansionPath}</li>
                <li>Boundary: {pack.retainedBoundaries[0]}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED product service offers">
        <div className="section-heading">
          <p className="eyebrow">Offers</p>
          <h2>Each offer carries its own buyer trigger, deliverables, proof route, and hard stop.</h2>
        </div>
        {summary.productServiceOfferings.map((offer) => (
          <article className="module-row" key={offer.slug}>
            <div>
              <span>{offer.status}</span>
              <h2>{offer.name}</h2>
            </div>
            <p>{offer.trigger}</p>
            <div>
              <strong>{offer.outcome}</strong>
              <ul className="compact-list">
                <li>Buyer: {offer.buyer}</li>
                <li>Deliverables: {offer.deliverables.slice(0, 3).join(", ")}</li>
                <li>Gates: {offer.qualificationGates.join(", ")}</li>
                <li>{offer.boundary}</li>
              </ul>
              <div className="form-actions">
                <Link className="module-link" href={`/pilot?offer=${offer.slug}`}>
                  Scope this offer
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Delivery playbook">
        <div className="section-heading">
          <p className="eyebrow">Delivery playbook</p>
          <h2>Sales, product, trust, legal, finance, and delivery all use the same handoff sequence.</h2>
        </div>
        <div className="principle-grid">
          {summary.productServiceDeliveryPlaybooks.map((playbook) => (
            <article key={playbook.phase}>
              <span>{playbook.phase}</span>
              <h3>{playbook.owner}</h3>
              <p>{playbook.purpose}</p>
              <ul className="compact-list">
                <li>{playbook.buyerCommitment}</li>
                <li>{playbook.internalOutput}</li>
                <li>{playbook.retainedBoundary}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Service delivery workbench">
        <div className="section-heading">
          <p className="eyebrow">Service delivery</p>
          <h2>Packages are now bound to work-order templates, acceptance criteria, artifacts, and authority gates.</h2>
          <p className="section-copy">{deliverySummary.recommendedOperatingRule}</p>
          <div className="form-actions">
            <Link className="primary-action" href={deliverySummary.route}>
              Open Service Delivery
            </Link>
            <a className="secondary-action" href={deliverySummary.briefRoute}>
              Download Delivery Brief
            </a>
          </div>
        </div>
        {deliverySummary.serviceDeliveryPackageBindings.map((binding) => (
          <article className="module-row" key={binding.packageSlug}>
            <div>
              <span>{binding.deliveryLane}</span>
              <h2>{binding.packageName}</h2>
            </div>
            <p>{binding.buyerHandoff}</p>
            <div>
              <strong>{binding.marginRule}</strong>
              <ul className="compact-list">
                <li>Templates: {binding.workOrderTemplates.join(", ")}</li>
                <li>{binding.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Portfolio margin controls">
        <div className="section-heading">
          <p className="eyebrow">Margin controls</p>
          <h2>Price floors, data boundaries, services separation, and paid diligence keep enterprise work profitable.</h2>
        </div>
        {summary.productServiceMarginControls.map((control) => (
          <article className="module-row" key={control.slug}>
            <div>
              <span>{control.status}</span>
              <h2>{control.control}</h2>
            </div>
            <p>{control.marginRisk}</p>
            <div>
              <strong>{control.operatingPolicy}</strong>
              <ul className="compact-list">
                <li>Owner: {control.owner}</li>
                <li>Hard stops: {control.hardStops.join(", ")}</li>
                <li>Evidence: {control.evidenceRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Boundary resolutions">
        <div className="section-heading">
          <p className="eyebrow">Boundary resolutions</p>
          <h2>Workarounds are explicit, so delivery can move without crossing healthcare, legal, financial, or approval gates.</h2>
        </div>
        <div className="principle-grid">
          {summary.productServiceBoundaryResolutions.map((resolution) => (
            <article key={resolution.slug}>
              <span>{resolution.status}</span>
              <h3>{resolution.boundary}</h3>
              <p>{resolution.safeWorkaround}</p>
              <ul className="compact-list">
                <li>{resolution.riskIfIgnored}</li>
                <li>Gate: {resolution.remainingGate}</li>
                <li>Owner: {resolution.owner}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
