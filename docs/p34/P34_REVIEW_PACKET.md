# p.34 Exact-Candidate Review Packet

Target review time: 15 minutes.

## Reviewer Sequence

1. Verify the commit, tree, candidate, source, validation, review, gate, SBOM, security, migration, public-claims, and investor fingerprints all name the same committed source.
2. Review the focused diff from preserved baseline `72c44bed5bc4550464bbf8a6ece648403ed7da4e`.
3. Confirm A0/A1 cannot write, A2 remains human-review only, and A3 remains unavailable.
4. Confirm approval verification is candidate/action/tenant/environment/requester/side-effect/time/nonce/signature bound, while the current replay proof is an in-process synthetic self-test and not a durable approval store.
5. Confirm evidence expires closed and the gate evidence was current when reviewed.
6. Confirm `READ_ONLY` is the default kill-switch state and UI does not imply production authority.
7. Confirm egress and trace artifacts contain no PHI, secrets, raw prompts, or hidden reasoning.
8. Confirm the three pending migrations remain unapplied and no provider call or deployment occurred.
9. Record the named technical decision against the exact current fingerprints; do not approve by description alone.

## Supporting Automated Evidence

Architecture, security, governance, failure-mode, adversarial, and public-claims checks are supporting evidence only. They do not replace the independent reviewer or targeted clinical, legal, privacy/security, database, release, and customer approvals at their boundaries.

## Current Ceiling

`EXACT_REVIEW_REQUIRED`. Review does not authorize PHI, clinical use, payer/EHR/device action, migration, preview distribution, production deployment, investor distribution, or customer activation.
