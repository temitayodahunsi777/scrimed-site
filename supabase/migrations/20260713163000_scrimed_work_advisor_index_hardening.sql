begin;

do $$
begin
  if to_regclass('private.scrimed_work_artifacts') is null
    or to_regclass('private.scrimed_work_audit_events') is null then
    raise exception 'scrimed-work-advisor-index-hardening-base-tables-missing';
  end if;
end;
$$;

create index if not exists scrimed_work_artifacts_tenant_created_idx
  on private.scrimed_work_artifacts(tenant_id, created_at desc);

create index if not exists scrimed_work_audit_events_tenant_created_idx
  on private.scrimed_work_audit_events(tenant_id, created_at desc);

create index if not exists scrimed_work_audit_events_artifact_idx
  on private.scrimed_work_audit_events(scrimed_work_artifact_id);

comment on index private.scrimed_work_artifacts_tenant_created_idx is
  'Covers tenant-scoped artifact retention and the tenant foreign key without exposing artifact content.';

comment on index private.scrimed_work_audit_events_tenant_created_idx is
  'Covers tenant-scoped audit retrieval and the tenant foreign key without weakening immutable audit controls.';

comment on index private.scrimed_work_audit_events_artifact_idx is
  'Covers the optional SCRIMED Work artifact foreign key used by evidence-bound audit events.';

commit;
