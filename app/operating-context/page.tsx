import Link from "next/link";
import { operatingContext } from "../lib/operatingContext";

export default function OperatingContextPage() {
  const operatingDisciplines = [
    {
      name: "Quality standard",
      items: operatingContext.qualityStandard,
      summary: "Every delivery path should favor secure, scalable, compliant, explainable, and clinically useful choices."
    },
    {
      name: "Engineering philosophy",
      items: operatingContext.engineeringPhilosophy,
      summary: "The platform should stay modular, API-first, agent-native, auditable, secure-by-design, and cloud-agnostic."
    },
    {
      name: "Interoperability targets",
      items: operatingContext.interoperabilityTargets,
      summary: "SCRIMED should build connectors across care delivery, payment, public health, research, device, and data ecosystems."
    },
    {
      name: "Security controls",
      items: operatingContext.securityControls,
      summary: "Assume adversarial environments and apply Zero Trust, least privilege, monitoring, encryption, and governance."
    },
    {
      name: "Agent requirements",
      items: operatingContext.agentRequirements,
      summary: "Specialized healthcare agents must be governed, auditable, explainable, secure, observable, and human-supervised."
    },
    {
      name: "Global readiness",
      items: operatingContext.globalPriorityRegions,
      summary: "The operating model should stay globally deployable, culturally adaptable, multilingual, and regionally compliant."
    }
  ];

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/hub">Hub</Link>
        <p className="eyebrow">Master operating context</p>
        <h1>{operatingContext.company} is building a trusted healthcare intelligence ecosystem.</h1>
        <p className="hero-text">
          {operatingContext.slogan} The company operating doctrine prioritizes patient outcomes, clinician empowerment, trust, interoperability, scalable architecture, security, and measurable global impact.
        </p>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Mission</p>
          <h2>{operatingContext.mission}</h2>
          <p className="section-copy">
            Official website: {operatingContext.officialWebsite} via {operatingContext.websiteProvider}.
          </p>
        </div>
        <div className="layer-list">
          {operatingContext.principles.map((principle, index) => (
            <div className="layer-row" key={principle}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{principle}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="SCRIMED operating models">
        {operatingContext.operatingModels.map((model) => (
          <article className="module-row" key={model.name}>
            <div>
              <span>{model.audience}</span>
              <h2>{model.name}</h2>
            </div>
            <p>{model.boundary}</p>
            <Link className="module-link" href={model.route}>{model.role}</Link>
          </article>
        ))}
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Human + AI formula</p>
          <h2>{operatingContext.aiFormula}</h2>
          <p className="section-copy">
            SCRIMED should augment clinicians, nurses, administrators, payers, researchers, governments, and patients through governed workflow integration rather than unmanaged AI replacement.
          </p>
        </div>
        <div className="layer-list">
          {operatingContext.strategicDirections.map((direction, index) => (
            <div className="layer-row" key={direction}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{direction}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band principle-grid" aria-label="SCRIMED operating disciplines">
        {operatingDisciplines.map((discipline) => (
          <article key={discipline.name}>
            <span>{discipline.name}</span>
            <h3>{discipline.summary}</h3>
            <ul className="compact-list">
              {discipline.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="section-band principle-grid" aria-label="SCRIMED decision framework">
        {operatingContext.decisionFramework.map((question) => (
          <article key={question}>
            <span>decision gate</span>
            <h3>{question}</h3>
            <p>Every feature, workflow, partnership, integration, and architecture decision should clear this filter.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
