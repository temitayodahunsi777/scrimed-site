---
title: SCRIMED p.33 Investor Review Deck
status: internal preparation draft
data_boundary: no-PHI
external_distribution: prohibited pending exact-artifact founder, counsel, and finance review
---

# 1. SCRIMED

## Healthcare intelligence that walks with doctors

Trustworthy, human-supervised workflows for context, evidence, operations, and measurable outcomes.

Internal preparation draft. No-PHI. External release requires founder, counsel, and finance approval against the exact artifact fingerprint.

Sources: SCRIMED repository `/scrimed-p33`; `/scrimed-control-plane`.

---

# 2. The operating problem

Healthcare teams must reconcile fragmented context, administrative work, changing evidence, workflow ownership, and system boundaries before acting.

SCRIMED is designed to make that work source-grounded, reviewable, measurable, and portable without replacing qualified judgment.

Sources: SCRIMED repository `/healthcare-intelligence-os`; `/clinical-context-gateway`.

---

# 3. The platform

SCRIMED unifies:

- Clinical Context Fabric
- Governed Agent Runtime
- Trust and Oversight Controls
- Evidence and Evaluation Infrastructure
- Interoperability and Workflow Operations
- Product, Pilot, and Value Measurement

Sources: SCRIMED repository `/production-architecture`; `/scrimed-control-plane`.

---

# 4. Context is the clinical moat

Build context once. Preserve source spans, timeline, uncertainty, terminology, contradictions, and consent. Serve only authorized, purpose-bound views to downstream agents.

The source record remains authoritative. Compression declares what it omitted.

Sources: SCRIMED repository `app/lib/scrimed-p33/contextFabric.ts`; `/api/scrimed-control-plane/p33/context`.

---

# 5. Governance is product infrastructure

Every consequential decision binds:

- Actor and accountable human authority
- Intended use and policy version
- Model, provider, harness, prompts, tools, and build
- Evidence and source fingerprints
- Review state, outcome, reversibility, and replay recipe

Human review is mandatory for consequential clinical, financial, privacy, and release actions.

Sources: SCRIMED repository `app/lib/scrimed-p33/decisionEvidenceLedger.ts`; `/api/scrimed-control-plane/p33/evidence`.

---

# 6. Oversight cannot silently disappear

Regulatory Label Twins bind intended use and exclusions. Fixed sentinel cohorts, risk-based review floors, independent error budgets, and drift detection stop quiet expansion of authority.

Higher model accuracy alone cannot reduce human oversight.

Sources: SCRIMED repository `app/lib/scrimed-p33/regulatoryOversight.ts`.

---

# 7. Model-independent execution

SCRIMED routes the smallest qualified model and harness only after capability, risk, locality, evidence, availability, and budget gates pass.

No eligible route produces explicit abstention. No silent fallback. No provider call in the current local candidate.

Sources: SCRIMED repository `app/lib/scrimed-p33/agentPortability.ts`; `app/lib/scrimed-work/modelQualification.ts`.

---

# 8. Evaluation follows real workflows

Synthetic ClinicalTrajectory cases test required steps, grounding, critical omissions, contraindicated suggestions, tool validity, latency, cost, and human disposition after a hard evidence cutoff.

Evaluation supports release review; it does not make clinical decisions.

Sources: SCRIMED repository `app/lib/scrimed-p33/clinicalTrajectoryLab.ts`; `/clinical-robustness-lab`.

---

# 9. Commercial wedges with retained boundaries

- Rural transformation readiness
- Clinical signal compression
- Prior authorization and ePA readiness
- QPA and PACE scenario support
- Vendor continuity and hybrid placement
- Clinician re-engagement data quality
- Evidence-backed AI discoverability

No submission, outreach, legal determination, actuarial determination, clinical action, or external mutation is enabled.

Sources: SCRIMED repository `app/lib/scrimed-p33/opportunityModules.ts`; `/api/scrimed-control-plane/p33/opportunities`.

---

# 10. Demonstration paths

Three bounded investor modes demonstrate the same system at different depths:

- 3 minutes: mission, clinical context, safety gate, proof
- 12 minutes: control plane, opportunity workflow, evidence ledger, pilot boundary
- 30 minutes: architecture, tests, failure paths, economics, release gates

All demonstrations use synthetic data and retain human approval.

Sources: SCRIMED repository `/investor-demo-command-room`; `scripts/rehearse-investor-demo.mjs`.

---

# 11. Value is measured, not asserted

The operating KPI framework tracks cost per verified outcome, evidence coverage, correction burden, review time, latency, safe abstention, workflow completion, and value returned.

Customer outcomes and commercial performance remain evidence pending formal validation.

Sources: SCRIMED repository `app/lib/scrimed-control-plane/outcomeIntelligence.ts`; `/pilot-value-evidence`.

---

# 12. Why investors care

SCRIMED is building owned infrastructure above interchangeable models:

- Reusable clinical context and taxonomy
- Governed orchestration and portable execution
- Tamper-evident evidence and reproducible evaluation
- Workflow-native healthcare opportunities
- Explicit pilot and release boundaries

Current status: local synthetic candidate ready for independent review after validation. No relationship, endorsement, partnership, customer activation, production deployment, certification, or clinical authority is implied.

Sources: SCRIMED repository `artifacts/p33/P33_GATE_MATRIX.json`; `docs/SCRIMED_P33_INTEGRATED_UPGRADES.md`; https://openai.com/enterprise-privacy/ (diligence reference only; no relationship claim).

External release requires exact-artifact founder, counsel, and finance approval. This material is not investment advice or an offer to sell securities.
