# SCRIMED Agent Governance Control Plane

SCRIMED Agent Governance is a synthetic-only control plane for agent identity, contextual policy, session-state tracking, dynamic risk scoring, and human approval routing.

## Scope

- Contextual policy engine
- Session-state tracking
- Agent identity registry
- PHI-access flag
- Confidential-document flag
- Untrusted-content flag
- External-action flag
- Cost-threshold flag
- Human-approval requirement
- Allow / deny / require-review decision object

## Safety Boundary

No live PHI, autonomous clinical care, diagnosis, treatment, prescribing, EHR writeback, payer submission, production deploy claim, certification claim, or customer go-live claim is authorized.

## Routes

- `/scrimed-agent-governance`
- `/api/scrimed-agent-governance`
- `/api/scrimed-agent-governance/brief`
