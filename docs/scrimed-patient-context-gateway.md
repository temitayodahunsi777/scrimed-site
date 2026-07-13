# SCRIMED Patient Context Gateway

SCRIMED Patient Context Gateway models synthetic patient story continuity with source provenance, HIE concepts, FHIR abstractions, consent gates, and no EHR writeback.

## Scope

- No PHI demo data only
- Patient story continuity model
- Source provenance required
- HIE interoperability concept
- FHIR-ready abstraction
- Consent-required flag
- Elderly/complex-care continuity scenario
- No EHR writeback

## Safety Boundary

No live PHI, diagnosis, treatment, prescribing, patient outreach, EHR writeback, payer submission, production connector approval, certification claim, or customer go-live claim is authorized.

## Routes

- `/scrimed-patient-context-gateway`
- `/api/scrimed-patient-context-gateway`
- `/api/scrimed-patient-context-gateway/brief`
