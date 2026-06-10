import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { AgentEvaluationRecord } from "./agentEvaluationWorkspace";
import type {
  PilotAuditEventRecord,
  PilotSessionRecord,
  PilotWorkspaceRecord
} from "./protectedPilotWorkspace";

type AuthenticatedPilotContext =
  | {
      ok: true;
      client: SupabaseClient;
      user: User;
    }
  | {
      ok: false;
      status: 401 | 503;
      code: string;
      message: string;
    };

type WorkspaceRow = {
  id: string;
  tenant_id: string;
  slug: string;
  name: string;
  status: PilotWorkspaceRecord["status"];
  boundary: string;
  created_at: string;
  pilot_tenants: { name: string } | Array<{ name: string }> | null;
};

type SessionRow = {
  id: string;
  workspace_id: string;
  scenario_slug: string;
  status: string;
  boundary: string;
  evaluation: AgentEvaluationRecord;
  created_at: string;
  created_by: string;
};

type AuditEventRow = {
  id: string;
  workspace_id: string;
  session_id: string | null;
  actor_user_id: string;
  event_type: string;
  event_metadata: Record<string, unknown>;
  created_at: string;
};

function getSupabaseConfiguration() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    publishableKey:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      ""
  };
}

export async function getAuthenticatedPilotContext(request: Request): Promise<AuthenticatedPilotContext> {
  const configuration = getSupabaseConfiguration();

  if (!configuration.url || !configuration.publishableKey) {
    return {
      ok: false,
      status: 503,
      code: "protected-pilot-infrastructure-not-configured",
      message:
        "Protected pilot identity and durable storage are not connected. Provision Supabase, apply the migration, and configure the publishable runtime credentials."
    };
  }

  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";

  if (!token) {
    return {
      ok: false,
      status: 401,
      code: "authentication-required",
      message: "A valid tenant member bearer token is required."
    };
  }

  const client = createClient(configuration.url, configuration.publishableKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    },
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    }
  });
  const { data, error } = await client.auth.getUser(token);

  if (error || !data.user) {
    return {
      ok: false,
      status: 401,
      code: "invalid-authentication",
      message: "The identity provider did not verify this tenant member session."
    };
  }

  return {
    ok: true,
    client,
    user: data.user
  };
}

function tenantName(row: WorkspaceRow) {
  if (Array.isArray(row.pilot_tenants)) {
    return row.pilot_tenants[0]?.name ?? "Tenant";
  }

  return row.pilot_tenants?.name ?? "Tenant";
}

function mapWorkspace(row: WorkspaceRow): PilotWorkspaceRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    tenantName: tenantName(row),
    slug: row.slug,
    name: row.name,
    status: row.status,
    boundary: row.boundary,
    createdAt: row.created_at
  };
}

function mapSession(row: SessionRow): PilotSessionRecord {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    scenarioSlug: row.scenario_slug,
    status: row.status,
    boundary: row.boundary,
    evaluation: row.evaluation,
    createdAt: row.created_at,
    createdBy: row.created_by
  };
}

function mapAuditEvent(row: AuditEventRow): PilotAuditEventRecord {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    sessionId: row.session_id,
    actorUserId: row.actor_user_id,
    eventType: row.event_type,
    eventMetadata: row.event_metadata,
    createdAt: row.created_at
  };
}

const workspaceSelect = "id, tenant_id, slug, name, status, boundary, created_at, pilot_tenants(name)";
const sessionSelect =
  "id, workspace_id, scenario_slug, status, boundary, evaluation, created_at, created_by";
const auditEventSelect =
  "id, workspace_id, session_id, actor_user_id, event_type, event_metadata, created_at";

export async function listAccessiblePilotWorkspaces(client: SupabaseClient) {
  const { data, error } = await client.from("pilot_workspaces").select(workspaceSelect).order("created_at");

  return {
    workspaces: ((data ?? []) as unknown as WorkspaceRow[]).map(mapWorkspace),
    error
  };
}

export async function getAccessiblePilotWorkspace(client: SupabaseClient, workspaceSlug: string) {
  const { data, error } = await client
    .from("pilot_workspaces")
    .select(workspaceSelect)
    .eq("slug", workspaceSlug)
    .maybeSingle();

  return {
    workspace: data ? mapWorkspace(data as unknown as WorkspaceRow) : null,
    error
  };
}

export async function listPilotSessions(client: SupabaseClient, workspaceId: string) {
  const { data, error } = await client
    .from("pilot_demo_sessions")
    .select(sessionSelect)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  return {
    sessions: ((data ?? []) as unknown as SessionRow[]).map(mapSession),
    error
  };
}

export async function getPilotSession(client: SupabaseClient, workspaceId: string, sessionId: string) {
  const { data, error } = await client
    .from("pilot_demo_sessions")
    .select(sessionSelect)
    .eq("workspace_id", workspaceId)
    .eq("id", sessionId)
    .maybeSingle();

  return {
    session: data ? mapSession(data as unknown as SessionRow) : null,
    error
  };
}

export async function listPilotAuditEvents(client: SupabaseClient, workspaceId: string) {
  const { data, error } = await client
    .from("pilot_audit_events")
    .select(auditEventSelect)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(250);

  return {
    events: ((data ?? []) as unknown as AuditEventRow[]).map(mapAuditEvent),
    error
  };
}

export async function persistPilotSession(
  client: SupabaseClient,
  workspaceSlug: string,
  evaluation: AgentEvaluationRecord
) {
  const { data, error } = await client.rpc("create_pilot_demo_session", {
    p_workspace_slug: workspaceSlug,
    p_scenario_slug: evaluation.scenario.slug,
    p_status: evaluation.status,
    p_boundary: evaluation.boundary,
    p_evaluation: evaluation
  });

  return {
    sessionId: typeof data === "string" ? data : null,
    error
  };
}

export async function recordProofPacketDownload(
  client: SupabaseClient,
  workspace: PilotWorkspaceRecord,
  session: PilotSessionRecord,
  actorUserId: string
) {
  return client.rpc("record_pilot_proof_packet_download", {
    p_workspace_slug: workspace.slug,
    p_session_id: session.id,
    p_event_metadata: {
      actorUserId,
      format: "text/markdown",
      syntheticOnly: true
    }
  });
}
