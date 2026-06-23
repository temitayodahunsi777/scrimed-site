do $$
declare
  function_definition text;
begin
  select pg_get_functiondef('private.record_qa_manual_run_evidence_packet(text,jsonb,text)'::regprocedure)
  into function_definition;

  if function_definition not like '%encode(digest(p_packet_markdown, ''sha256''), ''hex'')%' then
    raise exception 'manual-qa-packet-hash-digest-call-not-found';
  end if;

  execute replace(
    function_definition,
    'encode(digest(p_packet_markdown, ''sha256''), ''hex'')',
    'encode(extensions.digest(p_packet_markdown, ''sha256''), ''hex'')'
  );
end;
$$;

comment on function private.record_qa_manual_run_evidence_packet(text, jsonb, text) is
  'Persists a sanitized manual QA evidence packet after AAL2 tenant governance authorization. Accepted run sources are SCRIMED GitHub Actions or SCRIMED Run Control local human AAL2 witnesses. Secret guards reject actual JWT and long bearer credential patterns while allowing safe no-secret operator wording. Packet hashing uses schema-qualified extensions.digest under an empty search path. The packet is synthetic-only and metadata-only for enterprise diligence.';
