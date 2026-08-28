# p.34 Operator Command Center

This packet starts only after the focused follow-on branch is pushed. PR #39 and its deployment are
predecessor evidence; they cannot approve or accept the current candidate. None of these actions
grants merge, migration, production, PHI, clinical, payer, EHR/device, customer, contract, or
external-distribution authority.

## Machine Evidence and Certification

- **Owner:** release steward
- **Time:** 1-5 minutes after the source is stable
- **Action:** run `npm run scrimed:p34:certify`, then `npm run scrimed:p34:evidence`.
- **Input:** the clean exact follow-on commit and predecessor base `45be650f48e422b05160821681ff40bb9f1229c9`.
- **Evidence:** ignored runtime files `artifacts/release/p34-certification.json` and `artifacts/release/p34-current-candidate.json`.
- **Verify:** candidate, commit, tree, source, validation, review packet, gate packet, SBOM, route inventory, and generation inventory agree. Certification from any other candidate is marked stale.
- **Recovery:** fix the failed check, regenerate tracked artifacts, recommit if source changed, and rerun. Never edit evidence fingerprints manually.

## Independent Exact-Head Review

- **Owner:** independent technical reviewer
- **Time:** 10-15 minutes
- **Prerequisite:** the new follow-on PR URL, exact candidate manifest, review brief, integration map, validation packet, gate packet, and SBOM all bind one source tree.
- **Action:** open the new follow-on PR, not PR #39; confirm its head equals the manifest commit; review `docs/review/P34_REVIEW_BRIEF.md`; inspect checks; submit an attributable GitHub review against that exact head.
- **Expected result:** a trusted external review receipt matching PR, commit, tree, candidate, source, validation, review packet, gate packet, SBOM, and preview when applicable.
- **Verify:** `APPROVED_EXACT_HEAD` is possible only after the receipt signature and single-use approval are verified. An issue comment, author self-review, environment flag, or predecessor review cannot satisfy this gate.
- **Recovery:** any source-head change makes the review stale; repeat against the new exact head.

## Exact Vercel Preview and Acceptance

- **Owner:** release steward
- **Time:** 3-5 minutes after Vercel reports READY
- **Prerequisite:** a branch preview for the exact follow-on commit, Node 24, no production alias, and the current candidate manifest.
- **Action:** set `TARGET_URL` to the exact HTTPS `.vercel.app` deployment and run `npm run scrimed:p34:verify-preview`.
- **Expected result:** build identity, health, current-environment readiness, public/API smoke, desktop UI, and 390px mobile UI pass in synthetic/no-PHI preview mode.
- **Evidence:** `artifacts/release/p34-preview-verification.json`, the deployment ID/URL, and Vercel build metadata.
- **Verify:** the receipt says `NONPRODUCTION_PREVIEW_ACCEPTED`; production and customer authorities remain false.
- **Recovery:** do not alias or promote. Fix the feature branch and rerun certification, exact-head review, and preview verification if source changed.

## AAL2 Preview Verification

- **Owner:** authorized preview operator
- **Time:** 2-5 minutes
- **Prerequisite:** fresh AAL2 token, exact accepted preview origin, and exact clean candidate.
- **Action:** set `AAL2_TEST_TOKEN`, `TARGET_URL`, and `SCRIMED_AAL2_ALLOWED_PREVIEW_ORIGINS` in a secure shell; run `npm run verify:aal2:candidate:evidence`; unset the token immediately afterward.
- **Expected result:** issuer/audience, candidate/preview binding, MFA/AAL2, fresh step-up, privileged route, replay rejection, and expiry checks pass.
- **Evidence:** redacted `artifacts/security/p34-aal2-evidence.json`; bearer credentials are never persisted.
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
