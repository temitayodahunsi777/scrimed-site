import Link from "next/link";
const capabilities = [
  "Patient context summarization",
  "Decision support signal surfacing",
  "Documentation assistance",
  "Clinical workflow handoff support"
];

export default function ClinicalCopilotPage() {
  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/platform">Platform</Link>
        <p className="eyebrow">Clinical Copilot</p>
        <h1>Clinician-facing intelligence for summarization, decision support, and care team workflow.</h1>
        <p className="hero-text">
          Clinical Copilot is the SCRIMED module focused on reducing cognitive and administrative load while keeping clinical judgment at the center of the workflow.
        </p>
      </section>
      <section className="section-band principle-grid">
        {capabilities.map((capability) => (
          <article key={capability}>
            <h3>{capability}</h3>
            <p>Designed as a governed workflow capability for staged clinical validation.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
