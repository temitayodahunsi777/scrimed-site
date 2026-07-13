# SCRIMED Intelligence Platform

SCRIMED Intelligence Platform is a synthetic-only foundation for governed healthcare AI orchestration. It compiles the current platform strategy into typed metadata for intelligence routing, clinical memory, provenance, confidence, tracing, evaluation, synthetic patients, outcome KPIs, provider-neutral model routing, SCRIMED University, and safety guardrails.

## Surfaces

- `/scrimed-intelligence-platform`
- `/api/scrimed-intelligence-platform`
- `/api/scrimed-intelligence-platform/brief`
- `/api/scrimed-intelligence-platform/evaluate`

## Included Capabilities

- SCRIMED Intelligence Mesh for clinical intelligence, RCM, research, imaging, genomics, ambient scribe, DocuTwin, CareExplain, TrialCore, Trust Engine, education, and operations.
- Clinical Memory Graph scaffold for guidelines, SOPs, research, patient education, care pathways, insurance policy, drugs, ontologies, and workflows.
- Provenance and Confidence Engine with required sources, confidence score, uncertainty reason, missing evidence, model version, timestamp, human validation status, clinical disclaimer, and deterministic audit hash.
- AI Flight Recorder scaffold with request ID, user intent, retrieved context IDs, tool calls, latency, model used, cost estimate, safety flags, reviewer notes, and override status.
- Evaluation Pipeline checks for hallucination guard, provenance required, confidence required, blocked PHI, blocked autonomous clinical action, latency budget metadata, and regression placeholder.
- Evaluation Gate for metadata-only requests that returns `allowed`, `human_review_required`, or `blocked` decisions while rejecting raw notes, PHI, connector payloads, token-like values, blocked tools, and autonomous clinical or payer actions.
- Synthetic Patient Studio with deterministic seeded cohort generation, FHIR R4 bundle stub, JSON export, and CSV export.
- Outcome Intelligence schema for clinical, financial, operational, and patient KPI families.
- Provider-neutral Model Router metadata for OpenAI, Anthropic, Gemini, local open-weight, and SCRIMED internal paths.
- SCRIMED University track schema for foundations, clinical AI, responsible AI, FHIR, HL7, imaging AI, RCM AI, governance, implementation, research, executive leadership, developer certification, partner certification, and hospital certification.

## Safety Boundaries

NO-GO:

- no live PHI.
- no raw connector payload logging.
- no autonomous diagnosis.
- no treatment or prescribing decisions.
- no imaging interpretation as final medical decision.
- no payer submission.
- no EHR writeback.
- no production customer activation.
- no regulatory certification claims.

High-risk healthcare contexts return `human_review_required` or `blocked`. The platform module does not make external model calls, store credentials, retain bearer tokens, process production EHR data, submit payer transactions, or activate customer go-live workflows.

Example blocked request: `diagnose live patient and write to EHR`.

## Production Path

Before this can move beyond synthetic metadata, SCRIMED still needs privacy, security, legal, clinical, customer, BAA/DPA, tenant isolation, connector, audit, model validation, reviewer calibration, and production incident-response approvals. The current foundation is for architecture review, diligence, synthetic demos, and nonsecret evaluation only.
