import { getFixtureChangeReviewSummary } from "../../lib/fixtureChangeReviews";

export default function FixtureChangeReviewPage() {
  const summary = getFixtureChangeReviewSummary();

  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/quality">Quality</a>
        <p className="eyebrow">Fixture change review</p>
        <h1>Expected-output fingerprints require approval before workflows depend on them.</h1>
        <p className="hero-text">
          SCRIMED tracks integration and synthetic fixture fingerprints so request signals, expected outputs, traces, prohibited claims, and review requirements cannot change silently.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Fixture change review summary">
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

      <section className="table-section" aria-label="Fixture change review records">
        {summary.reviews.map((review) => (
          <article className="module-row" key={review.id}>
            <div>
              <span>{review.status}</span>
              <h2>{review.fixtureId}</h2>
            </div>
            <p>{review.fingerprint}</p>
            <a className="module-link" href={review.fixtureRoute}>
              {review.fixtureType} fixture reviewed by {review.reviewerRole}
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
