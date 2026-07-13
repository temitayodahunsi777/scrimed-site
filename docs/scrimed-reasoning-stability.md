# SCRIMED Reasoning Stability Layer

SCRIMED Reasoning Stability evaluates synthetic model-output stability before outputs become workflow evidence.

## Scope

- Doom-loop detector
- Repeated-token/span detector
- Self-consistency check
- Clinical hallucination risk placeholder
- Retry recommendation
- Confidence category: low, medium, high
- Safety status: pass, caution, blocked

## Safety Boundary

This layer does not validate clinical truth, diagnose, treat, prescribe, or authorize live clinical use. It exists to route unstable or unsupported outputs to retry, termination, or human review.

## Routes

- `/scrimed-reasoning-stability`
- `/api/scrimed-reasoning-stability`
- `/api/scrimed-reasoning-stability/brief`
