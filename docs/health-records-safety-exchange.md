# SCRIMED Health Records Safety Exchange

Updated: 2026-06-25

Health Records Safety Exchange is SCRIMED's no-PHI control plane for health-record interoperability, extraction planning, source attribution, patient-safety lint, and live-data workaround routing.

Surfaces:

- `/health-records`
- `/api/health-records`
- `/api/health-records/brief`
- `/api/health-records/extract`
- `/interoperability`
- `/interoperability/evaluations`
- `/clinical-care-activation`
- `/boundary-resolution`

Capabilities:

- FHIR health-record intake and normalization for synthetic bundles.
- HL7 v2 event and results extraction planning.
- C-CDA and document intelligence extraction with metadata-only source handling.
- DICOM/DICOMweb metadata routing without pixel-data or diagnostic interpretation.
- Payer, coverage, and prior-authorization record extraction planning without payer submission or reimbursement claims.

Patient-safety checks:

- PHI and live-record blocker.
- Patient identity and matching guard.
- Unit, terminology, and semantic drift lint.
- Medication and allergy review guard.
- Stale, conflicting, or unattributed source guard.
- Writeback and patient-action blocker.

Workarounds:

- Use synthetic fixtures and no-PHI test bundles for public demos and buyer evaluation.
- Use metadata-only external artifact references for evidence rooms.
- Use CapabilityStatement review, profile mapping, and fixture validation before customer sandbox access.
- Use customer sandbox data only after privacy, security, legal, clinical-governance, connector, consent, audit, monitoring, rollback, and go-live gates are approved.
- Produce reviewer checklists, missing-field registers, and source-attributed packets instead of clinical recommendations, patient actions, payer submissions, or record mutation.

Boundaries:

- Not PHI processing approval.
- Not production EHR, HIE, payer, imaging, or device connector approval.
- Not patient matching, MPI approval, or longitudinal record merge authority.
- Not diagnosis, treatment, triage, prescribing, patient outreach, or clinical decision support authorization.
- Not payer submission, claim filing, reimbursement assurance, or benefit determination.
- Not ONC certification, TEFCA participation approval, security certification, or live-care authority.

Operator routine:

1. Route every health-record, EHR, HIE, payer, imaging, device, document, or extraction request to `/health-records`.
2. Confirm the request is synthetic-only and contains no PHI, patient identifiers, payer member data, production URLs, credentials, or source records.
3. Run `/api/health-records/extract` only for small synthetic metadata payloads.
4. Attach extracted targets to standards, profiles, terminology, source provenance, and missing-field registers.
5. Apply patient-safety checks before any reviewer packet is referenced externally.
6. Route live PHI, customer sandbox, connector, patient matching, clinical action, payer, writeback, and production requests to the retained authority owner.
7. Keep all outputs draft-only, source-attributed, human-reviewed, and no-PHI until signed external gates exist.
