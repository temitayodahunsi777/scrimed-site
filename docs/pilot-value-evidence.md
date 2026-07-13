# SCRIMED Pilot Value Evidence

SCRIMED Pilot Value Evidence packages synthetic value metrics into buyer-ready evidence packets with acceptance criteria, reviewer checkpoints, audit hashes, and claim controls.

It helps SCRIMED sell and explain pilots with more confidence while preserving all safety, financial, clinical, and production authority boundaries.

## What It Adds

- Evidence artifacts for workflow baselines, prior authorization documentation, referral delay, interoperability readiness, agent trace diligence, patient education, operations capacity, and investor proof.
- Evidence packets for workflow discovery, RCM documentation, patient access, interoperability diligence, and investor diligence.
- Reviewer checkpoints for clinical, finance, payer, connector, and distribution boundaries.
- Claim controls that replace unsafe claims with safe, evidence-backed language.

## Safety Boundary

This is synthetic-only pilot value evidence. It does not authorize live PHI, autonomous clinical care, diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, final imaging interpretation, production deployment, customer activation, certification claims, audited financial reporting, valuation assurance, revenue guarantees, profit guarantees, ROI guarantees, or binding commercial offers.

## Routes

- Page: `/pilot-value-evidence`
- API: `/api/pilot-value-evidence`
- Brief: `/api/pilot-value-evidence/brief`

## Validation

Run:

```bash
npm run smoke:pilot-value-evidence
npm run test:nonsecret
npm run smoke:public
```

The smoke checks verify route wiring, authority headers, Product Console proof-stack integration, claim controls, and the no-ROI/no-customer-activation boundaries.
