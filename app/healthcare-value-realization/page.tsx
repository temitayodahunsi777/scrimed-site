import Link from "next/link";
import { getHealthcareValueRealizationSummary } from "../lib/healthcareValueRealization";

export const metadata = {
  title: "SCRIMED Healthcare Value Realization",
  description:
    "Synthetic-only value realization engine for buyer-ready outcome metrics, pilot proof packets, risk controls, and investor diligence signals."
};

export default function HealthcareValueRealizationPage() {
  const summary = getHealthcareValueRealizationSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">Healthcare Value Realization</p>
        <h1>SCRIMED turns optimization lanes into governed value evidence.</h1>
        <p className="hero-text">
          This layer translates clinical workflow, patient engagement, hospital operations, interoperability,
          RCM, pilot, and investor proof signals into synthetic-only metrics and packages that buyers can
          inspect without receiving ROI guarantees, financial authority, PHI authority, or clinical authority.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.briefRoute}>
            Download Value Brief
          </a>
          <a className="secondary-action" href={summary.apiRoute}>
            Inspect API
          </a>
          <Link className="secondary-action" href="/healthcare-optimization-command">
            Optimization Command
          </Link>
          <Link className="secondary-action" href="/pilot-demo-commercial-readiness">
            Pilot Readiness
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Healthcare value realization summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Value metrics</span>
          <strong>{summary.metricCount}</strong>
        </article>
        <article>
          <span>Value packages</span>
          <strong>{summary.packageCount}</strong>
        </article>
        <article>
          <span>Risk controls</span>
          <strong>{summary.riskControlCount}</strong>
        </article>
        <article>
          <span>Evidence score</span>
          <strong>{summary.averageEvidenceScore}</strong>
        </article>
        <article>
          <span>Proof routes</span>
          <strong>{summary.proofRouteCount}</strong>
        </article>
        <article>
          <span>Human review</span>
          <strong>{summary.humanReviewRequiredCount}</strong>
        </article>
        <article>
          <span>Blocked claims</span>
          <strong>{summary.blockedActionCount}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Value realization boundary">
        <div>
          <p className="eyebrow">Safety and finance boundary</p>
          <h2>Value measurement is allowed; ROI guarantees and live clinical authority stay blocked.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {Object.entries(summary.authority).map(([name, status], index) => (
            <div className="layer-row" key={name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{name}: {status}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Healthcare value metrics">
        <div className="section-heading">
          <p className="eyebrow">Value metrics</p>
          <h2>Every metric answers a buyer question, names its synthetic source, and preserves a blocked-use boundary.</h2>
          <p className="section-copy">{summary.nextBestMove}</p>
        </div>
        {summary.topMetrics.map((metric) => (
          <article className="module-row" key={metric.id}>
            <div>
              <span>{metric.domain}</span>
              <h2>{metric.name}</h2>
            </div>
            <p>{metric.buyerQuestion}</p>
            <div>
              <strong>Evidence {metric.evidenceScore} - {metric.targetDirection}</strong>
              <ul className="compact-list">
                <li>Baseline: {metric.baselineSignal}</li>
                <li>Method: {metric.measurementMethod}</li>
                <li>Allowed: {metric.allowedUse}</li>
                <li>Blocked: {metric.blockedUse}</li>
                <li>Proof routes: {metric.proofRoutes.join(", ")}</li>
                <li>Audit: {metric.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Healthcare value packages">
        <div className="section-heading">
          <p className="eyebrow">Buyer proof packages</p>
          <h2>SCRIMED packages value evidence into discovery, pilot, interoperability, patient engagement, RCM, and investor-ready motions.</h2>
        </div>
        {summary.valuePackages.map((valuePackage) => (
          <article className="module-row" key={valuePackage.id}>
            <div>
              <span>{valuePackage.buyerAudience}</span>
              <h2>{valuePackage.name}</h2>
            </div>
            <p>{valuePackage.valueThesis}</p>
            <div>
              <strong>{valuePackage.commercialMotion}</strong>
              <ul className="compact-list">
                <li>Artifact: {valuePackage.pilotArtifact}</li>
                <li>Metrics: {valuePackage.includedMetrics.join(", ")}</li>
                <li>Boundary: {valuePackage.retainedBoundary}</li>
                <li>Next: {valuePackage.nextAction}</li>
                <li>Proof routes: {valuePackage.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Healthcare value risk controls">
        <div className="section-heading">
          <p className="eyebrow">Risk controls</p>
          <h2>Commercial confidence improves because the engine blocks overclaims before buyers or investors see the evidence packet.</h2>
        </div>
        {summary.riskControls.map((control) => (
          <article className="module-row" key={control.risk}>
            <div>
              <span>{control.severity}</span>
              <h2>{control.risk}</h2>
            </div>
            <p>{control.mitigation}</p>
            <div>
              <strong>Blocked claim: {control.blockedClaim}</strong>
              <ul className="compact-list">
                <li>Proof route: {control.proofRoute}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
