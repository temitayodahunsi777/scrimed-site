# SCRIMED Most Recent Upgrade Implementation Plan

Canonical file: `SCRIMED_UPGRADE_IMPLEMENTATION_PLAN.md`

## Objective

Implement the newest SCRIMED architecture upgrades around secure agent runtime, clinical AI governance, DevSecOps, observability, multi-model routing, knowledge compounding, and healthcare workflow automation.

## Safety Boundary

This plan is synthetic/no-PHI architecture work. It does not authorize live PHI access, autonomous diagnosis, treatment, prescribing, patient outreach, payer submission, billing submission, EHR writeback, production connector use, production deployment, certification claims, clinical validation claims, or customer go-live.

## Upgrade Domains

1. Secure Agent Runtime
2. Contextual Policy Engine
3. Observability Layer
4. Clinical Evaluation Harness
5. Multi-Model Router
6. Knowledge Operating System
7. Healthcare Workflow Automation
8. DevSecOps / CI-CD
9. Local-First / Edge AI
10. Strategic Product Direction

## Current Implementation

The plan is implemented as a typed SCRIMED control-plane module:

- `app/lib/scrimedUpgradeImplementationPlan.ts`
- `/api/scrimed-upgrade-implementation-plan`
- `/api/scrimed-upgrade-implementation-plan/brief`
- `/scrimed-upgrade-implementation-plan`
- `docs/scrimed-upgrade-implementation-plan.md`
- `scripts/scrimed-upgrade-implementation-plan-contract-check.mjs`

## Next Build Step

Implement a metadata-only contextual policy preview API that accepts session-state facts and returns fail-closed policy decisions without executing tools.
