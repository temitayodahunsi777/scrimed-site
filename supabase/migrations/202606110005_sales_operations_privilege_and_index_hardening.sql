create index if not exists pilot_intake_credentials_sales_tenant_id_idx
  on private.pilot_intake_credentials(sales_tenant_id);
create index if not exists pilot_intake_submissions_updated_by_idx
  on private.pilot_intake_submissions(updated_by);
create index if not exists sales_opportunity_audit_actor_user_id_idx
  on private.sales_opportunity_audit_events(actor_user_id);

revoke all on function private.require_sales_tenant_admin() from public, anon, authenticated;
revoke all on function private.sales_opportunity_json(private.pilot_intake_submissions) from public, anon, authenticated;
revoke all on function private.sales_operations_dashboard() from public, anon, authenticated;
revoke all on function private.get_sales_opportunity(text) from public, anon, authenticated;
revoke all on function private.update_sales_opportunity(text, text, text, text) from public, anon, authenticated;
revoke all on function private.record_sales_proposal_download(text) from public, anon, authenticated;
revoke all on function private.record_sales_crm_sync(text, text, text) from public, anon, authenticated;

grant execute on function private.sales_operations_dashboard() to authenticated;
grant execute on function private.get_sales_opportunity(text) to authenticated;
grant execute on function private.update_sales_opportunity(text, text, text, text) to authenticated;
grant execute on function private.record_sales_proposal_download(text) to authenticated;
grant execute on function private.record_sales_crm_sync(text, text, text) to authenticated;

revoke all on function public.sales_operations_dashboard() from public, anon, authenticated;
revoke all on function public.get_sales_opportunity(text) from public, anon, authenticated;
revoke all on function public.update_sales_opportunity(text, text, text, text) from public, anon, authenticated;
revoke all on function public.record_sales_proposal_download(text) from public, anon, authenticated;
revoke all on function public.record_sales_crm_sync(text, text, text) from public, anon, authenticated;

grant execute on function public.sales_operations_dashboard() to authenticated;
grant execute on function public.get_sales_opportunity(text) to authenticated;
grant execute on function public.update_sales_opportunity(text, text, text, text) to authenticated;
grant execute on function public.record_sales_proposal_download(text) to authenticated;
grant execute on function public.record_sales_crm_sync(text, text, text) to authenticated;
