# SCRIMED p.32 Release Operations

## Local Evidence Sequence

```bash
npm run security:secret-scan
npm run security:sbom
npm run release:migration-packet
npm run release:candidate-validate:strict
npm run release:candidate-review-packet:strict
npm run release:scrimed-p32-evidence:strict
npm run release:scrimed-p32-operator-packet
```

`release:scrimed-p32-evidence:all-gates` is intentionally fail-closed until every technical and named external decision is current and bound to the exact clean candidate.

When the working tree is clean, the candidate manifest and review packet evaluate a committed base-to-`HEAD` change set rather than an empty working-tree diff. Candidate, source, commit-tree, validation, and review-packet fingerprints therefore remain attributable after local commit promotion.

If promotion spans more than one local commit, export `SCRIMED_RELEASE_CANDIDATE_BASE_REF` with the exact reviewed ancestor for every evidence command. This prevents a follow-up commit from narrowing review coverage to only its immediate parent diff.

## Operator Gates

The gate packet is the source of truth. Every unresolved gate contains a responsible role, exact action, candidate/source/artifact/validation fingerprints, command or protected form, expiry, rejection consequence, and verification procedure. Do not copy a prior packet to a changed candidate.

### Candidate-Bound Operator Handoff

`npm run release:scrimed-p32-operator-packet` renders the unresolved gate packet as a deterministic, no-secret Markdown handoff. It includes the exact source commit, Candidate fingerprint, source fingerprint, artifact fingerprint, validation fingerprint, gate-packet hash, and handoff hash. It groups work into candidate review, independent pre-deployment evidence, deployment authorization, post-deployment verification, and customer go-live. Actions whose prerequisites have not passed remain visibly deferred.

The handoff does not mint identity evidence or approvals. Export supplemental evidence only from a protected AAL2 workspace or qualified external authority configured in the trusted issuer registry. Never hand-author reviewer IDs, decision hashes, evidence hashes, timestamps, approval records, or issuer attestations. Non-empty evidence must carry a short-lived Ed25519 attestation over the canonical `automatedEvidence` and `approvals` payload. Keep the local transfer file outside Git and validate it with:

```bash
npm run release:scrimed-p32-evidence:all-gates -- --evidence-file=/absolute/path/to/no-secret-evidence.json
```

The evidence importer rejects missing or invalid signatures, unknown, revoked, expired, or out-of-scope issuer keys, unknown evidence types, duplicate identifiers, unsafe pointers, secret-like content, invalid identity assurance, stale timestamps, changed fingerprints, and tampered hashes. It retains only safe issuer metadata and a SHA-256 signature fingerprint in the gate packet, not the detached signature. Delete the transfer file after validated protected retention according to the approved retention policy.

Configure `SCRIMED_P32_EVIDENCE_TRUSTED_PUBLIC_KEYS_JSON` only in the verifier environment. The versioned JSON registry maps each key ID to its issuer, Ed25519 public key, active/retiring/revoked status, validity window, permitted automated evidence IDs, permitted approval gates, and permitted identity-assurance classes. Public keys are not secrets, but registry integrity and rotation are security controls. Private signing keys must remain in the protected issuing service and must never enter this repository, the transfer file, or verifier configuration. An empty supplemental file remains valid without an attestation and grants no gate evidence.

## Migration Packet

`npm run release:migration-packet` hashes every repository migration and performs deterministic static analysis. It does not run a database and therefore leaves forward migration, recovery, row-count invariants, locking, PHI/log review, and database-owner approval false. A database owner must run the exact migration set against an isolated disposable database and bind the evidence to the candidate and migration-set hashes.

## Supply Chain

`npm run security:sbom` creates a deterministic CycloneDX-compatible local report from `package-lock.json`, records dependency and license metadata when available, and reports the dependency delta against `HEAD`. External signing and qualified license review remain incomplete. `npm run security:secret-scan` scans the candidate without printing secret values.

Repository code includes CODEOWNERS, Dependabot, dependency review, and CodeQL definitions. An authorized GitHub administrator must separately verify branch protection, private vulnerability reporting, secret scanning, push protection, required reviews, force-push protection, and required status checks. No remote setting is changed by these files.

## Rollback

- Reject or revoke the scoped grant and preserve its audit receipt.
- Stop new execution, consume no additional nonce, and preserve idempotency records.
- Restore the prior artifact revision through an explicit restore revision.
- For migrations, use the reviewed forward-recovery plan against the disposable environment before any production consideration.
- Re-enable no route, connector, payer, EHR, PHI, or deployment capability during rollback.

## Post-Deployment Plan

Only after explicit deployment authorization: verify the deployed commit/artifact, health, dependencies, policy denials, tenant isolation, no-PHI logging, rollback behavior, safety/cost/latency monitors, and environment drift. Bind results to deployment-target identity evidence. Until that event occurs, the post-deployment gate cannot pass.

## Customer Go-Live

Require customer-specific intended use, customer and SCRIMED authority, trained operators, agreements, support and escalation owners, environment evidence, acceptance criteria, monitoring, rollback, and shutdown authority. Engineering automation cannot self-approve this gate.
