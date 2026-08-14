# ADR: p.33 Decision Evidence Ledger

Status: accepted for local synthetic implementation.

Decision: extend existing audit and evidence records with an append-only SHA-256 chain binding each consequential action to tenant, identities, intended use, policy, Regulatory Label, model/provider/harness, tools, build, consent, source hashes, approval, outcome, affected objects, reversibility, and replay recipe.

Consequences:

- Tampering, duplicate record IDs, and predecessor mismatch are detectable.
- Affected cases and the applicable policy state can be enumerated without raw PHI.
- Replay exposes evidence and configuration, not hidden chain-of-thought.
- Approval requires an accountable human digest and reviewer role.

Rejected: mutable audit rows, raw prompt storage, raw clinical data in evidence records, and blockchain infrastructure without a demonstrated need.
