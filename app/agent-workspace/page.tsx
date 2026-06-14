import Link from "next/link";
import { getPersistentAgentWorkspaceSummary } from "../lib/persistentAgentWorkspace";

export const metadata = {
  title: "SCRIMED Persistent Agent Workspace",
  description:
    "Review SCRIMED Persistent Agent Workspace v1: tenant-scoped work orders, resumable state, Trust Cards, model-router policy, audit timeline, reviewer checkpoints, proof packets, and limitation resolution."
};

export default function AgentWorkspacePage() {
  const summary = getPersistentAgentWorkspaceSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/healthcare-intelligence-os">Healthcare Intelligence OS</Link>
        <p className="eyebrow">Persistent Agent Workspace v1</p>
        <h1>Tenant-scoped agent work orders with saved state, Trust Cards, review gates, audit timelines, and proof packets.</h1>
        <p className="hero-text">
          SCRIMED Persistent Agent Workspace v1 turns protected synthetic pilot sessions into resumable enterprise work
          orders for RCM, research, clinical operations, investor workflows, security reviews, and data transformation.
          Live clinical execution remains blocked by design.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href={summary.proofPacketRoute}>
            Download Proof Packet
          </a>
          <a className="secondary-action" href={summary.briefRoute}>
            Download Workspace Brief
          </a>
          <a className="secondary-action" href={summary.apiRoute}>
            Inspect Workspace API
          </a>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Persistent Agent Workspace summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Capabilities</span>
          <strong>{summary.capabilityCount}</strong>
        </article>
        <article>
          <span>Work orders</span>
          <strong>{summary.workOrderCount}</strong>
        </article>
        <article>
          <span>States</span>
          <strong>{summary.workOrderStateCount}</strong>
        </article>
        <article>
          <span>Event types</span>
          <strong>{summary.workOrderEventTypeCount}</strong>
        </article>
        <article>
          <span>Model routes</span>
          <strong>{summary.modelRouterDecisionCount}</strong>
        </article>
        <article>
          <span>Review gates</span>
          <strong>{summary.reviewerCheckpointCount}</strong>
        </article>
        <article>
          <span>Audit events</span>
          <strong>{summary.auditTimelineEventCount}</strong>
        </article>
        <article>
          <span>Quality replacements</span>
          <strong>{summary.qualityReplacements}</strong>
        </article>
        <article>
          <span>External approvals</span>
          <strong>{summary.externalApprovals}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Workspace boundary</p>
          <h2>No limitation is left vague; every gap has a control, replacement path, or external approval gate.</h2>
          <p className="section-copy">{summary.boundary}</p>
          <p className="section-copy">{summary.resolvedPosition}</p>
          <p className="section-copy">
            Protected work-order mutations now use {summary.workOrderMutationRoute} and detail transitions use{" "}
            {summary.workOrderDetailRoute}. Both routes remain bearer-token, tenant-isolated, and synthetic-only.
          </p>
        </div>
        <div className="layer-list">
          <Link className="layer-row" href={summary.foundation.protectedWorkspaceRoute}>
            <span>01</span>
            <strong>Protected workspace: {summary.foundation.protectedWorkspaceStatus}</strong>
          </Link>
          <Link className="layer-row" href={summary.foundation.agentOSRoute}>
            <span>02</span>
            <strong>AgentOS: {summary.foundation.agentOSStatus}</strong>
          </Link>
          <Link className="layer-row" href={summary.foundation.trustOSRoute}>
            <span>03</span>
            <strong>TrustOS: {summary.foundation.trustOSStatus}</strong>
          </Link>
          <Link className="layer-row" href={summary.foundation.atlasRoute}>
            <span>04</span>
            <strong>Atlas: {summary.foundation.atlasStatus}</strong>
          </Link>
        </div>
      </section>

      <section className="section-band" aria-label="Persistent workspace capabilities">
        <div className="section-heading">
          <p className="eyebrow">Capabilities</p>
          <h2>Workspace v1 composes existing protected storage, governance, and audit controls into long-running work-order foundations.</h2>
        </div>
        <div className="principle-grid">
          {summary.capabilities.map((capability) => (
            <article key={capability.capability}>
              <span>{capability.status}</span>
              <h3>{capability.capability}</h3>
              <p>{capability.implementation}</p>
              <ul className="compact-list">
                <li>Proof: {capability.proofRoute}</li>
                <li>{capability.productionGate}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Persistent agent work orders">
        <div className="section-heading">
          <p className="eyebrow">Work orders</p>
          <h2>Each work order owns its agent, state machine, memory, tools, model policy, Trust Card, reviewer gates, and blocked actions.</h2>
        </div>
        {summary.workOrders.map((workOrder) => (
          <article className="module-row" key={workOrder.type}>
            <div>
              <span>{workOrder.status}</span>
              <h2>{workOrder.name}</h2>
            </div>
            <p>{workOrder.buyer}. {workOrder.objective}</p>
            <div>
              <strong>{workOrder.agentOwner}</strong>
              <ul className="compact-list">
                <li>{workOrder.resumableState}</li>
                <li>{workOrder.modelRouterPolicy}</li>
                <li>Blocked: {workOrder.blockedActions.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Persistent workspace model router decisions">
        <div className="section-heading">
          <p className="eyebrow">Model router</p>
          <h2>Every work order carries provider class, fallback behavior, PHI sensitivity, routing criteria, and denial conditions.</h2>
        </div>
        {summary.modelRouterDecisions.map((decision) => (
          <article className="module-row" key={decision.workOrderType}>
            <div>
              <span>{decision.phiSensitivity}</span>
              <h2>{decision.workOrderType}</h2>
            </div>
            <p>{decision.defaultProviderClass} with fallback to {decision.fallbackProviderClass}.</p>
            <div>
              <strong>{decision.denialCondition}</strong>
              <ul className="compact-list">
                {decision.routingCriteria.map((criterion) => (
                  <li key={criterion}>{criterion}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="Persistent workspace audit and review controls">
        <div className="section-heading">
          <p className="eyebrow">Audit and review</p>
          <h2>Work orders remain replayable, review-gated, and evidence-linked before any buyer-facing proof is released.</h2>
        </div>
        <div className="principle-grid">
          {summary.auditTimeline.map((event) => (
            <article key={event.event}>
              <span>{event.status}</span>
              <h3>{event.event}</h3>
              <p>{event.actor}</p>
              <ul className="compact-list">
                <li>{event.retainedEvidence}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Persistent workspace reviewer checkpoints">
        <div className="section-heading">
          <p className="eyebrow">Reviewer checkpoints</p>
          <h2>Human review is a workflow primitive, not a footnote.</h2>
        </div>
        {summary.reviewerCheckpoints.map((checkpoint) => (
          <article className="module-row" key={checkpoint.checkpoint}>
            <div>
              <span>human review</span>
              <h2>{checkpoint.checkpoint}</h2>
            </div>
            <p>{checkpoint.requiredFor}</p>
            <div>
              <strong>{checkpoint.reviewerRole}</strong>
              <ul className="compact-list">
                <li>{checkpoint.approvalEffect}</li>
                <li>{checkpoint.denialEffect}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Persistent workspace limitation resolution">
        <div className="section-heading">
          <p className="eyebrow">Known limitations</p>
          <h2>Limitations are converted into active controls, safer quality processes, or named external approvals.</h2>
        </div>
        {summary.limitationResolutionRegister.map((item) => (
          <article className="module-row" key={item.limitation}>
            <div>
              <span>{item.resolutionStatus}</span>
              <h2>{item.limitation}</h2>
            </div>
            <p>{item.impact}</p>
            <div>
              <Link className="module-link" href={item.proofRoute}>{item.replacementProcess}</Link>
              <ul className="compact-list">
                <li>{item.remainingGate}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Persistent workspace API contracts">
        <div className="section-heading">
          <p className="eyebrow">API contracts</p>
          <h2>The public v1 surface is inspectable today; protected mutation contracts stay behind AAL2 tenant governance.</h2>
        </div>
        {summary.apiContracts.map((contract) => (
          <article className="module-row" key={`${contract.method}-${contract.route}`}>
            <div>
              <span>{contract.status}</span>
              <h2>{contract.method} {contract.route}</h2>
            </div>
            <p>{contract.access}</p>
            <strong>{contract.purpose}</strong>
          </article>
        ))}
      </section>
    </main>
  );
}
