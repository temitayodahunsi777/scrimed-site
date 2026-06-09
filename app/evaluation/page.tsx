import Link from "next/link";
import AgentEvaluationWorkspace from "./AgentEvaluationWorkspace";
import { getAgentEvaluationWorkspaceSummary } from "../lib/agentEvaluationWorkspace";

export const metadata = {
  title: "SCRIMED AgentOS Evaluation Workspace",
  description:
    "Generate governed SCRIMED AgentOS synthetic evaluations with Atlas Trust Cards, document intelligence, audit previews, and observability signals."
};

export default function EvaluationPage() {
  const summary = getAgentEvaluationWorkspaceSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">AgentOS Evaluation Workspace</p>
        <h1>Turn a synthetic healthcare workflow packet into an AgentOS plan and Atlas Trust Card.</h1>
        <p className="hero-text">
          This workspace demonstrates the sellable SCRIMED product loop: synthetic packet intake, structural
          document understanding, planner/router orchestration, TrustQA, human approval checkpoints, audit
          preview, and observability-ready outcomes.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="AgentOS evaluation workspace summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Scenarios</span>
          <strong>{summary.scenarios.length}</strong>
        </article>
        <article>
          <span>Trust Cards</span>
          <strong>{summary.trustCards.length}</strong>
        </article>
        <article>
          <span>API</span>
          <strong>{summary.apiRoute}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>Synthetic packets only. Production execution stays denied.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {[
            "Synthetic document packet accepted",
            "Structural parser assigned before LLM extraction",
            "AgentOS task plan generated",
            "Atlas Trust Card attached",
            "Observability and audit preview created"
          ].map((step, index) => (
            <div className="layer-row" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band evaluation-band" aria-label="Interactive AgentOS evaluation">
        <AgentEvaluationWorkspace summary={summary} />
      </section>
    </main>
  );
}
