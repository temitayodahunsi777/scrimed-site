import Link from "next/link";
import { getScrimedOSImplementationPlanSummary } from "../lib/scrimedOSImplementationPlan";
import { getScrimedOSUpgradeBatchSummary } from "../lib/scrimedOSUpgradeBatch";

export const metadata = {
  title: "SCRIMED OS Implementation Plan",
  description:
    "Production-ready roadmap and starter architecture for SCRIMED's Healthcare Intelligence Operating System."
};

export default function ScrimedOSImplementationPlanPage() {
  const summary = getScrimedOSImplementationPlanSummary();
  const upgradeBatch = getScrimedOSUpgradeBatchSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/production-architecture">
          Production Architecture
        </Link>
        <p className="eyebrow">SCRIMED OS Implementation Plan</p>
        <h1>Healthcare Intelligence Operating System roadmap for agents, events, registries, clinical workflows, and governed deployment.</h1>
        <p className="hero-text">
          SCRIMED OS is designed to securely orchestrate frontier models, zero-trust agents, FHIR/EHR and imaging workflows,
          governed MCP tools, CodeMode runtimes, auditability, outcome learning, observability, and enterprise deployment.
        </p>
        <div className="hero-actions" aria-label="SCRIMED OS plan actions">
          <Link href="/api/scrimed-os/implementation-plan">Inspect Plan API</Link>
          <Link href="/api/scrimed-os/implementation-plan/brief">Download Brief</Link>
          <Link href="/api/scrimed-os/upgrade-batch">Inspect Upgrade Batch</Link>
          <Link href="/api/scrimed-os/upgrade-batch/brief">Download Upgrade Brief</Link>
          <Link href="/investor-readiness">Investor Readiness</Link>
          <Link href="/clinical-robustness-lab">Clinical Robustness Lab</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED OS implementation summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Capabilities</span>
          <strong>{summary.capabilityCount}</strong>
        </article>
        <article>
          <span>Phases</span>
          <strong>{summary.phaseCount}</strong>
        </article>
        <article>
          <span>Domains</span>
          <strong>{summary.domainCount}</strong>
        </article>
        <article>
          <span>Agents</span>
          <strong>{summary.agentCount}</strong>
        </article>
        <article>
          <span>Validation</span>
          <strong>{summary.validation.status}</strong>
        </article>
        <article>
          <span>Upgrade batch</span>
          <strong>{upgradeBatch.validation.status}</strong>
        </article>
        <article>
          <span>Runtime savings</span>
          <strong>{upgradeBatch.runtimeOptimizer.simulatedCostSavingsPercent}%</strong>
        </article>
        <article>
          <span>Cost metrics</span>
          <strong>{upgradeBatch.tokenEconomicsDashboard.metrics.length}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="SCRIMED OS boundary">
        <div>
          <p className="eyebrow">GO / NO-GO</p>
          <h2>SCRIMED OS is an operating system plan, not live clinical authority.</h2>
        </div>
        <div>
          <p>{summary.boundary}</p>
          <p>{summary.currentGoScope}</p>
          <p>{summary.noGoScope}</p>
        </div>
      </section>

      <section className="section-band" id="upgrade-batch" aria-label="SCRIMED OS upgrade batch">
        <div className="section-heading">
          <p className="eyebrow">SCRIMED OS Upgrade Batch</p>
          <h2>Runtime, prompt, judge, oversight, economics, knowledge, model, and research readiness stay synthetic and metadata-only.</h2>
          <p className="section-copy">{upgradeBatch.boundary}</p>
        </div>
        <div className="principle-grid">
          <article>
            <span>{upgradeBatch.runtimeOptimizer.status}</span>
            <h3>Runtime Optimizer</h3>
            <p>
              Simulated cost savings: {upgradeBatch.runtimeOptimizer.simulatedCostSavingsPercent}%.
              Guardrail state: {upgradeBatch.runtimeOptimizer.guardrailState}.
            </p>
            <ul className="compact-list">
              {upgradeBatch.runtimeOptimizer.records.map((record) => (
                <li key={record.id}>
                  {record.name}: {record.latencyClass}; {record.costClass}; {record.safetyClass}
                </li>
              ))}
            </ul>
          </article>
          <article>
            <span>{upgradeBatch.promptEvolutionEngine.status}</span>
            <h3>Prompt Evolution Engine</h3>
            <p>
              Prompt versions track baseline score, optimized score, clinician review, and blocked deployment status before promotion.
            </p>
            <ul className="compact-list">
              {upgradeBatch.promptEvolutionEngine.prompts.map((prompt) => (
                <li key={prompt.prompt_id}>
                  {prompt.prompt_id}: {prompt.deployment_status}; {prompt.baseline_score} to {prompt.optimized_score}
                </li>
              ))}
            </ul>
          </article>
          <article>
            <span>{upgradeBatch.clinicalJudgeEnsemble.status}</span>
            <h3>Clinical Judge Ensemble</h3>
            <p>{upgradeBatch.clinicalJudgeEnsemble.finalAuthorityStatement}</p>
            <ul className="compact-list">
              {upgradeBatch.clinicalJudgeEnsemble.judges.map((judge) => (
                <li key={judge.id}>{judge.id}: {judge.outputContract}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="section-band" aria-label="Oversight and agent lab">
        <div className="section-heading">
          <p className="eyebrow">Oversight and Agent Lab</p>
          <h2>High-risk clinical-like tasks block until human review, and every lab agent has owner, risk tier, allowed data class, blocked actions, and audit hash.</h2>
        </div>
        <div className="principle-grid">
          {upgradeBatch.humanOversightQueue.queue.map((item) => (
            <article key={item.case_id_hash}>
              <span>{item.status}</span>
              <h3>{item.task_type}</h3>
              <p>{item.escalation_reason}</p>
              <ul className="compact-list">
                <li>Risk tier: {item.risk_tier}</li>
                <li>Reviewer: {item.reviewer_role}</li>
                <li>Execution allowed: {String(item.executionAllowed)}</li>
              </ul>
            </article>
          ))}
        </div>
        <div className="principle-grid">
          {upgradeBatch.agentLab.agents.map((agent) => (
            <article key={agent.agent_id}>
              <span>{agent.risk_tier}</span>
              <h3>{agent.agent_id}</h3>
              <p>Owner: {agent.owner}</p>
              <ul className="compact-list">
                <li>Allowed data: {agent.allowed_data_class}</li>
                <li>Audit hash: {agent.audit_hash.slice(0, 16)}</li>
                <li>Blocked: {agent.blocked_actions.join(", ")}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band" aria-label="Token economics and long-horizon agents">
        <div className="section-heading">
          <p className="eyebrow">Cost per Outcome</p>
          <h2>SCRIMED tracks outcome economics instead of token vanity metrics.</h2>
        </div>
        <div className="principle-grid">
          {upgradeBatch.tokenEconomicsDashboard.metrics.map((metric) => (
            <article key={metric.metric}>
              <span>${metric.syntheticUsd.toFixed(2)}</span>
              <h3>{metric.metric}</h3>
              <p>{metric.economicInterpretation}</p>
              <ul className="compact-list">
                <li>Outcome: {metric.outcomeUnit}</li>
                <li>Avoids vanity metric: {metric.vanityMetricAvoided}</li>
              </ul>
            </article>
          ))}
        </div>
        <div className="section-heading">
          <p className="eyebrow">Long-Horizon Agent Registry</p>
          <h2>Future care-journey agents are lab-only, synthetic, expiring, and human-override required.</h2>
        </div>
        <div className="principle-grid">
          {upgradeBatch.longHorizonAgentRegistry.agents.map((agent) => (
            <article key={agent.name}>
              <span>{agent.status}</span>
              <h3>{agent.name}</h3>
              <p>{agent.memory_policy}</p>
              <ul className="compact-list">
                <li>{agent.escalation_policy}</li>
                <li>{agent.expiry_policy}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Knowledge fabric and model governance">
        <div className="section-heading">
          <p className="eyebrow">Knowledge Fabric and Regression Watch</p>
          <h2>Ontology mapping, model regression, and life-sciences research shells remain governed metadata.</h2>
        </div>
        {upgradeBatch.clinicalKnowledgeFabric.records.map((record) => (
          <article className="module-row" key={record.source}>
            <div>
              <span>{record.status}</span>
              <h2>{record.source}</h2>
            </div>
            <p>{record.semanticLayerUse}</p>
            <strong>{record.productionConstraint}</strong>
          </article>
        ))}
        {upgradeBatch.modelRegressionWatch.models.map((model) => (
          <article className="module-row" key={`${model.model_name}-${model.version}`}>
            <div>
              <span>{model.rollback_available ? "rollback-ready" : "rollback-missing"}</span>
              <h2>{model.model_name}</h2>
            </div>
            <p>Version {model.version}; regression score {model.regression_score}; eval hash {model.last_eval_hash.slice(0, 16)}.</p>
            <strong>Auto-promote to clinical authority: {String(model.autoPromoteToClinicalAuthority)}</strong>
          </article>
        ))}
      </section>

      <section className="section-band principle-grid" aria-label="Public trust and investor narrative">
        {upgradeBatch.publicTrustInvestorNarrative.map((record) => (
          <article key={record.theme}>
            <span>safe copy</span>
            <h3>{record.theme}</h3>
            <p>{record.safeCopy}</p>
            <ul className="compact-list">
              <li>Blocked claims: {record.blockedClaims.join(", ")}</li>
            </ul>
          </article>
        ))}
      </section>

      <section className="section-band principle-grid" aria-label="Architecture principles">
        {summary.principles.map((principle) => (
          <article key={principle}>
            <span>principle</span>
            <h3>{principle}</h3>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Roadmap phases">
        <div className="section-heading">
          <p className="eyebrow">Roadmap</p>
          <h2>Seven phases move SCRIMED from architecture contracts to governed enterprise deployment.</h2>
        </div>
        {summary.capabilitiesByPhase.map((phase) => (
          <article className="module-row" key={phase.phase}>
            <div>
              <span>{phase.phase}</span>
              <h2>{phase.label}</h2>
            </div>
            <p>{phase.objective}</p>
            <div>
              <strong>{phase.capabilities.length} capabilities</strong>
              <ul className="compact-list">
                <li>Capabilities: {phase.capabilities.map((capability) => capability.name).join(", ")}</li>
                <li>Exit criteria: {phase.exitCriteria.join(", ")}</li>
                <li>Blocked until: {phase.blockedUntil.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Capabilities">
        <div className="section-heading">
          <p className="eyebrow">Capability architecture</p>
          <h2>Each capability has events, interfaces, controls, human gates, blocked autonomy, deliverables, and acceptance criteria.</h2>
        </div>
        {summary.capabilities.map((capability) => (
          <article className="module-row" key={capability.id}>
            <div>
              <span>{capability.readiness}</span>
              <h2>{capability.name}</h2>
            </div>
            <p>{capability.objective}</p>
            <div>
              <strong>{capability.domain}; {capability.phase}</strong>
              <ul className="compact-list">
                <li>Interfaces: {capability.interfaces.join(", ")}</li>
                <li>Events: {capability.events.join(", ")}</li>
                <li>Controls: {capability.requiredControls.join(", ")}</li>
                <li>Human gate: {capability.humanGate}</li>
                <li>Blocked autonomy: {capability.blockedAutonomy.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Agents to build">
        <div className="section-heading">
          <p className="eyebrow">Agents to build</p>
          <h2>Agents are scoped identities with allowed tools, denied tools, evidence requirements, and escalation paths.</h2>
        </div>
        {summary.agentsToBuild.map((agent) => (
          <article className="module-row" key={agent.name}>
            <div>
              <span>{agent.identityScope}</span>
              <h2>{agent.name}</h2>
            </div>
            <p>{agent.purpose}</p>
            <div>
              <strong>{agent.firstMilestone}</strong>
              <ul className="compact-list">
                <li>Allowed tools: {agent.allowedTools.join(", ")}</li>
                <li>Denied tools: {agent.deniedTools.join(", ")}</li>
                <li>Evidence: {agent.requiredEvidence.join(", ")}</li>
                <li>Escalation: {agent.humanEscalation}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band compact-list" aria-label="Starter repository layout">
        <div>
          <p className="eyebrow">Starter architecture</p>
          <h2>Repository layout to grow from Next app contract into multi-package operating system.</h2>
        </div>
        <ul>
          {summary.starterRepositoryLayout.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="section-band principle-grid" aria-label="Validation checks">
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
