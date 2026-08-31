# PR #40 Risk-Ranked Diff

Status: **EXACT_REVIEW_REQUIRED**

Files: **112**

Unexplained: **0**

Fingerprint: `b1aa1798a83c85865aba6b0d2b7315f37c37608ae0446e5c69eb845d2b1d2969`

| Rank | Files |
| --- | ---: |
| CRITICAL | 3 |
| HIGH | 7 |
| MEDIUM | 13 |
| LOW | 40 |
| GENERATED | 15 |
| DOCUMENTATION | 34 |

## Ordered Files

| Rank | Path | Why | Primary test |
| --- | --- | --- | --- |
| CRITICAL | `app/lib/commercial/pilotManifest.ts` | Strengthens nonbinding economics, proposal, and buyer-readiness controls. | `npm run test:scrimed-p34-post-review-readiness` |
| CRITICAL | `app/lib/release/previewAcceptance.ts` | Binds nonproduction preview behavior and observability to the exact candidate. | `npm run smoke:public` |
| CRITICAL | `app/lib/scrimed-p34/reviewReadiness.ts` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| HIGH | `app/lib/commercial/pilotOperatingSystem.ts` | Strengthens nonbinding economics, proposal, and buyer-readiness controls. | `npm run test:scrimed-p34-post-review-readiness` |
| HIGH | `app/lib/economics/pilotCostGovernor.ts` | Strengthens bounded synthetic-pilot execution and evidence controls. | `npm run test:scrimed-p34-post-review-readiness` |
| HIGH | `app/lib/scrimed-p34/exactHeadReviewState.ts` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| HIGH | `scripts/lib/aal2-redacted-evidence.mjs` | Strengthens fail-closed identity, approval, egress, or security evidence. | `npm run test:scrimed-p34-gap-closure` |
| HIGH | `scripts/run-aal2-candidate-verification.mjs` | Strengthens fail-closed identity, approval, egress, or security evidence. | `npm run test:scrimed-p34-gap-closure` |
| HIGH | `scripts/scrimed-nonsecret-test-suite.mjs` | Strengthens fail-closed identity, approval, egress, or security evidence. | `npm run test:scrimed-p34-gap-closure` |
| HIGH | `scripts/scrimed-p34-certify.mjs` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| MEDIUM | `.gitignore` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| MEDIUM | `app/globals.css` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run smoke:public` |
| MEDIUM | `app/investor-demo-command-room/page.tsx` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run smoke:public` |
| MEDIUM | `app/lib/deploymentProfiles.ts` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| MEDIUM | `app/lib/marketActivation.ts` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| MEDIUM | `app/lib/productConsole.ts` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| MEDIUM | `app/lib/publicMarketReadiness.ts` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| MEDIUM | `app/page.tsx` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run smoke:public` |
| MEDIUM | `app/product/page.tsx` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run smoke:public` |
| MEDIUM | `app/scrimed-p34/page.tsx` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run smoke:public` |
| MEDIUM | `app/trust-center/page.tsx` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run smoke:public` |
| MEDIUM | `config/performance-budgets.json` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| MEDIUM | `package.json` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `app/lib/commercial/pilotTemplateRegistry.ts` | Strengthens nonbinding economics, proposal, and buyer-readiness controls. | `npm run test:scrimed-p34-post-review-readiness` |
| LOW | `app/lib/commercial/syntheticPilotReadiness.ts` | Strengthens nonbinding economics, proposal, and buyer-readiness controls. | `npm run test:scrimed-p34-post-review-readiness` |
| LOW | `app/lib/commercialStrategy.ts` | Strengthens nonbinding economics, proposal, and buyer-readiness controls. | `npm run test:scrimed-p34-post-review-readiness` |
| LOW | `app/lib/pilotDemoCommercialReadiness.ts` | Strengthens nonbinding economics, proposal, and buyer-readiness controls. | `npm run test:scrimed-p34-post-review-readiness` |
| LOW | `app/lib/release/vercelReleaseAssurance.ts` | Binds nonproduction preview behavior and observability to the exact candidate. | `npm run smoke:public` |
| LOW | `app/lib/scrimed-p34/exactHeadBaseline.ts` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `app/synthetic-pilot/page.tsx` | Strengthens bounded synthetic-pilot execution and evidence controls. | `npm run test:scrimed-p34-post-review-readiness` |
| LOW | `scripts/build-with-p34-inventory.mjs` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `scripts/check-generated-integrity.mjs` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `scripts/commercial-pricing-contract-check.mjs` | Strengthens nonbinding economics, proposal, and buyer-readiness controls. | `npm run test:scrimed-p34-post-review-readiness` |
| LOW | `scripts/commercial-pricing-policy-test.mjs` | Strengthens nonbinding economics, proposal, and buyer-readiness controls. | `npm run test:scrimed-p34-post-review-readiness` |
| LOW | `scripts/generate-p34-build-inventory.mjs` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `scripts/generate-p34-follow-on-artifacts.mjs` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `scripts/generate-p34-post-review-artifacts.mjs` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `scripts/generate-p39-review-map.mjs` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `scripts/generated-output-postflight.mjs` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `scripts/lib/p34-candidate-state.mjs` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `scripts/lib/p34-post-review-runtime-evidence.mjs` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `scripts/lib/vercel-preview-access.mjs` | Binds nonproduction preview behavior and observability to the exact candidate. | `npm run smoke:public` |
| LOW | `scripts/node24-runtime-policy-test.mjs` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `scripts/product-console-payload-budget-test.mjs` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `scripts/public-production-smoke.mjs` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `scripts/release-candidate-validation.mjs` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `scripts/scrimed-local-public-smoke-runner-contract-check.mjs` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `scripts/scrimed-local-public-smoke-runner.mjs` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `scripts/scrimed-local-quality-runner-contract-check.mjs` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `scripts/scrimed-local-quality-runner.mjs` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `scripts/scrimed-p34-artifacts.mjs` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `scripts/scrimed-p34-canary.mjs` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `scripts/scrimed-p34-evidence.mjs` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `scripts/scrimed-p34-follow-on-contract-check.mjs` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `scripts/scrimed-p34-pilot-assurance-adversarial-test.mjs` | Strengthens bounded synthetic-pilot execution and evidence controls. | `npm run test:scrimed-p34-post-review-readiness` |
| LOW | `scripts/scrimed-p34-post-review-readiness-contract-check.mjs` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `scripts/scrimed-p34-post-review-readiness-policy-test.mjs` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `scripts/scrimed-p34-precision-wave-contract-check.mjs` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `scripts/scrimed-p34-precision-wave-policy-test.mjs` | Integrates the p.34 conversion wave into the existing runtime and test surface. | `npm run contract:scrimed-p34-follow-on` |
| LOW | `scripts/scrimed-p34-verify-preview.mjs` | Binds nonproduction preview behavior and observability to the exact candidate. | `npm run smoke:public` |
| LOW | `scripts/vercel-preview-access-policy-test.mjs` | Binds nonproduction preview behavior and observability to the exact candidate. | `npm run smoke:public` |
| LOW | `scripts/verify-node24-vercel-build.mjs` | Binds nonproduction preview behavior and observability to the exact candidate. | `npm run smoke:public` |
| LOW | `scripts/verify-preview-ui.mjs` | Binds nonproduction preview behavior and observability to the exact candidate. | `npm run smoke:public` |
| GENERATED | `artifacts/build/render-inventory.json` | Regenerates deterministic candidate evidence from repository sources. | `npm run contract:scrimed-p34-follow-on` |
| GENERATED | `artifacts/build/routes.json` | Regenerates deterministic candidate evidence from repository sources. | `npm run contract:scrimed-p34-follow-on` |
| GENERATED | `artifacts/p34/P34_GATE_MATRIX.json` | Regenerates deterministic candidate evidence from repository sources. | `npm run contract:scrimed-p34-follow-on` |
| GENERATED | `artifacts/p34/P34_GENERATION_INVENTORY.json` | Regenerates deterministic candidate evidence from repository sources. | `npm run contract:scrimed-p34-follow-on` |
| GENERATED | `artifacts/p34/P34_ROUTE_INVENTORY.json` | Regenerates deterministic candidate evidence from repository sources. | `npm run contract:scrimed-p34-follow-on` |
| GENERATED | `artifacts/p34/P34_VALIDATION_REPORT.json` | Regenerates deterministic candidate evidence from repository sources. | `npm run contract:scrimed-p34-follow-on` |
| GENERATED | `artifacts/review/p34-cumulative-integration-assurance.json` | Regenerates deterministic candidate evidence from repository sources. | `npm run contract:scrimed-p34-follow-on` |
| GENERATED | `artifacts/review/p34-integration-map.json` | Regenerates deterministic candidate evidence from repository sources. | `npm run contract:scrimed-p34-follow-on` |
| GENERATED | `artifacts/review/p34-review-index.json` | Regenerates deterministic candidate evidence from repository sources. | `npm run contract:scrimed-p34-follow-on` |
| GENERATED | `artifacts/review/p34-stacked-review-plan.json` | Regenerates deterministic candidate evidence from repository sources. | `npm run contract:scrimed-p34-follow-on` |
| GENERATED | `artifacts/review/p39-full-integration-map.json` | Regenerates deterministic candidate evidence from repository sources. | `npm run contract:scrimed-p34-follow-on` |
| GENERATED | `artifacts/review/p40-current-risk-map.json` | Regenerates deterministic candidate evidence from repository sources. | `npm run contract:scrimed-p34-follow-on` |
| GENERATED | `artifacts/review/p40-full-integration-map.json` | Regenerates deterministic candidate evidence from repository sources. | `npm run contract:scrimed-p34-follow-on` |
| GENERATED | `artifacts/review/p40-review-index.json` | Regenerates deterministic candidate evidence from repository sources. | `npm run contract:scrimed-p34-follow-on` |
| GENERATED | `artifacts/review/p40-risk-ranked-diff.json` | Regenerates deterministic candidate evidence from repository sources. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/commercial/PROTECTED_PILOT_INSURANCE_READINESS.md` | Strengthens nonbinding economics, proposal, and buyer-readiness controls. | `npm run test:scrimed-p34-post-review-readiness` |
| DOCUMENTATION | `docs/commercial/SYNTHETIC_PILOT_READINESS.md` | Strengthens nonbinding economics, proposal, and buyer-readiness controls. | `npm run test:scrimed-p34-post-review-readiness` |
| DOCUMENTATION | `docs/commercial/WORKFLOW_INTELLIGENCE_ASSESSMENT_SALES_PACK.md` | Strengthens nonbinding economics, proposal, and buyer-readiness controls. | `npm run test:scrimed-p34-post-review-readiness` |
| DOCUMENTATION | `docs/diligence/SCRIMED_ENTERPRISE_DILIGENCE_INDEX.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/diligence/SCRIMED_INVESTOR_TECHNICAL_DILIGENCE_INDEX.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/governance/P34_REVIEW_SCOPE_BY_STAGE.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/operators/MIGRATION_DRY_RUN_OPERATOR_PACKET.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/operators/P34_OPERATOR_COMMAND_CENTER.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/operators/SUPABASE_LEAKED_PASSWORD_CLOSEOUT.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/operators/SUPABASE_PASSWORD_SECURITY_CLOSURE.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/operators/VERCEL_PREVIEW_OPERATOR_PACKET.md` | Binds nonproduction preview behavior and observability to the exact candidate. | `npm run smoke:public` |
| DOCUMENTATION | `docs/operators/WIX_COMMERCIAL_COPY_ALIGNMENT.md` | Strengthens nonbinding economics, proposal, and buyer-readiness controls. | `npm run test:scrimed-p34-post-review-readiness` |
| DOCUMENTATION | `docs/P34_SYNTHETIC_PILOT_OPERATING_SYSTEM.md` | Strengthens bounded synthetic-pilot execution and evidence controls. | `npm run test:scrimed-p34-post-review-readiness` |
| DOCUMENTATION | `docs/pilot-demo-commercial-readiness.md` | Strengthens nonbinding economics, proposal, and buyer-readiness controls. | `npm run test:scrimed-p34-post-review-readiness` |
| DOCUMENTATION | `docs/platform/MACOS_SWC_ENVIRONMENT_NOTE.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/release/P34_CURRENT_CANONICAL_BASELINE.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/release/P34_CURRENT_EXACT_HEAD_BASELINE.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/release/P34_CURRENT_EXECUTIVE_STATE.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/release/P34_CURRENT_STATE_DISCOVERY.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/release/P34_EXECUTIVE_CANONICAL_STATE.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/release/P34_SOURCE_CONTROL_RECONCILIATION.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/release/P40_SOURCE_CONTROL_INTEGRITY.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/review/P34_CUMULATIVE_INTEGRATION_ASSURANCE.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/review/P34_EXACT_HEAD_REVIEW_BRIEF.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/review/P34_FOCUSED_PR_CONSTRUCTION.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/review/P34_INTEGRATION_MAP.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/review/P34_REVIEW_BRIEF.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/review/P34_STACKED_REVIEW_PLAN.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/review/P39_FULL_INTEGRATION_MAP.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/review/P40_CURRENT_EXACT_HEAD_REVIEW_BRIEF.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/review/P40_EXACT_HEAD_REVIEW_BRIEF.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/review/P40_EXECUTIVE_REVIEW_BRIEF.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/review/P40_FULL_INTEGRATION_MAP.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |
| DOCUMENTATION | `docs/review/P40_RISK_RANKED_DIFF.md` | Explains implemented behavior, retained boundaries, and operator action. | `npm run contract:scrimed-p34-follow-on` |

Exact test and evidence arrays are in `artifacts/review/p40-risk-ranked-diff.json`. Generated and documentation files remain reviewable evidence but cannot substitute for behavior or named approval.
