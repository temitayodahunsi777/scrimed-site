# Model Vendor Continuity Plan

SCRIMED keeps model selection behind the provider-neutral registry and model router. Clinical
and product logic must not depend on one vendor-specific model identifier.

## Continuity Controls

- Qualify exact provider/model versions through approval passports.
- Route by required capability, risk, privacy, residency, quality, latency, and total accepted
  outcome cost.
- Preserve the required safety and privacy tier during fallback.
- Reject silent model, version, region, retention, or provider changes.
- Use bounded retries, provider health status, circuit breakers, and explicit human handoff.
- Maintain a deterministic synthetic fallback for local policy validation only.
- Retain route reasons, fallback events, model versions, and policy decisions in PHI-safe audit
  evidence.

## Vendor Event Response

Ownership, terms, license, subprocessor, capacity, price, security, availability, or residency
changes trigger requalification. The affected provider is suspended for new work when evidence
is missing or material risk is unresolved. Existing in-flight work must stop safely, queue, or
move to a materially independent approved route without weakening controls.

## Exit Path

1. Activate the provider or workflow kill switch.
2. Preserve metadata-only audit continuity and stop new admissions.
3. Revoke provider credentials through the authorized operator process.
4. Validate exportable configuration and non-PHI artifacts.
5. Run the same workflow evaluation against the independent route.
6. Require independent review, canary evidence, and rollback readiness before promotion.

No provider is currently authorized by this document for PHI, live clinical work, production
deployment, or customer activation.
