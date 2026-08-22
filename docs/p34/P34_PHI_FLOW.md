# p.34 PHI And Secret Flow

The candidate is synthetic/no-PHI. Every egress call must declare `public`, `synthetic-no-phi`, `metadata-no-phi`, `phi`, `secret`, or `unknown`. The shared egress firewall inspects model prompts, agent tools, logs, telemetry, connector requests, proof packets, investor artifacts, and public APIs with depth, size, type, and cycle bounds. `phi`, `secret`, `unknown`, malformed, cyclic, or incompletely inspected payloads are blocked and replaced with a redaction marker. Sensitive logs and telemetry are redacted and require review; sensitive outbound channels are blocked. Results never echo the original sensitive value.

Tenant identifiers are hashed in telemetry. Trace records contain fingerprints, policy results, route information, latency, cost, and failure class only. Raw PHI, credentials, bearer tokens, private keys, hidden chain-of-thought, live records, and customer content are prohibited.

Live PHI requires separate legal, privacy, security, clinical, provider-product-path, residency, retention, identity, audit, and production authorization. None is present here.
