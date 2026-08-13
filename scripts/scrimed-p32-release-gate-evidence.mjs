#!/usr/bin/env node

import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const rawArgs = process.argv.slice(2);
const loaderActive = process.execArgv.some((value) =>
  value.includes("ts-extension-loader.mjs")
);

if (!loaderActive) {
  const result = spawnSync(
    process.execPath,
    [
      "--disable-warning=ExperimentalWarning",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "--experimental-loader",
      fileURLToPath(new URL("./lib/ts-extension-loader.mjs", import.meta.url)),
      fileURLToPath(import.meta.url),
      ...rawArgs
    ],
    {
      encoding: "utf8",
      shell: false,
      timeout: 20 * 60 * 1000,
      maxBuffer: 32 * 1024 * 1024,
      env: process.env
    }
  );
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error) throw result.error;
  process.exit(Number.isInteger(result.status) ? result.status : 1);
}

const {
  buildP32GateEvidencePacket,
  buildP32OperatorHandoff,
  buildP32OperatorHandoffMarkdown
} = await import("../app/lib/scrimedP32GateEvidence.ts");
const {
  computeP32SupplementalEvidencePayloadHash,
  verifyP32SupplementalEvidenceAttestation
} = await import("./lib/scrimed-p32-evidence-attestation.mjs");

const flags = new Set(rawArgs.filter((arg) => !arg.startsWith("--evidence-file=")));
const evidenceFileArg = rawArgs.find((arg) => arg.startsWith("--evidence-file="));
const allowedFlags = new Set([
  "--json",
  "--operator-packet",
  "--strict",
  "--require-all-gate-evidence",
  "--self-test"
]);
const unknownArgs = rawArgs.filter(
  (arg) => !allowedFlags.has(arg) && !arg.startsWith("--evidence-file=")
);
const maximumEvidenceFileBytes = 256 * 1024;
const commandTimeoutMs = 20 * 60 * 1000;

if (unknownArgs.length > 0) {
  throw new Error(`Unsupported p.32 release gate evidence option: ${unknownArgs.join(", ")}`);
}
if (flags.has("--json") && flags.has("--operator-packet")) {
  throw new Error("Use either --json or --operator-packet, not both.");
}

function readJsonCommand(script, args) {
  const result = spawnSync(process.execPath, [script, ...args], {
    encoding: "utf8",
    shell: false,
    timeout: commandTimeoutMs,
    maxBuffer: 32 * 1024 * 1024,
    env: process.env
  });

  if (result.status !== 0 || result.error) {
    throw new Error(`SCRIMED p.32 evidence could not obtain ${script} output.`);
  }

  try {
    return JSON.parse(result.stdout);
  } catch {
    throw new Error(`SCRIMED p.32 evidence received malformed JSON from ${script}.`);
  }
}

function containsSecretLikeMaterial(value) {
  return /(?:bearer\s+[A-Za-z0-9._-]+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|sk-[A-Za-z0-9_-]{12,}|sbp_[A-Za-z0-9_-]{12,}|service[_ -]?role|-----BEGIN [A-Z ]*PRIVATE KEY-----)/i.test(value);
}

async function readSupplementalEvidence(evaluatedAt) {
  if (!evidenceFileArg) return { automatedEvidence: [], approvals: [] };
  const requestedPath = evidenceFileArg.slice("--evidence-file=".length).trim();
  if (!requestedPath) throw new Error("--evidence-file requires a local JSON file path.");
  const evidencePath = resolve(process.cwd(), requestedPath);
  const fileStatus = await stat(evidencePath);
  if (!fileStatus.isFile() || fileStatus.size > maximumEvidenceFileBytes) {
    throw new Error("SCRIMED p.32 supplemental evidence must be a bounded local JSON file.");
  }
  const raw = await readFile(evidencePath, "utf8");
  if (containsSecretLikeMaterial(raw)) {
    throw new Error("SCRIMED p.32 supplemental evidence rejected secret-like material.");
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("SCRIMED p.32 supplemental evidence must be valid JSON.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("SCRIMED p.32 supplemental evidence must be a JSON object.");
  }
  if (!Array.isArray(parsed.automatedEvidence) || !Array.isArray(parsed.approvals)) {
    throw new Error("SCRIMED p.32 supplemental evidence requires automatedEvidence and approvals arrays.");
  }
  const allowedTopLevelFields = new Set(["automatedEvidence", "approvals", "attestation"]);
  if (Object.keys(parsed).some((field) => !allowedTopLevelFields.has(field))) {
    throw new Error("SCRIMED p.32 supplemental evidence contains unsupported top-level fields.");
  }
  const supplementalEvidence = {
    automatedEvidence: parsed.automatedEvidence,
    approvals: parsed.approvals
  };
  const verifiedAttestation = verifyP32SupplementalEvidenceAttestation({
    supplementalEvidence,
    attestation: parsed.attestation,
    trustedPublicKeysJson: process.env.SCRIMED_P32_EVIDENCE_TRUSTED_PUBLIC_KEYS_JSON,
    evaluatedAt
  });
  return {
    ...supplementalEvidence,
    ...(verifiedAttestation ? { verifiedAttestation } : {})
  };
}

function syntheticReports() {
  const sourceCommit = "a".repeat(40);
  const candidateFingerprint = "b".repeat(64);
  const sourceFingerprint = "c".repeat(64);
  const artifactFingerprint = "d".repeat(64);
  const validationEvidenceFingerprint = "e".repeat(64);
  const reviewPacketFingerprint = "f".repeat(64);
  return {
    manifest: {
      baseHeadSha: sourceCommit,
      candidateDigestSha256: candidateFingerprint,
      sourceCandidateDigestSha256: sourceFingerprint,
      dirtyEntryCount: 3,
      sourceReviewReady: true,
      strictProvenanceEligible: false
    },
    validation: {
      sourceCommitSha: sourceCommit,
      candidateFingerprintSha256: candidateFingerprint,
      sourceFingerprintSha256: sourceFingerprint,
      artifactFingerprintSha256: artifactFingerprint,
      artifactReviewRequired: true,
      validationEvidenceHashSha256: validationEvidenceFingerprint,
      candidateStable: true,
      sourceReviewReady: true,
      artifactReviewPassed: true,
      automatedValidationPassed: true,
      checks: [{ id: "nonsecret-suite", passed: true }],
      warningCodes: []
    },
    investorDeckReview: {
      artifactFingerprintSha256: artifactFingerprint,
      automatedReviewPassed: true,
      humanReleaseReviewRequired: true
    },
    candidateReview: {
      baseHeadSha: sourceCommit,
      candidateDigestSha256: candidateFingerprint,
      sourceCandidateDigestSha256: sourceFingerprint,
      candidateReviewPacketSha256: reviewPacketFingerprint,
      completeCoverage: true
    }
  };
}

function runSelfTest() {
  const reports = syntheticReports();
  const input = {
    ...reports,
    evaluatedAt: "2026-07-20T12:00:00.000Z"
  };
  const packet = buildP32GateEvidencePacket(input);
  const repeated = buildP32GateEvidencePacket(input);
  const sourceOnlyPacket = buildP32GateEvidencePacket({
    ...input,
    validation: {
      ...input.validation,
      artifactFingerprintSha256: null,
      artifactReviewRequired: false
    }
  });
  if (
    !packet.candidateReviewPacketReady ||
    packet.immutableProvenanceReady ||
    packet.allGateEvidenceSatisfied ||
    packet.releasePromotionAllowed ||
    packet.aggregateReleaseAuthorityGranted ||
    packet.packetHash !== repeated.packetHash ||
    sourceOnlyPacket.expectedFingerprints.artifact !== reports.investorDeckReview.artifactFingerprintSha256 ||
    packet.registry.gates.find((gate) => gate.gateId === "clean-reviewed-source-commit")?.status !== "BLOCKED" ||
    packet.registry.gates.find((gate) => gate.gateId === "security-privacy-review")?.status === "FAIL"
  ) {
    throw new Error("SCRIMED p.32 release gate evidence self-test failed.");
  }
  let rejectedTamper = false;
  try {
    buildP32GateEvidencePacket({
      ...input,
      investorDeckReview: {
        ...input.investorDeckReview,
        artifactFingerprintSha256: "f".repeat(64)
      }
    });
  } catch {
    rejectedTamper = true;
  }
  if (!rejectedTamper) throw new Error("SCRIMED p.32 evidence accepted a mismatched artifact fingerprint.");
  let rejectedReviewPacketTamper = false;
  try {
    buildP32GateEvidencePacket({
      ...input,
      candidateReview: {
        ...input.candidateReview,
        candidateDigestSha256: "0".repeat(64)
      }
    });
  } catch {
    rejectedReviewPacketTamper = true;
  }
  if (!rejectedReviewPacketTamper) {
    throw new Error("SCRIMED p.32 evidence accepted a review packet bound to a different candidate.");
  }
  let rejectedUnknownEvidence = false;
  const unknownAutomatedEvidence = [{ evidenceId: "unregistered-evidence" }];
  try {
    buildP32GateEvidencePacket({
      ...input,
      supplementalEvidence: {
        approvals: [],
        automatedEvidence: unknownAutomatedEvidence,
        verifiedAttestation: {
          version: "scrimed-p32-supplemental-evidence-attestation-v1",
          issuer: "scrimed-synthetic-self-test-issuer",
          keyId: "scrimed-synthetic-self-test-key",
          algorithm: "Ed25519",
          signedAt: input.evaluatedAt,
          expiresAt: "2026-07-20T12:30:00.000Z",
          payloadHash: computeP32SupplementalEvidencePayloadHash({
            automatedEvidence: unknownAutomatedEvidence,
            approvals: []
          }),
          signatureFingerprint: "f".repeat(64),
          verifiedAt: input.evaluatedAt,
          verificationMethod: "ed25519-trusted-issuer"
        }
      }
    });
  } catch {
    rejectedUnknownEvidence = true;
  }
  if (!rejectedUnknownEvidence) throw new Error("SCRIMED p.32 evidence accepted an unregistered evidence type.");
  const handoff = buildP32OperatorHandoff(packet);
  const handoffMarkdown = buildP32OperatorHandoffMarkdown(handoff);
  const commitAction = handoff.actions.find((action) => action.gateId === "clean-reviewed-source-commit");
  const deploymentAction = handoff.actions.find((action) => action.gateId === "deployment-authorization");
  const reviewerAction = handoff.actions.find((action) => action.gateId === "named-reviewer-approval");
  const validationAction = handoff.actions.find((action) => action.gateId === "validation-evidence-integrity");
  if (
    !/^[0-9a-f]{64}$/.test(handoff.handoffHash) ||
    handoff.releasePromotionAllowed ||
    handoff.aggregateReleaseAuthorityGranted ||
    handoff.actionCount !== packet.unresolvedGates.length ||
    handoff.readyActionCount !== 1 ||
    commitAction?.executionState !== "READY_FOR_AUTHORIZED_OPERATOR" ||
    commitAction.blockedByGateIds.length !== 0 ||
    reviewerAction?.executionState !== "WAIT_FOR_PREREQUISITES" ||
    !reviewerAction.blockedByGateIds.includes("clean-reviewed-source-commit") ||
    validationAction?.executionState !== "WAIT_FOR_PREREQUISITES" ||
    !validationAction.blockedByGateIds.includes("clean-reviewed-source-commit") ||
    deploymentAction?.executionState !== "WAIT_FOR_PREREQUISITES" ||
    deploymentAction.blockedByGateIds.length === 0 ||
    !handoffMarkdown.includes(packet.expectedFingerprints.sourceCommit) ||
    !handoffMarkdown.includes(packet.expectedFingerprints.reviewPacket) ||
    !handoffMarkdown.includes(packet.candidateFingerprint) ||
    !handoffMarkdown.includes("Release promotion allowed: **false**")
  ) {
    throw new Error("SCRIMED p.32 operator handoff self-test failed.");
  }

  const cleanPacket = buildP32GateEvidencePacket({
    ...input,
    manifest: {
      ...input.manifest,
      dirtyEntryCount: 0,
      strictProvenanceEligible: true
    }
  });
  const cleanHandoff = buildP32OperatorHandoff(cleanPacket);
  const cleanReviewerAction = cleanHandoff.actions.find(
    (action) => action.gateId === "named-reviewer-approval"
  );
  if (
    !cleanPacket.immutableProvenanceReady ||
    cleanReviewerAction?.executionState !== "READY_FOR_AUTHORIZED_OPERATOR" ||
    cleanReviewerAction.blockedByGateIds.length !== 0
  ) {
    throw new Error("SCRIMED p.32 clean-candidate approval sequencing self-test failed.");
  }
  console.log("pass SCRIMED p.32 candidate-bound release gate evidence self-test");
}

if (flags.has("--self-test")) {
  runSelfTest();
  process.exit(0);
}

const validation = readJsonCommand("scripts/release-candidate-validation.mjs", ["--json"]);
if (validation?.automatedValidationPassed !== true) {
  throw new Error(
    `SCRIMED p.32 evidence requires passing candidate validation before packet construction: ${validation?.status ?? "validation-output-unavailable"}.`
  );
}
const manifest = readJsonCommand("scripts/release-candidate-manifest.mjs", ["--json"]);
const investorDeckReview = readJsonCommand("scripts/investor-deck-review.mjs", ["--json"]);
const candidateReview = readJsonCommand("scripts/release-candidate-review-packet.mjs", ["--json"]);
const evaluatedAt = new Date().toISOString();
const supplementalEvidence = await readSupplementalEvidence(evaluatedAt);
const packet = buildP32GateEvidencePacket({
  manifest,
  validation,
  investorDeckReview,
  candidateReview,
  supplementalEvidence,
  evaluatedAt
});

if (flags.has("--operator-packet")) {
  console.log(buildP32OperatorHandoffMarkdown(buildP32OperatorHandoff(packet)).trimEnd());
} else if (flags.has("--json")) {
  console.log(JSON.stringify(packet, null, 2));
} else {
  console.log(`report SCRIMED p.32 release gate evidence: ${packet.status}`);
  console.log(`candidate_fingerprint=${packet.candidateFingerprint.slice(0, 16)} packet_hash=${packet.packetHash.slice(0, 16)}`);
  console.log(`gates=${packet.registry.summary.total} passed=${packet.registry.summary.passed} failed=${packet.registry.summary.failed} blocked=${packet.registry.summary.blocked} operator_required=${packet.registry.summary.operatorRequired} not_applicable=${packet.registry.summary.notApplicable} expired_evidence=${packet.registry.summary.expiredEvidence}`);
  console.log(`candidate_review_packet_ready=${packet.candidateReviewPacketReady} immutable_provenance_ready=${packet.immutableProvenanceReady} all_gate_evidence_satisfied=${packet.allGateEvidenceSatisfied}`);
  console.log(`unresolved_candidate_review=${packet.unresolvedByPhase.candidateReview} unresolved_pre_deployment=${packet.unresolvedByPhase.preDeployment} unresolved_post_deployment=${packet.unresolvedByPhase.postDeployment} unresolved_customer_go_live=${packet.unresolvedByPhase.customerGoLive}`);
  if (packet.warningCodes.length > 0) console.log(`warning_codes=${packet.warningCodes.join(";")}`);
  console.log(packet.boundary);
  console.log("release_promotion_allowed=false aggregate_release_authority_granted=false");
}

if (flags.has("--strict") && !packet.candidateReviewPacketReady) {
  process.exitCode = 1;
}

if (flags.has("--require-all-gate-evidence") && !packet.allGateEvidenceSatisfied) {
  process.exitCode = 1;
}
