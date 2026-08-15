# Node 22 to Node 24 Differential

## Method

The exact same deterministic p.33 policy, contract, artifact, fingerprint, route-inventory, and build checks should be executed under Node 22 and Node 24. The final candidate targets Node 24 only.

## Current Evidence

| Signal | Node 22 | Node 24 |
| --- | --- | --- |
| Exact local binary | temporary `node-bin-darwin-arm64` 22.23.2, outside repository dependencies | bundled 24.19.0 |
| p.33 policy checks | 22/22 passed | 22/22 passed |
| p.33 contract checks | 16/16 passed | 16/16 passed |
| p.33 generated artifacts | 2/2 passed | 2/2 passed |
| Route inventory | 627 | 627 |
| Prerendered routes | 243 | 243 |
| Node 24 certification | expected FAIL: `runtime-major` only | PASS |

The temporary Node 22 runtime changed no repository dependency or lockfile. Its build verified route parity, while the certification verifier correctly rejected it because the candidate requires Node 24. The connected Node-22 Vercel preview is commit `f7ccda035b8bf87ad5ac8ae3ffb9f4d1cd2dd757`, not the p.33 source, so it remains only an operational baseline.

## Decision Rule

Any Node-dependent change to clinical evidence hashes, candidate hashes, route counts, policy outcomes, or fail-closed behavior is a migration failure until explained and reviewed. Build IDs and timestamps are not expected to match across independent builds and are excluded from deterministic source fingerprints.

No policy, contract, artifact, route-count, prerender-count, or fail-closed difference was observed. Runtime metadata is intentionally included in the Node 24 certification fingerprint, so Node 22 and Node 24 certification fingerprints are expected to differ.
