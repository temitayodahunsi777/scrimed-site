# SCRIMED Proposed Intended Use Memo

Status: Proposed internal draft awaiting Founder/CEO, qualified legal, and clinical governance approval
Version: 0.1
Prepared: 2026-07-11
Review expiry after approval: 90 days or immediately upon material scope change

## Intended Use

SCRIMED is intended to help authorized healthcare, life-sciences, payer, research, operational, and executive users assess, prepare, organize, explain, and evaluate healthcare workflows using synthetic, metadata-only, or separately approved de-identified inputs. Current capabilities support workflow intelligence, evidence organization, interoperability readiness, administrative draft preparation, clinical robustness evaluation, patient-education drafting, governance, audit preparation, and human-reviewed decision support.

## Intended Users

- Health-system, hospital, clinic, payer, research, and life-sciences leaders
- Authorized operational, administrative, interoperability, security, privacy, compliance, finance, and research personnel
- Licensed clinicians acting as qualified reviewers of clinical-facing drafts
- SCRIMED operators working within documented permissions and approval gates

## Current Operating Environment

- Public no-PHI product information and demonstrations
- Synthetic evaluation and workflow fixtures
- Internal engineering and buyer-diligence preparation
- Protected no-PHI pilot preparation only after scoped authorization
- No live customer activation or production clinical deployment under this draft

## Outputs

- Reviewable summaries, briefs, education drafts, workflow plans, prior-authorization drafts, appeal drafts, research briefs, interoperability previews, governance evidence, and executive artifacts
- Confidence, evidence, uncertainty, source, limitation, policy, audit, and human-review metadata
- Recommendations for authorized humans; not autonomous consequential actions

## Explicit Exclusions

SCRIMED is not intended under this draft to:

- autonomously diagnose, treat, prescribe, triage, or make independent medical decisions;
- provide final imaging interpretation;
- write to an EHR, submit payer or claim transactions, contact patients, book appointments, or send external communications without separately approved human action;
- ingest or process live PHI in current public or synthetic workflows;
- replace licensed clinicians, qualified legal counsel, accountants, auditors, privacy officers, security assessors, or regulatory authorities;
- make certification, clearance, customer, revenue, valuation, reimbursement, outcome, or production-readiness claims without issued evidence and authorized review.

## Required Controls

1. Definition of Done before agentic work.
2. Least-privilege agent and tool permissions.
3. Tenant isolation and no-secret/no-PHI input validation.
4. Source provenance, confidence, limitations, and structured verification.
5. Human review for clinical, financial, privacy, identity, scheduling, external communication, data export, or other consequential work.
6. Cancellation, rollback where technically possible, and fail-closed behavior.
7. Audit events without raw PHI, secrets, private prompts, sensitive retrieved content, or hidden chain-of-thought.
8. Separate buyer, privacy, security, clinical, regulatory, connector, and regional approvals before scope expands.

## Public Messaging Boundary

Approved public language should describe SCRIMED as healthcare intelligence, governed workflow support, synthetic evaluation, interoperability readiness, evidence organization, and clinician-governed decision support. Public messaging must not imply autonomous care, live PHI authority, production connector approval, regulatory clearance, security certification, customer endorsement, guaranteed outcomes, guaranteed revenue, or replacement of clinical judgment.

## Required Sign-Off

| Role | Status | Decision evidence |
| --- | --- | --- |
| Founder/CEO | Pending | Store signed decision outside source code |
| Qualified legal reviewer | Pending | Intended-use and claims review reference |
| Clinical governance reviewer | Pending | Clinical boundary and escalation review reference |
| Security/privacy reviewer | Advisory pending | Data boundary and control review reference |

This draft is not an approval, legal opinion, regulatory classification, clinical authorization, security certification, PHI authorization, production release, or customer go-live decision.
