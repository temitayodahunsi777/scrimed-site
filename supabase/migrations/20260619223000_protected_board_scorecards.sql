create table if not exists public.protected_board_scorecards (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  primary_trend_review_id uuid not null references public.protected_metric_trend_reviews(id) on delete restrict,
  secondary_trend_review_id uuid references public.protected_metric_trend_reviews(id) on delete restrict,
  tertiary_trend_review_id uuid references public.protected_metric_trend_reviews(id) on delete restrict,
  board_period_label text not null check (
    board_period_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:-]{2,95}$'
  ),
  scorecard_state text not null check (
    scorecard_state in ('scale-ready', 'optimize', 'watch', 'insufficient-data')
  ),
  trend_review_count integer not null check (trend_review_count between 1 and 3),
  rolling_quarter_metrics jsonb not null default '[]'::jsonb check (jsonb_typeof(rolling_quarter_metrics) = 'array'),
  finance_allocation_profile jsonb not null default '{}'::jsonb check (jsonb_typeof(finance_allocation_profile) = 'object'),
  buyer_segment_focus text not null check (
    buyer_segment_focus in (
      'multi-segment',
      'provider-operations',
      'payer-operations',
      'employer-population-health',
      'government-public-health',
      'global-health'
    )
  ),
  buyer_segment_cohorts jsonb not null default '[]'::jsonb check (jsonb_typeof(buyer_segment_cohorts) = 'array'),
  competitive_advantages jsonb not null default '[]'::jsonb check (jsonb_typeof(competitive_advantages) = 'array'),
  agent_improvement_priorities jsonb not null default '[]'::jsonb check (jsonb_typeof(agent_improvement_priorities) = 'array'),
  strategic_actions jsonb not null default '[]'::jsonb check (jsonb_typeof(strategic_actions) = 'array'),
  recommendations jsonb not null default '[]'::jsonb check (jsonb_typeof(recommendations) = 'array'),
  limitations jsonb not null default '[]'::jsonb check (jsonb_typeof(limitations) = 'array'),
  operator_attestation text not null check (
    operator_attestation = 'finance-methodology-pending-no-phi-board-scorecard'
  ),
  review_note text not null default '' check (char_length(review_note) <= 280),
  data_boundary text not null check (data_boundary = 'synthetic-business-workflow-only'),
  allocation_profile_status text not null default 'finance-allocation-profile-pending'
    check (allocation_profile_status = 'finance-allocation-profile-pending'),
  financial_reporting_authority text not null default 'not-audited-financial-report'
    check (financial_reporting_authority = 'not-audited-financial-report'),
  securities_authority text not null default 'not-securities-offering-material'
    check (securities_authority = 'not-securities-offering-material'),
  clinical_execution_authority text not null default 'not-authorized-live-care'
    check (clinical_execution_authority = 'not-authorized-live-care'),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  boundary text not null default
    'Protected Board Scorecards convert no-PHI protected metric trend reviews into internal rolling-quarter operating scorecards, finance-allocation readiness, buyer-segment cohort signals, competitive advantage tracking, and agent improvement priorities. They do not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, legal advice, valuation assurance, revenue guarantee, clinical validation, reimbursement assurance, compliance certification, production authorization, or live clinical execution approval.',
  check (secondary_trend_review_id is null or secondary_trend_review_id <> primary_trend_review_id),
  check (tertiary_trend_review_id is null or tertiary_trend_review_id <> primary_trend_review_id),
  check (tertiary_trend_review_id is null or secondary_trend_review_id is null or tertiary_trend_review_id <> secondary_trend_review_id)
);

create index if not exists protected_board_scorecards_tenant_created_at_idx
  on public.protected_board_scorecards(tenant_id, created_at desc);
create index if not exists protected_board_scorecards_workspace_created_at_idx
  on public.protected_board_scorecards(workspace_id, created_at desc);
create index if not exists protected_board_scorecards_primary_trend_idx
  on public.protected_board_scorecards(primary_trend_review_id);
create index if not exists protected_board_scorecards_created_by_idx
  on public.protected_board_scorecards(created_by);

alter table public.protected_board_scorecards enable row level security;
revoke all on public.protected_board_scorecards from public, anon, authenticated;
grant select on public.protected_board_scorecards to authenticated;

drop policy if exists protected_board_scorecards_governance_select
  on public.protected_board_scorecards;
create policy protected_board_scorecards_governance_select
on public.protected_board_scorecards
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
      'protected-board-scorecard-packet-downloaded'
    )
  );

create or replace function private.create_protected_board_scorecard(
  p_workspace_slug text,
  p_scorecard_input jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  primary_review public.protected_metric_trend_reviews%rowtype;
  secondary_review public.protected_metric_trend_reviews%rowtype;
  tertiary_review public.protected_metric_trend_reviews%rowtype;
  normalized_input jsonb := coalesce(p_scorecard_input, '{}'::jsonb);
  primary_review_id_value uuid;
  secondary_review_id_value uuid;
  tertiary_review_id_value uuid;
  secondary_review_id_text text;
  tertiary_review_id_text text;
  board_period_label_value text;
  buyer_segment_focus_value text;
  operator_attestation_value text;
  data_boundary_value text;
  allocation_profile_status_value text;
  review_note_value text;
  actor_role text;
  created_scorecard_id uuid;
  scorecard_state_value text;
  trend_review_count_value integer;
  rolling_quarter_metrics_value jsonb;
  finance_allocation_profile_value jsonb;
  all_buyer_segment_cohorts_value jsonb;
  buyer_segment_cohorts_value jsonb;
  competitive_advantages_value jsonb;
  agent_improvement_priorities_value jsonb;
  strategic_actions_value jsonb;
  recommendations_value jsonb;
  limitations_value jsonb;
  protected_boundary text :=
    'Protected Board Scorecards convert no-PHI protected metric trend reviews into internal rolling-quarter operating scorecards, finance-allocation readiness, buyer-segment cohort signals, competitive advantage tracking, and agent improvement priorities. They do not store PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, legal advice, valuation assurance, revenue guarantee, clinical validation, reimbursement assurance, compliance certification, production authorization, or live clinical execution approval.';
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
    raise exception 'protected-board-scorecard-invalid-payload';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(normalized_input) as supplied(key)
    where supplied.key <> all(array[
      'primaryTrendReviewId',
      'secondaryTrendReviewId',
      'tertiaryTrendReviewId',
      'boardPeriodLabel',
      'buyerSegmentFocus',
      'operatorAttestation',
      'dataBoundary',
      'allocationProfileStatus',
      'reviewNote'
    ])
  ) then
    raise exception 'protected-board-scorecard-unsupported-field';
  end if;

  board_period_label_value := trim(coalesce(normalized_input ->> 'boardPeriodLabel', ''));
  buyer_segment_focus_value := trim(coalesce(normalized_input ->> 'buyerSegmentFocus', ''));
  operator_attestation_value := trim(coalesce(normalized_input ->> 'operatorAttestation', ''));
  data_boundary_value := trim(coalesce(normalized_input ->> 'dataBoundary', ''));
  allocation_profile_status_value := trim(coalesce(normalized_input ->> 'allocationProfileStatus', ''));
  review_note_value := left(trim(coalesce(normalized_input ->> 'reviewNote', '')), 281);
  secondary_review_id_text := nullif(trim(coalesce(normalized_input ->> 'secondaryTrendReviewId', '')), '');
  tertiary_review_id_text := nullif(trim(coalesce(normalized_input ->> 'tertiaryTrendReviewId', '')), '');

  begin
    primary_review_id_value := (normalized_input ->> 'primaryTrendReviewId')::uuid;
    if secondary_review_id_text is not null then
      secondary_review_id_value := secondary_review_id_text::uuid;
    end if;
    if tertiary_review_id_text is not null then
      tertiary_review_id_value := tertiary_review_id_text::uuid;
    end if;
  exception when others then
    raise exception 'protected-board-scorecard-invalid-typed-field';
  end;

  if board_period_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:-]{2,95}$'
    or buyer_segment_focus_value not in (
      'multi-segment',
      'provider-operations',
      'payer-operations',
      'employer-population-health',
      'government-public-health',
      'global-health'
    )
    or operator_attestation_value <> 'finance-methodology-pending-no-phi-board-scorecard'
    or data_boundary_value <> 'synthetic-business-workflow-only'
    or allocation_profile_status_value <> 'finance-allocation-profile-pending'
    or char_length(review_note_value) > 280
    or secondary_review_id_value = primary_review_id_value
    or tertiary_review_id_value = primary_review_id_value
    or (
      tertiary_review_id_value is not null
      and secondary_review_id_value is not null
      and tertiary_review_id_value = secondary_review_id_value
    ) then
    raise exception 'protected-board-scorecard-validation-failed';
  end if;

  if board_period_label_value || ' ' || review_note_value ~*
    '(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|sk-[A-Za-z0-9_-]{12,}|sbp_[A-Za-z0-9_-]{12,}|bearer[[:space:]]+[A-Za-z0-9._-]+|patient[ _-]?(id|identifier|mrn)|member[ _-]?(id|identifier)|medical record|protected health information|payer member|diagnosis code|social security|audited financial|investment recommendation|securities offering|valuation guarantee|revenue guarantee)' then
    raise exception 'protected-board-scorecard-prohibited-content';
  end if;

  select *
  into primary_review
  from public.protected_metric_trend_reviews review
  where review.id = primary_review_id_value
    and review.workspace_id = selected_workspace.id
    and review.tenant_id = selected_workspace.tenant_id;

  if primary_review.id is null then
    raise exception 'protected-board-scorecard-trend-review-not-found';
  end if;

  if secondary_review_id_value is not null then
    select *
    into secondary_review
    from public.protected_metric_trend_reviews review
    where review.id = secondary_review_id_value
      and review.workspace_id = selected_workspace.id
      and review.tenant_id = selected_workspace.tenant_id;

    if secondary_review.id is null then
      raise exception 'protected-board-scorecard-trend-review-not-found';
    end if;
  end if;

  if tertiary_review_id_value is not null then
    select *
    into tertiary_review
    from public.protected_metric_trend_reviews review
    where review.id = tertiary_review_id_value
      and review.workspace_id = selected_workspace.id
      and review.tenant_id = selected_workspace.tenant_id;

    if tertiary_review.id is null then
      raise exception 'protected-board-scorecard-trend-review-not-found';
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
    raise exception 'protected-board-scorecard-role-denied';
  end if;

  trend_review_count_value :=
    1
    + case when secondary_review_id_value is null then 0 else 1 end
    + case when tertiary_review_id_value is null then 0 else 1 end;

  if primary_review.board_trend_state = 'insufficient-data'
    or secondary_review.board_trend_state = 'insufficient-data'
    or tertiary_review.board_trend_state = 'insufficient-data' then
    scorecard_state_value := 'insufficient-data';
  elsif primary_review.board_trend_state = 'watch'
    or secondary_review.board_trend_state = 'watch'
    or tertiary_review.board_trend_state = 'watch' then
    scorecard_state_value := 'watch';
  elsif primary_review.board_trend_state = 'improving'
    or secondary_review.board_trend_state = 'improving'
    or tertiary_review.board_trend_state = 'improving' then
    scorecard_state_value := 'scale-ready';
  else
    scorecard_state_value := 'optimize';
  end if;

  with selected_reviews as (
    select *
    from public.protected_metric_trend_reviews review
    where review.id in (
      primary_review_id_value,
      coalesce(secondary_review_id_value, primary_review_id_value),
      coalesce(tertiary_review_id_value, primary_review_id_value)
    )
      and review.workspace_id = selected_workspace.id
      and review.tenant_id = selected_workspace.tenant_id
  ),
  metric_rows as (
    select
      metric ->> 'metricId' as metric_id,
      max(metric ->> 'label') as metric_label,
      max(metric ->> 'direction') as metric_direction,
      (array_agg((metric ->> 'current')::numeric order by selected_reviews.created_at desc))[1] as latest_value,
      (array_agg((metric ->> 'percentChange')::numeric order by selected_reviews.created_at desc))[1] as latest_percent_change,
      count(*) filter (where metric ->> 'state' = 'improving') as improving_count,
      count(*) filter (where metric ->> 'state' = 'stable') as stable_count,
      count(*) filter (where metric ->> 'state' = 'watch') as watch_count,
      count(*) filter (where metric ->> 'state' = 'insufficient-data') as insufficient_data_count
    from selected_reviews
    cross join lateral jsonb_array_elements(selected_reviews.trend_metrics) metric
    group by metric ->> 'metricId'
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'metricId', metric_id,
        'label', metric_label,
        'direction', metric_direction,
        'latestValue', latest_value,
        'latestPercentChange', latest_percent_change,
        'improvingCount', improving_count,
        'stableCount', stable_count,
        'watchCount', watch_count,
        'insufficientDataCount', insufficient_data_count
      )
      order by metric_id
    ),
    '[]'::jsonb
  )
  into rolling_quarter_metrics_value
  from metric_rows;

  finance_allocation_profile_value := jsonb_build_object(
    'status', 'finance-allocation-profile-pending',
    'currentMethodology', 'model-cost-only',
    'components', jsonb_build_array(
      jsonb_build_object('component', 'Model cost', 'status', 'available', 'boundary', 'Protected model-cost signals only.'),
      jsonb_build_object('component', 'Reviewer labor', 'status', 'pending-finance-methodology', 'boundary', 'Pending finance-approved methodology. Do not use for audited reporting, margin reporting, valuation, securities materials, or external financial claims.'),
      jsonb_build_object('component', 'Implementation labor', 'status', 'pending-finance-methodology', 'boundary', 'Pending finance-approved methodology. Do not use for audited reporting, margin reporting, valuation, securities materials, or external financial claims.'),
      jsonb_build_object('component', 'Infrastructure', 'status', 'pending-finance-methodology', 'boundary', 'Pending finance-approved methodology. Do not use for audited reporting, margin reporting, valuation, securities materials, or external financial claims.'),
      jsonb_build_object('component', 'Support and success', 'status', 'pending-finance-methodology', 'boundary', 'Pending finance-approved methodology. Do not use for audited reporting, margin reporting, valuation, securities materials, or external financial claims.'),
      jsonb_build_object('component', 'Delivery operations', 'status', 'pending-finance-methodology', 'boundary', 'Pending finance-approved methodology. Do not use for audited reporting, margin reporting, valuation, securities materials, or external financial claims.')
    ),
    'nextGate', 'Finance must approve labor, infrastructure, support, delivery, and reviewer allocation before scorecards can support gross-margin or full cost-per-workflow reporting.'
  );

  all_buyer_segment_cohorts_value := jsonb_build_array(
    jsonb_build_object('segment', 'provider-operations', 'label', 'Provider operations', 'motion', 'Use workflow friction, documentation quality, access bottlenecks, and governed automation proof to sell operational pilots.', 'proofUse', 'Board scorecard packets can support provider executive demos after counsel and finance review.', 'boundary', 'No clinical outcome, live-care authorization, or autonomous diagnosis claim.'),
    jsonb_build_object('segment', 'payer-operations', 'label', 'Payer operations', 'motion', 'Use denial-risk, prior-authorization support, policy evidence, and revenue-leakage signals for payer operations pilots.', 'proofUse', 'Scorecards can show protected workflow discipline before payer integration or submission authority.', 'boundary', 'No reimbursement guarantee, coverage determination, coding authority, or payer submission.'),
    jsonb_build_object('segment', 'employer-population-health', 'label', 'Employer and population health', 'motion', 'Use care-gap, access, risk-horizon, and navigation readiness signals for benefits and population intelligence buyers.', 'proofUse', 'Scorecards can package no-PHI cohort strategy without employee or patient-level data.', 'boundary', 'No patient outreach, risk scoring, benefits determination, or medical advice.'),
    jsonb_build_object('segment', 'government-public-health', 'label', 'Government and public health', 'motion', 'Use interoperability, access bottleneck, governance, and sovereign deployment readiness for public-sector pilots.', 'proofUse', 'Scorecards can support procurement conversations around trust, audit, and operational intelligence.', 'boundary', 'No public-health surveillance claim, emergency triage, regulatory approval, or sovereign authorization.'),
    jsonb_build_object('segment', 'global-health', 'label', 'Global health', 'motion', 'Use multilingual readiness, low-PHI deployment paths, and governed workflow evidence for global access partnerships.', 'proofUse', 'Scorecards can prioritize channels where synthetic pilots create value without moving sensitive clinical data.', 'boundary', 'No cross-border data transfer authorization, clinical validation, or care-delivery approval.')
  );

  if buyer_segment_focus_value = 'multi-segment' then
    buyer_segment_cohorts_value := all_buyer_segment_cohorts_value;
  else
    select coalesce(jsonb_agg(cohort), '[]'::jsonb)
    into buyer_segment_cohorts_value
    from jsonb_array_elements(all_buyer_segment_cohorts_value) cohort
    where cohort ->> 'segment' = buyer_segment_focus_value;
  end if;

  competitive_advantages_value := jsonb_build_array(
    'SCRIMED links workflow evidence to board operating discipline instead of depending on generic AI usage claims.',
    'Scorecards preserve no-PHI, AAL2, tenant-scoped, write-before-release evidence for enterprise diligence.',
    'Buyer-segment cohorts turn proof into specific provider, payer, employer, government, and global-health motions without weakening safety boundaries.',
    'Agent improvement priorities keep the operating system adaptive while retaining human review.'
  );

  agent_improvement_priorities_value := jsonb_build_array(
    'Route watch-state metrics into TrustQA review, model-router budget checks, and workflow retry analysis.',
    'Promote scale-ready workflows into reusable buyer demos, agent playbooks, and implementation templates.',
    'Keep all degraded trends behind human review instead of increasing autonomous execution.',
    'Use scorecard packets to prioritize product roadmap work that compounds trust, interoperability, and measurable operational value.'
  );

  strategic_actions_value := jsonb_build_array(
    case
      when scorecard_state_value = 'watch' then
        'Hold expansion until finance/product review resolves watch-state variance.'
      else
        'Prepare buyer-segment operating motions using scorecard evidence after finance and counsel review.'
    end,
    'Convert scorecard output into operator tasks for Agent Commander, TrustQA, and sales readiness.',
    'Maintain external-use approval gates before sharing scorecards in fundraising, PR, marketing, advertising, or buyer diligence.'
  );

  recommendations_value := jsonb_build_array(
    'Approve full cost allocation before reporting gross margin, full cost per workflow, or margin by offer.',
    'Use scorecards internally to guide product, sales, agent, and market-expansion decisions.',
    'Keep clinical, privacy, security, legal, finance, and executive review gates active before production or external claims.'
  );

  limitations_value := jsonb_build_array(
    protected_boundary,
    'Scorecards compare protected no-PHI trend reviews only and do not prove clinical outcomes, reimbursement outcomes, audited financial performance, market share, or valuation.',
    'Allocation profiles remain pending until finance approves labor, infrastructure, support, delivery, implementation, and reviewer allocation methodology.',
    'Buyer-segment cohorts are strategy signals, not revenue guarantees, investment recommendations, legal advice, or advertising claim substantiation.'
  );

  insert into public.protected_board_scorecards (
    tenant_id,
    workspace_id,
    primary_trend_review_id,
    secondary_trend_review_id,
    tertiary_trend_review_id,
    board_period_label,
    scorecard_state,
    trend_review_count,
    rolling_quarter_metrics,
    finance_allocation_profile,
    buyer_segment_focus,
    buyer_segment_cohorts,
    competitive_advantages,
    agent_improvement_priorities,
    strategic_actions,
    recommendations,
    limitations,
    operator_attestation,
    review_note,
    data_boundary,
    allocation_profile_status,
    financial_reporting_authority,
    securities_authority,
    clinical_execution_authority,
    created_by,
    boundary
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    primary_review.id,
    secondary_review_id_value,
    tertiary_review_id_value,
    board_period_label_value,
    scorecard_state_value,
    trend_review_count_value,
    rolling_quarter_metrics_value,
    finance_allocation_profile_value,
    buyer_segment_focus_value,
    buyer_segment_cohorts_value,
    competitive_advantages_value,
    agent_improvement_priorities_value,
    strategic_actions_value,
    recommendations_value,
    limitations_value,
    operator_attestation_value,
    review_note_value,
    data_boundary_value,
    allocation_profile_status_value,
    'not-audited-financial-report',
    'not-securities-offering-material',
    'not-authorized-live-care',
    (select auth.uid()),
    protected_boundary
  )
  returning id into created_scorecard_id;

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
    'protected-board-scorecard-created',
    jsonb_build_object(
      'scorecardId', created_scorecard_id,
      'actorRole', actor_role,
      'primaryTrendReviewId', primary_review.id,
      'secondaryTrendReviewId', secondary_review_id_value,
      'tertiaryTrendReviewId', tertiary_review_id_value,
      'boardPeriodLabel', board_period_label_value,
      'scorecardState', scorecard_state_value,
      'buyerSegmentFocus', buyer_segment_focus_value,
      'allocationProfileStatus', allocation_profile_status_value,
      'assuranceLevel', 'aal2',
      'syntheticOnly', true,
      'metadataOnly', true,
      'noPhi', true,
      'financialReportingAuthority', 'not-audited-financial-report',
      'securitiesAuthority', 'not-securities-offering-material',
      'clinicalExecutionAuthority', 'not-authorized-live-care'
    )
  );

  return created_scorecard_id;
end;
$$;

create or replace function public.create_protected_board_scorecard(
  p_workspace_slug text,
  p_scorecard_input jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.create_protected_board_scorecard(
    p_workspace_slug,
    p_scorecard_input
  );
$$;

create or replace function private.record_protected_board_scorecard_packet_download(
  p_workspace_slug text,
  p_scorecard_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_scorecard public.protected_board_scorecards%rowtype;
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
  into selected_scorecard
  from public.protected_board_scorecards scorecard
  where scorecard.id = p_scorecard_id
    and scorecard.workspace_id = selected_workspace.id
    and scorecard.tenant_id = selected_workspace.tenant_id;

  if selected_scorecard.id is null then
    raise exception 'protected-board-scorecard-not-found';
  end if;

  select membership.role
  into actor_role
  from public.pilot_memberships membership
  where membership.tenant_id = selected_workspace.tenant_id
    and membership.user_id = (select auth.uid())
    and membership.role in ('tenant-admin', 'pilot-lead', 'reviewer')
  limit 1;

  if actor_role is null then
    raise exception 'protected-board-scorecard-role-denied';
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
    'protected-board-scorecard-packet-downloaded',
    jsonb_build_object(
      'scorecardId', selected_scorecard.id,
      'actorRole', actor_role,
      'format', 'text/markdown',
      'packetType', 'protected-board-scorecard-packet',
      'scorecardState', selected_scorecard.scorecard_state,
      'primaryTrendReviewId', selected_scorecard.primary_trend_review_id,
      'secondaryTrendReviewId', selected_scorecard.secondary_trend_review_id,
      'tertiaryTrendReviewId', selected_scorecard.tertiary_trend_review_id,
      'buyerSegmentFocus', selected_scorecard.buyer_segment_focus,
      'allocationProfileStatus', selected_scorecard.allocation_profile_status,
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

create or replace function public.record_protected_board_scorecard_packet_download(
  p_workspace_slug text,
  p_scorecard_id uuid
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_protected_board_scorecard_packet_download(
    p_workspace_slug,
    p_scorecard_id
  );
$$;

revoke all on function private.create_protected_board_scorecard(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.create_protected_board_scorecard(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function private.record_protected_board_scorecard_packet_download(text, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.record_protected_board_scorecard_packet_download(text, uuid)
  from public, anon, authenticated, service_role;

grant execute on function private.create_protected_board_scorecard(text, jsonb)
  to authenticated;
grant execute on function public.create_protected_board_scorecard(text, jsonb)
  to authenticated;
grant execute on function private.record_protected_board_scorecard_packet_download(text, uuid)
  to authenticated;
grant execute on function public.record_protected_board_scorecard_packet_download(text, uuid)
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
    'schemaVersion', '2026-06-19.5',
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
    'protectedBoardScorecardPackets', 'aal2-audited-board-scorecard-packets-no-phi'
  );
$$;

comment on table public.protected_board_scorecards is
  'Tenant-scoped no-PHI protected board scorecards for rolling-quarter operating review, finance-allocation readiness, buyer-segment cohort strategy, competitive advantage tracking, and agent improvement loops. RLS select requires authenticated AAL2 governance context and tenant membership. Writes require guarded RPC. No PHI, patient identifiers, payer member data, live clinical records, source contracts, secrets, credentials, audited financial statements, securities offering material, investment advice, accounting advice, tax advice, legal advice, valuation assurance, revenue guarantee, clinical validation, reimbursement assurance, compliance certification, production authorization, or live clinical execution approval is permitted.';
comment on function private.create_protected_board_scorecard(text, jsonb) is
  'Creates a no-PHI protected board scorecard from one to three tenant-scoped trend reviews and records an append-only audit event after AAL2 governance authorization.';
comment on function private.record_protected_board_scorecard_packet_download(text, uuid) is
  'Records an append-only audit event before releasing a protected board scorecard packet for a no-PHI board scorecard.';
