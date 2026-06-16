# SCRIMED Sales Attribution

Updated: 2026-06-16

## Status

Sales Attribution v1 is active for governed buyer intake.

Routes:

- `/sales-attribution`
- `/api/sales-attribution`
- `/attribution-analytics`
- `/api/attribution-analytics`
- `/api/sales-operations/attribution-analytics`
- `/api/sales-operations/opportunities/{intakeId}/attribution-analytics-packet`
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

## Cohort Analytics

Attribution Analytics now rolls safe source capture into cohort reporting by source, campaign, buyer type, deployment profile, offer, cadence, proof packet, and sales outcome.

Public analytics use synthetic fixtures at `/attribution-analytics`. Authenticated tenant-admin analytics are available at `/api/sales-operations/attribution-analytics` and derive from persisted no-PHI Sales Operations opportunities.

Sales Operations now displays the tenant cohort report in-console and can export an audited attribution analytics packet for board, investor, and enterprise sales reviews.

Attribution packet exports now attempt a dedicated `attribution-analytics-packet-downloaded` audit event, with a controlled rollout fallback while the Supabase migration is being verified.

The next build step is anomalous packet-download review through Trust Safety incident operations and durable production trust-ops storage.
