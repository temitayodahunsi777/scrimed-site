# SCRIMED Investor Diligence

The Investor Readiness Command Center provides a concise enterprise diligence snapshot at `/investor-readiness` and `/api/investor-readiness/status`.

PHI status remains not enabled for all investor-facing diligence artifacts.

## Snapshot Contract

```json
{
  "company": "SCRIMED",
  "status": "synthetic-demo-ready",
  "phi_status": "not_enabled",
  "clinical_action_status": "not_enabled",
  "audit_readiness": true,
  "execution_evidence_binding": true,
  "deployment_readiness": "buyer_diligence_ready",
  "no_go_boundaries": []
}
```

## Diligence Themes

- Product readiness by service.
- Clinical robustness coverage.
- Execution-attempt evidence binding.
- AAL2 smoke readiness for strict protected smoke, exposed through `/api/qa-evidence/aal2-smoke-readiness` without token material.
- Deployment release checklist separating no-secret public smoke from human-gated strict protected smoke.
- Release evidence ledger at `/api/release-continuity/evidence-ledger` with deterministic no-secret evidence hashes for build, smoke, readiness, and protected-operator gates.
- Release evidence promotion queue at `/api/release-continuity/evidence-promotion` separating buyer-diligence candidates from protected AAL2 proof blockers and qualified-review blockers.
- Release evidence freshness guard at `/api/release-continuity/evidence-freshness-guard` preventing stale evidence from being reused in buyer, investor, clinical, security, public, or customer-specific language without refresh.
- Release Authorization Chain at `/api/release-continuity/authorization-chain` composing evidence, freshness, manifest, recipient, share, and AAL2 controls into one weakest-link decision before external packet references.
- Diligence Release Gate at `/api/release-continuity/diligence-gate` separating no-secret buyer-diligence GO posture from protected AAL2, public distribution, production release, PHI, and clinical NO-GO posture.
- Diligence Packet Manifest at `/api/release-continuity/diligence-packet-manifest` assembling allowed no-secret packet fields, withheld material, reviewer ownership, and blocked claims for buyer and investor diligence.
- Protected Boundary Release Evidence Intake Packet at `/api/pilot-workspaces/{workspaceSlug}/boundary-release-evidence-intake/packet`, listed by the manifest as human-AAL2-gated withheld evidence that does not approve boundary release.
- Recipient Qualification Matrix at `/api/release-continuity/recipient-qualification-matrix` defining recipient classes, expiry, revocation, no-identifier storage, and external access-lane expectations before packet references leave SCRIMED.
- Diligence Packet Share Guard at `/api/release-continuity/diligence-packet-share-guard` controlling recipient class, human review, public distribution, customer-specific authorization, and withheld payloads before packet sharing.
- Safety and governance gate status.
- Model-provider neutrality.
- Cost and abuse guardrails.
- Enterprise risk register.
- Explicit NO-GO boundaries.

This material supports diligence discussion only. It is not securities material, investment advice, valuation assurance, audited financial reporting, legal advice, tax advice, donor advice, certification, clinical validation, or customer approval.

## AAL2 And Release Checklist Boundary

The Investor Readiness Command Center includes AAL2 smoke readiness as no-secret evidence for enterprise diligence. It shows that strict protected smoke is prepared, but it does not prove authenticated protected writes until an approved human AAL2 operator supplies a fresh short-lived token and the target runtime feature flag is enabled.

Use `/release-continuity` and `/api/release-continuity` as the release checklist for public production smoke, AAL2 smoke readiness, strict durable-store smoke, and stored-vector RPC smoke. This remains readiness evidence only, not PHI authority, production connector approval, certification, or live-care authorization.

Use `/api/release-continuity/evidence-ledger` when diligence needs a machine-readable list of no-secret proof entries, command names, routes, evidence hashes, blocked claims, and human-review flags. The ledger does not store raw logs, bearer tokens, Supabase secrets, PHI, customer data, or production approval.

Use `/api/release-continuity/evidence-promotion` when diligence needs to understand which ledger entries are metadata-safe now, which require retained human AAL2 proof, and which require qualified legal, privacy, security, clinical, reimbursement, regional, certification, connector, or buyer approval review. The promotion queue is not public distribution approval or production release approval.

Use `/api/release-continuity/evidence-freshness-guard` before evidence is reused in buyer, investor, clinical, security, public, or customer-specific contexts. The freshness guard shows which no-secret proof needs a rerun, which protected proof needs a fresh human AAL2 retained packet, and which claims need qualified review. It does not rerun commands, approve public distribution, certify evidence, authorize PHI, authorize live care, or approve customer go-live.

Use `/api/release-continuity/authorization-chain` before any diligence packet or artifact is referenced outside SCRIMED. The chain reports the current weakest link across the release evidence ledger, promotion queue, freshness guard, diligence gate, packet manifest, recipient qualification matrix, share guard, and AAL2 readiness. It is a no-secret control view only; it does not approve release, public distribution, customer-specific sharing, certification, PHI processing, production connector use, customer go-live, or live clinical care.

Use `/api/release-continuity/diligence-gate` when diligence needs a single GO/NO-GO summary. The gate permits only no-secret buyer-diligence metadata with review and blocks strict AAL2 proof claims, public distribution, production release, PHI authority, certification, production connector approval, customer go-live, and clinical authority.

Use `/api/release-continuity/diligence-packet-manifest` when diligence needs a packet manifest instead of ad hoc artifact selection. The manifest identifies which no-secret fields may be included, which materials must be withheld, which reviewer owns each section, and which claims remain blocked. It is not public distribution approval, production approval, certification, clinical validation, PHI authority, security attestation, or customer go-live approval.

The manifest includes the Protected Boundary Release Evidence Intake Packet as a withheld artifact at `/api/pilot-workspaces/{workspaceSlug}/boundary-release-evidence-intake/packet`. It may be referenced only as protected packet route metadata until a fresh human AAL2 run and release-steward review retain safe audit metadata; it does not authorize boundary release.

Use `/api/release-continuity/recipient-qualification-matrix` before any diligence packet is scoped for an external recipient. The matrix permits no-secret metadata preparation only after recipient class, purpose, reviewer owner, expiry, and revocation expectations are clear. It does not store recipient names, emails, lists, access grants, raw access logs, signed approvals, PHI, customer data, token material, certification proof, protected packet bodies, public distribution approval, customer permission, or live clinical authority.

Use `/api/release-continuity/diligence-packet-share-guard` before any diligence packet is referenced outside SCRIMED. The share guard classifies internal, qualified buyer/investor, customer-specific, public/press, clinical, and security-review recipients, then defines allowed payloads, withheld payloads, required reviewers, and blocked claims. It does not send emails, create invites, approve public distribution, approve customer-specific sharing, certify security/compliance, authorize PHI, authorize live care, or approve customer go-live.

The share guard treats `/api/pilot-workspaces/{workspaceSlug}/boundary-release-evidence-intake/packet` as protected withheld evidence. Buyer or investor materials may reference only route/proof-stack metadata until human AAL2 packet evidence and qualified review are retained; boundary-release approval remains blocked.
