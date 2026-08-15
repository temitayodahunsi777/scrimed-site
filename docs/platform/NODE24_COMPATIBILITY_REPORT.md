# Node 24 Compatibility Report

Status: local implementation and compatibility validation complete on the follow-on branch; exact-head review and Vercel preview remain controlled gates.

## Dependency Assessment

| Component | Installed version | Classification | Evidence or required action |
| --- | --- | --- | --- |
| Node.js | 24.19.0 local verifier | COMPATIBLE | Runtime policy and certification scripts require major 24. |
| Next.js | 16.2.12 | COMPATIBLE | Package engine is Node `>=20.9.0`; production build is the acceptance test. |
| React / React DOM | 19.2.4 | COMPATIBLE | No Node-native addon or Node-22-specific contract detected. |
| TypeScript | 5.9.3 | COMPATIBLE | Engine supports current and later Node versions. |
| `@types/node` | 22.20.1 | COMPATIBLE | Current code uses no Node-24-only type surface; upgrade is optional future maintenance, not required for runtime migration. |
| ESLint | 9.39.4 | COMPATIBLE | Engine supports Node `>=21.1.0`. |
| `eslint-config-next` | 16.2.12 | COMPATIBLE | Validated through repository lint. |
| Supabase JS | 2.110.7 | COMPATIBLE | Package requires Node `>=22`; auth/RLS/no-secret contracts remain part of certification. |
| Upstash Redis / rate limit | 1.38.0 / 2.0.8 | COMPATIBLE | Pure JavaScript client path; no production connection is exercised. |
| Sharp | 0.35.3 | COMPATIBLE | Package engine is Node `>=20.9.0`; build verifies installed native artifact behavior. |
| Next SWC | 16.2.12 | COMPATIBLE | Native artifact is installed; the known local Team-ID warning and supported WASM fallback must remain visible if emitted. |
| `unrs-resolver` | 1.12.2 | COMPATIBLE | N-API platform binding is exercised by lint/build; install script remains lockfile controlled. |
| Playwright | CI-installed 1.55.0 for preview checks | UNVERIFIED | The local package is unavailable. The approved browser-control path verified the Product Console at 1280px and 390px; CI still owns the automated Playwright preview check. |
| Prisma | not installed | NOT_APPLICABLE | No Prisma runtime or binaries are present. |
| Docker/devcontainer | absent | NOT_APPLICABLE | No container runtime declaration requires synchronization. |
| pnpm/Corepack | not canonical | NOT_APPLICABLE | npm and `package-lock.json` remain the sole repository package-manager contract. |

## API and Runtime Audit

The active code uses stable Node APIs: `node:crypto`, Buffer, Web Fetch through Next.js, URL, streams, filesystem utilities in scripts, and bounded child processes in release tooling. No deprecated Node-22-only API, custom TLS override, worker-thread dependency, node-gyp project addon, or ambient shell execution path was found.

## Acceptance Conditions

## Local Validation Evidence

- Node 24.19.0 direct quality runner: 10/10 gates passed.
- TypeScript and ESLint: passed.
- Full nonsecret suite: passed.
- p.33 policy, contract, and artifact checks: 22/22, 16/16, and 2/2 passed.
- Next.js webpack production build: 627 routes and 243 prerendered routes.
- Public HTTP smoke: passed; protected APIs remained fail-closed.
- Secret scan: 0 findings across 1,701 files.
- SBOM: 422 components, zero dependency delta, hash `7e4897205b57e807`.
- Product Console API: reduced from 775,065 bytes to 173,597 bytes while retaining safety compatibility projections.
- Responsive browser verification: 1280px and 390px widths passed with no overflow or browser warnings/errors.
- Default Turbopack cannot follow the managed external `node_modules` symlink in this local workspace. The repository's supported webpack build succeeds. This is an environment constraint, not a source compatibility failure.

Compatibility becomes exact-head evidence only after the attributable local commit is created and the final Node 24 certification is rerun against that SHA. Vercel preview verification remains separately authorized.
