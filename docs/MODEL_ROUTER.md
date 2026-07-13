# SCRIMED Model Router

SCRIMED's model router is provider-neutral readiness infrastructure in `app/lib/modelAgnosticRouter.ts`.

## Provider Abstraction

The adapter registry includes future or disabled adapters for OpenAI, Anthropic, Google, NVIDIA/Nemotron, Azure, AWS, open models, and an active synthetic fallback provider.

## Initial Tiers

- `FAST_LOW_COST`
- `ENTERPRISE_REASONING`
- `CLINICAL_REVIEW_SYNTHETIC`
- `CYBER_DEFENSE_SYNTHETIC`
- `RESEARCH_SIMULATION_SYNTHETIC`

## Guardrails

- No external provider calls by default.
- `SCRIMED_AI_PROVIDER_CALLS_ENABLED=false` by default.
- `SCRIMED_COST_GUARDRAILS_ENABLED=true` by default.
- Cost, latency, provider, tier, and rationale are captured as metadata.
- Safety governance runs before routing.

NO-GO: the router does not approve production model use, process PHI, validate clinical accuracy, or create autonomous clinical authority.
