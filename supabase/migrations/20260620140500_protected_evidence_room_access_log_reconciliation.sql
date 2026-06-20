create table if not exists public.protected_evidence_room_access_log_reconciliations (
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
  reconciliation_scope text not null check (
    reconciliation_scope in (
      'pre-release-access-log-review',
      'post-recipient-window-review',
      'revocation-exercise-review',
      'anomaly-escalation-review',
      'buyer-diligence-room-review',
      'investor-diligence-room-review'
    )
  ),
  reconciliation_scope_label text not null check (
    char_length(reconciliation_scope_label) between 3 and 100
    and reconciliation_scope_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{2,99}$'
  ),
  reconciliation_status text not null check (
    reconciliation_status in (
      'access-log-reconciliation-metadata-recorded',
      'recipient-attestation-linked',
      'access-log-reconciliation-complete-not-export-approval',
      'blocked'
    )
  ),
  approval_scope text not null default 'evidence-room-access-log-reconciliation-review-readiness-only'
    check (approval_scope = 'evidence-room-access-log-reconciliation-review-readiness-only'),
  external_log_system_label text not null check (
    char_length(external_log_system_label) between 4 and 140
    and external_log_system_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  access_log_reference_label text not null check (
    char_length(access_log_reference_label) between 4 and 140
    and access_log_reference_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  access_log_reference_locator text not null check (
    char_length(access_log_reference_locator) between 4 and 140
    and access_log_reference_locator ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  reconciliation_window_start timestamptz not null,
  reconciliation_window_end timestamptz not null,
  observed_access_event_count integer not null check (observed_access_event_count between 0 and 1000000),
  expected_recipient_segment_count integer not null check (expected_recipient_segment_count between 1 and 1000),
  anomaly_state text not null check (
    anomaly_state in ('none-observed', 'needs-review', 'revocation-triggered', 'log-unavailable')
  ),
  revocation_exercise_state text not null check (
    revocation_exercise_state in ('not-issued', 'not-required', 'ready', 'exercised')
  ),
  anomaly_escalation_path text not null check (
    char_length(anomaly_escalation_path) between 8 and 180
    and anomaly_escalation_path ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{7,179}$'
  ),
  recipient_attestation_record_ids uuid[] not null
    check (cardinality(recipient_attestation_record_ids) between 1 and 14),
  evidence_snapshot jsonb not null default '{}'::jsonb
    check (jsonb_typeof(evidence_snapshot) = 'object' and pg_column_size(evidence_snapshot) <= 8192),
  required_access_log_controls text[] not null
    check (cardinality(required_access_log_controls) = 7),
  linked_access_log_controls text[] not null default '{}'::text[]
    check (cardinality(linked_access_log_controls) between 0 and 7),
  missing_access_log_controls text[] not null default '{}'::text[]
    check (cardinality(missing_access_log_controls) between 0 and 7),
  retained_blockers text[] not null default '{}'::text[]
    check (cardinality(retained_blockers) between 1 and 18),
  release_restrictions text[] not null default '{}'::text[]
    check (cardinality(release_restrictions) between 1 and 18),
  external_log_authority_retained boolean not null default true
    check (external_log_authority_retained is true),
  export_disabled boolean not null default true
    check (export_disabled is true),
  attestation text not null check (
    attestation = 'evidence-room-access-log-reconciliation-metadata-no-phi'
  ),
  review_note text not null default '' check (char_length(review_note) <= 280),
  data_boundary text not null check (data_boundary = 'synthetic-business-workflow-only'),
  access_log_reconciliation_authority text not null default 'access-log-reconciliation-metadata-not-export-approval'
    check (access_log_reconciliation_authority = 'access-log-reconciliation-metadata-not-export-approval'),
  release_authority text not null default 'export-disabled-pending-external-access-log-reconciliation'
    check (release_authority = 'export-disabled-pending-external-access-log-reconciliation'),
  storage_authority text not null default 'access-log-metadata-only-no-recipient-identifiers-or-sensitive-artifacts'
    check (storage_authority = 'access-log-metadata-only-no-recipient-identifiers-or-sensitive-artifacts'),
  recipient_attestation_authority text not null default 'recipient-attestation-metadata-not-release-approval'
    check (recipient_attestation_authority = 'recipient-attestation-metadata-not-release-approval'),
  recipient_release_authority text not null default 'release-disabled-pending-external-recipient-authority'
    check (recipient_release_authority = 'release-disabled-pending-external-recipient-authority'),
  recipient_storage_authority text not null default 'recipient-metadata-only-no-recipient-lists-or-sensitive-artifacts'
    check (recipient_storage_authority = 'recipient-metadata-only-no-recipient-lists-or-sensitive-artifacts'),
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
    'Protected Evidence Room Access Log Reconciliation records disabled-by-default no-PHI metadata for externally retained evidence-room access-log references, reconciliation windows, event-count summaries, anomaly posture, and revocation review. It does not store PHI, patient identifiers, payer member data, live clinical records, source documents, source contracts, secrets, credentials, URLs, access tokens, access logs, raw log rows, IP addresses, device identifiers, recipient names, recipient email addresses, exact recipient lists, signed approvals, signed BAAs/DPAs, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, advertising claim substantiation, clinical validation, compliance certification, customer permission artifacts, public release approval, external distribution approval, production authorization, or live clinical execution approval.'
);

create index if not exists protected_evidence_room_access_log_reconciliations_tenant_recorded_at_idx
  on public.protected_evidence_room_access_log_reconciliations(tenant_id, recorded_at desc);
create index if not exists protected_evidence_room_access_log_reconciliations_workspace_recorded_at_idx
  on public.protected_evidence_room_access_log_reconciliations(workspace_id, recorded_at desc);
create index if not exists protected_evidence_room_access_log_reconciliations_scope_idx
  on public.protected_evidence_room_access_log_reconciliations(workspace_id, reconciliation_scope, recorded_at desc);
create index if not exists protected_evidence_room_access_log_reconciliations_status_idx
  on public.protected_evidence_room_access_log_reconciliations(workspace_id, reconciliation_status, recorded_at desc);
create index if not exists protected_evidence_room_access_log_reconciliations_recorded_by_idx
  on public.protected_evidence_room_access_log_reconciliations(recorded_by);

alter table public.protected_evidence_room_access_log_reconciliations enable row level security;
revoke all on public.protected_evidence_room_access_log_reconciliations from public, anon, authenticated;
grant select on public.protected_evidence_room_access_log_reconciliations to authenticated;

drop policy if exists protected_evidence_room_access_log_reconciliations_member_select
  on public.protected_evidence_room_access_log_reconciliations;
create policy protected_evidence_room_access_log_reconciliations_member_select
on public.protected_evidence_room_access_log_reconciliations
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
      'protected-evidence-room-access-log-reconciliation-recorded'
    )
  );

create or replace function private.record_protected_evidence_room_access_log_reconciliation(
  p_workspace_slug text,
  p_reconciliation_input jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  normalized_input jsonb := coalesce(p_reconciliation_input, '{}'::jsonb);
  recipient_record_ids_value uuid[] := '{}'::uuid[];
  recipient_count_value integer := 0;
  supplied_recipient_count_value integer := 0;
  distribution_audience_value text;
  reconciliation_scope_value text;
  reconciliation_scope_label_value text;
  external_log_system_label_value text;
  access_log_reference_label_value text;
  access_log_reference_locator_value text;
  reconciliation_window_start_value timestamptz;
  reconciliation_window_end_value timestamptz;
  observed_access_event_count_value integer;
  expected_recipient_segment_count_value integer;
  anomaly_state_value text;
  revocation_exercise_state_value text;
  anomaly_escalation_path_value text;
  attestation_value text;
  data_boundary_value text;
  review_note_value text;
  actor_role text;
  required_controls text[] := array[
    'external-log-reference-retained',
    'recipient-attestation-linked',
    'access-window-reconciled',
    'revocation-events-reviewed',
    'no-recipient-identifiers-stored',
    'anomaly-escalation-defined',
    'export-disabled'
  ];
  linked_controls text[] := array[
    'recipient-attestation-linked',
    'access-window-reconciled',
    'no-recipient-identifiers-stored',
    'export-disabled'
  ];
  missing_controls text[] := '{}'::text[];
  retained_blockers_value text[];
  release_restrictions_value text[];
  reconciliation_status_value text;
  evidence_snapshot_value jsonb;
  created_reconciliation_id uuid;
  protected_boundary text :=
    'Protected Evidence Room Access Log Reconciliation records disabled-by-default no-PHI metadata for externally retained evidence-room access-log references, reconciliation windows, event-count summaries, anomaly posture, and revocation review. It does not store PHI, patient identifiers, payer member data, live clinical records, source documents, source contracts, secrets, credentials, URLs, access tokens, access logs, raw log rows, IP addresses, device identifiers, recipient names, recipient email addresses, exact recipient lists, signed approvals, signed BAAs/DPAs, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, advertising claim substantiation, clinical validation, compliance certification, customer permission artifacts, public release approval, external distribution approval, production authorization, or live clinical execution approval.';
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
    raise exception 'protected-evidence-room-access-log-reconciliation-invalid-payload';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(normalized_input) as supplied(key)
    where supplied.key <> all(array[
      'recipientAttestationRecordIds',
      'distributionAudience',
      'reconciliationScope',
      'externalLogSystemLabel',
      'accessLogReferenceLabel',
      'accessLogReferenceLocator',
      'reconciliationWindowStart',
      'reconciliationWindowEnd',
      'observedAccessEventCount',
      'expectedRecipientSegmentCount',
      'anomalyState',
      'revocationExerciseState',
      'anomalyEscalationPath',
      'externalLogAuthorityRetained',
      'exportDisabled',
      'attestation',
      'dataBoundary',
      'reviewNote'
    ])
  ) then
    raise exception 'protected-evidence-room-access-log-reconciliation-unsupported-field';
  end if;

  if jsonb_typeof(normalized_input -> 'recipientAttestationRecordIds') <> 'array' then
    raise exception 'protected-evidence-room-access-log-reconciliation-invalid-recipient-records';
  end if;

  begin
    select count(*)
    into supplied_recipient_count_value
    from jsonb_array_elements_text(normalized_input -> 'recipientAttestationRecordIds');

    select coalesce(array_agg(distinct ids.value::uuid order by ids.value::uuid), '{}'::uuid[])
    into recipient_record_ids_value
    from jsonb_array_elements_text(normalized_input -> 'recipientAttestationRecordIds') as ids(value);

    reconciliation_window_start_value := (normalized_input ->> 'reconciliationWindowStart')::timestamptz;
    reconciliation_window_end_value := (normalized_input ->> 'reconciliationWindowEnd')::timestamptz;
    observed_access_event_count_value := (normalized_input ->> 'observedAccessEventCount')::integer;
    expected_recipient_segment_count_value := (normalized_input ->> 'expectedRecipientSegmentCount')::integer;
  exception when others then
    raise exception 'protected-evidence-room-access-log-reconciliation-invalid-typed-field';
  end;

  distribution_audience_value := trim(coalesce(normalized_input ->> 'distributionAudience', ''));
  reconciliation_scope_value := trim(coalesce(normalized_input ->> 'reconciliationScope', ''));
  external_log_system_label_value := left(trim(coalesce(normalized_input ->> 'externalLogSystemLabel', '')), 141);
  access_log_reference_label_value := left(trim(coalesce(normalized_input ->> 'accessLogReferenceLabel', '')), 141);
  access_log_reference_locator_value := left(trim(coalesce(normalized_input ->> 'accessLogReferenceLocator', '')), 141);
  anomaly_state_value := trim(coalesce(normalized_input ->> 'anomalyState', ''));
  revocation_exercise_state_value := trim(coalesce(normalized_input ->> 'revocationExerciseState', ''));
  anomaly_escalation_path_value := left(trim(coalesce(normalized_input ->> 'anomalyEscalationPath', '')), 181);
  attestation_value := trim(coalesce(normalized_input ->> 'attestation', ''));
  data_boundary_value := trim(coalesce(normalized_input ->> 'dataBoundary', ''));
  review_note_value := left(trim(coalesce(normalized_input ->> 'reviewNote', '')), 281);

  reconciliation_scope_label_value := case reconciliation_scope_value
    when 'pre-release-access-log-review' then 'Pre-release access-log review'
    when 'post-recipient-window-review' then 'Post-recipient window review'
    when 'revocation-exercise-review' then 'Revocation exercise review'
    when 'anomaly-escalation-review' then 'Anomaly escalation review'
    when 'buyer-diligence-room-review' then 'Buyer diligence room review'
    when 'investor-diligence-room-review' then 'Investor diligence room review'
    else ''
  end;

  if cardinality(recipient_record_ids_value) < 1
    or cardinality(recipient_record_ids_value) > 14
    or cardinality(recipient_record_ids_value) <> supplied_recipient_count_value
    or distribution_audience_value not in (
      'buyer-diligence-room',
      'investor-data-room',
      'board-room',
      'sales-collateral-channel',
      'marketing-site-release',
      'public-relations-channel',
      'customer-case-study-channel'
    )
    or reconciliation_scope_label_value = ''
    or external_log_system_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or access_log_reference_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or access_log_reference_locator_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or reconciliation_window_start_value is null
    or reconciliation_window_end_value is null
    or reconciliation_window_start_value < now() - interval '365 days'
    or reconciliation_window_end_value <= reconciliation_window_start_value
    or reconciliation_window_end_value > now() + interval '1 day'
    or observed_access_event_count_value is null
    or observed_access_event_count_value < 0
    or observed_access_event_count_value > 1000000
    or expected_recipient_segment_count_value is null
    or expected_recipient_segment_count_value < 1
    or expected_recipient_segment_count_value > 1000
    or anomaly_state_value not in ('none-observed', 'needs-review', 'revocation-triggered', 'log-unavailable')
    or revocation_exercise_state_value not in ('not-issued', 'not-required', 'ready', 'exercised')
    or anomaly_escalation_path_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{7,179}$'
    or coalesce(normalized_input ->> 'externalLogAuthorityRetained', '') <> 'true'
    or coalesce(normalized_input ->> 'exportDisabled', '') <> 'true'
    or attestation_value <> 'evidence-room-access-log-reconciliation-metadata-no-phi'
    or data_boundary_value <> 'synthetic-business-workflow-only'
    or char_length(review_note_value) > 280 then
    raise exception 'protected-evidence-room-access-log-reconciliation-validation-failed';
  end if;

  if array_to_string(recipient_record_ids_value, ' ') || ' ' || distribution_audience_value || ' ' || reconciliation_scope_value || ' ' || external_log_system_label_value || ' ' || access_log_reference_label_value || ' ' || access_log_reference_locator_value || ' ' || anomaly_state_value || ' ' || revocation_exercise_state_value || ' ' || anomaly_escalation_path_value || ' ' || review_note_value ~*
    '(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|sk-[A-Za-z0-9_-]{12,}|sbp_[A-Za-z0-9_-]{12,}|bearer[[:space:]]+[A-Za-z0-9._-]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|token|secret|password|api[ _-]?key|access[ _-]?key|https?:\/\/|ip address|device[ _-]?id|raw[ _-]?log|log row|recipient[ _-]?name|recipient[ _-]?email|recipient[ _-]?list|contact[ _-]?list|patient[ _-]?(id|identifier|mrn)|member[ _-]?(id|identifier)|medical record|protected health information|payer member|diagnosis code|social security|source contract|signed[ _-]?(baa|dpa|contract|agreement|document|approval)|legal opinion|audited financial|investment recommendation|securities offering|valuation guarantee|revenue guarantee|reimbursement guarantee|guaranteed savings|guaranteed outcome|advertising substantiation|clinical validation|compliance certification|fda[ _-]?cleared|hipaa[ _-]?(compliant|certified)|soc[ _-]?2[ _-]?certified|autonomous diagnosis|treatment recommendation|live clinical execution|public release approved|external distribution approved|release approved|export approved|release enabled|export enabled)' then
    raise exception 'protected-evidence-room-access-log-reconciliation-prohibited-content';
  end if;

  select membership.role
  into actor_role
  from public.pilot_memberships membership
  where membership.tenant_id = selected_workspace.tenant_id
    and membership.user_id = (select auth.uid())
    and membership.role in ('tenant-admin', 'pilot-lead', 'reviewer')
  limit 1;

  if actor_role is null then
    raise exception 'protected-evidence-room-access-log-reconciliation-role-denied';
  end if;

  select count(*)
  into recipient_count_value
  from public.protected_evidence_room_recipient_attestations attestation
  where attestation.id = any(recipient_record_ids_value)
    and attestation.workspace_id = selected_workspace.id
    and attestation.tenant_id = selected_workspace.tenant_id
    and attestation.export_disabled is true
    and attestation.external_recipient_authority_retained is true
    and attestation.attestation_status = 'recipient-metadata-complete-not-export-approval'
    and cardinality(attestation.missing_recipient_controls) = 0;

  if recipient_count_value <> cardinality(recipient_record_ids_value) then
    raise exception 'protected-evidence-room-access-log-reconciliation-recipient-attestations-not-ready';
  end if;

  if coalesce(normalized_input ->> 'externalLogAuthorityRetained', '') = 'true' then
    linked_controls := linked_controls || array['external-log-reference-retained'];
  end if;

  if anomaly_state_value <> 'log-unavailable' then
    linked_controls := linked_controls || array['anomaly-escalation-defined'];
  end if;

  if anomaly_state_value <> 'log-unavailable'
    and revocation_exercise_state_value in ('not-required', 'ready', 'exercised') then
    linked_controls := linked_controls || array['revocation-events-reviewed'];
  end if;

  select coalesce(array_agg(distinct control order by control), '{}'::text[])
  into linked_controls
  from unnest(linked_controls) as control;

  select coalesce(array_agg(control order by control), '{}'::text[])
  into missing_controls
  from unnest(required_controls) as control
  where control <> all(linked_controls);

  reconciliation_status_value := case
    when anomaly_state_value = 'log-unavailable' then 'blocked'
    when cardinality(missing_controls) = 0 then 'access-log-reconciliation-complete-not-export-approval'
    when recipient_count_value > 0 then 'recipient-attestation-linked'
    else 'access-log-reconciliation-metadata-recorded'
  end;

  retained_blockers_value := array[
    'Export disabled: true',
    'Raw access logs, recipient identifiers, IP addresses, device identifiers, access grants, access revocation records, signatures, customer permissions, counsel reviews, legal opinions, and distribution artifacts must be retained outside SCRIMED.',
    'This metadata does not create legal, financial, securities, advertising, customer, compliance, production, reimbursement, clinical validation, public release, external distribution, or live clinical execution authority.'
  ];

  release_restrictions_value := array[
    'No evidence-room export, public release, customer proof use, investor distribution, sales collateral release, marketing publication, PR release, or case-study distribution can be enabled by this SCRIMED metadata layer.',
    'No PHI, source documents, raw access logs, recipient identifiers, IP addresses, device identifiers, recipient lists, recipient emails, signed approvals, customer permission artifacts, legal opinions, audited financial statements, securities materials, advertising substantiation, clinical validation, production authorization, or live-care records may be stored here.',
    'Unavailable external logs, unresolved anomaly review, missing revocation evidence, recipient segment changes, packet changes, evidence-room locator changes, expired access windows, changed revocation posture, missing recipient authority, expired customer permission, or absent counsel review must block external release.',
    'Access-log authority remains externally executed and independently reviewed outside SCRIMED.'
  ];

  evidence_snapshot_value := jsonb_build_object(
    'distributionAudience', distribution_audience_value,
    'reconciliationScope', reconciliation_scope_value,
    'reconciliationScopeLabel', reconciliation_scope_label_value,
    'reconciliationStatus', reconciliation_status_value,
    'approvalScope', 'evidence-room-access-log-reconciliation-review-readiness-only',
    'externalLogSystemLabel', external_log_system_label_value,
    'accessLogReferenceLabel', access_log_reference_label_value,
    'accessLogReferenceLocator', access_log_reference_locator_value,
    'reconciliationWindowStart', reconciliation_window_start_value,
    'reconciliationWindowEnd', reconciliation_window_end_value,
    'observedAccessEventCount', observed_access_event_count_value,
    'expectedRecipientSegmentCount', expected_recipient_segment_count_value,
    'anomalyState', anomaly_state_value,
    'revocationExerciseState', revocation_exercise_state_value,
    'anomalyEscalationPath', anomaly_escalation_path_value,
    'recipientAttestationRecordIds', recipient_record_ids_value,
    'requiredAccessLogControls', required_controls,
    'linkedAccessLogControls', linked_controls,
    'missingAccessLogControls', missing_controls,
    'externalLogAuthorityRetained', true,
    'exportDisabled', true,
    'accessLogReconciliationAuthority', 'access-log-reconciliation-metadata-not-export-approval',
    'releaseAuthority', 'export-disabled-pending-external-access-log-reconciliation',
    'storageAuthority', 'access-log-metadata-only-no-recipient-identifiers-or-sensitive-artifacts',
    'recipientAttestationAuthority', 'recipient-attestation-metadata-not-release-approval',
    'recipientReleaseAuthority', 'release-disabled-pending-external-recipient-authority',
    'recipientStorageAuthority', 'recipient-metadata-only-no-recipient-lists-or-sensitive-artifacts',
    'assuranceLevel', 'aal2',
    'syntheticOnly', true,
    'metadataOnly', true,
    'accessLogMetadataOnly', true,
    'rawLogStorageDisabled', true,
    'noPhi', true
  );

  insert into public.protected_evidence_room_access_log_reconciliations (
    tenant_id,
    workspace_id,
    distribution_audience,
    reconciliation_scope,
    reconciliation_scope_label,
    reconciliation_status,
    approval_scope,
    external_log_system_label,
    access_log_reference_label,
    access_log_reference_locator,
    reconciliation_window_start,
    reconciliation_window_end,
    observed_access_event_count,
    expected_recipient_segment_count,
    anomaly_state,
    revocation_exercise_state,
    anomaly_escalation_path,
    recipient_attestation_record_ids,
    evidence_snapshot,
    required_access_log_controls,
    linked_access_log_controls,
    missing_access_log_controls,
    retained_blockers,
    release_restrictions,
    external_log_authority_retained,
    export_disabled,
    attestation,
    review_note,
    data_boundary,
    access_log_reconciliation_authority,
    release_authority,
    storage_authority,
    recipient_attestation_authority,
    recipient_release_authority,
    recipient_storage_authority,
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
    reconciliation_scope_value,
    reconciliation_scope_label_value,
    reconciliation_status_value,
    'evidence-room-access-log-reconciliation-review-readiness-only',
    external_log_system_label_value,
    access_log_reference_label_value,
    access_log_reference_locator_value,
    reconciliation_window_start_value,
    reconciliation_window_end_value,
    observed_access_event_count_value,
    expected_recipient_segment_count_value,
    anomaly_state_value,
    revocation_exercise_state_value,
    anomaly_escalation_path_value,
    recipient_record_ids_value,
    evidence_snapshot_value,
    required_controls,
    linked_controls,
    missing_controls,
    retained_blockers_value,
    release_restrictions_value,
    true,
    true,
    attestation_value,
    review_note_value,
    data_boundary_value,
    'access-log-reconciliation-metadata-not-export-approval',
    'export-disabled-pending-external-access-log-reconciliation',
    'access-log-metadata-only-no-recipient-identifiers-or-sensitive-artifacts',
    'recipient-attestation-metadata-not-release-approval',
    'release-disabled-pending-external-recipient-authority',
    'recipient-metadata-only-no-recipient-lists-or-sensitive-artifacts',
    'not-audited-financial-report',
    'not-securities-offering-material',
    'not-advertising-claim-substantiation',
    'not-authorized-live-care',
    (select auth.uid()),
    protected_boundary
  )
  returning id into created_reconciliation_id;

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
    'protected-evidence-room-access-log-reconciliation-recorded',
    jsonb_build_object(
      'reconciliationId', created_reconciliation_id,
      'distributionAudience', distribution_audience_value,
      'reconciliationScope', reconciliation_scope_value,
      'reconciliationScopeLabel', reconciliation_scope_label_value,
      'reconciliationStatus', reconciliation_status_value,
      'recipientAttestationRecordIds', recipient_record_ids_value,
      'requiredAccessLogControls', required_controls,
      'linkedAccessLogControls', linked_controls,
      'missingAccessLogControls', missing_controls,
      'anomalyState', anomaly_state_value,
      'revocationExerciseState', revocation_exercise_state_value,
      'actorRole', actor_role,
      'approvalScope', 'evidence-room-access-log-reconciliation-review-readiness-only',
      'externalLogAuthorityRetained', true,
      'exportDisabled', true,
      'assuranceLevel', 'aal2',
      'syntheticOnly', true,
      'metadataOnly', true,
      'accessLogMetadataOnly', true,
      'rawLogStorageDisabled', true,
      'noPhi', true,
      'accessLogReconciliationAuthority', 'access-log-reconciliation-metadata-not-export-approval',
      'releaseAuthority', 'export-disabled-pending-external-access-log-reconciliation',
      'storageAuthority', 'access-log-metadata-only-no-recipient-identifiers-or-sensitive-artifacts',
      'recipientAttestationAuthority', 'recipient-attestation-metadata-not-release-approval',
      'recipientReleaseAuthority', 'release-disabled-pending-external-recipient-authority',
      'recipientStorageAuthority', 'recipient-metadata-only-no-recipient-lists-or-sensitive-artifacts',
      'financialReportingAuthority', 'not-audited-financial-report',
      'securitiesAuthority', 'not-securities-offering-material',
      'advertisingClaimsAuthority', 'not-advertising-claim-substantiation',
      'clinicalExecutionAuthority', 'not-authorized-live-care'
    )
  );

  return created_reconciliation_id;
end;
$$;

create or replace function public.record_protected_evidence_room_access_log_reconciliation(
  p_workspace_slug text,
  p_reconciliation_input jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_protected_evidence_room_access_log_reconciliation(
    p_workspace_slug,
    p_reconciliation_input
  );
$$;

revoke all on function private.record_protected_evidence_room_access_log_reconciliation(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.record_protected_evidence_room_access_log_reconciliation(text, jsonb)
  from public, anon, authenticated, service_role;

grant execute on function private.record_protected_evidence_room_access_log_reconciliation(text, jsonb)
  to authenticated;
grant execute on function public.record_protected_evidence_room_access_log_reconciliation(text, jsonb)
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
    'schemaVersion', '2026-06-20.7',
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
    'protectedEvidenceRoomAccessLogReconciliationPackets', 'aal2-audited-evidence-room-access-log-reconciliation-packets-no-phi'
  );
$$;

comment on table public.protected_evidence_room_access_log_reconciliations is
  'Tenant-scoped no-PHI disabled-by-default metadata references to externally retained evidence-room access-log reconciliation. RLS select requires authenticated AAL2 governance context and tenant membership. Writes require guarded RPC. This table does not store PHI, patient identifiers, payer member data, live clinical records, raw access logs, source documents, source contracts, secrets, credentials, URLs, access tokens, IP addresses, device identifiers, recipient names, recipient email addresses, exact recipient lists, signed approvals, legal opinions, audited financial statements, securities offering material, advertising substantiation, customer permission artifacts, public release approval, external distribution approval, production authorization, or live clinical execution approval.';
comment on function private.record_protected_evidence_room_access_log_reconciliation(text, jsonb) is
  'Records bounded no-PHI disabled evidence-room access-log reconciliation metadata after AAL2 governance authorization and appends an audit event. This is not legal approval, public release approval, external distribution approval, audited financial reporting, advertising substantiation, customer permission, compliance certification, production authorization, clinical validation, reimbursement assurance, or live clinical execution authority.';
