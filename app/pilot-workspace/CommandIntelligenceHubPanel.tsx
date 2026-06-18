"use client";

import Link from "next/link";
import { useMemo } from "react";
import { deriveCommandIntelligenceHub, type CommandIntelligenceState } from "../lib/commandIntelligenceHub";
import type { PilotDemoReadinessSnapshotRecord } from "../lib/pilotDemoReadiness";
import type {
  PilotAuditEventRecord,
  PilotSessionRecord,
  PilotWorkspaceRecord
} from "../lib/protectedPilotWorkspace";
import type { QaManualRunEvidencePacketRecord } from "../lib/qaEvidenceLedger";

function stateLabel(state: CommandIntelligenceState) {
  if (state === "ready") return "Ready";
  if (state === "blocked") return "Blocked";
  return "Review";
}

function stateClass(state: CommandIntelligenceState) {
  if (state === "ready") return "status-pill status-pill-pass";
  if (state === "blocked") return "status-pill status-pill-fail";
  return "status-pill status-pill-warn";
}

export default function CommandIntelligenceHubPanel({
  auditEvents,
  demoSnapshots,
  manualQaEvidencePackets,
  onDownloadBuyerDiligenceExport,
  packetBusy,
  sessions,
  workspace
}: {
  auditEvents: PilotAuditEventRecord[];
  demoSnapshots: PilotDemoReadinessSnapshotRecord[];
  manualQaEvidencePackets: QaManualRunEvidencePacketRecord[];
  onDownloadBuyerDiligenceExport: () => Promise<void>;
  packetBusy: boolean;
  sessions: PilotSessionRecord[];
  workspace: PilotWorkspaceRecord;
}) {
  const hub = useMemo(
    () =>
      deriveCommandIntelligenceHub({
        workspace,
        sessions,
        auditEvents,
        demoSnapshots,
        manualQaEvidencePackets,
        unavailableSections: []
      }),
    [auditEvents, demoSnapshots, manualQaEvidencePackets, sessions, workspace]
  );

  return (
    <section className="table-section" aria-label="SCRIMED Command Intelligence Hub">
      <div className="section-heading">
        <p className="eyebrow">SCRIMED Command Intelligence Hub</p>
        <h2>Unify agents, trust evidence, buyer diligence, evaluation, tool readiness, and safe-mode controls.</h2>
        <p className="section-copy">{hub.mission}</p>
        <div className="form-actions">
          <button
            className="primary-action"
            disabled={packetBusy}
            onClick={() => void onDownloadBuyerDiligenceExport()}
            type="button"
          >
            {packetBusy ? "Preparing Diligence Export" : "Download Buyer Diligence Export"}
          </button>
          <Link className="secondary-action" href="/agents">
            AgentOS
          </Link>
          <Link className="secondary-action" href="/interoperability">
            Interoperability
          </Link>
          <Link className="secondary-action" href="/qa-evidence">
            QA Evidence
          </Link>
        </div>
      </div>

      <div className="hub-summary demo-readiness-summary" aria-label="Command intelligence summary">
        <article>
          <span>Command state</span>
          <strong>{stateLabel(hub.state)}</strong>
        </article>
        <article>
          <span>Command score</span>
          <strong>{hub.score}%</strong>
        </article>
        <article>
          <span>Agents</span>
          <strong>
            {hub.agentCommander.controlPlaneAgents + hub.agentCommander.specialistServices}
          </strong>
        </article>
        <article>
          <span>Tool plans</span>
          <strong>{hub.toolAccessPlans.length}</strong>
        </article>
        <article>
          <span>Eval gates</span>
          <strong>{hub.evaluationPipeline.length}</strong>
        </article>
        <article>
          <span>Audit traces</span>
          <strong>{hub.evidenceCounts.auditEvents}</strong>
        </article>
        <article>
          <span>Packet exports</span>
          <strong>{hub.evidenceCounts.packetExports}</strong>
        </article>
        <article>
          <span>Safe mode</span>
          <strong>Enforced</strong>
        </article>
      </div>

      <div className="agent-readiness-grid demo-readiness-brief" aria-label="Command metrics">
        {hub.metrics.map((metric) => (
          <article key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <p>{metric.detail}</p>
          </article>
        ))}
      </div>

      <article className="module-row">
        <div>
          <span>Agent Commander</span>
          <h2>{hub.agentCommander.coordinationModel}</h2>
        </div>
        <strong className={stateClass(hub.agentCommander.status)}>
          {stateLabel(hub.agentCommander.status)}
        </strong>
        <p>
          Planner, router, {hub.agentCommander.memoryLayers} memory layers,{" "}
          {hub.agentCommander.mcpConnectors} MCP/tool connectors,{" "}
          {hub.agentCommander.approvalCheckpoints} approval checkpoints, and{" "}
          {hub.agentCommander.observabilitySignals} observability signals are represented.
        </p>
      </article>

      <div className="demo-runbook" aria-label="Command workstreams">
        <div className="section-heading">
          <p className="eyebrow">Command workstreams</p>
          <h2>Every workstream exposes evidence, risk, review triggers, limitation, workaround, and next action.</h2>
        </div>
        {hub.workstreams.map((workstream) => (
          <article className="module-row" key={workstream.id}>
            <div>
              <span>{workstream.owner}</span>
              <h2>{workstream.name}</h2>
            </div>
            <strong className={stateClass(workstream.state)}>{stateLabel(workstream.state)}</strong>
            <p>
              {workstream.evidence} Confidence: {workstream.confidenceLevel}. Risk score:{" "}
              {workstream.riskScore}. Review trigger: {workstream.humanReviewTrigger}
            </p>
            <p>{workstream.workaround}</p>
          </article>
        ))}
      </div>

      <div className="demo-runbook" aria-label="Trust Engine outputs">
        <div className="section-heading">
          <p className="eyebrow">Trust Engine</p>
          <h2>Attach confidence, evidence source, risk score, human review trigger, and audit status.</h2>
        </div>
        {hub.trustEngineOutputs.map((output) => (
          <article className="module-row" key={output.id}>
            <div>
              <span>{output.validationStatus}</span>
              <h2>{output.recommendation}</h2>
            </div>
            <strong>{output.confidenceLevel} confidence</strong>
            <p>
              Evidence: {output.evidenceSource} Risk score: {output.riskScore}. Human review:{" "}
              {output.humanReviewTrigger}
            </p>
            <p>Audit log: {output.auditLog}</p>
          </article>
        ))}
      </div>

      <div className="agent-readiness-grid demo-readiness-brief" aria-label="Continuous evaluation pipeline">
        {hub.evaluationPipeline.map((gate) => (
          <article key={gate.id}>
            <span>{gate.name}</span>
            <strong className={stateClass(gate.state)}>{stateLabel(gate.state)}</strong>
            <p>{gate.metric}</p>
            <small>{gate.nextStep}</small>
          </article>
        ))}
      </div>

      <div className="demo-runbook" aria-label="MCP and tool access architecture">
        <div className="section-heading">
          <p className="eyebrow">MCP / tool access architecture</p>
          <h2>Prepare connector pathways without allowing live credentials, PHI, or production mutation.</h2>
        </div>
        {hub.toolAccessPlans.map((plan) => (
          <article className="module-row" key={plan.id}>
            <div>
              <span>{plan.status}</span>
              <h2>{plan.domain}</h2>
            </div>
            <p>{plan.safeMode}</p>
            <strong>{plan.standards.join(", ")}</strong>
          </article>
        ))}
      </div>

      <div className="demo-runbook" aria-label="Operator Safe Mode controls">
        <div className="section-heading">
          <p className="eyebrow">Operator Safe Mode</p>
          <h2>Known hard boundaries stay explicit so growth does not outrun governance.</h2>
        </div>
        {hub.safeModeControls.map((control) => (
          <article className="module-row" key={control.control}>
            <div>
              <span>{control.status}</span>
              <h2>{control.control}</h2>
            </div>
            <p>Blocked: {control.blockedAction}</p>
            <p>Workaround: {control.workaround}</p>
          </article>
        ))}
      </div>

      <div className="agent-readiness-grid demo-readiness-brief" aria-label="Next recommended actions">
        {hub.nextActions.map((action) => (
          <article key={`${action.priority}-${action.action}`}>
            <span>{action.priority}</span>
            <strong>{action.action}</strong>
            <p>{action.expectedOutcome}</p>
            <Link className="module-link" href={action.route}>
              Open route
            </Link>
          </article>
        ))}
      </div>

      <article className="module-row">
        <div>
          <span>boundary</span>
          <h2>Protected command posture only</h2>
        </div>
        <p>{hub.boundary}</p>
        <strong>Updated {hub.updatedAt}</strong>
      </article>
    </section>
  );
}
