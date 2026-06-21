import {
  clinicalAuthorityBoundary,
  clinicalAuthorityDomains,
  clinicalAuthorityReadinessStatus,
  type ClinicalAuthorityDomain,
  type ClinicalAuthorityDomainKey
} from "./clinicalAuthorityReadiness";
import type { ClinicalActivationApprovalWorkflow } from "./clinicalActivationApprovals";
import type { ClinicalActivationDossier } from "./clinicalActivationDossier";
import type {
  PilotAuditEventRecord,
  PilotWorkspaceRecord
} from "./protectedPilotWorkspace";
import type { ProtectedExternalApprovalEvidenceWorkflow } from "./protectedExternalApprovalEvidence";
import type { ProtectedProviderSecurityReviewWorkflow } from "./protectedProviderSecurityReviews";
import type { ProtectedProcurementEvidenceRegistryWorkflow } from "./protectedProcurementEvidenceRegistry";

export const protectedClinicalAuthorityEvidenceRoomStatus =
  "aal2-clinical-authority-evidence-room-no-phi";
export const protectedClinicalAuthorityEvidenceRoomPacketStatus =
  "aal2-audited-clinical-authority-evidence-room-packet-no-phi";
export const protectedClinicalAuthorityEvidenceRoomAuthority =
  "clinical-authority-evidence-readiness-not-approval";
export const protectedClinicalAuthorityEvidenceRoomDataBoundary =
  "synthetic-and-metadata-only-no-phi";
export const protectedClinicalAuthorityEvidenceRoomClinicalAuthority =
  "not-authorized-live-care";
export const protectedClinicalAuthorityEvidenceRoomPhiAuthority =
  "not-authorized-production-phi";
export const protectedClinicalAuthorityEvidenceRoomLegalAuthority =
  "not-legal-approval";
export const protectedClinicalAuthorityEvidenceRoomRegulatoryAuthority =
  "external-approval-required";
export const protectedClinicalAuthorityEvidenceRoomReimbursementAuthority =
  "no-reimbursement-guarantee";
export const protectedClinicalAuthorityEvidenceRoomSecurityCertification =
  "not-security-certified";
export const protectedClinicalAuthorityEvidenceRoomProductionAuthority =
  "not-production-authorized";
export const protectedClinicalAuthorityEvidenceRoomBoundary =
  "Protected Clinical Authority Evidence Room v1 is an AAL2 protected, tenant-scoped, no-PHI authority control plane that assembles reviewer owners, metadata-only evidence links, retained gates, expiration posture, and audit history for live clinical care, PHI processing, legal approval, regional approval, reimbursement review, security certification, connector acceptance, and production clinical authorization. It does not store PHI, patient identifiers, payer member data, live clinical records, source contracts, signed BAAs/DPAs, legal opinions, security reports, credentials, URLs, tokens, clinical validation artifacts, reimbursement determinations, certifications, regional approvals, production credentials, or live clinical execution authority.";

export type ProtectedClinicalAuthorityEvidenceRoomDomainStatus =
  | "metadata-open"
  | "metadata-recorded-not-approval"
  | "review-ready-not-approval"
  | "blocked-before-authority";

export type ProtectedClinicalAuthorityEvidenceRoomReviewerStatus =
  | "owner-assigned"
  | "metadata-recorded"
  | "external-review-required"
  | "customer-specific-required"
  | "expired-review-required"
  | "not-started";

export type ProtectedClinicalAuthorityEvidenceRoomExpirationState =
  | "not-started"
  | "review-current"
  | "review-expiring"
  | "review-expired";

export type ProtectedClinicalAuthorityEvidenceRoomEvidenceReference = {
  label: string;
  route: string;
  sourceType:
    | "public-readiness"
    | "protected-workspace"
    | "protected-packet"
    | "audit-history"
    | "external-retained-artifact";
  status: "available" | "metadata-recorded" | "not-recorded" | "blocked";
  latestAt: string | null;
  noPhiOnly: true;
  boundary: string;
};

export type ProtectedClinicalAuthorityEvidenceRoomDomain = {
  authorityKey: ClinicalAuthorityDomainKey;
  name: string;
  domainStatus: ProtectedClinicalAuthorityEvidenceRoomDomainStatus;
  reviewerStatus: ProtectedClinicalAuthorityEvidenceRoomReviewerStatus;
  accountableOwners: string[];
  primaryOwner: string;
  latestEvidenceAt: string | null;
  expiresAt: string | null;
  expirationState: ProtectedClinicalAuthorityEvidenceRoomExpirationState;
  evidenceReferences: ProtectedClinicalAuthorityEvidenceRoomEvidenceReference[];
  evidenceReferenceCount: number;
  requiredEvidence: string[];
  retainedGate: string;
  retainedGateState: "retained";
  safeWorkaround: string;
  nextAction: string;
  approvalArtifactsRetainedExternally: true;
  boundary: string;
};

export type ProtectedClinicalAuthorityEvidenceRoomAuditEntry = {
  id: string;
  eventType: string;
  createdAt: string;
  sessionId: string | null;
  actorUserId: string;
  packetType: string | null;
};

export type ProtectedClinicalAuthorityEvidenceRoom = {
  service: "scrimed-protected-clinical-authority-evidence-room";
  status: typeof protectedClinicalAuthorityEvidenceRoomStatus;
  packetStatus: typeof protectedClinicalAuthorityEvidenceRoomPacketStatus;
  workspaceSlug: string;
  workspaceName: string;
  tenantName: string;
  readinessStatus: typeof clinicalAuthorityReadinessStatus;
  authorityState: "blocked-before-live-clinical-authority";
  phiState: "phi-processing-disabled";
  legalState: "legal-approval-required";
  reimbursementState: "no-reimbursement-guarantee";
  securityState: "security-certification-required";
  productionState: "production-clinical-authorization-required";
  summary: {
    domainCount: number;
    metadataRecordedDomainCount: number;
    reviewReadyDomainCount: number;
    blockedBeforeAuthorityCount: number;
    expiredDomainCount: number;
    evidenceReferenceCount: number;
    accountableOwnerCount: number;
    auditEventCount: number;
    latestEvidenceAt: string | null;
    protectedExternalApprovalReferenceCount: number;
    clinicalActivationAttestedDomainCount: number;
    providerSecurityReviewCount: number;
    procurementEvidenceRecordCount: number;
  };
  domains: ProtectedClinicalAuthorityEvidenceRoomDomain[];
  auditHistory: ProtectedClinicalAuthorityEvidenceRoomAuditEntry[];
  sourceSnapshots: {
    clinicalActivationDossierStatus: ClinicalActivationDossier["status"];
    clinicalActivationApprovalStatus: ClinicalActivationApprovalWorkflow["status"] | "unavailable";
    externalApprovalEvidenceState:
      | ProtectedExternalApprovalEvidenceWorkflow["evidenceLinkageState"]
      | "unavailable";
    providerSecurityReviewState:
      | ProtectedProviderSecurityReviewWorkflow["reviewState"]
      | "unavailable";
    procurementEvidenceState:
      | ProtectedProcurementEvidenceRegistryWorkflow["registryState"]
      | "unavailable";
  };
  authorities: {
    evidenceRoomAuthority: typeof protectedClinicalAuthorityEvidenceRoomAuthority;
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
  unavailableSections: string[];
  boundary: string;
  updated: string;
};

type EvidenceContext = {
  approvalWorkflow: ClinicalActivationApprovalWorkflow | null;
  auditEvents: PilotAuditEventRecord[];
  dossier: ClinicalActivationDossier;
  externalWorkflow: ProtectedExternalApprovalEvidenceWorkflow | null;
  procurementWorkflow: ProtectedProcurementEvidenceRegistryWorkflow | null;
  providerSecurityWorkflow: ProtectedProviderSecurityReviewWorkflow | null;
  workspaceSlug: string;
};

const protectedRouteByDomain: Record<
  ClinicalAuthorityDomainKey,
  Array<{ label: string; route: string; sourceType: ProtectedClinicalAuthorityEvidenceRoomEvidenceReference["sourceType"] }>
> = {
  "live-clinical-care-authority": [
    {
      label: "Clinical Activation Approval Workflow",
      route: "/clinical-activation-approvals",
      sourceType: "protected-workspace"
    },
    {
      label: "Clinical Activation Dossier Packet",
      route: "/clinical-activation-dossier/packet",
      sourceType: "protected-packet"
    }
  ],
  "phi-processing-authority": [
    {
      label: "Provider Security Reviews",
      route: "/provider-security-reviews",
      sourceType: "protected-workspace"
    },
    {
      label: "Procurement Evidence Registry",
      route: "/procurement-evidence",
      sourceType: "protected-workspace"
    }
  ],
  "legal-contracting-approval": [
    {
      label: "External Approval Evidence",
      route: "/external-approval-evidence",
      sourceType: "protected-workspace"
    },
    {
      label: "Release Authority Attestations",
      route: "/release-authority-attestations",
      sourceType: "protected-workspace"
    }
  ],
  "regional-regulatory-approval": [
    {
      label: "Global Reach Readiness",
      route: "/global-reach",
      sourceType: "public-readiness"
    },
    {
      label: "Deployment Profiles",
      route: "/deployment-profiles",
      sourceType: "public-readiness"
    }
  ],
  "reimbursement-policy-approval": [
    {
      label: "Finance Methodology Gates",
      route: "/finance-methodology",
      sourceType: "protected-workspace"
    },
    {
      label: "Public Market Readiness",
      route: "/public-market-readiness",
      sourceType: "public-readiness"
    }
  ],
  "security-certification-procurement": [
    {
      label: "Provider Security Reviews",
      route: "/provider-security-reviews",
      sourceType: "protected-workspace"
    },
    {
      label: "Procurement Evidence Registry",
      route: "/procurement-evidence",
      sourceType: "protected-workspace"
    }
  ],
  "production-clinical-authorization": [
    {
      label: "Clinical Activation Approval Workflow",
      route: "/clinical-activation-approvals",
      sourceType: "protected-workspace"
    },
    {
      label: "Command Intelligence Hub",
      route: "/command-intelligence",
      sourceType: "protected-workspace"
    }
  ],
  "certified-health-it-connector-approval": [
    {
      label: "Interoperability Standards",
      route: "/interoperability",
      sourceType: "public-readiness"
    },
    {
      label: "Provider Adapter Readiness",
      route: "/evidence-room-provider-adapters",
      sourceType: "protected-workspace"
    }
  ]
};

function latestTimestamp(values: Array<string | null | undefined>) {
  const latest = values
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value).getTime())
    .filter(Number.isFinite)
    .sort((left, right) => right - left)[0];

  return latest ? new Date(latest).toISOString() : null;
}

function addDays(value: string | null, days: number) {
  if (!value) return null;

  const time = new Date(value).getTime();

  if (!Number.isFinite(time)) return null;

  return new Date(time + days * 24 * 60 * 60 * 1000).toISOString();
}

function expirationStateFor(expiresAt: string | null): ProtectedClinicalAuthorityEvidenceRoomExpirationState {
  if (!expiresAt) return "not-started";

  const now = Date.now();
  const expiration = new Date(expiresAt).getTime();

  if (!Number.isFinite(expiration)) return "not-started";
  if (expiration < now) return "review-expired";
  if (expiration - now <= 14 * 24 * 60 * 60 * 1000) return "review-expiring";

  return "review-current";
}

function packetTypeFromMetadata(metadata: Record<string, unknown>) {
  const packetType = metadata.packetType;

  return typeof packetType === "string" ? packetType : null;
}

function auditHistoryForRoom(events: PilotAuditEventRecord[]) {
  const relevantEventTypes = [
    "clinical-activation-approval-recorded",
    "protected-external-approval-evidence-recorded",
    "protected-provider-security-review-recorded",
    "protected-procurement-evidence-recorded",
    "protected-release-authority-attestation-recorded",
    "enterprise-proof-packet-downloaded"
  ];

  return events
    .filter((event) => {
      const packetType = packetTypeFromMetadata(event.eventMetadata);

      return (
        relevantEventTypes.includes(event.eventType) ||
        packetType === "clinical-authority-evidence-room"
      );
    })
    .slice(0, 12)
    .map((event) => ({
      id: event.id,
      eventType: event.eventType,
      createdAt: event.createdAt,
      sessionId: event.sessionId,
      actorUserId: event.actorUserId,
      packetType: packetTypeFromMetadata(event.eventMetadata)
    }));
}

function approvalDomainLatestAt(
  approvalWorkflow: ClinicalActivationApprovalWorkflow | null,
  domainIds: string[]
) {
  return latestTimestamp(
    approvalWorkflow?.domains
      .filter((domain) => domainIds.includes(domain.domainId))
      .map((domain) => domain.latestApproval?.signedAt ?? null) ?? []
  );
}

function externalDomainLatestAt(
  externalWorkflow: ProtectedExternalApprovalEvidenceWorkflow | null,
  domainIds: string[]
) {
  return latestTimestamp(
    externalWorkflow?.domains
      .filter((domain) => domainIds.includes(domain.id))
      .map((domain) => domain.latestRecord?.recordedAt ?? null) ?? []
  );
}

function latestEvidenceForDomain(domain: ClinicalAuthorityDomain, context: EvidenceContext) {
  if (domain.key === "live-clinical-care-authority") {
    return latestTimestamp([
      approvalDomainLatestAt(context.approvalWorkflow, ["clinical-governance-safety"]),
      context.dossier.updated
    ]);
  }

  if (domain.key === "phi-processing-authority") {
    return latestTimestamp([
      context.providerSecurityWorkflow?.summary.latestReviewAt ?? null,
      context.procurementWorkflow?.summary.latestRegistryAt ?? null
    ]);
  }

  if (domain.key === "legal-contracting-approval") {
    return externalDomainLatestAt(context.externalWorkflow, [
      "counsel-external-use-review",
      "buyer-permission-review"
    ]);
  }

  if (domain.key === "regional-regulatory-approval") {
    return externalDomainLatestAt(context.externalWorkflow, [
      "counsel-external-use-review",
      "privacy-security-review"
    ]);
  }

  if (domain.key === "reimbursement-policy-approval") {
    return externalDomainLatestAt(context.externalWorkflow, ["finance-methodology-policy"]);
  }

  if (domain.key === "security-certification-procurement") {
    return latestTimestamp([
      context.providerSecurityWorkflow?.summary.latestReviewAt ?? null,
      context.procurementWorkflow?.summary.latestRegistryAt ?? null
    ]);
  }

  if (domain.key === "production-clinical-authorization") {
    return approvalDomainLatestAt(context.approvalWorkflow, ["go-live-rollback-operations"]);
  }

  return latestTimestamp([
    context.providerSecurityWorkflow?.summary.latestReviewAt ?? null,
    externalDomainLatestAt(context.externalWorkflow, ["privacy-security-review"])
  ]);
}

function domainReviewerStatus({
  domain,
  expirationState,
  latestEvidenceAt
}: {
  domain: ClinicalAuthorityDomain;
  expirationState: ProtectedClinicalAuthorityEvidenceRoomExpirationState;
  latestEvidenceAt: string | null;
}): ProtectedClinicalAuthorityEvidenceRoomReviewerStatus {
  if (expirationState === "review-expired") return "expired-review-required";
  if (latestEvidenceAt) return "metadata-recorded";
  if (domain.status === "customer-specific-required") return "customer-specific-required";
  if (domain.status === "external-approval-required") return "external-review-required";

  return domain.accountableOwners.length > 0 ? "owner-assigned" : "not-started";
}

function domainStatusFor({
  expirationState,
  latestEvidenceAt,
  reviewerStatus
}: {
  expirationState: ProtectedClinicalAuthorityEvidenceRoomExpirationState;
  latestEvidenceAt: string | null;
  reviewerStatus: ProtectedClinicalAuthorityEvidenceRoomReviewerStatus;
}): ProtectedClinicalAuthorityEvidenceRoomDomainStatus {
  if (expirationState === "review-expired") return "blocked-before-authority";
  if (reviewerStatus === "metadata-recorded" && latestEvidenceAt) return "metadata-recorded-not-approval";
  if (reviewerStatus === "owner-assigned") return "metadata-open";

  return "blocked-before-authority";
}

function evidenceReferencesForDomain(
  domain: ClinicalAuthorityDomain,
  context: EvidenceContext,
  latestEvidenceAt: string | null
): ProtectedClinicalAuthorityEvidenceRoomEvidenceReference[] {
  const protectedRoutes = protectedRouteByDomain[domain.key].map((route) => ({
    ...route,
    route: route.route.startsWith("/")
      ? `/api/pilot-workspaces/${context.workspaceSlug}${route.route}`
      : route.route,
    status: latestEvidenceAt ? "metadata-recorded" as const : "not-recorded" as const,
    latestAt: latestEvidenceAt,
    noPhiOnly: true as const,
    boundary: "Protected route reference only; no source artifact, PHI, credential, signed agreement, or approval is stored in this room."
  }));
  const publicRoutes = domain.proofRoutes.map((route) => ({
    label: route.replace(/^\//, "") || "SCRIMED readiness",
    route,
    sourceType: "public-readiness" as const,
    status: "available" as const,
    latestAt: null,
    noPhiOnly: true as const,
    boundary: "Public readiness route only; not clinical, legal, reimbursement, security, regional, connector, or production approval."
  }));

  return [...protectedRoutes, ...publicRoutes];
}

function nextActionForDomain(domain: ClinicalAuthorityDomain, reviewerStatus: ProtectedClinicalAuthorityEvidenceRoomReviewerStatus) {
  if (reviewerStatus === "metadata-recorded") {
    return "Keep the metadata reference current, then collect signed external or customer-specific authority before any production or live-care action.";
  }

  if (reviewerStatus === "expired-review-required") {
    return "Refresh the external evidence reference and keep the hard gate blocked until the qualified owner revalidates scope.";
  }

  return domain.requiredEvidence[0]
    ? `Assign the accountable owner and collect metadata-only evidence for: ${domain.requiredEvidence[0]}.`
    : "Assign the accountable owner and retain the gate until external approval is complete.";
}

function buildDomains(context: EvidenceContext) {
  return clinicalAuthorityDomains.map((domain) => {
    const latestEvidenceAt = latestEvidenceForDomain(domain, context);
    const expiresAt = addDays(latestEvidenceAt, 90);
    const expirationState = expirationStateFor(expiresAt);
    const reviewerStatus = domainReviewerStatus({ domain, expirationState, latestEvidenceAt });
    const evidenceReferences = evidenceReferencesForDomain(domain, context, latestEvidenceAt);

    return {
      authorityKey: domain.key,
      name: domain.name,
      domainStatus: domainStatusFor({ expirationState, latestEvidenceAt, reviewerStatus }),
      reviewerStatus,
      accountableOwners: domain.accountableOwners,
      primaryOwner: domain.accountableOwners[0] ?? "unassigned",
      latestEvidenceAt,
      expiresAt,
      expirationState,
      evidenceReferences,
      evidenceReferenceCount: evidenceReferences.length,
      requiredEvidence: domain.requiredEvidence,
      retainedGate: domain.retainedGate,
      retainedGateState: "retained" as const,
      safeWorkaround: domain.safeWorkaround,
      nextAction: nextActionForDomain(domain, reviewerStatus),
      approvalArtifactsRetainedExternally: true as const,
      boundary: domain.currentBoundary
    } satisfies ProtectedClinicalAuthorityEvidenceRoomDomain;
  });
}

export function deriveProtectedClinicalAuthorityEvidenceRoom({
  approvalWorkflow,
  auditEvents,
  dossier,
  externalWorkflow,
  procurementWorkflow,
  providerSecurityWorkflow,
  unavailableSections,
  workspace
}: {
  approvalWorkflow: ClinicalActivationApprovalWorkflow | null;
  auditEvents: PilotAuditEventRecord[];
  dossier: ClinicalActivationDossier;
  externalWorkflow: ProtectedExternalApprovalEvidenceWorkflow | null;
  procurementWorkflow: ProtectedProcurementEvidenceRegistryWorkflow | null;
  providerSecurityWorkflow: ProtectedProviderSecurityReviewWorkflow | null;
  unavailableSections: string[];
  workspace: PilotWorkspaceRecord;
}): ProtectedClinicalAuthorityEvidenceRoom {
  const context = {
    approvalWorkflow,
    auditEvents,
    dossier,
    externalWorkflow,
    procurementWorkflow,
    providerSecurityWorkflow,
    workspaceSlug: workspace.slug
  };
  const domains = buildDomains(context);
  const auditHistory = auditHistoryForRoom(auditEvents);
  const latestEvidenceAt = latestTimestamp(domains.map((domain) => domain.latestEvidenceAt));
  const accountableOwners = new Set(domains.flatMap((domain) => domain.accountableOwners));

  return {
    service: "scrimed-protected-clinical-authority-evidence-room",
    status: protectedClinicalAuthorityEvidenceRoomStatus,
    packetStatus: protectedClinicalAuthorityEvidenceRoomPacketStatus,
    workspaceSlug: workspace.slug,
    workspaceName: workspace.name,
    tenantName: workspace.tenantName,
    readinessStatus: clinicalAuthorityReadinessStatus,
    authorityState: "blocked-before-live-clinical-authority",
    phiState: "phi-processing-disabled",
    legalState: "legal-approval-required",
    reimbursementState: "no-reimbursement-guarantee",
    securityState: "security-certification-required",
    productionState: "production-clinical-authorization-required",
    summary: {
      domainCount: domains.length,
      metadataRecordedDomainCount: domains.filter((domain) => domain.latestEvidenceAt).length,
      reviewReadyDomainCount: domains.filter(
        (domain) => domain.domainStatus === "review-ready-not-approval"
      ).length,
      blockedBeforeAuthorityCount: domains.filter(
        (domain) => domain.domainStatus === "blocked-before-authority"
      ).length,
      expiredDomainCount: domains.filter((domain) => domain.expirationState === "review-expired")
        .length,
      evidenceReferenceCount: domains.reduce(
        (total, domain) => total + domain.evidenceReferenceCount,
        0
      ),
      accountableOwnerCount: accountableOwners.size,
      auditEventCount: auditHistory.length,
      latestEvidenceAt,
      protectedExternalApprovalReferenceCount:
        externalWorkflow?.summary.recordedDomainCount ?? 0,
      clinicalActivationAttestedDomainCount:
        approvalWorkflow?.summary.attestedDomainCount ?? 0,
      providerSecurityReviewCount: providerSecurityWorkflow?.summary.reviewCount ?? 0,
      procurementEvidenceRecordCount: procurementWorkflow?.summary.registryCount ?? 0
    },
    domains,
    auditHistory,
    sourceSnapshots: {
      clinicalActivationDossierStatus: dossier.status,
      clinicalActivationApprovalStatus: approvalWorkflow?.status ?? "unavailable",
      externalApprovalEvidenceState: externalWorkflow?.evidenceLinkageState ?? "unavailable",
      providerSecurityReviewState: providerSecurityWorkflow?.reviewState ?? "unavailable",
      procurementEvidenceState: procurementWorkflow?.registryState ?? "unavailable"
    },
    authorities: {
      evidenceRoomAuthority: protectedClinicalAuthorityEvidenceRoomAuthority,
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
      "Use synthetic pilot evaluation, no-PHI clinical activation dossiers, and metadata-only external evidence links until signed authority exists.",
      "Keep actual legal opinions, BAAs, DPAs, security reports, clinical validation artifacts, reimbursement decisions, regional approvals, and production credentials in qualified external systems.",
      "Treat every domain in this room as review readiness, not approval. Escalate to qualified human owners before any patient-impacting, PHI-processing, payer, connector, or production action.",
      "Expire evidence metadata every 90 days unless customer policy requires a shorter review window."
    ],
    unavailableSections,
    boundary: `${protectedClinicalAuthorityEvidenceRoomBoundary} ${clinicalAuthorityBoundary}`,
    updated: latestEvidenceAt ?? dossier.updated
  };
}

function linesForDomain(domain: ProtectedClinicalAuthorityEvidenceRoomDomain) {
  return [
    `### ${domain.name}`,
    `- Authority key: ${domain.authorityKey}`,
    `- Status: ${domain.domainStatus}`,
    `- Reviewer status: ${domain.reviewerStatus}`,
    `- Primary owner: ${domain.primaryOwner}`,
    `- Accountable owners: ${domain.accountableOwners.join(", ")}`,
    `- Latest evidence at: ${domain.latestEvidenceAt ?? "not recorded"}`,
    `- Expires at: ${domain.expiresAt ?? "not started"}`,
    `- Expiration state: ${domain.expirationState}`,
    `- Retained gate: ${domain.retainedGate}`,
    `- Next action: ${domain.nextAction}`,
    "- Evidence references:",
    ...domain.evidenceReferences.map(
      (reference) =>
        `  - ${reference.label}: ${reference.route} (${reference.status}; ${reference.sourceType})`
    ),
    "- Required evidence:",
    ...domain.requiredEvidence.map((evidence) => `  - ${evidence}`),
    `- Safe workaround: ${domain.safeWorkaround}`,
    `- Boundary: ${domain.boundary}`
  ];
}

export function buildProtectedClinicalAuthorityEvidenceRoomPacket({
  actorUserId,
  auditEventId,
  generatedAt,
  room,
  workspace
}: {
  actorUserId: string;
  auditEventId: string;
  generatedAt: string;
  room: ProtectedClinicalAuthorityEvidenceRoom;
  workspace: PilotWorkspaceRecord;
}) {
  return [
    "# SCRIMED Protected Clinical Authority Evidence Room Packet",
    "",
    `Generated: ${generatedAt}`,
    `Audit event: ${auditEventId}`,
    `Actor: ${actorUserId}`,
    `Tenant: ${workspace.tenantName}`,
    `Workspace: ${workspace.name} (${workspace.slug})`,
    `Status: ${room.status}`,
    `Proof stack: ${room.packetStatus}`,
    "",
    "## Boundary",
    room.boundary,
    "",
    "## Authorities",
    `Evidence room authority: ${room.authorities.evidenceRoomAuthority}`,
    `Clinical care authority: ${room.authorities.clinicalCareAuthority}`,
    `PHI authority: ${room.authorities.phiAuthority}`,
    `Legal authority: ${room.authorities.legalAuthority}`,
    `Regulatory authority: ${room.authorities.regulatoryAuthority}`,
    `Reimbursement authority: ${room.authorities.reimbursementAuthority}`,
    `Security certification: ${room.authorities.securityCertification}`,
    `Production authority: ${room.authorities.productionAuthority}`,
    `Data boundary: ${room.authorities.dataBoundary}`,
    "",
    "## Summary",
    `- Domains: ${room.summary.domainCount}`,
    `- Metadata recorded domains: ${room.summary.metadataRecordedDomainCount}`,
    `- Blocked before authority: ${room.summary.blockedBeforeAuthorityCount}`,
    `- Expired domains: ${room.summary.expiredDomainCount}`,
    `- Evidence references: ${room.summary.evidenceReferenceCount}`,
    `- Accountable owner groups: ${room.summary.accountableOwnerCount}`,
    `- Relevant audit events: ${room.summary.auditEventCount}`,
    `- Latest evidence at: ${room.summary.latestEvidenceAt ?? "not recorded"}`,
    "",
    "## Source Snapshots",
    `- Clinical activation dossier: ${room.sourceSnapshots.clinicalActivationDossierStatus}`,
    `- Clinical activation approval workflow: ${room.sourceSnapshots.clinicalActivationApprovalStatus}`,
    `- External approval evidence: ${room.sourceSnapshots.externalApprovalEvidenceState}`,
    `- Provider security review: ${room.sourceSnapshots.providerSecurityReviewState}`,
    `- Procurement evidence: ${room.sourceSnapshots.procurementEvidenceState}`,
    "",
    "## Authority Domains",
    ...room.domains.flatMap(linesForDomain),
    "",
    "## Audit History",
    ...(room.auditHistory.length
      ? room.auditHistory.map(
          (event) =>
            `- ${event.createdAt}: ${event.eventType} (${event.packetType ?? "workspace-event"})`
        )
      : ["- No relevant clinical authority evidence activity recorded yet."]),
    "",
    "## Safe Workarounds",
    ...room.safeWorkarounds.map((workaround) => `- ${workaround}`),
    "",
    "## Unavailable Sections",
    ...(room.unavailableSections.length
      ? room.unavailableSections.map((section) => `- ${section}`)
      : ["- None reported during evidence room generation."])
  ].join("\n");
}
