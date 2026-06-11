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

revoke all on function private.require_sales_server_token() from public, anon, authenticated;
