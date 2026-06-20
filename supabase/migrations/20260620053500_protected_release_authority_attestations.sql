create table if not exists public.protected_release_authority_attestations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  authority_domain text not null check (
    authority_domain in (
      'qualified-counsel',
      'customer-permission-owner',
      'executive-sponsor',
      'privacy-security-owner',
      'finance-owner',
      'clinical-governance-owner',
      'marketing-claims-owner'
    )
  ),
  authority_domain_label text not null check (
    char_length(authority_domain_label) between 3 and 100
    and authority_domain_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{2,99}$'
  ),
  attestation_status text not null check (
    attestation_status in (
      'release-authority-metadata-recorded',
      'distribution-lockbox-linked',
      'all-release-authority-metadata-complete-not-release-approval',
      'blocked'
    )
  ),
  approval_scope text not null default 'release-authority-attestation-review-readiness-only'
    check (approval_scope = 'release-authority-attestation-review-readiness-only'),
  distribution_audience text not null check (
    distribution_audience in (
      'buyer-diligence-room',
      'investor-data-room',
      'board-room',
      'sales-collateral-channel',
      'marketing-site-release',
      'public-relations-channel',
      'customer-case-study-channel'
    )
  ),
  release_authority_reference_label text not null check (
    char_length(release_authority_reference_label) between 4 and 140
    and release_authority_reference_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  release_authority_reference_locator text not null check (
    char_length(release_authority_reference_locator) between 4 and 140
    and release_authority_reference_locator ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  authority_owner_label text not null check (
    char_length(authority_owner_label) between 3 and 100
    and authority_owner_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{2,99}$'
  ),
  attested_manifest_version text not null check (
    char_length(attested_manifest_version) between 2 and 40
    and attested_manifest_version ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{1,39}$'
  ),
  authority_window_start timestamptz not null,
  authority_window_end timestamptz not null,
  release_scope text not null check (
    char_length(release_scope) between 6 and 160
    and release_scope ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{5,159}$'
  ),
  revocation_trigger text not null check (
    char_length(revocation_trigger) between 8 and 180
    and revocation_trigger ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{7,179}$'
  ),
  lockbox_record_ids uuid[] not null check (cardinality(lockbox_record_ids) between 1 and 14),
  evidence_snapshot jsonb not null default '{}'::jsonb
    check (jsonb_typeof(evidence_snapshot) = 'object' and pg_column_size(evidence_snapshot) <= 8192),
  required_authority_domains text[] not null
    check (cardinality(required_authority_domains) = 7),
  linked_authority_domains text[] not null default '{}'::text[]
    check (cardinality(linked_authority_domains) between 0 and 7),
  missing_authority_domains text[] not null default '{}'::text[]
    check (cardinality(missing_authority_domains) between 0 and 7),
  retained_blockers text[] not null default '{}'::text[]
    check (cardinality(retained_blockers) between 1 and 18),
  release_restrictions text[] not null default '{}'::text[]
    check (cardinality(release_restrictions) between 1 and 18),
  external_authority_retained boolean not null default true
    check (external_authority_retained is true),
  release_disabled boolean not null default true
    check (release_disabled is true),
  attestation text not null check (
    attestation = 'external-release-authority-attestation-metadata-no-phi'
  ),
  review_note text not null default '' check (char_length(review_note) <= 280),
  data_boundary text not null check (data_boundary = 'synthetic-business-workflow-only'),
  attestation_authority text not null default 'external-release-authority-reference-not-approval'
    check (attestation_authority = 'external-release-authority-reference-not-approval'),
  release_authority text not null default 'release-disabled-pending-executed-external-authority'
    check (release_authority = 'release-disabled-pending-executed-external-authority'),
  storage_authority text not null default 'authority-metadata-only-no-sensitive-documents'
    check (storage_authority = 'authority-metadata-only-no-sensitive-documents'),
  lockbox_authority text not null default 'distribution-lockbox-metadata-not-release-approval'
    check (lockbox_authority = 'distribution-lockbox-metadata-not-release-approval'),
  lockbox_release_authority text not null default 'external-distribution-disabled-pending-real-approval'
    check (lockbox_release_authority = 'external-distribution-disabled-pending-real-approval'),
  lockbox_storage_authority text not null default 'manifest-metadata-only-no-sensitive-artifacts'
    check (lockbox_storage_authority = 'manifest-metadata-only-no-sensitive-artifacts'),
  release_decision_authority text not null default 'qualified-release-review-not-public-release'
    check (release_decision_authority = 'qualified-release-review-not-public-release'),
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
    'Protected Release Authority Attestations record disabled-by-default no-PHI metadata references to externally retained counsel, customer permission, executive, privacy/security, finance, clinical-governance, and marketing-claims release authority. They do not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, signed approvals, signed BAAs/DPAs, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, advertising claim substantiation, clinical validation, compliance certification, customer permission artifacts, public release approval, external distribution approval, production authorization, or live clinical execution approval.'
);

create index if not exists protected_release_authority_attestations_tenant_recorded_at_idx
  on public.protected_release_authority_attestations(tenant_id, recorded_at desc);
create index if not exists protected_release_authority_attestations_workspace_recorded_at_idx
  on public.protected_release_authority_attestations(workspace_id, recorded_at desc);
create index if not exists protected_release_authority_attestations_domain_idx
  on public.protected_release_authority_attestations(workspace_id, authority_domain, recorded_at desc);
create index if not exists protected_release_authority_attestations_status_idx
  on public.protected_release_authority_attestations(workspace_id, attestation_status, recorded_at desc);
create index if not exists protected_release_authority_attestations_manifest_idx
  on public.protected_release_authority_attestations(workspace_id, attested_manifest_version, recorded_at desc);
create index if not exists protected_release_authority_attestations_recorded_by_idx
  on public.protected_release_authority_attestations(recorded_by);

alter table public.protected_release_authority_attestations enable row level security;
revoke all on public.protected_release_authority_attestations from public, anon, authenticated;
grant select on public.protected_release_authority_attestations to authenticated;

drop policy if exists protected_release_authority_attestations_member_select
  on public.protected_release_authority_attestations;
create policy protected_release_authority_attestations_member_select
on public.protected_release_authority_attestations
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
      'protected-release-authority-attestation-recorded'
    )
  );

create or replace function private.record_protected_release_authority_attestation(
  p_workspace_slug text,
  p_attestation_input jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  normalized_input jsonb := coalesce(p_attestation_input, '{}'::jsonb);
  lockbox_record_ids_value uuid[] := '{}'::uuid[];
  lockbox_count_value integer := 0;
  supplied_lockbox_count_value integer := 0;
  authority_domain_value text;
  authority_domain_label_value text;
  distribution_audience_value text;
  release_authority_reference_label_value text;
  release_authority_reference_locator_value text;
  authority_owner_label_value text;
  attested_manifest_version_value text;
  authority_window_start_value timestamptz;
  authority_window_end_value timestamptz;
  release_scope_value text;
  revocation_trigger_value text;
  attestation_value text;
  data_boundary_value text;
  review_note_value text;
  actor_role text;
  required_domains text[] := array[
    'qualified-counsel',
    'customer-permission-owner',
    'executive-sponsor',
    'privacy-security-owner',
    'finance-owner',
    'clinical-governance-owner',
    'marketing-claims-owner'
  ];
  linked_domains text[] := '{}'::text[];
  missing_domains text[] := '{}'::text[];
  retained_blockers_value text[];
  release_restrictions_value text[];
  attestation_status_value text;
  evidence_snapshot_value jsonb;
  created_attestation_id uuid;
  protected_boundary text :=
    'Protected Release Authority Attestations record disabled-by-default no-PHI metadata references to externally retained counsel, customer permission, executive, privacy/security, finance, clinical-governance, and marketing-claims release authority. They do not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, signed approvals, signed BAAs/DPAs, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, advertising claim substantiation, clinical validation, compliance certification, customer permission artifacts, public release approval, external distribution approval, production authorization, or live clinical execution approval.';
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead', 'reviewer']
  );

  if jsonb_typeof(normalized_input) <> 'object'
    or pg_column_size(normalized_input) > 5632 then
    raise exception 'protected-release-authority-attestation-invalid-payload';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(normalized_input) as supplied(key)
    where supplied.key <> all(array[
      'lockboxRecordIds',
      'authorityDomain',
      'distributionAudience',
      'releaseAuthorityReferenceLabel',
      'releaseAuthorityReferenceLocator',
      'authorityOwnerLabel',
      'attestedManifestVersion',
      'authorityWindowStart',
      'authorityWindowEnd',
      'releaseScope',
      'revocationTrigger',
      'externalAuthorityRetained',
      'releaseDisabled',
      'attestation',
      'dataBoundary',
      'reviewNote'
    ])
  ) then
    raise exception 'protected-release-authority-attestation-unsupported-field';
  end if;

  if jsonb_typeof(normalized_input -> 'lockboxRecordIds') <> 'array' then
    raise exception 'protected-release-authority-attestation-invalid-lockbox-records';
  end if;

  begin
    select count(*)
    into supplied_lockbox_count_value
    from jsonb_array_elements_text(normalized_input -> 'lockboxRecordIds');

    select coalesce(array_agg(distinct ids.value::uuid order by ids.value::uuid), '{}'::uuid[])
    into lockbox_record_ids_value
    from jsonb_array_elements_text(normalized_input -> 'lockboxRecordIds') as ids(value);

    authority_window_start_value := (normalized_input ->> 'authorityWindowStart')::timestamptz;
    authority_window_end_value := (normalized_input ->> 'authorityWindowEnd')::timestamptz;
  exception when others then
    raise exception 'protected-release-authority-attestation-invalid-typed-field';
  end;

  authority_domain_value := trim(coalesce(normalized_input ->> 'authorityDomain', ''));
  distribution_audience_value := trim(coalesce(normalized_input ->> 'distributionAudience', ''));
  release_authority_reference_label_value := left(trim(coalesce(normalized_input ->> 'releaseAuthorityReferenceLabel', '')), 141);
  release_authority_reference_locator_value := left(trim(coalesce(normalized_input ->> 'releaseAuthorityReferenceLocator', '')), 141);
  authority_owner_label_value := left(trim(coalesce(normalized_input ->> 'authorityOwnerLabel', '')), 101);
  attested_manifest_version_value := left(trim(coalesce(normalized_input ->> 'attestedManifestVersion', '')), 41);
  release_scope_value := left(trim(coalesce(normalized_input ->> 'releaseScope', '')), 161);
  revocation_trigger_value := left(trim(coalesce(normalized_input ->> 'revocationTrigger', '')), 181);
  attestation_value := trim(coalesce(normalized_input ->> 'attestation', ''));
  data_boundary_value := trim(coalesce(normalized_input ->> 'dataBoundary', ''));
  review_note_value := left(trim(coalesce(normalized_input ->> 'reviewNote', '')), 281);

  authority_domain_label_value := case authority_domain_value
    when 'qualified-counsel' then 'Qualified counsel'
    when 'customer-permission-owner' then 'Customer permission owner'
    when 'executive-sponsor' then 'Executive sponsor'
    when 'privacy-security-owner' then 'Privacy and security owner'
    when 'finance-owner' then 'Finance owner'
    when 'clinical-governance-owner' then 'Clinical governance owner'
    when 'marketing-claims-owner' then 'Marketing claims owner'
    else ''
  end;

  if cardinality(lockbox_record_ids_value) < 1
    or cardinality(lockbox_record_ids_value) > 14
    or cardinality(lockbox_record_ids_value) <> supplied_lockbox_count_value
    or authority_domain_value <> all(required_domains)
    or authority_domain_label_value = ''
    or distribution_audience_value not in (
      'buyer-diligence-room',
      'investor-data-room',
      'board-room',
      'sales-collateral-channel',
      'marketing-site-release',
      'public-relations-channel',
      'customer-case-study-channel'
    )
    or release_authority_reference_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or release_authority_reference_locator_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or authority_owner_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{2,99}$'
    or attested_manifest_version_value !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{1,39}$'
    or authority_window_start_value < now() - interval '1 day'
    or authority_window_end_value <= authority_window_start_value
    or authority_window_end_value > now() + interval '400 days'
    or release_scope_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{5,159}$'
    or revocation_trigger_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{7,179}$'
    or coalesce(normalized_input ->> 'externalAuthorityRetained', '') <> 'true'
    or coalesce(normalized_input ->> 'releaseDisabled', '') <> 'true'
    or attestation_value <> 'external-release-authority-attestation-metadata-no-phi'
    or data_boundary_value <> 'synthetic-business-workflow-only'
    or char_length(review_note_value) > 280 then
    raise exception 'protected-release-authority-attestation-validation-failed';
  end if;

  if array_to_string(lockbox_record_ids_value, ' ') || ' ' || authority_domain_value || ' ' || distribution_audience_value || ' ' || release_authority_reference_label_value || ' ' || release_authority_reference_locator_value || ' ' || authority_owner_label_value || ' ' || attested_manifest_version_value || ' ' || release_scope_value || ' ' || revocation_trigger_value || ' ' || review_note_value ~*
    '(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|sk-[A-Za-z0-9_-]{12,}|sbp_[A-Za-z0-9_-]{12,}|bearer[[:space:]]+[A-Za-z0-9._-]+|token|secret|password|api[ _-]?key|access[ _-]?key|https?:\/\/|patient[ _-]?(id|identifier|mrn)|member[ _-]?(id|identifier)|medical record|protected health information|payer member|diagnosis code|social security|source contract|signed[ _-]?(baa|dpa|contract|agreement|document|approval)|legal opinion|audited financial|investment recommendation|securities offering|valuation guarantee|revenue guarantee|reimbursement guarantee|guaranteed savings|guaranteed outcome|advertising substantiation|clinical validation|compliance certification|fda[ _-]?cleared|hipaa[ _-]?(compliant|certified)|soc[ _-]?2[ _-]?certified|autonomous diagnosis|treatment recommendation|live clinical execution|public release approved|external distribution approved|release approved|release enabled)' then
    raise exception 'protected-release-authority-attestation-prohibited-content';
  end if;

  select membership.role
  into actor_role
  from public.pilot_memberships membership
  where membership.tenant_id = selected_workspace.tenant_id
    and membership.user_id = (select auth.uid())
    and membership.role in ('tenant-admin', 'pilot-lead', 'reviewer')
  limit 1;

  if actor_role is null then
    raise exception 'protected-release-authority-attestation-role-denied';
  end if;

  select count(*)
  into lockbox_count_value
  from public.protected_distribution_lockboxes lockbox
  where lockbox.id = any(lockbox_record_ids_value)
    and lockbox.workspace_id = selected_workspace.id
    and lockbox.tenant_id = selected_workspace.tenant_id
    and lockbox.distribution_disabled is true
    and lockbox.external_approvals_retained is true
    and lockbox.lockbox_status = 'ready-for-external-distribution-lockbox-review-not-release-authority';

  if lockbox_count_value <> cardinality(lockbox_record_ids_value) then
    raise exception 'protected-release-authority-attestation-lockbox-not-ready';
  end if;

  select coalesce(array_agg(distinct domains.domain order by domains.domain), '{}'::text[])
  into linked_domains
  from (
    select attestation.authority_domain as domain
    from public.protected_release_authority_attestations attestation
    where attestation.workspace_id = selected_workspace.id
      and attestation.tenant_id = selected_workspace.tenant_id
      and attestation.attested_manifest_version = attested_manifest_version_value
      and attestation.external_authority_retained is true
      and attestation.release_disabled is true
    union all
    select authority_domain_value as domain
  ) domains
  where domains.domain = any(required_domains);

  select coalesce(array_agg(required.domain order by required.domain), '{}'::text[])
  into missing_domains
  from unnest(required_domains) as required(domain)
  where not required.domain = any(linked_domains);

  attestation_status_value := case
    when cardinality(missing_domains) = 0 then
      'all-release-authority-metadata-complete-not-release-approval'
    when lockbox_count_value > 0 then
      'distribution-lockbox-linked'
    else
      'release-authority-metadata-recorded'
  end;

  retained_blockers_value := array[
    'Release disabled: true',
    'Missing authority domains: ' || coalesce(nullif(array_to_string(missing_domains, ', '), ''), 'none'),
    'External release authority artifacts, signed approvals, legal opinions, customer permissions, recipient lists, and distribution artifacts must be retained outside SCRIMED.',
    'This metadata does not create legal, financial, securities, advertising, customer, compliance, production, reimbursement, clinical validation, public release, external distribution, or live clinical execution authority.'
  ];

  release_restrictions_value := array[
    'No public release, customer proof use, investor distribution, sales collateral release, marketing publication, PR release, or case-study distribution can be enabled by this SCRIMED metadata layer.',
    'No PHI, source documents, signed approvals, customer permission artifacts, legal opinions, audited financial statements, securities materials, advertising substantiation, clinical validation, production authorization, or live-care records may be stored here.',
    'Missing authority domains, changed artifact manifests, changed recipient scope, expired customer permission, or absent counsel review must block external release.',
    'Release authority remains externally executed and independently reviewed outside SCRIMED.'
  ];

  evidence_snapshot_value := jsonb_build_object(
    'authorityDomain', authority_domain_value,
    'authorityDomainLabel', authority_domain_label_value,
    'attestationStatus', attestation_status_value,
    'approvalScope', 'release-authority-attestation-review-readiness-only',
    'distributionAudience', distribution_audience_value,
    'releaseAuthorityReferenceLabel', release_authority_reference_label_value,
    'releaseAuthorityReferenceLocator', release_authority_reference_locator_value,
    'authorityOwnerLabel', authority_owner_label_value,
    'attestedManifestVersion', attested_manifest_version_value,
    'authorityWindowStart', authority_window_start_value,
    'authorityWindowEnd', authority_window_end_value,
    'releaseScope', release_scope_value,
    'revocationTrigger', revocation_trigger_value,
    'lockboxRecordIds', lockbox_record_ids_value,
    'requiredAuthorityDomains', required_domains,
    'linkedAuthorityDomains', linked_domains,
    'missingAuthorityDomains', missing_domains,
    'externalAuthorityRetained', true,
    'releaseDisabled', true,
    'attestationAuthority', 'external-release-authority-reference-not-approval',
    'releaseAuthority', 'release-disabled-pending-executed-external-authority',
    'storageAuthority', 'authority-metadata-only-no-sensitive-documents',
    'lockboxAuthority', 'distribution-lockbox-metadata-not-release-approval',
    'lockboxReleaseAuthority', 'external-distribution-disabled-pending-real-approval',
    'lockboxStorageAuthority', 'manifest-metadata-only-no-sensitive-artifacts',
    'releaseDecisionAuthority', 'qualified-release-review-not-public-release',
    'financialReportingAuthority', 'not-audited-financial-report',
    'securitiesAuthority', 'not-securities-offering-material',
    'advertisingClaimsAuthority', 'not-advertising-claim-substantiation',
    'clinicalExecutionAuthority', 'not-authorized-live-care',
    'assuranceLevel', 'aal2',
    'syntheticOnly', true,
    'metadataOnly', true,
    'noPhi', true
  );

  insert into public.protected_release_authority_attestations (
    tenant_id,
    workspace_id,
    authority_domain,
    authority_domain_label,
    attestation_status,
    approval_scope,
    distribution_audience,
    release_authority_reference_label,
    release_authority_reference_locator,
    authority_owner_label,
    attested_manifest_version,
    authority_window_start,
    authority_window_end,
    release_scope,
    revocation_trigger,
    lockbox_record_ids,
    evidence_snapshot,
    required_authority_domains,
    linked_authority_domains,
    missing_authority_domains,
    retained_blockers,
    release_restrictions,
    external_authority_retained,
    release_disabled,
    attestation,
    review_note,
    data_boundary,
    attestation_authority,
    release_authority,
    storage_authority,
    lockbox_authority,
    lockbox_release_authority,
    lockbox_storage_authority,
    release_decision_authority,
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
    authority_domain_value,
    authority_domain_label_value,
    attestation_status_value,
    'release-authority-attestation-review-readiness-only',
    distribution_audience_value,
    release_authority_reference_label_value,
    release_authority_reference_locator_value,
    authority_owner_label_value,
    attested_manifest_version_value,
    authority_window_start_value,
    authority_window_end_value,
    release_scope_value,
    revocation_trigger_value,
    lockbox_record_ids_value,
    evidence_snapshot_value,
    required_domains,
    linked_domains,
    missing_domains,
    retained_blockers_value,
    release_restrictions_value,
    true,
    true,
    attestation_value,
    review_note_value,
    data_boundary_value,
    'external-release-authority-reference-not-approval',
    'release-disabled-pending-executed-external-authority',
    'authority-metadata-only-no-sensitive-documents',
    'distribution-lockbox-metadata-not-release-approval',
    'external-distribution-disabled-pending-real-approval',
    'manifest-metadata-only-no-sensitive-artifacts',
    'qualified-release-review-not-public-release',
    'not-audited-financial-report',
    'not-securities-offering-material',
    'not-advertising-claim-substantiation',
    'not-authorized-live-care',
    (select auth.uid()),
    protected_boundary
  )
  returning id into created_attestation_id;

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
    'protected-release-authority-attestation-recorded',
    jsonb_build_object(
      'attestationId', created_attestation_id,
      'authorityDomain', authority_domain_value,
      'authorityDomainLabel', authority_domain_label_value,
      'distributionAudience', distribution_audience_value,
      'attestedManifestVersion', attested_manifest_version_value,
      'attestationStatus', attestation_status_value,
      'lockboxRecordIds', lockbox_record_ids_value,
      'requiredAuthorityDomains', required_domains,
      'linkedAuthorityDomains', linked_domains,
      'missingAuthorityDomains', missing_domains,
      'actorRole', actor_role,
      'approvalScope', 'release-authority-attestation-review-readiness-only',
      'externalAuthorityRetained', true,
      'releaseDisabled', true,
      'assuranceLevel', 'aal2',
      'syntheticOnly', true,
      'metadataOnly', true,
      'noPhi', true,
      'attestationAuthority', 'external-release-authority-reference-not-approval',
      'releaseAuthority', 'release-disabled-pending-executed-external-authority',
      'storageAuthority', 'authority-metadata-only-no-sensitive-documents',
      'lockboxAuthority', 'distribution-lockbox-metadata-not-release-approval',
      'lockboxReleaseAuthority', 'external-distribution-disabled-pending-real-approval',
      'lockboxStorageAuthority', 'manifest-metadata-only-no-sensitive-artifacts',
      'releaseDecisionAuthority', 'qualified-release-review-not-public-release',
      'financialReportingAuthority', 'not-audited-financial-report',
      'securitiesAuthority', 'not-securities-offering-material',
      'advertisingClaimsAuthority', 'not-advertising-claim-substantiation',
      'clinicalExecutionAuthority', 'not-authorized-live-care'
    )
  );

  return created_attestation_id;
end;
$$;

create or replace function public.record_protected_release_authority_attestation(
  p_workspace_slug text,
  p_attestation_input jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_protected_release_authority_attestation(
    p_workspace_slug,
    p_attestation_input
  );
$$;

revoke all on function private.record_protected_release_authority_attestation(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.record_protected_release_authority_attestation(text, jsonb)
  from public, anon, authenticated, service_role;

grant execute on function private.record_protected_release_authority_attestation(text, jsonb)
  to authenticated;
grant execute on function public.record_protected_release_authority_attestation(text, jsonb)
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
    'schemaVersion', '2026-06-20.5',
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
    'protectedExternalApprovalEvidencePackets', 'aal2-audited-external-approval-evidence-link-packets-no-phi',
    'protectedReleaseDecisionWorkflow', 'aal2-qualified-release-decision-workflow-no-phi',
    'protectedReleaseDecisionPackets', 'aal2-audited-release-decision-claim-registry-packets-no-phi',
    'protectedNamedReviewerSignoffs', 'aal2-named-reviewer-signoff-metadata-no-phi',
    'protectedNamedReviewerSignoffPackets', 'aal2-audited-named-reviewer-signoff-packets-no-phi',
    'protectedDistributionLockboxes', 'aal2-external-distribution-lockbox-disabled-no-phi',
    'protectedDistributionLockboxPackets', 'aal2-audited-distribution-lockbox-packets-no-phi',
    'protectedReleaseAuthorityAttestations', 'aal2-external-release-authority-attestations-disabled-no-phi',
    'protectedReleaseAuthorityAttestationPackets', 'aal2-audited-release-authority-attestation-packets-no-phi'
  );
$$;

comment on table public.protected_release_authority_attestations is
  'Tenant-scoped no-PHI disabled-by-default metadata references to externally retained release authority across qualified counsel, customer permission, executive sponsorship, privacy/security, finance, clinical governance, and marketing claims. RLS select requires authenticated AAL2 governance context and tenant membership. Writes require guarded RPC. This table does not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, signed approvals, legal opinions, audited financial statements, securities offering material, advertising substantiation, customer permission artifacts, public release approval, external distribution approval, production authorization, or live clinical execution approval.';
comment on function private.record_protected_release_authority_attestation(text, jsonb) is
  'Records bounded no-PHI disabled release authority attestation metadata after AAL2 governance authorization and appends an audit event. This is not legal approval, public release approval, external distribution approval, audited financial reporting, advertising substantiation, customer permission, compliance certification, production authorization, clinical validation, reimbursement assurance, or live clinical execution authority.';
