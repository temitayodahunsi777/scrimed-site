import { clinicalSearchFabricBoundary, clinicalSearchFabricVersion } from "./clinicalSearchFabric";
import {
  scrimedEvidenceOpsBenchmarkCard,
  scrimedBenchmarkLanes
} from "./scrimedClinicalBenchmarkSuite";
import {
  getConfiguredModelFitAliases,
  scrimedDisabledModelEvaluationProfiles,
  scrimedProviderConformanceVersion
} from "./scrimed-work/providerRegistry";
import { scrimedP32Boundary, scrimedP32ContractVersion } from "./scrimed-work/p32Contracts";
import { getP32ReleaseGateCatalog, scrimedP32ReleaseGateBoundary } from "./scrimedP32ReleaseGates";
import {
  isGrowthOsEnabled,
  isTrialCoreEnablementEnabled,
  scrimedAgentReadyInteroperabilityContract,
  scrimedP32WorkflowBoundary,
  scrimedP32WorkflowControlsVersion
} from "./scrimedP32WorkflowControls";
import {
  scrimedTrustIncidentForensicsBoundary,
  scrimedTrustIncidentForensicsVersion
} from "./scrimedTrustIncidentForensics";
import {
  scrimedP32ProductionHarnessBoundary,
  scrimedP32ProductionHarnessVersion
} from "./scrimedP32ProductionHarness";
import {
  careContextPolicyMatrix,
  scrimedP32CarePolicyBoundary,
  scrimedP32CarePolicyVersion
} from "./scrimedP32CarePolicy";
import {
  scrimedP32ResourceAdmissionBoundary,
  scrimedP32ResourceAdmissionVersion
} from "./scrimedP32ResourceAdmission";
import {
  scrimedP32ClinicalDataViewsBoundary,
  scrimedP32ClinicalDataViewsVersion
} from "./scrimedP32ClinicalDataViews";
import {
  isP32RcmVoiceEnabled,
  scrimedP32RcmVoiceBoundary,
  scrimedP32RcmVoiceVersion
} from "./scrimedP32RcmVoice";
import {
  scrimedP32ApplicationRationalizationBoundary,
  scrimedP32ApplicationRationalizationVersion
} from "./scrimedP32ApplicationRationalization";
import {
  scrimedGovernedRuntimeBoundary,
  scrimedGovernedRuntimeVersion
} from "./scrimed-work/governedRuntime";
import {
  scrimedP32MultimodalNormalizationBoundary,
  scrimedP32MultimodalNormalizationVersion
} from "./scrimedP32MultimodalNormalization";
import {
  scrimedP32ArtifactLedgerBoundary,
  scrimedP32ArtifactLedgerVersion
} from "./scrimedP32ArtifactLedger";
import { scrimedP32RepoOpsBoundary, scrimedP32RepoOpsVersion } from "./scrimedP32RepoOps";
import {
  getHealthConversationFabricSummary,
  scrimedP32HealthConversationFabricBoundary,
  scrimedP32HealthConversationFabricVersion
} from "./scrimedP32HealthConversationFabric";
import {
  getPatientRecordsSummary,
  scrimedP32PatientRecordsBoundary,
  scrimedP32PatientRecordsVersion
} from "./scrimedP32PatientRecords";
import {
  getAgentExecutionSummary,
  scrimedAgentExecutionBoundary,
  scrimedAgentExecutionVersion
} from "./scrimed-work/agentExecution";
import {
  getResearchIntelligenceSummary,
  scrimedP32ResearchIntelligenceBoundary,
  scrimedP32ResearchIntelligenceVersion
} from "./scrimedP32ResearchIntelligence";
import {
  getOncologyIntelligenceSummary,
  scrimedP32OncologyIntelligenceBoundary,
  scrimedP32OncologyIntelligenceVersion
} from "./scrimedP32OncologyIntelligence";
import {
  getNetworkIntelligenceSummary,
  scrimedP32NetworkIntelligenceBoundary,
  scrimedP32NetworkIntelligenceVersion
} from "./scrimedP32NetworkIntelligence";
import {
  getImagingWorkflowIntelligenceSummary,
  imagingWorkflowIntelligenceBoundary,
  imagingWorkflowIntelligenceVersion
} from "./imagingWorkflowIntelligence";

export const scrimedP32ControlPlaneVersion = "scrimed-p32-control-plane-v3-2026-07-28";

export function getScrimedP32FeatureFlags(env: NodeJS.ProcessEnv = process.env) {
  return {
    controlPlaneEnabled: env.SCRIMED_P32_CONTROL_PLANE_ENABLED === "true",
    externalClinicalSearchEnabled: false,
    externalProviderCallsEnabled: false,
    connectorWritesEnabled: false,
    trialCoreEnablementEnabled: isTrialCoreEnablementEnabled(env),
    trialEnrollmentEnabled: false,
    growthOsEnabled: isGrowthOsEnabled(env),
    automaticOutreachEnabled: false,
    livePhiEnabled: false,
    payerSubmissionEnabled: false,
    ehrWritebackEnabled: false,
    productionHarnessEnabled: true,
    governedRuntimeEnabled: true,
    resourceAdmissionEnabled: true,
    derivedClinicalViewsEnabled: true,
    multimodalNormalizationEnabled: true,
    artifactLedgerEnabled: true,
    applicationRationalizationEnabled: true,
    healthConversationFabricEnabled: env.SCRIMED_HEALTH_CONVERSATION_FABRIC_ENABLED !== "false",
    containedAgentExecutionEnabled: env.SCRIMED_CONTAINED_AGENT_EXECUTION_ENABLED === "true",
    ambientDocumentationEnabled: env.SCRIMED_AMBIENT_DOCUMENTATION_ENABLED === "true",
    patientControlledRecordsEnabled: env.SCRIMED_PATIENT_CONTROLLED_RECORDS_ENABLED === "true",
    trialFailureIntelligenceEnabled: env.SCRIMED_TRIAL_FAILURE_INTELLIGENCE_ENABLED === "true",
    biologicalSignatureRetrievalEnabled: env.SCRIMED_BIOLOGICAL_SIGNATURE_RETRIEVAL_ENABLED === "true",
    imagingQueueRecommendationsEnabled: env.SCRIMED_IMAGING_QUEUE_RECOMMENDATIONS_ENABLED === "true",
    mrdIntelligenceEnabled: env.SCRIMED_MRD_INTELLIGENCE_ENABLED === "true",
    providerConformanceEnabled: env.SCRIMED_PROVIDER_CONFORMANCE_ENABLED !== "false",
    networkIntelligenceEnabled: env.SCRIMED_NETWORK_INTELLIGENCE_ENABLED === "true",
    rcmVoiceEnabled: isP32RcmVoiceEnabled(env),
    rcmVoiceExternalCallsEnabled: false,
    rcmVoiceWritebackEnabled: false
  } as const;
}

export function getScrimedP32ControlPlaneSummary(env: NodeJS.ProcessEnv = process.env) {
  const featureFlags = getScrimedP32FeatureFlags(env);
  const releaseGates = getP32ReleaseGateCatalog();
  const modelFitAliases = getConfiguredModelFitAliases(env);

  return {
    service: "scrimed-p32-control-plane",
    status: "repository-native-foundation-synthetic-no-phi",
    version: scrimedP32ControlPlaneVersion,
    contractVersion: scrimedP32ContractVersion,
    optimizationTarget: "cost-per-safe-clinically-accepted-outcome",
    sharedContracts: [
      "PolicyDecision",
      "ModelRouteDecision",
      "EvidenceSource",
      "EvidenceClaim",
      "SearchRequest",
      "SearchResult",
      "IncidentEvidenceBundle",
      "BenchmarkCard",
      "IntentEnvelope",
      "AttentionEvent",
      "ConnectorPolicy",
      "TrialCandidateReview",
      "ICPProfile",
      "OutcomeEvent",
      "ApprovalEvidence",
      "ReleaseGateResult",
      "HarnessScorecard",
      "CareContext",
      "DeviceProfile",
      "CanonicalLongitudinalFact",
      "RcmVoiceWorkItem",
      "ApplicationRecord",
      "ModelBOM",
      "CapabilityManifest",
      "ExecutionGrant",
      "NormalizedMultimodalFact",
      "ArtifactRevision",
      "DeveloperSessionReceipt",
      "PatientCopilotPolicy",
      "ClinicianCopilotPolicy",
      "HealthContextBoundary",
      "ContextGrant",
      "SharedEncounterBrief",
      "ConversationHandoff",
      "ActionPolicy",
      "ActionAuthorization",
      "AgentEnvironmentSpec",
      "SnapshotManifest",
      "ForkGrant",
      "WorkloadIdentity",
      "CapabilityLease",
      "RunReceipt",
      "AgentTrace",
      "AmbientEncounterDraft",
      "PatientDataGrant",
      "TrialFailureInvestigation",
      "BiologicalEmbeddingProvider",
      "ImagingModelCard",
      "MRDTestProfile",
      "ProviderConformanceRun",
      "FacilityPerformanceNode",
      "PriorAuthorizationProportionalityAnalysis"
    ],
    clinicalSearchFabric: {
      version: clinicalSearchFabricVersion,
      stages: [
        "intent-classification",
        "bounded-query-expansion",
        "approved-source-ranking",
        "rights-aware-normalization",
        "claim-citation-validation",
        "conflict-presentation",
        "cost-per-accepted-answer"
      ],
      externalRetrievalEnabled: false,
      boundary: clinicalSearchFabricBoundary
    },
    trustReleaseGuardian: {
      incidentForensicsVersion: scrimedTrustIncidentForensicsVersion,
      timelineReconstruction: true,
      counterfactualReview: true,
      automaticLiabilityDetermination: false,
      boundary: scrimedTrustIncidentForensicsBoundary
    },
    evidenceOps: {
      benchmarkId: scrimedEvidenceOpsBenchmarkCard.benchmarkId,
      originPlatform: scrimedEvidenceOpsBenchmarkCard.originPlatform,
      taskLanes: scrimedBenchmarkLanes,
      temporalHoldout: scrimedEvidenceOpsBenchmarkCard.temporalHoldout,
      externalSiteValidation: scrimedEvidenceOpsBenchmarkCard.externalSiteValidation,
      universalWinnerClaimAllowed: scrimedEvidenceOpsBenchmarkCard.universalWinnerClaimAllowed
    },
    modelFit: {
      aliases: modelFitAliases,
      providerConformanceVersion: scrimedProviderConformanceVersion,
      disabledEvaluationProfiles: scrimedDisabledModelEvaluationProfiles,
      routeBasis: [
        "clinical risk",
        "tenant policy",
        "residency",
        "PHI eligibility",
        "workflow validation",
        "provider health",
        "accepted-answer cost",
        "human review"
      ],
      silentFallbackAllowed: false,
      unmeasuredClinicalPromotionAllowed: false
    },
    healthConversationFabric: {
      ...getHealthConversationFabricSummary(),
      version: scrimedP32HealthConversationFabricVersion,
      enabled: featureFlags.healthConversationFabricEnabled,
      boundary: scrimedP32HealthConversationFabricBoundary
    },
    containedAgentExecution: {
      ...getAgentExecutionSummary(),
      version: scrimedAgentExecutionVersion,
      enabled: featureFlags.containedAgentExecutionEnabled,
      boundary: scrimedAgentExecutionBoundary
    },
    patientRecords: {
      ...getPatientRecordsSummary(),
      version: scrimedP32PatientRecordsVersion,
      ambientDocumentationEnabled: featureFlags.ambientDocumentationEnabled,
      patientControlledRecordsEnabled: featureFlags.patientControlledRecordsEnabled,
      boundary: scrimedP32PatientRecordsBoundary
    },
    researchIntelligence: {
      ...getResearchIntelligenceSummary(env),
      version: scrimedP32ResearchIntelligenceVersion,
      boundary: scrimedP32ResearchIntelligenceBoundary
    },
    imagingControlPlane: {
      ...getImagingWorkflowIntelligenceSummary(),
      version: imagingWorkflowIntelligenceVersion,
      queueRecommendationsEnabled: featureFlags.imagingQueueRecommendationsEnabled,
      boundary: imagingWorkflowIntelligenceBoundary
    },
    oncologyIntelligence: {
      ...getOncologyIntelligenceSummary(env),
      version: scrimedP32OncologyIntelligenceVersion,
      boundary: scrimedP32OncologyIntelligenceBoundary
    },
    networkIntelligence: {
      ...getNetworkIntelligenceSummary(env),
      version: scrimedP32NetworkIntelligenceVersion,
      boundary: scrimedP32NetworkIntelligenceBoundary
    },
    workflowControls: {
      version: scrimedP32WorkflowControlsVersion,
      intentConfirmationRequiredBeforeConsequentialAction: true,
      factsSeparatedFromInferences: true,
      clinicalAttentionLevels: ["BACKGROUND", "INBOX", "INTERRUPTIVE", "HARD_STOP"],
      connectorTermsChangeFreezesWrites: true,
      trialAutoEnrollmentAllowed: false,
      automaticGrowthOutreachAllowed: false,
      boundary: scrimedP32WorkflowBoundary
    },
    productionHarness: {
      version: scrimedP32ProductionHarnessVersion,
      optimizationTarget: "cost-per-verified-successful-task",
      hardNoncompensableGates: ["safety", "privacy", "security", "provenance", "required-evidence"],
      fitnessPolicy: "pareto-fitness-with-mandatory-floors",
      llmJudgeAuthority: "secondary-signal-only",
      deterministicValidationRequired: true,
      boundedRetries: true,
      correctedCaseCorpus: "quarantined-deidentified-reviewed-only",
      boundary: scrimedP32ProductionHarnessBoundary
    },
    governedRuntime: {
      version: scrimedGovernedRuntimeVersion,
      authorizationStages: ["read", "propose", "approve", "execute", "verify"],
      candidateBoundExecutionGrants: true,
      nonceReplayProtection: true,
      idempotencyRequiredForExecution: true,
      consequentialActionsDefault: "deny-or-human-review",
      productionExecutionAuthority: false,
      boundary: scrimedGovernedRuntimeBoundary
    },
    careContextAutonomy: {
      version: scrimedP32CarePolicyVersion,
      contexts: [...new Set(careContextPolicyMatrix.map((entry) => entry.context))],
      taskRisks: [...new Set(careContextPolicyMatrix.map((entry) => entry.taskRisk))],
      policyCells: careContextPolicyMatrix.length,
      acuteCriticalFailClosed: true,
      autonomousClinicalAuthority: false,
      boundary: scrimedP32CarePolicyBoundary
    },
    resourceAdmission: {
      version: scrimedP32ResourceAdmissionVersion,
      runtimeStates: ["NORMAL", "CONSTRAINED", "DEGRADED", "SAFE_REFUSAL"],
      admissionDimensions: ["memory", "KV cache", "context", "cost", "latency", "retries", "tools", "thermal", "accelerator", "privacy zone"],
      simulatedDeviceProfilesOnly: true,
      liveModelExecutionAuthority: false,
      boundary: scrimedP32ResourceAdmissionBoundary
    },
    clinicalDataViews: {
      version: scrimedP32ClinicalDataViewsVersion,
      sourceOfRecordPreserved: true,
      derivedStrategies: ["raw-structured", "compact-structured", "clinical-narrative"],
      complexitySentinel: "no-silent-truncation-safe-refusal",
      qualityDimensions: ["completeness", "freshness", "contradictions", "units", "duplicates", "patient matching"],
      liveIngestionAuthority: false,
      boundary: scrimedP32ClinicalDataViewsBoundary
    },
    multimodalNormalization: {
      version: scrimedP32MultimodalNormalizationVersion,
      sourceKinds: ["pdf", "scan", "handwriting", "FHIR", "HL7 v2", "X12", "claims", "imaging metadata", "genomics metadata"],
      lowConfidenceRoute: "human-review-required",
      verifiedClinicalTruthAuthority: false,
      boundary: scrimedP32MultimodalNormalizationBoundary
    },
    artifactLedger: {
      version: scrimedP32ArtifactLedgerVersion,
      identity: "sha-256-content-and-stable-document-id",
      deletion: "recoverable-trash-and-restore-revisions",
      audit: "tamper-evident-revision-chain",
      distributionAuthority: false,
      boundary: scrimedP32ArtifactLedgerBoundary
    },
    repoOps: {
      version: scrimedP32RepoOpsVersion,
      controls: ["CODEOWNERS", "Dependabot", "dependency review", "CodeQL", "secret scan", "deterministic SBOM", "DeveloperSessionReceipt"],
      remoteSettingsVerified: false,
      remoteMutationAuthorized: false,
      boundary: scrimedP32RepoOpsBoundary
    },
    guardedRcmVoice: {
      version: scrimedP32RcmVoiceVersion,
      enabled: featureFlags.rcmVoiceEnabled,
      externalCallsEnabled: false,
      writebackEnabled: false,
      permittedSyntheticUses: ["eligibility status", "prior-authorization status", "claim status", "credentialing status"],
      ambiguousOutcomeRoute: "human-exception-queue",
      boundary: scrimedP32RcmVoiceBoundary
    },
    applicationRationalization: {
      version: scrimedP32ApplicationRationalizationVersion,
      dispositions: ["retain", "consolidate", "archive", "replace", "retire"],
      retirementRequires: ["export", "retention", "hash verification", "replacement", "rollback", "downtime", "recovery", "named approvals"],
      materialVendorChangeDefault: "no-go-until-reviewed",
      automaticRetirementAuthority: false,
      boundary: scrimedP32ApplicationRationalizationBoundary
    },
    connectorInteroperability: scrimedAgentReadyInteroperabilityContract,
    releaseGateCatalog: {
      count: releaseGates.length,
      automated: releaseGates.filter((gate) => gate.classification === "AUTOMATED").length,
      external: releaseGates.filter((gate) => gate.classification === "EXTERNAL").length,
      gates: releaseGates,
      boundary: scrimedP32ReleaseGateBoundary
    },
    featureFlags,
    productionReadiness: false,
    releaseAuthorityGranted: false,
    boundary: scrimedP32Boundary
  };
}
