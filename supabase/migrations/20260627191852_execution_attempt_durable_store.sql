create table if not exists private.execution_attempts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  attempt_id text not null check (attempt_id ~ '^att_[0-9a-f]{12}$'),
  contract_version text not null check (char_length(contract_version) between 12 and 120),
  workflow_slug text not null check (
    char_length(workflow_slug) between 3 and 120
    and workflow_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  workflow_version text not null check (char_length(workflow_version) between 3 and 80),
  idempotency_key text not null check (idempotency_key ~ '^idem_[0-9a-f]{24}$'),
  replay_token text not null check (replay_token ~ '^replay_[0-9a-f]{24}$'),
  trace_id text not null check (trace_id ~ '^trace_[0-9a-f]{16}$'),
  audit_event_ref text not null check (audit_event_ref ~ '^audit_[0-9a-f]{12}$'),
  input_digest text not null check (input_digest ~ '^[0-9a-f]{64}$'),
  context_fingerprint text not null check (context_fingerprint ~ '^[0-9a-f]{64}$'),
  lifecycle_state text not null check (
    lifecycle_state in (
      'received',
      'deduplicated',
      'review-required',
      'preflight-denied',
      'replay-ready',
      'failed-quarantined'
    )
  ),
  build_status text not null check (
    build_status in ('metadata-only-accepted', 'metadata-only-rejected')
  ),
  clinical_risk_level text not null check (
    clinical_risk_level in ('low', 'moderate', 'high', 'prohibited')
  ),
  region text not null default 'us' check (
    region in ('us', 'eu', 'uk', 'ca', 'apac', 'customer-private-region')
  ),
  retention_until timestamptz not null default (now() + interval '90 days'),
  lock_expires_at timestamptz not null default (now() + interval '5 minutes'),
  model_route_telemetry jsonb not null check (
    jsonb_typeof(model_route_telemetry) = 'object'
    and pg_column_size(model_route_telemetry) <= 16384
  ),
  tool_plan jsonb not null check (
    jsonb_typeof(tool_plan) = 'object'
    and pg_column_size(tool_plan) <= 16384
  ),
  failure_recovery jsonb not null check (
    jsonb_typeof(failure_recovery) = 'object'
    and pg_column_size(failure_recovery) <= 16384
  ),
  envelope jsonb not null check (
    jsonb_typeof(envelope) = 'object'
    and pg_column_size(envelope) <= 65536
  ),
  human_review_required boolean not null default true check (human_review_required),
  no_phi_assertion boolean not null default true check (no_phi_assertion),
  phi_authority text not null default 'not-authorized-production-phi'
    check (phi_authority = 'not-authorized-production-phi'),
  clinical_care_authority text not null default 'not-authorized-live-care'
    check (clinical_care_authority = 'not-authorized-live-care'),
  workflow_execution_authority text not null default 'durable-attempt-store-no-protected-execution'
    check (workflow_execution_authority = 'durable-attempt-store-no-protected-execution'),
  boundary text not null check (char_length(boundary) between 120 and 2400),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, attempt_id),
  unique (workspace_id, idempotency_key),
  unique (workspace_id, replay_token),
  check (retention_until > created_at),
  check (lock_expires_at >= created_at)
);

create table if not exists private.execution_attempt_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  execution_attempt_id uuid not null references private.execution_attempts(id) on delete restrict,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  event_type text not null check (
    event_type in (
      'attempt-recorded',
      'attempt-idempotency-reused',
      'attempt-replayed',
      'attempt-review-disposition-recorded',
      'attempt-quarantined'
    )
  ),
  event_metadata jsonb not null default '{}'::jsonb check (
    jsonb_typeof(event_metadata) = 'object'
    and pg_column_size(event_metadata) <= 32768
  ),
  boundary text not null check (char_length(boundary) between 120 and 2400),
  no_phi_assertion boolean not null default true check (no_phi_assertion),
  created_at timestamptz not null default now()
);

create table if not exists private.execution_attempt_review_dispositions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  execution_attempt_id uuid not null references private.execution_attempts(id) on delete restrict,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  disposition text not null check (
    disposition in (
      'approved-for-synthetic-release',
      'changes-requested',
      'rejected',
      'escalated'
    )
  ),
  reviewer_role text not null check (char_length(reviewer_role) between 3 and 80),
  reason_code text not null check (
    char_length(reason_code) between 3 and 80
    and reason_code ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  review_note text not null check (char_length(review_note) between 20 and 1200),
  attestation text not null check (
    attestation = 'no-phi-human-review-no-clinical-authority'
  ),
  event_metadata jsonb not null default '{}'::jsonb check (
    jsonb_typeof(event_metadata) = 'object'
    and pg_column_size(event_metadata) <= 32768
  ),
  boundary text not null check (char_length(boundary) between 120 and 2400),
  no_phi_assertion boolean not null default true check (no_phi_assertion),
  created_at timestamptz not null default now()
);

create index if not exists execution_attempts_workspace_created_idx
  on private.execution_attempts(workspace_id, created_at desc);
create index if not exists execution_attempts_workspace_workflow_idx
  on private.execution_attempts(workspace_id, workflow_slug, workflow_version, created_at desc);
create index if not exists execution_attempts_workspace_risk_idx
  on private.execution_attempts(workspace_id, clinical_risk_level, created_at desc);
create index if not exists execution_attempts_retention_idx
  on private.execution_attempts(retention_until);
create index if not exists execution_attempt_events_attempt_created_idx
  on private.execution_attempt_events(execution_attempt_id, created_at desc);
create index if not exists execution_attempt_events_workspace_created_idx
  on private.execution_attempt_events(workspace_id, created_at desc);
create index if not exists execution_attempt_review_dispositions_attempt_created_idx
  on private.execution_attempt_review_dispositions(execution_attempt_id, created_at desc);
create index if not exists execution_attempt_review_dispositions_workspace_created_idx
  on private.execution_attempt_review_dispositions(workspace_id, created_at desc);

alter table private.execution_attempts enable row level security;
alter table private.execution_attempt_events enable row level security;
alter table private.execution_attempt_review_dispositions enable row level security;

revoke all on private.execution_attempts from public, anon, authenticated;
revoke all on private.execution_attempt_events from public, anon, authenticated;
revoke all on private.execution_attempt_review_dispositions from public, anon, authenticated;

drop policy if exists execution_attempts_deny_all on private.execution_attempts;
create policy execution_attempts_deny_all
on private.execution_attempts
as restrictive
for all
to public
using (false)
with check (false);

drop policy if exists execution_attempt_events_deny_all on private.execution_attempt_events;
create policy execution_attempt_events_deny_all
on private.execution_attempt_events
as restrictive
for all
to public
using (false)
with check (false);

drop policy if exists execution_attempt_review_dispositions_deny_all
  on private.execution_attempt_review_dispositions;
create policy execution_attempt_review_dispositions_deny_all
on private.execution_attempt_review_dispositions
as restrictive
for all
to public
using (false)
with check (false);

create or replace function private.execution_attempt_boundary()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select 'SCRIMED execution-attempt durable records store no-PHI metadata, replay identity, route telemetry, review dispositions, retention, region, and audit events only. They do not store live patient data, raw chart text, payer member data, secrets, connector payloads, clinical production authority, payer submission authority, EHR writeback authority, or autonomous workflow authority.';
$$;

create or replace function private.reject_execution_attempt_prohibited_text(p_payload text)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_payload ~* '([0-9]{3}-[0-9]{2}-[0-9]{4})'
    or p_payload ~* 'date of birth|dob[[:space:]]*[:#]'
    or p_payload ~* 'medical record number|mrn[[:space:]]*[:#]'
    or p_payload ~* 'member[ _-]?(id|identifier)'
    or p_payload ~* 'subscriber[ _-]?(id|identifier)'
    or p_payload ~* 'patient[ _-]?(id|identifier)'
    or p_payload ~* 'access[_-]?token|refresh[_-]?token|bearer[[:space:]]+[a-z0-9._-]+'
    or p_payload ~* 'sk-[a-z0-9_-]{12,}'
    or p_payload ~* 'sbp_[a-z0-9_-]{12,}' then
    raise exception 'execution-attempt-prohibited-content';
  end if;
end;
$$;

create or replace function private.execution_attempt_json(
  attempt private.execution_attempts
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', attempt.id,
    'tenantId', attempt.tenant_id,
    'workspaceId', attempt.workspace_id,
    'workspaceSlug', (
      select workspace.slug
      from public.pilot_workspaces workspace
      where workspace.id = attempt.workspace_id
    ),
    'attemptId', attempt.attempt_id,
    'idempotencyKey', attempt.idempotency_key,
    'replayToken', attempt.replay_token,
    'workflowSlug', attempt.workflow_slug,
    'workflowVersion', attempt.workflow_version,
    'lifecycleState', attempt.lifecycle_state,
    'buildStatus', attempt.build_status,
    'clinicalRiskLevel', attempt.clinical_risk_level,
    'region', attempt.region,
    'retentionUntil', attempt.retention_until,
    'lockExpiresAt', attempt.lock_expires_at,
    'envelope', attempt.envelope,
    'eventCount', (
      select count(*)
      from private.execution_attempt_events event
      where event.execution_attempt_id = attempt.id
    ),
    'reviewDispositionCount', (
      select count(*)
      from private.execution_attempt_review_dispositions review
      where review.execution_attempt_id = attempt.id
    ),
    'humanReviewRequired', attempt.human_review_required,
    'noPhiAssertion', attempt.no_phi_assertion,
    'createdBy', attempt.created_by,
    'createdAt', attempt.created_at,
    'updatedAt', attempt.updated_at,
    'boundary', attempt.boundary
  );
$$;

create or replace function private.record_execution_attempt_envelope(
  p_workspace_slug text,
  p_envelope jsonb,
  p_region text default 'us',
  p_retention_until timestamptz default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  created_attempt private.execution_attempts%rowtype;
  existing_attempt private.execution_attempts%rowtype;
  created_event_id uuid;
  normalized_envelope jsonb := coalesce(p_envelope, '{}'::jsonb);
  envelope_text text := normalized_envelope::text;
  normalized_region text := coalesce(nullif(p_region, ''), 'us');
  retention_value timestamptz := coalesce(p_retention_until, now() + interval '90 days');
  boundary_value text := private.execution_attempt_boundary();
  attempt_id_value text := normalized_envelope ->> 'attemptId';
  idempotency_key_value text := normalized_envelope ->> 'idempotencyKey';
  replay_token_value text := normalized_envelope #>> '{replayMetadata,replayToken}';
  trace_id_value text := normalized_envelope #>> '{auditTrail,traceId}';
  audit_event_ref_value text := normalized_envelope #>> '{auditTrail,auditEventId}';
  input_digest_value text := normalized_envelope ->> 'inputDigest';
  context_fingerprint_value text := normalized_envelope ->> 'contextFingerprint';
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead', 'reviewer']
  );

  if jsonb_typeof(normalized_envelope) <> 'object'
    or pg_column_size(normalized_envelope) > 65536 then
    raise exception 'execution-attempt-invalid-envelope';
  end if;

  perform private.reject_execution_attempt_prohibited_text(envelope_text);

  if normalized_envelope ->> 'dataBoundary' <> 'synthetic-and-metadata-only'
    or normalized_envelope ->> 'phiAuthority' <> 'not-authorized-production-phi'
    or normalized_envelope ->> 'clinicalCareAuthority' <> 'not-authorized-live-care'
    or coalesce((normalized_envelope #>> '{humanApprovalGate,required}')::boolean, false) is not true then
    raise exception 'execution-attempt-boundary-violation';
  end if;

  if normalized_region not in ('us', 'eu', 'uk', 'ca', 'apac', 'customer-private-region') then
    raise exception 'execution-attempt-invalid-region';
  end if;

  if retention_value <= now() then
    raise exception 'execution-attempt-invalid-retention';
  end if;

  select *
  into existing_attempt
  from private.execution_attempts
  where workspace_id = selected_workspace.id
    and idempotency_key = idempotency_key_value;

  if existing_attempt.id is not null then
    if existing_attempt.attempt_id <> attempt_id_value
      or existing_attempt.input_digest <> input_digest_value
      or existing_attempt.context_fingerprint <> context_fingerprint_value
      or existing_attempt.replay_token <> replay_token_value then
      raise exception 'execution-attempt-idempotency-conflict';
    end if;

    insert into private.execution_attempt_events (
      tenant_id,
      workspace_id,
      execution_attempt_id,
      actor_user_id,
      event_type,
      event_metadata,
      boundary
    )
    values (
      selected_workspace.tenant_id,
      selected_workspace.id,
      existing_attempt.id,
      (select auth.uid()),
      'attempt-idempotency-reused',
      jsonb_build_object(
        'idempotencyKey', existing_attempt.idempotency_key,
        'attemptId', existing_attempt.attempt_id,
        'syntheticOnly', true,
        'noPhi', true
      ),
      boundary_value
    )
    returning id into created_event_id;

    return jsonb_build_object(
      'record', private.execution_attempt_json(existing_attempt),
      'eventId', created_event_id,
      'persisted', true,
      'idempotentReplay', true,
      'boundary', boundary_value
    );
  end if;

  insert into private.execution_attempts (
    tenant_id,
    workspace_id,
    attempt_id,
    contract_version,
    workflow_slug,
    workflow_version,
    idempotency_key,
    replay_token,
    trace_id,
    audit_event_ref,
    input_digest,
    context_fingerprint,
    lifecycle_state,
    build_status,
    clinical_risk_level,
    region,
    retention_until,
    model_route_telemetry,
    tool_plan,
    failure_recovery,
    envelope,
    boundary,
    created_by
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    attempt_id_value,
    normalized_envelope ->> 'contractVersion',
    normalized_envelope ->> 'workflowSlug',
    normalized_envelope ->> 'workflowVersion',
    idempotency_key_value,
    replay_token_value,
    trace_id_value,
    audit_event_ref_value,
    input_digest_value,
    context_fingerprint_value,
    normalized_envelope ->> 'lifecycleState',
    normalized_envelope ->> 'buildStatus',
    normalized_envelope #>> '{modelRouteTelemetry,riskTier}',
    normalized_region,
    retention_value,
    normalized_envelope -> 'modelRouteTelemetry',
    normalized_envelope -> 'toolPlan',
    normalized_envelope -> 'failureRecovery',
    normalized_envelope,
    boundary_value,
    (select auth.uid())
  )
  returning * into created_attempt;

  insert into private.execution_attempt_events (
    tenant_id,
    workspace_id,
    execution_attempt_id,
    actor_user_id,
    event_type,
    event_metadata,
    boundary
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    created_attempt.id,
    (select auth.uid()),
    'attempt-recorded',
    jsonb_build_object(
      'attemptId', created_attempt.attempt_id,
      'idempotencyKey', created_attempt.idempotency_key,
      'replayToken', created_attempt.replay_token,
      'workflowSlug', created_attempt.workflow_slug,
      'clinicalRiskLevel', created_attempt.clinical_risk_level,
      'region', created_attempt.region,
      'retentionUntil', created_attempt.retention_until,
      'syntheticOnly', true,
      'noPhi', true,
      'humanReviewRequired', true
    ),
    boundary_value
  )
  returning id into created_event_id;

  return jsonb_build_object(
    'record', private.execution_attempt_json(created_attempt),
    'eventId', created_event_id,
    'persisted', true,
    'idempotentReplay', false,
    'boundary', boundary_value
  );
end;
$$;

create or replace function private.replay_execution_attempt_envelope(
  p_workspace_slug text,
  p_idempotency_key text default null,
  p_replay_token text default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_attempt private.execution_attempts%rowtype;
  created_event_id uuid;
  boundary_value text := private.execution_attempt_boundary();
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead', 'reviewer']
  );

  if coalesce(p_idempotency_key, '') = '' and coalesce(p_replay_token, '') = '' then
    raise exception 'execution-attempt-replay-key-required';
  end if;

  select *
  into selected_attempt
  from private.execution_attempts attempt
  where attempt.workspace_id = selected_workspace.id
    and (
      (coalesce(p_idempotency_key, '') <> '' and attempt.idempotency_key = p_idempotency_key)
      or (coalesce(p_replay_token, '') <> '' and attempt.replay_token = p_replay_token)
    )
    and attempt.retention_until > now();

  if selected_attempt.id is null then
    raise exception 'execution-attempt-replay-not-found';
  end if;

  insert into private.execution_attempt_events (
    tenant_id,
    workspace_id,
    execution_attempt_id,
    actor_user_id,
    event_type,
    event_metadata,
    boundary
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    selected_attempt.id,
    (select auth.uid()),
    'attempt-replayed',
    jsonb_build_object(
      'attemptId', selected_attempt.attempt_id,
      'idempotencyKey', selected_attempt.idempotency_key,
      'replayToken', selected_attempt.replay_token,
      'metadataReplayOnly', true,
      'syntheticOnly', true,
      'noPhi', true
    ),
    boundary_value
  )
  returning id into created_event_id;

  return jsonb_build_object(
    'record', private.execution_attempt_json(selected_attempt),
    'eventId', created_event_id,
    'replayed', true,
    'boundary', boundary_value
  );
end;
$$;

create or replace function private.record_execution_attempt_review_disposition(
  p_workspace_slug text,
  p_attempt_id text,
  p_disposition text,
  p_reviewer_role text,
  p_reason_code text,
  p_review_note text,
  p_attestation text,
  p_event_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_attempt private.execution_attempts%rowtype;
  created_disposition private.execution_attempt_review_dispositions%rowtype;
  created_event_id uuid;
  normalized_metadata jsonb := coalesce(p_event_metadata, '{}'::jsonb);
  boundary_value text := private.execution_attempt_boundary();
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead', 'reviewer']
  );

  if jsonb_typeof(normalized_metadata) <> 'object'
    or pg_column_size(normalized_metadata) > 32768 then
    raise exception 'execution-attempt-review-invalid-metadata';
  end if;

  perform private.reject_execution_attempt_prohibited_text(
    concat_ws(' ', p_reviewer_role, p_reason_code, p_review_note, normalized_metadata::text)
  );

  if p_disposition not in (
    'approved-for-synthetic-release',
    'changes-requested',
    'rejected',
    'escalated'
  ) then
    raise exception 'execution-attempt-review-invalid-disposition';
  end if;

  if p_attestation <> 'no-phi-human-review-no-clinical-authority' then
    raise exception 'execution-attempt-review-invalid-attestation';
  end if;

  select *
  into selected_attempt
  from private.execution_attempts attempt
  where attempt.workspace_id = selected_workspace.id
    and attempt.attempt_id = p_attempt_id
    and attempt.retention_until > now();

  if selected_attempt.id is null then
    raise exception 'execution-attempt-review-target-not-found';
  end if;

  insert into private.execution_attempt_review_dispositions (
    tenant_id,
    workspace_id,
    execution_attempt_id,
    actor_user_id,
    disposition,
    reviewer_role,
    reason_code,
    review_note,
    attestation,
    event_metadata,
    boundary
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    selected_attempt.id,
    (select auth.uid()),
    p_disposition,
    p_reviewer_role,
    p_reason_code,
    p_review_note,
    p_attestation,
    normalized_metadata || jsonb_build_object(
      'attemptId', selected_attempt.attempt_id,
      'idempotencyKey', selected_attempt.idempotency_key,
      'syntheticOnly', true,
      'noPhi', true,
      'clinicalCareAuthority', 'not-authorized-live-care'
    ),
    boundary_value
  )
  returning * into created_disposition;

  update private.execution_attempts
  set updated_at = now()
  where id = selected_attempt.id
  returning * into selected_attempt;

  insert into private.execution_attempt_events (
    tenant_id,
    workspace_id,
    execution_attempt_id,
    actor_user_id,
    event_type,
    event_metadata,
    boundary
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    selected_attempt.id,
    (select auth.uid()),
    'attempt-review-disposition-recorded',
    jsonb_build_object(
      'attemptId', selected_attempt.attempt_id,
      'dispositionId', created_disposition.id,
      'disposition', created_disposition.disposition,
      'reviewerRole', created_disposition.reviewer_role,
      'reasonCode', created_disposition.reason_code,
      'syntheticOnly', true,
      'noPhi', true,
      'clinicalCareAuthority', 'not-authorized-live-care'
    ),
    boundary_value
  )
  returning id into created_event_id;

  return jsonb_build_object(
    'record', private.execution_attempt_json(selected_attempt),
    'dispositionId', created_disposition.id,
    'eventId', created_event_id,
    'boundary', boundary_value
  );
end;
$$;

create or replace function public.record_execution_attempt_envelope(
  p_workspace_slug text,
  p_envelope jsonb,
  p_region text default 'us',
  p_retention_until timestamptz default null
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_execution_attempt_envelope(
    p_workspace_slug,
    p_envelope,
    p_region,
    p_retention_until
  );
$$;

create or replace function public.replay_execution_attempt_envelope(
  p_workspace_slug text,
  p_idempotency_key text default null,
  p_replay_token text default null
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.replay_execution_attempt_envelope(
    p_workspace_slug,
    p_idempotency_key,
    p_replay_token
  );
$$;

create or replace function public.record_execution_attempt_review_disposition(
  p_workspace_slug text,
  p_attempt_id text,
  p_disposition text,
  p_reviewer_role text,
  p_reason_code text,
  p_review_note text,
  p_attestation text,
  p_event_metadata jsonb default '{}'::jsonb
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_execution_attempt_review_disposition(
    p_workspace_slug,
    p_attempt_id,
    p_disposition,
    p_reviewer_role,
    p_reason_code,
    p_review_note,
    p_attestation,
    p_event_metadata
  );
$$;

revoke all on function private.execution_attempt_boundary()
  from public, anon, authenticated, service_role;
revoke all on function private.reject_execution_attempt_prohibited_text(text)
  from public, anon, authenticated, service_role;
revoke all on function private.execution_attempt_json(private.execution_attempts)
  from public, anon, authenticated, service_role;
revoke all on function private.record_execution_attempt_envelope(text, jsonb, text, timestamptz)
  from public, anon, authenticated, service_role;
revoke all on function private.replay_execution_attempt_envelope(text, text, text)
  from public, anon, authenticated, service_role;
revoke all on function private.record_execution_attempt_review_disposition(text, text, text, text, text, text, text, jsonb)
  from public, anon, authenticated, service_role;

revoke all on function public.record_execution_attempt_envelope(text, jsonb, text, timestamptz)
  from public, anon, authenticated, service_role;
revoke all on function public.replay_execution_attempt_envelope(text, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.record_execution_attempt_review_disposition(text, text, text, text, text, text, text, jsonb)
  from public, anon, authenticated, service_role;

grant execute on function private.record_execution_attempt_envelope(text, jsonb, text, timestamptz)
  to authenticated;
grant execute on function private.replay_execution_attempt_envelope(text, text, text)
  to authenticated;
grant execute on function private.record_execution_attempt_review_disposition(text, text, text, text, text, text, text, jsonb)
  to authenticated;

grant execute on function public.record_execution_attempt_envelope(text, jsonb, text, timestamptz)
  to authenticated;
grant execute on function public.replay_execution_attempt_envelope(text, text, text)
  to authenticated;
grant execute on function public.record_execution_attempt_review_disposition(text, text, text, text, text, text, text, jsonb)
  to authenticated;
