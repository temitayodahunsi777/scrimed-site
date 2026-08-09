# Candidate Review Packets

Candidate review packets are generated from the current worktree. Do not store static copies as
source truth because every source mutation changes the candidate and packet fingerprints.

Generate the complete packet:

```bash
npm run release:candidate-review-packet:strict
node scripts/release-candidate-review-packet.mjs --strict --json
```

Generate the five least-disclosure reviewer batches in risk order:

```bash
node scripts/release-candidate-review-packet.mjs --strict --batch=release-security-data --markdown
node scripts/release-candidate-review-packet.mjs --strict --batch=runtime-clinical-api --markdown
node scripts/release-candidate-review-packet.mjs --strict --batch=product-claims-ui --markdown
node scripts/release-candidate-review-packet.mjs --strict --batch=quality-evidence --markdown
node scripts/release-candidate-review-packet.mjs --strict --batch=documentation-operations --markdown
```

Each export binds the candidate, source, parent review packet, batch, file references, and batch
export digest. It includes no source content, raw diff, secret, token, credential, or PHI.
Assigned reviewers must use an approved internal channel and record dispositions against exact
fingerprints. A packet or batch export grants no approval, commit, release, deployment,
migration, distribution, PHI, clinical, payer, EHR, or customer-go-live authority.
