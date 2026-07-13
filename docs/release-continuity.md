# SCRIMED Release Continuity

SCRIMED Release Continuity is the operator lane for keeping production deployment proof, source-control checkpoints, public smoke, protected fail-closed checks, and human AAL2 happy-path boundaries aligned.

## Surfaces

- `/release-continuity`
- `/api/release-continuity`
- `/api/release-continuity/brief`
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
- `/api/release-continuity/recipient-qualification-matrix`
- `/api/release-continuity/recipient-qualification-matrix/brief`
- `/api/release-continuity/diligence-packet-share-guard`
- `/api/release-continuity/diligence-packet-share-guard/brief`
- `/qa-aal2-run-evidence`
- `/api/qa-evidence/aal2-smoke-readiness`
- `/api/qa-evidence/aal2-smoke-readiness/brief`
- `/product`
- `/pilot-workspace/access`
- `/buyer-release-control-run`

## Current Posture

- Production domain: `https://app.scrimedsolutions.com`
- Baseline deployment: `dpl_EjfSCM5YKpWhHKDAa6FGmNDPnJ7K`
- Baseline commit: `6219f3616e71d163edd047e4d55074cc5089e2b8`
- Baseline tag: `scrimed-code-pt2-approvals-readiness-20260623`
- Release continuity status: `release-continuity-checkpointed-aal2-boundary`
- Brief status: `release-continuity-brief-operator-ready`

## What It Resolves

- Source-control drift is resolved by tying production evidence to commit, tag, and release brief.
- Public production smoke is separated from protected happy-path evidence.
- AAL2 smoke readiness is visible as a no-secret release checklist packet before strict protected smoke.
- Release evidence ledger records build, smoke, AAL2 readiness, strict protected-smoke blockers, and external-review metadata with deterministic no-secret evidence hashes.
- Release evidence promotion queue separates metadata-safe buyer diligence candidates from protected AAL2 proof blockers and qualified-review blockers.
- Release evidence freshness guard labels internal-only, refresh-required, human-AAL2-required, and qualified-review-required evidence before external reuse.
- Release Authorization Chain composes release evidence, freshness, diligence gate, packet manifest, recipient qualification, share guard, and AAL2 readiness into one weakest-link decision before external packet references.
- Diligence Release Gate separates GO no-secret buyer diligence from NO-GO protected AAL2 proof, public distribution, production release, PHI, and clinical authority.
- Diligence Packet Manifest assembles buyer and investor packets from allowed no-secret fields while labeling withheld AAL2 proof, qualified-review blockers, reviewer owners, and blocked claims.
- Recipient Qualification Matrix defines recipient classes, expiry, revocation, no-identifier storage, external access-lane expectations, and blocked claims before packet references leave SCRIMED.
- Diligence Packet Share Guard applies recipient class, human review, public-distribution, and customer-specific authorization controls before a packet is referenced outside SCRIMED.
- Protected TrustOps, Agent Workspace, and Buyer Release Control checks remain fail-closed without AAL2.
- Operator-token handling stays no-secret and deliberate.
- Approval, PHI, clinical-care, certification, reimbursement, and buyer-release claims remain externally gated.

## Safe Workaround For AAL2

The preferred path is the protected browser workspace at `/pilot-workspace/access`, where an approved tenant-admin or pilot-lead uses the active AAL2 browser session without copying bearer tokens into scripts, chats, logs, docs, or CI.

When command-line evidence is deliberately required, use a fresh short-lived AAL2 bearer token only through an environment variable for one run, record only the safe evidence fields, and dispose of the token outside SCRIMED immediately after the run.

## Deployment Release Checklist

Before a buyer-facing release, use this checklist:

- `npm run test:nonsecret`, `npm run typecheck`, `npm run lint`, and `npm run build` for local no-secret static and contract coverage.
- `npm run smoke:public` for deployed public-route, API, brief, header, and fail-closed evidence.
- `npm run smoke:aal2:readiness` for the no-secret AAL2 smoke readiness preflight.
- `npm run smoke:aal2:durable-store:strict` only when an approved tenant-admin, pilot-lead, or reviewer has a fresh short-lived AAL2 token and protected writes are enabled on the target.
- `npm run smoke:scrimed-stored-vector-rpc:strict` only under the same human AAL2 boundary.

The checklist is evidence orchestration, not release approval. It does not store tokens, print bearer material, use PHI, approve production connectors, or authorize live clinical care.

## Release Evidence Ledger

Use `/api/release-continuity/evidence-ledger` for machine-readable no-secret release evidence. Use `/api/release-continuity/evidence-ledger/brief` for a Markdown packet.

The ledger currently tracks:

- generated integrity
- nonsecret regression suite
- typecheck, lint, and build
- clinical robustness lab contract
- execution-attempt durable-store contract
- AAL2 smoke readiness preflight
- strict AAL2 durable-store smoke blocker
- strict stored-vector RPC smoke blocker
- qualified external approval review

Each entry includes command, status, evidence type, source surface, artifact route, deterministic evidence hash, safe use cases, blocked claims, human-review requirement, replay instruction, and next action. Ledger entries are metadata only and must not include raw logs, bearer tokens, Supabase secrets, service-role keys, PHI, customer data, production connector payloads, certification proof, release approval, or live clinical authority.

## Release Evidence Promotion Queue

Use `/api/release-continuity/evidence-promotion` for machine-readable promotion readiness. Use `/api/release-continuity/evidence-promotion/brief` for a Markdown packet.

The queue classifies each release evidence ledger entry into:

- buyer diligence candidate: no-secret metadata can be attached to protected buyer diligence after release-steward review.
- protected operator proof required: strict AAL2 evidence remains blocked until a fresh human AAL2 run produces retained no-secret packet metadata.
- qualified external review required: legal, privacy, security, clinical, reimbursement, regional, certification, connector, or customer go-live claims remain blocked until qualified review.

The promotion queue is not public distribution approval, production release approval, HIPAA certification, SOC 2 certification, FDA clearance, legal approval, PHI authorization, or live clinical authority.

## Release Evidence Freshness Guard

Use `/api/release-continuity/evidence-freshness-guard` for machine-readable freshness and revalidation policy. Use `/api/release-continuity/evidence-freshness-guard/brief` for a Markdown packet.

The freshness guard classifies release evidence as internal-readiness metadata, refresh-required before external sharing, blocked until fresh human AAL2 retained packet metadata, or blocked until qualified review confirms the evidence is current. It records command names, evidence hashes, routes, maximum age policy, refresh triggers, reviewer owners, and blocked claims only.

The freshness guard is not a command runner, proof of rerun, public distribution approval, production release approval, PHI authorization, certification, security attestation, customer-specific permission, production connector approval, or live clinical authority.

## Release Authorization Chain

Use `/api/release-continuity/authorization-chain` for a machine-readable weakest-link view before any diligence packet or artifact is referenced outside SCRIMED. Use `/api/release-continuity/authorization-chain/brief` for a Markdown packet.

The chain composes the release evidence ledger, promotion queue, freshness guard, diligence release gate, packet manifest, recipient qualification matrix, diligence packet share guard, and AAL2 smoke readiness. It reports the chain decision, weakest link, control counts, deterministic authorization hash, and required controls while retaining the safe-use label `no-secret-metadata-chain-not-release-approval`.

The chain is not release approval, public distribution approval, customer-specific permission, protected packet sharing, PHI authority, certification, security attestation, production connector approval, customer go-live approval, or live clinical authority.

## Diligence Release Gate

Use `/api/release-continuity/diligence-gate` for machine-readable GO/NO-GO diligence posture. Use `/api/release-continuity/diligence-gate/brief` for a Markdown packet.

The gate allows only no-secret buyer diligence metadata with release-steward review. It keeps strict AAL2 proof blocked until retained protected packet metadata exists, keeps public distribution blocked until qualified review, keeps production release blocked, and keeps clinical production blocked.

The Diligence Release Gate is not release approval, public distribution approval, production approval, clinical authority, PHI authority, certification, legal approval, production connector approval, or customer go-live approval.

## Diligence Packet Manifest

Use `/api/release-continuity/diligence-packet-manifest` for machine-readable buyer and investor packet assembly rules. Use `/api/release-continuity/diligence-packet-manifest/brief` for a Markdown packet.

The manifest lists each diligence artifact, allowed no-secret fields, withheld material, reviewer owner, shareability lane, GO/NO-GO state, blocked claims, and safe next action. It allows metadata-only diligence packet preparation while keeping strict AAL2 proof, public distribution, certification, PHI, clinical, connector, reimbursement, customer go-live, and production approval claims blocked until qualified review.

The manifest also lists the Protected Boundary Release Evidence Intake Packet at `/api/pilot-workspaces/{workspaceSlug}/boundary-release-evidence-intake/packet`. That packet is `withhold-until-human-aal2` and `no-go` for public use: it can help approved operators retain metadata-only packet audit evidence, but it does not approve boundary release, production PHI, live care, payer submission, EHR writeback, production connectors, certification claims, public distribution, or customer go-live.

The Diligence Packet Manifest is not public distribution approval, production approval, clinical authority, PHI authority, certification, security attestation, legal approval, production connector approval, or customer go-live approval.

## Recipient Qualification Matrix

Use `/api/release-continuity/recipient-qualification-matrix` for machine-readable recipient preflight policy. Use `/api/release-continuity/recipient-qualification-matrix/brief` for a Markdown packet.

The matrix classifies internal release stewards, qualified buyers/investors, customer-specific recipients, public/press recipients, clinical production reviewers, and security certification reviewers. Each class receives a default decision, required evidence, allowed metadata-only payload, blocked payload, reviewer owner, expiry policy, revocation policy, audit expectation, and safe next action.

The matrix does not store recipient names, recipient emails, recipient lists, access grants, raw access logs, IP addresses, device identifiers, signed approvals, legal opinions, certification evidence, protected packet bodies, bearer tokens, PHI, customer data, production connector payloads, public distribution approval, customer-specific permission, or live clinical authority.

## Diligence Packet Share Guard

Use `/api/release-continuity/diligence-packet-share-guard` for machine-readable recipient and distribution controls. Use `/api/release-continuity/diligence-packet-share-guard/brief` for a Markdown packet.

The share guard classifies internal release-steward review, qualified buyer/investor review, customer-specific recipients, public/press distribution, clinical production review, and security certification review. Each class receives a share decision, allowed payload, withheld payload, required reviewer, blocked claims, and next action.

The share guard includes an artifact-specific `protected-boundary-release-evidence-intake-packet-sharing` card for `/api/pilot-workspaces/{workspaceSlug}/boundary-release-evidence-intake/packet`. That card allows only route/proof-stack metadata and keeps packet bodies, boundary-release claims, public sharing, and customer-specific use withheld until a fresh human AAL2 run, retained audit metadata, release-steward review, and qualified external review are complete.

The Diligence Packet Share Guard is not an email sender, calendar invite creator, public distribution approval, production approval, customer permission, PHI authority, security certification, clinical validation, production connector approval, or customer go-live approval.

## Boundaries

NO-GO:

Release Continuity does not mint tokens, store secrets, bypass AAL2, approve buyer release, authorize PHI processing, certify security or compliance, grant legal approval, approve production connectors, guarantee reimbursement, or authorize live clinical care.
