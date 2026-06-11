create or replace function private.create_pilot_demo_session(
  p_workspace_slug text,
  p_scenario_slug text,
  p_status text,
  p_boundary text,
  p_evaluation jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  created_session_id uuid;
begin
  if not private.has_valid_governance_session() then
    raise exception 'protected-pilot-aal2-session-required';
  end if;

  perform private.require_sales_server_token();

  select *
  into selected_workspace
  from public.pilot_workspaces
  where slug = p_workspace_slug
    and private.has_pilot_role(tenant_id, array['tenant-admin', 'pilot-lead']);

  if selected_workspace.id is null then
    raise exception 'workspace-not-found-or-role-denied';
  end if;

  if p_status not in ('synthetic-evaluation-created', 'production-request-denied') then
    raise exception 'invalid-session-status';
  end if;

  insert into public.pilot_demo_sessions (
    tenant_id,
    workspace_id,
    scenario_slug,
    status,
    boundary,
    evaluation,
    created_by
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    p_scenario_slug,
    p_status,
    p_boundary,
    p_evaluation,
    (select auth.uid())
  )
  returning id into created_session_id;

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
    created_session_id,
    (select auth.uid()),
    case
      when p_status = 'production-request-denied' then 'production-request-denied'
      else 'synthetic-session-created'
    end,
    jsonb_build_object(
      'scenarioSlug', p_scenario_slug,
      'syntheticOnly', true,
      'assuranceLevel', 'aal2'
    )
  );

  return created_session_id;
end;
$$;

create or replace function private.record_pilot_proof_packet_download(
  p_workspace_slug text,
  p_session_id uuid,
  p_event_metadata jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_session public.pilot_demo_sessions%rowtype;
  created_event_id uuid;
begin
  if not private.has_valid_governance_session() then
    raise exception 'protected-pilot-aal2-session-required';
  end if;

  perform private.require_sales_server_token();

  select *
  into selected_workspace
  from public.pilot_workspaces
  where slug = p_workspace_slug
    and private.has_pilot_role(tenant_id, array['tenant-admin', 'pilot-lead', 'reviewer']);

  if selected_workspace.id is null then
    raise exception 'workspace-not-found-or-membership-denied';
  end if;

  select *
  into selected_session
  from public.pilot_demo_sessions
  where id = p_session_id
    and workspace_id = selected_workspace.id;

  if selected_session.id is null then
    raise exception 'session-not-found';
  end if;

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
    selected_session.id,
    (select auth.uid()),
    'proof-packet-downloaded',
    coalesce(p_event_metadata, '{}'::jsonb) || jsonb_build_object(
      'syntheticOnly', true,
      'assuranceLevel', 'aal2'
    )
  )
  returning id into created_event_id;

  return created_event_id;
end;
$$;

comment on function private.create_pilot_demo_session(text, text, text, text, jsonb) is
  'Creates governed synthetic pilot evidence only after a fresh AAL2 session, authorized tenant role, and server-held runtime authorization.';
comment on function private.record_pilot_proof_packet_download(text, uuid, jsonb) is
  'Records proof packet release only after a fresh AAL2 session, authorized tenant role, and server-held runtime authorization.';
