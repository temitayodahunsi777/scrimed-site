create table if not exists public.protected_metric_trend_reviews (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  current_snapshot_id uuid not null references public.protected_metric_rollup_snapshots(id) on delete restrict,
  comparison_snapshot_id uuid not null references public.protected_metric_rollup_snapshots(id) on delete restrict,
  trend_period_label text not null check (
    trend_period_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:-]{2,95}$'
  ),
  board_trend_state text not null check (
    board_trend_state in ('improving', 'stable', 'watch', 'insufficient-data')
  ),
  trend_metrics jsonb not null default '[]'::jsonb check (jsonb_typeof(trend_metrics) = 'array'),
  reach_expansion_signals jsonb not null default '[]'::jsonb check (jsonb_typeof(reach_expansion_signals) = 'array'),
  competitive_advantages jsonb not null default '[]'::jsonb check (jsonb_typeof(competitive_advantages) = 'array'),
  agent_improvement_actions jsonb not null default '[]'::jsonb check (jsonb_typeof(agent_improvement_actions) = 'array'),
  recommendations jsonb not null default '[]'::jsonb check (jsonb_typeof(recommendations) = 'array'),
  limitations jsonb not null default '[]'::jsonb check (jsonb_typeof(limitations) = 'array'),
  reviewer_attestation text not null check (
    reviewer_attestation = 'finance-reviewed-no-phi-board-trend'
  ),
  review_note text not null default '' check (char_length(review_note) <= 280),
  data_boundary text not null check (data_boundary = 'synthetic-business-workflow-only'),
  cost_allocation_policy text not null check (
    cost_allocation_policy = 'model-cost-only-finance-allocation-pending'
  ),
  cost_allocation_status text not null default 'finance-approved-cost-allocation-required'
    check (cost_allocation_status = 'finance-approved-cost-allocation-required'),
  financial_reporting_authority text not null default 'not-audited-financial-report'
    check (financial_reporting_authority = 'not-audited-financial-report'),
  securities_authority text not null default 'not-securities-offering-material'
    check (securities_authority = 'not-securities-offering-material'),
  clinical_execution_authority text not null default 'not-authorized-live-care'
    check (clinical_execution_authority = 'not-authorized-live-care'),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  boundary text not null default
    'Protected Metric Trend Reviews compare no-PHI protected rollup snapshots for internal monthly operating review, cost discipline, reach expansion planning, competitive advantage tracking, and agent improvement loops. They do not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, legal advice, valuation assurance, clinical validation, reimbursement assurance, compliance certification, production authorization, or live clinical execution approval.',
  check (current_snapshot_id <> comparison_snapshot_id)
);

create index if not exists protected_metric_trend_reviews_tenant_created_at_idx
  on public.protected_metric_trend_reviews(tenant_id, created_at desc);
create index if not exists protected_metric_trend_reviews_workspace_created_at_idx
  on public.protected_metric_trend_reviews(workspace_id, created_at desc);
create index if not exists protected_metric_trend_reviews_current_snapshot_idx
  on public.protected_metric_trend_reviews(current_snapshot_id);
create index if not exists protected_metric_trend_reviews_comparison_snapshot_idx
  on public.protected_metric_trend_reviews(comparison_snapshot_id);
create index if not exists protected_metric_trend_reviews_created_by_idx
  on public.protected_metric_trend_reviews(created_by);

alter table public.protected_metric_trend_reviews enable row level security;
revoke all on public.protected_metric_trend_reviews from public, anon, authenticated;
grant select on public.protected_metric_trend_reviews to authenticated;

drop policy if exists protected_metric_trend_reviews_governance_select
  on public.protected_metric_trend_reviews;
create policy protected_metric_trend_reviews_governance_select
on public.protected_metric_trend_reviews
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
      'protected-metric-trend-packet-downloaded'
    )
  );

create or replace function private.create_protected_metric_trend_review(
  p_workspace_slug text,
  p_trend_input jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  current_snapshot public.protected_metric_rollup_snapshots%rowtype;
  comparison_snapshot public.protected_metric_rollup_snapshots%rowtype;
  normalized_input jsonb := coalesce(p_trend_input, '{}'::jsonb);
  current_snapshot_id_value uuid;
  comparison_snapshot_id_value uuid;
  trend_period_label_value text;
  reviewer_attestation_value text;
  data_boundary_value text;
  cost_allocation_policy_value text;
  review_note_value text;
  actor_role text;
  created_review_id uuid;
  board_trend_state_value text;
  trend_metrics_value jsonb;
  reach_expansion_signals_value jsonb;
  competitive_advantages_value jsonb;
  agent_improvement_actions_value jsonb;
  recommendations_value jsonb;
  limitations_value jsonb;
  protected_boundary text :=
    'Protected Metric Trend Reviews compare no-PHI protected rollup snapshots for internal monthly operating review, cost discipline, reach expansion planning, competitive advantage tracking, and agent improvement loops. They do not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, legal advice, valuation assurance, clinical validation, reimbursement assurance, compliance certification, production authorization, or live clinical execution approval.';
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
    raise exception 'protected-metric-trend-invalid-payload';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(normalized_input) as supplied(key)
    where supplied.key <> all(array[
      'currentSnapshotId',
      'comparisonSnapshotId',
      'trendPeriodLabel',
      'reviewerAttestation',
      'dataBoundary',
      'costAllocationPolicy',
      'reviewNote'
    ])
  ) then
    raise exception 'protected-metric-trend-unsupported-field';
  end if;

  trend_period_label_value := trim(coalesce(normalized_input ->> 'trendPeriodLabel', ''));
  reviewer_attestation_value := trim(coalesce(normalized_input ->> 'reviewerAttestation', ''));
  data_boundary_value := trim(coalesce(normalized_input ->> 'dataBoundary', ''));
  cost_allocation_policy_value := trim(coalesce(normalized_input ->> 'costAllocationPolicy', ''));
  review_note_value := left(trim(coalesce(normalized_input ->> 'reviewNote', '')), 281);

  begin
    current_snapshot_id_value := (normalized_input ->> 'currentSnapshotId')::uuid;
    comparison_snapshot_id_value := (normalized_input ->> 'comparisonSnapshotId')::uuid;
  exception when others then
    raise exception 'protected-metric-trend-invalid-typed-field';
  end;

  if current_snapshot_id_value = comparison_snapshot_id_value
    or trend_period_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:-]{2,95}$'
    or reviewer_attestation_value <> 'finance-reviewed-no-phi-board-trend'
    or data_boundary_value <> 'synthetic-business-workflow-only'
    or cost_allocation_policy_value <> 'model-cost-only-finance-allocation-pending'
    or char_length(review_note_value) > 280 then
    raise exception 'protected-metric-trend-validation-failed';
  end if;

  if trend_period_label_value || ' ' || review_note_value ~*
    '(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|sk-[A-Za-z0-9_-]{12,}|sbp_[A-Za-z0-9_-]{12,}|bearer[[:space:]]+[A-Za-z0-9._-]+|patient[ _-]?(id|identifier|mrn)|member[ _-]?(id|identifier)|medical record|protected health information|payer member|diagnosis code|social security|audited financial|investment recommendation|securities offering|valuation guarantee)' then
    raise exception 'protected-metric-trend-prohibited-content';
  end if;

  select *
  into current_snapshot
  from public.protected_metric_rollup_snapshots snapshot
  where snapshot.id = current_snapshot_id_value
    and snapshot.workspace_id = selected_workspace.id
    and snapshot.tenant_id = selected_workspace.tenant_id;

  select *
  into comparison_snapshot
  from public.protected_metric_rollup_snapshots snapshot
  where snapshot.id = comparison_snapshot_id_value
    and snapshot.workspace_id = selected_workspace.id
    and snapshot.tenant_id = selected_workspace.tenant_id;

  if current_snapshot.id is null or comparison_snapshot.id is null then
    raise exception 'protected-metric-trend-snapshot-not-found';
  end if;

  if current_snapshot.reporting_period_end < comparison_snapshot.reporting_period_end then
    raise exception 'protected-metric-trend-invalid-snapshot-order';
  end if;

  select membership.role
  into actor_role
  from public.pilot_memberships membership
  where membership.tenant_id = selected_workspace.tenant_id
    and membership.user_id = (select auth.uid())
    and membership.role in ('tenant-admin', 'pilot-lead', 'reviewer')
  limit 1;

  if actor_role is null then
    raise exception 'protected-metric-trend-role-denied';
  end if;

  if current_snapshot.model_cost_per_workflow is null
    or comparison_snapshot.model_cost_per_workflow is null
    or current_snapshot.review_minutes_per_workflow is null
    or comparison_snapshot.review_minutes_per_workflow is null
    or comparison_snapshot.workflow_volume = 0 then
    board_trend_state_value := 'insufficient-data';
  elsif current_snapshot.model_cost_per_workflow <= comparison_snapshot.model_cost_per_workflow
    and current_snapshot.review_minutes_per_workflow <= comparison_snapshot.review_minutes_per_workflow
    and current_snapshot.workflow_volume >= comparison_snapshot.workflow_volume then
    board_trend_state_value := 'improving';
  elsif current_snapshot.model_cost_per_workflow > comparison_snapshot.model_cost_per_workflow * 1.2
    or current_snapshot.review_minutes_per_workflow > comparison_snapshot.review_minutes_per_workflow * 1.2 then
    board_trend_state_value := 'watch';
  else
    board_trend_state_value := 'stable';
  end if;

  trend_metrics_value := jsonb_build_array(
    jsonb_build_object(
      'metricId', 'model-cost-per-workflow',
      'label', 'Model cost per workflow',
      'current', current_snapshot.model_cost_per_workflow,
      'comparison', comparison_snapshot.model_cost_per_workflow,
      'delta', case when current_snapshot.model_cost_per_workflow is null or comparison_snapshot.model_cost_per_workflow is null then null else round(current_snapshot.model_cost_per_workflow - comparison_snapshot.model_cost_per_workflow, 4) end,
      'percentChange', case when current_snapshot.model_cost_per_workflow is null or comparison_snapshot.model_cost_per_workflow is null or comparison_snapshot.model_cost_per_workflow = 0 then null else round(((current_snapshot.model_cost_per_workflow - comparison_snapshot.model_cost_per_workflow) / comparison_snapshot.model_cost_per_workflow) * 100, 4) end,
      'direction', 'lower-is-better',
      'state', case when current_snapshot.model_cost_per_workflow is null or comparison_snapshot.model_cost_per_workflow is null or comparison_snapshot.model_cost_per_workflow = 0 then 'insufficient-data' when abs(((current_snapshot.model_cost_per_workflow - comparison_snapshot.model_cost_per_workflow) / comparison_snapshot.model_cost_per_workflow) * 100) < 2 then 'stable' when current_snapshot.model_cost_per_workflow < comparison_snapshot.model_cost_per_workflow then 'improving' else 'watch' end
    ),
    jsonb_build_object(
      'metricId', 'review-minutes-per-workflow',
      'label', 'Review minutes per workflow',
      'current', current_snapshot.review_minutes_per_workflow,
      'comparison', comparison_snapshot.review_minutes_per_workflow,
      'delta', case when current_snapshot.review_minutes_per_workflow is null or comparison_snapshot.review_minutes_per_workflow is null then null else round(current_snapshot.review_minutes_per_workflow - comparison_snapshot.review_minutes_per_workflow, 4) end,
      'percentChange', case when current_snapshot.review_minutes_per_workflow is null or comparison_snapshot.review_minutes_per_workflow is null or comparison_snapshot.review_minutes_per_workflow = 0 then null else round(((current_snapshot.review_minutes_per_workflow - comparison_snapshot.review_minutes_per_workflow) / comparison_snapshot.review_minutes_per_workflow) * 100, 4) end,
      'direction', 'lower-is-better',
      'state', case when current_snapshot.review_minutes_per_workflow is null or comparison_snapshot.review_minutes_per_workflow is null or comparison_snapshot.review_minutes_per_workflow = 0 then 'insufficient-data' when abs(((current_snapshot.review_minutes_per_workflow - comparison_snapshot.review_minutes_per_workflow) / comparison_snapshot.review_minutes_per_workflow) * 100) < 2 then 'stable' when current_snapshot.review_minutes_per_workflow < comparison_snapshot.review_minutes_per_workflow then 'improving' else 'watch' end
    ),
    jsonb_build_object(
      'metricId', 'delivery-hours-per-workflow',
      'label', 'Delivery hours per workflow',
      'current', current_snapshot.delivery_hours_per_workflow,
      'comparison', comparison_snapshot.delivery_hours_per_workflow,
      'delta', case when current_snapshot.delivery_hours_per_workflow is null or comparison_snapshot.delivery_hours_per_workflow is null then null else round(current_snapshot.delivery_hours_per_workflow - comparison_snapshot.delivery_hours_per_workflow, 4) end,
      'percentChange', case when current_snapshot.delivery_hours_per_workflow is null or comparison_snapshot.delivery_hours_per_workflow is null or comparison_snapshot.delivery_hours_per_workflow = 0 then null else round(((current_snapshot.delivery_hours_per_workflow - comparison_snapshot.delivery_hours_per_workflow) / comparison_snapshot.delivery_hours_per_workflow) * 100, 4) end,
      'direction', 'lower-is-better',
      'state', case when current_snapshot.delivery_hours_per_workflow is null or comparison_snapshot.delivery_hours_per_workflow is null or comparison_snapshot.delivery_hours_per_workflow = 0 then 'insufficient-data' when abs(((current_snapshot.delivery_hours_per_workflow - comparison_snapshot.delivery_hours_per_workflow) / comparison_snapshot.delivery_hours_per_workflow) * 100) < 2 then 'stable' when current_snapshot.delivery_hours_per_workflow < comparison_snapshot.delivery_hours_per_workflow then 'improving' else 'watch' end
    ),
    jsonb_build_object(
      'metricId', 'proof-packets-per-workflow',
      'label', 'Proof packets per workflow',
      'current', current_snapshot.proof_packets_per_workflow,
      'comparison', comparison_snapshot.proof_packets_per_workflow,
      'delta', case when current_snapshot.proof_packets_per_workflow is null or comparison_snapshot.proof_packets_per_workflow is null then null else round(current_snapshot.proof_packets_per_workflow - comparison_snapshot.proof_packets_per_workflow, 4) end,
      'percentChange', case when current_snapshot.proof_packets_per_workflow is null or comparison_snapshot.proof_packets_per_workflow is null or comparison_snapshot.proof_packets_per_workflow = 0 then null else round(((current_snapshot.proof_packets_per_workflow - comparison_snapshot.proof_packets_per_workflow) / comparison_snapshot.proof_packets_per_workflow) * 100, 4) end,
      'direction', 'higher-is-better',
      'state', case when current_snapshot.proof_packets_per_workflow is null or comparison_snapshot.proof_packets_per_workflow is null or comparison_snapshot.proof_packets_per_workflow = 0 then 'insufficient-data' when abs(((current_snapshot.proof_packets_per_workflow - comparison_snapshot.proof_packets_per_workflow) / comparison_snapshot.proof_packets_per_workflow) * 100) < 2 then 'stable' when current_snapshot.proof_packets_per_workflow > comparison_snapshot.proof_packets_per_workflow then 'improving' else 'watch' end
    ),
    jsonb_build_object(
      'metricId', 'workflow-volume',
      'label', 'Workflow volume',
      'current', current_snapshot.workflow_volume,
      'comparison', comparison_snapshot.workflow_volume,
      'delta', round(current_snapshot.workflow_volume - comparison_snapshot.workflow_volume, 4),
      'percentChange', case when comparison_snapshot.workflow_volume = 0 then null else round(((current_snapshot.workflow_volume - comparison_snapshot.workflow_volume) / comparison_snapshot.workflow_volume) * 100, 4) end,
      'direction', 'higher-is-better',
      'state', case when comparison_snapshot.workflow_volume = 0 then 'insufficient-data' when abs(((current_snapshot.workflow_volume - comparison_snapshot.workflow_volume) / comparison_snapshot.workflow_volume) * 100) < 2 then 'stable' when current_snapshot.workflow_volume > comparison_snapshot.workflow_volume then 'improving' else 'watch' end
    )
  );

  reach_expansion_signals_value := jsonb_build_array(
    'Package repeatable low-friction workflow patterns for provider, payer, employer, government, and global health buyers.',
    'Prioritize regions and buyer segments where protected-pilot proof can be sold without PHI movement or production clinical execution.',
    'Use trend packets as internal operating evidence for channel partnerships, investor updates, and enterprise account expansion after counsel review.'
  );

  competitive_advantages_value := jsonb_build_array(
    'Workflow-owned unit economics rather than generic model usage metrics.',
    'AAL2 protected, no-PHI, write-before-release board evidence.',
    'Model-cost discipline with open/closed model optionality and task-specific agent routing.',
    'Trust, governance, audit, and human-review boundaries built into the product surface.'
  );

  agent_improvement_actions_value := jsonb_build_array(
    'Route workflows with rising review minutes into specialized TrustQA and documentation-review agents.',
    'Promote low-cost high-proof workflows into reusable agent playbooks and buyer demo templates.',
    'Feed variance signals into Agent Commander priorities, model-router budgets, and workflow retry limits.',
    'Escalate degraded metrics to human review instead of increasing autonomous execution.'
  );

  recommendations_value := jsonb_build_array(
    case
      when board_trend_state_value = 'watch' then
        'Open a finance/product operating review before expanding this workflow pattern.'
      else
        'Use this trend review to prioritize scalable workflow packages and repeatable buyer proof.'
    end,
    'Keep all external use behind finance, counsel, privacy, security, and executive approval.',
    'Add approved labor, infrastructure, support, and implementation allocation before reporting gross margin or full cost per workflow.'
  );

  limitations_value := jsonb_build_array(
    protected_boundary,
    'Trend reviews compare protected no-PHI rollup snapshots only and do not prove clinical outcomes, reimbursement outcomes, or audited financial performance.',
    'Cost allocation remains model-cost-only until finance approves labor, infrastructure, support, delivery, and reviewer allocation methodology.',
    'Reach and competitive signals are internal strategy recommendations, not investor solicitation, revenue guarantee, market-share claim, or legal advice.'
  );

  insert into public.protected_metric_trend_reviews (
    tenant_id,
    workspace_id,
    current_snapshot_id,
    comparison_snapshot_id,
    trend_period_label,
    board_trend_state,
    trend_metrics,
    reach_expansion_signals,
    competitive_advantages,
    agent_improvement_actions,
    recommendations,
    limitations,
    reviewer_attestation,
    review_note,
    data_boundary,
    cost_allocation_policy,
    cost_allocation_status,
    financial_reporting_authority,
    securities_authority,
    clinical_execution_authority,
    created_by,
    boundary
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    current_snapshot.id,
    comparison_snapshot.id,
    trend_period_label_value,
    board_trend_state_value,
    trend_metrics_value,
    reach_expansion_signals_value,
    competitive_advantages_value,
    agent_improvement_actions_value,
    recommendations_value,
    limitations_value,
    reviewer_attestation_value,
    review_note_value,
    data_boundary_value,
    cost_allocation_policy_value,
    'finance-approved-cost-allocation-required',
    'not-audited-financial-report',
    'not-securities-offering-material',
    'not-authorized-live-care',
    (select auth.uid()),
    protected_boundary
  )
  returning id into created_review_id;

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
    'protected-metric-trend-review-created',
    jsonb_build_object(
      'reviewId', created_review_id,
      'actorRole', actor_role,
      'currentSnapshotId', current_snapshot.id,
      'comparisonSnapshotId', comparison_snapshot.id,
      'trendPeriodLabel', trend_period_label_value,
      'boardTrendState', board_trend_state_value,
      'costAllocationPolicy', cost_allocation_policy_value,
      'costAllocationStatus', 'finance-approved-cost-allocation-required',
      'assuranceLevel', 'aal2',
      'syntheticOnly', true,
      'metadataOnly', true,
      'noPhi', true,
      'financialReportingAuthority', 'not-audited-financial-report',
      'securitiesAuthority', 'not-securities-offering-material',
      'clinicalExecutionAuthority', 'not-authorized-live-care'
    )
  );

  return created_review_id;
end;
$$;

create or replace function public.create_protected_metric_trend_review(
  p_workspace_slug text,
  p_trend_input jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.create_protected_metric_trend_review(
    p_workspace_slug,
    p_trend_input
  );
$$;

create or replace function private.record_protected_metric_trend_packet_download(
  p_workspace_slug text,
  p_review_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_review public.protected_metric_trend_reviews%rowtype;
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
  into selected_review
  from public.protected_metric_trend_reviews review
  where review.id = p_review_id
    and review.workspace_id = selected_workspace.id
    and review.tenant_id = selected_workspace.tenant_id;

  if selected_review.id is null then
    raise exception 'protected-metric-trend-review-not-found';
  end if;

  select membership.role
  into actor_role
  from public.pilot_memberships membership
  where membership.tenant_id = selected_workspace.tenant_id
    and membership.user_id = (select auth.uid())
    and membership.role in ('tenant-admin', 'pilot-lead', 'reviewer')
  limit 1;

  if actor_role is null then
    raise exception 'protected-metric-trend-role-denied';
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
    'protected-metric-trend-packet-downloaded',
    jsonb_build_object(
      'reviewId', selected_review.id,
      'actorRole', actor_role,
      'format', 'text/markdown',
      'packetType', 'protected-metric-trend-packet',
      'boardTrendState', selected_review.board_trend_state,
      'currentSnapshotId', selected_review.current_snapshot_id,
      'comparisonSnapshotId', selected_review.comparison_snapshot_id,
      'costAllocationPolicy', selected_review.cost_allocation_policy,
      'costAllocationStatus', selected_review.cost_allocation_status,
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

create or replace function public.record_protected_metric_trend_packet_download(
  p_workspace_slug text,
  p_review_id uuid
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_protected_metric_trend_packet_download(
    p_workspace_slug,
    p_review_id
  );
$$;

revoke all on function private.create_protected_metric_trend_review(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.create_protected_metric_trend_review(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function private.record_protected_metric_trend_packet_download(text, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.record_protected_metric_trend_packet_download(text, uuid)
  from public, anon, authenticated, service_role;

grant execute on function private.create_protected_metric_trend_review(text, jsonb)
  to authenticated;
grant execute on function public.create_protected_metric_trend_review(text, jsonb)
  to authenticated;
grant execute on function private.record_protected_metric_trend_packet_download(text, uuid)
  to authenticated;
grant execute on function public.record_protected_metric_trend_packet_download(text, uuid)
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
    'schemaVersion', '2026-06-19.4',
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
    'protectedMetricTrendPackets', 'aal2-audited-board-trend-packets-no-phi'
  );
$$;

comment on table public.protected_metric_trend_reviews is
  'Tenant-scoped no-PHI protected metric trend reviews for SCRIMED monthly variance review, reach expansion planning, competitive advantage tracking, and agent improvement loops. RLS select requires authenticated AAL2 governance context and tenant membership. Writes require guarded RPC. No PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, legal advice, valuation assurance, clinical validation, reimbursement assurance, compliance certification, production authorization, or live clinical execution approval is permitted.';
comment on function private.create_protected_metric_trend_review(text, jsonb) is
  'Creates a no-PHI protected metric trend review from two tenant-scoped rollup snapshots and records an append-only audit event after AAL2 governance authorization.';
comment on function private.record_protected_metric_trend_packet_download(text, uuid) is
  'Records an append-only audit event before releasing a protected metric trend packet for a no-PHI trend review.';
