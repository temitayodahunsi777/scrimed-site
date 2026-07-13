import Link from "next/link";
import { getScrimedGovernanceLearningLoopSummary } from "../lib/scrimed/governanceLearningLoop";

export const metadata = {
  title: "SCRIMED Governance Learning Loop",
  description:
    "Synthetic-only SCRIMED governance, learning-loop, contextual policy, A2A/MCP, AI visibility, value pricing, regulatory watch, radiology workflow, wearables, and skills activation control plane."
};

export default function ScrimedGovernanceLearningLoopPage() {
  const summary = getScrimedGovernanceLearningLoopSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/scrimed-enterprise-acceleration">
          Enterprise Acceleration
        </Link>
        <p className="eyebrow">SCRIMED Governance + Learning Loop</p>
        <h1>Governance Is the New Competitive Advantage.</h1>
        <p className="hero-text">
          SCRIMED converts traces, reviews, policies, corrections, retests, regulatory watch, and value metrics into a
          governed operating loop. It remains synthetic/no-PHI and human-reviewed.
        </p>
        <div className="hero-actions" aria-label="SCRIMED Governance Learning Loop actions">
          <Link href="/api/scrimed-governance-learning-loop">Inspect API</Link>
          <Link href="/docs/scrimed-governance-learning-loop">Read Docs</Link>
          <Link href="/scrimed-agent-governance">Agent Governance</Link>
          <Link href="/scrimed-llmops-observability">LLMOps</Link>
          <Link href="/boundary-release-approvals">Approval Matrix</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED governance learning loop summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Skills</span>
          <strong>{summary.skillsActivated.length}</strong>
        </article>
        <article>
          <span>Loop stages</span>
          <strong>{summary.learningLoopStages.length}</strong>
        </article>
        <article>
          <span>Policy levels</span>
          <strong>{summary.policyLevels.length}</strong>
        </article>
        <article>
          <span>Production</span>
          <strong>{summary.productionReadiness ? "enabled" : "blocked"}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="Memory is not learning">
        <div>
          <p className="eyebrow">Memory Is Not Learning</p>
          <h2>Memory stores what happened; learning improves the next attempt only after review.</h2>
        </div>
        <div>
          <p>{summary.sampleCorrectionArtifact.memorySummary}</p>
          <p>{summary.sampleCorrectionArtifact.learningUpdate}</p>
          <p>
            Artifact hash: <strong>{summary.sampleCorrectionArtifact.auditHash}</strong>
          </p>
        </div>
      </section>

      <section className="table-section" aria-label="Governance learning loop stages">
        <div className="section-heading">
          <p className="eyebrow">Governance Loop</p>
          <h2>Observe, evaluate, correct, approve, update, retest, and monitor before SCRIMED promotes changes.</h2>
        </div>
        {summary.learningLoopStages.map((stage) => (
          <article className="module-row" key={stage.stage}>
            <div>
              <span>{stage.output}</span>
              <h2>{stage.stage.replace("_", " ")}</h2>
            </div>
            <p>{stage.purpose}</p>
            <div>
              <strong>Human review and audit remain in the loop.</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Agent policy engine">
        <div className="section-heading">
          <p className="eyebrow">Agent Policy Engine</p>
          <h2>Every agent-facing action routes through risk, permission, review, and audit logic.</h2>
        </div>
        {summary.policyLevels.map((level) => (
          <article className="module-row" key={level.level}>
            <div>
              <span>{level.decision}</span>
              <h2>{level.level}</h2>
            </div>
            <p>{level.description}</p>
            <div>
              <strong>{level.requiredControl}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band split-band" aria-label="A2A and MCP interoperability">
        <div>
          <p className="eyebrow">A2A + MCP Interoperability</p>
          <h2>SCRIMED uses governed handoffs and scoped tool access instead of direct model-to-system control.</h2>
        </div>
        <div>
          <p>{summary.a2aMcpReadiness.a2a.purpose}</p>
          <p>{summary.a2aMcpReadiness.mcp.purpose}</p>
          <p>{summary.a2aMcpReadiness.boundary}</p>
        </div>
      </section>

      <section className="table-section" aria-label="Value-based pricing">
        <div className="section-heading">
          <p className="eyebrow">Value-Based Pricing</p>
          <h2>SCRIMED prices by workflow value, governance readiness, and buyer outcomes, not token vanity metrics.</h2>
        </div>
        {summary.pricingModel.map((metric) => (
          <article className="module-row" key={metric.metricId}>
            <div>
              <span>{metric.metricId}</span>
              <h2>{metric.name}</h2>
            </div>
            <p>{metric.buyerValue}</p>
            <div>
              <strong>{metric.pricingSignal}</strong>
              <ul className="compact-list">
                <li>Measured with: {metric.measuredWith}</li>
                <li>Boundary: {metric.boundary}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Radiology AI and wearables intelligence">
        <div className="section-heading">
          <p className="eyebrow">Clinical Workflow Foundations</p>
          <h2>Radiology and wearables stay workflow-focused, specialist-reviewed, and synthetic-only.</h2>
        </div>
        <article className="module-row">
          <div>
            <span>{summary.radiologyImagingToAction.status}</span>
            <h2>Radiology AI: Imaging Insight to Action</h2>
          </div>
          <p>{summary.radiologyImagingToAction.purpose}</p>
          <div>
            <strong>{summary.radiologyImagingToAction.boundary}</strong>
            <ul className="compact-list">
              {summary.radiologyImagingToAction.actions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </div>
        </article>
        <article className="module-row">
          <div>
            <span>{summary.wearablesIntelligence.status}</span>
            <h2>Wearables Intelligence Foundation</h2>
          </div>
          <p>{summary.wearablesIntelligence.purpose}</p>
          <div>
            <strong>{summary.wearablesIntelligence.boundary}</strong>
            <ul className="compact-list">
              {summary.wearablesIntelligence.signals.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
            </ul>
          </div>
        </article>
      </section>

      <section className="table-section" aria-label="Regulatory watch">
        <div className="section-heading">
          <p className="eyebrow">Regulatory Watch</p>
          <h2>SCRIMED tracks regulatory signals as readiness inputs, not approval claims.</h2>
        </div>
        {summary.regulatoryWatchScope.map((watch) => (
          <article className="module-row" key={watch.domain}>
            <div>
              <span>watch</span>
              <h2>{watch.domain}</h2>
            </div>
            <p>{watch.currentUse}</p>
            <div>
              <strong>{watch.watchItems.join(", ")}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Activated SCRIMED skills">
        <div className="section-heading">
          <p className="eyebrow">Activated SCRIMED Skills</p>
          <h2>Operational skills convert strategy into repeatable, audited build motion.</h2>
        </div>
        {summary.skillsActivated.map((skill) => (
          <article className="module-row" key={skill.id}>
            <div>
              <span>{skill.activationStatus}</span>
              <h2>{skill.name}</h2>
            </div>
            <p>{skill.purpose}</p>
            <div>
              <strong>{skill.nextAction}</strong>
              <ul className="compact-list">
                <li>Maturity: {skill.maturityLevel}</li>
                <li>Outputs: {skill.outputs.join(", ")}</li>
                <li>Guardrails: {skill.guardrails.join(" ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Clinical boundaries">
        <p className="eyebrow">Clinical Boundaries</p>
        <h2>{summary.safetyStatement}</h2>
        <ul className="compact-list">
          {summary.clinicalBoundaries.map((boundary) => (
            <li key={boundary}>{boundary}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
