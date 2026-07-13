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
