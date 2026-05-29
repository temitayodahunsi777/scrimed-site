import { qualityGates } from "../lib/qualityGates";

export default function QualityPage() {
  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/hub">Hub</a>
        <p className="eyebrow">Quality gates</p>
        <h1>SCRIMED keeps execution moving by replacing blockers with explicit, safer quality gates.</h1>
        <p className="hero-text">
          GitHub Actions remains a hardening item, while Vercel deployment, executable synthetic validation, readiness checks, and integration contracts form the current active quality path.
        </p>
      </section>

      <section className="table-section" aria-label="SCRIMED quality gates">
        {qualityGates.map((gate) => (
          <article className="module-row" key={gate.name}>
            <div>
              <span>{gate.state}</span>
              <h2>{gate.name}</h2>
            </div>
            <p>{gate.replacement ?? "active gate"}</p>
            <a className="module-link" href={gate.route}>{gate.role}</a>
          </article>
        ))}
      </section>
    </main>
  );
}
