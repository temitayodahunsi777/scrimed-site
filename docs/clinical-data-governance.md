# SCRIMED Clinical Data Governance

Updated: 2026-07-03

## Status

SCRIMED Clinical Data Governance is a metadata-only policy engine for evaluating healthcare context requests before any agent, tool, model route, connector, workflow, or reviewer packet receives authority.

Routes:

- API: `/api/clinical-data-governance`
- Brief: `/api/clinical-data-governance/brief`
- OS section: `/healthcare-intelligence-os#clinical-data-governance`

## Policy Inputs

Every request must provide:

- requester role
- purpose of use
- data class
- action
- destination
- consent status
- human review status
- BAA/DPA status
- tenant scope
- minimum necessary status
- production connector approval state
- external model approval state
- residency region

The API accepts enum-based metadata only. It does not accept raw patient text, identifiers, records, connector payloads, credentials, or source-system responses.

## Decisions

The engine returns one of three decisions:

- `allowed`: request stays inside metadata-only, tenant-scoped, minimum-necessary governance.
- `requires-human-review`: request remains within controllable boundaries but needs qualified review before release or customer-environment use.
- `blocked`: request crosses current SCRIMED authority and must not proceed.

## Hard Stops

Clinical Data Governance blocks live PHI processing, production connector activation, record mutation, payer submission, patient outreach, external model PHI processing, autonomous diagnosis, autonomous treatment, autonomous prescribing, and customer go-live approval.

## Relationship To Clinical Data Fabric

Clinical Data Fabric defines source contracts, semantic normalization, provenance, and health graph projection rules. Clinical Data Governance decides whether a proposed request may use those governed concepts, requires review, or must fail closed.

## Operating Rule

No SCRIMED agent should request healthcare context directly. The expected path is:

Clinical Data Fabric contract -> Clinical Data Governance decision -> TrustOS review state -> approved tool or reviewer packet.
