# Proposed Commit Manifest

This is a review grouping, not a staged set. The bounded phase began from a clean candidate;
exact paths and hashes come from the final candidate manifest. The preserved governance-gates
script remains excluded, and current package contracts use the attributable preproduction
equivalent.

| Group | Proposed contents |
| --- | --- |
| Safety controls | P.32 control plane, technical gates, artifact admission, human governance, protected API boundaries |
| Agent orchestration | Agent teams, bounded delegation, review orchestrator, policy tests |
| Preproduction assurance | Risk-tier matrix, policy engine, founder acceptance, control attestations, confidence scoring, assurance generator |
| Model governance | Qualification passports, unverified-model admission, bounded effort/cost/fallback controls |
| Public claims | Homepage, legal, FaithCore, demos, validation copy and claims verifier |
| FaithCore | Canonical neutrality policy service, exact public/Wix copy, CTA, API/service regression coverage |
| Legal and compliance | Public-claims, intended-use, external-action, legal-review, founder-governance records |
| Database | Three pending migration files and their static authorization/config evidence |
| Forms | Pricing/demo/sales consent, scope, protected-handoff, and no-PHI controls |
| Wix | Existing policy/verifier plus operator and fresh-verification runbooks |
| Supabase | Auth security operator packet and protected synthetic evidence/review routes |
| CI/CD | CI contracts, generated integrity, cache hygiene, preview/mobile/dependency/migration checks |
| Tests | Nonsecret, policy, adversarial, authorization, model, review, public, and migration self-tests |
| Governance documentation | Architecture, release operations, packets, decision registers, runbooks |
| Generated evidence | Deliberate `artifacts/p32` evidence only; regenerate after immutable commit |

**Preserved and excluded:**
`scripts/scrimed-p32-consolidated-governance-gates.mjs` was present before this execution and
is not attributed to this commit. See `PREEXISTING_SCRIPT_ATTRIBUTION_DECISION.md`. The candidate
uses `scripts/scrimed-p32-preproduction-governance-gates.mjs`.

The current bounded phase also adds the candidate baseline and final Wix/Supabase operator packets.

## Exact Bounded Commit Contents

| Group | Exact paths |
| --- | --- |
| FaithCore safety and public messaging | `app/lib/faithCorePolicy.ts`, `app/faithcore/page.tsx`, `app/lib/legalPolicies.ts`, `app/lib/operatingMode.ts` |
| Public claims and Wix verification | `config/public-claims-policy.json`, `config/wix-publication-policy.json`, `scripts/lib/wix-publication-policy.mjs`, `scripts/wix-publication-verification.mjs`, `scripts/verify-public-release.mjs` |
| Tests and contracts | `scripts/faithcore-neutrality-policy-test.mjs`, `scripts/scrimed-nonsecret-test-suite.mjs`, `scripts/public-remediation-contract-check.mjs`, `scripts/preproduction-assurance-contract-check.mjs`, `package.json` |
| Wix and Supabase operator packets | `docs/WIX_PUBLICATION_VERIFICATION_REPORT.md`, `docs/operators/WIX_FAITHCORE_FINAL_ACTION.md`, `docs/operators/WIX_FULL_SITE_EXECUTION_PACKET.md`, `docs/operators/WIX_FINAL_EXECUTION_PACKET.md`, `docs/operators/SUPABASE_LEAKED_PASSWORD_PROTECTION.md` |
| Release attribution | `docs/release/CURRENT_CANDIDATE_BASELINE.md`, `docs/release/WORKTREE_ATTRIBUTION_REPORT.md`, `docs/release/PROPOSED_COMMIT_MANIFEST.md` |

No environment file, secret, cache, log, build output, screenshot, machine-specific artifact, or
unattributed file is included.

Recommended message after attribution and validation pass:
`feat(governance): finalize SCRIMED preproduction assurance candidate`
