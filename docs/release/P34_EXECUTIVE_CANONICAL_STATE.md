# p.34 Executive Canonical State

Status: **AUTOMATED ASSURANCE IN PROGRESS / EXACT-HEAD INDEPENDENT REVIEW REQUIRED**

| Control | Canonical source | Current state |
| --- | --- | --- |
| Candidate | `artifacts/release/scrimed-p34-release-manifest.json` | Generated only after the source is frozen |
| Review | PR #40 + `artifacts/review/p34-final-risk-ranked-diff.json` | Named independent review not present |
| Routes | `artifacts/build/routes.json` | Generated from the Next build; no manual expected count |
| Rendering | `artifacts/build/render-inventory.json` | Generated from build manifests and build output |
| Preview | exact candidate Vercel preview | Nonproduction only; acceptance must be candidate-bound |
| AAL2 | `artifacts/security/p40-aal2.json` | Fresh operator evidence required |
| Supabase | project `yxacqdfeyojrjghpwike` | Passwordless compensating control active; leaked-password feature deferred |
| Migrations | three checksum-bound files | Static ready; production unapplied and unauthorized |
| Synthetic pilots | six bounded archetypes | No-PHI/nonproduction execution only with scope approval |
| Protected pilot | external authority | Not authorized |
| Production | external authority | Not authorized |

The conversion wave began at `9e58d8dbc2bfe15f1334cc0b6dadf479f5fbddb2`. The exact successor values must be read from the canonical ignored manifest so tracked documentation never self-references its own commit. No production, migration, PHI, clinical, payer, EHR/device, customer, merge, or external-distribution authority is inferred.
