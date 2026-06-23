do $$
declare
  function_definition text;
begin
  select pg_get_functiondef('private.record_qa_manual_run_evidence_packet(text,jsonb,text)'::regprocedure)
  into function_definition;

  if function_definition not like '%Bearer[[:space:]]+[A-Za-z0-9._-]+%' then
    raise exception 'manual-qa-secret-guard-pattern-not-found';
  end if;

  execute replace(
    function_definition,
    'Bearer[[:space:]]+[A-Za-z0-9._-]+',
    'Bearer[[:space:]]+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})'
  );
end;
$$;

comment on function private.record_qa_manual_run_evidence_packet(text, jsonb, text) is
  'Persists a sanitized manual QA evidence packet after AAL2 tenant governance authorization. Accepted run sources are SCRIMED GitHub Actions or SCRIMED Run Control local human AAL2 witnesses. Secret guards reject actual JWT and long bearer credential patterns while allowing safe no-secret operator wording. The packet is synthetic-only and metadata-only for enterprise diligence.';
