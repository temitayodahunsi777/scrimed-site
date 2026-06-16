# SCRIMED Enterprise Readiness and Claims Control

Updated: 2026-06-16

SCRIMED maintains a public Trust and Enterprise Readiness Center at `/trust-center`, a controlled claims register at `/claims`, and machine-readable readiness APIs under `/api/enterprise-readiness`.

## Current Commercial Boundary

SCRIMED is sellable as a governed synthetic pilot and enterprise evaluation product. This allows SCRIMED to provide workflow intelligence assessments, AI readiness and governance audits, synthetic pilot evaluations, and clinical operations automation blueprints.

SCRIMED is not currently authorized for live clinical execution, autonomous diagnosis, treatment, payer submission, patient outreach, production record mutation, or live protected-health-information processing.

The Trust Center is an operational readiness register. It is not legal advice, a compliance certification, a regulatory determination, or authorization for production clinical use.

## Controlled Domains

The readiness model tracks:

- Legal readiness
- Security readiness
- Privacy readiness
- Brand readiness
- AI and enterprise governance
- Marketing readiness
- Public relations readiness
- Sales readiness
- Advertising readiness

Every domain includes an accountable owner, current evidence, required action, launch gate, public commitments, prohibited actions, and authoritative sources where applicable.

## Claims Control

Claims have one of three states:

- `approved-current-boundary`: may be used with the required qualifier.
- `evidence-required`: requires a dated, approved evidence packet before publication.
- `prohibited`: cannot be used under the current product boundary.

SCRIMED must not make unsupported claims of HIPAA compliance, regulatory approval, certification, autonomous care, guaranteed outcomes, certified live connectors, production clinical readiness, or zero errors.

## Baseline Web Security

All application routes receive baseline response headers for content security policy, content-type protection, framing protection, referrer handling, browser permissions, and cross-origin opener isolation.

These headers are one security control. They are not a complete security program or compliance attestation.

## Required External Actions

Before protected enterprise pilots or production clinical use, SCRIMED still requires:

- qualified legal and regulatory counsel review
- approved enterprise agreement stack, including DPA and BAA where applicable
- privacy notices, processing register, retention schedule, and regional assessments
- product regulatory classification and intended-use review
- trademark clearance, insurance decisions, and formal brand standards
- formal security program, incident response exercise, and independent penetration test
- production identity, tenant isolation, durable audit, runtime safety, and connector controls
- rate limiting, bot protection, monitoring, and abuse response before scaled public campaigns
- external CRM activation where required, campaign approval, and crisis communications workflows

## Active Sales And Governance Controls

SCRIMED now routes new no-PHI buyer intakes through deterministic governance workflow pack selection. The selected pack is attached to the durable intake payload, shown in Sales Operations, included in audited proposals, exported in CRM CSV files, and sent in the optional CRM webhook payload.

This improves diligence readiness, but it does not replace qualified legal, privacy, security, or regulatory review.

SCRIMED also exposes a Pilot Deal Room at `/pilot-deal-room`, protected opportunity packet route at `/api/sales-operations/opportunities/{intakeId}/deal-room-packet`, guarded buyer workspace provisioning at `/api/sales-operations/opportunities/{intakeId}/workspace-provisioning`, audited provisioning packets at `/api/sales-operations/opportunities/{intakeId}/workspace-provisioning/packet`, guarded tenant lifecycle activation at `/api/sales-operations/opportunities/{intakeId}/tenant-lifecycle`, and audited lifecycle packets at `/api/sales-operations/opportunities/{intakeId}/tenant-lifecycle/packet`. These artifacts organize public proof, protected Buyer Pilot Room routing, premium pricing posture, governance pack context, buyer-specific workspace readiness, manual invitation policy, SSO/domain posture, access-review cadence, retention/archive controls, and next-step diligence. They remain non-binding business artifacts and do not create production authorization, legal conclusions, compliance certification, clinical validation, payer approval, or reimbursement guarantees.

## Routes

- `/trust-center`
- `/trust-center/[slug]`
- `/claims`
- `/api/enterprise-readiness`
- `/api/enterprise-readiness/[slug]`
- `/api/enterprise-readiness/claims`
- `/api/enterprise-readiness/diligence-brief`
- `/pilot-deal-room`
- `/api/pilot-deal-room`
