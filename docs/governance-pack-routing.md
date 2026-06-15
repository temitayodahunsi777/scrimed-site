# SCRIMED Governance Pack Routing

Updated: 2026-06-15

## Status

Governance pack routing is active for new enterprise pilot intake submissions.

The router is deterministic and does not use an LLM. It maps buyer segment, offer interest, workflow targets, readiness needs, governance requirements, organization size, and region into one selected governance workflow pack.

## Product Boundary

Governance packs remain synthetic pilot and enterprise evaluation operating templates. They are not legal advice, privacy advice, security certification, HIPAA certification, SOC 2 certification, FDA clearance, payer approval, reimbursement assurance, breach determination, or production authorization.

## Routing Rules

- Research, trial, oncology, or eligibility signals route to `trialcore-research-legal-hold`.
- Government, public-health, ministry, or sovereignty signals route to `public-sector-sovereign-retention`.
- Payer, prior-authorization, claims, denial, or RCM signals route to `payer-rcm-incident-export`.
- Enterprise, HIPAA-readiness, security-review, BAA/DPA, or role-based-access signals route to `enterprise-baa-dpa-readiness`.
- Provider and clinic operations pilots default to `provider-operations-retention-review`.

## Where The Selection Appears

- Buyer intake API response: `assessment.governanceWorkflowPack`.
- Durable intake payload: `governance.workflowPack`.
- Governance ledger metadata seed: `governance.routing.governanceLedgerMetadata`.
- Sales Operations dashboard: opportunity detail and opportunity list context.
- Audited opportunity proposal: Governance Workflow Pack section.
- CRM CSV export: governance pack name, slug, status, and routing reason.
- CRM webhook payload: `governanceWorkflowPack` and `governanceRouting`.
- Calendar invitation and follow-up draft: selected governance pack context.

## Operating Use

1. Buyer submits a no-PHI pilot intake.
2. SCRIMED validates the intake, blocks PHI-style content, and builds the assessment.
3. The deterministic router selects a governance workflow pack.
4. Sales Operations inherits the selected pack through the durable intake payload.
5. The opportunity owner uses the selected pack to confirm customer inputs, required approvals, retention template, blocked claims, and proof-packet boundaries.
6. When a protected workspace is activated, the selected pack slug should be copied into workspace activation metadata and future governance-ledger events.

## Remaining External Gate

Authenticated CI still requires the `SCRIMED_BEARER_TOKEN` GitHub Actions secret. The token must belong to an approved tenant-admin or pilot-lead identity with AAL2 assurance. This secret cannot be safely stored in source code.

