import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getWorkflowExecutionBySlug,
  getWorkflowExecutionReadinessBySlug,
  workflowExecutions
} from "../../lib/workflowExecutions";
import { getWorkflowExecutionResultBySlug } from "../../lib/workflowExecutionResults";
import { getWorkflowPromotionReviewBySlug } from "../../lib/workflowPromotionReviews";
import { validateWorkflowResultBySlug } from "../../lib/workflowResultValidation";

export function generateStaticParams() {
  return workflowExecutions.map((workflow) => ({
    slug: workflow.slug
  }));
}

export default async function WorkflowExecutionDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workflow = getWorkflowExecutionBySlug(slug);
  const readiness = getWorkflowExecutionReadinessBySlug(slug);
  const result = getWorkflowExecutionResultBySlug(slug);
  const resultValidation = validateWorkflowResultBySlug(slug);
  const promotionReview = getWorkflowPromotionReviewBySlug(slug);

  if (!workflow || !readiness) {
    notFound();
  }

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/workflows">Workflows</Link>
        <p className="eyebrow">{workflow.module} execution</p>
        <h1>{workflow.name}</h1>
        <p className="hero-text">{workflow.objective}</p>
      </section>

      <section className="section-band hub-summary" aria-label="Workflow readiness summary">
        <article>
          <span>Status</span>
          <strong>{readiness.status}</strong>
        </article>
        <article>
          <span>Agent</span>
          <strong>{workflow.agentWorkflowSlug}</strong>
        </article>
        <article>
          <span>Passed</span>
          <strong>{readiness.passed}</strong>
        </article>
        <article>
          <span>Failed</span>
          <strong>{readiness.failed}</strong>
        </article>
        <article>
          <span>Result</span>
          <strong>{result?.decisionState ?? "missing"}</strong>
        </article>
        <article>
          <span>Validation</span>
          <strong>{resultValidation?.status ?? "missing"}</strong>
        </article>
        <article>
          <span>Promotion</span>
          <strong>{promotionReview?.status ?? "missing"}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Execution steps</p>
          <h2>Synthetic-only workflow sequence.</h2>
        </div>
        <div className="layer-list">
          {workflow.executionSteps.map((step, index) => (
            <div className="layer-row" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band principle-grid" aria-label="Workflow readiness checks">
        {readiness.checks.map((check) => (
          <article key={check.id}>
            <h3>{check.label}</h3>
            <p>{check.status}: {check.detail}</p>
          </article>
        ))}
      </section>

      {result ? (
        <section className="section-band split-band">
          <div>
            <p className="eyebrow">Result fixture</p>
            <h2>{result.resultId}</h2>
            <p className="section-copy">{result.reviewState}</p>
          </div>
          <div className="layer-list">
            {result.outputSignals.map((signal, index) => (
              <div className="layer-row" key={signal}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{signal}</strong>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {resultValidation ? (
        <section className="section-band principle-grid" aria-label="Workflow result validation checks">
          {resultValidation.checks.map((check) => (
            <article key={check.id}>
              <h3>{check.label}</h3>
              <p>{check.status}: {check.detail}</p>
            </article>
          ))}
        </section>
      ) : null}

      {promotionReview ? (
        <section className="section-band split-band">
          <div>
            <p className="eyebrow">Promotion review</p>
            <h2>{promotionReview.status}</h2>
            <p className="section-copy">{promotionReview.reviewNote}</p>
          </div>
          <div className="layer-list">
            {promotionReview.requiredBeforePromotion.map((requirement, index) => (
              <div className="layer-row" key={requirement}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{requirement}</strong>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Human review</p>
          <h2>{workflow.humanReview}</h2>
        </div>
        <div className="layer-list">
          {workflow.prohibitedActions.map((action, index) => (
            <div className="layer-row" key={action}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{action}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
