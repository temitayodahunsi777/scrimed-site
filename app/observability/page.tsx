import { getAgentOSSummary } from "../lib/agentOS";
import { getAtlasIntelligenceCoreSummary } from "../lib/atlasIntelligenceCore";

export default function ObservabilityPage() {
  const agentOS = getAgentOSSummary();
  const atlas = getAtlasIntelligenceCoreSummary();

  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/hub">Hub</a>
        <p className="eyebrow">Observability and continuous validation</p>
        <h1>SCRIMED measures workflow outcomes, trust, review friction, and enterprise impact.</h1>
        <p className="hero-text">
          AgentOS and Atlas track denial reduction, time saved, revenue impact, escalation rates, override rates, trust metrics, and review-state quality instead of relying on generic benchmark scores.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Observability summary">
        <article>
          <span>Signals</span>
          <strong>{agentOS.observabilitySignals.length}</strong>
        </article>
        <article>
          <span>Validation metrics</span>
          <strong>{atlas.continuousValidationMetrics.length}</strong>
        </article>
        <article>
          <span>Trust cards</span>
          <strong>{atlas.trustCards.length}</strong>
        </article>
        <article>
          <span>Status</span>
          <strong>validation-ready</strong>
        </article>
      </section>

      <section className="table-section" id="continuous-validation" aria-label="Continuous validation metrics">
        <div className="section-heading">
          <p className="eyebrow">Continuous Validation Engine</p>
          <h2>Workflow outcomes become the quality system.</h2>
        </div>
        {atlas.continuousValidationMetrics.map((metric) => (
          <article className="module-row" id={metric.metric.toLowerCase().replaceAll(" ", "-")} key={metric.metric}>
            <div>
              <span>metric</span>
              <h2>{metric.metric}</h2>
            </div>
            <p>{metric.measurement}</p>
            <div>
              <strong>{metric.pilotUse}</strong>
              <ul className="compact-list">
                <li>{metric.productionGate}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Observability signals">
        <div className="section-heading">
          <p className="eyebrow">Dashboard signals</p>
          <h2>Operations, safety, value, and trust signals flow into one review surface.</h2>
        </div>
        <div className="principle-grid">
          {agentOS.observabilitySignals.map((signal) => (
            <article id={signal.metric.toLowerCase().replaceAll(" ", "-")} key={signal.metric}>
              <span>{signal.metric}</span>
              <h3>{signal.purpose}</h3>
              <p>{signal.escalation}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
