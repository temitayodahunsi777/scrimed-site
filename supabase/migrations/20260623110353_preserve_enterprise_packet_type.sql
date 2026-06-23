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
  requested_packet_type text;
  normalized_packet_type text := 'enterprise-proof-packet';
  allowed_packet_types constant text[] := array[
    'enterprise-proof-packet',
    'protected-buyer-release-control-chain',
    'clinical-activation-dossier',
    'clinical-authority-evidence-room',
    'clinical-authority-owner-matrix',
    'clinical-authority-artifact-intake-checklist',
    'protected-finance-methodology-gates',
    'protected-external-approval-evidence-links',
    'protected-release-decision-claim-registry',
    'protected-named-reviewer-signoffs',
    'protected-distribution-lockbox',
    'protected-release-authority-attestations',
    'protected-evidence-room-recipient-attestations',
    'protected-evidence-room-access-log-reconciliation',
    'protected-evidence-room-provider-adapters',
    'protected-provider-security-reviews',
    'protected-procurement-evidence-registry',
    'protected-authority-artifact-references',
    'clinical-activation-approval-workflow'
  ];
begin
  if (select auth.uid()) is null then
    raise exception 'authentication-required';
  end if;

  if jsonb_typeof(normalized_metadata) <> 'object' then
    raise exception 'invalid-enterprise-proof-packet-metadata';
  end if;

  requested_packet_type := normalized_metadata->>'packetType';

  if requested_packet_type = any(allowed_packet_types) then
    normalized_packet_type := requested_packet_type;
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
    (normalized_metadata - 'packetType') || jsonb_build_object(
      'packetType', normalized_packet_type,
      'format', 'text/markdown',
      'syntheticOnly', true,
      'workspaceSlug', selected_workspace.slug
    )
  )
  returning id into created_event_id;

  return created_event_id;
end;
$$;

comment on function private.record_enterprise_proof_packet_download(text, jsonb) is
  'Records write-before-release enterprise proof packet downloads while preserving known SCRIMED packet types for protected timeline classification. No PHI, autonomous clinical execution, payer submission, patient outreach, medical-record mutation, release approval, or compliance certification is authorized.';
