# p.34 Operator Command Center

This packet starts only after the focused follow-on branch is pushed. PR #39 and its deployment are
predecessor evidence; they cannot approve or accept the current candidate. None of these actions
grants merge, migration, production, PHI, clinical, payer, EHR/device, customer, contract, or
external-distribution authority.

## Remaining Human Actions

1. Independent review of PR #39 exact head.
2. Independent review of PR #40 exact head.
3. Fresh candidate-bound AAL2 verification.
4. Enable Supabase leaked-password protection and refresh Security Advisor.
5. Release-steward acceptance of the exact nonproduction preview.
6. Later, separate merge, protected-pilot, migration, production, customer, and distribution decisions.

## Machine Evidence and Certification

- **Owner:** release steward
- **Time:** 1-5 minutes after the source is stable
- **Action:** run `npm run scrimed:p34:certify`, then `npm run scrimed:p34:evidence`.
- **Input:** the clean exact follow-on commit and predecessor base `45be650f48e422b05160821681ff40bb9f1229c9`.
- **Evidence:** ignored runtime files `artifacts/release/p34-certification.json` and `artifacts/release/scrimed-p34-release-manifest.json`.
- **Verify:** candidate, commit, tree, source, validation, review packet, gate packet, SBOM, route inventory, and generation inventory agree. Certification from any other candidate is marked stale.
- **Recovery:** fix the failed check, regenerate tracked artifacts, recommit if source changed, and rerun. Never edit evidence fingerprints manually.

## Independent PR #39 Predecessor Review

- **Owner:** independent technical reviewer
- **Time:** 5 minutes for the packet, then substantive review time chosen by the reviewer.
- **Action:** open PR #39, verify head `45be650f48e422b05160821681ff40bb9f1229c9`, inspect its passing checks and `docs/review/P39_WHOLE_PR_INTEGRATION_SCOPE.md`, then submit an attributable GitHub review.
- **Verify:** the review binds PR #39 and its exact head. It cannot approve PR #40, merge, migration, or production.

## Independent PR #40 Delta Review

- **Owner:** independent technical reviewer
- **Time:** 10 minutes for the focused packet, plus any investigation.
- **Action:** open PR #40, verify its head equals `artifacts/release/scrimed-p34-release-manifest.json`, read `docs/review/P40_CURRENT_EXACT_HEAD_REVIEW_BRIEF.md`, inspect CRITICAL/HIGH entries in `artifacts/review/p40-current-risk-map.json`, and submit an attributable GitHub review.
- **Verify:** the decision binds PR #40, commit, tree, candidate, source, validation, review packet, gate packet, SBOM, and preview. An author self-review, issue comment, or Codex review cannot satisfy the human gate.
- **Recovery:** any source-head change makes the review stale; repeat against the new exact head.

## Exact Vercel Preview and Acceptance

- **Owner:** release steward
- **Time:** 3-5 minutes after Vercel reports READY
- **Prerequisite:** a branch preview for the exact follow-on commit, Node 24, no production alias, and the current candidate manifest.
- **Action:** set `TARGET_URL` to the exact HTTPS `.vercel.app` deployment and run `npm run scrimed:p34:verify-preview`. When Vercel Authentication protects the preview, also provide the temporary same-origin share URL as `SCRIMED_VERCEL_SHARE_URL` through the process environment. The verifier exchanges it for an in-memory cookie and never records either credential.
- **Expected result:** build identity, health, current-environment readiness, public/API smoke, desktop UI, and 390px mobile UI pass in synthetic/no-PHI preview mode.
- **Evidence:** `artifacts/release/p34-preview-verification.json`, the deployment ID/URL, and Vercel build metadata.
- **Verify:** the receipt says `NONPRODUCTION_PREVIEW_ACCEPTED`; production and customer authorities remain false.
- **Recovery:** do not alias or promote. Fix the feature branch and rerun certification, exact-head review, and preview verification if source changed.

## AAL2 Preview Verification

- **Owner:** authorized preview operator
- **Time:** 2-5 minutes
- **Prerequisite:** fresh AAL2 token, exact accepted preview origin, and exact clean candidate.
- **Action:** set `AAL2_TEST_TOKEN`, `TARGET_URL`, and `SCRIMED_AAL2_ALLOWED_PREVIEW_ORIGINS` in a secure shell; run `npm run scrimed:p34:aal2`; unset the token immediately afterward.
- **Expected result:** issuer/audience, candidate/preview binding, MFA/AAL2, fresh step-up, privileged route, replay rejection, and expiry checks pass.
- **Evidence:** redacted `artifacts/security/p40-aal2.json`; bearer credentials are never persisted.
- **Verify:** candidate and target match the exact preview manifest.
- **Recovery:** sign out, sign in, perform authenticator step-up, obtain a fresh token, and rerun. Missing credentials remain `OPERATOR_ACTION_REQUIRED`, not a test pass.

## Supabase Leaked-Password Protection

- **Owner:** Supabase project owner
- **Time:** 1-3 minutes
- **Action:** in Authentication settings for `scrimed-protected-pilot`, enable leaked-password protection only, save, then rerun Security Advisor.
- **Expected result:** the leaked-password warning clears.
- **Evidence:** non-sensitive advisor timestamp and finding status.
- **Verify:** use the fresh Security Advisor result, not only the toggle state.
- **Recovery:** if the setting is unavailable, confirm plan support or contact Supabase support. Do not change users, providers, redirects, RLS, roles, sessions, or migrations.

## Later Separately Controlled Actions

Protected-pilot authorization, merge, production migration, production deployment, customer
activation, live PHI, clinical autonomy, diagnosis, treatment, triage, payer submission,
EHR/device writeback, certification claims, contract signature, material pricing, and investor
artifact distribution require their own named approvals. A deliberately disabled capability is a
safe boundary, not a technical failure.
