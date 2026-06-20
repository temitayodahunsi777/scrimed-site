create table if not exists public.protected_distribution_lockboxes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
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
  distribution_channel_control text not null check (
    distribution_channel_control in (
      'external-data-room',
      'counsel-reviewed-room',
      'procurement-portal',
      'board-governance-room',
      'marketing-release-queue',
      'pr-release-queue',
      'customer-permission-room'
    )
  ),
  lockbox_status text not null check (
    lockbox_status in (
      'lockbox-metadata-recorded',
      'reviewer-signoffs-linked',
      'ready-for-external-distribution-lockbox-review-not-release-authority',
      'blocked'
    )
  ),
  approval_scope text not null default 'external-distribution-lockbox-review-readiness-only'
    check (approval_scope = 'external-distribution-lockbox-review-readiness-only'),
  manifest_version text not null check (
    char_length(manifest_version) between 2 and 40
    and manifest_version ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{1,39}$'
  ),
  manifest_title text not null check (
    char_length(manifest_title) between 6 and 140
    and manifest_title ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{5,139}$'
  ),
  artifact_manifest_label text not null check (
    char_length(artifact_manifest_label) between 4 and 120
    and artifact_manifest_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,119}$'
  ),
  artifact_manifest_locator text not null check (
    char_length(artifact_manifest_locator) between 4 and 140
    and artifact_manifest_locator ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  customer_permission_reference text not null check (
    char_length(customer_permission_reference) between 4 and 140
    and customer_permission_reference ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  counsel_review_reference text not null check (
    char_length(counsel_review_reference) between 4 and 140
    and counsel_review_reference ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  distribution_window_start timestamptz not null,
  distribution_window_end timestamptz not null,
  recipient_scope text not null check (
    char_length(recipient_scope) between 4 and 140
    and recipient_scope ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  revocation_plan text not null check (
    char_length(revocation_plan) between 8 and 180
    and revocation_plan ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{7,179}$'
  ),
  signoff_record_ids uuid[] not null check (cardinality(signoff_record_ids) between 1 and 14),
  evidence_snapshot jsonb not null default '{}'::jsonb
    check (jsonb_typeof(evidence_snapshot) = 'object' and pg_column_size(evidence_snapshot) <= 8192),
  required_reviewer_roles text[] not null
    check (cardinality(required_reviewer_roles) = 7),
  linked_reviewer_roles text[] not null default '{}'::text[]
    check (cardinality(linked_reviewer_roles) between 0 and 7),
  missing_reviewer_roles text[] not null default '{}'::text[]
    check (cardinality(missing_reviewer_roles) between 0 and 7),
  expired_signoff_roles text[] not null default '{}'::text[]
    check (cardinality(expired_signoff_roles) between 0 and 7),
  retained_blockers text[] not null default '{}'::text[]
    check (cardinality(retained_blockers) between 1 and 18),
  release_restrictions text[] not null default '{}'::text[]
    check (cardinality(release_restrictions) between 1 and 18),
  external_approvals_retained boolean not null default true
    check (external_approvals_retained is true),
  distribution_disabled boolean not null default true
    check (distribution_disabled is true),
  attestation text not null check (
    attestation = 'external-distribution-lockbox-metadata-no-phi'
  ),
  review_note text not null default '' check (char_length(review_note) <= 280),
  data_boundary text not null check (data_boundary = 'synthetic-business-workflow-only'),
  lockbox_authority text not null default 'distribution-lockbox-metadata-not-release-approval'
    check (lockbox_authority = 'distribution-lockbox-metadata-not-release-approval'),
  release_authority text not null default 'external-distribution-disabled-pending-real-approval'
    check (release_authority = 'external-distribution-disabled-pending-real-approval'),
  storage_authority text not null default 'manifest-metadata-only-no-sensitive-artifacts'
    check (storage_authority = 'manifest-metadata-only-no-sensitive-artifacts'),
  signoff_authority text not null default 'named-reviewer-metadata-not-approval'
    check (signoff_authority = 'named-reviewer-metadata-not-approval'),
  signoff_release_authority text not null default 'controlled-distribution-review-not-release-authority'
    check (signoff_release_authority = 'controlled-distribution-review-not-release-authority'),
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
    'Protected Distribution Lockbox records disabled-by-default no-PHI metadata for externally retained distribution approvals, customer permissions, counsel review, reviewer sign-offs, and artifact manifests. It does not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, signed BAAs/DPAs, signed approvals, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, advertising claim substantiation, clinical validation, compliance certification, customer permission artifacts, public release approval, external distribution approval, production authorization, or live clinical execution approval.'
);

create index if not exists protected_distribution_lockboxes_tenant_recorded_at_idx
  on public.protected_distribution_lockboxes(tenant_id, recorded_at desc);
create index if not exists protected_distribution_lockboxes_workspace_recorded_at_idx
  on public.protected_distribution_lockboxes(workspace_id, recorded_at desc);
create index if not exists protected_distribution_lockboxes_audience_idx
  on public.protected_distribution_lockboxes(workspace_id, distribution_audience, recorded_at desc);
create index if not exists protected_distribution_lockboxes_status_idx
  on public.protected_distribution_lockboxes(workspace_id, lockbox_status, recorded_at desc);
create index if not exists protected_distribution_lockboxes_manifest_version_idx
  on public.protected_distribution_lockboxes(workspace_id, manifest_version, recorded_at desc);
create index if not exists protected_distribution_lockboxes_recorded_by_idx
  on public.protected_distribution_lockboxes(recorded_by);

alter table public.protected_distribution_lockboxes enable row level security;
revoke all on public.protected_distribution_lockboxes from public, anon, authenticated;
grant select on public.protected_distribution_lockboxes to authenticated;

drop policy if exists protected_distribution_lockboxes_member_select
  on public.protected_distribution_lockboxes;
create policy protected_distribution_lockboxes_member_select
on public.protected_distribution_lockboxes
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
      'protected-distribution-lockbox-recorded'
    )
  );

create or replace function private.record_protected_distribution_lockbox(
  p_workspace_slug text,
  p_lockbox_input jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  normalized_input jsonb := coalesce(p_lockbox_input, '{}'::jsonb);
  signoff_record_ids_value uuid[] := '{}'::uuid[];
  signoff_count_value integer := 0;
  distribution_audience_value text;
  distribution_channel_control_value text;
  manifest_version_value text;
  manifest_title_value text;
  artifact_manifest_label_value text;
  artifact_manifest_locator_value text;
  customer_permission_reference_value text;
  counsel_review_reference_value text;
  distribution_window_start_value timestamptz;
  distribution_window_end_value timestamptz;
  recipient_scope_value text;
  revocation_plan_value text;
  attestation_value text;
  data_boundary_value text;
  review_note_value text;
  actor_role text;
  required_roles text[] := array[
    'finance-reviewer',
    'qualified-counsel',
    'executive-sponsor',
    'privacy-security-owner',
    'clinical-governance-owner',
    'marketing-claims-owner',
    'buyer-permission-owner'
  ];
  linked_roles text[] := '{}'::text[];
  missing_roles text[] := '{}'::text[];
  expired_roles text[] := '{}'::text[];
  retained_blockers_value text[];
  release_restrictions_value text[];
  lockbox_status_value text;
  evidence_snapshot_value jsonb;
  created_lockbox_id uuid;
  protected_boundary text :=
    'Protected Distribution Lockbox records disabled-by-default no-PHI metadata for externally retained distribution approvals, customer permissions, counsel review, reviewer sign-offs, and artifact manifests. It does not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, signed BAAs/DPAs, signed approvals, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, advertising claim substantiation, clinical validation, compliance certification, customer permission artifacts, public release approval, external distribution approval, production authorization, or live clinical execution approval.';
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
    raise exception 'protected-distribution-lockbox-invalid-payload';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(normalized_input) as supplied(key)
    where supplied.key <> all(array[
      'signoffRecordIds',
      'distributionAudience',
      'distributionChannelControl',
      'manifestVersion',
      'manifestTitle',
      'artifactManifestLabel',
      'artifactManifestLocator',
      'customerPermissionReference',
      'counselReviewReference',
      'distributionWindowStart',
      'distributionWindowEnd',
      'recipientScope',
      'revocationPlan',
      'externalApprovalsRetained',
      'distributionDisabled',
      'attestation',
      'dataBoundary',
      'reviewNote'
    ])
  ) then
    raise exception 'protected-distribution-lockbox-unsupported-field';
  end if;

  if jsonb_typeof(normalized_input -> 'signoffRecordIds') <> 'array' then
    raise exception 'protected-distribution-lockbox-invalid-signoff-records';
  end if;

  begin
    select coalesce(array_agg(distinct ids.value::uuid order by ids.value::uuid), '{}'::uuid[])
    into signoff_record_ids_value
    from jsonb_array_elements_text(normalized_input -> 'signoffRecordIds') as ids(value);

    distribution_window_start_value := (normalized_input ->> 'distributionWindowStart')::timestamptz;
    distribution_window_end_value := (normalized_input ->> 'distributionWindowEnd')::timestamptz;
  exception when others then
    raise exception 'protected-distribution-lockbox-invalid-typed-field';
  end;

  distribution_audience_value := trim(coalesce(normalized_input ->> 'distributionAudience', ''));
  distribution_channel_control_value := trim(coalesce(normalized_input ->> 'distributionChannelControl', ''));
  manifest_version_value := left(trim(coalesce(normalized_input ->> 'manifestVersion', '')), 41);
  manifest_title_value := left(trim(coalesce(normalized_input ->> 'manifestTitle', '')), 141);
  artifact_manifest_label_value := left(trim(coalesce(normalized_input ->> 'artifactManifestLabel', '')), 121);
  artifact_manifest_locator_value := left(trim(coalesce(normalized_input ->> 'artifactManifestLocator', '')), 141);
  customer_permission_reference_value := left(trim(coalesce(normalized_input ->> 'customerPermissionReference', '')), 141);
  counsel_review_reference_value := left(trim(coalesce(normalized_input ->> 'counselReviewReference', '')), 141);
  recipient_scope_value := left(trim(coalesce(normalized_input ->> 'recipientScope', '')), 141);
  revocation_plan_value := left(trim(coalesce(normalized_input ->> 'revocationPlan', '')), 181);
  attestation_value := trim(coalesce(normalized_input ->> 'attestation', ''));
  data_boundary_value := trim(coalesce(normalized_input ->> 'dataBoundary', ''));
  review_note_value := left(trim(coalesce(normalized_input ->> 'reviewNote', '')), 281);

  if cardinality(signoff_record_ids_value) < 1
    or cardinality(signoff_record_ids_value) > 14
    or distribution_audience_value not in (
      'buyer-diligence-room',
      'investor-data-room',
      'board-room',
      'sales-collateral-channel',
      'marketing-site-release',
      'public-relations-channel',
      'customer-case-study-channel'
    )
    or distribution_channel_control_value not in (
      'external-data-room',
      'counsel-reviewed-room',
      'procurement-portal',
      'board-governance-room',
      'marketing-release-queue',
      'pr-release-queue',
      'customer-permission-room'
    )
    or manifest_version_value !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{1,39}$'
    or manifest_title_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{5,139}$'
    or artifact_manifest_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,119}$'
    or artifact_manifest_locator_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or customer_permission_reference_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or counsel_review_reference_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or distribution_window_start_value < now() - interval '1 day'
    or distribution_window_end_value <= distribution_window_start_value
    or distribution_window_end_value > now() + interval '400 days'
    or recipient_scope_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or revocation_plan_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{7,179}$'
    or coalesce(normalized_input ->> 'externalApprovalsRetained', '') <> 'true'
    or coalesce(normalized_input ->> 'distributionDisabled', '') <> 'true'
    or attestation_value <> 'external-distribution-lockbox-metadata-no-phi'
    or data_boundary_value <> 'synthetic-business-workflow-only'
    or char_length(review_note_value) > 280 then
    raise exception 'protected-distribution-lockbox-validation-failed';
  end if;

  if array_to_string(signoff_record_ids_value, ' ') || ' ' || distribution_audience_value || ' ' || distribution_channel_control_value || ' ' || manifest_version_value || ' ' || manifest_title_value || ' ' || artifact_manifest_label_value || ' ' || artifact_manifest_locator_value || ' ' || customer_permission_reference_value || ' ' || counsel_review_reference_value || ' ' || recipient_scope_value || ' ' || revocation_plan_value || ' ' || review_note_value ~*
    '(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|sk-[A-Za-z0-9_-]{12,}|sbp_[A-Za-z0-9_-]{12,}|bearer[[:space:]]+[A-Za-z0-9._-]+|token|secret|password|api[ _-]?key|access[ _-]?key|https?:\/\/|patient[ _-]?(id|identifier|mrn)|member[ _-]?(id|identifier)|medical record|protected health information|payer member|diagnosis code|social security|source contract|signed[ _-]?(baa|dpa|contract|agreement|document|approval)|legal opinion|audited financial|investment recommendation|securities offering|valuation guarantee|revenue guarantee|reimbursement guarantee|guaranteed savings|guaranteed outcome|advertising substantiation|clinical validation|compliance certification|fda[ _-]?cleared|hipaa[ _-]?(compliant|certified)|soc[ _-]?2[ _-]?certified|autonomous diagnosis|treatment recommendation|live clinical execution|public release approved|approval authority|external distribution approved|distribution enabled)' then
    raise exception 'protected-distribution-lockbox-prohibited-content';
  end if;

  select membership.role
  into actor_role
  from public.pilot_memberships membership
  where membership.tenant_id = selected_workspace.tenant_id
    and membership.user_id = (select auth.uid())
    and membership.role in ('tenant-admin', 'pilot-lead', 'reviewer')
  limit 1;

  if actor_role is null then
    raise exception 'protected-distribution-lockbox-role-denied';
  end if;

  select count(*)
  into signoff_count_value
  from public.protected_named_reviewer_signoffs signoff
  where signoff.id = any(signoff_record_ids_value)
    and signoff.workspace_id = selected_workspace.id
    and signoff.tenant_id = selected_workspace.tenant_id;

  if signoff_count_value <> cardinality(signoff_record_ids_value) then
    raise exception 'protected-distribution-lockbox-signoff-not-found';
  end if;

  select coalesce(array_agg(distinct signoff.reviewer_role order by signoff.reviewer_role), '{}'::text[])
  into linked_roles
  from public.protected_named_reviewer_signoffs signoff
  where signoff.id = any(signoff_record_ids_value)
    and signoff.workspace_id = selected_workspace.id
    and signoff.tenant_id = selected_workspace.tenant_id
    and signoff.external_signoff_retained is true
    and signoff.expires_at > now();

  select coalesce(array_agg(distinct signoff.reviewer_role order by signoff.reviewer_role), '{}'::text[])
  into expired_roles
  from public.protected_named_reviewer_signoffs signoff
  where signoff.id = any(signoff_record_ids_value)
    and signoff.workspace_id = selected_workspace.id
    and signoff.tenant_id = selected_workspace.tenant_id
    and signoff.expires_at <= now();

  select coalesce(array_agg(required.role order by required.role), '{}'::text[])
  into missing_roles
  from unnest(required_roles) as required(role)
  where not required.role = any(linked_roles);

  lockbox_status_value := case
    when cardinality(missing_roles) = 0 and cardinality(expired_roles) = 0 then
      'ready-for-external-distribution-lockbox-review-not-release-authority'
    when cardinality(linked_roles) > 0 then
      'reviewer-signoffs-linked'
    else
      'lockbox-metadata-recorded'
  end;

  retained_blockers_value := array[
    'Distribution disabled: true',
    'Missing reviewer roles: ' || coalesce(nullif(array_to_string(missing_roles, ', '), ''), 'none'),
    'Expired sign-off roles: ' || coalesce(nullif(array_to_string(expired_roles, ', '), ''), 'none'),
    'External approvals, permissions, legal review, signatures, recipient lists, and artifacts must be retained outside SCRIMED.',
    'This metadata does not create legal, financial, securities, advertising, customer, compliance, production, reimbursement, clinical validation, public release, external distribution, or live clinical execution authority.'
  ];

  release_restrictions_value := array[
    'No external distribution can be enabled in this SCRIMED pilot boundary.',
    'No PHI, source documents, signed approvals, customer permission artifacts, legal opinions, audited financial statements, securities materials, advertising substantiation, clinical validation, production authorization, or live-care records may be stored here.',
    'Missing, expired, claim-version-mismatched, or externally unretained reviewer sign-off metadata must block distribution.',
    'Any buyer, investor, marketing, PR, sales, or customer-proof packet requires independently retained approval scope outside SCRIMED.'
  ];

  evidence_snapshot_value := jsonb_build_object(
    'distributionAudience', distribution_audience_value,
    'distributionChannelControl', distribution_channel_control_value,
    'lockboxStatus', lockbox_status_value,
    'approvalScope', 'external-distribution-lockbox-review-readiness-only',
    'manifestVersion', manifest_version_value,
    'distributionWindowStart', distribution_window_start_value,
    'distributionWindowEnd', distribution_window_end_value,
    'signoffRecordIds', signoff_record_ids_value,
    'requiredReviewerRoles', required_roles,
    'linkedReviewerRoles', linked_roles,
    'missingReviewerRoles', missing_roles,
    'expiredSignoffRoles', expired_roles,
    'externalApprovalsRetained', true,
    'distributionDisabled', true,
    'lockboxAuthority', 'distribution-lockbox-metadata-not-release-approval',
    'releaseAuthority', 'external-distribution-disabled-pending-real-approval',
    'storageAuthority', 'manifest-metadata-only-no-sensitive-artifacts',
    'signoffAuthority', 'named-reviewer-metadata-not-approval',
    'signoffReleaseAuthority', 'controlled-distribution-review-not-release-authority',
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

  insert into public.protected_distribution_lockboxes (
    tenant_id,
    workspace_id,
    distribution_audience,
    distribution_channel_control,
    lockbox_status,
    approval_scope,
    manifest_version,
    manifest_title,
    artifact_manifest_label,
    artifact_manifest_locator,
    customer_permission_reference,
    counsel_review_reference,
    distribution_window_start,
    distribution_window_end,
    recipient_scope,
    revocation_plan,
    signoff_record_ids,
    evidence_snapshot,
    required_reviewer_roles,
    linked_reviewer_roles,
    missing_reviewer_roles,
    expired_signoff_roles,
    retained_blockers,
    release_restrictions,
    external_approvals_retained,
    distribution_disabled,
    attestation,
    review_note,
    data_boundary,
    lockbox_authority,
    release_authority,
    storage_authority,
    signoff_authority,
    signoff_release_authority,
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
    distribution_audience_value,
    distribution_channel_control_value,
    lockbox_status_value,
    'external-distribution-lockbox-review-readiness-only',
    manifest_version_value,
    manifest_title_value,
    artifact_manifest_label_value,
    artifact_manifest_locator_value,
    customer_permission_reference_value,
    counsel_review_reference_value,
    distribution_window_start_value,
    distribution_window_end_value,
    recipient_scope_value,
    revocation_plan_value,
    signoff_record_ids_value,
    evidence_snapshot_value,
    required_roles,
    linked_roles,
    missing_roles,
    expired_roles,
    retained_blockers_value,
    release_restrictions_value,
    true,
    true,
    attestation_value,
    review_note_value,
    data_boundary_value,
    'distribution-lockbox-metadata-not-release-approval',
    'external-distribution-disabled-pending-real-approval',
    'manifest-metadata-only-no-sensitive-artifacts',
    'named-reviewer-metadata-not-approval',
    'controlled-distribution-review-not-release-authority',
    'qualified-release-review-not-public-release',
    'not-audited-financial-report',
    'not-securities-offering-material',
    'not-advertising-claim-substantiation',
    'not-authorized-live-care',
    (select auth.uid()),
    protected_boundary
  )
  returning id into created_lockbox_id;

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
    'protected-distribution-lockbox-recorded',
    jsonb_build_object(
      'lockboxId', created_lockbox_id,
      'distributionAudience', distribution_audience_value,
      'distributionChannelControl', distribution_channel_control_value,
      'manifestVersion', manifest_version_value,
      'lockboxStatus', lockbox_status_value,
      'signoffRecordIds', signoff_record_ids_value,
      'requiredReviewerRoles', required_roles,
      'linkedReviewerRoles', linked_roles,
      'missingReviewerRoles', missing_roles,
      'expiredSignoffRoles', expired_roles,
      'actorRole', actor_role,
      'approvalScope', 'external-distribution-lockbox-review-readiness-only',
      'externalApprovalsRetained', true,
      'distributionDisabled', true,
      'assuranceLevel', 'aal2',
      'syntheticOnly', true,
      'metadataOnly', true,
      'noPhi', true,
      'lockboxAuthority', 'distribution-lockbox-metadata-not-release-approval',
      'releaseAuthority', 'external-distribution-disabled-pending-real-approval',
      'storageAuthority', 'manifest-metadata-only-no-sensitive-artifacts',
      'signoffAuthority', 'named-reviewer-metadata-not-approval',
      'signoffReleaseAuthority', 'controlled-distribution-review-not-release-authority',
      'releaseDecisionAuthority', 'qualified-release-review-not-public-release',
      'financialReportingAuthority', 'not-audited-financial-report',
      'securitiesAuthority', 'not-securities-offering-material',
      'advertisingClaimsAuthority', 'not-advertising-claim-substantiation',
      'clinicalExecutionAuthority', 'not-authorized-live-care'
    )
  );

  return created_lockbox_id;
end;
$$;

create or replace function public.record_protected_distribution_lockbox(
  p_workspace_slug text,
  p_lockbox_input jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_protected_distribution_lockbox(
    p_workspace_slug,
    p_lockbox_input
  );
$$;

revoke all on function private.record_protected_distribution_lockbox(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.record_protected_distribution_lockbox(text, jsonb)
  from public, anon, authenticated, service_role;

grant execute on function private.record_protected_distribution_lockbox(text, jsonb)
  to authenticated;
grant execute on function public.record_protected_distribution_lockbox(text, jsonb)
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
    'schemaVersion', '2026-06-20.4',
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
    'protectedDistributionLockboxPackets', 'aal2-audited-distribution-lockbox-packets-no-phi'
  );
$$;

comment on table public.protected_distribution_lockboxes is
  'Tenant-scoped no-PHI disabled-by-default metadata records for externally retained distribution approvals, customer permissions, counsel review, reviewer sign-offs, and artifact manifests. RLS select requires authenticated AAL2 governance context and tenant membership. Writes require guarded RPC. This table does not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, signed approvals, legal opinions, audited financial statements, securities offering material, advertising substantiation, customer permission artifacts, public release approval, external distribution approval, production authorization, or live clinical execution approval.';
comment on function private.record_protected_distribution_lockbox(text, jsonb) is
  'Records bounded no-PHI disabled distribution lockbox metadata after AAL2 governance authorization and appends an audit event. Lockbox readiness is not legal approval, public release approval, external distribution approval, audited financial reporting, advertising substantiation, customer permission, compliance certification, production authorization, or live clinical execution authority.';
