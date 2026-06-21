import type { PilotWorkspaceRecord } from "./protectedPilotWorkspace";
import {
  protectedClinicalAuthorityEvidenceRoomBoundary,
  protectedClinicalAuthorityEvidenceRoomClinicalAuthority,
  protectedClinicalAuthorityEvidenceRoomDataBoundary,
  protectedClinicalAuthorityEvidenceRoomLegalAuthority,
  protectedClinicalAuthorityEvidenceRoomPhiAuthority,
  protectedClinicalAuthorityEvidenceRoomProductionAuthority,
  protectedClinicalAuthorityEvidenceRoomRegulatoryAuthority,
  protectedClinicalAuthorityEvidenceRoomReimbursementAuthority,
  protectedClinicalAuthorityEvidenceRoomSecurityCertification,
  type ProtectedClinicalAuthorityEvidenceRoom,
  type ProtectedClinicalAuthorityEvidenceRoomDomain,
  type ProtectedClinicalAuthorityEvidenceRoomEvidenceReference
} from "./protectedClinicalAuthorityEvidenceRoom";

export const protectedClinicalAuthorityOwnerMatrixStatus =
  "aal2-clinical-authority-owner-matrix-no-phi";
export const protectedClinicalAuthorityOwnerMatrixPacketStatus =
  "aal2-audited-clinical-authority-owner-matrix-packet-no-phi";
export const protectedClinicalAuthorityOwnerMatrixAuthority =
  "customer-specific-authority-owner-mapping-not-approval";
export const protectedClinicalAuthorityOwnerMatrixBoundary =
  "Protected Clinical Authority Owner Matrix v1 maps every live-care, PHI, legal, regional, reimbursement, security, connector, and production hard gate to required customer, SCRIMED, and qualified external approver roles. It stores no PHI, patient identifiers, payer member data, credentials, contracts, signatures, legal opinions, security reports, reimbursement determinations, regional approvals, clinical validation artifacts, certification evidence, or production authorizations. Owner labels are metadata-only and do not create approval, authority, or go-live permission.";

export type ProtectedClinicalAuthorityOwnerSide =
  | "customer"
  | "scrimed"
  | "qualified-external";

export type ProtectedClinicalAuthorityOwnerAssignmentStatus =
  | "metadata-owner-assigned"
  | "customer-specific-owner-required"
  | "external-signoff-required"
  | "stale-owner-revalidation-required"
  | "owner-required";

export type ProtectedClinicalAuthorityOwnerAssignment = {
  id: string;
  authorityKey: ProtectedClinicalAuthorityEvidenceRoomDomain["authorityKey"];
  authorityName: string;
  ownerRole: string;
  ownerLabel: string;
  ownerSide: ProtectedClinicalAuthorityOwnerSide;
  status: ProtectedClinicalAuthorityOwnerAssignmentStatus;
  evidenceRoutes: ProtectedClinicalAuthorityEvidenceRoomEvidenceReference[];
  requiredExternalArtifact: string;
  artifactLocationPolicy: string;
  retainedGate: string;
  safeWorkaround: string;
  escalationTrigger: string;
  latestEvidenceAt: string | null;
  expiresAt: string | null;
  noPhiOnly: true;
  authorityGranted: false;
  nextAction: string;
  boundary: string;
};

export type ProtectedClinicalAuthorityOwnerMatrixDomain = {
  authorityKey: ProtectedClinicalAuthorityEvidenceRoomDomain["authorityKey"];
  name: string;
  ownerAssignmentCount: number;
  customerOwnerCount: number;
  scrimedOwnerCount: number;
  externalOwnerCount: number;
  metadataAssignedCount: number;
  blockedAssignmentCount: number;
  retainedGate: string;
  nextAction: string;
  assignments: ProtectedClinicalAuthorityOwnerAssignment[];
};

export type ProtectedClinicalAuthorityOwnerMatrix = {
  service: "scrimed-protected-clinical-authority-owner-matrix";
  status: typeof protectedClinicalAuthorityOwnerMatrixStatus;
  packetStatus: typeof protectedClinicalAuthorityOwnerMatrixPacketStatus;
  workspaceSlug: string;
  workspaceName: string;
  tenantName: string;
  evidenceRoomStatus: ProtectedClinicalAuthorityEvidenceRoom["status"];
  authorityState: "blocked-before-live-clinical-authority";
  summary: {
    authorityDomainCount: number;
    requiredOwnerAssignmentCount: number;
    customerOwnerCount: number;
    scrimedOwnerCount: number;
    externalOwnerCount: number;
    metadataAssignedCount: number;
    blockedAssignmentCount: number;
    staleOwnerCount: number;
    evidenceRouteCount: number;
    auditEventCount: number;
    latestEvidenceAt: string | null;
  };
  domains: ProtectedClinicalAuthorityOwnerMatrixDomain[];
  assignments: ProtectedClinicalAuthorityOwnerAssignment[];
  retainedBoundaryGates: string[];
  nextActions: string[];
  authorities: {
    ownerMatrixAuthority: typeof protectedClinicalAuthorityOwnerMatrixAuthority;
    clinicalCareAuthority: typeof protectedClinicalAuthorityEvidenceRoomClinicalAuthority;
    phiAuthority: typeof protectedClinicalAuthorityEvidenceRoomPhiAuthority;
    legalAuthority: typeof protectedClinicalAuthorityEvidenceRoomLegalAuthority;
    regulatoryAuthority: typeof protectedClinicalAuthorityEvidenceRoomRegulatoryAuthority;
    reimbursementAuthority: typeof protectedClinicalAuthorityEvidenceRoomReimbursementAuthority;
    securityCertification: typeof protectedClinicalAuthorityEvidenceRoomSecurityCertification;
    productionAuthority: typeof protectedClinicalAuthorityEvidenceRoomProductionAuthority;
    dataBoundary: typeof protectedClinicalAuthorityEvidenceRoomDataBoundary;
  };
  safeWorkarounds: string[];
  boundary: string;
  updated: string;
};

type OwnerProfile = {
  ownerRole: string;
  ownerLabel: string;
  ownerSide: ProtectedClinicalAuthorityOwnerSide;
  requiredExternalArtifact: string;
  artifactLocationPolicy: string;
  escalationTrigger: string;
};

const externalArtifactPolicy =
  "Retain the signed artifact in the buyer-controlled VDR, counsel workspace, GRC system, security portal, payer policy file, regional authority file, or approved external evidence room. SCRIMED stores metadata labels only.";

const ownerProfilesByDomain: Record<
  ProtectedClinicalAuthorityEvidenceRoomDomain["authorityKey"],
  OwnerProfile[]
> = {
  "live-clinical-care-authority": [
    {
      ownerRole: "Licensed clinical governance owner",
      ownerLabel: "Clinical governance approver",
      ownerSide: "customer",
      requiredExternalArtifact: "Signed intended-use and clinical oversight approval",
      artifactLocationPolicy: externalArtifactPolicy,
      escalationTrigger: "Any patient-impacting workflow, clinical recommendation, or clinician-facing go-live claim"
    },
    {
      ownerRole: "SCRIMED clinical safety owner",
      ownerLabel: "SCRIMED clinical safety reviewer",
      ownerSide: "scrimed",
      requiredExternalArtifact: "Internal clinical safety case review record",
      artifactLocationPolicy: externalArtifactPolicy,
      escalationTrigger: "Any move from synthetic evaluation into shadow or prospective pilot mode"
    },
    {
      ownerRole: "Qualified clinical counsel or compliance reviewer",
      ownerLabel: "External clinical authority reviewer",
      ownerSide: "qualified-external",
      requiredExternalArtifact: "Qualified external review of clinical authority and scope",
      artifactLocationPolicy: externalArtifactPolicy,
      escalationTrigger: "Any claim that SCRIMED is authorized for live clinical care"
    }
  ],
  "phi-processing-authority": [
    {
      ownerRole: "Customer privacy officer",
      ownerLabel: "Privacy authority owner",
      ownerSide: "customer",
      requiredExternalArtifact: "Signed privacy review and PHI processing scope",
      artifactLocationPolicy: externalArtifactPolicy,
      escalationTrigger: "Any PHI, ePHI, patient identifier, payer member data, or production record request"
    },
    {
      ownerRole: "Customer security owner",
      ownerLabel: "Security authority owner",
      ownerSide: "customer",
      requiredExternalArtifact: "Approved security architecture and access-control review",
      artifactLocationPolicy: externalArtifactPolicy,
      escalationTrigger: "Any credential, connector, storage, or production environment request"
    },
    {
      ownerRole: "Qualified BAA/DPA reviewer",
      ownerLabel: "External privacy/legal reviewer",
      ownerSide: "qualified-external",
      requiredExternalArtifact: "Executed BAA/DPA or equivalent contractual authority where applicable",
      artifactLocationPolicy: externalArtifactPolicy,
      escalationTrigger: "Any production data-processing or subcontractor dependency"
    }
  ],
  "legal-contracting-approval": [
    {
      ownerRole: "Customer legal owner",
      ownerLabel: "Legal authority owner",
      ownerSide: "customer",
      requiredExternalArtifact: "Signed contract, order form, and permitted-use scope",
      artifactLocationPolicy: externalArtifactPolicy,
      escalationTrigger: "Any customer-specific claim, contractual obligation, or production implementation"
    },
    {
      ownerRole: "SCRIMED legal and executive owner",
      ownerLabel: "SCRIMED release authority owner",
      ownerSide: "scrimed",
      requiredExternalArtifact: "Counsel-reviewed external-use approval",
      artifactLocationPolicy: externalArtifactPolicy,
      escalationTrigger: "Any public release, customer proof, pricing commitment, or external diligence packet"
    },
    {
      ownerRole: "Qualified counsel",
      ownerLabel: "External counsel reviewer",
      ownerSide: "qualified-external",
      requiredExternalArtifact: "Qualified counsel review of use, claims, privacy, and liability boundaries",
      artifactLocationPolicy: externalArtifactPolicy,
      escalationTrigger: "Any ambiguity about authority, liability, or public claims"
    }
  ],
  "regional-regulatory-approval": [
    {
      ownerRole: "Regional compliance owner",
      ownerLabel: "Regional launch authority owner",
      ownerSide: "customer",
      requiredExternalArtifact: "Region-specific regulatory, privacy, and deployment approval",
      artifactLocationPolicy: externalArtifactPolicy,
      escalationTrigger: "Any launch outside the approved country, cloud region, or legal entity scope"
    },
    {
      ownerRole: "SCRIMED global deployment owner",
      ownerLabel: "SCRIMED regional readiness owner",
      ownerSide: "scrimed",
      requiredExternalArtifact: "Region deployment profile and localization review",
      artifactLocationPolicy: externalArtifactPolicy,
      escalationTrigger: "Any claim of regional readiness, public-sector readiness, or sovereign deployment support"
    },
    {
      ownerRole: "Qualified regional counsel",
      ownerLabel: "External regional counsel reviewer",
      ownerSide: "qualified-external",
      requiredExternalArtifact: "Qualified regional counsel approval",
      artifactLocationPolicy: externalArtifactPolicy,
      escalationTrigger: "Any regulated-market deployment, procurement response, or local compliance claim"
    }
  ],
  "reimbursement-policy-approval": [
    {
      ownerRole: "Customer revenue-cycle owner",
      ownerLabel: "RCM and reimbursement owner",
      ownerSide: "customer",
      requiredExternalArtifact: "Customer-approved reimbursement, coding, coverage, and claims-use policy",
      artifactLocationPolicy: externalArtifactPolicy,
      escalationTrigger: "Any reimbursement, coding, claims, payer submission, or revenue-impact promise"
    },
    {
      ownerRole: "SCRIMED finance and claims owner",
      ownerLabel: "SCRIMED finance methodology owner",
      ownerSide: "scrimed",
      requiredExternalArtifact: "Finance-reviewed methodology and external-use approval",
      artifactLocationPolicy: externalArtifactPolicy,
      escalationTrigger: "Any ROI, reimbursement, revenue leakage, or savings claim"
    },
    {
      ownerRole: "Qualified payer policy reviewer",
      ownerLabel: "External payer policy reviewer",
      ownerSide: "qualified-external",
      requiredExternalArtifact: "Payer policy, coding, or reimbursement review",
      artifactLocationPolicy: externalArtifactPolicy,
      escalationTrigger: "Any customer request for reimbursement certainty or payer submission support"
    }
  ],
  "security-certification-procurement": [
    {
      ownerRole: "Customer vendor-risk owner",
      ownerLabel: "Vendor-risk approval owner",
      ownerSide: "customer",
      requiredExternalArtifact: "Approved vendor-risk, procurement, and security questionnaire disposition",
      artifactLocationPolicy: externalArtifactPolicy,
      escalationTrigger: "Any procurement approval, security approval, or compliance certification claim"
    },
    {
      ownerRole: "SCRIMED security owner",
      ownerLabel: "SCRIMED security readiness owner",
      ownerSide: "scrimed",
      requiredExternalArtifact: "Security posture packet, risk register, and remediation plan",
      artifactLocationPolicy: externalArtifactPolicy,
      escalationTrigger: "Any production credential, endpoint, integration, or sensitive artifact request"
    },
    {
      ownerRole: "Qualified security assessor",
      ownerLabel: "External security assessor",
      ownerSide: "qualified-external",
      requiredExternalArtifact: "Independent security assessment, SOC 2 evidence, penetration test, or accepted substitute",
      artifactLocationPolicy: externalArtifactPolicy,
      escalationTrigger: "Any certification, audit, assurance, or procurement approval statement"
    }
  ],
  "production-clinical-authorization": [
    {
      ownerRole: "Customer executive go-live owner",
      ownerLabel: "Executive production authorization owner",
      ownerSide: "customer",
      requiredExternalArtifact: "Explicit customer go-live approval with scope, rollback, monitoring, and support ownership",
      artifactLocationPolicy: externalArtifactPolicy,
      escalationTrigger: "Any production activation, real user enablement, or workflow automation"
    },
    {
      ownerRole: "SCRIMED operations and incident owner",
      ownerLabel: "SCRIMED production readiness owner",
      ownerSide: "scrimed",
      requiredExternalArtifact: "Incident response, rollback, support, monitoring, and release readiness approval",
      artifactLocationPolicy: externalArtifactPolicy,
      escalationTrigger: "Any move from protected pilot into production service operation"
    },
    {
      ownerRole: "Qualified production readiness reviewer",
      ownerLabel: "External production readiness reviewer",
      ownerSide: "qualified-external",
      requiredExternalArtifact: "Qualified production readiness and risk acceptance review",
      artifactLocationPolicy: externalArtifactPolicy,
      escalationTrigger: "Any unresolved clinical, privacy, security, legal, or regional production gate"
    }
  ],
  "certified-health-it-connector-approval": [
    {
      ownerRole: "Customer integration owner",
      ownerLabel: "EHR and interoperability owner",
      ownerSide: "customer",
      requiredExternalArtifact: "Approved connector scope, sandbox-to-production path, credential handling, and trading-partner acceptance",
      artifactLocationPolicy: externalArtifactPolicy,
      escalationTrigger: "Any EHR, FHIR, HL7, DICOM, claims, device, scheduling, or payer connector request"
    },
    {
      ownerRole: "SCRIMED interoperability owner",
      ownerLabel: "SCRIMED connector governance owner",
      ownerSide: "scrimed",
      requiredExternalArtifact: "Connector contract, conformance evidence, and production-support runbook",
      artifactLocationPolicy: externalArtifactPolicy,
      escalationTrigger: "Any live connector activation or standards-conformance claim"
    },
    {
      ownerRole: "Platform, EHR, or trading-partner reviewer",
      ownerLabel: "External connector authority reviewer",
      ownerSide: "qualified-external",
      requiredExternalArtifact: "Platform, EHR, or trading-partner production acceptance",
      artifactLocationPolicy: externalArtifactPolicy,
      escalationTrigger: "Any certified health IT, marketplace, trading-partner, or production API approval claim"
    }
  ]
};

function assignmentStatusFor(
  domain: ProtectedClinicalAuthorityEvidenceRoomDomain
): ProtectedClinicalAuthorityOwnerAssignmentStatus {
  if (domain.expirationState === "review-expired") {
    return "stale-owner-revalidation-required";
  }

  if (domain.latestEvidenceAt) {
    return "metadata-owner-assigned";
  }

  if (domain.reviewerStatus === "customer-specific-required") {
    return "customer-specific-owner-required";
  }

  if (domain.reviewerStatus === "external-review-required") {
    return "external-signoff-required";
  }

  return "owner-required";
}

function ownerLabelFor(profile: OwnerProfile, room: ProtectedClinicalAuthorityEvidenceRoom) {
  if (profile.ownerSide === "customer") {
    return `${room.tenantName} ${profile.ownerLabel}`;
  }

  return profile.ownerLabel;
}

function nextActionForAssignment(
  assignment: Pick<
    ProtectedClinicalAuthorityOwnerAssignment,
    "ownerSide" | "requiredExternalArtifact" | "status"
  >
) {
  if (assignment.status === "metadata-owner-assigned") {
    return "Confirm the owner label is current, keep signed authority external, and do not unlock production until the qualified approval artifact is verified.";
  }

  if (assignment.status === "stale-owner-revalidation-required") {
    return "Refresh the owner assignment and external evidence before any buyer, production, PHI, connector, or clinical authority claim.";
  }

  if (assignment.ownerSide === "customer") {
    return `Ask the customer to name the accountable owner and retain external proof for: ${assignment.requiredExternalArtifact}.`;
  }

  if (assignment.ownerSide === "scrimed") {
    return `Assign the SCRIMED accountable owner and prepare no-PHI evidence for: ${assignment.requiredExternalArtifact}.`;
  }

  return `Route to a qualified external reviewer and retain external proof for: ${assignment.requiredExternalArtifact}.`;
}

function buildAssignment({
  domain,
  index,
  profile,
  room
}: {
  domain: ProtectedClinicalAuthorityEvidenceRoomDomain;
  index: number;
  profile: OwnerProfile;
  room: ProtectedClinicalAuthorityEvidenceRoom;
}): ProtectedClinicalAuthorityOwnerAssignment {
  const status = assignmentStatusFor(domain);
  const assignment = {
    id: `${domain.authorityKey}-${index + 1}`,
    authorityKey: domain.authorityKey,
    authorityName: domain.name,
    ownerRole: profile.ownerRole,
    ownerLabel: ownerLabelFor(profile, room),
    ownerSide: profile.ownerSide,
    status,
    evidenceRoutes: domain.evidenceReferences,
    requiredExternalArtifact: profile.requiredExternalArtifact,
    artifactLocationPolicy: profile.artifactLocationPolicy,
    retainedGate: domain.retainedGate,
    safeWorkaround: domain.safeWorkaround,
    escalationTrigger: profile.escalationTrigger,
    latestEvidenceAt: domain.latestEvidenceAt,
    expiresAt: domain.expiresAt,
    noPhiOnly: true as const,
    authorityGranted: false as const,
    nextAction: "",
    boundary: `${domain.boundary} ${protectedClinicalAuthorityOwnerMatrixBoundary}`
  };

  return {
    ...assignment,
    nextAction: nextActionForAssignment(assignment)
  };
}

function buildDomainMatrix(
  domain: ProtectedClinicalAuthorityEvidenceRoomDomain,
  room: ProtectedClinicalAuthorityEvidenceRoom
): ProtectedClinicalAuthorityOwnerMatrixDomain {
  const assignments = ownerProfilesByDomain[domain.authorityKey].map((profile, index) =>
    buildAssignment({ domain, index, profile, room })
  );
  const blockedAssignmentCount = assignments.filter(
    (assignment) => assignment.status !== "metadata-owner-assigned"
  ).length;

  return {
    authorityKey: domain.authorityKey,
    name: domain.name,
    ownerAssignmentCount: assignments.length,
    customerOwnerCount: assignments.filter((assignment) => assignment.ownerSide === "customer")
      .length,
    scrimedOwnerCount: assignments.filter((assignment) => assignment.ownerSide === "scrimed")
      .length,
    externalOwnerCount: assignments.filter(
      (assignment) => assignment.ownerSide === "qualified-external"
    ).length,
    metadataAssignedCount: assignments.filter(
      (assignment) => assignment.status === "metadata-owner-assigned"
    ).length,
    blockedAssignmentCount,
    retainedGate: domain.retainedGate,
    nextAction:
      blockedAssignmentCount > 0
        ? "Name customer, SCRIMED, and qualified external owners before production authority can be reviewed."
        : "Keep owner labels current and collect signed external artifacts before any go-live approval.",
    assignments
  };
}

export function deriveProtectedClinicalAuthorityOwnerMatrix({
  room,
  workspace
}: {
  room: ProtectedClinicalAuthorityEvidenceRoom;
  workspace: PilotWorkspaceRecord;
}): ProtectedClinicalAuthorityOwnerMatrix {
  const domains = room.domains.map((domain) => buildDomainMatrix(domain, room));
  const assignments = domains.flatMap((domain) => domain.assignments);
  const retainedBoundaryGates = Array.from(new Set(room.domains.map((domain) => domain.retainedGate)));
  const nextActions = Array.from(
    new Set(assignments.map((assignment) => assignment.nextAction).slice(0, 12))
  );

  return {
    service: "scrimed-protected-clinical-authority-owner-matrix",
    status: protectedClinicalAuthorityOwnerMatrixStatus,
    packetStatus: protectedClinicalAuthorityOwnerMatrixPacketStatus,
    workspaceSlug: workspace.slug,
    workspaceName: workspace.name,
    tenantName: workspace.tenantName,
    evidenceRoomStatus: room.status,
    authorityState: "blocked-before-live-clinical-authority",
    summary: {
      authorityDomainCount: domains.length,
      requiredOwnerAssignmentCount: assignments.length,
      customerOwnerCount: assignments.filter((assignment) => assignment.ownerSide === "customer")
        .length,
      scrimedOwnerCount: assignments.filter((assignment) => assignment.ownerSide === "scrimed")
        .length,
      externalOwnerCount: assignments.filter(
        (assignment) => assignment.ownerSide === "qualified-external"
      ).length,
      metadataAssignedCount: assignments.filter(
        (assignment) => assignment.status === "metadata-owner-assigned"
      ).length,
      blockedAssignmentCount: assignments.filter(
        (assignment) => assignment.status !== "metadata-owner-assigned"
      ).length,
      staleOwnerCount: assignments.filter(
        (assignment) => assignment.status === "stale-owner-revalidation-required"
      ).length,
      evidenceRouteCount: assignments.reduce(
        (total, assignment) => total + assignment.evidenceRoutes.length,
        0
      ),
      auditEventCount: room.summary.auditEventCount,
      latestEvidenceAt: room.summary.latestEvidenceAt
    },
    domains,
    assignments,
    retainedBoundaryGates,
    nextActions,
    authorities: {
      ownerMatrixAuthority: protectedClinicalAuthorityOwnerMatrixAuthority,
      clinicalCareAuthority: protectedClinicalAuthorityEvidenceRoomClinicalAuthority,
      phiAuthority: protectedClinicalAuthorityEvidenceRoomPhiAuthority,
      legalAuthority: protectedClinicalAuthorityEvidenceRoomLegalAuthority,
      regulatoryAuthority: protectedClinicalAuthorityEvidenceRoomRegulatoryAuthority,
      reimbursementAuthority: protectedClinicalAuthorityEvidenceRoomReimbursementAuthority,
      securityCertification: protectedClinicalAuthorityEvidenceRoomSecurityCertification,
      productionAuthority: protectedClinicalAuthorityEvidenceRoomProductionAuthority,
      dataBoundary: protectedClinicalAuthorityEvidenceRoomDataBoundary
    },
    safeWorkarounds: [
      "Use the owner matrix to identify required customer, SCRIMED, and qualified external approvers before scope expansion.",
      "Keep all signatures, contracts, reports, credentials, approvals, PHI, and sensitive evidence in qualified external systems.",
      "Treat metadata owner assignment as routing only. Authority remains blocked until signed external artifacts, customer go-live scope, and governance review are complete.",
      "Escalate rather than infer approval whenever owner identity, authority scope, region, reimbursement path, connector approval, or security evidence is unclear."
    ],
    boundary: `${protectedClinicalAuthorityOwnerMatrixBoundary} ${protectedClinicalAuthorityEvidenceRoomBoundary} ${room.boundary}`,
    updated: room.updated
  };
}

function linesForAssignment(assignment: ProtectedClinicalAuthorityOwnerAssignment) {
  return [
    `#### ${assignment.ownerRole}`,
    `- Owner label: ${assignment.ownerLabel}`,
    `- Owner side: ${assignment.ownerSide}`,
    `- Status: ${assignment.status}`,
    `- Authority granted: ${assignment.authorityGranted}`,
    `- Required external artifact: ${assignment.requiredExternalArtifact}`,
    `- Artifact location policy: ${assignment.artifactLocationPolicy}`,
    `- Latest evidence at: ${assignment.latestEvidenceAt ?? "not recorded"}`,
    `- Expires at: ${assignment.expiresAt ?? "not started"}`,
    `- Escalation trigger: ${assignment.escalationTrigger}`,
    `- Retained gate: ${assignment.retainedGate}`,
    `- Next action: ${assignment.nextAction}`,
    "- Evidence routes:",
    ...assignment.evidenceRoutes.map(
      (route) => `  - ${route.label}: ${route.route} (${route.status}; ${route.sourceType})`
    ),
    `- Boundary: ${assignment.boundary}`
  ];
}

function linesForDomain(domain: ProtectedClinicalAuthorityOwnerMatrixDomain) {
  return [
    `### ${domain.name}`,
    `- Authority key: ${domain.authorityKey}`,
    `- Owner assignments: ${domain.ownerAssignmentCount}`,
    `- Customer owners: ${domain.customerOwnerCount}`,
    `- SCRIMED owners: ${domain.scrimedOwnerCount}`,
    `- Qualified external owners: ${domain.externalOwnerCount}`,
    `- Metadata assigned: ${domain.metadataAssignedCount}`,
    `- Blocked assignments: ${domain.blockedAssignmentCount}`,
    `- Retained gate: ${domain.retainedGate}`,
    `- Next action: ${domain.nextAction}`,
    "",
    ...domain.assignments.flatMap(linesForAssignment)
  ];
}

export function buildProtectedClinicalAuthorityOwnerMatrixPacket({
  actorUserId,
  auditEventId,
  generatedAt,
  matrix,
  workspace
}: {
  actorUserId: string;
  auditEventId: string;
  generatedAt: string;
  matrix: ProtectedClinicalAuthorityOwnerMatrix;
  workspace: PilotWorkspaceRecord;
}) {
  return [
    "# SCRIMED Protected Clinical Authority Owner Matrix Packet",
    "",
    `Generated: ${generatedAt}`,
    `Audit event: ${auditEventId}`,
    `Actor: ${actorUserId}`,
    `Tenant: ${workspace.tenantName}`,
    `Workspace: ${workspace.name} (${workspace.slug})`,
    `Status: ${matrix.status}`,
    `Proof stack: ${matrix.packetStatus}`,
    "",
    "## Boundary",
    matrix.boundary,
    "",
    "## Authorities",
    `Owner matrix authority: ${matrix.authorities.ownerMatrixAuthority}`,
    `Clinical care authority: ${matrix.authorities.clinicalCareAuthority}`,
    `PHI authority: ${matrix.authorities.phiAuthority}`,
    `Legal authority: ${matrix.authorities.legalAuthority}`,
    `Regulatory authority: ${matrix.authorities.regulatoryAuthority}`,
    `Reimbursement authority: ${matrix.authorities.reimbursementAuthority}`,
    `Security certification: ${matrix.authorities.securityCertification}`,
    `Production authority: ${matrix.authorities.productionAuthority}`,
    `Data boundary: ${matrix.authorities.dataBoundary}`,
    "",
    "## Summary",
    `- Authority domains: ${matrix.summary.authorityDomainCount}`,
    `- Required owner assignments: ${matrix.summary.requiredOwnerAssignmentCount}`,
    `- Customer owners: ${matrix.summary.customerOwnerCount}`,
    `- SCRIMED owners: ${matrix.summary.scrimedOwnerCount}`,
    `- Qualified external owners: ${matrix.summary.externalOwnerCount}`,
    `- Metadata assigned: ${matrix.summary.metadataAssignedCount}`,
    `- Blocked assignments: ${matrix.summary.blockedAssignmentCount}`,
    `- Stale owner assignments: ${matrix.summary.staleOwnerCount}`,
    `- Evidence route references: ${matrix.summary.evidenceRouteCount}`,
    `- Relevant audit events: ${matrix.summary.auditEventCount}`,
    `- Latest evidence at: ${matrix.summary.latestEvidenceAt ?? "not recorded"}`,
    "",
    "## Owner Domains",
    ...matrix.domains.flatMap(linesForDomain),
    "",
    "## Retained Boundary Gates",
    ...matrix.retainedBoundaryGates.map((gate) => `- ${gate}`),
    "",
    "## Next Actions",
    ...matrix.nextActions.map((action) => `- ${action}`),
    "",
    "## Safe Workarounds",
    ...matrix.safeWorkarounds.map((workaround) => `- ${workaround}`)
  ].join("\n");
}
