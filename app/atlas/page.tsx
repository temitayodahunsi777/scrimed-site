import { operatingContext } from "../lib/operatingContext";

const atlas = operatingContext.operatingModels.find((model) => model.name === "SCRIMED Atlas");

export default function AtlasPage() {
  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/operating-context">Operating Context</a>
        <p className="eyebrow">SCRIMED Atlas</p>
        <h1>Enterprise healthcare operations, governance, trust, interoperability, and ROI.</h1>
        <p className="hero-text">
          {atlas?.role} Atlas is designed for hospitals, governments, payers, and large healthcare organizations that need compliance-centered transformation without isolated point solutions.
        </p>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Enterprise boundary</p>
          <h2>{atlas?.boundary}</h2>
          <p className="section-copy">
            Atlas gives SCRIMED a faith-neutral, institution-ready operating model for healthcare operations, governed agents, interoperability, trust systems, and measurable transformation.
          </p>
        </div>
        <div className="layer-list">
          {[
            "governance",
            "compliance",
            "interoperability",
            "agentic workflows",
            "operational ROI",
            "trust infrastructure"
          ].map((capability, index) => (
            <div className="layer-row" key={capability}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{capability}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
