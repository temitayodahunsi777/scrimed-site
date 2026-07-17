alter table private.scrimed_work_audit_events
  drop constraint if exists scrimed_work_audit_events_event_type_check;

alter table private.scrimed_work_audit_events
  add constraint scrimed_work_audit_events_event_type_check
  check (
    event_type in (
      'session-recorded',
      'session-idempotency-reused',
      'session-transitioned',
      'session-evidence-bound',
      'artifact-recorded',
      'artifact-idempotency-reused',
      'artifact-reviewed',
      'artifact-review-idempotency-reused',
      'artifact-review-queue-viewed',
      'session-completion-queue-viewed',
      'session-completion-evidence-viewed'
    )
  );

create index if not exists scrimed_work_sessions_completed_evidence_idx
  on private.scrimed_work_sessions(workspace_id, updated_at desc, id desc)
  where status = 'completed'
    and input_classification = 'synthetic-no-phi'
    and no_phi_assertion is true
    and human_review_required is true;

create or replace function private.list_scrimed_work_completion_evidence(
  p_workspace_slug text,
  p_limit integer default 25
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  evidence_items jsonb := '[]'::jsonb;
  created_event_id uuid;
  member_role text;
  boundary_value text := private.scrimed_work_boundary();
  policy_version constant text := 'scrimed-work-completion-evidence-v2026-07-16';
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead']
  );

  if p_limit is null or p_limit < 1 or p_limit > 50 then
    raise exception 'scrimed-work-completion-evidence-invalid-limit';
  end if;

  select membership.role
  into member_role
  from public.pilot_memberships membership
  where membership.tenant_id = selected_workspace.tenant_id
    and membership.user_id = (select auth.uid())
    and membership.role in ('tenant-admin', 'pilot-lead');

  if member_role is null then
    raise exception 'scrimed-work-completion-evidence-operator-required';
  end if;

  with candidates as (
    select
      session.session_id,
      session.workspace_domain,
      session.risk_level,
      session.status as session_status,
      artifact.artifact_id,
      artifact.artifact_type,
      artifact.title,
      artifact.review_status,
      review.disposition,
      review.verification_eligible,
      review.audit_event_id as review_event_id,
      review.review_decision_hash,
      review.created_at as reviewed_at,
      completion_event.id as completion_event_id,
      completion_event.event_metadata ->> 'lifecycleDecisionHash' as lifecycle_decision_hash,
      completion_event.created_at as completed_at,
      exists (
        select 1
        from jsonb_array_elements(
          case
            when jsonb_typeof(session.session_payload -> 'evidence') = 'array'
              then session.session_payload -> 'evidence'
            else '[]'::jsonb
          end
        ) evidence
        where lower(trim(coalesce(evidence ->> 'title', ''))) = 'independent reviewer approval'
          or lower(trim(coalesce(evidence ->> 'supports', ''))) = 'independent reviewer approval'
      ) as review_evidence_bound
    from private.scrimed_work_sessions session
    join private.scrimed_work_artifacts artifact
      on artifact.scrimed_work_session_id = session.id
     and artifact.workspace_id = session.workspace_id
     and artifact.tenant_id = session.tenant_id
    join lateral (
      select artifact_review.*
      from private.scrimed_work_artifact_reviews artifact_review
      where artifact_review.scrimed_work_session_id = session.id
        and artifact_review.scrimed_work_artifact_id = artifact.id
        and artifact_review.workspace_id = session.workspace_id
        and artifact_review.tenant_id = session.tenant_id
        and artifact_review.reviewer_user_id <> session.created_by
      order by artifact_review.created_at desc, artifact_review.id desc
      limit 1
    ) review on true
    join lateral (
      select audit_event.*
      from private.scrimed_work_audit_events audit_event
      where audit_event.scrimed_work_session_id = session.id
        and audit_event.workspace_id = session.workspace_id
        and audit_event.tenant_id = session.tenant_id
        and audit_event.event_type = 'session-transitioned'
        and audit_event.event_metadata ->> 'lifecycleAction' = 'complete'
        and audit_event.event_metadata ->> 'status' = 'completed'
      order by audit_event.created_at desc, audit_event.id desc
      limit 1
    ) completion_event on true
    where session.workspace_id = selected_workspace.id
      and session.tenant_id = selected_workspace.tenant_id
      and session.input_classification = 'synthetic-no-phi'
      and session.no_phi_assertion is true
      and session.human_review_required is true
      and session.status = 'completed'
      and artifact.no_phi_assertion is true
      and artifact.review_status = 'reviewed'
      and artifact.artifact_payload ->> 'reviewStatus' = 'reviewed'
      and artifact.artifact_payload #>> '{reviewMetadata,disposition}' = 'approved_for_internal_use'
      and artifact.artifact_payload #>> '{verification,allPass}' = 'true'
      and artifact.artifact_payload #>> '{verification,eligibleForCompletion}' = 'true'
      and artifact.artifact_payload #>> '{verification,criteriaPassRate}' = '100'
      and review.disposition = 'approved_for_internal_use'
      and review.verification_eligible is true
      and review.audit_event_id is not null
      and review.external_distribution_allowed is false
      and review.payer_submission_allowed is false
      and review.review_decision_hash ~ '^scrimed-work-artifact-review-[a-f0-9]{64}$'
      and completion_event.event_metadata ->> 'lifecycleDecisionHash'
        ~ '^scrimed-work-lifecycle-[a-f0-9]{8}$'
      and not exists (
        select 1
        from jsonb_array_elements(
          coalesce(session.session_payload -> 'approvalCheckpoints', '[]'::jsonb)
        ) checkpoint
        where checkpoint ->> 'status' <> 'approved'
      )
    order by completion_event.created_at desc, session.id desc, artifact.id desc
    limit p_limit
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'sessionId', candidate.session_id,
        'artifactId', candidate.artifact_id,
        'artifactType', candidate.artifact_type,
        'title', candidate.title,
        'workspaceDomain', candidate.workspace_domain,
        'riskLevel', candidate.risk_level,
        'sessionStatus', candidate.session_status,
        'reviewStatus', candidate.review_status,
        'reviewDisposition', candidate.disposition,
        'verificationAllPass', true,
        'verificationEligible', candidate.verification_eligible,
        'verificationPassRate', 100,
        'reviewEvidenceBound', candidate.review_evidence_bound,
        'reviewerSeparationEnforced', true,
        'completionEvidenceBound', true,
        'reviewEventId', candidate.review_event_id,
        'completionEventId', candidate.completion_event_id,
        'reviewDecisionHash', candidate.review_decision_hash,
        'lifecycleDecisionHash', candidate.lifecycle_decision_hash,
        'evidencePacketHash', 'scrimed-work-completion-evidence-' || encode(
          extensions.digest(
            concat_ws(
              '|',
              candidate.session_id,
              candidate.artifact_id,
              candidate.review_decision_hash,
              candidate.completion_event_id::text,
              candidate.lifecycle_decision_hash,
              policy_version
            ),
            'sha256'
          ),
          'hex'
        ),
        'reviewedAt', candidate.reviewed_at,
        'completedAt', candidate.completed_at,
        'syntheticOnly', true,
        'noPhi', true,
        'humanReviewRequired', true,
        'internalUseOnly', true,
        'externalDistributionAllowed', false,
        'payerSubmissionAllowed', false,
        'ehrWritebackAllowed', false
      )
      order by candidate.completed_at desc, candidate.session_id desc, candidate.artifact_id desc
    ) filter (where candidate.review_evidence_bound),
    '[]'::jsonb
  )
  into evidence_items
  from candidates candidate;

  insert into private.scrimed_work_audit_events (
    tenant_id,
    workspace_id,
    actor_user_id,
    event_type,
    event_metadata,
    boundary
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    (select auth.uid()),
    'session-completion-evidence-viewed',
    jsonb_build_object(
      'policyVersion', policy_version,
      'requestedLimit', p_limit,
      'returnedCount', jsonb_array_length(evidence_items),
      'memberRole', member_role,
      'operatorOnly', true,
      'completedSessionsOnly', true,
      'independentReviewRequired', true,
      'verificationRequired', true,
      'immutableEvidenceReferences', true,
      'metadataOnly', true,
      'internalUseOnly', true,
      'syntheticOnly', true,
      'noPhi', true,
      'externalDistributionAllowed', false,
      'payerSubmissionAllowed', false,
      'ehrWritebackAllowed', false,
      'assuranceLevel', 'aal2'
    ),
    boundary_value
  )
  returning id into created_event_id;

  return jsonb_build_object(
    'items', evidence_items,
    'count', jsonb_array_length(evidence_items),
    'limit', p_limit,
    'auditEventId', created_event_id,
    'policyVersion', policy_version,
    'workspaceSlug', selected_workspace.slug,
    'operatorRoleRequired', true,
    'allowedMemberRoles', jsonb_build_array('tenant-admin', 'pilot-lead'),
    'completedSessionsOnly', true,
    'independentReviewRequired', true,
    'verificationRequired', true,
    'immutableEvidenceReferences', true,
    'internalUseOnly', true,
    'syntheticOnly', true,
    'noPhi', true,
    'externalDistributionAllowed', false,
    'payerSubmissionAllowed', false,
    'ehrWritebackAllowed', false,
    'boundary', boundary_value
  );
end;
$$;

create or replace function public.list_scrimed_work_completion_evidence(
  p_workspace_slug text,
  p_limit integer default 25
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.list_scrimed_work_completion_evidence(
    p_workspace_slug,
    p_limit
  );
$$;

revoke all on function private.list_scrimed_work_completion_evidence(text, integer)
  from public, anon, authenticated, service_role;
revoke all on function public.list_scrimed_work_completion_evidence(text, integer)
  from public, anon, authenticated, service_role;

grant execute on function private.list_scrimed_work_completion_evidence(text, integer)
  to authenticated;
grant execute on function public.list_scrimed_work_completion_evidence(text, integer)
  to authenticated;

comment on function private.list_scrimed_work_completion_evidence(text, integer) is
  'Tenant-admin/pilot-lead AAL2 SCRIMED Work completion evidence. Returns bounded immutable references for synthetic/no-PHI, independently reviewed, fully verified completed sessions and records every read.';

comment on function public.list_scrimed_work_completion_evidence(text, integer) is
  'Security-invoker wrapper for tenant-scoped SCRIMED Work completion evidence. It grants no artifact-content, external distribution, payer, EHR, clinical, connector, certification, or go-live authority.';
