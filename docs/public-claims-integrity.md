# SCRIMED Public Claims Integrity

## Purpose

The public-claims integrity gate prevents unsupported customer, outcome, market-leadership, novelty, physical-location, clinical, privacy, certification, and compliance language from being treated as approved marketing evidence.

The July 23, 2026 review found a named testimonial, outcome language, an unverified street
address, Shop navigation, and unsafe vitals positioning on the published Wix site without
matching authorization or substantiation in the SCRIMED evidence graph.

## Immediate Containment Completed

The review also found three enabled Wix forms. The `Voice Intake Assistant` form accepted contact details, a healthcare service category, and unrestricted service details without a no-PHI warning. It was disabled through a narrow, reversible Wix Forms API update and verified as disabled at revision 2. No submissions or contact records were read, changed, exported, or deleted.

Two general contact forms remain enabled and contain unrestricted free-text fields without a schema-level no-PHI disclosure. They must be corrected in Wix Editor or through a separately reviewed full-schema update before SCRIMED represents the marketing site as privacy-ready.

## Published Remediation

The Wix owner-authenticated remediation was published on July 24 and automatically revalidated
on July 27, 2026. The current site:

- uses `Validation and Evidence` and `Building with clinicians, health systems, and innovators.`
  instead of unverified testimonial content;
- removes the named testimonial, unsupported outcomes, unverified address/telephone data,
  ratings/reviews, template products, and the Wix Stores checkout app;
- uses Atlas-first enterprise metadata and keeps FaithCore optional and clinically neutral;
- frames Vitals as a synthetic-data workflow demonstration;
- retains the public boundary `Do not submit patient information` through the stricter
  no-PHI notices on public collection surfaces;
- keeps the `Voice Intake Assistant` form accepted as a historical finding but verified as
  disabled at revision 2;
- preserves noindexed Wix Bookings system pages without exposing store catalog routes.

The exact operator and verification records are:

- `docs/WIX_OPERATOR_EXECUTION_PACKET.md`
- `docs/WIX_PUBLICATION_VERIFICATION_REPORT.md`

## Commands

```bash
npm run test:wix-public-claims-policy
npm run contract:public-claims-integrity
npm run check:wix-public-claims
npm run smoke:wix-public-claims
npm run contract:wix-publication-verification
npm run test:wix-publication-verification
npm run smoke:wix-publication-verification
```

`check:wix-public-claims` reports drift without failing local work. `smoke:wix-public-claims` is strict and fails closed when the published page is unavailable, blocked language remains, or required disclosures are absent. It stores no page content or visitor data.

`smoke:wix-publication-verification` is the release-strength multi-page check. It verifies all
17 intended Wix routes, including three booking-service pages, critical metadata, JSON-LD,
canonical URLs, redirects, six crawler files, retired store routes, and noindexed Booking
routes. It also fails when an indexed same-origin sitemap route is omitted from the scan. In a
restricted environment, provide an ephemeral evidence packet through
`SCRIMED_WIX_PUBLICATION_EVIDENCE_PATH`. Raw page content is never printed or retained by the
verifier.

## Approval Boundary

No claim is approved automatically. A passing smoke proves only that the configured blocked markers are absent and required scope disclosures are present. It does not replace legal, clinical, privacy, advertising, address, testimonial, customer, or regional review; certify compliance; authorize PHI collection; or approve customer go-live.
