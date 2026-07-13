# SCRIMED LLMOps Observability Layer

SCRIMED LLMOps Observability records synthetic/no-PHI model and agent trace metadata.

## Trace Fields

- Trace id
- Agent id
- Model id
- Latency
- Cost estimate
- Token estimate
- Safety event count
- Policy decision
- Benchmark status
- Rollback readiness
- Production readiness false by default

## Safety Boundary

No raw PHI, raw connector payloads, credentials, live patient data, clinical authority, production readiness claim, or customer go-live approval is stored or granted.

## Routes

- `/scrimed-llmops-observability`
- `/api/scrimed-llmops-observability`
- `/api/scrimed-llmops-observability/brief`
