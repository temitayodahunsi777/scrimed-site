import Link from "next/link";
import { getCommercialStrategySummary } from "../lib/commercialStrategy";
import { getPilotDemoCommercialReadinessSummary } from "../lib/pilotDemoCommercialReadiness";

export const metadata = {
  title: "SCRIMED Pricing | Healthcare AI Pilots",
  description:
    "Review SCRIMED pricing for healthcare AI assessments, synthetic pilots, protected enterprise pilots, annual operating licenses, and strategic partnerships."
};

export default function PricingPage() {
  const summary = getCommercialStrategySummary();
  const pilotDemoReadiness = getPilotDemoCommercialReadinessSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">Pricing built for enterprise healthcare decisions</p>
        <h1>Start free, pilot with proof, then expand only when the value is clear.</h1>
        <p className="hero-text">
          SCRIMED is priced to be easy to evaluate and serious to buy: free public demos, paid workflow
          assessments, synthetic pilots, protected enterprise pilots, annual operating licenses, and strategic
          partnerships for organizations ready to scale.
        </p>
        <div className="hero-actions" aria-label="Pricing actions">
          <Link className="primary-action" href="/pilot-demo-commercial-readiness">
            Find My Price Band
          </Link>
          <Link className="secondary-action" href="/demos">
            Watch Demos
          </Link>
          <Link className="secondary-action" href="/pilots">
            Compare Pilots
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED pricing summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>App domain</span>
          <strong>{summary.recommendedAppDomain}</strong>
        </article>
        <article>
          <span>Tiers</span>
          <strong>{summary.pricingTiers.length}</strong>
        </article>
        <article>
          <span>API</span>
          <strong>{summary.apiRoute}</strong>
        </article>
        <article>
          <span>Benchmarks</span>
          <strong>{pilotDemoReadiness.marketBenchmarkCount}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Recommended model</p>
          <h2>{summary.recommendedModel}</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.productAccessRoutes.map((route, index) => (
            <Link className="layer-row" href={route.route} key={route.surface}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{route.surface}: {route.buyerIntent}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-band" aria-label="Premium pricing posture">
        <div className="section-heading">
          <p className="eyebrow">Premium pricing posture</p>
          <h2>Price SCRIMED like trusted healthcare intelligence infrastructure.</h2>
        </div>
        <div className="principle-grid">
          {summary.premiumPricingPrinciples.map((principle) => (
            <article key={principle.principle}>
              <span>principle</span>
              <h3>{principle.principle}</h3>
              <p>{principle.policy}</p>
              <ul className="compact-list">
                <li>{principle.rationale}</li>
                <li>{principle.guardrail}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="SCRIMED pricing tiers">
        <div className="section-heading">
          <p className="eyebrow">Pricing tiers</p>
          <h2>Pick the buying motion that matches your readiness, urgency, and governance burden.</h2>
        </div>
        {summary.pricingTiers.map((tier) => (
          <article className="module-row" key={tier.name}>
            <div>
              <span>{tier.status}</span>
              <h2>{tier.name}</h2>
            </div>
            <p>{tier.buyer}</p>
            <div>
              <strong>{tier.recommendedDisplayPrice}</strong>
              <ul className="compact-list">
                <li>{tier.successMetric}</li>
                <li>Expansion: {tier.expansionPath}</li>
                <li>{tier.boundary}</li>
              </ul>
              <Link className="module-link" href={tier.primaryAction.href}>{tier.primaryAction.label}</Link>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Pricing alignment decisions">
        <div className="section-heading">
          <p className="eyebrow">Market alignment</p>
          <h2>Use competitor prices as context, then defend SCRIMED&apos;s premium through enterprise proof and governance.</h2>
          <p className="section-copy">{pilotDemoReadiness.currentPricingDecision}</p>
        </div>
        {summary.pricingAlignmentDecisions.map((decision) => (
          <article className="module-row" key={decision.lane}>
            <div>
              <span>decision</span>
              <h2>{decision.lane}</h2>
            </div>
            <p>{decision.decision}</p>
            <div>
              <strong>{decision.rationale}</strong>
              <ul className="compact-list">
                <li>{decision.marginProtection}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Market pricing benchmarks">
        <div className="section-heading">
          <p className="eyebrow">Current market context</p>
          <h2>SCRIMED is not priced as a commodity monthly scribe seat.</h2>
        </div>
        <div className="principle-grid">
          {summary.marketPricingBenchmarks.map((benchmark) => (
            <article key={benchmark.segment}>
              <span>{benchmark.segment}</span>
              <h3>{benchmark.publicSignal}</h3>
              <p>{benchmark.scrimedImplication}</p>
              <ul className="compact-list">
                <li>{benchmark.source}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band" aria-label="SCRIMED sales motion">
        <div className="section-heading">
          <p className="eyebrow">Sales motion</p>
          <h2>Move from website interest to a funded pilot without custom-scope confusion.</h2>
        </div>
        <div className="principle-grid">
          {summary.salesMotion.map((step) => (
            <article key={step.name}>
              <span>{step.phase}</span>
              <h3>{step.name}</h3>
              <p>{step.buyerAction}</p>
              <ul className="compact-list">
                <li>{step.scrimedAction}</li>
                <li>{step.qualificationGate}</li>
                <li>{step.nextCommitment}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Value metrics">
        <div className="section-heading">
          <p className="eyebrow">Value metrics</p>
          <h2>Price against workflow value, governance scope, and deployment complexity.</h2>
        </div>
        {summary.valueMetrics.map((metric) => (
          <article className="module-row" key={metric.metric}>
            <div>
              <span>metric</span>
              <h2>{metric.metric}</h2>
            </div>
            <p>{metric.whyItMatters}</p>
            <div>
              <strong>{metric.pricingUse}</strong>
              <ul className="compact-list">
                <li>{metric.guardrail}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Commercial guardrails">
        <div className="section-heading">
          <p className="eyebrow">Commercial guardrails</p>
          <h2>Sales should increase trust, not create clinical or regulatory overclaim risk.</h2>
        </div>
        <div className="principle-grid">
          {summary.commercialGuardrails.map((guardrail) => (
            <article key={guardrail.guardrail}>
              <span>guardrail</span>
              <h3>{guardrail.guardrail}</h3>
              <p>{guardrail.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
