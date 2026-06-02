import { getAgentOSSummary } from "../lib/agentOS";
import { getAtlasIntelligenceCoreSummary } from "../lib/atlasIntelligenceCore";

export default function AuditPage() {
  const agentOS = getAgentOSSummary();
  const atlas = getAtlasIntelligenceCoreSummary();

  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/agents">AgentOS</a>
        <p className="eyebrow">Audit and governance layer</p>
        <h1>Every agent, source, prompt, connector, approval, and exception needs a trace.</h1>
        <p className="hero-text">
          SCRIMED audit surfaces are metadata-first and synthetic-safe today, with durable audit persistence required before production healthcare execution.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Audit summary">
        <article>
          <span>Audit channels</span>
          <strong>{agentOS.auditChannels.length}</strong>
        </article>
        <article>
          <span>AI assets</span>
          <strong>{atlas.governanceLayer.aiAssetRegistry.length}</strong>
        </article>
        <article>
          <span>Approvals</span>
          <strong>{agentOS.humanApprovalCheckpoints.length}</strong>
        </article>
        <article>
          <span>Status</span>
          <strong>audit-ready</strong>
        </article>
      </section>

      <section className="table-section" aria-label="Audit channels">
        {agentOS.auditChannels.map((channel) => (
          <article className="module-row" id={channel.channel.toLowerCase().replaceAll(" ", "-")} key={channel.channel}>
            <div>
              <span>audit</span>
              <h2>{channel.channel}</h2>
            </div>
            <p>{channel.capturePolicy}</p>
            <div>
              <strong>{channel.retentionPosture}</strong>
              <ul className="compact-list">
                {channel.eventTypes.map((event) => (
                  <li key={event}>{event}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" id="governance" aria-label="AI Asset Registry">
        <div className="section-heading">
          <p className="eyebrow">AI Asset Registry</p>
          <h2>Detect shadow AI across tools, models, prompts, integrations, workflows, and knowledge sources.</h2>
        </div>
        {atlas.governanceLayer.aiAssetRegistry.map((asset) => (
          <article className="module-row" key={asset.id}>
            <div>
              <span>{asset.type}</span>
              <h2>{asset.asset}</h2>
            </div>
            <p>{asset.owner}. Status: {asset.status}</p>
            <div>
              <strong>Shadow AI signals</strong>
              <ul className="compact-list">
                {asset.shadowAiSignals.map((signal) => (
                  <li key={signal}>{signal}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Human approval checkpoints">
        <div className="section-heading">
          <p className="eyebrow">Human approval checkpoints</p>
          <h2>Human review is a runtime control, not a final-page disclaimer.</h2>
        </div>
        <div className="principle-grid">
          {agentOS.humanApprovalCheckpoints.map((checkpoint) => (
            <article key={checkpoint.checkpoint}>
              <span>{checkpoint.owner}</span>
              <h3>{checkpoint.checkpoint}</h3>
              <p>{checkpoint.trigger}</p>
              <ul className="compact-list">
                <li>{checkpoint.requiredBefore}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
