create table if not exists private.trust_safety_incidents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  incident_key text not null check (
    char_length(incident_key) between 10 and 120
    and incident_key ~ '^trustops-[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  title text not null check (char_length(title) between 10 and 240),
  severity text not null check (severity in ('low', 'moderate', 'high', 'critical')),
  status text not null default 'new' check (
    status in ('new', 'triaged', 'contained', 'remediating', 'monitoring', 'closed', 'production-gated')
  ),
  owner text not null check (char_length(owner) between 3 and 180),
  accountable_agent text not null check (char_length(accountable_agent) between 3 and 180),
  source_channel text not null check (char_length(source_channel) between 3 and 180),
  affected_surface text[] not null check (cardinality(affected_surface) between 1 and 12),
  trigger_signal text not null check (char_length(trigger_signal) between 20 and 2000),
  buyer_impact text not null check (char_length(buyer_impact) between 20 and 2000),
  containment_action text not null check (char_length(containment_action) between 20 and 2000),
  remediation_plan text not null check (char_length(remediation_plan) between 20 and 2000),
  legal_hold_status text not null default 'not-required' check (
    legal_hold_status in ('not-required', 'watch', 'recommended', 'active')
  ),
  notification_decision text not null default 'pending' check (
    notification_decision in (
      'pending',
      'not-required',
      'internal-only',
      'customer-review',
      'regulatory-review',
      'counsel-escalation'
    )
  ),
  notification_reason text not null default '' check (char_length(notification_reason) <= 1200),
  post_incident_review_status text not null default 'not-started' check (
    post_incident_review_status in ('not-started', 'in-review', 'actions-assigned', 'complete')
  ),
  retention_until timestamptz,
  legal_hold_until timestamptz,
  event_metadata jsonb not null default '{}'::jsonb check (
    jsonb_typeof(event_metadata) = 'object'
    and pg_column_size(event_metadata) <= 32768
  ),
  boundary text not null check (char_length(boundary) between 80 and 2000),
  synthetic_only boolean not null default true check (synthetic_only),
  created_by uuid not null references auth.users(id) on delete restrict,
  updated_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz,
  unique (workspace_id, incident_key),
  check (retention_until is null or retention_until > created_at),
  check (legal_hold_until is null or legal_hold_until > created_at),
  check (status <> 'closed' or post_incident_review_status = 'complete')
);

create table if not exists private.trust_safety_incident_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  incident_id uuid not null references private.trust_safety_incidents(id) on delete restrict,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  event_type text not null check (
    event_type in (
      'incident-created',
      'status-updated',
      'containment-recorded',
      'remediation-updated',
      'legal-hold-recorded',
      'legal-hold-released',
      'notification-decision-recorded',
      'post-incident-review-recorded',
      'review-packet-downloaded',
      'incident-closed'
    )
  ),
  prior_status text check (
    prior_status is null
    or prior_status in ('new', 'triaged', 'contained', 'remediating', 'monitoring', 'closed', 'production-gated')
  ),
  next_status text not null check (
    next_status in ('new', 'triaged', 'contained', 'remediating', 'monitoring', 'closed', 'production-gated')
  ),
  prior_legal_hold_status text check (
    prior_legal_hold_status is null
    or prior_legal_hold_status in ('not-required', 'watch', 'recommended', 'active')
  ),
  next_legal_hold_status text not null check (
    next_legal_hold_status in ('not-required', 'watch', 'recommended', 'active')
  ),
  prior_notification_decision text check (
    prior_notification_decision is null
    or prior_notification_decision in (
      'pending',
      'not-required',
      'internal-only',
      'customer-review',
      'regulatory-review',
      'counsel-escalation'
    )
  ),
  next_notification_decision text not null check (
    next_notification_decision in (
      'pending',
      'not-required',
      'internal-only',
      'customer-review',
      'regulatory-review',
      'counsel-escalation'
    )
  ),
  event_summary text not null check (char_length(event_summary) between 12 and 2000),
  event_metadata jsonb not null default '{}'::jsonb check (
    jsonb_typeof(event_metadata) = 'object'
    and pg_column_size(event_metadata) <= 32768
  ),
  boundary text not null check (char_length(boundary) between 80 and 2000),
  synthetic_only boolean not null default true check (synthetic_only),
  created_at timestamptz not null default now()
);

create index if not exists trust_safety_incidents_workspace_updated_idx
  on private.trust_safety_incidents(workspace_id, updated_at desc);
create index if not exists trust_safety_incidents_workspace_status_idx
  on private.trust_safety_incidents(workspace_id, status, severity, updated_at desc);
create index if not exists trust_safety_incidents_legal_hold_idx
  on private.trust_safety_incidents(workspace_id, legal_hold_status)
  where legal_hold_status <> 'not-required';
create index if not exists trust_safety_incidents_notification_idx
  on private.trust_safety_incidents(workspace_id, notification_decision)
  where notification_decision in ('customer-review', 'regulatory-review', 'counsel-escalation');
create index if not exists trust_safety_incident_events_incident_created_idx
  on private.trust_safety_incident_events(incident_id, created_at desc);
create index if not exists trust_safety_incident_events_workspace_created_idx
  on private.trust_safety_incident_events(workspace_id, created_at desc);

alter table private.trust_safety_incidents enable row level security;
alter table private.trust_safety_incident_events enable row level security;

revoke all on private.trust_safety_incidents from public, anon, authenticated;
revoke all on private.trust_safety_incident_events from public, anon, authenticated;

drop policy if exists trust_safety_incidents_deny_all on private.trust_safety_incidents;
create policy trust_safety_incidents_deny_all
on private.trust_safety_incidents
as restrictive
for all
to public
using (false)
with check (false);

drop policy if exists trust_safety_incident_events_deny_all on private.trust_safety_incident_events;
create policy trust_safety_incident_events_deny_all
on private.trust_safety_incident_events
as restrictive
for all
to public
using (false)
with check (false);

create or replace function private.trust_safety_incident_dashboard(p_workspace_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_tenant public.pilot_tenants%rowtype;
  incidents jsonb;
  events jsonb;
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead', 'reviewer']
  );

  select *
  into selected_tenant
  from public.pilot_tenants
  where id = selected_workspace.tenant_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', incident.id,
        'tenantId', incident.tenant_id,
        'workspaceId', incident.workspace_id,
        'incidentKey', incident.incident_key,
        'title', incident.title,
        'severity', incident.severity,
        'status', incident.status,
        'owner', incident.owner,
        'accountableAgent', incident.accountable_agent,
        'sourceChannel', incident.source_channel,
        'affectedSurface', incident.affected_surface,
        'triggerSignal', incident.trigger_signal,
        'buyerImpact', incident.buyer_impact,
        'containmentAction', incident.containment_action,
        'remediationPlan', incident.remediation_plan,
        'legalHoldStatus', incident.legal_hold_status,
        'notificationDecision', incident.notification_decision,
        'notificationReason', incident.notification_reason,
        'postIncidentReviewStatus', incident.post_incident_review_status,
        'retentionUntil', incident.retention_until,
        'legalHoldUntil', incident.legal_hold_until,
        'eventMetadata', incident.event_metadata,
        'boundary', incident.boundary,
        'createdBy', incident.created_by,
        'updatedBy', incident.updated_by,
        'createdAt', incident.created_at,
        'updatedAt', incident.updated_at,
        'closedAt', incident.closed_at
      )
      order by incident.updated_at desc
    ),
    '[]'::jsonb
  )
  into incidents
  from (
    select *
    from private.trust_safety_incidents
    where workspace_id = selected_workspace.id
    order by updated_at desc
    limit 250
  ) incident;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', event.id,
        'tenantId', event.tenant_id,
        'workspaceId', event.workspace_id,
        'incidentId', event.incident_id,
        'actorUserId', event.actor_user_id,
        'eventType', event.event_type,
        'priorStatus', event.prior_status,
        'nextStatus', event.next_status,
        'priorLegalHoldStatus', event.prior_legal_hold_status,
        'nextLegalHoldStatus', event.next_legal_hold_status,
        'priorNotificationDecision', event.prior_notification_decision,
        'nextNotificationDecision', event.next_notification_decision,
        'eventSummary', event.event_summary,
        'eventMetadata', event.event_metadata,
        'boundary', event.boundary,
        'createdAt', event.created_at
      )
      order by event.created_at desc
    ),
    '[]'::jsonb
  )
  into events
  from (
    select *
    from private.trust_safety_incident_events
    where workspace_id = selected_workspace.id
    order by created_at desc
    limit 500
  ) event;

  return jsonb_build_object(
    'tenantId', selected_tenant.id,
    'tenantName', selected_tenant.name,
    'workspaceId', selected_workspace.id,
    'workspaceSlug', selected_workspace.slug,
    'workspaceName', selected_workspace.name,
    'actorUserId', (select auth.uid()),
    'incidents', incidents,
    'events', events,
    'security', jsonb_build_object(
      'storage', 'private-schema-rpc-guarded',
      'assuranceLevel', 'aal2',
      'mutationAuthorization', 'tenant-admin-or-pilot-lead-plus-server-runtime-token',
      'reviewPacketAuthorization', 'tenant-admin-pilot-lead-or-reviewer-plus-server-runtime-token'
    ),
    'boundary', 'Tenant TrustOps incident workspace stores synthetic-pilot and enterprise-readiness incident evidence only. It does not store PHI, patient identifiers, live clinical records, secrets, payer member identifiers, production breach determinations, legal advice, compliance certification, or managed 24/7 SOC/MDR coverage.'
  );
end;
$$;

create or replace function private.create_trust_safety_incident(
  p_workspace_slug text,
  p_incident_key text,
  p_title text,
  p_severity text,
  p_owner text,
  p_accountable_agent text,
  p_source_channel text,
  p_affected_surface text[],
  p_trigger_signal text,
  p_buyer_impact text,
  p_containment_action text,
  p_remediation_plan text,
  p_legal_hold_status text default 'not-required',
  p_notification_decision text default 'pending',
  p_notification_reason text default '',
  p_retention_until timestamptz default null,
  p_legal_hold_until timestamptz default null,
  p_event_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  created_incident_id uuid;
  incident_boundary text := 'Tenant TrustOps incident workspace stores synthetic-pilot and enterprise-readiness incident evidence only. It does not store PHI, patient identifiers, live clinical records, secrets, payer member identifiers, production breach determinations, legal advice, compliance certification, or managed 24/7 SOC/MDR coverage.';
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead']
  );

  if p_severity not in ('low', 'moderate', 'high', 'critical')
    or p_legal_hold_status not in ('not-required', 'watch', 'recommended', 'active')
    or p_notification_decision not in (
      'pending',
      'not-required',
      'internal-only',
      'customer-review',
      'regulatory-review',
      'counsel-escalation'
    )
    or jsonb_typeof(coalesce(p_event_metadata, '{}'::jsonb)) <> 'object'
    or pg_column_size(coalesce(p_event_metadata, '{}'::jsonb)) > 32768 then
    raise exception 'invalid-trust-safety-incident';
  end if;

  if p_retention_until is not null and p_retention_until <= now() then
    raise exception 'trust-safety-retention-must-be-future';
  end if;

  if p_legal_hold_until is not null and p_legal_hold_until <= now() then
    raise exception 'trust-safety-legal-hold-must-be-future';
  end if;

  insert into private.trust_safety_incidents (
    tenant_id,
    workspace_id,
    incident_key,
    title,
    severity,
    owner,
    accountable_agent,
    source_channel,
    affected_surface,
    trigger_signal,
    buyer_impact,
    containment_action,
    remediation_plan,
    legal_hold_status,
    notification_decision,
    notification_reason,
    retention_until,
    legal_hold_until,
    event_metadata,
    boundary,
    created_by,
    updated_by
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    lower(trim(p_incident_key)),
    trim(p_title),
    p_severity,
    trim(p_owner),
    trim(p_accountable_agent),
    trim(p_source_channel),
    p_affected_surface,
    trim(p_trigger_signal),
    trim(p_buyer_impact),
    trim(p_containment_action),
    trim(p_remediation_plan),
    p_legal_hold_status,
    p_notification_decision,
    trim(coalesce(p_notification_reason, '')),
    p_retention_until,
    p_legal_hold_until,
    coalesce(p_event_metadata, '{}'::jsonb) || jsonb_build_object(
      'syntheticOnly', true,
      'workspaceSlug', selected_workspace.slug
    ),
    incident_boundary,
    (select auth.uid()),
    (select auth.uid())
  )
  returning id into created_incident_id;

  insert into private.trust_safety_incident_events (
    tenant_id,
    workspace_id,
    incident_id,
    actor_user_id,
    event_type,
    next_status,
    next_legal_hold_status,
    next_notification_decision,
    event_summary,
    event_metadata,
    boundary
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    created_incident_id,
    (select auth.uid()),
    'incident-created',
    'new',
    p_legal_hold_status,
    p_notification_decision,
    'Tenant TrustOps incident created for governed synthetic-pilot or enterprise-readiness review.',
    coalesce(p_event_metadata, '{}'::jsonb) || jsonb_build_object(
      'syntheticOnly', true,
      'incidentKey', lower(trim(p_incident_key))
    ),
    incident_boundary
  );

  insert into public.pilot_audit_events (
    tenant_id,
    workspace_id,
    actor_user_id,
    event_type,
    event_metadata
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    (select auth.uid()),
    'trust-safety-incident-created',
    jsonb_build_object(
      'incidentId', created_incident_id,
      'incidentKey', lower(trim(p_incident_key)),
      'severity', p_severity,
      'syntheticOnly', true
    )
  );

  return created_incident_id;
end;
$$;

create or replace function private.update_trust_safety_incident(
  p_workspace_slug text,
  p_incident_id uuid,
  p_status text default null,
  p_severity text default null,
  p_legal_hold_status text default null,
  p_notification_decision text default null,
  p_notification_reason text default null,
  p_containment_action text default null,
  p_remediation_plan text default null,
  p_post_incident_review_status text default null,
  p_retention_until timestamptz default null,
  p_legal_hold_until timestamptz default null,
  p_event_type text default 'status-updated',
  p_event_summary text default '',
  p_event_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_incident private.trust_safety_incidents%rowtype;
  created_event_id uuid;
  normalized_status text;
  normalized_severity text;
  normalized_legal_hold_status text;
  normalized_notification_decision text;
  normalized_notification_reason text;
  normalized_containment_action text;
  normalized_remediation_plan text;
  normalized_review_status text;
  normalized_event_summary text := trim(coalesce(p_event_summary, ''));
  incident_boundary text := 'Tenant TrustOps incident workspace stores synthetic-pilot and enterprise-readiness incident evidence only. It does not store PHI, patient identifiers, live clinical records, secrets, payer member identifiers, production breach determinations, legal advice, compliance certification, or managed 24/7 SOC/MDR coverage.';
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead']
  );

  select *
  into selected_incident
  from private.trust_safety_incidents
  where id = p_incident_id
    and workspace_id = selected_workspace.id
    and tenant_id = selected_workspace.tenant_id
  for update;

  if selected_incident.id is null then
    raise exception 'trust-safety-incident-not-found';
  end if;

  normalized_status := coalesce(p_status, selected_incident.status);
  normalized_severity := coalesce(p_severity, selected_incident.severity);
  normalized_legal_hold_status := coalesce(p_legal_hold_status, selected_incident.legal_hold_status);
  normalized_notification_decision := coalesce(p_notification_decision, selected_incident.notification_decision);
  normalized_notification_reason := coalesce(p_notification_reason, selected_incident.notification_reason);
  normalized_containment_action := coalesce(p_containment_action, selected_incident.containment_action);
  normalized_remediation_plan := coalesce(p_remediation_plan, selected_incident.remediation_plan);
  normalized_review_status := coalesce(p_post_incident_review_status, selected_incident.post_incident_review_status);

  if normalized_status not in ('new', 'triaged', 'contained', 'remediating', 'monitoring', 'closed', 'production-gated')
    or normalized_severity not in ('low', 'moderate', 'high', 'critical')
    or normalized_legal_hold_status not in ('not-required', 'watch', 'recommended', 'active')
    or normalized_notification_decision not in (
      'pending',
      'not-required',
      'internal-only',
      'customer-review',
      'regulatory-review',
      'counsel-escalation'
    )
    or normalized_review_status not in ('not-started', 'in-review', 'actions-assigned', 'complete')
    or p_event_type not in (
      'status-updated',
      'containment-recorded',
      'remediation-updated',
      'legal-hold-recorded',
      'legal-hold-released',
      'notification-decision-recorded',
      'post-incident-review-recorded',
      'incident-closed'
    )
    or jsonb_typeof(coalesce(p_event_metadata, '{}'::jsonb)) <> 'object'
    or pg_column_size(coalesce(p_event_metadata, '{}'::jsonb)) > 32768 then
    raise exception 'invalid-trust-safety-incident-update';
  end if;

  if char_length(normalized_event_summary) not between 12 and 2000 then
    raise exception 'invalid-trust-safety-event-summary';
  end if;

  if normalized_status = 'closed' and normalized_review_status <> 'complete' then
    raise exception 'trust-safety-review-required-before-close';
  end if;

  if p_retention_until is not null and p_retention_until <= now() then
    raise exception 'trust-safety-retention-must-be-future';
  end if;

  if p_legal_hold_until is not null and p_legal_hold_until <= now() then
    raise exception 'trust-safety-legal-hold-must-be-future';
  end if;

  update private.trust_safety_incidents
  set
    status = normalized_status,
    severity = normalized_severity,
    legal_hold_status = normalized_legal_hold_status,
    notification_decision = normalized_notification_decision,
    notification_reason = trim(normalized_notification_reason),
    containment_action = trim(normalized_containment_action),
    remediation_plan = trim(normalized_remediation_plan),
    post_incident_review_status = normalized_review_status,
    retention_until = coalesce(p_retention_until, retention_until),
    legal_hold_until = coalesce(p_legal_hold_until, legal_hold_until),
    event_metadata = event_metadata || coalesce(p_event_metadata, '{}'::jsonb),
    updated_by = (select auth.uid()),
    updated_at = now(),
    closed_at = case when normalized_status = 'closed' then coalesce(closed_at, now()) else closed_at end
  where id = selected_incident.id;

  insert into private.trust_safety_incident_events (
    tenant_id,
    workspace_id,
    incident_id,
    actor_user_id,
    event_type,
    prior_status,
    next_status,
    prior_legal_hold_status,
    next_legal_hold_status,
    prior_notification_decision,
    next_notification_decision,
    event_summary,
    event_metadata,
    boundary
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    selected_incident.id,
    (select auth.uid()),
    p_event_type,
    selected_incident.status,
    normalized_status,
    selected_incident.legal_hold_status,
    normalized_legal_hold_status,
    selected_incident.notification_decision,
    normalized_notification_decision,
    normalized_event_summary,
    coalesce(p_event_metadata, '{}'::jsonb) || jsonb_build_object(
      'syntheticOnly', true,
      'incidentId', selected_incident.id,
      'incidentKey', selected_incident.incident_key
    ),
    incident_boundary
  )
  returning id into created_event_id;

  insert into public.pilot_audit_events (
    tenant_id,
    workspace_id,
    actor_user_id,
    event_type,
    event_metadata
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    (select auth.uid()),
    'trust-safety-incident-updated',
    jsonb_build_object(
      'incidentId', selected_incident.id,
      'eventId', created_event_id,
      'eventType', p_event_type,
      'status', normalized_status,
      'severity', normalized_severity,
      'syntheticOnly', true
    )
  );

  return created_event_id;
end;
$$;

create or replace function private.record_trust_safety_incident_packet_download(
  p_workspace_slug text,
  p_incident_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  selected_incident private.trust_safety_incidents%rowtype;
  created_event_id uuid;
  incident_boundary text := 'Tenant TrustOps incident workspace stores synthetic-pilot and enterprise-readiness incident evidence only. It does not store PHI, patient identifiers, live clinical records, secrets, payer member identifiers, production breach determinations, legal advice, compliance certification, or managed 24/7 SOC/MDR coverage.';
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead', 'reviewer']
  );

  select *
  into selected_incident
  from private.trust_safety_incidents
  where id = p_incident_id
    and workspace_id = selected_workspace.id
    and tenant_id = selected_workspace.tenant_id;

  if selected_incident.id is null then
    raise exception 'trust-safety-incident-not-found';
  end if;

  insert into private.trust_safety_incident_events (
    tenant_id,
    workspace_id,
    incident_id,
    actor_user_id,
    event_type,
    prior_status,
    next_status,
    prior_legal_hold_status,
    next_legal_hold_status,
    prior_notification_decision,
    next_notification_decision,
    event_summary,
    event_metadata,
    boundary
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    selected_incident.id,
    (select auth.uid()),
    'review-packet-downloaded',
    selected_incident.status,
    selected_incident.status,
    selected_incident.legal_hold_status,
    selected_incident.legal_hold_status,
    selected_incident.notification_decision,
    selected_incident.notification_decision,
    'Tenant TrustOps incident review packet downloaded after append-only audit event.',
    jsonb_build_object(
      'syntheticOnly', true,
      'incidentId', selected_incident.id,
      'incidentKey', selected_incident.incident_key,
      'format', 'text/markdown'
    ),
    incident_boundary
  )
  returning id into created_event_id;

  insert into public.pilot_audit_events (
    tenant_id,
    workspace_id,
    actor_user_id,
    event_type,
    event_metadata
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    (select auth.uid()),
    'trust-safety-incident-packet-downloaded',
    jsonb_build_object(
      'incidentId', selected_incident.id,
      'eventId', created_event_id,
      'incidentKey', selected_incident.incident_key,
      'syntheticOnly', true
    )
  );

  return created_event_id;
end;
$$;

create or replace function public.trust_safety_incident_dashboard(p_workspace_slug text)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select private.trust_safety_incident_dashboard(p_workspace_slug);
$$;

create or replace function public.create_trust_safety_incident(
  p_workspace_slug text,
  p_incident_key text,
  p_title text,
  p_severity text,
  p_owner text,
  p_accountable_agent text,
  p_source_channel text,
  p_affected_surface text[],
  p_trigger_signal text,
  p_buyer_impact text,
  p_containment_action text,
  p_remediation_plan text,
  p_legal_hold_status text default 'not-required',
  p_notification_decision text default 'pending',
  p_notification_reason text default '',
  p_retention_until timestamptz default null,
  p_legal_hold_until timestamptz default null,
  p_event_metadata jsonb default '{}'::jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.create_trust_safety_incident(
    p_workspace_slug,
    p_incident_key,
    p_title,
    p_severity,
    p_owner,
    p_accountable_agent,
    p_source_channel,
    p_affected_surface,
    p_trigger_signal,
    p_buyer_impact,
    p_containment_action,
    p_remediation_plan,
    p_legal_hold_status,
    p_notification_decision,
    p_notification_reason,
    p_retention_until,
    p_legal_hold_until,
    p_event_metadata
  );
$$;

create or replace function public.update_trust_safety_incident(
  p_workspace_slug text,
  p_incident_id uuid,
  p_status text default null,
  p_severity text default null,
  p_legal_hold_status text default null,
  p_notification_decision text default null,
  p_notification_reason text default null,
  p_containment_action text default null,
  p_remediation_plan text default null,
  p_post_incident_review_status text default null,
  p_retention_until timestamptz default null,
  p_legal_hold_until timestamptz default null,
  p_event_type text default 'status-updated',
  p_event_summary text default '',
  p_event_metadata jsonb default '{}'::jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.update_trust_safety_incident(
    p_workspace_slug,
    p_incident_id,
    p_status,
    p_severity,
    p_legal_hold_status,
    p_notification_decision,
    p_notification_reason,
    p_containment_action,
    p_remediation_plan,
    p_post_incident_review_status,
    p_retention_until,
    p_legal_hold_until,
    p_event_type,
    p_event_summary,
    p_event_metadata
  );
$$;

create or replace function public.record_trust_safety_incident_packet_download(
  p_workspace_slug text,
  p_incident_id uuid
)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.record_trust_safety_incident_packet_download(
    p_workspace_slug,
    p_incident_id
  );
$$;

revoke all on function private.trust_safety_incident_dashboard(text) from public, anon, authenticated, service_role;
revoke all on function private.create_trust_safety_incident(text, text, text, text, text, text, text, text[], text, text, text, text, text, text, text, timestamptz, timestamptz, jsonb) from public, anon, authenticated, service_role;
revoke all on function private.update_trust_safety_incident(text, uuid, text, text, text, text, text, text, text, text, timestamptz, timestamptz, text, text, jsonb) from public, anon, authenticated, service_role;
revoke all on function private.record_trust_safety_incident_packet_download(text, uuid) from public, anon, authenticated, service_role;

revoke all on function public.trust_safety_incident_dashboard(text) from public, anon, authenticated, service_role;
revoke all on function public.create_trust_safety_incident(text, text, text, text, text, text, text, text[], text, text, text, text, text, text, text, timestamptz, timestamptz, jsonb) from public, anon, authenticated, service_role;
revoke all on function public.update_trust_safety_incident(text, uuid, text, text, text, text, text, text, text, text, timestamptz, timestamptz, text, text, jsonb) from public, anon, authenticated, service_role;
revoke all on function public.record_trust_safety_incident_packet_download(text, uuid) from public, anon, authenticated, service_role;

grant execute on function private.trust_safety_incident_dashboard(text) to authenticated;
grant execute on function private.create_trust_safety_incident(text, text, text, text, text, text, text, text[], text, text, text, text, text, text, text, timestamptz, timestamptz, jsonb) to authenticated;
grant execute on function private.update_trust_safety_incident(text, uuid, text, text, text, text, text, text, text, text, timestamptz, timestamptz, text, text, jsonb) to authenticated;
grant execute on function private.record_trust_safety_incident_packet_download(text, uuid) to authenticated;

grant execute on function public.trust_safety_incident_dashboard(text) to authenticated;
grant execute on function public.create_trust_safety_incident(text, text, text, text, text, text, text, text[], text, text, text, text, text, text, text, timestamptz, timestamptz, jsonb) to authenticated;
grant execute on function public.update_trust_safety_incident(text, uuid, text, text, text, text, text, text, text, text, timestamptz, timestamptz, text, text, jsonb) to authenticated;
grant execute on function public.record_trust_safety_incident_packet_download(text, uuid) to authenticated;

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
      'trust-safety-incident-packet-downloaded'
    )
  );

create or replace function public.protected_pilot_runtime_status()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'ready', true,
    'schemaVersion', '2026-06-16.1',
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
    'tenantTrustSafetyIncidentPackets', 'write-before-release'
  );
$$;

comment on table private.trust_safety_incidents is
  'Private tenant-scoped SCRIMED TrustOps incident records for synthetic-pilot and enterprise-readiness evidence only. No PHI, patient identifiers, live clinical records, legal advice, compliance certification, or managed SOC/MDR coverage.';
comment on table private.trust_safety_incident_events is
  'Append-only private tenant-scoped SCRIMED TrustOps incident event trail with legal-hold, notification, post-incident review, and review-packet download evidence.';
comment on function private.create_trust_safety_incident(text, text, text, text, text, text, text, text[], text, text, text, text, text, text, text, timestamptz, timestamptz, jsonb) is
  'Creates tenant-scoped TrustOps incidents for synthetic-pilot and enterprise-readiness evidence through AAL2 tenant-admin or pilot-lead guarded RPCs.';
