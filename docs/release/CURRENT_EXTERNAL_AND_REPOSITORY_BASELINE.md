# Current External and Repository Baseline

Captured on 2026-08-12 before the enterprise gap-closure source changes. This is a
starting observation, not release authorization or final candidate evidence.

## Repository

| Field | Verified value |
| --- | --- |
| Starting branch | `agent/scrimed-platform-compounding-wave` |
| Starting HEAD | `40044774f1d35aa15eaf6ff7c8c7f6b08b0d639d` |
| Starting worktree | Clean |
| Candidate fingerprint | `6a2f33a71047ef08b2650a503654108e06494dad86071797a8912cdfa2faf7bb` |
| Source fingerprint | `d6c817f772ead562c6357335b4603af10a7d50ebec4690dcac07435e120ec82e` |
| Candidate source files | 58 |
| Exact-source review status | Ready for review; not approved for promotion |

The candidate manifest was regenerated locally from the clean starting HEAD. The
connected GitHub repository is `temitayodahunsi777/scrimed-site`, is public, and the
local starting branch was not found in the connected remote branch inventory. No
push, pull request, merge, or remote setting change occurred during baseline capture.

## Vercel

| Field | Connected observation |
| --- | --- |
| Project | `scrimed-site` |
| Project ID | `prj_94JBnKm2BsZ7qHtEDbUvWmiDWLjn` |
| Team ID | `team_cldXjnApj7aQgNlTTUAzxavw` |
| Project state | `live=false` |
| Latest deployment | `dpl_DTbW64iEeyPaxzcDNjZPhjmFT2Y6` |
| Deployment state | `READY` |
| Deployment target | `null` (non-production preview) |
| Deployment source SHA | `f7ccda035b8bf87ad5ac8ae3ffb9f4d1cd2dd757` |
| Runtime error clusters, prior seven days | None observed |

The Vercel deployment SHA is different from the local candidate HEAD. A READY preview
does not prove that production contains the local candidate, that all application paths
are healthy, or that deployment is authorized.

## Supabase

| Field | Connected observation |
| --- | --- |
| Project | `scrimed-protected-pilot` |
| Project ID | `yxacqdfeyojrjghpwike` |
| Region | `us-east-1` |
| Project state | `ACTIVE_HEALTHY` |
| PostgreSQL | `17.6.1.127` / engine 17 |
| Security advisor | `auth_leaked_password_protection` warning remains open |

The connected migration registry ends at `20260717002347_scrimed_work_completion_evidence`.
The three locally registered migrations dated 2026-07-18, 2026-07-21, and 2026-07-22
remain unapplied. No database mutation or authentication-setting change occurred.

## Figma

| Field | Connected observation |
| --- | --- |
| Connection | Available |
| Plan | Starter |
| Effective access | View only |
| Canvas mutation | Not performed |

The code-side design tokens, component contracts, and Code Connect manifest are
implementation specifications only. They do not claim that Figma components, files,
variables, or mappings were created or changed. A Figma editor with write permission
must review and apply those artifacts through the controlled design workflow.

## Retained Boundaries

This baseline grants no production deployment, migration, PHI processing, clinical
execution, payer or EHR action, medical-device connection, customer activation,
external packet distribution, certification claim, regulatory claim, legal adoption,
or commercial authority. Final evidence must be regenerated after the last source
change and bound to the exact follow-on candidate.
