create table if not exists private.sales_production_activation_readiness (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  intake_id text not null references private.pilot_intake_submissions(intake_id) on delete restrict,
  buyer_tenant_lifecycle_id uuid not null references private.sales_buyer_tenant_lifecycles(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  workspace_slug text not null check (workspace_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  readiness_status text not null default 'prepared'
    check (readiness_status in ('prepared', 'enterprise-review-required')),
  domain_verification_policy jsonb not null default '{}'::jsonb
    check (jsonb_typeof(domain_verification_policy) = 'object' and pg_column_size(domain_verification_policy) <= 32768),
  sso_redirect_policy jsonb not null default '{}'::jsonb
    check (jsonb_typeof(sso_redirect_policy) = 'object' and pg_column_size(sso_redirect_policy) <= 32768),
  invitation_template_policy jsonb not null default '{}'::jsonb
    check (jsonb_typeof(invitation_template_policy) = 'object' and pg_column_size(invitation_template_policy) <= 32768),
  transactional_delivery_policy jsonb not null default '{}'::jsonb
    check (jsonb_typeof(transactional_delivery_policy) = 'object' and pg_column_size(transactional_delivery_policy) <= 32768),
  access_review_automation jsonb not null default '{}'::jsonb
    check (jsonb_typeof(access_review_automation) = 'object' and pg_column_size(access_review_automation) <= 32768),
  archive_execution_policy jsonb not null default '{}'::jsonb
    check (jsonb_typeof(archive_execution_policy) = 'object' and pg_column_size(archive_execution_policy) <= 32768),
  launch_blockers jsonb not null default '[]'::jsonb
    check (jsonb_typeof(launch_blockers) = 'array' and pg_column_size(launch_blockers) <= 32768),
  competitive_advantage_signals jsonb not null default '[]'::jsonb
    check (jsonb_typeof(competitive_advantage_signals) = 'array' and pg_column_size(competitive_advantage_signals) <= 32768),
  last_packet_generated_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  boundary text not null check (char_length(boundary) between 80 and 2000),
  unique (tenant_id, intake_id),
  unique (buyer_tenant_lifecycle_id)
);

create index if not exists sales_production_activation_readiness_intake_idx
  on private.sales_production_activation_readiness(intake_id);
create index if not exists sales_production_activation_readiness_workspace_id_idx
  on private.sales_production_activation_readiness(workspace_id);
create index if not exists sales_production_activation_readiness_workspace_slug_idx
  on private.sales_production_activation_readiness(workspace_slug);
create index if not exists sales_production_activation_readiness_lifecycle_idx
  on private.sales_production_activation_readiness(buyer_tenant_lifecycle_id);
create index if not exists sales_production_activation_readiness_created_by_idx
  on private.sales_production_activation_readiness(created_by);
create index if not exists sales_production_activation_readiness_updated_by_idx
  on private.sales_production_activation_readiness(updated_by);

alter table private.sales_production_activation_readiness enable row level security;
revoke all on private.sales_production_activation_readiness from public, anon, authenticated;

drop policy if exists sales_production_activation_readiness_deny_direct_access
  on private.sales_production_activation_readiness;
create policy sales_production_activation_readiness_deny_direct_access
on private.sales_production_activation_readiness
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
      'buyer-tenant-lifecycle-packet-downloaded',
      'production-readiness-prepared',
      'production-readiness-packet-downloaded'
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
      'buyer-tenant-lifecycle-activated',
      'production-readiness-prepared'
    )
  );

create or replace function private.sales_production_activation_readiness_json(
  readiness private.sales_production_activation_readiness
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return jsonb_build_object(
    'id', readiness.id,
    'tenantId', readiness.tenant_id,
    'intakeId', readiness.intake_id,
    'buyerTenantLifecycleId', readiness.buyer_tenant_lifecycle_id,
    'workspaceId', readiness.workspace_id,
    'workspaceSlug', readiness.workspace_slug,
    'readinessStatus', readiness.readiness_status,
    'domainVerificationPolicy', readiness.domain_verification_policy,
    'ssoRedirectPolicy', readiness.sso_redirect_policy,
    'invitationTemplatePolicy', readiness.invitation_template_policy,
    'transactionalDeliveryPolicy', readiness.transactional_delivery_policy,
    'accessReviewAutomation', readiness.access_review_automation,
    'archiveExecutionPolicy', readiness.archive_execution_policy,
    'launchBlockers', readiness.launch_blockers,
    'competitiveAdvantageSignals', readiness.competitive_advantage_signals,
    'lastPacketGeneratedAt', readiness.last_packet_generated_at,
    'createdAt', readiness.created_at,
    'createdBy', readiness.created_by,
    'updatedAt', readiness.updated_at,
    'updatedBy', readiness.updated_by,
    'boundary', readiness.boundary
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
    'productionActivationReadiness', (
      select private.sales_production_activation_readiness_json(readiness)
      from private.sales_production_activation_readiness readiness
      where readiness.tenant_id = opportunity.tenant_id
        and readiness.intake_id = opportunity.intake_id
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

create or replace function private.prepare_sales_production_activation_readiness(p_intake_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_tenant_id uuid;
  selected_opportunity private.pilot_intake_submissions%rowtype;
  selected_lifecycle private.sales_buyer_tenant_lifecycles%rowtype;
  existing_readiness private.sales_production_activation_readiness%rowtype;
  created_readiness private.sales_production_activation_readiness%rowtype;
  created_sales_event_id uuid;
  buyer_email text;
  buyer_domain text;
  next_attestation_due_at timestamptz;
  archive_eligible_at timestamptz;
  readiness_boundary text :=
    'Production SSO and invitation readiness controls for SCRIMED governed enterprise evaluation only. No automated email sending, customer SSO cutover, PHI, live clinical records, autonomous diagnosis, payer submission, patient outreach, reimbursement guarantee, compliance certification, legal advice, or production healthcare execution is permitted.';
  domain_verification_policy jsonb;
  sso_redirect_policy jsonb;
  invitation_template_policy jsonb;
  transactional_delivery_policy jsonb;
  access_review_automation jsonb;
  archive_execution_policy jsonb;
  launch_blockers jsonb;
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
    raise exception 'sales-production-readiness-closed-lost';
  end if;

  select *
  into selected_lifecycle
  from private.sales_buyer_tenant_lifecycles
  where tenant_id = target_tenant_id
    and intake_id = p_intake_id
    and lifecycle_status = 'activated';

  if selected_lifecycle.id is null then
    raise exception 'sales-production-readiness-lifecycle-required';
  end if;

  select *
  into existing_readiness
  from private.sales_production_activation_readiness
  where tenant_id = target_tenant_id
    and intake_id = p_intake_id;

  if existing_readiness.id is not null then
    return jsonb_build_object(
      'productionActivationReadiness', private.sales_production_activation_readiness_json(existing_readiness),
      'created', false,
      'auditEventId', null,
      'boundary', readiness_boundary
    );
  end if;

  buyer_email := lower(trim(coalesce(selected_opportunity.payload #>> '{contact,workEmail}', '')));
  buyer_domain := coalesce(
    nullif(selected_lifecycle.sso_policy #>> '{allowedDomains,0}', ''),
    split_part(buyer_email, '@', 2)
  );

  if buyer_domain is null
    or buyer_domain = ''
    or buyer_domain !~* '^[A-Z0-9.-]+\.[A-Z]{2,}$' then
    buyer_domain := 'buyer-domain-to-confirm';
  end if;

  next_attestation_due_at := now() + interval '30 days';

  begin
    archive_eligible_at := coalesce(
      nullif(selected_lifecycle.retention_archive_policy ->> 'archiveEligibleAt', '')::timestamptz,
      now() + interval '30 days'
    );
  exception when others then
    archive_eligible_at := now() + interval '30 days';
  end;

  domain_verification_policy := jsonb_build_object(
    'status', 'buyer-domain-review-required',
    'allowedDomains', jsonb_build_array(buyer_domain),
    'requiredEvidence', jsonb_build_array(
      'buyer security or IT owner confirmation',
      'domain ownership evidence or IdP admin confirmation',
      'approved customer tenant architecture',
      'SCRIMED tenant-admin review'
    ),
    'blockedDomains', jsonb_build_array(
      'consumer email domains',
      'unverified partner domains',
      'shared test domains without named owner'
    ),
    'ownerApprovalRequired', jsonb_build_array(
      'buyer sponsor',
      'buyer security owner',
      'SCRIMED tenant-admin'
    ),
    'productionGate', 'Do not enable customer SSO or invite expansion until domain ownership and authorized security contact are verified.'
  );

  sso_redirect_policy := jsonb_build_object(
    'status', 'origin-registry-ready',
    'allowedRedirectOrigins', jsonb_build_array(
      'https://app.scrimedsolutions.com'
    ),
    'allowedCallbackPaths', jsonb_build_array(
      '/sales-operations',
      '/pilot-workspace/access',
      '/agent-workspace'
    ),
    'allowedLogoutRedirectOrigins', jsonb_build_array(
      'https://app.scrimedsolutions.com',
      'https://www.scrimedsolutions.com'
    ),
    'enforcement', jsonb_build_array(
      'exact-origin-match-required',
      'https-only',
      'no-wildcard-callbacks',
      'tenant-admin-review-before-origin-change',
      'emergency-access-path-required'
    ),
    'productionGate', 'Register customer IdP, callback URLs, logout URLs, session policy, and emergency access procedure before production SSO.'
  );

  invitation_template_policy := jsonb_build_object(
    'status', 'legal-security-review-required',
    'templateFamily', 'enterprise-pilot-access',
    'requiredApprovals', jsonb_build_array(
      'SCRIMED tenant-admin',
      'SCRIMED legal/privacy reviewer',
      'buyer sponsor',
      'buyer security owner'
    ),
    'requiredDisclosures', jsonb_build_array(
      'synthetic evaluation boundary',
      'no PHI or live clinical records',
      'human review required',
      'no autonomous diagnosis or treatment',
      'no payer submission or patient outreach',
      'support and escalation route'
    ),
    'prohibitedContent', jsonb_build_array(
      'clinical outcome guarantees',
      'HIPAA certification claims',
      'production connector availability claims',
      'autonomous care language',
      'reimbursement guarantees',
      'patient-specific instructions'
    ),
    'productionGate', 'Template copy must be approved before automated delivery; manual packet-gated delivery remains the default.'
  );

  transactional_delivery_policy := jsonb_build_object(
    'status', 'provider-approval-required',
    'providerStrategy', 'approved-transactional-provider-required',
    'directSendEnabled', false,
    'fromDomain', 'scrimedsolutions.com',
    'abuseControls', jsonb_build_array(
      'tenant-admin approval before send',
      'domain allowlist',
      'role-scoped invitation expiry',
      'no bulk sends',
      'manual abuse review queue',
      'provider complaint and bounce monitoring required'
    ),
    'monitoringControls', jsonb_build_array(
      'delivery event logging',
      'bounce and complaint review',
      'failed-send escalation',
      'suspicious-domain blocklist',
      'daily send summary before production expansion'
    ),
    'rateLimits', jsonb_build_array(
      'maximum 5 invite preparations per opportunity per day until approved',
      'maximum 20 tenant invitations per day until provider reputation is established',
      'manual approval required for re-send'
    ),
    'productionGate', 'Approve transactional provider, verified sender domain, templates, rate limits, monitoring, incident handling, and support ownership before direct-send invitations.'
  );

  access_review_automation := jsonb_build_object(
    'status', 'attestation-reminder-ready',
    'cadenceDays', 30,
    'nextAttestationDueAt', next_attestation_due_at,
    'requiredAttestors', jsonb_build_array(
      'SCRIMED tenant-admin',
      'buyer sponsor',
      'workspace owner'
    ),
    'staleAccessAction', 'disable-before-expansion',
    'automationControls', jsonb_build_array(
      'dashboard due-date indicator',
      'audit event required for attestation',
      'stale access blocks paid expansion',
      'final-admin protection retained',
      'review notes must remain business-scope only'
    ),
    'productionGate', 'Automated reminders may be enabled only after notification templates and delivery controls are approved.'
  );

  archive_execution_policy := jsonb_build_object(
    'status', 'manual-archive-ready',
    'archiveEligibleAt', archive_eligible_at,
    'archiveRunbook', jsonb_build_array(
      'confirm no legal hold is active',
      'download buyer workspace, lifecycle, production readiness, and enterprise proof packets',
      'deactivate stale memberships before archive',
      'retain audit events according to approved retention schedule',
      'block deletion until buyer and SCRIMED written approval'
    ),
    'legalHoldSupported', true,
    'deletionGate', 'Written buyer and SCRIMED approval required before deletion beyond standard synthetic evaluation retention.',
    'productionGate', 'Archive execution remains manual until retention deletion controls, legal hold workflow, and customer export requirements are approved.'
  );

  launch_blockers := jsonb_build_array(
    'BAA/DPA and customer security review are not complete.',
    'Customer IdP metadata and SSO callback URLs are not approved.',
    'Transactional email provider, sender domain, abuse controls, and monitoring are not approved.',
    'Invitation templates have not completed legal, privacy, security, and buyer review.',
    'Access-review reminder delivery is not automated.',
    'Archive and deletion execution remain manual and require written approval.',
    'PHI, live clinical records, production connectors, payer submission, patient outreach, and autonomous clinical execution remain blocked.'
  );

  competitive_advantage_signals := jsonb_build_array(
    jsonb_build_object(
      'pillar', 'Trust-first enterprise activation',
      'buyerValue', 'SCRIMED packages SSO, domain, template, delivery, access, and archive gates before opening expansion risk.',
      'proof', '/sales-operations production readiness packet'
    ),
    jsonb_build_object(
      'pillar', 'No casual invitation sending',
      'buyerValue', 'Automated email remains disabled until provider, sender domain, template, abuse, and monitoring controls are approved.',
      'proof', 'transactionalDeliveryPolicy.directSendEnabled=false'
    ),
    jsonb_build_object(
      'pillar', 'Customer-controlled identity path',
      'buyerValue', 'Buyer domain and IdP ownership are explicit prerequisites, supporting hospital and government security expectations.',
      'proof', 'domain verification and origin registry controls'
    ),
    jsonb_build_object(
      'pillar', 'Auditable activation discipline',
      'buyerValue', 'Every readiness packet is write-before-release and shows blockers rather than hiding them.',
      'proof', 'append-only sales audit event'
    )
  );

  insert into private.sales_production_activation_readiness (
    tenant_id,
    intake_id,
    buyer_tenant_lifecycle_id,
    workspace_id,
    workspace_slug,
    readiness_status,
    domain_verification_policy,
    sso_redirect_policy,
    invitation_template_policy,
    transactional_delivery_policy,
    access_review_automation,
    archive_execution_policy,
    launch_blockers,
    competitive_advantage_signals,
    created_by,
    updated_by,
    boundary
  )
  values (
    target_tenant_id,
    selected_opportunity.intake_id,
    selected_lifecycle.id,
    selected_lifecycle.workspace_id,
    selected_lifecycle.workspace_slug,
    'prepared',
    domain_verification_policy,
    sso_redirect_policy,
    invitation_template_policy,
    transactional_delivery_policy,
    access_review_automation,
    archive_execution_policy,
    launch_blockers,
    competitive_advantage_signals,
    (select auth.uid()),
    (select auth.uid()),
    readiness_boundary
  )
  returning * into created_readiness;

  insert into private.sales_opportunity_audit_events (
    tenant_id, intake_id, actor_user_id, event_type, event_metadata
  )
  values (
    target_tenant_id,
    selected_opportunity.intake_id,
    (select auth.uid()),
    'production-readiness-prepared',
    jsonb_build_object(
      'workspaceId', selected_lifecycle.workspace_id,
      'workspaceSlug', selected_lifecycle.workspace_slug,
      'buyerTenantLifecycleId', selected_lifecycle.id,
      'readinessStatus', created_readiness.readiness_status,
      'domainVerificationStatus', created_readiness.domain_verification_policy ->> 'status',
      'directSendEnabled', false,
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
    selected_lifecycle.workspace_id,
    null,
    (select auth.uid()),
    'production-readiness-prepared',
    jsonb_build_object(
      'intakeId', selected_opportunity.intake_id,
      'salesAuditEventId', created_sales_event_id,
      'readinessStatus', created_readiness.readiness_status,
      'directSendEnabled', false,
      'assuranceLevel', 'aal2',
      'syntheticOnly', true
    )
  );

  return jsonb_build_object(
    'productionActivationReadiness', private.sales_production_activation_readiness_json(created_readiness),
    'created', true,
    'auditEventId', created_sales_event_id,
    'boundary', readiness_boundary
  );
end;
$$;

create or replace function private.record_sales_production_readiness_packet_download(
  p_intake_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_tenant_id uuid;
  selected_readiness private.sales_production_activation_readiness%rowtype;
  created_event_id uuid;
begin
  target_tenant_id := private.require_sales_tenant_admin();
  perform private.require_sales_server_token();

  update private.sales_production_activation_readiness readiness
  set last_packet_generated_at = now(),
      updated_at = now(),
      updated_by = (select auth.uid())
  where readiness.tenant_id = target_tenant_id
    and readiness.intake_id = p_intake_id
    and readiness.readiness_status in ('prepared', 'enterprise-review-required')
  returning * into selected_readiness;

  if selected_readiness.id is null then
    raise exception 'sales-production-readiness-not-prepared';
  end if;

  insert into private.sales_opportunity_audit_events (
    tenant_id, intake_id, actor_user_id, event_type, event_metadata
  )
  values (
    target_tenant_id,
    p_intake_id,
    (select auth.uid()),
    'production-readiness-packet-downloaded',
    jsonb_build_object(
      'workspaceId', selected_readiness.workspace_id,
      'workspaceSlug', selected_readiness.workspace_slug,
      'packetType', 'production-sso-invitation-readiness-packet',
      'format', 'text/markdown',
      'readinessStatus', selected_readiness.readiness_status,
      'domainVerificationStatus', selected_readiness.domain_verification_policy ->> 'status',
      'directSendEnabled', false,
      'noPhiBoundary', true,
      'syntheticOnly', true
    )
  )
  returning id into created_event_id;

  return jsonb_build_object(
    'productionActivationReadiness', private.sales_production_activation_readiness_json(selected_readiness),
    'created', false,
    'auditEventId', created_event_id,
    'boundary', selected_readiness.boundary
  );
end;
$$;

create or replace function public.prepare_sales_production_activation_readiness(p_intake_id text)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.prepare_sales_production_activation_readiness(p_intake_id);
$$;

create or replace function public.record_sales_production_readiness_packet_download(
  p_intake_id text
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_sales_production_readiness_packet_download(p_intake_id);
$$;

revoke all on function private.sales_production_activation_readiness_json(private.sales_production_activation_readiness)
  from public, anon, authenticated, service_role;
revoke all on function private.prepare_sales_production_activation_readiness(text)
  from public, anon, authenticated, service_role;
revoke all on function private.record_sales_production_readiness_packet_download(text)
  from public, anon, authenticated, service_role;
revoke all on function public.prepare_sales_production_activation_readiness(text)
  from public, anon, authenticated, service_role;
revoke all on function public.record_sales_production_readiness_packet_download(text)
  from public, anon, authenticated, service_role;

grant execute on function private.sales_production_activation_readiness_json(private.sales_production_activation_readiness)
  to authenticated;
grant execute on function private.prepare_sales_production_activation_readiness(text)
  to authenticated;
grant execute on function private.record_sales_production_readiness_packet_download(text)
  to authenticated;
grant execute on function public.prepare_sales_production_activation_readiness(text)
  to authenticated;
grant execute on function public.record_sales_production_readiness_packet_download(text)
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
    'schemaVersion', '2026-06-16.7',
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
    'buyerTenantLifecycleAutomation', 'aal2-private-rpc-sso-access-review-archive-controls',
    'productionActivationReadiness', 'aal2-private-rpc-domain-origin-invitation-access-archive-controls'
  );
$$;

comment on table private.sales_production_activation_readiness is
  'Private no-PHI production SSO and invitation delivery readiness controls for opportunity-linked buyer workspaces. Direct Data API access is denied.';
comment on function private.prepare_sales_production_activation_readiness(text) is
  'Prepares production SSO, domain, invitation, delivery, access-review, and archive readiness controls only after buyer tenant lifecycle activation and tenant-admin AAL2 plus server-held authorization.';
comment on function private.record_sales_production_readiness_packet_download(text) is
  'Records audited release of a production SSO and invitation readiness packet for enterprise diligence. No automated send, PHI, live clinical execution, payer submission, patient outreach, or production authorization is created.';
