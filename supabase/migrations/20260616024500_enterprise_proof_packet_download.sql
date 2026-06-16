-- Add a tenant-admin audited aggregate enterprise proof packet download.
create or replace function private.record_enterprise_proof_packet_download(
  p_workspace_slug text,
  p_event_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  created_event_id uuid;
  normalized_metadata jsonb := coalesce(p_event_metadata, '{}'::jsonb);
begin
  if (select auth.uid()) is null then
    raise exception 'authentication-required';
  end if;

  if jsonb_typeof(normalized_metadata) <> 'object' then
    raise exception 'invalid-enterprise-proof-packet-metadata';
  end if;

  select *
  into selected_workspace
  from public.pilot_workspaces
  where slug = p_workspace_slug
    and private.has_pilot_role(tenant_id, array['tenant-admin', 'pilot-lead']);

  if selected_workspace.id is null then
    raise exception 'workspace-not-found-or-role-denied';
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
    null,
    (select auth.uid()),
    'enterprise-proof-packet-downloaded',
    normalized_metadata || jsonb_build_object(
      'packetType', 'enterprise-proof-packet',
      'format', 'text/markdown',
      'syntheticOnly', true,
      'workspaceSlug', selected_workspace.slug
    )
  )
  returning id into created_event_id;

  return created_event_id;
end;
$$;

create or replace function public.record_enterprise_proof_packet_download(
  p_workspace_slug text,
  p_event_metadata jsonb default '{}'::jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_enterprise_proof_packet_download(
    p_workspace_slug,
    p_event_metadata
  );
$$;

revoke all on function private.record_enterprise_proof_packet_download(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.record_enterprise_proof_packet_download(text, jsonb)
  from public, anon, authenticated, service_role;

grant execute on function private.record_enterprise_proof_packet_download(text, jsonb)
  to authenticated;
grant execute on function public.record_enterprise_proof_packet_download(text, jsonb)
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
      'enterprise-proof-packet-downloaded'
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
    'schemaVersion', '2026-06-16.2',
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
    'enterpriseProofPackets', 'write-before-release-aggregate-export'
  );
$$;

comment on function private.record_enterprise_proof_packet_download(text, jsonb) is
  'Records write-before-release enterprise proof packet downloads for tenant-scoped synthetic-pilot diligence. No PHI, autonomous clinical execution, payer submission, patient outreach, medical-record mutation, or compliance certification is authorized.';
