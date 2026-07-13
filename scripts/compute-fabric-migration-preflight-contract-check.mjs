#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/computeFabricMigrationPreflight.ts",
  "app/lib/releaseEvidenceLedger.ts",
  "app/api/scrimed-compute-fabric/migration-preflight/route.ts",
  "app/api/scrimed-compute-fabric/migration-preflight/brief/route.ts",
  "docs/scrimed-compute-fabric.md",
  "supabase/migrations/20260705164000_execution_attempt_compute_fabric_evidence_binding.sql",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required Compute Fabric migration preflight text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const preflight = files["app/lib/computeFabricMigrationPreflight.ts"];
const ledger = files["app/lib/releaseEvidenceLedger.ts"];
const route = files["app/api/scrimed-compute-fabric/migration-preflight/route.ts"];
const briefRoute = files["app/api/scrimed-compute-fabric/migration-preflight/brief/route.ts"];
const docs = files["docs/scrimed-compute-fabric.md"];
const migration =
  files["supabase/migrations/20260705164000_execution_attempt_compute_fabric_evidence_binding.sql"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "scrimed-compute-fabric-migration-preflight",
  "compute-fabric-migration-preflight-ready-no-secret",
  "/api/scrimed-compute-fabric/migration-preflight",
  "/api/scrimed-compute-fabric/migration-preflight/brief",
  "20260705164000_execution_attempt_compute_fabric_evidence_binding.sql",
  "20260627191852_execution_attempt_durable_store.sql",
  "20260627214607_execution_attempt_durable_store_rpc_hardening.sql",
  "20260627222843_execution_attempt_durable_store_advisor_alignment.sql",
  "20260629003600_execution_attempt_durable_store_phi_guard_precision.sql",
  "20260629004400_execution_attempt_durable_store_identifier_guard_word_boundary.sql",
  "liveDatabaseTouched: false",
  "migrationApplied: false",
  "productionApproval: false",
  "protectedHumanRunRequired: true",
  "ComputeFabricMigrationPreflightCheck",
  "migration-order-preflight",
  "first-class-compute-fabric-columns",
  "trigger-extraction-validation",
  "high-risk-human-review-enforced",
  "replay-json-projection",
  "live-apply-blocked-until-human-aal2"
]) {
  requireIncludes("app/lib/computeFabricMigrationPreflight.ts", preflight, expected);
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
  "execution-attempt-compute-fabric-evidence-binding-mismatch",
  "confidence-is-not-correctness",
  "metadata-only-no-live-model-call"
]) {
  requireIncludes("app/lib/computeFabricMigrationPreflight.ts", preflight, expected);
  requireIncludes(
    "supabase/migrations/20260705164000_execution_attempt_compute_fabric_evidence_binding.sql",
    migration,
    expected
  );
}

for (const expected of [
  "getComputeFabricMigrationPreflightSummary",
  "X-SCRIMED-Compute-Fabric-Migration-Preflight",
  "X-SCRIMED-Database-Migration-Authority",
  "not-applied-by-this-route",
  "synthetic-and-metadata-only"
]) {
  requireIncludes("app/api/scrimed-compute-fabric/migration-preflight/route.ts", route, expected);
}

for (const expected of [
  "buildComputeFabricMigrationPreflightBrief",
  "scrimed-compute-fabric-migration-preflight.md",
  "text/markdown",
  "X-SCRIMED-Compute-Fabric-Migration-Preflight"
]) {
  requireIncludes("app/api/scrimed-compute-fabric/migration-preflight/brief/route.ts", briefRoute, expected);
}

for (const expected of [
  "compute-fabric-migration-preflight",
  "Compute Fabric durable-store migration preflight",
  "npm run smoke:scrimed-compute-fabric:migration-preflight",
  "computeFabricMigrationPreflightApiRoute",
  "computeFabricMigrationPreflightStatus",
  "does not apply migrations or prove live Supabase state"
]) {
  requireIncludes("app/lib/releaseEvidenceLedger.ts", ledger, expected);
}

for (const expected of [
  "Durable Evidence Binding",
  "20260705164000_execution_attempt_compute_fabric_evidence_binding.sql",
  "The SQL trigger rejects new records missing Compute Fabric evidence"
]) {
  requireIncludes("docs/scrimed-compute-fabric.md", docs, expected);
}

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:scrimed-compute-fabric:migration-preflight\": \"node scripts/compute-fabric-migration-preflight-contract-check.mjs\""
);

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/compute-fabric-migration-preflight-contract-check.mjs"
);

console.log("pass SCRIMED Compute Fabric migration preflight contract check");
