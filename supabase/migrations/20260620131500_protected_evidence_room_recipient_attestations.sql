create table if not exists public.protected_evidence_room_recipient_attestations (
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
  recipient_segment text not null check (
    recipient_segment in (
      'named-buyer-reviewers',
      'investor-diligence-reviewers',
      'board-governance-reviewers',
      'procurement-security-reviewers',
      'implementation-sponsor-reviewers',
      'marketing-pr-reviewers',
      'customer-reference-reviewers'
    )
  ),
  recipient_segment_label text not null check (
    char_length(recipient_segment_label) between 3 and 100
    and recipient_segment_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{2,99}$'
  ),
  attestation_status text not null check (
    attestation_status in (
      'recipient-attestation-metadata-recorded',
      'release-authority-linked',
      'recipient-metadata-complete-not-export-approval',
      'blocked'
    )
  ),
  approval_scope text not null default 'evidence-room-recipient-attestation-review-readiness-only'
    check (approval_scope = 'evidence-room-recipient-attestation-review-readiness-only'),
  recipient_scope_label text not null check (
    char_length(recipient_scope_label) between 4 and 140
    and recipient_scope_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  evidence_room_reference_label text not null check (
    char_length(evidence_room_reference_label) between 4 and 140
    and evidence_room_reference_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  evidence_room_reference_locator text not null check (
    char_length(evidence_room_reference_locator) between 4 and 140
    and evidence_room_reference_locator ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  packet_reference_label text not null check (
    char_length(packet_reference_label) between 4 and 140
    and packet_reference_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  packet_reference_locator text not null check (
    char_length(packet_reference_locator) between 4 and 140
    and packet_reference_locator ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  access_window_start timestamptz not null,
  access_window_end timestamptz not null,
  revocation_state text not null check (
    revocation_state in ('access-not-issued', 'revocation-ready', 'revoked')
  ),
  revocation_trigger text not null check (
    char_length(revocation_trigger) between 8 and 180
    and revocation_trigger ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{7,179}$'
  ),
  release_authority_attestation_record_ids uuid[] not null
    check (cardinality(release_authority_attestation_record_ids) between 1 and 14),
  evidence_snapshot jsonb not null default '{}'::jsonb
    check (jsonb_typeof(evidence_snapshot) = 'object' and pg_column_size(evidence_snapshot) <= 8192),
  required_recipient_controls text[] not null
    check (cardinality(required_recipient_controls) = 7),
  linked_recipient_controls text[] not null default '{}'::text[]
    check (cardinality(linked_recipient_controls) between 0 and 7),
  missing_recipient_controls text[] not null default '{}'::text[]
    check (cardinality(missing_recipient_controls) between 0 and 7),
  retained_blockers text[] not null default '{}'::text[]
    check (cardinality(retained_blockers) between 1 and 18),
  release_restrictions text[] not null default '{}'::text[]
    check (cardinality(release_restrictions) between 1 and 18),
  external_recipient_authority_retained boolean not null default true
    check (external_recipient_authority_retained is true),
  export_disabled boolean not null default true
    check (export_disabled is true),
  attestation text not null check (
    attestation = 'evidence-room-recipient-attestation-metadata-no-phi'
  ),
  review_note text not null default '' check (char_length(review_note) <= 280),
  data_boundary text not null check (data_boundary = 'synthetic-business-workflow-only'),
  recipient_attestation_authority text not null default 'recipient-attestation-metadata-not-release-approval'
    check (recipient_attestation_authority = 'recipient-attestation-metadata-not-release-approval'),
  release_authority text not null default 'release-disabled-pending-external-recipient-authority'
    check (release_authority = 'release-disabled-pending-external-recipient-authority'),
  storage_authority text not null default 'recipient-metadata-only-no-recipient-lists-or-sensitive-artifacts'
    check (storage_authority = 'recipient-metadata-only-no-recipient-lists-or-sensitive-artifacts'),
  release_authority_attestation_authority text not null default 'external-release-authority-reference-not-approval'
    check (release_authority_attestation_authority = 'external-release-authority-reference-not-approval'),
  release_authority_release_authority text not null default 'release-disabled-pending-executed-external-authority'
    check (release_authority_release_authority = 'release-disabled-pending-executed-external-authority'),
  release_authority_storage_authority text not null default 'authority-metadata-only-no-sensitive-documents'
    check (release_authority_storage_authority = 'authority-metadata-only-no-sensitive-documents'),
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
    'Protected Evidence Room Recipient Attestations record disabled-by-default no-PHI metadata for intended evidence-room recipient scope, access windows, packet references, and revocation posture. They do not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, exact recipient lists, recipient email addresses, signed approvals, signed BAAs/DPAs, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, advertising claim substantiation, clinical validation, compliance certification, customer permission artifacts, public release approval, external distribution approval, production authorization, or live clinical execution approval.'
);

create index if not exists protected_evidence_room_recipient_attestations_tenant_recorded_at_idx
  on public.protected_evidence_room_recipient_attestations(tenant_id, recorded_at desc);
create index if not exists protected_evidence_room_recipient_attestations_workspace_recorded_at_idx
  on public.protected_evidence_room_recipient_attestations(workspace_id, recorded_at desc);
create index if not exists protected_evidence_room_recipient_attestations_segment_idx
  on public.protected_evidence_room_recipient_attestations(workspace_id, recipient_segment, recorded_at desc);
create index if not exists protected_evidence_room_recipient_attestations_status_idx
  on public.protected_evidence_room_recipient_attestations(workspace_id, attestation_status, recorded_at desc);
create index if not exists protected_evidence_room_recipient_attestations_recorded_by_idx
  on public.protected_evidence_room_recipient_attestations(recorded_by);

alter table public.protected_evidence_room_recipient_attestations enable row level security;
revoke all on public.protected_evidence_room_recipient_attestations from public, anon, authenticated;
grant select on public.protected_evidence_room_recipient_attestations to authenticated;

drop policy if exists protected_evidence_room_recipient_attestations_member_select
  on public.protected_evidence_room_recipient_attestations;
create policy protected_evidence_room_recipient_attestations_member_select
on public.protected_evidence_room_recipient_attestations
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
      'protected-evidence-room-recipient-attestation-recorded'
    )
  );

create or replace function private.record_protected_evidence_room_recipient_attestation(
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
  authority_record_ids_value uuid[] := '{}'::uuid[];
  authority_count_value integer := 0;
  supplied_authority_count_value integer := 0;
  distribution_audience_value text;
  recipient_segment_value text;
  recipient_segment_label_value text;
  recipient_scope_label_value text;
  evidence_room_reference_label_value text;
  evidence_room_reference_locator_value text;
  packet_reference_label_value text;
  packet_reference_locator_value text;
  access_window_start_value timestamptz;
  access_window_end_value timestamptz;
  revocation_state_value text;
  revocation_trigger_value text;
  attestation_value text;
  data_boundary_value text;
  review_note_value text;
  actor_role text;
  required_controls text[] := array[
    'recipient-segment-bounded',
    'access-window-bounded',
    'revocation-path-defined',
    'no-recipient-list-stored',
    'evidence-room-reference-external',
    'packet-reference-external',
    'release-authority-linked'
  ];
  linked_controls text[] := '{}'::text[];
  missing_controls text[] := '{}'::text[];
  retained_blockers_value text[];
  release_restrictions_value text[];
  attestation_status_value text;
  evidence_snapshot_value jsonb;
  created_attestation_id uuid;
  protected_boundary text :=
    'Protected Evidence Room Recipient Attestations record disabled-by-default no-PHI metadata for intended evidence-room recipient scope, access windows, packet references, and revocation posture. They do not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, exact recipient lists, recipient email addresses, signed approvals, signed BAAs/DPAs, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, advertising claim substantiation, clinical validation, compliance certification, customer permission artifacts, public release approval, external distribution approval, production authorization, or live clinical execution approval.';
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
    raise exception 'protected-evidence-room-recipient-attestation-invalid-payload';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(normalized_input) as supplied(key)
    where supplied.key <> all(array[
      'releaseAuthorityAttestationRecordIds',
      'distributionAudience',
      'recipientSegment',
      'recipientScopeLabel',
      'evidenceRoomReferenceLabel',
      'evidenceRoomReferenceLocator',
      'packetReferenceLabel',
      'packetReferenceLocator',
      'accessWindowStart',
      'accessWindowEnd',
      'revocationState',
      'revocationTrigger',
      'externalRecipientAuthorityRetained',
      'exportDisabled',
      'attestation',
      'dataBoundary',
      'reviewNote'
    ])
  ) then
    raise exception 'protected-evidence-room-recipient-attestation-unsupported-field';
  end if;

  if jsonb_typeof(normalized_input -> 'releaseAuthorityAttestationRecordIds') <> 'array' then
    raise exception 'protected-evidence-room-recipient-attestation-invalid-authority-records';
  end if;

  begin
    select count(*)
    into supplied_authority_count_value
    from jsonb_array_elements_text(normalized_input -> 'releaseAuthorityAttestationRecordIds');

    select coalesce(array_agg(distinct ids.value::uuid order by ids.value::uuid), '{}'::uuid[])
    into authority_record_ids_value
    from jsonb_array_elements_text(normalized_input -> 'releaseAuthorityAttestationRecordIds') as ids(value);

    access_window_start_value := (normalized_input ->> 'accessWindowStart')::timestamptz;
    access_window_end_value := (normalized_input ->> 'accessWindowEnd')::timestamptz;
  exception when others then
    raise exception 'protected-evidence-room-recipient-attestation-invalid-typed-field';
  end;

  distribution_audience_value := trim(coalesce(normalized_input ->> 'distributionAudience', ''));
  recipient_segment_value := trim(coalesce(normalized_input ->> 'recipientSegment', ''));
  recipient_scope_label_value := left(trim(coalesce(normalized_input ->> 'recipientScopeLabel', '')), 141);
  evidence_room_reference_label_value := left(trim(coalesce(normalized_input ->> 'evidenceRoomReferenceLabel', '')), 141);
  evidence_room_reference_locator_value := left(trim(coalesce(normalized_input ->> 'evidenceRoomReferenceLocator', '')), 141);
  packet_reference_label_value := left(trim(coalesce(normalized_input ->> 'packetReferenceLabel', '')), 141);
  packet_reference_locator_value := left(trim(coalesce(normalized_input ->> 'packetReferenceLocator', '')), 141);
  revocation_state_value := trim(coalesce(normalized_input ->> 'revocationState', ''));
  revocation_trigger_value := left(trim(coalesce(normalized_input ->> 'revocationTrigger', '')), 181);
  attestation_value := trim(coalesce(normalized_input ->> 'attestation', ''));
  data_boundary_value := trim(coalesce(normalized_input ->> 'dataBoundary', ''));
  review_note_value := left(trim(coalesce(normalized_input ->> 'reviewNote', '')), 281);

  recipient_segment_label_value := case recipient_segment_value
    when 'named-buyer-reviewers' then 'Named buyer reviewers'
    when 'investor-diligence-reviewers' then 'Investor diligence reviewers'
    when 'board-governance-reviewers' then 'Board governance reviewers'
    when 'procurement-security-reviewers' then 'Procurement and security reviewers'
    when 'implementation-sponsor-reviewers' then 'Implementation sponsor reviewers'
    when 'marketing-pr-reviewers' then 'Marketing and PR reviewers'
    when 'customer-reference-reviewers' then 'Customer reference reviewers'
    else ''
  end;

  if cardinality(authority_record_ids_value) < 1
    or cardinality(authority_record_ids_value) > 14
    or cardinality(authority_record_ids_value) <> supplied_authority_count_value
    or distribution_audience_value not in (
      'buyer-diligence-room',
      'investor-data-room',
      'board-room',
      'sales-collateral-channel',
      'marketing-site-release',
      'public-relations-channel',
      'customer-case-study-channel'
    )
    or recipient_segment_label_value = ''
    or recipient_scope_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or evidence_room_reference_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or evidence_room_reference_locator_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or packet_reference_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or packet_reference_locator_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or access_window_start_value < now() - interval '1 day'
    or access_window_end_value <= access_window_start_value
    or access_window_end_value > now() + interval '180 days'
    or revocation_state_value not in ('access-not-issued', 'revocation-ready', 'revoked')
    or revocation_trigger_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{7,179}$'
    or coalesce(normalized_input ->> 'externalRecipientAuthorityRetained', '') <> 'true'
    or coalesce(normalized_input ->> 'exportDisabled', '') <> 'true'
    or attestation_value <> 'evidence-room-recipient-attestation-metadata-no-phi'
    or data_boundary_value <> 'synthetic-business-workflow-only'
    or char_length(review_note_value) > 280 then
    raise exception 'protected-evidence-room-recipient-attestation-validation-failed';
  end if;

  if array_to_string(authority_record_ids_value, ' ') || ' ' || distribution_audience_value || ' ' || recipient_segment_value || ' ' || recipient_scope_label_value || ' ' || evidence_room_reference_label_value || ' ' || evidence_room_reference_locator_value || ' ' || packet_reference_label_value || ' ' || packet_reference_locator_value || ' ' || revocation_state_value || ' ' || revocation_trigger_value || ' ' || review_note_value ~*
    '(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|sk-[A-Za-z0-9_-]{12,}|sbp_[A-Za-z0-9_-]{12,}|bearer[[:space:]]+[A-Za-z0-9._-]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|token|secret|password|api[ _-]?key|access[ _-]?key|https?:\/\/|email|recipient[ _-]?list|contact[ _-]?list|patient[ _-]?(id|identifier|mrn)|member[ _-]?(id|identifier)|medical record|protected health information|payer member|diagnosis code|social security|source contract|signed[ _-]?(baa|dpa|contract|agreement|document|approval)|legal opinion|audited financial|investment recommendation|securities offering|valuation guarantee|revenue guarantee|reimbursement guarantee|guaranteed savings|guaranteed outcome|advertising substantiation|clinical validation|compliance certification|fda[ _-]?cleared|hipaa[ _-]?(compliant|certified)|soc[ _-]?2[ _-]?certified|autonomous diagnosis|treatment recommendation|live clinical execution|public release approved|external distribution approved|release approved|export approved|release enabled|export enabled)' then
    raise exception 'protected-evidence-room-recipient-attestation-prohibited-content';
  end if;

  select membership.role
  into actor_role
  from public.pilot_memberships membership
  where membership.tenant_id = selected_workspace.tenant_id
    and membership.user_id = (select auth.uid())
    and membership.role in ('tenant-admin', 'pilot-lead', 'reviewer')
  limit 1;

  if actor_role is null then
    raise exception 'protected-evidence-room-recipient-attestation-role-denied';
  end if;

  select count(*)
  into authority_count_value
  from public.protected_release_authority_attestations attestation
  where attestation.id = any(authority_record_ids_value)
    and attestation.workspace_id = selected_workspace.id
    and attestation.tenant_id = selected_workspace.tenant_id
    and attestation.release_disabled is true
    and attestation.external_authority_retained is true
    and attestation.attestation_status = 'all-release-authority-metadata-complete-not-release-approval'
    and cardinality(attestation.missing_authority_domains) = 0;

  if authority_count_value <> cardinality(authority_record_ids_value) then
    raise exception 'protected-evidence-room-recipient-attestation-release-authority-not-ready';
  end if;

  linked_controls := required_controls;
  missing_controls := '{}'::text[];
  attestation_status_value := case
    when authority_count_value > 0 then 'recipient-metadata-complete-not-export-approval'
    else 'recipient-attestation-metadata-recorded'
  end;

  retained_blockers_value := array[
    'Export disabled: true',
    'Exact recipient lists, recipient emails, access grants, signatures, customer permissions, counsel reviews, legal opinions, and distribution artifacts must be retained outside SCRIMED.',
    'This metadata does not create legal, financial, securities, advertising, customer, compliance, production, reimbursement, clinical validation, public release, external distribution, or live clinical execution authority.'
  ];

  release_restrictions_value := array[
    'No evidence-room export, public release, customer proof use, investor distribution, sales collateral release, marketing publication, PR release, or case-study distribution can be enabled by this SCRIMED metadata layer.',
    'No PHI, source documents, recipient lists, recipient emails, signed approvals, customer permission artifacts, legal opinions, audited financial statements, securities materials, advertising substantiation, clinical validation, production authorization, or live-care records may be stored here.',
    'Recipient segment changes, packet changes, evidence-room locator changes, expired access windows, changed revocation posture, missing release authority, expired customer permission, or absent counsel review must block external release.',
    'Recipient authority remains externally executed and independently reviewed outside SCRIMED.'
  ];

  evidence_snapshot_value := jsonb_build_object(
    'distributionAudience', distribution_audience_value,
    'recipientSegment', recipient_segment_value,
    'recipientSegmentLabel', recipient_segment_label_value,
    'attestationStatus', attestation_status_value,
    'approvalScope', 'evidence-room-recipient-attestation-review-readiness-only',
    'recipientScopeLabel', recipient_scope_label_value,
    'evidenceRoomReferenceLabel', evidence_room_reference_label_value,
    'evidenceRoomReferenceLocator', evidence_room_reference_locator_value,
    'packetReferenceLabel', packet_reference_label_value,
    'packetReferenceLocator', packet_reference_locator_value,
    'accessWindowStart', access_window_start_value,
    'accessWindowEnd', access_window_end_value,
    'revocationState', revocation_state_value,
    'revocationTrigger', revocation_trigger_value,
    'releaseAuthorityAttestationRecordIds', authority_record_ids_value,
    'requiredRecipientControls', required_controls,
    'linkedRecipientControls', linked_controls,
    'missingRecipientControls', missing_controls,
    'externalRecipientAuthorityRetained', true,
    'exportDisabled', true,
    'recipientAttestationAuthority', 'recipient-attestation-metadata-not-release-approval',
    'releaseAuthority', 'release-disabled-pending-external-recipient-authority',
    'storageAuthority', 'recipient-metadata-only-no-recipient-lists-or-sensitive-artifacts',
    'releaseAuthorityAttestationAuthority', 'external-release-authority-reference-not-approval',
    'releaseAuthorityReleaseAuthority', 'release-disabled-pending-executed-external-authority',
    'releaseAuthorityStorageAuthority', 'authority-metadata-only-no-sensitive-documents',
    'assuranceLevel', 'aal2',
    'syntheticOnly', true,
    'metadataOnly', true,
    'recipientMetadataOnly', true,
    'noPhi', true
  );

  insert into public.protected_evidence_room_recipient_attestations (
    tenant_id,
    workspace_id,
    distribution_audience,
    recipient_segment,
    recipient_segment_label,
    attestation_status,
    approval_scope,
    recipient_scope_label,
    evidence_room_reference_label,
    evidence_room_reference_locator,
    packet_reference_label,
    packet_reference_locator,
    access_window_start,
    access_window_end,
    revocation_state,
    revocation_trigger,
    release_authority_attestation_record_ids,
    evidence_snapshot,
    required_recipient_controls,
    linked_recipient_controls,
    missing_recipient_controls,
    retained_blockers,
    release_restrictions,
    external_recipient_authority_retained,
    export_disabled,
    attestation,
    review_note,
    data_boundary,
    recipient_attestation_authority,
    release_authority,
    storage_authority,
    release_authority_attestation_authority,
    release_authority_release_authority,
    release_authority_storage_authority,
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
    distribution_audience_value,
    recipient_segment_value,
    recipient_segment_label_value,
    attestation_status_value,
    'evidence-room-recipient-attestation-review-readiness-only',
    recipient_scope_label_value,
    evidence_room_reference_label_value,
    evidence_room_reference_locator_value,
    packet_reference_label_value,
    packet_reference_locator_value,
    access_window_start_value,
    access_window_end_value,
    revocation_state_value,
    revocation_trigger_value,
    authority_record_ids_value,
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
    'recipient-attestation-metadata-not-release-approval',
    'release-disabled-pending-external-recipient-authority',
    'recipient-metadata-only-no-recipient-lists-or-sensitive-artifacts',
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
    'protected-evidence-room-recipient-attestation-recorded',
    jsonb_build_object(
      'attestationId', created_attestation_id,
      'distributionAudience', distribution_audience_value,
      'recipientSegment', recipient_segment_value,
      'recipientSegmentLabel', recipient_segment_label_value,
      'attestationStatus', attestation_status_value,
      'releaseAuthorityAttestationRecordIds', authority_record_ids_value,
      'requiredRecipientControls', required_controls,
      'linkedRecipientControls', linked_controls,
      'missingRecipientControls', missing_controls,
      'actorRole', actor_role,
      'approvalScope', 'evidence-room-recipient-attestation-review-readiness-only',
      'externalRecipientAuthorityRetained', true,
      'exportDisabled', true,
      'assuranceLevel', 'aal2',
      'syntheticOnly', true,
      'metadataOnly', true,
      'recipientMetadataOnly', true,
      'noPhi', true,
      'recipientAttestationAuthority', 'recipient-attestation-metadata-not-release-approval',
      'releaseAuthority', 'release-disabled-pending-external-recipient-authority',
      'storageAuthority', 'recipient-metadata-only-no-recipient-lists-or-sensitive-artifacts',
      'releaseAuthorityAttestationAuthority', 'external-release-authority-reference-not-approval',
      'releaseAuthorityReleaseAuthority', 'release-disabled-pending-executed-external-authority',
      'releaseAuthorityStorageAuthority', 'authority-metadata-only-no-sensitive-documents',
      'financialReportingAuthority', 'not-audited-financial-report',
      'securitiesAuthority', 'not-securities-offering-material',
      'advertisingClaimsAuthority', 'not-advertising-claim-substantiation',
      'clinicalExecutionAuthority', 'not-authorized-live-care'
    )
  );

  return created_attestation_id;
end;
$$;

create or replace function public.record_protected_evidence_room_recipient_attestation(
  p_workspace_slug text,
  p_attestation_input jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_protected_evidence_room_recipient_attestation(
    p_workspace_slug,
    p_attestation_input
  );
$$;

revoke all on function private.record_protected_evidence_room_recipient_attestation(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.record_protected_evidence_room_recipient_attestation(text, jsonb)
  from public, anon, authenticated, service_role;

grant execute on function private.record_protected_evidence_room_recipient_attestation(text, jsonb)
  to authenticated;
grant execute on function public.record_protected_evidence_room_recipient_attestation(text, jsonb)
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
    'schemaVersion', '2026-06-20.6',
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
    'protectedReleaseAuthorityAttestationPackets', 'aal2-audited-release-authority-attestation-packets-no-phi',
    'protectedEvidenceRoomRecipientAttestations', 'aal2-evidence-room-recipient-attestations-disabled-no-phi',
    'protectedEvidenceRoomRecipientAttestationPackets', 'aal2-audited-evidence-room-recipient-attestation-packets-no-phi'
  );
$$;

comment on table public.protected_evidence_room_recipient_attestations is
  'Tenant-scoped no-PHI disabled-by-default metadata references to externally controlled evidence-room recipient scope, access windows, packet references, and revocation posture. RLS select requires authenticated AAL2 governance context and tenant membership. Writes require guarded RPC. This table does not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, exact recipient lists, recipient email addresses, signed approvals, legal opinions, audited financial statements, securities offering material, advertising substantiation, customer permission artifacts, public release approval, external distribution approval, production authorization, or live clinical execution approval.';
comment on function private.record_protected_evidence_room_recipient_attestation(text, jsonb) is
  'Records bounded no-PHI disabled evidence-room recipient attestation metadata after AAL2 governance authorization and appends an audit event. This is not legal approval, public release approval, external distribution approval, audited financial reporting, advertising substantiation, customer permission, compliance certification, production authorization, clinical validation, reimbursement assurance, or live clinical execution authority.';
