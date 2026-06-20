# SCRIMED Protected Pilot Workspaces

## Product Boundary

Protected pilot workspaces retain governed synthetic evaluation evidence only. They do not accept live PHI, execute clinical care, submit payer transactions, contact patients, or authorize autonomous diagnosis or treatment.

## Selected Architecture

- Identity: Supabase Auth with passkey or passwordless magic-link sign-in, verified server-side from bearer tokens.
- Tenant isolation: PostgreSQL row-level security backed by tenant memberships.
- Durable evidence: Supabase Postgres synthetic session records.
- Durable audit: append-only audit events created through hardened transactional functions.
- Rate limiting: Upstash Redis in production, with a bounded in-process fallback if Redis becomes unavailable.
- Proof packets: server-generated Markdown exports built from tenant-isolated synthetic session evidence.

Runtime APIs do not use a Supabase service-role key. Authorization is based on provider identity and database membership, never user-editable profile metadata.

## Passkey Authentication

Protected pilot access now supports enrolled-passkey sign-in and signed-in passkey registration through Supabase Auth. The product client explicitly opts into Supabase's passkey API, and tenant identity readiness can be marked as `passkey-or-magic-link`.

Passkeys improve sign-in resistance to phishing, but they do not remove SCRIMED's governed action controls. Protected workspace mutations, TrustOps actions, and tenant-admin operations still require fresh authenticated membership and AAL2/TOTP assurance where enforced.

Operational boundaries:

- Supabase passkey support is currently experimental, so the client opt-in and dependency version must be monitored during upgrades.
- Passkeys are bound to the configured relying-party ID and allowed origins. Keep `app.scrimedsolutions.com` and any approved preview/loopback origins stable before broad enrollment.
- Existing signed-in, confirmed, non-anonymous users can register passkeys. CI smoke cannot use passkeys directly because WebAuthn requires a human/browser ceremony.

## Activation

1. Provision the approved Supabase project. Completed on 2026-06-10 in `us-east-1`.
2. Apply `supabase/migrations/20260610185445_protected_pilot_workspaces.sql` and `supabase/migrations/20260610185540_protected_pilot_foreign_key_indexes.sql`. Completed and advisor-verified on 2026-06-10.
3. Create tenant, membership, and workspace bootstrap records through an approved administrative process. Completed for the first SCRIMED tenant-admin and Atlas governed synthetic workspace on 2026-06-10.
4. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Vercel. Completed for Production and Preview on 2026-06-10.
5. Configure `https://app.scrimedsolutions.com/pilot-workspace/access` as an approved Auth redirect URL. Completed on 2026-06-10.
6. Configure invite-only production sign-in, passkeys, MFA, session lifetime, and enterprise SSO policy. Public signups are disabled; passkey-aware clients are active; enterprise SSO decisions remain pending.
7. Provision Upstash Redis and configure its REST environment variables. Completed through the Vercel Marketplace free plan in `iad1` on 2026-06-10.
8. Run Supabase security and performance advisors. Database/RLS findings for the protected pilot schema are clear; the remaining Auth advisor is leaked-password protection for password-based sign-in. SCRIMED product flows stay passkey or passwordless magic-link based, and password sign-in should remain disabled unless leaked-password protection is enabled in Supabase Auth.
9. Verify tenant-crossing requests fail, audit rows cannot be updated or deleted, and proof packet downloads create audit events. Completed transactionally and through the authenticated production workspace on 2026-06-10.

## Protected Routes

- `GET /api/pilot-workspaces`
- `/pilot-workspace/access`
- `/pilot-deal-room`
- `GET /api/pilot-deal-room`
- `GET /api/sales-operations/opportunities/{intakeId}/deal-room-packet`
- `GET /api/sales-operations/opportunities/{intakeId}/command-center`
- `GET /api/sales-operations/opportunities/{intakeId}/demo-execution`
- `GET /api/sales-operations/opportunities/{intakeId}/demo-execution/brief`
- `GET /api/sales-operations/opportunities/{intakeId}/demo-sessions`
- `POST /api/sales-operations/opportunities/{intakeId}/demo-sessions`
- `GET /api/sales-operations/opportunities/{intakeId}/demo-sessions/{sessionId}/packet`
- `GET /api/pilot-workspaces/{workspaceSlug}/sessions`
- `POST /api/pilot-workspaces/{workspaceSlug}/sessions`
- `GET /api/pilot-workspaces/{workspaceSlug}/audit`
- `GET /api/pilot-workspaces/{workspaceSlug}/sessions/{sessionId}/proof-packet`
- `GET /api/pilot-workspaces/{workspaceSlug}/demo-readiness`
- `POST /api/pilot-workspaces/{workspaceSlug}/demo-readiness`
- `GET /api/pilot-workspaces/{workspaceSlug}/demo-readiness/{snapshotId}/packet`
- `GET /api/pilot-workspaces/{workspaceSlug}/buyer-room`
- `GET /api/pilot-workspaces/{workspaceSlug}/command-intelligence`
- `POST /api/pilot-workspaces/{workspaceSlug}/command-intelligence`
- `GET /api/pilot-workspaces/{workspaceSlug}/command-intelligence/{snapshotId}/packet`
- `GET /api/pilot-workspaces/{workspaceSlug}/clinical-activation-dossier`
- `GET /api/pilot-workspaces/{workspaceSlug}/clinical-activation-dossier/packet`
- `GET /api/pilot-workspaces/{workspaceSlug}/clinical-activation-approvals`
- `POST /api/pilot-workspaces/{workspaceSlug}/clinical-activation-approvals`
- `GET /api/pilot-workspaces/{workspaceSlug}/clinical-activation-approvals/packet`
- `GET /api/pilot-workspaces/{workspaceSlug}/operator-metrics`
- `POST /api/pilot-workspaces/{workspaceSlug}/operator-metrics`
- `GET /api/pilot-workspaces/{workspaceSlug}/metric-rollups`
- `POST /api/pilot-workspaces/{workspaceSlug}/metric-rollups`
- `GET /api/pilot-workspaces/{workspaceSlug}/metric-rollups/{snapshotId}/packet`
- `GET /api/pilot-workspaces/{workspaceSlug}/metric-trends`
- `POST /api/pilot-workspaces/{workspaceSlug}/metric-trends`
- `GET /api/pilot-workspaces/{workspaceSlug}/metric-trends/{reviewId}/packet`
- `GET /api/pilot-workspaces/{workspaceSlug}/board-scorecards`
- `POST /api/pilot-workspaces/{workspaceSlug}/board-scorecards`
- `GET /api/pilot-workspaces/{workspaceSlug}/board-scorecards/{scorecardId}/packet`
- `GET /api/pilot-workspaces/{workspaceSlug}/finance-methodology`
- `POST /api/pilot-workspaces/{workspaceSlug}/finance-methodology`
- `GET /api/pilot-workspaces/{workspaceSlug}/finance-methodology/packet`
- `GET /api/pilot-workspaces/{workspaceSlug}/external-approval-evidence`
- `POST /api/pilot-workspaces/{workspaceSlug}/external-approval-evidence`
- `GET /api/pilot-workspaces/{workspaceSlug}/external-approval-evidence/packet`
- `GET /api/pilot-workspaces/{workspaceSlug}/release-decisions`
- `POST /api/pilot-workspaces/{workspaceSlug}/release-decisions`
- `GET /api/pilot-workspaces/{workspaceSlug}/release-decisions/packet`
- `GET /api/pilot-workspaces/{workspaceSlug}/reviewer-signoffs`
- `POST /api/pilot-workspaces/{workspaceSlug}/reviewer-signoffs`
- `GET /api/pilot-workspaces/{workspaceSlug}/reviewer-signoffs/packet`
- `GET /api/pilot-workspaces/{workspaceSlug}/distribution-lockbox`
- `POST /api/pilot-workspaces/{workspaceSlug}/distribution-lockbox`
- `GET /api/pilot-workspaces/{workspaceSlug}/distribution-lockbox/packet`
- `GET /api/pilot-workspaces/{workspaceSlug}/release-authority-attestations`
- `POST /api/pilot-workspaces/{workspaceSlug}/release-authority-attestations`
- `GET /api/pilot-workspaces/{workspaceSlug}/release-authority-attestations/packet`
- `GET /api/pilot-workspaces/{workspaceSlug}/evidence-room-recipient-attestations`
- `POST /api/pilot-workspaces/{workspaceSlug}/evidence-room-recipient-attestations`
- `GET /api/pilot-workspaces/{workspaceSlug}/evidence-room-recipient-attestations/packet`
- `GET /api/pilot-workspaces/{workspaceSlug}/buyer-room/packet`
- `GET /api/pilot-workspaces/{workspaceSlug}/enterprise-proof-packet`

Protected routes fail closed with `503` until identity and durable storage are configured. They require a verified bearer token after activation.

`GET /api/pilot-workspaces/readiness` verifies the deployed runtime against the migrated Supabase schema and Upstash Redis. Environment-variable presence alone does not mark production activation as verified.

## External Approval Evidence Linkage

`/pilot-workspace/access` now includes Protected External Approval Evidence Linkage immediately after Protected Finance Methodology Gates. Tenant admins, pilot leads, and reviewers can record bounded no-PHI metadata references to externally retained finance, counsel, executive, privacy/security, clinical-governance, marketing-claims, and buyer-permission artifacts.

The database stores only a short label, approved external system, non-secret locator, owner label, domain, optional finance-gate link, retained blockers, release restrictions, and audit metadata. It does not store PHI, patient identifiers, payer member data, source contracts, credentials, signed BAAs/DPAs, legal opinions, audited financial statements, securities material, customer permission artifacts, advertising substantiation, clinical validation, compliance certification, production authorization, or live clinical execution approval.

Safe operating pattern:

- Keep actual approval artifacts in qualified external systems such as counsel data rooms, finance workbooks, customer procurement portals, security GRC systems, board materials, or approved secure channels.
- Record only non-secret reference metadata in SCRIMED.
- Download the audited linkage packet for diligence after the write-before-release audit event commits.
- Treat `ready-for-qualified-release-review-not-release-authority` as a review posture only, never as approval to release claims, securities materials, customer references, clinical workflows, or production access.

## Release Decision Workflow

`/pilot-workspace/access` now includes Protected Release Decision Workflow immediately after External Approval Evidence Linkage. Tenant admins, pilot leads, and reviewers can record no-PHI versioned claim registry decisions for buyer diligence, investor data rooms, public relations, marketing site language, sales collateral, internal board review, or customer case-study readiness.

Release decisions consume the latest external approval evidence references and compute whether all required approval domains are linked. A decision can reach `ready-for-qualified-release-review-not-release-authority` only when finance, counsel, executive, privacy/security, clinical-governance, marketing-claims, and buyer-permission metadata references are complete.

Safe operating pattern:

- Keep exact approval artifacts and claim sign-offs in qualified external systems.
- Record only bounded claim text, claim version, audience, channel label, evidence ids, and no-PHI review metadata in SCRIMED.
- Download the audited claim registry packet only after the write-before-release audit event commits.
- Treat release-review readiness as an internal control state. It is not legal approval, public release approval, advertising substantiation, audited financial reporting, customer permission, clinical validation, compliance certification, production authorization, or live clinical execution authority.

## Named Reviewer Sign-Off Packets

`/pilot-workspace/access` now includes Protected Named Reviewer Sign-Off Packets immediately after Release Decision Workflow. Tenant admins, pilot leads, and reviewers can record no-PHI metadata references to externally retained sign-offs for finance, counsel, executive, privacy/security, clinical-governance, marketing-claims, and buyer-permission reviewer roles.

Named reviewer sign-offs compute whether all required reviewer roles are linked to a ready release decision for the same claim version and whether sign-off metadata is expired or expiring soon. The highest state is `ready-for-controlled-distribution-review-not-release-authority`.

Safe operating pattern:

- Keep reviewer approvals, signatures, legal opinions, customer permissions, and source artifacts in qualified external systems.
- Record only bounded reviewer-role, claim-version, artifact-scope, external locator, expiration, and no-PHI review metadata in SCRIMED.
- Download the audited named reviewer sign-off packet only after the write-before-release audit event commits.
- Treat controlled distribution review readiness as an internal control state. It is not legal approval, public release approval, external distribution approval, advertising substantiation, audited financial reporting, customer permission, clinical validation, compliance certification, production authorization, or live clinical execution authority.

## Distribution Lockbox

`/pilot-workspace/access` now includes Protected Distribution Lockbox immediately after Named Reviewer Sign-Off Packets. Tenant admins, pilot leads, and reviewers can record no-PHI disabled-by-default metadata for buyer diligence rooms, investor data rooms, board rooms, sales collateral, marketing releases, public relations, and customer case-study channels.

Distribution lockbox records link to named reviewer sign-off ids and track audience, channel control, manifest version, external manifest locator, customer permission reference, counsel review reference, distribution window, recipient scope, and revocation plan. Distribution remains disabled in the current product boundary even when all reviewer roles are linked.

Safe operating pattern:

- Keep actual artifacts, signatures, legal opinions, customer permissions, counsel reviews, recipient lists, and distribution approvals in qualified external systems.
- Record only bounded no-PHI metadata references in SCRIMED.
- Download the audited distribution lockbox packet only after the write-before-release audit event commits.
- Treat lockbox readiness as an internal operator control. It is not legal approval, public release approval, external distribution approval, advertising substantiation, audited financial reporting, customer permission, clinical validation, compliance certification, production authorization, or live clinical execution authority.

## Release Authority Attestations

`/pilot-workspace/access` now includes Protected Release Authority Attestations immediately after Distribution Lockbox. Tenant admins, pilot leads, and reviewers can record no-PHI metadata references to externally retained release authority across counsel, customer permission, executive sponsorship, privacy/security, finance, clinical-governance, and marketing-claims owners.

Release authority attestations link to ready disabled distribution lockboxes and compute domain coverage for the attested manifest version. The highest state is `release-authority-review-ready-not-release-approval`; release remains disabled in the current product boundary.

Safe operating pattern:

- Keep actual signatures, legal opinions, customer permissions, recipient lists, approval artifacts, contracts, and release decisions in qualified external systems.
- Record only bounded no-PHI authority domain, external locator label, owner label, manifest version, authority window, scope, and revocation trigger metadata in SCRIMED.
- Download the audited release authority attestation packet only after the write-before-release audit event commits.
- Treat release authority metadata as internal diligence evidence. It is not legal approval, public release approval, external distribution approval, advertising substantiation, audited financial reporting, customer permission, clinical validation, compliance certification, reimbursement assurance, production authorization, or live clinical execution authority.

## Evidence Room Recipient Attestations

`/pilot-workspace/access` now includes Protected Evidence Room Recipient Attestations immediately after Release Authority Attestations. Tenant admins, pilot leads, and reviewers can record no-PHI metadata for intended evidence-room recipient segments, access windows, packet references, and revocation posture after release authority metadata is complete.

Recipient attestation records link to completed release authority attestation ids and compute recipient-control coverage. The highest state is `recipient-attestation-review-ready-not-release-approval`; export remains disabled in the current product boundary.

Safe operating pattern:

- Keep exact recipient lists, recipient emails, access grants, signatures, customer permissions, legal opinions, and evidence-room permissions in qualified external systems.
- Record only bounded no-PHI recipient segment, role-scope label, external evidence-room locator, packet locator, access window, and revocation trigger metadata in SCRIMED.
- Download the audited recipient attestation packet only after the write-before-release audit event commits.
- Treat recipient attestation metadata as internal diligence evidence. It is not legal approval, public release approval, external distribution approval, advertising substantiation, audited financial reporting, customer permission, clinical validation, compliance certification, reimbursement assurance, production authorization, or live clinical execution authority.

## Pilot Demo Readiness Command Center

`/pilot-workspace/access` now includes a protected Pilot Demo Readiness Command Center. It turns the current workspace, durable synthetic sessions, append-only audit events, proof-packet release events, and tenant-session verification results into:

- A ready/review/blocked status.
- A numeric readiness score.
- Required operator actions before a buyer call.
- Buyer brief lines for enterprise demo preparation.
- A repeatable four-step demo runbook.

This closes the human-run buyer-demo readiness gap without exporting bearer tokens to CI. The command center does not create a clinical validation claim, legal conclusion, compliance certification, production authorization, or live-care capability.

## Demo Readiness Snapshots And Packets

The protected command center can now save durable demo readiness snapshots. Each snapshot persists the current readiness score, buyer brief, required actions, check results, runbook, tenant-session verification metadata, and evidence counts into `public.pilot_demo_readiness_snapshots`.

Snapshot creation requires:

- Approved tenant membership.
- Fresh AAL2 assurance.
- Tenant-admin or pilot-lead role.
- Server-held runtime authorization.
- Synthetic-only evidence.
- Append-only `demo-readiness-snapshot-created` audit event.

Demo Readiness Packet export requires a selected snapshot and commits `demo-readiness-packet-downloaded` before releasing Markdown evidence. The packet remains buyer diligence support for synthetic pilots only; it is not a clinical validation, legal conclusion, compliance certification, production authorization, reimbursement claim, or live-care capability.

## Buyer Pilot Room

`/pilot-workspace/access` now includes a protected Buyer Pilot Room. It packages the current workspace evidence into one enterprise diligence surface:

- Readiness state and score.
- Durable synthetic session and audit counts.
- Latest demo readiness snapshot posture.
- Competitive edge pillars with proof routes and blocked claims.
- Premium enterprise sales path from assessment through protected pilot and annual operating license.
- Known limitations with safe workarounds and production gates.
- Audited Markdown Buyer Diligence Export with readiness, QA evidence, pricing posture, legal/privacy/security/safety controls, demo and pilot proof, degraded-section disclosure, and production hard gates.

The JSON room route at `GET /api/pilot-workspaces/{workspaceSlug}/buyer-room` requires tenant membership and fresh AAL2 governance context. The export route at `GET /api/pilot-workspaces/{workspaceSlug}/buyer-room/packet` commits `buyer-pilot-room-packet-downloaded` before releasing the Markdown artifact and preserves the legacy packet route for compatibility.

This closes the evidence-fragmentation gap for serious buyers: SCRIMED can now show product proof, commercial path, QA evidence, legal/privacy/security/safety posture, limitations, workarounds, and competitive edge in one tenant-scoped export without weakening the synthetic-only boundary.

## Command Intelligence Hub

`/pilot-workspace/access` now includes the protected SCRIMED Command Intelligence Hub between Demo Readiness and Buyer Pilot Room. It unifies the workspace's current command posture:

- Agent Commander orchestration with planner, router, specialist services, shared memory, approvals, MCP/tool contracts, and observability signals.
- Buyer Room readiness, export route, latest demo snapshot, and buyer diligence posture.
- Trust Engine outputs with recommendation, confidence, evidence source, risk score, human review trigger, validation status, and audit log.
- Continuous evaluation gates for groundedness, hallucination/safety, workflow success, latency/cost, drift, and human feedback.
- MCP/tool-access plans for EHR/FHIR/HL7, claims/prior auth, imaging/DICOM, research/trials, scheduling/referrals, and wearables/devices.
- Operator Safe Mode controls for no PHI, no production credentials, no autonomous clinical authority, no payer submission, and no unsupported certification claims.
- Observability signals including audit traces, packet exports, manual QA packet hashes, degraded sections, and next recommended actions.

The JSON route at `GET /api/pilot-workspaces/{workspaceSlug}/command-intelligence` requires AAL2 governance context, tenant workspace membership, no-store response headers, synthetic-only data-boundary headers, and rate limiting. It does not create new records, store secrets, enable connectors, or grant live execution authority.

Operators can now persist AAL2 human-reviewed command posture snapshots with `POST /api/pilot-workspaces/{workspaceSlug}/command-intelligence`. Snapshot creation recomputes evidence server-side, requires the fixed `aal2-human-reviewed-synthetic-command-posture` attestation, persists to `public.command_intelligence_snapshots`, and commits `command-intelligence-snapshot-created` into the workspace audit trail.

Command Intelligence packet export at `GET /api/pilot-workspaces/{workspaceSlug}/command-intelligence/{snapshotId}/packet` requires an existing snapshot and commits `command-intelligence-packet-downloaded` before releasing Markdown evidence. This gives enterprise buyers and investors a retained command-history packet without screenshots, PHI, secrets, or unsupported production claims.

Current boundary: the hub is a command posture for governed synthetic pilots and enterprise evaluation only. Production use still requires signed customer scope, BAA/DPA path where applicable, legal/privacy/security/clinical review, approved connectors, live monitoring, and human operating controls.

## Protected Operator Metrics

`/pilot-workspace/access` now includes protected Public Market Operator Metrics immediately after the Command Intelligence Hub. This gives tenant operators a no-PHI way to capture aggregate operating signals for:

- Model cost.
- Human review time.
- Delivery hours.
- Proof-packet count.
- Workflow volume.

`GET /api/pilot-workspaces/{workspaceSlug}/operator-metrics` requires AAL2 governance context, tenant workspace membership, no-store headers, synthetic-only boundary headers, and rate limiting. It returns retained records plus a dashboard that summarizes metric coverage, latest capture, totals by KPI, remaining metric types, and safe workarounds.

`POST /api/pilot-workspaces/{workspaceSlug}/operator-metrics` accepts only bounded metric metadata and fixed `no-phi-finance-readiness-operator-metric` plus `synthetic-business-workflow-only` attestations. The guarded Supabase RPC recomputes metric labels, units, KPI ids, actor role, audit metadata, financial authority, and securities authority before inserting the record and committing `operator-metric-recorded` to the append-only workspace audit trail.

Safe workaround: if the protected ledger is unavailable, use `/public-market-readiness` KPI definitions and external finance-reviewed spreadsheets for board or investor materials. Do not treat raw captures as audited financial statements, securities offering material, valuation assurance, reimbursement assurance, clinical validation, compliance certification, or live-care authorization.

Current boundary: operator metrics must not store PHI, patient identifiers, payer member data, live clinical records, source contracts, credentials, secrets, medical facts, audited financials, investment advice, accounting advice, tax advice, legal advice, or production clinical approval.

## Protected Metric Rollups

`/pilot-workspace/access` now includes protected Metric Rollups immediately after Public Market Operator Metrics. This lets tenant operators convert no-PHI metric captures into internal board operating snapshots and audited Markdown packet downloads.

`GET /api/pilot-workspaces/{workspaceSlug}/metric-rollups` requires AAL2 governance context, tenant workspace membership, no-store headers, synthetic-only boundary headers, and rate limiting. It returns persisted rollup snapshots plus a live dashboard derived from protected operator metrics.

`POST /api/pilot-workspaces/{workspaceSlug}/metric-rollups` accepts only reporting-period metadata, fixed `finance-reviewed-no-phi-operating-rollup` attestation, `synthetic-business-workflow-only` data boundary, and a bounded no-PHI review note. The guarded Supabase RPC aggregates protected operator metrics, computes model-cost-per-workflow and reviewer/delivery/proof ratios, persists the snapshot, and commits `protected-metric-rollup-created` to the append-only audit trail.

`GET /api/pilot-workspaces/{workspaceSlug}/metric-rollups/{snapshotId}/packet` commits `protected-metric-rollup-packet-downloaded` before returning the internal board packet. Packet headers carry the no-audited-financial-report and no-securities-offering-material authority.

Safe workaround: if rollup storage or packet export is unavailable, use the protected operator metric dashboard plus external finance-reviewed spreadsheets. Do not use rollup output as audited financial reporting, securities offering material, investment advice, accounting advice, tax advice, legal advice, valuation assurance, reimbursement assurance, clinical validation, compliance certification, or live-care authorization.

Current boundary: rollups summarize aggregate no-PHI operating metadata only. They must not store PHI, patient identifiers, payer member data, source contracts, credentials, secrets, audited financial statements, securities materials, external valuation claims, or production clinical approval.

## Protected Metric Trend Reviews

`/pilot-workspace/access` now includes protected Metric Trend Reviews immediately after Protected Metric Rollups. This lets tenant operators compare two no-PHI rollup snapshots and create an audited monthly variance record for:

- Board trend state.
- Model-cost-per-workflow direction.
- Review-minute and delivery-hour movement.
- Proof-packet coverage.
- Workflow volume.
- Reach expansion signals.
- Competitive advantage tracking.
- Agent improvement actions.

`GET /api/pilot-workspaces/{workspaceSlug}/metric-trends` requires AAL2 governance context, tenant workspace membership, no-store headers, synthetic-only boundary headers, and rate limiting. It returns persisted trend reviews plus a dashboard focused on the latest board trend and next operating actions.

`POST /api/pilot-workspaces/{workspaceSlug}/metric-trends` accepts only two protected rollup snapshot IDs, a bounded trend label, fixed `finance-reviewed-no-phi-board-trend` attestation, `synthetic-business-workflow-only` boundary, fixed model-cost allocation policy, and a bounded no-PHI review note. The guarded Supabase RPC verifies snapshot order and tenant scope, derives variance metrics, persists the review, and commits `protected-metric-trend-review-created` to the append-only audit trail.

`GET /api/pilot-workspaces/{workspaceSlug}/metric-trends/{reviewId}/packet` commits `protected-metric-trend-packet-downloaded` before returning the internal board trend packet. Packet headers retain the no-audited-financial-report, no-securities-offering-material, and not-authorized-live-care authorities.

Safe workaround: if trend review storage or packet export is unavailable, use the protected rollup packet plus an external finance-reviewed variance workbook. Do not use trend output as audited financial reporting, securities offering material, investment advice, accounting advice, tax advice, legal advice, valuation assurance, reimbursement assurance, clinical validation, compliance certification, or live-care authorization.

Current boundary: trend reviews compare aggregate no-PHI operating metadata only. They must not store PHI, patient identifiers, payer member data, source contracts, credentials, secrets, audited financial statements, securities materials, external valuation claims, reimbursement claims, or production clinical approval.

## Protected Board Scorecards

`/pilot-workspace/access` now includes protected Board Scorecards immediately after Metric Trend Reviews. This lets tenant operators convert one to three no-PHI trend reviews into rolling-quarter board scorecards for:

- Scorecard state.
- Rolling-quarter metric summaries.
- Finance-allocation profile readiness.
- Buyer-segment cohort strategy.
- Competitive advantage tracking.
- Agent improvement priorities.
- Strategic operating actions.

`GET /api/pilot-workspaces/{workspaceSlug}/board-scorecards` requires AAL2 governance context, tenant workspace membership, no-store headers, synthetic-only boundary headers, and rate limiting. It returns persisted scorecards plus a dashboard focused on the latest scorecard state, finance allocation readiness, buyer cohorts, and agent priorities.

`POST /api/pilot-workspaces/{workspaceSlug}/board-scorecards` accepts only one to three protected trend review IDs, a bounded board period label, approved buyer-segment focus, fixed `finance-methodology-pending-no-phi-board-scorecard` attestation, `synthetic-business-workflow-only` boundary, fixed `finance-allocation-profile-pending` status, and a bounded no-PHI review note. The guarded Supabase RPC verifies tenant scope, derives rolling-quarter metrics, persists the scorecard, and commits `protected-board-scorecard-created` to the append-only audit trail.

`GET /api/pilot-workspaces/{workspaceSlug}/board-scorecards/{scorecardId}/packet` commits `protected-board-scorecard-packet-downloaded` before returning the internal board scorecard packet. Packet headers retain the no-audited-financial-report and no-securities-offering-material authorities.

Safe workaround: if scorecard storage or packet export is unavailable, use protected trend packets plus external finance-reviewed board materials. Do not use scorecard output as audited financial reporting, securities offering material, investment advice, accounting advice, tax advice, legal advice, valuation assurance, revenue guarantee, reimbursement assurance, clinical validation, compliance certification, advertising claim substantiation, or live-care authorization.

Current boundary: scorecards package aggregate no-PHI operating metadata only. Allocation profiles remain pending until finance approves full methodology. Scorecards must not store PHI, patient identifiers, payer member data, source contracts, credentials, secrets, audited financial statements, securities materials, external valuation claims, reimbursement claims, advertising claim substantiation, or production clinical approval.

## Protected Finance Methodology Gates

`/pilot-workspace/access` now includes protected Finance Methodology Gates immediately after Board Scorecards. This lets tenant operators record no-PHI internal readiness attestations for:

- Finance cost-allocation methodology.
- Counsel external-use review.
- Executive release authority.
- Privacy and security review.
- Clinical governance boundary.
- Marketing claims substantiation.
- Buyer permission and distribution control.

`GET /api/pilot-workspaces/{workspaceSlug}/finance-methodology` requires AAL2 governance context, tenant workspace membership, no-store headers, synthetic-only boundary headers, and rate limiting. It returns the gate workflow, retained records, related board scorecards, external-use status, safe workarounds, and unavailable sections.

`POST /api/pilot-workspaces/{workspaceSlug}/finance-methodology` accepts only an approved gate id, optional protected board scorecard id, fixed `finance-external-use-gates-no-phi-readiness` attestation, `synthetic-business-workflow-only` data boundary, and a bounded no-PHI review note. The guarded Supabase RPC verifies tenant scope, derives the gate metadata server-side, persists the gate record, and commits `protected-finance-methodology-gate-recorded` to the append-only audit trail.

`GET /api/pilot-workspaces/{workspaceSlug}/finance-methodology/packet` commits an enterprise proof-packet audit event before returning the protected finance methodology packet. Packet headers retain `not-audited-financial-methodology`, `external-use-blocked-until-qualified-approval`, `not-audited-financial-report`, `not-securities-offering-material`, `not-advertising-claim-substantiation`, and `not-authorized-live-care` authorities.

Safe workaround: if gate storage or packet export is unavailable, keep board scorecards internal and use qualified external finance, counsel, privacy/security, communications, and customer-specific approval channels. Do not use finance gate output as audited financial reporting, securities offering material, legal approval, advertising claim substantiation, customer permission, reimbursement assurance, clinical validation, compliance certification, or live-care authorization.

Current boundary: finance methodology gates are no-PHI internal readiness attestations only. They must not store PHI, patient identifiers, payer member data, live clinical records, source contracts, credentials, secrets, audited financial statements, securities materials, customer contracts, public claims, or production clinical approval.

## Clinical Activation Dossier

`/pilot-workspace/access` now includes a protected Clinical Activation Dossier. It turns the public Clinical Care Activation Readiness model plus tenant-scoped workspace evidence into:

- Gate ownership across regulatory, clinical governance, privacy/security, identity, interoperability, safety monitoring, legal/commercial, and operations.
- Reviewer assignments for medical director or clinical governance, regulatory counsel, privacy officer, security officer, interoperability architect, legal/commercial owner, and go-live operator.
- Explicit unsigned approval metadata for each activation domain.
- No-PHI evidence references tied to current protected workspace sessions, audit events, demo readiness snapshots, Command Intelligence snapshots, and manual QA packets.
- Required sign-off packet inventory for regulatory classification, clinical safety, PHI readiness, connector validation, reimbursement/legal boundary, and go-live rollback.
- Go-live decision state that remains `blocked-before-clinical-authorization`.
- Rollback controls required before any limited production launch.

The JSON route at `GET /api/pilot-workspaces/{workspaceSlug}/clinical-activation-dossier` requires AAL2 governance context, tenant workspace membership, no-store response headers, synthetic-only boundary headers, and rate limiting.

The Markdown export at `GET /api/pilot-workspaces/{workspaceSlug}/clinical-activation-dossier/packet` commits a protected packet download audit event before release through the existing enterprise proof packet audit path. The export is no-PHI and does not create actual signatures, certify compliance, approve PHI processing, authorize live connectors, validate clinical safety, approve patient outreach, or permit live clinical execution.

## Clinical Activation Approval Workflow

`/pilot-workspace/access` now includes a protected Clinical Activation Approval Workflow immediately after the dossier. It turns the unsigned dossier metadata into an append-only no-PHI attestation ledger for:

- Regulatory classification.
- Clinical governance and safety.
- Privacy, security, and PHI readiness.
- Interoperability and connector validation.
- Legal, commercial, and reimbursement boundary.
- Go-live, rollback, and operations.

`GET /api/pilot-workspaces/{workspaceSlug}/clinical-activation-approvals` requires AAL2 governance context, tenant workspace membership, no-store headers, synthetic-only boundary headers, and rate limiting. It returns the current approval workflow, latest attestation per domain, retained blockers, safe workarounds, and degraded-section disclosure.

`POST /api/pilot-workspaces/{workspaceSlug}/clinical-activation-approvals` records only the selected domain and a fixed `aal2-readiness-attestation-no-phi` value. The server recomputes the evidence snapshot, reviewer role, approval status, retained blockers, no-PHI boundary, and live-care denial before calling the guarded Supabase RPC. The browser cannot send free-form clinical facts, documents, PHI, payer member data, production credentials, legal advice, reimbursement determinations, or live-care authorization.

The database layer stores approvals in `public.clinical_activation_approvals` with select-only RLS for authenticated AAL2 tenant members and an append-only `record_clinical_activation_approval` RPC for tenant-admin, pilot-lead, or reviewer roles. The RPC also commits `clinical-activation-approval-recorded` to the workspace audit trail.

`GET /api/pilot-workspaces/{workspaceSlug}/clinical-activation-approvals/packet` commits a write-before-release audit event through the existing enterprise proof-packet audit path and returns a Markdown approval workflow packet. The packet is legal, clinical, finance, and brand diligence support only. It does not create legal advice, clinical approval, FDA clearance, HIPAA compliance certification, reimbursement determination, PHI authorization, patient outreach permission, production connector authorization, diagnosis, treatment, record mutation, payer submission, autonomous clinical authority, or live clinical execution approval.

## Evidence Room Access Log Reconciliation

Protected workspaces now expose `GET` and `POST /api/pilot-workspaces/{workspaceSlug}/evidence-room-access-log-reconciliation` plus `GET /api/pilot-workspaces/{workspaceSlug}/evidence-room-access-log-reconciliation/packet`.

This workflow sits after evidence-room recipient attestations. It records only bounded no-PHI metadata for externally retained evidence-room access-log references, reconciliation windows, event-count summaries, anomaly posture, and revocation review. It does not store raw access logs, recipient identifiers, recipient emails, exact recipient lists, IP addresses, device identifiers, access grants, signed approvals, legal opinions, customer permission artifacts, public release approval, external distribution approval, compliance certification, production authorization, or clinical execution authority.

The database stores records in `public.protected_evidence_room_access_log_reconciliations` with select-only RLS for authenticated AAL2 tenant members. Writes go through `record_protected_evidence_room_access_log_reconciliation`, require tenant-admin, pilot-lead, or reviewer role, and append `protected-evidence-room-access-log-reconciliation-recorded` audit events. Packet downloads use the existing write-before-release proof-packet audit path.

## Sales Command Center Linkage

Sales Operations now exposes `GET /api/sales-operations/opportunities/{intakeId}/command-center` for tenant-admin AAL2 users. The route links the selected Sales Operations opportunity to its buyer-specific protected workspace when one exists, then derives:

- Commercial readiness score and next buyer action.
- Retained Command Intelligence snapshot count.
- Latest command state, score, timestamp, and score delta.
- Command Intelligence packet export count.
- Buyer-room packet and diligence posture from protected workspace audit events.
- A chronological timeline of opportunity, workspace, command, buyer, governance, and commercial evidence.
- Degraded-section disclosure when the workspace or command evidence is not yet available.

The route is read-only and uses existing opportunity records, protected workspace audit events, and Command Intelligence snapshot records. It does not create storage, accept uploads, expose secrets, or authorize production workflow execution. When a buyer workspace is not provisioned yet, it returns a safe workspace-required posture instead of pretending command evidence exists.

Operators can run `npm run smoke:sales-command-center` as a fail-closed public check with no token. Supplying a fresh short-lived AAL2 tenant-admin token through `SCRIMED_SALES_QA_BEARER_TOKEN` and an explicit `SCRIMED_SALES_QA_INTAKE_ID` runs the read-only authenticated Command Center happy path after the existing sales QA token preflight. This smoke never writes records, stores tokens, or bypasses the protected API's Supabase Auth verification.

## Pilot Deal Room Linkage

`/pilot-deal-room` is the public organization layer that explains how buyers move from SCRIMED's official website and product app into governed intake, Sales Operations, protected Buyer Pilot Room diligence, audited packet release, and paid synthetic pilot.

Sales Operations can generate a protected Pilot Deal Room packet through `GET /api/sales-operations/opportunities/{intakeId}/deal-room-packet`. The route requires tenant-admin AAL2 access, uses the existing private sales artifact RPC, commits `buyer-deal-room-packet-downloaded` before release, and returns a Markdown packet that links the buyer's opportunity scope to the protected Buyer Pilot Room route.

Qualified opportunities can now provision a buyer-specific protected workspace through `POST /api/sales-operations/opportunities/{intakeId}/workspace-provisioning`. The guarded RPC creates a protected workspace slug, private opportunity-to-workspace mapping, manual invitation/onboarding policy, retention schedule, Sales Operations audit event, and workspace audit event. `GET /api/sales-operations/opportunities/{intakeId}/workspace-provisioning/packet` commits `opportunity-workspace-packet-downloaded` before releasing the Markdown provisioning packet.

Provisioned opportunities can now activate tenant-per-buyer lifecycle controls through `POST /api/sales-operations/opportunities/{intakeId}/tenant-lifecycle`. The guarded RPC stores buyer-domain SSO policy, manual invitation delivery rules, access-review cadence, retention/archive controls, activation checklist, competitive edge signals, Sales Operations audit evidence, and workspace audit evidence. `GET /api/sales-operations/opportunities/{intakeId}/tenant-lifecycle/packet` commits `buyer-tenant-lifecycle-packet-downloaded` before releasing the Markdown lifecycle packet.

Lifecycle-activated opportunities can now prepare production SSO and invitation delivery readiness through `POST /api/sales-operations/opportunities/{intakeId}/production-readiness`. The guarded RPC stores buyer-domain verification policy, SSO redirect/origin registry, invitation template approval requirements, transactional delivery controls, access-review attestation automation, archive runbook, launch blockers, Sales Operations audit evidence, and workspace audit evidence. `GET /api/sales-operations/opportunities/{intakeId}/production-readiness/packet` commits `production-readiness-packet-downloaded` before releasing the Markdown readiness packet.

Production-readiness-prepared opportunities can now record customer activation approvals through `POST /api/sales-operations/opportunities/{intakeId}/activation-approvals`. The guarded RPC records SCRIMED written approval for paid pilot setup only, allowed setup actions, retained hard blockers, approval domain status, Sales Operations audit evidence, and workspace audit evidence. `GET /api/sales-operations/opportunities/{intakeId}/activation-approvals/packet` commits `customer-activation-approvals-packet-downloaded` before releasing the Markdown approval packet.

Activation-approved opportunities can now prepare a buyer evidence and signed controls diligence room through `POST /api/sales-operations/opportunities/{intakeId}/buyer-diligence`. The guarded RPC stores metadata-only evidence requirements, buyer domain proof status, IdP metadata readiness, legal/privacy/security controls, BAA/DPA posture, transactional provider decisions, production connector readiness, signed controls, retained blockers, Sales Operations audit evidence, and workspace audit evidence. `GET /api/sales-operations/opportunities/{intakeId}/buyer-diligence/packet` commits `buyer-diligence-packet-downloaded` before releasing the Markdown diligence packet.

Buyer-diligence-prepared opportunities can now prepare secure evidence vault readiness through `POST /api/sales-operations/opportunities/{intakeId}/evidence-vault-readiness`. The guarded RPC stores disabled-by-default storage-provider decisioning, encryption/key management, DLP, malware scanning, retention/legal hold, access reviews, evidence classification, upload approval, incident response, regional residency, target audience, revenue-path controls, Sales Operations audit evidence, and workspace audit evidence. `GET /api/sales-operations/opportunities/{intakeId}/evidence-vault-readiness/packet` commits `secure-evidence-vault-readiness-packet-downloaded` before releasing the Markdown readiness packet.

Sales Operations now exposes an authenticated buyer demo execution path through `GET /api/sales-operations/opportunities/{intakeId}/demo-execution` and a downloadable operator runbook through `GET /api/sales-operations/opportunities/{intakeId}/demo-execution/brief`. These routes coordinate the existing audited packet sequence, buyer room routing, known limits, workarounds, and retained hard gates while durable history is handled by buyer demo sessions. The operator brief is not an audited evidence packet; proposal, deal-room, workspace, lifecycle, production readiness, activation approval, diligence, vault readiness, buyer-room, and enterprise proof packets remain the evidence source of truth.

Sales Operations can now persist buyer demo sessions through `POST /api/sales-operations/opportunities/{intakeId}/demo-sessions` and retrieve them through `GET /api/sales-operations/opportunities/{intakeId}/demo-sessions`. Session recording stores no-PHI operator notes, buyer questions, blockers, workarounds, next actions, follow-up plan, current path snapshot, selected demo steps, and selected packet routes in private storage with deny-all direct RLS. `GET /api/sales-operations/opportunities/{intakeId}/demo-sessions/{sessionId}/packet` commits `sales-demo-session-packet-downloaded` before releasing an audited Markdown packet.

Sales Operations now includes an AAL2 buyer-demo session QA harness at `GET` and `POST /api/sales-operations/qa/buyer-demo-sessions`. The harness targets the selected opportunity or an explicit short-lived-token smoke target, records a synthetic buyer-demo session through the same guarded RPC as operator demos, and immediately verifies the audited packet path through the existing packet RPC.

Sales Demo Session QA and the read-only Sales Command Center smoke now use the short-lived operator-token runbook at `docs/operator-token-rotation.md`, the local preflight script, and the manual-only GitHub Actions policy. Tokenized smoke must pass AAL2, `session_id`, expiry, minted-lifetime, and explicit `SCRIMED_SALES_QA_INTAKE_ID` checks before any authenticated request is sent.

Current boundary: buyer-specific workspaces, lifecycle controls, production readiness packets, activation approval packets, buyer diligence rooms, secure evidence vault readiness records, persisted buyer demo sessions, and the buyer-demo QA harness are logical tenant-per-buyer evaluation controls inside the activated SCRIMED pilot tenant. This resolves the paid-pilot setup, enterprise diligence, sensitive-document storage planning, buyer-demo follow-up, and authenticated happy-path QA process gap without creating live customer infrastructure, upload URLs, object buckets, long-lived test credentials, or a sensitive-document repository prematurely. The production gate is signed customer tenant architecture, production SSO configuration, approved transactional email delivery, retention deletion policy, legal/privacy/security review, clinical governance review, BAA/DPA path where applicable, secure evidence storage controls, live connector authorization, and the first manually approved short-lived-token CI run.

## Active Public Controls

- `POST /api/pilot/intake` is rate limited to five requests per ten-minute request fingerprint.
- Protected session creation is rate limited to twenty requests per ten-minute request fingerprint.
- Upstash Redis provides distributed enforcement through direct Upstash or Vercel Marketplace credentials.
- The bounded memory fallback reduces abuse on a single runtime instance during a distributed-provider outage.

## First Tenant Activation

- Tenant: `scrimed-solutions`
- Tenant-admin identity: `scrimedsolutions@gmail.com`
- Workspace: `scrimed-atlas-protected-pilot`
- First durable synthetic evaluation and audited proof-packet download: completed on 2026-06-10
- Cross-tenant RLS verification: passed
- Anonymous workspace access: denied
- Direct authenticated insert, update, and audit-delete privileges: denied

## Proof Packet Contents

Proof packets include the tenant and workspace, scenario, workflow target, Trust Card, evidence source attribution, validation timestamps, human approval checkpoints, denied capabilities, outcome signals, measurement boundary, and retained synthetic-only product boundary.
