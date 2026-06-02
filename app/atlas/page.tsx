import { operatingContext } from "../lib/operatingContext";
import { getAtlasIntelligenceCoreSummary } from "../lib/atlasIntelligenceCore";

const atlas = operatingContext.operatingModels.find((model) => model.name === "SCRIMED Atlas");

export default function AtlasPage() {
  const core = getAtlasIntelligenceCoreSummary();

  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/operating-context">Operating Context</a>
        <p className="eyebrow">SCRIMED Atlas Intelligence Core v1</p>
        <h1>A continuously validated healthcare intelligence operating system.</h1>
        <p className="hero-text">
          {atlas?.role} Atlas now exposes document intelligence, evidence-backed reasoning, Trust Cards, sandbox runtime, validation metrics, AI governance, and reimbursement readiness while live clinical execution remains gated.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Atlas Intelligence Core summary">
        <article>
          <span>Status</span>
          <strong>{core.status}</strong>
        </article>
        <article>
          <span>Subsystems</span>
          <strong>{core.subsystems.length}</strong>
        </article>
        <article>
          <span>Parsers</span>
          <strong>{core.structuralIntelligenceEngine.length}</strong>
        </article>
        <article>
          <span>Validation</span>
          <strong>{core.continuousValidationMetrics.length}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Enterprise boundary</p>
          <h2>{atlas?.boundary}</h2>
          <p className="section-copy">{core.boundary}</p>
        </div>
        <div className="layer-list">
          {core.subsystems.map((subsystem, index) => (
            <a className="layer-row" href={subsystem.route} key={subsystem.name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{subsystem.name}: {subsystem.status}</strong>
            </a>
          ))}
        </div>
      </section>

      <section className="table-section" id="structural-intelligence" aria-label="Structural Intelligence Engine">
        <div className="section-heading">
          <p className="eyebrow">Structural Intelligence Engine</p>
          <h2>Parse layout before LLM extraction across healthcare documents.</h2>
        </div>
        {core.structuralIntelligenceEngine.map((parser) => (
          <article className="module-row" key={parser.family}>
            <div>
              <span>{parser.status}</span>
              <h2>{parser.family}</h2>
            </div>
            <p>{parser.extractionPolicy}</p>
            <div>
              <strong>{parser.reviewBoundary}</strong>
              <ul className="compact-list">
                {parser.layoutUnderstanding.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" id="evidence" aria-label="Atlas Evidence Layer">
        <div className="section-heading">
          <p className="eyebrow">Atlas Evidence Layer</p>
          <h2>Answers require citations, confidence, source attribution, and validation timestamps.</h2>
        </div>
        <div className="principle-grid">
          {core.atlasEvidenceLayer.answerContract.map((contract) => (
            <article key={contract.field}>
              <span>{contract.required ? "required" : "optional"}</span>
              <h3>{contract.field}</h3>
              <p>{contract.purpose}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Atlas subsystems">
        <div className="section-heading">
          <p className="eyebrow">Operating subsystems</p>
          <h2>Atlas combines document intelligence, evidence, governance, reimbursement awareness, and validation.</h2>
        </div>
        {core.subsystems.map((subsystem) => (
          <article className="module-row" key={subsystem.name}>
            <div>
              <span>{subsystem.status}</span>
              <h2>{subsystem.name}</h2>
            </div>
            <p>{subsystem.purpose}</p>
            <div>
              <a className="module-link" href={subsystem.route}>{subsystem.route}</a>
              <ul className="compact-list">
                {subsystem.controls.map((control) => (
                  <li key={control}>{control}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" id="reimbursement" aria-label="Reimbursement Layer">
        <div className="section-heading">
          <p className="eyebrow">Reimbursement Layer</p>
          <h2>CMS ACCESS-aware posture for chronic care monitoring, telehealth, wearables, and outcomes.</h2>
          <p className="section-copy">This layer supports readiness and reporting design; it does not guarantee reimbursement or perform billing actions.</p>
        </div>
        {core.reimbursementLayer.map((capability) => (
          <article className="module-row" key={capability.capability}>
            <div>
              <span>{capability.status}</span>
              <h2>{capability.capability}</h2>
            </div>
            <p>{capability.supportedSignals.join(", ")}</p>
            <div>
              <strong>{capability.boundary}</strong>
              <ul className="compact-list">
                {capability.evidenceNeeds.map((need) => (
                  <li key={need}>{need}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
