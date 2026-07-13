import Link from "next/link";
import { getScrimedHybridRetrievalSummary } from "../lib/scrimedHybridRetrieval";

export const metadata = {
  title: "SCRIMED Hybrid Retrieval",
  description:
    "Synthetic-only SCRIMED Hybrid Retrieval Engine combining keyword, vector, ontology, knowledge graph, citation, and source trust metadata."
};

export default function ScrimedHybridRetrievalPage() {
  const summary = getScrimedHybridRetrievalSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/scrimed-clinical-benchmark-suite">
          Benchmark Suite
        </Link>
        <p className="eyebrow">SCRIMED CODE pt. 4</p>
        <h1>Hybrid Retrieval Engine</h1>
        <p className="hero-text">{summary.boundary}</p>
        <div className="hero-actions" aria-label="SCRIMED Hybrid Retrieval actions">
          <Link href={summary.apiRoute}>Inspect API</Link>
          <Link href={summary.briefRoute}>Download Brief</Link>
          <Link href="/scrimed-intelligence-platform">Intelligence Platform</Link>
          <Link href="/health-records">Health Records</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED Hybrid Retrieval summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Ranked sources</span>
          <strong>{summary.rankedResults.length}</strong>
        </article>
        <article>
          <span>Citations</span>
          <strong>{summary.clinicalSetting.citationRequired ? "required" : "optional"}</strong>
        </article>
        <article>
          <span>Clinical answer</span>
          <strong>{summary.clinicalSetting.doNotAnswerWithoutEvidence ? "evidence required" : "not gated"}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="Hybrid Retrieval ranking">
        <div className="section-heading">
          <p className="eyebrow">Unified Ranking</p>
          <h2>{summary.scoring.unifiedRankingFunction}</h2>
        </div>
        {summary.rankedResults.map((result) => (
          <article className="module-row" key={result.id}>
            <div>
              <span>rank {result.rank}</span>
              <h2>{result.title}</h2>
            </div>
            <p>{result.answerBoundary}</p>
            <div>
              <strong>{result.sourceTrustTier}</strong>
              <ul className="compact-list">
                <li>Unified score: {result.unifiedScore}</li>
                <li>BM25: {result.bm25Score}; vector: {result.vectorScore}</li>
                <li>Ontology boost: {result.ontologyBoost}; graph boost: {result.knowledgeGraphBoost}</li>
                <li>Audit hash: {result.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
