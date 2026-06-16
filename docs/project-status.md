# SCRIMED Project Status

Updated: 2026-06-16

## Latest Buyer Tenant Lifecycle Release

- Added guarded tenant-per-buyer lifecycle activation for provisioned Sales Operations opportunities through `/api/sales-operations/opportunities/{intakeId}/tenant-lifecycle`.
- Added audited lifecycle packets through `/api/sales-operations/opportunities/{intakeId}/tenant-lifecycle/packet` so tenant-admins can retain SSO/domain policy, manual invitation delivery posture, access-review cadence, retention/archive controls, activation checklist, and competitive advantage signals.
- Added a private `sales_buyer_tenant_lifecycles` table with deny-all RLS and tenant-admin AAL2 plus server-held authorization for lifecycle activation and packet release.
- Updated `/sales-operations` with buyer tenant lifecycle status, access-review due date, lifecycle packet history, activation action, and packet download action.
- Updated `/pilot-deal-room`, `/product`, `/hub`, `/api/product/console`, and public smoke coverage with buyer tenant lifecycle proof-stack posture.
- Strengthened the competitive edge: SCRIMED can now show buyers a governed path from intake to opportunity, buyer-specific workspace, lifecycle controls, proof packets, and paid synthetic pilot without accepting PHI or pretending production SSO/live connectors are already approved.
- Preserved the boundary: lifecycle automation is for governed synthetic enterprise evaluations only. It does not authorize PHI, live clinical execution, payer submission, patient outreach, autonomous diagnosis, compliance certification, legal advice, or reimbursement guarantees.
- Remaining gate: production customer SSO configuration, transactional invitation sending, customer-specific tenant architecture, BAA/DPA stack, retention deletion, and production connector authorization still require signed enterprise controls.

## Latest Opportunity Workspace Provisioning Release

- Added guarded per-opportunity workspace provisioning for qualified Sales Operations opportunities through `/api/sales-operations/opportunities/{intakeId}/workspace-provisioning`.
- Added audited provisioning packets through `/api/sales-operations/opportunities/{intakeId}/workspace-provisioning/packet` so tenant-admins can retain buyer-specific workspace slug, invitation policy, onboarding plan, retention schedule, and packet history.
- Added a private `sales_opportunity_workspaces` mapping table with deny-all RLS and tenant-admin AAL2 plus server-held authorization for all mutations.
- Updated Deal Room packets so provisioned opportunities route to their buyer-specific protected workspace instead of the default synthetic fallback.
- Updated `/sales-operations` with buyer workspace status, provision action, workspace packet download, and Buyer Room link.
- Updated `/pilot-deal-room`, `/product`, `/hub`, `/api/product/console`, and public smoke coverage with the opportunity workspace proof-stack posture.
- Preserved the boundary: opportunity workspaces are governed synthetic enterprise evaluation rooms only. They do not accept PHI, authorize live clinical execution, certify compliance, guarantee reimbursement, submit payer transactions, contact patients, or provide medical, legal, regulatory, or billing advice.
- Remaining gate: production customer SSO configuration, automated invitation sending, signed customer tenant architecture, retention deletion, and production connector authorization still require formal enterprise controls.

## Latest Pilot Deal Room Release

- Added `/pilot-deal-room` and `/api/pilot-deal-room` to organize the buyer path from official website discovery to product proof, pilot intake, Sales Operations, protected Buyer Pilot Room diligence, premium pricing, and paid synthetic pilot.
- Added protected `/api/sales-operations/opportunities/{intakeId}/deal-room-packet` so tenant-admins can generate an audited Markdown Pilot Deal Room packet for a retained no-PHI opportunity.
- Added `buyer-deal-room-packet-downloaded` to the private sales audit event model and retained `last_buyer_deal_room_packet_at` on the no-PHI intake opportunity record.
- Updated `/sales-operations` with a Deal Room Packet action and status tile for each opportunity.
- Updated `/product`, `/hub`, `/`, `/api/product/console`, `/api/hub/summary`, and public smoke coverage so the deal-room layer is visible across the product surface.
- Preserved a default synthetic workspace fallback (`atlas-synthetic-evaluation`) for opportunities that have not yet been qualified and provisioned.
- Preserved the boundary: the Pilot Deal Room is a non-binding enterprise diligence and sales artifact. It does not accept PHI, authorize live clinical execution, certify compliance, guarantee reimbursement, submit payer transactions, or provide medical, legal, or regulatory advice.

## Latest Trust Safety Operations Release

- Added passkey-aware Supabase Auth clients for `/pilot-workspace/access` and `/sales-operations`, with enrolled-passkey sign-in, signed-in passkey registration, and continued TOTP/AAL2 gates for governed tenant actions.
- Added authenticated passkey management panels for listing, renaming, registering, refreshing, and revoking passkeys inside protected pilot and Sales Operations.
- Added a tenant-admin aggregate enterprise proof packet route at `/api/pilot-workspaces/{workspaceSlug}/enterprise-proof-packet`, plus a protected workspace download action that combines synthetic sessions, TrustOS decisions, Agent Workspace work orders, Trust Safety incidents, tenant access posture, governance ledger records, and recent audit activity after a write-before-release audit event.
- Added an authenticated tenant-session verification panel inside `/pilot-workspace/access` so an approved AAL2 browser session can validate protected workspace routes and the audited enterprise proof-packet artifact without storing bearer tokens in CI.
- Added an authenticated Pilot Demo Readiness Command Center inside `/pilot-workspace/access` so buyer-demo operators can see readiness score, blockers, required actions, buyer brief lines, and a repeatable runbook from durable synthetic sessions, audit activity, proof packets, and tenant-session verification.
- Added durable Pilot Demo Readiness snapshots and audited Demo Readiness Packet exports so buyer-demo evidence can be retained, downloaded, and traced through append-only audit events without storing CI bearer tokens.
- Added a protected Buyer Pilot Room inside `/pilot-workspace/access`, plus `/api/pilot-workspaces/{workspaceSlug}/buyer-room` and audited `/api/pilot-workspaces/{workspaceSlug}/buyer-room/packet`, to package readiness, premium sales path, competitive edge, evidence counts, limitations, workarounds, and write-before-release buyer diligence.
- Added `/competitive-edge` and `/api/competitive-edge` so public SCRIMED positioning clearly broadcasts healthcare intelligence infrastructure, TrustOS proof, interoperability sidecar strategy, premium enterprise motion, FaithCore/Atlas separation, and global deployment optionality without implying live clinical execution.
- Added `passkey-or-magic-link` tenant identity readiness posture, API validation, and migration support so tenant administration can reflect the current phishing-resistant sign-in path without breaking legacy magic-link-only records.
- Added `smoke:public` and `scripts/public-production-smoke.mjs` for no-secret production route, product posture, readiness, and fail-closed verification, including the aggregate enterprise proof packet protected route.
- Added `smoke:trustops` as a package script for the TrustOps authenticated smoke path.
- Reclassified the remaining auth limitation: leaked-password protection is a Supabase dashboard control for password-based auth, while SCRIMED product flows continue to avoid password sign-in and require passkey or magic-link sign-in plus AAL2 where protected mutations are involved.
- Added a trust-ops incident queue with severity, owner, accountable agent, source channel, containment action, remediation plan, legal-hold status, SLA tier, improvement actions, and audit-ready report exports.
- Added `/api/trust-safety-operations/incidents/{incidentId}/report` for downloadable no-PHI trust safety incident reports.
- Added tenant-scoped durable TrustOps incident storage contract with private Supabase tables, deny-all RLS, guarded RPCs, AAL2 tenant mutation gates, append-only events, legal-hold fields, notification decisions, and review-packet exports.
- Added protected tenant TrustOps APIs at `/api/pilot-workspaces/{workspaceSlug}/trust-safety-incidents`, `/api/pilot-workspaces/{workspaceSlug}/trust-safety-incidents/{incidentId}`, and `/api/pilot-workspaces/{workspaceSlug}/trust-safety-incidents/{incidentId}/review-packet`.
- Applied the tenant TrustOps incident migration to the `scrimed-protected-pilot` Supabase project.
- Added FK index hardening for TrustOps and Agent Workspace tables after Supabase performance advisor review.
- Added the authenticated `/pilot-workspace/access` Tenant TrustOps incident workspace panel for dashboard metrics, no-PHI incident creation, status/legal-hold/notification review updates, event inspection, and audited review-packet download.
- Added `scripts/trustops-authenticated-smoke.mjs` for TrustOps fail-closed and authenticated happy-path verification.
- Added target-audience positioning for CIO, CISO, privacy, compliance, clinical operations, RCM, payer, government, investor, and strategic partner review.
- Added a dedicated Supabase migration for `attribution-analytics-packet-downloaded`, plus a rollout fallback to the existing sales artifact event until the production migration is verified.
- Added `/trust-safety-operations` and `/api/trust-safety-operations` for SCRIMED's 24/7 trust, safety, copyright, legal, security, monitoring, auditing, fixing, and continuous-improvement operating model.
- Added named trust agents for PHI shielding, agent firewalling, copyright/IP provenance, claims/legal guardrails, clinical safety, security incident watch, and continuous improvement.
- Strengthened Enterprise Readiness with copyright registration candidates, trademark strategy, third-party license/provenance controls, generated-media review, and 24/7 incident-response readiness gates.
- Added tenant-admin attribution analytics into `/sales-operations` and added a protected audited attribution analytics packet export under `/api/sales-operations/opportunities/{intakeId}/attribution-analytics-packet`.
- Preserved the boundary: this is not legal advice, compliance certification, managed SOC/MDR coverage, production clinical monitoring, breach determination, PHI storage, or live clinical execution authorization.
- Remaining gate: place a CI-held short-lived AAL2 tenant smoke token before using unattended authenticated TrustOps, Agent Workspace, Demo Readiness Packet, Buyer Pilot Room Packet, and aggregate enterprise proof-packet happy paths in automated buyer-demo smoke. Public readiness smoke now runs without secrets, while human-run buyer-room packets, demo readiness snapshots, packet exports, and protected verification can be executed from `/pilot-workspace/access` with the current browser session. If password sign-in remains enabled anywhere in the Supabase project, enable leaked-password protection in the dashboard; SCRIMED product flows remain passwordless/passkey-first.

## Latest Attribution Analytics Release

- Added `/attribution-analytics` and `/api/attribution-analytics` for public synthetic source-to-pilot cohort analytics across source category, campaign, buyer type, deployment profile, offer, cadence, proof packet, and sales outcome.
- Added protected `/api/sales-operations/attribution-analytics` so authenticated tenant-admins can derive cohort analytics from persisted no-PHI Sales Operations opportunities.
- Added Attribution Analytics to `/product`, `/hub`, `/sales-attribution`, `/market-activation`, and product readiness brief output.
- Kept the durable source aligned to existing retained buyer-intake metadata at `private.pilot_intake_submissions.payload.attribution`, avoiding a new database migration or paid connector dependency.
- Preserved the boundary: public analytics are synthetic fixtures and do not represent real customers, revenue, patient outcomes, clinical validation, or guaranteed ROI.

## Latest Sales Attribution And Source Intelligence Release

- Added `/sales-attribution` and `/api/sales-attribution` for CRM-safe source tracking, UTM/referrer capture, target audience routing, revenue-stream mapping, deployment-profile selection, source-informed strategy signals, and human follow-up cadence.
- Added `/source-intelligence` and `/api/source-intelligence` to encode official public signals from HL7/FHIR, Notion, Figma release notes, Cursor, Hugging Face, Siemens Healthineers, Snowflake, Sierra, and Anthropic into SCRIMED-specific implementation themes and governance boundaries.
- Extended `/api/pilot/intake` to capture no-PHI attribution metadata and return the routing packet with the accepted intake response.
- Updated `/pilot` to safely capture browser route, referrer, and UTM fields without exposing the buyer to extra form friction.
- Added a manual no-PHI review-packet fallback for pilot intake when Supabase durable retention or CRM routing is unavailable, so demos and buyer flows do not fail while retention remains explicitly unconfirmed.
- Updated Sales Operations exports, CRM webhook payloads, follow-up drafts, assessment invitations, proposals, and opportunity detail UI with attribution, audience, deployment profile, and cadence context.
- Added Sales Attribution and Source Intelligence to `/hub`, `/product`, readiness brief output, and route registry.
- Corrected the operations quality blocker to reflect the current direct-Node quality path when `npm` is unavailable locally.

## Latest Deployment And Market Activation Release

- Added `/deployment-profiles` and `/api/deployment-profiles` for managed cloud, private cloud, hospital-controlled, sovereign/public-sector, and edge/on-prem deployment readiness fixtures.
- Added deployment profile readiness to protected pilot proof packets so buyer diligence can see environment, cost model, residency posture, metrics, production gates, and blocked claims.
- Added `/market-activation` and `/api/market-activation` for revenue streams, target audiences, message house, public relations, communications, advertising, and FaithCore market programs.
- Strengthened `/faithcore` with opt-in programs, revenue use, communications rules, and explicit clinical, emergency, consent, and spiritual-authority boundaries.
- Added Market Activation and Deployment Profiles to `/hub` and `/product`.
- Addressed known limitations through code-side workarounds and honest gates: direct Node entrypoints for local `npm` unavailability, Webpack fallback for local Turbopack/SWC code-signature constraints, and external-secret-only handling for authenticated GitHub smoke.

## Latest Strategic Intelligence And Activation Governance Release

- Added `/strategic-intelligence` and `/api/strategic-intelligence` to translate public platform signals into SCRIMED-specific agents, interoperability, governance, deployment, proof metrics, and next-build paths.
- Added protected `/api/pilot-workspaces/{workspaceSlug}/activation-governance` so tenant-admins can record the selected governance workflow pack as an append-only activation ledger seed.
- Added activation governance visibility to tenant activation proof packets after the seed is recorded.
- Added a tenant-admin runbook step for recording the governance pack seed before invitation, onboarding, activation, and proof export.
- Preserved the boundary: source-informed strategy is not a partnership claim, certification, live connector authorization, medical device control, payer approval, or autonomous clinical execution.

## Latest Governance Pack Routing Release

- Added deterministic governance workflow pack routing to enterprise pilot intake.
- Attached the selected governance pack to the durable no-PHI intake payload for sales operations and future protected workspace activation.
- Added governance-ledger-ready metadata for selected pack slug, status, route, brief route, matched signals, no-PHI boundary, and synthetic pilot boundary.
- Added selected governance pack visibility to intake confirmation, Sales Operations opportunity detail, audited proposal generation, CRM CSV export, CRM webhook payload, calendar invitation, and follow-up draft.
- Added `docs/governance-pack-routing.md` as the operator runbook for pack selection, product boundary, sales use, and the remaining authenticated CI secret gate.
- Preserved the commercial boundary: governance packs are operating templates for synthetic pilots and enterprise evaluations, not legal advice, compliance certification, production authorization, payer approval, or clinical authorization.

## Latest Sales Operations Release

- Enforced passkey or passwordless magic-link sign-in plus free TOTP authentication for `/sales-operations`, with AAL2 verification, a twelve-hour maximum session, a two-hour inactivity boundary, and global session termination.
- Added native vendor-neutral CRM CSV exports so SCRIMED sales operations does not depend on a paid CRM; approved webhook synchronization remains optional.
- Added durable next-action due dates, automatic due and overdue triage, audited human-reviewed email drafts, and audited follow-up completion.
- Added audited enterprise assessment calendar invitations with durable schedule state and optional HTTPS meeting links.
- Added protected APIs for opportunity assignment, cadence, proposals, CRM exports, follow-up drafts, follow-up completion, assessment invitations, and controlled CRM synchronization.
- Bound new governed buyer intake to the first SCRIMED tenant while retaining the business-contact and workflow-scope-only boundary.
- Added append-only sales audit events for opportunity updates, commercial artifact releases, follow-up completion, assessment invitations, and CRM outcomes.
- Kept direct private lead and audit-table access denied; authorization remains enforced inside Postgres through verified tenant-admin membership.
- Added proposal generation that maps buyer offer interest to the appropriate sellable SCRIMED pilot program without implying live clinical execution.
- Added a deterministic generated-cache preflight so local quality gates no longer depend on npm availability or fail on duplicated disposable `.next` artifacts.

## Latest Protected Pilot Workspace Release

- Added `/pilot-workspace` as the protected enterprise pilot control surface.
- Added `/pilot-workspace/access` as the invite-only authenticated tenant workspace console.
- Selected Supabase Auth plus Postgres row-level security for tenant identity, isolation, durable synthetic sessions, and append-only audit events.
- Provisioned the `scrimed-protected-pilot` Supabase project in `us-east-1`, applied both protected-pilot migrations, confirmed RLS on every exposed pilot table, and cleared all database security and missing-index advisor findings.
- Connected Supabase to the Vercel Production and Preview runtimes, configured the production Auth site and redirect URLs, and disabled public user signups.
- Provisioned the `scrimed-protected-pilot-rate-limit` Upstash Redis database on the Vercel Marketplace free plan in `iad1` and connected Production and Preview credentials.
- Verified the branded production runtime against Supabase and Upstash; `/api/pilot-workspaces/readiness` now reports `productionActivationVerified: true`.
- Activated `scrimedsolutions@gmail.com` as the first tenant-admin, bootstrapped the SCRIMED tenant and Atlas governed synthetic workspace, and verified authenticated workspace access.
- Created the first durable synthetic evaluation, downloaded its audited proof packet, and confirmed the committed `synthetic-session-created` then `proof-packet-downloaded` event sequence.
- Verified cross-tenant RLS isolation, anonymous access denial, and withheld direct mutation privileges without retaining synthetic verification artifacts.
- Added append-only audit-trail visibility to the authenticated protected-pilot workspace.
- Hardened repository quality gates to ignore quarantined generated Next.js caches, preventing recurrence of generated-cache lint stalls.
- Added authenticated protected APIs for tenant workspace discovery, durable sessions, audit inspection, and audited proof-packet downloads.
- Added a hardened SQL migration that withholds direct mutation rights and commits synthetic sessions with audit events transactionally.
- Added downloadable synthetic enterprise proof packets and a public preview export.
- Added active rate limiting to public pilot intake and protected session creation, with Upstash Redis connected for distributed production enforcement.
- Added live runtime verification for the migrated protected pilot schema and distributed Redis provider so configuration presence cannot masquerade as activation.
- Fixed the recurring generated-cache build fault by expanding integrity checks across the full `.next` tree.
- Preserved the commercial boundary: protected pilot evidence is synthetic only; live clinical execution remains denied.

## Current Baseline

The active `scrimed-site` baseline is a Next.js App Router site on `main`. PR #10 established the deployable Vercel foundation, and subsequent execution converted the placeholder root page into a serious SCRIMED platform surface with an OS Hub command layer, master operating context, integration contract boundary, synthetic clinical validation layer, and explicit quality gates.

Current baseline includes:

- Official public website context for https://www.scrimedsolutions.com through Wix
- Next.js App Router project structure
- Root page at `/`
- Product console at `/product`
- Pricing and sales strategy at `/pricing`
- Company operations readiness at `/operations`
- Trust and enterprise readiness center at `/trust-center`
- Public claims register at `/claims`
- Enterprise pilot intake at `/pilot`
- Tenant-admin sales operations at `/sales-operations`
- Protected pilot workspace at `/pilot-workspace`
- AgentOS Evaluation Workspace at `/evaluation`
- SCRIMED AgentOS v1 at `/agents`
- Memory fabric at `/memory`
- Audit and governance layer at `/audit`
- Observability and continuous validation dashboard at `/observability`
- SCRIMED OS Hub console at `/hub`
- Hub readiness console at `/hub/readiness`
- Hub events console at `/hub/events`
- Platform page at `/platform`
- Master operating context at `/operating-context`
- Agent workflow registry at `/agents`
- Agent workflow detail routes under `/agents/[slug]`
- Synthetic workflow execution readiness at `/workflows`
- Workflow execution detail routes under `/workflows/[slug]`
- Workflow execution result fixtures at `/workflows/results`
- Workflow execution result detail routes under `/workflows/results/[slug]`
- Workflow result validation at `/workflows/results/validation`
- Workflow promotion review at `/workflows/promotion-review`
- Governed execution API contracts at `/workflows/contracts`
- Governed execution API contract detail routes under `/workflows/contracts/[slug]`
- Identity and access readiness at `/workflows/identity-access`
- Execution-attempt readiness at `/workflows/execution-attempts`
- Governed execution implementation readiness at `/workflows/implementation-readiness`
- Governed execution implementation detail routes under `/workflows/implementation-readiness/[slug]`
- Denied execution audit boundaries at `/workflows/execution-audit`
- Denied execution audit boundary detail routes under `/workflows/execution-audit/[slug]`
- Audit persistence readiness at `/workflows/audit-persistence`
- SCRIMED Atlas Intelligence Core v1 at `/atlas`
- FaithCore operating model at `/faithcore`
- Integration contracts page at `/integrations`
- Interoperability control plane at `/interoperability`
- Interoperability standard detail routes under `/interoperability/[slug]`
- Executable interoperability conformance evaluations at `/interoperability/evaluations`
- Conformance evaluation detail routes under `/interoperability/evaluations/[slug]`
- Integration fixture contracts at `/integrations/fixtures`
- Integration fixture validation at `/integrations/fixture-validation`
- Fixture change review at `/fixtures/change-review`
- Detailed contract routes under `/contracts/[slug]`
- Synthetic clinical environment at `/synthetic`
- Synthetic scenario routes under `/synthetic/[slug]`
- Synthetic fixture contracts at `/synthetic/fixtures`
- Synthetic fixture detail routes under `/synthetic/fixtures/[slug]`
- Synthetic validation page at `/synthetic/validation`
- Quality gates page at `/quality`
- Trust and Watchtower page at `/trust`
- Module pages for Clinical Copilot, DocuTwin, CarePath AI, TrialCore, and Watchtower
- Shared Hub model in `app/lib/scrimedHub.ts`
- Shared Hub operations model in `app/lib/hubOperations.ts`
- Shared operating context model in `app/lib/operatingContext.ts`
- Shared agent workflow model in `app/lib/agentWorkflows.ts`
- Shared workflow execution model in `app/lib/workflowExecutions.ts`
- Shared workflow execution result model in `app/lib/workflowExecutionResults.ts`
- Shared workflow result validation model in `app/lib/workflowResultValidation.ts`
- Shared workflow promotion-review model in `app/lib/workflowPromotionReviews.ts`
- Shared workflow execution contract model in `app/lib/workflowExecutionContracts.ts`
- Shared identity and access readiness model in `app/lib/identityAccessReadiness.ts`
- Shared execution-attempt readiness model in `app/lib/executionAttemptReadiness.ts`
- Shared workflow implementation readiness model in `app/lib/workflowImplementationReadiness.ts`
- Shared workflow execution audit-boundary model in `app/lib/workflowExecutionAudit.ts`
- Shared audit persistence readiness model in `app/lib/auditPersistenceReadiness.ts`
- Shared integration contract model in `app/lib/integrationContracts.ts`
- Shared interoperability standards and conformance model in `app/lib/interoperabilityStandards.ts`
- Shared executable interoperability conformance evaluation model in `app/lib/interoperabilityConformanceEvaluations.ts`
- Shared integration fixture model in `app/lib/integrationFixtures.ts`
- Shared integration fixture validation model in `app/lib/integrationFixtureValidation.ts`
- Shared fixture change-review model in `app/lib/fixtureChangeReviews.ts`
- Shared synthetic scenario model in `app/lib/syntheticClinical.ts`
- Shared synthetic fixture model in `app/lib/syntheticFixtures.ts`
- Shared synthetic validation model in `app/lib/syntheticValidation.ts`
- Shared quality gate model in `app/lib/qualityGates.ts`
- Shared product console model in `app/lib/productConsole.ts`
- Shared pilot intake model in `app/lib/pilotIntake.ts`
- Shared sales operations model in `app/lib/salesOperations.ts`
- Shared protected sales operations store in `app/lib/salesOperationsStore.ts`
- Shared AgentOS model in `app/lib/agentOS.ts`
- Shared Atlas Intelligence Core model in `app/lib/atlasIntelligenceCore.ts`
- Global visual system in `app/globals.css`
- Health endpoint at `/api/health`
- Platform status endpoint at `/api/status`
- Product console endpoint at `/api/product/console`
- Product readiness brief endpoint at `/api/product/readiness-brief`
- Pricing and sales strategy endpoint at `/api/commercial/pricing`
- Company operations readiness endpoint at `/api/operations/readiness`
- Enterprise pilot intake endpoint at `/api/pilot/intake`
- Tenant-admin sales operations endpoint at `/api/sales-operations`
- Protected opportunity mutation, proposal, and CRM synchronization endpoints under `/api/sales-operations/opportunities/[intakeId]`
- Protected pilot readiness endpoint at `/api/pilot-workspaces/readiness`
- Tenant-authenticated workspace discovery at `/api/pilot-workspaces`
- Tenant-authenticated durable session endpoints under `/api/pilot-workspaces/[workspaceSlug]/sessions`
- Tenant-authenticated append-only audit inspection under `/api/pilot-workspaces/[workspaceSlug]/audit`
- Audited downloadable proof packets under `/api/pilot-workspaces/[workspaceSlug]/sessions/[sessionId]/proof-packet`
- AgentOS Evaluation Workspace endpoint at `/api/agent-os/evaluation`
- AgentOS summary endpoint at `/api/agent-os`
- AgentOS task planning endpoint at `/api/agent-os/tasks`
- Atlas Intelligence Core endpoint at `/api/atlas/intelligence-core`
- Memory fabric endpoint at `/api/memory`
- Audit and governance endpoint at `/api/audit`
- Observability endpoint at `/api/observability`
- Trust Card endpoint at `/api/trust/cards`
- Readiness endpoint at `/api/readiness`
- Platform events endpoint at `/api/events`
- Operating context endpoint at `/api/operating-context`
- Agent workflow registry endpoint at `/api/agents/workflows`
- Per-agent workflow endpoints under `/api/agents/workflows/[slug]`
- Workflow execution endpoint at `/api/workflows/executions`
- Per-workflow execution endpoints under `/api/workflows/executions/[slug]`
- Workflow execution result endpoint at `/api/workflows/results`
- Per-workflow execution result endpoints under `/api/workflows/results/[slug]`
- Workflow result validation endpoint at `/api/workflows/results/validation`
- Workflow promotion-review endpoint at `/api/workflows/promotion-review`
- Workflow execution contract endpoint at `/api/workflows/contracts`
- Per-workflow execution contract endpoints under `/api/workflows/contracts/[slug]`
- Identity and access readiness endpoint at `/api/workflows/identity-access`
- Execution-attempt readiness endpoint at `/api/workflows/execution-attempts`
- Workflow implementation readiness endpoint at `/api/workflows/implementation-readiness`
- Workflow execution audit-boundary endpoint at `/api/workflows/execution-audit`
- Per-workflow execution audit-boundary endpoints under `/api/workflows/execution-audit/[slug]`
- Audit persistence readiness endpoint at `/api/workflows/audit-persistence`
- Deny-by-default governed execution endpoints under `/api/workflows/governed-execution/[slug]`
- Fixture change-review endpoint at `/api/fixtures/change-review`
- Integration fixture endpoint at `/api/integration-fixtures`
- Per-fixture integration endpoints under `/api/integration-fixtures/[slug]`
- Integration fixture validation endpoint at `/api/integration-fixtures/validation`
- Integration contracts endpoint at `/api/contracts`
- Interoperability standards endpoint at `/api/interoperability/standards`
- Interoperability conformance endpoint at `/api/interoperability/conformance`
- Interoperability conformance evaluation endpoints at `/api/interoperability/evaluations` and `/api/interoperability/evaluations/[slug]`
- Per-contract API routes under `/api/contracts/[slug]`
- Synthetic scenario endpoint at `/api/synthetic/scenarios`
- Per-scenario synthetic API routes under `/api/synthetic/scenarios/[slug]`
- Synthetic fixture endpoint at `/api/synthetic/fixtures`
- Per-fixture synthetic API routes under `/api/synthetic/fixtures/[slug]`
- Synthetic validation endpoint at `/api/synthetic/validation`
- Per-scenario validation API routes under `/api/synthetic/validation/[slug]`
- Quality gates endpoint at `/api/quality/gates`
- Hub summary endpoint at `/api/hub/summary`
- Vercel deployment configuration
- TypeScript configuration and Next.js environment references
- GitHub Actions build workflow in `.github/workflows/ci.yml`
- Runtime scripts for development, type checking, build, and start

## Deployment Status

Vercel is the current working deploy gate and has repeatedly reported success for the `scrimed-site` deployment. The Vercel connector now resolves the `scrimed-site` project under the `temitayo-dahunsis-projects` team. GitHub CLI authentication is configured for local pushes, and Vercel production deploys from pushed GitHub `main` commits have reached READY for the current SCRIMED product build path. A controlled local Node.js 22 and npm toolchain independently verifies deterministic dependency installation, security audit, lint, TypeScript validation, and production builds. GitHub Actions run visibility is available and recent CI runs pass.

Vercel, GitHub Actions, local package-manager verification, and the committed lockfile provide active independent build-quality paths.

Direct unauthenticated HTTP requests to protected Vercel deployment URLs can return Vercel Authentication instead of the app response. Connector-authenticated Vercel checks are the current source of truth for protected deployment API smoke tests unless SCRIMED intentionally disables deployment protection or configures public API access.

## Quality Process

Current active quality path:

1. Vercel deployment status is the primary deploy gate.
2. Synthetic fixture contracts and executable assertions validate workflow behavior without live patient data.
3. The master operating context defines the mission, decision framework, Atlas boundary, FaithCore boundary, and delivery standard.
4. The agent workflow registry defines owner, permissions, inputs, outputs, audit events, guardrails, interoperability targets, and human-review policy before agent execution.
5. Fixture change review records expected-output fingerprints before workflows or connectors depend on fixture changes.
6. Synthetic workflow execution readiness maps staged module workflows to agent, synthetic, integration, quality, result-fixture, and Watchtower gates.
7. Workflow execution result fixtures capture deterministic outputs, review state, blocked actions, and quality evidence for each staged workflow.
8. Workflow result validation compares expected outputs, result output signals, Watchtower traces, review state, and blocked actions before promotion.
9. Workflow promotion review records synthetic-only approval and retained blocked actions before production automation.
10. Governed execution API contracts define request schema, response schema, preconditions, audit events, observability signals, and denied capabilities before implementation.
11. Identity and access readiness defines production identity provider, tenant isolation, role permissions, patient-context authorization, service authentication, session lifecycle, consent, break-glass access, audit linkage, and regional identity controls before governed execution can accept authenticated requests.
12. Execution-attempt readiness defines attempt identity, idempotency policy, durable state, concurrency, retry, failure quarantine, rate limits, privacy boundaries, and regional compliance before any governed execution route can create or replay work.
13. Deny-by-default governed execution endpoints reject execution before request-body parsing, connector access, workflow mutation, attempt creation, or patient-facing action.
14. Denied execution audit boundaries define metadata-only capture, evidence headers, audit-envelope fields, and never-capture policy before durable logging.
15. Audit persistence readiness defines durable storage, retention, access, encryption, incident response, regional residency, and Watchtower alerting decisions before denied-event metadata can be persisted.
16. Integration fixtures define synthetic request and expected-response shapes for non-synthetic connector contracts.
17. Interoperability standards, profiles, conformance evidence, and integration contracts define the data boundary before real connectors are implemented.
18. Hub readiness and event endpoints expose operational status.
19. Quality gates make every active, planned, and bypassed validation path explicit.
20. Enterprise pilot intake validates buyer requests, blocks PHI-style content, durably retains accepted no-PHI submissions in a private ledger, and packages sanitized CRM-ready handoff payloads for secure CRM routing.
21. Pricing and sales strategy defines public preview, paid assessment, synthetic pilot, protected enterprise pilot, enterprise license, strategic partnership, buyer routing, value metrics, and commercial guardrails.
22. Company operations readiness defines publishing, deployment, app domain, Wix routing, local quality tooling, deployment protection, owners, resolution paths, and fallbacks.
23. AgentOS v1 defines planner, router, specialist registry, memory fabric, TrustQA, audit logging, human approval checkpoints, MCP connector framework, task planning, RBAC, sandbox runtime, observability, and HIPAA-ready architecture controls.
24. Atlas Intelligence Core v1 defines structural document intelligence, evidence retrieval contracts, Trust Cards, agent sandbox runtime, continuous validation metrics, AI Asset Registry, shadow AI detection, and reimbursement readiness boundaries.
25. AgentOS Evaluation Workspace converts synthetic document packets into bounded task plans, structural document-intelligence assignments, Atlas Trust Cards, audit previews, and observability-ready outcome records.
26. React and React DOM package pins are held at the current 19.2.4 patch line for the Next.js App Router security baseline.
27. Protected pilot workspaces define tenant-authenticated discovery, row-level isolation, durable synthetic sessions, append-only audit events, audited proof packets, and fail-closed activation gates.
28. Public pilot intake and protected session creation enforce active request limits, with Upstash Redis connected and verified for distributed production counters.

Current bypassed or deferred checks:

- Live clinical integrations remain planned until synthetic fixtures and contracts are stable.

Replacement path:

- Vercel deployment plus pilot intake validation and fixture-backed executable synthetic validation is the current active build-quality path.
- Fixture change review, workflow execution readiness, workflow execution result fixtures, result validation, promotion review, governed execution contracts, identity and access readiness, execution-attempt readiness, deny-by-default execution endpoints, denied-execution audit boundaries, and audit persistence readiness replace silent fixture drift and premature live workflow automation.
- Contract pages and APIs replace live connector assumptions until connector implementation is explicitly approved.
- Readiness, events, and quality gate endpoints replace ambiguous manual status tracking.

## CI Dependency Hardening

The repository now has a controlled, committed `package-lock.json`, allowing reproducible installs and npm caching without the earlier missing-lockfile failure mode.

Fix applied:

- Restored `cache: npm` in `.github/workflows/ci.yml`.
- Replaced `npm install` with deterministic `npm ci`.
- Added `npm audit --audit-level=moderate` as a CI security gate.
- Replaced the removed Next.js `next lint` command with the supported ESLint CLI and matching Next.js configuration.
- Migrated internal anchors to Next.js links and removed effect-driven pilot-prefill state so lint completes without errors.
- Added `npm run typecheck` to CI.
- Added a `typecheck` script to `package.json`.
- Added a generated-workspace integrity precheck so duplicate-suffixed `@types` or `.next` artifacts fail with a precise repair path before TypeScript resolution or builds are corrupted.
- Upgraded GitHub Actions checkout and Node setup steps to their Node 24-based v6 releases and set explicit read-only repository contents permission.
- Updated Next.js to `16.2.7` and overrode its vulnerable transitive PostCSS dependency with patched `8.5.15`.
- Verified zero audit findings, TypeScript success, and a successful production build locally.

## Product Direction

SCRIMED remains focused on becoming an AI healthcare intelligence platform with these primary tracks:

- Clinical Copilot for clinician decision support
- DocuTwin for medical documentation workflows
- CarePath AI for patient intake, triage, and navigation
- TrialCore for clinical trial discovery and matching
- Watchtower / TrustWatch for AI reliability, drift detection, and safety monitoring
- SCRIMED Atlas for faith-neutral enterprise governance, compliance, interoperability, ROI, and agentic operations
- FaithCore for opt-in spiritually aligned encouragement and trust support with explicit clinical boundaries
- Agent Commander and governed specialized agents for prior authorization, revenue cycle, scheduling, trial matching, documentation, compliance, interoperability, clinical intelligence, research, governance, and supply chain workflows
- Enterprise pilot intake and CRM-ready buyer handoff for synthetic SCRIMED Atlas evaluations and healthcare AI readiness assessments
- Pricing and sales strategy for public preview, assessment, synthetic pilot, protected pilot, enterprise license, and strategic partnerships
- Company operations readiness for GitHub auth, Vercel deployment, app subdomain DNS, Wix CTA routing, local build tooling, and deployment protection
- SCRIMED AgentOS v1 for governed planner/router/specialist orchestration, memory, audit, TrustQA, RBAC, MCP connectors, sandbox runtime, and task planning
- AgentOS Evaluation Workspace for interactive synthetic buyer packets, Trust Cards, audit previews, and observability records
- SCRIMED Atlas Intelligence Core v1 for structural document understanding, evidence-backed reasoning, Trust Cards, continuous validation, AI governance, and reimbursement-aware operating design
- Standards-bound integration contracts for future FHIR, HL7 v2, DICOM/DICOMweb, X12, pricing, and synthetic clinical test data
- Interoperability registry and conformance controls for exchange, imaging, payer, pharmacy, device, profile, and terminology standards
- Integration fixtures and validation diffs before live connector implementation
- Fixture change review, synthetic workflow execution readiness, deterministic workflow result fixtures, result validation, synthetic-only promotion review, governed execution API contracts, identity and access readiness, execution-attempt readiness, deny-by-default execution endpoints, denied-execution audit boundaries, and audit persistence readiness before module automation
- Synthetic validation before live clinical data or production integrations

## Completed Execution

- Closed stale PRs #1 through #9 as superseded by PR #10.
- Added `docs/project-status.md` to preserve the operating baseline and next-step plan.
- Rebuilt the homepage from a placeholder into a platform-oriented SCRIMED web presence.
- Added `/api/status` for module readiness metadata.
- Added `tsconfig.json`, `next-env.d.ts`, and global styling to strengthen the Next.js foundation.
- Added GitHub Actions CI for dependency installation, type checking, and Next.js build verification.
- Confirmed Vercel deployment success for the strengthened `main` state.
- Added `/platform` and `/trust` as first product detail surfaces.
- Added `/api/readiness` and `/api/events` as stable foundation-level operational endpoints.
- Added dedicated pages for Clinical Copilot, DocuTwin, CarePath AI, TrialCore, and Watchtower.
- Linked module pages from `/platform` and exposed module routes from `/api/status`.
- Added the SCRIMED OS Hub data model, `/hub` console, and `/api/hub/summary` endpoint.
- Wired homepage, status, and readiness surfaces to the Hub layer.
- Added integration contracts for FHIR, HL7 v2, DICOM/DICOMweb, claims/utilization, pricing transparency, and synthetic clinical testing.
- Added the interoperability control plane with typed standards, official-source references, conformance requirements, APIs, and contract bindings.
- Added executable synthetic conformance test kits for FHIR R4 and US Core, SMART App Launch, and DICOMweb with deterministic checks, evidence artifacts, Interoperability Agent ownership, and exact live-use blockers.
- Added `/integrations` and `/api/contracts`, then wired contracts into Hub, readiness, and homepage surfaces.
- Fixed the likely CI workflow failure caused by npm caching without a lockfile.
- Added shared Hub operations data and backed `/api/readiness` and `/api/events` with it.
- Added `/hub/readiness` and `/hub/events` console views.
- Added detailed pages and per-contract API routes for every integration contract.
- Added synthetic clinical scenarios, `/synthetic`, scenario detail pages, `/api/synthetic/scenarios`, and per-scenario API routes.
- Added structured synthetic request and expected-output fixture contracts for CarePath AI, DocuTwin, and TrialCore validation.
- Added deterministic synthetic validation checks, `/synthetic/validation`, `/api/synthetic/validation`, and per-scenario validation APIs.
- Added quality gate modeling, `/quality`, and `/api/quality/gates`.
- Promoted executable synthetic validation into the quality gates summary.
- Wired quality gates into the Hub route inventory, readiness checks, event stream, homepage, and Hub console.
- Replaced the failing or unavailable verification path with a documented Vercel plus synthetic validation process.
- Codified the SCRIMED SOLUTIONS master operating context in `docs/master-operating-context.md`, `app/lib/operatingContext.ts`, `/operating-context`, and `/api/operating-context`.
- Added SCRIMED Atlas and FaithCore surfaces with explicit enterprise, faith, and clinical-safety boundaries.
- Added a governed agent workflow registry in `app/lib/agentWorkflows.ts`, `/agents`, `/agents/[slug]`, `/api/agents/workflows`, and `/api/agents/workflows/[slug]`.
- Added synthetic request and expected-response fixtures for FHIR, HL7 v2, DICOM/DICOMweb, claims/utilization, and pricing transparency contracts.
- Added integration fixture validation and diff fingerprints in `/integrations/fixture-validation` and `/api/integration-fixtures/validation`.
- Recorded https://www.scrimedsolutions.com as the official SCRIMED SOLUTIONS website through Wix.
- Added fixture change-review fingerprints in `app/lib/fixtureChangeReviews.ts`, `/fixtures/change-review`, and `/api/fixtures/change-review`.
- Added the first synthetic workflow execution readiness surface for CarePath AI in `app/lib/workflowExecutions.ts`, `/workflows`, `/workflows/[slug]`, `/api/workflows/executions`, and `/api/workflows/executions/[slug]`.
- Expanded synthetic workflow execution readiness to CarePath AI, DocuTwin, and TrialCore.
- Added deterministic workflow execution result fixtures in `app/lib/workflowExecutionResults.ts`, `/workflows/results`, `/workflows/results/[slug]`, `/api/workflows/results`, and `/api/workflows/results/[slug]`.
- Promoted workflow result fixtures into Hub route inventory, readiness checks, events, quality gates, homepage signals, and workflow detail pages.
- Added workflow result validation diffs in `app/lib/workflowResultValidation.ts`, `/workflows/results/validation`, and `/api/workflows/results/validation`.
- Added workflow promotion review records in `app/lib/workflowPromotionReviews.ts`, `/workflows/promotion-review`, and `/api/workflows/promotion-review`.
- Promoted workflow result validation and promotion review into Hub route inventory, readiness checks, events, quality gates, homepage signals, and workflow detail pages.
- Added governed execution API contracts in `app/lib/workflowExecutionContracts.ts`, `/workflows/contracts`, `/workflows/contracts/[slug]`, `/api/workflows/contracts`, and `/api/workflows/contracts/[slug]`.
- Promoted governed execution API contracts into Hub route inventory, readiness checks, events, quality gates, homepage signals, and workflow console navigation.
- Added deny-by-default governed execution readiness in `app/lib/workflowImplementationReadiness.ts`, `/workflows/implementation-readiness`, `/workflows/implementation-readiness/[slug]`, `/api/workflows/implementation-readiness`, and `/api/workflows/governed-execution/[slug]`.
- Promoted locked execution endpoints into Hub route inventory, readiness checks, events, quality gates, homepage signals, and workflow console navigation.
- Added denied execution audit boundaries in `app/lib/workflowExecutionAudit.ts`, `/workflows/execution-audit`, `/workflows/execution-audit/[slug]`, `/api/workflows/execution-audit`, and `/api/workflows/execution-audit/[slug]`.
- Added evidence headers to locked governed execution POST responses without parsing request bodies.
- Promoted denied-execution audit boundaries into Hub route inventory, readiness checks, events, quality gates, homepage signals, and workflow console navigation.
- Added audit persistence readiness in `app/lib/auditPersistenceReadiness.ts`, `/workflows/audit-persistence`, and `/api/workflows/audit-persistence`.
- Promoted audit persistence readiness into Hub route inventory, readiness checks, events, quality gates, homepage signals, and workflow console navigation while keeping durable logging decision-required.
- Added identity and access readiness in `app/lib/identityAccessReadiness.ts`, `/workflows/identity-access`, and `/api/workflows/identity-access`.
- Promoted identity and access readiness into Hub route inventory, readiness checks, events, quality gates, homepage signals, and workflow console navigation while keeping governed execution deny-by-default.
- Added execution-attempt readiness in `app/lib/executionAttemptReadiness.ts`, `/workflows/execution-attempts`, and `/api/workflows/execution-attempts`.
- Promoted execution-attempt readiness into Hub route inventory, readiness checks, events, quality gates, homepage signals, workflow console navigation, and deny-by-default evidence headers while keeping attempt creation disabled.
- Added the expanded Product Console operating layer with services, agents, workflow engine examples, governance controls, evidence metrics, buyer actions, and downloadable readiness brief.
- Added `/demos`, `/demos/[slug]`, `/api/demos`, and `/api/demos/[slug]` with five executable buyer demos that connect named products and agents to guided steps, proof routes, outcomes, governance boundaries, and production exclusions.
- Added `/pilots`, `/pilots/[slug]`, `/api/pilots`, and `/api/pilots/[slug]` with four sellable enterprise programs that define duration, engagement model, included demos, deliverables, buyer inputs, success metrics, governance gates, and production exclusions.
- Promoted the Demo and Pilot Center into the Product Console, Hub, readiness checks, event stream, quality gates, homepage buyer path, platform catalog, commercial routing, readiness brief, and documentation.
- Added `/pilot`, `/api/pilot/intake`, and `app/lib/pilotIntake.ts` for governed enterprise pilot intake, no-PHI validation, synthetic/evaluation-only acknowledgement, qualification, and CRM-ready handoff packaging.
- Added a private, token-gated Supabase intake ledger so the API does not report a buyer request as accepted unless a durable destination retained it.
- Added downloadable buyer-ready demo briefs and non-binding pilot proposals for every configured product demo and pilot program.
- Added `/pricing`, `/api/commercial/pricing`, and `app/lib/commercialStrategy.ts` for recommended pricing tiers, sales motion, value metrics, buyer route strategy, and commercial guardrails.
- Added `/operations`, `/api/operations/readiness`, and `app/lib/companyOperations.ts` for go-live blocker tracking, buyer-route checklist, owner assignments, resolution paths, and fallback processes.
- Added SCRIMED AgentOS v1 in `app/lib/agentOS.ts`, `/agents`, `/api/agent-os`, and `/api/agent-os/tasks` with planner, router, specialist registry, memory fabric, TrustQA, audit logging, human approval checkpoints, MCP connector framework, sandbox runtime, RBAC, observability, and production-gated task planning.
- Added SCRIMED Atlas Intelligence Core v1 in `app/lib/atlasIntelligenceCore.ts`, `/atlas`, and `/api/atlas/intelligence-core` with structural document intelligence, evidence source contracts, Trust Cards, continuous validation metrics, AI Asset Registry, shadow-AI detection, and reimbursement-aware posture.
- Added `/memory`, `/audit`, `/observability`, `/api/memory`, `/api/audit`, `/api/observability`, and `/api/trust/cards` to expose the memory fabric, audit/governance layer, continuous validation dashboard, and Trust Card system.
- Promoted AgentOS and Atlas Core into the homepage, Hub, Product Console, Workflow Console, Trust surface, readiness brief, route inventory, and commercial positioning while preserving the synthetic pilot and enterprise assessment boundary.
- Added the interactive AgentOS Evaluation Workspace in `/evaluation`, `app/lib/agentEvaluationWorkspace.ts`, and `/api/agent-os/evaluation` to generate synthetic task plans, structural parser assignments, Atlas Trust Cards, evidence sources, audit previews, blocked capabilities, and observability outcome records.
- Added executable TrustOS v1 in `/trust-os`, `app/lib/trustOS.ts`, `/api/trust-os`, and `/api/trust-os/evaluate` with deterministic PHI Shield, Agent Firewall, Clinical Guardian, policy, model-route, explainability, compliance, human-escalation, and metadata-only Clinical Trace decisions.
- Embedded TrustOS decisions into AgentOS synthetic evaluations so durable protected-pilot sessions and proof packets carry request governance evidence.
- Repaired Sales Operations TOTP enrollment recovery so pending factors survive refresh, can be verified into AAL2, or can be safely restarted when a QR setup is lost.
- Promoted company operations readiness into the Product Console proof stack and downloadable readiness brief so go-live blockers, manual actions, owners, and fallbacks are visible during buyer and investor review.
- Updated `react` and `react-dom` to `19.2.4`, Next.js to `16.2.7`, and committed a controlled lockfile with patched PostCSS `8.5.15`.
- Authenticated GitHub CLI, pushed queued `main` commits, confirmed Vercel production deployments reach READY through the Git integration path, and verified `app.scrimedsolutions.com` returns SCRIMED health status.
- Added authenticated Agent Workspace cockpit controls for governed synthetic work-order creation, protected state transitions, reviewer assignment, outcome metric capture, local governance export, and append-only event review while preserving no-PHI/no-clinical-execution boundaries.
- Added `npm run smoke:agent-workspace` for fail-closed public verification and optional authenticated tenant-admin/pilot-lead happy-path testing when an approved AAL2 bearer token is supplied.

## Recommended Next Steps

1. Use `/trust-os` to evaluate every new synthetic agent action and retain the TrustOS decision inside AgentOS evaluation and proof-packet evidence.
2. Operate new buyer opportunities through `/sales-operations`, assign an accountable owner, set a due action, release audited commercial artifacts, and prepare assessment invitations.
3. Use the vendor-neutral native CRM export immediately; configure `SCRIMED_PILOT_INTAKE_WEBHOOK_URL` and optional `SCRIMED_PILOT_INTAKE_WEBHOOK_TOKEN` only when an approved CRM destination is selected.
4. Operationalize tenant onboarding, access review, proof-packet retention, buyer-specific pilot activation, and the Agent Workspace authenticated smoke script with approved tenant secrets.
5. Implement the server-audited retention/legal-hold and incident-export ledger before representing dashboard governance exports as retained legal or incident evidence.
6. Add scoped evidence upload only after identity, privacy, malware scanning, retention, and durable audit controls are approved.
7. Keep Vercel, GitHub Actions, local build verification, demo proof packets, and quality gates as independent active deploy-quality paths.
8. Promote governed execution beyond deny-by-default only after auth, identity, execution-attempt idempotency, persistence, durable audit logging, privacy/security review, connector boundary decisions, rate limits, and shutdown controls are explicit.

## Notes

Future work should branch from `main` and treat the current Next.js site as the execution foundation. The older FastAPI and one-off Vercel repair branches should remain closed unless a specific implementation detail is being intentionally reused.
