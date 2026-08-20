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

Residual risks: the DICOM fixture is not a production parser or de-identification validation; the ledgers are application-level tamper evidence rather than externally anchored storage; continuity fixtures are synthetic and do not establish clinical benefit; challenger labels have no locally reproduced model run; public-sector evidence lanes are empty; no live provider, edge, cloud, network, PHI, clinical, imaging, or customer environment was tested; and all external approvals remain pending.
