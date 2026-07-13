import Link from "next/link";
import { getScrimedIntelligenceSafetyStackSummary } from "../lib/scrimedIntelligenceSafetyStack";

export const metadata = {
  title: "SCRIMED Intelligence & Safety Stack",
  description:
    "Project SENTINEL, AI Flight Recorder, clinical safety, healthcare data infrastructure, outcomes, orchestration, and governance scaffolding for SCRIMED."
};

export default function ScrimedIntelligenceSafetyStackPage() {
  const summary = getScrimedIntelligenceSafetyStackSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/scrimed-operating-command">
          Operating Command
        </Link>
        <p className="eyebrow">SCRIMED Intelligence & Safety Stack</p>
        <h1>Project SENTINEL turns agent ambition into governed, observable, deny-by-default execution.</h1>
        <p className="hero-text">
          This stack binds zero-trust agent identity, policy decisions, scoped tool access, flight recording, clinical
          correctness safeguards, local-first de-identification, outcome review, state-aware orchestration, and
          compliance guardrails into one metadata-only control surface.
        </p>
        <div className="hero-actions" aria-label="SCRIMED Intelligence & Safety Stack actions">
          <Link href="/api/scrimed-intelligence-safety-stack">Inspect API</Link>
          <Link href="/api/scrimed-intelligence-safety-stack/evaluate">Sentinel Evaluator</Link>
          <Link href="/api/scrimed-intelligence-safety-stack/review-packets">Review Packets</Link>
          <Link href="/api/scrimed-intelligence-safety-stack/regression-manifest">Regression Manifest</Link>
          <Link href="/api/scrimed-intelligence-safety-stack/regression-promotion-gate">Promotion Gate</Link>
          <Link href="/api/scrimed-intelligence-safety-stack/regression-disposition-preview">
            Disposition Preview
          </Link>
          <Link href="/api/scrimed-intelligence-safety-stack/brief">Download Brief</Link>
          <Link href="/scrimed-intelligence-platform">Intelligence Platform</Link>
          <Link href="/scrimed-operating-command">Operating Command</Link>
          <Link href="/clinical-data-governance">Data Governance</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED Intelligence & Safety Stack summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Sentinel agents</span>
          <strong>{summary.sentinel.agents.length}</strong>
        </article>
        <article>
          <span>Irreversible actions</span>
          <strong>{summary.sentinel.irreversibleActions.length}</strong>
        </article>
        <article>
          <span>Eval samples</span>
          <strong>{summary.sentinel.evaluationSamples.length}</strong>
        </article>
        <article>
          <span>Review packets</span>
          <strong>{summary.sentinel.reviewPacketCount}</strong>
        </article>
        <article>
          <span>Regression candidates</span>
          <strong>{summary.sentinel.regressionCandidateCount}</strong>
        </article>
        <article>
          <span>Regression cases</span>
          <strong>{summary.sentinel.regressionManifestCaseCount}</strong>
        </article>
        <article>
          <span>Promotion blocked</span>
          <strong>{summary.sentinel.regressionPromotionBlockedCount}</strong>
        </article>
        <article>
          <span>Preview samples</span>
          <strong>{summary.sentinel.dispositionPreviewSampleCount}</strong>
        </article>
        <article>
          <span>Flight steps</span>
          <strong>{summary.flightRecorder.steps.length}</strong>
        </article>
        <article>
          <span>Data adapters</span>
          <strong>{summary.dataInfrastructure.adapters.length}</strong>
        </article>
        <article>
          <span>Outcome entities</span>
          <strong>{summary.outcomes.trackingEntities.length}</strong>
        </article>
        <article>
          <span>Model routes</span>
          <strong>{summary.orchestration.modelRoutes.length}</strong>
        </article>
        <article>
          <span>Policy scaffolds</span>
          <strong>{summary.governance.policies.length}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="SCRIMED Intelligence & Safety Stack boundary">
        <div>
          <p className="eyebrow">Safety Boundary</p>
          <h2>Metadata can move. Protected healthcare actions cannot.</h2>
        </div>
        <div>
          <p>{summary.boundary}</p>
          <p>
            Sentinel remains deny-by-default. Human approval is required for database deletion, schema changes, PHI
            export, credential rotation, cloud IAM changes, production deploys, payment execution, encryption-key
            generation, and external communications.
          </p>
        </div>
      </section>

      <section className="table-section" aria-label="Project SENTINEL audit events">
        <div className="section-heading">
          <p className="eyebrow">Project SENTINEL</p>
          <h2>Every agent action must pass through identity, policy, permission, scoped tool access, execution, and audit logging.</h2>
        </div>
        {summary.sentinel.auditEvents.map((event) => (
          <article className="module-row" key={event.eventId}>
            <div>
              <span>{event.decision}</span>
              <h2>{event.requestId}</h2>
            </div>
            <p>{event.reason}</p>
            <div>
              <strong>{event.actionType}</strong>
              <ul className="compact-list">
                <li>Agent: {event.agentId}</li>
                <li>Tool: {event.requestedTool}</li>
                <li>Human approval: {event.humanApprovalRequired ? "required" : "not required"}</li>
                <li>Kill switch: {event.killSwitchTriggers.length ? event.killSwitchTriggers.join(", ") : "none"}</li>
                <li>Audit hash: {event.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Project SENTINEL review packets">
        <div className="section-heading">
          <p className="eyebrow">Review Packets</p>
          <h2>Blocked and approval-required actions become reviewer packets, not execution permission.</h2>
          <p>
            Protected persistence remains blocked until fresh AAL2 evidence and boundary-release approval are available.
          </p>
        </div>
        {summary.sentinel.reviewPackets.map((packet) => (
          <article className="module-row" key={packet.packetId}>
            <div>
              <span>{packet.reviewPriority}</span>
              <h2>{packet.packetId}</h2>
            </div>
            <p>{packet.nextHumanAction}</p>
            <div>
              <strong>{packet.decisionRequired}</strong>
              <ul className="compact-list">
                <li>Reviewer: {packet.reviewerRole}</li>
                <li>Trace: {packet.traceId}</li>
                <li>Regression candidate: {packet.regressionCandidate ? "yes" : "no"}</li>
                <li>Missing evidence: {packet.missingEvidence.length ? packet.missingEvidence.join(", ") : "none"}</li>
                <li>Allowed disposition: {packet.allowedDisposition.join(", ")}</li>
                <li>Blocked disposition: {packet.blockedDisposition.join(", ")}</li>
                <li>Hash: {packet.packetHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Project SENTINEL regression manifest">
        <div className="section-heading">
          <p className="eyebrow">Regression Manifest</p>
          <h2>Failed or blocked traces become nonsecret regression candidates after human review.</h2>
          <p>
            {summary.sentinel.regressionManifest.status}; protected persistence remains{" "}
            {summary.sentinel.regressionManifest.protectedPersistence}.
          </p>
        </div>
        {summary.sentinel.regressionManifest.cases.map((item) => (
          <article className="module-row" key={item.caseId}>
            <div>
              <span>{item.promotionStatus}</span>
              <h2>{item.caseId}</h2>
            </div>
            <p>{item.scenario}</p>
            <div>
              <strong>{item.expectedPolicyDecision}</strong>
              <ul className="compact-list">
                <li>Reviewer gate: {item.reviewerGate}</li>
                <li>Dataset: {item.datasetId}</li>
                <li>Fixture boundary: {item.fixtureBoundary}</li>
                <li>Assertions: {item.requiredAssertions.join(", ")}</li>
                <li>Blocked from: {item.blockedFrom.join(", ")}</li>
                <li>Hash: {item.manifestHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Project SENTINEL regression promotion gate">
        <div className="section-heading">
          <p className="eyebrow">Promotion Gate</p>
          <h2>Regression candidates need human pass disposition before becoming nonsecret test metadata.</h2>
          <p>
            {summary.sentinel.regressionPromotionGate.status}; no execution authority is granted by this gate.
          </p>
        </div>
        {summary.sentinel.regressionPromotionGate.caseDecisions.map((item) => (
          <article className="module-row" key={item.gateCaseId}>
            <div>
              <span>{item.promotionDecision}</span>
              <h2>{item.gateCaseId}</h2>
            </div>
            <p>
              Review status is {item.reviewStatus}. Allowed promotion target is {item.allowedPromotionTarget}.
            </p>
            <div>
              <strong>{item.expectedPolicyDecision}</strong>
              <ul className="compact-list">
                <li>Reviewer gate: {item.reviewerGate}</li>
                <li>Required: {item.requiredBeforePromotion.join(", ")}</li>
                <li>Blocked reasons: {item.blockedReasons.join(", ") || "none"}</li>
                <li>Disallowed targets: {item.disallowedPromotionTargets.join(", ")}</li>
                <li>Hash: {item.gateHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Project SENTINEL regression disposition preview">
        <div className="section-heading">
          <p className="eyebrow">Disposition Preview</p>
          <h2>Reviewer dispositions can be validated as metadata before any protected persistence exists.</h2>
          <p>
            The preview route rejects token-like fields, PHI-like notes, role mismatches, unsupported dispositions, and
            oversized evidence references.
          </p>
        </div>
        {summary.sentinel.dispositionPreviewSamples.map((sample) => (
          <article className="module-row" key={`${sample.caseId}-${sample.reviewerRole}`}>
            <div>
              <span>{sample.disposition}</span>
              <h2>{sample.caseId}</h2>
            </div>
            <p>{sample.notesSummary}</p>
            <div>
              <strong>{sample.reviewerRole}</strong>
              <ul className="compact-list">
                <li>Evidence refs: {sample.evidenceRefs?.join(", ") ?? "none"}</li>
                <li>No persistence: true</li>
                <li>No execution authority: true</li>
                <li>Allowed output: preview metadata only</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band principle-grid" aria-label="AI Flight Recorder">
        <article>
          <span>Flight Recorder</span>
          <h3>Trace every step</h3>
          <p>Steps capture agent id, input/output metadata, tool call, latency, failure, retry, policy decision, and final outcome.</p>
        </article>
        <article>
          <span>Local WAL</span>
          <h3>{summary.flightRecorder.walRecords[0]?.durabilityMode}</h3>
          <p>{summary.flightRecorder.walRecords[0]?.localPathPattern} with metadata-only no-secret/no-PHI redaction.</p>
        </article>
        <article>
          <span>Regression Loop</span>
          <h3>{summary.flightRecorder.evaluationDatasets[0]?.datasetId}</h3>
          <p>Failed traces can be promoted into pytest-compatible AI regression tests after human review.</p>
        </article>
      </section>

      <section className="table-section" aria-label="Clinical Safety Trust Layer">
        <div className="section-heading">
          <p className="eyebrow">Clinical Safety</p>
          <h2>Capability is separated from correctness; high-risk outputs stay clinician-in-the-loop.</h2>
        </div>
        {summary.clinicalSafety.correctnessEnvelopes.map((envelope) => (
          <article className="module-row" key={envelope.outputId}>
            <div>
              <span>{envelope.groundedness}</span>
              <h2>{envelope.outputId}</h2>
            </div>
            <p>{envelope.capabilityClaim}</p>
            <div>
              <strong>Confidence {envelope.confidence}</strong>
              <ul className="compact-list">
                <li>Evidence: {envelope.evidenceQuality}</li>
                <li>Source quality: {envelope.sourceQuality}</li>
                <li>Clinician review: {envelope.clinicianInLoopRequired ? "required" : "not required"}</li>
                <li>Red flags: {envelope.clinicalRedFlags.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Healthcare Data Infrastructure">
        <div className="section-heading">
          <p className="eyebrow">Healthcare Data Infrastructure</p>
          <h2>Adapters normalize healthcare inputs into semantic metadata while blocking raw payload logs.</h2>
          <p>
            DocLang-style representation preserves {summary.dataInfrastructure.docLangStructure.preserves.join(", ")} with{" "}
            {summary.dataInfrastructure.docLangStructure.geometryModel}.
          </p>
        </div>
        {summary.dataInfrastructure.adapters.map((adapter) => (
          <article className="module-row" key={adapter.adapterId}>
            <div>
              <span>{adapter.kind}</span>
              <h2>{adapter.adapterId}</h2>
            </div>
            <p>{adapter.outputRepresentation}</p>
            <div>
              <strong>Raw payload logging: {adapter.rawPayloadLogging}</strong>
              <ul className="compact-list">
                {adapter.validationRequired.map((rule) => (
                  <li key={`${adapter.adapterId}-${rule}`}>{rule}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Outcome-Focused Product Layer">
        <div className="section-heading">
          <p className="eyebrow">Outcomes</p>
          <h2>Dashboards prioritize meaningful outcomes over vanity metrics.</h2>
          <p>{summary.outcomes.reviewWorkflow}</p>
        </div>
        {summary.outcomes.trackingEntities.map((outcome) => (
          <article className="module-row" key={outcome.outcomeId}>
            <div>
              <span>{outcome.category}</span>
              <h2>{outcome.metric}</h2>
            </div>
            <p>{outcome.vanityMetricReplacement}</p>
            <div>
              <strong>{outcome.reviewAfterPilotPatients} patients</strong>
              <p>{outcome.evidenceSource}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Agent Orchestration Layer">
        <div className="section-heading">
          <p className="eyebrow">State-Aware Orchestration</p>
          <h2>Agents expose plan, state, history, remaining work, budget, and risk before any workflow advancement.</h2>
        </div>
        {summary.orchestration.states.map((state) => (
          <article className="module-row" key={state.sessionId}>
            <div>
              <span>{state.riskLevel}</span>
              <h2>{state.agentId}</h2>
            </div>
            <p>{state.currentPlan.join(" -> ")}</p>
            <div>
              <strong>{state.state}</strong>
              <ul className="compact-list">
                <li>Tool history: {state.toolHistory.join(", ")}</li>
                <li>Remaining: {state.remainingSteps.join(", ")}</li>
                <li>Budget: {state.budget.maxToolCalls} tool calls, {state.budget.maxRetries} retries</li>
                <li>Approvals: {state.humanInLoopApprovals.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Compliance and Governance">
        <div className="section-heading">
          <p className="eyebrow">Compliance & Governance</p>
          <h2>Policy scaffolds prepare SCRIMED for qualified review without claiming certification.</h2>
        </div>
        {summary.governance.policies.map((policy) => (
          <article className="module-row" key={policy.policyId}>
            <div>
              <span>{policy.currentStatus}</span>
              <h2>{policy.framework}</h2>
            </div>
            <p>{policy.controls.join(", ")}</p>
            <div>
              <strong>{policy.policyId}</strong>
              <p>Certification claims blocked: {summary.governance.certificationClaimsBlocked ? "yes" : "no"}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
