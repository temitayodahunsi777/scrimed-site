# Wix Full-Site Execution Packet

Use this packet only if fresh verification detects drift. The current 2026-08-09 policy-v4
direct-origin claims audit passes.

## Exact Scope

Check Home, About, FaithCore, Vitals, Partner, Demo, legal pages, Blog, shared header/footer,
desktop/mobile variants, SEO title/description, Open Graph, JSON-LD, canonical, sitemap, robots,
forms, legacy/duplicate pages, cached content, and Shop/Cart remnants.

| Surface | Required value or action |
| --- | --- |
| Home title | `SCRIMED | Trustworthy Healthcare Intelligence and AI-Enabled Workflows` |
| Home description | `SCRIMED develops trustworthy, human-supervised healthcare intelligence and AI-enabled workflows for clinicians, care teams, health systems, payers, researchers, and patients. Current public experiences are demonstration and synthetic-data environments unless separately validated and approved.` |
| Home Open Graph | Title `SCRIMED | Trustworthy Healthcare Intelligence`; human-supervised enterprise description |
| Organization JSON-LD | Name, canonical URL, approved description, verified public email, slogan only; no address, telephone, review, rating, clinical or certification claim |
| FaithCore title | `FaithCore by SCRIMED | Optional Faith-Aligned Care Experience` |
| FaithCore body | `FaithCore is an optional, user-selected experience for individuals and organizations seeking faith-aligned engagement. It does not influence diagnosis, treatment, clinical recommendations, eligibility, prioritization, risk scoring, or access to care.` Add: `FaithCore is not a medical service and does not modify clinical logic or healthcare decisions.` |
| FaithCore CTA | Replace clinic-activation language with `Explore Optional FaithCore Experience`. |
| Vitals | Synthetic/test signals and reviewable demonstration trends; explicit no-diagnosis, no-treatment, no-emergency, no-live-device/no-PHI boundary |
| Public forms | Nonclinical purpose, minimum fields, privacy consent, and `Do not include PHI` warning |
| Commerce | No stale store catalog, product schema, Shop navigation, or unsupported Cart surface; preserve only deliberate noindexed Wix Bookings system pages |
| Canonical | `https://www.scrimedsolutions.com`; HTTP/non-www redirect to HTTPS www |

Prohibited content includes unverified testimonials, addresses, locality/phone, ratings, faith-
first enterprise claims, uncontrolled patient monitoring, autonomous care, certification,
customer, partner, clinical-result, and live-deployment claims.

## Operator Procedure

1. Inventory values before editing and attach no-secret screenshots.
2. Make the smallest text/metadata correction; do not modify layout, CRM, contacts, users,
   billing, automations, domains, or permissions.
3. Save and publish through the normal Wix owner workflow only when drift was found and approved.
4. Confirm desktop/mobile synchronization, sitemap refresh, and social metadata.
5. Run `npm run verify:wix-production` from a network-enabled environment.
6. Attach the machine JSON and screenshots. A failed or unavailable run leaves the gate open.

The FaithCore replacement body, CTA, metadata, and Vitals synthetic-only boundary are published.
A true mobile-device visual check remains a separate presentation check and must not be replaced
by resizing a desktop-user-agent page to 390px.

## Fresh Read-Only Finding

The 2026-08-09 direct-origin audit reached all 17 configured pages, two retired routes, two
noindexed Booking routes, three redirects, and six crawler files. Policy v4 passed with zero
claim failures. A same-day browser check confirmed the live FaithCore metadata, visible copy,
canonical URL, and conservative schema. Search-engine snapshots may remain stale and are
supporting evidence only; current live DOM and metadata remain authoritative.
