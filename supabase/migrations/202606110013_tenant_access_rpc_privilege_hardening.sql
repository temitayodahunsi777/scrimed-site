revoke all on function public.tenant_access_dashboard(text)
  from public, anon, service_role;
revoke all on function public.update_pilot_membership_role(text, uuid, text)
  from public, anon, service_role;

grant execute on function public.tenant_access_dashboard(text) to authenticated;
grant execute on function public.update_pilot_membership_role(text, uuid, text) to authenticated;

comment on function public.tenant_access_dashboard(text) is
  'Authenticated AAL2 tenant-admin wrapper. Anonymous and service-role execution are explicitly denied.';
comment on function public.update_pilot_membership_role(text, uuid, text) is
  'Authenticated AAL2 tenant-admin wrapper. Anonymous and service-role execution are explicitly denied.';
