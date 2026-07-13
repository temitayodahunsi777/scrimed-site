create table if not exists private.scrimed_work_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  session_id text not null check (
    session_id ~ '^work_session_[a-z0-9_]{8,80}$'
  ),
  title text not null check (char_length(title) between 3 and 220),
  objective text not null check (char_length(objective) between 12 and 1200),
  workspace_domain text not null check (
    workspace_domain in (
      'clinical',
      'operations',
      'executive',
      'research',
      'engineering',
      'patient-access',
      'revenue-cycle',
      'trust-governance'
    )
  ),
  risk_level text not null check (risk_level in ('low', 'moderate', 'high')),
  requested_autonomy text not null check (
    requested_autonomy in ('observe', 'recommend', 'prepare', 'execute_with_approval')
  ),
  approved_autonomy text not null check (
    approved_autonomy in ('observe', 'recommend', 'prepare', 'execute_with_approval')
  ),
  input_classification text not null check (
    input_classification in ('synthetic-no-phi', 'metadata-only', 'deidentified')
  ),
  status text not null check (
    status in (
      'draft',
      'planning',
      'active',
      'awaiting_approval',
      'paused',
      'verifying',
      'failed',
      'cancelled',
      'rolled_back'
    )
  ),
  idempotency_key text not null check (
    char_length(idempotency_key) between 8 and 160
    and idempotency_key !~ '[[:space:]]'
  ),
  definition_of_done jsonb not null check (
    jsonb_typeof(definition_of_done) = 'object'
    and pg_column_size(definition_of_done) <= 32768
  ),
  selected_model jsonb not null check (
    jsonb_typeof(selected_model) = 'object'
    and pg_column_size(selected_model) <= 32768
  ),
  value_telemetry jsonb not null check (
    jsonb_typeof(value_telemetry) = 'object'
    and pg_column_size(value_telemetry) <= 32768
  ),
  status_history jsonb not null check (
    jsonb_typeof(status_history) = 'array'
    and pg_column_size(status_history) <= 32768
  ),
  session_payload jsonb not null check (
    jsonb_typeof(session_payload) = 'object'
    and pg_column_size(session_payload) <= 131072
  ),
  human_review_required boolean not null default true check (human_review_required),
  no_phi_assertion boolean not null default true check (no_phi_assertion),
  phi_authority text not null default 'not-authorized-production-phi'
    check (phi_authority = 'not-authorized-production-phi'),
  clinical_care_authority text not null default 'not-authorized-live-care'
    check (clinical_care_authority = 'not-authorized-live-care'),
  payer_submission_authority text not null default 'not-authorized'
    check (payer_submission_authority = 'not-authorized'),
  ehr_writeback_authority text not null default 'not-authorized'
    check (ehr_writeback_authority = 'not-authorized'),
  boundary text not null check (char_length(boundary) between 120 and 2400),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, session_id),
  unique (workspace_id, idempotency_key)
);

create table if not exists private.scrimed_work_artifacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  scrimed_work_session_id uuid not null references private.scrimed_work_sessions(id) on delete restrict,
  artifact_id text not null check (
    artifact_id ~ '^artifact_[a-z0-9_]{8,100}$'
  ),
  artifact_type text not null check (
    artifact_type in (
      'clinical-summary',
      'patient-education',
      'care-coordination-brief',
      'prior-authorization-draft',
      'appeal-letter-draft',
      'research-brief',
      'executive-report',
      'payer-report',
      'quality-report',
      'board-brief',
      'fhir-bundle-preview',
      'workflow-runbook'
    )
  ),
  title text not null check (char_length(title) between 3 and 220),
  review_status text not null check (
    review_status in ('draft', 'human_review_required', 'blocked')
  ),
  idempotency_key text not null check (
    char_length(idempotency_key) between 8 and 160
    and idempotency_key !~ '[[:space:]]'
  ),
  artifact_payload jsonb not null check (
    jsonb_typeof(artifact_payload) = 'object'
    and pg_column_size(artifact_payload) <= 131072
  ),
  no_phi_assertion boolean not null default true check (no_phi_assertion),
  boundary text not null check (char_length(boundary) between 120 and 2400),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (workspace_id, artifact_id),
  unique (workspace_id, idempotency_key)
);

create table if not exists private.scrimed_work_audit_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  scrimed_work_session_id uuid references private.scrimed_work_sessions(id) on delete restrict,
  scrimed_work_artifact_id uuid references private.scrimed_work_artifacts(id) on delete restrict,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  event_type text not null check (
    event_type in (
      'session-recorded',
      'session-idempotency-reused',
      'session-transitioned',
      'artifact-recorded',
      'artifact-idempotency-reused'
    )
  ),
  event_metadata jsonb not null default '{}'::jsonb check (
    jsonb_typeof(event_metadata) = 'object'
    and pg_column_size(event_metadata) <= 32768
  ),
  no_phi_assertion boolean not null default true check (no_phi_assertion),
  boundary text not null check (char_length(boundary) between 120 and 2400),
  created_at timestamptz not null default now()
);

create index if not exists scrimed_work_sessions_workspace_created_idx
  on private.scrimed_work_sessions(workspace_id, created_at desc);
create index if not exists scrimed_work_sessions_tenant_created_idx
  on private.scrimed_work_sessions(tenant_id, created_at desc);
create index if not exists scrimed_work_sessions_created_by_idx
  on private.scrimed_work_sessions(created_by);
create index if not exists scrimed_work_artifacts_session_created_idx
  on private.scrimed_work_artifacts(scrimed_work_session_id, created_at desc);
create index if not exists scrimed_work_artifacts_workspace_created_idx
  on private.scrimed_work_artifacts(workspace_id, created_at desc);
create index if not exists scrimed_work_artifacts_created_by_idx
  on private.scrimed_work_artifacts(created_by);
create index if not exists scrimed_work_audit_events_session_created_idx
  on private.scrimed_work_audit_events(scrimed_work_session_id, created_at desc);
create index if not exists scrimed_work_audit_events_workspace_created_idx
  on private.scrimed_work_audit_events(workspace_id, created_at desc);
create index if not exists scrimed_work_audit_events_actor_created_idx
  on private.scrimed_work_audit_events(actor_user_id, created_at desc);

alter table private.scrimed_work_sessions enable row level security;
alter table private.scrimed_work_artifacts enable row level security;
alter table private.scrimed_work_audit_events enable row level security;

revoke all on private.scrimed_work_sessions from public, anon, authenticated;
revoke all on private.scrimed_work_artifacts from public, anon, authenticated;
revoke all on private.scrimed_work_audit_events from public, anon, authenticated;

drop policy if exists scrimed_work_sessions_deny_all on private.scrimed_work_sessions;
create policy scrimed_work_sessions_deny_all
on private.scrimed_work_sessions
as restrictive
for all
to public
using (false)
with check (false);

drop policy if exists scrimed_work_artifacts_deny_all on private.scrimed_work_artifacts;
create policy scrimed_work_artifacts_deny_all
on private.scrimed_work_artifacts
as restrictive
for all
to public
using (false)
with check (false);

drop policy if exists scrimed_work_audit_events_deny_all on private.scrimed_work_audit_events;
create policy scrimed_work_audit_events_deny_all
on private.scrimed_work_audit_events
as restrictive
for all
to public
using (false)
with check (false);

create or replace function private.scrimed_work_boundary()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select 'SCRIMED Work durable records store tenant-scoped metadata-only sessions, artifacts, status transitions, value telemetry, rollback metadata, verification evidence, idempotency, and audit events only. They do not store live patient data, chart text, payer member data, credentials, raw connector payloads, autonomous clinical authority, payer submission authority, EHR writeback authority, production connector approval, certification proof, or customer go-live authority.';
$$;

create or replace function private.reject_scrimed_work_prohibited_text(p_payload text)
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
    raise exception 'scrimed-work-prohibited-content';
  end if;
end;
$$;

create or replace function private.scrimed_work_session_status(p_session jsonb)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select entry ->> 'status'
      from jsonb_array_elements(coalesce(p_session -> 'statusHistory', '[]'::jsonb)) with ordinality history(entry, position)
      order by history.position desc
      limit 1
    ),
    'draft'
  );
$$;

create or replace function private.scrimed_work_session_json(session_record private.scrimed_work_sessions)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', session_record.id,
    'tenantId', session_record.tenant_id,
    'workspaceId', session_record.workspace_id,
    'workspaceSlug', (
      select workspace.slug
      from public.pilot_workspaces workspace
      where workspace.id = session_record.workspace_id
    ),
    'sessionId', session_record.session_id,
    'title', session_record.title,
    'objective', session_record.objective,
    'workspaceDomain', session_record.workspace_domain,
    'riskLevel', session_record.risk_level,
    'approvedAutonomy', session_record.approved_autonomy,
    'status', session_record.status,
    'session', session_record.session_payload,
    'eventCount', (
      select count(*)
      from private.scrimed_work_audit_events event
      where event.scrimed_work_session_id = session_record.id
    ),
    'artifactCount', (
      select count(*)
      from private.scrimed_work_artifacts artifact
      where artifact.scrimed_work_session_id = session_record.id
    ),
    'humanReviewRequired', session_record.human_review_required,
    'noPhiAssertion', session_record.no_phi_assertion,
    'createdBy', session_record.created_by,
    'createdAt', session_record.created_at,
    'updatedAt', session_record.updated_at,
    'boundary', session_record.boundary
  );
$$;

create or replace function private.record_scrimed_work_session(
  p_workspace_slug text,
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
  created_session private.scrimed_work_sessions%rowtype;
  existing_session private.scrimed_work_sessions%rowtype;
  created_event_id uuid;
  normalized_session jsonb := coalesce(p_session, '{}'::jsonb);
  session_text text := normalized_session::text;
  boundary_value text := private.scrimed_work_boundary();
  session_status text := private.scrimed_work_session_status(normalized_session);
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead', 'reviewer']
  );

  if jsonb_typeof(normalized_session) <> 'object'
    or pg_column_size(normalized_session) > 131072 then
    raise exception 'scrimed-work-invalid-session';
  end if;

  perform private.reject_scrimed_work_prohibited_text(session_text);

  if normalized_session ->> 'inputClassification' not in ('synthetic-no-phi', 'metadata-only', 'deidentified')
    or normalized_session ->> 'riskLevel' = 'prohibited'
    or normalized_session ->> 'approvedAutonomy' = 'execute_preapproved'
    or coalesce((normalized_session #>> '{rollbackMetadata,rollbackAvailable}')::boolean, false) is not true then
    raise exception 'scrimed-work-boundary-violation';
  end if;

  if coalesce(p_idempotency_key, '') = ''
    or char_length(p_idempotency_key) > 160
    or p_idempotency_key ~ '[[:space:]]' then
    raise exception 'scrimed-work-idempotency-required';
  end if;

  select *
  into existing_session
  from private.scrimed_work_sessions
  where workspace_id = selected_workspace.id
    and idempotency_key = p_idempotency_key;

  if existing_session.id is not null then
    if existing_session.session_id <> normalized_session ->> 'id' then
      raise exception 'scrimed-work-idempotency-conflict';
    end if;

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
      existing_session.id,
      (select auth.uid()),
      'session-idempotency-reused',
      coalesce(p_audit_event, '{}'::jsonb) || jsonb_build_object(
        'sessionId', existing_session.session_id,
        'idempotencyKey', existing_session.idempotency_key,
        'syntheticOnly', true,
        'noPhi', true,
        'assuranceLevel', 'aal2'
      ),
      boundary_value
    )
    returning id into created_event_id;

    return jsonb_build_object(
      'record', private.scrimed_work_session_json(existing_session),
      'eventId', created_event_id,
      'persisted', true,
      'idempotentReplay', true,
      'boundary', boundary_value
    );
  end if;

  insert into private.scrimed_work_sessions (
    tenant_id,
    workspace_id,
    session_id,
    title,
    objective,
    workspace_domain,
    risk_level,
    requested_autonomy,
    approved_autonomy,
    input_classification,
    status,
    idempotency_key,
    definition_of_done,
    selected_model,
    value_telemetry,
    status_history,
    session_payload,
    boundary,
    created_by
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    normalized_session ->> 'id',
    normalized_session ->> 'title',
    normalized_session ->> 'objective',
    normalized_session ->> 'workspaceDomain',
    normalized_session ->> 'riskLevel',
    normalized_session ->> 'requestedAutonomy',
    normalized_session ->> 'approvedAutonomy',
    normalized_session ->> 'inputClassification',
    session_status,
    p_idempotency_key,
    normalized_session -> 'definitionOfDone',
    normalized_session -> 'selectedModel',
    normalized_session -> 'valueTelemetry',
    normalized_session -> 'statusHistory',
    normalized_session,
    boundary_value,
    (select auth.uid())
  )
  returning * into created_session;

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
    created_session.id,
    (select auth.uid()),
    'session-recorded',
    coalesce(p_audit_event, '{}'::jsonb) || jsonb_build_object(
      'sessionId', created_session.session_id,
      'workspaceDomain', created_session.workspace_domain,
      'riskLevel', created_session.risk_level,
      'approvedAutonomy', created_session.approved_autonomy,
      'idempotencyKey', p_idempotency_key,
      'syntheticOnly', true,
      'noPhi', true,
      'humanReviewRequired', true,
      'assuranceLevel', 'aal2'
    ),
    boundary_value
  )
  returning id into created_event_id;

  return jsonb_build_object(
    'record', private.scrimed_work_session_json(created_session),
    'eventId', created_event_id,
    'persisted', true,
    'idempotentReplay', false,
    'boundary', boundary_value
  );
end;
$$;

create or replace function private.get_scrimed_work_session(
  p_workspace_slug text,
  p_session_id text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_session private.scrimed_work_sessions%rowtype;
  boundary_value text := private.scrimed_work_boundary();
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead', 'reviewer']
  );

  select *
  into selected_session
  from private.scrimed_work_sessions
  where workspace_id = selected_workspace.id
    and session_id = p_session_id;

  if selected_session.id is null then
    raise exception 'scrimed-work-session-not-found';
  end if;

  return jsonb_build_object(
    'record', private.scrimed_work_session_json(selected_session),
    'boundary', boundary_value
  );
end;
$$;

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
  created_event_id uuid;
  normalized_session jsonb := coalesce(p_session, '{}'::jsonb);
  boundary_value text := private.scrimed_work_boundary();
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead', 'reviewer']
  );

  if p_status not in (
    'planning',
    'active',
    'awaiting_approval',
    'paused',
    'verifying',
    'failed',
    'cancelled',
    'rolled_back'
  ) then
    raise exception 'scrimed-work-invalid-status';
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
    and session_id = p_session_id;

  if selected_session.id is null then
    raise exception 'scrimed-work-session-not-found';
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
      'status', p_status,
      'reasonPresent', true,
      'idempotencyKey', p_idempotency_key,
      'syntheticOnly', true,
      'noPhi', true,
      'assuranceLevel', 'aal2'
    ),
    boundary_value
  )
  returning id into created_event_id;

  return jsonb_build_object(
    'record', private.scrimed_work_session_json(updated_session),
    'eventId', created_event_id,
    'transitioned', true,
    'boundary', boundary_value
  );
end;
$$;

create or replace function private.record_scrimed_work_artifact(
  p_workspace_slug text,
  p_session_id text,
  p_artifact jsonb,
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
  created_artifact private.scrimed_work_artifacts%rowtype;
  existing_artifact private.scrimed_work_artifacts%rowtype;
  created_event_id uuid;
  normalized_artifact jsonb := coalesce(p_artifact, '{}'::jsonb);
  boundary_value text := private.scrimed_work_boundary();
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead', 'reviewer']
  );

  if jsonb_typeof(normalized_artifact) <> 'object'
    or pg_column_size(normalized_artifact) > 131072 then
    raise exception 'scrimed-work-invalid-artifact';
  end if;

  perform private.reject_scrimed_work_prohibited_text(
    concat_ws(' ', p_session_id, normalized_artifact::text)
  );

  if coalesce(p_idempotency_key, '') = ''
    or char_length(p_idempotency_key) > 160
    or p_idempotency_key ~ '[[:space:]]' then
    raise exception 'scrimed-work-idempotency-required';
  end if;

  if normalized_artifact ->> 'reviewStatus' not in ('draft', 'human_review_required', 'blocked')
    or coalesce((normalized_artifact #>> '{exportMetadata,noPhiConfirmed}')::boolean, false) is not true
    or coalesce((normalized_artifact #>> '{exportMetadata,exportRequiresHumanReview}')::boolean, true) is not true then
    raise exception 'scrimed-work-artifact-boundary-violation';
  end if;

  select *
  into selected_session
  from private.scrimed_work_sessions
  where workspace_id = selected_workspace.id
    and session_id = p_session_id;

  if selected_session.id is null then
    raise exception 'scrimed-work-session-not-found';
  end if;

  select *
  into existing_artifact
  from private.scrimed_work_artifacts
  where workspace_id = selected_workspace.id
    and idempotency_key = p_idempotency_key;

  if existing_artifact.id is not null then
    if existing_artifact.artifact_id <> normalized_artifact ->> 'artifactId' then
      raise exception 'scrimed-work-idempotency-conflict';
    end if;

    insert into private.scrimed_work_audit_events (
      tenant_id,
      workspace_id,
      scrimed_work_session_id,
      scrimed_work_artifact_id,
      actor_user_id,
      event_type,
      event_metadata,
      boundary
    )
    values (
      selected_workspace.tenant_id,
      selected_workspace.id,
      selected_session.id,
      existing_artifact.id,
      (select auth.uid()),
      'artifact-idempotency-reused',
      coalesce(p_audit_event, '{}'::jsonb) || jsonb_build_object(
        'sessionId', p_session_id,
        'artifactId', existing_artifact.artifact_id,
        'idempotencyKey', p_idempotency_key,
        'syntheticOnly', true,
        'noPhi', true,
        'assuranceLevel', 'aal2'
      ),
      boundary_value
    )
    returning id into created_event_id;

    return jsonb_build_object(
      'artifactId', existing_artifact.id,
      'eventId', created_event_id,
      'persisted', true,
      'idempotentReplay', true,
      'boundary', boundary_value
    );
  end if;

  insert into private.scrimed_work_artifacts (
    tenant_id,
    workspace_id,
    scrimed_work_session_id,
    artifact_id,
    artifact_type,
    title,
    review_status,
    idempotency_key,
    artifact_payload,
    boundary,
    created_by
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    selected_session.id,
    normalized_artifact ->> 'artifactId',
    normalized_artifact ->> 'type',
    normalized_artifact ->> 'title',
    normalized_artifact ->> 'reviewStatus',
    p_idempotency_key,
    normalized_artifact,
    boundary_value,
    (select auth.uid())
  )
  returning * into created_artifact;

  insert into private.scrimed_work_audit_events (
    tenant_id,
    workspace_id,
    scrimed_work_session_id,
    scrimed_work_artifact_id,
    actor_user_id,
    event_type,
    event_metadata,
    boundary
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    selected_session.id,
    created_artifact.id,
    (select auth.uid()),
    'artifact-recorded',
    coalesce(p_audit_event, '{}'::jsonb) || jsonb_build_object(
      'sessionId', p_session_id,
      'artifactId', created_artifact.artifact_id,
      'artifactType', created_artifact.artifact_type,
      'reviewStatus', created_artifact.review_status,
      'idempotencyKey', p_idempotency_key,
      'syntheticOnly', true,
      'noPhi', true,
      'assuranceLevel', 'aal2'
    ),
    boundary_value
  )
  returning id into created_event_id;

  return jsonb_build_object(
    'artifactId', created_artifact.id,
    'eventId', created_event_id,
    'persisted', true,
    'idempotentReplay', false,
    'boundary', boundary_value
  );
end;
$$;

create or replace function public.get_scrimed_work_session(
  p_workspace_slug text,
  p_session_id text
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select private.get_scrimed_work_session(
    p_workspace_slug,
    p_session_id
  );
$$;

create or replace function public.record_scrimed_work_session(
  p_workspace_slug text,
  p_session jsonb,
  p_idempotency_key text,
  p_audit_event jsonb default '{}'::jsonb
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_scrimed_work_session(
    p_workspace_slug,
    p_session,
    p_idempotency_key,
    p_audit_event
  );
$$;

create or replace function public.transition_scrimed_work_session(
  p_workspace_slug text,
  p_session_id text,
  p_status text,
  p_reason text,
  p_session jsonb,
  p_idempotency_key text,
  p_audit_event jsonb default '{}'::jsonb
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.transition_scrimed_work_session(
    p_workspace_slug,
    p_session_id,
    p_status,
    p_reason,
    p_session,
    p_idempotency_key,
    p_audit_event
  );
$$;

create or replace function public.record_scrimed_work_artifact(
  p_workspace_slug text,
  p_session_id text,
  p_artifact jsonb,
  p_idempotency_key text,
  p_audit_event jsonb default '{}'::jsonb
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_scrimed_work_artifact(
    p_workspace_slug,
    p_session_id,
    p_artifact,
    p_idempotency_key,
    p_audit_event
  );
$$;

revoke all on function private.record_scrimed_work_session(text, jsonb, text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function private.get_scrimed_work_session(text, text)
  from public, anon, authenticated, service_role;
revoke all on function private.transition_scrimed_work_session(text, text, text, text, jsonb, text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function private.record_scrimed_work_artifact(text, text, jsonb, text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function private.scrimed_work_boundary()
  from public, anon, authenticated, service_role;
revoke all on function private.reject_scrimed_work_prohibited_text(text)
  from public, anon, authenticated, service_role;
revoke all on function private.scrimed_work_session_status(jsonb)
  from public, anon, authenticated, service_role;
revoke all on function private.scrimed_work_session_json(private.scrimed_work_sessions)
  from public, anon, authenticated, service_role;

revoke all on function public.record_scrimed_work_session(text, jsonb, text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.get_scrimed_work_session(text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.transition_scrimed_work_session(text, text, text, text, jsonb, text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.record_scrimed_work_artifact(text, text, jsonb, text, jsonb)
  from public, anon, authenticated, service_role;

grant execute on function private.record_scrimed_work_session(text, jsonb, text, jsonb)
  to authenticated;
grant execute on function private.get_scrimed_work_session(text, text)
  to authenticated;
grant execute on function private.transition_scrimed_work_session(text, text, text, text, jsonb, text, jsonb)
  to authenticated;
grant execute on function private.record_scrimed_work_artifact(text, text, jsonb, text, jsonb)
  to authenticated;

grant execute on function public.record_scrimed_work_session(text, jsonb, text, jsonb)
  to authenticated;
grant execute on function public.get_scrimed_work_session(text, text)
  to authenticated;
grant execute on function public.transition_scrimed_work_session(text, text, text, text, jsonb, text, jsonb)
  to authenticated;
grant execute on function public.record_scrimed_work_artifact(text, text, jsonb, text, jsonb)
  to authenticated;

comment on table private.scrimed_work_sessions is
  'AAL2-gated no-PHI SCRIMED Work session metadata. Direct table access is denied; public RPC wrappers require governance workspace authorization.';
comment on table private.scrimed_work_artifacts is
  'AAL2-gated no-PHI SCRIMED Work artifact metadata. Artifacts remain drafts/human-review-required/blocked only.';
comment on table private.scrimed_work_audit_events is
  'Append-only no-PHI SCRIMED Work audit events for session and artifact durable mutations.';
