# p.34 Stacked Review Plan

The final candidate is a two-PR stack. PR #40 approval alone cannot establish assurance for the complete `main -> final head` change set.

| Lane | Scope | Required disposition |
| --- | --- | --- |
| LANE_A_PREDECESSOR | PR #39: `fd2a4d09174726e5ba685673fe1f0df25f2ad308` -> `45be650f48e422b05160821681ff40bb9f1229c9` | Independent exact-head review |
| LANE_B_DELTA | PR #40: `45be650f48e422b05160821681ff40bb9f1229c9` -> exact manifest head | Independent exact-head review |
| LANE_C_INTEGRATION_ASSURANCE | `fd2a4d09174726e5ba685673fe1f0df25f2ad308` -> exact manifest head | Automated cumulative assurance; never a human-approval substitute |

## Review Order

1. Review and decide PR #39.
2. Review and decide PR #40.
3. Confirm cumulative certification, route/render inventories, security, migrations, preview, and public claims against the exact final manifest.

A reviewer may cover both PRs when repository policy permits, but each decision must bind its own exact SHA. Review approval grants no merge, migration, production, protected-pilot, customer, PHI, clinical, payer, EHR/device, contract, or distribution authority.

Machine-readable plan: `artifacts/review/p34-stacked-review-plan.json`.
