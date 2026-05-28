const capabilities = [
  "Trial discovery workflows",
  "Eligibility signal mapping",
  "Patient-to-study matching",
  "Research operations support"
];

export default function TrialCorePage() {
  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/platform">Platform</a>
        <p className="eyebrow">TrialCore</p>
        <h1>Clinical trial discovery and matching infrastructure for research operations.</h1>
        <p className="hero-text">
          TrialCore is the SCRIMED module for connecting patient signals to research opportunities through structured, auditable matching workflows.
        </p>
      </section>
      <section className="section-band principle-grid">
        {capabilities.map((capability) => (
          <article key={capability}>
            <h3>{capability}</h3>
            <p>Designed to support research teams before deeper data integration and validation.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
