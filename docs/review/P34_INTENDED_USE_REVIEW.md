# p.34 Intended-Use Review

This packet requests review; it does not assign a regulatory classification or authorize clinical use.

| Capability | Intended user | Intended purpose | Clinical influence / patient specificity | Time criticality | Autonomy | Current boundary | Potential review trigger |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Governance and Product Console | Internal engineers, reviewers, operators | Inspect synthetic control/evidence state | None; no patient data | Non-time-critical | A0 | Read-only synthetic evidence | Production or customer exposure |
| Workflow contract and model-fit router | Internal workflow/model owners | Validate workflow definition and select an eligible synthetic route | No clinical decision authority; synthetic inputs | Non-time-critical | A0-A1 | External providers and PHI disabled | PHI route, clinical use, or provider activation |
| Context and evidence retrieval | Clinical-safety researchers | Evaluate grounded retrieval patterns | Could support future decision support; current fixtures are synthetic | Non-time-critical | A1 | No live clinical recommendation | Patient-specific or time-critical use |
| Patient education preview | Clinician reviewer in demonstration | Draft educational material from approved synthetic facts | Potential patient-facing influence; no delivery | Non-time-critical | A1 | Clinician review required; delivery disabled | Real patient delivery or clinical claims |
| Medical coding draft | Coding reviewer in demonstration | Prepare evidence-linked coding suggestions | Administrative draft; no billing authority | Non-time-critical | A1-A2 | Submission and RCM mutation disabled | Payer submission or financial mutation |
| Synthetic DICOM privacy | Privacy/security reviewer | Test metadata de-identification contracts | No diagnosis; synthetic objects only | Non-time-critical | A0-A1 | Export unauthorized | Real DICOM, PACS/RIS, or medical-device path |
| Continuity metrics | Operations/research user | Measure synthetic care-team continuity and queues | Research/operational metric only; no causal or therapeutic claim | Non-time-critical | A1 | No prioritization or outreach execution | Patient-specific queue effects or intervention |
| Challenger harness | Model-governance researcher | Compare disabled non-PHI model profiles | None in clinical production | Non-time-critical | A0 | Feature off; no provider calls | Model promotion or PHI eligibility |

## Required Decisions

Clinical, legal/claims, privacy/security, database, and release reviewers should answer only their scoped packet. Production, PHI, clinical execution, payer/EHR/device action, and regulated claims remain separately prohibited.
