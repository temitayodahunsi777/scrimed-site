create table if not exists public.protected_operator_metrics (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  metric_key text not null check (
    metric_key in (
      'model-cost-usd',
      'review-time-minutes',
      'delivery-hours',
      'proof-packet-count',
      'workflow-volume'
    )
  ),
  metric_label text not null check (char_length(metric_label) between 2 and 120),
  metric_unit text not null check (metric_unit in ('usd', 'minutes', 'hours', 'count')),
  metric_value numeric(14, 4) not null check (metric_value >= 0 and metric_value <= 10000000),
  public_market_kpi_id text not null check (char_length(public_market_kpi_id) between 2 and 120),
  workflow_key text not null check (workflow_key ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{2,119}$'),
  measurement_window_start timestamptz not null,
  measurement_window_end timestamptz not null,
  source_route text not null check (
    source_route ~ '^/[A-Za-z0-9/_:.-]{1,179}$'
  ),
  evidence_reference text not null check (char_length(evidence_reference) between 3 and 220),
  operator_attestation text not null check (
    operator_attestation = 'no-phi-finance-readiness-operator-metric'
  ),
  data_boundary text not null check (data_boundary = 'synthetic-business-workflow-only'),
  financial_reporting_authority text not null default 'not-audited-financial-report'
    check (financial_reporting_authority = 'not-audited-financial-report'),
  securities_authority text not null default 'not-securities-offering-material'
    check (securities_authority = 'not-securities-offering-material'),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  boundary text not null default
    'Protected Operator Metric Capture stores tenant-scoped no-PHI operating metric metadata for Public Market Readiness, unit-economics discipline, and internal board review. It does not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, clinical validation, reimbursement assurance, compliance certification, production authorization, or live clinical execution approval.',
  check (measurement_window_start <= measurement_window_end)
);

create index if not exists protected_operator_metrics_tenant_created_at_idx
  on public.protected_operator_metrics(tenant_id, created_at desc);
create index if not exists protected_operator_metrics_workspace_created_at_idx
  on public.protected_operator_metrics(workspace_id, created_at desc);
create index if not exists protected_operator_metrics_workspace_metric_idx
  on public.protected_operator_metrics(workspace_id, metric_key, created_at desc);
create index if not exists protected_operator_metrics_created_by_idx
  on public.protected_operator_metrics(created_by);

alter table public.protected_operator_metrics enable row level security;
revoke all on public.protected_operator_metrics from public, anon, authenticated;
grant select on public.protected_operator_metrics to authenticated;

drop policy if exists protected_operator_metrics_governance_select
  on public.protected_operator_metrics;
create policy protected_operator_metrics_governance_select
on public.protected_operator_metrics
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
      'operator-metric-recorded'
    )
  );

create or replace function private.record_protected_operator_metric(
  p_workspace_slug text,
  p_metric_input jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  created_metric_id uuid;
  normalized_input jsonb := coalesce(p_metric_input, '{}'::jsonb);
  metric_key_value text;
  metric_label_value text;
  metric_unit_value text;
  public_market_kpi_id_value text;
  metric_value_value numeric(14, 4);
  workflow_key_value text;
  measurement_start_value timestamptz;
  measurement_end_value timestamptz;
  source_route_value text;
  evidence_reference_value text;
  operator_attestation_value text;
  data_boundary_value text;
  actor_role text;
  protected_boundary text :=
    'Protected Operator Metric Capture stores tenant-scoped no-PHI operating metric metadata for Public Market Readiness, unit-economics discipline, and internal board review. It does not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, clinical validation, reimbursement assurance, compliance certification, production authorization, or live clinical execution approval.';
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead', 'reviewer']
  );

  if jsonb_typeof(normalized_input) <> 'object'
    or pg_column_size(normalized_input) > 8192 then
    raise exception 'operator-metric-invalid-payload';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(normalized_input) as supplied(key)
    where supplied.key <> all(array[
      'metricKey',
      'metricValue',
      'workflowKey',
      'measurementWindowStart',
      'measurementWindowEnd',
      'sourceRoute',
      'evidenceReference',
      'operatorAttestation',
      'dataBoundary'
    ])
  ) then
    raise exception 'operator-metric-unsupported-field';
  end if;

  metric_key_value := trim(coalesce(normalized_input ->> 'metricKey', ''));
  workflow_key_value := trim(coalesce(normalized_input ->> 'workflowKey', ''));
  source_route_value := trim(coalesce(normalized_input ->> 'sourceRoute', ''));
  evidence_reference_value := trim(coalesce(normalized_input ->> 'evidenceReference', ''));
  operator_attestation_value := trim(coalesce(normalized_input ->> 'operatorAttestation', ''));
  data_boundary_value := trim(coalesce(normalized_input ->> 'dataBoundary', ''));

  begin
    metric_value_value := (normalized_input ->> 'metricValue')::numeric;
    measurement_start_value := (normalized_input ->> 'measurementWindowStart')::timestamptz;
    measurement_end_value := (normalized_input ->> 'measurementWindowEnd')::timestamptz;
  exception when others then
    raise exception 'operator-metric-invalid-typed-field';
  end;

  case metric_key_value
    when 'model-cost-usd' then
      metric_label_value := 'Model cost';
      metric_unit_value := 'usd';
      public_market_kpi_id_value := 'model-cost-per-trust-card';
    when 'review-time-minutes' then
      metric_label_value := 'Human review time';
      metric_unit_value := 'minutes';
      public_market_kpi_id_value := 'time-saved-per-clinician';
    when 'delivery-hours' then
      metric_label_value := 'Delivery hours';
      metric_unit_value := 'hours';
      public_market_kpi_id_value := 'gross-margin-by-offer';
    when 'proof-packet-count' then
      metric_label_value := 'Proof packet count';
      metric_unit_value := 'count';
      public_market_kpi_id_value := 'compliance-log-completeness';
    when 'workflow-volume' then
      metric_label_value := 'Workflow volume';
      metric_unit_value := 'count';
      public_market_kpi_id_value := 'cost-per-workflow';
    else
      raise exception 'operator-metric-invalid-key';
  end case;

  if metric_value_value is null
    or measurement_start_value is null
    or measurement_end_value is null
    or metric_value_value < 0
    or metric_value_value > 10000000
    or workflow_key_value !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{2,119}$'
    or source_route_value !~ '^/[A-Za-z0-9/_:.-]{1,179}$'
    or char_length(evidence_reference_value) not between 3 and 220
    or operator_attestation_value <> 'no-phi-finance-readiness-operator-metric'
    or data_boundary_value <> 'synthetic-business-workflow-only'
    or measurement_start_value > measurement_end_value
    or measurement_end_value > now() + interval '5 minutes'
    or measurement_end_value - measurement_start_value > interval '90 days'
    or measurement_start_value < now() - interval '365 days' then
    raise exception 'operator-metric-validation-failed';
  end if;

  if workflow_key_value || ' ' || source_route_value || ' ' || evidence_reference_value ~*
    '(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|sk-[A-Za-z0-9_-]{12,}|sbp_[A-Za-z0-9_-]{12,}|bearer[[:space:]]+[A-Za-z0-9._-]+|patient[ _-]?(id|identifier|mrn)|member[ _-]?(id|identifier)|medical record|protected health information|payer member|diagnosis code|social security)' then
    raise exception 'operator-metric-prohibited-content';
  end if;

  select membership.role
  into actor_role
  from public.pilot_memberships membership
  where membership.tenant_id = selected_workspace.tenant_id
    and membership.user_id = (select auth.uid())
    and membership.role in ('tenant-admin', 'pilot-lead', 'reviewer')
  limit 1;

  if actor_role is null then
    raise exception 'operator-metric-role-denied';
  end if;

  insert into public.protected_operator_metrics (
    tenant_id,
    workspace_id,
    metric_key,
    metric_label,
    metric_unit,
    metric_value,
    public_market_kpi_id,
    workflow_key,
    measurement_window_start,
    measurement_window_end,
    source_route,
    evidence_reference,
    operator_attestation,
    data_boundary,
    financial_reporting_authority,
    securities_authority,
    created_by,
    boundary
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    metric_key_value,
    metric_label_value,
    metric_unit_value,
    metric_value_value,
    public_market_kpi_id_value,
    workflow_key_value,
    measurement_start_value,
    measurement_end_value,
    source_route_value,
    evidence_reference_value,
    operator_attestation_value,
    data_boundary_value,
    'not-audited-financial-report',
    'not-securities-offering-material',
    (select auth.uid()),
    protected_boundary
  )
  returning id into created_metric_id;

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
    'operator-metric-recorded',
    jsonb_build_object(
      'operatorMetricId', created_metric_id,
      'metricKey', metric_key_value,
      'metricUnit', metric_unit_value,
      'metricValue', metric_value_value,
      'workflowKey', workflow_key_value,
      'publicMarketKpiId', public_market_kpi_id_value,
      'sourceRoute', source_route_value,
      'actorRole', actor_role,
      'assuranceLevel', 'aal2',
      'syntheticOnly', true,
      'metadataOnly', true,
      'noPhi', true,
      'financialReportingAuthority', 'not-audited-financial-report',
      'securitiesAuthority', 'not-securities-offering-material'
    )
  );

  return created_metric_id;
end;
$$;

create or replace function public.record_protected_operator_metric(
  p_workspace_slug text,
  p_metric_input jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_protected_operator_metric(
    p_workspace_slug,
    p_metric_input
  );
$$;

revoke all on function private.record_protected_operator_metric(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.record_protected_operator_metric(text, jsonb)
  from public, anon, authenticated, service_role;

grant execute on function private.record_protected_operator_metric(text, jsonb)
  to authenticated;
grant execute on function public.record_protected_operator_metric(text, jsonb)
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
    'schemaVersion', '2026-06-19.2',
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
    'protectedOperatorMetrics', 'aal2-public-market-operator-metric-ledger-no-phi'
  );
$$;

comment on table public.protected_operator_metrics is
  'Tenant-scoped no-PHI operating metric ledger for SCRIMED Public Market Readiness and unit-economics discipline. RLS select requires authenticated AAL2 governance context and tenant membership. Writes require guarded RPC. No PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, valuation assurance, clinical validation, reimbursement assurance, compliance certification, production authorization, or live clinical execution approval is permitted.';
comment on function private.record_protected_operator_metric(text, jsonb) is
  'Records a bounded no-PHI Public Market Readiness operator metric and append-only pilot audit event after AAL2 governance authorization.';
