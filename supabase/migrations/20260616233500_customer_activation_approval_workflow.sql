create table if not exists private.sales_customer_activation_approvals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  intake_id text not null references private.pilot_intake_submissions(intake_id) on delete restrict,
  production_activation_readiness_id uuid not null references private.sales_production_activation_readiness(id) on delete restrict,
  buyer_tenant_lifecycle_id uuid not null references private.sales_buyer_tenant_lifecycles(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  workspace_slug text not null check (workspace_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  approval_status text not null default 'approved-for-paid-pilot-setup'
    check (approval_status in ('approved-for-paid-pilot-setup', 'enterprise-review-required')),
  approval_scope text not null default 'paid-pilot-setup-only'
    check (approval_scope in ('paid-pilot-setup-only')),
  domain_evidence_approval jsonb not null default '{}'::jsonb
    check (jsonb_typeof(domain_evidence_approval) = 'object' and pg_column_size(domain_evidence_approval) <= 32768),
  idp_metadata_approval jsonb not null default '{}'::jsonb
    check (jsonb_typeof(idp_metadata_approval) = 'object' and pg_column_size(idp_metadata_approval) <= 32768),
  invitation_template_approval jsonb not null default '{}'::jsonb
    check (jsonb_typeof(invitation_template_approval) = 'object' and pg_column_size(invitation_template_approval) <= 32768),
  transactional_provider_approval jsonb not null default '{}'::jsonb
    check (jsonb_typeof(transactional_provider_approval) = 'object' and pg_column_size(transactional_provider_approval) <= 32768),
  legal_privacy_security_approval jsonb not null default '{}'::jsonb
    check (jsonb_typeof(legal_privacy_security_approval) = 'object' and pg_column_size(legal_privacy_security_approval) <= 32768),
  final_setup_gate jsonb not null default '{}'::jsonb
    check (jsonb_typeof(final_setup_gate) = 'object' and pg_column_size(final_setup_gate) <= 32768),
  retained_blockers jsonb not null default '[]'::jsonb
    check (jsonb_typeof(retained_blockers) = 'array' and pg_column_size(retained_blockers) <= 32768),
  competitive_advantage_signals jsonb not null default '[]'::jsonb
    check (jsonb_typeof(competitive_advantage_signals) = 'array' and pg_column_size(competitive_advantage_signals) <= 32768),
  last_packet_generated_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  boundary text not null check (char_length(boundary) between 80 and 2000),
  unique (tenant_id, intake_id),
  unique (production_activation_readiness_id)
);

create index if not exists sales_customer_activation_approvals_intake_idx
  on private.sales_customer_activation_approvals(intake_id);
create index if not exists sales_customer_activation_approvals_workspace_id_idx
  on private.sales_customer_activation_approvals(workspace_id);
create index if not exists sales_customer_activation_approvals_workspace_slug_idx
  on private.sales_customer_activation_approvals(workspace_slug);
create index if not exists sales_customer_activation_approvals_readiness_idx
  on private.sales_customer_activation_approvals(production_activation_readiness_id);
create index if not exists sales_customer_activation_approvals_lifecycle_idx
  on private.sales_customer_activation_approvals(buyer_tenant_lifecycle_id);
create index if not exists sales_customer_activation_approvals_created_by_idx
  on private.sales_customer_activation_approvals(created_by);
create index if not exists sales_customer_activation_approvals_updated_by_idx
  on private.sales_customer_activation_approvals(updated_by);

alter table private.sales_customer_activation_approvals enable row level security;
revoke all on private.sales_customer_activation_approvals from public, anon, authenticated;

drop policy if exists sales_customer_activation_approvals_deny_direct_access
  on private.sales_customer_activation_approvals;
create policy sales_customer_activation_approvals_deny_direct_access
on private.sales_customer_activation_approvals
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
      'production-readiness-packet-downloaded',
      'customer-activation-approvals-recorded',
      'customer-activation-approvals-packet-downloaded'
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
      'production-readiness-prepared',
      'customer-activation-approvals-recorded'
    )
  );

create or replace function private.sales_customer_activation_approvals_json(
  approvals private.sales_customer_activation_approvals
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return jsonb_build_object(
    'id', approvals.id,
    'tenantId', approvals.tenant_id,
    'intakeId', approvals.intake_id,
    'productionActivationReadinessId', approvals.production_activation_readiness_id,
    'buyerTenantLifecycleId', approvals.buyer_tenant_lifecycle_id,
    'workspaceId', approvals.workspace_id,
    'workspaceSlug', approvals.workspace_slug,
    'approvalStatus', approvals.approval_status,
    'approvalScope', approvals.approval_scope,
    'domainEvidenceApproval', approvals.domain_evidence_approval,
    'idpMetadataApproval', approvals.idp_metadata_approval,
    'invitationTemplateApproval', approvals.invitation_template_approval,
    'transactionalProviderApproval', approvals.transactional_provider_approval,
    'legalPrivacySecurityApproval', approvals.legal_privacy_security_approval,
    'finalSetupGate', approvals.final_setup_gate,
    'retainedBlockers', approvals.retained_blockers,
    'competitiveAdvantageSignals', approvals.competitive_advantage_signals,
    'lastPacketGeneratedAt', approvals.last_packet_generated_at,
    'createdAt', approvals.created_at,
    'createdBy', approvals.created_by,
    'updatedAt', approvals.updated_at,
    'updatedBy', approvals.updated_by,
    'boundary', approvals.boundary
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
    'customerActivationApprovals', (
      select private.sales_customer_activation_approvals_json(approvals)
      from private.sales_customer_activation_approvals approvals
      where approvals.tenant_id = opportunity.tenant_id
        and approvals.intake_id = opportunity.intake_id
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

create or replace function private.record_sales_customer_activation_approvals(p_intake_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_tenant_id uuid;
  selected_opportunity private.pilot_intake_submissions%rowtype;
  selected_readiness private.sales_production_activation_readiness%rowtype;
  existing_approvals private.sales_customer_activation_approvals%rowtype;
  created_approvals private.sales_customer_activation_approvals%rowtype;
  created_sales_event_id uuid;
  approval_boundary text :=
    'Customer activation approvals for SCRIMED paid pilot setup only. This records SCRIMED written approval to continue governed synthetic evaluation setup and diligence. No PHI, live clinical records, autonomous diagnosis, treatment decisions, payer submission, patient outreach, production connectors, customer SSO cutover, automated bulk invitations, reimbursement guarantee, compliance certification, legal advice, or production healthcare execution is permitted.';
  domain_evidence_approval jsonb;
  idp_metadata_approval jsonb;
  invitation_template_approval jsonb;
  transactional_provider_approval jsonb;
  legal_privacy_security_approval jsonb;
  final_setup_gate jsonb;
  retained_blockers jsonb;
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
    raise exception 'sales-customer-activation-approvals-closed-lost';
  end if;

  select *
  into selected_readiness
  from private.sales_production_activation_readiness
  where tenant_id = target_tenant_id
    and intake_id = p_intake_id
    and readiness_status in ('prepared', 'enterprise-review-required');

  if selected_readiness.id is null then
    raise exception 'sales-customer-activation-production-readiness-required';
  end if;

  select *
  into existing_approvals
  from private.sales_customer_activation_approvals
  where tenant_id = target_tenant_id
    and intake_id = p_intake_id;

  if existing_approvals.id is not null then
    return jsonb_build_object(
      'customerActivationApprovals', private.sales_customer_activation_approvals_json(existing_approvals),
      'created', false,
      'auditEventId', null,
      'boundary', approval_boundary
    );
  end if;

  domain_evidence_approval := jsonb_build_object(
    'status', 'approved',
    'approvedFor', jsonb_build_array(
      'buyer-domain evidence collection',
      'domain allowlist planning',
      'manual paid-pilot workspace labeling'
    ),
    'approvalEvidence', jsonb_build_array(
      'SCRIMED written approval recorded in operator directive',
      'production readiness domain policy exists',
      'business-contact and workflow-scope boundary retained'
    ),
    'retainedBlockers', jsonb_build_array(
      'customer SSO cutover',
      'unverified expansion domains',
      'production connector credentials'
    ),
    'owner', 'SCRIMED tenant-admin',
    'productionGate', 'Buyer security or IT owner must verify domain ownership before SSO, automated invitations, or expansion.'
  );

  idp_metadata_approval := jsonb_build_object(
    'status', 'review-required',
    'approvedFor', jsonb_build_array(
      'IdP metadata request checklist',
      'SAML/OIDC discovery planning',
      'emergency access procedure drafting'
    ),
    'approvalEvidence', jsonb_build_array(
      'production readiness origin registry exists',
      'no wildcard callback policy retained',
      'customer IdP metadata not yet accepted as production-ready'
    ),
    'retainedBlockers', jsonb_build_array(
      'customer SSO cutover',
      'session policy enforcement for production',
      'identity-provider certificate rollover operations'
    ),
    'owner', 'SCRIMED identity and security reviewer',
    'productionGate', 'Buyer IdP metadata, callback URLs, logout URLs, session policy, and emergency access runbook require separate buyer and SCRIMED approval.'
  );

  invitation_template_approval := jsonb_build_object(
    'status', 'approved',
    'approvedFor', jsonb_build_array(
      'manual onboarding packet language',
      'buyer meeting follow-up draft',
      'synthetic pilot setup instructions'
    ),
    'approvalEvidence', jsonb_build_array(
      'required synthetic boundary disclosures retained',
      'no autonomous clinical claims allowed',
      'no PHI request language allowed'
    ),
    'retainedBlockers', jsonb_build_array(
      'automated template delivery',
      'bulk invitation campaigns',
      'patient-facing messaging'
    ),
    'owner', 'SCRIMED legal/privacy reviewer',
    'productionGate', 'Automated delivery templates require transactional provider, legal/privacy/security, buyer sponsor, and abuse-monitoring approval.'
  );

  transactional_provider_approval := jsonb_build_object(
    'status', 'review-required',
    'approvedFor', jsonb_build_array(
      'provider selection',
      'sender-domain verification planning',
      'bounce and complaint monitoring checklist'
    ),
    'approvalEvidence', jsonb_build_array(
      'directSendEnabled remains false',
      'manual packet-gated delivery remains default',
      'rate-limit and abuse-control requirements are recorded'
    ),
    'retainedBlockers', jsonb_build_array(
      'direct automated invitation send',
      'bulk sends',
      'production sender-domain use before verification'
    ),
    'owner', 'SCRIMED platform operations',
    'productionGate', 'Approve transactional provider, sender domain, SPF/DKIM/DMARC posture, complaint handling, and support ownership before direct send.'
  );

  legal_privacy_security_approval := jsonb_build_object(
    'status', 'approved',
    'approvedFor', jsonb_build_array(
      'SCRIMED-side paid pilot setup',
      'synthetic evaluation diligence',
      'security questionnaire preparation',
      'legal/privacy review routing'
    ),
    'approvalEvidence', jsonb_build_array(
      'written SCRIMED approval recorded',
      'no-PHI boundary retained',
      'buyer legal/privacy/security approval required before expansion'
    ),
    'retainedBlockers', jsonb_build_array(
      'BAA/DPA execution',
      'production data processing',
      'compliance certification claims',
      'regulated clinical workflow execution'
    ),
    'owner', 'SCRIMED founder and tenant-admin',
    'productionGate', 'Signed buyer terms, privacy/security review, BAA/DPA path if applicable, incident response plan, and production operating procedures are required before live scope.'
  );

  final_setup_gate := jsonb_build_object(
    'status', 'approved-for-paid-pilot-setup',
    'approvalScope', 'paid-pilot-setup-only',
    'allowedActions', jsonb_build_array(
      'configure buyer-specific protected synthetic workspace',
      'prepare manual onboarding packets',
      'schedule buyer enterprise assessments',
      'release audited synthetic proof packets after human review',
      'route legal, privacy, security, and procurement diligence',
      'plan interoperability connectors without credentials, live data, or production access'
    ),
    'explicitlyBlockedActions', jsonb_build_array(
      'PHI ingestion',
      'live clinical record processing',
      'autonomous diagnosis or treatment recommendations',
      'payer submission',
      'patient outreach',
      'production connector execution',
      'customer SSO cutover',
      'automated bulk invitation delivery',
      'reimbursement guarantee',
      'compliance certification'
    ),
    'approvalSource', 'scrimed-founder-written-approval',
    'buyerApprovalRequiredBeforeExpansion', true,
    'productionGate', 'This gate unblocks paid pilot setup only. Live healthcare operations require separate written buyer and SCRIMED approvals with legal, privacy, security, clinical, and connector validation.'
  );

  retained_blockers := jsonb_build_array(
    'PHI and live clinical records remain blocked.',
    'Autonomous diagnosis, treatment decisions, and clinical execution remain blocked.',
    'Payer submission, claims submission, prior authorization submission, and reimbursement determinations remain blocked.',
    'Patient outreach, patient instructions, and patient-facing communications remain blocked.',
    'Customer SSO cutover remains blocked until buyer IdP and security approvals are recorded.',
    'Automated bulk invitations and direct email send remain blocked until transactional provider controls are approved.',
    'Production connectors, credentials, EHR/FHIR/HL7/DICOM/X12 integrations, and live data processing remain blocked until signed scope and validation are complete.',
    'BAA/DPA, security review, privacy review, incident response, support model, and clinical governance must be completed before live scope.'
  );

  competitive_advantage_signals := jsonb_build_array(
    jsonb_build_object(
      'pillar', 'Hard-gate clarity',
      'buyerValue', 'SCRIMED can move quickly on paid pilots without pretending that pilot setup equals live clinical authorization.',
      'proof', 'customer activation approval packet'
    ),
    jsonb_build_object(
      'pillar', 'Enterprise-safe sales motion',
      'buyerValue', 'Every activation step is auditable, scoped, and bounded before buyer expansion.',
      'proof', 'AAL2 tenant-admin RPC and append-only audit events'
    ),
    jsonb_build_object(
      'pillar', 'Trust before automation',
      'buyerValue', 'Manual packets, explicit blockers, and human review protect buyers from casual AI deployment risk.',
      'proof', 'finalSetupGate.explicitlyBlockedActions'
    ),
    jsonb_build_object(
      'pillar', 'Interoperability-ready but not reckless',
      'buyerValue', 'FHIR, HL7, DICOM, X12, and future connector planning can begin without live credentials or patient data.',
      'proof', 'allowed setup actions plus retained production connector blocker'
    )
  );

  insert into private.sales_customer_activation_approvals (
    tenant_id,
    intake_id,
    production_activation_readiness_id,
    buyer_tenant_lifecycle_id,
    workspace_id,
    workspace_slug,
    approval_status,
    approval_scope,
    domain_evidence_approval,
    idp_metadata_approval,
    invitation_template_approval,
    transactional_provider_approval,
    legal_privacy_security_approval,
    final_setup_gate,
    retained_blockers,
    competitive_advantage_signals,
    created_by,
    updated_by,
    boundary
  )
  values (
    target_tenant_id,
    selected_opportunity.intake_id,
    selected_readiness.id,
    selected_readiness.buyer_tenant_lifecycle_id,
    selected_readiness.workspace_id,
    selected_readiness.workspace_slug,
    'approved-for-paid-pilot-setup',
    'paid-pilot-setup-only',
    domain_evidence_approval,
    idp_metadata_approval,
    invitation_template_approval,
    transactional_provider_approval,
    legal_privacy_security_approval,
    final_setup_gate,
    retained_blockers,
    competitive_advantage_signals,
    (select auth.uid()),
    (select auth.uid()),
    approval_boundary
  )
  returning * into created_approvals;

  insert into private.sales_opportunity_audit_events (
    tenant_id, intake_id, actor_user_id, event_type, event_metadata
  )
  values (
    target_tenant_id,
    selected_opportunity.intake_id,
    (select auth.uid()),
    'customer-activation-approvals-recorded',
    jsonb_build_object(
      'workspaceId', selected_readiness.workspace_id,
      'workspaceSlug', selected_readiness.workspace_slug,
      'productionActivationReadinessId', selected_readiness.id,
      'approvalStatus', created_approvals.approval_status,
      'approvalScope', created_approvals.approval_scope,
      'allowedActions', created_approvals.final_setup_gate -> 'allowedActions',
      'explicitlyBlockedActions', created_approvals.final_setup_gate -> 'explicitlyBlockedActions',
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
    selected_readiness.workspace_id,
    null,
    (select auth.uid()),
    'customer-activation-approvals-recorded',
    jsonb_build_object(
      'intakeId', selected_opportunity.intake_id,
      'salesAuditEventId', created_sales_event_id,
      'approvalStatus', created_approvals.approval_status,
      'approvalScope', created_approvals.approval_scope,
      'assuranceLevel', 'aal2',
      'paidPilotSetupOnly', true,
      'syntheticOnly', true
    )
  );

  return jsonb_build_object(
    'customerActivationApprovals', private.sales_customer_activation_approvals_json(created_approvals),
    'created', true,
    'auditEventId', created_sales_event_id,
    'boundary', approval_boundary
  );
end;
$$;

create or replace function private.record_sales_customer_activation_approvals_packet_download(
  p_intake_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_tenant_id uuid;
  selected_approvals private.sales_customer_activation_approvals%rowtype;
  created_event_id uuid;
begin
  target_tenant_id := private.require_sales_tenant_admin();
  perform private.require_sales_server_token();

  update private.sales_customer_activation_approvals approvals
  set last_packet_generated_at = now(),
      updated_at = now(),
      updated_by = (select auth.uid())
  where approvals.tenant_id = target_tenant_id
    and approvals.intake_id = p_intake_id
    and approvals.approval_status in ('approved-for-paid-pilot-setup', 'enterprise-review-required')
  returning * into selected_approvals;

  if selected_approvals.id is null then
    raise exception 'sales-customer-activation-approvals-not-recorded';
  end if;

  insert into private.sales_opportunity_audit_events (
    tenant_id, intake_id, actor_user_id, event_type, event_metadata
  )
  values (
    target_tenant_id,
    p_intake_id,
    (select auth.uid()),
    'customer-activation-approvals-packet-downloaded',
    jsonb_build_object(
      'workspaceId', selected_approvals.workspace_id,
      'workspaceSlug', selected_approvals.workspace_slug,
      'packetType', 'customer-activation-approval-packet',
      'format', 'text/markdown',
      'approvalStatus', selected_approvals.approval_status,
      'approvalScope', selected_approvals.approval_scope,
      'paidPilotSetupOnly', true,
      'noPhiBoundary', true,
      'syntheticOnly', true
    )
  )
  returning id into created_event_id;

  return jsonb_build_object(
    'customerActivationApprovals', private.sales_customer_activation_approvals_json(selected_approvals),
    'created', false,
    'auditEventId', created_event_id,
    'boundary', selected_approvals.boundary
  );
end;
$$;

create or replace function public.record_sales_customer_activation_approvals(p_intake_id text)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_sales_customer_activation_approvals(p_intake_id);
$$;

create or replace function public.record_sales_customer_activation_approvals_packet_download(
  p_intake_id text
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_sales_customer_activation_approvals_packet_download(p_intake_id);
$$;

revoke all on function private.sales_customer_activation_approvals_json(private.sales_customer_activation_approvals)
  from public, anon, authenticated, service_role;
revoke all on function private.record_sales_customer_activation_approvals(text)
  from public, anon, authenticated, service_role;
revoke all on function private.record_sales_customer_activation_approvals_packet_download(text)
  from public, anon, authenticated, service_role;
revoke all on function public.record_sales_customer_activation_approvals(text)
  from public, anon, authenticated, service_role;
revoke all on function public.record_sales_customer_activation_approvals_packet_download(text)
  from public, anon, authenticated, service_role;

grant execute on function private.sales_customer_activation_approvals_json(private.sales_customer_activation_approvals)
  to authenticated;
grant execute on function private.record_sales_customer_activation_approvals(text)
  to authenticated;
grant execute on function private.record_sales_customer_activation_approvals_packet_download(text)
  to authenticated;
grant execute on function public.record_sales_customer_activation_approvals(text)
  to authenticated;
grant execute on function public.record_sales_customer_activation_approvals_packet_download(text)
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
    'schemaVersion', '2026-06-16.8',
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
    'productionActivationReadiness', 'aal2-private-rpc-domain-origin-invitation-access-archive-controls',
    'customerActivationApprovals', 'aal2-private-rpc-paid-pilot-setup-approval-hard-gates-retained'
  );
$$;

comment on table private.sales_customer_activation_approvals is
  'Private no-PHI customer activation approval records for opportunity-linked paid pilot setup. Direct Data API access is denied.';
comment on function private.record_sales_customer_activation_approvals(text) is
  'Records SCRIMED written approval for paid pilot setup only after production readiness exists. PHI, live clinical execution, patient outreach, payer submission, customer SSO cutover, direct bulk invitation delivery, and production connectors remain blocked.';
comment on function private.record_sales_customer_activation_approvals_packet_download(text) is
  'Records audited release of a customer activation approval packet. The packet is a paid-pilot setup artifact and does not create live healthcare, legal, security, privacy, compliance, reimbursement, or production authorization.';
