import Link from "next/link";
import { getDeploymentProfileSummary } from "../lib/deploymentProfiles";

export const metadata = {
  title: "SCRIMED Deployment Profiles",
  description:
    "Cloud, private-cloud, hospital-controlled, sovereign, and edge/on-prem deployment profile fixtures for SCRIMED protected healthcare AI pilots."
};

export default function DeploymentProfilesPage() {
  const summary = getDeploymentProfileSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">Deployment Profiles</p>
        <h1>SCRIMED deployment readiness turns enterprise infrastructure constraints into proof-ready pilot profiles.</h1>
        <p className="hero-text">
          These profiles help buyers evaluate managed cloud, private cloud, hospital-controlled, sovereign, and edge/on-prem paths before live data, clinical execution, or production connectors are approved.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/strategic-intelligence">Strategic Intelligence</Link>
          <Link className="secondary-action" href="/pilot-workspace">Protected Workspace</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Deployment profile summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Profiles</span>
          <strong>{summary.profileCount}</strong>
        </article>
        <article>
          <span>Protected ready</span>
          <strong>{summary.protectedPilotReady}</strong>
        </article>
        <article>
          <span>External gates</span>
          <strong>{summary.externalApprovalRequired}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Proof boundary</p>
          <h2>{summary.proofPacketSection}</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.knownLimitationResolution.map((item, index) => (
            <div className="layer-row" key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Deployment profiles">
        <div className="section-heading">
          <p className="eyebrow">Profiles</p>
          <h2>Each deployment path defines buyer fit, revenue use, controls, metrics, gates, and blocked claims.</h2>
        </div>
        {summary.profiles.map((profile) => (
          <article className="module-row" key={profile.slug}>
            <div>
              <span>{profile.status}</span>
              <h2>{profile.name}</h2>
            </div>
            <p>{profile.buyer}. {profile.deploymentThesis}</p>
            <div>
              <Link className="module-link" href={profile.primaryRoute}>
                {profile.revenueUse}
              </Link>
              <ul className="compact-list">
                <li>Environment: {profile.environment}</li>
                <li>Cost model: {profile.costModel}</li>
                <li>Data posture: {profile.dataResidencyPosture}</li>
                <li>Blocked claims: {profile.blockedClaims.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Deployment metrics">
        <div className="section-heading">
          <p className="eyebrow">Metrics</p>
          <h2>Deployment readiness is measured as pilot evidence, not as unsupported production certification.</h2>
        </div>
        <div className="principle-grid">
          {summary.profiles.flatMap((profile) =>
            profile.metrics.map((metric) => (
              <article key={`${profile.slug}-${metric.metric}`}>
                <span>{profile.name}</span>
                <h3>{metric.metric}</h3>
                <p>{metric.target}</p>
                <ul className="compact-list">
                  <li>{metric.evidence}</li>
                  <li>{metric.boundary}</li>
                </ul>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
