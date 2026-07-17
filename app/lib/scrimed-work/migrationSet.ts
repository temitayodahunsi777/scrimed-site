export const SCRIMED_WORK_REQUIRED_MIGRATION_SET_VERSION = "20260716184500";

export const SCRIMED_WORK_REQUIRED_MIGRATIONS = [
  "supabase/migrations/20260709193000_scrimed_work_durable_store.sql",
  "supabase/migrations/20260713160000_scrimed_work_lifecycle_hardening.sql",
  "supabase/migrations/20260713163000_scrimed_work_advisor_index_hardening.sql",
  "supabase/migrations/20260713210000_scrimed_work_artifact_review_binding.sql",
  "supabase/migrations/20260714163930_scrimed_work_reviewer_queue.sql",
  "supabase/migrations/20260715143000_scrimed_work_review_queue_approval_step.sql",
  "supabase/migrations/20260716012403_scrimed_work_artifact_session_binding.sql",
  "supabase/migrations/20260716015159_scrimed_work_approval_evidence_binding.sql",
  "supabase/migrations/20260716030000_scrimed_work_completion_queue.sql",
  "supabase/migrations/20260716184500_scrimed_work_completion_evidence.sql"
] as const;

export type ScrimedWorkMigrationSetStatus = {
  requiredVersion: typeof SCRIMED_WORK_REQUIRED_MIGRATION_SET_VERSION;
  requiredCount: number;
  configuredCurrent: boolean;
  primaryEvidenceBound: boolean;
  reviewApprovalEvidenceBound: boolean;
  verified: boolean;
};

function hasNonsecretEvidenceId(value: string | undefined) {
  return /^[a-z0-9][a-z0-9._:-]{7,120}$/i.test(value?.trim() ?? "");
}

export function getScrimedWorkMigrationSetStatus(
  env: NodeJS.ProcessEnv = process.env
): ScrimedWorkMigrationSetStatus {
  const configuredCurrent =
    env.SCRIMED_WORK_MIGRATION_SET_VERSION ===
    SCRIMED_WORK_REQUIRED_MIGRATION_SET_VERSION;
  const primaryEvidenceBound =
    env.SCRIMED_WORK_MIGRATIONS_VERIFIED === "true" &&
    hasNonsecretEvidenceId(env.SCRIMED_WORK_MIGRATION_EVIDENCE_ID);
  const reviewApprovalEvidenceBound =
    env.SCRIMED_WORK_REVIEW_QUEUE_APPROVAL_MIGRATION_VERIFIED === "true" &&
    hasNonsecretEvidenceId(
      env.SCRIMED_WORK_REVIEW_QUEUE_APPROVAL_MIGRATION_EVIDENCE_ID
    );

  return {
    requiredVersion: SCRIMED_WORK_REQUIRED_MIGRATION_SET_VERSION,
    requiredCount: SCRIMED_WORK_REQUIRED_MIGRATIONS.length,
    configuredCurrent,
    primaryEvidenceBound,
    reviewApprovalEvidenceBound,
    verified:
      configuredCurrent && primaryEvidenceBound && reviewApprovalEvidenceBound
  };
}

export function isScrimedWorkMigrationSetVerified(
  env: NodeJS.ProcessEnv = process.env
) {
  return getScrimedWorkMigrationSetStatus(env).verified;
}
