create table if not exists public.command_intelligence_snapshots (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  command_state text not null check (command_state in ('ready', 'review', 'blocked')),
  command_score smallint not null check (command_score between 0 and 100),
  buyer_room_state text not null check (buyer_room_state in ('ready', 'review', 'blocked')),
  buyer_room_score smallint not null check (buyer_room_score between 0 and 100),
  agent_commander_status text not null check (agent_commander_status in ('ready', 'review', 'blocked')),
  workstream_count smallint not null check (workstream_count >= 0),
  trust_output_count smallint not null check (trust_output_count >= 0),
  evaluation_gate_count smallint not null check (evaluation_gate_count >= 0),
  tool_access_plan_count smallint not null check (tool_access_plan_count >= 0),
  safe_mode_control_count smallint not null check (safe_mode_control_count >= 0),
  next_action_count smallint not null check (next_action_count >= 0),
  evidence_counts jsonb not null default '{}'::jsonb check (
    jsonb_typeof(evidence_counts) = 'object'
    and pg_column_size(evidence_counts) <= 32768
  ),
  metrics jsonb not null default '[]'::jsonb check (
    jsonb_typeof(metrics) = 'array'
    and pg_column_size(metrics) <= 65536
  ),
  workstreams jsonb not null default '[]'::jsonb check (
    jsonb_typeof(workstreams) = 'array'
    and pg_column_size(workstreams) <= 131072
  ),
  trust_engine_outputs jsonb not null default '[]'::jsonb check (
    jsonb_typeof(trust_engine_outputs) = 'array'
    and pg_column_size(trust_engine_outputs) <= 65536
  ),
  evaluation_pipeline jsonb not null default '[]'::jsonb check (
    jsonb_typeof(evaluation_pipeline) = 'array'
    and pg_column_size(evaluation_pipeline) <= 65536
  ),
  tool_access_plans jsonb not null default '[]'::jsonb check (
    jsonb_typeof(tool_access_plans) = 'array'
    and pg_column_size(tool_access_plans) <= 65536
  ),
  safe_mode_controls jsonb not null default '[]'::jsonb check (
    jsonb_typeof(safe_mode_controls) = 'array'
    and pg_column_size(safe_mode_controls) <= 65536
  ),
  next_actions jsonb not null default '[]'::jsonb check (
    jsonb_typeof(next_actions) = 'array'
    and pg_column_size(next_actions) <= 32768
  ),
  limitations jsonb not null default '[]'::jsonb check (
    jsonb_typeof(limitations) = 'array'
    and pg_column_size(limitations) <= 32768
  ),
  observability jsonb not null default '{}'::jsonb check (
    jsonb_typeof(observability) = 'object'
    and pg_column_size(observability) <= 65536
  ),
  snapshot jsonb not null check (
    jsonb_typeof(snapshot) = 'object'
    and pg_column_size(snapshot) <= 262144
  ),
  last_evidence_at timestamptz,
  operator_attestation text not null check (
    operator_attestation = 'aal2-human-reviewed-synthetic-command-posture'
  ),
  boundary text not null check (char_length(boundary) between 120 and 3000),
  synthetic_only boolean not null default true check (synthetic_only),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists command_intelligence_snapshots_workspace_created_idx
  on public.command_intelligence_snapshots(workspace_id, created_at desc);
create index if not exists command_intelligence_snapshots_tenant_created_idx
  on public.command_intelligence_snapshots(tenant_id, created_at desc);
create index if not exists command_intelligence_snapshots_workspace_state_idx
  on public.command_intelligence_snapshots(workspace_id, command_state, created_at desc);
create index if not exists command_intelligence_snapshots_created_by_idx
  on public.command_intelligence_snapshots(created_by, created_at desc);

alter table public.command_intelligence_snapshots enable row level security;

drop policy if exists command_intelligence_snapshots_governance_select
  on public.command_intelligence_snapshots;
create policy command_intelligence_snapshots_governance_select
on public.command_intelligence_snapshots
for select
to authenticated
using (
  (select private.has_valid_governance_session())
  and (select private.is_pilot_member(tenant_id))
);

revoke all on public.command_intelligence_snapshots from anon, authenticated;
grant select on public.command_intelligence_snapshots to authenticated;

create or replace function private.create_command_intelligence_snapshot(
  p_workspace_slug text,
  p_command_state text,
  p_command_score smallint,
  p_buyer_room_state text,
  p_buyer_room_score smallint,
  p_agent_commander_status text,
  p_workstream_count smallint,
  p_trust_output_count smallint,
  p_evaluation_gate_count smallint,
  p_tool_access_plan_count smallint,
  p_safe_mode_control_count smallint,
  p_next_action_count smallint,
  p_evidence_counts jsonb default '{}'::jsonb,
  p_metrics jsonb default '[]'::jsonb,
  p_workstreams jsonb default '[]'::jsonb,
  p_trust_engine_outputs jsonb default '[]'::jsonb,
  p_evaluation_pipeline jsonb default '[]'::jsonb,
  p_tool_access_plans jsonb default '[]'::jsonb,
  p_safe_mode_controls jsonb default '[]'::jsonb,
  p_next_actions jsonb default '[]'::jsonb,
  p_limitations jsonb default '[]'::jsonb,
  p_observability jsonb default '{}'::jsonb,
  p_snapshot jsonb default '{}'::jsonb,
  p_last_evidence_at timestamptz default null,
  p_operator_attestation text default ''
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  created_snapshot_id uuid;
  normalized_command_state text := lower(trim(coalesce(p_command_state, '')));
  normalized_buyer_state text := lower(trim(coalesce(p_buyer_room_state, '')));
  normalized_agent_status text := lower(trim(coalesce(p_agent_commander_status, '')));
  normalized_evidence_counts jsonb := coalesce(p_evidence_counts, '{}'::jsonb);
  normalized_metrics jsonb := coalesce(p_metrics, '[]'::jsonb);
  normalized_workstreams jsonb := coalesce(p_workstreams, '[]'::jsonb);
  normalized_trust_outputs jsonb := coalesce(p_trust_engine_outputs, '[]'::jsonb);
  normalized_evaluation_pipeline jsonb := coalesce(p_evaluation_pipeline, '[]'::jsonb);
  normalized_tool_access_plans jsonb := coalesce(p_tool_access_plans, '[]'::jsonb);
  normalized_safe_mode_controls jsonb := coalesce(p_safe_mode_controls, '[]'::jsonb);
  normalized_next_actions jsonb := coalesce(p_next_actions, '[]'::jsonb);
  normalized_limitations jsonb := coalesce(p_limitations, '[]'::jsonb);
  normalized_observability jsonb := coalesce(p_observability, '{}'::jsonb);
  normalized_snapshot jsonb := coalesce(p_snapshot, '{}'::jsonb);
  snapshot_boundary text := 'Command Intelligence snapshots store protected synthetic-pilot command posture only. They do not store PHI, patient identifiers, payer member identifiers, medical records, imaging, source contracts, production credentials, secrets, legal advice, compliance certification, security certification, reimbursement determinations, production connector approval, patient outreach authorization, autonomous diagnosis, autonomous treatment, or live healthcare execution approval.';
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead']
  );

  if normalized_command_state not in ('ready', 'review', 'blocked')
    or normalized_buyer_state not in ('ready', 'review', 'blocked')
    or normalized_agent_status not in ('ready', 'review', 'blocked')
    or coalesce(p_command_score, -1) not between 0 and 100
    or coalesce(p_buyer_room_score, -1) not between 0 and 100
    or coalesce(p_workstream_count, -1) < 0
    or coalesce(p_trust_output_count, -1) < 0
    or coalesce(p_evaluation_gate_count, -1) < 0
    or coalesce(p_tool_access_plan_count, -1) < 0
    or coalesce(p_safe_mode_control_count, -1) < 0
    or coalesce(p_next_action_count, -1) < 0
    or p_operator_attestation <> 'aal2-human-reviewed-synthetic-command-posture'
    or jsonb_typeof(normalized_evidence_counts) <> 'object'
    or jsonb_typeof(normalized_metrics) <> 'array'
    or jsonb_typeof(normalized_workstreams) <> 'array'
    or jsonb_typeof(normalized_trust_outputs) <> 'array'
    or jsonb_typeof(normalized_evaluation_pipeline) <> 'array'
    or jsonb_typeof(normalized_tool_access_plans) <> 'array'
    or jsonb_typeof(normalized_safe_mode_controls) <> 'array'
    or jsonb_typeof(normalized_next_actions) <> 'array'
    or jsonb_typeof(normalized_limitations) <> 'array'
    or jsonb_typeof(normalized_observability) <> 'object'
    or jsonb_typeof(normalized_snapshot) <> 'object'
    or jsonb_array_length(normalized_metrics) > 20
    or jsonb_array_length(normalized_workstreams) > 20
    or jsonb_array_length(normalized_trust_outputs) > 20
    or jsonb_array_length(normalized_evaluation_pipeline) > 20
    or jsonb_array_length(normalized_tool_access_plans) > 20
    or jsonb_array_length(normalized_safe_mode_controls) > 20
    or jsonb_array_length(normalized_next_actions) > 20
    or jsonb_array_length(normalized_limitations) > 20
    or pg_column_size(normalized_evidence_counts) > 32768
    or pg_column_size(normalized_metrics) > 65536
    or pg_column_size(normalized_workstreams) > 131072
    or pg_column_size(normalized_trust_outputs) > 65536
    or pg_column_size(normalized_evaluation_pipeline) > 65536
    or pg_column_size(normalized_tool_access_plans) > 65536
    or pg_column_size(normalized_safe_mode_controls) > 65536
    or pg_column_size(normalized_next_actions) > 32768
    or pg_column_size(normalized_limitations) > 32768
    or pg_column_size(normalized_observability) > 65536
    or pg_column_size(normalized_snapshot) > 262144 then
    raise exception 'invalid-command-intelligence-snapshot';
  end if;

  insert into public.command_intelligence_snapshots (
    tenant_id,
    workspace_id,
    command_state,
    command_score,
    buyer_room_state,
    buyer_room_score,
    agent_commander_status,
    workstream_count,
    trust_output_count,
    evaluation_gate_count,
    tool_access_plan_count,
    safe_mode_control_count,
    next_action_count,
    evidence_counts,
    metrics,
    workstreams,
    trust_engine_outputs,
    evaluation_pipeline,
    tool_access_plans,
    safe_mode_controls,
    next_actions,
    limitations,
    observability,
    snapshot,
    last_evidence_at,
    operator_attestation,
    boundary,
    created_by
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    normalized_command_state,
    p_command_score,
    normalized_buyer_state,
    p_buyer_room_score,
    normalized_agent_status,
    p_workstream_count,
    p_trust_output_count,
    p_evaluation_gate_count,
    p_tool_access_plan_count,
    p_safe_mode_control_count,
    p_next_action_count,
    normalized_evidence_counts || jsonb_build_object('syntheticOnly', true),
    normalized_metrics,
    normalized_workstreams,
    normalized_trust_outputs,
    normalized_evaluation_pipeline,
    normalized_tool_access_plans,
    normalized_safe_mode_controls,
    normalized_next_actions,
    normalized_limitations,
    normalized_observability || jsonb_build_object('syntheticOnly', true),
    normalized_snapshot || jsonb_build_object(
      'syntheticOnly', true,
      'workspaceSlug', selected_workspace.slug,
      'operatorAttestation', p_operator_attestation,
      'snapshotBoundary', snapshot_boundary
    ),
    p_last_evidence_at,
    p_operator_attestation,
    snapshot_boundary,
    (select auth.uid())
  )
  returning id into created_snapshot_id;

  insert into public.pilot_audit_events (
    tenant_id,
    workspace_id,
    actor_user_id,
    event_type,
    event_metadata
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    (select auth.uid()),
    'command-intelligence-snapshot-created',
    jsonb_build_object(
      'commandIntelligenceSnapshotId', created_snapshot_id,
      'commandState', normalized_command_state,
      'commandScore', p_command_score,
      'buyerRoomState', normalized_buyer_state,
      'buyerRoomScore', p_buyer_room_score,
      'agentCommanderStatus', normalized_agent_status,
      'workstreamCount', p_workstream_count,
      'trustOutputCount', p_trust_output_count,
      'evaluationGateCount', p_evaluation_gate_count,
      'toolAccessPlanCount', p_tool_access_plan_count,
      'safeModeControlCount', p_safe_mode_control_count,
      'nextActionCount', p_next_action_count,
      'operatorAttestation', p_operator_attestation,
      'assuranceLevel', 'aal2',
      'syntheticOnly', true,
      'noPhi', true,
      'legalSecurityPrivacyBoundary', true
    )
  );

  return created_snapshot_id;
end;
$$;

create or replace function public.create_command_intelligence_snapshot(
  p_workspace_slug text,
  p_command_state text,
  p_command_score smallint,
  p_buyer_room_state text,
  p_buyer_room_score smallint,
  p_agent_commander_status text,
  p_workstream_count smallint,
  p_trust_output_count smallint,
  p_evaluation_gate_count smallint,
  p_tool_access_plan_count smallint,
  p_safe_mode_control_count smallint,
  p_next_action_count smallint,
  p_evidence_counts jsonb default '{}'::jsonb,
  p_metrics jsonb default '[]'::jsonb,
  p_workstreams jsonb default '[]'::jsonb,
  p_trust_engine_outputs jsonb default '[]'::jsonb,
  p_evaluation_pipeline jsonb default '[]'::jsonb,
  p_tool_access_plans jsonb default '[]'::jsonb,
  p_safe_mode_controls jsonb default '[]'::jsonb,
  p_next_actions jsonb default '[]'::jsonb,
  p_limitations jsonb default '[]'::jsonb,
  p_observability jsonb default '{}'::jsonb,
  p_snapshot jsonb default '{}'::jsonb,
  p_last_evidence_at timestamptz default null,
  p_operator_attestation text default ''
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.create_command_intelligence_snapshot(
    p_workspace_slug,
    p_command_state,
    p_command_score,
    p_buyer_room_state,
    p_buyer_room_score,
    p_agent_commander_status,
    p_workstream_count,
    p_trust_output_count,
    p_evaluation_gate_count,
    p_tool_access_plan_count,
    p_safe_mode_control_count,
    p_next_action_count,
    p_evidence_counts,
    p_metrics,
    p_workstreams,
    p_trust_engine_outputs,
    p_evaluation_pipeline,
    p_tool_access_plans,
    p_safe_mode_controls,
    p_next_actions,
    p_limitations,
    p_observability,
    p_snapshot,
    p_last_evidence_at,
    p_operator_attestation
  );
$$;

create or replace function private.record_command_intelligence_packet_download(
  p_workspace_slug text,
  p_snapshot_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_snapshot public.command_intelligence_snapshots%rowtype;
  created_event_id uuid;
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead', 'reviewer']
  );

  select *
  into selected_snapshot
  from public.command_intelligence_snapshots
  where id = p_snapshot_id
    and workspace_id = selected_workspace.id
    and tenant_id = selected_workspace.tenant_id;

  if selected_snapshot.id is null then
    raise exception 'command-intelligence-snapshot-not-found';
  end if;

  insert into public.pilot_audit_events (
    tenant_id,
    workspace_id,
    actor_user_id,
    event_type,
    event_metadata
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    (select auth.uid()),
    'command-intelligence-packet-downloaded',
    jsonb_build_object(
      'commandIntelligenceSnapshotId', selected_snapshot.id,
      'packetType', 'command-intelligence-snapshot-packet',
      'format', 'text/markdown',
      'commandState', selected_snapshot.command_state,
      'commandScore', selected_snapshot.command_score,
      'buyerRoomState', selected_snapshot.buyer_room_state,
      'buyerRoomScore', selected_snapshot.buyer_room_score,
      'operatorAttestation', selected_snapshot.operator_attestation,
      'syntheticOnly', true,
      'assuranceLevel', 'aal2'
    )
  )
  returning id into created_event_id;

  return created_event_id;
end;
$$;

create or replace function public.record_command_intelligence_packet_download(
  p_workspace_slug text,
  p_snapshot_id uuid
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_command_intelligence_packet_download(
    p_workspace_slug,
    p_snapshot_id
  );
$$;

revoke all on function private.create_command_intelligence_snapshot(
  text, text, smallint, text, smallint, text, smallint, smallint, smallint, smallint, smallint, smallint, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, timestamptz, text
) from public, anon, authenticated, service_role;
revoke all on function public.create_command_intelligence_snapshot(
  text, text, smallint, text, smallint, text, smallint, smallint, smallint, smallint, smallint, smallint, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, timestamptz, text
) from public, anon, authenticated, service_role;
revoke all on function private.record_command_intelligence_packet_download(text, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.record_command_intelligence_packet_download(text, uuid)
  from public, anon, authenticated, service_role;

grant execute on function private.create_command_intelligence_snapshot(
  text, text, smallint, text, smallint, text, smallint, smallint, smallint, smallint, smallint, smallint, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, timestamptz, text
) to authenticated;
grant execute on function public.create_command_intelligence_snapshot(
  text, text, smallint, text, smallint, text, smallint, smallint, smallint, smallint, smallint, smallint, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, timestamptz, text
) to authenticated;
grant execute on function private.record_command_intelligence_packet_download(text, uuid)
  to authenticated;
grant execute on function public.record_command_intelligence_packet_download(text, uuid)
  to authenticated;

alter table public.pilot_audit_events
  drop constraint if exists pilot_audit_events_event_type_check;

alter table public.pilot_audit_events
  add constraint pilot_audit_events_event_type_check check (
    event_type in (
      'synthetic-session-created',
      'production-request-denied',
      'proof-packet-downloaded',
      'trustos-decision-recorded',
      'trustos-review-recorded',
      'trustos-governance-packet-downloaded',
      'agent-work-order-created',
      'agent-work-order-transitioned',
      'agent-work-order-closed',
      'agent-work-order-proof-packet-downloaded',
      'agent-workspace-governance-ledger-recorded',
      'trust-safety-incident-created',
      'trust-safety-incident-updated',
      'trust-safety-incident-packet-downloaded',
      'enterprise-proof-packet-downloaded',
      'demo-readiness-snapshot-created',
      'demo-readiness-packet-downloaded',
      'buyer-pilot-room-packet-downloaded',
      'opportunity-workspace-provisioned',
      'buyer-tenant-lifecycle-activated',
      'production-readiness-prepared',
      'customer-activation-approvals-recorded',
      'buyer-diligence-room-prepared',
      'secure-evidence-vault-readiness-prepared',
      'sales-demo-session-recorded',
      'sales-demo-session-packet-downloaded',
      'manual-qa-evidence-packet-recorded',
      'command-intelligence-snapshot-created',
      'command-intelligence-packet-downloaded'
    )
  );

create or replace function public.protected_pilot_runtime_status()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'ready', true,
    'schemaVersion', '2026-06-18.2',
    'boundary', 'synthetic-pilot-only',
    'tenantIsolation', 'postgres-row-level-security',
    'durableAudit', 'append-only',
    'governanceLedger', 'aal2-append-only',
    'agentWorkspaceWorkOrders', true,
    'agentWorkspaceDashboardFilters', true,
    'agentWorkspaceProofPackets', 'aal2-audited-downloads',
    'agentWorkspaceGovernanceLedger', true,
    'agentWorkspaceIncidentExport', 'write-before-release',
    'tenantTrustSafetyIncidents', 'private-schema-rpc-guarded',
    'tenantTrustSafetyIncidentPackets', 'write-before-release',
    'tenantPasskeyIdentity', 'passkey-or-magic-link',
    'enterpriseProofPackets', 'write-before-release-aggregate-export',
    'pilotDemoReadinessSnapshots', 'aal2-audited-snapshot-packets',
    'buyerPilotRoomPackets', 'aal2-audited-buyer-room-packets',
    'opportunityWorkspaceProvisioning', 'aal2-private-rpc-buyer-workspace-linkage',
    'buyerTenantLifecycleAutomation', 'aal2-private-rpc-sso-access-review-archive-controls',
    'productionActivationReadiness', 'aal2-private-rpc-domain-origin-invitation-access-archive-controls',
    'customerActivationApprovals', 'aal2-private-rpc-paid-pilot-setup-approval-hard-gates-retained',
    'buyerDiligenceRooms', 'aal2-private-rpc-metadata-only-signed-controls-diligence',
    'secureEvidenceVaultReadiness', 'aal2-private-rpc-disabled-by-default-storage-control-readiness',
    'salesBuyerDemoSessions', 'aal2-private-rpc-no-phi-demo-session-history',
    'manualQaEvidencePackets', 'aal2-tenant-scoped-no-secret-evidence-persistence',
    'commandIntelligenceSnapshots', 'aal2-audited-command-posture-history',
    'commandIntelligencePackets', 'write-before-release-command-intelligence-packets'
  );
$$;

comment on table public.command_intelligence_snapshots is
  'Tenant-scoped durable SCRIMED Command Intelligence snapshots. RLS select requires authenticated governance context and tenant membership. Writes require guarded AAL2 RPCs. No PHI, patient identifiers, payer member identifiers, medical records, imaging, source contracts, secrets, production credentials, legal advice, compliance certification, security certification, reimbursement determination, production connector authorization, patient outreach approval, autonomous clinical authority, or live healthcare execution approval is permitted.';
comment on function private.create_command_intelligence_snapshot(
  text, text, smallint, text, smallint, text, smallint, smallint, smallint, smallint, smallint, smallint, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, timestamptz, text
) is
  'Persists an AAL2 human-reviewed synthetic Command Intelligence posture snapshot for tenant-scoped buyer/operator diligence.';
comment on function private.record_command_intelligence_packet_download(text, uuid) is
  'Records write-before-release Command Intelligence packet downloads for tenant-scoped synthetic buyer and operator diligence.';
