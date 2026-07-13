# SCRIMED Local Quality Runner

The direct-Node quality runner gives operators and coding agents one deterministic path through SCRIMED's local quality gates when a package-manager executable is unavailable or `node_modules` is a read-only symlink.

## Safety Properties

- No package installation or dependency mutation.
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

## Gate Order

1. Generated-output cleanup
2. Generated integrity
3. Workspace hygiene
4. Nonsecret contract suite
5. TypeScript typecheck
6. ESLint
7. Next.js Webpack production build, unless explicitly skipped
8. Post-run generated integrity

The runner stops at the first failure. A `--no-build` result is useful development evidence, but it is not equivalent to a full build pass or release approval.

## Boundaries

This utility does not install dependencies, authenticate users, verify live providers, run protected AAL2 happy paths, deploy, certify compliance, authorize production use, or approve customer go-live. Those gates remain separate and require their named operators and evidence.
