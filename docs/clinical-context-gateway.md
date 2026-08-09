# SCRIMED Clinical Context Gateway

The gateway now includes SCRIMED Context Lens metadata with isolated `public-evidence` and `clinical-context` modes. Every proposed next action requires a supporting source and action reason. Stale, expired, unverified, missing, or low-confidence evidence triggers abstention or human review; live PHI remains disabled.

SCRIMED Clinical Context Gateway is the governed doorway between SCRIMED agents and healthcare context. It converts strict metadata-only requests into semantic context envelopes after the request passes Clinical Data Governance and Clinical Data Fabric source-contract checks.

Current status: `clinical-context-gateway-ready-no-phi`

Routes:

- `/api/clinical-context-gateway`
- `/api/clinical-context-gateway/brief`
- `/healthcare-intelligence-os#clinical-context-gateway`

## Purpose

The gateway prevents agents from reasoning directly over raw databases, raw connector payloads, unrestricted FHIR searches, EHR writeback channels, payer submission channels, or patient communication channels.

It supports future healthcare agent orchestration by returning only:

- source contract metadata
- allowed semantic concepts
- required provenance fields
- confidence inputs
- evidence requirements
- blocked raw-access categories
- downstream agent instructions
- deterministic audit envelope hashes

## Current Boundary

The gateway is a no-live-PHI control plane. It does not accept raw patient records, patient identifiers, free-text notes, source schemas, connector payloads, credentials, DICOM pixel data, EHR writeback payloads, payer submissions, or patient outreach instructions.

It does not diagnose, treat, prescribe, interpret imaging, mutate records, contact patients, submit transactions, activate production connectors, certify compliance, validate clinical performance, or approve customer go-live.

## Decision Flow

Clinical Data Fabric contract -> Clinical Data Governance decision -> Clinical Context Gateway envelope -> TrustOS / AgentOS review state.

Possible outcomes:

- `semantic-context-ready`: metadata-only, tenant-scoped, minimum-necessary context may be delivered as a semantic contract envelope.
- `review-required`: deidentified, limited, research, or customer-review context is queued for qualified human review and no context envelope is delivered automatically.
- `blocked`: live-data, unsafe destination, unregistered source, unsupported concept, payer submission, outreach, record mutation, external model PHI, or connector activation requests fail closed.

## Safety Controls

- strict metadata-only JSON schema
- source contract allowlist
- semantic concept allowlist
- purpose-of-use and role checks through Clinical Data Governance
- tenant scope and minimum necessary requirements
- no raw schema access
- no raw connector payload access
- no credentials
- no PHI fixtures
- no autonomous clinical, payer, patient-facing, or record-impacting action
- request hash and envelope hash for auditability
- human review packet for review-gated requests

## Production Roadmap

Before any live healthcare use, SCRIMED still needs customer-specific authorization, tenant identity, consent policy, BAA/DPA path, PHI classification, retention and residency controls, approved connector scopes, durable immutable audit storage, clinical governance, security review, and human approval workflows.
