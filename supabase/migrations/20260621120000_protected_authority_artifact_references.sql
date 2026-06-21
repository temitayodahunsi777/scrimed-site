create table if not exists public.protected_authority_artifact_references (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  artifact_intake_item_id text not null check (
    char_length(artifact_intake_item_id) between 4 and 140
    and artifact_intake_item_id ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  authority_key text not null check (
    authority_key in (
      'live-clinical-care-authority',
      'phi-processing-authority',
      'legal-contracting-approval',
      'regional-regulatory-approval',
      'reimbursement-policy-approval',
      'security-certification-procurement',
      'production-clinical-authorization',
      'certified-health-it-connector-approval'
    )
  ),
  authority_label text not null check (
    char_length(authority_label) between 4 and 140
    and authority_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  owner_assignment_id text not null check (
    char_length(owner_assignment_id) between 4 and 140
    and owner_assignment_id ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  owner_role text not null check (
    char_length(owner_role) between 4 and 140
    and owner_role ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  owner_label text not null check (
    char_length(owner_label) between 4 and 140
    and owner_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  owner_side text not null check (
    owner_side in ('customer', 'scrimed', 'qualified-external')
  ),
  reference_status text not null check (
    reference_status in (
      'reference-needed',
      'reference-recorded',
      'review-pending',
      'accepted-metadata-only',
      'renewal-required',
      'rejected-or-expired'
    )
  ),
  external_system_label text not null check (
    char_length(external_system_label) between 4 and 140
    and external_system_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  external_reference_id text not null check (
    char_length(external_reference_id) between 4 and 160
    and external_reference_id ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,159}$'
  ),
  reviewer_label text not null check (
    char_length(reviewer_label) between 4 and 140
    and reviewer_label ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  reviewer_role text not null check (
    char_length(reviewer_role) between 4 and 140
    and reviewer_role ~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
  ),
  validated_at timestamptz not null,
  expires_at timestamptz not null,
  renewal_alert_at timestamptz not null,
  evidence_snapshot jsonb not null default '{}'::jsonb
    check (jsonb_typeof(evidence_snapshot) = 'object' and pg_column_size(evidence_snapshot) <= 8192),
  required_reference_controls text[] not null
    check (cardinality(required_reference_controls) = 12),
  linked_reference_controls text[] not null default '{}'::text[]
    check (cardinality(linked_reference_controls) between 0 and 12),
  missing_reference_controls text[] not null default '{}'::text[]
    check (cardinality(missing_reference_controls) between 0 and 12),
  retained_blockers text[] not null default '{}'::text[]
    check (cardinality(retained_blockers) between 1 and 20),
  release_restrictions text[] not null default '{}'::text[]
    check (cardinality(release_restrictions) between 1 and 20),
  artifact_retained_externally boolean not null default true
    check (artifact_retained_externally is true),
  artifact_upload_disabled boolean not null default true
    check (artifact_upload_disabled is true),
  phi_storage_disabled boolean not null default true
    check (phi_storage_disabled is true),
  sensitive_artifact_storage_disabled boolean not null default true
    check (sensitive_artifact_storage_disabled is true),
  authority_granted boolean not null default false
    check (authority_granted is false),
  human_review_required boolean not null default true
    check (human_review_required is true),
  attestation text not null check (
    attestation = 'authority-artifact-reference-metadata-no-artifact-storage'
  ),
  review_note text not null default '' check (char_length(review_note) <= 300),
  data_boundary text not null check (data_boundary = 'metadata-only-no-phi-no-artifact-storage'),
  reference_authority text not null default 'external-authority-artifact-reference-status-not-approval'
    check (reference_authority = 'external-authority-artifact-reference-status-not-approval'),
  storage_authority text not null default 'no-artifact-storage-no-sensitive-documents'
    check (storage_authority = 'no-artifact-storage-no-sensitive-documents'),
  clinical_execution_authority text not null default 'not-authorized-live-care'
    check (clinical_execution_authority = 'not-authorized-live-care'),
  recorded_by uuid not null references auth.users(id) on delete restrict,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  boundary text not null default
    'Protected Authority Artifact References v1 records only sanitized metadata about externally retained authority artifacts. It stores no PHI, patient identifiers, payer member data, production credentials, URLs, signed artifacts, signature images, legal opinions, security reports, reimbursement determinations, regional approvals, clinical validation artifacts, certification evidence, source files, contracts, approvals, or uploaded documents. Reference status capture does not grant clinical, legal, privacy, reimbursement, security, regional, connector, production, procurement, distribution, or live-care authority.',
  check (expires_at > validated_at),
  check (renewal_alert_at >= validated_at and renewal_alert_at <= expires_at)
);

create index if not exists protected_authority_artifact_references_tenant_recorded_at_idx
  on public.protected_authority_artifact_references(tenant_id, recorded_at desc);
create index if not exists protected_authority_artifact_references_workspace_recorded_at_idx
  on public.protected_authority_artifact_references(workspace_id, recorded_at desc);
create index if not exists protected_authority_artifact_references_authority_idx
  on public.protected_authority_artifact_references(workspace_id, authority_key, recorded_at desc);
create index if not exists protected_authority_artifact_references_status_idx
  on public.protected_authority_artifact_references(workspace_id, reference_status, recorded_at desc);
create index if not exists protected_authority_artifact_references_item_idx
  on public.protected_authority_artifact_references(workspace_id, artifact_intake_item_id, recorded_at desc);
create index if not exists protected_authority_artifact_references_recorded_by_idx
  on public.protected_authority_artifact_references(recorded_by);

alter table public.protected_authority_artifact_references enable row level security;
revoke all on public.protected_authority_artifact_references from public, anon, authenticated;
grant select on public.protected_authority_artifact_references to authenticated;

drop policy if exists protected_authority_artifact_references_member_select
  on public.protected_authority_artifact_references;
create policy protected_authority_artifact_references_member_select
on public.protected_authority_artifact_references
for select
to authenticated
using (
  (select private.has_valid_governance_session())
  and (select private.is_pilot_member(tenant_id))
);

alter table public.pilot_audit_events
  drop constraint if exists pilot_audit_events_event_type_check;

alter table public.pilot_audit_events
  add constraint pilot_audit_events_event_type_check check (
    event_type in (
      'synthetic-session-created',
      'production-request-denied',
      'proof-packet-downloaded',
      'trustos-decision-recorded',
      'trustos-review-recorded',
      'trustos-governance-packet-downloaded',
      'agent-work-order-created',
      'agent-work-order-transitioned',
      'agent-work-order-closed',
      'agent-work-order-proof-packet-downloaded',
      'agent-workspace-governance-ledger-recorded',
      'trust-safety-incident-created',
      'trust-safety-incident-updated',
      'trust-safety-incident-packet-downloaded',
      'enterprise-proof-packet-downloaded',
      'demo-readiness-snapshot-created',
      'demo-readiness-packet-downloaded',
      'buyer-pilot-room-packet-downloaded',
      'opportunity-workspace-provisioned',
      'buyer-tenant-lifecycle-activated',
      'production-readiness-prepared',
      'customer-activation-approvals-recorded',
      'buyer-diligence-room-prepared',
      'secure-evidence-vault-readiness-prepared',
      'sales-demo-session-recorded',
      'sales-demo-session-packet-downloaded',
      'manual-qa-evidence-packet-recorded',
      'command-intelligence-snapshot-created',
      'command-intelligence-packet-downloaded',
      'clinical-activation-approval-recorded',
      'operator-metric-recorded',
      'protected-metric-rollup-created',
      'protected-metric-rollup-packet-downloaded',
      'protected-metric-trend-review-created',
      'protected-metric-trend-packet-downloaded',
      'protected-board-scorecard-created',
      'protected-board-scorecard-packet-downloaded',
      'protected-finance-methodology-gate-recorded',
      'protected-external-approval-evidence-recorded',
      'protected-release-decision-recorded',
      'protected-named-reviewer-signoff-recorded',
      'protected-distribution-lockbox-recorded',
      'protected-release-authority-attestation-recorded',
      'protected-evidence-room-recipient-attestation-recorded',
      'protected-evidence-room-access-log-reconciliation-recorded',
      'protected-evidence-room-provider-adapter-recorded',
      'protected-provider-security-review-recorded',
      'protected-procurement-evidence-recorded',
      'protected-authority-artifact-reference-recorded'
    )
  );

create or replace function private.record_protected_authority_artifact_reference(
  p_workspace_slug text,
  p_reference_input jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  normalized_input jsonb := coalesce(p_reference_input, '{}'::jsonb);
  artifact_intake_item_id_value text;
  authority_key_value text;
  authority_label_value text;
  owner_assignment_id_value text;
  owner_role_value text;
  owner_label_value text;
  owner_side_value text;
  supplied_reference_status_value text;
  reference_status_value text;
  external_system_label_value text;
  external_reference_id_value text;
  reviewer_label_value text;
  reviewer_role_value text;
  validated_at_value timestamptz;
  expires_at_value timestamptz;
  renewal_alert_at_value timestamptz;
  attestation_value text;
  data_boundary_value text;
  review_note_value text;
  actor_role text;
  required_controls text[] := array[
    'intake-item-linked',
    'external-system-identified',
    'reference-id-recorded',
    'reviewer-label-recorded',
    'reviewer-role-recorded',
    'validation-timestamp-recorded',
    'expiration-date-recorded',
    'renewal-alert-recorded',
    'artifact-retained-externally',
    'artifact-upload-disabled',
    'phi-storage-disabled',
    'human-review-required'
  ];
  linked_controls text[] := array[
    'intake-item-linked',
    'external-system-identified',
    'reference-id-recorded',
    'reviewer-label-recorded',
    'reviewer-role-recorded',
    'validation-timestamp-recorded',
    'expiration-date-recorded',
    'renewal-alert-recorded',
    'artifact-retained-externally',
    'artifact-upload-disabled',
    'phi-storage-disabled',
    'human-review-required'
  ];
  missing_controls text[] := '{}'::text[];
  retained_blockers_value text[];
  release_restrictions_value text[];
  evidence_snapshot_value jsonb;
  created_reference_id uuid;
  protected_boundary text :=
    'Protected Authority Artifact References v1 records only sanitized metadata about externally retained authority artifacts. It stores no PHI, patient identifiers, payer member data, production credentials, URLs, signed artifacts, signature images, legal opinions, security reports, reimbursement determinations, regional approvals, clinical validation artifacts, certification evidence, source files, contracts, approvals, or uploaded documents. Reference status capture does not grant clinical, legal, privacy, reimbursement, security, regional, connector, production, procurement, distribution, or live-care authority.';
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead', 'reviewer']
  );

  if jsonb_typeof(normalized_input) <> 'object'
    or pg_column_size(normalized_input) > 7168 then
    raise exception 'protected-authority-artifact-reference-invalid-payload';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(normalized_input) as supplied(key)
    where supplied.key <> all(array[
      'artifactIntakeItemId',
      'authorityKey',
      'authorityLabel',
      'ownerAssignmentId',
      'ownerRole',
      'ownerLabel',
      'ownerSide',
      'referenceStatus',
      'externalSystemLabel',
      'externalReferenceId',
      'reviewerLabel',
      'reviewerRole',
      'validatedAt',
      'expiresAt',
      'renewalAlertAt',
      'artifactRetainedExternally',
      'artifactUploadDisabled',
      'phiStorageDisabled',
      'sensitiveArtifactStorageDisabled',
      'authorityGranted',
      'humanReviewRequired',
      'attestation',
      'dataBoundary',
      'reviewNote'
    ])
  ) then
    raise exception 'protected-authority-artifact-reference-unsupported-field';
  end if;

  artifact_intake_item_id_value := left(trim(coalesce(normalized_input ->> 'artifactIntakeItemId', '')), 141);
  authority_key_value := trim(coalesce(normalized_input ->> 'authorityKey', ''));
  authority_label_value := left(trim(coalesce(normalized_input ->> 'authorityLabel', '')), 141);
  owner_assignment_id_value := left(trim(coalesce(normalized_input ->> 'ownerAssignmentId', '')), 141);
  owner_role_value := left(trim(coalesce(normalized_input ->> 'ownerRole', '')), 141);
  owner_label_value := left(trim(coalesce(normalized_input ->> 'ownerLabel', '')), 141);
  owner_side_value := trim(coalesce(normalized_input ->> 'ownerSide', ''));
  supplied_reference_status_value := trim(coalesce(normalized_input ->> 'referenceStatus', ''));
  external_system_label_value := left(trim(coalesce(normalized_input ->> 'externalSystemLabel', '')), 141);
  external_reference_id_value := left(trim(coalesce(normalized_input ->> 'externalReferenceId', '')), 161);
  reviewer_label_value := left(trim(coalesce(normalized_input ->> 'reviewerLabel', '')), 141);
  reviewer_role_value := left(trim(coalesce(normalized_input ->> 'reviewerRole', '')), 141);
  attestation_value := trim(coalesce(normalized_input ->> 'attestation', ''));
  data_boundary_value := trim(coalesce(normalized_input ->> 'dataBoundary', ''));
  review_note_value := left(trim(coalesce(normalized_input ->> 'reviewNote', '')), 301);

  begin
    validated_at_value := (normalized_input ->> 'validatedAt')::timestamptz;
    expires_at_value := (normalized_input ->> 'expiresAt')::timestamptz;
    renewal_alert_at_value := (normalized_input ->> 'renewalAlertAt')::timestamptz;
  exception when others then
    raise exception 'protected-authority-artifact-reference-invalid-timestamp';
  end;

  if artifact_intake_item_id_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or authority_key_value not in (
      'live-clinical-care-authority',
      'phi-processing-authority',
      'legal-contracting-approval',
      'regional-regulatory-approval',
      'reimbursement-policy-approval',
      'security-certification-procurement',
      'production-clinical-authorization',
      'certified-health-it-connector-approval'
    )
    or authority_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or owner_assignment_id_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or owner_role_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or owner_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or owner_side_value not in ('customer', 'scrimed', 'qualified-external')
    or supplied_reference_status_value not in (
      'reference-needed',
      'reference-recorded',
      'review-pending',
      'accepted-metadata-only',
      'renewal-required',
      'rejected-or-expired'
    )
    or external_system_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or external_reference_id_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,159}$'
    or reviewer_label_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or reviewer_role_value !~ '^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]{3,139}$'
    or expires_at_value <= validated_at_value
    or renewal_alert_at_value < validated_at_value
    or renewal_alert_at_value > expires_at_value
    or coalesce(normalized_input ->> 'artifactRetainedExternally', '') <> 'true'
    or coalesce(normalized_input ->> 'artifactUploadDisabled', '') <> 'true'
    or coalesce(normalized_input ->> 'phiStorageDisabled', '') <> 'true'
    or coalesce(normalized_input ->> 'sensitiveArtifactStorageDisabled', '') <> 'true'
    or coalesce(normalized_input ->> 'authorityGranted', '') <> 'false'
    or coalesce(normalized_input ->> 'humanReviewRequired', '') <> 'true'
    or attestation_value <> 'authority-artifact-reference-metadata-no-artifact-storage'
    or data_boundary_value <> 'metadata-only-no-phi-no-artifact-storage'
    or char_length(review_note_value) > 300 then
    raise exception 'protected-authority-artifact-reference-validation-failed';
  end if;

  if artifact_intake_item_id_value || ' ' || authority_key_value || ' ' || authority_label_value || ' ' || owner_assignment_id_value || ' ' || owner_role_value || ' ' || owner_label_value || ' ' || supplied_reference_status_value || ' ' || external_system_label_value || ' ' || external_reference_id_value || ' ' || reviewer_label_value || ' ' || reviewer_role_value || ' ' || review_note_value ~*
    '(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|sk-[A-Za-z0-9_-]{12,}|sbp_[A-Za-z0-9_-]{12,}|bearer[[:space:]]+[A-Za-z0-9._-]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|token|secret|password|api[ _-]?key|access[ _-]?key|client[ _-]?secret|oauth|https?:\/\/|ip address|device[ _-]?id|raw[ _-]?log|log row|patient[ _-]?(id|identifier|mrn)|member[ _-]?(id|identifier)|medical record|protected health information|payer member|diagnosis code|social security|source (contract|document|record|file)|signed[ _-]?(baa|dpa|contract|agreement|document|approval)|signature|legal opinion|soc[ _-]?2[ _-]?(report|certified|certification|type)|penetration[ _-]?test|vulnerability[ _-]?report|security questionnaire answer|confidential answer|audited financial|investment recommendation|securities offering|valuation guarantee|revenue guarantee|reimbursement guarantee|guaranteed savings|guaranteed outcome|advertising substantiation|clinical validation|compliance certification|fda[ _-]?cleared|hipaa[ _-]?(compliant|certified)|autonomous diagnosis|treatment recommendation|live clinical execution|public release approved|external distribution approved|release approved|export approved|integration approved|security approved|privacy approved|procurement approved|clinical approval|legal approved|production approved|baa executed|dpa executed|live integration|distribution enabled|release enabled|export enabled)' then
    raise exception 'protected-authority-artifact-reference-prohibited-content';
  end if;

  select membership.role
  into actor_role
  from public.pilot_memberships membership
  where membership.tenant_id = selected_workspace.tenant_id
    and membership.user_id = (select auth.uid())
    and membership.role in ('tenant-admin', 'pilot-lead', 'reviewer')
  limit 1;

  if actor_role is null then
    raise exception 'protected-authority-artifact-reference-role-denied';
  end if;

  select coalesce(array_agg(control order by control), '{}'::text[])
  into missing_controls
  from unnest(required_controls) as control
  where control <> all(linked_controls);

  reference_status_value := case
    when expires_at_value <= now() then 'rejected-or-expired'
    when renewal_alert_at_value <= now() then 'renewal-required'
    else supplied_reference_status_value
  end;

  retained_blockers_value := array[
    'Artifact upload disabled: true',
    'Authority granted by this metadata layer: false',
    'PHI, patient identifiers, payer member data, production credentials, URLs, source files, signed artifacts, signatures, legal opinions, security reports, clinical validation artifacts, certification evidence, reimbursement determinations, regional approvals, and production approvals must remain outside SCRIMED.',
    'Reference status capture does not create clinical, legal, privacy, reimbursement, security, regional, connector, procurement, production, distribution, or live-care authority.'
  ];

  release_restrictions_value := array[
    'No artifact, URL, source document, signed artifact, signature image, legal opinion, security report, certification evidence, regional approval, reimbursement determination, production credential, patient data, payer member data, or PHI can be released or stored by this metadata layer.',
    'No public release, external distribution, buyer proof, clinical use, PHI processing, connector activation, production activation, or live clinical execution can rely solely on reference metadata.',
    'Expired, rejected, missing, ambiguous, or renewal-required references must block authority escalation until a qualified external reviewer revalidates them.',
    'Qualified external systems remain the system of record for all authority artifacts.'
  ];

  evidence_snapshot_value := jsonb_build_object(
    'artifactIntakeItemId', artifact_intake_item_id_value,
    'authorityKey', authority_key_value,
    'authorityLabel', authority_label_value,
    'ownerAssignmentId', owner_assignment_id_value,
    'ownerRole', owner_role_value,
    'ownerLabel', owner_label_value,
    'ownerSide', owner_side_value,
    'referenceStatus', reference_status_value,
    'externalSystemLabel', external_system_label_value,
    'externalReferenceId', external_reference_id_value,
    'reviewerLabel', reviewer_label_value,
    'reviewerRole', reviewer_role_value,
    'validatedAt', validated_at_value,
    'expiresAt', expires_at_value,
    'renewalAlertAt', renewal_alert_at_value,
    'requiredReferenceControls', required_controls,
    'linkedReferenceControls', linked_controls,
    'missingReferenceControls', missing_controls,
    'artifactRetainedExternally', true,
    'artifactUploadDisabled', true,
    'phiStorageDisabled', true,
    'sensitiveArtifactStorageDisabled', true,
    'authorityGranted', false,
    'humanReviewRequired', true,
    'referenceAuthority', 'external-authority-artifact-reference-status-not-approval',
    'storageAuthority', 'no-artifact-storage-no-sensitive-documents',
    'clinicalExecutionAuthority', 'not-authorized-live-care',
    'assuranceLevel', 'aal2',
    'metadataOnly', true,
    'noPhi', true,
    'noArtifactStorage', true
  );

  insert into public.protected_authority_artifact_references (
    tenant_id,
    workspace_id,
    artifact_intake_item_id,
    authority_key,
    authority_label,
    owner_assignment_id,
    owner_role,
    owner_label,
    owner_side,
    reference_status,
    external_system_label,
    external_reference_id,
    reviewer_label,
    reviewer_role,
    validated_at,
    expires_at,
    renewal_alert_at,
    evidence_snapshot,
    required_reference_controls,
    linked_reference_controls,
    missing_reference_controls,
    retained_blockers,
    release_restrictions,
    artifact_retained_externally,
    artifact_upload_disabled,
    phi_storage_disabled,
    sensitive_artifact_storage_disabled,
    authority_granted,
    human_review_required,
    attestation,
    review_note,
    data_boundary,
    reference_authority,
    storage_authority,
    clinical_execution_authority,
    recorded_by,
    boundary
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    artifact_intake_item_id_value,
    authority_key_value,
    authority_label_value,
    owner_assignment_id_value,
    owner_role_value,
    owner_label_value,
    owner_side_value,
    reference_status_value,
    external_system_label_value,
    external_reference_id_value,
    reviewer_label_value,
    reviewer_role_value,
    validated_at_value,
    expires_at_value,
    renewal_alert_at_value,
    evidence_snapshot_value,
    required_controls,
    linked_controls,
    missing_controls,
    retained_blockers_value,
    release_restrictions_value,
    true,
    true,
    true,
    true,
    false,
    true,
    attestation_value,
    review_note_value,
    data_boundary_value,
    'external-authority-artifact-reference-status-not-approval',
    'no-artifact-storage-no-sensitive-documents',
    'not-authorized-live-care',
    (select auth.uid()),
    protected_boundary
  )
  returning id into created_reference_id;

  insert into public.pilot_audit_events (
    tenant_id,
    workspace_id,
    session_id,
    actor_user_id,
    event_type,
    event_metadata
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    null,
    (select auth.uid()),
    'protected-authority-artifact-reference-recorded',
    jsonb_build_object(
      'referenceId', created_reference_id,
      'artifactIntakeItemId', artifact_intake_item_id_value,
      'authorityKey', authority_key_value,
      'authorityLabel', authority_label_value,
      'referenceStatus', reference_status_value,
      'ownerSide', owner_side_value,
      'reviewerRole', reviewer_role_value,
      'requiredReferenceControls', required_controls,
      'linkedReferenceControls', linked_controls,
      'missingReferenceControls', missing_controls,
      'actorRole', actor_role,
      'artifactRetainedExternally', true,
      'artifactUploadDisabled', true,
      'phiStorageDisabled', true,
      'sensitiveArtifactStorageDisabled', true,
      'authorityGranted', false,
      'humanReviewRequired', true,
      'assuranceLevel', 'aal2',
      'metadataOnly', true,
      'noPhi', true,
      'noArtifactStorage', true,
      'referenceAuthority', 'external-authority-artifact-reference-status-not-approval',
      'storageAuthority', 'no-artifact-storage-no-sensitive-documents',
      'clinicalExecutionAuthority', 'not-authorized-live-care'
    )
  );

  return created_reference_id;
end;
$$;

create or replace function public.record_protected_authority_artifact_reference(
  p_workspace_slug text,
  p_reference_input jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_protected_authority_artifact_reference(
    p_workspace_slug,
    p_reference_input
  );
$$;

revoke all on function private.record_protected_authority_artifact_reference(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.record_protected_authority_artifact_reference(text, jsonb)
  from public, anon, authenticated, service_role;

grant execute on function private.record_protected_authority_artifact_reference(text, jsonb)
  to authenticated;
grant execute on function public.record_protected_authority_artifact_reference(text, jsonb)
  to authenticated;

create or replace function public.protected_pilot_runtime_status()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'ready', true,
    'schemaVersion', '2026-06-21.1',
    'boundary', 'synthetic-pilot-only',
    'tenantIsolation', 'postgres-row-level-security',
    'durableAudit', 'append-only',
    'governanceLedger', 'aal2-append-only',
    'agentWorkspaceWorkOrders', true,
    'agentWorkspaceDashboardFilters', true,
    'agentWorkspaceProofPackets', 'aal2-audited-downloads',
    'agentWorkspaceGovernanceLedger', true,
    'agentWorkspaceIncidentExport', 'write-before-release',
    'tenantTrustSafetyIncidents', 'private-schema-rpc-guarded',
    'tenantTrustSafetyIncidentPackets', 'write-before-release',
    'tenantPasskeyIdentity', 'passkey-or-magic-link',
    'enterpriseProofPackets', 'write-before-release-aggregate-export',
    'pilotDemoReadinessSnapshots', 'aal2-audited-snapshot-packets',
    'buyerPilotRoomPackets', 'aal2-audited-buyer-room-packets',
    'opportunityWorkspaceProvisioning', 'aal2-private-rpc-buyer-workspace-linkage',
    'buyerTenantLifecycleAutomation', 'aal2-private-rpc-sso-access-review-archive-controls'
  ) || jsonb_build_object(
    'productionActivationReadiness', 'aal2-private-rpc-domain-origin-invitation-access-archive-controls',
    'customerActivationApprovals', 'aal2-private-rpc-paid-pilot-setup-approval-hard-gates-retained',
    'buyerDiligenceRooms', 'aal2-private-rpc-metadata-only-signed-controls-diligence',
    'secureEvidenceVaultReadiness', 'aal2-private-rpc-disabled-by-default-storage-control-readiness',
    'salesBuyerDemoSessions', 'aal2-private-rpc-no-phi-demo-session-history',
    'manualQaEvidencePackets', 'aal2-tenant-scoped-no-secret-evidence-persistence',
    'commandIntelligenceSnapshots', 'aal2-audited-command-posture-history',
    'commandIntelligencePackets', 'write-before-release-command-intelligence-packets',
    'clinicalActivationApprovals', 'aal2-no-phi-approval-ledger-live-care-blocked',
    'protectedOperatorMetrics', 'aal2-public-market-operator-metric-ledger-no-phi',
    'protectedMetricRollups', 'aal2-finance-reviewed-metric-rollups-no-phi',
    'protectedMetricRollupPackets', 'aal2-audited-board-metric-packets-no-phi',
    'protectedMetricTrendReviews', 'aal2-board-trend-review-no-phi',
    'protectedMetricTrendPackets', 'aal2-audited-board-trend-packets-no-phi',
    'protectedBoardScorecards', 'aal2-rolling-quarter-board-scorecards-no-phi',
    'protectedBoardScorecardPackets', 'aal2-audited-board-scorecard-packets-no-phi'
  ) || jsonb_build_object(
    'protectedFinanceMethodologyGates', 'aal2-finance-methodology-gates-no-phi',
    'protectedFinanceMethodologyPackets', 'aal2-audited-finance-methodology-gate-packets-no-phi',
    'protectedExternalApprovalEvidence', 'aal2-qualified-external-approval-evidence-links-no-phi',
    'protectedExternalApprovalEvidencePackets', 'aal2-audited-external-approval-evidence-link-packets-no-phi',
    'protectedReleaseDecisionWorkflow', 'aal2-qualified-release-decision-workflow-no-phi',
    'protectedReleaseDecisionPackets', 'aal2-audited-release-decision-claim-registry-packets-no-phi',
    'protectedNamedReviewerSignoffs', 'aal2-named-reviewer-signoff-metadata-no-phi',
    'protectedNamedReviewerSignoffPackets', 'aal2-audited-named-reviewer-signoff-packets-no-phi',
    'protectedDistributionLockboxes', 'aal2-external-distribution-lockbox-disabled-no-phi',
    'protectedDistributionLockboxPackets', 'aal2-audited-distribution-lockbox-packets-no-phi',
    'protectedReleaseAuthorityAttestations', 'aal2-external-release-authority-attestations-disabled-no-phi',
    'protectedReleaseAuthorityAttestationPackets', 'aal2-audited-release-authority-attestation-packets-no-phi',
    'protectedEvidenceRoomRecipientAttestations', 'aal2-evidence-room-recipient-attestations-disabled-no-phi',
    'protectedEvidenceRoomRecipientAttestationPackets', 'aal2-audited-evidence-room-recipient-attestation-packets-no-phi',
    'protectedEvidenceRoomAccessLogReconciliations', 'aal2-evidence-room-access-log-reconciliation-disabled-no-phi',
    'protectedEvidenceRoomAccessLogReconciliationPackets', 'aal2-audited-evidence-room-access-log-reconciliation-packets-no-phi',
    'protectedEvidenceRoomProviderAdapters', 'aal2-evidence-room-provider-adapter-contracts-disabled-no-phi',
    'protectedEvidenceRoomProviderAdapterPackets', 'aal2-audited-evidence-room-provider-adapter-packets-no-phi',
    'protectedProviderSecurityReviews', 'aal2-provider-security-review-workbench-no-phi',
    'protectedProviderSecurityReviewPackets', 'aal2-audited-provider-security-review-packets-no-phi',
    'protectedProcurementEvidenceRegistry', 'aal2-procurement-evidence-registry-no-sensitive-artifacts',
    'protectedProcurementEvidenceRegistryPackets', 'aal2-audited-procurement-evidence-registry-packets-no-sensitive-artifacts',
    'protectedAuthorityArtifactReferences', 'aal2-authority-artifact-reference-status-capture-no-artifact-storage',
    'protectedAuthorityArtifactReferencePackets', 'aal2-audited-authority-artifact-reference-status-packet-no-artifact-storage'
  );
$$;

comment on table public.protected_authority_artifact_references is
  'Tenant-scoped no-PHI metadata-only ledger for external authority artifact references. RLS select requires authenticated AAL2 governance context and tenant membership. Writes require guarded RPC. This table does not store PHI, patient identifiers, payer member data, live clinical records, source documents, source contracts, secrets, credentials, URLs, access tokens, signed artifacts, signatures, legal opinions, security reports, reimbursement determinations, clinical validation artifacts, certification evidence, production approvals, authority approvals, or live clinical execution approval.';
comment on function private.record_protected_authority_artifact_reference(text, jsonb) is
  'Records bounded no-PHI external authority artifact reference metadata after AAL2 governance authorization and appends an audit event. This is not clinical approval, legal approval, privacy approval, reimbursement certainty, security certification, regional approval, connector approval, production authorization, external distribution approval, or live clinical execution authority.';
