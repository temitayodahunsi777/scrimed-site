# p.34 Nonproduction Preview Acceptance Packet

The pre-wave reference preview was `dpl_AvPmGNQ679NFoGCiPZNfbG5LhFWS` for commit `7c9b2e20ff5648c5d71dc8306fb89e8cf444efe9`. Any precision-wave source change invalidates that exact acceptance binding. The final operator must bind this packet to the replacement deployment, commit, candidate fingerprint, Node 24 runtime, and release fingerprint in external evidence.

## Required Checks

| Surface | Acceptance check |
| --- | --- |
| `/` | Renders, Atlas-first public claims remain safe, no unsupported customer or clinical claim |
| `/scrimed-p34` | Shows synthetic/no-PHI controls and retained review gates |
| `/product` | Shows exact review state, Supabase deficiency, migration state, and commercial readiness truthfully |
| `/synthetic-pilot` | Shows bounded workflow, evidence, metrics, assumptions, and no-production boundary |
| `/api/health` | Reports process/application health only |
| `/api/readiness` | Reports readiness for the current environment and never implies production readiness |
| `/api/scrimed-control-plane/review-readiness` | Read-only, no approval or merge authority |
| Protected writes | Authentication, tenant, policy, evidence, and idempotency controls fail closed |

Run desktop and 390px mobile checks for layout, console errors, hydration errors, unnamed controls, missing landmarks, duplicate IDs, and horizontal overflow. Inspect Vercel status/logs for 4xx/5xx patterns, crashes, policy denials, slow routes, retry storms, and provider errors. Provider calls must remain disabled.

## Required Binding

- exact deployment ID and URL
- exact commit and source tree
- candidate, validation, review, gate, and SBOM fingerprints
- Node 24 runtime
- route and public-claims results
- reviewer/operator identity and timestamp

Acceptance grants no production alias, deployment promotion, migration, PHI, clinical, payer, EHR/device, customer, compliance, or distribution authority.
