# External System Actions Required

## P0 - Wix Marketing Site — Published Claims Remediation Verified

**Owner:** Founder/site owner.

The Wix-controlled public-claims remediation was published and directly verified on 2026-07-27.
A later FaithCore drift finding was remediated. On 2026-08-09, a fresh direct-origin audit against
policy `2026-08-09.wix-publication-v4` passed all configured public surfaces with zero claim
failures. A direct browser check then confirmed the published FaithCore title, safe metadata,
opt-in copy, clinical-neutrality boundary, CTA, canonical URL, and conservative schema.

The July publication evidence recorded:

- Atlas-first homepage SEO and Open Graph metadata;
- conservative Organization JSON-LD without address or telephone;
- synthetic-only Vitals language and explicit clinical boundaries;
- optional, clinically neutral FaithCore positioning;
- no named testimonial, review/rating schema, template store products, or active store category;
- canonical HTTPS www URLs and consistent redirects;
- clean desktop and 390px mobile About-page rendering;
- a then-passing strict publication smoke across 17 pages, six crawler files, redirects, retired
  store routes, and noindexed Booking system routes.

The detailed execution and verification evidence is in:

- `docs/WIX_OPERATOR_EXECUTION_PACKET.md`
- `docs/WIX_PUBLICATION_VERIFICATION_REPORT.md`

Wix Bookings retains noindexed `/cart-page` and `/thank-you-page` system routes. They are not
Wix Stores catalog pages and are absent from the sitemap. Removing them would require removing
the legitimate Book Online flow, so no removal is required unless the Founder chooses to retire
public booking.

## P0 - Legal And Business Identity

**Owner:** Founder + qualified counsel.

Verify legal entity, public address decision, jurisdiction, governing law, privacy posture, terms, cookie inventory, refund terms, accessibility scope, healthcare disclaimer, processors, retention, and international coverage.

## P1 - Domain Ownership And External Records

**Owner:** Founder + domain/deployment administrator.

Published HTTP/HTTPS, www/non-www redirects, canonical URLs, Open Graph, structured data,
robots, and nested sitemaps passed the direct 2026-07-27 verification. The Founder and domain
administrator must still maintain registrar ownership, renewal, recovery contacts, DNS-change
control, and the Wix/Vercel responsibility map. Do not change registrar records without a
reviewed rollback plan.

## P1 - Vercel, GitHub, And Supabase

**Owner:** authorized platform operators.

- Vercel: the connected project was `READY` on 2026-08-09. Production remains at commit `5e77beea57f458883f7544421b2014fd4e28ac67`. Ready previews exist for predecessor PRs 22 and 23, but neither preview contains the current consolidated candidate. Bind deployment authorization to the final reviewed `HEAD` and assurance fingerprints before using the normal workflow, then collect exact-release post-deployment smoke evidence.
- GitHub: draft PR 22 at `450d9022356f1f19e3c1b1855f3a55f8634302bb` and draft PR 23 at `37d749c103ca1588be62740148b3dd294a35f7d2` are both ancestors of the current local base `9d2cfceef81b0b13010ef28b55c040d459bc625a`. Do not merge both predecessors independently. Validate one attributable candidate, create one replacement review path through the authorized repository workflow, and obtain named dispositions against that exact head.
- Supabase: project `scrimed-protected-pilot` was `ACTIVE_HEALTHY` on Postgres 17.6.1 on 2026-08-09. Security Advisor still reported one warning: leaked-password protection is disabled. The connector has no scoped Auth-setting mutation, so follow `docs/SUPABASE_SECURITY_OPERATOR_PACKET.md`, then rerun Security Advisor. No production migration was applied. The three pending local migrations remain static-READY for a separately authorized disposable dry-run; see `docs/MIGRATION_DRY_RUN_REPORT.md` and `docs/PENDING_MIGRATION_AUTHORIZATION_PACKET.md`.
- Supabase Performance Advisor reported informational unused-index findings. Do not remove those indexes from an early-stage workload solely because usage counters are currently zero; collect representative query/load evidence and review write/read tradeoffs first.

These checks do not authorize deployment or production mutation.

## Verification

- The homepage metadata and conservative Organization schema were safe in the fresh inspection.
- The 2026-07-27 strict marketing smoke passed and remains historical publication evidence only.
- A 2026-08-09 direct-origin policy-v4 audit passed the complete configured surface.
- A later same-day strict refresh attempt from a network-restricted shell failed closed with zero
  pages observed. That environmental result does not supersede the fresh direct-origin evidence.
- A true mobile-device visual check remains an owner presentation action. It is not a public-
  claims failure and cannot be substituted with desktop-user-agent resizing.
