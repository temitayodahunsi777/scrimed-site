#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const checks = [
  {
    label: "generated integrity",
    args: ["scripts/check-generated-integrity.mjs"]
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
    label: "CI workflow contract",
    args: ["scripts/ci-workflow-contract-check.mjs"]
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
    label: "design governance contract",
    args: ["scripts/design-governance-contract-check.mjs"]
  },
  {
    label: "public-claims integrity contract",
    args: ["scripts/public-claims-integrity-contract-check.mjs"]
  },
  {
    label: "public-claims integrity policy self-test",
    args: ["scripts/public-claims-integrity-smoke.mjs", "--self-test"]
  },
  {
    label: "dependency security floor contract",
    args: ["scripts/dependency-security-floor-contract-check.mjs"]
  },
  {
    label: "AAL2 bearer-token policy",
    args: ["scripts/aal2-token-policy-selftest.mjs"]
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
    label: "Documentation-Before-Authorization contract",
    args: ["scripts/documentation-before-authorization-contract-check.mjs"]
  },
  {
    label: "Strategic investor outreach contract",
    args: ["scripts/strategic-investor-outreach-contract-check.mjs"]
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
    label: "Pilot Demo Commercial Readiness contract",
    args: ["scripts/pilot-demo-commercial-readiness-contract-check.mjs"]
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
    label: "SCRIMED Work independent review preparation policy behavior",
    args: ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "scripts/scrimed-work-review-preparation-policy-test.mjs"]
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
