alter table private.pilot_access_invitations
  add column if not exists delivery_status text not null default 'record-only'
    check (delivery_status in (
      'record-only',
      'packet-generated',
      'external-delivery-prepared',
      'smtp-ready-blocked'
    )),
  add column if not exists last_packet_generated_at timestamptz,
  add column if not exists last_packet_generated_by uuid references auth.users(id) on delete set null,
  add column if not exists last_delivery_prepared_at timestamptz,
  add column if not exists last_delivery_prepared_by uuid references auth.users(id) on delete set null,
  add column if not exists delivery_attempt_count integer not null default 0
    check (delivery_attempt_count between 0 and 1000),
  add column if not exists delivery_note text not null default ''
    check (char_length(delivery_note) <= 700);

create index if not exists pilot_access_invitations_last_packet_generated_by_idx
  on private.pilot_access_invitations(last_packet_generated_by);
create index if not exists pilot_access_invitations_last_delivery_prepared_by_idx
  on private.pilot_access_invitations(last_delivery_prepared_by);
create index if not exists pilot_access_invitations_delivery_status_idx
  on private.pilot_access_invitations(tenant_id, delivery_status, created_at desc);

alter table public.pilot_tenants
  add column if not exists invitation_delivery_status text not null default 'manual-packet-only'
    check (invitation_delivery_status in (
      'manual-packet-only',
      'smtp-readiness-review',
      'smtp-approved-send-gated'
    )),
  add column if not exists invitation_smtp_provider text not null default ''
    check (char_length(invitation_smtp_provider) <= 120),
  add column if not exists invitation_smtp_from_domain text not null default ''
    check (char_length(invitation_smtp_from_domain) <= 160),
  add column if not exists invitation_delivery_notes text not null default ''
    check (char_length(invitation_delivery_notes) <= 700),
  add column if not exists invitation_delivery_updated_at timestamptz,
  add column if not exists invitation_delivery_updated_by uuid references auth.users(id) on delete set null;

create index if not exists pilot_tenants_invitation_delivery_updated_by_idx
  on public.pilot_tenants(invitation_delivery_updated_by);

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
      'membership-deactivated',
      'membership-reactivated',
      'access-review-attested',
      'sso-readiness-updated'
    )
  );

create or replace function private.tenant_access_dashboard(p_workspace_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_tenant public.pilot_tenants%rowtype;
  memberships jsonb;
  invitations jsonb;
  role_audit_events jsonb;
  lifecycle_events jsonb;
  active_member_count integer;
  inactive_member_count integer;
  pending_invitation_count integer;
  access_review_due_count integer;
  packet_generated_count integer;
  delivery_prepared_count integer;
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
    count(*) filter (where membership.status = 'inactive')::integer,
    count(*) filter (
      where membership.status = 'active'
        and membership.access_review_due_at <= now()
    )::integer
  into active_member_count, inactive_member_count, access_review_due_count
  from public.pilot_memberships membership
  where membership.tenant_id = selected_workspace.tenant_id;

  select
    count(*) filter (
      where invitation.status = 'pending'
        and invitation.expires_at > now()
    )::integer,
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
  into pending_invitation_count, packet_generated_count, delivery_prepared_count
  from private.pilot_access_invitations invitation
  where invitation.tenant_id = selected_workspace.tenant_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'userId', membership.user_id,
        'email', coalesce(member.email, 'approved-identity'),
        'role', membership.role,
        'status', membership.status,
        'createdAt', membership.created_at,
        'updatedAt', membership.updated_at,
        'updatedBy', membership.updated_by,
        'deactivatedAt', membership.deactivated_at,
        'deactivatedBy', membership.deactivated_by,
        'deactivationReason', membership.deactivation_reason,
        'lastAccessReviewedAt', membership.last_access_reviewed_at,
        'lastAccessReviewedBy', membership.last_access_reviewed_by,
        'accessReviewDueAt', membership.access_review_due_at
      )
      order by
        case membership.status when 'active' then 1 else 2 end,
        case membership.role
          when 'tenant-admin' then 1
          when 'pilot-lead' then 2
          when 'reviewer' then 3
          else 4
        end,
        member.email
    ),
    '[]'::jsonb
  )
  into memberships
  from public.pilot_memberships membership
  join auth.users member on member.id = membership.user_id
  where membership.tenant_id = selected_workspace.tenant_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', invitation.id,
        'email', invitation.invited_email,
        'proposedRole', invitation.proposed_role,
        'status', case
          when invitation.status = 'pending' and invitation.expires_at <= now() then 'expired'
          else invitation.status
        end,
        'invitationNote', invitation.invitation_note,
        'invitedBy', invitation.invited_by,
        'activatedBy', invitation.activated_by,
        'activatedUserId', invitation.activated_user_id,
        'activatedAt', invitation.activated_at,
        'cancelledBy', invitation.cancelled_by,
        'cancelledAt', invitation.cancelled_at,
        'cancellationReason', invitation.cancellation_reason,
        'expiresAt', invitation.expires_at,
        'createdAt', invitation.created_at,
        'deliveryStatus', invitation.delivery_status,
        'lastPacketGeneratedAt', invitation.last_packet_generated_at,
        'lastPacketGeneratedBy', invitation.last_packet_generated_by,
        'lastDeliveryPreparedAt', invitation.last_delivery_prepared_at,
        'lastDeliveryPreparedBy', invitation.last_delivery_prepared_by,
        'deliveryAttemptCount', invitation.delivery_attempt_count,
        'deliveryNote', invitation.delivery_note
      )
      order by invitation.created_at desc
    ),
    '[]'::jsonb
  )
  into invitations
  from private.pilot_access_invitations invitation
  where invitation.tenant_id = selected_workspace.tenant_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', audit_event.id,
        'targetUserId', audit_event.target_user_id,
        'actorUserId', audit_event.actor_user_id,
        'eventType', audit_event.event_type,
        'priorRole', audit_event.prior_role,
        'nextRole', audit_event.next_role,
        'createdAt', audit_event.created_at
      )
      order by audit_event.created_at desc
    ),
    '[]'::jsonb
  )
  into role_audit_events
  from (
    select *
    from private.pilot_membership_audit_events
    where tenant_id = selected_workspace.tenant_id
    order by created_at desc
    limit 100
  ) audit_event;

  select coalesce(
    jsonb_agg(private.identity_lifecycle_event_json(lifecycle_event) order by lifecycle_event.created_at desc),
    '[]'::jsonb
  )
  into lifecycle_events
  from (
    select *
    from private.pilot_identity_lifecycle_events
    where tenant_id = selected_workspace.tenant_id
    order by created_at desc
    limit 150
  ) lifecycle_event;

  return jsonb_build_object(
    'tenantId', selected_tenant.id,
    'tenantName', selected_tenant.name,
    'workspaceId', selected_workspace.id,
    'workspaceSlug', selected_workspace.slug,
    'workspaceName', selected_workspace.name,
    'actorUserId', (select auth.uid()),
    'memberships', memberships,
    'invitations', invitations,
    'auditEvents', role_audit_events,
    'lifecycleEvents', lifecycle_events,
    'summary', jsonb_build_object(
      'activeMembers', active_member_count,
      'inactiveMembers', inactive_member_count,
      'pendingInvitations', pending_invitation_count,
      'accessReviewsDue', access_review_due_count,
      'packetGeneratedInvitations', packet_generated_count,
      'deliveryPreparedInvitations', delivery_prepared_count
    ),
    'identityReadiness', jsonb_build_object(
      'providerStatus', selected_tenant.identity_provider_status,
      'ssoProvider', selected_tenant.sso_provider,
      'ssoDomain', selected_tenant.sso_domain,
      'notes', selected_tenant.sso_readiness_notes,
      'updatedAt', selected_tenant.sso_updated_at,
      'updatedBy', selected_tenant.sso_updated_by
    ),
    'deliveryReadiness', jsonb_build_object(
      'status', selected_tenant.invitation_delivery_status,
      'smtpProvider', selected_tenant.invitation_smtp_provider,
      'smtpFromDomain', selected_tenant.invitation_smtp_from_domain,
      'notes', selected_tenant.invitation_delivery_notes,
      'updatedAt', selected_tenant.invitation_delivery_updated_at,
      'updatedBy', selected_tenant.invitation_delivery_updated_by
    ),
    'security', jsonb_build_object(
      'assuranceLevel', 'aal2',
      'finalAdminProtection', true,
      'mutationAuthorization', 'tenant-admin-plus-server-runtime-token',
      'offboardingEnforced', true,
      'directInvitationEmail', false,
      'deliveryMode', 'manual-onboarding-packet-until-approved-smtp-send'
    ),
    'boundary', 'Existing and invited protected-pilot identities only. Invitation records and onboarding packets do not send email or create users. PHI access and live clinical execution remain denied.'
  );
end;
$$;

create or replace function private.record_pilot_invitation_packet_download(
  p_workspace_slug text,
  p_invitation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_tenant public.pilot_tenants%rowtype;
  selected_invitation private.pilot_access_invitations%rowtype;
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

  update private.pilot_access_invitations invitation
  set
    delivery_status = case
      when invitation.delivery_status in ('external-delivery-prepared', 'smtp-ready-blocked')
        then invitation.delivery_status
      else 'packet-generated'
    end,
    last_packet_generated_at = now(),
    last_packet_generated_by = (select auth.uid())
  where invitation.id = p_invitation_id
    and invitation.tenant_id = selected_workspace.tenant_id
    and invitation.status = 'pending'
    and invitation.expires_at > now()
  returning * into selected_invitation;

  if selected_invitation.id is null then
    raise exception 'tenant-access-invitation-not-found';
  end if;

  insert into private.pilot_identity_lifecycle_events (
    tenant_id,
    workspace_id,
    invitation_id,
    actor_user_id,
    event_type,
    event_metadata
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    selected_invitation.id,
    (select auth.uid()),
    'invitation-packet-generated',
    jsonb_build_object(
      'email', selected_invitation.invited_email,
      'role', selected_invitation.proposed_role,
      'deliveryStatus', selected_invitation.delivery_status,
      'directEmailSent', false,
      'syntheticPilotBoundary', true
    )
  );

  return jsonb_build_object(
    'tenantId', selected_tenant.id,
    'tenantName', selected_tenant.name,
    'workspaceId', selected_workspace.id,
    'workspaceSlug', selected_workspace.slug,
    'workspaceName', selected_workspace.name,
    'invitationId', selected_invitation.id,
    'email', selected_invitation.invited_email,
    'proposedRole', selected_invitation.proposed_role,
    'status', selected_invitation.status,
    'expiresAt', selected_invitation.expires_at,
    'createdAt', selected_invitation.created_at,
    'deliveryStatus', selected_invitation.delivery_status,
    'deliveryReadiness', selected_tenant.invitation_delivery_status,
    'smtpProvider', selected_tenant.invitation_smtp_provider,
    'smtpFromDomain', selected_tenant.invitation_smtp_from_domain,
    'portalRoute', '/pilot-workspace/access',
    'boundary', 'Protected pilot onboarding packet only. No PHI, no email send, no user creation, and no live clinical execution.',
    'generatedAt', now()
  );
end;
$$;

create or replace function private.prepare_pilot_invitation_delivery(
  p_workspace_slug text,
  p_invitation_id uuid,
  p_note text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_tenant public.pilot_tenants%rowtype;
  selected_invitation private.pilot_access_invitations%rowtype;
  clean_note text;
  next_delivery_status text;
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

  clean_note := trim(coalesce(p_note, ''));

  if char_length(clean_note) > 700 then
    raise exception 'tenant-access-delivery-note-too-large';
  end if;

  perform private.reject_prohibited_identity_text(clean_note);

  next_delivery_status := case
    when selected_tenant.invitation_delivery_status = 'smtp-approved-send-gated'
      then 'smtp-ready-blocked'
    else 'external-delivery-prepared'
  end;

  update private.pilot_access_invitations invitation
  set
    delivery_status = next_delivery_status,
    last_delivery_prepared_at = now(),
    last_delivery_prepared_by = (select auth.uid()),
    delivery_attempt_count = invitation.delivery_attempt_count + 1,
    delivery_note = clean_note
  where invitation.id = p_invitation_id
    and invitation.tenant_id = selected_workspace.tenant_id
    and invitation.status = 'pending'
    and invitation.expires_at > now()
  returning * into selected_invitation;

  if selected_invitation.id is null then
    raise exception 'tenant-access-invitation-not-found';
  end if;

  insert into private.pilot_identity_lifecycle_events (
    tenant_id,
    workspace_id,
    invitation_id,
    actor_user_id,
    event_type,
    event_metadata
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    selected_invitation.id,
    (select auth.uid()),
    'invitation-delivery-prepared',
    jsonb_build_object(
      'email', selected_invitation.invited_email,
      'role', selected_invitation.proposed_role,
      'deliveryStatus', next_delivery_status,
      'deliveryAttemptCount', selected_invitation.delivery_attempt_count,
      'notePresent', clean_note <> '',
      'directEmailSent', false,
      'syntheticPilotBoundary', true
    )
  );

  return jsonb_build_object(
    'id', selected_invitation.id,
    'email', selected_invitation.invited_email,
    'deliveryStatus', selected_invitation.delivery_status,
    'deliveryAttemptCount', selected_invitation.delivery_attempt_count,
    'lastDeliveryPreparedAt', selected_invitation.last_delivery_prepared_at
  );
end;
$$;

create or replace function private.update_tenant_invitation_delivery_readiness(
  p_workspace_slug text,
  p_delivery_status text,
  p_smtp_provider text,
  p_smtp_from_domain text,
  p_notes text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  clean_status text;
  clean_provider text;
  clean_domain text;
  clean_notes text;
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin']
  );

  clean_status := trim(coalesce(p_delivery_status, ''));
  clean_provider := trim(coalesce(p_smtp_provider, ''));
  clean_domain := lower(trim(coalesce(p_smtp_from_domain, '')));
  clean_notes := trim(coalesce(p_notes, ''));

  if clean_status not in ('manual-packet-only', 'smtp-readiness-review', 'smtp-approved-send-gated')
    or char_length(clean_provider) > 120
    or char_length(clean_domain) > 160
    or char_length(clean_notes) > 700
    or (clean_domain <> '' and clean_domain !~* '^[A-Z0-9.-]+\.[A-Z]{2,}$') then
    raise exception 'tenant-access-invalid-delivery-readiness';
  end if;

  perform private.reject_prohibited_identity_text(concat_ws(' ', clean_provider, clean_domain, clean_notes));

  update public.pilot_tenants
  set
    invitation_delivery_status = clean_status,
    invitation_smtp_provider = clean_provider,
    invitation_smtp_from_domain = clean_domain,
    invitation_delivery_notes = clean_notes,
    invitation_delivery_updated_at = now(),
    invitation_delivery_updated_by = (select auth.uid())
  where id = selected_workspace.tenant_id;

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
    'invitation-delivery-readiness-updated',
    jsonb_build_object(
      'deliveryStatus', clean_status,
      'smtpProviderPresent', clean_provider <> '',
      'smtpFromDomainPresent', clean_domain <> '',
      'notesPresent', clean_notes <> '',
      'directEmailSendEnabled', false,
      'syntheticPilotBoundary', true
    )
  );

  return jsonb_build_object(
    'status', clean_status,
    'smtpProvider', clean_provider,
    'smtpFromDomain', clean_domain,
    'updatedAt', now()
  );
end;
$$;

create or replace function public.record_pilot_invitation_packet_download(
  p_workspace_slug text,
  p_invitation_id uuid
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_pilot_invitation_packet_download(
    p_workspace_slug,
    p_invitation_id
  );
$$;

create or replace function public.prepare_pilot_invitation_delivery(
  p_workspace_slug text,
  p_invitation_id uuid,
  p_note text
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.prepare_pilot_invitation_delivery(
    p_workspace_slug,
    p_invitation_id,
    p_note
  );
$$;

create or replace function public.update_tenant_invitation_delivery_readiness(
  p_workspace_slug text,
  p_delivery_status text,
  p_smtp_provider text,
  p_smtp_from_domain text,
  p_notes text
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.update_tenant_invitation_delivery_readiness(
    p_workspace_slug,
    p_delivery_status,
    p_smtp_provider,
    p_smtp_from_domain,
    p_notes
  );
$$;

revoke all on function private.record_pilot_invitation_packet_download(text, uuid)
  from public, anon, authenticated;
revoke all on function private.prepare_pilot_invitation_delivery(text, uuid, text)
  from public, anon, authenticated;
revoke all on function private.update_tenant_invitation_delivery_readiness(text, text, text, text, text)
  from public, anon, authenticated;

grant execute on function private.record_pilot_invitation_packet_download(text, uuid)
  to authenticated;
grant execute on function private.prepare_pilot_invitation_delivery(text, uuid, text)
  to authenticated;
grant execute on function private.update_tenant_invitation_delivery_readiness(text, text, text, text, text)
  to authenticated;

revoke all on function public.record_pilot_invitation_packet_download(text, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.prepare_pilot_invitation_delivery(text, uuid, text)
  from public, anon, authenticated, service_role;
revoke all on function public.update_tenant_invitation_delivery_readiness(text, text, text, text, text)
  from public, anon, authenticated, service_role;

grant execute on function public.record_pilot_invitation_packet_download(text, uuid)
  to authenticated;
grant execute on function public.prepare_pilot_invitation_delivery(text, uuid, text)
  to authenticated;
grant execute on function public.update_tenant_invitation_delivery_readiness(text, text, text, text, text)
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
    'schemaVersion', '2026-06-14.1',
    'boundary', 'synthetic-pilot-only',
    'tenantIsolation', 'postgres-row-level-security',
    'durableAudit', 'append-only',
    'governanceLedger', 'aal2-append-only',
    'tenantAdministration', 'aal2-governed-role-controls',
    'identityLifecycle', 'governed-invitations-offboarding-access-review-sso-readiness-delivery-packets',
    'invitationDelivery', 'manual-onboarding-packets-smtp-send-gated'
  );
$$;

comment on function private.record_pilot_invitation_packet_download(text, uuid) is
  'Records tenant-admin generation of a protected-pilot onboarding packet. It does not send email, create a user, accept PHI, or enable live clinical execution.';
comment on function private.prepare_pilot_invitation_delivery(text, uuid, text) is
  'Records invitation delivery preparation for external/manual delivery while direct SMTP sending remains gated.';
comment on function private.update_tenant_invitation_delivery_readiness(text, text, text, text, text) is
  'Maintains tenant-level invitation delivery readiness metadata without enabling direct email send.';
