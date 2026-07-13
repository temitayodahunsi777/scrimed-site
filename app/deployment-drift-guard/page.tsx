import Link from "next/link";
import { getDeploymentDriftGuardSummary } from "../lib/deploymentDriftGuard";

export const metadata = {
  title: "SCRIMED Deployment Drift Guard",
  description:
    "No-secret SCRIMED deployment drift guard for detecting stale production routes before buyer, investor, operator, or release promotion."
};

export default function DeploymentDriftGuardPage() {
  const summary = getDeploymentDriftGuardSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/release-continuity">
          Release Continuity
        </Link>
        <p className="eyebrow">Deployment Drift Guard</p>
        <h1>Detect stale deployments before SCRIMED uses them as proof.</h1>
        <p className="hero-text">{summary.boundary}</p>
        <p className="hero-text">
          This route can identify drift and block promotion, but it does not deploy code, commit source,
          apply migrations, rotate secrets, or authorize production customer use.
        </p>
        <div className="hero-actions" aria-label="Deployment Drift Guard actions">
          <Link href={summary.apiRoute}>Inspect API</Link>
          <Link href={summary.briefRoute}>Download Brief</Link>
          <Link href="/release-continuity">Release Continuity</Link>
          <Link href="/launch-readiness">Launch Readiness</Link>
          <Link href="/navigation">Navigation Audit</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Deployment Drift Guard summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Guarded routes</span>
          <strong>{summary.guardRouteCount}</strong>
        </article>
        <article>
          <span>Smoke covered</span>
          <strong>{summary.smokeCoveredRouteCount}</strong>
        </article>
        <article>
          <span>Target</span>
          <strong>{summary.targetUrl}</strong>
        </article>
        <article>
          <span>Decision</span>
          <strong>{summary.driftDecision}</strong>
        </article>
        <article>
          <span>Deploy authority</span>
          <strong>{summary.deploymentAuthority}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Deployment drift operating rule">
        <div>
          <p className="eyebrow">Operating Rule</p>
          <h2>Local pass plus production 404 means deployment drift, not product readiness.</h2>
          <p className="section-copy">
            SCRIMED should block buyer demos, investor proof references, public launch claims, and operator
            evidence promotion when the target deployment does not serve the same critical routes as the
            reviewed repository build.
          </p>
        </div>
        <div className="layer-list">
          {summary.exactCommands.slice(0, 5).map((command, index) => (
            <div className="layer-row" key={command}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{command}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Guarded deployment routes">
        <div className="section-heading">
          <p className="eyebrow">Guarded Routes</p>
          <h2>Each guarded route has an owner, source evidence, expected status, and drift signal.</h2>
        </div>
        {summary.guardRoutes.map((route) => (
          <article className="module-row" key={route.path}>
            <div>
              <span>{route.routeClass}</span>
              <h2>{route.path}</h2>
            </div>
            <p>{route.whyItMatters}</p>
            <div>
              <strong>Expect {route.expectedStatus}</strong>
              <ul className="compact-list">
                <li>Owner: {route.owner}</li>
                <li>Drift signal: {route.driftSignal}</li>
                <li>Boundary: {route.responseBoundary}</li>
                <li>Evidence: {route.sourceEvidence.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Deployment drift runbook">
        <div className="section-heading">
          <p className="eyebrow">Runbook</p>
          <h2>Promotion stays blocked until target smoke and source smoke agree.</h2>
        </div>
        {summary.runbook.map((step) => (
          <article className="module-row" key={step.step}>
            <div>
              <span>{step.owner}</span>
              <h2>{step.step}</h2>
            </div>
            <p>{step.command}</p>
            <div>
              <strong>{step.successSignal}</strong>
              <ul className="compact-list">
                <li>Failure action: {step.failureAction}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Deployment Drift Guard no-go boundaries">
        <div className="section-heading">
          <p className="eyebrow">Hard Stops</p>
          <h2>This guard improves release truth without expanding SCRIMED authority.</h2>
        </div>
        {summary.noGoBoundaries.map((boundary) => (
          <article className="module-row" key={boundary}>
            <div>
              <span>NO-GO</span>
              <h2>{boundary}</h2>
            </div>
            <p>
              The guard can classify target drift and block promotion; it cannot relieve clinical, privacy,
              security, legal, payer, connector, deployment, or customer activation boundaries.
            </p>
            <div>
              <strong>Authority: {summary.productionGoLiveAuthority}</strong>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
