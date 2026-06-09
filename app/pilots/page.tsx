import Link from "next/link";
import { getDemoPilotProgramSummary } from "../lib/demoPilotPrograms";

export const metadata = {
  title: "SCRIMED Pilot Programs | Enterprise Healthcare AI",
  description:
    "Compare sellable SCRIMED healthcare AI pilot programs with deliverables, measurable outcomes, buyer inputs, governance gates, and explicit production exclusions."
};

export default function PilotProgramsPage() {
  const summary = getDemoPilotProgramSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">SCRIMED Pilot Programs</p>
        <h1>Buy a governed path from workflow problem to enterprise decision.</h1>
        <p className="hero-text">{summary.boundary}</p>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED pilot program summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Programs</span>
          <strong>{summary.pilotCount}</strong>
        </article>
        <article>
          <span>Sellable now</span>
          <strong>{summary.sellableNow}</strong>
        </article>
        <article>
          <span>Protected pilots</span>
          <strong>{summary.protectedPilots}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="SCRIMED pilot program catalog">
        <div className="section-heading">
          <p className="eyebrow">Pilot catalog</p>
          <h2>Every program defines the buyer commitment, proof package, success metrics, and decision gate.</h2>
        </div>
        {summary.pilotPrograms.map((pilot) => (
          <article className="module-row" key={pilot.slug}>
            <div>
              <span>{pilot.status} · {pilot.duration}</span>
              <h2>{pilot.name}</h2>
            </div>
            <p>{pilot.buyer}</p>
            <div>
              <Link className="module-link" href={pilot.route}>{pilot.objective}</Link>
              <ul className="compact-list">
                <li>{pilot.engagementModel}</li>
                <li>{pilot.deliverables.length} deliverables</li>
                <li>{pilot.successMetrics.length} success metrics</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band product-actions" aria-label="SCRIMED pilot buyer actions">
        <div className="action-grid">
          <Link className="action-card" href="/demos">
            <span>Product proof</span>
            <strong>Inspect demos</strong>
            <p>Review the executable synthetic surfaces included in pilot programs.</p>
          </Link>
          <Link className="action-card" href="/pricing">
            <span>Commercial model</span>
            <strong>Review pricing</strong>
            <p>Understand package ranges, annual expansion, and enterprise guardrails.</p>
          </Link>
          <Link className="action-card" href="/pilot">
            <span>Buyer intake</span>
            <strong>Request a scoped pilot</strong>
            <p>Submit organization, workflow, governance, and readiness context without PHI.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
