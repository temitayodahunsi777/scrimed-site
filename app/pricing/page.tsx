import Link from "next/link";
import {
  getCommercialStrategySummary,
  type CommercialEngagementGoal
} from "../lib/commercialStrategy";
import { getPilotDemoCommercialReadinessSummary } from "../lib/pilotDemoCommercialReadiness";
import PricingScopeGuard from "./PricingScopeGuard";
import PricingValuePlanner from "./PricingValuePlanner";

export const metadata = {
  title: "SCRIMED Pricing | Governed Healthcare AI Evaluations",
  description:
    "Explore SCRIMED's non-binding assessment starting point and human-scoped synthetic and protected enterprise evaluation pathways.",
  alternates: {
    canonical: "https://app.scrimedsolutions.com/pricing"
  }
};

export default function PricingPage() {
  const summary = getCommercialStrategySummary();
  const pilotDemoReadiness = getPilotDemoCommercialReadinessSummary();
  const plannerGoals: ReadonlyArray<{ goal: CommercialEngagementGoal; tierName: string }> = [
    { goal: "assessment", tierName: "Workflow Intelligence Assessment" },
    { goal: "synthetic-pilot", tierName: "Synthetic Pilot Evaluation" },
    { goal: "protected-pilot", tierName: "Protected Enterprise Pilot" }
  ];
  const plannerTiers = plannerGoals.flatMap(({ goal, tierName }) => {
    const tier = summary.pricingTiers.find((candidate) => candidate.name === tierName);

    return tier
      ? [
          {
            goal,
            label: tier.name,
            priceRange: tier.priceRange
          }
        ]
      : [];
  });

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">Pre-commercial pricing built around verified workflow value</p>
        <h1>Start with inspectable proof. Expand only when the value and governance case hold.</h1>
        <p className="hero-text">
          SCRIMED uses free public proof, paid no-PHI assessments, synthetic pilots, and externally reviewed
          enterprise planning. Every price or scope is non-binding until a named human owner approves evidence,
          terms, and retained safety gates.
        </p>
        <div className="hero-actions" aria-label="Pricing actions">
          <Link className="primary-action" href="#scope-guard">
            Qualify Scope
          </Link>
          <Link className="secondary-action" href="#value-planner">
            Model a Value Case
          </Link>
          <Link className="secondary-action" href="/pilots">
            Compare Pilots
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED pricing summary">
        <article>
          <span>Status</span>
          <strong>Pre-commercial</strong>
        </article>
        <article>
          <span>Pricing authority</span>
          <strong>Non-binding</strong>
        </article>
        <article>
          <span>Tiers</span>
          <strong>{summary.pricingTiers.length}</strong>
        </article>
        <article>
          <span>Market evidence</span>
          <strong>
            {summary.marketEvidenceReview.currentCount}/{summary.sourceCounts.marketBenchmarkCount} current
          </strong>
        </article>
        <article>
          <span>Safety posture</span>
          <strong>Fail closed</strong>
        </article>
      </section>

      <section className="section-band" id="scope-guard">
        <PricingScopeGuard tiers={plannerTiers} />
      </section>

      <section className="section-band" id="value-planner">
        <PricingValuePlanner tiers={plannerTiers} />
      </section>

      <section className="section-band" aria-label="Commercial readiness controls">
        <div className="section-heading">
          <p className="eyebrow">Commercial control plane</p>
          <h2>Value, trust, and global fit are separate decisions with explicit evidence.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="principle-grid">
          {summary.commercialReadinessControls.map((control) => (
            <article key={control.dimension}>
              <span>{control.status}</span>
              <h3>{control.dimension.replaceAll("-", " ")}</h3>
              <p>{control.currentEvidence}</p>
              <ul className="compact-list">
                <li>{control.decisionRule}</li>
              </ul>
              <Link className="module-link" href={control.proofRoute}>
                Inspect evidence route
              </Link>
            </article>
          ))}
        </div>
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
                <li>Authority: {tier.pricingAuthority}</li>
                <li>Proposal gate: {tier.proposalGate}</li>
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
          <p className="section-copy">
            Evidence status: {summary.marketEvidenceReview.status.replaceAll("-", " ")}. Next review due {summary.marketEvidenceReview.nextReviewDue}. {summary.marketEvidenceReview.decisionRule}
          </p>
        </div>
        <div className="principle-grid">
          {summary.marketPricingBenchmarks.map((benchmark) => (
            <article key={benchmark.segment}>
              <span>
                {benchmark.freshness} · verified {benchmark.lastVerified} · review by {benchmark.reviewDue}
              </span>
              <h3>{benchmark.publicSignal}</h3>
              <p>{benchmark.scrimedImplication}</p>
              <ul className="compact-list">
                <li>{benchmark.comparisonBoundary}</li>
              </ul>
              <a className="module-link" href={benchmark.sourceUrl} rel="noreferrer" target="_blank">
                {benchmark.sourceName}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Competitive positioning pillars">
        <div className="section-heading">
          <p className="eyebrow">Competitive position</p>
          <h2>Differentiate through inspectable controls, not unverified superlatives.</h2>
        </div>
        {summary.competitivePositioningPillars.map((pillar) => (
          <article className="module-row" key={pillar.pillar}>
            <div>
              <span>owned position</span>
              <h2>{pillar.pillar}</h2>
            </div>
            <p>{pillar.buyerValue}</p>
            <div>
              <Link className="module-link" href={pillar.proofRoute}>
                Inspect proof
              </Link>
              <ul className="compact-list">
                <li>{pillar.inspectableProof}</li>
                <li>{pillar.blockedClaim}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Global commercial profiles">
        <div className="section-heading">
          <p className="eyebrow">Global positioning</p>
          <h2>One platform thesis, localized authority and procurement paths.</h2>
        </div>
        {summary.globalCommercialProfiles.map((profile) => (
          <article className="module-row" key={profile.regionProfile}>
            <div>
              <span>regional profile</span>
              <h2>{profile.regionProfile}</h2>
            </div>
            <p>{profile.entryMotion}</p>
            <div>
              <strong>{profile.pricingPolicy}</strong>
              <ul className="compact-list">
                <li>Buyer fit: {profile.buyerFit}</li>
                <li>Localization: {profile.requiredLocalization.join("; ")}</li>
                <li>Retained gates: {profile.retainedGates.join("; ")}</li>
              </ul>
              <Link className="module-link" href={profile.proofRoute}>
                Inspect regional proof
              </Link>
            </div>
          </article>
        ))}
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
