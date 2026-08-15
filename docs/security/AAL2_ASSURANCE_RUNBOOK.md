# AAL2 Assurance Runbook

## Purpose

Prepare and verify real, short-lived AAL2 operator evidence for an exact nonproduction candidate.
This runbook does not authorize production, deployment, migration, distribution, PHI, clinical
execution, or customer activation.

## Local Preflight

Set these only in the local ignored environment or protected CI environment:

- `SCRIMED_BEARER_TOKEN`
- `SCRIMED_WORKSPACE_SLUG`
- `SCRIMED_AAL2_EXPECTED_ISSUER`
- `SCRIMED_AAL2_EXPECTED_AUDIENCE`
- `SCRIMED_AAL2_CANDIDATE_SHA256`
- `SCRIMED_AAL2_EVIDENCE_NONCE`
- `SCRIMED_AAL2_EXPECTED_COMMIT_SHA`
- `SCRIMED_AAL2_ALLOWED_PREVIEW_ORIGINS` (comma-separated exact HTTPS origins)

Run:

```bash
npm run verify:aal2:target-binding
npm run verify:aal2:evidence -- --strict
```

The preflight checks AAL2 claims, expiry, minted lifetime, issuer, audience, subject, exact local
candidate-manifest equality, and nonce presence. The target verifier requires an allowlisted preview
origin whose uncached build metadata matches the local Git commit, Node 24 runtime, SCRIMED project,
preview environment, and closed production/customer authority boundaries. It emits only public
identifiers and fingerprints. It deliberately leaves signature, role,
tenant membership, feature flags, action scope, and replay enforcement to Supabase Auth and the
protected SCRIMED API.

## Protected Verification

Use the manually dispatched `AAL2 assurance` workflow in the protected `aal2-assurance` GitHub
environment. A human environment approver must verify the target, candidate hash, synthetic
workspace, nonce, and exact `SCRIMED_AAL2_ALLOWED_PREVIEW_ORIGINS` environment variable. The
workflow validates target identity before bearer, issuer, or audience secrets are injected into any
step. Secrets remain GitHub environment secrets and must not be pasted into task comments or artifacts.

The protected job runs the strict verifier, durable-store preflight, and authenticated SCRIMED
Work smoke. A local parser pass alone never closes the AAL2 gate.

## Failure And Disposal

- Refresh an expired or soon-expiring session instead of relaxing freshness.
- Reject issuer, audience, role, tenant, workspace, candidate, or nonce mismatch.
- Reject replay at the protected API and rotate the run nonce.
- Remove local bearer material immediately after the bounded run.
- Retain only redacted fingerprints, status, exact candidate, workflow run reference, and
  protected audit identifiers.
