import {
  scrimedComputeFabricStatus,
  scrimedComputeFabricVersion
} from "./scrimedComputeFabric";
import {
  executionAttemptDurableStoreContractVersion,
  executionAttemptDurableStoreStatus
} from "./executionAttemptDurableStore";

export type ComputeFabricMigrationPreflightCheckStatus =
  | "pass-no-secret"
  | "operator-action-required"
  | "blocked-until-aal2-smoke";

export type ComputeFabricMigrationPreflightCheck = {
  id: string;
  label: string;
  status: ComputeFabricMigrationPreflightCheckStatus;
  evidence: string;
  failureMode: string;
  nextAction: string;
};

export type ComputeFabricMigrationPreflightSummary = {
  service: "scrimed-compute-fabric-migration-preflight";
  status: typeof computeFabricMigrationPreflightStatus;
  route: typeof computeFabricMigrationPreflightRoute;
  apiRoute: typeof computeFabricMigrationPreflightApiRoute;
  briefRoute: typeof computeFabricMigrationPreflightBriefRoute;
  migration: typeof computeFabricMigrationFilename;
  prerequisiteMigrations: string[];
  fabricVersion: typeof scrimedComputeFabricVersion;
  fabricStatus: typeof scrimedComputeFabricStatus;
  durableStoreContractVersion: typeof executionAttemptDurableStoreContractVersion;
  durableStoreStatus: typeof executionAttemptDurableStoreStatus;
  noPhiConfirmed: true;
  liveDatabaseTouched: false;
  migrationApplied: false;
  productionApproval: false;
  protectedHumanRunRequired: true;
  requiredColumns: string[];
  requiredGuards: string[];
  requiredIndexes: string[];
  operatorCommands: string[];
  checks: ComputeFabricMigrationPreflightCheck[];
  rollbackPlan: string[];
  blockedClaims: string[];
  boundary: typeof computeFabricMigrationPreflightBoundary;
};

export const computeFabricMigrationPreflightStatus =
  "compute-fabric-migration-preflight-ready-no-secret";
export const computeFabricMigrationPreflightRoute =
  "/api/scrimed-compute-fabric/migration-preflight";
export const computeFabricMigrationPreflightApiRoute =
  "/api/scrimed-compute-fabric/migration-preflight";
export const computeFabricMigrationPreflightBriefRoute =
  "/api/scrimed-compute-fabric/migration-preflight/brief";
export const computeFabricMigrationFilename =
  "20260705164000_execution_attempt_compute_fabric_evidence_binding.sql";

export const computeFabricMigrationPreflightBoundary =
  "SCRIMED Compute Fabric Migration Preflight is no-secret, metadata-only operator readiness evidence for the durable-store Compute Fabric projection migration. It does not apply migrations, connect to Supabase, process PHI, call models, approve production routing, authorize clinical care, authorize payer submission, write to EHRs, or create customer go-live approval.";

const prerequisiteMigrations = [
  "20260627191852_execution_attempt_durable_store.sql",
  "20260627214607_execution_attempt_durable_store_rpc_hardening.sql",
  "20260627222843_execution_attempt_durable_store_advisor_alignment.sql",
  "20260629003600_execution_attempt_durable_store_phi_guard_precision.sql",
  "20260629004400_execution_attempt_durable_store_identifier_guard_word_boundary.sql"
];

const requiredColumns = [
  "compute_fabric_telemetry",
  "compute_fabric_audit_hash",
  "compute_fabric_selected_model",
  "compute_fabric_model_tier",
  "compute_fabric_provider",
  "compute_fabric_deployment_mode",
  "compute_fabric_phi_policy",
  "compute_fabric_human_review_required",
  "compute_fabric_fallback_models"
];

const requiredGuards = [
  "require_execution_attempt_compute_fabric",
  "populate_execution_attempt_compute_fabric_columns",
  "execution-attempt-compute-fabric-required",
  "execution-attempt-compute-fabric-boundary-violation",
  "execution-attempt-compute-fabric-confidence-boundary-required",
  "execution-attempt-compute-fabric-evidence-binding-mismatch",
  "execution-attempt-compute-fabric-human-review-required",
  "metadata-only-no-live-model-call",
  "confidence-is-not-correctness",
  "no-live-model-call",
  "no-autonomous-clinical-authority"
];

const requiredIndexes = [
  "execution_attempts_compute_fabric_model_tier_idx",
  "execution_attempts_compute_fabric_phi_policy_idx",
  "execution_attempts_compute_fabric_audit_hash_idx"
];

const blockedClaims = [
  "migration applied to live Supabase",
  "production model routing approved",
  "PHI processing authorized",
  "live clinical care authorized",
  "final imaging interpretation authorized",
  "payer submission authorized",
  "EHR writeback authorized",
  "customer go-live approved",
  "HIPAA, SOC, FDA, or security certification achieved"
];

const rollbackPlan = [
  "Keep SCRIMED_EXECUTION_ATTEMPT_DURABLE_STORE_ENABLED=false until the target migration state and AAL2 smoke pass.",
  "If a live apply fails, stop protected writes, retain migration logs outside source, and do not retry with broadened permissions.",
  "If trigger validation rejects a record, treat the envelope as unsafe or stale and regenerate no-PHI server-side evidence.",
  "If replay JSON projection differs from envelope evidence, block release and inspect compute_fabric_audit_hash parity.",
  "Do not delete existing durable evidence without retention, legal, privacy, and incident-review approval."
];

const operatorCommands = [
  "npm run smoke:scrimed-compute-fabric",
  "npm run smoke:execution-attempt-durable-store",
  "npm run test:nonsecret",
  "npm run typecheck",
  "npm run lint",
  "npm run build",
  "git diff --check",
  "npm run smoke:aal2:durable-store:strict"
];

function check(input: ComputeFabricMigrationPreflightCheck): ComputeFabricMigrationPreflightCheck {
  return input;
}

function getChecks(): ComputeFabricMigrationPreflightCheck[] {
  return [
    check({
      id: "migration-order-preflight",
      label: "Migration order and dependency guard",
      status: "pass-no-secret",
      evidence:
        "Compute Fabric projection migration is ordered after durable-store base, RPC hardening, advisor alignment, PHI guard precision, and identifier guard migrations.",
      failureMode:
        "Applying projection before durable-store tables/functions exist can leave trigger or JSON projection functions unresolved.",
      nextAction: "Verify migration history in the target Supabase project before applying."
    }),
    check({
      id: "first-class-compute-fabric-columns",
      label: "First-class Compute Fabric evidence columns",
      status: "pass-no-secret",
      evidence: requiredColumns.join(", "),
      failureMode:
        "If these columns are missing, replay and diligence packets cannot query selected model, tier, PHI policy, fallback path, or audit hash without parsing envelope JSON.",
      nextAction: "Run structural SQL verification after apply and compare returned columns to this list."
    }),
    check({
      id: "trigger-extraction-validation",
      label: "Trigger extraction and validation",
      status: "pass-no-secret",
      evidence:
        "The migration requires require_execution_attempt_compute_fabric and populate_execution_attempt_compute_fabric_columns before insert/update projection.",
      failureMode:
        "Without trigger validation, stale envelopes could persist without no-live-model-call, confidence-is-not-correctness, human-review, or evidence-hash parity.",
      nextAction: "Record only server-known no-PHI envelopes through the protected RPC path."
    }),
    check({
      id: "high-risk-human-review-enforced",
      label: "High-risk human review enforcement",
      status: "pass-no-secret",
      evidence:
        "High and prohibited clinical-risk rows require compute_fabric_human_review_required=true.",
      failureMode:
        "High-risk clinical attempts could appear routable without accountable human review.",
      nextAction: "Keep clinical outputs held for human review and do not promote model confidence to correctness."
    }),
    check({
      id: "replay-json-projection",
      label: "Replay JSON projection",
      status: "pass-no-secret",
      evidence:
        "private.execution_attempt_json returns computeFabricTelemetry, computeFabricAuditHash, selected model, tier, provider, deployment mode, PHI policy, human-review flag, and fallback models.",
      failureMode:
        "Replay responses could omit the evidence needed for audit, buyer diligence, or reviewer verification.",
      nextAction: "Run authenticated replay smoke after migration apply and compare projection fields to retained envelope telemetry."
    }),
    check({
      id: "live-apply-blocked-until-human-aal2",
      label: "Live apply and strict smoke remain human gated",
      status: "blocked-until-aal2-smoke",
      evidence:
        "This preflight does not apply migrations and cannot prove protected writes without an authorized short-lived AAL2 operator token.",
      failureMode:
        "Treating source preflight as live Supabase verification would overclaim readiness.",
      nextAction: "Apply in the target environment only through approved migration workflow, then run strict AAL2 durable-store smoke."
    })
  ];
}

export function getComputeFabricMigrationPreflightSummary(): ComputeFabricMigrationPreflightSummary {
  return {
    service: "scrimed-compute-fabric-migration-preflight",
    status: computeFabricMigrationPreflightStatus,
    route: computeFabricMigrationPreflightRoute,
    apiRoute: computeFabricMigrationPreflightApiRoute,
    briefRoute: computeFabricMigrationPreflightBriefRoute,
    migration: computeFabricMigrationFilename,
    prerequisiteMigrations,
    fabricVersion: scrimedComputeFabricVersion,
    fabricStatus: scrimedComputeFabricStatus,
    durableStoreContractVersion: executionAttemptDurableStoreContractVersion,
    durableStoreStatus: executionAttemptDurableStoreStatus,
    noPhiConfirmed: true,
    liveDatabaseTouched: false,
    migrationApplied: false,
    productionApproval: false,
    protectedHumanRunRequired: true,
    requiredColumns,
    requiredGuards,
    requiredIndexes,
    operatorCommands,
    checks: getChecks(),
    rollbackPlan,
    blockedClaims,
    boundary: computeFabricMigrationPreflightBoundary
  };
}

export function buildComputeFabricMigrationPreflightBrief() {
  const summary = getComputeFabricMigrationPreflightSummary();

  return [
    "# SCRIMED Compute Fabric Migration Preflight",
    "",
    `Status: ${summary.status}`,
    `Migration: ${summary.migration}`,
    `Live database touched: ${summary.liveDatabaseTouched}`,
    `Migration applied: ${summary.migrationApplied}`,
    `Production approval: ${summary.productionApproval}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Prerequisite Migrations",
    ...summary.prerequisiteMigrations.map((migration) => `- ${migration}`),
    "",
    "## Required Columns",
    ...summary.requiredColumns.map((column) => `- ${column}`),
    "",
    "## Required Guards",
    ...summary.requiredGuards.map((guard) => `- ${guard}`),
    "",
    "## Checks",
    ...summary.checks.map(
      (item) =>
        `- ${item.label} (${item.status}): ${item.evidence} Next: ${item.nextAction}`
    ),
    "",
    "## Operator Commands",
    ...summary.operatorCommands.map((command) => `- ${command}`),
    "",
    "## Rollback Plan",
    ...summary.rollbackPlan.map((step) => `- ${step}`),
    "",
    "## Blocked Claims",
    ...summary.blockedClaims.map((claim) => `- ${claim}`)
  ].join("\n");
}
