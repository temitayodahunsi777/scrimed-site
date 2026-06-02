import { getAgentOSSummary } from "../lib/agentOS";
import { getAtlasIntelligenceCoreSummary } from "../lib/atlasIntelligenceCore";

const trustSignals = [
  "workflow quality",
  "model behavior drift",
  "latency and cost patterns",
  "approval and override patterns",
  "runtime traces",
  "safety signals"
];

const operatingPrinciples = [
  "Healthcare AI needs continuous monitoring after deployment, not only pre-launch evaluation.",
  "Every workflow should expose the signals needed to explain performance, safety, and operational cost.",
  "Trust infrastructure should be built alongside product modules, not patched in after scale."
];

export default function TrustPage() {
  const agentOS = getAgentOSSummary();
  const atlas = getAtlasIntelligenceCoreSummary();

  return (
    <main>
      <section className="page-hero trust-hero">
        <a className="back-link" href="/">SCRIMED</a>
        <p className="eyebrow">Watchtower, TrustQA, and Trust Cards</p>
        <h1>Every SCRIMED recommendation needs provenance, confidence, validation, and human review.</h1>
        <p className="hero-text">
          Watchtower monitors workflows while TrustQA verifies boundary, evidence attribution, confidence, approval checkpoints, and source freshness before outputs leave a sandbox.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Trust summary">
        <article>
          <span>TrustQA</span>
          <strong>{agentOS.trustQaVerificationLayer.length}</strong>
        </article>
        <article>
          <span>Trust Cards</span>
          <strong>{atlas.trustCards.length}</strong>
        </article>
        <article>
          <span>Evidence sources</span>
          <strong>{atlas.atlasEvidenceLayer.sources.length}</strong>
        </article>
        <article>
          <span>Approvals</span>
          <strong>{agentOS.humanApprovalCheckpoints.length}</strong>
        </article>
      </section>

      <section className="split-band section-band">
        <div>
          <p className="eyebrow">Signals</p>
          <h2>What Watchtower is designed to observe.</h2>
        </div>
        <div className="layer-list">
          {trustSignals.map((signal, index) => (
            <div className="layer-row" key={signal}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{signal}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" id="trust-cards" aria-label="Trust cards">
        <div className="section-heading">
          <p className="eyebrow">Trust Card System</p>
          <h2>Recommendations carry confidence, source, version, validation, and review requirements.</h2>
        </div>
        {atlas.trustCards.map((card) => (
          <article className="module-row" key={card.slug}>
            <div>
              <span>{card.validationStatus}</span>
              <h2>{card.workflow}</h2>
            </div>
            <p>{card.recommendation}</p>
            <div>
              <strong>Confidence {Math.round(card.confidence * 100)}%</strong>
              <ul className="compact-list">
                <li>{card.sourceAttribution}</li>
                <li>{card.guidelineVersion}</li>
                <li>{card.humanReview}</li>
                <li>Last updated: {card.lastUpdated}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="TrustQA checks">
        <div className="section-heading">
          <p className="eyebrow">TrustQA verification layer</p>
          <h2>Unsafe or weakly evidenced outputs are held before release.</h2>
        </div>
        <div className="principle-grid">
          {agentOS.trustQaVerificationLayer.map((check) => (
            <article key={check.check}>
              <span>{check.status}</span>
              <h3>{check.check}</h3>
              <p>{check.purpose}</p>
              <ul className="compact-list">
                <li>{check.failureAction}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Evidence sources">
        <div className="section-heading">
          <p className="eyebrow">Atlas Evidence Layer</p>
          <h2>Sources require owner, version, validation timestamp, and usage boundary.</h2>
        </div>
        {atlas.atlasEvidenceLayer.sources.map((source) => (
          <article className="module-row" key={source.id}>
            <div>
              <span>{source.type}</span>
              <h2>{source.title}</h2>
            </div>
            <p>{source.owner}. Version: {source.version}</p>
            <div>
              {source.url.startsWith("http") ? (
                <a className="module-link" href={source.url}>{source.id}</a>
              ) : (
                <strong>{source.id}</strong>
              )}
              <ul className="compact-list">
                <li>{source.usageBoundary}</li>
                <li>Validated: {source.validationTimestamp}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band principle-grid" aria-label="Trust principles">
        {operatingPrinciples.map((principle) => (
          <article key={principle}>
            <p>{principle}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
