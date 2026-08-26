# p.34 Autonomy Model

| Level | Permitted locally | Execution authority |
| --- | --- | --- |
| A0 | Observe and display bounded synthetic evidence | none |
| A1 | Recommend with evidence and human accountability | none |
| A2 | Prepare a reversible synthetic internal action for named review | none |
| A3 | Structurally modeled only | unavailable in the current candidate |

A0 and A1 cannot mutate. A2 remains `REQUIRE_HUMAN`. A3 is denied. Clinical, PHI, payer, EHR/device, production, customer, and distribution actions are blocked independently of tier.

Capability maturity is separate from action lifecycle. The current evidence ceiling is `REVIEW_READY`; UI and APIs must not imply `PILOT_READY`, `PRODUCTION_CANDIDATE`, or `AUTHORIZED_PRODUCTION`.
