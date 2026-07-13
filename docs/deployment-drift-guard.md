# SCRIMED Deployment Drift Guard

Status: active no-secret release control.

SCRIMED Deployment Drift Guard detects when the reviewed repository build and a target deployment do not serve the same buyer-critical, operator-critical, governance-critical, or evidence-critical routes.

This is designed for the exact release failure mode where local build and local production smoke pass, but `https://app.scrimedsolutions.com` is still behind the current repo and returns `404` for a newer route such as `/scrimed-market-execution`.

## Why It Matters

Deployment drift can make SCRIMED look broken even when the source code is healthy. It can also cause operators, buyers, or investors to inspect stale production evidence and draw the wrong conclusion about product readiness.

The guard turns that ambiguity into a crisp release decision:

- local route missing: source/build problem
- local route passes and production route missing: deployment/version drift
- production target missing the guard API: target predates the guard and should be redeployed
- production target passes guard and public smoke: target is aligned for no-secret public evidence

## Routes

- Page: `/deployment-drift-guard`
- API: `/api/deployment-drift-guard`
- Brief: `/api/deployment-drift-guard/brief`

## Commands

```bash
npm run contract:deployment-drift-guard
npm run build
SCRIMED_BASE_URL=http://127.0.0.1:3048 npm run smoke:deployment-drift-guard
SCRIMED_BASE_URL=https://app.scrimedsolutions.com npm run smoke:deployment-drift-guard
SCRIMED_BASE_URL=https://app.scrimedsolutions.com npm run smoke:public
```

## Boundary

This guard is synthetic and metadata-only. It does not deploy code, commit source, apply migrations, expose PHI, authorize clinical care, approve payer submission, write to EHRs, certify compliance, or approve customer go-live.

## NO-GO Boundaries Preserved

- no live PHI
- no autonomous clinical care, diagnosis, treatment, prescribing, or final imaging interpretation
- no payer submission, claim submission, patient outreach, or EHR writeback
- no production connector approval, customer go-live approval, or public certification claim
- no raw secrets, bearer tokens, Supabase service keys, credentials, or connector payloads in logs
- no deploy, commit, migration apply, rollback, or infrastructure mutation authority from this route
