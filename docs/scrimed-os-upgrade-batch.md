# SCRIMED OS Upgrade Batch

SCRIMED OS Upgrade Batch adds synthetic, metadata-only control-plane registries for runtime optimization, prompt evolution, clinical judge scoring, human oversight, agent validation, token economics, long-horizon agents, clinical knowledge fabric, model regression watch, life-sciences research readiness, and public trust narrative.

Routes:

- UI anchor: `/scrimed-os#upgrade-batch`
- JSON: `/api/scrimed-os/upgrade-batch`
- Brief: `/api/scrimed-os/upgrade-batch/brief`

## Boundary

This batch is read-only, synthetic, and metadata-only. It does not call live models, process PHI, create clinical recommendations, diagnose, treat, prescribe, interpret imaging, mutate EHRs, submit payer transactions, contact patients, activate production connectors, claim certification, validate clinical performance, or approve customer go-live.

## Modules Added

- Runtime Optimizer: prompt compression, context compression, semantic caching, dynamic model routing, latency class, cost class, safety class, fallback path, simulated cost savings, and guardrail state.
- Prompt Evolution Engine: prompt version metadata, baseline and optimized scores, clinician review flags, and deployment states.
- Clinical Judge Ensemble: quality, evidence, safety, payer policy, specialty, and readability judges that output scores plus rationale hashes only.
- Human Oversight Queue: metadata-only review queue with hashed case IDs, risk tiers, reviewer roles, escalation reasons, and blocked high-risk execution unless reviewed.
- Agent Lab: synthetic validation scenarios for simulated cases, adversarial prompts, hallucination checks, cost checks, latency checks, and auditability.
- Token Economics Dashboard: cost per outcome metrics for notes, claim reviews, prior-auth drafts, patient summaries, and agent runs.
- Long-Horizon Agent Registry: diabetes, heart failure, oncology, population health, and hospital operations agents in lab-only mode.
- Clinical Knowledge Fabric: ontology/semantic metadata for FHIR, SNOMED, LOINC, RxNorm, ICD-10, CPT, payer policy, and clinical guidelines.
- Model Regression Watch: model version metadata, approved tasks, blocked tasks, regression score, eval hash, rollback state, and no clinical auto-promotion.
- Life Sciences / Drug Discovery Readiness: research-preview shells only for literature synthesis, biomarker discovery, molecule ranking, protocol optimization, and trial recruitment prediction.

## Validation Rules

- Unsafe prompt deployment states remain blocked.
- High-risk clinical-like tasks cannot execute unless `human_reviewed`.
- Every synthetic agent must have an owner, risk tier, allowed data class, blocked actions, and audit hash.
- Clinical judge outputs remain scores and rationale hashes only.
- Model upgrades cannot auto-promote to clinical authority.
- Life sciences capabilities remain `research_preview` and block drug, molecule, therapeutic, enrollment, and validation claims.

## Public Narrative

Safe copy emphasizes healthcare-native AI, clinician-governed intelligence, measurable outcomes, auditability, model-agnostic infrastructure, privacy-first deployment, and synthetic demonstration boundaries. It avoids FDA, HIPAA, SOC 2, clinical validation, live PHI, customer, and production claims unless separately approved by qualified review.
