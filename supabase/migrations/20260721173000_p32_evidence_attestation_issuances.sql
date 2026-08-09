alter table public.qa_manual_run_evidence_packets
  add column if not exists workflow_kind text not null default 'legacy-unclassified';

alter table public.qa_manual_run_evidence_packets
  drop constraint if exists qa_manual_run_evidence_packets_workflow_kind_check;
alter table public.qa_manual_run_evidence_packets
  add constraint qa_manual_run_evidence_packets_workflow_kind_check check (
    workflow_kind in (
      'legacy-unclassified',
      'sales-demo-session-qa',
      'authority-reference-qa',
      'execution-attempt-durable-store-qa'
    )
  );

create or replace function private.qa_manual_run_evidence_packet_json(
  packet public.qa_manual_run_evidence_packets
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', packet.id,
    'tenantId', packet.tenant_id,
    'workspaceId', packet.workspace_id,
    'workflowKind', packet.workflow_kind,
    'workflowRunId', packet.workflow_run_id,
    'workflowRunUrl', packet.workflow_run_url,
    'executedAt', packet.executed_at,
    'baseUrl', packet.base_url,
    'intakeId', packet.intake_id,
    'createdSessionId', packet.created_session_id,
    'packetAuditEventId', packet.packet_audit_event_id,
    'qaOutcome', packet.qa_outcome,
    'operatorAttestation', packet.operator_attestation,
    'tokenDisposalAttestation', packet.token_disposal_attestation,
    'dataBoundary', packet.data_boundary,
    'packetMarkdown', packet.packet_markdown,
    'packetSha256', packet.packet_sha256,
    'createdBy', packet.created_by,
    'createdAt', packet.created_at,
    'boundary', packet.boundary
  );
$$;

create or replace function private.record_qa_manual_run_evidence_packet(
  p_workspace_slug text,
  p_packet_input jsonb,
  p_packet_markdown text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  created_packet public.qa_manual_run_evidence_packets%rowtype;
  created_event_id uuid;
  normalized_input jsonb := coalesce(p_packet_input, '{}'::jsonb);
  input_text text := normalized_input::text;
  workflow_kind_value text;
  workflow_run_id_value text;
  workflow_run_url_value text;
  executed_at_value timestamptz;
  base_url_value text;
  intake_id_value text;
  created_session_id_value uuid;
  packet_audit_event_id_value uuid;
  packet_hash text;
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead']
  );

  if jsonb_typeof(normalized_input) <> 'object'
    or pg_column_size(normalized_input) > 32768 then
    raise exception 'qa-manual-evidence-invalid-payload';
  end if;

  if char_length(coalesce(p_packet_markdown, '')) not between 200 and 65536 then
    raise exception 'qa-manual-evidence-invalid-packet';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(normalized_input) as forbidden(key)
    where forbidden.key = any(array[
      'accessToken',
      'access_token',
      'bearerToken',
      'bearer_token',
      'refreshToken',
      'refresh_token',
      'jwt',
      'secret',
      'password',
      'credential',
      'credentials'
    ])
  ) then
    raise exception 'qa-manual-evidence-prohibited-secret-field';
  end if;

  if input_text ~* 'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+'
    or input_text ~* 'sk-[A-Za-z0-9_-]{12,}'
    or input_text ~* 'sbp_[A-Za-z0-9_-]{12,}'
    or input_text ~* 'Bearer[[:space:]]+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})'
    or input_text ~* 'patient[ _-]?(id|identifier|mrn)'
    or input_text ~* 'member[ _-]?(id|identifier)'
    or input_text ~* 'medical record|protected health information|payer member' then
    raise exception 'qa-manual-evidence-prohibited-content';
  end if;

  if p_packet_markdown ~* 'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+'
    or p_packet_markdown ~* 'sk-[A-Za-z0-9_-]{12,}'
    or p_packet_markdown ~* 'sbp_[A-Za-z0-9_-]{12,}'
    or p_packet_markdown ~* 'Bearer[[:space:]]+(eyJ[A-Za-z0-9._-]+|[A-Za-z0-9._-]{20,})' then
    raise exception 'qa-manual-evidence-packet-secret-like-content';
  end if;

  workflow_kind_value := trim(coalesce(normalized_input ->> 'workflowKind', ''));
  workflow_run_id_value := trim(coalesce(normalized_input ->> 'workflowRunId', ''));
  workflow_run_url_value := trim(coalesce(normalized_input ->> 'workflowRunUrl', ''));
  base_url_value := trim(coalesce(normalized_input ->> 'baseUrl', ''));
  intake_id_value := trim(coalesce(normalized_input ->> 'intakeId', ''));

  begin
    executed_at_value := (normalized_input ->> 'executedAt')::timestamptz;
    created_session_id_value := (normalized_input ->> 'createdSessionId')::uuid;
    packet_audit_event_id_value := (normalized_input ->> 'packetAuditEventId')::uuid;
  exception when others then
    raise exception 'qa-manual-evidence-invalid-typed-field';
  end;

  if workflow_kind_value not in (
      'sales-demo-session-qa',
      'authority-reference-qa',
      'execution-attempt-durable-store-qa'
    )
    or workflow_run_id_value !~ '^[0-9]{6,32}$'
    or not (
      workflow_run_url_value = (
        'https://github.com/temitayodahunsi777/scrimed-site/actions/runs/' || workflow_run_id_value
      )
      or workflow_run_url_value = (
        'https://app.scrimedsolutions.com/qa-run-control?runId=' || workflow_run_id_value
      )
    )
    or executed_at_value < now() - interval '14 days'
    or executed_at_value > now() + interval '5 minutes'
    or not (
      base_url_value = 'https://app.scrimedsolutions.com'
      or base_url_value ~ '^https://[a-z0-9-]+\.vercel\.app$'
    )
    or intake_id_value !~ '^[A-Za-z0-9][A-Za-z0-9_-]{5,127}$'
    or normalized_input ->> 'qaOutcome' <> 'pass'
    or normalized_input ->> 'operatorAttestation' <> 'no-secrets-no-phi-aal2-human-run'
    or normalized_input ->> 'tokenDisposalAttestation' <> 'temporary-token-deleted-or-rotated'
    or normalized_input ->> 'dataBoundary' <> 'synthetic-business-workflow-only' then
    raise exception 'qa-manual-evidence-validation-failed';
  end if;

  packet_hash := encode(extensions.digest(p_packet_markdown, 'sha256'), 'hex');

  insert into public.qa_manual_run_evidence_packets (
    tenant_id,
    workspace_id,
    workflow_kind,
    workflow_run_id,
    workflow_run_url,
    executed_at,
    base_url,
    intake_id,
    created_session_id,
    packet_audit_event_id,
    qa_outcome,
    operator_attestation,
    token_disposal_attestation,
    data_boundary,
    packet_markdown,
    packet_sha256,
    created_by
  ) values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    workflow_kind_value,
    workflow_run_id_value,
    workflow_run_url_value,
    executed_at_value,
    base_url_value,
    intake_id_value,
    created_session_id_value,
    packet_audit_event_id_value,
    'pass',
    normalized_input ->> 'operatorAttestation',
    normalized_input ->> 'tokenDisposalAttestation',
    normalized_input ->> 'dataBoundary',
    p_packet_markdown,
    packet_hash,
    (select auth.uid())
  )
  returning * into created_packet;

  insert into public.pilot_audit_events (
    tenant_id,
    workspace_id,
    session_id,
    actor_user_id,
    event_type,
    event_metadata
  ) values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    null,
    (select auth.uid()),
    'manual-qa-evidence-packet-recorded',
    jsonb_build_object(
      'qaManualRunEvidencePacketId', created_packet.id,
      'workflowKind', created_packet.workflow_kind,
      'workflowRunId', created_packet.workflow_run_id,
      'workflowRunUrl', created_packet.workflow_run_url,
      'intakeId', created_packet.intake_id,
      'createdSessionId', created_packet.created_session_id,
      'packetAuditEventId', created_packet.packet_audit_event_id,
      'packetSha256', created_packet.packet_sha256,
      'assuranceLevel', 'aal2',
      'metadataOnly', true,
      'syntheticOnly', true,
      'noPhi', true,
      'legalSecurityPrivacyBoundary', true
    )
  )
  returning id into created_event_id;

  return jsonb_build_object(
    'packet', private.qa_manual_run_evidence_packet_json(created_packet),
    'auditEventId', created_event_id,
    'persisted', true,
    'boundary', created_packet.boundary
  );
end;
$$;

comment on column public.qa_manual_run_evidence_packets.workflow_kind is
  'Exact governed QA workflow provenance. Legacy rows remain quarantined as legacy-unclassified and cannot satisfy p.32 AAL2 issuance.';
comment on function private.record_qa_manual_run_evidence_packet(text, jsonb, text) is
  'Persists an exact-workflow, sanitized manual QA evidence packet after AAL2 tenant governance authorization. Legacy or unclassified packets are rejected. The packet is synthetic-only and metadata-only.';

create table if not exists private.p32_evidence_attestation_issuances (
  id uuid primary key,
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null,
  qa_evidence_packet_id uuid not null references public.qa_manual_run_evidence_packets(id) on delete restrict,
  qa_evidence_packet_hash text not null check (qa_evidence_packet_hash ~ '^[0-9a-f]{64}$'),
  idempotency_key uuid not null,
  issuer text not null check (issuer ~ '^[A-Za-z0-9][A-Za-z0-9._:/-]{2,127}$'),
  key_id text not null check (key_id ~ '^[A-Za-z0-9][A-Za-z0-9._:/-]{2,127}$'),
  evidence_id text not null check (evidence_id = 'aal2-cli-evidence'),
  source_commit text not null check (source_commit ~ '^[0-9a-f]{40}$'),
  source_tree_fingerprint text not null check (source_tree_fingerprint ~ '^[0-9a-f]{64}$'),
  artifact_fingerprint text not null check (artifact_fingerprint ~ '^[0-9a-f]{64}$'),
  validation_evidence_fingerprint text not null check (validation_evidence_fingerprint ~ '^[0-9a-f]{64}$'),
  generated_at timestamptz not null,
  checked_at timestamptz not null,
  expires_at timestamptz not null,
  evidence_pointer text not null check (evidence_pointer ~ '^p32-aal2-issuance:[0-9a-f-]{36}$'),
  evidence_hash text not null check (evidence_hash ~ '^[0-9a-f]{64}$'),
  payload_hash text not null check (payload_hash ~ '^[0-9a-f]{64}$'),
  signature_fingerprint text not null check (signature_fingerprint ~ '^[0-9a-f]{64}$'),
  identity_assurance text not null default 'protected-aal2-workspace'
    check (identity_assurance = 'protected-aal2-workspace'),
  data_boundary text not null default 'synthetic-metadata-only'
    check (data_boundary = 'synthetic-metadata-only'),
  release_authority_granted boolean not null default false
    check (release_authority_granted = false),
  created_by uuid not null references auth.users(id) on delete restrict,
  previous_audit_hash text check (previous_audit_hash is null or previous_audit_hash ~ '^[0-9a-f]{64}$'),
  audit_hash text not null unique check (audit_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  unique (workspace_id, idempotency_key),
  constraint p32_evidence_attestation_issuances_workspace_tenant_fk
    foreign key (workspace_id, tenant_id)
    references public.pilot_workspaces(id, tenant_id)
    on delete restrict,
  check (generated_at = checked_at),
  check (expires_at > checked_at),
  check (expires_at <= checked_at + interval '1 hour')
);

create index if not exists p32_evidence_attestation_issuances_workspace_created_idx
  on private.p32_evidence_attestation_issuances(workspace_id, created_at desc);
create index if not exists p32_evidence_attestation_issuances_packet_idx
  on private.p32_evidence_attestation_issuances(qa_evidence_packet_id);

alter table private.p32_evidence_attestation_issuances enable row level security;
revoke all on table private.p32_evidence_attestation_issuances
  from public, anon, authenticated, service_role;

create or replace function private.prevent_p32_evidence_attestation_issuance_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception 'p32-evidence-attestation-ledger-is-append-only';
end;
$$;

drop trigger if exists p32_evidence_attestation_issuances_immutable
  on private.p32_evidence_attestation_issuances;
create trigger p32_evidence_attestation_issuances_immutable
before update or delete on private.p32_evidence_attestation_issuances
for each row execute function private.prevent_p32_evidence_attestation_issuance_mutation();

create or replace function private.record_p32_evidence_attestation_issuance(
  p_workspace_slug text,
  p_issuance jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_packet public.qa_manual_run_evidence_packets%rowtype;
  normalized jsonb := coalesce(p_issuance, '{}'::jsonb);
  input_text text := normalized::text;
  issuance_id_value uuid;
  idempotency_key_value uuid;
  qa_packet_id_value uuid;
  generated_at_value timestamptz;
  checked_at_value timestamptz;
  expires_at_value timestamptz;
  previous_hash_value text;
  audit_hash_value text;
  created_at_value timestamptz := now();
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead']
  );

  if jsonb_typeof(normalized) <> 'object'
    or pg_column_size(normalized) > 12288
    or normalized - array[
      'issuanceId',
      'idempotencyKey',
      'qaEvidencePacketId',
      'qaEvidencePacketHash',
      'issuer',
      'keyId',
      'evidenceId',
      'sourceCommit',
      'sourceTreeFingerprint',
      'artifactFingerprint',
      'validationEvidenceFingerprint',
      'generatedAt',
      'checkedAt',
      'expiresAt',
      'evidencePointer',
      'evidenceHash',
      'payloadHash',
      'signatureFingerprint'
    ] <> '{}'::jsonb then
    raise exception 'p32-evidence-attestation-invalid-payload';
  end if;

  if input_text ~* 'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+'
    or input_text ~* 'Bearer[[:space:]]+[A-Za-z0-9._-]+'
    or input_text ~* '-----BEGIN[[:space:]]+[A-Z ]*PRIVATE KEY-----'
    or input_text ~* 'sk-[A-Za-z0-9_-]{12,}'
    or input_text ~* 'sbp_[A-Za-z0-9_-]{12,}'
    or input_text ~* 'patient[ _-]?(id|identifier|mrn)'
    or input_text ~* 'member[ _-]?(id|identifier)'
    or input_text ~* 'medical record|protected health information|payer member' then
    raise exception 'p32-evidence-attestation-prohibited-content';
  end if;

  begin
    issuance_id_value := (normalized ->> 'issuanceId')::uuid;
    idempotency_key_value := (normalized ->> 'idempotencyKey')::uuid;
    qa_packet_id_value := (normalized ->> 'qaEvidencePacketId')::uuid;
    generated_at_value := (normalized ->> 'generatedAt')::timestamptz;
    checked_at_value := (normalized ->> 'checkedAt')::timestamptz;
    expires_at_value := (normalized ->> 'expiresAt')::timestamptz;
  exception when others then
    raise exception 'p32-evidence-attestation-invalid-typed-field';
  end;

  if normalized ->> 'evidenceId' <> 'aal2-cli-evidence'
    or normalized ->> 'sourceCommit' !~ '^[0-9a-f]{40}$'
    or normalized ->> 'sourceTreeFingerprint' !~ '^[0-9a-f]{64}$'
    or normalized ->> 'artifactFingerprint' !~ '^[0-9a-f]{64}$'
    or normalized ->> 'validationEvidenceFingerprint' !~ '^[0-9a-f]{64}$'
    or normalized ->> 'qaEvidencePacketHash' !~ '^[0-9a-f]{64}$'
    or normalized ->> 'evidenceHash' !~ '^[0-9a-f]{64}$'
    or normalized ->> 'payloadHash' !~ '^[0-9a-f]{64}$'
    or normalized ->> 'signatureFingerprint' !~ '^[0-9a-f]{64}$'
    or normalized ->> 'issuer' !~ '^[A-Za-z0-9][A-Za-z0-9._:/-]{2,127}$'
    or normalized ->> 'keyId' !~ '^[A-Za-z0-9][A-Za-z0-9._:/-]{2,127}$'
    or normalized ->> 'evidencePointer' <> ('p32-aal2-issuance:' || issuance_id_value::text)
    or generated_at_value <> checked_at_value
    or checked_at_value < now() - interval '5 minutes'
    or checked_at_value > now() + interval '5 minutes'
    or expires_at_value <= now()
    or expires_at_value > checked_at_value + interval '1 hour' then
    raise exception 'p32-evidence-attestation-validation-failed';
  end if;

  select *
  into selected_packet
  from public.qa_manual_run_evidence_packets packet
  where packet.id = qa_packet_id_value
    and packet.workspace_id = selected_workspace.id
    and packet.tenant_id = selected_workspace.tenant_id
    and packet.packet_sha256 = normalized ->> 'qaEvidencePacketHash'
    and packet.workflow_kind = 'execution-attempt-durable-store-qa'
    and packet.qa_outcome = 'pass'
    and packet.operator_attestation = 'no-secrets-no-phi-aal2-human-run'
    and packet.token_disposal_attestation = 'temporary-token-deleted-or-rotated'
    and packet.data_boundary = 'synthetic-business-workflow-only'
    and packet.executed_at >= now() - interval '14 days'
    and packet.created_at >= now() - interval '14 days';

  if selected_packet.id is null then
    raise exception 'p32-evidence-attestation-qa-evidence-not-eligible';
  end if;

  if exists (
    select 1
    from private.p32_evidence_attestation_issuances existing
    where existing.workspace_id = selected_workspace.id
      and existing.idempotency_key = idempotency_key_value
  ) then
    raise exception 'p32-evidence-attestation-idempotency-replay';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext(selected_workspace.id::text)
  );
  select issuance.audit_hash
  into previous_hash_value
  from private.p32_evidence_attestation_issuances issuance
  where issuance.workspace_id = selected_workspace.id
  order by issuance.created_at desc, issuance.id desc
  limit 1;

  audit_hash_value := encode(extensions.digest(concat_ws(
    '|',
    coalesce(previous_hash_value, ''),
    issuance_id_value::text,
    selected_workspace.tenant_id::text,
    selected_workspace.id::text,
    selected_packet.id::text,
    selected_packet.packet_sha256,
    normalized ->> 'issuer',
    normalized ->> 'keyId',
    normalized ->> 'sourceCommit',
    normalized ->> 'sourceTreeFingerprint',
    normalized ->> 'artifactFingerprint',
    normalized ->> 'validationEvidenceFingerprint',
    normalized ->> 'evidenceHash',
    normalized ->> 'payloadHash',
    normalized ->> 'signatureFingerprint',
    (select auth.uid())::text,
    checked_at_value::text,
    expires_at_value::text,
    created_at_value::text
  ), 'sha256'), 'hex');

  insert into private.p32_evidence_attestation_issuances (
    id,
    tenant_id,
    workspace_id,
    qa_evidence_packet_id,
    qa_evidence_packet_hash,
    idempotency_key,
    issuer,
    key_id,
    evidence_id,
    source_commit,
    source_tree_fingerprint,
    artifact_fingerprint,
    validation_evidence_fingerprint,
    generated_at,
    checked_at,
    expires_at,
    evidence_pointer,
    evidence_hash,
    payload_hash,
    signature_fingerprint,
    created_by,
    previous_audit_hash,
    audit_hash,
    created_at
  ) values (
    issuance_id_value,
    selected_workspace.tenant_id,
    selected_workspace.id,
    selected_packet.id,
    selected_packet.packet_sha256,
    idempotency_key_value,
    normalized ->> 'issuer',
    normalized ->> 'keyId',
    'aal2-cli-evidence',
    normalized ->> 'sourceCommit',
    normalized ->> 'sourceTreeFingerprint',
    normalized ->> 'artifactFingerprint',
    normalized ->> 'validationEvidenceFingerprint',
    generated_at_value,
    checked_at_value,
    expires_at_value,
    normalized ->> 'evidencePointer',
    normalized ->> 'evidenceHash',
    normalized ->> 'payloadHash',
    normalized ->> 'signatureFingerprint',
    (select auth.uid()),
    previous_hash_value,
    audit_hash_value,
    created_at_value
  );

  return jsonb_build_object(
    'receipt', jsonb_build_object(
      'issuanceId', issuance_id_value,
      'auditHash', audit_hash_value,
      'previousAuditHash', previous_hash_value,
      'recordedAt', created_at_value
    ),
    'boundary', 'synthetic-metadata-only-no-release-authority'
  );
end;
$$;

create or replace function public.record_p32_evidence_attestation_issuance(
  p_workspace_slug text,
  p_issuance jsonb
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_p32_evidence_attestation_issuance(
    p_workspace_slug,
    p_issuance
  );
$$;

revoke all on function private.prevent_p32_evidence_attestation_issuance_mutation()
  from public, anon, authenticated, service_role;
revoke all on function private.record_p32_evidence_attestation_issuance(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.record_p32_evidence_attestation_issuance(text, jsonb)
  from public, anon, authenticated, service_role;
grant execute on function private.record_p32_evidence_attestation_issuance(text, jsonb)
  to authenticated;
grant execute on function public.record_p32_evidence_attestation_issuance(text, jsonb)
  to authenticated;

comment on table private.p32_evidence_attestation_issuances is
  'Append-only, tenant-scoped, no-PHI receipts for short-lived p.32 AAL2 technical evidence signatures. Signature values and private keys are never retained.';
comment on function public.record_p32_evidence_attestation_issuance(text, jsonb) is
  'Requires the existing AAL2 governance session, server runtime token, tenant-admin or pilot-lead role, eligible retained QA packet, bounded timestamps, exact hashes, and a one-use idempotency key.';
