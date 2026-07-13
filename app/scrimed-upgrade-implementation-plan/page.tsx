import Link from "next/link";
import { getScrimedUpgradeImplementationPlanSummary } from "../lib/scrimedUpgradeImplementationPlan";

export const metadata = {
  title: "SCRIMED Upgrade Implementation Plan",
  description:
    "Newest SCRIMED architecture upgrade plan across secure agent runtime, policy, observability, clinical evaluation, routing, knowledge, workflows, DevSecOps, edge AI, and strategy."
};

export default function ScrimedUpgradeImplementationPlanPage() {
  const summary = getScrimedUpgradeImplementationPlanSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/scrimed-operating-command">
          Operating Command
        </Link>
        <p className="eyebrow">SCRIMED Upgrade Implementation Plan</p>
        <h1>Secure agents, governed workflows, continuous evaluation, and local-first healthcare AI.</h1>
        <p className="hero-text">{summary.strategicPositioning}</p>
        <div className="hero-actions" aria-label="SCRIMED upgrade implementation plan actions">
          <Link href={summary.apiRoute}>Inspect API</Link>
          <Link href={summary.briefRoute}>Download Brief</Link>
          <Link href="/scrimed-intelligence-safety-stack">Safety Stack</Link>
          <Link href="/scrimed-build-roadmap">Build Roadmap</Link>
          <Link href="/scrimed-compute-fabric">Compute Fabric</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED upgrade implementation summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Domains</span>
          <strong>{summary.domains.length}</strong>
        </article>
        <article>
          <span>Policies</span>
          <strong>{summary.contextualPolicyRules.length}</strong>
        </article>
        <article>
          <span>Model lanes</span>
          <strong>{summary.modelRoutingLanes.length}</strong>
        </article>
        <article>
          <span>Workflow lanes</span>
          <strong>{summary.workflowLanes.length}</strong>
        </article>
        <article>
          <span>DevSecOps controls</span>
          <strong>{summary.devsecopsControls.length}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="SCRIMED upgrade implementation boundary">
        <div>
          <p className="eyebrow">Boundary</p>
          <h2>This is architecture authority, not production authority.</h2>
        </div>
        <div>
          <p>{summary.boundary}</p>
          <p>
            The upgrade plan is designed to make SCRIMED safer, more observable, more measurable, and harder to copy
            while preserving human review and no-PHI defaults.
          </p>
        </div>
      </section>

      <section className="table-section" aria-label="SCRIMED upgrade domains">
        <div className="section-heading">
          <p className="eyebrow">Upgrade Domains</p>
          <h2>Newest SCRIMED architecture upgrades converted into tracked implementation domains.</h2>
        </div>
        {summary.domains.map((domain) => (
          <article className="module-row" key={domain.id}>
            <div>
              <span>{domain.readiness}</span>
              <h2>{domain.title}</h2>
            </div>
            <p>{domain.objective}</p>
            <div>
              <strong>{domain.humanReviewGate}</strong>
              <ul className="compact-list">
                <li>Capabilities: {domain.requiredCapabilities.join(", ")}</li>
                <li>Telemetry: {domain.telemetrySignals.join(", ")}</li>
                <li>Next: {domain.nextBuildStep}</li>
                <li>Hash: {domain.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Contextual Policy Engine">
        <div className="section-heading">
          <p className="eyebrow">Contextual Policy Engine</p>
          <h2>Policy decisions evaluate what the agent has read, done, spent, retrieved, and attempted.</h2>
        </div>
        {summary.contextualPolicyRules.map((rule) => (
          <article className="module-row" key={rule.ruleId}>
            <div>
              <span>{rule.decision}</span>
              <h2>{rule.ruleId}</h2>
            </div>
            <p>{rule.trigger}</p>
            <div>
              <strong>{rule.rationale}</strong>
              <p>{rule.failClosedBehavior}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Multi-Model Router lanes">
        <div className="section-heading">
          <p className="eyebrow">Multi-Model Router</p>
          <h2>Route by task purpose, privacy, latency, cost, and regulatory sensitivity.</h2>
        </div>
        {summary.modelRoutingLanes.map((lane) => (
          <article className="module-row" key={lane.taskType}>
            <div>
              <span>{lane.privacyRequirement}</span>
              <h2>{lane.taskType}</h2>
            </div>
            <p>{lane.preferredRoute}</p>
            <div>
              <strong>{lane.humanGate}</strong>
              <ul className="compact-list">
                <li>Criteria: {lane.decisionCriteria.join(", ")}</li>
                <li>Blocked: {lane.blockedUse}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Healthcare workflow automation lanes">
        <div className="section-heading">
          <p className="eyebrow">Workflow Automation</p>
          <h2>Automation stays draft, recommendation, or metadata-only until human review.</h2>
        </div>
        {summary.workflowLanes.map((lane) => (
          <article className="module-row" key={lane.workflow}>
            <div>
              <span>{lane.automationBoundary}</span>
              <h2>{lane.workflow}</h2>
            </div>
            <p>{lane.prioritizedUse}</p>
            <div>
              <strong>{lane.requiredReview}</strong>
              <p>{lane.trackedMetrics.join(", ")}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="DevSecOps controls">
        <div className="section-heading">
          <p className="eyebrow">DevSecOps / CI-CD</p>
          <h2>Release safety depends on tests, scans, PHI leakage controls, clinical regression, and rollback evidence.</h2>
        </div>
        {summary.devsecopsControls.map((control) => (
          <article className="module-row" key={control.control}>
            <div>
              <span>{control.failureMode}</span>
              <h2>{control.control}</h2>
            </div>
            <p>{control.requiredCheck}</p>
            <div>
              <strong>Evidence</strong>
              <p>{control.evidence}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="SCRIMED upgrade implementation validation">
        <div className="section-heading">
          <p className="eyebrow">Validation</p>
          <h2>Contract checks keep the upgrade pack governed and non-PHI.</h2>
        </div>
        {summary.validation.checks.map((check) => (
          <article className="module-row" key={check.check}>
            <div>
              <span>{check.passed ? "pass" : "fail"}</span>
              <h2>{check.check}</h2>
            </div>
            <p>{check.detail}</p>
            <div>
              <strong>Next</strong>
              <p>{summary.recommendedNextBuildStep}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
