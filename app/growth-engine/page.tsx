import Link from "next/link";
import { getGrowthEngineSummary } from "../lib/growthEngine";

export const metadata = {
  title: "SCRIMED Commercial Growth Engine",
  description:
    "SCRIMED commercial growth engine for buyer segments, sellable offers, revenue motions, conversion lanes, proof routes, bottlenecks, and retained approval gates."
};

export default function GrowthEnginePage() {
  const summary = getGrowthEngineSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/hub">Hub</Link>
        <p className="eyebrow">Commercial Growth Engine</p>
        <h1>SCRIMED turns proof depth into a focused buyer, revenue, and funding execution lane.</h1>
        <p className="hero-text">
          This engine prioritizes growth plays, conversion lanes, revenue proof steps, bottlenecks, owners, and proof routes while preserving no-revenue-guarantee, no-securities, no-PHI, and no-live-care boundaries.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Growth Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/capital-vitality">Capital Vitality</Link>
          <Link className="secondary-action" href="/pilot-deal-room">Deal Room</Link>
          <Link className="secondary-action" href="/pricing">Pricing</Link>
          <Link className="secondary-action" href="/pilot">Pilot Intake</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Commercial growth summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Growth plays</span>
          <strong>{summary.growthPlayCount}</strong>
        </article>
        <article>
          <span>Execute now</span>
          <strong>{summary.executeNowPlayCount}</strong>
        </article>
        <article>
          <span>Package next</span>
          <strong>{summary.packageNextPlayCount}</strong>
        </article>
        <article>
          <span>Conversion lanes</span>
          <strong>{summary.conversionLaneCount}</strong>
        </article>
        <article>
          <span>Proof ladder</span>
          <strong>{summary.proofLadderStepCount}</strong>
        </article>
        <article>
          <span>Proof routes</span>
          <strong>{summary.proofRouteCount}</strong>
        </article>
        <article>
          <span>Bottlenecks</span>
          <strong>{summary.growthBottleneckCount}</strong>
        </article>
        <article>
          <span>Pricing tiers</span>
          <strong>{summary.sourceCounts.pricingTierCount}</strong>
        </article>
        <article>
          <span>Market streams</span>
          <strong>{summary.sourceCounts.revenueStreamCount}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>Growth execution stays useful because it refuses to overclaim.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>01</span>
            <strong>{summary.authority.revenueAuthority}</strong>
          </div>
          <div className="layer-row">
            <span>02</span>
            <strong>{summary.authority.securitiesAuthority}</strong>
          </div>
          <div className="layer-row">
            <span>03</span>
            <strong>{summary.authority.phiAuthority}</strong>
          </div>
          <div className="layer-row">
            <span>04</span>
            <strong>{summary.authority.clinicalCareAuthority}</strong>
          </div>
        </div>
      </section>

      <section className="table-section" aria-label="Growth plays">
        <div className="section-heading">
          <p className="eyebrow">Priority plays</p>
          <h2>Sell what can move now, package what compounds, and gate what requires approval.</h2>
          <p className="section-copy">{summary.nextGrowthMove}</p>
        </div>
        {summary.growthPlays.map((play) => (
          <article className="module-row" key={play.name}>
            <div>
              <span>{play.status}</span>
              <h2>{play.name}</h2>
            </div>
            <p>{play.revenueMotion}</p>
            <div>
              <strong>{play.primaryOffer}</strong>
              <ul className="compact-list">
                <li>{play.buyerSegment}</li>
                <li>{play.commercialEvidence}</li>
                <li>Owner: {play.owner}</li>
                <li>Boundary: {play.blockedBoundary}</li>
                <li>Next: {play.nextAction}</li>
                <li>Proof routes: {play.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Conversion lanes">
        <div className="section-heading">
          <p className="eyebrow">Conversion lanes</p>
          <h2>Every buyer path needs a source, trigger, proof route, conversion event, and disqualifier.</h2>
        </div>
        {summary.conversionLanes.map((lane) => (
          <article className="module-row" key={lane.source}>
            <div>
              <span>{lane.entryRoute}</span>
              <h2>{lane.source}</h2>
            </div>
            <p>{lane.buyerTrigger}</p>
            <div>
              <strong>{lane.conversionEvent}</strong>
              <ul className="compact-list">
                <li>Proof: {lane.proofRoute}</li>
                <li>{lane.followUp}</li>
                <li>Disqualifiers: {lane.disqualifiers.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Revenue proof ladder">
        <div className="section-heading">
          <p className="eyebrow">Revenue proof ladder</p>
          <h2>Revenue confidence rises only when the next proof step has the right gate.</h2>
        </div>
        {summary.revenueProofLadder.map((step) => (
          <article className="module-row" key={step.stage}>
            <div>
              <span>{step.status}</span>
              <h2>{step.stage}</h2>
            </div>
            <p>{step.commercialQuestion}</p>
            <div>
              <strong>{step.answer}</strong>
              <ul className="compact-list">
                <li>Metric: {step.metric}</li>
                <li>Gate: {step.retainedGate}</li>
                <li>Proof routes: {step.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Growth bottlenecks">
        <div className="section-heading">
          <p className="eyebrow">Bottlenecks</p>
          <h2>Growth limits are contained by owner, workaround, and graduation gate.</h2>
        </div>
        {summary.growthBottlenecks.map((bottleneck) => (
          <article className="module-row" key={bottleneck.name}>
            <div>
              <span>{bottleneck.status}</span>
              <h2>{bottleneck.name}</h2>
            </div>
            <p>{bottleneck.impact}</p>
            <div>
              <strong>{bottleneck.owner}</strong>
              <ul className="compact-list">
                <li>Workaround: {bottleneck.workaround}</li>
                <li>Graduation gate: {bottleneck.graduationGate}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
