# SCRIMED Clinical Production Readiness

Updated: 2026-06-26

SCRIMED Clinical Production Readiness is the source-controlled task ledger for the work required before live clinical production, PHI/ePHI scope, production EHR or payer connectivity, patient-impacting AI, regulated clinical claims, customer go-live, and global clinical deployment.

Surfaces:

- `/clinical-production-readiness`
- `/api/clinical-production-readiness`
- `/api/clinical-production-readiness/brief`
- `/company-assessment`
- `/clinical-authority-readiness`
- `/global-certification-readiness`
- `/health-records`
- `/platform-power`
- `/continuous-review-audit`
- `/service-reliability`
- `/enterprise-business-ops`
- `/service-delivery`
- `/qa-buyer-proof-release`
- `/pilot-workspace/access`

Current tracker assets:

- 22 required clinical-production tasks
- 22 incomplete production tasks
- Critical, high, and medium priority labeling
- Owner, completion criteria, dependencies, missing evidence, current safe use, and retained boundary per task
- 5 go-live gates
- 10 current capability motions that can be activated before clinical production
- 10 official source references
- API and Markdown brief with no-authority headers

Current operating answer:

- Scrimed is usable now for no-PHI demos, paid readiness services, synthetic pilots, buyer diligence packets, AI governance reviews, health-record sandbox planning, service-delivery work orders, and investor or clinic readiness conversations.
- Scrimed is not yet ready for unrestricted clinical production, PHI processing, EHR writeback, payer submission, live patient outreach, regulated clinical claims, production customer go-live, or global clinical deployment.

Tasks that must be complete before clinical production:

- Intended-use and clinical-claim boundaries per module
- Licensed clinical governance, safety case, hazard log, and escalation policy
- HIPAA risk analysis and safeguard mapping
- BAA/DPA, non-PHI determination, data classification, retention, deletion, and legal-hold workflow
- Security assurance path for SOC 2, HITRUST, ISO 27001, penetration testing, and procurement evidence
- Production identity, RBAC, SSO, AAL2, access review, least privilege, and credential lifecycle
- Immutable audit logging, evidence retention, release decisions, reviewer signoffs, and access-log reconciliation
- Customer-specific FHIR, HL7 v2, C-CDA, DICOM, X12, payer, and EHR sandbox acceptance tests
- Separate approval for EHR writeback, record mutation, payer submission, patient outreach, and production connector execution
- FDA CDS/SaMD classification, QMS escalation, and premarket pathway decision where required
- ONC health IT certification, information-blocking, USCDI, SMART/FHIR, and EHR marketplace claim-scope decision
- AI model inventory, evaluation, red-team, bias, drift, hallucination, source-attribution, and monitoring controls
- AI management-system evidence for ISO/IEC 42001 alignment and EU high-risk AI readiness
- 24/7 support, incident response, breach response, uptime monitoring, escalation, and shutdown authority
- Disaster recovery, backup, recovery objectives, rollback, regional failover, and business continuity
- Change management, release control, rollback, post-release review, and production access controls
- Customer MSA/SOW/BAA/DPA, service boundaries, billing, insurance, liability, and revenue-recognition review
- Reimbursement, coding, payer policy, prior-authorization, and claims-submission authority review
- GDPR, EU AI Act, data residency, DPIA, transfer mechanism, and regional clinical/legal review before global production
- ISO 13485/QMS, design controls, risk management, human factors, usability, and post-market surveillance scope decision
- Customer production go-live checklist, SSO/RBAC acceptance, monitoring, rollback test, support handoff, and shutdown authority
- Board-level readiness review cadence with owner, due date, evidence aging, risk acceptance, and blocked-claim review

Current capability motions:

- Synthetic executive operating assessment
- No-PHI health-record and interoperability readiness package
- AI governance and TrustOS diligence review
- Buyer diligence and proof-release workbench
- Service delivery workbench for no-PHI paid pilots
- Investor and clinic readiness packets
- Enterprise operations and margin lock
- 24/7 review and innovation operating loop
- Launch-safe public product and demo motion
- Global certification and approval roadmap service

Boundaries:

- Clinical Production Readiness is not legal advice, medical advice, regulatory approval, HIPAA compliance assurance, security certification, FDA clearance, ONC certification, EU AI Act conformity, GDPR compliance assurance, PHI authority, connector approval, customer permission, launch approval, reimbursement assurance, revenue guarantee, profit guarantee, securities material, investment advice, valuation assurance, or live clinical care authorization.
- No PHI/ePHI, source medical records, patient identifiers, production credentials, or live endpoints enter SCRIMED until BAA/DPA, privacy/security, customer, and release authority are complete.
- No live diagnosis, treatment, triage, prescribing, patient outreach, payer submission, EHR writeback, record mutation, or autonomous clinical action.
- No production customer go-live without signed contract stack, customer authority, clinical governance, privacy/security approval, support readiness, monitoring, rollback, and shutdown authority.

Operator routine:

1. Start at `/clinical-production-readiness` before any PHI, live-care, connector, clinical AI, certification, global production, customer go-live, or clinical-production language expands.
2. Review `criticalOpenTaskCount`, `externalReviewTaskCount`, and `blockedTaskCount`.
3. Assign the next eight tasks to owners with evidence routes and external-review needs.
4. Use current capability motions to keep revenue moving through no-PHI services, synthetic pilots, and diligence packets.
5. Route legal, privacy, regulatory, clinical, security, reimbursement, accounting, tax, securities, and valuation questions to qualified reviewers.
6. Keep Product Console, Hub, Navigation Audit, README, systems map, and public smoke aligned whenever the tracker changes.
