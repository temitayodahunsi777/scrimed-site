#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "config/review-requirements.json",
  "app/lib/scrimed-work/reviewPolicyEngine.ts",
  "app/lib/scrimed-work/assuranceManifest.ts",
  "app/lib/scrimed-work/controlAttestations.ts",
  "app/lib/scrimed-work/reviewConfidence.ts",
  "app/lib/scrimed-work/founderInterimAcceptance.ts",
  "app/lib/faithCorePolicy.ts",
  "app/components/PreproductionDisclosure.tsx",
  "app/components/OperatingModeBanner.tsx",
  "app/layout.tsx",
  "scripts/preproduction-assurance-policy-test.mjs",
  "scripts/faithcore-neutrality-policy-test.mjs",
  "scripts/generate-preproduction-assurance.mjs",
  "scripts/verify-migration-dry-run.mjs",
  "scripts/verify-live-mobile.mjs",
  ".github/workflows/migration-dry-run.yml",
  ".github/workflows/preview-validation.yml",
  ".github/workflows/dependency-security.yml",
  "docs/assurance/ASSURANCE_MANIFEST_GUIDE.md",
  "docs/release/CURRENT_CANDIDATE_BASELINE.md",
  "docs/governance/MINIMUM_DECISIONS_REQUIRED.md",
  "docs/release/PREEXISTING_SCRIPT_ATTRIBUTION_DECISION.md",
  "docs/operators/WIX_FAITHCORE_FINAL_ACTION.md",
  "docs/operators/WIX_FINAL_EXECUTION_PACKET.md",
  "docs/operators/SUPABASE_LEAKED_PASSWORD_PROTECTION.md",
  "docs/operators/MOBILE_VERIFICATION_RUNBOOK.md",
  "docs/database/MIGRATION_DRY_RUN_CI_GUIDE.md",
  "docs/security/DEPENDENCY_SECURITY_CI_GUIDE.md"
];

for (const path of requiredFiles) {
  if (!existsSync(path)) throw new Error(`Missing preproduction assurance artifact: ${path}`);
}

function requireText(path, values) {
  const content = readFileSync(path, "utf8");
  for (const value of values) {
    if (!content.includes(value)) throw new Error(`${path} missing assurance contract: ${value}`);
  }
}

requireText("app/lib/scrimed-work/reviewPolicyEngine.ts", [
  "PERMITTED_AUTOMATICALLY",
  "FOUNDER_INTERIM_ACCEPTANCE_REQUIRED",
  "TARGETED_QUALIFIED_REVIEW_REQUIRED",
  "PRODUCTION_ACTIVATION_APPROVAL_REQUIRED",
  "environmentVariableBypassAllowed: false",
  "REQUIRED_QUALIFIED_APPROVAL_MISSING"
]);
requireText("app/lib/scrimed-work/assuranceManifest.ts", [
  "evidence refers to a different source candidate",
  "preproductionPackagingAllowed",
  "productionAuthorityGranted: false"
]);
requireText("app/lib/scrimed-work/founderInterimAcceptance.ts", [
  "I authorize this exact candidate for bounded, synthetic-only, pre-production activity.",
  "Founder interim acceptance is unsigned",
  "ACCEPTANCE_INVALIDATING_CHANGE"
]);
requireText("app/lib/scrimed-work/reviewOrchestrator.ts", [
  "AI-assisted review cannot impersonate or satisfy accountable human approval",
  "finance-cost-controls"
]);
requireText("app/components/PreproductionDisclosure.tsx", [
  "not authorized for live clinical use",
  "PHI processing",
  "autonomous healthcare decisions"
]);
requireText("app/components/OperatingModeBanner.tsx", ["PreproductionDisclosure"]);
requireText("app/layout.tsx", ["OperatingModeBanner"]);
requireText("app/lib/faithCorePolicy.ts", [
  "FaithCore — Optional Faith-Aligned Experience",
  "explicit-opt-in-required",
  "clinical-influence-prohibited",
  "clinicalDecisionAuthority: false",
  "operationalDecisionAuthority: false"
]);
requireText("scripts/generate-preproduction-assurance.mjs", [
  "PASS_SAFE_BOUNDARY_ENFORCED",
  "OPERATOR_ACTION_REQUIRED",
  "PRODUCTION_AUTHORIZATION_REQUIRED",
  "productionAuthorityGranted: false"
]);
requireText("scripts/verify-live-mobile.mjs", [
  "SCRIMED_PLAYWRIGHT_EXECUTABLE_PATH",
  "absolute Chrome/Chromium path",
  "...(executablePath ? { executablePath } : {})",
  "BLOCKED_ENVIRONMENT",
  "browser-launch-failed"
]);
requireText("package.json", [
  "test:preproduction-assurance",
  "contract:preproduction-assurance",
  "evidence:preproduction-assurance",
  "test:migration-dry-run-verifier",
  "test:live-mobile-verifier",
  "test:faithcore-neutrality"
]);

console.log(`pass SCRIMED preproduction assurance repository contract (${requiredFiles.length} artifacts)`);
