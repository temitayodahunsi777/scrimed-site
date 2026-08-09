# SCRIMED Local Quality Runner

The direct-Node quality runner gives operators and coding agents one deterministic path through SCRIMED's local quality gates when a package-manager executable is unavailable or `node_modules` is a read-only symlink.

## Safety Properties

- No package installation or dependency mutation.
- Clean runs may retain only an integrity-checked `.next/cache`; routes, manifests, build IDs, and TypeScript build metadata are always removed.
- Duplicate-suffixed Next output is removed only when every duplicate byte is already present in its canonical counterpart; divergent or orphaned output fails closed.
- Synthetic and no-secret validation only.
- Sensitive environment variables, including sensitive names declared in local dotenv files, are cleared before child checks run.
- Every stage has a timeout and fails closed on missing tools, nonzero exits, or timeouts.
- The runner uses the active Node executable and repository-local TypeScript, ESLint, and Next.js entrypoints.
- Consequential, authenticated, production, PHI, connector, payer, and EHR workflows are outside this runner.

## Commands

Run the complete local release-quality sequence, including the production build:

```bash
node scripts/scrimed-local-quality-runner.mjs
```

Run the same checks without the production build during a focused edit loop:

```bash
node scripts/scrimed-local-quality-runner.mjs --no-build
```

Verify only that the local runtime and required repository entrypoints are readable:

```bash
node scripts/scrimed-local-quality-runner.mjs --preflight
```

Where `npm` is available, `npm run quality:direct-node` invokes the same runner. The direct command remains canonical for constrained local environments.

After a successful production build, run the public route smoke through the managed localhost-only lifecycle:

```bash
npm run smoke:public:local
```

This command owns the local Next server lifecycle: it rejects a busy port, starts the built
application on `127.0.0.1`, waits for the operating-mode endpoint, runs the public smoke,
shuts the server down on success or failure, and checks generated integrity afterward. It
inherits only a small nonsecret environment allowlist, shadows every variable declared by
local dotenv files, and forces PHI, protected-write, provider-call, clinical-execution,
device, payer, EHR, and other consequential flags into their safe states. If building or
serving produces duplicate-suffixed `.next` output, the generated-output postflight removes
only proven-redundant copies and preserves the canonical build. A divergent copy or missing
canonical counterpart fails closed, after which the existing cleanup removes untrusted
output and requires a clean rebuild.

Before opening a listener, the managed smoke verifies the canonical build, rendered public
HTML, page-specific canonical and Open Graph URLs, crawler artifacts, and prohibited-claim
policy. If the environment blocks local listeners, it reports that rendered-build evidence
passed but still exits nonzero because build inspection is not equivalent to HTTP verification.

Use a different unprivileged port when necessary:

```bash
node scripts/scrimed-local-public-smoke-runner.mjs --port=3051
```

## Gate Order

1. Generated-output cleanup
2. Generated integrity
3. Workspace hygiene
4. Nonsecret contract suite
5. TypeScript typecheck
6. ESLint
7. Next.js Webpack production build, unless explicitly skipped
8. Generated-output postflight, unless the build was skipped
9. Rendered public-release verification, unless the build was skipped
10. Post-run generated integrity

The runner stops at the first failure. A `--no-build` result is useful development evidence, but it is not equivalent to a full build pass or release approval.

The cache is an optimization, never release evidence. A symlink or duplicate-suffixed cache entry
causes the complete `.next` tree to be discarded. CI keys the cache to the operating system,
dependency lock, application, scripts, and build configuration; every run still compiles, verifies
rendered artifacts, and checks generated integrity.

## Boundaries

This utility does not install dependencies, authenticate users, verify live providers, run protected AAL2 happy paths, deploy, certify compliance, authorize production use, or approve customer go-live. Those gates remain separate and require their named operators and evidence.
