#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const checks = [
  {
    label: "generated-cache preservation policy",
    args: ["scripts/generated-cache-preservation-policy-test.mjs"]
  },
  {
    label: "workspace hygiene policy",
    args: ["scripts/workspace-hygiene-policy-test.mjs"]
  },
  {
    label: "generated integrity",
    args: ["scripts/check-generated-integrity.mjs"]
  },
  {
    label: "generated-output postflight self-test",
    args: ["scripts/generated-output-postflight.mjs", "--self-test"]
  },
  {
    label: "script registry contract",
    args: ["scripts/script-registry-contract-check.mjs"]
  },
  {
    label: "direct-Node quality runner contract",
    args: ["scripts/scrimed-local-quality-runner-contract-check.mjs"]
  },
  {
    label: "managed local public smoke runner contract",
    args: ["scripts/scrimed-local-public-smoke-runner-contract-check.mjs"]
  },
  {
    label: "CI workflow contract",
    args: ["scripts/ci-workflow-contract-check.mjs"]
  },
  {
    label: "Node 24 runtime policy behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/node24-runtime-policy-test.mjs"
    ]
  },
  {
    label: "Node 24 certification self-test",
    args: ["scripts/verify-node24-vercel-build.mjs", "--self-test"]
  },
  {
    label: "Node 24 and Vercel repository contract",
    args: ["scripts/node24-vercel-contract-check.mjs"]
  },
  {
    label: "Vercel production deployment policy",
    args: ["scripts/vercel-production-deployment-policy-test.mjs"]
  },
  {
    label: "release provenance contract",
    args: ["scripts/release-provenance-contract-check.mjs"]
  },
  {
    label: "release provenance policy self-test",
    args: ["scripts/release-provenance-preflight.mjs", "--self-test"]
  },
  {
    label: "p.32 worktree evidence policy",
    args: ["scripts/scrimed-p32-worktree-evidence-policy-test.mjs"]
  },
  {
    label: "release candidate manifest policy self-test",
    args: ["scripts/release-candidate-manifest.mjs", "--self-test"]
  },
  {
    label: "release candidate manifest contract",
    args: ["scripts/release-candidate-manifest-contract-check.mjs"]
  },
  {
    label: "release candidate validation policy self-test",
    args: ["scripts/release-candidate-validation.mjs", "--self-test"]
  },
  {
    label: "release candidate validation contract",
    args: ["scripts/release-candidate-validation-contract-check.mjs"]
  },
  {
    label: "release candidate review packet policy self-test",
    args: ["scripts/release-candidate-review-packet.mjs", "--self-test"]
  },
  {
    label: "release candidate review packet contract",
    args: ["scripts/release-candidate-review-packet-contract-check.mjs"]
  },
  {
    label: "investor deck review policy self-test",
    args: ["scripts/investor-deck-review.mjs", "--self-test"]
  },
  {
    label: "investor deck review contract",
    args: ["scripts/investor-deck-review-contract-check.mjs"]
  },
  {
    label: "design governance contract",
    args: ["scripts/design-governance-contract-check.mjs"]
  },
  {
    label: "public-claims integrity contract",
    args: ["scripts/public-claims-integrity-contract-check.mjs"]
  },
  {
    label: "public remediation contract",
    args: ["scripts/public-remediation-contract-check.mjs"]
  },
  {
    label: "public-claims integrity policy self-test",
    args: ["scripts/public-claims-integrity-smoke.mjs", "--self-test"]
  },
  {
    label: "Wix publication verification contract",
    args: ["scripts/wix-publication-verification-contract-check.mjs"]
  },
  {
    label: "Wix publication verification policy self-test",
    args: ["scripts/wix-publication-verification.mjs", "--self-test"]
  },
  {
    label: "portable Wix production verifier self-test",
    args: ["scripts/verify-wix-production.mjs", "--self-test"]
  },
  {
    label: "portable preview UI verifier self-test",
    args: ["scripts/verify-preview-ui.mjs", "--self-test"]
  },
  {
    label: "public remediation policy tests",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/public-remediation-policy-test.mjs"
    ]
  },
  {
    label: "FaithCore API, service, and public-copy neutrality",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/faithcore-neutrality-policy-test.mjs"
    ]
  },
  {
    label: "public release source verification",
    args: ["scripts/verify-public-release.mjs"]
  },
  {
    label: "dependency security floor contract",
    args: ["scripts/dependency-security-floor-contract-check.mjs"]
  },
  {
    label: "SCRIMED deterministic SBOM self-test",
    args: ["scripts/scrimed-sbom.mjs", "--self-test"]
  },
  {
    label: "SCRIMED no-secret candidate scanner self-test",
    args: ["scripts/scrimed-secret-scan.mjs", "--self-test"]
  },
  {
    label: "SCRIMED migration evidence analyzer self-test",
    args: ["scripts/scrimed-migration-evidence-packet.mjs", "--self-test"]
  },
  {
    label: "SCRIMED pending-migration authorization self-test",
    args: ["scripts/pending-migration-authorization-check.mjs", "--self-test"]
  },
  {
    label: "SCRIMED pending-migration static authorization check",
    args: ["scripts/pending-migration-authorization-check.mjs", "--strict"]
  },
  {
    label: "SCRIMED disposable migration preflight policy",
    args: ["scripts/disposable-migration-preflight.mjs", "--self-test"]
  },
  {
    label: "AAL2 bearer-token policy",
    args: ["scripts/aal2-token-policy-selftest.mjs"]
  },
  {
    label: "AAL2 candidate-bound evidence verifier",
    args: ["scripts/verify-aal2-evidence.mjs", "--self-test"]
  },
  {
    label: "AAL2 exact-target and candidate binding",
    args: ["scripts/verify-aal2-target-binding.mjs", "--self-test"]
  },
  {
    label: "AAL2 smoke readiness preflight",
    args: ["scripts/aal2-smoke-readiness-preflight.mjs"]
  },
  {
    label: "tenant access workspace selection contract",
    args: ["scripts/tenant-access-workspace-selection-contract-check.mjs"]
  },
  {
    label: "durable-store source contract",
    args: ["scripts/execution-attempt-durable-store-contract-check.mjs"]
  },
  {
    label: "clinical robustness lab contract",
    args: ["scripts/clinical-robustness-lab-contract-check.mjs"]
  },
  {
    label: "clinical data fabric contract",
    args: ["scripts/clinical-data-fabric-contract-check.mjs"]
  },
  {
    label: "clinical data governance contract",
    args: ["scripts/clinical-data-governance-contract-check.mjs"]
  },
  {
    label: "clinical context gateway contract",
    args: ["scripts/clinical-context-gateway-contract-check.mjs"]
  },
  {
    label: "P31 clinical evidence controls policy behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/clinical-evidence-controls-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED P31 applied intelligence contract",
    args: ["scripts/scrimed-p31-applied-intelligence-contract-check.mjs"]
  },
  {
    label: "SCRIMED P31 extended workstreams policy behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-p31-workstreams-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED P31 extended workstreams contract",
    args: ["scripts/scrimed-p31-workstreams-contract-check.mjs"]
  },
  {
    label: "SCRIMED P32 policy and negative-path behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-p32-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED P32 production harness and guarded workflow behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-p32-execution-harness-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED P32 governed runtime and release hardening behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-p32-release-hardening-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED P32 clinical operations and contained-agent behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-p32-clinical-operations-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED P32 clinical operations repository contract",
    args: ["scripts/scrimed-p32-clinical-operations-contract-check.mjs"]
  },
  {
    label: "SCRIMED P32 consolidated governance policy behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-p32-consolidated-governance-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED P32 control-plane closure policy behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-p32-control-plane-closure-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED model, agent, and impact qualification policy behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-qualification-impact-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED independent review orchestrator policy behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-review-orchestrator-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED risk-tiered preproduction assurance policy behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/preproduction-assurance-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED Work development continuity policy behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-work-development-continuity-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED Work exact-evidence review-policy preflight behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-work-review-policy-preflight-test.mjs"
    ]
  },
  {
    label: "SCRIMED preproduction assurance generator self-test",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/generate-preproduction-assurance.mjs",
      "--self-test"
    ]
  },
  {
    label: "SCRIMED disposable migration dry-run verifier self-test",
    args: ["scripts/verify-migration-dry-run.mjs", "--self-test"]
  },
  {
    label: "SCRIMED live mobile verifier self-test",
    args: ["scripts/verify-live-mobile.mjs", "--self-test"]
  },
  {
    label: "SCRIMED preproduction assurance repository contract",
    args: ["scripts/preproduction-assurance-contract-check.mjs"]
  },
  {
    label: "SCRIMED model, agent, and impact qualification repository contract",
    args: ["scripts/scrimed-qualification-impact-contract-check.mjs"]
  },
  {
    label: "SCRIMED release gap-closure repository contract",
    args: ["scripts/scrimed-release-gap-closure-contract-check.mjs"]
  },
  {
    label: "SCRIMED P32 consolidated governance repository contract",
    args: ["scripts/scrimed-p32-consolidated-governance-contract-check.mjs"]
  },
  {
    label: "SCRIMED P32 consolidated governance gate self-test",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-p32-preproduction-governance-gates.mjs",
      "--self-test",
      "--strict",
      "--profile=development"
    ]
  },
  {
    label: "SCRIMED P32 repository-native contract",
    args: ["scripts/scrimed-p32-contract-check.mjs"]
  },
  {
    label: "SCRIMED P32 trusted evidence issuer attestation",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-p32-evidence-attestation-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED P32 protected evidence issuer behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-p32-evidence-issuer-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED P32 protected evidence issuer contract",
    args: ["scripts/scrimed-p32-evidence-issuer-contract-check.mjs"]
  },
  {
    label: "SCRIMED P32 protected candidate-review behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-p32-candidate-review-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED P32 protected candidate-review contract",
    args: ["scripts/scrimed-p32-candidate-review-contract-check.mjs"]
  },
  {
    label: "SCRIMED P32 candidate-bound release gate evidence",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-p32-release-gate-evidence.mjs",
      "--self-test"
    ]
  },
  {
    label: "SCRIMED Clinical Assurance Control Plane policy behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/clinical-assurance-control-plane-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED Clinical Assurance Control Plane contract",
    args: ["scripts/clinical-assurance-control-plane-contract-check.mjs"]
  },
  {
    label: "SCRIMED Clinical Assurance migration contract",
    args: ["scripts/clinical-assurance-migration-contract-check.mjs"]
  },
  {
    label: "Documentation-Before-Authorization contract",
    args: ["scripts/documentation-before-authorization-contract-check.mjs"]
  },
  {
    label: "Strategic investor outreach contract",
    args: ["scripts/strategic-investor-outreach-contract-check.mjs"]
  },
  {
    label: "Investor demo run-of-show contract",
    args: ["scripts/investor-demo-run-of-show-contract-check.mjs"]
  },
  {
    label: "Investor demo run-of-show policy",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/investor-demo-run-of-show-policy-test.mjs"
    ]
  },
  {
    label: "Investor demo proof-route smoke policy",
    args: ["scripts/investor-demo-proof-route-smoke.mjs", "--self-test"]
  },
  {
    label: "Investor demo command-room policy",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/investor-demo-command-room-policy-test.mjs"
    ]
  },
  {
    label: "Investor demo command-room contract",
    args: ["scripts/investor-demo-command-room-contract-check.mjs"]
  },
  {
    label: "Bounded public fetch policy",
    args: ["scripts/bounded-public-fetch-policy-test.mjs"]
  },
  {
    label: "Strategic investor meeting policy",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/strategic-investor-meeting-policy-test.mjs"
    ]
  },
  {
    label: "Capital planning policy",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/capital-planning-policy-test.mjs"
    ]
  },
  {
    label: "Capital acquisition readiness policy",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/capital-acquisition-readiness-policy-test.mjs"
    ]
  },
  {
    label: "Federal contract readiness policy",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/federal-contract-readiness-policy-test.mjs"
    ]
  },
  {
    label: "Federal contract readiness contract",
    args: ["scripts/federal-contract-readiness-contract-check.mjs"]
  },
  {
    label: "Capital Vitality contract",
    args: ["scripts/capital-vitality-contract-check.mjs"]
  },
  {
    label: "Intended Use review policy",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/intended-use-review-policy-test.mjs"
    ]
  },
  {
    label: "Approvals Readiness contract",
    args: ["scripts/approvals-readiness-contract-check.mjs"]
  },
  {
    label: "On-Device De-Identification contract",
    args: ["scripts/on-device-deidentification-contract-check.mjs"]
  },
  {
    label: "SCRIMED Meta-Harness contract",
    args: ["scripts/scrimed-meta-harness-contract-check.mjs"]
  },
  {
    label: "Pre-Indexed Intelligence contract",
    args: ["scripts/pre-indexed-intelligence-contract-check.mjs"]
  },
  {
    label: "competitive market intelligence contract",
    args: ["scripts/competitive-market-intelligence-contract-check.mjs"]
  },
  {
    label: "commercial pricing policy",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/commercial-pricing-policy-test.mjs"
    ]
  },
  {
    label: "commercial pricing contract",
    args: ["scripts/commercial-pricing-contract-check.mjs"]
  },
  {
    label: "Pilot Demo Commercial Readiness contract",
    args: ["scripts/pilot-demo-commercial-readiness-contract-check.mjs"]
  },
  {
    label: "Pilot Demo Session Plan policy",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/pilot-demo-session-plan-policy-test.mjs"
    ]
  },
  {
    label: "Pilot Demo Proof Preflight policy",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/pilot-demo-proof-preflight-policy-test.mjs"
    ]
  },
  {
    label: "Pilot Demo Rehearsal policy",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/pilot-demo-rehearsal-policy-test.mjs"
    ]
  },
  {
    label: "Pilot Demo Protected Handoff policy",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/pilot-demo-protected-handoff-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED Market Execution contract",
    args: ["scripts/scrimed-market-execution-contract-check.mjs"]
  },
  {
    label: "Enterprise Healthcare Infrastructure contract",
    args: ["scripts/enterprise-healthcare-infrastructure-contract-check.mjs"]
  },
  {
    label: "SCRIMED Execution Focus contract",
    args: ["scripts/scrimed-execution-focus-contract-check.mjs"]
  },
  {
    label: "enterprise readiness contract",
    args: ["scripts/enterprise-readiness-contract-check.mjs"]
  },
  {
    label: "SCRIMED OS implementation plan contract",
    args: ["scripts/scrimed-os-implementation-plan-contract-check.mjs"]
  },
  {
    label: "SCRIMED OS upgrade batch contract",
    args: ["scripts/scrimed-os-upgrade-batch-contract-check.mjs"]
  },
  {
    label: "SCRIMED module registry contract",
    args: ["scripts/scrimed-module-registry-contract-check.mjs"]
  },
  {
    label: "SCRIMED TrustOps Intelligence Layer contract",
    args: ["scripts/scrimed-trustops-contract-check.mjs"]
  },
  {
    label: "SCRIMED build roadmap contract",
    args: ["scripts/scrimed-build-roadmap-contract-check.mjs"]
  },
  {
    label: "SCRIMED CODE pt. 4 contract",
    args: ["scripts/scrimed-code-pt-4-contract-check.mjs"]
  },
  {
    label: "SCRIMED Compute Fabric contract",
    args: ["scripts/scrimed-compute-fabric-contract-check.mjs"]
  },
  {
    label: "SCRIMED Compute Fabric migration preflight contract",
    args: ["scripts/compute-fabric-migration-preflight-contract-check.mjs"]
  },
  {
    label: "SCRIMED Cyber Defense contract",
    args: ["scripts/scrimed-cyber-defense-contract-check.mjs"]
  },
  {
    label: "SCRIMED Security Diligence Evidence contract",
    args: ["scripts/scrimed-security-diligence-evidence-contract-check.mjs"]
  },
  {
    label: "SCRIMED Security Assurance contract",
    args: ["scripts/scrimed-security-assurance-contract-check.mjs"]
  },
  {
    label: "SCRIMED Security Release Readiness contract",
    args: ["scripts/scrimed-security-release-readiness-contract-check.mjs"]
  },
  {
    label: "SCRIMED release candidate readiness contract",
    args: ["scripts/release-candidate-readiness-contract-check.mjs"]
  },
  {
    label: "SCRIMED dynamic context injection contract",
    args: ["scripts/scrimed-context-injection-contract-check.mjs"]
  },
  {
    label: "SCRIMED Enterprise Acceleration contract",
    args: ["scripts/scrimed-enterprise-acceleration-contract-check.mjs"]
  },
  {
    label: "SCRIMED Global Enterprise Command contract",
    args: ["scripts/global-enterprise-command-contract-check.mjs"]
  },
  {
    label: "SCRIMED Strategic Problem Resolution contract",
    args: ["scripts/strategic-problem-resolution-contract-check.mjs"]
  },
  {
    label: "SCRIMED Healthcare Optimization Command contract",
    args: ["scripts/healthcare-optimization-command-contract-check.mjs"]
  },
  {
    label: "SCRIMED Healthcare Value Realization contract",
    args: ["scripts/healthcare-value-realization-contract-check.mjs"]
  },
  {
    label: "SCRIMED Pilot Value Evidence contract",
    args: ["scripts/pilot-value-evidence-contract-check.mjs"]
  },
  {
    label: "SCRIMED Pilot Activation Planner contract",
    args: ["scripts/pilot-activation-planner-contract-check.mjs"]
  },
  {
    label: "SCRIMED Pilot Handoff Command contract",
    args: ["scripts/pilot-handoff-command-contract-check.mjs"]
  },
  {
    label: "SCRIMED Pilot Success Review Command contract",
    args: ["scripts/pilot-success-review-command-contract-check.mjs"]
  },
  {
    label: "SCRIMED Governance Learning Loop contract",
    args: ["scripts/scrimed-governance-learning-loop-contract-check.mjs"]
  },
  {
    label: "SCRIMED Guided Execution contract",
    args: ["scripts/scrimed-guided-execution-contract-check.mjs"]
  },
  {
    label: "SCRIMED Proof Packet Share Readiness policy",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/proof-packet-share-readiness-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED Proof Packet Studio contract",
    args: ["scripts/scrimed-proof-packet-studio-contract-check.mjs"]
  },
  {
    label: "SCRIMED Intelligence Platform contract",
    args: ["scripts/scrimed-intelligence-platform-contract-check.mjs"]
  },
  {
    label: "SCRIMED Intelligence & Safety Stack contract",
    args: ["scripts/scrimed-intelligence-safety-stack-contract-check.mjs"]
  },
  {
    label: "SCRIMED strategic execution contract",
    args: ["scripts/scrimed-strategic-execution-contract-check.mjs"]
  },
  {
    label: "SCRIMED upgrade implementation plan contract",
    args: ["scripts/scrimed-upgrade-implementation-plan-contract-check.mjs"]
  },
  {
    label: "SCRIMED Work contract",
    args: ["scripts/scrimed-work-contract-check.mjs"]
  },
  {
    label: "SCRIMED Work lifecycle policy behavior",
    args: ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "scripts/scrimed-work-lifecycle-policy-test.mjs"]
  },
  {
    label: "SCRIMED Work artifact review policy behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-work-artifact-review-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED Work reviewer queue policy behavior",
    args: ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "scripts/scrimed-work-review-queue-policy-test.mjs"]
  },
  {
    label: "SCRIMED Work completion queue policy behavior",
    args: ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "scripts/scrimed-work-completion-queue-policy-test.mjs"]
  },
  {
    label: "SCRIMED Work completion evidence policy behavior",
    args: ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "scripts/scrimed-work-completion-evidence-policy-test.mjs"]
  },
  {
    label: "SCRIMED Work release-bound canary attestation policy behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-work-canary-attestation-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED Work browser mutation CSRF policy behavior",
    args: ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "scripts/scrimed-work-csrf-policy-test.mjs"]
  },
  {
    label: "SCRIMED Work actor and tenant mutation rate-limit policy behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-work-rate-limit-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED Work migration-set policy behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-work-migration-set-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED Work independent review preparation policy behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-work-review-preparation-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED Work two-identity AAL2 policy behavior",
    args: ["scripts/scrimed-work-two-identity-policy-test.mjs"]
  },
  {
    label: "SCRIMED Work production-hardening policy behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-work-production-hardening-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED Work preflight policy behavior",
    args: ["scripts/scrimed-work-preflight-policy-test.mjs"]
  },
  {
    label: "SCRIMED Work browser verification policy behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-work-browser-verification-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED Intelligence Control Plane contract",
    args: ["scripts/scrimed-control-plane-contract-check.mjs"]
  },
  {
    label: "SCRIMED platform strategy policy behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-platform-strategy-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED platform graph policy behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-platform-graph-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED strategic decision intelligence policy behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-strategic-decision-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED platform strategy artifact integrity",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-platform-strategy-artifacts.mjs",
      "--check"
    ]
  },
  {
    label: "SCRIMED Work durable-store preflight",
    args: ["scripts/scrimed-work-durable-store-preflight.mjs"]
  },
  {
    label: "SCRIMED operating command contract",
    args: ["scripts/scrimed-operating-command-contract-check.mjs"]
  },
  {
    label: "SCRIMED Automation Autopilot contract",
    args: ["scripts/scrimed-automation-autopilot-contract-check.mjs"]
  },
  {
    label: "SCRIMED stored-vector RPC contract",
    args: ["scripts/scrimed-stored-vector-rpc-contract-check.mjs"]
  },
  {
    label: "Supabase advisor remediation contract",
    args: ["scripts/supabase-advisor-remediation-contract-check.mjs"]
  },
  {
    label: "limitations/workaround blocker contract",
    args: ["scripts/limitations-workaround-contract-check.mjs"]
  },
  {
    label: "boundary release approval matrix contract",
    args: ["scripts/boundary-release-approval-matrix-contract-check.mjs"]
  },
  {
    label: "deployment drift guard contract",
    args: ["scripts/deployment-drift-guard-contract-check.mjs"]
  },
  {
    label: "boundary release evidence intake contract",
    args: ["scripts/boundary-release-evidence-intake-contract-check.mjs"]
  },
  {
    label: "omega platform audit contract",
    args: ["scripts/omega-platform-audit-contract-check.mjs"]
  },
  {
    label: "sales demo QA token policy",
    args: ["scripts/sales-demo-session-qa-token-policy-selftest.mjs"]
  },
  {
    label: "SCRIMED enterprise gap-closure policy behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-enterprise-gap-closure-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED enterprise gap-closure contract",
    args: ["scripts/scrimed-enterprise-gap-closure-contract-check.mjs"]
  },
  {
    label: "SCRIMED p.33 integrated policy behavior",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-p33-integrated-policy-test.mjs"
    ]
  },
  {
    label: "SCRIMED p.33 integrated contract",
    args: ["scripts/scrimed-p33-integrated-contract-check.mjs"]
  },
  {
    label: "SCRIMED p.33 artifact integrity",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/scrimed-p33-artifacts.mjs",
      "--check"
    ]
  },
  {
    label: "Vercel preview evidence verifier policy",
    args: ["scripts/verify-vercel-preview.mjs", "--self-test"]
  },
  {
    label: "Supabase repository security assurance",
    args: ["scripts/verify-supabase-security.mjs", "--strict"]
  },
  {
    label: "Supabase RLS contract",
    args: ["tests/security/supabase-rls-contract.test.mjs"]
  },
  {
    label: "design-system artifact integrity",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/design-system-artifacts.mjs",
      "--check"
    ]
  },
  {
    label: "investor demo rehearsal gate",
    args: [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader=./scripts/lib/ts-extension-loader.mjs",
      "scripts/rehearse-investor-demo.mjs",
      "--self-test"
    ]
  }
];

for (const check of checks) {
  console.log(`run ${check.label}`);
  const result = spawnSync(process.execPath, check.args, {
    env: {
      ...process.env,
      SCRIMED_BEARER_TOKEN: "",
      SCRIMED_REVIEWER_BEARER_TOKEN: "",
      SCRIMED_SALES_QA_BEARER_TOKEN: "",
      SCRIMED_SUPABASE_SESSION_JSON: "",
      SCRIMED_REVIEWER_SUPABASE_SESSION_JSON: ""
    },
    stdio: "inherit"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("pass SCRIMED non-secret test suite");
