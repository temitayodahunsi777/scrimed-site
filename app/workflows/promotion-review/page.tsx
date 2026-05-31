import { getWorkflowPromotionReviewSummary } from "../../lib/workflowPromotionReviews";

export default function WorkflowPromotionReviewPage() {
  const summary = getWorkflowPromotionReviewSummary();

  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/workflows">Workflows</a>
        <p className="eyebrow">Promotion review</p>
        <h1>Workflow promotion is approved for synthetic staging only until production gates are complete.</h1>
        <p className="hero-text">
          Each staged workflow now has a promotion review record that keeps live automation, production connector use, and clinical actions blocked until quality, privacy, security, and governance approval are explicit.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Workflow promotion review summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Reviews</span>
          <strong>{summary.reviewCount}</strong>
        </article>
        <article>
          <span>Approved</span>
          <strong>{summary.approved}</strong>
        </article>
        <article>
          <span>Attention</span>
          <strong>{summary.attentionRequired}</strong>
        </article>
      </section>

      <section className="table-section" aria-label="Workflow promotion review records">
        {summary.reviews.map((review) => (
          <article className="module-row" key={review.id}>
            <div>
              <span>{review.status}</span>
              <h2>{review.workflowSlug}</h2>
            </div>
            <p>{review.reviewerRole}</p>
            <a className="module-link" href={review.workflowRoute}>
              {review.blockedActions.length} blocked actions retained before promotion
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
