create table if not exists public.protected_named_reviewer_signoffs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  release_decision_id uuid references public.protected_release_decisions(id) on delete restrict,
  reviewer_role text not null check (
    reviewer_role in (
      'finance-reviewer',
      'qualified-counsel',
      'executive-sponsor',
      'privacy-security-owner',
      'clinical-governance-owner',
      'marketing-claims-owner',
      'buyer-permission-owner'
    )
  ),
  reviewer_role_label text not null check (char_length(reviewer_role_label) between 3 and 80),
  signoff_status text not null check (
    signoff_status in (
      'signoff-metadata-recorded',
      'release-decision-linked',
      'all-domain-signoff-metadata-complete-not-release-authority',
      'blocked'
    )
  ),
  approval_scope text not null default 'controlled-distribution-review-readiness-only'
    check (approval_scope = 'controlled-distribution-review-readiness-only'),
  reviewer_display_name text not null check (
    char_length(reviewer_display_name) between 3 and 80
    and reviewer_display_name ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{2,79}$'
  ),
  reviewer_organization text not null check (
    char_length(reviewer_organization) between 3 and 100
    and reviewer_organization ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{2,99}$'
  ),
  signoff_reference_label text not null check (
    char_length(signoff_reference_label) between 4 and 120
    and signoff_reference_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,119}$'
  ),
  signoff_reference_locator text not null check (
    char_length(signoff_reference_locator) between 4 and 140
    and signoff_reference_locator ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  artifact_scope text not null check (
    char_length(artifact_scope) between 6 and 160
    and artifact_scope ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{5,159}$'
  ),
  approved_claim_version text not null check (
    char_length(approved_claim_version) between 2 and 40
    and approved_claim_version ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{1,39}$'
  ),
  distribution_scope text not null check (
    char_length(distribution_scope) between 4 and 140
    and distribution_scope ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  expires_at timestamptz not null,
  external_signoff_retained boolean not null default true
    check (external_signoff_retained is true),
  evidence_snapshot jsonb not null default '{}'::jsonb
    check (jsonb_typeof(evidence_snapshot) = 'object' and pg_column_size(evidence_snapshot) <= 8192),
  required_reviewer_roles text[] not null
    check (cardinality(required_reviewer_roles) = 7),
  linked_reviewer_roles text[] not null default '{}'::text[]
    check (cardinality(linked_reviewer_roles) between 0 and 7),
  missing_reviewer_roles text[] not null default '{}'::text[]
    check (cardinality(missing_reviewer_roles) between 0 and 7),
  retained_blockers text[] not null default '{}'::text[]
    check (cardinality(retained_blockers) between 1 and 16),
  release_restrictions text[] not null default '{}'::text[]
    check (cardinality(release_restrictions) between 1 and 16),
  attestation text not null check (
    attestation = 'named-reviewer-signoff-metadata-no-phi'
  ),
  review_note text not null default '' check (char_length(review_note) <= 280),
  data_boundary text not null check (data_boundary = 'synthetic-business-workflow-only'),
  signoff_authority text not null default 'named-reviewer-metadata-not-approval'
    check (signoff_authority = 'named-reviewer-metadata-not-approval'),
  release_authority text not null default 'controlled-distribution-review-not-release-authority'
    check (release_authority = 'controlled-distribution-review-not-release-authority'),
  storage_authority text not null default 'no-sensitive-signature-document-storage'
    check (storage_authority = 'no-sensitive-signature-document-storage'),
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
    'Protected Named Reviewer Sign-Off Packets record bounded no-PHI metadata references to externally retained reviewer sign-offs for claim versions and distribution scopes. They do not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, signed BAAs/DPAs, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, advertising claim substantiation, clinical validation, compliance certification, customer permission artifacts, public release approval, production authorization, or live clinical execution approval.'
);

create index if not exists protected_named_reviewer_signoffs_tenant_recorded_at_idx
  on public.protected_named_reviewer_signoffs(tenant_id, recorded_at desc);
create index if not exists protected_named_reviewer_signoffs_workspace_recorded_at_idx
  on public.protected_named_reviewer_signoffs(workspace_id, recorded_at desc);
create index if not exists protected_named_reviewer_signoffs_role_idx
  on public.protected_named_reviewer_signoffs(workspace_id, reviewer_role, recorded_at desc);
create index if not exists protected_named_reviewer_signoffs_release_decision_idx
  on public.protected_named_reviewer_signoffs(release_decision_id, recorded_at desc)
  where release_decision_id is not null;
create index if not exists protected_named_reviewer_signoffs_claim_version_idx
  on public.protected_named_reviewer_signoffs(workspace_id, approved_claim_version, expires_at desc);
create index if not exists protected_named_reviewer_signoffs_recorded_by_idx
  on public.protected_named_reviewer_signoffs(recorded_by);

alter table public.protected_named_reviewer_signoffs enable row level security;
revoke all on public.protected_named_reviewer_signoffs from public, anon, authenticated;
grant select on public.protected_named_reviewer_signoffs to authenticated;

drop policy if exists protected_named_reviewer_signoffs_member_select
  on public.protected_named_reviewer_signoffs;
create policy protected_named_reviewer_signoffs_member_select
on public.protected_named_reviewer_signoffs
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
      'protected-named-reviewer-signoff-recorded'
    )
  );

create or replace function private.record_protected_named_reviewer_signoff(
  p_workspace_slug text,
  p_signoff_input jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  release_decision_row public.protected_release_decisions%rowtype;
  normalized_input jsonb := coalesce(p_signoff_input, '{}'::jsonb);
  reviewer_role_value text;
  reviewer_role_label_value text;
  release_decision_id_value uuid;
  reviewer_display_name_value text;
  reviewer_organization_value text;
  signoff_reference_label_value text;
  signoff_reference_locator_value text;
  artifact_scope_value text;
  approved_claim_version_value text;
  distribution_scope_value text;
  expires_at_value timestamptz;
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
  retained_blockers_value text[];
  release_restrictions_value text[];
  signoff_status_value text;
  evidence_snapshot_value jsonb;
  created_signoff_id uuid;
  protected_boundary text :=
    'Protected Named Reviewer Sign-Off Packets record bounded no-PHI metadata references to externally retained reviewer sign-offs for claim versions and distribution scopes. They do not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, signed BAAs/DPAs, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, advertising claim substantiation, clinical validation, compliance certification, customer permission artifacts, public release approval, production authorization, or live clinical execution approval.';
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead', 'reviewer']
  );

  if jsonb_typeof(normalized_input) <> 'object'
    or pg_column_size(normalized_input) > 4608 then
    raise exception 'protected-named-reviewer-signoff-invalid-payload';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(normalized_input) as supplied(key)
    where supplied.key <> all(array[
      'reviewerRole',
      'releaseDecisionId',
      'reviewerDisplayName',
      'reviewerOrganization',
      'signoffReferenceLabel',
      'signoffReferenceLocator',
      'artifactScope',
      'approvedClaimVersion',
      'distributionScope',
      'expiresAt',
      'externalSignoffRetained',
      'attestation',
      'dataBoundary',
      'reviewNote'
    ])
  ) then
    raise exception 'protected-named-reviewer-signoff-unsupported-field';
  end if;

  reviewer_role_value := trim(coalesce(normalized_input ->> 'reviewerRole', ''));
  reviewer_display_name_value := left(trim(coalesce(normalized_input ->> 'reviewerDisplayName', '')), 81);
  reviewer_organization_value := left(trim(coalesce(normalized_input ->> 'reviewerOrganization', '')), 101);
  signoff_reference_label_value := left(trim(coalesce(normalized_input ->> 'signoffReferenceLabel', '')), 121);
  signoff_reference_locator_value := left(trim(coalesce(normalized_input ->> 'signoffReferenceLocator', '')), 141);
  artifact_scope_value := left(trim(coalesce(normalized_input ->> 'artifactScope', '')), 161);
  approved_claim_version_value := left(trim(coalesce(normalized_input ->> 'approvedClaimVersion', '')), 41);
  distribution_scope_value := left(trim(coalesce(normalized_input ->> 'distributionScope', '')), 141);
  attestation_value := trim(coalesce(normalized_input ->> 'attestation', ''));
  data_boundary_value := trim(coalesce(normalized_input ->> 'dataBoundary', ''));
  review_note_value := left(trim(coalesce(normalized_input ->> 'reviewNote', '')), 281);

  begin
    if nullif(trim(coalesce(normalized_input ->> 'releaseDecisionId', '')), '') is not null then
      release_decision_id_value := trim(coalesce(normalized_input ->> 'releaseDecisionId', ''))::uuid;
    end if;

    expires_at_value := (normalized_input ->> 'expiresAt')::timestamptz;
  exception when others then
    raise exception 'protected-named-reviewer-signoff-invalid-typed-field';
  end;

  reviewer_role_label_value := case reviewer_role_value
    when 'finance-reviewer' then 'Finance reviewer'
    when 'qualified-counsel' then 'Qualified counsel'
    when 'executive-sponsor' then 'Executive sponsor'
    when 'privacy-security-owner' then 'Privacy and security owner'
    when 'clinical-governance-owner' then 'Clinical governance owner'
    when 'marketing-claims-owner' then 'Marketing claims owner'
    when 'buyer-permission-owner' then 'Buyer permission owner'
    else ''
  end;

  if reviewer_role_value <> all(required_roles)
    or reviewer_display_name_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{2,79}$'
    or reviewer_organization_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{2,99}$'
    or signoff_reference_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,119}$'
    or signoff_reference_locator_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or artifact_scope_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{5,159}$'
    or approved_claim_version_value !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{1,39}$'
    or distribution_scope_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or expires_at_value <= now() + interval '1 day'
    or expires_at_value > now() + interval '400 days'
    or coalesce(normalized_input ->> 'externalSignoffRetained', '') <> 'true'
    or attestation_value <> 'named-reviewer-signoff-metadata-no-phi'
    or data_boundary_value <> 'synthetic-business-workflow-only'
    or char_length(review_note_value) > 280 then
    raise exception 'protected-named-reviewer-signoff-validation-failed';
  end if;

  if reviewer_role_value || ' ' || coalesce(release_decision_id_value::text, '') || ' ' || reviewer_display_name_value || ' ' || reviewer_organization_value || ' ' || signoff_reference_label_value || ' ' || signoff_reference_locator_value || ' ' || artifact_scope_value || ' ' || approved_claim_version_value || ' ' || distribution_scope_value || ' ' || review_note_value ~*
    '(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|sk-[A-Za-z0-9_-]{12,}|sbp_[A-Za-z0-9_-]{12,}|bearer[[:space:]]+[A-Za-z0-9._-]+|token|secret|password|api[ _-]?key|access[ _-]?key|https?:\/\/|patient[ _-]?(id|identifier|mrn)|member[ _-]?(id|identifier)|medical record|protected health information|payer member|diagnosis code|social security|source contract|signed[ _-]?(baa|dpa|contract|agreement|document)|legal opinion|audited financial|investment recommendation|securities offering|valuation guarantee|revenue guarantee|reimbursement guarantee|guaranteed savings|guaranteed outcome|advertising substantiation|clinical validation|compliance certification|fda[ _-]?cleared|hipaa[ _-]?(compliant|certified)|soc[ _-]?2[ _-]?certified|autonomous diagnosis|treatment recommendation|live clinical execution|public release approved|approval authority|external distribution approved)' then
    raise exception 'protected-named-reviewer-signoff-prohibited-content';
  end if;

  select membership.role
  into actor_role
  from public.pilot_memberships membership
  where membership.tenant_id = selected_workspace.tenant_id
    and membership.user_id = (select auth.uid())
    and membership.role in ('tenant-admin', 'pilot-lead', 'reviewer')
  limit 1;

  if actor_role is null then
    raise exception 'protected-named-reviewer-signoff-role-denied';
  end if;

  if release_decision_id_value is not null then
    select *
    into release_decision_row
    from public.protected_release_decisions decision
    where decision.id = release_decision_id_value
      and decision.workspace_id = selected_workspace.id
      and decision.tenant_id = selected_workspace.tenant_id;

    if not found then
      raise exception 'protected-named-reviewer-signoff-release-decision-not-found';
    end if;

    if release_decision_row.decision_status <> 'ready-for-qualified-release-review-not-release-authority' then
      raise exception 'protected-named-reviewer-signoff-release-decision-not-ready';
    end if;

    if release_decision_row.claim_version <> approved_claim_version_value then
      raise exception 'protected-named-reviewer-signoff-claim-version-mismatch';
    end if;
  end if;

  select coalesce(array_agg(distinct linked.role order by linked.role), '{}'::text[])
  into linked_roles
  from (
    select signoff.reviewer_role as role
    from public.protected_named_reviewer_signoffs signoff
    where signoff.workspace_id = selected_workspace.id
      and signoff.tenant_id = selected_workspace.tenant_id
      and signoff.approved_claim_version = approved_claim_version_value
      and signoff.expires_at > now()
    union
    select reviewer_role_value as role
  ) linked;

  select coalesce(array_agg(required.role order by required.role), '{}'::text[])
  into missing_roles
  from unnest(required_roles) as required(role)
  where not required.role = any(linked_roles);

  signoff_status_value := case
    when cardinality(missing_roles) = 0 and release_decision_id_value is not null then
      'all-domain-signoff-metadata-complete-not-release-authority'
    when release_decision_id_value is not null then
      'release-decision-linked'
    else
      'signoff-metadata-recorded'
  end;

  retained_blockers_value := array[
    'Missing reviewer roles: ' || coalesce(nullif(array_to_string(missing_roles, ', '), ''), 'none'),
    'Linked ready release decision: ' || coalesce(release_decision_id_value::text, 'none'),
    'Controlled distribution review readiness is not public release approval or external distribution approval.',
    'This metadata does not create legal, financial, securities, advertising, customer, compliance, production, reimbursement, clinical validation, or live clinical execution authority.'
  ];

  release_restrictions_value := array[
    'No public distribution until exact artifacts, signatures, customer permissions, and qualified external approvals are retained outside SCRIMED.',
    'No PHI, source documents, signed BAAs/DPAs, credentials, legal opinions, audited financial statements, securities materials, advertising substantiation, customer permission artifacts, clinical validation, or production authorization may be stored here.',
    'Expired, missing, or claim-version-mismatched reviewer sign-off metadata must block distribution.',
    'Customer-specific proof, logos, case studies, benchmarks, or deployment facts require written buyer permission retained outside SCRIMED.'
  ];

  evidence_snapshot_value := jsonb_build_object(
    'reviewerRole', reviewer_role_value,
    'reviewerRoleLabel', reviewer_role_label_value,
    'releaseDecisionId', release_decision_id_value,
    'signoffStatus', signoff_status_value,
    'approvalScope', 'controlled-distribution-review-readiness-only',
    'approvedClaimVersion', approved_claim_version_value,
    'distributionScope', distribution_scope_value,
    'expiresAt', expires_at_value,
    'externalSignoffRetained', true,
    'requiredReviewerRoles', required_roles,
    'linkedReviewerRoles', linked_roles,
    'missingReviewerRoles', missing_roles,
    'signoffAuthority', 'named-reviewer-metadata-not-approval',
    'releaseAuthority', 'controlled-distribution-review-not-release-authority',
    'storageAuthority', 'no-sensitive-signature-document-storage',
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

  insert into public.protected_named_reviewer_signoffs (
    tenant_id,
    workspace_id,
    release_decision_id,
    reviewer_role,
    reviewer_role_label,
    signoff_status,
    approval_scope,
    reviewer_display_name,
    reviewer_organization,
    signoff_reference_label,
    signoff_reference_locator,
    artifact_scope,
    approved_claim_version,
    distribution_scope,
    expires_at,
    external_signoff_retained,
    evidence_snapshot,
    required_reviewer_roles,
    linked_reviewer_roles,
    missing_reviewer_roles,
    retained_blockers,
    release_restrictions,
    attestation,
    review_note,
    data_boundary,
    signoff_authority,
    release_authority,
    storage_authority,
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
    release_decision_id_value,
    reviewer_role_value,
    reviewer_role_label_value,
    signoff_status_value,
    'controlled-distribution-review-readiness-only',
    reviewer_display_name_value,
    reviewer_organization_value,
    signoff_reference_label_value,
    signoff_reference_locator_value,
    artifact_scope_value,
    approved_claim_version_value,
    distribution_scope_value,
    expires_at_value,
    true,
    evidence_snapshot_value,
    required_roles,
    linked_roles,
    missing_roles,
    retained_blockers_value,
    release_restrictions_value,
    attestation_value,
    review_note_value,
    data_boundary_value,
    'named-reviewer-metadata-not-approval',
    'controlled-distribution-review-not-release-authority',
    'no-sensitive-signature-document-storage',
    'qualified-release-review-not-public-release',
    'not-audited-financial-report',
    'not-securities-offering-material',
    'not-advertising-claim-substantiation',
    'not-authorized-live-care',
    (select auth.uid()),
    protected_boundary
  )
  returning id into created_signoff_id;

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
    'protected-named-reviewer-signoff-recorded',
    jsonb_build_object(
      'signoffId', created_signoff_id,
      'reviewerRole', reviewer_role_value,
      'reviewerRoleLabel', reviewer_role_label_value,
      'releaseDecisionId', release_decision_id_value,
      'approvedClaimVersion', approved_claim_version_value,
      'distributionScope', distribution_scope_value,
      'signoffStatus', signoff_status_value,
      'requiredReviewerRoles', required_roles,
      'linkedReviewerRoles', linked_roles,
      'missingReviewerRoles', missing_roles,
      'actorRole', actor_role,
      'approvalScope', 'controlled-distribution-review-readiness-only',
      'assuranceLevel', 'aal2',
      'syntheticOnly', true,
      'metadataOnly', true,
      'noPhi', true,
      'signoffAuthority', 'named-reviewer-metadata-not-approval',
      'releaseAuthority', 'controlled-distribution-review-not-release-authority',
      'storageAuthority', 'no-sensitive-signature-document-storage',
      'releaseDecisionAuthority', 'qualified-release-review-not-public-release',
      'financialReportingAuthority', 'not-audited-financial-report',
      'securitiesAuthority', 'not-securities-offering-material',
      'advertisingClaimsAuthority', 'not-advertising-claim-substantiation',
      'clinicalExecutionAuthority', 'not-authorized-live-care'
    )
  );

  return created_signoff_id;
end;
$$;

create or replace function public.record_protected_named_reviewer_signoff(
  p_workspace_slug text,
  p_signoff_input jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_protected_named_reviewer_signoff(
    p_workspace_slug,
    p_signoff_input
  );
$$;

revoke all on function private.record_protected_named_reviewer_signoff(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.record_protected_named_reviewer_signoff(text, jsonb)
  from public, anon, authenticated, service_role;

grant execute on function private.record_protected_named_reviewer_signoff(text, jsonb)
  to authenticated;
grant execute on function public.record_protected_named_reviewer_signoff(text, jsonb)
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
    'schemaVersion', '2026-06-20.3',
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
    'protectedNamedReviewerSignoffPackets', 'aal2-audited-named-reviewer-signoff-packets-no-phi'
  );
$$;

comment on table public.protected_named_reviewer_signoffs is
  'Tenant-scoped no-PHI metadata references to externally retained named reviewer sign-offs for controlled distribution review readiness. RLS select requires authenticated AAL2 governance context and tenant membership. Writes require guarded RPC. This table does not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, signed BAAs/DPAs, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, advertising claim substantiation, clinical validation, compliance certification, customer permission artifacts, public release approval, production authorization, or live clinical execution approval.';
comment on function private.record_protected_named_reviewer_signoff(text, jsonb) is
  'Records bounded no-PHI named reviewer sign-off metadata after AAL2 governance authorization and appends an audit event. Controlled distribution review readiness is not legal approval, audited financial reporting, advertising substantiation, customer permission, compliance certification, production authorization, public release approval, external distribution approval, or live clinical execution authority.';
