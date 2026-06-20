create table if not exists public.protected_release_decisions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  release_audience text not null check (
    release_audience in (
      'internal-board',
      'buyer-diligence',
      'investor-data-room',
      'public-relations',
      'marketing-site',
      'sales-collateral',
      'customer-case-study'
    )
  ),
  claim_category text not null check (
    claim_category in (
      'workflow-efficiency',
      'governance',
      'security-privacy',
      'interoperability',
      'financial-operating',
      'clinical-boundary',
      'customer-proof'
    )
  ),
  claim_version text not null check (
    char_length(claim_version) between 2 and 40
    and claim_version ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{1,39}$'
  ),
  claim_text text not null check (
    char_length(claim_text) between 12 and 220
    and claim_text ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{11,219}$'
  ),
  decision_status text not null check (
    decision_status in (
      'draft-review-required',
      'claim-registry-versioned',
      'external-evidence-linked',
      'ready-for-qualified-release-review-not-release-authority',
      'blocked'
    )
  ),
  approval_scope text not null default 'release-review-readiness-only'
    check (approval_scope = 'release-review-readiness-only'),
  distribution_channel text not null check (
    char_length(distribution_channel) between 3 and 120
    and distribution_channel ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{2,119}$'
  ),
  external_approval_evidence_record_ids uuid[] not null default '{}'::uuid[]
    check (cardinality(external_approval_evidence_record_ids) between 0 and 7),
  evidence_snapshot jsonb not null default '{}'::jsonb
    check (jsonb_typeof(evidence_snapshot) = 'object' and pg_column_size(evidence_snapshot) <= 8192),
  required_approval_domains text[] not null
    check (cardinality(required_approval_domains) = 7),
  linked_approval_domains text[] not null default '{}'::text[]
    check (cardinality(linked_approval_domains) between 0 and 7),
  missing_approval_domains text[] not null default '{}'::text[]
    check (cardinality(missing_approval_domains) between 0 and 7),
  retained_blockers text[] not null default '{}'::text[]
    check (cardinality(retained_blockers) between 1 and 16),
  release_restrictions text[] not null default '{}'::text[]
    check (cardinality(release_restrictions) between 1 and 16),
  attestation text not null check (
    attestation = 'release-decision-claim-registry-no-phi'
  ),
  review_note text not null default '' check (char_length(review_note) <= 280),
  data_boundary text not null check (data_boundary = 'synthetic-business-workflow-only'),
  claim_registry_authority text not null default 'versioned-claim-registry-not-claim-approval'
    check (claim_registry_authority = 'versioned-claim-registry-not-claim-approval'),
  release_decision_authority text not null default 'qualified-release-review-not-public-release'
    check (release_decision_authority = 'qualified-release-review-not-public-release'),
  distribution_authority text not null default 'distribution-blocked-until-qualified-release-approval'
    check (distribution_authority = 'distribution-blocked-until-qualified-release-approval'),
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
    'Protected Release Decision Workflow records bounded no-PHI release-review readiness decisions for versioned claim registry entries. It does not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, signed BAAs/DPAs, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, advertising claim substantiation, clinical validation, compliance certification, customer permission artifacts, public release approval, production authorization, or live clinical execution approval.'
);

create index if not exists protected_release_decisions_tenant_recorded_at_idx
  on public.protected_release_decisions(tenant_id, recorded_at desc);
create index if not exists protected_release_decisions_workspace_recorded_at_idx
  on public.protected_release_decisions(workspace_id, recorded_at desc);
create index if not exists protected_release_decisions_category_idx
  on public.protected_release_decisions(workspace_id, claim_category, recorded_at desc);
create index if not exists protected_release_decisions_audience_idx
  on public.protected_release_decisions(workspace_id, release_audience, recorded_at desc);
create index if not exists protected_release_decisions_recorded_by_idx
  on public.protected_release_decisions(recorded_by);

alter table public.protected_release_decisions enable row level security;
revoke all on public.protected_release_decisions from public, anon, authenticated;
grant select on public.protected_release_decisions to authenticated;

drop policy if exists protected_release_decisions_member_select
  on public.protected_release_decisions;
create policy protected_release_decisions_member_select
on public.protected_release_decisions
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
      'protected-release-decision-recorded'
    )
  );

create or replace function private.record_protected_release_decision(
  p_workspace_slug text,
  p_decision_input jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  normalized_input jsonb := coalesce(p_decision_input, '{}'::jsonb);
  release_audience_value text;
  claim_category_value text;
  claim_version_value text;
  claim_text_value text;
  distribution_channel_value text;
  evidence_ids uuid[] := '{}'::uuid[];
  attestation_value text;
  data_boundary_value text;
  review_note_value text;
  actor_role text;
  required_domains text[] := array[
    'finance-methodology-policy',
    'counsel-external-use-review',
    'executive-release-review',
    'privacy-security-review',
    'clinical-governance-boundary-review',
    'marketing-claims-review',
    'buyer-permission-review'
  ];
  linked_domains text[] := '{}'::text[];
  missing_domains text[] := '{}'::text[];
  retained_blockers_value text[];
  release_restrictions_value text[];
  decision_status_value text;
  evidence_record_count integer := 0;
  evidence_snapshot_value jsonb;
  created_decision_id uuid;
  protected_boundary text :=
    'Protected Release Decision Workflow records bounded no-PHI release-review readiness decisions for versioned claim registry entries. It does not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, signed BAAs/DPAs, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, advertising claim substantiation, clinical validation, compliance certification, customer permission artifacts, public release approval, production authorization, or live clinical execution approval.';
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
    raise exception 'protected-release-decision-invalid-payload';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(normalized_input) as supplied(key)
    where supplied.key <> all(array[
      'releaseAudience',
      'claimCategory',
      'claimVersion',
      'claimText',
      'distributionChannel',
      'externalApprovalEvidenceRecordIds',
      'attestation',
      'dataBoundary',
      'reviewNote'
    ])
  ) then
    raise exception 'protected-release-decision-unsupported-field';
  end if;

  release_audience_value := trim(coalesce(normalized_input ->> 'releaseAudience', ''));
  claim_category_value := trim(coalesce(normalized_input ->> 'claimCategory', ''));
  claim_version_value := left(trim(coalesce(normalized_input ->> 'claimVersion', '')), 41);
  claim_text_value := left(trim(coalesce(normalized_input ->> 'claimText', '')), 221);
  distribution_channel_value := left(trim(coalesce(normalized_input ->> 'distributionChannel', '')), 121);
  attestation_value := trim(coalesce(normalized_input ->> 'attestation', ''));
  data_boundary_value := trim(coalesce(normalized_input ->> 'dataBoundary', ''));
  review_note_value := left(trim(coalesce(normalized_input ->> 'reviewNote', '')), 281);

  if jsonb_typeof(coalesce(normalized_input -> 'externalApprovalEvidenceRecordIds', '[]'::jsonb)) <> 'array' then
    raise exception 'protected-release-decision-invalid-evidence-array';
  end if;

  begin
    select coalesce(array_agg(distinct evidence_id.value::uuid), '{}'::uuid[])
    into evidence_ids
    from jsonb_array_elements_text(
      coalesce(normalized_input -> 'externalApprovalEvidenceRecordIds', '[]'::jsonb)
    ) as evidence_id(value);
  exception when others then
    raise exception 'protected-release-decision-invalid-typed-field';
  end;

  if release_audience_value not in (
      'internal-board',
      'buyer-diligence',
      'investor-data-room',
      'public-relations',
      'marketing-site',
      'sales-collateral',
      'customer-case-study'
    )
    or claim_category_value not in (
      'workflow-efficiency',
      'governance',
      'security-privacy',
      'interoperability',
      'financial-operating',
      'clinical-boundary',
      'customer-proof'
    )
    or claim_version_value !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{1,39}$'
    or claim_text_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{11,219}$'
    or distribution_channel_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{2,119}$'
    or cardinality(evidence_ids) > 7
    or attestation_value <> 'release-decision-claim-registry-no-phi'
    or data_boundary_value <> 'synthetic-business-workflow-only'
    or char_length(review_note_value) > 280 then
    raise exception 'protected-release-decision-validation-failed';
  end if;

  if release_audience_value || ' ' || claim_category_value || ' ' || claim_version_value || ' ' || claim_text_value || ' ' || distribution_channel_value || ' ' || review_note_value ~*
    '(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|sk-[A-Za-z0-9_-]{12,}|sbp_[A-Za-z0-9_-]{12,}|bearer[[:space:]]+[A-Za-z0-9._-]+|token|secret|password|api[ _-]?key|access[ _-]?key|https?:\/\/\S*[?=]\S*|patient[ _-]?(id|identifier|mrn)|member[ _-]?(id|identifier)|medical record|protected health information|payer member|diagnosis code|social security|source contract|signed[ _-]?(baa|dpa|contract|agreement)|legal opinion|audited financial|investment recommendation|securities offering|valuation guarantee|revenue guarantee|reimbursement guarantee|guaranteed savings|guaranteed outcome|advertising substantiation|clinical validation|compliance certification|fda[ _-]?cleared|hipaa[ _-]?(compliant|certified)|soc[ _-]?2[ _-]?certified|autonomous diagnosis|treatment recommendation|live clinical execution|public release approved)' then
    raise exception 'protected-release-decision-prohibited-content';
  end if;

  select membership.role
  into actor_role
  from public.pilot_memberships membership
  where membership.tenant_id = selected_workspace.tenant_id
    and membership.user_id = (select auth.uid())
    and membership.role in ('tenant-admin', 'pilot-lead', 'reviewer')
  limit 1;

  if actor_role is null then
    raise exception 'protected-release-decision-role-denied';
  end if;

  if cardinality(evidence_ids) > 0 then
    select count(*)
    into evidence_record_count
    from public.protected_external_approval_evidence_references reference
    where reference.id = any(evidence_ids)
      and reference.workspace_id = selected_workspace.id
      and reference.tenant_id = selected_workspace.tenant_id;

    if evidence_record_count <> cardinality(evidence_ids) then
      raise exception 'protected-release-decision-evidence-not-found';
    end if;

    select coalesce(array_agg(distinct reference.domain_id order by reference.domain_id), '{}'::text[])
    into linked_domains
    from public.protected_external_approval_evidence_references reference
    where reference.id = any(evidence_ids)
      and reference.workspace_id = selected_workspace.id
      and reference.tenant_id = selected_workspace.tenant_id;
  end if;

  select coalesce(array_agg(required.domain_id order by required.domain_id), '{}'::text[])
  into missing_domains
  from unnest(required_domains) as required(domain_id)
  where not required.domain_id = any(linked_domains);

  decision_status_value := case
    when cardinality(missing_domains) = 0 then
      'ready-for-qualified-release-review-not-release-authority'
    when cardinality(evidence_ids) > 0 then
      'external-evidence-linked'
    else
      'claim-registry-versioned'
  end;

  retained_blockers_value := array[
    'Missing approval domains: ' || coalesce(nullif(array_to_string(missing_domains, ', '), ''), 'none'),
    'Ready-for-qualified-release-review is not public release approval.',
    'Exact claim wording still requires qualified external reviewer approval outside SCRIMED.',
    'This decision does not create legal, financial, securities, advertising, customer, compliance, production, reimbursement, clinical validation, or live clinical execution authority.'
  ];

  release_restrictions_value := array[
    'No public distribution until qualified approval artifacts are complete and externally retained.',
    'No PHI, source documents, signed BAAs/DPAs, credentials, legal opinions, audited financial statements, securities materials, advertising substantiation, customer permission artifacts, clinical validation, or production authorization may be stored here.',
    'Customer-specific proof, logos, case studies, benchmarks, or deployment facts require written buyer permission retained outside SCRIMED.',
    'Clinical, reimbursement, security-certification, and ROI claims require approved validation and counsel-reviewed language before external use.'
  ];

  evidence_snapshot_value := jsonb_build_object(
    'releaseAudience', release_audience_value,
    'claimCategory', claim_category_value,
    'claimVersion', claim_version_value,
    'claimText', claim_text_value,
    'decisionStatus', decision_status_value,
    'approvalScope', 'release-review-readiness-only',
    'distributionChannel', distribution_channel_value,
    'externalApprovalEvidenceRecordIds', evidence_ids,
    'requiredApprovalDomains', required_domains,
    'linkedApprovalDomains', linked_domains,
    'missingApprovalDomains', missing_domains,
    'claimRegistryAuthority', 'versioned-claim-registry-not-claim-approval',
    'releaseDecisionAuthority', 'qualified-release-review-not-public-release',
    'distributionAuthority', 'distribution-blocked-until-qualified-release-approval',
    'financialReportingAuthority', 'not-audited-financial-report',
    'securitiesAuthority', 'not-securities-offering-material',
    'advertisingClaimsAuthority', 'not-advertising-claim-substantiation',
    'clinicalExecutionAuthority', 'not-authorized-live-care',
    'assuranceLevel', 'aal2',
    'syntheticOnly', true,
    'metadataOnly', true,
    'noPhi', true
  );

  insert into public.protected_release_decisions (
    tenant_id,
    workspace_id,
    release_audience,
    claim_category,
    claim_version,
    claim_text,
    decision_status,
    approval_scope,
    distribution_channel,
    external_approval_evidence_record_ids,
    evidence_snapshot,
    required_approval_domains,
    linked_approval_domains,
    missing_approval_domains,
    retained_blockers,
    release_restrictions,
    attestation,
    review_note,
    data_boundary,
    claim_registry_authority,
    release_decision_authority,
    distribution_authority,
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
    release_audience_value,
    claim_category_value,
    claim_version_value,
    claim_text_value,
    decision_status_value,
    'release-review-readiness-only',
    distribution_channel_value,
    evidence_ids,
    evidence_snapshot_value,
    required_domains,
    linked_domains,
    missing_domains,
    retained_blockers_value,
    release_restrictions_value,
    attestation_value,
    review_note_value,
    data_boundary_value,
    'versioned-claim-registry-not-claim-approval',
    'qualified-release-review-not-public-release',
    'distribution-blocked-until-qualified-release-approval',
    'not-audited-financial-report',
    'not-securities-offering-material',
    'not-advertising-claim-substantiation',
    'not-authorized-live-care',
    (select auth.uid()),
    protected_boundary
  )
  returning id into created_decision_id;

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
    'protected-release-decision-recorded',
    jsonb_build_object(
      'decisionId', created_decision_id,
      'releaseAudience', release_audience_value,
      'claimCategory', claim_category_value,
      'claimVersion', claim_version_value,
      'decisionStatus', decision_status_value,
      'distributionChannel', distribution_channel_value,
      'requiredApprovalDomains', required_domains,
      'linkedApprovalDomains', linked_domains,
      'missingApprovalDomains', missing_domains,
      'actorRole', actor_role,
      'approvalScope', 'release-review-readiness-only',
      'assuranceLevel', 'aal2',
      'syntheticOnly', true,
      'metadataOnly', true,
      'noPhi', true,
      'claimRegistryAuthority', 'versioned-claim-registry-not-claim-approval',
      'releaseDecisionAuthority', 'qualified-release-review-not-public-release',
      'distributionAuthority', 'distribution-blocked-until-qualified-release-approval',
      'financialReportingAuthority', 'not-audited-financial-report',
      'securitiesAuthority', 'not-securities-offering-material',
      'advertisingClaimsAuthority', 'not-advertising-claim-substantiation',
      'clinicalExecutionAuthority', 'not-authorized-live-care'
    )
  );

  return created_decision_id;
end;
$$;

create or replace function public.record_protected_release_decision(
  p_workspace_slug text,
  p_decision_input jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_protected_release_decision(
    p_workspace_slug,
    p_decision_input
  );
$$;

revoke all on function private.record_protected_release_decision(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.record_protected_release_decision(text, jsonb)
  from public, anon, authenticated, service_role;

grant execute on function private.record_protected_release_decision(text, jsonb)
  to authenticated;
grant execute on function public.record_protected_release_decision(text, jsonb)
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
    'schemaVersion', '2026-06-20.2',
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
    'protectedReleaseDecisionPackets', 'aal2-audited-release-decision-claim-registry-packets-no-phi'
  );
$$;

comment on table public.protected_release_decisions is
  'Tenant-scoped no-PHI versioned claim registry release decisions for qualified release-review readiness. RLS select requires authenticated AAL2 governance context and tenant membership. Writes require guarded RPC. This table does not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, signed BAAs/DPAs, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, advertising claim substantiation, clinical validation, compliance certification, customer permission artifacts, public release approval, production authorization, or live clinical execution approval.';
comment on function private.record_protected_release_decision(text, jsonb) is
  'Records a bounded no-PHI versioned claim registry release decision after AAL2 governance authorization and appends an audit event. Ready-for-qualified-release-review is not legal approval, audited financial reporting, advertising substantiation, customer permission, compliance certification, production authorization, public release approval, or live clinical execution authority.';
