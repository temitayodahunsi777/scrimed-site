const capabilities = [
  "Patient intake support",
  "Triage signal organization",
  "Care navigation logic",
  "Pathway coordination views"
];

export default function CarePathPage() {
  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/platform">Platform</a>
        <p className="eyebrow">CarePath AI</p>
        <h1>Navigation intelligence for intake, triage, routing, and care pathway coordination.</h1>
        <p className="hero-text">
          CarePath AI is designed to help healthcare teams organize patient needs, route workflows, and reduce friction across care journeys.
        </p>
      </section>
      <section className="section-band principle-grid">
        {capabilities.map((capability) => (
          <article key={capability}>
            <h3>{capability}</h3>
            <p>Structured for operational workflows and future interoperability with care systems.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
