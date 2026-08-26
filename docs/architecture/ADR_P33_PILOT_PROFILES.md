# ADR: p.33 Pilot Profiles

Status: accepted for local synthetic implementation.

Decision: expose three explicit deployment profiles with independent evidence gates. `NON_PHI_CONTROLLED_PILOT` may become locally eligible. `PHI_CAPABLE_PILOT` and `LINUX_LOCAL_AGENT_PILOT` remain blocked until every required external and technical control is evidenced.

Consequences:

- Restricted profiles have no bypass flag.
- Unsafe environment variables cannot create eligibility.
- No profile grants live clinical operation, autonomous action, production deployment, or customer activation.
- External approvals remain fingerprint-bound operator actions.

Rejected: a generic pilot flag, inferred BAA or platform eligibility, and enabling restricted profiles from local configuration alone.
