create or replace function private.record_agent_workspace_work_order_proof_packet_download(
  p_workspace_slug text,
  p_work_order_id uuid,
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
  created_event_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'authentication-required';
  end if;

  select *
  into selected_workspace
  from public.pilot_workspaces
  where slug = p_workspace_slug
    and private.has_pilot_role(tenant_id, array['tenant-admin', 'pilot-lead', 'reviewer']);

  if selected_workspace.id is null then
    raise exception 'workspace-not-found-or-role-denied';
  end if;

  select *
  into selected_work_order
  from public.agent_workspace_work_orders
  where id = p_work_order_id
    and workspace_id = selected_workspace.id
    and tenant_id = selected_workspace.tenant_id;

  if selected_work_order.id is null then
    raise exception 'work-order-not-found';
  end if;

  if jsonb_typeof(coalesce(p_event_metadata, '{}'::jsonb)) <> 'object' then
    raise exception 'invalid-work-order-proof-packet-metadata';
  end if;

  insert into public.agent_workspace_work_order_events (
    tenant_id,
    workspace_id,
    work_order_id,
    actor_user_id,
    event_type,
    prior_state,
    next_state,
    event_metadata
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    selected_work_order.id,
    (select auth.uid()),
    'proof-packet-downloaded',
    selected_work_order.state,
    selected_work_order.state,
    coalesce(p_event_metadata, '{}'::jsonb) || jsonb_build_object(
      'syntheticOnly', true,
      'workOrderId', selected_work_order.id,
      'workOrderType', selected_work_order.work_order_type,
      'state', selected_work_order.state,
      'packetType', 'agent-work-order-proof-packet'
    )
  )
  returning id into created_event_id;

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
    'agent-work-order-proof-packet-downloaded',
    jsonb_build_object(
      'workOrderId', selected_work_order.id,
      'workOrderEventId', created_event_id,
      'workOrderType', selected_work_order.work_order_type,
      'state', selected_work_order.state,
      'format', 'text/markdown',
      'syntheticOnly', true
    )
  );

  return created_event_id;
end;
$$;

create or replace function public.record_agent_workspace_work_order_proof_packet_download(
  p_workspace_slug text,
  p_work_order_id uuid,
  p_event_metadata jsonb default '{}'::jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_agent_workspace_work_order_proof_packet_download(
    p_workspace_slug,
    p_work_order_id,
    p_event_metadata
  );
$$;

revoke all on function private.record_agent_workspace_work_order_proof_packet_download(text, uuid, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.record_agent_workspace_work_order_proof_packet_download(text, uuid, jsonb)
  from public, anon, authenticated, service_role;

grant execute on function private.record_agent_workspace_work_order_proof_packet_download(text, uuid, jsonb)
  to authenticated;
grant execute on function public.record_agent_workspace_work_order_proof_packet_download(text, uuid, jsonb)
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
      'agent-work-order-proof-packet-downloaded'
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
    'schemaVersion', '2026-06-14.3',
    'boundary', 'synthetic-pilot-only',
    'tenantIsolation', 'postgres-row-level-security',
    'durableAudit', 'append-only',
    'governanceLedger', 'aal2-append-only',
    'agentWorkspaceWorkOrders', true,
    'agentWorkspaceDashboardFilters', true,
    'agentWorkspaceProofPackets', 'aal2-audited-downloads'
  );
$$;

comment on function private.record_agent_workspace_work_order_proof_packet_download(text, uuid, jsonb) is
  'Records an append-only proof-packet download event for a tenant-scoped SCRIMED Agent Workspace work order. This does not authorize PHI ingestion, clinical execution, payer submission, patient outreach, record mutation, or connector execution.';
