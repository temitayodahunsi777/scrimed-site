# SCRIMED p.34 Clinical Operating System Control Matrix

| Control | Implementation | Local evidence | External dependency | State |
| --- | --- | --- | --- | --- |
| Contemporaneous governance | Canonical SHA-256 tenant ledger and query filters | Tamper and wrong-head tests | Durable append-only store review | local PASS |
| A0-A3 autonomy | Exact tier, class, reversibility, stop condition, and structural approval evaluation; execution authorization fixed false pending trusted atomic consumption | Missing, stale, mismatch, replay, escalation, and review-only exact-approval tests | Trusted approval store plus named policy owner | local PASS / execution BLOCKED |
| PHI field classification | Registry and startup validation | Missing and duplicate registration tests | Production schema inventory | local PASS / production BLOCKED |
| Reversible tokenization | Tenant/purpose/expiry-bound synthetic vault with trusted clock and one-use validator grants | Receipt integrity, untrusted validator, round-trip, and cross-tenant tests | Approved production vault, validator identity, and keys | local PASS / production BLOCKED |
| Egress boundary | PHI/secret scan, token receipts, route and BAA/product checks | Raw sensitive payload and PHI-route tests | Contractual/provider evidence | local PASS / PHI BLOCKED |
| Break glass | Independent approval, reason, incident, audit, TTL | Missing approver/audit test | IdP and incident workflow | local PASS / activation BLOCKED |
| Agent sandbox | Workspace policy, filesystem, egress, mounts, credentials, resources, cleanup; runtime authorization fixed false | Direct/DNS/proxy/loopback, path-alias, escalation, and review-only admission tests | Canonical/open-time containment adapter and production sandbox review | policy PASS / runtime BLOCKED |
| Context retrieval | Authenticated tenant/purpose context, aliases, freshness, authority, rerank, citations, conflicts | Caller-selected tenant, stale, ambiguity, conflict tests | Approved identity context, indexes, and terminology licenses | local PASS |
| External validation | Multisite/system/device/cohort/subgroup/time/distribution evidence | Internal-only and worst-cell denial tests | Independent sites and named reviewers | BLOCKED |
| Oversight drift | Review, error volume, silent acceptance, latency, cohort coverage | Reduction-without-approval test | Named oversight authorization | local PASS |
| Two-loop ratchet | Existing p.34 fixed-suite and privacy-safe online metrics | Existing p.34 regression suite | Independent promotion review | local PASS / promotion BLOCKED |
| Model fit | Existing deterministic-first registry, local evidence, safe fallback | Existing p.34 route/failover tests | Provider contracts and local model runs | local PASS / providers BLOCKED |
| Patient Take-Home | Cited approved facts, preferences, proxy scope, clinician review | Pending-review and unsupported-fact tests | Delivery channel and clinical policy | preview PASS / delivery BLOCKED |
| Medical coding | Assisted mode, evidence, rule owner/version, rollback, review | Autonomous-mode denial test | Qualified coding and billing authorization | draft PASS / submission BLOCKED |
| Operations recovery | Idempotency, checkpoint, bounded retry, dead letter, suspension | Retry, exhaustion, duplicate tests | Durable queue/recovery store | local PASS |
| Public claims | Structural evidence metadata, owner, wording, primary sources, limits, approval, expiry; publication fixed false | Unsupported and structurally valid-but-untrusted claim tests | Trusted evidence lookup, counsel, and named publication approval | review PASS / publication BLOCKED |
| Product console | Existing p.34 and product pages plus read-only catch-all APIs | Contract, build, browser checks | Named reviewer | pending final validation |

No row marked local PASS authorizes PHI, clinical action, external provider use, billing, system-of-record writes, migration, deployment, customer activation, certification, or external distribution.
