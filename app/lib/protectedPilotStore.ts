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
import type {
  DurableTrustSafetyIncidentEventRecord,
  DurableTrustSafetyIncidentRecord,
  TrustSafetyIncidentCreateInput,
  TrustSafetyIncidentUpdateInput
} from "./trustSafetyOperations";
import type {
  PilotDemoReadinessSnapshotRecord,
  PilotDemoReadinessSummary,
  TenantSessionVerificationReadiness
} from "./pilotDemoReadiness";
import type {
  QaManualRunEvidenceInput,
  QaManualRunEvidencePacketRecord
} from "./qaEvidenceLedger";
import type {
  CommandIntelligenceHubSummary,
  CommandIntelligenceMetric,
  CommandIntelligenceSnapshotRecord,
  CommandIntelligenceState,
  CommandIntelligenceWorkstream,
  CommandEvaluationGate,
  CommandNextAction,
  CommandSafeModeControl,
  CommandToolAccessPlan,
  CommandTrustEngineOutput
} from "./commandIntelligenceHub";
import type {
  ClinicalActivationApprovalRecord,
  ClinicalActivationApprovalStatus
} from "./clinicalActivationApprovals";
import type {
  ProtectedOperatorMetricInput,
  ProtectedOperatorMetricKey,
  ProtectedOperatorMetricRecord,
  ProtectedOperatorMetricUnit
} from "./protectedOperatorMetrics";
import type {
  ProtectedMetricRollupInput,
  ProtectedMetricRollupRecord,
  ProtectedMetricRollupTotal
} from "./protectedMetricRollups";
import type {
  ProtectedMetricTrendMetric,
  ProtectedMetricTrendReviewInput,
  ProtectedMetricTrendReviewRecord
} from "./protectedMetricTrends";
import type {
  ProtectedBoardBuyerSegmentCohort,
  ProtectedBoardFinanceAllocationProfile,
  ProtectedBoardScorecardInput,
  ProtectedBoardScorecardMetricSummary,
  ProtectedBoardScorecardRecord
} from "./protectedBoardScorecards";
import type {
  ProtectedFinanceMethodologyGateId,
  ProtectedFinanceMethodologyGateRecord,
  ProtectedFinanceMethodologyGateStatus,
  ProtectedFinanceMethodologyInput
} from "./protectedFinanceMethodology";
import type {
  ProtectedExternalApprovalEvidenceDomainId,
  ProtectedExternalApprovalEvidenceInput,
  ProtectedExternalApprovalEvidenceRecord,
  ProtectedExternalApprovalEvidenceReferenceStatus,
  ProtectedExternalApprovalEvidenceSystem
} from "./protectedExternalApprovalEvidence";

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

type QaManualRunEvidencePacketRow = {
  id: string;
  tenant_id: string;
  workspace_id: string;
  workflow_run_id: string;
  workflow_run_url: string;
  executed_at: string;
  base_url: string;
  intake_id: string;
  created_session_id: string;
  packet_audit_event_id: string;
  qa_outcome: QaManualRunEvidenceInput["qaOutcome"];
  operator_attestation: QaManualRunEvidenceInput["operatorAttestation"];
  token_disposal_attestation: QaManualRunEvidenceInput["tokenDisposalAttestation"];
  data_boundary: QaManualRunEvidenceInput["dataBoundary"];
  packet_markdown: string;
  packet_sha256: string;
  created_by: string;
  created_at: string;
  boundary: string;
};

type PilotDemoReadinessSnapshotRow = {
  id: string;
  tenant_id: string;
  workspace_id: string;
  readiness_state: PilotDemoReadinessSnapshotRecord["readinessState"];
  readiness_score: number;
  passed_count: number;
  review_count: number;
  blocked_count: number;
  required_actions: string[];
  buyer_brief: string[];
  check_results: unknown;
  runbook: unknown;
  verification: unknown;
  evidence_counts: unknown;
  snapshot: unknown;
  last_evidence_at: string | null;
  boundary: string;
  created_by: string;
  created_at: string;
};

type CommandIntelligenceSnapshotRow = {
  id: string;
  tenant_id: string;
  workspace_id: string;
  command_state: CommandIntelligenceState;
  command_score: number;
  buyer_room_state: CommandIntelligenceState;
  buyer_room_score: number;
  agent_commander_status: CommandIntelligenceState;
  workstream_count: number;
  trust_output_count: number;
  evaluation_gate_count: number;
  tool_access_plan_count: number;
  safe_mode_control_count: number;
  next_action_count: number;
  evidence_counts: unknown;
  metrics: unknown;
  workstreams: unknown;
  trust_engine_outputs: unknown;
  evaluation_pipeline: unknown;
  tool_access_plans: unknown;
  safe_mode_controls: unknown;
  next_actions: unknown;
  limitations: unknown;
  observability: unknown;
  snapshot: unknown;
  last_evidence_at: string | null;
  operator_attestation: CommandIntelligenceSnapshotRecord["operatorAttestation"];
  boundary: string;
  created_by: string;
  created_at: string;
};

type ClinicalActivationApprovalRow = {
  id: string;
  tenant_id: string;
  workspace_id: string;
  domain_id: string;
  domain_label: string;
  approval_status: ClinicalActivationApprovalStatus;
  approval_scope: ClinicalActivationApprovalRecord["approvalScope"];
  reviewer_role: string;
  attestation: ClinicalActivationApprovalRecord["attestation"];
  evidence_snapshot: Record<string, unknown>;
  retained_blockers: string[];
  no_phi_attestation: boolean;
  clinical_go_live_authority: ClinicalActivationApprovalRecord["clinicalGoLiveAuthority"];
  signed_by: string;
  signed_at: string;
  created_at: string;
  boundary: string;
};

type ProtectedOperatorMetricRow = {
  id: string;
  tenant_id: string;
  workspace_id: string;
  metric_key: ProtectedOperatorMetricKey;
  metric_label: string;
  metric_unit: ProtectedOperatorMetricUnit;
  metric_value: number | string;
  public_market_kpi_id: string;
  workflow_key: string;
  measurement_window_start: string;
  measurement_window_end: string;
  source_route: string;
  evidence_reference: string;
  operator_attestation: ProtectedOperatorMetricInput["operatorAttestation"];
  data_boundary: ProtectedOperatorMetricInput["dataBoundary"];
  financial_reporting_authority: ProtectedOperatorMetricRecord["financialReportingAuthority"];
  securities_authority: ProtectedOperatorMetricRecord["securitiesAuthority"];
  created_by: string;
  created_at: string;
  boundary: string;
};

type ProtectedMetricRollupSnapshotRow = {
  id: string;
  tenant_id: string;
  workspace_id: string;
  reporting_period_start: string;
  reporting_period_end: string;
  metric_count: number;
  captured_metric_types: number;
  required_metric_types: number;
  ready_for_board_review: boolean;
  model_cost_usd: number | string;
  model_cost_per_workflow: number | string | null;
  review_time_minutes: number | string;
  review_minutes_per_workflow: number | string | null;
  delivery_hours: number | string;
  delivery_hours_per_workflow: number | string | null;
  proof_packet_count: number | string;
  proof_packets_per_workflow: number | string | null;
  workflow_volume: number | string;
  cost_per_workflow: number | string | null;
  totals: unknown;
  recommendations: unknown;
  limitations: unknown;
  reviewer_attestation: ProtectedMetricRollupRecord["reviewerAttestation"];
  review_note: string;
  data_boundary: ProtectedMetricRollupRecord["dataBoundary"];
  financial_reporting_authority: ProtectedMetricRollupRecord["financialReportingAuthority"];
  securities_authority: ProtectedMetricRollupRecord["securitiesAuthority"];
  clinical_execution_authority: ProtectedMetricRollupRecord["clinicalExecutionAuthority"];
  created_by: string;
  created_at: string;
  boundary: string;
};

type ProtectedMetricTrendReviewRow = {
  id: string;
  tenant_id: string;
  workspace_id: string;
  current_snapshot_id: string;
  comparison_snapshot_id: string;
  trend_period_label: string;
  board_trend_state: ProtectedMetricTrendReviewRecord["boardTrendState"];
  trend_metrics: unknown;
  reach_expansion_signals: unknown;
  competitive_advantages: unknown;
  agent_improvement_actions: unknown;
  recommendations: unknown;
  limitations: unknown;
  reviewer_attestation: ProtectedMetricTrendReviewRecord["reviewerAttestation"];
  review_note: string;
  data_boundary: ProtectedMetricTrendReviewRecord["dataBoundary"];
  cost_allocation_policy: ProtectedMetricTrendReviewRecord["costAllocationPolicy"];
  cost_allocation_status: ProtectedMetricTrendReviewRecord["costAllocationStatus"];
  financial_reporting_authority: ProtectedMetricTrendReviewRecord["financialReportingAuthority"];
  securities_authority: ProtectedMetricTrendReviewRecord["securitiesAuthority"];
  clinical_execution_authority: ProtectedMetricTrendReviewRecord["clinicalExecutionAuthority"];
  created_by: string;
  created_at: string;
  boundary: string;
};

type ProtectedBoardScorecardRow = {
  id: string;
  tenant_id: string;
  workspace_id: string;
  primary_trend_review_id: string;
  secondary_trend_review_id: string | null;
  tertiary_trend_review_id: string | null;
  board_period_label: string;
  scorecard_state: ProtectedBoardScorecardRecord["scorecardState"];
  trend_review_count: number;
  rolling_quarter_metrics: unknown;
  finance_allocation_profile: unknown;
  buyer_segment_focus: ProtectedBoardScorecardRecord["buyerSegmentFocus"];
  buyer_segment_cohorts: unknown;
  competitive_advantages: unknown;
  agent_improvement_priorities: unknown;
  strategic_actions: unknown;
  recommendations: unknown;
  limitations: unknown;
  operator_attestation: ProtectedBoardScorecardRecord["operatorAttestation"];
  review_note: string;
  data_boundary: ProtectedBoardScorecardRecord["dataBoundary"];
  allocation_profile_status: ProtectedBoardScorecardRecord["allocationProfileStatus"];
  financial_reporting_authority: ProtectedBoardScorecardRecord["financialReportingAuthority"];
  securities_authority: ProtectedBoardScorecardRecord["securitiesAuthority"];
  clinical_execution_authority: ProtectedBoardScorecardRecord["clinicalExecutionAuthority"];
  created_by: string;
  created_at: string;
  boundary: string;
};

type ProtectedFinanceMethodologyGateRow = {
  id: string;
  tenant_id: string;
  workspace_id: string;
  board_scorecard_id: string | null;
  gate_id: ProtectedFinanceMethodologyGateId;
  gate_label: string;
  gate_status: Exclude<ProtectedFinanceMethodologyGateStatus, "not-recorded">;
  approval_scope: ProtectedFinanceMethodologyGateRecord["approvalScope"];
  reviewer_role: string;
  evidence_snapshot: unknown;
  retained_blockers: unknown;
  methodology_components: unknown;
  external_use_restrictions: unknown;
  attestation: ProtectedFinanceMethodologyGateRecord["attestation"];
  review_note: string;
  data_boundary: ProtectedFinanceMethodologyGateRecord["dataBoundary"];
  methodology_authority: ProtectedFinanceMethodologyGateRecord["methodologyAuthority"];
  external_use_authority: ProtectedFinanceMethodologyGateRecord["externalUseAuthority"];
  financial_reporting_authority: ProtectedFinanceMethodologyGateRecord["financialReportingAuthority"];
  securities_authority: ProtectedFinanceMethodologyGateRecord["securitiesAuthority"];
  advertising_claims_authority: ProtectedFinanceMethodologyGateRecord["advertisingClaimsAuthority"];
  clinical_execution_authority: ProtectedFinanceMethodologyGateRecord["clinicalExecutionAuthority"];
  signed_by: string;
  signed_at: string;
  created_at: string;
  boundary: string;
};

type ProtectedExternalApprovalEvidenceRow = {
  id: string;
  tenant_id: string;
  workspace_id: string;
  finance_gate_record_id: string | null;
  domain_id: ProtectedExternalApprovalEvidenceDomainId;
  domain_label: string;
  reference_status: Exclude<ProtectedExternalApprovalEvidenceReferenceStatus, "not-recorded">;
  approval_scope: ProtectedExternalApprovalEvidenceRecord["approvalScope"];
  external_reference_label: string;
  external_system: ProtectedExternalApprovalEvidenceSystem;
  reference_locator: string;
  reference_owner: string;
  evidence_retained_externally: boolean;
  evidence_snapshot: unknown;
  retained_blockers: unknown;
  release_restrictions: unknown;
  attestation: ProtectedExternalApprovalEvidenceRecord["attestation"];
  review_note: string;
  data_boundary: ProtectedExternalApprovalEvidenceRecord["dataBoundary"];
  evidence_authority: ProtectedExternalApprovalEvidenceRecord["evidenceAuthority"];
  storage_authority: ProtectedExternalApprovalEvidenceRecord["storageAuthority"];
  release_authority: ProtectedExternalApprovalEvidenceRecord["releaseAuthority"];
  financial_reporting_authority: ProtectedExternalApprovalEvidenceRecord["financialReportingAuthority"];
  securities_authority: ProtectedExternalApprovalEvidenceRecord["securitiesAuthority"];
  advertising_claims_authority: ProtectedExternalApprovalEvidenceRecord["advertisingClaimsAuthority"];
  clinical_execution_authority: ProtectedExternalApprovalEvidenceRecord["clinicalExecutionAuthority"];
  recorded_by: string;
  recorded_at: string;
  created_at: string;
  boundary: string;
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

type TrustSafetyIncidentRow = {
  id: string;
  tenantId?: string;
  tenant_id?: string;
  workspaceId?: string;
  workspace_id?: string;
  incidentKey?: string;
  incident_key?: string;
  title: string;
  severity: DurableTrustSafetyIncidentRecord["severity"];
  status: DurableTrustSafetyIncidentRecord["status"];
  owner: string;
  accountableAgent?: string;
  accountable_agent?: string;
  sourceChannel?: string;
  source_channel?: string;
  affectedSurface?: string[];
  affected_surface?: string[];
  triggerSignal?: string;
  trigger_signal?: string;
  buyerImpact?: string;
  buyer_impact?: string;
  containmentAction?: string;
  containment_action?: string;
  remediationPlan?: string;
  remediation_plan?: string;
  legalHoldStatus?: DurableTrustSafetyIncidentRecord["legalHoldStatus"];
  legal_hold_status?: DurableTrustSafetyIncidentRecord["legalHoldStatus"];
  notificationDecision?: DurableTrustSafetyIncidentRecord["notificationDecision"];
  notification_decision?: DurableTrustSafetyIncidentRecord["notificationDecision"];
  notificationReason?: string;
  notification_reason?: string;
  postIncidentReviewStatus?: DurableTrustSafetyIncidentRecord["postIncidentReviewStatus"];
  post_incident_review_status?: DurableTrustSafetyIncidentRecord["postIncidentReviewStatus"];
  retentionUntil?: string | null;
  retention_until?: string | null;
  legalHoldUntil?: string | null;
  legal_hold_until?: string | null;
  eventMetadata?: Record<string, unknown>;
  event_metadata?: Record<string, unknown>;
  boundary: string;
  createdBy?: string;
  created_by?: string;
  updatedBy?: string;
  updated_by?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  closedAt?: string | null;
  closed_at?: string | null;
};

type TrustSafetyIncidentEventRow = {
  id: string;
  tenantId?: string;
  tenant_id?: string;
  workspaceId?: string;
  workspace_id?: string;
  incidentId?: string;
  incident_id?: string;
  actorUserId?: string;
  actor_user_id?: string;
  eventType?: DurableTrustSafetyIncidentEventRecord["eventType"];
  event_type?: DurableTrustSafetyIncidentEventRecord["eventType"];
  priorStatus?: DurableTrustSafetyIncidentEventRecord["priorStatus"];
  prior_status?: DurableTrustSafetyIncidentEventRecord["priorStatus"];
  nextStatus?: DurableTrustSafetyIncidentEventRecord["nextStatus"];
  next_status?: DurableTrustSafetyIncidentEventRecord["nextStatus"];
  priorLegalHoldStatus?: DurableTrustSafetyIncidentEventRecord["priorLegalHoldStatus"];
  prior_legal_hold_status?: DurableTrustSafetyIncidentEventRecord["priorLegalHoldStatus"];
  nextLegalHoldStatus?: DurableTrustSafetyIncidentEventRecord["nextLegalHoldStatus"];
  next_legal_hold_status?: DurableTrustSafetyIncidentEventRecord["nextLegalHoldStatus"];
  priorNotificationDecision?: DurableTrustSafetyIncidentEventRecord["priorNotificationDecision"];
  prior_notification_decision?: DurableTrustSafetyIncidentEventRecord["priorNotificationDecision"];
  nextNotificationDecision?: DurableTrustSafetyIncidentEventRecord["nextNotificationDecision"];
  next_notification_decision?: DurableTrustSafetyIncidentEventRecord["nextNotificationDecision"];
  eventSummary?: string;
  event_summary?: string;
  eventMetadata?: Record<string, unknown>;
  event_metadata?: Record<string, unknown>;
  boundary: string;
  createdAt?: string;
  created_at?: string;
};

type TrustSafetyIncidentDashboardPayload = {
  tenantId: string;
  tenantName: string;
  workspaceId: string;
  workspaceSlug: string;
  workspaceName: string;
  actorUserId: string;
  incidents: TrustSafetyIncidentRow[];
  events: TrustSafetyIncidentEventRow[];
  security: Record<string, unknown>;
  boundary: string;
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

function mapQaManualRunEvidencePacket(
  row: QaManualRunEvidencePacketRow
): QaManualRunEvidencePacketRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    workflowRunId: row.workflow_run_id,
    workflowRunUrl: row.workflow_run_url,
    executedAt: row.executed_at,
    baseUrl: row.base_url,
    intakeId: row.intake_id,
    createdSessionId: row.created_session_id,
    packetAuditEventId: row.packet_audit_event_id,
    qaOutcome: row.qa_outcome,
    operatorAttestation: row.operator_attestation,
    tokenDisposalAttestation: row.token_disposal_attestation,
    dataBoundary: row.data_boundary,
    packetMarkdown: row.packet_markdown,
    packetSha256: row.packet_sha256,
    createdBy: row.created_by,
    createdAt: row.created_at,
    boundary: row.boundary
  };
}

function mapClinicalActivationApproval(
  row: ClinicalActivationApprovalRow
): ClinicalActivationApprovalRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    domainId: row.domain_id,
    domainLabel: row.domain_label,
    approvalStatus: row.approval_status,
    approvalScope: row.approval_scope,
    reviewerRole: row.reviewer_role,
    attestation: row.attestation,
    evidenceSnapshot: row.evidence_snapshot,
    retainedBlockers: Array.isArray(row.retained_blockers) ? row.retained_blockers : [],
    noPhiAttestation: true,
    clinicalGoLiveAuthority: row.clinical_go_live_authority,
    signedBy: row.signed_by,
    signedAt: row.signed_at,
    createdAt: row.created_at,
    boundary: row.boundary
  };
}

function mapProtectedOperatorMetric(row: ProtectedOperatorMetricRow): ProtectedOperatorMetricRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    metricKey: row.metric_key,
    metricValue: Number(row.metric_value),
    metricLabel: row.metric_label,
    metricUnit: row.metric_unit,
    publicMarketKpiId: row.public_market_kpi_id,
    workflowKey: row.workflow_key,
    measurementWindowStart: row.measurement_window_start,
    measurementWindowEnd: row.measurement_window_end,
    sourceRoute: row.source_route,
    evidenceReference: row.evidence_reference,
    operatorAttestation: row.operator_attestation,
    dataBoundary: row.data_boundary,
    financialReportingAuthority: row.financial_reporting_authority,
    securitiesAuthority: row.securities_authority,
    createdBy: row.created_by,
    createdAt: row.created_at,
    boundary: row.boundary
  };
}

function nullableNumber(value: number | string | null) {
  return value === null ? null : Number(value);
}

function mapProtectedMetricRollupSnapshot(
  row: ProtectedMetricRollupSnapshotRow
): ProtectedMetricRollupRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    reportingPeriodStart: row.reporting_period_start,
    reportingPeriodEnd: row.reporting_period_end,
    metricCount: row.metric_count,
    capturedMetricTypes: row.captured_metric_types,
    requiredMetricTypes: row.required_metric_types,
    readyForBoardReview: row.ready_for_board_review,
    modelCostUsd: Number(row.model_cost_usd),
    modelCostPerWorkflow: nullableNumber(row.model_cost_per_workflow),
    reviewTimeMinutes: Number(row.review_time_minutes),
    reviewMinutesPerWorkflow: nullableNumber(row.review_minutes_per_workflow),
    deliveryHours: Number(row.delivery_hours),
    deliveryHoursPerWorkflow: nullableNumber(row.delivery_hours_per_workflow),
    proofPacketCount: Number(row.proof_packet_count),
    proofPacketsPerWorkflow: nullableNumber(row.proof_packets_per_workflow),
    workflowVolume: Number(row.workflow_volume),
    costPerWorkflow: nullableNumber(row.cost_per_workflow),
    totals: asArray<ProtectedMetricRollupTotal>(row.totals),
    recommendations: asArray<string>(row.recommendations),
    limitations: asArray<string>(row.limitations),
    reviewerAttestation: row.reviewer_attestation,
    reviewNote: row.review_note,
    dataBoundary: row.data_boundary,
    financialReportingAuthority: row.financial_reporting_authority,
    securitiesAuthority: row.securities_authority,
    clinicalExecutionAuthority: row.clinical_execution_authority,
    createdBy: row.created_by,
    createdAt: row.created_at,
    boundary: row.boundary
  };
}

function mapProtectedMetricTrendReview(
  row: ProtectedMetricTrendReviewRow
): ProtectedMetricTrendReviewRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    currentSnapshotId: row.current_snapshot_id,
    comparisonSnapshotId: row.comparison_snapshot_id,
    trendPeriodLabel: row.trend_period_label,
    boardTrendState: row.board_trend_state,
    trendMetrics: asArray<ProtectedMetricTrendMetric>(row.trend_metrics),
    reachExpansionSignals: asArray<string>(row.reach_expansion_signals),
    competitiveAdvantages: asArray<string>(row.competitive_advantages),
    agentImprovementActions: asArray<string>(row.agent_improvement_actions),
    recommendations: asArray<string>(row.recommendations),
    limitations: asArray<string>(row.limitations),
    reviewerAttestation: row.reviewer_attestation,
    reviewNote: row.review_note,
    dataBoundary: row.data_boundary,
    costAllocationPolicy: row.cost_allocation_policy,
    costAllocationStatus: row.cost_allocation_status,
    financialReportingAuthority: row.financial_reporting_authority,
    securitiesAuthority: row.securities_authority,
    clinicalExecutionAuthority: row.clinical_execution_authority,
    createdBy: row.created_by,
    createdAt: row.created_at,
    boundary: row.boundary
  };
}

function mapProtectedBoardScorecard(row: ProtectedBoardScorecardRow): ProtectedBoardScorecardRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    primaryTrendReviewId: row.primary_trend_review_id,
    secondaryTrendReviewId: row.secondary_trend_review_id,
    tertiaryTrendReviewId: row.tertiary_trend_review_id,
    boardPeriodLabel: row.board_period_label,
    scorecardState: row.scorecard_state,
    trendReviewCount: row.trend_review_count,
    rollingQuarterMetrics: asArray<ProtectedBoardScorecardMetricSummary>(
      row.rolling_quarter_metrics
    ),
    financeAllocationProfile:
      asRecord(row.finance_allocation_profile) as unknown as ProtectedBoardFinanceAllocationProfile,
    buyerSegmentFocus: row.buyer_segment_focus,
    buyerSegmentCohorts: asArray<ProtectedBoardBuyerSegmentCohort>(
      row.buyer_segment_cohorts
    ),
    competitiveAdvantages: asArray<string>(row.competitive_advantages),
    agentImprovementPriorities: asArray<string>(row.agent_improvement_priorities),
    strategicActions: asArray<string>(row.strategic_actions),
    recommendations: asArray<string>(row.recommendations),
    limitations: asArray<string>(row.limitations),
    operatorAttestation: row.operator_attestation,
    reviewNote: row.review_note,
    dataBoundary: row.data_boundary,
    allocationProfileStatus: row.allocation_profile_status,
    financialReportingAuthority: row.financial_reporting_authority,
    securitiesAuthority: row.securities_authority,
    clinicalExecutionAuthority: row.clinical_execution_authority,
    createdBy: row.created_by,
    createdAt: row.created_at,
    boundary: row.boundary
  };
}

function mapProtectedFinanceMethodologyGate(
  row: ProtectedFinanceMethodologyGateRow
): ProtectedFinanceMethodologyGateRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    boardScorecardId: row.board_scorecard_id,
    gateId: row.gate_id,
    gateLabel: row.gate_label,
    gateStatus: row.gate_status,
    approvalScope: row.approval_scope,
    reviewerRole: row.reviewer_role,
    evidenceSnapshot: asRecord(row.evidence_snapshot),
    retainedBlockers: asStringArray(row.retained_blockers),
    methodologyComponents: asStringArray(row.methodology_components),
    externalUseRestrictions: asStringArray(row.external_use_restrictions),
    attestation: row.attestation,
    reviewNote: row.review_note,
    dataBoundary: row.data_boundary,
    methodologyAuthority: row.methodology_authority,
    externalUseAuthority: row.external_use_authority,
    financialReportingAuthority: row.financial_reporting_authority,
    securitiesAuthority: row.securities_authority,
    advertisingClaimsAuthority: row.advertising_claims_authority,
    clinicalExecutionAuthority: row.clinical_execution_authority,
    signedBy: row.signed_by,
    signedAt: row.signed_at,
    createdAt: row.created_at,
    boundary: row.boundary
  };
}

function mapProtectedExternalApprovalEvidence(
  row: ProtectedExternalApprovalEvidenceRow
): ProtectedExternalApprovalEvidenceRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    financeGateRecordId: row.finance_gate_record_id,
    domainId: row.domain_id,
    domainLabel: row.domain_label,
    referenceStatus: row.reference_status,
    approvalScope: row.approval_scope,
    externalReferenceLabel: row.external_reference_label,
    externalSystem: row.external_system,
    referenceLocator: row.reference_locator,
    referenceOwner: row.reference_owner,
    evidenceRetainedExternally: true,
    evidenceSnapshot: asRecord(row.evidence_snapshot),
    retainedBlockers: asStringArray(row.retained_blockers),
    releaseRestrictions: asStringArray(row.release_restrictions),
    attestation: row.attestation,
    reviewNote: row.review_note,
    dataBoundary: row.data_boundary,
    evidenceAuthority: row.evidence_authority,
    storageAuthority: row.storage_authority,
    releaseAuthority: row.release_authority,
    financialReportingAuthority: row.financial_reporting_authority,
    securitiesAuthority: row.securities_authority,
    advertisingClaimsAuthority: row.advertising_claims_authority,
    clinicalExecutionAuthority: row.clinical_execution_authority,
    recordedBy: row.recorded_by,
    recordedAt: row.recorded_at,
    createdAt: row.created_at,
    boundary: row.boundary
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function mapPilotDemoReadinessSnapshot(
  row: PilotDemoReadinessSnapshotRow
): PilotDemoReadinessSnapshotRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    readinessState: row.readiness_state,
    readinessScore: row.readiness_score,
    passedCount: row.passed_count,
    reviewCount: row.review_count,
    blockedCount: row.blocked_count,
    requiredActions: asStringArray(row.required_actions),
    buyerBrief: asStringArray(row.buyer_brief),
    checkResults: asArray(row.check_results),
    runbook: asArray(row.runbook),
    verification: asRecord(row.verification) as unknown as TenantSessionVerificationReadiness,
    evidenceCounts: {
      sessions: Number(asRecord(row.evidence_counts).sessions ?? 0),
      auditEvents: Number(asRecord(row.evidence_counts).auditEvents ?? 0),
      requiredActions: Number(asRecord(row.evidence_counts).requiredActions ?? 0),
      checks: Number(asRecord(row.evidence_counts).checks ?? 0)
    },
    snapshot: asRecord(row.snapshot) as unknown as PilotDemoReadinessSummary,
    lastEvidenceAt: row.last_evidence_at,
    boundary: row.boundary,
    createdBy: row.created_by,
    createdAt: row.created_at
  };
}

function mapCommandIntelligenceSnapshot(
  row: CommandIntelligenceSnapshotRow
): CommandIntelligenceSnapshotRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    commandState: row.command_state,
    commandScore: row.command_score,
    buyerRoomState: row.buyer_room_state,
    buyerRoomScore: row.buyer_room_score,
    agentCommanderStatus: row.agent_commander_status,
    workstreamCount: row.workstream_count,
    trustOutputCount: row.trust_output_count,
    evaluationGateCount: row.evaluation_gate_count,
    toolAccessPlanCount: row.tool_access_plan_count,
    safeModeControlCount: row.safe_mode_control_count,
    nextActionCount: row.next_action_count,
    evidenceCounts: {
      sessions: Number(asRecord(row.evidence_counts).sessions ?? 0),
      auditEvents: Number(asRecord(row.evidence_counts).auditEvents ?? 0),
      demoSnapshots: Number(asRecord(row.evidence_counts).demoSnapshots ?? 0),
      manualQaEvidencePackets: Number(
        asRecord(row.evidence_counts).manualQaEvidencePackets ?? 0
      ),
      packetExports: Number(asRecord(row.evidence_counts).packetExports ?? 0),
      unavailableSections: Number(asRecord(row.evidence_counts).unavailableSections ?? 0)
    },
    metrics: asArray<CommandIntelligenceMetric>(row.metrics),
    workstreams: asArray<CommandIntelligenceWorkstream>(row.workstreams),
    trustEngineOutputs: asArray<CommandTrustEngineOutput>(row.trust_engine_outputs),
    evaluationPipeline: asArray<CommandEvaluationGate>(row.evaluation_pipeline),
    toolAccessPlans: asArray<CommandToolAccessPlan>(row.tool_access_plans),
    safeModeControls: asArray<CommandSafeModeControl>(row.safe_mode_controls),
    nextActions: asArray<CommandNextAction>(row.next_actions),
    limitations: asArray<CommandIntelligenceSnapshotRecord["limitations"][number]>(
      row.limitations
    ),
    observability: asRecord(row.observability) as CommandIntelligenceHubSummary["observability"],
    snapshot: asRecord(row.snapshot) as unknown as CommandIntelligenceHubSummary,
    lastEvidenceAt: row.last_evidence_at,
    operatorAttestation: row.operator_attestation,
    boundary: row.boundary,
    createdBy: row.created_by,
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

function mapTrustSafetyIncident(row: TrustSafetyIncidentRow): DurableTrustSafetyIncidentRecord {
  return {
    id: row.id,
    tenantId: row.tenantId ?? row.tenant_id ?? "",
    workspaceId: row.workspaceId ?? row.workspace_id ?? "",
    incidentKey: row.incidentKey ?? row.incident_key ?? "",
    title: row.title,
    severity: row.severity,
    status: row.status,
    owner: row.owner,
    accountableAgent: row.accountableAgent ?? row.accountable_agent ?? "",
    sourceChannel: row.sourceChannel ?? row.source_channel ?? "",
    affectedSurface: asStringArray(row.affectedSurface ?? row.affected_surface),
    triggerSignal: row.triggerSignal ?? row.trigger_signal ?? "",
    buyerImpact: row.buyerImpact ?? row.buyer_impact ?? "",
    containmentAction: row.containmentAction ?? row.containment_action ?? "",
    remediationPlan: row.remediationPlan ?? row.remediation_plan ?? "",
    legalHoldStatus: row.legalHoldStatus ?? row.legal_hold_status ?? "not-required",
    notificationDecision: row.notificationDecision ?? row.notification_decision ?? "pending",
    notificationReason: row.notificationReason ?? row.notification_reason ?? "",
    postIncidentReviewStatus: row.postIncidentReviewStatus ?? row.post_incident_review_status ?? "not-started",
    retentionUntil: row.retentionUntil ?? row.retention_until ?? null,
    legalHoldUntil: row.legalHoldUntil ?? row.legal_hold_until ?? null,
    eventMetadata: row.eventMetadata ?? row.event_metadata ?? {},
    boundary: row.boundary,
    createdBy: row.createdBy ?? row.created_by ?? "",
    updatedBy: row.updatedBy ?? row.updated_by ?? "",
    createdAt: row.createdAt ?? row.created_at ?? "",
    updatedAt: row.updatedAt ?? row.updated_at ?? "",
    closedAt: row.closedAt ?? row.closed_at ?? null
  };
}

function mapTrustSafetyIncidentEvent(
  row: TrustSafetyIncidentEventRow
): DurableTrustSafetyIncidentEventRecord {
  return {
    id: row.id,
    tenantId: row.tenantId ?? row.tenant_id ?? "",
    workspaceId: row.workspaceId ?? row.workspace_id ?? "",
    incidentId: row.incidentId ?? row.incident_id ?? "",
    actorUserId: row.actorUserId ?? row.actor_user_id ?? "",
    eventType: row.eventType ?? row.event_type ?? "status-updated",
    priorStatus: row.priorStatus ?? row.prior_status ?? null,
    nextStatus: row.nextStatus ?? row.next_status ?? "new",
    priorLegalHoldStatus: row.priorLegalHoldStatus ?? row.prior_legal_hold_status ?? null,
    nextLegalHoldStatus: row.nextLegalHoldStatus ?? row.next_legal_hold_status ?? "not-required",
    priorNotificationDecision:
      row.priorNotificationDecision ?? row.prior_notification_decision ?? null,
    nextNotificationDecision: row.nextNotificationDecision ?? row.next_notification_decision ?? "pending",
    eventSummary: row.eventSummary ?? row.event_summary ?? "",
    eventMetadata: row.eventMetadata ?? row.event_metadata ?? {},
    boundary: row.boundary,
    createdAt: row.createdAt ?? row.created_at ?? ""
  };
}

function mapTrustSafetyIncidentDashboard(
  payload: TrustSafetyIncidentDashboardPayload | null
) {
  if (!payload) {
    return null;
  }

  return {
    tenantId: payload.tenantId,
    tenantName: payload.tenantName,
    workspaceId: payload.workspaceId,
    workspaceSlug: payload.workspaceSlug,
    workspaceName: payload.workspaceName,
    actorUserId: payload.actorUserId,
    incidents: (payload.incidents ?? []).map(mapTrustSafetyIncident),
    events: (payload.events ?? []).map(mapTrustSafetyIncidentEvent),
    security: payload.security ?? {},
    boundary: payload.boundary
  };
}

const workspaceSelect = "id, tenant_id, slug, name, status, boundary, created_at, pilot_tenants(name)";
const sessionSelect =
  "id, workspace_id, scenario_slug, status, boundary, evaluation, created_at, created_by";
const auditEventSelect =
  "id, workspace_id, session_id, actor_user_id, event_type, event_metadata, created_at";
const qaManualRunEvidencePacketSelect =
  "id, tenant_id, workspace_id, workflow_run_id, workflow_run_url, executed_at, base_url, intake_id, created_session_id, packet_audit_event_id, qa_outcome, operator_attestation, token_disposal_attestation, data_boundary, packet_markdown, packet_sha256, created_by, created_at, boundary";
const pilotDemoReadinessSnapshotSelect =
  "id, tenant_id, workspace_id, readiness_state, readiness_score, passed_count, review_count, blocked_count, required_actions, buyer_brief, check_results, runbook, verification, evidence_counts, snapshot, last_evidence_at, boundary, created_by, created_at";
const commandIntelligenceSnapshotSelect =
  "id, tenant_id, workspace_id, command_state, command_score, buyer_room_state, buyer_room_score, agent_commander_status, workstream_count, trust_output_count, evaluation_gate_count, tool_access_plan_count, safe_mode_control_count, next_action_count, evidence_counts, metrics, workstreams, trust_engine_outputs, evaluation_pipeline, tool_access_plans, safe_mode_controls, next_actions, limitations, observability, snapshot, last_evidence_at, operator_attestation, boundary, created_by, created_at";
const clinicalActivationApprovalSelect =
  "id, tenant_id, workspace_id, domain_id, domain_label, approval_status, approval_scope, reviewer_role, attestation, evidence_snapshot, retained_blockers, no_phi_attestation, clinical_go_live_authority, signed_by, signed_at, created_at, boundary";
const protectedOperatorMetricSelect =
  "id, tenant_id, workspace_id, metric_key, metric_label, metric_unit, metric_value, public_market_kpi_id, workflow_key, measurement_window_start, measurement_window_end, source_route, evidence_reference, operator_attestation, data_boundary, financial_reporting_authority, securities_authority, created_by, created_at, boundary";
const protectedMetricRollupSnapshotSelect =
  "id, tenant_id, workspace_id, reporting_period_start, reporting_period_end, metric_count, captured_metric_types, required_metric_types, ready_for_board_review, model_cost_usd, model_cost_per_workflow, review_time_minutes, review_minutes_per_workflow, delivery_hours, delivery_hours_per_workflow, proof_packet_count, proof_packets_per_workflow, workflow_volume, cost_per_workflow, totals, recommendations, limitations, reviewer_attestation, review_note, data_boundary, financial_reporting_authority, securities_authority, clinical_execution_authority, created_by, created_at, boundary";
const protectedMetricTrendReviewSelect =
  "id, tenant_id, workspace_id, current_snapshot_id, comparison_snapshot_id, trend_period_label, board_trend_state, trend_metrics, reach_expansion_signals, competitive_advantages, agent_improvement_actions, recommendations, limitations, reviewer_attestation, review_note, data_boundary, cost_allocation_policy, cost_allocation_status, financial_reporting_authority, securities_authority, clinical_execution_authority, created_by, created_at, boundary";
const protectedBoardScorecardSelect =
  "id, tenant_id, workspace_id, primary_trend_review_id, secondary_trend_review_id, tertiary_trend_review_id, board_period_label, scorecard_state, trend_review_count, rolling_quarter_metrics, finance_allocation_profile, buyer_segment_focus, buyer_segment_cohorts, competitive_advantages, agent_improvement_priorities, strategic_actions, recommendations, limitations, operator_attestation, review_note, data_boundary, allocation_profile_status, financial_reporting_authority, securities_authority, clinical_execution_authority, created_by, created_at, boundary";
const protectedFinanceMethodologyGateSelect =
  "id, tenant_id, workspace_id, board_scorecard_id, gate_id, gate_label, gate_status, approval_scope, reviewer_role, evidence_snapshot, retained_blockers, methodology_components, external_use_restrictions, attestation, review_note, data_boundary, methodology_authority, external_use_authority, financial_reporting_authority, securities_authority, advertising_claims_authority, clinical_execution_authority, signed_by, signed_at, created_at, boundary";
const protectedExternalApprovalEvidenceSelect =
  "id, tenant_id, workspace_id, finance_gate_record_id, domain_id, domain_label, reference_status, approval_scope, external_reference_label, external_system, reference_locator, reference_owner, evidence_retained_externally, evidence_snapshot, retained_blockers, release_restrictions, attestation, review_note, data_boundary, evidence_authority, storage_authority, release_authority, financial_reporting_authority, securities_authority, advertising_claims_authority, clinical_execution_authority, recorded_by, recorded_at, created_at, boundary";
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

export async function listQaManualRunEvidencePackets(client: SupabaseClient, workspaceId: string) {
  const { data, error } = await client
    .from("qa_manual_run_evidence_packets")
    .select(qaManualRunEvidencePacketSelect)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(50);

  return {
    packets: ((data ?? []) as unknown as QaManualRunEvidencePacketRow[]).map(
      mapQaManualRunEvidencePacket
    ),
    error
  };
}

export async function listPilotDemoReadinessSnapshots(client: SupabaseClient, workspaceId: string) {
  const { data, error } = await client
    .from("pilot_demo_readiness_snapshots")
    .select(pilotDemoReadinessSnapshotSelect)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(50);

  return {
    snapshots: ((data ?? []) as unknown as PilotDemoReadinessSnapshotRow[]).map(
      mapPilotDemoReadinessSnapshot
    ),
    error
  };
}

export async function getPilotDemoReadinessSnapshot(
  client: SupabaseClient,
  workspaceId: string,
  snapshotId: string
) {
  const { data, error } = await client
    .from("pilot_demo_readiness_snapshots")
    .select(pilotDemoReadinessSnapshotSelect)
    .eq("workspace_id", workspaceId)
    .eq("id", snapshotId)
    .maybeSingle();

  return {
    snapshot: data ? mapPilotDemoReadinessSnapshot(data as unknown as PilotDemoReadinessSnapshotRow) : null,
    error
  };
}

export async function listCommandIntelligenceSnapshots(
  client: SupabaseClient,
  workspaceId: string
) {
  const { data, error } = await client
    .from("command_intelligence_snapshots")
    .select(commandIntelligenceSnapshotSelect)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(50);

  return {
    snapshots: ((data ?? []) as unknown as CommandIntelligenceSnapshotRow[]).map(
      mapCommandIntelligenceSnapshot
    ),
    error
  };
}

export async function getCommandIntelligenceSnapshot(
  client: SupabaseClient,
  workspaceId: string,
  snapshotId: string
) {
  const { data, error } = await client
    .from("command_intelligence_snapshots")
    .select(commandIntelligenceSnapshotSelect)
    .eq("workspace_id", workspaceId)
    .eq("id", snapshotId)
    .maybeSingle();

  return {
    snapshot: data
      ? mapCommandIntelligenceSnapshot(data as unknown as CommandIntelligenceSnapshotRow)
      : null,
    error
  };
}

export async function listClinicalActivationApprovals(
  client: SupabaseClient,
  workspaceId: string
) {
  const { data, error } = await client
    .from("clinical_activation_approvals")
    .select(clinicalActivationApprovalSelect)
    .eq("workspace_id", workspaceId)
    .order("signed_at", { ascending: false })
    .limit(100);

  return {
    approvals: ((data ?? []) as unknown as ClinicalActivationApprovalRow[]).map(
      mapClinicalActivationApproval
    ),
    error
  };
}

export async function listProtectedOperatorMetrics(
  client: SupabaseClient,
  workspaceId: string
) {
  const { data, error } = await client
    .from("protected_operator_metrics")
    .select(protectedOperatorMetricSelect)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(100);

  return {
    metrics: ((data ?? []) as unknown as ProtectedOperatorMetricRow[]).map(
      mapProtectedOperatorMetric
    ),
    error
  };
}

export async function listProtectedMetricRollupSnapshots(
  client: SupabaseClient,
  workspaceId: string
) {
  const { data, error } = await client
    .from("protected_metric_rollup_snapshots")
    .select(protectedMetricRollupSnapshotSelect)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(50);

  return {
    snapshots: ((data ?? []) as unknown as ProtectedMetricRollupSnapshotRow[]).map(
      mapProtectedMetricRollupSnapshot
    ),
    error
  };
}

export async function getProtectedMetricRollupSnapshot(
  client: SupabaseClient,
  workspaceId: string,
  snapshotId: string
) {
  const { data, error } = await client
    .from("protected_metric_rollup_snapshots")
    .select(protectedMetricRollupSnapshotSelect)
    .eq("workspace_id", workspaceId)
    .eq("id", snapshotId)
    .maybeSingle();

  return {
    snapshot: data
      ? mapProtectedMetricRollupSnapshot(data as unknown as ProtectedMetricRollupSnapshotRow)
      : null,
    error
  };
}

export async function listProtectedMetricTrendReviews(
  client: SupabaseClient,
  workspaceId: string
) {
  const { data, error } = await client
    .from("protected_metric_trend_reviews")
    .select(protectedMetricTrendReviewSelect)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(50);

  return {
    reviews: ((data ?? []) as unknown as ProtectedMetricTrendReviewRow[]).map(
      mapProtectedMetricTrendReview
    ),
    error
  };
}

export async function getProtectedMetricTrendReview(
  client: SupabaseClient,
  workspaceId: string,
  reviewId: string
) {
  const { data, error } = await client
    .from("protected_metric_trend_reviews")
    .select(protectedMetricTrendReviewSelect)
    .eq("workspace_id", workspaceId)
    .eq("id", reviewId)
    .maybeSingle();

  return {
    review: data ? mapProtectedMetricTrendReview(data as unknown as ProtectedMetricTrendReviewRow) : null,
    error
  };
}

export async function listProtectedBoardScorecards(
  client: SupabaseClient,
  workspaceId: string
) {
  const { data, error } = await client
    .from("protected_board_scorecards")
    .select(protectedBoardScorecardSelect)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(50);

  return {
    scorecards: ((data ?? []) as unknown as ProtectedBoardScorecardRow[]).map(
      mapProtectedBoardScorecard
    ),
    error
  };
}

export async function getProtectedBoardScorecard(
  client: SupabaseClient,
  workspaceId: string,
  scorecardId: string
) {
  const { data, error } = await client
    .from("protected_board_scorecards")
    .select(protectedBoardScorecardSelect)
    .eq("workspace_id", workspaceId)
    .eq("id", scorecardId)
    .maybeSingle();

  return {
    scorecard: data ? mapProtectedBoardScorecard(data as unknown as ProtectedBoardScorecardRow) : null,
    error
  };
}

export async function listProtectedFinanceMethodologyGates(
  client: SupabaseClient,
  workspaceId: string
) {
  const { data, error } = await client
    .from("protected_finance_methodology_gates")
    .select(protectedFinanceMethodologyGateSelect)
    .eq("workspace_id", workspaceId)
    .order("signed_at", { ascending: false })
    .limit(100);

  return {
    records: ((data ?? []) as unknown as ProtectedFinanceMethodologyGateRow[]).map(
      mapProtectedFinanceMethodologyGate
    ),
    error
  };
}

export async function listProtectedExternalApprovalEvidenceReferences(
  client: SupabaseClient,
  workspaceId: string
) {
  const { data, error } = await client
    .from("protected_external_approval_evidence_references")
    .select(protectedExternalApprovalEvidenceSelect)
    .eq("workspace_id", workspaceId)
    .order("recorded_at", { ascending: false })
    .limit(150);

  return {
    records: ((data ?? []) as unknown as ProtectedExternalApprovalEvidenceRow[]).map(
      mapProtectedExternalApprovalEvidence
    ),
    error
  };
}

function persistedEvidenceTimestamp(value: string) {
  const time = new Date(value).getTime();

  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

function persistedOptionalEvidenceTimestamp(value: string | null) {
  return value ? persistedEvidenceTimestamp(value) : null;
}

export async function createPilotDemoReadinessSnapshot(
  client: SupabaseClient,
  workspaceSlug: string,
  summary: PilotDemoReadinessSummary,
  verification: TenantSessionVerificationReadiness,
  evidenceCounts: PilotDemoReadinessSnapshotRecord["evidenceCounts"]
) {
  const { data, error } = await client.rpc("create_pilot_demo_readiness_snapshot", {
    p_workspace_slug: workspaceSlug,
    p_readiness_state: summary.state,
    p_readiness_score: summary.score,
    p_passed_count: summary.passed,
    p_review_count: summary.review,
    p_blocked_count: summary.blocked,
    p_required_actions: summary.requiredActions,
    p_buyer_brief: summary.buyerBrief,
    p_check_results: summary.checks,
    p_runbook: summary.runbook,
    p_verification: verification,
    p_evidence_counts: evidenceCounts,
    p_last_evidence_at: persistedEvidenceTimestamp(summary.lastEvidenceAt),
    p_snapshot: summary
  });

  return {
    snapshotId: typeof data === "string" ? data : null,
    error
  };
}

export async function recordPilotDemoReadinessPacketDownload(
  client: SupabaseClient,
  workspaceSlug: string,
  snapshotId: string
) {
  const { data, error } = await client.rpc("record_pilot_demo_readiness_packet_download", {
    p_workspace_slug: workspaceSlug,
    p_snapshot_id: snapshotId
  });

  return {
    eventId: typeof data === "string" ? data : null,
    error
  };
}

export async function createCommandIntelligenceSnapshot(
  client: SupabaseClient,
  workspaceSlug: string,
  hub: CommandIntelligenceHubSummary,
  operatorAttestation: CommandIntelligenceSnapshotRecord["operatorAttestation"],
  lastEvidenceAt: string | null
) {
  const { data, error } = await client.rpc("create_command_intelligence_snapshot", {
    p_workspace_slug: workspaceSlug,
    p_command_state: hub.state,
    p_command_score: hub.score,
    p_buyer_room_state: hub.buyerRoomReadiness.state,
    p_buyer_room_score: hub.buyerRoomReadiness.score,
    p_agent_commander_status: hub.agentCommander.status,
    p_workstream_count: hub.workstreams.length,
    p_trust_output_count: hub.trustEngineOutputs.length,
    p_evaluation_gate_count: hub.evaluationPipeline.length,
    p_tool_access_plan_count: hub.toolAccessPlans.length,
    p_safe_mode_control_count: hub.safeModeControls.length,
    p_next_action_count: hub.nextActions.length,
    p_evidence_counts: hub.evidenceCounts,
    p_metrics: hub.metrics,
    p_workstreams: hub.workstreams,
    p_trust_engine_outputs: hub.trustEngineOutputs,
    p_evaluation_pipeline: hub.evaluationPipeline,
    p_tool_access_plans: hub.toolAccessPlans,
    p_safe_mode_controls: hub.safeModeControls,
    p_next_actions: hub.nextActions,
    p_limitations: hub.limitations,
    p_observability: hub.observability,
    p_snapshot: hub,
    p_last_evidence_at: persistedOptionalEvidenceTimestamp(lastEvidenceAt),
    p_operator_attestation: operatorAttestation
  });

  return {
    snapshotId: typeof data === "string" ? data : null,
    error
  };
}

export async function recordCommandIntelligencePacketDownload(
  client: SupabaseClient,
  workspaceSlug: string,
  snapshotId: string
) {
  const { data, error } = await client.rpc("record_command_intelligence_packet_download", {
    p_workspace_slug: workspaceSlug,
    p_snapshot_id: snapshotId
  });

  return {
    eventId: typeof data === "string" ? data : null,
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

export async function recordEnterpriseProofPacketDownload(
  client: SupabaseClient,
  workspaceSlug: string,
  eventMetadata: Record<string, unknown>
) {
  const { data, error } = await client.rpc("record_enterprise_proof_packet_download", {
    p_workspace_slug: workspaceSlug,
    p_event_metadata: {
      ...eventMetadata,
      packetType: "enterprise-proof-packet",
      format: "text/markdown",
      syntheticOnly: true
    }
  });

  return {
    eventId: typeof data === "string" ? data : null,
    error
  };
}

export async function recordBuyerPilotRoomPacketDownload(
  client: SupabaseClient,
  workspaceSlug: string,
  eventMetadata: Record<string, unknown>
) {
  const { data, error } = await client.rpc("record_buyer_pilot_room_packet_download", {
    p_workspace_slug: workspaceSlug,
    p_event_metadata: {
      ...eventMetadata,
      packetType: "buyer-pilot-room-packet",
      format: "text/markdown",
      syntheticOnly: true
    }
  });

  return {
    eventId: typeof data === "string" ? data : null,
    error
  };
}

export async function recordClinicalActivationDossierPacketDownload(
  client: SupabaseClient,
  workspaceSlug: string,
  eventMetadata: Record<string, unknown>
) {
  const { data, error } = await client.rpc("record_enterprise_proof_packet_download", {
    p_workspace_slug: workspaceSlug,
    p_event_metadata: {
      ...eventMetadata,
      packetType: "clinical-activation-dossier",
      format: "text/markdown",
      syntheticOnly: true,
      noPhiOnly: true,
      clinicalGoLiveAuthority: "not-authorized-live-care"
    }
  });

  return {
    eventId: typeof data === "string" ? data : null,
    error
  };
}

export async function createClinicalActivationApproval(
  client: SupabaseClient,
  workspaceSlug: string,
  input: {
    domainId: string;
    domainLabel: string;
    approvalStatus: ClinicalActivationApprovalStatus;
    reviewerRole: string;
    evidenceSnapshot: Record<string, unknown>;
    retainedBlockers: string[];
  }
) {
  const { data, error } = await client.rpc("record_clinical_activation_approval", {
    p_workspace_slug: workspaceSlug,
    p_domain_id: input.domainId,
    p_domain_label: input.domainLabel,
    p_approval_status: input.approvalStatus,
    p_reviewer_role: input.reviewerRole,
    p_evidence_snapshot: input.evidenceSnapshot,
    p_retained_blockers: input.retainedBlockers,
    p_attestation: "aal2-readiness-attestation-no-phi"
  });

  return {
    approvalId: typeof data === "string" ? data : null,
    error
  };
}

export async function recordProtectedOperatorMetric(
  client: SupabaseClient,
  workspaceSlug: string,
  input: ProtectedOperatorMetricInput
) {
  const { data, error } = await client.rpc("record_protected_operator_metric", {
    p_workspace_slug: workspaceSlug,
    p_metric_input: input
  });

  return {
    metricId: typeof data === "string" ? data : null,
    error
  };
}

export async function createProtectedMetricRollupSnapshot(
  client: SupabaseClient,
  workspaceSlug: string,
  input: ProtectedMetricRollupInput
) {
  const { data, error } = await client.rpc("create_protected_metric_rollup_snapshot", {
    p_workspace_slug: workspaceSlug,
    p_rollup_input: input
  });

  return {
    snapshotId: typeof data === "string" ? data : null,
    error
  };
}

export async function recordProtectedMetricRollupPacketDownload(
  client: SupabaseClient,
  workspaceSlug: string,
  snapshotId: string
) {
  const { data, error } = await client.rpc("record_protected_metric_rollup_packet_download", {
    p_workspace_slug: workspaceSlug,
    p_snapshot_id: snapshotId
  });

  return {
    eventId: typeof data === "string" ? data : null,
    error
  };
}

export async function createProtectedMetricTrendReview(
  client: SupabaseClient,
  workspaceSlug: string,
  input: ProtectedMetricTrendReviewInput
) {
  const { data, error } = await client.rpc("create_protected_metric_trend_review", {
    p_workspace_slug: workspaceSlug,
    p_trend_input: input
  });

  return {
    reviewId: typeof data === "string" ? data : null,
    error
  };
}

export async function recordProtectedMetricTrendPacketDownload(
  client: SupabaseClient,
  workspaceSlug: string,
  reviewId: string
) {
  const { data, error } = await client.rpc("record_protected_metric_trend_packet_download", {
    p_workspace_slug: workspaceSlug,
    p_review_id: reviewId
  });

  return {
    eventId: typeof data === "string" ? data : null,
    error
  };
}

export async function createProtectedBoardScorecard(
  client: SupabaseClient,
  workspaceSlug: string,
  input: ProtectedBoardScorecardInput
) {
  const { data, error } = await client.rpc("create_protected_board_scorecard", {
    p_workspace_slug: workspaceSlug,
    p_scorecard_input: input
  });

  return {
    scorecardId: typeof data === "string" ? data : null,
    error
  };
}

export async function recordProtectedBoardScorecardPacketDownload(
  client: SupabaseClient,
  workspaceSlug: string,
  scorecardId: string
) {
  const { data, error } = await client.rpc("record_protected_board_scorecard_packet_download", {
    p_workspace_slug: workspaceSlug,
    p_scorecard_id: scorecardId
  });

  return {
    eventId: typeof data === "string" ? data : null,
    error
  };
}

export async function recordProtectedFinanceMethodologyGate(
  client: SupabaseClient,
  workspaceSlug: string,
  input: ProtectedFinanceMethodologyInput
) {
  const { data, error } = await client.rpc("record_protected_finance_methodology_gate", {
    p_workspace_slug: workspaceSlug,
    p_gate_input: input
  });

  return {
    gateRecordId: typeof data === "string" ? data : null,
    error
  };
}

export async function recordProtectedFinanceMethodologyPacketDownload(
  client: SupabaseClient,
  workspaceSlug: string,
  eventMetadata: Record<string, unknown>
) {
  const { data, error } = await client.rpc("record_enterprise_proof_packet_download", {
    p_workspace_slug: workspaceSlug,
    p_event_metadata: {
      ...eventMetadata,
      packetType: "protected-finance-methodology-gates",
      format: "text/markdown",
      syntheticOnly: true,
      noPhiOnly: true
    }
  });

  return {
    eventId: typeof data === "string" ? data : null,
    error
  };
}

export async function recordProtectedExternalApprovalEvidenceReference(
  client: SupabaseClient,
  workspaceSlug: string,
  input: ProtectedExternalApprovalEvidenceInput
) {
  const { data, error } = await client.rpc(
    "record_protected_external_approval_evidence_reference",
    {
      p_workspace_slug: workspaceSlug,
      p_reference_input: input
    }
  );

  return {
    referenceId: typeof data === "string" ? data : null,
    error
  };
}

export async function recordProtectedExternalApprovalEvidencePacketDownload(
  client: SupabaseClient,
  workspaceSlug: string,
  eventMetadata: Record<string, unknown>
) {
  const { data, error } = await client.rpc("record_enterprise_proof_packet_download", {
    p_workspace_slug: workspaceSlug,
    p_event_metadata: {
      ...eventMetadata,
      packetType: "protected-external-approval-evidence-links",
      format: "text/markdown",
      syntheticOnly: true,
      noPhiOnly: true,
      metadataOnly: true
    }
  });

  return {
    eventId: typeof data === "string" ? data : null,
    error
  };
}

export async function recordClinicalActivationApprovalPacketDownload(
  client: SupabaseClient,
  workspaceSlug: string,
  eventMetadata: Record<string, unknown>
) {
  const { data, error } = await client.rpc("record_enterprise_proof_packet_download", {
    p_workspace_slug: workspaceSlug,
    p_event_metadata: {
      ...eventMetadata,
      packetType: "clinical-activation-approval-workflow",
      format: "text/markdown",
      syntheticOnly: true,
      noPhiOnly: true,
      clinicalGoLiveAuthority: "not-authorized-live-care"
    }
  });

  return {
    eventId: typeof data === "string" ? data : null,
    error
  };
}

export async function recordQaManualRunEvidencePacket(
  client: SupabaseClient,
  workspaceSlug: string,
  input: QaManualRunEvidenceInput,
  packetMarkdown: string
) {
  const { data, error } = await client.rpc("record_qa_manual_run_evidence_packet", {
    p_workspace_slug: workspaceSlug,
    p_packet_input: input,
    p_packet_markdown: packetMarkdown
  });

  const payload = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const packet =
    payload.packet && typeof payload.packet === "object"
      ? (payload.packet as unknown as QaManualRunEvidencePacketRecord)
      : null;

  return {
    packet,
    auditEventId: typeof payload.auditEventId === "string" ? payload.auditEventId : null,
    boundary: typeof payload.boundary === "string" ? payload.boundary : null,
    error
  };
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

export async function getTrustSafetyIncidentDashboard(client: SupabaseClient, workspaceSlug: string) {
  const { data, error } = await client.rpc("trust_safety_incident_dashboard", {
    p_workspace_slug: workspaceSlug
  });

  return {
    dashboard: mapTrustSafetyIncidentDashboard(
      data && typeof data === "object" ? (data as TrustSafetyIncidentDashboardPayload) : null
    ),
    error
  };
}

export async function createTrustSafetyIncident(
  client: SupabaseClient,
  workspaceSlug: string,
  input: TrustSafetyIncidentCreateInput
) {
  const { data, error } = await client.rpc("create_trust_safety_incident", {
    p_workspace_slug: workspaceSlug,
    p_incident_key: input.incidentKey,
    p_title: input.title,
    p_severity: input.severity,
    p_owner: input.owner,
    p_accountable_agent: input.accountableAgent,
    p_source_channel: input.sourceChannel,
    p_affected_surface: input.affectedSurface,
    p_trigger_signal: input.triggerSignal,
    p_buyer_impact: input.buyerImpact,
    p_containment_action: input.containmentAction,
    p_remediation_plan: input.remediationPlan,
    p_legal_hold_status: input.legalHoldStatus,
    p_notification_decision: input.notificationDecision,
    p_notification_reason: input.notificationReason,
    p_retention_until: input.retentionUntil,
    p_legal_hold_until: input.legalHoldUntil,
    p_event_metadata: input.eventMetadata
  });

  return {
    incidentId: typeof data === "string" ? data : null,
    error
  };
}

export async function updateTrustSafetyIncident(
  client: SupabaseClient,
  workspaceSlug: string,
  incidentId: string,
  input: TrustSafetyIncidentUpdateInput
) {
  const { data, error } = await client.rpc("update_trust_safety_incident", {
    p_workspace_slug: workspaceSlug,
    p_incident_id: incidentId,
    p_status: input.status,
    p_severity: input.severity,
    p_legal_hold_status: input.legalHoldStatus,
    p_notification_decision: input.notificationDecision,
    p_notification_reason: input.notificationReason,
    p_containment_action: input.containmentAction,
    p_remediation_plan: input.remediationPlan,
    p_post_incident_review_status: input.postIncidentReviewStatus,
    p_retention_until: input.retentionUntil,
    p_legal_hold_until: input.legalHoldUntil,
    p_event_type: input.eventType,
    p_event_summary: input.eventSummary,
    p_event_metadata: input.eventMetadata
  });

  return {
    eventId: typeof data === "string" ? data : null,
    error
  };
}

export async function recordTrustSafetyIncidentPacketDownload(
  client: SupabaseClient,
  workspaceSlug: string,
  incidentId: string
) {
  const { data, error } = await client.rpc("record_trust_safety_incident_packet_download", {
    p_workspace_slug: workspaceSlug,
    p_incident_id: incidentId
  });

  return {
    eventId: typeof data === "string" ? data : null,
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
