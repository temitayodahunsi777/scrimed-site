# SCRIMED Systems Map

Updated: 2026-06-24

This map organizes SCRIMED's current build into operating lanes. It is the first place to check before adding a new route, agent, proof packet, or buyer-facing claim.

## Public Operations Lane

Purpose: explain SCRIMED as healthcare operations intelligence, governed synthetic pilots, buyer diligence, workflow evidence, and readiness coordination.

Primary surfaces:

- `/product`
- `/navigation`
- `/service-reliability`
- `/capital-vitality`
- `/growth-engine`
- `/release-continuity`
- `/buyer-release-control-run`
- `/qa-evidence`
- `/boundary-resolution`
- `/public-market-readiness`
- `/clinical-authority-readiness`
- `/trust-center`
- `/claims`

Rules:

- Public copy can describe workflow intelligence, evidence organization, synthetic evaluation, audit readiness, and buyer diligence.
- Public copy must not claim diagnosis, treatment recommendation, live clinical care authority, PHI processing authority, HIPAA/SOC/FDA certification, reimbursement certainty, or production connector approval.
- Public APIs must fail closed for tenant-scoped proof, packet, or approval surfaces.

## Commercial Growth Engine Lane

Purpose: keep buyer segments, sellable offers, revenue motions, conversion lanes, revenue proof steps, bottlenecks, owners, and proof routes in one execution map.

Primary surfaces:

- `/growth-engine`
- `/api/growth-engine`
- `/api/growth-engine/brief`
- `/product`
- `/hub`
- `/capital-vitality`
- `/pilot-deal-room`
- `/pricing`
- `/pilot`

Rules:

- Growth Engine can expose prioritized plays, buyer triggers, conversion events, disqualifiers, proof ladders, bottlenecks, owners, and next actions.
- It must not claim customer revenue guarantees, investment advice, securities offering material, audited financial reporting, valuation assurance, legal advice, tax advice, reimbursement assurance, procurement approval, customer permission, security certification, regulatory approval, PHI authority, production connector authority, or live clinical authority.
- Buyer-specific proof, fundraising materials, valuation claims, customer references, and regulated authority claims require retained external review before use.

## Capital Vitality Lane

Purpose: keep revenue capabilities, competitive moat evidence, investor-readiness milestones, funding workstreams, proof routes, and retained external-review gates in one governed growth map.

Primary surfaces:

- `/capital-vitality`
- `/api/capital-vitality`
- `/api/capital-vitality/brief`
- `/product`
- `/hub`
- `/public-market-readiness`
- `/pricing`
- `/pilot-deal-room`

Rules:

- Capital Vitality can expose packaged revenue paths, moat evidence, investor diligence milestones, funding workstreams, and proof routes.
- It must not claim investment advice, securities offering material, audited financial reporting, valuation assurance, legal advice, tax advice, reimbursement assurance, customer revenue guarantee, security certification, regulatory approval, PHI authority, production connector authority, or live clinical authority.
- Funding, valuation, securities, legal, tax, audited-financial, and investor-solicitation materials require qualified external review before use.

## Service Reliability Lane

Purpose: keep product/service controls, known fault classes, efficiency improvements, owners, proof routes, and retained approval boundaries in one hardening map.

Primary surfaces:

- `/service-reliability`
- `/api/service-reliability`
- `/api/service-reliability/brief`
- `/product`
- `/hub`
- `/navigation`
- `/release-continuity`

Rules:

- Service Reliability can expose barriers, mitigations, owners, proof routes, source alignment, open gates, and fault classes.
- It must not claim release approval, legal approval, HIPAA/SOC/FDA/ONC/security certification, PHI authority, public customer proof, reimbursement assurance, production connector approval, or live clinical care authority.
- Newly discovered faults or bottlenecks should be added here before buyer language or public release claims expand.

## Navigation Audit Lane

Purpose: keep the page route inventory, API route pattern count, navigation groups, smoke coverage, protected fail-closed checks, and retained AAL2 or external-review bottlenecks in one operating map.

Primary surfaces:

- `/navigation`
- `/api/navigation-audit`
- `/api/navigation-audit/brief`
- `/product`
- `/hub`
- `/release-continuity`

Rules:

- Navigation Audit can expose route groups, source counts, smoke scope, protected fail-closed posture, and known bottlenecks.
- It must not claim that every protected happy path has executed, bypass AAL2, store token values, store PHI, approve release, certify compliance, approve production connectors, or authorize live clinical care.
- Add new buyer-critical routes to the relevant navigation group and public smoke coverage before treating them as externally ready.

## Release Continuity Lane

Purpose: keep production deployment proof, source-control checkpoints, public smoke, protected fail-closed checks, and human AAL2 operator proof aligned after each release.

Primary surfaces:

- `/release-continuity`
- `/api/release-continuity`
- `/api/release-continuity/brief`
- `/product`
- `/pilot-workspace/access`
- `/buyer-release-control-run`

Rules:

- Release continuity can expose routes, commit/tag baselines, smoke status, gate counts, and operator workarounds.
- It must never expose bearer token values, long-lived secrets, CI credentials, PHI, signed approvals, raw audit logs, or sensitive customer artifacts.
- It cannot approve release, bypass AAL2, certify compliance, authorize PHI processing, grant legal approval, approve production connectors, guarantee reimbursement, or authorize live clinical care.
- Protected happy-path evidence must use the active browser AAL2 session or a deliberate short-lived operator token that is disposed of immediately after no-secret evidence is recorded.

## Protected Buyer Release Lane

Purpose: verify buyer-specific release readiness through AAL2-authenticated, no-PHI metadata checks.

Primary surfaces:

- `/pilot-workspace/access#buyer-release-control-verifier`
- `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run`
- `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/packet`
- `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/timeline`
- `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/reconciliation`
- `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/remediation`
- `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/metadata-drafts`
- `/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run/metadata-drafts/checklist`

Rules:

- Protected verifier reads may use the active browser session.
- Durable packet evidence must remain no-PHI and append-only audited.
- Release-control records can show readiness, blocked gates, next actions, and metadata templates.
- They cannot approve public sharing, create customer permission, store signed artifacts, store recipient lists, store raw logs, or bypass qualified human review.

## QA Evidence Lane

Purpose: turn human AAL2 synthetic QA runs into buyer-safe, no-secret evidence.

Primary surfaces:

- `/qa-run-control`
- `/qa-human-run-packet`
- `/qa-manual-execution-console`
- `/qa-aal2-run-evidence`
- `/qa-buyer-proof-release`
- `/api/qa-evidence/*`
- `/api/pilot-workspaces/{workspaceSlug}/qa-evidence/*`

Rules:

- QA evidence may reference workflow IDs, packet hashes, synthetic targets, audit event IDs, and no-secret attestations.
- QA evidence cannot store bearer tokens, credentials, PHI, live patient data, or production-system details.
- Buyer-proof language stays blocked until retained protected evidence is visible and human review is complete.

## Clinical Authority Lane

Purpose: prepare external authority evidence and owner routing before any future regulated or live-care posture.

Primary surfaces:

- `/clinical-authority-readiness`
- `/pilot-workspace/access#clinical-authority-evidence-room`
- `/pilot-workspace/access#clinical-authority-owner-matrix`
- `/pilot-workspace/access#clinical-authority-artifact-intake`
- `/pilot-workspace/access#authority-artifact-references`

Rules:

- This lane tracks readiness only.
- It does not store sensitive artifacts, signed approvals, legal opinions, privacy opinions, security reports, PHI, or production credentials.
- External counsel, qualified reviewers, buyer approvals, and applicable regulatory pathways remain outside the product until formally retained.

## Approvals Readiness Lane

Purpose: organize the operating path toward public claims control, HIPAA/BAA readiness, SOC 2/HITRUST assurance, FDA/CDS/SaMD classification, ONC/interoperability acceptance, state care-delivery review, and buyer-specific release gates.

Primary surfaces:

- `/approvals-readiness`
- `/api/approvals-readiness`
- `/api/approvals-readiness/brief`
- `/claims`
- `/boundary-resolution`
- `/clinical-authority-readiness`
- `/buyer-release-control-run`

Rules:

- Approvals Readiness can say what evidence is needed, who owns it, what workaround is safe, and what remains blocked.
- It cannot claim legal approval, HIPAA certification, SOC 2 certification, HITRUST certification, FDA clearance, ONC certification, reimbursement certainty, PHI authority, production connector approval, or live clinical authority.
- Approval-aware agents may classify, route, draft, and reconcile evidence; named humans and external reviewers retain authority.

## Agent And Workflow Lane

Purpose: keep agent execution synthetic, governed, audited, and human-reviewed.

Primary surfaces:

- `/agents`
- `/agent-workspace`
- `/workflows`
- `/evaluation`
- `/trust-os`
- `/memory`
- `/audit`
- `/observability`

Rules:

- Agent tasks remain synthetic or enterprise-assessment scoped.
- Agents cannot mutate medical records, submit payer actions, contact patients, provide autonomous diagnosis or treatment guidance, or execute production connectors.
- New agent capabilities should define blocked actions, human checkpoints, audit events, and packet evidence before UI exposure.

## Cleanup And Quality Lane

Purpose: keep the working tree inspectable and prevent generated artifacts from corrupting checks.

Commands:

- `node scripts/clean-generated-cache.mjs`
- `node scripts/check-generated-integrity.mjs`
- `node node_modules/typescript/bin/tsc --noEmit`
- `node node_modules/eslint/bin/eslint.js .`
- `node scripts/public-production-smoke.mjs`

Rules:

- `.next`, `.next-quarantine-*`, `node_modules`, `.tools`, `.vercel`, and `*.tsbuildinfo` are disposable local/generated state.
- Generated artifact cleanup must not delete source routes, docs, migrations, or scripts.
- Typecheck, lint, and public smoke should pass before deployment or buyer-demo handoff.
