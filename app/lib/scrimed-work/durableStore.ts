import type { SupabaseClient, User } from "@supabase/supabase-js";
import type {
  ActorIdentity,
  WorkArtifact,
  WorkSession,
  WorkSessionStatus,
  WorkSessionTransitionAction
} from "./types";

export const scrimedWorkDurableStoreStatus = "scrimed-work-durable-store-contract-ready-no-phi";
export const scrimedWorkDurableStoreBoundary =
  "SCRIMED Work Durable Store is an AAL2-gated, tenant-scoped, metadata-only persistence contract for SCRIMED Work sessions, artifacts, status transitions, audit events, idempotency, rollback metadata, and verification evidence. It does not store live PHI, raw prompts, raw connector payloads, secrets, clinical authority, payer submission authority, EHR writeback authority, production connector approval, certification proof, or customer go-live authority.";

export type ScrimedWorkDurableStoreContext = {
  client: SupabaseClient;
  user: User;
  workspaceSlug: string;
  idempotencyKey: string;
  workspaceId: string;
  tenantId: string;
  memberRole: ScrimedWorkMembershipRole;
  actorRole: ActorIdentity["role"];
};

export type ScrimedWorkMembershipRole = "tenant-admin" | "pilot-lead" | "reviewer";

const memberRoles = new Set<ScrimedWorkMembershipRole>(["tenant-admin", "pilot-lead", "reviewer"]);

function actorRoleForMembership(role: ScrimedWorkMembershipRole): ActorIdentity["role"] {
  if (role === "tenant-admin") return "admin";
  if (role === "pilot-lead") return "operator";
  return "reviewer";
}

export async function resolveScrimedWorkMembership(input: {
  client: SupabaseClient;
  user: User;
  workspaceSlug: string;
}): Promise<
  | {
      ok: true;
      workspaceId: string;
      tenantId: string;
      memberRole: ScrimedWorkMembershipRole;
      actorRole: ActorIdentity["role"];
    }
  | { ok: false; status: 403 | 503; code: string; message: string }
> {
  const workspaceResult = await input.client
    .from("pilot_workspaces")
    .select("id, tenant_id")
    .eq("slug", input.workspaceSlug)
    .maybeSingle();

  if (workspaceResult.error) {
    return {
      ok: false,
      status: 503,
      code: "scrimed-work-workspace-role-lookup-unavailable",
      message: "SCRIMED Work could not verify the tenant workspace role through the protected store."
    };
  }

  const workspace = workspaceResult.data as { id?: unknown; tenant_id?: unknown } | null;
  if (typeof workspace?.id !== "string" || typeof workspace.tenant_id !== "string") {
    return {
      ok: false,
      status: 403,
      code: "scrimed-work-workspace-role-denied",
      message: "The authenticated operator is not authorized for this tenant workspace."
    };
  }

  const membershipResult = await input.client
    .from("pilot_memberships")
    .select("role")
    .eq("tenant_id", workspace.tenant_id)
    .eq("user_id", input.user.id)
    .maybeSingle();

  if (membershipResult.error) {
    return {
      ok: false,
      status: 503,
      code: "scrimed-work-membership-role-lookup-unavailable",
      message: "SCRIMED Work could not verify the operator role through the protected store."
    };
  }

  const role = (membershipResult.data as { role?: unknown } | null)?.role;
  if (typeof role !== "string" || !memberRoles.has(role as ScrimedWorkMembershipRole)) {
    return {
      ok: false,
      status: 403,
      code: "scrimed-work-membership-role-denied",
      message: "SCRIMED Work protected actions require tenant-admin, pilot-lead, or reviewer membership."
    };
  }

  const memberRole = role as ScrimedWorkMembershipRole;
  return {
    ok: true,
    workspaceId: workspace.id,
    tenantId: workspace.tenant_id,
    memberRole,
    actorRole: actorRoleForMembership(memberRole)
  };
}

export type ScrimedWorkDurableSessionRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  workspaceSlug: string;
  sessionId: string;
  title: string;
  objective: string;
  workspaceDomain: string;
  riskLevel: string;
  approvedAutonomy: string;
  status: WorkSessionStatus;
  session: WorkSession;
  eventCount: number;
  artifactCount: number;
  humanReviewRequired: boolean;
  noPhiAssertion: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  boundary: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function mapSessionRecord(value: unknown): ScrimedWorkDurableSessionRecord | null {
  const record = asRecord(value);

  if (!record.id || !record.sessionId || !record.session) {
    return null;
  }

  return record as unknown as ScrimedWorkDurableSessionRecord;
}

export function isScrimedWorkDurableStoreEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.SCRIMED_WORK_DURABLE_STORE_ENABLED === "true";
}

export function getScrimedWorkDurableStorageMode(env: NodeJS.ProcessEnv = process.env) {
  if (isScrimedWorkDurableStoreEnabled(env)) {
    return "protected-supabase-rpc-aal2";
  }

  return "deterministic-in-memory-adapter";
}

export function getScrimedWorkWorkspaceSlug(request: Request, payload?: unknown) {
  const headerSlug = request.headers.get("x-scrimed-workspace-slug")?.trim();
  const body = asRecord(payload);
  const bodySlug = typeof body.workspaceSlug === "string" ? body.workspaceSlug.trim() : "";
  const envSlug = process.env.SCRIMED_WORK_DEFAULT_WORKSPACE_SLUG?.trim() ?? "";

  return headerSlug || bodySlug || envSlug;
}

export async function recordScrimedWorkSessionInDurableStore(
  context: ScrimedWorkDurableStoreContext,
  session: WorkSession
): Promise<{
  record: ScrimedWorkDurableSessionRecord | null;
  eventId: string | null;
  persisted: boolean;
  idempotentReplay: boolean;
  boundary: string;
  error: unknown;
}> {
  const { data, error } = await context.client.rpc("record_scrimed_work_session", {
    p_workspace_slug: context.workspaceSlug,
    p_session: session,
    p_idempotency_key: context.idempotencyKey,
    p_audit_event: {
      actorUserId: context.user.id,
      actorRole: context.actorRole,
      memberRole: context.memberRole,
      source: "scrimed-work-create-session-route",
      syntheticOnly: true,
      noPhi: true
    }
  });
  const payload = asRecord(data);

  return {
    record: mapSessionRecord(payload.record),
    eventId: stringValue(payload.eventId) || null,
    persisted: payload.persisted === true,
    idempotentReplay: payload.idempotentReplay === true,
    boundary: stringValue(payload.boundary) || scrimedWorkDurableStoreBoundary,
    error
  };
}

export async function transitionScrimedWorkSessionInDurableStore(
  context: ScrimedWorkDurableStoreContext,
  input: {
    sessionId: string;
    status: WorkSessionStatus;
    reason: string;
    session: WorkSession;
    action: WorkSessionTransitionAction;
    lifecycleDecisionHash: string;
  }
): Promise<{
  record: ScrimedWorkDurableSessionRecord | null;
  eventId: string | null;
  transitioned: boolean;
  idempotentReplay: boolean;
  boundary: string;
  error: unknown;
}> {
  const { data, error } = await context.client.rpc("transition_scrimed_work_session", {
    p_workspace_slug: context.workspaceSlug,
    p_session_id: input.sessionId,
    p_status: input.status,
    p_reason: input.reason,
    p_session: input.session,
    p_idempotency_key: context.idempotencyKey,
    p_audit_event: {
      actorUserId: context.user.id,
      actorRole: context.actorRole,
      memberRole: context.memberRole,
      lifecycleAction: input.action,
      lifecycleDecisionHash: input.lifecycleDecisionHash,
      source: "scrimed-work-transition-route",
      syntheticOnly: true,
      noPhi: true
    }
  });
  const payload = asRecord(data);

  return {
    record: mapSessionRecord(payload.record),
    eventId: stringValue(payload.eventId) || null,
    transitioned: payload.transitioned === true,
    idempotentReplay: payload.idempotentReplay === true,
    boundary: stringValue(payload.boundary) || scrimedWorkDurableStoreBoundary,
    error
  };
}

export async function fetchScrimedWorkSessionFromDurableStore(
  context: Pick<ScrimedWorkDurableStoreContext, "client" | "workspaceSlug">,
  sessionId: string
): Promise<{
  record: ScrimedWorkDurableSessionRecord | null;
  boundary: string;
  error: unknown;
}> {
  const { data, error } = await context.client.rpc("get_scrimed_work_session", {
    p_workspace_slug: context.workspaceSlug,
    p_session_id: sessionId
  });
  const payload = asRecord(data);

  return {
    record: mapSessionRecord(payload.record),
    boundary: stringValue(payload.boundary) || scrimedWorkDurableStoreBoundary,
    error
  };
}

export async function recordScrimedWorkArtifactInDurableStore(
  context: ScrimedWorkDurableStoreContext,
  input: {
    sessionId: string;
    artifact: WorkArtifact;
  }
): Promise<{
  artifactId: string | null;
  eventId: string | null;
  persisted: boolean;
  idempotentReplay: boolean;
  boundary: string;
  error: unknown;
}> {
  const { data, error } = await context.client.rpc("record_scrimed_work_artifact", {
    p_workspace_slug: context.workspaceSlug,
    p_session_id: input.sessionId,
    p_artifact: input.artifact,
    p_idempotency_key: context.idempotencyKey,
    p_audit_event: {
      actorUserId: context.user.id,
      actorRole: context.actorRole,
      memberRole: context.memberRole,
      source: "scrimed-work-artifact-route",
      syntheticOnly: true,
      noPhi: true
    }
  });
  const payload = asRecord(data);

  return {
    artifactId: stringValue(payload.artifactId) || null,
    eventId: stringValue(payload.eventId) || null,
    persisted: payload.persisted === true,
    idempotentReplay: payload.idempotentReplay === true,
    boundary: stringValue(payload.boundary) || scrimedWorkDurableStoreBoundary,
    error
  };
}

export function redactScrimedWorkSensitiveText(value: string) {
  return value
    .replace(/\bBearer\s+[A-Za-z0-9._-]{16,}\b/gi, "Bearer [REDACTED]")
    .replace(/[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g, "[REDACTED_JWT]")
    .replace(/\b(?:sbp|sb_secret|sk|pk)_[A-Za-z0-9_-]{12,}\b/gi, "[REDACTED_SECRET]")
    .replace(
      /\b(access[_-]?token|refresh[_-]?token|authorization|api[_-]?key)(\s*[:=]\s*)["']?[A-Za-z0-9._-]{8,}["']?/gi,
      "$1$2[REDACTED]"
    );
}

function durableStoreErrorText(error: unknown) {
  const fields =
    error && typeof error === "object"
      ? [
          (error as { message?: unknown }).message,
          (error as { details?: unknown }).details,
          (error as { hint?: unknown }).hint,
          (error as { code?: unknown }).code
        ]
      : [error];

  return redactScrimedWorkSensitiveText(
    fields
      .filter((field): field is string => typeof field === "string" && field.length > 0)
      .join(" ")
  );
}

export function scrimedWorkDurableStoreRpcFailure(error: unknown, fallbackCode: string) {
  const text = durableStoreErrorText(error);

  if (/idempotency-conflict/i.test(text)) {
    return {
      status: 409,
      code: "scrimed-work-idempotency-conflict",
      message: "The idempotency key has already been used for different SCRIMED Work metadata."
    };
  }

  if (/invalid-transition|history-conflict|lifecycle-action/i.test(text)) {
    return {
      status: 409,
      code: "scrimed-work-lifecycle-conflict",
      message: "The requested SCRIMED Work lifecycle transition conflicts with the authoritative durable session state."
    };
  }

  if (/qualified-clinical-reviewer|required-independent-reviewer|reviewer-role-required/i.test(text)) {
    return {
      status: 403,
      code: "scrimed-work-independent-review-required",
      message: "This approval requires a separately authorized reviewer with the required role."
    };
  }

  if (/aal2|mfa|governance-aal2-session-required/i.test(text)) {
    return {
      status: 403,
      code: "scrimed-work-aal2-required",
      message: "A fresh AAL2 governance session is required before SCRIMED Work durable mutations."
    };
  }

  if (/workspace.*denied|role-denied|membership|tenant/i.test(text)) {
    return {
      status: 403,
      code: "scrimed-work-role-denied",
      message: "The authenticated operator is not authorized for this tenant workspace."
    };
  }

  if (/server-authorization|required|token/i.test(text)) {
    return {
      status: 503,
      code: "scrimed-work-runtime-authorization-missing",
      message: "SCRIMED Work durable mutations require the server-held runtime authorization token."
    };
  }

  if (/prohibited|phi|credential|secret|identifier/i.test(text)) {
    return {
      status: 400,
      code: "scrimed-work-prohibited-content",
      message: "SCRIMED Work durable mutation was blocked by no-PHI/no-secret content guards."
    };
  }

  return {
    status: 503,
    code: fallbackCode,
    message: "SCRIMED Work durable store is unavailable or not yet approved in this environment."
  };
}
