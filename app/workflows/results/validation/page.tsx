import { getWorkflowResultValidationResults } from "../../../lib/workflowResultValidation";

export default function WorkflowResultValidationPage() {
  const summary = getWorkflowResultValidationResults();

  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/workflows/results">Results</a>
        <p className="eyebrow">Result validation</p>
        <h1>Workflow result fixtures are validated against expected outputs, traces, and blocked actions.</h1>
        <p className="hero-text">
          SCRIMED compares every staged workflow against its deterministic result fixture so output signals, Watchtower trace steps, review state, and prohibited actions cannot drift silently.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Workflow result validation summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Results</span>
          <strong>{summary.passedResults}</strong>
        </article>
        <article>
          <span>Checks</span>
          <strong>{summary.passedChecks}</strong>
        </article>
        <article>
          <span>Failed</span>
          <strong>{summary.failedChecks}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="Workflow result validation records">
        {summary.results.map((result) => (
          <article className="module-row" key={result.workflowSlug}>
            <div>
              <span>{result.status}</span>
              <h2>{result.workflowSlug}</h2>
            </div>
            <p>{result.diff.fingerprint}</p>
            <a className="module-link" href={result.resultRoute ?? result.workflowRoute}>
              {result.passed} checks passed, {result.failed} checks failed
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
