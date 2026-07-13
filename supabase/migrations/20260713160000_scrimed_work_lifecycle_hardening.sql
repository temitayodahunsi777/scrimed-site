alter table private.scrimed_work_sessions
  drop constraint if exists scrimed_work_sessions_status_check;

alter table private.scrimed_work_sessions
  add constraint scrimed_work_sessions_status_check check (
    status in (
      'draft',
      'planning',
      'active',
      'awaiting_approval',
      'paused',
      'verifying',
      'completed',
      'failed',
      'cancelled',
      'rolled_back'
    )
  );

create table if not exists private.scrimed_work_transition_keys (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  scrimed_work_session_id uuid not null references private.scrimed_work_sessions(id) on delete restrict,
  idempotency_key text not null check (
    char_length(idempotency_key) between 8 and 160
    and idempotency_key !~ '[[:space:]]'
  ),
  lifecycle_action text not null check (
    lifecycle_action in ('plan', 'run', 'pause', 'resume', 'approve', 'reject', 'complete', 'cancel', 'fail', 'rollback')
  ),
  target_status text not null check (
    target_status in ('planning', 'active', 'awaiting_approval', 'paused', 'verifying', 'completed', 'failed', 'cancelled', 'rolled_back')
  ),
  request_fingerprint text not null check (request_fingerprint ~ '^[a-f0-9]{64}$'),
  audit_event_id uuid references private.scrimed_work_audit_events(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (workspace_id, idempotency_key)
);

create index if not exists scrimed_work_transition_keys_session_created_idx
  on private.scrimed_work_transition_keys(scrimed_work_session_id, created_at desc);
create index if not exists scrimed_work_transition_keys_tenant_created_idx
  on private.scrimed_work_transition_keys(tenant_id, created_at desc);
create index if not exists scrimed_work_transition_keys_audit_event_idx
  on private.scrimed_work_transition_keys(audit_event_id)
  where audit_event_id is not null;

alter table private.scrimed_work_transition_keys enable row level security;
revoke all on private.scrimed_work_transition_keys from public, anon, authenticated;

drop policy if exists scrimed_work_transition_keys_deny_all on private.scrimed_work_transition_keys;
create policy scrimed_work_transition_keys_deny_all
on private.scrimed_work_transition_keys
as restrictive
for all
to public
using (false)
with check (false);

create or replace function private.scrimed_work_transition_allowed(
  p_current_status text,
  p_action text,
  p_target_status text
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case p_action
    when 'plan' then p_current_status = 'draft' and p_target_status = 'planning'
    when 'run' then p_current_status = 'planning' and p_target_status in ('active', 'awaiting_approval')
    when 'pause' then p_current_status in ('planning', 'active', 'awaiting_approval', 'verifying') and p_target_status = 'paused'
    when 'resume' then p_current_status = 'paused' and p_target_status = 'active'
    when 'approve' then p_current_status = 'awaiting_approval' and p_target_status = 'verifying'
    when 'reject' then p_current_status in ('awaiting_approval', 'verifying') and p_target_status = 'paused'
    when 'complete' then p_current_status = 'verifying' and p_target_status = 'completed'
    when 'cancel' then p_current_status in ('draft', 'planning', 'active', 'awaiting_approval', 'paused', 'verifying', 'failed') and p_target_status = 'cancelled'
    when 'fail' then p_current_status in ('planning', 'active', 'awaiting_approval', 'paused', 'verifying') and p_target_status = 'failed'
    when 'rollback' then p_current_status in ('paused', 'completed', 'failed', 'cancelled') and p_target_status = 'rolled_back'
    else false
  end;
$$;

revoke all on function private.scrimed_work_transition_allowed(text, text, text)
from public, anon, authenticated;

create or replace function private.transition_scrimed_work_session(
  p_workspace_slug text,
  p_session_id text,
  p_status text,
  p_reason text,
  p_session jsonb,
  p_idempotency_key text,
  p_audit_event jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_session private.scrimed_work_sessions%rowtype;
  updated_session private.scrimed_work_sessions%rowtype;
  transition_key private.scrimed_work_transition_keys%rowtype;
  created_event_id uuid;
  normalized_session jsonb := coalesce(p_session, '{}'::jsonb);
  boundary_value text := private.scrimed_work_boundary();
  lifecycle_action text := coalesce(p_audit_event ->> 'lifecycleAction', '');
  lifecycle_decision_hash text := coalesce(p_audit_event ->> 'lifecycleDecisionHash', '');
  request_fingerprint text;
  old_history_length integer;
  new_history_length integer;
  actor_role text;
  old_pending_count integer;
  new_pending_count integer;
  old_approved_count integer;
  new_approved_count integer;
  old_rejected_count integer;
  new_rejected_count integer;
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead', 'reviewer']
  );

  if p_status not in (
    'planning', 'active', 'awaiting_approval', 'paused', 'verifying',
    'completed', 'failed', 'cancelled', 'rolled_back'
  ) then
    raise exception 'scrimed-work-invalid-status';
  end if;

  if lifecycle_action not in (
    'plan', 'run', 'pause', 'resume', 'approve', 'reject', 'complete',
    'cancel', 'fail', 'rollback'
  ) or lifecycle_decision_hash !~ '^scrimed-work-lifecycle-[a-f0-9]{8}$' then
    raise exception 'scrimed-work-lifecycle-action-required';
  end if;

  if char_length(coalesce(p_reason, '')) < 8
    or char_length(coalesce(p_reason, '')) > 800 then
    raise exception 'scrimed-work-invalid-transition-reason';
  end if;

  if coalesce(p_idempotency_key, '') = ''
    or char_length(p_idempotency_key) > 160
    or p_idempotency_key ~ '[[:space:]]' then
    raise exception 'scrimed-work-idempotency-required';
  end if;

  if jsonb_typeof(normalized_session) <> 'object'
    or pg_column_size(normalized_session) > 131072 then
    raise exception 'scrimed-work-invalid-session';
  end if;

  perform private.reject_scrimed_work_prohibited_text(
    concat_ws(' ', p_session_id, p_status, p_reason, normalized_session::text)
  );

  select *
  into selected_session
  from private.scrimed_work_sessions
  where workspace_id = selected_workspace.id
    and session_id = p_session_id
  for update;

  if selected_session.id is null then
    raise exception 'scrimed-work-session-not-found';
  end if;

  if normalized_session ->> 'id' <> selected_session.session_id
    or (
      normalized_session - array['statusHistory', 'approvalCheckpoints', 'cancellationState', 'plannedSteps', 'updatedAt']::text[]
    ) <> (
      selected_session.session_payload - array['statusHistory', 'approvalCheckpoints', 'cancellationState', 'plannedSteps', 'updatedAt']::text[]
    ) then
    raise exception 'scrimed-work-transition-mutation-scope-violation';
  end if;

  request_fingerprint := encode(
    extensions.digest(
      concat_ws('|', p_session_id, lifecycle_action, p_status, p_reason, normalized_session::text),
      'sha256'
    ),
    'hex'
  );

  insert into private.scrimed_work_transition_keys (
    tenant_id,
    workspace_id,
    scrimed_work_session_id,
    idempotency_key,
    lifecycle_action,
    target_status,
    request_fingerprint
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    selected_session.id,
    p_idempotency_key,
    lifecycle_action,
    p_status,
    request_fingerprint
  )
  on conflict (workspace_id, idempotency_key) do nothing
  returning * into transition_key;

  if transition_key.id is null then
    select *
    into transition_key
    from private.scrimed_work_transition_keys
    where workspace_id = selected_workspace.id
      and idempotency_key = p_idempotency_key;

    if transition_key.scrimed_work_session_id <> selected_session.id
      or transition_key.lifecycle_action <> lifecycle_action
      or transition_key.target_status <> p_status
      or transition_key.request_fingerprint <> request_fingerprint then
      raise exception 'scrimed-work-idempotency-conflict';
    end if;

    return jsonb_build_object(
      'record', private.scrimed_work_session_json(selected_session),
      'eventId', transition_key.audit_event_id,
      'transitioned', false,
      'idempotentReplay', true,
      'boundary', boundary_value
    );
  end if;

  if not private.scrimed_work_transition_allowed(selected_session.status, lifecycle_action, p_status) then
    raise exception 'scrimed-work-invalid-transition:%:%:%', selected_session.status, lifecycle_action, p_status;
  end if;

  old_history_length := jsonb_array_length(selected_session.status_history);
  new_history_length := jsonb_array_length(coalesce(normalized_session -> 'statusHistory', '[]'::jsonb));

  if new_history_length <> old_history_length + 1
    or (normalized_session -> 'statusHistory') - (new_history_length - 1) <> selected_session.status_history
    or normalized_session #>> array['statusHistory', (new_history_length - 1)::text, 'status'] <> p_status
    or normalized_session #>> array['statusHistory', (new_history_length - 1)::text, 'action'] <> lifecycle_action
    or normalized_session #>> array['statusHistory', (new_history_length - 1)::text, 'fromStatus'] <> selected_session.status then
    raise exception 'scrimed-work-status-history-conflict';
  end if;

  select count(*) filter (where checkpoint ->> 'status' = 'pending'),
         count(*) filter (where checkpoint ->> 'status' = 'approved'),
         count(*) filter (where checkpoint ->> 'status' = 'rejected')
  into old_pending_count, old_approved_count, old_rejected_count
  from jsonb_array_elements(coalesce(selected_session.session_payload -> 'approvalCheckpoints', '[]'::jsonb)) checkpoint;

  select count(*) filter (where checkpoint ->> 'status' = 'pending'),
         count(*) filter (where checkpoint ->> 'status' = 'approved'),
         count(*) filter (where checkpoint ->> 'status' = 'rejected')
  into new_pending_count, new_approved_count, new_rejected_count
  from jsonb_array_elements(coalesce(normalized_session -> 'approvalCheckpoints', '[]'::jsonb)) checkpoint;

  if lifecycle_action = 'approve' then
    select membership.role
    into actor_role
    from public.pilot_memberships membership
    where membership.tenant_id = selected_workspace.tenant_id
      and membership.user_id = (select auth.uid());

    if actor_role <> 'reviewer' then
      raise exception 'scrimed-work-reviewer-role-required';
    end if;

    if selected_session.created_by = (select auth.uid()) then
      raise exception 'scrimed-work-independent-reviewer-required';
    end if;

    if selected_session.workspace_domain = 'clinical'
      and selected_session.risk_level = 'high' then
      raise exception 'scrimed-work-qualified-clinical-reviewer-required';
    end if;

    if new_pending_count <> old_pending_count - 1
      or new_approved_count <> old_approved_count + 1
      or new_rejected_count <> old_rejected_count then
      raise exception 'scrimed-work-approval-state-conflict';
    end if;
  elsif lifecycle_action = 'reject' then
    if new_rejected_count <> old_rejected_count + 1
      or new_pending_count + new_approved_count <> old_pending_count + old_approved_count - 1 then
      raise exception 'scrimed-work-rejection-state-conflict';
    end if;
  elsif coalesce(normalized_session -> 'approvalCheckpoints', '[]'::jsonb)
    <> coalesce(selected_session.session_payload -> 'approvalCheckpoints', '[]'::jsonb) then
    raise exception 'scrimed-work-approval-state-mutation-not-allowed';
  end if;

  if lifecycle_action = 'complete' then
    if exists (
      select 1
      from jsonb_array_elements(coalesce(normalized_session -> 'approvalCheckpoints', '[]'::jsonb)) checkpoint
      where checkpoint ->> 'status' <> 'approved'
    ) or not exists (
      select 1
      from jsonb_array_elements(coalesce(normalized_session -> 'artifacts', '[]'::jsonb)) artifact
      where coalesce((artifact #>> '{verification,eligibleForCompletion}')::boolean, false)
        and artifact ->> 'reviewStatus' = 'reviewed'
    ) then
      raise exception 'scrimed-work-completion-verification-required';
    end if;
  end if;

  update private.scrimed_work_sessions
  set status = p_status,
      status_history = normalized_session -> 'statusHistory',
      selected_model = normalized_session -> 'selectedModel',
      value_telemetry = normalized_session -> 'valueTelemetry',
      session_payload = normalized_session,
      updated_at = now()
  where id = selected_session.id
  returning * into updated_session;

  insert into private.scrimed_work_audit_events (
    tenant_id,
    workspace_id,
    scrimed_work_session_id,
    actor_user_id,
    event_type,
    event_metadata,
    boundary
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    updated_session.id,
    (select auth.uid()),
    'session-transitioned',
    coalesce(p_audit_event, '{}'::jsonb) || jsonb_build_object(
      'sessionId', p_session_id,
      'fromStatus', selected_session.status,
      'status', p_status,
      'lifecycleAction', lifecycle_action,
      'lifecycleDecisionHash', lifecycle_decision_hash,
      'reasonPresent', true,
      'idempotencyKey', p_idempotency_key,
      'syntheticOnly', true,
      'noPhi', true,
      'assuranceLevel', 'aal2'
    ),
    boundary_value
  )
  returning id into created_event_id;

  update private.scrimed_work_transition_keys
  set audit_event_id = created_event_id
  where id = transition_key.id;

  return jsonb_build_object(
    'record', private.scrimed_work_session_json(updated_session),
    'eventId', created_event_id,
    'transitioned', true,
    'idempotentReplay', false,
    'boundary', boundary_value
  );
end;
$$;

comment on table private.scrimed_work_transition_keys is
  'Private tenant-scoped transition idempotency ledger. Direct client access is denied; entries contain metadata only and no PHI.';

comment on function private.scrimed_work_transition_allowed(text, text, text) is
  'Deterministic SCRIMED Work lifecycle matrix. It grants no clinical, payer, EHR, connector, certification, or go-live authority.';

comment on function private.transition_scrimed_work_session(text, text, text, text, jsonb, text, jsonb) is
  'AAL2/RBAC-gated SCRIMED Work lifecycle transition with authoritative state locking, append-only history checks, scoped mutation, independent review, and idempotency replay enforcement.';
