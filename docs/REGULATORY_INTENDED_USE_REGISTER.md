# Regulatory Intended-Use Register

This register describes current engineering boundaries and does not determine legal or regulatory classification.

| Product/function | Intended user and use | Inputs and outputs | Patient-specific / time-critical | Current status and activation gate | Prohibited claims |
| --- | --- | --- | --- | --- | --- |
| SCRIMED Atlas | enterprise reviewers evaluating governed workflow intelligence | synthetic workflow metadata; reviewable evidence and plans | no / no | synthetic demonstration; separate security, legal, clinical, privacy, contract, and deployment approvals required | production authorization, certification, autonomous care |
| MyVitals concept | researchers and workflow designers visualizing configured test signals | synthetic vitals/events; demonstration alerts and trend displays | no live patients / no | synthetic-only; device and emergency flags hard OFF | patient monitoring, predictive alerts, diagnosis, treatment, emergency detection |
| Clinical Copilot | clinicians evaluating source-grounded decision-support and documentation concepts | synthetic context; draft summaries and evidence | synthetic only / no | human review required; no clinical execution | diagnosis, treatment, prescribing, clinician replacement |
| DocuTwin / Ambient Scribe / Perfect Chart | documentation teams evaluating draft workflow support | synthetic transcripts/context; draft documentation | synthetic only / no | draft-only with clinician review | signed chart, final diagnosis, EHR writeback |
| CareExplain / Patient Education | teams evaluating understandable educational drafts | synthetic source material; draft educational content | synthetic only / no | human review and disclaimer required | medical advice, treatment direction, emergency guidance |
| TrialCore | research teams evaluating preliminary criteria workflows | synthetic protocol/case data; preliminary review queue | synthetic only / no | coordinator confirmation required; auto-enrollment blocked | eligibility determination, enrollment, treatment benefit |
| Prior authorization / RCM | operations teams evaluating documentation and exception workflows | synthetic payer/workflow data; reviewable draft packet | no / no | draft/recommendation only; submission and adjustment blocked | payer submission, coding change, payment decision |
| Imaging integration | informatics teams validating metadata and completeness workflows | synthetic DICOM/FHIR metadata; completeness flags | no live image interpretation / no | adapter and fixture evaluation only | final interpretation, diagnosis, medical-device performance |
| FaithCore | users and organizations explicitly choosing spiritual encouragement | user-selected nonclinical preferences; optional experience | no clinical influence / no | opt-in only; `faithAffectsClinicalLogic` hard OFF | clinical recommendation, eligibility, priority, diagnosis, treatment, access decision |

Every uncertain or patient-specific expansion requires intended-use, clinical-safety, privacy, security, legal, regulatory, interoperability, human-factors, and deployment review.
