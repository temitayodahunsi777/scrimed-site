import Link from "next/link";
import { getPublicMarketReadinessSummary } from "../lib/publicMarketReadiness";

export const metadata = {
  title: "SCRIMED Public Market Readiness",
  description:
    "SCRIMED capital efficiency, KPI stack, unit economics, compliance logs, customer proof, and investor narrative for healthcare intelligence infrastructure."
};

export default function PublicMarketReadinessPage() {
  const summary = getPublicMarketReadinessSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">Public market readiness</p>
        <h1>Build SCRIMED with public-company discipline before the market demands it.</h1>
        <p className="hero-text">
          SCRIMED tracks capital efficiency, unit economics, compliance logs, customer proof, margin discipline,
          governance documentation, and model-cost controls as operating infrastructure, not late-stage cleanup.
        </p>
        <div className="form-actions">
          <Link className="primary-action" href="/api/public-market-readiness/brief">
            Download Board Brief
          </Link>
          <Link className="secondary-action" href="/pricing">
            Review Pricing
          </Link>
          <Link className="secondary-action" href="/competitive-edge">
            Competitive Edge
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Public market readiness summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>KPI stack</span>
          <strong>{summary.metricCount}</strong>
        </article>
        <article>
          <span>Unit economics</span>
          <strong>{summary.unitEconomicsPackageCount}</strong>
        </article>
        <article>
          <span>Boundary</span>
          <strong>No audited financials</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Investor narrative</p>
          <h2>{summary.thesis}</h2>
          <p className="section-copy">{summary.investorNarrative}</p>
        </div>
        <div className="layer-list">
          {summary.customerProofStages.map((stage, index) => (
            <article className="layer-row" key={stage.stage}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{stage.stage}: {stage.revenueSignal}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band split-band" aria-label="Protected board packet path">
        <div>
          <p className="eyebrow">Protected board packets</p>
          <h2>Internal rollups convert no-PHI operating captures into audited board packet downloads.</h2>
          <p className="section-copy">
            Protected metric rollups are available inside the AAL2 pilot workspace. They are designed for internal
            operating review and advisor diligence, not audited financial reporting, securities offering material, or
            valuation assurance.
          </p>
        </div>
        <div className="layer-list">
          <article className="layer-row">
            <span>01</span>
            <strong>{summary.protectedMetricRollupStatus}</strong>
          </article>
          <article className="layer-row">
            <span>02</span>
            <strong>{summary.protectedMetricRollupPacketStatus}</strong>
          </article>
          <article className="layer-row">
            <span>03</span>
            <strong>{summary.protectedMetricRollupApiRoute}</strong>
          </article>
        </div>
      </section>

      <section className="table-section" aria-label="Internal KPI stack">
        <div className="section-heading">
          <p className="eyebrow">Internal KPI stack</p>
          <h2>Measure workflow economics, not vanity AI usage.</h2>
          <p className="section-copy">
            These are operating definitions for synthetic evaluations and protected pilots. Finance-reviewed systems
            are required before external financial reporting.
          </p>
        </div>
        {summary.operatingMetrics.map((metric) => (
          <article className="module-row" key={metric.id}>
            <div>
              <span>{metric.category}</span>
              <h2>{metric.name}</h2>
            </div>
            <p>{metric.formula}</p>
            <div>
              <strong>{metric.unit}</strong>
              <ul className="compact-list">
                <li>Maturity: {metric.currentMaturity}</li>
                <li>{metric.auditSource}</li>
                <li>{metric.boundary}</li>
              </ul>
              <Link className="module-link" href={metric.proofRoute}>
                Inspect proof route
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Unit economics packages">
        <div className="section-heading">
          <p className="eyebrow">Unit economics</p>
          <h2>Keep margin discipline visible from assessment through enterprise license.</h2>
        </div>
        {summary.unitEconomicsPackages.map((offer) => (
          <article className="module-row" key={offer.packageName}>
            <div>
              <span>{offer.commercialStage}</span>
              <h2>{offer.packageName}</h2>
            </div>
            <p>{offer.marginDiscipline}</p>
            <div>
              <strong>{offer.priceSignal}</strong>
              <ul className="compact-list">
                {offer.costDrivers.map((driver) => (
                  <li key={driver}>{driver}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Efficient healthcare intelligence">
        <div className="section-heading">
          <p className="eyebrow">Efficient healthcare intelligence</p>
          <h2>SCRIMED is not dependent on one frontier model to create value.</h2>
          <p className="section-copy">{summary.efficientHealthcareIntelligence}</p>
        </div>
        <div className="principle-grid">
          {summary.modelEfficiencyControls.map((control) => (
            <article key={control.control}>
              <span>control</span>
              <h3>{control.control}</h3>
              <p>{control.operatingPolicy}</p>
              <ul className="compact-list">
                <li>{control.costControl}</li>
                <li>{control.safetyControl}</li>
              </ul>
              <Link className="module-link" href={control.proofRoute}>
                Inspect route
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band" aria-label="Compliance logs and board cadence">
        <div className="section-heading">
          <p className="eyebrow">Governance discipline</p>
          <h2>Compliance logs, customer proof, and board cadence are part of the product operating system.</h2>
        </div>
        <div className="principle-grid">
          {summary.complianceLogs.map((log) => (
            <article key={log.log}>
              <span>{log.owner}</span>
              <h3>{log.log}</h3>
              <p>{log.currentSource}</p>
              <ul className="compact-list">
                <li>{log.metricUse}</li>
                <li>{log.boundary}</li>
              </ul>
              <Link className="module-link" href={log.proofRoute}>
                Inspect proof
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Known boundaries and workarounds">
        <div className="section-heading">
          <p className="eyebrow">Boundaries and workarounds</p>
          <h2>Public-company discipline includes refusing unsupported claims.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        {summary.limitations.map((limitation) => (
          <article className="module-row" key={limitation.limitation}>
            <div>
              <span>known boundary</span>
              <h2>{limitation.limitation}</h2>
            </div>
            <p>{limitation.impact}</p>
            <div>
              <strong>{limitation.workaround}</strong>
              <ul className="compact-list">
                <li>Graduation gate: {limitation.graduationGate}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
