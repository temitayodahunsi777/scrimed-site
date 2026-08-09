# PR #25 Reviewer Brief

Target review time: under 15 minutes.

## 1. Confirm identity

Review exact head `c15a79c76d59a2f94bb7f999469da8bbc1618d8c` and the five SHA-256 fingerprints in [the frozen baseline](../release/PR25_FROZEN_REVIEW_BASELINE.md). Do not approve a moving branch name without confirming the head.

## 2. Confirm automated evidence

- Detached candidate validation: 10/10.
- GitHub Actions: 6/6.
- Secret scan: zero findings across 1,886 files.
- SBOM: 422 components and zero dependency delta.
- Review coverage: 489/489 files.
- Preview: exact head, non-production target, `READY`.

## 3. Review material changes

- Governed agent, model, evidence, clinical-safety, and release-control foundations.
- Synthetic/no-PHI fail-closed operating mode.
- Protected pilot and two-person review pathways.
- Deterministic migration, security, public-claims, and supply-chain evidence.
- Vercel production auto-deploy from `main` disabled while preview remains enabled.

## 4. Verify boundaries

The candidate must not authorize live PHI, autonomous clinical care, diagnosis, treatment, prescribing, payer submission, EHR writeback, production medical-device connectivity, certification claims, production migration, customer go-live, or investor-material distribution.

## 5. Disposition

Use one exact disposition:

- `APPROVE_EXACT_HEAD`
- `APPROVE_WITH_NONBLOCKING_NOTES`
- `REQUEST_CHANGES`
- `BLOCK`

The authoritative review must identify the reviewer, exact head, evidence fingerprints, decision, timestamp, and retained boundaries. This brief and `/scrimed-work/review` are read-only and cannot create approval evidence.

Approval permits merge consideration only. It does not authorize merge or production.
