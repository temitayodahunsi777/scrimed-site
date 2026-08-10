export type ScrimedWorkFeatureFlags = {
  workEnabled: boolean;
  multiAgentEnabled: boolean;
  modelRouterEnabled: boolean;
  contextEngineEnabled: boolean;
  artifactEngineEnabled: boolean;
  schedulesEnabled: boolean;
  voiceSimulationEnabled: boolean;
  learningLoopEnabled: boolean;
  foundryEnabled: boolean;
  foundryDeploymentEnabled: boolean;
  caseEvidenceDurableStoreEnabled: boolean;
  clinicalAssuranceControlPlaneEnabled: boolean;
  clinicalAssuranceEnforcementEnabled: boolean;
  clinicalAssuranceDurableStoreEnabled: boolean;
  supplierContinuityAutomationEnabled: boolean;
  externalImagingAdaptersEnabled: boolean;
  healthConversationFabricEnabled: boolean;
  containedAgentExecutionEnabled: boolean;
  ambientDocumentationEnabled: boolean;
  patientControlledRecordsEnabled: boolean;
  trialFailureIntelligenceEnabled: boolean;
  biologicalSignatureRetrievalEnabled: boolean;
  imagingQueueRecommendationsEnabled: boolean;
  mrdIntelligenceEnabled: boolean;
  providerConformanceEnabled: boolean;
  networkIntelligenceEnabled: boolean;
  agentCheckpointForkEnabled: boolean;
  localOpenModelEvaluationEnabled: boolean;
  tenantSafeCacheEnabled: boolean;
  scientificCampaignsEnabled: boolean;
  specialtyModelLanesEnabled: boolean;
  consequentialActionsEnabled: boolean;
};

function envBoolean(name: string, fallback: boolean, env: NodeJS.ProcessEnv) {
  const value = env[name];

  if (!value) return fallback;
  return value.toLowerCase() === "true";
}

export function getScrimedWorkFeatureFlags(env: NodeJS.ProcessEnv = process.env): ScrimedWorkFeatureFlags {
  return {
    workEnabled: envBoolean("SCRIMED_WORK_ENABLED", true, env),
    multiAgentEnabled: envBoolean("SCRIMED_MULTI_AGENT_ENABLED", true, env),
    modelRouterEnabled: envBoolean("SCRIMED_MODEL_ROUTER_ENABLED", true, env),
    contextEngineEnabled: envBoolean("SCRIMED_CONTEXT_ENGINE_ENABLED", true, env),
    artifactEngineEnabled: envBoolean("SCRIMED_ARTIFACT_ENGINE_ENABLED", true, env),
    schedulesEnabled: envBoolean("SCRIMED_SCHEDULES_ENABLED", false, env),
    voiceSimulationEnabled: envBoolean("SCRIMED_VOICE_SIMULATION_ENABLED", true, env),
    learningLoopEnabled: envBoolean("SCRIMED_LEARNING_LOOP_ENABLED", true, env),
    foundryEnabled: envBoolean("SCRIMED_FOUNDRY_ENABLED", true, env),
    foundryDeploymentEnabled: envBoolean("SCRIMED_FOUNDRY_DEPLOYMENT_ENABLED", false, env),
    caseEvidenceDurableStoreEnabled: envBoolean("SCRIMED_CASE_EVIDENCE_DURABLE_STORE_ENABLED", false, env),
    clinicalAssuranceControlPlaneEnabled: envBoolean("SCRIMED_CLINICAL_ASSURANCE_CONTROL_PLANE_ENABLED", true, env),
    clinicalAssuranceEnforcementEnabled: envBoolean("SCRIMED_CLINICAL_ASSURANCE_ENFORCEMENT_ENABLED", false, env),
    clinicalAssuranceDurableStoreEnabled: envBoolean("SCRIMED_CLINICAL_ASSURANCE_DURABLE_STORE_ENABLED", false, env),
    supplierContinuityAutomationEnabled: envBoolean("SCRIMED_SUPPLIER_CONTINUITY_AUTOMATION_ENABLED", false, env),
    externalImagingAdaptersEnabled: envBoolean("SCRIMED_EXTERNAL_IMAGING_ADAPTERS_ENABLED", false, env),
    healthConversationFabricEnabled: envBoolean("SCRIMED_HEALTH_CONVERSATION_FABRIC_ENABLED", true, env),
    containedAgentExecutionEnabled: envBoolean("SCRIMED_CONTAINED_AGENT_EXECUTION_ENABLED", false, env),
    ambientDocumentationEnabled: envBoolean("SCRIMED_AMBIENT_DOCUMENTATION_ENABLED", false, env),
    patientControlledRecordsEnabled: envBoolean("SCRIMED_PATIENT_CONTROLLED_RECORDS_ENABLED", false, env),
    trialFailureIntelligenceEnabled: envBoolean("SCRIMED_TRIAL_FAILURE_INTELLIGENCE_ENABLED", false, env),
    biologicalSignatureRetrievalEnabled: envBoolean("SCRIMED_BIOLOGICAL_SIGNATURE_RETRIEVAL_ENABLED", false, env),
    imagingQueueRecommendationsEnabled: envBoolean("SCRIMED_IMAGING_QUEUE_RECOMMENDATIONS_ENABLED", false, env),
    mrdIntelligenceEnabled: envBoolean("SCRIMED_MRD_INTELLIGENCE_ENABLED", false, env),
    providerConformanceEnabled: envBoolean("SCRIMED_PROVIDER_CONFORMANCE_ENABLED", true, env),
    networkIntelligenceEnabled: envBoolean("SCRIMED_NETWORK_INTELLIGENCE_ENABLED", false, env),
    agentCheckpointForkEnabled: envBoolean("SCRIMED_AGENT_CHECKPOINT_FORK_ENABLED", false, env),
    localOpenModelEvaluationEnabled: envBoolean("SCRIMED_LOCAL_OPEN_MODEL_EVALUATION_ENABLED", false, env),
    tenantSafeCacheEnabled: envBoolean("SCRIMED_TENANT_SAFE_CACHE_ENABLED", false, env),
    scientificCampaignsEnabled: envBoolean("SCRIMED_SCIENTIFIC_CAMPAIGNS_ENABLED", false, env),
    specialtyModelLanesEnabled: envBoolean("SCRIMED_SPECIALTY_MODEL_LANES_ENABLED", false, env),
    consequentialActionsEnabled: envBoolean("SCRIMED_CONSEQUENTIAL_ACTIONS_ENABLED", false, env)
  };
}

export function scrimedWorkFeatureFlagHeaders(flags = getScrimedWorkFeatureFlags()) {
  return {
    "X-SCRIMED-Work-Enabled": flags.workEnabled ? "true" : "false",
    "X-SCRIMED-Multi-Agent-Enabled": flags.multiAgentEnabled ? "true" : "false",
    "X-SCRIMED-Model-Router-Enabled": flags.modelRouterEnabled ? "true" : "false",
    "X-SCRIMED-Context-Engine-Enabled": flags.contextEngineEnabled ? "true" : "false",
    "X-SCRIMED-Artifact-Engine-Enabled": flags.artifactEngineEnabled ? "true" : "false",
    "X-SCRIMED-Schedules-Enabled": flags.schedulesEnabled ? "true" : "false",
    "X-SCRIMED-Voice-Simulation-Enabled": flags.voiceSimulationEnabled ? "true" : "false",
    "X-SCRIMED-Learning-Loop-Enabled": flags.learningLoopEnabled ? "true" : "false",
    "X-SCRIMED-Foundry-Enabled": flags.foundryEnabled ? "true" : "false",
    "X-SCRIMED-Foundry-Deployment": flags.foundryDeploymentEnabled ? "enabled" : "disabled",
    "X-SCRIMED-Case-Evidence-Durable-Store": flags.caseEvidenceDurableStoreEnabled ? "enabled" : "disabled",
    "X-SCRIMED-Clinical-Assurance-Control-Plane": flags.clinicalAssuranceControlPlaneEnabled ? "enabled" : "disabled",
    "X-SCRIMED-Clinical-Assurance-Enforcement": flags.clinicalAssuranceEnforcementEnabled ? "enabled" : "disabled",
    "X-SCRIMED-Clinical-Assurance-Durable-Store": flags.clinicalAssuranceDurableStoreEnabled ? "enabled" : "disabled",
    "X-SCRIMED-Supplier-Continuity-Automation": flags.supplierContinuityAutomationEnabled ? "enabled" : "disabled",
    "X-SCRIMED-External-Imaging-Adapters": flags.externalImagingAdaptersEnabled ? "enabled" : "disabled",
    "X-SCRIMED-Health-Conversation-Fabric": flags.healthConversationFabricEnabled ? "enabled" : "disabled",
    "X-SCRIMED-Contained-Agent-Execution": flags.containedAgentExecutionEnabled ? "enabled" : "disabled",
    "X-SCRIMED-Ambient-Documentation": flags.ambientDocumentationEnabled ? "enabled" : "disabled",
    "X-SCRIMED-Patient-Controlled-Records": flags.patientControlledRecordsEnabled ? "enabled" : "disabled",
    "X-SCRIMED-Trial-Failure-Intelligence": flags.trialFailureIntelligenceEnabled ? "enabled" : "disabled",
    "X-SCRIMED-Biological-Signature-Retrieval": flags.biologicalSignatureRetrievalEnabled ? "enabled" : "disabled",
    "X-SCRIMED-Imaging-Queue-Recommendations": flags.imagingQueueRecommendationsEnabled ? "enabled" : "disabled",
    "X-SCRIMED-MRD-Intelligence": flags.mrdIntelligenceEnabled ? "enabled" : "disabled",
    "X-SCRIMED-Provider-Conformance": flags.providerConformanceEnabled ? "enabled" : "disabled",
    "X-SCRIMED-Network-Intelligence": flags.networkIntelligenceEnabled ? "enabled" : "disabled",
    "X-SCRIMED-Agent-Checkpoint-Fork": flags.agentCheckpointForkEnabled ? "enabled" : "disabled",
    "X-SCRIMED-Local-Open-Model-Evaluation": flags.localOpenModelEvaluationEnabled ? "enabled" : "disabled",
    "X-SCRIMED-Tenant-Safe-Cache": flags.tenantSafeCacheEnabled ? "enabled" : "disabled",
    "X-SCRIMED-Scientific-Campaigns": flags.scientificCampaignsEnabled ? "enabled" : "disabled",
    "X-SCRIMED-Specialty-Model-Lanes": flags.specialtyModelLanesEnabled ? "enabled" : "disabled",
    "X-SCRIMED-Consequential-Actions-Enabled": flags.consequentialActionsEnabled ? "true" : "false"
  };
}
