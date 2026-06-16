create index if not exists sales_opportunity_workspaces_intake_idx
  on private.sales_opportunity_workspaces(intake_id);

create index if not exists sales_opportunity_workspaces_created_by_idx
  on private.sales_opportunity_workspaces(created_by);

create index if not exists sales_opportunity_workspaces_updated_by_idx
  on private.sales_opportunity_workspaces(updated_by);

comment on index private.sales_opportunity_workspaces_intake_idx is
  'FK-covering index retained for advisor-clean opportunity workspace deletes and lifecycle joins.';
comment on index private.sales_opportunity_workspaces_created_by_idx is
  'FK-covering index retained for advisor-clean auth user delete checks.';
comment on index private.sales_opportunity_workspaces_updated_by_idx is
  'FK-covering index retained for advisor-clean auth user delete checks.';
