alter table private.pilot_intake_submissions
  add column if not exists next_action_due_at timestamptz,
  add column if not exists next_action_completed_at timestamptz,
  add column if not exists last_crm_export_at timestamptz,
  add column if not exists assessment_start_at timestamptz,
  add column if not exists assessment_duration_minutes integer not null default 45
    check (assessment_duration_minutes between 15 and 240),
  add column if not exists assessment_meeting_url text not null default '',
  add column if not exists assessment_status text not null default 'not-scheduled'
    check (assessment_status in ('not-scheduled', 'invitation-prepared', 'confirmed', 'completed', 'cancelled'));

create index if not exists pilot_intake_submissions_tenant_next_action_due_idx
  on private.pilot_intake_submissions(tenant_id, next_action_due_at)
  where next_action_completed_at is null;
create index if not exists pilot_intake_submissions_tenant_assessment_start_idx
  on private.pilot_intake_submissions(tenant_id, assessment_start_at)
  where assessment_status in ('invitation-prepared', 'confirmed');

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
      'assessment-invitation-downloaded'
    )
  );

create or replace function private.require_sales_tenant_admin()
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  target_tenant_id uuid;
  current_session_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'authentication-required';
  end if;

  if coalesce((select auth.jwt() ->> 'aal'), 'aal1') <> 'aal2' then
    raise exception 'sales-operations-mfa-required';
  end if;

  begin
    current_session_id := nullif((select auth.jwt() ->> 'session_id'), '')::uuid;
  exception when others then
    raise exception 'sales-operations-session-invalid';
  end;

  if current_session_id is null or not exists (
    select 1
    from auth.sessions active_session
    where active_session.id = current_session_id
      and active_session.user_id = (select auth.uid())
      and active_session.created_at >= now() - interval '12 hours'
      and coalesce(active_session.refreshed_at, active_session.created_at::timestamp)
        >= (now() - interval '2 hours')::timestamp
      and (active_session.not_after is null or active_session.not_after > now())
  ) then
    raise exception 'sales-operations-session-policy-required';
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
    'nextActionDueAt', opportunity.next_action_due_at,
    'nextActionCompletedAt', opportunity.next_action_completed_at,
    'updatedAt', opportunity.updated_at,
    'updatedBy', opportunity.updated_by,
    'lastCrmSyncAt', opportunity.last_crm_sync_at,
    'lastCrmSyncStatus', opportunity.last_crm_sync_status,
    'lastCrmSyncDetail', opportunity.last_crm_sync_detail,
    'lastCrmExportAt', opportunity.last_crm_export_at,
    'assessmentStartAt', opportunity.assessment_start_at,
    'assessmentDurationMinutes', opportunity.assessment_duration_minutes,
    'assessmentMeetingUrl', opportunity.assessment_meeting_url,
    'assessmentStatus', opportunity.assessment_status,
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
  due_action_count integer;
  overdue_action_count integer;
  scheduled_assessment_count integer;
  opportunities jsonb;
  audit_events jsonb;
begin
  target_tenant_id := private.require_sales_tenant_admin();

  select
    count(*)::integer,
    count(*) filter (where pipeline_stage not in ('won', 'closed-lost'))::integer,
    count(*) filter (where pipeline_stage = 'proposal')::integer,
    count(*) filter (where pipeline_stage = 'pilot-planning')::integer,
    count(*) filter (where pipeline_stage = 'won')::integer,
    count(*) filter (
      where next_action_due_at is not null
        and next_action_completed_at is null
        and next_action_due_at <= now() + interval '7 days'
    )::integer,
    count(*) filter (
      where next_action_due_at is not null
        and next_action_completed_at is null
        and next_action_due_at < now()
    )::integer,
    count(*) filter (
      where assessment_status in ('invitation-prepared', 'confirmed')
        and assessment_start_at >= now()
    )::integer
  into
    opportunity_count,
    open_count,
    proposal_count,
    pilot_planning_count,
    won_count,
    due_action_count,
    overdue_action_count,
    scheduled_assessment_count
  from private.pilot_intake_submissions
  where tenant_id = target_tenant_id;

  select coalesce(
    jsonb_agg(
      private.sales_opportunity_json(opportunity)
      order by
        opportunity.next_action_completed_at nulls first,
        opportunity.next_action_due_at asc nulls last,
        opportunity.received_at desc
    ),
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
    limit 150
  ) audit_event;

  return jsonb_build_object(
    'tenantId', target_tenant_id,
    'summary', jsonb_build_object(
      'opportunityCount', opportunity_count,
      'openCount', open_count,
      'proposalCount', proposal_count,
      'pilotPlanningCount', pilot_planning_count,
      'wonCount', won_count,
      'dueActionCount', due_action_count,
      'overdueActionCount', overdue_action_count,
      'scheduledAssessmentCount', scheduled_assessment_count
    ),
    'security', jsonb_build_object(
      'authentication', 'magic-link-plus-totp',
      'assuranceLevel', 'aal2',
      'maximumSessionHours', 12,
      'inactivityHours', 2,
      'passwordAuthentication', false
    ),
    'opportunities', opportunities,
    'auditEvents', audit_events,
    'boundary', 'Business-contact and workflow-scope opportunities only. No PHI, patient identifiers, live clinical records, or autonomous clinical execution.'
  );
end;
$$;

create or replace function private.update_sales_opportunity_v2(
  p_intake_id text,
  p_pipeline_stage text,
  p_assigned_owner text,
  p_next_action text,
  p_next_action_due_at timestamptz
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
      next_action_due_at = p_next_action_due_at,
      next_action_completed_at = case
        when trim(coalesce(p_next_action, '')) = '' then null
        when next_action is distinct from trim(coalesce(p_next_action, ''))
          or next_action_due_at is distinct from p_next_action_due_at then null
        else next_action_completed_at
      end,
      updated_at = now(),
      updated_by = (select auth.uid())
  where tenant_id = target_tenant_id
    and intake_id = p_intake_id
  returning * into selected_opportunity;

  if selected_opportunity.id is null then
    raise exception 'sales-opportunity-not-found';
  end if;

  insert into private.sales_opportunity_audit_events (
    tenant_id, intake_id, actor_user_id, event_type, event_metadata
  )
  values (
    target_tenant_id,
    p_intake_id,
    (select auth.uid()),
    'opportunity-updated',
    jsonb_build_object(
      'pipelineStage', p_pipeline_stage,
      'assignedOwner', trim(coalesce(p_assigned_owner, '')),
      'nextActionPresent', trim(coalesce(p_next_action, '')) <> '',
      'nextActionDueAt', p_next_action_due_at
    )
  );

  return private.sales_opportunity_json(selected_opportunity);
end;
$$;

create or replace function private.complete_sales_follow_up(p_intake_id text)
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

  update private.pilot_intake_submissions
  set next_action_completed_at = now(),
      updated_at = now(),
      updated_by = (select auth.uid())
  where tenant_id = target_tenant_id
    and intake_id = p_intake_id
    and next_action <> ''
  returning * into selected_opportunity;

  if selected_opportunity.id is null then
    raise exception 'sales-follow-up-not-found';
  end if;

  insert into private.sales_opportunity_audit_events (
    tenant_id, intake_id, actor_user_id, event_type, event_metadata
  )
  values (
    target_tenant_id,
    p_intake_id,
    (select auth.uid()),
    'follow-up-completed',
    jsonb_build_object('completedAt', selected_opportunity.next_action_completed_at)
  );

  return private.sales_opportunity_json(selected_opportunity);
end;
$$;

create or replace function private.record_sales_artifact_download(
  p_intake_id text,
  p_event_type text,
  p_event_metadata jsonb
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

  if p_event_type not in ('crm-export-downloaded', 'follow-up-draft-downloaded') then
    raise exception 'invalid-sales-artifact-event';
  end if;

  if not exists (
    select 1 from private.pilot_intake_submissions
    where tenant_id = target_tenant_id and intake_id = p_intake_id
  ) then
    raise exception 'sales-opportunity-not-found';
  end if;

  if p_event_type = 'crm-export-downloaded' then
    update private.pilot_intake_submissions
    set last_crm_export_at = now(),
        updated_at = now(),
        updated_by = (select auth.uid())
    where tenant_id = target_tenant_id and intake_id = p_intake_id;
  end if;

  insert into private.sales_opportunity_audit_events (
    tenant_id, intake_id, actor_user_id, event_type, event_metadata
  )
  values (
    target_tenant_id,
    p_intake_id,
    (select auth.uid()),
    p_event_type,
    coalesce(p_event_metadata, '{}'::jsonb)
  )
  returning id into created_event_id;

  return created_event_id;
end;
$$;

create or replace function private.schedule_sales_assessment(
  p_intake_id text,
  p_start_at timestamptz,
  p_duration_minutes integer,
  p_meeting_url text
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

  if p_start_at <= now() - interval '5 minutes'
    or p_duration_minutes not between 15 and 240
    or char_length(trim(coalesce(p_meeting_url, ''))) > 500
    or (trim(coalesce(p_meeting_url, '')) <> '' and trim(p_meeting_url) !~* '^https://') then
    raise exception 'invalid-assessment-schedule';
  end if;

  update private.pilot_intake_submissions
  set assessment_start_at = p_start_at,
      assessment_duration_minutes = p_duration_minutes,
      assessment_meeting_url = trim(coalesce(p_meeting_url, '')),
      assessment_status = 'invitation-prepared',
      updated_at = now(),
      updated_by = (select auth.uid())
  where tenant_id = target_tenant_id
    and intake_id = p_intake_id
  returning * into selected_opportunity;

  if selected_opportunity.id is null then
    raise exception 'sales-opportunity-not-found';
  end if;

  insert into private.sales_opportunity_audit_events (
    tenant_id, intake_id, actor_user_id, event_type, event_metadata
  )
  values (
    target_tenant_id,
    p_intake_id,
    (select auth.uid()),
    'assessment-invitation-downloaded',
    jsonb_build_object(
      'startAt', p_start_at,
      'durationMinutes', p_duration_minutes,
      'meetingUrlPresent', trim(coalesce(p_meeting_url, '')) <> '',
      'noPhiBoundary', true
    )
  );

  return private.sales_opportunity_json(selected_opportunity);
end;
$$;

create or replace function public.update_sales_opportunity_v2(
  p_intake_id text,
  p_pipeline_stage text,
  p_assigned_owner text,
  p_next_action text,
  p_next_action_due_at timestamptz
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.update_sales_opportunity_v2(
    p_intake_id, p_pipeline_stage, p_assigned_owner, p_next_action, p_next_action_due_at
  );
$$;

create or replace function public.complete_sales_follow_up(p_intake_id text)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.complete_sales_follow_up(p_intake_id);
$$;

create or replace function public.record_sales_artifact_download(
  p_intake_id text,
  p_event_type text,
  p_event_metadata jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_sales_artifact_download(p_intake_id, p_event_type, p_event_metadata);
$$;

create or replace function public.schedule_sales_assessment(
  p_intake_id text,
  p_start_at timestamptz,
  p_duration_minutes integer,
  p_meeting_url text
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.schedule_sales_assessment(p_intake_id, p_start_at, p_duration_minutes, p_meeting_url);
$$;

revoke all on function private.update_sales_opportunity_v2(text, text, text, text, timestamptz) from public, anon, authenticated;
revoke all on function private.complete_sales_follow_up(text) from public, anon, authenticated;
revoke all on function private.record_sales_artifact_download(text, text, jsonb) from public, anon, authenticated;
revoke all on function private.schedule_sales_assessment(text, timestamptz, integer, text) from public, anon, authenticated;

grant execute on function private.update_sales_opportunity_v2(text, text, text, text, timestamptz) to authenticated;
grant execute on function private.complete_sales_follow_up(text) to authenticated;
grant execute on function private.record_sales_artifact_download(text, text, jsonb) to authenticated;
grant execute on function private.schedule_sales_assessment(text, timestamptz, integer, text) to authenticated;

revoke all on function public.update_sales_opportunity_v2(text, text, text, text, timestamptz) from public, anon, authenticated;
revoke all on function public.complete_sales_follow_up(text) from public, anon, authenticated;
revoke all on function public.record_sales_artifact_download(text, text, jsonb) from public, anon, authenticated;
revoke all on function public.schedule_sales_assessment(text, timestamptz, integer, text) from public, anon, authenticated;

grant execute on function public.update_sales_opportunity_v2(text, text, text, text, timestamptz) to authenticated;
grant execute on function public.complete_sales_follow_up(text) to authenticated;
grant execute on function public.record_sales_artifact_download(text, text, jsonb) to authenticated;
grant execute on function public.schedule_sales_assessment(text, timestamptz, integer, text) to authenticated;

comment on function private.require_sales_tenant_admin() is
  'Requires tenant-admin membership, a verified AAL2 session, a 12-hour maximum session lifetime, and a 2-hour inactivity boundary.';
