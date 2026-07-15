create or replace function private.list_scrimed_work_artifact_review_queue(
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
  boundary_value text := private.scrimed_work_boundary();
  policy_version constant text := 'scrimed-work-review-queue-v2026-07-15';
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['reviewer']
  );

  if p_limit is null or p_limit < 1 or p_limit > 50 then
    raise exception 'scrimed-work-review-queue-invalid-limit';
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
      artifact.created_at,
      artifact.created_by,
      exists (
        select 1
        from jsonb_array_elements(
          coalesce(session.session_payload -> 'approvalCheckpoints', '[]'::jsonb)
        ) checkpoint
      ) and not exists (
        select 1
        from jsonb_array_elements(
          coalesce(session.session_payload -> 'approvalCheckpoints', '[]'::jsonb)
        ) checkpoint
        where checkpoint ->> 'status' <> 'approved'
      ) as approvals_ready,
      coalesce(
        (artifact.artifact_payload #>> '{verification,eligibleForCompletion}')::boolean,
        false
      ) as verification_reported_eligible
    from private.scrimed_work_sessions session
    join private.scrimed_work_artifacts artifact
      on artifact.scrimed_work_session_id = session.id
     and artifact.workspace_id = session.workspace_id
     and artifact.tenant_id = session.tenant_id
    where session.workspace_id = selected_workspace.id
      and session.tenant_id = selected_workspace.tenant_id
      and session.input_classification = 'synthetic-no-phi'
      and session.no_phi_assertion is true
      and session.human_review_required is true
      and session.status in ('awaiting_approval', 'verifying')
      and artifact.no_phi_assertion is true
      and artifact.review_status in ('draft', 'human_review_required')
      and session.created_by <> (select auth.uid())
      and artifact.created_by <> (select auth.uid())
      and not exists (
        select 1
        from private.scrimed_work_artifact_reviews review
        where review.scrimed_work_artifact_id = artifact.id
      )
    order by artifact.created_at asc, artifact.id asc
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
        'approvalsReady', candidate.approvals_ready,
        'verificationReportedEligible', candidate.verification_reported_eligible,
        'creatorIdentityHash', 'scrimed-actor-' || encode(
          extensions.digest(
            concat_ws(
              '|',
              candidate.created_by::text,
              selected_workspace.tenant_id::text,
              policy_version
            ),
            'sha256'
          ),
          'hex'
        ),
        'createdAt', candidate.created_at,
        'syntheticOnly', true,
        'noPhi', true,
        'humanReviewRequired', true,
        'externalDistributionAllowed', false,
        'payerSubmissionAllowed', false
      )
      order by candidate.created_at asc, candidate.artifact_id asc
    ),
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
    'artifact-review-queue-viewed',
    jsonb_build_object(
      'policyVersion', policy_version,
      'requestedLimit', p_limit,
      'returnedCount', jsonb_array_length(queue_items),
      'memberRole', 'reviewer',
      'sessionApprovalStepExposed', true,
      'metadataOnly', true,
      'syntheticOnly', true,
      'noPhi', true,
      'humanReviewRequired', true,
      'externalDistributionAllowed', false,
      'payerSubmissionAllowed', false,
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
    'reviewerRoleRequired', true,
    'separationOfDutiesEnforced', true,
    'syntheticOnly', true,
    'noPhi', true,
    'externalDistributionAllowed', false,
    'payerSubmissionAllowed', false,
    'boundary', boundary_value
  );
end;
$$;

create or replace function public.list_scrimed_work_artifact_review_queue(
  p_workspace_slug text,
  p_limit integer default 25
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.list_scrimed_work_artifact_review_queue(
    p_workspace_slug,
    p_limit
  );
$$;

revoke all on function private.list_scrimed_work_artifact_review_queue(text, integer)
  from public, anon, authenticated, service_role;
revoke all on function public.list_scrimed_work_artifact_review_queue(text, integer)
  from public, anon, authenticated, service_role;

grant execute on function private.list_scrimed_work_artifact_review_queue(text, integer)
  to authenticated;
grant execute on function public.list_scrimed_work_artifact_review_queue(text, integer)
  to authenticated;

comment on function private.list_scrimed_work_artifact_review_queue(text, integer) is
  'Reviewer-only AAL2 SCRIMED Work queue. Returns bounded synthetic/no-PHI metadata for awaiting-approval and verifying artifacts created by another actor, then records an audit event.';

comment on function public.list_scrimed_work_artifact_review_queue(text, integer) is
  'Security-invoker wrapper for the two-step tenant-scoped SCRIMED Work reviewer queue. It grants no raw-payload, external distribution, payer, EHR, clinical, connector, certification, or go-live authority.';
