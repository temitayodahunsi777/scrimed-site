create table if not exists private.sales_buyer_diligence_rooms (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  intake_id text not null references private.pilot_intake_submissions(intake_id) on delete restrict,
  customer_activation_approval_id uuid not null references private.sales_customer_activation_approvals(id) on delete restrict,
  production_activation_readiness_id uuid not null references private.sales_production_activation_readiness(id) on delete restrict,
  buyer_tenant_lifecycle_id uuid not null references private.sales_buyer_tenant_lifecycles(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  workspace_slug text not null check (workspace_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  diligence_status text not null default 'prepared'
    check (diligence_status in ('prepared', 'signed-controls-review-required', 'ready-for-contract-review')),
  evidence_scope text not null default 'metadata-only'
    check (evidence_scope in ('metadata-only')),
  evidence_submission_policy jsonb not null default '{}'::jsonb
    check (jsonb_typeof(evidence_submission_policy) = 'object' and pg_column_size(evidence_submission_policy) <= 32768),
  domain_proof_evidence jsonb not null default '{}'::jsonb
    check (jsonb_typeof(domain_proof_evidence) = 'object' and pg_column_size(domain_proof_evidence) <= 32768),
  idp_metadata_evidence jsonb not null default '{}'::jsonb
    check (jsonb_typeof(idp_metadata_evidence) = 'object' and pg_column_size(idp_metadata_evidence) <= 32768),
  legal_privacy_security_controls jsonb not null default '{}'::jsonb
    check (jsonb_typeof(legal_privacy_security_controls) = 'object' and pg_column_size(legal_privacy_security_controls) <= 32768),
  baa_dpa_status jsonb not null default '{}'::jsonb
    check (jsonb_typeof(baa_dpa_status) = 'object' and pg_column_size(baa_dpa_status) <= 32768),
  transactional_provider_decision jsonb not null default '{}'::jsonb
    check (jsonb_typeof(transactional_provider_decision) = 'object' and pg_column_size(transactional_provider_decision) <= 32768),
  production_connector_readiness jsonb not null default '{}'::jsonb
    check (jsonb_typeof(production_connector_readiness) = 'object' and pg_column_size(production_connector_readiness) <= 32768),
  signed_controls_register jsonb not null default '{}'::jsonb
    check (jsonb_typeof(signed_controls_register) = 'object' and pg_column_size(signed_controls_register) <= 32768),
  retained_blockers jsonb not null default '[]'::jsonb
    check (jsonb_typeof(retained_blockers) = 'array' and pg_column_size(retained_blockers) <= 32768),
  next_required_approvals jsonb not null default '[]'::jsonb
    check (jsonb_typeof(next_required_approvals) = 'array' and pg_column_size(next_required_approvals) <= 32768),
  competitive_advantage_signals jsonb not null default '[]'::jsonb
    check (jsonb_typeof(competitive_advantage_signals) = 'array' and pg_column_size(competitive_advantage_signals) <= 32768),
  last_packet_generated_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  boundary text not null check (char_length(boundary) between 80 and 2200),
  unique (tenant_id, intake_id),
  unique (customer_activation_approval_id)
);

create index if not exists sales_buyer_diligence_rooms_intake_idx
  on private.sales_buyer_diligence_rooms(intake_id);
create index if not exists sales_buyer_diligence_rooms_workspace_id_idx
  on private.sales_buyer_diligence_rooms(workspace_id);
create index if not exists sales_buyer_diligence_rooms_workspace_slug_idx
  on private.sales_buyer_diligence_rooms(workspace_slug);
create index if not exists sales_buyer_diligence_rooms_activation_approval_idx
  on private.sales_buyer_diligence_rooms(customer_activation_approval_id);
create index if not exists sales_buyer_diligence_rooms_readiness_idx
  on private.sales_buyer_diligence_rooms(production_activation_readiness_id);
create index if not exists sales_buyer_diligence_rooms_lifecycle_idx
  on private.sales_buyer_diligence_rooms(buyer_tenant_lifecycle_id);
create index if not exists sales_buyer_diligence_rooms_created_by_idx
  on private.sales_buyer_diligence_rooms(created_by);
create index if not exists sales_buyer_diligence_rooms_updated_by_idx
  on private.sales_buyer_diligence_rooms(updated_by);

alter table private.sales_buyer_diligence_rooms enable row level security;
revoke all on private.sales_buyer_diligence_rooms from public, anon, authenticated;

drop policy if exists sales_buyer_diligence_rooms_deny_direct_access
  on private.sales_buyer_diligence_rooms;
create policy sales_buyer_diligence_rooms_deny_direct_access
on private.sales_buyer_diligence_rooms
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
      'customer-activation-approvals-packet-downloaded',
      'buyer-diligence-room-prepared',
      'buyer-diligence-packet-downloaded'
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
      'customer-activation-approvals-recorded',
      'buyer-diligence-room-prepared'
    )
  );

create or replace function private.sales_buyer_diligence_room_json(
  room private.sales_buyer_diligence_rooms
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return jsonb_build_object(
    'id', room.id,
    'tenantId', room.tenant_id,
    'intakeId', room.intake_id,
    'customerActivationApprovalId', room.customer_activation_approval_id,
    'productionActivationReadinessId', room.production_activation_readiness_id,
    'buyerTenantLifecycleId', room.buyer_tenant_lifecycle_id,
    'workspaceId', room.workspace_id,
    'workspaceSlug', room.workspace_slug,
    'diligenceStatus', room.diligence_status,
    'evidenceScope', room.evidence_scope,
    'evidenceSubmissionPolicy', room.evidence_submission_policy,
    'domainProofEvidence', room.domain_proof_evidence,
    'idpMetadataEvidence', room.idp_metadata_evidence,
    'legalPrivacySecurityControls', room.legal_privacy_security_controls,
    'baaDpaStatus', room.baa_dpa_status,
    'transactionalProviderDecision', room.transactional_provider_decision,
    'productionConnectorReadiness', room.production_connector_readiness,
    'signedControlsRegister', room.signed_controls_register,
    'retainedBlockers', room.retained_blockers,
    'nextRequiredApprovals', room.next_required_approvals,
    'competitiveAdvantageSignals', room.competitive_advantage_signals,
    'lastPacketGeneratedAt', room.last_packet_generated_at,
    'createdAt', room.created_at,
    'createdBy', room.created_by,
    'updatedAt', room.updated_at,
    'updatedBy', room.updated_by,
    'boundary', room.boundary
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
    'buyerDiligenceRoom', (
      select private.sales_buyer_diligence_room_json(room)
      from private.sales_buyer_diligence_rooms room
      where room.tenant_id = opportunity.tenant_id
        and room.intake_id = opportunity.intake_id
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

create or replace function private.prepare_sales_buyer_diligence_room(p_intake_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_tenant_id uuid;
  selected_opportunity private.pilot_intake_submissions%rowtype;
  selected_approvals private.sales_customer_activation_approvals%rowtype;
  existing_room private.sales_buyer_diligence_rooms%rowtype;
  created_room private.sales_buyer_diligence_rooms%rowtype;
  created_sales_event_id uuid;
  diligence_boundary text :=
    'Buyer evidence and signed controls diligence rooms are metadata-only for SCRIMED governed synthetic paid pilot diligence. Do not upload PHI, patient identifiers, live clinical records, payer member data, secrets, private keys, IdP certificates, production credentials, legal advice, compliance certification, payer authorization, patient outreach approval, autonomous care approval, or live healthcare execution authorization.';
  evidence_submission_policy jsonb;
  domain_proof_evidence jsonb;
  idp_metadata_evidence jsonb;
  legal_privacy_security_controls jsonb;
  baa_dpa_status jsonb;
  transactional_provider_decision jsonb;
  production_connector_readiness jsonb;
  signed_controls_register jsonb;
  retained_blockers jsonb;
  next_required_approvals jsonb;
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
    raise exception 'sales-buyer-diligence-closed-lost';
  end if;

  select *
  into selected_approvals
  from private.sales_customer_activation_approvals
  where tenant_id = target_tenant_id
    and intake_id = p_intake_id
    and approval_status in ('approved-for-paid-pilot-setup', 'enterprise-review-required');

  if selected_approvals.id is null then
    raise exception 'sales-buyer-diligence-activation-approval-required';
  end if;

  select *
  into existing_room
  from private.sales_buyer_diligence_rooms
  where tenant_id = target_tenant_id
    and intake_id = p_intake_id;

  if existing_room.id is not null then
    return jsonb_build_object(
      'buyerDiligenceRoom', private.sales_buyer_diligence_room_json(existing_room),
      'created', false,
      'auditEventId', null,
      'boundary', diligence_boundary
    );
  end if;

  evidence_submission_policy := jsonb_build_object(
    'status', 'metadata-ready',
    'requiredEvidence', jsonb_build_array(
      'buyer-designated document owner',
      'secure exchange channel selected outside SCRIMED',
      'metadata-only evidence index',
      'legal hold and retention owner identified'
    ),
    'acceptedEvidenceMetadata', jsonb_build_array(
      'document type',
      'owner',
      'approval status',
      'review date',
      'expiration or renewal date',
      'external storage location label without secrets'
    ),
    'prohibitedUploads', jsonb_build_array(
      'PHI',
      'patient identifiers',
      'live clinical records',
      'payer member data',
      'IdP certificates',
      'private keys',
      'production credentials',
      'BAA/DPA source documents until storage is approved'
    ),
    'owner', 'SCRIMED tenant-admin and buyer document owner',
    'productionGate', 'Approve secure document storage, DLP, malware scanning, retention, legal hold, and buyer access policy before storing sensitive diligence files in SCRIMED.'
  );

  domain_proof_evidence := jsonb_build_object(
    'status', 'buyer-evidence-required',
    'requiredEvidence', jsonb_build_array(
      'buyer security owner confirmation',
      'domain ownership proof',
      'approved invitation domain allowlist',
      'security contact escalation route'
    ),
    'acceptedEvidenceMetadata', jsonb_build_array(
      'domain name',
      'approver role',
      'approval date',
      'verification method',
      'renewal cadence'
    ),
    'prohibitedUploads', jsonb_build_array(
      'DNS provider credentials',
      'security console screenshots with secrets',
      'private keys'
    ),
    'owner', 'Buyer security owner',
    'productionGate', 'Domain proof must be verified before customer SSO cutover, automated invitations, or tenant expansion.'
  );

  idp_metadata_evidence := jsonb_build_object(
    'status', 'scrimed-review-required',
    'requiredEvidence', jsonb_build_array(
      'IdP type',
      'SAML or OIDC configuration owner',
      'callback URL review',
      'logout URL review',
      'emergency access procedure',
      'certificate rotation owner'
    ),
    'acceptedEvidenceMetadata', jsonb_build_array(
      'IdP vendor',
      'configuration owner',
      'metadata requested date',
      'callback URL status',
      'certificate expiry date without certificate body'
    ),
    'prohibitedUploads', jsonb_build_array(
      'IdP certificates',
      'client secrets',
      'signing keys',
      'admin console credentials'
    ),
    'owner', 'SCRIMED identity/security reviewer and buyer IdP admin',
    'productionGate', 'IdP metadata and session policy require separate buyer and SCRIMED written approval before SSO cutover.'
  );

  legal_privacy_security_controls := jsonb_build_object(
    'status', 'in-review',
    'requiredApprovals', jsonb_build_array(
      'buyer legal',
      'buyer privacy',
      'buyer security',
      'SCRIMED legal/privacy/security reviewer',
      'SCRIMED founder approval'
    ),
    'signedControlArtifacts', jsonb_build_array(
      'security questionnaire status',
      'privacy review status',
      'incident response owner',
      'support and escalation model',
      'subprocessor review status'
    ),
    'retainedBlockers', jsonb_build_array(
      'compliance certification claims',
      'regulated production processing',
      'breach determination',
      'formal legal opinion'
    ),
    'productionGate', 'Signed enterprise controls and counsel-reviewed terms are required before production healthcare processing.'
  );

  baa_dpa_status := jsonb_build_object(
    'status', 'in-review',
    'requiredApprovals', jsonb_build_array(
      'buyer legal/privacy',
      'SCRIMED legal/privacy',
      'covered entity or business associate role confirmation',
      'data residency and retention owner'
    ),
    'signedControlArtifacts', jsonb_build_array(
      'BAA applicability status',
      'DPA applicability status',
      'data processing scope',
      'retention and deletion schedule',
      'subprocessor approval status'
    ),
    'retainedBlockers', jsonb_build_array(
      'PHI processing',
      'production data export',
      'retention deletion execution',
      'cross-border data transfer'
    ),
    'productionGate', 'BAA/DPA path must be signed where applicable before PHI, live clinical data, or regulated production processing.'
  );

  transactional_provider_decision := jsonb_build_object(
    'status', 'in-review',
    'requiredApprovals', jsonb_build_array(
      'SCRIMED platform operations',
      'buyer communications owner',
      'SCRIMED legal/privacy/security reviewer'
    ),
    'signedControlArtifacts', jsonb_build_array(
      'approved provider',
      'verified sender domain',
      'SPF/DKIM/DMARC status',
      'bounce and complaint monitoring',
      'abuse response path',
      'send rate limits'
    ),
    'retainedBlockers', jsonb_build_array(
      'direct automated invitation sending',
      'bulk sends',
      'patient-facing communication',
      'unmonitored sender domain'
    ),
    'productionGate', 'Provider, sender domain, template, rate-limit, complaint, and support controls require signed approval before direct-send invitations.'
  );

  production_connector_readiness := jsonb_build_object(
    'status', 'blocked',
    'requiredApprovals', jsonb_build_array(
      'buyer technical owner',
      'buyer security',
      'SCRIMED interoperability owner',
      'SCRIMED privacy/security reviewer',
      'clinical governance owner when workflow touches care delivery'
    ),
    'signedControlArtifacts', jsonb_build_array(
      'FHIR/HL7/DICOM/X12 connector scope',
      'test environment authorization',
      'credential handling procedure',
      'audit logging path',
      'rollback and shutdown plan',
      'synthetic conformance evidence'
    ),
    'retainedBlockers', jsonb_build_array(
      'production credentials',
      'live EHR/FHIR/HL7/DICOM/X12 access',
      'payer transaction submission',
      'patient outreach',
      'clinical workflow execution'
    ),
    'productionGate', 'Production connectors require signed scope, test environment validation, credential vaulting, audit logging, incident response, and human-review controls.'
  );

  signed_controls_register := jsonb_build_object(
    'status', 'in-review',
    'requiredApprovals', jsonb_build_array(
      'buyer executive sponsor',
      'buyer security/privacy/legal',
      'buyer workflow owner',
      'SCRIMED founder',
      'SCRIMED implementation owner'
    ),
    'signedControlArtifacts', jsonb_build_array(
      'commercial order form or SOW status',
      'success criteria',
      'data boundary',
      'support SLA',
      'incident response route',
      'pilot exit criteria',
      'production expansion criteria'
    ),
    'retainedBlockers', jsonb_build_array(
      'live clinical claims',
      'reimbursement guarantees',
      'autonomous care authorization',
      'unbounded user expansion'
    ),
    'productionGate', 'The signed controls register must be complete before production-adjacent activation or buyer expansion.'
  );

  retained_blockers := jsonb_build_array(
    'Sensitive buyer documents are not stored in SCRIMED until secure storage, DLP, malware scanning, retention, and legal hold controls are approved.',
    'PHI, patient identifiers, live clinical records, payer member data, and production credentials remain blocked.',
    'Customer SSO cutover remains blocked until buyer IdP metadata and session controls are approved.',
    'Automated bulk invitations remain blocked until transactional provider controls are signed.',
    'FHIR, HL7, DICOM, X12, payer, EHR, and device production connectors remain blocked until signed scope and validation are complete.',
    'Autonomous diagnosis, treatment decisions, patient outreach, payer submission, reimbursement determinations, and live workflow execution remain blocked.'
  );

  next_required_approvals := jsonb_build_array(
    'Buyer security owner confirms domain ownership and escalation route.',
    'Buyer IdP admin confirms SAML/OIDC metadata path without sharing secrets in SCRIMED.',
    'Buyer and SCRIMED legal/privacy determine BAA/DPA applicability and signed document path.',
    'SCRIMED platform operations selects transactional provider and sender-domain controls.',
    'Buyer and SCRIMED interoperability owners approve test-only connector scope before any credentials.',
    'Buyer executive sponsor and SCRIMED founder approve signed controls register before production-adjacent activation.'
  );

  competitive_advantage_signals := jsonb_build_array(
    jsonb_build_object(
      'pillar', 'Diligence without data sprawl',
      'buyerValue', 'SCRIMED can organize enterprise diligence without becoming an unsafe repository for sensitive documents too early.',
      'proof', 'metadata-only buyer diligence room'
    ),
    jsonb_build_object(
      'pillar', 'Signed controls before production',
      'buyerValue', 'Buyers see a precise path from pilot setup to signed controls without confusing setup approval with live healthcare authorization.',
      'proof', 'signed controls register and retained blockers'
    ),
    jsonb_build_object(
      'pillar', 'Interoperability readiness with restraint',
      'buyerValue', 'FHIR, HL7, DICOM, X12, payer, and device connector planning can proceed while production credentials stay blocked.',
      'proof', 'productionConnectorReadiness.status=blocked'
    ),
    jsonb_build_object(
      'pillar', 'Free-tier operational workaround',
      'buyerValue', 'Audited Markdown diligence packets support buyer review even before paid document storage or unattended AAL2 mutation smoke is introduced.',
      'proof', 'write-before-release buyer diligence packet'
    )
  );

  insert into private.sales_buyer_diligence_rooms (
    tenant_id,
    intake_id,
    customer_activation_approval_id,
    production_activation_readiness_id,
    buyer_tenant_lifecycle_id,
    workspace_id,
    workspace_slug,
    diligence_status,
    evidence_scope,
    evidence_submission_policy,
    domain_proof_evidence,
    idp_metadata_evidence,
    legal_privacy_security_controls,
    baa_dpa_status,
    transactional_provider_decision,
    production_connector_readiness,
    signed_controls_register,
    retained_blockers,
    next_required_approvals,
    competitive_advantage_signals,
    created_by,
    updated_by,
    boundary
  )
  values (
    target_tenant_id,
    selected_opportunity.intake_id,
    selected_approvals.id,
    selected_approvals.production_activation_readiness_id,
    selected_approvals.buyer_tenant_lifecycle_id,
    selected_approvals.workspace_id,
    selected_approvals.workspace_slug,
    'prepared',
    'metadata-only',
    evidence_submission_policy,
    domain_proof_evidence,
    idp_metadata_evidence,
    legal_privacy_security_controls,
    baa_dpa_status,
    transactional_provider_decision,
    production_connector_readiness,
    signed_controls_register,
    retained_blockers,
    next_required_approvals,
    competitive_advantage_signals,
    (select auth.uid()),
    (select auth.uid()),
    diligence_boundary
  )
  returning * into created_room;

  insert into private.sales_opportunity_audit_events (
    tenant_id, intake_id, actor_user_id, event_type, event_metadata
  )
  values (
    target_tenant_id,
    selected_opportunity.intake_id,
    (select auth.uid()),
    'buyer-diligence-room-prepared',
    jsonb_build_object(
      'workspaceId', selected_approvals.workspace_id,
      'workspaceSlug', selected_approvals.workspace_slug,
      'customerActivationApprovalId', selected_approvals.id,
      'diligenceStatus', created_room.diligence_status,
      'evidenceScope', created_room.evidence_scope,
      'nextRequiredApprovals', created_room.next_required_approvals,
      'sensitiveDocumentStorageEnabled', false,
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
    selected_approvals.workspace_id,
    null,
    (select auth.uid()),
    'buyer-diligence-room-prepared',
    jsonb_build_object(
      'intakeId', selected_opportunity.intake_id,
      'salesAuditEventId', created_sales_event_id,
      'diligenceStatus', created_room.diligence_status,
      'evidenceScope', created_room.evidence_scope,
      'assuranceLevel', 'aal2',
      'metadataOnly', true,
      'syntheticOnly', true
    )
  );

  return jsonb_build_object(
    'buyerDiligenceRoom', private.sales_buyer_diligence_room_json(created_room),
    'created', true,
    'auditEventId', created_sales_event_id,
    'boundary', diligence_boundary
  );
end;
$$;

create or replace function private.record_sales_buyer_diligence_room_packet_download(
  p_intake_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_tenant_id uuid;
  selected_room private.sales_buyer_diligence_rooms%rowtype;
  created_event_id uuid;
begin
  target_tenant_id := private.require_sales_tenant_admin();
  perform private.require_sales_server_token();

  update private.sales_buyer_diligence_rooms room
  set last_packet_generated_at = now(),
      updated_at = now(),
      updated_by = (select auth.uid())
  where room.tenant_id = target_tenant_id
    and room.intake_id = p_intake_id
    and room.diligence_status in ('prepared', 'signed-controls-review-required', 'ready-for-contract-review')
  returning * into selected_room;

  if selected_room.id is null then
    raise exception 'sales-buyer-diligence-room-not-prepared';
  end if;

  insert into private.sales_opportunity_audit_events (
    tenant_id, intake_id, actor_user_id, event_type, event_metadata
  )
  values (
    target_tenant_id,
    p_intake_id,
    (select auth.uid()),
    'buyer-diligence-packet-downloaded',
    jsonb_build_object(
      'workspaceId', selected_room.workspace_id,
      'workspaceSlug', selected_room.workspace_slug,
      'packetType', 'buyer-evidence-signed-controls-diligence-packet',
      'format', 'text/markdown',
      'diligenceStatus', selected_room.diligence_status,
      'evidenceScope', selected_room.evidence_scope,
      'metadataOnly', true,
      'noPhiBoundary', true,
      'syntheticOnly', true
    )
  )
  returning id into created_event_id;

  return jsonb_build_object(
    'buyerDiligenceRoom', private.sales_buyer_diligence_room_json(selected_room),
    'created', false,
    'auditEventId', created_event_id,
    'boundary', selected_room.boundary
  );
end;
$$;

create or replace function public.prepare_sales_buyer_diligence_room(p_intake_id text)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.prepare_sales_buyer_diligence_room(p_intake_id);
$$;

create or replace function public.record_sales_buyer_diligence_room_packet_download(
  p_intake_id text
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_sales_buyer_diligence_room_packet_download(p_intake_id);
$$;

revoke all on function private.sales_buyer_diligence_room_json(private.sales_buyer_diligence_rooms)
  from public, anon, authenticated, service_role;
revoke all on function private.prepare_sales_buyer_diligence_room(text)
  from public, anon, authenticated, service_role;
revoke all on function private.record_sales_buyer_diligence_room_packet_download(text)
  from public, anon, authenticated, service_role;
revoke all on function public.prepare_sales_buyer_diligence_room(text)
  from public, anon, authenticated, service_role;
revoke all on function public.record_sales_buyer_diligence_room_packet_download(text)
  from public, anon, authenticated, service_role;

grant execute on function private.sales_buyer_diligence_room_json(private.sales_buyer_diligence_rooms)
  to authenticated;
grant execute on function private.prepare_sales_buyer_diligence_room(text)
  to authenticated;
grant execute on function private.record_sales_buyer_diligence_room_packet_download(text)
  to authenticated;
grant execute on function public.prepare_sales_buyer_diligence_room(text)
  to authenticated;
grant execute on function public.record_sales_buyer_diligence_room_packet_download(text)
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
    'schemaVersion', '2026-06-17.1',
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
    'customerActivationApprovals', 'aal2-private-rpc-paid-pilot-setup-approval-hard-gates-retained',
    'buyerDiligenceRooms', 'aal2-private-rpc-metadata-only-signed-controls-diligence'
  );
$$;

comment on table private.sales_buyer_diligence_rooms is
  'Private no-PHI buyer evidence and signed controls diligence rooms for opportunity-linked paid pilot setup. Direct Data API access is denied.';
comment on function private.prepare_sales_buyer_diligence_room(text) is
  'Prepares a metadata-only buyer diligence room after customer activation approvals exist. Sensitive documents, PHI, secrets, IdP certificates, production credentials, live clinical data, and production connectors remain blocked.';
comment on function private.record_sales_buyer_diligence_room_packet_download(text) is
  'Records audited release of a buyer evidence and signed controls diligence packet. The packet is a metadata-only diligence artifact and does not create live healthcare, legal, security, privacy, compliance, reimbursement, or production authorization.';
