#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const files = {
  registry: "app/lib/clinicalDataGovernance.ts",
  route: "app/api/clinical-data-governance/route.ts",
  briefRoute: "app/api/clinical-data-governance/brief/route.ts",
  os: "app/lib/healthcareIntelligenceOS.ts",
  page: "app/healthcare-intelligence-os/page.tsx",
  hub: "app/lib/scrimedHub.ts",
  navigation: "app/lib/navigationAudit.ts",
  docs: "docs/clinical-data-governance.md",
  healthcareDocs: "docs/healthcare-intelligence-os.md",
  architectureDocs: "docs/architecture.md",
  readme: "README.md",
  packageJson: "package.json",
  nonsecretSuite: "scripts/scrimed-nonsecret-test-suite.mjs"
};

async function read(path) {
  return readFile(path, "utf8");
}

function requireIncludes(label, text, expected) {
  const missing = expected.filter((value) => !text.includes(value));

  if (missing.length > 0) {
    throw new Error(`${label} missing required text: ${missing.join(", ")}`);
  }
}

function requireNotIncludes(label, text, forbidden) {
  const found = forbidden.filter((value) => text.includes(value));

  if (found.length > 0) {
    throw new Error(`${label} contains forbidden text: ${found.join(", ")}`);
  }
}

const contents = Object.fromEntries(
  await Promise.all(Object.entries(files).map(async ([key, path]) => [key, await read(path)]))
);

requireIncludes("clinical data governance registry", contents.registry, [
  "ClinicalDataGovernanceRequest",
  "ClinicalDataGovernanceDecision",
  "clinical-data-governance-policy-engine-ready-no-phi",
  "scrimed-clinical-data-governance-v2026-07-03",
  "/healthcare-intelligence-os#clinical-data-governance",
  "/api/clinical-data-governance",
  "/api/clinical-data-governance/brief",
  "metadata-and-policy-only-no-live-phi",
  "not-authorized-live-care",
  "not-production-connector-approved",
  "recordMutationAuthority",
  "patientOutreachAuthority",
  "payerSubmissionAuthority",
  "externalModelPhiAuthority",
  "public-api-no-sensitive-data",
  "live-phi-not-enabled",
  "minimum-necessary-required",
  "tenant-scope-required",
  "external-model-no-phi",
  "human-review-for-deidentified-or-limited-data",
  "record-mutation-disabled",
  "payer-submission-disabled",
  "patient-contact-disabled",
  "connector-activation-disabled",
  "autonomous-clinical-authority-disabled",
  "customer-go-live-disabled",
  "evaluateClinicalDataGovernanceRequest",
  "isClinicalDataGovernanceRequest",
  "live PHI processing is not authorized",
  "external model PHI processing is not authorized",
  "autonomous diagnosis is not authorized",
  "metadata-only",
  "deidentified-or-aggregate",
  "live-data-risk"
]);

requireNotIncludes("clinical data governance registry", contents.registry, [
  "service_role",
  "SCRIMED_BEARER_TOKEN",
  "sk-proj-",
  "sk_live_",
  "Authorization: Bearer"
]);

requireIncludes("clinical data governance API route", contents.route, [
  "GET()",
  "POST(request: Request)",
  "evaluateClinicalDataGovernanceRequest",
  "isClinicalDataGovernanceRequest",
  "invalid-governance-request",
  "X-SCRIMED-Clinical-Data-Governance",
  "X-SCRIMED-Data-Boundary",
  "X-SCRIMED-Record-Mutation",
  "X-SCRIMED-Patient-Outreach",
  "X-SCRIMED-Payer-Submission",
  "X-SCRIMED-External-Model-PHI",
  "private, no-store"
]);

requireIncludes("clinical data governance brief route", contents.briefRoute, [
  "buildClinicalDataGovernanceBrief",
  "scrimed-clinical-data-governance.md",
  "text/markdown",
  "X-SCRIMED-Clinical-Data-Governance"
]);

requireIncludes("healthcare intelligence OS integration", contents.os, [
  "getClinicalDataGovernanceSummary",
  "clinicalDataGovernance",
  "policyRuleCount",
  "baselineEvaluationCount",
  "Clinical Data Governance",
  "Clinical Data Governance API",
  "Clinical Data Governance Brief"
]);

requireIncludes("healthcare intelligence OS page integration", contents.page, [
  "summary.clinicalDataGovernance",
  "id=\"clinical-data-governance\"",
  "Clinical Data Governance",
  "/api/clinical-data-governance"
]);

requireIncludes("hub route registry", contents.hub, [
  "clinicalDataGovernanceRoute",
  "clinicalDataGovernanceApiRoute",
  "clinicalDataGovernanceBriefRoute"
]);

requireIncludes("navigation audit", contents.navigation, [
  "expectedApiRoutePatternCount = 453"
]);

requireIncludes("clinical data governance docs", contents.docs, [
  "SCRIMED Clinical Data Governance",
  "/api/clinical-data-governance",
  "/api/clinical-data-governance/brief",
  "Policy Inputs",
  "Hard Stops",
  "Relationship To Clinical Data Fabric",
  "Clinical Data Fabric contract -> Clinical Data Governance decision -> TrustOS review state"
]);

requireIncludes("healthcare intelligence docs", contents.healthcareDocs, [
  "Clinical Data Governance API",
  "Clinical Data Governance Brief",
  "docs/clinical-data-governance.md"
]);

requireIncludes("architecture docs", contents.architectureDocs, [
  "Clinical Data Governance policy engine",
  "/api/clinical-data-governance",
  "/api/clinical-data-governance/brief"
]);

requireIncludes("readme", contents.readme, [
  "Clinical Data Governance boundary",
  "/api/clinical-data-governance",
  "/api/clinical-data-governance/brief"
]);

requireIncludes("package scripts", contents.packageJson, [
  "\"smoke:clinical-data-governance\": \"node scripts/clinical-data-governance-contract-check.mjs\""
]);

requireIncludes("nonsecret suite", contents.nonsecretSuite, [
  "clinical data governance contract",
  "scripts/clinical-data-governance-contract-check.mjs"
]);

console.log("pass clinical data governance contract");
