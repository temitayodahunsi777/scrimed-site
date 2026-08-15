# SCRIMED Node Runtime Baseline

## Candidate Protection

- Observed branch: `agent/scrimed-p33-integrated-upgrades`
- Exact p.33 base commit: `b2db37e7966ce00b2a7d783e712607a560e1097c`
- Base tree: `6856fe3f42e13ff2d1f490f8fdb119e89a6d921d`
- Base worktree: clean
- Follow-on branch: `agent/scrimed-node24-vercel-upgrade`
- Decision: preserve the reviewed p.33 branch and perform runtime work only on the follow-on branch.

## Repository Baseline

| Surface | Before migration | Target |
| --- | --- | --- |
| `package.json` engine | undeclared | `24.x` |
| Local runtime files | absent | `.nvmrc=24`, `.node-version=24` |
| Canonical package manager | npm by package lock, CI, Vercel, and Dependabot | npm only |
| Lockfile | `package-lock.json`, lockfile v3 | unchanged format |
| Vercel install | `npm install` | `npm ci` |
| GitHub runtime declarations | 11 declarations on Node 22 | Node 24 |
| Next.js | 16.2.12 | unchanged |
| React | 19.2.4 | unchanged |
| TypeScript | installed 5.9.3 | unchanged |
| Supabase JS | installed 2.110.7 | unchanged |

The managed local shell exposed neither `node` nor `npm`. SCRIMED validation therefore used the bundled Node `24.19.0` executable. The repository remains npm-native; the local direct-Node runner is an environment workaround, not a second package-management architecture.

## Vercel Baseline

Read-only connected-project inspection on 2026-08-14 found:

- `scrimed-site` (`prj_94JBnKm2BsZ7qHtEDbUvWmiDWLjn`): project setting Node `24.x`; latest deployment `dpl_DTbW64iEeyPaxzcDNjZPhjmFT2Y6`, READY preview, not the Node 24 candidate.
- `nextjs-boilerplate` (`prj_dksCaA0qDJOF206DAV99hQlqTqJX`): project setting Node `22.x`; latest historical deployment READY with production target.
- `scrimed-site` runtime errors: no clusters returned for the preceding seven days.

The repository engine is the authoritative target because Vercel documents that `engines.node` overrides the project setting. The primary Vercel project setting is now reconciled with that target; an exact-candidate preview remains separately authorization-gated.

## Baseline Fingerprints

- `package.json`: `292937b3d2e3e2584ee421f549e1b58b737a031a059c19de6d4df2bf8e028957`
- `package-lock.json`: `05ebb3bdce5111fc6dd2ecd648d35f69d8782e5a55e1596557dec0d85eb84827`

These are pre-migration references only and must not be reused as final-candidate evidence.

## Safety Boundary

Runtime migration does not authorize production deployment, migration execution, live PHI, clinical execution, payer action, EHR or device writeback, customer activation, certification claims, or external distribution.
