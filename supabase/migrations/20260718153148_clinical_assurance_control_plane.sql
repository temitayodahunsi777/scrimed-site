create unique index if not exists pilot_workspaces_id_tenant_id_uq
  on public.pilot_workspaces(id, tenant_id);

create table if not exists private.scrimed_clinical_assurance_registry_snapshots (
  id uuid primary key default gen_random_uuid(),
  registry_kind text not null check (
    registry_kind in (
      'sovereign-clinical-enclave',
      'model-passport',
      'tool-passport',
      'capacity-passport',
      'critical-dependency-map',
      'concentration-budget',
      'supplier-event',
      'promotion-evidence'
    )
  ),
  registry_id text not null check (registry_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:/-]{2,180}$'),
  registry_version text not null check (registry_version ~ '^[a-zA-Z0-9][a-zA-Z0-9._:/-]{2,180}$'),
  scope text not null check (scope in ('global', 'tenant')),
  tenant_id uuid references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid,
  status text not null check (status in ('draft', 'active', 'suspended', 'revoked', 'expired')),
  payload jsonb not null check (
    jsonb_typeof(payload) = 'object'
    and pg_column_size(payload) <= 131072
  ),
  payload_digest text not null check (payload_digest ~ '^[a-f0-9]{64}$'),
  artifact_signature_digest text check (
    artifact_signature_digest is null or artifact_signature_digest ~ '^[a-f0-9]{64}$'
  ),
  actor_identity_hash text not null check (actor_identity_hash ~ '^[a-zA-Z0-9][a-zA-Z0-9._:/-]{2,180}$'),
  effective_at timestamptz not null,
  expires_at timestamptz not null check (expires_at > effective_at),
  no_phi_assertion boolean not null default true check (no_phi_assertion),
  synthetic_only boolean not null default true check (synthetic_only),
  boundary text not null check (char_length(boundary) between 120 and 2400),
  created_at timestamptz not null default now(),
  check (
    (scope = 'global' and tenant_id is null and workspace_id is null)
    or (scope = 'tenant' and tenant_id is not null and workspace_id is not null)
  ),
  constraint scrimed_clinical_assurance_registry_workspace_tenant_fk
    foreign key (workspace_id, tenant_id)
    references public.pilot_workspaces(id, tenant_id)
    on delete restrict,
  unique (registry_kind, registry_id, registry_version, payload_digest)
);

create table if not exists private.scrimed_clinical_assurance_policy_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null,
  policy_decision_id text not null check (policy_decision_id ~ '^assurance_[a-f0-9]{24}$'),
  event_type text not null check (
    event_type in (
      'preflight-authorized',
      'preflight-queued',
      'preflight-human-handoff',
      'preflight-blocked',
      'model-kill-switch-activated',
      'workflow-kill-switch-activated',
      'supplier-reauthorization-required',
      'supplier-withdrawal-drill',
      'capacity-scarcity-handoff'
    )
  ),
  assurance_level text not null check (
    assurance_level in (
      'CAL_0_PUBLIC_ZERO_PHI',
      'CAL_1_STANDARD_PHI',
      'CAL_2_RESTRICTED_CLINICAL',
      'CAL_3_SOVEREIGN_ISOLATED'
    )
  ),
  enclave_id text not null check (enclave_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:/-]{2,180}$'),
  workflow_id text not null check (workflow_id ~ '^[a-zA-Z0-9][a-zA-Z0-9._:/-]{2,180}$'),
  case_input_fingerprint text not null check (case_input_fingerprint ~ '^[a-f0-9]{64}$'),
  model_passport_digest text check (model_passport_digest is null or model_passport_digest ~ '^[a-f0-9]{64}$'),
  fallback_passport_digest text check (fallback_passport_digest is null or fallback_passport_digest ~ '^[a-f0-9]{64}$'),
  capacity_decision_id text not null check (capacity_decision_id ~ '^capacity_[a-f0-9]{20}$'),
  concentration_decision_id text not null check (concentration_decision_id ~ '^concentration_[a-f0-9]{20}$'),
  routing_decision_id text not null check (routing_decision_id ~ '^routing_[a-f0-9]{20}$'),
  disposition text not null check (
    disposition in ('authorized-synthetic-route', 'queued', 'human-handoff', 'blocked')
  ),
  evidence_metadata jsonb not null check (
    jsonb_typeof(evidence_metadata) = 'object'
    and pg_column_size(evidence_metadata) <= 65536
  ),
  previous_event_hash text check (previous_event_hash is null or previous_event_hash ~ '^[a-f0-9]{64}$'),
  event_hash text not null unique check (event_hash ~ '^[a-f0-9]{64}$'),
  actor_identity_hash text not null check (actor_identity_hash ~ '^[a-zA-Z0-9][a-zA-Z0-9._:/-]{2,180}$'),
  no_phi_assertion boolean not null default true check (no_phi_assertion),
  raw_prompt_stored boolean not null default false check (not raw_prompt_stored),
  raw_connector_payload_stored boolean not null default false check (not raw_connector_payload_stored),
  clinical_action_authority boolean not null default false check (not clinical_action_authority),
  payer_submission_allowed boolean not null default false check (not payer_submission_allowed),
  ehr_writeback_allowed boolean not null default false check (not ehr_writeback_allowed),
  boundary text not null check (char_length(boundary) between 120 and 2400),
  created_at timestamptz not null default now(),
  constraint scrimed_clinical_assurance_events_workspace_tenant_fk
    foreign key (workspace_id, tenant_id)
    references public.pilot_workspaces(id, tenant_id)
    on delete restrict
);

create index if not exists scrimed_clinical_assurance_registry_scope_created_idx
  on private.scrimed_clinical_assurance_registry_snapshots(scope, tenant_id, created_at desc);
create index if not exists scrimed_clinical_assurance_registry_kind_status_idx
  on private.scrimed_clinical_assurance_registry_snapshots(registry_kind, status, expires_at);
create index if not exists scrimed_clinical_assurance_policy_events_workspace_created_idx
  on private.scrimed_clinical_assurance_policy_events(workspace_id, created_at desc);
create index if not exists scrimed_clinical_assurance_policy_events_decision_idx
  on private.scrimed_clinical_assurance_policy_events(policy_decision_id, created_at desc);
create index if not exists scrimed_clinical_assurance_policy_events_enclave_created_idx
  on private.scrimed_clinical_assurance_policy_events(enclave_id, created_at desc);

alter table private.scrimed_clinical_assurance_registry_snapshots enable row level security;
alter table private.scrimed_clinical_assurance_policy_events enable row level security;

revoke all on private.scrimed_clinical_assurance_registry_snapshots from public, anon, authenticated;
revoke all on private.scrimed_clinical_assurance_policy_events from public, anon, authenticated;

drop policy if exists scrimed_clinical_assurance_registry_deny_all
  on private.scrimed_clinical_assurance_registry_snapshots;
create policy scrimed_clinical_assurance_registry_deny_all
on private.scrimed_clinical_assurance_registry_snapshots
as restrictive
for all
to public
using (false)
with check (false);

drop policy if exists scrimed_clinical_assurance_policy_events_deny_all
  on private.scrimed_clinical_assurance_policy_events;
create policy scrimed_clinical_assurance_policy_events_deny_all
on private.scrimed_clinical_assurance_policy_events
as restrictive
for all
to public
using (false)
with check (false);

create or replace function private.reject_clinical_assurance_mutation()
returns trigger
language plpgsql
volatile
set search_path = ''
as $$
begin
  raise exception 'scrimed-clinical-assurance-ledger-is-append-only';
end;
$$;

revoke all on function private.reject_clinical_assurance_mutation()
from public, anon, authenticated;

drop trigger if exists scrimed_clinical_assurance_registry_immutable
  on private.scrimed_clinical_assurance_registry_snapshots;
create trigger scrimed_clinical_assurance_registry_immutable
before update or delete on private.scrimed_clinical_assurance_registry_snapshots
for each row execute function private.reject_clinical_assurance_mutation();

drop trigger if exists scrimed_clinical_assurance_policy_events_immutable
  on private.scrimed_clinical_assurance_policy_events;
create trigger scrimed_clinical_assurance_policy_events_immutable
before update or delete on private.scrimed_clinical_assurance_policy_events
for each row execute function private.reject_clinical_assurance_mutation();

comment on table private.scrimed_clinical_assurance_registry_snapshots is
  'Private append-only CAL, sovereign enclave, model/capacity passport, dependency, concentration, supplier-event, and promotion-evidence metadata. No PHI or public API grant.';
comment on table private.scrimed_clinical_assurance_policy_events is
  'Private append-only clinical-assurance and CaseEvidence binding ledger. Stores hashes and bounded metadata only; no raw prompt, connector payload, PHI, clinical authority, payer submission, or EHR writeback.';
