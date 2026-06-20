create table if not exists public.protected_procurement_evidence_registry (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  target_audience text not null check (
    target_audience in (
      'provider-health-system',
      'payer-plan',
      'government-public-health',
      'life-sciences-research',
      'employer-benefits',
      'global-channel-partner',
      'investor-board-review'
    )
  ),
  target_audience_label text not null check (
    char_length(target_audience_label) between 4 and 120
    and target_audience_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,119}$'
  ),
  procurement_domain text not null check (
    procurement_domain in (
      'security-questionnaire',
      'privacy-questionnaire',
      'legal-procurement',
      'vendor-risk',
      'technical-diligence',
      'commercial-procurement',
      'data-governance',
      'implementation-readiness'
    )
  ),
  procurement_domain_label text not null check (
    char_length(procurement_domain_label) between 4 and 120
    and procurement_domain_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,119}$'
  ),
  evidence_class text not null check (
    evidence_class in (
      'questionnaire-response-routing',
      'security-assurance-routing',
      'privacy-dpa-routing',
      'contracting-routing',
      'architecture-evidence-routing',
      'operations-runbook-routing',
      'pricing-commercial-routing',
      'implementation-plan-routing'
    )
  ),
  evidence_class_label text not null check (
    char_length(evidence_class_label) between 4 and 120
    and evidence_class_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,119}$'
  ),
  registry_status text not null check (
    registry_status in (
      'procurement-evidence-metadata-recorded',
      'procurement-evidence-routing-ready-not-approval',
      'blocked'
    )
  ),
  approval_scope text not null default 'procurement-evidence-routing-readiness-only'
    check (approval_scope = 'procurement-evidence-routing-readiness-only'),
  provider_security_review_record_ids uuid[] not null
    check (cardinality(provider_security_review_record_ids) between 1 and 10),
  procurement_owner_label text not null check (
    char_length(procurement_owner_label) between 4 and 140
    and procurement_owner_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  buyer_segment_label text not null check (
    char_length(buyer_segment_label) between 4 and 140
    and buyer_segment_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  external_system_label text not null check (
    char_length(external_system_label) between 4 and 140
    and external_system_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  evidence_routing_label text not null check (
    char_length(evidence_routing_label) between 4 and 140
    and evidence_routing_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  evidence_routing_locator text not null check (
    char_length(evidence_routing_locator) between 4 and 160
    and evidence_routing_locator ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,159}$'
  ),
  response_cadence text not null check (
    char_length(response_cadence) between 4 and 120
    and response_cadence ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,119}$'
  ),
  procurement_risk_tier text not null check (
    procurement_risk_tier in ('not-assessed', 'low', 'moderate', 'high')
  ),
  evidence_snapshot jsonb not null default '{}'::jsonb
    check (jsonb_typeof(evidence_snapshot) = 'object' and pg_column_size(evidence_snapshot) <= 8192),
  required_procurement_controls text[] not null
    check (cardinality(required_procurement_controls) = 14),
  linked_procurement_controls text[] not null default '{}'::text[]
    check (cardinality(linked_procurement_controls) between 0 and 14),
  missing_procurement_controls text[] not null default '{}'::text[]
    check (cardinality(missing_procurement_controls) between 0 and 14),
  retained_blockers text[] not null default '{}'::text[]
    check (cardinality(retained_blockers) between 1 and 20),
  release_restrictions text[] not null default '{}'::text[]
    check (cardinality(release_restrictions) between 1 and 20),
  security_questionnaire_retained_externally boolean not null default true
    check (security_questionnaire_retained_externally is true),
  soc_report_retained_externally boolean not null default true
    check (soc_report_retained_externally is true),
  pentest_report_retained_externally boolean not null default true
    check (pentest_report_retained_externally is true),
  signed_legal_artifacts_retained_externally boolean not null default true
    check (signed_legal_artifacts_retained_externally is true),
  credential_storage_disabled boolean not null default true
    check (credential_storage_disabled is true),
  phi_processing_disabled boolean not null default true
    check (phi_processing_disabled is true),
  confidential_answer_storage_disabled boolean not null default true
    check (confidential_answer_storage_disabled is true),
  human_approval_required boolean not null default true
    check (human_approval_required is true),
  external_distribution_disabled boolean not null default true
    check (external_distribution_disabled is true),
  attestation text not null check (
    attestation = 'procurement-evidence-routing-metadata-no-sensitive-artifacts'
  ),
  review_note text not null default '' check (char_length(review_note) <= 300),
  data_boundary text not null check (data_boundary = 'synthetic-business-workflow-only'),
  procurement_evidence_registry_authority text not null default 'procurement-evidence-routing-readiness-not-procurement-approval'
    check (procurement_evidence_registry_authority = 'procurement-evidence-routing-readiness-not-procurement-approval'),
  provider_security_review_authority text not null default 'provider-security-review-readiness-not-security-approval'
    check (provider_security_review_authority = 'provider-security-review-readiness-not-security-approval'),
  provider_security_review_baa_dpa_authority text not null default 'pre-production-baa-dpa-readiness-not-executed-agreement'
    check (provider_security_review_baa_dpa_authority = 'pre-production-baa-dpa-readiness-not-executed-agreement'),
  provider_security_review_storage_authority text not null default 'provider-security-review-metadata-only-no-credentials-phi-or-legal-artifacts'
    check (provider_security_review_storage_authority = 'provider-security-review-metadata-only-no-credentials-phi-or-legal-artifacts'),
  storage_authority text not null default 'procurement-routing-metadata-only-no-questionnaires-reports-credentials-or-phi'
    check (storage_authority = 'procurement-routing-metadata-only-no-questionnaires-reports-credentials-or-phi'),
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
    'Protected Procurement Evidence Registry records metadata-only routing for security questionnaires, privacy questionnaires, legal procurement, vendor risk, technical diligence, commercial procurement, data governance, and implementation readiness. It does not store PHI, patient identifiers, payer member data, live clinical records, source documents, source contracts, secrets, credentials, URLs, access tokens, confidential questionnaire answers, SOC reports, penetration-test reports, vulnerability reports, signed agreements, signed BAAs/DPAs, legal opinions, customer permission artifacts, public release approval, external distribution approval, production authorization, procurement approval, compliance certification, reimbursement assurance, advertising substantiation, or live clinical execution approval.'
);

create index if not exists protected_procurement_evidence_registry_tenant_recorded_at_idx
  on public.protected_procurement_evidence_registry(tenant_id, recorded_at desc);
create index if not exists protected_procurement_evidence_registry_workspace_recorded_at_idx
  on public.protected_procurement_evidence_registry(workspace_id, recorded_at desc);
create index if not exists protected_procurement_evidence_registry_audience_idx
  on public.protected_procurement_evidence_registry(workspace_id, target_audience, recorded_at desc);
create index if not exists protected_procurement_evidence_registry_domain_idx
  on public.protected_procurement_evidence_registry(workspace_id, procurement_domain, recorded_at desc);
create index if not exists protected_procurement_evidence_registry_status_idx
  on public.protected_procurement_evidence_registry(workspace_id, registry_status, recorded_at desc);
create index if not exists protected_procurement_evidence_registry_recorded_by_idx
  on public.protected_procurement_evidence_registry(recorded_by);

alter table public.protected_procurement_evidence_registry enable row level security;
revoke all on public.protected_procurement_evidence_registry from public, anon, authenticated;
grant select on public.protected_procurement_evidence_registry to authenticated;

drop policy if exists protected_procurement_evidence_registry_member_select
  on public.protected_procurement_evidence_registry;
create policy protected_procurement_evidence_registry_member_select
on public.protected_procurement_evidence_registry
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
      'protected-provider-security-review-recorded',
      'protected-procurement-evidence-recorded'
    )
  );

create or replace function private.record_protected_procurement_evidence(
  p_workspace_slug text,
  p_registry_input jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  normalized_input jsonb := coalesce(p_registry_input, '{}'::jsonb);
  provider_security_review_record_ids_value uuid[] := '{}'::uuid[];
  provider_security_review_count_value integer := 0;
  supplied_provider_security_review_count_value integer := 0;
  target_audience_value text;
  target_audience_label_value text;
  procurement_domain_value text;
  procurement_domain_label_value text;
  evidence_class_value text;
  evidence_class_label_value text;
  procurement_owner_label_value text;
  buyer_segment_label_value text;
  external_system_label_value text;
  evidence_routing_label_value text;
  evidence_routing_locator_value text;
  response_cadence_value text;
  procurement_risk_tier_value text;
  attestation_value text;
  data_boundary_value text;
  review_note_value text;
  actor_role text;
  required_controls text[] := array[
    'provider-security-review-ready',
    'target-audience-defined',
    'procurement-owner-assigned',
    'buyer-segment-defined',
    'external-system-identified',
    'security-questionnaire-retained-externally',
    'soc-report-retained-externally',
    'pentest-report-retained-externally',
    'signed-legal-artifacts-retained-externally',
    'credential-storage-disabled',
    'phi-processing-disabled',
    'confidential-answer-storage-disabled',
    'human-approval-required',
    'external-distribution-disabled'
  ];
  linked_controls text[] := array[
    'target-audience-defined',
    'procurement-owner-assigned',
    'buyer-segment-defined',
    'external-system-identified',
    'security-questionnaire-retained-externally',
    'soc-report-retained-externally',
    'pentest-report-retained-externally',
    'signed-legal-artifacts-retained-externally',
    'credential-storage-disabled',
    'phi-processing-disabled',
    'confidential-answer-storage-disabled',
    'human-approval-required',
    'external-distribution-disabled'
  ];
  missing_controls text[] := '{}'::text[];
  retained_blockers_value text[];
  release_restrictions_value text[];
  registry_status_value text;
  evidence_snapshot_value jsonb;
  created_registry_id uuid;
  protected_boundary text :=
    'Protected Procurement Evidence Registry records metadata-only routing for security questionnaires, privacy questionnaires, legal procurement, vendor risk, technical diligence, commercial procurement, data governance, and implementation readiness. It does not store PHI, patient identifiers, payer member data, live clinical records, source documents, source contracts, secrets, credentials, URLs, access tokens, confidential questionnaire answers, SOC reports, penetration-test reports, vulnerability reports, signed agreements, signed BAAs/DPAs, legal opinions, customer permission artifacts, public release approval, external distribution approval, production authorization, procurement approval, compliance certification, reimbursement assurance, advertising substantiation, or live clinical execution approval.';
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead', 'reviewer']
  );

  if jsonb_typeof(normalized_input) <> 'object'
    or pg_column_size(normalized_input) > 7168 then
    raise exception 'protected-procurement-evidence-invalid-payload';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(normalized_input) as supplied(key)
    where supplied.key <> all(array[
      'providerSecurityReviewRecordIds',
      'targetAudience',
      'procurementDomain',
      'evidenceClass',
      'procurementOwnerLabel',
      'buyerSegmentLabel',
      'externalSystemLabel',
      'evidenceRoutingLabel',
      'evidenceRoutingLocator',
      'responseCadence',
      'procurementRiskTier',
      'securityQuestionnaireRetainedExternally',
      'socReportRetainedExternally',
      'pentestReportRetainedExternally',
      'signedLegalArtifactsRetainedExternally',
      'credentialStorageDisabled',
      'phiProcessingDisabled',
      'confidentialAnswerStorageDisabled',
      'humanApprovalRequired',
      'externalDistributionDisabled',
      'attestation',
      'dataBoundary',
      'reviewNote'
    ])
  ) then
    raise exception 'protected-procurement-evidence-unsupported-field';
  end if;

  if jsonb_typeof(normalized_input -> 'providerSecurityReviewRecordIds') <> 'array' then
    raise exception 'protected-procurement-evidence-invalid-provider-security-reviews';
  end if;

  begin
    select count(*)
    into supplied_provider_security_review_count_value
    from jsonb_array_elements_text(normalized_input -> 'providerSecurityReviewRecordIds');

    select coalesce(array_agg(distinct ids.value::uuid order by ids.value::uuid), '{}'::uuid[])
    into provider_security_review_record_ids_value
    from jsonb_array_elements_text(normalized_input -> 'providerSecurityReviewRecordIds') as ids(value);
  exception when others then
    raise exception 'protected-procurement-evidence-invalid-typed-field';
  end;

  target_audience_value := trim(coalesce(normalized_input ->> 'targetAudience', ''));
  procurement_domain_value := trim(coalesce(normalized_input ->> 'procurementDomain', ''));
  evidence_class_value := trim(coalesce(normalized_input ->> 'evidenceClass', ''));
  procurement_owner_label_value := left(trim(coalesce(normalized_input ->> 'procurementOwnerLabel', '')), 141);
  buyer_segment_label_value := left(trim(coalesce(normalized_input ->> 'buyerSegmentLabel', '')), 141);
  external_system_label_value := left(trim(coalesce(normalized_input ->> 'externalSystemLabel', '')), 141);
  evidence_routing_label_value := left(trim(coalesce(normalized_input ->> 'evidenceRoutingLabel', '')), 141);
  evidence_routing_locator_value := left(trim(coalesce(normalized_input ->> 'evidenceRoutingLocator', '')), 161);
  response_cadence_value := left(trim(coalesce(normalized_input ->> 'responseCadence', '')), 121);
  procurement_risk_tier_value := trim(coalesce(normalized_input ->> 'procurementRiskTier', ''));
  attestation_value := trim(coalesce(normalized_input ->> 'attestation', ''));
  data_boundary_value := trim(coalesce(normalized_input ->> 'dataBoundary', ''));
  review_note_value := left(trim(coalesce(normalized_input ->> 'reviewNote', '')), 301);

  target_audience_label_value := case target_audience_value
    when 'provider-health-system' then 'Provider and health system'
    when 'payer-plan' then 'Payer and plan'
    when 'government-public-health' then 'Government and public health'
    when 'life-sciences-research' then 'Life sciences and research'
    when 'employer-benefits' then 'Employer benefits'
    when 'global-channel-partner' then 'Global channel partner'
    when 'investor-board-review' then 'Investor and board review'
    else ''
  end;

  procurement_domain_label_value := case procurement_domain_value
    when 'security-questionnaire' then 'Security questionnaire'
    when 'privacy-questionnaire' then 'Privacy questionnaire'
    when 'legal-procurement' then 'Legal procurement'
    when 'vendor-risk' then 'Vendor risk'
    when 'technical-diligence' then 'Technical diligence'
    when 'commercial-procurement' then 'Commercial procurement'
    when 'data-governance' then 'Data governance'
    when 'implementation-readiness' then 'Implementation readiness'
    else ''
  end;

  evidence_class_label_value := case evidence_class_value
    when 'questionnaire-response-routing' then 'Questionnaire response routing'
    when 'security-assurance-routing' then 'Security assurance routing'
    when 'privacy-dpa-routing' then 'Privacy and DPA routing'
    when 'contracting-routing' then 'Contracting routing'
    when 'architecture-evidence-routing' then 'Architecture evidence routing'
    when 'operations-runbook-routing' then 'Operations runbook routing'
    when 'pricing-commercial-routing' then 'Pricing and commercial routing'
    when 'implementation-plan-routing' then 'Implementation plan routing'
    else ''
  end;

  if cardinality(provider_security_review_record_ids_value) < 1
    or cardinality(provider_security_review_record_ids_value) > 10
    or cardinality(provider_security_review_record_ids_value) <> supplied_provider_security_review_count_value
    or target_audience_label_value = ''
    or procurement_domain_label_value = ''
    or evidence_class_label_value = ''
    or procurement_owner_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or buyer_segment_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or external_system_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or evidence_routing_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or evidence_routing_locator_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,159}$'
    or response_cadence_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,119}$'
    or procurement_risk_tier_value not in ('not-assessed', 'low', 'moderate', 'high')
    or coalesce(normalized_input ->> 'securityQuestionnaireRetainedExternally', '') <> 'true'
    or coalesce(normalized_input ->> 'socReportRetainedExternally', '') <> 'true'
    or coalesce(normalized_input ->> 'pentestReportRetainedExternally', '') <> 'true'
    or coalesce(normalized_input ->> 'signedLegalArtifactsRetainedExternally', '') <> 'true'
    or coalesce(normalized_input ->> 'credentialStorageDisabled', '') <> 'true'
    or coalesce(normalized_input ->> 'phiProcessingDisabled', '') <> 'true'
    or coalesce(normalized_input ->> 'confidentialAnswerStorageDisabled', '') <> 'true'
    or coalesce(normalized_input ->> 'humanApprovalRequired', '') <> 'true'
    or coalesce(normalized_input ->> 'externalDistributionDisabled', '') <> 'true'
    or attestation_value <> 'procurement-evidence-routing-metadata-no-sensitive-artifacts'
    or data_boundary_value <> 'synthetic-business-workflow-only'
    or char_length(review_note_value) > 300 then
    raise exception 'protected-procurement-evidence-validation-failed';
  end if;

  if array_to_string(provider_security_review_record_ids_value, ' ') || ' ' || target_audience_value || ' ' || procurement_domain_value || ' ' || evidence_class_value || ' ' || procurement_owner_label_value || ' ' || buyer_segment_label_value || ' ' || external_system_label_value || ' ' || evidence_routing_label_value || ' ' || evidence_routing_locator_value || ' ' || response_cadence_value || ' ' || procurement_risk_tier_value || ' ' || review_note_value ~*
    '(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|sk-[A-Za-z0-9_-]{12,}|sbp_[A-Za-z0-9_-]{12,}|bearer[[:space:]]+[A-Za-z0-9._-]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|token|secret|password|api[ _-]?key|access[ _-]?key|client[ _-]?secret|oauth|https?:\/\/|ip address|device[ _-]?id|raw[ _-]?log|log row|patient[ _-]?(id|identifier|mrn)|member[ _-]?(id|identifier)|medical record|protected health information|payer member|diagnosis code|social security|source (contract|document|record|file)|signed[ _-]?(baa|dpa|contract|agreement|document|approval)|legal opinion|soc[ _-]?2[ _-]?(report|certified|certification|type)|penetration[ _-]?test|vulnerability[ _-]?report|security questionnaire answer|questionnaire response|confidential answer|audited financial|investment recommendation|securities offering|valuation guarantee|revenue guarantee|reimbursement guarantee|guaranteed savings|guaranteed outcome|advertising substantiation|clinical validation|compliance certification|fda[ _-]?cleared|hipaa[ _-]?(compliant|certified)|autonomous diagnosis|treatment recommendation|live clinical execution|public release approved|external distribution approved|release approved|export approved|integration approved|security approved|privacy approved|procurement approved|baa executed|dpa executed|live integration|distribution enabled|release enabled|export enabled)' then
    raise exception 'protected-procurement-evidence-prohibited-content';
  end if;

  select membership.role
  into actor_role
  from public.pilot_memberships membership
  where membership.tenant_id = selected_workspace.tenant_id
    and membership.user_id = (select auth.uid())
    and membership.role in ('tenant-admin', 'pilot-lead', 'reviewer')
  limit 1;

  if actor_role is null then
    raise exception 'protected-procurement-evidence-role-denied';
  end if;

  select count(*)
  into provider_security_review_count_value
  from public.protected_provider_security_reviews review
  where review.id = any(provider_security_review_record_ids_value)
    and review.workspace_id = selected_workspace.id
    and review.tenant_id = selected_workspace.tenant_id
    and review.review_status = 'provider-security-review-ready-not-approval'
    and review.provider_security_risk in ('low', 'moderate')
    and review.external_security_review_retained is true
    and review.phi_processing_disabled is true
    and review.credential_storage_disabled is true
    and review.signed_agreement_storage_disabled is true
    and review.live_integration_disabled is true
    and review.human_approval_required is true
    and cardinality(review.missing_security_controls) = 0;

  if provider_security_review_count_value <> cardinality(provider_security_review_record_ids_value) then
    raise exception 'protected-procurement-evidence-provider-security-reviews-not-ready';
  end if;

  linked_controls := linked_controls || array['provider-security-review-ready'];

  select coalesce(array_agg(distinct control order by control), '{}'::text[])
  into linked_controls
  from unnest(linked_controls) as control;

  select coalesce(array_agg(control order by control), '{}'::text[])
  into missing_controls
  from unnest(required_controls) as control
  where control <> all(linked_controls);

  registry_status_value := case
    when procurement_risk_tier_value in ('not-assessed', 'high') then 'blocked'
    when cardinality(missing_controls) = 0 then 'procurement-evidence-routing-ready-not-approval'
    else 'procurement-evidence-metadata-recorded'
  end;

  retained_blockers_value := array[
    'External distribution disabled: true',
    'Security questionnaires, SOC reports, penetration-test reports, vulnerability reports, signed legal artifacts, legal opinions, confidential answers, source contracts, credentials, URLs, tokens, PHI, customer permissions, and production approvals must be retained outside SCRIMED.',
    'This metadata does not create procurement approval, security approval, privacy approval, legal approval, BAA/DPA execution, compliance certification, production authorization, reimbursement assurance, public release authority, external distribution authority, live integration approval, or live clinical execution authority.'
  ];

  release_restrictions_value := array[
    'No questionnaire answer, SOC report, penetration-test report, signed artifact, legal opinion, credential, URL, token, PHI, source contract, customer proof, investor distribution, sales collateral release, marketing publication, PR release, case-study distribution, or live-care workflow can be released by this metadata layer.',
    'No PHI, source documents, source contracts, confidential questionnaire answers, raw access logs, recipient identifiers, IP addresses, device identifiers, provider credentials, provider URLs, signed approvals, signed BAAs/DPAs, legal opinions, SOC reports, penetration-test reports, vulnerability reports, audited financial statements, securities materials, advertising substantiation, clinical validation, production authorization, or live-care records may be stored here.',
    'Unresolved provider security review, high or unassessed procurement risk, missing external artifact retention, missing human approval, or disabled evidence routing must block procurement response release.',
    'Procurement response authority remains externally retained, independently reviewed, and disabled until customer-approved diligence controls exist.'
  ];

  evidence_snapshot_value := jsonb_build_object(
    'targetAudience', target_audience_value,
    'targetAudienceLabel', target_audience_label_value,
    'procurementDomain', procurement_domain_value,
    'procurementDomainLabel', procurement_domain_label_value,
    'evidenceClass', evidence_class_value,
    'evidenceClassLabel', evidence_class_label_value,
    'registryStatus', registry_status_value,
    'approvalScope', 'procurement-evidence-routing-readiness-only',
    'providerSecurityReviewRecordIds', provider_security_review_record_ids_value,
    'procurementOwnerLabel', procurement_owner_label_value,
    'buyerSegmentLabel', buyer_segment_label_value,
    'externalSystemLabel', external_system_label_value,
    'evidenceRoutingLabel', evidence_routing_label_value,
    'evidenceRoutingLocator', evidence_routing_locator_value,
    'responseCadence', response_cadence_value,
    'procurementRiskTier', procurement_risk_tier_value,
    'requiredProcurementControls', required_controls,
    'linkedProcurementControls', linked_controls,
    'missingProcurementControls', missing_controls,
    'securityQuestionnaireRetainedExternally', true,
    'socReportRetainedExternally', true,
    'pentestReportRetainedExternally', true,
    'signedLegalArtifactsRetainedExternally', true,
    'credentialStorageDisabled', true,
    'phiProcessingDisabled', true,
    'confidentialAnswerStorageDisabled', true,
    'humanApprovalRequired', true,
    'externalDistributionDisabled', true,
    'procurementEvidenceRegistryAuthority', 'procurement-evidence-routing-readiness-not-procurement-approval',
    'storageAuthority', 'procurement-routing-metadata-only-no-questionnaires-reports-credentials-or-phi',
    'providerSecurityReviewAuthority', 'provider-security-review-readiness-not-security-approval',
    'assuranceLevel', 'aal2',
    'syntheticOnly', true,
    'metadataOnly', true,
    'noPhi', true,
    'noSensitiveArtifacts', true
  );

  insert into public.protected_procurement_evidence_registry (
    tenant_id,
    workspace_id,
    target_audience,
    target_audience_label,
    procurement_domain,
    procurement_domain_label,
    evidence_class,
    evidence_class_label,
    registry_status,
    approval_scope,
    provider_security_review_record_ids,
    procurement_owner_label,
    buyer_segment_label,
    external_system_label,
    evidence_routing_label,
    evidence_routing_locator,
    response_cadence,
    procurement_risk_tier,
    evidence_snapshot,
    required_procurement_controls,
    linked_procurement_controls,
    missing_procurement_controls,
    retained_blockers,
    release_restrictions,
    security_questionnaire_retained_externally,
    soc_report_retained_externally,
    pentest_report_retained_externally,
    signed_legal_artifacts_retained_externally,
    credential_storage_disabled,
    phi_processing_disabled,
    confidential_answer_storage_disabled,
    human_approval_required,
    external_distribution_disabled,
    attestation,
    review_note,
    data_boundary,
    procurement_evidence_registry_authority,
    provider_security_review_authority,
    provider_security_review_baa_dpa_authority,
    provider_security_review_storage_authority,
    storage_authority,
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
    target_audience_value,
    target_audience_label_value,
    procurement_domain_value,
    procurement_domain_label_value,
    evidence_class_value,
    evidence_class_label_value,
    registry_status_value,
    'procurement-evidence-routing-readiness-only',
    provider_security_review_record_ids_value,
    procurement_owner_label_value,
    buyer_segment_label_value,
    external_system_label_value,
    evidence_routing_label_value,
    evidence_routing_locator_value,
    response_cadence_value,
    procurement_risk_tier_value,
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
    true,
    true,
    true,
    attestation_value,
    review_note_value,
    data_boundary_value,
    'procurement-evidence-routing-readiness-not-procurement-approval',
    'provider-security-review-readiness-not-security-approval',
    'pre-production-baa-dpa-readiness-not-executed-agreement',
    'provider-security-review-metadata-only-no-credentials-phi-or-legal-artifacts',
    'procurement-routing-metadata-only-no-questionnaires-reports-credentials-or-phi',
    'not-audited-financial-report',
    'not-securities-offering-material',
    'not-advertising-claim-substantiation',
    'not-authorized-live-care',
    (select auth.uid()),
    protected_boundary
  )
  returning id into created_registry_id;

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
    'protected-procurement-evidence-recorded',
    jsonb_build_object(
      'registryId', created_registry_id,
      'targetAudience', target_audience_value,
      'targetAudienceLabel', target_audience_label_value,
      'procurementDomain', procurement_domain_value,
      'procurementDomainLabel', procurement_domain_label_value,
      'evidenceClass', evidence_class_value,
      'evidenceClassLabel', evidence_class_label_value,
      'registryStatus', registry_status_value,
      'providerSecurityReviewRecordIds', provider_security_review_record_ids_value,
      'requiredProcurementControls', required_controls,
      'linkedProcurementControls', linked_controls,
      'missingProcurementControls', missing_controls,
      'procurementRiskTier', procurement_risk_tier_value,
      'actorRole', actor_role,
      'approvalScope', 'procurement-evidence-routing-readiness-only',
      'securityQuestionnaireRetainedExternally', true,
      'socReportRetainedExternally', true,
      'pentestReportRetainedExternally', true,
      'signedLegalArtifactsRetainedExternally', true,
      'credentialStorageDisabled', true,
      'phiProcessingDisabled', true,
      'confidentialAnswerStorageDisabled', true,
      'humanApprovalRequired', true,
      'externalDistributionDisabled', true,
      'assuranceLevel', 'aal2',
      'syntheticOnly', true,
      'metadataOnly', true,
      'noPhi', true,
      'noSensitiveArtifacts', true,
      'procurementEvidenceRegistryAuthority', 'procurement-evidence-routing-readiness-not-procurement-approval',
      'storageAuthority', 'procurement-routing-metadata-only-no-questionnaires-reports-credentials-or-phi',
      'providerSecurityReviewAuthority', 'provider-security-review-readiness-not-security-approval',
      'financialReportingAuthority', 'not-audited-financial-report',
      'securitiesAuthority', 'not-securities-offering-material',
      'advertisingClaimsAuthority', 'not-advertising-claim-substantiation',
      'clinicalExecutionAuthority', 'not-authorized-live-care'
    )
  );

  return created_registry_id;
end;
$$;

create or replace function public.record_protected_procurement_evidence(
  p_workspace_slug text,
  p_registry_input jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_protected_procurement_evidence(
    p_workspace_slug,
    p_registry_input
  );
$$;

revoke all on function private.record_protected_procurement_evidence(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.record_protected_procurement_evidence(text, jsonb)
  from public, anon, authenticated, service_role;

grant execute on function private.record_protected_procurement_evidence(text, jsonb)
  to authenticated;
grant execute on function public.record_protected_procurement_evidence(text, jsonb)
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
    'schemaVersion', '2026-06-20.10',
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
    'protectedProviderSecurityReviewPackets', 'aal2-audited-provider-security-review-packets-no-phi',
    'protectedProcurementEvidenceRegistry', 'aal2-procurement-evidence-registry-no-sensitive-artifacts',
    'protectedProcurementEvidenceRegistryPackets', 'aal2-audited-procurement-evidence-registry-packets-no-sensitive-artifacts'
  );
$$;

comment on table public.protected_procurement_evidence_registry is
  'Tenant-scoped no-PHI procurement evidence routing metadata for security questionnaire, privacy questionnaire, legal procurement, vendor-risk, technical diligence, commercial procurement, data governance, and implementation readiness workflows. RLS select requires authenticated AAL2 governance context and tenant membership. Writes require guarded RPC. This table does not store PHI, patient identifiers, payer member data, live clinical records, source documents, source contracts, secrets, credentials, URLs, access tokens, confidential questionnaire answers, SOC reports, penetration-test reports, vulnerability reports, signed agreements, legal opinions, customer permission artifacts, public release approval, external distribution approval, production authorization, procurement approval, or live clinical execution approval.';
comment on function private.record_protected_procurement_evidence(text, jsonb) is
  'Records bounded no-PHI procurement evidence routing metadata after AAL2 governance authorization and appends an audit event. This is not procurement approval, security approval, privacy approval, legal approval, BAA/DPA execution, compliance certification, production authorization, clinical validation, reimbursement assurance, external distribution approval, or live clinical execution authority.';
