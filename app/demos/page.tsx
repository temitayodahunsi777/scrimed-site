import Link from "next/link";
import { getDemoPilotProgramSummary } from "../lib/demoPilotPrograms";

export const metadata = {
  title: "SCRIMED Product Demos | Governed Healthcare AI",
  description:
    "Inspect executable SCRIMED healthcare AI demos with workflows, agents, proof routes, measurable signals, governance boundaries, and production exclusions."
};

export default function DemosPage() {
  const summary = getDemoPilotProgramSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">SCRIMED Demo Center</p>
        <h1>Inspect governed healthcare AI product demos.</h1>
        <p className="hero-text">{summary.boundary}</p>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED demo center summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Demos</span>
          <strong>{summary.demoCount}</strong>
        </article>
        <article>
          <span>Executable</span>
          <strong>{summary.executableDemos}</strong>
        </article>
        <article>
          <span>Pilot programs</span>
          <strong>{summary.pilotCount}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="SCRIMED investor demo proof">
        <div className="section-heading">
          <p className="eyebrow">Investor proof</p>
          <h2>{summary.investorReadiness.thesis}</h2>
          <p className="section-copy">{summary.investorReadiness.demoToPilotConversionPath}</p>
        </div>
        {summary.investorReadiness.proofSignals.map((signal) => (
          <article className="module-row" key={signal.label}>
            <div>
              <span>{signal.status}</span>
              <h2>{signal.label}</h2>
            </div>
            <p>{signal.evidence}</p>
            <Link className="module-link" href={signal.route}>Inspect proof surface</Link>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED product demos">
        <div className="section-heading">
          <p className="eyebrow">Demo registry</p>
          <h2>Each demo connects a buyer problem to an executable surface and inspectable proof.</h2>
        </div>
        {summary.productDemos.map((demo) => (
          <article className="module-row" key={demo.slug}>
            <div>
              <span>{demo.status}</span>
              <h2>{demo.name}</h2>
            </div>
            <p>{demo.buyer}</p>
            <div>
              <Link className="module-link" href={demo.route}>{demo.objective}</Link>
              <ul className="compact-list">
                <li>{demo.product} · {demo.agent}</li>
                <li>{demo.inspectableOutcomes.length} inspectable outcomes</li>
                <li>{demo.productionExclusions.length} production exclusions retained</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band product-actions" aria-label="SCRIMED demo buyer actions">
        <div className="section-heading">
          <p className="eyebrow">Next decision</p>
          <h2>Move from inspectable demo evidence to a scoped enterprise pilot.</h2>
        </div>
        <div className="action-grid">
          <Link className="action-card" href="/pilots">
            <span>Pilot programs</span>
            <strong>Compare pilot scopes</strong>
            <p>Review duration, deliverables, inputs, metrics, governance gates, and engagement models.</p>
          </Link>
          <Link className="action-card" href="/pricing">
            <span>Commercial model</span>
            <strong>Review pricing</strong>
            <p>Inspect recommended enterprise ranges, sales stages, and commercial guardrails.</p>
          </Link>
          <Link className="action-card" href="/pilot?offer=synthetic-pilot-evaluation">
            <span>Buyer intake</span>
            <strong>Request a pilot</strong>
            <p>Submit business-contact and workflow-scope information without PHI.</p>
          </Link>
          <Link className="action-card" href="/quality">
            <span>Proof stack</span>
            <strong>Inspect quality gates</strong>
            <p>Review active evidence gates and the controls still required before production.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
