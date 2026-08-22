# p.34 Gap-Closure Threat Model

| Threat | Control | Local result |
| --- | --- | --- |
| Approval spoofing or replay | Exact binding, deterministic signature verification, trusted clock, one in-process synthetic store | denied inside the self-test; durable cross-request protection remains unavailable |
| Candidate or environment substitution | Candidate and environment are part of evidence and approval bindings | denied |
| Caller clock manipulation or malformed time policy | Server-owned clock; strict UTC timestamp parser; finite, nonnegative age and skew policy | denied |
| Stale evidence reuse | Candidate-bound expiry primitive and ordered regeneration requirement | denied in fixed-clock fixtures; exact-candidate evidence remains an external release artifact |
| Autonomy or maturity escalation | A0/A1 write prohibition, A2 review, A3 unavailable, `REVIEW_READY` ceiling | denied |
| PHI, secret, credential, unknown, cyclic, or oversized egress | Explicit classification, bounded scanner, diagnostic redaction, fail-closed unknown state | denied |
| Tenant, tool, model, or jurisdiction drift | Complete declaration and allowlist comparison before policy decision | denied |
| Runtime values bypass TypeScript policy unions | Runtime schema and enum validation before every decision | denied |
| Kill-switch bypass | `READ_ONLY` default; `HALTED` blocks every new action; execution authority fixed false | denied |
| Unbound review-state promotion | Exact-candidate release ceiling blocks all transitions beyond `EXACT_REVIEW_REQUIRED` | denied |
| Sensitive metadata mislabeled as a safe trace | Bounded identifiers, nonempty SHA-256 evidence, finite telemetry | denied |
| Model substitution, policy mutation, retry storm, delegation drift | Oversight Sentinel incident and containment recommendation | detected, never authorized |
| Audit tampering | SHA-256 evidence and trace receipts; existing ledger chaining retained | detected by verification |

Residual risks are external: no durable trusted approval store, no exact-candidate approval verification, no fresh AAL2 receipt, no external review, no disposable migration run, and no authorized deployment environment. These remain operator gates.
