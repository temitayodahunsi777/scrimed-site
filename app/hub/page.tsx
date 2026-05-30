import { getHubSummary, hubModules, hubSignals } from "../lib/scrimedHub";

const consoleViews = [
  {
    name: "Readiness",
    href: "/hub/readiness",
    summary: "Review foundation checks, non-blocking watches, and gated clinical integrations."
  },
  {
    name: "Context",
    href: "/operating-context",
    summary: "Review SCRIMED's mission, principles, operating models, and decision framework."
  },
  {
    name: "Agents",
    href: "/agents",
    summary: "Review governed agent workflows, permissions, audit events, and human-review boundaries."
  },
  {
    name: "Quality",
    href: "/quality",
    summary: "Inspect active quality gates, managed bypasses, and replacement validation paths."
  },
  {
    name: "Synthetic",
    href: "/synthetic/validation",
    summary: "Review deterministic synthetic checks before any live clinical connector is introduced."
  },
  {
    name: "Events",
    href: "/hub/events",
    summary: "Track repository, product, operations, integration, and deployment milestones."
  },
  {
    name: "Contracts",
    href: "/integrations",
    summary: "Inspect integration contracts before any live clinical data connector is implemented."
  },
  {
    name: "Fixtures",
    href: "/integrations/fixture-validation",
    summary: "Review integration fixture coverage, safeguard mapping, and expected-output fingerprints."
  }
];

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

      <section className="section-band principle-grid" aria-label="Hub console views">
        {consoleViews.map((view) => (
          <article key={view.name}>
            <h3>{view.name}</h3>
            <p>{view.summary}</p>
            <a className="module-link" href={view.href}>Open {view.name}</a>
          </article>
        ))}
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
