# Wix Final Execution Packet

**Site:** Scrimed Solutions (`https://www.scrimedsolutions.com`)
**Owner:** Founder or authorized Wix site owner
**Status:** OPERATOR ACTION REQUIRED

**Fresh direct-live observation:** `2026-08-03T01:26:35.867Z`

The strict verifier reached all 17 configured pages, two retired routes, two noindexed Booking
routes, three redirects, and six crawler files. Fourteen pages passed. The only remaining failures
are the exact FaithCore fields and visible-copy markers listed below (16 failure codes total).

The Wix connector confirms the site and account context, but it does not expose a supported
editor-page mutation for these text and SEO fields. The authenticated editor draft was previously
saved with the approved visible copy. Publication and fresh production verification remain open.
Do not modify layout, billing, domains, users, permissions, contacts, CRM, or automations.

## Exact Field Changes

| Page / section | Wix settings path | Current state | Required replacement | Verification |
| --- | --- | --- | --- | --- |
| FaithCore hero heading | Editor > Pages & Menu > FaithCore > hero heading | Required heading absent from published HTML | `FaithCore — Optional Faith-Aligned Experience` | Inspect desktop and mobile published text |
| FaithCore hero body | Editor > Pages & Menu > FaithCore > hero body | Required opt-in and clinical-neutrality markers absent from published HTML | `FaithCore is an optional, user-selected experience for individuals and organizations seeking faith-aligned engagement. It does not influence diagnosis, treatment, clinical recommendations, eligibility, prioritization, risk scoring, or access to care.` | Exact visible text on live page |
| FaithCore support line | Editor > Pages & Menu > FaithCore > support text | `FaithCore is not a medical service` marker absent from published HTML | `FaithCore is not a medical service and does not modify clinical logic or healthcare decisions.` | Exact visible text on live page |
| FaithCore CTA | Editor > Pages & Menu > FaithCore > CTA button | `Explore Optional FaithCore Experience` absent from published HTML | `Explore Optional FaithCore Experience` | CTA is visible, keyboard reachable, and routes only to optional FaithCore content |
| FaithCore SEO title | Pages & Menu > FaithCore > SEO basics > Title tag | `FaithCore by SCRIMED \| Optional Faith-Aligned Care Experience` | `FaithCore by SCRIMED \| Optional Faith-Aligned Experience` | Live HTML has exactly one matching `<title>` |
| FaithCore meta description | Pages & Menu > FaithCore > SEO basics > Meta description | `FaithCore is an optional, user-selected experience designed for faith-aligned engagement. It does not influence diagnosis, treatment, eligibility, prioritization, risk scoring, medical recommendations, or access to care.` | `FaithCore is an optional, user-selected faith-aligned experience. It does not influence diagnosis, treatment, eligibility, prioritization, risk scoring, medical recommendations, or access to care.` | Live HTML description matches exactly |
| FaithCore Open Graph title | FaithCore > SEO > Social share | `FaithCore by SCRIMED \| Optional Faith-Aligned Care Experience` | `FaithCore by SCRIMED \| Optional Faith-Aligned Experience` | Live `og:title` matches |
| FaithCore Open Graph description | FaithCore > SEO > Social share | Same stale “experience designed for” wording as the current meta description | Same text as the approved meta description | Live `og:description` matches |
| FaithCore canonical | FaithCore > SEO > Advanced SEO | `https://www.scrimedsolutions.com/faithcore` (passing) | Keep unchanged | Exactly one canonical; no preview/editor domain |
| FaithCore JSON-LD | FaithCore > SEO > Structured data markup | One object; current strict policy scan passes | Keep conservative Organization/page data only; no address, telephone, Review, AggregateRating, clinical authority, or certification claim | Parse each live JSON-LD block and scan prohibited keys/types |
| FaithCore service SEO title and Open Graph title | Service page > FaithCore Integration > SEO and Social share | `FaithCore Integration by SCRIMED \| Optional Faith-Aligned Experience` | `FaithCore by SCRIMED \| Optional Faith-Aligned Experience` | Live title and `og:title` match exactly |
| FaithCore service description and Open Graph description | Service page > FaithCore Integration > SEO and Social share | `An optional, user-selected faith-aligned engagement experience. It does not influence diagnosis, treatment, eligibility, prioritization, risk scoring, medical recommendations, or access to care.` | Approved FaithCore meta description above | Live description and `og:description` match exactly |
| FaithCore introduction post SEO title and Open Graph title | Blog > Posts > FaithCore introduction > SEO and Social share | `FaithCore by SCRIMED \| Optional Faith-Aligned Care Experience` | `FaithCore by SCRIMED \| Optional Faith-Aligned Experience` | Live title and `og:title` match exactly |
| FaithCore introduction post description and Open Graph description | Blog > Posts > FaithCore introduction > SEO and Social share | Same stale “experience designed for” wording as the current FaithCore page | Approved FaithCore meta description above | Live description and `og:description` match exactly |
| Mobile layout | Mobile editor > FaithCore | Not freshly verified | Same exact copy and CTA; no hidden duplicate or clinical-authority wording | True 390px browser run, no overflow or clipping |

Keep FaithCore absent from site-wide enterprise metadata except as an optional route.

## Publication And Cache Procedure

1. Confirm an unexpired founder acceptance is bound to the exact candidate and assurance manifest.
2. Reopen the FaithCore desktop and mobile variants; compare every field above character-for-character.
3. Save and publish through Wix's normal production flow.
4. Refresh the affected page's SEO/social settings and Wix sitemap output through the normal
   editor flow; do not change DNS or registrar settings.
5. Verify HTTPS `www` as canonical and HTTP/non-www redirects.
6. Run `npm run verify:wix-production` from a network-enabled environment.
7. Run `npm run verify:live-mobile` with a supported local Chrome/Chromium executable.
8. Retain no-secret JSON output and screenshots, then bind them to the exact candidate.
9. Request search reindexing only after the live DOM, metadata, canonical, JSON-LD, sitemap, and
   prohibited-string checks pass.

Completion requires fresh published evidence. A saved draft, this packet, or a search-engine
snippet does not close the gate.

## Current Machine Result

```text
blocked SCRIMED Wix publication verification: blocked
policy=2026-08-02.wix-publication-v3 evidence_source=direct-network-fetch network_available=true
pages=17 retired_routes=2 booking_routes=2 redirects=3 crawler_files=6
failure_codes=16 FaithCore metadata/visible-copy mismatches
```

The homepage, Vitals, About, Partner, Demo, Blog, legal, booking, voice-intake, canonical,
redirect, crawler, JSON-LD, retired-commerce, noindexed Booking, visible Shop/Cart label, and
known unverified/placeholder telephone checks passed in this observation. This does not replace
the required post-publication desktop and true 390px mobile check.
