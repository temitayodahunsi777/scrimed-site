"use client";

import Link from "next/link";
import type {
  PilotAuditEventRecord,
  PilotSessionRecord,
  PilotWorkspaceRecord
} from "../lib/protectedPilotWorkspace";
import type { PilotDemoReadinessSnapshotRecord } from "../lib/pilotDemoReadiness";
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
  demoSnapshots,
  onDownloadPacket,
  packetBusy,
  sessions,
  workspace
}: {
  auditEvents: PilotAuditEventRecord[];
  demoSnapshots: PilotDemoReadinessSnapshotRecord[];
  onDownloadPacket: () => Promise<void>;
  packetBusy: boolean;
  sessions: PilotSessionRecord[];
  workspace: PilotWorkspaceRecord;
}) {
  const room = deriveBuyerPilotRoom({
    workspace,
    sessions,
    auditEvents,
    demoSnapshots,
    unavailableSections: []
  });

  return (
    <section className="table-section buyer-pilot-room" aria-label="Buyer Pilot Room">
      <div className="section-heading">
        <p className="eyebrow">Buyer Pilot Room</p>
        <h2>Package SCRIMED&apos;s competitive edge into one enterprise diligence room.</h2>
        <p className="section-copy">{room.executiveThesis}</p>
        <div className="form-actions">
          <button
            className="primary-action"
            disabled={packetBusy}
            onClick={() => void onDownloadPacket()}
            type="button"
          >
            {packetBusy ? "Preparing Buyer Packet" : "Download Buyer Room Packet"}
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
