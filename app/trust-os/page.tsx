import Link from "next/link";
import TrustOSEvaluationWorkspace from "./TrustOSEvaluationWorkspace";
import { getTrustOSSummary } from "../lib/trustOS";

export const metadata = {
  title: "SCRIMED TrustOS",
  description:
    "Evaluate synthetic healthcare agent requests through SCRIMED TrustOS policy, PHI Shield, Agent Firewall, model routing, explainability, and Clinical Trace controls."
};

export default function TrustOSPage() {
  const summary = getTrustOSSummary();

  return (
    <main>
      <section className="page-hero trust-hero">
        <Link className="back-link" href="/trust">Trust</Link>
        <p className="eyebrow">Executable healthcare AI governance</p>
        <h1>TrustOS governs every agent request before tools, models, or workflows can act.</h1>
        <p className="hero-text">
          Evaluate a synthetic request through PHI Shield, Agent Firewall, Clinical Guardian, policy controls,
          vendor-neutral model routing, human approval, explainability, and metadata-only Clinical Trace generation.
        </p>
        <div className="hero-actions">
          <a className="secondary-action" href="/api/trust-os">Inspect TrustOS API</a>
          <Link className="secondary-action" href="/evaluation">Run AgentOS Evaluation</Link>
          <Link className="secondary-action" href="/trust-center">Open Trust Center</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="TrustOS summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Controls</span>
          <strong>{summary.components.length}</strong>
        </article>
        <article>
          <span>Model profiles</span>
          <strong>{summary.modelRouteProfiles.length}</strong>
        </article>
        <article>
          <span>Decision states</span>
          <strong>{summary.decisionStates.length}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Trusted automation boundary</p>
          <h2>High uncertainty escalates. Unsafe execution is denied.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.components.map((component, index) => (
            <div className="layer-row" key={component.name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{component.name}: {component.purpose}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band evaluation-band" aria-label="Interactive TrustOS evaluation">
        <TrustOSEvaluationWorkspace summary={summary} />
      </section>
    </main>
  );
}
