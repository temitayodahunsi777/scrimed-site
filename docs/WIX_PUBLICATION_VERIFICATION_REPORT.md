# Wix Publication Verification Report

**Verification timestamp:** 2026-07-30T00:03:31Z

**Authoritative domain:** `https://www.scrimedsolutions.com`

**Environment:** Published Wix production site

**Status:** BLOCKED — current publication gate open

> **Superseding current-state notice — 2026-08-01:** A later editor/live comparison found that
> published FaithCore copy no longer matched the approved clinically neutral content and that the
> safe Vitals content existed in the editor draft without consistent published evidence. The exact
> FaithCore replacement is saved as an unpublished draft. No new publication occurred. The July
> results below remain valid only for their recorded observation time and do not close the current
> gate.

## Current Direct-Live Verification

**Captured:** `2026-08-03T01:26:35.867Z`

**Policy:** `2026-08-02.wix-publication-v3`

The current strict verifier reached all 17 configured pages, two retired routes, two noindexed
Booking routes, three canonical-domain redirects, and six crawler files. Fourteen pages passed.
The result is blocked by 16 FaithCore-only mismatches:

- `/faithcore`: stale title, description, Open Graph title, and Open Graph description;
- `/faithcore`: the approved opt-in body, clinical-neutrality statement, supporting statement,
  and CTA are absent from published HTML;
- `/service-page/faithcore-integration`: noncanonical title, description, and Open Graph values;
- `/post/introducing-faithcore-where-spiritual-support-meets-clinical-care`: stale title,
  description, and Open Graph values.

Homepage, Vitals, About, Partner, Demo, Blog, legal, booking, voice-intake, canonical, JSON-LD,
redirect, sitemap/robots, retired-commerce, and noindexed Booking checks passed in this current
observation. The strengthened visible Shop/Cart label and known unverified/placeholder telephone
checks also passed. The saved editor draft has not been published. A true 390px mobile
verification is still required after owner-authorized publication.

```text
blocked SCRIMED Wix publication verification: blocked
policy=2026-08-02.wix-publication-v3 evidence_source=direct-network-fetch network_available=true
pages=17 retired_routes=2 booking_routes=2 redirects=3 crawler_files=6
failure_codes=16 FaithCore metadata/visible-copy mismatches
```

The historical evidence below is retained for audit context only.

**Verifier hardening note:** The direct published-site evidence below was collected at the
timestamp above after same-origin redirect enforcement, HTTPS-downgrade rejection, streamed
response-size limits, offline-evidence path confinement, no-follow descriptor reads,
aggregate evidence budgets, malformed-HTML work limits, live-only strict evidence, duplicate
and unexpected evidence rejection, and external-sitemap URL rejection were active. The
deterministic self-test and the direct live check both passed.

## Pages Checked

1. `/`
2. `/vitals-monitoring`
3. `/faithcore`
4. `/partner-with-scrimed`
5. `/request-a-demo`
6. `/about-scrimed`
7. `/blog`
8. `/blank`
9. `/blank-1`
10. `/blank-2`
11. `/blank-3`
12. `/book-online`
13. `/service-page/ai-vitals-monitoring`
14. `/service-page/faithcore-integration`
15. `/service-page/voice-intake-assistants`
16. `/post/ai-vitals-monitoring-sensor-integrations-alert-thresholds-trend-dashboards-faithcore-overlay`
17. `/post/introducing-faithcore-where-spiritual-support-meets-clinical-care`

## Metadata Results

| Check | Result |
| --- | --- |
| Homepage title | PASS — approved Atlas-first title published |
| Homepage meta description | PASS — approved human-supervised, synthetic-data/demo-first description published |
| Homepage Open Graph | PASS — approved title, description, and preferred URL published |
| Vitals metadata | PASS — synthetic demonstration and clinical-boundary language published |
| FaithCore metadata | PASS — optional, user-selected, clinically neutral language published |
| Partner metadata | PASS — governed no-PHI pilot language published |
| Booking-service metadata | PASS — all three service pages use synthetic or optional, clinically neutral positioning |
| Canonical URLs | PASS — all 17 intended pages use the preferred `https://www.scrimedsolutions.com` domain |

## JSON-LD Result

- Homepage schema types: `Organization`, `WebSite`, `WebSite`.
- Product pages checked use conservative `Organization` schema.
- No unverified address, locality, geo, or telephone field was found.
- No `Review` or `AggregateRating` schema was found.
- No customer, certification, clinical-result, or live-deployment claim was found.

## Claims Scan

- Published pages checked: **17**
- Configured public-claims denylist evaluated across rendered HTML and metadata: **PASS**
- Forbidden JSON-LD types checked: **4**
- Forbidden JSON-LD keys checked: **6**
- Pages with prohibited phrase hits: **0**
- Pages with review/rating schema: **0**
- Pages with telephone links: **0**
- Pages with JSON-LD address nodes: **0**
- Canonical failures: **0**

The repository's multi-page strict gate covered the complete configured denylist, required
no-PHI, synthetic-status, and human-review disclosures, exact critical metadata, JSON-LD,
canonical URLs, redirects, crawler files, retired store routes, and noindexed Booking routes:

```text
pass SCRIMED Wix publication verification: pass
policy=2026-07-27.wix-publication-v1
pages=17 retired_routes=2 booking_routes=2 redirects=3 crawler_files=6
failure_codes=none
```

Command:

```bash
node scripts/wix-publication-verification.mjs --strict
```

Restricted environments may use an ephemeral evidence packet through
`SCRIMED_WIX_PUBLICATION_EVIDENCE_PATH` for operator review, but offline evidence now fails the
strict published-site gate by design. A passing strict result requires a fresh direct live HTTP
observation. Offline files are opened with no-follow descriptor semantics and bounded by per-file,
aggregate-byte, and aggregate-file limits. The verifier never prints or persists fetched page
content.

## Domain, Sitemap, And Robots

- `https://scrimedsolutions.com/` redirects to `https://www.scrimedsolutions.com/`.
- `http://scrimedsolutions.com/` redirects to `https://www.scrimedsolutions.com/`.
- `http://www.scrimedsolutions.com/` redirects to `https://www.scrimedsolutions.com/`.
- Robots, sitemap index, pages, booking-services, blog-posts, and blog-categories sitemap
  endpoints returned HTTP 200 during the 2026-07-27 live check.
- Sitemap URLs use the preferred www domain.
- No store-products, store-categories, Shop, Cart, checkout, or All Products URL is present in
  the sitemap.

## Commerce Cleanup

- `/category/all-products`: 404, `noindex`.
- Legacy template product route: 404, `noindex`.
- Wix Stores products: 0.
- All Products category: inactive.
- Checkout & Orders site app: removed.
- `/cart-page` and `/thank-you-page` are noindexed Wix Bookings system routes, not published
  store catalog routes; they remain because removing them requires removing the legitimate
  Wix Bookings flow.

## Visual Verification

| View | Result |
| --- | --- |
| Desktop, 1440 x 900 | PASS — published About content is readable; viewport and document widths both 1440px |
| Mobile, 390 x 844 | PASS — headings no longer break inside words; viewport and document widths both 390px |
| Horizontal overflow | PASS — none detected on the verified About layout |
| FaithCore styling | PASS — existing site typography retained with optional-experience boundary |
| Vitals layout | PASS — safe synthetic-only copy and disclaimer visible |

Direct Chrome visual verification was performed against the published site. No screenshot
artifact containing browser/session metadata was added to the repository.

## Safety Boundary Verification

Published surfaces preserve:

- synthetic-data/demo-first positioning;
- no-PHI public intake boundary;
- no live clinical execution;
- no emergency monitoring;
- no autonomous diagnosis, treatment, eligibility, prioritization, payer, or claims decisions;
- human review for consequential use;
- FaithCore as optional and clinically neutral.

## Final Result

Wix production publication and direct verification succeeded only at the historical observation
time. The current gate is blocked: founder-authorized publication of the saved FaithCore draft
and fresh strict live/mobile verification are required. This report does not authorize PHI
processing, clinical deployment, medical-device connectivity, regulatory claims, certification
claims, or customer go-live.
