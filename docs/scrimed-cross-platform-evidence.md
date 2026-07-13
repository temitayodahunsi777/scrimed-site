# SCRIMED Cross-Platform Evidence Reconciler

## Purpose

The Cross-Platform Evidence Reconciler converts dated, no-secret observations from GitHub, Vercel, Supabase, Wix, and Figma into one governed release decision. It prevents a healthy provider badge or polished public page from being mistaken for evidence that the current product revision, data plane, claims, design, and approvals are aligned.

This is a read-only evidence layer. It does not connect providers at runtime, store credentials or raw logs, mutate external systems, deploy code, apply migrations, approve testimonials, or grant production authority.

## Evidence Contract

Every platform record contains:

- provider and control domain;
- observed and expiry timestamps;
- source class and safe source reference;
- facts and detected drift;
- severity and release status;
- approval impact and accountable owner;
- exact next action;
- deterministic audit hash;
- explicit false values for secrets, raw logs, external mutations, and production authority.

Snapshots expire quickly. Expired observations are marked `refresh-required`; they cannot silently remain current evidence.

## Current Reconciliation

- **GitHub:** the current working build is not bound to one immutable reviewed revision.
- **Vercel:** the observed deployment is ready and has no recent runtime-error cluster, but dirty-build metadata and missing live control-plane routes block promotion claims.
- **Supabase:** the project is healthy, while pending durable-store migrations and advisor findings block the protected data-plane gate.
- **Wix:** the live named testimonial requires removal or signed authorization and claim substantiation.
- **Wix editor boundary:** the CMS inventory contains no testimonial collection, so the affected section is static editor content. A narrow CMS API mutation is unavailable, and a blind whole-site publish is prohibited.
- **Wix privacy containment:** the Voice Intake Assistant form was disabled through a narrow Forms API update and verified at revision 2. Two general free-text contact forms still require explicit no-PHI copy and privacy review.
- **Wix data boundary:** the dashboard identifies the current configuration as not HIPAA compliant; public forms, chat, booking, and collection surfaces must remain explicitly no-PHI.
- **Figma:** the account is connected, but a canonical editable design source is not yet bound to release review.

## Approval Path

1. Remove or substantiate the public testimonial and record Founder, legal, and marketing review.
2. Partition the working tree into a reviewable release candidate and bind quality evidence to its immutable revision.
3. Authorize a nonproduction Supabase target, apply pending migrations there, disposition advisor findings, and run strict AAL2 smoke.
4. Complete the existing intended-use review with named Founder/CEO, qualified healthcare counsel, and clinical-governance signoff.

The exact public-copy correction and live verification commands are in `docs/public-claims-integrity.md`.

No SCRIMED agent can approve any of these steps. External and named human authority remains required.

## Safe Replacement For Social Proof

Until a customer authorizes a named claim, public pages should use dated, inspectable proof:

- synthetic demonstration coverage;
- verified build and smoke status;
- governance and human-review controls;
- interoperability conformance evidence;
- clearly labeled outcome hypotheses and measurement plans;
- no-PHI pilot scope and approval boundaries.

Recommended replacement copy:

- Eyebrow: `Proof Before Promises`
- Heading: `Inspect the evidence behind SCRIMED.`
- Body: `Review no-PHI demonstrations, governance controls, interoperability evidence, and clearly bounded pilot-readiness artifacts before making a buying decision.`
- Disclosure: `Synthetic demonstration and decision-support scope only. Do not submit patient information through this website.`

## Endpoint

`GET /api/scrimed-control-plane/platform-evidence` returns the typed snapshot, release blockers, approval path, safe scope, boundary, and audit hash. It shares the control plane's private no-store and no-production-authority headers.

## Validation

```bash
npm run contract:scrimed-control-plane
npm run test:nonsecret
npm run typecheck
npm run lint
npm run build
node scripts/scrimed-control-plane-smoke.mjs --compiled
```

## Boundary

The reconciler grants no PHI, clinical, payer, EHR, deployment, customer, testimonial, regulatory, certification, or go-live authority. Provider observations must be refreshed and reviewed before every release decision.
