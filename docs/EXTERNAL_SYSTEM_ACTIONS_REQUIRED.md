# External System Actions Required

## P0 - Wix Marketing Site

**Owner:** Founder/site owner with Legal, Privacy, Clinical Safety, and Marketing review.

Cache-bypassed verification on 2026-07-23 confirmed that the published Wix homepage no longer
renders the named testimonial, street address, or Shop navigation in its current page body.
The visible hero now uses governed, no-PHI, human-review language. The published HTML still
contains faith-first title/description metadata, unverified Atlanta/telephone Organization
JSON-LD, and an unsafe vitals blog excerpt injected by the homepage post list. Static Wix Editor
SEO fields are not controlled by this repository, and the documented Wix REST API exposes tag
resolution rather than safe mutation of those fields.

Required actions:

1. Set the homepage SEO title to `SCRIMED | Governed Healthcare Intelligence`.
2. Set the homepage description to `SCRIMED develops trustworthy, interoperable, human-supervised healthcare intelligence workflows. Synthetic demonstration only; do not submit PHI.`
3. Remove the Organization JSON-LD `telephone` and `address` values unless Founder and counsel verify them. Retain only name, canonical URL, verified email, and formally approved social profiles.
4. Replace or unpublish the vitals post excerpt that promises `real-time, predictive, and faith-centered patient monitoring`; use the synthetic-only copy in `docs/WIX_METADATA_IMPLEMENTATION_CHECKLIST.md`.
5. Keep the current testimonial-free Validation and Evidence section. Add customer outcomes only after evidence and publication permission exist.
6. Keep Shop/cart/checkout surfaces unpublished. Review whether the installed Wix Stores app has dependencies before an authorized site owner removes it.
7. Keep FaithCore on a distinct optional page/path and use the exact neutrality statement from `app/lib/legalPolicies.ts`.
8. Add no-PHI warnings and privacy consent to all Forms, Chat, Bookings, uploads, and free-text fields. Keep unrestricted voice intake disabled.
9. Add or link the interim legal pages, then replace them only after counsel approval.
10. Preview desktop/mobile, inspect Wix change history for unrelated drafts, obtain named approval, publish, purge cache if needed, and run `npm run smoke:wix-public-claims`.

The exact field-by-field procedure is in `docs/WIX_METADATA_IMPLEMENTATION_CHECKLIST.md`.

## P0 - Legal And Business Identity

**Owner:** Founder + qualified counsel.

Verify legal entity, public address decision, jurisdiction, governing law, privacy posture, terms, cookie inventory, refund terms, accessibility scope, healthcare disclaimer, processors, retention, and international coverage.

## P1 - Domain, DNS, CDN, And SEO

**Owner:** Founder + domain/deployment administrator.

Verify `https://www.scrimedsolutions.com` and `https://scrimedsolutions.com` redirect/canonical behavior, HTTPS, DNS ownership, Wix/Vercel responsibilities, sitemap, robots, Open Graph, structured data, stale service workers, and cache purge. Do not change registrar records without a reviewed rollback plan.

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
