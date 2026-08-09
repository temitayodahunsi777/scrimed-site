#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const path = "supabase/migrations/20260718153148_clinical_assurance_control_plane.sql";
const sql = await readFile(path, "utf8");

const invariants = [
  "create table if not exists private.scrimed_clinical_assurance_registry_snapshots",
  "create table if not exists private.scrimed_clinical_assurance_policy_events",
  "create unique index if not exists pilot_workspaces_id_tenant_id_uq",
  "foreign key (workspace_id, tenant_id)",
  "references public.pilot_workspaces(id, tenant_id)",
  "enable row level security",
  "revoke all on private.scrimed_clinical_assurance_registry_snapshots from public, anon, authenticated",
  "revoke all on private.scrimed_clinical_assurance_policy_events from public, anon, authenticated",
  "create policy scrimed_clinical_assurance_registry_deny_all",
  "create policy scrimed_clinical_assurance_policy_events_deny_all",
  "before update or delete on private.scrimed_clinical_assurance_registry_snapshots",
  "before update or delete on private.scrimed_clinical_assurance_policy_events",
  "check (not raw_prompt_stored)",
  "check (not raw_connector_payload_stored)",
  "check (not clinical_action_authority)",
  "check (not payer_submission_allowed)",
  "check (not ehr_writeback_allowed)"
];

for (const invariant of invariants) {
  if (!sql.includes(invariant)) throw new Error(`${path} is missing migration invariant: ${invariant}`);
}

if (/grant\s+(select|insert|update|delete|all).*\b(anon|authenticated)\b/i.test(sql)) {
  throw new Error(`${path} must not expose assurance ledgers to anon or authenticated roles.`);
}

console.log("pass SCRIMED Clinical Assurance migration contract check");
