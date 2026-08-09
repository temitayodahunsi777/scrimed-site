# Wix Publication Verification Report

**Verification timestamp:** 2026-08-09T05:04:46Z

**Authoritative domain:** `https://www.scrimedsolutions.com`

**Environment:** Published Wix production site

**Status:** PASS — published claims verified; true mobile-device presentation check remains

> **Current-state notice — 2026-08-09:** The remediated FaithCore copy and metadata are published.
> A fresh direct-origin audit against policy v4 passed the complete configured surface. A later
> same-day strict attempt from a network-restricted shell failed closed with zero pages observed;
> it does not supersede the fresh direct-origin evidence. Search-engine caches remain non-
> authoritative because they may lag the live origin.

## Current Direct-Live Verification

**Captured:** `2026-08-09`

**Policy:** `2026-08-09.wix-publication-v4`

The current direct-origin audit reached all 17 configured pages, two retired routes, two
noindexed Booking routes, three canonical-domain redirects, and six crawler files. All claims,
metadata, canonical, schema, address/telephone, commerce, and clinical-boundary checks passed.
A subsequent direct browser observation confirmed `/faithcore` publishes:

- `FaithCore by SCRIMED | Optional Faith-Aligned Care Experience`;
- the approved opt-in and clinical-neutral descriptions;
- the approved supporting statement and CTA;
- canonical `https://www.scrimedsolutions.com/faithcore`;
- one conservative `Organization` JSON-LD object without address, telephone, `Review`, or
  `AggregateRating`.

A true mobile-device visual check remains pending. The browser harness can resize a desktop-user-
agent page to 390px, but Wix serves a separate mobile variant by device user agent, so that resize
is intentionally not reported as current mobile-variant evidence.

```text
pass SCRIMED Wix publication verification: pass
policy=2026-08-09.wix-publication-v4 evidence_source=direct-network-fetch network_available=true
pages=17 retired_routes=2 booking_routes=2 redirects=3 crawler_files=6
failure_codes=none
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
| Historical mobile, 390 x 844 | PASS at the recorded July observation — About headings did not break inside words |
| Current FaithCore desktop | PASS — approved optional-experience copy and existing site typography are live |
| Current FaithCore mobile variant | OPERATOR CHECK — requires a real mobile device or supported mobile-user-agent harness |
| Vitals layout | PASS — safe synthetic-only copy and disclaimer visible |

Direct browser visual verification was performed against the current published FaithCore desktop
variant. No screenshot artifact containing browser/session metadata was added to the repository.

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

Wix production claims verification passes policy v4. The current FaithCore publication is
confirmed from the live origin; only the separate true mobile-device presentation check remains.
This report does not authorize PHI processing, clinical deployment, medical-device connectivity,
regulatory claims, certification claims, or customer go-live.
