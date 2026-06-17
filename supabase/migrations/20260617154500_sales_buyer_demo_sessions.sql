create table if not exists private.sales_buyer_demo_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  intake_id text not null references private.pilot_intake_submissions(intake_id) on delete restrict,
  workspace_id uuid references public.pilot_workspaces(id) on delete restrict,
  workspace_slug text not null check (workspace_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  workspace_mapping_mode text not null
    check (workspace_mapping_mode in ('default-synthetic-workspace', 'buyer-specific-workspace')),
  demo_status text not null default 'recorded'
    check (demo_status in ('recorded', 'ready-for-follow-up', 'follow-up-needed', 'blocked-review-required')),
  path_status text not null
    check (path_status in ('ready-for-authenticated-operator-demo', 'sequenced-blockers-visible', 'manual-review-required')),
  readiness_score integer not null check (readiness_score between 0 and 100),
  deal_room_readiness_score integer not null check (deal_room_readiness_score between 0 and 100),
  completed_step_count integer not null check (completed_step_count >= 0),
  executable_step_count integer not null check (executable_step_count >= 0),
  selected_step_ids jsonb not null default '[]'::jsonb
    check (jsonb_typeof(selected_step_ids) = 'array' and pg_column_size(selected_step_ids) <= 32768),
  selected_packet_routes jsonb not null default '[]'::jsonb
    check (jsonb_typeof(selected_packet_routes) = 'array' and pg_column_size(selected_packet_routes) <= 32768),
  operator_notes text not null default '' check (char_length(operator_notes) <= 3000),
  buyer_questions jsonb not null default '[]'::jsonb
    check (jsonb_typeof(buyer_questions) = 'array' and pg_column_size(buyer_questions) <= 32768),
  blockers jsonb not null default '[]'::jsonb
    check (jsonb_typeof(blockers) = 'array' and pg_column_size(blockers) <= 32768),
  workarounds jsonb not null default '[]'::jsonb
    check (jsonb_typeof(workarounds) = 'array' and pg_column_size(workarounds) <= 32768),
  next_actions jsonb not null default '[]'::jsonb
    check (jsonb_typeof(next_actions) = 'array' and pg_column_size(next_actions) <= 32768),
  follow_up_plan jsonb not null default '{}'::jsonb
    check (jsonb_typeof(follow_up_plan) = 'object' and pg_column_size(follow_up_plan) <= 32768),
  hard_gates jsonb not null default '[]'::jsonb
    check (jsonb_typeof(hard_gates) = 'array' and pg_column_size(hard_gates) <= 32768),
  target_audiences jsonb not null default '[]'::jsonb
    check (jsonb_typeof(target_audiences) = 'array' and pg_column_size(target_audiences) <= 32768),
  revenue_path jsonb not null default '[]'::jsonb
    check (jsonb_typeof(revenue_path) = 'array' and pg_column_size(revenue_path) <= 32768),
  demo_runbook jsonb not null default '[]'::jsonb
    check (jsonb_typeof(demo_runbook) = 'array' and pg_column_size(demo_runbook) <= 32768),
  path_snapshot jsonb not null default '{}'::jsonb
    check (jsonb_typeof(path_snapshot) = 'object' and pg_column_size(path_snapshot) <= 196608),
  last_packet_generated_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  boundary text not null check (char_length(boundary) between 80 and 2200)
);

create index if not exists sales_buyer_demo_sessions_tenant_created_idx
  on private.sales_buyer_demo_sessions(tenant_id, created_at desc);
create index if not exists sales_buyer_demo_sessions_intake_created_idx
  on private.sales_buyer_demo_sessions(intake_id, created_at desc);
create index if not exists sales_buyer_demo_sessions_workspace_id_idx
  on private.sales_buyer_demo_sessions(workspace_id);
create index if not exists sales_buyer_demo_sessions_workspace_slug_idx
  on private.sales_buyer_demo_sessions(workspace_slug);
create index if not exists sales_buyer_demo_sessions_created_by_idx
  on private.sales_buyer_demo_sessions(created_by);
create index if not exists sales_buyer_demo_sessions_updated_by_idx
  on private.sales_buyer_demo_sessions(updated_by);

alter table private.sales_buyer_demo_sessions enable row level security;
revoke all on private.sales_buyer_demo_sessions from public, anon, authenticated;

drop policy if exists sales_buyer_demo_sessions_deny_direct_access
  on private.sales_buyer_demo_sessions;
create policy sales_buyer_demo_sessions_deny_direct_access
on private.sales_buyer_demo_sessions
as restrictive
for all
to public
using (false)
with check (false);

alter table private.sales_opportunity_audit_events
  drop constraint if exists sales_opportunity_audit_events_event_type_check;

alter table private.sales_opportunity_audit_events
  add constraint sales_opportunity_audit_events_event_type_check check (
    event_type in (
      'opportunity-updated',
      'proposal-downloaded',
      'crm-sync-recorded',
      'crm-export-downloaded',
      'follow-up-draft-downloaded',
      'follow-up-completed',
      'assessment-invitation-downloaded',
      'attribution-analytics-packet-downloaded',
      'buyer-deal-room-packet-downloaded',
      'opportunity-workspace-provisioned',
      'opportunity-workspace-packet-downloaded',
      'buyer-tenant-lifecycle-activated',
      'buyer-tenant-lifecycle-packet-downloaded',
      'production-readiness-prepared',
      'production-readiness-packet-downloaded',
      'customer-activation-approvals-recorded',
      'customer-activation-approvals-packet-downloaded',
      'buyer-diligence-room-prepared',
      'buyer-diligence-packet-downloaded',
      'secure-evidence-vault-readiness-prepared',
      'secure-evidence-vault-readiness-packet-downloaded',
      'sales-demo-session-recorded',
      'sales-demo-session-packet-downloaded'
    )
  );

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
      'sales-demo-session-packet-downloaded'
    )
  );

create or replace function private.sales_buyer_demo_session_json(
  demo_session private.sales_buyer_demo_sessions
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return jsonb_build_object(
    'id', demo_session.id,
    'tenantId', demo_session.tenant_id,
    'intakeId', demo_session.intake_id,
    'workspaceId', demo_session.workspace_id,
    'workspaceSlug', demo_session.workspace_slug,
    'workspaceMappingMode', demo_session.workspace_mapping_mode,
    'demoStatus', demo_session.demo_status,
    'pathStatus', demo_session.path_status,
    'readinessScore', demo_session.readiness_score,
    'dealRoomReadinessScore', demo_session.deal_room_readiness_score,
    'completedStepCount', demo_session.completed_step_count,
    'executableStepCount', demo_session.executable_step_count,
    'selectedStepIds', demo_session.selected_step_ids,
    'selectedPacketRoutes', demo_session.selected_packet_routes,
    'operatorNotes', demo_session.operator_notes,
    'buyerQuestions', demo_session.buyer_questions,
    'blockers', demo_session.blockers,
    'workarounds', demo_session.workarounds,
    'nextActions', demo_session.next_actions,
    'followUpPlan', demo_session.follow_up_plan,
    'hardGates', demo_session.hard_gates,
    'targetAudiences', demo_session.target_audiences,
    'revenuePath', demo_session.revenue_path,
    'demoRunbook', demo_session.demo_runbook,
    'pathSnapshot', demo_session.path_snapshot,
    'lastPacketGeneratedAt', demo_session.last_packet_generated_at,
    'createdAt', demo_session.created_at,
    'createdBy', demo_session.created_by,
    'updatedAt', demo_session.updated_at,
    'updatedBy', demo_session.updated_by,
    'boundary', demo_session.boundary
  );
end;
$$;

create or replace function private.list_sales_buyer_demo_sessions(p_intake_id text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  target_tenant_id uuid;
begin
  target_tenant_id := private.require_sales_tenant_admin();

  if not exists (
    select 1
    from private.pilot_intake_submissions opportunity
    where opportunity.tenant_id = target_tenant_id
      and opportunity.intake_id = p_intake_id
  ) then
    raise exception 'sales-opportunity-not-found';
  end if;

  return coalesce(
    (
      select jsonb_agg(private.sales_buyer_demo_session_json(demo_session) order by demo_session.created_at desc)
      from private.sales_buyer_demo_sessions demo_session
      where demo_session.tenant_id = target_tenant_id
        and demo_session.intake_id = p_intake_id
    ),
    '[]'::jsonb
  );
end;
$$;

create or replace function private.record_sales_buyer_demo_session(
  p_intake_id text,
  p_session_input jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_tenant_id uuid;
  selected_opportunity private.pilot_intake_submissions%rowtype;
  selected_workspace private.sales_opportunity_workspaces%rowtype;
  created_session private.sales_buyer_demo_sessions%rowtype;
  created_sales_event_id uuid;
  demo_boundary text :=
    'Persisted buyer demo sessions capture no-PHI operator notes, synthetic proof-packet selections, buyer questions, blockers, workarounds, next actions, and follow-up plans for SCRIMED governed synthetic pilot sales only. They do not store PHI, patient identifiers, live clinical records, payer member data, diagnosis details, medical-record excerpts, source contracts, secrets, credentials, legal advice, compliance certification, reimbursement determinations, patient outreach approval, autonomous care approval, or live healthcare execution authorization.';
  payload_text text;
  selected_step_ids jsonb;
  selected_packet_routes jsonb;
  buyer_questions jsonb;
  blockers jsonb;
  workarounds jsonb;
  next_actions jsonb;
  follow_up_plan jsonb;
  hard_gates jsonb;
  target_audiences jsonb;
  revenue_path jsonb;
  demo_runbook jsonb;
  path_snapshot jsonb;
  workspace_slug_value text;
  workspace_mapping_mode_value text;
  demo_status_value text;
  path_status_value text;
  readiness_score_value integer;
  deal_room_readiness_score_value integer;
  completed_step_count_value integer;
  executable_step_count_value integer;
begin
  target_tenant_id := private.require_sales_tenant_admin();
  perform private.require_sales_server_token();

  if jsonb_typeof(p_session_input) <> 'object'
    or pg_column_size(p_session_input) > 262144 then
    raise exception 'sales-demo-session-invalid-payload';
  end if;

  payload_text := coalesce(
    jsonb_build_object(
      'operatorNotes', p_session_input -> 'operatorNotes',
      'buyerQuestions', p_session_input -> 'buyerQuestions',
      'nextActions', p_session_input -> 'nextActions',
      'followUpPlan', p_session_input -> 'followUpPlan',
      'selectedStepIds', p_session_input -> 'selectedStepIds',
      'selectedPacketRoutes', p_session_input -> 'selectedPacketRoutes'
    )::text,
    ''
  );

  if payload_text ~*
    '(^|[^a-z])(phi|ephi|mrn|dob)([^a-z]|$)|medical record|patient identifier|member id|diagnosis details?|diagnosed with|date of birth|protected health information|social security|ssn|payer member|clinical note|lab result|radiology report|prescription number' then
    raise exception 'sales-demo-session-prohibited-data';
  end if;

  select *
  into selected_opportunity
  from private.pilot_intake_submissions
  where tenant_id = target_tenant_id
    and intake_id = p_intake_id;

  if selected_opportunity.id is null then
    raise exception 'sales-opportunity-not-found';
  end if;

  if selected_opportunity.pipeline_stage = 'closed-lost' then
    raise exception 'sales-demo-session-closed-lost';
  end if;

  select *
  into selected_workspace
  from private.sales_opportunity_workspaces
  where tenant_id = target_tenant_id
    and intake_id = p_intake_id
  limit 1;

  workspace_slug_value := coalesce(
    selected_workspace.workspace_slug,
    nullif(trim(coalesce(p_session_input ->> 'workspaceSlug', '')), ''),
    'atlas-synthetic-evaluation'
  );

  if workspace_slug_value !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'sales-demo-session-invalid-workspace-slug';
  end if;

  workspace_mapping_mode_value := case
    when selected_workspace.workspace_slug is not null then 'buyer-specific-workspace'
    else coalesce(nullif(p_session_input ->> 'workspaceMappingMode', ''), 'default-synthetic-workspace')
  end;

  if workspace_mapping_mode_value not in ('default-synthetic-workspace', 'buyer-specific-workspace') then
    raise exception 'sales-demo-session-invalid-workspace-mode';
  end if;

  demo_status_value := coalesce(nullif(p_session_input ->> 'demoStatus', ''), 'recorded');
  if demo_status_value not in ('recorded', 'ready-for-follow-up', 'follow-up-needed', 'blocked-review-required') then
    raise exception 'sales-demo-session-invalid-status';
  end if;

  path_status_value := coalesce(nullif(p_session_input ->> 'pathStatus', ''), 'sequenced-blockers-visible');
  if path_status_value not in ('ready-for-authenticated-operator-demo', 'sequenced-blockers-visible', 'manual-review-required') then
    raise exception 'sales-demo-session-invalid-path-status';
  end if;

  if coalesce(p_session_input ->> 'readinessScore', '0') !~ '^[0-9]{1,3}$'
    or coalesce(p_session_input ->> 'dealRoomReadinessScore', '0') !~ '^[0-9]{1,3}$'
    or coalesce(p_session_input ->> 'completedStepCount', '0') !~ '^[0-9]{1,3}$'
    or coalesce(p_session_input ->> 'executableStepCount', '0') !~ '^[0-9]{1,3}$' then
    raise exception 'sales-demo-session-invalid-score';
  end if;

  readiness_score_value := greatest(0, least(100, coalesce(p_session_input ->> 'readinessScore', '0')::integer));
  deal_room_readiness_score_value := greatest(0, least(100, coalesce(p_session_input ->> 'dealRoomReadinessScore', '0')::integer));
  completed_step_count_value := greatest(0, coalesce(p_session_input ->> 'completedStepCount', '0')::integer);
  executable_step_count_value := greatest(0, coalesce(p_session_input ->> 'executableStepCount', '0')::integer);

  selected_step_ids := case
    when jsonb_typeof(p_session_input -> 'selectedStepIds') = 'array' then p_session_input -> 'selectedStepIds'
    else '[]'::jsonb
  end;
  selected_packet_routes := case
    when jsonb_typeof(p_session_input -> 'selectedPacketRoutes') = 'array' then p_session_input -> 'selectedPacketRoutes'
    else '[]'::jsonb
  end;
  buyer_questions := case
    when jsonb_typeof(p_session_input -> 'buyerQuestions') = 'array' then p_session_input -> 'buyerQuestions'
    else '[]'::jsonb
  end;
  blockers := case
    when jsonb_typeof(p_session_input -> 'blockers') = 'array' then p_session_input -> 'blockers'
    else '[]'::jsonb
  end;
  workarounds := case
    when jsonb_typeof(p_session_input -> 'workarounds') = 'array' then p_session_input -> 'workarounds'
    else '[]'::jsonb
  end;
  next_actions := case
    when jsonb_typeof(p_session_input -> 'nextActions') = 'array' then p_session_input -> 'nextActions'
    else '[]'::jsonb
  end;
  follow_up_plan := case
    when jsonb_typeof(p_session_input -> 'followUpPlan') = 'object' then p_session_input -> 'followUpPlan'
    else '{}'::jsonb
  end;
  hard_gates := case
    when jsonb_typeof(p_session_input -> 'hardGates') = 'array' then p_session_input -> 'hardGates'
    else '[]'::jsonb
  end;
  target_audiences := case
    when jsonb_typeof(p_session_input -> 'targetAudiences') = 'array' then p_session_input -> 'targetAudiences'
    else '[]'::jsonb
  end;
  revenue_path := case
    when jsonb_typeof(p_session_input -> 'revenuePath') = 'array' then p_session_input -> 'revenuePath'
    else '[]'::jsonb
  end;
  demo_runbook := case
    when jsonb_typeof(p_session_input -> 'demoRunbook') = 'array' then p_session_input -> 'demoRunbook'
    else '[]'::jsonb
  end;
  path_snapshot := case
    when jsonb_typeof(p_session_input -> 'pathSnapshot') = 'object' then p_session_input -> 'pathSnapshot'
    else '{}'::jsonb
  end;

  insert into private.sales_buyer_demo_sessions (
    tenant_id,
    intake_id,
    workspace_id,
    workspace_slug,
    workspace_mapping_mode,
    demo_status,
    path_status,
    readiness_score,
    deal_room_readiness_score,
    completed_step_count,
    executable_step_count,
    selected_step_ids,
    selected_packet_routes,
    operator_notes,
    buyer_questions,
    blockers,
    workarounds,
    next_actions,
    follow_up_plan,
    hard_gates,
    target_audiences,
    revenue_path,
    demo_runbook,
    path_snapshot,
    created_by,
    updated_by,
    boundary
  )
  values (
    target_tenant_id,
    selected_opportunity.intake_id,
    selected_workspace.workspace_id,
    workspace_slug_value,
    workspace_mapping_mode_value,
    demo_status_value,
    path_status_value,
    readiness_score_value,
    deal_room_readiness_score_value,
    completed_step_count_value,
    executable_step_count_value,
    selected_step_ids,
    selected_packet_routes,
    left(trim(coalesce(p_session_input ->> 'operatorNotes', '')), 3000),
    buyer_questions,
    blockers,
    workarounds,
    next_actions,
    follow_up_plan,
    hard_gates,
    target_audiences,
    revenue_path,
    demo_runbook,
    path_snapshot,
    (select auth.uid()),
    (select auth.uid()),
    demo_boundary
  )
  returning * into created_session;

  insert into private.sales_opportunity_audit_events (
    tenant_id, intake_id, actor_user_id, event_type, event_metadata
  )
  values (
    target_tenant_id,
    selected_opportunity.intake_id,
    (select auth.uid()),
    'sales-demo-session-recorded',
    jsonb_build_object(
      'demoSessionId', created_session.id,
      'workspaceId', created_session.workspace_id,
      'workspaceSlug', created_session.workspace_slug,
      'workspaceMappingMode', created_session.workspace_mapping_mode,
      'pathStatus', created_session.path_status,
      'readinessScore', created_session.readiness_score,
      'selectedStepCount', jsonb_array_length(created_session.selected_step_ids),
      'selectedPacketCount', jsonb_array_length(created_session.selected_packet_routes),
      'noPhiBoundary', true,
      'syntheticOnly', true
    )
  )
  returning id into created_sales_event_id;

  if created_session.workspace_id is not null then
    insert into public.pilot_audit_events (
      tenant_id,
      workspace_id,
      session_id,
      actor_user_id,
      event_type,
      event_metadata
    )
    values (
      target_tenant_id,
      created_session.workspace_id,
      null,
      (select auth.uid()),
      'sales-demo-session-recorded',
      jsonb_build_object(
        'intakeId', selected_opportunity.intake_id,
        'demoSessionId', created_session.id,
        'salesAuditEventId', created_sales_event_id,
        'assuranceLevel', 'aal2',
        'metadataOnly', true,
        'syntheticOnly', true
      )
    );
  end if;

  return jsonb_build_object(
    'buyerDemoSession', private.sales_buyer_demo_session_json(created_session),
    'created', true,
    'auditEventId', created_sales_event_id,
    'boundary', demo_boundary
  );
end;
$$;

create or replace function private.record_sales_buyer_demo_session_packet_download(
  p_intake_id text,
  p_session_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_tenant_id uuid;
  selected_session private.sales_buyer_demo_sessions%rowtype;
  created_event_id uuid;
begin
  target_tenant_id := private.require_sales_tenant_admin();
  perform private.require_sales_server_token();

  update private.sales_buyer_demo_sessions demo_session
  set last_packet_generated_at = now(),
      updated_at = now(),
      updated_by = (select auth.uid())
  where demo_session.tenant_id = target_tenant_id
    and demo_session.intake_id = p_intake_id
    and demo_session.id = p_session_id
  returning * into selected_session;

  if selected_session.id is null then
    raise exception 'sales-demo-session-not-found';
  end if;

  insert into private.sales_opportunity_audit_events (
    tenant_id, intake_id, actor_user_id, event_type, event_metadata
  )
  values (
    target_tenant_id,
    p_intake_id,
    (select auth.uid()),
    'sales-demo-session-packet-downloaded',
    jsonb_build_object(
      'demoSessionId', selected_session.id,
      'workspaceId', selected_session.workspace_id,
      'workspaceSlug', selected_session.workspace_slug,
      'packetType', 'buyer-demo-session-packet',
      'format', 'text/markdown',
      'pathStatus', selected_session.path_status,
      'readinessScore', selected_session.readiness_score,
      'noPhiBoundary', true,
      'syntheticOnly', true
    )
  )
  returning id into created_event_id;

  if selected_session.workspace_id is not null then
    insert into public.pilot_audit_events (
      tenant_id,
      workspace_id,
      session_id,
      actor_user_id,
      event_type,
      event_metadata
    )
    values (
      target_tenant_id,
      selected_session.workspace_id,
      null,
      (select auth.uid()),
      'sales-demo-session-packet-downloaded',
      jsonb_build_object(
        'intakeId', p_intake_id,
        'demoSessionId', selected_session.id,
        'salesAuditEventId', created_event_id,
        'assuranceLevel', 'aal2',
        'metadataOnly', true,
        'syntheticOnly', true
      )
    );
  end if;

  return jsonb_build_object(
    'buyerDemoSession', private.sales_buyer_demo_session_json(selected_session),
    'created', false,
    'auditEventId', created_event_id,
    'boundary', selected_session.boundary
  );
end;
$$;

create or replace function public.list_sales_buyer_demo_sessions(p_intake_id text)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select private.list_sales_buyer_demo_sessions(p_intake_id);
$$;

create or replace function public.record_sales_buyer_demo_session(
  p_intake_id text,
  p_session_input jsonb
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_sales_buyer_demo_session(p_intake_id, p_session_input);
$$;

create or replace function public.record_sales_buyer_demo_session_packet_download(
  p_intake_id text,
  p_session_id uuid
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_sales_buyer_demo_session_packet_download(p_intake_id, p_session_id);
$$;

revoke all on function private.sales_buyer_demo_session_json(private.sales_buyer_demo_sessions)
  from public, anon, authenticated, service_role;
revoke all on function private.list_sales_buyer_demo_sessions(text)
  from public, anon, authenticated, service_role;
revoke all on function private.record_sales_buyer_demo_session(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function private.record_sales_buyer_demo_session_packet_download(text, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.list_sales_buyer_demo_sessions(text)
  from public, anon, authenticated, service_role;
revoke all on function public.record_sales_buyer_demo_session(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.record_sales_buyer_demo_session_packet_download(text, uuid)
  from public, anon, authenticated, service_role;

grant execute on function private.sales_buyer_demo_session_json(private.sales_buyer_demo_sessions)
  to authenticated;
grant execute on function private.list_sales_buyer_demo_sessions(text)
  to authenticated;
grant execute on function private.record_sales_buyer_demo_session(text, jsonb)
  to authenticated;
grant execute on function private.record_sales_buyer_demo_session_packet_download(text, uuid)
  to authenticated;
grant execute on function public.list_sales_buyer_demo_sessions(text)
  to authenticated;
grant execute on function public.record_sales_buyer_demo_session(text, jsonb)
  to authenticated;
grant execute on function public.record_sales_buyer_demo_session_packet_download(text, uuid)
  to authenticated;

create or replace function public.protected_pilot_runtime_status()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'ready', true,
    'schemaVersion', '2026-06-17.3',
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
    'salesBuyerDemoSessions', 'aal2-private-rpc-no-phi-demo-session-history'
  );
$$;

comment on table private.sales_buyer_demo_sessions is
  'Private no-PHI Sales Operations buyer demo session history. Direct Data API access is denied; writes require AAL2 tenant-admin context plus server runtime authorization.';
comment on function private.record_sales_buyer_demo_session(text, jsonb) is
  'Records an authenticated no-PHI buyer demo session with operator notes, packet selections, blockers, workarounds, next actions, and path snapshot metadata. It does not store PHI, clinical records, payer member data, secrets, legal advice, compliance certification, or production authorization.';
comment on function private.record_sales_buyer_demo_session_packet_download(text, uuid) is
  'Records audited release of a buyer demo session packet. The packet remains a no-PHI sales and diligence artifact and does not authorize live healthcare execution.';
