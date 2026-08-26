# ADR: p.33 Clinical Context Fabric

Status: accepted for local synthetic implementation.

Decision: extend SCRIMED's Clinical Context Gateway, Context Fabric, source-span coverage, and p.32 governance records through one versioned `ContextArtifact`. Build source-grounded context once, then derive only tenant-bound, purpose-limited, minimum-necessary views.

Consequences:

- Exact source spans, temporal order, confidence, uncertainty, contradiction state, terminology provenance, and artifact hashes remain available to downstream agents.
- Revocation, expiration, cross-tenant access, missing consent, and scope expansion fail closed.
- Compression must declare omissions and cannot replace the source record.
- FHIR, OMOP, OpenEHR, and MCP adapters are synthetic preview contracts only.
- Restricted terminologies stay caller-supplied and license-gated.

Rejected: parallel context stores per product, raw-PHI fixtures, autonomous extraction release, and silent truncation.
