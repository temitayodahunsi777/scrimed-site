alter table public.pilot_memberships
  add column if not exists status text not null default 'active'
    check (status in ('active', 'inactive')),
  add column if not exists deactivated_at timestamptz,
  add column if not exists deactivated_by uuid references auth.users(id) on delete set null,
  add column if not exists deactivation_reason text not null default ''
    check (char_length(deactivation_reason) <= 500),
  add column if not exists last_access_reviewed_at timestamptz,
  add column if not exists last_access_reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists access_review_due_at timestamptz not null default (now() + interval '90 days');

create index if not exists pilot_memberships_tenant_status_role_idx
  on public.pilot_memberships(tenant_id, status, role);
create index if not exists pilot_memberships_deactivated_by_idx
  on public.pilot_memberships(deactivated_by);
create index if not exists pilot_memberships_last_access_reviewed_by_idx
  on public.pilot_memberships(last_access_reviewed_by);
create index if not exists pilot_memberships_access_review_due_idx
  on public.pilot_memberships(tenant_id, access_review_due_at)
  where status = 'active';

alter table public.pilot_tenants
  add column if not exists identity_provider_status text not null default 'passwordless-magic-link'
    check (identity_provider_status in (
      'passwordless-magic-link',
      'sso-readiness',
      'sso-configured'
    )),
  add column if not exists sso_provider text not null default ''
    check (char_length(sso_provider) <= 120),
  add column if not exists sso_domain text not null default ''
    check (char_length(sso_domain) <= 160),
  add column if not exists sso_readiness_notes text not null default ''
    check (char_length(sso_readiness_notes) <= 700),
  add column if not exists sso_updated_at timestamptz,
  add column if not exists sso_updated_by uuid references auth.users(id) on delete set null;

create index if not exists pilot_tenants_sso_updated_by_idx
  on public.pilot_tenants(sso_updated_by);

create table if not exists private.pilot_access_invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  invited_email text not null check (
    char_length(invited_email) between 6 and 254
    and invited_email = lower(invited_email)
    and invited_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  ),
  proposed_role text not null check (proposed_role in ('tenant-admin', 'pilot-lead', 'reviewer', 'observer')),
  status text not null default 'pending'
    check (status in ('pending', 'cancelled', 'activated', 'expired')),
  invitation_note text not null default '' check (char_length(invitation_note) <= 700),
  invited_by uuid not null references auth.users(id) on delete restrict,
  activated_by uuid references auth.users(id) on delete set null,
  activated_user_id uuid references auth.users(id) on delete set null,
  activated_at timestamptz,
  cancelled_by uuid references auth.users(id) on delete set null,
  cancelled_at timestamptz,
  cancellation_reason text not null default '' check (char_length(cancellation_reason) <= 500),
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

create unique index if not exists pilot_access_invitations_pending_email_idx
  on private.pilot_access_invitations(tenant_id, invited_email)
  where status = 'pending';
create index if not exists pilot_access_invitations_tenant_status_created_idx
  on private.pilot_access_invitations(tenant_id, status, created_at desc);
create index if not exists pilot_access_invitations_workspace_id_idx
  on private.pilot_access_invitations(workspace_id);
create index if not exists pilot_access_invitations_invited_by_idx
  on private.pilot_access_invitations(invited_by);
create index if not exists pilot_access_invitations_activated_by_idx
  on private.pilot_access_invitations(activated_by);
create index if not exists pilot_access_invitations_activated_user_id_idx
  on private.pilot_access_invitations(activated_user_id);
create index if not exists pilot_access_invitations_cancelled_by_idx
  on private.pilot_access_invitations(cancelled_by);

alter table private.pilot_access_invitations enable row level security;
revoke all on private.pilot_access_invitations from public, anon, authenticated;

drop policy if exists pilot_access_invitations_deny_all
  on private.pilot_access_invitations;
create policy pilot_access_invitations_deny_all
on private.pilot_access_invitations
as restrictive
for all
to public
using (false)
with check (false);

create table if not exists private.pilot_identity_lifecycle_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  target_user_id uuid references auth.users(id) on delete set null,
  invitation_id uuid references private.pilot_access_invitations(id) on delete set null,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  event_type text not null check (
    event_type in (
      'invitation-created',
      'invitation-cancelled',
      'invitation-activated',
      'membership-deactivated',
      'membership-reactivated',
      'access-review-attested',
      'sso-readiness-updated'
    )
  ),
  event_metadata jsonb not null default '{}'::jsonb check (
    jsonb_typeof(event_metadata) = 'object'
    and pg_column_size(event_metadata) <= 32768
  ),
  created_at timestamptz not null default now()
);

create index if not exists pilot_identity_lifecycle_events_tenant_created_idx
  on private.pilot_identity_lifecycle_events(tenant_id, created_at desc);
create index if not exists pilot_identity_lifecycle_events_workspace_id_idx
  on private.pilot_identity_lifecycle_events(workspace_id);
create index if not exists pilot_identity_lifecycle_events_target_user_id_idx
  on private.pilot_identity_lifecycle_events(target_user_id);
create index if not exists pilot_identity_lifecycle_events_invitation_id_idx
  on private.pilot_identity_lifecycle_events(invitation_id);
create index if not exists pilot_identity_lifecycle_events_actor_user_id_idx
  on private.pilot_identity_lifecycle_events(actor_user_id);

alter table private.pilot_identity_lifecycle_events enable row level security;
revoke all on private.pilot_identity_lifecycle_events from public, anon, authenticated;

drop policy if exists pilot_identity_lifecycle_events_deny_all
  on private.pilot_identity_lifecycle_events;
create policy pilot_identity_lifecycle_events_deny_all
on private.pilot_identity_lifecycle_events
as restrictive
for all
to public
using (false)
with check (false);

create or replace function private.is_pilot_member(target_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.pilot_memberships membership
    where membership.tenant_id = target_tenant_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
  );
$$;

create or replace function private.has_pilot_role(target_tenant_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.pilot_memberships membership
    where membership.tenant_id = target_tenant_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and membership.role = any(allowed_roles)
  );
$$;

create or replace function private.reject_prohibited_identity_text(p_value text)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if coalesce(p_value, '') ~*
    '(^|[^a-z])(phi|mrn|dob|ssn)([^a-z]|$)|medical record|patient identifier|member id|diagnos(is|ed)|date of birth|protected health information' then
    raise exception 'prohibited-identity-lifecycle-data';
  end if;
end;
$$;

create or replace function private.identity_lifecycle_event_json(
  lifecycle_event private.pilot_identity_lifecycle_events
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', lifecycle_event.id,
    'targetUserId', lifecycle_event.target_user_id,
    'invitationId', lifecycle_event.invitation_id,
    'actorUserId', lifecycle_event.actor_user_id,
    'eventType', lifecycle_event.event_type,
    'eventMetadata', lifecycle_event.event_metadata,
    'createdAt', lifecycle_event.created_at
  );
$$;

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

  select count(*)::integer
  into pending_invitation_count
  from private.pilot_access_invitations invitation
  where invitation.tenant_id = selected_workspace.tenant_id
    and invitation.status = 'pending'
    and invitation.expires_at > now();

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
        'createdAt', invitation.created_at
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
      'accessReviewsDue', access_review_due_count
    ),
    'identityReadiness', jsonb_build_object(
      'providerStatus', selected_tenant.identity_provider_status,
      'ssoProvider', selected_tenant.sso_provider,
      'ssoDomain', selected_tenant.sso_domain,
      'notes', selected_tenant.sso_readiness_notes,
      'updatedAt', selected_tenant.sso_updated_at,
      'updatedBy', selected_tenant.sso_updated_by
    ),
    'security', jsonb_build_object(
      'assuranceLevel', 'aal2',
      'finalAdminProtection', true,
      'mutationAuthorization', 'tenant-admin-plus-server-runtime-token',
      'offboardingEnforced', true,
      'directInvitationEmail', false
    ),
    'boundary', 'Existing and invited protected-pilot identities only. Invitation records do not send email or create users. PHI access and live clinical execution remain denied.'
  );
end;
$$;

create or replace function private.create_pilot_access_invitation(
  p_workspace_slug text,
  p_email text,
  p_role text,
  p_expires_at timestamptz,
  p_note text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  normalized_email text;
  created_invitation private.pilot_access_invitations%rowtype;
  clean_note text;
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin']
  );

  normalized_email := lower(trim(coalesce(p_email, '')));
  clean_note := trim(coalesce(p_note, ''));

  if char_length(normalized_email) not between 6 and 254
    or normalized_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    or p_role not in ('tenant-admin', 'pilot-lead', 'reviewer', 'observer')
    or char_length(clean_note) > 700 then
    raise exception 'tenant-access-invalid-invitation';
  end if;

  perform private.reject_prohibited_identity_text(clean_note);

  if exists (
    select 1
    from public.pilot_memberships membership
    join auth.users member on member.id = membership.user_id
    where membership.tenant_id = selected_workspace.tenant_id
      and lower(member.email) = normalized_email
      and membership.status = 'active'
  ) then
    raise exception 'tenant-access-membership-already-active';
  end if;

  if exists (
    select 1
    from private.pilot_access_invitations invitation
    where invitation.tenant_id = selected_workspace.tenant_id
      and invitation.invited_email = normalized_email
      and invitation.status = 'pending'
  ) then
    raise exception 'tenant-access-pending-invitation-exists';
  end if;

  if p_expires_at is null
    or p_expires_at < now() + interval '1 day'
    or p_expires_at > now() + interval '90 days' then
    p_expires_at := now() + interval '14 days';
  end if;

  insert into private.pilot_access_invitations (
    tenant_id,
    workspace_id,
    invited_email,
    proposed_role,
    invitation_note,
    invited_by,
    expires_at
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    normalized_email,
    p_role,
    clean_note,
    (select auth.uid()),
    p_expires_at
  )
  returning * into created_invitation;

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
    created_invitation.id,
    (select auth.uid()),
    'invitation-created',
    jsonb_build_object(
      'email', normalized_email,
      'proposedRole', p_role,
      'expiresAt', p_expires_at,
      'emailSent', false,
      'syntheticPilotBoundary', true
    )
  );

  return jsonb_build_object(
    'id', created_invitation.id,
    'email', created_invitation.invited_email,
    'proposedRole', created_invitation.proposed_role,
    'status', created_invitation.status,
    'createdAt', created_invitation.created_at,
    'expiresAt', created_invitation.expires_at
  );
end;
$$;

create or replace function private.cancel_pilot_access_invitation(
  p_workspace_slug text,
  p_invitation_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_invitation private.pilot_access_invitations%rowtype;
  clean_reason text;
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin']
  );

  clean_reason := trim(coalesce(p_reason, ''));

  if char_length(clean_reason) > 500 then
    raise exception 'tenant-access-cancellation-reason-too-large';
  end if;

  perform private.reject_prohibited_identity_text(clean_reason);

  update private.pilot_access_invitations invitation
  set
    status = 'cancelled',
    cancelled_by = (select auth.uid()),
    cancelled_at = now(),
    cancellation_reason = clean_reason
  where invitation.id = p_invitation_id
    and invitation.tenant_id = selected_workspace.tenant_id
    and invitation.status = 'pending'
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
    'invitation-cancelled',
    jsonb_build_object(
      'email', selected_invitation.invited_email,
      'reasonPresent', clean_reason <> '',
      'syntheticPilotBoundary', true
    )
  );

  return jsonb_build_object(
    'id', selected_invitation.id,
    'status', selected_invitation.status,
    'cancelledAt', selected_invitation.cancelled_at
  );
end;
$$;

create or replace function private.activate_pilot_invitation_for_existing_user(
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
  selected_invitation private.pilot_access_invitations%rowtype;
  selected_user auth.users%rowtype;
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin']
  );

  select *
  into selected_invitation
  from private.pilot_access_invitations invitation
  where invitation.id = p_invitation_id
    and invitation.tenant_id = selected_workspace.tenant_id
    and invitation.status = 'pending'
    and invitation.expires_at > now();

  if selected_invitation.id is null then
    raise exception 'tenant-access-invitation-not-found';
  end if;

  select *
  into selected_user
  from auth.users member
  where lower(member.email) = selected_invitation.invited_email
  order by member.created_at asc
  limit 1;

  if selected_user.id is null then
    raise exception 'tenant-access-invited-user-not-found';
  end if;

  insert into public.pilot_memberships (
    tenant_id,
    user_id,
    role,
    status,
    updated_at,
    updated_by,
    access_review_due_at
  )
  values (
    selected_workspace.tenant_id,
    selected_user.id,
    selected_invitation.proposed_role,
    'active',
    now(),
    (select auth.uid()),
    now() + interval '90 days'
  )
  on conflict (tenant_id, user_id) do update
  set
    role = excluded.role,
    status = 'active',
    updated_at = now(),
    updated_by = (select auth.uid()),
    deactivated_at = null,
    deactivated_by = null,
    deactivation_reason = '',
    access_review_due_at = now() + interval '90 days';

  update private.pilot_access_invitations
  set
    status = 'activated',
    activated_by = (select auth.uid()),
    activated_user_id = selected_user.id,
    activated_at = now()
  where id = selected_invitation.id;

  insert into private.pilot_identity_lifecycle_events (
    tenant_id,
    workspace_id,
    target_user_id,
    invitation_id,
    actor_user_id,
    event_type,
    event_metadata
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    selected_user.id,
    selected_invitation.id,
    (select auth.uid()),
    'invitation-activated',
    jsonb_build_object(
      'email', selected_invitation.invited_email,
      'role', selected_invitation.proposed_role,
      'existingAuthUserOnly', true,
      'syntheticPilotBoundary', true
    )
  );

  return jsonb_build_object(
    'userId', selected_user.id,
    'email', selected_invitation.invited_email,
    'role', selected_invitation.proposed_role,
    'status', 'active'
  );
end;
$$;

create or replace function private.deactivate_pilot_membership(
  p_workspace_slug text,
  p_target_user_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_membership public.pilot_memberships%rowtype;
  active_admin_count integer;
  clean_reason text;
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin']
  );

  clean_reason := trim(coalesce(p_reason, ''));

  if char_length(clean_reason) > 500 then
    raise exception 'tenant-access-deactivation-reason-too-large';
  end if;

  perform private.reject_prohibited_identity_text(clean_reason);

  select *
  into selected_membership
  from public.pilot_memberships
  where tenant_id = selected_workspace.tenant_id
    and user_id = p_target_user_id
  for update;

  if selected_membership.user_id is null then
    raise exception 'tenant-access-membership-not-found';
  end if;

  if selected_membership.role = 'tenant-admin' and selected_membership.status = 'active' then
    select count(*)::integer
    into active_admin_count
    from public.pilot_memberships
    where tenant_id = selected_workspace.tenant_id
      and role = 'tenant-admin'
      and status = 'active';

    if active_admin_count <= 1 then
      raise exception 'tenant-access-final-admin-protected';
    end if;
  end if;

  update public.pilot_memberships
  set
    status = 'inactive',
    updated_at = now(),
    updated_by = (select auth.uid()),
    deactivated_at = now(),
    deactivated_by = (select auth.uid()),
    deactivation_reason = clean_reason
  where tenant_id = selected_workspace.tenant_id
    and user_id = selected_membership.user_id;

  insert into private.pilot_identity_lifecycle_events (
    tenant_id,
    workspace_id,
    target_user_id,
    actor_user_id,
    event_type,
    event_metadata
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    selected_membership.user_id,
    (select auth.uid()),
    'membership-deactivated',
    jsonb_build_object(
      'role', selected_membership.role,
      'reasonPresent', clean_reason <> '',
      'syntheticPilotBoundary', true
    )
  );

  return jsonb_build_object(
    'userId', selected_membership.user_id,
    'status', 'inactive'
  );
end;
$$;

create or replace function private.reactivate_pilot_membership(
  p_workspace_slug text,
  p_target_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_membership public.pilot_memberships%rowtype;
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin']
  );

  select *
  into selected_membership
  from public.pilot_memberships
  where tenant_id = selected_workspace.tenant_id
    and user_id = p_target_user_id
  for update;

  if selected_membership.user_id is null then
    raise exception 'tenant-access-membership-not-found';
  end if;

  update public.pilot_memberships
  set
    status = 'active',
    updated_at = now(),
    updated_by = (select auth.uid()),
    deactivated_at = null,
    deactivated_by = null,
    deactivation_reason = '',
    access_review_due_at = now() + interval '90 days'
  where tenant_id = selected_workspace.tenant_id
    and user_id = selected_membership.user_id;

  insert into private.pilot_identity_lifecycle_events (
    tenant_id,
    workspace_id,
    target_user_id,
    actor_user_id,
    event_type,
    event_metadata
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    selected_membership.user_id,
    (select auth.uid()),
    'membership-reactivated',
    jsonb_build_object(
      'role', selected_membership.role,
      'accessReviewDueAt', now() + interval '90 days',
      'syntheticPilotBoundary', true
    )
  );

  return jsonb_build_object(
    'userId', selected_membership.user_id,
    'status', 'active'
  );
end;
$$;

create or replace function private.attest_pilot_access_review(
  p_workspace_slug text,
  p_notes text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  active_member_count integer;
  clean_notes text;
  next_due_at timestamptz;
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin']
  );

  clean_notes := trim(coalesce(p_notes, ''));

  if char_length(clean_notes) > 700 then
    raise exception 'tenant-access-review-notes-too-large';
  end if;

  perform private.reject_prohibited_identity_text(clean_notes);

  next_due_at := now() + interval '90 days';

  update public.pilot_memberships
  set
    last_access_reviewed_at = now(),
    last_access_reviewed_by = (select auth.uid()),
    access_review_due_at = next_due_at,
    updated_at = now(),
    updated_by = (select auth.uid())
  where tenant_id = selected_workspace.tenant_id
    and status = 'active';

  get diagnostics active_member_count = row_count;

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
    'access-review-attested',
    jsonb_build_object(
      'activeMembersReviewed', active_member_count,
      'nextDueAt', next_due_at,
      'notesPresent', clean_notes <> '',
      'syntheticPilotBoundary', true
    )
  );

  return jsonb_build_object(
    'activeMembersReviewed', active_member_count,
    'nextDueAt', next_due_at
  );
end;
$$;

create or replace function private.update_tenant_identity_readiness(
  p_workspace_slug text,
  p_identity_provider_status text,
  p_sso_provider text,
  p_sso_domain text,
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

  clean_status := trim(coalesce(p_identity_provider_status, ''));
  clean_provider := trim(coalesce(p_sso_provider, ''));
  clean_domain := lower(trim(coalesce(p_sso_domain, '')));
  clean_notes := trim(coalesce(p_notes, ''));

  if clean_status not in ('passwordless-magic-link', 'sso-readiness', 'sso-configured')
    or char_length(clean_provider) > 120
    or char_length(clean_domain) > 160
    or char_length(clean_notes) > 700
    or (clean_domain <> '' and clean_domain !~* '^[A-Z0-9.-]+\.[A-Z]{2,}$') then
    raise exception 'tenant-access-invalid-identity-readiness';
  end if;

  perform private.reject_prohibited_identity_text(concat_ws(' ', clean_provider, clean_domain, clean_notes));

  update public.pilot_tenants
  set
    identity_provider_status = clean_status,
    sso_provider = clean_provider,
    sso_domain = clean_domain,
    sso_readiness_notes = clean_notes,
    sso_updated_at = now(),
    sso_updated_by = (select auth.uid())
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
    'sso-readiness-updated',
    jsonb_build_object(
      'providerStatus', clean_status,
      'ssoProviderPresent', clean_provider <> '',
      'ssoDomainPresent', clean_domain <> '',
      'notesPresent', clean_notes <> '',
      'syntheticPilotBoundary', true
    )
  );

  return jsonb_build_object(
    'providerStatus', clean_status,
    'ssoProvider', clean_provider,
    'ssoDomain', clean_domain,
    'updatedAt', now()
  );
end;
$$;

create or replace function private.update_pilot_membership_role(
  p_workspace_slug text,
  p_target_user_id uuid,
  p_role text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_membership public.pilot_memberships%rowtype;
  tenant_admin_count integer;
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin']
  );

  if p_role not in ('tenant-admin', 'pilot-lead', 'reviewer', 'observer') then
    raise exception 'tenant-access-invalid-role';
  end if;

  perform 1
  from public.pilot_memberships
  where tenant_id = selected_workspace.tenant_id
  for update;

  select *
  into selected_membership
  from public.pilot_memberships
  where tenant_id = selected_workspace.tenant_id
    and user_id = p_target_user_id;

  if selected_membership.user_id is null then
    raise exception 'tenant-access-membership-not-found';
  end if;

  if selected_membership.role = p_role then
    return jsonb_build_object(
      'userId', selected_membership.user_id,
      'role', selected_membership.role,
      'status', selected_membership.status,
      'changed', false
    );
  end if;

  if selected_membership.role = 'tenant-admin'
    and p_role <> 'tenant-admin'
    and selected_membership.status = 'active' then
    select count(*)::integer
    into tenant_admin_count
    from public.pilot_memberships
    where tenant_id = selected_workspace.tenant_id
      and status = 'active'
      and role = 'tenant-admin';

    if tenant_admin_count <= 1 then
      raise exception 'tenant-access-final-admin-protected';
    end if;
  end if;

  update public.pilot_memberships
  set
    role = p_role,
    updated_at = now(),
    updated_by = (select auth.uid())
  where tenant_id = selected_workspace.tenant_id
    and user_id = selected_membership.user_id;

  insert into private.pilot_membership_audit_events (
    tenant_id,
    workspace_id,
    target_user_id,
    actor_user_id,
    event_type,
    prior_role,
    next_role,
    event_metadata
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    selected_membership.user_id,
    (select auth.uid()),
    'membership-role-changed',
    selected_membership.role,
    p_role,
    jsonb_build_object(
      'assuranceLevel', 'aal2',
      'membershipStatus', selected_membership.status,
      'existingApprovedIdentityOnly', true,
      'syntheticPilotBoundary', true
    )
  );

  return jsonb_build_object(
    'userId', selected_membership.user_id,
    'role', p_role,
    'status', selected_membership.status,
    'changed', true
  );
end;
$$;

create or replace function public.create_pilot_access_invitation(
  p_workspace_slug text,
  p_email text,
  p_role text,
  p_expires_at timestamptz,
  p_note text
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.create_pilot_access_invitation(
    p_workspace_slug,
    p_email,
    p_role,
    p_expires_at,
    p_note
  );
$$;

create or replace function public.cancel_pilot_access_invitation(
  p_workspace_slug text,
  p_invitation_id uuid,
  p_reason text
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.cancel_pilot_access_invitation(
    p_workspace_slug,
    p_invitation_id,
    p_reason
  );
$$;

create or replace function public.activate_pilot_invitation_for_existing_user(
  p_workspace_slug text,
  p_invitation_id uuid
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.activate_pilot_invitation_for_existing_user(
    p_workspace_slug,
    p_invitation_id
  );
$$;

create or replace function public.deactivate_pilot_membership(
  p_workspace_slug text,
  p_target_user_id uuid,
  p_reason text
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.deactivate_pilot_membership(
    p_workspace_slug,
    p_target_user_id,
    p_reason
  );
$$;

create or replace function public.reactivate_pilot_membership(
  p_workspace_slug text,
  p_target_user_id uuid
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.reactivate_pilot_membership(
    p_workspace_slug,
    p_target_user_id
  );
$$;

create or replace function public.attest_pilot_access_review(
  p_workspace_slug text,
  p_notes text
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.attest_pilot_access_review(
    p_workspace_slug,
    p_notes
  );
$$;

create or replace function public.update_tenant_identity_readiness(
  p_workspace_slug text,
  p_identity_provider_status text,
  p_sso_provider text,
  p_sso_domain text,
  p_notes text
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.update_tenant_identity_readiness(
    p_workspace_slug,
    p_identity_provider_status,
    p_sso_provider,
    p_sso_domain,
    p_notes
  );
$$;

revoke all on function private.reject_prohibited_identity_text(text) from public, anon, authenticated;
revoke all on function private.identity_lifecycle_event_json(private.pilot_identity_lifecycle_events)
  from public, anon, authenticated;
revoke all on function private.tenant_access_dashboard(text)
  from public, anon, authenticated;
revoke all on function private.update_pilot_membership_role(text, uuid, text)
  from public, anon, authenticated;
revoke all on function private.create_pilot_access_invitation(text, text, text, timestamptz, text)
  from public, anon, authenticated;
revoke all on function private.cancel_pilot_access_invitation(text, uuid, text)
  from public, anon, authenticated;
revoke all on function private.activate_pilot_invitation_for_existing_user(text, uuid)
  from public, anon, authenticated;
revoke all on function private.deactivate_pilot_membership(text, uuid, text)
  from public, anon, authenticated;
revoke all on function private.reactivate_pilot_membership(text, uuid)
  from public, anon, authenticated;
revoke all on function private.attest_pilot_access_review(text, text)
  from public, anon, authenticated;
revoke all on function private.update_tenant_identity_readiness(text, text, text, text, text)
  from public, anon, authenticated;

grant execute on function private.tenant_access_dashboard(text)
  to authenticated;
grant execute on function private.update_pilot_membership_role(text, uuid, text)
  to authenticated;
grant execute on function private.create_pilot_access_invitation(text, text, text, timestamptz, text)
  to authenticated;
grant execute on function private.cancel_pilot_access_invitation(text, uuid, text)
  to authenticated;
grant execute on function private.activate_pilot_invitation_for_existing_user(text, uuid)
  to authenticated;
grant execute on function private.deactivate_pilot_membership(text, uuid, text)
  to authenticated;
grant execute on function private.reactivate_pilot_membership(text, uuid)
  to authenticated;
grant execute on function private.attest_pilot_access_review(text, text)
  to authenticated;
grant execute on function private.update_tenant_identity_readiness(text, text, text, text, text)
  to authenticated;

revoke all on function public.create_pilot_access_invitation(text, text, text, timestamptz, text)
  from public, anon, authenticated, service_role;
revoke all on function public.cancel_pilot_access_invitation(text, uuid, text)
  from public, anon, authenticated, service_role;
revoke all on function public.activate_pilot_invitation_for_existing_user(text, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.deactivate_pilot_membership(text, uuid, text)
  from public, anon, authenticated, service_role;
revoke all on function public.reactivate_pilot_membership(text, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.attest_pilot_access_review(text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.update_tenant_identity_readiness(text, text, text, text, text)
  from public, anon, authenticated, service_role;

grant execute on function public.create_pilot_access_invitation(text, text, text, timestamptz, text)
  to authenticated;
grant execute on function public.cancel_pilot_access_invitation(text, uuid, text)
  to authenticated;
grant execute on function public.activate_pilot_invitation_for_existing_user(text, uuid)
  to authenticated;
grant execute on function public.deactivate_pilot_membership(text, uuid, text)
  to authenticated;
grant execute on function public.reactivate_pilot_membership(text, uuid)
  to authenticated;
grant execute on function public.attest_pilot_access_review(text, text)
  to authenticated;
grant execute on function public.update_tenant_identity_readiness(text, text, text, text, text)
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
    'schemaVersion', '2026-06-13.1',
    'boundary', 'synthetic-pilot-only',
    'tenantIsolation', 'postgres-row-level-security',
    'durableAudit', 'append-only',
    'governanceLedger', 'aal2-append-only',
    'tenantAdministration', 'aal2-governed-role-controls',
    'identityLifecycle', 'governed-invitations-offboarding-access-review-sso-readiness'
  );
$$;

comment on table private.pilot_access_invitations is
  'Governed protected-pilot invitation registry. Records pending identity lifecycle intent only; no email delivery, user creation, PHI, or live clinical execution.';
comment on table private.pilot_identity_lifecycle_events is
  'Append-only invitation, offboarding, access-review, and SSO-readiness evidence for protected pilot tenants.';
comment on function private.deactivate_pilot_membership(text, uuid, text) is
  'Offboards an existing protected-pilot member after AAL2 tenant-admin authorization while preventing final active tenant-admin deactivation.';
comment on function private.create_pilot_access_invitation(text, text, text, timestamptz, text) is
  'Creates a governed invitation record only. It does not send email, create an auth user, or enable live clinical execution.';
