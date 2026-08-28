# p.34 Operator Command Center

Use these bounded actions only after the final exact candidate is pushed. Every action is separate; none grants merge or production authority.

## Independent Exact-Head Review

- **Owner:** independent technical reviewer
- **Prerequisite:** final PR #39 head, review map, validation packet, gate packet, and SBOM all bind to one source tree
- **Steps:** open PR #39; confirm the exact head; review P0 and direct-lineage groups; inspect check results; submit a GitHub review against that exact head
- **Expected result:** one externally attributable review decision, not an issue comment or author self-review
- **Verify:** inspect PR reviews and confirm the reviewed commit matches the current head
- **Evidence:** GitHub review record plus exact candidate packet
- **Recovery:** if the head changes, treat the review as stale and repeat against the new head

## AAL2 Preview Verification

- **Owner:** authorized preview operator
- **Prerequisite:** fresh AAL2 token, final nonproduction preview URL, an exact-origin allowlist from the approved preview deployment record, exact clean local candidate
- **Steps:** set `AAL2_TEST_TOKEN`, `TARGET_URL`, and `SCRIMED_AAL2_ALLOWED_PREVIEW_ORIGINS` in the secure shell session; the target must exactly match one comma-delimited allowlist origin. Run `npm run verify:aal2:candidate:evidence`; unset the token after completion.
- **Expected result:** candidate/preview binding, AAL2 and fresh step-up checks, protected endpoint verification, local replay guard, and stale-token policy rejection pass
- **Verify:** inspect the redacted JSON receipt; no raw token is written
- **Evidence:** `artifacts/security/p34-aal2-evidence.json`, containing only candidate, target, assurance result, timestamp, test dispositions, and evidence hash
- **Recovery:** sign out, sign in, complete authenticator step-up, refresh the preview token, and rerun

## Supabase Leaked-Password Protection

- **Owner:** Supabase project owner
- **Prerequisite:** Supabase dashboard access with project-owner authority
- **Steps:** open Authentication settings for `scrimed-protected-pilot`; enable leaked-password protection only; save; rerun Security Advisor
- **Expected result:** the leaked-password warning clears
- **Verify:** fresh Security Advisor result; do not rely on a screenshot of the toggle alone
- **Evidence:** non-sensitive advisor timestamp and finding status
- **Recovery:** if unavailable, confirm plan support and contact Supabase support; do not change users, providers, redirects, RLS, roles, sessions, or migrations

## Gated Preview Acceptance

- **Owner:** release steward
- **Prerequisite:** final preview is READY, exact-head checks pass, no production alias, independent review state is current
- **Steps:** run the preview smoke and browser checks from `docs/review/P34_PREVIEW_ACCEPTANCE_PACKET.md`; inspect Vercel logs; record the exact deployment and candidate
- **Expected result:** desktop and 390px mobile routes pass; protected writes fail closed; no 5xx, crash, retry storm, PHI, or public-claim regression appears
- **Verify:** `npm run verify:vercel-preview` and the p.34 post-preview evidence receipt
- **Evidence:** Vercel deployment evidence and browser verification
- **Recovery:** do not alias or promote; fix on the feature branch, rebuild, and repeat exact-head review if source changed

## Retained Boundaries

Production deployment, production migration, live PHI, A3 autonomy, diagnosis, treatment, triage, payer action, EHR/device writeback, provider/customer activation, certification claims, and external investor distribution remain separately prohibited.
