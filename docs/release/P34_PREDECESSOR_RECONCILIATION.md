# p.34 Predecessor Reconciliation

This record prevents blind merging of p.33-era pull requests into the canonical p.34 successor.

| Predecessor | Relationship to p.34 | Classification | Disposition |
| --- | --- | --- | --- |
| PR #38, Node 24 exact-head candidate | Its head is an ancestor of p.34. Node 24, release provenance, Vercel assurance, and runtime checks are present. | `ALREADY_IN_P34` | Keep open history intact; do not merge it into p.34 again. |
| PR #37, governed investor demo readiness | Its head is an ancestor of p.34. Demo boundaries, evidence language, and release controls are present. | `ALREADY_IN_P34` | Preserve inherited controls; external investor distribution remains unauthorized. |
| PR #26, post-PR25 platform advance | Its head is not an ancestor of p.34 and diverges from the canonical line. | `CONFLICTING` | Do not merge. Review individual controls only if a future traceability audit identifies a concrete p.34 gap. |
| Local p.33 branches | p.34 contains the applicable p.33 control lineage and extends it. | `SUPERSEDED` | No new feature advancement on p.33. Preserve branches as history until an authorized repository owner archives them. |
| p.33 fingerprints and review packets | They describe different source and artifact bytes. | `OBSOLETE` | Never use as p.34 approval evidence. |

## Port Decision

No predecessor code is blindly ported in this wave. The useful Node 24, provider portability, decision evidence, demo safety, and release-assurance controls are already in p.34. Exact-head review binding, universal evidence freshness, dynamic governance, TOCTOU revalidation, expanded egress inspection, and causal trace links are implemented directly on the p.34 line.

## Source-Control Boundary

This reconciliation does not close, merge, delete, or modify predecessor pull requests or branches. Those are repository-owner actions.
