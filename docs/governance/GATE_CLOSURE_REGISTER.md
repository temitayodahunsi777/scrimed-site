# Gate Closure Register

This register separates safe enforced boundaries from genuine defects and future activation
approvals. `artifacts/governance/gate-registry.json`, generated after final validation, is the
machine-readable companion. A disabled consequential capability is never authority to enable it.

| Gate ID | State | Owner | Exact completion evidence |
| --- | --- | --- | --- |
| `automated-development-controls` | `AUTOMATED_ASSURANCE_COMPLETE` after final suite | Engineering | Validation, assurance manifest, control attestations, SBOM, secret/public checks |
| `synthetic-only-mode` | `PASS_SAFE_BOUNDARY_ENFORCED` | Engineering | Operating-mode and policy tests |
| `phi-processing-disabled` | `PASS_SAFE_BOUNDARY_ENFORCED` | Privacy owner | No-PHI default and API denial tests |
| `clinical-execution-disabled` | `PASS_SAFE_BOUNDARY_ENFORCED` | Clinical-safety owner | Clinical/action policy denials |
| `payer-ehr-device-actions-disabled` | `PASS_SAFE_BOUNDARY_ENFORCED` | Safety/governance | Explicit prohibited-action tests |
| `clean-attributable-candidate` | `FOUNDER_INTERIM_ACCEPTANCE_REQUIRED` until exact commit exists | Founder/release steward | Candidate manifest and attribution decision |
| `ai-independent-review` | `AUTOMATED_ASSURANCE_COMPLETE` when 12 lanes pass | Review orchestrator | Versioned rubric/evidence packets; never human approval |
| `wix-faithcore-copy` | `OPERATOR_ACTION_REQUIRED` | Wix owner | Published neutral copy plus strict live/mobile evidence |
| `supabase-leaked-password-protection` | `OPERATOR_ACTION_REQUIRED` | Supabase Auth owner | Resolved advisor warning and auth regression result |
| `disposable-migration-dry-run` | `OPERATOR_ACTION_REQUIRED` | CI/platform owner | `migration-dry-run.yml` artifact for exact hashes |
| `preview-authorization` | `FOUNDER_INTERIM_ACCEPTANCE_REQUIRED` | Founder | Signed exact candidate/assurance reference, maximum 30 days |
| `fresh-dependency-advisory` | `OPERATOR_ACTION_REQUIRED` | Security owner | `dependency-security.yml` artifact and reviewed findings |
| `legal-policy-adoption` | `TARGETED_SPECIALIST_REVIEW_REQUIRED` at binding adoption | Qualified counsel | Exact policy packet |
| `phi-activation` | `TARGETED_SPECIALIST_REVIEW_REQUIRED` before PHI | Privacy/security owners | Exact purpose/data/provider packet |
| `clinical-activation` | `TARGETED_SPECIALIST_REVIEW_REQUIRED` before consequential use | Clinical-safety owner | Exact intended-use/safety packet |
| `production-security-risk` | `TARGETED_SPECIALIST_REVIEW_REQUIRED` before promotion | Security owner | Production risk packet |
| `production-migration` | `PRODUCTION_AUTHORIZATION_REQUIRED` | Database owner | Dry run plus exact migration authorization |
| `production-deployment` | `PRODUCTION_AUTHORIZATION_REQUIRED` | Release authority | Candidate/environment/window/rollback authorization |
| `post-deployment-evidence` | `PRODUCTION_AUTHORIZATION_REQUIRED` | Release operator | Evidence produced only after authorized deployment |
| `customer-go-live` | `PRODUCTION_AUTHORIZATION_REQUIRED` | Customer and SCRIMED authorities | Customer-specific acceptance and support packet |

Missing, expired, stale, role-mismatched, fingerprint-mismatched, or self-issued evidence fails
closed. Tier 0 local/synthetic work may continue while activation-specific reviews remain deferred.
