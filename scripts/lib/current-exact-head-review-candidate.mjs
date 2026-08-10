import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";

import { createClinicalEvidenceHash } from "../../app/lib/clinicalEvidenceControls.ts";

export const currentExactHeadReviewCandidateVersion =
  "scrimed-current-exact-head-review-candidate-v3-2026-08-10";

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

function runJsonScript(path, args = [], envOverrides = {}) {
  const result = spawnSync(process.execPath, [path, ...args], {
    encoding: "utf8",
    shell: false,
    env: { ...process.env, ...envOverrides },
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
  return {
    clean: status.length === 0,
    commitSha,
    treeSha
  };
}

export function inspectCandidateAuthorIdentities(candidateBaseSha, headSha) {
  requireCondition(
    commitPattern.test(candidateBaseSha) && commitPattern.test(headSha),
    "exact-head-current-author-range-invalid"
  );
  const log = runGitText([
    "log",
    "--format=%an%x1f%ae%x1e",
    `${candidateBaseSha}..${headSha}`
  ]);
  const authors = log
    .split("\x1e")
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [authorName, authorEmail] = record.split("\x1f");
      requireCondition(
        Boolean(authorName?.trim()) && Boolean(authorEmail?.trim()),
        "exact-head-current-author-identity-invalid"
      );
      return { authorName: authorName.trim(), authorEmail: authorEmail.trim() };
    });
  requireCondition(authors.length > 0, "exact-head-current-author-range-empty");

  const identities = new Map();
  for (const author of authors) {
    const gitIdentity = {
      identityProvider: "git-commit-author",
      identityHash: createClinicalEvidenceHash({
        identityProvider: "git-commit-author",
        authorName: author.authorName,
        authorEmail: author.authorEmail.toLowerCase()
      })
    };
    identities.set(
      `${gitIdentity.identityProvider}:${gitIdentity.identityHash}`,
      gitIdentity
    );
    const githubSubject = githubAuthorSubject(author.authorEmail);
    if (githubSubject) {
      const githubIdentity = {
        identityProvider: "github",
        identityHash: createClinicalEvidenceHash({
          identityProvider: "github",
          authorSubject: githubSubject
        })
      };
      identities.set(
        `${githubIdentity.identityProvider}:${githubIdentity.identityHash}`,
        githubIdentity
      );
    }
  }

  const authorIdentities = [...identities.values()].sort((left, right) =>
    `${left.identityProvider}:${left.identityHash}`.localeCompare(
      `${right.identityProvider}:${right.identityHash}`
    )
  );

  return {
    commitAuthorCount: new Set(
      authors.map(
        ({ authorName, authorEmail }) =>
          `${authorName}\x1f${authorEmail.toLowerCase()}`
      )
    ).size,
    authorIdentities,
    authorIdentityHashes: [
      ...new Set(authorIdentities.map((identity) => identity.identityHash))
    ].sort()
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
    Array.isArray(sourceState.authorIdentities) &&
      sourceState.authorIdentities.length > 0 &&
      new Set(
        sourceState.authorIdentities.map(
          (identity) =>
            `${identity?.identityProvider}:${identity?.identityHash}`
        )
      ).size === sourceState.authorIdentities.length &&
      sourceState.authorIdentities.every(
        (identity) =>
          (identity?.identityProvider === "git-commit-author" ||
            identity?.identityProvider === "github") &&
          sha256Pattern.test(identity.identityHash)
      ) &&
      Array.isArray(sourceState.authorIdentityHashes) &&
      sourceState.authorIdentityHashes.length > 0 &&
      new Set(sourceState.authorIdentityHashes).size ===
        sourceState.authorIdentityHashes.length &&
      sourceState.authorIdentityHashes.every((value) => sha256Pattern.test(value)),
    "exact-head-current-author-identity-invalid"
  );
  requireCondition(
    JSON.stringify(
      [
        ...new Set(
          sourceState.authorIdentities.map((identity) => identity.identityHash)
        )
      ].sort()
    ) === JSON.stringify([...sourceState.authorIdentityHashes].sort()),
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
      Array.isArray(reviewPacket.reviewerRoles) &&
      reviewPacket.reviewerRoles.length > 0 &&
      new Set(reviewPacket.reviewerRoles).size === reviewPacket.reviewerRoles.length &&
      reviewPacket.reviewerRoles.every(
        (role) => typeof role === "string" && Boolean(role.trim())
      ) &&
      sha256Pattern.test(reviewPacket.candidateReviewPacketSha256),
    "exact-head-current-review-packet-mismatch"
  );
  requireCondition(
    isObject(sbom) &&
      sha256Pattern.test(sbom.sbomHash) &&
      Number.isInteger(sbom.componentCount) &&
      sbom.componentCount > 0 &&
      sbom.candidateBaseSha === manifest.candidateBaseSha &&
      sbom.manifestDependencyDeltaCount === 0 &&
      sbom.lockfileComponentDeltaCount === 0 &&
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
          surface: "security-critical-files",
          authorIdentities: sourceState.authorIdentities
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
      authorIdentities: sourceState.authorIdentities.map((identity) => ({
        ...identity
      })),
      authorIdentityHashes: [...sourceState.authorIdentityHashes],
      requiredReviewerRoles: [...reviewPacket.reviewerRoles].sort()
    },
    validation: {
      localValidationPassed:
        validation.automatedValidationPassed === true &&
        validation.failedChecks.length === 0,
      ciPassed: false,
      remoteCiEvidenceRequired: true,
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
      requiredReviewerRoleCount: reviewPacket.reviewerRoles.length,
      commitAuthorCount: sourceState.commitAuthorCount,
      validationCheckCount: validation.checkCount,
      sbomComponentCount: sbom.componentCount
    }
  };
}

export async function loadCurrentExactHeadReviewCandidate(options = {}) {
  if (options.currentCandidateEvidence) {
    return buildCurrentExactHeadReviewCandidate(options.currentCandidateEvidence);
  }

  const manifest = runJsonScript("scripts/release-candidate-manifest.mjs", [
    "--json",
    "--strict"
  ]);
  const candidateEnvironment = {
    SCRIMED_RELEASE_CANDIDATE_BASE_REF: manifest.candidateBaseSha
  };
  const validation = runJsonScript(
    "scripts/release-candidate-validation.mjs",
    ["--json", "--strict"],
    candidateEnvironment
  );
  const reviewPacket = runJsonScript(
    "scripts/release-candidate-review-packet.mjs",
    ["--json", "--strict"],
    candidateEnvironment
  );
  const sbom = runJsonScript(
    "scripts/scrimed-sbom.mjs",
    ["--json", "--verify"],
    candidateEnvironment
  );
  const vercelConfiguration = JSON.parse(await readFile("vercel.json", "utf8"));
  const sourceState = inspectCheckedOutSource();
  const authorState = inspectCandidateAuthorIdentities(
    manifest.candidateBaseSha,
    sourceState.commitSha
  );

  return buildCurrentExactHeadReviewCandidate({
    sourceState: { ...sourceState, ...authorState },
    manifest,
    validation,
    reviewPacket,
    sbom,
    vercelConfiguration
  });
}
