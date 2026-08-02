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

For a mixed dirty worktree, `npm run evidence:scrimed-p32-worktree` produces local `NON_CANDIDATE` attribution evidence without granting promotion authority. The collector accepts only bounded regular files inside the repository, rejects symbolic links and path traversal, and records file mode and size with each SHA-256 digest. This prevents a worktree entry from redirecting evidence collection to external machine content. Its final attribution and non-candidate fingerprint outputs remain on disk but are narrowly ignored because they are self-referential generated evidence, not application source. The initial attribution, architecture crosswalk, and other deliberate evidence artifacts remain review-visible. A human still must review the attribution and create the clean candidate commit through the normal workflow.

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

### Protected AAL2 Issuer

The repository now contains the missing issuer side at `/api/pilot-workspaces/{workspaceSlug}/qa-evidence/p32-attestation`. It is disabled by default and signs only `aal2-cli-evidence`; it cannot sign a human approval. The route requires a fresh bearer session verified by Supabase, the existing AAL2 governance context, tenant membership, and a database-enforced `tenant-admin` or `pilot-lead` role. It also requires one current retained no-PHI QA packet and exact equality with the source commit, source-tree, artifact, and validation fingerprints configured on the issuing service.

Provision an Ed25519 key pair through the approved secret-management process. Keep the private PKCS#8 PEM only in `SCRIMED_P32_EVIDENCE_ISSUER_PRIVATE_KEY_PEM`. Put the independently distributed public SPKI PEM in the verifier trust registry with only:

- `allowedAutomatedEvidenceIds: ["aal2-cli-evidence"]`
- `allowedApprovalGateIds: []`
- `allowedIdentityAssurance: ["protected-aal2-workspace"]`

Set the remaining `SCRIMED_P32_EVIDENCE_ISSUER_*` values to the exact validated candidate, apply the new migration to an approved nonproduction Supabase target, and only then enable `SCRIMED_P32_EVIDENCE_ISSUER_ENABLED=true`. The issuer never returns until the database has persisted the packet hash, candidate fingerprints, signature fingerprint, actor, one-use idempotency key, prior audit hash, and current audit hash. It does not persist the detached signature or private key.

With a fresh local AAL2 token and an issuer configured for the unchanged candidate:

```bash
npm run release:scrimed-p32-aal2-evidence -- \
  --base-url=http://127.0.0.1:3000 \
  --workspace=atlas-synthetic-evaluation \
  --output=/absolute/path/outside/repository/scrimed-p32-aal2-evidence.json

npm run release:scrimed-p32-evidence:strict -- \
  --evidence-file=/absolute/path/outside/repository/scrimed-p32-aal2-evidence.json
```

The client reruns bounded candidate validation, never prints the bearer token, requires an absolute output path outside Git, creates the transfer file with mode `0600`, and refuses to overwrite an existing file. Remove the short-lived token after the run. A valid issuer signature can satisfy only the AAL2 technical gate; all named approvals, deployment authority, post-deployment evidence, and customer go-live remain separate. `release:scrimed-p32-evidence:all-gates` must therefore remain nonzero until those independent gates are also satisfied.

The protected issuer and candidate-review routes enforce the same mutation-provenance policy as SCRIMED Work. Browser requests must be exact same-origin requests. The bounded CLI sets `X-SCRIMED-Request-Context: operator-smoke-v1`; this header is not an authorization credential and never bypasses bearer, AAL2, RBAC, tenant, feature-flag, idempotency, or durable-ledger controls.

Candidate-review readiness also resolves the authenticated actor's active workspace role from the actor's own row-level-security-scoped membership record. Tenant admins and pilot leads receive assignment controls, reviewers receive identity and disposition controls, and observers receive a read-only fingerprint view. The API enforces the same stage capability before cryptographic work, and the database independently enforces role and separation of duties.

## Migration Packet

`npm run release:migration-packet` hashes every repository migration and performs deterministic static analysis. It does not run a database and therefore leaves forward migration, recovery, row-count invariants, locking, PHI/log review, and database-owner approval false. A database owner must run the exact migration set against an isolated disposable database and bind the evidence to the candidate and migration-set hashes.

`20260721173000_p32_evidence_attestation_issuances.sql` adds only a private append-only no-PHI issuance ledger and a tightly scoped public RPC. It does not enable the issuer feature flag and must not be applied to production without the normal migration dry-run and database-owner approval.

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
