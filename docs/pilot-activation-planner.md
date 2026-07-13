# SCRIMED Pilot Activation Planner

SCRIMED Pilot Activation Planner turns synthetic pilot value evidence into review-gated activation plans, prerequisites, owners, blockers, handoffs, and success criteria.

It exists to move buyers from interest to a controlled pilot path without granting customer go-live, production, PHI, payer, EHR, legal, financial, or clinical authority.

## What It Adds

- Activation steps for buyer qualification, commercial scope, security review, data governance, clinical governance, integration readiness, implementation operations, and success review.
- Activation plans for workflow discovery, RCM documentation, patient access, interoperability diligence, and investor diligence.
- Blocker workarounds for missing buyer owners, premature PHI requests, clinical authority gaps, payer action gaps, production connector gaps, and commercial overclaims.
- Handoff packets for scope calls, security review, implementation kickoff, and success review.
- Authority headers for customer activation, legal review, commercial offers, PHI, payer actions, EHR writeback, ROI, revenue, production, and clinical care.

## Safety Boundary

This is synthetic-only pilot activation planning. It does not authorize live PHI, autonomous clinical care, diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, final imaging interpretation, production deployment, customer activation, certification claims, audited financial reporting, valuation assurance, revenue guarantees, profit guarantees, ROI guarantees, binding commercial offers, or legal/procurement approval.

## Routes

- Page: `/pilot-activation-planner`
- API: `/api/pilot-activation-planner`
- Brief: `/api/pilot-activation-planner/brief`

## Validation

Run:

```bash
npm run smoke:pilot-activation-planner
npm run test:nonsecret
npm run smoke:public
```

The smoke checks verify route wiring, authority headers, Product Console proof-stack integration, activation blockers, handoff coverage, and no-go boundaries.
