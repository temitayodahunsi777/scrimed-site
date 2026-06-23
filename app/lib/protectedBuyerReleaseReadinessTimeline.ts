import type {
  ProtectedBuyerReleaseControlGate,
  ProtectedBuyerReleaseControlGateState,
  ProtectedBuyerReleaseControlRun
} from "./protectedBuyerReleaseControlRun";
import { protectedBuyerReleaseControlRunBoundary } from "./protectedBuyerReleaseControlRun";
import type { PilotAuditEventRecord, PilotWorkspaceRecord } from "./protectedPilotWorkspace";

export type ProtectedBuyerReleaseReadinessTimelineEventKind =
  | "verifier-read"
  | "gate-record"
  | "gate-packet"
  | "chain-packet"
  | "human-review-required";

export type ProtectedBuyerReleaseReadinessTimelineEvent = {
  id: string;
  kind: ProtectedBuyerReleaseReadinessTimelineEventKind;
  gateId: string | null;
  label: string;
  state: ProtectedBuyerReleaseControlGateState | "review-required";
  occurredAt: string | null;
  auditEventId: string | null;
  eventType: string | null;
  packetType: string | null;
  protectedRoute: string | null;
  packetRoute: string | null;
  evidence: string;
  nextAction: string;
  boundary: string;
};

export type ProtectedBuyerReleaseReadinessTimeline = {
  service: "scrimed-protected-buyer-release-readiness-timeline";
  status: typeof protectedBuyerReleaseReadinessTimelineStatus;
  proofStackStatus: typeof protectedBuyerReleaseReadinessTimelineProofStackStatus;
  workspace: {
    name: string;
    slug: string;
    status: string;
  };
  boundary: string;
  generatedAt: string;
  chainState: ProtectedBuyerReleaseControlRun["chainState"];
  releaseDecision: ProtectedBuyerReleaseControlRun["releaseDecision"];
  shareState: ProtectedBuyerReleaseControlRun["shareState"];
  score: number;
  readyGateCount: number;
  reviewGateCount: number;
  blockedGateCount: number;
  gateCount: number;
  durableAuditEventCount: number;
  durablePacketAuditCount: number;
  verifierRunCapture: "browser-session-ephemeral-read";
  durableRunWorkaround: string;
  latestSignalAt: string | null;
  latestSignalId: string | null;
  nextHumanApproval: string;
  events: ProtectedBuyerReleaseReadinessTimelineEvent[];
  unresolvedBoundaries: string[];
  safeWorkarounds: string[];
  unavailableSections: string[];
  updated: "2026-06-22";
};

export const protectedBuyerReleaseReadinessTimelineStatus =
  "aal2-protected-buyer-release-readiness-timeline-ready";
export const protectedBuyerReleaseReadinessTimelineProofStackStatus =
  "aal2-protected-buyer-release-readiness-timeline-no-release-approval";
export const protectedBuyerReleaseReadinessTimelineRoute =
  "/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/timeline";

const gateSignals: Record<
  string,
  {
    eventType: string | null;
    packetType: string | null;
  }
> = {
  "buyer-diligence-export": {
    eventType: "buyer-pilot-room-packet-downloaded",
    packetType: "buyer-pilot-room-packet"
  },
  "external-approval-evidence": {
    eventType: "protected-external-approval-evidence-recorded",
    packetType: "protected-external-approval-evidence-links"
  },
  "release-decision": {
    eventType: "protected-release-decision-recorded",
    packetType: "protected-release-decision-claim-registry"
  },
  "named-reviewer-signoffs": {
    eventType: "protected-named-reviewer-signoff-recorded",
    packetType: "protected-named-reviewer-signoffs"
  },
  "distribution-lockbox": {
    eventType: "protected-distribution-lockbox-recorded",
    packetType: "protected-distribution-lockbox"
  },
  "release-authority-attestations": {
    eventType: "protected-release-authority-attestation-recorded",
    packetType: "protected-release-authority-attestations"
  },
  "recipient-attestations": {
    eventType: "protected-evidence-room-recipient-attestation-recorded",
    packetType: "protected-evidence-room-recipient-attestations"
  },
  "access-log-reconciliation": {
    eventType: "protected-evidence-room-access-log-reconciliation-recorded",
    packetType: "protected-evidence-room-access-log-reconciliation"
  }
};

function eventPacketType(event: PilotAuditEventRecord) {
  const packetType = event.eventMetadata.packetType;
  return typeof packetType === "string" ? packetType : null;
}

function latestEvent(events: PilotAuditEventRecord[]) {
  return [...events].sort(
    (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)
  )[0] ?? null;
}

function latestRecordEvent(events: PilotAuditEventRecord[], eventType: string | null) {
  if (!eventType) return null;
  return latestEvent(events.filter((event) => event.eventType === eventType));
}

function latestPacketEvent(events: PilotAuditEventRecord[], packetType: string | null) {
  if (!packetType) return null;

  return latestEvent(
    events.filter(
      (event) =>
        event.eventType === "enterprise-proof-packet-downloaded" &&
        eventPacketType(event) === packetType
    )
  );
}

function eventTime(value: string | null) {
  if (!value) return 0;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function humanReviewNextAction(run: ProtectedBuyerReleaseControlRun) {
  if (run.chainState === "ready") {
    return "Route the audited chain packet to qualified human release review in the approved external authority channel; do not treat verifier readiness as release approval.";
  }

  const blockedGate = run.gates.find((gate) => gate.state === "blocked");
  const reviewGate = run.gates.find((gate) => gate.state === "review");

  return blockedGate?.nextAction ?? reviewGate?.nextAction ?? run.nextAction;
}

function gateRecordEvent(
  gate: ProtectedBuyerReleaseControlGate,
  event: PilotAuditEventRecord | null,
  eventType: string | null
): ProtectedBuyerReleaseReadinessTimelineEvent {
  return {
    id: `${gate.id}-record`,
    kind: "gate-record",
    gateId: gate.id,
    label: `${gate.label} record signal`,
    state: event ? gate.state : "blocked",
    occurredAt: event?.createdAt ?? gate.latestAt,
    auditEventId: event?.id ?? null,
    eventType,
    packetType: null,
    protectedRoute: gate.protectedRoute,
    packetRoute: null,
    evidence: event
      ? `Latest retained record signal for ${gate.label}.`
      : `No retained record signal is visible for ${gate.label}.`,
    nextAction: gate.nextAction,
    boundary: gate.boundary
  };
}

function gatePacketEvent(
  gate: ProtectedBuyerReleaseControlGate,
  event: PilotAuditEventRecord | null,
  packetType: string | null
): ProtectedBuyerReleaseReadinessTimelineEvent {
  return {
    id: `${gate.id}-packet`,
    kind: "gate-packet",
    gateId: gate.id,
    label: `${gate.label} packet signal`,
    state: event ? gate.state : "blocked",
    occurredAt: event?.createdAt ?? null,
    auditEventId: event?.id ?? null,
    eventType: event?.eventType ?? null,
    packetType,
    protectedRoute: null,
    packetRoute: gate.packetRoute,
    evidence: event
      ? `Latest audited packet signal for ${gate.label}.`
      : `No audited packet signal is visible for ${gate.label}.`,
    nextAction: event ? "Keep this packet reference in the release-control chain." : gate.nextAction,
    boundary: gate.boundary
  };
}

export function deriveProtectedBuyerReleaseReadinessTimeline({
  auditEvents,
  generatedAt,
  run,
  unavailableSections = [],
  workspace
}: {
  auditEvents: PilotAuditEventRecord[];
  generatedAt: string;
  run: ProtectedBuyerReleaseControlRun;
  unavailableSections?: string[];
  workspace: PilotWorkspaceRecord;
}): ProtectedBuyerReleaseReadinessTimeline {
  const gateEvents = run.gates.flatMap((gate) => {
    const signal = gateSignals[gate.id] ?? { eventType: null, packetType: null };
    const recordEvent = latestRecordEvent(auditEvents, signal.eventType);
    const packetEvent = latestPacketEvent(auditEvents, signal.packetType);

    return [
      gateRecordEvent(gate, recordEvent, signal.eventType),
      gatePacketEvent(gate, packetEvent, signal.packetType)
    ];
  });
  const chainPacketEvents = auditEvents.filter(
    (event) =>
      event.eventType === "enterprise-proof-packet-downloaded" &&
      eventPacketType(event) === "protected-buyer-release-control-chain"
  );
  const latestChainPacket = latestEvent(chainPacketEvents);
  const durablePacketAuditCount = auditEvents.filter((event) =>
    [
      "buyer-pilot-room-packet-downloaded",
      "enterprise-proof-packet-downloaded"
    ].includes(event.eventType)
  ).length;
  const nextHumanApproval = humanReviewNextAction(run);
  const verifierReadEvent: ProtectedBuyerReleaseReadinessTimelineEvent = {
    id: "current-verifier-read",
    kind: "verifier-read",
    gateId: null,
    label: "Current browser-session verifier read",
    state: run.chainState,
    occurredAt: generatedAt,
    auditEventId: null,
    eventType: null,
    packetType: null,
    protectedRoute: protectedBuyerReleaseReadinessTimelineRoute,
    packetRoute: null,
    evidence:
      "The verifier read is generated from the active AAL2 browser session and is intentionally not persisted as a packet-download event.",
    nextAction:
      "Download the audited chain packet when durable evidence of this release-control state is required.",
    boundary:
      "Browser-session verifier reads do not create release approval, external sharing approval, or durable packet evidence."
  };
  const chainPacketEvent: ProtectedBuyerReleaseReadinessTimelineEvent = {
    id: "protected-chain-packet",
    kind: "chain-packet",
    gateId: null,
    label: "Protected Buyer Release Control chain packet",
    state: latestChainPacket ? run.chainState : "blocked",
    occurredAt: latestChainPacket?.createdAt ?? null,
    auditEventId: latestChainPacket?.id ?? null,
    eventType: latestChainPacket?.eventType ?? "enterprise-proof-packet-downloaded",
    packetType: "protected-buyer-release-control-chain",
    protectedRoute: null,
    packetRoute: "/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/packet",
    evidence: latestChainPacket
      ? "Latest audited release-control chain packet is retained in the workspace audit ledger."
      : "No audited release-control chain packet is visible yet.",
    nextAction: latestChainPacket
      ? "Route this packet to qualified human review; do not treat it as release approval."
      : "Download the audited release-control chain packet from the protected workspace.",
    boundary: "The packet is proof of chain state, not approval to share or operate clinically."
  };
  const humanReviewEvent: ProtectedBuyerReleaseReadinessTimelineEvent = {
    id: "qualified-human-review",
    kind: "human-review-required",
    gateId: null,
    label: "Qualified human release review",
    state: "review-required",
    occurredAt: null,
    auditEventId: null,
    eventType: null,
    packetType: null,
    protectedRoute: null,
    packetRoute: null,
    evidence:
      "Qualified external approval remains outside SCRIMED and must be retained in approved systems of record.",
    nextAction: nextHumanApproval,
    boundary:
      "No SCRIMED timeline, verifier, packet, or dashboard creates legal, privacy, security, clinical, reimbursement, customer, public-release, production, or PHI authority."
  };
  const events = [
    verifierReadEvent,
    ...gateEvents,
    chainPacketEvent,
    humanReviewEvent
  ].sort((left, right) => eventTime(right.occurredAt) - eventTime(left.occurredAt));

  return {
    service: "scrimed-protected-buyer-release-readiness-timeline",
    status: protectedBuyerReleaseReadinessTimelineStatus,
    proofStackStatus: protectedBuyerReleaseReadinessTimelineProofStackStatus,
    workspace: {
      name: workspace.name,
      slug: workspace.slug,
      status: workspace.status
    },
    boundary: protectedBuyerReleaseControlRunBoundary,
    generatedAt,
    chainState: run.chainState,
    releaseDecision: run.releaseDecision,
    shareState: run.shareState,
    score: run.score,
    readyGateCount: run.readyGateCount,
    reviewGateCount: run.reviewGateCount,
    blockedGateCount: run.blockedGateCount,
    gateCount: run.gateCount,
    durableAuditEventCount: auditEvents.length,
    durablePacketAuditCount,
    verifierRunCapture: "browser-session-ephemeral-read",
    durableRunWorkaround:
      "Use the audited release-control chain packet when a durable buyer-proof timeline artifact is required.",
    latestSignalAt: run.latestSignalAt,
    latestSignalId: run.latestSignalId,
    nextHumanApproval,
    events,
    unresolvedBoundaries: run.unresolvedBoundaries,
    safeWorkarounds: run.safeWorkarounds,
    unavailableSections,
    updated: "2026-06-22"
  };
}
