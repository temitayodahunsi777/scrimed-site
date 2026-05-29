import { getHubSummary, hubModules, hubSignals } from "../lib/scrimedHub";

export default function HubPage() {
  const summary = getHubSummary();

  return (
    <main>
      <section className="page-hero hub-hero">
        <a className="back-link" href="/">SCRIMED</a>
        <p className="eyebrow">SCRIMED OS Hub</p>
        <h1>A command surface for platform readiness, module state, and trust signals.</h1>
        <p className="hero-text">
          The OS Hub gives SCRIMED a single operational view of product modules, deployment state, readiness signals, and the next integration frontier.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED OS Hub summary">
        <article>
          <span>Hub status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Modules</span>
          <strong>{summary.moduleCount}</strong>
        </article>
        <article>
          <span>Staged</span>
          <strong>{summary.stagedModules}</strong>
        </article>
        <article>
          <span>Foundation</span>
          <strong>{summary.activeModules}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Operating signals</p>
          <h2>What the hub is watching now.</h2>
        </div>
        <div className="layer-list">
          {hubSignals.map((signal, index) => (
            <div className="layer-row" key={signal.name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{signal.name}: {signal.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Hub module control surface">
        {hubModules.map((module) => (
          <article className="module-row" key={module.name}>
            <div>
              <span>{module.phase}</span>
              <h2>{module.name}</h2>
            </div>
            <p>{module.owner}</p>
            <a className="module-link" href={module.route}>{module.objective}</a>
          </article>
        ))}
      </section>
    </main>
  );
}
