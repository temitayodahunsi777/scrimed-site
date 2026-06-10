import Link from "next/link";
import { getCompanyOperationsSummary } from "../lib/companyOperations";
import { getEnterpriseReadinessSummary } from "../lib/enterpriseReadiness";

export const metadata = {
  title: "SCRIMED Operations Readiness",
  description:
    "SCRIMED operational readiness, deployment blockers, buyer route checklist, and smooth operations principles."
};

export default function OperationsPage() {
  const summary = getCompanyOperationsSummary();
  const enterprise = getEnterpriseReadinessSummary();

  return (
    <main>
      <section className="page-hero hub-hero">
        <Link className="back-link" href="/hub">Hub</Link>
        <p className="eyebrow">Operations readiness</p>
        <h1>Make every blocker visible, owned, and replaceable before it slows SCRIMED down.</h1>
        <p className="hero-text">{summary.boundary}</p>
      </section>

      <section className="section-band hub-summary" aria-label="Operations readiness summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Blocked</span>
          <strong>{summary.blocked}</strong>
        </article>
        <article>
          <span>Manual actions</span>
          <strong>{summary.manualAction}</strong>
        </article>
        <article>
          <span>Total</span>
          <strong>{summary.total}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="Operational blockers">
        <div className="section-heading">
          <p className="eyebrow">Blocker register</p>
          <h2>Publishing, deployment, DNS, Wix routing, and security decisions get explicit owners.</h2>
        </div>
        {summary.operationsBlockers.map((item) => (
          <article className="module-row" key={item.id}>
            <div>
              <span>{item.status}</span>
              <h2>{item.blocker}</h2>
            </div>
            <p>{item.impact}</p>
            <div>
              <strong>{item.owner}</strong>
              <ul className="compact-list">
                <li>{item.currentEvidence}</li>
                {item.resolutionPath.map((step) => (
                  <li key={step}>{step}</li>
                ))}
                <li>Fallback: {item.fallback}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Buyer route checklist">
        <div className="section-heading">
          <p className="eyebrow">Buyer route checklist</p>
          <h2>Official website traffic should land in the product without buyer Vercel accounts.</h2>
        </div>
        {summary.buyerRouteChecklist.map((step) => (
          <article className="module-row" key={step.step}>
            <div>
              <span>route</span>
              <h2>{step.step}</h2>
            </div>
            <p>{step.source} to {step.destination}</p>
            <div>
              <strong>{step.requiredAction}</strong>
              <ul className="compact-list">
                <li>{step.verification}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Enterprise launch gates">
        <div className="section-heading">
          <p className="eyebrow">Enterprise launch gates</p>
          <h2>Company readiness stays visible alongside deployment readiness.</h2>
          <p className="section-copy">{enterprise.boundary}</p>
        </div>
        {enterprise.domains.map((domain) => (
          <article className="module-row" key={domain.slug}>
            <div>
              <span>{domain.status}</span>
              <h2>{domain.name}</h2>
            </div>
            <p>{domain.currentPosture}</p>
            <Link className="module-link" href={domain.route}>{domain.requirements.length} controlled requirements</Link>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Smooth operations principles">
        <div className="section-heading">
          <p className="eyebrow">Operating principles</p>
          <h2>Zero known blockers means a system for finding and owning every blocker.</h2>
        </div>
        <div className="principle-grid">
          {summary.smoothOpsPrinciples.map((principle) => (
            <article key={principle.principle}>
              <span>principle</span>
              <h3>{principle.principle}</h3>
              <p>{principle.operatingRule}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
