create table if not exists public.trustos_decisions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  pilot_session_id uuid references public.pilot_demo_sessions(id) on delete restrict,
  decision_id text not null check (char_length(decision_id) between 12 and 120),
  trace_id text not null check (char_length(trace_id) between 12 and 120),
  policy_version text not null default 'trustos-v1.0.0'
    check (char_length(policy_version) between 3 and 80),
  workflow text not null check (char_length(workflow) between 3 and 240),
  decision text not null check (decision in ('allow-synthetic', 'escalate-human-review', 'deny')),
  confidence smallint not null check (confidence between 0 and 100),
  uncertainty smallint not null check (uncertainty between 0 and 100),
  decision_record jsonb not null check (
    jsonb_typeof(decision_record) = 'object'
    and pg_column_size(decision_record) <= 262144
  ),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.trustos_review_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  trustos_decision_id uuid not null references public.trustos_decisions(id) on delete restrict,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  event_type text not null check (
    event_type in (
      'review-disposition-recorded',
      'outcome-signal-recorded',
      'governance-packet-downloaded'
    )
  ),
  disposition text not null check (
    disposition in ('approved', 'rejected', 'modified', 'escalated', 'noted')
  ),
  reason_code text not null check (
    reason_code in (
      'synthetic-approved',
      'evidence-gap',
      'policy-exception',
      'boundary-violation',
      'human-judgment',
      'workflow-completed',
      'packet-export'
    )
  ),
  notes text not null default '' check (char_length(notes) <= 600),
  outcome_metrics jsonb not null default '{}'::jsonb check (
    jsonb_typeof(outcome_metrics) = 'object'
    and pg_column_size(outcome_metrics) <= 16384
  ),
  created_at timestamptz not null default now()
);

create index if not exists trustos_decisions_tenant_id_idx
  on public.trustos_decisions(tenant_id);
create index if not exists trustos_decisions_workspace_created_at_idx
  on public.trustos_decisions(workspace_id, created_at desc);
create index if not exists trustos_decisions_pilot_session_id_idx
  on public.trustos_decisions(pilot_session_id);
create index if not exists trustos_decisions_trace_id_idx
  on public.trustos_decisions(trace_id);
create index if not exists trustos_review_events_tenant_id_idx
  on public.trustos_review_events(tenant_id);
create index if not exists trustos_review_events_workspace_created_at_idx
  on public.trustos_review_events(workspace_id, created_at desc);
create index if not exists trustos_review_events_decision_created_at_idx
  on public.trustos_review_events(trustos_decision_id, created_at desc);

alter table public.trustos_decisions enable row level security;
alter table public.trustos_review_events enable row level security;

create or replace function private.has_valid_governance_session()
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  current_session_id uuid;
begin
  if (select auth.uid()) is null
    or coalesce((select auth.jwt() ->> 'aal'), 'aal1') <> 'aal2' then
    return false;
  end if;

  begin
    current_session_id := nullif((select auth.jwt() ->> 'session_id'), '')::uuid;
  exception when others then
    return false;
  end;

  return current_session_id is not null and exists (
    select 1
    from auth.sessions active_session
    where active_session.id = current_session_id
      and active_session.user_id = (select auth.uid())
      and active_session.aal::text = 'aal2'
      and active_session.created_at >= now() - interval '12 hours'
      and coalesce(active_session.refreshed_at, active_session.created_at::timestamp)
        >= (now() - interval '2 hours')::timestamp
      and (active_session.not_after is null or active_session.not_after > now())
  );
end;
$$;

revoke all on function private.has_valid_governance_session() from public;
grant execute on function private.has_valid_governance_session() to authenticated;

drop policy if exists trustos_decisions_member_select on public.trustos_decisions;
create policy trustos_decisions_member_select
on public.trustos_decisions
for select
to authenticated
using (
  (select private.has_valid_governance_session())
  and (select private.is_pilot_member(tenant_id))
);

drop policy if exists trustos_review_events_member_select on public.trustos_review_events;
create policy trustos_review_events_member_select
on public.trustos_review_events
for select
to authenticated
using (
  (select private.has_valid_governance_session())
  and (select private.is_pilot_member(tenant_id))
);

revoke all on public.trustos_decisions from anon, authenticated;
revoke all on public.trustos_review_events from anon, authenticated;
grant select on public.trustos_decisions to authenticated;
grant select on public.trustos_review_events to authenticated;

create or replace function private.require_governance_workspace(
  p_workspace_slug text,
  p_allowed_roles text[]
)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  selected_workspace_id uuid;
begin
  if not private.has_valid_governance_session() then
    raise exception 'governance-aal2-session-required';
  end if;

  perform private.require_sales_server_token();

  select workspace.id
  into selected_workspace_id
  from public.pilot_workspaces workspace
  where workspace.slug = p_workspace_slug
    and private.has_pilot_role(workspace.tenant_id, p_allowed_roles);

  if selected_workspace_id is null then
    raise exception 'governance-workspace-or-role-denied';
  end if;

  return selected_workspace_id;
end;
$$;

create or replace function private.create_trustos_decision(
  p_workspace_slug text,
  p_pilot_session_id uuid,
  p_policy_version text,
  p_workflow text,
  p_decision text,
  p_confidence smallint,
  p_uncertainty smallint,
  p_decision_record jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  created_decision_id uuid;
  record_decision_id text;
  record_trace_id text;
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead']
  );

  if p_pilot_session_id is not null and not exists (
    select 1
    from public.pilot_demo_sessions session
    where session.id = p_pilot_session_id
      and session.workspace_id = selected_workspace.id
  ) then
    raise exception 'governance-pilot-session-not-found';
  end if;

  if p_decision not in ('allow-synthetic', 'escalate-human-review', 'deny')
    or p_confidence not between 0 and 100
    or p_uncertainty not between 0 and 100
    or jsonb_typeof(p_decision_record) <> 'object'
    or pg_column_size(p_decision_record) > 262144
    or p_decision_record ->> 'decision' is distinct from p_decision then
    raise exception 'invalid-trustos-decision-record';
  end if;

  record_decision_id := trim(coalesce(p_decision_record ->> 'decisionId', ''));
  record_trace_id := trim(coalesce(p_decision_record #>> '{clinicalTrace,traceId}', ''));

  if char_length(record_decision_id) not between 12 and 120
    or char_length(record_trace_id) not between 12 and 120
    or char_length(trim(coalesce(p_policy_version, ''))) not between 3 and 80
    or char_length(trim(coalesce(p_workflow, ''))) not between 3 and 240 then
    raise exception 'invalid-trustos-decision-identifiers';
  end if;

  insert into public.trustos_decisions (
    tenant_id,
    workspace_id,
    pilot_session_id,
    decision_id,
    trace_id,
    policy_version,
    workflow,
    decision,
    confidence,
    uncertainty,
    decision_record,
    created_by
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    p_pilot_session_id,
    record_decision_id,
    record_trace_id,
    trim(p_policy_version),
    trim(p_workflow),
    p_decision,
    p_confidence,
    p_uncertainty,
    p_decision_record,
    (select auth.uid())
  )
  returning id into created_decision_id;

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
    'trustos-decision-recorded',
    jsonb_build_object(
      'trustosDecisionId', created_decision_id,
      'decision', p_decision,
      'traceId', record_trace_id,
      'syntheticOnly', true
    )
  );

  return created_decision_id;
end;
$$;

create or replace function private.record_trustos_review_event(
  p_workspace_slug text,
  p_trustos_decision_id uuid,
  p_event_type text,
  p_disposition text,
  p_reason_code text,
  p_notes text,
  p_outcome_metrics jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_decision public.trustos_decisions%rowtype;
  created_event_id uuid;
  clean_notes text;
  clean_metrics jsonb;
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead', 'reviewer']
  );

  select *
  into selected_decision
  from public.trustos_decisions
  where id = p_trustos_decision_id
    and workspace_id = selected_workspace.id;

  if selected_decision.id is null then
    raise exception 'trustos-decision-not-found';
  end if;

  clean_notes := trim(coalesce(p_notes, ''));
  clean_metrics := coalesce(p_outcome_metrics, '{}'::jsonb);

  if p_event_type not in (
      'review-disposition-recorded',
      'outcome-signal-recorded',
      'governance-packet-downloaded'
    )
    or p_disposition not in ('approved', 'rejected', 'modified', 'escalated', 'noted')
    or p_reason_code not in (
      'synthetic-approved',
      'evidence-gap',
      'policy-exception',
      'boundary-violation',
      'human-judgment',
      'workflow-completed',
      'packet-export'
    )
    or char_length(clean_notes) > 600
    or jsonb_typeof(clean_metrics) <> 'object'
    or pg_column_size(clean_metrics) > 16384 then
    raise exception 'invalid-trustos-review-event';
  end if;

  if clean_notes ~*
    '(^|[^a-z])(phi|mrn|dob|ssn)([^a-z]|$)|medical record|patient identifier|member id|diagnos(is|ed)|date of birth|protected health information' then
    raise exception 'prohibited-trustos-review-data';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(clean_metrics) metric_key
    where metric_key not in (
      'timeSavedMinutes',
      'overrideAccepted',
      'escalationResolved',
      'workflowOutcome',
      'reviewDurationMinutes'
    )
  ) then
    raise exception 'invalid-trustos-outcome-metric';
  end if;

  insert into public.trustos_review_events (
    tenant_id,
    workspace_id,
    trustos_decision_id,
    actor_user_id,
    event_type,
    disposition,
    reason_code,
    notes,
    outcome_metrics
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    selected_decision.id,
    (select auth.uid()),
    p_event_type,
    p_disposition,
    p_reason_code,
    clean_notes,
    clean_metrics
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
    selected_decision.pilot_session_id,
    (select auth.uid()),
    case
      when p_event_type = 'governance-packet-downloaded' then 'trustos-governance-packet-downloaded'
      else 'trustos-review-recorded'
    end,
    jsonb_build_object(
      'trustosDecisionId', selected_decision.id,
      'reviewEventId', created_event_id,
      'reviewEventType', p_event_type,
      'disposition', p_disposition,
      'reasonCode', p_reason_code,
      'syntheticOnly', true
    )
  );

  return created_event_id;
end;
$$;

revoke all on function private.require_governance_workspace(text, text[]) from public, anon, authenticated;
revoke all on function private.create_trustos_decision(text, uuid, text, text, text, smallint, smallint, jsonb)
  from public, anon, authenticated;
revoke all on function private.record_trustos_review_event(text, uuid, text, text, text, text, jsonb)
  from public, anon, authenticated;

create or replace function public.create_trustos_decision(
  p_workspace_slug text,
  p_pilot_session_id uuid,
  p_policy_version text,
  p_workflow text,
  p_decision text,
  p_confidence smallint,
  p_uncertainty smallint,
  p_decision_record jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.create_trustos_decision(
    p_workspace_slug,
    p_pilot_session_id,
    p_policy_version,
    p_workflow,
    p_decision,
    p_confidence,
    p_uncertainty,
    p_decision_record
  );
$$;

create or replace function public.record_trustos_review_event(
  p_workspace_slug text,
  p_trustos_decision_id uuid,
  p_event_type text,
  p_disposition text,
  p_reason_code text,
  p_notes text,
  p_outcome_metrics jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_trustos_review_event(
    p_workspace_slug,
    p_trustos_decision_id,
    p_event_type,
    p_disposition,
    p_reason_code,
    p_notes,
    p_outcome_metrics
  );
$$;

revoke all on function public.create_trustos_decision(text, uuid, text, text, text, smallint, smallint, jsonb)
  from public;
revoke all on function public.record_trustos_review_event(text, uuid, text, text, text, text, jsonb)
  from public;
grant execute on function public.create_trustos_decision(text, uuid, text, text, text, smallint, smallint, jsonb)
  to authenticated;
grant execute on function public.record_trustos_review_event(text, uuid, text, text, text, text, jsonb)
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
      'trustos-governance-packet-downloaded'
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
    'schemaVersion', '2026-06-11.2',
    'boundary', 'synthetic-pilot-only',
    'tenantIsolation', 'postgres-row-level-security',
    'durableAudit', 'append-only',
    'governanceLedger', 'aal2-append-only'
  );
$$;

comment on table public.trustos_decisions is
  'Append-only tenant TrustOS decision evidence. Records metadata-only synthetic and enterprise assessment decisions; raw request context and PHI are prohibited.';
comment on table public.trustos_review_events is
  'Append-only human review, override, outcome, and governance-packet evidence for tenant TrustOS decisions.';
