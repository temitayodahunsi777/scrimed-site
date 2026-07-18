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
          <a className="secondary-action" href="/api/clinical-data-fabric">
            Clinical Data Fabric
          </a>
          <a className="secondary-action" href="/api/clinical-data-governance">
            Data Governance
          </a>
          <a className="secondary-action" href="/api/clinical-context-gateway">
            Context Gateway
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
          <span>Source contracts</span>
          <strong>{summary.clinicalDataFabric.sourceContractCount}</strong>
        </article>
        <article>
          <span>Graph edge contracts</span>
          <strong>{summary.clinicalDataFabric.graphEdgeCount}</strong>
        </article>
        <article>
          <span>Governance rules</span>
          <strong>{summary.clinicalDataGovernance.policyRuleCount}</strong>
        </article>
        <article>
          <span>Governance evaluations</span>
          <strong>{summary.clinicalDataGovernance.baselineEvaluationCount}</strong>
        </article>
        <article>
          <span>Context scopes</span>
          <strong>{summary.clinicalContextGateway.supportedScopeCount}</strong>
        </article>
        <article>
          <span>Gateway controls</span>
          <strong>{summary.clinicalContextGateway.gatewayControlCount}</strong>
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
        <article>
          <span>Workflow tracks</span>
          <strong>{summary.clinicalWorkflowAutomation.trackCount}</strong>
        </article>
        <article>
          <span>Safety controls</span>
          <strong>{summary.clinicalWorkflowAutomation.patientSafetyControlCount}</strong>
        </article>
        <article>
          <span>Burden reducers</span>
          <strong>{summary.clinicalWorkflowAutomation.clinicianBurdenReductionMotionCount}</strong>
        </article>
        <article>
          <span>Engagement signals</span>
          <strong>{summary.clinicalWorkflowAutomation.patientEngagementAnalysisSignalCount}</strong>
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

      <section className="section-band" id="clinical-data-fabric" aria-label="Clinical Data Fabric">
        <div className="section-heading">
          <p className="eyebrow">Clinical Data Fabric</p>
          <h2>Healthcare source contracts, semantic normalization, provenance, and health-graph projection stay governed before any agent receives context.</h2>
          <p className="section-copy">{summary.clinicalDataFabric.boundary}</p>
        </div>
        <div className="principle-grid">
          <article>
            <span>{summary.clinicalDataFabric.status}</span>
            <h3>Source contracts</h3>
            <p>
              {summary.clinicalDataFabric.sourceContractCount} source contracts cover FHIR, HL7, DICOM, X12,
              documents, pharmacy, device, genomics, pathology, scheduling, portal, and patient-access context.
            </p>
            <ul className="compact-list">
              <li>Data boundary: {summary.clinicalDataFabric.dataBoundary}</li>
              <li>Connector authority: {summary.clinicalDataFabric.connectorAuthority}</li>
            </ul>
          </article>
          <article>
            <span>{summary.clinicalDataFabric.validationStatus}</span>
            <h3>Semantic layer</h3>
            <p>
              {summary.clinicalDataFabric.semanticMappingCount} semantic mappings normalize patient, condition,
              lab, medication, imaging, and claim concepts with provenance and confidence requirements.
            </p>
            <ul className="compact-list">
              <li>Agent data authority: {summary.clinicalDataFabric.agentDataAuthority}</li>
              <li>Live ingestion authority: {summary.clinicalDataFabric.liveIngestionAuthority}</li>
            </ul>
          </article>
          <article>
            <span>{summary.clinicalDataFabric.workflowEventCount} events</span>
            <h3>Health graph controls</h3>
            <p>
              {summary.clinicalDataFabric.graphNodeCount} node contracts and {summary.clinicalDataFabric.graphEdgeCount} edge
              contracts preserve source lineage, reviewer state, blocked uses, and human review requirements.
            </p>
            <ul className="compact-list">
              <li>Clinical care authority: {summary.clinicalDataFabric.clinicalCareAuthority}</li>
              <li>Blocked claims: {summary.clinicalDataFabric.blockedClaimCount}</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section-band" id="clinical-data-governance" aria-label="Clinical Data Governance">
        <div className="section-heading">
          <p className="eyebrow">Clinical Data Governance</p>
          <h2>Every healthcare context request must pass deterministic policy checks before agents, tools, models, or connectors receive authority.</h2>
          <p className="section-copy">{summary.clinicalDataGovernance.boundary}</p>
        </div>
        <div className="principle-grid">
          <article>
            <span>{summary.clinicalDataGovernance.status}</span>
            <h3>Policy engine</h3>
            <p>
              {summary.clinicalDataGovernance.policyRuleCount} rules evaluate role, purpose, data class,
              action, destination, consent, tenant scope, minimum necessary access, review, residency, and contract readiness.
            </p>
            <ul className="compact-list">
              <li>Policy version: {summary.clinicalDataGovernance.policyVersion}</li>
              <li>Data boundary: {summary.clinicalDataGovernance.dataBoundary}</li>
            </ul>
          </article>
          <article>
            <span>{summary.clinicalDataGovernance.validationStatus}</span>
            <h3>Decision coverage</h3>
            <p>
              {summary.clinicalDataGovernance.baselineEvaluationCount} baseline control evaluations prove metadata access,
              deidentified review packets, external model PHI, record mutation, and semantic context decisions stay governed.
            </p>
            <ul className="compact-list">
              <li>Supported actions: {summary.clinicalDataGovernance.supportedActionCount}</li>
              <li>Supported destinations: {summary.clinicalDataGovernance.supportedDestinationCount}</li>
            </ul>
          </article>
          <article>
            <span>authority blocked</span>
            <h3>Retained limits</h3>
            <p>
              Live care, production connectors, record mutation, patient outreach, payer submission, and external model PHI remain blocked.
            </p>
            <ul className="compact-list">
              <li>Clinical care: {summary.clinicalDataGovernance.clinicalCareAuthority}</li>
              <li>Connector: {summary.clinicalDataGovernance.productionConnectorAuthority}</li>
              <li>Record mutation: {summary.clinicalDataGovernance.recordMutationAuthority}</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section-band" id="clinical-context-gateway" aria-label="Clinical Context Gateway">
        <div className="section-heading">
          <p className="eyebrow">Clinical Context Gateway</p>
          <h2>Agents receive governed semantic envelopes, not raw schemas, raw connector payloads, or patient records.</h2>
          <p className="section-copy">{summary.clinicalContextGateway.boundary}</p>
        </div>
        <div className="principle-grid">
          <article>
            <span>{summary.clinicalContextGateway.status}</span>
            <h3>Semantic envelope control</h3>
            <p>
              The gateway covers {summary.clinicalContextGateway.supportedScopeCount} context scopes and
              {summary.clinicalContextGateway.sourceContractCount} source contracts with policy-cleared,
              metadata-only context envelopes.
            </p>
            <ul className="compact-list">
              <li>Envelope version: {summary.clinicalContextGateway.envelopeVersion}</li>
              <li>Data boundary: {summary.clinicalContextGateway.dataBoundary}</li>
            </ul>
          </article>
          <article>
            <span>{summary.clinicalContextGateway.validationStatus}</span>
            <h3>Gateway proof coverage</h3>
            <p>
              {summary.clinicalContextGateway.baselineEvaluationCount} baseline evaluations prove allowed,
              review-gated, unsafe-destination, live-data, and unregistered-source requests remain deterministic.
            </p>
            <ul className="compact-list">
              <li>Gateway controls: {summary.clinicalContextGateway.gatewayControlCount}</li>
              <li>Raw schema access: {summary.clinicalContextGateway.rawSchemaAccess}</li>
            </ul>
          </article>
          <article>
            <span>raw access blocked</span>
            <h3>Agent containment</h3>
            <p>
              Context delivery preserves source-contract provenance, confidence inputs, evidence requirements,
              blocked-use instructions, and audit hashes without widening agent authority.
            </p>
            <ul className="compact-list">
              <li>Raw connector payload: {summary.clinicalContextGateway.rawConnectorPayloadAccess}</li>
              <li>Record mutation: {summary.clinicalContextGateway.recordMutationAuthority}</li>
              <li>Patient outreach: {summary.clinicalContextGateway.patientOutreachAuthority}</li>
            </ul>
          </article>
          <article>
            <span>Context Lens</span>
            <h3>Evidence inside the governed workflow surface</h3>
            <p>
              Public Evidence and Clinical Context remain isolated. Every proposed next action carries
              source provenance, freshness, confidence, missing-data state, constraints, and a reason.
            </p>
            <ul className="compact-list">
              <li>Modes: {summary.clinicalContextGateway.contextLensModes.join(", ")}</li>
              <li>Stale or unsupported context: {summary.clinicalContextGateway.unsupportedOrStaleContextAction}</li>
              <li>Live PHI: {summary.clinicalContextGateway.contextLensLivePhiEnabled ? "enabled" : "disabled"}</li>
            </ul>
          </article>
        </div>
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

      <section className="table-section" aria-label="Clinical workflow automation and clinician burden reduction">
        <div className="section-heading">
          <p className="eyebrow">Clinical workflow automation</p>
          <h2>SCRIMED can reduce administrative drag through draft-only, source-attributed, human-reviewed workflow support.</h2>
          <p className="section-copy">{summary.clinicalWorkflowAutomation.boundary}</p>
        </div>
        {summary.clinicalWorkflowAutomation.tracks.map((track) => (
          <article className="module-row" key={track.slug}>
            <div>
              <span>{track.status}</span>
              <h2>{track.lane}</h2>
            </div>
            <p>{track.clinicalAwareness}</p>
            <div>
              <strong>{track.automationScope}</strong>
              <ul className="compact-list">
                <li>Buyer: {track.buyer}</li>
                <li>Patient safety: {track.patientSafetyControls.join(", ")}</li>
                <li>Patient engagement analysis: {track.patientEngagementAnalysis.join(", ")}</li>
                <li>Interoperability: {track.interoperabilityBindings.join(", ")}</li>
                <li>Clinician burden reduction: {track.clinicianBurdenReduction.join(", ")}</li>
                <li>Operations optimization: {track.operationsOptimization.join(", ")}</li>
                <li>Proof routes: {track.proofRoutes.join(", ")}</li>
                <li>Blocked actions: {track.blockedActions.join(", ")}</li>
                <li>Before live: {track.requiredBeforeLive}</li>
                <li>Boundary: {track.retainedBoundary}</li>
              </ul>
            </div>
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
