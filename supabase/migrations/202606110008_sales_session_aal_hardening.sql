create or replace function private.require_sales_tenant_admin()
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  target_tenant_id uuid;
  current_session_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'authentication-required';
  end if;

  if coalesce((select auth.jwt() ->> 'aal'), 'aal1') <> 'aal2' then
    raise exception 'sales-operations-mfa-required';
  end if;

  begin
    current_session_id := nullif((select auth.jwt() ->> 'session_id'), '')::uuid;
  exception when others then
    raise exception 'sales-operations-session-invalid';
  end;

  if current_session_id is null or not exists (
    select 1
    from auth.sessions active_session
    where active_session.id = current_session_id
      and active_session.user_id = (select auth.uid())
      and active_session.aal::text = 'aal2'
      and active_session.created_at >= now() - interval '12 hours'
      and coalesce(active_session.refreshed_at, active_session.created_at::timestamp)
        >= (now() - interval '2 hours')::timestamp
      and (active_session.not_after is null or active_session.not_after > now())
  ) then
    raise exception 'sales-operations-session-policy-required';
  end if;

  select credential.sales_tenant_id
  into target_tenant_id
  from private.pilot_intake_credentials credential
  where credential.singleton = true;

  if target_tenant_id is null
    or not private.has_pilot_role(target_tenant_id, array['tenant-admin']) then
    raise exception 'sales-operations-admin-required';
  end if;

  return target_tenant_id;
end;
$$;

comment on function private.require_sales_tenant_admin() is
  'Requires tenant-admin membership, signed and persisted AAL2 assurance, a 12-hour maximum session lifetime, and a 2-hour inactivity boundary.';
