# p.34 Operator Command Center

This packet operates on frozen PR #40 exact head
`a7cfd5d4ad851199261d001a51aabba012aab93b`. PR #39 is historical predecessor evidence, not the
current approval target. The documentation-only follow-on branch must not be substituted for the
frozen candidate unless a separate candidate cycle is intentionally authorized.

None of these actions grants merge, migration, production, PHI, clinical, payer, EHR/device,
provider, protected-pilot, customer, contract, certification, compliance, or external-distribution
authority.

## Remaining Human Actions

1. Independent review of PR #40 exact head.
2. Fresh candidate-bound AAL2 verification.
3. Release-steward acceptance of the exact nonproduction preview.
4. Later, separate merge, protected-pilot, migration, production, customer, and distribution decisions.

Supabase leaked-password protection is a `DEFERRED_PLATFORM_CONTROL`, not a current operator closeout
on the Free plan. Passwordless compensating controls remain active and password-based protected
authentication remains denied until the upstream control is verified.

## Independent PR #40 Review

- **Owner:** independent technical reviewer
- **Time:** 10 minutes for the focused packet, plus any investigation
- **Action:** follow `docs/operators/INDEPENDENT_REVIEWER_REQUIRED.md`, verify PR #40 exact head, and
  submit an attributable GitHub review.
- **Verify:** the decision binds PR #40, commit, tree, candidate, source, validation, review packet,
  gate packet, SBOM, and preview. An author self-review, founder acceptance, issue comment, or
  automated review cannot satisfy the gate.
- **Recovery:** any source-tree change makes the approval stale; repeat against the new exact head.

## Exact Vercel Preview Acceptance

- **Owner:** release steward
- **Time:** 3 minutes or less after Vercel reports READY
- **Prerequisite:** exact deployment, Node 24, no production alias, and the frozen candidate manifest
- **Action:** follow `docs/operators/P34_PREVIEW_ACCEPTANCE.md`.
- **Expected result:** `NONPRODUCTION_PREVIEW_ACCEPTED`.
- **Evidence:** `artifacts/release/p34-preview-verification.json`, preview observability, deployment
  metadata, and an attributable release-steward acceptance.
- **Recovery:** do not alias or promote. Fix on a follow-on branch, then repeat candidate review and
  preview acceptance if source changes.

## AAL2 Preview Verification

- **Owner:** authorized preview operator
- **Time:** 2-5 minutes
- **Prerequisite:** fresh AAL2 token, exact preview origin, and a clean checkout of the frozen candidate
- **Action:** export `AAL2_TEST_TOKEN`, `TARGET_URL`, and
  `SCRIMED_AAL2_ALLOWED_PREVIEW_ORIGINS` in a secure shell; run `npm run scrimed:p34:aal2`; unset the
  token immediately afterward.
- **Expected result:** issuer/audience, candidate/preview binding, MFA/AAL2, fresh step-up, tenant and
  role authorization, privileged route, replay rejection, and expiry checks pass.
- **Evidence:** redacted `artifacts/security/p40-aal2.json`, promoted by the evidence process to
  `artifacts/security/p34-aal2-final.json`; bearer credentials are never persisted.
- **Recovery:** sign out, sign in, perform authenticator step-up, obtain a fresh token, and rerun.
  Missing credentials remain `OPERATOR_ACTION_REQUIRED`, not a test pass.

## Supabase Password Security

- **State:** `COMPENSATING_CONTROL_ACTIVE` and `DEFERRED_PLATFORM_CONTROL`
- **Current action:** keep password auth disabled for protected paths and periodically re-observe the
  passwordless controls and Security Advisor state.
- **Activation trigger:** if the plan exposes leaked-password protection or a password-based protected
  path is proposed, enable and verify the platform control before that path can proceed.
- **Evidence:** `docs/security/SUPABASE_FREE_PLAN_PASSWORDLESS_COMPENSATING_CONTROLS.md` and
  `docs/operators/SUPABASE_PASSWORD_SECURITY_CLOSURE.md`.
- **Invariant:** password auth plus anything other than verified leaked-password protection denies
  protected production authentication.

## Migrations

The three checksum-bound migrations remain `STATIC_READY` and `PRODUCTION_UNAPPLIED`. Do not apply
them under this packet. Production application requires a separate database-owner authorization
bound to the exact migration and candidate fingerprints.

## Later Separately Controlled Actions

Protected-pilot authorization, merge, production migration, production deployment, customer
activation, live PHI, clinical autonomy, diagnosis, treatment, triage, payer submission,
EHR/device writeback, certification or compliance claims, contract signature, material pricing,
and investor artifact distribution require their own named approvals. A deliberately disabled
capability is a safe boundary, not a technical failure.
