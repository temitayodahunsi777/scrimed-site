# SCRIMED Command Intelligence Hub

Updated: 2026-06-18

## Purpose

The SCRIMED Command Intelligence Hub is the protected operator surface that turns existing pilot evidence into an enterprise command posture. It unifies:

- Agent Commander orchestration posture.
- Buyer Pilot Room readiness.
- Trust Engine outputs.
- Continuous evaluation gates.
- MCP and tool-access plans.
- Operator Safe Mode boundaries.
- Observability signals and export history.
- Next recommended operator actions.

The hub is exposed inside `/pilot-workspace/access` and through `GET /api/pilot-workspaces/{workspaceSlug}/command-intelligence`.

## Boundary

The hub is a protected synthetic-pilot command posture. It does not accept PHI, payer member data, medical records, imaging, production credentials, source contracts, or live clinical data. It does not certify HIPAA/SOC/FDA compliance, guarantee reimbursement, approve production connectors, submit payer transactions, contact patients, or authorize autonomous diagnosis, treatment, or live healthcare execution.

## Current Implementation

- `app/lib/commandIntelligenceHub.ts` derives a typed command summary from tenant workspace records, AgentOS contracts, Buyer Pilot Room posture, demo readiness snapshots, manual QA evidence packets, and append-only audit events.
- `/api/pilot-workspaces/{workspaceSlug}/command-intelligence` requires AAL2 governance context, workspace membership, no-store response headers, synthetic-only data boundary headers, and read rate limiting.
- `/pilot-workspace/access` renders the hub after Pilot Demo Readiness and before Buyer Pilot Room export so operators review command posture before sending buyer diligence.
- `/api/product/console` exposes `proofStack.commandIntelligenceHub = aal2-command-intelligence-hub`.
- `scripts/public-production-smoke.mjs` verifies the product proof-stack status and protected fail-closed behavior.

## Operator Verification

1. Sign in to `/pilot-workspace/access` with an approved tenant identity.
2. Reach AAL2 assurance through the authenticator gate.
3. Confirm the Command Intelligence Hub appears after the Demo Readiness Command Center.
4. Review command score, Agent Commander posture, workstreams, Trust Engine outputs, evaluation gates, MCP/tool plans, safe-mode controls, and next actions.
5. Download the Buyer Diligence Export only after reviewing boundaries and known limitations.
6. Run public smoke after release:

```bash
SCRIMED_BASE_URL=https://app.scrimedsolutions.com SCRIMED_WORKSPACE_SLUG=atlas-synthetic-evaluation node scripts/public-production-smoke.mjs
```

## Pattern Sources Applied

- Databricks/MLflow agent evaluation patterns: evaluation sets, human feedback, cost/latency, quality, and production monitoring.
- OpenAI Agents SDK patterns: traces for agent runs, tool calls, handoffs, guardrails, and MCP approval policies.
- Google Cloud Gemini Enterprise Agent Platform patterns: runtime, memory/context, continuous quality improvement, sandbox execution, governance, and observability.
- MCP specification patterns: tool/context standardization and explicit tool boundaries.

These patterns are implemented as SCRIMED-safe scaffolding only. The current hub does not connect live tools or claim external benchmark performance.

## Known Limits And Workarounds

- Limitation: No live EHR, payer, imaging, device, or research connector is authorized.
  Workaround: Use synthetic fixtures, conformance contracts, MCP/tool-access plans, and customer-specific connector design packets.

- Limitation: Continuous evaluation is not a clinical benchmark or regulatory validation.
  Workaround: Use workflow evidence, smoke checks, manual QA packets, reviewer dispositions, and future evaluation sets.

- Limitation: Runtime monitoring is operator-run evidence, not a staffed managed SOC/MDR service.
  Workaround: Pair release smoke, Vercel runtime log review, TrustOps incidents, and audit-event review during pilots.

- Limitation: Buyer diligence exports are not legal, security, compliance, clinical, or reimbursement certifications.
  Workaround: Keep explicit blocked claims, production gates, and qualified external review requirements in every export.

## Next Build Step

Persist Command Intelligence snapshots after AAL2 operator review. The snapshot should be audit-backed, downloadable, and tied to a buyer opportunity or protected workspace so SCRIMED can show command-posture history over time without storing PHI or secrets.
