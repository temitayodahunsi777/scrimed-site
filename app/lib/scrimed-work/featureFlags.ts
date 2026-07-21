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
    "X-SCRIMED-Consequential-Actions-Enabled": flags.consequentialActionsEnabled ? "true" : "false"
  };
}
