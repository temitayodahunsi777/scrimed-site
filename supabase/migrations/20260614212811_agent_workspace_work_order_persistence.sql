create table if not exists public.agent_workspace_work_orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  pilot_session_id uuid references public.pilot_demo_sessions(id) on delete restrict,
  trustos_decision_id uuid references public.trustos_decisions(id) on delete restrict,
  work_order_type text not null check (
    work_order_type in (
      'rcm-denial-appeal-generation',
      'clinical-trial-matching',
      'pre-visit-chart-review',
      'post-visit-care-plan-drafting',
      'investor-outreach-tracking',
      'security-scan',
      'data-transformation-job'
    )
  ),
  state text not null default 'drafted' check (
    state in (
      'drafted',
      'planned',
      'routed',
      'sandboxed',
      'trustqa-held',
      'human-review',
      'proof-ready',
      'blocked',
      'closed'
    )
  ),
  objective text not null check (char_length(objective) between 20 and 2000),
  agent_owner text not null check (char_length(agent_owner) between 2 and 180),
  model_router_policy text not null check (char_length(model_router_policy) between 20 and 2000),
  trust_card jsonb not null default '{}'::jsonb check (jsonb_typeof(trust_card) = 'object'),
  memory_scopes jsonb not null default '[]'::jsonb check (jsonb_typeof(memory_scopes) = 'array'),
  tool_scopes jsonb not null default '[]'::jsonb check (jsonb_typeof(tool_scopes) = 'array'),
  reviewer_checkpoints jsonb not null default '[]'::jsonb check (jsonb_typeof(reviewer_checkpoints) = 'array'),
  blocked_actions jsonb not null default '[]'::jsonb check (jsonb_typeof(blocked_actions) = 'array'),
  result_summary text not null default '' check (char_length(result_summary) <= 4000),
  outcome_metrics jsonb not null default '{}'::jsonb check (jsonb_typeof(outcome_metrics) = 'object'),
  failure_reason text not null default '' check (char_length(failure_reason) <= 2000),
  retry_count integer not null default 0 check (retry_count between 0 and 10),
  assigned_reviewer_id uuid references auth.users(id) on delete restrict,
  created_by uuid not null references auth.users(id) on delete restrict,
  updated_by uuid not null references auth.users(id) on delete restrict,
  reviewed_by uuid references auth.users(id) on delete restrict,
  closed_by uuid references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  review_due_at timestamptz,
  reviewed_at timestamptz,
  closed_at timestamptz,
  boundary text not null check (char_length(boundary) between 80 and 2000),
  synthetic_only boolean not null default true check (synthetic_only)
);

create table if not exists public.agent_workspace_work_order_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  work_order_id uuid not null references public.agent_workspace_work_orders(id) on delete restrict,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  event_type text not null check (
    event_type in (
      'work-order-created',
      'state-transitioned',
      'reviewer-assigned',
      'reviewer-disposition-recorded',
      'retry-recorded',
      'work-order-blocked',
      'work-order-closed',
      'proof-packet-downloaded'
    )
  ),
  prior_state text check (
    prior_state is null or prior_state in (
      'drafted',
      'planned',
      'routed',
      'sandboxed',
      'trustqa-held',
      'human-review',
      'proof-ready',
      'blocked',
      'closed'
    )
  ),
  next_state text not null check (
    next_state in (
      'drafted',
      'planned',
      'routed',
      'sandboxed',
      'trustqa-held',
      'human-review',
      'proof-ready',
      'blocked',
      'closed'
    )
  ),
  event_metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(event_metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists agent_workspace_work_orders_tenant_id_idx
  on public.agent_workspace_work_orders(tenant_id);
create index if not exists agent_workspace_work_orders_workspace_state_idx
  on public.agent_workspace_work_orders(workspace_id, state, updated_at desc);
create index if not exists agent_workspace_work_orders_workspace_created_at_idx
  on public.agent_workspace_work_orders(workspace_id, created_at desc);
create index if not exists agent_workspace_work_orders_created_by_idx
  on public.agent_workspace_work_orders(created_by);
create index if not exists agent_workspace_work_orders_assigned_reviewer_idx
  on public.agent_workspace_work_orders(assigned_reviewer_id);
create index if not exists agent_workspace_work_order_events_work_order_idx
  on public.agent_workspace_work_order_events(work_order_id, created_at desc);
create index if not exists agent_workspace_work_order_events_workspace_idx
  on public.agent_workspace_work_order_events(workspace_id, created_at desc);
create index if not exists agent_workspace_work_order_events_actor_idx
  on public.agent_workspace_work_order_events(actor_user_id);

alter table public.agent_workspace_work_orders enable row level security;
alter table public.agent_workspace_work_order_events enable row level security;

drop policy if exists agent_workspace_work_orders_member_select on public.agent_workspace_work_orders;
create policy agent_workspace_work_orders_member_select
on public.agent_workspace_work_orders
for select
to authenticated
using ((select private.is_pilot_member(tenant_id)));

drop policy if exists agent_workspace_work_order_events_member_select on public.agent_workspace_work_order_events;
create policy agent_workspace_work_order_events_member_select
on public.agent_workspace_work_order_events
for select
to authenticated
using ((select private.is_pilot_member(tenant_id)));

revoke all on public.agent_workspace_work_orders from anon, authenticated;
revoke all on public.agent_workspace_work_order_events from anon, authenticated;

grant select on public.agent_workspace_work_orders to authenticated;
grant select on public.agent_workspace_work_order_events to authenticated;

create or replace function private.create_agent_workspace_work_order(
  p_workspace_slug text,
  p_work_order_type text,
  p_objective text,
  p_agent_owner text,
  p_model_router_policy text,
  p_memory_scopes jsonb,
  p_tool_scopes jsonb,
  p_reviewer_checkpoints jsonb,
  p_blocked_actions jsonb,
  p_trust_card jsonb default '{}'::jsonb,
  p_pilot_session_id uuid default null,
  p_trustos_decision_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_session public.pilot_demo_sessions%rowtype;
  selected_decision public.trustos_decisions%rowtype;
  created_work_order_id uuid;
  work_order_boundary text := 'Agent workspace work orders retain synthetic or metadata-only enterprise pilot evidence. They do not authorize live PHI ingestion, autonomous clinical decisions, payer submission, patient outreach, medical-record mutation, or production connector execution.';
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

  if p_work_order_type not in (
    'rcm-denial-appeal-generation',
    'clinical-trial-matching',
    'pre-visit-chart-review',
    'post-visit-care-plan-drafting',
    'investor-outreach-tracking',
    'security-scan',
    'data-transformation-job'
  ) then
    raise exception 'invalid-work-order-type';
  end if;

  if char_length(coalesce(p_objective, '')) < 20 or char_length(coalesce(p_objective, '')) > 2000 then
    raise exception 'invalid-objective';
  end if;

  if jsonb_typeof(p_memory_scopes) <> 'array'
    or jsonb_typeof(p_tool_scopes) <> 'array'
    or jsonb_typeof(p_reviewer_checkpoints) <> 'array'
    or jsonb_typeof(p_blocked_actions) <> 'array'
    or jsonb_typeof(p_trust_card) <> 'object' then
    raise exception 'invalid-work-order-json';
  end if;

  if p_pilot_session_id is not null then
    select *
    into selected_session
    from public.pilot_demo_sessions
    where id = p_pilot_session_id
      and workspace_id = selected_workspace.id
      and tenant_id = selected_workspace.tenant_id;

    if selected_session.id is null then
      raise exception 'pilot-session-not-found';
    end if;
  end if;

  if p_trustos_decision_id is not null then
    select *
    into selected_decision
    from public.trustos_decisions
    where id = p_trustos_decision_id
      and workspace_id = selected_workspace.id
      and tenant_id = selected_workspace.tenant_id;

    if selected_decision.id is null then
      raise exception 'trustos-decision-not-found';
    end if;
  end if;

  insert into public.agent_workspace_work_orders (
    tenant_id,
    workspace_id,
    pilot_session_id,
    trustos_decision_id,
    work_order_type,
    state,
    objective,
    agent_owner,
    model_router_policy,
    trust_card,
    memory_scopes,
    tool_scopes,
    reviewer_checkpoints,
    blocked_actions,
    created_by,
    updated_by,
    boundary
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    p_pilot_session_id,
    p_trustos_decision_id,
    p_work_order_type,
    'drafted',
    p_objective,
    p_agent_owner,
    p_model_router_policy,
    p_trust_card,
    p_memory_scopes,
    p_tool_scopes,
    p_reviewer_checkpoints,
    p_blocked_actions,
    (select auth.uid()),
    (select auth.uid()),
    work_order_boundary
  )
  returning id into created_work_order_id;

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
    created_work_order_id,
    (select auth.uid()),
    'work-order-created',
    null,
    'drafted',
    jsonb_build_object(
      'workOrderType', p_work_order_type,
      'syntheticOnly', true,
      'agentOwner', p_agent_owner
    )
  );

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
    p_pilot_session_id,
    (select auth.uid()),
    'agent-work-order-created',
    jsonb_build_object(
      'workOrderId', created_work_order_id,
      'workOrderType', p_work_order_type,
      'syntheticOnly', true
    )
  );

  return created_work_order_id;
end;
$$;

create or replace function private.transition_agent_workspace_work_order(
  p_workspace_slug text,
  p_work_order_id uuid,
  p_next_state text,
  p_event_type text,
  p_event_metadata jsonb default '{}'::jsonb,
  p_result_summary text default '',
  p_outcome_metrics jsonb default '{}'::jsonb,
  p_failure_reason text default '',
  p_assigned_reviewer_id uuid default null
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

  if selected_work_order.state = 'closed' then
    raise exception 'work-order-closed';
  end if;

  if p_next_state not in (
    'drafted',
    'planned',
    'routed',
    'sandboxed',
    'trustqa-held',
    'human-review',
    'proof-ready',
    'blocked',
    'closed'
  ) then
    raise exception 'invalid-work-order-state';
  end if;

  if p_event_type not in (
    'state-transitioned',
    'reviewer-assigned',
    'reviewer-disposition-recorded',
    'retry-recorded',
    'work-order-blocked',
    'work-order-closed',
    'proof-packet-downloaded'
  ) then
    raise exception 'invalid-work-order-event-type';
  end if;

  if jsonb_typeof(p_event_metadata) <> 'object' or jsonb_typeof(p_outcome_metrics) <> 'object' then
    raise exception 'invalid-work-order-event-json';
  end if;

  if p_event_type = 'retry-recorded' and selected_work_order.retry_count >= 10 then
    raise exception 'retry-limit-exceeded';
  end if;

  update public.agent_workspace_work_orders
  set
    state = p_next_state,
    result_summary = coalesce(nullif(p_result_summary, ''), result_summary),
    outcome_metrics = case
      when p_outcome_metrics = '{}'::jsonb then outcome_metrics
      else p_outcome_metrics
    end,
    failure_reason = case
      when p_next_state = 'blocked' then coalesce(nullif(p_failure_reason, ''), failure_reason)
      else failure_reason
    end,
    retry_count = retry_count + case when p_event_type = 'retry-recorded' then 1 else 0 end,
    assigned_reviewer_id = coalesce(p_assigned_reviewer_id, assigned_reviewer_id),
    updated_by = (select auth.uid()),
    reviewed_by = case
      when p_event_type = 'reviewer-disposition-recorded' or p_next_state in ('proof-ready', 'blocked') then (select auth.uid())
      else reviewed_by
    end,
    reviewed_at = case
      when p_event_type = 'reviewer-disposition-recorded' or p_next_state in ('proof-ready', 'blocked') then now()
      else reviewed_at
    end,
    closed_by = case when p_next_state = 'closed' then (select auth.uid()) else closed_by end,
    closed_at = case when p_next_state = 'closed' then now() else closed_at end,
    updated_at = now()
  where id = selected_work_order.id;

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
    p_event_type,
    selected_work_order.state,
    p_next_state,
    p_event_metadata || jsonb_build_object(
      'syntheticOnly', true,
      'priorState', selected_work_order.state,
      'nextState', p_next_state
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
    case
      when p_next_state = 'closed' then 'agent-work-order-closed'
      else 'agent-work-order-transitioned'
    end,
    jsonb_build_object(
      'workOrderId', selected_work_order.id,
      'eventId', created_event_id,
      'eventType', p_event_type,
      'priorState', selected_work_order.state,
      'nextState', p_next_state,
      'syntheticOnly', true
    )
  );

  return created_event_id;
end;
$$;

create or replace function public.create_agent_workspace_work_order(
  p_workspace_slug text,
  p_work_order_type text,
  p_objective text,
  p_agent_owner text,
  p_model_router_policy text,
  p_memory_scopes jsonb,
  p_tool_scopes jsonb,
  p_reviewer_checkpoints jsonb,
  p_blocked_actions jsonb,
  p_trust_card jsonb default '{}'::jsonb,
  p_pilot_session_id uuid default null,
  p_trustos_decision_id uuid default null
)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.create_agent_workspace_work_order(
    p_workspace_slug,
    p_work_order_type,
    p_objective,
    p_agent_owner,
    p_model_router_policy,
    p_memory_scopes,
    p_tool_scopes,
    p_reviewer_checkpoints,
    p_blocked_actions,
    p_trust_card,
    p_pilot_session_id,
    p_trustos_decision_id
  );
$$;

create or replace function public.transition_agent_workspace_work_order(
  p_workspace_slug text,
  p_work_order_id uuid,
  p_next_state text,
  p_event_type text,
  p_event_metadata jsonb default '{}'::jsonb,
  p_result_summary text default '',
  p_outcome_metrics jsonb default '{}'::jsonb,
  p_failure_reason text default '',
  p_assigned_reviewer_id uuid default null
)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.transition_agent_workspace_work_order(
    p_workspace_slug,
    p_work_order_id,
    p_next_state,
    p_event_type,
    p_event_metadata,
    p_result_summary,
    p_outcome_metrics,
    p_failure_reason,
    p_assigned_reviewer_id
  );
$$;

revoke all on function private.create_agent_workspace_work_order(text, text, text, text, text, jsonb, jsonb, jsonb, jsonb, jsonb, uuid, uuid)
  from public;
revoke all on function private.transition_agent_workspace_work_order(text, uuid, text, text, jsonb, text, jsonb, text, uuid)
  from public;
revoke all on function public.create_agent_workspace_work_order(text, text, text, text, text, jsonb, jsonb, jsonb, jsonb, jsonb, uuid, uuid)
  from public;
revoke all on function public.transition_agent_workspace_work_order(text, uuid, text, text, jsonb, text, jsonb, text, uuid)
  from public;

grant execute on function private.create_agent_workspace_work_order(text, text, text, text, text, jsonb, jsonb, jsonb, jsonb, jsonb, uuid, uuid)
  to authenticated;
grant execute on function private.transition_agent_workspace_work_order(text, uuid, text, text, jsonb, text, jsonb, text, uuid)
  to authenticated;
grant execute on function public.create_agent_workspace_work_order(text, text, text, text, text, jsonb, jsonb, jsonb, jsonb, jsonb, uuid, uuid)
  to authenticated;
grant execute on function public.transition_agent_workspace_work_order(text, uuid, text, text, jsonb, text, jsonb, text, uuid)
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
      'agent-work-order-closed'
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
    'schemaVersion', '2026-06-14.1',
    'boundary', 'synthetic-pilot-only',
    'tenantIsolation', 'postgres-row-level-security',
    'durableAudit', 'append-only',
    'governanceLedger', 'aal2-append-only',
    'agentWorkspaceWorkOrders', true
  );
$$;

comment on table public.agent_workspace_work_orders is
  'Tenant-scoped persistent agent work orders for governed synthetic and metadata-only SCRIMED pilot workflows. Live PHI, autonomous care, payer submission, patient outreach, and production connector execution are prohibited.';
comment on table public.agent_workspace_work_order_events is
  'Append-only state, review, retry, closure, and proof-packet events for SCRIMED persistent agent work orders.';
