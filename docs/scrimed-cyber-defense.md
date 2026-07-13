# SCRIMED Cyber Defense Command Center

SCRIMED Cyber Defense Command Center is a synthetic/no-PHI security-readiness and control-monitoring layer for the SCRIMED platform.

It turns cybersecurity into an operating surface by binding browser hardening, request sanitization, protected-route behavior, token redaction, no-secret testing, safety governance, and incident response lanes into one reviewable control plane.

## What Changed

- Global response headers now include stricter CSP directives, HSTS, CORP, COOP, Origin-Agent-Cluster, browser permission restrictions, no-sniff, frame denial, and no-authority SCRIMED headers.
- A Next proxy strips middleware-bypass, debug-token, API-key, and forwarded token-like headers before route handlers receive requests.
- `/api/scrimed-cyber-defense` exposes a metadata-only control snapshot with retained boundaries.
- `/scrimed-cyber-defense` gives operators, buyers, and reviewers a visible cyber command surface.
- Buyer Security Diligence Cards now answer procurement and investor security questions with audit hashes, owners, evidence routes, residual risk, review cadence, and blocked-claim boundaries.
- `npm run smoke:scrimed-cyber-defense` verifies the implementation and unsafe-claim boundaries.

## Safety Boundary

This layer is metadata-only and no-PHI. It does not authorize live PHI, production credentials, raw connector payloads, autonomous clinical care, payer submission, EHR writeback, production connector approval, customer go-live, or external release authority.

## No Certification Claim

This layer does not claim HIPAA certification, SOC 2 certification, HITRUST certification, FDA clearance, penetration-test completion, breach immunity, or production customer approval.

## Control Families

- Browser surface hardening
- Request-header sanitization
- Protected-route fail-closed behavior
- Token and secret redaction
- Cost and API abuse guardrails
- No-PHI and clinical authority safety governance
- Generated integrity and no-secret regression tests
- Security assurance contract checks
- Incident readiness lanes
- Buyer Security Diligence Cards

## Security Assurance Pipeline

The Security Assurance Pipeline adds repeatable no-secret gates for static token scanning, unsafe-claim detection, global security header drift, proxy header sanitizer drift, protected fail-closed behavior, generated integrity, framework dependency security floor checks, CI workflow governance checks, incident readiness, and external deployment boundaries.

Run:

```bash
npm run security:assurance
npm run security:dependency-floor
npm run contract:ci-workflows
npm run smoke:scrimed-cyber-defense
npm run test:nonsecret
```

The pipeline is evidence discipline only. It does not replace WAF configuration, SIEM/log drains, SBOM signing, external penetration testing, privacy review, customer-specific threat modeling, or legal/security approval.

## Security Diligence Evidence Packet

The Security Diligence Evidence Packet packages the current cyber-defense posture into buyer- and investor-reviewable artifacts without exposing PHI, secrets, raw logs, raw connector payloads, production credentials, or customer records.

The packet is available through `/api/scrimed-cyber-defense/evidence-packet` and is intentionally metadata-only. It answers common diligence questions:

- What controls can SCRIMED safely demonstrate today?
- Which protected routes fail closed without authorized context?
- Which AAL2 no-PHI operator checks still require a short-lived authorized session?
- Which external artifacts block PHI preproduction?
- Which legal, privacy, retention, and customer-specific approvals block live PHI production?

It also includes a governed Security Questionnaire Response Library for common enterprise questions across access control, data protection, application security, incident response, infrastructure, AI governance, business continuity, and vendor risk. These responses are answer starters for buyer/security review; they are not confidential questionnaire storage, legal acceptance, customer security acceptance, or production authorization.

Share rules:

- Share metadata, command names, pass/fail status, audit hashes, and retained boundaries only.
- Do not share raw logs, bearer tokens, session JSON, production credentials, connector payloads, customer records, or PHI.
- Route buyer-specific security questionnaire answers through legal, privacy, security, and release-steward review before external submission.
- Label buyer-facing evidence as synthetic/no-PHI diligence evidence unless formal external approvals expand authority.
- Treat PHI production, customer go-live, EHR writeback, payer submission, and production connector approval as blocked until formal external evidence exists.

## Security Questionnaire Response Library

The Security Questionnaire Response Library is designed to reduce sales and procurement friction without storing confidential buyer questionnaires inside SCRIMED.

Each response includes:

- Domain
- Buyer question
- Buyer-safe answer
- Evidence artifact IDs
- Supporting routes
- Answer status
- Cannot-say boundaries
- Redaction boundary
- Owner
- External evidence needed
- Human review requirement
- Audit hash

Statuses are `buyer_safe_answer_ready`, `requires_manual_review`, `requires_external_artifact`, and `blocked_until_formal_approval`.

Current domains include access control, data protection, application security, incident response, infrastructure, AI governance, business continuity, and vendor risk. Any buyer-specific answer still requires human review before external submission.

## Buyer Security Diligence Cards

Buyer Security Diligence Cards provide a compact control-response layer for enterprise procurement, investor diligence, and hospital security review.

Each card includes:

- Buyer question
- Current answer
- Evidence routes
- Control summary
- Implementation status
- Residual risk
- Owner
- Review cadence
- Required next evidence
- Blocked claims
- Human review requirement
- Synthetic-only flag
- Audit hash

Current cards cover AAL2 and role-scoped access, token and secret protection, protected route fail-closed posture, no-PHI data boundaries, proxy/request sanitization, API abuse and model-cost guardrails, incident response/tabletop readiness, and vendor connector readiness.

The cards are safe to use for no-PHI buyer diligence. They do not expand live PHI authority, production connector authority, customer go-live authority, final clinical authority, or external security assurance.

## Security Release Readiness Gate

The Security Release Readiness Gate converts SCRIMED's security posture into a go/no-go ladder:

- `synthetic_demo_ready`: public no-PHI demos, synthetic evaluation, investor/buyer proof review.
- `buyer_diligence_ready`: protected evidence review and no-PHI pilot scoping.
- `protected_no_phi_pilot_ready`: conditional on strict AAL2 happy-path validation by an authorized operator.
- `phi_preproduction_blocked`: blocked until WAF, SIEM/log drains, SBOM, privacy risk assessment, and external security review are complete.
- `live_phi_production_blocked`: blocked until BAA/customer agreement, incident tabletop, retention policy, customer-specific threat model, and formal approvals exist outside code.

Current release authority is synthetic and no-PHI only. Customer go-live, production PHI, production connectors, payer submission, EHR writeback, and clinical production claims remain blocked.

## Threat Matrix

Current threat tracking covers prompt injection/tool misuse, credential leakage, PHI exposure risk, middleware/proxy bypass header abuse, API abuse/cost spikes, and supply-chain drift.

Each threat includes current mitigation, detection signal, escalation path, and residual risk. Residual risk is intentionally retained until external WAF, SIEM/log drains, SBOM signing, dependency scanning, tabletop exercises, and independent security review are complete.

## Next Build Step

Attach deployment-specific WAF/bot controls, managed log drains, SBOM generation, dependency and secret scanning, CSP report collection, and external security review before expanding any PHI, connector, or customer-go-live authority.
