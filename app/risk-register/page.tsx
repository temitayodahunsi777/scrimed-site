import Link from "next/link";
import { getEnterpriseRiskRegisterSummary } from "../lib/enterpriseRiskRegister";

export default function RiskRegisterPage() {
  const summary = getEnterpriseRiskRegisterSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/investor-readiness">
          Investor Readiness
        </Link>
        <p className="eyebrow">Enterprise Risk Register</p>
        <h1>Machine-readable risk control map for SCRIMED enterprise diligence.</h1>
        <p className="hero-text">
          SCRIMED tracks PHI/privacy, clinical safety, hallucination, drift, bias, cybersecurity, vendor, cost, auditability, regulatory, EHR, payer, and deployment risks without claiming production approval.
        </p>
        <div className="hero-actions" aria-label="Risk register actions">
          <Link href="/api/risk-register">Inspect API</Link>
          <Link href="/trust-center">Trust Center</Link>
          <Link href="/clinical-production-readiness">Clinical Production Readiness</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Risk register summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Risks</span>
          <strong>{summary.riskCount}</strong>
        </article>
        <article>
          <span>Critical</span>
          <strong>{summary.criticalCount}</strong>
        </article>
        <article>
          <span>Blocked</span>
          <strong>{summary.blockedBeforeProductionCount}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="Enterprise risks">
        {summary.risks.map((risk) => (
          <article className="module-row" key={risk.id}>
            <div>
              <span>{risk.category}</span>
              <h2>{risk.severity} severity; {risk.likelihood} likelihood</h2>
            </div>
            <p>{risk.mitigation}</p>
            <Link className="module-link" href={risk.evidenceLink}>
              Review evidence
            </Link>
          </article>
        ))}
      </section>

      <section className="section-band split-band" aria-label="Risk register boundary">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>Risk tracking is not approval.</h2>
        </div>
        <p>{summary.boundary}</p>
      </section>
    </main>
  );
}
