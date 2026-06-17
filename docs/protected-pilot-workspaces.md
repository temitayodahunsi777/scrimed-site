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
8. Run Supabase security and performance advisors. Database security findings are clear; passkeys are enabled for phishing-resistant sign-in, and leaked-password protection is only required if password sign-in remains enabled for any project-level flow.
9. Verify tenant-crossing requests fail, audit rows cannot be updated or deleted, and proof packet downloads create audit events. Completed transactionally and through the authenticated production workspace on 2026-06-10.

## Protected Routes

- `GET /api/pilot-workspaces`
- `/pilot-workspace/access`
- `/pilot-deal-room`
- `GET /api/pilot-deal-room`
- `GET /api/sales-operations/opportunities/{intakeId}/deal-room-packet`
- `GET /api/pilot-workspaces/{workspaceSlug}/sessions`
- `POST /api/pilot-workspaces/{workspaceSlug}/sessions`
- `GET /api/pilot-workspaces/{workspaceSlug}/audit`
- `GET /api/pilot-workspaces/{workspaceSlug}/sessions/{sessionId}/proof-packet`
- `GET /api/pilot-workspaces/{workspaceSlug}/demo-readiness`
- `POST /api/pilot-workspaces/{workspaceSlug}/demo-readiness`
- `GET /api/pilot-workspaces/{workspaceSlug}/demo-readiness/{snapshotId}/packet`
- `GET /api/pilot-workspaces/{workspaceSlug}/buyer-room`
- `GET /api/pilot-workspaces/{workspaceSlug}/buyer-room/packet`
- `GET /api/pilot-workspaces/{workspaceSlug}/enterprise-proof-packet`

Protected routes fail closed with `503` until identity and durable storage are configured. They require a verified bearer token after activation.

`GET /api/pilot-workspaces/readiness` verifies the deployed runtime against the migrated Supabase schema and Upstash Redis. Environment-variable presence alone does not mark production activation as verified.

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
- Audited Markdown Buyer Pilot Room Packet export.

The JSON room route at `GET /api/pilot-workspaces/{workspaceSlug}/buyer-room` requires tenant membership and fresh AAL2 governance context. The packet route at `GET /api/pilot-workspaces/{workspaceSlug}/buyer-room/packet` commits `buyer-pilot-room-packet-downloaded` before releasing the Markdown artifact.

This closes the evidence-fragmentation gap for serious buyers: SCRIMED can now show product proof, commercial path, limitations, and competitive edge in one tenant-scoped room without weakening the synthetic-only boundary.

## Pilot Deal Room Linkage

`/pilot-deal-room` is the public organization layer that explains how buyers move from SCRIMED's official website and product app into governed intake, Sales Operations, protected Buyer Pilot Room diligence, audited packet release, and paid synthetic pilot.

Sales Operations can generate a protected Pilot Deal Room packet through `GET /api/sales-operations/opportunities/{intakeId}/deal-room-packet`. The route requires tenant-admin AAL2 access, uses the existing private sales artifact RPC, commits `buyer-deal-room-packet-downloaded` before release, and returns a Markdown packet that links the buyer's opportunity scope to the protected Buyer Pilot Room route.

Qualified opportunities can now provision a buyer-specific protected workspace through `POST /api/sales-operations/opportunities/{intakeId}/workspace-provisioning`. The guarded RPC creates a protected workspace slug, private opportunity-to-workspace mapping, manual invitation/onboarding policy, retention schedule, Sales Operations audit event, and workspace audit event. `GET /api/sales-operations/opportunities/{intakeId}/workspace-provisioning/packet` commits `opportunity-workspace-packet-downloaded` before releasing the Markdown provisioning packet.

Provisioned opportunities can now activate tenant-per-buyer lifecycle controls through `POST /api/sales-operations/opportunities/{intakeId}/tenant-lifecycle`. The guarded RPC stores buyer-domain SSO policy, manual invitation delivery rules, access-review cadence, retention/archive controls, activation checklist, competitive edge signals, Sales Operations audit evidence, and workspace audit evidence. `GET /api/sales-operations/opportunities/{intakeId}/tenant-lifecycle/packet` commits `buyer-tenant-lifecycle-packet-downloaded` before releasing the Markdown lifecycle packet.

Lifecycle-activated opportunities can now prepare production SSO and invitation delivery readiness through `POST /api/sales-operations/opportunities/{intakeId}/production-readiness`. The guarded RPC stores buyer-domain verification policy, SSO redirect/origin registry, invitation template approval requirements, transactional delivery controls, access-review attestation automation, archive runbook, launch blockers, Sales Operations audit evidence, and workspace audit evidence. `GET /api/sales-operations/opportunities/{intakeId}/production-readiness/packet` commits `production-readiness-packet-downloaded` before releasing the Markdown readiness packet.

Production-readiness-prepared opportunities can now record customer activation approvals through `POST /api/sales-operations/opportunities/{intakeId}/activation-approvals`. The guarded RPC records SCRIMED written approval for paid pilot setup only, allowed setup actions, retained hard blockers, approval domain status, Sales Operations audit evidence, and workspace audit evidence. `GET /api/sales-operations/opportunities/{intakeId}/activation-approvals/packet` commits `customer-activation-approvals-packet-downloaded` before releasing the Markdown approval packet.

Current boundary: buyer-specific workspaces, lifecycle controls, production readiness packets, and activation approval packets are logical tenant-per-buyer evaluation controls inside the activated SCRIMED pilot tenant. This resolves the paid-pilot setup approval process gap without creating live customer infrastructure prematurely. The production gate is signed customer tenant architecture, production SSO configuration, approved transactional email delivery, retention deletion policy, legal/privacy/security review, clinical governance review, BAA/DPA path where applicable, and live connector authorization.

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
