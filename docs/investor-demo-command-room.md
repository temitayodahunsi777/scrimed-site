# SCRIMED Investor Demo Command Room

The Investor Demo Command Room converts the existing guided run of show into a human-operated presentation surface. It is designed for internal rehearsal and controlled screen sharing with public, synthetic, and readiness metadata only.

## Routes

- Page: `/investor-demo-command-room`
- Read-only API: `/api/investor-demo-command-room`
- Mode API: `/api/investor-demo-command-room?mode=executive-preview|technical-walkthrough|diligence-walkthrough`

## Control Flow

1. Choose the three-minute executive preview or twelve-minute diligence walkthrough.
2. Run bounded, same-origin `HEAD` checks across every canonical proof route.
3. Confirm the audience, next ask, meeting device, current claims, and artifact-distribution boundary.
4. Start the timer and present the workflow wedge, governance moat, and commercial next step in order.
5. Download a browser-generated internal receipt only after all three chapters are marked presented.

The page stores no buyer identity, contact data, free text, PHI, credentials, or meeting notes. Refreshing the page clears the session. The API is read-only and returns the plan, route contract, confirmation contract, and retained authority boundaries.

The page and API are marked `noindex, nofollow`. They contain no secret material, but they are operator tools rather than public acquisition pages.

## Fail-Closed Readiness

Presentation eligibility requires all of the following:

- The deterministic run-of-show rehearsal contract passes.
- Every expected proof route appears exactly once.
- Every route responds successfully and retains no-PHI, no-live-care, and no-production-connector headers.
- All four human presenter confirmations are checked.
- The command-room authority contract remains false for external send, solicitation, PHI, clinical execution, production release, and independent approval.

A failed route, missing safety header, malformed route set, duplicate confirmation, unknown chapter, or out-of-order chapter blocks the command room. The operator can rerun the route check or reset the session; no state is silently promoted.

## Evidence Boundary

The Markdown receipt is an `INTERNAL_OPERATOR_REHEARSAL` artifact. It is not independent review, investor approval, evidence of an external meeting, permission to distribute a deck, securities offering material, solicitation, customer proof, clinical validation, production approval, or customer go-live authorization.

## Validation

```bash
npm run test:investor-demo-command-room
npm run smoke:investor-demo-command-room
npm run typecheck
npm run lint
npm run build
```
