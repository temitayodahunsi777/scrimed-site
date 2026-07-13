#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/executionAttemptDurableStore.ts",
  "app/api/workflows/execution-attempts/durable-store/route.ts",
  "app/api/workflows/execution-attempts/durable-store/brief/route.ts",
  "app/api/workflows/execution-attempts/durable-store/record/route.ts",
  "app/api/workflows/execution-attempts/durable-store/replay/route.ts",
  "app/api/workflows/execution-attempts/durable-store/review-disposition/route.ts",
  "supabase/migrations/20260627191852_execution_attempt_durable_store.sql",
  "supabase/migrations/20260627214607_execution_attempt_durable_store_rpc_hardening.sql",
  "supabase/migrations/20260627222843_execution_attempt_durable_store_advisor_alignment.sql",
  "supabase/migrations/20260629003600_execution_attempt_durable_store_phi_guard_precision.sql",
  "supabase/migrations/20260629004400_execution_attempt_durable_store_identifier_guard_word_boundary.sql",
  "supabase/migrations/20260705164000_execution_attempt_compute_fabric_evidence_binding.sql",
  "scripts/aal2-smoke-readiness-preflight.mjs",
  "scripts/execution-attempt-durable-store-authenticated-smoke.mjs",
  "scripts/aal2-bearer-token-helper.mjs",
  "scripts/lib/aal2-token-policy.mjs",
  "scripts/aal2-token-policy-selftest.mjs",
  "app/lib/qaAal2RunEvidence.ts",
  "app/api/qa-evidence/aal2-smoke-readiness/route.ts",
  "app/api/qa-evidence/aal2-smoke-readiness/brief/route.ts",
  "app/qa-aal2-run-evidence/page.tsx",
  "scripts/public-production-smoke.mjs",
  "docs/aal2-durable-store-smoke.md",
  "package.json",
  ".gitignore"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required durable-store contract text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/executionAttemptDurableStore.ts"];
const migration = files["supabase/migrations/20260627191852_execution_attempt_durable_store.sql"];
const hardeningMigration =
  files["supabase/migrations/20260627214607_execution_attempt_durable_store_rpc_hardening.sql"];
const advisorMigration =
  files["supabase/migrations/20260627222843_execution_attempt_durable_store_advisor_alignment.sql"];
const phiGuardPrecisionMigration =
  files["supabase/migrations/20260629003600_execution_attempt_durable_store_phi_guard_precision.sql"];
const identifierGuardWordBoundaryMigration =
  files["supabase/migrations/20260629004400_execution_attempt_durable_store_identifier_guard_word_boundary.sql"];
const computeFabricMigration =
  files["supabase/migrations/20260705164000_execution_attempt_compute_fabric_evidence_binding.sql"];
const authenticatedSmoke = files["scripts/execution-attempt-durable-store-authenticated-smoke.mjs"];
const aal2ReadinessPreflight = files["scripts/aal2-smoke-readiness-preflight.mjs"];
const aal2TokenHelper = files["scripts/aal2-bearer-token-helper.mjs"];
const aal2TokenPolicy = files["scripts/lib/aal2-token-policy.mjs"];
const qaAal2RunEvidence = files["app/lib/qaAal2RunEvidence.ts"];
const qaAal2SmokeReadinessRoute = files["app/api/qa-evidence/aal2-smoke-readiness/route.ts"];
const qaAal2SmokeReadinessBriefRoute =
  files["app/api/qa-evidence/aal2-smoke-readiness/brief/route.ts"];
const qaAal2RunEvidencePage = files["app/qa-aal2-run-evidence/page.tsx"];
const smoke = files["scripts/public-production-smoke.mjs"];

for (const expected of [
  "execution-attempt-durable-store-contract-active-no-phi",
  "Clinical Robustness Lab",
  "Enterprise MCP Gateway",
  "Dynamic Model Routing",
  "Live Steering Engine",
  "Security and Compliance",
  "Observability",
  "validateExecutionAttemptDurableStoreRecordRequest",
  "recordExecutionAttemptEnvelopeInDurableStore",
  "recordExecutionAttemptReviewDispositionInDurableStore",
  "executionAttemptDurableStoreRpcFailure",
  "execution-attempt-durable-store-role-denied",
  "no-phi-human-review-no-clinical-authority",
  "clinicalRobustnessScenarioBindingCount",
  "clinicalRobustnessPerturbationBindingCount",
  "clinicalRobustnessRequiredPerturbationCount",
  "current required adversarial perturbation families",
  "compute-fabric-evidence-binding-covered",
  "isScrimedComputeAuditHash",
  "computeFabricSelectedModel",
  "computeFabricModelTier",
  "computeFabricPhiPolicy",
  "computeFabricAuditHash"
]) {
  requireIncludes("app/lib/executionAttemptDurableStore.ts", source, expected);
}

for (const expected of [
  "private.execution_attempts",
  "private.execution_attempt_events",
  "private.execution_attempt_review_dispositions",
  "enable row level security",
  "execution_attempts_deny_all",
  "record_execution_attempt_envelope",
  "replay_execution_attempt_envelope",
  "record_execution_attempt_review_disposition",
  "execution-attempt-idempotency-conflict",
  "execution-attempt-prohibited-content",
  "not-authorized-production-phi",
  "not-authorized-live-care"
]) {
  requireIncludes("supabase/migrations/20260627191852_execution_attempt_durable_store.sql", migration, expected);
}

for (const expected of [
  "security invoker",
  "set search_path = ''",
  "grant execute on function private.record_execution_attempt_envelope",
  "grant execute on function public.record_execution_attempt_envelope",
  "execution_attempts_tenant_id_idx",
  "execution_attempts_created_by_idx",
  "execution_attempt_events_actor_user_id_idx",
  "execution_attempt_review_dispositions_actor_user_id_idx"
]) {
  requireIncludes(
    "supabase/migrations/20260627222843_execution_attempt_durable_store_advisor_alignment.sql",
    advisorMigration,
    expected
  );
}

for (const expected of [
  "security definer",
  "set search_path = ''",
  "revoke all on function private.record_execution_attempt_envelope",
  "revoke all on function private.replay_execution_attempt_envelope",
  "revoke all on function private.record_execution_attempt_review_disposition",
  "grant execute on function public.record_execution_attempt_envelope",
  "grant execute on function public.replay_execution_attempt_envelope",
  "grant execute on function public.record_execution_attempt_review_disposition"
]) {
  requireIncludes(
    "supabase/migrations/20260627214607_execution_attempt_durable_store_rpc_hardening.sql",
    hardeningMigration,
    expected
  );
}

for (const expected of [
  "reject_execution_attempt_prohibited_text",
  "patient[ _-]?(id|identifier)[[:space:]]*[:#]?[[:space:]]*[a-z0-9-]{4,}",
  "safety metadata labels",
  "execution-attempt-prohibited-content"
]) {
  requireIncludes(
    "supabase/migrations/20260629003600_execution_attempt_durable_store_phi_guard_precision.sql",
    phiGuardPrecisionMigration,
    expected
  );
}

for (const expected of [
  "reject_execution_attempt_prohibited_text",
  "member[ _-]?(identifier|id)([[:space:]]*[:#][[:space:]]*|[[:space:]]+)[a-z0-9-]{4,}",
  "explicit separators",
  "execution-attempt-prohibited-content"
]) {
  requireIncludes(
    "supabase/migrations/20260629004400_execution_attempt_durable_store_identifier_guard_word_boundary.sql",
    identifierGuardWordBoundaryMigration,
    expected
  );
}

for (const expected of [
  "compute_fabric_telemetry",
  "compute_fabric_audit_hash",
  "compute_fabric_selected_model",
  "compute_fabric_model_tier",
  "compute_fabric_provider",
  "compute_fabric_deployment_mode",
  "compute_fabric_phi_policy",
  "compute_fabric_human_review_required",
  "compute_fabric_fallback_models",
  "require_execution_attempt_compute_fabric",
  "populate_execution_attempt_compute_fabric_columns",
  "execution-attempt-compute-fabric-required",
  "execution-attempt-compute-fabric-evidence-binding-mismatch",
  "confidence-is-not-correctness",
  "metadata-only-no-live-model-call",
  "synthetic-routing-only-no-live-model-calls",
  "no-live-model-call",
  "no-autonomous-clinical-authority",
  "execution_attempts_compute_fabric_model_tier_idx",
  "computeFabricTelemetry",
  "computeFabricAuditHash"
]) {
  requireIncludes(
    "supabase/migrations/20260705164000_execution_attempt_compute_fabric_evidence_binding.sql",
    computeFabricMigration,
    expected
  );
}

for (const expected of [
  "SCRIMED_BEARER_TOKEN",
  "SCRIMED_REQUIRE_AUTHENTICATED_SMOKE",
  "analyzeAal2BearerToken",
  "skip authenticated durable-store happy path: ${redactSensitive(tokenFailureMessage)}",
  "--strict",
  "execution-attempt-idempotent-replay",
  "execution-attempt-metadata-replayed",
  "no-phi-human-review-no-clinical-authority",
  "synthetic-and-metadata-only"
]) {
  requireIncludes("scripts/execution-attempt-durable-store-authenticated-smoke.mjs", authenticatedSmoke, expected);
}

for (const expected of [
  "scrimed-aal2-smoke-readiness-preflight",
  "strictAttemptReady",
  "operator-token-ready",
  "operator-token-blocked",
  "SCRIMED_BEARER_TOKEN",
  "formatAal2TokenReport",
  "npm run smoke:aal2:durable-store:strict",
  "npm run smoke:scrimed-stored-vector-rpc:strict",
  "no token logging",
  "protected APIs remain the source of truth"
]) {
  requireIncludes("scripts/aal2-smoke-readiness-preflight.mjs", aal2ReadinessPreflight, expected);
}

for (const expected of [
  "SCRIMED_BEARER_TOKEN",
  "--write-env-local",
  "--clipboard-token",
  "--clear-clipboard",
  "--prompt-token",
  "--session-file",
  "redactSensitive",
  "pilot_memberships",
  "tenant-admin",
  "pilot-lead",
  "reviewer"
]) {
  requireIncludes("scripts/aal2-bearer-token-helper.mjs", aal2TokenHelper, expected);
}

for (const expected of [
  "aal=aal2",
  "session_id",
  "tokenFingerprint",
  "isDurableStoreAuthorizedRole",
  "redactSensitive",
  "tenant-admin",
  "pilot-lead",
  "reviewer"
]) {
  requireIncludes("scripts/lib/aal2-token-policy.mjs", aal2TokenPolicy, expected);
}

for (const expected of [
  "QaAal2SmokeReadinessPacket",
  "aal2-smoke-readiness-preflight-ready-no-secret",
  "qaAal2SmokeReadinessApiRoute",
  "qaAal2SmokeReadinessBriefRoute",
  "SCRIMED AAL2 Smoke Readiness is a no-secret operator preflight",
  "strictAttemptReady: false",
  "tokenMaterialStored: false",
  "tokenMaterialPrinted: false",
  "npm run smoke:aal2:readiness",
  "npm run smoke:aal2:durable-store:strict",
  "npm run smoke:scrimed-stored-vector-rpc:strict",
  "Missing SCRIMED_BEARER_TOKEN fails closed",
  "protected APIs remain the source of truth"
]) {
  requireIncludes("app/lib/qaAal2RunEvidence.ts", qaAal2RunEvidence, expected);
}

for (const expected of [
  "getQaAal2SmokeReadinessPacket",
  "X-SCRIMED-QA-Evidence",
  "aal2-smoke-readiness-preflight",
  "X-SCRIMED-QA-Proof",
  "no-secret-operator-readiness-only",
  "not-authorized-production-phi",
  "not-security-certified"
]) {
  requireIncludes(
    "app/api/qa-evidence/aal2-smoke-readiness/route.ts",
    qaAal2SmokeReadinessRoute,
    expected
  );
}

for (const expected of [
  "buildQaAal2SmokeReadinessBrief",
  "X-SCRIMED-QA-Evidence",
  "aal2-smoke-readiness-brief",
  "text/markdown",
  "no-secret-operator-readiness-only",
  "not-authorized-production-phi",
  "not-security-certified"
]) {
  requireIncludes(
    "app/api/qa-evidence/aal2-smoke-readiness/brief/route.ts",
    qaAal2SmokeReadinessBriefRoute,
    expected
  );
}

for (const expected of [
  "Smoke Readiness Brief",
  "Smoke Readiness API",
  "evidence.smokeReadiness.gates",
  "evidence.smokeReadiness.commands",
  "evidence.smokeReadiness.guardrails",
  "evidence.smokeReadiness.failureModes"
]) {
  requireIncludes("app/qa-aal2-run-evidence/page.tsx", qaAal2RunEvidencePage, expected);
}

for (const expected of [
  "checkExecutionAttemptDurableStore",
  "/api/workflows/execution-attempts/durable-store",
  "/api/workflows/execution-attempts/durable-store/record",
  "/api/workflows/execution-attempts/durable-store/replay",
  "/api/workflows/execution-attempts/durable-store/review-disposition",
  "durable-attempt-store-no-protected-execution"
]) {
  requireIncludes("scripts/public-production-smoke.mjs", smoke, expected);
}

for (const expected of [
  "aal2-smoke-readiness-preflight",
  "/api/qa-evidence/aal2-smoke-readiness",
  "/api/qa-evidence/aal2-smoke-readiness/brief",
  "QA AAL2 smoke readiness",
  "no-secret-operator-readiness-only",
  "response must not contain JWT-like material"
]) {
  requireIncludes("scripts/public-production-smoke.mjs", smoke, expected);
}

for (const expected of [
  "smoke:aal2:token",
  "smoke:aal2:readiness",
  "smoke:aal2:durable-store",
  "smoke:aal2:durable-store:strict",
  "smoke:aal2:policy-test"
]) {
  requireIncludes("package.json", files["package.json"], expected);
}

for (const expected of [".env.local", ".env.*.local"]) {
  requireIncludes(".gitignore", files[".gitignore"], expected);
}

for (const expected of [
  "npm run smoke:aal2:readiness",
  "npm run smoke:aal2:token",
  "npm run smoke:aal2:durable-store:strict",
  "/api/qa-evidence/aal2-smoke-readiness",
  "SCRIMED_BEARER_TOKEN",
  "Do not commit",
  "tenant-admin",
  "pilot-lead",
  "reviewer"
]) {
  requireIncludes("docs/aal2-durable-store-smoke.md", files["docs/aal2-durable-store-smoke.md"], expected);
}

console.log("pass execution attempt durable store contract check");
