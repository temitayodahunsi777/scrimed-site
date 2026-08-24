# p.34 Review Packet 4.0

Target review time: 15 minutes. Review the exact remote head and generated evidence, not this description alone.

## 1. Architecture Delta

p.34 is the canonical successor to the inherited p.33 line. This wave adds exact-head review binding, Atomic Approval 2.0, authenticated evidence expiry, Adaptive Governance 2.0, Oversight Sentinel 3.0, immediate runtime policy recomputation, and immutable causal trace links. It extends the existing control plane; it does not introduce a competing router, policy engine, or audit framework.

## 2. Autonomy Model

- A0 observes and cannot mutate.
- A1 recommends and cannot mutate.
- A2 prepares bounded, reversible synthetic work and requires named review.
- A3 remains unavailable in this candidate.

Automated checks never grant execution authority.

## 3. Trusted Clock

Authorization uses a server-owned UTC clock. Canonical ISO format, impossible dates, future skew, expiry, maximum age, and maximum replay-window duration fail closed.

## 4. Atomic Approvals

Approval binds candidate, action, resource, tenant, environment, requester class, autonomy, maturity, approver identity, policy decision, side effect, nonce, issuance, and expiry. The in-memory store proves deterministic one-use behavior only; durable cross-process replay protection remains unavailable and cannot authorize execution.

## 5. Evidence Expiry

Candidate, validation, gate, security, review, migration, model-qualification, AAL2, public-claim, investor, preview, and specialist evidence are candidate-bound, signed, issuer-bound, version-bound, and time-bound. High-trust classes require authenticated external proof. Missing, stale, duplicated, mismatched, malformed, synthetic-only, or overlong evidence fails closed.

## 6. Egress Firewall

Model requests, agent tools, HTTP egress, logs, telemetry, connectors, proof packets, investor artifacts, public APIs, and API responses share classification and secret/PHI inspection. Blocked raw payloads are not returned or persisted.

## 7. Tenant Boundaries

Policy, retrieval, approvals, workflow records, evidence, and telemetry retain tenant scope. Cross-tenant access is denied and tenant identifiers are hashed in external-safe evidence where raw tenancy is unnecessary.

## 8. Kill Switch

`READ_ONLY` is the safe default. `HALTED` denies all governed actions; `READ_ONLY` permits diagnostics/evidence only; `RESTRICTED` permits explicitly bounded synthetic-safe activity; `NORMAL` still does not lift p.34 safety ceilings.

## 9. Oversight Sentinel

Sentinel 3.0 exercises autonomy and privilege escalation, maturity drift, expired evidence, retry/delegation/budget anomalies, model substitution, policy and route drift, unexpected targets, tenant leakage, approval replay, egress triggers, anomalous tool escalation, and unauthorized distribution. It can recommend containment but cannot punish users or grant authority.

## 10. Model Routing

The existing provider-neutral registry uses local task evidence, risk, modality, residency, PHI eligibility, interoperability, reliability, latency, and cost. Public benchmark rank cannot self-promote a model. External providers remain disabled.

## 11. PHI Boundary

The candidate is synthetic/no-PHI. PHI-classified requests, raw PHI telemetry, unauthorized provider routing, clinical actions, payer actions, and EHR/device writes fail closed.

## 12. Migration Status

Three migrations remain unapplied. Static review does not imply disposable dry-run approval, and a dry run would not imply production migration authorization.

## 13. Public Claims

Public, demo, proof, and investor claims remain evidence-bound. No production, clinical-validation, certification, customer, public-sector eligibility, or compliance claim is authorized by this packet.

## 14. Investor Artifact

The investor artifact must retain its existing fingerprint if unchanged. Any material claim change makes that review stale. External distribution remains unauthorized.

## 15. Known External Gates

Independent technical review, fresh AAL2 evidence, intended-use review, targeted clinical/legal/privacy/database/release decisions, disposable migration dry-run authorization, Supabase leaked-password-protection activation, Vercel preview authorization/evidence, merge authorization, and production authorization remain external.

## 16. Exact Fingerprints

Verify all of these from the final committed candidate artifacts:

- PR number
- commit SHA and tree SHA
- candidate and source fingerprints
- validation fingerprint
- this review-packet fingerprint
- SBOM fingerprint
- gate-packet fingerprint

Any mismatch, undeclared binding field, identity mismatch, or source mutation invalidates review. The approval receipt must come from an independent named reviewer and a trusted external identity path that returns the authenticated signer identity and role. The signer must differ from the canonical candidate author. It advances only to merge-authorization review; it does not authorize merge, preview, migration, deployment, PHI, clinical use, payer/EHR/device action, investor distribution, or customer activation.

## Reviewer Sequence

1. Verify exact fingerprints and remote head.
2. Review the focused diff from the parent candidate.
3. Run or inspect the strict validation and security evidence.
4. Confirm all boundaries above and the absence of self-approval.
5. Record an exact-candidate decision through the approved reviewer path.

Current ceiling: `EXACT_REVIEW_REQUIRED`.
