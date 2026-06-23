"use client";

import Link from "next/link";
import type {
  PilotAuditEventRecord,
  PilotSessionRecord,
  PilotWorkspaceRecord
} from "../lib/protectedPilotWorkspace";
import type { PilotDemoReadinessSnapshotRecord } from "../lib/pilotDemoReadiness";
import type { QaManualRunEvidencePacketRecord } from "../lib/qaEvidenceLedger";
import type { CommandIntelligenceSnapshotRecord } from "../lib/commandIntelligenceHub";
import { deriveBuyerPilotRoom, type BuyerPilotRoomState } from "../lib/buyerPilotRoom";

function stateLabel(state: BuyerPilotRoomState) {
  if (state === "ready") return "Ready";
  if (state === "blocked") return "Blocked";
  return "Review";
}

function stateClass(state: BuyerPilotRoomState) {
  if (state === "ready") return "status-pill status-pill-pass";
  if (state === "blocked") return "status-pill status-pill-fail";
  return "status-pill status-pill-warn";
}

export default function BuyerPilotRoomPanel({
  auditEvents,
  commandSnapshots,
  demoSnapshots,
  manualQaEvidencePackets,
  onDownloadPacket,
  packetBusy,
  sessions,
  workspace
}: {
  auditEvents: PilotAuditEventRecord[];
  commandSnapshots: CommandIntelligenceSnapshotRecord[];
  demoSnapshots: PilotDemoReadinessSnapshotRecord[];
  manualQaEvidencePackets: QaManualRunEvidencePacketRecord[];
  onDownloadPacket: () => Promise<void>;
  packetBusy: boolean;
  sessions: PilotSessionRecord[];
  workspace: PilotWorkspaceRecord;
}) {
  const room = deriveBuyerPilotRoom({
    workspace,
    sessions,
    auditEvents,
    commandSnapshots,
    demoSnapshots,
    manualQaEvidencePackets,
    unavailableSections: []
  });

  return (
    <section className="table-section buyer-pilot-room" aria-label="Buyer Pilot Room">
      <div className="section-heading">
        <p className="eyebrow">Buyer Diligence Export</p>
        <h2>Package SCRIMED&apos;s competitive edge, proof stack, and guarded boundaries into one audited export.</h2>
        <p className="section-copy">{room.executiveThesis}</p>
        <div className="form-actions">
          <button
            className="primary-action"
            disabled={packetBusy}
            onClick={() => void onDownloadPacket()}
            type="button"
          >
            {packetBusy ? "Preparing Diligence Export" : "Download Diligence Export"}
          </button>
          <Link className="secondary-action" href="/competitive-edge">
            Public Competitive Edge
          </Link>
          <Link className="secondary-action" href="/pricing">
            Pricing Strategy
          </Link>
          <Link className="secondary-action" href="/pilot">
            Request Pilot
          </Link>
        </div>
      </div>

      <div className="hub-summary demo-readiness-summary" aria-label="Buyer room readiness summary">
        <article>
          <span>Buyer room</span>
          <strong>{stateLabel(room.state)}</strong>
        </article>
        <article>
          <span>Score</span>
          <strong>{room.score}%</strong>
        </article>
        <article>
          <span>Checks passed</span>
          <strong>{room.passed}</strong>
        </article>
        <article>
          <span>Review</span>
          <strong>{room.review}</strong>
        </article>
        <article>
          <span>Blocked</span>
          <strong>{room.blocked}</strong>
        </article>
        <article>
          <span>Snapshots</span>
          <strong>{room.evidenceCounts.demoSnapshots}</strong>
        </article>
        <article>
          <span>Command</span>
          <strong>{room.evidenceCounts.commandSnapshots}</strong>
        </article>
        <article>
          <span>Buyer exports</span>
          <strong>{room.evidenceCounts.buyerDiligenceExports}</strong>
        </article>
        <article>
          <span>Share gates</span>
          <strong>
            {room.buyerSpecificRelease.readyGates}/{room.buyerSpecificRelease.gateCount}
          </strong>
        </article>
        <article>
          <span>Share state</span>
          <strong>{room.buyerSpecificRelease.status}</strong>
        </article>
        <article>
          <span>Manual QA</span>
          <strong>{room.evidenceCounts.manualQaEvidencePackets}</strong>
        </article>
        <article>
          <span>QA proof</span>
          <strong>{room.qaProofPromotion.promotionAllowed ? "promotable" : "pending"}</strong>
        </article>
        <article>
          <span>QA activation</span>
          <strong>{room.qaActivationPlan.workflowCount}</strong>
        </article>
        <article>
          <span>Controls</span>
          <strong>{room.diligenceControls.length}</strong>
        </article>
      </div>

      <div className="demo-runbook" aria-label="Buyer diligence export audit posture">
        <div className="section-heading">
          <p className="eyebrow">Export audit posture</p>
          <h2>Keep buyer proof release tied to retained packet-download evidence.</h2>
          <p className="section-copy">{room.exportAudit.evidence}</p>
        </div>
        {[
          `Status: ${room.exportAudit.status}`,
          `Retained exports: ${room.exportAudit.eventCount}`,
          `Latest audit event: ${room.exportAudit.latestEventId ?? "not available"}`,
          `Latest timestamp: ${room.exportAudit.latestEventAt ?? "not available"}`,
          `Next: ${room.exportAudit.nextAction}`
        ].map((item, index) => (
          <article className="module-row" key={item}>
            <div>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>{item}</h2>
            </div>
            <p>
              Export audit evidence remains synthetic-only and tenant-scoped. It supports protected buyer
              diligence, not public release, PHI processing, clinical care authority, certification, or
              reimbursement claims.
            </p>
          </article>
        ))}
      </div>

      <div className="demo-runbook" aria-label="Buyer-specific share readiness">
        <div className="section-heading">
          <p className="eyebrow">Buyer-specific share readiness</p>
          <h2>Keep protected proof internal until the release-control ladder is complete.</h2>
          <p className="section-copy">
            {room.buyerSpecificRelease.readyGates}/{room.buyerSpecificRelease.gateCount} gates ready;
            share state is {room.buyerSpecificRelease.shareState}. {room.buyerSpecificRelease.nextAction}
          </p>
        </div>
        <article className="module-row">
          <div>
            <span>{room.buyerSpecificRelease.shareState}</span>
            <h2>{room.buyerSpecificRelease.allowedUse}</h2>
          </div>
          <strong className={stateClass(room.buyerSpecificRelease.status)}>
            {stateLabel(room.buyerSpecificRelease.status)}
          </strong>
          <p>
            External sharing still requires buyer-specific scope, qualified human approvals, external authority
            references, recipient controls, and access-log reconciliation. This room does not approve public release,
            PHI processing, live clinical care, reimbursement claims, certification claims, or production connectors.
          </p>
        </article>
        {room.buyerSpecificRelease.gates.map((gate) => (
          <article className="module-row" key={gate.id}>
            <div>
              <span>{gate.signal.latestEventAt ?? "pending signal"}</span>
              <h2>{gate.label}</h2>
            </div>
            <strong className={stateClass(gate.status)}>{stateLabel(gate.status)}</strong>
            <p>{gate.evidence}</p>
            <p>{gate.requiredBeforeExternalShare}</p>
            <div>
              <strong>{gate.signal.latestEventId ?? "No retained audit signal yet"}</strong>
              <p>{gate.nextAction}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="demo-runbook" aria-label="Command Intelligence buyer timeline">
        <div className="section-heading">
          <p className="eyebrow">Command Intelligence timeline</p>
          <h2>Show command-posture maturity before buyer follow-up.</h2>
        </div>
        {[
          `Snapshots: ${room.commandIntelligence.snapshotCount}`,
          `Latest score: ${
            room.commandIntelligence.latestScore === null
              ? "not available"
              : `${room.commandIntelligence.latestScore}%`
          }`,
          `Trend: ${room.commandIntelligence.trend}`,
          `Packet exports: ${room.commandIntelligence.packetExports}`,
          `Next action: ${room.commandIntelligence.nextAction}`
        ].map((item, index) => (
          <article className="module-row" key={item}>
            <div>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>{item}</h2>
            </div>
            <p>
              Command Intelligence remains synthetic-only, human-reviewed, and non-clinical. It supports buyer
              diligence but does not approve live workflow execution.
            </p>
          </article>
        ))}
      </div>

      <div className="demo-runbook" aria-label="Buyer diligence export contents">
        <div className="section-heading">
          <p className="eyebrow">One-click export contents</p>
          <h2>{room.diligenceExport.oneClickAction}</h2>
        </div>
        {room.diligenceExport.includedArtifacts.slice(0, 8).map((artifact) => (
          <article className="module-row" key={artifact}>
            <div>
              <span>included</span>
              <h2>{artifact}</h2>
            </div>
            <p>
              The export keeps this artifact tenant-scoped, synthetic-only, and tied to the protected workspace
              evidence boundary.
            </p>
          </article>
        ))}
      </div>

      <div className="demo-runbook" aria-label="Manual AAL2 QA activation plan">
        <div className="section-heading">
          <p className="eyebrow">QA activation plan</p>
          <h2>Convert pending human AAL2 QA gates into buyer-ready evidence without storing secrets.</h2>
          <p className="section-copy">{room.qaActivationPlan.unresolvedBoundary}</p>
        </div>
        {room.qaActivationPlan.workflows.map((workflow) => (
          <article className="module-row" key={workflow.workflowKind}>
            <div>
              <span>{workflow.status}</span>
              <h2>{workflow.name}</h2>
            </div>
            <p>{workflow.buyerDiligenceImpact}</p>
            <div>
              <strong>{workflow.workflowPath}</strong>
              <ul className="compact-list">
                <li>Target input: {workflow.targetInput}</li>
                <li>Temporary secret: {workflow.requiredSecretName}</li>
                <li>Safe fields: {workflow.safeEvidenceFields.join(", ")}</li>
                <li>Next: {workflow.nextAction}</li>
              </ul>
            </div>
          </article>
        ))}
      </div>

      <div className="demo-runbook" aria-label="Manual QA proof promotion">
        <div className="section-heading">
          <p className="eyebrow">QA proof promotion</p>
          <h2>{room.qaProofPromotion.buyerSafeClaim}</h2>
          <p className="section-copy">{room.qaProofPromotion.buyerProofLanguage}</p>
          <div className="form-actions">
            <Link className="secondary-action" href="/qa-launch-kit">
              Launch Kit
            </Link>
            <Link className="secondary-action" href="/qa-completion-bridge">
              Completion Bridge
            </Link>
            <Link className="secondary-action" href="/qa-claim-guard">
              Claim Guard
            </Link>
            <Link className="secondary-action" href="/qa-activation-seal">
              Activation Seal
            </Link>
            <Link className="secondary-action" href={room.qaProofPromotion.route}>
              Review Promotion Rules
            </Link>
          </div>
        </div>
        {[
          `State: ${room.qaProofPromotion.state}`,
          `Promotion allowed: ${room.qaProofPromotion.promotionAllowed ? "yes" : "no"}`,
          `Latest run: ${room.qaProofPromotion.latestWorkflowRunId}`,
          `Latest hash: ${room.qaProofPromotion.latestPacketHash}`,
          `Next: ${room.qaProofPromotion.nextAction}`
        ].map((item, index) => (
          <article className="module-row" key={item}>
            <div>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>{item}</h2>
            </div>
            <p>
              Promotion remains limited to synthetic no-secret QA evidence and cannot authorize live clinical,
              PHI, payer, connector, security-certification, or reimbursement claims.
            </p>
          </article>
        ))}
      </div>

      <div className="agent-readiness-grid demo-readiness-brief" aria-label="Competitive edge proof">
        {room.competitiveEdges.slice(0, 6).map((edge) => (
          <article key={edge.pillar}>
            <span>{edge.pillar}</span>
            <strong>{edge.claim}</strong>
            <p>{edge.proof}</p>
            <Link className="module-link" href={edge.route}>
              Inspect proof
            </Link>
          </article>
        ))}
      </div>

      <div className="demo-runbook" aria-label="Buyer commercial path">
        <div className="section-heading">
          <p className="eyebrow">Premium sales path</p>
          <h2>Move buyers from proof to paid evaluation to protected enterprise pilot.</h2>
        </div>
        {room.commercialPath.map((step) => (
          <article className="module-row" key={step.step}>
            <div>
              <span>{step.step}</span>
              <h2>{step.offer}</h2>
            </div>
            <p>{step.buyerCommitment}</p>
            <div>
              <strong>{step.priceRange}</strong>
              <p>{step.proofRequired}</p>
            </div>
          </article>
        ))}
      </div>

      {room.checks.map((check) => (
        <article className="module-row" key={check.id}>
          <div>
            <span>buyer-room control</span>
            <h2>{check.label}</h2>
          </div>
          <strong className={stateClass(check.state)}>{stateLabel(check.state)}</strong>
          <p>
            {check.evidence} {check.action}
          </p>
        </article>
      ))}

      <div className="demo-runbook" aria-label="Diligence control matrix">
        <div className="section-heading">
          <p className="eyebrow">Legal, privacy, security, safety</p>
          <h2>Expose the control answer, boundary, workaround, and production gate in the buyer export.</h2>
        </div>
        {room.diligenceControls.slice(0, 6).map((control) => (
          <article className="module-row" key={control.domain}>
            <div>
              <span>{control.domain}</span>
              <h2>{control.buyerQuestion}</h2>
            </div>
            <strong className={stateClass(control.status)}>{stateLabel(control.status)}</strong>
            <p>{control.evidence}</p>
            <p>{control.workaround}</p>
          </article>
        ))}
      </div>

      <div className="demo-runbook" aria-label="Known limitations and workarounds">
        <div className="section-heading">
          <p className="eyebrow">Known limitations with workarounds</p>
          <h2>Keep buyer trust by naming what is gated and how SCRIMED safely works around it.</h2>
        </div>
        {room.limitations.slice(0, 5).map((limitation) => (
          <article className="module-row" key={limitation.limitation}>
            <div>
              <span>{limitation.owner}</span>
              <h2>{limitation.limitation}</h2>
            </div>
            <p>{limitation.workaround}</p>
            <strong>{limitation.productionGate}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
