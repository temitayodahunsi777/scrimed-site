# SCRIMED P.32 External Approval Requirements

Evidence class: `NON_CANDIDATE`

No item in this packet is an approval. Every decision must be tied to the eventual clean commit, source tree, generated artifacts, and unexpired identity evidence.

| Gate | Responsible role | Exact action | Current state |
| --- | --- | --- | --- |
| Clean reviewed commit provenance | Release steward | Review worktree attribution, create an attributable clean commit through the normal workflow, and regenerate exact candidate evidence. | `PENDING_HUMAN` |
| Named independent reviewer | Principal reviewer | Review the exact immutable candidate and record an identity-bound approve/reject decision. | `PENDING_HUMAN` |
| AAL2 operator evidence | Authorized operator | Present current issuer/audience/role/AAL evidence bound to one exact action and candidate. | `PENDING_HUMAN` |
| Migration approval | Database owner | Authorize and review the isolated disposable dry run; separately decide whether any later environment may receive the exact migration set. | `PENDING_HUMAN` |
| Intended-use approval | Founder, clinical governance, counsel | Sign intended and prohibited use for the exact candidate. | `PENDING_HUMAN` |
| Clinical safety approval | Clinical safety officer | Review task boundaries, human oversight, evidence, worst-cell behavior, and rollback. | `PENDING_HUMAN` |
| Privacy approval | Privacy officer | Review purpose, minimization, retention, disclosures, de-identification limits, and processor scope. | `PENDING_HUMAN` |
| Legal/regulatory approval | Qualified healthcare counsel | Review claims, contracts, intended use, jurisdiction, and regulatory posture without relying on synthetic evidence as approval. | `PENDING_HUMAN` |
| Security approval | Security officer | Review identity, authorization, isolation, supply chain, incident controls, and threat model. | `PENDING_HUMAN` |
| BAA/subprocessor/residency approval | Privacy, security, counsel | Verify documentary service scope, BAA/DPA, subprocessors, region, residency, retention, logs, and training behavior. | `PENDING_HUMAN` |
| Deployment authorization | Deployment authority | Approve exact candidate, environment, services, window, migration choice, monitoring, rollback owner, and expiry. | `PENDING_HUMAN` |
| Post-deployment smoke validation | Release operator | After an authorized deployment, bind environment smoke, policy-denial, tenant-isolation, no-PHI logging, and rollback evidence to the deployed artifact. | `PENDING_HUMAN` |
| Customer go-live authorization | Customer authority and SCRIMED founder | Approve customer-specific intended use, agreements, trained operators, support, acceptance criteria, environment evidence, and rollback. | `PENDING_HUMAN` |

## Fingerprint Binding

The current dirty worktree receives only a `NON_CANDIDATE` fingerprint in:

- `artifacts/p32/worktree/noncandidate-worktree-fingerprint.json`
- `artifacts/p32/worktree/final-worktree-attribution.json`

All approval forms must reject:

- dirty-worktree fingerprints;
- synthetic fixtures presented as external approval;
- stale or expired identity evidence;
- candidate, source, artifact, migration, or environment mismatches;
- self-approval or reviewer/assigner identity collisions.

## Rejection Consequence

Rejection or missing evidence leaves production release blocked. Development may continue only in the synthetic, de-identified-fixture, read-only, local/mock posture with provider calls and production mutation disabled.
