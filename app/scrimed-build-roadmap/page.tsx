import Link from "next/link";
import { getScrimedBuildRoadmapSummary } from "../lib/scrimedBuildRoadmap";
import { getScrimedDynamicContextInjectionSummary } from "../lib/scrimedDynamicContextInjection";
import { getScrimedStrategicExecutionLayerSummary } from "../lib/scrimedStrategicExecutionLayer";

export const metadata = {
  title: "SCRIMED Build Roadmap",
  description:
    "No-PHI SCRIMED build roadmap for LLM interface boundaries, world models, semantic graph, memory, dynamic context injection, workforce, resource management, and benchmarks."
};

export default function ScrimedBuildRoadmapPage() {
  const summary = getScrimedBuildRoadmapSummary();
  const contextInjection = getScrimedDynamicContextInjectionSummary();
  const strategicExecution = getScrimedStrategicExecutionLayerSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/scrimed-os">
          SCRIMED OS
        </Link>
        <p className="eyebrow">SCRIMED Build Roadmap</p>
        <h1>Healthcare intelligence architecture that treats models as interfaces, not the whole system.</h1>
        <p className="hero-text">
          This roadmap turns SCRIMED toward world models, active ontology, semantic graphs, decision memory, dynamic
          context injection, independent validation, workforce intelligence, resource management, and operational benchmarks.
        </p>
        <div className="hero-actions" aria-label="SCRIMED build roadmap actions">
          <Link href="/api/scrimed-build-roadmap">Inspect Roadmap API</Link>
          <Link href="/api/scrimed-build-roadmap/brief">Download Brief</Link>
          <Link href="/api/scrimed-build-roadmap/context-manifest">Context Manifest</Link>
          <Link href="/api/scrimed-build-roadmap/context-manifest/brief">Manifest Brief</Link>
          <Link href="/api/scrimed-build-roadmap/strategic-execution">Strategic Execution</Link>
          <Link href="/scrimed-operating-command">Operating Command</Link>
          <Link href="/scrimed-trustops">TrustOps</Link>
          <Link href="/scrimed-modules">Modules</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED build roadmap summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Directives</span>
          <strong>{summary.directiveCount}</strong>
        </article>
        <article>
          <span>Modules</span>
          <strong>{summary.moduleCount}</strong>
        </article>
        <article>
          <span>World layers</span>
          <strong>{summary.worldModelLayerCount}</strong>
        </article>
        <article>
          <span>Benchmarks</span>
          <strong>{summary.benchmarkDimensionCount}</strong>
        </article>
        <article>
          <span>Priority stack</span>
          <strong>{summary.priorityStackCount}</strong>
        </article>
        <article>
          <span>Doc auth</span>
          <strong>{summary.documentationBeforeAuthorization.validation.status}</strong>
        </article>
        <article>
          <span>De-ID</span>
          <strong>{summary.onDeviceDeidentification.validation.status}</strong>
        </article>
        <article>
          <span>Harness</span>
          <strong>{summary.metaHarness.validation.status}</strong>
        </article>
        <article>
          <span>Pre-index</span>
          <strong>{summary.preIndexedIntelligence.validation.status}</strong>
        </article>
        <article>
          <span>Validation</span>
          <strong>{summary.validation.status}</strong>
        </article>
        <article>
          <span>Context</span>
          <strong>{contextInjection.validation.status}</strong>
        </article>
        <article>
          <span>Execution</span>
          <strong>{strategicExecution.validation.status}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="SCRIMED build roadmap boundary">
        <div>
          <p className="eyebrow">GO / NO-GO</p>
          <h2>Roadmap architecture can advance now; production healthcare authority remains blocked.</h2>
        </div>
        <div>
          <p>{summary.boundary}</p>
          <p>{summary.currentGoScope}</p>
          <p>{summary.noGoScope}</p>
        </div>
      </section>

      <section className="table-section" aria-label="Omnigent-style Meta-Harness">
        <div className="section-heading">
          <p className="eyebrow">Omnigent-style Meta-Harness</p>
          <h2>One governed control plane coordinates SCRIMED agents, sessions, tools, approvals, and audit metadata.</h2>
          <p>{summary.metaHarness.boundary}</p>
          <p>
            Agents: {summary.metaHarness.agentCount}. Session: {summary.metaHarness.session.status}. Approval gate:{" "}
            {summary.metaHarness.session.approvalGate}.
          </p>
        </div>
        {summary.metaHarness.decisions.map((decision) => (
          <article className="module-row" key={decision.requestId}>
            <div>
              <span>{decision.status}</span>
              <h2>{decision.requestId}</h2>
            </div>
            <p>
              Assigned agents: {decision.assignedAgents.join(", ")}. Blocked actions:{" "}
              {decision.blockedActions.length > 0 ? decision.blockedActions.join(", ") : "none"}.
            </p>
            <div>
              <strong>{decision.approvalGate}</strong>
              <ul className="compact-list">
                <li>Tools: {decision.toolDecisions.map((tool) => `${tool.toolId}:${tool.status}`).join(", ")}</li>
                <li>No PHI confirmed: {decision.noPhiConfirmed ? "yes" : "no"}</li>
                <li>No external side effects: {decision.noExternalSideEffects ? "yes" : "no"}</li>
                <li>Audit: {decision.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Pre-Indexed Intelligence">
        <div className="section-heading">
          <p className="eyebrow">Pre-Indexed Intelligence</p>
          <h2>Structure-preserving retrieval metadata reduces thin-connector dependence before model calls.</h2>
          <p>{summary.preIndexedIntelligence.boundary}</p>
          <p>
            Sources: {summary.preIndexedIntelligence.sourceCount}. Retrieval tasks:{" "}
            {summary.preIndexedIntelligence.retrievalTaskCount}. Raw payload storage:{" "}
            {summary.preIndexedIntelligence.rawPayloadStored ? "enabled" : "blocked"}.
          </p>
        </div>
        {summary.preIndexedIntelligence.retrievalEvaluations.map((evaluation) => (
          <article className="module-row" key={evaluation.task}>
            <div>
              <span>{evaluation.status}</span>
              <h2>{evaluation.task.replaceAll("_", " ")}</h2>
            </div>
            <p>{evaluation.reason}</p>
            <div>
              <strong>Grounding {evaluation.groundingScore}</strong>
              <ul className="compact-list">
                <li>Traceability: {evaluation.sourceTraceabilityScore}</li>
                <li>Minimum passing score: {evaluation.minimumPassingScore}</li>
                <li>Candidate sources: {evaluation.candidateSourceIds.join(", ")}</li>
                <li>Human review required: {evaluation.humanReviewRequired ? "yes" : "no"}</li>
                <li>Audit: {evaluation.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="On-Device De-Identification">
        <div className="section-heading">
          <p className="eyebrow">On-Device De-Identification</p>
          <h2>Local-first privacy controls prepare documents for review before any external inference path.</h2>
          <p>{summary.onDeviceDeidentification.boundary}</p>
          <p>
            Runtime targets: {summary.onDeviceDeidentification.runtimeTargets.join(", ")}. Document families covered:{" "}
            {summary.onDeviceDeidentification.documentTypeCount}.
          </p>
        </div>
        {summary.onDeviceDeidentification.manifests.map((manifest) => (
          <article className="module-row" key={manifest.fixtureId}>
            <div>
              <span>{manifest.documentType}</span>
              <h2>{manifest.fixtureId}</h2>
            </div>
            <p>
              Status: {manifest.status}. Simulated categories:{" "}
              {manifest.simulatedDetectedCategories.join(", ")}.
            </p>
            <div>
              <strong>{manifest.automationEligibility}</strong>
              <ul className="compact-list">
                <li>Targets: {manifest.runtimeTargets.join(", ")}</li>
                <li>External inference allowed: {manifest.externalInferenceAllowed ? "yes" : "no"}</li>
                <li>Raw payload stored: {manifest.rawPayloadStored ? "yes" : "no"}</li>
                <li>Human verification required: {manifest.humanVerificationRequired ? "yes" : "no"}</li>
                <li>Audit: {manifest.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Documentation-Before-Authorization Engine">
        <div className="section-heading">
          <p className="eyebrow">Documentation-Before-Authorization Engine</p>
          <h2>Prior-auth risk is reduced before submission by finding documentation gaps first.</h2>
          <p>{summary.documentationBeforeAuthorization.boundary}</p>
        </div>
        {summary.documentationBeforeAuthorization.evaluations.map((evaluation) => (
          <article className="module-row" key={evaluation.packetId}>
            <div>
              <span>{evaluation.riskLevel}</span>
              <h2>{evaluation.packetId}</h2>
            </div>
            <p>
              Readiness: {evaluation.readiness}. Missing evidence:{" "}
              {evaluation.missingEvidenceLabels.length > 0
                ? evaluation.missingEvidenceLabels.join(", ")
                : "none in synthetic packet"}.
            </p>
            <div>
              <strong>{evaluation.recommendedOwner}</strong>
              <ul className="compact-list">
                <li>Prior-auth risk: {evaluation.priorAuthRiskSignals.join(", ") || "low synthetic risk"}</li>
                <li>Automation: {evaluation.automationEligibility}</li>
                <li>Human review required: {evaluation.humanReviewRequired ? "yes" : "no"}</li>
                <li>Payer submission allowed: {evaluation.payerSubmissionAllowed ? "yes" : "no"}</li>
                <li>Audit: {evaluation.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED governed healthcare meta-harness priority stack">
        <div className="section-heading">
          <p className="eyebrow">Priority Stack</p>
          <h2>SCRIMED is now explicitly organized as a governed healthcare meta-harness.</h2>
          <p>{summary.priorityPrinciple}</p>
        </div>
        {summary.priorityStack.map((item) => (
          <article className="module-row" key={item.id}>
            <div>
              <span>{item.priority}</span>
              <h2>{item.name}</h2>
            </div>
            <p>{item.strategicIntent}</p>
            <div>
              <strong>{item.nextBuildStep}</strong>
              <ul className="compact-list">
                <li>Lane: {item.implementationLane.join(", ")}</li>
                <li>Outputs: {item.expectedOutputs.join(", ")}</li>
                <li>Oversight: {item.humanOversight}</li>
                <li>Boundaries: {item.protectedBoundaries.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED build roadmap directives">
        <div className="section-heading">
          <p className="eyebrow">Directives</p>
          <h2>The ten requested roadmap directives are represented as build tracks with validation and boundaries.</h2>
        </div>
        {summary.directives.map((directive) => (
          <article className="module-row" key={directive.id}>
            <div>
              <span>{directive.domain}</span>
              <h2>{directive.directive}</h2>
            </div>
            <p>{directive.productImplication}</p>
            <div>
              <strong>{directive.stage}</strong>
              <ul className="compact-list">
                <li>Architecture: {directive.architectureChange.join(", ")}</li>
                <li>Tracks: {directive.implementationTracks.join(", ")}</li>
                <li>Validation: {directive.validationMethod.join(", ")}</li>
                <li>Next: {directive.nextBuildStep}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED build roadmap modules">
        <div className="section-heading">
          <p className="eyebrow">Modules</p>
          <h2>New roadmap modules add context injection, ontology, memory, workforce, resource, and benchmark foundations.</h2>
          <p>
            Priority build lanes: Dynamic Context Injection Engine and Operational Benchmark Layer.
          </p>
        </div>
        {summary.modules.map((module) => (
          <article className="module-row" key={module.id}>
            <div>
              <span>{module.ownerPlaceholder}</span>
              <h2>{module.name}</h2>
            </div>
            <p>{module.purpose}</p>
            <div>
              <strong>{module.firstMilestone}</strong>
              <ul className="compact-list">
                <li>Inputs: {module.inputs.join(", ")}</li>
                <li>Outputs: {module.outputs.join(", ")}</li>
                <li>Controls: {module.controls.join(", ")}</li>
                <li>Blocked: {module.blockedActions.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED world model layers">
        <div className="section-heading">
          <p className="eyebrow">World models</p>
          <h2>Healthcare state is modeled through time, geography, capacity, clinical workflow, payer rules, and journey state.</h2>
        </div>
        {summary.worldModelLayers.map((layer) => (
          <article className="module-row" key={layer.id}>
            <div>
              <span>world model</span>
              <h2>{layer.name}</h2>
            </div>
            <p>{layer.scope}</p>
            <div>
              <strong>Modeled state</strong>
              <ul className="compact-list">
                <li>{layer.modeledState.join(", ")}</li>
                <li>Validation: {layer.validationSources.join(", ")}</li>
                <li>Blocked until: {layer.blockedUntil.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band principle-grid" aria-label="Context injection cadence">
        {summary.contextInjectionCadence.map((item) => (
          <article key={item.cadence}>
            <span>{item.cadence}</span>
            <h3>{item.action}</h3>
            <p>{item.retainedMemory}</p>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Dynamic Context Injection Engine manifest">
        <div className="section-heading">
          <p className="eyebrow">Dynamic Context Injection Engine</p>
          <h2>Every synthetic agent run now has a pre-agent-run context manifest with selected modules, skills, reminders, validators, omitted context, and audit metadata.</h2>
          <p>{contextInjection.boundary}</p>
          <p>Decision memory remains metadata-only and excludes PHI, credentials, production connector payloads, and hidden chain-of-thought.</p>
        </div>
        <article className="module-row">
          <div>
            <span>{contextInjection.manifest.cadence}</span>
            <h2>{contextInjection.manifest.id}</h2>
          </div>
          <p>{contextInjection.manifest.sessionStartPlanningSummary}</p>
          <div>
            <strong>{contextInjection.manifest.status}</strong>
            <ul className="compact-list">
              <li>Safety decision: {contextInjection.manifest.safetyDecision.status}</li>
              <li>Prompt boundary: {contextInjection.manifest.promptPayloadBoundary}</li>
              <li>Memory: {contextInjection.manifest.memoryWritePlan.chainOfThoughtPolicy}</li>
              <li>Audit hash: {contextInjection.manifest.audit.manifestHash}</li>
            </ul>
          </div>
        </article>
        <article className="module-row">
          <div>
            <span>loaded now</span>
            <h2>Lazy capability loadout</h2>
          </div>
          <p>{contextInjection.agentRunContract.beforeEveryRun}</p>
          <div>
            <strong>Fail closed</strong>
            <ul className="compact-list">
              <li>Loaded: {contextInjection.manifest.lazyCapabilityLoadout.loadedNow.join(", ")}</li>
              <li>Deferred: {contextInjection.manifest.lazyCapabilityLoadout.deferredUntilNeeded.join(", ")}</li>
              <li>Blocked: {contextInjection.manifest.lazyCapabilityLoadout.blockedUntilApproval.join(", ")}</li>
              <li>{contextInjection.agentRunContract.failClosed}</li>
            </ul>
          </div>
        </article>
        {contextInjection.manifest.activeTaskReminders.map((reminder) => (
          <article className="module-row" key={reminder.id}>
            <div>
              <span>task reminder v{reminder.version}</span>
              <h2>{reminder.id}</h2>
            </div>
            <p>{reminder.text}</p>
            <div>
              <strong>{reminder.status}</strong>
              <ul className="compact-list">
                <li>Updated: {reminder.updatedAt}</li>
                <li>Required before next run: {reminder.requiredBeforeNextRun ? "yes" : "no"}</li>
              </ul>
            </div>
          </article>
        ))}
        {contextInjection.validation.checks.map((check) => (
          <article className="module-row" key={check.check}>
            <div>
              <span>{check.passed ? "pass" : "fail"}</span>
              <h2>{check.check}</h2>
            </div>
            <p>{check.detail}</p>
            <div>
              <strong>{contextInjection.schemaVersion}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band principle-grid" aria-label="Benchmark dimensions">
        {summary.benchmarkDimensions.map((dimension) => (
          <article key={dimension.id}>
            <span>{dimension.name}</span>
            <h3>{dimension.passCondition}</h3>
            <p>{dimension.failureResponse}</p>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED strategic execution layer">
        <div className="section-heading">
          <p className="eyebrow">Strategic Execution Layer</p>
          <h2>{strategicExecution.mantra}</h2>
          <p>{strategicExecution.boundary}</p>
        </div>
        <article className="module-row">
          <div>
            <span>{strategicExecution.agentRuntimeContextBridge.status}</span>
            <h2>Agent Runtime context bridge</h2>
          </div>
          <p>{strategicExecution.agentRuntimeContextBridge.workflowPlannerContract}</p>
          <div>
            <strong>{strategicExecution.agentRuntimeContextBridge.manifestHash}</strong>
            <ul className="compact-list">
              <li>Required before every synthetic agent run: {strategicExecution.agentRuntimeContextBridge.requiredForEverySyntheticAgentRun ? "yes" : "no"}</li>
              <li>Selected modules: {strategicExecution.agentRuntimeContextBridge.selectedModuleIds.join(", ")}</li>
              <li>Validators: {strategicExecution.agentRuntimeContextBridge.validatorIds.join(", ")}</li>
              <li>{strategicExecution.agentRuntimeContextBridge.failClosed}</li>
            </ul>
          </div>
        </article>
        <article className="module-row">
          <div>
            <span>{strategicExecution.storedVectorLookupBackendReadiness.status}</span>
            <h2>Stored-vector lookup backend RPCs</h2>
          </div>
          <p>{strategicExecution.storedVectorLookupBackendReadiness.storageBoundary}</p>
          <div>
            <strong>{strategicExecution.storedVectorLookupBackendReadiness.migration}</strong>
            <ul className="compact-list">
              <li>RPCs: {strategicExecution.storedVectorLookupBackendReadiness.rpcContracts.join(", ")}</li>
              <li>Controls: {strategicExecution.storedVectorLookupBackendReadiness.safetyControls.slice(0, 4).join(", ")}</li>
              <li>{strategicExecution.storedVectorLookupBackendReadiness.pendingOperationalStep}</li>
            </ul>
          </div>
        </article>
        {strategicExecution.storedVectorLookupPlans.map((plan) => (
          <article className="module-row" key={plan.domain}>
            <div>
              <span>stored-vector lookup</span>
              <h2>{plan.domain}</h2>
            </div>
            <p>{plan.replacementPattern}</p>
            <div>
              <strong>{plan.internalRpcContract}</strong>
              <ul className="compact-list">
                <li>{plan.latencyWin}</li>
                <li>{plan.safetyBoundary}</li>
                <li>{plan.migrationGate}</li>
              </ul>
            </div>
          </article>
        ))}
        {strategicExecution.governedWorkflowOrchestrationLanes.map((lane) => (
          <article className="module-row" key={lane.lane}>
            <div>
              <span>{lane.lane}</span>
              <h2>{lane.patientIntent}</h2>
            </div>
            <p>{lane.governedActions.join(", ")}</p>
            <div>
              <strong>{lane.approvalGate}</strong>
              <ul className="compact-list">
                <li>Blocked: {lane.blockedAutomation.join(", ")}</li>
                <li>{lane.speedControl}</li>
              </ul>
            </div>
          </article>
        ))}
        <article className="module-row">
          <div>
            <span>observability</span>
            <h2>Real-world performance slices prepared for synthetic evaluation first</h2>
          </div>
          <p>{strategicExecution.healthcareAiObservabilitySlices.map((slice) => slice.dimension).join(", ")}</p>
          <div>
            <strong>silent degradation detection</strong>
            <ul className="compact-list">
              <li>MedLog-style fields: {strategicExecution.medLogStyleUsageFields.map((field) => field.field).join(", ")}</li>
              <li>MLflow-style registries: {strategicExecution.mlflowStyleEvaluationLayers.map((layer) => layer.registry).join(", ")}</li>
              <li>Inference backlog: {strategicExecution.inferenceEfficiencyBacklog.map((item) => item.item).join(", ")}</li>
            </ul>
          </div>
        </article>
        <article className="module-row">
          <div>
            <span>patient engagement</span>
            <h2>Prescription engagement workflow remains review-gated</h2>
          </div>
          <p>{strategicExecution.prescriptionEngagementWorkflow.map((step) => step.step).join(", ")}</p>
          <div>
            <strong>No autonomous outreach</strong>
            <ul className="compact-list">
              {strategicExecution.prescriptionEngagementWorkflow.map((step) => (
                <li key={step.step}>{step.safeOutput}</li>
              ))}
            </ul>
          </div>
        </article>
      </section>

      <section className="section-band principle-grid" aria-label="SCRIMED build roadmap validation">
        {summary.validation.checks.map((check) => (
          <article key={check.check}>
            <span>{check.passed ? "pass" : "fail"}</span>
            <h3>{check.check}</h3>
            <p>{check.detail}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
