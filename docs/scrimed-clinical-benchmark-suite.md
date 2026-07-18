# SCRIMED Clinical Benchmark Suite

SCRIMED Clinical Benchmark Suite provides synthetic/no-PHI benchmark metadata across administrative, clinical, interoperability, and research tasks.

## Domains

- Prior authorization
- Appeals
- Clinical documentation
- SOAP note quality
- Medical necessity
- Care coordination
- Coding
- Revenue cycle
- Oncology
- Cardiology
- Radiology
- Emergency triage
- FHIR
- HL7
- DICOM
- Patient education
- Evidence summarization
- Clinical trial matching
- Compliance

## Safety Boundary

Benchmarks measure structured readiness, schema fidelity, evidence quality, and human-review routing. They do not prove clinical validation or authorize diagnosis, treatment, prescribing, payer submission, EHR writeback, or live patient care.

## Domain Stress Matrix

Release evaluation uses task x disease/subtype x patient subgroup x site x modality x language x workflow-state cells. The worst material cell controls the decision. Sparse cells remain restricted, failed cells block release, and high-risk cells require completed human review. Aggregate averages cannot override a material-cell failure, and no synthetic score grants clinical authority.

## Routes

- `/scrimed-clinical-benchmark-suite`
- `/api/scrimed-clinical-benchmark-suite`
- `/api/scrimed-clinical-benchmark-suite/brief`
