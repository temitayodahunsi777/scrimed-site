import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";
import type { ExactHeadReviewCandidate } from "./exactHeadReviewBinding";

export const pr25FrozenReviewBaselineVersion =
  "scrimed-pr25-frozen-review-baseline-v1-2026-08-09";

const baseline = {
  pullRequest: 25,
  repository: "temitayodahunsi777/scrimed-site",
  headSha: "c15a79c76d59a2f94bb7f999469da8bbc1618d8c",
  sourceTreeGitObject: "6641124cfd01a26394289e19b7e803aed05bf9f0",
  fingerprints: {
    candidate:
      "44cc2b9c90c6296c54374f59a368a815d0904be8177682706f162a476362d5a6",
    source:
      "b365053c547dd358b47c576fd801fdb853fd0779244db1be0572d5cd8dd47678",
    validation:
      "d635cd6a3091b6df1ff46542bd87c5bf51230b7ab3a8d22944aedd218f5e01b1",
    reviewPacket:
      "015ac4ab896537a11eaa3052d11789dc784ca9fd6b56b0305592f14b508f47c6",
    sbom: "7e4897205b57e80797a6319ff661d34bcc6c05892196aeb5eef94c73ed98c51d"
  },
  validation: {
    detachedCleanStagesPassed: 10,
    detachedCleanStagesTotal: 10,
    githubActionsPassed: 6,
    githubActionsTotal: 6,
    secretScanFiles: 1886,
    secretScanFindings: 0,
    sbomComponents: 422,
    dependencyDelta: 0,
    reviewCoverageFiles: 489,
    reviewCoverageTotal: 489,
    reviewLanes: 11,
    reviewBatches: 5,
    publicClaimsPassed: true,
    migrationStaticReviewPassed: true
  },
  preview: {
    provider: "vercel",
    deploymentId: "dpl_Z1VpwKp6G74N318heDAZ7mKvXzb3",
    status: "READY",
    target: null,
    sourceSha: "c15a79c76d59a2f94bb7f999469da8bbc1618d8c",
    productionDeploymentCreated: false
  },
  review: {
    state: "REVIEW_REQUESTED",
    requestedReviewer: "Scrimed-cpu",
    exactHeadApprovalRecorded: false,
    historicalApprovedHead: "406f0b0ffc11e6f00a623e9532d2f6a30e9eb689",
    historicalApprovalAcceptedForCurrentHead: false,
    reason:
      "The recorded approval is bound to an earlier head. A distinct reviewer must disposition the exact frozen head and fingerprints."
  },
  releaseControls: {
    automaticProductionDeploymentFromMain: false,
    previewDeploymentsEnabled: true,
    mergeAuthorized: false,
    productionAuthorized: false,
    migrationAuthorized: false
  },
  retainedBoundaries: [
    "No live PHI or production customer data.",
    "No autonomous diagnosis, treatment, prescribing, triage, or clinical care.",
    "No payer submission, EHR writeback, medical-device activation, or customer go-live.",
    "No merge, migration, production deployment, certification claim, or external investor distribution is authorized by this baseline."
  ],
  capturedAt: "2026-08-09T21:01:09.000Z"
} as const;

export const pr25FrozenReviewBaseline = {
  schemaVersion: pr25FrozenReviewBaselineVersion,
  ...baseline,
  evidenceHash: createClinicalEvidenceHash({
    schemaVersion: pr25FrozenReviewBaselineVersion,
    ...baseline
  })
};

export function getPr25FrozenReviewBaseline() {
  return pr25FrozenReviewBaseline;
}

export function getPr25ExactHeadReviewCandidate(): ExactHeadReviewCandidate {
  const binding = {
    schemaVersion: pr25FrozenReviewBaselineVersion,
    repository: baseline.repository,
    pullRequest: baseline.pullRequest,
    headSha: baseline.headSha
  };
  const authorIdentity = {
    identityProvider: "github" as const,
    identityHash: createClinicalEvidenceHash({
      ...binding,
      identityProvider: "github",
      authorSubject: "temitayodahunsi777"
    })
  };

  return {
    commitSha: baseline.headSha,
    candidateFingerprint: baseline.fingerprints.candidate,
    sourceFingerprint: baseline.fingerprints.source,
    validationFingerprint: baseline.fingerprints.validation,
    reviewPacketFingerprint: baseline.fingerprints.reviewPacket,
    sbomFingerprint: baseline.fingerprints.sbom,
    criticalSurfaces: {
      securityCriticalFiles: createClinicalEvidenceHash({
        ...binding,
        surface: "security-critical-files",
        sourceFingerprint: baseline.fingerprints.source,
        sbomFingerprint: baseline.fingerprints.sbom
      }),
      policyFiles: createClinicalEvidenceHash({
        ...binding,
        surface: "policy-files",
        sourceFingerprint: baseline.fingerprints.source,
        validationFingerprint: baseline.fingerprints.validation
      }),
      migrationSet: createClinicalEvidenceHash({
        ...binding,
        surface: "migration-set",
        validationFingerprint: baseline.fingerprints.validation,
        staticReviewPassed: baseline.validation.migrationStaticReviewPassed
      }),
      publicClaims: createClinicalEvidenceHash({
        ...binding,
        surface: "public-claims",
        validationFingerprint: baseline.fingerprints.validation,
        publicClaimsPassed: baseline.validation.publicClaimsPassed
      }),
      deploymentConfiguration: createClinicalEvidenceHash({
        ...binding,
        surface: "deployment-configuration",
        previewDeploymentId: baseline.preview.deploymentId,
        automaticProductionDeploymentFromMain:
          baseline.releaseControls.automaticProductionDeploymentFromMain
      })
    },
    authorIdentities: [authorIdentity],
    authorIdentityHashes: [authorIdentity.identityHash],
    requiredReviewerRoles: ["Principal engineer", "Release steward"]
  };
}
