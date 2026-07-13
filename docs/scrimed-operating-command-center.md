# SCRIMED Operating Command Center

Status: `scrimed-operating-command-center-ready-no-phi`

Routes:
- `/scrimed-operating-command`
- `/api/scrimed-operating-command`
- `/api/scrimed-operating-command/brief`

Attached operating surfaces:
- `/product`
- `/api/product/console`
- `/hub`
- `/api/hub/summary`

## Purpose

SCRIMED Operating Command Center converts the platform roadmap into a governed execution surface for systems, agents, infrastructure, workflows, services, products, UI, and interfaces.

It is intentionally metadata-only. It ranks work, assigns owners, lists proof routes, defines KPIs, preserves gates, and explains blocked actions. It does not execute production workflows.

Product Console and Hub now surface command-lane counts, P0 lanes, review-gated lane counts, top next safe actions, and links to the command center brief.

## Evidence Packets

Every operating lane now receives a deterministic evidence packet. Packets include:
- packet id
- lane id
- release stage
- evidence state
- required evidence
- missing evidence
- AAL2 requirement
- boundary-release requirement
- protected-operator requirement
- safe output statement
- blocked escalations
- next review action
- deterministic packet hash

Evidence packets are read-only planning artifacts. They help operators prepare weekly review, release-candidate review, and protected operator handoff. They do not mutate records, submit claims, contact patients, approve connectors, authorize live PHI, or approve customer go-live.

## Safety Boundary

The command center does not authorize live PHI, autonomous diagnosis, treatment, prescribing, patient outreach, payer submission, billing submission, EHR writeback, production connector approval, certification claims, clinical validation claims, or customer go-live.

## Operating Lanes

Current lanes cover:
- agent runtime context binding
- governed workflow release train
- infrastructure reliability control loop
- product and UI command surface
- product/service packaging loop
- interoperability safety adapters
- MLOps evaluation feedback loop
- governance and revenue approval stack

Every lane includes:
- domain
- priority
- owner
- current capability
- next safe action
- agent, workflow, infrastructure, and interface impact
- required gates
- proof routes
- API routes
- blocked actions
- safe automation mode
- human-review requirement
- measurable KPIs

## Operating Cadence

The command center defines daily, weekly, release-candidate, and quarterly review loops. Each cadence has an owner, review question, required evidence, and fail-closed trigger.

## Governance Rules

- Keep all work synthetic/no-PHI unless a future approval path explicitly unlocks protected evidence handling.
- Treat automation as read-only, recommendation-only, review-queue-only, or protected-operator-run-required.
- Do not treat passing local tests as a production deploy, security certification, clinical validation, or customer go-live approval.
- Keep claims tied to proof routes and blocked wording.
- Require human review for high-risk clinical, payer, connector, revenue, and approval-adjacent work.
- Treat protected evidence packets as blocked until a fresh AAL2 operator run and any required boundary-release approval are available.

## Next Build Step

Use the evidence packets to drive weekly operating review, then add protected operator persistence only after AAL2 and boundary-release gates are satisfied.
