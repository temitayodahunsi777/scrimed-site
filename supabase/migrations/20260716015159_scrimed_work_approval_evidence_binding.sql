alter table private.scrimed_work_audit_events
  drop constraint scrimed_work_audit_events_event_type_check;

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
      'artifact-review-queue-viewed'
    )
  );

create or replace function private.bind_scrimed_work_approval_evidence()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_evidence jsonb;
  approved_checkpoint jsonb;
  approval_history jsonb;
  evidence_id text;
  binding_actor uuid;
  boundary_value constant text :=
    'SCRIMED Work binds metadata-only independent-approval evidence to a synthetic/no-PHI session. This evidence grants no external distribution, payer submission, EHR writeback, patient outreach, clinical authority, connector activation, certification claim, production authorization, or customer go-live.';
begin
  if new.status <> 'verifying'
    or not exists (
      select 1
      from jsonb_array_elements_text(
        coalesce(new.session_payload #> '{definitionOfDone,requiredEvidence}', '[]'::jsonb)
      ) requirement
      where lower(trim(requirement)) = 'independent reviewer approval'
    )
    or exists (
      select 1
      from jsonb_array_elements(
        case
          when jsonb_typeof(new.session_payload -> 'evidence') = 'array'
            then new.session_payload -> 'evidence'
          else '[]'::jsonb
        end
      ) evidence
      where lower(trim(coalesce(evidence ->> 'title', ''))) = 'independent reviewer approval'
        or lower(trim(coalesce(evidence ->> 'supports', ''))) = 'independent reviewer approval'
    ) then
    return new;
  end if;

  select checkpoint
  into approved_checkpoint
  from jsonb_array_elements(
    coalesce(new.session_payload -> 'approvalCheckpoints', '[]'::jsonb)
  ) checkpoint
  where checkpoint ->> 'status' = 'approved'
  order by checkpoint ->> 'checkpointId'
  limit 1;

  select history
  into approval_history
  from jsonb_array_elements(
    coalesce(new.session_payload -> 'statusHistory', '[]'::jsonb)
  ) with ordinality as history_item(history, ordinality)
  where history ->> 'action' = 'approve'
    and history ->> 'status' = 'verifying'
  order by ordinality desc
  limit 1;

  if approved_checkpoint is null
    or approval_history is null
    or coalesce(approved_checkpoint ->> 'auditHash', '') = ''
    or coalesce(approval_history ->> 'auditHash', '') = '' then
    raise exception 'scrimed-work-independent-approval-evidence-missing';
  end if;

  evidence_id := 'evidence_independent_approval_' || substring(
    encode(
      extensions.digest(
        concat_ws(
          '|',
          new.session_id,
          approved_checkpoint ->> 'checkpointId',
          approved_checkpoint ->> 'auditHash',
          approval_history ->> 'auditHash'
        ),
        'sha256'
      ),
      'hex'
    ),
    1,
    16
  );

  current_evidence := case
    when jsonb_typeof(new.session_payload -> 'evidence') = 'array'
      then new.session_payload -> 'evidence'
    else '[]'::jsonb
  end;

  new.session_payload := jsonb_set(
    jsonb_set(
      new.session_payload,
      '{evidence}',
      current_evidence || jsonb_build_array(
        jsonb_build_object(
          'evidenceId', evidence_id,
          'sourceId', 'scrimed-work-independent-approval-checkpoint',
          'title', 'Independent reviewer approval',
          'citation', concat(
            'SCRIMED Work lifecycle approval ',
            approval_history ->> 'auditHash'
          ),
          'trustTier', 'source-of-record',
          'supports', 'independent reviewer approval',
          'dataClassification', 'metadata-only',
          'auditHash', approval_history ->> 'auditHash'
        )
      ),
      true
    ),
    '{updatedAt}',
    to_jsonb(to_char(now() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
    true
  );

  binding_actor := auth.uid();

  if binding_actor is null then
    select event.actor_user_id
    into binding_actor
    from private.scrimed_work_audit_events event
    where event.scrimed_work_session_id = new.id
      and event.event_type = 'session-transitioned'
      and event.event_metadata ->> 'lifecycleAction' = 'approve'
    order by event.created_at desc
    limit 1;
  end if;

  if binding_actor is null then
    raise exception 'scrimed-work-independent-approval-actor-missing';
  end if;

  insert into private.scrimed_work_audit_events (
    tenant_id,
    workspace_id,
    scrimed_work_session_id,
    actor_user_id,
    event_type,
    event_metadata,
    no_phi_assertion,
    boundary
  )
  values (
    new.tenant_id,
    new.workspace_id,
    new.id,
    binding_actor,
    'session-evidence-bound',
    jsonb_build_object(
      'sessionId', new.session_id,
      'evidenceId', evidence_id,
      'requirement', 'independent reviewer approval',
      'source', 'scrimed-work-approval-evidence-binding',
      'syntheticOnly', true,
      'noPhi', true,
      'externalDistributionAllowed', false,
      'payerSubmissionAllowed', false,
      'ehrWritebackAllowed', false
    ),
    true,
    boundary_value
  );

  return new;
end;
$$;

revoke all on function private.bind_scrimed_work_approval_evidence()
  from public, anon, authenticated, service_role;

drop trigger if exists scrimed_work_approval_evidence_binding
  on private.scrimed_work_sessions;

create trigger scrimed_work_approval_evidence_binding
before update of status, session_payload
on private.scrimed_work_sessions
for each row
execute function private.bind_scrimed_work_approval_evidence();

update private.scrimed_work_sessions session
set session_payload = session.session_payload,
    updated_at = now()
where session.status = 'verifying'
  and exists (
    select 1
    from jsonb_array_elements_text(
      coalesce(session.session_payload #> '{definitionOfDone,requiredEvidence}', '[]'::jsonb)
    ) requirement
    where lower(trim(requirement)) = 'independent reviewer approval'
  )
  and exists (
    select 1
    from jsonb_array_elements(
      coalesce(session.session_payload -> 'approvalCheckpoints', '[]'::jsonb)
    ) checkpoint
    where checkpoint ->> 'status' = 'approved'
  )
  and not exists (
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
  );

comment on function private.bind_scrimed_work_approval_evidence() is
  'Binds one metadata-only, audit-derived independent approval evidence record to verifying synthetic/no-PHI SCRIMED Work sessions. Direct execution is revoked and no clinical, payer, EHR, connector, external distribution, certification, production, or go-live authority is granted.';
