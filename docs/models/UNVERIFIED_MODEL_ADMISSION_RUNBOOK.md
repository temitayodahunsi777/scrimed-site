# Unverified Model Admission Runbook

Claude Opus 5 is represented only as a disabled candidate with status
`awaiting_verified_model_id`. SCRIMED does not guess model identifiers or treat an environment
flag as admission evidence.

## Admission Evidence

1. Obtain the exact model ID from official API enumeration, official provider documentation, or
   connected provider metadata.
2. Record provider, model ID, release/version, effort capabilities, context limit, pricing source
   date, retrieval timestamp, terms, residency, retention, and availability.
3. Complete provider terms and security review.
4. Run offline conformance, safety, latency, cost, fallback, and failure-semantics evaluation.
5. Register only a disabled evaluation profile tied to the evidence. Do not grant PHI, clinical,
   production, or public-performance-claim authority.
6. Require a separate reviewed promotion with feature flag, canary, monitoring, and rollback.

`evaluateUnverifiedModelAdmission()` rejects missing or mismatched official evidence and proves
that an environment flag cannot bypass admission. Other already-qualified synthetic routes may
continue; this candidate does not block the router.
