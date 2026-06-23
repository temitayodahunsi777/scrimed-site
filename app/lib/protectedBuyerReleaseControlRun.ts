import type {
  BuyerSpecificReleaseShareState
} from "./buyerPilotRoom";
import type { ProtectedDistributionLockboxWorkflow } from "./protectedDistributionLockbox";
import type {
  ProtectedEvidenceRoomAccessLogReconciliationWorkflow
} from "./protectedEvidenceRoomAccessLogReconciliation";
import type {
  ProtectedEvidenceRoomRecipientAttestationWorkflow
} from "./protectedEvidenceRoomRecipientAttestations";
import type {
  ProtectedExternalApprovalEvidenceWorkflow
} from "./protectedExternalApprovalEvidence";
import type {
  PilotAuditEventRecord,
  PilotWorkspaceRecord
} from "./protectedPilotWorkspace";
import type {
  ProtectedNamedReviewerSignoffWorkflow
} from "./protectedNamedReviewerSignoffs";
import type {
  ProtectedReleaseAuthorityAttestationWorkflow
} from "./protectedReleaseAuthorityAttestations";
import type {
  ProtectedReleaseDecisionWorkflow
} from "./protectedReleaseDecisionWorkflow";

export type ProtectedBuyerReleaseControlGateState = "ready" | "review" | "blocked";

export type ProtectedBuyerReleaseControlGate = {
  id: string;
  label: string;
  state: ProtectedBuyerReleaseControlGateState;
  protectedRoute: string;
  packetRoute: string;
  recordCount: number;
  packetCount: number;
  missingCount: number;
  latestAt: string | null;
  evidence: string;
  nextAction: string;
  boundary: string;
};

export type ProtectedBuyerReleaseControlRun = {
  service: "scrimed-protected-buyer-release-control-run";
  status: typeof protectedBuyerReleaseControlRunStatus;
  proofStackStatus: typeof protectedBuyerReleaseControlRunProofStackStatus;
  packetProofStackStatus: typeof protectedBuyerReleaseControlRunPacketProofStackStatus;
  workspace: {
    name: string;
    slug: string;
    status: string;
  };
  boundary: string;
  chainState: ProtectedBuyerReleaseControlGateState;
  releaseDecision: "protected-chain-ready-human-release-review-required" | "protected-chain-incomplete";
  shareState: BuyerSpecificReleaseShareState | "qualified-human-review-ready-not-release-approval";
  readyGateCount: number;
  reviewGateCount: number;
  blockedGateCount: number;
  gateCount: number;
  score: number;
  latestSignalAt: string | null;
  latestSignalId: string | null;
  gates: ProtectedBuyerReleaseControlGate[];
  unresolvedBoundaries: string[];
  safeWorkarounds: string[];
  nextAction: string;
  unavailableSections: string[];
  updated: "2026-06-22";
};

export const protectedBuyerReleaseControlRunStatus =
  "aal2-protected-buyer-release-control-verifier";
export const protectedBuyerReleaseControlRunProofStackStatus =
  "aal2-protected-buyer-release-control-chain-verifier-no-release-approval";
export const protectedBuyerReleaseControlRunPacketProofStackStatus =
  "aal2-audited-buyer-release-control-chain-packet-no-release-approval";

export const protectedBuyerReleaseControlRunBoundary =
  "Protected Buyer Release Control Run verifies tenant-scoped, no-PHI metadata across the buyer-specific release-control chain. It is not release approval, customer permission, legal approval, privacy approval, security certification, HIPAA/SOC/FDA certification, advertising substantiation, securities material approval, reimbursement certainty, PHI authority, production connector approval, live clinical care authority, or autonomous clinical execution authority.";

const protectedRouteBase = "/api/pilot-workspaces/{workspaceSlug}";

const unresolvedBoundaries = [
  "Qualified human approval must remain in external systems of record.",
  "Actual signed approvals, legal opinions, security reports, recipient lists, access grants, raw access logs, contracts, and customer permission artifacts must not be stored in SCRIMED.",
  "External buyer sharing remains disabled until every gate is retained, independently reviewed, and explicitly approved outside SCRIMED.",
  "No live clinical care, PHI processing, reimbursement guarantee, security certification, production connector activation, patient outreach, payer submission, or autonomous clinical action is authorized."
];

const safeWorkarounds = [
  "Use metadata references, packet IDs, packet hashes, audit event IDs, timestamps, reviewer roles, and status labels instead of storing sensitive artifacts.",
  "If a fresh bearer token is unavailable in Codex, use the browser-protected workspace and copy only no-secret packet evidence.",
  "If an external approval is confidential, store only a label, external system, owner, validation status, and review timestamp.",
  "If any gate is missing, provide a protected live review instead of sending the Buyer Diligence Export externally."
];

function byType(events: PilotAuditEventRecord[], eventType: string) {
  return events.filter((event) => event.eventType === eventType);
}

function byPacket(events: PilotAuditEventRecord[], packetType: string) {
  return events.filter(
    (event) =>
      event.eventType === "enterprise-proof-packet-downloaded" &&
      event.eventMetadata.packetType === packetType
  );
}

function latest(events: PilotAuditEventRecord[]) {
  return [...events].sort(
    (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)
  )[0] ?? null;
}

function gateState(ready: boolean, hasEvidence: boolean, blocked = false): ProtectedBuyerReleaseControlGateState {
  if (blocked) return "blocked";
  if (ready) return "ready";
  if (hasEvidence) return "review";
  return "blocked";
}

function releasePacketSignal(events: PilotAuditEventRecord[], eventType: string, packetType: string) {
  const eventMatches = byType(events, eventType);
  const packetMatches = byPacket(events, packetType);
  const latestSignal = latest([...eventMatches, ...packetMatches]);

  return {
    eventCount: eventMatches.length,
    packetCount: packetMatches.length,
    latestAt: latestSignal?.createdAt ?? null,
    latestId: latestSignal?.id ?? null
  };
}

function buyerPacketSignal(events: PilotAuditEventRecord[]) {
  const packetEvents = byType(events, "buyer-pilot-room-packet-downloaded");
  const latestSignal = latest(packetEvents);

  return {
    eventCount: packetEvents.length,
    packetCount: packetEvents.length,
    latestAt: latestSignal?.createdAt ?? null,
    latestId: latestSignal?.id ?? null
  };
}

function route(path: string) {
  return `${protectedRouteBase}${path}`;
}

export function deriveProtectedBuyerReleaseControlRun({
  accessLogWorkflow,
  auditEvents,
  distributionLockboxWorkflow,
  externalApprovalWorkflow,
  namedReviewerWorkflow,
  recipientWorkflow,
  releaseAuthorityWorkflow,
  releaseDecisionWorkflow,
  unavailableSections = [],
  workspace
}: {
  accessLogWorkflow: ProtectedEvidenceRoomAccessLogReconciliationWorkflow;
  auditEvents: PilotAuditEventRecord[];
  distributionLockboxWorkflow: ProtectedDistributionLockboxWorkflow;
  externalApprovalWorkflow: ProtectedExternalApprovalEvidenceWorkflow;
  namedReviewerWorkflow: ProtectedNamedReviewerSignoffWorkflow;
  recipientWorkflow: ProtectedEvidenceRoomRecipientAttestationWorkflow;
  releaseAuthorityWorkflow: ProtectedReleaseAuthorityAttestationWorkflow;
  releaseDecisionWorkflow: ProtectedReleaseDecisionWorkflow;
  unavailableSections?: string[];
  workspace: PilotWorkspaceRecord;
}): ProtectedBuyerReleaseControlRun {
  const buyerExport = buyerPacketSignal(auditEvents);
  const externalSignal = releasePacketSignal(
    auditEvents,
    "protected-external-approval-evidence-recorded",
    "protected-external-approval-evidence-links"
  );
  const releaseDecisionSignal = releasePacketSignal(
    auditEvents,
    "protected-release-decision-recorded",
    "protected-release-decision-claim-registry"
  );
  const reviewerSignal = releasePacketSignal(
    auditEvents,
    "protected-named-reviewer-signoff-recorded",
    "protected-named-reviewer-signoffs"
  );
  const lockboxSignal = releasePacketSignal(
    auditEvents,
    "protected-distribution-lockbox-recorded",
    "protected-distribution-lockbox"
  );
  const authoritySignal = releasePacketSignal(
    auditEvents,
    "protected-release-authority-attestation-recorded",
    "protected-release-authority-attestations"
  );
  const recipientSignal = releasePacketSignal(
    auditEvents,
    "protected-evidence-room-recipient-attestation-recorded",
    "protected-evidence-room-recipient-attestations"
  );
  const accessLogSignal = releasePacketSignal(
    auditEvents,
    "protected-evidence-room-access-log-reconciliation-recorded",
    "protected-evidence-room-access-log-reconciliation"
  );

  const gates: ProtectedBuyerReleaseControlGate[] = [
    {
      id: "buyer-diligence-export",
      label: "Retained Buyer Diligence Export audit",
      state: gateState(buyerExport.eventCount > 0, buyerExport.eventCount > 0),
      protectedRoute: route("/buyer-room"),
      packetRoute: route("/buyer-room/packet"),
      recordCount: buyerExport.eventCount,
      packetCount: buyerExport.packetCount,
      missingCount: buyerExport.eventCount > 0 ? 0 : 1,
      latestAt: buyerExport.latestAt,
      evidence:
        buyerExport.eventCount > 0
          ? `${buyerExport.eventCount} Buyer Diligence Export audit event(s) retained.`
          : "No retained Buyer Diligence Export audit event is visible.",
      nextAction:
        buyerExport.eventCount > 0
          ? "Continue release-control verification before any external sharing."
          : "Download the Buyer Diligence Export through the protected workspace after human review.",
      boundary: "A retained export is internal protected diligence evidence only."
    },
    {
      id: "external-approval-evidence",
      label: "External approval evidence references",
      state: gateState(
        externalApprovalWorkflow.summary.missingDomainCount === 0 &&
          externalApprovalWorkflow.summary.recordedDomainCount > 0,
        externalApprovalWorkflow.summary.recordedDomainCount > 0 || externalSignal.packetCount > 0
      ),
      protectedRoute: route("/external-approval-evidence"),
      packetRoute: route("/external-approval-evidence/packet"),
      recordCount: externalApprovalWorkflow.summary.recordedDomainCount,
      packetCount: externalSignal.packetCount,
      missingCount: externalApprovalWorkflow.summary.missingDomainCount,
      latestAt: externalApprovalWorkflow.summary.latestReferenceAt ?? externalSignal.latestAt,
      evidence: `${externalApprovalWorkflow.summary.recordedDomainCount}/${externalApprovalWorkflow.summary.domainCount} approval-domain metadata references retained.`,
      nextAction:
        externalApprovalWorkflow.summary.missingDomainCount === 0
          ? "Route linked metadata references into the versioned release decision gate."
          : "Retain no-PHI references for every missing external approval domain.",
      boundary: "Approval evidence references are metadata only, not the approval artifacts."
    },
    {
      id: "release-decision",
      label: "Versioned release decision",
      state: gateState(
        releaseDecisionWorkflow.releaseDecisionState ===
          "qualified-release-review-ready-not-public-release" &&
          releaseDecisionWorkflow.summary.readyForReviewCount > 0,
        releaseDecisionWorkflow.summary.decisionCount > 0 || releaseDecisionSignal.packetCount > 0
      ),
      protectedRoute: route("/release-decisions"),
      packetRoute: route("/release-decisions/packet"),
      recordCount: releaseDecisionWorkflow.summary.decisionCount,
      packetCount: releaseDecisionSignal.packetCount,
      missingCount: releaseDecisionWorkflow.summary.missingDomainCount,
      latestAt: releaseDecisionWorkflow.summary.latestDecisionAt ?? releaseDecisionSignal.latestAt,
      evidence: `${releaseDecisionWorkflow.summary.readyForReviewCount} release decision(s) ready; state ${releaseDecisionWorkflow.releaseDecisionState}.`,
      nextAction:
        releaseDecisionWorkflow.releaseDecisionState ===
        "qualified-release-review-ready-not-public-release"
          ? "Route versioned claim language to named reviewer signoff."
          : "Record a bounded buyer-diligence release decision after approval references are complete.",
      boundary: "Release decision readiness is not public release or distribution approval."
    },
    {
      id: "named-reviewer-signoffs",
      label: "Named reviewer signoffs",
      state: gateState(
        namedReviewerWorkflow.controlledDistributionReviewState ===
          "ready-for-controlled-distribution-review-not-release-authority",
        namedReviewerWorkflow.summary.signoffCount > 0 || reviewerSignal.packetCount > 0,
        namedReviewerWorkflow.summary.expiredCount > 0
      ),
      protectedRoute: route("/reviewer-signoffs"),
      packetRoute: route("/reviewer-signoffs/packet"),
      recordCount: namedReviewerWorkflow.summary.signoffCount,
      packetCount: reviewerSignal.packetCount,
      missingCount: namedReviewerWorkflow.summary.missingReviewerRoleCount,
      latestAt: namedReviewerWorkflow.summary.latestSignoffAt ?? reviewerSignal.latestAt,
      evidence: `${namedReviewerWorkflow.summary.linkedReviewerRoleCount}/${namedReviewerWorkflow.summary.requiredReviewerRoleCount} reviewer roles linked; ${namedReviewerWorkflow.summary.expiredCount} expired.`,
      nextAction:
        namedReviewerWorkflow.controlledDistributionReviewState ===
        "ready-for-controlled-distribution-review-not-release-authority"
          ? "Stage the disabled distribution lockbox."
          : "Retain metadata signoffs for every required reviewer role.",
      boundary: "Named reviewer signoffs are metadata references, not signatures or legal opinions."
    },
    {
      id: "distribution-lockbox",
      label: "Disabled distribution lockbox",
      state: gateState(
        distributionLockboxWorkflow.lockboxState ===
          "external-distribution-lockbox-review-ready-not-release-authority",
        distributionLockboxWorkflow.summary.lockboxCount > 0 || lockboxSignal.packetCount > 0
      ),
      protectedRoute: route("/distribution-lockbox"),
      packetRoute: route("/distribution-lockbox/packet"),
      recordCount: distributionLockboxWorkflow.summary.lockboxCount,
      packetCount: lockboxSignal.packetCount,
      missingCount: distributionLockboxWorkflow.summary.missingReviewerRoleCount,
      latestAt: distributionLockboxWorkflow.summary.latestLockboxAt ?? lockboxSignal.latestAt,
      evidence: `${distributionLockboxWorkflow.summary.readyForReviewCount} disabled lockbox record(s) ready; distribution state ${distributionLockboxWorkflow.distributionState}.`,
      nextAction:
        distributionLockboxWorkflow.lockboxState ===
        "external-distribution-lockbox-review-ready-not-release-authority"
          ? "Route disabled lockbox metadata to release-authority attestation."
          : "Create a disabled lockbox after reviewer metadata is complete.",
      boundary: "The lockbox remains distribution-disabled and does not grant access."
    },
    {
      id: "release-authority-attestations",
      label: "Release authority attestations",
      state: gateState(
        releaseAuthorityWorkflow.authorityState ===
          "release-authority-review-ready-not-release-approval",
        releaseAuthorityWorkflow.summary.attestationCount > 0 || authoritySignal.packetCount > 0
      ),
      protectedRoute: route("/release-authority-attestations"),
      packetRoute: route("/release-authority-attestations/packet"),
      recordCount: releaseAuthorityWorkflow.summary.attestationCount,
      packetCount: authoritySignal.packetCount,
      missingCount: releaseAuthorityWorkflow.summary.missingAuthorityDomainCount,
      latestAt: releaseAuthorityWorkflow.summary.latestAttestationAt ?? authoritySignal.latestAt,
      evidence: `${releaseAuthorityWorkflow.summary.linkedAuthorityDomainCount}/${releaseAuthorityWorkflow.summary.requiredAuthorityDomainCount} authority domains linked; release state ${releaseAuthorityWorkflow.releaseState}.`,
      nextAction:
        releaseAuthorityWorkflow.authorityState ===
        "release-authority-review-ready-not-release-approval"
          ? "Proceed to recipient controls while keeping exact recipients external."
          : "Retain no-PHI authority attestations for missing domains.",
      boundary: "Release authority attestations are not release approval."
    },
    {
      id: "recipient-attestations",
      label: "Evidence-room recipient attestations",
      state: gateState(
        recipientWorkflow.recipientState ===
          "recipient-attestation-review-ready-not-release-approval",
        recipientWorkflow.summary.attestationCount > 0 || recipientSignal.packetCount > 0
      ),
      protectedRoute: route("/evidence-room-recipient-attestations"),
      packetRoute: route("/evidence-room-recipient-attestations/packet"),
      recordCount: recipientWorkflow.summary.attestationCount,
      packetCount: recipientSignal.packetCount,
      missingCount: recipientWorkflow.summary.missingRecipientControlCount,
      latestAt: recipientWorkflow.summary.latestAttestationAt ?? recipientSignal.latestAt,
      evidence: `${recipientWorkflow.summary.linkedRecipientControlCount}/${recipientWorkflow.summary.requiredRecipientControlCount} recipient controls linked; export state ${recipientWorkflow.exportState}.`,
      nextAction:
        recipientWorkflow.recipientState ===
        "recipient-attestation-review-ready-not-release-approval"
          ? "Reconcile evidence-room access logs without raw logs."
          : "Record recipient segment metadata while exact recipient lists remain external.",
      boundary: "SCRIMED stores no exact recipient lists, emails, access grants, or recipient identifiers."
    },
    {
      id: "access-log-reconciliation",
      label: "Evidence-room access-log reconciliation",
      state: gateState(
        accessLogWorkflow.reconciliationState ===
          "access-log-reconciliation-review-ready-not-export-approval" &&
          accessLogWorkflow.summary.anomalyNeedsReviewCount === 0,
        accessLogWorkflow.summary.reconciliationCount > 0 || accessLogSignal.packetCount > 0,
        accessLogWorkflow.summary.anomalyNeedsReviewCount > 0
      ),
      protectedRoute: route("/evidence-room-access-log-reconciliation"),
      packetRoute: route("/evidence-room-access-log-reconciliation/packet"),
      recordCount: accessLogWorkflow.summary.reconciliationCount,
      packetCount: accessLogSignal.packetCount,
      missingCount: accessLogWorkflow.summary.missingAccessLogControlCount,
      latestAt: accessLogWorkflow.summary.latestReconciliationAt ?? accessLogSignal.latestAt,
      evidence: `${accessLogWorkflow.summary.linkedAccessLogControlCount}/${accessLogWorkflow.summary.requiredAccessLogControlCount} access-log controls linked; ${accessLogWorkflow.summary.anomalyNeedsReviewCount} anomaly review(s).`,
      nextAction:
        accessLogWorkflow.reconciliationState ===
          "access-log-reconciliation-review-ready-not-export-approval" &&
        accessLogWorkflow.summary.anomalyNeedsReviewCount === 0
          ? "Pause for qualified human release review; this is still not release approval."
          : "Complete access-log reconciliation metadata and resolve anomalies before sharing.",
      boundary: "SCRIMED stores no raw logs, IP addresses, device IDs, URLs, recipients, or access grants."
    }
  ];

  const readyGateCount = gates.filter((gate) => gate.state === "ready").length;
  const reviewGateCount = gates.filter((gate) => gate.state === "review").length;
  const blockedGateCount = gates.filter((gate) => gate.state === "blocked").length;
  const chainState: ProtectedBuyerReleaseControlGateState =
    blockedGateCount > 0 ? "blocked" : reviewGateCount > 0 ? "review" : "ready";
  const latestSignalAt =
    gates
      .map((gate) => gate.latestAt)
      .filter((date): date is string => Boolean(date))
      .sort((left, right) => Date.parse(right) - Date.parse(left))[0] ?? null;
  const latestSignalId =
    [
      buyerExport,
      externalSignal,
      releaseDecisionSignal,
      reviewerSignal,
      lockboxSignal,
      authoritySignal,
      recipientSignal,
      accessLogSignal
    ].find((signal) => signal.latestAt === latestSignalAt)?.latestId ?? null;

  return {
    service: "scrimed-protected-buyer-release-control-run",
    status: protectedBuyerReleaseControlRunStatus,
    proofStackStatus: protectedBuyerReleaseControlRunProofStackStatus,
    packetProofStackStatus: protectedBuyerReleaseControlRunPacketProofStackStatus,
    workspace: {
      name: workspace.name,
      slug: workspace.slug,
      status: workspace.status
    },
    boundary: protectedBuyerReleaseControlRunBoundary,
    chainState,
    releaseDecision:
      chainState === "ready"
        ? "protected-chain-ready-human-release-review-required"
        : "protected-chain-incomplete",
    shareState:
      chainState === "ready"
        ? "qualified-human-review-ready-not-release-approval"
        : buyerExport.eventCount > 0
          ? "qualified-release-review-in-progress"
          : "export-required-before-share-review",
    readyGateCount,
    reviewGateCount,
    blockedGateCount,
    gateCount: gates.length,
    score: Math.round((readyGateCount / gates.length) * 100),
    latestSignalAt,
    latestSignalId,
    gates,
    unresolvedBoundaries,
    safeWorkarounds,
    nextAction:
      chainState === "ready"
        ? "Pause for qualified human release review in the approved external authority channel; do not treat this verifier as release approval."
        : gates.find((gate) => gate.state !== "ready")?.nextAction ??
          "Keep external sharing disabled until every release-control gate is retained.",
    unavailableSections,
    updated: "2026-06-22"
  };
}

function markdownList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function gateLines(gates: ProtectedBuyerReleaseControlGate[]) {
  return gates.flatMap((gate, index) => [
    `## ${index + 1}. ${gate.label}`,
    `- Gate ID: ${gate.id}`,
    `- State: ${gate.state}`,
    `- Protected route: ${gate.protectedRoute}`,
    `- Packet route: ${gate.packetRoute}`,
    `- Records: ${gate.recordCount}`,
    `- Packet audits: ${gate.packetCount}`,
    `- Missing count: ${gate.missingCount}`,
    `- Latest signal: ${gate.latestAt ?? "not available"}`,
    `- Evidence: ${gate.evidence}`,
    `- Next action: ${gate.nextAction}`,
    `- Boundary: ${gate.boundary}`,
    ""
  ]);
}

export function buildProtectedBuyerReleaseControlRunPacket({
  actorUserId,
  auditEventId,
  generatedAt,
  run,
  workspace
}: {
  actorUserId: string;
  auditEventId?: string | null;
  generatedAt: string;
  run: ProtectedBuyerReleaseControlRun;
  workspace: PilotWorkspaceRecord;
}) {
  return [
    "# SCRIMED Protected Buyer Release Control Chain Packet",
    "",
    `Workspace: ${workspace.name} (${workspace.slug})`,
    `Generated: ${generatedAt}`,
    `Generated by: ${actorUserId}`,
    `Packet audit event: ${auditEventId ?? "pending"}`,
    `Proof stack: ${run.packetProofStackStatus}`,
    "",
    "## Boundary",
    run.boundary,
    "",
    "## Decision",
    `Chain state: ${run.chainState}`,
    `Release decision: ${run.releaseDecision}`,
    `Share state: ${run.shareState}`,
    `Score: ${run.score}%`,
    `Ready gates: ${run.readyGateCount}/${run.gateCount}`,
    `Review gates: ${run.reviewGateCount}`,
    `Blocked gates: ${run.blockedGateCount}`,
    `Latest signal: ${run.latestSignalId ?? "not available"} at ${run.latestSignalAt ?? "not available"}`,
    `Next action: ${run.nextAction}`,
    "",
    "## Gates",
    ...gateLines(run.gates),
    "## Unresolved Boundaries",
    markdownList(run.unresolvedBoundaries),
    "",
    "## Safe Workarounds",
    markdownList(run.safeWorkarounds),
    "",
    "## Unavailable Sections",
    run.unavailableSections.length ? markdownList(run.unavailableSections) : "- none",
    "",
    "## Hard Stop",
    "This packet is not legal approval, privacy approval, security certification, HIPAA/SOC/FDA certification, public release approval, reimbursement certainty, production connector approval, PHI authority, live clinical care authority, or autonomous clinical execution authority."
  ].join("\n");
}
