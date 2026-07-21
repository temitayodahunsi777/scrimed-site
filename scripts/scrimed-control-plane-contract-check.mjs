#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "SCRIMED_INTELLIGENCE_CONTROL_PLANE.md",
  "docs/scrimed-intelligence-control-plane-implementation.md",
  "docs/scrimed-intelligence-control-plane.md",
  "docs/scrimed-model-routing.md",
  "docs/scrimed-verification-governance.md",
  "docs/scrimed-consequence-bench.md",
  "docs/scrimed-capital-intelligence.md",
  "docs/scrimed-compute-resilience.md",
  "docs/scrimed-approval-achievement.md",
  "docs/scrimed-cross-platform-evidence.md",
  "docs/SCRIMED_INTENDED_USE_MEMO.md",
  "app/lib/scrimed-control-plane/types.ts",
  "app/lib/scrimed-control-plane/featureFlags.ts",
  "app/lib/scrimed-control-plane/registries.ts",
  "app/lib/scrimed-control-plane/contextFabric.ts",
  "app/lib/scrimed-control-plane/modelPolicy.ts",
  "app/lib/scrimed-control-plane/reasoningObservatory.ts",
  "app/lib/scrimed-control-plane/consequenceBench.ts",
  "app/lib/scrimed-control-plane/capitalIntelligence.ts",
  "app/lib/scrimed-control-plane/computeResilience.ts",
  "app/lib/scrimed-control-plane/outcomeIntelligence.ts",
  "app/lib/scrimed-control-plane/governance.ts",
  "app/lib/scrimed-control-plane/approvalAchievement.ts",
  "app/lib/scrimed-control-plane/platformEvidence.ts",
  "app/lib/scrimed-control-plane/index.ts",
  "app/api/scrimed-control-plane/[[...path]]/route.ts",
  "app/scrimed-control-plane/page.tsx",
  "app/lib/siteNavigation.ts",
  "app/lib/navigationAudit.ts",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "scripts/scrimed-control-plane-smoke.mjs"
];

const files = Object.fromEntries(
  await Promise.all(requiredFiles.map(async (path) => [path, await readFile(path, "utf8")]))
);

function requireIncludes(path, expected) {
  if (!files[path].includes(expected)) {
    throw new Error(`${path} missing SCRIMED control-plane contract: ${expected}`);
  }
}

function requireCombined(paths, expected) {
  const combined = paths.map((path) => files[path]).join("\n");
  if (!combined.includes(expected)) {
    throw new Error(`SCRIMED control-plane modules missing contract: ${expected}`);
  }
}

const domainFiles = requiredFiles.filter((path) => path.startsWith("app/lib/scrimed-control-plane/"));
for (const expected of [
  "capital-intelligence",
  "phi-prohibited",
  "execute-with-approval",
  "DefinitionOfDoneContract",
  "controlPlaneAgentRegistry",
  "controlPlaneSkillRegistry",
  "controlPlaneWorkflowRegistry",
  "controlPlaneSemanticRegistry",
  "controlPlaneProviderPolicyProfiles",
  "searchControlPlaneContext",
  "tenantIsolation: \"blocked-unregistered-tenant\"",
  "retrievedContentIsUntrustedData: true",
  "executableInstructionsAllowed: false",
  "SOL_CLASS",
  "TERRA_CLASS",
  "LUNA_CLASS",
  "Luna executes. Terra coordinates. Sol resolves.",
  "privacyDowngradeAllowed: false",
  "providerCallsExecuted: false",
  "calculateEffectiveCost",
  "modelEfficiencyFrontier",
  "calculateTrustScore",
  "mandatoryChecksPassed",
  "agentNarrativeAcceptedAsProof: false",
  "evaluateArtifactStaleness",
  "runConsequenceBench",
  "highConsequencePerformance",
  "worstGroupPerformance",
  "distributionShiftPerformance",
  "hiddenChainOfThoughtStored: false",
  "objectiveDriftFlags",
  "pause-and-require-human-review",
  "authorizeCapitalAction",
  "outboundAllowed: false",
  "requiredApprover: \"CEO\"",
  "calculateComputeResilienceScore",
  "silentProtectedWorkloadMigrationAllowed: false",
  "baseline: null",
  "postImplementation: null",
  "no-fabricated-improvements",
  "SCRIMED_CONSEQUENTIAL_ACTIONS_ENABLED: \"false\"",
  "SCRIMED_APPROVAL_ACHIEVEMENT_ENABLED: \"true\"",
  "SCRIMED_CROSS_PLATFORM_EVIDENCE_ENABLED: \"true\"",
  "getApprovalAchievementSummary",
  "achieved-automated-technical",
  "technicalGateAchieved",
  "canAutoPromote: automated",
  "externalAuthorityStillRequired: !automated",
  "humanOrExternalApprovalsAchieved: 0",
  "intended-use-internal-approval",
  "no-phi-protected-pilot-release",
  "hipaa-baa-phi-readiness",
  "soc2-independent-assurance",
  "fda-cds-device-classification",
  "onc-hti-connector-decision",
  "eu-ai-gdpr-regional-release",
  "uk-nhs-dtac-release",
  "australia-health-procurement-release",
  "faithcore-faith-health-pilot-governance",
  "buyer-specific-proof-release",
  "getCrossPlatformEvidenceSummary",
  "release-evidence-drift-blocks-promotion",
  "productionPromotionAllowed: false",
  "externalMutationsExecuted: records.some",
  "externalMutationPerformed: true",
  "Voice Intake Assistant form was disabled",
  "secretsStored: false",
  "rawProviderLogsStored: false",
  "productionAuthorityGranted: false",
  "automaticApprovalAllowed: false",
  "wix-public-claims-integrity",
  "supabase-data-plane-drift",
  "vercel-deployment-provenance",
  "github-release-provenance",
  "figma-design-governance",
  "remediationStatus",
  "preparedRemediationCount",
  "fullyResolvedProviderCount: 0"
]) {
  requireCombined(domainFiles, expected);
}

const routePath = "app/api/scrimed-control-plane/[[...path]]/route.ts";
for (const endpoint of [
  "brief",
  "sessions",
  "agents",
  "skills",
  "workflows",
  "providers",
  "route-model",
  "context/search",
  "artifacts",
  "benchmarks/run",
  "voice/simulate",
  "compute-resilience",
  "capital-intelligence",
  "outcomes",
  "approvals",
  "platform-evidence",
  "plan",
  "run",
  "pause",
  "resume",
  "cancel",
  "verify",
  "approve",
  "reject"
]) {
  requireIncludes(routePath, endpoint);
}

for (const expected of [
  "buildWriteAuthorizationDecision",
  "guardedCreateSession",
  "guardedCreateArtifact",
  "guardedTransitionSession",
  "containsTokenLikeField",
  "containsPhiRisk",
  "fail-closed",
  "24_000",
  "application/json"
]) {
  requireIncludes(routePath, expected);
}
requireIncludes("app/lib/scrimed-control-plane/index.ts", "idempotency");

const pagePath = "app/scrimed-control-plane/page.tsx";
for (const expected of [
  "SCRIMED Intelligence Control Plane",
  "Workspace + Active Sessions",
  "Agent OS + Skills Registry",
  "Workflow Engine",
  "Context Fabric + Multi-Model Router",
  "Verification + Reasoning Observatory",
  "ConsequenceBench + Artifacts",
  "Capital Intelligence + Compute Resilience",
  "Voice + Learning + Outcomes + Audit",
  "Approval Achievement",
  "Cross-Platform Evidence",
  "Synthetic"
]) {
  requireIncludes(pagePath, expected);
}

for (const path of ["app/lib/siteNavigation.ts", "app/lib/navigationAudit.ts"]) {
  requireIncludes(path, "/scrimed-control-plane");
}
requireIncludes("app/lib/navigationAudit.ts", "expectedApiRoutePatternCount = 443");

const packageJson = JSON.parse(files["package.json"]);
if (packageJson.scripts?.["contract:scrimed-control-plane"] !== "node scripts/scrimed-control-plane-contract-check.mjs") {
  throw new Error("package.json missing contract:scrimed-control-plane.");
}
if (packageJson.scripts?.["smoke:scrimed-control-plane"] !== "node scripts/scrimed-control-plane-smoke.mjs") {
  throw new Error("package.json missing smoke:scrimed-control-plane.");
}
requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", "scripts/scrimed-control-plane-contract-check.mjs");

for (const expected of [
  "/scrimed-control-plane",
  "/api/scrimed-control-plane/brief",
  "/api/scrimed-control-plane/sessions",
  "/api/scrimed-control-plane/route-model",
  "/api/scrimed-control-plane/context/search",
  "/api/scrimed-control-plane/benchmarks/run",
  "/api/scrimed-control-plane/voice/simulate",
  "/api/scrimed-control-plane/approvals",
  "/api/scrimed-control-plane/platform-evidence",
  "expected fail-closed 401, 403, or 503",
  "--compiled",
  "routeModule.userland",
  "pass compiled /scrimed-control-plane page module",
  "SCRIMED Intelligence Control Plane runtime smoke"
]) {
  requireIncludes("scripts/scrimed-control-plane-smoke.mjs", expected);
}

for (const expected of [
  "Status: Proposed internal draft awaiting Founder/CEO, qualified legal, and clinical governance approval",
  "autonomously diagnose, treat, prescribe, triage",
  "No system or agent may self-approve",
  "This draft is not an approval"
]) {
  const path = expected.startsWith("No system") ? "docs/scrimed-approval-achievement.md" : "docs/SCRIMED_INTENDED_USE_MEMO.md";
  requireIncludes(path, expected);
}

const combined = requiredFiles.map((path) => files[path]).join("\n").toLowerCase();
for (const forbidden of [
  "scrimed is hipaa certified",
  "scrimed is fda cleared",
  "autonomous diagnosis enabled",
  "autonomous treatment enabled",
  "ehr writeback enabled",
  "payer submission enabled",
  "investor outreach enabled",
  "customer go-live approved"
]) {
  if (combined.includes(forbidden)) {
    throw new Error(`SCRIMED control-plane contains forbidden claim: ${forbidden}`);
  }
}

console.log(`pass SCRIMED Intelligence Control Plane contract check (${requiredFiles.length} files verified)`);
