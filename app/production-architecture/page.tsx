import Link from "next/link";
import { getProductionArchitectureSummary } from "../lib/productionArchitecture";

export const metadata = {
  title: "SCRIMED Production Architecture",
  description:
    "Review SCRIMED's production-grade healthcare AI architecture contract across agents, context, trust, model routing, evaluation, ClinSecOps, and deterministic workflows."
};

export default function ProductionArchitecturePage() {
  const summary = getProductionArchitectureSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/hub">Hub</Link>
        <p className="eyebrow">SCRIMED Production Architecture v1</p>
        <h1>AI-native healthcare infrastructure with agents, trust, context, model routing, evals, ClinSecOps, and workflow controls.</h1>
        <p className="hero-text">
          SCRIMED now exposes a governed architecture contract for the next platform layer: persistent agent runtime,
          PHI-safe context handling, Trust Engine v2, vendor-neutral model routing, continuous evaluation, ClinSecOps,
          and deterministic workflow execution. The current state remains synthetic, metadata-only, and human-review gated.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href="/api/production-architecture">
            Inspect Architecture API
          </a>
          <a className="secondary-action" href="/api/production-architecture/brief">
            Download Brief
          </a>
          <Link className="secondary-action" href="/healthcare-intelligence-os">
            Healthcare OS
          </Link>
          <Link className="secondary-action" href="/platform-power">
            Platform Power
          </Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Production architecture summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Readiness</span>
          <strong>{summary.validation.status}</strong>
        </article>
        <article>
          <span>Layers</span>
          <strong>{summary.layerCount}</strong>
        </article>
        <article>
          <span>Model providers</span>
          <strong>{summary.modelProviderCount}</strong>
        </article>
        <article>
          <span>Context domains</span>
          <strong>{summary.contextDomainCount}</strong>
        </article>
        <article>
          <span>Trust controls</span>
          <strong>{summary.trustControlCount}</strong>
        </article>
        <article>
          <span>Eval scenarios</span>
          <strong>{summary.evaluationScenarioCount}</strong>
        </article>
        <article>
          <span>Workflow tracks</span>
          <strong>{summary.workflowTrackCount}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">GO / NO-GO</p>
          <h2>{summary.readinessAssessment}</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.hardStops.map((stop, index) => (
            <div className="layer-row" key={stop}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{stop}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Production architecture layers">
        <div className="section-heading">
          <p className="eyebrow">Architecture layers</p>
          <h2>Seven layers convert SCRIMED from product surfaces into a governed healthcare intelligence operating system.</h2>
        </div>
        {summary.layers.map((layer) => (
          <article className="module-row" key={layer.id}>
            <div>
              <span>{layer.status}</span>
              <h2>{layer.name}</h2>
            </div>
            <p>{layer.objective}</p>
            <div>
              <strong>{layer.currentCapabilities.join(" ")}</strong>
              <ul className="compact-list">
                <li>Before production: {layer.requiredBeforeProduction.join(", ")}</li>
                <li>Audit artifacts: {layer.auditArtifacts.join(", ")}</li>
                <li>Blocked autonomy: {layer.blockedAutonomy.join(", ")}</li>
                <li>Routes: {layer.linkedRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED Intelligence Layer model provider mesh">
        <div className="section-heading">
          <p className="eyebrow">SCRIMED Intelligence Layer</p>
          <h2>OpenAI, Claude, Gemini, Llama, Mistral, Qwen, Z.ai GLM, DeepSeek, and future models flow through the clinical orchestrator before SCRIMED agents.</h2>
          <p className="section-copy">
            Provider choice is a routed, logged, review-gated decision based on task type, cost, latency, risk, privacy,
            quality, regional posture, fallback readiness, and approved data boundaries.
          </p>
        </div>
        {summary.modelProviderMesh.map((provider) => (
          <article className="module-row" key={provider.slug}>
            <div>
              <span>{provider.status}</span>
              <h2>{provider.name}</h2>
            </div>
            <p>{provider.primaryUse}</p>
            <div>
              <strong>{provider.providerClass}</strong>
              <ul className="compact-list">
                <li>Routing criteria: {provider.routingCriteria.join(", ")}</li>
                <li>Telemetry: {provider.requiredTelemetry.join(", ")}</li>
                <li>Blocked: {provider.blockedUses.join(", ")}</li>
                <li>{provider.retainedBoundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Context Engine domains">
        <div className="section-heading">
          <p className="eyebrow">Context Engine</p>
          <h2>Every model call should receive compressed, source-attributed, least-necessary context.</h2>
        </div>
        <div className="principle-grid">
          {summary.contextDomains.map((domain) => (
            <article key={domain.domain}>
              <span>PHI-safe</span>
              <h3>{domain.domain}</h3>
              <p>{domain.purpose}</p>
              <ul className="compact-list">
                <li>Allowed: {domain.allowedInputs.join(", ")}</li>
                <li>Denied: {domain.deniedInputs.join(", ")}</li>
                <li>Compression: {domain.compressionRules.join(", ")}</li>
                <li>{domain.phiSafeHandling}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band" aria-label="Trust Engine v2 controls">
        <div className="section-heading">
          <p className="eyebrow">Trust Engine v2</p>
          <h2>Evidence, confidence, risk, reviewer state, refusal boundaries, and immutable audit events become required output fields.</h2>
        </div>
        <div className="principle-grid">
          {summary.trustEngineV2Controls.map((control) => (
            <article key={control.control}>
              <span>{control.status}</span>
              <h3>{control.control}</h3>
              <p>{control.outputContract}</p>
              <ul className="compact-list">
                <li>{control.reviewerState}</li>
                <li>{control.escalationBoundary}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Evaluation and workflow engine">
        <div className="section-heading">
          <p className="eyebrow">Evaluation and workflows</p>
          <h2>Continuous evals catch model, agent, evidence, clinical-safety, regression, adversarial, and missing-data failures before release.</h2>
        </div>
        {summary.evaluationScenarios.map((scenario) => (
          <article className="module-row" key={scenario.slug}>
            <div>
              <span>{scenario.category}</span>
              <h2>{scenario.scenario}</h2>
            </div>
            <p>{scenario.failureAction}</p>
            <div>
              <strong>Pass criteria</strong>
              <ul className="compact-list">
                {scenario.passCriteria.map((criterion) => (
                  <li key={criterion}>{criterion}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
        {summary.workflowEngineTracks.map((track) => (
          <article className="module-row" key={track.workflow}>
            <div>
              <span>deterministic</span>
              <h2>{track.workflow}</h2>
            </div>
            <p>{track.deterministicOwner}</p>
            <div>
              <strong>LLMs allowed for: {track.llmAllowedFor.join(", ")}</strong>
              <ul className="compact-list">
                <li>Human approval required for: {track.humanApprovalRequiredFor.join(", ")}</li>
                <li>Rollback/fallback: {track.rollbackFallback}</li>
                <li>Blocked autonomy: {track.blockedAutonomy.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="ClinSecOps controls">
        <div className="section-heading">
          <p className="eyebrow">ClinSecOps</p>
          <h2>Security, privacy, compliance, auditability, and prompt-injection defenses stay in the release path.</h2>
        </div>
        <div className="principle-grid">
          {summary.clinSecOpsControls.map((control) => (
            <article key={control.control}>
              <span>control</span>
              <h3>{control.control}</h3>
              <p>{control.currentImplementation}</p>
              <ul className="compact-list">
                <li>Production gate: {control.productionGate}</li>
                <li>Blocked failure mode: {control.blockedFailureMode}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band" aria-label="Validation checks">
        <div className="section-heading">
          <p className="eyebrow">Contract validation</p>
          <h2>The architecture contract is executable enough to fail the release if core safety invariants disappear.</h2>
        </div>
        <div className="principle-grid">
          {summary.validation.checks.map((check) => (
            <article key={check.check}>
              <span>{check.passed ? "pass" : "fail"}</span>
              <h3>{check.check}</h3>
              <p>{check.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
