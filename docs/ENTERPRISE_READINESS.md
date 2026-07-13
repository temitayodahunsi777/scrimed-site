# SCRIMED Enterprise Readiness

SCRIMED is currently positioned for no-PHI synthetic demos, buyer diligence, platform audit review, and execution-attempt evidence binding.

## Current GO Scope

- Synthetic clinical robustness evaluation.
- Investor and buyer diligence snapshots.
- Product readiness registry review.
- Risk-register review.
- Metadata-only execution-attempt envelopes and durable-store contracts.
- No-secret AAL2 smoke readiness at `/api/qa-evidence/aal2-smoke-readiness`.
- Release-continuity deployment checklist for public smoke, strict protected smoke, and human review boundaries.
- No-secret release evidence ledger for build, smoke, AAL2 preflight, protected-smoke blockers, and external-review gates.
- Human-gated release evidence promotion queue for buyer-diligence metadata, protected AAL2 proof blockers, and qualified-review blockers.
- Release Evidence Freshness Guard for rerun, human-AAL2 refresh, and qualified-review refresh gates before external evidence reuse.
- Release Authorization Chain for a weakest-link no-secret control view across evidence, freshness, manifest, recipient, share, and AAL2 gates before external packet references.
- Diligence Release Gate for no-secret buyer-diligence GO posture and protected/public/production/clinical NO-GO posture.
- Diligence Packet Manifest for assembling buyer and investor packets from allowed no-secret fields while withholding protected proof and qualified-review claims.
- Recipient Qualification Matrix for recipient-class preflight, expiry, revocation, no-identifier storage, and external access-lane expectations before packet references leave SCRIMED.
- Diligence Packet Share Guard for recipient-scoped, human-reviewed packet sharing with public-distribution and customer-specific authority blocked.
- Model-router and cost-guardrail readiness without external provider calls.

## Current NO-GO Scope

- Live PHI or production patient data.
- Autonomous diagnosis, treatment, prescribing, triage, or patient advice.
- Patient outreach, payer submission, final coding, billing action, or EHR writeback.
- Production connector approval.
- HIPAA, SOC 2, HITRUST, FDA, ONC, clinical validation, or security certification claims.

## Primary Evidence Routes

- `/investor-readiness`
- `/api/investor-readiness/status`
- `/clinical-robustness-lab`
- `/api/clinical-robustness-lab`
- `/api/workflows/execution-attempts/envelope`
- `/api/workflows/execution-attempts/durable-store`
- `/api/qa-evidence/aal2-smoke-readiness`
- `/release-continuity`
- `/api/release-continuity`
- `/api/release-continuity/evidence-ledger`
- `/api/release-continuity/evidence-ledger/brief`
- `/api/release-continuity/evidence-promotion`
- `/api/release-continuity/evidence-promotion/brief`
- `/api/release-continuity/evidence-freshness-guard`
- `/api/release-continuity/evidence-freshness-guard/brief`
- `/api/release-continuity/authorization-chain`
- `/api/release-continuity/authorization-chain/brief`
- `/api/release-continuity/diligence-gate`
- `/api/release-continuity/diligence-gate/brief`
- `/api/release-continuity/diligence-packet-manifest`
- `/api/release-continuity/diligence-packet-manifest/brief`
- `/api/pilot-workspaces/{workspaceSlug}/boundary-release-evidence-intake/packet`
- `/api/release-continuity/recipient-qualification-matrix`
- `/api/release-continuity/recipient-qualification-matrix/brief`
- `/api/release-continuity/diligence-packet-share-guard`
- `/api/release-continuity/diligence-packet-share-guard/brief`
- `/api/products/readiness`
- `/api/risk-register`

## Next Milestones

1. Use the Release Authorization Chain before any external packet reference so the weakest-link state is explicit across release evidence, freshness, manifest, recipient, share, and AAL2 controls.
2. Use the Release Evidence Freshness Guard before evidence is reused in buyer, investor, clinical, security, public, or customer-specific contexts.
3. Use the Recipient Qualification Matrix before buyer, investor, public, customer-specific, clinical, or security packet references leave SCRIMED.
4. Use the Diligence Packet Share Guard before buyer, investor, public, customer-specific, clinical, or security packet references leave SCRIMED.
5. Use the Diligence Packet Manifest to assemble buyer and investor packets from allowed no-secret fields, withheld material, reviewer owners, and blocked claims.
6. Use the Diligence Release Gate to present no-secret buyer-diligence GO posture separately from protected AAL2, public distribution, production release, PHI, and clinical NO-GO posture.
7. Use the release evidence promotion queue to separate shareable metadata, protected AAL2 proof blockers, and qualified-review blockers before buyer distribution.
8. Promote AAL2 smoke readiness and strict protected smoke outcomes into protected buyer workspaces with tenant RBAC.
9. Add OAuth scoped-token MCP gateway with revocation and tool-level authorization.
10. Add reviewer-calibrated evaluation datasets and release-blocking regression checks.

## AAL2 Release Checklist

SCRIMED treats AAL2 smoke readiness as a no-secret release checklist layer. `/api/qa-evidence/aal2-smoke-readiness` exposes gates, commands, failure modes, and safety boundaries for strict protected smoke, while `/release-continuity` shows how that readiness packet fits into deployment review.

Strict protected smoke remains blocked until a fresh authorized human AAL2 token, tenant role, protected runtime, and target feature flag are present. This readiness layer does not mint tokens, store secrets, bypass AAL2, process PHI, approve connectors, certify compliance, or authorize live clinical care.

## Release Evidence Ledger

Release evidence ledger status is exposed through `/api/release-continuity/evidence-ledger`.

`/api/release-continuity/evidence-ledger` records no-secret release evidence entries for generated integrity, nonsecret regression, typecheck, lint, build, clinical robustness, durable-store contracts, AAL2 smoke readiness, strict protected-smoke blockers, and external review. Each entry carries a deterministic evidence hash, command, route, blocked claims, human-review flag, replay instruction, and next action.

The ledger is not a production approval artifact. It does not store raw logs, PHI, bearer tokens, Supabase keys, service-role keys, customer data, production connector payloads, certification proof, or live-care authority.

## Release Evidence Promotion Queue

Release evidence promotion queue status is exposed through `/api/release-continuity/evidence-promotion`.

`/api/release-continuity/evidence-promotion` converts ledger entries into three lanes: buyer-diligence candidates, protected AAL2 operator proof required, and qualified external review required. It identifies shareable fields, withheld material, target packet routes, required reviewers, blockers, and next actions.

The promotion queue is not public distribution approval, release approval, clinical authority, PHI authority, certification evidence, production connector approval, or customer go-live approval.

## Release Evidence Freshness Guard

Release evidence freshness guard status is exposed through `/api/release-continuity/evidence-freshness-guard`.

`/api/release-continuity/evidence-freshness-guard` classifies release evidence into internal-readiness, refresh-required, human-AAL2-refresh-required, and qualified-review-refresh-required lanes. It is intended to prevent stale no-secret proof from becoming overconfident buyer, investor, public, clinical, security, or customer-specific language.

The freshness guard does not rerun checks, certify evidence, approve public distribution, authorize customer-specific sharing, approve production release, authorize PHI, authorize live care, approve connectors, or create customer go-live authority.

## Release Authorization Chain

Release Authorization Chain status is exposed through `/api/release-continuity/authorization-chain`.

`/api/release-continuity/authorization-chain` composes release evidence, promotion, freshness, diligence gate, packet manifest, recipient qualification, share guard, and AAL2 readiness into one no-secret weakest-link control view. It reports the chain decision, weakest link, authorization hash, control counts, required controls, and blocked claims before packet references leave SCRIMED.

The chain is not release approval, public distribution approval, customer-specific sharing approval, PHI authority, certification evidence, production connector approval, customer go-live approval, or live clinical authority.

## Diligence Release Gate

Diligence Release Gate status is exposed through `/api/release-continuity/diligence-gate`.

`/api/release-continuity/diligence-gate` summarizes no-secret buyer-diligence GO status while preserving NO-GO status for retained strict AAL2 proof, public distribution, production release, PHI processing, certification, production connectors, customer go-live, and live clinical care.

The gate is not production approval, public distribution approval, clinical authority, PHI authority, certification, legal approval, production connector approval, or customer go-live approval.

## Diligence Packet Manifest

Diligence Packet Manifest status is exposed through `/api/release-continuity/diligence-packet-manifest`.

`/api/release-continuity/diligence-packet-manifest` packages the approved diligence assembly contract: artifact IDs, routes, status, evidence-safe fields, withheld material, reviewer owner, shareability lane, GO/NO-GO state, blocked claims, and next action. It is intended for no-secret buyer and investor diligence packet preparation.

The manifest lists the Protected Boundary Release Evidence Intake Packet at `/api/pilot-workspaces/{workspaceSlug}/boundary-release-evidence-intake/packet` as human-AAL2-gated withheld evidence. It can support protected audit review after approved operator execution, but it does not approve boundary release, PHI processing, live care, public distribution, production connectors, certification claims, or customer go-live.

The manifest is not public distribution approval, production approval, clinical authority, PHI authority, certification, legal approval, security attestation, production connector approval, reimbursement approval, or customer go-live approval.

## Recipient Qualification Matrix

Recipient Qualification Matrix status is exposed through `/api/release-continuity/recipient-qualification-matrix`.

`/api/release-continuity/recipient-qualification-matrix` defines recipient classes, default share decisions, required evidence, allowed metadata-only payloads, blocked payloads, reviewer owners, expiry policies, revocation policies, audit expectations, and safe next actions.

The matrix is designed to keep recipient identifiers and access administration outside SCRIMED. It does not store recipient names, emails, lists, access grants, raw access logs, IP addresses, device identifiers, signed approvals, legal opinions, certification evidence, protected packet bodies, bearer tokens, PHI, customer data, production connector payloads, public distribution approval, customer-specific permission, or live clinical authority.

## Diligence Packet Share Guard

Diligence Packet Share Guard status is exposed through `/api/release-continuity/diligence-packet-share-guard`.

`/api/release-continuity/diligence-packet-share-guard` defines recipient classes, share decisions, allowed payloads, withheld material, required reviewers, public-distribution authority, customer-specific authority, and blocked claims. It is intended to prevent ad hoc external sharing and overclaiming.

The share guard has a dedicated card for `/api/pilot-workspaces/{workspaceSlug}/boundary-release-evidence-intake/packet`. It keeps the protected packet body and any boundary-release language withheld until human AAL2 execution, retained audit metadata, release-steward review, and qualified external review are complete.

The share guard does not send packets, approve public distribution, authorize customer-specific sharing, approve production release, certify security/compliance, authorize PHI, authorize live clinical care, approve connectors, or create customer go-live authority.

This document is readiness evidence only. It is not legal advice, audited financial reporting, certification, clinical validation, production approval, PHI authority, or customer go-live approval.
