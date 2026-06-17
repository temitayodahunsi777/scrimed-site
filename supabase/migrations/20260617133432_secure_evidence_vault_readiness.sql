create table if not exists private.sales_secure_evidence_vault_readiness (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  intake_id text not null references private.pilot_intake_submissions(intake_id) on delete restrict,
  buyer_diligence_room_id uuid not null references private.sales_buyer_diligence_rooms(id) on delete restrict,
  customer_activation_approval_id uuid not null references private.sales_customer_activation_approvals(id) on delete restrict,
  production_activation_readiness_id uuid not null references private.sales_production_activation_readiness(id) on delete restrict,
  buyer_tenant_lifecycle_id uuid not null references private.sales_buyer_tenant_lifecycles(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  workspace_slug text not null check (workspace_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  readiness_status text not null default 'planned'
    check (readiness_status in ('planned', 'controls-review-required', 'ready-for-procurement')),
  vault_mode text not null default 'disabled-metadata-only'
    check (vault_mode in ('disabled-metadata-only')),
  evidence_boundary text not null check (char_length(evidence_boundary) between 40 and 1000),
  storage_provider_decision jsonb not null default '{}'::jsonb
    check (jsonb_typeof(storage_provider_decision) = 'object' and pg_column_size(storage_provider_decision) <= 32768),
  encryption_key_management jsonb not null default '{}'::jsonb
    check (jsonb_typeof(encryption_key_management) = 'object' and pg_column_size(encryption_key_management) <= 32768),
  dlp_malware_scanning jsonb not null default '{}'::jsonb
    check (jsonb_typeof(dlp_malware_scanning) = 'object' and pg_column_size(dlp_malware_scanning) <= 32768),
  retention_legal_hold jsonb not null default '{}'::jsonb
    check (jsonb_typeof(retention_legal_hold) = 'object' and pg_column_size(retention_legal_hold) <= 32768),
  access_review_policy jsonb not null default '{}'::jsonb
    check (jsonb_typeof(access_review_policy) = 'object' and pg_column_size(access_review_policy) <= 32768),
  evidence_classification_policy jsonb not null default '{}'::jsonb
    check (jsonb_typeof(evidence_classification_policy) = 'object' and pg_column_size(evidence_classification_policy) <= 32768),
  upload_approval_workflow jsonb not null default '{}'::jsonb
    check (jsonb_typeof(upload_approval_workflow) = 'object' and pg_column_size(upload_approval_workflow) <= 32768),
  incident_response_runbook jsonb not null default '{}'::jsonb
    check (jsonb_typeof(incident_response_runbook) = 'object' and pg_column_size(incident_response_runbook) <= 32768),
  regional_data_residency jsonb not null default '{}'::jsonb
    check (jsonb_typeof(regional_data_residency) = 'object' and pg_column_size(regional_data_residency) <= 32768),
  target_audience_signals jsonb not null default '[]'::jsonb
    check (jsonb_typeof(target_audience_signals) = 'array' and pg_column_size(target_audience_signals) <= 32768),
  retained_blockers jsonb not null default '[]'::jsonb
    check (jsonb_typeof(retained_blockers) = 'array' and pg_column_size(retained_blockers) <= 32768),
  next_required_approvals jsonb not null default '[]'::jsonb
    check (jsonb_typeof(next_required_approvals) = 'array' and pg_column_size(next_required_approvals) <= 32768),
  last_packet_generated_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  boundary text not null check (char_length(boundary) between 80 and 2200),
  unique (tenant_id, intake_id),
  unique (buyer_diligence_room_id)
);

create index if not exists sales_secure_evidence_vault_readiness_intake_idx
  on private.sales_secure_evidence_vault_readiness(intake_id);
create index if not exists sales_secure_evidence_vault_readiness_workspace_id_idx
  on private.sales_secure_evidence_vault_readiness(workspace_id);
create index if not exists sales_secure_evidence_vault_readiness_workspace_slug_idx
  on private.sales_secure_evidence_vault_readiness(workspace_slug);
create index if not exists sales_secure_evidence_vault_readiness_diligence_idx
  on private.sales_secure_evidence_vault_readiness(buyer_diligence_room_id);
create index if not exists sales_secure_evidence_vault_readiness_activation_approval_idx
  on private.sales_secure_evidence_vault_readiness(customer_activation_approval_id);
create index if not exists sales_secure_evidence_vault_readiness_readiness_idx
  on private.sales_secure_evidence_vault_readiness(production_activation_readiness_id);
create index if not exists sales_secure_evidence_vault_readiness_lifecycle_idx
  on private.sales_secure_evidence_vault_readiness(buyer_tenant_lifecycle_id);
create index if not exists sales_secure_evidence_vault_readiness_created_by_idx
  on private.sales_secure_evidence_vault_readiness(created_by);
create index if not exists sales_secure_evidence_vault_readiness_updated_by_idx
  on private.sales_secure_evidence_vault_readiness(updated_by);

alter table private.sales_secure_evidence_vault_readiness enable row level security;
revoke all on private.sales_secure_evidence_vault_readiness from public, anon, authenticated;

drop policy if exists sales_secure_evidence_vault_readiness_deny_direct_access
  on private.sales_secure_evidence_vault_readiness;
create policy sales_secure_evidence_vault_readiness_deny_direct_access
on private.sales_secure_evidence_vault_readiness
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
      'buyer-diligence-packet-downloaded',
      'secure-evidence-vault-readiness-prepared',
      'secure-evidence-vault-readiness-packet-downloaded'
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
      'buyer-diligence-room-prepared',
      'secure-evidence-vault-readiness-prepared'
    )
  );

create or replace function private.sales_secure_evidence_vault_readiness_json(
  readiness private.sales_secure_evidence_vault_readiness
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
    'buyerDiligenceRoomId', readiness.buyer_diligence_room_id,
    'customerActivationApprovalId', readiness.customer_activation_approval_id,
    'productionActivationReadinessId', readiness.production_activation_readiness_id,
    'buyerTenantLifecycleId', readiness.buyer_tenant_lifecycle_id,
    'workspaceId', readiness.workspace_id,
    'workspaceSlug', readiness.workspace_slug,
    'readinessStatus', readiness.readiness_status,
    'vaultMode', readiness.vault_mode,
    'evidenceBoundary', readiness.evidence_boundary,
    'storageProviderDecision', readiness.storage_provider_decision,
    'encryptionKeyManagement', readiness.encryption_key_management,
    'dlpMalwareScanning', readiness.dlp_malware_scanning,
    'retentionLegalHold', readiness.retention_legal_hold,
    'accessReviewPolicy', readiness.access_review_policy,
    'evidenceClassificationPolicy', readiness.evidence_classification_policy,
    'uploadApprovalWorkflow', readiness.upload_approval_workflow,
    'incidentResponseRunbook', readiness.incident_response_runbook,
    'regionalDataResidency', readiness.regional_data_residency,
    'targetAudienceSignals', readiness.target_audience_signals,
    'retainedBlockers', readiness.retained_blockers,
    'nextRequiredApprovals', readiness.next_required_approvals,
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
    'secureEvidenceVaultReadiness', (
      select private.sales_secure_evidence_vault_readiness_json(vault)
      from private.sales_secure_evidence_vault_readiness vault
      where vault.tenant_id = opportunity.tenant_id
        and vault.intake_id = opportunity.intake_id
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

create or replace function private.prepare_sales_secure_evidence_vault_readiness(
  p_intake_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_tenant_id uuid;
  selected_opportunity private.pilot_intake_submissions%rowtype;
  selected_diligence private.sales_buyer_diligence_rooms%rowtype;
  existing_readiness private.sales_secure_evidence_vault_readiness%rowtype;
  created_readiness private.sales_secure_evidence_vault_readiness%rowtype;
  created_sales_event_id uuid;
  vault_boundary text :=
    'Secure evidence vault readiness is disabled-by-default and metadata-only for SCRIMED governed synthetic paid pilot diligence. Do not upload or store PHI, patient identifiers, live clinical records, payer member data, source contracts, IdP certificates, private keys, production credentials, legal advice, compliance certification, breach determination, patient outreach approval, payer submission approval, autonomous care approval, or live healthcare execution authorization.';
  evidence_boundary text :=
    'No sensitive files are stored in SCRIMED. Only control status, owners, approvals, dates, secure-channel labels, and production gates may be tracked.';
  storage_provider_decision jsonb;
  encryption_key_management jsonb;
  dlp_malware_scanning jsonb;
  retention_legal_hold jsonb;
  access_review_policy jsonb;
  evidence_classification_policy jsonb;
  upload_approval_workflow jsonb;
  incident_response_runbook jsonb;
  regional_data_residency jsonb;
  target_audience_signals jsonb;
  retained_blockers jsonb;
  next_required_approvals jsonb;
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
    raise exception 'sales-secure-evidence-vault-closed-lost';
  end if;

  select *
  into selected_diligence
  from private.sales_buyer_diligence_rooms
  where tenant_id = target_tenant_id
    and intake_id = p_intake_id
    and diligence_status in ('prepared', 'signed-controls-review-required', 'ready-for-contract-review');

  if selected_diligence.id is null then
    raise exception 'sales-secure-evidence-vault-buyer-diligence-room-required';
  end if;

  select *
  into existing_readiness
  from private.sales_secure_evidence_vault_readiness
  where tenant_id = target_tenant_id
    and intake_id = p_intake_id;

  if existing_readiness.id is not null then
    return jsonb_build_object(
      'secureEvidenceVaultReadiness', private.sales_secure_evidence_vault_readiness_json(existing_readiness),
      'created', false,
      'auditEventId', null,
      'boundary', vault_boundary
    );
  end if;

  storage_provider_decision := jsonb_build_object(
    'status', 'buyer-review-required',
    'owner', 'SCRIMED platform/security and buyer security/procurement',
    'requiredControls', jsonb_build_array(
      'approved storage provider',
      'BAA/DPA applicability path',
      'tenant isolation model',
      'private object access policy',
      'signed subprocessor and residency review'
    ),
    'acceptedMetadata', jsonb_build_array(
      'provider name',
      'region class',
      'contract status',
      'subprocessor status',
      'owner role',
      'approval date'
    ),
    'blockedUntil', jsonb_build_array(
      'signed legal/privacy/security review',
      'buyer procurement approval',
      'provider risk review'
    ),
    'productionGate', 'No storage bucket, upload URL, or evidence object path is enabled until provider, contract, residency, and access controls are approved.'
  );

  encryption_key_management := jsonb_build_object(
    'status', 'scrimed-review-required',
    'owner', 'SCRIMED security owner and buyer security owner',
    'requiredControls', jsonb_build_array(
      'encryption at rest',
      'encryption in transit',
      'key ownership decision',
      'rotation policy',
      'break-glass key access policy',
      'audit logging for key operations'
    ),
    'acceptedMetadata', jsonb_build_array(
      'key model',
      'rotation cadence',
      'key owner role',
      'exception approval status',
      'audit log route'
    ),
    'blockedUntil', jsonb_build_array(
      'key management decision',
      'incident response route',
      'access review cadence'
    ),
    'productionGate', 'Sensitive evidence storage requires approved encryption, key ownership, rotation, break-glass, and audit controls.'
  );

  dlp_malware_scanning := jsonb_build_object(
    'status', 'blocked',
    'owner', 'SCRIMED trust safety and security reviewer',
    'requiredControls', jsonb_build_array(
      'malware scanning before persistence',
      'DLP scan before release',
      'file type allowlist',
      'maximum file size',
      'quarantine workflow',
      'false-positive review path'
    ),
    'acceptedMetadata', jsonb_build_array(
      'scanner provider',
      'file type policy',
      'quarantine status',
      'review owner',
      'scan timestamp policy'
    ),
    'blockedUntil', jsonb_build_array(
      'scanner provider selected',
      'quarantine path approved',
      'support owner approved'
    ),
    'productionGate', 'No upload acceptance until malware and DLP scanning are active, logged, and tied to quarantine and human review.'
  );

  retention_legal_hold := jsonb_build_object(
    'status', 'buyer-review-required',
    'owner', 'SCRIMED legal/privacy and buyer legal/privacy',
    'requiredControls', jsonb_build_array(
      'retention schedule',
      'deletion workflow',
      'legal hold workflow',
      'archive policy',
      'buyer export path',
      'disposal audit'
    ),
    'acceptedMetadata', jsonb_build_array(
      'retention class',
      'hold owner',
      'deletion approver',
      'archive status',
      'export status'
    ),
    'blockedUntil', jsonb_build_array(
      'retention schedule signed',
      'legal hold procedure approved',
      'deletion evidence approved'
    ),
    'productionGate', 'Retention, legal hold, archive, and deletion evidence must be signed before regulated evidence storage.'
  );

  access_review_policy := jsonb_build_object(
    'status', 'designed',
    'owner', 'SCRIMED tenant-admin and buyer security owner',
    'requiredControls', jsonb_build_array(
      'least privilege roles',
      'AAL2 for vault actions',
      'time-bound access',
      'access review cadence',
      'download audit',
      'revocation workflow'
    ),
    'acceptedMetadata', jsonb_build_array(
      'role name',
      'review cadence',
      'approver role',
      'revocation SLA',
      'audit event route'
    ),
    'blockedUntil', jsonb_build_array(
      'role matrix approved',
      'download policy approved',
      'access review owner confirmed'
    ),
    'productionGate', 'Vault access requires approved roles, AAL2 gates, revocation, review cadence, and audited downloads.'
  );

  evidence_classification_policy := jsonb_build_object(
    'status', 'designed',
    'owner', 'SCRIMED privacy/security reviewer',
    'requiredControls', jsonb_build_array(
      'evidence classification taxonomy',
      'PHI/ePHI detection policy',
      'secrets detection policy',
      'IdP certificate handling policy',
      'contract source handling policy',
      'prohibited upload policy'
    ),
    'acceptedMetadata', jsonb_build_array(
      'classification label',
      'permitted evidence type',
      'prohibited evidence type',
      'review owner',
      'escalation route'
    ),
    'blockedUntil', jsonb_build_array(
      'classification policy approved',
      'buyer evidence taxonomy confirmed',
      'review procedure approved'
    ),
    'productionGate', 'Evidence classification must be active before any buyer document intake.'
  );

  upload_approval_workflow := jsonb_build_object(
    'status', 'blocked',
    'owner', 'SCRIMED implementation owner and buyer document owner',
    'requiredControls', jsonb_build_array(
      'manual approval before upload',
      'one-time upload session',
      'file manifest',
      'pre-upload attestation',
      'post-upload review',
      'buyer withdrawal path'
    ),
    'acceptedMetadata', jsonb_build_array(
      'upload purpose',
      'document owner',
      'approver role',
      'attestation date',
      'manifest ID'
    ),
    'blockedUntil', jsonb_build_array(
      'upload workflow approved',
      'support owner assigned',
      'evidence manifest policy approved'
    ),
    'productionGate', 'No automated or direct upload path until signed approval workflow and support ownership are active.'
  );

  incident_response_runbook := jsonb_build_object(
    'status', 'scrimed-review-required',
    'owner', 'SCRIMED trust safety, security, legal, and buyer incident contacts',
    'requiredControls', jsonb_build_array(
      'incident severity model',
      'containment action list',
      'notification decision path',
      'legal hold trigger',
      'buyer contact matrix',
      'post-incident improvement loop'
    ),
    'acceptedMetadata', jsonb_build_array(
      'severity class',
      'contact role',
      'notification owner',
      'containment SLA',
      'improvement owner'
    ),
    'blockedUntil', jsonb_build_array(
      'incident response owner confirmed',
      'buyer contact matrix approved',
      'notification path reviewed'
    ),
    'productionGate', 'Evidence vaulting requires incident response and notification decision paths before file intake.'
  );

  regional_data_residency := jsonb_build_object(
    'status', 'buyer-review-required',
    'owner', 'SCRIMED deployment owner and buyer privacy/security owner',
    'requiredControls', jsonb_build_array(
      'approved storage region',
      'cross-border transfer review',
      'sovereign deployment decision',
      'backup region policy',
      'region-specific retention rule'
    ),
    'acceptedMetadata', jsonb_build_array(
      'region',
      'deployment profile',
      'transfer status',
      'backup class',
      'approval date'
    ),
    'blockedUntil', jsonb_build_array(
      'region policy approved',
      'buyer residency requirement confirmed',
      'deployment profile signed'
    ),
    'productionGate', 'Regional storage and transfer controls must be signed before handling regulated evidence for global buyers.'
  );

  target_audience_signals := jsonb_build_array(
    jsonb_build_object(
      'audience', 'CIO / Digital Transformation',
      'buyerValue', 'Transforms document handling from ad hoc email chains into a governed implementation workstream.',
      'revenuePath', 'Paid implementation setup plus annual platform governance license',
      'proof', 'disabled-by-default vault readiness packet'
    ),
    jsonb_build_object(
      'audience', 'CISO / Security',
      'buyerValue', 'Shows encryption, DLP, malware scanning, access review, incident response, and no-secret boundaries before storage.',
      'revenuePath', 'Security readiness add-on and enterprise support tier',
      'proof', 'security control register'
    ),
    jsonb_build_object(
      'audience', 'Privacy / Legal / Compliance',
      'buyerValue', 'Keeps BAA/DPA, retention, legal hold, residency, and prohibited upload decisions visible before evidence intake.',
      'revenuePath', 'Governance audit, readiness assessment, and regulated pilot expansion',
      'proof', 'retention/legal hold and classification controls'
    ),
    jsonb_build_object(
      'audience', 'Clinical Operations / Revenue Cycle / Payer',
      'buyerValue', 'Lets workflow teams prepare referral, prior authorization, claims, and documentation evidence safely without live execution claims.',
      'revenuePath', 'Workflow intelligence assessment to synthetic pilot to enterprise operating license',
      'proof', 'workflow-bound evidence scope'
    ),
    jsonb_build_object(
      'audience', 'Government / Sovereign Health Buyer',
      'buyerValue', 'Packages residency, sovereignty, transfer, and deployment-profile decisions for public-sector diligence.',
      'revenuePath', 'Sovereign deployment readiness and long-term infrastructure contract',
      'proof', 'regional data residency control'
    ),
    jsonb_build_object(
      'audience', 'Investor / Strategic Partner',
      'buyerValue', 'Demonstrates a scalable trust architecture that can compound into platform revenue instead of one-off consulting.',
      'revenuePath', 'Premium platform multiples through trust, governance, and interoperability expansion',
      'proof', 'audited readiness and packet trail'
    )
  );

  retained_blockers := jsonb_build_array(
    'No file upload, object storage, signed upload URL, evidence bucket, or source-document repository is enabled.',
    'PHI, ePHI, patient identifiers, live clinical records, payer member data, source contracts, secrets, private keys, IdP certificates, and production credentials remain blocked.',
    'No legal advice, compliance certification, breach determination, reimbursement guarantee, clinical validation, or production authorization is created.',
    'No customer SSO cutover, production connector, payer transaction, patient outreach, autonomous diagnosis, treatment decision, or live healthcare execution is authorized.',
    'Sensitive evidence exchange must remain outside SCRIMED through buyer-approved secure channels until the vault controls are approved.'
  );

  next_required_approvals := jsonb_build_array(
    'Buyer and SCRIMED approve storage provider and BAA/DPA path.',
    'SCRIMED security approves encryption, key management, DLP, malware scanning, quarantine, and access-review controls.',
    'Buyer legal/privacy and SCRIMED legal/privacy approve retention, legal hold, deletion, export, and regional residency rules.',
    'SCRIMED trust safety approves incident response, notification decision, support ownership, and continuous improvement runbook.',
    'Buyer executive sponsor approves commercial scope, paid implementation path, and evidence intake boundary.',
    'SCRIMED founder approves any move from disabled metadata-only readiness to limited controlled evidence storage.'
  );

  insert into private.sales_secure_evidence_vault_readiness (
    tenant_id,
    intake_id,
    buyer_diligence_room_id,
    customer_activation_approval_id,
    production_activation_readiness_id,
    buyer_tenant_lifecycle_id,
    workspace_id,
    workspace_slug,
    readiness_status,
    vault_mode,
    evidence_boundary,
    storage_provider_decision,
    encryption_key_management,
    dlp_malware_scanning,
    retention_legal_hold,
    access_review_policy,
    evidence_classification_policy,
    upload_approval_workflow,
    incident_response_runbook,
    regional_data_residency,
    target_audience_signals,
    retained_blockers,
    next_required_approvals,
    created_by,
    updated_by,
    boundary
  )
  values (
    target_tenant_id,
    selected_opportunity.intake_id,
    selected_diligence.id,
    selected_diligence.customer_activation_approval_id,
    selected_diligence.production_activation_readiness_id,
    selected_diligence.buyer_tenant_lifecycle_id,
    selected_diligence.workspace_id,
    selected_diligence.workspace_slug,
    'planned',
    'disabled-metadata-only',
    evidence_boundary,
    storage_provider_decision,
    encryption_key_management,
    dlp_malware_scanning,
    retention_legal_hold,
    access_review_policy,
    evidence_classification_policy,
    upload_approval_workflow,
    incident_response_runbook,
    regional_data_residency,
    target_audience_signals,
    retained_blockers,
    next_required_approvals,
    (select auth.uid()),
    (select auth.uid()),
    vault_boundary
  )
  returning * into created_readiness;

  insert into private.sales_opportunity_audit_events (
    tenant_id, intake_id, actor_user_id, event_type, event_metadata
  )
  values (
    target_tenant_id,
    selected_opportunity.intake_id,
    (select auth.uid()),
    'secure-evidence-vault-readiness-prepared',
    jsonb_build_object(
      'workspaceId', selected_diligence.workspace_id,
      'workspaceSlug', selected_diligence.workspace_slug,
      'buyerDiligenceRoomId', selected_diligence.id,
      'readinessStatus', created_readiness.readiness_status,
      'vaultMode', created_readiness.vault_mode,
      'storageEnabled', false,
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
    selected_diligence.workspace_id,
    null,
    (select auth.uid()),
    'secure-evidence-vault-readiness-prepared',
    jsonb_build_object(
      'intakeId', selected_opportunity.intake_id,
      'salesAuditEventId', created_sales_event_id,
      'readinessStatus', created_readiness.readiness_status,
      'vaultMode', created_readiness.vault_mode,
      'assuranceLevel', 'aal2',
      'metadataOnly', true,
      'storageEnabled', false,
      'syntheticOnly', true
    )
  );

  return jsonb_build_object(
    'secureEvidenceVaultReadiness', private.sales_secure_evidence_vault_readiness_json(created_readiness),
    'created', true,
    'auditEventId', created_sales_event_id,
    'boundary', vault_boundary
  );
end;
$$;

create or replace function private.record_sales_secure_evidence_vault_readiness_packet_download(
  p_intake_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_tenant_id uuid;
  selected_readiness private.sales_secure_evidence_vault_readiness%rowtype;
  created_event_id uuid;
begin
  target_tenant_id := private.require_sales_tenant_admin();
  perform private.require_sales_server_token();

  update private.sales_secure_evidence_vault_readiness readiness
  set last_packet_generated_at = now(),
      updated_at = now(),
      updated_by = (select auth.uid())
  where readiness.tenant_id = target_tenant_id
    and readiness.intake_id = p_intake_id
    and readiness.vault_mode = 'disabled-metadata-only'
  returning * into selected_readiness;

  if selected_readiness.id is null then
    raise exception 'sales-secure-evidence-vault-readiness-not-prepared';
  end if;

  insert into private.sales_opportunity_audit_events (
    tenant_id, intake_id, actor_user_id, event_type, event_metadata
  )
  values (
    target_tenant_id,
    p_intake_id,
    (select auth.uid()),
    'secure-evidence-vault-readiness-packet-downloaded',
    jsonb_build_object(
      'workspaceId', selected_readiness.workspace_id,
      'workspaceSlug', selected_readiness.workspace_slug,
      'packetType', 'secure-evidence-vault-readiness-packet',
      'format', 'text/markdown',
      'readinessStatus', selected_readiness.readiness_status,
      'vaultMode', selected_readiness.vault_mode,
      'storageEnabled', false,
      'metadataOnly', true,
      'noPhiBoundary', true,
      'syntheticOnly', true
    )
  )
  returning id into created_event_id;

  return jsonb_build_object(
    'secureEvidenceVaultReadiness', private.sales_secure_evidence_vault_readiness_json(selected_readiness),
    'created', false,
    'auditEventId', created_event_id,
    'boundary', selected_readiness.boundary
  );
end;
$$;

create or replace function public.prepare_sales_secure_evidence_vault_readiness(
  p_intake_id text
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.prepare_sales_secure_evidence_vault_readiness(p_intake_id);
$$;

create or replace function public.record_sales_secure_evidence_vault_readiness_packet_download(
  p_intake_id text
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_sales_secure_evidence_vault_readiness_packet_download(p_intake_id);
$$;

revoke all on function private.sales_secure_evidence_vault_readiness_json(private.sales_secure_evidence_vault_readiness)
  from public, anon, authenticated, service_role;
revoke all on function private.prepare_sales_secure_evidence_vault_readiness(text)
  from public, anon, authenticated, service_role;
revoke all on function private.record_sales_secure_evidence_vault_readiness_packet_download(text)
  from public, anon, authenticated, service_role;
revoke all on function public.prepare_sales_secure_evidence_vault_readiness(text)
  from public, anon, authenticated, service_role;
revoke all on function public.record_sales_secure_evidence_vault_readiness_packet_download(text)
  from public, anon, authenticated, service_role;

grant execute on function private.sales_secure_evidence_vault_readiness_json(private.sales_secure_evidence_vault_readiness)
  to authenticated;
grant execute on function private.prepare_sales_secure_evidence_vault_readiness(text)
  to authenticated;
grant execute on function private.record_sales_secure_evidence_vault_readiness_packet_download(text)
  to authenticated;
grant execute on function public.prepare_sales_secure_evidence_vault_readiness(text)
  to authenticated;
grant execute on function public.record_sales_secure_evidence_vault_readiness_packet_download(text)
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
    'schemaVersion', '2026-06-17.2',
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
    'buyerDiligenceRooms', 'aal2-private-rpc-metadata-only-signed-controls-diligence',
    'secureEvidenceVaultReadiness', 'aal2-private-rpc-disabled-by-default-storage-control-readiness'
  );
$$;

comment on table private.sales_secure_evidence_vault_readiness is
  'Private no-PHI secure evidence vault readiness records for opportunity-linked paid pilot diligence. Storage is disabled by default and direct Data API access is denied.';
comment on function private.prepare_sales_secure_evidence_vault_readiness(text) is
  'Prepares disabled-by-default secure evidence vault readiness after a buyer diligence room exists. No file upload, PHI, secrets, IdP certificates, production credentials, live clinical data, or production connectors are enabled.';
comment on function private.record_sales_secure_evidence_vault_readiness_packet_download(text) is
  'Records audited release of a secure evidence vault readiness packet. The packet is metadata-only and does not authorize sensitive-file storage, legal conclusions, compliance certification, reimbursement, or production healthcare execution.';
