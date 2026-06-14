do $$
declare
  event_type_constraint text;
begin
  select constraint_record.conname
  into event_type_constraint
  from pg_constraint constraint_record
  where constraint_record.conrelid = 'private.pilot_identity_lifecycle_events'::regclass
    and constraint_record.contype = 'c'
    and pg_get_constraintdef(constraint_record.oid) like '%event_type%'
  limit 1;

  if event_type_constraint is not null then
    execute format(
      'alter table private.pilot_identity_lifecycle_events drop constraint %I',
      event_type_constraint
    );
  end if;
end;
$$;

alter table private.pilot_identity_lifecycle_events
  add constraint pilot_identity_lifecycle_events_event_type_check
  check (
    event_type in (
      'invitation-created',
      'invitation-cancelled',
      'invitation-activated',
      'invitation-packet-generated',
      'invitation-delivery-prepared',
      'invitation-delivery-readiness-updated',
      'activation-proof-packet-downloaded',
      'membership-deactivated',
      'membership-reactivated',
      'access-review-attested',
      'sso-readiness-updated'
    )
  );

create or replace function private.record_tenant_activation_proof_packet_download(
  p_workspace_slug text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_tenant public.pilot_tenants%rowtype;
  inserted_event private.pilot_identity_lifecycle_events%rowtype;
  active_member_count integer;
  inactive_member_count integer;
  pending_invitation_count integer;
  activated_invitation_count integer;
  packet_generated_count integer;
  delivery_prepared_count integer;
  generated_at timestamptz;
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin']
  );

  select *
  into selected_tenant
  from public.pilot_tenants
  where id = selected_workspace.tenant_id;

  select
    count(*) filter (where membership.status = 'active')::integer,
    count(*) filter (where membership.status = 'inactive')::integer
  into active_member_count, inactive_member_count
  from public.pilot_memberships membership
  where membership.tenant_id = selected_workspace.tenant_id;

  select
    count(*) filter (
      where invitation.status = 'pending'
        and invitation.expires_at > now()
    )::integer,
    count(*) filter (where invitation.status = 'activated')::integer,
    count(*) filter (
      where invitation.delivery_status in (
        'packet-generated',
        'external-delivery-prepared',
        'smtp-ready-blocked'
      )
    )::integer,
    count(*) filter (
      where invitation.delivery_status in (
        'external-delivery-prepared',
        'smtp-ready-blocked'
      )
    )::integer
  into
    pending_invitation_count,
    activated_invitation_count,
    packet_generated_count,
    delivery_prepared_count
  from private.pilot_access_invitations invitation
  where invitation.tenant_id = selected_workspace.tenant_id;

  generated_at := now();

  insert into private.pilot_identity_lifecycle_events (
    tenant_id,
    workspace_id,
    actor_user_id,
    event_type,
    event_metadata
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    (select auth.uid()),
    'activation-proof-packet-downloaded',
    jsonb_build_object(
      'workspaceSlug', selected_workspace.slug,
      'activeMembers', active_member_count,
      'inactiveMembers', inactive_member_count,
      'pendingInvitations', pending_invitation_count,
      'activatedInvitations', activated_invitation_count,
      'packetGeneratedInvitations', packet_generated_count,
      'deliveryPreparedInvitations', delivery_prepared_count,
      'identityProviderStatus', selected_tenant.identity_provider_status,
      'deliveryReadinessStatus', selected_tenant.invitation_delivery_status,
      'directEmailSent', false,
      'syntheticPilotBoundary', true
    )
  )
  returning * into inserted_event;

  return jsonb_build_object(
    'generatedAt', generated_at,
    'lifecycleEventId', inserted_event.id,
    'tenantId', selected_tenant.id,
    'tenantName', selected_tenant.name,
    'workspaceId', selected_workspace.id,
    'workspaceSlug', selected_workspace.slug,
    'workspaceName', selected_workspace.name,
    'actorUserId', (select auth.uid()),
    'activationRunbook', jsonb_build_array(
      jsonb_build_object(
        'step', 'Create controlled invitation record',
        'evidence', 'Tenant-admin records a metadata-only invitation without creating a user or sending email.'
      ),
      jsonb_build_object(
        'step', 'Download onboarding packet',
        'evidence', 'Packet download is audited and bounded to synthetic protected-pilot onboarding.'
      ),
      jsonb_build_object(
        'step', 'Prepare external delivery',
        'evidence', 'Manual or enterprise delivery preparation is recorded while direct SMTP send remains gated.'
      ),
      jsonb_build_object(
        'step', 'Activate enrolled user',
        'evidence', 'Activation requires the invited email to complete SCRIMED pilot authentication enrollment first.'
      ),
      jsonb_build_object(
        'step', 'Generate enterprise proof',
        'evidence', 'Tenant-admin exports this packet to summarize memberships, invitations, identity readiness, and lifecycle audit evidence.'
      )
    ),
    'dashboard', private.tenant_access_dashboard(p_workspace_slug),
    'boundary', 'Tenant activation proof packet only. No PHI, no user creation, no email send, and no live clinical execution.'
  );
end;
$$;

create or replace function public.record_tenant_activation_proof_packet_download(
  p_workspace_slug text
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_tenant_activation_proof_packet_download(
    p_workspace_slug
  );
$$;

revoke all on function private.record_tenant_activation_proof_packet_download(text)
  from public, anon, authenticated;
grant execute on function private.record_tenant_activation_proof_packet_download(text)
  to authenticated;

revoke all on function public.record_tenant_activation_proof_packet_download(text)
  from public, anon, authenticated, service_role;
grant execute on function public.record_tenant_activation_proof_packet_download(text)
  to authenticated;

create or replace function public.protected_pilot_runtime_status()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'ready', true,
    'schemaVersion', '2026-06-14.2',
    'boundary', 'synthetic-pilot-only',
    'tenantIsolation', 'postgres-row-level-security',
    'durableAudit', 'append-only',
    'governanceLedger', 'aal2-append-only',
    'tenantAdministration', 'aal2-governed-role-controls',
    'identityLifecycle', 'governed-invitations-offboarding-access-review-sso-readiness-delivery-and-activation-proof',
    'invitationDelivery', 'manual-onboarding-packets-smtp-send-gated',
    'activationProofPackets', 'tenant-admin-audited-downloads'
  );
$$;

comment on function private.record_tenant_activation_proof_packet_download(text) is
  'Records and returns a tenant-admin activation proof packet for protected-pilot identity lifecycle evidence. It does not send email, create users, accept PHI, or enable live clinical execution.';
