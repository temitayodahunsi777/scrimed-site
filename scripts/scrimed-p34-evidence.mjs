#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import {
  hashFileIfPresent,
  inspectP34CandidateState,
  p34RuntimeEvidencePath,
  sha256
} from "./lib/p34-candidate-state.mjs";

function runJson(script, args = [], env = process.env) {
  const result = spawnSync(process.execPath, [script, ...args], {
    encoding: "utf8",
    shell: false,
    maxBuffer: 64 * 1024 * 1024,
    env
  });
  if (result.status !== 0 || result.error) {
    throw new Error(`${script} failed while generating p.34 evidence: ${result.stderr || result.error?.message || result.status}`);
  }
  return JSON.parse(result.stdout);
}

const state = inspectP34CandidateState();
if (state.unexplainedFileCount !== 0) throw new Error("p.34 evidence cannot bind unexplained files.");
const baseEnv = { ...process.env, SCRIMED_RELEASE_CANDIDATE_BASE_REF: state.base };
const candidateManifest = runJson("scripts/release-candidate-manifest.mjs", ["--json"], baseEnv);
const sbom = runJson("scripts/scrimed-sbom.mjs", ["--json", `--base-ref=${state.base}`], baseEnv);
const certification = await readFile("artifacts/release/p34-certification.json", "utf8")
  .then(JSON.parse)
  .catch(() => null);
const certificationCurrent = Boolean(
  certification
  && certification.candidateFingerprint === state.candidateFingerprint
  && certification.sourceFingerprint === state.sourceFingerprint
  && certification.commit === state.commit
  && certification.tree === state.tree
  && certification.status === "AUTOMATED_ASSURANCE_COMPLETE_HUMAN_REVIEW_REQUIRED"
);
const integrationMapHash = hashFileIfPresent("artifacts/review/p34-integration-map.json");
const reviewBriefHash = hashFileIfPresent("docs/review/P34_REVIEW_BRIEF.md");
const gateMatrixHash = hashFileIfPresent("artifacts/p34/P34_GATE_MATRIX.json");
const migrationEvidenceHash = hashFileIfPresent("artifacts/p32/P32_MIGRATION_EVIDENCE_PACKET.json")
  ?? hashFileIfPresent("docs/operators/MIGRATION_DRY_RUN_OPERATOR_PACKET.md");
const validationFingerprint = sha256({
  candidate: state.candidateFingerprint,
  certificationFingerprint: certificationCurrent ? certification.certificationFingerprint : null,
  legacyValidationArtifactHash: hashFileIfPresent("artifacts/p34/P34_VALIDATION_REPORT.json"),
  status: certificationCurrent ? certification.status : "CERTIFICATION_REQUIRED"
});
const reviewPacketFingerprint = sha256({ candidate: state.candidateFingerprint, integrationMapHash, reviewBriefHash });
const gatePacketFingerprint = sha256({ candidate: state.candidateFingerprint, gateMatrixHash, authority: state.authority });
const securityFingerprint = sha256({
  candidate: state.candidateFingerprint,
  secretScanStatus: certificationCurrent && certification.checks?.find((entry) => entry.id === "secret-scan")?.passed === true
    ? "PASS"
    : "CERTIFICATION_REQUIRED",
  supabase: state.supabase,
  aal2: state.aal2
});
const pilotReadinessFingerprint = sha256({
  candidate: state.candidateFingerprint,
  pilotManifestHash: hashFileIfPresent("app/lib/commercial/pilotManifest.ts"),
  pilotOperatingSystemHash: hashFileIfPresent("app/lib/commercial/pilotOperatingSystem.ts"),
  costGovernorHash: hashFileIfPresent("app/lib/economics/pilotCostGovernor.ts")
});
const commercialControlFingerprint = sha256({
  candidate: state.candidateFingerprint,
  proposalAuthority: false,
  protectedPilotAuthority: false,
  productionAuthority: false
});

const evidence = {
  ...state,
  schemaVersion: "scrimed-p34-current-candidate-manifest-v1",
  observedAt: new Date().toISOString(),
  validationFingerprint,
  reviewPacketFingerprint,
  gatePacketFingerprint,
  sbomFingerprint: sbom.sbomHash,
  routeInventoryFingerprint: state.routeInventory?.inventoryFingerprint ?? null,
  generationInventoryFingerprint: state.generationInventory?.inventoryFingerprint ?? null,
  securityFingerprint,
  pilotReadinessFingerprint,
  commercialControlFingerprint,
  migrationEvidenceFingerprint: migrationEvidenceHash,
  previewFingerprint: state.preview ? sha256({ candidate: state.candidateFingerprint, preview: state.preview }) : null,
  candidateManifestEvidence: {
    status: candidateManifest.status,
    mode: candidateManifest.candidateMode,
    fingerprint: candidateManifest.candidateDigestSha256,
    sourceFingerprint: candidateManifest.sourceCandidateDigestSha256
  },
  certification: certificationCurrent
    ? { status: certification.status, fingerprint: certification.certificationFingerprint }
    : { status: "NOT_RUN_FOR_CURRENT_SOURCE", fingerprint: null },
  evidenceStatuses: {
    predecessor: "PREDECESSOR",
    source: "CURRENT",
    routeInventory: state.routeInventory ? "REGENERATED" : "STALE_REBUILD_REQUIRED",
    generationInventory: state.generationInventory?.generationWorkUnits ? "REGENERATED" : "STALE_REBUILD_REQUIRED",
    validation: certificationCurrent ? "CURRENT" : "STALE_REGENERATE_REQUIRED",
    humanReview: "OPERATOR_ACTION_REQUIRED",
    preview: state.preview ? "REQUIRES_VERIFICATION" : "OPERATOR_ACTION_REQUIRED",
    aal2: "OPERATOR_ACTION_REQUIRED",
    supabaseLeakedPasswordProtection: "OPERATOR_ACTION_REQUIRED"
  },
  boundary: "Local no-PHI evidence only. This manifest grants no review, merge, deployment, migration, production, clinical, payer, EHR/device, customer, contract, certification, compliance, or external-distribution authority."
};
evidence.manifestFingerprint = sha256(evidence);
await mkdir("artifacts/release", { recursive: true });
await writeFile(p34RuntimeEvidencePath, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
console.log(`generated p.34 exact candidate evidence candidate=${evidence.candidateFingerprint} source=${evidence.sourceFingerprint} manifest=${evidence.manifestFingerprint}`);
