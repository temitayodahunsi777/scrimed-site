#!/usr/bin/env node

import assert from "node:assert/strict";

import { createClinicalEvidenceHash } from "../app/lib/clinicalEvidenceControls.ts";
import {
  buildAgentJobManifest,
  buildHumanOversightPlan,
  buildReviewerCapacityBudget,
  createDelegationEnvelope,
  p32ApprovedActionRegistry
} from "../app/lib/scrimed-work/p32AgentGovernance.ts";
import {
  buildAIArtifactManifest,
  buildArtifactAttestation,
  buildRollbackPlan,
  evaluateArtifactAdmission
} from "../app/lib/scrimed-work/p32ArtifactAdmission.ts";
import {
  buildDecisionProvenanceRecord,
  buildEvidenceLedger,
  evaluateDeidentificationRiskAssessment
} from "../app/lib/scrimed-work/p32GovernanceRecords.ts";
import {
  buildMigrationRunbook,
  buildReconciliationReport,
  buildVersionedInteroperabilityMapping,
  evaluateApplicationLifecycle,
  evaluateIntegrationChangeSet,
  verifyInteroperabilityRoundTrip
} from "../app/lib/scrimed-work/p32InteroperabilityControls.ts";
import {
  buildAIValueCase,
  buildBoardOutcomeSnapshot,
  buildClinicalLaunchCell,
  buildCommunicationDeliveryPolicy,
  buildEngagementObjective,
  buildMarketSignal,
  createPatientConsentGrant,
  evaluateCommunicationDelivery
} from "../app/lib/scrimed-work/p32HumanGovernance.ts";
import { getScrimedWorkFeatureFlags } from "../app/lib/scrimed-work/featureFlags.ts";

const at = "2026-07-30T12:00:00.000Z";
const expires = "2026-07-30T13:00:00.000Z";
const hash = (value) => createClinicalEvidenceHash(value);

assert.deepEqual(
  p32ApprovedActionRegistry.map((entry) => entry.actionClass),
  ["READ", "DRAFT", "RECOMMEND", "REQUEST_APPROVAL", "EXECUTE", "PROHIBITED"]
);
assert.equal(
  p32ApprovedActionRegistry.every((entry) => entry.externalEffectAllowed === false),
  true
);

const availableCapacity = buildReviewerCapacityBudget({
  budgetId: "review-budget-alpha",
  tenantId: "tenant-alpha",
  reviewerRole: "qualified-clinical-reviewer",
  maximumConcurrentReviews: 4,
  maximumReviewsPerHour: 8,
  maximumReviewsPerDay: 30,
  assignedConcurrentReviews: 1,
  completedReviewsThisHour: 2,
  completedReviewsToday: 4,
  oldestPendingReviewAgeMinutes: 10,
  maximumPendingReviewAgeMinutes: 60,
  evaluatedAt: at
});
assert.equal(availableCapacity.state, "available");
assert.equal(availableCapacity.automaticPauseRequired, false);

const exceededCapacity = buildReviewerCapacityBudget({
  ...availableCapacity,
  assignedConcurrentReviews: 4,
  state: undefined,
  automaticPauseRequired: undefined,
  budgetHash: undefined
});
assert.equal(exceededCapacity.state, "paused-capacity-exceeded");
assert.equal(exceededCapacity.automaticPauseRequired, true);

const readyOversight = buildHumanOversightPlan(
  {
    planId: "oversight-plan-alpha",
    tenantId: "tenant-alpha",
    workflowId: "workflow-alpha",
    requiredReviewerRole: "qualified-clinical-reviewer",
    namedReviewerIdentityHash: hash("reviewer-alpha"),
    competenceEvidenceReferences: ["competency-alpha"],
    requiredEvidenceReferences: ["evidence-alpha"],
    reviewSlaMinutes: 30,
    capacityBudgetHash: availableCapacity.budgetHash,
    escalationRole: "clinical-safety-officer",
    abstentionPath: "pause-and-escalate",
    alertFatigueControls: ["group-duplicates", "cooldown"],
    rubberStampDetectionRules: ["minimum-review-duration", "decision-variance"],
    evaluatedAt: at
  },
  availableCapacity
);
assert.equal(readyOversight.decision, "ALLOW");

const pausedOversight = buildHumanOversightPlan(
  {
    ...readyOversight,
    planId: "oversight-plan-paused",
    capacityBudgetHash: exceededCapacity.budgetHash,
    decision: undefined,
    reasonCodes: undefined,
    separationOfDutiesRequired: undefined,
    planHash: undefined
  },
  exceededCapacity
);
assert.equal(pausedOversight.decision, "BLOCK");
assert.equal(
  pausedOversight.reasonCodes.includes("REVIEWER_CAPACITY_EXCEEDED_WORK_PAUSED"),
  true
);

const delegation = createDelegationEnvelope({
  delegationId: "delegation-alpha",
  tenantId: "tenant-alpha",
  issuerIdentityHash: hash("issuer-alpha"),
  recipientIdentityHash: hash("recipient-alpha"),
  purpose: "synthetic evidence preparation",
  permittedTools: ["evidence.read"],
  permittedResources: ["synthetic-evidence"],
  permittedDataClasses: ["synthetic-no-phi"],
  maximumRisk: "moderate",
  parentDelegationHash: null,
  delegationChainIdentityHashes: [],
  issuedAt: at,
  expiresAt: expires
});
assert.equal(delegation.valid, true);

const circularDelegation = createDelegationEnvelope({
  ...delegation,
  delegationId: "delegation-circular",
  issuerIdentityHash: hash("same-agent"),
  recipientIdentityHash: hash("same-agent"),
  valid: undefined,
  selfApprovalAllowed: undefined,
  circularDelegationDetected: undefined,
  reasonCodes: undefined,
  delegationHash: undefined
});
assert.equal(circularDelegation.valid, false);

const job = buildAgentJobManifest(
  {
    jobId: "job-alpha",
    tenantId: "tenant-alpha",
    actorId: "operator-alpha",
    agentId: "agent-alpha",
    purpose: "synthetic evidence preparation",
    actionClass: "RECOMMEND",
    requestedActions: ["prepare-reviewable-draft"],
    permittedResources: ["synthetic-evidence"],
    dataClassifications: ["synthetic-no-phi"],
    toolContractHash: hash("tool-contract"),
    riskProfileHash: hash("risk-profile"),
    delegationHash: delegation.delegationHash,
    oversightPlanHash: readyOversight.planHash,
    idempotencyKey: "job-alpha-idempotency",
    limits: {
      maximumDurationMs: 30_000,
      maximumTokens: 4_000,
      maximumCostUsd: 1,
      maximumRetries: 2,
      maximumConcurrency: 2,
      maximumToolCalls: 5
    },
    issuedAt: at,
    expiresAt: expires,
    emergencyStopState: "clear"
  },
  { delegation, oversight: readyOversight }
);
assert.equal(job.decision, "ALLOW");

const stoppedJob = buildAgentJobManifest({
  ...job,
  jobId: "job-stopped",
  emergencyStopState: "active",
  decision: undefined,
  reasonCodes: undefined,
  manifestHash: undefined
});
assert.equal(stoppedJob.decision, "BLOCK");

const manifest = buildAIArtifactManifest({
  artifactId: "synthetic-model-alpha",
  artifactType: "model",
  version: "1.0.0",
  artifactDigest: hash("artifact"),
  parentArtifactDigests: [],
  licenseIdentifier: "test-only-license",
  licenseEvidenceReference: "license-review-alpha",
  intendedUse: ["synthetic evaluation"],
  prohibitedUse: ["clinical production"],
  sbomDigest: hash("sbom"),
  modelBomDigest: hash("model-bom"),
  dataBomDigest: hash("data-bom"),
  provenanceReferences: ["synthetic-build-alpha"],
  vulnerabilityScanDigest: hash("vulnerability-scan"),
  reproducibilityEvidenceDigest: hash("reproducibility"),
  sourceAvailability: "source-available",
  revocationState: "active",
  createdAt: at
});
const attestation = buildArtifactAttestation({
  attestationId: "attestation-alpha",
  artifactManifestHash: manifest.manifestHash,
  attestorIdentityHash: hash("attestor-alpha"),
  attestorRole: "model-governance-reviewer",
  subjectAgentIdentityHash: hash("builder-agent-alpha"),
  statementDigest: hash("attestation-statement"),
  signatureDigest: hash("test-signature"),
  signatureVerification: "verified-test-key",
  issuedAt: at,
  expiresAt: expires
});
const rollback = buildRollbackPlan({
  rollbackPlanId: "rollback-alpha",
  candidateManifestHash: manifest.manifestHash,
  lastAdmittedManifestHash: hash("last-admitted-manifest"),
  atomicSwitchReference: "registry-pointer-alpha",
  maximumRecoveryTimeMs: 60_000,
  stateRestorationSteps: ["switch registry pointer"],
  verificationChecks: ["re-run synthetic conformance"],
  testedAt: at,
  testEvidenceDigest: hash("rollback-test")
});
const admitted = evaluateArtifactAdmission({
  decisionId: "admission-alpha",
  manifest,
  attestation,
  rollbackPlan: rollback,
  requestedEnvironment: "local-test",
  evaluationEvidenceDigests: [hash("evaluation-alpha")],
  evaluatedAt: at
});
assert.equal(admitted.decision, "ALLOW");
assert.equal(admitted.silentSubstitutionAllowed, false);
assert.equal(admitted.productionActivationAllowed, false);

const unsignedAttestation = buildArtifactAttestation({
  ...attestation,
  attestationId: "attestation-unverified",
  signatureDigest: null,
  signatureVerification: "unverified",
  independent: undefined,
  attestationHash: undefined
});
const blockedArtifact = evaluateArtifactAdmission({
  decisionId: "admission-blocked",
  manifest,
  attestation: unsignedAttestation,
  rollbackPlan: rollback,
  requestedEnvironment: "local-test",
  evaluationEvidenceDigests: [hash("evaluation-alpha")],
  evaluatedAt: at
});
assert.equal(blockedArtifact.decision, "BLOCK");
assert.equal(
  blockedArtifact.reasonCodes.includes("ARTIFACT_SIGNATURE_UNVERIFIED"),
  true
);

const ledger = buildEvidenceLedger({
  ledgerId: "evidence-ledger-alpha",
  tenantId: "tenant-alpha",
  contextManifestHash: hash("context-manifest"),
  evidenceRecordHashes: [hash("evidence-record")],
  sourceFingerprints: [hash("source-alpha")],
  claimIds: ["claim-alpha"],
  previousLedgerHash: null,
  createdAt: at
});
assert.equal(ledger.rawPhiStored, false);

const provenance = buildDecisionProvenanceRecord({
  recordId: "decision-provenance-alpha",
  tenantId: "tenant-alpha",
  workflowId: "workflow-alpha",
  outputId: "output-alpha",
  originalOutputDigest: hash("original-output"),
  contextManifestHash: hash("context-manifest"),
  evidenceLedgerHash: ledger.ledgerHash,
  modelArtifactHash: manifest.manifestHash,
  modelConfigurationHash: hash("model-config"),
  promptVersion: "prompt-v1",
  toolVersions: ["retrieval-v1"],
  policyVersion: "policy-v1",
  decision: "escalated",
  reviewerIdentityHash: hash("reviewer-alpha"),
  reviewerRole: "qualified-clinical-reviewer",
  reviewerCompetencyEvidence: ["competency-alpha"],
  correctionDigest: null,
  reasonCode: "missing-evidence",
  downstreamConsumerIds: ["review-queue"],
  downstreamActionDigests: [hash("downstream-action")],
  supersedesRecordHash: null,
  occurredAt: at
});
assert.equal(provenance.originalPreserved, true);
assert.equal(provenance.productionSelfTrainingAllowed, false);

const deidentification = evaluateDeidentificationRiskAssessment({
  assessmentId: "deid-risk-alpha",
  tenantId: "tenant-alpha",
  datasetFingerprint: hash("synthetic-dataset"),
  rowCount: 100,
  proposedQuasiIdentifiers: [
    {
      field: "synthetic-age-band",
      distinctValueCount: 5,
      minimumEquivalenceClassSize: 10
    }
  ],
  sensitiveAttributeDiversity: [
    {
      field: "synthetic-condition-class",
      minimumDistinctValuesPerEquivalenceClass: 2
    }
  ],
  populationDefinition: "synthetic cohort only",
  threatModel: "test-only linkage simulation",
  releaseContext: "local policy test",
  transformations: [{ field: "synthetic-age", method: "generalization" }],
  beforeTransformation: {
    kAnonymity: 1,
    lDiversity: 1,
    uniquenessRate: 0.4
  },
  afterTransformation: {
    kAnonymity: 10,
    lDiversity: 2,
    uniquenessRate: 0.05
  },
  utilityLoss: 0.1,
  testOnly: true,
  expertDeterminationStatus: "external-expert-required",
  evaluatedAt: at
});
assert.equal(deidentification.decision, "BLOCK");
assert.equal(deidentification.legalSafetyDeclared, false);

const mapping = buildVersionedInteroperabilityMapping({
  mappingId: "fhir-r4-mapping-alpha",
  standardSlug: "hl7-fhir",
  sourceVersion: "FHIR R4",
  targetVersion: "FHIR R4",
  profileIds: ["synthetic-profile-alpha"],
  fieldMappings: [
    {
      sourcePath: "Observation.valueQuantity",
      targetPath: "Observation.valueQuantity",
      transformationVersion: "identity-v1"
    }
  ],
  featureFlag: null
});
const sourceEnvelope = {
  sourceId: "synthetic-source-alpha",
  sourceVersion: "FHIR R4",
  sourceFingerprint: hash("fhir-source"),
  knownFields: { resourceType: "Observation" },
  unknownFields: { testExtensionField: "preserved" },
  extensions: { "synthetic-extension": { value: "preserved" } },
  provenance: [
    {
      sourcePath: "Observation.valueQuantity",
      sourceTimestamp: at,
      transformationVersion: "identity-v1"
    }
  ]
};
const roundTrip = verifyInteroperabilityRoundTrip({
  mapping,
  source: sourceEnvelope,
  normalized: structuredClone(sourceEnvelope)
});
assert.equal(roundTrip.lossless, true);

const migrationRunbook = buildMigrationRunbook({
  runbookId: "migration-runbook-alpha",
  migrationFingerprint: hash("migration"),
  priorSchemaFingerprint: hash("prior-schema"),
  forwardSteps: ["apply to disposable database"],
  recoveryStrategy: "snapshot-restore",
  recoverySteps: ["restore disposable snapshot"],
  reconciliationChecks: ["record count", "unknown field preservation"],
  tenantIsolationChecks: ["RLS policy test"]
});
const reconciliation = buildReconciliationReport({
  reportId: "reconciliation-alpha",
  integrationChangeSetHash: hash("proposed-change-set"),
  sourceRecordCount: 2,
  targetRecordCount: 2,
  unknownFieldLossCount: 0,
  provenanceMismatchCount: 0,
  duplicateCount: 0,
  tenantIsolationPassed: true,
  invariantsPassed: true
});
assert.equal(reconciliation.decision, "ALLOW");

const readOnlyChange = evaluateIntegrationChangeSet({
  changeSetId: "integration-read-alpha",
  tenantId: "tenant-alpha",
  mapping,
  requestedAccessMode: "READ_ONLY",
  sourceSystemId: "synthetic-source",
  targetSystemId: "synthetic-preview",
  syntheticFixtureDigests: [hash("fixture-alpha")],
  migrationRunbook,
  reconciliationReport: reconciliation,
  browserAutomationRequested: false,
  browserControlProtocolsRequested: [],
  externalApprovals: []
});
assert.equal(readOnlyChange.decision, "ALLOW");
assert.equal(readOnlyChange.productionReachable, false);

const structuredWrite = evaluateIntegrationChangeSet({
  ...readOnlyChange,
  changeSetId: "integration-write-alpha",
  mapping,
  requestedAccessMode: "STRUCTURED_WRITE",
  migrationRunbook,
  reconciliationReport: reconciliation,
  browserAutomationRequested: false,
  browserControlProtocolsRequested: [],
  syntheticFixtureDigests: [hash("fixture-alpha")],
  externalApprovals: [],
  mappingHash: undefined,
  migrationRunbookHash: undefined,
  reconciliationReportHash: undefined,
  decision: undefined,
  effectiveAccessMode: undefined,
  productionReachable: undefined,
  reasonCodes: undefined,
  changeSetHash: undefined
});
assert.equal(structuredWrite.decision, "BLOCK");
assert.equal(structuredWrite.effectiveAccessMode, "DRAFT");

const browserBypass = evaluateIntegrationChangeSet({
  ...readOnlyChange,
  changeSetId: "integration-browser-alpha",
  mapping,
  migrationRunbook,
  reconciliationReport: reconciliation,
  browserAutomationRequested: true,
  browserControlProtocolsRequested: ["CDP"],
  syntheticFixtureDigests: [hash("fixture-alpha")],
  externalApprovals: [],
  mappingHash: undefined,
  migrationRunbookHash: undefined,
  reconciliationReportHash: undefined,
  decision: undefined,
  effectiveAccessMode: undefined,
  productionReachable: undefined,
  reasonCodes: undefined,
  changeSetHash: undefined
});
assert.equal(browserBypass.decision, "BLOCK");

const retirement = evaluateApplicationLifecycle({
  assessmentId: "app-lifecycle-alpha",
  applicationId: "legacy-app-alpha",
  disposition: "retire",
  exportEvidenceDigest: null,
  retentionEvidenceDigest: null,
  recoveryEvidenceDigest: null,
  rollbackEvidenceDigest: null,
  replacementValidationDigest: null
});
assert.equal(retirement.decision, "BLOCK");
assert.equal(retirement.retirementAuthorized, false);

const consent = createPatientConsentGrant({
  grantId: "patient-consent-alpha",
  tenantId: "tenant-alpha",
  subjectReferenceHash: hash("synthetic-subject"),
  connectorId: "communication-preview",
  purpose: "care-coordination",
  permittedSourceIds: ["synthetic-source-alpha"],
  permittedOperations: ["read"],
  issuedAt: at,
  expiresAt: expires
});
const engagement = buildEngagementObjective({
  objectiveId: "engagement-alpha",
  tenantId: "tenant-alpha",
  purpose: "consented follow-through",
  consentGrantId: consent.grantId,
  meaningfulOutcomeMetricIds: ["follow-up-completed"],
  prohibitedOptimizationMetrics: ["clicks", "message-volume"],
  safetyConstraints: ["urgent-content-human-escalation"]
});
const communicationPolicy = buildCommunicationDeliveryPolicy({
  policyId: "communication-alpha",
  tenantId: "tenant-alpha",
  purpose: "care coordination reminder draft",
  consentGrantId: consent.grantId,
  allowedChannels: ["sms"],
  quietHours: { startsAtLocalHour: 22, endsAtLocalHour: 7 },
  maximumContactsPerDay: 2,
  maximumContactsPerWeek: 5,
  accessibilityPreferences: ["plain-language"],
  languagePreferences: ["en"],
  urgentEscalationRole: "care-coordination-human",
  emailAuthentication: {
    spf: "not-applicable",
    dkim: "not-applicable",
    dmarc: "not-applicable"
  }
});
const communicationDecision = evaluateCommunicationDelivery({
  objective: engagement,
  policy: communicationPolicy,
  consent,
  localHour: 12,
  contactsToday: 0,
  contactsThisWeek: 0,
  requestedChannel: "sms",
  containsPhiOrSensitiveClinicalContent: false,
  urgent: false
});
assert.equal(communicationDecision.decision, "REQUIRE_HUMAN");

const fatigueBlocked = evaluateCommunicationDelivery({
  objective: engagement,
  policy: communicationPolicy,
  consent,
  localHour: 12,
  contactsToday: 2,
  contactsThisWeek: 5,
  requestedChannel: "sms",
  containsPhiOrSensitiveClinicalContent: false,
  urgent: false
});
assert.equal(fatigueBlocked.decision, "BLOCK");

const launchCell = buildClinicalLaunchCell({
  launchCellId: "launch-cell-alpha",
  tenantId: "tenant-alpha",
  clinicalSponsorIdentityHash: null,
  workflowOwnerIdentityHash: hash("workflow-owner"),
  patientEducationOrDomainSpecialistIdentityHash: hash("domain-owner"),
  privacySecurityOwnerIdentityHash: hash("privacy-owner"),
  integrationOwnerIdentityHash: hash("integration-owner"),
  evaluationSafetyOwnerIdentityHash: hash("evaluation-owner"),
  intendedUse: "synthetic workflow review",
  prohibitedUse: ["live clinical care"],
  exceptionReviewReferences: ["exception-review-alpha"],
  contentFreshnessEvidence: ["freshness-alpha"],
  syntheticSimulationEvidence: ["simulation-alpha"],
  signedAcceptanceCriteriaDigest: null
});
assert.equal(launchCell.decision, "REQUIRE_HUMAN");
assert.equal(launchCell.productionActivationAllowed, false);

const valueCase = buildAIValueCase({
  valueCaseId: "value-case-alpha",
  tenantId: "tenant-alpha",
  workflowId: "workflow-alpha",
  baselineEvidenceDigest: hash("baseline"),
  outcomeEvidenceDigests: [hash("outcome")],
  clinicianTimeReturnedMinutes: 10,
  correctionCount: 1,
  overrideCount: 0,
  escalationCount: 1,
  abandonmentCount: 0,
  totalCostUsd: 4,
  validatedSuccessfulTaskCount: 2,
  evidenceStrength: "moderate"
});
assert.equal(valueCase.costPerValidatedSuccessfulTaskUsd, 2);
const boardSnapshot = buildBoardOutcomeSnapshot({
  snapshotId: "board-snapshot-alpha",
  valueCaseHash: valueCase.valueCaseHash,
  benefitsReviewHash: hash("benefits-review"),
  metrics: [
    {
      metricId: "cost-per-validated-task",
      value: 2,
      evidenceDigest: hash("board-evidence"),
      evidenceSignatureDigest: null
    }
  ]
});
assert.equal(boardSnapshot.publishable, false);

const marketSignal = buildMarketSignal({
  signalId: "market-signal-alpha",
  sourceUrl: "https://example.invalid/vendor-announcement",
  sourceType: "vendor-announcement",
  claimDigest: hash("market-claim"),
  corroboratingSourceDigests: [],
  confidence: 0.4
});
assert.equal(marketSignal.trustedConfigurationEligible, false);
assert.equal(marketSignal.productClaimEligible, false);

const flags = getScrimedWorkFeatureFlags({});
assert.equal(flags.agentCheckpointForkEnabled, false);
assert.equal(flags.localOpenModelEvaluationEnabled, false);
assert.equal(flags.tenantSafeCacheEnabled, false);
assert.equal(flags.scientificCampaignsEnabled, false);
assert.equal(flags.specialtyModelLanesEnabled, false);
assert.equal(flags.consequentialActionsEnabled, false);

console.log(
  "pass SCRIMED p.32 control-plane closure policy tests (agent oversight, artifact admission, provenance, interoperability, consent, value, and default-off experiments)"
);
