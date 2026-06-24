# SCRIMED Service Reliability

Updated: 2026-06-23

SCRIMED Service Reliability is the operating lane for product/service controls, fault classes, efficiency improvements, owners, proof routes, and retained approval boundaries.

Surfaces:

- `/service-reliability`
- `/api/service-reliability`
- `/api/service-reliability/brief`
- `/product`
- `/hub`
- `/navigation`
- `/release-continuity`

Current posture:

- Product/service controls: 10
- Fault classes: 8
- Efficiency improvements: 6
- Retained open gate classes: human AAL2 operator proof, protected buyer release, and qualified external approval review

Boundaries:

- Service Reliability is not release approval.
- Service Reliability is not legal, HIPAA, SOC 2, HITRUST, FDA, ONC, reimbursement, security, financial, or clinical certification.
- Service Reliability does not authorize PHI processing, production connectors, public customer proof, external distribution, or live clinical care.
- Protected happy-path evidence still requires an active human AAL2 session or a deliberate one-time short-lived operator token run with no token retention.

Operator routine:

1. Review `/service-reliability` before a production release or buyer-facing claim update.
2. Confirm each product/service barrier has an owner, proof route, mitigation, retained boundary, and next action.
3. Add newly discovered fault classes before expanding public product language.
4. Keep Navigation Audit source totals and public smoke checks updated when routes or API handlers change.
5. Keep protected tenant-scoped proof fail-closed publicly and human-operated through AAL2.
6. Route approval, certification, PHI, live-care, customer-proof, public-market, reimbursement, legal, and security claims through qualified external review.
