import Link from "next/link";
import { getScrimedAIInfrastructureWatchtowerSummary } from "../lib/scrimedAIInfrastructureWatchtower";

export const metadata = {
  title: "SCRIMED AI Infrastructure Watchtower",
  description:
    "Synthetic-only SCRIMED AI Infrastructure Watchtower for chips, sovereignty, local models, energy, regulations, cybersecurity, funding, interoperability, payer automation, imaging, and drug discovery signals."
};

export default function ScrimedAIInfrastructureWatchtowerPage() {
  const summary = getScrimedAIInfrastructureWatchtowerSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/scrimed-compute-fabric">
          Compute Fabric
        </Link>
        <p className="eyebrow">SCRIMED CODE pt. 4</p>
        <h1>AI Infrastructure Watchtower</h1>
        <p className="hero-text">{summary.boundary}</p>
        <div className="hero-actions" aria-label="SCRIMED AI Infrastructure Watchtower actions">
          <Link href={summary.apiRoute}>Inspect API</Link>
          <Link href={summary.briefRoute}>Download Brief</Link>
          <Link href="/scrimed-build-roadmap">Build Roadmap</Link>
          <Link href="/competitive-intelligence">Market Intelligence</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED AI Infrastructure Watchtower summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Categories</span>
          <strong>{summary.categoryCount}</strong>
        </article>
        <article>
          <span>Review blocks</span>
          <strong>{summary.blockUntilReviewCount}</strong>
        </article>
        <article>
          <span>Production ready</span>
          <strong>{summary.productionReadiness ? "yes" : "no"}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="AI infrastructure watch items">
        <div className="section-heading">
          <p className="eyebrow">Strategic Watch Items</p>
          <h2>Signals are tracked for readiness decisions, not investment or deployment claims.</h2>
        </div>
        {summary.watchItems.map((item) => (
          <article className="module-row" key={item.category}>
            <div>
              <span>{item.responsePosture}</span>
              <h2>{item.category}</h2>
            </div>
            <p>{item.strategicQuestion}</p>
            <div>
              <strong>{item.scrimedRelevance}</strong>
              <ul className="compact-list">
                <li>{item.recommendedSignal}</li>
                <li>Hash: {item.watchHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
