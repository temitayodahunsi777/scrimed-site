create or replace function private.sync_scrimed_work_artifact_payload_to_session()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_session private.scrimed_work_sessions%rowtype;
  current_artifacts jsonb;
  synchronized_artifacts jsonb;
begin
  select *
  into selected_session
  from private.scrimed_work_sessions session
  where session.id = new.scrimed_work_session_id
    and session.workspace_id = new.workspace_id
    and session.tenant_id = new.tenant_id
  for update;

  if selected_session.id is null then
    raise exception 'scrimed-work-artifact-session-sync-session-missing';
  end if;

  if new.artifact_payload ->> 'artifactId' is distinct from new.artifact_id
    or new.artifact_payload ->> 'sessionId' is distinct from selected_session.session_id then
    raise exception 'scrimed-work-artifact-session-sync-binding-conflict';
  end if;

  current_artifacts := case
    when jsonb_typeof(selected_session.session_payload -> 'artifacts') = 'array'
      then selected_session.session_payload -> 'artifacts'
    else '[]'::jsonb
  end;

  select coalesce(jsonb_agg(item_value order by ordinality), '[]'::jsonb)
  into synchronized_artifacts
  from jsonb_array_elements(current_artifacts)
    with ordinality as artifact_item(item_value, ordinality)
  where item_value ->> 'artifactId' is distinct from new.artifact_id;

  synchronized_artifacts := synchronized_artifacts || jsonb_build_array(new.artifact_payload);

  update private.scrimed_work_sessions
  set session_payload = jsonb_set(
        jsonb_set(session_payload, '{artifacts}', synchronized_artifacts, true),
        '{updatedAt}',
        to_jsonb(to_char(now() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
        true
      ),
      updated_at = now()
  where id = selected_session.id;

  return new;
end;
$$;

revoke all on function private.sync_scrimed_work_artifact_payload_to_session()
  from public, anon, authenticated, service_role;

drop trigger if exists scrimed_work_artifact_payload_session_sync
  on private.scrimed_work_artifacts;

create trigger scrimed_work_artifact_payload_session_sync
after insert or update of artifact_payload
on private.scrimed_work_artifacts
for each row
execute function private.sync_scrimed_work_artifact_payload_to_session();

-- Repair previously persisted synthetic artifacts without changing their identity,
-- review state, creator, or audit history. The trigger performs the bounded upsert.
update private.scrimed_work_artifacts artifact
set artifact_payload = artifact.artifact_payload
where exists (
  select 1
  from private.scrimed_work_sessions session
  where session.id = artifact.scrimed_work_session_id
    and session.workspace_id = artifact.workspace_id
    and session.tenant_id = artifact.tenant_id
    and not exists (
      select 1
      from jsonb_array_elements(
        case
          when jsonb_typeof(session.session_payload -> 'artifacts') = 'array'
            then session.session_payload -> 'artifacts'
          else '[]'::jsonb
        end
      ) session_artifact
      where session_artifact ->> 'artifactId' = artifact.artifact_id
    )
);

comment on function private.sync_scrimed_work_artifact_payload_to_session() is
  'Maintains the tenant-scoped SCRIMED Work invariant that every persisted artifact is bound into its authoritative session payload before independent review. No PHI, external distribution, payer, EHR, clinical, connector, certification, or go-live authority is granted.';
