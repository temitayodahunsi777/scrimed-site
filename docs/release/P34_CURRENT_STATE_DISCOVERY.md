# p.34 Current State Discovery

Status: **CURRENT FOLLOW-ON CANDIDATE / AUTOMATED ASSURANCE IN PROGRESS**

| Field | Verified repository state |
| --- | --- |
| Branch | `agent/scrimed-p34-post-review-readiness` |
| Exact candidate binding | generated post-commit in `artifacts/release/p34-current-candidate.json` |
| Upstream | not configured |
| Predecessor | PR #39, `45be650f48e422b05160821681ff40bb9f1229c9` |
| Current PR | not created at discovery |
| Node | 24.19.0 locally; 24.x required |
| Vercel | current follow-on preview not yet bound at discovery |
| Supabase | `scrimed-protected-pilot`; leaked-password protection remains operator-required |
| Migrations | three production-unapplied migrations; production application prohibited |
| AAL2 | fresh exact-preview operator evidence required |
| Human review | not present for this follow-on candidate |

The runtime candidate manifest is generated after source stabilization with `npm run scrimed:p34:evidence`. It is ignored by Git so exact commit evidence does not create a self-referential source mutation.
