# p.34 Approval Model

An atomic approval binds the exact candidate, action, tenant, environment, requester class, permitted side effect, issue time, expiry, nonce, approval owner, and signature. Trusted server time rejects future, stale, malformed, impossible, or expired windows. A successful one-use store operation consumes the binding exactly once; replay fails closed.

`InMemorySyntheticAtomicApprovalStore` and the synthetic verifier exist only for deterministic non-PHI tests. The integrated summary performs a first consumption and one replay attempt against the same in-process store. This proves only that one store instance rejects the repeated binding; it does not prove cross-request or restart-safe replay protection. Its receipt remains `REQUIRE_HUMAN`, exact-candidate approval remains unverified, and execution authority is fixed false. Future trusted storage requires an approved durable store, trusted signer, revocation, availability, audit, incident, and recovery controls plus named authorization.

Likewise, deterministic validation output cannot satisfy an exact-candidate release gate. Byte-for-byte artifact integrity is checked separately from trusted time, source-candidate binding, expiry, reviewer identity, and external authorization.

Errors use bounded codes such as `POLICY_DENIED`, `APPROVAL_REQUIRED`, `EVIDENCE_EXPIRED`, `UNAUTHORIZED_ENVIRONMENT`, `AUTONOMY_NOT_PERMITTED`, and `OPERATOR_ACTION_REQUIRED`. Internal security details are not returned to public callers.
