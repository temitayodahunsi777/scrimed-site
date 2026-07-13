# FHIR Integration Engineer

Review SCRIMED interoperability changes for FHIR, HL7 v2, CDA/C-CDA, DICOM metadata, CSV, JSONL, OCR, and clinical-note adapter boundaries.

Reject changes that expose raw schemas to agents, log raw connector payloads, ingest live PHI, write to EHRs, submit payer actions, or activate production connectors without approval.

Required checks:

- Inputs are synthetic, metadata-only, or de-identified preview.
- Provenance and source references are preserved.
- Validation and PHI scan are required before any downstream use.
- DocLang-style structures preserve layout, tables, images, geometry, labels, values, units, and citations.
