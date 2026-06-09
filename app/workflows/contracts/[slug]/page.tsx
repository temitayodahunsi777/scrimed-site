import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getWorkflowExecutionContractBySlug,
  getWorkflowExecutionContracts
} from "../../../lib/workflowExecutionContracts";

export function generateStaticParams() {
  return getWorkflowExecutionContracts().map((contract) => ({
    slug: contract.slug
  }));
}

export default async function WorkflowExecutionContractDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const contract = getWorkflowExecutionContractBySlug(slug);

  if (!contract) {
    notFound();
  }

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/workflows/contracts">Contracts</Link>
        <p className="eyebrow">{contract.module} execution contract</p>
        <h1>{contract.name}</h1>
        <p className="hero-text">{contract.promotionBoundary}</p>
      </section>

      <section className="section-band hub-summary" aria-label="Workflow execution contract summary">
        <article>
          <span>Status</span>
          <strong>{contract.status}</strong>
        </article>
        <article>
          <span>Version</span>
          <strong>{contract.contractVersion}</strong>
        </article>
        <article>
          <span>Mode</span>
          <strong>{contract.runtimeMode}</strong>
        </article>
        <article>
          <span>Method</span>
          <strong>{contract.method}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Request schema</p>
          <h2>{contract.plannedExecutionEndpoint}</h2>
        </div>
        <div className="layer-list">
          {contract.requestSchema.map((field, index) => (
            <div className="layer-row" key={field}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{field}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Response schema</p>
          <h2>Reviewable synthetic execution result.</h2>
        </div>
        <div className="layer-list">
          {contract.responseSchema.map((field, index) => (
            <div className="layer-row" key={field}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{field}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band principle-grid" aria-label="Workflow execution contract gates">
        {contract.approvalGates.map((gate) => (
          <article key={gate}>
            <h3>{gate}</h3>
            <p>Required before the contract can support a governed execution API implementation.</p>
          </article>
        ))}
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Denied capabilities</p>
          <h2>{contract.humanReview}</h2>
        </div>
        <div className="layer-list">
          {contract.deniedCapabilities.map((capability, index) => (
            <div className="layer-row" key={capability}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{capability}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
