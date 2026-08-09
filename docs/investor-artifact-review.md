# SCRIMED Investor Artifact Review

SCRIMED Investor Artifact Review is a local, fail-closed quality gate for the strategic investor PowerPoint. It keeps the presentation outside the application source lane while binding every automated review to the exact PPTX SHA-256 fingerprint.

## Commands

```bash
npm run review:investor-deck
npm run review:investor-deck:strict
npm run test:investor-deck-review
npm run contract:investor-deck-review
```

`review:investor-deck:strict` exits unsuccessfully when the artifact is missing, unreadable, malformed, outside bounded archive limits, structurally incomplete, contains placeholders, contains prohibited claims, omits required boundaries, or lacks first-party source attribution.

Set `SCRIMED_INVESTOR_DECK_PATH` only when reviewing an alternate local deck. The reviewer does not print the artifact path or slide text.

## Automated Checks

- Deterministic artifact SHA-256 fingerprint.
- Bounded PowerPoint ZIP parsing with encrypted, oversized, malformed, and unsupported entries rejected.
- Eight-to-twenty-slide narrative range and nonempty slide content.
- No unresolved `TODO`, `TBD`, or placeholder copy.
- No certification, clinical-validation, autonomous-care, doctor-replacement, guaranteed-outcome, or implied OpenAI relationship claim.
- Internal-draft, no-PHI, human-review, relationship, external-release, and no-payer-submission boundaries.
- First-party source attribution for the OpenAI strategic-fit discussion.

## Release Sequence

1. Run strict automated review.
2. Record the exact artifact fingerprint in the controlled external release packet.
3. Obtain founder, counsel/claims, and finance decisions against that exact fingerprint.
4. Bind the approved artifact to a clean immutable source revision and recipient-specific release authority.
5. Re-run strict review whenever the deck changes. Any changed byte produces a new fingerprint and invalidates prior artifact-specific review.

## Boundary

Automated review is not legal review, finance approval, accounting advice, securities advice, an investment solicitation, customer permission, partnership evidence, clinical validation, compliance certification, or external distribution approval. It never commits source, deploys code, applies migrations, authorizes PHI, authorizes clinical care, or permits release promotion.
