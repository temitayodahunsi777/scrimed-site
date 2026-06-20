import type { AgentEvaluationRecord } from "./agentEvaluationWorkspace";
import { deploymentMetricLines, getDeploymentProfileSummary } from "./deploymentProfiles";
import type {
  AgentWorkspaceGovernanceLedgerRecord,
  AgentWorkspaceWorkOrderRecord
} from "./persistentAgentWorkspace";
import type {
  DurableTrustSafetyIncidentEventRecord,
  DurableTrustSafetyIncidentRecord
} from "./trustSafetyOperations";
import type { TrustOSDecisionLedgerRecord } from "./trustOSDecisionLedger";
import { isUpstashRedisConfigured } from "./upstashRuntime";

export type PilotWorkspaceRole = "tenant-admin" | "pilot-lead" | "reviewer" | "observer";

export type PilotWorkspaceRecord = {
  id: string;
  tenantId: string;
  tenantName: string;
  slug: string;
  name: string;
  status: "synthetic-pilot" | "assessment" | "archived";
  boundary: string;
  createdAt: string;
};

export type PilotSessionRecord = {
  id: string;
  workspaceId: string;
  scenarioSlug: string;
  status: string;
  boundary: string;
  evaluation: AgentEvaluationRecord;
  createdAt: string;
  createdBy: string;
};

export type PilotAuditEventRecord = {
  id: string;
  workspaceId: string;
  sessionId: string | null;
  actorUserId: string;
  eventType: string;
  eventMetadata: Record<string, unknown>;
  createdAt: string;
};

export type TenantAccessMembershipStatus = "active" | "inactive";

export type TenantAccessMembership = {
  userId: string;
  email: string;
  role: PilotWorkspaceRole;
  status: TenantAccessMembershipStatus;
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
  deactivatedAt: string | null;
  deactivatedBy: string | null;
  deactivationReason: string;
  lastAccessReviewedAt: string | null;
  lastAccessReviewedBy: string | null;
  accessReviewDueAt: string;
};

export type TenantAccessInvitationStatus = "pending" | "cancelled" | "activated" | "expired";
export type TenantInvitationDeliveryStatus =
  | "record-only"
  | "packet-generated"
  | "external-delivery-prepared"
  | "smtp-ready-blocked";
export type TenantInvitationDeliveryReadinessStatus =
  | "manual-packet-only"
  | "smtp-readiness-review"
  | "smtp-approved-send-gated";

export type TenantAccessInvitation = {
  id: string;
  email: string;
  proposedRole: PilotWorkspaceRole;
  status: TenantAccessInvitationStatus;
  invitationNote: string;
  invitedBy: string;
  activatedBy: string | null;
  activatedUserId: string | null;
  activatedAt: string | null;
  cancelledBy: string | null;
  cancelledAt: string | null;
  cancellationReason: string;
  expiresAt: string;
  createdAt: string;
  deliveryStatus: TenantInvitationDeliveryStatus;
  lastPacketGeneratedAt: string | null;
  lastPacketGeneratedBy: string | null;
  lastDeliveryPreparedAt: string | null;
  lastDeliveryPreparedBy: string | null;
  deliveryAttemptCount: number;
  deliveryNote: string;
};

export type TenantAccessAuditEvent = {
  id: string;
  targetUserId: string;
  actorUserId: string;
  eventType: "membership-role-changed";
  priorRole: PilotWorkspaceRole;
  nextRole: PilotWorkspaceRole;
  createdAt: string;
};

export type TenantAccessLifecycleEvent = {
  id: string;
  targetUserId: string | null;
  invitationId: string | null;
  actorUserId: string;
  eventType:
    | "invitation-created"
    | "invitation-cancelled"
    | "invitation-activated"
    | "invitation-packet-generated"
    | "invitation-delivery-prepared"
    | "invitation-delivery-readiness-updated"
    | "activation-proof-packet-downloaded"
    | "membership-deactivated"
    | "membership-reactivated"
    | "access-review-attested"
    | "sso-readiness-updated";
  eventMetadata: Record<string, unknown>;
  createdAt: string;
};

export type TenantIdentityProviderStatus =
  | "passwordless-magic-link"
  | "passkey-or-magic-link"
  | "sso-readiness"
  | "sso-configured";

export type TenantIdentityReadiness = {
  providerStatus: TenantIdentityProviderStatus;
  ssoProvider: string;
  ssoDomain: string;
  notes: string;
  updatedAt: string | null;
  updatedBy: string | null;
};

export type TenantInvitationDeliveryReadiness = {
  status: TenantInvitationDeliveryReadinessStatus;
  smtpProvider: string;
  smtpFromDomain: string;
  notes: string;
  updatedAt: string | null;
  updatedBy: string | null;
};

export type TenantAccessSummary = {
  activeMembers: number;
  inactiveMembers: number;
  pendingInvitations: number;
  accessReviewsDue: number;
  packetGeneratedInvitations: number;
  deliveryPreparedInvitations: number;
};

export type TenantAccessDashboard = {
  tenantId: string;
  tenantName: string;
  workspaceId: string;
  workspaceSlug: string;
  workspaceName: string;
  actorUserId: string;
  memberships: TenantAccessMembership[];
  invitations: TenantAccessInvitation[];
  auditEvents: TenantAccessAuditEvent[];
  lifecycleEvents: TenantAccessLifecycleEvent[];
  identityReadiness: TenantIdentityReadiness;
  deliveryReadiness: TenantInvitationDeliveryReadiness;
  summary: TenantAccessSummary;
  security: {
    assuranceLevel: "aal2";
    finalAdminProtection: true;
    mutationAuthorization: "tenant-admin-plus-server-runtime-token";
    offboardingEnforced: true;
    directInvitationEmail: false;
    deliveryMode: "manual-onboarding-packet-until-approved-smtp-send";
  };
  boundary: string;
};

export type TenantInvitationPacket = {
  tenantId: string;
  tenantName: string;
  workspaceId: string;
  workspaceSlug: string;
  workspaceName: string;
  invitationId: string;
  email: string;
  proposedRole: PilotWorkspaceRole;
  status: TenantAccessInvitationStatus;
  expiresAt: string;
  createdAt: string;
  deliveryStatus: TenantInvitationDeliveryStatus;
  deliveryReadiness: TenantInvitationDeliveryReadinessStatus;
  smtpProvider: string;
  smtpFromDomain: string;
  portalRoute: string;
  boundary: string;
  generatedAt: string;
};

export type TenantActivationProofPacket = {
  generatedAt: string;
  lifecycleEventId: string;
  tenantId: string;
  tenantName: string;
  workspaceId: string;
  workspaceSlug: string;
  workspaceName: string;
  actorUserId: string;
  activationRunbook: Array<{
    step: string;
    evidence: string;
  }>;
  dashboard: TenantAccessDashboard;
  activationGovernanceLedgerRecords?: AgentWorkspaceGovernanceLedgerRecord[];
  boundary: string;
};

export type EnterpriseProofPacketTrustSafetyDashboard = {
  incidents: DurableTrustSafetyIncidentRecord[];
  events: DurableTrustSafetyIncidentEventRecord[];
  security: Record<string, unknown>;
  boundary: string;
} | null;

export type EnterpriseProofPacketInput = {
  generatedAt: string;
  auditEventId: string;
  actorUserId: string;
  appBaseUrl: string;
  workspace: PilotWorkspaceRecord;
  sessions: PilotSessionRecord[];
  auditEvents: PilotAuditEventRecord[];
  trustOSDecisions: TrustOSDecisionLedgerRecord[];
  agentWorkOrders: AgentWorkspaceWorkOrderRecord[];
  governanceLedgerRecords: AgentWorkspaceGovernanceLedgerRecord[];
  trustSafetyDashboard: EnterpriseProofPacketTrustSafetyDashboard;
  tenantAccessDashboard: TenantAccessDashboard | null;
  unavailableSections: string[];
};

export type ProtectedPilotInfrastructure = {
  identity: {
    provider: "Supabase Auth";
    configured: boolean;
    control: string;
  };
  durableStore: {
    provider: "Supabase Postgres";
    configured: boolean;
    control: string;
  };
  tenantIsolation: {
    provider: "Postgres row-level security";
    configured: boolean;
    control: string;
  };
  rateLimit: {
    provider: "Upstash Redis";
    configured: boolean;
    fallback: string;
  };
  protectedMutationsEnabled: boolean;
};

export const protectedPilotBoundary =
  "Protected pilot workspaces retain governed synthetic evaluation evidence only. They do not accept live PHI, execute clinical care, submit payer transactions, contact patients, or authorize autonomous diagnosis or treatment.";

export const protectedPilotNoStoreHeaders = {
  "Cache-Control": "private, no-store",
  Vary: "Authorization",
  "X-SCRIMED-Data-Boundary": "synthetic-only"
} as const;

export const pilotWorkspaceRoles: Array<{
  role: PilotWorkspaceRole;
  permissions: string[];
  restrictions: string[];
}> = [
  {
    role: "tenant-admin",
    permissions: ["Review tenant identity configuration", "View all tenant pilot workspaces", "Create and transition persistent agent work orders", "Record TrustOps incident evidence", "Commit TrustOS decisions", "Record governed reviewer dispositions", "Record no-PHI clinical activation readiness attestations", "Record no-PHI Public Market Readiness operator metrics", "Download proof and governance packets"],
    restrictions: ["Cannot enable live clinical execution", "Cannot alter append-only audit events", "Cannot create legal, breach, or compliance certification determinations"]
  },
  {
    role: "pilot-lead",
    permissions: ["Run synthetic evaluations", "Create and transition persistent agent work orders", "Record TrustOps incident evidence", "Commit TrustOS decisions", "Record governed reviewer dispositions", "Record no-PHI clinical activation readiness attestations", "Record no-PHI Public Market Readiness operator metrics", "View workspace sessions", "Download proof and governance packets"],
    restrictions: ["Cannot manage tenant identity", "Cannot alter append-only audit events", "Cannot create legal, breach, or compliance certification determinations"]
  },
  {
    role: "reviewer",
    permissions: ["View workspace sessions", "Review Trust Cards, work orders, and TrustOps incidents", "Record governed reviewer dispositions and outcome signals", "Record no-PHI clinical activation readiness attestations", "Record no-PHI Public Market Readiness operator metrics", "Download proof and governance packets"],
    restrictions: ["Cannot create sessions or new work orders", "Cannot manage tenant identity", "Cannot mutate TrustOps incident records"]
  },
  {
    role: "observer",
    permissions: ["View approved workspace evidence"],
    restrictions: ["Cannot create sessions", "Cannot download restricted evidence", "Cannot manage identity"]
  }
];

export const protectedPilotApiContracts = [
  {
    method: "GET",
    route: "/api/pilot-workspaces",
    access: "Bearer token + tenant membership",
    purpose: "List only the pilot workspaces visible to the authenticated tenant member."
  },
  {
    method: "GET",
    route: "/api/pilot-workspaces/{workspaceSlug}/sessions",
    access: "Bearer token + workspace membership",
    purpose: "List durable synthetic demo sessions through tenant-isolated row-level security."
  },
  {
    method: "POST",
    route: "/api/pilot-workspaces/{workspaceSlug}/sessions",
    access: "AAL2 bearer token + authorized role + server-held runtime authorization + rate limit",
    purpose: "Run and durably retain a governed synthetic AgentOS evaluation with an append-only audit event."
  },
  {
    method: "GET",
    route: "/api/pilot-workspaces/{workspaceSlug}/audit",
    access: "Bearer token + workspace membership",
    purpose: "Inspect the tenant-isolated append-only audit trail for workspace evidence activity."
  },
  {
    method: "GET / POST",
    route: "/api/pilot-workspaces/{workspaceSlug}/demo-readiness",
    access: "GET: AAL2 bearer token + workspace membership. POST: AAL2 bearer token + tenant-admin or pilot-lead role + server-held runtime authorization + rate limit",
    purpose: "Inspect or persist buyer-demo readiness snapshots from durable synthetic sessions, audit events, proof-packet evidence, and tenant-session verification."
  },
  {
    method: "GET",
    route: "/api/pilot-workspaces/{workspaceSlug}/demo-readiness/{snapshotId}/packet",
    access: "AAL2 bearer token + authorized tenant role + server-held runtime authorization + rate limit + append-only packet-download audit",
    purpose: "Download an audited Markdown Demo Readiness Packet for a retained synthetic buyer-demo readiness snapshot."
  },
  {
    method: "GET",
    route: "/api/pilot-workspaces/{workspaceSlug}/buyer-room",
    access: "AAL2 bearer token + workspace membership",
    purpose:
      "Inspect a tenant-scoped Buyer Pilot Room that bundles synthetic evidence counts, readiness state, competitive edge, premium commercial path, known limitations, and workarounds."
  },
  {
    method: "GET / POST",
    route: "/api/pilot-workspaces/{workspaceSlug}/command-intelligence",
    access: "GET: AAL2 bearer token + workspace membership + rate limit. POST: AAL2 bearer token + tenant-admin or pilot-lead role + fixed human-review attestation + server-held runtime authorization + rate limit",
    purpose:
      "Inspect the protected SCRIMED Command Intelligence Hub or persist an AAL2 human-reviewed command snapshot that unifies Agent Commander posture, buyer-room readiness, Trust Engine outputs, continuous evaluation gates, MCP/tool-access plans, observability, safe-mode boundaries, limitations, and next actions."
  },
  {
    method: "GET",
    route: "/api/pilot-workspaces/{workspaceSlug}/command-intelligence/{snapshotId}/packet",
    access: "AAL2 bearer token + authorized tenant role + server-held runtime authorization + rate limit + append-only packet-download audit",
    purpose:
      "Download an audited Markdown Command Intelligence Packet for a retained synthetic command-posture snapshot."
  },
  {
    method: "GET",
    route: "/api/pilot-workspaces/{workspaceSlug}/buyer-room/packet",
    access: "AAL2 bearer token + authorized tenant role + server-held runtime authorization + rate limit + append-only packet-download audit",
    purpose:
      "Download an audited Markdown Buyer Diligence Export that bundles readiness, QA evidence, pricing posture, competitive edge, legal/privacy/security/safety boundaries, and production hard gates."
  },
  {
    method: "GET / POST",
    route: "/api/pilot-workspaces/{workspaceSlug}/qa-evidence/manual-run-packets",
    access: "GET: AAL2 bearer token + workspace membership. POST: AAL2 bearer token + tenant-admin or pilot-lead role + server-held runtime authorization + rate limit",
    purpose:
      "Inspect or persist no-secret manual Sales Demo Session QA evidence packets so human-run AAL2 proof appears in tenant-scoped Buyer Pilot Room diligence."
  },
  {
    method: "GET / PATCH",
    route: "/api/pilot-workspaces/{workspaceSlug}/tenant-access",
    access: "AAL2 bearer token + tenant-admin role + server-held runtime authorization + rate limit",
    purpose: "Inspect memberships, record governed invitations, activate existing auth users, offboard/reactivate access, attest access reviews, maintain SSO-readiness metadata, and prepare audited manual delivery without email delivery or user creation."
  },
  {
    method: "GET",
    route: "/api/pilot-workspaces/{workspaceSlug}/tenant-access/invitations/{invitationId}/onboarding-packet",
    access: "AAL2 bearer token + tenant-admin role + server-held runtime authorization + rate limit",
    purpose: "Download an audited protected-pilot onboarding packet for manual external delivery while SMTP send remains gated."
  },
  {
    method: "GET",
    route: "/api/pilot-workspaces/{workspaceSlug}/tenant-access/activation-proof-packet",
    access: "AAL2 bearer token + tenant-admin role + server-held runtime authorization + rate limit",
    purpose: "Download an audited activation proof packet summarizing protected-pilot invitations, onboarding packets, delivery readiness, membership state, identity posture, and lifecycle evidence."
  },
  {
    method: "GET / POST",
    route: "/api/pilot-workspaces/{workspaceSlug}/activation-governance",
    access: "GET: bearer token + workspace membership. POST: AAL2 bearer token + authorized tenant role + server-held runtime authorization + rate limit",
    purpose: "Inspect or record the selected governance workflow pack as the first activation ledger seed for retention, legal-review, incident-export, and proof controls."
  },
  {
    method: "GET",
    route: "/api/pilot-workspaces/{workspaceSlug}/sessions/{sessionId}/proof-packet",
    access: "AAL2 bearer token + authorized tenant role + server-held runtime authorization + rate limit",
    purpose: "Download a buyer-ready Markdown proof packet generated from tenant-isolated session evidence."
  },
  {
    method: "GET",
    route: "/api/pilot-workspaces/{workspaceSlug}/enterprise-proof-packet",
    access: "AAL2 bearer token + tenant-admin or pilot-lead role + server-held runtime authorization + rate limit + append-only packet-download audit",
    purpose: "Download an aggregate Markdown enterprise proof packet spanning sessions, audit events, TrustOS decisions, Agent Workspace work orders, TrustOps incidents, tenant access posture, and governance ledger evidence."
  },
  {
    method: "GET / POST",
    route: "/api/pilot-workspaces/{workspaceSlug}/clinical-activation-approvals",
    access: "GET: AAL2 bearer token + workspace membership + rate limit. POST: AAL2 bearer token + tenant-admin, pilot-lead, or reviewer role + fixed no-PHI attestation + server-held runtime authorization + rate limit",
    purpose:
      "Inspect or append no-PHI clinical activation readiness attestations for regulatory, clinical governance, privacy/security, interoperability, legal/commercial, and go-live domains while live care remains blocked."
  },
  {
    method: "GET / POST",
    route: "/api/pilot-workspaces/{workspaceSlug}/operator-metrics",
    access: "GET: AAL2 bearer token + workspace membership + rate limit. POST: AAL2 bearer token + tenant-admin, pilot-lead, or reviewer role + fixed no-PHI finance-readiness attestation + rate limit",
    purpose:
      "Inspect or append tenant-scoped no-PHI Public Market Readiness operator metrics for model cost, review time, delivery hours, proof-packet count, workflow volume, and unit-economics discipline without storing audited financials, securities material, PHI, patient identifiers, payer member data, source contracts, secrets, or clinical validation."
  },
  {
    method: "GET / POST",
    route: "/api/pilot-workspaces/{workspaceSlug}/metric-rollups",
    access: "GET: AAL2 bearer token + workspace membership + rate limit. POST: AAL2 bearer token + tenant-admin, pilot-lead, or reviewer role + fixed finance-reviewed no-PHI rollup attestation + rate limit",
    purpose:
      "Inspect or create protected no-PHI metric rollup snapshots that aggregate operator metrics into internal board operating evidence without becoming audited financial reporting, securities offering material, valuation assurance, clinical validation, reimbursement assurance, or live care authority."
  },
  {
    method: "GET",
    route: "/api/pilot-workspaces/{workspaceSlug}/metric-rollups/{snapshotId}/packet",
    access: "AAL2 bearer token + authorized tenant role + rate limit + append-only packet-download audit",
    purpose:
      "Download an audited internal board metric packet from a persisted no-PHI rollup snapshot after committing the packet release event."
  },
  {
    method: "GET / POST",
    route: "/api/pilot-workspaces/{workspaceSlug}/metric-trends",
    access: "GET: AAL2 bearer token + workspace membership + rate limit. POST: AAL2 bearer token + tenant-admin, pilot-lead, or reviewer role + fixed finance-reviewed no-PHI trend attestation + rate limit",
    purpose:
      "Inspect or create protected no-PHI metric trend reviews that compare rollup snapshots for monthly variance review, reach expansion planning, competitive advantage tracking, and agent improvement loops without becoming audited financial reporting, securities offering material, clinical validation, reimbursement assurance, or live care authority."
  },
  {
    method: "GET",
    route: "/api/pilot-workspaces/{workspaceSlug}/metric-trends/{reviewId}/packet",
    access: "AAL2 bearer token + authorized tenant role + rate limit + append-only packet-download audit",
    purpose:
      "Download an audited internal board trend packet from a persisted no-PHI trend review after committing the packet release event."
  },
  {
    method: "GET / POST",
    route: "/api/pilot-workspaces/{workspaceSlug}/board-scorecards",
    access: "GET: AAL2 bearer token + workspace membership + rate limit. POST: AAL2 bearer token + tenant-admin, pilot-lead, or reviewer role + fixed finance-methodology-pending no-PHI scorecard attestation + rate limit",
    purpose:
      "Inspect or create protected no-PHI rolling-quarter board scorecards that convert trend reviews into finance-allocation readiness, buyer-segment cohort signals, competitive advantage tracking, and agent improvement priorities without becoming audited financial reporting, securities offering material, valuation assurance, clinical validation, reimbursement assurance, or live care authority."
  },
  {
    method: "GET",
    route: "/api/pilot-workspaces/{workspaceSlug}/board-scorecards/{scorecardId}/packet",
    access: "AAL2 bearer token + authorized tenant role + rate limit + append-only packet-download audit",
    purpose:
      "Download an audited internal board scorecard packet from a persisted no-PHI scorecard after committing the packet release event."
  },
  {
    method: "GET / POST",
    route: "/api/pilot-workspaces/{workspaceSlug}/finance-methodology",
    access: "GET: AAL2 bearer token + workspace membership + rate limit. POST: AAL2 bearer token + tenant-admin, pilot-lead, or reviewer role + fixed no-PHI finance external-use attestation + rate limit",
    purpose:
      "Inspect or record protected no-PHI finance methodology and external-use gate attestations for cost allocation, counsel review, executive release, privacy/security, clinical-governance boundary, marketing claims, and buyer permission without becoming audited financial reporting, securities offering material, advertising substantiation, reimbursement assurance, clinical validation, or live care authority."
  },
  {
    method: "GET",
    route: "/api/pilot-workspaces/{workspaceSlug}/finance-methodology/packet",
    access: "AAL2 bearer token + authorized tenant role + rate limit + append-only packet-download audit",
    purpose:
      "Download an audited protected finance methodology gate packet after committing the packet release event while retaining all external-use approval blockers."
  },
  {
    method: "GET / POST",
    route: "/api/pilot-workspaces/{workspaceSlug}/external-approval-evidence",
    access: "GET: AAL2 bearer token + workspace membership + rate limit. POST: AAL2 bearer token + tenant-admin, pilot-lead, or reviewer role + fixed no-PHI external approval evidence metadata attestation + rate limit",
    purpose:
      "Inspect or record bounded no-PHI metadata references to externally retained approval artifacts for finance, counsel, executive, privacy/security, clinical-governance, marketing-claims, and buyer-permission review without storing sensitive documents or creating legal, finance, security, clinical, customer, advertising, reimbursement, compliance, production, or release authority."
  },
  {
    method: "GET",
    route: "/api/pilot-workspaces/{workspaceSlug}/external-approval-evidence/packet",
    access: "AAL2 bearer token + authorized tenant role + rate limit + append-only packet-download audit",
    purpose:
      "Download an audited protected external approval evidence linkage packet after committing the packet release event while retaining no-PHI metadata-only storage and all qualified external release blockers."
  },
  {
    method: "GET / POST",
    route: "/api/pilot-workspaces/{workspaceSlug}/release-decisions",
    access: "GET: AAL2 bearer token + workspace membership + rate limit. POST: AAL2 bearer token + tenant-admin, pilot-lead, or reviewer role + fixed no-PHI claim registry attestation + rate limit",
    purpose:
      "Inspect or record bounded no-PHI versioned claim registry release decisions that require external approval evidence references before a claim can become ready for qualified release review. This does not approve public distribution, legal claims, advertising substantiation, securities claims, customer references, clinical validation, production authorization, or live clinical execution."
  },
  {
    method: "GET",
    route: "/api/pilot-workspaces/{workspaceSlug}/release-decisions/packet",
    access: "AAL2 bearer token + authorized tenant role + rate limit + append-only packet-download audit",
    purpose:
      "Download an audited protected release decision claim registry packet after committing the packet release event while retaining all public-release, legal, finance, advertising, customer, compliance, production, and clinical execution blockers."
  },
  {
    method: "GET / POST",
    route: "/api/pilot-workspaces/{workspaceSlug}/reviewer-signoffs",
    access: "GET: AAL2 bearer token + workspace membership + rate limit. POST: AAL2 bearer token + tenant-admin, pilot-lead, or reviewer role + fixed no-PHI named reviewer sign-off metadata attestation + rate limit",
    purpose:
      "Inspect or record bounded no-PHI metadata references to externally retained named reviewer sign-offs for finance, counsel, executive, privacy/security, clinical-governance, marketing-claims, and buyer-permission roles. This can prepare controlled distribution review, but does not create public-release, legal, finance, advertising, customer, compliance, production, or clinical execution authority."
  },
  {
    method: "GET",
    route: "/api/pilot-workspaces/{workspaceSlug}/reviewer-signoffs/packet",
    access: "AAL2 bearer token + authorized tenant role + rate limit + append-only packet-download audit",
    purpose:
      "Download an audited protected named reviewer sign-off packet after committing the packet release event while retaining metadata-only storage and all public-release, external distribution, legal, finance, customer, compliance, production, and clinical execution blockers."
  },
  {
    method: "GET / POST",
    route: "/api/pilot-workspaces/{workspaceSlug}/distribution-lockbox",
    access: "GET: AAL2 bearer token + workspace membership + rate limit. POST: AAL2 bearer token + tenant-admin, pilot-lead, or reviewer role + fixed no-PHI disabled distribution lockbox attestation + rate limit",
    purpose:
      "Inspect or record bounded no-PHI disabled-by-default distribution lockbox metadata linked to externally retained named reviewer sign-offs, customer permission references, counsel review references, and artifact manifest locators. This does not enable public release, external distribution, legal claims, advertising substantiation, customer proof, compliance certification, production authorization, or clinical execution."
  },
  {
    method: "GET",
    route: "/api/pilot-workspaces/{workspaceSlug}/distribution-lockbox/packet",
    access: "AAL2 bearer token + authorized tenant role + rate limit + append-only packet-download audit",
    purpose:
      "Download an audited protected distribution lockbox packet after committing the packet release event while preserving disabled distribution, metadata-only storage, and all public-release, external distribution, legal, finance, customer, compliance, production, and clinical execution blockers."
  },
  {
    method: "GET / POST",
    route: "/api/pilot-workspaces/{workspaceSlug}/release-authority-attestations",
    access: "GET: AAL2 bearer token + workspace membership + rate limit. POST: AAL2 bearer token + tenant-admin, pilot-lead, or reviewer role + fixed no-PHI release authority metadata attestation + rate limit",
    purpose:
      "Inspect or record bounded no-PHI metadata references to externally retained release authority across counsel, customer permission, executive, privacy/security, finance, clinical governance, and marketing claims owners. This does not enable public release, external distribution, legal approval, finance reporting, customer proof, advertising substantiation, compliance certification, production authorization, or clinical execution."
  },
  {
    method: "GET",
    route: "/api/pilot-workspaces/{workspaceSlug}/release-authority-attestations/packet",
    access: "AAL2 bearer token + authorized tenant role + rate limit + append-only packet-download audit",
    purpose:
      "Download an audited protected release authority attestation packet after committing the packet release event while preserving release-disabled posture, metadata-only storage, and all public-release, external distribution, legal, finance, customer, compliance, production, reimbursement, and clinical execution blockers."
  },
  {
    method: "GET / POST",
    route: "/api/pilot-workspaces/{workspaceSlug}/evidence-room-recipient-attestations",
    access: "GET: AAL2 bearer token + workspace membership + rate limit. POST: AAL2 bearer token + tenant-admin, pilot-lead, or reviewer role + fixed no-PHI recipient attestation metadata + rate limit",
    purpose:
      "Inspect or record bounded no-PHI metadata for intended evidence-room recipient segments, access windows, packet references, and revocation posture linked to completed release authority attestations. This does not store exact recipient lists, emails, access grants, legal approvals, customer permission artifacts, public release approval, external distribution approval, compliance certification, production authorization, or clinical execution authority."
  },
  {
    method: "GET",
    route: "/api/pilot-workspaces/{workspaceSlug}/evidence-room-recipient-attestations/packet",
    access: "AAL2 bearer token + authorized tenant role + rate limit + append-only packet-download audit",
    purpose:
      "Download an audited protected evidence-room recipient attestation packet after committing the packet release event while preserving export-disabled posture, recipient-metadata-only storage, and all public-release, external distribution, legal, finance, customer, compliance, production, reimbursement, and clinical execution blockers."
  },
  {
    method: "GET / POST",
    route: "/api/pilot-workspaces/{workspaceSlug}/evidence-room-access-log-reconciliation",
    access: "GET: AAL2 bearer token + workspace membership + rate limit. POST: AAL2 bearer token + tenant-admin, pilot-lead, or reviewer role + fixed no-PHI access-log reconciliation metadata + rate limit",
    purpose:
      "Inspect or record bounded no-PHI metadata for externally retained evidence-room access-log references, reconciliation windows, event-count summaries, anomaly posture, and revocation review linked to completed recipient attestations. This does not store raw logs, recipient identifiers, IP addresses, device identifiers, access grants, legal approvals, customer permission artifacts, public release approval, external distribution approval, compliance certification, production authorization, or clinical execution authority."
  },
  {
    method: "GET",
    route: "/api/pilot-workspaces/{workspaceSlug}/evidence-room-access-log-reconciliation/packet",
    access: "AAL2 bearer token + authorized tenant role + rate limit + append-only packet-download audit",
    purpose:
      "Download an audited protected evidence-room access-log reconciliation packet after committing the packet release event while preserving export-disabled posture, access-log-metadata-only storage, and all public-release, external distribution, legal, finance, customer, compliance, production, reimbursement, and clinical execution blockers."
  },
  {
    method: "GET / POST",
    route: "/api/pilot-workspaces/{workspaceSlug}/evidence-room-provider-adapters",
    access: "GET: AAL2 bearer token + workspace membership + rate limit. POST: AAL2 bearer token + tenant-admin, pilot-lead, or reviewer role + fixed no-PHI provider adapter contract metadata + rate limit",
    purpose:
      "Inspect or record bounded no-PHI metadata for externally retained evidence-room provider contracts, adapter design references, and audit-log import stubs linked to completed access-log reconciliation. This does not store provider credentials, URLs, access tokens, raw logs, recipient identifiers, signed legal artifacts, customer permission artifacts, public release approval, external distribution approval, live integration approval, compliance certification, production authorization, or clinical execution authority."
  },
  {
    method: "GET",
    route: "/api/pilot-workspaces/{workspaceSlug}/evidence-room-provider-adapters/packet",
    access: "AAL2 bearer token + authorized tenant role + rate limit + append-only packet-download audit",
    purpose:
      "Download an audited protected evidence-room provider adapter packet after committing the packet release event while preserving integration-disabled posture, provider-adapter-metadata-only storage, and all public-release, external distribution, legal, finance, customer, compliance, production, reimbursement, live integration, and clinical execution blockers."
  },
  {
    method: "GET",
    route: "/api/pilot-workspaces/{workspaceSlug}/clinical-activation-approvals/packet",
    access: "AAL2 bearer token + authorized tenant role + server-held runtime authorization + rate limit + append-only packet-download audit",
    purpose:
      "Download an audited Markdown Clinical Activation Approval Workflow packet summarizing signed no-PHI readiness attestations, retained blockers, safe workarounds, and unavailable sections."
  },
  {
    method: "GET / POST",
    route: "/api/pilot-workspaces/{workspaceSlug}/trust-safety-incidents",
    access: "GET: AAL2 bearer token + workspace membership. POST: AAL2 bearer token + tenant-admin or pilot-lead role + server-held runtime authorization + rate limit",
    purpose: "Inspect or create tenant-scoped TrustOps incident evidence for synthetic-pilot and enterprise-readiness review."
  },
  {
    method: "GET / PATCH",
    route: "/api/pilot-workspaces/{workspaceSlug}/trust-safety-incidents/{incidentId}",
    access: "GET: AAL2 bearer token + workspace membership. PATCH: AAL2 bearer token + tenant-admin or pilot-lead role + server-held runtime authorization + rate limit",
    purpose: "Inspect or update TrustOps incident status, legal-hold posture, notification review posture, containment, remediation, and post-incident review evidence."
  },
  {
    method: "GET",
    route: "/api/pilot-workspaces/{workspaceSlug}/trust-safety-incidents/{incidentId}/review-packet",
    access: "AAL2 bearer token + authorized tenant role + server-held runtime authorization + append-only packet-download audit",
    purpose: "Download an audited TrustOps review packet after recording the packet release event."
  },
  {
    method: "GET / POST",
    route: "/api/pilot-workspaces/{workspaceSlug}/trustos-decisions",
    access: "AAL2 bearer token + authorized tenant role + server-held runtime authorization for writes + rate limit",
    purpose: "Inspect or commit metadata-only TrustOS decisions to the tenant-isolated append-only governance ledger."
  },
  {
    method: "GET / POST",
    route: "/api/pilot-workspaces/{workspaceSlug}/trustos-decisions/{decisionId}/reviews",
    access: "AAL2 bearer token + authorized tenant role + server-held runtime authorization for writes + rate limit",
    purpose: "Inspect or commit human reviewer dispositions, overrides, and controlled workflow outcome signals."
  },
  {
    method: "GET",
    route: "/api/pilot-workspaces/{workspaceSlug}/trustos-decisions/{decisionId}/governance-packet",
    access: "AAL2 bearer token + authorized tenant role + server-held runtime authorization + rate limit",
    purpose: "Download an audited governance packet containing decision, control, trace, evidence, and human-review proof."
  },
  {
    method: "GET / POST",
    route: "/api/agent-workspaces/{workspaceSlug}/work-orders",
    access: "GET: bearer token + tenant membership. POST: AAL2 bearer token + authorized tenant role + rate limit",
    purpose: "List, filter, summarize, or create persistent Agent Workspace work orders backed by tenant-scoped RLS tables and append-only events."
  },
  {
    method: "GET / PATCH",
    route: "/api/agent-workspaces/{workspaceSlug}/work-orders/{workOrderId}",
    access: "GET: bearer token + tenant membership. PATCH: AAL2 bearer token + authorized tenant role + rate limit",
    purpose: "Inspect, transition, retry, review, block, or close a persistent Agent Workspace work order."
  },
  {
    method: "GET",
    route: "/api/agent-workspaces/{workspaceSlug}/work-orders/{workOrderId}/proof-packet",
    access: "AAL2 bearer token + authorized tenant role + rate limit + append-only download audit",
    purpose: "Download an audited Markdown proof packet for a tenant-isolated synthetic Agent Workspace work order."
  }
];

export const protectedPilotActivationGates = [
  "Keep direct invitation send disabled until custom SMTP, legal copy, abuse controls, and delivery monitoring are approved.",
  "Extend the active passkey or magic-link sign-in, TOTP MFA, and session-lifetime policy into enforced enterprise SSO and multi-tenant identity operations.",
  "Complete legal, privacy, security, retention, incident response, and BAA review before any PHI-enabled scope.",
  "Keep live clinical execution denied until separate production promotion approval."
];

export const protectedPilotActivationWorkflow = [
  {
    step: "Record activation governance pack",
    owner: "Tenant-admin",
    proof: "Selected governance workflow pack is committed to the append-only Agent Workspace governance ledger with retention horizon, approvals, release gates, and blocked claims.",
    boundary: "Metadata-only activation seed; no PHI, no live connector execution, and no compliance certification claim."
  },
  {
    step: "Create controlled invitation record",
    owner: "Tenant-admin",
    proof: "Metadata-only invitation with proposed role, expiration, and governance note.",
    boundary: "No user creation, no PHI, and no email send."
  },
  {
    step: "Download audited onboarding packet",
    owner: "Tenant-admin",
    proof: "Markdown onboarding packet with recipient, role, workspace, access route, and delivery evidence.",
    boundary: "Packet supports manual enterprise delivery only."
  },
  {
    step: "Prepare external delivery",
    owner: "Tenant-admin",
    proof: "Lifecycle event records delivery preparation, delivery note, attempt count, and direct-send status.",
    boundary: "SMTP direct send remains gated until custom sender controls are approved."
  },
  {
    step: "Activate enrolled user",
    owner: "Tenant-admin + Identity provider",
    proof: "Activation succeeds only after the invited email has completed SCRIMED pilot authentication enrollment.",
    boundary: "No activation for unknown identities and no bypass of AAL2 governance."
  },
  {
    step: "Download activation proof packet",
    owner: "Tenant-admin",
    proof: "Audited packet summarizes invitations, onboarding packets, delivery readiness, memberships, reviews, and lifecycle evidence.",
    boundary: "Diligence artifact only; no production clinical or payer authorization."
  }
];

export const previewPilotWorkspace: PilotWorkspaceRecord = {
  id: "preview-workspace-atlas",
  tenantId: "preview-tenant",
  tenantName: "Synthetic Enterprise Preview",
  slug: "atlas-synthetic-evaluation",
  name: "Atlas Governed Workflow Evaluation",
  status: "synthetic-pilot",
  boundary: protectedPilotBoundary,
  createdAt: "2026-06-10T12:00:00.000Z"
};

export function getProtectedPilotInfrastructure(): ProtectedPilotInfrastructure {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
  const rateLimitConfigured = isUpstashRedisConfigured();

  return {
    identity: {
      provider: "Supabase Auth",
      configured: supabaseConfigured,
      control:
        "Server-side bearer-token verification uses the provider user record; user-editable metadata is never used for authorization."
    },
    durableStore: {
      provider: "Supabase Postgres",
      configured: supabaseConfigured,
      control: "Synthetic sessions and audit events persist in tenant-scoped tables; no service-role key is used by runtime APIs."
    },
    tenantIsolation: {
      provider: "Postgres row-level security",
      configured: supabaseConfigured,
      control: "Every workspace, session, and audit query is constrained by authenticated membership policies."
    },
    rateLimit: {
      provider: "Upstash Redis",
      configured: rateLimitConfigured,
      fallback: "A bounded in-process limiter is retained for temporary distributed-provider outages."
    },
    protectedMutationsEnabled: supabaseConfigured
  };
}

export function getProtectedPilotWorkspaceSummary() {
  const infrastructure = getProtectedPilotInfrastructure();

  return {
    service: "scrimed-protected-pilot-workspaces",
    status: infrastructure.protectedMutationsEnabled
      ? "protected-pilot-infrastructure-configured"
      : "protected-pilot-contract-ready-activation-required",
    route: "/pilot-workspace",
    boundary: protectedPilotBoundary,
    infrastructure,
    roles: pilotWorkspaceRoles,
    apiContracts: protectedPilotApiContracts,
    activationGates: protectedPilotActivationGates,
    activationWorkflow: protectedPilotActivationWorkflow,
    previewWorkspace: previewPilotWorkspace,
    capabilities: [
      "Tenant-authenticated workspace discovery",
      "Tenant-isolated durable synthetic evaluation sessions",
      "Append-only audit events",
      "Human-review and Trust Card evidence",
      "Downloadable single-session enterprise proof packets",
      "Tenant-admin aggregate enterprise proof packet spanning sessions, work orders, incidents, access controls, and audit evidence",
      "AAL2-protected append-only TrustOS Decision Ledger",
      "Governed reviewer dispositions, overrides, and outcome-learning signals",
      "Downloadable audited TrustOS governance packets",
      "AAL2-protected tenant membership visibility and audited role administration",
      "Governed invitation records with existing-auth-user activation",
      "Audited tenant-admin onboarding packet downloads for manual pilot delivery",
      "AAL2-protected activation governance pack seed with retention, legal-review, incident-export, and blocked-claims metadata",
      "Guided tenant-admin activation runbook with buyer-ready evidence status",
      "Audited tenant activation proof packet for buyer and investor diligence",
      "SMTP delivery readiness metadata with direct-send gate retained",
      "Protected Buyer Pilot Room with one-click Buyer Diligence Export for competitive edge, readiness, QA evidence, pricing path, limitations, legal/privacy/security/safety boundaries, workarounds, and write-before-release audit",
      "Protected SCRIMED Command Intelligence Hub for Agent Commander posture, Trust Engine outputs, continuous evaluation, MCP/tool access architecture, observability, buyer diligence readiness, safe-mode controls, limitations, workarounds, next actions, durable AAL2-reviewed snapshots, and audited command packets",
      "AAL2-protected no-PHI operator metric capture for Public Market Readiness, workflow cost discipline, proof-packet coverage, and finance-review preparation",
      "Browser-session manual QA evidence capture without copying bearer tokens into scripts",
      "Tenant offboarding, reactivation, and final-admin protection",
      "Periodic access review attestation",
      "SSO-readiness metadata and identity lifecycle evidence",
      "Rate-limited public intake and protected mutations",
      "Authenticated Agent Workspace dashboard for work-order creation, governed transitions, outcome metrics, reviewer queues, retry queues, packet export, governance export, and event-trail review",
      "Persistent Agent Workspace work-order creation, state transitions, retry tracking, reviewer assignment, closure, dashboard filters, proof-packet export, and append-only event trails"
    ],
    updated: "2026-06-18"
  };
}

export function buildEnterpriseProofPacket(workspace: PilotWorkspaceRecord, session: PilotSessionRecord) {
  const evaluation = session.evaluation;
  const deploymentProfileSummary = getDeploymentProfileSummary();
  const defaultDeploymentProfile =
    deploymentProfileSummary.profiles.find((profile) => profile.slug === "managed-cloud") ??
    deploymentProfileSummary.profiles[0];
  const evidence = evaluation.evidenceSources
    .map(
      (source) =>
        `- ${source.title} | ${source.owner} | ${source.version} | validated ${source.validationTimestamp}`
    )
    .join("\n");
  const approvals = evaluation.humanApprovals.map((approval) => `- ${approval}`).join("\n");
  const denied = evaluation.deniedCapabilities.map((capability) => `- ${capability}`).join("\n");
  const signals = evaluation.observabilityRecord.outcomeSignals.map((signal) => `- ${signal}`).join("\n");

  return `# SCRIMED Enterprise Pilot Proof Packet

## Workspace
- Tenant: ${workspace.tenantName}
- Workspace: ${workspace.name}
- Workspace status: ${workspace.status}
- Session ID: ${session.id}
- Created: ${session.createdAt}
- Created by: ${session.createdBy}

## Evaluation
- Scenario: ${evaluation.scenario.name}
- Buyer: ${evaluation.scenario.buyer}
- Workflow target: ${evaluation.scenario.workflowTarget}
- Status: ${evaluation.status}
- Document family: ${evaluation.scenario.documentFamily}

## Trust Card
- Recommendation: ${evaluation.trustCard.recommendation}
- Confidence: ${evaluation.trustCard.confidence}
- Validation status: ${evaluation.trustCard.validationStatus}
- Guideline version: ${evaluation.trustCard.guidelineVersion}
- Last updated: ${evaluation.trustCard.lastUpdated}

## Evidence Sources
${evidence || "- No evidence sources attached."}

## Human Approval Checkpoints
${approvals || "- No approval checkpoints attached."}

## Denied Capabilities
${denied || "- No denied capabilities recorded."}

## Outcome Signals
${signals || "- No outcome signals recorded."}

## Deployment Profile Readiness
- Selected profile: ${defaultDeploymentProfile.name}
- Status: ${defaultDeploymentProfile.status}
- Environment: ${defaultDeploymentProfile.environment}
- Revenue use: ${defaultDeploymentProfile.revenueUse}
- Cost model: ${defaultDeploymentProfile.costModel}
- Data residency posture: ${defaultDeploymentProfile.dataResidencyPosture}

### Deployment Metrics
${deploymentMetricLines(defaultDeploymentProfile)}

### Deployment Production Gates
${markdownItems(defaultDeploymentProfile.productionGates)}

### Deployment Blocked Claims
${markdownItems(defaultDeploymentProfile.blockedClaims)}

Deployment boundary: ${deploymentProfileSummary.boundary}

## Measurement Boundary
${evaluation.observabilityRecord.measurementBoundary}

## Product Boundary
${session.boundary}

This proof packet documents a governed synthetic pilot evaluation. It is not clinical advice, a production authorization, a reimbursement guarantee, or evidence of autonomous clinical execution.
`;
}

function enterpriseSessionLines(sessions: PilotSessionRecord[]) {
  if (sessions.length === 0) {
    return "- No durable synthetic pilot sessions are visible to this tenant-admin session.";
  }

  return sessions
    .slice(0, 25)
    .map(
      (session) =>
        `- ${session.createdAt}: ${session.evaluation.scenario.name} (${session.status}), session ${session.id}, scenario ${session.scenarioSlug}`
    )
    .join("\n");
}

function enterpriseTrustOSDecisionLines(decisions: TrustOSDecisionLedgerRecord[]) {
  if (decisions.length === 0) {
    return "- No TrustOS decisions are visible for this workspace.";
  }

  return decisions
    .slice(0, 25)
    .map(
      (decision) =>
        `- ${decision.createdAt}: ${decision.workflow}, ${decision.decision}, confidence ${decision.confidence}, uncertainty ${decision.uncertainty}, policy ${decision.policyVersion}`
    )
    .join("\n");
}

function enterpriseWorkOrderLines(workOrders: AgentWorkspaceWorkOrderRecord[]) {
  if (workOrders.length === 0) {
    return "- No persistent Agent Workspace work orders are visible for this workspace.";
  }

  return workOrders
    .slice(0, 25)
    .map(
      (workOrder) =>
        `- ${workOrder.updatedAt}: ${workOrder.workOrderType}, state ${workOrder.state}, owner ${workOrder.agentOwner}, reviewer ${workOrder.assignedReviewerId ?? "unassigned"}, work order ${workOrder.id}`
    )
    .join("\n");
}

function enterpriseGovernanceLedgerLines(records: AgentWorkspaceGovernanceLedgerRecord[]) {
  if (records.length === 0) {
    return "- No Agent Workspace governance ledger records are visible for this workspace.";
  }

  return records
    .slice(0, 25)
    .map(
      (record) =>
        `- ${record.createdAt}: ${record.actionType}, severity ${record.incidentSeverity}, work order ${record.workOrderId ?? "workspace-level"}, ledger ${record.id}`
    )
    .join("\n");
}

function enterpriseIncidentLines(dashboard: EnterpriseProofPacketTrustSafetyDashboard) {
  if (!dashboard) {
    return "- Trust Safety incident dashboard is unavailable for this packet.";
  }

  if (dashboard.incidents.length === 0) {
    return "- No Trust Safety incidents are visible for this workspace.";
  }

  return dashboard.incidents
    .slice(0, 20)
    .map(
      (incident) =>
        `- ${incident.updatedAt}: ${incident.title}, severity ${incident.severity}, status ${incident.status}, legal hold ${incident.legalHoldStatus}, notification ${incident.notificationDecision}`
    )
    .join("\n");
}

function enterpriseAccessLines(dashboard: TenantAccessDashboard | null) {
  if (!dashboard) {
    return "- Tenant access dashboard is unavailable for this packet.";
  }

  return [
    `- Active members: ${dashboard.summary.activeMembers}`,
    `- Inactive members: ${dashboard.summary.inactiveMembers}`,
    `- Pending invitations: ${dashboard.summary.pendingInvitations}`,
    `- Access reviews due: ${dashboard.summary.accessReviewsDue}`,
    `- Identity provider posture: ${dashboard.identityReadiness.providerStatus}`,
    `- Invitation delivery posture: ${dashboard.deliveryReadiness.status}`,
    `- Direct invitation email: ${dashboard.security.directInvitationEmail ? "enabled" : "disabled"}`
  ].join("\n");
}

function enterpriseAuditLines(events: PilotAuditEventRecord[]) {
  if (events.length === 0) {
    return "- No pilot audit events are visible for this workspace.";
  }

  return events
    .slice(0, 30)
    .map(
      (event) =>
        `- ${event.createdAt}: ${event.eventType} by ${event.actorUserId}; session ${event.sessionId ?? "workspace-level"}`
    )
    .join("\n");
}

function unavailableSectionLines(sections: string[]) {
  if (sections.length === 0) {
    return "- All aggregate packet evidence sections returned data or empty-state evidence.";
  }

  return markdownItems(sections);
}

function markdownJson(value: unknown) {
  return `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
}

export function buildEnterpriseAggregateProofPacket(input: EnterpriseProofPacketInput) {
  const appBaseUrl = input.appBaseUrl.replace(/\/$/, "");
  const accessRoute = `${appBaseUrl}/pilot-workspace/access`;
  const trustSafetyEventCount = input.trustSafetyDashboard?.events.length ?? 0;

  return `# SCRIMED Enterprise Proof Packet

## Packet Control
- Generated: ${input.generatedAt}
- Audit event ID: ${input.auditEventId}
- Generated by: ${input.actorUserId}
- Packet type: tenant-admin aggregate enterprise proof packet
- Product route: ${accessRoute}
- Data boundary: synthetic-only, metadata-only, tenant-scoped

## Tenant Workspace
- Tenant: ${input.workspace.tenantName}
- Workspace: ${input.workspace.name}
- Workspace slug: ${input.workspace.slug}
- Workspace status: ${input.workspace.status}
- Workspace created: ${input.workspace.createdAt}

## Evidence Counts
- Durable synthetic sessions: ${input.sessions.length}
- Pilot audit events: ${input.auditEvents.length}
- TrustOS decisions: ${input.trustOSDecisions.length}
- Agent Workspace work orders: ${input.agentWorkOrders.length}
- Agent Workspace governance ledger records: ${input.governanceLedgerRecords.length}
- Trust Safety incidents: ${input.trustSafetyDashboard?.incidents.length ?? 0}
- Trust Safety incident events: ${trustSafetyEventCount}
- Tenant access members: ${input.tenantAccessDashboard?.summary.activeMembers ?? 0} active, ${input.tenantAccessDashboard?.summary.inactiveMembers ?? 0} inactive

## Durable Synthetic Sessions
${enterpriseSessionLines(input.sessions)}

## TrustOS Decision Ledger
${enterpriseTrustOSDecisionLines(input.trustOSDecisions)}

## Persistent Agent Workspace
${enterpriseWorkOrderLines(input.agentWorkOrders)}

## Governance Ledger
${enterpriseGovernanceLedgerLines(input.governanceLedgerRecords)}

## Trust Safety And Incident Evidence
${enterpriseIncidentLines(input.trustSafetyDashboard)}

## Tenant Access And Identity Controls
${enterpriseAccessLines(input.tenantAccessDashboard)}

## Recent Append-Only Audit Events
${enterpriseAuditLines(input.auditEvents)}

## Unavailable Or Degraded Sections
${unavailableSectionLines(input.unavailableSections)}

## Trust Safety Security Metadata
${markdownJson(input.trustSafetyDashboard?.security ?? {})}

## Legal, Privacy, Security, And Safety Boundary
- This packet documents governed synthetic pilot evidence only.
- It is not medical advice, clinical decision support authorization, diagnosis, treatment guidance, patient instruction, payer submission, reimbursement guarantee, legal advice, regulatory advice, or security certification.
- It is not evidence of HIPAA compliance, SOC 2 certification, FDA clearance, payer approval, reimbursement eligibility, or production readiness.
- SCRIMED does not accept PHI, live patient records, payer credentials, production EHR credentials, imaging files, device streams, or secrets in this protected synthetic pilot workspace.
- Live clinical, payer, imaging, device, EHR, or patient-facing use requires signed customer authorization, BAA/DPA path where applicable, privacy review, security review, clinical governance, legal review, retention policy, incident response, and deployment approval.
- Human review remains required before any buyer-facing interpretation is treated as operational evidence.

## Workspace Boundary
${input.workspace.boundary}

${protectedPilotBoundary}
`;
}

export function buildTenantInvitationOnboardingPacket(
  packet: TenantInvitationPacket,
  appBaseUrl: string
) {
  const portalUrl = `${appBaseUrl.replace(/\/$/, "")}${packet.portalRoute}`;

  return `# SCRIMED Protected Pilot Onboarding Packet

## Recipient
- Email: ${packet.email}
- Proposed role: ${packet.proposedRole}
- Invitation status: ${packet.status}
- Invitation ID: ${packet.invitationId}
- Created: ${packet.createdAt}
- Expires: ${packet.expiresAt}

## Tenant Workspace
- Tenant: ${packet.tenantName}
- Workspace: ${packet.workspaceName}
- Workspace slug: ${packet.workspaceSlug}
- Access route: ${portalUrl}

## Onboarding Steps
1. Sign in at the protected pilot access route using an enrolled passkey or the invited email address.
2. Complete fresh MFA/TOTP verification when prompted by SCRIMED identity controls.
3. Use the workspace only for governed synthetic pilot evaluation.
4. Wait for a tenant-admin to activate the invitation after authentication enrollment is complete.

## Delivery Evidence
- Packet generated: ${packet.generatedAt}
- Invitation delivery status: ${packet.deliveryStatus}
- Tenant delivery readiness: ${packet.deliveryReadiness}
- SMTP provider posture: ${packet.smtpProvider || "Not approved for direct send"}
- SMTP from-domain posture: ${packet.smtpFromDomain || "Not approved for direct send"}
- Direct SCRIMED email send: disabled

## Governance Boundary
- No PHI, live patient data, or clinical details should be entered.
- No clinical execution, patient outreach, payer submission, autonomous diagnosis, or treatment action is authorized.
- This packet does not replace a legal, security, privacy, BAA, or procurement approval.
- Tenant-admin lifecycle actions are append-only audited and require fresh AAL2 assurance.

${packet.boundary}
`;
}

function markdownItems(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function lifecycleLines(events: TenantAccessLifecycleEvent[]) {
  return events
    .slice(0, 25)
    .map((event) => `- ${event.createdAt}: ${event.eventType} by ${event.actorUserId}`)
    .join("\n");
}

function invitationLines(invitations: TenantAccessInvitation[]) {
  return invitations
    .slice(0, 25)
    .map(
      (invitation) =>
        `- ${invitation.email}: ${invitation.status}, role ${invitation.proposedRole}, delivery ${invitation.deliveryStatus}, expires ${invitation.expiresAt}`
    )
    .join("\n");
}

function membershipLines(memberships: TenantAccessMembership[]) {
  return memberships
    .map(
      (membership) =>
        `- ${membership.email}: ${membership.role}, ${membership.status}, access review due ${membership.accessReviewDueAt}`
    )
    .join("\n");
}

function activationGovernanceLedgerLines(records: AgentWorkspaceGovernanceLedgerRecord[]) {
  return records
    .slice(0, 10)
    .map((record) => {
      const packName =
        typeof record.eventMetadata.governanceWorkflowPackName === "string"
          ? record.eventMetadata.governanceWorkflowPackName
          : "Governance workflow pack";
      const packStatus =
        typeof record.eventMetadata.governanceWorkflowPackStatus === "string"
          ? record.eventMetadata.governanceWorkflowPackStatus
          : "status unavailable";

      return `- ${record.createdAt}: ${packName} (${packStatus}), retention until ${record.retentionUntil ?? "not recorded"}, ledger ${record.id}`;
    })
    .join("\n");
}

export function buildTenantActivationProofPacket(
  packet: TenantActivationProofPacket,
  appBaseUrl: string
) {
  const dashboard = packet.dashboard;
  const portalUrl = `${appBaseUrl.replace(/\/$/, "")}/pilot-workspace/access`;
  const activationGovernanceUrl = `${appBaseUrl.replace(/\/$/, "")}/api/pilot-workspaces/${packet.workspaceSlug}/activation-governance`;
  const runbook = packet.activationRunbook.map((step, index) => `${index + 1}. ${step.step}: ${step.evidence}`);
  const activationGovernanceRecords = packet.activationGovernanceLedgerRecords ?? [];
  const readiness = [
    `Identity provider posture: ${dashboard.identityReadiness.providerStatus}`,
    `SSO provider: ${dashboard.identityReadiness.ssoProvider || "Not configured"}`,
    `SSO domain: ${dashboard.identityReadiness.ssoDomain || "Not configured"}`,
    `Invitation delivery posture: ${dashboard.deliveryReadiness.status}`,
    `SMTP provider: ${dashboard.deliveryReadiness.smtpProvider || "Not approved for direct send"}`,
    `SMTP from-domain: ${dashboard.deliveryReadiness.smtpFromDomain || "Not approved for direct send"}`,
    `Direct invitation email enabled: ${dashboard.security.directInvitationEmail ? "yes" : "no"}`
  ];

  return `# SCRIMED Protected Pilot Activation Proof Packet

## Packet
- Tenant: ${packet.tenantName}
- Workspace: ${packet.workspaceName}
- Workspace slug: ${packet.workspaceSlug}
- Generated: ${packet.generatedAt}
- Lifecycle event ID: ${packet.lifecycleEventId}
- Generated by: ${packet.actorUserId}
- Access route: ${portalUrl}

## Activation Runbook
${runbook.join("\n")}

## Activation Summary
- Active members: ${dashboard.summary.activeMembers}
- Inactive members: ${dashboard.summary.inactiveMembers}
- Pending invitations: ${dashboard.summary.pendingInvitations}
- Onboarding packets generated: ${dashboard.summary.packetGeneratedInvitations}
- External delivery preparations: ${dashboard.summary.deliveryPreparedInvitations}
- Access reviews due: ${dashboard.summary.accessReviewsDue}

## Identity and Delivery Readiness
${markdownItems(readiness)}

## Membership Evidence
${membershipLines(dashboard.memberships) || "- No memberships are visible to this tenant-admin session."}

## Invitation Evidence
${invitationLines(dashboard.invitations) || "- No invitation records are currently visible for this tenant."}

## Lifecycle Evidence
${lifecycleLines(dashboard.lifecycleEvents) || "- No lifecycle events are currently visible for this tenant."}

## Activation Governance Ledger
${activationGovernanceLedgerLines(activationGovernanceRecords) || `- No activation governance seed is attached to this packet yet. Record it through ${activationGovernanceUrl} before final buyer diligence export.`}

## Security Controls
- Assurance level: ${dashboard.security.assuranceLevel}
- Final-admin protection: ${dashboard.security.finalAdminProtection ? "active" : "not active"}
- Offboarding enforced: ${dashboard.security.offboardingEnforced ? "active" : "not active"}
- Mutation authorization: ${dashboard.security.mutationAuthorization}
- Delivery mode: ${dashboard.security.deliveryMode}

## Product Boundary
${dashboard.boundary}

${packet.boundary}

This activation proof packet supports protected synthetic pilot diligence. It is not clinical advice, legal approval, a BAA, a production authorization, a reimbursement guarantee, or evidence of autonomous clinical execution.
`;
}
