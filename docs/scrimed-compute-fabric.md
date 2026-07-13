# SCRIMED Compute Fabric

SCRIMED Compute Fabric is the production-safe architecture foundation for multi-model healthcare intelligence routing, private inference, edge AI deployment support, model benchmarking, and cost/latency-aware model selection.

Current status: **synthetic-routing-only-no-live-model-calls**.

This layer does not call external models, process live PHI, diagnose, treat, prescribe, submit payer transactions, write to an EHR, perform final imaging interpretation, approve production connectors, activate customers, or claim regulatory certification.

## Architecture Overview

The Compute Fabric sits behind SCRIMED agents and workflow modules as a governed routing layer. It accepts typed task metadata, evaluates clinical risk and PHI sensitivity, chooses a model tier/provider slot, emits an audit event, and attaches confidence/uncertainty metadata.

The router treats LLMs and model runtimes as replaceable compute targets, not as the whole product. SCRIMED remains the governance, orchestration, policy, evidence, audit, review, and workflow layer.

Primary implementation:

- `app/lib/scrimedComputeFabric.ts`
- `/api/scrimed-compute-fabric`
- `/api/scrimed-compute-fabric/brief`
- `/api/scrimed-compute-fabric/migration-preflight`
- `/api/scrimed-compute-fabric/migration-preflight/brief`
- `supabase/migrations/20260705164000_execution_attempt_compute_fabric_evidence_binding.sql`
- `npm run smoke:scrimed-compute-fabric`
- `npm run smoke:scrimed-compute-fabric:migration-preflight`

## Model Routing Matrix

Routing inputs:

- clinical risk: `low`, `moderate`, `high`, `critical`
- PHI sensitivity: `none`, `metadata_only`, `phi_possible`, `phi_heavy`
- latency requirement: `subsecond`, `interactive`, `standard`, `batch`
- cost sensitivity: `strict`, `balanced`, `premium_allowed`
- deployment mode: `SCRIMED_CLOUD`, `CUSTOMER_VPC`, `AIR_GAPPED`, `EDGE_DEVICE`
- reasoning depth: `shallow`, `standard`, `deep`, `specialist`
- modality: `text`, `voice`, `image`, `DICOM`, `FHIR`, `OCR`
- task type: `clinical_reasoning`, `RCM`, `intake`, `coding`, `documentation`, `referral_routing`, `research`, `operations`

Model tiers:

- `FRONTIER_MODEL` for high-risk clinical reasoning and complex synthesis when the data policy allows it.
- `COMPACT_REASONING_MODEL` for lower-risk operational, RCM, intake, referral, and administrative workflows.
- `MEDICAL_SPECIALIST_MODEL` for private, high-risk clinical domain workflows requiring validation and human review.
- `VISION_MODEL` for imaging, DICOM, OCR, redaction, and document-image workflows, never final medical interpretation.
- `SPEECH_MODEL` for ambient scribe and voice workflows with draft-only clinician signoff.
- `EMBEDDING_MODEL` for retrieval, indexing, and pre-indexed intelligence workflows.

Required model selection output:

```json
{
  "selectedModel": "private-vllm-medical-runtime-slot",
  "modelTier": "MEDICAL_SPECIALIST_MODEL",
  "provider": "scrimed_private_vllm",
  "deploymentMode": "AIR_GAPPED",
  "reason": "MEDICAL_SPECIALIST_MODEL selected for clinical_reasoning",
  "riskLevel": "critical",
  "phiPolicy": "air-gapped-local-only",
  "requiresHumanReview": true,
  "fallbackModels": [],
  "estimatedCostClass": "MODERATE",
  "estimatedLatencyClass": "STANDARD",
  "auditTags": ["scrimed-compute-fabric"]
}
```

## Deployment Modes

`SCRIMED_CLOUD`: metadata-only routing for synthetic demos and future governed cloud inference.

`CUSTOMER_VPC`: private network deployment mode for enterprise customers after contracts, privacy review, tenant controls, monitoring, and review gates.

`AIR_GAPPED`: local-only routing for PHI-heavy or disconnected environments. Public model transfer is blocked.

`EDGE_DEVICE`: local/edge routing for browser, Mac, iPhone, appliance, and hospital-edge patterns. Edge mode favors local speech, OCR, DICOM, embedding, and compact reasoning runtimes.

## Safety Boundaries

The router enforces these boundaries:

- High-risk clinical care defaults to a frontier or validated medical specialist model slot, then requires human review.
- Air-gapped and PHI-heavy workflows prefer local/private models.
- Public model PHI transfer is blocked unless explicitly approved through compliance, contract, tenant, and technical controls.
- No autonomous diagnosis, treatment, prescribing, payer submission, EHR writeback, patient outreach, or final imaging interpretation.
- Clinical recommendations require human review.
- Confidence is not correctness. Correctness requires evidence, benchmark validation, source review, and human signoff.
- Every selection emits an audit event with model, provider, risk level, deployment mode, PHI policy, fallback path, and guardrail tags.

## Durable Evidence Binding

Execution-attempt envelopes bind Compute Fabric selections into `computeFabricTelemetry`, and the durable-store migration projects the same metadata into first-class no-PHI columns:

- `compute_fabric_telemetry`
- `compute_fabric_audit_hash`
- `compute_fabric_selected_model`
- `compute_fabric_model_tier`
- `compute_fabric_provider`
- `compute_fabric_deployment_mode`
- `compute_fabric_phi_policy`
- `compute_fabric_human_review_required`
- `compute_fabric_fallback_models`

`compute_fabric_audit_hash` stores the SCRIMED deterministic audit fingerprint format (`scrimed-intel-[0-9a-f]{8}`), not a raw secret, token, provider credential, PHI value, or unredacted model payload.

The SQL trigger rejects new records missing Compute Fabric evidence, missing no-live-model-call tags, missing confidence/correctness separation, mismatched evidence-audit hashes, or high-risk human review.

## NVIDIA/Open-Model Roadmap

The candidate registry includes placeholders for:

- GPT-class frontier models
- Claude-class frontier models
- Gemini-class frontier models
- Pulsar 16B / compact open reasoning models
- Llama / Mistral / Qwen / GLM-class open models
- BioMed / radiology / pathology specialist models
- vLLM
- SGLang
- TensorRT-LLM
- NVIDIA NIM
- Triton Inference Server
- FlashInfer
- FP8 / NVFP4 optimized inference

These are readiness slots only. They require model cards, license review, evaluation datasets, benchmark gates, privacy approval, security review, deployment review, rollback plans, and clinician governance before use beyond synthetic metadata.

## Edge Appliance Roadmap

Edge deployments should support:

- local speech for ambient workflows
- local OCR and document redaction
- local DICOM/image preprocessing
- local embeddings and retrieval caches
- local compact reasoning models
- offline audit buffering
- encrypted sync after explicit authorization
- device posture checks
- policy version pinning
- human review before any clinical use

## Benchmarking Strategy

The scaffold includes:

- `benchmarkModelForTask()`
- `compareModels()`
- `recordLatency()`
- `recordCostClass()`
- `recordQualityScore()`
- `recordClinicalUtilityScore()`
- `recordVerifiabilityScore()`
- `recordCompletenessScore()`
- `recordSourceQualityScore()`

Benchmarks track latency, cost class, quality, clinical utility, verifiability, completeness, and source quality. Current values are deterministic synthetic metadata, not clinical validation.

## Operational Positioning

SCRIMED Compute Fabric makes SCRIMED measurable, governed, observable, faster, cheaper, safer, and harder to copy by separating healthcare orchestration from replaceable model providers.

Production use remains blocked until SCRIMED completes privacy, security, legal, clinical validation, deployment, connector, model governance, human review, and incident-response approvals.
