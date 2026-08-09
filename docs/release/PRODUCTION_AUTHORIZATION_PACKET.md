# Production Authorization Packet

Status: not authorized. Prepared for future named human review only.

## Required candidate evidence

- Exact immutable commit and source tree.
- Candidate, source, validation, review-packet, artifact, and SBOM fingerprints.
- Fresh exact-head independent review.
- Separate merge receipt and preview-verification evidence.
- Current security, privacy, legal, clinical, intended-use, and claims decisions.
- Migration decision with disposable dry run and recovery evidence.
- Environment, services, window, expiry, rollback owner, monitoring plan, and change owner.

## Current blockers

- PR #25 remains `REVIEW_REQUESTED`.
- No merge authorization exists.
- No production deployment authorization exists.
- Three migrations remain nonproduction and separately approval-gated.
- Live PHI, clinical execution, payer actions, EHR/device writes, certification claims, and customer activation remain disabled.
- Supabase leaked-password protection still requires current external-setting verification.
- True mobile-variant Wix verification remains an owner action.

## Rollback and post-deploy requirements

An authorized deployment must identify the prior verified deployment, rollback owner, maximum recovery time, health checks, policy-denial tests, tenant-isolation tests, no-PHI logging checks, exact artifact comparison, and decision criteria for rollback. A deployment is not production-verified until these checks pass against the deployed target.

This packet does not expose a deployment command and grants no deployment authority.
