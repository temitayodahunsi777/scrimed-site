export type BuyerReleaseControlRunStepState =
  | "public-runbook-ready"
  | "protected-aal2-required"
  | "external-artifact-required"
  | "metadata-only-ready"
  | "hard-stop";

export type BuyerReleaseControlRunStep = {
  order: number;
  id: string;
  label: string;
  state: BuyerReleaseControlRunStepState;
  protectedRoute: string;
  packetRoute: string;
  prerequisite: string;
  operatorAction: string;
  safePayloadTemplate: Record<string, unknown>;
  expectedAuditSignal: string;
  expectedPacketType: string;
  hardStops: string[];
  boundary: string;
};

export type BuyerReleaseControlRunSummary = {
  service: "scrimed-buyer-release-control-runbook";
  route: string;
  apiRoute: string;
  briefRoute: string;
  protectedVerifierRoute: string;
  protectedVerifierPacketRoute: string;
  protectedVerifierTimelineRoute: string;
  operatorRunScript: string;
  operatorRunCommand: string;
  operatorRunStatus: string;
  status: string;
  proofStackStatus: string;
  briefProofStackStatus: string;
  boundary: string;
  executionDecision: "runbook-ready-protected-aal2-required";
  shareDecision: "internal-only-until-release-chain-retained";
  stepCount: number;
  protectedWriteRouteCount: number;
  packetRouteCount: number;
  hardStopCount: number;
  requiredExternalApprovalDomains: string[];
  requiredReviewerRoles: string[];
  requiredReleaseAuthorityDomains: string[];
  steps: BuyerReleaseControlRunStep[];
  operatorSequence: string[];
  workarounds: string[];
  blockedClaims: string[];
  nextRecommendedAction: string;
  updated: "2026-06-22";
};

export const buyerReleaseControlRunStatus = "buyer-release-control-runbook-ready";
export const buyerReleaseControlRunProofStackStatus =
  "metadata-only-buyer-release-control-runbook-no-release-approval";
export const buyerReleaseControlRunBriefProofStackStatus =
  "buyer-release-control-runbook-brief-no-secret-no-approval";

export const buyerReleaseControlRunRoute = "/buyer-release-control-run";
export const buyerReleaseControlRunApiRoute = "/api/buyer-release-control-run";
export const buyerReleaseControlRunBriefRoute = "/api/buyer-release-control-run/brief";
export const buyerReleaseControlRunProtectedVerifierRoute =
  "/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run";
export const buyerReleaseControlRunProtectedVerifierPacketRoute =
  "/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/packet";
export const buyerReleaseControlRunProtectedVerifierTimelineRoute =
  "/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/timeline";
export const buyerReleaseControlRunOperatorRunScript =
  "scripts/buyer-proof-release-operator-run.mjs";
export const buyerReleaseControlRunOperatorRunCommand =
  "SCRIMED_REQUIRE_BUYER_PROOF_OPERATOR_RUN=1 SCRIMED_WORKSPACE_SLUG={workspaceSlug} SCRIMED_BEARER_TOKEN=<fresh-aal2-jwt> npm run smoke:buyer-proof-operator-run";
export const buyerReleaseControlRunOperatorRunStatus =
  "aal2-buyer-proof-release-operator-run-script-token-boundary";

export const buyerReleaseControlRunBoundary =
  "SCRIMED Buyer Release Control Runbook is a public, metadata-only operator sequence for a future protected AAL2 buyer-specific release-control run. It does not execute protected writes, mint or store tokens, store recipient lists, store signed approvals, process PHI, approve public distribution, certify legal/privacy/security posture, authorize live clinical care, guarantee reimbursement, approve production connectors, or replace qualified human review.";

const workspaceSlug = "{workspaceSlug}";

const requiredExternalApprovalDomains = [
  "finance-methodology-policy",
  "qualified-counsel-release-review",
  "executive-release-review",
  "privacy-security-review",
  "clinical-governance-boundary-review",
  "marketing-claims-review",
  "buyer-permission-review"
];

const requiredReviewerRoles = [
  "finance-reviewer",
  "qualified-counsel",
  "executive-sponsor",
  "privacy-security-owner",
  "clinical-governance-owner",
  "marketing-claims-owner",
  "buyer-permission-owner"
];

const requiredReleaseAuthorityDomains = [
  "qualified-counsel",
  "customer-permission-owner",
  "executive-sponsor",
  "privacy-security-owner",
  "finance-owner",
  "clinical-governance-owner",
  "marketing-claims-owner"
];

const commonHardStops = [
  "Fresh human AAL2 tenant-admin session is unavailable.",
  "Any payload includes PHI, patient identifiers, payer member identifiers, clinical records, raw recipient lists, raw access logs, credentials, tokens, signed approvals, legal opinions, security reports, reimbursement determinations, or production connector data.",
  "The operator attempts to treat metadata references as legal, privacy, security, clinical, reimbursement, customer, public-release, or production authority.",
  "The external system of record cannot retain the real approval, reviewer, lockbox, recipient, or access-log artifact.",
  "The protected workspace rejects the request or does not emit an audited packet reference."
];

function protectedPath(path: string) {
  return `/api/pilot-workspaces/${workspaceSlug}${path}`;
}

function packetPath(path: string) {
  return protectedPath(`${path}/packet`);
}

const steps: BuyerReleaseControlRunStep[] = [
  {
    order: 1,
    id: "external-approval-evidence",
    label: "Reference externally retained approval evidence",
    state: "external-artifact-required",
    protectedRoute: protectedPath("/external-approval-evidence"),
    packetRoute: packetPath("/external-approval-evidence"),
    prerequisite:
      "Qualified external systems retain the actual approvals; SCRIMED stores metadata references only.",
    operatorAction:
      "Record one metadata reference per required approval domain after confirming the artifact is retained outside SCRIMED.",
    safePayloadTemplate: {
      domainId: "<required-external-approval-domain>",
      externalReferenceLabel: "external retained approval reference",
      externalSystem: "external-system-of-record",
      referenceLocator: "external-reference:metadata-only",
      referenceOwner: "<qualified-owner-role>",
      evidenceRetainedExternally: true,
      attestation: "external-approval-evidence-reference-no-phi",
      dataBoundary: "synthetic-business-workflow-only",
      reviewNote: "metadata-only approval reference no phi"
    },
    expectedAuditSignal: "append-only approval-reference packet audit event",
    expectedPacketType: "external-approval-evidence-packet",
    hardStops: commonHardStops,
    boundary:
      "A reference proves an external artifact exists for review; it is not the approval artifact itself."
  },
  {
    order: 2,
    id: "release-decision",
    label: "Record versioned release decision candidate",
    state: "protected-aal2-required",
    protectedRoute: protectedPath("/release-decisions"),
    packetRoute: packetPath("/release-decisions"),
    prerequisite: "External approval evidence references are complete for the intended audience.",
    operatorAction:
      "Record the exact claim text, claim category, distribution audience, and disabled release posture.",
    safePayloadTemplate: {
      audience: "buyer-diligence",
      claimCategory: "governance",
      claimVersion: "claims-v1.0.0",
      claimText:
        "SCRIMED provides governed synthetic pilot evidence for healthcare workflow intelligence review.",
      distributionChannel: "buyer-data-room",
      externalApprovalEvidenceRetained: true,
      releaseDisabled: true,
      attestation: "protected-release-decision-no-phi-no-public-approval",
      dataBoundary: "synthetic-business-workflow-only",
      reviewNote: "no-phi release decision readiness review"
    },
    expectedAuditSignal: "versioned release-decision audit event",
    expectedPacketType: "release-decision-packet",
    hardStops: commonHardStops,
    boundary:
      "A versioned decision candidate keeps language controlled; it is not public-release approval."
  },
  {
    order: 3,
    id: "named-reviewer-signoffs",
    label: "Capture named reviewer signoff metadata",
    state: "protected-aal2-required",
    protectedRoute: protectedPath("/reviewer-signoffs"),
    packetRoute: packetPath("/reviewer-signoffs"),
    prerequisite: "A release decision candidate exists and remains disabled.",
    operatorAction:
      "Record metadata-only reviewer signoff references for every required reviewer role.",
    safePayloadTemplate: {
      releaseDecisionRecordIds: ["<ready-release-decision-record-id>"],
      reviewerRole: "<required-reviewer-role>",
      reviewerLabel: "qualified reviewer label",
      reviewerReferenceLocator: "external-review:metadata-only",
      externalSignoffRetained: true,
      releaseDisabled: true,
      attestation: "protected-named-reviewer-signoff-no-phi-no-public-approval",
      dataBoundary: "synthetic-business-workflow-only",
      reviewNote: "metadata-only reviewer signoff no phi"
    },
    expectedAuditSignal: "reviewer-signoff packet audit event",
    expectedPacketType: "reviewer-signoff-packet",
    hardStops: commonHardStops,
    boundary:
      "SCRIMED stores reviewer metadata and packet audit evidence, not raw signed approvals or legal opinions."
  },
  {
    order: 4,
    id: "distribution-lockbox",
    label: "Record disabled distribution lockbox",
    state: "metadata-only-ready",
    protectedRoute: protectedPath("/distribution-lockbox"),
    packetRoute: packetPath("/distribution-lockbox"),
    prerequisite: "Named reviewer metadata is complete for the intended release audience.",
    operatorAction:
      "Create a disabled lockbox manifest that points to external controlled-room artifacts without distributing them.",
    safePayloadTemplate: {
      releaseDecisionRecordIds: ["<ready-release-decision-record-id>"],
      reviewerSignoffRecordIds: ["<ready-reviewer-signoff-record-id>"],
      distributionAudience: "buyer-diligence-room",
      channelControl: "counsel-reviewed-room",
      manifestVersion: "distribution-v1.0.0",
      manifestTitle: "SCRIMED controlled buyer diligence packet",
      artifactLocator: "external-lockbox:controlled-manifest",
      customerPermissionReference: "external-permission:metadata-only",
      counselReviewReference: "external-counsel-review:metadata-only",
      distributionDisabled: true,
      attestation: "protected-distribution-lockbox-no-phi-no-distribution",
      dataBoundary: "synthetic-business-workflow-only",
      reviewNote: "metadata-only distribution lockbox no phi"
    },
    expectedAuditSignal: "disabled lockbox packet audit event",
    expectedPacketType: "distribution-lockbox-packet",
    hardStops: commonHardStops,
    boundary:
      "The lockbox records distribution controls and disabled state; it does not send files or grant access."
  },
  {
    order: 5,
    id: "release-authority-attestations",
    label: "Record release-authority attestations",
    state: "protected-aal2-required",
    protectedRoute: protectedPath("/release-authority-attestations"),
    packetRoute: packetPath("/release-authority-attestations"),
    prerequisite: "A disabled distribution lockbox exists and every external authority remains retained.",
    operatorAction:
      "Record metadata-only authority attestations for each required release authority domain.",
    safePayloadTemplate: {
      distributionLockboxRecordIds: ["<ready-distribution-lockbox-record-id>"],
      authorityDomain: "<required-release-authority-domain>",
      distributionAudience: "buyer-diligence-room",
      authorityReferenceLabel: "external release authority reference",
      authorityReferenceLocator: "external-authority:metadata-only",
      externalAuthorityRetained: true,
      releaseDisabled: true,
      attestation: "protected-release-authority-attestation-no-phi-no-release-approval",
      dataBoundary: "synthetic-business-workflow-only",
      reviewNote: "metadata-only release authority no phi"
    },
    expectedAuditSignal: "release-authority packet audit event",
    expectedPacketType: "release-authority-attestation-packet",
    hardStops: commonHardStops,
    boundary:
      "Authority attestations describe retained external authority metadata; they do not make SCRIMED the authority."
  },
  {
    order: 6,
    id: "recipient-attestations",
    label: "Record evidence-room recipient controls",
    state: "protected-aal2-required",
    protectedRoute: protectedPath("/evidence-room-recipient-attestations"),
    packetRoute: packetPath("/evidence-room-recipient-attestations"),
    prerequisite: "Release-authority metadata is complete and release remains disabled.",
    operatorAction:
      "Record intended recipient segment, access window, revocation posture, and packet reference without storing recipient identifiers.",
    safePayloadTemplate: {
      releaseAuthorityAttestationRecordIds: [
        "<ready-release-authority-attestation-record-id>"
      ],
      distributionAudience: "buyer-diligence-room",
      recipientSegment: "named-buyer-reviewers",
      recipientScopeLabel: "named buyer diligence reviewer group",
      evidenceRoomReferenceLabel: "external evidence room recipient control",
      evidenceRoomReferenceLocator: "evidence-room:recipient-control",
      packetReferenceLabel: "controlled recipient proof packet",
      packetReferenceLocator: "evidence-room:packet-reference",
      accessWindowStart: "<iso-8601-date>",
      accessWindowEnd: "<iso-8601-date>",
      revocationState: "access-not-issued",
      revocationTrigger: "revoke and re-review evidence room access if scope changes",
      externalRecipientAuthorityRetained: true,
      exportDisabled: true,
      attestation: "protected-evidence-room-recipient-attestation-no-phi",
      dataBoundary: "synthetic-business-workflow-only",
      reviewNote: "metadata-only recipient attestation no phi"
    },
    expectedAuditSignal: "recipient-control packet audit event",
    expectedPacketType: "recipient-attestation-packet",
    hardStops: commonHardStops,
    boundary:
      "Recipient controls are segment metadata only; SCRIMED does not store emails, recipient rosters, or access credentials."
  },
  {
    order: 7,
    id: "access-log-reconciliation",
    label: "Reconcile external evidence-room access logs",
    state: "protected-aal2-required",
    protectedRoute: protectedPath("/evidence-room-access-log-reconciliation"),
    packetRoute: packetPath("/evidence-room-access-log-reconciliation"),
    prerequisite: "Recipient attestations exist and the external evidence room retains access logs.",
    operatorAction:
      "Record metadata-only access-log reconciliation, anomaly posture, and revocation state without copying raw logs.",
    safePayloadTemplate: {
      recipientAttestationRecordIds: ["<ready-recipient-attestation-record-id>"],
      distributionAudience: "buyer-diligence-room",
      reconciliationScope: "pre-release-access-log-review",
      externalLogSystemLabel: "external evidence room access ledger",
      accessLogReferenceLabel: "metadata access log reconciliation",
      accessLogReferenceLocator: "evidence-room:access-log-ledger",
      reconciliationWindowStart: "<iso-8601-date>",
      reconciliationWindowEnd: "<iso-8601-date>",
      observedAccessEventCount: 0,
      expectedRecipientSegmentCount: 1,
      anomalyState: "none-observed",
      revocationExerciseState: "not-issued",
      anomalyEscalationPath: "escalate to governance owner and keep export disabled",
      externalLogAuthorityRetained: true,
      exportDisabled: true,
      attestation: "protected-evidence-room-access-log-reconciliation-no-phi",
      dataBoundary: "synthetic-business-workflow-only",
      reviewNote: "metadata-only access log reconciliation no phi"
    },
    expectedAuditSignal: "access-log reconciliation packet audit event",
    expectedPacketType: "access-log-reconciliation-packet",
    hardStops: commonHardStops,
    boundary:
      "SCRIMED records reconciliation metadata only; raw logs, device identifiers, IP addresses, and recipient identifiers stay out of SCRIMED."
  },
  {
    order: 8,
    id: "buyer-diligence-export-refresh",
    label: "Refresh Buyer Diligence packet after controls are retained",
    state: "hard-stop",
    protectedRoute: protectedPath("/buyer-room"),
    packetRoute: packetPath("/buyer-room"),
    prerequisite:
      "Every prior release-control packet is visible, externally retained artifacts are confirmed, and qualified humans approve continued internal diligence use.",
    operatorAction:
      "Refresh the protected Buyer Pilot Room and export the Buyer Diligence packet only for internal controlled diligence unless external share readiness is complete.",
    safePayloadTemplate: {
      action: "download-buyer-diligence-packet",
      workspaceSlug,
      shareScope: "internal-protected-diligence-only",
      requiredState: "release-control-chain-retained",
      dataBoundary: "synthetic-business-workflow-only"
    },
    expectedAuditSignal: "buyer-room packet-download audit event",
    expectedPacketType: "buyer-diligence-export-packet",
    hardStops: [
      ...commonHardStops,
      "Any stakeholder asks to send the packet externally before recipient and access-log controls are reconciled.",
      "Any claim expands beyond retained synthetic QA, governance posture, buyer diligence readiness, or explicit limitations."
    ],
    boundary:
      "A refreshed packet can support controlled diligence only; external sharing remains blocked until qualified release-chain evidence is retained."
  }
];

const operatorSequence = [
  "Open /pilot-workspace/access with a fresh human AAL2 tenant-admin session.",
  "Confirm the workspace is synthetic and the intended audience is buyer-diligence-room.",
  "Record external approval evidence references for every required domain; keep real approvals outside SCRIMED.",
  "Record a disabled versioned release decision for the exact bounded claim text.",
  "Record metadata-only named reviewer signoffs for every required reviewer role.",
  "Record a disabled distribution lockbox that references external controlled-room artifacts.",
  "Record release-authority attestations for every required authority domain.",
  "Record recipient segment controls and access-window metadata without recipient identifiers.",
  "Reconcile external access logs using metadata counts and anomaly state only.",
  "Refresh the Buyer Pilot Room and export the packet only after the protected chain shows retained packet/audit evidence.",
  "Keep external sharing blocked unless qualified humans explicitly approve the full chain in external systems of record."
];

const workarounds = [
  "If a bearer token is not available in the current Codex session, use the runbook and browser-protected workspace instead of copying tokens into scripts.",
  "If GitHub Actions cannot safely receive a short-lived secret, execute the protected browser workflow and retain only no-secret packet IDs, hashes, timestamps, and audit-event IDs.",
  "If an approval artifact is confidential, store only a metadata reference label, external system label, owner, and validation timestamp in SCRIMED.",
  "If a buyer asks for external sharing before controls are retained, provide a controlled live review of the protected workspace and keep export distribution disabled.",
  "If a public or investor claim depends on legal, privacy, security, clinical, finance, marketing, customer, or release authority, route it through the release-control chain before use."
];

const blockedClaims = [
  "SCRIMED is authorized for live clinical care.",
  "SCRIMED can process production PHI.",
  "SCRIMED is HIPAA certified, SOC certified, FDA cleared, security certified, or regionally approved.",
  "SCRIMED guarantees reimbursement or payer acceptance.",
  "SCRIMED has production connector approval.",
  "SCRIMED can autonomously diagnose, treat, submit payer transactions, or contact patients.",
  "A buyer diligence packet is approved for public distribution.",
  "A metadata reference is equivalent to a signed approval, legal opinion, security report, or customer permission."
];

export function getBuyerReleaseControlRunSummary(): BuyerReleaseControlRunSummary {
  return {
    service: "scrimed-buyer-release-control-runbook",
    route: buyerReleaseControlRunRoute,
    apiRoute: buyerReleaseControlRunApiRoute,
    briefRoute: buyerReleaseControlRunBriefRoute,
    protectedVerifierRoute: buyerReleaseControlRunProtectedVerifierRoute,
    protectedVerifierPacketRoute: buyerReleaseControlRunProtectedVerifierPacketRoute,
    protectedVerifierTimelineRoute: buyerReleaseControlRunProtectedVerifierTimelineRoute,
    operatorRunScript: buyerReleaseControlRunOperatorRunScript,
    operatorRunCommand: buyerReleaseControlRunOperatorRunCommand,
    operatorRunStatus: buyerReleaseControlRunOperatorRunStatus,
    status: buyerReleaseControlRunStatus,
    proofStackStatus: buyerReleaseControlRunProofStackStatus,
    briefProofStackStatus: buyerReleaseControlRunBriefProofStackStatus,
    boundary: buyerReleaseControlRunBoundary,
    executionDecision: "runbook-ready-protected-aal2-required",
    shareDecision: "internal-only-until-release-chain-retained",
    stepCount: steps.length,
    protectedWriteRouteCount: steps.filter((step) => step.protectedRoute.includes("/api/")).length,
    packetRouteCount: steps.filter((step) => step.packetRoute.includes("/packet")).length,
    hardStopCount: steps.reduce((total, step) => total + step.hardStops.length, 0),
    requiredExternalApprovalDomains,
    requiredReviewerRoles,
    requiredReleaseAuthorityDomains,
    steps,
    operatorSequence,
    workarounds,
    blockedClaims,
    nextRecommendedAction:
      "Run the protected buyer-release chain in /pilot-workspace/access#buyer-release-control-verifier with a fresh AAL2 human session, review the release-readiness timeline, retain the audited chain packet, then refresh the Buyer Diligence Export while keeping external distribution disabled until qualified release authority is complete.",
    updated: "2026-06-22"
  };
}

function markdownList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function stepBrief(step: BuyerReleaseControlRunStep) {
  return [
    `## ${step.order}. ${step.label}`,
    `- Step ID: ${step.id}`,
    `- State: ${step.state}`,
    `- Protected route: ${step.protectedRoute}`,
    `- Packet route: ${step.packetRoute}`,
    `- Prerequisite: ${step.prerequisite}`,
    `- Operator action: ${step.operatorAction}`,
    `- Expected audit signal: ${step.expectedAuditSignal}`,
    `- Expected packet type: ${step.expectedPacketType}`,
    `- Boundary: ${step.boundary}`,
    "",
    "Safe payload template:",
    "```json",
    JSON.stringify(step.safePayloadTemplate, null, 2),
    "```",
    "",
    "Hard stops:",
    markdownList(step.hardStops),
    ""
  ];
}

export function buildBuyerReleaseControlRunBrief() {
  const summary = getBuyerReleaseControlRunSummary();

  return [
    "# SCRIMED Buyer Release Control Runbook",
    "",
    `Status: ${summary.status}`,
    `Execution decision: ${summary.executionDecision}`,
    `Share decision: ${summary.shareDecision}`,
    `Protected verifier route: ${summary.protectedVerifierRoute}`,
    `Protected verifier packet route: ${summary.protectedVerifierPacketRoute}`,
    `Protected verifier timeline route: ${summary.protectedVerifierTimelineRoute}`,
    `Operator run script: ${summary.operatorRunScript}`,
    `Operator run command: ${summary.operatorRunCommand}`,
    `Operator run status: ${summary.operatorRunStatus}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This runbook is not release approval. It is a no-secret operator sequence for a future protected AAL2 run.",
    "",
    "## Required Approval Domains",
    markdownList(summary.requiredExternalApprovalDomains),
    "",
    "## Required Reviewer Roles",
    markdownList(summary.requiredReviewerRoles),
    "",
    "## Required Release Authority Domains",
    markdownList(summary.requiredReleaseAuthorityDomains),
    "",
    "## Operator Sequence",
    ...summary.operatorSequence.map((step, index) => `${index + 1}. ${step}`),
    "",
    ...summary.steps.flatMap(stepBrief),
    "## Workarounds",
    markdownList(summary.workarounds),
    "",
    "## Blocked Claims",
    markdownList(summary.blockedClaims),
    "",
    "## Next Recommended Action",
    summary.nextRecommendedAction
  ].join("\n");
}
