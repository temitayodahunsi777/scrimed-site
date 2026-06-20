create table if not exists public.protected_evidence_room_provider_adapters (
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
  provider_class text not null check (
    provider_class in (
      'virtual-data-room',
      'secure-object-storage',
      'siem-log-export',
      'governance-risk-compliance',
      'identity-access-provider',
      'evidence-room-platform'
    )
  ),
  provider_class_label text not null check (
    char_length(provider_class_label) between 4 and 100
    and provider_class_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,99}$'
  ),
  integration_mode text not null check (
    integration_mode in (
      'contract-only',
      'manual-export-review',
      'metadata-api-planned',
      'audit-log-forwarder-planned',
      'evidence-room-webhook-planned'
    )
  ),
  integration_mode_label text not null check (
    char_length(integration_mode_label) between 4 and 100
    and integration_mode_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,99}$'
  ),
  adapter_status text not null check (
    adapter_status in (
      'provider-adapter-contract-metadata-recorded',
      'access-log-reconciliation-linked',
      'provider-adapter-contract-ready-not-integration-approval',
      'blocked'
    )
  ),
  approval_scope text not null default 'provider-adapter-contract-readiness-only'
    check (approval_scope = 'provider-adapter-contract-readiness-only'),
  external_provider_label text not null check (
    char_length(external_provider_label) between 4 and 140
    and external_provider_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  adapter_contract_reference_label text not null check (
    char_length(adapter_contract_reference_label) between 4 and 140
    and adapter_contract_reference_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  adapter_contract_reference_locator text not null check (
    char_length(adapter_contract_reference_locator) between 4 and 140
    and adapter_contract_reference_locator ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  audit_log_import_stub_label text not null check (
    char_length(audit_log_import_stub_label) between 4 and 140
    and audit_log_import_stub_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  audit_log_import_stub_locator text not null check (
    char_length(audit_log_import_stub_locator) between 4 and 140
    and audit_log_import_stub_locator ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  supported_audit_log_format text not null check (
    supported_audit_log_format in (
      'csv-summary',
      'jsonl-summary',
      'siem-event-summary',
      'access-review-report',
      'api-metadata-summary'
    )
  ),
  verification_cadence text not null check (
    char_length(verification_cadence) between 4 and 120
    and verification_cadence ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,119}$'
  ),
  provider_risk_tier text not null check (
    provider_risk_tier in ('not-assessed', 'low', 'moderate', 'high')
  ),
  access_log_reconciliation_record_ids uuid[] not null
    check (cardinality(access_log_reconciliation_record_ids) between 1 and 14),
  evidence_snapshot jsonb not null default '{}'::jsonb
    check (jsonb_typeof(evidence_snapshot) = 'object' and pg_column_size(evidence_snapshot) <= 8192),
  required_provider_controls text[] not null
    check (cardinality(required_provider_controls) = 8),
  linked_provider_controls text[] not null default '{}'::text[]
    check (cardinality(linked_provider_controls) between 0 and 8),
  missing_provider_controls text[] not null default '{}'::text[]
    check (cardinality(missing_provider_controls) between 0 and 8),
  retained_blockers text[] not null default '{}'::text[]
    check (cardinality(retained_blockers) between 1 and 18),
  release_restrictions text[] not null default '{}'::text[]
    check (cardinality(release_restrictions) between 1 and 18),
  external_provider_authority_retained boolean not null default true
    check (external_provider_authority_retained is true),
  raw_log_import_disabled boolean not null default true
    check (raw_log_import_disabled is true),
  credential_storage_disabled boolean not null default true
    check (credential_storage_disabled is true),
  export_disabled boolean not null default true
    check (export_disabled is true),
  attestation text not null check (
    attestation = 'evidence-room-provider-adapter-contract-metadata-no-phi'
  ),
  review_note text not null default '' check (char_length(review_note) <= 280),
  data_boundary text not null check (data_boundary = 'synthetic-business-workflow-only'),
  provider_adapter_authority text not null default 'provider-adapter-contract-metadata-not-integration-approval'
    check (provider_adapter_authority = 'provider-adapter-contract-metadata-not-integration-approval'),
  release_authority text not null default 'integration-disabled-pending-external-provider-contracting'
    check (release_authority = 'integration-disabled-pending-external-provider-contracting'),
  storage_authority text not null default 'provider-adapter-metadata-only-no-credentials-raw-logs-or-recipient-identifiers'
    check (storage_authority = 'provider-adapter-metadata-only-no-credentials-raw-logs-or-recipient-identifiers'),
  access_log_reconciliation_authority text not null default 'access-log-reconciliation-metadata-not-export-approval'
    check (access_log_reconciliation_authority = 'access-log-reconciliation-metadata-not-export-approval'),
  access_log_release_authority text not null default 'export-disabled-pending-external-access-log-reconciliation'
    check (access_log_release_authority = 'export-disabled-pending-external-access-log-reconciliation'),
  access_log_storage_authority text not null default 'access-log-metadata-only-no-recipient-identifiers-or-sensitive-artifacts'
    check (access_log_storage_authority = 'access-log-metadata-only-no-recipient-identifiers-or-sensitive-artifacts'),
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
    'Protected Evidence Room Provider Adapter Contracts record disabled-by-default no-PHI metadata for externally retained evidence-room provider contracts, adapter design references, and audit-log import stubs. They do not store PHI, patient identifiers, payer member data, live clinical records, source documents, source contracts, secrets, credentials, URLs, access tokens, raw access logs, raw log rows, IP addresses, device identifiers, recipient names, recipient email addresses, exact recipient lists, signed approvals, signed BAAs/DPAs, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, advertising claim substantiation, clinical validation, compliance certification, customer permission artifacts, public release approval, external distribution approval, production authorization, live integration approval, or live clinical execution approval.'
);

create index if not exists protected_evidence_room_provider_adapters_tenant_recorded_at_idx
  on public.protected_evidence_room_provider_adapters(tenant_id, recorded_at desc);
create index if not exists protected_evidence_room_provider_adapters_workspace_recorded_at_idx
  on public.protected_evidence_room_provider_adapters(workspace_id, recorded_at desc);
create index if not exists protected_evidence_room_provider_adapters_class_idx
  on public.protected_evidence_room_provider_adapters(workspace_id, provider_class, recorded_at desc);
create index if not exists protected_evidence_room_provider_adapters_status_idx
  on public.protected_evidence_room_provider_adapters(workspace_id, adapter_status, recorded_at desc);
create index if not exists protected_evidence_room_provider_adapters_recorded_by_idx
  on public.protected_evidence_room_provider_adapters(recorded_by);

alter table public.protected_evidence_room_provider_adapters enable row level security;
revoke all on public.protected_evidence_room_provider_adapters from public, anon, authenticated;
grant select on public.protected_evidence_room_provider_adapters to authenticated;

drop policy if exists protected_evidence_room_provider_adapters_member_select
  on public.protected_evidence_room_provider_adapters;
create policy protected_evidence_room_provider_adapters_member_select
on public.protected_evidence_room_provider_adapters
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
      'protected-evidence-room-provider-adapter-recorded'
    )
  );

create or replace function private.record_protected_evidence_room_provider_adapter(
  p_workspace_slug text,
  p_adapter_input jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  normalized_input jsonb := coalesce(p_adapter_input, '{}'::jsonb);
  access_log_record_ids_value uuid[] := '{}'::uuid[];
  access_log_count_value integer := 0;
  supplied_access_log_count_value integer := 0;
  distribution_audience_value text;
  provider_class_value text;
  provider_class_label_value text;
  integration_mode_value text;
  integration_mode_label_value text;
  external_provider_label_value text;
  adapter_contract_reference_label_value text;
  adapter_contract_reference_locator_value text;
  audit_log_import_stub_label_value text;
  audit_log_import_stub_locator_value text;
  supported_audit_log_format_value text;
  verification_cadence_value text;
  provider_risk_tier_value text;
  attestation_value text;
  data_boundary_value text;
  review_note_value text;
  actor_role text;
  required_controls text[] := array[
    'provider-contract-reference-retained',
    'access-log-reconciliation-linked',
    'metadata-import-schema-defined',
    'raw-log-import-disabled',
    'no-recipient-identifiers-stored',
    'no-provider-credentials-stored',
    'no-url-or-token-storage',
    'export-disabled'
  ];
  linked_controls text[] := array[
    'access-log-reconciliation-linked',
    'metadata-import-schema-defined',
    'raw-log-import-disabled',
    'no-recipient-identifiers-stored',
    'no-provider-credentials-stored',
    'no-url-or-token-storage',
    'export-disabled'
  ];
  missing_controls text[] := '{}'::text[];
  retained_blockers_value text[];
  release_restrictions_value text[];
  adapter_status_value text;
  evidence_snapshot_value jsonb;
  created_adapter_id uuid;
  protected_boundary text :=
    'Protected Evidence Room Provider Adapter Contracts record disabled-by-default no-PHI metadata for externally retained evidence-room provider contracts, adapter design references, and audit-log import stubs. They do not store PHI, patient identifiers, payer member data, live clinical records, source documents, source contracts, secrets, credentials, URLs, access tokens, raw access logs, raw log rows, IP addresses, device identifiers, recipient names, recipient email addresses, exact recipient lists, signed approvals, signed BAAs/DPAs, legal opinions, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, revenue guarantee, reimbursement assurance, advertising claim substantiation, clinical validation, compliance certification, customer permission artifacts, public release approval, external distribution approval, production authorization, live integration approval, or live clinical execution approval.';
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
    raise exception 'protected-evidence-room-provider-adapter-invalid-payload';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(normalized_input) as supplied(key)
    where supplied.key <> all(array[
      'accessLogReconciliationRecordIds',
      'distributionAudience',
      'providerClass',
      'integrationMode',
      'externalProviderLabel',
      'adapterContractReferenceLabel',
      'adapterContractReferenceLocator',
      'auditLogImportStubLabel',
      'auditLogImportStubLocator',
      'supportedAuditLogFormat',
      'verificationCadence',
      'providerRiskTier',
      'externalProviderAuthorityRetained',
      'rawLogImportDisabled',
      'credentialStorageDisabled',
      'exportDisabled',
      'attestation',
      'dataBoundary',
      'reviewNote'
    ])
  ) then
    raise exception 'protected-evidence-room-provider-adapter-unsupported-field';
  end if;

  if jsonb_typeof(normalized_input -> 'accessLogReconciliationRecordIds') <> 'array' then
    raise exception 'protected-evidence-room-provider-adapter-invalid-access-log-records';
  end if;

  begin
    select count(*)
    into supplied_access_log_count_value
    from jsonb_array_elements_text(normalized_input -> 'accessLogReconciliationRecordIds');

    select coalesce(array_agg(distinct ids.value::uuid order by ids.value::uuid), '{}'::uuid[])
    into access_log_record_ids_value
    from jsonb_array_elements_text(normalized_input -> 'accessLogReconciliationRecordIds') as ids(value);
  exception when others then
    raise exception 'protected-evidence-room-provider-adapter-invalid-typed-field';
  end;

  distribution_audience_value := trim(coalesce(normalized_input ->> 'distributionAudience', ''));
  provider_class_value := trim(coalesce(normalized_input ->> 'providerClass', ''));
  integration_mode_value := trim(coalesce(normalized_input ->> 'integrationMode', ''));
  external_provider_label_value := left(trim(coalesce(normalized_input ->> 'externalProviderLabel', '')), 141);
  adapter_contract_reference_label_value := left(trim(coalesce(normalized_input ->> 'adapterContractReferenceLabel', '')), 141);
  adapter_contract_reference_locator_value := left(trim(coalesce(normalized_input ->> 'adapterContractReferenceLocator', '')), 141);
  audit_log_import_stub_label_value := left(trim(coalesce(normalized_input ->> 'auditLogImportStubLabel', '')), 141);
  audit_log_import_stub_locator_value := left(trim(coalesce(normalized_input ->> 'auditLogImportStubLocator', '')), 141);
  supported_audit_log_format_value := trim(coalesce(normalized_input ->> 'supportedAuditLogFormat', ''));
  verification_cadence_value := left(trim(coalesce(normalized_input ->> 'verificationCadence', '')), 121);
  provider_risk_tier_value := trim(coalesce(normalized_input ->> 'providerRiskTier', ''));
  attestation_value := trim(coalesce(normalized_input ->> 'attestation', ''));
  data_boundary_value := trim(coalesce(normalized_input ->> 'dataBoundary', ''));
  review_note_value := left(trim(coalesce(normalized_input ->> 'reviewNote', '')), 281);

  provider_class_label_value := case provider_class_value
    when 'virtual-data-room' then 'Virtual data room'
    when 'secure-object-storage' then 'Secure object storage'
    when 'siem-log-export' then 'SIEM log export'
    when 'governance-risk-compliance' then 'Governance risk compliance'
    when 'identity-access-provider' then 'Identity access provider'
    when 'evidence-room-platform' then 'Evidence room platform'
    else ''
  end;

  integration_mode_label_value := case integration_mode_value
    when 'contract-only' then 'Contract only'
    when 'manual-export-review' then 'Manual export review'
    when 'metadata-api-planned' then 'Metadata API planned'
    when 'audit-log-forwarder-planned' then 'Audit-log forwarder planned'
    when 'evidence-room-webhook-planned' then 'Evidence-room webhook planned'
    else ''
  end;

  if cardinality(access_log_record_ids_value) < 1
    or cardinality(access_log_record_ids_value) > 14
    or cardinality(access_log_record_ids_value) <> supplied_access_log_count_value
    or distribution_audience_value not in (
      'buyer-diligence-room',
      'investor-data-room',
      'board-room',
      'sales-collateral-channel',
      'marketing-site-release',
      'public-relations-channel',
      'customer-case-study-channel'
    )
    or provider_class_label_value = ''
    or integration_mode_label_value = ''
    or external_provider_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or adapter_contract_reference_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or adapter_contract_reference_locator_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or audit_log_import_stub_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or audit_log_import_stub_locator_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or supported_audit_log_format_value not in (
      'csv-summary',
      'jsonl-summary',
      'siem-event-summary',
      'access-review-report',
      'api-metadata-summary'
    )
    or verification_cadence_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,119}$'
    or provider_risk_tier_value not in ('not-assessed', 'low', 'moderate', 'high')
    or coalesce(normalized_input ->> 'externalProviderAuthorityRetained', '') <> 'true'
    or coalesce(normalized_input ->> 'rawLogImportDisabled', '') <> 'true'
    or coalesce(normalized_input ->> 'credentialStorageDisabled', '') <> 'true'
    or coalesce(normalized_input ->> 'exportDisabled', '') <> 'true'
    or attestation_value <> 'evidence-room-provider-adapter-contract-metadata-no-phi'
    or data_boundary_value <> 'synthetic-business-workflow-only'
    or char_length(review_note_value) > 280 then
    raise exception 'protected-evidence-room-provider-adapter-validation-failed';
  end if;

  if array_to_string(access_log_record_ids_value, ' ') || ' ' || distribution_audience_value || ' ' || provider_class_value || ' ' || integration_mode_value || ' ' || external_provider_label_value || ' ' || adapter_contract_reference_label_value || ' ' || adapter_contract_reference_locator_value || ' ' || audit_log_import_stub_label_value || ' ' || audit_log_import_stub_locator_value || ' ' || supported_audit_log_format_value || ' ' || verification_cadence_value || ' ' || provider_risk_tier_value || ' ' || review_note_value ~*
    '(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|sk-[A-Za-z0-9_-]{12,}|sbp_[A-Za-z0-9_-]{12,}|bearer[[:space:]]+[A-Za-z0-9._-]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|token|secret|password|api[ _-]?key|access[ _-]?key|client[ _-]?secret|oauth|https?:\/\/|ip address|device[ _-]?id|raw[ _-]?log|log row|recipient[ _-]?name|recipient[ _-]?email|recipient[ _-]?list|contact[ _-]?list|patient[ _-]?(id|identifier|mrn)|member[ _-]?(id|identifier)|medical record|protected health information|payer member|diagnosis code|social security|source contract|signed[ _-]?(baa|dpa|contract|agreement|document|approval)|legal opinion|audited financial|investment recommendation|securities offering|valuation guarantee|revenue guarantee|reimbursement guarantee|guaranteed savings|guaranteed outcome|advertising substantiation|clinical validation|compliance certification|fda[ _-]?cleared|hipaa[ _-]?(compliant|certified)|soc[ _-]?2[ _-]?certified|autonomous diagnosis|treatment recommendation|live clinical execution|public release approved|external distribution approved|release approved|export approved|integration approved|live integration|release enabled|export enabled)' then
    raise exception 'protected-evidence-room-provider-adapter-prohibited-content';
  end if;

  select membership.role
  into actor_role
  from public.pilot_memberships membership
  where membership.tenant_id = selected_workspace.tenant_id
    and membership.user_id = (select auth.uid())
    and membership.role in ('tenant-admin', 'pilot-lead', 'reviewer')
  limit 1;

  if actor_role is null then
    raise exception 'protected-evidence-room-provider-adapter-role-denied';
  end if;

  select count(*)
  into access_log_count_value
  from public.protected_evidence_room_access_log_reconciliations reconciliation
  where reconciliation.id = any(access_log_record_ids_value)
    and reconciliation.workspace_id = selected_workspace.id
    and reconciliation.tenant_id = selected_workspace.tenant_id
    and reconciliation.export_disabled is true
    and reconciliation.external_log_authority_retained is true
    and reconciliation.reconciliation_status = 'access-log-reconciliation-complete-not-export-approval'
    and reconciliation.anomaly_state = 'none-observed'
    and cardinality(reconciliation.missing_access_log_controls) = 0;

  if access_log_count_value <> cardinality(access_log_record_ids_value) then
    raise exception 'protected-evidence-room-provider-adapter-access-log-reconciliations-not-ready';
  end if;

  if coalesce(normalized_input ->> 'externalProviderAuthorityRetained', '') = 'true' then
    linked_controls := linked_controls || array['provider-contract-reference-retained'];
  end if;

  select coalesce(array_agg(distinct control order by control), '{}'::text[])
  into linked_controls
  from unnest(linked_controls) as control;

  select coalesce(array_agg(control order by control), '{}'::text[])
  into missing_controls
  from unnest(required_controls) as control
  where control <> all(linked_controls);

  adapter_status_value := case
    when provider_risk_tier_value in ('not-assessed', 'high') then 'blocked'
    when cardinality(missing_controls) = 0 then 'provider-adapter-contract-ready-not-integration-approval'
    when access_log_count_value > 0 then 'access-log-reconciliation-linked'
    else 'provider-adapter-contract-metadata-recorded'
  end;

  retained_blockers_value := array[
    'Integration disabled: true',
    'Raw logs, provider credentials, provider URLs, access tokens, recipient identifiers, IP addresses, device identifiers, access grants, access revocation records, signatures, customer permissions, counsel reviews, legal opinions, and distribution artifacts must be retained outside SCRIMED.',
    'This metadata does not create legal, financial, securities, advertising, customer, compliance, production, reimbursement, clinical validation, public release, external distribution, live integration, or live clinical execution authority.'
  ];

  release_restrictions_value := array[
    'No evidence-room provider integration, raw-log import, credential storage, public release, customer proof use, investor distribution, sales collateral release, marketing publication, PR release, or case-study distribution can be enabled by this SCRIMED metadata layer.',
    'No PHI, source documents, raw access logs, recipient identifiers, IP addresses, device identifiers, recipient lists, recipient emails, provider credentials, provider URLs, signed approvals, customer permission artifacts, legal opinions, audited financial statements, securities materials, advertising substantiation, clinical validation, production authorization, or live-care records may be stored here.',
    'Unresolved provider risk, incomplete security review, missing BAA or DPA where applicable, missing customer permission, changed access-log reconciliation, changed evidence-room locator, changed provider contract posture, or absent counsel review must block external release and integration.',
    'Provider adapter authority remains externally contracted, independently reviewed, and disabled until customer-approved production integration controls exist.'
  ];

  evidence_snapshot_value := jsonb_build_object(
    'distributionAudience', distribution_audience_value,
    'providerClass', provider_class_value,
    'providerClassLabel', provider_class_label_value,
    'integrationMode', integration_mode_value,
    'integrationModeLabel', integration_mode_label_value,
    'adapterStatus', adapter_status_value,
    'approvalScope', 'provider-adapter-contract-readiness-only',
    'externalProviderLabel', external_provider_label_value,
    'adapterContractReferenceLabel', adapter_contract_reference_label_value,
    'adapterContractReferenceLocator', adapter_contract_reference_locator_value,
    'auditLogImportStubLabel', audit_log_import_stub_label_value,
    'auditLogImportStubLocator', audit_log_import_stub_locator_value,
    'supportedAuditLogFormat', supported_audit_log_format_value,
    'verificationCadence', verification_cadence_value,
    'providerRiskTier', provider_risk_tier_value,
    'accessLogReconciliationRecordIds', access_log_record_ids_value,
    'requiredProviderControls', required_controls,
    'linkedProviderControls', linked_controls,
    'missingProviderControls', missing_controls,
    'externalProviderAuthorityRetained', true,
    'rawLogImportDisabled', true,
    'credentialStorageDisabled', true,
    'exportDisabled', true,
    'integrationDisabled', true,
    'providerAdapterAuthority', 'provider-adapter-contract-metadata-not-integration-approval',
    'releaseAuthority', 'integration-disabled-pending-external-provider-contracting',
    'storageAuthority', 'provider-adapter-metadata-only-no-credentials-raw-logs-or-recipient-identifiers',
    'accessLogReconciliationAuthority', 'access-log-reconciliation-metadata-not-export-approval',
    'assuranceLevel', 'aal2',
    'syntheticOnly', true,
    'metadataOnly', true,
    'noPhi', true
  );

  insert into public.protected_evidence_room_provider_adapters (
    tenant_id,
    workspace_id,
    distribution_audience,
    provider_class,
    provider_class_label,
    integration_mode,
    integration_mode_label,
    adapter_status,
    approval_scope,
    external_provider_label,
    adapter_contract_reference_label,
    adapter_contract_reference_locator,
    audit_log_import_stub_label,
    audit_log_import_stub_locator,
    supported_audit_log_format,
    verification_cadence,
    provider_risk_tier,
    access_log_reconciliation_record_ids,
    evidence_snapshot,
    required_provider_controls,
    linked_provider_controls,
    missing_provider_controls,
    retained_blockers,
    release_restrictions,
    external_provider_authority_retained,
    raw_log_import_disabled,
    credential_storage_disabled,
    export_disabled,
    attestation,
    review_note,
    data_boundary,
    provider_adapter_authority,
    release_authority,
    storage_authority,
    access_log_reconciliation_authority,
    access_log_release_authority,
    access_log_storage_authority,
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
    provider_class_value,
    provider_class_label_value,
    integration_mode_value,
    integration_mode_label_value,
    adapter_status_value,
    'provider-adapter-contract-readiness-only',
    external_provider_label_value,
    adapter_contract_reference_label_value,
    adapter_contract_reference_locator_value,
    audit_log_import_stub_label_value,
    audit_log_import_stub_locator_value,
    supported_audit_log_format_value,
    verification_cadence_value,
    provider_risk_tier_value,
    access_log_record_ids_value,
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
    attestation_value,
    review_note_value,
    data_boundary_value,
    'provider-adapter-contract-metadata-not-integration-approval',
    'integration-disabled-pending-external-provider-contracting',
    'provider-adapter-metadata-only-no-credentials-raw-logs-or-recipient-identifiers',
    'access-log-reconciliation-metadata-not-export-approval',
    'export-disabled-pending-external-access-log-reconciliation',
    'access-log-metadata-only-no-recipient-identifiers-or-sensitive-artifacts',
    'not-audited-financial-report',
    'not-securities-offering-material',
    'not-advertising-claim-substantiation',
    'not-authorized-live-care',
    (select auth.uid()),
    protected_boundary
  )
  returning id into created_adapter_id;

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
    'protected-evidence-room-provider-adapter-recorded',
    jsonb_build_object(
      'adapterId', created_adapter_id,
      'distributionAudience', distribution_audience_value,
      'providerClass', provider_class_value,
      'providerClassLabel', provider_class_label_value,
      'integrationMode', integration_mode_value,
      'adapterStatus', adapter_status_value,
      'accessLogReconciliationRecordIds', access_log_record_ids_value,
      'requiredProviderControls', required_controls,
      'linkedProviderControls', linked_controls,
      'missingProviderControls', missing_controls,
      'providerRiskTier', provider_risk_tier_value,
      'actorRole', actor_role,
      'approvalScope', 'provider-adapter-contract-readiness-only',
      'externalProviderAuthorityRetained', true,
      'rawLogImportDisabled', true,
      'credentialStorageDisabled', true,
      'exportDisabled', true,
      'integrationDisabled', true,
      'assuranceLevel', 'aal2',
      'syntheticOnly', true,
      'metadataOnly', true,
      'noPhi', true,
      'providerAdapterAuthority', 'provider-adapter-contract-metadata-not-integration-approval',
      'releaseAuthority', 'integration-disabled-pending-external-provider-contracting',
      'storageAuthority', 'provider-adapter-metadata-only-no-credentials-raw-logs-or-recipient-identifiers',
      'accessLogReconciliationAuthority', 'access-log-reconciliation-metadata-not-export-approval',
      'financialReportingAuthority', 'not-audited-financial-report',
      'securitiesAuthority', 'not-securities-offering-material',
      'advertisingClaimsAuthority', 'not-advertising-claim-substantiation',
      'clinicalExecutionAuthority', 'not-authorized-live-care'
    )
  );

  return created_adapter_id;
end;
$$;

create or replace function public.record_protected_evidence_room_provider_adapter(
  p_workspace_slug text,
  p_adapter_input jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_protected_evidence_room_provider_adapter(
    p_workspace_slug,
    p_adapter_input
  );
$$;

revoke all on function private.record_protected_evidence_room_provider_adapter(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.record_protected_evidence_room_provider_adapter(text, jsonb)
  from public, anon, authenticated, service_role;

grant execute on function private.record_protected_evidence_room_provider_adapter(text, jsonb)
  to authenticated;
grant execute on function public.record_protected_evidence_room_provider_adapter(text, jsonb)
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
    'schemaVersion', '2026-06-20.8',
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
    'protectedEvidenceRoomProviderAdapterPackets', 'aal2-audited-evidence-room-provider-adapter-packets-no-phi'
  );
$$;

comment on table public.protected_evidence_room_provider_adapters is
  'Tenant-scoped no-PHI disabled-by-default metadata references to externally retained evidence-room provider adapter contracts and audit-log import stubs. RLS select requires authenticated AAL2 governance context and tenant membership. Writes require guarded RPC. This table does not store PHI, patient identifiers, payer member data, live clinical records, raw access logs, source documents, source contracts, secrets, credentials, URLs, access tokens, IP addresses, device identifiers, recipient names, recipient email addresses, exact recipient lists, signed approvals, legal opinions, audited financial statements, securities offering material, advertising substantiation, customer permission artifacts, public release approval, external distribution approval, production authorization, live integration approval, or live clinical execution approval.';
comment on function private.record_protected_evidence_room_provider_adapter(text, jsonb) is
  'Records bounded no-PHI disabled evidence-room provider adapter contract metadata after AAL2 governance authorization and appends an audit event. This is not legal approval, public release approval, external distribution approval, audited financial reporting, advertising substantiation, customer permission, compliance certification, production authorization, clinical validation, reimbursement assurance, live integration approval, or live clinical execution authority.';
