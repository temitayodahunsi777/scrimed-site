create or replace function private.reject_execution_attempt_prohibited_text(p_payload text)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_payload ~* '([0-9]{3}-[0-9]{2}-[0-9]{4})'
    or p_payload ~* 'date of birth|dob[[:space:]]*[:#]'
    or p_payload ~* 'medical record number|mrn[[:space:]]*[:#]'
    or p_payload ~* 'member[ _-]?(id|identifier)[[:space:]]*[:#]?[[:space:]]*[a-z0-9-]{4,}'
    or p_payload ~* 'subscriber[ _-]?(id|identifier)[[:space:]]*[:#]?[[:space:]]*[a-z0-9-]{4,}'
    or p_payload ~* 'patient[ _-]?(id|identifier)[[:space:]]*[:#]?[[:space:]]*[a-z0-9-]{4,}'
    or p_payload ~* 'access[_-]?token|refresh[_-]?token|bearer[[:space:]]+[a-z0-9._-]+'
    or p_payload ~* 'sk-[a-z0-9_-]{12,}'
    or p_payload ~* 'sbp_[a-z0-9_-]{12,}' then
    raise exception 'execution-attempt-prohibited-content';
  end if;
end;
$$;

comment on function private.reject_execution_attempt_prohibited_text(text) is
  'Rejects credential and identifier-like values while allowing safety metadata labels that name prohibited categories without storing the underlying data.';
