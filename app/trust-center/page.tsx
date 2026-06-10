import Link from "next/link";
import { getEnterpriseReadinessSummary } from "../lib/enterpriseReadiness";

export const metadata = {
  title: "SCRIMED Trust & Enterprise Readiness Center",
  description:
    "Inspectable legal, security, privacy, brand, governance, marketing, communications, sales, and advertising readiness for SCRIMED."
};

export default function TrustCenterPage() {
  const summary = getEnterpriseReadinessSummary();

  return (
    <main>
      <section className="page-hero trust-hero">
        <Link className="back-link" href="/">SCRIMED</Link>
        <p className="eyebrow">Trust & Enterprise Readiness Center</p>
        <h1>Enterprise trust starts with facts, owners, evidence, launch gates, and visible limitations.</h1>
        <p className="hero-text">{summary.boundary}</p>
        <div className="hero-actions">
          <Link className="primary-action" href="/claims">Review Claims Register</Link>
          <Link className="secondary-action" href="/api/enterprise-readiness/diligence-brief">
            Download Diligence Brief
          </Link>
          <Link className="secondary-action" href="/pilot">Request Governed Evaluation</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Enterprise readiness summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Active controls</span>
          <strong>{summary.activeControls}</strong>
        </article>
        <article>
          <span>Decisions required</span>
          <strong>{summary.decisionsRequired}</strong>
        </article>
        <article>
          <span>External reviews</span>
          <strong>{summary.externalReviewsRequired}</strong>
        </article>
        <article>
          <span>Synthetic sales ready</span>
          <strong>{summary.publicSyntheticSalesReady ? "yes" : "no"}</strong>
        </article>
        <article>
          <span>Legal production ready</span>
          <strong>{summary.legalProductionReady ? "yes" : "no"}</strong>
        </article>
        <article>
          <span>Clinical production ready</span>
          <strong>{summary.productionClinicalReady ? "yes" : "no"}</strong>
        </article>
        <article>
          <span>Controlled claims</span>
          <strong>{summary.claims.total}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="Enterprise readiness domains">
        <div className="section-heading">
          <p className="eyebrow">Readiness domains</p>
          <h2>Every company-scale obligation has an accountable owner and an explicit gate.</h2>
          <p className="section-copy">
            Readiness is not a binary badge. SCRIMED distinguishes active controls from unresolved
            decisions and work that must be completed with qualified external reviewers.
          </p>
        </div>
        {summary.domains.map((domain) => (
          <article className="module-row" key={domain.slug}>
            <div>
              <span>{domain.status}</span>
              <h2>{domain.name}</h2>
            </div>
            <p>{domain.currentPosture}</p>
            <div>
              <Link className="module-link" href={domain.route}>{domain.objective}</Link>
              <ul className="compact-list">
                <li>Owner: {domain.owner}</li>
                <li>{domain.requirements.length} controlled requirements</li>
                <li>{domain.prohibitedActions.length} prohibited action classes</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Commercial truth</p>
          <h2>SCRIMED is sellable now within a governed synthetic evaluation boundary.</h2>
          <p className="section-copy">
            The current product supports enterprise discovery, workflow intelligence assessments,
            AI readiness audits, synthetic pilots, and automation blueprints. It does not authorize
            live PHI, autonomous care, payer submission, or production clinical execution.
          </p>
        </div>
        <div className="layer-list">
          <Link className="layer-row" href="/claims">
            <span>01</span>
            <strong>{summary.claims.approved} approved current-boundary claims</strong>
          </Link>
          <Link className="layer-row" href="/claims">
            <span>02</span>
            <strong>{summary.claims.evidenceRequired} claims require evidence before publication</strong>
          </Link>
          <Link className="layer-row" href="/claims">
            <span>03</span>
            <strong>{summary.claims.prohibited} claim classes are prohibited</strong>
          </Link>
        </div>
      </section>
    </main>
  );
}
