# p.34 Synthetic Pilot Operating System

SCRIMED's pilot operating layer turns one bounded buyer problem into a reproducible synthetic
evaluation without crossing clinical, production, customer-system, payer, EHR, or device
boundaries.

## Flow

```text
template -> manifest -> human scope approval -> deterministic stages -> objective metrics
         -> cost governor -> evidence packet -> executive readout -> human expansion decision
```

## Repository Components

- `app/lib/commercial/pilotTemplateRegistry.ts`: six reusable buyer-safe templates.
- `app/lib/commercial/pilotManifest.ts`: candidate, dataset, policy, budget, duration, objective
  criteria, exclusions, and approval binding.
- `app/lib/commercial/pilotOperatingSystem.ts`: deterministic transitions, atomic single-use
  lifecycle leases, verifiable evidence chains, success evaluation, readout, proposal fingerprints,
  expansion gates, and buyer priority.
- `app/lib/economics/pilotCostGovernor.ts`: inference, tool, retry, runtime, total-spend stops and
  estimated margin sensitivity, plus atomic cumulative reservations for concurrent work.
- `app/lib/commercial/syntheticPilotReadiness.ts`: consolidated read-only public summary.

## Control Contract

Every executable synthetic manifest must affirm all seven controls:

- no PHI;
- nonproduction;
- no clinical execution;
- no customer-system writes;
- no payer submission;
- no EHR writeback;
- no device writeback.

Missing controls fail configuration. Duplicate idempotency keys, skipped workflow stages, missing
evidence, cost overruns, and missing named synthetic-scope approval also fail closed.

Malformed manifests are normalized as untrusted inputs and return a blocked decision rather than
throwing. The adversarial suite fuzzes 160 malformed cases and tests concurrent transition and
budget attempts. In-memory lease and budget stores are deterministic test/local adapters; a
protected pilot requires durable transactional persistence and remains unauthorized.

## Commercial Authority

Agents may draft a scope, SOW outline, proposal, and estimated pricing scenario. They cannot sign,
discount, accept terms, promise delivery dates, activate a protected pilot, or bind SCRIMED.
Every proposal fingerprints its scope, pricing scenario, candidate, version, expiry, and approval
state.

## Evidence Discipline

Evidence packets are watermarked `SYNTHETIC / NON-PRODUCTION` and bind the candidate, dataset,
scenario, model, agent, policy, evaluation, timestamp, controls, limitations, cost, and next-step
recommendation. Synthetic metrics are not customer outcomes, deployed ROI, clinical outcomes,
partnership evidence, or production-integration evidence.

The public summary is a draft demonstration fixture. It carries no simulated approver, remains
`HUMAN_SCOPE_REVIEW_REQUIRED`, and is ineligible for expansion until a real named scope approval
is recorded against the exact manifest.

## Protected-Pilot Gate

Preparing a protected pilot requires separate insurance, counsel, privacy/security, deployment
design, data agreement, Supabase Auth hardening, customer authorization, and operator evidence.
Production, PHI, clinical autonomy, payer submission, EHR/device writeback, customer activation,
certification claims, and external investor distribution remain blocked.

## Validation

```bash
npm run test:scrimed-p34-post-review-readiness
npm run test:scrimed-p34-pilot-adversarial
npm run contract:scrimed-p34-post-review-readiness
npm run contract:scrimed-p34-follow-on
npm run smoke:scrimed-p34-canary
npm run scrimed:p34:certify
npm run scrimed:p34:evidence
PORT=3049 npm run start
SCRIMED_BASE_URL=http://127.0.0.1:3049 npm run smoke:synthetic-pilot
npm run verify:preview-ui -- --base-url=http://127.0.0.1:3049
```

The strict browser command checks the Product Console, synthetic-pilot, investor-demo, and review
readiness surfaces at desktop and 390px mobile sizes. It requires the repository's approved
browser-verification environment; inability to launch that browser is reported as blocked rather
than treated as a pass. Run the server command in a separate terminal and stop it after verification.

On synchronized macOS folders, the host may restore stale `.next/* 2` files while Next finalizes a
build. The generated-output postflight intentionally fails closed. Run the repository cleaner and
validate from a non-synchronized checkout or CI workspace; do not delete the postflight check or
treat a contaminated build as release evidence.
