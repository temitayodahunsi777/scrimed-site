# SCRIMED p.34 Clinical Operating System Implementation Manifest

Status: source implementation and full safe local validation complete; exact local commit and post-commit candidate evidence pending.

Baseline: `c9cf72d1cefb608837b3012539c114e06c824260` on `agent/scrimed-p34-adaptive-governance`.

Implementation branch: `agent/scrimed-clinical-ops-p34`.

## Architecture

| Area | Existing component extended | Primary implementation |
| --- | --- | --- |
| Decision evidence | p.33 Decision Evidence Ledger | p.34 canonical clinical operating governance record and query service |
| Autonomy | p.33 exact-action policy and p.34 action maturity | A0-A3 contract and scoped structural approval evaluator; execution authorization fixed false pending trusted atomic consumption |
| PHI and secrets | p.34 capability admission and existing no-PHI boundaries | Field registry, startup gate, trusted-clock token-vault adapter, one-use validator grants, egress scan, break glass, secret handles |
| Agent isolation | Existing p.34 placement and contained tool stages | Provider-neutral sandbox policy review; runtime authorization fixed false pending canonical/open-time containment |
| Context and retrieval | p.33 Context Fabric and p.34 provenance envelope | Authenticated tenant/purpose plus alias/freshness/authority/rerank/citation evaluator |
| Validation | p.33 oversight sentinel and p.34 two-loop ratchet | External clinical validation and oversight-drift contracts |
| Patient output | Existing patient-education decision-support boundary | Patient Take-Home preview and preferences |
| Coding | Existing coding/documentation support boundary | Assisted/computer-assisted contract with billing release blocked |
| Operations | Existing checkpoints, idempotency, FinOps, and resilience | Retry classification, suspension, dead-letter, and checkpoint recovery decision |
| Claims | Existing public claims policy | Structural claim evidence/expiry/audience/channel contract with publication fixed false pending trusted evidence and named approval |
| Operator visibility | Existing p.34 and product consoles | New status views and read-only catch-all API sections |

## Source And Test Files

- `app/lib/scrimed-p34/types.ts`
- `app/lib/scrimed-p34/clinicalOperatingSystem.ts`
- `app/lib/scrimed-p34/index.ts`
- `app/lib/scrimed-p34/adaptiveGovernance.ts`
- `app/api/scrimed-control-plane/[[...path]]/route.ts`
- `app/scrimed-p34/page.tsx`
- `app/lib/productConsole.ts`
- `app/product/page.tsx`
- `scripts/scrimed-p34-clinical-operating-system-policy-test.mjs`
- `scripts/scrimed-p34-clinical-operating-system-contract-check.mjs`
- `scripts/scrimed-p34-artifacts.mjs`
- `scripts/scrimed-nonsecret-test-suite.mjs`
- `package.json`
- `.env.example`
- `.github/workflows/node24-certification.yml`

## Documentation

- `docs/P34_CLINICAL_OPERATING_SYSTEM.md`
- `docs/P34_THREAT_MODEL.md`
- `docs/P34_CONTROL_MATRIX.md`
- `docs/P34_EVALUATION_AND_EXTERNAL_VALIDATION.md`
- `docs/P34_AUTONOMY_AND_APPROVAL_CONTRACT.md`
- `docs/P34_PHI_DATA_FLOW.md`
- `docs/P34_IMPLEMENTATION_MANIFEST.md`
- `docs/release/P34_REVIEW_PACKET.md`
- `docs/P34_RELEASE_GATE_REPORT.md`

## Compatibility

- No dependency added.
- No database migration added or applied.
- Existing p.33 and p.34 contracts remain exported.
- New APIs are read-only sections of the existing control-plane catch-all route.
- Safe local feature flags default on; all existing high-risk flags remain off.
- No external system or provider is activated.

Exact commit, source, artifact, validation, review, gate, and SBOM fingerprints are generated only after the final local commit so this manifest does not contain self-referential or stale evidence.
