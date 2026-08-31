# SCRIMED Enterprise Diligence Index

Status: **PRIVATE INTERNAL INDEX / EXTERNAL DISTRIBUTION AUTHORIZATION REQUIRED**

| Topic | Evidence source | Current classification |
| --- | --- | --- |
| Architecture and trust boundaries | `docs/scrimed-systems-map.md`, `docs/architecture/` | BUILT |
| Threat model and security baseline | `SECURITY.md`, `docs/security/`, canonical manifest security fingerprint | BUILT / LOCALLY VALIDATED |
| SBOM and dependencies | canonical manifest SBOM fingerprint, Node 24 certification | LOCALLY VALIDATED |
| Release and review process | `docs/review/P34_STACKED_REVIEW_PLAN.md`, `docs/operators/P34_OPERATOR_COMMAND_CENTER.md` | REVIEW REQUIRED |
| Model and agent governance | Product Console, model/agent registries, p.34 gate artifacts | VALIDATED SYNTHETIC |
| Tenant and PHI boundaries | RLS contracts, no-PHI policy tests, protected-route denial tests | VALIDATED SYNTHETIC |
| Migration state | `docs/operators/MIGRATION_DRY_RUN_OPERATOR_PACKET.md` | DISPOSABLE EVIDENCE / PRODUCTION UNAPPLIED |
| AAL2 | `docs/operators/P34_OPERATOR_COMMAND_CENTER.md` | OPERATOR ACTION REQUIRED |
| Supabase Auth posture | `docs/operators/SUPABASE_LEAKED_PASSWORD_CLOSEOUT.md` | OPERATOR ACTION REQUIRED |
| Pilot controls and economics | `/synthetic-pilot`, `docs/P34_SYNTHETIC_PILOT_OPERATING_SYSTEM.md` | VALIDATED SYNTHETIC |
| Incident and continuity model | Trust Safety Operations and release-continuity evidence routes | BUILT / SYNTHETIC |
| Commercial authority | pricing policy, proposal gates, insurance register | HUMAN AUTHORITY REQUIRED |

This index may prepare a qualified diligence room. It does not authorize sending artifacts, claim compliance, process PHI, activate a customer, or represent production readiness.
