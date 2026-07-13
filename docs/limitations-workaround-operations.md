# SCRIMED Limitations and Workaround Operations

SCRIMED Limitations and Workaround Operations exposes `/limitations-workarounds`, `/api/limitations-workarounds`, and `/api/limitations-workarounds/brief` as the operator layer for resolving issues, boundaries, limitations, gaps, and bottlenecks without crossing authority lines.

This lane answers: when a request is blocked, what is the safe path today?

Updated: 2026-06-29

## Routes

- `/limitations-workarounds`
- `/api/limitations-workarounds`
- `/api/limitations-workarounds/brief`

## Operating Boundary

This is a workaround and containment layer only. It does not authorize PHI processing, live clinical care, patient matching, EHR writeback, payer submission, production connectors, public API SLAs, contractual uptime, managed service coverage, autonomous remediation, live autonomous AI, production model routing, legal advice, accounting advice, tax advice, audited financial reporting, securities material, revenue guarantees, profit-margin guarantees, security certification, accessibility certification, regulatory approval, public quantum capability claims, or buyer release authority.

## Workaround Packets

- Synthetic no-PHI packet
- External evidence reference
- Human-reviewed communication packet
- AAL2 protected proof packet
- API contract readiness packet
- Model-route register packet
- Deal desk exception packet
- Global regional workaround pack

## Known Limit Resolution Queue

SCRIMED now tracks current build and launch blockers as owned resolution work orders. Each work order includes current impact, immediate workaround, durable resolution, owner, next proof command, fail-closed check, graduation gate, proof routes, and hard stops.

Current queue:

- AAL2 durable-store token smoke: future strict authenticated durable-store smoke runs require a fresh human AAL2 operator token from a tenant-admin, pilot-lead, or reviewer. Workaround: inspect `/api/qa-evidence/aal2-smoke-readiness` or `/api/qa-evidence/aal2-smoke-readiness/brief`, run `npm run smoke:aal2:readiness`, then use `npm run smoke:aal2:token -- --clipboard-token --clear-clipboard --write-env-local`, or the hidden prompt path when clipboard transfer is blocked, then `npm run smoke:aal2:durable-store:strict`.
- Durable-store protected writes flag: public contract and fail-closed behavior remain live while protected writes depend on `SCRIMED_EXECUTION_ATTEMPT_DURABLE_STORE_ENABLED`, Supabase Auth, AAL2, tenant role, workspace membership, no-PHI guards, and route authorization.
- Sandbox DNS/network boundary: local sandbox DNS failures such as `ENOTFOUND app.scrimedsolutions.com` are environment boundaries, not product proof. Workaround: rerun the same command with approved network access or use a local `SCRIMED_BASE_URL`.
- Supabase password posture: protected operations remain passkey, magic-link, and AAL2 first until leaked-password protection or password-auth exclusion is documented and verified.
- Local Next.js SWC signature warning: a local native SWC code-signature warning can fall back to WASM when `npm run build` exits 0; it must remain visible in release notes and never mask nonzero build failures.
- Dirty worktree release hygiene: long-running build sessions must separate new changes, prior work, untracked files, generated output, and smoke evidence before commit, deploy, buyer proof, or investor proof claims expand.
- Local package-manager availability: `node scripts/scrimed-local-quality-runner.mjs` now executes cleanup, integrity, hygiene, nonsecret contracts, typecheck, lint, build, and final integrity through the active Node runtime without installing or mutating dependencies. It fails closed and clears sensitive environment values before child checks run.

## Recent Workaround Execution Ledger

SCRIMED now records recently resolved limitations as no-secret execution ledger entries. These entries retain the boundary handled, operational upgrade, verification command, fallback or rollback path, residual boundary, owner, proof routes, and hard stops. They do not store bearer tokens, Supabase secrets, PHI, patient records, production credentials, buyer-specific release approvals, or contractual claims.

Current ledger:

- Tenant-admin workspace bootstrap: the synthetic canary workspace now has a verified active tenant-admin path for protected AAL2 smoke proof while future users remain gated by access review.
- AAL2 token helper source precedence: explicit session-file, clipboard, or hidden-prompt token sources are preferred over stale local environment values, clipboard clearing is supported, and `/qa-aal2-run-evidence` now exposes a no-secret smoke readiness packet for operator review.
- Durable-store PHI guard precision: precision migrations allow safe synthetic envelope identifiers while preserving hard stops for PHI, patient identifiers, live charts, member data, and production records.
- Strict AAL2 durable-store smoke passed: no-secret proof exists for unauthenticated fail-closed record/replay/review and authorized AAL2 record, idempotency reuse, replay, and review disposition.
- Vercel deploy, lint, and typecheck hygiene: local dependency archives such as `node_modules 2` are excluded from deploy payloads, ESLint, and TypeScript analysis, and archive-mode deploy remains the fallback for file-count risk.

## Boundary Escalation Matrix

SCRIMED now maintains deterministic escalation paths for the highest-risk gray-zone requests:

- PHI, live patient data, member IDs, live charts, production records, or customer credentials
- Live clinical care, CDS, diagnosis, treatment, triage, prescribing, patient routing, or signed-note authority
- Production EHR/HIE/payer/imaging/device connectors, writeback, patient matching, SMART launch, or payer submission
- SOC 2, HITRUST, ISO, HIPAA certification, penetration testing, BAA/DPA, vendor-risk approval, or security signoff
- Public API access, SDK, unlimited usage, support coverage, contractual SLA, uptime, managed service, or scale-equivalence claims
- Autonomous agent execution, production remediation, email/calendar action, or clinical/legal/financial decisions without human approval
- Legal, tax, accounting, audited-financial, investor, securities, valuation, ROI, revenue, reimbursement, or profit claims
- Country launch, public-sector approval, government endorsement, GDPR/EU AI Act/NHS/MHRA/Australia approval, or data-residency claims

Each escalation requires severity, immediate decision, safe response, owner, escalation path, proof routes, decision SLA, hard stops, and graduation evidence before external language or execution can expand.

## Boundary Workaround Playbook

SCRIMED now maps preserved NO-GO boundaries to an operator playbook. Each playbook item defines trigger signals, immediate fail-closed decision, safe alternative, mapped workaround packet, required approvals, proof routes, validation command, fail-closed expectation, graduation evidence, residual risk, hard stops, and owner.

Current playbook coverage:

- Live PHI request: block intake, avoid storage, and re-scope to synthetic or metadata-only review with privacy, security, customer authority, BAA/DPA when required, and clinical governance gates.
- Clinical authority request: convert diagnosis, treatment, prescribing, triage, signed-note, or production CDS language into draft-only workflow intelligence with qualified clinical review.
- EHR/writeback connector request: block production connector execution and use standards mapping, fixture validation, sandbox preflight, and no-mutation evidence.
- Payer submission request: keep payer work in documentation readiness or draft-review mode and block payer or billing submission.
- Autonomous agent action request: switch to recommendation mode and require permissioned tools, audit logs, and named human approval.
- Security certification request: respond with readiness posture and evidence owner, not certification language.
- API/SLA/scale request: route to API contract readiness, pricing, support, incident, and executive review before any external commitment.
- Legal, finance, and investor request: hold external release and route exact language to qualified counsel, finance, accounting, tax, or securities review.
- Global and regional approval request: convert to no-PHI regional discovery and localization planning until local authority exists.
- Customer go-live release request: require protected proof, reviewer signoff, recipient authority, access-log reconciliation, and claim guard review.
- Public quantum claim request: keep quantum and future-infrastructure topics internal research only until validated evidence and approved claim language exist.

The playbook is a safe workaround layer only. It does not release PHI processing, live clinical care, EHR writeback, payer submission, production connector use, autonomous agent authority, certification claims, legal or financial advice, regional approval, customer go-live, or public quantum claims.

## Boundary Preflight Evaluator

SCRIMED now evaluates synthetic gray-zone requests before they become execution, buyer, clinical, security, legal, finance, connector, global, or release promises.

The evaluator is implemented in `evaluateLimitationsBoundaryPreflightRequest()` and exposed through `/api/limitations-workarounds`.

Synthetic preflight coverage includes:

- live PHI upload and patient matching request
- payer submission and reimbursement guarantee request
- autonomous agent production remediation and email-send request
- unsupported SOC 2/HIPAA certification claim request
- safe no-PHI synthetic assessment request

Each preflight returns:

- decision: safe-workaround-only, human-review-required, external-approval-required, or block-fail-closed
- matched playbook slugs and boundaries
- mapped workaround packets
- immediate decision
- safe alternative
- required approvals
- proof routes
- validation commands
- hard stops
- fail-closed expectation
- residual risk
- no-go boundary preserved flag
- external execution allowed: false
- PHI processing allowed: false
- autonomous action allowed: false
- deterministic audit hash

The evaluator is a routing and containment control only. It does not accept live payloads, process PHI, execute tools, submit payer work, write to EHRs, certify security/compliance, approve legal or financial claims, approve regional launch, approve buyer release, or authorize customer go-live.

## Operating Rules

1. Every limitation must have category, severity, owner, proof route, escalation trigger, safe workaround, and graduation gate.
2. Prefer reusable workaround packets before inventing a new process.
3. Escalate immediately when PHI, live care, legal, finance, tax, security certification, regional approval, production connector, public API SLA, live AI, or buyer-release authority is implied.
4. Attach expiration rules so workaround packets do not become stale informal permission.
5. Use the Boundary Escalation Matrix before responding to any gray-zone request with external buyer, investor, procurement, clinical, security, legal, finance, regional, API, or AI implications.
6. Maintain the Known Limit Resolution Queue for active build, smoke, identity, network, toolchain, and release-hygiene blockers.
7. Promote repeated issues into Navigation Audit, Operational Efficiency, Boundary Resolution, Platform Power, Service Reliability, or public smoke coverage.

## Non-Secret Verification

Use `npm run test:nonsecret` before deploy to verify generated integrity, AAL2 token policy, durable-store source contracts, limitations-workaround blocker contracts, and sales-demo QA token policy without requiring production DNS, Supabase credentials, bearer tokens, or PHI.

Use `npm run smoke:limitations-workarounds` when a change touches `/limitations-workarounds`, `/api/limitations-workarounds`, product console coverage, public smoke expectations, known-blocker language, `.gitignore`, `.vercelignore`, or the AAL2 durable-store smoke error boundary.
