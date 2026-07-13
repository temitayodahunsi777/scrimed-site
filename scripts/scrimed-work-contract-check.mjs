#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "SCRIMED_WORK_IMPLEMENTATION_PLAN.md",
  "docs/scrimed-work.md",
  "app/lib/scrimed-work/types.ts",
  "app/lib/scrimed-work/schemas.ts",
  "app/lib/scrimed-work/workspaceRegistry.ts",
  "app/lib/scrimed-work/workSessionStore.ts",
  "app/lib/scrimed-work/modelRouter.ts",
  "app/lib/scrimed-work/providerRegistry.ts",
  "app/lib/scrimed-work/productionHardening.ts",
  "app/lib/scrimed-work/browserVerification.ts",
  "app/lib/scrimed-work/sessionLifecycle.ts",
  "app/lib/scrimed-work/toolRegistry.ts",
  "app/lib/scrimed-work/agentRegistry.ts",
  "app/lib/scrimed-work/orchestrationEngine.ts",
  "app/lib/scrimed-work/contextEngine.ts",
  "app/lib/scrimed-work/verificationEngine.ts",
  "app/lib/scrimed-work/autonomyPolicy.ts",
  "app/lib/scrimed-work/approvalEngine.ts",
  "app/lib/scrimed-work/artifactEngine.ts",
  "app/lib/scrimed-work/scheduleDefinitions.ts",
  "app/lib/scrimed-work/voiceWorkflow.ts",
  "app/lib/scrimed-work/learningLoop.ts",
  "app/lib/scrimed-work/valueTelemetry.ts",
  "app/lib/scrimed-work/audit.ts",
  "app/lib/scrimed-work/featureFlags.ts",
  "app/lib/scrimed-work/durableStore.ts",
  "app/lib/scrimed-work/index.ts",
  "app/api/scrimed-work/route.ts",
  "app/api/scrimed-work/brief/route.ts",
  "app/api/scrimed-work/sessions/route.ts",
  "app/api/scrimed-work/sessions/[sessionId]/route.ts",
  "app/api/scrimed-work/sessions/[sessionId]/plan/route.ts",
  "app/api/scrimed-work/sessions/[sessionId]/run/route.ts",
  "app/api/scrimed-work/sessions/[sessionId]/pause/route.ts",
  "app/api/scrimed-work/sessions/[sessionId]/resume/route.ts",
  "app/api/scrimed-work/sessions/[sessionId]/cancel/route.ts",
  "app/api/scrimed-work/sessions/[sessionId]/verify/route.ts",
  "app/api/scrimed-work/sessions/[sessionId]/approve/route.ts",
  "app/api/scrimed-work/sessions/[sessionId]/reject/route.ts",
  "app/api/scrimed-work/providers/route.ts",
  "app/api/scrimed-work/agents/route.ts",
  "app/api/scrimed-work/tools/route.ts",
  "app/api/scrimed-work/schedules/route.ts",
  "app/api/scrimed-work/production-hardening/route.ts",
  "app/api/scrimed-work/route-model/route.ts",
  "app/api/scrimed-work/context/search/route.ts",
  "app/api/scrimed-work/artifacts/route.ts",
  "app/api/scrimed-work/voice/simulate/route.ts",
  "app/scrimed-work/page.tsx",
  "app/pilot-workspace/ScrimedWorkBrowserVerificationPanel.tsx",
  "app/lib/siteNavigation.ts",
  "app/lib/navigationAudit.ts",
  "scripts/public-production-smoke.mjs",
  "scripts/scrimed-work-durable-store-preflight.mjs",
  "scripts/scrimed-work-authenticated-smoke.mjs",
  "scripts/scrimed-work-lifecycle-policy-test.mjs",
  "scripts/scrimed-work-preflight-policy-test.mjs",
  "scripts/scrimed-work-browser-verification-policy-test.mjs",
  "supabase/migrations/20260709193000_scrimed_work_durable_store.sql",
  "supabase/migrations/20260713160000_scrimed_work_lifecycle_hardening.sql",
  "supabase/migrations/20260713163000_scrimed_work_advisor_index_hardening.sql",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required SCRIMED Work text: ${expected}`);
  }
}

function requireNotIncludes(path, text, forbidden) {
  if (text.toLowerCase().includes(forbidden.toLowerCase())) {
    throw new Error(`${path} contains forbidden SCRIMED Work claim: ${forbidden}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const combinedLib = [
  files["app/lib/scrimed-work/types.ts"],
  files["app/lib/scrimed-work/schemas.ts"],
  files["app/lib/scrimed-work/modelRouter.ts"],
  files["app/lib/scrimed-work/toolRegistry.ts"],
  files["app/lib/scrimed-work/orchestrationEngine.ts"],
  files["app/lib/scrimed-work/contextEngine.ts"],
  files["app/lib/scrimed-work/verificationEngine.ts"],
  files["app/lib/scrimed-work/artifactEngine.ts"],
  files["app/lib/scrimed-work/scheduleDefinitions.ts"],
  files["app/lib/scrimed-work/voiceWorkflow.ts"],
  files["app/lib/scrimed-work/valueTelemetry.ts"],
  files["app/lib/scrimed-work/learningLoop.ts"],
  files["app/lib/scrimed-work/audit.ts"],
  files["app/lib/scrimed-work/featureFlags.ts"],
  files["app/lib/scrimed-work/durableStore.ts"],
  files["app/lib/scrimed-work/productionHardening.ts"],
  files["app/lib/scrimed-work/sessionLifecycle.ts"],
  files["app/lib/scrimed-work/index.ts"]
].join("\n");

for (const expected of [
  "WorkspaceDomain",
  "WorkSessionStatus",
  "DefinitionOfDoneContract",
  "AutonomyLevel",
  "ArtifactType",
  "scrimed-work-intelligence-platform-active-synthetic-no-phi",
  "SCRIMED Work & Intelligence Platform",
  "deterministic-in-memory-adapter",
  "protected-supabase-rpc-aal2",
  "SCRIMED_WORK_DURABLE_STORE_ENABLED",
  "recordScrimedWorkSessionInDurableStore",
  "transitionScrimedWorkSessionInDurableStore",
  "fetchScrimedWorkSessionFromDurableStore",
  "recordScrimedWorkArtifactInDurableStore",
  "buildWriteAuthorizationDecision",
  "buildReadAuthorizationDecision",
  "SCRIMED_WORK_PROTECTED_WRITES_ENABLED",
  "routeScrimedWorkModel",
  "selectedModel",
  "fallbackModels",
  "scrimedWorkProviderRegistry",
  "scrimed-work-production-hardening-gate",
  "getScrimedWorkProductionHardeningGate",
  "getScrimedWorkFeatureFlags(env)",
  "isScrimedWorkDurableStoreEnabled(env)",
  "getScrimedWorkDurableStorageMode(env)",
  "redactScrimedWorkSensitiveText",
  "canRunStrictNonProductionSmoke",
  "operator_required",
  "nextOperatorActions",
  "strictSmokeCommands",
  "synthetic-fallback",
  "local-private",
  "authorizeToolAccess",
  "consequentialActionsEnabled",
  "scrimedWorkAgents",
  "planner-specialist-verifier",
  "scrimed-a2a-envelope-v1",
  "searchScrimedWorkContext",
  "citationRequired",
  "getHealthcareOntologyRegistry",
  "verifyScrimedWorkResult",
  "detectDoomLoop",
  "buildScrimedWorkArtifact",
  "scrimedWorkScheduleDefinitions",
  "enabled: false",
  "simulateVoiceWorkflow",
  "rawAudioStored: false",
  "calculateValueTelemetry",
  "botsittingRatio",
  "sampleLearningLoopArtifacts",
  "redactForTelemetry",
  "scrimed-work-lifecycle-v2026-07-13",
  "evaluateWorkSessionTransition",
  "applyWorkSessionTransition",
  "hasSatisfiedRequiredHumanApproval",
  "separation-of-duties-required",
  "idempotent_replay_candidate",
  "resolveScrimedWorkMembership"
]) {
  requireIncludes("app/lib/scrimed-work/*", combinedLib, expected);
}

for (const expected of [
  "X-SCRIMED-Work",
  "synthetic-no-phi-metadata-only",
  "not-authorized-live-care",
  "not-authorized",
  "disabled-by-default",
  "not-production-authorized",
  "not-authorized"
]) {
  requireIncludes("app/lib/scrimed-work/index.ts", files["app/lib/scrimed-work/index.ts"], expected);
}

for (const route of [
  "app/api/scrimed-work/sessions/route.ts",
  "app/api/scrimed-work/sessions/[sessionId]/plan/route.ts",
  "app/api/scrimed-work/sessions/[sessionId]/run/route.ts",
  "app/api/scrimed-work/sessions/[sessionId]/pause/route.ts",
  "app/api/scrimed-work/sessions/[sessionId]/resume/route.ts",
  "app/api/scrimed-work/sessions/[sessionId]/cancel/route.ts",
  "app/api/scrimed-work/sessions/[sessionId]/approve/route.ts",
  "app/api/scrimed-work/sessions/[sessionId]/reject/route.ts"
]) {
  requireIncludes(route, files[route], route.endsWith("sessions/route.ts") ? "guardedCreateSession" : "guardedTransitionSession");
  requireIncludes(route, files[route], "fail-closed");
}

requireIncludes(
  "app/api/scrimed-work/sessions/[sessionId]/route.ts",
  files["app/api/scrimed-work/sessions/[sessionId]/route.ts"],
  "guardedGetProtectedWorkSession"
);
requireIncludes(
  "app/api/scrimed-work/sessions/[sessionId]/route.ts",
  files["app/api/scrimed-work/sessions/[sessionId]/route.ts"],
  "authorized-aal2-durable-read"
);
requireIncludes(
  "app/api/scrimed-work/sessions/[sessionId]/verify/route.ts",
  files["app/api/scrimed-work/sessions/[sessionId]/verify/route.ts"],
  "guardedVerifyProtectedWorkSession"
);
requireIncludes(
  "app/api/scrimed-work/sessions/[sessionId]/verify/route.ts",
  files["app/api/scrimed-work/sessions/[sessionId]/verify/route.ts"],
  "fail-closed"
);

requireIncludes(
  "app/api/scrimed-work/artifacts/route.ts",
  files["app/api/scrimed-work/artifacts/route.ts"],
  "guardedCreateArtifact"
);
requireIncludes(
  "app/api/scrimed-work/artifacts/route.ts",
  files["app/api/scrimed-work/artifacts/route.ts"],
  "fail-closed"
);

for (const expected of [
  "SCRIMED Work & Intelligence Platform",
  "Workspace selector",
  "Definition of Done",
  "Agent Plan and Step Timeline",
  "Context and Citations",
  "Approval Queue + Verification Results",
  "Model Routing + Value Telemetry",
  "Production Hardening Gate",
  "Schedules + Voice Simulation",
  "SCRIMED Studio",
  "Lifecycle Control",
  "Authoritative state"
]) {
  requireIncludes("app/scrimed-work/page.tsx", files["app/scrimed-work/page.tsx"], expected);
}

const lifecycleMigration = files["supabase/migrations/20260713160000_scrimed_work_lifecycle_hardening.sql"];
for (const expected of [
  "private.scrimed_work_transition_keys",
  "scrimed_work_transition_keys_deny_all",
  "private.scrimed_work_transition_allowed",
  "for update",
  "scrimed-work-status-history-conflict",
  "scrimed-work-independent-reviewer-required",
  "scrimed-work-qualified-clinical-reviewer-required",
  "idempotentReplay",
  "lifecycleDecisionHash"
]) {
  requireIncludes("supabase/migrations/20260713160000_scrimed_work_lifecycle_hardening.sql", lifecycleMigration, expected);
}

const advisorIndexMigration = files["supabase/migrations/20260713163000_scrimed_work_advisor_index_hardening.sql"];
for (const expected of [
  "scrimed_work_artifacts_tenant_created_idx",
  "scrimed_work_audit_events_tenant_created_idx",
  "scrimed_work_audit_events_artifact_idx"
]) {
  requireIncludes("supabase/migrations/20260713163000_scrimed_work_advisor_index_hardening.sql", advisorIndexMigration, expected);
}

requireIncludes("package.json", files["package.json"], "test:scrimed-work:lifecycle");
requireIncludes("app/lib/scrimed-work/index.ts", files["app/lib/scrimed-work/index.ts"], "guardedGetProtectedWorkSession");
requireIncludes("app/lib/scrimed-work/index.ts", files["app/lib/scrimed-work/index.ts"], "guardedVerifyProtectedWorkSession");
requireNotIncludes("app/lib/scrimed-work/index.ts", files["app/lib/scrimed-work/index.ts"], "saveWorkSession(");
requireIncludes("app/lib/scrimed-work/productionHardening.ts", files["app/lib/scrimed-work/productionHardening.ts"], "SCRIMED_WORK_MIGRATIONS_VERIFIED");
requireIncludes("app/lib/scrimed-work/productionHardening.ts", files["app/lib/scrimed-work/productionHardening.ts"], "SCRIMED_WORK_MIGRATION_EVIDENCE_ID");
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "SCRIMED Work lifecycle policy behavior"
);

for (const expected of [
  "SCRIMED Work & Intelligence Platform",
  "Safety Boundary",
  "Feature Flags",
  "SCRIMED_WORK_ENABLED",
  "SCRIMED_CONSEQUENTIAL_ACTIONS_ENABLED",
  "Production Hardening Gate",
  "/api/scrimed-work/production-hardening",
  "Known Limitations",
  "Next Production-Hardening Step"
]) {
  requireIncludes("docs/scrimed-work.md", files["docs/scrimed-work.md"], expected);
}

for (const expected of [
  "private.scrimed_work_sessions",
  "private.scrimed_work_artifacts",
  "private.scrimed_work_audit_events",
  "enable row level security",
  "create policy scrimed_work_sessions_deny_all",
  "private.require_governance_workspace",
  "public.record_scrimed_work_session",
  "public.get_scrimed_work_session",
  "public.transition_scrimed_work_session",
  "public.record_scrimed_work_artifact",
  "security invoker",
  "grant execute on function public.record_scrimed_work_session"
]) {
  requireIncludes("supabase/migrations/20260709193000_scrimed_work_durable_store.sql", files["supabase/migrations/20260709193000_scrimed_work_durable_store.sql"], expected);
}

for (const expected of [
  "scrimed-work-durable-store-preflight",
  "SCRIMED_WORK_DURABLE_STORE_ENABLED",
  "public-rpc-security-invoker-only",
  "aal2-token-preflight",
  "aal2SignatureVerification.localPreflight",
  "not-verified-invalid-or-missing",
  "operator-action-required",
  "This preflight does not apply migrations",
  "redactSensitive"
]) {
  requireIncludes("scripts/scrimed-work-durable-store-preflight.mjs", files["scripts/scrimed-work-durable-store-preflight.mjs"], expected);
}

for (const expected of [
  "SCRIMED_WORK_MIGRATIONS_VERIFIED=false must remain fail-closed",
  "Migration evidence must not bypass the independent AAL2 token requirement",
  "SCRIMED_WORK_MIGRATIONS_VERIFIED: migrationsVerified"
]) {
  requireIncludes("scripts/scrimed-work-preflight-policy-test.mjs", files["scripts/scrimed-work-preflight-policy-test.mjs"], expected);
}

for (const expected of [
  "without exporting its bearer token",
  "cancels every created verification session",
  "unauthenticated-fail-closed",
  "cancellation-cleanup",
  "humanApprovalRequired: true"
]) {
  requireIncludes("app/lib/scrimed-work/browserVerification.ts", files["app/lib/scrimed-work/browserVerification.ts"], expected);
}

for (const expected of [
  "Run SCRIMED Work Verification",
  "scrimed-work-browser-verification",
  "session.access_token",
  "durable-read",
  "verification-evidence",
  "pending human review blocks completion",
  "Cancellation cleanup could not be confirmed",
  "Keep SCRIMED Work release promotion blocked"
]) {
  requireIncludes("app/pilot-workspace/ScrimedWorkBrowserVerificationPanel.tsx", files["app/pilot-workspace/ScrimedWorkBrowserVerificationPanel.tsx"], expected);
}

for (const expected of [
  "SCRIMED_BEARER_TOKEN",
  "SCRIMED_WORK_DURABLE_STORE_ENABLED",
  "x-scrimed-workspace-slug",
  "idempotency-key",
  "pass unauthenticated SCRIMED Work session create fail-closed",
  "authenticated SCRIMED Work token preflight",
  "durable session read",
  "verification evidence",
  "human review gate held",
  "transition idempotency",
  "invalid lifecycle transition fail-closed",
  "artifact create"
]) {
  requireIncludes("scripts/scrimed-work-authenticated-smoke.mjs", files["scripts/scrimed-work-authenticated-smoke.mjs"], expected);
}

for (const expected of [
  "SCRIMED Work",
  "/scrimed-work",
  "work-session control plane"
]) {
  requireIncludes("app/lib/siteNavigation.ts", files["app/lib/siteNavigation.ts"], expected);
}

for (const expected of [
  "expectedApiRoutePatternCount = 434",
  "\"/scrimed-work\""
]) {
  requireIncludes("app/lib/navigationAudit.ts", files["app/lib/navigationAudit.ts"], expected);
}

for (const expected of [
  "checkScrimedWork",
  "/api/scrimed-work",
  "/api/scrimed-work/brief",
  "/api/scrimed-work/production-hardening",
  "/scrimed-work",
  "pass scrimed work"
]) {
  requireIncludes("scripts/public-production-smoke.mjs", files["scripts/public-production-smoke.mjs"], expected);
}

requireIncludes("package.json", files["package.json"], "\"smoke:scrimed-work\": \"node scripts/scrimed-work-contract-check.mjs\"");
requireIncludes("package.json", files["package.json"], "\"smoke:scrimed-work:durable-store-preflight\": \"node scripts/scrimed-work-durable-store-preflight.mjs\"");
requireIncludes("package.json", files["package.json"], "\"smoke:scrimed-work:authenticated\": \"node scripts/scrimed-work-authenticated-smoke.mjs\"");
requireIncludes("app/api/scrimed-work/production-hardening/route.ts", files["app/api/scrimed-work/production-hardening/route.ts"], "operator-gated-no-production-authorization");
requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", files["scripts/scrimed-nonsecret-test-suite.mjs"], "scripts/scrimed-work-durable-store-preflight.mjs");
requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", files["scripts/scrimed-nonsecret-test-suite.mjs"], "scripts/scrimed-work-contract-check.mjs");

for (const path of requiredFiles.filter((path) => path.startsWith("app/") || path.startsWith("docs/") || path === "SCRIMED_WORK_IMPLEMENTATION_PLAN.md")) {
  const text = files[path];

  for (const forbidden of [
    "HIPAA certified",
    "SOC 2 certified",
    "FDA cleared",
    "autonomous diagnosis enabled",
    "autonomous treatment enabled",
    "prescribing enabled",
    "payer submission enabled",
    "EHR writeback enabled",
    "production connector approved",
    "customer go-live approved",
    "external model calls enabled",
    "raw PHI"
  ]) {
    requireNotIncludes(path, text, forbidden);
  }
}

console.log("pass SCRIMED Work contract check");
