begin;

set local lock_timeout = '5s';
set local statement_timeout = '30s';

do $$
declare
  extension_schema text;
  extension_relocatable boolean;
begin
  select n.nspname, e.extrelocatable
    into extension_schema, extension_relocatable
  from pg_extension e
  join pg_namespace n on n.oid = e.extnamespace
  where e.extname = 'vector';

  if extension_schema is null then
    raise exception 'scrimed-vector-extension-missing';
  end if;

  if extension_schema not in ('public', 'extensions') then
    raise exception 'scrimed-vector-extension-unexpected-schema:%', extension_schema;
  end if;

  if extension_schema = 'public' and not extension_relocatable then
    raise exception 'scrimed-vector-extension-not-relocatable';
  end if;

  if to_regnamespace('extensions') is null then
    raise exception 'scrimed-extensions-schema-missing';
  end if;

  if extension_schema = 'public' then
    execute 'alter extension vector set schema extensions';
  end if;
end;
$$;

grant usage on schema extensions to anon, authenticated, service_role;

do $$
declare
  extension_schema text;
  stored_vector_type_schema text;
begin
  select n.nspname
    into extension_schema
  from pg_extension e
  join pg_namespace n on n.oid = e.extnamespace
  where e.extname = 'vector';

  select type_namespace.nspname
    into stored_vector_type_schema
  from pg_attribute attribute
  join pg_class relation on relation.oid = attribute.attrelid
  join pg_namespace relation_namespace on relation_namespace.oid = relation.relnamespace
  join pg_type column_type on column_type.oid = attribute.atttypid
  join pg_namespace type_namespace on type_namespace.oid = column_type.typnamespace
  where relation_namespace.nspname = 'private'
    and relation.relname = 'scrimed_stored_vectors'
    and attribute.attname = 'embedding'
    and attribute.attnum > 0
    and not attribute.attisdropped;

  if extension_schema <> 'extensions' then
    raise exception 'scrimed-vector-extension-relocation-not-verified:%', extension_schema;
  end if;

  if stored_vector_type_schema <> 'extensions' then
    raise exception 'scrimed-stored-vector-type-relocation-not-verified:%', stored_vector_type_schema;
  end if;

  if not has_schema_privilege('anon', 'extensions', 'USAGE')
    or not has_schema_privilege('authenticated', 'extensions', 'USAGE')
    or not has_schema_privilege('service_role', 'extensions', 'USAGE') then
    raise exception 'scrimed-vector-extension-schema-usage-missing';
  end if;
end;
$$;

commit;
