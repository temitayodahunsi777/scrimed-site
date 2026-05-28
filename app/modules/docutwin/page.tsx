const capabilities = [
  "Structured note generation",
  "Conversation-to-document workflows",
  "Governed documentation review",
  "Operational documentation templates"
];

export default function DocuTwinPage() {
  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/platform">Platform</a>
        <p className="eyebrow">DocuTwin</p>
        <h1>Medical documentation workflows that turn clinical context into reviewable outputs.</h1>
        <p className="hero-text">
          DocuTwin is the documentation system for SCRIMED, designed to support structured clinical documents while preserving review, control, and accountability.
        </p>
      </section>
      <section className="section-band principle-grid">
        {capabilities.map((capability) => (
          <article key={capability}>
            <h3>{capability}</h3>
            <p>Built for controlled documentation automation before any production clinical use.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
