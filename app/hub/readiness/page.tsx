import Link from "next/link";
import { getReadinessSummary } from "../../lib/hubOperations";

export default function HubReadinessPage() {
  const summary = getReadinessSummary();

  return (
    <main>
      <section className="page-hero hub-hero">
        <Link className="back-link" href="/hub">Hub</Link>
        <p className="eyebrow">Readiness console</p>
        <h1>Foundation readiness is visible, practical, and intentionally gated before clinical integrations.</h1>
        <p className="hero-text">{summary.recommendation}</p>
      </section>

      <section className="section-band hub-summary" aria-label="Readiness summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Score</span>
          <strong>{Math.round(summary.score * 100)}%</strong>
        </article>
        <article>
          <span>Checks</span>
          <strong>{summary.checks.length}</strong>
        </article>
        <article>
          <span>Updated</span>
          <strong>{summary.updated}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="Readiness checks">
        {summary.checks.map((check) => (
          <article className="module-row" key={check.name}>
            <div>
              <span>{check.status}</span>
              <h2>{check.name}</h2>
            </div>
            <p>{check.status === "pass" ? "Ready" : "Not blocking"}</p>
            <strong>{check.detail}</strong>
          </article>
        ))}
      </section>
    </main>
  );
}
