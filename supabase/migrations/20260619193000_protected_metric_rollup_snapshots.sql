create table if not exists public.protected_metric_rollup_snapshots (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  reporting_period_start timestamptz not null,
  reporting_period_end timestamptz not null,
  metric_count integer not null default 0 check (metric_count >= 0),
  captured_metric_types integer not null default 0 check (captured_metric_types between 0 and 5),
  required_metric_types integer not null default 5 check (required_metric_types = 5),
  ready_for_board_review boolean not null default false,
  model_cost_usd numeric(14, 4) not null default 0 check (model_cost_usd >= 0),
  model_cost_per_workflow numeric(14, 4) check (model_cost_per_workflow is null or model_cost_per_workflow >= 0),
  review_time_minutes numeric(14, 4) not null default 0 check (review_time_minutes >= 0),
  review_minutes_per_workflow numeric(14, 4) check (review_minutes_per_workflow is null or review_minutes_per_workflow >= 0),
  delivery_hours numeric(14, 4) not null default 0 check (delivery_hours >= 0),
  delivery_hours_per_workflow numeric(14, 4) check (delivery_hours_per_workflow is null or delivery_hours_per_workflow >= 0),
  proof_packet_count numeric(14, 4) not null default 0 check (proof_packet_count >= 0),
  proof_packets_per_workflow numeric(14, 4) check (proof_packets_per_workflow is null or proof_packets_per_workflow >= 0),
  workflow_volume numeric(14, 4) not null default 0 check (workflow_volume >= 0),
  cost_per_workflow numeric(14, 4) check (cost_per_workflow is null or cost_per_workflow >= 0),
  totals jsonb not null default '[]'::jsonb check (jsonb_typeof(totals) = 'array'),
  recommendations jsonb not null default '[]'::jsonb check (jsonb_typeof(recommendations) = 'array'),
  limitations jsonb not null default '[]'::jsonb check (jsonb_typeof(limitations) = 'array'),
  reviewer_attestation text not null check (
    reviewer_attestation = 'finance-reviewed-no-phi-operating-rollup'
  ),
  review_note text not null default '' check (char_length(review_note) <= 280),
  data_boundary text not null check (data_boundary = 'synthetic-business-workflow-only'),
  financial_reporting_authority text not null default 'not-audited-financial-report'
    check (financial_reporting_authority = 'not-audited-financial-report'),
  securities_authority text not null default 'not-securities-offering-material'
    check (securities_authority = 'not-securities-offering-material'),
  clinical_execution_authority text not null default 'not-authorized-live-care'
    check (clinical_execution_authority = 'not-authorized-live-care'),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  boundary text not null default
    'Protected Metric Rollups convert tenant-scoped no-PHI operator metrics into internal board operating snapshots and audited packet downloads for Public Market Readiness. They do not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, legal advice, valuation assurance, clinical validation, reimbursement assurance, compliance certification, production authorization, or live clinical execution approval.',
  check (reporting_period_start <= reporting_period_end)
);

create index if not exists protected_metric_rollup_snapshots_tenant_created_at_idx
  on public.protected_metric_rollup_snapshots(tenant_id, created_at desc);
create index if not exists protected_metric_rollup_snapshots_workspace_created_at_idx
  on public.protected_metric_rollup_snapshots(workspace_id, created_at desc);
create index if not exists protected_metric_rollup_snapshots_workspace_period_idx
  on public.protected_metric_rollup_snapshots(workspace_id, reporting_period_start, reporting_period_end);
create index if not exists protected_metric_rollup_snapshots_created_by_idx
  on public.protected_metric_rollup_snapshots(created_by);

alter table public.protected_metric_rollup_snapshots enable row level security;
revoke all on public.protected_metric_rollup_snapshots from public, anon, authenticated;
grant select on public.protected_metric_rollup_snapshots to authenticated;

drop policy if exists protected_metric_rollup_snapshots_governance_select
  on public.protected_metric_rollup_snapshots;
create policy protected_metric_rollup_snapshots_governance_select
on public.protected_metric_rollup_snapshots
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
      'protected-metric-rollup-packet-downloaded'
    )
  );

create or replace function private.create_protected_metric_rollup_snapshot(
  p_workspace_slug text,
  p_rollup_input jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  created_snapshot_id uuid;
  normalized_input jsonb := coalesce(p_rollup_input, '{}'::jsonb);
  reporting_period_start_value timestamptz;
  reporting_period_end_value timestamptz;
  reviewer_attestation_value text;
  data_boundary_value text;
  review_note_value text;
  actor_role text;
  metric_count_value integer := 0;
  captured_metric_types_value integer := 0;
  model_cost_usd_value numeric(14, 4) := 0;
  review_time_minutes_value numeric(14, 4) := 0;
  delivery_hours_value numeric(14, 4) := 0;
  proof_packet_count_value numeric(14, 4) := 0;
  workflow_volume_value numeric(14, 4) := 0;
  model_cost_per_workflow_value numeric(14, 4);
  review_minutes_per_workflow_value numeric(14, 4);
  delivery_hours_per_workflow_value numeric(14, 4);
  proof_packets_per_workflow_value numeric(14, 4);
  cost_per_workflow_value numeric(14, 4);
  ready_for_board_review_value boolean := false;
  totals_value jsonb := '[]'::jsonb;
  recommendations_value jsonb := '[]'::jsonb;
  limitations_value jsonb := '[]'::jsonb;
  protected_boundary text :=
    'Protected Metric Rollups convert tenant-scoped no-PHI operator metrics into internal board operating snapshots and audited packet downloads for Public Market Readiness. They do not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, legal advice, valuation assurance, clinical validation, reimbursement assurance, compliance certification, production authorization, or live clinical execution approval.';
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
    raise exception 'protected-metric-rollup-invalid-payload';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(normalized_input) as supplied(key)
    where supplied.key <> all(array[
      'reportingPeriodStart',
      'reportingPeriodEnd',
      'reviewerAttestation',
      'dataBoundary',
      'reviewNote'
    ])
  ) then
    raise exception 'protected-metric-rollup-unsupported-field';
  end if;

  reviewer_attestation_value := trim(coalesce(normalized_input ->> 'reviewerAttestation', ''));
  data_boundary_value := trim(coalesce(normalized_input ->> 'dataBoundary', ''));
  review_note_value := left(trim(coalesce(normalized_input ->> 'reviewNote', '')), 281);

  begin
    reporting_period_start_value := (normalized_input ->> 'reportingPeriodStart')::timestamptz;
    reporting_period_end_value := (normalized_input ->> 'reportingPeriodEnd')::timestamptz;
  exception when others then
    raise exception 'protected-metric-rollup-invalid-typed-field';
  end;

  if reporting_period_start_value is null
    or reporting_period_end_value is null
    or reviewer_attestation_value <> 'finance-reviewed-no-phi-operating-rollup'
    or data_boundary_value <> 'synthetic-business-workflow-only'
    or char_length(review_note_value) > 280
    or reporting_period_start_value > reporting_period_end_value
    or reporting_period_end_value > now() + interval '5 minutes'
    or reporting_period_end_value - reporting_period_start_value > interval '365 days'
    or reporting_period_start_value < now() - interval '365 days' then
    raise exception 'protected-metric-rollup-validation-failed';
  end if;

  if review_note_value ~*
    '(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|sk-[A-Za-z0-9_-]{12,}|sbp_[A-Za-z0-9_-]{12,}|bearer[[:space:]]+[A-Za-z0-9._-]+|patient[ _-]?(id|identifier|mrn)|member[ _-]?(id|identifier)|medical record|protected health information|payer member|diagnosis code|social security|audited financial|investment recommendation|securities offering|valuation guarantee)' then
    raise exception 'protected-metric-rollup-prohibited-content';
  end if;

  select membership.role
  into actor_role
  from public.pilot_memberships membership
  where membership.tenant_id = selected_workspace.tenant_id
    and membership.user_id = (select auth.uid())
    and membership.role in ('tenant-admin', 'pilot-lead', 'reviewer')
  limit 1;

  if actor_role is null then
    raise exception 'protected-metric-rollup-role-denied';
  end if;

  select
    count(*)::integer,
    count(distinct metric_key)::integer,
    coalesce(sum(metric_value) filter (where metric_key = 'model-cost-usd'), 0)::numeric(14, 4),
    coalesce(sum(metric_value) filter (where metric_key = 'review-time-minutes'), 0)::numeric(14, 4),
    coalesce(sum(metric_value) filter (where metric_key = 'delivery-hours'), 0)::numeric(14, 4),
    coalesce(sum(metric_value) filter (where metric_key = 'proof-packet-count'), 0)::numeric(14, 4),
    coalesce(sum(metric_value) filter (where metric_key = 'workflow-volume'), 0)::numeric(14, 4)
  into
    metric_count_value,
    captured_metric_types_value,
    model_cost_usd_value,
    review_time_minutes_value,
    delivery_hours_value,
    proof_packet_count_value,
    workflow_volume_value
  from public.protected_operator_metrics metrics
  where metrics.workspace_id = selected_workspace.id
    and metrics.measurement_window_start >= reporting_period_start_value
    and metrics.measurement_window_end <= reporting_period_end_value;

  if workflow_volume_value > 0 then
    model_cost_per_workflow_value := round(model_cost_usd_value / workflow_volume_value, 4);
    review_minutes_per_workflow_value := round(review_time_minutes_value / workflow_volume_value, 4);
    delivery_hours_per_workflow_value := round(delivery_hours_value / workflow_volume_value, 4);
    proof_packets_per_workflow_value := round(proof_packet_count_value / workflow_volume_value, 4);
    cost_per_workflow_value := model_cost_per_workflow_value;
  end if;

  ready_for_board_review_value :=
    captured_metric_types_value = 5 and workflow_volume_value > 0;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'metricKey', catalog.metric_key,
        'label', catalog.label,
        'unit', catalog.unit,
        'total', catalog.total,
        'count', catalog.entry_count,
        'publicMarketKpiId', catalog.public_market_kpi_id
      )
      order by catalog.sort_order
    ),
    '[]'::jsonb
  )
  into totals_value
  from (
    select
      metric_catalog.metric_key,
      metric_catalog.label,
      metric_catalog.unit,
      metric_catalog.public_market_kpi_id,
      metric_catalog.sort_order,
      coalesce(sum(metrics.metric_value), 0)::numeric(14, 4) as total,
      count(metrics.id)::integer as entry_count
    from (
      values
        ('model-cost-usd', 'Model cost', 'usd', 'model-cost-per-trust-card', 1),
        ('review-time-minutes', 'Human review time', 'minutes', 'time-saved-per-clinician', 2),
        ('delivery-hours', 'Delivery hours', 'hours', 'gross-margin-by-offer', 3),
        ('proof-packet-count', 'Proof packet count', 'count', 'compliance-log-completeness', 4),
        ('workflow-volume', 'Workflow volume', 'count', 'cost-per-workflow', 5)
    ) as metric_catalog(metric_key, label, unit, public_market_kpi_id, sort_order)
    left join public.protected_operator_metrics metrics
      on metrics.workspace_id = selected_workspace.id
     and metrics.metric_key = metric_catalog.metric_key
     and metrics.measurement_window_start >= reporting_period_start_value
     and metrics.measurement_window_end <= reporting_period_end_value
    group by
      metric_catalog.metric_key,
      metric_catalog.label,
      metric_catalog.unit,
      metric_catalog.public_market_kpi_id,
      metric_catalog.sort_order
  ) catalog;

  recommendations_value := jsonb_build_array(
    case
      when ready_for_board_review_value then
        'Route this rollup to finance-reviewed monthly operating review before external use.'
      else
        'Complete missing protected operator metric coverage before relying on board packet output.'
    end,
    case
      when workflow_volume_value > 0 then
        'Use model-cost-per-workflow as an internal operating signal until full cost allocation is approved.'
      else
        'Capture workflow-volume before calculating per-workflow unit economics.'
    end,
    'Keep rollups internal until finance, counsel, and qualified advisors approve external use.'
  );

  limitations_value := jsonb_build_array(
    protected_boundary,
    'Current rollups use aggregate operating metadata only and exclude labor-dollar allocation until finance-reviewed cost accounting exists.',
    'Per-workflow cost is model-cost-only until infrastructure, support, delivery, and review-labor allocations are approved.',
    'Rollups are internal operating evidence, not audited financial reporting, securities offering material, investment advice, valuation assurance, clinical validation, reimbursement assurance, or live care authorization.'
  );

  insert into public.protected_metric_rollup_snapshots (
    tenant_id,
    workspace_id,
    reporting_period_start,
    reporting_period_end,
    metric_count,
    captured_metric_types,
    required_metric_types,
    ready_for_board_review,
    model_cost_usd,
    model_cost_per_workflow,
    review_time_minutes,
    review_minutes_per_workflow,
    delivery_hours,
    delivery_hours_per_workflow,
    proof_packet_count,
    proof_packets_per_workflow,
    workflow_volume,
    cost_per_workflow,
    totals,
    recommendations,
    limitations,
    reviewer_attestation,
    review_note,
    data_boundary,
    financial_reporting_authority,
    securities_authority,
    clinical_execution_authority,
    created_by,
    boundary
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    reporting_period_start_value,
    reporting_period_end_value,
    metric_count_value,
    captured_metric_types_value,
    5,
    ready_for_board_review_value,
    model_cost_usd_value,
    model_cost_per_workflow_value,
    review_time_minutes_value,
    review_minutes_per_workflow_value,
    delivery_hours_value,
    delivery_hours_per_workflow_value,
    proof_packet_count_value,
    proof_packets_per_workflow_value,
    workflow_volume_value,
    cost_per_workflow_value,
    totals_value,
    recommendations_value,
    limitations_value,
    reviewer_attestation_value,
    review_note_value,
    data_boundary_value,
    'not-audited-financial-report',
    'not-securities-offering-material',
    'not-authorized-live-care',
    (select auth.uid()),
    protected_boundary
  )
  returning id into created_snapshot_id;

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
    'protected-metric-rollup-created',
    jsonb_build_object(
      'snapshotId', created_snapshot_id,
      'actorRole', actor_role,
      'metricCount', metric_count_value,
      'capturedMetricTypes', captured_metric_types_value,
      'requiredMetricTypes', 5,
      'readyForBoardReview', ready_for_board_review_value,
      'reportingPeriodStart', reporting_period_start_value,
      'reportingPeriodEnd', reporting_period_end_value,
      'assuranceLevel', 'aal2',
      'syntheticOnly', true,
      'metadataOnly', true,
      'noPhi', true,
      'financialReportingAuthority', 'not-audited-financial-report',
      'securitiesAuthority', 'not-securities-offering-material',
      'clinicalExecutionAuthority', 'not-authorized-live-care'
    )
  );

  return created_snapshot_id;
end;
$$;

create or replace function public.create_protected_metric_rollup_snapshot(
  p_workspace_slug text,
  p_rollup_input jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.create_protected_metric_rollup_snapshot(
    p_workspace_slug,
    p_rollup_input
  );
$$;

create or replace function private.record_protected_metric_rollup_packet_download(
  p_workspace_slug text,
  p_snapshot_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_snapshot public.protected_metric_rollup_snapshots%rowtype;
  created_event_id uuid;
  actor_role text;
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead', 'reviewer']
  );

  select *
  into selected_snapshot
  from public.protected_metric_rollup_snapshots snapshot
  where snapshot.id = p_snapshot_id
    and snapshot.workspace_id = selected_workspace.id
    and snapshot.tenant_id = selected_workspace.tenant_id;

  if selected_snapshot.id is null then
    raise exception 'protected-metric-rollup-snapshot-not-found';
  end if;

  select membership.role
  into actor_role
  from public.pilot_memberships membership
  where membership.tenant_id = selected_workspace.tenant_id
    and membership.user_id = (select auth.uid())
    and membership.role in ('tenant-admin', 'pilot-lead', 'reviewer')
  limit 1;

  if actor_role is null then
    raise exception 'protected-metric-rollup-role-denied';
  end if;

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
    'protected-metric-rollup-packet-downloaded',
    jsonb_build_object(
      'snapshotId', selected_snapshot.id,
      'actorRole', actor_role,
      'format', 'text/markdown',
      'packetType', 'protected-metric-board-packet',
      'metricCount', selected_snapshot.metric_count,
      'capturedMetricTypes', selected_snapshot.captured_metric_types,
      'readyForBoardReview', selected_snapshot.ready_for_board_review,
      'assuranceLevel', 'aal2',
      'syntheticOnly', true,
      'metadataOnly', true,
      'noPhi', true,
      'financialReportingAuthority', 'not-audited-financial-report',
      'securitiesAuthority', 'not-securities-offering-material',
      'clinicalExecutionAuthority', 'not-authorized-live-care'
    )
  )
  returning id into created_event_id;

  return created_event_id;
end;
$$;

create or replace function public.record_protected_metric_rollup_packet_download(
  p_workspace_slug text,
  p_snapshot_id uuid
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_protected_metric_rollup_packet_download(
    p_workspace_slug,
    p_snapshot_id
  );
$$;

revoke all on function private.create_protected_metric_rollup_snapshot(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.create_protected_metric_rollup_snapshot(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function private.record_protected_metric_rollup_packet_download(text, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.record_protected_metric_rollup_packet_download(text, uuid)
  from public, anon, authenticated, service_role;

grant execute on function private.create_protected_metric_rollup_snapshot(text, jsonb)
  to authenticated;
grant execute on function public.create_protected_metric_rollup_snapshot(text, jsonb)
  to authenticated;
grant execute on function private.record_protected_metric_rollup_packet_download(text, uuid)
  to authenticated;
grant execute on function public.record_protected_metric_rollup_packet_download(text, uuid)
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
    'schemaVersion', '2026-06-19.3',
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
    'protectedMetricRollupPackets', 'aal2-audited-board-metric-packets-no-phi'
  );
$$;

comment on table public.protected_metric_rollup_snapshots is
  'Tenant-scoped no-PHI protected metric rollup snapshots for SCRIMED Public Market Readiness and internal board operating review. RLS select requires authenticated AAL2 governance context and tenant membership. Writes require guarded RPC. No PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, legal advice, valuation assurance, clinical validation, reimbursement assurance, compliance certification, production authorization, or live clinical execution approval is permitted.';
comment on function private.create_protected_metric_rollup_snapshot(text, jsonb) is
  'Creates a no-PHI finance-reviewed protected metric rollup snapshot from tenant-scoped operator metrics and records an append-only audit event after AAL2 governance authorization.';
comment on function private.record_protected_metric_rollup_packet_download(text, uuid) is
  'Records an append-only audit event before releasing a protected metric board packet for a no-PHI rollup snapshot.';
