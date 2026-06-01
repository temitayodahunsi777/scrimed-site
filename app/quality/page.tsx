import { getQualityGateSummary } from "../lib/qualityGates";

export default function QualityPage() {
  const summary = getQualityGateSummary();

  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/hub">Hub</a>
        <p className="eyebrow">Quality gates</p>
        <h1>SCRIMED keeps execution moving by replacing blockers with explicit, safer quality gates.</h1>
        <p className="hero-text">
          GitHub Actions remains a hardening item, while Vercel deployment, executable synthetic validation, fixture change review, synthetic workflow execution, execution-result fixtures, result validation, promotion review, governed execution contracts, deny-by-default execution endpoints, integration fixture validation, readiness checks, and integration contracts form the current active quality path.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED quality gate summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Active</span>
          <strong>{summary.active}</strong>
        </article>
        <article>
          <span>Bypassed</span>
          <strong>{summary.bypassed}</strong>
        </article>
        <article>
          <span>Synthetic checks</span>
          <strong>{summary.syntheticValidation.passedChecks}</strong>
        </article>
        <article>
          <span>Integration checks</span>
          <strong>{summary.integrationFixtureValidation.passedChecks}</strong>
        </article>
        <article>
          <span>Fixture reviews</span>
          <strong>{summary.fixtureChangeReview.approved}</strong>
        </article>
        <article>
          <span>Workflow ready</span>
          <strong>{summary.workflowExecution.ready}</strong>
        </article>
        <article>
          <span>Result fixtures</span>
          <strong>{summary.workflowExecutionResults.resultCount}</strong>
        </article>
        <article>
          <span>Result checks</span>
          <strong>{summary.workflowResultValidation.passedChecks}</strong>
        </article>
        <article>
          <span>Promotion</span>
          <strong>{summary.workflowPromotionReview.approved}</strong>
        </article>
        <article>
          <span>Contracts</span>
          <strong>{summary.workflowExecutionContracts.ready}</strong>
        </article>
        <article>
          <span>Deny stubs</span>
          <strong>{summary.workflowImplementationReadiness.ready}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="SCRIMED quality gates">
        {summary.gates.map((gate) => (
          <article className="module-row" key={gate.name}>
            <div>
              <span>{gate.state}</span>
              <h2>{gate.name}</h2>
            </div>
            <p>{gate.replacement ?? "active gate"}</p>
            <a className="module-link" href={gate.route}>{gate.role}</a>
          </article>
        ))}
      </section>
    </main>
  );
}
