create table if not exists public.protected_provider_security_reviews (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  review_domain text not null check (
    review_domain in (
      'security-architecture',
      'privacy-impact',
      'baa-dpa-readiness',
      'credential-handling',
      'incident-response',
      'data-retention-residency',
      'vendor-risk',
      'go-live-rollback'
    )
  ),
  review_domain_label text not null check (
    char_length(review_domain_label) between 4 and 100
    and review_domain_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,99}$'
  ),
  review_status text not null check (
    review_status in (
      'provider-security-review-metadata-recorded',
      'provider-security-review-ready-not-approval',
      'blocked'
    )
  ),
  approval_scope text not null default 'provider-security-review-readiness-only'
    check (approval_scope = 'provider-security-review-readiness-only'),
  provider_adapter_record_ids uuid[] not null
    check (cardinality(provider_adapter_record_ids) between 1 and 10),
  security_owner_label text not null check (
    char_length(security_owner_label) between 4 and 140
    and security_owner_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  privacy_owner_label text not null check (
    char_length(privacy_owner_label) between 4 and 140
    and privacy_owner_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  agreement_path_label text not null check (
    char_length(agreement_path_label) between 4 and 140
    and agreement_path_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  incident_response_path_label text not null check (
    char_length(incident_response_path_label) between 4 and 140
    and incident_response_path_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  retention_residency_path_label text not null check (
    char_length(retention_residency_path_label) between 4 and 140
    and retention_residency_path_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  rollback_plan_label text not null check (
    char_length(rollback_plan_label) between 4 and 140
    and rollback_plan_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  review_cadence text not null check (
    char_length(review_cadence) between 4 and 120
    and review_cadence ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,119}$'
  ),
  provider_security_risk text not null check (
    provider_security_risk in ('not-assessed', 'low', 'moderate', 'high')
  ),
  evidence_snapshot jsonb not null default '{}'::jsonb
    check (jsonb_typeof(evidence_snapshot) = 'object' and pg_column_size(evidence_snapshot) <= 8192),
  required_security_controls text[] not null
    check (cardinality(required_security_controls) = 12),
  linked_security_controls text[] not null default '{}'::text[]
    check (cardinality(linked_security_controls) between 0 and 12),
  missing_security_controls text[] not null default '{}'::text[]
    check (cardinality(missing_security_controls) between 0 and 12),
  retained_blockers text[] not null default '{}'::text[]
    check (cardinality(retained_blockers) between 1 and 18),
  release_restrictions text[] not null default '{}'::text[]
    check (cardinality(release_restrictions) between 1 and 18),
  external_security_review_retained boolean not null default true
    check (external_security_review_retained is true),
  phi_processing_disabled boolean not null default true
    check (phi_processing_disabled is true),
  credential_storage_disabled boolean not null default true
    check (credential_storage_disabled is true),
  signed_agreement_storage_disabled boolean not null default true
    check (signed_agreement_storage_disabled is true),
  live_integration_disabled boolean not null default true
    check (live_integration_disabled is true),
  human_approval_required boolean not null default true
    check (human_approval_required is true),
  attestation text not null check (
    attestation = 'provider-security-review-metadata-no-phi'
  ),
  review_note text not null default '' check (char_length(review_note) <= 300),
  data_boundary text not null check (data_boundary = 'synthetic-business-workflow-only'),
  provider_security_review_authority text not null default 'provider-security-review-readiness-not-security-approval'
    check (provider_security_review_authority = 'provider-security-review-readiness-not-security-approval'),
  baa_dpa_authority text not null default 'pre-production-baa-dpa-readiness-not-executed-agreement'
    check (baa_dpa_authority = 'pre-production-baa-dpa-readiness-not-executed-agreement'),
  storage_authority text not null default 'provider-security-review-metadata-only-no-credentials-phi-or-legal-artifacts'
    check (storage_authority = 'provider-security-review-metadata-only-no-credentials-phi-or-legal-artifacts'),
  provider_adapter_authority text not null default 'provider-adapter-contract-metadata-not-integration-approval'
    check (provider_adapter_authority = 'provider-adapter-contract-metadata-not-integration-approval'),
  provider_adapter_release_authority text not null default 'integration-disabled-pending-external-provider-contracting'
    check (provider_adapter_release_authority = 'integration-disabled-pending-external-provider-contracting'),
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
    'Protected Provider Security Reviews record metadata-only readiness for externally retained security, privacy, BAA/DPA, credential-handling, incident-response, retention/residency, vendor-risk, and go-live rollback review. They do not store PHI, patient identifiers, payer member data, live clinical records, source documents, source contracts, secrets, credentials, URLs, access tokens, raw logs, raw log rows, IP addresses, device identifiers, recipient names, recipient email addresses, signed agreements, signed BAAs/DPAs, legal opinions, security questionnaire answers containing confidential details, SOC reports, penetration-test reports, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, advertising claim substantiation, clinical validation, compliance certification, customer permission artifacts, public release approval, external distribution approval, production authorization, live integration approval, or live clinical execution approval.'
);

create index if not exists protected_provider_security_reviews_tenant_recorded_at_idx
  on public.protected_provider_security_reviews(tenant_id, recorded_at desc);
create index if not exists protected_provider_security_reviews_workspace_recorded_at_idx
  on public.protected_provider_security_reviews(workspace_id, recorded_at desc);
create index if not exists protected_provider_security_reviews_domain_idx
  on public.protected_provider_security_reviews(workspace_id, review_domain, recorded_at desc);
create index if not exists protected_provider_security_reviews_status_idx
  on public.protected_provider_security_reviews(workspace_id, review_status, recorded_at desc);
create index if not exists protected_provider_security_reviews_recorded_by_idx
  on public.protected_provider_security_reviews(recorded_by);

alter table public.protected_provider_security_reviews enable row level security;
revoke all on public.protected_provider_security_reviews from public, anon, authenticated;
grant select on public.protected_provider_security_reviews to authenticated;

drop policy if exists protected_provider_security_reviews_member_select
  on public.protected_provider_security_reviews;
create policy protected_provider_security_reviews_member_select
on public.protected_provider_security_reviews
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
      'protected-external-approval-evidence-recorded',
      'protected-release-decision-recorded',
      'protected-named-reviewer-signoff-recorded',
      'protected-distribution-lockbox-recorded',
      'protected-release-authority-attestation-recorded',
      'protected-evidence-room-recipient-attestation-recorded',
      'protected-evidence-room-access-log-reconciliation-recorded',
      'protected-evidence-room-provider-adapter-recorded',
      'protected-provider-security-review-recorded'
    )
  );

create or replace function private.record_protected_provider_security_review(
  p_workspace_slug text,
  p_review_input jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  normalized_input jsonb := coalesce(p_review_input, '{}'::jsonb);
  provider_adapter_record_ids_value uuid[] := '{}'::uuid[];
  provider_adapter_count_value integer := 0;
  supplied_provider_adapter_count_value integer := 0;
  review_domain_value text;
  review_domain_label_value text;
  security_owner_label_value text;
  privacy_owner_label_value text;
  agreement_path_label_value text;
  incident_response_path_label_value text;
  retention_residency_path_label_value text;
  rollback_plan_label_value text;
  review_cadence_value text;
  provider_security_risk_value text;
  attestation_value text;
  data_boundary_value text;
  review_note_value text;
  actor_role text;
  required_controls text[] := array[
    'provider-adapter-contract-ready',
    'security-owner-assigned',
    'privacy-owner-assigned',
    'baa-dpa-path-defined',
    'phi-processing-disabled',
    'credential-storage-disabled',
    'signed-agreement-storage-disabled',
    'incident-response-path-defined',
    'retention-residency-path-defined',
    'live-integration-disabled',
    'rollback-plan-defined',
    'human-approval-required'
  ];
  linked_controls text[] := array[
    'security-owner-assigned',
    'privacy-owner-assigned',
    'baa-dpa-path-defined',
    'phi-processing-disabled',
    'credential-storage-disabled',
    'signed-agreement-storage-disabled',
    'incident-response-path-defined',
    'retention-residency-path-defined',
    'live-integration-disabled',
    'rollback-plan-defined',
    'human-approval-required'
  ];
  missing_controls text[] := '{}'::text[];
  retained_blockers_value text[];
  release_restrictions_value text[];
  review_status_value text;
  evidence_snapshot_value jsonb;
  created_review_id uuid;
  protected_boundary text :=
    'Protected Provider Security Reviews record metadata-only readiness for externally retained security, privacy, BAA/DPA, credential-handling, incident-response, retention/residency, vendor-risk, and go-live rollback review. They do not store PHI, patient identifiers, payer member data, live clinical records, source documents, source contracts, secrets, credentials, URLs, access tokens, raw logs, raw log rows, IP addresses, device identifiers, recipient names, recipient email addresses, signed agreements, signed BAAs/DPAs, legal opinions, security questionnaire answers containing confidential details, SOC reports, penetration-test reports, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, advertising claim substantiation, clinical validation, compliance certification, customer permission artifacts, public release approval, external distribution approval, production authorization, live integration approval, or live clinical execution approval.';
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead', 'reviewer']
  );

  if jsonb_typeof(normalized_input) <> 'object'
    or pg_column_size(normalized_input) > 6144 then
    raise exception 'protected-provider-security-review-invalid-payload';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(normalized_input) as supplied(key)
    where supplied.key <> all(array[
      'providerAdapterRecordIds',
      'reviewDomain',
      'securityOwnerLabel',
      'privacyOwnerLabel',
      'agreementPathLabel',
      'incidentResponsePathLabel',
      'retentionResidencyPathLabel',
      'rollbackPlanLabel',
      'reviewCadence',
      'providerSecurityRisk',
      'externalSecurityReviewRetained',
      'phiProcessingDisabled',
      'credentialStorageDisabled',
      'signedAgreementStorageDisabled',
      'liveIntegrationDisabled',
      'humanApprovalRequired',
      'attestation',
      'dataBoundary',
      'reviewNote'
    ])
  ) then
    raise exception 'protected-provider-security-review-unsupported-field';
  end if;

  if jsonb_typeof(normalized_input -> 'providerAdapterRecordIds') <> 'array' then
    raise exception 'protected-provider-security-review-invalid-provider-adapters';
  end if;

  begin
    select count(*)
    into supplied_provider_adapter_count_value
    from jsonb_array_elements_text(normalized_input -> 'providerAdapterRecordIds');

    select coalesce(array_agg(distinct ids.value::uuid order by ids.value::uuid), '{}'::uuid[])
    into provider_adapter_record_ids_value
    from jsonb_array_elements_text(normalized_input -> 'providerAdapterRecordIds') as ids(value);
  exception when others then
    raise exception 'protected-provider-security-review-invalid-typed-field';
  end;

  review_domain_value := trim(coalesce(normalized_input ->> 'reviewDomain', ''));
  security_owner_label_value := left(trim(coalesce(normalized_input ->> 'securityOwnerLabel', '')), 141);
  privacy_owner_label_value := left(trim(coalesce(normalized_input ->> 'privacyOwnerLabel', '')), 141);
  agreement_path_label_value := left(trim(coalesce(normalized_input ->> 'agreementPathLabel', '')), 141);
  incident_response_path_label_value := left(trim(coalesce(normalized_input ->> 'incidentResponsePathLabel', '')), 141);
  retention_residency_path_label_value := left(trim(coalesce(normalized_input ->> 'retentionResidencyPathLabel', '')), 141);
  rollback_plan_label_value := left(trim(coalesce(normalized_input ->> 'rollbackPlanLabel', '')), 141);
  review_cadence_value := left(trim(coalesce(normalized_input ->> 'reviewCadence', '')), 121);
  provider_security_risk_value := trim(coalesce(normalized_input ->> 'providerSecurityRisk', ''));
  attestation_value := trim(coalesce(normalized_input ->> 'attestation', ''));
  data_boundary_value := trim(coalesce(normalized_input ->> 'dataBoundary', ''));
  review_note_value := left(trim(coalesce(normalized_input ->> 'reviewNote', '')), 301);

  review_domain_label_value := case review_domain_value
    when 'security-architecture' then 'Security architecture'
    when 'privacy-impact' then 'Privacy impact'
    when 'baa-dpa-readiness' then 'BAA/DPA readiness'
    when 'credential-handling' then 'Credential handling'
    when 'incident-response' then 'Incident response'
    when 'data-retention-residency' then 'Retention and residency'
    when 'vendor-risk' then 'Vendor risk'
    when 'go-live-rollback' then 'Go-live and rollback'
    else ''
  end;

  if cardinality(provider_adapter_record_ids_value) < 1
    or cardinality(provider_adapter_record_ids_value) > 10
    or cardinality(provider_adapter_record_ids_value) <> supplied_provider_adapter_count_value
    or review_domain_label_value = ''
    or security_owner_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or privacy_owner_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or agreement_path_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or incident_response_path_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or retention_residency_path_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or rollback_plan_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or review_cadence_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,119}$'
    or provider_security_risk_value not in ('not-assessed', 'low', 'moderate', 'high')
    or coalesce(normalized_input ->> 'externalSecurityReviewRetained', '') <> 'true'
    or coalesce(normalized_input ->> 'phiProcessingDisabled', '') <> 'true'
    or coalesce(normalized_input ->> 'credentialStorageDisabled', '') <> 'true'
    or coalesce(normalized_input ->> 'signedAgreementStorageDisabled', '') <> 'true'
    or coalesce(normalized_input ->> 'liveIntegrationDisabled', '') <> 'true'
    or coalesce(normalized_input ->> 'humanApprovalRequired', '') <> 'true'
    or attestation_value <> 'provider-security-review-metadata-no-phi'
    or data_boundary_value <> 'synthetic-business-workflow-only'
    or char_length(review_note_value) > 300 then
    raise exception 'protected-provider-security-review-validation-failed';
  end if;

  if array_to_string(provider_adapter_record_ids_value, ' ') || ' ' || review_domain_value || ' ' || security_owner_label_value || ' ' || privacy_owner_label_value || ' ' || agreement_path_label_value || ' ' || incident_response_path_label_value || ' ' || retention_residency_path_label_value || ' ' || rollback_plan_label_value || ' ' || review_cadence_value || ' ' || provider_security_risk_value || ' ' || review_note_value ~*
    '(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|sk-[A-Za-z0-9_-]{12,}|sbp_[A-Za-z0-9_-]{12,}|bearer[[:space:]]+[A-Za-z0-9._-]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|token|secret|password|api[ _-]?key|access[ _-]?key|client[ _-]?secret|oauth|https?:\/\/|ip address|device[ _-]?id|raw[ _-]?log|log row|patient[ _-]?(id|identifier|mrn)|member[ _-]?(id|identifier)|medical record|protected health information|payer member|diagnosis code|social security|source (contract|document|record|file)|signed[ _-]?(baa|dpa|contract|agreement|document|approval)|legal opinion|soc[ _-]?2[ _-]?(report|certified|certification)|penetration[ _-]?test|vulnerability[ _-]?report|security questionnaire answer|audited financial|investment recommendation|securities offering|valuation guarantee|revenue guarantee|reimbursement guarantee|guaranteed savings|guaranteed outcome|advertising substantiation|clinical validation|compliance certification|fda[ _-]?cleared|hipaa[ _-]?(compliant|certified)|autonomous diagnosis|treatment recommendation|live clinical execution|public release approved|external distribution approved|release approved|export approved|integration approved|security approved|privacy approved|baa executed|dpa executed|live integration|release enabled|export enabled)' then
    raise exception 'protected-provider-security-review-prohibited-content';
  end if;

  select membership.role
  into actor_role
  from public.pilot_memberships membership
  where membership.tenant_id = selected_workspace.tenant_id
    and membership.user_id = (select auth.uid())
    and membership.role in ('tenant-admin', 'pilot-lead', 'reviewer')
  limit 1;

  if actor_role is null then
    raise exception 'protected-provider-security-review-role-denied';
  end if;

  select count(*)
  into provider_adapter_count_value
  from public.protected_evidence_room_provider_adapters adapter
  where adapter.id = any(provider_adapter_record_ids_value)
    and adapter.workspace_id = selected_workspace.id
    and adapter.tenant_id = selected_workspace.tenant_id
    and adapter.external_provider_authority_retained is true
    and adapter.raw_log_import_disabled is true
    and adapter.credential_storage_disabled is true
    and adapter.export_disabled is true
    and adapter.adapter_status = 'provider-adapter-contract-ready-not-integration-approval'
    and adapter.provider_risk_tier in ('low', 'moderate')
    and cardinality(adapter.missing_provider_controls) = 0;

  if provider_adapter_count_value <> cardinality(provider_adapter_record_ids_value) then
    raise exception 'protected-provider-security-review-provider-adapters-not-ready';
  end if;

  linked_controls := linked_controls || array['provider-adapter-contract-ready'];

  select coalesce(array_agg(distinct control order by control), '{}'::text[])
  into linked_controls
  from unnest(linked_controls) as control;

  select coalesce(array_agg(control order by control), '{}'::text[])
  into missing_controls
  from unnest(required_controls) as control
  where control <> all(linked_controls);

  review_status_value := case
    when provider_security_risk_value in ('not-assessed', 'high') then 'blocked'
    when cardinality(missing_controls) = 0 then 'provider-security-review-ready-not-approval'
    else 'provider-security-review-metadata-recorded'
  end;

  retained_blockers_value := array[
    'Live integration disabled: true',
    'PHI processing, provider credentials, provider URLs, access tokens, raw logs, signed legal artifacts, SOC reports, penetration-test reports, security questionnaire answers, legal opinions, customer permissions, and production runbooks must be retained outside SCRIMED.',
    'This metadata does not create security approval, privacy approval, legal approval, BAA/DPA execution, compliance certification, production authorization, reimbursement assurance, public release authority, external distribution authority, live integration approval, or live clinical execution authority.'
  ];

  release_restrictions_value := array[
    'No provider integration, credential storage, PHI processing, raw-log import, public release, customer proof use, investor distribution, sales collateral release, marketing publication, PR release, case-study distribution, or live-care workflow can be enabled by this SCRIMED metadata layer.',
    'No PHI, source documents, source contracts, raw access logs, recipient identifiers, IP addresses, device identifiers, provider credentials, provider URLs, signed approvals, signed BAAs/DPAs, legal opinions, SOC reports, penetration-test reports, security questionnaire answers, audited financial statements, securities materials, advertising substantiation, clinical validation, production authorization, or live-care records may be stored here.',
    'Unresolved provider risk, incomplete security review, missing privacy review, missing BAA/DPA path where applicable, missing credential-vault plan, missing incident response path, missing retention/residency review, missing rollback plan, or absent customer approval must block production activation.',
    'Provider security review authority remains externally retained, independently reviewed, and disabled until customer-approved production integration controls exist.'
  ];

  evidence_snapshot_value := jsonb_build_object(
    'reviewDomain', review_domain_value,
    'reviewDomainLabel', review_domain_label_value,
    'reviewStatus', review_status_value,
    'approvalScope', 'provider-security-review-readiness-only',
    'providerAdapterRecordIds', provider_adapter_record_ids_value,
    'securityOwnerLabel', security_owner_label_value,
    'privacyOwnerLabel', privacy_owner_label_value,
    'agreementPathLabel', agreement_path_label_value,
    'incidentResponsePathLabel', incident_response_path_label_value,
    'retentionResidencyPathLabel', retention_residency_path_label_value,
    'rollbackPlanLabel', rollback_plan_label_value,
    'reviewCadence', review_cadence_value,
    'providerSecurityRisk', provider_security_risk_value,
    'requiredSecurityControls', required_controls,
    'linkedSecurityControls', linked_controls,
    'missingSecurityControls', missing_controls,
    'externalSecurityReviewRetained', true,
    'phiProcessingDisabled', true,
    'credentialStorageDisabled', true,
    'signedAgreementStorageDisabled', true,
    'liveIntegrationDisabled', true,
    'humanApprovalRequired', true,
    'providerSecurityReviewAuthority', 'provider-security-review-readiness-not-security-approval',
    'baaDpaAuthority', 'pre-production-baa-dpa-readiness-not-executed-agreement',
    'storageAuthority', 'provider-security-review-metadata-only-no-credentials-phi-or-legal-artifacts',
    'providerAdapterAuthority', 'provider-adapter-contract-metadata-not-integration-approval',
    'assuranceLevel', 'aal2',
    'syntheticOnly', true,
    'metadataOnly', true,
    'noPhi', true
  );

  insert into public.protected_provider_security_reviews (
    tenant_id,
    workspace_id,
    review_domain,
    review_domain_label,
    review_status,
    approval_scope,
    provider_adapter_record_ids,
    security_owner_label,
    privacy_owner_label,
    agreement_path_label,
    incident_response_path_label,
    retention_residency_path_label,
    rollback_plan_label,
    review_cadence,
    provider_security_risk,
    evidence_snapshot,
    required_security_controls,
    linked_security_controls,
    missing_security_controls,
    retained_blockers,
    release_restrictions,
    external_security_review_retained,
    phi_processing_disabled,
    credential_storage_disabled,
    signed_agreement_storage_disabled,
    live_integration_disabled,
    human_approval_required,
    attestation,
    review_note,
    data_boundary,
    provider_security_review_authority,
    baa_dpa_authority,
    storage_authority,
    provider_adapter_authority,
    provider_adapter_release_authority,
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
    review_domain_value,
    review_domain_label_value,
    review_status_value,
    'provider-security-review-readiness-only',
    provider_adapter_record_ids_value,
    security_owner_label_value,
    privacy_owner_label_value,
    agreement_path_label_value,
    incident_response_path_label_value,
    retention_residency_path_label_value,
    rollback_plan_label_value,
    review_cadence_value,
    provider_security_risk_value,
    evidence_snapshot_value,
    required_controls,
    linked_controls,
    missing_controls,
    retained_blockers_value,
    release_restrictions_value,
    true,
    true,
    true,
    true,
    true,
    true,
    attestation_value,
    review_note_value,
    data_boundary_value,
    'provider-security-review-readiness-not-security-approval',
    'pre-production-baa-dpa-readiness-not-executed-agreement',
    'provider-security-review-metadata-only-no-credentials-phi-or-legal-artifacts',
    'provider-adapter-contract-metadata-not-integration-approval',
    'integration-disabled-pending-external-provider-contracting',
    'not-audited-financial-report',
    'not-securities-offering-material',
    'not-advertising-claim-substantiation',
    'not-authorized-live-care',
    (select auth.uid()),
    protected_boundary
  )
  returning id into created_review_id;

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
    'protected-provider-security-review-recorded',
    jsonb_build_object(
      'reviewId', created_review_id,
      'reviewDomain', review_domain_value,
      'reviewDomainLabel', review_domain_label_value,
      'reviewStatus', review_status_value,
      'providerAdapterRecordIds', provider_adapter_record_ids_value,
      'requiredSecurityControls', required_controls,
      'linkedSecurityControls', linked_controls,
      'missingSecurityControls', missing_controls,
      'providerSecurityRisk', provider_security_risk_value,
      'actorRole', actor_role,
      'approvalScope', 'provider-security-review-readiness-only',
      'externalSecurityReviewRetained', true,
      'phiProcessingDisabled', true,
      'credentialStorageDisabled', true,
      'signedAgreementStorageDisabled', true,
      'liveIntegrationDisabled', true,
      'humanApprovalRequired', true,
      'assuranceLevel', 'aal2',
      'syntheticOnly', true,
      'metadataOnly', true,
      'noPhi', true,
      'providerSecurityReviewAuthority', 'provider-security-review-readiness-not-security-approval',
      'baaDpaAuthority', 'pre-production-baa-dpa-readiness-not-executed-agreement',
      'storageAuthority', 'provider-security-review-metadata-only-no-credentials-phi-or-legal-artifacts',
      'financialReportingAuthority', 'not-audited-financial-report',
      'securitiesAuthority', 'not-securities-offering-material',
      'advertisingClaimsAuthority', 'not-advertising-claim-substantiation',
      'clinicalExecutionAuthority', 'not-authorized-live-care'
    )
  );

  return created_review_id;
end;
$$;

create or replace function public.record_protected_provider_security_review(
  p_workspace_slug text,
  p_review_input jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_protected_provider_security_review(
    p_workspace_slug,
    p_review_input
  );
$$;

revoke all on function private.record_protected_provider_security_review(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.record_protected_provider_security_review(text, jsonb)
  from public, anon, authenticated, service_role;

grant execute on function private.record_protected_provider_security_review(text, jsonb)
  to authenticated;
grant execute on function public.record_protected_provider_security_review(text, jsonb)
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
    'schemaVersion', '2026-06-20.9',
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
  ) || jsonb_build_object(
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
    'protectedBoardScorecardPackets', 'aal2-audited-board-scorecard-packets-no-phi'
  ) || jsonb_build_object(
    'protectedFinanceMethodologyGates', 'aal2-finance-methodology-gates-no-phi',
    'protectedFinanceMethodologyPackets', 'aal2-audited-finance-methodology-gate-packets-no-phi',
    'protectedExternalApprovalEvidence', 'aal2-qualified-external-approval-evidence-links-no-phi',
    'protectedExternalApprovalEvidencePackets', 'aal2-audited-external-approval-evidence-link-packets-no-phi',
    'protectedReleaseDecisionWorkflow', 'aal2-qualified-release-decision-workflow-no-phi',
    'protectedReleaseDecisionPackets', 'aal2-audited-release-decision-claim-registry-packets-no-phi',
    'protectedNamedReviewerSignoffs', 'aal2-named-reviewer-signoff-metadata-no-phi',
    'protectedNamedReviewerSignoffPackets', 'aal2-audited-named-reviewer-signoff-packets-no-phi',
    'protectedDistributionLockboxes', 'aal2-external-distribution-lockbox-disabled-no-phi',
    'protectedDistributionLockboxPackets', 'aal2-audited-distribution-lockbox-packets-no-phi',
    'protectedReleaseAuthorityAttestations', 'aal2-external-release-authority-attestations-disabled-no-phi',
    'protectedReleaseAuthorityAttestationPackets', 'aal2-audited-release-authority-attestation-packets-no-phi',
    'protectedEvidenceRoomRecipientAttestations', 'aal2-evidence-room-recipient-attestations-disabled-no-phi',
    'protectedEvidenceRoomRecipientAttestationPackets', 'aal2-audited-evidence-room-recipient-attestation-packets-no-phi',
    'protectedEvidenceRoomAccessLogReconciliations', 'aal2-evidence-room-access-log-reconciliation-disabled-no-phi',
    'protectedEvidenceRoomAccessLogReconciliationPackets', 'aal2-audited-evidence-room-access-log-reconciliation-packets-no-phi',
    'protectedEvidenceRoomProviderAdapters', 'aal2-evidence-room-provider-adapter-contracts-disabled-no-phi',
    'protectedEvidenceRoomProviderAdapterPackets', 'aal2-audited-evidence-room-provider-adapter-packets-no-phi',
    'protectedProviderSecurityReviews', 'aal2-provider-security-review-workbench-no-phi',
    'protectedProviderSecurityReviewPackets', 'aal2-audited-provider-security-review-packets-no-phi'
  );
$$;

comment on table public.protected_provider_security_reviews is
  'Tenant-scoped no-PHI provider security review metadata for pre-production security, privacy, BAA/DPA, credential, incident-response, retention/residency, vendor-risk, and rollback readiness. RLS select requires authenticated AAL2 governance context and tenant membership. Writes require guarded RPC. This table does not store PHI, patient identifiers, payer member data, live clinical records, source documents, source contracts, secrets, credentials, URLs, access tokens, raw logs, IP addresses, device identifiers, signed agreements, legal opinions, SOC reports, penetration-test reports, security questionnaire answers, audited financial statements, securities offering material, advertising substantiation, customer permission artifacts, public release approval, external distribution approval, production authorization, live integration approval, or live clinical execution approval.';
comment on function private.record_protected_provider_security_review(text, jsonb) is
  'Records bounded no-PHI provider security review metadata after AAL2 governance authorization and appends an audit event. This is not security approval, privacy approval, legal approval, BAA/DPA execution, compliance certification, production authorization, clinical validation, reimbursement assurance, live integration approval, or live clinical execution authority.';
