import type {
  CommandIntelligenceSnapshotRecord,
  CommandIntelligenceState
} from "./commandIntelligenceHub";
import type { PilotAuditEventRecord } from "./protectedPilotWorkspace";
import type { SalesAuditEvent, SalesOpportunity } from "./salesOperations";

export type SalesCommandCenterTimelineKind =
  | "opportunity"
  | "workspace"
  | "command"
  | "buyer"
  | "governance"
  | "commercial";

export type SalesCommandCenterTimelineItem = {
  id: string;
  kind: SalesCommandCenterTimelineKind;
  label: string;
  state: CommandIntelligenceState;
  occurredAt: string;
  evidence: string;
  buyerImpact: string;
  nextAction: string;
  route: string;
};

export type SalesCommandCenterSummary = {
  service: "scrimed-sales-command-center";
  status: "opportunity-command-timeline-ready";
  apiRoute: string;
  proofStackStatus: typeof salesCommandCenterProofStackStatus;
  opportunity: {
    intakeId: string;
    organizationName: string;
    pipelineStage: SalesOpportunity["pipelineStage"];
    offerInterest: string;
    targetAudience: string;
  };
  workspace: {
    linked: boolean;
    workspaceId: string | null;
    workspaceSlug: string | null;
    workspaceName: string | null;
    mode: "buyer-specific-protected-workspace" | "workspace-required";
  };
  commandPosture: {
    snapshotCount: number;
    latestSnapshotId: string | null;
    latestState: CommandIntelligenceState | null;
    latestScore: number | null;
    latestCreatedAt: string | null;
    scoreDelta: number | null;
    trend: "improving" | "stable" | "declining" | "insufficient-history";
    packetExports: number;
  };
  commercialReadiness: {
    score: number;
    completed: number;
    available: number;
    blocked: number;
    nextAction: string;
  };
  timeline: SalesCommandCenterTimelineItem[];
  degradedSections: string[];
  safeMode: {
    dataBoundary: "business-contact-workflow-and-synthetic-command-posture-only";
    blockedInputs: string[];
    retainedHardGates: string[];
  };
  boundary: string;
  updatedAt: string;
};

export const salesCommandCenterProofStackStatus =
  "aal2-sales-command-intelligence-timeline";

export const salesCommandCenterApiRoute =
  "/api/sales-operations/opportunities/{intakeId}/command-center";

export const salesCommandCenterBoundary =
  "Sales Command Center connects business-contact opportunity metadata, protected workspace posture, Command Intelligence snapshots, packet export history, buyer readiness, and next-step commercial actions. It does not accept PHI, patient identifiers, payer member data, medical records, imaging, production credentials, source contracts, legal advice, compliance certification, security certification, reimbursement determination, production connector approval, patient outreach authorization, autonomous diagnosis, autonomous treatment, or live healthcare execution approval.";

const updatedAt = "2026-06-18";

function displayStage(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function latestSalesEvent(events: SalesAuditEvent[], eventType: SalesAuditEvent["eventType"]) {
  return events.find((event) => event.eventType === eventType) ?? null;
}

function latestPilotEvent(events: PilotAuditEventRecord[], eventType: string) {
  return events.find((event) => event.eventType === eventType) ?? null;
}

function commandPosture(
  commandSnapshots: CommandIntelligenceSnapshotRecord[],
  pilotAuditEvents: PilotAuditEventRecord[]
): SalesCommandCenterSummary["commandPosture"] {
  const latest = commandSnapshots[0] ?? null;
  const previous = commandSnapshots[1] ?? null;
  const scoreDelta =
    latest && previous ? latest.commandScore - previous.commandScore : null;

  return {
    snapshotCount: commandSnapshots.length,
    latestSnapshotId: latest?.id ?? null,
    latestState: latest?.commandState ?? null,
    latestScore: latest?.commandScore ?? null,
    latestCreatedAt: latest?.createdAt ?? null,
    scoreDelta,
    trend:
      scoreDelta === null
        ? "insufficient-history"
        : scoreDelta > 0
          ? "improving"
          : scoreDelta < 0
            ? "declining"
            : "stable",
    packetExports: pilotAuditEvents.filter(
      (event) => event.eventType === "command-intelligence-packet-downloaded"
    ).length
  };
}

function commercialMilestones({
  commandSnapshots,
  opportunity,
  pilotAuditEvents,
  salesAuditEvents
}: {
  opportunity: SalesOpportunity;
  salesAuditEvents: SalesAuditEvent[];
  pilotAuditEvents: PilotAuditEventRecord[];
  commandSnapshots: CommandIntelligenceSnapshotRecord[];
}) {
  return [
    {
      label: "Opportunity qualified",
      complete: ["qualified", "discovery", "proposal", "pilot-planning", "won"].includes(
        opportunity.pipelineStage
      ),
      available: opportunity.pipelineStage === "new",
      blocked: false,
      nextAction: "Advance the opportunity to Qualified once sponsor, workflow, and governance need are confirmed."
    },
    {
      label: "Audited proposal released",
      complete: Boolean(latestSalesEvent(salesAuditEvents, "proposal-downloaded")),
      available: true,
      blocked: false,
      nextAction: "Download the audited proposal after human review."
    },
    {
      label: "Buyer-specific workspace",
      complete: Boolean(opportunity.workspaceProvisioning),
      available: ["qualified", "discovery", "proposal", "pilot-planning", "won"].includes(
        opportunity.pipelineStage
      ),
      blocked: !["qualified", "discovery", "proposal", "pilot-planning", "won"].includes(
        opportunity.pipelineStage
      ),
      nextAction: "Provision a buyer-specific protected workspace."
    },
    {
      label: "Command snapshot saved",
      complete: commandSnapshots.length > 0,
      available: Boolean(opportunity.workspaceProvisioning),
      blocked: !opportunity.workspaceProvisioning,
      nextAction: "Save a human-reviewed Command Intelligence snapshot."
    },
    {
      label: "Command packet released",
      complete: Boolean(latestPilotEvent(pilotAuditEvents, "command-intelligence-packet-downloaded")),
      available: commandSnapshots.length > 0,
      blocked: commandSnapshots.length === 0,
      nextAction: "Download the latest Command Intelligence packet after review."
    },
    {
      label: "Buyer diligence export released",
      complete: Boolean(latestPilotEvent(pilotAuditEvents, "buyer-pilot-room-packet-downloaded")),
      available: Boolean(opportunity.workspaceProvisioning),
      blocked: !opportunity.workspaceProvisioning,
      nextAction: "Download the Buyer Diligence Export from the protected workspace."
    },
    {
      label: "Buyer evidence diligence room",
      complete: Boolean(opportunity.buyerDiligenceRoom),
      available: Boolean(opportunity.customerActivationApprovals),
      blocked: !opportunity.customerActivationApprovals,
      nextAction: "Prepare the metadata-only buyer evidence diligence room."
    },
    {
      label: "Secure evidence vault readiness",
      complete: Boolean(opportunity.secureEvidenceVaultReadiness),
      available: Boolean(opportunity.buyerDiligenceRoom),
      blocked: !opportunity.buyerDiligenceRoom,
      nextAction: "Prepare disabled-by-default secure evidence vault readiness."
    }
  ];
}

function commercialReadiness(
  milestones: ReturnType<typeof commercialMilestones>
): SalesCommandCenterSummary["commercialReadiness"] {
  const completed = milestones.filter((milestone) => milestone.complete).length;
  const available = milestones.filter(
    (milestone) => !milestone.complete && milestone.available
  ).length;
  const blocked = milestones.filter((milestone) => milestone.blocked).length;
  const score = Math.round(
    (milestones.reduce((total, milestone) => {
      if (milestone.complete) return total + 1;
      if (milestone.available) return total + 0.5;
      return total;
    }, 0) /
      milestones.length) *
      100
  );
  const next =
    milestones.find((milestone) => !milestone.complete && milestone.available) ??
    milestones.find((milestone) => milestone.blocked);

  return {
    score,
    completed,
    available,
    blocked,
    nextAction: next?.nextAction ?? "Prepare executive buyer follow-up with current command and diligence packets."
  };
}

function timeline({
  commandSnapshots,
  opportunity,
  pilotAuditEvents,
  salesAuditEvents
}: {
  opportunity: SalesOpportunity;
  salesAuditEvents: SalesAuditEvent[];
  pilotAuditEvents: PilotAuditEventRecord[];
  commandSnapshots: CommandIntelligenceSnapshotRecord[];
}): SalesCommandCenterTimelineItem[] {
  const items: SalesCommandCenterTimelineItem[] = [
    {
      id: `opportunity-${opportunity.intakeId}`,
      kind: "opportunity",
      label: "Buyer opportunity entered Sales Operations",
      state: "ready",
      occurredAt: opportunity.receivedAt,
      evidence: `${opportunity.payload.organization.name} requested ${opportunity.payload.scope.offerInterest}.`,
      buyerImpact: "Creates retained business-scope opportunity context for enterprise follow-up.",
      nextAction: "Keep cadence, owner, workflow scope, and no-PHI boundary current.",
      route: "/sales-operations"
    }
  ];
  const proposal = latestSalesEvent(salesAuditEvents, "proposal-downloaded");
  const workspace = latestSalesEvent(salesAuditEvents, "opportunity-workspace-provisioned");
  const commandSnapshot = commandSnapshots[0] ?? null;
  const commandPacket = latestPilotEvent(pilotAuditEvents, "command-intelligence-packet-downloaded");
  const buyerPacket = latestPilotEvent(pilotAuditEvents, "buyer-pilot-room-packet-downloaded");
  const diligence = latestSalesEvent(salesAuditEvents, "buyer-diligence-room-prepared");
  const vault = latestSalesEvent(salesAuditEvents, "secure-evidence-vault-readiness-prepared");

  if (proposal) {
    items.push({
      id: proposal.id,
      kind: "commercial",
      label: "Audited proposal released",
      state: "ready",
      occurredAt: proposal.createdAt,
      evidence: "Sales proposal download was recorded in the append-only sales audit trail.",
      buyerImpact: "Moves buyer from interest to scoped commercial review without a CRM dependency.",
      nextAction: "Attach current buyer-room and command packet evidence before executive follow-up.",
      route: `/api/sales-operations/opportunities/${encodeURIComponent(opportunity.intakeId)}/proposal`
    });
  }

  if (workspace || opportunity.workspaceProvisioning) {
    items.push({
      id: workspace?.id ?? `workspace-${opportunity.workspaceProvisioning?.workspaceId ?? opportunity.intakeId}`,
      kind: "workspace",
      label: "Buyer-specific protected workspace linked",
      state: "ready",
      occurredAt: workspace?.createdAt ?? opportunity.workspaceProvisioning?.createdAt ?? opportunity.updatedAt,
      evidence: opportunity.workspaceProvisioning
        ? `Workspace ${opportunity.workspaceProvisioning.workspaceSlug} is linked to the opportunity.`
        : "Workspace provisioning event exists, but workspace details are not present in the current payload.",
      buyerImpact: "Gives the buyer a tenant-isolated room for synthetic proof, diligence, and command posture.",
      nextAction: "Open the buyer room and save a current Command Intelligence snapshot.",
      route: opportunity.workspaceProvisioning
        ? `/pilot-workspace/access?workspace=${encodeURIComponent(opportunity.workspaceProvisioning.workspaceSlug)}&opportunity=${encodeURIComponent(opportunity.intakeId)}`
        : "/pilot-workspace/access"
    });
  }

  if (commandSnapshot) {
    items.push({
      id: commandSnapshot.id,
      kind: "command",
      label: "Command Intelligence snapshot saved",
      state: commandSnapshot.commandState,
      occurredAt: commandSnapshot.createdAt,
      evidence: `Command score ${commandSnapshot.commandScore}%, buyer score ${commandSnapshot.buyerRoomScore}%, ${commandSnapshot.workstreamCount} workstreams.`,
      buyerImpact: "Shows current operating posture across Agent Commander, Trust Engine, evaluation, tooling, and safe mode.",
      nextAction: "Download the latest Command Intelligence packet after human review.",
      route: opportunity.workspaceProvisioning
        ? `/api/pilot-workspaces/${encodeURIComponent(opportunity.workspaceProvisioning.workspaceSlug)}/command-intelligence/${encodeURIComponent(commandSnapshot.id)}/packet`
        : "/pilot-workspace/access"
    });
  }

  if (commandPacket) {
    items.push({
      id: commandPacket.id,
      kind: "command",
      label: "Command Intelligence packet released",
      state: "ready",
      occurredAt: commandPacket.createdAt,
      evidence: "Command packet download was recorded before release.",
      buyerImpact: "Gives enterprise diligence a reviewed, timestamped command-posture artifact.",
      nextAction: "Pair command packet with buyer diligence export and explicit production gates.",
      route: "/pilot-workspace/access"
    });
  }

  if (buyerPacket) {
    items.push({
      id: buyerPacket.id,
      kind: "buyer",
      label: "Buyer Diligence Export released",
      state: "ready",
      occurredAt: buyerPacket.createdAt,
      evidence: "Buyer room packet download was recorded before release.",
      buyerImpact: "Packages proof stack, pricing posture, boundaries, and next actions for buyer review.",
      nextAction: "Use it for stakeholder follow-up while keeping live-data requests gated.",
      route: opportunity.workspaceProvisioning
        ? `/api/pilot-workspaces/${encodeURIComponent(opportunity.workspaceProvisioning.workspaceSlug)}/buyer-room/packet`
        : "/pilot-workspace/access"
    });
  }

  if (diligence || opportunity.buyerDiligenceRoom) {
    items.push({
      id: diligence?.id ?? `diligence-${opportunity.intakeId}`,
      kind: "governance",
      label: "Buyer evidence diligence room prepared",
      state: "ready",
      occurredAt: diligence?.createdAt ?? opportunity.buyerDiligenceRoom?.createdAt ?? opportunity.updatedAt,
      evidence: "Metadata-only diligence room tracks signed controls, domain proof, IdP posture, and production gates.",
      buyerImpact: "Turns legal, security, privacy, and connector questions into owned diligence workstreams.",
      nextAction: "Prepare secure evidence vault readiness before accepting any sensitive files.",
      route: `/api/sales-operations/opportunities/${encodeURIComponent(opportunity.intakeId)}/buyer-diligence`
    });
  }

  if (vault || opportunity.secureEvidenceVaultReadiness) {
    items.push({
      id: vault?.id ?? `vault-${opportunity.intakeId}`,
      kind: "governance",
      label: "Secure evidence vault readiness prepared",
      state: "review",
      occurredAt: vault?.createdAt ?? opportunity.secureEvidenceVaultReadiness?.createdAt ?? opportunity.updatedAt,
      evidence: "Sensitive evidence storage remains disabled while DLP, malware scanning, retention, legal hold, and residency controls are reviewed.",
      buyerImpact: "Reduces diligence friction without prematurely storing regulated or secret material.",
      nextAction: "Keep all buyer sensitive documents outside SCRIMED until storage controls are approved.",
      route: `/api/sales-operations/opportunities/${encodeURIComponent(opportunity.intakeId)}/evidence-vault-readiness`
    });
  }

  return items.sort(
    (left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime()
  );
}

export function deriveSalesCommandCenter({
  commandSnapshots,
  degradedSections,
  opportunity,
  pilotAuditEvents,
  salesAuditEvents
}: {
  opportunity: SalesOpportunity;
  salesAuditEvents: SalesAuditEvent[];
  pilotAuditEvents: PilotAuditEventRecord[];
  commandSnapshots: CommandIntelligenceSnapshotRecord[];
  degradedSections: string[];
}): SalesCommandCenterSummary {
  const milestones = commercialMilestones({
    commandSnapshots,
    opportunity,
    pilotAuditEvents,
    salesAuditEvents
  });

  return {
    service: "scrimed-sales-command-center",
    status: "opportunity-command-timeline-ready",
    apiRoute: salesCommandCenterApiRoute.replace("{intakeId}", opportunity.intakeId),
    proofStackStatus: salesCommandCenterProofStackStatus,
    opportunity: {
      intakeId: opportunity.intakeId,
      organizationName: opportunity.payload.organization.name,
      pipelineStage: opportunity.pipelineStage,
      offerInterest: opportunity.payload.scope.offerInterest,
      targetAudience: opportunity.payload.attribution?.market.targetAudience ?? "To be confirmed"
    },
    workspace: {
      linked: Boolean(opportunity.workspaceProvisioning),
      workspaceId: opportunity.workspaceProvisioning?.workspaceId ?? null,
      workspaceSlug: opportunity.workspaceProvisioning?.workspaceSlug ?? null,
      workspaceName: opportunity.workspaceProvisioning?.workspaceName ?? null,
      mode: opportunity.workspaceProvisioning ? "buyer-specific-protected-workspace" : "workspace-required"
    },
    commandPosture: commandPosture(commandSnapshots, pilotAuditEvents),
    commercialReadiness: commercialReadiness(milestones),
    timeline: timeline({
      commandSnapshots,
      opportunity,
      pilotAuditEvents,
      salesAuditEvents
    }),
    degradedSections,
    safeMode: {
      dataBoundary: "business-contact-workflow-and-synthetic-command-posture-only",
      blockedInputs: [
        "PHI, patient identifiers, medical records, imaging, and payer member data",
        "production credentials, private keys, IdP certificates, and source contracts",
        "diagnosis, treatment, emergency triage, payer submission, or reimbursement guarantee requests"
      ],
      retainedHardGates: [
        "BAA/DPA path where applicable",
        "legal, privacy, security, clinical governance, and customer launch approval",
        "live connector authorization and human-review operating model",
        "retention, deletion, legal hold, incident response, and access review"
      ]
    },
    boundary: `${salesCommandCenterBoundary} Current stage: ${displayStage(opportunity.pipelineStage)}.`,
    updatedAt
  };
}

export function getSalesCommandCenterSummary() {
  return {
    service: "scrimed-sales-command-center",
    status: "opportunity-command-timeline-ready",
    apiRoute: salesCommandCenterApiRoute,
    proofStackStatus: salesCommandCenterProofStackStatus,
    purpose:
      "Tie Sales Operations opportunities to protected workspace Command Intelligence snapshots, buyer-room packets, and commercial next actions.",
    boundary: salesCommandCenterBoundary,
    updatedAt
  };
}
