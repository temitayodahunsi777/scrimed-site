import type { PilotWorkspaceRecord } from "./protectedPilotWorkspace";
import {
  protectedClinicalAuthorityEvidenceRoomDataBoundary
} from "./protectedClinicalAuthorityEvidenceRoom";
import {
  protectedClinicalAuthorityOwnerMatrixAuthority,
  protectedClinicalAuthorityOwnerMatrixBoundary,
  protectedClinicalAuthorityOwnerMatrixPacketStatus,
  protectedClinicalAuthorityOwnerMatrixStatus,
  type ProtectedClinicalAuthorityOwnerAssignment,
  type ProtectedClinicalAuthorityOwnerMatrix,
  type ProtectedClinicalAuthorityOwnerMatrixDomain,
  type ProtectedClinicalAuthorityOwnerSide
} from "./protectedClinicalAuthorityOwnerMatrix";

export const protectedClinicalAuthorityArtifactIntakeStatus =
  "aal2-clinical-authority-artifact-intake-checklist-no-phi";
export const protectedClinicalAuthorityArtifactIntakePacketStatus =
  "aal2-audited-clinical-authority-artifact-intake-checklist-packet-no-phi";
export const protectedClinicalAuthorityArtifactIntakeAuthority =
  "external-authority-artifact-intake-routing-not-storage-or-approval";
export const protectedClinicalAuthorityArtifactIntakeBoundary =
  "Protected Clinical Authority Artifact Intake Checklist v1 maps every owner assignment to the required external system of record, qualified reviewer role, validation timestamp, expiration cadence, acceptance criteria, and prohibited content. It stores no PHI, patient identifiers, payer member data, credentials, signed contracts, signatures, legal opinions, security reports, reimbursement determinations, regional approvals, clinical validation artifacts, certification evidence, production approvals, or uploaded evidence files. Checklist completion is preparation only and does not grant clinical, legal, privacy, reimbursement, security, regional, connector, production, or live-care authority.";

export type ProtectedClinicalAuthorityArtifactIntakeStatus =
  | "external-artifact-reference-required"
  | "qualified-reviewer-required"
  | "owner-routing-required"
  | "revalidation-required";

export type ProtectedClinicalAuthorityArtifactIntakeItem = {
  id: string;
  authorityKey: ProtectedClinicalAuthorityOwnerAssignment["authorityKey"];
  authorityName: string;
  ownerAssignmentId: string;
  ownerRole: string;
  ownerLabel: string;
  ownerSide: ProtectedClinicalAuthorityOwnerSide;
  intakeStatus: ProtectedClinicalAuthorityArtifactIntakeStatus;
  artifactCategory: string;
  requiredExternalArtifact: string;
  acceptedExternalSystems: string[];
  systemOfRecordPolicy: string;
  qualifiedReviewer: string;
  expirationCadence: string;
  validationTimestampRequired: true;
  externalReferenceRequired: true;
  requiredMetadataFields: string[];
  prohibitedContent: string[];
  acceptanceCriteria: string[];
  evidenceRoutes: ProtectedClinicalAuthorityOwnerAssignment["evidenceRoutes"];
  latestEvidenceAt: string | null;
  expiresAt: string | null;
  retainedGate: string;
  safeWorkaround: string;
  escalationTrigger: string;
  blockedUntil: string;
  artifactStoredInScrimed: false;
  authorityGranted: false;
  noPhiOnly: true;
  nextAction: string;
  boundary: string;
};

export type ProtectedClinicalAuthorityArtifactIntakeDomain = {
  authorityKey: ProtectedClinicalAuthorityOwnerMatrixDomain["authorityKey"];
  name: string;
  itemCount: number;
  qualifiedReviewerCount: number;
  ownerRoutingRequiredCount: number;
  revalidationRequiredCount: number;
  externalReferenceRequiredCount: number;
  acceptedExternalSystems: string[];
  expirationCadence: string;
  retainedGate: string;
  nextAction: string;
  items: ProtectedClinicalAuthorityArtifactIntakeItem[];
};

export type ProtectedClinicalAuthorityArtifactIntakeChecklist = {
  service: "scrimed-protected-clinical-authority-artifact-intake";
  status: typeof protectedClinicalAuthorityArtifactIntakeStatus;
  packetStatus: typeof protectedClinicalAuthorityArtifactIntakePacketStatus;
  workspaceSlug: string;
  workspaceName: string;
  tenantName: string;
  matrixStatus: ProtectedClinicalAuthorityOwnerMatrix["status"];
  authorityState: "blocked-before-signed-external-authority-artifacts";
  summary: {
    authorityDomainCount: number;
    intakeItemCount: number;
    qualifiedReviewerItemCount: number;
    externalReferenceRequiredCount: number;
    ownerRoutingRequiredCount: number;
    revalidationRequiredCount: number;
    acceptedExternalSystemCount: number;
    noPhiItemCount: number;
    blockedItemCount: number;
    evidenceRouteCount: number;
    auditEventCount: number;
    latestEvidenceAt: string | null;
  };
  domains: ProtectedClinicalAuthorityArtifactIntakeDomain[];
  items: ProtectedClinicalAuthorityArtifactIntakeItem[];
  requiredMetadataFields: string[];
  prohibitedContent: string[];
  acceptedExternalSystems: string[];
  retainedBoundaryGates: string[];
  safeWorkarounds: string[];
  nextActions: string[];
  authorities: {
    artifactIntakeAuthority: typeof protectedClinicalAuthorityArtifactIntakeAuthority;
    ownerMatrixAuthority: typeof protectedClinicalAuthorityOwnerMatrixAuthority;
    ownerMatrixStatus: typeof protectedClinicalAuthorityOwnerMatrixStatus;
    ownerMatrixPacketStatus: typeof protectedClinicalAuthorityOwnerMatrixPacketStatus;
    dataBoundary: typeof protectedClinicalAuthorityEvidenceRoomDataBoundary;
  };
  boundary: string;
  updated: string;
};

type ArtifactProfile = {
  artifactCategory: string;
  acceptedExternalSystems: string[];
  qualifiedReviewer: string;
  expirationCadence: string;
  acceptanceCriteria: string[];
};

const requiredMetadataFields = [
  "artifact title or evidence label",
  "external system of record",
  "qualified reviewer role",
  "validation timestamp",
  "expiration or renewal cadence",
  "approved scope and excluded scope",
  "evidence reference ID",
  "customer authority owner label"
];

const prohibitedContent = [
  "PHI or ePHI",
  "patient identifiers",
  "payer member data",
  "production credentials or secrets",
  "signed contracts or signature images",
  "legal opinions",
  "security reports",
  "reimbursement determinations",
  "regional regulatory approvals",
  "clinical validation artifacts",
  "certification evidence",
  "production authorizations"
];

const commonAcceptanceCriteria = [
  "The artifact remains in an approved external system of record.",
  "The reference includes a validation timestamp and reviewer role.",
  "The scope explicitly matches the requested workflow, region, data boundary, and environment.",
  "The expiration cadence is known before any production, PHI, connector, or live-care path is considered.",
  "SCRIMED records metadata only and does not store the artifact itself."
];

const artifactProfilesByAuthority: Record<
  ProtectedClinicalAuthorityOwnerAssignment["authorityKey"],
  ArtifactProfile
> = {
  "live-clinical-care-authority": {
    artifactCategory: "Clinical authority and intended-use review",
    acceptedExternalSystems: [
      "customer clinical governance workspace",
      "licensed clinical oversight file",
      "qualified external clinical counsel file",
      "buyer-controlled diligence room"
    ],
    qualifiedReviewer: "licensed clinical governance owner or qualified clinical counsel",
    expirationCadence: "before any go-live review and at least every 90 days during clinical pilot planning",
    acceptanceCriteria: [
      ...commonAcceptanceCriteria,
      "The artifact confirms human oversight, intended use, escalation, and no autonomous diagnosis boundary."
    ]
  },
  "phi-processing-authority": {
    artifactCategory: "Privacy, BAA/DPA, and data-processing authority",
    acceptedExternalSystems: [
      "customer privacy office system",
      "legal contract repository",
      "GRC platform",
      "buyer-controlled diligence room"
    ],
    qualifiedReviewer: "customer privacy officer, security owner, and qualified BAA/DPA reviewer",
    expirationCadence: "before PHI processing and whenever data scope, subprocessors, or environment changes",
    acceptanceCriteria: [
      ...commonAcceptanceCriteria,
      "The artifact defines allowed data classes, minimum necessary scope, subcontractor posture, and retention boundary."
    ]
  },
  "legal-contracting-approval": {
    artifactCategory: "Legal, contract, claims, and permitted-use approval",
    acceptedExternalSystems: [
      "customer contract lifecycle system",
      "SCRIMED counsel workspace",
      "qualified counsel matter file",
      "buyer-controlled diligence room"
    ],
    qualifiedReviewer: "customer legal owner, SCRIMED legal owner, and qualified counsel",
    expirationCadence: "before customer-specific commitments and at renewal, amendment, or new use case",
    acceptanceCriteria: [
      ...commonAcceptanceCriteria,
      "The artifact distinguishes sellable pilot claims from legal, clinical, reimbursement, and production authority."
    ]
  },
  "regional-regulatory-approval": {
    artifactCategory: "Regional regulatory, privacy, deployment, and localization review",
    acceptedExternalSystems: [
      "regional compliance file",
      "public-sector procurement file",
      "sovereign deployment review workspace",
      "qualified regional counsel file"
    ],
    qualifiedReviewer: "regional compliance owner and qualified regional counsel",
    expirationCadence: "before each regional launch and whenever country, cloud region, or legal entity changes",
    acceptanceCriteria: [
      ...commonAcceptanceCriteria,
      "The artifact names the approved country, cloud region, legal entity, language, and local authority scope."
    ]
  },
  "reimbursement-policy-approval": {
    artifactCategory: "Reimbursement, coding, payer policy, and ROI claim review",
    acceptedExternalSystems: [
      "customer revenue-cycle policy file",
      "payer policy evidence folder",
      "finance methodology review workspace",
      "qualified payer policy file"
    ],
    qualifiedReviewer: "revenue-cycle owner, finance methodology owner, and qualified payer policy reviewer",
    expirationCadence: "before reimbursement or ROI claims and quarterly while payer or coding policy changes",
    acceptanceCriteria: [
      ...commonAcceptanceCriteria,
      "The artifact separates workflow-intelligence ROI from reimbursement certainty or payer-submission guarantees."
    ]
  },
  "security-certification-procurement": {
    artifactCategory: "Security, procurement, vendor-risk, and assurance review",
    acceptedExternalSystems: [
      "customer vendor-risk platform",
      "security questionnaire portal",
      "SCRIMED security risk register",
      "qualified assessor evidence room"
    ],
    qualifiedReviewer: "customer vendor-risk owner, SCRIMED security owner, and qualified security assessor",
    expirationCadence: "before procurement approval and annually or after a material infrastructure change",
    acceptanceCriteria: [
      ...commonAcceptanceCriteria,
      "The artifact does not imply SOC 2, HIPAA certification, penetration-test approval, or procurement approval unless externally confirmed."
    ]
  },
  "production-clinical-authorization": {
    artifactCategory: "Production go-live, support, rollback, monitoring, and incident readiness",
    acceptedExternalSystems: [
      "customer executive go-live file",
      "production readiness review workspace",
      "incident response approval file",
      "qualified production readiness review file"
    ],
    qualifiedReviewer: "customer executive owner, SCRIMED operations owner, and qualified production readiness reviewer",
    expirationCadence: "before production activation and before each major workflow or risk posture change",
    acceptanceCriteria: [
      ...commonAcceptanceCriteria,
      "The artifact names rollback, monitoring, support, incident response, and customer acceptance ownership."
    ]
  },
  "certified-health-it-connector-approval": {
    artifactCategory: "EHR, FHIR, HL7, DICOM, claims, payer, device, and trading-partner connector approval",
    acceptedExternalSystems: [
      "customer integration governance workspace",
      "EHR or platform marketplace review file",
      "trading-partner acceptance file",
      "SCRIMED interoperability conformance workspace"
    ],
    qualifiedReviewer: "integration owner, SCRIMED interoperability owner, and platform or trading-partner reviewer",
    expirationCadence: "before connector activation and per platform, EHR, or trading-partner renewal",
    acceptanceCriteria: [
      ...commonAcceptanceCriteria,
      "The artifact confirms sandbox-to-production path, credential handling, interface scope, and trading-partner acceptance."
    ]
  }
};

function intakeStatusForAssignment(
  assignment: ProtectedClinicalAuthorityOwnerAssignment
): ProtectedClinicalAuthorityArtifactIntakeStatus {
  if (assignment.status === "stale-owner-revalidation-required") {
    return "revalidation-required";
  }

  if (
    assignment.status === "customer-specific-owner-required" ||
    assignment.status === "owner-required"
  ) {
    return "owner-routing-required";
  }

  if (assignment.ownerSide === "qualified-external") {
    return "qualified-reviewer-required";
  }

  return "external-artifact-reference-required";
}

function nextActionForItem(item: Pick<
  ProtectedClinicalAuthorityArtifactIntakeItem,
  "intakeStatus" | "requiredExternalArtifact" | "qualifiedReviewer" | "expirationCadence"
>) {
  if (item.intakeStatus === "revalidation-required") {
    return `Revalidate the external artifact reference and reviewer before relying on ${item.requiredExternalArtifact}.`;
  }

  if (item.intakeStatus === "owner-routing-required") {
    return `Name the accountable owner, then collect an external reference for ${item.requiredExternalArtifact}.`;
  }

  if (item.intakeStatus === "qualified-reviewer-required") {
    return `Route to ${item.qualifiedReviewer} and record only the external reference after review.`;
  }

  return `Record only the metadata reference, validation timestamp, and expiration cadence: ${item.expirationCadence}.`;
}

function buildItem(
  assignment: ProtectedClinicalAuthorityOwnerAssignment
): ProtectedClinicalAuthorityArtifactIntakeItem {
  const profile = artifactProfilesByAuthority[assignment.authorityKey];
  const intakeStatus = intakeStatusForAssignment(assignment);
  const blockedUntil =
    "A qualified external artifact reference, reviewer role, validation timestamp, expiration cadence, customer scope, and SCRIMED governance review are recorded outside SCRIMED.";
  const item = {
    id: `${assignment.id}-artifact-intake`,
    authorityKey: assignment.authorityKey,
    authorityName: assignment.authorityName,
    ownerAssignmentId: assignment.id,
    ownerRole: assignment.ownerRole,
    ownerLabel: assignment.ownerLabel,
    ownerSide: assignment.ownerSide,
    intakeStatus,
    artifactCategory: profile.artifactCategory,
    requiredExternalArtifact: assignment.requiredExternalArtifact,
    acceptedExternalSystems: profile.acceptedExternalSystems,
    systemOfRecordPolicy: assignment.artifactLocationPolicy,
    qualifiedReviewer: profile.qualifiedReviewer,
    expirationCadence: profile.expirationCadence,
    validationTimestampRequired: true as const,
    externalReferenceRequired: true as const,
    requiredMetadataFields,
    prohibitedContent,
    acceptanceCriteria: profile.acceptanceCriteria,
    evidenceRoutes: assignment.evidenceRoutes,
    latestEvidenceAt: assignment.latestEvidenceAt,
    expiresAt: assignment.expiresAt,
    retainedGate: assignment.retainedGate,
    safeWorkaround: assignment.safeWorkaround,
    escalationTrigger: assignment.escalationTrigger,
    blockedUntil,
    artifactStoredInScrimed: false as const,
    authorityGranted: false as const,
    noPhiOnly: true as const,
    nextAction: "",
    boundary: `${protectedClinicalAuthorityArtifactIntakeBoundary} ${assignment.boundary}`
  };

  return {
    ...item,
    nextAction: nextActionForItem(item)
  };
}

function buildDomainChecklist(
  domain: ProtectedClinicalAuthorityOwnerMatrixDomain
): ProtectedClinicalAuthorityArtifactIntakeDomain {
  const items = domain.assignments.map(buildItem);
  const acceptedExternalSystems = Array.from(
    new Set(items.flatMap((item) => item.acceptedExternalSystems))
  );
  const revalidationRequiredCount = items.filter(
    (item) => item.intakeStatus === "revalidation-required"
  ).length;
  const ownerRoutingRequiredCount = items.filter(
    (item) => item.intakeStatus === "owner-routing-required"
  ).length;

  return {
    authorityKey: domain.authorityKey,
    name: domain.name,
    itemCount: items.length,
    qualifiedReviewerCount: items.filter(
      (item) => item.intakeStatus === "qualified-reviewer-required"
    ).length,
    ownerRoutingRequiredCount,
    revalidationRequiredCount,
    externalReferenceRequiredCount: items.filter(
      (item) => item.intakeStatus === "external-artifact-reference-required"
    ).length,
    acceptedExternalSystems,
    expirationCadence: artifactProfilesByAuthority[domain.authorityKey].expirationCadence,
    retainedGate: domain.retainedGate,
    nextAction:
      revalidationRequiredCount > 0 || ownerRoutingRequiredCount > 0
        ? "Resolve owner routing and revalidation gaps before artifact intake can support any authority review."
        : "Collect external artifact references only; keep signed artifacts outside SCRIMED.",
    items
  };
}

export function deriveProtectedClinicalAuthorityArtifactIntakeChecklist({
  matrix,
  workspace
}: {
  matrix: ProtectedClinicalAuthorityOwnerMatrix;
  workspace: PilotWorkspaceRecord;
}): ProtectedClinicalAuthorityArtifactIntakeChecklist {
  const domains = matrix.domains.map(buildDomainChecklist);
  const items = domains.flatMap((domain) => domain.items);
  const acceptedExternalSystems = Array.from(
    new Set(items.flatMap((item) => item.acceptedExternalSystems))
  );
  const nextActions = Array.from(new Set(items.map((item) => item.nextAction).slice(0, 12)));

  return {
    service: "scrimed-protected-clinical-authority-artifact-intake",
    status: protectedClinicalAuthorityArtifactIntakeStatus,
    packetStatus: protectedClinicalAuthorityArtifactIntakePacketStatus,
    workspaceSlug: workspace.slug,
    workspaceName: workspace.name,
    tenantName: workspace.tenantName,
    matrixStatus: matrix.status,
    authorityState: "blocked-before-signed-external-authority-artifacts",
    summary: {
      authorityDomainCount: domains.length,
      intakeItemCount: items.length,
      qualifiedReviewerItemCount: items.filter(
        (item) => item.intakeStatus === "qualified-reviewer-required"
      ).length,
      externalReferenceRequiredCount: items.filter(
        (item) => item.intakeStatus === "external-artifact-reference-required"
      ).length,
      ownerRoutingRequiredCount: items.filter(
        (item) => item.intakeStatus === "owner-routing-required"
      ).length,
      revalidationRequiredCount: items.filter(
        (item) => item.intakeStatus === "revalidation-required"
      ).length,
      acceptedExternalSystemCount: acceptedExternalSystems.length,
      noPhiItemCount: items.filter((item) => item.noPhiOnly).length,
      blockedItemCount: items.length,
      evidenceRouteCount: items.reduce((total, item) => total + item.evidenceRoutes.length, 0),
      auditEventCount: matrix.summary.auditEventCount,
      latestEvidenceAt: matrix.summary.latestEvidenceAt
    },
    domains,
    items,
    requiredMetadataFields,
    prohibitedContent,
    acceptedExternalSystems,
    retainedBoundaryGates: matrix.retainedBoundaryGates,
    safeWorkarounds: [
      "Collect references to signed artifacts, not artifacts themselves.",
      "Keep PHI, credentials, signatures, contracts, legal opinions, security reports, and production approvals in customer-controlled or qualified external systems.",
      "Use the checklist to prepare buyer diligence and authority review while keeping every clinical, legal, privacy, reimbursement, security, connector, regional, and production gate blocked.",
      "Escalate to qualified reviewers when scope, expiration, data boundary, region, payer policy, connector authority, or clinical use is ambiguous."
    ],
    nextActions,
    authorities: {
      artifactIntakeAuthority: protectedClinicalAuthorityArtifactIntakeAuthority,
      ownerMatrixAuthority: protectedClinicalAuthorityOwnerMatrixAuthority,
      ownerMatrixStatus: protectedClinicalAuthorityOwnerMatrixStatus,
      ownerMatrixPacketStatus: protectedClinicalAuthorityOwnerMatrixPacketStatus,
      dataBoundary: protectedClinicalAuthorityEvidenceRoomDataBoundary
    },
    boundary: `${protectedClinicalAuthorityArtifactIntakeBoundary} ${protectedClinicalAuthorityOwnerMatrixBoundary} ${matrix.boundary}`,
    updated: matrix.updated
  };
}

function linesForItem(item: ProtectedClinicalAuthorityArtifactIntakeItem) {
  return [
    `#### ${item.ownerRole}`,
    `- Owner assignment: ${item.ownerAssignmentId}`,
    `- Owner label: ${item.ownerLabel}`,
    `- Owner side: ${item.ownerSide}`,
    `- Intake status: ${item.intakeStatus}`,
    `- Artifact category: ${item.artifactCategory}`,
    `- Required external artifact: ${item.requiredExternalArtifact}`,
    `- Qualified reviewer: ${item.qualifiedReviewer}`,
    `- Expiration cadence: ${item.expirationCadence}`,
    `- Validation timestamp required: ${item.validationTimestampRequired}`,
    `- External reference required: ${item.externalReferenceRequired}`,
    `- Artifact stored in SCRIMED: ${item.artifactStoredInScrimed}`,
    `- Authority granted: ${item.authorityGranted}`,
    `- Latest evidence at: ${item.latestEvidenceAt ?? "not recorded"}`,
    `- Expires at: ${item.expiresAt ?? "not started"}`,
    `- Blocked until: ${item.blockedUntil}`,
    `- Escalation trigger: ${item.escalationTrigger}`,
    "- Accepted external systems:",
    ...item.acceptedExternalSystems.map((system) => `  - ${system}`),
    "- Required metadata fields:",
    ...item.requiredMetadataFields.map((field) => `  - ${field}`),
    "- Prohibited content:",
    ...item.prohibitedContent.map((field) => `  - ${field}`),
    "- Acceptance criteria:",
    ...item.acceptanceCriteria.map((criterion) => `  - ${criterion}`),
    "- Evidence routes:",
    ...item.evidenceRoutes.map(
      (route) => `  - ${route.label}: ${route.route} (${route.status}; ${route.sourceType})`
    ),
    `- Next action: ${item.nextAction}`,
    `- Boundary: ${item.boundary}`
  ];
}

function linesForDomain(domain: ProtectedClinicalAuthorityArtifactIntakeDomain) {
  return [
    `### ${domain.name}`,
    `- Authority key: ${domain.authorityKey}`,
    `- Intake items: ${domain.itemCount}`,
    `- Qualified reviewer required: ${domain.qualifiedReviewerCount}`,
    `- Owner routing required: ${domain.ownerRoutingRequiredCount}`,
    `- Revalidation required: ${domain.revalidationRequiredCount}`,
    `- External reference required: ${domain.externalReferenceRequiredCount}`,
    `- Expiration cadence: ${domain.expirationCadence}`,
    `- Retained gate: ${domain.retainedGate}`,
    `- Next action: ${domain.nextAction}`,
    "",
    ...domain.items.flatMap(linesForItem)
  ];
}

export function buildProtectedClinicalAuthorityArtifactIntakePacket({
  actorUserId,
  auditEventId,
  checklist,
  generatedAt,
  workspace
}: {
  actorUserId: string;
  auditEventId: string;
  checklist: ProtectedClinicalAuthorityArtifactIntakeChecklist;
  generatedAt: string;
  workspace: PilotWorkspaceRecord;
}) {
  return [
    "# SCRIMED Protected Clinical Authority Artifact Intake Checklist Packet",
    "",
    `Generated: ${generatedAt}`,
    `Audit event: ${auditEventId}`,
    `Actor: ${actorUserId}`,
    `Tenant: ${workspace.tenantName}`,
    `Workspace: ${workspace.name} (${workspace.slug})`,
    `Status: ${checklist.status}`,
    `Proof stack: ${checklist.packetStatus}`,
    "",
    "## Boundary",
    checklist.boundary,
    "",
    "## Authorities",
    `Artifact intake authority: ${checklist.authorities.artifactIntakeAuthority}`,
    `Owner matrix authority: ${checklist.authorities.ownerMatrixAuthority}`,
    `Owner matrix status: ${checklist.authorities.ownerMatrixStatus}`,
    `Owner matrix packet status: ${checklist.authorities.ownerMatrixPacketStatus}`,
    `Data boundary: ${checklist.authorities.dataBoundary}`,
    "",
    "## Summary",
    `- Authority domains: ${checklist.summary.authorityDomainCount}`,
    `- Intake items: ${checklist.summary.intakeItemCount}`,
    `- Qualified reviewer items: ${checklist.summary.qualifiedReviewerItemCount}`,
    `- External references required: ${checklist.summary.externalReferenceRequiredCount}`,
    `- Owner routing required: ${checklist.summary.ownerRoutingRequiredCount}`,
    `- Revalidation required: ${checklist.summary.revalidationRequiredCount}`,
    `- Accepted external systems: ${checklist.summary.acceptedExternalSystemCount}`,
    `- No-PHI items: ${checklist.summary.noPhiItemCount}`,
    `- Blocked items: ${checklist.summary.blockedItemCount}`,
    `- Evidence route references: ${checklist.summary.evidenceRouteCount}`,
    `- Relevant audit events: ${checklist.summary.auditEventCount}`,
    `- Latest evidence at: ${checklist.summary.latestEvidenceAt ?? "not recorded"}`,
    "",
    "## Required Metadata Fields",
    ...checklist.requiredMetadataFields.map((field) => `- ${field}`),
    "",
    "## Prohibited Content",
    ...checklist.prohibitedContent.map((field) => `- ${field}`),
    "",
    "## Accepted External Systems",
    ...checklist.acceptedExternalSystems.map((system) => `- ${system}`),
    "",
    "## Intake Domains",
    ...checklist.domains.flatMap(linesForDomain),
    "",
    "## Retained Boundary Gates",
    ...checklist.retainedBoundaryGates.map((gate) => `- ${gate}`),
    "",
    "## Next Actions",
    ...checklist.nextActions.map((action) => `- ${action}`),
    "",
    "## Safe Workarounds",
    ...checklist.safeWorkarounds.map((workaround) => `- ${workaround}`)
  ].join("\n");
}
