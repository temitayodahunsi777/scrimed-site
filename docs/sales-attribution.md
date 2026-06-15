# SCRIMED Sales Attribution

Updated: 2026-06-15

## Status

Sales Attribution v1 is active for governed buyer intake.

Routes:

- `/sales-attribution`
- `/api/sales-attribution`
- `/pilot`
- `/api/pilot/intake`
- `/sales-operations`

## Purpose

SCRIMED now converts safe buyer signals into a CRM-ready attribution packet:

- Source route
- Referrer host
- UTM source, medium, campaign, term, and content
- Revenue stream
- Target audience
- Deployment profile
- Source-informed strategic signals
- Recommended human follow-up cadence
- CRM-safe tags

## Boundary

Attribution must not collect PHI, patient identifiers, clinical records, diagnosis details, payer member identifiers, ad-platform sensitive health inferences, or production healthcare data.

Attribution supports commercial routing and human-reviewed follow-up only. It does not authorize diagnosis, treatment, payer submission, patient outreach, live clinical execution, or production connector access.

## Sales Use

Sales Operations now carries attribution into:

- Opportunity detail
- CRM CSV export
- CRM webhook payload
- Follow-up draft
- Assessment invitation
- Opportunity proposal

The next build step is cohort reporting: source, audience, revenue stream, deployment profile, response SLA, follow-up completion, and qualified-pilot conversion.
