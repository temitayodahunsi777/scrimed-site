import Link from "next/link";
import { getSourceIntelligenceSummary } from "../lib/sourceIntelligence";

export const metadata = {
  title: "SCRIMED Source Intelligence",
  description:
    "Public source-informed product strategy signals for SCRIMED interoperability, agents, design quality, model governance, healthcare domain depth, data cloud, and sales activation."
};

export default function SourceIntelligencePage() {
  const summary = getSourceIntelligenceSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">Source Intelligence</p>
        <h1>SCRIMED converts public platform and standards signals into governed healthcare product strategy.</h1>
        <p className="hero-text">{summary.boundary}</p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.apiRoute}>Inspect API</a>
          <Link className="secondary-action" href="/sales-attribution">Sales Attribution</Link>
          <Link className="secondary-action" href="/strategic-intelligence">Strategic Intelligence</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Source intelligence summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Sources</span>
          <strong>{summary.sourceCount}</strong>
        </article>
        {summary.categories.map((category) => (
          <article key={category.category}>
            <span>{category.category}</span>
            <strong>{category.count}</strong>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Source-informed implementation themes">
        <div className="section-heading">
          <p className="eyebrow">Implementation themes</p>
          <h2>Public signals become SCRIMED-specific architecture, gates, and product execution paths.</h2>
        </div>
        {summary.implementationThemes.map((theme, index) => (
          <article className="module-row" key={theme}>
            <div>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>{theme}</h2>
            </div>
            <p>Theme is applied through SCRIMED product surfaces, proof routes, and governance boundaries.</p>
            <strong>No third-party partnership or certification is implied.</strong>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Source signals">
        <div className="section-heading">
          <p className="eyebrow">Source signals</p>
          <h2>Each source is converted into a SCRIMED implementation path with an explicit boundary.</h2>
        </div>
        {summary.signals.map((signal) => (
          <article className="module-row" key={signal.sourceName}>
            <div>
              <span>{signal.category}</span>
              <h2>{signal.sourceName}</h2>
            </div>
            <p>{signal.observedPattern}</p>
            <div>
              <a className="module-link" href={signal.sourceUrl}>
                Source
              </a>
              <ul className="compact-list">
                <li>{signal.scrimedApplication}</li>
                <li>{signal.implementationPath.join(" ")}</li>
                <li>{signal.governanceBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
