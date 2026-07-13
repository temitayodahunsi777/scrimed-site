import Link from "next/link";
import { getCompetitiveMarketIntelligenceSummary } from "../lib/competitiveMarketIntelligence";

export const metadata = {
  title: "SCRIMED Competitive Market Intelligence",
  description:
    "Competitor-informed build intelligence for SCRIMED healthcare AI infrastructure, agents, APIs, payer workflows, trust posture, and buyer proof."
};

export default function CompetitiveIntelligencePage() {
  const summary = getCompetitiveMarketIntelligenceSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/competitive-edge">
          Competitive Edge
        </Link>
        <p className="eyebrow">Competitive Market Intelligence</p>
        <h1>SCRIMED converts public competitor signals into original product, proof, and governance build paths.</h1>
        <p className="hero-text">
          This surface translates public market patterns across ambient AI, agent workforces, healthcare data platforms,
          revenue cycle, payer operations, API posture, security expectations, and enterprise sales proof into SCRIMED
          build initiatives with explicit no-copy boundaries.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.apiRoute}>
            Inspect API
          </a>
          <Link className="secondary-action" href="/competitive-defense">
            Review Defense
          </Link>
          <Link className="secondary-action" href="/strategic-intelligence">
            Strategic Intelligence
          </Link>
          <Link className="secondary-action" href="/pilot-deal-room">
            Deal Room
          </Link>
          <Link className="secondary-action" href="/interoperability">
            Connector Readiness
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Competitive market intelligence summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Sources</span>
          <strong>{summary.sourceCount}</strong>
        </article>
        <article>
          <span>Fresh signals</span>
          <strong>{summary.researchSignalCount}</strong>
        </article>
        <article>
          <span>Clean-room plays</span>
          <strong>{summary.cleanRoomPlayCount}</strong>
        </article>
        <article>
          <span>Categories</span>
          <strong>{summary.sourceCategoryCount}</strong>
        </article>
        <article>
          <span>Build patterns</span>
          <strong>{summary.patternCount}</strong>
        </article>
        <article>
          <span>Initiatives</span>
          <strong>{summary.initiativeCount}</strong>
        </article>
        <article>
          <span>Audience plays</span>
          <strong>{summary.targetAudienceStrategyCount}</strong>
        </article>
        <article>
          <span>Audience routes</span>
          <strong>{summary.targetAudienceProofRouteCount}</strong>
        </article>
        <article>
          <span>Proof metrics</span>
          <strong>{summary.proofMetricCount}</strong>
        </article>
        <article>
          <span>Governance gates</span>
          <strong>{summary.governanceGateCount}</strong>
        </article>
        <article>
          <span>Blocked claims</span>
          <strong>{summary.blockedClaimCount}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="Clean-room market response plays">
        <div className="section-heading">
          <p className="eyebrow">Clean-room market response</p>
          <h2>SCRIMED learns from public patterns, then builds original tools, proof paths, revenue motions, and trust controls.</h2>
        </div>
        {summary.cleanRoomPlays.map((play) => (
          <article className="module-row" key={play.slug}>
            <div>
              <span>{play.priority}</span>
              <h2>{play.slug}</h2>
            </div>
            <p>{play.marketPattern}</p>
            <div>
              <strong>{play.scrimedOriginalImplementation}</strong>
              <ul className="compact-list">
                <li>Public sources: {play.publicSources.join(", ")}</li>
                <li>Legal extraction rule: {play.legalExtractionRule}</li>
                <li>Do not copy: {play.prohibitedCopying.join(", ")}</li>
                <li>Systems: {play.productSystemsToUpgrade.join(", ")}</li>
                <li>Revenue motion: {play.revenueMotion}</li>
                <li>Sales pitch: {play.salesPitchUpgrade}</li>
                <li>Investor signal: {play.investorConfidenceSignal}</li>
                <li>Privacy and trust: {play.privacyAndTrustControl}</li>
                <li>Proof metric: {play.proofMetric}</li>
                <li>Next build: {play.nextBuildAction}</li>
                <li>Boundary: {play.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Fresh competitor research signals">
        <div className="section-heading">
          <p className="eyebrow">Fresh public research signals</p>
          <h2>Current competitor observations are timestamped, sourced, translated, and bounded before entering SCRIMED strategy.</h2>
        </div>
        {summary.researchSignals.map((signal) => (
          <article className="module-row" key={`${signal.sourceName}-${signal.category}`}>
            <div>
              <span>{signal.implementationStatus}</span>
              <h2>{signal.sourceName}</h2>
            </div>
            <p>{signal.currentPublicSignal}</p>
            <div>
              <a className="module-link" href={signal.sourceUrl}>
                Open public source
              </a>
              <ul className="compact-list">
                <li>Category: {signal.category}</li>
                <li>SCRIMED implication: {signal.scrimedImplication}</li>
                <li>Last reviewed: {signal.lastReviewed}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>{summary.nextBuildStep}</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.sourceCategories.map((category, index) => (
            <div className="layer-row" key={category}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{category}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Target audience strategy">
        <div className="section-heading">
          <p className="eyebrow">Target audience strategy</p>
          <h2>SCRIMED turns competitor pressure into buyer-specific conversion paths, proof routes, and safe sales messages.</h2>
        </div>
        {summary.targetAudienceStrategies.map((strategy) => (
          <article className="module-row" key={strategy.slug}>
            <div>
              <span>{strategy.priority}</span>
              <h2>{strategy.targetAudience}</h2>
            </div>
            <p>{strategy.primaryPain}</p>
            <div>
              <strong>{strategy.salesMessage}</strong>
              <ul className="compact-list">
                <li>Role: {strategy.buyerRole}</li>
                <li>Pressure: {strategy.competitorPressure.join(", ")}</li>
                <li>Counter-position: {strategy.scrimedCounterPosition}</li>
                <li>Offer motion: {strategy.offerMotion}</li>
                <li>Proof routes: {strategy.proofRoutes.join(", ")}</li>
                <li>Trigger: {strategy.conversionTrigger}</li>
                <li>Follow-through: {strategy.strategicFollowThrough}</li>
                <li>Boundary: {strategy.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Competitor-informed build patterns">
        <div className="section-heading">
          <p className="eyebrow">Build patterns</p>
          <h2>Public market signals become SCRIMED-specific product moves, sales language, and proof controls.</h2>
        </div>
        {summary.patterns.map((pattern) => (
          <article className="module-row" key={pattern.slug}>
            <div>
              <span>{pattern.priority}</span>
              <h2>{pattern.title}</h2>
            </div>
            <p>{pattern.marketSignal}</p>
            <div>
              <strong>{pattern.productTranslation}</strong>
              <ul className="compact-list">
                <li>Sources: {pattern.sourceNames.join(", ")}</li>
                <li>Surfaces: {pattern.productSurfaces.join(", ")}</li>
                <li>Agents: {pattern.agents.join(", ")}</li>
                <li>Pitch: {pattern.salesPitchUpgrade}</li>
                <li>Next: {pattern.nextImplementation}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Competitive initiatives">
        <div className="section-heading">
          <p className="eyebrow">Implementation queue</p>
          <h2>Competitor analysis is expressed as owned SCRIMED initiatives with product routes and next actions.</h2>
        </div>
        {summary.initiatives.map((initiative) => (
          <article className="module-row" key={initiative.name}>
            <div>
              <span>{initiative.status}</span>
              <h2>{initiative.name}</h2>
            </div>
            <p>{initiative.whyItImprovesScrimed}</p>
            <div>
              <Link className="module-link" href={initiative.proofRoute}>
                Inspect proof route
              </Link>
              <ul className="compact-list">
                <li>Owner: {initiative.owner}</li>
                <li>Buyer: {initiative.buyerSegment}</li>
                <li>Surface: {initiative.productSurface}</li>
                <li>Next: {initiative.nextAction}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Source review">
        <div className="section-heading">
          <p className="eyebrow">Source review</p>
          <h2>Each competitor signal is public, translated, and bounded before it becomes a SCRIMED build input.</h2>
        </div>
        {summary.sources.map((source) => (
          <article className="module-row" key={source.name}>
            <div>
              <span>{source.category}</span>
              <h2>{source.name}</h2>
            </div>
            <p>{source.observedPattern}</p>
            <div>
              <a className="module-link" href={source.url}>
                Open public source
              </a>
              <ul className="compact-list">
                <li>{source.scrimedTranslation}</li>
                <li>{source.noCopyBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Proof and guardrails">
        <div className="section-heading">
          <p className="eyebrow">Proof and controls</p>
          <h2>Market pressure becomes measurable product proof without unsafe clinical, revenue, API, or compliance claims.</h2>
        </div>
        <article className="module-row">
          <div>
            <span>proof</span>
            <h2>Metrics</h2>
          </div>
          <p>{summary.proofMetrics.join(", ")}</p>
          <div>
            <strong>Product surfaces</strong>
            <p>{summary.productSurfaces.join(", ")}</p>
          </div>
        </article>
        <article className="module-row">
          <div>
            <span>controls</span>
            <h2>Governance gates</h2>
          </div>
          <p>{summary.governanceGates.join(", ")}</p>
          <div>
            <strong>Blocked claims</strong>
            <p>{summary.blockedClaims.join(", ")}</p>
          </div>
        </article>
      </section>
    </main>
  );
}
