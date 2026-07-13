# SCRIMED AAL2 Durable Store Smoke

Updated: 2026-06-28

This runbook obtains and preflights a short-lived AAL2 bearer token for local no-PHI durable-store smoke testing. It does not store PHI, passwords, refresh tokens, service-role keys, production connector payloads, or clinical data.

SCRIMED also exposes a no-secret operator readiness packet for this flow:

- `/api/qa-evidence/aal2-smoke-readiness`
- `/api/qa-evidence/aal2-smoke-readiness/brief`
- `/qa-aal2-run-evidence`

These routes summarize readiness gates, commands, expected fail-closed modes, and safety boundaries. They do not mint, print, store, or verify bearer-token material; protected APIs remain the source of truth during strict smoke.

## Required Role

Use a verified Supabase session for a SCRIMED workspace member with one of these tenant roles:

- `tenant-admin`
- `pilot-lead`
- `reviewer`

`observer` and non-member sessions must remain forbidden.

## Secure Token Setup

Preferred browser path:

1. Open `https://app.scrimedsolutions.com/pilot-workspace/access`.
2. Sign in with passkey or magic link.
3. Complete TOTP MFA so the current access token has `aal=aal2`.
4. Copy the current Supabase session JSON or access token from the browser session storage/local storage only for the authorized operator session.
5. Do not commit, paste, or upload the token into chat, Git, docs, tickets, logs, or source files.

Local helper options:

```bash
npm run smoke:aal2:token -- --prompt-token --write-env-local
```

or, on macOS, if `copy(findToken());` already placed the token on the clipboard and Terminal blocks direct paste:

```bash
npm run smoke:aal2:token -- --clipboard-token --clear-clipboard --write-env-local
```

or, if the browser session JSON was saved to a temporary local file:

```bash
npm run smoke:aal2:token -- --session-file /tmp/scrimed-session.json --write-env-local
```

or, for a shell-only export that does not echo the token:

```bash
printf "Paste short-lived AAL2 bearer token: "
IFS= read -rs SCRIMED_BEARER_TOKEN
printf "\n"
export SCRIMED_BEARER_TOKEN
npm run smoke:aal2:token
```

The helper validates `aal=aal2`, `session_id`, short token lifetime, Supabase Auth verification, and workspace role when local Supabase env is configured. It never prints bearer-token values. `.env.local` is gitignored and written with mode `0600`.

## Smoke Commands

Before strict mode, run the no-secret operator readiness preflight. It reports token freshness, workspace slug, target assumptions, and missing local protected runtime configuration without printing bearer tokens:

```bash
npm run smoke:aal2:readiness
```

Non-strict smoke validates public summary and unauthenticated fail-closed behavior, then skips authenticated writes when no token is present:

```bash
npm run smoke:aal2:durable-store
```

Strict smoke requires `SCRIMED_BEARER_TOKEN`, `SCRIMED_WORKSPACE_SLUG`, and a target app with durable-store protected writes enabled:

```bash
npm run smoke:aal2:durable-store:strict
```

Equivalent explicit environment:

```bash
SCRIMED_BASE_URL=https://app.scrimedsolutions.com \
SCRIMED_WORKSPACE_SLUG=atlas-synthetic-evaluation \
SCRIMED_REQUIRE_AUTHENTICATED_SMOKE=true \
npm run smoke:aal2:durable-store:strict
```

## Expected Gates

- Missing `SCRIMED_BEARER_TOKEN`: strict smoke fails closed before authenticated writes.
- Invalid, expired, or non-AAL2 token: strict smoke fails closed; non-strict smoke warns and skips authenticated writes so stale `.env.local` tokens do not block unauthenticated fail-closed checks.
- Valid AAL2 token with wrong workspace role: protected API returns forbidden.
- Valid AAL2 token with `tenant-admin`, `pilot-lead`, or `reviewer`: record, idempotency reuse, replay, and review-disposition smoke may pass only when `SCRIMED_EXECUTION_ATTEMPT_DURABLE_STORE_ENABLED=true` is enabled on the target app.
- Durable-store disabled: protected record/replay/review remain disabled/fail-safe.

## Disposal

After a smoke run, remove the local token:

```bash
perl -0777 -i -pe 's/^SCRIMED_BEARER_TOKEN=.*\\n//m' .env.local
```

Then refresh or sign out of the browser session if the token was minted only for this smoke.
