create extension if not exists vector;

create table if not exists private.scrimed_stored_vectors (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  vector_domain text not null check (
    vector_domain in (
      'patient-matching',
      'document-similarity',
      'clinical-retrieval',
      'payer-policy-lookup',
      'recommendation-search'
    )
  ),
  source_ref text not null check (
    char_length(source_ref) between 8 and 180
    and source_ref ~ '^[a-z0-9]+(?:[-_:/][a-z0-9]+)*$'
  ),
  workflow_scope text check (workflow_scope is null or char_length(workflow_scope) between 2 and 120),
  workflow_type text check (workflow_type is null or char_length(workflow_type) between 2 and 120),
  document_class text check (document_class is null or char_length(document_class) between 2 and 120),
  specialty text check (specialty is null or char_length(specialty) between 2 and 120),
  evidence_class text check (evidence_class is null or char_length(evidence_class) between 2 and 120),
  payer_scope text check (payer_scope is null or char_length(payer_scope) between 2 and 120),
  policy_version text check (policy_version is null or char_length(policy_version) between 2 and 120),
  criteria_scope text check (criteria_scope is null or char_length(criteria_scope) between 2 and 120),
  reviewer_status text not null default 'pending-review' check (
    reviewer_status in ('pending-review', 'validated', 'reviewed', 'rejected', 'not-applicable')
  ),
  outcome_label text check (outcome_label is null or char_length(outcome_label) between 2 and 120),
  source_status text not null default 'active' check (source_status in ('active', 'retired', 'quarantined')),
  source_citation text check (source_citation is null or char_length(source_citation) between 8 and 500),
  evidence_published_at timestamptz,
  embedding_model text not null check (char_length(embedding_model) between 3 and 120),
  embedding_dimension smallint not null default 1536 check (embedding_dimension = 1536),
  embedding vector(1536) not null,
  metadata jsonb not null default '{}'::jsonb check (
    jsonb_typeof(metadata) = 'object'
    and pg_column_size(metadata) <= 32768
  ),
  synthetic_only boolean not null default true check (synthetic_only),
  no_phi_assertion boolean not null default true check (no_phi_assertion),
  human_review_required boolean not null default true check (human_review_required),
  phi_authority text not null default 'not-authorized-production-phi'
    check (phi_authority = 'not-authorized-production-phi'),
  clinical_care_authority text not null default 'not-authorized-live-care'
    check (clinical_care_authority = 'not-authorized-live-care'),
  automation_authority text not null default 'recommendation-only-human-review'
    check (automation_authority = 'recommendation-only-human-review'),
  boundary text not null check (char_length(boundary) between 120 and 2400),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, vector_domain, source_ref)
);

create table if not exists private.scrimed_stored_vector_lookup_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.pilot_tenants(id) on delete restrict,
  workspace_id uuid not null references public.pilot_workspaces(id) on delete restrict,
  source_vector_id uuid references private.scrimed_stored_vectors(id) on delete restrict,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  event_type text not null check (
    event_type in ('stored-vector-registered', 'stored-vector-search-executed')
  ),
  vector_domain text not null check (
    vector_domain in (
      'patient-matching',
      'document-similarity',
      'clinical-retrieval',
      'payer-policy-lookup',
      'recommendation-search'
    )
  ),
  rpc_name text not null check (char_length(rpc_name) between 8 and 120),
  filter_digest text not null check (filter_digest ~ '^[0-9a-f]{64}$'),
  result_count integer not null default 0 check (result_count between 0 and 50),
  match_threshold double precision not null default 0.72 check (match_threshold >= 0 and match_threshold <= 1),
  requested_match_count integer not null default 10 check (requested_match_count between 1 and 50),
  event_metadata jsonb not null default '{}'::jsonb check (
    jsonb_typeof(event_metadata) = 'object'
    and pg_column_size(event_metadata) <= 16384
  ),
  boundary text not null check (char_length(boundary) between 120 and 2400),
  no_phi_assertion boolean not null default true check (no_phi_assertion),
  created_at timestamptz not null default now()
);

create index if not exists scrimed_stored_vectors_workspace_domain_created_idx
  on private.scrimed_stored_vectors(workspace_id, vector_domain, created_at desc);
create index if not exists scrimed_stored_vectors_tenant_domain_idx
  on private.scrimed_stored_vectors(tenant_id, vector_domain);
create index if not exists scrimed_stored_vectors_patient_scope_idx
  on private.scrimed_stored_vectors(workspace_id, workflow_scope)
  where vector_domain = 'patient-matching';
create index if not exists scrimed_stored_vectors_document_class_idx
  on private.scrimed_stored_vectors(workspace_id, document_class)
  where vector_domain = 'document-similarity';
create index if not exists scrimed_stored_vectors_clinical_filters_idx
  on private.scrimed_stored_vectors(workspace_id, specialty, evidence_class, evidence_published_at desc)
  where vector_domain = 'clinical-retrieval';
create index if not exists scrimed_stored_vectors_payer_filters_idx
  on private.scrimed_stored_vectors(workspace_id, payer_scope, policy_version, criteria_scope)
  where vector_domain = 'payer-policy-lookup';
create index if not exists scrimed_stored_vectors_recommendation_filters_idx
  on private.scrimed_stored_vectors(workspace_id, workflow_type, reviewer_status, outcome_label)
  where vector_domain = 'recommendation-search';
create index if not exists scrimed_stored_vectors_embedding_hnsw_idx
  on private.scrimed_stored_vectors using hnsw (embedding vector_cosine_ops);
create index if not exists scrimed_stored_vector_lookup_events_workspace_created_idx
  on private.scrimed_stored_vector_lookup_events(workspace_id, created_at desc);
create index if not exists scrimed_stored_vector_lookup_events_source_idx
  on private.scrimed_stored_vector_lookup_events(source_vector_id, created_at desc);
create index if not exists scrimed_stored_vector_lookup_events_actor_idx
  on private.scrimed_stored_vector_lookup_events(actor_user_id, created_at desc);

alter table private.scrimed_stored_vectors enable row level security;
alter table private.scrimed_stored_vector_lookup_events enable row level security;

revoke all on private.scrimed_stored_vectors from public, anon, authenticated;
revoke all on private.scrimed_stored_vector_lookup_events from public, anon, authenticated;

drop policy if exists scrimed_stored_vectors_deny_all on private.scrimed_stored_vectors;
create policy scrimed_stored_vectors_deny_all
on private.scrimed_stored_vectors
as restrictive
for all
to public
using (false)
with check (false);

drop policy if exists scrimed_stored_vector_lookup_events_deny_all
  on private.scrimed_stored_vector_lookup_events;
create policy scrimed_stored_vector_lookup_events_deny_all
on private.scrimed_stored_vector_lookup_events
as restrictive
for all
to public
using (false)
with check (false);

create or replace function private.scrimed_stored_vector_lookup_boundary()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select 'SCRIMED stored-vector lookup is synthetic/no-PHI only. It keeps vector math inside the database boundary for patient matching, document similarity, clinical retrieval, payer-policy lookup, and recommendation search. It does not authorize live PHI, patient identity resolution, diagnosis, treatment, prescribing, patient outreach, payer submission, billing submission, EHR writeback, production connector use, autonomous clinical decisions, or compliance/certification claims.';
$$;

create or replace function private.reject_scrimed_stored_vector_prohibited_text(p_payload text)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if coalesce(p_payload, '') ~* '([0-9]{3}-[0-9]{2}-[0-9]{4})'
    or coalesce(p_payload, '') ~* 'date of birth|dob[[:space:]]*[:#]'
    or coalesce(p_payload, '') ~* 'medical record number|mrn[[:space:]]*[:#]'
    or coalesce(p_payload, '') ~* 'member[ _-]?(id|identifier)'
    or coalesce(p_payload, '') ~* 'subscriber[ _-]?(id|identifier)'
    or coalesce(p_payload, '') ~* 'patient[ _-]?(id|identifier|mrn)'
    or coalesce(p_payload, '') ~* 'diagnosis code|icd[ -]?10|cpt[[:space:]]*code'
    or coalesce(p_payload, '') ~* 'access[_-]?token|refresh[_-]?token|bearer[[:space:]]+[a-z0-9._-]+'
    or coalesce(p_payload, '') ~* 'sk-[a-z0-9_-]{12,}'
    or coalesce(p_payload, '') ~* 'sbp_[a-z0-9_-]{12,}'
    or coalesce(p_payload, '') ~* 'hipaa[ _-]?(certified|compliant)|soc[ _-]?2[ _-]?certified|fda[ _-]?cleared'
    or coalesce(p_payload, '') ~* 'autonomous diagnosis|treatment recommendation|live patient care|ehr writeback|payer submission' then
    raise exception 'scrimed-stored-vector-prohibited-content';
  end if;
end;
$$;

create or replace function private.scrimed_stored_vector_json(
  vector_record private.scrimed_stored_vectors
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'vectorId', vector_record.id,
    'tenantId', vector_record.tenant_id,
    'workspaceId', vector_record.workspace_id,
    'vectorDomain', vector_record.vector_domain,
    'sourceRef', vector_record.source_ref,
    'workflowScope', vector_record.workflow_scope,
    'workflowType', vector_record.workflow_type,
    'documentClass', vector_record.document_class,
    'specialty', vector_record.specialty,
    'evidenceClass', vector_record.evidence_class,
    'payerScope', vector_record.payer_scope,
    'policyVersion', vector_record.policy_version,
    'criteriaScope', vector_record.criteria_scope,
    'reviewerStatus', vector_record.reviewer_status,
    'outcomeLabel', vector_record.outcome_label,
    'sourceStatus', vector_record.source_status,
    'sourceCitation', vector_record.source_citation,
    'evidencePublishedAt', vector_record.evidence_published_at,
    'embeddingModel', vector_record.embedding_model,
    'embeddingDimension', vector_record.embedding_dimension,
    'metadata', vector_record.metadata,
    'syntheticOnly', vector_record.synthetic_only,
    'noPhiAssertion', vector_record.no_phi_assertion,
    'humanReviewRequired', vector_record.human_review_required,
    'phiAuthority', vector_record.phi_authority,
    'clinicalCareAuthority', vector_record.clinical_care_authority,
    'automationAuthority', vector_record.automation_authority,
    'boundary', vector_record.boundary,
    'createdBy', vector_record.created_by,
    'createdAt', vector_record.created_at,
    'updatedAt', vector_record.updated_at
  );
$$;

create or replace function private.register_scrimed_synthetic_stored_vector(
  p_workspace_slug text,
  p_vector_domain text,
  p_source_ref text,
  p_embedding vector(1536),
  p_embedding_model text,
  p_metadata jsonb default '{}'::jsonb,
  p_attributes jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  selected_workspace public.pilot_workspaces%rowtype;
  created_vector private.scrimed_stored_vectors%rowtype;
  normalized_metadata jsonb := coalesce(p_metadata, '{}'::jsonb);
  normalized_attributes jsonb := coalesce(p_attributes, '{}'::jsonb);
  boundary_value text := private.scrimed_stored_vector_lookup_boundary();
  created_event_id uuid;
begin
  select *
  into selected_workspace
  from public.pilot_workspaces
  where id = private.require_governance_workspace(
    p_workspace_slug,
    array['tenant-admin', 'pilot-lead']
  );

  if p_embedding is null then
    raise exception 'scrimed-stored-vector-embedding-required';
  end if;

  if p_vector_domain not in (
    'patient-matching',
    'document-similarity',
    'clinical-retrieval',
    'payer-policy-lookup',
    'recommendation-search'
  ) then
    raise exception 'scrimed-stored-vector-invalid-domain';
  end if;

  if jsonb_typeof(normalized_metadata) <> 'object'
    or pg_column_size(normalized_metadata) > 32768
    or jsonb_typeof(normalized_attributes) <> 'object'
    or pg_column_size(normalized_attributes) > 16384 then
    raise exception 'scrimed-stored-vector-invalid-metadata';
  end if;

  if coalesce((normalized_attributes ->> 'syntheticOnly')::boolean, true) is not true
    or coalesce((normalized_attributes ->> 'noPhiAssertion')::boolean, true) is not true then
    raise exception 'scrimed-stored-vector-boundary-violation';
  end if;

  perform private.reject_scrimed_stored_vector_prohibited_text(
    concat_ws(
      ' ',
      p_workspace_slug,
      p_vector_domain,
      p_source_ref,
      p_embedding_model,
      normalized_metadata::text,
      normalized_attributes::text
    )
  );

  insert into private.scrimed_stored_vectors (
    tenant_id,
    workspace_id,
    vector_domain,
    source_ref,
    workflow_scope,
    workflow_type,
    document_class,
    specialty,
    evidence_class,
    payer_scope,
    policy_version,
    criteria_scope,
    reviewer_status,
    outcome_label,
    source_status,
    source_citation,
    evidence_published_at,
    embedding_model,
    embedding,
    metadata,
    boundary,
    created_by
  )
  values (
    selected_workspace.tenant_id,
    selected_workspace.id,
    p_vector_domain,
    p_source_ref,
    nullif(normalized_attributes ->> 'workflowScope', ''),
    nullif(normalized_attributes ->> 'workflowType', ''),
    nullif(normalized_attributes ->> 'documentClass', ''),
    nullif(normalized_attributes ->> 'specialty', ''),
    nullif(normalized_attributes ->> 'evidenceClass', ''),
    nullif(normalized_attributes ->> 'payerScope', ''),
    nullif(normalized_attributes ->> 'policyVersion', ''),
    nullif(normalized_attributes ->> 'criteriaScope', ''),
    coalesce(nullif(normalized_attributes ->> 'reviewerStatus', ''), 'pending-review'),
    nullif(normalized_attributes ->> 'outcomeLabel', ''),
    coalesce(nullif(normalized_attributes ->> 'sourceStatus', ''), 'active'),
    nullif(normalized_attributes ->> 'sourceCitation', ''),
    case
      when coalesce(normalized_attributes ->> 'evidencePublishedAt', '') = '' then null
      else (normalized_attributes ->> 'evidencePublishedAt')::timestamptz
    end,
    p_embedding_model,
    p_embedding,
    normalized_metadata,
    boundary_value,
    (select auth.uid())
  )
  returning * into created_vector;

  insert into private.scrimed_stored_vector_lookup_events (
    tenant_id,
    workspace_id,
    source_vector_id,
    actor_user_id,
    event_type,
    vector_domain,
    rpc_name,
    filter_digest,
    result_count,
    match_threshold,
    requested_match_count,
    event_metadata,
    boundary
  )
  values (
    created_vector.tenant_id,
    created_vector.workspace_id,
    created_vector.id,
    (select auth.uid()),
    'stored-vector-registered',
    created_vector.vector_domain,
    'register_scrimed_synthetic_stored_vector',
    encode(digest(normalized_attributes::text, 'sha256'), 'hex'),
    0,
    0.72,
    1,
    jsonb_build_object(
      'sourceRef', created_vector.source_ref,
      'syntheticOnly', true,
      'noPhi', true,
      'embeddingStoredServerSide', true
    ),
    boundary_value
  )
  returning id into created_event_id;

  return jsonb_build_object(
    'record', private.scrimed_stored_vector_json(created_vector),
    'eventId', created_event_id,
    'persisted', true,
    'boundary', boundary_value
  );
end;
$$;

create or replace function private.search_scrimed_stored_vectors(
  p_source_vector_id uuid,
  p_tenant_scope text,
  p_vector_domain text,
  p_filters jsonb default '{}'::jsonb,
  p_match_threshold double precision default 0.72,
  p_match_count integer default 10,
  p_rpc_name text default 'scrimed_stored_vector_lookup'
)
returns table (
  rank integer,
  vector_id uuid,
  source_ref text,
  vector_domain text,
  match_score double precision,
  metadata jsonb,
  source_status text,
  reviewer_status text,
  evidence_summary jsonb,
  safety_boundary text,
  created_at timestamptz
)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  source_vector private.scrimed_stored_vectors%rowtype;
  source_workspace_slug text;
  source_tenant_slug text;
  normalized_filters jsonb := coalesce(p_filters, '{}'::jsonb);
  normalized_threshold double precision := least(greatest(coalesce(p_match_threshold, 0.72), 0), 1);
  normalized_count integer := least(greatest(coalesce(p_match_count, 10), 1), 50);
  boundary_value text := private.scrimed_stored_vector_lookup_boundary();
  result_count integer := 0;
begin
  if not private.has_valid_governance_session() then
    raise exception 'scrimed-stored-vector-aal2-session-required';
  end if;

  perform private.require_sales_server_token();

  if p_source_vector_id is null then
    raise exception 'scrimed-stored-vector-source-required';
  end if;

  if p_vector_domain not in (
    'patient-matching',
    'document-similarity',
    'clinical-retrieval',
    'payer-policy-lookup',
    'recommendation-search'
  ) then
    raise exception 'scrimed-stored-vector-invalid-domain';
  end if;

  if jsonb_typeof(normalized_filters) <> 'object'
    or pg_column_size(normalized_filters) > 16384 then
    raise exception 'scrimed-stored-vector-invalid-filters';
  end if;

  perform private.reject_scrimed_stored_vector_prohibited_text(
    concat_ws(
      ' ',
      p_tenant_scope,
      p_vector_domain,
      normalized_filters::text,
      p_rpc_name
    )
  );

  select vector_record.*
  into source_vector
  from private.scrimed_stored_vectors vector_record
  where vector_record.id = p_source_vector_id
    and vector_record.vector_domain = p_vector_domain
    and vector_record.synthetic_only
    and vector_record.no_phi_assertion
    and vector_record.source_status = 'active';

  if source_vector.id is null then
    raise exception 'scrimed-stored-vector-source-not-found';
  end if;

  select workspace.slug, tenant.slug
  into source_workspace_slug, source_tenant_slug
  from public.pilot_workspaces workspace
  join public.pilot_tenants tenant
    on tenant.id = workspace.tenant_id
  where workspace.id = source_vector.workspace_id
    and tenant.id = source_vector.tenant_id;

  if coalesce(p_tenant_scope, '') <> ''
    and p_tenant_scope not in (source_workspace_slug, source_tenant_slug) then
    raise exception 'scrimed-stored-vector-tenant-scope-denied';
  end if;

  if not private.has_pilot_role(source_vector.tenant_id, array['tenant-admin', 'pilot-lead', 'reviewer']) then
    raise exception 'scrimed-stored-vector-role-denied';
  end if;

  return query
  with ranked as (
    select
      candidate.id,
      candidate.source_ref,
      candidate.vector_domain,
      (1 - (candidate.embedding <=> source_vector.embedding))::double precision as score,
      candidate.metadata,
      candidate.source_status,
      candidate.reviewer_status,
      jsonb_build_object(
        'sourceRef', candidate.source_ref,
        'domain', candidate.vector_domain,
        'workflowScope', candidate.workflow_scope,
        'workflowType', candidate.workflow_type,
        'documentClass', candidate.document_class,
        'specialty', candidate.specialty,
        'evidenceClass', candidate.evidence_class,
        'payerScope', candidate.payer_scope,
        'policyVersion', candidate.policy_version,
        'criteriaScope', candidate.criteria_scope,
        'outcomeLabel', candidate.outcome_label,
        'sourceCitation', candidate.source_citation,
        'evidencePublishedAt', candidate.evidence_published_at,
        'syntheticOnly', true,
        'noPhi', true,
        'humanReviewRequired', true
      ) as evidence_summary,
      candidate.boundary,
      candidate.created_at
    from private.scrimed_stored_vectors candidate
    where candidate.tenant_id = source_vector.tenant_id
      and candidate.workspace_id = source_vector.workspace_id
      and candidate.id <> source_vector.id
      and candidate.vector_domain = p_vector_domain
      and candidate.synthetic_only
      and candidate.no_phi_assertion
      and candidate.source_status = 'active'
      and (coalesce(normalized_filters ->> 'workflowScope', '') = ''
        or candidate.workflow_scope = normalized_filters ->> 'workflowScope')
      and (coalesce(normalized_filters ->> 'workflowType', '') = ''
        or candidate.workflow_type = normalized_filters ->> 'workflowType')
      and (coalesce(normalized_filters ->> 'documentClass', '') = ''
        or candidate.document_class = normalized_filters ->> 'documentClass')
      and (coalesce(normalized_filters ->> 'specialty', '') = ''
        or candidate.specialty = normalized_filters ->> 'specialty')
      and (coalesce(normalized_filters ->> 'evidenceClass', '') = ''
        or candidate.evidence_class = normalized_filters ->> 'evidenceClass')
      and (coalesce(normalized_filters ->> 'payerScope', '') = ''
        or candidate.payer_scope = normalized_filters ->> 'payerScope')
      and (coalesce(normalized_filters ->> 'policyVersion', '') = ''
        or candidate.policy_version = normalized_filters ->> 'policyVersion')
      and (coalesce(normalized_filters ->> 'criteriaScope', '') = ''
        or candidate.criteria_scope = normalized_filters ->> 'criteriaScope')
      and (coalesce(normalized_filters ->> 'reviewerStatus', '') = ''
        or candidate.reviewer_status = normalized_filters ->> 'reviewerStatus')
      and (coalesce(normalized_filters ->> 'outcomeLabel', '') = ''
        or candidate.outcome_label = normalized_filters ->> 'outcomeLabel')
      and (
        coalesce(normalized_filters ->> 'freshnessWindowDays', '') = ''
        or candidate.evidence_published_at is null
        or candidate.evidence_published_at >= (
          now() - ((normalized_filters ->> 'freshnessWindowDays')::integer * interval '1 day')
        )
      )
  )
  select
    row_number() over (order by ranked.score desc, ranked.id)::integer as rank,
    ranked.id as vector_id,
    ranked.source_ref,
    ranked.vector_domain,
    ranked.score as match_score,
    ranked.metadata,
    ranked.source_status,
    ranked.reviewer_status,
    ranked.evidence_summary,
    ranked.boundary as safety_boundary,
    ranked.created_at
  from ranked
  where ranked.score >= normalized_threshold
  order by ranked.score desc, ranked.id
  limit normalized_count;

  get diagnostics result_count = row_count;

  insert into private.scrimed_stored_vector_lookup_events (
    tenant_id,
    workspace_id,
    source_vector_id,
    actor_user_id,
    event_type,
    vector_domain,
    rpc_name,
    filter_digest,
    result_count,
    match_threshold,
    requested_match_count,
    event_metadata,
    boundary
  )
  values (
    source_vector.tenant_id,
    source_vector.workspace_id,
    source_vector.id,
    (select auth.uid()),
    'stored-vector-search-executed',
    p_vector_domain,
    p_rpc_name,
    encode(digest(normalized_filters::text, 'sha256'), 'hex'),
    result_count,
    normalized_threshold,
    normalized_count,
    jsonb_build_object(
      'sourceVectorId', source_vector.id,
      'sourceRef', source_vector.source_ref,
      'tenantScopeProvided', coalesce(p_tenant_scope, '') <> '',
      'storedVectorLookup', true,
      'embeddingReturned', false,
      'syntheticOnly', true,
      'noPhi', true,
      'humanReviewRequired', true
    ),
    boundary_value
  );
end;
$$;

create or replace function public.register_scrimed_synthetic_stored_vector(
  p_workspace_slug text,
  p_vector_domain text,
  p_source_ref text,
  p_embedding vector(1536),
  p_embedding_model text,
  p_metadata jsonb default '{}'::jsonb,
  p_attributes jsonb default '{}'::jsonb
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.register_scrimed_synthetic_stored_vector(
    p_workspace_slug,
    p_vector_domain,
    p_source_ref,
    p_embedding,
    p_embedding_model,
    p_metadata,
    p_attributes
  );
$$;

create or replace function public.scrimed_match_stored_vector(
  source_vector_id uuid,
  tenant_scope text,
  workflow_scope text,
  match_threshold double precision default 0.72,
  match_count integer default 10
)
returns table (
  rank integer,
  vector_id uuid,
  source_ref text,
  vector_domain text,
  match_score double precision,
  metadata jsonb,
  source_status text,
  reviewer_status text,
  evidence_summary jsonb,
  safety_boundary text,
  created_at timestamptz
)
language sql
volatile
security invoker
set search_path = ''
as $$
  select *
  from private.search_scrimed_stored_vectors(
    source_vector_id,
    tenant_scope,
    'patient-matching',
    jsonb_build_object('workflowScope', workflow_scope),
    match_threshold,
    match_count,
    'scrimed_match_stored_vector'
  );
$$;

create or replace function public.scrimed_search_similar_documents(
  source_vector_id uuid,
  tenant_scope text,
  document_class text default null,
  match_threshold double precision default 0.72,
  match_count integer default 10
)
returns table (
  rank integer,
  vector_id uuid,
  source_ref text,
  vector_domain text,
  match_score double precision,
  metadata jsonb,
  source_status text,
  reviewer_status text,
  evidence_summary jsonb,
  safety_boundary text,
  created_at timestamptz
)
language sql
volatile
security invoker
set search_path = ''
as $$
  select *
  from private.search_scrimed_stored_vectors(
    source_vector_id,
    tenant_scope,
    'document-similarity',
    jsonb_build_object('documentClass', document_class),
    match_threshold,
    match_count,
    'scrimed_search_similar_documents'
  );
$$;

create or replace function public.scrimed_search_clinical_evidence(
  source_vector_id uuid,
  specialty text default null,
  evidence_class text default null,
  freshness_window interval default interval '730 days',
  match_count integer default 10
)
returns table (
  rank integer,
  vector_id uuid,
  source_ref text,
  vector_domain text,
  match_score double precision,
  metadata jsonb,
  source_status text,
  reviewer_status text,
  evidence_summary jsonb,
  safety_boundary text,
  created_at timestamptz
)
language sql
volatile
security invoker
set search_path = ''
as $$
  select *
  from private.search_scrimed_stored_vectors(
    source_vector_id,
    null,
    'clinical-retrieval',
    jsonb_build_object(
      'specialty', specialty,
      'evidenceClass', evidence_class,
      'freshnessWindowDays', least(3650, greatest(1, floor(extract(epoch from freshness_window) / 86400)::integer))
    ),
    0.72,
    match_count,
    'scrimed_search_clinical_evidence'
  );
$$;

create or replace function public.scrimed_search_payer_policy(
  source_vector_id uuid,
  payer_scope text default null,
  policy_version text default null,
  criteria_scope text default null,
  match_count integer default 10
)
returns table (
  rank integer,
  vector_id uuid,
  source_ref text,
  vector_domain text,
  match_score double precision,
  metadata jsonb,
  source_status text,
  reviewer_status text,
  evidence_summary jsonb,
  safety_boundary text,
  created_at timestamptz
)
language sql
volatile
security invoker
set search_path = ''
as $$
  select *
  from private.search_scrimed_stored_vectors(
    source_vector_id,
    null,
    'payer-policy-lookup',
    jsonb_build_object(
      'payerScope', payer_scope,
      'policyVersion', policy_version,
      'criteriaScope', criteria_scope
    ),
    0.72,
    match_count,
    'scrimed_search_payer_policy'
  );
$$;

create or replace function public.scrimed_search_recommendation_memory(
  source_vector_id uuid,
  workflow_type text default null,
  reviewer_status text default 'validated',
  outcome_label text default null,
  match_count integer default 10
)
returns table (
  rank integer,
  vector_id uuid,
  source_ref text,
  vector_domain text,
  match_score double precision,
  metadata jsonb,
  source_status text,
  reviewer_status text,
  evidence_summary jsonb,
  safety_boundary text,
  created_at timestamptz
)
language sql
volatile
security invoker
set search_path = ''
as $$
  select *
  from private.search_scrimed_stored_vectors(
    source_vector_id,
    null,
    'recommendation-search',
    jsonb_build_object(
      'workflowType', workflow_type,
      'reviewerStatus', reviewer_status,
      'outcomeLabel', outcome_label
    ),
    0.72,
    match_count,
    'scrimed_search_recommendation_memory'
  );
$$;

revoke all on function private.scrimed_stored_vector_lookup_boundary()
  from public, anon, authenticated, service_role;
revoke all on function private.reject_scrimed_stored_vector_prohibited_text(text)
  from public, anon, authenticated, service_role;
revoke all on function private.scrimed_stored_vector_json(private.scrimed_stored_vectors)
  from public, anon, authenticated, service_role;
revoke all on function private.register_scrimed_synthetic_stored_vector(text, text, text, vector, text, jsonb, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function private.search_scrimed_stored_vectors(uuid, text, text, jsonb, double precision, integer, text)
  from public, anon, authenticated, service_role;

revoke all on function public.register_scrimed_synthetic_stored_vector(text, text, text, vector, text, jsonb, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.scrimed_match_stored_vector(uuid, text, text, double precision, integer)
  from public, anon, authenticated, service_role;
revoke all on function public.scrimed_search_similar_documents(uuid, text, text, double precision, integer)
  from public, anon, authenticated, service_role;
revoke all on function public.scrimed_search_clinical_evidence(uuid, text, text, interval, integer)
  from public, anon, authenticated, service_role;
revoke all on function public.scrimed_search_payer_policy(uuid, text, text, text, integer)
  from public, anon, authenticated, service_role;
revoke all on function public.scrimed_search_recommendation_memory(uuid, text, text, text, integer)
  from public, anon, authenticated, service_role;

grant execute on function private.register_scrimed_synthetic_stored_vector(text, text, text, vector, text, jsonb, jsonb)
  to authenticated;
grant execute on function private.search_scrimed_stored_vectors(uuid, text, text, jsonb, double precision, integer, text)
  to authenticated;

grant execute on function public.register_scrimed_synthetic_stored_vector(text, text, text, vector, text, jsonb, jsonb)
  to authenticated;
grant execute on function public.scrimed_match_stored_vector(uuid, text, text, double precision, integer)
  to authenticated;
grant execute on function public.scrimed_search_similar_documents(uuid, text, text, double precision, integer)
  to authenticated;
grant execute on function public.scrimed_search_clinical_evidence(uuid, text, text, interval, integer)
  to authenticated;
grant execute on function public.scrimed_search_payer_policy(uuid, text, text, text, integer)
  to authenticated;
grant execute on function public.scrimed_search_recommendation_memory(uuid, text, text, text, integer)
  to authenticated;

comment on table private.scrimed_stored_vectors is
  'Synthetic/no-PHI stored-vector registry for internal database-side similarity search. Direct access is denied; use guarded RPCs only.';
comment on table private.scrimed_stored_vector_lookup_events is
  'Metadata-only audit events for SCRIMED stored-vector registration and lookup. No raw embeddings, PHI, secrets, or connector payloads are logged.';
comment on function public.register_scrimed_synthetic_stored_vector(text, text, text, vector, text, jsonb, jsonb) is
  'Registers a synthetic/no-PHI stored vector for tenant-scoped SCRIMED lookup. Requires AAL2 governance session, server runtime token, and tenant-admin or pilot-lead role.';
comment on function public.scrimed_match_stored_vector(uuid, text, text, double precision, integer) is
  'Patient-matching stored-vector lookup for synthetic/de-identified workflows only. No live identity resolution authority.';
comment on function public.scrimed_search_similar_documents(uuid, text, text, double precision, integer) is
  'Document-similarity stored-vector lookup for synthetic or approved de-identified evidence only.';
comment on function public.scrimed_search_clinical_evidence(uuid, text, text, interval, integer) is
  'Clinical evidence stored-vector lookup for research/demo use only; not for diagnosis, treatment, prescribing, or live patient care.';
comment on function public.scrimed_search_payer_policy(uuid, text, text, text, integer) is
  'Payer-policy stored-vector lookup for recommendation-only workflow prep; no prior-auth submission, appeal filing, or coverage guarantee.';
comment on function public.scrimed_search_recommendation_memory(uuid, text, text, text, integer) is
  'Reviewed recommendation-memory stored-vector lookup for synthetic workflow planning only. Human review remains required.';
