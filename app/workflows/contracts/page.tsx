import { getWorkflowExecutionContractSummary } from "../../lib/workflowExecutionContracts";

export default function WorkflowExecutionContractsPage() {
  const summary = getWorkflowExecutionContractSummary();

  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/workflows">Workflows</a>
        <p className="eyebrow">Execution contracts</p>
        <h1>Governed execution API contracts define the next boundary before live automation.</h1>
        <p className="hero-text">
          Each staged workflow now has a synthetic-only execution contract that describes request shape, response shape, preconditions, audit events, observability signals, and denied capabilities before implementation.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Workflow execution contract summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Contracts</span>
          <strong>{summary.contractCount}</strong>
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

      <section className="table-section" aria-label="Governed workflow execution contracts">
        {summary.contracts.map((contract) => (
          <article className="module-row" key={contract.slug}>
            <div>
              <span>{contract.status}</span>
              <h2>{contract.name}</h2>
            </div>
            <p>{contract.runtimeMode}</p>
            <a className="module-link" href={contract.route}>
              {contract.requestSchema.length} request fields, {contract.responseSchema.length} response fields
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
