create index if not exists trust_safety_incidents_tenant_id_idx
  on private.trust_safety_incidents(tenant_id);
create index if not exists trust_safety_incidents_created_by_idx
  on private.trust_safety_incidents(created_by);
create index if not exists trust_safety_incidents_updated_by_idx
  on private.trust_safety_incidents(updated_by);

create index if not exists trust_safety_incident_events_tenant_id_idx
  on private.trust_safety_incident_events(tenant_id);
create index if not exists trust_safety_incident_events_actor_user_id_idx
  on private.trust_safety_incident_events(actor_user_id);

create index if not exists agent_workspace_governance_ledger_tenant_id_idx
  on public.agent_workspace_governance_ledger(tenant_id);

create index if not exists agent_workspace_work_orders_pilot_session_id_idx
  on public.agent_workspace_work_orders(pilot_session_id);
create index if not exists agent_workspace_work_orders_trustos_decision_id_idx
  on public.agent_workspace_work_orders(trustos_decision_id);
create index if not exists agent_workspace_work_orders_updated_by_idx
  on public.agent_workspace_work_orders(updated_by);
create index if not exists agent_workspace_work_orders_reviewed_by_idx
  on public.agent_workspace_work_orders(reviewed_by);
create index if not exists agent_workspace_work_orders_closed_by_idx
  on public.agent_workspace_work_orders(closed_by);

create index if not exists agent_workspace_work_order_events_tenant_id_idx
  on public.agent_workspace_work_order_events(tenant_id);
