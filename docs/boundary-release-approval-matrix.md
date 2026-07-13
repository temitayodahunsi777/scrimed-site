# SCRIMED Boundary Release Approval Matrix

SCRIMED Boundary Release Approval Matrix documents the approval path for preserved NO-GO boundaries. It does not grant PHI authority, clinical authority, payer submission authority, EHR writeback authority, production connector approval, certification claims, or customer go-live approval.

## Routes

- UI: `/boundary-release-approvals`
- JSON: `/api/boundary-release-approvals`
- Brief: `/api/boundary-release-approvals/brief`

## Approval Paths Tracked

- Live PHI / ePHI processing
- Clinical decision support
- Autonomous diagnosis, treatment, prescribing, or imaging interpretation
- EHR writeback and production connector activation
- Payer submission, prior authorization, claims, and appeals
- Clinical research, outcomes learning, and human-subject data
- SOC 2, HIPAA, HITRUST, ISO, FDA, ONC, and certification claims
- Global operation, data residency, GDPR, EHDS, and EU AI Act readiness
- Customer go-live and production release

## Completion Semantics

The matrix completes the documentation step: every preserved boundary has required evidence, owners, proof routes, signoff lanes, safe workaround, release hash, and blocking condition.

The matrix does not complete the real-world approval step. External approvals remain pending until qualified legal, clinical, privacy, security, regulatory, payer, customer, auditor, or certification authorities provide retained evidence.

## Fail-Closed Rule

Every boundary remains `blocked-fail-closed` until:

- every required approval step has satisfied release evidence;
- every required signoff is approved;
- the evidence packet is retained outside public source code;
- a named human release decision is created;
- customer scope is explicit where customer systems, PHI, production connectors, payer submission, EHR writeback, or go-live are involved.

## Evidence Work Queue

The matrix derives an evidence work queue from every unsatisfied approval step and pending signoff. Each work item includes:

- boundary ID and boundary name;
- evidence name;
- owner;
- priority;
- status;
- proof routes;
- missing-evidence reason;
- redaction rule;
- work item hash.

Evidence work items are metadata-only. They do not accept raw evidence, PHI, credentials, raw contracts, raw clinical records, bearer tokens, or raw connector payloads. Sensitive documents must remain in an external evidence room, legal repository, customer system, auditor portal, or protected tenant workspace with the right access controls.

## Protected Boundary Release Evidence Intake

SCRIMED now has a protected metadata-only intake surface for converting evidence work queue items into tenant-scoped external approval evidence references:

- `GET /api/pilot-workspaces/{workspaceSlug}/boundary-release-evidence-intake`
- `POST /api/pilot-workspaces/{workspaceSlug}/boundary-release-evidence-intake`
- `GET /api/pilot-workspaces/{workspaceSlug}/boundary-release-evidence-intake/packet`

This route requires the existing protected pilot workspace identity path: Supabase-authenticated membership, AAL2 governance session, tenant isolation through RLS, and role-gated persistence through the existing external approval evidence RPC. The intake accepts only work item ID, work item hash, external system, non-secret locator, owner, human review status, no-PHI attestation, and review note metadata.

It does not store raw evidence, PHI, patient identifiers, payer member data, source contracts, credentials, bearer tokens, signed BAAs/DPAs, legal opinions, raw clinical records, raw connector payloads, or approval artifacts. It does not relieve preserved boundaries, approve customer go-live, authorize live PHI, authorize clinical action, approve payer submission, approve EHR writeback, approve production connectors, or create certification claims.

The packet endpoint returns an AAL2-gated, audit-recorded markdown packet with the current work queue, linked external reference metadata, unavailable sections, and hard-stop authorities. The packet is a diligence artifact only; it is not a release approval, legal opinion, signed agreement, clinical validation, compliance certification, production connector approval, or customer go-live approval.

Use `npm run smoke:boundary-release-evidence-intake:authenticated` to verify unauthenticated fail-closed behavior and, when `SCRIMED_BEARER_TOKEN` contains a fresh tenant-admin, pilot-lead, or reviewer AAL2 token, the protected metadata-reference happy path. Use `npm run smoke:boundary-release-evidence-intake:strict` only for a deliberate token-bound QA run; it fails closed if no valid short-lived AAL2 token is present.

## Current Safe Mode

SCRIMED may continue operating as synthetic, metadata-only, no-PHI, human-reviewed readiness material. This supports buyer diligence, clinical readiness planning, audit preparation, architecture review, and no-PHI pilots without crossing production clinical, privacy, payer, EHR, certification, or customer go-live boundaries.

## Preserved NO-GO Claims

- live PHI approved
- autonomous clinical care approved
- diagnosis approved
- treatment or prescribing approved
- imaging interpretation approved
- EHR writeback approved
- payer submission approved
- production connector approved
- certification claim approved
- customer go-live approved

## Operator Use

Use the matrix before expanding any blocked SCRIMED capability. If a requested release path is missing evidence or signoff, keep the workflow in synthetic/no-PHI mode and route the request to the named owner. Do not treat readiness documentation as legal, regulatory, clinical, security, payer, EHR, or customer approval.
