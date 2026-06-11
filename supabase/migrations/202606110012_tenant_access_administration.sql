alter table public.pilot_memberships
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists updated_by uuid references auth.users(id) on delete set null;

create index if not exists pilot_memberships_updated_by_idx
  on public.pilot_memberships(updated_by);

create table if not exists private.pilot_membership_audit_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  target_user_id uuid not null references auth.users(id) on delete restrict,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  event_type text not null check (event_type in ('membership-role-changed')),
  prior_role text not null check (prior_role in ('tenant-admin', 'pilot-lead', 'reviewer', 'observer')),
  next_role text not null check (next_role in ('tenant-admin', 'pilot-lead', 'reviewer', 'observer')),
  event_metadata jsonb not null default '{}'::jsonb check (
    jsonb_typeof(event_metadata) = 'object'
    and pg_column_size(event_metadata) <= 16384
  ),
  created_at timestamptz not null default now()
);

create index if not exists pilot_membership_audit_events_tenant_created_at_idx
  on private.pilot_membership_audit_events(tenant_id, created_at desc);
create index if not exists pilot_membership_audit_events_workspace_id_idx
  on private.pilot_membership_audit_events(workspace_id);
create index if not exists pilot_membership_audit_events_target_user_id_idx
  on private.pilot_membership_audit_events(target_user_id);
create index if not exists pilot_membership_audit_events_actor_user_id_idx
  on private.pilot_membership_audit_events(actor_user_id);

alter table private.pilot_membership_audit_events enable row level security;
revoke all on private.pilot_membership_audit_events from public, anon, authenticated;

drop policy if exists pilot_membership_audit_events_deny_all
  on private.pilot_membership_audit_events;
create policy pilot_membership_audit_events_deny_all
on private.pilot_membership_audit_events
as restrictive
for all
to public
using (false)
with check (false);

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
  audit_events jsonb;
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

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'userId', membership.user_id,
        'email', coalesce(member.email, 'approved-identity'),
        'role', membership.role,
        'createdAt', membership.created_at,
        'updatedAt', membership.updated_at,
        'updatedBy', membership.updated_by
      )
      order by
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
  into audit_events
  from (
    select *
    from private.pilot_membership_audit_events
    where tenant_id = selected_workspace.tenant_id
    order by created_at desc
    limit 100
  ) audit_event;

  return jsonb_build_object(
    'tenantId', selected_tenant.id,
    'tenantName', selected_tenant.name,
    'workspaceId', selected_workspace.id,
    'workspaceSlug', selected_workspace.slug,
    'workspaceName', selected_workspace.name,
    'actorUserId', (select auth.uid()),
    'memberships', memberships,
    'auditEvents', audit_events,
    'security', jsonb_build_object(
      'assuranceLevel', 'aal2',
      'finalAdminProtection', true,
      'mutationAuthorization', 'tenant-admin-plus-server-runtime-token'
    ),
    'boundary', 'Existing approved protected-pilot memberships only. Identity creation, invitations, PHI access, and live clinical execution remain denied.'
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
      'changed', false
    );
  end if;

  if selected_membership.role = 'tenant-admin' and p_role <> 'tenant-admin' then
    select count(*)::integer
    into tenant_admin_count
    from public.pilot_memberships
    where tenant_id = selected_workspace.tenant_id
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
      'existingApprovedIdentityOnly', true,
      'syntheticPilotBoundary', true
    )
  );

  return jsonb_build_object(
    'userId', selected_membership.user_id,
    'role', p_role,
    'changed', true
  );
end;
$$;

revoke all on function private.tenant_access_dashboard(text) from public, anon, authenticated;
revoke all on function private.update_pilot_membership_role(text, uuid, text) from public, anon, authenticated;
grant execute on function private.tenant_access_dashboard(text) to authenticated;
grant execute on function private.update_pilot_membership_role(text, uuid, text) to authenticated;

create or replace function public.tenant_access_dashboard(p_workspace_slug text)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select private.tenant_access_dashboard(p_workspace_slug);
$$;

create or replace function public.update_pilot_membership_role(
  p_workspace_slug text,
  p_target_user_id uuid,
  p_role text
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.update_pilot_membership_role(
    p_workspace_slug,
    p_target_user_id,
    p_role
  );
$$;

revoke all on function public.tenant_access_dashboard(text) from public, anon, authenticated, service_role;
revoke all on function public.update_pilot_membership_role(text, uuid, text)
  from public, anon, authenticated, service_role;
grant execute on function public.tenant_access_dashboard(text) to authenticated;
grant execute on function public.update_pilot_membership_role(text, uuid, text) to authenticated;

create or replace function public.protected_pilot_runtime_status()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'ready', true,
    'schemaVersion', '2026-06-11.3',
    'boundary', 'synthetic-pilot-only',
    'tenantIsolation', 'postgres-row-level-security',
    'durableAudit', 'append-only',
    'governanceLedger', 'aal2-append-only',
    'tenantAdministration', 'aal2-governed-role-controls'
  );
$$;

comment on table private.pilot_membership_audit_events is
  'Append-only tenant membership role-change evidence. Identity creation, invitations, and direct table mutation are prohibited.';
comment on function private.update_pilot_membership_role(text, uuid, text) is
  'Changes an existing approved pilot membership role after fresh AAL2 tenant-admin authorization while preventing final-admin demotion.';
