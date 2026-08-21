# SCRIMED p.34 Threat And Boundary Update

Status: local synthetic candidate; independent security, privacy, clinical-safety, imaging-privacy, and platform review required.

| Threat | Control | Failure state |
| --- | --- | --- |
| Unknown or expired model route | Declarative admission with source, effective date, expiry, task/risk/data/region/environment/tool/budget checks | BLOCK |
| Generative fallthrough for consequential work | Deterministic-first policy and restricted task classes | REQUIRE_HUMAN or BLOCK |
| Prompt/tool injection | Service-layer tool stages; discovered tools grant no authority | BLOCK |
| Stale, replayed, cross-tenant, or payload-mismatched approval | Exact action/payload/candidate/tenant/policy/nonce/expiry binding | BLOCK |
| Browser performs irreversible action | Reversible sandbox requirement plus local execution disable | BLOCK |
| Context loses source structure | Heading, table header, span, page/bounding box, hash, freshness, and contradiction retention | BLOCK or REQUIRE_HUMAN |
| Unsupported or fabricated citation | Grounded-claim validator resolves every span | BLOCK |
| DICOM private tags escape | Odd-group private-tag scan and removal manifest | REQUIRE_HUMAN |
| Burned-in annotation remains uncertain | Pixel quarantine and no after-manifest/export | BLOCK |
| Metadata removal misrepresented as anonymization | Explicit non-anonymization reason code and human export gate | BLOCK |
| Governance record changed after action | Existing predecessor chain plus details hash and FHIR mapping | BLOCK |
| Quality regression averaged away | Hard floors, worst-cell gate, inner/outer loops, no auto-promotion | BLOCK |
| Provider outage causes unsafe downgrade | Independent dependency check, bounded fallback, safe refusal | BLOCK or REQUIRE_HUMAN |
| Token/cost amplification | Per-task budgets and circuit breaker | SAFE_REFUSAL |
| Cross-tenant cache reuse | Tenant-bound hashed cache key | BLOCK by contract |
| Network loss triggers remote fallback | Connectivity-aware placement with no autonomous safety downgrade | BLOCK |
| Unsupported public claim | Primary-evidence, owner, wording, expiry, and legal-review gate | BLOCK |
| Workflow starts without owner, baseline, KPIs, locality, rollback, or release evidence | Versioned `WorkflowContract` validation before route selection | BLOCK |
| Public leaderboard displaces local safety evidence | Model-fit admission ignores rank and requires fresh local task evidence | BLOCK |
| PHI route lacks a signed BAA or covered product path | Documentary BAA, expiry, product-path, residency, and candidate feature gates | BLOCK |
| Approval is replayed or duplicate execution is attempted | Approval ID, candidate, payload, tenant, expiry, nonce, and idempotency binding | BLOCK |
| Agent skips action maturity or writes a system of record | Fixed transition graph and external-write denial | BLOCK |
| Pilot expands on stale or averaged evidence | Cohort, duration, hard thresholds, freshness, and three named approval lanes | BLOCK or OPERATOR_REQUIRED |
| Continuity metric leaks identity or becomes a causal claim | Hashed references, tenant checks, PHI-safe segmentation, and claim flags fixed false | BLOCK or REQUIRE_HUMAN |
| Public-sector readiness becomes a compliance or eligibility claim | Six documentary evidence lanes and explicit claim authority fixed false | BLOCK |
| Challenger enters production from vendor claims | Disabled non-PHI registry, local reproduction, license/infrastructure evidence, named review, no promotion | BLOCK |
| Telemetry leaks sensitive values | Key and value redaction plus aggregate-only ROI dashboard | BLOCK by contract |
| A2/A3 action outruns exact human authority | Actor, action, resource, payload, idempotency, policy, issue time, expiry, and independent approver binding; local evaluation remains review-only until trusted-store verification and atomic consumption | BLOCK or REQUIRE_HUMAN |
| Sensitive field bypasses registry | Schema-level deny-unknown startup validation | BLOCK startup |
| Raw PHI or secret reaches a provider or model | Minimum-necessary purpose checks, pre-egress inspection, token receipts, BAA/product documentary gates, and live-provider disable | BLOCK |
| Token resolves across tenant or without trusted validation | Tenant/purpose/expiry key, trusted vault clock, admitted validator, and one-use grant | BLOCK |
| Agent escapes by direct, DNS, proxy, loopback, mount, host credential, privilege, or path-alias route | Default-deny network and exact policy roots; compliant policy remains review-only pending canonical containment and open-time runtime proof | BLOCK or REQUIRE_HUMAN |
| Retrieval ranks unauthorized evidence | Authenticated tenant/purpose context plus classification and freshness filters run before scoring; caller-selected tenant is ignored as authority | BLOCK or ABSTAIN |
| Internal validation is mistaken for external clinical evidence | Multisite/cohort/acquisition/time/distribution contract and named independent review | BLOCK |
| Apparent success silently reduces oversight | Review-rate floor, absolute error volume, silent-acceptance and cohort-coverage checks, explicit reduction approval | BLOCK |
| Patient education or coding draft becomes delivery or billing action | Clinician-review and preference gates; assisted coding default; delivery and billing authority fixed false | BLOCK |
| Runtime retry duplicates work or hides failure | Tenant idempotency, verified checkpoint, bounded retry, suspended state, and dead-letter evidence | BLOCK or REQUIRE_HUMAN |

Residual risks: the DICOM fixture is not a production parser or de-identification validation; the ledgers are application-level tamper evidence rather than externally anchored storage; the token vault is an in-memory nonproduction adapter; no trusted approval store, canonical filesystem broker, or open-time sandbox containment adapter is connected; PHI/key scanning is defense in depth rather than a data contract or enterprise DLP service; continuity fixtures are synthetic and do not establish clinical benefit; challenger labels have no locally reproduced model run; public-sector and external-validation evidence lanes are incomplete; no live provider, external sandbox, edge, cloud, network, PHI, clinical, imaging, or customer environment was tested; and all external approvals remain pending.
