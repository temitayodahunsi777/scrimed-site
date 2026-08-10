#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  ".env.example",
  "app/lib/scrimedP32HealthConversationFabric.ts",
  "app/lib/scrimedP32PatientRecords.ts",
  "app/lib/scrimed-work/agentExecution.ts",
  "app/lib/scrimedP32ResearchIntelligence.ts",
  "app/lib/imagingWorkflowIntelligence.ts",
  "app/lib/scrimedP32OncologyIntelligence.ts",
  "app/lib/scrimed-work/providerRegistry.ts",
  "app/lib/scrimed-work/modelRouter.ts",
  "app/lib/scrimedP32NetworkIntelligence.ts",
  "app/lib/scrimed-work/featureFlags.ts",
  "app/lib/scrimedP32ControlPlane.ts",
  "docs/scrimed-p32-clinical-operations.md",
  "docs/scrimed-p32-architecture.md",
  "docs/scrimed-p32-traceability.md",
  "scripts/scrimed-p32-clinical-operations-policy-test.mjs",
  "scripts/scrimed-nonsecret-test-suite.mjs",
  "package.json"
];

const files = Object.fromEntries(
  await Promise.all(requiredFiles.map(async (path) => [path, await readFile(path, "utf8")]))
);

function requireIncludes(path, expected) {
  if (!files[path].includes(expected)) {
    throw new Error(`${path} is missing required p.32 clinical operations contract text: ${expected}`);
  }
}

for (const expected of [
  "PatientCopilotPolicy",
  "ClinicianCopilotPolicy",
  "HealthContextBoundary",
  "ContextGrant",
  "SharedEncounterBrief",
  "ConversationHandoff",
  "ActionPolicy",
  "ActionAuthorization",
  "EXPLICIT_CROSS_DOMAIN_GRANT_REQUIRED",
  "PATIENT_AGENT_CLINICIAN_ACTION_DENIED",
  "CONSEQUENTIAL_MUTATION_BLOCKED",
  "recordWritebackAllowed: false",
  "rawPhiRecordedInAudit: false"
]) requireIncludes("app/lib/scrimedP32HealthConversationFabric.ts", expected);

for (const expected of [
  "AmbientEncounterDraft",
  "AmbientOutcomeLedger",
  "AudioConsentRecord",
  "RetentionPolicy",
  "PatientDataGrant",
  "LongitudinalRecordManifest",
  "ConnectionReceipt",
  "RevocationReceipt",
  "SourceCoverageManifest",
  "recordAmbientClinicianDecision",
  "evaluateAudioRetention",
  "futureConnectorAccessAllowed: false",
  "trainingUseAllowed: false",
  "ehrWritebackAllowed: false"
]) requireIncludes("app/lib/scrimedP32PatientRecords.ts", expected);

for (const expected of [
  "AgentEnvironmentSpec",
  "SnapshotManifest",
  "ForkGrant",
  "WorkloadIdentity",
  "CapabilityLease",
  "RunReceipt",
  "AgentTrace",
  "ModelAccessPolicy",
  "ArtifactFingerprint",
  "AdmissionDecision",
  "EmergencyRevocation",
  "networkEgressDefault: \"deny\"",
  "parentTokenReuseAllowed: false",
  "Child capability lease cannot exceed parent privileges",
  "UNVERIFIED_EGRESS_DENIED",
  "EMERGENCY_STOP_ACTIVE",
  "protectedChainOfThoughtStored: false"
]) requireIncludes("app/lib/scrimed-work/agentExecution.ts", expected);

for (const expected of [
  "TrialFailureInvestigation",
  "TrialEvidenceSnapshot",
  "RegistryVersionHistory",
  "EvidenceAtom",
  "EvidenceClassification",
  "FailureHypothesis",
  "ContradictoryEvidence",
  "AlternativeExplanation",
  "MissingEvidence",
  "ConfidenceBasis",
  "AdversarialReview",
  "HumanReviewDecision",
  "\"FACT\"",
  "\"HYPOTHESIS\"",
  "cannot approve its own conclusion",
  "BiologicalEmbeddingProvider",
  "BiologicalValidationRun",
  "STUDY_LEVEL_LEAKAGE_DETECTED",
  "clinicalActionAllowed: false"
]) requireIncludes("app/lib/scrimedP32ResearchIntelligence.ts", expected);

for (const expected of [
  "ImagingModelCard",
  "RegulatoryScope",
  "DICOMContract",
  "SiteValidationRun",
  "QueuePolicy",
  "QueueRecommendation",
  "DriftMonitor",
  "ImagingOverride",
  "ImagingOutcomeLedger",
  "blocked-site-validation",
  "MAXIMUM_DELAY_SAFEGUARD",
  "radiologistRetainsAuthority: true",
  "liveQueueMutationAllowed: false"
]) requireIncludes("app/lib/imagingWorkflowIntelligence.ts", expected);

for (const expected of [
  "MRDTestProfile",
  "MRDAssayVersion",
  "SpecimenProfile",
  "AssayComparabilityDecision",
  "LongitudinalMRDObservation",
  "CoverageEvidence",
  "MRDClinicalReview",
  "blocked-incompatible-assays",
  "payerSubmissionAllowed: false"
]) requireIncludes("app/lib/scrimedP32OncologyIntelligence.ts", expected);

for (const expected of [
  "ModelProviderProfile",
  "ModelArtifactManifest",
  "ProviderCapability",
  "ProviderConformanceRun",
  "RoutingDecision",
  "TaskEvaluationProfile",
  "ModelPromotionDecision",
  "RollbackReceipt",
  "PUBLIC_LEADERBOARD_CANNOT_PROMOTE",
  "automaticPromotionAllowed: false",
  "scrimedDisabledModelEvaluationProfiles"
]) requireIncludes("app/lib/scrimed-work/providerRegistry.ts", expected);

for (const expected of [
  "providerConformanceRuns",
  "provider-conformance:",
  "abstained-no-eligible-model",
  "silentFallbackAllowed: false"
]) requireIncludes("app/lib/scrimed-work/modelRouter.ts", expected);

for (const expected of [
  "FacilityPerformanceNode",
  "FacilityRelationship",
  "NetworkVarianceMonitor",
  "OutcomeBaseline",
  "BenefitsRealizationReview",
  "AdministrativeBurdenCase",
  "PriorAuthorizationProportionalityAnalysis",
  "PolicyEvidencePacket",
  "siteAndSubgroupVariancePreserved: true",
  "payerSubmissionAllowed: false",
  "payerMutationAllowed: false"
]) requireIncludes("app/lib/scrimedP32NetworkIntelligence.ts", expected);

for (const expected of [
  "SCRIMED_CONTAINED_AGENT_EXECUTION_ENABLED=false",
  "SCRIMED_AMBIENT_DOCUMENTATION_ENABLED=false",
  "SCRIMED_PATIENT_CONTROLLED_RECORDS_ENABLED=false",
  "SCRIMED_TRIAL_FAILURE_INTELLIGENCE_ENABLED=false",
  "SCRIMED_BIOLOGICAL_SIGNATURE_RETRIEVAL_ENABLED=false",
  "SCRIMED_IMAGING_QUEUE_RECOMMENDATIONS_ENABLED=false",
  "SCRIMED_MRD_INTELLIGENCE_ENABLED=false",
  "SCRIMED_PROVIDER_CONFORMANCE_ENABLED=true",
  "SCRIMED_NETWORK_INTELLIGENCE_ENABLED=false"
]) requireIncludes(".env.example", expected);

for (const expected of [
  "healthConversationFabric",
  "containedAgentExecution",
  "patientRecords",
  "researchIntelligence",
  "imagingControlPlane",
  "oncologyIntelligence",
  "networkIntelligence",
  "productionReadiness: false",
  "releaseAuthorityGranted: false"
]) requireIncludes("app/lib/scrimedP32ControlPlane.ts", expected);

for (const expected of [
  "Health Context and Role Authority",
  "Contained Agent Execution",
  "Ambient and Patient-Controlled Records",
  "TrialCore Failure Intelligence",
  "Biological Retrieval",
  "Imaging and MRD",
  "Provider Conformance",
  "Network and Prior Authorization",
  "No database migration",
  "Rollback"
]) requireIncludes("docs/scrimed-p32-clinical-operations.md", expected);

for (const expected of [
  "\"test:scrimed-p32-clinical-operations\"",
  "\"contract:scrimed-p32-clinical-operations\"",
  "\"smoke:scrimed-p32-clinical-operations\""
]) requireIncludes("package.json", expected);

for (const expected of [
  "scripts/scrimed-p32-clinical-operations-policy-test.mjs",
  "scripts/scrimed-p32-clinical-operations-contract-check.mjs"
]) requireIncludes("scripts/scrimed-nonsecret-test-suite.mjs", expected);

for (const path of [
  "app/lib/scrimedP32HealthConversationFabric.ts",
  "app/lib/scrimedP32PatientRecords.ts",
  "app/lib/scrimed-work/agentExecution.ts",
  "app/lib/scrimedP32ResearchIntelligence.ts",
  "app/lib/imagingWorkflowIntelligence.ts",
  "app/lib/scrimedP32OncologyIntelligence.ts",
  "app/lib/scrimed-work/providerRegistry.ts",
  "app/lib/scrimedP32NetworkIntelligence.ts"
]) {
  const forbiddenEgressPatterns = [
    /\bfetch\s*\(/,
    /\bglobalThis\s*\.\s*fetch\b/,
    /\b(?:require|import)\s*\(\s*["']node:(?:http|https|net|tls|dns)["']\s*\)/,
    /\bfrom\s+["']node:(?:http|https|net|tls|dns)["']/,
    /\b(?:axios|undici|got)\b/
  ];
  if (forbiddenEgressPatterns.some((pattern) => pattern.test(files[path]))) {
    throw new Error(`${path} must not perform external network calls in the synthetic p.32 control plane.`);
  }
}

console.log("pass SCRIMED p.32 clinical operations repository contract check");
