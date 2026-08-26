# p.34 Release Readiness

The gap-closure candidate is eligible for local assurance and exact-candidate review only after its final commit and regenerated fingerprints.

| Lane | Engineering state | Authority state |
| --- | --- | --- |
| Control Plane 2.0 | implemented and locally testable | no execution authority |
| Evidence expiry | signed, issuer-bound, version-bound, type-specific, fail closed | fresh trusted exact-candidate packets required |
| Atomic approval | synthetic one-use verifier | trusted durable store absent |
| Egress and trace safety | local policy covered | no external provider or PHI authority |
| Kill switch | default `READ_ONLY` | no production control-plane claim |
| Vercel | Node 24 configured; connected project reports READY non-production deployment | no preview publication or production promotion authorized |
| Supabase | connected project healthy; migration registry inspected | three migrations unapplied; leaked-password protection warning retained |
| AAL2 | local verifier and workflow exist | fresh operator-bound evidence required |
| Independent review | packet prepared | named review required after final fingerprints |
| Runtime provenance display | commit and fingerprint declarations exposed safely | candidate fingerprint remains `DECLARED_UNVERIFIED` until exact proof validates |
| Deployment and customer | procedures only | blocked |

Deliberate safety boundaries are not failures. They remain `OPERATOR_ACTION_REQUIRED`, `TARGETED_SPECIALIST_REVIEW_REQUIRED`, or `PRODUCTION_AUTHORIZATION_REQUIRED` as applicable.

Deterministic artifact byte integrity does not establish evidence freshness, named review, or exact-candidate provenance. The synthetic validation artifact is marked `releaseGateEligible: false`; after its recorded expiry its top-level state is `REVIEW_REQUIRED` and its release-evidence state is `EXPIRED_REGENERATE_REQUIRED`. After expiry or any source change, candidate, validation, gate, security, and review evidence must be regenerated and rebound before review.
