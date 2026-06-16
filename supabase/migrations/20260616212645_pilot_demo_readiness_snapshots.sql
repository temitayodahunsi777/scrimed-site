create table if not exists public.pilot_demo_readiness_snapshots (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  readiness_state text not null check (readiness_state in ('ready', 'review', 'blocked')),
  readiness_score smallint not null check (readiness_score between 0 and 100),
  passed_count smallint not null check (passed_count >= 0),
  review_count smallint not null check (review_count >= 0),
  blocked_count smallint not null check (blocked_count >= 0),
  required_actions text[] not null default '{}'::text[] check (cardinality(required_actions) <= 20),
  buyer_brief text[] not null default '{}'::text[] check (cardinality(buyer_brief) <= 12),
  check_results jsonb not null default '[]'::jsonb check (
    jsonb_typeof(check_results) = 'array'
    and pg_column_size(check_results) <= 65536
  ),
  runbook jsonb not null default '[]'::jsonb check (
    jsonb_typeof(runbook) = 'array'
    and pg_column_size(runbook) <= 32768
  ),
  verification jsonb not null default '{}'::jsonb check (
    jsonb_typeof(verification) = 'object'
    and pg_column_size(verification) <= 16384
  ),
  evidence_counts jsonb not null default '{}'::jsonb check (
    jsonb_typeof(evidence_counts) = 'object'
    and pg_column_size(evidence_counts) <= 16384
  ),
  snapshot jsonb not null check (
    jsonb_typeof(snapshot) = 'object'
    and pg_column_size(snapshot) <= 131072
  ),
  last_evidence_at timestamptz,
  boundary text not null check (char_length(boundary) between 80 and 2000),
  synthetic_only boolean not null default true check (synthetic_only),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists pilot_demo_readiness_snapshots_workspace_created_idx
  on public.pilot_demo_readiness_snapshots(workspace_id, created_at desc);
create index if not exists pilot_demo_readiness_snapshots_workspace_state_idx
  on public.pilot_demo_readiness_snapshots(workspace_id, readiness_state, created_at desc);
create index if not exists pilot_demo_readiness_snapshots_created_by_idx
  on public.pilot_demo_readiness_snapshots(created_by, created_at desc);

alter table public.pilot_demo_readiness_snapshots enable row level security;

drop policy if exists pilot_demo_readiness_snapshots_member_select
  on public.pilot_demo_readiness_snapshots;
create policy pilot_demo_readiness_snapshots_member_select
on public.pilot_demo_readiness_snapshots
for select
to authenticated
using ((select private.is_pilot_member(tenant_id)));

revoke all on public.pilot_demo_readiness_snapshots from anon, authenticated;
grant select on public.pilot_demo_readiness_snapshots to authenticated;

create or replace function private.create_pilot_demo_readiness_snapshot(
  p_workspace_slug text,
  p_readiness_state text,
  p_readiness_score smallint,
  p_passed_count smallint,
  p_review_count smallint,
  p_blocked_count smallint,
  p_required_actions text[] default '{}'::text[],
  p_buyer_brief text[] default '{}'::text[],
  p_check_results jsonb default '[]'::jsonb,
  p_runbook jsonb default '[]'::jsonb,
  p_verification jsonb default '{}'::jsonb,
  p_evidence_counts jsonb default '{}'::jsonb,
  p_last_evidence_at timestamptz default null,
  p_snapshot jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  created_snapshot_id uuid;
  normalized_state text := lower(trim(coalesce(p_readiness_state, '')));
  normalized_required_actions text[] := coalesce(p_required_actions, '{}'::text[]);
  normalized_buyer_brief text[] := coalesce(p_buyer_brief, '{}'::text[]);
  normalized_check_results jsonb := coalesce(p_check_results, '[]'::jsonb);
  normalized_runbook jsonb := coalesce(p_runbook, '[]'::jsonb);
  normalized_verification jsonb := coalesce(p_verification, '{}'::jsonb);
  normalized_evidence_counts jsonb := coalesce(p_evidence_counts, '{}'::jsonb);
  normalized_snapshot jsonb := coalesce(p_snapshot, '{}'::jsonb);
  snapshot_boundary text := 'Pilot demo readiness snapshots store synthetic buyer-demo operating evidence only. They do not store PHI, patient identifiers, live clinical records, payer credentials, production EHR credentials, secrets, medical advice, autonomous diagnosis, payer submission, patient outreach, legal advice, compliance certification, or production authorization.';
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead']
  );

  if normalized_state not in ('ready', 'review', 'blocked')
    or p_readiness_score not between 0 and 100
    or p_passed_count < 0
    or p_review_count < 0
    or p_blocked_count < 0
    or cardinality(normalized_required_actions) > 20
    or cardinality(normalized_buyer_brief) > 12
    or jsonb_typeof(normalized_check_results) <> 'array'
    or jsonb_typeof(normalized_runbook) <> 'array'
    or jsonb_typeof(normalized_verification) <> 'object'
    or jsonb_typeof(normalized_evidence_counts) <> 'object'
    or jsonb_typeof(normalized_snapshot) <> 'object'
    or pg_column_size(normalized_check_results) > 65536
    or pg_column_size(normalized_runbook) > 32768
    or pg_column_size(normalized_verification) > 16384
    or pg_column_size(normalized_evidence_counts) > 16384
    or pg_column_size(normalized_snapshot) > 131072 then
    raise exception 'invalid-demo-readiness-snapshot';
  end if;

  insert into public.pilot_demo_readiness_snapshots (
    tenant_id,
    workspace_id,
    readiness_state,
    readiness_score,
    passed_count,
    review_count,
    blocked_count,
    required_actions,
    buyer_brief,
    check_results,
    runbook,
    verification,
    evidence_counts,
    snapshot,
    last_evidence_at,
    boundary,
    created_by
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    normalized_state,
    p_readiness_score,
    p_passed_count,
    p_review_count,
    p_blocked_count,
    normalized_required_actions,
    normalized_buyer_brief,
    normalized_check_results,
    normalized_runbook,
    normalized_verification || jsonb_build_object('syntheticOnly', true),
    normalized_evidence_counts || jsonb_build_object('syntheticOnly', true),
    normalized_snapshot || jsonb_build_object(
      'syntheticOnly', true,
      'workspaceSlug', selected_workspace.slug,
      'snapshotBoundary', snapshot_boundary
    ),
    p_last_evidence_at,
    snapshot_boundary,
    (select auth.uid())
  )
  returning id into created_snapshot_id;

  insert into public.pilot_audit_events (
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
    'demo-readiness-snapshot-created',
    jsonb_build_object(
      'snapshotId', created_snapshot_id,
      'readinessState', normalized_state,
      'readinessScore', p_readiness_score,
      'blockedCount', p_blocked_count,
      'reviewCount', p_review_count,
      'syntheticOnly', true,
      'assuranceLevel', 'aal2'
    )
  );

  return created_snapshot_id;
end;
$$;

create or replace function public.create_pilot_demo_readiness_snapshot(
  p_workspace_slug text,
  p_readiness_state text,
  p_readiness_score smallint,
  p_passed_count smallint,
  p_review_count smallint,
  p_blocked_count smallint,
  p_required_actions text[] default '{}'::text[],
  p_buyer_brief text[] default '{}'::text[],
  p_check_results jsonb default '[]'::jsonb,
  p_runbook jsonb default '[]'::jsonb,
  p_verification jsonb default '{}'::jsonb,
  p_evidence_counts jsonb default '{}'::jsonb,
  p_last_evidence_at timestamptz default null,
  p_snapshot jsonb default '{}'::jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.create_pilot_demo_readiness_snapshot(
    p_workspace_slug,
    p_readiness_state,
    p_readiness_score,
    p_passed_count,
    p_review_count,
    p_blocked_count,
    p_required_actions,
    p_buyer_brief,
    p_check_results,
    p_runbook,
    p_verification,
    p_evidence_counts,
    p_last_evidence_at,
    p_snapshot
  );
$$;

create or replace function private.record_pilot_demo_readiness_packet_download(
  p_workspace_slug text,
  p_snapshot_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_snapshot public.pilot_demo_readiness_snapshots%rowtype;
  created_event_id uuid;
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead', 'reviewer']
  );

  select *
  into selected_snapshot
  from public.pilot_demo_readiness_snapshots
  where id = p_snapshot_id
    and workspace_id = selected_workspace.id
    and tenant_id = selected_workspace.tenant_id;

  if selected_snapshot.id is null then
    raise exception 'demo-readiness-snapshot-not-found';
  end if;

  insert into public.pilot_audit_events (
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
    'demo-readiness-packet-downloaded',
    jsonb_build_object(
      'snapshotId', selected_snapshot.id,
      'packetType', 'demo-readiness-packet',
      'format', 'text/markdown',
      'readinessState', selected_snapshot.readiness_state,
      'readinessScore', selected_snapshot.readiness_score,
      'syntheticOnly', true,
      'assuranceLevel', 'aal2'
    )
  )
  returning id into created_event_id;

  return created_event_id;
end;
$$;

create or replace function public.record_pilot_demo_readiness_packet_download(
  p_workspace_slug text,
  p_snapshot_id uuid
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_pilot_demo_readiness_packet_download(
    p_workspace_slug,
    p_snapshot_id
  );
$$;

revoke all on function private.create_pilot_demo_readiness_snapshot(
  text, text, smallint, smallint, smallint, smallint, text[], text[], jsonb, jsonb, jsonb, jsonb, timestamptz, jsonb
) from public, anon, authenticated, service_role;
revoke all on function public.create_pilot_demo_readiness_snapshot(
  text, text, smallint, smallint, smallint, smallint, text[], text[], jsonb, jsonb, jsonb, jsonb, timestamptz, jsonb
) from public, anon, authenticated, service_role;
revoke all on function private.record_pilot_demo_readiness_packet_download(text, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.record_pilot_demo_readiness_packet_download(text, uuid)
  from public, anon, authenticated, service_role;

grant execute on function private.create_pilot_demo_readiness_snapshot(
  text, text, smallint, smallint, smallint, smallint, text[], text[], jsonb, jsonb, jsonb, jsonb, timestamptz, jsonb
) to authenticated;
grant execute on function public.create_pilot_demo_readiness_snapshot(
  text, text, smallint, smallint, smallint, smallint, text[], text[], jsonb, jsonb, jsonb, jsonb, timestamptz, jsonb
) to authenticated;
grant execute on function private.record_pilot_demo_readiness_packet_download(text, uuid)
  to authenticated;
grant execute on function public.record_pilot_demo_readiness_packet_download(text, uuid)
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
      'demo-readiness-packet-downloaded'
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
    'schemaVersion', '2026-06-16.3',
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
    'pilotDemoReadinessSnapshots', 'aal2-audited-snapshot-packets'
  );
$$;

comment on table public.pilot_demo_readiness_snapshots is
  'Tenant-scoped synthetic buyer-demo readiness snapshots. No PHI, live patient data, production connector credentials, autonomous clinical execution, legal advice, compliance certification, or production authorization.';
comment on function private.create_pilot_demo_readiness_snapshot(
  text, text, smallint, smallint, smallint, smallint, text[], text[], jsonb, jsonb, jsonb, jsonb, timestamptz, jsonb
) is
  'Creates append-only audited synthetic demo readiness snapshots after fresh AAL2 assurance, tenant role authorization, and server-held runtime authorization.';
comment on function private.record_pilot_demo_readiness_packet_download(text, uuid) is
  'Records write-before-release demo readiness packet downloads for tenant-scoped synthetic buyer diligence.';
