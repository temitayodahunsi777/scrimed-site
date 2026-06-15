import Link from "next/link";
import { getAttributionAnalyticsSummary } from "../lib/attributionAnalytics";

export const metadata = {
  title: "SCRIMED Attribution Analytics",
  description:
    "Source-to-pilot cohort analytics for SCRIMED buyer attribution, campaign routing, deployment profiles, proof packets, and sales outcomes."
};

export default function AttributionAnalyticsPage() {
  const report = getAttributionAnalyticsSummary();
  const primaryCohorts = report.cohorts.filter((cohort) =>
    ["sourceCategory", "buyerType", "offer", "deploymentProfile"].includes(cohort.dimension)
  );

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/sales-attribution">Sales Attribution</Link>
        <p className="eyebrow">Attribution Analytics</p>
        <h1>Track source-to-pilot cohorts from first signal to governed enterprise outcome.</h1>
        <p className="hero-text">{report.boundary}</p>
        <div className="hero-actions">
          <a className="primary-action" href={report.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/sales-operations">Sales Operations</Link>
          <Link className="secondary-action" href="/pilot">Buyer Intake</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Attribution analytics summary">
        <article>
          <span>Status</span>
          <strong>{report.status}</strong>
        </article>
        <article>
          <span>Mode</span>
          <strong>{report.mode}</strong>
        </article>
        <article>
          <span>Records</span>
          <strong>{report.totals.recordCount}</strong>
        </article>
        <article>
          <span>Source coverage</span>
          <strong>{report.totals.sourceCoveragePercent}%</strong>
        </article>
        <article>
          <span>Proof coverage</span>
          <strong>{report.totals.proofPacketCoveragePercent}%</strong>
        </article>
        <article>
          <span>Open pipeline</span>
          <strong>{report.totals.openPipelineCount}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Persistence model</p>
          <h2>Public fixtures for review. Tenant-admin analytics from retained opportunities.</h2>
          <p className="section-copy">{report.persistence.tenantMode}</p>
        </div>
        <div className="layer-list">
          {[
            `Public mode: ${report.persistence.publicMode}`,
            `Durable source: ${report.persistence.durableSource}`,
            `Authenticated API: ${report.persistence.authenticatedRoute}`,
            `Fallback: ${report.persistence.fallback}`
          ].map((item, index) => (
            <div className="layer-row" key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Source-to-pilot funnel">
        <div className="section-heading">
          <p className="eyebrow">Pipeline funnel</p>
          <h2>Every cohort is measured against sales-stage progression, not hype.</h2>
        </div>
        {report.funnel.map((stage) => (
          <article className="module-row" key={stage.stage}>
            <div>
              <span>{stage.shareOfRecords}%</span>
              <h2>{stage.stage}</h2>
            </div>
            <p>{stage.count} attribution record{stage.count === 1 ? "" : "s"} currently sit in this stage.</p>
            <strong>No-PHI sales process metric</strong>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Attribution cohorts">
        <div className="section-heading">
          <p className="eyebrow">Cohorts</p>
          <h2>Segment by source, campaign, buyer, deployment, offer, cadence, proof packet, and outcome.</h2>
        </div>
        {primaryCohorts.slice(0, 16).map((cohort) => (
          <article className="module-row" key={cohort.key}>
            <div>
              <span>{cohort.dimension}</span>
              <h2>{cohort.label}</h2>
            </div>
            <p>{cohort.recommendedAction}</p>
            <div>
              <strong>{cohort.recordCount} records - {cohort.shareOfRecords}%</strong>
              <ul className="compact-list">
                <li>Open: {cohort.openCount}</li>
                <li>Proposal: {cohort.proposalCount}</li>
                <li>Pilot planning: {cohort.pilotPlanningCount}</li>
                <li>Proof routes: {cohort.proofPacketRoutes.join(", ") || "To be confirmed"}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Proof recommendations">
        <div className="section-heading">
          <p className="eyebrow">Proof stack recommendations</p>
          <h2>Analytics should recommend the next proof artifact, not just count traffic.</h2>
        </div>
        <div className="principle-grid">
          {report.proofRecommendations.map((recommendation) => (
            <article key={recommendation.cohort}>
              <span>{recommendation.route}</span>
              <h3>{recommendation.cohort}</h3>
              <p>{recommendation.nextAction}</p>
              <small>{recommendation.boundary}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Attribution analytics limitations">
        <div className="section-heading">
          <p className="eyebrow">Known limitations</p>
          <h2>Analytics must stay honest until real sales volume, finance data, and approved CRM connectors exist.</h2>
        </div>
        {report.limitations.map((limitation) => (
          <article className="module-row" key={limitation}>
            <div>
              <span>guardrail</span>
              <h2>Limitation</h2>
            </div>
            <p>{limitation}</p>
            <strong>Boundary retained</strong>
          </article>
        ))}
      </section>
    </main>
  );
}
