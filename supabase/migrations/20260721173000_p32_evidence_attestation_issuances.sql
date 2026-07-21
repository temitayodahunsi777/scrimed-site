create table if not exists private.p32_evidence_attestation_issuances (
  id uuid primary key,
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
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

  audit_hash_value := encode(digest(concat_ws(
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
