export type ControlPlaneFeatureFlags = {
  controlPlaneEnabled: boolean;
  multiAgentEnabled: boolean;
  contextFabricEnabled: boolean;
  modelRouterEnabled: boolean;
  verificationEngineEnabled: boolean;
  consequenceBenchEnabled: boolean;
  reasoningObservatoryEnabled: boolean;
  artifactEngineEnabled: boolean;
  capitalIntelligenceEnabled: boolean;
  voiceSimulationEnabled: boolean;
  computeResilienceEnabled: boolean;
  learningLoopEnabled: boolean;
  approvalAchievementEnabled: boolean;
  crossPlatformEvidenceEnabled: boolean;
  consequentialActionsEnabled: boolean;
};

function enabled(env: NodeJS.ProcessEnv, name: string, fallback: boolean) {
  const value = env[name];
  return value === undefined ? fallback : value.toLowerCase() === "true";
}

export function getControlPlaneFeatureFlags(env: NodeJS.ProcessEnv = process.env): ControlPlaneFeatureFlags {
  return {
    controlPlaneEnabled: enabled(env, "SCRIMED_CONTROL_PLANE_ENABLED", true),
    multiAgentEnabled: enabled(env, "SCRIMED_MULTI_AGENT_ENABLED", true),
    contextFabricEnabled: enabled(env, "SCRIMED_CONTEXT_FABRIC_ENABLED", true),
    modelRouterEnabled: enabled(env, "SCRIMED_MODEL_ROUTER_ENABLED", true),
    verificationEngineEnabled: enabled(env, "SCRIMED_VERIFICATION_ENGINE_ENABLED", true),
    consequenceBenchEnabled: enabled(env, "SCRIMED_CONSEQUENCE_BENCH_ENABLED", true),
    reasoningObservatoryEnabled: enabled(env, "SCRIMED_REASONING_OBSERVATORY_ENABLED", true),
    artifactEngineEnabled: enabled(env, "SCRIMED_ARTIFACT_ENGINE_ENABLED", true),
    capitalIntelligenceEnabled: enabled(env, "SCRIMED_CAPITAL_INTELLIGENCE_ENABLED", true),
    voiceSimulationEnabled: enabled(env, "SCRIMED_VOICE_SIMULATION_ENABLED", true),
    computeResilienceEnabled: enabled(env, "SCRIMED_COMPUTE_RESILIENCE_ENABLED", true),
    learningLoopEnabled: enabled(env, "SCRIMED_LEARNING_LOOP_ENABLED", true),
    approvalAchievementEnabled: enabled(env, "SCRIMED_APPROVAL_ACHIEVEMENT_ENABLED", true),
    crossPlatformEvidenceEnabled: enabled(env, "SCRIMED_CROSS_PLATFORM_EVIDENCE_ENABLED", true),
    consequentialActionsEnabled: enabled(env, "SCRIMED_CONSEQUENTIAL_ACTIONS_ENABLED", false)
  };
}

export const controlPlaneEnvironmentDefaults = {
  SCRIMED_CONTROL_PLANE_ENABLED: "true",
  SCRIMED_MULTI_AGENT_ENABLED: "true",
  SCRIMED_CONTEXT_FABRIC_ENABLED: "true",
  SCRIMED_MODEL_ROUTER_ENABLED: "true",
  SCRIMED_VERIFICATION_ENGINE_ENABLED: "true",
  SCRIMED_CONSEQUENCE_BENCH_ENABLED: "true",
  SCRIMED_REASONING_OBSERVATORY_ENABLED: "true",
  SCRIMED_ARTIFACT_ENGINE_ENABLED: "true",
  SCRIMED_CAPITAL_INTELLIGENCE_ENABLED: "true",
  SCRIMED_VOICE_SIMULATION_ENABLED: "true",
  SCRIMED_COMPUTE_RESILIENCE_ENABLED: "true",
  SCRIMED_LEARNING_LOOP_ENABLED: "true",
  SCRIMED_APPROVAL_ACHIEVEMENT_ENABLED: "true",
  SCRIMED_CROSS_PLATFORM_EVIDENCE_ENABLED: "true",
  SCRIMED_CONSEQUENTIAL_ACTIONS_ENABLED: "false"
} as const;
