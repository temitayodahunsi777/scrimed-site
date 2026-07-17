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
  "app/lib/scrimed-work/migrationSet.ts",
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
  "app/lib/scrimed-work/artifactReview.ts",
  "app/lib/scrimed-work/completionEvidence.ts",
  "app/lib/scrimed-work/completionQueue.ts",
  "app/lib/scrimed-work/reviewQueue.ts",
  "app/lib/scrimed-work/reviewPreparation.ts",
  "app/lib/scrimed-work/payerIqHandoff.ts",
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
  "app/api/scrimed-work/sessions/[sessionId]/complete/route.ts",
  "app/api/scrimed-work/sessions/[sessionId]/artifacts/[artifactId]/review/route.ts",
  "app/api/scrimed-work/completion-queue/route.ts",
  "app/api/scrimed-work/review-queue/route.ts",
  "app/api/scrimed-work/providers/route.ts",
  "app/api/scrimed-work/agents/route.ts",
  "app/api/scrimed-work/tools/route.ts",
  "app/api/scrimed-work/schedules/route.ts",
  "app/api/scrimed-work/production-hardening/route.ts",
  "app/api/scrimed-work/route-model/route.ts",
  "app/api/scrimed-work/context/search/route.ts",
  "app/api/scrimed-work/artifacts/route.ts",
  "app/api/scrimed-work/voice/simulate/route.ts",
  "app/api/documentation-before-authorization/scrimed-work-handoff/route.ts",
  "app/scrimed-work/page.tsx",
  "app/pilot-workspace/ProtectedPilotAccess.tsx",
  "app/pilot-workspace/ScrimedWorkBrowserVerificationPanel.tsx",
  "app/pilot-workspace/ScrimedWorkCompletionQueuePanel.tsx",
  "app/pilot-workspace/ScrimedWorkReviewPreparationPanel.tsx",
  "app/pilot-workspace/ScrimedWorkReviewerQueuePanel.tsx",
  "app/lib/siteNavigation.ts",
  "app/lib/navigationAudit.ts",
  "scripts/public-production-smoke.mjs",
  "scripts/scrimed-work-durable-store-preflight.mjs",
  "scripts/scrimed-work-authenticated-smoke.mjs",
  "scripts/aal2-bearer-token-helper.mjs",
  "scripts/lib/two-identity-aal2-policy.mjs",
  "scripts/scrimed-work-two-identity-policy-test.mjs",
  "scripts/scrimed-work-production-hardening-policy-test.mjs",
  "scripts/scrimed-work-two-identity-authenticated-smoke.mjs",
  "scripts/scrimed-work-lifecycle-policy-test.mjs",
  "scripts/scrimed-work-artifact-review-policy-test.mjs",
  "scripts/scrimed-work-completion-queue-policy-test.mjs",
  "scripts/scrimed-work-completion-evidence-policy-test.mjs",
  "scripts/scrimed-work-migration-set-policy-test.mjs",
  "scripts/scrimed-work-review-queue-policy-test.mjs",
  "scripts/scrimed-work-review-preparation-policy-test.mjs",
  "scripts/scrimed-work-preflight-policy-test.mjs",
  "scripts/scrimed-work-browser-verification-policy-test.mjs",
  "supabase/migrations/20260709193000_scrimed_work_durable_store.sql",
  "supabase/migrations/20260713160000_scrimed_work_lifecycle_hardening.sql",
  "supabase/migrations/20260713163000_scrimed_work_advisor_index_hardening.sql",
  "supabase/migrations/20260713210000_scrimed_work_artifact_review_binding.sql",
  "supabase/migrations/20260714163930_scrimed_work_reviewer_queue.sql",
  "supabase/migrations/20260715143000_scrimed_work_review_queue_approval_step.sql",
  "supabase/migrations/20260716012403_scrimed_work_artifact_session_binding.sql",
  "supabase/migrations/20260716015159_scrimed_work_approval_evidence_binding.sql",
  "supabase/migrations/20260716030000_scrimed_work_completion_queue.sql",
  "supabase/migrations/20260716184500_scrimed_work_completion_evidence.sql",
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
  files["app/lib/scrimed-work/artifactReview.ts"],
  files["app/lib/scrimed-work/completionEvidence.ts"],
  files["app/lib/scrimed-work/completionQueue.ts"],
  files["app/lib/scrimed-work/reviewQueue.ts"],
  files["app/lib/scrimed-work/reviewPreparation.ts"],
  files["app/lib/scrimed-work/payerIqHandoff.ts"],
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
  "resolveScrimedWorkMembership",
  "evaluateArtifactReview",
  "createArtifactReviewerIdentityHash",
  "createArtifactReviewDecisionHash",
  "buildPayerIqProtectedWorkSession",
  "guardedCreatePayerIqProtectedHandoff",
  "guardedReviewProtectedArtifact",
  "guardedListProtectedArtifactReviewQueue",
  "listScrimedWorkArtifactReviewQueueInDurableStore",
  "scrimed-work-review-queue-v2026-07-15",
  "guardedListProtectedCompletionQueue",
  "listScrimedWorkCompletionQueueInDurableStore",
  "scrimed-work-completion-queue-v2026-07-16",
  "scrimed_work_completion_operator_required",
  "parseScrimedWorkCompletionReadMode",
  "listScrimedWorkCompletionEvidenceInDurableStore",
  "scrimed-work-completion-evidence-v2026-07-16",
  "immutableEvidenceReferences",
  "scrimed-work-review-preparation-v2026-07-15"
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

for (const expected of [
  "guardedListProtectedArtifactReviewQueue",
  "reviewer-only-aal2-tenant-scoped-metadata",
  "fail-closed",
  "X-SCRIMED-External-Distribution",
  "X-SCRIMED-Payer-Submission",
  "not-authorized"
]) {
  requireIncludes(
    "app/api/scrimed-work/review-queue/route.ts",
    files["app/api/scrimed-work/review-queue/route.ts"],
    expected
  );
}

for (const expected of [
  "guardedListProtectedCompletionQueue",
  "operator-only-aal2-tenant-scoped-metadata",
  "fail-closed",
  "X-SCRIMED-External-Distribution",
  "X-SCRIMED-Payer-Submission",
  "X-SCRIMED-EHR-Writeback",
  "X-SCRIMED-Completion-Read-Mode",
  "X-SCRIMED-Completion-Evidence-Policy",
  "not-authorized"
]) {
  requireIncludes(
    "app/api/scrimed-work/completion-queue/route.ts",
    files["app/api/scrimed-work/completion-queue/route.ts"],
    expected
  );
}

for (const route of [
  "app/api/scrimed-work/sessions/route.ts",
  "app/api/scrimed-work/sessions/[sessionId]/plan/route.ts",
  "app/api/scrimed-work/sessions/[sessionId]/run/route.ts",
  "app/api/scrimed-work/sessions/[sessionId]/pause/route.ts",
  "app/api/scrimed-work/sessions/[sessionId]/resume/route.ts",
  "app/api/scrimed-work/sessions/[sessionId]/cancel/route.ts",
  "app/api/scrimed-work/sessions/[sessionId]/approve/route.ts",
  "app/api/scrimed-work/sessions/[sessionId]/reject/route.ts",
  "app/api/scrimed-work/sessions/[sessionId]/complete/route.ts"
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

for (const expected of [
  "guardedReviewProtectedArtifact",
  "independent-aal2-review",
  "X-SCRIMED-External-Distribution",
  "not-authorized"
]) {
  requireIncludes(
    "app/api/scrimed-work/sessions/[sessionId]/artifacts/[artifactId]/review/route.ts",
    files["app/api/scrimed-work/sessions/[sessionId]/artifacts/[artifactId]/review/route.ts"],
    expected
  );
}
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

const artifactReviewMigration = files["supabase/migrations/20260713210000_scrimed_work_artifact_review_binding.sql"];
for (const expected of [
  "private.scrimed_work_artifact_reviews",
  "scrimed_work_artifact_reviews_deny_all",
  "array['reviewer']",
  "expected_reviewer_identity_hash",
  "expected_review_decision_hash",
  "scrimed-work-artifact-review-mutation-scope-violation",
  "scrimed-work-artifact-review-verification-required",
  "artifact-review-idempotency-reused",
  "public.review_scrimed_work_artifact",
  "security invoker"
]) {
  requireIncludes("supabase/migrations/20260713210000_scrimed_work_artifact_review_binding.sql", artifactReviewMigration, expected);
}

const reviewerQueueMigration = files["supabase/migrations/20260714163930_scrimed_work_reviewer_queue.sql"];
for (const expected of [
  "private.list_scrimed_work_artifact_review_queue",
  "array['reviewer']",
  "session.created_by <> (select auth.uid())",
  "artifact.created_by <> (select auth.uid())",
  "limit p_limit",
  "artifact-review-queue-viewed",
  "public.list_scrimed_work_artifact_review_queue",
  "security invoker",
  "externalDistributionAllowed', false",
  "payerSubmissionAllowed', false"
]) {
  requireIncludes("supabase/migrations/20260714163930_scrimed_work_reviewer_queue.sql", reviewerQueueMigration, expected);
}

const reviewerApprovalMigration = files["supabase/migrations/20260715143000_scrimed_work_review_queue_approval_step.sql"];
for (const expected of [
  "private.list_scrimed_work_artifact_review_queue",
  "session.status in ('awaiting_approval', 'verifying')",
  "sessionApprovalStepExposed', true",
  "array['reviewer']",
  "session.created_by <> (select auth.uid())",
  "security invoker",
  "externalDistributionAllowed', false",
  "payerSubmissionAllowed', false"
]) {
  requireIncludes(
    "supabase/migrations/20260715143000_scrimed_work_review_queue_approval_step.sql",
    reviewerApprovalMigration,
    expected
  );
}

const artifactSessionBindingMigration = files["supabase/migrations/20260716012403_scrimed_work_artifact_session_binding.sql"];
for (const expected of [
  "private.sync_scrimed_work_artifact_payload_to_session",
  "scrimed_work_artifact_payload_session_sync",
  "scrimed-work-artifact-session-sync-binding-conflict",
  "after insert or update of artifact_payload",
  "revoke all on function private.sync_scrimed_work_artifact_payload_to_session()"
]) {
  requireIncludes(
    "supabase/migrations/20260716012403_scrimed_work_artifact_session_binding.sql",
    artifactSessionBindingMigration,
    expected
  );
}

const approvalEvidenceBindingMigration = files["supabase/migrations/20260716015159_scrimed_work_approval_evidence_binding.sql"];
for (const expected of [
  "private.bind_scrimed_work_approval_evidence",
  "scrimed_work_approval_evidence_binding",
  "session-evidence-bound",
  "independent reviewer approval",
  "revoke all on function private.bind_scrimed_work_approval_evidence()",
  "update private.scrimed_work_sessions session"
]) {
  requireIncludes(
    "supabase/migrations/20260716015159_scrimed_work_approval_evidence_binding.sql",
    approvalEvidenceBindingMigration,
    expected
  );
}

const completionQueueMigration = files["supabase/migrations/20260716030000_scrimed_work_completion_queue.sql"];
for (const expected of [
  "private.list_scrimed_work_completion_queue",
  "array['tenant-admin', 'pilot-lead']",
  "session.status = 'verifying'",
  "review.disposition = 'approved_for_internal_use'",
  "artifact.artifact_payload #>> '{verification,allPass}' = 'true'",
  "session-completion-queue-viewed",
  "public.list_scrimed_work_completion_queue",
  "security invoker",
  "externalDistributionAllowed', false",
  "payerSubmissionAllowed', false",
  "ehrWritebackAllowed', false"
]) {
  requireIncludes(
    "supabase/migrations/20260716030000_scrimed_work_completion_queue.sql",
    completionQueueMigration,
    expected
  );
}

const completionEvidenceMigration = files["supabase/migrations/20260716184500_scrimed_work_completion_evidence.sql"];
for (const expected of [
  "private.list_scrimed_work_completion_evidence",
  "array['tenant-admin', 'pilot-lead']",
  "session.status = 'completed'",
  "scrimed_work_sessions_completed_evidence_idx",
  "artifact_review.reviewer_user_id <> session.created_by",
  "review.disposition = 'approved_for_internal_use'",
  "artifact.artifact_payload #>> '{verification,allPass}' = 'true'",
  "session-completion-evidence-viewed",
  "public.list_scrimed_work_completion_evidence",
  "security invoker",
  "scrimed-work-completion-evidence-",
  "externalDistributionAllowed', false",
  "payerSubmissionAllowed', false",
  "ehrWritebackAllowed', false"
]) {
  requireIncludes(
    "supabase/migrations/20260716184500_scrimed_work_completion_evidence.sql",
    completionEvidenceMigration,
    expected
  );
}

requireIncludes(
  "app/lib/scrimed-work/verificationEngine.ts",
  files["app/lib/scrimed-work/verificationEngine.ts"],
  "collectVerificationEvidenceIds"
);
requireIncludes(
  "app/lib/scrimed-work/reviewPreparation.ts",
  files["app/lib/scrimed-work/reviewPreparation.ts"],
  "independent reviewer approval"
);
requireNotIncludes(
  "app/lib/scrimed-work/reviewPreparation.ts",
  files["app/lib/scrimed-work/reviewPreparation.ts"],
  "mandatory verification result"
);

requireIncludes("package.json", files["package.json"], "test:scrimed-work:lifecycle");
requireIncludes("package.json", files["package.json"], "test:scrimed-work:artifact-review-policy");
requireIncludes("package.json", files["package.json"], "test:scrimed-work:review-queue-policy");
requireIncludes("package.json", files["package.json"], "test:scrimed-work:completion-queue-policy");
requireIncludes("package.json", files["package.json"], "test:scrimed-work:completion-evidence-policy");
requireIncludes("package.json", files["package.json"], "test:scrimed-work:migration-set-policy");
requireIncludes("package.json", files["package.json"], "test:scrimed-work:review-preparation-policy");
requireIncludes("package.json", files["package.json"], "test:scrimed-work:two-identity-policy");
requireIncludes("package.json", files["package.json"], "test:scrimed-work:production-hardening-policy");
requireIncludes("app/lib/scrimed-work/index.ts", files["app/lib/scrimed-work/index.ts"], "guardedGetProtectedWorkSession");
requireIncludes("app/lib/scrimed-work/index.ts", files["app/lib/scrimed-work/index.ts"], "guardedVerifyProtectedWorkSession");
requireNotIncludes("app/lib/scrimed-work/index.ts", files["app/lib/scrimed-work/index.ts"], "saveWorkSession(");
for (const expected of [
  "SCRIMED_WORK_MIGRATIONS_VERIFIED",
  "SCRIMED_WORK_MIGRATION_EVIDENCE_ID",
  "SCRIMED_WORK_MIGRATION_SET_VERSION",
  "SCRIMED_WORK_REVIEW_QUEUE_APPROVAL_MIGRATION_VERIFIED",
  "SCRIMED_WORK_REVIEW_QUEUE_APPROVAL_MIGRATION_EVIDENCE_ID",
  "SCRIMED_WORK_REQUIRED_MIGRATION_SET_VERSION",
  "SCRIMED_WORK_REQUIRED_MIGRATIONS",
  "isScrimedWorkMigrationSetVerified"
]) {
  requireIncludes(
    "app/lib/scrimed-work/migrationSet.ts",
    files["app/lib/scrimed-work/migrationSet.ts"],
    expected
  );
}
requireIncludes("app/lib/scrimed-work/productionHardening.ts", files["app/lib/scrimed-work/productionHardening.ts"], "getScrimedWorkMigrationSetStatus");
requireIncludes("app/lib/scrimed-work/productionHardening.ts", files["app/lib/scrimed-work/productionHardening.ts"], "SCRIMED_WORK_REQUIRED_MIGRATIONS");
requireIncludes("app/lib/scrimed-work/productionHardening.ts", files["app/lib/scrimed-work/productionHardening.ts"], "All ten ordered migrations");
requireIncludes("app/lib/scrimed-work/index.ts", files["app/lib/scrimed-work/index.ts"], "isScrimedWorkMigrationSetVerified");
requireIncludes("app/lib/scrimed-work/index.ts", files["app/lib/scrimed-work/index.ts"], "scrimed_work_migration_set_unverified");
requireIncludes("app/lib/scrimed-work/productionHardening.ts", files["app/lib/scrimed-work/productionHardening.ts"], "SCRIMED_REVIEWER_BEARER_TOKEN");
requireIncludes("app/lib/scrimed-work/productionHardening.ts", files["app/lib/scrimed-work/productionHardening.ts"], "SCRIMED_WORK_TWO_IDENTITY_CANARY_VERIFIED");
requireIncludes("app/lib/scrimed-work/productionHardening.ts", files["app/lib/scrimed-work/productionHardening.ts"], "SCRIMED_WORK_TWO_IDENTITY_CANARY_EVIDENCE_ID");
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "SCRIMED Work lifecycle policy behavior"
);
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "SCRIMED Work artifact review policy behavior"
);
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "SCRIMED Work reviewer queue policy behavior"
);
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "SCRIMED Work completion queue policy behavior"
);
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "SCRIMED Work completion evidence policy behavior"
);
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "SCRIMED Work migration-set policy behavior"
);
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "SCRIMED Work two-identity AAL2 policy behavior"
);
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "SCRIMED Work production-hardening policy behavior"
);
requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  files["scripts/scrimed-nonsecret-test-suite.mjs"],
  "SCRIMED_REVIEWER_BEARER_TOKEN: \"\""
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
  "Next Production-Hardening Step",
  "Independent Artifact Review Binding",
  "Independent Reviewer Queue",
  "Completed Internal Evidence",
  "Two-Identity AAL2 Canary",
  "all ten ordered migration contracts"
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
  "Prepare Independent Review",
  "session.access_token",
  "self-approval-denied",
  "separation_of_duties_required",
  "awaiting independent review",
  "Incomplete work is being cancelled",
  "scrimedWorkReviewPreparationBoundary"
]) {
  requireIncludes(
    "app/pilot-workspace/ScrimedWorkReviewPreparationPanel.tsx",
    files["app/pilot-workspace/ScrimedWorkReviewPreparationPanel.tsx"],
    expected
  );
}

requireIncludes(
  "app/pilot-workspace/ProtectedPilotAccess.tsx",
  files["app/pilot-workspace/ProtectedPilotAccess.tsx"],
  "ScrimedWorkReviewPreparationPanel"
);
requireIncludes(
  "app/pilot-workspace/ProtectedPilotAccess.tsx",
  files["app/pilot-workspace/ProtectedPilotAccess.tsx"],
  "ScrimedWorkCompletionQueuePanel"
);

for (const expected of [
  "SCRIMED Work Reviewer Queue",
  "session.access_token",
  "/api/scrimed-work/review-queue?limit=25",
  "Reviewer membership with fresh AAL2 is required",
  "Approve Session for Review",
  "Approve Internal Use",
  "External distribution remains blocked"
]) {
  requireIncludes(
    "app/pilot-workspace/ScrimedWorkReviewerQueuePanel.tsx",
    files["app/pilot-workspace/ScrimedWorkReviewerQueuePanel.tsx"],
    expected
  );
}

for (const expected of [
  "SCRIMED Work Completion Queue",
  "session.access_token",
  "/api/scrimed-work/completion-queue?limit=25",
  "Tenant-admin or pilot-lead membership with fresh AAL2 is required",
  "eligibleForCompletion",
  "Verify and Complete Internal Work",
  "External distribution, payer submission, EHR writeback"
]) {
  requireIncludes(
    "app/pilot-workspace/ScrimedWorkCompletionQueuePanel.tsx",
    files["app/pilot-workspace/ScrimedWorkCompletionQueuePanel.tsx"],
    expected
  );
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
  "SCRIMED_REVIEWER_BEARER_TOKEN",
  "--required-role reviewer",
  "--token-env",
  "SCRIMED_REQUIRE_TWO_IDENTITY_SMOKE",
  "mode 0600",
  "never prints bearer-token values"
]) {
  requireIncludes("scripts/aal2-bearer-token-helper.mjs", files["scripts/aal2-bearer-token-helper.mjs"], expected);
}

for (const expected of [
  "different authenticated users",
  "different authenticated sessions",
  "signature_and_roles=verified-by-protected-api",
  "identitySeparationVerifiedLocally"
]) {
  requireIncludes(
    "scripts/lib/two-identity-aal2-policy.mjs",
    files["scripts/lib/two-identity-aal2-policy.mjs"],
    expected
  );
}

for (const expected of [
  "SCRIMED Work two-identity AAL2 lifecycle canary completed",
  "currentSessionStatus",
  "statusHistory",
  "/api/scrimed-work/review-queue?limit=25",
  "operator self-approval fail-closed",
  "reviewer-only queue authorization",
  "approved_for_internal_use",
  "evidence_and_boundaries_confirmed",
  "verified-internal-work-complete",
  "X-SCRIMED-External-Distribution",
  "X-SCRIMED-Payer-Submission",
  "different authenticated users"
]) {
  requireIncludes(
    "scripts/scrimed-work-two-identity-authenticated-smoke.mjs",
    files["scripts/scrimed-work-two-identity-authenticated-smoke.mjs"],
    expected
  );
}

for (const expected of [
  "sameUser",
  "sameSession",
  "missingReviewer",
  "expiredReviewer",
  "report.includes(operatorToken), false",
  "SCRIMED Work two-identity AAL2 policy behavior"
]) {
  requireIncludes(
    "scripts/scrimed-work-two-identity-policy-test.mjs",
    files["scripts/scrimed-work-two-identity-policy-test.mjs"],
    expected
  );
}

for (const expected of [
  "scrimed-work-aal2-reviewer-session",
  "scrimed-work-canary-release",
  "SCRIMED_WORK_TWO_IDENTITY_CANARY_VERIFIED",
  "SCRIMED_WORK_TWO_IDENTITY_CANARY_EVIDENCE_ID",
  "tokens redacted"
]) {
  requireIncludes(
    "scripts/scrimed-work-production-hardening-policy-test.mjs",
    files["scripts/scrimed-work-production-hardening-policy-test.mjs"],
    expected
  );
}

for (const expected of [
  "SCRIMED Work",
  "/scrimed-work",
  "work-session control plane"
]) {
  requireIncludes("app/lib/siteNavigation.ts", files["app/lib/siteNavigation.ts"], expected);
}

for (const expected of [
  "expectedApiRoutePatternCount = 440",
  "\"/scrimed-work\""
]) {
  requireIncludes("app/lib/navigationAudit.ts", files["app/lib/navigationAudit.ts"], expected);
}

for (const expected of [
  "checkScrimedWork",
  "/api/scrimed-work",
  "/api/scrimed-work/brief",
  "/api/scrimed-work/production-hardening",
  "/api/scrimed-work/review-queue",
  "/scrimed-work",
  "pass scrimed work"
]) {
  requireIncludes("scripts/public-production-smoke.mjs", files["scripts/public-production-smoke.mjs"], expected);
}

requireIncludes("package.json", files["package.json"], "\"smoke:scrimed-work\": \"node scripts/scrimed-work-contract-check.mjs\"");
requireIncludes("package.json", files["package.json"], "\"smoke:scrimed-work:durable-store-preflight\": \"node scripts/scrimed-work-durable-store-preflight.mjs\"");
requireIncludes("package.json", files["package.json"], "\"smoke:scrimed-work:authenticated\": \"node scripts/scrimed-work-authenticated-smoke.mjs\"");
requireIncludes("package.json", files["package.json"], "\"smoke:scrimed-work:two-identity\": \"node scripts/scrimed-work-two-identity-authenticated-smoke.mjs\"");
requireIncludes("package.json", files["package.json"], "\"smoke:scrimed-work:two-identity:strict\": \"node scripts/scrimed-work-two-identity-authenticated-smoke.mjs --strict\"");
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
