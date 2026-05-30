import { operatingContext } from "../lib/operatingContext";

const faithCore = operatingContext.operatingModels.find((model) => model.name === "FaithCore");

export default function FaithCorePage() {
  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/operating-context">Operating Context</a>
        <p className="eyebrow">FaithCore</p>
        <h1>A spiritually aligned trust and encouragement layer with clear clinical boundaries.</h1>
        <p className="hero-text">
          {faithCore?.role} FaithCore supports whole-person dignity while preserving clinician authority, clinical excellence, consent, safety, and professional standards.
        </p>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Clinical boundary</p>
          <h2>{faithCore?.boundary}</h2>
          <p className="section-copy">
            FaithCore can support hope, ethical reflection, encouragement, and trust, but it must remain opt-in, culturally sensitive, and separate from diagnosis, treatment, emergency guidance, or medical decision authority.
          </p>
        </div>
        <div className="layer-list">
          {[
            "opt-in spiritual support",
            "patient dignity",
            "ethical governance",
            "clinical boundary protection",
            "cultural sensitivity",
            "human-centered trust"
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
