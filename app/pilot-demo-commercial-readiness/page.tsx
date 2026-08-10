import Link from "next/link";
import { applicationUrl } from "../lib/companyIdentity";
import { getPilotDemoCommercialReadinessSummary } from "../lib/pilotDemoCommercialReadiness";
import PilotDemoSessionPlanner from "./PilotDemoSessionPlanner";

export const metadata = {
  title: "SCRIMED Demo to Pilot Accelerator",
  description:
    "Match SCRIMED healthcare AI demos to pilot packages, price bands, proof assets, no-PHI intake, and buyer-safe next steps.",
  alternates: {
    canonical: applicationUrl("/pilot-demo-commercial-readiness")
  },
  openGraph: {
    title: "SCRIMED Demo to Pilot Accelerator",
    description:
      "Map synthetic SCRIMED demonstrations to governed pilot packages, evidence, and human-reviewed next steps.",
    url: applicationUrl("/pilot-demo-commercial-readiness")
  }
};

export default function PilotDemoCommercialReadinessPage() {
  const summary = getPilotDemoCommercialReadinessSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">Turn demo interest into a paid pilot path</p>
        <h1>Tell us what you want to solve. SCRIMED maps the right demo to the right pilot package.</h1>
        <p className="hero-text">
          Use this accelerator to choose a demo, see the recommended pilot, understand the price band,
          gather proof assets, and start no-PHI intake without drifting into custom scope too early.
        </p>
        <div className="hero-actions" aria-label="Pilot demo commercial readiness actions">
          <a className="primary-action" href="#demo-session-planner">
            Build Demo Session
          </a>
          <Link className="secondary-action" href="/demos">
            Browse Demos
          </Link>
          <Link className="secondary-action" href="/pilots">
            Compare Pilots
          </Link>
          <Link className="secondary-action" href="/pricing">
            Review Pricing
          </Link>
          <a className="secondary-action" href={summary.briefRoute}>
            Download Buyer Brief
          </a>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Pilot demo accelerator summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Path score</span>
          <strong>{summary.standardPathScore}%</strong>
        </article>
        <article>
          <span>Demos mapped</span>
          <strong>{summary.demoPathCount}/{summary.demoCount}</strong>
        </article>
        <article>
          <span>Conversion packets</span>
          <strong>{summary.buyerConversionPacketCount}</strong>
        </article>
        <article>
          <span>Pilots</span>
          <strong>{summary.pilotCount}</strong>
        </article>
        <article>
          <span>Benchmarks</span>
          <strong>{summary.marketBenchmarkCount}</strong>
        </article>
        <article>
          <span>Hard stops</span>
          <strong>{summary.hardStopCount}</strong>
        </article>
      </section>

      <PilotDemoSessionPlanner catalog={summary.sessionPlanner.catalog} />

      <section className="section-band split-band" aria-label="Pricing decision">
        <div>
          <p className="eyebrow">Simple buying rule</p>
          <h2>Free public demos prove the product. Paid assessments and pilots begin when SCRIMED starts doing buyer-specific work.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.conversionSteps.map((step, index) => (
            <Link className="layer-row" href={step.proofRoute} key={step.step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step.step}: {step.pricingSignal}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Demo to pilot paths">
        <div className="section-heading">
          <p className="eyebrow">Demo to pilot paths</p>
          <h2>Each demo now has a recommended package, price band, proof list, and no-PHI intake path.</h2>
        </div>
        {summary.demoOfferPaths.map((path) => (
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
                <li>Proof: {path.proofAssets.slice(0, 3).join(", ")}</li>
                <li>{path.retainedBoundary}</li>
              </ul>
              <div className="form-actions">
                <Link className="module-link" href={path.demoRoute}>
                  Open demo
                </Link>
                <Link className="module-link" href={path.fastPathCta}>
                  Start no-PHI intake
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Buyer conversion packets">
        <div className="section-heading">
          <p className="eyebrow">Buyer conversion packets</p>
          <h2>Every demo ends with one sponsor, one owner, one proof bundle, one paid step, and one retained boundary.</h2>
        </div>
        {summary.buyerConversionPackets.map((packet) => (
          <article className="module-row" key={packet.id}>
            <div>
              <span>{packet.minimumPaidStep}</span>
              <h2>{packet.demoName}</h2>
            </div>
            <p>{packet.closePlan}</p>
            <div>
              <strong>{packet.pricingGuardrail}</strong>
              <ul className="compact-list">
                <li>Sponsor: {packet.sponsorRole}</li>
                <li>Owner: {packet.workflowOwnerRole}</li>
                <li>Cadence: {packet.reviewCadence}</li>
                <li>Decision window: {packet.decisionWindow}</li>
                <li>Acceptance: {packet.acceptanceCriteria.slice(0, 2).join(" ")}</li>
                <li>Paid trigger: {packet.paidDiligenceTriggers[0]}</li>
                <li>Disqualifier: {packet.disqualifiers[0]}</li>
                <li>Human review: {String(packet.humanReviewRequired)}</li>
                <li>Audit hash: {packet.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Market aligned price bands">
        <div className="section-heading">
          <p className="eyebrow">Market-aligned pricing</p>
          <h2>SCRIMED should be easy to try, but priced as enterprise healthcare intelligence infrastructure.</h2>
        </div>
        {summary.pricingTierAlignments.map((alignment) => (
          <article className="module-row" key={alignment.tier}>
            <div>
              <span>tier</span>
              <h2>{alignment.tier}</h2>
            </div>
            <p>{alignment.recommendedBand}</p>
            <div>
              <strong>{alignment.marketRationale}</strong>
              <ul className="compact-list">
                <li>{alignment.marginRule}</li>
                <li>{alignment.buyerFriendlyPositioning}</li>
                <li>Risk avoided: {alignment.oldRisk}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Market benchmark context">
        <div className="section-heading">
          <p className="eyebrow">Market context</p>
          <h2>Use competitor pricing as context, not as SCRIMED&apos;s ceiling.</h2>
        </div>
        <div className="principle-grid">
          {summary.marketBenchmarks.map((benchmark) => (
            <article key={benchmark.competitor}>
              <span>{benchmark.segment}</span>
              <h3>{benchmark.competitor}</h3>
              <p>{benchmark.publicPricingSignal}</p>
              <ul className="compact-list">
                <li>{benchmark.scrimedPricingImplication}</li>
                <li>{benchmark.sourceUrl}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band" aria-label="Next actions and hard stops">
        <div className="section-heading">
          <p className="eyebrow">Operator routine</p>
          <h2>Demo calls now have a short operating routine and clear hard stops.</h2>
        </div>
        <div className="principle-grid">
          <article>
            <span>next actions</span>
            <h3>Run before every buyer call</h3>
            <ul className="compact-list">
              {summary.nextActions.map((action) => <li key={action}>{action}</li>)}
            </ul>
          </article>
          <article>
            <span>hard stops</span>
            <h3>Protect price, safety, and trust</h3>
            <ul className="compact-list">
              {summary.hardStops.map((stop) => <li key={stop}>{stop}</li>)}
            </ul>
          </article>
          <article>
            <span>source routes</span>
            <h3>Keep the path one click deep</h3>
            <ul className="compact-list">
              {summary.sourceRoutes.map((route) => <li key={route}>{route}</li>)}
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
