import Link from "next/link";
import { buyerPilotRoomBoundary, buyerPilotRoomCompetitiveEdges } from "../lib/buyerPilotRoom";
import { getCommercialStrategySummary } from "../lib/commercialStrategy";
import { getCompetitiveMarketIntelligenceSummary } from "../lib/competitiveMarketIntelligence";

export default function CompetitiveEdgePage() {
  const commercial = getCommercialStrategySummary();
  const marketIntelligence = getCompetitiveMarketIntelligenceSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">SCRIMED Competitive Edge</p>
        <h1>SCRIMED is healthcare intelligence infrastructure for governed enterprise transformation.</h1>
        <p className="hero-text">
          SCRIMED combines specialized agents, TrustOS governance, interoperability standards, protected buyer proof,
          competitor-informed product strategy, premium enterprise sales discipline, and FaithCore optionality while
          keeping clinical execution review-gated.
        </p>
        <div className="form-actions">
          <Link className="primary-action" href="/pilot?offer=synthetic-pilot-evaluation">
            Request Pilot
          </Link>
          <Link className="secondary-action" href="/pilot-workspace/access">
            Open Buyer Pilot Room
          </Link>
          <Link className="secondary-action" href="/pricing">
            Review Pricing
          </Link>
          <Link className="secondary-action" href="/competitive-intelligence">
            Market Intelligence
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Competitive edge summary">
        <article>
          <span>Position</span>
          <strong>Infrastructure</strong>
        </article>
        <article>
          <span>Edges</span>
          <strong>{buyerPilotRoomCompetitiveEdges.length}</strong>
        </article>
        <article>
          <span>Market sources</span>
          <strong>{marketIntelligence.sourceCount}</strong>
        </article>
        <article>
          <span>Build patterns</span>
          <strong>{marketIntelligence.patternCount}</strong>
        </article>
        <article>
          <span>Audience plays</span>
          <strong>{marketIntelligence.targetAudienceStrategyCount}</strong>
        </article>
        <article>
          <span>Proof metrics</span>
          <strong>{marketIntelligence.proofMetricCount}</strong>
        </article>
        <article>
          <span>Pricing model</span>
          <strong>Enterprise</strong>
        </article>
        <article>
          <span>Boundary</span>
          <strong>Synthetic pilot</strong>
        </article>
      </section>

      <section className="table-section" aria-label="Competitor-informed product strategy">
        <div className="section-heading">
          <p className="eyebrow">Market intelligence</p>
          <h2>Competitor signals are translated into original SCRIMED product moves and no-copy boundaries.</h2>
          <p className="section-copy">{marketIntelligence.boundary}</p>
        </div>
        {marketIntelligence.patterns.slice(0, 3).map((pattern) => (
          <article className="module-row" key={pattern.slug}>
            <div>
              <span>{pattern.priority}</span>
              <h2>{pattern.title}</h2>
            </div>
            <p>{pattern.productTranslation}</p>
            <div>
              <Link className="module-link" href="/competitive-intelligence">
                Inspect market intelligence
              </Link>
              <ul className="compact-list">
                <li>Sources: {pattern.sourceNames.join(", ")}</li>
                <li>Proof: {pattern.proofMetrics.slice(0, 3).join(", ")}</li>
                <li>Blocked: {pattern.blockedClaims.slice(0, 3).join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Target audience conversion plays">
        <div className="section-heading">
          <p className="eyebrow">Target buyers</p>
          <h2>SCRIMED turns market pressure into buyer-specific proof paths and sales messages.</h2>
        </div>
        {marketIntelligence.targetAudienceStrategies.slice(0, 4).map((strategy) => (
          <article className="module-row" key={strategy.slug}>
            <div>
              <span>{strategy.priority}</span>
              <h2>{strategy.targetAudience}</h2>
            </div>
            <p>{strategy.salesMessage}</p>
            <div>
              <Link className="module-link" href="/competitive-intelligence">
                Inspect audience strategy
              </Link>
              <ul className="compact-list">
                <li>Pressure: {strategy.competitorPressure.join(", ")}</li>
                <li>Offer: {strategy.offerMotion}</li>
                <li>Trigger: {strategy.conversionTrigger}</li>
                <li>Blocked: {strategy.blockedClaims.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Competitive edge proof">
        <div className="section-heading">
          <p className="eyebrow">Proof pillars</p>
          <h2>Each public claim is paired with product proof and an explicit blocked claim.</h2>
          <p className="section-copy">{buyerPilotRoomBoundary}</p>
        </div>
        {buyerPilotRoomCompetitiveEdges.map((edge) => (
          <article className="module-row" key={edge.pillar}>
            <div>
              <span>competitive pillar</span>
              <h2>{edge.pillar}</h2>
            </div>
            <p>{edge.claim}</p>
            <div>
              <Link className="module-link" href={edge.route}>
                Inspect proof route
              </Link>
              <ul className="compact-list">
                <li>{edge.proof}</li>
                <li>{edge.blockedClaim}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Premium enterprise motion">
        <div className="section-heading">
          <p className="eyebrow">Premium enterprise motion</p>
          <h2>Pricing should signal operating-system value, not commodity software.</h2>
          <p className="section-copy">{commercial.boundary}</p>
        </div>
        {commercial.pricingTiers.slice(1, 5).map((tier) => (
          <article className="module-row" key={tier.name}>
            <div>
              <span>{tier.status}</span>
              <h2>{tier.name}</h2>
            </div>
            <p>{tier.buyer}</p>
            <div>
              <strong>{tier.recommendedDisplayPrice}</strong>
              <Link className="module-link" href={tier.primaryAction.href}>
                {tier.primaryAction.label}
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
