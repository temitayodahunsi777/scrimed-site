create table if not exists private.sales_buyer_tenant_lifecycles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  intake_id text not null references private.pilot_intake_submissions(intake_id) on delete restrict,
  workspace_provisioning_id uuid not null references private.sales_opportunity_workspaces(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  workspace_slug text not null check (workspace_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  tenant_mode text not null default 'buyer-dedicated-logical-tenant'
    check (tenant_mode in ('buyer-dedicated-logical-tenant')),
  deployment_mode text not null default 'protected-synthetic-evaluation'
    check (deployment_mode in ('protected-synthetic-evaluation')),
  lifecycle_status text not null default 'activated'
    check (lifecycle_status in ('activated', 'archived')),
  sso_policy jsonb not null default '{}'::jsonb
    check (jsonb_typeof(sso_policy) = 'object' and pg_column_size(sso_policy) <= 32768),
  invitation_delivery_policy jsonb not null default '{}'::jsonb
    check (jsonb_typeof(invitation_delivery_policy) = 'object' and pg_column_size(invitation_delivery_policy) <= 32768),
  access_review_policy jsonb not null default '{}'::jsonb
    check (jsonb_typeof(access_review_policy) = 'object' and pg_column_size(access_review_policy) <= 32768),
  retention_archive_policy jsonb not null default '{}'::jsonb
    check (jsonb_typeof(retention_archive_policy) = 'object' and pg_column_size(retention_archive_policy) <= 32768),
  activation_checklist jsonb not null default '[]'::jsonb
    check (jsonb_typeof(activation_checklist) = 'array' and pg_column_size(activation_checklist) <= 32768),
  competitive_advantage_signals jsonb not null default '[]'::jsonb
    check (jsonb_typeof(competitive_advantage_signals) = 'array' and pg_column_size(competitive_advantage_signals) <= 32768),
  last_packet_generated_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  boundary text not null check (char_length(boundary) between 80 and 1600),
  unique (tenant_id, intake_id),
  unique (workspace_provisioning_id)
);

create index if not exists sales_buyer_tenant_lifecycles_intake_idx
  on private.sales_buyer_tenant_lifecycles(intake_id);
create index if not exists sales_buyer_tenant_lifecycles_workspace_id_idx
  on private.sales_buyer_tenant_lifecycles(workspace_id);
create index if not exists sales_buyer_tenant_lifecycles_workspace_slug_idx
  on private.sales_buyer_tenant_lifecycles(workspace_slug);
create index if not exists sales_buyer_tenant_lifecycles_created_by_idx
  on private.sales_buyer_tenant_lifecycles(created_by);
create index if not exists sales_buyer_tenant_lifecycles_updated_by_idx
  on private.sales_buyer_tenant_lifecycles(updated_by);

alter table private.sales_buyer_tenant_lifecycles enable row level security;
revoke all on private.sales_buyer_tenant_lifecycles from public, anon, authenticated;

drop policy if exists sales_buyer_tenant_lifecycles_deny_direct_access
  on private.sales_buyer_tenant_lifecycles;
create policy sales_buyer_tenant_lifecycles_deny_direct_access
on private.sales_buyer_tenant_lifecycles
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
      'opportunity-workspace-packet-downloaded',
      'buyer-tenant-lifecycle-activated',
      'buyer-tenant-lifecycle-packet-downloaded'
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
      'opportunity-workspace-provisioned',
      'buyer-tenant-lifecycle-activated'
    )
  );

create or replace function private.sales_buyer_tenant_lifecycle_json(
  lifecycle private.sales_buyer_tenant_lifecycles
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return jsonb_build_object(
    'id', lifecycle.id,
    'tenantId', lifecycle.tenant_id,
    'intakeId', lifecycle.intake_id,
    'workspaceProvisioningId', lifecycle.workspace_provisioning_id,
    'workspaceId', lifecycle.workspace_id,
    'workspaceSlug', lifecycle.workspace_slug,
    'tenantMode', lifecycle.tenant_mode,
    'deploymentMode', lifecycle.deployment_mode,
    'lifecycleStatus', lifecycle.lifecycle_status,
    'ssoPolicy', lifecycle.sso_policy,
    'invitationDeliveryPolicy', lifecycle.invitation_delivery_policy,
    'accessReviewPolicy', lifecycle.access_review_policy,
    'retentionArchivePolicy', lifecycle.retention_archive_policy,
    'activationChecklist', lifecycle.activation_checklist,
    'competitiveAdvantageSignals', lifecycle.competitive_advantage_signals,
    'lastPacketGeneratedAt', lifecycle.last_packet_generated_at,
    'createdAt', lifecycle.created_at,
    'createdBy', lifecycle.created_by,
    'updatedAt', lifecycle.updated_at,
    'updatedBy', lifecycle.updated_by,
    'boundary', lifecycle.boundary
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
    'buyerTenantLifecycle', (
      select private.sales_buyer_tenant_lifecycle_json(lifecycle)
      from private.sales_buyer_tenant_lifecycles lifecycle
      where lifecycle.tenant_id = opportunity.tenant_id
        and lifecycle.intake_id = opportunity.intake_id
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

create or replace function private.activate_sales_buyer_tenant_lifecycle(p_intake_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_tenant_id uuid;
  selected_opportunity private.pilot_intake_submissions%rowtype;
  selected_provisioning private.sales_opportunity_workspaces%rowtype;
  existing_lifecycle private.sales_buyer_tenant_lifecycles%rowtype;
  created_lifecycle private.sales_buyer_tenant_lifecycles%rowtype;
  created_sales_event_id uuid;
  buyer_email text;
  buyer_domain text;
  next_review_due_at timestamptz;
  archive_eligible_at timestamptz;
  lifecycle_boundary text :=
    'Buyer tenant lifecycle controls for SCRIMED governed synthetic enterprise evaluation only. No PHI, live clinical records, autonomous diagnosis, payer submission, patient outreach, reimbursement guarantee, compliance certification, legal advice, or production healthcare execution is permitted.';
  sso_policy jsonb;
  invitation_delivery_policy jsonb;
  access_review_policy jsonb;
  retention_archive_policy jsonb;
  activation_checklist jsonb;
  competitive_advantage_signals jsonb;
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

  if selected_opportunity.pipeline_stage = 'closed-lost' then
    raise exception 'sales-buyer-tenant-lifecycle-closed-lost';
  end if;

  select *
  into selected_provisioning
  from private.sales_opportunity_workspaces
  where tenant_id = target_tenant_id
    and intake_id = p_intake_id
    and provisioning_status = 'provisioned';

  if selected_provisioning.id is null then
    raise exception 'sales-buyer-tenant-lifecycle-workspace-required';
  end if;

  select *
  into existing_lifecycle
  from private.sales_buyer_tenant_lifecycles
  where tenant_id = target_tenant_id
    and intake_id = p_intake_id;

  if existing_lifecycle.id is not null then
    return jsonb_build_object(
      'buyerTenantLifecycle', private.sales_buyer_tenant_lifecycle_json(existing_lifecycle),
      'created', false,
      'auditEventId', null,
      'boundary', lifecycle_boundary
    );
  end if;

  buyer_email := lower(trim(coalesce(selected_opportunity.payload #>> '{contact,workEmail}', '')));
  buyer_domain := split_part(buyer_email, '@', 2);

  if buyer_domain is null
    or buyer_domain = ''
    or buyer_domain !~* '^[A-Z0-9.-]+\.[A-Z]{2,}$' then
    buyer_domain := 'buyer-domain-to-confirm';
  end if;

  next_review_due_at := now() + interval '30 days';
  archive_eligible_at := greatest(selected_provisioning.retention_until, now() + interval '30 days');

  sso_policy := jsonb_build_object(
    'status', 'domain-policy-ready',
    'allowedDomains', jsonb_build_array(buyer_domain),
    'providerStrategy', 'buyer-idp-or-passkey',
    'enforcement', jsonb_build_array(
      'passkey-or-magic-link-plus-aal2',
      'tenant-admin-approval-required',
      'domain-review-before-invitation',
      'no-password-first-policy'
    ),
    'productionGate', 'Confirm customer IdP, domain ownership, redirect URLs, session policy, and legal approval before production SSO.'
  );

  invitation_delivery_policy := jsonb_build_object(
    'mode', 'manual-packet-gated',
    'directEmailSend', false,
    'approvalRequired', jsonb_build_array(
      'SCRIMED tenant-admin',
      'buyer sponsor',
      'security/privacy reviewer'
    ),
    'deliveryChannels', jsonb_build_array(
      'downloaded onboarding packet',
      'approved external email by human operator',
      'buyer-approved meeting follow-up'
    ),
    'productionGate', 'Transactional email, sending domain, abuse controls, and message templates must be approved before automated invitation delivery.'
  );

  access_review_policy := jsonb_build_object(
    'cadenceDays', 30,
    'nextReviewDueAt', next_review_due_at,
    'requiredReviewers', jsonb_build_array(
      'SCRIMED tenant-admin',
      'buyer sponsor',
      'workspace owner'
    ),
    'staleAccessAction', 'disable-before-expansion'
  );

  retention_archive_policy := jsonb_build_object(
    'retentionUntil', selected_provisioning.retention_until,
    'archiveEligibleAt', archive_eligible_at,
    'legalHoldSupported', true,
    'archiveControls', jsonb_build_array(
      'archive before renewal or production conversion',
      'retain audit packets until contractual review',
      'block deletion during legal hold',
      'export buyer packet before workspace archival'
    ),
    'deletionGate', 'Written buyer and SCRIMED approval required before data deletion beyond standard synthetic evaluation retention.'
  );

  activation_checklist := jsonb_build_array(
    'Confirm buyer sponsor, workflow owner, legal/privacy/security reviewer, and SCRIMED owner.',
    'Confirm buyer email domain and production SSO strategy before inviting additional users.',
    'Keep evaluation material synthetic or business-scope only; do not upload PHI or live clinical records.',
    'Use tenant-admin approval for invitations, role changes, packet release, access review, archive, and retention changes.',
    'Generate workspace, Buyer Room, demo readiness, TrustOps, enterprise, and lifecycle packets before paid pilot expansion.',
    'Block autonomous diagnosis, payer submission, patient outreach, production connector use, and medical advice.'
  );

  competitive_advantage_signals := jsonb_build_array(
    jsonb_build_object(
      'pillar', 'Buyer-specific governance',
      'buyerValue', 'Each opportunity gets explicit SSO, invitation, access review, and retention controls before expansion.',
      'proof', '/sales-operations and audited lifecycle packet'
    ),
    jsonb_build_object(
      'pillar', 'Trust-first sales conversion',
      'buyerValue', 'The commercial path proves limitations, controls, and review gates before asking for live data.',
      'proof', '/pilot-deal-room and Buyer Pilot Room packet'
    ),
    jsonb_build_object(
      'pillar', 'Interoperability-ready operating layer',
      'buyerValue', 'Lifecycle controls can wrap FHIR, HL7, DICOMweb, X12, and future connectors once production scope is approved.',
      'proof', '/interoperability/evaluations'
    ),
    jsonb_build_object(
      'pillar', 'No-PHI evaluation discipline',
      'buyerValue', 'Enterprise buyers can evaluate SCRIMED without exposing patients, payer members, or live clinical systems.',
      'proof', 'protected synthetic workspaces and fail-closed APIs'
    )
  );

  insert into private.sales_buyer_tenant_lifecycles (
    tenant_id,
    intake_id,
    workspace_provisioning_id,
    workspace_id,
    workspace_slug,
    sso_policy,
    invitation_delivery_policy,
    access_review_policy,
    retention_archive_policy,
    activation_checklist,
    competitive_advantage_signals,
    created_by,
    updated_by,
    boundary
  )
  values (
    target_tenant_id,
    selected_opportunity.intake_id,
    selected_provisioning.id,
    selected_provisioning.workspace_id,
    selected_provisioning.workspace_slug,
    sso_policy,
    invitation_delivery_policy,
    access_review_policy,
    retention_archive_policy,
    activation_checklist,
    competitive_advantage_signals,
    (select auth.uid()),
    (select auth.uid()),
    lifecycle_boundary
  )
  returning * into created_lifecycle;

  insert into private.sales_opportunity_audit_events (
    tenant_id, intake_id, actor_user_id, event_type, event_metadata
  )
  values (
    target_tenant_id,
    selected_opportunity.intake_id,
    (select auth.uid()),
    'buyer-tenant-lifecycle-activated',
    jsonb_build_object(
      'workspaceId', selected_provisioning.workspace_id,
      'workspaceSlug', selected_provisioning.workspace_slug,
      'tenantMode', created_lifecycle.tenant_mode,
      'deploymentMode', created_lifecycle.deployment_mode,
      'ssoPolicyStatus', created_lifecycle.sso_policy ->> 'status',
      'invitationMode', created_lifecycle.invitation_delivery_policy ->> 'mode',
      'nextAccessReviewDueAt', created_lifecycle.access_review_policy ->> 'nextReviewDueAt',
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
    selected_provisioning.workspace_id,
    null,
    (select auth.uid()),
    'buyer-tenant-lifecycle-activated',
    jsonb_build_object(
      'intakeId', selected_opportunity.intake_id,
      'salesAuditEventId', created_sales_event_id,
      'tenantMode', created_lifecycle.tenant_mode,
      'assuranceLevel', 'aal2',
      'manualInvitationPolicy', true,
      'syntheticOnly', true
    )
  );

  return jsonb_build_object(
    'buyerTenantLifecycle', private.sales_buyer_tenant_lifecycle_json(created_lifecycle),
    'created', true,
    'auditEventId', created_sales_event_id,
    'boundary', lifecycle_boundary
  );
end;
$$;

create or replace function private.record_sales_buyer_tenant_lifecycle_packet_download(
  p_intake_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_tenant_id uuid;
  selected_lifecycle private.sales_buyer_tenant_lifecycles%rowtype;
  created_event_id uuid;
begin
  target_tenant_id := private.require_sales_tenant_admin();
  perform private.require_sales_server_token();

  update private.sales_buyer_tenant_lifecycles lifecycle
  set last_packet_generated_at = now(),
      updated_at = now(),
      updated_by = (select auth.uid())
  where lifecycle.tenant_id = target_tenant_id
    and lifecycle.intake_id = p_intake_id
    and lifecycle.lifecycle_status = 'activated'
  returning * into selected_lifecycle;

  if selected_lifecycle.id is null then
    raise exception 'sales-buyer-tenant-lifecycle-not-activated';
  end if;

  insert into private.sales_opportunity_audit_events (
    tenant_id, intake_id, actor_user_id, event_type, event_metadata
  )
  values (
    target_tenant_id,
    p_intake_id,
    (select auth.uid()),
    'buyer-tenant-lifecycle-packet-downloaded',
    jsonb_build_object(
      'workspaceId', selected_lifecycle.workspace_id,
      'workspaceSlug', selected_lifecycle.workspace_slug,
      'packetType', 'buyer-tenant-lifecycle-packet',
      'format', 'text/markdown',
      'tenantMode', selected_lifecycle.tenant_mode,
      'ssoPolicyStatus', selected_lifecycle.sso_policy ->> 'status',
      'manualInvitationPolicy', true,
      'noPhiBoundary', true,
      'syntheticOnly', true
    )
  )
  returning id into created_event_id;

  return jsonb_build_object(
    'buyerTenantLifecycle', private.sales_buyer_tenant_lifecycle_json(selected_lifecycle),
    'created', false,
    'auditEventId', created_event_id,
    'boundary', selected_lifecycle.boundary
  );
end;
$$;

create or replace function public.activate_sales_buyer_tenant_lifecycle(p_intake_id text)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.activate_sales_buyer_tenant_lifecycle(p_intake_id);
$$;

create or replace function public.record_sales_buyer_tenant_lifecycle_packet_download(
  p_intake_id text
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_sales_buyer_tenant_lifecycle_packet_download(p_intake_id);
$$;

revoke all on function private.sales_buyer_tenant_lifecycle_json(private.sales_buyer_tenant_lifecycles)
  from public, anon, authenticated, service_role;
revoke all on function private.activate_sales_buyer_tenant_lifecycle(text)
  from public, anon, authenticated, service_role;
revoke all on function private.record_sales_buyer_tenant_lifecycle_packet_download(text)
  from public, anon, authenticated, service_role;
revoke all on function public.activate_sales_buyer_tenant_lifecycle(text)
  from public, anon, authenticated, service_role;
revoke all on function public.record_sales_buyer_tenant_lifecycle_packet_download(text)
  from public, anon, authenticated, service_role;

grant execute on function private.sales_buyer_tenant_lifecycle_json(private.sales_buyer_tenant_lifecycles)
  to authenticated;
grant execute on function private.activate_sales_buyer_tenant_lifecycle(text)
  to authenticated;
grant execute on function private.record_sales_buyer_tenant_lifecycle_packet_download(text)
  to authenticated;
grant execute on function public.activate_sales_buyer_tenant_lifecycle(text)
  to authenticated;
grant execute on function public.record_sales_buyer_tenant_lifecycle_packet_download(text)
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
    'schemaVersion', '2026-06-16.6',
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
    'buyerTenantLifecycleAutomation', 'aal2-private-rpc-sso-access-review-archive-controls'
  );
$$;

comment on table private.sales_buyer_tenant_lifecycles is
  'Private no-PHI lifecycle controls for opportunity-linked buyer workspaces. Direct Data API access is denied.';
comment on function private.activate_sales_buyer_tenant_lifecycle(text) is
  'Activates buyer tenant lifecycle controls only after opportunity workspace provisioning and tenant-admin AAL2 plus server-held authorization.';
comment on function private.record_sales_buyer_tenant_lifecycle_packet_download(text) is
  'Records audited release of a buyer tenant lifecycle packet for enterprise diligence. No PHI, live clinical execution, payer submission, patient outreach, or production authorization is created.';
