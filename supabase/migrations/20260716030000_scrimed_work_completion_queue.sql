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
      'session-completion-queue-viewed'
    )
  );

create or replace function private.list_scrimed_work_completion_queue(
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
  queue_items jsonb := '[]'::jsonb;
  created_event_id uuid;
  member_role text;
  boundary_value text := private.scrimed_work_boundary();
  policy_version constant text := 'scrimed-work-completion-queue-v2026-07-16';
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead']
  );

  if p_limit is null or p_limit < 1 or p_limit > 50 then
    raise exception 'scrimed-work-completion-queue-invalid-limit';
  end if;

  select membership.role
  into member_role
  from public.pilot_memberships membership
  where membership.tenant_id = selected_workspace.tenant_id
    and membership.user_id = (select auth.uid())
    and membership.role in ('tenant-admin', 'pilot-lead');

  if member_role is null then
    raise exception 'scrimed-work-completion-queue-operator-required';
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
      review.created_at as reviewed_at,
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
      order by artifact_review.created_at desc, artifact_review.id desc
      limit 1
    ) review on true
    where session.workspace_id = selected_workspace.id
      and session.tenant_id = selected_workspace.tenant_id
      and session.input_classification = 'synthetic-no-phi'
      and session.no_phi_assertion is true
      and session.human_review_required is true
      and session.status = 'verifying'
      and artifact.no_phi_assertion is true
      and artifact.review_status = 'reviewed'
      and artifact.artifact_payload ->> 'reviewStatus' = 'reviewed'
      and artifact.artifact_payload #>> '{reviewMetadata,disposition}' = 'approved_for_internal_use'
      and artifact.artifact_payload #>> '{verification,allPass}' = 'true'
      and artifact.artifact_payload #>> '{verification,eligibleForCompletion}' = 'true'
      and artifact.artifact_payload #>> '{verification,criteriaPassRate}' = '100'
      and review.disposition = 'approved_for_internal_use'
      and review.verification_eligible is true
      and review.external_distribution_allowed is false
      and review.payer_submission_allowed is false
      and not exists (
        select 1
        from jsonb_array_elements(
          coalesce(session.session_payload -> 'approvalCheckpoints', '[]'::jsonb)
        ) checkpoint
        where checkpoint ->> 'status' <> 'approved'
      )
    order by review.created_at asc, session.id asc
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
        'verificationEligible', candidate.verification_eligible,
        'verificationPassRate', 100,
        'reviewEvidenceBound', candidate.review_evidence_bound,
        'completionReady', candidate.review_evidence_bound,
        'reviewedAt', candidate.reviewed_at,
        'syntheticOnly', true,
        'noPhi', true,
        'humanReviewRequired', true,
        'externalDistributionAllowed', false,
        'payerSubmissionAllowed', false,
        'ehrWritebackAllowed', false
      )
      order by candidate.reviewed_at asc, candidate.session_id asc
    ) filter (where candidate.review_evidence_bound),
    '[]'::jsonb
  )
  into queue_items
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
    'session-completion-queue-viewed',
    jsonb_build_object(
      'policyVersion', policy_version,
      'requestedLimit', p_limit,
      'returnedCount', jsonb_array_length(queue_items),
      'memberRole', member_role,
      'operatorOnly', true,
      'independentReviewRequired', true,
      'verificationRequired', true,
      'metadataOnly', true,
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
    'items', queue_items,
    'count', jsonb_array_length(queue_items),
    'limit', p_limit,
    'auditEventId', created_event_id,
    'policyVersion', policy_version,
    'workspaceSlug', selected_workspace.slug,
    'operatorRoleRequired', true,
    'allowedMemberRoles', jsonb_build_array('tenant-admin', 'pilot-lead'),
    'independentReviewRequired', true,
    'verificationRequired', true,
    'syntheticOnly', true,
    'noPhi', true,
    'externalDistributionAllowed', false,
    'payerSubmissionAllowed', false,
    'ehrWritebackAllowed', false,
    'boundary', boundary_value
  );
end;
$$;

create or replace function public.list_scrimed_work_completion_queue(
  p_workspace_slug text,
  p_limit integer default 25
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.list_scrimed_work_completion_queue(
    p_workspace_slug,
    p_limit
  );
$$;

revoke all on function private.list_scrimed_work_completion_queue(text, integer)
  from public, anon, authenticated, service_role;
revoke all on function public.list_scrimed_work_completion_queue(text, integer)
  from public, anon, authenticated, service_role;

grant execute on function private.list_scrimed_work_completion_queue(text, integer)
  to authenticated;
grant execute on function public.list_scrimed_work_completion_queue(text, integer)
  to authenticated;

comment on function private.list_scrimed_work_completion_queue(text, integer) is
  'Tenant-admin/pilot-lead AAL2 SCRIMED Work queue. Returns bounded synthetic/no-PHI metadata only for independently reviewed, verification-eligible sessions and records an audit event.';

comment on function public.list_scrimed_work_completion_queue(text, integer) is
  'Security-invoker wrapper for the tenant-scoped SCRIMED Work completion queue. It grants no raw-payload, external distribution, payer, EHR, clinical, connector, certification, or go-live authority.';
