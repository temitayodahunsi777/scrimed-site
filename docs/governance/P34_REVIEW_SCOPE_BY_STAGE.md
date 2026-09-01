# p.34 Review Scope by Stage

Review burden follows actual exposure. A synthetic/no-PHI workflow does not become clinical merely because it is healthcare-adjacent.

| Stage | Required review | Not implied |
| --- | --- | --- |
| Public demo | Claims/content owner; technical owner for executable surfaces | Clinical activation, PHI, production, customer approval |
| Synthetic/no-PHI assessment or pilot | Independent technical review, named operational owner, commercial approval for any proposal | Clinical activation review when there is no clinical effect; protected deployment |
| Protected pilot preparation | Targeted security, privacy, legal, clinical, database, integration, and insurance review according to scope | Activation, production migration, customer go-live |
| Production candidate | Full release-specific technical, clinical, legal/claims, privacy, security, database, operations, customer, and deployment approval | Certification or compliance status beyond documentary evidence |

## Rules

- PR #39 and PR #40 each require exact-head independent review.
- Automated cumulative assurance never substitutes for human review.
- Clinical review is mandatory before patient-specific clinical effect, but is not a blocker for bounded synthetic/no-PHI workflow analysis with no clinical effect.
- Protected-pilot preparation grants no activation. Production and customer go-live remain distinct gates.
- Any claim, evidence, or scope change may add a targeted specialist review; it may not silently remove one.

This document scopes review only. It grants no merge, migration, deployment, PHI, clinical, payer, EHR/device, contract, customer, or distribution authority.
