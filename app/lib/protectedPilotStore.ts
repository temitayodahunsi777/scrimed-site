import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { AgentEvaluationRecord } from "./agentEvaluationWorkspace";
import type {
  PilotAuditEventRecord,
  PilotSessionRecord,
  PilotWorkspaceRecord,
  PilotWorkspaceRole,
  TenantIdentityProviderStatus,
  TenantInvitationDeliveryReadinessStatus,
  TenantAccessDashboard
} from "./protectedPilotWorkspace";
import type {
  TrustOSDecisionLedgerRecord,
  TrustOSReviewEventRecord,
  TrustOSReviewInput
} from "./trustOSDecisionLedger";
import type { TrustOSDecisionRecord } from "./trustOS";
import type {
  AgentWorkspaceGovernanceLedgerInput,
  AgentWorkspaceGovernanceLedgerRecord,
  AgentWorkspaceWorkOrderEventRecord,
  AgentWorkspaceWorkOrderInput,
  AgentWorkspaceWorkOrderRecord,
  AgentWorkspaceWorkOrderTransitionInput
} from "./persistentAgentWorkspace";

type AuthenticatedPilotContext =
  | {
      ok: true;
      client: SupabaseClient;
      user: User;
    }
  | {
      ok: false;
      status: 401 | 403 | 503;
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

type TrustOSDecisionRow = {
  id: string;
  workspace_id: string;
  pilot_session_id: string | null;
  decision_id: string;
  trace_id: string;
  policy_version: string;
  workflow: string;
  decision: TrustOSDecisionLedgerRecord["decision"];
  confidence: number;
  uncertainty: number;
  decision_record: TrustOSDecisionRecord;
  created_by: string;
  created_at: string;
};

type TrustOSReviewEventRow = {
  id: string;
  workspace_id: string;
  trustos_decision_id: string;
  actor_user_id: string;
  event_type: TrustOSReviewEventRecord["eventType"];
  disposition: TrustOSReviewEventRecord["disposition"];
  reason_code: TrustOSReviewEventRecord["reasonCode"];
  notes: string;
  outcome_metrics: TrustOSReviewEventRecord["outcomeMetrics"];
  created_at: string;
};

type AgentWorkspaceWorkOrderRow = {
  id: string;
  tenant_id: string;
  workspace_id: string;
  pilot_session_id: string | null;
  trustos_decision_id: string | null;
  work_order_type: AgentWorkspaceWorkOrderRecord["workOrderType"];
  state: AgentWorkspaceWorkOrderRecord["state"];
  objective: string;
  agent_owner: string;
  model_router_policy: string;
  trust_card: Record<string, unknown>;
  memory_scopes: string[];
  tool_scopes: string[];
  reviewer_checkpoints: string[];
  blocked_actions: string[];
  result_summary: string;
  outcome_metrics: Record<string, unknown>;
  failure_reason: string;
  retry_count: number;
  assigned_reviewer_id: string | null;
  created_by: string;
  updated_by: string;
  reviewed_by: string | null;
  closed_by: string | null;
  created_at: string;
  updated_at: string;
  review_due_at: string | null;
  reviewed_at: string | null;
  closed_at: string | null;
  boundary: string;
};

type AgentWorkspaceWorkOrderEventRow = {
  id: string;
  workspace_id: string;
  work_order_id: string;
  actor_user_id: string;
  event_type: AgentWorkspaceWorkOrderEventRecord["eventType"];
  prior_state: AgentWorkspaceWorkOrderEventRecord["priorState"];
  next_state: AgentWorkspaceWorkOrderEventRecord["nextState"];
  event_metadata: Record<string, unknown>;
  created_at: string;
};

type AgentWorkspaceGovernanceLedgerRow = {
  id: string;
  tenant_id: string;
  workspace_id: string;
  work_order_id: string | null;
  actor_user_id: string;
  action_type: AgentWorkspaceGovernanceLedgerRecord["actionType"];
  retention_until: string | null;
  legal_hold_until: string | null;
  incident_severity: AgentWorkspaceGovernanceLedgerRecord["incidentSeverity"];
  reason: string;
  event_metadata: Record<string, unknown>;
  boundary: string;
  created_at: string;
};

function getSupabaseConfiguration() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    publishableKey:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      "",
    salesOperationsToken: process.env.SCRIMED_PILOT_INTAKE_PERSISTENCE_TOKEN ?? ""
  };
}

export async function verifyProtectedPilotStore() {
  const configuration = getSupabaseConfiguration();

  if (!configuration.url || !configuration.publishableKey) {
    return {
      configured: false,
      verified: false,
      schemaVersion: null,
      detail: "Supabase runtime credentials are not configured."
    };
  }

  const client = createClient(configuration.url, configuration.publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    }
  });
  const { data, error } = await client.rpc("protected_pilot_runtime_status");
  const result = data && typeof data === "object" ? (data as Record<string, unknown>) : null;

  return {
    configured: true,
    verified: !error && result?.ready === true,
    schemaVersion: typeof result?.schemaVersion === "string" ? result.schemaVersion : null,
    detail:
      error?.message ??
      (result?.ready === true
        ? "Supabase Auth, Data API, and the protected pilot schema are reachable."
        : "Protected pilot schema verification did not return ready.")
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
        Authorization: `Bearer ${token}`,
        ...(configuration.salesOperationsToken
          ? { "x-scrimed-sales-operations-token": configuration.salesOperationsToken }
          : {})
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

function verifiedJwtClaims(token: string) {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function getAuthenticatedSalesContext(request: Request): Promise<AuthenticatedPilotContext> {
  const context = await getAuthenticatedPilotContext(request);

  if (!context.ok) {
    return context;
  }

  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  const claims = verifiedJwtClaims(token);

  if (claims?.aal !== "aal2") {
    return {
      ok: false,
      status: 403,
      code: "sales-operations-mfa-required",
      message: "Verify the enrolled authenticator factor before accessing tenant-admin sales operations."
    };
  }

  if (typeof claims.session_id !== "string" || !claims.session_id) {
    return {
      ok: false,
      status: 401,
      code: "sales-operations-session-invalid",
      message: "This tenant-admin session is missing the required identity-provider session binding."
    };
  }

  return context;
}

export async function getAuthenticatedGovernanceContext(
  request: Request
): Promise<AuthenticatedPilotContext> {
  const context = await getAuthenticatedPilotContext(request);

  if (!context.ok) {
    return context;
  }

  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  const claims = verifiedJwtClaims(token);

  if (claims?.aal !== "aal2") {
    return {
      ok: false,
      status: 403,
      code: "governance-mfa-required",
      message: "Verify the enrolled authenticator factor before accessing the TrustOS Decision Ledger."
    };
  }

  if (typeof claims.session_id !== "string" || !claims.session_id) {
    return {
      ok: false,
      status: 401,
      code: "governance-session-invalid",
      message: "This governance session is missing the required identity-provider session binding."
    };
  }

  return context;
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

function mapTrustOSDecision(row: TrustOSDecisionRow): TrustOSDecisionLedgerRecord {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    pilotSessionId: row.pilot_session_id,
    decisionId: row.decision_id,
    traceId: row.trace_id,
    policyVersion: row.policy_version,
    workflow: row.workflow,
    decision: row.decision,
    confidence: row.confidence,
    uncertainty: row.uncertainty,
    decisionRecord: row.decision_record,
    createdBy: row.created_by,
    createdAt: row.created_at
  };
}

function mapTrustOSReviewEvent(row: TrustOSReviewEventRow): TrustOSReviewEventRecord {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    trustOSDecisionId: row.trustos_decision_id,
    actorUserId: row.actor_user_id,
    eventType: row.event_type,
    disposition: row.disposition,
    reasonCode: row.reason_code,
    notes: row.notes,
    outcomeMetrics: row.outcome_metrics,
    createdAt: row.created_at
  };
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function mapAgentWorkspaceWorkOrder(row: AgentWorkspaceWorkOrderRow): AgentWorkspaceWorkOrderRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    pilotSessionId: row.pilot_session_id,
    trustOSDecisionId: row.trustos_decision_id,
    workOrderType: row.work_order_type,
    state: row.state,
    objective: row.objective,
    agentOwner: row.agent_owner,
    modelRouterPolicy: row.model_router_policy,
    trustCard: row.trust_card,
    memoryScopes: asStringArray(row.memory_scopes),
    toolScopes: asStringArray(row.tool_scopes),
    reviewerCheckpoints: asStringArray(row.reviewer_checkpoints),
    blockedActions: asStringArray(row.blocked_actions),
    resultSummary: row.result_summary,
    outcomeMetrics: row.outcome_metrics,
    failureReason: row.failure_reason,
    retryCount: row.retry_count,
    assignedReviewerId: row.assigned_reviewer_id,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    reviewedBy: row.reviewed_by,
    closedBy: row.closed_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reviewDueAt: row.review_due_at,
    reviewedAt: row.reviewed_at,
    closedAt: row.closed_at,
    boundary: row.boundary
  };
}

function mapAgentWorkspaceWorkOrderEvent(
  row: AgentWorkspaceWorkOrderEventRow
): AgentWorkspaceWorkOrderEventRecord {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    workOrderId: row.work_order_id,
    actorUserId: row.actor_user_id,
    eventType: row.event_type,
    priorState: row.prior_state,
    nextState: row.next_state,
    eventMetadata: row.event_metadata,
    createdAt: row.created_at
  };
}

function mapAgentWorkspaceGovernanceLedger(
  row: AgentWorkspaceGovernanceLedgerRow
): AgentWorkspaceGovernanceLedgerRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    workOrderId: row.work_order_id,
    actorUserId: row.actor_user_id,
    actionType: row.action_type,
    retentionUntil: row.retention_until,
    legalHoldUntil: row.legal_hold_until,
    incidentSeverity: row.incident_severity,
    reason: row.reason,
    eventMetadata: row.event_metadata,
    boundary: row.boundary,
    createdAt: row.created_at
  };
}

const workspaceSelect = "id, tenant_id, slug, name, status, boundary, created_at, pilot_tenants(name)";
const sessionSelect =
  "id, workspace_id, scenario_slug, status, boundary, evaluation, created_at, created_by";
const auditEventSelect =
  "id, workspace_id, session_id, actor_user_id, event_type, event_metadata, created_at";
const trustOSDecisionSelect =
  "id, workspace_id, pilot_session_id, decision_id, trace_id, policy_version, workflow, decision, confidence, uncertainty, decision_record, created_by, created_at";
const trustOSReviewEventSelect =
  "id, workspace_id, trustos_decision_id, actor_user_id, event_type, disposition, reason_code, notes, outcome_metrics, created_at";
const agentWorkspaceWorkOrderSelect =
  "id, tenant_id, workspace_id, pilot_session_id, trustos_decision_id, work_order_type, state, objective, agent_owner, model_router_policy, trust_card, memory_scopes, tool_scopes, reviewer_checkpoints, blocked_actions, result_summary, outcome_metrics, failure_reason, retry_count, assigned_reviewer_id, created_by, updated_by, reviewed_by, closed_by, created_at, updated_at, review_due_at, reviewed_at, closed_at, boundary";
const agentWorkspaceWorkOrderEventSelect =
  "id, workspace_id, work_order_id, actor_user_id, event_type, prior_state, next_state, event_metadata, created_at";
const agentWorkspaceGovernanceLedgerSelect =
  "id, tenant_id, workspace_id, work_order_id, actor_user_id, action_type, retention_until, legal_hold_until, incident_severity, reason, event_metadata, boundary, created_at";

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

export async function listTrustOSDecisions(client: SupabaseClient, workspaceId: string) {
  const { data, error } = await client
    .from("trustos_decisions")
    .select(trustOSDecisionSelect)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(250);

  return {
    decisions: ((data ?? []) as unknown as TrustOSDecisionRow[]).map(mapTrustOSDecision),
    error
  };
}

export async function getTrustOSDecision(
  client: SupabaseClient,
  workspaceId: string,
  decisionId: string
) {
  const { data, error } = await client
    .from("trustos_decisions")
    .select(trustOSDecisionSelect)
    .eq("workspace_id", workspaceId)
    .eq("id", decisionId)
    .maybeSingle();

  return {
    decision: data ? mapTrustOSDecision(data as unknown as TrustOSDecisionRow) : null,
    error
  };
}

export async function persistTrustOSDecision(
  client: SupabaseClient,
  workspaceSlug: string,
  decisionRecord: TrustOSDecisionRecord,
  workflow: string,
  pilotSessionId: string | null = null
) {
  const { data, error } = await client.rpc("create_trustos_decision", {
    p_workspace_slug: workspaceSlug,
    p_pilot_session_id: pilotSessionId,
    p_policy_version: "trustos-v1.0.0",
    p_workflow: workflow,
    p_decision: decisionRecord.decision,
    p_confidence: decisionRecord.confidence,
    p_uncertainty: decisionRecord.uncertainty,
    p_decision_record: decisionRecord
  });

  return {
    decisionId: typeof data === "string" ? data : null,
    error
  };
}

export async function listTrustOSReviewEvents(
  client: SupabaseClient,
  workspaceId: string,
  decisionId: string
) {
  const { data, error } = await client
    .from("trustos_review_events")
    .select(trustOSReviewEventSelect)
    .eq("workspace_id", workspaceId)
    .eq("trustos_decision_id", decisionId)
    .order("created_at", { ascending: false })
    .limit(250);

  return {
    events: ((data ?? []) as unknown as TrustOSReviewEventRow[]).map(mapTrustOSReviewEvent),
    error
  };
}

export async function recordTrustOSReviewEvent(
  client: SupabaseClient,
  workspaceSlug: string,
  decisionId: string,
  review: TrustOSReviewInput
) {
  return client.rpc("record_trustos_review_event", {
    p_workspace_slug: workspaceSlug,
    p_trustos_decision_id: decisionId,
    p_event_type: review.eventType,
    p_disposition: review.disposition,
    p_reason_code: review.reasonCode,
    p_notes: review.notes,
    p_outcome_metrics: review.outcomeMetrics
  });
}

export async function recordTrustOSGovernancePacketDownload(
  client: SupabaseClient,
  workspaceSlug: string,
  decisionId: string
) {
  return client.rpc("record_trustos_review_event", {
    p_workspace_slug: workspaceSlug,
    p_trustos_decision_id: decisionId,
    p_event_type: "governance-packet-downloaded",
    p_disposition: "noted",
    p_reason_code: "packet-export",
    p_notes: "",
    p_outcome_metrics: {}
  });
}

export async function listAgentWorkspaceWorkOrders(client: SupabaseClient, workspaceId: string) {
  const { data, error } = await client
    .from("agent_workspace_work_orders")
    .select(agentWorkspaceWorkOrderSelect)
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false })
    .limit(250);

  return {
    workOrders: ((data ?? []) as unknown as AgentWorkspaceWorkOrderRow[]).map(mapAgentWorkspaceWorkOrder),
    error
  };
}

export async function getAgentWorkspaceWorkOrder(
  client: SupabaseClient,
  workspaceId: string,
  workOrderId: string
) {
  const { data, error } = await client
    .from("agent_workspace_work_orders")
    .select(agentWorkspaceWorkOrderSelect)
    .eq("workspace_id", workspaceId)
    .eq("id", workOrderId)
    .maybeSingle();

  return {
    workOrder: data ? mapAgentWorkspaceWorkOrder(data as unknown as AgentWorkspaceWorkOrderRow) : null,
    error
  };
}

export async function listAgentWorkspaceWorkOrderEvents(
  client: SupabaseClient,
  workspaceId: string,
  workOrderId: string
) {
  const { data, error } = await client
    .from("agent_workspace_work_order_events")
    .select(agentWorkspaceWorkOrderEventSelect)
    .eq("workspace_id", workspaceId)
    .eq("work_order_id", workOrderId)
    .order("created_at", { ascending: false })
    .limit(250);

  return {
    events: ((data ?? []) as unknown as AgentWorkspaceWorkOrderEventRow[]).map(
      mapAgentWorkspaceWorkOrderEvent
    ),
    error
  };
}

export async function createAgentWorkspaceWorkOrder(
  client: SupabaseClient,
  workspaceSlug: string,
  input: AgentWorkspaceWorkOrderInput
) {
  const { data, error } = await client.rpc("create_agent_workspace_work_order", {
    p_workspace_slug: workspaceSlug,
    p_work_order_type: input.workOrderType,
    p_objective: input.objective,
    p_agent_owner: input.agentOwner,
    p_model_router_policy: input.modelRouterPolicy,
    p_memory_scopes: input.memoryScopes,
    p_tool_scopes: input.toolScopes,
    p_reviewer_checkpoints: input.reviewerCheckpoints,
    p_blocked_actions: input.blockedActions,
    p_trust_card: input.trustCard,
    p_pilot_session_id: input.pilotSessionId,
    p_trustos_decision_id: input.trustOSDecisionId
  });

  return {
    workOrderId: typeof data === "string" ? data : null,
    error
  };
}

export async function transitionAgentWorkspaceWorkOrder(
  client: SupabaseClient,
  workspaceSlug: string,
  workOrderId: string,
  input: AgentWorkspaceWorkOrderTransitionInput
) {
  const { data, error } = await client.rpc("transition_agent_workspace_work_order", {
    p_workspace_slug: workspaceSlug,
    p_work_order_id: workOrderId,
    p_next_state: input.nextState,
    p_event_type: input.eventType,
    p_event_metadata: input.eventMetadata,
    p_result_summary: input.resultSummary,
    p_outcome_metrics: input.outcomeMetrics,
    p_failure_reason: input.failureReason,
    p_assigned_reviewer_id: input.assignedReviewerId
  });

  return {
    eventId: typeof data === "string" ? data : null,
    error
  };
}

export async function recordAgentWorkspaceWorkOrderProofPacketDownload(
  client: SupabaseClient,
  workspaceSlug: string,
  workOrderId: string
) {
  const { data, error } = await client.rpc("record_agent_workspace_work_order_proof_packet_download", {
    p_workspace_slug: workspaceSlug,
    p_work_order_id: workOrderId,
    p_event_metadata: {
      packetType: "agent-work-order-proof-packet",
      format: "text/markdown",
      syntheticOnly: true
    }
  });

  return {
    eventId: typeof data === "string" ? data : null,
    error
  };
}

export async function listAgentWorkspaceGovernanceLedger(client: SupabaseClient, workspaceId: string) {
  const { data, error } = await client
    .from("agent_workspace_governance_ledger")
    .select(agentWorkspaceGovernanceLedgerSelect)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(250);

  return {
    ledgerRecords: ((data ?? []) as unknown as AgentWorkspaceGovernanceLedgerRow[]).map(
      mapAgentWorkspaceGovernanceLedger
    ),
    error
  };
}

export async function recordAgentWorkspaceGovernanceLedger(
  client: SupabaseClient,
  workspaceSlug: string,
  input: AgentWorkspaceGovernanceLedgerInput
) {
  const { data, error } = await client.rpc("record_agent_workspace_governance_ledger", {
    p_workspace_slug: workspaceSlug,
    p_action_type: input.actionType,
    p_reason: input.reason,
    p_work_order_id: input.workOrderId,
    p_retention_until: input.retentionUntil,
    p_legal_hold_until: input.legalHoldUntil,
    p_incident_severity: input.incidentSeverity,
    p_event_metadata: input.eventMetadata
  });

  return {
    ledgerId: typeof data === "string" ? data : null,
    error
  };
}

export async function getTenantAccessDashboard(client: SupabaseClient, workspaceSlug: string) {
  const { data, error } = await client.rpc("tenant_access_dashboard", {
    p_workspace_slug: workspaceSlug
  });

  return {
    dashboard: data ? (data as TenantAccessDashboard) : null,
    error
  };
}

export async function updateTenantMembershipRole(
  client: SupabaseClient,
  workspaceSlug: string,
  userId: string,
  role: PilotWorkspaceRole
) {
  const { data, error } = await client.rpc("update_pilot_membership_role", {
    p_workspace_slug: workspaceSlug,
    p_target_user_id: userId,
    p_role: role
  });

  return {
    membership: data && typeof data === "object" ? (data as Record<string, unknown>) : null,
    error
  };
}

export async function createTenantAccessInvitation(
  client: SupabaseClient,
  workspaceSlug: string,
  email: string,
  role: PilotWorkspaceRole,
  expiresAt: string | null,
  note: string
) {
  const { data, error } = await client.rpc("create_pilot_access_invitation", {
    p_workspace_slug: workspaceSlug,
    p_email: email,
    p_role: role,
    p_expires_at: expiresAt,
    p_note: note
  });

  return {
    invitation: data && typeof data === "object" ? (data as Record<string, unknown>) : null,
    error
  };
}

export async function cancelTenantAccessInvitation(
  client: SupabaseClient,
  workspaceSlug: string,
  invitationId: string,
  reason: string
) {
  const { data, error } = await client.rpc("cancel_pilot_access_invitation", {
    p_workspace_slug: workspaceSlug,
    p_invitation_id: invitationId,
    p_reason: reason
  });

  return {
    invitation: data && typeof data === "object" ? (data as Record<string, unknown>) : null,
    error
  };
}

export async function activateTenantAccessInvitation(
  client: SupabaseClient,
  workspaceSlug: string,
  invitationId: string
) {
  const { data, error } = await client.rpc("activate_pilot_invitation_for_existing_user", {
    p_workspace_slug: workspaceSlug,
    p_invitation_id: invitationId
  });

  return {
    membership: data && typeof data === "object" ? (data as Record<string, unknown>) : null,
    error
  };
}

export async function recordTenantInvitationPacketDownload(
  client: SupabaseClient,
  workspaceSlug: string,
  invitationId: string
) {
  const { data, error } = await client.rpc("record_pilot_invitation_packet_download", {
    p_workspace_slug: workspaceSlug,
    p_invitation_id: invitationId
  });

  return {
    packet: data && typeof data === "object" ? (data as Record<string, unknown>) : null,
    error
  };
}

export async function recordTenantActivationProofPacketDownload(
  client: SupabaseClient,
  workspaceSlug: string
) {
  const { data, error } = await client.rpc("record_tenant_activation_proof_packet_download", {
    p_workspace_slug: workspaceSlug
  });

  return {
    packet: data && typeof data === "object" ? (data as Record<string, unknown>) : null,
    error
  };
}

export async function prepareTenantInvitationDelivery(
  client: SupabaseClient,
  workspaceSlug: string,
  invitationId: string,
  note: string
) {
  const { data, error } = await client.rpc("prepare_pilot_invitation_delivery", {
    p_workspace_slug: workspaceSlug,
    p_invitation_id: invitationId,
    p_note: note
  });

  return {
    delivery: data && typeof data === "object" ? (data as Record<string, unknown>) : null,
    error
  };
}

export async function deactivateTenantMembership(
  client: SupabaseClient,
  workspaceSlug: string,
  userId: string,
  reason: string
) {
  const { data, error } = await client.rpc("deactivate_pilot_membership", {
    p_workspace_slug: workspaceSlug,
    p_target_user_id: userId,
    p_reason: reason
  });

  return {
    membership: data && typeof data === "object" ? (data as Record<string, unknown>) : null,
    error
  };
}

export async function reactivateTenantMembership(
  client: SupabaseClient,
  workspaceSlug: string,
  userId: string
) {
  const { data, error } = await client.rpc("reactivate_pilot_membership", {
    p_workspace_slug: workspaceSlug,
    p_target_user_id: userId
  });

  return {
    membership: data && typeof data === "object" ? (data as Record<string, unknown>) : null,
    error
  };
}

export async function attestTenantAccessReview(
  client: SupabaseClient,
  workspaceSlug: string,
  notes: string
) {
  const { data, error } = await client.rpc("attest_pilot_access_review", {
    p_workspace_slug: workspaceSlug,
    p_notes: notes
  });

  return {
    review: data && typeof data === "object" ? (data as Record<string, unknown>) : null,
    error
  };
}

export async function updateTenantIdentityReadiness(
  client: SupabaseClient,
  workspaceSlug: string,
  identityProviderStatus: TenantIdentityProviderStatus,
  ssoProvider: string,
  ssoDomain: string,
  notes: string
) {
  const { data, error } = await client.rpc("update_tenant_identity_readiness", {
    p_workspace_slug: workspaceSlug,
    p_identity_provider_status: identityProviderStatus,
    p_sso_provider: ssoProvider,
    p_sso_domain: ssoDomain,
    p_notes: notes
  });

  return {
    identityReadiness: data && typeof data === "object" ? (data as Record<string, unknown>) : null,
    error
  };
}

export async function updateTenantInvitationDeliveryReadiness(
  client: SupabaseClient,
  workspaceSlug: string,
  deliveryStatus: TenantInvitationDeliveryReadinessStatus,
  smtpProvider: string,
  smtpFromDomain: string,
  notes: string
) {
  const { data, error } = await client.rpc("update_tenant_invitation_delivery_readiness", {
    p_workspace_slug: workspaceSlug,
    p_delivery_status: deliveryStatus,
    p_smtp_provider: smtpProvider,
    p_smtp_from_domain: smtpFromDomain,
    p_notes: notes
  });

  return {
    deliveryReadiness: data && typeof data === "object" ? (data as Record<string, unknown>) : null,
    error
  };
}
