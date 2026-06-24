import Link from "next/link";
import { getCapitalVitalitySummary } from "../lib/capitalVitality";

export const metadata = {
  title: "SCRIMED Capital Vitality",
  description:
    "SCRIMED capital vitality map for revenue capabilities, competitive moat evidence, investor readiness, funding workstreams, and retained external-review gates."
};

export default function CapitalVitalityPage() {
  const summary = getCapitalVitalitySummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/hub">Hub</Link>
        <p className="eyebrow">Capital Vitality</p>
        <h1>SCRIMED turns revenue, moat, and funding readiness into one governed growth lane.</h1>
        <p className="hero-text">
          This lane packages sellable revenue capabilities, competitive proof, investor diligence milestones, and funding workstreams while keeping securities, valuation, legal, reimbursement, PHI, security, and live-care boundaries explicit.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>Download Capital Brief</a>
          <a className="secondary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/product">Product Console</Link>
          <Link className="secondary-action" href="/pricing">Pricing</Link>
          <Link className="secondary-action" href="/public-market-readiness">Public Market Readiness</Link>
          <Link className="secondary-action" href="/pilot-deal-room">Deal Room</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Capital vitality summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Revenue capabilities</span>
          <strong>{summary.revenueCapabilityCount}</strong>
        </article>
        <article>
          <span>Packaged</span>
          <strong>{summary.packagedRevenueCapabilityCount}</strong>
        </article>
        <article>
          <span>Protected gated</span>
          <strong>{summary.protectedGatedRevenueCapabilityCount}</strong>
        </article>
        <article>
          <span>Moat signals</span>
          <strong>{summary.moatSignalCount}</strong>
        </article>
        <article>
          <span>High moat</span>
          <strong>{summary.highMoatSignalCount}</strong>
        </article>
        <article>
          <span>Investor milestones</span>
          <strong>{summary.investorMilestoneCount}</strong>
        </article>
        <article>
          <span>Funding workstreams</span>
          <strong>{summary.fundingWorkstreamCount}</strong>
        </article>
        <article>
          <span>External review gates</span>
          <strong>{summary.retainedExternalReviewCount}</strong>
        </article>
        <article>
          <span>Proof routes</span>
          <strong>{summary.proofRouteCount}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>Growth readiness is not a funding solicitation, valuation claim, or approval claim.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>01</span>
            <strong>{summary.fundingVitalityPosture}</strong>
          </div>
          <div className="layer-row">
            <span>02</span>
            <strong>{summary.authority.securitiesAuthority}</strong>
          </div>
          <div className="layer-row">
            <span>03</span>
            <strong>{summary.authority.investmentAdvice}</strong>
          </div>
          <div className="layer-row">
            <span>04</span>
            <strong>{summary.authority.valuationAuthority}</strong>
          </div>
        </div>
      </section>

      <section className="table-section" aria-label="Revenue capabilities">
        <div className="section-heading">
          <p className="eyebrow">Revenue capability</p>
          <h2>Sellable paths are packaged around synthetic, governed, and review-only value before production authority.</h2>
        </div>
        {summary.revenueCapabilities.map((capability) => (
          <article className="module-row" key={capability.name}>
            <div>
              <span>{capability.status}</span>
              <h2>{capability.name}</h2>
            </div>
            <p>{capability.revenueMotion}</p>
            <div>
              <strong>{capability.buyer}</strong>
              <ul className="compact-list">
                <li>{capability.priceLogic}</li>
                <li>{capability.limitation}</li>
                <li>Next: {capability.nextAction}</li>
                <li>Proof routes: {capability.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Competitive moat signals">
        <div className="section-heading">
          <p className="eyebrow">Competitive edge</p>
          <h2>The moat is proof-backed workflow infrastructure, not broad market language.</h2>
        </div>
        {summary.competitiveMoatSignals.map((signal) => (
          <article className="module-row" key={signal.name}>
            <div>
              <span>{signal.strength}</span>
              <h2>{signal.name}</h2>
            </div>
            <p>{signal.evidence}</p>
            <div>
              <strong>{signal.defendability}</strong>
              <ul className="compact-list">
                <li>{signal.retainedBoundary}</li>
                <li>Proof routes: {signal.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Investor readiness milestones">
        <div className="section-heading">
          <p className="eyebrow">Investor readiness</p>
          <h2>Funding vitality improves when every investor question points to current proof and retained limits.</h2>
        </div>
        {summary.investorReadinessMilestones.map((milestone) => (
          <article className="module-row" key={milestone.name}>
            <div>
              <span>{milestone.status}</span>
              <h2>{milestone.name}</h2>
            </div>
            <p>{milestone.investorQuestion}</p>
            <div>
              <strong>{milestone.evidence}</strong>
              <ul className="compact-list">
                <li>{milestone.fundingImpact}</li>
                <li>{milestone.retainedBoundary}</li>
                <li>Proof routes: {milestone.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Funding vitality workstreams">
        <div className="section-heading">
          <p className="eyebrow">Funding workstreams</p>
          <h2>Capital readiness is operationalized as owned work, proof routes, and explicit review gates.</h2>
          <p className="section-copy">{summary.nextCapitalMove}</p>
        </div>
        {summary.fundingVitalityWorkstreams.map((workstream) => (
          <article className="module-row" key={workstream.name}>
            <div>
              <span>{workstream.status}</span>
              <h2>{workstream.name}</h2>
            </div>
            <p>{workstream.capability}</p>
            <div>
              <strong>{workstream.owner}</strong>
              <ul className="compact-list">
                <li>Proof: {workstream.proof}</li>
                <li>{workstream.limitation}</li>
                <li>Next: {workstream.nextAction}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
