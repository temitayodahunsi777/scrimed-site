# SCRIMED Intended Use Review

Updated: 2026-07-18

## Purpose

The Intended Use Review turns SCRIMED's proposed memo into a repeatable scope assessment and qualified-review handoff. It is the first internal-human dependency in the Approval Achievement graph because one approved intended-use boundary should govern product behavior, website copy, sales and investor claims, demonstrations, pilot scopes, and regulatory escalation questions.

## Architecture

- `app/lib/intendedUseReview.ts` contains the controlled input model, prohibited-action registry, reviewer/evidence routing, and fail-closed evaluator.
- `app/approvals-readiness/IntendedUseReviewWorkbench.tsx` runs the evaluator entirely in the browser with fixed options and no free-text input.
- `app/lib/approvalsReadiness.ts` publishes the program metadata and default safe-scope result through the existing API and Markdown brief.
- Policy and contract tests prove that no evaluation can self-approve, authorize PHI, grant clinical authority, authorize external use, or authorize production.

## Decision States

- `input-required`: at least one bounded action is missing.
- `blocked-prohibited-scope`: the proposal requests a current NO-GO action, live/restricted data, live care, production operation, or autonomous execution.
- `evidence-required`: the scope is not prohibited, but source, provenance, freshness, or independent verification evidence is incomplete.
- `qualified-review-packet-ready`: the bounded packet may be sent to named human reviewers. It is still not approved.

## Controlled Review Runbook

1. Open `/approvals-readiness#intended-use-review-workbench`.
2. Select the narrowest workflow, operating mode, data class, audience, autonomy level, and evidence posture.
3. Select every action the memo would permit. Do not omit an action to evade a boundary.
4. Remove prohibited scope or open the separate clinical, privacy, security, buyer, and regulatory authorization path.
5. Close every evidence gap until the packet is ready for qualified review.
6. Send the proposed memo and packet to the Founder/CEO, qualified legal reviewer, and clinical governance reviewer. Add specialist reviewers listed by the packet.
7. Retain reviewer identity, decision, date, memo version, effective date, expiry, and evidence references in an approved external system of record.
8. Reconcile website, deck, demo, sales, investor, and pilot language to the approved version through Claim Guard and release controls.
9. Repeat review within 90 days or immediately after a material scope, claim, data, model, workflow, jurisdiction, or deployment change.

## Safety Boundary

No system or agent may approve the memo. The workbench does not provide legal advice, regulatory classification, clinical authorization, PHI authority, production approval, public-claim clearance, customer go-live authority, or a substitute for qualified reviewers. Current live-care and consequential-action NO-GOs remain in force.
