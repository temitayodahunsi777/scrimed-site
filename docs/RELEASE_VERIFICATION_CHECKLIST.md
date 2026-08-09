# Public Release Verification Checklist

## Local Candidate

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test:nonsecret`
- [ ] `npm run security:secret-scan`
- [ ] `npm run security:sbom`
- [ ] `npm run build`
- [ ] `npm run verify:public-release`
- [ ] `node scripts/check-generated-integrity.mjs`
- [ ] `git diff --check`

If `npm` is unavailable, use
`node scripts/release-candidate-validation.mjs --strict`; its recorded direct-Node
fallback executes the same repository-owned gates and does not authorize release.

## Content And Safety

- [ ] Atlas-first primary message.
- [ ] FaithCore optional and clinically neutral.
- [ ] No customer, outcome, address, certification, deployment, or regulatory claim without evidence.
- [ ] No Review or AggregateRating metadata.
- [ ] No-PHI, synthetic, human-review, medical, AI, emergency, and device boundaries visible.
- [ ] Operating-mode API reports all consequential flags OFF.
- [ ] Public forms require consent, reject likely PHI/markup, rate limit, and avoid full-content logs.

## External Marketing Release

- [ ] Wix static content corrected and unrelated drafts reviewed.
- [ ] Wix SEO title/description are Atlas-first; unverified telephone/address JSON-LD is removed.
- [ ] Shop/cart/store surfaces removed or separately authorized.
- [ ] Desktop/mobile and canonical/metadata inspection complete.
- [ ] `npm run smoke:wix-public-claims` passes against the published site.
- [ ] `npm run smoke:wix-publication-verification` passes across the full Wix route, metadata,
  structured-data, redirect, crawler, and commerce-boundary inventory.
- [ ] `npm run smoke:public:local` passes and reports `server_stopped=true` plus generated
  integrity, so no serving process remains attached to the build output.
- [ ] DNS, redirects, TLS, sitemap, robots, cache, and build identifier verified.

## Authorization

Record fingerprint-bound approvals only after the attributable candidate is committed, the
worktree is clean, and candidate/source/artifact/validation fingerprints are regenerated.
Earlier review preparation does not remain valid after the candidate identity changes.

A passing checklist is engineering evidence only. Named Founder, legal, privacy, security, clinical/regulatory, marketing, deployment, and customer approvals remain separate where applicable.
