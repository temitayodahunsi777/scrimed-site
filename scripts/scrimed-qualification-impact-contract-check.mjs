#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/scrimed-work/agentTeams.ts",
  "app/lib/scrimed-work/modelQualification.ts",
  "app/lib/scrimed-work/impactGovernance.ts",
  "app/lib/scrimed-work/index.ts",
  "app/api/scrimed-work/agents/route.ts",
  "app/api/scrimed-work/providers/route.ts",
  "app/scrimed-work/page.tsx",
  "docs/MODEL_AND_AGENT_APPROVAL_PASSPORT.md",
  "docs/MODEL_VENDOR_CONTINUITY_PLAN.md",
  "docs/HEALTHCARE_PROSPERITY_CHARTER.md",
  "docs/WORKFORCE_TRANSITION_STANDARD.md",
  "docs/PUBLIC_BENEFIT_AND_PROCUREMENT_FRAMEWORK.md",
  "docs/SUPABASE_SECURITY_OPERATOR_PACKET.md",
  "docs/WIX_PHASE_2_FULL_SITE_REMEDIATION.md",
  "docs/MIGRATION_DRY_RUN_REPORT.md",
  "docs/review-packets/README.md",
  "scripts/scrimed-qualification-impact-policy-test.mjs",
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "package.json"
];

const files = Object.fromEntries(
  await Promise.all(requiredFiles.map(async (path) => [path, await readFile(path, "utf8")]))
);

function requireIncludes(path, expected) {
  if (!files[path].includes(expected)) {
    throw new Error(`${path} is missing qualification/impact contract text: ${expected}`);
  }
}

for (const expected of [
  "createAgentTeamTemplate",
  "scrimedAgentTeamTemplates",
  "mayApproveOwnOutput: false",
  "consequentialOutputRequiresIndependentReview: true",
  'unresolvedConflictAction: "escalate-to-human"',
  "externalExecutionAllowed: false",
  "clinicalAuthorityGranted: false",
  "releaseAuthorityGranted: false"
]) {
  requireIncludes("app/lib/scrimed-work/agentTeams.ts", expected);
}

for (const expected of [
  "createModelAgentApprovalPassport",
  "claudeOpus5UnverifiedCandidate",
  "verifiedModelId: null",
  "featureEnabled: false",
  "providerCallsAllowed: false",
  "routeModelEvaluationEffort",
  "max-effort-requires-explicit-human-approval",
  "clinicalAuthorityGranted: false"
]) {
  requireIncludes("app/lib/scrimed-work/modelQualification.ts", expected);
}

for (const expected of [
  "calculateVerifiedIntelligenceYield",
  "calculateHealthcareValueReturned",
  "evaluateWorkforceTransitionProposal",
  "evaluateProcurementReadiness",
  "publicRoiClaimAllowed: false",
  "employmentActionAuthorized: false",
  "procurementApprovalGranted: false",
  "productionActivationAllowed: false"
]) {
  requireIncludes("app/lib/scrimed-work/impactGovernance.ts", expected);
}

for (const expected of [
  'export * from "./agentTeams"',
  'export * from "./modelQualification"',
  'export * from "./impactGovernance"',
  "agentTeams,",
  "modelQualification,",
  "impactGovernance"
]) {
  requireIncludes("app/lib/scrimed-work/index.ts", expected);
}

requireIncludes("app/api/scrimed-work/agents/route.ts", "getScrimedAgentTeamSummary");
requireIncludes("app/api/scrimed-work/providers/route.ts", "getScrimedModelQualificationSummary");
for (const expected of [
  "Qualification + Impact Governance",
  "Verified Intelligence Yield",
  "Sovereign profile"
]) {
  requireIncludes("app/scrimed-work/page.tsx", expected);
}

requireIncludes(
  "docs/MODEL_AND_AGENT_APPROVAL_PASSPORT.md",
  "Public leaderboards, vendor marketing, fluency, or model family names never grant authority."
);
requireIncludes(
  "docs/MODEL_VENDOR_CONTINUITY_PLAN.md",
  "No provider is currently authorized by this document for PHI"
);
requireIncludes(
  "docs/HEALTHCARE_PROSPERITY_CHARTER.md",
  "financial results, production ROI, customer outcomes"
);
requireIncludes(
  "docs/WORKFORCE_TRANSITION_STANDARD.md",
  "employment authority decision"
);
requireIncludes(
  "docs/PUBLIC_BENEFIT_AND_PROCUREMENT_FRAMEWORK.md",
  "Passing the metadata check does not approve procurement"
);

requireIncludes("docs/SUPABASE_SECURITY_OPERATOR_PACKET.md", "OPERATOR_REQUIRED");
requireIncludes("docs/WIX_PHASE_2_FULL_SITE_REMEDIATION.md", "public-claims-evidence-unavailable");
requireIncludes("docs/MIGRATION_DRY_RUN_REPORT.md", "READY FOR DISPOSABLE DRY-RUN");
requireIncludes("docs/review-packets/README.md", "least-disclosure");

for (const script of [
  "test:scrimed-qualification-impact",
  "contract:scrimed-qualification-impact"
]) {
  requireIncludes("package.json", `"${script}"`);
}

for (const expected of [
  "SCRIMED model, agent, and impact qualification policy behavior",
  "SCRIMED model, agent, and impact qualification repository contract"
]) {
  requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", expected);
}

console.log(
  "pass SCRIMED qualification and impact repository contract (3 modules, 9 operator/governance documents)"
);
