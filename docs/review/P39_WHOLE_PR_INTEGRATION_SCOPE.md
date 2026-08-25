# PR #39 Whole-PR Integration Scope

PR #39 is a canonical-history integration candidate, not a 33-file standalone patch. GitHub reported 286 files at the pre-wave exact head. The direct p.34 gap-closure was layered on inherited, already-reconciled platform work. Review must therefore separate lineage from risk.

## Review Surfaces

1. **Full PR inventory:** the authoritative GitHub file list is captured in `artifacts/review/p39-pr-file-inventory.json`.
2. **Direct p.34 lineage:** the generator compares the authoritative p.34 base `48c49a065f0eef969e0927ca94894e10c693d5f0` with the candidate and includes current precision-wave files.
3. **Inherited predecessor lineage:** every PR file outside the direct set remains `INHERITED_CANONICAL`; it is not silently attributed to the p.34 gap closure.
4. **Primary file classification:** generated evidence, tests, and documentation retain their own class while the separate lineage field records direct or inherited provenance.
5. **Risk ownership:** every file maps to one of governance, clinical operating system, security, approvals, evidence, tenant isolation, egress, model routing, agents, migrations, Vercel, Supabase, Product Console, public claims, or commercial controls.

The generated artifacts are:

- `artifacts/review/p39-review-map.json`
- `docs/review/P39_REVIEW_MAP.md`

The generator fails if the source inventory is malformed or any path is classified `UNEXPECTED`. A complete map compresses the review surface; it does not replace independent review.

## Reviewer Sequence

1. Inspect all P0 groups and direct p.34 lineage.
2. Confirm tests and generated evidence bind to the same source tree.
3. Sample inherited canonical groups using their predecessor evidence.
4. Record exact-head review separately, with a distinct named reviewer.

No generated map can mark `APPROVED_BY_HUMAN`, authorize merge, or authorize production.
