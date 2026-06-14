import type { AgentEvaluationRecord } from "./agentEvaluationWorkspace";
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
  boundary: string;
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
    permissions: ["Review tenant identity configuration", "View all tenant pilot workspaces", "Create and transition persistent agent work orders", "Commit TrustOS decisions", "Record governed reviewer dispositions", "Download proof and governance packets"],
    restrictions: ["Cannot enable live clinical execution", "Cannot alter append-only audit events"]
  },
  {
    role: "pilot-lead",
    permissions: ["Run synthetic evaluations", "Create and transition persistent agent work orders", "Commit TrustOS decisions", "Record governed reviewer dispositions", "View workspace sessions", "Download proof and governance packets"],
    restrictions: ["Cannot manage tenant identity", "Cannot alter append-only audit events"]
  },
  {
    role: "reviewer",
    permissions: ["View workspace sessions", "Review Trust Cards and work orders", "Record governed reviewer dispositions and outcome signals", "Download proof and governance packets"],
    restrictions: ["Cannot create sessions or new work orders", "Cannot manage tenant identity"]
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
    method: "GET",
    route: "/api/pilot-workspaces/{workspaceSlug}/sessions/{sessionId}/proof-packet",
    access: "AAL2 bearer token + authorized tenant role + server-held runtime authorization + rate limit",
    purpose: "Download a buyer-ready Markdown proof packet generated from tenant-isolated session evidence."
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
  "Extend the active magic-link, TOTP MFA, and session-lifetime policy into enforced enterprise SSO and multi-tenant identity operations.",
  "Complete legal, privacy, security, retention, incident response, and BAA review before any PHI-enabled scope.",
  "Keep live clinical execution denied until separate production promotion approval."
];

export const protectedPilotActivationWorkflow = [
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
      "Downloadable enterprise proof packets",
      "AAL2-protected append-only TrustOS Decision Ledger",
      "Governed reviewer dispositions, overrides, and outcome-learning signals",
      "Downloadable audited TrustOS governance packets",
      "AAL2-protected tenant membership visibility and audited role administration",
      "Governed invitation records with existing-auth-user activation",
      "Audited tenant-admin onboarding packet downloads for manual pilot delivery",
      "Guided tenant-admin activation runbook with buyer-ready evidence status",
      "Audited tenant activation proof packet for buyer and investor diligence",
      "SMTP delivery readiness metadata with direct-send gate retained",
      "Tenant offboarding, reactivation, and final-admin protection",
      "Periodic access review attestation",
      "SSO-readiness metadata and identity lifecycle evidence",
      "Rate-limited public intake and protected mutations",
      "Persistent Agent Workspace work-order creation, state transitions, retry tracking, reviewer assignment, closure, dashboard filters, proof-packet export, and append-only event trails"
    ],
    updated: "2026-06-14"
  };
}

export function buildEnterpriseProofPacket(workspace: PilotWorkspaceRecord, session: PilotSessionRecord) {
  const evaluation = session.evaluation;
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

## Measurement Boundary
${evaluation.observabilityRecord.measurementBoundary}

## Product Boundary
${session.boundary}

This proof packet documents a governed synthetic pilot evaluation. It is not clinical advice, a production authorization, a reimbursement guarantee, or evidence of autonomous clinical execution.
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
1. Sign in at the protected pilot access route using the invited email address.
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

export function buildTenantActivationProofPacket(
  packet: TenantActivationProofPacket,
  appBaseUrl: string
) {
  const dashboard = packet.dashboard;
  const portalUrl = `${appBaseUrl.replace(/\/$/, "")}/pilot-workspace/access`;
  const runbook = packet.activationRunbook.map((step, index) => `${index + 1}. ${step.step}: ${step.evidence}`);
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
