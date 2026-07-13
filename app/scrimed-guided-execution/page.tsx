import Link from "next/link";
import { getScrimedGuidedExecutionSummary } from "../lib/scrimedGuidedExecution";

export const metadata = {
  title: "SCRIMED Guided Execution",
  description:
    "Synthetic/no-PHI SCRIMED guided execution paths for buyers, investors, faith-based clinics, pilots, partners, and operators."
};

export default function ScrimedGuidedExecutionPage() {
  const summary = getScrimedGuidedExecutionSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/scrimed-enterprise-acceleration">
          Enterprise Acceleration
        </Link>
        <p className="eyebrow">SCRIMED Guided Execution Path</p>
        <h1>Turn every demo, proof route, pitch, and next action into an audience-specific path.</h1>
        <p className="hero-text">{summary.boundary}</p>
        <div className="hero-actions" aria-label="SCRIMED Guided Execution actions">
          <Link href={summary.apiRoute}>Inspect API</Link>
          <Link href="/investor-readiness">Investor Command</Link>
          <Link href="/pilot-demo-commercial-readiness">Demo to Pilot</Link>
          <Link href="/offerings">Offerings</Link>
          <Link href="/boundary-release-approvals">Approval Matrix</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED Guided Execution summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Audiences</span>
          <strong>{summary.audienceCount}</strong>
        </article>
        <article>
          <span>Runbooks</span>
          <strong>{summary.runbooks.length}</strong>
        </article>
        <article>
          <span>Friction reducers</span>
          <strong>{summary.frictionReducers.length}</strong>
        </article>
        <article>
          <span>Production</span>
          <strong>{summary.productionReadiness ? "enabled" : "blocked"}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Guided execution posture">
        <div>
          <p className="eyebrow">Strategic Focus</p>
          <h2>SCRIMED should feel easy to buy, easy to diligence, and hard to misinterpret.</h2>
        </div>
        <div>
          <p>{summary.recommendedNextBuildStep}</p>
          <p>
            Guided execution keeps sales, demos, pilots, investors, implementation, and internal operations connected
            to proof routes and retained safety boundaries.
          </p>
        </div>
      </section>

      <section className="table-section" aria-label="Guided execution paths">
        <div className="section-heading">
          <p className="eyebrow">Audience Paths</p>
          <h2>Each audience gets one landing route, one story, one proof path, and one human next step.</h2>
        </div>
        {summary.paths.map((path) => (
          <article className="module-row" key={path.id}>
            <div>
              <span>{path.status}</span>
              <h2>{path.title}</h2>
            </div>
            <p>{path.pitchAngle}</p>
            <div>
              <strong>{path.nextHumanAction}</strong>
              <ul className="compact-list">
                <li>Audience: {path.audience}</li>
                <li>Landing route: {path.landingRoute}</li>
                <li>Pricing motion: {path.pricingMotion}</li>
                <li>Proof routes: {path.proofRoutes.join(", ")}</li>
                <li>Metrics: {path.successMetrics.join(", ")}</li>
                <li>Audit: {path.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Demo runbooks">
        <div className="section-heading">
          <p className="eyebrow">Presentation + Demo Runbooks</p>
          <h2>Runbooks keep presentations concise, persuasive, and proof-backed.</h2>
        </div>
        {summary.runbooks.map((runbook) => (
          <article className="module-row" key={runbook.id}>
            <div>
              <span>{runbook.audience}</span>
              <h2>{runbook.name}</h2>
            </div>
            <p>{runbook.openingFrame}</p>
            <div>
              <strong>{runbook.closeQuestion}</strong>
              <ul className="compact-list">
                <li>Must show: {runbook.mustShowRoutes.join(", ")}</li>
                <li>Proof moment: {runbook.proofMoment}</li>
                <li>Follow-up: {runbook.followUpArtifact}</li>
                <li>Hard stops: {runbook.hardStops.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Friction reducers">
        <div className="section-heading">
          <p className="eyebrow">Friction Reducers</p>
          <h2>SCRIMED reduces confusion by turning sprawl into a guided commercial and proof system.</h2>
        </div>
        {summary.frictionReducers.map((item) => (
          <article className="module-row" key={item.id}>
            <div>
              <span>{item.owner}</span>
              <h2>{item.friction}</h2>
            </div>
            <p>{item.resolution}</p>
            <div>
              <strong>{item.metric}</strong>
              <p>{item.boundary}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
