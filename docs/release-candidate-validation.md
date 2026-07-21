# SCRIMED Release Candidate Validation

SCRIMED Release Candidate Validation binds automated nonsecret quality evidence to one unchanged local candidate. It fingerprints the candidate before and after the approved command set and fails closed if source or artifacts drift during validation.

## Commands

```bash
npm run release:candidate-validate
npm run release:candidate-validate:strict
npm run test:release-candidate-validation
npm run contract:release-candidate-validation
npm run release:candidate-review-packet
npm run release:candidate-review-packet:strict
npm run test:release-candidate-review-packet
npm run contract:release-candidate-review-packet
npm run release:scrimed-p32-evidence:strict
npm run release:scrimed-p32-evidence:all-gates
```

The strict command executes:

1. `git diff --check`
2. `npm run security:secret-scan`
3. `npm run security:sbom`
4. `npm run release:migration-packet`
5. `npm run typecheck`
6. `npm run lint`
7. `npm run test:nonsecret`
8. `npm run build`
9. `node scripts/check-generated-integrity.mjs`
10. Investor-deck review whenever the bounded deck is present, including when its exact output path is intentionally excluded from the application source candidate

The runner does not retain child-process output, raw diffs, paths, prompts, tokens, credentials, PHI, or slide text. It reports only command identifiers, exit state, normalized warning codes, candidate/source/artifact fingerprints, drift state, and a deterministic validation-evidence hash. The known macOS native-SWC/WASM fallback is therefore visible as a warning code without retaining the raw build log.

## Pass Meaning

`automated-candidate-validation-passed-human-review-required` means:

- all bounded nonsecret checks passed;
- the source lane remained reviewable;
- any supported investor deck passed automated artifact review;
- the full candidate fingerprint did not change during validation; and
- the evidence hash deterministically binds those results.

It does not authorize a commit, deployment, migration, external distribution, investor outreach, PHI processing, clinical care, certification, customer go-live, or release promotion.

## Remaining Human Gates

- Every reviewer selected by the candidate manifest reviews the intended source scope.
- Founder, counsel/claims, and finance review the exact investor artifact fingerprint.
- Release authority approves one clean immutable source revision.
- Deployment authority binds the approved full SHA to the deployment.
- Production smoke runs after deployment against that exact revision.

Any source or artifact change invalidates candidate-specific validation and requires a complete rerun.

## Candidate Reviewer Packet

`npm run release:candidate-review-packet:strict` converts the current reviewable candidate into a deterministic, internal reviewer handoff. For a dirty candidate it reviews the working-tree delta; for a clean immutable candidate it reviews the validated base-to-`HEAD` change set (`HEAD^` by default) and binds the commit tree. It hashes each file without following symbolic links, verifies candidate and source file counts against the candidate manifest, assigns every file to the release steward and principal engineer, and adds specialist lanes for API, database, security and identity, clinical safety, claims and legal, platform, UI, and documentation review.

For a multi-commit candidate, set `SCRIMED_RELEASE_CANDIDATE_BASE_REF` to the exact previously reviewed ancestor before running manifest, validation, review-packet, or gate-evidence commands. The tool resolves the reference to a commit, verifies it is an ancestor of `HEAD`, records the full base SHA, and rejects unsafe, unresolved, descendant, or same-commit values.

Normal terminal output contains aggregate counts and fingerprint prefixes only. Authorized internal reviewers may request complete path metadata with `node scripts/release-candidate-review-packet.mjs --json` or `--markdown`. These modes include paths and hashes, but never file contents, raw diffs, secrets, credentials, or PHI. Sensitive, disposable, non-source, oversized, unreadable, unsafe, or unmerged paths fail closed and are withheld where needed.

Each reviewer disposition must bind the full candidate, source, and review-packet SHA-256 values to a named role, hashed reviewer identity, decision timestamp, expiry, evidence pointer, and decision hash. The generated template is deliberately unapproved and does not authorize review approval, a commit, deployment, migration, release promotion, or external distribution. Any source change invalidates the packet and requires candidate validation, packet generation, and human review to run again.

## Candidate-Bound Gate Packet

`release:scrimed-p32-evidence:strict` reruns bounded candidate validation and binds the full 40-character source commit, source-tree fingerprint, investor-artifact fingerprint, validation-evidence fingerprint, and local technical checks into one deterministic no-secret packet. The command passes only when the candidate review packet is structurally valid; it does not require or fabricate external authority.

`release:scrimed-p32-evidence:all-gates` is the deliberate fail-closed audit. It exits nonzero until every defined technical and external evidence gate is current and bound to the exact same candidate. Even then, its packet explicitly grants no aggregate release authority.

Optional supplemental evidence uses `--evidence-file=/secure/local/path.json` with exactly two arrays: `automatedEvidence` and `approvals`. Records must contain their integrity hash, exact candidate fingerprints, bounded timestamps, metadata-only evidence pointer, and hashed reviewer/tenant identifiers. The runner rejects duplicate identifiers, stale fingerprints, expired evidence, tampered decision hashes, JWT-like values, bearer material, provider secret keys, and private keys. Do not put signed documents, legal opinions, PHI, credentials, raw logs, or customer data in this file.

Protected workspace packets whose own contract says “metadata only” or “not approval” remain references; they must not be relabeled as legal, clinical, privacy, deployment, or customer authority. A qualified reviewer must make the actual decision through the approved process and retain the source artifact externally.

Each unresolved p.32 gate exposes a fingerprint-bound operator action with responsible role, exact action, command or protected form, expiration, rejection consequence, and verification procedure. A template remains `BLOCKED` or `OPERATOR_REQUIRED`; it is never evidence of completion.
