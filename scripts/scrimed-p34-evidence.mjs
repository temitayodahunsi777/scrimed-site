#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import {
  hashFileIfPresent,
  inspectP34CandidateState,
  p34CanonicalReleaseManifestPath,
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
const integrationMapHash = hashFileIfPresent("artifacts/review/p40-full-integration-map.json");
const riskRankedDiffHash = hashFileIfPresent("artifacts/review/p34-final-risk-ranked-diff.json")
  ?? hashFileIfPresent("artifacts/review/p40-risk-ranked-diff.json");
const reviewBriefHash = hashFileIfPresent("docs/review/P34_FINAL_EXACT_HEAD_REVIEW_BRIEF.md")
  ?? hashFileIfPresent("docs/review/P40_EXECUTIVE_REVIEW_BRIEF.md");
const gateMatrixHash = hashFileIfPresent("artifacts/p34/P34_GATE_MATRIX.json");
const migrationEvidenceHash = hashFileIfPresent("artifacts/p32/P32_MIGRATION_EVIDENCE_PACKET.json")
  ?? hashFileIfPresent("docs/operators/MIGRATION_DRY_RUN_OPERATOR_PACKET.md");
const validationFingerprint = sha256({
  candidate: state.candidateFingerprint,
  certificationFingerprint: certificationCurrent ? certification.certificationFingerprint : null,
  legacyValidationArtifactHash: hashFileIfPresent("artifacts/p34/P34_VALIDATION_REPORT.json"),
  status: certificationCurrent ? certification.status : "CERTIFICATION_REQUIRED"
});
const reviewPacketFingerprint = sha256({
  candidate: state.candidateFingerprint,
  integrationMapHash,
  riskRankedDiffHash,
  reviewBriefHash
});
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

const createdAt = state.commitTimestamp;
const evidenceExpiresAt = createdAt
  ? new Date(Date.parse(createdAt) + 14 * 24 * 60 * 60_000).toISOString()
  : null;
const p40Aal2Path = "artifacts/security/p40-aal2.json";
const finalAal2Path = "artifacts/security/p34-aal2-final.json";
const existingFinalAal2 = await readFile(finalAal2Path, "utf8").then(JSON.parse).catch(() => null);
const existingP40Aal2 = await readFile(p40Aal2Path, "utf8").then(JSON.parse).catch(() => null);
const existingAal2 = [existingFinalAal2, existingP40Aal2].find((entry) => (
  entry?.candidate?.candidateFingerprint === state.candidateFingerprint
  && entry?.candidate?.commitSha === state.commit
  && entry?.assuranceResult === "PASS_NONPRODUCTION_AAL2"
  && entry?.passed === true
)) ?? existingFinalAal2 ?? existingP40Aal2;
const aal2Current = Boolean(
  existingAal2?.candidate?.candidateFingerprint === state.candidateFingerprint
  && existingAal2?.candidate?.commitSha === state.commit
  && existingAal2?.assuranceResult === "PASS_NONPRODUCTION_AAL2"
  && existingAal2?.passed === true
);
const aal2State = aal2Current
  ? { status: "PASS_NONPRODUCTION_AAL2", exactCandidateEvidencePresent: true, evidenceFingerprint: existingAal2.evidenceHash ?? null }
  : state.aal2;
const previewVerificationHash = hashFileIfPresent("artifacts/release/p34-preview-verification.json");
const previewObservabilityHash = hashFileIfPresent("artifacts/vercel/p40-observability.json");
const previewFingerprint = state.preview
  ? sha256({
      candidate: state.candidateFingerprint,
      preview: state.preview,
      previewVerificationHash,
      previewObservabilityHash
    })
  : null;

const evidence = {
  ...state,
  schemaVersion: "scrimed-p34-release-manifest-v1",
  branch: state.branch,
  PR: state.currentPr?.number ?? 40,
  commit: state.commit,
  tree: state.tree,
  candidateFingerprint: state.candidateFingerprint,
  sourceFingerprint: state.sourceFingerprint,
  validationFingerprint,
  reviewPacketFingerprint,
  gatePacketFingerprint,
  SBOMFingerprint: sbom.sbomHash,
  securityFingerprint,
  certificationFingerprint: certificationCurrent ? certification.certificationFingerprint : null,
  routeInventoryFingerprint: state.routeInventory?.inventoryFingerprint ?? null,
  renderInventoryFingerprint: state.generationInventory?.inventoryFingerprint ?? null,
  previewDeployment: state.preview,
  previewFingerprint,
  NodeVersion: state.runtime.node,
  NextVersion: state.runtime.next,
  SupabaseProject: state.supabase,
  AAL2State: aal2State,
  migrationState: state.migrations,
  reviewState: state.review,
  createdAt,
  evidenceExpiresAt,
  observedAt: createdAt,
  created_at: createdAt,
  expires_at: evidenceExpiresAt,
  pullRequestNumber: state.currentPr?.number ?? 40,
  supabaseProject: state.supabase,
  sbomFingerprint: sbom.sbomHash,
  prerenderInventoryFingerprint: state.generationInventory?.inventoryFingerprint ?? null,
  generationInventoryFingerprint: state.generationInventory?.inventoryFingerprint ?? null,
  aal2State,
  pilotReadinessFingerprint,
  commercialControlFingerprint,
  migrationEvidenceFingerprint: migrationEvidenceHash,
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
    aal2: aal2Current ? "CURRENT" : "OPERATOR_ACTION_REQUIRED",
    supabasePasswordlessProtectedAccess: state.supabase.passwordlessProtectedAccess,
    supabaseLeakedPasswordProtection: state.supabase.leakedPasswordProtection,
    supabasePasswordAuthSemanticStatus: state.supabase.passwordAuthSemanticStatus
  },
  boundary: "Local no-PHI evidence only. This manifest grants no review, merge, deployment, migration, production, clinical, payer, EHR/device, customer, contract, certification, compliance, or external-distribution authority."
};
evidence.manifestFingerprint = sha256(evidence);
await mkdir("artifacts/release", { recursive: true });
await writeFile(p34CanonicalReleaseManifestPath, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
if (!(
  existingAal2?.candidate?.candidateFingerprint === state.candidateFingerprint
  && existingAal2?.assuranceResult === "PASS_NONPRODUCTION_AAL2"
)) {
  const pendingAal2Base = {
    schemaVersion: "scrimed-p34-final-aal2-redacted-evidence-v1",
    candidate: {
      commitSha: state.commit,
      candidateFingerprint: state.candidateFingerprint
    },
    target: state.preview?.url ?? null,
    deploymentId: state.preview?.deploymentId ?? null,
    assuranceResult: "OPERATOR_ACTION_REQUIRED",
    timestamp: null,
    tests: [
      "nonproduction-target",
      "aal2-token-policy",
      "mfa-method",
      "fresh-step-up",
      "stale-token-policy-rejection",
      "exact-candidate-preview-binding",
      "privileged-endpoint",
      "candidate-replay-guard"
    ].map((id) => ({ id, passed: null })),
    passed: false,
    credentialMaterialPersisted: false,
    productionAuthorityGranted: false
  };
  const pendingAal2 = { ...pendingAal2Base, evidenceHash: sha256(pendingAal2Base) };
  await mkdir("artifacts/security", { recursive: true });
  await writeFile(finalAal2Path, `${JSON.stringify(pendingAal2, null, 2)}\n`, "utf8");
  await writeFile(p40Aal2Path, `${JSON.stringify(pendingAal2, null, 2)}\n`, "utf8");
} else {
  await mkdir("artifacts/security", { recursive: true });
  await writeFile(finalAal2Path, `${JSON.stringify(existingAal2, null, 2)}\n`, "utf8");
}
console.log(`generated p.34 exact candidate evidence candidate=${evidence.candidateFingerprint} source=${evidence.sourceFingerprint} manifest=${evidence.manifestFingerprint}`);
