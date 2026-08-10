import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";

import { createClinicalEvidenceHash } from "../../app/lib/clinicalEvidenceControls.ts";

export const currentExactHeadReviewCandidateVersion =
  "scrimed-current-exact-head-review-candidate-v1-2026-08-10";

const repository = "temitayodahunsi777/scrimed-site";
const commitPattern = /^[0-9a-f]{40}$/;
const sha256Pattern = /^[0-9a-f]{64}$/;

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requireCondition(condition, errorCode) {
  if (!condition) throw new Error(errorCode);
}

function runGitText(args) {
  const result = spawnSync("git", args, {
    encoding: "utf8",
    shell: false,
    maxBuffer: 8 * 1024 * 1024
  });
  requireCondition(result.status === 0, "exact-head-current-source-unavailable");
  return result.stdout.trim();
}

function runJsonScript(path, args = []) {
  const result = spawnSync(process.execPath, [path, ...args], {
    encoding: "utf8",
    shell: false,
    env: process.env,
    maxBuffer: 64 * 1024 * 1024
  });
  requireCondition(result.status === 0, "exact-head-current-evidence-command-failed");
  try {
    return JSON.parse(result.stdout);
  } catch {
    throw new Error("exact-head-current-evidence-output-invalid");
  }
}

function checkPassed(validation, id) {
  return (
    Array.isArray(validation?.checks) &&
    validation.checks.some((check) => check?.id === id && check.passed === true)
  );
}

function githubAuthorSubject(authorEmail) {
  const match = /^(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$/i.exec(
    authorEmail
  );
  return match?.[1]?.toLowerCase() ?? null;
}

export function inspectCheckedOutSource() {
  const status = runGitText(["status", "--porcelain=v1", "--untracked-files=all"]);
  const commitSha = runGitText(["rev-parse", "HEAD"]);
  const treeSha = runGitText(["rev-parse", "HEAD^{tree}"]);
  const authorName = runGitText(["show", "-s", "--format=%an", "HEAD"]);
  const authorEmail = runGitText(["show", "-s", "--format=%ae", "HEAD"]);
  const githubSubject = githubAuthorSubject(authorEmail);

  return {
    clean: status.length === 0,
    commitSha,
    treeSha,
    authorIdentityHash: createClinicalEvidenceHash(
      githubSubject
        ? { identityProvider: "github", authorSubject: githubSubject }
        : {
            identityProvider: "git-commit-author",
            authorName,
            authorEmail
          }
    )
  };
}

export function buildCurrentExactHeadReviewCandidate({
  sourceState,
  manifest,
  validation,
  reviewPacket,
  sbom,
  vercelConfiguration
}) {
  requireCondition(isObject(sourceState), "exact-head-current-source-unavailable");
  requireCondition(sourceState.clean === true, "exact-head-current-source-dirty");
  requireCondition(
    commitPattern.test(sourceState.commitSha) && commitPattern.test(sourceState.treeSha),
    "exact-head-current-source-unavailable"
  );
  requireCondition(
    sha256Pattern.test(sourceState.authorIdentityHash),
    "exact-head-current-author-identity-invalid"
  );
  requireCondition(isObject(manifest), "exact-head-current-manifest-invalid");
  requireCondition(
    manifest.strictProvenanceEligible === true &&
      manifest.candidateMode === "clean-commit" &&
      manifest.dirtyEntryCount === 0 &&
      manifest.baseHeadSha === sourceState.commitSha &&
      manifest.headTreeSha === sourceState.treeSha &&
      commitPattern.test(manifest.candidateBaseSha) &&
      sha256Pattern.test(manifest.candidateDigestSha256) &&
      sha256Pattern.test(manifest.sourceCandidateDigestSha256),
    "exact-head-current-manifest-mismatch"
  );
  requireCondition(
    isObject(validation) &&
      validation.automatedValidationPassed === true &&
      validation.candidateStable === true &&
      validation.sourceCommitStable === true &&
      validation.sourceReviewReady === true &&
      validation.sourceCommitSha === sourceState.commitSha &&
      validation.candidateFingerprintSha256 === manifest.candidateDigestSha256 &&
      validation.sourceFingerprintSha256 === manifest.sourceCandidateDigestSha256 &&
      sha256Pattern.test(validation.validationEvidenceHashSha256) &&
      Array.isArray(validation.failedChecks) &&
      validation.failedChecks.length === 0,
    "exact-head-current-validation-mismatch"
  );
  requireCondition(
    isObject(reviewPacket) &&
      reviewPacket.completeCoverage === true &&
      reviewPacket.reviewBatchCoverageComplete === true &&
      reviewPacket.rejectedFileCount === 0 &&
      reviewPacket.baseHeadSha === sourceState.commitSha &&
      reviewPacket.headTreeSha === sourceState.treeSha &&
      reviewPacket.candidateDigestSha256 === manifest.candidateDigestSha256 &&
      reviewPacket.sourceCandidateDigestSha256 ===
        manifest.sourceCandidateDigestSha256 &&
      sha256Pattern.test(reviewPacket.candidateReviewPacketSha256),
    "exact-head-current-review-packet-mismatch"
  );
  requireCondition(
    isObject(sbom) &&
      sha256Pattern.test(sbom.sbomHash) &&
      Number.isInteger(sbom.componentCount) &&
      sbom.componentCount > 0 &&
      sbom.dependencyDeltaCount === 0,
    "exact-head-current-sbom-invalid"
  );
  requireCondition(
    isObject(vercelConfiguration),
    "exact-head-current-deployment-configuration-invalid"
  );

  const productionAutoDeployFromMainEnabled =
    vercelConfiguration?.git?.deploymentEnabled?.main !== false;
  const binding = {
    schemaVersion: currentExactHeadReviewCandidateVersion,
    repository,
    commitSha: sourceState.commitSha,
    treeSha: sourceState.treeSha,
    candidateBaseSha: manifest.candidateBaseSha,
    candidateFingerprint: manifest.candidateDigestSha256,
    sourceFingerprint: manifest.sourceCandidateDigestSha256,
    validationFingerprint: validation.validationEvidenceHashSha256,
    reviewPacketFingerprint: reviewPacket.candidateReviewPacketSha256,
    sbomFingerprint: sbom.sbomHash
  };
  const deploymentConfigurationFingerprint = createClinicalEvidenceHash({
    schemaVersion: currentExactHeadReviewCandidateVersion,
    vercelConfiguration
  });
  const migrationStaticReviewPassed = checkPassed(validation, "migration-packet");
  const publicClaimsPassed =
    checkPassed(validation, "nonsecret-suite") && checkPassed(validation, "build");

  return {
    candidate: {
      commitSha: binding.commitSha,
      candidateFingerprint: binding.candidateFingerprint,
      sourceFingerprint: binding.sourceFingerprint,
      validationFingerprint: binding.validationFingerprint,
      reviewPacketFingerprint: binding.reviewPacketFingerprint,
      sbomFingerprint: binding.sbomFingerprint,
      criticalSurfaces: {
        securityCriticalFiles: createClinicalEvidenceHash({
          ...binding,
          surface: "security-critical-files"
        }),
        policyFiles: createClinicalEvidenceHash({
          ...binding,
          surface: "policy-files"
        }),
        migrationSet: createClinicalEvidenceHash({
          ...binding,
          surface: "migration-set",
          migrationStaticReviewPassed
        }),
        publicClaims: createClinicalEvidenceHash({
          ...binding,
          surface: "public-claims",
          publicClaimsPassed
        }),
        deploymentConfiguration: createClinicalEvidenceHash({
          ...binding,
          surface: "deployment-configuration",
          deploymentConfigurationFingerprint,
          productionAutoDeployFromMainEnabled
        })
      },
      authorIdentityHash: sourceState.authorIdentityHash
    },
    validation: {
      ciPassed:
        validation.automatedValidationPassed === true &&
        validation.failedChecks.length === 0,
      secretScanPassed: checkPassed(validation, "secret-scan"),
      sbomPassed:
        checkPassed(validation, "sbom") && sbom.dependencyDeltaCount === 0,
      publicClaimsPassed,
      unreviewedMigrationsAdded: !migrationStaticReviewPassed,
      productionAutoDeployFromMainEnabled
    },
    evidence: {
      sourceCommit: sourceState.commitSha,
      sourceTree: sourceState.treeSha,
      candidateBase: manifest.candidateBaseSha,
      changedFileCount: manifest.changedFileCount,
      reviewableFileCount: reviewPacket.reviewableFileCount,
      rejectedFileCount: reviewPacket.rejectedFileCount,
      validationCheckCount: validation.checkCount,
      sbomComponentCount: sbom.componentCount
    }
  };
}

export async function loadCurrentExactHeadReviewCandidate(options = {}) {
  if (options.currentCandidateEvidence) {
    return buildCurrentExactHeadReviewCandidate(options.currentCandidateEvidence);
  }

  const validation = runJsonScript("scripts/release-candidate-validation.mjs", [
    "--json",
    "--strict"
  ]);
  const manifest = runJsonScript("scripts/release-candidate-manifest.mjs", [
    "--json",
    "--strict"
  ]);
  const reviewPacket = runJsonScript(
    "scripts/release-candidate-review-packet.mjs",
    ["--json", "--strict"]
  );
  const sbom = runJsonScript("scripts/scrimed-sbom.mjs", ["--json", "--verify"]);
  const vercelConfiguration = JSON.parse(await readFile("vercel.json", "utf8"));

  return buildCurrentExactHeadReviewCandidate({
    sourceState: inspectCheckedOutSource(),
    manifest,
    validation,
    reviewPacket,
    sbom,
    vercelConfiguration
  });
}
