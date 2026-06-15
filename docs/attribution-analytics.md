# SCRIMED Attribution Analytics

Updated: 2026-06-15

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

## Persistence Model

Public analytics use synthetic fixtures for buyer and investor review.

Tenant-admin analytics derive from persisted no-PHI Sales Operations opportunities stored through the durable pilot intake ledger. The durable source is `private.pilot_intake_submissions.payload.attribution`.

## Boundary

Attribution analytics must not contain PHI, patient identifiers, clinical records, diagnosis details, payer member identifiers, sensitive ad-platform health inferences, guaranteed ROI, or customer-identifying outcomes without written approval.

## Current Limitations

- Public analytics are synthetic fixtures.
- Authenticated analytics require AAL2 tenant-admin access.
- Ad spend, CAC, signed contract value, and customer ROI are not imported yet.
- Small cohort counts are directional operating signals, not market claims.

## Next Build Step

Add tenant-admin cohort visualization inside Sales Operations and export an audited attribution analytics packet for board, investor, and enterprise pipeline reviews.
