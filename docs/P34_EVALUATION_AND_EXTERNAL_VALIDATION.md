# SCRIMED p.34 Evaluation And External Validation

## Two Loops

The existing p.34 evaluation contract remains the single evaluation authority:

1. Offline evaluation uses fixed, versioned synthetic or separately governed de-identified datasets. It records dataset, harness, model, policy, seed, environment, quality, grounding, citations, tool selection, completion, cost, latency, variation, worst material cell, and rollback state.
2. Online evaluation accepts privacy-safe proxy metrics only: completion, retry, correction, escalation, abstention, unsupported assertion, tool failure, approval denial, latency, and cost. Raw prompts, PHI, secrets, and hidden reasoning are prohibited.

Safety, privacy, authorization, evidence sufficiency, provenance, tenant isolation, and worst-cell performance are hard floors. Cost and latency are soft floors and require an attributable exception to regress. A promoted challenger becomes the next task-specific floor only after named independent review; promotion is never automatic.

## External Validation Contract

Internal validation and internal evaluation cannot qualify a clinical capability for production. `ExternalValidationEvidence` records:

- multiple sites and health systems;
- acquisition devices or source systems;
- clinical and demographic cohorts;
- workflow settings and time periods;
- distribution-shift analysis;
- discrimination, sensitivity, specificity, calibration, abstention, missing critical steps, unsupported extras, overrides, and downstream harm proxies where applicable;
- subgroup worst-cell result;
- evidence dates, expiry, and named reviewer approval hashes.

The gate blocks internal-only, stale, single-site, incomplete, unreviewed, safety-floor, quality-floor, or worst-cell failures. Even complete documentary evidence returns to named human review and does not self-authorize clinical production.

## Oversight Drift

Review percentage is evaluated with absolute errors, corrections, overrides, silent acceptance, review latency, and cohort coverage. Success metrics cannot lower review. Any requested reduction requires an exact approval hash and still remains subject to clinical policy and release review.

## External Activation Evidence

Required before clinical production consideration:

- approved intended use and accountable clinical owner;
- qualified independent external validation;
- privacy/security and data-use authority;
- tenant, identity, audit, incident, rollback, and monitoring evidence;
- provider/model/tool documentary eligibility;
- deployment and customer authorization tied to the exact candidate.
