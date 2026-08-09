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
  getPr25ExactHeadReviewCandidate,
  getPr25FrozenReviewBaseline
} from "../app/lib/pr25FrozenReviewBaseline.ts";
import {
  computeP32SupplementalEvidencePayloadHash,
  p32EvidenceTrustRegistryVersion,
  p32SupplementalEvidenceAttestationVersion,
  verifyP32SupplementalEvidenceAttestation
} from "./lib/scrimed-p32-evidence-attestation.mjs";

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

export async function buildCurrentMergeReadinessInput(options = {}) {
  const baseline = getPr25FrozenReviewBaseline();
  const candidate = getPr25ExactHeadReviewCandidate();
  const operatingMode = getScrimedOperatingModeSummary().mode;
  const vercel = JSON.parse(await readFile("vercel.json", "utf8"));
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
  const reviewBinding = evaluateExactHeadReviewBinding({
    candidate,
    approval: verifiedDocument.approval,
    verifiedIdentityEvidence: verifiedDocument.verifiedIdentityEvidence,
    evaluatedAt: options.evaluatedAt
  });

  return {
    exactHeadApproval: Boolean(verifiedDocument.approval),
    exactHeadApprovalMatches:
      reviewBinding.approved && reviewBinding.status === "APPROVED_EXACT_HEAD",
    ciPassed:
      baseline.validation.githubActionsPassed === baseline.validation.githubActionsTotal,
    secretScanPassed: baseline.validation.secretScanFindings === 0,
    sbomPassed: baseline.validation.dependencyDelta === 0,
    publicClaimsPassed: baseline.validation.publicClaimsPassed,
    unreviewedMigrationsAdded: !baseline.validation.migrationStaticReviewPassed,
    syntheticOnly: operatingMode.syntheticOnly,
    phiEnabled: operatingMode.allowPHI,
    clinicalExecutionEnabled: operatingMode.liveClinicalExecution,
    ehrWritebackEnabled: operatingMode.productionEHRConnections,
    deviceWritebackEnabled: operatingMode.medicalDeviceConnections,
    customerActivationEnabled: false,
    productionAutoDeployFromMainEnabled:
      vercel?.git?.deploymentEnabled?.main !== false,
    reviewBindingStatus: reviewBinding.status,
    reviewBindingReasonCodes: [
      ...(loaded.loadError ? [loaded.loadError] : []),
      ...(verifiedDocument.verificationError
        ? [verifiedDocument.verificationError]
        : []),
      ...reviewBinding.reasonCodes
    ],
    reviewedCommitSha: reviewBinding.approvedCommitSha
  };
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

  const candidate = getPr25ExactHeadReviewCandidate();
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
    evaluatedAt: "2026-08-09T23:00:00.000Z"
  });
  assert.equal(verifiedInput.exactHeadApproval, true);
  assert.equal(verifiedInput.exactHeadApprovalMatches, true);
  assert.equal(verifiedInput.reviewBindingStatus, "APPROVED_EXACT_HEAD");

  const unknownDispositionBase = {
    ...approvalBase,
    disposition: "UNKNOWN_DISPOSITION"
  };
  const unknownDispositionApproval = {
    ...unknownDispositionBase,
    approvalDigest: createExactHeadApprovalDigest(unknownDispositionBase)
  };
  const unknownDispositionTrust = buildSelfTestTrustContext(
    unknownDispositionApproval
  );
  const invalidInput = await buildCurrentMergeReadinessInput({
    ...unknownDispositionTrust,
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

  console.log(
    "pass merge-readiness verifier self-test (trusted Ed25519 exact-head artifact, forged unsigned rejection, CI, supply chain, claims, migrations, operating mode, and production auto-deploy)"
  );
}

if (process.argv.includes("--self-test")) {
  await runMergeReadinessSelfTest();
  process.exit(0);
}

const input = await buildCurrentMergeReadinessInput();
const result = evaluateMergeReadiness(input);
console.log(JSON.stringify({ input, result }, null, 2));

if (process.argv.includes("--strict") && !result.ready) {
  process.exit(1);
}
