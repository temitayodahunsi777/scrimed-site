# Remediation Candidate Commit Manifest

This manifest groups the proposed local candidate. The authoritative path inventory is emitted
by `npm run release:candidate-manifest:strict` (or the direct-Node equivalent) immediately
before commit. No file may be added if it is unrelated, secret-bearing, machine-specific,
generated cache, build output, or local environment state.

## Safety

- `.env.example`
- `app/lib/operatingMode.ts`
- `app/components/OperatingModeBanner.tsx`
- `app/api/operating-mode/route.ts`
- `instrumentation.ts`
- `config/public-claims-policy.json`
- `app/lib/publicClaimsPolicy.ts`
- `app/lib/publicReleaseDiagnostics.ts`
- `app/api/public-release-status/route.ts`
- `supabase/migrations/20260721173000_p32_evidence_attestation_issuances.sql`
- `supabase/migrations/20260722120000_p32_candidate_review_control_plane.sql`

## Legal And Compliance

- `app/lib/companyIdentity.ts`
- `app/lib/legalPolicies.ts`
- `app/legal/page.tsx`
- `app/legal/[slug]/page.tsx`
- `config/pending-migration-authorization.json`
- `docs/CEO_AND_COUNSEL_DECISIONS_REQUIRED.md`
- `docs/LEGAL_COUNSEL_REVIEW_REQUIRED.md`
- `docs/PENDING_MIGRATION_AUTHORIZATION_PACKET.md`
- `docs/REGULATORY_INTENDED_USE_REGISTER.md`
- `docs/SECURITY_AND_EXECUTION_GATES.md`
- `docs/SUPABASE_SECURITY_OPERATOR_CHECKLIST.md`
- `docs/WIX_METADATA_IMPLEMENTATION_CHECKLIST.md`

## Public Messaging

- `app/page.tsx`
- `app/layout.tsx`
- `app/globals.css`
- `app/components/SiteFooter.tsx`
- `app/faithcore/page.tsx`
- `app/lib/operatingContext.ts`
- `app/lib/productReadinessRegistry.ts`
- `app/lib/siteNavigation.ts`
- `app/lib/navigationAudit.ts`
- `app/lib/omegaPlatformAudit.ts`
- `app/validation-evidence/page.tsx`
- `app/api/validation-evidence/route.ts`
- `app/lib/validationEvidence.ts`
- `app/sitemap.ts`
- `app/robots.ts`

## Forms

- `app/pilot/PilotIntakeForm.tsx`
- `app/api/pilot/intake/route.ts`
- `app/lib/pilotIntake.ts`

## Release Verification

- `.github/workflows/ci.yml`
- `package.json`
- `config/wix-publication-policy.json`
- `scripts/lib/public-claims-policy.mjs`
- `scripts/lib/wix-publication-policy.mjs`
- `scripts/pending-migration-authorization-check.mjs`
- `scripts/public-claims-integrity-smoke.mjs`
- `scripts/public-production-smoke.mjs`
- `scripts/release-candidate-validation.mjs`
- `app/lib/scrimedP32GateEvidence.ts`
- `scripts/scrimed-nonsecret-test-suite.mjs`
- `scripts/verify-public-release.mjs`
- `scripts/wix-publication-verification.mjs`
- `scripts/wix-publication-verification-contract-check.mjs`
- `scripts/scrimed-local-public-smoke-runner.mjs`
- `scripts/scrimed-local-public-smoke-runner-contract-check.mjs`
- `docs/release-candidate-validation.md`
- `docs/local-quality-runner.md`
- `docs/REMEDIATION_DEPLOYMENT_AUTHORIZATION_PACKAGE.md`
- `docs/RELEASE_VERIFICATION_CHECKLIST.md`
- `docs/WIX_OPERATOR_EXECUTION_PACKET.md`
- `docs/WIX_PUBLICATION_VERIFICATION_REPORT.md`

## Governance Documentation

- `docs/CEO_APPROVED_REMEDIATION_PLAN.md`
- `docs/EXTERNAL_SYSTEM_ACTIONS_REQUIRED.md`
- `docs/PUBLIC_CLAIMS_REGISTER.md`
- `docs/public-claims-integrity.md`

## Tests And Contract Alignment

- `scripts/public-remediation-contract-check.mjs`
- `scripts/public-remediation-policy-test.mjs`
- `scripts/release-candidate-validation-contract-check.mjs`
- `scripts/scrimed-p32-evidence-issuer-contract-check.mjs`
- `scripts/scrimed-p32-candidate-review-contract-check.mjs`
- route-count and navigation contract files changed by this candidate, as enumerated by the
  exact candidate manifest and review packet.

The local commit creates a review target only. It does not establish named review, legal or
clinical approval, migration authorization, deployment authorization, or customer go-live.
