begin;

do $$
begin
  if to_regclass('private.scrimed_stored_vectors') is null
    or to_regclass('private.scrimed_stored_vector_lookup_events') is null then
    raise exception 'scrimed-stored-vector-advisor-hardening-base-tables-missing';
  end if;
end;
$$;

create index if not exists scrimed_stored_vectors_created_by_idx
  on private.scrimed_stored_vectors(created_by);

create index if not exists scrimed_stored_vector_events_tenant_idx
  on private.scrimed_stored_vector_lookup_events(tenant_id);

comment on index private.scrimed_stored_vectors_created_by_idx is
  'Covering index for the created_by foreign key. Apply through reviewed nonproduction migration and validate before protected-pilot promotion.';

comment on index private.scrimed_stored_vector_events_tenant_idx is
  'Covering index for the tenant_id foreign key. Apply through reviewed nonproduction migration and validate before protected-pilot promotion.';

commit;
