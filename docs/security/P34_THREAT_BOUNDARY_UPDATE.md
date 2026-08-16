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

Residual risks: the DICOM fixture is not a production parser or de-identification validation; the ledger is application-level tamper evidence rather than externally anchored storage; no live provider, edge, cloud, network, PHI, clinical, imaging, or customer environment was tested; and all external approvals remain pending.
