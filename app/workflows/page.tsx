import {
  getWorkflowExecutionSummary,
  validateWorkflowExecution
} from "../lib/workflowExecutions";

export default function WorkflowExecutionsPage() {
  const summary = getWorkflowExecutionSummary();

  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/hub">Hub</a>
        <p className="eyebrow">Workflow execution</p>
        <h1>SCRIMED stages workflow execution against synthetic fixtures before live clinical operations.</h1>
        <p className="hero-text">
          CarePath AI, DocuTwin, and TrialCore now map to governed agent workflows, synthetic fixtures, integration fixtures, quality gates, result fixtures, and Watchtower trace requirements.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Workflow execution summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Workflows</span>
          <strong>{summary.workflowCount}</strong>
        </article>
        <article>
          <span>Ready</span>
          <strong>{summary.ready}</strong>
        </article>
        <article>
          <span>Attention</span>
          <strong>{summary.attentionRequired}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="Synthetic workflow executions">
        <article className="module-row">
          <div>
            <span>result fixtures</span>
            <h2>Workflow execution results</h2>
          </div>
          <p>deterministic synthetic output evidence</p>
          <a className="module-link" href="/workflows/results">
            Review result fixtures before live workflow automation.
          </a>
        </article>
        <article className="module-row">
          <div>
            <span>promotion review</span>
            <h2>Workflow promotion review</h2>
          </div>
          <p>synthetic-only approval before production automation</p>
          <a className="module-link" href="/workflows/promotion-review">
            Review promotion records and retained blocked actions.
          </a>
        </article>
        {summary.workflows.map((workflow) => {
          const readiness = validateWorkflowExecution(workflow);

          return (
            <article className="module-row" key={workflow.slug}>
              <div>
                <span>{readiness.status}</span>
                <h2>{workflow.name}</h2>
              </div>
              <p>{workflow.module}</p>
              <a className="module-link" href={workflow.route}>
                {readiness.passed} checks passed, {readiness.failed} checks failed
              </a>
            </article>
          );
        })}
      </section>
    </main>
  );
}
