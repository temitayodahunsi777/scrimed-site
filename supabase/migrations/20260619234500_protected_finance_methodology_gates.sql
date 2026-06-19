create table if not exists public.protected_finance_methodology_gates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  board_scorecard_id uuid references public.protected_board_scorecards(id) on delete restrict,
  gate_id text not null check (
    gate_id in (
      'finance-cost-allocation',
      'counsel-external-use',
      'executive-release',
      'privacy-security-review',
      'clinical-governance-boundary',
      'marketing-claims-substantiation',
      'buyer-permission'
    )
  ),
  gate_label text not null check (char_length(gate_label) between 3 and 140),
  gate_status text not null check (
    gate_status in (
      'readiness-attested-no-phi',
      'external-review-required-acknowledged',
      'customer-specific-required-acknowledged',
      'blocked-before-external-use-acknowledged'
    )
  ),
  approval_scope text not null default 'internal-board-readiness-only'
    check (approval_scope = 'internal-board-readiness-only'),
  reviewer_role text not null check (char_length(reviewer_role) between 3 and 140),
  evidence_snapshot jsonb not null default '{}'::jsonb
    check (jsonb_typeof(evidence_snapshot) = 'object' and pg_column_size(evidence_snapshot) <= 8192),
  retained_blockers text[] not null default '{}'::text[]
    check (cardinality(retained_blockers) between 1 and 16),
  methodology_components text[] not null default '{}'::text[]
    check (cardinality(methodology_components) between 1 and 16),
  external_use_restrictions text[] not null default '{}'::text[]
    check (cardinality(external_use_restrictions) between 1 and 16),
  attestation text not null check (
    attestation = 'finance-external-use-gates-no-phi-readiness'
  ),
  review_note text not null default '' check (char_length(review_note) <= 280),
  data_boundary text not null check (data_boundary = 'synthetic-business-workflow-only'),
  methodology_authority text not null default 'not-audited-financial-methodology'
    check (methodology_authority = 'not-audited-financial-methodology'),
  external_use_authority text not null default 'external-use-blocked-until-qualified-approval'
    check (external_use_authority = 'external-use-blocked-until-qualified-approval'),
  financial_reporting_authority text not null default 'not-audited-financial-report'
    check (financial_reporting_authority = 'not-audited-financial-report'),
  securities_authority text not null default 'not-securities-offering-material'
    check (securities_authority = 'not-securities-offering-material'),
  advertising_claims_authority text not null default 'not-advertising-claim-substantiation'
    check (advertising_claims_authority = 'not-advertising-claim-substantiation'),
  clinical_execution_authority text not null default 'not-authorized-live-care'
    check (clinical_execution_authority = 'not-authorized-live-care'),
  signed_by uuid not null references auth.users(id) on delete restrict,
  signed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  boundary text not null default
    'Protected Finance Methodology Gates record no-PHI internal readiness attestations for cost-allocation and external-use controls. They do not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, legal advice, valuation assurance, revenue guarantee, reimbursement assurance, clinical validation, compliance certification, advertising claim substantiation, production authorization, or live clinical execution approval.'
);

create index if not exists protected_finance_methodology_gates_tenant_signed_at_idx
  on public.protected_finance_methodology_gates(tenant_id, signed_at desc);
create index if not exists protected_finance_methodology_gates_workspace_signed_at_idx
  on public.protected_finance_methodology_gates(workspace_id, signed_at desc);
create index if not exists protected_finance_methodology_gates_gate_idx
  on public.protected_finance_methodology_gates(workspace_id, gate_id, signed_at desc);
create index if not exists protected_finance_methodology_gates_scorecard_idx
  on public.protected_finance_methodology_gates(board_scorecard_id);
create index if not exists protected_finance_methodology_gates_signed_by_idx
  on public.protected_finance_methodology_gates(signed_by);

alter table public.protected_finance_methodology_gates enable row level security;
revoke all on public.protected_finance_methodology_gates from public, anon, authenticated;
grant select on public.protected_finance_methodology_gates to authenticated;

drop policy if exists protected_finance_methodology_gates_member_select
  on public.protected_finance_methodology_gates;
create policy protected_finance_methodology_gates_member_select
on public.protected_finance_methodology_gates
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
      'protected-finance-methodology-gate-recorded'
    )
  );

create or replace function private.record_protected_finance_methodology_gate(
  p_workspace_slug text,
  p_gate_input jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_scorecard public.protected_board_scorecards%rowtype;
  normalized_input jsonb := coalesce(p_gate_input, '{}'::jsonb);
  gate_id_value text;
  board_scorecard_id_text text;
  board_scorecard_id_value uuid;
  attestation_value text;
  data_boundary_value text;
  review_note_value text;
  actor_role text;
  gate_label_value text;
  gate_status_value text;
  reviewer_role_value text;
  retained_blockers_value text[];
  methodology_components_value text[];
  external_use_restrictions_value text[];
  evidence_snapshot_value jsonb;
  created_gate_id uuid;
  protected_boundary text :=
    'Protected Finance Methodology Gates record no-PHI internal readiness attestations for cost-allocation and external-use controls. They do not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, legal advice, valuation assurance, revenue guarantee, reimbursement assurance, clinical validation, compliance certification, advertising claim substantiation, production authorization, or live clinical execution approval.';
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
    raise exception 'protected-finance-methodology-invalid-payload';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(normalized_input) as supplied(key)
    where supplied.key <> all(array[
      'gateId',
      'boardScorecardId',
      'attestation',
      'dataBoundary',
      'reviewNote'
    ])
  ) then
    raise exception 'protected-finance-methodology-unsupported-field';
  end if;

  gate_id_value := trim(coalesce(normalized_input ->> 'gateId', ''));
  board_scorecard_id_text := nullif(trim(coalesce(normalized_input ->> 'boardScorecardId', '')), '');
  attestation_value := trim(coalesce(normalized_input ->> 'attestation', ''));
  data_boundary_value := trim(coalesce(normalized_input ->> 'dataBoundary', ''));
  review_note_value := left(trim(coalesce(normalized_input ->> 'reviewNote', '')), 281);

  begin
    if board_scorecard_id_text is not null then
      board_scorecard_id_value := board_scorecard_id_text::uuid;
    end if;
  exception when others then
    raise exception 'protected-finance-methodology-invalid-typed-field';
  end;

  if gate_id_value not in (
      'finance-cost-allocation',
      'counsel-external-use',
      'executive-release',
      'privacy-security-review',
      'clinical-governance-boundary',
      'marketing-claims-substantiation',
      'buyer-permission'
    )
    or attestation_value <> 'finance-external-use-gates-no-phi-readiness'
    or data_boundary_value <> 'synthetic-business-workflow-only'
    or char_length(review_note_value) > 280 then
    raise exception 'protected-finance-methodology-validation-failed';
  end if;

  if review_note_value || ' ' || coalesce(board_scorecard_id_text, '') ~*
    '(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|sk-[A-Za-z0-9_-]{12,}|sbp_[A-Za-z0-9_-]{12,}|bearer[[:space:]]+[A-Za-z0-9._-]+|patient[ _-]?(id|identifier|mrn)|member[ _-]?(id|identifier)|medical record|protected health information|payer member|diagnosis code|social security|audited financial|investment recommendation|securities offering|valuation guarantee|revenue guarantee|reimbursement guarantee|advertising substantiation|clinical validation|compliance certification)' then
    raise exception 'protected-finance-methodology-prohibited-content';
  end if;

  if board_scorecard_id_value is not null then
    select *
    into selected_scorecard
    from public.protected_board_scorecards scorecard
    where scorecard.id = board_scorecard_id_value
      and scorecard.workspace_id = selected_workspace.id
      and scorecard.tenant_id = selected_workspace.tenant_id;

    if selected_scorecard.id is null then
      raise exception 'protected-finance-methodology-scorecard-not-found';
    end if;
  end if;

  select membership.role
  into actor_role
  from public.pilot_memberships membership
  where membership.tenant_id = selected_workspace.tenant_id
    and membership.user_id = (select auth.uid())
    and membership.role in ('tenant-admin', 'pilot-lead', 'reviewer')
  limit 1;

  if actor_role is null then
    raise exception 'protected-finance-methodology-role-denied';
  end if;

  gate_label_value := case gate_id_value
    when 'finance-cost-allocation' then 'Finance cost-allocation methodology'
    when 'counsel-external-use' then 'Counsel external-use review'
    when 'executive-release' then 'Executive release authority'
    when 'privacy-security-review' then 'Privacy and security review'
    when 'clinical-governance-boundary' then 'Clinical governance boundary'
    when 'marketing-claims-substantiation' then 'Marketing claims substantiation'
    when 'buyer-permission' then 'Buyer permission and distribution control'
  end;

  gate_status_value := case gate_id_value
    when 'finance-cost-allocation' then 'readiness-attested-no-phi'
    when 'privacy-security-review' then 'customer-specific-required-acknowledged'
    when 'buyer-permission' then 'customer-specific-required-acknowledged'
    when 'clinical-governance-boundary' then 'blocked-before-external-use-acknowledged'
    else 'external-review-required-acknowledged'
  end;

  reviewer_role_value := case gate_id_value
    when 'finance-cost-allocation' then 'finance lead or founder acting as finance owner'
    when 'counsel-external-use' then 'qualified counsel'
    when 'executive-release' then 'founder or authorized executive'
    when 'privacy-security-review' then 'privacy/security owner'
    when 'clinical-governance-boundary' then 'clinical governance owner'
    when 'marketing-claims-substantiation' then 'communications, counsel, and product owner'
    when 'buyer-permission' then 'customer owner and executive sponsor'
  end;

  retained_blockers_value := case gate_id_value
    when 'finance-cost-allocation' then array[
      'Requires qualified finance/accounting review before audited reporting, margin reporting, external investor use, or customer value claims.',
      'Requires approved chart-of-accounts, revenue-recognition, cost allocation, and data-room policy before external release.'
    ]
    when 'counsel-external-use' then array[
      'Qualified counsel must review external-use context, disclaimers, audience, and distribution controls.',
      'No securities, investment, valuation, legal, or tax representation is created by this internal record.'
    ]
    when 'executive-release' then array[
      'External use remains blocked until finance, counsel, privacy, security, and customer-specific gates are satisfied.',
      'Executive release cannot override clinical, privacy, security, legal, or customer approval requirements.'
    ]
    when 'privacy-security-review' then array[
      'No PHI, member data, secrets, credentials, source contracts, or production records may be included.',
      'Customer-specific security, privacy, BAA/DPA, retention, and access-review controls remain required.'
    ]
    when 'clinical-governance-boundary' then array[
      'No autonomous diagnosis, treatment recommendation, patient outreach, payer submission, live clinical execution, or clinical outcome claim.',
      'Licensed clinical governance and customer go-live approval remain required for clinical production workflows.'
    ]
    when 'marketing-claims-substantiation' then array[
      'Claims require substantiation, approved wording, approved audience, and retained evidence before advertising or PR use.',
      'Do not use internal metrics as public performance, ROI, clinical, reimbursement, or compliance claims.'
    ]
    when 'buyer-permission' then array[
      'Customer references, logos, contract details, benchmarks, case studies, and deployment facts require explicit permission.',
      'Buyer-specific results require approved data rights, baseline methodology, review, and distribution controls.'
    ]
  end;

  methodology_components_value := case gate_id_value
    when 'finance-cost-allocation' then array['model cost', 'reviewer labor', 'implementation labor', 'infrastructure', 'support and success', 'delivery operations']
    when 'counsel-external-use' then array['external-use policy', 'claim registry', 'distribution control']
    when 'executive-release' then array['release owner', 'release reason', 'release audience']
    when 'privacy-security-review' then array['data minimization', 'retention control', 'access review']
    when 'clinical-governance-boundary' then array['clinical claim boundary', 'human review', 'go-live blocker']
    when 'marketing-claims-substantiation' then array['claim register', 'evidence mapping', 'approved wording']
    when 'buyer-permission' then array['customer permission', 'reference controls', 'data rights']
  end;

  external_use_restrictions_value := case gate_id_value
    when 'finance-cost-allocation' then array['No audited financial reporting.', 'No valuation, margin, investment, accounting, tax, or securities claim.']
    when 'counsel-external-use' then array['No fundraising or securities material release.', 'No public advertising claim release.']
    when 'executive-release' then array['No uncontrolled forwarding.', 'No external buyer, investor, PR, or advertising use without completed gate stack.']
    when 'privacy-security-review' then array['No sensitive buyer document storage.', 'No PHI-enabled telemetry or customer data export.']
    when 'clinical-governance-boundary' then array['No clinical validation claim.', 'No live-care authorization or patient-outcome claim.']
    when 'marketing-claims-substantiation' then array['No advertising claim substantiation.', 'No public ROI, outcome, reimbursement, or certification claim.']
    when 'buyer-permission' then array['No customer logo or named reference.', 'No customer-specific benchmark or case study without written permission.']
  end;

  evidence_snapshot_value := jsonb_build_object(
    'gateId', gate_id_value,
    'gateLabel', gate_label_value,
    'boardScorecardId', board_scorecard_id_value,
    'boardPeriodLabel', selected_scorecard.board_period_label,
    'boardScorecardState', coalesce(selected_scorecard.scorecard_state, 'pending'),
    'allocationProfileStatus', coalesce(selected_scorecard.allocation_profile_status, 'finance-allocation-profile-pending'),
    'methodologyComponents', to_jsonb(methodology_components_value),
    'retainedBlockers', to_jsonb(retained_blockers_value),
    'externalUseRestrictions', to_jsonb(external_use_restrictions_value),
    'methodologyAuthority', 'not-audited-financial-methodology',
    'externalUseAuthority', 'external-use-blocked-until-qualified-approval',
    'financialReportingAuthority', 'not-audited-financial-report',
    'securitiesAuthority', 'not-securities-offering-material',
    'advertisingClaimsAuthority', 'not-advertising-claim-substantiation',
    'clinicalExecutionAuthority', 'not-authorized-live-care',
    'assuranceLevel', 'aal2',
    'syntheticOnly', true,
    'metadataOnly', true,
    'noPhi', true
  );

  insert into public.protected_finance_methodology_gates (
    tenant_id,
    workspace_id,
    board_scorecard_id,
    gate_id,
    gate_label,
    gate_status,
    approval_scope,
    reviewer_role,
    evidence_snapshot,
    retained_blockers,
    methodology_components,
    external_use_restrictions,
    attestation,
    review_note,
    data_boundary,
    methodology_authority,
    external_use_authority,
    financial_reporting_authority,
    securities_authority,
    advertising_claims_authority,
    clinical_execution_authority,
    signed_by,
    boundary
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    board_scorecard_id_value,
    gate_id_value,
    gate_label_value,
    gate_status_value,
    'internal-board-readiness-only',
    reviewer_role_value,
    evidence_snapshot_value,
    retained_blockers_value,
    methodology_components_value,
    external_use_restrictions_value,
    attestation_value,
    review_note_value,
    data_boundary_value,
    'not-audited-financial-methodology',
    'external-use-blocked-until-qualified-approval',
    'not-audited-financial-report',
    'not-securities-offering-material',
    'not-advertising-claim-substantiation',
    'not-authorized-live-care',
    (select auth.uid()),
    protected_boundary
  )
  returning id into created_gate_id;

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
    'protected-finance-methodology-gate-recorded',
    jsonb_build_object(
      'gateRecordId', created_gate_id,
      'gateId', gate_id_value,
      'gateStatus', gate_status_value,
      'actorRole', actor_role,
      'boardScorecardId', board_scorecard_id_value,
      'approvalScope', 'internal-board-readiness-only',
      'assuranceLevel', 'aal2',
      'syntheticOnly', true,
      'metadataOnly', true,
      'noPhi', true,
      'methodologyAuthority', 'not-audited-financial-methodology',
      'externalUseAuthority', 'external-use-blocked-until-qualified-approval',
      'financialReportingAuthority', 'not-audited-financial-report',
      'securitiesAuthority', 'not-securities-offering-material',
      'advertisingClaimsAuthority', 'not-advertising-claim-substantiation',
      'clinicalExecutionAuthority', 'not-authorized-live-care'
    )
  );

  return created_gate_id;
end;
$$;

create or replace function public.record_protected_finance_methodology_gate(
  p_workspace_slug text,
  p_gate_input jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_protected_finance_methodology_gate(
    p_workspace_slug,
    p_gate_input
  );
$$;

revoke all on function private.record_protected_finance_methodology_gate(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.record_protected_finance_methodology_gate(text, jsonb)
  from public, anon, authenticated, service_role;

grant execute on function private.record_protected_finance_methodology_gate(text, jsonb)
  to authenticated;
grant execute on function public.record_protected_finance_methodology_gate(text, jsonb)
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
    'schemaVersion', '2026-06-19.6',
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
    'protectedFinanceMethodologyPackets', 'aal2-audited-finance-methodology-gate-packets-no-phi'
  );
$$;

comment on table public.protected_finance_methodology_gates is
  'Tenant-scoped no-PHI protected finance methodology gate records for internal cost-allocation readiness, external-use blockers, counsel review, executive release, privacy/security, clinical-governance boundary, marketing claims, and buyer permission. RLS select requires authenticated AAL2 governance context and tenant membership. Writes require guarded RPC. No PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, legal advice, valuation assurance, revenue guarantee, reimbursement assurance, clinical validation, compliance certification, advertising claim substantiation, production authorization, or live clinical execution approval is permitted.';
comment on function private.record_protected_finance_methodology_gate(text, jsonb) is
  'Records a no-PHI protected finance methodology gate after AAL2 governance authorization and appends a protected finance methodology audit event. This is internal readiness only and does not create audited finance, legal, securities, advertising, clinical, reimbursement, compliance, or production authority.';
