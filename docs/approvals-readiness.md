# SCRIMED Approvals Readiness

Updated: 2026-07-18

SCRIMED Approvals Readiness is the operating ladder for public launch, healthcare buyer trust, and future regulated expansion. It keeps SCRIMED moving as healthcare operations intelligence while HIPAA, SOC 2, HITRUST, FDA, ONC, state care-delivery, and buyer-release gates remain evidence-led and human-approved.

## Current Posture

- Public operations are allowed for synthetic pilots, workflow evidence, buyer diligence, audit readiness, and enterprise evaluation.
- PHI/ePHI processing is not authorized.
- Live clinical care, diagnosis, treatment, triage, prescribing, patient outreach, payer submission, and production record mutation are not authorized.
- HIPAA, SOC 2, HITRUST, FDA, ONC, security certification, reimbursement, and production connector claims are not approved.
- Buyer-specific external sharing remains gated by release-control evidence, reviewer sign-off, recipient controls, and access-log reconciliation.

## Product Surfaces

- `/approvals-readiness`
- `/api/approvals-readiness`
- `/api/approvals-readiness/brief`
- `/product`
- `/claims`
- `/boundary-resolution`
- `/clinical-authority-readiness`
- `/buyer-release-control-run`
- `/pilot-workspace/access`

## Intended Use Review Workbench

The proposed company-wide memo already exists at `docs/SCRIMED_INTENDED_USE_MEMO.md`. The Approvals Readiness page now includes a browser-local, controlled-options workbench that converts a proposed workflow scope into a qualified-review packet.

The workbench:

- tests workflow, mode, data classification, audience, autonomy, evidence posture, and requested actions;
- blocks live PHI, restricted clinical data, production/live operation, live care, autonomous execution, diagnosis, treatment selection, prescribing, final imaging interpretation, outreach, payer submission, EHR writeback, external sending, go-live, and unsupported certification claims;
- requires cited and verified evidence for clinical-facing draft workflows;
- adds founder, qualified legal, clinical governance, licensed clinical, privacy, security, buyer, pilot, communications, and release reviewers when the selected scope triggers them;
- produces no signature, approval, legal opinion, regulatory classification, PHI authority, clinical authority, external-release authority, or production authority;
- sends, stores, caches, and logs no entered data because all inputs are fixed local options.

Reviewer identities, decisions, dates, effective date, version, expiry, and evidence references must be retained in an approved external system of record. See `docs/intended-use-review.md` for the runbook.

## Approval Tracks

1. Public claims and intended-use boundary
2. HIPAA, BAA, and Security Rule readiness
3. SOC 2, HITRUST, and security assurance
4. FDA CDS/SaMD classification
5. ONC, interoperability, and connector approval
6. State care-delivery and telehealth review
7. Buyer-specific release chain

## Agent Controls

- Claim Guard Agent: classifies and routes claims before public use.
- Approval Evidence Router: organizes external artifact references without storing sensitive artifacts.
- Regulatory Classification Agent: prepares intended-use and FDA/CDS/SaMD review questions.
- Security Assurance Agent: maps SOC 2/HITRUST readiness evidence and owner gaps.
- Buyer Release Steward: sequences protected buyer release gates without bypassing AAL2 or human review.

## Operating Rules

- Use operations-first language until the Intended Use Memo is approved.
- Build HIPAA/BAA and security evidence before accepting PHI.
- Run SOC 2 readiness before claiming security assurance.
- Route clinical claims to qualified regulatory and clinical review before use.
- Keep ONC, connector, EHR, payer, and marketplace claims tied to actual acceptance evidence.
- Do not use customer-specific proof externally until the buyer release-control chain is retained.

## Next Operator Actions

- Run the Intended Use workbench against the current proposed scope.
- Obtain named Founder/CEO, qualified legal, and clinical governance decisions and retain them outside source code.
- Align website, decks, demos, sales scripts, investor materials, and pilot scopes only after the approved version is effective.
- Create the HIPAA readiness evidence room with risk analysis, safeguards, BAA/DPA, incident, breach, and vendor records.
- Start SOC 2 readiness control mapping and evidence collection.
- Select one narrow connector or clinical classification path before pursuing formal external review.
- Keep all public and buyer language routed through Claim Guard, Boundary Resolution, and release-control workflows.

## Boundary

Approvals Readiness is not legal advice, HIPAA compliance certification, SOC 2 certification, HITRUST certification, FDA clearance, ONC certification, reimbursement certainty, PHI processing authority, public customer permission, production connector approval, or live clinical care authority.
