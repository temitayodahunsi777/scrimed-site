# SCRIMED Healthcare Intelligence OS

Updated: 2026-06-27

## Status

SCRIMED Healthcare Intelligence OS now includes a clinical workflow automation layer exposed at:

- UI: `/healthcare-intelligence-os`
- API: `/api/healthcare-intelligence-os`
- Brief: `/api/healthcare-intelligence-os/brief`
- Clinical Data Fabric API: `/api/clinical-data-fabric`
- Clinical Data Fabric Brief: `/api/clinical-data-fabric/brief`
- Clinical Data Governance API: `/api/clinical-data-governance`
- Clinical Data Governance Brief: `/api/clinical-data-governance/brief`
- Clinical Context Gateway API: `/api/clinical-context-gateway`
- Clinical Context Gateway Brief: `/api/clinical-context-gateway/brief`
- Product console: `/product`

The layer connects medical capability planning, clinical awareness, patient safety, workflow automation, patient-engagement analysis, interoperability standards, operations optimization, and clinician administrative burden reduction into one governed OS surface.

## Clinical Data Fabric

SCRIMED now exposes a no-live-PHI Clinical Data Fabric control plane for FHIR, HL7, DICOM, X12, documents, pharmacy, device, wearable, pathology, genomics, scheduling, portal, claims, and patient-access source contracts. Agents must reason through governed semantic concepts, provenance, confidence, and health-graph projection rules instead of raw schemas, direct connector payloads, credentials, or unrestricted source queries.

See `docs/clinical-data-fabric.md` for the source contracts, semantic layer, health graph contracts, governance controls, and blocked claims.

## Clinical Data Governance

SCRIMED now exposes a metadata-only Clinical Data Governance policy engine for purpose-of-use, role, data class, action, destination, consent, human review, contract readiness, tenant scope, minimum necessary access, residency, and model/connector authority checks.

See `docs/clinical-data-governance.md` for the decision model, policy inputs, hard stops, and relationship to Clinical Data Fabric.

## Clinical Context Gateway

SCRIMED now exposes a Clinical Context Gateway that converts allowed metadata-only source-contract requests into semantic context envelopes for agents. This sits after Clinical Data Fabric and Clinical Data Governance so agents receive allowed concepts, provenance requirements, confidence inputs, evidence expectations, blocked raw-access categories, downstream instructions, and audit hashes instead of raw schemas, raw connector payloads, credentials, or patient records.

See `docs/clinical-context-gateway.md` for the context-envelope contract, baseline decisions, hard stops, and production roadmap.

## Clinical Workflow Automation Tracks

SCRIMED now tracks eight workflow automation lanes:

- Pre-visit chart prep and gap review
- Documentation draft and clerical reduction
- After-visit follow-up readiness
- Referral, prior authorization, and documentation workbench
- Medication reconciliation safety review
- Care-gap and population engagement analysis
- Discharge transition workflow optimization
- Clinician inbox and administrative triage

Each track retains:

- Buyer
- Clinical awareness
- Automation scope
- Patient-safety controls
- Patient-engagement analysis signals
- Interoperability bindings
- Clinician burden-reduction motions
- Operations optimization levers
- Proof routes
- Blocked actions
- Requirements before live use
- Retained boundary

## Current Safe Capability

Current work is limited to synthetic, metadata-only, draft, queueing, readiness, evidence organization, and human-reviewed support. Safe current motions include no-PHI chart-prep examples, draft note scaffolding, missing-evidence queues, referral/prior-auth evidence preparation, administrative inbox routing, patient-engagement friction analysis, and operations bottleneck measurement.

## Required Before Live Clinical Use

Before live clinical execution, SCRIMED still requires customer clinical scope, BAA/DPA where applicable, privacy/security/legal review, PHI authority, connector approval, licensed clinical governance, monitoring, rollback, incident response, and explicit customer go-live approval.

## Retained Boundary

This release does not authorize PHI processing, live chart pulls, patient matching, patient outreach, diagnosis, treatment, prescribing, emergency triage, EHR filing, EHR writeback, order entry, payer submission, clinical-risk prediction, reimbursement guarantees, security certification, regulatory approval, or autonomous clinical execution.

## Operating Routine

- Use `/healthcare-intelligence-os` before public clinical automation, clinician burden reduction, or patient-engagement claims expand.
- Route live-record, patient-specific, connector, medication, patient outreach, or clinical decision requests into Clinical Care Activation, Clinical Authority Readiness, Health Records Safety Exchange, and QA Claim Guard.
- Keep every clinical workflow track linked to proof routes, blocked actions, and retained boundaries before use in buyer demos, pilots, sales material, or investor diligence.
- Promote only synthetic, source-attributed, human-reviewed proof until qualified clinical, legal, privacy, security, and customer approvals exist.
