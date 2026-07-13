# SCRIMED Navigation Audit

Updated: 2026-06-26

SCRIMED Navigation Audit is the public route-control lane for page inventory, API route pattern count, persistent app-wide navigation, role journeys, limitation controls, smoke coverage, protected fail-closed checks, and retained approval boundaries.

Surfaces:

- `/navigation`
- `/api/navigation-audit`
- `/api/navigation-audit/brief`
- `/company-assessment`
- `/clinical-production-readiness`
- `/product`
- `/hub`
- `/release-continuity`
- `/launch-readiness`
- `/competitive-defense`
- `/service-reliability`
- `/capital-vitality`
- `/growth-engine`
- `/investor-audience-readiness`
- `/offerings`
- `/service-delivery`
- `/client-onboarding`
- `/pilot-demo-commercial-readiness`
- `/enterprise-scalability`
- `/platform-power`
- `/limitations-workarounds`
- `/operational-efficiency`
- `/health-records`
- `/boundary-resolution`

Current source totals:

- Page routes: 122
- API route patterns: 283
- Navigation groups: 8
- Site navigation sections: 5
- Role journeys: 14
- Limitation controls: 18
- Public smoke HTML routes: 46

Boundaries:

- Navigation Audit is not release approval.
- Navigation Audit is not legal, HIPAA, SOC 2, HITRUST, FDA, ONC, reimbursement, security, or clinical certification.
- Navigation Audit does not create investment advice, securities offering material, audited financial reporting, valuation assurance, or revenue guarantees.
- Navigation Audit does not authorize PHI processing, production connectors, public customer proof, external distribution, or live clinical care.
- Navigation Audit does not authorize live health-record ingestion, patient matching, EHR writeback, payer submission, or record mutation.
- Navigation Audit does not create binding quotes, approve procurement, authorize discounts, guarantee ROI, or validate customer-specific pricing.
- Navigation Audit does not bypass sandbox DNS, approve fallback-only launch proof, override domain records, or convert fallback Vercel URLs into branded-domain launch approval.
- Protected happy-path evidence still requires an active human AAL2 session or a deliberate one-time short-lived operator token run with no token retention.
- Persistent navigation and role journeys are route guidance only; they do not approve release, customer proof, certifications, clinical authority, or autonomous remediation.

Operator routine:

1. Review `/navigation` before a production release.
2. Route whole-company launch, buyer, investor, service, platform, approval, proof, or board decisions through `/company-assessment` first.
3. Route PHI, live-care, production connector, clinical AI, certification, global production, customer go-live, or clinical-production language through `/clinical-production-readiness`.
4. Route launch decisions through `/launch-readiness` so sandbox DNS false negatives, fallback-only proof, strict branded-domain smoke, service paths, and hard stops are visible before promotion.
5. Route competitor comparisons, privacy/security claims, infiltration-risk language, and no-copy hardening through `/competitive-defense`.
6. Confirm new buyer-critical routes are in the appropriate route group.
7. Add new recurring journeys to the persistent site navigation when users need them from more than one page.
8. Keep limitation-control routes visible for every buyer, reviewer, operator, and global path.
9. Route product, service, pricing, pilot, diligence, and implementation scope through `/offerings` before custom commitments expand.
10. Route scoped work orders, acceptance criteria, artifacts, buyer handoffs, margin protections, and no-PHI/no-SLA/no-contract gates through `/service-delivery` before paid service kickoff.
11. Route demo, pilot, pricing, proof-list, and no-PHI intake decisions through `/pilot-demo-commercial-readiness` before buyer-specific pricing, discounts, or custom SOW work expands.
12. Route buyer meetings, demos, pilot workshops, follow-up, decks, email-ready copy, and calendar-ready agendas through `/client-onboarding` before communication leaves SCRIMED.
13. Route capacity, tenant scale, SLO/SLA language, support tiers, incident/change operations, regional hosting, disaster recovery, and cost commitments through `/enterprise-scalability` before external commitments expand.
14. Route API, UI, AI, model-route, agent-tool, accessibility, and scale-equivalence claims through `/platform-power` before external commitments expand.
15. Route blocked requests and repeated limitations through `/limitations-workarounds` so each safe alternative has an owner, packet, proof route, expiration rule, and graduation gate.
16. Route angel, corporate strategic, private investor, faith-based clinic, public-sector, payer, provider, clinician, global-partner, and transformation-sponsor conversations through `/investor-audience-readiness` before pitch, diligence, grant, donor, or partner language expands.
17. Route health-records and integration owners through `/health-records` before any record, connector, sandbox, or extraction discussion expands.
18. Add new high-risk public routes to `scripts/public-production-smoke.mjs`.
19. Keep protected tenant-scoped routes fail-closed in public smoke.
20. Use `/pilot-workspace/access` for browser-session protected verification when AAL2 proof is required.
21. Keep approval and certification claims gated until qualified external evidence is retained.
