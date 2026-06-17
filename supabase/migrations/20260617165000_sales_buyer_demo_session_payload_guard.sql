create or replace function private.record_sales_buyer_demo_session(
  p_intake_id text,
  p_session_input jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_tenant_id uuid;
  selected_opportunity private.pilot_intake_submissions%rowtype;
  selected_workspace private.sales_opportunity_workspaces%rowtype;
  created_session private.sales_buyer_demo_sessions%rowtype;
  created_sales_event_id uuid;
  demo_boundary text :=
    'Persisted buyer demo sessions capture no-PHI operator notes, synthetic proof-packet selections, buyer questions, blockers, workarounds, next actions, and follow-up plans for SCRIMED governed synthetic pilot sales only. They do not store PHI, patient identifiers, live clinical records, payer member data, diagnosis details, medical-record excerpts, source contracts, secrets, credentials, legal advice, compliance certification, reimbursement determinations, patient outreach approval, autonomous care approval, or live healthcare execution authorization.';
  payload_text text;
  selected_step_ids jsonb;
  selected_packet_routes jsonb;
  buyer_questions jsonb;
  blockers jsonb;
  workarounds jsonb;
  next_actions jsonb;
  follow_up_plan jsonb;
  hard_gates jsonb;
  target_audiences jsonb;
  revenue_path jsonb;
  demo_runbook jsonb;
  path_snapshot jsonb;
  workspace_slug_value text;
  workspace_mapping_mode_value text;
  demo_status_value text;
  path_status_value text;
  readiness_score_value integer;
  deal_room_readiness_score_value integer;
  completed_step_count_value integer;
  executable_step_count_value integer;
begin
  target_tenant_id := private.require_sales_tenant_admin();
  perform private.require_sales_server_token();

  if jsonb_typeof(p_session_input) <> 'object'
    or pg_column_size(p_session_input) > 262144 then
    raise exception 'sales-demo-session-invalid-payload';
  end if;

  payload_text := coalesce(
    jsonb_build_object(
      'operatorNotes', p_session_input -> 'operatorNotes',
      'buyerQuestions', p_session_input -> 'buyerQuestions',
      'nextActions', p_session_input -> 'nextActions',
      'followUpPlan', p_session_input -> 'followUpPlan',
      'selectedStepIds', p_session_input -> 'selectedStepIds',
      'selectedPacketRoutes', p_session_input -> 'selectedPacketRoutes'
    )::text,
    ''
  );

  if payload_text ~*
    '(^|[^a-z])(phi|ephi|mrn|dob)([^a-z]|$)|medical record|patient identifier|member id|diagnosis details?|diagnosed with|date of birth|protected health information|social security|ssn|payer member|clinical note|lab result|radiology report|prescription number' then
    raise exception 'sales-demo-session-prohibited-data';
  end if;

  select *
  into selected_opportunity
  from private.pilot_intake_submissions
  where tenant_id = target_tenant_id
    and intake_id = p_intake_id;

  if selected_opportunity.id is null then
    raise exception 'sales-opportunity-not-found';
  end if;

  if selected_opportunity.pipeline_stage = 'closed-lost' then
    raise exception 'sales-demo-session-closed-lost';
  end if;

  select *
  into selected_workspace
  from private.sales_opportunity_workspaces
  where tenant_id = target_tenant_id
    and intake_id = p_intake_id
  limit 1;

  workspace_slug_value := coalesce(
    selected_workspace.workspace_slug,
    nullif(trim(coalesce(p_session_input ->> 'workspaceSlug', '')), ''),
    'atlas-synthetic-evaluation'
  );

  if workspace_slug_value !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'sales-demo-session-invalid-workspace-slug';
  end if;

  workspace_mapping_mode_value := case
    when selected_workspace.workspace_slug is not null then 'buyer-specific-workspace'
    else coalesce(nullif(p_session_input ->> 'workspaceMappingMode', ''), 'default-synthetic-workspace')
  end;

  if workspace_mapping_mode_value not in ('default-synthetic-workspace', 'buyer-specific-workspace') then
    raise exception 'sales-demo-session-invalid-workspace-mode';
  end if;

  demo_status_value := coalesce(nullif(p_session_input ->> 'demoStatus', ''), 'recorded');
  if demo_status_value not in ('recorded', 'ready-for-follow-up', 'follow-up-needed', 'blocked-review-required') then
    raise exception 'sales-demo-session-invalid-status';
  end if;

  path_status_value := coalesce(nullif(p_session_input ->> 'pathStatus', ''), 'sequenced-blockers-visible');
  if path_status_value not in ('ready-for-authenticated-operator-demo', 'sequenced-blockers-visible', 'manual-review-required') then
    raise exception 'sales-demo-session-invalid-path-status';
  end if;

  if coalesce(p_session_input ->> 'readinessScore', '0') !~ '^[0-9]{1,3}$'
    or coalesce(p_session_input ->> 'dealRoomReadinessScore', '0') !~ '^[0-9]{1,3}$'
    or coalesce(p_session_input ->> 'completedStepCount', '0') !~ '^[0-9]{1,3}$'
    or coalesce(p_session_input ->> 'executableStepCount', '0') !~ '^[0-9]{1,3}$' then
    raise exception 'sales-demo-session-invalid-score';
  end if;

  readiness_score_value := greatest(0, least(100, coalesce(p_session_input ->> 'readinessScore', '0')::integer));
  deal_room_readiness_score_value := greatest(0, least(100, coalesce(p_session_input ->> 'dealRoomReadinessScore', '0')::integer));
  completed_step_count_value := greatest(0, coalesce(p_session_input ->> 'completedStepCount', '0')::integer);
  executable_step_count_value := greatest(0, coalesce(p_session_input ->> 'executableStepCount', '0')::integer);

  selected_step_ids := case
    when jsonb_typeof(p_session_input -> 'selectedStepIds') = 'array' then p_session_input -> 'selectedStepIds'
    else '[]'::jsonb
  end;
  selected_packet_routes := case
    when jsonb_typeof(p_session_input -> 'selectedPacketRoutes') = 'array' then p_session_input -> 'selectedPacketRoutes'
    else '[]'::jsonb
  end;
  buyer_questions := case
    when jsonb_typeof(p_session_input -> 'buyerQuestions') = 'array' then p_session_input -> 'buyerQuestions'
    else '[]'::jsonb
  end;
  blockers := case
    when jsonb_typeof(p_session_input -> 'blockers') = 'array' then p_session_input -> 'blockers'
    else '[]'::jsonb
  end;
  workarounds := case
    when jsonb_typeof(p_session_input -> 'workarounds') = 'array' then p_session_input -> 'workarounds'
    else '[]'::jsonb
  end;
  next_actions := case
    when jsonb_typeof(p_session_input -> 'nextActions') = 'array' then p_session_input -> 'nextActions'
    else '[]'::jsonb
  end;
  follow_up_plan := case
    when jsonb_typeof(p_session_input -> 'followUpPlan') = 'object' then p_session_input -> 'followUpPlan'
    else '{}'::jsonb
  end;
  hard_gates := case
    when jsonb_typeof(p_session_input -> 'hardGates') = 'array' then p_session_input -> 'hardGates'
    else '[]'::jsonb
  end;
  target_audiences := case
    when jsonb_typeof(p_session_input -> 'targetAudiences') = 'array' then p_session_input -> 'targetAudiences'
    else '[]'::jsonb
  end;
  revenue_path := case
    when jsonb_typeof(p_session_input -> 'revenuePath') = 'array' then p_session_input -> 'revenuePath'
    else '[]'::jsonb
  end;
  demo_runbook := case
    when jsonb_typeof(p_session_input -> 'demoRunbook') = 'array' then p_session_input -> 'demoRunbook'
    else '[]'::jsonb
  end;
  path_snapshot := case
    when jsonb_typeof(p_session_input -> 'pathSnapshot') = 'object' then p_session_input -> 'pathSnapshot'
    else '{}'::jsonb
  end;

  insert into private.sales_buyer_demo_sessions (
    tenant_id,
    intake_id,
    workspace_id,
    workspace_slug,
    workspace_mapping_mode,
    demo_status,
    path_status,
    readiness_score,
    deal_room_readiness_score,
    completed_step_count,
    executable_step_count,
    selected_step_ids,
    selected_packet_routes,
    operator_notes,
    buyer_questions,
    blockers,
    workarounds,
    next_actions,
    follow_up_plan,
    hard_gates,
    target_audiences,
    revenue_path,
    demo_runbook,
    path_snapshot,
    created_by,
    updated_by,
    boundary
  )
  values (
    target_tenant_id,
    selected_opportunity.intake_id,
    selected_workspace.workspace_id,
    workspace_slug_value,
    workspace_mapping_mode_value,
    demo_status_value,
    path_status_value,
    readiness_score_value,
    deal_room_readiness_score_value,
    completed_step_count_value,
    executable_step_count_value,
    selected_step_ids,
    selected_packet_routes,
    left(trim(coalesce(p_session_input ->> 'operatorNotes', '')), 3000),
    buyer_questions,
    blockers,
    workarounds,
    next_actions,
    follow_up_plan,
    hard_gates,
    target_audiences,
    revenue_path,
    demo_runbook,
    path_snapshot,
    (select auth.uid()),
    (select auth.uid()),
    demo_boundary
  )
  returning * into created_session;

  insert into private.sales_opportunity_audit_events (
    tenant_id, intake_id, actor_user_id, event_type, event_metadata
  )
  values (
    target_tenant_id,
    selected_opportunity.intake_id,
    (select auth.uid()),
    'sales-demo-session-recorded',
    jsonb_build_object(
      'demoSessionId', created_session.id,
      'workspaceId', created_session.workspace_id,
      'workspaceSlug', created_session.workspace_slug,
      'workspaceMappingMode', created_session.workspace_mapping_mode,
      'pathStatus', created_session.path_status,
      'readinessScore', created_session.readiness_score,
      'selectedStepCount', jsonb_array_length(created_session.selected_step_ids),
      'selectedPacketCount', jsonb_array_length(created_session.selected_packet_routes),
      'noPhiBoundary', true,
      'syntheticOnly', true
    )
  )
  returning id into created_sales_event_id;

  if created_session.workspace_id is not null then
    insert into public.pilot_audit_events (
      tenant_id,
      workspace_id,
      session_id,
      actor_user_id,
      event_type,
      event_metadata
    )
    values (
      target_tenant_id,
      created_session.workspace_id,
      null,
      (select auth.uid()),
      'sales-demo-session-recorded',
      jsonb_build_object(
        'intakeId', selected_opportunity.intake_id,
        'demoSessionId', created_session.id,
        'salesAuditEventId', created_sales_event_id,
        'assuranceLevel', 'aal2',
        'metadataOnly', true,
        'syntheticOnly', true
      )
    );
  end if;

  return jsonb_build_object(
    'buyerDemoSession', private.sales_buyer_demo_session_json(created_session),
    'created', true,
    'auditEventId', created_sales_event_id,
    'boundary', demo_boundary
  );
end;
$$;

comment on function private.record_sales_buyer_demo_session(text, jsonb) is
  'Records an authenticated no-PHI buyer demo session and scans only operator-entered session fields for prohibited regulated data so generated SCRIMED safety-boundary text does not create false positives.';
