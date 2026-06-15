import Link from "next/link";
import { getSalesAttributionSummary } from "../lib/salesAttribution";

export const metadata = {
  title: "SCRIMED Sales Attribution",
  description:
    "CRM-safe source tracking, no-PHI intake attribution, target audience routing, deployment profile mapping, and sales cadence for SCRIMED enterprise pilots."
};

export default function SalesAttributionPage() {
  const summary = getSalesAttributionSummary();
  const sample = summary.sampleAttribution;

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/market-activation">Market Activation</Link>
        <p className="eyebrow">Sales Attribution</p>
        <h1>SCRIMED turns every safe buyer signal into a governed opportunity routing packet.</h1>
        <p className="hero-text">{summary.boundary}</p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/pilot">Buyer Intake</Link>
          <Link className="secondary-action" href="/sales-operations">Sales Operations</Link>
          <Link className="secondary-action" href="/source-intelligence">Source Intelligence</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Sales attribution summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Source signals</span>
          <strong>{summary.sourceSignalCount}</strong>
        </article>
        <article>
          <span>Revenue streams</span>
          <strong>{summary.revenueStreamCount}</strong>
        </article>
        <article>
          <span>Audiences</span>
          <strong>{summary.targetAudienceCount}</strong>
        </article>
        <article>
          <span>Profiles</span>
          <strong>{summary.deploymentProfileCount}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Sample routing packet</p>
          <h2>{sample.market.revenueStream}</h2>
          <p className="section-copy">{sample.market.message}</p>
        </div>
        <div className="layer-list">
          {[
            `Source: ${sample.sourceCategory}`,
            `Campaign: ${sample.campaign.matchedChannel}`,
            `Audience: ${sample.market.targetAudience}`,
            `Deployment: ${sample.deployment.profileName}`,
            `Cadence: ${sample.cadence.priority} - ${sample.cadence.firstResponseSla}`
          ].map((item, index) => (
            <div className="layer-row" key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Captured fields">
        <div className="section-heading">
          <p className="eyebrow">Captured fields</p>
          <h2>Attribution captures commercial context, not health data.</h2>
        </div>
        {summary.capturedFields.map((field) => (
          <article className="module-row" key={field}>
            <div>
              <span>allowed</span>
              <h2>{field}</h2>
            </div>
            <p>Retained only as CRM-safe metadata for buyer routing, proof recommendations, and human follow-up.</p>
            <strong>No-PHI</strong>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Blocked attribution fields">
        <div className="section-heading">
          <p className="eyebrow">Blocked fields</p>
          <h2>Attribution must never become a back door for sensitive healthcare data.</h2>
        </div>
        {summary.blockedFields.map((field) => (
          <article className="module-row" key={field}>
            <div>
              <span>blocked</span>
              <h2>{field}</h2>
            </div>
            <p>Rejected from public intake and excluded from CRM-safe source routing.</p>
            <strong>Review required</strong>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Source-informed routing signals">
        <div className="section-heading">
          <p className="eyebrow">Source-informed signals</p>
          <h2>External platform patterns become SCRIMED-specific sales and product recommendations.</h2>
        </div>
        <div className="principle-grid">
          {sample.sourceSignals.map((signal) => (
            <article key={`${signal.sourceName}-${signal.category}`}>
              <span>{signal.category}</span>
              <h3>{signal.sourceName}</h3>
              <p>{signal.scrimedApplication}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
