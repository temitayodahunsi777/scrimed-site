import type { ProtectedDistributionLockboxWorkflow } from "./protectedDistributionLockbox";
import type {
  ProtectedEvidenceRoomAccessLogReconciliationWorkflow
} from "./protectedEvidenceRoomAccessLogReconciliation";
import type {
  ProtectedEvidenceRoomRecipientAttestationWorkflow
} from "./protectedEvidenceRoomRecipientAttestations";
import type { ProtectedExternalApprovalEvidenceWorkflow } from "./protectedExternalApprovalEvidence";
import type {
  ProtectedBuyerReleaseControlGate,
  ProtectedBuyerReleaseControlRun
} from "./protectedBuyerReleaseControlRun";
import type {
  ProtectedBuyerReleaseRemediationPlan,
  ProtectedBuyerReleaseRemediationStep
} from "./protectedBuyerReleaseRemediationPlan";
import type {
  PilotAuditEventRecord,
  PilotWorkspaceRecord
} from "./protectedPilotWorkspace";
import type { ProtectedNamedReviewerSignoffWorkflow } from "./protectedNamedReviewerSignoffs";
import type {
  ProtectedReleaseAuthorityAttestationWorkflow
} from "./protectedReleaseAuthorityAttestations";
import type { ProtectedReleaseDecisionWorkflow } from "./protectedReleaseDecisionWorkflow";

export type ProtectedBuyerReleaseGateReconciliationSignal = {
  id: string;
  eventType: string;
  packetType: string | null;
  actorUserId: string;
  createdAt: string;
};

export type ProtectedBuyerReleaseGateReconciliationMetric = {
  label: string;
  value: number | string | null;
  target?: number | string;
  state: "ready" | "blocked" | "review";
};

export type ProtectedBuyerReleaseGateMissingItem = {
  id: string;
  label: string;
  scope: string;
  status: "missing" | "linked" | "not-recorded";
};

export type ProtectedBuyerReleaseGateMetadataTemplateField = {
  key: string;
  label: string;
  value: string;
  required: true;
  storageBoundary: "metadata-only-no-artifact";
};

export type ProtectedBuyerReleaseGateReconciliationItem = {
  gateId: string;
  label: string;
  state: ProtectedBuyerReleaseControlGate["state"];
  priority: ProtectedBuyerReleaseRemediationStep["priority"];
  protectedRoute: string;
  packetRoute: string;
  retainedRecordCount: number;
  retainedPacketAuditCount: number;
  missingCount: number;
  latestSignal: ProtectedBuyerReleaseGateReconciliationSignal | null;
  currentEvidence: string;
  evidenceMetrics: ProtectedBuyerReleaseGateReconciliationMetric[];
  missingItems: ProtectedBuyerReleaseGateMissingItem[];
  safeMetadataTemplate: ProtectedBuyerReleaseGateMetadataTemplateField[];
  blockedData: string[];
  safeWorkaround: string;
  nextAction: string;
  humanApprovalRequired: boolean;
  canBypass: false;
  bypassDecision: string;
  boundary: string;
};

export type ProtectedBuyerReleaseGateReconciliation = {
  service: "scrimed-protected-buyer-release-gate-reconciliation";
  status:
    | "gate-reconciliation-action-required"
    | "gate-reconciliation-ready-for-qualified-human-review";
  proofStackStatus: "aal2-protected-gate-reconciliation-no-release-approval";
  workspace: {
    name: string;
    slug: string;
    status: string;
  };
  chainState: ProtectedBuyerReleaseControlRun["chainState"];
  operatorDecision: "do-not-share" | "pause-for-qualified-human-release-review";
  gateCount: number;
  readyGateCount: number;
  blockedGateCount: number;
  missingItemCount: number;
  latestSignal: ProtectedBuyerReleaseGateReconciliationSignal | null;
  nextAction: string;
  gates: ProtectedBuyerReleaseGateReconciliationItem[];
  boundary: string;
  updated: "2026-06-23";
};

export const protectedBuyerReleaseGateReconciliationBoundary =
  "Protected Buyer Release Gate Evidence Reconciliation compares no-PHI release-control metadata, workflow summaries, and append-only audit signals. It does not store approval artifacts, recipient lists, raw logs, PHI, secrets, legal opinions, security reports, customer permission artifacts, production connector credentials, or live clinical records, and it is not release approval.";

const auditSignalsByGate: Record<string, { eventTypes: string[]; packetTypes: string[] }> = {
  "buyer-diligence-export": {
    eventTypes: ["buyer-pilot-room-packet-downloaded"],
    packetTypes: []
  },
  "external-approval-evidence": {
    eventTypes: ["protected-external-approval-evidence-recorded"],
    packetTypes: ["protected-external-approval-evidence-links"]
  },
  "release-decision": {
    eventTypes: ["protected-release-decision-recorded"],
    packetTypes: ["protected-release-decision-claim-registry"]
  },
  "named-reviewer-signoffs": {
    eventTypes: ["protected-named-reviewer-signoff-recorded"],
    packetTypes: ["protected-named-reviewer-signoffs"]
  },
  "distribution-lockbox": {
    eventTypes: ["protected-distribution-lockbox-recorded"],
    packetTypes: ["protected-distribution-lockbox"]
  },
  "release-authority-attestations": {
    eventTypes: ["protected-release-authority-attestation-recorded"],
    packetTypes: ["protected-release-authority-attestations"]
  },
  "recipient-attestations": {
    eventTypes: ["protected-evidence-room-recipient-attestation-recorded"],
    packetTypes: ["protected-evidence-room-recipient-attestations"]
  },
  "access-log-reconciliation": {
    eventTypes: ["protected-evidence-room-access-log-reconciliation-recorded"],
    packetTypes: ["protected-evidence-room-access-log-reconciliation"]
  }
};

function stateFromMissing(missingCount: number): ProtectedBuyerReleaseGateReconciliationMetric["state"] {
  return missingCount > 0 ? "blocked" : "ready";
}

function metadataPacketType(event: PilotAuditEventRecord) {
  const packetType = event.eventMetadata.packetType;
  return typeof packetType === "string" ? packetType : null;
}

function latestGateSignal(gateId: string, auditEvents: PilotAuditEventRecord[]) {
  const mapping = auditSignalsByGate[gateId];

  if (!mapping) return null;

  const latest = auditEvents
    .filter((event) => {
      const packetType = metadataPacketType(event);
      return (
        mapping.eventTypes.includes(event.eventType) ||
        (event.eventType === "enterprise-proof-packet-downloaded" &&
          Boolean(packetType && mapping.packetTypes.includes(packetType)))
      );
    })
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))[0];

  if (!latest) return null;

  return {
    id: latest.id,
    eventType: latest.eventType,
    packetType: metadataPacketType(latest),
    actorUserId: latest.actorUserId,
    createdAt: latest.createdAt
  };
}

function labelize(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function keyFor(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function templateValue(workspace: PilotWorkspaceRecord, gateId: string, label: string) {
  const key = keyFor(label);

  if (key.includes("attestation")) return "metadata-only-no-phi-attested";
  if (key.includes("timestamp") || key.includes("window")) return "YYYY-MM-DDTHH:mm:ssZ";
  if (key.includes("locator") || key.includes("reference")) {
    return `external-system:${workspace.slug}:${gateId}:${key}`;
  }
  if (key.includes("scope")) return "qualified-review-scope-only";
  if (key.includes("state") || key.includes("status")) return "external-review-required";

  return `metadata:${workspace.slug}:${gateId}:${key}`;
}

function metadataTemplate(
  workspace: PilotWorkspaceRecord,
  gateId: string,
  step: ProtectedBuyerReleaseRemediationStep
): ProtectedBuyerReleaseGateMetadataTemplateField[] {
  return step.safeMetadataToCollect.map((label) => ({
    key: keyFor(label),
    label,
    value: templateValue(workspace, gateId, label),
    required: true,
    storageBoundary: "metadata-only-no-artifact"
  }));
}

function definitionItem(
  id: string,
  definitions: ReadonlyArray<{ id: string; label?: string; requiredScope?: string; referencePurpose?: string }>
): ProtectedBuyerReleaseGateMissingItem {
  const definition = definitions.find((item) => item.id === id);

  return {
    id,
    label: definition?.label ?? labelize(id),
    scope: definition?.requiredScope ?? definition?.referencePurpose ?? "Retain no-PHI metadata reference.",
    status: "missing"
  };
}

function missingItemsForGate({
  accessLogWorkflow,
  externalApprovalWorkflow,
  gateId,
  namedReviewerWorkflow,
  distributionLockboxWorkflow,
  recipientWorkflow,
  releaseAuthorityWorkflow,
  releaseDecisionWorkflow
}: {
  accessLogWorkflow: ProtectedEvidenceRoomAccessLogReconciliationWorkflow;
  externalApprovalWorkflow: ProtectedExternalApprovalEvidenceWorkflow;
  gateId: string;
  namedReviewerWorkflow: ProtectedNamedReviewerSignoffWorkflow;
  distributionLockboxWorkflow: ProtectedDistributionLockboxWorkflow;
  recipientWorkflow: ProtectedEvidenceRoomRecipientAttestationWorkflow;
  releaseAuthorityWorkflow: ProtectedReleaseAuthorityAttestationWorkflow;
  releaseDecisionWorkflow: ProtectedReleaseDecisionWorkflow;
}): ProtectedBuyerReleaseGateMissingItem[] {
  if (gateId === "external-approval-evidence") {
    return externalApprovalWorkflow.domains
      .filter((domain) => !domain.latestRecord)
      .map((domain) => ({
        id: domain.id,
        label: domain.label,
        scope: domain.referencePurpose,
        status: "not-recorded"
      }));
  }

  if (gateId === "release-decision") {
    return releaseDecisionWorkflow.missingApprovalDomains.map((id) =>
      definitionItem(id, externalApprovalWorkflow.domains)
    );
  }

  if (gateId === "named-reviewer-signoffs") {
    return namedReviewerWorkflow.missingReviewerRoles.map((id) =>
      definitionItem(id, namedReviewerWorkflow.requiredReviewerRoles)
    );
  }

  if (gateId === "distribution-lockbox") {
    return distributionLockboxWorkflow.missingReviewerRoles.map((id) =>
      definitionItem(id, distributionLockboxWorkflow.requiredReviewerRoles)
    );
  }

  if (gateId === "release-authority-attestations") {
    return releaseAuthorityWorkflow.missingAuthorityDomains.map((id) =>
      definitionItem(id, releaseAuthorityWorkflow.requiredAuthorityDomains)
    );
  }

  if (gateId === "recipient-attestations") {
    return recipientWorkflow.missingRecipientControls.map((id) => ({
      id,
      label: labelize(id),
      scope: "Recipient-control metadata must be retained without exact recipient identifiers.",
      status: "missing"
    }));
  }

  if (gateId === "access-log-reconciliation") {
    return accessLogWorkflow.missingAccessLogControls.map((id) => ({
      id,
      label: labelize(id),
      scope: "Access-log reconciliation metadata must be retained while raw logs remain external.",
      status: "missing"
    }));
  }

  return [];
}

function metricsForGate({
  accessLogWorkflow,
  distributionLockboxWorkflow,
  externalApprovalWorkflow,
  gate,
  namedReviewerWorkflow,
  recipientWorkflow,
  releaseAuthorityWorkflow,
  releaseDecisionWorkflow
}: {
  accessLogWorkflow: ProtectedEvidenceRoomAccessLogReconciliationWorkflow;
  distributionLockboxWorkflow: ProtectedDistributionLockboxWorkflow;
  externalApprovalWorkflow: ProtectedExternalApprovalEvidenceWorkflow;
  gate: ProtectedBuyerReleaseControlGate;
  namedReviewerWorkflow: ProtectedNamedReviewerSignoffWorkflow;
  recipientWorkflow: ProtectedEvidenceRoomRecipientAttestationWorkflow;
  releaseAuthorityWorkflow: ProtectedReleaseAuthorityAttestationWorkflow;
  releaseDecisionWorkflow: ProtectedReleaseDecisionWorkflow;
}): ProtectedBuyerReleaseGateReconciliationMetric[] {
  const standardMetrics: ProtectedBuyerReleaseGateReconciliationMetric[] = [
    { label: "Retained records", value: gate.recordCount, state: gate.recordCount > 0 ? "ready" : "blocked" },
    { label: "Packet audits", value: gate.packetCount, state: gate.packetCount > 0 ? "ready" : "review" },
    { label: "Missing items", value: gate.missingCount, state: stateFromMissing(gate.missingCount) }
  ];

  if (gate.id === "external-approval-evidence") {
    return [
      ...standardMetrics,
      {
        label: "Approval domains",
        value: externalApprovalWorkflow.summary.recordedDomainCount,
        target: externalApprovalWorkflow.summary.domainCount,
        state: stateFromMissing(externalApprovalWorkflow.summary.missingDomainCount)
      },
      {
        label: "Linked finance gates",
        value: externalApprovalWorkflow.summary.linkedFinanceGateRecordCount,
        target: externalApprovalWorkflow.summary.financeGateCount,
        state: "review"
      }
    ];
  }

  if (gate.id === "release-decision") {
    return [
      ...standardMetrics,
      {
        label: "Ready decisions",
        value: releaseDecisionWorkflow.summary.readyForReviewCount,
        state: releaseDecisionWorkflow.summary.readyForReviewCount > 0 ? "ready" : "blocked"
      },
      {
        label: "Linked approval domains",
        value: releaseDecisionWorkflow.summary.linkedDomainCount,
        target: releaseDecisionWorkflow.summary.requiredDomainCount,
        state: stateFromMissing(releaseDecisionWorkflow.summary.missingDomainCount)
      }
    ];
  }

  if (gate.id === "named-reviewer-signoffs") {
    return [
      ...standardMetrics,
      {
        label: "Linked reviewer roles",
        value: namedReviewerWorkflow.summary.linkedReviewerRoleCount,
        target: namedReviewerWorkflow.summary.requiredReviewerRoleCount,
        state: stateFromMissing(namedReviewerWorkflow.summary.missingReviewerRoleCount)
      },
      {
        label: "Expired signoffs",
        value: namedReviewerWorkflow.summary.expiredCount,
        state: namedReviewerWorkflow.summary.expiredCount > 0 ? "blocked" : "ready"
      }
    ];
  }

  if (gate.id === "distribution-lockbox") {
    return [
      ...standardMetrics,
      {
        label: "Disabled lockboxes ready",
        value: distributionLockboxWorkflow.summary.readyForReviewCount,
        state: distributionLockboxWorkflow.summary.readyForReviewCount > 0 ? "ready" : "blocked"
      },
      {
        label: "Missing reviewer roles",
        value: distributionLockboxWorkflow.summary.missingReviewerRoleCount,
        state: stateFromMissing(distributionLockboxWorkflow.summary.missingReviewerRoleCount)
      }
    ];
  }

  if (gate.id === "release-authority-attestations") {
    return [
      ...standardMetrics,
      {
        label: "Linked authority domains",
        value: releaseAuthorityWorkflow.summary.linkedAuthorityDomainCount,
        target: releaseAuthorityWorkflow.summary.requiredAuthorityDomainCount,
        state: stateFromMissing(releaseAuthorityWorkflow.summary.missingAuthorityDomainCount)
      },
      {
        label: "Ready lockboxes",
        value: releaseAuthorityWorkflow.summary.readyLockboxCount,
        state: releaseAuthorityWorkflow.summary.readyLockboxCount > 0 ? "ready" : "blocked"
      }
    ];
  }

  if (gate.id === "recipient-attestations") {
    return [
      ...standardMetrics,
      {
        label: "Linked recipient controls",
        value: recipientWorkflow.summary.linkedRecipientControlCount,
        target: recipientWorkflow.summary.requiredRecipientControlCount,
        state: stateFromMissing(recipientWorkflow.summary.missingRecipientControlCount)
      },
      {
        label: "Ready release authority attestations",
        value: recipientWorkflow.summary.readyReleaseAuthorityAttestationCount,
        state: recipientWorkflow.summary.readyReleaseAuthorityAttestationCount > 0 ? "ready" : "blocked"
      }
    ];
  }

  if (gate.id === "access-log-reconciliation") {
    return [
      ...standardMetrics,
      {
        label: "Linked access-log controls",
        value: accessLogWorkflow.summary.linkedAccessLogControlCount,
        target: accessLogWorkflow.summary.requiredAccessLogControlCount,
        state: stateFromMissing(accessLogWorkflow.summary.missingAccessLogControlCount)
      },
      {
        label: "Anomalies needing review",
        value: accessLogWorkflow.summary.anomalyNeedsReviewCount,
        state: accessLogWorkflow.summary.anomalyNeedsReviewCount > 0 ? "blocked" : "ready"
      }
    ];
  }

  return standardMetrics;
}

export function deriveProtectedBuyerReleaseGateReconciliation({
  accessLogWorkflow,
  auditEvents,
  distributionLockboxWorkflow,
  externalApprovalWorkflow,
  namedReviewerWorkflow,
  recipientWorkflow,
  releaseAuthorityWorkflow,
  releaseDecisionWorkflow,
  remediationPlan,
  run,
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
  remediationPlan: ProtectedBuyerReleaseRemediationPlan;
  run: ProtectedBuyerReleaseControlRun;
  workspace: PilotWorkspaceRecord;
}): ProtectedBuyerReleaseGateReconciliation {
  const gates = run.gates.map((gate) => {
    const step = remediationPlan.steps.find((item) => item.gateId === gate.id);
    const fallbackStep = remediationPlan.steps[0];
    const remediationStep = step ?? fallbackStep;

    if (!remediationStep) {
      throw new Error("Protected buyer release remediation plan did not include gate steps.");
    }

    const latestSignal = latestGateSignal(gate.id, auditEvents);
    const missingItems = missingItemsForGate({
      accessLogWorkflow,
      externalApprovalWorkflow,
      gateId: gate.id,
      namedReviewerWorkflow,
      distributionLockboxWorkflow,
      recipientWorkflow,
      releaseAuthorityWorkflow,
      releaseDecisionWorkflow
    });

    return {
      gateId: gate.id,
      label: gate.label,
      state: gate.state,
      priority: remediationStep.priority,
      protectedRoute: gate.protectedRoute,
      packetRoute: gate.packetRoute,
      retainedRecordCount: gate.recordCount,
      retainedPacketAuditCount: gate.packetCount,
      missingCount: gate.missingCount,
      latestSignal,
      currentEvidence: gate.evidence,
      evidenceMetrics: metricsForGate({
        accessLogWorkflow,
        distributionLockboxWorkflow,
        externalApprovalWorkflow,
        gate,
        namedReviewerWorkflow,
        recipientWorkflow,
        releaseAuthorityWorkflow,
        releaseDecisionWorkflow
      }),
      missingItems,
      safeMetadataTemplate: metadataTemplate(workspace, gate.id, remediationStep),
      blockedData: remediationStep.blockedData,
      safeWorkaround: remediationStep.safeWorkaround,
      nextAction: gate.nextAction,
      humanApprovalRequired: remediationStep.humanApprovalRequired,
      canBypass: false as const,
      bypassDecision: remediationStep.bypassDecision,
      boundary: gate.boundary
    };
  });
  const missingItemCount = gates.reduce((total, gate) => total + gate.missingItems.length, 0);
  const latestSignal =
    gates
      .map((gate) => gate.latestSignal)
      .filter((signal): signal is ProtectedBuyerReleaseGateReconciliationSignal => Boolean(signal))
      .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))[0] ?? null;
  const readyForHumanReview = run.blockedGateCount === 0 && missingItemCount === 0;

  return {
    service: "scrimed-protected-buyer-release-gate-reconciliation",
    status: readyForHumanReview
      ? "gate-reconciliation-ready-for-qualified-human-review"
      : "gate-reconciliation-action-required",
    proofStackStatus: "aal2-protected-gate-reconciliation-no-release-approval",
    workspace: {
      name: workspace.name,
      slug: workspace.slug,
      status: workspace.status
    },
    chainState: run.chainState,
    operatorDecision: readyForHumanReview ? "pause-for-qualified-human-release-review" : "do-not-share",
    gateCount: run.gateCount,
    readyGateCount: run.readyGateCount,
    blockedGateCount: run.blockedGateCount,
    missingItemCount,
    latestSignal,
    nextAction:
      gates.find((gate) => gate.missingItems.length > 0 || gate.state !== "ready")?.nextAction ??
      "Pause for qualified human release review in the approved external authority channel; this remains not release approval.",
    gates,
    boundary: protectedBuyerReleaseGateReconciliationBoundary,
    updated: "2026-06-23"
  };
}
