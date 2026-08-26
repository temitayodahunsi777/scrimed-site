# ADR: p.33 Clinical Extraction And Oversight Gates

Status: accepted for local synthetic implementation.

Decision: clinical extraction release is a noncompensable gate. Required provenance, evidence, policy identity, terminology authorization, safety checks, contradiction handling, and qualified review cannot be averaged away. Regulatory Label Twins define intended and excluded use. Oversight Drift Sentinel preserves fixed cohorts and risk-based review floors.

Consequences:

- Missing provenance, policy identity, safety, or unsupported claims block release.
- Missing terminology authorization or qualified review requires human action.
- Model accuracy cannot automatically lower human review.
- Silent workflow expansion, missing sentinel cohorts, error-budget violations, and low-frequency harm signals block progression.

Rejected: aggregate-only release decisions, self-review, automatic oversight reduction, and diagnosis or record inclusion authority.
