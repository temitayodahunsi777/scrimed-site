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
2. `npm run hygiene:workspace`
3. `npm run security:secret-scan`
4. `npm run security:sbom`
5. `npm run release:migration-packet`
6. `npm run typecheck`
7. `npm run lint`
8. `npm run test:nonsecret`
9. `npm run build`
10. `node scripts/check-generated-integrity.mjs`
11. Investor-deck review whenever the bounded deck is present, including when its exact output path is intentionally excluded from the application source candidate

When `npm` is unavailable in a constrained desktop runtime, the validator executes
the same repository-owned entrypoints through the current Node binary. The fallback
retains secret scanning, SBOM verification, migration evidence, generated integrity,
typecheck, lint, nonsecret tests, prebuild provenance, generated-output postflight,
rendered public-release verification, and the production build. Its
use is recorded as `npm-unavailable-direct-node-fallback`; it does not skip or soften
any release gate.

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

The packet also assigns every reviewable file to exactly one of five risk-ordered review batches: release/security/data controls, runtime/clinical/API contracts, product claims/UI, quality/validation evidence, and documentation/operations. Every batch includes its exact file references, required specialist roles, and a deterministic batch SHA-256. Missing or duplicate batch coverage fails the complete packet. Batch order reduces reviewer context switching; it does not let one batch approve another, remove a required reviewer, authorize a commit, or grant release authority.

Authorized reviewers can export one least-disclosure batch instead of receiving the complete path inventory:

```bash
node scripts/release-candidate-review-packet.mjs --markdown --batch=release-security-data
node scripts/release-candidate-review-packet.mjs --markdown --batch=runtime-clinical-api
node scripts/release-candidate-review-packet.mjs --markdown --batch=product-claims-ui
node scripts/release-candidate-review-packet.mjs --markdown --batch=quality-evidence
node scripts/release-candidate-review-packet.mjs --markdown --batch=documentation-operations
```

Use `--json` instead of `--markdown` for an approved structured review workflow. Each derivative export contains only the selected batch, its exact files, required roles, batch SHA-256, parent packet SHA-256, and candidate/source fingerprints. Unknown batches and incomplete parent packets fail closed. The export is a review aid, not reviewer disposition or approval evidence; decisions must still be recorded through the approved protected workflow.

For a multi-commit candidate, set `SCRIMED_RELEASE_CANDIDATE_BASE_REF` to the exact previously reviewed ancestor before running manifest, validation, review-packet, or gate-evidence commands. The tool resolves the reference to a commit, verifies it is an ancestor of `HEAD`, records the full base SHA, and rejects unsafe, unresolved, descendant, or same-commit values.

Normal terminal output contains aggregate counts and fingerprint prefixes only. Authorized internal reviewers may request complete path metadata with `node scripts/release-candidate-review-packet.mjs --json` or `--markdown`. These modes include paths and hashes, but never file contents, raw diffs, secrets, credentials, or PHI. Sensitive, disposable, non-source, oversized, unreadable, unsafe, or unmerged paths fail closed and are withheld where needed.

Each reviewer disposition must bind the full candidate, source, and review-packet SHA-256 values to a named role, hashed reviewer identity, decision timestamp, expiry, evidence pointer, and decision hash. The generated template is deliberately unapproved and does not authorize review approval, a commit, deployment, migration, release promotion, or external distribution. Any source change invalidates the packet and requires candidate validation, packet generation, and human review to run again.

## Candidate-Bound Gate Packet

`release:scrimed-p32-evidence:strict` reruns bounded candidate validation and binds the full 40-character source commit, source-tree fingerprint, investor-artifact fingerprint, validation-evidence fingerprint, and local technical checks into one deterministic no-secret packet. The command passes only when the candidate review packet is structurally valid; it does not require or fabricate external authority.

`release:scrimed-p32-evidence:all-gates` is the deliberate fail-closed audit. It exits nonzero until every defined technical and external evidence gate is current and bound to the exact same candidate. Even then, its packet explicitly grants no aggregate release authority.

Optional supplemental evidence uses `--evidence-file=/secure/local/path.json` with `automatedEvidence`, `approvals`, and, whenever either array is non-empty, `attestation`. Records must contain their integrity hash, exact candidate fingerprints, bounded timestamps, metadata-only evidence pointer, and hashed reviewer/tenant identifiers. The detached Ed25519 attestation must cover the canonical arrays and come from a current trusted key whose configured scope permits every evidence ID, approval gate, and identity-assurance class in the file. The runner rejects missing or invalid signatures, unknown or revoked keys, issuer-scope escalation, duplicate identifiers, stale fingerprints, expired evidence, tampered decision hashes, JWT-like values, bearer material, provider secret keys, and private keys. Do not put signed source documents, legal opinions, PHI, credentials, raw logs, or customer data in this file.

Protected workspace packets whose own contract says “metadata only” or “not approval” remain references; they must not be relabeled as legal, clinical, privacy, deployment, or customer authority. A qualified reviewer must make the actual decision through the approved process and retain the source artifact externally.

Each unresolved p.32 gate exposes a fingerprint-bound operator action with responsible role, exact action, command or protected form, expiration, rejection consequence, and verification procedure. A template remains `BLOCKED` or `OPERATOR_REQUIRED`; it is never evidence of completion.
