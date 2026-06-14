import Link from "next/link";
import { getPilotEvidenceDashboard } from "../lib/pilotEvidenceDashboard";

export const metadata = {
  title: "SCRIMED Pilot Evidence Dashboard",
  description:
    "Review SCRIMED enterprise pilot evidence, healthcare intelligence OS proof, readiness tracks, measurable outcomes, and downloadable diligence brief."
};

export default function PilotEvidencePage() {
  const dashboard = getPilotEvidenceDashboard();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">SCRIMED Pilot Evidence Dashboard</p>
        <h1>Enterprise proof for governed synthetic pilots, protected workspaces, and Healthcare Intelligence OS readiness.</h1>
        <p className="hero-text">
          This dashboard gives buyers, investors, and SCRIMED operators a single evidence surface for what the product can
          demonstrate today, which controls are already active, and which production gates remain intentionally blocked.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={dashboard.briefRoute}>
            Download Evidence Brief
          </a>
          <Link className="secondary-action" href={dashboard.operatingSystemRoute}>
            Healthcare Intelligence OS
          </Link>
          <a className="secondary-action" href={dashboard.apiRoute}>
            Inspect Evidence API
          </a>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED pilot evidence summary">
        <article>
          <span>Status</span>
          <strong>{dashboard.status}</strong>
        </article>
        <article>
          <span>Evidence cards</span>
          <strong>{dashboard.evidenceCardCount}</strong>
        </article>
        <article>
          <span>Readiness tracks</span>
          <strong>{dashboard.readinessTrackCount}</strong>
        </article>
        <article>
          <span>Proof stack</span>
          <strong>{dashboard.proofStackCount}</strong>
        </article>
        <article>
          <span>Outcome metrics</span>
          <strong>{dashboard.metricCount}</strong>
        </article>
        <article>
          <span>Architecture phases</span>
          <strong>{dashboard.architecturePhaseCount}</strong>
        </article>
        <article>
          <span>Data posture</span>
          <strong>synthetic only</strong>
        </article>
        <article>
          <span>Execution boundary</span>
          <strong>human-reviewed</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Investor and buyer thesis</p>
          <h2>{dashboard.investorThesis}</h2>
          <p className="section-copy">{dashboard.currentProductBoundary}</p>
        </div>
        <div className="layer-list">
          <div className="layer-row">
            <span>01</span>
            <strong>{dashboard.conversionPath}</strong>
          </div>
          <div className="layer-row">
            <span>02</span>
            <strong>{dashboard.dataPosture}</strong>
          </div>
          <div className="layer-row">
            <span>03</span>
            <strong>{dashboard.boundary}</strong>
          </div>
        </div>
      </section>

      <section className="table-section" aria-label="SCRIMED evidence cards">
        <div className="section-heading">
          <p className="eyebrow">Evidence cards</p>
          <h2>Each buyer diligence question maps to a route, API, current proof, and retained boundary.</h2>
        </div>
        {dashboard.evidenceCards.map((card) => (
          <article className="module-row" key={card.name}>
            <div>
              <span>{card.status}</span>
              <h2>{card.name}</h2>
            </div>
            <p>{card.buyerQuestion}</p>
            <div>
              <Link className="module-link" href={card.route}>{card.currentEvidence}</Link>
              <ul className="compact-list">
                <li>API: {card.apiRoute}</li>
                <li>{card.boundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED readiness tracks">
        <div className="section-heading">
          <p className="eyebrow">Readiness tracks</p>
          <h2>Current controls are explicit, and every production dependency has a named gate.</h2>
        </div>
        {dashboard.readinessTracks.map((track) => (
          <article className="module-row" key={track.track}>
            <div>
              <span>{track.status}</span>
              <h2>{track.track}</h2>
            </div>
            <p>{track.owner}. {track.evidence}</p>
            <strong>{track.nextGate}</strong>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="SCRIMED measurable outcomes">
        <div className="section-heading">
          <p className="eyebrow">Pilot outcomes</p>
          <h2>Measurable outcomes remain tied to buyer-approved baselines and governed synthetic evidence.</h2>
        </div>
        <div className="principle-grid">
          {dashboard.evidenceMetrics.map((metric) => (
            <article key={metric.metric}>
              <span>{metric.metric}</span>
              <h3>{metric.signal}</h3>
              <p>{metric.proof}</p>
              <ul className="compact-list">
                <li>{metric.measurementBoundary}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="SCRIMED architecture phases">
        <div className="section-heading">
          <p className="eyebrow">Architecture proof</p>
          <h2>The pilot evidence ties directly to the Healthcare Intelligence OS build sequence.</h2>
        </div>
        {dashboard.architecture.map((phase) => (
          <article className="module-row" key={phase.id}>
            <div>
              <span>{phase.status}</span>
              <h2>{phase.name}</h2>
            </div>
            <p>{phase.objective}</p>
            <ul className="compact-list">
              {phase.currentEvidence.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="SCRIMED buyer actions">
        <div className="section-heading">
          <p className="eyebrow">Buyer actions</p>
          <h2>Use the evidence surface to move from inspection to qualified pilot conversations.</h2>
        </div>
        <div className="action-grid">
          {dashboard.buyerActions.map((action) => (
            <Link className="action-card" href={action.href} key={action.label}>
              <span>action</span>
              <strong>{action.label}</strong>
              <p>{action.purpose}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
