create table if not exists public.clinical_activation_approvals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  domain_id text not null check (
    domain_id in (
      'regulatory-classification',
      'clinical-governance-safety',
      'privacy-security-phi-readiness',
      'interoperability-connector-validation',
      'legal-commercial-reimbursement-boundary',
      'go-live-rollback-operations'
    )
  ),
  domain_label text not null check (char_length(domain_label) between 2 and 180),
  approval_status text not null check (
    approval_status in (
      'readiness-attested-no-phi',
      'external-review-required-acknowledged',
      'customer-specific-required-acknowledged',
      'blocked-before-go-live-acknowledged'
    )
  ),
  approval_scope text not null default 'no-phi-readiness-review-only'
    check (approval_scope = 'no-phi-readiness-review-only'),
  reviewer_role text not null check (char_length(reviewer_role) between 2 and 300),
  attestation text not null check (attestation = 'aal2-readiness-attestation-no-phi'),
  evidence_snapshot jsonb not null default '{}'::jsonb
    check (jsonb_typeof(evidence_snapshot) = 'object' and pg_column_size(evidence_snapshot) <= 32768),
  retained_blockers jsonb not null default '[]'::jsonb
    check (jsonb_typeof(retained_blockers) = 'array' and pg_column_size(retained_blockers) <= 32768),
  no_phi_attestation boolean not null default true check (no_phi_attestation),
  clinical_go_live_authority text not null default 'not-authorized-live-care'
    check (clinical_go_live_authority = 'not-authorized-live-care'),
  signed_by uuid not null references auth.users(id) on delete restrict,
  signed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  boundary text not null check (char_length(boundary) between 80 and 2000)
);

create index if not exists clinical_activation_approvals_tenant_id_idx
  on public.clinical_activation_approvals(tenant_id);
create index if not exists clinical_activation_approvals_workspace_signed_idx
  on public.clinical_activation_approvals(workspace_id, signed_at desc);
create index if not exists clinical_activation_approvals_domain_idx
  on public.clinical_activation_approvals(workspace_id, domain_id, signed_at desc);
create index if not exists clinical_activation_approvals_signed_by_idx
  on public.clinical_activation_approvals(signed_by);

alter table public.clinical_activation_approvals enable row level security;
revoke all on public.clinical_activation_approvals from public, anon, authenticated;
grant select on public.clinical_activation_approvals to authenticated;

drop policy if exists clinical_activation_approvals_member_select
  on public.clinical_activation_approvals;
create policy clinical_activation_approvals_member_select
on public.clinical_activation_approvals
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
      'clinical-activation-approval-recorded'
    )
  );

create or replace function private.record_clinical_activation_approval(
  p_workspace_slug text,
  p_domain_id text,
  p_domain_label text,
  p_approval_status text,
  p_reviewer_role text,
  p_evidence_snapshot jsonb,
  p_retained_blockers jsonb,
  p_attestation text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  actor_role text;
  created_approval_id uuid;
  approval_boundary text :=
    'AAL2 no-PHI clinical activation readiness attestation for regulated deployment planning only. This does not create legal advice, clinical approval, FDA clearance, HIPAA compliance certification, reimbursement determination, PHI authorization, patient outreach permission, production connector authorization, diagnosis, treatment, record mutation, payer submission, autonomous clinical authority, or live clinical execution approval.';
  normalized_evidence jsonb := coalesce(p_evidence_snapshot, '{}'::jsonb);
  normalized_blockers jsonb := coalesce(p_retained_blockers, '[]'::jsonb);
begin
  if not private.has_valid_governance_session() then
    raise exception 'clinical-activation-aal2-session-required';
  end if;

  perform private.require_sales_server_token();

  if p_domain_id not in (
    'regulatory-classification',
    'clinical-governance-safety',
    'privacy-security-phi-readiness',
    'interoperability-connector-validation',
    'legal-commercial-reimbursement-boundary',
    'go-live-rollback-operations'
  ) then
    raise exception 'invalid-clinical-activation-domain';
  end if;

  if p_approval_status not in (
    'readiness-attested-no-phi',
    'external-review-required-acknowledged',
    'customer-specific-required-acknowledged',
    'blocked-before-go-live-acknowledged'
  ) then
    raise exception 'invalid-clinical-activation-approval-status';
  end if;

  if p_attestation <> 'aal2-readiness-attestation-no-phi' then
    raise exception 'invalid-clinical-activation-attestation';
  end if;

  if char_length(trim(coalesce(p_domain_label, ''))) < 2
    or char_length(trim(coalesce(p_domain_label, ''))) > 180
    or char_length(trim(coalesce(p_reviewer_role, ''))) < 2
    or char_length(trim(coalesce(p_reviewer_role, ''))) > 300 then
    raise exception 'invalid-clinical-activation-approval-field';
  end if;

  if jsonb_typeof(normalized_evidence) <> 'object'
    or jsonb_typeof(normalized_blockers) <> 'array'
    or pg_column_size(normalized_evidence) > 32768
    or pg_column_size(normalized_blockers) > 32768 then
    raise exception 'invalid-clinical-activation-approval-evidence';
  end if;

  select *
  into selected_workspace
  from public.pilot_workspaces
  where slug = p_workspace_slug
    and private.has_pilot_role(tenant_id, array['tenant-admin', 'pilot-lead', 'reviewer']);

  if selected_workspace.id is null then
    raise exception 'workspace-not-found-or-role-denied';
  end if;

  select membership.role
  into actor_role
  from public.pilot_memberships membership
  where membership.tenant_id = selected_workspace.tenant_id
    and membership.user_id = (select auth.uid())
    and membership.role in ('tenant-admin', 'pilot-lead', 'reviewer')
  limit 1;

  if actor_role is null then
    raise exception 'clinical-activation-approval-role-denied';
  end if;

  insert into public.clinical_activation_approvals (
    tenant_id,
    workspace_id,
    domain_id,
    domain_label,
    approval_status,
    approval_scope,
    reviewer_role,
    attestation,
    evidence_snapshot,
    retained_blockers,
    no_phi_attestation,
    clinical_go_live_authority,
    signed_by,
    boundary
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    p_domain_id,
    trim(p_domain_label),
    p_approval_status,
    'no-phi-readiness-review-only',
    trim(p_reviewer_role),
    p_attestation,
    normalized_evidence,
    normalized_blockers,
    true,
    'not-authorized-live-care',
    (select auth.uid()),
    approval_boundary
  )
  returning id into created_approval_id;

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
    'clinical-activation-approval-recorded',
    jsonb_build_object(
      'approvalId', created_approval_id,
      'domainId', p_domain_id,
      'approvalStatus', p_approval_status,
      'approvalScope', 'no-phi-readiness-review-only',
      'actorRole', actor_role,
      'attestation', p_attestation,
      'noPhiOnly', true,
      'syntheticOnly', true,
      'clinicalGoLiveAuthority', 'not-authorized-live-care',
      'assuranceLevel', 'aal2'
    )
  );

  return created_approval_id;
end;
$$;

create or replace function public.record_clinical_activation_approval(
  p_workspace_slug text,
  p_domain_id text,
  p_domain_label text,
  p_approval_status text,
  p_reviewer_role text,
  p_evidence_snapshot jsonb,
  p_retained_blockers jsonb,
  p_attestation text
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_clinical_activation_approval(
    p_workspace_slug,
    p_domain_id,
    p_domain_label,
    p_approval_status,
    p_reviewer_role,
    p_evidence_snapshot,
    p_retained_blockers,
    p_attestation
  );
$$;

revoke all on function private.record_clinical_activation_approval(
  text, text, text, text, text, jsonb, jsonb, text
) from public, anon, authenticated, service_role;
revoke all on function public.record_clinical_activation_approval(
  text, text, text, text, text, jsonb, jsonb, text
) from public, anon, authenticated, service_role;

grant execute on function private.record_clinical_activation_approval(
  text, text, text, text, text, jsonb, jsonb, text
) to authenticated;
grant execute on function public.record_clinical_activation_approval(
  text, text, text, text, text, jsonb, jsonb, text
) to authenticated;

create or replace function public.protected_pilot_runtime_status()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'ready', true,
    'schemaVersion', '2026-06-19.1',
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
    'buyerTenantLifecycleAutomation', 'aal2-private-rpc-sso-access-review-archive-controls',
    'productionActivationReadiness', 'aal2-private-rpc-domain-origin-invitation-access-archive-controls',
    'customerActivationApprovals', 'aal2-private-rpc-paid-pilot-setup-approval-hard-gates-retained',
    'buyerDiligenceRooms', 'aal2-private-rpc-metadata-only-signed-controls-diligence',
    'secureEvidenceVaultReadiness', 'aal2-private-rpc-disabled-by-default-storage-control-readiness',
    'salesBuyerDemoSessions', 'aal2-private-rpc-no-phi-demo-session-history',
    'manualQaEvidencePackets', 'aal2-tenant-scoped-no-secret-evidence-persistence',
    'commandIntelligenceSnapshots', 'aal2-audited-command-posture-history',
    'commandIntelligencePackets', 'write-before-release-command-intelligence-packets',
    'clinicalActivationApprovals', 'aal2-no-phi-approval-ledger-live-care-blocked'
  );
$$;

comment on table public.clinical_activation_approvals is
  'Append-only tenant-scoped no-PHI clinical activation readiness attestations. RLS select requires authenticated AAL2 governance context and tenant membership. Writes require guarded RPC. No PHI, patient identifiers, live clinical records, payer member data, medical-record excerpts, secrets, credentials, legal advice, compliance certification, FDA clearance, reimbursement determination, patient outreach approval, production connector authorization, autonomous clinical authority, or live healthcare execution approval is permitted.';
comment on function private.record_clinical_activation_approval(
  text, text, text, text, text, jsonb, jsonb, text
) is
  'Records an AAL2 no-PHI clinical activation readiness attestation and audit event while retaining the live-care blocked boundary.';
