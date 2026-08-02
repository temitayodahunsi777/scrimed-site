# External System Actions Required

## P0 - Wix Marketing Site — Historical Remediation, Publication Exception Open

**Owner:** Founder/site owner.

The Wix-controlled public-claims remediation was published and directly verified on 2026-07-27.
That evidence is historical. A fresh 2026-08-01 check found later drift in published FaithCore
copy and inconsistent publication of the safe Vitals draft. The exact FaithCore replacement is
saved in Wix as an unpublished draft; publication remains founder-controlled. Until publication
and fresh live verification complete, the current Wix gate remains open.

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

- Vercel: the connected project was `READY` on 2026-08-01. Production remains at commit `5e77beea57f458883f7544421b2014fd4e28ac67`; the latest ready preview belongs to a different branch. The current local candidate is committed and intentionally not deployed. Bind deployment authorization to the final reviewed `HEAD` and assurance fingerprints before using the normal workflow, then collect exact-release post-deployment smoke evidence.
- GitHub: no pull request exists for the current `agent/scrimed-p31-workstreams` branch. Existing open draft pull requests belong to other branches. Generate the exact candidate and least-disclosure review batches, obtain named dispositions, then create a PR only through the authorized repository workflow. Do not reuse another branch's review evidence.
- Supabase: project `scrimed-protected-pilot` was `ACTIVE_HEALTHY` on Postgres 17.6.1 on 2026-08-01. Security Advisor reported one warning: leaked-password protection is disabled. The connector has no scoped Auth-setting mutation, so follow `docs/SUPABASE_SECURITY_OPERATOR_PACKET.md`, then rerun Security Advisor. No production migration was applied. The three pending local migrations remain static-READY for a separately authorized disposable dry-run; see `docs/MIGRATION_DRY_RUN_REPORT.md` and `docs/PENDING_MIGRATION_AUTHORIZATION_PACKET.md`.
- Supabase Performance Advisor reported informational unused-index findings. Do not remove those indexes from an early-stage workload solely because usage counters are currently zero; collect representative query/load evidence and review write/read tradeoffs first.

These checks do not authorize deployment or production mutation.

## Verification

- The homepage metadata and conservative Organization schema were safe in the fresh inspection.
- The 2026-07-27 strict marketing smoke passed and remains historical publication evidence only.
- A fresh 2026-08-01 editor/live comparison found publication drift. The exact FaithCore draft
  is saved but unpublished; fresh strict and 390px mobile verification remain required.
