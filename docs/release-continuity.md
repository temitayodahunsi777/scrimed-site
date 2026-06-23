# SCRIMED Release Continuity

SCRIMED Release Continuity is the operator lane for keeping production deployment proof, source-control checkpoints, public smoke, protected fail-closed checks, and human AAL2 happy-path boundaries aligned.

## Surfaces

- `/release-continuity`
- `/api/release-continuity`
- `/api/release-continuity/brief`
- `/product`
- `/pilot-workspace/access`
- `/buyer-release-control-run`

## Current Posture

- Production domain: `https://app.scrimedsolutions.com`
- Baseline deployment: `dpl_EjfSCM5YKpWhHKDAa6FGmNDPnJ7K`
- Baseline commit: `6219f3616e71d163edd047e4d55074cc5089e2b8`
- Baseline tag: `scrimed-code-pt2-approvals-readiness-20260623`
- Release continuity status: `release-continuity-checkpointed-aal2-boundary`
- Brief status: `release-continuity-brief-operator-ready`

## What It Resolves

- Source-control drift is resolved by tying production evidence to commit, tag, and release brief.
- Public production smoke is separated from protected happy-path evidence.
- Protected TrustOps, Agent Workspace, and Buyer Release Control checks remain fail-closed without AAL2.
- Operator-token handling stays no-secret and deliberate.
- Approval, PHI, clinical-care, certification, reimbursement, and buyer-release claims remain externally gated.

## Safe Workaround For AAL2

The preferred path is the protected browser workspace at `/pilot-workspace/access`, where an approved tenant-admin or pilot-lead uses the active AAL2 browser session without copying bearer tokens into scripts, chats, logs, docs, or CI.

When command-line evidence is deliberately required, use a fresh short-lived AAL2 bearer token only through an environment variable for one run, record only the safe evidence fields, and dispose of the token outside SCRIMED immediately after the run.

## Boundaries

Release Continuity does not mint tokens, store secrets, bypass AAL2, approve buyer release, authorize PHI processing, certify security or compliance, grant legal approval, approve production connectors, guarantee reimbursement, or authorize live clinical care.
