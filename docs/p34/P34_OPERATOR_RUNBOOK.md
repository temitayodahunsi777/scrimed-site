# p.34 Operator Runbook

## Safe Local Validation

1. Use Node 24.
2. Run `npm run test:scrimed-p34-gap-closure`.
3. Run `npm run contract:scrimed-p34-gap-closure`.
4. Run the p.34 policy, contract, artifact, nonsecret, lint, typecheck, build, secret, SBOM, generated-integrity, provenance, and diff checks.
5. Generate an attributable local commit.
6. Regenerate candidate, source, validation, security, review, gate, migration, public-claims, investor, and SBOM fingerprints against that commit.
7. Stop at `EXACT_REVIEW_REQUIRED`.

## Kill Switch

- `NORMAL`: policy still blocks all retained boundaries.
- `RESTRICTED`: A2/A3 are denied.
- `READ_ONLY`: default; writes are denied while diagnostics remain visible.
- `HALTED`: every new governed action is denied, including reads. Use only a separately authenticated out-of-band path for safe audit and health visibility.

Set `SCRIMED_P34_KILL_SWITCH_MODE` only to one of those values. Invalid values resolve to `READ_ONLY`.

## Evidence Expiry

Expired or candidate-mismatched evidence cannot be renewed in place. Regenerate candidate manifest, validation packet, security evidence, review packet, and gate packet in that order. Never carry a prior review to a changed candidate.

## Incident Response

Tenant leakage, replay, privilege drift, unauthorized distribution, or an unexpected network target recommends `HALTED`. Model substitution, policy mutation, maturity drift, or expired evidence recommends `READ_ONLY`. Retry, delegation, or budget breaches recommend `RESTRICTED`. The Sentinel emits evidence but cannot execute containment by itself.

Malformed or nonfinite Sentinel counters are treated as a `SEV0` input-integrity incident and recommend `HALTED`.
