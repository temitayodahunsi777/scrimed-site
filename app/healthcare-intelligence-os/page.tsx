import Link from "next/link";
import { getHealthcareIntelligenceOSSummary } from "../lib/healthcareIntelligenceOS";

export const metadata = {
  title: "SCRIMED Healthcare Intelligence OS",
  description:
    "Review SCRIMED's healthcare intelligence operating-system foundation, Agent Runtime, Clinical Knowledge Graph, Validation Trust Lab, model routing, sovereign deployment, and production gates."
};

export default function HealthcareIntelligenceOSPage() {
  const summary = getHealthcareIntelligenceOSSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/hub">Hub</Link>
        <p className="eyebrow">SCRIMED Healthcare Intelligence OS</p>
        <h1>A secure operating system, trust layer, workflow engine, and intelligence fabric for healthcare AI.</h1>
        <p className="hero-text">
          SCRIMED is advancing from individual healthcare AI features into a governed intelligence infrastructure layer with
          Agent Runtime, Clinical Knowledge Graph, Validation and Trust Lab, protected workspaces, model routing, and sovereign
          deployment readiness. Current execution remains synthetic and enterprise-evaluation only.
        </p>
        <div className="hero-actions">
          <Link className="primary-action" href="/pilot-evidence">
            View Pilot Evidence
          </Link>
          <Link className="secondary-action" href="/agent-workspace">
            Open Agent Workspace
          </Link>
          <a className="secondary-action" href="/api/healthcare-intelligence-os">
            Inspect OS API
          </a>
          <a className="secondary-action" href="/api/healthcare-intelligence-os/brief">
            Download OS Brief
          </a>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Healthcare Intelligence OS summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Architecture phases</span>
          <strong>{summary.architecture.length}</strong>
        </article>
        <article>
          <span>Agent services</span>
          <strong>{summary.agentRuntime.specialistServiceCount}</strong>
        </article>
        <article>
          <span>Graph standards</span>
          <strong>{summary.clinicalKnowledgeGraph.standards.length}</strong>
        </article>
        <article>
          <span>Graph node types</span>
          <strong>{summary.clinicalKnowledgeGraph.nodeTypes.length}</strong>
        </article>
        <article>
          <span>Validation fields</span>
          <strong>{summary.validationTrustLab.fields.length}</strong>
        </article>
        <article>
          <span>TrustOS controls</span>
          <strong>{summary.validationTrustLab.trustOSControlCount}</strong>
        </article>
        <article>
          <span>Protected workspace</span>
          <strong>{summary.persistentAgentWorkspace.status}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Current boundary</p>
          <h2>SCRIMED is productized for governed synthetic pilots, not live autonomous care.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {Object.entries(summary.currentStack).map(([name, value], index) => (
            <div className="layer-row" key={name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{name}: {value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Healthcare Intelligence OS phase plan">
        <div className="section-heading">
          <p className="eyebrow">Strategic phase plan</p>
          <h2>Build sequence from core operating layer to global healthcare intelligence fabric.</h2>
        </div>
        {summary.architecture.map((phase) => (
          <article className="module-row" key={phase.id}>
            <div>
              <span>{phase.status}</span>
              <h2>{phase.name}</h2>
            </div>
            <p>{phase.objective}</p>
            <div>
              <strong>{phase.components.join(", ")}</strong>
              <ul className="compact-list">
                {phase.productionGates.map((gate) => (
                  <li key={gate}>{gate}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Agent Runtime capabilities">
        <div className="section-heading">
          <p className="eyebrow">Agent Runtime</p>
          <h2>Shared memory, permissions, audit, planning, tool selection, error boundaries, cost, and latency become platform primitives.</h2>
          <p className="section-copy">
            AgentOS remains governed and synthetic-first while the runtime hardens toward long-running tenant workspaces.
          </p>
        </div>
        <div className="principle-grid">
          {summary.agentRuntime.capabilities.map((capability) => (
            <article key={capability.capability}>
              <span>{capability.status}</span>
              <h3>{capability.capability}</h3>
              <p>{capability.evidence}</p>
              <ul className="compact-list">
                <li>{capability.productionGate}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Clinical Knowledge Graph standards">
        <div className="section-heading">
          <p className="eyebrow">Clinical Knowledge Graph</p>
          <h2>FHIR, HL7, DICOM, SNOMED CT, ICD, LOINC, RxNorm, CPT, HCPCS, payer, pharmacy, and exchange standards form the reasoning substrate.</h2>
          <p className="section-copy">{summary.clinicalKnowledgeGraph.boundary}</p>
        </div>
        {summary.clinicalKnowledgeGraph.standards.map((standard) => (
          <article className="module-row" key={standard.name}>
            <div>
              <span>standard</span>
              <h2>{standard.name}</h2>
            </div>
            <p>{standard.role}</p>
            <div>
              <strong>{standard.currentUse}</strong>
              <ul className="compact-list">
                <li>{standard.productionGate}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Clinical Knowledge Graph node and relationship contracts">
        <div className="section-heading">
          <p className="eyebrow">Graph contracts</p>
          <h2>SCRIMED graph contracts bind clinical, operational, payer, research, imaging, and outcome context to evidence and review state.</h2>
        </div>
        {summary.clinicalKnowledgeGraph.nodeTypes.map((node) => (
          <article className="module-row" key={node.kind}>
            <div>
              <span>node</span>
              <h2>{node.kind}</h2>
            </div>
            <p>{node.purpose}</p>
            <strong>{node.standardBindings.join(", ")}</strong>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Validation and Trust Lab contract">
        <div className="section-heading">
          <p className="eyebrow">Validation and Trust Lab</p>
          <h2>Every recommendation-like output must carry scores, evidence, provenance, model route, reviewer state, and audit metadata.</h2>
          <p className="section-copy">{summary.validationTrustLab.boundary}</p>
        </div>
        <div className="principle-grid">
          {summary.validationTrustLab.fields.map((field) => (
            <article key={field.field}>
              <span>{field.status}</span>
              <h3>{field.field}</h3>
              <p>{field.purpose}</p>
              <ul className="compact-list">
                <li>{field.required ? "Required field" : "Optional field"}</li>
                <li>{field.validationBoundary}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Multi-model router and sovereign deployment">
        <div className="section-heading">
          <p className="eyebrow">Model routing and deployment</p>
          <h2>SCRIMED should route across approved providers and run where customer governance requires.</h2>
        </div>
        {summary.multiModelRouter.providers.map((provider) => (
          <article className="module-row" key={provider.provider}>
            <div>
              <span>{provider.status}</span>
              <h2>{provider.provider}</h2>
            </div>
            <p>{provider.routingUse}</p>
            <ul className="compact-list">
              {provider.requiredControls.map((control) => (
                <li key={control}>{control}</li>
              ))}
            </ul>
          </article>
        ))}
        {summary.sovereignDeployment.profiles.map((profile) => (
          <article className="module-row" key={profile.mode}>
            <div>
              <span>{profile.status}</span>
              <h2>{profile.mode}</h2>
            </div>
            <p>{profile.supportedNeed}</p>
            <ul className="compact-list">
              {profile.requiredControls.map((control) => (
                <li key={control}>{control}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Future intelligence layers">
        <div className="section-heading">
          <p className="eyebrow">Future intelligence layers</p>
          <h2>Care-journey, risk-horizon, and population intelligence stay gated until validation and governance mature.</h2>
        </div>
        <div className="principle-grid">
          {summary.clinicalIntelligenceOS.workflows.map((workflow) => (
            <article key={`${workflow.stage}-${workflow.workflow}`}>
              <span>{workflow.currentMode}</span>
              <h3>{workflow.stage}</h3>
              <p>{workflow.workflow}</p>
              <ul className="compact-list">
                <li>{workflow.boundary}</li>
              </ul>
            </article>
          ))}
          {summary.riskHorizonEngine.focusAreas.slice(0, 3).map((focus) => (
            <article key={focus.focus}>
              <span>{focus.status}</span>
              <h3>{focus.focus}</h3>
              <p>{focus.safeStartingPoint}</p>
              <ul className="compact-list">
                <li>{focus.productionGate}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
