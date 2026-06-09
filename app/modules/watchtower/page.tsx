import Link from "next/link";
const capabilities = [
  "Regression monitoring",
  "Model drift detection",
  "Runtime trace review",
  "Safety and cost signal tracking"
];

export default function WatchtowerPage() {
  return (
    <main>
      <section className="page-hero trust-hero">
        <Link className="back-link" href="/trust">Trust</Link>
        <p className="eyebrow">Watchtower</p>
        <h1>Continuous reliability infrastructure for healthcare AI behavior after deployment.</h1>
        <p className="hero-text">
          Watchtower is the SCRIMED trust layer for monitoring AI behavior, workflow quality, safety signals, cost, latency, and deployment regressions.
        </p>
      </section>
      <section className="section-band principle-grid">
        {capabilities.map((capability) => (
          <article key={capability}>
            <h3>{capability}</h3>
            <p>Built to make AI system behavior observable, comparable, and governable over time.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
