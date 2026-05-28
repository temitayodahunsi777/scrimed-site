const trustSignals = [
  "workflow quality",
  "model behavior drift",
  "latency and cost patterns",
  "approval and override patterns",
  "runtime traces",
  "safety signals"
];

const operatingPrinciples = [
  "Healthcare AI needs continuous monitoring after deployment, not only pre-launch evaluation.",
  "Every workflow should expose the signals needed to explain performance, safety, and operational cost.",
  "Trust infrastructure should be built alongside product modules, not patched in after scale."
];

export default function TrustPage() {
  return (
    <main>
      <section className="page-hero trust-hero">
        <a className="back-link" href="/">SCRIMED</a>
        <p className="eyebrow">Watchtower trust layer</p>
        <h1>Trust is treated as core infrastructure for SCRIMED, not a compliance afterthought.</h1>
        <p className="hero-text">
          Watchtower is the monitoring layer for regression detection, safety signals, drift, runtime traces, and deployment scorecards across healthcare AI workflows.
        </p>
      </section>

      <section className="split-band section-band">
        <div>
          <p className="eyebrow">Signals</p>
          <h2>What Watchtower is designed to observe.</h2>
        </div>
        <div className="layer-list">
          {trustSignals.map((signal, index) => (
            <div className="layer-row" key={signal}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{signal}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band principle-grid" aria-label="Trust principles">
        {operatingPrinciples.map((principle) => (
          <article key={principle}>
            <p>{principle}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
