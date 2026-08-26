# ADR: p.33 Portable Agent Routing

Status: accepted for local synthetic implementation.

Decision: route portable agent tasks only after capability, risk, data locality, qualification, availability, evidence, and budget admission. Rank eligible routes by task fit, groundedness, tool reliability, latency, and total task cost. Return explicit safe refusal when no route qualifies.

Consequences:

- Provider and model IDs remain outside clinical business logic.
- Silent fallback and safety-tier downgrade are prohibited.
- The local worker requires deny-by-default network, bounded filesystem roots, tool allowlists, sandboxing, resource limits, task identity, capability lease, and an armed kill switch.
- Confidential-compute fields describe evidence state without claiming hardware support.

Rejected: routing on token price alone, vendor marketing, public leaderboards, or an unverified model profile.
