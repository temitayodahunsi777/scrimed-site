# Proposed Commit Manifest

This is a review grouping, not a staged set. Exact paths and hashes come from the final worktree
attribution JSON. The pre-existing untracked governance-gates script remains excluded; current
package contracts use the newly attributable preproduction equivalent.

| Group | Proposed contents |
| --- | --- |
| Safety controls | P.32 control plane, technical gates, artifact admission, human governance, protected API boundaries |
| Agent orchestration | Agent teams, bounded delegation, review orchestrator, policy tests |
| Preproduction assurance | Risk-tier matrix, policy engine, founder acceptance, control attestations, confidence scoring, assurance generator |
| Model governance | Qualification passports, unverified-model admission, bounded effort/cost/fallback controls |
| Public claims | Homepage, legal, FaithCore, demos, validation copy and claims verifier |
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

Recommended message after attribution is resolved and validation passes:
`feat(governance): establish risk-tiered preproduction assurance framework`
