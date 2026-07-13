# SCRIMED Client Onboarding And Communications

Updated: 2026-06-26

SCRIMED Client Onboarding and Communications is the control plane for buyer discovery, demos, pilots, presentations, meetings, email-ready copy, calendar-ready agendas, follow-up SLAs, and handoffs.

Surfaces:

- `/client-onboarding`
- `/api/client-onboarding`
- `/api/client-onboarding/brief`
- `/product`
- `/offerings`
- `/pilot-demo-commercial-readiness`
- `/demos`
- `/pilots`
- `/pilot`
- `/pilot-deal-room`
- `/sales-operations`
- `/enterprise-business-ops`
- `/boundary-resolution`

Current coverage:

- Onboarding stages: 8
- Communication templates: 9
- Calendar-ready packets: 6
- Meeting cadences: 5
- Presentation packets: 5
- Controls: 8
- Handoffs: 6

Boundaries:

- The lane drafts and routes communication artifacts only.
- It does not send email or create calendar invites.
- It does not bind contracts, create binding quotes, approve discounts, approve procurement, approve BAA/security posture, store PHI, process live clinical records, create customer permission, certify compliance, approve production connectors, guarantee revenue or ROI, or authorize live clinical care.
- PHI, patient identifiers, production credentials, security-sensitive artifacts, contract conclusions, custom SOW commitments, customer-value claims, and clinical/production requests must route to their named owners before use.

Operator routine:

1. Classify the buyer into the current onboarding stage.
2. Pick the matching human-reviewed email, calendar, demo, handoff, or presentation template.
3. For demos or pilots, open `/pilot-demo-commercial-readiness` and select one demo path, one recommended package, one price band, one proof list, and one no-PHI intake route before follow-up language leaves SCRIMED.
4. Confirm no PHI, credentials, production records, customer claims, contract conclusions, binding pricing, or security-sensitive artifacts are present.
5. Assign meeting owner, follow-up SLA, CRM-safe source note, and next handoff owner.
6. Route legal, finance, security, procurement, pricing-exception, PHI, connector, production, or clinical requests to the proper boundary owner.
7. Retain proof routes and open gates before demo follow-up, pilot scoping, diligence packets, kickoff, renewal, or expansion communication leaves SCRIMED.
