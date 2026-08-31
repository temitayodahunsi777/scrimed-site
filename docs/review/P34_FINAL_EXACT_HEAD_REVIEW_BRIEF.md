# p.34 Final Exact-Head Review Brief

Target reading time: **10 minutes or less**

1. **Exact candidate:** compare PR #40 head with every binding in `artifacts/release/scrimed-p34-release-manifest.json`; stop on any mismatch.
2. **Delta:** review `artifacts/review/p34-final-risk-ranked-diff.json` in CRITICAL, HIGH, MEDIUM, LOW, GENERATED, DOCS order.
3. **Highest-risk files:** start with pilot manifest/operating system, cost governor, exact-head review, preview acceptance, passwordless assurance, protected authorization, and migration controls.
4. **Autonomy boundaries:** A3 clinical autonomy, diagnosis, treatment, triage, payer submission, and EHR/device writes remain denied.
5. **Tenant isolation:** verify tenant membership and role checks precede protected reads/writes; cross-tenant evidence remains denied.
6. **Approval logic:** approvals are exact-candidate, scoped, expiring, one-use, and cannot self-authorize, replay, merge, deploy, or activate a customer.
7. **PHI egress:** no raw PHI, secrets, OTPs, or tokens enter logs, evidence, snapshots, provider calls, or public artifacts.
8. **Supabase:** confirm `COMPENSATING_CONTROL_ACTIVE` for the passwordless lane, `DEFERRED_PLATFORM_CONTROL` for the warning, and fail-closed password-auth invariant.
9. **AAL2:** fresh exact-preview operator evidence remains `OPERATOR_ACTION_REQUIRED`; no token may be persisted.
10. **Migrations:** three files are checksum-bound, statically ready, disposable-replay tested, production-unapplied, and separately authorized.
11. **Vercel preview:** require exact commit/tree/candidate, Node 24, READY, desktop and 390px checks, public smoke, protected denial, and no production alias.
12. **Synthetic pilot:** verify NO_PHI, NONPRODUCTION, declared success criteria, immutable evidence, cost ceilings, HALT_SAFE, and no customer-system writes.
13. **Commercial authority:** agents may draft and analyze only; they cannot sign, discount, promise dates, accept terms, activate protected work, or distribute artifacts.
14. **Unresolved gates:** human review, AAL2, release-steward preview acceptance, merge, production migration/deployment, protected pilot, customer activation, and external distribution remain separate.
15. **Decision:** record exactly one attributable outcome against the exact head: `APPROVE_EXACT_HEAD`, `REQUEST_CHANGES`, or `REJECT`. Approval grants review evidence only.
