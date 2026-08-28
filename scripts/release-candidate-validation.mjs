#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

const args = new Set(process.argv.slice(2));
const allowedArgs = new Set(["--json", "--strict", "--self-test"]);
const unknownArgs = [...args].filter((arg) => !allowedArgs.has(arg));
const commandTimeoutMs = 15 * 60 * 1000;
const maximumCommandOutputBytes = 32 * 1024 * 1024;
const directNode = (...commandArgs) => ({
  executable: process.execPath,
  args: commandArgs
});

if (unknownArgs.length > 0) {
  throw new Error(`Unsupported release candidate validation option: ${unknownArgs.join(", ")}`);
}

const validationCommands = [
  { id: "git-diff-check", executable: "git", args: ["diff", "--check"], display: "git diff --check" },
  {
    id: "workspace-hygiene",
    executable: "npm",
    args: ["run", "hygiene:workspace"],
    display: "npm run hygiene:workspace",
    fallbackStages: [
      directNode("scripts/clean-generated-cache.mjs", "--preserve-next-cache"),
      directNode("scripts/workspace-hygiene-contract-check.mjs"),
      directNode("scripts/script-registry-contract-check.mjs")
    ]
  },
  {
    id: "secret-scan",
    executable: "npm",
    args: ["run", "security:secret-scan"],
    display: "npm run security:secret-scan",
    fallbackStages: [directNode("scripts/scrimed-secret-scan.mjs")]
  },
  {
    id: "sbom",
    executable: "npm",
    args: ["run", "security:sbom"],
    display: "npm run security:sbom",
    fallbackStages: [directNode("scripts/scrimed-sbom.mjs", "--verify")]
  },
  {
    id: "migration-packet",
    executable: "npm",
    args: ["run", "release:migration-packet"],
    display: "npm run release:migration-packet",
    fallbackStages: [directNode("scripts/scrimed-migration-evidence-packet.mjs")]
  },
  {
    id: "typecheck",
    executable: "npm",
    args: ["run", "typecheck"],
    display: "npm run typecheck",
    fallbackStages: [
      directNode("scripts/check-generated-integrity.mjs"),
      directNode("node_modules/typescript/bin/tsc", "--noEmit")
    ]
  },
  {
    id: "lint",
    executable: "npm",
    args: ["run", "lint"],
    display: "npm run lint",
    fallbackStages: [directNode("node_modules/eslint/bin/eslint.js", ".")]
  },
  {
    id: "nonsecret-suite",
    executable: "npm",
    args: ["run", "test:nonsecret"],
    display: "npm run test:nonsecret",
    fallbackStages: [directNode("scripts/scrimed-nonsecret-test-suite.mjs")]
  },
  {
    id: "build",
    executable: "npm",
    args: ["run", "build"],
    display: "npm run build",
    fallbackStages: [
      directNode("scripts/clean-generated-cache.mjs", "--preserve-next-cache"),
      directNode("scripts/release-provenance-preflight.mjs", "--deployment-aware"),
      directNode("scripts/check-generated-integrity.mjs"),
      directNode("scripts/build-with-p34-inventory.mjs"),
      directNode("scripts/generated-output-postflight.mjs"),
      directNode("scripts/verify-public-release.mjs", "--require-build"),
      directNode("scripts/check-generated-integrity.mjs")
    ]
  },
  {
    id: "generated-integrity",
    executable: process.execPath,
    args: ["scripts/check-generated-integrity.mjs"],
    display: "node scripts/check-generated-integrity.mjs"
  }
];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function isSha256(value) {
  return typeof value === "string" && /^[0-9a-f]{64}$/i.test(value);
}

function isGitCommitSha(value) {
  return typeof value === "string" && /^[0-9a-f]{40}$/i.test(value);
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonicalize(nested)])
    );
  }
  return value;
}

function stableHash(value) {
  return sha256(JSON.stringify(canonicalize(value)));
}

function classifyCommandWarnings(output) {
  const warnings = [];
  if (
    /Attempted to load @next\/swc-darwin-arm64/i.test(output)
    || /using WASM bindings/i.test(output)
  ) {
    warnings.push("next-swc-native-binding-unavailable-wasm-fallback");
  }
  return warnings;
}

export function evaluateReleaseCandidateValidation(input) {
  const beforeFingerprint = input.manifestBefore?.candidateDigestSha256 ?? null;
  const afterFingerprint = input.manifestAfter?.candidateDigestSha256 ?? null;
  const sourceFingerprint = input.manifestAfter?.sourceCandidateDigestSha256 ?? null;
  const sourceCommitSha = input.manifestAfter?.baseHeadSha ?? null;
  const sourceCommitStable = isGitCommitSha(sourceCommitSha)
    && input.manifestBefore?.baseHeadSha === sourceCommitSha;
  const candidateStable = isSha256(beforeFingerprint)
    && beforeFingerprint === afterFingerprint
    && sourceCommitStable;
  const sourceReviewReady = input.manifestAfter?.sourceReviewReady === true;
  const failedChecks = input.checkResults.filter((check) => !check.passed).map((check) => check.id);
  const warningCodes = [...new Set(input.checkResults.flatMap((check) => check.warningCodes ?? []))];
  const artifactReviewDetected = isSha256(input.artifactReview?.artifactFingerprintSha256);
  const artifactReviewRequired = input.manifestAfter?.artifactReviewRequired === true || artifactReviewDetected;
  const artifactReviewPassed = !artifactReviewRequired
    || (
      (input.manifestAfter?.artifactReviewRequired !== true || input.manifestAfter?.nonSourceDeliverableCount === 1)
      && input.artifactReview?.automatedReviewPassed === true
      && artifactReviewDetected
    );
  const automatedValidationPassed = candidateStable
    && sourceReviewReady
    && failedChecks.length === 0
    && artifactReviewPassed;
  const evidencePayload = {
    candidateFingerprint: candidateStable ? afterFingerprint : null,
    sourceCommitSha: sourceCommitStable ? sourceCommitSha : null,
    sourceFingerprint: isSha256(sourceFingerprint) ? sourceFingerprint : null,
    artifactFingerprint: artifactReviewPassed
      ? input.artifactReview?.artifactFingerprintSha256 ?? null
      : null,
    artifactReviewRequired,
    candidateStable,
    sourceReviewReady,
    checks: input.checkResults.map(({ id, passed, exitCode, warningCodes: checkWarnings = [], executionMode = null }) => ({
      id,
      passed,
      exitCode,
      executionMode,
      warningCodes: checkWarnings
    }))
  };

  return {
    service: "scrimed-release-candidate-validation",
    status: automatedValidationPassed
      ? "automated-candidate-validation-passed-human-review-required"
      : "candidate-validation-failed-closed",
    sourceCommitSha: sourceCommitStable ? sourceCommitSha : null,
    candidateFingerprintSha256: candidateStable ? afterFingerprint : null,
    candidateFingerprint: candidateStable ? afterFingerprint.slice(0, 16) : "unavailable-or-drifted",
    sourceFingerprintSha256: isSha256(sourceFingerprint) ? sourceFingerprint : null,
    sourceFingerprint: isSha256(sourceFingerprint) ? sourceFingerprint.slice(0, 16) : "unavailable",
    artifactFingerprintSha256: artifactReviewPassed
      ? input.artifactReview?.artifactFingerprintSha256 ?? null
      : null,
    artifactFingerprint: artifactReviewPassed && input.artifactReview?.artifactFingerprintSha256
      ? input.artifactReview.artifactFingerprintSha256.slice(0, 16)
      : artifactReviewRequired
        ? "unavailable-or-unreviewed"
        : "not-required",
    candidateStable,
    sourceCommitStable,
    sourceReviewReady,
    artifactReviewRequired,
    artifactReviewPassed,
    automatedValidationPassed,
    checkCount: input.checkResults.length,
    failedChecks,
    warningCount: warningCodes.length,
    warningCodes,
    checks: input.checkResults,
    validationEvidenceHashSha256: stableHash(evidencePayload),
    validationEvidenceHash: stableHash(evidencePayload).slice(0, 16),
    validationScope: "automated-nonsecret-review-evidence",
    currentCandidateAttested: automatedValidationPassed,
    humanReviewRequired: true,
    requiredReviewers: input.manifestAfter?.requiredReviewers ?? [],
    cleanImmutableRevisionRequired: true,
    artifactSpecificHumanApprovalRequired: artifactReviewRequired,
    sourceCommitAuthorized: false,
    deploymentAuthorized: false,
    migrationApplyAuthorized: false,
    externalDistributionAuthorized: false,
    investorOutreachAuthorized: false,
    phiAuthority: "not-authorized",
    clinicalCareAuthority: "not-authorized",
    releasePromotionAllowed: false,
    commandOutputRetained: false,
    rawDiffRetained: false,
    pathsPrinted: false,
    nextActions: automatedValidationPassed
      ? [
          "Record the candidate, source, artifact, and validation evidence fingerprints in the controlled review packet.",
          "Obtain every named source reviewer decision and artifact-specific founder, counsel/claims, and finance decision.",
          "Commit only the reviewed source set through the approved workflow, then run strict provenance from the clean immutable revision.",
          "Deploy only after release authority approval, then run production smoke against the exact deployed SHA."
        ]
      : [
          "Run each failed check individually and remediate without weakening safety or claim boundaries.",
          "Rerun candidate validation after the working tree is stable.",
          "Keep commit, deployment, migration, external distribution, PHI, and clinical authority blocked."
        ],
    boundary:
      "This validation binds approved automated checks to one unchanged local candidate. It is not source review approval, legal or clinical review, artifact distribution approval, commit authority, deployment authority, migration authority, certification, customer go-live approval, PHI authority, or clinical-care authority."
  };
}

function executeCommand(executable, commandArgs) {
  const resolvedExecutable = executable === "npm" && process.platform === "win32" ? "npm.cmd" : executable;
  return spawnSync(resolvedExecutable, commandArgs, {
    encoding: "utf8",
    shell: false,
    timeout: commandTimeoutMs,
    maxBuffer: maximumCommandOutputBytes,
    env: process.env
  });
}

function summarizeCommandResult(result, inheritedWarnings = []) {
  const commandOutput = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  return {
    passed: result.status === 0 && !result.error,
    exitCode: Number.isInteger(result.status) ? result.status : null,
    timedOut: result.error?.code === "ETIMEDOUT",
    warningCodes: [...new Set([...inheritedWarnings, ...classifyCommandWarnings(commandOutput)])]
  };
}

function runCommand(command) {
  const primary = executeCommand(command.executable, command.args);
  if (
    primary.error?.code !== "ENOENT"
    || command.executable !== "npm"
    || !Array.isArray(command.fallbackStages)
  ) {
    return {
      ...summarizeCommandResult(primary),
      executionMode: "package-manager"
    };
  }

  let warningCodes = ["npm-unavailable-direct-node-fallback"];
  for (const stage of command.fallbackStages) {
    const result = executeCommand(stage.executable, stage.args);
    const summary = summarizeCommandResult(result, warningCodes);
    warningCodes = summary.warningCodes;
    if (!summary.passed) {
      return {
        ...summary,
        executionMode: "direct-node-fallback"
      };
    }
  }

  return {
    passed: true,
    exitCode: 0,
    timedOut: false,
    warningCodes,
    executionMode: "direct-node-fallback"
  };
}

function readJsonCommand(executable, commandArgs) {
  const result = spawnSync(executable, commandArgs, {
    encoding: "utf8",
    shell: false,
    timeout: commandTimeoutMs,
    maxBuffer: maximumCommandOutputBytes,
    env: process.env
  });
  if (result.status !== 0 || result.error) return null;
  try {
    return JSON.parse(result.stdout);
  } catch {
    return null;
  }
}

function readManifest() {
  return readJsonCommand(process.execPath, ["scripts/release-candidate-manifest.mjs", "--json"]);
}

function readArtifactReview() {
  return readJsonCommand(process.execPath, ["scripts/investor-deck-review.mjs", "--json"]);
}

async function validateCandidate({ quiet }) {
  const manifestBefore = readManifest();
  const checkResults = [];

  for (const command of validationCommands) {
    if (!quiet) console.log(`run ${command.display}`);
    const result = runCommand(command);
    checkResults.push({
      id: command.id,
      command: command.display,
      passed: result.passed,
      exitCode: result.exitCode,
      timedOut: result.timedOut,
      warningCodes: result.warningCodes,
      executionMode: result.executionMode
    });
    if (!quiet) console.log(`${result.passed ? "pass" : "fail"} ${command.id}`);
    if (!result.passed) break;
  }

  const artifactReview = checkResults.every((check) => check.passed) ? readArtifactReview() : null;
  const manifestAfter = readManifest();
  return evaluateReleaseCandidateValidation({
    manifestBefore,
    manifestAfter,
    artifactReview,
    checkResults
  });
}

function runSelfTest() {
  const digest = "a".repeat(64);
  const sourceDigest = "b".repeat(64);
  const artifactDigest = "c".repeat(64);
  const manifest = {
    baseHeadSha: "e".repeat(40),
    candidateDigestSha256: digest,
    sourceCandidateDigestSha256: sourceDigest,
    sourceReviewReady: true,
    artifactReviewRequired: true,
    nonSourceDeliverableCount: 1,
    requiredReviewers: ["Release steward", "Security reviewer"]
  };
  const checks = [
    { id: "typecheck", command: "npm run typecheck", passed: true, exitCode: 0, timedOut: false, warningCodes: [] },
    {
      id: "build",
      command: "npm run build",
      passed: true,
      exitCode: 0,
      timedOut: false,
      warningCodes: ["next-swc-native-binding-unavailable-wasm-fallback"]
    }
  ];
  const valid = evaluateReleaseCandidateValidation({
    manifestBefore: manifest,
    manifestAfter: manifest,
    artifactReview: { automatedReviewPassed: true, artifactFingerprintSha256: artifactDigest },
    checkResults: checks
  });
  const drifted = evaluateReleaseCandidateValidation({
    manifestBefore: manifest,
    manifestAfter: { ...manifest, candidateDigestSha256: "d".repeat(64) },
    artifactReview: { automatedReviewPassed: true, artifactFingerprintSha256: artifactDigest },
    checkResults: checks
  });
  const failedCheck = evaluateReleaseCandidateValidation({
    manifestBefore: manifest,
    manifestAfter: manifest,
    artifactReview: { automatedReviewPassed: true, artifactFingerprintSha256: artifactDigest },
    checkResults: [{ ...checks[0], passed: false, exitCode: 1 }]
  });
  const unreviewedArtifact = evaluateReleaseCandidateValidation({
    manifestBefore: manifest,
    manifestAfter: manifest,
    artifactReview: null,
    checkResults: checks
  });
  const sourceOnlyManifest = {
    ...manifest,
    artifactReviewRequired: false,
    nonSourceDeliverableCount: 0
  };
  const separatelyReviewedArtifact = evaluateReleaseCandidateValidation({
    manifestBefore: sourceOnlyManifest,
    manifestAfter: sourceOnlyManifest,
    artifactReview: { automatedReviewPassed: true, artifactFingerprintSha256: artifactDigest },
    checkResults: checks
  });
  const unsafeSeparateArtifact = evaluateReleaseCandidateValidation({
    manifestBefore: sourceOnlyManifest,
    manifestAfter: sourceOnlyManifest,
    artifactReview: { automatedReviewPassed: false, artifactFingerprintSha256: artifactDigest },
    checkResults: checks
  });

  if (
    !valid.automatedValidationPassed
    || !valid.currentCandidateAttested
    || valid.sourceCommitSha !== manifest.baseHeadSha
    || !valid.sourceCommitStable
    || valid.warningCount !== 1
    || valid.releasePromotionAllowed
    || valid.deploymentAuthorized
    || valid.externalDistributionAuthorized
    || valid.validationEvidenceHash !== evaluateReleaseCandidateValidation({
      manifestBefore: manifest,
      manifestAfter: manifest,
      artifactReview: { automatedReviewPassed: true, artifactFingerprintSha256: artifactDigest },
      checkResults: checks
    }).validationEvidenceHash
    || drifted.automatedValidationPassed
    || drifted.candidateStable
    || failedCheck.automatedValidationPassed
    || unreviewedArtifact.automatedValidationPassed
    || !separatelyReviewedArtifact.automatedValidationPassed
    || !separatelyReviewedArtifact.artifactReviewRequired
    || unsafeSeparateArtifact.automatedValidationPassed
  ) {
    throw new Error("Release candidate validation self-test failed.");
  }

  console.log("pass SCRIMED release candidate validation policy self-test");
}

if (args.has("--self-test")) {
  runSelfTest();
  process.exit(0);
}

const report = await validateCandidate({ quiet: args.has("--json") });

if (args.has("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`report SCRIMED release candidate validation: ${report.status}`);
  console.log(`candidate_fingerprint=${report.candidateFingerprint} source_fingerprint=${report.sourceFingerprint} artifact_fingerprint=${report.artifactFingerprint}`);
  console.log(`candidate_stable=${report.candidateStable} automated_validation_passed=${report.automatedValidationPassed} validation_evidence=${report.validationEvidenceHash}`);
  console.log(`checks=${report.checkCount} failed_checks=${report.failedChecks.length} warnings=${report.warningCount} human_review_required=${report.humanReviewRequired}`);
  if (report.warningCodes.length > 0) console.log(`warning_codes=${report.warningCodes.join(";")}`);
  console.log(report.boundary);
  console.log("release_promotion_allowed=false");
}

if (args.has("--strict") && !report.automatedValidationPassed) {
  process.exitCode = 1;
}
