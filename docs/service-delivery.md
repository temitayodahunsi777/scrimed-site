# SCRIMED Service Delivery Workbench

Updated: 2026-06-26

SCRIMED Service Delivery Workbench converts packaged product and service offers into scoped work orders, delivery phases, acceptance criteria, artifacts, buyer handoffs, margin protections, and retained authority gates.

Surfaces:

- `/service-delivery`
- `/api/service-delivery`
- `/api/service-delivery/brief`
- `/offerings`
- `/product`
- `/client-onboarding`
- `/enterprise-business-ops`
- `/qa-claim-guard`
- `/qa-buyer-proof-release`
- `/pilot-workspace/access`

What is encoded:

- Seven delivery offers mapped to portfolio offers.
- Seven phases from qualification through handoff.
- Eight reusable work-order templates.
- Seven delivery artifacts and release rules.
- Eight activation gates for no-PHI intake, scope, contracts, claims, protected release, connectors, and clinical action.
- Package bindings from portfolio packages into delivery templates.
- Live service activation plans for deployment posture, sales readiness, revenue motion, support motion, proof routes, and go-live blockers.
- Hard stops for PHI, live care, production connectors, customer release, contracts, SLAs, revenue guarantees, profit guarantees, public quantum claims, and custom work expansion.

Operator routine:

1. Start with `/offerings` to select the package and offer.
2. Use `/service-delivery` to create the scope matrix, acceptance criteria, artifact list, owner map, and hard stops.
3. Route buyer meetings, kickoff, decks, and follow-up through `/client-onboarding`.
4. Route pricing, contract, tax, accounting, revenue-recognition, and margin questions through `/enterprise-business-ops`.
5. Route all buyer-facing claims through `/qa-claim-guard`.
6. Route buyer-specific proof release through `/qa-buyer-proof-release`, `/buyer-release-control-run`, and `/pilot-workspace/access`.
7. Route expansion into `/growth-engine` only after acceptance, unresolved gates, and next paid package are recorded.

Live activation routine:

1. Classify each selected service as public-demo-ready, no-PHI-service-ready, protected-pilot-candidate, or blocked-before-live-production.
2. Confirm the deployment posture: public route, no-PHI delivery, protected workspace, or external approval required.
3. Attach sales readiness, delivery readiness, revenue readiness, and support readiness before discussing go-live.
4. Keep every service blocked from PHI, production connectors, EHR writeback, payer submission, patient outreach, clinical action, customer go-live, contractual SLA, managed-service coverage, security certification, compliance certification, clinical validation, revenue guarantee, and profit guarantee until qualified approval exists.
5. Use fixed-scope packages, capped deliverables, paid readiness/pilot packaging, and separate change-order paths to protect margins and avoid custom implementation drift.

Boundaries:

- Service Delivery is not a statement of work, contract approval, legal advice, accounting advice, tax advice, audited financial reporting, contractual SLA, uptime guarantee, managed-service commitment, customer permission, revenue guarantee, or profit-margin guarantee.
- Service Delivery does not authorize PHI processing, production connectors, EHR writeback, payer submission, patient outreach, diagnosis, treatment, live clinical workflows, clinical validation, compliance certification, or security certification.
- Buyer-specific evidence release remains protected and AAL2 gated.
- Custom implementation expansion requires a separately approved work order, change order, protected pilot, or enterprise agreement.
