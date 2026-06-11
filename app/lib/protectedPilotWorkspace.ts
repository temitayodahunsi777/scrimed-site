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

export type TenantAccessMembership = {
  userId: string;
  email: string;
  role: PilotWorkspaceRole;
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
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

export type TenantAccessDashboard = {
  tenantId: string;
  tenantName: string;
  workspaceId: string;
  workspaceSlug: string;
  workspaceName: string;
  actorUserId: string;
  memberships: TenantAccessMembership[];
  auditEvents: TenantAccessAuditEvent[];
  security: {
    assuranceLevel: "aal2";
    finalAdminProtection: true;
    mutationAuthorization: "tenant-admin-plus-server-runtime-token";
  };
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
    permissions: ["Review tenant identity configuration", "View all tenant pilot workspaces", "Commit TrustOS decisions", "Record governed reviewer dispositions", "Download proof and governance packets"],
    restrictions: ["Cannot enable live clinical execution", "Cannot alter append-only audit events"]
  },
  {
    role: "pilot-lead",
    permissions: ["Run synthetic evaluations", "Commit TrustOS decisions", "Record governed reviewer dispositions", "View workspace sessions", "Download proof and governance packets"],
    restrictions: ["Cannot manage tenant identity", "Cannot alter append-only audit events"]
  },
  {
    role: "reviewer",
    permissions: ["View workspace sessions", "Review Trust Cards", "Record governed reviewer dispositions and outcome signals", "Download proof and governance packets"],
    restrictions: ["Cannot create sessions", "Cannot manage tenant identity"]
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
    purpose: "Inspect existing approved memberships and apply audited role changes without exposing identity creation."
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
  }
];

export const protectedPilotActivationGates = [
  "Add governed identity invitation, offboarding, recovery, and periodic access review beyond existing approved memberships.",
  "Extend the active magic-link, TOTP MFA, and session-lifetime policy into approved enterprise SSO and multi-tenant identity operations.",
  "Complete legal, privacy, security, retention, incident response, and BAA review before any PHI-enabled scope.",
  "Keep live clinical execution denied until separate production promotion approval."
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
      "Rate-limited public intake and protected mutations"
    ],
    updated: "2026-06-11"
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
