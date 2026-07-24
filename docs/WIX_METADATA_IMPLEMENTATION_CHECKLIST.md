# Wix Metadata Implementation Checklist

**Owner:** Wix site owner
**Required reviewers:** Founder, Marketing, Legal/Privacy, and Clinical Safety
**Publication authority:** Not granted by this repository candidate

Direct, cache-bypassed inspection of the published homepage on 2026-07-23 confirmed that
the visible redesign is active, but stale metadata and one unsafe blog excerpt remain in the
published HTML. Wix's supported REST surface can resolve static-page SEO tags but does not
provide a documented mutation method for these Editor-managed fields. Apply the changes
through Wix Editor and publish only after named review.

## Home Page SEO

| Location | Current published value | Required replacement | Verification |
| --- | --- | --- | --- |
| Pages & Menu > Home > SEO Basics > Title tag | `Scrimed Solutions \| faith-based healthcare solutions` | `SCRIMED \| Governed Healthcare Intelligence` | Inspect `<title>`, `og:title`, and the browser tab |
| Pages & Menu > Home > SEO Basics > Meta description | `SCRIMED Solutions is a faith-based healthcare company using AI to improve patient care, streamline clinics, and integrate spiritual intelligence through tools like multilingual intake, vitals monitoring, and FaithCore.` | `SCRIMED develops trustworthy, interoperable, human-supervised healthcare intelligence workflows. Synthetic demonstration only; do not submit PHI.` | Inspect description, `og:description`, and `twitter:description` |
| Pages & Menu > Home > Advanced SEO > Canonical | `https://www.scrimedsolutions.com/` | Keep `https://www.scrimedsolutions.com/` | Confirm one canonical link and no conflicting domain |

## Organization Structured Data

Open Home > SEO Basics > Advanced SEO > Structured data markup. If Wix regenerates the
Organization object from Business Info, also update Settings > Business Info > Contact Info.

| Field | Current published value | Required replacement |
| --- | --- | --- |
| `@type` | `Organization` | Keep |
| `name` | `SCRIMED SOLUTIONS` | Keep |
| `url` | `https://www.scrimedsolutions.com/` | Keep |
| `email` | `scrimedsolutions@gmail.com` | Keep only after Founder confirms it as the public privacy/business contact |
| `telephone` | `+14049814427` | Remove unless Founder and counsel provide a verified publication record |
| `address.addressLocality` | `Atlanta, GA` | Remove unless Founder and counsel provide a verified publication record |
| `address.addressCountry` | `US` | Remove with the unverified address object |
| `sameAs` | LinkedIn and X URLs | Keep only profiles formally controlled and approved by SCRIMED |

Do not add `Review`, `AggregateRating`, customer, deployment, certification, medical-device,
or clinical-outcome schema.

## Vitals Blog Card On Home

The homepage post list still exposes this unsafe source excerpt:

`real-time, predictive, and faith-centered patient monitoring`

Update the source post, remove it from the homepage feed, or unpublish it pending review.
Approved replacement:

- **Title:** `Synthetic Vitals Workflow Demonstration`
- **Excerpt:** `A synthetic workflow concept for reviewing configured test signals, thresholds, and trend displays. Demonstration and research use only; not for diagnosis, treatment, emergency monitoring, or time-critical clinical decision-making.`

FaithCore may be linked only as a distinct optional experience and must not appear to govern
clinical logic.

## Publish And Verify

1. Preview desktop and 390px mobile.
2. Review Wix change history for unrelated draft changes.
3. Obtain named Founder, Marketing, Legal/Privacy, and Clinical Safety approval.
4. Publish the reviewed Wix revision.
5. Open the homepage with a cache-busting query and confirm the new `etag` or site revision.
6. Inspect title, description, Open Graph, Twitter, canonical, and JSON-LD.
7. Run `npm run smoke:wix-public-claims`.
8. Confirm the check reports zero blocked claims and all no-PHI, synthetic, and human-review disclosures.

Until step 4 occurs, the published Wix surface remains an external release blocker.
