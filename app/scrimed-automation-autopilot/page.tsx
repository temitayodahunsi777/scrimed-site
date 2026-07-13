import Link from "next/link";
import { getScrimedAutomationAutopilotSummary } from "../lib/scrimedAutomationAutopilot";

export const metadata = {
  title: "SCRIMED Automation Autopilot",
  description:
    "Synthetic/no-PHI SCRIMED automation readiness control plane for autonomy scoring, approval routing, bottleneck workarounds, and review-gated service execution."
};

export default function ScrimedAutomationAutopilotPage() {
  const summary = getScrimedAutomationAutopilotSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/scrimed-operating-command">
          Operating Command
        </Link>
        <p className="eyebrow">SCRIMED Automation Autopilot</p>
        <h1>Autonomy becomes useful when every automated move has a boundary, owner, gate, and proof route.</h1>
        <p className="hero-text">
          This control plane scores where SCRIMED can safely automate today, where human approval is mandatory,
          and which bottlenecks must be reduced before live production services expand.
        </p>
        <div className="hero-actions" aria-label="SCRIMED Automation Autopilot actions">
          <Link href={summary.apiRoute}>Inspect API</Link>
          <Link href={summary.briefRoute}>Download Brief</Link>
          <Link href="/service-delivery">Service Delivery</Link>
          <Link href="/operational-efficiency">Operational Efficiency</Link>
          <Link href="/scrimed-agent-governance">Agent Governance</Link>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED Automation Autopilot summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Capabilities</span>
          <strong>{summary.capabilityCount}</strong>
        </article>
        <article>
          <span>Avg readiness</span>
          <strong>{summary.averageReadinessScore}</strong>
        </article>
        <article>
          <span>Synthetic auto</span>
          <strong>{summary.syntheticAutopilotCount}</strong>
        </article>
        <article>
          <span>Review gated</span>
          <strong>{summary.reviewGatedCount}</strong>
        </article>
        <article>
          <span>Human review</span>
          <strong>{summary.reviewRequiredCount}</strong>
        </article>
        <article>
          <span>Prod blocked</span>
          <strong>{summary.productionAuthorityBlockedCount}</strong>
        </article>
        <article>
          <span>Workarounds</span>
          <strong>{summary.bottleneckWorkaroundCount}</strong>
        </article>
      </section>

      <section className="section-band split-band" aria-label="SCRIMED Automation Autopilot boundary">
        <div>
          <p className="eyebrow">Autonomy Boundary</p>
          <h2>SCRIMED can automate metadata work; healthcare and production authority stay review-gated.</h2>
        </div>
        <div>
          <p>{summary.boundary}</p>
          <ul className="compact-list">
            <li>Autonomy authority: {summary.authority.autonomyAuthority}</li>
            <li>Production remediation: {summary.authority.productionRemediationAuthority}</li>
            <li>Customer go-live: {summary.authority.customerGoLiveAuthority}</li>
          </ul>
        </div>
      </section>

      <section className="table-section" aria-label="SCRIMED automation capabilities">
        <div className="section-heading">
          <p className="eyebrow">Automation Map</p>
          <h2>Each lane declares its safe autonomy mode, blocked actions, owner, approval gate, and proof routes.</h2>
        </div>
        {summary.capabilities.map((capability) => (
          <article className="module-row" key={capability.id}>
            <div>
              <span>{capability.mode}</span>
              <h2>{capability.name}</h2>
            </div>
            <p>{capability.bottleneckReduced}</p>
            <div>
              <strong>{capability.owner}</strong>
              <ul className="compact-list">
                <li>Domain: {capability.domain}</li>
                <li>Readiness: {capability.readinessScore}</li>
                <li>Reliability: {capability.reliabilityScore}</li>
                <li>Revenue impact: {capability.revenueImpactScore}</li>
                <li>Safety risk: {capability.safetyRiskScore}</li>
                <li>Human review required: {capability.humanReviewRequired ? "yes" : "no"}</li>
                <li>Production authority: {capability.productionAuthority ? "yes" : "no"}</li>
                <li>Audit: {capability.auditHash}</li>
              </ul>
            </div>
            <div>
              <strong>Gate</strong>
              <p>{capability.approvalGate}</p>
              <ul className="compact-list">
                <li>Allowed: {capability.allowedAutonomy.join(", ")}</li>
                <li>Triggers: {capability.triggerSignals.join(", ")}</li>
                <li>Proof routes: {capability.proofRoutes.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Automation bottleneck workarounds">
        <div className="section-heading">
          <p className="eyebrow">Bottleneck Workarounds</p>
          <h2>Unsafe pressure gets converted into a safe packet, queue, owner, or escalation path.</h2>
        </div>
        {summary.bottleneckWorkarounds.map((workaround) => (
          <article className="module-row" key={workaround.id}>
            <div>
              <span>{workaround.owner}</span>
              <h2>{workaround.bottleneck}</h2>
            </div>
            <p>{workaround.currentLimit}</p>
            <div>
              <strong>{workaround.safeWorkaround}</strong>
              <ul className="compact-list">
                <li>Automation assist: {workaround.automationAssist}</li>
                <li>Escalation: {workaround.escalationTrigger}</li>
                <li>Proof route: {workaround.proofRoute}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Automation sample decisions">
        <div className="section-heading">
          <p className="eyebrow">Decision Samples</p>
          <h2>Every automation request resolves to allow, review, or block before action.</h2>
        </div>
        {summary.sampleDecisions.map((decision) => (
          <article className="module-row" key={decision.requestId}>
            <div>
              <span>{decision.decision}</span>
              <h2>{decision.requestId}</h2>
            </div>
            <p>{decision.reason}</p>
            <div>
              <strong>{decision.domain}</strong>
              <ul className="compact-list">
                <li>Action: {decision.action}</li>
                <li>Mode: {decision.allowedMode}</li>
                <li>Human approval required: {decision.requiredHumanApproval ? "yes" : "no"}</li>
                <li>Audit: {decision.auditHash}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band principle-grid" aria-label="Automation next operator actions">
        {summary.nextOperatorActions.map((action) => (
          <article key={action}>
            <span>next</span>
            <h3>{action}</h3>
          </article>
        ))}
      </section>
    </main>
  );
}
