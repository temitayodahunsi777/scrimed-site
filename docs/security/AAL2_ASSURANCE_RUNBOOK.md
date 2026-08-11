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

Run:

```bash
npm run verify:aal2:evidence -- --strict
```

The preflight checks AAL2 claims, expiry, minted lifetime, issuer, audience, subject, candidate
binding, and nonce presence. It emits only fingerprints. It deliberately leaves signature, role,
tenant membership, feature flags, action scope, and replay enforcement to Supabase Auth and the
protected SCRIMED API.

## Protected Verification

Use the manually dispatched `AAL2 assurance` workflow in the protected `aal2-assurance` GitHub
environment. A human environment approver must verify the target, candidate hash, synthetic
workspace, and nonce. Secrets remain GitHub environment secrets and must not be pasted into task
comments or artifacts.

The protected job runs the strict verifier, durable-store preflight, and authenticated SCRIMED
Work smoke. A local parser pass alone never closes the AAL2 gate.

## Failure And Disposal

- Refresh an expired or soon-expiring session instead of relaxing freshness.
- Reject issuer, audience, role, tenant, workspace, candidate, or nonce mismatch.
- Reject replay at the protected API and rotate the run nonce.
- Remove local bearer material immediately after the bounded run.
- Retain only redacted fingerprints, status, exact candidate, workflow run reference, and
  protected audit identifiers.
