# SCRIMED p.34 Implementation Map

Status: implementation in progress on `agent/scrimed-p34-adaptive-governance`.

Baseline: local p.33 candidate `9751d74d5adb008b22d7b3133df306dd106f39da`. The branch was clean before p.34 work began. This record is a traceability aid, not approval, deployment evidence, clinical validation, or production authority.

| Requirement | Existing system extended | p.34 change | Primary files | Verification | Compatibility / gate |
| --- | --- | --- | --- | --- | --- |
| Provider-neutral capability registry | p.33 portable-agent routes and provider dependency footprints | Declarative capability, harness, and execution-environment admission with expiry and deny-unknown behavior | `app/lib/scrimed-p34/types.ts`, `adaptiveGovernance.ts` | p.34 policy tests | No provider call; unverified and expired entries denied |
| Deterministic-first router | p.33 quality ratchet and ModelFit routing | Ordered rules, transformation, graph, optimization, retrieval, generation, and human escalation policy | `adaptiveGovernance.ts` | deterministic-selection and unsafe-fallback tests | No silent generative fallback |
| Healthcare context and provenance | p.33 Context Fabric v2 | Heading-aware, tokenizer-budgeted chunks, table-header retention, bounding-box citations, conflict retention, and FHIR Provenance preview | `contextProvenance.ts` | provenance, conflict, and missing-citation tests | Synthetic and approved de-identified inputs only |
| DICOM privacy pipeline | Imaging Workflow Intelligence and DICOM contracts | Versioned metadata de-identification profile, private-tag scan, burned-in annotation quarantine, hash-only manifests, and export approval gate | `dicomPrivacy.ts` | private-tag, burned-in, malformed, and transfer-syntax tests | No re-identification, pixel interpretation, export, or live PACS action |
| Controlled tools and approvals | p.33 exact-action policy | Discovery/read/propose/approve/execute stage separation and browser-agent sandbox boundary | `adaptiveGovernance.ts` | stale, replayed, cross-tenant, payload-mismatch, and browser-action tests | State change remains disabled in this candidate |
| Contemporaneous governance | p.33 Decision Evidence Ledger | Rich action details bound into the existing append-only evidence hash plus FHIR AuditEvent/Provenance mappings | `adaptiveGovernance.ts` | chain and tamper tests | No raw PHI, secrets, prompts, or hidden reasoning |
| Two-loop evaluation | p.33 Trace-to-Eval and quality ratchet | Inner fixed-suite and outer shadow-metric decision with hard floors and explicit rollback | `adaptiveGovernance.ts` | quality-regression and safety-floor tests | Challenger cannot auto-promote |
| FinOps and resilience | p.33 provider failover and resilience drill | Per-task token/cost/latency accounting, tenant-safe cache identity, budget and amplification breakers, and safe outage handling | `adaptiveGovernance.ts` | budget, quota, network, fallback, and cache-isolation tests | No compute purchase or external capacity action |
| Hybrid and edge placement | p.33 hybrid workload placement | Placement admission across local, edge, private cloud, and approved managed cloud | `adaptiveGovernance.ts` | network-loss and unauthorized-region tests | PHI route remains blocked in this candidate |
| Operator accountability UI | p.33 operator console and control-plane catch-all | p.34 Agent Operations surface, brief, registry, operations, context, DICOM, and assurance endpoints | `app/scrimed-p34/page.tsx`, control-plane route | contract, build, desktop/mobile checks | Synthetic read-only visibility |
| Governance hierarchy and claims | Existing policy, security, release, and public-claims registers | Framework/policy/standard/runbook hierarchy, ownership, incident/rollback, provider change, DICOM procedure, evidence retention, pilot checklists, and evidence-required claim controls | `docs/`, `docs/PUBLIC_CLAIMS_REGISTER.md` | contract and public-claims checks | External approvals remain `OPERATOR_REQUIRED` or `BLOCKED` |
| Candidate evidence | Existing candidate manifest, review packet, gate packet, secret scan, and SBOM | Deterministic p.34 gate and validation artifacts plus exact final candidate evidence | `scripts/scrimed-p34-*`, `artifacts/p34/` | full quality runner and strict release tooling | Local commit only; no push, deploy, migration, or distribution |
| Workflow contract | p.33 intended-use, action-policy, and pilot evidence controls | Versioned owner, baseline, KPI, data, authority, approval, rollback, risk, and release-evidence contract | `types.ts`, `workflowContinuity.ts` | missing/stale/incomplete evidence tests | Valid contract permits policy evaluation only; execution authority remains false |
| Model fit | p.34 capability admission and deterministic router | Documentary residency, BAA/product path, license, interoperability, local evaluation, reliability, context, and soft-constraint evidence | `types.ts`, `adaptiveGovernance.ts`, `workflowContinuity.ts` | PHI, public-rank, outage, context, and justification tests | No public-rank promotion or silent fallback |
| Action maturity | p.33 exact-action approval and p.34 governance ledger | Append-only state transitions with idempotency, exact approval, result hash, rollback, and no system-of-record write | `workflowContinuity.ts` | replay, duplicate, unauthorized-write, tamper, and rollback tests | External writes remain blocked |
| Trust expansion | p.33 pilot profiles and quality ratchet | Fresh cohort, duration, outcome, safety, burden, latency, cost, and named-approval gate | `workflowContinuity.ts` | stale evidence and missed threshold tests | Expansion remains operator-required and unauthorized |
| Continuity metrics | Patient Context Gateway and care-coordination concepts | Hashed relationship periods, transfers, interruptions, reconnects, segmented KPIs, and follow-up queues | `workflowContinuity.ts` | transfer, unresolved interruption, and cross-tenant tests | Product/research metric only; no causal or therapeutic claims |
| Public-sector evidence | Federal contract readiness and deployment profiles | Documentary security, residency, audit, accessibility, procurement, and contract-vehicle coverage | `workflowContinuity.ts` | missing-documentation negative tests | No compliance, authorization, or purchasing-eligibility claim |
| Isolated challengers | p.33 challenger ratchet and provider-neutral harness | Disabled non-PHI research profiles, reproducible local run contract, license/infrastructure evidence, no promotion | `workflowContinuity.ts` | unverified and locally reproduced review tests | No PHI, production registration, provider call, or auto-promotion |
| Workflow ROI | p.34 FinOps and Agent Operations | Asking/doing, verified outcomes, rollback, review time, continuity, workflow cost, route distribution, and freshness | `workflowContinuity.ts`, `page.tsx` | redaction and deterministic dashboard tests | No raw prompts, PHI, secrets, or sensitive content |

## Implementation Order

1. Typed contracts and deny-by-default policy decisions.
2. Context provenance and DICOM privacy adapters.
3. Governance ledger, evaluation, FinOps, placement, and operations summary.
4. API, UI, navigation, tests, deterministic artifacts, and documentation.
5. Full local validation, browser verification, exact evidence regeneration, and one focused local commit.

## Preserved Boundary

SCRIMED p.34 is a synthetic/no-PHI, human-supervised local candidate. It does not authorize diagnosis, treatment, prescribing, triage, patient messaging, payer submission, EHR or device mutation, live provider calls, production migration, deployment, customer activation, certification claims, or external distribution.
