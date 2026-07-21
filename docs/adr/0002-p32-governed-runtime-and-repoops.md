# ADR 0002: Candidate-Bound Runtime and RepoOps Evidence

## Status

Accepted for local synthetic evaluation. Production execution remains unauthorized.

## Context

SCRIMED already had SCRIMED Work orchestration, tool policies, approval checkpoints, p.32 evidence contracts, and release gates. Remaining gaps were exact-candidate execution grants, replay protection, complex-context serialization refusal, artifact revision identity, deterministic supply-chain evidence, and machine-actionable external gate instructions.

## Decision

- Extend the existing tool registry with one governed authorization path.
- Separate read, propose, approve, execute, and verify stages.
- Bind execution grants to actor, tenant, purpose, scope, environment, candidate/source fingerprints, expiry, nonce, and approval references.
- Consume grant nonces once and require idempotency for execution.
- Refuse complex clinical serialization when no validated complete representation fits.
- Store multimodal extraction as provenance-rich review candidates, not clinical truth.
- Use SHA-256 document/revision identity and recoverable trash/restore revisions.
- Generate deterministic local SBOM, dependency-delta, migration, secret-scan, review, and gate evidence.
- Represent remote repository controls as unverified until authenticated evidence exists; never mutate them silently.

## Consequences

Consequential execution remains unavailable without a valid grant and current approvals, and current policy still hard-blocks live PHI, autonomous care, payer submission, EHR writeback, production mutation, deployment, and external distribution. The mixed dirty worktree remains ineligible for immutable provenance and local candidate commit until an authorized operator establishes attribution and review.
