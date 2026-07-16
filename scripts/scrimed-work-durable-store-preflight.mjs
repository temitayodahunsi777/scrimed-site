#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import {
  aal2SignatureVerification,
  analyzeAal2BearerToken,
  formatAal2TokenReport,
  redactSensitive
} from "./lib/aal2-token-policy.mjs";
import { loadLocalEnv } from "./lib/local-env.mjs";

loadLocalEnv();

const strict = process.argv.includes("--strict");
const migrationPath = "supabase/migrations/20260709193000_scrimed_work_durable_store.sql";
const lifecycleMigrationPath = "supabase/migrations/20260713160000_scrimed_work_lifecycle_hardening.sql";
const advisorIndexMigrationPath = "supabase/migrations/20260713163000_scrimed_work_advisor_index_hardening.sql";
const artifactReviewMigrationPath = "supabase/migrations/20260713210000_scrimed_work_artifact_review_binding.sql";
const reviewerQueueMigrationPath = "supabase/migrations/20260714163930_scrimed_work_reviewer_queue.sql";
const reviewerApprovalMigrationPath = "supabase/migrations/20260715143000_scrimed_work_review_queue_approval_step.sql";
const artifactSessionBindingMigrationPath = "supabase/migrations/20260716012403_scrimed_work_artifact_session_binding.sql";
const approvalEvidenceBindingMigrationPath = "supabase/migrations/20260716015159_scrimed_work_approval_evidence_binding.sql";
const completionQueueMigrationPath = "supabase/migrations/20260716030000_scrimed_work_completion_queue.sql";
const requiredEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SCRIMED_PILOT_INTAKE_PERSISTENCE_TOKEN",
  "SCRIMED_WORK_PROTECTED_WRITES_ENABLED",
  "SCRIMED_WORK_DURABLE_STORE_ENABLED",
  "SCRIMED_WORK_MIGRATIONS_VERIFIED",
  "SCRIMED_WORK_MIGRATION_EVIDENCE_ID",
  "SCRIMED_WORK_REVIEW_QUEUE_APPROVAL_MIGRATION_VERIFIED",
  "SCRIMED_WORK_REVIEW_QUEUE_APPROVAL_MIGRATION_EVIDENCE_ID",
  "SCRIMED_WORKSPACE_SLUG"
];
const trueOnlyEnv = new Set([
  "SCRIMED_WORK_PROTECTED_WRITES_ENABLED",
  "SCRIMED_WORK_DURABLE_STORE_ENABLED",
  "SCRIMED_WORK_MIGRATIONS_VERIFIED",
  "SCRIMED_WORK_REVIEW_QUEUE_APPROVAL_MIGRATION_VERIFIED"
]);

function hasEnv(name) {
  return typeof process.env[name] === "string" && process.env[name].trim().length > 0;
}

function check(condition, checkName, detail, severity = "required") {
  return {
    check: checkName,
    passed: Boolean(condition),
    severity,
    detail
  };
}

function requireIncludes(text, needle) {
  return text.includes(needle);
}

function requireRegex(text, pattern) {
  return pattern.test(text);
}

function summarizeEnvironment() {
  return Object.fromEntries(
    requiredEnv.map((name) => [
      name,
      trueOnlyEnv.has(name) ? process.env[name] === "true" : hasEnv(name)
    ])
  );
}

const migration = await readFile(migrationPath, "utf8");
const lifecycleMigration = await readFile(lifecycleMigrationPath, "utf8");
const advisorIndexMigration = await readFile(advisorIndexMigrationPath, "utf8");
const artifactReviewMigration = await readFile(artifactReviewMigrationPath, "utf8");
const reviewerQueueMigration = await readFile(reviewerQueueMigrationPath, "utf8");
const reviewerApprovalMigration = await readFile(reviewerApprovalMigrationPath, "utf8");
const artifactSessionBindingMigration = await readFile(artifactSessionBindingMigrationPath, "utf8");
const approvalEvidenceBindingMigration = await readFile(approvalEvidenceBindingMigrationPath, "utf8");
const completionQueueMigration = await readFile(completionQueueMigrationPath, "utf8");
const tokenAnalysis = analyzeAal2BearerToken({
  bearerToken: process.env.SCRIMED_BEARER_TOKEN,
  workspaceSlug: process.env.SCRIMED_WORKSPACE_SLUG ?? process.env.SCRIMED_WORK_DEFAULT_WORKSPACE_SLUG ?? ""
});
const checks = [
  check(requireIncludes(migration, "private.scrimed_work_sessions"), "migration-sessions-table", "Private session table exists."),
  check(requireIncludes(migration, "private.scrimed_work_artifacts"), "migration-artifacts-table", "Private artifact table exists."),
  check(requireIncludes(migration, "private.scrimed_work_audit_events"), "migration-audit-events-table", "Private audit event table exists."),
  check(requireRegex(migration, /alter table private\.scrimed_work_sessions enable row level security/i), "rls-sessions-enabled", "RLS is enabled for sessions."),
  check(requireRegex(migration, /alter table private\.scrimed_work_artifacts enable row level security/i), "rls-artifacts-enabled", "RLS is enabled for artifacts."),
  check(requireRegex(migration, /alter table private\.scrimed_work_audit_events enable row level security/i), "rls-audit-enabled", "RLS is enabled for audit events."),
  check(requireIncludes(migration, "create policy scrimed_work_sessions_deny_all"), "sessions-deny-policy", "Restrictive deny policy exists for sessions."),
  check(requireIncludes(migration, "create policy scrimed_work_artifacts_deny_all"), "artifacts-deny-policy", "Restrictive deny policy exists for artifacts."),
  check(requireIncludes(migration, "create policy scrimed_work_audit_events_deny_all"), "audit-deny-policy", "Restrictive deny policy exists for audit events."),
  check(requireIncludes(migration, "revoke all on private.scrimed_work_sessions from public, anon, authenticated"), "direct-session-access-revoked", "Direct session table access is revoked."),
  check(requireIncludes(migration, "private.require_governance_workspace"), "aal2-governance-workspace-gate", "RPCs delegate to the existing AAL2 governance workspace gate."),
  check(requireIncludes(migration, "private.reject_scrimed_work_prohibited_text"), "prohibited-content-guard", "SQL content guard blocks PHI/token-like values."),
  check(requireIncludes(migration, "public.record_scrimed_work_session"), "record-session-rpc", "Public record session RPC exists."),
  check(requireIncludes(migration, "public.get_scrimed_work_session"), "get-session-rpc", "Public get session RPC exists."),
  check(requireIncludes(migration, "public.transition_scrimed_work_session"), "transition-session-rpc", "Public transition session RPC exists."),
  check(requireIncludes(migration, "public.record_scrimed_work_artifact"), "record-artifact-rpc", "Public artifact RPC exists."),
  check(!/function public\.[\s\S]*?security definer/i.test(migration), "public-rpc-security-invoker-only", "Public RPC wrappers do not use SECURITY DEFINER."),
  check(requireRegex(migration, /security invoker/i), "public-rpc-security-invoker-present", "Public RPC wrappers use SECURITY INVOKER."),
  check(requireIncludes(migration, "grant execute on function public.record_scrimed_work_session"), "authenticated-execute-grant", "Authenticated execute grant exists for public wrapper."),
  check(!/service_role;\s*grant execute on function public/i.test(migration), "service-role-not-publicly-expanded", "Migration does not grant public wrappers to service_role."),
  check(requireIncludes(lifecycleMigration, "private.scrimed_work_transition_keys"), "lifecycle-idempotency-ledger", "Private transition idempotency ledger exists."),
  check(requireRegex(lifecycleMigration, /alter table private\.scrimed_work_transition_keys enable row level security/i), "lifecycle-ledger-rls", "RLS is enabled for the transition ledger."),
  check(requireIncludes(lifecycleMigration, "scrimed_work_transition_keys_deny_all"), "lifecycle-ledger-deny-policy", "Transition ledger has a restrictive deny policy."),
  check(requireIncludes(lifecycleMigration, "private.scrimed_work_transition_allowed"), "lifecycle-state-machine", "Database lifecycle state machine exists."),
  check(requireIncludes(lifecycleMigration, "for update"), "lifecycle-authoritative-lock", "Transitions lock the authoritative durable session."),
  check(requireIncludes(lifecycleMigration, "scrimed-work-status-history-conflict"), "lifecycle-append-only-history", "Append-only status history is enforced."),
  check(requireIncludes(lifecycleMigration, "scrimed-work-independent-reviewer-required"), "lifecycle-separation-of-duties", "Independent reviewer separation is enforced."),
  check(requireIncludes(lifecycleMigration, "idempotentReplay"), "lifecycle-idempotent-replay", "Transition replay returns explicit idempotency metadata."),
  check(requireIncludes(advisorIndexMigration, "scrimed_work_artifacts_tenant_created_idx"), "advisor-artifact-tenant-index", "Artifact tenant foreign key has a covering index."),
  check(requireIncludes(advisorIndexMigration, "scrimed_work_audit_events_tenant_created_idx"), "advisor-audit-tenant-index", "Audit tenant foreign key has a covering index."),
  check(requireIncludes(advisorIndexMigration, "scrimed_work_audit_events_artifact_idx"), "advisor-audit-artifact-index", "Audit artifact foreign key has a covering index."),
  check(requireIncludes(artifactReviewMigration, "private.scrimed_work_artifact_reviews"), "artifact-review-ledger", "Private append-only artifact review ledger exists."),
  check(requireRegex(artifactReviewMigration, /alter table private\.scrimed_work_artifact_reviews enable row level security/i), "artifact-review-rls", "RLS is enabled for artifact reviews."),
  check(requireIncludes(artifactReviewMigration, "revoke all on private.scrimed_work_artifact_reviews from public, anon, authenticated"), "artifact-review-direct-access-revoked", "Direct artifact-review access is revoked."),
  check(requireIncludes(artifactReviewMigration, "scrimed_work_artifact_reviews_deny_all"), "artifact-review-deny-policy", "Artifact reviews have a restrictive deny policy."),
  check(requireIncludes(artifactReviewMigration, "array['reviewer']"), "artifact-review-reviewer-only", "Artifact review requires the reviewer membership role."),
  check(requireIncludes(artifactReviewMigration, "scrimed-work-independent-reviewer-required"), "artifact-review-separation-of-duties", "Artifact creator and reviewer separation is enforced."),
  check(requireIncludes(artifactReviewMigration, "expected_reviewer_identity_hash"), "artifact-review-identity-binding", "Reviewer identity hash is recomputed in the database."),
  check(requireIncludes(artifactReviewMigration, "expected_review_decision_hash"), "artifact-review-decision-binding", "Review decision hash is recomputed in the database."),
  check(requireIncludes(artifactReviewMigration, "scrimed-work-artifact-review-mutation-scope-violation"), "artifact-review-immutable-payload", "Review can mutate only review and verification metadata."),
  check(requireIncludes(artifactReviewMigration, "scrimed-work-artifact-review-verification-required"), "artifact-review-verification-required", "Internal-use approval requires mandatory verification."),
  check(requireIncludes(artifactReviewMigration, "external_distribution_allowed boolean not null default false check (not external_distribution_allowed)"), "artifact-review-external-distribution-blocked", "External distribution remains structurally blocked."),
  check(requireIncludes(artifactReviewMigration, "payer_submission_allowed boolean not null default false check (not payer_submission_allowed)"), "artifact-review-payer-submission-blocked", "Payer submission remains structurally blocked."),
  check(requireIncludes(artifactReviewMigration, "artifact-review-idempotency-reused"), "artifact-review-idempotent-audit", "Idempotent review replays produce an audit event."),
  check(requireIncludes(artifactReviewMigration, "create or replace function public.review_scrimed_work_artifact"), "artifact-review-public-wrapper", "Public artifact-review RPC wrapper exists."),
  check(requireRegex(artifactReviewMigration, /language sql[\s\S]*?security invoker/i), "artifact-review-wrapper-security-invoker", "Artifact-review public wrapper uses SECURITY INVOKER."),
  check(requireIncludes(artifactReviewMigration, "grant execute on function public.review_scrimed_work_artifact"), "artifact-review-authenticated-grant", "Only the authenticated wrapper execution path is granted."),
  check(requireIncludes(reviewerQueueMigration, "private.list_scrimed_work_artifact_review_queue"), "review-queue-private-rpc", "Private reviewer queue RPC exists."),
  check(requireIncludes(reviewerQueueMigration, "array['reviewer']"), "review-queue-reviewer-only", "Review queue requires reviewer membership."),
  check(requireIncludes(reviewerQueueMigration, "session.created_by <> (select auth.uid())"), "review-queue-session-separation", "Session creator is excluded from the review queue."),
  check(requireIncludes(reviewerQueueMigration, "artifact.created_by <> (select auth.uid())"), "review-queue-artifact-separation", "Artifact creator is excluded from the review queue."),
  check(requireIncludes(reviewerQueueMigration, "limit p_limit"), "review-queue-bounded", "Review queue output is bounded."),
  check(requireIncludes(reviewerQueueMigration, "artifact-review-queue-viewed"), "review-queue-audited", "Every reviewer queue read emits an audit event."),
  check(requireIncludes(reviewerQueueMigration, "public.list_scrimed_work_artifact_review_queue"), "review-queue-public-wrapper", "Public reviewer queue wrapper exists."),
  check(requireRegex(reviewerQueueMigration, /language sql[\s\S]*?security invoker/i), "review-queue-wrapper-security-invoker", "Reviewer queue public wrapper uses SECURITY INVOKER."),
  check(requireIncludes(reviewerQueueMigration, "externalDistributionAllowed', false"), "review-queue-distribution-blocked", "Reviewer queue fixes external distribution false."),
  check(requireIncludes(reviewerQueueMigration, "payerSubmissionAllowed', false"), "review-queue-payer-blocked", "Reviewer queue fixes payer submission false."),
  check(requireIncludes(reviewerApprovalMigration, "session.status in ('awaiting_approval', 'verifying')"), "review-queue-session-approval-step", "Reviewer queue exposes awaiting-approval metadata before artifact disposition."),
  check(requireIncludes(reviewerApprovalMigration, "sessionApprovalStepExposed', true"), "review-queue-session-approval-audit", "Reviewer queue audit evidence identifies the explicit session-approval step."),
  check(requireIncludes(reviewerApprovalMigration, "array['reviewer']"), "review-queue-approval-reviewer-only", "Two-step review queue remains reviewer-only."),
  check(requireIncludes(reviewerApprovalMigration, "session.created_by <> (select auth.uid())"), "review-queue-approval-separation", "Two-step review queue retains creator separation."),
  check(requireRegex(reviewerApprovalMigration, /language sql[\s\S]*?security invoker/i), "review-queue-approval-wrapper-security-invoker", "Two-step review queue public wrapper uses SECURITY INVOKER."),
  check(requireIncludes(reviewerApprovalMigration, "externalDistributionAllowed', false"), "review-queue-approval-distribution-blocked", "Two-step review queue keeps external distribution blocked."),
  check(requireIncludes(reviewerApprovalMigration, "payerSubmissionAllowed', false"), "review-queue-approval-payer-blocked", "Two-step review queue keeps payer submission blocked."),
  check(requireIncludes(artifactSessionBindingMigration, "private.sync_scrimed_work_artifact_payload_to_session"), "artifact-session-binding-function", "Persisted artifacts are synchronized into their authoritative session payload."),
  check(requireIncludes(artifactSessionBindingMigration, "scrimed_work_artifact_payload_session_sync"), "artifact-session-binding-trigger", "Artifact persistence and payload updates trigger authoritative session synchronization."),
  check(requireIncludes(artifactSessionBindingMigration, "scrimed-work-artifact-session-sync-binding-conflict"), "artifact-session-binding-identity-check", "Session synchronization validates artifact and session identifiers."),
  check(requireIncludes(artifactSessionBindingMigration, "after insert or update of artifact_payload"), "artifact-session-binding-write-coverage", "New and reviewed artifact payloads remain synchronized."),
  check(requireIncludes(artifactSessionBindingMigration, "not exists"), "artifact-session-binding-backfill", "Previously persisted artifacts receive a bounded consistency repair."),
  check(requireIncludes(artifactSessionBindingMigration, "revoke all on function private.sync_scrimed_work_artifact_payload_to_session()"), "artifact-session-binding-direct-execution-revoked", "Direct synchronization-function execution remains revoked."),
  check(requireIncludes(approvalEvidenceBindingMigration, "private.bind_scrimed_work_approval_evidence"), "approval-evidence-binding-function", "Independent approval evidence is bound by a private trigger function."),
  check(requireIncludes(approvalEvidenceBindingMigration, "scrimed_work_approval_evidence_binding"), "approval-evidence-binding-trigger", "Approval evidence binding runs on authoritative session updates."),
  check(requireIncludes(approvalEvidenceBindingMigration, "session-evidence-bound"), "approval-evidence-binding-audit", "Approval evidence binding emits a dedicated audit event."),
  check(requireIncludes(approvalEvidenceBindingMigration, "independent reviewer approval"), "approval-evidence-binding-requirement", "Only contracts requiring independent approval receive lifecycle evidence."),
  check(requireIncludes(approvalEvidenceBindingMigration, "revoke all on function private.bind_scrimed_work_approval_evidence()"), "approval-evidence-binding-direct-execution-revoked", "Direct approval-evidence function execution remains revoked."),
  check(requireIncludes(approvalEvidenceBindingMigration, "update private.scrimed_work_sessions session"), "approval-evidence-binding-backfill", "Previously approved synthetic sessions receive bounded lifecycle evidence."),
  check(requireIncludes(completionQueueMigration, "private.list_scrimed_work_completion_queue"), "completion-queue-private-rpc", "Private completion queue RPC exists."),
  check(requireIncludes(completionQueueMigration, "array['tenant-admin', 'pilot-lead']"), "completion-queue-operator-only", "Completion queue requires tenant-admin or pilot-lead membership."),
  check(requireIncludes(completionQueueMigration, "session.status = 'verifying'"), "completion-queue-verifying-only", "Completion queue lists only verifying sessions."),
  check(requireIncludes(completionQueueMigration, "review.disposition = 'approved_for_internal_use'"), "completion-queue-independent-review", "Completion queue requires an approved independent disposition."),
  check(requireIncludes(completionQueueMigration, "artifact.artifact_payload #>> '{verification,allPass}' = 'true'"), "completion-queue-verification-pass", "Completion queue requires current all-pass verification metadata."),
  check(requireIncludes(completionQueueMigration, "session-completion-queue-viewed"), "completion-queue-audited", "Every completion queue read emits an audit event."),
  check(requireIncludes(completionQueueMigration, "public.list_scrimed_work_completion_queue"), "completion-queue-public-wrapper", "Public completion queue wrapper exists."),
  check(requireRegex(completionQueueMigration, /language sql[\s\S]*?security invoker/i), "completion-queue-wrapper-security-invoker", "Completion queue public wrapper uses SECURITY INVOKER."),
  check(requireIncludes(completionQueueMigration, "externalDistributionAllowed', false"), "completion-queue-distribution-blocked", "Completion queue fixes external distribution false."),
  check(requireIncludes(completionQueueMigration, "payerSubmissionAllowed', false"), "completion-queue-payer-blocked", "Completion queue fixes payer submission false."),
  check(requireIncludes(completionQueueMigration, "ehrWritebackAllowed', false"), "completion-queue-ehr-blocked", "Completion queue fixes EHR writeback false.")
];

for (const name of requiredEnv) {
  const configured = hasEnv(name);
  const trueOnly = trueOnlyEnv.has(name);
  const enabledFlag = trueOnly ? process.env[name] === "true" : true;

  checks.push(
    check(
      configured && enabledFlag,
      `env-${name.toLowerCase()}`,
      trueOnly
        ? `${name} must be explicitly true for strict durable-store smoke.`
        : `${name} must be configured for strict durable-store smoke.`,
      "operator"
    )
  );
}

checks.push(
  check(
    tokenAnalysis.ok,
    "aal2-token-preflight",
    tokenAnalysis.ok
      ? `AAL2 token preflight passed: ${formatAal2TokenReport(tokenAnalysis)}`
      : `AAL2 token preflight not ready: ${tokenAnalysis.errors.join(" ")}`,
    "operator"
  )
);

const requiredFailures = checks.filter((item) => item.severity === "required" && !item.passed);
const operatorFailures = checks.filter((item) => item.severity === "operator" && !item.passed);
const status = requiredFailures.length > 0 ? "fail" : operatorFailures.length > 0 ? "operator-action-required" : "ready";
const report = {
  service: "scrimed-work-durable-store-preflight",
  status,
  strict,
  migrationPath,
  migrationPaths: [
    migrationPath,
    lifecycleMigrationPath,
    advisorIndexMigrationPath,
    artifactReviewMigrationPath,
    reviewerQueueMigrationPath,
    reviewerApprovalMigrationPath,
    artifactSessionBindingMigrationPath,
    approvalEvidenceBindingMigrationPath,
    completionQueueMigrationPath
  ],
  environment: summarizeEnvironment(),
  token: {
    provided: hasEnv("SCRIMED_BEARER_TOKEN"),
    ok: tokenAnalysis.ok,
    fingerprint: tokenAnalysis.tokenFingerprint ?? "missing",
    signature: tokenAnalysis.ok
      ? aal2SignatureVerification.localPreflight
      : "not-verified-invalid-or-missing"
  },
  checks,
  next:
    status === "ready"
      ? "Reviewed non-production migration evidence is configured; run npm run smoke:scrimed-work:strict, then retain the no-PHI canary evidence."
      : "Configure missing operator inputs, confirm reviewed migration history and evidence for every SCRIMED Work migration on the approved no-PHI target, then rerun this preflight in strict mode.",
  boundaries: [
    "No secrets, bearer tokens, Supabase keys, PHI, raw connector payloads, or patient data are printed.",
    "This preflight does not apply migrations, mutate Supabase, approve production use, or authorize live clinical workflows."
  ]
};

console.log(redactSensitive(JSON.stringify(report, null, 2)));

if (requiredFailures.length > 0 || (strict && operatorFailures.length > 0)) {
  process.exit(1);
}
