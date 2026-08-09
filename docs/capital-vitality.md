# SCRIMED Capital Vitality

Updated: 2026-07-20

SCRIMED Capital Vitality is the governed growth lane for revenue capabilities, competitive moat evidence, investor-readiness milestones, funding workstreams, public-sector acquisition readiness, proof routes, and retained external-review gates.

Surfaces:

- `/capital-vitality`
- `/api/capital-vitality`
- `/api/capital-vitality/brief`
- `/product`
- `/hub`
- `/public-market-readiness`
- `/pricing`
- `/pilot-deal-room`

Current posture:

- Revenue capabilities: 8
- Competitive moat signals: 9
- Investor-readiness milestones: 8
- Funding workstreams: 9
- Funding posture: `investor-ready-readiness-materials-no-securities-offer`
- Capital model: `scrimed-capital-plan-v1`, local browser calculation only
- Investor diligence manifest: 6 metadata contracts, 5 weakest-link fundraising blockers
- External fundraising release: not authorized
- Capital access lanes: 7
- Public-sector readiness gates: 11
- Federal contract readiness: 14 checkpoints, operator evidence required
- Internal capture proof artifacts: 5
- External public-sector submission: not authorized

## Capital Readiness Workbench

`/capital-vitality#capital-readiness-workbench` now provides a local-only planning tool for:

- monthly recurring and services revenue;
- cost of revenue and operating expense;
- cash, net burn, and pre-raise runway;
- pre-close funding gaps when modeled runway is shorter than the financing timeline;
- planned raise, transaction costs, and post-close runway;
- target-runway funding gap;
- recurring-revenue mix;
- model, infrastructure, and human-review cost per accepted workflow outcome;
- base, revenue-down, cost-pressure, and financing-delay scenarios.

Entered figures remain in React component state for the active browser tab. The workbench does not call an API, persist to local storage, write cookies, log values, or transmit inputs. Clearing the page clears the figures. Results remain modeled and require founder, qualified finance/accounting, counsel, and release-steward review before external use.

## Investor Diligence Manifest

The existing Capital Vitality summary now exposes a metadata-only manifest for:

1. category, product, and architecture evidence;
2. reconciled financial model and capital plan;
3. corporate, cap table, IP ownership, and securities review;
4. permissioned customer and outcome evidence;
5. independent security, privacy, clinical, and regulatory assurance;
6. immutable packet provenance and recipient authorization.

The manifest accepts only external artifact references, SHA-256 digests, reviewer roles, timestamps, and dispositions. It must not contain raw financial statements, contracts, cap tables, signatures, PHI, customer-confidential data, credentials, penetration-test details, legal opinions, or recipient personal data.

The release evaluator can return `ready-for-qualified-release-review` after every required reference passes validation. It always returns `externalReleaseAuthorized: false`; a separate named, recipient-scoped human release decision remains mandatory.

## Capital And Public-Sector Acquisition Readiness

`app/lib/capitalAcquisitionReadiness.ts` adds one evidence-gated acquisition layer to the existing Capital Vitality control plane. It does not create a separate CRM, proposal engine, submission bot, or registration store.

The supported planning lanes are:

1. institutional and private capital;
2. strategic corporate capital;
3. federal prime contracting;
4. federal subcontracting and teaming;
5. federal grants and cooperative agreements;
6. SBIR/STTR research commercialization;
7. state, local, and public-health procurement.

The readiness registry starts every external status as not verified or qualified-review-required. SCRIMED does not infer or claim SAM.gov registration, a UEI, CAGE assignment, size status, socioeconomic certification, program eligibility, past performance, proposal responsiveness, award, obligated funding, or government endorsement.

`/capital-vitality#public-sector-opportunity-workbench` is a browser-only weakest-link evaluator. It accepts readiness states, not identifiers or proposal content, and never sends or stores them. A closed deadline, ineligible program, expired registration, rejected mandatory review, live-PHI requirement, autonomous clinical requirement, production EHR writeback, or autonomous payer submission produces a no-bid hard stop. Passing every internal gate only returns `ready-for-human-submission-review`; `externalSubmissionAuthorized` remains `false`.

### Federal Contract Readiness

`app/lib/federalContractReadiness.ts` and `/capital-vitality#federal-contract-readiness` add a SAM/FAR Entity Readiness sequence inside the existing control plane. The workbench records only states such as `not-started`, `in-progress`, `evidence-recorded`, `expired`, or `rejected`. It never accepts or stores a UEI, CAGE/NCAGE code, TIN, banking data, credentials, personal contact details, proposal text, controlled information, or PHI.

The 14 checkpoints cover:

1. authorized SAM.gov entity administration;
2. legal entity validation;
3. UEI assignment evidence;
4. CAGE or NCAGE assignment evidence;
5. Core data;
6. Assertions;
7. representations and certifications;
8. Points of Contact;
9. government field validation;
10. an Active SAM record;
11. Annual maintenance and renewal ownership;
12. exclusions and responsibility review;
13. SBA business-profile readiness;
14. a claims-approved capability statement and NAICS/PSC targeting.

The evaluator fails closed when an Active record is asserted while mandatory prerequisites remain unresolved, when evidence is stale or rejected, or when internal approvals predate required evidence. `evidence-recorded` means only that an authorized operator retained a protected reference. It never means SCRIMED verified the external status.

The controlled market-entry sequence supports two distinct paths:

- **Federal prime lane:** active-registration evidence, qualified representations, opportunity-specific clause review, security and delivery assurance, and named submission authorization.
- **Subcontracting lane:** named prime sponsorship, reviewed flowdowns, workshare, data rights, security terms, pricing, and delivery capacity. It does not inherit a prime's authority or past performance.

The strongest local state is `federal-market-entry-review-ready`. External submission remains not authorized. The authorized entity administrator must perform SAM.gov changes, qualified reviewers must approve representations and financial controls, and an authorized company official must make any opportunity-specific submission decision.

### Internal Capital Acquisition Capture Packet

`app/lib/capitalAcquisitionCapturePacket.ts` connects the weakest-link assessment to SCRIMED Proof Packet Studio, the Diligence Packet Manifest, the Diligence Packet Share Guard, and the Trust Center. It generates a deterministic Markdown capture artifact containing:

- lane and assessment state;
- unresolved gates and hard stops;
- lane-specific evidence and reviewer requirements;
- a submission compliance matrix;
- official-source freshness instructions;
- proof routes and shareability classifications;
- exact-fingerprint binding status;
- blocked claims and next actions;
- a deterministic packet audit hash;
- fixed no-release, no-submission, no-award, and no-endorsement controls.

The browser workbench can download this internal packet without an API call. It deliberately excludes opportunity identifiers, proposal text, registration identifiers, tax identifiers, controlled information, customer data, credentials, PHI, and pricing. A complete fingerprint bundle can bind an official opportunity reference, source tree, candidate, and packet artifact for qualified review, but it still cannot authorize fundraising outreach, investor solicitation, government submission, certification, award, work start, or public distribution.

The strongest packet state is `internal-human-submission-review-packet-ready`. That phrase means only that an authorized human can begin final review in the official external system; it is never submission authority.

### Official Source Registry

The internal registry records source purpose, last-reviewed date, and a mandatory freshness policy. The official source always controls:

- [SEC Capital Raising Building Blocks](https://www.sec.gov/resources-small-businesses/building-blocks)
- [SAM.gov Entity Registration](https://sam.gov/entity-registration)
- [SAM.gov Entity Registration Checklist](https://sam.gov/sites/default/files/2024-11/entity-checklist.pdf)
- [SAM.gov Contract Opportunities](https://sam.gov/opportunities)
- [FAR 52.204-7 System for Award Management](https://www.acquisition.gov/far/52.204-7)
- [FAR 52.204-13 System for Award Management Maintenance](https://www.acquisition.gov/far/52.204-13)
- [SBA Federal Contracting Guide](https://www.sba.gov/federal-contracting/contracting-guide)
- [SBA How to Win Contracts](https://www.sba.gov/federal-contracting/contracting-guide/how-win-contracts)
- [SBA Prime and Subcontracting](https://www.sba.gov/federal-contracting/contracting-guide/prime-subcontracting)
- [Federal Acquisition Regulation](https://www.acquisition.gov/browse/index/far)
- [Grants.gov Applicant Registration](https://www.grants.gov/quick-start-guide/applicants)
- [SBIR/STTR Eligibility Requirements](https://www.sbir.gov/faq/eligibility-requirements)

These sources were checked on 2026-07-20. Requirements, notices, amendments, registrations, and policies can change; a named operator must recheck the current official source before every external action. Qualified counsel or an authorized program reviewer must resolve opportunity-specific legal and eligibility questions.

Boundaries:

- Capital Vitality is not investment advice.
- Capital Vitality is not securities offering material.
- Capital Vitality is not audited financial reporting, accounting advice, tax advice, legal advice, or valuation assurance.
- Capital Vitality does not guarantee customer revenue, reimbursement, procurement approval, external funding, or buyer conversion.
- Capital Vitality does not verify government registrations, certifications, eligibility, past performance, contract awards, grant awards, or government endorsement.
- Capital Vitality does not submit bids, grant applications, certifications, claims, or external communications.
- Capital Vitality does not authorize PHI processing, production connectors, security certification, regulatory approval, customer-specific public proof, or live clinical care.

Operator routine:

1. Use `/capital-vitality` before investor, board, buyer, PR, or fundraising materials are prepared.
2. Keep revenue capabilities tied to current proof routes and retained limitations.
3. Use `/qa-claim-guard` for public, buyer, investor, and PR language before distribution.
4. Use `/buyer-release-control-run` before any customer-specific proof, logo, testimonial, or case-study reference.
5. Route funding solicitation, SAFE/equity note, valuation, securities, legal, tax, audited-financial, and investor-advice language through qualified counsel.
6. Retain approved evidence in qualified external systems and store only references plus digests in SCRIMED.
7. Run strict release provenance on a clean reviewed revision before any exact packet enters recipient-scoped release review.
8. Verify public-sector registrations and eligibility in the authoritative external system; store only protected evidence references and digests where approved.
9. Assign an authorized SAM.gov entity administrator and complete the federal readiness checkpoints without copying protected registration values into SCRIMED.
10. Schedule annual SAM maintenance and recheck the authoritative status before every offer, award, renewal, and final-payment lifecycle where applicable.
11. Select one official opportunity, retain all amendments, and use the local workbench before proposal spend.
12. Evaluate the subcontracting lane in parallel with prime registration, but require named sponsorship and reviewed flowdowns before representing access.
13. Require named procurement/grant, legal, security/privacy, finance, delivery, evidence, and authorized-company-official review before any external submission.
14. Keep contract/grant award, funding, government customer, and past-performance claims blocked until exact external evidence is retained and released through Claim Guard.
