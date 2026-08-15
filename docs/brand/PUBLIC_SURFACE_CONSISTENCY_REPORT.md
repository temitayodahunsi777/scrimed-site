# Public Surface Consistency Report

Observed: 2026-08-15

## Surfaces

| Surface | Authority | Current posture | Next verification |
| --- | --- | --- | --- |
| Wix marketing site | Wix owner/editor | Atlas-first, FaithCore optional; strict 17-page published verification passed | Run published Wix verifier after each publication |
| `app.scrimedsolutions.com` | Vercel release workflow | Older production surface; current candidate smoke detects Atlas-first navigation drift | Do not mutate; reconcile only through separately authorized release workflow |
| Vercel preview | Candidate-specific preview | Preferred nonproduction verification surface; exact remediated preview pending | Run desktop, 390px, public claims, protected-denial, health, and readiness checks |
| Repository metadata | Source control | Canonical claims, pricing boundaries, legal notices, and evidence routes | Run nonsecret and public verifier suites |

## Required Consistency

- Main enterprise identity remains Atlas-first and faith-neutral.
- FaithCore remains optional, opt-in, and unable to affect clinical logic.
- Workflow Intelligence Assessment uses nonbinding starting-price language.
- Public experiences remain synthetic/demo-first unless separately validated and approved.
- No unverified address, telephone, customer, investor, partner, outcome, certification, clinical,
  or production claim may appear.
- Public pages and metadata must point to the preferred canonical domain where controlled.

Wix publication, search reindexing, CDN propagation, Supabase settings, and deployment provenance
remain external platform evidence. Repository checks can detect drift but cannot substitute for
owner-controlled publication or configuration evidence.

## Verification Evidence

| Check | Result | Meaning |
| --- | --- | --- |
| `npm run smoke:wix-public-claims` | PASS | Published Wix copy has no blocked claims or missing disclosures. |
| `npm run verify:wix-production` | PASS | 17 pages, metadata, JSON-LD, redirects, crawler files, retired commerce routes, and canonical behavior passed. |
| Local candidate production build | PASS | 627 routes and six rendered public artifacts passed source and built-output policy. |
| Local candidate public smoke | PASS | Atlas-first navigation, public claims, APIs, and protected fail-closed behavior passed. |
| Production app public smoke | DRIFT DETECTED | The deployed root predates the candidate's current Atlas-first navigation contract. This is not permission to deploy. |

The production drift is intentionally not hidden or reclassified. The remediated exact-head
preview must pass before review, and production remains unchanged until separate merge and
deployment authorization exists.
