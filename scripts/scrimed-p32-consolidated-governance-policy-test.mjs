#!/usr/bin/env node

import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import {
  createCapabilityManifest,
  createExecutionGrant,
  createInMemoryReplayProtectionStore
} from "../app/lib/scrimed-work/governedRuntime.ts";
import {
  buildAgentRiskProfile,
  buildContextCoverageManifest,
  buildCorrectableClinicalOutput,
  buildEvidenceSynthesisRecord,
  buildGovernedSkillRunbook,
  buildModelChangeSet,
  buildWorkloadPlacementDecision,
  createAgentExecutionReceipt,
  createTaskScopedToolContract,
  evaluateClinicalResponse,
  evaluateDeidentificationRelease,
  recordCorrectableClinicalReview
} from "../app/lib/scrimed-work/p32GovernanceRecords.ts";
import { evaluateP32ApprovedAction } from "../app/lib/scrimed-work/p32ApprovedActions.ts";
import {
  createP32TechnicalGateEvidence,
  evaluateP32TechnicalGates,
  scrimedP32AutomatedTechnicalGateIds,
  scrimedP32ExternalGateIds
} from "../app/lib/scrimed-work/p32TechnicalGates.ts";

const issuedAt = "2026-07-29T12:00:00.000Z";
const evaluatedAt = "2026-07-29T12:15:00.000Z";
const expiresAt = "2026-07-29T13:00:00.000Z";
const evidenceExpiresAt = "2026-07-30T12:00:00.000Z";
const hash = (label) => createHash("sha256").update(label).digest("hex");

function buildToolContract(overrides = {}) {
  return createTaskScopedToolContract({
    contractId: "contract-alpha",
    version: "1.0.0",
    tenantId: "tenant-alpha",
    actorId: "actor-alpha",
    workloadId: "workload-alpha",
    intendedPurpose: "prepare synthetic evidence-grounded workflow output",
    riskTier: "moderate",
    permittedResources: ["synthetic-context"],
    permittedFields: ["source_id", "evidence_status", "review_state"],
    rowFilters: ["tenant_id=tenant-alpha"],
    permittedActions: [
      "read-synthetic-context",
      "prepare-clinical-draft",
      "record-synthetic-metadata"
    ],
    permittedDestinations: ["internal-synthetic-store"],
    declaredDataClasses: ["synthetic-no-phi", "metadata-only"],
    minimumNecessaryJustification:
      "Only synthetic source, evidence, and review metadata are needed.",
    projectedInputSchema: {
      schemaId: "synthetic-input-v1",
      fields: ["source_id", "evidence_status"],
      additionalProperties: false
    },
    projectedOutputSchema: {
      schemaId: "synthetic-output-v1",
      fields: ["review_state"],
      additionalProperties: false
    },
    egressPolicy: {
      defaultDecision: "deny",
      allowedDestinations: ["internal-synthetic-store"]
    },
    budgets: {
      maximumInputTokens: 4_000,
      maximumOutputTokens: 1_000,
      maximumCostUsd: 1,
      maximumDurationMs: 30_000,
      maximumRetries: 2,
      maximumConcurrency: 2
    },
    issuedAt,
    expiresAt,
    revocationState: "active",
    revokedAt: null,
    policyDigest: hash("tool-policy-alpha"),
    ...overrides
  });
}

const toolContract = buildToolContract();

// 1. Wildcard schemas and action scopes are rejected rather than expanded.
assert.throws(
  () =>
    buildToolContract({
      contractId: "contract-wildcard",
      permittedFields: ["*"]
    }),
  /Wildcard or unbounded tool scopes/
);
assert.throws(
  () =>
    buildToolContract({
      contractId: "contract-open-schema",
      projectedInputSchema: {
        schemaId: "synthetic-input-open-v1",
        fields: [],
        additionalProperties: false
      }
    }),
  /explicit resource, field, row, action, and schema scopes/
);

const contextCoverage = buildContextCoverageManifest({
  manifestId: "context-alpha",
  tenantId: "tenant-alpha",
  snapshotAt: evaluatedAt,
  effectiveAt: issuedAt,
  includedSourceIds: ["source-alpha"],
  excludedSourceIds: [],
  missingSourceIds: [],
  staleSourceIds: [],
  inaccessibleSourceIds: [],
  tenantPermissionFingerprint: hash("tenant-permission-alpha"),
  sourcePermissionFingerprint: hash("source-permission-alpha"),
  sourceSpans: [
    {
      sourceFingerprint: hash("source-alpha"),
      sourceId: "source-alpha",
      spanReference: "section-1",
      provenanceReference: "synthetic-fixture:source-alpha",
      effectiveAt: issuedAt
    }
  ],
  clinicalSpecialty: "general-synthetic-evaluation",
  intendedUseProfile: "decision-support-draft-only",
  retrievalVersion: "retrieval-v1",
  rerankerVersion: "reranker-v1",
  generatorVersion: "generator-v1",
  verifierVersion: "verifier-v1",
  contradictionStatus: "none",
  freshnessStatus: "current",
  clinicianModelSourceParity: "matched"
});
assert.equal(contextCoverage.decision, "ALLOW");

// 2. Missing, stale, inaccessible, or asymmetric context cannot silently pass.
const staleCoverage = buildContextCoverageManifest({
  ...contextCoverage,
  manifestId: "context-stale",
  staleSourceIds: ["source-alpha"],
  freshnessStatus: "stale",
  decision: undefined,
  reasonCodes: undefined,
  humanReviewRequired: undefined,
  manifestHash: undefined
});
assert.equal(staleCoverage.decision, "REQUIRE_HUMAN");
assert.equal(
  staleCoverage.reasonCodes.includes("CONTEXT_FRESHNESS_INSUFFICIENT"),
  true
);
const failedParityCoverage = buildContextCoverageManifest({
  ...contextCoverage,
  manifestId: "context-parity-failed",
  clinicianModelSourceParity: "failed",
  decision: undefined,
  reasonCodes: undefined,
  humanReviewRequired: undefined,
  manifestHash: undefined
});
assert.equal(failedParityCoverage.decision, "BLOCK");

const evidenceSynthesis = buildEvidenceSynthesisRecord({
  recordId: "evidence-alpha",
  tenantId: "tenant-alpha",
  contextManifestHash: contextCoverage.manifestHash,
  claims: [
    {
      claimId: "claim-fact-alpha",
      classification: "FACT",
      statementDigest: hash("synthetic factual statement"),
      sourceFingerprints: [hash("source-alpha")],
      quotedSpanReferences: ["source-alpha:section-1"],
      jurisdiction: "synthetic-test",
      effectiveAt: issuedAt,
      expiresAt,
      supportingEvidenceIds: ["source-alpha"],
      contradictoryEvidenceIds: [],
      evidenceGrade: "synthetic-fixture-only",
      applicabilityLimits: ["not-clinical-evidence"],
      status: "supported",
      accountableReviewerIdentityHash: null,
      modelConfidenceIsProofOfCorrectness: false
    },
    {
      claimId: "claim-hypothesis-alpha",
      classification: "HYPOTHESIS",
      statementDigest: hash("synthetic hypothesis"),
      sourceFingerprints: [hash("source-alpha")],
      quotedSpanReferences: ["source-alpha:section-1"],
      jurisdiction: "synthetic-test",
      effectiveAt: issuedAt,
      expiresAt,
      supportingEvidenceIds: ["source-alpha"],
      contradictoryEvidenceIds: [],
      evidenceGrade: "hypothesis-only",
      applicabilityLimits: ["requires-independent-review"],
      status: "supported",
      accountableReviewerIdentityHash: null,
      modelConfidenceIsProofOfCorrectness: false
    }
  ],
  createdAt: evaluatedAt
});
assert.equal(evidenceSynthesis.overallDecision, "ALLOW");
assert.deepEqual(
  evidenceSynthesis.claims.map((claim) => claim.classification).sort(),
  ["FACT", "HYPOTHESIS"]
);
assert.throws(
  () =>
    buildEvidenceSynthesisRecord({
      recordId: "evidence-fact-without-source",
      tenantId: "tenant-alpha",
      contextManifestHash: contextCoverage.manifestHash,
      claims: [
        {
          ...evidenceSynthesis.claims[0],
          claimId: "claim-invalid",
          sourceFingerprints: [],
          quotedSpanReferences: []
        }
      ],
      createdAt: evaluatedAt
    }),
  /FACT claims require source fingerprints/
);

const disputedEvidence = buildEvidenceSynthesisRecord({
  recordId: "evidence-disputed",
  tenantId: "tenant-alpha",
  contextManifestHash: contextCoverage.manifestHash,
  claims: [
    {
      ...evidenceSynthesis.claims[0],
      claimId: "claim-disputed",
      contradictoryEvidenceIds: ["source-beta"],
      status: "disputed",
      accountableReviewerIdentityHash: null
    }
  ],
  createdAt: evaluatedAt
});
assert.equal(disputedEvidence.overallDecision, "REQUIRE_HUMAN");
assert.equal(disputedEvidence.contradictoryEvidencePreserved, true);

const riskProfile = buildAgentRiskProfile({
  profileId: "risk-alpha",
  tenantId: "tenant-alpha",
  agentId: "agent-alpha",
  assessedByActorId: "risk-reviewer-alpha",
  dataSensitivity: "low",
  autonomy: "draft",
  clinicalCriticality: "moderate",
  reversibility: "reversible",
  blastRadius: "low",
  externalSideEffects: false,
  multiAgentInvolvement: false,
  assessedAt: evaluatedAt
});
assert.equal(riskProfile.selfLoweringAllowed, false);
assert.equal(riskProfile.selfApprovalAllowed, false);

function actionRequest(overrides = {}) {
  return {
    actionId: "action-alpha",
    actionClass: "DRAFT",
    channel: "chat",
    action: "prepare-clinical-draft",
    tenantId: "tenant-alpha",
    actorId: "actor-alpha",
    proposingAgentId: "agent-alpha",
    toolContract,
    riskProfile,
    requestedResource: "synthetic-context",
    requestedFields: ["source_id", "evidence_status"],
    requestedRowFilter: "tenant_id=tenant-alpha",
    requestedDestination: null,
    contextCoverage,
    evidenceSynthesis,
    correctabilitySupported: true,
    approvalChain: [],
    evaluatedAt,
    ...overrides
  };
}

// 3. Minimum-necessary field, row, resource, and destination scope is enforced.
const fieldEscape = evaluateP32ApprovedAction(
  actionRequest({ requestedFields: ["patient_name"] })
);
assert.equal(fieldEscape.decision, "BLOCK");
assert.equal(
  fieldEscape.reasonCodes.includes("FIELD_SCOPE_EXCEEDS_MINIMUM_NECESSARY"),
  true
);
const crossTenantAction = evaluateP32ApprovedAction(
  actionRequest({ tenantId: "tenant-beta" })
);
assert.equal(crossTenantAction.decision, "BLOCK");
assert.equal(
  crossTenantAction.reasonCodes.includes("TOOL_CONTRACT_TENANT_MISMATCH"),
  true
);

// 4. Voice has exactly the same authority ceiling as text.
const textDecision = evaluateP32ApprovedAction(actionRequest({ channel: "chat" }));
const voiceDecision = evaluateP32ApprovedAction(
  actionRequest({ actionId: "action-voice", channel: "voice" })
);
assert.equal(textDecision.decision, "ALLOW");
assert.equal(voiceDecision.decision, textDecision.decision);
assert.deepEqual(voiceDecision.reasonCodes, textDecision.reasonCodes);

// 5. Self-approval, circular approval, and self-assessed risk block.
const circularDecision = evaluateP32ApprovedAction(
  actionRequest({
    actionId: "action-circular",
    actionClass: "REQUEST_APPROVAL",
    approvalChain: [
      {
        approverId: "agent-alpha",
        approverType: "agent",
        approvalReference: "agent-approval-alpha"
      }
    ]
  })
);
assert.equal(circularDecision.decision, "BLOCK");
assert.equal(
  circularDecision.reasonCodes.includes("AGENT_SELF_APPROVAL_PROHIBITED"),
  true
);
const selfAssessedRisk = buildAgentRiskProfile({
  ...riskProfile,
  profileId: "risk-self-assessed",
  assessedByActorId: "agent-alpha",
  calculatedRiskTier: undefined,
  requiredControlTier: undefined,
  independentAssessmentRequired: undefined,
  selfLoweringAllowed: undefined,
  selfApprovalAllowed: undefined,
  profileHash: undefined
});
const selfAssessedDecision = evaluateP32ApprovedAction(
  actionRequest({
    actionId: "action-self-risk",
    riskProfile: selfAssessedRisk
  })
);
assert.equal(selfAssessedDecision.decision, "BLOCK");
assert.equal(
  selfAssessedDecision.reasonCodes.includes("INDEPENDENT_RISK_ASSESSMENT_REQUIRED"),
  true
);

// 6. Diagnosis, prescribing, payer submission, EHR writeback, and deployment remain hard blocks.
for (const action of [
  "autonomous-diagnosis-final",
  "prescribe-medication",
  "payer-submission",
  "ehr-writeback",
  "production-deployment"
]) {
  const decision = evaluateP32ApprovedAction(
    actionRequest({
      actionId: `action-prohibited-${action}`,
      actionClass: "EXECUTE",
      action
    })
  );
  assert.equal(decision.decision, "BLOCK", action);
  assert.equal(
    decision.reasonCodes.includes("ACTION_PROHIBITED_BY_SCRIMED_BOUNDARY"),
    true,
    action
  );
}

const candidateFingerprint = hash("candidate-alpha");
const sourceFingerprint = hash("source-tree-alpha");
const manifest = createCapabilityManifest({
  manifestId: "manifest-alpha",
  actor: {
    actorId: "actor-alpha",
    actorType: "agent",
    role: "synthetic-operator",
    authenticated: true
  },
  tenantId: "tenant-alpha",
  purpose: "record synthetic metadata with independent approval",
  permittedTools: ["metadata-store"],
  permittedResources: ["synthetic-context"],
  permittedDataClasses: ["synthetic-no-phi"],
  maximumRisk: "moderate",
  limits: {
    requestsPerMinute: 10,
    maximumTokens: 1_000,
    maximumDurationMs: 30_000,
    maximumSpendUsd: 1,
    maximumToolCalls: 1
  },
  prohibitedActions: ["ehr-writeback", "payer-submission"],
  issuedAt,
  expiresAt
});
const grant = createExecutionGrant({
  grantId: "grant-alpha",
  issuer: "independent-human-approver",
  audience: "scrimed-governed-runtime",
  subject: "actor-alpha",
  tenantId: "tenant-alpha",
  purpose: "record synthetic metadata with independent approval",
  scope: {
    tools: ["metadata-store"],
    resources: ["synthetic-context"],
    dataClasses: ["synthetic-no-phi"],
    action: "record-synthetic-metadata",
    stage: "execute"
  },
  candidateFingerprint,
  sourceFingerprint,
  environment: "test",
  issuedAt,
  expiresAt,
  nonce: "nonce-alpha",
  requiredApprovalReferences: ["human-approval-alpha"]
});
const replayStore = createInMemoryReplayProtectionStore();
const runtimeRequest = {
  stage: "execute",
  action: "record-synthetic-metadata",
  toolId: "metadata-store",
  toolCategory: "reversible-write",
  resource: "synthetic-context",
  dataClassification: "synthetic-no-phi",
  riskLevel: "moderate",
  tenantId: "tenant-alpha",
  actorId: "actor-alpha",
  environment: "test",
  candidateFingerprint,
  sourceFingerprint,
  idempotencyKey: "idempotency-alpha",
  budgetUsage: {
    requestsThisMinute: 1,
    tokens: 100,
    durationMs: 100,
    spendUsd: 0.01,
    toolCalls: 1
  },
  evidencePointers: ["synthetic-evidence-alpha"],
  humanApprovalReferences: ["human-approval-alpha"]
};

// 7. Every mutation requires a candidate-bound, replay-protected execution grant.
const noGrantDecision = evaluateP32ApprovedAction(
  actionRequest({
    actionId: "action-execute-no-grant",
    actionClass: "EXECUTE",
    action: "record-synthetic-metadata",
    approvalChain: [
      {
        approverId: "human-reviewer-alpha",
        approverType: "human",
        approvalReference: "human-approval-alpha"
      }
    ]
  })
);
assert.equal(noGrantDecision.decision, "BLOCK");
assert.equal(
  noGrantDecision.reasonCodes.includes("GOVERNED_RUNTIME_DECISION_REQUIRED"),
  true
);
const executeDecision = evaluateP32ApprovedAction(
  actionRequest({
    actionId: "action-execute-valid",
    actionClass: "EXECUTE",
    action: "record-synthetic-metadata",
    approvalChain: [
      {
        approverId: "human-reviewer-alpha",
        approverType: "human",
        approvalReference: "human-approval-alpha"
      }
    ],
    runtime: {
      manifest,
      request: runtimeRequest,
      grant,
      replayStore
    }
  })
);
assert.equal(executeDecision.decision, "ALLOW");
assert.equal(executeDecision.mutationAuthorized, true);
const replayDecision = evaluateP32ApprovedAction(
  actionRequest({
    actionId: "action-execute-replay",
    actionClass: "EXECUTE",
    action: "record-synthetic-metadata",
    approvalChain: [
      {
        approverId: "human-reviewer-alpha",
        approverType: "human",
        approvalReference: "human-approval-alpha"
      }
    ],
    runtime: {
      manifest,
      request: runtimeRequest,
      grant,
      replayStore
    }
  })
);
assert.equal(replayDecision.decision, "BLOCK");
assert.equal(replayDecision.reasonCodes.includes("GRANT_REPLAY_DETECTED"), true);

// 8. High aggregate quality cannot override hard or worst-cell safety failures.
const safeEvaluationInput = {
  evaluationId: "evaluation-alpha",
  responseDigest: hash("synthetic response"),
  rubricVersion: "clinical-rubric-v1",
  scores: {
    medicalAccuracy: 0.99,
    evidenceFidelity: 0.99,
    urgencyAndTriageBehavior: 0.99,
    patientSafety: 0.99,
    clarityAndEmpathy: 0.99,
    appropriateEscalation: 0.99,
    sourceCoverage: 0.99
  },
  unsupportedClaimCount: 0,
  correctionBurden: 0,
  subgroupResults: [
    {
      subgroupId: "synthetic-subgroup-a",
      sampleSize: 100,
      passed: true,
      severeErrorCount: 0
    }
  ],
  worstCellResults: [
    {
      cellId: "synthetic-cell-a",
      material: true,
      passed: true,
      sampleSize: 100,
      minimumSampleSize: 20
    }
  ],
  hardSafetyFailures: [],
  evaluatorIdentityHashes: [hash("evaluator-alpha"), hash("evaluator-beta")],
  llmJudgeUsed: true,
  qualifiedHumanEvaluatorCount: 2,
  interRaterAgreement: 0.9,
  minimumInterRaterAgreement: 0.75,
  calibrationEvidenceReferences: ["calibration-alpha"],
  evaluatedAt
};
const hardFailureEvaluation = evaluateClinicalResponse({
  ...safeEvaluationInput,
  evaluationId: "evaluation-hard-failure",
  hardSafetyFailures: ["unsupported-emergency-instruction"]
});
assert.equal(hardFailureEvaluation.aggregateScore > 0.98, true);
assert.equal(hardFailureEvaluation.decision, "BLOCK");
assert.equal(hardFailureEvaluation.promotionEligible, false);
const worstCellEvaluation = evaluateClinicalResponse({
  ...safeEvaluationInput,
  evaluationId: "evaluation-worst-cell",
  worstCellResults: [
    {
      cellId: "synthetic-critical-cell",
      material: true,
      passed: false,
      sampleSize: 50,
      minimumSampleSize: 20
    }
  ]
});
assert.equal(worstCellEvaluation.decision, "BLOCK");
const llmOnlyEvaluation = evaluateClinicalResponse({
  ...safeEvaluationInput,
  evaluationId: "evaluation-llm-only",
  qualifiedHumanEvaluatorCount: 0,
  interRaterAgreement: null,
  calibrationEvidenceReferences: []
});
assert.equal(llmOnlyEvaluation.decision, "REQUIRE_HUMAN");
assert.equal(
  llmOnlyEvaluation.reasonCodes.includes("LLM_JUDGE_CANNOT_SOLELY_AUTHORIZE"),
  true
);

// 9. De-identification cannot sign or declare its own expert determination.
const deidentificationInput = {
  releaseId: "deid-alpha",
  tenantId: "tenant-alpha",
  datasetFingerprint: hash("synthetic-dataset"),
  transformationFingerprint: hash("synthetic-transform"),
  directIdentifiersRemoved: ["synthetic_name"],
  proposedQuasiIdentifiers: ["synthetic_age_band"],
  measuredRisk: {
    kAnonymity: null,
    lDiversity: null,
    tCloseness: null,
    smallCellCount: 0,
    linkageRiskAssessment: "Synthetic fixture; no external release assessment."
  },
  policyThresholdReference: "privacy-policy-pending-expert-threshold",
  intendedPopulation: "synthetic test population",
  threatModel: "synthetic local test with no external release",
  transformations: [{ field: "synthetic_name", method: "removal" }],
  utilityLoss: 0.1,
  intendedUseLimitations: ["local synthetic evaluation only"],
  requestedReleaseBasis: "expert-determination",
  expertDeterminationSignature: null,
  evaluatedAt
};
const blockedDeidentification =
  evaluateDeidentificationRelease(deidentificationInput);
assert.equal(
  blockedDeidentification.status,
  "blocked_external_expert_verification"
);
assert.equal(
  blockedDeidentification.deidentifiedByExpertDeterminationDeclared,
  false
);
const externallyVerifiedDeidentification = evaluateDeidentificationRelease({
  ...deidentificationInput,
  releaseId: "deid-external-verified",
  expertDeterminationSignature: {
    expertIdentityHash: hash("qualified-external-expert"),
    qualificationEvidenceReference: "external-review:qualification-alpha",
    signedAt: evaluatedAt,
    signatureDigest: hash("external-expert-signature"),
    verificationStatus: "verified-by-trusted-external-verifier"
  }
});
assert.equal(
  externallyVerifiedDeidentification.status,
  "approved_for_declared_purpose"
);

// 10. Correctability preserves the original and quarantines corrections.
const correctableOutput = buildCorrectableClinicalOutput({
  outputId: "output-alpha",
  tenantId: "tenant-alpha",
  generatedByAgentId: "agent-alpha",
  originalOutputDigest: hash("original synthetic output"),
  contextManifestHash: contextCoverage.manifestHash,
  evidenceRecordHash: evidenceSynthesis.recordHash,
  modelVersion: "synthetic-model-v1",
  toolVersions: ["retrieval-v1"],
  sourceFingerprints: [hash("source-alpha")],
  createdAt: evaluatedAt
});
assert.deepEqual(correctableOutput.availableActions, [
  "accept",
  "edit",
  "reject",
  "reroute",
  "escalate"
]);
assert.throws(
  () =>
    recordCorrectableClinicalReview(correctableOutput, {
      action: "accept",
      reviewerIdentityHash: hash("agent-alpha"),
      reviewerActorId: "agent-alpha",
      reasonCode: "self-approval-attempt",
      correctionDigest: null,
      reviewedAt: evaluatedAt
    }),
  /cannot review or approve their own/
);
const editedOutput = recordCorrectableClinicalReview(correctableOutput, {
  action: "edit",
  reviewerIdentityHash: hash("human-reviewer-alpha"),
  reviewerActorId: "human-reviewer-alpha",
  reasonCode: "synthetic-correction",
  correctionDigest: hash("corrected synthetic output"),
  reviewedAt: evaluatedAt
});
assert.equal(
  editedOutput.originalOutputDigest,
  correctableOutput.originalOutputDigest
);
assert.equal(editedOutput.originalPreserved, true);
assert.equal(
  editedOutput.correctionLearningState,
  "quarantined-review-required"
);
assert.equal(editedOutput.productionSelfTrainingAllowed, false);

// 11. Execution receipts are digest-only and redact secret/identifier patterns.
const receipt = createAgentExecutionReceipt({
  receiptId: "receipt-alpha",
  tenantId: "tenant-alpha",
  intentDigest: hash("intent"),
  jobManifestHash: hash("job-manifest"),
  humanIdentityHash: hash("human"),
  agentIdentityHash: hash("agent"),
  delegatedAuthorityHash: hash("authority"),
  modelVersion: "synthetic-model-v1",
  promptVersion: "prompt-v1",
  toolVersions: ["tool-v1", "Bearer example.token.value"],
  schemaVersions: ["schema-v1"],
  artifactFingerprints: [hash("artifact")],
  policyVersion: "policy-v1",
  sourceFingerprints: [hash("source")],
  redactedArgumentDigest: hash("arguments"),
  approvalReferences: ["approval-alpha"],
  overrideReferences: [],
  retries: 0,
  costUsd: 0.01,
  latencyMs: 50,
  resultDigest: hash("result"),
  finalDisposition: "verified",
  causalTraceId: "trace-alpha",
  createdAt: evaluatedAt,
  previousReceiptHash: null
});
assert.equal(receipt.containsRawPhi, false);
assert.equal(receipt.containsSecrets, false);
assert.equal(JSON.stringify(receipt).includes("example.token.value"), false);

// 12. Skills and model changes cannot self-admit or self-promote.
assert.throws(
  () =>
    buildGovernedSkillRunbook({
      runbookId: "runbook-self-owned",
      version: "1.0.0",
      skillId: "skill-alpha",
      ownerIdentityHash: hash("same-identity"),
      skillAgentIdentityHash: hash("same-identity"),
      intendedJob: "synthetic review",
      permittedTools: ["metadata-read"],
      permittedResources: ["synthetic-context"],
      permittedDataClasses: ["synthetic-no-phi"],
      permittedDestinations: [],
      limits: toolContract.budgets,
      requiredCompetenceEvidence: ["competence-alpha"],
      requiredEvidence: ["evidence-alpha"],
      signatureStatus: "verified",
      issuedAt,
      expiresAt,
      revocationState: "active",
      dryRunEvidenceReference: "dry-run-alpha",
      rollbackPlan: "Disable the skill and restore the prior manifest."
    }),
  /independent ownership/
);
const unsignedSkill = buildGovernedSkillRunbook({
  runbookId: "runbook-unsigned",
  version: "1.0.0",
  skillId: "skill-alpha",
  ownerIdentityHash: hash("skill-owner"),
  skillAgentIdentityHash: hash("skill-agent"),
  intendedJob: "synthetic review",
  permittedTools: ["metadata-read"],
  permittedResources: ["synthetic-context"],
  permittedDataClasses: ["synthetic-no-phi"],
  permittedDestinations: [],
  limits: toolContract.budgets,
  requiredCompetenceEvidence: ["competence-alpha"],
  requiredEvidence: ["evidence-alpha"],
  signatureStatus: "unsigned",
  issuedAt,
  expiresAt,
  revocationState: "active",
  dryRunEvidenceReference: "dry-run-alpha",
  rollbackPlan: "Disable the skill and restore the prior manifest."
});
assert.equal(unsignedSkill.admitted, false);
const modelChange = buildModelChangeSet({
  changeSetId: "model-change-alpha",
  tenantId: "tenant-alpha",
  fromModelArtifactHash: hash("model-v1"),
  toModelArtifactHash: hash("model-v2"),
  affectedTaskProfiles: ["synthetic-drafting"],
  evaluationEvidenceReferences: ["evaluation-alpha"],
  shadowRunEvidenceReference: "shadow-alpha",
  canaryEvidenceReference: "canary-alpha",
  rollbackTargetHash: hash("model-v1"),
  requestedByIdentityHash: hash("same-model-owner"),
  approvedByIdentityHash: hash("same-model-owner"),
  createdAt: evaluatedAt
});
assert.equal(modelChange.status, "review_required");
assert.equal(
  modelChange.reasonCodes.includes("MODEL_SELF_APPROVAL_PROHIBITED"),
  true
);
assert.equal(modelChange.automaticPromotionAllowed, false);
assert.equal(modelChange.liveClinicalActivationAllowed, false);

// 13. PHI/residency placement fails closed.
const phiPlacement = buildWorkloadPlacementDecision({
  decisionId: "placement-phi-blocked",
  tenantId: "tenant-alpha",
  dataClassification: "phi-blocked",
  requiredResidency: "configured-region",
  selectedPlacement: "external-provider",
  selectedProviderId: "provider-alpha",
  phiEligible: false,
  residenceVerified: false,
  baaVerified: false,
  evaluatedAt
});
assert.equal(phiPlacement.decision, "BLOCK");
assert.equal(phiPlacement.externalProcessingAllowed, false);

// 14. The technical gate registry accepts current automated evidence but never self-approves external gates.
const automatedEvidence = scrimedP32AutomatedTechnicalGateIds.map(
  (gateId, index) =>
    createP32TechnicalGateEvidence({
      evidenceId: `technical-evidence-${index}`,
      gateId,
      status: "passed",
      candidateFingerprint,
      sourceFingerprint,
      evidencePointer: `local-policy-test:${gateId}`,
      evaluatorIdentityHash: hash(`technical-evaluator-${index}`),
      evaluatorRole: "local-deterministic-test-runner",
      checkedAt: evaluatedAt,
      expiresAt: evidenceExpiresAt
    })
);
const safeDevelopmentReport = evaluateP32TechnicalGates({
  profile: "development",
  candidateFingerprint,
  sourceFingerprint,
  evaluatedAt,
  evidence: automatedEvidence,
  safetyPosture: {
    syntheticOnly: true,
    deidentifiedFixturesOnly: true,
    readOnly: true,
    liveProviderCallsEnabled: false,
    productionMutationsEnabled: false
  }
});
assert.equal(safeDevelopmentReport.developmentSafeModeAllowed, true);
assert.equal(safeDevelopmentReport.productionReleaseAllowed, false);
assert.equal(
  safeDevelopmentReport.counts.PENDING_HUMAN,
  scrimedP32ExternalGateIds.length
);
const productionReport = evaluateP32TechnicalGates({
  ...safeDevelopmentReport,
  profile: "production-release",
  evidence: automatedEvidence
});
assert.equal(productionReport.productionReleaseAllowed, false);
assert.equal(
  productionReport.results
    .filter((result) => result.classification === "EXTERNAL")
    .every((result) => result.status === "PENDING_HUMAN"),
  true
);
const unsafeDevelopmentReport = evaluateP32TechnicalGates({
  profile: "development",
  candidateFingerprint,
  sourceFingerprint,
  evaluatedAt,
  evidence: automatedEvidence,
  safetyPosture: {
    syntheticOnly: true,
    deidentifiedFixturesOnly: true,
    readOnly: true,
    liveProviderCallsEnabled: true,
    productionMutationsEnabled: false
  }
});
assert.equal(unsafeDevelopmentReport.developmentSafeModeAllowed, false);
const tamperedEvidence = [
  { ...automatedEvidence[0], evidencePointer: "tampered-pointer" },
  ...automatedEvidence.slice(1)
];
const tamperedReport = evaluateP32TechnicalGates({
  profile: "development",
  candidateFingerprint,
  sourceFingerprint,
  evaluatedAt,
  evidence: tamperedEvidence,
  safetyPosture: {
    syntheticOnly: true,
    deidentifiedFixturesOnly: true,
    readOnly: true,
    liveProviderCallsEnabled: false,
    productionMutationsEnabled: false
  }
});
assert.equal(tamperedReport.counts.FAIL, 1);
assert.equal(tamperedReport.developmentSafeModeAllowed, false);

console.log(
  `pass SCRIMED p.32 consolidated governance: ${scrimedP32AutomatedTechnicalGateIds.length} automated gates evidenced, ${scrimedP32ExternalGateIds.length} external gates remain human-controlled`
);
