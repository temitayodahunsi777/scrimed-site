import Link from "next/link";
import { getMarketActivationSummary } from "../lib/marketActivation";
import { operatingContext } from "../lib/operatingContext";

const faithCore = operatingContext.operatingModels.find((model) => model.name === "FaithCore");

export default function FaithCorePage() {
  const marketActivation = getMarketActivationSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/operating-context">Operating Context</Link>
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

      <section className="table-section" aria-label="FaithCore market programs">
        <div className="section-heading">
          <p className="eyebrow">FaithCore programs</p>
          <h2>FaithCore is sellable only as opt-in trust, dignity, and encouragement support with explicit clinical boundaries.</h2>
          <p className="section-copy">
            These programs strengthen SCRIMED&apos;s message for faith-aligned communities while protecting consent, clinical authority, cultural sensitivity, and professional standards.
          </p>
        </div>
        {marketActivation.faithCoreMarketPrograms.map((program) => (
          <article className="module-row" key={program.name}>
            <div>
              <span>{program.status}</span>
              <h2>{program.name}</h2>
            </div>
            <p>{program.audience}. {program.message}</p>
            <div>
              <Link className="module-link" href="/market-activation">
                {program.revenueUse}
              </Link>
              <ul className="compact-list">
                <li>{program.useCase}</li>
                <li>{program.boundaries.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="FaithCore communications controls">
        <div className="section-heading">
          <p className="eyebrow">Communications controls</p>
          <h2>FaithCore language must be gentle, opt-in, culturally sensitive, and never clinical.</h2>
        </div>
        <div className="principle-grid">
          {marketActivation.messageHouse.toneRules.map((rule) => (
            <article key={rule}>
              <span>Rule</span>
              <h3>{rule}</h3>
              <p>FaithCore messaging routes through the same claims-control system as SCRIMED product, sales, PR, and advertising.</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
