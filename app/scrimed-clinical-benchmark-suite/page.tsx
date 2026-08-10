import Link from "next/link";
import { getScrimedClinicalBenchmarkSuiteSummary } from "../lib/scrimedClinicalBenchmarkSuite";

export const metadata = {
  title: "SCRIMED Clinical Benchmark Suite",
  description:
    "Synthetic-only SCRIMED Clinical Benchmark Suite across prior authorization, documentation, coding, specialties, interoperability, education, evidence, trials, and compliance."
};

export default function ScrimedClinicalBenchmarkSuitePage() {
  const summary = getScrimedClinicalBenchmarkSuiteSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/clinical-robustness-lab">
          Robustness Lab
        </Link>
        <p className="eyebrow">SCRIMED CODE pt. 4</p>
        <h1>Clinical Benchmark Suite</h1>
        <p className="hero-text">{summary.boundary}</p>
        <div className="hero-actions" aria-label="SCRIMED Clinical Benchmark Suite actions">
          <Link href={summary.apiRoute}>Inspect API</Link>
          <Link href={summary.briefRoute}>Download Brief</Link>
          <Link href="/scrimed-reasoning-stability">Reasoning Stability</Link>
          <Link href="/scrimed-hybrid-retrieval">Hybrid Retrieval</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED Clinical Benchmark Suite summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Benchmarks</span>
          <strong>{summary.benchmarkCount}</strong>
        </article>
        <article>
          <span>High risk</span>
          <strong>{summary.highRiskCount}</strong>
        </article>
        <article>
          <span>Human review</span>
          <strong>{summary.humanReviewerRequiredCount}</strong>
        </article>
        <article>
          <span>Worst-cell gate</span>
          <strong>{summary.domainStressGate.decision}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Worst material cell release gate">
        <div>
          <p className="eyebrow">Domain Stress Matrix</p>
          <h2>The weakest material subgroup controls release.</h2>
          <p>
            Global benchmark averages cannot override a sparse, failed, or unreviewed material cell.
            Synthetic evaluation status never grants clinical authority.
          </p>
        </div>
        <div>
          <span>{summary.domainStressGate.releaseBasis}</span>
          <ul className="compact-list">
            <li>Decision: {summary.domainStressGate.decision}</li>
            <li>Worst cell: {summary.domainStressGate.worstMaterialCell?.cellId ?? "none"}</li>
            <li>Material cells: {summary.domainStressGate.summary.material}</li>
            <li>Sparse cells: {summary.domainStressGate.summary.sparse}</li>
            <li>Clinical authority: disabled</li>
          </ul>
        </div>
      </section>

      <section className="table-section" aria-label="Cell-specific model routing eligibility">
        <div className="section-heading">
          <p className="eyebrow">Internal benchmark card</p>
          <h2>Model authority is earned cell by cell.</h2>
          <p>{summary.benchmarkCard.humanReadableSummary}</p>
        </div>
        {summary.benchmarkCard.routingDecisions.map((decision) => (
          <article className="module-row" key={decision.cellId}>
            <div>
              <span>{decision.status}</span>
              <h2>{decision.cellId}</h2>
            </div>
            <p>{decision.reason}</p>
            <div>
              <strong>
                Eligible models: {decision.eligibleModelIds.join(", ") || "none"}
              </strong>
              <ul className="compact-list">
                <li>Human review: {decision.humanReviewRequired ? "required" : "retained by workflow policy"}</li>
                <li>Clinical authority: disabled</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Clinical Benchmark domains">
        <div className="section-heading">
          <p className="eyebrow">Benchmark Domains</p>
          <h2>Benchmarks measure structured readiness, not clinical validation.</h2>
        </div>
        {summary.benchmarks.map((benchmark) => (
          <article className="module-row" key={benchmark.domain}>
            <div>
              <span>{benchmark.riskLevel}</span>
              <h2>{benchmark.domain}</h2>
            </div>
            <p>{benchmark.task}</p>
            <div>
              <strong>{benchmark.humanReviewerRequired ? "Reviewer required" : "Reviewer optional"}</strong>
              <ul className="compact-list">
                <li>{benchmark.passCriteria}</li>
                <li>{benchmark.exampleExpectedOutputBoundary}</li>
                <li>Hash: {benchmark.benchmarkHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
