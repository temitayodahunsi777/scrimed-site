# SCRIMED Clinical Robustness Lab

SCRIMED Clinical Robustness Lab exposes a no-PHI adversarial clinical readiness layer at `/clinical-robustness-lab`, `/api/clinical-robustness-lab`, and `/api/clinical-robustness-lab/brief`.

Use notice: Research/demo use only. Not for diagnosis, treatment, prescribing, or live patient care.

## System Architecture

- Domain source: `app/lib/clinicalRobustnessLab.ts`
- Public UI: `app/clinical-robustness-lab/page.tsx`
- JSON API: `app/api/clinical-robustness-lab/route.ts`
- Markdown brief: `app/api/clinical-robustness-lab/brief/route.ts`
- Contract test: `scripts/clinical-robustness-lab-contract-check.mjs`

## Module Boundaries

- The lab stores no PHI, credentials, customer payloads, production records, or live clinical context.
- The lab defines products, perturbations, adversarial scenarios, scorecards, reviewer queues, and hard stops.
- The lab does not execute a model call, contact a patient, mutate an EHR, submit a claim, or authorize a connector.

## Interfaces

- `/clinical-robustness-lab` renders buyer, reviewer, and engineering-visible clinical robustness coverage.
- `/api/clinical-robustness-lab` returns typed readiness metadata, scorecards, product coverage, and safety boundaries.
- `/api/clinical-robustness-lab/brief` returns a downloadable markdown brief for diligence and internal review.

## Data Models

The domain model tracks:

- Products: Sanar AI, Clinical Copilot, DocuTwin, Ambient Scribe, CareExplain, Perfect Chart, TrialCore, and OncoID.
- Perturbations: missing data, missing labs risk, missing imaging risk, note-only blind spots, conflicting data, abbreviations, noisy notes, wrong units, multilingual notes, incomplete records, temporal inconsistencies, hallucination risk, citation/reference quality, guideline grounding, demographic bias risk, data freshness, model disagreement, and human-review requirements.
- Scenarios: synthetic adversarial cases with expected safe behavior, failure modes, evidence requirements, reviewer queues, passing signals, and hard stops.
- Scorecards: deterministic readiness checks that output clinical readiness scores, not generic benchmark scores.

## Threat Model

The lab is designed to prevent:

- PHI or live patient data entering test fixtures.
- Autonomous diagnosis, treatment, prescribing, triage, outreach, documentation signing, payer submission, or EHR writeback.
- Unsupported citation or fabricated evidence claims.
- Prompt-injection or instruction-override behavior bypassing review gates.
- Sales or product copy implying clinical validation, certification, production approval, or live-care authority.

## Test Plan

Run:

```bash
npm run smoke:clinical-robustness-lab
npm run test:nonsecret
npm run typecheck
npm run build
```

The contract check verifies route coverage, product coverage, perturbation coverage, safety headers, documentation, nonsecret-suite registration, and retained no-authority language.

## Migration Plan

No database migration is required for this increment. The next migration should bind scorecard outputs to durable execution-attempt metadata only after no-PHI reviewer queues and AAL2 authorization are already in place.

## Rollout Plan

1. Keep the lab public and no-PHI only.
2. Use the API and brief for internal review, buyer diligence, and pilot planning.
3. Bind scenarios to durable execution-attempt scorecards.
4. Add protected reviewer dispositions before any pilot evidence references lab results.
5. Keep live clinical production, PHI, connectors, and certification claims blocked until external approvals and customer authority exist.

## Operating Boundary

Clinical Robustness Lab is readiness evidence only. It does not authorize PHI processing, live clinical care, autonomous clinical action, patient outreach, signed documentation, billing or payer submission, EHR writeback, production connector use, clinical validation, certification, legal approval, or regulatory approval.
