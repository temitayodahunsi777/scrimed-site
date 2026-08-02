import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";
import type { ApprovalEvidence, ReleaseGateResult } from "./scrimed-work/p32Contracts";

export const scrimedP32ReleaseGateVersion = "scrimed-p32-release-gates-v2-2026-07-30";

export const scrimedP32ReleaseGateBoundary =
  "SCRIMED p.32 release gates bind technical and human evidence to exact fingerprints. Passing a technical gate does not grant legal, clinical, privacy, regulatory, deployment, production, or customer go-live authority.";

export type AutomatedGateEvidence = {
  evidenceId: string;
  status: "passed" | "failed";
  sourceCommit: string;
  sourceTreeFingerprint: string;
  artifactFingerprint: string;
  validationEvidenceFingerprint: string;
  identityAssurance: "local-deterministic-runner" | "protected-aal2-workspace" | "deployment-target";
  generatedAt: string;
  checkedAt: string;
  expiresAt: string;
  evidencePointer: string;
  evidenceHash: string;
};

export type AutomatedGateEvidenceInput = Omit<AutomatedGateEvidence, "evidenceHash">;

export type P32ReleaseGateContext = {
  expectedFingerprints: {
    sourceCommit: string;
    sourceTree: string;
    artifact: string;
    validationEvidence: string;
    reviewPacket: string;
  };
  worktreeClean: boolean;
  automatedEvidence: AutomatedGateEvidence[];
  approvals: ApprovalEvidence[];
  evaluatedAt: string;
};

type GateDefinition = {
  gateId: string;
  description: string;
  ownerRole: string;
  classification: ReleaseGateResult["classification"];
  phase: ReleaseGateResult["phase"];
  requiredEvidence: string[];
  requiredAutomatedEvidenceIds: string[];
  requiredReviewerRoles: string[];
  cleanWorktreeRequired: boolean;
};

const operatorInstructions: Record<
  string,
  { exactAction: string; commandOrForm: string; verificationProcedure: string }
> = {
  "clean-reviewed-source-commit": {
    exactAction: "Review and commit only attributable candidate files through the approved source-control workflow.",
    commandOrForm: "npm run release:provenance:strict",
    verificationProcedure: "Confirm a clean worktree, exact commit/tree identity, then regenerate the candidate manifest."
  },
  "exact-source-artifact-provenance": {
    exactAction: "Regenerate candidate, artifact, and validation evidence from the unchanged clean commit.",
    commandOrForm: "npm run release:candidate-validate:strict",
    verificationProcedure: "Verify candidate, source, artifact, and validation fingerprints align in the p.32 gate packet."
  },
  "named-reviewer-approval": {
    exactAction: "A distinct named principal engineer must review and disposition the exact candidate.",
    commandOrForm: "/pilot-workspace/access -> Named reviewer approval",
    verificationProcedure: "Validate AAL2 identity, reviewer role, decision integrity, expiry, and exact fingerprints."
  },
  "investor-deck-founder-counsel-finance-approval": {
    exactAction: "Founder, qualified claims counsel, and finance must disposition the exact investor artifact.",
    commandOrForm: "npm run review:investor-deck:strict, then use the protected approval workflow",
    verificationProcedure: "Require all three current role decisions against the exact artifact fingerprint."
  },
  "validation-evidence-integrity": {
    exactAction: "Run bounded validation against an unchanged candidate and retain the resulting evidence hash.",
    commandOrForm: "npm run release:candidate-validate:strict",
    verificationProcedure: "Confirm all checks passed and the candidate remained stable for the entire run."
  },
  "aal2-cli-evidence": {
    exactAction: "An authorized operator must run the protected no-PHI strict smoke with a fresh AAL2 session.",
    commandOrForm: "npm run smoke:aal2:durable-store:strict",
    verificationProcedure: "Validate issuer, audience, subject, AAL claims, role, tenant, freshness, and protected happy path without retaining the token."
  },
  "migration-dry-run-and-approval": {
    exactAction: "Run the exact migration set against a disposable database and obtain database-owner approval.",
    commandOrForm: "npm run release:migration-packet",
    verificationProcedure: "Verify migration fingerprint, forward result, recovery strategy, invariants, locking assessment, and owner decision."
  },
  "intended-use-signoff": {
    exactAction: "Founder, clinical governance, and qualified claims counsel must approve intended and prohibited use.",
    commandOrForm: "/approvals-readiness -> Intended Use Review",
    verificationProcedure: "Validate all required role decisions, conditions, expiry, and exact candidate fingerprints."
  },
  "legal-signoff": {
    exactAction: "Qualified healthcare counsel must review claims, contracts, data use, and release scope.",
    commandOrForm: "/approvals-readiness -> Legal review evidence",
    verificationProcedure: "Validate qualified reviewer identity, scope, conditions, expiry, and exact fingerprints."
  },
  "clinical-signoff": {
    exactAction: "Licensed clinical governance must review intended use, hazards, evidence, abstention, and human oversight.",
    commandOrForm: "/approvals-readiness -> Clinical review evidence",
    verificationProcedure: "Validate reviewer qualifications, scope, conditions, expiry, and exact fingerprints."
  },
  "security-privacy-review": {
    exactAction: "Named security and privacy owners must review the exact architecture and data-flow boundary.",
    commandOrForm: "/approvals-readiness -> Security and privacy review evidence",
    verificationProcedure: "Require both current role decisions plus passing nonsecret evidence against the exact candidate."
  },
  "deployment-authorization": {
    exactAction: "A deployment authority must approve the exact candidate, environment, window, rollback owner, services, and migration decision.",
    commandOrForm: "/pilot-workspace/access -> Deployment authorization",
    verificationProcedure: "Validate candidate/environment scope, authorization expiry, rollback owner, and monitoring plan before exposing any deployment command."
  },
  "post-deployment-smoke-evidence": {
    exactAction: "After an authorized deployment, run target health, policy-denial, tenant-isolation, logging, drift, and rollback checks.",
    commandOrForm: "npm run smoke:public && npm run smoke:deployment-drift-guard",
    verificationProcedure: "Bind target URL, deployed commit/artifact, run identity, results, and timestamps to deployment-target evidence."
  },
  "customer-go-live-authorization": {
    exactAction: "Customer and SCRIMED release authorities must approve the customer-specific scope and operating plan.",
    commandOrForm: "/approvals-readiness -> Customer go-live checklist",
    verificationProcedure: "Verify customer acceptance, intended use, trained operators, agreements, support, rollback, environment evidence, and exact fingerprints."
  }
};

const gateDefinitions: GateDefinition[] = [
  {
    gateId: "clean-reviewed-source-commit",
    description: "Source is reviewed, immutable, and represented by a clean commit and exact tree fingerprint.",
    ownerRole: "release-steward",
    classification: "AUTOMATED",
    phase: "candidate-review",
    requiredEvidence: ["clean worktree", "source commit", "source tree fingerprint"],
    requiredAutomatedEvidenceIds: ["source-and-artifact-manifest"],
    requiredReviewerRoles: [],
    cleanWorktreeRequired: true
  },
  {
    gateId: "exact-source-artifact-provenance",
    description: "Source, tree, artifact, and validation evidence are bound to the same immutable candidate.",
    ownerRole: "release-steward",
    classification: "AUTOMATED",
    phase: "candidate-review",
    requiredEvidence: ["source fingerprint", "artifact fingerprint", "validation fingerprint"],
    requiredAutomatedEvidenceIds: ["source-and-artifact-manifest", "candidate-validation"],
    requiredReviewerRoles: [],
    cleanWorktreeRequired: true
  },
  {
    gateId: "named-reviewer-approval",
    description: "A named principal engineer approved the exact candidate.",
    ownerRole: "principal-engineer",
    classification: "EXTERNAL",
    phase: "candidate-review",
    requiredEvidence: ["exact-fingerprint approval"],
    requiredAutomatedEvidenceIds: ["candidate-validation"],
    requiredReviewerRoles: ["principal-engineer"],
    cleanWorktreeRequired: true
  },
  {
    gateId: "investor-deck-founder-counsel-finance-approval",
    description: "Founder, counsel/claims, and finance approved the exact investor artifact.",
    ownerRole: "founder-ceo",
    classification: "EXTERNAL",
    phase: "candidate-review",
    requiredEvidence: ["deck QA", "founder approval", "counsel/claims approval", "finance approval"],
    requiredAutomatedEvidenceIds: ["investor-deck-review"],
    requiredReviewerRoles: ["founder-ceo", "counsel-claims", "finance"],
    cleanWorktreeRequired: false
  },
  {
    gateId: "validation-evidence-integrity",
    description: "The validation evidence fingerprint matches the unchanged candidate.",
    ownerRole: "release-engineering",
    classification: "AUTOMATED",
    phase: "candidate-review",
    requiredEvidence: ["bounded validation", "validation evidence fingerprint"],
    requiredAutomatedEvidenceIds: ["candidate-validation"],
    requiredReviewerRoles: [],
    cleanWorktreeRequired: true
  },
  {
    gateId: "aal2-cli-evidence",
    description: "Protected CLI evidence was produced by a current authorized AAL2 session without retaining a token.",
    ownerRole: "security-engineering",
    classification: "AUTOMATED",
    phase: "pre-deployment",
    requiredEvidence: ["redacted AAL2 preflight", "protected happy-path result"],
    requiredAutomatedEvidenceIds: ["aal2-cli-evidence"],
    requiredReviewerRoles: [],
    cleanWorktreeRequired: false
  },
  {
    gateId: "migration-dry-run-and-approval",
    description: "Migration dry-run passed and a database owner approved the exact migration set.",
    ownerRole: "database-migration-owner",
    classification: "EXTERNAL",
    phase: "pre-deployment",
    requiredEvidence: ["migration dry-run", "rollback review", "database owner approval"],
    requiredAutomatedEvidenceIds: ["migration-dry-run"],
    requiredReviewerRoles: ["database-migration-owner"],
    cleanWorktreeRequired: true
  },
  {
    gateId: "intended-use-signoff",
    description: "The current intended-use and prohibited-use scope is approved against the candidate.",
    ownerRole: "product-governance",
    classification: "EXTERNAL",
    phase: "candidate-review",
    requiredEvidence: ["intended-use memo", "signed intended-use decision"],
    requiredAutomatedEvidenceIds: [],
    requiredReviewerRoles: ["founder-ceo", "clinical-governance", "counsel-claims"],
    cleanWorktreeRequired: false
  },
  {
    gateId: "legal-signoff",
    description: "Qualified legal review covers the current claims, contracts, data use, and release scope.",
    ownerRole: "qualified-healthcare-counsel",
    classification: "EXTERNAL",
    phase: "candidate-review",
    requiredEvidence: ["legal review decision"],
    requiredAutomatedEvidenceIds: [],
    requiredReviewerRoles: ["qualified-healthcare-counsel"],
    cleanWorktreeRequired: false
  },
  {
    gateId: "clinical-signoff",
    description: "Qualified clinical governance reviewed intended use, hazards, evidence, and human oversight.",
    ownerRole: "clinical-governance",
    classification: "EXTERNAL",
    phase: "candidate-review",
    requiredEvidence: ["clinical safety review decision"],
    requiredAutomatedEvidenceIds: [],
    requiredReviewerRoles: ["clinical-governance"],
    cleanWorktreeRequired: false
  },
  {
    gateId: "security-privacy-review",
    description: "Security and privacy owners reviewed the exact architecture and data-flow scope.",
    ownerRole: "security-privacy",
    classification: "EXTERNAL",
    phase: "candidate-review",
    requiredEvidence: ["security review", "privacy review", "risk disposition"],
    requiredAutomatedEvidenceIds: ["security-nonsecret-suite"],
    requiredReviewerRoles: ["security-officer", "privacy-officer"],
    cleanWorktreeRequired: true
  },
  {
    gateId: "deployment-authorization",
    description: "The approved immutable candidate is authorized for a bounded deployment.",
    ownerRole: "deployment-authority",
    classification: "EXTERNAL",
    phase: "pre-deployment",
    requiredEvidence: ["deployment plan", "rollback plan", "authorization"],
    requiredAutomatedEvidenceIds: ["candidate-validation"],
    requiredReviewerRoles: ["deployment-authority"],
    cleanWorktreeRequired: true
  },
  {
    gateId: "post-deployment-smoke-evidence",
    description: "Post-deployment smoke results are bound to the deployed commit and artifact.",
    ownerRole: "release-engineering",
    classification: "AUTOMATED",
    phase: "post-deployment",
    requiredEvidence: ["deployed commit", "post-deployment smoke"],
    requiredAutomatedEvidenceIds: ["post-deployment-smoke"],
    requiredReviewerRoles: [],
    cleanWorktreeRequired: true
  },
  {
    gateId: "customer-go-live-authorization",
    description: "A named customer authority and SCRIMED release authority approved the exact customer scope.",
    ownerRole: "customer-and-scrimed-release-authority",
    classification: "EXTERNAL",
    phase: "customer-go-live",
    requiredEvidence: ["customer acceptance", "SCRIMED release authorization", "rollback and support readiness"],
    requiredAutomatedEvidenceIds: ["post-deployment-smoke"],
    requiredReviewerRoles: ["customer-authority", "scrimed-release-authority"],
    cleanWorktreeRequired: true
  }
];

const automatedEvidenceIdentityAssurance: Record<
  string,
  AutomatedGateEvidence["identityAssurance"]
> = {
  "source-and-artifact-manifest": "local-deterministic-runner",
  "candidate-validation": "local-deterministic-runner",
  "investor-deck-review": "local-deterministic-runner",
  "security-nonsecret-suite": "local-deterministic-runner",
  "migration-dry-run": "local-deterministic-runner",
  "aal2-cli-evidence": "protected-aal2-workspace",
  "post-deployment-smoke": "deployment-target"
};

function automatedIdentityAssuranceIsValid(evidence: AutomatedGateEvidence) {
  return automatedEvidenceIdentityAssurance[evidence.evidenceId] === evidence.identityAssurance;
}

function approvalIdentityAssuranceIsValid(evidence: ApprovalEvidence) {
  if (evidence.gateId === "named-reviewer-approval") {
    return evidence.identityAssurance === "aal2-protected-workspace";
  }
  return evidence.identityAssurance === "aal2-protected-workspace" ||
    evidence.identityAssurance === "qualified-external-reference";
}

export function getP32ReleaseGateCatalog() {
  return gateDefinitions.map(({ requiredAutomatedEvidenceIds, requiredReviewerRoles, cleanWorktreeRequired, ...definition }) => ({
    ...definition,
    requiredAutomatedEvidenceIds: [...requiredAutomatedEvidenceIds],
    requiredReviewerRoles: [...requiredReviewerRoles],
    cleanWorktreeRequired
  }));
}

function isIsoTimestamp(value: string) {
  return Number.isFinite(Date.parse(value));
}

function isSha256(value: string) {
  return /^[0-9a-f]{64}$/i.test(value);
}

function isGitCommitSha(value: string) {
  return /^[0-9a-f]{40}$/i.test(value);
}

function isSafeEvidencePointer(value: string) {
  return value.length >= 4 &&
    value.length <= 240 &&
    /^[A-Za-z0-9][A-Za-z0-9 ._:/#()%-]*$/.test(value) &&
    !/(?:bearer\s+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|sk-[A-Za-z0-9_-]{12,}|service[_ -]?role|password|secret)/i.test(value);
}

export function computeP32AutomatedEvidenceHash(evidence: AutomatedGateEvidenceInput) {
  return createClinicalEvidenceHash(evidence);
}

export function createP32AutomatedGateEvidence(
  evidence: AutomatedGateEvidenceInput
): AutomatedGateEvidence {
  return {
    ...evidence,
    evidenceHash: computeP32AutomatedEvidenceHash(evidence)
  };
}

export function computeP32ApprovalDecisionHash(
  evidence: Omit<ApprovalEvidence, "decisionHash">
) {
  return createClinicalEvidenceHash(evidence);
}

export function createP32ApprovalEvidence(
  evidence: Omit<ApprovalEvidence, "decisionHash">
): ApprovalEvidence {
  return {
    ...evidence,
    decisionHash: computeP32ApprovalDecisionHash(evidence)
  };
}

function baseFingerprintMatches(
  evidence: Pick<ApprovalEvidence, "sourceCommit" | "sourceTreeFingerprint" | "artifactFingerprint" | "validationEvidenceFingerprint">,
  expected: P32ReleaseGateContext["expectedFingerprints"]
) {
  return evidence.sourceCommit === expected.sourceCommit &&
    evidence.sourceTreeFingerprint === expected.sourceTree &&
    evidence.artifactFingerprint === expected.artifact &&
    evidence.validationEvidenceFingerprint === expected.validationEvidence;
}

export function evaluateP32AutomatedGateEvidence(
  evidence: AutomatedGateEvidence,
  context: Pick<P32ReleaseGateContext, "expectedFingerprints" | "evaluatedAt">
) {
  const { evidenceHash, ...hashPayload } = evidence;
  const exactFingerprintMatch = baseFingerprintMatches(evidence, context.expectedFingerprints);
  const structurallyValid = isGitCommitSha(evidence.sourceCommit) &&
    isSha256(evidence.sourceTreeFingerprint) &&
    isSha256(evidence.artifactFingerprint) &&
    isSha256(evidence.validationEvidenceFingerprint) &&
    isIsoTimestamp(evidence.generatedAt) &&
    isIsoTimestamp(evidence.checkedAt) &&
    isIsoTimestamp(evidence.expiresAt) &&
    isSafeEvidencePointer(evidence.evidencePointer) &&
    isSha256(evidenceHash) &&
    automatedIdentityAssuranceIsValid(evidence);
  const integrityValid = structurallyValid && evidenceHash === computeP32AutomatedEvidenceHash(hashPayload);
  const evaluatedAt = Date.parse(context.evaluatedAt);
  const generatedAt = Date.parse(evidence.generatedAt);
  const checkedAt = Date.parse(evidence.checkedAt);
  const expiresAt = Date.parse(evidence.expiresAt);
  const current = structurallyValid &&
    generatedAt <= evaluatedAt &&
    checkedAt >= generatedAt &&
    checkedAt <= evaluatedAt &&
    expiresAt > evaluatedAt &&
    expiresAt > checkedAt;

  return {
    valid: evidence.status === "passed" && exactFingerprintMatch && integrityValid && current,
    exactFingerprintMatch,
    integrityValid,
    structurallyValid,
    identityAssuranceValid: automatedIdentityAssuranceIsValid(evidence),
    current,
    stale: !exactFingerprintMatch || !current
  };
}

export function evaluateP32ApprovalEvidence(
  evidence: ApprovalEvidence,
  context: Pick<P32ReleaseGateContext, "expectedFingerprints" | "evaluatedAt">
) {
  const { decisionHash, ...hashPayload } = evidence;
  const exactFingerprintMatch =
    baseFingerprintMatches(evidence, context.expectedFingerprints) &&
    (evidence.gateId !== "named-reviewer-approval" ||
      (isSha256(context.expectedFingerprints.reviewPacket) &&
        evidence.reviewPacketFingerprint === context.expectedFingerprints.reviewPacket));
  const reviewPacketBindingValid =
    evidence.gateId === "named-reviewer-approval"
      ? typeof evidence.reviewPacketFingerprint === "string" &&
        isSha256(evidence.reviewPacketFingerprint)
      : evidence.reviewPacketFingerprint === null ||
        evidence.reviewPacketFingerprint === undefined;
  const structurallyValid = isGitCommitSha(evidence.sourceCommit) &&
    isSha256(evidence.sourceTreeFingerprint) &&
    isSha256(evidence.artifactFingerprint) &&
    isSha256(evidence.validationEvidenceFingerprint) &&
    reviewPacketBindingValid &&
    isSha256(evidence.reviewerId) &&
    isSha256(evidence.tenantScopeHash) &&
    isSha256(decisionHash) &&
    isSafeEvidencePointer(evidence.evidencePointer) &&
    isIsoTimestamp(evidence.approvedAt) &&
    isIsoTimestamp(evidence.expiresAt) &&
    approvalIdentityAssuranceIsValid(evidence) &&
    evidence.releaseAuthorityGranted === false;
  const integrityValid = structurallyValid && decisionHash === computeP32ApprovalDecisionHash(hashPayload);
  const evaluatedAt = Date.parse(context.evaluatedAt);
  const approvedAt = Date.parse(evidence.approvedAt);
  const expiresAt = Date.parse(evidence.expiresAt);
  const current = structurallyValid &&
    approvedAt <= evaluatedAt &&
    expiresAt > evaluatedAt &&
    expiresAt > approvedAt &&
    expiresAt - approvedAt <= 366 * 24 * 60 * 60 * 1000;
  return {
    valid: evidence.decision === "approved" && exactFingerprintMatch && integrityValid && current,
    exactFingerprintMatch,
    integrityValid,
    structurallyValid,
    identityAssuranceValid: approvalIdentityAssuranceIsValid(evidence),
    current,
    stale: !exactFingerprintMatch || !current
  };
}

function evaluateGate(definition: GateDefinition, context: P32ReleaseGateContext): ReleaseGateResult {
  const automatedEvidence = definition.requiredAutomatedEvidenceIds.map((evidenceId) =>
    context.automatedEvidence.find((evidence) => evidence.evidenceId === evidenceId)
  );
  const approvals = context.approvals.filter((approval) => approval.gateId === definition.gateId);
  const approvalEvaluations = approvals.map((approval) => evaluateP32ApprovalEvidence(approval, context));
  const automatedEvaluations = automatedEvidence.map((evidence) =>
    evidence ? evaluateP32AutomatedGateEvidence(evidence, context) : null
  );
  const expiredApproval = approvalEvaluations.some(
    (evaluation) => evaluation.structurallyValid && !evaluation.current
  );
  const staleApproval = approvalEvaluations.some((evaluation) => !evaluation.exactFingerprintMatch);
  const invalidApproval = approvalEvaluations.some(
    (evaluation) => !evaluation.structurallyValid || !evaluation.integrityValid
  );
  const missingAutomated = automatedEvidence.filter(
    (evidence) => !evidence || !evaluateP32AutomatedGateEvidence(evidence, context).valid
  );
  const expiredAutomated = automatedEvaluations.some(
    (evaluation) => evaluation?.structurallyValid && !evaluation.current
  );
  const invalidAutomated = automatedEvaluations.some(
    (evaluation) => evaluation && (!evaluation.structurallyValid || !evaluation.integrityValid)
  );
  const missingReviewerRoles = definition.requiredReviewerRoles.filter((role) =>
    !approvals.some((approval) => approval.reviewerRole === role && evaluateP32ApprovalEvidence(approval, context).valid)
  );
  const reasons: string[] = [];
  if (definition.cleanWorktreeRequired && !context.worktreeClean) reasons.push("working tree is not clean and immutable provenance is unavailable");
  if (missingAutomated.length) reasons.push("required automated evidence is missing, failed, expired, or bound to a different fingerprint");
  if (invalidAutomated) reasons.push("automated evidence integrity validation failed");
  if (staleApproval) reasons.push("approval evidence is bound to a stale fingerprint");
  if (invalidApproval) reasons.push("approval evidence structure or decision integrity validation failed");
  if (expiredApproval || expiredAutomated) reasons.push("provided evidence is expired");
  if (missingReviewerRoles.length) reasons.push(`required reviewer approvals are missing: ${missingReviewerRoles.join(", ")}`);
  const failedEvidence = expiredApproval || expiredAutomated || staleApproval || invalidApproval || invalidAutomated ||
    approvals.some((approval) => approval.decision === "rejected") ||
    automatedEvidence.some((evidence) => evidence?.status === "failed");
  const status: ReleaseGateResult["status"] = failedEvidence
    ? "FAIL"
    : reasons.length
      ? definition.classification === "EXTERNAL" && !approvals.length && !missingAutomated.length &&
          (!definition.cleanWorktreeRequired || context.worktreeClean)
        ? "OPERATOR_REQUIRED"
        : "BLOCKED"
      : "PASS";
  const evidencePointer = [...automatedEvidence.filter(Boolean).map((evidence) => evidence!.evidencePointer), ...approvals.map((approval) => approval.evidencePointer)][0] ?? null;
  const reviewerId = approvals.find((approval) => evaluateP32ApprovalEvidence(approval, context).valid)?.reviewerId ?? null;
  const expiresAtValues = [
    ...automatedEvidence.filter(Boolean).map((evidence) => evidence!.expiresAt),
    ...approvals.map((approval) => approval.expiresAt)
  ].filter(isIsoTimestamp).sort();
  const operatorInstruction = operatorInstructions[definition.gateId];
  const actionExpiresAt = expiresAtValues[0] ?? new Date(
    Date.parse(context.evaluatedAt) + 24 * 60 * 60 * 1000
  ).toISOString();
  const withoutHash = {
    gateId: definition.gateId,
    description: definition.description,
    ownerRole: definition.ownerRole,
    classification: definition.classification,
    phase: definition.phase,
    requiredEvidence: definition.requiredEvidence,
    expectedFingerprints: context.expectedFingerprints,
    status,
    reason: reasons.join("; ") || "All defined evidence checks passed for this gate; this does not grant aggregate release authority.",
    expiresAt: expiresAtValues[0] ?? null,
    reviewerId,
    evaluatedAt: context.evaluatedAt,
    evidencePointer,
    operatorAction: status === "PASS"
      ? null
      : {
          responsibleRole: definition.ownerRole,
          exactAction: operatorInstruction.exactAction,
          candidateFingerprints: context.expectedFingerprints,
          commandOrForm: operatorInstruction.commandOrForm,
          expiresAt: actionExpiresAt,
          consequenceOfRejection: `${definition.gateId} remains fail-closed and no later release phase may rely on it.`,
          verificationProcedure: operatorInstruction.verificationProcedure
        },
    releaseAuthorityGranted: false as const
  };
  return { ...withoutHash, auditHash: createClinicalEvidenceHash(withoutHash) };
}

export function buildP32ReleaseGateRegistry(context: P32ReleaseGateContext) {
  if (!isIsoTimestamp(context.evaluatedAt)) throw new Error("Release gate evaluatedAt must be an ISO timestamp");
  const gates = gateDefinitions.map((definition) => evaluateGate(definition, context));
  const hardBlockedBoundaries = [
    "live PHI",
    "autonomous clinical care, diagnosis, or treatment",
    "trial auto-enrollment or local randomization",
    "payer submission",
    "EHR writeback",
    "production migration",
    "certification or regulatory claims",
    "customer go-live"
  ];
  return {
    registryVersion: scrimedP32ReleaseGateVersion,
    evaluatedAt: context.evaluatedAt,
    status: gates.every((gate) => gate.status === "PASS") ? "all-defined-gates-evidenced-no-release-authority" as const : "release-blocked" as const,
    worktreeClean: context.worktreeClean,
    gates,
    summary: {
      total: gates.length,
      passed: gates.filter((gate) => gate.status === "PASS").length,
      blocked: gates.filter((gate) => gate.status === "BLOCKED").length,
      failed: gates.filter((gate) => gate.status === "FAIL").length,
      operatorRequired: gates.filter((gate) => gate.status === "OPERATOR_REQUIRED").length,
      notApplicable: gates.filter((gate) => gate.status === "NOT_APPLICABLE").length,
      expiredEvidence: gates.filter((gate) => gate.reason.includes("provided evidence is expired")).length
    },
    immutableProvenanceReady: context.worktreeClean && gates
      .filter((gate) => ["clean-reviewed-source-commit", "exact-source-artifact-provenance", "validation-evidence-integrity"].includes(gate.gateId))
      .every((gate) => gate.status === "PASS"),
    aggregateReleaseAuthorityGranted: false as const,
    hardBlockedBoundaries,
    boundary: scrimedP32ReleaseGateBoundary,
    auditHash: createClinicalEvidenceHash({
      registryVersion: scrimedP32ReleaseGateVersion,
      evaluatedAt: context.evaluatedAt,
      worktreeClean: context.worktreeClean,
      gateHashes: gates.map((gate) => gate.auditHash),
      hardBlockedBoundaries
    })
  };
}
