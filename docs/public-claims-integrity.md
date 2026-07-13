# SCRIMED Public Claims Integrity

## Purpose

The public-claims integrity gate prevents unsupported customer, outcome, market-leadership, novelty, physical-location, clinical, privacy, certification, and compliance language from being treated as approved marketing evidence.

The July 11, 2026 review found a named testimonial and other claims on the published Wix site without matching authorization or substantiation in the SCRIMED evidence graph. The Wix CMS inventory contains no testimonial collection, which means the affected content is static Wix Editor content and cannot be corrected safely through the CMS API.

## Immediate Containment Completed

The review also found three enabled Wix forms. The `Voice Intake Assistant` form accepted contact details, a healthcare service category, and unrestricted service details without a no-PHI warning. It was disabled through a narrow, reversible Wix Forms API update and verified as disabled at revision 2. No submissions or contact records were read, changed, exported, or deleted.

Two general contact forms remain enabled and contain unrestricted free-text fields without a schema-level no-PHI disclosure. They must be corrected in Wix Editor or through a separately reviewed full-schema update before SCRIMED represents the marketing site as privacy-ready.

## Required Wix Correction

1. Open the published site's Home page in Wix Editor.
2. Remove the entire `Hear from Our Clients` section, including the named testimonial.
3. Replace it with:
   - Eyebrow: `Proof Before Promises`
   - Heading: `Inspect the evidence behind SCRIMED.`
   - Body: `Review no-PHI demonstrations, governance controls, interoperability evidence, and clearly bounded pilot-readiness artifacts before making a buying decision.`
   - Primary action: `Review the Trust Center`
   - Secondary action: `Request a Governed Demo`
   - Disclosure: `Synthetic demonstration and decision-support scope only. Do not submit patient information through this website.`
4. Remove or substantiate unsupported recognition, market-leadership, novelty, outcome, and physical-location claims identified by the smoke.
5. Add `Do not submit patient information` next to both remaining contact forms and every chat, booking, upload, and free-text collection surface.
6. Keep the `Voice Intake Assistant` form disabled until the privacy owner approves its exact purpose, fields, retention, consent language, and no-PHI boundary.
7. Preview desktop and mobile layouts, obtain Founder, legal, privacy, and marketing review, then publish only the approved page changes.
8. Run `npm run smoke:wix-public-claims` and retain the dated pass result.

Publishing through Wix Editor can include unrelated draft changes. The site owner must review the Wix change history and preview before publishing; SCRIMED automation must not issue a blind whole-site publish.

## Commands

```bash
npm run test:wix-public-claims-policy
npm run contract:public-claims-integrity
npm run check:wix-public-claims
npm run smoke:wix-public-claims
```

`check:wix-public-claims` reports drift without failing local work. `smoke:wix-public-claims` is strict and fails closed when the published page is unavailable, blocked language remains, or required disclosures are absent. It stores no page content or visitor data.

## Approval Boundary

No claim is approved automatically. A passing smoke proves only that the configured blocked markers are absent and required scope disclosures are present. It does not replace legal, clinical, privacy, advertising, address, testimonial, customer, or regional review; certify compliance; authorize PHI collection; or approve customer go-live.
