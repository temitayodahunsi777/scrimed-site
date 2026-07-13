import Link from "next/link";
import { getScrimedLLMOpsObservabilitySummary } from "../lib/scrimedLLMOpsObservability";

export const metadata = {
  title: "SCRIMED LLMOps Observability",
  description:
    "Synthetic-only SCRIMED LLMOps Observability layer for trace, model, latency, cost, token, safety, policy, benchmark, and rollback metadata."
};

export default function ScrimedLLMOpsObservabilityPage() {
  const summary = getScrimedLLMOpsObservabilitySummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/observability">
          Observability
        </Link>
        <p className="eyebrow">SCRIMED CODE pt. 4</p>
        <h1>LLMOps Observability Layer</h1>
        <p className="hero-text">{summary.boundary}</p>
        <div className="hero-actions" aria-label="SCRIMED LLMOps Observability actions">
          <Link href={summary.apiRoute}>Inspect API</Link>
          <Link href={summary.briefRoute}>Download Brief</Link>
          <Link href="/scrimed-agent-governance">Agent Governance</Link>
          <Link href="/scrimed-compute-fabric">Compute Fabric</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED LLMOps Observability summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Traces</span>
          <strong>{summary.traceCount}</strong>
        </article>
        <article>
          <span>Tokens</span>
          <strong>{summary.aggregate.totalTokenEstimate}</strong>
        </article>
        <article>
          <span>Cost</span>
          <strong>${summary.aggregate.totalCostEstimateUsd}</strong>
        </article>
        <article>
          <span>Safety events</span>
          <strong>{summary.aggregate.safetyEventCount}</strong>
        </article>
        <article>
          <span>Production ready</span>
          <strong>{summary.productionReadiness ? "yes" : "no"}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="LLMOps traces">
        <div className="section-heading">
          <p className="eyebrow">Trace Metadata</p>
          <h2>Every synthetic model or agent run gets cost, safety, benchmark, and rollback metadata.</h2>
        </div>
        {summary.traces.map((trace) => (
          <article className="module-row" key={trace.traceId}>
            <div>
              <span>{trace.policyDecision}</span>
              <h2>{trace.traceId}</h2>
            </div>
            <p>{trace.agentId} using {trace.modelId}</p>
            <div>
              <strong>{trace.rollbackReadiness}</strong>
              <ul className="compact-list">
                <li>Latency: {trace.latencyMs} ms</li>
                <li>Cost estimate: ${trace.costEstimateUsd}</li>
                <li>Token estimate: {trace.tokenEstimate}</li>
                <li>Benchmark: {trace.benchmarkStatus}</li>
                <li>Hash: {trace.traceHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
