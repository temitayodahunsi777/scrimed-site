alter table private.pilot_intake_credentials
  add column if not exists sales_tenant_id uuid references public.pilot_tenants(id) on delete restrict;

alter table private.pilot_intake_submissions
  add column if not exists tenant_id uuid references public.pilot_tenants(id) on delete restrict,
  add column if not exists pipeline_stage text not null default 'new'
    check (pipeline_stage in ('new', 'qualified', 'discovery', 'proposal', 'pilot-planning', 'won', 'closed-lost')),
  add column if not exists assigned_owner text not null default '',
  add column if not exists next_action text not null default '',
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists updated_by uuid references auth.users(id) on delete restrict,
  add column if not exists last_crm_sync_at timestamptz,
  add column if not exists last_crm_sync_status text not null default 'not-attempted'
    check (last_crm_sync_status in ('not-attempted', 'synced', 'failed', 'not-configured')),
  add column if not exists last_crm_sync_detail text not null default '';

create index if not exists pilot_intake_submissions_tenant_received_at_idx
  on private.pilot_intake_submissions(tenant_id, received_at desc);
create index if not exists pilot_intake_submissions_tenant_pipeline_stage_idx
  on private.pilot_intake_submissions(tenant_id, pipeline_stage);
create index if not exists pilot_intake_credentials_sales_tenant_id_idx
  on private.pilot_intake_credentials(sales_tenant_id);
create index if not exists pilot_intake_submissions_updated_by_idx
  on private.pilot_intake_submissions(updated_by);

create table if not exists private.sales_opportunity_audit_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  intake_id text not null references private.pilot_intake_submissions(intake_id) on delete restrict,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  event_type text not null check (
    event_type in ('opportunity-updated', 'proposal-downloaded', 'crm-sync-recorded')
  ),
  event_metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(event_metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists sales_opportunity_audit_tenant_created_at_idx
  on private.sales_opportunity_audit_events(tenant_id, created_at desc);
create index if not exists sales_opportunity_audit_intake_created_at_idx
  on private.sales_opportunity_audit_events(intake_id, created_at desc);
create index if not exists sales_opportunity_audit_actor_user_id_idx
  on private.sales_opportunity_audit_events(actor_user_id);

alter table private.sales_opportunity_audit_events enable row level security;
revoke all on private.sales_opportunity_audit_events from public, anon, authenticated;

create policy sales_opportunity_audit_deny_direct_access
on private.sales_opportunity_audit_events
for all
to public
using (false)
with check (false);

create or replace function private.require_sales_tenant_admin()
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  target_tenant_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'authentication-required';
  end if;

  select credential.sales_tenant_id
  into target_tenant_id
  from private.pilot_intake_credentials credential
  where credential.singleton = true;

  if target_tenant_id is null
    or not private.has_pilot_role(target_tenant_id, array['tenant-admin']) then
    raise exception 'sales-operations-admin-required';
  end if;

  return target_tenant_id;
end;
$$;

create or replace function private.require_sales_server_token()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  request_headers jsonb;
  supplied_token text;
  expected_hash text;
begin
  request_headers := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
  supplied_token := coalesce(request_headers ->> 'x-scrimed-sales-operations-token', '');

  select credential.token_hash
  into expected_hash
  from private.pilot_intake_credentials credential
  where credential.singleton = true;

  if expected_hash is null
    or supplied_token = ''
    or encode(extensions.digest(supplied_token, 'sha256'), 'hex') <> expected_hash then
    raise exception 'sales-operations-server-authorization-required';
  end if;
end;
$$;

create or replace function private.sales_opportunity_json(
  opportunity private.pilot_intake_submissions
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'intakeId', opportunity.intake_id,
    'receivedAt', opportunity.received_at,
    'pipelineStage', opportunity.pipeline_stage,
    'assignedOwner', opportunity.assigned_owner,
    'nextAction', opportunity.next_action,
    'updatedAt', opportunity.updated_at,
    'updatedBy', opportunity.updated_by,
    'lastCrmSyncAt', opportunity.last_crm_sync_at,
    'lastCrmSyncStatus', opportunity.last_crm_sync_status,
    'lastCrmSyncDetail', opportunity.last_crm_sync_detail,
    'retentionUntil', opportunity.retention_until,
    'payload', opportunity.payload
  );
$$;

create or replace function private.sales_operations_dashboard()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  target_tenant_id uuid;
  opportunity_count integer;
  open_count integer;
  proposal_count integer;
  pilot_planning_count integer;
  won_count integer;
  opportunities jsonb;
  audit_events jsonb;
begin
  target_tenant_id := private.require_sales_tenant_admin();

  select
    count(*)::integer,
    count(*) filter (where pipeline_stage not in ('won', 'closed-lost'))::integer,
    count(*) filter (where pipeline_stage = 'proposal')::integer,
    count(*) filter (where pipeline_stage = 'pilot-planning')::integer,
    count(*) filter (where pipeline_stage = 'won')::integer
  into opportunity_count, open_count, proposal_count, pilot_planning_count, won_count
  from private.pilot_intake_submissions
  where tenant_id = target_tenant_id;

  select coalesce(
    jsonb_agg(private.sales_opportunity_json(opportunity) order by opportunity.received_at desc),
    '[]'::jsonb
  )
  into opportunities
  from private.pilot_intake_submissions opportunity
  where opportunity.tenant_id = target_tenant_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', audit_event.id,
        'intakeId', audit_event.intake_id,
        'actorUserId', audit_event.actor_user_id,
        'eventType', audit_event.event_type,
        'eventMetadata', audit_event.event_metadata,
        'createdAt', audit_event.created_at
      )
      order by audit_event.created_at desc
    ),
    '[]'::jsonb
  )
  into audit_events
  from (
    select *
    from private.sales_opportunity_audit_events
    where tenant_id = target_tenant_id
    order by created_at desc
    limit 100
  ) audit_event;

  return jsonb_build_object(
    'tenantId', target_tenant_id,
    'summary', jsonb_build_object(
      'opportunityCount', opportunity_count,
      'openCount', open_count,
      'proposalCount', proposal_count,
      'pilotPlanningCount', pilot_planning_count,
      'wonCount', won_count
    ),
    'opportunities', opportunities,
    'auditEvents', audit_events,
    'boundary', 'Business-contact and workflow-scope opportunities only. No PHI, patient identifiers, live clinical records, or autonomous clinical execution.'
  );
end;
$$;

create or replace function private.get_sales_opportunity(p_intake_id text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  target_tenant_id uuid;
  selected_opportunity private.pilot_intake_submissions%rowtype;
begin
  target_tenant_id := private.require_sales_tenant_admin();

  select *
  into selected_opportunity
  from private.pilot_intake_submissions
  where tenant_id = target_tenant_id
    and intake_id = p_intake_id;

  if selected_opportunity.id is null then
    raise exception 'sales-opportunity-not-found';
  end if;

  return private.sales_opportunity_json(selected_opportunity);
end;
$$;

create or replace function private.update_sales_opportunity(
  p_intake_id text,
  p_pipeline_stage text,
  p_assigned_owner text,
  p_next_action text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_tenant_id uuid;
  selected_opportunity private.pilot_intake_submissions%rowtype;
begin
  target_tenant_id := private.require_sales_tenant_admin();
  perform private.require_sales_server_token();

  if p_pipeline_stage not in ('new', 'qualified', 'discovery', 'proposal', 'pilot-planning', 'won', 'closed-lost') then
    raise exception 'invalid-pipeline-stage';
  end if;

  if char_length(trim(coalesce(p_assigned_owner, ''))) > 180
    or char_length(trim(coalesce(p_next_action, ''))) > 500 then
    raise exception 'sales-opportunity-field-too-large';
  end if;

  if concat_ws(' ', p_assigned_owner, p_next_action) ~*
    '(^|[^a-z])(phi|mrn|dob)([^a-z]|$)|medical record|patient identifier|member id|diagnos(is|ed)|date of birth|protected health information' then
    raise exception 'prohibited-sales-opportunity-data';
  end if;

  update private.pilot_intake_submissions
  set pipeline_stage = p_pipeline_stage,
      assigned_owner = trim(coalesce(p_assigned_owner, '')),
      next_action = trim(coalesce(p_next_action, '')),
      updated_at = now(),
      updated_by = (select auth.uid())
  where tenant_id = target_tenant_id
    and intake_id = p_intake_id
  returning * into selected_opportunity;

  if selected_opportunity.id is null then
    raise exception 'sales-opportunity-not-found';
  end if;

  insert into private.sales_opportunity_audit_events (
    tenant_id,
    intake_id,
    actor_user_id,
    event_type,
    event_metadata
  )
  values (
    target_tenant_id,
    p_intake_id,
    (select auth.uid()),
    'opportunity-updated',
    jsonb_build_object(
      'pipelineStage', p_pipeline_stage,
      'assignedOwner', trim(coalesce(p_assigned_owner, '')),
      'nextActionPresent', trim(coalesce(p_next_action, '')) <> ''
    )
  );

  return private.sales_opportunity_json(selected_opportunity);
end;
$$;

create or replace function private.record_sales_proposal_download(p_intake_id text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_tenant_id uuid;
  created_event_id uuid;
begin
  target_tenant_id := private.require_sales_tenant_admin();
  perform private.require_sales_server_token();

  if not exists (
    select 1 from private.pilot_intake_submissions
    where tenant_id = target_tenant_id and intake_id = p_intake_id
  ) then
    raise exception 'sales-opportunity-not-found';
  end if;

  insert into private.sales_opportunity_audit_events (
    tenant_id,
    intake_id,
    actor_user_id,
    event_type,
    event_metadata
  )
  values (
    target_tenant_id,
    p_intake_id,
    (select auth.uid()),
    'proposal-downloaded',
    jsonb_build_object('format', 'text/markdown', 'noPhiBoundary', true)
  )
  returning id into created_event_id;

  return created_event_id;
end;
$$;

create or replace function private.record_sales_crm_sync(
  p_intake_id text,
  p_sync_status text,
  p_sync_detail text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_tenant_id uuid;
  created_event_id uuid;
begin
  target_tenant_id := private.require_sales_tenant_admin();
  perform private.require_sales_server_token();

  if p_sync_status not in ('synced', 'failed', 'not-configured')
    or char_length(coalesce(p_sync_detail, '')) > 500 then
    raise exception 'invalid-crm-sync-result';
  end if;

  update private.pilot_intake_submissions
  set last_crm_sync_at = now(),
      last_crm_sync_status = p_sync_status,
      last_crm_sync_detail = coalesce(p_sync_detail, ''),
      updated_at = now(),
      updated_by = (select auth.uid())
  where tenant_id = target_tenant_id
    and intake_id = p_intake_id;

  if not found then
    raise exception 'sales-opportunity-not-found';
  end if;

  insert into private.sales_opportunity_audit_events (
    tenant_id,
    intake_id,
    actor_user_id,
    event_type,
    event_metadata
  )
  values (
    target_tenant_id,
    p_intake_id,
    (select auth.uid()),
    'crm-sync-recorded',
    jsonb_build_object('status', p_sync_status, 'detail', coalesce(p_sync_detail, ''))
  )
  returning id into created_event_id;

  return created_event_id;
end;
$$;

create or replace function private.record_pilot_intake_submission(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_headers jsonb;
  supplied_token text;
  expected_hash text;
  target_tenant_id uuid;
  created_submission_id uuid;
begin
  request_headers := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
  supplied_token := coalesce(request_headers ->> 'x-scrimed-intake-token', '');

  select credential.token_hash, credential.sales_tenant_id
  into expected_hash, target_tenant_id
  from private.pilot_intake_credentials credential
  where credential.singleton = true;

  if expected_hash is null
    or target_tenant_id is null
    or supplied_token = ''
    or encode(extensions.digest(supplied_token, 'sha256'), 'hex') <> expected_hash then
    raise exception 'pilot-intake-persistence-not-authorized';
  end if;

  if jsonb_typeof(p_payload) <> 'object'
    or char_length(coalesce(p_payload ->> 'intakeId', '')) not between 20 and 100
    or coalesce(p_payload #>> '{contact,workEmail}', '') = ''
    or coalesce(p_payload ->> 'boundary', '') = '' then
    raise exception 'invalid-pilot-intake-payload';
  end if;

  insert into private.pilot_intake_submissions (
    tenant_id,
    intake_id,
    received_at,
    payload
  )
  values (
    target_tenant_id,
    p_payload ->> 'intakeId',
    (p_payload ->> 'receivedAt')::timestamptz,
    p_payload
  )
  returning id into created_submission_id;

  return created_submission_id;
end;
$$;

revoke all on function private.require_sales_tenant_admin() from public, anon, authenticated;
revoke all on function private.require_sales_server_token() from public, anon, authenticated;
revoke all on function private.sales_opportunity_json(private.pilot_intake_submissions) from public, anon, authenticated;
revoke all on function private.sales_operations_dashboard() from public, anon, authenticated;
revoke all on function private.get_sales_opportunity(text) from public, anon, authenticated;
revoke all on function private.update_sales_opportunity(text, text, text, text) from public, anon, authenticated;
revoke all on function private.record_sales_proposal_download(text) from public, anon, authenticated;
revoke all on function private.record_sales_crm_sync(text, text, text) from public, anon, authenticated;

grant execute on function private.sales_operations_dashboard() to authenticated;
grant execute on function private.get_sales_opportunity(text) to authenticated;
grant execute on function private.update_sales_opportunity(text, text, text, text) to authenticated;
grant execute on function private.record_sales_proposal_download(text) to authenticated;
grant execute on function private.record_sales_crm_sync(text, text, text) to authenticated;

create or replace function public.sales_operations_dashboard()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select private.sales_operations_dashboard();
$$;

create or replace function public.get_sales_opportunity(p_intake_id text)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select private.get_sales_opportunity(p_intake_id);
$$;

create or replace function public.update_sales_opportunity(
  p_intake_id text,
  p_pipeline_stage text,
  p_assigned_owner text,
  p_next_action text
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.update_sales_opportunity(
    p_intake_id,
    p_pipeline_stage,
    p_assigned_owner,
    p_next_action
  );
$$;

create or replace function public.record_sales_proposal_download(p_intake_id text)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_sales_proposal_download(p_intake_id);
$$;

create or replace function public.record_sales_crm_sync(
  p_intake_id text,
  p_sync_status text,
  p_sync_detail text
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_sales_crm_sync(p_intake_id, p_sync_status, p_sync_detail);
$$;

revoke all on function public.sales_operations_dashboard() from public, anon, authenticated;
revoke all on function public.get_sales_opportunity(text) from public, anon, authenticated;
revoke all on function public.update_sales_opportunity(text, text, text, text) from public, anon, authenticated;
revoke all on function public.record_sales_proposal_download(text) from public, anon, authenticated;
revoke all on function public.record_sales_crm_sync(text, text, text) from public, anon, authenticated;

grant execute on function public.sales_operations_dashboard() to authenticated;
grant execute on function public.get_sales_opportunity(text) to authenticated;
grant execute on function public.update_sales_opportunity(text, text, text, text) to authenticated;
grant execute on function public.record_sales_proposal_download(text) to authenticated;
grant execute on function public.record_sales_crm_sync(text, text, text) to authenticated;

comment on table private.sales_opportunity_audit_events is
  'Append-only audit evidence for SCRIMED business-contact and workflow-scope sales operations.';
