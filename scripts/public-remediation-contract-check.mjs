#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "config/public-claims-policy.json",
  "config/wix-publication-policy.json",
  "config/pending-migration-authorization.json",
  ".env.example",
  "app/lib/companyIdentity.ts",
  "app/lib/operatingMode.ts",
  "app/lib/legalPolicies.ts",
  "app/lib/validationEvidence.ts",
  "app/lib/publicReleaseDiagnostics.ts",
  "app/components/OperatingModeBanner.tsx",
  "app/validation-evidence/page.tsx",
  "app/legal/page.tsx",
  "app/legal/[slug]/page.tsx",
  "app/api/operating-mode/route.ts",
  "app/api/public-release-status/route.ts",
  "app/api/validation-evidence/route.ts",
  "app/sitemap.ts",
  "app/robots.ts",
  "scripts/public-remediation-policy-test.mjs",
  "scripts/pending-migration-authorization-check.mjs",
  "scripts/verify-public-release.mjs",
  "scripts/wix-publication-verification.mjs",
  "scripts/wix-publication-verification-contract-check.mjs",
  "docs/CEO_APPROVED_REMEDIATION_PLAN.md",
  "docs/LEGAL_COUNSEL_REVIEW_REQUIRED.md",
  "docs/REGULATORY_INTENDED_USE_REGISTER.md",
  "docs/SECURITY_AND_EXECUTION_GATES.md",
  "docs/PUBLIC_CLAIMS_REGISTER.md",
  "docs/EXTERNAL_SYSTEM_ACTIONS_REQUIRED.md",
  "docs/RELEASE_VERIFICATION_CHECKLIST.md",
  "docs/CEO_AND_COUNSEL_DECISIONS_REQUIRED.md",
  "docs/PENDING_MIGRATION_AUTHORIZATION_PACKET.md",
  "docs/REMEDIATION_CANDIDATE_COMMIT_MANIFEST.md",
  "docs/REMEDIATION_DEPLOYMENT_AUTHORIZATION_PACKAGE.md",
  "docs/SUPABASE_SECURITY_OPERATOR_CHECKLIST.md",
  "docs/WIX_METADATA_IMPLEMENTATION_CHECKLIST.md",
  "docs/WIX_OPERATOR_EXECUTION_PACKET.md",
  "docs/WIX_PUBLICATION_VERIFICATION_REPORT.md"
];

for (const pathname of requiredFiles) {
  if (!existsSync(pathname)) throw new Error(`Missing public-remediation artifact: ${pathname}`);
}

function requireIncludes(pathname, values) {
  const content = readFileSync(pathname, "utf8");
  for (const value of values) {
    if (!content.includes(value)) {
      throw new Error(`${pathname} missing public-remediation contract: ${value}`);
    }
  }
}

requireIncludes("app/lib/operatingMode.ts", [
  "syntheticOnly: true",
  "allowPHI: false",
  "liveClinicalExecution: false",
  "productionEHRConnections: false",
  "medicalDeviceConnections: false",
  "emergencyMonitoring: false",
  "autonomousTreatmentActions: false",
  "autonomousEligibilityDecisions: false",
  "autonomousPayerDecisions: false",
  "faithAffectsClinicalLogic: false",
  "Invalid boolean value"
]);
requireIncludes(".env.example", [
  "SCRIMED_SYNTHETIC_ONLY=true",
  "SCRIMED_ALLOW_PHI=false",
  "SCRIMED_LIVE_CLINICAL_EXECUTION=false",
  "SCRIMED_MEDICAL_DEVICE_CONNECTIONS=false",
  "SCRIMED_FAITH_AFFECTS_CLINICAL_LOGIC=false"
]);
requireIncludes("app/page.tsx", [
  "export const metadata",
  "canonical: applicationUrl(\"/\")",
  "url: applicationUrl(\"/\")",
  "Atlas-first healthcare intelligence",
  "Building with clinicians, health systems, and innovators.",
  "Illustrative engagement paths",
  "Required public boundaries"
]);
requireIncludes("app/faithcore/page.tsx", [
  "FaithCore by SCRIMED | Optional Faith-Aligned Care Experience",
  "canonical: applicationUrl(\"/faithcore\")",
  "url: applicationUrl(\"/faithcore\")",
  "faithCoreNeutralityStatement",
  "optional, explicitly consented experience"
]);
requireIncludes("app/validation-evidence/page.tsx", [
  "canonical: applicationUrl(\"/validation-evidence\")",
  "url: applicationUrl(\"/validation-evidence\")"
]);
requireIncludes("app/legal/page.tsx", [
  "canonical: applicationUrl(\"/legal\")",
  "url: applicationUrl(\"/legal\")",
  "publicHealthcareDataBoundary"
]);
requireIncludes("scripts/verify-public-release.mjs", [
  "renderedBuildContracts",
  "crawlerBuildContracts",
  "rendered-canonical",
  "rendered-open-graph-url",
  "rendered-build-public-claims",
  "rendered artifacts"
]);
requireIncludes("app/lib/legalPolicies.ts", [
  "Interim policy draft",
  "Do not submit protected health information",
  "does not provide medical diagnosis",
  "AI-generated outputs may be incomplete",
  "contact emergency services immediately",
  "do not affect clinical recommendations"
]);
requireIncludes("app/api/pilot/intake/route.ts", [
  "evaluateOperatingModeAction",
  "public-business-intake",
  "enforceRequestRateLimit"
]);
requireIncludes("app/lib/pilotIntake.ts", [
  "Markup and executable content are not accepted.",
  "Remove patient-level or protected health information",
  "contactConsent"
]);
requireIncludes("app/lib/siteNavigation.ts", ["/validation-evidence", "/legal"]);
requireIncludes("package.json", [
  '"test:public-remediation-policy"',
  '"verify:public-release"',
  '"contract:public-remediation"'
]);
requireIncludes(".github/workflows/ci.yml", ["npm run verify:public-release"]);

console.log(`pass SCRIMED public-remediation contract check (${requiredFiles.length} artifacts verified)`);
