# SCRIMED p.34 Autonomy And Approval Contract

## Tiers

| Tier | Permitted local candidate behavior | Required authority |
| --- | --- | --- |
| A0 | Information and display only | Authenticated, tenant-scoped read policy |
| A1 | Draft or recommendation | Named accountable party; no mutation |
| A2 | Review of a proposed reversible synthetic internal action | Exact deterministic approval plus trusted-store verification and atomic consumption before any future execution adapter |
| A3 | Review of a proposed bounded low-risk reversible synthetic action | Explicit A3 policy plus exact approval, trusted-store verification, and atomic consumption; no external or clinical action |

Clinical decisions, medication or order actions, patient-result release, billing or payer submission, external communication, destructive changes, permission changes, and system-of-record writes cannot execute in this candidate.

## Exact Approval Binding

An A2/A3 approval is structurally eligible for verification only when it matches:

- tenant;
- authenticated actor and distinct approver;
- action identifier and action class;
- target resource;
- canonical payload hash;
- idempotency key;
- policy version;
- authority scope;
- issue and expiry time;
- approval evidence hash;
- unused approval identifier.

Missing approval returns `REQUIRE_HUMAN` and grants at most A1. A structurally exact approval also remains `REQUIRE_HUMAN` and grants at most A1 until a trusted approval store verifies and atomically consumes it. Stale, replayed, self-issued, cross-tenant, mismatched, out-of-scope, nonreversible, non-synthetic, or policy-exceeding requests return `BLOCK` and grant A0. The local candidate has no execution-authorizing approval store.

## Stopping And Rollback

Every request declares a stopping condition. Any future A2/A3 adapter must stop after its bounded receipt is verified, a policy/evidence/tool check fails, the approval expires, the budget is exhausted, or cancellation is observed. The local candidate stops at review. The action-maturity chain records rollback readiness and disposition. External write authority and clinical authority remain fixed false.

## Operator Review

The p.34 console exposes requested and granted tier, accountable party digest, authorization state, stopping condition, decision reasons, and evidence hash. Approval of source code is not an execution approval.
