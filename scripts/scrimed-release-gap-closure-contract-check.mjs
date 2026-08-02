#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "app/lib/scrimed-work/reviewOrchestrator.ts",
  "scripts/scrimed-review-orchestrator-policy-test.mjs",
  "scripts/disposable-migration-preflight.mjs",
  "scripts/verify-wix-production.mjs",
  "scripts/verify-preview-ui.mjs",
  "docs/governance/FOUNDER_LED_PREPRODUCTION_REVIEW_POLICY.md",
  "docs/governance/FOUNDER_INTERIM_ACCEPTANCE_FORM.md",
  "docs/governance/GATE_CLOSURE_REGISTER.md",
  "docs/governance/FOUNDER_DECISIONS_REQUIRED.md",
  "docs/release/WORKTREE_ATTRIBUTION_REPORT.md",
  "docs/release/PROPOSED_COMMIT_MANIFEST.md",
  "docs/release/PREVIEW_DEPLOYMENT_OPERATOR_PACKET.md",
  "docs/models/UNVERIFIED_MODEL_ADMISSION_RUNBOOK.md",
  "docs/database/MIGRATION_DRY_RUN_REPORT.md",
  "docs/operators/SUPABASE_SECURITY_OPERATOR_PACKET.md",
  "docs/operators/WIX_FULL_SITE_EXECUTION_PACKET.md",
  "docs/operators/WIX_REMOTE_VERIFICATION_RUNBOOK.md",
  "docs/security/EXTERNAL_DEPENDENCY_ADVISORY_RUNBOOK.md",
  "docs/review-packets/adversarial/REQUIREMENT_COMPLETENESS_REVIEW.md",
  "docs/review-packets/adversarial/SECURITY_AND_SAFETY_REVIEW.md",
  "docs/review-packets/adversarial/OPERATIONAL_COHERENCE_REVIEW.md",
  "docs/review-packets/adversarial/CROSS_REVIEW_CONFLICT_REPORT.md",
  "docs/review-packets/FINANCE_AND_COST_CONTROL_REVIEW.md",
  "docs/human-review/FOUNDER_SIGNOFF_PACKET.md",
  "docs/human-review/PRINCIPAL_ENGINEER_SIGNOFF_PACKET.md",
  "docs/human-review/SECURITY_REVIEWER_SIGNOFF_PACKET.md",
  "docs/human-review/PRIVACY_REVIEWER_SIGNOFF_PACKET.md",
  "docs/human-review/CLINICAL_SAFETY_REVIEWER_SIGNOFF_PACKET.md",
  "docs/human-review/LEGAL_CLAIMS_REVIEWER_SIGNOFF_PACKET.md",
  "docs/human-review/DATABASE_OWNER_SIGNOFF_PACKET.md",
  "docs/human-review/FINANCE_REVIEWER_SIGNOFF_PACKET.md",
  "docs/human-review/RELEASE_STEWARD_SIGNOFF_PACKET.md"
];

for (const pathname of requiredFiles) {
  if (!existsSync(pathname)) throw new Error(`Missing release gap-closure artifact: ${pathname}`);
}

function requireText(pathname, values) {
  const content = readFileSync(pathname, "utf8");
  for (const value of values) {
    if (!content.includes(value)) {
      throw new Error(`${pathname} missing gap-closure contract: ${value}`);
    }
  }
}

requireText("app/lib/scrimed-work/reviewOrchestrator.ts", [
  "scrimed-independent-review-orchestrator-v1-2026-08-01",
  "finance-cost-controls",
  "AI REVIEW PASS WITH CONDITIONS",
  "AI-assisted review cannot impersonate or satisfy accountable human approval",
  "review-packet-hash-mismatch",
  "candidate-fingerprint-mismatch",
  "required-review-lane-missing",
  "productionAuthorityGranted: false"
]);
requireText("app/lib/scrimed-work/agentTeams.ts", [
  "costCeilingUsd",
  "runtimeCeilingMs",
  "actionCeiling",
  "networkAllowlist",
  "data-only-never-instructions",
  "outputLaunderingBlocked"
]);
requireText("app/lib/scrimed-work/modelQualification.ts", [
  "awaiting_verified_model_id",
  "environment-flag-cannot-bypass-model-admission",
  "budget-exhausted",
  "qualified-fallback-evaluation",
  "fallback-loop-detected"
]);
requireText("scripts/disposable-migration-preflight.mjs", [
  "SCRIMED_DISPOSABLE_MIGRATION_AUTHORIZATION",
  "[\"db\", \"reset\", \"--local\", \"--no-seed\"]",
  "productionConnectionAllowed: false",
  "productionMigrationAuthorized: false"
]);
requireText("scripts/verify-preview-ui.mjs", [
  "mobile-390",
  "horizontal-overflow",
  "public-form-no-phi-warning",
  "playwright"
]);
requireText("docs/governance/FOUNDER_LED_PREPRODUCTION_REVIEW_POLICY.md", [
  "Founder interim acceptance for pre-production development only.",
  "AI-assisted review may prepare evidence but cannot satisfy those gates"
]);
requireText("docs/database/MIGRATION_DRY_RUN_REPORT.md", [
  "BLOCKED — ENVIRONMENT UNAVAILABLE",
  "no migration was applied",
  "Production application requires a separate named database-owner approval"
]);
requireText("docs/operators/SUPABASE_SECURITY_OPERATOR_PACKET.md", [
  "auth_leaked_password_protection",
  "OPERATOR REQUIRED"
]);
requireText("docs/operators/WIX_REMOTE_VERIFICATION_RUNBOOK.md", [
  "npm run verify:wix-production",
  "does not submit forms or mutate Wix"
]);
requireText("docs/release/PREVIEW_DEPLOYMENT_OPERATOR_PACKET.md", [
  "No preview was deployed",
  "390px"
]);

for (const pathname of requiredFiles.filter((path) => path.startsWith("docs/human-review/"))) {
  requireText(pathname, [
    "Candidate fingerprint",
    "Recommended disposition",
    "Approval text",
    "Rejection text",
    "Expiry",
    "Qualification",
    "Reviewer name: __________ Signature: __________ Date: __________"
  ]);
}

requireText("package.json", [
  "test:scrimed-review-orchestrator",
  "test:disposable-migration-preflight",
  "verify:migrations:disposable",
  "test:wix-production-verifier",
  "verify:wix-production",
  "test:preview-ui",
  "verify:preview-ui",
  "contract:scrimed-release-gap-closure"
]);

console.log(
  `pass SCRIMED release gap-closure contract (${requiredFiles.length} artifacts, 12 review lanes)`
);
