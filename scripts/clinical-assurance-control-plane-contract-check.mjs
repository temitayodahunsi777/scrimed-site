#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/clinicalAssuranceControlPlane.ts",
  "app/lib/clinicalEvidenceControls.ts",
  "app/lib/documentationBeforeAuthorization.ts",
  "app/lib/scrimed-work/featureFlags.ts",
  "app/lib/scrimed-work/modelRouter.ts",
  "app/lib/scrimed-work/providerRegistry.ts",
  "app/api/clinical-assurance-control-plane/route.ts",
  "app/api/clinical-assurance-control-plane/brief/route.ts",
  "app/clinical-assurance-control-plane/page.tsx",
  "supabase/migrations/20260718153148_clinical_assurance_control_plane.sql",
  "docs/clinical-assurance-control-plane.md",
  "docs/adr/0001-clinical-assurance-and-sovereign-enclaves.md",
  "docs/runbooks/clinical-assurance-kill-switch.md",
  "docs/runbooks/clinical-assurance-supplier-withdrawal.md",
  "docs/runbooks/clinical-assurance-capacity-scarcity.md",
  "docs/runbooks/clinical-assurance-enclave-recovery.md",
  "docs/clinical-assurance-readiness-checklist.md",
  "scripts/clinical-assurance-control-plane-policy-test.mjs"
];

const files = Object.fromEntries(
  await Promise.all(requiredFiles.map(async (path) => [path, await readFile(path, "utf8")]))
);

function requireIncludes(path, expected) {
  if (!files[path].includes(expected)) throw new Error(`${path} is missing required assurance contract text: ${expected}`);
}

for (const expected of [
  "CAL_0_PUBLIC_ZERO_PHI",
  "CAL_1_STANDARD_PHI",
  "CAL_2_RESTRICTED_CLINICAL",
  "CAL_3_SOVEREIGN_ISOLATED",
  "SovereignClinicalEnclave",
  "ModelPassport",
  "ToolArtifactPassport",
  "ApprovedModelRegistry",
  "CriticalDependencyMap",
  "CapacityPassport",
  "CriticalDependencyEdge",
  "ConcentrationBudget",
  "globalKillSwitch",
  "workflowKillSwitches",
  "signed-authorized-tool-artifacts",
  "validateMateriallyIndependentFallback",
  "evaluateModelPromotion",
  "authorizeClinicalAssuranceInvocation",
  "runSupplierWithdrawalDrill",
  "modelInvocationAuthorized",
  "externalProviderCallAllowed: false",
  "clinicalActionAuthority: false"
]) requireIncludes("app/lib/clinicalAssuranceControlPlane.ts", expected);

for (const expected of [
  "runtimeAuthorization",
  "modelPassportDigest",
  "capacityDecisionId",
  "concentrationDecisionId",
  "routingDecisionId",
  "subgroupEvaluationIds",
  "toolArtifactDigests"
]) requireIncludes("app/lib/clinicalEvidenceControls.ts", expected);

for (const expected of [
  "clinicalAssuranceDecision",
  "authorizeClinicalAssuranceInvocation",
  "runtimeAuthorization: clinicalAssuranceDecision.caseEvidenceBinding"
]) requireIncludes("app/lib/documentationBeforeAuthorization.ts", expected);

for (const expected of [
  "SCRIMED_CLINICAL_ASSURANCE_CONTROL_PLANE_ENABLED",
  "SCRIMED_CLINICAL_ASSURANCE_ENFORCEMENT_ENABLED",
  "SCRIMED_CLINICAL_ASSURANCE_DURABLE_STORE_ENABLED",
  "SCRIMED_SUPPLIER_CONTINUITY_AUTOMATION_ENABLED"
]) requireIncludes("app/lib/scrimed-work/featureFlags.ts", expected);

for (const expected of ["eligibleModelIds", "blockedModelIds", "no-external-call", "silentFallbackAllowed: false"]) {
  requireIncludes("app/lib/scrimed-work/modelRouter.ts", expected);
}

for (const expected of ["independent-local-rules", "scrimed-independent-policy-handoff", "human-handoff-only"]) {
  requireIncludes("app/lib/scrimed-work/providerRegistry.ts", expected);
}

const migration = files["supabase/migrations/20260718153148_clinical_assurance_control_plane.sql"];
for (const expected of [
  "private.scrimed_clinical_assurance_registry_snapshots",
  "private.scrimed_clinical_assurance_policy_events",
  "enable row level security",
  "revoke all",
  "as restrictive",
  "using (false)",
  "with check (false)",
  "reject_clinical_assurance_mutation",
  "before update or delete",
  "no_phi_assertion",
  "raw_prompt_stored",
  "raw_connector_payload_stored",
  "clinical_action_authority",
  "payer_submission_allowed",
  "ehr_writeback_allowed"
]) {
  if (!migration.includes(expected)) throw new Error(`clinical assurance migration is missing: ${expected}`);
}

for (const path of [
  "app/lib/clinicalAssuranceControlPlane.ts",
  "app/api/clinical-assurance-control-plane/route.ts",
  "app/api/clinical-assurance-control-plane/brief/route.ts"
]) {
  if (/\bfetch\s*\(/.test(files[path])) throw new Error(`${path} must not call an external provider.`);
}

for (const forbidden of [
  "HIPAA certified",
  "FDA cleared",
  "FedRAMP authorized",
  "DoD IL6",
  "DoD IL7",
  "authorizes autonomous diagnosis",
  "provides autonomous diagnosis",
  "payer submission enabled",
  "EHR writeback enabled"
]) {
  const matches = Object.entries(files).filter(([, content]) => content.includes(forbidden));
  if (matches.length > 0) throw new Error(`Forbidden assurance claim found: ${forbidden} in ${matches.map(([path]) => path).join(", ")}`);
}

console.log("pass SCRIMED Clinical Assurance Control Plane contract check");
