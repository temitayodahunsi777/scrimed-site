#!/usr/bin/env node

import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import { readFile } from "node:fs/promises";

import {
  createExactHeadApprovalDigest,
  evaluateExactHeadReviewBinding
} from "../app/lib/exactHeadReviewBinding.ts";
import { evaluateMergeReadiness } from "../app/lib/mergeReadiness.ts";
import { getScrimedOperatingModeSummary } from "../app/lib/operatingMode.ts";
import {
  computeP32SupplementalEvidencePayloadHash,
  p32EvidenceTrustRegistryVersion,
  p32SupplementalEvidenceAttestationVersion,
  verifyP32SupplementalEvidenceAttestation
} from "./lib/scrimed-p32-evidence-attestation.mjs";
import {
  consumeExactHeadApproval,
  inspectExactHeadApprovalConsumption,
  releaseExactHeadApprovalConsumption,
  runExactHeadApprovalConsumptionLedgerSelfTest
} from "./lib/exact-head-approval-consumption-ledger.mjs";
import {
  buildCurrentExactHeadReviewCandidate,
  loadCurrentExactHeadReviewCandidate
} from "./lib/current-exact-head-review-candidate.mjs";

const sha256Pattern = /^[0-9a-f]{64}$/;

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cliValue(name) {
  const exactIndex = process.argv.indexOf(name);
  if (exactIndex >= 0) return process.argv[exactIndex + 1] ?? null;
  const prefix = `${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length) ?? null;
}

async function loadApprovalFile(path) {
  if (!path) return { document: null, loadError: null };

  try {
    const parsed = JSON.parse(await readFile(path, "utf8"));
    const approval = parsed?.approval ?? parsed;
    if (!approval || typeof approval !== "object" || Array.isArray(approval)) {
      return { document: null, loadError: "exact-head-approval-file-invalid" };
    }
    return {
      document: {
        approval,
        identityEvidence: parsed?.approval ? parsed.identityEvidence : null
      },
      loadError: null
    };
  } catch {
    return { document: null, loadError: "exact-head-approval-file-unreadable" };
  }
}

function approvalEvidenceMatches(approval, evidence) {
  return (
    isObject(evidence) &&
    evidence.approvalId === approval.approvalId &&
    evidence.gateId === "exact-head-review" &&
    evidence.reviewerId === approval.reviewerIdentityHash &&
    typeof evidence.reviewerRole === "string" &&
    Boolean(evidence.reviewerRole.trim()) &&
    new Set([
      "aal2-protected-workspace",
      "qualified-external-reference"
    ]).has(evidence.identityAssurance) &&
    typeof evidence.tenantScopeHash === "string" &&
    sha256Pattern.test(evidence.tenantScopeHash) &&
    evidence.decision === "approved" &&
    evidence.sourceCommit === approval.commitSha &&
    evidence.sourceTreeFingerprint === approval.sourceFingerprint &&
    evidence.artifactFingerprint === approval.candidateFingerprint &&
    evidence.validationEvidenceFingerprint === approval.validationFingerprint &&
    evidence.reviewPacketFingerprint === approval.reviewPacketFingerprint &&
    typeof evidence.evidencePointer === "string" &&
    Boolean(evidence.evidencePointer.trim()) &&
    evidence.approvedAt === approval.issuedAt &&
    evidence.expiresAt === approval.expiresAt &&
    evidence.releaseAuthorityGranted === false &&
    evidence.decisionHash === approval.approvalDigest
  );
}

function verifyApprovalDocument({
  document,
  trustedPublicKeysJson,
  evaluatedAt
}) {
  if (!isObject(document) || !isObject(document.approval)) {
    return {
      approval: null,
      verifiedIdentityEvidence: null,
      verificationError: "exact-head-approval-file-invalid"
    };
  }

  const approval = document.approval;
  if (!isObject(document.identityEvidence)) {
    return {
      approval,
      verifiedIdentityEvidence: null,
      verificationError: "exact-head-review-identity-attestation-missing"
    };
  }

  const { attestation, ...supplementalEvidence } = document.identityEvidence;
  if (
    !Array.isArray(supplementalEvidence.automatedEvidence) ||
    supplementalEvidence.automatedEvidence.length !== 0 ||
    !Array.isArray(supplementalEvidence.approvals) ||
    supplementalEvidence.approvals.length !== 1
  ) {
    return {
      approval,
      verifiedIdentityEvidence: null,
      verificationError: "exact-head-review-identity-evidence-invalid"
    };
  }

  const approvalEvidence = supplementalEvidence.approvals[0];
  if (!approvalEvidenceMatches(approval, approvalEvidence)) {
    return {
      approval,
      verifiedIdentityEvidence: null,
      verificationError: "exact-head-review-identity-evidence-mismatch"
    };
  }

  try {
    const verified = verifyP32SupplementalEvidenceAttestation({
      supplementalEvidence,
      attestation,
      trustedPublicKeysJson,
      evaluatedAt
    });
    if (!verified) {
      throw new Error("trusted issuer attestation is required");
    }

    return {
      approval,
      verifiedIdentityEvidence: {
        gateId: "exact-head-review",
        decision: "approved",
        reviewerIdentityHash: approvalEvidence.reviewerId,
        approvalDigest: approvalEvidence.decisionHash,
        issuer: verified.issuer,
        keyId: verified.keyId,
        verificationMethod: verified.verificationMethod,
        signatureFingerprint: verified.signatureFingerprint,
        payloadHash: verified.payloadHash,
        approvedAt: approvalEvidence.approvedAt,
        approvalExpiresAt: approvalEvidence.expiresAt,
        attestationExpiresAt: verified.expiresAt,
        verifiedAt: verified.verifiedAt
      },
      verificationError: null
    };
  } catch {
    return {
      approval,
      verifiedIdentityEvidence: null,
      verificationError: "exact-head-review-identity-attestation-invalid"
    };
  }
}

async function buildCurrentMergeReadinessContext(options = {}) {
  const currentCandidate =
    options.currentCandidateResult ??
    (await loadCurrentExactHeadReviewCandidate({
      currentCandidateEvidence: options.currentCandidateEvidence
    }));
  const candidate = currentCandidate.candidate;
  const operatingMode = getScrimedOperatingModeSummary().mode;
  const approvalPath =
    options.approvalPath ??
    process.env.SCRIMED_EXACT_HEAD_APPROVAL_FILE ??
    cliValue("--approval-file");
  const loaded = Object.hasOwn(options, "approvalDocument")
    ? { document: options.approvalDocument, loadError: null }
    : await loadApprovalFile(approvalPath);
  const verifiedDocument = loaded.document
    ? verifyApprovalDocument({
        document: loaded.document,
        trustedPublicKeysJson:
          options.trustedPublicKeysJson ??
          process.env.SCRIMED_P32_EVIDENCE_TRUSTED_PUBLIC_KEYS_JSON,
        evaluatedAt: options.evaluatedAt ?? new Date().toISOString()
      })
    : {
        approval: null,
        verifiedIdentityEvidence: null,
        verificationError: null
      };
  const consumptionState = await inspectExactHeadApprovalConsumption({
    approval: verifiedDocument.approval,
    ledgerDirectory:
      options.consumptionLedgerDirectory ??
      process.env.SCRIMED_EXACT_HEAD_CONSUMPTION_LEDGER_DIR,
    required:
      options.requireConsumptionLedger ?? Boolean(verifiedDocument.approval)
  });
  const reviewBinding = evaluateExactHeadReviewBinding({
    candidate,
    approval: verifiedDocument.approval,
    verifiedIdentityEvidence: verifiedDocument.verifiedIdentityEvidence,
    consumedApprovalIds: consumptionState.consumedApprovalIds,
    evaluatedAt: options.evaluatedAt
  });
  const approvalConsumptionState = !verifiedDocument.approval
    ? "not-applicable"
    : !consumptionState.ready
      ? "unavailable"
      : consumptionState.consumed
        ? "consumed"
        : "available";
  const input = {
    exactHeadApproval: Boolean(verifiedDocument.approval),
    exactHeadApprovalMatches:
      consumptionState.ready &&
      reviewBinding.approved &&
      reviewBinding.status === "APPROVED_EXACT_HEAD",
    ciPassed: currentCandidate.validation.ciPassed,
    secretScanPassed: currentCandidate.validation.secretScanPassed,
    sbomPassed: currentCandidate.validation.sbomPassed,
    publicClaimsPassed: currentCandidate.validation.publicClaimsPassed,
    unreviewedMigrationsAdded:
      currentCandidate.validation.unreviewedMigrationsAdded,
    syntheticOnly: operatingMode.syntheticOnly,
    phiEnabled: operatingMode.allowPHI,
    clinicalExecutionEnabled: operatingMode.liveClinicalExecution,
    ehrWritebackEnabled: operatingMode.productionEHRConnections,
    deviceWritebackEnabled: operatingMode.medicalDeviceConnections,
    customerActivationEnabled: false,
    productionAutoDeployFromMainEnabled:
      currentCandidate.validation.productionAutoDeployFromMainEnabled,
    reviewBindingStatus:
      verifiedDocument.approval && !consumptionState.ready
        ? "BLOCKED"
        : reviewBinding.status,
    reviewBindingReasonCodes: [
      ...(loaded.loadError ? [loaded.loadError] : []),
      ...(verifiedDocument.verificationError
        ? [verifiedDocument.verificationError]
        : []),
      ...(consumptionState.errorCode ? [consumptionState.errorCode] : []),
      ...reviewBinding.reasonCodes
    ],
    reviewedCommitSha:
      consumptionState.ready && !consumptionState.consumed
        ? reviewBinding.approvedCommitSha
        : null,
    approvalConsumptionLedgerConfigured: consumptionState.configured,
    approvalConsumptionLedgerReady: consumptionState.ready,
    approvalConsumptionState,
    approvalConsumptionLedgerFingerprint:
      consumptionState.ledgerDirectoryFingerprint
  };

  return {
    input,
    approval: verifiedDocument.approval,
    identityVerified: Boolean(verifiedDocument.verifiedIdentityEvidence),
    consumptionState,
    currentCandidate
  };
}

export async function buildCurrentMergeReadinessInput(options = {}) {
  const context = await buildCurrentMergeReadinessContext(options);
  try {
    return context.input;
  } finally {
    await releaseExactHeadApprovalConsumption(context.consumptionState);
  }
}

export async function evaluateCurrentMergeReadiness(options = {}) {
  const context = await buildCurrentMergeReadinessContext(options);
  try {
    let input = context.input;
    let result = evaluateMergeReadiness(input);
    let consumptionReceipt = {
      consumed: false,
      replayRejected: false,
      receiptHash: null,
      errorCode: null
    };

    if (options.consumeApproval === true && result.ready) {
      consumptionReceipt = await consumeExactHeadApproval({
        approval: context.approval,
        consumptionState: context.consumptionState,
        consumedAt: options.consumedAt
      });
      if (!consumptionReceipt.consumed) {
        input = {
          ...input,
          exactHeadApprovalMatches: false,
          reviewBindingStatus: "BLOCKED",
          reviewedCommitSha: null,
          approvalConsumptionState: consumptionReceipt.replayRejected
            ? "consumed"
            : "unavailable",
          reviewBindingReasonCodes: [
            ...new Set([
              ...input.reviewBindingReasonCodes,
              consumptionReceipt.errorCode
            ].filter(Boolean))
          ]
        };
        result = evaluateMergeReadiness(input);
      }
    }

    return {
      input,
      result,
      approvalConsumptionReceipt: consumptionReceipt
    };
  } finally {
    await releaseExactHeadApprovalConsumption(context.consumptionState);
  }
}

function buildSelfTestTrustContext(approval) {
  const issuer = "scrimed-exact-head-self-test-issuer";
  const keyId = "scrimed-exact-head-self-test-key";
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const approvalEvidence = {
    approvalId: approval.approvalId,
    gateId: "exact-head-review",
    reviewerId: approval.reviewerIdentityHash,
    reviewerRole: "independent-exact-head-reviewer",
    identityAssurance: "qualified-external-reference",
    tenantScopeHash: approval.sourceFingerprint,
    decision: "approved",
    sourceCommit: approval.commitSha,
    sourceTreeFingerprint: approval.sourceFingerprint,
    artifactFingerprint: approval.candidateFingerprint,
    validationEvidenceFingerprint: approval.validationFingerprint,
    reviewPacketFingerprint: approval.reviewPacketFingerprint,
    evidencePointer: "self-test:exact-head-review",
    approvedAt: approval.issuedAt,
    expiresAt: approval.expiresAt,
    releaseAuthorityGranted: false,
    decisionHash: approval.approvalDigest
  };
  const supplementalEvidence = {
    automatedEvidence: [],
    approvals: [approvalEvidence]
  };
  const payloadHash = computeP32SupplementalEvidencePayloadHash(
    supplementalEvidence
  );
  const signedAt = "2026-08-09T22:55:00.000Z";
  const attestationExpiresAt = "2026-08-09T23:55:00.000Z";
  const signature = sign(
    null,
    Buffer.from(payloadHash, "hex"),
    privateKey
  ).toString("base64url");
  const approvalDocument = {
    approval,
    identityEvidence: {
      ...supplementalEvidence,
      attestation: {
        version: p32SupplementalEvidenceAttestationVersion,
        issuer,
        keyId,
        algorithm: "Ed25519",
        signedAt,
        expiresAt: attestationExpiresAt,
        payloadHash,
        signature
      }
    }
  };
  const trustedPublicKeysJson = JSON.stringify({
    version: p32EvidenceTrustRegistryVersion,
    keys: {
      [keyId]: {
        issuer,
        status: "active",
        notBefore: "2026-08-09T00:00:00.000Z",
        expiresAt: "2026-08-11T00:00:00.000Z",
        publicKeyPem: publicKey.export({ type: "spki", format: "pem" }),
        allowedAutomatedEvidenceIds: [],
        allowedApprovalGateIds: ["exact-head-review"],
        allowedIdentityAssurance: ["qualified-external-reference"]
      }
    }
  });

  return { approvalDocument, trustedPublicKeysJson };
}

function buildSelfTestCurrentCandidateResult() {
  const sourceState = {
    clean: true,
    commitSha: "f".repeat(40),
    treeSha: "e".repeat(40),
    authorIdentityHash: "b".repeat(64)
  };
  const manifest = {
    strictProvenanceEligible: true,
    candidateMode: "clean-commit",
    dirtyEntryCount: 0,
    baseHeadSha: sourceState.commitSha,
    headTreeSha: sourceState.treeSha,
    candidateBaseSha: "d".repeat(40),
    candidateDigestSha256: "1".repeat(64),
    sourceCandidateDigestSha256: "2".repeat(64),
    changedFileCount: 1
  };
  const checks = [
    "secret-scan",
    "sbom",
    "migration-packet",
    "nonsecret-suite",
    "build"
  ].map((id) => ({ id, passed: true }));
  const validation = {
    automatedValidationPassed: true,
    candidateStable: true,
    sourceCommitStable: true,
    sourceReviewReady: true,
    sourceCommitSha: sourceState.commitSha,
    candidateFingerprintSha256: manifest.candidateDigestSha256,
    sourceFingerprintSha256: manifest.sourceCandidateDigestSha256,
    validationEvidenceHashSha256: "3".repeat(64),
    failedChecks: [],
    checkCount: checks.length,
    checks
  };
  const reviewPacket = {
    completeCoverage: true,
    reviewBatchCoverageComplete: true,
    rejectedFileCount: 0,
    baseHeadSha: sourceState.commitSha,
    headTreeSha: sourceState.treeSha,
    candidateDigestSha256: manifest.candidateDigestSha256,
    sourceCandidateDigestSha256: manifest.sourceCandidateDigestSha256,
    candidateReviewPacketSha256: "4".repeat(64),
    reviewableFileCount: 1
  };

  return buildCurrentExactHeadReviewCandidate({
    sourceState,
    manifest,
    validation,
    reviewPacket,
    sbom: {
      sbomHash: "5".repeat(64),
      componentCount: 1,
      dependencyDeltaCount: 0
    },
    vercelConfiguration: {
      git: { deploymentEnabled: { main: false } }
    }
  });
}

export async function runMergeReadinessSelfTest() {
  const readyInput = {
    exactHeadApproval: true,
    exactHeadApprovalMatches: true,
    ciPassed: true,
    secretScanPassed: true,
    sbomPassed: true,
    publicClaimsPassed: true,
    unreviewedMigrationsAdded: false,
    syntheticOnly: true,
    phiEnabled: false,
    clinicalExecutionEnabled: false,
    ehrWritebackEnabled: false,
    deviceWritebackEnabled: false,
    customerActivationEnabled: false,
    productionAutoDeployFromMainEnabled: false
  };
  const ready = evaluateMergeReadiness(readyInput);
  assert.equal(ready.status, "READY_FOR_MERGE_AUTHORIZATION");
  assert.equal(ready.mergePerformed, false);
  assert.equal(ready.deploymentPerformed, false);

  const stale = evaluateMergeReadiness({
    ...readyInput,
    exactHeadApprovalMatches: false
  });
  assert.equal(stale.status, "NOT_READY_FOR_MERGE");
  assert.ok(stale.reasonCodes.includes("merge-exact-head-approval-stale"));

  const unsafe = evaluateMergeReadiness({
    ...readyInput,
    phiEnabled: true,
    productionAutoDeployFromMainEnabled: true
  });
  assert.ok(unsafe.reasonCodes.includes("merge-phi-enabled"));
  assert.ok(unsafe.reasonCodes.includes("merge-production-auto-deploy-enabled"));

  const currentCandidateResult = buildSelfTestCurrentCandidateResult();
  const candidate = currentCandidateResult.candidate;
  const approvalBase = {
    approvalId: "merge-readiness-self-test-approval",
    replayNonce: "merge-readiness-self-test-nonce",
    commitSha: candidate.commitSha,
    candidateFingerprint: candidate.candidateFingerprint,
    sourceFingerprint: candidate.sourceFingerprint,
    validationFingerprint: candidate.validationFingerprint,
    reviewPacketFingerprint: candidate.reviewPacketFingerprint,
    sbomFingerprint: candidate.sbomFingerprint,
    criticalSurfaces: candidate.criticalSurfaces,
    reviewerIdentityHash: "0".repeat(64),
    disposition: "APPROVE_EXACT_HEAD",
    evidenceIds: [
      "ci",
      "secret-scan",
      "sbom",
      "public-claims",
      "migration-review",
      "operating-mode"
    ],
    issuedAt: "2026-08-09T22:00:00.000Z",
    expiresAt: "2026-08-10T22:00:00.000Z"
  };
  const approval = {
    ...approvalBase,
    approvalDigest: createExactHeadApprovalDigest(approvalBase)
  };
  const trusted = buildSelfTestTrustContext(approval);
  const verifiedInput = await buildCurrentMergeReadinessInput({
    ...trusted,
    currentCandidateResult,
    requireConsumptionLedger: false,
    evaluatedAt: "2026-08-09T23:00:00.000Z"
  });
  assert.equal(verifiedInput.exactHeadApproval, true);
  assert.equal(verifiedInput.exactHeadApprovalMatches, true);
  assert.equal(verifiedInput.reviewBindingStatus, "APPROVED_EXACT_HEAD");

  const missingLedgerInput = await buildCurrentMergeReadinessInput({
    ...trusted,
    currentCandidateResult,
    evaluatedAt: "2026-08-09T23:00:00.000Z"
  });
  assert.equal(missingLedgerInput.exactHeadApprovalMatches, false);
  assert.ok(
    missingLedgerInput.reviewBindingReasonCodes.includes(
      "exact-head-review-consumption-ledger-required"
    )
  );

  const unknownDispositionBase = {
    ...approvalBase,
    disposition: "UNKNOWN_DISPOSITION"
  };
  const unknownDispositionApproval = {
    ...unknownDispositionBase,
    approvalDigest: createExactHeadApprovalDigest(unknownDispositionBase)
  };
  const invalidInput = await buildCurrentMergeReadinessInput({
    ...buildSelfTestTrustContext(unknownDispositionApproval),
    currentCandidateResult,
    requireConsumptionLedger: false,
    evaluatedAt: "2026-08-09T23:00:00.000Z"
  });
  assert.equal(invalidInput.exactHeadApproval, true);
  assert.equal(invalidInput.exactHeadApprovalMatches, false);
  assert.ok(
    invalidInput.reviewBindingReasonCodes.includes(
      "exact-head-review-approval-invalid"
    )
  );

  const unsignedInput = await buildCurrentMergeReadinessInput({
    approvalDocument: { approval },
    trustedPublicKeysJson: trusted.trustedPublicKeysJson,
    currentCandidateResult,
    requireConsumptionLedger: false,
    evaluatedAt: "2026-08-09T23:00:00.000Z"
  });
  assert.equal(unsignedInput.exactHeadApproval, true);
  assert.equal(unsignedInput.exactHeadApprovalMatches, false);
  assert.ok(
    unsignedInput.reviewBindingReasonCodes.includes(
      "exact-head-review-identity-attestation-missing"
    )
  );
  assert.ok(
    unsignedInput.reviewBindingReasonCodes.includes(
      "exact-head-review-untrusted-identity"
    )
  );

  const staleCandidate = {
    ...candidate,
    commitSha: "c15a79c76d59a2f94bb7f999469da8bbc1618d8c",
    candidateFingerprint: "c".repeat(64),
    sourceFingerprint: "d".repeat(64),
    validationFingerprint: "e".repeat(64),
    reviewPacketFingerprint: "0".repeat(64)
  };
  const staleApprovalBase = {
    ...approvalBase,
    commitSha: staleCandidate.commitSha,
    candidateFingerprint: staleCandidate.candidateFingerprint,
    sourceFingerprint: staleCandidate.sourceFingerprint,
    validationFingerprint: staleCandidate.validationFingerprint,
    reviewPacketFingerprint: staleCandidate.reviewPacketFingerprint,
    sbomFingerprint: staleCandidate.sbomFingerprint,
    criticalSurfaces: staleCandidate.criticalSurfaces
  };
  const staleApproval = {
    ...staleApprovalBase,
    approvalDigest: createExactHeadApprovalDigest(staleApprovalBase)
  };
  const staleBaselineInput = await buildCurrentMergeReadinessInput({
    ...buildSelfTestTrustContext(staleApproval),
    currentCandidateResult,
    requireConsumptionLedger: false,
    evaluatedAt: "2026-08-09T23:00:00.000Z"
  });
  assert.equal(staleBaselineInput.exactHeadApprovalMatches, false);
  assert.equal(staleBaselineInput.reviewBindingStatus, "BLOCKED");
  assert.ok(
    staleBaselineInput.reviewBindingReasonCodes.includes(
      "exact-head-review-stale"
    )
  );

  await runExactHeadApprovalConsumptionLedgerSelfTest();

  console.log(
    "pass merge-readiness verifier self-test (checked-out-head candidate binding, stale frozen-baseline rejection, trusted Ed25519 artifact, durable one-use consumption, replay rejection, forged unsigned rejection, CI, supply chain, claims, migrations, operating mode, and production auto-deploy)"
  );
}

if (process.argv.includes("--self-test")) {
  await runMergeReadinessSelfTest();
  process.exit(0);
}

if (process.argv.includes("--candidate-only")) {
  const currentCandidate = await loadCurrentExactHeadReviewCandidate();
  console.log(
    JSON.stringify(
      {
        service: "scrimed-exact-head-current-candidate",
        status: "CURRENT_HEAD_EVIDENCE_READY_HUMAN_REVIEW_REQUIRED",
        ...currentCandidate,
        releaseAuthorityGranted: false,
        boundary:
          "This deterministic packet describes the clean checked-out candidate for review. It grants no merge, deployment, migration, PHI, clinical, payer, EHR, certification, customer-activation, or external-distribution authority."
      },
      null,
      2
    )
  );
  process.exit(0);
}

const strict = process.argv.includes("--strict");
const evaluation = await evaluateCurrentMergeReadiness({
  requireConsumptionLedger: strict,
  consumeApproval: strict
});
console.log(JSON.stringify(evaluation, null, 2));

if (strict && !evaluation.result.ready) {
  process.exit(1);
}
