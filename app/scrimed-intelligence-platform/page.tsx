import Link from "next/link";
import { getScrimedIntelligencePlatformSummary } from "../lib/scrimedIntelligencePlatform";

export const metadata = {
  title: "SCRIMED Intelligence Platform",
  description:
    "Synthetic-only SCRIMED Intelligence Platform for governed healthcare AI orchestration, provenance, evaluation, model routing, and outcome intelligence."
};

export default function ScrimedIntelligencePlatformPage() {
  const summary = getScrimedIntelligencePlatformSummary();
  const highRiskModules = summary.intelligenceMesh.modules.filter(
    (module) => module.human_review_required
  );

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/scrimed-os">
          SCRIMED OS
        </Link>
        <p className="eyebrow">SCRIMED Intelligence Platform</p>
        <h1>Governed healthcare intelligence infrastructure where models are routed, checked, traced, and review-gated.</h1>
        <p className="hero-text">
          This operating surface exposes the synthetic-only Intelligence Mesh, Clinical Memory Graph, provenance and
          confidence envelope, AI Flight Recorder, evaluation pipeline, Synthetic Patient Studio, outcome KPIs,
          provider-neutral model routing, and SCRIMED University readiness tracks.
        </p>
        <div className="hero-actions" aria-label="SCRIMED Intelligence Platform actions">
          <Link href="/api/scrimed-intelligence-platform">Inspect Platform API</Link>
          <Link href="/api/scrimed-intelligence-platform/brief">Download Brief</Link>
          <Link href="/api/scrimed-intelligence-platform/evaluate">Evaluation Gate</Link>
          <Link href="/scrimed-build-roadmap">Build Roadmap</Link>
          <Link href="/scrimed-trustops">TrustOps</Link>
          <Link href="/clinical-robustness-lab">Robustness Lab</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED Intelligence Platform summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Modules</span>
          <strong>{summary.intelligenceMesh.moduleCount}</strong>
        </article>
        <article>
          <span>High risk</span>
          <strong>{summary.intelligenceMesh.highRiskModuleCount}</strong>
        </article>
        <article>
          <span>Graph nodes</span>
          <strong>{summary.clinicalMemoryGraph.nodeCount}</strong>
        </article>
        <article>
          <span>Graph edges</span>
          <strong>{summary.clinicalMemoryGraph.edgeCount}</strong>
        </article>
        <article>
          <span>Eval checks</span>
          <strong>{summary.evaluationPipeline.checkCount}</strong>
        </article>
        <article>
          <span>Eval gate</span>
          <strong>{summary.evaluationGate.sampleCount}</strong>
        </article>
        <article>
          <span>Synthetic cohort</span>
          <strong>{summary.syntheticPatientStudio.cohort.length}</strong>
        </article>
        <article>
          <span>University tracks</span>
          <strong>{summary.scrimedUniversity.trackCount}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="SCRIMED Intelligence Platform boundary">
        <div>
          <p className="eyebrow">GO / NO-GO</p>
          <h2>SCRIMED can demonstrate governed intelligence now; live clinical authority remains blocked.</h2>
        </div>
        <div>
          <p>{summary.boundary}</p>
          <p>{summary.provenanceConfidence.output.clinical_disclaimer}</p>
          <p>
            Production approval: {summary.productionApproval ? "enabled" : "blocked"}. No-PHI confirmed:{" "}
            {summary.noPhiConfirmed ? "yes" : "no"}.
          </p>
        </div>
      </section>

      <section className="table-section" aria-label="SCRIMED Intelligence Mesh">
        <div className="section-heading">
          <p className="eyebrow">Intelligence Mesh</p>
          <h2>Every module has typed risk, data classification, allowed tools, blocked tools, and human-review routing.</h2>
        </div>
        {summary.intelligenceMesh.modules.map((module) => (
          <article className="module-row" key={module.module}>
            <div>
              <span>{module.risk_level}</span>
              <h2>{module.module}</h2>
            </div>
            <p>{module.purpose}</p>
            <div>
              <strong>{module.data_classification}</strong>
              <ul className="compact-list">
                <li>Human review required: {module.human_review_required ? "yes" : "no"}</li>
                <li>Allowed tools: {module.allowed_tools.join(", ")}</li>
                <li>Blocked tools: {module.blocked_tools.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Clinical Memory Graph">
        <div className="section-heading">
          <p className="eyebrow">Clinical Memory Graph</p>
          <h2>Concepts preserve provenance and relationships without exposing raw schemas, PHI, or connector payloads.</h2>
        </div>
        {summary.clinicalMemoryGraph.nodes.map((node) => (
          <article className="module-row" key={node.id}>
            <div>
              <span>{node.type}</span>
              <h2>{node.label}</h2>
            </div>
            <p>{node.summary}</p>
            <div>
              <strong>{node.data_classification}</strong>
              <ul className="compact-list">
                <li>Source: {node.provenance.source_label}</li>
                <li>Source type: {node.provenance.source_type}</li>
                <li>Steward: {node.provenance.steward}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band principle-grid" aria-label="Provenance confidence and flight recorder">
        <article>
          <span>Provenance</span>
          <h3>{summary.provenanceConfidence.output.output_id}</h3>
          <p>{summary.provenanceConfidence.output.uncertainty_reason}</p>
          <ul className="compact-list">
            <li>Confidence: {summary.provenanceConfidence.output.confidence_score}</li>
            <li>Validation: {summary.provenanceConfidence.output.human_validation_status}</li>
            <li>Audit hash: {summary.provenanceConfidence.output.audit_hash}</li>
          </ul>
        </article>
        <article>
          <span>Flight Recorder</span>
          <h3>{summary.flightRecorder.records[0]?.request_id}</h3>
          <p>{summary.flightRecorder.records[0]?.user_intent}</p>
          <ul className="compact-list">
            <li>Model: {summary.flightRecorder.records[0]?.model_used}</li>
            <li>Latency: {summary.flightRecorder.records[0]?.latency_ms} ms</li>
            <li>Override: {summary.flightRecorder.records[0]?.override_status}</li>
          </ul>
        </article>
        <article>
          <span>Model Router</span>
          <h3>Provider-neutral synthetic routing</h3>
          <p>Providers: {summary.modelRouter.providers.join(", ")}.</p>
          <ul className="compact-list">
            {summary.modelRouter.decisions.map((decision) => (
              <li key={`${decision.provider}-${decision.route_status}`}>
                {decision.route_status}: {decision.rationale}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="table-section" aria-label="Evaluation Pipeline">
        <div className="section-heading">
          <p className="eyebrow">Evaluation Pipeline</p>
          <h2>Release-blocking checks require provenance, confidence, PHI blocking, clinical-action blocking, and trace metadata.</h2>
        </div>
        {summary.evaluationPipeline.checks.map((check) => (
          <article className="module-row" key={check.id}>
            <div>
              <span>{check.status}</span>
              <h2>{check.id}</h2>
            </div>
            <p>{check.evidence}</p>
            <div>
              <strong>{check.enforcement}</strong>
              <p>{check.failure_mode}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Synthetic Evaluation Gate">
        <div className="section-heading">
          <p className="eyebrow">Evaluation Gate</p>
          <h2>Metadata-only evaluation requests return allowed, human-review-required, or blocked decisions before any model or workflow use.</h2>
          <p>
            Route: {summary.evaluationGate.route}. The gate rejects raw notes, PHI, connector payloads, token-like
            values, blocked tools, and autonomous clinical or payer actions.
          </p>
        </div>
        {summary.evaluationGate.sampleResults.map((result) => (
          <article className="module-row" key={result.request_id}>
            <div>
              <span>{result.decision}</span>
              <h2>{result.request_id}</h2>
            </div>
            <p>{result.guardrail_decision.reason}</p>
            <div>
              <strong>{result.status}</strong>
              <ul className="compact-list">
                <li>HTTP status: {result.http_status}</li>
                <li>Failed checks: {result.failed_checks.length ? result.failed_checks.join(", ") : "none"}</li>
                <li>Required actions: {result.required_actions.length ? result.required_actions.join(", ") : "none"}</li>
                <li>Audit hash: {result.audit_hash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band principle-grid" aria-label="Synthetic Patient Studio and outcomes">
        <article>
          <span>{summary.syntheticPatientStudio.generator}</span>
          <h3>Synthetic Patient Studio</h3>
          <p>
            Seed {summary.syntheticPatientStudio.seed} generates {summary.syntheticPatientStudio.cohort.length} synthetic
            records and {summary.syntheticPatientStudio.fhir_r4_bundle_stub.entry.length} FHIR R4 stub entries.
          </p>
          <ul className="compact-list">
            {summary.syntheticPatientStudio.cohort.map((patient) => (
              <li key={patient.synthetic_patient_id}>
                {patient.synthetic_patient_id}: {patient.age_band}, {patient.geography}
              </li>
            ))}
          </ul>
        </article>
        <article>
          <span>Outcome Intelligence</span>
          <h3>Dashboard-ready KPI schema</h3>
          <ul className="compact-list">
            <li>Clinical readmissions: {summary.outcomeIntelligence.dashboardSample.clinical.readmissions}</li>
            <li>Financial denials: {summary.outcomeIntelligence.dashboardSample.financial.denials}</li>
            <li>Documentation time: {summary.outcomeIntelligence.dashboardSample.operational.documentation_time}</li>
            <li>Patient engagement: {summary.outcomeIntelligence.dashboardSample.patient.engagement}</li>
          </ul>
        </article>
        <article>
          <span>Human review</span>
          <h3>{highRiskModules.length} modules route to oversight</h3>
          <p>High-risk modules cannot promote to production behavior without qualified review and boundary release evidence.</p>
          <ul className="compact-list">
            {highRiskModules.map((module) => (
              <li key={module.module}>{module.module}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="table-section" aria-label="SCRIMED University">
        <div className="section-heading">
          <p className="eyebrow">SCRIMED University</p>
          <h2>Education tracks support readiness, not regulatory, partner, clinical, security, or hospital certification.</h2>
        </div>
        {summary.scrimedUniversity.tracks.map((track) => (
          <article className="module-row" key={track.id}>
            <div>
              <span>{track.status}</span>
              <h2>{track.name}</h2>
            </div>
            <p>{track.audience}</p>
            <div>
              <strong>{track.completion_artifact}</strong>
              <p>{track.disclaimer}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band principle-grid" aria-label="Retained NO-GO boundaries">
        {summary.guardrails.noGoBoundaries.map((boundary) => (
          <article key={boundary}>
            <span>NO-GO</span>
            <h3>{boundary}</h3>
          </article>
        ))}
      </section>
    </main>
  );
}
