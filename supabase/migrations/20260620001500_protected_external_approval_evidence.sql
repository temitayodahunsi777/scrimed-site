create table if not exists public.protected_external_approval_evidence_references (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  finance_gate_record_id uuid references public.protected_finance_methodology_gates(id) on delete restrict,
  domain_id text not null check (
    domain_id in (
      'finance-methodology-policy',
      'counsel-external-use-review',
      'executive-release-review',
      'privacy-security-review',
      'clinical-governance-boundary-review',
      'marketing-claims-review',
      'buyer-permission-review'
    )
  ),
  domain_label text not null check (char_length(domain_label) between 3 and 160),
  reference_status text not null default 'metadata-reference-recorded' check (
    reference_status in (
      'metadata-reference-recorded',
      'external-review-required',
      'customer-specific-required',
      'release-blocked'
    )
  ),
  approval_scope text not null default 'external-evidence-reference-only'
    check (approval_scope = 'external-evidence-reference-only'),
  external_reference_label text not null check (char_length(external_reference_label) between 3 and 120),
  external_system text not null check (
    external_system in (
      'counsel-data-room',
      'finance-workbook',
      'customer-procurement-portal',
      'security-grc',
      'board-materials',
      'external-secure-channel'
    )
  ),
  reference_locator text not null check (char_length(reference_locator) between 3 and 160),
  reference_owner text not null check (char_length(reference_owner) between 3 and 80),
  evidence_retained_externally boolean not null default true
    check (evidence_retained_externally is true),
  evidence_snapshot jsonb not null default '{}'::jsonb
    check (jsonb_typeof(evidence_snapshot) = 'object' and pg_column_size(evidence_snapshot) <= 8192),
  retained_blockers text[] not null default '{}'::text[]
    check (cardinality(retained_blockers) between 1 and 16),
  release_restrictions text[] not null default '{}'::text[]
    check (cardinality(release_restrictions) between 1 and 16),
  attestation text not null check (
    attestation = 'external-approval-evidence-reference-no-phi'
  ),
  review_note text not null default '' check (char_length(review_note) <= 280),
  data_boundary text not null check (data_boundary = 'synthetic-business-workflow-only'),
  evidence_authority text not null default 'metadata-reference-only-not-approval'
    check (evidence_authority = 'metadata-reference-only-not-approval'),
  storage_authority text not null default 'no-sensitive-document-storage'
    check (storage_authority = 'no-sensitive-document-storage'),
  release_authority text not null default 'external-use-blocked-until-qualified-release-approval'
    check (release_authority = 'external-use-blocked-until-qualified-release-approval'),
  financial_reporting_authority text not null default 'not-audited-financial-report'
    check (financial_reporting_authority = 'not-audited-financial-report'),
  securities_authority text not null default 'not-securities-offering-material'
    check (securities_authority = 'not-securities-offering-material'),
  advertising_claims_authority text not null default 'not-advertising-claim-substantiation'
    check (advertising_claims_authority = 'not-advertising-claim-substantiation'),
  clinical_execution_authority text not null default 'not-authorized-live-care'
    check (clinical_execution_authority = 'not-authorized-live-care'),
  recorded_by uuid not null references auth.users(id) on delete restrict,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  boundary text not null default
    'Protected External Approval Evidence Linkage records bounded no-PHI metadata references to approval artifacts retained in qualified external systems. It does not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, signed BAAs/DPAs, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, clinical validation, compliance certification, advertising claim substantiation, customer permission artifacts, production authorization, or live clinical execution approval.'
);

create index if not exists protected_external_approval_evidence_tenant_recorded_at_idx
  on public.protected_external_approval_evidence_references(tenant_id, recorded_at desc);
create index if not exists protected_external_approval_evidence_workspace_recorded_at_idx
  on public.protected_external_approval_evidence_references(workspace_id, recorded_at desc);
create index if not exists protected_external_approval_evidence_domain_idx
  on public.protected_external_approval_evidence_references(workspace_id, domain_id, recorded_at desc);
create index if not exists protected_external_approval_evidence_finance_gate_idx
  on public.protected_external_approval_evidence_references(finance_gate_record_id);
create index if not exists protected_external_approval_evidence_recorded_by_idx
  on public.protected_external_approval_evidence_references(recorded_by);

alter table public.protected_external_approval_evidence_references enable row level security;
revoke all on public.protected_external_approval_evidence_references from public, anon, authenticated;
grant select on public.protected_external_approval_evidence_references to authenticated;

drop policy if exists protected_external_approval_evidence_member_select
  on public.protected_external_approval_evidence_references;
create policy protected_external_approval_evidence_member_select
on public.protected_external_approval_evidence_references
for select
to authenticated
using (
  (select private.has_valid_governance_session())
  and (select private.is_pilot_member(tenant_id))
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
      'secure-evidence-vault-readiness-prepared',
      'sales-demo-session-recorded',
      'sales-demo-session-packet-downloaded',
      'manual-qa-evidence-packet-recorded',
      'command-intelligence-snapshot-created',
      'command-intelligence-packet-downloaded',
      'clinical-activation-approval-recorded',
      'operator-metric-recorded',
      'protected-metric-rollup-created',
      'protected-metric-rollup-packet-downloaded',
      'protected-metric-trend-review-created',
      'protected-metric-trend-packet-downloaded',
      'protected-board-scorecard-created',
      'protected-board-scorecard-packet-downloaded',
      'protected-finance-methodology-gate-recorded',
      'protected-external-approval-evidence-recorded'
    )
  );

create or replace function private.record_protected_external_approval_evidence_reference(
  p_workspace_slug text,
  p_reference_input jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_finance_gate public.protected_finance_methodology_gates%rowtype;
  normalized_input jsonb := coalesce(p_reference_input, '{}'::jsonb);
  domain_id_value text;
  finance_gate_record_id_text text;
  finance_gate_record_id_value uuid;
  external_reference_label_value text;
  external_system_value text;
  reference_locator_value text;
  reference_owner_value text;
  evidence_retained_externally_value boolean;
  attestation_value text;
  data_boundary_value text;
  review_note_value text;
  actor_role text;
  domain_label_value text;
  related_finance_gate_id_value text;
  reviewer_role_value text;
  retained_blockers_value text[];
  release_restrictions_value text[];
  evidence_snapshot_value jsonb;
  created_reference_id uuid;
  protected_boundary text :=
    'Protected External Approval Evidence Linkage records bounded no-PHI metadata references to approval artifacts retained in qualified external systems. It does not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, signed BAAs/DPAs, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, clinical validation, compliance certification, advertising claim substantiation, customer permission artifacts, production authorization, or live clinical execution approval.';
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead', 'reviewer']
  );

  if jsonb_typeof(normalized_input) <> 'object'
    or pg_column_size(normalized_input) > 4096 then
    raise exception 'protected-external-approval-evidence-invalid-payload';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(normalized_input) as supplied(key)
    where supplied.key <> all(array[
      'domainId',
      'financeGateRecordId',
      'externalReferenceLabel',
      'externalSystem',
      'referenceLocator',
      'referenceOwner',
      'evidenceRetainedExternally',
      'attestation',
      'dataBoundary',
      'reviewNote'
    ])
  ) then
    raise exception 'protected-external-approval-evidence-unsupported-field';
  end if;

  domain_id_value := trim(coalesce(normalized_input ->> 'domainId', ''));
  finance_gate_record_id_text := nullif(trim(coalesce(normalized_input ->> 'financeGateRecordId', '')), '');
  external_reference_label_value := left(trim(coalesce(normalized_input ->> 'externalReferenceLabel', '')), 121);
  external_system_value := trim(coalesce(normalized_input ->> 'externalSystem', ''));
  reference_locator_value := left(trim(coalesce(normalized_input ->> 'referenceLocator', '')), 161);
  reference_owner_value := left(trim(coalesce(normalized_input ->> 'referenceOwner', '')), 81);
  evidence_retained_externally_value := coalesce((normalized_input ->> 'evidenceRetainedExternally')::boolean, false);
  attestation_value := trim(coalesce(normalized_input ->> 'attestation', ''));
  data_boundary_value := trim(coalesce(normalized_input ->> 'dataBoundary', ''));
  review_note_value := left(trim(coalesce(normalized_input ->> 'reviewNote', '')), 281);

  begin
    if finance_gate_record_id_text is not null then
      finance_gate_record_id_value := finance_gate_record_id_text::uuid;
    end if;
  exception when others then
    raise exception 'protected-external-approval-evidence-invalid-typed-field';
  end;

  if domain_id_value not in (
      'finance-methodology-policy',
      'counsel-external-use-review',
      'executive-release-review',
      'privacy-security-review',
      'clinical-governance-boundary-review',
      'marketing-claims-review',
      'buyer-permission-review'
    )
    or external_system_value not in (
      'counsel-data-room',
      'finance-workbook',
      'customer-procurement-portal',
      'security-grc',
      'board-materials',
      'external-secure-channel'
    )
    or evidence_retained_externally_value is not true
    or attestation_value <> 'external-approval-evidence-reference-no-phi'
    or data_boundary_value <> 'synthetic-business-workflow-only'
    or external_reference_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#-]{2,119}$'
    or reference_locator_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#-]{2,159}$'
    or reference_owner_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#-]{2,79}$'
    or char_length(review_note_value) > 280 then
    raise exception 'protected-external-approval-evidence-validation-failed';
  end if;

  if external_reference_label_value || ' ' || reference_locator_value || ' ' || reference_owner_value || ' ' || review_note_value || ' ' || coalesce(finance_gate_record_id_text, '') ~*
    '(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|sk-[A-Za-z0-9_-]{12,}|sbp_[A-Za-z0-9_-]{12,}|bearer[[:space:]]+[A-Za-z0-9._-]+|token|secret|password|api[ _-]?key|access[ _-]?key|https?:\/\/\S*[?=]\S*|patient[ _-]?(id|identifier|mrn)|member[ _-]?(id|identifier)|medical record|protected health information|payer member|diagnosis code|social security|source contract|signed[ _-]?(baa|dpa|contract|agreement)|legal opinion|audited financial|investment recommendation|securities offering|valuation guarantee|revenue guarantee|reimbursement guarantee|advertising substantiation|clinical validation|compliance certification)' then
    raise exception 'protected-external-approval-evidence-prohibited-content';
  end if;

  domain_label_value := case domain_id_value
    when 'finance-methodology-policy' then 'Finance methodology policy reference'
    when 'counsel-external-use-review' then 'Counsel external-use review reference'
    when 'executive-release-review' then 'Executive release review reference'
    when 'privacy-security-review' then 'Privacy and security review reference'
    when 'clinical-governance-boundary-review' then 'Clinical governance boundary reference'
    when 'marketing-claims-review' then 'Marketing claims review reference'
    when 'buyer-permission-review' then 'Buyer permission review reference'
  end;

  related_finance_gate_id_value := case domain_id_value
    when 'finance-methodology-policy' then 'finance-cost-allocation'
    when 'counsel-external-use-review' then 'counsel-external-use'
    when 'executive-release-review' then 'executive-release'
    when 'privacy-security-review' then 'privacy-security-review'
    when 'clinical-governance-boundary-review' then 'clinical-governance-boundary'
    when 'marketing-claims-review' then 'marketing-claims-substantiation'
    when 'buyer-permission-review' then 'buyer-permission'
  end;

  if finance_gate_record_id_value is not null then
    select *
    into selected_finance_gate
    from public.protected_finance_methodology_gates finance_gate
    where finance_gate.id = finance_gate_record_id_value
      and finance_gate.workspace_id = selected_workspace.id
      and finance_gate.tenant_id = selected_workspace.tenant_id;

    if selected_finance_gate.id is null then
      raise exception 'protected-external-approval-evidence-finance-gate-not-found';
    end if;

    if selected_finance_gate.gate_id <> related_finance_gate_id_value then
      raise exception 'protected-external-approval-evidence-finance-gate-domain-mismatch';
    end if;
  end if;

  if not (
    (domain_id_value = 'finance-methodology-policy' and external_system_value in ('finance-workbook', 'board-materials', 'external-secure-channel'))
    or (domain_id_value = 'counsel-external-use-review' and external_system_value in ('counsel-data-room', 'external-secure-channel', 'board-materials'))
    or (domain_id_value = 'executive-release-review' and external_system_value in ('board-materials', 'external-secure-channel'))
    or (domain_id_value = 'privacy-security-review' and external_system_value in ('security-grc', 'customer-procurement-portal', 'external-secure-channel'))
    or (domain_id_value = 'clinical-governance-boundary-review' and external_system_value in ('external-secure-channel', 'board-materials', 'customer-procurement-portal'))
    or (domain_id_value = 'marketing-claims-review' and external_system_value in ('counsel-data-room', 'board-materials', 'external-secure-channel'))
    or (domain_id_value = 'buyer-permission-review' and external_system_value in ('customer-procurement-portal', 'external-secure-channel', 'counsel-data-room'))
  ) then
    raise exception 'protected-external-approval-evidence-system-domain-mismatch';
  end if;

  select membership.role
  into actor_role
  from public.pilot_memberships membership
  where membership.tenant_id = selected_workspace.tenant_id
    and membership.user_id = (select auth.uid())
    and membership.role in ('tenant-admin', 'pilot-lead', 'reviewer')
  limit 1;

  if actor_role is null then
    raise exception 'protected-external-approval-evidence-role-denied';
  end if;

  reviewer_role_value := case domain_id_value
    when 'finance-methodology-policy' then 'finance lead or qualified accounting reviewer'
    when 'counsel-external-use-review' then 'qualified counsel'
    when 'executive-release-review' then 'founder or authorized executive'
    when 'privacy-security-review' then 'privacy/security owner'
    when 'clinical-governance-boundary-review' then 'clinical governance owner'
    when 'marketing-claims-review' then 'communications, counsel, and product owner'
    when 'buyer-permission-review' then 'customer owner and executive sponsor'
  end;

  retained_blockers_value := array[
    'Actual approval artifacts remain externally retained and are not stored in SCRIMED.',
    'This metadata record does not create legal, finance, security, privacy, clinical, marketing, buyer, production, reimbursement, securities, or live clinical execution approval.'
  ];

  release_restrictions_value := case domain_id_value
    when 'finance-methodology-policy' then array['No audited financial reporting.', 'No valuation, margin, investment, accounting, tax, or securities claim.']
    when 'counsel-external-use-review' then array['No legal opinion storage.', 'No fundraising, securities, PR, advertising, buyer, or public release authority.']
    when 'executive-release-review' then array['No executive override of qualified approval gates.', 'No uncontrolled external distribution.']
    when 'privacy-security-review' then array['No PHI, credentials, source contracts, signed BAAs/DPAs, or security artifacts.', 'No HIPAA, SOC 2, or customer certification claim.']
    when 'clinical-governance-boundary-review' then array['No autonomous diagnosis, treatment, patient outreach, payer submission, or medical-record mutation.', 'No clinical validation or patient-outcome claim.']
    when 'marketing-claims-review' then array['No advertising claim substantiation.', 'No public ROI, clinical, reimbursement, security, or certification claim.']
    when 'buyer-permission-review' then array['No customer logo, named reference, benchmark, case study, or deployment fact.', 'No customer-specific evidence release without written permission.']
  end;

  evidence_snapshot_value := jsonb_build_object(
    'domainId', domain_id_value,
    'domainLabel', domain_label_value,
    'relatedFinanceGateId', related_finance_gate_id_value,
    'financeGateRecordId', finance_gate_record_id_value,
    'financeGateLabel', selected_finance_gate.gate_label,
    'financeGateStatus', selected_finance_gate.gate_status,
    'externalReferenceLabel', external_reference_label_value,
    'externalSystem', external_system_value,
    'referenceLocator', reference_locator_value,
    'referenceOwner', reference_owner_value,
    'evidenceRetainedExternally', true,
    'approvalScope', 'external-evidence-reference-only',
    'evidenceAuthority', 'metadata-reference-only-not-approval',
    'storageAuthority', 'no-sensitive-document-storage',
    'releaseAuthority', 'external-use-blocked-until-qualified-release-approval',
    'financialReportingAuthority', 'not-audited-financial-report',
    'securitiesAuthority', 'not-securities-offering-material',
    'advertisingClaimsAuthority', 'not-advertising-claim-substantiation',
    'clinicalExecutionAuthority', 'not-authorized-live-care',
    'assuranceLevel', 'aal2',
    'syntheticOnly', true,
    'metadataOnly', true,
    'noPhi', true
  );

  insert into public.protected_external_approval_evidence_references (
    tenant_id,
    workspace_id,
    finance_gate_record_id,
    domain_id,
    domain_label,
    reference_status,
    approval_scope,
    external_reference_label,
    external_system,
    reference_locator,
    reference_owner,
    evidence_retained_externally,
    evidence_snapshot,
    retained_blockers,
    release_restrictions,
    attestation,
    review_note,
    data_boundary,
    evidence_authority,
    storage_authority,
    release_authority,
    financial_reporting_authority,
    securities_authority,
    advertising_claims_authority,
    clinical_execution_authority,
    recorded_by,
    boundary
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    finance_gate_record_id_value,
    domain_id_value,
    domain_label_value,
    'metadata-reference-recorded',
    'external-evidence-reference-only',
    external_reference_label_value,
    external_system_value,
    reference_locator_value,
    reference_owner_value,
    true,
    evidence_snapshot_value,
    retained_blockers_value,
    release_restrictions_value,
    attestation_value,
    review_note_value,
    data_boundary_value,
    'metadata-reference-only-not-approval',
    'no-sensitive-document-storage',
    'external-use-blocked-until-qualified-release-approval',
    'not-audited-financial-report',
    'not-securities-offering-material',
    'not-advertising-claim-substantiation',
    'not-authorized-live-care',
    (select auth.uid()),
    protected_boundary
  )
  returning id into created_reference_id;

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
    null,
    (select auth.uid()),
    'protected-external-approval-evidence-recorded',
    jsonb_build_object(
      'referenceId', created_reference_id,
      'domainId', domain_id_value,
      'relatedFinanceGateId', related_finance_gate_id_value,
      'financeGateRecordId', finance_gate_record_id_value,
      'externalSystem', external_system_value,
      'referenceStatus', 'metadata-reference-recorded',
      'actorRole', actor_role,
      'approvalScope', 'external-evidence-reference-only',
      'assuranceLevel', 'aal2',
      'syntheticOnly', true,
      'metadataOnly', true,
      'noPhi', true,
      'evidenceRetainedExternally', true,
      'evidenceAuthority', 'metadata-reference-only-not-approval',
      'storageAuthority', 'no-sensitive-document-storage',
      'releaseAuthority', 'external-use-blocked-until-qualified-release-approval',
      'financialReportingAuthority', 'not-audited-financial-report',
      'securitiesAuthority', 'not-securities-offering-material',
      'advertisingClaimsAuthority', 'not-advertising-claim-substantiation',
      'clinicalExecutionAuthority', 'not-authorized-live-care'
    )
  );

  return created_reference_id;
end;
$$;

create or replace function public.record_protected_external_approval_evidence_reference(
  p_workspace_slug text,
  p_reference_input jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_protected_external_approval_evidence_reference(
    p_workspace_slug,
    p_reference_input
  );
$$;

revoke all on function private.record_protected_external_approval_evidence_reference(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.record_protected_external_approval_evidence_reference(text, jsonb)
  from public, anon, authenticated, service_role;

grant execute on function private.record_protected_external_approval_evidence_reference(text, jsonb)
  to authenticated;
grant execute on function public.record_protected_external_approval_evidence_reference(text, jsonb)
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
    'schemaVersion', '2026-06-20.1',
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
    'secureEvidenceVaultReadiness', 'aal2-private-rpc-disabled-by-default-storage-control-readiness',
    'salesBuyerDemoSessions', 'aal2-private-rpc-no-phi-demo-session-history',
    'manualQaEvidencePackets', 'aal2-tenant-scoped-no-secret-evidence-persistence',
    'commandIntelligenceSnapshots', 'aal2-audited-command-posture-history',
    'commandIntelligencePackets', 'write-before-release-command-intelligence-packets',
    'clinicalActivationApprovals', 'aal2-no-phi-approval-ledger-live-care-blocked',
    'protectedOperatorMetrics', 'aal2-public-market-operator-metric-ledger-no-phi',
    'protectedMetricRollups', 'aal2-finance-reviewed-metric-rollups-no-phi',
    'protectedMetricRollupPackets', 'aal2-audited-board-metric-packets-no-phi',
    'protectedMetricTrendReviews', 'aal2-board-trend-review-no-phi',
    'protectedMetricTrendPackets', 'aal2-audited-board-trend-packets-no-phi',
    'protectedBoardScorecards', 'aal2-rolling-quarter-board-scorecards-no-phi',
    'protectedBoardScorecardPackets', 'aal2-audited-board-scorecard-packets-no-phi',
    'protectedFinanceMethodologyGates', 'aal2-finance-methodology-gates-no-phi',
    'protectedFinanceMethodologyPackets', 'aal2-audited-finance-methodology-gate-packets-no-phi',
    'protectedExternalApprovalEvidence', 'aal2-qualified-external-approval-evidence-links-no-phi',
    'protectedExternalApprovalEvidencePackets', 'aal2-audited-external-approval-evidence-link-packets-no-phi'
  );
$$;

comment on table public.protected_external_approval_evidence_references is
  'Tenant-scoped no-PHI metadata references to externally retained approval artifacts for protected finance methodology release readiness. RLS select requires authenticated AAL2 governance context and tenant membership. Writes require guarded RPC. No PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, signed BAAs/DPAs, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, clinical validation, compliance certification, advertising claim substantiation, customer permission artifacts, production authorization, or live clinical execution approval is permitted.';
comment on function private.record_protected_external_approval_evidence_reference(text, jsonb) is
  'Records a bounded no-PHI external approval evidence metadata reference after AAL2 governance authorization and appends an audit event. This is reference metadata only and does not create legal, finance, security, privacy, clinical, marketing, customer, reimbursement, compliance, production, or release authority.';
