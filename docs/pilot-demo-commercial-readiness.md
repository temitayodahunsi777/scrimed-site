# SCRIMED Pilot Demo Commercial Readiness

Updated: 2026-08-01

The Pilot Demo Commercial Readiness layer makes SCRIMED demos and pilots easier to buy without weakening price discipline. It maps every public demo into a recommended pilot package, price band, proof assets, no-PHI intake route, market benchmark, margin rule, and retained boundary before custom buyer work expands.

## Routes

- Page: `/pilot-demo-commercial-readiness`
- JSON API: `/api/pilot-demo-commercial-readiness`
- Markdown brief: `/api/pilot-demo-commercial-readiness/brief`
- Source demo center: `/demos`
- Source pilot catalog: `/pilots`
- Pricing: `/pricing`
- Service delivery: `/service-delivery`

## Pricing Position

Public demos remain free and no-PHI. Qualified standard guided demos can stay no-cost when they follow the existing path and do not require buyer-specific custom work.

Paid assessment and pilot bands now align across demo, pilot, and pricing surfaces:

- Workflow Intelligence Assessment: starting at `$25K`, subject to a written agreement.
- Synthetic Workflow Pilot: custom enterprise scope with named human commercial and finance approval.
- Protected Enterprise Pilot: custom scope only after insurance, counsel, security/privacy, and deployment prerequisites.
- Enterprise Operating License: `$1.5M-$6M` annual for an initial enterprise operating layer; `$6M-$12M+` for multi-department or multi-region expansion.
- Strategic Platform Partnership: `$8M-$25M+` multi-year, sales-led, region-aware, and external-review-gated.

## Operator Rule

Before a buyer demo, pilot call, pricing discussion, diligence request, or custom SOW conversation, open `/pilot-demo-commercial-readiness#demo-session-planner` and leave with one selected demo, one timed run of show, one recommended package, one price band, one proof list, one no-PHI intake route, and one retained boundary.

## Interactive Demo Session Planner

The presentation workspace turns the canonical six-demo registry into a controlled buyer meeting plan. The operator selects:

- one registered product demo;
- an executive, clinical-operations, technology/security, financial-operations, or research-operations audience;
- workflow proof, governance controls, technical evidence, or commercial scope as the primary focus;
- a 15-, 30-, or 45-minute meeting length.

The deterministic planner then produces a five-step agenda whose allocated minutes exactly match the selected meeting length. Each step has a presenter objective, concise talk track, inspectable proof route, and visible retained boundary. The same plan identifies the buyer sponsor, workflow owner, recommended pilot, pricing guidance, acceptance criteria, discovery questions, no-PHI intake path, plan ID, and audit hash.

The planner stores no buyer data, accepts no free text, calls no provider, and sends nothing externally. Downloaded Markdown is generated locally in the browser. Every plan is synthetic-only, requires human review, and explicitly denies binding quote, external-send, release, PHI, production connector, payer, EHR, and clinical-care authority.

The policy test evaluates all 360 combinations of six demos, five audiences, four focus modes, and three meeting lengths. It verifies agenda timing, proof-route coverage, stable fingerprints, no-PHI intake, human review, and denied commercial and release authority.

## Governed Rehearsal Gate

The planner includes a local rehearsal gate before the operator opens the protected buyer-demo handoff. Before the evidence-content confirmation is available, the operator must run an automated proof preflight. The preflight issues bounded, anonymous, same-origin, read-only `HEAD` requests to the plan's canonical proof routes with a five-second timeout. It accepts no entered URL, sends no request body or browser credentials, stores no buyer data, and cannot access an external origin or write to the protected workspace.

After route reachability passes, the operator marks each of the five governed presentation steps as practiced and confirms three controls:

- the reachable proof routes were reviewed against the statements used in the walkthrough;
- the no-PHI, human-review, and no-live-execution boundary was spoken;
- the bounded pilot close named an accountable sponsor, workflow owner, synthetic input, evidence target, and human decision.

The gate weights agenda coverage at 40 points and each control at 20 points. It fails closed until all four criteria pass, and the proof-review criterion requires both automated route reachability and operator evidence-content review. Route reachability does not establish evidence quality, clinical correctness, buyer acceptance, pilot authorization, external-send approval, release approval, or production readiness.

Evidence-content review, spoken-boundary rehearsal, and the pilot-close rehearsal remain operator self-attestation and require human accountability.

The rehearsal record is generated locally as Markdown. It includes the plan fingerprint, preflight result and audit hash, route status metadata, criteria, blockers, control confirmations, and an explicit authority boundary. It is not stored or uploaded automatically. Durable buyer-demo history remains solely in the existing authenticated Sales Operations session and packet workflow.

## Metadata-Only Protected Handoff

After the rehearsal gate reaches 100%, the planner creates a metadata-only handoff draft containing only canonical enum selections, plan identity, proof-route count, and deterministic plan, preflight, rehearsal, and handoff fingerprints. It contains no free text, buyer identity, patient data, credential, token, clinical content, or external destination.

Sales Operations treats the draft as untrusted public-origin metadata. It rejects missing, duplicated, unknown, oversized, malformed, fingerprint-mismatched, and noncanonical plan fields. An accepted draft proves only that the selected plan matches the governed catalog and that the metadata arrived intact; client-origin preflight and rehearsal references are not independent verification.

The handoff never saves automatically. A signed-in AAL2 operator must select the correct opportunity, inspect the evidence, and explicitly choose `Record Demo Session`. Only that existing protected mutation can bind the validated metadata to tenant-scoped session history and an audited packet. Invalid handoff metadata disables the protected recording control until the rehearsal is rebuilt.

The handoff does not grant buyer acceptance, a binding quote, independent validation, external-send authority, pilot launch, release approval, PHI authority, production connector approval, payer submission, EHR writeback, clinical authority, deployment authorization, or customer go-live.

Run the deterministic route-preflight and rehearsal policy tests with:

```bash
npm run test:pilot-demo-proof-preflight
npm run test:pilot-demo-rehearsal
npm run test:pilot-demo-protected-handoff
```

## Buyer Conversion Packets

Each mapped demo now carries a structured buyer conversion packet with:

- sponsor role
- workflow owner role
- review cadence
- decision window
- proof bundle
- acceptance criteria
- no-PHI intake fields
- paid diligence triggers
- disqualifiers
- pricing guardrail
- minimum paid step
- close plan
- retained boundary
- human review requirement
- audit hash

Use these packets to keep demo follow-up consistent. They are sales enablement and scope-control artifacts only; they do not create a binding quote, customer authorization, production approval, clinical authority, or permission to process PHI.

## Boundary

This is commercial readiness and pricing guidance only. It is not a signed quote, contract, procurement approval, customer permission, revenue guarantee, profit guarantee, ROI guarantee, reimbursement guarantee, legal/accounting/tax advice, audited financial reporting, securities material, investment advice, valuation assurance, PHI authority, production connector approval, EHR writeback approval, payer submission approval, security certification, or live clinical care authorization.
