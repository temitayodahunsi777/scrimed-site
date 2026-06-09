import Link from "next/link";
import {
  getWorkflowExecutionSummary,
  validateWorkflowExecution
} from "../lib/workflowExecutions";
import { getAgentOSSummary } from "../lib/agentOS";
import { getAtlasIntelligenceCoreSummary } from "../lib/atlasIntelligenceCore";

export default function WorkflowExecutionsPage() {
  const summary = getWorkflowExecutionSummary();
  const agentOS = getAgentOSSummary();
  const atlas = getAtlasIntelligenceCoreSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/hub">Hub</Link>
        <p className="eyebrow">Workflow and task execution engine</p>
        <h1>SCRIMED turns healthcare workflows into sandboxed, audited, human-reviewed task plans.</h1>
        <p className="hero-text">
          CarePath AI, DocuTwin, TrialCore, Sanar AI, PayerIQ, and future services map to synthetic fixtures, sandbox runtimes, TrustQA, human approvals, result validation, and production deny gates.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="Workflow execution summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Workflows</span>
          <strong>{summary.workflowCount}</strong>
        </article>
        <article>
          <span>Ready</span>
          <strong>{summary.ready}</strong>
        </article>
        <article>
          <span>Attention</span>
          <strong>{summary.attentionRequired}</strong>
        </article>
      </section>

      <section className="table-section" id="sandbox-runtime" aria-label="Agent sandbox runtimes">
        <div className="section-heading">
          <p className="eyebrow">Agent Sandbox Runtime</p>
          <h2>Every agent receives isolated memory, files, workflow tools, and audit logs.</h2>
          <p className="section-copy">{atlas.boundary}</p>
        </div>
        {agentOS.sandboxRuntimes.map((runtime) => (
          <article className="module-row" key={runtime.workflow}>
            <div>
              <span>{runtime.agent}</span>
              <h2>{runtime.workflow}</h2>
            </div>
            <p>{runtime.isolation}</p>
            <div>
              <strong>{runtime.boundary}</strong>
              <ul className="compact-list">
                <li>Memory: {runtime.memory.join(", ")}</li>
                <li>Tools: {runtime.tools.join(", ")}</li>
                <li>Audit: {runtime.audit.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="AgentOS task templates">
        <div className="section-heading">
          <p className="eyebrow">Task execution engine</p>
          <h2>Task plans route through Planner, Router, specialist agents, TrustQA, and approval checkpoints.</h2>
        </div>
        {agentOS.taskExecutionEngine.map((task) => (
          <article className="module-row" key={task.slug}>
            <div>
              <span>{task.executionMode.join(", ")}</span>
              <h2>{task.name}</h2>
            </div>
            <p>{task.owner}. {task.plannerSteps.join(", ")}</p>
            <div>
              <Link className="module-link" href={task.route}>{task.specialistAgents.join(", ")}</Link>
              <ul className="compact-list">
                <li>Approvals: {task.humanApprovals.join(", ")}</li>
                <li>Blocked: {task.deniedCapabilities.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Synthetic workflow executions">
        <article className="module-row">
          <div>
            <span>execution contracts</span>
            <h2>Governed execution API contracts</h2>
          </div>
          <p>contract-only boundary before executable workflow APIs</p>
          <Link className="module-link" href="/workflows/contracts">
            Review request, response, audit, and denied-capability contracts.
          </Link>
        </article>
        <article className="module-row">
          <div>
            <span>identity access</span>
            <h2>Identity and access readiness</h2>
          </div>
          <p>production authentication, tenant isolation, role permissions, patient context, service auth, consent, and break-glass decisions</p>
          <Link className="module-link" href="/workflows/identity-access">
            Review identity and access prerequisites before execution moves beyond deny-by-default.
          </Link>
        </article>
        <article className="module-row">
          <div>
            <span>attempt model</span>
            <h2>Execution attempt readiness</h2>
          </div>
          <p>idempotency, durable attempt state, replay, concurrency, failure quarantine, runtime-safety handoff, privacy boundaries, and regional compliance</p>
          <Link className="module-link" href="/workflows/execution-attempts">
            Review the attempt lifecycle before any governed execution route can create or replay work.
          </Link>
        </article>
        <article className="module-row">
          <div>
            <span>runtime safety</span>
            <h2>Runtime safety readiness</h2>
          </div>
          <p>throttle policy, abuse signals, connector containment, emergency shutdown, Watchtower escalation, overrides, restoration, and safety drills</p>
          <Link className="module-link" href="/workflows/runtime-safety">
            Review runtime acceptance controls before any governed execution route can accept executable requests.
          </Link>
        </article>
        <article className="module-row">
          <div>
            <span>deny stubs</span>
            <h2>Governed execution implementation readiness</h2>
          </div>
          <p>locked POST endpoints before production execution</p>
          <Link className="module-link" href="/workflows/implementation-readiness">
            Review auth, identity, idempotency, persistence, audit, privacy, and connector prerequisites.
          </Link>
        </article>
        <article className="module-row">
          <div>
            <span>execution audit</span>
            <h2>Denied execution audit boundary</h2>
          </div>
          <p>metadata-only evidence headers and never-capture policy</p>
          <Link className="module-link" href="/workflows/execution-audit">
            Review denied-attempt audit envelope before durable logging is enabled.
          </Link>
        </article>
        <article className="module-row">
          <div>
            <span>audit persistence</span>
            <h2>Audit persistence readiness</h2>
          </div>
          <p>storage, retention, access, encryption, incident response, residency, and alerting decisions</p>
          <Link className="module-link" href="/workflows/audit-persistence">
            Review durable audit logging prerequisites before execution moves beyond deny-by-default.
          </Link>
        </article>
        <article className="module-row">
          <div>
            <span>result fixtures</span>
            <h2>Workflow execution results</h2>
          </div>
          <p>deterministic synthetic output evidence</p>
          <Link className="module-link" href="/workflows/results">
            Review result fixtures before live workflow automation.
          </Link>
        </article>
        <article className="module-row">
          <div>
            <span>promotion review</span>
            <h2>Workflow promotion review</h2>
          </div>
          <p>synthetic-only approval before production automation</p>
          <Link className="module-link" href="/workflows/promotion-review">
            Review promotion records and retained blocked actions.
          </Link>
        </article>
        {summary.workflows.map((workflow) => {
          const readiness = validateWorkflowExecution(workflow);

          return (
            <article className="module-row" key={workflow.slug}>
              <div>
                <span>{readiness.status}</span>
                <h2>{workflow.name}</h2>
              </div>
              <p>{workflow.module}</p>
              <Link className="module-link" href={workflow.route}>
                {readiness.passed} checks passed, {readiness.failed} checks failed
              </Link>
            </article>
          );
        })}
      </section>
    </main>
  );
}
