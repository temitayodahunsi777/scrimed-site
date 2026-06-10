create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table if not exists public.pilot_tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 160),
  status text not null default 'synthetic-pilot' check (status in ('synthetic-pilot', 'assessment', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.pilot_memberships (
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('tenant-admin', 'pilot-lead', 'reviewer', 'observer')),
  created_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

create table if not exists public.pilot_workspaces (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 180),
  status text not null default 'synthetic-pilot' check (status in ('synthetic-pilot', 'assessment', 'archived')),
  boundary text not null check (char_length(boundary) between 80 and 1400),
  created_at timestamptz not null default now()
);

create table if not exists public.pilot_demo_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  scenario_slug text not null check (char_length(scenario_slug) between 2 and 160),
  status text not null check (status in ('synthetic-evaluation-created', 'production-request-denied')),
  boundary text not null check (char_length(boundary) between 80 and 2000),
  evaluation jsonb not null check (jsonb_typeof(evaluation) = 'object'),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.pilot_audit_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  session_id uuid references public.pilot_demo_sessions(id) on delete restrict,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  event_type text not null check (
    event_type in ('synthetic-session-created', 'production-request-denied', 'proof-packet-downloaded')
  ),
  event_metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(event_metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists pilot_memberships_user_id_idx on public.pilot_memberships(user_id);
create index if not exists pilot_workspaces_tenant_id_idx on public.pilot_workspaces(tenant_id);
create index if not exists pilot_demo_sessions_workspace_created_at_idx
  on public.pilot_demo_sessions(workspace_id, created_at desc);
create index if not exists pilot_audit_events_workspace_created_at_idx
  on public.pilot_audit_events(workspace_id, created_at desc);
create index if not exists pilot_audit_events_session_id_idx on public.pilot_audit_events(session_id);

alter table public.pilot_tenants enable row level security;
alter table public.pilot_memberships enable row level security;
alter table public.pilot_workspaces enable row level security;
alter table public.pilot_demo_sessions enable row level security;
alter table public.pilot_audit_events enable row level security;

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
      and membership.role = any(allowed_roles)
  );
$$;

revoke all on function private.is_pilot_member(uuid) from public;
revoke all on function private.has_pilot_role(uuid, text[]) from public;
grant execute on function private.is_pilot_member(uuid) to authenticated;
grant execute on function private.has_pilot_role(uuid, text[]) to authenticated;

drop policy if exists pilot_tenants_member_select on public.pilot_tenants;
create policy pilot_tenants_member_select
on public.pilot_tenants
for select
to authenticated
using ((select private.is_pilot_member(id)));

drop policy if exists pilot_memberships_self_select on public.pilot_memberships;
create policy pilot_memberships_self_select
on public.pilot_memberships
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists pilot_workspaces_member_select on public.pilot_workspaces;
create policy pilot_workspaces_member_select
on public.pilot_workspaces
for select
to authenticated
using ((select private.is_pilot_member(tenant_id)));

drop policy if exists pilot_demo_sessions_member_select on public.pilot_demo_sessions;
create policy pilot_demo_sessions_member_select
on public.pilot_demo_sessions
for select
to authenticated
using ((select private.is_pilot_member(tenant_id)));

drop policy if exists pilot_audit_events_member_select on public.pilot_audit_events;
create policy pilot_audit_events_member_select
on public.pilot_audit_events
for select
to authenticated
using ((select private.is_pilot_member(tenant_id)));

revoke all on public.pilot_tenants from anon, authenticated;
revoke all on public.pilot_memberships from anon, authenticated;
revoke all on public.pilot_workspaces from anon, authenticated;
revoke all on public.pilot_demo_sessions from anon, authenticated;
revoke all on public.pilot_audit_events from anon, authenticated;

grant select on public.pilot_tenants to authenticated;
grant select on public.pilot_memberships to authenticated;
grant select on public.pilot_workspaces to authenticated;
grant select on public.pilot_demo_sessions to authenticated;
grant select on public.pilot_audit_events to authenticated;

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
  if (select auth.uid()) is null then
    raise exception 'authentication-required';
  end if;

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
      'syntheticOnly', true
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
  if (select auth.uid()) is null then
    raise exception 'authentication-required';
  end if;

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
    coalesce(p_event_metadata, '{}'::jsonb) || jsonb_build_object('syntheticOnly', true)
  )
  returning id into created_event_id;

  return created_event_id;
end;
$$;

revoke all on function private.create_pilot_demo_session(text, text, text, text, jsonb) from public;
revoke all on function private.record_pilot_proof_packet_download(text, uuid, jsonb) from public;
grant execute on function private.create_pilot_demo_session(text, text, text, text, jsonb) to authenticated;
grant execute on function private.record_pilot_proof_packet_download(text, uuid, jsonb) to authenticated;

create or replace function public.create_pilot_demo_session(
  p_workspace_slug text,
  p_scenario_slug text,
  p_status text,
  p_boundary text,
  p_evaluation jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.create_pilot_demo_session(
    p_workspace_slug,
    p_scenario_slug,
    p_status,
    p_boundary,
    p_evaluation
  );
$$;

create or replace function public.record_pilot_proof_packet_download(
  p_workspace_slug text,
  p_session_id uuid,
  p_event_metadata jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_pilot_proof_packet_download(
    p_workspace_slug,
    p_session_id,
    p_event_metadata
  );
$$;

revoke all on function public.create_pilot_demo_session(text, text, text, text, jsonb) from public;
revoke all on function public.record_pilot_proof_packet_download(text, uuid, jsonb) from public;
grant execute on function public.create_pilot_demo_session(text, text, text, text, jsonb) to authenticated;
grant execute on function public.record_pilot_proof_packet_download(text, uuid, jsonb) to authenticated;

comment on table public.pilot_demo_sessions is
  'Durable synthetic SCRIMED pilot evidence only. Live PHI and production clinical execution are prohibited.';
comment on table public.pilot_audit_events is
  'Append-only tenant pilot audit events. Authenticated runtime roles receive select access only.';
