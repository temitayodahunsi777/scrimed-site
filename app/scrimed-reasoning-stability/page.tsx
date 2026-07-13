import Link from "next/link";
import { getScrimedReasoningStabilitySummary } from "../lib/scrimedReasoningStability";

export const metadata = {
  title: "SCRIMED Reasoning Stability",
  description:
    "Synthetic-only SCRIMED Reasoning Stability layer for loop detection, repeated span checks, consistency, hallucination-risk placeholders, retry recommendations, and safety status."
};

export default function ScrimedReasoningStabilityPage() {
  const summary = getScrimedReasoningStabilitySummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/scrimed-agent-governance">
          Agent Governance
        </Link>
        <p className="eyebrow">SCRIMED CODE pt. 4</p>
        <h1>Reasoning Stability Layer</h1>
        <p className="hero-text">{summary.boundary}</p>
        <div className="hero-actions" aria-label="SCRIMED Reasoning Stability actions">
          <Link href={summary.apiRoute}>Inspect API</Link>
          <Link href={summary.briefRoute}>Download Brief</Link>
          <Link href="/clinical-robustness-lab">Robustness Lab</Link>
          <Link href="/scrimed-intelligence-platform">Intelligence Platform</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED Reasoning Stability summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Detectors</span>
          <strong>{summary.detectors.length}</strong>
        </article>
        <article>
          <span>Safety</span>
          <strong>{summary.sampleResult.safetyStatus}</strong>
        </article>
        <article>
          <span>Confidence</span>
          <strong>{summary.sampleResult.confidenceCategory}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Reasoning result">
        <div>
          <p className="eyebrow">Sample Result</p>
          <h2>{summary.sampleResult.retryRecommendation}</h2>
        </div>
        <div>
          <p>Self-consistency: {summary.sampleResult.selfConsistencyCheck}</p>
          <p>Repeated span detected: {summary.sampleResult.repeatedSpanDetected ? "yes" : "no"}</p>
          <p>Clinical hallucination risk: {summary.sampleResult.clinicalHallucinationRisk}</p>
          <p>Audit hash: {summary.sampleResult.auditHash}</p>
        </div>
      </section>

      <section className="table-section" aria-label="Reasoning Stability detectors">
        <div className="section-heading">
          <p className="eyebrow">Detectors</p>
          <h2>SCRIMED blocks or escalates unstable outputs before they become workflow evidence.</h2>
        </div>
        {summary.detectors.map((detector) => (
          <article className="module-row" key={detector}>
            <div>
              <span>active</span>
              <h2>{detector}</h2>
            </div>
            <p>Metadata-only stability signal for synthetic evaluation and reviewer escalation.</p>
            <div>
              <strong>Boundary</strong>
              <p>No clinical truth claim or autonomous clinical authority.</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
