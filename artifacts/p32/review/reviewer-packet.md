# SCRIMED P.32 Reviewer Packet

Evidence class: `NON_CANDIDATE`

This packet supports review of a dirty, attributable worktree. It is not a release candidate and cannot be approved for production.

## Review Lanes

| Lane | Review focus |
| --- | --- |
| Agent governance | Job manifests, delegation integrity, emergency stop, capability boundaries, reviewer-capacity fail-closed behavior. |
| Artifact admission | Exact artifact digests, signatures, SBOM/model-BOM/data-BOM, license and intended-use boundaries, atomic rollback. |
| Clinical evidence | Fact/inference/hypothesis separation, source spans, stale/retracted evidence, correction and escalation paths. |
| Privacy | De-identification risk is never self-certified; no-PHI telemetry and expert-determination external gate. |
| Interoperability | Version negotiation, lossless FHIR unknown-field/provenance round trip, structured-write prohibition, browser bypass denial. |
| Human governance | Purpose-bound consent, communication fatigue, competence, clinical launch cell, value and board evidence. |
| Release controls | 66 automated development gates, 13 irreducible external gates, dirty-worktree promotion denial. |
| Migration | Static review of three additive, unapplied migrations; executable dry run remains environment-blocked. |

## Required Reviewer Checks

1. Confirm the initial and final attribution manifests preserve pre-existing user work.
2. Confirm no parallel runtime, router, context, evaluation, or policy architecture was introduced.
3. Review all `THIS_RUN_CHANGE` files and their focused tests.
4. Confirm all new high-risk feature flags default to disabled.
5. Confirm clinical output remains decision support with correction, escalation, and competent human review.
6. Confirm no raw PHI, credentials, token material, or raw connector payload is present.
7. Review the migration risk packet before authorizing a disposable database dry run.
8. Reject any attempt to treat this dirty worktree packet as clean commit provenance.

## Decision

Current decision: `REVIEW_REQUIRED_NON_CANDIDATE`

The reviewer must not sign a release decision until a distinct release steward creates a clean attributable commit and regenerates all candidate-bound evidence.
