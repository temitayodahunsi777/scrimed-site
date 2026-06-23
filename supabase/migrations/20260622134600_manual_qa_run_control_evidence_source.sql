alter table public.qa_manual_run_evidence_packets
  drop constraint if exists qa_manual_run_evidence_packets_workflow_run_url_check;

alter table public.qa_manual_run_evidence_packets
  add constraint qa_manual_run_evidence_packets_workflow_run_url_check check (
    workflow_run_url ~ '^https://github\.com/temitayodahunsi777/scrimed-site/actions/runs/[0-9]{6,32}$'
    or workflow_run_url ~ '^https://app\.scrimedsolutions\.com/qa-run-control\?runId=[0-9]{6,32}$'
  );

create or replace function private.record_qa_manual_run_evidence_packet(
  p_workspace_slug text,
  p_packet_input jsonb,
  p_packet_markdown text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  created_packet public.qa_manual_run_evidence_packets%rowtype;
  created_event_id uuid;
  normalized_input jsonb := coalesce(p_packet_input, '{}'::jsonb);
  input_text text := normalized_input::text;
  workflow_run_id_value text;
  workflow_run_url_value text;
  executed_at_value timestamptz;
  base_url_value text;
  intake_id_value text;
  created_session_id_value uuid;
  packet_audit_event_id_value uuid;
  packet_hash text;
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead']
  );

  if jsonb_typeof(normalized_input) <> 'object'
    or pg_column_size(normalized_input) > 32768 then
    raise exception 'qa-manual-evidence-invalid-payload';
  end if;

  if char_length(coalesce(p_packet_markdown, '')) not between 200 and 65536 then
    raise exception 'qa-manual-evidence-invalid-packet';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(normalized_input) as forbidden(key)
    where forbidden.key = any(array[
      'accessToken',
      'access_token',
      'bearerToken',
      'bearer_token',
      'refreshToken',
      'refresh_token',
      'jwt',
      'secret',
      'password',
      'credential',
      'credentials'
    ])
  ) then
    raise exception 'qa-manual-evidence-prohibited-secret-field';
  end if;

  if input_text ~* 'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+'
    or input_text ~* 'sk-[A-Za-z0-9_-]{12,}'
    or input_text ~* 'sbp_[A-Za-z0-9_-]{12,}'
    or input_text ~* 'Bearer[[:space:]]+[A-Za-z0-9._-]+'
    or input_text ~* 'patient[ _-]?(id|identifier|mrn)'
    or input_text ~* 'member[ _-]?(id|identifier)'
    or input_text ~* 'medical record|protected health information|payer member' then
    raise exception 'qa-manual-evidence-prohibited-content';
  end if;

  if p_packet_markdown ~* 'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+'
    or p_packet_markdown ~* 'sk-[A-Za-z0-9_-]{12,}'
    or p_packet_markdown ~* 'sbp_[A-Za-z0-9_-]{12,}'
    or p_packet_markdown ~* 'Bearer[[:space:]]+[A-Za-z0-9._-]+' then
    raise exception 'qa-manual-evidence-packet-secret-like-content';
  end if;

  workflow_run_id_value := trim(coalesce(normalized_input ->> 'workflowRunId', ''));
  workflow_run_url_value := trim(coalesce(normalized_input ->> 'workflowRunUrl', ''));
  base_url_value := trim(coalesce(normalized_input ->> 'baseUrl', ''));
  intake_id_value := trim(coalesce(normalized_input ->> 'intakeId', ''));

  begin
    executed_at_value := (normalized_input ->> 'executedAt')::timestamptz;
    created_session_id_value := (normalized_input ->> 'createdSessionId')::uuid;
    packet_audit_event_id_value := (normalized_input ->> 'packetAuditEventId')::uuid;
  exception when others then
    raise exception 'qa-manual-evidence-invalid-typed-field';
  end;

  if workflow_run_id_value !~ '^[0-9]{6,32}$'
    or not (
      workflow_run_url_value = (
        'https://github.com/temitayodahunsi777/scrimed-site/actions/runs/' || workflow_run_id_value
      )
      or workflow_run_url_value = (
        'https://app.scrimedsolutions.com/qa-run-control?runId=' || workflow_run_id_value
      )
    )
    or executed_at_value < now() - interval '14 days'
    or executed_at_value > now() + interval '5 minutes'
    or not (
      base_url_value = 'https://app.scrimedsolutions.com'
      or base_url_value ~ '^https://[a-z0-9-]+\.vercel\.app$'
    )
    or intake_id_value !~ '^[A-Za-z0-9][A-Za-z0-9_-]{5,127}$'
    or normalized_input ->> 'qaOutcome' <> 'pass'
    or normalized_input ->> 'operatorAttestation' <> 'no-secrets-no-phi-aal2-human-run'
    or normalized_input ->> 'tokenDisposalAttestation' <> 'temporary-token-deleted-or-rotated'
    or normalized_input ->> 'dataBoundary' <> 'synthetic-business-workflow-only' then
    raise exception 'qa-manual-evidence-validation-failed';
  end if;

  packet_hash := encode(digest(p_packet_markdown, 'sha256'), 'hex');

  insert into public.qa_manual_run_evidence_packets (
    tenant_id,
    workspace_id,
    workflow_run_id,
    workflow_run_url,
    executed_at,
    base_url,
    intake_id,
    created_session_id,
    packet_audit_event_id,
    qa_outcome,
    operator_attestation,
    token_disposal_attestation,
    data_boundary,
    packet_markdown,
    packet_sha256,
    created_by
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    workflow_run_id_value,
    workflow_run_url_value,
    executed_at_value,
    base_url_value,
    intake_id_value,
    created_session_id_value,
    packet_audit_event_id_value,
    'pass',
    normalized_input ->> 'operatorAttestation',
    normalized_input ->> 'tokenDisposalAttestation',
    normalized_input ->> 'dataBoundary',
    p_packet_markdown,
    packet_hash,
    (select auth.uid())
  )
  returning * into created_packet;

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
    null,
    (select auth.uid()),
    'manual-qa-evidence-packet-recorded',
    jsonb_build_object(
      'qaManualRunEvidencePacketId', created_packet.id,
      'workflowRunId', created_packet.workflow_run_id,
      'workflowRunUrl', created_packet.workflow_run_url,
      'intakeId', created_packet.intake_id,
      'createdSessionId', created_packet.created_session_id,
      'packetAuditEventId', created_packet.packet_audit_event_id,
      'packetSha256', created_packet.packet_sha256,
      'assuranceLevel', 'aal2',
      'metadataOnly', true,
      'syntheticOnly', true,
      'noPhi', true,
      'legalSecurityPrivacyBoundary', true
    )
  )
  returning id into created_event_id;

  return jsonb_build_object(
    'packet', private.qa_manual_run_evidence_packet_json(created_packet),
    'auditEventId', created_event_id,
    'persisted', true,
    'boundary', created_packet.boundary
  );
end;
$$;

comment on constraint qa_manual_run_evidence_packets_workflow_run_url_check
  on public.qa_manual_run_evidence_packets is
  'Allows SCRIMED GitHub Actions runs and SCRIMED Run Control local human AAL2 witnesses as no-secret manual QA evidence sources.';

comment on function private.record_qa_manual_run_evidence_packet(text, jsonb, text) is
  'Persists a sanitized manual QA evidence packet after AAL2 tenant governance authorization. Accepted run sources are SCRIMED GitHub Actions or SCRIMED Run Control local human AAL2 witnesses. The packet is synthetic-only and metadata-only for enterprise diligence.';
