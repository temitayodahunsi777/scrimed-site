# p.34 Final Synthetic Canonical State

Status: **P34 EXACT-HEAD REVIEW PREPARATION / SYNTHETIC NO-PHI ONLY**

## Exact Source of Truth

The post-commit exact commit, tree, candidate, source, validation, review packet, gate packet, SBOM, security, certification, migration, route, render, preview, and AAL2 bindings live in `artifacts/release/scrimed-p34-release-manifest.json`. That ignored artifact is regenerated after source freeze to avoid a self-referential tracked commit.

## Verified Starting State

The correction wave began from clean synchronized commit `dabe42112f3c6e93a6b3f14b13856c79b210a147` on `agent/scrimed-p34-post-review-readiness`. PR #40 is the current review target; PR #39 remains predecessor evidence. No genuine independent human approval was present at discovery. The exact dabe preview was READY, Node 24, nonproduction, and carried no production alias.

## Current Gate Semantics

| Control | State |
| --- | --- |
| Local automated assurance | AUTOMATED_ASSURANCE_COMPLETE after final certification |
| Human exact-head review | EXACT_REVIEW_REQUIRED |
| Supabase passwordless protected access | COMPENSATING_CONTROL_ACTIVE while evidence is current |
| Supabase leaked-password feature | DEFERRED_PLATFORM_CONTROL; warning open |
| Password auth without verified leaked-password control | DENY |
| Fresh candidate-bound AAL2 | OPERATOR_ACTION_REQUIRED |
| Three pending migrations | STATIC_READY / DISPOSABLE_REPLAY_PASSED / PRODUCTION_UNAPPLIED |
| Exact nonproduction preview | exact-head verification required after any source change |
| Protected pilot | PROTECTED_PILOT_AUTHORIZATION_REQUIRED |
| Merge | MERGE_AUTHORIZATION_REQUIRED |
| Production | PRODUCTION_AUTHORIZATION_REQUIRED |
| Customer activation | CUSTOMER_ACTIVATION_REQUIRED |

## Commercial Lane

Workflow Intelligence Assessment, Enterprise AI Governance Pilot, and RCM Workflow Intelligence Pilot are the only prioritized external wedges. They remain nonbinding, synthetic/no-PHI, nonclinical, human-controlled, and evidence-labeled. Protected and operating tiers remain custom enterprise scope.

## Absolute Boundary

No production deployment or alias, production migration, PHI, live patient data, clinical autonomy, diagnosis, treatment, triage, payer submission, EHR/device writeback, protected-pilot activation, customer activation, compliance/certification claim, partnership claim, merge, or external distribution is authorized.
