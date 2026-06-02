import { agentWorkflows, getAgentWorkflowSummary } from "../lib/agentWorkflows";
import { getAgentOSSummary } from "../lib/agentOS";

export default function AgentsPage() {
  const summary = getAgentWorkflowSummary();
  const agentOS = getAgentOSSummary();

  return (
    <main>
      <section className="page-hero">
        <a className="back-link" href="/hub">Hub</a>
        <p className="eyebrow">SCRIMED AgentOS v1</p>
        <h1>A governed multi-agent operating layer for healthcare intelligence workflows.</h1>
        <p className="hero-text">
          AgentOS coordinates planner, router, specialist, TrustQA, memory, RBAC, sandbox, MCP connector, audit, and human approval systems while live clinical execution remains gated.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Agent workflow registry summary">
        <article>
          <span>AgentOS</span>
          <strong>{agentOS.status}</strong>
        </article>
        <article>
          <span>Control plane</span>
          <strong>{agentOS.controlPlane.length}</strong>
        </article>
        <article>
          <span>Specialists</span>
          <strong>{summary.count}</strong>
        </article>
        <article>
          <span>Human review</span>
          <strong>{summary.humanReviewRequired}</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Operating boundary</p>
          <h2>AgentOS v1 plans and routes governed work. It does not execute live care.</h2>
          <p className="section-copy">{agentOS.boundary}</p>
        </div>
        <div className="layer-list">
          {agentOS.exposedRoutes.map((route, index) => (
            <a className="layer-row" href={route} key={route}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{route}</strong>
            </a>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="AgentOS control plane">
        <div className="section-heading">
          <p className="eyebrow">Multi-agent orchestration</p>
          <h2>Planner, Router, TrustQA, and Governance agents define the execution spine.</h2>
        </div>
        {agentOS.controlPlane.map((agent) => (
          <article className="module-row" key={agent.slug}>
            <div>
              <span>{agent.role}</span>
              <h2>{agent.name}</h2>
            </div>
            <p>{agent.owner}. {agent.responsibility}</p>
            <div>
              <strong>{agent.outputs.join(", ")}</strong>
              <ul className="compact-list">
                {agent.auditEvents.map((event) => (
                  <li key={event}>{event}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="SCRIMED service registry">
        <div className="section-heading">
          <p className="eyebrow">Healthcare service registry</p>
          <h2>AgentOS can orchestrate Sanar AI, DocuTwin, CareExplain, Ambient Scribe, TrialCore, PayerIQ, and future SCRIMED services.</h2>
        </div>
        <div className="principle-grid">
          {agentOS.specialistServices.map((service) => (
            <article key={service.service}>
              <span>{service.agentOwner}</span>
              <h3>{service.service}</h3>
              <p>{service.capability}</p>
              <ul className="compact-list">
                <li>{service.workflowTypes.join(", ")}</li>
                <li>{service.governanceBoundary}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="SCRIMED agent workflows">
        <div className="section-heading">
          <p className="eyebrow">Specialist agent registry</p>
          <h2>Every specialist agent is scoped by permissions, inputs, outputs, audit events, guardrails, and human-review requirements.</h2>
        </div>
        {agentWorkflows.map((workflow) => (
          <article className="module-row" key={workflow.slug}>
            <div>
              <span>{workflow.status}</span>
              <h2>{workflow.name}</h2>
            </div>
            <p>{workflow.owner}</p>
            <a className="module-link" href={workflow.route}>{workflow.objective}</a>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="AgentOS platform controls">
        <div className="section-heading">
          <p className="eyebrow">Platform controls</p>
          <h2>RBAC, MCP connectors, memory, TrustQA, sandboxing, and audit are first-class operating systems.</h2>
        </div>
        <div className="principle-grid">
          <article>
            <span>RBAC</span>
            <h3>{agentOS.rbacPermissions.length} roles</h3>
            <p>Least-privilege enterprise permissions for admins, clinicians, RCM reviewers, and runtime services.</p>
            <a className="module-link" href="/memory">Open memory fabric</a>
          </article>
          <article>
            <span>MCP</span>
            <h3>{agentOS.mcpConnectorFramework.length} connector groups</h3>
            <p>Connector planning across EHR, payer, knowledge, and CRM systems with no-PHI pilot boundaries.</p>
            <a className="module-link" href="/api/agent-os">Inspect AgentOS API</a>
          </article>
          <article>
            <span>Tasks</span>
            <h3>{agentOS.taskExecutionEngine.length} templates</h3>
            <p>Task execution is currently a synthetic planning engine with production requests denied by default.</p>
            <a className="module-link" href="/api/agent-os/tasks">Inspect task engine</a>
          </article>
          <article>
            <span>Evaluation</span>
            <h3>Interactive workspace</h3>
            <p>Generate synthetic AgentOS task plans, Atlas Trust Cards, audit preview, and observability packets.</p>
            <a className="module-link" href="/evaluation">Open evaluation workspace</a>
          </article>
        </div>
      </section>
    </main>
  );
}
