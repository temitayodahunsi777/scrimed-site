create table if not exists private.sales_opportunity_workspaces (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  intake_id text not null references private.pilot_intake_submissions(intake_id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  workspace_slug text not null check (workspace_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  workspace_name text not null check (char_length(workspace_name) between 2 and 180),
  provisioning_status text not null default 'provisioned'
    check (provisioning_status in ('provisioned', 'archived')),
  provisioning_mode text not null default 'buyer-specific-protected-workspace'
    check (provisioning_mode in ('buyer-specific-protected-workspace')),
  invitation_policy jsonb not null default '{}'::jsonb
    check (jsonb_typeof(invitation_policy) = 'object' and pg_column_size(invitation_policy) <= 32768),
  onboarding_plan jsonb not null default '[]'::jsonb
    check (jsonb_typeof(onboarding_plan) = 'array' and pg_column_size(onboarding_plan) <= 32768),
  retention_until timestamptz not null,
  last_packet_generated_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  boundary text not null check (char_length(boundary) between 80 and 1600),
  unique (tenant_id, intake_id),
  unique (workspace_id)
);

create index if not exists sales_opportunity_workspaces_tenant_created_idx
  on private.sales_opportunity_workspaces(tenant_id, created_at desc);
create index if not exists sales_opportunity_workspaces_intake_idx
  on private.sales_opportunity_workspaces(intake_id);
create index if not exists sales_opportunity_workspaces_workspace_slug_idx
  on private.sales_opportunity_workspaces(workspace_slug);
create index if not exists sales_opportunity_workspaces_created_by_idx
  on private.sales_opportunity_workspaces(created_by);
create index if not exists sales_opportunity_workspaces_updated_by_idx
  on private.sales_opportunity_workspaces(updated_by);

alter table private.sales_opportunity_workspaces enable row level security;
revoke all on private.sales_opportunity_workspaces from public, anon, authenticated;

drop policy if exists sales_opportunity_workspaces_deny_direct_access
  on private.sales_opportunity_workspaces;
create policy sales_opportunity_workspaces_deny_direct_access
on private.sales_opportunity_workspaces
as restrictive
for all
to public
using (false)
with check (false);

alter table private.sales_opportunity_audit_events
  drop constraint if exists sales_opportunity_audit_events_event_type_check;

alter table private.sales_opportunity_audit_events
  add constraint sales_opportunity_audit_events_event_type_check check (
    event_type in (
      'opportunity-updated',
      'proposal-downloaded',
      'crm-sync-recorded',
      'crm-export-downloaded',
      'follow-up-draft-downloaded',
      'follow-up-completed',
      'assessment-invitation-downloaded',
      'attribution-analytics-packet-downloaded',
      'buyer-deal-room-packet-downloaded',
      'opportunity-workspace-provisioned',
      'opportunity-workspace-packet-downloaded'
    )
  );

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
      'opportunity-workspace-provisioned'
    )
  );

create or replace function private.sales_opportunity_workspace_json(
  provisioning private.sales_opportunity_workspaces
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return jsonb_build_object(
    'id', provisioning.id,
    'tenantId', provisioning.tenant_id,
    'intakeId', provisioning.intake_id,
    'workspaceId', provisioning.workspace_id,
    'workspaceSlug', provisioning.workspace_slug,
    'workspaceName', provisioning.workspace_name,
    'provisioningStatus', provisioning.provisioning_status,
    'provisioningMode', provisioning.provisioning_mode,
    'invitationPolicy', provisioning.invitation_policy,
    'onboardingPlan', provisioning.onboarding_plan,
    'retentionUntil', provisioning.retention_until,
    'lastPacketGeneratedAt', provisioning.last_packet_generated_at,
    'createdAt', provisioning.created_at,
    'createdBy', provisioning.created_by,
    'updatedAt', provisioning.updated_at,
    'updatedBy', provisioning.updated_by,
    'boundary', provisioning.boundary
  );
end;
$$;

create or replace function private.sales_opportunity_json(
  opportunity private.pilot_intake_submissions
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return jsonb_build_object(
    'intakeId', opportunity.intake_id,
    'receivedAt', opportunity.received_at,
    'pipelineStage', opportunity.pipeline_stage,
    'assignedOwner', opportunity.assigned_owner,
    'nextAction', opportunity.next_action,
    'nextActionDueAt', opportunity.next_action_due_at,
    'nextActionCompletedAt', opportunity.next_action_completed_at,
    'updatedAt', opportunity.updated_at,
    'updatedBy', opportunity.updated_by,
    'lastCrmSyncAt', opportunity.last_crm_sync_at,
    'lastCrmSyncStatus', opportunity.last_crm_sync_status,
    'lastCrmSyncDetail', opportunity.last_crm_sync_detail,
    'lastCrmExportAt', opportunity.last_crm_export_at,
    'lastAttributionAnalyticsPacketAt', opportunity.last_attribution_analytics_packet_at,
    'lastBuyerDealRoomPacketAt', opportunity.last_buyer_deal_room_packet_at,
    'workspaceProvisioning', (
      select private.sales_opportunity_workspace_json(provisioning)
      from private.sales_opportunity_workspaces provisioning
      where provisioning.tenant_id = opportunity.tenant_id
        and provisioning.intake_id = opportunity.intake_id
      limit 1
    ),
    'assessmentStartAt', opportunity.assessment_start_at,
    'assessmentDurationMinutes', opportunity.assessment_duration_minutes,
    'assessmentMeetingUrl', opportunity.assessment_meeting_url,
    'assessmentStatus', opportunity.assessment_status,
    'retentionUntil', opportunity.retention_until,
    'payload', opportunity.payload
  );
end;
$$;

create or replace function private.provision_sales_opportunity_workspace(p_intake_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_tenant_id uuid;
  selected_opportunity private.pilot_intake_submissions%rowtype;
  existing_provisioning private.sales_opportunity_workspaces%rowtype;
  created_workspace public.pilot_workspaces%rowtype;
  created_provisioning private.sales_opportunity_workspaces%rowtype;
  created_sales_event_id uuid;
  organization_name text;
  clean_intake text;
  base_slug text;
  candidate_slug text;
  attempt integer := 0;
  workspace_boundary text :=
    'Buyer-specific protected workspace for SCRIMED governed synthetic enterprise evaluation only. No PHI, live clinical records, autonomous diagnosis, payer submission, patient outreach, reimbursement guarantee, compliance certification, or production healthcare execution is permitted.';
  invitation_policy jsonb;
  onboarding_plan jsonb;
begin
  target_tenant_id := private.require_sales_tenant_admin();
  perform private.require_sales_server_token();

  select *
  into selected_opportunity
  from private.pilot_intake_submissions
  where tenant_id = target_tenant_id
    and intake_id = p_intake_id;

  if selected_opportunity.id is null then
    raise exception 'sales-opportunity-not-found';
  end if;

  select *
  into existing_provisioning
  from private.sales_opportunity_workspaces
  where tenant_id = target_tenant_id
    and intake_id = p_intake_id;

  if existing_provisioning.id is not null then
    return jsonb_build_object(
      'workspaceProvisioning', private.sales_opportunity_workspace_json(existing_provisioning),
      'created', false,
      'auditEventId', null,
      'boundary', workspace_boundary
    );
  end if;

  if selected_opportunity.pipeline_stage not in (
    'qualified',
    'discovery',
    'proposal',
    'pilot-planning',
    'won'
  ) then
    raise exception 'sales-opportunity-not-qualified-for-workspace';
  end if;

  organization_name := nullif(trim(coalesce(selected_opportunity.payload #>> '{organization,name}', '')), '');
  clean_intake := trim(both '-' from regexp_replace(lower(coalesce(p_intake_id, '')), '[^a-z0-9]+', '-', 'g'));

  if clean_intake = '' then
    clean_intake := substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);
  end if;

  base_slug := trim(both '-' from left('buyer-' || clean_intake, 60));
  candidate_slug := base_slug;

  while exists (select 1 from public.pilot_workspaces where slug = candidate_slug) loop
    attempt := attempt + 1;
    if attempt > 12 then
      raise exception 'sales-opportunity-workspace-slug-unavailable';
    end if;

    candidate_slug := trim(both '-' from left(base_slug, 49)) || '-' ||
      substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
  end loop;

  if candidate_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'sales-opportunity-workspace-invalid-slug';
  end if;

  invitation_policy := jsonb_build_object(
    'mode', 'manual-onboarding-packet-only',
    'directEmailSend', false,
    'recommendedInitialRoles', jsonb_build_array(
      jsonb_build_object(
        'email', lower(trim(coalesce(selected_opportunity.payload #>> '{contact,workEmail}', ''))),
        'role', 'pilot-lead',
        'status', 'pending-human-approval'
      )
    ),
    'requiresAal2', true,
    'requiresTenantAdminApproval', true,
    'expiresInDays', 14,
    'noPhiBoundary', true
  );

  onboarding_plan := jsonb_build_array(
    'Confirm buyer sponsor, workflow owner, legal/privacy/security reviewer, and SCRIMED owner.',
    'Keep all workspace material synthetic or business-scope only; do not upload PHI or live clinical records.',
    'Use tenant-admin review before any invitation, role change, packet release, or access review.',
    'Generate buyer-room, demo-readiness, TrustOps, and enterprise proof packets before paid expansion.',
    'Block autonomous diagnosis, payer submission, patient outreach, production connector use, and medical advice.'
  );

  insert into public.pilot_workspaces (
    tenant_id,
    slug,
    name,
    status,
    boundary
  )
  values (
    target_tenant_id,
    candidate_slug,
    left('SCRIMED Buyer Room - ' || coalesce(organization_name, 'Qualified Opportunity'), 180),
    'assessment',
    workspace_boundary
  )
  returning * into created_workspace;

  insert into private.sales_opportunity_workspaces (
    tenant_id,
    intake_id,
    workspace_id,
    workspace_slug,
    workspace_name,
    invitation_policy,
    onboarding_plan,
    retention_until,
    created_by,
    updated_by,
    boundary
  )
  values (
    target_tenant_id,
    selected_opportunity.intake_id,
    created_workspace.id,
    created_workspace.slug,
    created_workspace.name,
    invitation_policy,
    onboarding_plan,
    selected_opportunity.retention_until,
    (select auth.uid()),
    (select auth.uid()),
    workspace_boundary
  )
  returning * into created_provisioning;

  insert into private.sales_opportunity_audit_events (
    tenant_id, intake_id, actor_user_id, event_type, event_metadata
  )
  values (
    target_tenant_id,
    selected_opportunity.intake_id,
    (select auth.uid()),
    'opportunity-workspace-provisioned',
    jsonb_build_object(
      'workspaceId', created_workspace.id,
      'workspaceSlug', created_workspace.slug,
      'workspaceName', created_workspace.name,
      'provisioningMode', created_provisioning.provisioning_mode,
      'retentionUntil', created_provisioning.retention_until,
      'manualInvitationPolicy', true,
      'noPhiBoundary', true,
      'syntheticOnly', true
    )
  )
  returning id into created_sales_event_id;

  insert into public.pilot_audit_events (
    tenant_id,
    workspace_id,
    session_id,
    actor_user_id,
    event_type,
    event_metadata
  )
  values (
    target_tenant_id,
    created_workspace.id,
    null,
    (select auth.uid()),
    'opportunity-workspace-provisioned',
    jsonb_build_object(
      'intakeId', selected_opportunity.intake_id,
      'salesAuditEventId', created_sales_event_id,
      'syntheticOnly', true,
      'assuranceLevel', 'aal2',
      'manualInvitationPolicy', true
    )
  );

  return jsonb_build_object(
    'workspaceProvisioning', private.sales_opportunity_workspace_json(created_provisioning),
    'created', true,
    'auditEventId', created_sales_event_id,
    'boundary', workspace_boundary
  );
end;
$$;

create or replace function private.record_sales_opportunity_workspace_packet_download(
  p_intake_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_tenant_id uuid;
  selected_provisioning private.sales_opportunity_workspaces%rowtype;
  created_event_id uuid;
begin
  target_tenant_id := private.require_sales_tenant_admin();
  perform private.require_sales_server_token();

  update private.sales_opportunity_workspaces provisioning
  set last_packet_generated_at = now(),
      updated_at = now(),
      updated_by = (select auth.uid())
  where provisioning.tenant_id = target_tenant_id
    and provisioning.intake_id = p_intake_id
    and provisioning.provisioning_status = 'provisioned'
  returning * into selected_provisioning;

  if selected_provisioning.id is null then
    raise exception 'sales-opportunity-workspace-not-provisioned';
  end if;

  insert into private.sales_opportunity_audit_events (
    tenant_id, intake_id, actor_user_id, event_type, event_metadata
  )
  values (
    target_tenant_id,
    p_intake_id,
    (select auth.uid()),
    'opportunity-workspace-packet-downloaded',
    jsonb_build_object(
      'workspaceId', selected_provisioning.workspace_id,
      'workspaceSlug', selected_provisioning.workspace_slug,
      'packetType', 'opportunity-workspace-provisioning-packet',
      'format', 'text/markdown',
      'manualInvitationPolicy', true,
      'noPhiBoundary', true,
      'syntheticOnly', true
    )
  )
  returning id into created_event_id;

  return jsonb_build_object(
    'workspaceProvisioning', private.sales_opportunity_workspace_json(selected_provisioning),
    'created', false,
    'auditEventId', created_event_id,
    'boundary', selected_provisioning.boundary
  );
end;
$$;

create or replace function public.provision_sales_opportunity_workspace(p_intake_id text)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.provision_sales_opportunity_workspace(p_intake_id);
$$;

create or replace function public.record_sales_opportunity_workspace_packet_download(
  p_intake_id text
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_sales_opportunity_workspace_packet_download(p_intake_id);
$$;

revoke all on function private.sales_opportunity_workspace_json(private.sales_opportunity_workspaces)
  from public, anon, authenticated, service_role;
revoke all on function private.provision_sales_opportunity_workspace(text)
  from public, anon, authenticated, service_role;
revoke all on function private.record_sales_opportunity_workspace_packet_download(text)
  from public, anon, authenticated, service_role;
revoke all on function public.provision_sales_opportunity_workspace(text)
  from public, anon, authenticated, service_role;
revoke all on function public.record_sales_opportunity_workspace_packet_download(text)
  from public, anon, authenticated, service_role;

grant execute on function private.sales_opportunity_workspace_json(private.sales_opportunity_workspaces)
  to authenticated;
grant execute on function private.provision_sales_opportunity_workspace(text)
  to authenticated;
grant execute on function private.record_sales_opportunity_workspace_packet_download(text)
  to authenticated;
grant execute on function public.provision_sales_opportunity_workspace(text)
  to authenticated;
grant execute on function public.record_sales_opportunity_workspace_packet_download(text)
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
    'schemaVersion', '2026-06-16.5',
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
    'opportunityWorkspaceProvisioning', 'aal2-private-rpc-buyer-workspace-linkage'
  );
$$;

comment on table private.sales_opportunity_workspaces is
  'Private no-PHI mapping from retained sales opportunities to buyer-specific protected workspaces. Direct Data API access is denied.';
comment on function private.provision_sales_opportunity_workspace(text) is
  'Creates an opportunity-linked protected workspace only for qualified no-PHI sales opportunities after tenant-admin AAL2 and server-held authorization.';
comment on function private.record_sales_opportunity_workspace_packet_download(text) is
  'Records audited release of an opportunity workspace provisioning packet for buyer diligence. No PHI, live clinical execution, payer submission, patient outreach, or production authorization is created.';
