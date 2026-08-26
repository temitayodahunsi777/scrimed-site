# SCRIMED p.34 Adaptive Governance

Status: local synthetic/no-PHI candidate. Independent review and every external authorization remain pending.

## Architecture

```mermaid
flowchart LR
  I["Synthetic task intent"] --> W["Workflow contract"]
  W --> P["Task policy"]
  P --> D["Deterministic-first router"]
  D --> C["Capability admission"]
  C --> X["Contained tool stage"]
  H["Context Fabric v2"] --> X
  M["DICOM privacy adapter"] --> H
  X --> L["Decision Evidence Ledger"]
  L --> E["Two-loop evaluation"]
  E --> O["Agent Operations"]
  F["FinOps and resilience"] --> D
  R["Human review"] --> X
  R --> E
  E --> G["Release gate matrix"]
  X --> A["Action maturity"]
  A --> V["Verified outcome or rollback"]
  V --> O["ROI and continuity metrics"]
  O --> T["Trust expansion gate"]
```

The p.34 layer extends p.33 rather than replacing it:

- p.33 `ContextArtifact` remains the canonical context object.
- p.33 exact-action authorization remains the service-level policy authority.
- p.33 `DecisionEvidenceRecord` remains the append-only ledger primitive.
- p.33 provider-dependency checks remain the failover independence test.
- p.33 quality ratchet remains the noncompensable promotion gate.
- p.34 adds capability expiry, deterministic-first technique selection, document hierarchy, DICOM privacy manifests, richer action details, two-loop evidence, task economics, placement policy, and operator visibility.
- The v2 extension adds versioned workflow contracts, documentary model-fit evidence, approval-bound action maturity, trust expansion thresholds, non-PHI continuity metrics, public-sector evidence profiles, isolated challenger research, and workflow ROI telemetry.
- The clinical operating-system hardening adds review-only A0-A3 exact-approval evaluation, tenant-scoped governance evidence, PHI/secret egress controls, sandbox policy review, authenticated tenant-first clinical retrieval, external-validation and oversight gates, Patient Take-Home previews, assisted coding boundaries, operational recovery, and evidence-bound claim review.

## Governance Hierarchy

### Framework

Principles: minimum necessary data, deterministic sufficiency, least privilege, human authority, evidence before assertion, vendor replaceability, safe refusal, contemporaneous audit, and cost per safe accepted outcome.

Ownership:

| Domain | Accountable owner | Required independent review |
| --- | --- | --- |
| Clinical safety | Clinical safety owner | Qualified clinical reviewer |
| Privacy and data use | Privacy owner | Privacy/legal reviewer |
| Security and identity | Security owner | Independent security reviewer |
| Model/provider admission | Model governance owner | Platform + safety reviewers |
| DICOM de-identification | Imaging privacy owner | Imaging privacy + clinical reviewers |
| Evaluation and promotion | Evaluation owner | Independent technical/clinical reviewers |
| Pilot value | Business workflow owner | Customer-designated owner before external use |
| Release | Release owner | Exact-candidate named reviewers |

### Policies

- Unknown, missing, disabled, expired, revoked, or unverified capability is denied.
- Deterministic validation, transformation, graph, optimization, and retrieval techniques precede generation.
- Clinical, identity, authorization, consent, billing, and irreversible-write decisions cannot fall through to unrestricted generation.
- State-changing actions require exact payload-bound human approval plus trusted-store verification and atomic consumption; they remain disabled in this candidate.
- Retrieved content is data, not executable instruction.
- DICOM metadata removal does not establish anonymization; uncertain pixels are quarantined.
- No challenger self-promotes and no safety, privacy, authorization, provenance, or clinical floor can be traded away.
- Public claims require trusted primary-evidence resolution, owner, approved wording, retrieval date, expiry, named publication approval, and applicable legal review; publication remains disabled in this candidate.

### Standards

- Every admitted route has a content digest, harness, modalities, risk/data limits, regions, environments, budgets, tools, approvals, effective date, and revalidation date.
- Every context fact retains source hash and span; p.34 chunks add heading path, table headers, page/bounding box, token estimate, freshness, confidence, and contradiction group.
- Every DICOM decision emits hash-only before/after manifests, policy and operator identity, private-tag findings, pixel disposition, and retained export block.
- Every consequential decision binds tenant, actor, delegated authority, intended use, task/risk class, evidence, policy, route, tools, approvals, result, exception, escalation, time, and predecessor hash.
- Cache identities include tenant and namespace. Retries, fallbacks, turns, time, tokens, and cost are bounded.

## Workflow, Model Fit, And Action Maturity

Every bounded run begins with a `WorkflowContract` naming the intended use, owner, target user, baseline, outcome and safety KPIs, data sources and locality, required authority, approval policy, rollback policy, risk, review requirement, and fresh release evidence. Missing, unverified, stale, or incomplete evidence blocks the workflow before routing.

Model fit uses only enabled, healthy, locally evaluated candidates with verified task, modality, locality, licensing, interoperability, context, safety, privacy, and authorization evidence. Public benchmark rank is retained only as non-authoritative metadata and is never a selection input. Quality and reliability are hard floors; cost and latency are soft constraints that require an attributable justification when degraded.

Action maturity advances only through `ANSWER_ONLY`, `RECOMMENDATION`, `DRAFT_ACTION`, `PENDING_APPROVAL`, `AUTHORIZED_EXECUTION`, `VERIFIED_OUTCOME`, or `FAILED_OR_REVERSED`. Every accepted transition binds actor, authority, input and result hashes, policy, timestamp, idempotency key, approval, predecessor, and rollback status. This candidate blocks every external or system-of-record write.

## Trust Expansion And Continuity

Pilot expansion checks a defined synthetic cohort and duration, completion, verified outcomes, critical errors, overrides, rollbacks, review burden, abandonment, latency, and cost. Evidence must be fresh, and named clinical, privacy/security, and operational approvals remain external. Passing metrics only makes a workflow eligible for review; it does not authorize expansion.

Continuity records hashed care-team relationship periods, transfers, interruptions, reconnects, and human-reviewed follow-up work. It reports segmented non-PHI operational metrics only. No observational association is encoded as causal, and no therapeutic or clinical claim is authorized.

## Public Sector And Challengers

Public-sector readiness is an evidence profile for security controls, residency, auditability, accessibility, procurement artifacts, and contract-vehicle references. Empty or stale documentary lanes fail closed. The profile cannot claim FedRAMP, HIPAA compliance, government authorization, or purchasing eligibility.

Qwen3.8 and MAI-Code labels are stored only as disabled, unverified research references in an isolated non-PHI challenger registry. The repository makes no vendor-performance assertion. Any future candidate requires reproducible local task evidence, reviewed license and infrastructure evidence, named approval, regression testing, and rollback readiness before a separate promotion decision.

## Workflow ROI

The privacy-safe dashboard reports asking-versus-doing distribution, verified and failed or rolled-back outcomes, human-review minutes, continuity measures, cost per completed workflow, provider/model distribution, routing rationale, evidence freshness, and expansion-gate state. It does not store raw prompts, PHI, secrets, or sensitive source content.

### Guidelines And Runbooks

Operational procedures are in `docs/runbooks/P34_ADAPTIVE_GOVERNANCE_RUNBOOK.md`. Threat and residual-risk changes are in `docs/security/P34_THREAT_BOUNDARY_UPDATE.md`.

## Two-Loop Evaluation

The inner loop runs fixed synthetic/de-identified cases for safety, grounding, citations, extraction, tool selection, completion, latency, and cost. Repeated trials record variation.

The outer loop accepts only privacy-safe shadow metrics for completion, abandonment, correction, escalation, repeated prompting, unsupported assertions, tool failure, approval denial, latency, and cost. Raw PHI is prohibited. Production-like failures may become regression candidates only after de-identification and review.

Promotion requires all hard floors, worst-cell evidence, rollback readiness, and independent review. Automatic promotion is always false.

## Feature Flags

Safe local evaluation defaults on:

- `SCRIMED_P34_ADAPTIVE_GOVERNANCE_ENABLED`
- `SCRIMED_P34_DETERMINISTIC_ROUTER_ENABLED`
- `SCRIMED_P34_CONTEXT_PROVENANCE_ENABLED`
- `SCRIMED_P34_SYNTHETIC_DICOM_PRIVACY_ENABLED`
- `SCRIMED_P34_DECISION_LEDGER_ENABLED`
- `SCRIMED_P34_TWO_LOOP_EVALUATION_ENABLED`
- `SCRIMED_P34_FINOPS_RESILIENCE_ENABLED`
- `SCRIMED_P34_HYBRID_PLACEMENT_ENABLED`
- `SCRIMED_P34_WORKFLOW_CONTRACTS_ENABLED`
- `SCRIMED_P34_CONTINUITY_METRICS_ENABLED`
- `SCRIMED_P34_CLINICAL_OPERATING_SYSTEM_ENABLED`
- `SCRIMED_P34_AUTONOMY_CONTRACT_ENABLED`
- `SCRIMED_P34_PHI_BOUNDARY_ENABLED`
- `SCRIMED_P34_SANDBOX_POLICY_ENABLED`
- `SCRIMED_P34_EXTERNAL_VALIDATION_ENABLED`
- `SCRIMED_P34_PATIENT_TAKE_HOME_PREVIEW_ENABLED`
- `SCRIMED_P34_MEDICAL_CODING_DRAFT_ENABLED`

High-risk capability defaults off:

- `SCRIMED_P34_EXTERNAL_PROVIDER_CALLS_ENABLED`
- `SCRIMED_P34_DICOM_EXPORT_ENABLED`
- `SCRIMED_P34_LIVE_PHI_ENABLED`
- `SCRIMED_P34_CONSEQUENTIAL_EXECUTION_ENABLED`
- `SCRIMED_P34_PRODUCTION_PROMOTION_ENABLED`
- `SCRIMED_P34_CHALLENGER_EVALUATION_ENABLED`
- `SCRIMED_P34_TRUST_EXPANSION_ENABLED`
- `SCRIMED_P34_PUBLIC_SECTOR_CLAIMS_ENABLED`

Changing a flag does not satisfy policy, evidence, approval, identity, legal, clinical, privacy, security, migration, deployment, or customer gates.

## Evidence Retention

Retain hash-addressed policy decisions, approvals, route decisions, evaluation summaries, incident records, and rollback receipts according to the approved tenant retention schedule. Do not retain raw prompts, raw PHI, secrets, hidden reasoning, source DICOM values, or pixel data in general telemetry. Legal hold and deletion requests require authorized operator handling and append-only receipts.

## Pilot Checklists

### Non-PHI Pilot

- Synthetic or formally approved de-identified data only.
- Named business and workflow owner.
- Exact intended use, task policy, acceptance criteria, and stop conditions.
- Tenant isolation and deny-by-default tool/network checks.
- Fixed evaluation suite, worst-cell result, review plan, cost baseline, rollback rehearsal.
- Exact-candidate technical, security/privacy, and claims review.
- No external call, customer data, outreach, clinical action, payer submission, or writeback.

### PHI-Capable Pilot

Blocked in this candidate. Before reconsideration: legal data-use authority, BAA/DPA/service scope, region/residency/retention evidence, identity and access controls, tenant isolation, production audit persistence, approved provider/environment passport, security/privacy review, clinical review, incident response, recovery test, customer authorization, and explicit release decision.

### Production Release

Blocked in this candidate. Requires a clean exact commit, generated evidence integrity, named review, fresh AAL2 authorization, approved migrations where applicable, intended-use/legal/clinical/security/privacy signoffs, deployment authorization, exact-environment verification, post-deployment smoke evidence, rollback owner, and customer-specific go-live authority.

## Routes

- UI: `/scrimed-p34`
- Summary: `/api/scrimed-control-plane/p34`
- Brief: `/api/scrimed-control-plane/p34/brief`
- Registry: `/api/scrimed-control-plane/p34/registry`
- Operations: `/api/scrimed-control-plane/p34/operations`
- Context: `/api/scrimed-control-plane/p34/context`
- DICOM privacy: `/api/scrimed-control-plane/p34/dicom-privacy`
- Assurance: `/api/scrimed-control-plane/p34/assurance`
- Workflows: `/api/scrimed-control-plane/p34/workflows`
- Model fit: `/api/scrimed-control-plane/p34/model-fit`
- Action maturity: `/api/scrimed-control-plane/p34/actions`
- Continuity: `/api/scrimed-control-plane/p34/continuity`
- Public-sector evidence: `/api/scrimed-control-plane/p34/public-sector`
- Challenger registry: `/api/scrimed-control-plane/p34/challengers`
- Workflow ROI: `/api/scrimed-control-plane/p34/roi`
- Clinical OS: `/api/scrimed-control-plane/p34/clinical-os`
- Autonomy: `/api/scrimed-control-plane/p34/autonomy`
- PHI boundary: `/api/scrimed-control-plane/p34/phi-boundary`
- Sandbox: `/api/scrimed-control-plane/p34/sandbox`
- Retrieval: `/api/scrimed-control-plane/p34/retrieval`
- External validation: `/api/scrimed-control-plane/p34/external-validation`
- Oversight: `/api/scrimed-control-plane/p34/oversight`
- Patient Take-Home: `/api/scrimed-control-plane/p34/patient-take-home`
- Medical coding: `/api/scrimed-control-plane/p34/medical-coding`
- Recovery: `/api/scrimed-control-plane/p34/recovery`
- Claims: `/api/scrimed-control-plane/p34/claims`

## Validation

```bash
npm run test:scrimed-p34
npm run test:scrimed-p34-workflow-continuity
npm run test:scrimed-p34-clinical-os
npm run contract:scrimed-p34
npm run contract:scrimed-p34-clinical-os
npm run check:scrimed-p34-artifacts
npm run typecheck
npm run lint
npm run test:nonsecret
npm run build
npm run security:secret-scan
npm run security:sbom
node scripts/check-generated-integrity.mjs
git diff --check
```

No database migration or external dependency is added by p.34.
