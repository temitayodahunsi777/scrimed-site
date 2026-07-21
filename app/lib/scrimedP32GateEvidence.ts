import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";
import {
  buildP32ReleaseGateRegistry,
  createP32AutomatedGateEvidence,
  evaluateP32ApprovalEvidence,
  evaluateP32AutomatedGateEvidence,
  getP32ReleaseGateCatalog,
  type AutomatedGateEvidence,
  type P32ReleaseGateContext
} from "./scrimedP32ReleaseGates";
import type { ApprovalEvidence } from "./scrimed-work/p32Contracts";

export const scrimedP32GateEvidencePacketVersion =
  "scrimed-p32-gate-evidence-v1-2026-07-20";

export const scrimedP32GateEvidenceBoundary =
  "SCRIMED p.32 Gate Evidence binds no-secret technical checks and metadata-only human decisions to one exact candidate. It never stores tokens, PHI, raw review documents, signatures, legal opinions, clinical records, or connector payloads, and it does not grant commit, migration, deployment, external-distribution, certification, clinical-care, or customer go-live authority.";

export type ReleaseCandidateManifestReport = {
  baseHeadSha: string | null;
  candidateDigestSha256: string | null;
  sourceCandidateDigestSha256: string | null;
  dirtyEntryCount: number;
  sourceReviewReady: boolean;
  strictProvenanceEligible: boolean;
};

export type ReleaseCandidateValidationReport = {
  sourceCommitSha: string | null;
  candidateFingerprintSha256: string | null;
  sourceFingerprintSha256: string | null;
  artifactFingerprintSha256: string | null;
  validationEvidenceHashSha256: string | null;
  candidateStable: boolean;
  sourceReviewReady: boolean;
  artifactReviewPassed: boolean;
  automatedValidationPassed: boolean;
  checks: Array<{ id: string; passed: boolean }>;
  warningCodes: string[];
};

export type InvestorDeckReviewReport = {
  artifactFingerprintSha256: string | null;
  automatedReviewPassed: boolean;
  humanReleaseReviewRequired: boolean;
};

export type P32SupplementalGateEvidence = {
  automatedEvidence: AutomatedGateEvidence[];
  approvals: ApprovalEvidence[];
};

export type P32GateEvidencePacketInput = {
  manifest: ReleaseCandidateManifestReport;
  validation: ReleaseCandidateValidationReport;
  investorDeckReview: InvestorDeckReviewReport;
  supplementalEvidence?: Partial<P32SupplementalGateEvidence>;
  evaluatedAt: string;
  evidenceTtlHours?: number;
};

type IntegrityCheck = {
  id: string;
  passed: boolean;
  evidence: string;
};

const sha256Pattern = /^[0-9a-f]{64}$/i;
const gitCommitPattern = /^[0-9a-f]{40}$/i;

function isIsoTimestamp(value: string) {
  return Number.isFinite(Date.parse(value));
}

function isSha256(value: string | null) {
  return typeof value === "string" && sha256Pattern.test(value);
}

function isGitCommitSha(value: string | null) {
  return typeof value === "string" && gitCommitPattern.test(value);
}

function requireValidInput(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`SCRIMED p.32 gate evidence rejected: ${message}`);
}

function addHours(isoTimestamp: string, hours: number) {
  return new Date(Date.parse(isoTimestamp) + hours * 60 * 60 * 1000).toISOString();
}

function makeAutomatedEvidence({
  evidenceId,
  status,
  identityAssurance,
  evidencePointer,
  expectedFingerprints,
  evaluatedAt,
  expiresAt
}: {
  evidenceId: string;
  status: AutomatedGateEvidence["status"];
  identityAssurance: AutomatedGateEvidence["identityAssurance"];
  evidencePointer: string;
  expectedFingerprints: P32ReleaseGateContext["expectedFingerprints"];
  evaluatedAt: string;
  expiresAt: string;
}) {
  return createP32AutomatedGateEvidence({
    evidenceId,
    status,
    sourceCommit: expectedFingerprints.sourceCommit,
    sourceTreeFingerprint: expectedFingerprints.sourceTree,
    artifactFingerprint: expectedFingerprints.artifact,
    validationEvidenceFingerprint: expectedFingerprints.validationEvidence,
    identityAssurance,
    generatedAt: evaluatedAt,
    checkedAt: evaluatedAt,
    expiresAt,
    evidencePointer
  });
}

function assertNoDuplicateEvidenceIds(evidence: AutomatedGateEvidence[]) {
  const evidenceIds = evidence.map((item) => item.evidenceId);
  requireValidInput(
    new Set(evidenceIds).size === evidenceIds.length,
    "automated evidence identifiers must be unique"
  );
}

function assertNoDuplicateApprovalIds(approvals: ApprovalEvidence[]) {
  const approvalIds = approvals.map((item) => item.approvalId);
  requireValidInput(
    new Set(approvalIds).size === approvalIds.length,
    "approval identifiers must be unique"
  );
}

export function buildP32GateEvidencePacket(input: P32GateEvidencePacketInput) {
  requireValidInput(isIsoTimestamp(input.evaluatedAt), "evaluatedAt must be an ISO timestamp");
  const evidenceTtlHours = input.evidenceTtlHours ?? 24;
  requireValidInput(
    Number.isInteger(evidenceTtlHours) && evidenceTtlHours >= 1 && evidenceTtlHours <= 168,
    "technical evidence TTL must be between 1 and 168 hours"
  );
  requireValidInput(isGitCommitSha(input.manifest.baseHeadSha), "manifest must expose the exact 40-character base commit");
  requireValidInput(isSha256(input.manifest.candidateDigestSha256), "manifest candidate fingerprint is missing or malformed");
  requireValidInput(isSha256(input.manifest.sourceCandidateDigestSha256), "manifest source fingerprint is missing or malformed");
  requireValidInput(isGitCommitSha(input.validation.sourceCommitSha), "validation source commit is missing or malformed");
  requireValidInput(isSha256(input.validation.candidateFingerprintSha256), "validation candidate fingerprint is missing or malformed");
  requireValidInput(isSha256(input.validation.sourceFingerprintSha256), "validation source fingerprint is missing or malformed");
  requireValidInput(isSha256(input.validation.artifactFingerprintSha256), "validation artifact fingerprint is missing or malformed");
  requireValidInput(isSha256(input.validation.validationEvidenceHashSha256), "validation evidence fingerprint is missing or malformed");
  requireValidInput(isSha256(input.investorDeckReview.artifactFingerprintSha256), "investor artifact fingerprint is missing or malformed");
  const sourceCommit = input.manifest.baseHeadSha as string;
  const candidateFingerprint = input.manifest.candidateDigestSha256 as string;
  const sourceFingerprint = input.manifest.sourceCandidateDigestSha256 as string;
  const artifactFingerprint = input.validation.artifactFingerprintSha256 as string;
  const validationEvidenceFingerprint = input.validation.validationEvidenceHashSha256 as string;

  const integrityChecks: IntegrityCheck[] = [
    {
      id: "source-commit-alignment",
      passed: input.manifest.baseHeadSha === input.validation.sourceCommitSha,
      evidence: "Manifest and validation are bound to the same full source commit."
    },
    {
      id: "candidate-fingerprint-alignment",
      passed: input.manifest.candidateDigestSha256 === input.validation.candidateFingerprintSha256,
      evidence: "Manifest and validation candidate fingerprints match."
    },
    {
      id: "source-fingerprint-alignment",
      passed: input.manifest.sourceCandidateDigestSha256 === input.validation.sourceFingerprintSha256,
      evidence: "Manifest and validation source fingerprints match."
    },
    {
      id: "artifact-fingerprint-alignment",
      passed: input.validation.artifactFingerprintSha256 === input.investorDeckReview.artifactFingerprintSha256,
      evidence: "Validation and investor artifact review fingerprints match."
    },
    {
      id: "candidate-stability",
      passed: input.validation.candidateStable,
      evidence: "The candidate fingerprint remained unchanged throughout bounded validation."
    },
    {
      id: "automated-validation",
      passed: input.validation.automatedValidationPassed,
      evidence: "All bounded automated candidate checks passed."
    },
    {
      id: "investor-artifact-review",
      passed: input.investorDeckReview.automatedReviewPassed && input.investorDeckReview.humanReleaseReviewRequired,
      evidence: "Automated deck review passed and human release review remains required."
    }
  ];
  const failedIntegrityChecks = integrityChecks.filter((check) => !check.passed);
  requireValidInput(
    failedIntegrityChecks.length === 0,
    `candidate evidence alignment failed: ${failedIntegrityChecks.map((check) => check.id).join(", ")}`
  );

  const expectedFingerprints = {
    sourceCommit,
    sourceTree: sourceFingerprint,
    artifact: artifactFingerprint,
    validationEvidence: validationEvidenceFingerprint
  };
  const expiresAt = addHours(input.evaluatedAt, evidenceTtlHours);
  const nonsecretSuitePassed = input.validation.checks.some(
    (check) => check.id === "nonsecret-suite" && check.passed
  );
  const localAutomatedEvidence = [
    makeAutomatedEvidence({
      evidenceId: "source-and-artifact-manifest",
      status: input.manifest.sourceReviewReady && input.validation.sourceReviewReady ? "passed" : "failed",
      identityAssurance: "local-deterministic-runner",
      evidencePointer: `candidate-manifest:${candidateFingerprint}`,
      expectedFingerprints,
      evaluatedAt: input.evaluatedAt,
      expiresAt
    }),
    makeAutomatedEvidence({
      evidenceId: "candidate-validation",
      status: input.validation.automatedValidationPassed ? "passed" : "failed",
      identityAssurance: "local-deterministic-runner",
      evidencePointer: `candidate-validation:${validationEvidenceFingerprint}`,
      expectedFingerprints,
      evaluatedAt: input.evaluatedAt,
      expiresAt
    }),
    makeAutomatedEvidence({
      evidenceId: "investor-deck-review",
      status: input.investorDeckReview.automatedReviewPassed ? "passed" : "failed",
      identityAssurance: "local-deterministic-runner",
      evidencePointer: `investor-deck-review:${artifactFingerprint}`,
      expectedFingerprints,
      evaluatedAt: input.evaluatedAt,
      expiresAt
    }),
    makeAutomatedEvidence({
      evidenceId: "security-nonsecret-suite",
      status: nonsecretSuitePassed ? "passed" : "failed",
      identityAssurance: "local-deterministic-runner",
      evidencePointer: `security-suite:${validationEvidenceFingerprint}`,
      expectedFingerprints,
      evaluatedAt: input.evaluatedAt,
      expiresAt
    })
  ];
  const supplementalAutomatedEvidence = input.supplementalEvidence?.automatedEvidence ?? [];
  const approvals = input.supplementalEvidence?.approvals ?? [];
  const gateCatalog = getP32ReleaseGateCatalog();
  const allowedAutomatedEvidenceIds = new Set(
    gateCatalog.flatMap((gate) => gate.requiredAutomatedEvidenceIds)
  );
  const gateById = new Map(gateCatalog.map((gate) => [gate.gateId, gate]));
  for (const evidence of supplementalAutomatedEvidence) {
    requireValidInput(
      allowedAutomatedEvidenceIds.has(evidence.evidenceId),
      `supplemental automated evidence ${evidence.evidenceId} is not required by the current gate catalog`
    );
  }
  for (const approval of approvals) {
    const gate = gateById.get(approval.gateId);
    requireValidInput(Boolean(gate), `approval ${approval.approvalId} references an unknown gate`);
    requireValidInput(
      gate?.requiredReviewerRoles.includes(approval.reviewerRole) === true,
      `approval ${approval.approvalId} uses a reviewer role outside the gate contract`
    );
  }
  const automatedEvidence = [...localAutomatedEvidence, ...supplementalAutomatedEvidence];
  assertNoDuplicateEvidenceIds(automatedEvidence);
  assertNoDuplicateApprovalIds(approvals);

  const context: P32ReleaseGateContext = {
    expectedFingerprints,
    worktreeClean: input.manifest.dirtyEntryCount === 0 && input.manifest.strictProvenanceEligible,
    automatedEvidence,
    approvals,
    evaluatedAt: input.evaluatedAt
  };
  for (const evidence of supplementalAutomatedEvidence) {
    const evaluation = evaluateP32AutomatedGateEvidence(evidence, context);
    requireValidInput(
      evaluation.integrityValid && evaluation.exactFingerprintMatch,
      `supplemental automated evidence ${evidence.evidenceId} failed integrity or fingerprint validation`
    );
  }
  for (const approval of approvals) {
    const evaluation = evaluateP32ApprovalEvidence(approval, context);
    requireValidInput(
      evaluation.integrityValid && evaluation.exactFingerprintMatch,
      `approval ${approval.approvalId} failed integrity or fingerprint validation`
    );
  }

  const registry = buildP32ReleaseGateRegistry(context);
  const unresolvedGates = registry.gates
    .filter((gate) => gate.status !== "PASS")
    .map((gate) => ({
      gateId: gate.gateId,
      phase: gate.phase,
      classification: gate.classification,
      status: gate.status,
      ownerRole: gate.ownerRole,
      reason: gate.reason
    }));
  const unresolvedByPhase = {
    candidateReview: unresolvedGates.filter((gate) => gate.phase === "candidate-review").length,
    preDeployment: unresolvedGates.filter((gate) => gate.phase === "pre-deployment").length,
    postDeployment: unresolvedGates.filter((gate) => gate.phase === "post-deployment").length,
    customerGoLive: unresolvedGates.filter((gate) => gate.phase === "customer-go-live").length
  };
  const candidateReviewPacketReady = input.manifest.sourceReviewReady &&
    input.validation.automatedValidationPassed &&
    input.investorDeckReview.automatedReviewPassed &&
    nonsecretSuitePassed;
  const allGateEvidenceSatisfied = registry.gates.every((gate) => gate.status === "PASS");
  const packetWithoutHash = {
    service: "scrimed-p32-gate-evidence",
    packetVersion: scrimedP32GateEvidencePacketVersion,
    status: allGateEvidenceSatisfied
      ? "all-defined-evidence-satisfied-no-release-authority" as const
      : candidateReviewPacketReady
        ? "candidate-review-packet-ready-release-blocked" as const
        : "candidate-evidence-incomplete-release-blocked" as const,
    evaluatedAt: input.evaluatedAt,
    expiresAt,
    expectedFingerprints,
    candidateFingerprint,
    worktree: {
      dirtyEntryCount: input.manifest.dirtyEntryCount,
      clean: input.manifest.dirtyEntryCount === 0,
      strictProvenanceEligible: input.manifest.strictProvenanceEligible
    },
    integrityChecks,
    warningCodes: [...new Set(input.validation.warningCodes)],
    candidateReviewPacketReady,
    immutableProvenanceReady: registry.immutableProvenanceReady,
    allGateEvidenceSatisfied,
    releasePromotionAllowed: false as const,
    aggregateReleaseAuthorityGranted: false as const,
    automatedEvidence,
    approvalCount: approvals.length,
    approvalDecisionHashes: approvals.map((approval) => approval.decisionHash),
    registry,
    unresolvedGates,
    unresolvedByPhase,
    nextActions: [
      ...(context.worktreeClean
        ? []
        : ["Review and commit only the intended candidate through the approved source-control workflow, then regenerate this packet from the clean immutable revision."]),
      ...registry.gates
        .filter((gate) => gate.status !== "PASS" && gate.operatorAction)
        .map((gate) =>
          `${gate.operatorAction!.responsibleRole}: ${gate.operatorAction!.exactAction} ` +
          `Use ${gate.operatorAction!.commandOrForm}; verify with ${gate.operatorAction!.verificationProcedure}`
        )
    ],
    boundary: scrimedP32GateEvidenceBoundary
  };

  return {
    ...packetWithoutHash,
    packetHash: createClinicalEvidenceHash(packetWithoutHash)
  };
}
