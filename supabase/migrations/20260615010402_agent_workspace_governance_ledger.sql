create table if not exists public.agent_workspace_governance_ledger (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  work_order_id uuid references public.agent_workspace_work_orders(id) on delete restrict,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  action_type text not null check (
    action_type in (
      'retention-policy-recorded',
      'legal-hold-recorded',
      'legal-hold-released',
      'incident-export-requested'
    )
  ),
  retention_until timestamptz,
  legal_hold_until timestamptz,
  incident_severity text not null default 'not-applicable' check (
    incident_severity in ('not-applicable', 'low', 'moderate', 'high', 'critical')
  ),
  reason text not null check (char_length(reason) between 20 and 2000),
  event_metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(event_metadata) = 'object'),
  boundary text not null check (char_length(boundary) between 80 and 2000),
  synthetic_only boolean not null default true check (synthetic_only),
  created_at timestamptz not null default now()
);

create index if not exists agent_workspace_governance_ledger_workspace_action_idx
  on public.agent_workspace_governance_ledger(workspace_id, action_type, created_at desc);
create index if not exists agent_workspace_governance_ledger_work_order_idx
  on public.agent_workspace_governance_ledger(work_order_id, created_at desc);
create index if not exists agent_workspace_governance_ledger_actor_idx
  on public.agent_workspace_governance_ledger(actor_user_id, created_at desc);
create index if not exists agent_workspace_governance_ledger_retention_idx
  on public.agent_workspace_governance_ledger(retention_until)
  where retention_until is not null;
create index if not exists agent_workspace_governance_ledger_legal_hold_idx
  on public.agent_workspace_governance_ledger(legal_hold_until)
  where legal_hold_until is not null;

alter table public.agent_workspace_governance_ledger enable row level security;

drop policy if exists agent_workspace_governance_ledger_member_select on public.agent_workspace_governance_ledger;
create policy agent_workspace_governance_ledger_member_select
on public.agent_workspace_governance_ledger
for select
to authenticated
using ((select private.is_pilot_member(tenant_id)));

revoke all on public.agent_workspace_governance_ledger from anon, authenticated;
grant select on public.agent_workspace_governance_ledger to authenticated;

create or replace function private.record_agent_workspace_governance_ledger(
  p_workspace_slug text,
  p_action_type text,
  p_reason text,
  p_work_order_id uuid default null,
  p_retention_until timestamptz default null,
  p_legal_hold_until timestamptz default null,
  p_incident_severity text default 'not-applicable',
  p_event_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_work_order public.agent_workspace_work_orders%rowtype;
  created_ledger_id uuid;
  normalized_action_type text := lower(trim(coalesce(p_action_type, '')));
  normalized_incident_severity text := lower(trim(coalesce(p_incident_severity, 'not-applicable')));
  normalized_reason text := trim(coalesce(p_reason, ''));
  normalized_metadata jsonb := coalesce(p_event_metadata, '{}'::jsonb);
  ledger_boundary text := 'Agent Workspace governance ledger entries are append-only synthetic-pilot control evidence for retention, legal hold, and incident export workflows. They do not authorize PHI ingestion, autonomous clinical decisions, payer submission, patient outreach, medical-record mutation, production connector execution, or compliance certification.';
begin
  if (select auth.uid()) is null then
    raise exception 'authentication-required';
  end if;

  select *
  into selected_workspace
  from public.pilot_workspaces
  where slug = p_workspace_slug
    and private.has_pilot_role(tenant_id, array['tenant-admin', 'pilot-lead']);

  if selected_workspace.id is null then
    raise exception 'workspace-not-found-or-role-denied';
  end if;

  if normalized_action_type not in (
    'retention-policy-recorded',
    'legal-hold-recorded',
    'legal-hold-released',
    'incident-export-requested'
  ) then
    raise exception 'invalid-governance-action-type';
  end if;

  if normalized_incident_severity not in ('not-applicable', 'low', 'moderate', 'high', 'critical') then
    raise exception 'invalid-incident-severity';
  end if;

  if char_length(normalized_reason) < 20 or char_length(normalized_reason) > 2000 then
    raise exception 'invalid-governance-reason';
  end if;

  if jsonb_typeof(normalized_metadata) <> 'object' then
    raise exception 'invalid-governance-metadata';
  end if;

  if p_work_order_id is not null then
    select *
    into selected_work_order
    from public.agent_workspace_work_orders
    where id = p_work_order_id
      and workspace_id = selected_workspace.id
      and tenant_id = selected_workspace.tenant_id;

    if selected_work_order.id is null then
      raise exception 'work-order-not-found';
    end if;
  end if;

  if normalized_action_type = 'retention-policy-recorded'
    and (p_retention_until is null or p_retention_until <= now()) then
    raise exception 'retention-until-required';
  end if;

  if normalized_action_type = 'legal-hold-recorded'
    and p_legal_hold_until is not null
    and p_legal_hold_until <= now() then
    raise exception 'legal-hold-until-must-be-future';
  end if;

  if normalized_action_type = 'legal-hold-released'
    and p_legal_hold_until is not null then
    raise exception 'legal-hold-release-cannot-set-future-hold';
  end if;

  if normalized_action_type = 'incident-export-requested'
    and normalized_incident_severity = 'not-applicable' then
    raise exception 'incident-severity-required';
  end if;

  if normalized_action_type <> 'incident-export-requested'
    and normalized_incident_severity <> 'not-applicable' then
    raise exception 'incident-severity-only-for-incident-export';
  end if;

  insert into public.agent_workspace_governance_ledger (
    tenant_id,
    workspace_id,
    work_order_id,
    actor_user_id,
    action_type,
    retention_until,
    legal_hold_until,
    incident_severity,
    reason,
    event_metadata,
    boundary
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    p_work_order_id,
    (select auth.uid()),
    normalized_action_type,
    p_retention_until,
    p_legal_hold_until,
    normalized_incident_severity,
    normalized_reason,
    normalized_metadata || jsonb_build_object(
      'syntheticOnly', true,
      'workspaceSlug', selected_workspace.slug,
      'workOrderId', p_work_order_id,
      'governanceActionType', normalized_action_type
    ),
    ledger_boundary
  )
  returning id into created_ledger_id;

  insert into public.pilot_audit_events (
    tenant_id,
    workspace_id,
    session_id,
    actor_user_id,
    event_type,
    event_metadata
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    selected_work_order.pilot_session_id,
    (select auth.uid()),
    'agent-workspace-governance-ledger-recorded',
    jsonb_build_object(
      'ledgerId', created_ledger_id,
      'workOrderId', p_work_order_id,
      'actionType', normalized_action_type,
      'retentionUntil', p_retention_until,
      'legalHoldUntil', p_legal_hold_until,
      'incidentSeverity', normalized_incident_severity,
      'syntheticOnly', true
    )
  );

  return created_ledger_id;
end;
$$;

create or replace function public.record_agent_workspace_governance_ledger(
  p_workspace_slug text,
  p_action_type text,
  p_reason text,
  p_work_order_id uuid default null,
  p_retention_until timestamptz default null,
  p_legal_hold_until timestamptz default null,
  p_incident_severity text default 'not-applicable',
  p_event_metadata jsonb default '{}'::jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_agent_workspace_governance_ledger(
    p_workspace_slug,
    p_action_type,
    p_reason,
    p_work_order_id,
    p_retention_until,
    p_legal_hold_until,
    p_incident_severity,
    p_event_metadata
  );
$$;

revoke all on function private.record_agent_workspace_governance_ledger(text, text, text, uuid, timestamptz, timestamptz, text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.record_agent_workspace_governance_ledger(text, text, text, uuid, timestamptz, timestamptz, text, jsonb)
  from public, anon, authenticated, service_role;

grant execute on function private.record_agent_workspace_governance_ledger(text, text, text, uuid, timestamptz, timestamptz, text, jsonb)
  to authenticated;
grant execute on function public.record_agent_workspace_governance_ledger(text, text, text, uuid, timestamptz, timestamptz, text, jsonb)
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
      'agent-workspace-governance-ledger-recorded'
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
    'schemaVersion', '2026-06-15.1',
    'boundary', 'synthetic-pilot-only',
    'tenantIsolation', 'postgres-row-level-security',
    'durableAudit', 'append-only',
    'governanceLedger', 'aal2-append-only',
    'agentWorkspaceWorkOrders', true,
    'agentWorkspaceDashboardFilters', true,
    'agentWorkspaceProofPackets', 'aal2-audited-downloads',
    'agentWorkspaceGovernanceLedger', true,
    'agentWorkspaceIncidentExport', 'write-before-release'
  );
$$;

comment on table public.agent_workspace_governance_ledger is
  'Append-only tenant-scoped SCRIMED Agent Workspace governance ledger for synthetic-pilot retention, legal hold, legal release, and incident export control evidence.';
comment on function private.record_agent_workspace_governance_ledger(text, text, text, uuid, timestamptz, timestamptz, text, jsonb) is
  'Records append-only synthetic-pilot governance evidence for SCRIMED Agent Workspace retention, legal hold, legal release, and incident export actions. Live PHI ingestion, autonomous clinical decisions, payer submission, patient outreach, record mutation, connector execution, and compliance certification remain prohibited.';
