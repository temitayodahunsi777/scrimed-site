# SCRIMED Attribution Analytics

Updated: 2026-06-16

## Purpose

Attribution Analytics turns SCRIMED's CRM-safe source attribution into source-to-pilot cohort reporting across:

- source category
- campaign channel
- buyer type
- deployment profile
- offer
- sales cadence
- proof packet
- sales outcome

## Routes

- Public page: `/attribution-analytics`
- Public API: `/api/attribution-analytics`
- Authenticated tenant API: `/api/sales-operations/attribution-analytics`
- Authenticated packet export: `/api/sales-operations/opportunities/{intakeId}/attribution-analytics-packet`

## Persistence Model

Public analytics use synthetic fixtures for buyer and investor review.

Tenant-admin analytics derive from persisted no-PHI Sales Operations opportunities stored through the durable pilot intake ledger. The durable source is `private.pilot_intake_submissions.payload.attribution`.

Sales Operations now displays tenant cohort analytics inside the protected console and exports a Markdown attribution analytics packet for board, investor, sales, and enterprise pipeline review.

## Boundary

Attribution analytics must not contain PHI, patient identifiers, clinical records, diagnosis details, payer member identifiers, sensitive ad-platform health inferences, guaranteed ROI, or customer-identifying outcomes without written approval.

## Current Limitations

- Public analytics are synthetic fixtures.
- Authenticated analytics require AAL2 tenant-admin access.
- Ad spend, CAC, signed contract value, and customer ROI are not imported yet.
- Small cohort counts are directional operating signals, not market claims.
- Packet export now attempts the dedicated `attribution-analytics-packet-downloaded` audit event and falls back to the prior sales artifact event only during migration rollout.

## Next Build Step

Verify the dedicated audit event in production, remove rollout fallback metadata once confirmed, and connect anomalous packet downloads to Trust Safety incident review.
