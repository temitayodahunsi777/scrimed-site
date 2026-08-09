# Model And Agent Approval Passport

SCRIMED records one deterministic approval passport for every configured model provider and
registered agent. The repository source of truth is
`app/lib/scrimed-work/modelQualification.ts`.

## Admission Contract

Each passport binds the subject, provider, exact configured model identity when available,
version, environment, jurisdiction, intended and prohibited uses, modalities, context and tool
capabilities, seven evaluation gates, cost and latency evidence, review date, rollback strategy,
fallback, and external approval references into a SHA-256 audit hash.

Only the deterministic synthetic fallback and registered metadata-only agents are approved for
synthetic evaluation. Configured external providers remain blocked until their exact model,
terms, data use, security, privacy, residency, economics, and task-specific evaluation evidence
are independently reviewed. No passport grants provider-call, PHI, clinical, deployment,
release, or customer-go-live authority.

## Effort Routing

Offline evaluation uses bounded effort levels: `low`, `medium`, `high`, `xhigh`, and `max`.
The task class selects the minimum useful level. A failed level may escalate once through the
ordered levels, but `max` requires explicit human approval. Prohibited risk blocks. An
unverified provider effort contract returns `provider-setting-unavailable` instead of silently
substituting a setting.

## Unverified Model Names

The requested `Claude Opus 5` candidate has no verified model ID in this candidate and remains
disabled. At the 2026-08-01 review, Anthropic's official Opus page identified Claude Opus 4.8.
SCRIMED records the requested name only as an unverified evaluation candidate and permits no
provider call or public performance claim. See `https://www.anthropic.com/claude/opus`.

## Review Cycle

1. Verify the exact model or agent identity and version.
2. Review license, data-use, retention, residency, security, and economics evidence.
3. Run task-specific safety, factuality, abstention, prompt-injection, code, and healthcare
   evaluations using synthetic or approved de-identified evidence.
4. Record an independent disposition tied to the passport hash.
5. Canary only after separate release authorization and tested rollback.

Public leaderboards, vendor marketing, fluency, or model family names never grant authority.
