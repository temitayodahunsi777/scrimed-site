# External System Actions Required

## P0 - Wix Marketing Site — Resolved And Expanded 2026-07-27

**Owner:** Founder/site owner.

The Wix-controlled public-claims remediation was completed through the authenticated Editor,
published, and directly verified. The production site now has:

- Atlas-first homepage SEO and Open Graph metadata;
- conservative Organization JSON-LD without address or telephone;
- synthetic-only Vitals language and explicit clinical boundaries;
- optional, clinically neutral FaithCore positioning;
- no named testimonial, review/rating schema, template store products, or active store category;
- canonical HTTPS www URLs and consistent redirects;
- clean desktop and 390px mobile About-page rendering;
- a passing strict publication smoke across 17 pages, six crawler files, redirects, retired
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

- Vercel: `app.scrimedsolutions.com` was `READY` on 2026-07-23 at commit `5e77beea57f458883f7544421b2014fd4e28ac67`; no runtime-error clusters were reported in the preceding 24 hours. The local candidate is intentionally not deployed. Candidate-to-production comparison correctly returned `404` for `/validation-evidence`, `/legal`, `/api/operating-mode`, and `/api/public-release-status`, proving that this remediation is not yet live. Before release, bind authorization to the exact reviewed candidate, verify environment-name inventory and headers, deploy through the approved workflow, then collect post-deployment smoke evidence.
- GitHub: the latest four scheduled Agent Workspace/TrustOps runs were successful, and the most recent observed CI run was successful. Verify required reviews/checks, branch protection, private vulnerability reporting, secret scanning/push protection, and exact candidate provenance in repository settings; these settings were not mutable or fully visible through the connected read-only surface.
- Supabase: project `scrimed-protected-pilot` was `ACTIVE_HEALTHY` on Postgres 17.6.1. Security Advisor reconfirmed one warning on 2026-07-23: leaked-password protection is disabled. The connector has no scoped Auth-setting mutation, so follow `docs/SUPABASE_SECURITY_OPERATOR_CHECKLIST.md`, then rerun Security Advisor. No production migration was applied in this work. The local migration set contains three later migrations not present in the observed production list: `clinical_assurance_control_plane`, `p32_evidence_attestation_issuances`, and `p32_candidate_review_control_plane`. Static review is recorded in `docs/PENDING_MIGRATION_AUTHORIZATION_PACKET.md`; disposable-database dry-run and database-owner authorization remain required.
- Supabase Performance Advisor reported informational unused-index findings. Do not remove those indexes from an early-stage workload solely because usage counters are currently zero; collect representative query/load evidence and review write/read tradeoffs first.

These checks do not authorize deployment or production mutation.

## Verification

- No prohibited copy in the rendered marketing homepage or metadata.
- Required no-PHI, synthetic, human-review, medical, AI, emergency, and FaithCore boundaries visible.
- No Shop/cart, unverified address, testimonial, review schema, or unsafe vitals claim.
- Desktop and mobile visual review complete.
- Strict marketing smoke passes and evidence is bound to the published revision.
