import Link from "next/link";
import { getDemoPilotProgramSummary } from "../lib/demoPilotPrograms";
import { getPilotDemoCommercialReadinessSummary } from "../lib/pilotDemoCommercialReadiness";

export const metadata = {
  title: "SCRIMED Pilot Programs | Buy Healthcare AI Proof",
  description:
    "Compare SCRIMED healthcare AI assessments, synthetic pilots, protected enterprise pilots, and governance programs with deliverables, price posture, and proof gates."
};

export default function PilotProgramsPage() {
  const summary = getDemoPilotProgramSummary();
  const commercialReadiness = getPilotDemoCommercialReadinessSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">Pilot programs healthcare buyers can fund</p>
        <h1>Move from workflow pain to a decision-grade SCRIMED pilot.</h1>
        <p className="hero-text">
          Choose the right level of commitment: quick workflow assessment, synthetic pilot evaluation,
          protected enterprise pilot, or AI governance and interoperability readiness, each with deliverables,
          buyer inputs, success metrics, and retained production boundaries.
        </p>
        <div className="hero-actions" aria-label="Pilot program actions">
          <Link className="primary-action" href="/pilot-demo-commercial-readiness">
            Find My Pilot
          </Link>
          <Link className="secondary-action" href="/demos">
            Watch Demos
          </Link>
          <Link className="secondary-action" href="/pricing">
            Review Pricing
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED pilot program summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Programs</span>
          <strong>{summary.pilotCount}</strong>
        </article>
        <article>
          <span>Sellable now</span>
          <strong>{summary.sellableNow}</strong>
        </article>
        <article>
          <span>Protected pilots</span>
          <strong>{summary.protectedPilots}</strong>
        </article>
        <article>
          <span>Price bands</span>
          <strong>{commercialReadiness.pilotPriceBands.length}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="SCRIMED pilot investor readiness">
        <div className="section-heading">
          <p className="eyebrow">From demo to funded pilot</p>
          <h2>{summary.investorReadiness.status}</h2>
          <p className="section-copy">{summary.investorReadiness.nextDiligenceStep}</p>
        </div>
        {summary.investorReadiness.revenuePath.map((step, index) => (
          <article className="module-row" key={step}>
            <div>
              <span>step {index + 1}</span>
              <h2>{step}</h2>
            </div>
            <p>{summary.investorReadiness.currentBoundary}</p>
            <Link className="module-link" href={index < 1 ? "/demos" : index < 3 ? "/pilot" : "/pilot-workspace"}>
              Inspect conversion surface
            </Link>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED pilot program catalog">
        <div className="section-heading">
          <p className="eyebrow">Pilot catalog</p>
          <h2>Every program defines what the buyer funds, what SCRIMED delivers, and what decision comes next.</h2>
        </div>
        {summary.pilotPrograms.map((pilot) => (
          <article className="module-row" key={pilot.slug}>
            <div>
              <span>{pilot.status} · {pilot.duration}</span>
              <h2>{pilot.name}</h2>
            </div>
            <p>{pilot.buyer}</p>
            <div>
              <Link className="module-link" href={pilot.route}>{pilot.objective}</Link>
              <ul className="compact-list">
                <li>{pilot.engagementModel}</li>
                <li>{pilot.deliverables.length} deliverables</li>
                <li>{pilot.successMetrics.length} success metrics</li>
                <li>
                  {commercialReadiness.pilotPriceBands.find((band) => band.slug === pilot.slug)?.requestRoute ??
                    pilot.requestRoute}
                </li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Pilot commercial alignment">
        <div className="section-heading">
          <p className="eyebrow">Pricing alignment</p>
          <h2>Pilot pricing now follows one market-informed ladder from free demos to enterprise operating licenses.</h2>
        </div>
        {commercialReadiness.pricingTierAlignments.slice(1, 5).map((alignment) => (
          <article className="module-row" key={alignment.tier}>
            <div>
              <span>aligned tier</span>
              <h2>{alignment.tier}</h2>
            </div>
            <p>{alignment.recommendedBand}</p>
            <div>
              <strong>{alignment.marketRationale}</strong>
              <ul className="compact-list">
                <li>{alignment.marginRule}</li>
                <li>{alignment.buyerFriendlyPositioning}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band product-actions" aria-label="SCRIMED pilot buyer actions">
        <div className="action-grid">
          <Link className="action-card" href="/demos">
            <span>Product proof</span>
            <strong>Inspect demos</strong>
            <p>Review the executable synthetic surfaces included in pilot programs.</p>
          </Link>
          <Link className="action-card" href="/pricing">
            <span>Commercial model</span>
            <strong>Review pricing</strong>
            <p>Understand package ranges, annual expansion, and enterprise guardrails.</p>
          </Link>
          <Link className="action-card" href="/pilot-demo-commercial-readiness">
            <span>Accelerator</span>
            <strong>Match demo to price</strong>
            <p>Use the market-aligned bridge before intake, diligence, or custom scope expands.</p>
          </Link>
          <Link className="action-card" href="/pilot">
            <span>Buyer intake</span>
            <strong>Request a scoped pilot</strong>
            <p>Submit organization, workflow, governance, and readiness context without PHI.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
