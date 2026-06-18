create table if not exists public.qa_manual_run_evidence_packets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  workflow_run_id text not null check (workflow_run_id ~ '^[0-9]{6,32}$'),
  workflow_run_url text not null check (
    workflow_run_url ~ '^https://github\.com/temitayodahunsi777/scrimed-site/actions/runs/[0-9]{6,32}$'
  ),
  executed_at timestamptz not null,
  base_url text not null check (
    base_url = 'https://app.scrimedsolutions.com'
    or base_url ~ '^https://[a-z0-9-]+\.vercel\.app$'
  ),
  intake_id text not null check (intake_id ~ '^[A-Za-z0-9][A-Za-z0-9_-]{5,127}$'),
  created_session_id uuid not null,
  packet_audit_event_id uuid not null,
  qa_outcome text not null check (qa_outcome = 'pass'),
  operator_attestation text not null check (
    operator_attestation = 'no-secrets-no-phi-aal2-human-run'
  ),
  token_disposal_attestation text not null check (
    token_disposal_attestation = 'temporary-token-deleted-or-rotated'
  ),
  data_boundary text not null check (data_boundary = 'synthetic-business-workflow-only'),
  packet_markdown text not null check (char_length(packet_markdown) between 200 and 65536),
  packet_sha256 text not null check (packet_sha256 ~ '^[0-9a-f]{64}$'),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  boundary text not null default
    'Tenant-scoped manual QA evidence packets store synthetic workflow run metadata and generated proof packets only. They do not store PHI, patient identifiers, payer member identifiers, source contracts, secrets, credentials, legal advice, compliance certification, production authorization, or live healthcare execution approval.',
  unique (workspace_id, workflow_run_id)
);

create index if not exists qa_manual_run_evidence_packets_workspace_created_at_idx
  on public.qa_manual_run_evidence_packets(workspace_id, created_at desc);
create index if not exists qa_manual_run_evidence_packets_tenant_created_at_idx
  on public.qa_manual_run_evidence_packets(tenant_id, created_at desc);
create index if not exists qa_manual_run_evidence_packets_created_by_idx
  on public.qa_manual_run_evidence_packets(created_by);
create index if not exists qa_manual_run_evidence_packets_intake_id_idx
  on public.qa_manual_run_evidence_packets(intake_id);

alter table public.qa_manual_run_evidence_packets enable row level security;

drop policy if exists qa_manual_run_evidence_packets_governance_select
  on public.qa_manual_run_evidence_packets;
create policy qa_manual_run_evidence_packets_governance_select
on public.qa_manual_run_evidence_packets
for select
to authenticated
using (
  (select private.has_valid_governance_session())
  and (select private.is_pilot_member(tenant_id))
);

revoke all on public.qa_manual_run_evidence_packets from anon, authenticated;
grant select on public.qa_manual_run_evidence_packets to authenticated;

create or replace function private.qa_manual_run_evidence_packet_json(
  packet public.qa_manual_run_evidence_packets
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', packet.id,
    'tenantId', packet.tenant_id,
    'workspaceId', packet.workspace_id,
    'workflowRunId', packet.workflow_run_id,
    'workflowRunUrl', packet.workflow_run_url,
    'executedAt', packet.executed_at,
    'baseUrl', packet.base_url,
    'intakeId', packet.intake_id,
    'createdSessionId', packet.created_session_id,
    'packetAuditEventId', packet.packet_audit_event_id,
    'qaOutcome', packet.qa_outcome,
    'operatorAttestation', packet.operator_attestation,
    'tokenDisposalAttestation', packet.token_disposal_attestation,
    'dataBoundary', packet.data_boundary,
    'packetMarkdown', packet.packet_markdown,
    'packetSha256', packet.packet_sha256,
    'createdBy', packet.created_by,
    'createdAt', packet.created_at,
    'boundary', packet.boundary
  );
$$;

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
    or workflow_run_url_value <> (
      'https://github.com/temitayodahunsi777/scrimed-site/actions/runs/' || workflow_run_id_value
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

create or replace function public.record_qa_manual_run_evidence_packet(
  p_workspace_slug text,
  p_packet_input jsonb,
  p_packet_markdown text
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_qa_manual_run_evidence_packet(
    p_workspace_slug,
    p_packet_input,
    p_packet_markdown
  );
$$;

revoke all on function private.qa_manual_run_evidence_packet_json(public.qa_manual_run_evidence_packets)
  from public, anon, authenticated, service_role;
revoke all on function private.record_qa_manual_run_evidence_packet(text, jsonb, text)
  from public, anon, authenticated, service_role;
revoke all on function public.record_qa_manual_run_evidence_packet(text, jsonb, text)
  from public, anon, authenticated, service_role;

grant execute on function private.record_qa_manual_run_evidence_packet(text, jsonb, text)
  to authenticated;
grant execute on function public.record_qa_manual_run_evidence_packet(text, jsonb, text)
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
      'trustos-governance-packet-downloaded',
      'agent-work-order-created',
      'agent-work-order-transitioned',
      'agent-work-order-closed',
      'agent-work-order-proof-packet-downloaded',
      'agent-workspace-governance-ledger-recorded',
      'trust-safety-incident-created',
      'trust-safety-incident-updated',
      'trust-safety-incident-packet-downloaded',
      'enterprise-proof-packet-downloaded',
      'demo-readiness-snapshot-created',
      'demo-readiness-packet-downloaded',
      'buyer-pilot-room-packet-downloaded',
      'opportunity-workspace-provisioned',
      'buyer-tenant-lifecycle-activated',
      'production-readiness-prepared',
      'customer-activation-approvals-recorded',
      'buyer-diligence-room-prepared',
      'secure-evidence-vault-readiness-prepared',
      'sales-demo-session-recorded',
      'sales-demo-session-packet-downloaded',
      'manual-qa-evidence-packet-recorded'
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
    'schemaVersion', '2026-06-18.1',
    'boundary', 'synthetic-pilot-only',
    'tenantIsolation', 'postgres-row-level-security',
    'durableAudit', 'append-only',
    'governanceLedger', 'aal2-append-only',
    'agentWorkspaceWorkOrders', true,
    'agentWorkspaceDashboardFilters', true,
    'agentWorkspaceProofPackets', 'aal2-audited-downloads',
    'agentWorkspaceGovernanceLedger', true,
    'agentWorkspaceIncidentExport', 'write-before-release',
    'tenantTrustSafetyIncidents', 'private-schema-rpc-guarded',
    'tenantTrustSafetyIncidentPackets', 'write-before-release',
    'tenantPasskeyIdentity', 'passkey-or-magic-link',
    'enterpriseProofPackets', 'write-before-release-aggregate-export',
    'pilotDemoReadinessSnapshots', 'aal2-audited-snapshot-packets',
    'buyerPilotRoomPackets', 'aal2-audited-buyer-room-packets',
    'opportunityWorkspaceProvisioning', 'aal2-private-rpc-buyer-workspace-linkage',
    'buyerTenantLifecycleAutomation', 'aal2-private-rpc-sso-access-review-archive-controls',
    'productionActivationReadiness', 'aal2-private-rpc-domain-origin-invitation-access-archive-controls',
    'customerActivationApprovals', 'aal2-private-rpc-paid-pilot-setup-approval-hard-gates-retained',
    'buyerDiligenceRooms', 'aal2-private-rpc-metadata-only-signed-controls-diligence',
    'secureEvidenceVaultReadiness', 'aal2-private-rpc-disabled-by-default-storage-control-readiness',
    'salesBuyerDemoSessions', 'aal2-private-rpc-no-phi-demo-session-history',
    'manualQaEvidencePackets', 'aal2-tenant-scoped-no-secret-evidence-persistence'
  );
$$;

comment on table public.qa_manual_run_evidence_packets is
  'Tenant-scoped durable manual QA evidence packets. RLS select requires an authenticated governance session. Writes require the guarded AAL2 RPC. No PHI, patient identifiers, payer member identifiers, source contracts, secrets, credentials, legal advice, compliance certification, production authorization, or live healthcare execution approval is permitted.';
comment on function private.record_qa_manual_run_evidence_packet(text, jsonb, text) is
  'Persists a sanitized manual Sales Demo Session QA evidence packet after AAL2 tenant governance authorization. The packet is synthetic-only and metadata-only for enterprise diligence.';
