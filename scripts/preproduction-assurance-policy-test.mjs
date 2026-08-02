#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  buildAssuranceManifest,
  validateAssuranceManifest
} from "../app/lib/scrimed-work/assuranceManifest.ts";
import { buildControlAttestations } from "../app/lib/scrimed-work/controlAttestations.ts";
import {
  createFounderInterimAcceptance,
  founderInterimAcceptanceAcknowledgment,
  founderProhibitedActivityCatalog,
  validateFounderInterimAcceptance
} from "../app/lib/scrimed-work/founderInterimAcceptance.ts";
import { calculateReviewConfidence } from "../app/lib/scrimed-work/reviewConfidence.ts";
import { evaluateReviewPolicy } from "../app/lib/scrimed-work/reviewPolicyEngine.ts";

const candidate = "a".repeat(64);
const source = "b".repeat(64);
const assurance = "c".repeat(64);
const generatedAt = "2026-08-01T12:00:00.000Z";
const expiresAt = "2026-08-08T12:00:00.000Z";

function context(overrides = {}) {
  return {
    action: "synthetic-demonstration",
    environment: "preview",
    dataClassification: "synthetic",
    intendedUse: "investor-demo",
    candidateFingerprint: candidate,
    assuranceManifestFingerprint: assurance,
    evaluatedAt: generatedAt,
    evidenceReferences: ["preproduction-disclosure", "synthetic-mode-attestation"],
    activeConditions: [],
    qualifiedApprovals: [],
    founderAcceptance: null,
    ...overrides
  };
}

const syntheticDemo = evaluateReviewPolicy(context());
assert.equal(syntheticDemo.decision, "PERMITTED_AUTOMATICALLY");
assert.equal(syntheticDemo.productionAuthorityGranted, false);

const previewNeedsFounder = evaluateReviewPolicy(
  context({
    action: "preview-deployment",
    evidenceReferences: [
      "preproduction-disclosure",
      "synthetic-mode-attestation",
      "preview-smoke-plan"
    ]
  })
);
assert.equal(previewNeedsFounder.decision, "FOUNDER_INTERIM_ACCEPTANCE_REQUIRED");
assert.deepEqual(previewNeedsFounder.requiredReviewerRoles, []);

const founderReference = {
  acceptanceId: "founder-preproduction-001",
  candidateFingerprint: candidate,
  assuranceManifestFingerprint: assurance,
  permittedActivities: ["preview-deployment"],
  prohibitedActivities: [...founderProhibitedActivityCatalog],
  issuedAt: generatedAt,
  expiresAt,
  signatureVerified: true
};
const acceptedPreview = evaluateReviewPolicy(
  context({
    action: "preview-deployment",
    evidenceReferences: [
      "preproduction-disclosure",
      "synthetic-mode-attestation",
      "preview-smoke-plan"
    ],
    founderAcceptance: founderReference
  })
);
assert.equal(acceptedPreview.decision, "PERMITTED_AUTOMATICALLY");
assert.equal(acceptedPreview.founderAcceptanceValid, true);

const disposableMigration = evaluateReviewPolicy(
  context({
    action: "disposable-migration-dry-run",
    environment: "disposable",
    intendedUse: "migration-validation",
    dataClassification: "metadata",
    evidenceReferences: ["disposable-database-proof", "migration-checksums", "recovery-strategy"]
  })
);
assert.equal(disposableMigration.decision, "PERMITTED_AUTOMATICALLY");
assert.deepEqual(disposableMigration.requiredReviewerRoles, []);

const databaseApproval = {
  approvalId: "db-approval-001",
  reviewerRole: "database-owner",
  reviewerIdentity: "synthetic-database-owner",
  candidateFingerprint: candidate,
  assuranceManifestFingerprint: assurance,
  issuedAt: generatedAt,
  expiresAt,
  signatureVerified: true,
  decision: "approved"
};
const productionMigration = evaluateReviewPolicy(
  context({
    action: "production-migration",
    environment: "production",
    intendedUse: "production-activation",
    dataClassification: "metadata",
    evidenceReferences: [
      "migration-dry-run",
      "migration-checksums",
      "rollback-or-forward-recovery",
      "deployment-authorization"
    ],
    qualifiedApprovals: [databaseApproval]
  })
);
assert.equal(productionMigration.decision, "PRODUCTION_ACTIVATION_APPROVAL_REQUIRED");
assert.deepEqual(productionMigration.missingReviewerRoles, ["release-authority"]);

const phiAttempt = evaluateReviewPolicy(
  context({
    action: "phi-processing",
    environment: "production",
    intendedUse: "production-activation",
    dataClassification: "phi",
    evidenceReferences: [
      "purpose-of-use",
      "minimum-necessary-scope",
      "retention-policy",
      "security-data-flow-review"
    ]
  })
);
assert.deepEqual(phiAttempt.missingReviewerRoles, ["privacy-owner", "security-owner"]);
assert.equal(phiAttempt.decision, "PRODUCTION_ACTIVATION_APPROVAL_REQUIRED");

const clinicalAttempt = evaluateReviewPolicy(
  context({
    action: "clinical-execution",
    environment: "production",
    intendedUse: "production-activation",
    dataClassification: "phi",
    evidenceReferences: [
      "clinical-safety-case",
      "intended-use-approval",
      "human-oversight-plan",
      "rollback-plan"
    ],
    activeConditions: ["current-candidate-runtime-disabled"]
  })
);
assert.ok(clinicalAttempt.requiredReviewerRoles.includes("clinical-safety-owner"));
assert.ok(clinicalAttempt.reasonCodes.includes("PROHIBITED_CONDITION:current-candidate-runtime-disabled"));

process.env.SCRIMED_REVIEW_POLICY_BYPASS = "true";
assert.equal(evaluateReviewPolicy(context()).environmentVariableBypassAllowed, false);
delete process.env.SCRIMED_REVIEW_POLICY_BYPASS;

const expiredFounder = evaluateReviewPolicy(
  context({
    action: "preview-deployment",
    evidenceReferences: [
      "preproduction-disclosure",
      "synthetic-mode-attestation",
      "preview-smoke-plan"
    ],
    evaluatedAt: "2026-08-09T00:00:00.000Z",
    founderAcceptance: founderReference
  })
);
assert.equal(expiredFounder.decision, "FOUNDER_INTERIM_ACCEPTANCE_REQUIRED");

const staleCandidateApproval = evaluateReviewPolicy(
  context({
    action: "production-migration",
    environment: "production",
    intendedUse: "production-activation",
    dataClassification: "metadata",
    evidenceReferences: [
      "migration-dry-run",
      "migration-checksums",
      "rollback-or-forward-recovery",
      "deployment-authorization"
    ],
    qualifiedApprovals: [
      { ...databaseApproval, candidateFingerprint: "d".repeat(64) },
      { ...databaseApproval, approvalId: "wrong-role", reviewerRole: "clinical-safety-owner" }
    ]
  })
);
assert.deepEqual(staleCandidateApproval.missingReviewerRoles, ["database-owner", "release-authority"]);

const manifest = buildAssuranceManifest({
  baseCommit: "1".repeat(40),
  candidateCommit: "2".repeat(40),
  candidateMode: "clean-commit",
  candidateFingerprint: candidate,
  sourceFingerprint: source,
  artifactFingerprint: "d".repeat(64),
  validationFingerprint: "e".repeat(64),
  sbomFingerprint: "f".repeat(64),
  publicClaimsFingerprint: "1".repeat(64),
  gateRegistryFingerprint: "2".repeat(64),
  reviewPacketFingerprint: "3".repeat(64),
  migrationReportFingerprint: "4".repeat(64),
  modelRegistryFingerprint: "5".repeat(64),
  operatingModeFingerprint: "6".repeat(64),
  evidence: [
    {
      evidenceId: "candidate-validation",
      fingerprint: "e".repeat(64),
      candidateFingerprint: candidate,
      sourceFingerprint: source,
      status: "passed"
    }
  ],
  buildResult: "passed",
  testSummary: { passed: 153, failed: 0, skipped: 0 },
  secretScanResult: "passed",
  prohibitedCapabilitiesDisabled: true,
  environmentTarget: "preview",
  generatedAt,
  expiresAt,
  toolVersions: { node: "22.test", typescript: "5.7.test" }
});
assert.equal(manifest.preproductionPackagingAllowed, true);
assert.equal(manifest.productionAuthorityGranted, false);
assert.equal(
  validateAssuranceManifest(manifest, {
    candidateFingerprint: candidate,
    sourceFingerprint: source,
    evaluatedAt: generatedAt
  }).valid,
  true
);
assert.throws(() =>
  buildAssuranceManifest({
    ...manifest,
    evidence: [{ ...manifest.evidence[0], sourceFingerprint: "9".repeat(64) }]
  })
);

const controls = buildControlAttestations({
  sourceFingerprint: source,
  timestamp: generatedAt,
  expiresAt,
  observations: [
    {
      controlId: "operating:synthetic-only",
      expectedState: true,
      observedState: true,
      evidence: ["app/lib/operatingMode.ts"],
      testReference: "public-remediation-policy-test"
    },
    {
      controlId: "clinical:execution-disabled",
      expectedState: false,
      observedState: true,
      evidence: ["unsafe-test-fixture"],
      testReference: "preproduction-assurance-policy-test"
    }
  ]
});
assert.equal(controls.passedControlCount, 1);
assert.equal(controls.failedControlCount, 1);
assert.equal(controls.releasePackagingAllowed, false);

const confidence = calculateReviewConfidence({
  testCoverage: 0.95,
  testPassRate: 1,
  criticalPathCoverage: 0.9,
  independentReviewLaneCount: 12,
  unresolvedCriticalFindings: 0,
  sourceEvidenceConsistent: true,
  staleEvidence: false,
  publicClaimsPassed: true,
  secretScanPassed: true,
  sbomPassed: true,
  migrationStatus: "static-ready",
  operatingModeControlsPassed: true,
  authorizationControlsPassed: true,
  reproducible: true,
  worktreeClean: false
});
assert.equal(confidence.permittedReviewTier, "TIER_0_AUTOMATED_ACTIVITY");
assert.equal(confidence.productionAuthorityGranted, false);
assert.ok(confidence.score <= 79);

const founderAcceptance = createFounderInterimAcceptance({
  acceptanceId: "founder-preproduction-verified-001",
  founderIdentity: "synthetic-founder-test-identity",
  candidateFingerprint: candidate,
  assuranceManifestFingerprint: manifest.manifestFingerprint,
  permittedActivities: ["preview-deployment"],
  prohibitedActivities: [...founderProhibitedActivityCatalog],
  acceptanceDate: generatedAt,
  expirationDate: expiresAt,
  scope: "Synthetic-only preview validation",
  residualRisks: ["No production validation"],
  requiredExternalActions: ["Wix copy publication remains operator-controlled"],
  acknowledgmentText: founderInterimAcceptanceAcknowledgment,
  signatureEvidence: {
    method: "detached-signature",
    signerIdentity: "synthetic-founder-test-identity",
    evidenceDigest: "7".repeat(64),
    verified: true
  }
});
assert.equal(
  validateFounderInterimAcceptance(founderAcceptance, {
    candidateFingerprint: candidate,
    assuranceManifestFingerprint: manifest.manifestFingerprint,
    requestedActivity: "preview-deployment",
    evaluatedAt: generatedAt,
    requiredControlsPassed: true,
    changeEvents: []
  }).valid,
  true
);
assert.equal(
  validateFounderInterimAcceptance(founderAcceptance, {
    candidateFingerprint: candidate,
    assuranceManifestFingerprint: manifest.manifestFingerprint,
    requestedActivity: "preview-deployment",
    evaluatedAt: generatedAt,
    requiredControlsPassed: true,
    changeEvents: ["model-change"]
  }).valid,
  false
);
assert.throws(() =>
  createFounderInterimAcceptance({
    ...founderAcceptance,
    acceptanceDate: generatedAt,
    expirationDate: expiresAt,
    signatureEvidence: null
  })
);

console.log("pass SCRIMED preproduction assurance policy tests (four review tiers, exact evidence, founder boundary)");
