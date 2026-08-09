# Wix Final Execution Packet

**Site:** Scrimed Solutions (`https://www.scrimedsolutions.com`)
**Owner:** Founder or authorized Wix site owner
**Status:** PUBLISHED CLAIMS VERIFIED; MOBILE PRESENTATION CHECK REMAINS

**Fresh direct-live observation:** `2026-08-09`

The fresh policy-v4 direct-origin audit reached all 17 configured pages, two retired routes, two
noindexed Booking routes, three redirects, and six crawler files. All configured claims checks
passed. A subsequent browser check confirmed that the FaithCore title, safe metadata, opt-in
body, supporting boundary, CTA, canonical URL, and conservative `Organization` schema are live.
Do not modify layout, billing, domains, users, permissions, contacts, CRM, or automations.

## Exact Field Changes

| Page / section | Wix settings path | Current state | Required replacement | Verification |
| --- | --- | --- | --- | --- |
| FaithCore hero heading | Editor > Pages & Menu > FaithCore > hero heading | Verified published | Retain `FaithCore — Optional Faith-Aligned Experience` | Inspect desktop and mobile published text |
| FaithCore hero body | Editor > Pages & Menu > FaithCore > hero body | Verified published | Retain `FaithCore is an optional, user-selected experience for individuals and organizations seeking faith-aligned engagement. It does not influence diagnosis, treatment, clinical recommendations, eligibility, prioritization, risk scoring, or access to care.` | Exact visible text on live page |
| FaithCore support line | Editor > Pages & Menu > FaithCore > support text | Verified published | Retain `FaithCore is not a medical service and does not modify clinical logic or healthcare decisions.` | Exact visible text on live page |
| FaithCore CTA | Editor > Pages & Menu > FaithCore > CTA button | Verified published | Retain `Explore Optional FaithCore Experience` | CTA is visible, keyboard reachable, and routes only to optional FaithCore content |
| FaithCore SEO title | Pages & Menu > FaithCore > SEO basics > Title tag | `FaithCore by SCRIMED \| Optional Faith-Aligned Care Experience` | Retain `FaithCore by SCRIMED \| Optional Faith-Aligned Care Experience` | Live HTML has exactly one matching `<title>` |
| FaithCore meta description | Pages & Menu > FaithCore > SEO basics > Meta description | `FaithCore is an optional, user-selected experience designed for faith-aligned engagement. It does not influence diagnosis, treatment, eligibility, prioritization, risk scoring, medical recommendations, or access to care.` | `FaithCore is an optional, user-selected faith-aligned experience. It does not influence diagnosis, treatment, eligibility, prioritization, risk scoring, medical recommendations, or access to care.` | Live HTML description matches exactly |
| FaithCore Open Graph title | FaithCore > SEO > Social share | `FaithCore by SCRIMED \| Optional Faith-Aligned Care Experience` | Retain `FaithCore by SCRIMED \| Optional Faith-Aligned Care Experience` | Live `og:title` matches |
| FaithCore Open Graph description | FaithCore > SEO > Social share | Same stale “experience designed for” wording as the current meta description | Same text as the approved meta description | Live `og:description` matches |
| FaithCore canonical | FaithCore > SEO > Advanced SEO | `https://www.scrimedsolutions.com/faithcore` (passing) | Keep unchanged | Exactly one canonical; no preview/editor domain |
| FaithCore JSON-LD | FaithCore > SEO > Structured data markup | One object; current strict policy scan passes | Keep conservative Organization/page data only; no address, telephone, Review, AggregateRating, clinical authority, or certification claim | Parse each live JSON-LD block and scan prohibited keys/types |
| FaithCore service SEO title and Open Graph title | Service page > FaithCore Integration > SEO and Social share | `FaithCore Integration by SCRIMED \| Optional Faith-Aligned Experience` | Retain `FaithCore Integration by SCRIMED \| Optional Faith-Aligned Experience` | Live title and `og:title` match exactly |
| FaithCore service description and Open Graph description | Service page > FaithCore Integration > SEO and Social share | `An optional, user-selected faith-aligned engagement experience. It does not influence diagnosis, treatment, eligibility, prioritization, risk scoring, medical recommendations, or access to care.` | Retain current safe value | Live description and `og:description` match exactly |
| FaithCore introduction post SEO title and Open Graph title | Blog > Posts > FaithCore introduction > SEO and Social share | `FaithCore by SCRIMED \| Optional Faith-Aligned Care Experience` | Retain `FaithCore by SCRIMED \| Optional Faith-Aligned Care Experience` | Live title and `og:title` match exactly |
| FaithCore introduction post description and Open Graph description | Blog > Posts > FaithCore introduction > SEO and Social share | `FaithCore is an optional, user-selected experience designed for faith-aligned engagement. It does not influence diagnosis, treatment, eligibility, prioritization, risk scoring, medical recommendations, or access to care.` | Retain current safe value | Live description and `og:description` match exactly |
| Mobile layout | Mobile editor > FaithCore | Mobile-variant HTML is published; fresh real-device visual evidence remains separate | Retain the same copy and CTA; no hidden duplicate or clinical-authority wording | True mobile-device run, no overflow or clipping |

Keep FaithCore absent from site-wide enterprise metadata except as an optional route.

## Future Drift Procedure

1. Reopen the FaithCore desktop and mobile variants; compare every field above character-for-character.
2. Save and publish through Wix's normal production flow only when an approved correction is needed.
3. Refresh the affected page's SEO/social settings and Wix sitemap output through the normal
   editor flow; do not change DNS or registrar settings.
4. Verify HTTPS `www` as canonical and HTTP/non-www redirects.
5. Run `npm run verify:wix-production` from a network-enabled environment.
6. Run `npm run verify:live-mobile` with a supported local Chrome/Chromium executable.
7. Retain no-secret JSON output and screenshots, then bind them to the exact candidate.
8. Request search reindexing only after the live DOM, metadata, canonical, JSON-LD, sitemap, and
   prohibited-string checks pass.

Search-engine snippets may lag the live origin and do not supersede direct published evidence.

## Current Machine Result

```text
pass SCRIMED Wix publication verification: pass
policy=2026-08-09.wix-publication-v4 evidence_source=direct-network-fetch network_available=true
pages=17 retired_routes=2 booking_routes=2 redirects=3 crawler_files=6
failure_codes=none
```

The homepage, Vitals, About, Partner, Demo, Blog, legal, booking, voice-intake, canonical,
redirect, crawler, JSON-LD, retired-commerce, noindexed Booking, visible Shop/Cart label, and
known unverified/placeholder telephone checks passed. A true mobile-device visual check remains
separate because desktop-user-agent resizing does not exercise Wix's mobile publication variant.
