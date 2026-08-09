# Preproduction Assurance Manifest

`scripts/generate-preproduction-assurance.mjs` binds the source candidate, validation, review
packet, SBOM, public-claims policy, migration analysis, model registry, operating mode, and gate
registry to exact SHA-256 fingerprints. Generated files live under `artifacts/assurance/` and
`artifacts/governance/`; they are evidence outputs, not source inputs, avoiding recursive hashes.

Run only after the final source mutation and full local validation:

```bash
npm run evidence:preproduction-assurance
```

The generator fails if evidence references a different candidate/source pair, validation fails,
required controls fail, or prohibited capabilities are enabled. A clean commit may be marked
immutable; a dirty worktree remains review evidence only. `preproductionPackagingAllowed` never
grants legal, clinical, privacy, regulatory, migration, deployment, PHI, or customer authority.

Outputs expire after seven days by default. Regenerate after any source, model, architecture,
database, intended-use, data-boundary, claims, clinical-function, deployment-environment, or
security-control change.
