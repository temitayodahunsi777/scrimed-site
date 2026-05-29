import { getEventSummary } from "../../lib/hubOperations";

export default function HubEventsPage() {
  const summary = getEventSummary();

  return (
    <main>
      <section className="page-hero hub-hero">
        <a className="back-link" href="/hub">Hub</a>
        <p className="eyebrow">Event console</p>
        <h1>Execution events show how the SCRIMED foundation has been shaped and verified.</h1>
        <p className="hero-text">
          This view keeps repository, product, operations, integration, and deployment milestones visible from the Hub.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Event summary">
        <article>
          <span>Service</span>
          <strong>{summary.service}</strong>
        </article>
        <article>
          <span>Events</span>
          <strong>{summary.count}</strong>
        </article>
        <article>
          <span>Gate</span>
          <strong>Vercel</strong>
        </article>
        <article>
          <span>Clinical data</span>
          <strong>Gated</strong>
        </article>
      </section>

      <section className="table-section" aria-label="Hub events">
        {summary.events.map((event) => (
          <article className="module-row" key={event.id}>
            <div>
              <span>{event.type}</span>
              <h2>{event.id}</h2>
            </div>
            <p>{event.date}</p>
            <strong>{event.summary}</strong>
          </article>
        ))}
      </section>
    </main>
  );
}
