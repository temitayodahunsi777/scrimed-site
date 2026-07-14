alter table private.scrimed_work_artifacts
  drop constraint if exists scrimed_work_artifacts_review_status_check;

alter table private.scrimed_work_artifacts
  add constraint scrimed_work_artifacts_review_status_check check (
    review_status in ('draft', 'human_review_required', 'reviewed', 'blocked')
  );

alter table private.scrimed_work_audit_events
  drop constraint if exists scrimed_work_audit_events_event_type_check;

alter table private.scrimed_work_audit_events
  add constraint scrimed_work_audit_events_event_type_check check (
    event_type in (
      'session-recorded',
      'session-idempotency-reused',
      'session-transitioned',
      'artifact-recorded',
      'artifact-idempotency-reused',
      'artifact-reviewed',
      'artifact-review-idempotency-reused'
    )
  );

create table if not exists private.scrimed_work_artifact_reviews (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  scrimed_work_session_id uuid not null references private.scrimed_work_sessions(id) on delete restrict,
  scrimed_work_artifact_id uuid not null references private.scrimed_work_artifacts(id) on delete restrict,
  reviewer_user_id uuid not null references auth.users(id) on delete restrict,
  disposition text not null check (
    disposition in ('approved_for_internal_use', 'changes_requested', 'rejected')
  ),
  reason_code text not null check (
    reason_code in (
      'evidence_and_boundaries_confirmed',
      'missing_required_evidence',
      'scope_or_policy_conflict',
      'unsafe_or_unsupported_claim',
      'revision_required'
    )
  ),
  reviewer_identity_hash text not null check (
    reviewer_identity_hash ~ '^scrimed-reviewer-[a-f0-9]{64}$'
  ),
  review_decision_hash text not null check (
    review_decision_hash ~ '^scrimed-work-artifact-review-[a-f0-9]{64}$'
  ),
  request_fingerprint text not null check (request_fingerprint ~ '^[a-f0-9]{64}$'),
  idempotency_key text not null check (
    char_length(idempotency_key) between 8 and 160
    and idempotency_key !~ '[[:space:]]'
  ),
  verification_eligible boolean not null default false,
  external_distribution_allowed boolean not null default false check (not external_distribution_allowed),
  payer_submission_allowed boolean not null default false check (not payer_submission_allowed),
  audit_event_id uuid references private.scrimed_work_audit_events(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (workspace_id, idempotency_key)
);

create index if not exists scrimed_work_artifact_reviews_session_created_idx
  on private.scrimed_work_artifact_reviews(scrimed_work_session_id, created_at desc);
create index if not exists scrimed_work_artifact_reviews_artifact_created_idx
  on private.scrimed_work_artifact_reviews(scrimed_work_artifact_id, created_at desc);
create index if not exists scrimed_work_artifact_reviews_tenant_created_idx
  on private.scrimed_work_artifact_reviews(tenant_id, created_at desc);
create index if not exists scrimed_work_artifact_reviews_reviewer_created_idx
  on private.scrimed_work_artifact_reviews(reviewer_user_id, created_at desc);
create index if not exists scrimed_work_artifact_reviews_audit_event_idx
  on private.scrimed_work_artifact_reviews(audit_event_id)
  where audit_event_id is not null;

alter table private.scrimed_work_artifact_reviews enable row level security;
revoke all on private.scrimed_work_artifact_reviews from public, anon, authenticated;

drop policy if exists scrimed_work_artifact_reviews_deny_all
on private.scrimed_work_artifact_reviews;
create policy scrimed_work_artifact_reviews_deny_all
on private.scrimed_work_artifact_reviews
as restrictive
for all
to public
using (false)
with check (false);

create or replace function private.review_scrimed_work_artifact(
  p_workspace_slug text,
  p_session_id text,
  p_artifact_id text,
  p_artifact jsonb,
  p_disposition text,
  p_reason_code text,
  p_reviewer_identity_hash text,
  p_review_decision_hash text,
  p_idempotency_key text,
  p_audit_event jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_session private.scrimed_work_sessions%rowtype;
  updated_session private.scrimed_work_sessions%rowtype;
  selected_artifact private.scrimed_work_artifacts%rowtype;
  selected_review private.scrimed_work_artifact_reviews%rowtype;
  created_review private.scrimed_work_artifact_reviews%rowtype;
  normalized_artifact jsonb := coalesce(p_artifact, '{}'::jsonb);
  updated_artifacts jsonb;
  created_event_id uuid;
  request_fingerprint text;
  artifact_match_count integer;
  boundary_value text := private.scrimed_work_boundary();
  verification_eligible boolean;
  expected_review_status text;
  expected_reviewer_identity_hash text;
  expected_review_decision_hash text;
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['reviewer']
  );

  if p_disposition not in ('approved_for_internal_use', 'changes_requested', 'rejected') then
    raise exception 'scrimed-work-artifact-review-invalid-disposition';
  end if;

  if p_reason_code not in (
    'evidence_and_boundaries_confirmed',
    'missing_required_evidence',
    'scope_or_policy_conflict',
    'unsafe_or_unsupported_claim',
    'revision_required'
  ) then
    raise exception 'scrimed-work-artifact-review-invalid-reason';
  end if;

  if p_disposition = 'approved_for_internal_use'
    and p_reason_code <> 'evidence_and_boundaries_confirmed' then
    raise exception 'scrimed-work-artifact-review-invalid-approval-reason';
  end if;

  if coalesce(p_idempotency_key, '') = ''
    or char_length(p_idempotency_key) > 160
    or p_idempotency_key ~ '[[:space:]]' then
    raise exception 'scrimed-work-idempotency-required';
  end if;

  if jsonb_typeof(normalized_artifact) <> 'object'
    or pg_column_size(normalized_artifact) > 131072 then
    raise exception 'scrimed-work-invalid-artifact';
  end if;

  perform private.reject_scrimed_work_prohibited_text(
    concat_ws(
      ' ',
      p_session_id,
      p_artifact_id,
      p_disposition,
      p_reason_code,
      p_reviewer_identity_hash,
      p_review_decision_hash,
      normalized_artifact::text
    )
  );

  select *
  into selected_session
  from private.scrimed_work_sessions
  where workspace_id = selected_workspace.id
    and session_id = p_session_id
  for update;

  if selected_session.id is null then
    raise exception 'scrimed-work-session-not-found';
  end if;

  if selected_session.status <> 'verifying' then
    raise exception 'scrimed-work-artifact-review-state-conflict';
  end if;

  if selected_session.created_by = (select auth.uid()) then
    raise exception 'scrimed-work-independent-reviewer-required';
  end if;

  expected_reviewer_identity_hash := 'scrimed-reviewer-' || encode(
    extensions.digest(
      concat_ws(
        '|',
        (select auth.uid())::text,
        selected_workspace.tenant_id::text,
        'reviewer',
        'scrimed-work-artifact-review-v2026-07-13'
      ),
      'sha256'
    ),
    'hex'
  );

  if p_reviewer_identity_hash <> expected_reviewer_identity_hash then
    raise exception 'scrimed-work-artifact-review-identity-hash-conflict';
  end if;

  if not exists (
    select 1
    from jsonb_array_elements(
      coalesce(selected_session.session_payload -> 'approvalCheckpoints', '[]'::jsonb)
    ) checkpoint
  ) or exists (
    select 1
    from jsonb_array_elements(
      coalesce(selected_session.session_payload -> 'approvalCheckpoints', '[]'::jsonb)
    ) checkpoint
    where checkpoint ->> 'status' <> 'approved'
  ) then
    raise exception 'scrimed-work-artifact-review-approval-required';
  end if;

  select *
  into selected_artifact
  from private.scrimed_work_artifacts
  where workspace_id = selected_workspace.id
    and scrimed_work_session_id = selected_session.id
    and artifact_id = p_artifact_id
  for update;

  if selected_artifact.id is null then
    raise exception 'scrimed-work-artifact-not-found';
  end if;

  if selected_artifact.created_by = (select auth.uid()) then
    raise exception 'scrimed-work-independent-reviewer-required';
  end if;

  if normalized_artifact ->> 'artifactId' <> selected_artifact.artifact_id
    or normalized_artifact ->> 'sessionId' <> selected_session.session_id
    or normalized_artifact ->> 'type' <> selected_artifact.artifact_type
    or (
      normalized_artifact - array['reviewStatus', 'verification', 'reviewMetadata']::text[]
    ) <> (
      selected_artifact.artifact_payload - array['reviewStatus', 'verification', 'reviewMetadata']::text[]
    ) then
    raise exception 'scrimed-work-artifact-review-mutation-scope-violation';
  end if;

  verification_eligible := coalesce(
    (normalized_artifact #>> '{verification,eligibleForCompletion}')::boolean,
    false
  );
  expected_review_status := case
    when p_disposition = 'approved_for_internal_use' then 'reviewed'
    else 'blocked'
  end;

  if normalized_artifact ->> 'reviewStatus' <> expected_review_status
    or normalized_artifact #>> '{reviewMetadata,disposition}' <> p_disposition
    or normalized_artifact #>> '{reviewMetadata,reasonCode}' <> p_reason_code
    or normalized_artifact #>> '{reviewMetadata,reviewerIdentityHash}' <> p_reviewer_identity_hash
    or coalesce((normalized_artifact #>> '{exportMetadata,exportable}')::boolean, true)
    or coalesce((normalized_artifact #>> '{exportMetadata,exportRequiresHumanReview}')::boolean, false) is not true
    or coalesce((normalized_artifact #>> '{exportMetadata,noPhiConfirmed}')::boolean, false) is not true
    or coalesce((normalized_artifact #>> '{reviewMetadata,externalDistributionAllowed}')::boolean, true)
    or coalesce((normalized_artifact #>> '{reviewMetadata,payerSubmissionAllowed}')::boolean, true) then
    raise exception 'scrimed-work-artifact-review-boundary-violation';
  end if;

  if p_disposition = 'approved_for_internal_use' and not verification_eligible then
    raise exception 'scrimed-work-artifact-review-verification-required';
  end if;

  expected_review_decision_hash := 'scrimed-work-artifact-review-' || encode(
    extensions.digest(
      concat_ws(
        '|',
        p_session_id,
        p_artifact_id,
        p_disposition,
        p_reason_code,
        p_reviewer_identity_hash,
        verification_eligible::text,
        'scrimed-work-artifact-review-v2026-07-13'
      ),
      'sha256'
    ),
    'hex'
  );

  if p_review_decision_hash <> expected_review_decision_hash
    or normalized_artifact #>> '{reviewMetadata,decisionHash}' <> expected_review_decision_hash then
    raise exception 'scrimed-work-artifact-review-invalid-decision-hash';
  end if;

  request_fingerprint := encode(
    extensions.digest(
      concat_ws(
        '|',
        p_session_id,
        p_artifact_id,
        p_disposition,
        p_reason_code,
        p_reviewer_identity_hash,
        p_review_decision_hash,
        normalized_artifact::text
      ),
      'sha256'
    ),
    'hex'
  );

  insert into private.scrimed_work_artifact_reviews (
    tenant_id,
    workspace_id,
    scrimed_work_session_id,
    scrimed_work_artifact_id,
    reviewer_user_id,
    disposition,
    reason_code,
    reviewer_identity_hash,
    review_decision_hash,
    request_fingerprint,
    idempotency_key,
    verification_eligible
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    selected_session.id,
    selected_artifact.id,
    (select auth.uid()),
    p_disposition,
    p_reason_code,
    p_reviewer_identity_hash,
    p_review_decision_hash,
    request_fingerprint,
    p_idempotency_key,
    verification_eligible
  )
  on conflict (workspace_id, idempotency_key) do nothing
  returning * into created_review;

  if created_review.id is null then
    select *
    into selected_review
    from private.scrimed_work_artifact_reviews
    where workspace_id = selected_workspace.id
      and idempotency_key = p_idempotency_key;

    if selected_review.scrimed_work_session_id <> selected_session.id
      or selected_review.scrimed_work_artifact_id <> selected_artifact.id
      or selected_review.reviewer_user_id <> (select auth.uid())
      or selected_review.disposition <> p_disposition
      or selected_review.reason_code <> p_reason_code
      or selected_review.reviewer_identity_hash <> p_reviewer_identity_hash
      or selected_review.review_decision_hash <> p_review_decision_hash
      or selected_review.request_fingerprint <> request_fingerprint then
      raise exception 'scrimed-work-idempotency-conflict';
    end if;

    insert into private.scrimed_work_audit_events (
      tenant_id,
      workspace_id,
      scrimed_work_session_id,
      scrimed_work_artifact_id,
      actor_user_id,
      event_type,
      event_metadata,
      boundary
    )
    values (
      selected_workspace.tenant_id,
      selected_workspace.id,
      selected_session.id,
      selected_artifact.id,
      (select auth.uid()),
      'artifact-review-idempotency-reused',
      coalesce(p_audit_event, '{}'::jsonb) || jsonb_build_object(
        'sessionId', p_session_id,
        'artifactId', p_artifact_id,
        'reviewDecisionHash', p_review_decision_hash,
        'idempotencyKey', p_idempotency_key,
        'syntheticOnly', true,
        'noPhi', true,
        'assuranceLevel', 'aal2'
      ),
      boundary_value
    )
    returning id into created_event_id;

    return jsonb_build_object(
      'record', private.scrimed_work_session_json(selected_session),
      'reviewId', selected_review.id,
      'eventId', created_event_id,
      'reviewed', true,
      'idempotentReplay', true,
      'boundary', boundary_value
    );
  end if;

  select count(*) filter (where item_value ->> 'artifactId' = p_artifact_id),
         jsonb_agg(
           case
             when item_value ->> 'artifactId' = p_artifact_id then normalized_artifact
             else item_value
           end
           order by ordinality
         )
  into artifact_match_count, updated_artifacts
  from jsonb_array_elements(
    coalesce(selected_session.session_payload -> 'artifacts', '[]'::jsonb)
  ) with ordinality as artifact_item(item_value, ordinality);

  if artifact_match_count <> 1 then
    raise exception 'scrimed-work-artifact-review-session-binding-required';
  end if;

  update private.scrimed_work_artifacts
  set review_status = expected_review_status,
      artifact_payload = normalized_artifact
  where id = selected_artifact.id;

  update private.scrimed_work_sessions
  set session_payload = jsonb_set(
        jsonb_set(session_payload, '{artifacts}', updated_artifacts, false),
        '{updatedAt}',
        to_jsonb(to_char(now() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
        true
      ),
      updated_at = now()
  where id = selected_session.id
  returning * into updated_session;

  insert into private.scrimed_work_audit_events (
    tenant_id,
    workspace_id,
    scrimed_work_session_id,
    scrimed_work_artifact_id,
    actor_user_id,
    event_type,
    event_metadata,
    boundary
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    updated_session.id,
    selected_artifact.id,
    (select auth.uid()),
    'artifact-reviewed',
    coalesce(p_audit_event, '{}'::jsonb) || jsonb_build_object(
      'sessionId', p_session_id,
      'artifactId', p_artifact_id,
      'disposition', p_disposition,
      'reasonCode', p_reason_code,
      'reviewerIdentityHash', p_reviewer_identity_hash,
      'reviewDecisionHash', p_review_decision_hash,
      'verificationEligible', verification_eligible,
      'externalDistributionAllowed', false,
      'payerSubmissionAllowed', false,
      'idempotencyKey', p_idempotency_key,
      'syntheticOnly', true,
      'noPhi', true,
      'assuranceLevel', 'aal2'
    ),
    boundary_value
  )
  returning id into created_event_id;

  update private.scrimed_work_artifact_reviews
  set audit_event_id = created_event_id
  where id = created_review.id;

  return jsonb_build_object(
    'record', private.scrimed_work_session_json(updated_session),
    'reviewId', created_review.id,
    'eventId', created_event_id,
    'reviewed', true,
    'idempotentReplay', false,
    'boundary', boundary_value
  );
end;
$$;

create or replace function public.review_scrimed_work_artifact(
  p_workspace_slug text,
  p_session_id text,
  p_artifact_id text,
  p_artifact jsonb,
  p_disposition text,
  p_reason_code text,
  p_reviewer_identity_hash text,
  p_review_decision_hash text,
  p_idempotency_key text,
  p_audit_event jsonb default '{}'::jsonb
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.review_scrimed_work_artifact(
    p_workspace_slug,
    p_session_id,
    p_artifact_id,
    p_artifact,
    p_disposition,
    p_reason_code,
    p_reviewer_identity_hash,
    p_review_decision_hash,
    p_idempotency_key,
    p_audit_event
  );
$$;

revoke all on function private.review_scrimed_work_artifact(
  text, text, text, jsonb, text, text, text, text, text, jsonb
) from public, anon, authenticated;
revoke all on function public.review_scrimed_work_artifact(
  text, text, text, jsonb, text, text, text, text, text, jsonb
) from public, anon, authenticated;

grant execute on function private.review_scrimed_work_artifact(
  text, text, text, jsonb, text, text, text, text, text, jsonb
) to authenticated;
grant execute on function public.review_scrimed_work_artifact(
  text, text, text, jsonb, text, text, text, text, text, jsonb
) to authenticated;

comment on table private.scrimed_work_artifact_reviews is
  'Append-only AAL2 reviewer dispositions for metadata-only SCRIMED Work artifacts. Direct access is denied and external distribution remains blocked.';

comment on function private.review_scrimed_work_artifact(
  text, text, text, jsonb, text, text, text, text, text, jsonb
) is
  'AAL2 reviewer-only artifact disposition with separation of duties, immutable payload checks, mandatory verification, idempotency, and no external-use authority.';

comment on function public.review_scrimed_work_artifact(
  text, text, text, jsonb, text, text, text, text, text, jsonb
) is
  'Security-invoker wrapper for governed SCRIMED Work artifact review. It grants no payer, EHR, clinical, connector, certification, or go-live authority.';
