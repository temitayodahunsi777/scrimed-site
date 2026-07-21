#!/usr/bin/env node

import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

import {
  buildP32GateEvidencePacket,
  buildP32OperatorHandoff,
  buildP32OperatorHandoffMarkdown
} from "../app/lib/scrimedP32GateEvidence.ts";

const rawArgs = process.argv.slice(2);
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

async function readSupplementalEvidence() {
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
  return parsed;
}

function syntheticReports() {
  const sourceCommit = "a".repeat(40);
  const candidateFingerprint = "b".repeat(64);
  const sourceFingerprint = "c".repeat(64);
  const artifactFingerprint = "d".repeat(64);
  const validationEvidenceFingerprint = "e".repeat(64);
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
  if (
    !packet.candidateReviewPacketReady ||
    packet.immutableProvenanceReady ||
    packet.allGateEvidenceSatisfied ||
    packet.releasePromotionAllowed ||
    packet.aggregateReleaseAuthorityGranted ||
    packet.packetHash !== repeated.packetHash ||
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
  let rejectedUnknownEvidence = false;
  try {
    buildP32GateEvidencePacket({
      ...input,
      supplementalEvidence: {
        approvals: [],
        automatedEvidence: [{ evidenceId: "unregistered-evidence" }]
      }
    });
  } catch {
    rejectedUnknownEvidence = true;
  }
  if (!rejectedUnknownEvidence) throw new Error("SCRIMED p.32 evidence accepted an unregistered evidence type.");
  const handoff = buildP32OperatorHandoff(packet);
  const handoffMarkdown = buildP32OperatorHandoffMarkdown(handoff);
  const deploymentAction = handoff.actions.find((action) => action.gateId === "deployment-authorization");
  const reviewerAction = handoff.actions.find((action) => action.gateId === "named-reviewer-approval");
  if (
    !/^[0-9a-f]{64}$/.test(handoff.handoffHash) ||
    handoff.releasePromotionAllowed ||
    handoff.aggregateReleaseAuthorityGranted ||
    handoff.actionCount !== packet.unresolvedGates.length ||
    reviewerAction?.executionState !== "READY_FOR_AUTHORIZED_OPERATOR" ||
    deploymentAction?.executionState !== "WAIT_FOR_PREREQUISITES" ||
    deploymentAction.blockedByGateIds.length === 0 ||
    !handoffMarkdown.includes(packet.expectedFingerprints.sourceCommit) ||
    !handoffMarkdown.includes("Release promotion allowed: **false**")
  ) {
    throw new Error("SCRIMED p.32 operator handoff self-test failed.");
  }
  console.log("pass SCRIMED p.32 candidate-bound release gate evidence self-test");
}

if (flags.has("--self-test")) {
  runSelfTest();
  process.exit(0);
}

const validation = readJsonCommand("scripts/release-candidate-validation.mjs", ["--json"]);
const manifest = readJsonCommand("scripts/release-candidate-manifest.mjs", ["--json"]);
const investorDeckReview = readJsonCommand("scripts/investor-deck-review.mjs", ["--json", "--strict"]);
const supplementalEvidence = await readSupplementalEvidence();
const packet = buildP32GateEvidencePacket({
  manifest,
  validation,
  investorDeckReview,
  supplementalEvidence,
  evaluatedAt: new Date().toISOString()
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
