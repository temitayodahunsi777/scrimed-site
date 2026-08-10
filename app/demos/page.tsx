import Link from "next/link";
import { getDemoPilotProgramSummary } from "../lib/demoPilotPrograms";
import { getPilotDemoCommercialReadinessSummary } from "../lib/pilotDemoCommercialReadiness";

export const metadata = {
  title: "SCRIMED Demos | Governed Healthcare AI Proof",
  description:
    "Watch SCRIMED no-PHI healthcare AI demos and move from workflow proof to pilot package, price band, and buyer-safe intake."
};

export default function DemosPage() {
  const summary = getDemoPilotProgramSummary();
  const commercialReadiness = getPilotDemoCommercialReadinessSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">See the product before you buy the pilot</p>
        <h1>Watch no-PHI healthcare AI demos that turn directly into scoped pilot options.</h1>
        <p className="hero-text">
          Explore SCRIMED workflow proof for access operations, documentation review, research operations,
          interoperability readiness, and AI governance, then choose the recommended pilot path without handing over PHI.
        </p>
        <div className="hero-actions" aria-label="Demo center actions">
          <Link className="primary-action" href="/pilot-demo-commercial-readiness#demo-session-planner">
            Build Demo Session
          </Link>
          <Link className="secondary-action" href="/pilots">
            Compare Pilots
          </Link>
          <Link className="secondary-action" href="/pricing">
            Review Pricing
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED demo center summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Demos</span>
          <strong>{summary.demoCount}</strong>
        </article>
        <article>
          <span>Executable</span>
          <strong>{summary.executableDemos}</strong>
        </article>
        <article>
          <span>Pilot programs</span>
          <strong>{summary.pilotCount}</strong>
        </article>
        <article>
          <span>Commercial paths</span>
          <strong>{commercialReadiness.demoPathCount}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="SCRIMED investor demo proof">
        <div className="section-heading">
          <p className="eyebrow">Proof investors and buyers can understand</p>
          <h2>{summary.investorReadiness.thesis}</h2>
          <p className="section-copy">{summary.investorReadiness.demoToPilotConversionPath}</p>
        </div>
        {summary.investorReadiness.proofSignals.map((signal) => (
          <article className="module-row" key={signal.label}>
            <div>
              <span>{signal.status}</span>
              <h2>{signal.label}</h2>
            </div>
            <p>{signal.evidence}</p>
            <Link className="module-link" href={signal.route}>Inspect proof surface</Link>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED product demos">
        <div className="section-heading">
          <p className="eyebrow">Demo registry</p>
          <h2>Each demo connects a real buyer problem to product proof and a recommended paid path.</h2>
        </div>
        {summary.productDemos.map((demo) => (
          <article className="module-row" key={demo.slug}>
            <div>
              <span>{demo.status}</span>
              <h2>{demo.name}</h2>
            </div>
            <p>{demo.buyer}</p>
            <div>
              <Link className="module-link" href={demo.route}>{demo.objective}</Link>
              <ul className="compact-list">
                <li>{demo.product} · {demo.agent}</li>
                <li>{demo.inspectableOutcomes.length} inspectable outcomes</li>
                <li>{demo.productionExclusions.length} production exclusions retained</li>
                <li>
                  {commercialReadiness.demoOfferPaths.find((path) => path.slug === demo.slug)?.pricingBand ??
                    "Commercial path requires review"}
                </li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Demo commercial accelerator">
        <div className="section-heading">
          <p className="eyebrow">Seamless next step</p>
          <h2>Use the accelerator before buyer calls to map demo interest into a package, price band, and no-PHI intake route.</h2>
        </div>
        {commercialReadiness.demoOfferPaths.map((path) => (
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
                Start no-PHI intake
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band product-actions" aria-label="SCRIMED demo buyer actions">
        <div className="section-heading">
          <p className="eyebrow">Next decision</p>
          <h2>Move from inspectable demo evidence to a scoped enterprise pilot.</h2>
        </div>
        <div className="action-grid">
          <Link className="action-card" href="/pilots">
            <span>Pilot programs</span>
            <strong>Compare pilot scopes</strong>
            <p>Review duration, deliverables, inputs, metrics, governance gates, and engagement models.</p>
          </Link>
          <Link className="action-card" href="/pricing">
            <span>Commercial model</span>
            <strong>Review pricing</strong>
            <p>Inspect recommended enterprise ranges, sales stages, and commercial guardrails.</p>
          </Link>
          <Link className="action-card" href="/pilot-demo-commercial-readiness#demo-session-planner">
            <span>Accelerator</span>
            <strong>Build the buyer run of show</strong>
            <p>Generate a timed demo, evidence path, pilot close, and no-PHI intake handoff.</p>
          </Link>
          <Link className="action-card" href="/pilot?offer=synthetic-pilot-evaluation">
            <span>Buyer intake</span>
            <strong>Request a pilot</strong>
            <p>Submit business-contact and workflow-scope information without PHI.</p>
          </Link>
          <Link className="action-card" href="/quality">
            <span>Proof stack</span>
            <strong>Inspect quality gates</strong>
            <p>Review active evidence gates and the controls still required before production.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
