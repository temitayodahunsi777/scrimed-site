import {
  blockedClinicalCareCapabilities,
  clinicalCareActivationGates,
  clinicalCareActivationPhases,
  getClinicalCareActivationSummary,
  type ClinicalCareActivationGate,
  type ClinicalCareActivationGateCategory,
  type ClinicalCareActivationGateStatus
} from "./clinicalCareActivation";
import type { CommandIntelligenceSnapshotRecord } from "./commandIntelligenceHub";
import type { PilotDemoReadinessSnapshotRecord } from "./pilotDemoReadiness";
import type {
  PilotAuditEventRecord,
  PilotSessionRecord,
  PilotWorkspaceRecord
} from "./protectedPilotWorkspace";
import type { QaManualRunEvidencePacketRecord } from "./qaEvidenceLedger";

export type ClinicalActivationDossierStatus =
  | "dossier-ready-for-review"
  | "clinical-go-live-blocked";

export type ClinicalActivationSignOffStatus =
  | "draft-required"
  | "unsigned-required"
  | "external-review-required"
  | "customer-specific-required";

export type ClinicalActivationDossierGate = ClinicalCareActivationGate & {
  reviewerRole: string;
  reviewerAssignmentStatus: ClinicalActivationSignOffStatus;
  signOffStatus: ClinicalActivationSignOffStatus;
  noPhiEvidenceReferences: string[];
};

export type ClinicalActivationReviewerAssignment = {
  category: ClinicalCareActivationGateCategory;
  reviewerRole: string;
  assignmentStatus: ClinicalActivationSignOffStatus;
  accountableEvidence: string[];
  requiredBefore: string;
};

export type ClinicalActivationSignedApprovalMetadata = {
  domain: string;
  status: ClinicalActivationSignOffStatus;
  requiredSignatures: string[];
  signedBy: null;
  signedAt: null;
  approvedScope: string;
  evidenceReferences: string[];
  noPhiOnly: true;
  blockedUntilSigned: string[];
};

export type ClinicalActivationEvidenceReference = {
  label: string;
  route: string;
  evidenceType: "public-proof" | "protected-workspace" | "audit-derived" | "readiness-brief";
  count?: number;
  noPhiOnly: true;
  boundary: string;
};

export type ClinicalActivationSignOffPacket = {
  name: string;
  status: ClinicalActivationSignOffStatus;
  owner: string;
  includedGateIds: string[];
  requiredEvidence: string[];
  exportReadiness: "draft-export-ready" | "blocked-until-external-review";
};

export type ClinicalActivationDossier = {
  service: "scrimed-clinical-activation-dossier";
  status: ClinicalActivationDossierStatus;
  proofStackStatus: typeof clinicalActivationDossierProofStackStatus;
  workspaceSlug: string;
  workspaceName: string;
  tenantName: string;
  boundary: string;
  clinicalGoLiveAuthority: "not-authorized-live-care";
  readiness: {
    score: number;
    foundationReadyGateCount: number;
    hardGateCount: number;
    blockedGateCount: number;
    unsignedApprovalCount: number;
    protectedEvidenceCount: number;
    unavailableSectionCount: number;
  };
  gateDossier: ClinicalActivationDossierGate[];
  reviewerAssignments: ClinicalActivationReviewerAssignment[];
  signedApprovalMetadata: ClinicalActivationSignedApprovalMetadata[];
  evidenceReferences: ClinicalActivationEvidenceReference[];
  signOffPackets: ClinicalActivationSignOffPacket[];
  goLiveDecision: {
    status: "blocked-before-clinical-authorization";
    allowedNow: string[];
    blockedCapabilities: string[];
    requiredBeforeGoLive: string[];
  };
  rollbackPlan: {
    status: "required-before-go-live";
    requiredControls: string[];
    owner: string;
  };
  activationPhases: typeof clinicalCareActivationPhases;
  unavailableSections: string[];
  updated: string;
};

export const clinicalActivationDossierProofStackStatus =
  "aal2-clinical-activation-dossier-no-phi";

export const clinicalActivationDossierBoundary =
  "Clinical Activation Dossier v1 is a tenant-scoped, AAL2-protected, no-PHI activation evidence packet for regulated clinical deployment planning. It does not authorize live clinical care, PHI processing, diagnosis, treatment, patient outreach, record mutation, payer submission, connector activation, or autonomous execution.";

const reviewerRoleByCategory: Record<ClinicalCareActivationGateCategory, string> = {
  regulatory: "Regulatory counsel",
  "clinical-governance": "Licensed medical director or clinical governance board",
  "privacy-security": "Privacy officer and security officer",
  "identity-access": "Security identity owner",
  interoperability: "Interoperability architect and customer integration owner",
  "safety-monitoring": "Clinical safety and Trust Safety Operations owner",
  "legal-commercial": "Enterprise legal and commercial owner",
  operations: "Go-live operator and customer executive sponsor"
};

function signOffStatusForGate(status: ClinicalCareActivationGateStatus): ClinicalActivationSignOffStatus {
  if (status === "foundation-ready") return "unsigned-required";
  if (status === "customer-specific") return "customer-specific-required";
  if (status === "external-review-required") return "external-review-required";
  return "draft-required";
}

function latestTimestamp(timestamps: Array<string | null | undefined>) {
  const latest = timestamps
    .filter((timestamp): timestamp is string => Boolean(timestamp))
    .map((timestamp) => new Date(timestamp).getTime())
    .filter(Number.isFinite)
    .sort((left, right) => right - left)[0];

  return latest ? new Date(latest).toISOString() : new Date().toISOString();
}

function evidenceRouteList(workspaceSlug: string) {
  return [
    "/clinical-care-activation",
    "/api/clinical-care-activation/brief",
    "/product",
    "/trust-os",
    "/qa-evidence",
    "/pilot-evidence",
    `/api/pilot-workspaces/${workspaceSlug}/buyer-room`,
    `/api/pilot-workspaces/${workspaceSlug}/command-intelligence`
  ];
}

function buildGateDossier(workspaceSlug: string): ClinicalActivationDossierGate[] {
  const references = evidenceRouteList(workspaceSlug);

  return clinicalCareActivationGates.map((gate) => ({
    ...gate,
    reviewerRole: reviewerRoleByCategory[gate.category],
    reviewerAssignmentStatus: signOffStatusForGate(gate.status),
    signOffStatus: signOffStatusForGate(gate.status),
    noPhiEvidenceReferences: references
  }));
}

function buildReviewerAssignments(gates: ClinicalActivationDossierGate[]) {
  const categories = Array.from(new Set(gates.map((gate) => gate.category)));

  return categories.map((category) => {
    const categoryGates = gates.filter((gate) => gate.category === category);

    return {
      category,
      reviewerRole: reviewerRoleByCategory[category],
      assignmentStatus: categoryGates.some((gate) => gate.status === "blocked")
        ? "draft-required"
        : categoryGates.some((gate) => gate.status === "external-review-required")
          ? "external-review-required"
          : categoryGates.some((gate) => gate.status === "customer-specific")
            ? "customer-specific-required"
            : "unsigned-required",
      accountableEvidence: categoryGates.map((gate) => gate.name),
      requiredBefore: categoryGates.map((gate) => gate.requiredBefore).join(" ")
    } satisfies ClinicalActivationReviewerAssignment;
  });
}

function buildSignedApprovalMetadata(gates: ClinicalActivationDossierGate[]) {
  const domains = [
    {
      domain: "Regulatory classification",
      categories: ["regulatory"] as ClinicalCareActivationGateCategory[],
      requiredSignatures: ["Regulatory counsel", "Product owner"]
    },
    {
      domain: "Clinical governance and safety",
      categories: ["clinical-governance", "safety-monitoring"] as ClinicalCareActivationGateCategory[],
      requiredSignatures: ["Licensed medical director", "Clinical safety lead", "Trust Safety Operations owner"]
    },
    {
      domain: "Privacy, security, and PHI readiness",
      categories: ["privacy-security", "identity-access"] as ClinicalCareActivationGateCategory[],
      requiredSignatures: ["Privacy officer", "Security officer", "Customer compliance owner"]
    },
    {
      domain: "Interoperability and connector validation",
      categories: ["interoperability"] as ClinicalCareActivationGateCategory[],
      requiredSignatures: ["Interoperability architect", "Customer integration owner"]
    },
    {
      domain: "Legal, commercial, and reimbursement boundary",
      categories: ["legal-commercial"] as ClinicalCareActivationGateCategory[],
      requiredSignatures: ["Enterprise legal owner", "Commercial owner", "Revenue-cycle reviewer where applicable"]
    },
    {
      domain: "Go-live, rollback, and operations",
      categories: ["operations"] as ClinicalCareActivationGateCategory[],
      requiredSignatures: ["SCRIMED go-live operator", "Customer executive sponsor", "Support owner"]
    }
  ];

  return domains.map((domain) => {
    const domainGates = gates.filter((gate) => domain.categories.includes(gate.category));
    const statuses = new Set(domainGates.map((gate) => gate.signOffStatus));
    const status: ClinicalActivationSignOffStatus = statuses.has("draft-required")
      ? "draft-required"
      : statuses.has("external-review-required")
        ? "external-review-required"
        : statuses.has("customer-specific-required")
          ? "customer-specific-required"
          : "unsigned-required";

    return {
      domain: domain.domain,
      status,
      requiredSignatures: domain.requiredSignatures,
      signedBy: null,
      signedAt: null,
      approvedScope:
        "No live clinical care approved. Approval metadata records required signers and evidence only.",
      evidenceReferences: domainGates.flatMap((gate) => gate.noPhiEvidenceReferences),
      noPhiOnly: true,
      blockedUntilSigned: domainGates.flatMap((gate) => gate.blockedCapabilities)
    } satisfies ClinicalActivationSignedApprovalMetadata;
  });
}

function buildEvidenceReferences({
  auditEvents,
  commandSnapshots,
  demoSnapshots,
  manualQaEvidencePackets,
  sessions,
  workspaceSlug
}: {
  auditEvents: PilotAuditEventRecord[];
  commandSnapshots: CommandIntelligenceSnapshotRecord[];
  demoSnapshots: PilotDemoReadinessSnapshotRecord[];
  manualQaEvidencePackets: QaManualRunEvidencePacketRecord[];
  sessions: PilotSessionRecord[];
  workspaceSlug: string;
}): ClinicalActivationEvidenceReference[] {
  return [
    {
      label: "Clinical Care Activation Readiness",
      route: "/clinical-care-activation",
      evidenceType: "public-proof",
      noPhiOnly: true,
      boundary: "Public readiness gate model only; no customer PHI or clinical authorization."
    },
    {
      label: "Clinical Care Activation Readiness Brief",
      route: "/api/clinical-care-activation/brief",
      evidenceType: "readiness-brief",
      noPhiOnly: true,
      boundary: "Downloadable readiness brief for diligence, not clinical approval."
    },
    {
      label: "Protected synthetic sessions",
      route: `/api/pilot-workspaces/${workspaceSlug}/sessions`,
      evidenceType: "protected-workspace",
      count: sessions.length,
      noPhiOnly: true,
      boundary: "Tenant-scoped synthetic evaluation records only."
    },
    {
      label: "Append-only audit events",
      route: `/api/pilot-workspaces/${workspaceSlug}/audit`,
      evidenceType: "audit-derived",
      count: auditEvents.length,
      noPhiOnly: true,
      boundary: "Audit metadata for protected pilot activity."
    },
    {
      label: "Demo readiness snapshots",
      route: `/api/pilot-workspaces/${workspaceSlug}/demo-readiness`,
      evidenceType: "protected-workspace",
      count: demoSnapshots.length,
      noPhiOnly: true,
      boundary: "AAL2-reviewed buyer-demo readiness snapshots."
    },
    {
      label: "Command Intelligence snapshots",
      route: `/api/pilot-workspaces/${workspaceSlug}/command-intelligence`,
      evidenceType: "protected-workspace",
      count: commandSnapshots.length,
      noPhiOnly: true,
      boundary: "AAL2-reviewed command posture snapshots."
    },
    {
      label: "Manual QA evidence packets",
      route: `/api/pilot-workspaces/${workspaceSlug}/qa-evidence/manual-run-packets`,
      evidenceType: "protected-workspace",
      count: manualQaEvidencePackets.length,
      noPhiOnly: true,
      boundary: "No-secret, no-PHI QA evidence retained by tenant."
    }
  ];
}

function buildSignOffPackets(gates: ClinicalActivationDossierGate[]) {
  const packetDefinitions = [
    {
      name: "Regulatory Classification Packet",
      owner: "Regulatory counsel",
      categories: ["regulatory"] as ClinicalCareActivationGateCategory[]
    },
    {
      name: "Clinical Governance And Safety Packet",
      owner: "Licensed clinical governance",
      categories: ["clinical-governance", "safety-monitoring"] as ClinicalCareActivationGateCategory[]
    },
    {
      name: "Privacy, Security, And PHI Readiness Packet",
      owner: "Privacy and security officers",
      categories: ["privacy-security", "identity-access"] as ClinicalCareActivationGateCategory[]
    },
    {
      name: "Interoperability Connector Validation Packet",
      owner: "Interoperability architect",
      categories: ["interoperability"] as ClinicalCareActivationGateCategory[]
    },
    {
      name: "Legal, Commercial, And Reimbursement Boundary Packet",
      owner: "Legal and commercial owners",
      categories: ["legal-commercial"] as ClinicalCareActivationGateCategory[]
    },
    {
      name: "Go-Live, Rollback, And Operations Packet",
      owner: "SCRIMED operator and customer sponsor",
      categories: ["operations"] as ClinicalCareActivationGateCategory[]
    }
  ];

  return packetDefinitions.map((packet) => {
    const includedGates = gates.filter((gate) => packet.categories.includes(gate.category));
    const needsExternalReview = includedGates.some(
      (gate) => gate.status === "external-review-required" || gate.status === "blocked"
    );

    return {
      name: packet.name,
      status: needsExternalReview ? "external-review-required" : "unsigned-required",
      owner: packet.owner,
      includedGateIds: includedGates.map((gate) => gate.id),
      requiredEvidence: includedGates.map((gate) => gate.evidence),
      exportReadiness: needsExternalReview ? "blocked-until-external-review" : "draft-export-ready"
    } satisfies ClinicalActivationSignOffPacket;
  });
}

export function deriveClinicalActivationDossier({
  auditEvents,
  commandSnapshots,
  demoSnapshots,
  manualQaEvidencePackets,
  sessions,
  unavailableSections,
  workspace
}: {
  auditEvents: PilotAuditEventRecord[];
  commandSnapshots: CommandIntelligenceSnapshotRecord[];
  demoSnapshots: PilotDemoReadinessSnapshotRecord[];
  manualQaEvidencePackets: QaManualRunEvidencePacketRecord[];
  sessions: PilotSessionRecord[];
  unavailableSections: string[];
  workspace: PilotWorkspaceRecord;
}): ClinicalActivationDossier {
  const activationSummary = getClinicalCareActivationSummary();
  const gateDossier = buildGateDossier(workspace.slug);
  const signedApprovalMetadata = buildSignedApprovalMetadata(gateDossier);
  const protectedEvidenceCount =
    sessions.length +
    auditEvents.length +
    demoSnapshots.length +
    commandSnapshots.length +
    manualQaEvidencePackets.length;
  const unsignedApprovalCount = signedApprovalMetadata.filter(
    (approval) => approval.signedBy === null
  ).length;
  const blockedGateCount = gateDossier.filter((gate) => gate.status === "blocked").length;

  return {
    service: "scrimed-clinical-activation-dossier",
    status: "clinical-go-live-blocked",
    proofStackStatus: clinicalActivationDossierProofStackStatus,
    workspaceSlug: workspace.slug,
    workspaceName: workspace.name,
    tenantName: workspace.tenantName,
    boundary: clinicalActivationDossierBoundary,
    clinicalGoLiveAuthority: "not-authorized-live-care",
    readiness: {
      score: activationSummary.readinessScore,
      foundationReadyGateCount: activationSummary.foundationReadyGateCount,
      hardGateCount: gateDossier.length,
      blockedGateCount,
      unsignedApprovalCount,
      protectedEvidenceCount,
      unavailableSectionCount: unavailableSections.length
    },
    gateDossier,
    reviewerAssignments: buildReviewerAssignments(gateDossier),
    signedApprovalMetadata,
    evidenceReferences: buildEvidenceReferences({
      auditEvents,
      commandSnapshots,
      demoSnapshots,
      manualQaEvidencePackets,
      sessions,
      workspaceSlug: workspace.slug
    }),
    signOffPackets: buildSignOffPackets(gateDossier),
    goLiveDecision: {
      status: "blocked-before-clinical-authorization",
      allowedNow: [
        "governed synthetic pilot evaluation",
        "clinical-care activation planning",
        "buyer diligence export",
        "no-PHI readiness packet review"
      ],
      blockedCapabilities: blockedClinicalCareCapabilities,
      requiredBeforeGoLive: activationSummary.nextOperatorActions
    },
    rollbackPlan: {
      status: "required-before-go-live",
      owner: "SCRIMED operator, customer executive sponsor, clinical governance, privacy, security, and legal",
      requiredControls: [
        "named go-live owner and rollback owner",
        "approved connector disablement procedure",
        "human fallback workflow",
        "incident escalation and notification matrix",
        "post-launch monitoring dashboard",
        "customer-approved downtime and data correction procedure"
      ]
    },
    activationPhases: clinicalCareActivationPhases,
    unavailableSections,
    updated: latestTimestamp([
      ...auditEvents.map((event) => event.createdAt),
      ...sessions.map((session) => session.createdAt),
      ...demoSnapshots.map((snapshot) => snapshot.createdAt),
      ...commandSnapshots.map((snapshot) => snapshot.createdAt),
      ...manualQaEvidencePackets.map((packet) => packet.createdAt)
    ])
  };
}

export function buildClinicalActivationDossierPacket({
  actorUserId,
  auditEventId,
  dossier,
  generatedAt,
  workspace
}: {
  actorUserId: string;
  auditEventId: string;
  dossier: ClinicalActivationDossier;
  generatedAt: string;
  workspace: PilotWorkspaceRecord;
}) {
  return [
    "# SCRIMED Clinical Activation Dossier",
    "",
    `Generated: ${generatedAt}`,
    `Audit event: ${auditEventId}`,
    `Actor: ${actorUserId}`,
    `Tenant: ${workspace.tenantName}`,
    `Workspace: ${workspace.name} (${workspace.slug})`,
    `Status: ${dossier.status}`,
    `Clinical go-live authority: ${dossier.clinicalGoLiveAuthority}`,
    `Proof stack: ${dossier.proofStackStatus}`,
    "",
    "## Boundary",
    dossier.boundary,
    "",
    "## Readiness",
    `- Score: ${dossier.readiness.score}%`,
    `- Hard gates: ${dossier.readiness.hardGateCount}`,
    `- Foundation-ready gates: ${dossier.readiness.foundationReadyGateCount}`,
    `- Blocked gates: ${dossier.readiness.blockedGateCount}`,
    `- Unsigned approvals: ${dossier.readiness.unsignedApprovalCount}`,
    `- Protected no-PHI evidence records: ${dossier.readiness.protectedEvidenceCount}`,
    "",
    "## Reviewer Assignments",
    ...dossier.reviewerAssignments.map(
      (assignment) =>
        `- ${assignment.category}: ${assignment.reviewerRole} (${assignment.assignmentStatus}) before ${assignment.requiredBefore}`
    ),
    "",
    "## Signed Approval Metadata",
    ...dossier.signedApprovalMetadata.map(
      (approval) =>
        `- ${approval.domain}: ${approval.status}; signatures required: ${approval.requiredSignatures.join(", ")}; signedBy: ${approval.signedBy ?? "not signed"}; signedAt: ${approval.signedAt ?? "not signed"}`
    ),
    "",
    "## Sign-Off Packets",
    ...dossier.signOffPackets.map(
      (packet) =>
        `- ${packet.name}: ${packet.status}; owner: ${packet.owner}; export readiness: ${packet.exportReadiness}`
    ),
    "",
    "## Hard Gates",
    ...dossier.gateDossier.map(
      (gate) =>
        `- ${gate.name} (${gate.status}): reviewer ${gate.reviewerRole}; required before ${gate.requiredBefore}; safe workaround: ${gate.safeWorkaround}`
    ),
    "",
    "## Evidence References",
    ...dossier.evidenceReferences.map((reference) =>
      typeof reference.count === "number"
        ? `- ${reference.label}: ${reference.route}; count ${reference.count}; ${reference.boundary}`
        : `- ${reference.label}: ${reference.route}; ${reference.boundary}`
    ),
    "",
    "## Go-Live Decision",
    `Status: ${dossier.goLiveDecision.status}`,
    "Allowed now:",
    ...dossier.goLiveDecision.allowedNow.map((item) => `- ${item}`),
    "Blocked capabilities:",
    ...dossier.goLiveDecision.blockedCapabilities.map((item) => `- ${item}`),
    "",
    "## Rollback Plan",
    `Status: ${dossier.rollbackPlan.status}`,
    `Owner: ${dossier.rollbackPlan.owner}`,
    ...dossier.rollbackPlan.requiredControls.map((control) => `- ${control}`),
    "",
    "## Unavailable Sections",
    ...(dossier.unavailableSections.length
      ? dossier.unavailableSections.map((section) => `- ${section}`)
      : ["- None reported during dossier generation."])
  ].join("\n");
}
