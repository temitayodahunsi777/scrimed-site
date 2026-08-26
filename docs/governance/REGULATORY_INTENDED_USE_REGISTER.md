# p.34 Regulatory Intended-Use Register

This register records product intent for specialist review. It does not assign a regulatory classification or claim authorization.

| Capability | Intended user and use | Patient-specific | Clinical influence | Time critical | Autonomous effect | Review trigger | Current authorization |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Governed action declaration | Technical operators inspect synthetic policy evidence | no | none | no | none | material scope change | synthetic local review |
| Patient Take-Home preview | Clinician reviews an educational draft | synthetic only | informational only | no | none | patient-facing activation | draft only; delivery blocked |
| Assisted coding | Qualified reviewer inspects evidence-grounded coding support | synthetic only | administrative support | no | none | billing or payer use | draft only; submission blocked |
| Clinical retrieval | Authorized reviewer retrieves tenant-scoped cited synthetic context | synthetic only | decision-support preparation | no | none | live data or clinical activation | synthetic local review |
| DICOM privacy adapter | Technical reviewer evaluates metadata de-identification controls | synthetic only | none | no | none | live imaging or export | export blocked |
| Continuity metrics | Operations/research teams measure noncausal continuity signals | no raw identity | research/operations only | no | none | clinical use or public claim | non-PHI metrics only |
| Model-fit router | Technical operators select an eligible validated local route | no | none in current candidate | no | none | provider or clinical activation | deterministic local route only |
| External validation framework | Named evaluators record methodology and limitations | dataset-dependent, not enabled | future review evidence only | no | none | any clinical claim | no independent validation claimed |
| Public-sector profile | Procurement teams assemble documentary evidence | no | none | no | none | eligibility/compliance claim | evidence collection only |

Live PHI, diagnosis, treatment, prescribing, triage disposition, clinical order, patient-result release, payer submission, EHR/device write, emergency monitoring, and autonomous care remain prohibited without separate specialist review and explicit authorization.
