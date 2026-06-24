# SCRIMED Navigation Audit

Updated: 2026-06-24

SCRIMED Navigation Audit is the public route-control lane for page inventory, API route pattern count, smoke coverage, protected fail-closed checks, and retained approval boundaries.

Surfaces:

- `/navigation`
- `/api/navigation-audit`
- `/api/navigation-audit/brief`
- `/product`
- `/hub`
- `/release-continuity`
- `/service-reliability`
- `/capital-vitality`

Current source totals:

- Page routes: 103
- API route patterns: 245
- Navigation groups: 8
- Public smoke HTML routes: 27

Boundaries:

- Navigation Audit is not release approval.
- Navigation Audit is not legal, HIPAA, SOC 2, HITRUST, FDA, ONC, reimbursement, security, or clinical certification.
- Navigation Audit does not create investment advice, securities offering material, audited financial reporting, valuation assurance, or revenue guarantees.
- Navigation Audit does not authorize PHI processing, production connectors, public customer proof, external distribution, or live clinical care.
- Protected happy-path evidence still requires an active human AAL2 session or a deliberate one-time short-lived operator token run with no token retention.

Operator routine:

1. Review `/navigation` before a production release.
2. Confirm new buyer-critical routes are in the appropriate route group.
3. Add new high-risk public routes to `scripts/public-production-smoke.mjs`.
4. Keep protected tenant-scoped routes fail-closed in public smoke.
5. Use `/pilot-workspace/access` for browser-session protected verification when AAL2 proof is required.
6. Keep approval and certification claims gated until qualified external evidence is retained.
