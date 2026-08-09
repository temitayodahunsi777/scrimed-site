create table if not exists private.p32_candidate_review_assignments (
  id uuid primary key,
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null,
  idempotency_key uuid not null,
  reviewer_identity_hash text not null check (reviewer_identity_hash ~ '^[0-9a-f]{64}$'),
  reviewer_role text not null check (reviewer_role = 'principal-engineer'),
  source_commit text not null check (source_commit ~ '^[0-9a-f]{40}$'),
  source_tree_fingerprint text not null check (source_tree_fingerprint ~ '^[0-9a-f]{64}$'),
  artifact_fingerprint text not null check (artifact_fingerprint ~ '^[0-9a-f]{64}$'),
  validation_evidence_fingerprint text not null check (validation_evidence_fingerprint ~ '^[0-9a-f]{64}$'),
  review_packet_fingerprint text not null check (review_packet_fingerprint ~ '^[0-9a-f]{64}$'),
  assigned_by uuid not null references auth.users(id) on delete restrict,
  assigner_identity_hash text not null check (assigner_identity_hash ~ '^[0-9a-f]{64}$'),
  assigned_at timestamptz not null,
  expires_at timestamptz not null,
  data_boundary text not null default 'synthetic-metadata-only'
    check (data_boundary = 'synthetic-metadata-only'),
  release_authority_granted boolean not null default false
    check (release_authority_granted = false),
  previous_audit_hash text check (previous_audit_hash is null or previous_audit_hash ~ '^[0-9a-f]{64}$'),
  audit_hash text not null unique check (audit_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  unique (workspace_id, idempotency_key),
  unique (id, tenant_id, workspace_id),
  constraint p32_candidate_review_assignments_workspace_tenant_fk
    foreign key (workspace_id, tenant_id)
    references public.pilot_workspaces(id, tenant_id)
    on delete restrict,
  check (reviewer_identity_hash <> assigner_identity_hash),
  check (expires_at > assigned_at),
  check (expires_at <= assigned_at + interval '7 days')
);

create table if not exists private.p32_candidate_review_decisions (
  id uuid primary key,
  assignment_id uuid not null unique,
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null,
  idempotency_key uuid not null,
  reviewer_identity_hash text not null check (reviewer_identity_hash ~ '^[0-9a-f]{64}$'),
  decision text not null check (decision in ('approved', 'rejected')),
  reason_code text not null check (
    reason_code in ('review-complete-no-material-blockers', 'material-changes-required')
  ),
  review_packet_fingerprint text not null check (review_packet_fingerprint ~ '^[0-9a-f]{64}$'),
  issuer text not null check (issuer ~ '^[A-Za-z0-9][A-Za-z0-9._:/-]{2,127}$'),
  key_id text not null check (key_id ~ '^[A-Za-z0-9][A-Za-z0-9._:/-]{2,127}$'),
  approval_evidence jsonb not null check (jsonb_typeof(approval_evidence) = 'object'),
  attestation jsonb not null check (jsonb_typeof(attestation) = 'object'),
  payload_hash text not null check (payload_hash ~ '^[0-9a-f]{64}$'),
  signature_fingerprint text not null check (signature_fingerprint ~ '^[0-9a-f]{64}$'),
  decided_by uuid not null references auth.users(id) on delete restrict,
  data_boundary text not null default 'synthetic-metadata-only'
    check (data_boundary = 'synthetic-metadata-only'),
  release_authority_granted boolean not null default false
    check (release_authority_granted = false),
  previous_audit_hash text check (previous_audit_hash is null or previous_audit_hash ~ '^[0-9a-f]{64}$'),
  audit_hash text not null unique check (audit_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  unique (workspace_id, idempotency_key),
  constraint p32_candidate_review_decisions_workspace_tenant_fk
    foreign key (workspace_id, tenant_id)
    references public.pilot_workspaces(id, tenant_id)
    on delete restrict,
  constraint p32_candidate_review_decisions_assignment_scope_fk
    foreign key (assignment_id, tenant_id, workspace_id)
    references private.p32_candidate_review_assignments(id, tenant_id, workspace_id)
    on delete restrict
);

create index if not exists p32_candidate_review_assignments_workspace_created_idx
  on private.p32_candidate_review_assignments(workspace_id, created_at desc);
create index if not exists p32_candidate_review_assignments_reviewer_idx
  on private.p32_candidate_review_assignments(workspace_id, reviewer_identity_hash, expires_at desc);
create index if not exists p32_candidate_review_decisions_workspace_created_idx
  on private.p32_candidate_review_decisions(workspace_id, created_at desc);

alter table private.p32_candidate_review_assignments enable row level security;
alter table private.p32_candidate_review_decisions enable row level security;
revoke all on table private.p32_candidate_review_assignments
  from public, anon, authenticated, service_role;
revoke all on table private.p32_candidate_review_decisions
  from public, anon, authenticated, service_role;

create or replace function private.prevent_p32_candidate_review_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception 'p32-candidate-review-ledger-is-append-only';
end;
$$;

drop trigger if exists p32_candidate_review_assignments_immutable
  on private.p32_candidate_review_assignments;
create trigger p32_candidate_review_assignments_immutable
before update or delete on private.p32_candidate_review_assignments
for each row execute function private.prevent_p32_candidate_review_mutation();

drop trigger if exists p32_candidate_review_decisions_immutable
  on private.p32_candidate_review_decisions;
create trigger p32_candidate_review_decisions_immutable
before update or delete on private.p32_candidate_review_decisions
for each row execute function private.prevent_p32_candidate_review_mutation();

create or replace function private.create_p32_candidate_review_assignment(
  p_workspace_slug text,
  p_assignment jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  normalized jsonb := coalesce(p_assignment, '{}'::jsonb);
  input_text text := normalized::text;
  assignment_id_value uuid;
  idempotency_key_value uuid;
  assigned_at_value timestamptz;
  expires_at_value timestamptz;
  assigner_identity_hash_value text;
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
    or pg_column_size(normalized) > 8192
    or normalized - array[
      'assignmentId',
      'idempotencyKey',
      'reviewerIdentityHash',
      'reviewerRole',
      'sourceCommit',
      'sourceTreeFingerprint',
      'artifactFingerprint',
      'validationEvidenceFingerprint',
      'reviewPacketFingerprint',
      'assignedAt',
      'expiresAt'
    ] <> '{}'::jsonb then
    raise exception 'p32-candidate-review-assignment-invalid-payload';
  end if;

  if input_text ~* 'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+'
    or input_text ~* 'Bearer[[:space:]]+[A-Za-z0-9._-]+'
    or input_text ~* '-----BEGIN[[:space:]]+[A-Z ]*PRIVATE KEY-----'
    or input_text ~* 'sk-[A-Za-z0-9_-]{12,}'
    or input_text ~* 'sbp_[A-Za-z0-9_-]{12,}'
    or input_text ~* 'patient[ _-]?(id|identifier|mrn)'
    or input_text ~* 'member[ _-]?(id|identifier)'
    or input_text ~* 'medical record|protected health information|payer member' then
    raise exception 'p32-candidate-review-prohibited-content';
  end if;

  begin
    assignment_id_value := (normalized ->> 'assignmentId')::uuid;
    idempotency_key_value := (normalized ->> 'idempotencyKey')::uuid;
    assigned_at_value := (normalized ->> 'assignedAt')::timestamptz;
    expires_at_value := (normalized ->> 'expiresAt')::timestamptz;
  exception when others then
    raise exception 'p32-candidate-review-assignment-invalid-typed-field';
  end;

  assigner_identity_hash_value := encode(extensions.digest(
    'scrimed-p32-reviewer-v1|' || (select auth.uid())::text,
    'sha256'
  ), 'hex');

  if normalized ->> 'reviewerRole' <> 'principal-engineer'
    or normalized ->> 'reviewerIdentityHash' !~ '^[0-9a-f]{64}$'
    or normalized ->> 'sourceCommit' !~ '^[0-9a-f]{40}$'
    or normalized ->> 'sourceTreeFingerprint' !~ '^[0-9a-f]{64}$'
    or normalized ->> 'artifactFingerprint' !~ '^[0-9a-f]{64}$'
    or normalized ->> 'validationEvidenceFingerprint' !~ '^[0-9a-f]{64}$'
    or normalized ->> 'reviewPacketFingerprint' !~ '^[0-9a-f]{64}$'
    or assigned_at_value < now() - interval '5 minutes'
    or assigned_at_value > now() + interval '5 minutes'
    or expires_at_value <= now()
    or expires_at_value > assigned_at_value + interval '7 days' then
    raise exception 'p32-candidate-review-assignment-validation-failed';
  end if;

  if normalized ->> 'reviewerIdentityHash' = assigner_identity_hash_value then
    raise exception 'p32-candidate-review-separation-of-duties-required';
  end if;

  if not exists (
    select 1
    from public.pilot_memberships membership
    where membership.tenant_id = selected_workspace.tenant_id
      and membership.role = 'reviewer'
      and membership.status = 'active'
      and encode(extensions.digest(
        'scrimed-p32-reviewer-v1|' || membership.user_id::text,
        'sha256'
      ), 'hex') = normalized ->> 'reviewerIdentityHash'
  ) then
    raise exception 'p32-candidate-review-reviewer-not-eligible';
  end if;

  if exists (
    select 1
    from private.p32_candidate_review_assignments existing
    where existing.workspace_id = selected_workspace.id
      and existing.idempotency_key = idempotency_key_value
  ) then
    raise exception 'p32-candidate-review-idempotency-replay';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext(selected_workspace.id::text || '|p32-candidate-review-assignment')
  );
  select assignment.audit_hash
  into previous_hash_value
  from private.p32_candidate_review_assignments assignment
  where assignment.workspace_id = selected_workspace.id
  order by assignment.created_at desc, assignment.id desc
  limit 1;

  audit_hash_value := encode(extensions.digest(concat_ws(
    '|',
    coalesce(previous_hash_value, ''),
    assignment_id_value::text,
    selected_workspace.tenant_id::text,
    selected_workspace.id::text,
    normalized ->> 'reviewerIdentityHash',
    normalized ->> 'reviewerRole',
    normalized ->> 'sourceCommit',
    normalized ->> 'sourceTreeFingerprint',
    normalized ->> 'artifactFingerprint',
    normalized ->> 'validationEvidenceFingerprint',
    normalized ->> 'reviewPacketFingerprint',
    (select auth.uid())::text,
    assigned_at_value::text,
    expires_at_value::text,
    created_at_value::text
  ), 'sha256'), 'hex');

  insert into private.p32_candidate_review_assignments (
    id,
    tenant_id,
    workspace_id,
    idempotency_key,
    reviewer_identity_hash,
    reviewer_role,
    source_commit,
    source_tree_fingerprint,
    artifact_fingerprint,
    validation_evidence_fingerprint,
    review_packet_fingerprint,
    assigned_by,
    assigner_identity_hash,
    assigned_at,
    expires_at,
    previous_audit_hash,
    audit_hash,
    created_at
  ) values (
    assignment_id_value,
    selected_workspace.tenant_id,
    selected_workspace.id,
    idempotency_key_value,
    normalized ->> 'reviewerIdentityHash',
    'principal-engineer',
    normalized ->> 'sourceCommit',
    normalized ->> 'sourceTreeFingerprint',
    normalized ->> 'artifactFingerprint',
    normalized ->> 'validationEvidenceFingerprint',
    normalized ->> 'reviewPacketFingerprint',
    (select auth.uid()),
    assigner_identity_hash_value,
    assigned_at_value,
    expires_at_value,
    previous_hash_value,
    audit_hash_value,
    created_at_value
  );

  return jsonb_build_object(
    'receipt', jsonb_build_object(
      'assignmentId', assignment_id_value,
      'auditHash', audit_hash_value,
      'previousAuditHash', previous_hash_value,
      'recordedAt', created_at_value
    ),
    'boundary', 'synthetic-metadata-only-no-release-authority'
  );
end;
$$;

create or replace function private.record_p32_candidate_review_decision(
  p_workspace_slug text,
  p_decision jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_assignment private.p32_candidate_review_assignments%rowtype;
  normalized jsonb := coalesce(p_decision, '{}'::jsonb);
  approval jsonb := coalesce(p_decision -> 'approvalEvidence', '{}'::jsonb);
  attestation_value jsonb := coalesce(p_decision -> 'attestation', '{}'::jsonb);
  input_text text := normalized::text;
  assignment_id_value uuid;
  approval_id_value uuid;
  idempotency_key_value uuid;
  approved_at_value timestamptz;
  approval_expires_at_value timestamptz;
  signed_at_value timestamptz;
  attestation_expires_at_value timestamptz;
  reviewer_identity_hash_value text;
  tenant_scope_hash_value text;
  previous_hash_value text;
  audit_hash_value text;
  created_at_value timestamptz := now();
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['reviewer']
  );

  if jsonb_typeof(normalized) <> 'object'
    or pg_column_size(normalized) > 24576
    or normalized - array[
      'assignmentId',
      'approvalId',
      'idempotencyKey',
      'reviewPacketFingerprint',
      'reasonCode',
      'issuer',
      'keyId',
      'approvalEvidence',
      'attestation',
      'payloadHash',
      'signatureFingerprint'
    ] <> '{}'::jsonb
    or jsonb_typeof(approval) <> 'object'
    or jsonb_typeof(attestation_value) <> 'object'
    or approval - array[
      'approvalId',
      'gateId',
      'reviewerId',
      'reviewerRole',
      'identityAssurance',
      'tenantScopeHash',
      'decision',
      'sourceCommit',
      'sourceTreeFingerprint',
      'artifactFingerprint',
      'validationEvidenceFingerprint',
      'reviewPacketFingerprint',
      'evidencePointer',
      'approvedAt',
      'expiresAt',
      'releaseAuthorityGranted',
      'decisionHash'
    ] <> '{}'::jsonb
    or attestation_value - array[
      'version',
      'issuer',
      'keyId',
      'algorithm',
      'signedAt',
      'expiresAt',
      'payloadHash',
      'signature'
    ] <> '{}'::jsonb then
    raise exception 'p32-candidate-review-decision-invalid-payload';
  end if;

  if input_text ~* 'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+'
    or input_text ~* 'Bearer[[:space:]]+[A-Za-z0-9._-]+'
    or input_text ~* '-----BEGIN[[:space:]]+[A-Z ]*PRIVATE KEY-----'
    or input_text ~* 'sk-[A-Za-z0-9_-]{12,}'
    or input_text ~* 'sbp_[A-Za-z0-9_-]{12,}'
    or input_text ~* 'patient[ _-]?(id|identifier|mrn)'
    or input_text ~* 'member[ _-]?(id|identifier)'
    or input_text ~* 'medical record|protected health information|payer member' then
    raise exception 'p32-candidate-review-prohibited-content';
  end if;

  begin
    assignment_id_value := (normalized ->> 'assignmentId')::uuid;
    approval_id_value := (normalized ->> 'approvalId')::uuid;
    idempotency_key_value := (normalized ->> 'idempotencyKey')::uuid;
    approved_at_value := (approval ->> 'approvedAt')::timestamptz;
    approval_expires_at_value := (approval ->> 'expiresAt')::timestamptz;
    signed_at_value := (attestation_value ->> 'signedAt')::timestamptz;
    attestation_expires_at_value := (attestation_value ->> 'expiresAt')::timestamptz;
  exception when others then
    raise exception 'p32-candidate-review-decision-invalid-typed-field';
  end;

  reviewer_identity_hash_value := encode(extensions.digest(
    'scrimed-p32-reviewer-v1|' || (select auth.uid())::text,
    'sha256'
  ), 'hex');
  tenant_scope_hash_value := encode(extensions.digest(
    'scrimed-p32-tenant-v1|' || selected_workspace.tenant_id::text,
    'sha256'
  ), 'hex');

  select *
  into selected_assignment
  from private.p32_candidate_review_assignments assignment
  where assignment.id = assignment_id_value
    and assignment.workspace_id = selected_workspace.id
    and assignment.tenant_id = selected_workspace.tenant_id
    and assignment.reviewer_identity_hash = reviewer_identity_hash_value
    and assignment.reviewer_role = 'principal-engineer'
    and assignment.review_packet_fingerprint = normalized ->> 'reviewPacketFingerprint'
    and assignment.source_commit = approval ->> 'sourceCommit'
    and assignment.source_tree_fingerprint = approval ->> 'sourceTreeFingerprint'
    and assignment.artifact_fingerprint = approval ->> 'artifactFingerprint'
    and assignment.validation_evidence_fingerprint = approval ->> 'validationEvidenceFingerprint'
    and assignment.review_packet_fingerprint = approval ->> 'reviewPacketFingerprint';

  if selected_assignment.id is null then
    raise exception 'p32-candidate-review-assignment-not-found-or-candidate-mismatch';
  end if;
  if selected_assignment.expires_at <= now() then
    raise exception 'p32-candidate-review-assignment-expired';
  end if;
  if selected_assignment.assigned_by = (select auth.uid())
    or selected_assignment.assigner_identity_hash = reviewer_identity_hash_value then
    raise exception 'p32-candidate-review-separation-of-duties-required';
  end if;

  if approval_id_value::text <> approval ->> 'approvalId'
    or approval ->> 'gateId' <> 'named-reviewer-approval'
    or approval ->> 'reviewerId' <> reviewer_identity_hash_value
    or approval ->> 'reviewerRole' <> 'principal-engineer'
    or approval ->> 'identityAssurance' <> 'aal2-protected-workspace'
    or approval ->> 'tenantScopeHash' <> tenant_scope_hash_value
    or approval ->> 'decision' not in ('approved', 'rejected')
    or approval ->> 'reviewPacketFingerprint' !~ '^[0-9a-f]{64}$'
    or approval ->> 'reviewPacketFingerprint' <> normalized ->> 'reviewPacketFingerprint'
    or (approval ->> 'decision' = 'approved'
      and normalized ->> 'reasonCode' <> 'review-complete-no-material-blockers')
    or (approval ->> 'decision' = 'rejected'
      and normalized ->> 'reasonCode' <> 'material-changes-required')
    or approval ->> 'evidencePointer' <> ('p32-candidate-review:' || approval_id_value::text)
    or approval ->> 'decisionHash' !~ '^[0-9a-f]{64}$'
    or coalesce((approval ->> 'releaseAuthorityGranted')::boolean, true)
    or approved_at_value < now() - interval '5 minutes'
    or approved_at_value > now() + interval '5 minutes'
    or approval_expires_at_value <= approved_at_value
    or approval_expires_at_value > approved_at_value + interval '7 days'
    or normalized ->> 'payloadHash' !~ '^[0-9a-f]{64}$'
    or normalized ->> 'signatureFingerprint' !~ '^[0-9a-f]{64}$'
    or normalized ->> 'issuer' !~ '^[A-Za-z0-9][A-Za-z0-9._:/-]{2,127}$'
    or normalized ->> 'keyId' !~ '^[A-Za-z0-9][A-Za-z0-9._:/-]{2,127}$'
    or attestation_value ->> 'version' <> 'scrimed-p32-supplemental-evidence-attestation-v1'
    or attestation_value ->> 'algorithm' <> 'Ed25519'
    or attestation_value ->> 'issuer' <> normalized ->> 'issuer'
    or attestation_value ->> 'keyId' <> normalized ->> 'keyId'
    or attestation_value ->> 'payloadHash' <> normalized ->> 'payloadHash'
    or attestation_value ->> 'signature' !~ '^[A-Za-z0-9_-]{86}$'
    or signed_at_value <> approved_at_value
    or attestation_expires_at_value <= signed_at_value
    or attestation_expires_at_value > signed_at_value + interval '1 hour' then
    raise exception 'p32-candidate-review-decision-validation-failed';
  end if;

  if exists (
    select 1
    from private.p32_candidate_review_decisions existing
    where existing.assignment_id = assignment_id_value
  ) then
    raise exception 'p32-candidate-review-assignment-already-decided';
  end if;
  if exists (
    select 1
    from private.p32_candidate_review_decisions existing
    where existing.workspace_id = selected_workspace.id
      and existing.idempotency_key = idempotency_key_value
  ) then
    raise exception 'p32-candidate-review-idempotency-replay';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext(selected_workspace.id::text || '|p32-candidate-review-decision')
  );
  select decision.audit_hash
  into previous_hash_value
  from private.p32_candidate_review_decisions decision
  where decision.workspace_id = selected_workspace.id
  order by decision.created_at desc, decision.id desc
  limit 1;

  audit_hash_value := encode(extensions.digest(concat_ws(
    '|',
    coalesce(previous_hash_value, ''),
    approval_id_value::text,
    assignment_id_value::text,
    selected_workspace.tenant_id::text,
    selected_workspace.id::text,
    reviewer_identity_hash_value,
    approval ->> 'decision',
    normalized ->> 'reasonCode',
    normalized ->> 'reviewPacketFingerprint',
    normalized ->> 'issuer',
    normalized ->> 'keyId',
    approval ->> 'decisionHash',
    normalized ->> 'payloadHash',
    normalized ->> 'signatureFingerprint',
    (select auth.uid())::text,
    created_at_value::text
  ), 'sha256'), 'hex');

  insert into private.p32_candidate_review_decisions (
    id,
    assignment_id,
    tenant_id,
    workspace_id,
    idempotency_key,
    reviewer_identity_hash,
    decision,
    reason_code,
    review_packet_fingerprint,
    issuer,
    key_id,
    approval_evidence,
    attestation,
    payload_hash,
    signature_fingerprint,
    decided_by,
    previous_audit_hash,
    audit_hash,
    created_at
  ) values (
    approval_id_value,
    assignment_id_value,
    selected_workspace.tenant_id,
    selected_workspace.id,
    idempotency_key_value,
    reviewer_identity_hash_value,
    approval ->> 'decision',
    normalized ->> 'reasonCode',
    normalized ->> 'reviewPacketFingerprint',
    normalized ->> 'issuer',
    normalized ->> 'keyId',
    approval,
    attestation_value,
    normalized ->> 'payloadHash',
    normalized ->> 'signatureFingerprint',
    (select auth.uid()),
    previous_hash_value,
    audit_hash_value,
    created_at_value
  );

  return jsonb_build_object(
    'receipt', jsonb_build_object(
      'approvalId', approval_id_value,
      'assignmentId', assignment_id_value,
      'auditHash', audit_hash_value,
      'previousAuditHash', previous_hash_value,
      'recordedAt', created_at_value
    ),
    'boundary', 'synthetic-metadata-only-no-release-authority'
  );
end;
$$;

create or replace function public.create_p32_candidate_review_assignment(
  p_workspace_slug text,
  p_assignment jsonb
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.create_p32_candidate_review_assignment(
    p_workspace_slug,
    p_assignment
  );
$$;

create or replace function public.record_p32_candidate_review_decision(
  p_workspace_slug text,
  p_decision jsonb
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_p32_candidate_review_decision(
    p_workspace_slug,
    p_decision
  );
$$;

create or replace function private.get_p32_candidate_review_evidence(
  p_workspace_slug text,
  p_candidate jsonb
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_assignment private.p32_candidate_review_assignments%rowtype;
  selected_decision private.p32_candidate_review_decisions%rowtype;
  normalized jsonb := coalesce(p_candidate, '{}'::jsonb);
  actor_role text;
  reviewer_identity_hash_value text;
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead', 'reviewer']
  );

  if jsonb_typeof(normalized) <> 'object'
    or pg_column_size(normalized) > 4096
    or normalized - array[
      'sourceCommit',
      'sourceTreeFingerprint',
      'artifactFingerprint',
      'validationEvidenceFingerprint',
      'reviewPacketFingerprint'
    ] <> '{}'::jsonb
    or normalized ->> 'sourceCommit' !~ '^[0-9a-f]{40}$'
    or normalized ->> 'sourceTreeFingerprint' !~ '^[0-9a-f]{64}$'
    or normalized ->> 'artifactFingerprint' !~ '^[0-9a-f]{64}$'
    or normalized ->> 'validationEvidenceFingerprint' !~ '^[0-9a-f]{64}$'
    or normalized ->> 'reviewPacketFingerprint' !~ '^[0-9a-f]{64}$' then
    raise exception 'p32-candidate-review-recovery-invalid-candidate';
  end if;

  select membership.role
  into actor_role
  from public.pilot_memberships membership
  where membership.tenant_id = selected_workspace.tenant_id
    and membership.user_id = (select auth.uid())
    and membership.status = 'active'
    and membership.role in ('tenant-admin', 'pilot-lead', 'reviewer')
  limit 1;

  if actor_role is null then
    raise exception 'p32-candidate-review-recovery-role-denied';
  end if;

  reviewer_identity_hash_value := encode(extensions.digest(
    'scrimed-p32-reviewer-v1|' || (select auth.uid())::text,
    'sha256'
  ), 'hex');

  select assignment.*
  into selected_assignment
  from private.p32_candidate_review_assignments assignment
  where assignment.workspace_id = selected_workspace.id
    and assignment.tenant_id = selected_workspace.tenant_id
    and assignment.source_commit = normalized ->> 'sourceCommit'
    and assignment.source_tree_fingerprint = normalized ->> 'sourceTreeFingerprint'
    and assignment.artifact_fingerprint = normalized ->> 'artifactFingerprint'
    and assignment.validation_evidence_fingerprint = normalized ->> 'validationEvidenceFingerprint'
    and assignment.review_packet_fingerprint = normalized ->> 'reviewPacketFingerprint'
    and (
      (actor_role in ('tenant-admin', 'pilot-lead')
        and assignment.assigned_by = (select auth.uid()))
      or (actor_role = 'reviewer'
        and assignment.reviewer_identity_hash = reviewer_identity_hash_value)
    )
  order by assignment.created_at desc, assignment.id desc
  limit 1;

  if selected_assignment.id is null then
    return jsonb_build_object(
      'assignment', null,
      'decision', null,
      'evidenceFile', null,
      'receipt', null,
      'humanDecisionRecorded', false,
      'releaseAuthorityGranted', false,
      'boundary', 'synthetic-metadata-only-no-release-authority'
    );
  end if;

  select decision.*
  into selected_decision
  from private.p32_candidate_review_decisions decision
  where decision.assignment_id = selected_assignment.id
    and decision.workspace_id = selected_workspace.id
    and decision.tenant_id = selected_workspace.tenant_id;

  return jsonb_build_object(
    'assignment', jsonb_build_object(
      'assignmentId', selected_assignment.id,
      'reviewerIdentityHash', selected_assignment.reviewer_identity_hash,
      'reviewerRole', selected_assignment.reviewer_role,
      'sourceCommit', selected_assignment.source_commit,
      'sourceTreeFingerprint', selected_assignment.source_tree_fingerprint,
      'artifactFingerprint', selected_assignment.artifact_fingerprint,
      'validationEvidenceFingerprint', selected_assignment.validation_evidence_fingerprint,
      'reviewPacketFingerprint', selected_assignment.review_packet_fingerprint,
      'assignedAt', selected_assignment.assigned_at,
      'expiresAt', selected_assignment.expires_at
    ),
    'decision', case
      when selected_decision.id is null then null
      else jsonb_build_object(
        'approvalId', selected_decision.id,
        'decision', selected_decision.decision,
        'reasonCode', selected_decision.reason_code,
        'decidedAt', selected_decision.created_at
      )
    end,
    'evidenceFile', case
      when selected_decision.id is null then null
      else jsonb_build_object(
        'automatedEvidence', jsonb_build_array(),
        'approvals', jsonb_build_array(selected_decision.approval_evidence),
        'attestation', selected_decision.attestation
      )
    end,
    'receipt', case
      when selected_decision.id is null then null
      else jsonb_build_object(
        'approvalId', selected_decision.id,
        'assignmentId', selected_decision.assignment_id,
        'auditHash', selected_decision.audit_hash,
        'previousAuditHash', selected_decision.previous_audit_hash,
        'recordedAt', selected_decision.created_at
      )
    end,
    'humanDecisionRecorded', selected_decision.id is not null,
    'releaseAuthorityGranted', false,
    'boundary', 'synthetic-metadata-only-no-release-authority'
  );
end;
$$;

create or replace function public.get_p32_candidate_review_evidence(
  p_workspace_slug text,
  p_candidate jsonb
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select private.get_p32_candidate_review_evidence(
    p_workspace_slug,
    p_candidate
  );
$$;

revoke all on function private.prevent_p32_candidate_review_mutation()
  from public, anon, authenticated, service_role;
revoke all on function private.create_p32_candidate_review_assignment(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function private.record_p32_candidate_review_decision(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.create_p32_candidate_review_assignment(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.record_p32_candidate_review_decision(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function private.get_p32_candidate_review_evidence(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.get_p32_candidate_review_evidence(text, jsonb)
  from public, anon, authenticated, service_role;
grant execute on function private.create_p32_candidate_review_assignment(text, jsonb)
  to authenticated;
grant execute on function private.record_p32_candidate_review_decision(text, jsonb)
  to authenticated;
grant execute on function public.create_p32_candidate_review_assignment(text, jsonb)
  to authenticated;
grant execute on function public.record_p32_candidate_review_decision(text, jsonb)
  to authenticated;
grant execute on function private.get_p32_candidate_review_evidence(text, jsonb)
  to authenticated;
grant execute on function public.get_p32_candidate_review_evidence(text, jsonb)
  to authenticated;

comment on table private.p32_candidate_review_assignments is
  'Append-only, tenant-scoped, no-PHI assignments binding a distinct reviewer to one exact p.32 candidate and review packet.';
comment on table private.p32_candidate_review_decisions is
  'Append-only, tenant-scoped, no-PHI named-reviewer decisions and public signatures. No row grants release or deployment authority.';
comment on function public.create_p32_candidate_review_assignment(text, jsonb) is
  'Requires an AAL2 governance session, server runtime token, tenant-admin or pilot-lead role, an active distinct reviewer membership, exact candidate hashes, and one-use idempotency.';
comment on function public.record_p32_candidate_review_decision(text, jsonb) is
  'Requires an AAL2 governance session, server runtime token, active reviewer role, exact assignment and candidate binding, separation of duties, bounded evidence, and one-use idempotency.';
comment on function public.get_p32_candidate_review_evidence(text, jsonb) is
  'Recovers only exact-candidate signed evidence visible to the assigning tenant administrator or assigned reviewer. It exposes no raw identity, idempotency, private-key, PHI, or release-authority data.';
