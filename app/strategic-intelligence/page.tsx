import Link from "next/link";
import { getStrategicPlatformIntelligenceSummary } from "../lib/strategicPlatformIntelligence";

export const metadata = {
  title: "SCRIMED Strategic Platform Intelligence",
  description:
    "Source-informed strategic platform intelligence for SCRIMED healthcare AI infrastructure, interoperability, agents, governance, and deployment readiness."
};

export default function StrategicIntelligencePage() {
  const summary = getStrategicPlatformIntelligenceSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">Strategic Platform Intelligence</p>
        <h1>SCRIMED converts market signals into governed healthcare infrastructure build paths.</h1>
        <p className="hero-text">
          This surface records how public platform patterns translate into SCRIMED AgentOS, Atlas, interoperability,
          protected workspaces, evidence, and commercial proof without claiming partnerships, certifications, or live
          clinical execution.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.apiRoute}>
            Inspect API
          </a>
          <Link className="secondary-action" href="/agent-workspace">
            Open Agent Workspace
          </Link>
          <Link className="secondary-action" href="/interoperability">
            Review Interoperability
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Strategic intelligence summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Sources</span>
          <strong>{summary.sourceCount}</strong>
        </article>
        <article>
          <span>Patterns</span>
          <strong>{summary.patternCount}</strong>
        </article>
        <article>
          <span>Standards</span>
          <strong>{summary.standards.length}</strong>
        </article>
        <article>
          <span>Agents</span>
          <strong>{summary.agents.length}</strong>
        </article>
        <article>
          <span>Routes</span>
          <strong>{summary.routes.length}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>{summary.nextBuildStep}</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.roadmap.map((item, index) => (
            <div className="layer-row" key={item.phase}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>
                {item.phase}: {item.objective}
              </strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Strategic platform patterns">
        <div className="section-heading">
          <p className="eyebrow">Coded patterns</p>
          <h2>Source-informed ideas become SCRIMED-specific product work, proof metrics, and guardrails.</h2>
        </div>
        {summary.patterns.map((pattern) => (
          <article className="module-row" key={pattern.slug}>
            <div>
              <span>{pattern.priority}</span>
              <h2>{pattern.title}</h2>
            </div>
            <p>{pattern.productThesis}</p>
            <div>
              <strong>{pattern.scrimedImplementation}</strong>
              <ul className="compact-list">
                <li>Sources: {pattern.sourceNames.join(", ")}</li>
                <li>Agents: {pattern.agents.join(", ")}</li>
                <li>Standards: {pattern.interoperabilityStandards.join(", ")}</li>
                <li>Next: {pattern.nextBuildStep}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Source review">
        <div className="section-heading">
          <p className="eyebrow">Source review</p>
          <h2>Public sources are used as strategy inputs, not implied partnerships or copied product claims.</h2>
        </div>
        {summary.sources.map((source) => (
          <article className="module-row" key={source.name}>
            <div>
              <span>source</span>
              <h2>{source.name}</h2>
            </div>
            <p>{source.observedPattern}</p>
            <div>
              <a className="module-link" href={source.url}>
                Open source
              </a>
              <p>{source.scrimedInterpretation}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
