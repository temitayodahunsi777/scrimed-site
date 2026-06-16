create index if not exists pilot_demo_readiness_snapshots_tenant_id_idx
  on public.pilot_demo_readiness_snapshots(tenant_id);

comment on index public.pilot_demo_readiness_snapshots_tenant_id_idx is
  'Covers the tenant_id foreign key on pilot demo readiness snapshots for Supabase performance advisor hardening.';
