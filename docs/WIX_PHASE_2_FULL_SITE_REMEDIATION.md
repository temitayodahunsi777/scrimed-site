# Wix Phase 2 Full-Site Remediation

## Current Evidence

The authenticated Wix site context observed on 2026-08-01 identifies the published SCRIMED
Solutions site at `https://www.scrimedsolutions.com/` with Velo enabled. The 2026-07-27
operator and publication reports record completed Atlas-first metadata, conservative
Organization schema, optional FaithCore separation, synthetic-only Vitals language, retired
store content, and responsive verification.

A fresh strict published-claims smoke was attempted on 2026-08-01. The local sandbox could not
reach the public site, so it returned `public-claims-evidence-unavailable`. No fresh publication
claim is made from that run.

## Phase 2 Operator Check

1. Open Wix SEO settings for the homepage and confirm the title, description, Open Graph data,
   canonical URL, and Organization JSON-LD match `docs/WIX_OPERATOR_EXECUTION_PACKET.md`.
2. Confirm no address, locality, telephone, testimonial, Review, AggregateRating, shop, or cart
   commerce metadata has returned.
3. Confirm FaithCore remains optional and clinically neutral only on its dedicated page.
4. Confirm Vitals metadata uses synthetic demonstration language and the medical boundary.
5. Check desktop and 390px mobile rendering, sitemap, robots, www/non-www redirects, and retired
   store routes.
6. Publish only if a drift correction is necessary and the Wix owner approves the exact edits.
7. Rerun `npm run smoke:wix-public-claims` from a network-enabled operator environment and attach
   the no-secret output to the candidate review packet.

No Wix content or publishing mutation was performed in the current repository pass.
