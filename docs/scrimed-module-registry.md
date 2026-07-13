# SCRIMED Module Registry

Updated: 2026-06-30

Routes:
- `/scrimed-modules`
- `/api/scrimed-modules`
- `/api/scrimed-modules/brief`

## Current Scope

GO for no-PHI module architecture, synthetic demos, internal planning, benchmark design, diligence packets, and protected-pilot preparation.

NO-GO for live PHI, autonomous clinical action, patient outreach, payer submission, EHR writeback, production connector use, certification claims, clinical validation claims, or customer go-live.

This registry does not authorize PHI, autonomous diagnosis, treatment, prescribing, outreach, payer submission, EHR writeback, production connector activation, certification claims, clinical validation claims, reimbursement claims, or customer go-live.

## Modules Added

- SCRIMED ClinicalBench
- SCRIMED Scientific Reasoning Engine
- SCRIMED Workflow Planner
- SCRIMED Clinical Judgment Engine
- SCRIMED Evidence Graph
- SCRIMED ResearchOps
- SCRIMED LongTask Runtime
- SCRIMED Clinical Work Graph
- SCRIMED Trust Score
- SCRIMED Continuous Evaluation Platform
- SCRIMED Outcome Intelligence
- SCRIMED Knowledge Evolution Engine
- SCRIMED Multi-Agent Runtime
- SCRIMED Multi-Model Router
- SCRIMED Adaptive Workflow Selector
- SCRIMED Clinical Memory
- SCRIMED Research Memory
- SCRIMED Physician Preference Memory
- SCRIMED Benchmark Studio

## Required Safety Controls

Every module inherits these controls:
- No-PHI synthetic fixtures only.
- Human review required for protected clinical workflows.
- Evidence and source attribution required.
- Confidence, limitation, and escalation criteria required.
- Audit event required for every module output.
- No direct LLM-to-database access.
- No autonomous system-of-record mutation.

## First Implementation Priority

Promote SCRIMED ClinicalBench, Trust Score, Benchmark Studio, and Continuous Evaluation Platform first so every new module has measurable safety and readiness evidence before workflow execution expands.
