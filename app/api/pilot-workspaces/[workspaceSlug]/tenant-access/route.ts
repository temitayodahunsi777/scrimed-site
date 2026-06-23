import { NextResponse } from "next/server";
import {
  activateTenantAccessInvitation,
  attestTenantAccessReview,
  cancelTenantAccessInvitation,
  createTenantAccessInvitation,
  deactivateTenantMembership,
  getAuthenticatedGovernanceContext,
  getTenantAccessDashboard,
  prepareTenantInvitationDelivery,
  reactivateTenantMembership,
  updateTenantInvitationDeliveryReadiness,
  updateTenantIdentityReadiness,
  updateTenantMembershipRole
} from "../../../../lib/protectedPilotStore";
import {
  pilotWorkspaceRoles,
  protectedPilotBoundary,
  protectedPilotNoStoreHeaders,
  type PilotWorkspaceRole,
  type TenantIdentityProviderStatus,
  type TenantInvitationDeliveryReadinessStatus
} from "../../../../lib/protectedPilotWorkspace";
import { enforceRequestRateLimit, rateLimitHeaders } from "../../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceSlug: string }>;
};

type TenantAccessAction =
  | "update-role"
  | "create-invitation"
  | "cancel-invitation"
  | "activate-invitation"
  | "deactivate-membership"
  | "reactivate-membership"
  | "attest-access-review"
  | "update-identity-readiness"
  | "prepare-invitation-delivery"
  | "update-delivery-readiness";

const allowedRoles = new Set<PilotWorkspaceRole>(pilotWorkspaceRoles.map((entry) => entry.role));
const allowedIdentityStatuses = new Set<TenantIdentityProviderStatus>([
  "passkey-or-magic-link",
  "passwordless-magic-link",
  "sso-readiness",
  "sso-configured"
]);
const allowedDeliveryReadinessStatuses = new Set<TenantInvitationDeliveryReadinessStatus>([
  "manual-packet-only",
  "smtp-readiness-review",
  "smtp-approved-send-gated"
]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const domainPattern = /^[A-Z0-9.-]+\.[A-Z]{2,}$/i;

function statusForTenantAccessError(message: string) {
  if (message.includes("tenant-access-final-admin-protected")) return 409;
  if (message.includes("tenant-access-pending-invitation-exists")) return 409;
  if (message.includes("tenant-access-membership-already-active")) return 409;
  if (message.includes("tenant-access-invited-user-not-found")) return 409;
  if (message.includes("tenant-access-membership-not-found")) return 404;
  if (message.includes("tenant-access-invitation-not-found")) return 404;
  if (message.includes("prohibited-identity-lifecycle-data")) return 422;
  if (message.includes("tenant-access-delivery-note-too-large")) return 413;
  if (message.includes("tenant-access-invalid")) return 422;
  if (message.includes("too-large")) return 413;
  if (message.includes("role-denied") || message.includes("admin-required")) return 403;
  return 502;
}

function tenantAccessErrorCode(message: string) {
  if (message.includes("tenant-access-final-admin-protected")) return "tenant-access-final-admin-protected";
  if (message.includes("tenant-access-pending-invitation-exists")) return "tenant-access-pending-invitation-exists";
  if (message.includes("tenant-access-membership-already-active")) return "tenant-access-membership-already-active";
  if (message.includes("tenant-access-invited-user-not-found")) return "tenant-access-invited-user-not-found";
  if (message.includes("tenant-access-invitation-not-found")) return "tenant-access-invitation-not-found";
  if (message.includes("tenant-access-membership-not-found")) return "tenant-access-membership-not-found";
  if (message.includes("prohibited-identity-lifecycle-data")) return "prohibited-identity-lifecycle-data";
  if (message.includes("tenant-access-delivery-note-too-large")) return "tenant-access-delivery-note-too-large";
  if (message.includes("tenant-access-invalid")) return "invalid-tenant-access-action";
  return "tenant-access-action-failed";
}

function tenantAccessErrorMessage(message: string) {
  if (message.includes("tenant-access-final-admin-protected")) {
    return "The final active tenant-admin cannot be demoted or deactivated. Promote another active admin first.";
  }

  if (message.includes("tenant-access-pending-invitation-exists")) {
    return "A pending invitation record already exists for that email address.";
  }

  if (message.includes("tenant-access-membership-already-active")) {
    return "That email address already belongs to an active protected-pilot member.";
  }

  if (message.includes("tenant-access-invited-user-not-found")) {
    return "This invitation can only be activated after the recipient completes SCRIMED pilot authentication enrollment.";
  }

  if (message.includes("tenant-access-invitation-not-found")) {
    return "The invitation record was not found, is no longer pending, or is outside this tenant.";
  }

  if (message.includes("tenant-access-membership-not-found")) {
    return "The protected-pilot membership was not found for this tenant.";
  }

  if (message.includes("prohibited-identity-lifecycle-data")) {
    return "Identity lifecycle notes must stay metadata-only and cannot include PHI or clinical details.";
  }

  if (message.includes("tenant-access-delivery-note-too-large")) {
    return "Invitation delivery notes must remain concise and metadata-only.";
  }

  if (message.includes("too-large")) {
    return "The submitted lifecycle note is too large for the governed pilot boundary.";
  }

  if (message.includes("tenant-access-invalid")) {
    return "The tenant access lifecycle action did not pass validation.";
  }

  return "The governed tenant access lifecycle action could not be committed.";
}

function stringValue(body: Record<string, unknown>, key: string, maxLength: number) {
  const value = typeof body[key] === "string" ? body[key].trim() : "";
  return value.slice(0, maxLength);
}

function validUuid(value: string) {
  return uuidPattern.test(value);
}

function validOptionalTimestamp(value: string | null) {
  return !value || !Number.isNaN(Date.parse(value));
}

async function readPayload(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return {
      ok: false as const,
      status: 415,
      body: { error: { code: "unsupported-content-type", message: "Tenant access lifecycle actions must use application/json." } }
    };
  }

  const rawBody = await request.text();

  if (rawBody.length > 3000) {
    return {
      ok: false as const,
      status: 413,
      body: { error: { code: "payload-too-large", message: "Tenant access lifecycle requests must remain concise." } }
    };
  }

  try {
    const payload = JSON.parse(rawBody) as unknown;
    return {
      ok: true as const,
      body: payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {}
    };
  } catch {
    return {
      ok: false as const,
      status: 400,
      body: { error: { code: "invalid-json", message: "Request body must be valid JSON." } }
    };
  }
}

export async function GET(request: Request, { params }: RouteContext) {
  const context = await getAuthenticatedGovernanceContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: protectedPilotBoundary },
      { status: context.status, headers: protectedPilotNoStoreHeaders }
    );
  }

  const { workspaceSlug } = await params;
  const result = await getTenantAccessDashboard(context.client, workspaceSlug);

  if (result.error || !result.dashboard) {
    return NextResponse.json(
      {
        error: {
          code: "tenant-access-query-failed",
          message: "Tenant access administration is unavailable for this workspace and identity."
        },
        boundary: protectedPilotBoundary
      },
      {
        status: statusForTenantAccessError(result.error?.message ?? ""),
        headers: protectedPilotNoStoreHeaders
      }
    );
  }

  return NextResponse.json(
    {
      service: "scrimed-tenant-access-administration",
      boundary: protectedPilotBoundary,
      dashboard: result.dashboard
    },
    { headers: protectedPilotNoStoreHeaders }
  );
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const rateLimit = await enforceRequestRateLimit(request, {
    namespace: "tenant-access-lifecycle-mutation",
    limit: 30,
    windowSeconds: 600
  });
  const headers = { ...protectedPilotNoStoreHeaders, ...rateLimitHeaders(rateLimit) };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate-limit-exceeded",
          message: "Tenant access lifecycle actions are temporarily rate limited."
        }
      },
      { status: 429, headers }
    );
  }

  const context = await getAuthenticatedGovernanceContext(request);

  if (!context.ok) {
    return NextResponse.json(
      { error: { code: context.code, message: context.message }, boundary: protectedPilotBoundary },
      { status: context.status, headers }
    );
  }

  const payload = await readPayload(request);

  if (!payload.ok) {
    return NextResponse.json(payload.body, { status: payload.status, headers });
  }

  const body = payload.body;
  const action = (typeof body.action === "string" ? body.action : "update-role") as TenantAccessAction;
  const { workspaceSlug } = await params;
  let mutation:
    | Awaited<ReturnType<typeof updateTenantMembershipRole>>
    | Awaited<ReturnType<typeof createTenantAccessInvitation>>
    | Awaited<ReturnType<typeof cancelTenantAccessInvitation>>
    | Awaited<ReturnType<typeof activateTenantAccessInvitation>>
    | Awaited<ReturnType<typeof deactivateTenantMembership>>
    | Awaited<ReturnType<typeof reactivateTenantMembership>>
    | Awaited<ReturnType<typeof attestTenantAccessReview>>
    | Awaited<ReturnType<typeof updateTenantIdentityReadiness>>
    | Awaited<ReturnType<typeof prepareTenantInvitationDelivery>>
    | Awaited<ReturnType<typeof updateTenantInvitationDeliveryReadiness>>;

  if (action === "update-role") {
    const userId = stringValue(body, "userId", 64);
    const role = typeof body.role === "string" ? (body.role as PilotWorkspaceRole) : null;

    if (!validUuid(userId) || !role || !allowedRoles.has(role)) {
      return NextResponse.json(
        {
          error: {
            code: "invalid-tenant-role-change",
            message: "A valid existing membership identity and approved SCRIMED pilot role are required."
          }
        },
        { status: 422, headers }
      );
    }

    mutation = await updateTenantMembershipRole(context.client, workspaceSlug, userId, role);
  } else if (action === "create-invitation") {
    const email = stringValue(body, "email", 254).toLowerCase();
    const role = typeof body.role === "string" ? (body.role as PilotWorkspaceRole) : null;
    const expiresAt = typeof body.expiresAt === "string" && body.expiresAt.trim() ? body.expiresAt.trim() : null;
    const note = stringValue(body, "note", 700);

    if (!emailPattern.test(email) || !role || !allowedRoles.has(role) || !validOptionalTimestamp(expiresAt)) {
      return NextResponse.json(
        {
          error: {
            code: "invalid-tenant-invitation",
            message: "A valid email, approved pilot role, and optional expiration timestamp are required."
          }
        },
        { status: 422, headers }
      );
    }

    mutation = await createTenantAccessInvitation(context.client, workspaceSlug, email, role, expiresAt, note);
  } else if (action === "cancel-invitation") {
    const invitationId = stringValue(body, "invitationId", 64);
    const reason = stringValue(body, "reason", 500);

    if (!validUuid(invitationId)) {
      return NextResponse.json(
        { error: { code: "invalid-tenant-invitation", message: "A valid invitation identity is required." } },
        { status: 422, headers }
      );
    }

    mutation = await cancelTenantAccessInvitation(context.client, workspaceSlug, invitationId, reason);
  } else if (action === "activate-invitation") {
    const invitationId = stringValue(body, "invitationId", 64);

    if (!validUuid(invitationId)) {
      return NextResponse.json(
        { error: { code: "invalid-tenant-invitation", message: "A valid invitation identity is required." } },
        { status: 422, headers }
      );
    }

    mutation = await activateTenantAccessInvitation(context.client, workspaceSlug, invitationId);
  } else if (action === "deactivate-membership") {
    const userId = stringValue(body, "userId", 64);
    const reason = stringValue(body, "reason", 500);

    if (!validUuid(userId)) {
      return NextResponse.json(
        { error: { code: "invalid-tenant-membership", message: "A valid membership identity is required." } },
        { status: 422, headers }
      );
    }

    mutation = await deactivateTenantMembership(context.client, workspaceSlug, userId, reason);
  } else if (action === "reactivate-membership") {
    const userId = stringValue(body, "userId", 64);

    if (!validUuid(userId)) {
      return NextResponse.json(
        { error: { code: "invalid-tenant-membership", message: "A valid membership identity is required." } },
        { status: 422, headers }
      );
    }

    mutation = await reactivateTenantMembership(context.client, workspaceSlug, userId);
  } else if (action === "attest-access-review") {
    const notes = stringValue(body, "notes", 700);
    mutation = await attestTenantAccessReview(context.client, workspaceSlug, notes);
  } else if (action === "update-identity-readiness") {
    const providerStatus =
      typeof body.providerStatus === "string" ? (body.providerStatus as TenantIdentityProviderStatus) : null;
    const ssoProvider = stringValue(body, "ssoProvider", 120);
    const ssoDomain = stringValue(body, "ssoDomain", 160).toLowerCase();
    const notes = stringValue(body, "notes", 700);

    if (
      !providerStatus ||
      !allowedIdentityStatuses.has(providerStatus) ||
      (ssoDomain !== "" && !domainPattern.test(ssoDomain))
    ) {
      return NextResponse.json(
        {
          error: {
            code: "invalid-identity-readiness",
            message: "A valid identity provider status and optional SSO domain are required."
          }
        },
        { status: 422, headers }
      );
    }

    mutation = await updateTenantIdentityReadiness(
      context.client,
      workspaceSlug,
      providerStatus,
      ssoProvider,
      ssoDomain,
      notes
    );
  } else if (action === "prepare-invitation-delivery") {
    const invitationId = stringValue(body, "invitationId", 64);
    const note = stringValue(body, "note", 700);

    if (!validUuid(invitationId)) {
      return NextResponse.json(
        { error: { code: "invalid-tenant-invitation", message: "A valid invitation identity is required." } },
        { status: 422, headers }
      );
    }

    mutation = await prepareTenantInvitationDelivery(context.client, workspaceSlug, invitationId, note);
  } else if (action === "update-delivery-readiness") {
    const deliveryStatus =
      typeof body.deliveryStatus === "string"
        ? (body.deliveryStatus as TenantInvitationDeliveryReadinessStatus)
        : null;
    const smtpProvider = stringValue(body, "smtpProvider", 120);
    const smtpFromDomain = stringValue(body, "smtpFromDomain", 160).toLowerCase();
    const notes = stringValue(body, "notes", 700);

    if (
      !deliveryStatus ||
      !allowedDeliveryReadinessStatuses.has(deliveryStatus) ||
      (smtpFromDomain !== "" && !domainPattern.test(smtpFromDomain))
    ) {
      return NextResponse.json(
        {
          error: {
            code: "invalid-delivery-readiness",
            message: "A valid invitation delivery posture and optional SMTP from-domain are required."
          }
        },
        { status: 422, headers }
      );
    }

    mutation = await updateTenantInvitationDeliveryReadiness(
      context.client,
      workspaceSlug,
      deliveryStatus,
      smtpProvider,
      smtpFromDomain,
      notes
    );
  } else {
    return NextResponse.json(
      {
        error: {
          code: "unsupported-tenant-access-action",
          message: "The requested tenant access lifecycle action is not supported."
        }
      },
      { status: 422, headers }
    );
  }

  if (mutation.error) {
    return NextResponse.json(
      {
        error: {
          code: tenantAccessErrorCode(mutation.error.message),
          message: tenantAccessErrorMessage(mutation.error.message)
        },
        boundary: protectedPilotBoundary
      },
      { status: statusForTenantAccessError(mutation.error.message), headers }
    );
  }

  const dashboard = await getTenantAccessDashboard(context.client, workspaceSlug);

  if (dashboard.error || !dashboard.dashboard) {
    return NextResponse.json(
      {
        service: "scrimed-tenant-access-administration",
        status: "tenant-access-action-committed",
        action,
        boundary: protectedPilotBoundary
      },
      { status: 200, headers }
    );
  }

  return NextResponse.json(
    {
      service: "scrimed-tenant-access-administration",
      status: "tenant-access-action-committed",
      action,
      boundary: protectedPilotBoundary,
      dashboard: dashboard.dashboard
    },
    { headers }
  );
}
