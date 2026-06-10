create index if not exists pilot_demo_sessions_tenant_id_idx
  on public.pilot_demo_sessions(tenant_id);
create index if not exists pilot_demo_sessions_created_by_idx
  on public.pilot_demo_sessions(created_by);
create index if not exists pilot_audit_events_tenant_id_idx
  on public.pilot_audit_events(tenant_id);
create index if not exists pilot_audit_events_actor_user_id_idx
  on public.pilot_audit_events(actor_user_id);
