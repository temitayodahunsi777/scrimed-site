alter table private.execution_attempts
  add column if not exists compute_fabric_telemetry jsonb,
  add column if not exists compute_fabric_audit_hash text,
  add column if not exists compute_fabric_selected_model text,
  add column if not exists compute_fabric_model_tier text,
  add column if not exists compute_fabric_provider text,
  add column if not exists compute_fabric_deployment_mode text,
  add column if not exists compute_fabric_phi_policy text,
  add column if not exists compute_fabric_human_review_required boolean,
  add column if not exists compute_fabric_fallback_models jsonb;

comment on column private.execution_attempts.compute_fabric_telemetry is
  'SCRIMED Compute Fabric routing metadata copied from the server-known no-PHI execution envelope. Metadata only; no model payloads, PHI, prompts, or connector data.';
comment on column private.execution_attempts.compute_fabric_audit_hash is
  'Deterministic Compute Fabric model-selection audit hash.';
comment on column private.execution_attempts.compute_fabric_selected_model is
  'Selected Compute Fabric model slot id. Placeholder/metadata only.';
comment on column private.execution_attempts.compute_fabric_model_tier is
  'Selected Compute Fabric model tier.';
comment on column private.execution_attempts.compute_fabric_provider is
  'Selected Compute Fabric provider/runtime slot.';
comment on column private.execution_attempts.compute_fabric_deployment_mode is
  'SCRIMED_CLOUD, CUSTOMER_VPC, AIR_GAPPED, or EDGE_DEVICE deployment metadata.';
comment on column private.execution_attempts.compute_fabric_phi_policy is
  'Compute Fabric PHI routing policy. Production PHI remains not authorized.';
comment on column private.execution_attempts.compute_fabric_human_review_required is
  'Whether the Compute Fabric decision requires human review.';
comment on column private.execution_attempts.compute_fabric_fallback_models is
  'Array of fallback model slot ids. Metadata only.';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'execution_attempts_compute_fabric_telemetry_shape'
      and conrelid = 'private.execution_attempts'::regclass
  ) then
    alter table private.execution_attempts
      add constraint execution_attempts_compute_fabric_telemetry_shape
      check (
        compute_fabric_telemetry is null
        or (
          jsonb_typeof(compute_fabric_telemetry) = 'object'
          and pg_column_size(compute_fabric_telemetry) <= 32768
        )
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'execution_attempts_compute_fabric_audit_hash_shape'
      and conrelid = 'private.execution_attempts'::regclass
  ) then
    alter table private.execution_attempts
      add constraint execution_attempts_compute_fabric_audit_hash_shape
      check (
        compute_fabric_audit_hash is null
        or compute_fabric_audit_hash ~ '^scrimed-intel-[0-9a-f]{8}$'
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'execution_attempts_compute_fabric_model_tier_allowed'
      and conrelid = 'private.execution_attempts'::regclass
  ) then
    alter table private.execution_attempts
      add constraint execution_attempts_compute_fabric_model_tier_allowed
      check (
        compute_fabric_model_tier is null
        or compute_fabric_model_tier in (
          'FRONTIER_MODEL',
          'COMPACT_REASONING_MODEL',
          'MEDICAL_SPECIALIST_MODEL',
          'VISION_MODEL',
          'SPEECH_MODEL',
          'EMBEDDING_MODEL'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'execution_attempts_compute_fabric_deployment_mode_allowed'
      and conrelid = 'private.execution_attempts'::regclass
  ) then
    alter table private.execution_attempts
      add constraint execution_attempts_compute_fabric_deployment_mode_allowed
      check (
        compute_fabric_deployment_mode is null
        or compute_fabric_deployment_mode in (
          'SCRIMED_CLOUD',
          'CUSTOMER_VPC',
          'AIR_GAPPED',
          'EDGE_DEVICE'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'execution_attempts_compute_fabric_phi_policy_allowed'
      and conrelid = 'private.execution_attempts'::regclass
  ) then
    alter table private.execution_attempts
      add constraint execution_attempts_compute_fabric_phi_policy_allowed
      check (
        compute_fabric_phi_policy is null
        or compute_fabric_phi_policy in (
          'no-phi-synthetic-routing-only',
          'metadata-only-no-public-phi',
          'private-inference-required',
          'air-gapped-local-only',
          'edge-local-only',
          'public-model-blocked-private-inference-required'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'execution_attempts_compute_fabric_fallback_models_array'
      and conrelid = 'private.execution_attempts'::regclass
  ) then
    alter table private.execution_attempts
      add constraint execution_attempts_compute_fabric_fallback_models_array
      check (
        compute_fabric_fallback_models is null
        or jsonb_typeof(compute_fabric_fallback_models) = 'array'
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'execution_attempts_compute_fabric_high_risk_review'
      and conrelid = 'private.execution_attempts'::regclass
  ) then
    alter table private.execution_attempts
      add constraint execution_attempts_compute_fabric_high_risk_review
      check (
        compute_fabric_human_review_required is null
        or clinical_risk_level not in ('high', 'prohibited')
        or compute_fabric_human_review_required is true
      );
  end if;
end;
$$;

create or replace function private.require_execution_attempt_compute_fabric(
  p_envelope jsonb
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  telemetry jsonb := p_envelope -> 'computeFabricTelemetry';
  audit_tags jsonb := telemetry -> 'auditTags';
  fallback_models jsonb := telemetry -> 'fallbackModels';
  risk_tier text := p_envelope #>> '{modelRouteTelemetry,riskTier}';
begin
  if jsonb_typeof(telemetry) <> 'object'
    or pg_column_size(telemetry) > 32768 then
    raise exception 'execution-attempt-compute-fabric-required';
  end if;

  if coalesce(telemetry ->> 'fabricStatus', '') <> 'synthetic-routing-only-no-live-model-calls'
    or coalesce(telemetry ->> 'safetyBoundary', '') <> 'metadata-only-no-live-model-call' then
    raise exception 'execution-attempt-compute-fabric-boundary-violation';
  end if;

  if coalesce(telemetry ->> 'confidenceCorrectnessBoundary', '') <> 'confidence-is-not-correctness' then
    raise exception 'execution-attempt-compute-fabric-confidence-boundary-required';
  end if;

  if coalesce(telemetry ->> 'auditHash', '') !~ '^scrimed-intel-[0-9a-f]{8}$' then
    raise exception 'execution-attempt-compute-fabric-audit-hash-invalid';
  end if;

  if char_length(coalesce(telemetry ->> 'selectedModel', '')) < 3
    or char_length(coalesce(telemetry ->> 'selectedModel', '')) > 160 then
    raise exception 'execution-attempt-compute-fabric-model-invalid';
  end if;

  if coalesce(telemetry ->> 'modelTier', '') not in (
    'FRONTIER_MODEL',
    'COMPACT_REASONING_MODEL',
    'MEDICAL_SPECIALIST_MODEL',
    'VISION_MODEL',
    'SPEECH_MODEL',
    'EMBEDDING_MODEL'
  ) then
    raise exception 'execution-attempt-compute-fabric-tier-invalid';
  end if;

  if coalesce(telemetry ->> 'provider', '') not in (
    'gpt_class_frontier',
    'claude_class_frontier',
    'gemini_class_frontier',
    'pulsar_16b_compact_open_reasoning',
    'llama_mistral_qwen_glm_open',
    'biomed_specialist',
    'radiology_specialist',
    'pathology_specialist',
    'scrimed_private_vllm',
    'scrimed_private_sglang',
    'nvidia_nim',
    'triton_inference_server',
    'tensorrt_llm',
    'flashinfer_runtime',
    'synthetic_no_call'
  ) then
    raise exception 'execution-attempt-compute-fabric-provider-invalid';
  end if;

  if coalesce(telemetry ->> 'deploymentMode', '') not in (
    'SCRIMED_CLOUD',
    'CUSTOMER_VPC',
    'AIR_GAPPED',
    'EDGE_DEVICE'
  ) then
    raise exception 'execution-attempt-compute-fabric-deployment-invalid';
  end if;

  if coalesce(telemetry ->> 'phiPolicy', '') not in (
    'no-phi-synthetic-routing-only',
    'metadata-only-no-public-phi',
    'private-inference-required',
    'air-gapped-local-only',
    'edge-local-only',
    'public-model-blocked-private-inference-required'
  ) then
    raise exception 'execution-attempt-compute-fabric-phi-policy-invalid';
  end if;

  if risk_tier in ('high', 'prohibited')
    and coalesce((telemetry ->> 'requiresHumanReview')::boolean, false) is not true then
    raise exception 'execution-attempt-compute-fabric-human-review-required';
  end if;

  if jsonb_typeof(audit_tags) <> 'array'
    or not (audit_tags ? 'no-live-model-call')
    or not (audit_tags ? 'no-autonomous-clinical-authority') then
    raise exception 'execution-attempt-compute-fabric-audit-tags-invalid';
  end if;

  if fallback_models is not null
    and jsonb_typeof(fallback_models) <> 'array' then
    raise exception 'execution-attempt-compute-fabric-fallback-invalid';
  end if;

  if coalesce(p_envelope #>> '{evidenceAuditTrail,compute_fabric_audit_hash}', '') <> telemetry ->> 'auditHash'
    or coalesce(p_envelope #>> '{evidenceAuditTrail,compute_fabric_selected_model}', '') <> telemetry ->> 'selectedModel'
    or coalesce(p_envelope #>> '{evidenceAuditTrail,compute_fabric_phi_policy}', '') <> telemetry ->> 'phiPolicy' then
    raise exception 'execution-attempt-compute-fabric-evidence-binding-mismatch';
  end if;

  return telemetry;
end;
$$;

create or replace function private.populate_execution_attempt_compute_fabric_columns()
returns trigger
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  telemetry jsonb;
begin
  telemetry := private.require_execution_attempt_compute_fabric(new.envelope);

  new.compute_fabric_telemetry := telemetry;
  new.compute_fabric_audit_hash := telemetry ->> 'auditHash';
  new.compute_fabric_selected_model := telemetry ->> 'selectedModel';
  new.compute_fabric_model_tier := telemetry ->> 'modelTier';
  new.compute_fabric_provider := telemetry ->> 'provider';
  new.compute_fabric_deployment_mode := telemetry ->> 'deploymentMode';
  new.compute_fabric_phi_policy := telemetry ->> 'phiPolicy';
  new.compute_fabric_human_review_required :=
    coalesce((telemetry ->> 'requiresHumanReview')::boolean, true);
  new.compute_fabric_fallback_models :=
    coalesce(telemetry -> 'fallbackModels', '[]'::jsonb);

  return new;
end;
$$;

drop trigger if exists populate_execution_attempt_compute_fabric_columns
  on private.execution_attempts;

create trigger populate_execution_attempt_compute_fabric_columns
before insert or update of envelope on private.execution_attempts
for each row
execute function private.populate_execution_attempt_compute_fabric_columns();

update private.execution_attempts
set
  compute_fabric_telemetry = envelope -> 'computeFabricTelemetry',
  compute_fabric_audit_hash = envelope #>> '{computeFabricTelemetry,auditHash}',
  compute_fabric_selected_model = envelope #>> '{computeFabricTelemetry,selectedModel}',
  compute_fabric_model_tier = envelope #>> '{computeFabricTelemetry,modelTier}',
  compute_fabric_provider = envelope #>> '{computeFabricTelemetry,provider}',
  compute_fabric_deployment_mode = envelope #>> '{computeFabricTelemetry,deploymentMode}',
  compute_fabric_phi_policy = envelope #>> '{computeFabricTelemetry,phiPolicy}',
  compute_fabric_human_review_required =
    coalesce((envelope #>> '{computeFabricTelemetry,requiresHumanReview}')::boolean, true),
  compute_fabric_fallback_models =
    coalesce(envelope #> '{computeFabricTelemetry,fallbackModels}', '[]'::jsonb)
where envelope ? 'computeFabricTelemetry'
  and compute_fabric_telemetry is null;

create index if not exists execution_attempts_compute_fabric_model_tier_idx
  on private.execution_attempts(workspace_id, compute_fabric_model_tier, created_at desc)
  where compute_fabric_model_tier is not null;
create index if not exists execution_attempts_compute_fabric_phi_policy_idx
  on private.execution_attempts(workspace_id, compute_fabric_phi_policy, created_at desc)
  where compute_fabric_phi_policy is not null;
create index if not exists execution_attempts_compute_fabric_audit_hash_idx
  on private.execution_attempts(compute_fabric_audit_hash)
  where compute_fabric_audit_hash is not null;

create or replace function private.execution_attempt_json(
  attempt private.execution_attempts
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', attempt.id,
    'tenantId', attempt.tenant_id,
    'workspaceId', attempt.workspace_id,
    'workspaceSlug', (
      select workspace.slug
      from public.pilot_workspaces workspace
      where workspace.id = attempt.workspace_id
    ),
    'attemptId', attempt.attempt_id,
    'idempotencyKey', attempt.idempotency_key,
    'replayToken', attempt.replay_token,
    'workflowSlug', attempt.workflow_slug,
    'workflowVersion', attempt.workflow_version,
    'lifecycleState', attempt.lifecycle_state,
    'buildStatus', attempt.build_status,
    'clinicalRiskLevel', attempt.clinical_risk_level,
    'region', attempt.region,
    'retentionUntil', attempt.retention_until,
    'lockExpiresAt', attempt.lock_expires_at,
    'computeFabricTelemetry', attempt.compute_fabric_telemetry,
    'computeFabricAuditHash', attempt.compute_fabric_audit_hash,
    'computeFabricSelectedModel', attempt.compute_fabric_selected_model,
    'computeFabricModelTier', attempt.compute_fabric_model_tier,
    'computeFabricProvider', attempt.compute_fabric_provider,
    'computeFabricDeploymentMode', attempt.compute_fabric_deployment_mode,
    'computeFabricPhiPolicy', attempt.compute_fabric_phi_policy,
    'computeFabricHumanReviewRequired', attempt.compute_fabric_human_review_required,
    'computeFabricFallbackModels', attempt.compute_fabric_fallback_models,
    'envelope', attempt.envelope,
    'eventCount', (
      select count(*)
      from private.execution_attempt_events event
      where event.execution_attempt_id = attempt.id
    ),
    'reviewDispositionCount', (
      select count(*)
      from private.execution_attempt_review_dispositions review
      where review.execution_attempt_id = attempt.id
    ),
    'humanReviewRequired', attempt.human_review_required,
    'noPhiAssertion', attempt.no_phi_assertion,
    'createdBy', attempt.created_by,
    'createdAt', attempt.created_at,
    'updatedAt', attempt.updated_at,
    'boundary', attempt.boundary
  );
$$;
