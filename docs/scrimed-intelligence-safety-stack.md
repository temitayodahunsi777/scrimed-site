# SCRIMED Intelligence & Safety Stack

SCRIMED Intelligence & Safety Stack is a synthetic and metadata-only governance layer for agent security, observability, clinical safety, healthcare data infrastructure, outcome tracking, state-aware orchestration, and compliance review.

It does not process live PHI, execute autonomous clinical care, diagnose, treat, prescribe, submit payer transactions, write to EHRs, rotate real credentials, change cloud IAM, execute payments, deploy production, send external communications, claim certification, or approve customer go-live.

## Project SENTINEL

Project SENTINEL is the zero-trust agent execution layer.

Every agent action follows:

1. identity
2. policy engine
3. permission check
4. scoped tool access
5. execution
6. audit log

Permissions are deny-by-default. Irreversible actions require human approval, including database deletion, schema changes, PHI export, credential rotation, cloud IAM changes, production deploys, payment execution, encryption-key generation, and external communications.

Kill switches stop runaway agents, abnormal tool calls, privilege-escalation attempts, retry storms, and suspicious access patterns.

The Sentinel evaluator is exposed at `/api/scrimed-intelligence-safety-stack/evaluate`. It accepts metadata-only JSON with known agent ids, action enums, tool scopes, and data classifications. It rejects token-like or secret-like fields, performs no tool execution, performs no external calls, and returns allow, human-approval-required, or blocked decisions.

Project SENTINEL review packets are exposed at `/api/scrimed-intelligence-safety-stack/review-packets`. They bind blocked or human-review-required audit events to trace ids, reviewer roles, missing evidence, allowed dispositions, blocked dispositions, regression-candidate status, and deterministic packet hashes. Review packets are read-only. They cannot execute production actions, bypass human approval, persist protected evidence without AAL2, send external communications, or store secrets or PHI.

## Sentinel Regression Manifest

The Sentinel regression manifest is exposed at `/api/scrimed-intelligence-safety-stack/regression-manifest`. It turns regression-candidate review packets into synthetic metadata-only candidate test cases with expected policy decisions, required assertions, reviewer gates, and deterministic manifest hashes. The manifest is read-only and nonsecret. It performs no tool execution, no external calls, no protected persistence without AAL2, no PHI fixture creation, no secret fixture creation, and no autonomous clinical or payer action.

## Sentinel Regression Promotion Gate

The Sentinel regression promotion gate is exposed at `/api/scrimed-intelligence-safety-stack/regression-promotion-gate`. It decides whether a manifest case can move into nonsecret pytest regression metadata after human review.

The only allowed promotion target is nonsecret pytest regression metadata. The gate has no execution authority and cannot promote anything into production execution, clinical authority, payer submission, EHR writeback, external communication, protected evidence persistence without AAL2, or secret or PHI fixtures.

Current cases remain blocked until a human reviewer records a pass disposition and reviewer notes. Protected persistence still requires fresh AAL2, tenant role, RLS, and boundary-release approval evidence.

## Sentinel Regression Disposition Preview

The Sentinel regression disposition preview is exposed at `/api/scrimed-intelligence-safety-stack/regression-disposition-preview`. It accepts metadata-only reviewer dispositions for known regression cases and returns what would happen if the reviewer selected pass, fail, or needs-more-evidence.

The preview route is not a write path. It performs no persistence, no tool execution, no external calls, and no protected evidence promotion. It rejects token-like fields, secret-like fields, PHI-like notes, unknown case ids, reviewer role mismatches, unsupported dispositions, and oversized evidence references.

Only a pass disposition can preview eligibility for nonsecret pytest regression metadata. Fail and needs-more-evidence remain blocked pending human review. None of these previews authorize production execution, clinical authority, payer submission, EHR writeback, external communication, or secret or PHI fixtures.

## AI Flight Recorder

The AI Flight Recorder captures metadata for every agent step:

- trace id
- agent id
- input and output metadata
- tool call
- latency
- failure
- retry count
- policy decision
- final outcome
- audit hash

The durable tracing scaffold uses local write-ahead log metadata with no secrets and no PHI. Failed traces can be queued for human review and promoted into regression datasets.

## Clinical Safety

Clinical outputs must separate capability from correctness. Each clinical safety envelope includes confidence, evidence quality, uncertainty, source quality, groundedness, clinical red flags, model-card metadata, and clinician-in-the-loop routing for high-risk outputs.

Capability demonstrations do not prove correctness, clinical validation, certification, or live-care readiness.

## Healthcare Data Infrastructure

The adapter layer covers FHIR, HL7 v2, CDA/C-CDA, DICOM metadata, CSV, JSONL, scanned document OCR, and free-text clinical notes.

Adapters normalize into canonical semantic metadata, block raw payload logging, require provenance, and preserve source evidence.

The local-first de-identification scaffold includes PHI detection, coordinate-level redaction for scanned documents, multilingual identifiers, and browser/Mac/iPhone/edge-device execution hooks.

DocLang-style representation preserves structure, layout, semantics, tables, images, geometry, labels, values, units, and citations.

## Outcomes

Outcome tracking prioritizes patient, workflow, clinical, financial, and operational outcomes over vanity metrics.

Tracked outcomes include documentation time saved, denial reduction, readmission reduction, referral completion, follow-up completion, medication availability, and patient comprehension.

Approved pilots should run an outcomes review after the first 100-200 patients. This repository only defines the metadata scaffold and does not authorize live patient processing.

## State-Aware Orchestration

Agents expose current plan, tool history, state, remaining steps, budget, risk level, shared guardrails, and human-in-the-loop approvals.

Model routing remains provider-neutral and can route future work across frontier, open-weight, local, small efficient, quantized, and reasoning models by cost, latency, privacy, and task risk.

## Compliance & Governance

Policy scaffolds cover HIPAA, GDPR, EU AI Act, FDA SaMD readiness, auditability, model-risk management, data retention, consent, privacy, and clinical safety.

Emotional and anthropomorphic AI safeguards block simulated dependency, false relationship claims, and sensitive-history training without explicit opt-in. Clear AI disclosure, crisis escalation hooks, and minor safety protections require review where applicable.

## Validation

Run:

```bash
npm run smoke:scrimed-intelligence-safety-stack
npm run test:nonsecret
npm run typecheck
npm run lint
npm run build
```

## Next Implementation Step

Persist Sentinel audit events to the protected durable store only after fresh AAL2, tenant-role, RLS, and boundary-release approval evidence is available.
