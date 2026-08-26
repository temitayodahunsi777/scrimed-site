# PR #39 Review Map

Status: **EXACT_REVIEW_REQUIRED**

Files explained: **314/314**

Unexpected files: **0**

Direct p.34 lineage: **89**

Inherited canonical lineage: **225**

Map SHA-256: `84e8c41fea5662b81e6fcabde4643e0295cb09913e4ccb3beaf79927c427d720`

The source inventory came from GitHub PR #39 and is augmented with the exact local delta from the authoritative p.34 base. Primary classifications identify generated evidence, tests, and documentation; the separate lineage field preserves direct-versus-inherited provenance.

| Group | Files | Risk | Priority | Owner | Tests | Evidence |
| --- | ---: | --- | --- | --- | --- | --- |
| governance | 90 | moderate | P2 | governance-owner | strict candidate; policy and contract suites | candidate manifest; gate packet |
| clinical operating system | 42 | high | P0 | clinical-safety-reviewer | p.34 clinical OS; nonsecret safety suite | p.34 validation report; clinical safety packet |
| security | 17 | high | P0 | security-reviewer | secret scan; CodeQL; security policy tests | security evidence; SBOM |
| approvals | 32 | high | P0 | independent-technical-reviewer | atomic approval; replay and stale evidence tests | review packet; approval receipts |
| evidence | 24 | moderate | P1 | evidence-owner | generated integrity; evidence expiry | validation fingerprint; artifact hashes |
| tenant isolation | 1 | high | P0 | privacy-security-reviewer | cross-tenant negative tests; RLS contracts | tenant isolation receipts; Supabase advisory |
| egress | 1 | high | P0 | security-reviewer | egress firewall; provider-call denial | egress decision receipts |
| model routing | 4 | high | P1 | model-governance-reviewer | provider conformance; no eligible route | routing rationale; model registry |
| agents | 5 | high | P1 | agent-runtime-reviewer | agent authorization; bounded retry | agent trace; capability receipts |
| migrations | 4 | critical | P0 | database-migration-owner | 87-migration disposable replay; forward/recovery fingerprint | migration packet; production-unapplied state |
| Vercel | 34 | high | P0 | release-platform-reviewer | Node 24 certification; preview validation | preview deployment evidence; build fingerprint |
| Supabase | 4 | high | P0 | supabase-project-owner | security advisor; RLS contracts | live advisory result; migration state |
| Product Console | 2 | moderate | P1 | product-owner | route contract; desktop and mobile browser checks | UI verification; API response |
| public claims | 7 | high | P0 | claims-and-legal-reviewer | public claims contract; prohibited string scan | claims register; published surface smoke |
| commercial controls | 47 | moderate | P1 | commercial-and-finance-reviewer | synthetic pilot policy; commercial authority contract | pilot evidence pack; nonbinding pricing posture |

## Classification Counts

- P34_DIRECT: 28
- INHERITED_CANONICAL: 74
- GENERATED_EVIDENCE: 16
- TEST: 89
- DOCUMENTATION: 107
- LEGACY_SUPERSEDED: 0
- UNEXPECTED: 0

## Review Sequence

1. Review P0 groups and all P34_DIRECT lineage files.
2. Confirm generated evidence and tests bind to the same source tree.
3. Sample inherited canonical files by group and follow their predecessor evidence.
4. Record an independent exact-head decision outside this generated map.

## Boundary

Review compression only. This map does not approve, merge, deploy, migrate, authorize PHI or clinical activity, activate a customer, or satisfy independent human review.
