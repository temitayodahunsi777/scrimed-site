import { evaluateCostApiGuardrail, getCostApiGuardrailSummary } from "./costApiGuardrails";
import { evaluateScrimedSafetyGate } from "./scrimedSafetyGovernance";

export type ScrimedModelProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "nvidia-nemotron"
  | "azure"
  | "aws"
  | "open-model"
  | "synthetic-fallback";

export type ScrimedModelTier =
  | "FAST_LOW_COST"
  | "ENTERPRISE_REASONING"
  | "CLINICAL_REVIEW_SYNTHETIC"
  | "CYBER_DEFENSE_SYNTHETIC"
  | "RESEARCH_SIMULATION_SYNTHETIC";

export type ScrimedTaskClass =
  | "synthetic-demo"
  | "clinical-review-synthetic"
  | "cyber-defense-synthetic"
  | "research-simulation-synthetic"
  | "enterprise-reasoning"
  | "blocked-protected-action";

export type ModelProviderAdapter = {
  provider: ScrimedModelProvider;
  status: "future-adapter" | "synthetic-active" | "disabled-until-approved";
  supportedTiers: ScrimedModelTier[];
  requiredControls: string[];
  noSecretTestMode: boolean;
};

export type ScrimedModelRouteDecision = {
  service: "scrimed-model-agnostic-router";
  routerVersion: string;
  taskClass: ScrimedTaskClass;
  tier: ScrimedModelTier;
  provider: ScrimedModelProvider;
  providerAdapterStatus: ModelProviderAdapter["status"];
  allowed: boolean;
  routeStatus: "synthetic-fallback-selected" | "blocked-by-safety-policy" | "blocked-by-cost-guardrail";
  estimatedCostUsd: number;
  latencyBudgetMs: number;
  safetyPolicyVersion: string;
  costGuardrailVersion: string;
  rationale: string;
};

export const scrimedModelRouterVersion = "scrimed-model-router-v2026-06-29";

export const modelProviderAdapters: ModelProviderAdapter[] = [
  {
    provider: "openai",
    status: "disabled-until-approved",
    supportedTiers: ["FAST_LOW_COST", "ENTERPRISE_REASONING", "CLINICAL_REVIEW_SYNTHETIC"],
    requiredControls: ["provider terms", "privacy review", "model registry", "budget guardrails"],
    noSecretTestMode: true
  },
  {
    provider: "anthropic",
    status: "disabled-until-approved",
    supportedTiers: ["ENTERPRISE_REASONING", "CLINICAL_REVIEW_SYNTHETIC"],
    requiredControls: ["provider terms", "privacy review", "fallback policy"],
    noSecretTestMode: true
  },
  {
    provider: "google",
    status: "disabled-until-approved",
    supportedTiers: ["ENTERPRISE_REASONING", "RESEARCH_SIMULATION_SYNTHETIC"],
    requiredControls: ["provider terms", "regional policy", "telemetry"],
    noSecretTestMode: true
  },
  {
    provider: "nvidia-nemotron",
    status: "future-adapter",
    supportedTiers: ["ENTERPRISE_REASONING", "CYBER_DEFENSE_SYNTHETIC", "RESEARCH_SIMULATION_SYNTHETIC"],
    requiredControls: ["GPU deployment profile", "model registry", "cost policy"],
    noSecretTestMode: true
  },
  {
    provider: "azure",
    status: "future-adapter",
    supportedTiers: ["ENTERPRISE_REASONING", "CLINICAL_REVIEW_SYNTHETIC"],
    requiredControls: ["tenant policy", "BAA/DPA path if applicable", "private networking review"],
    noSecretTestMode: true
  },
  {
    provider: "aws",
    status: "future-adapter",
    supportedTiers: ["ENTERPRISE_REASONING", "RESEARCH_SIMULATION_SYNTHETIC"],
    requiredControls: ["tenant policy", "regional deployment review", "budget guardrails"],
    noSecretTestMode: true
  },
  {
    provider: "open-model",
    status: "future-adapter",
    supportedTiers: ["FAST_LOW_COST", "CYBER_DEFENSE_SYNTHETIC", "RESEARCH_SIMULATION_SYNTHETIC"],
    requiredControls: ["local inference policy", "model card", "eval registry", "license review"],
    noSecretTestMode: true
  },
  {
    provider: "synthetic-fallback",
    status: "synthetic-active",
    supportedTiers: [
      "FAST_LOW_COST",
      "ENTERPRISE_REASONING",
      "CLINICAL_REVIEW_SYNTHETIC",
      "CYBER_DEFENSE_SYNTHETIC",
      "RESEARCH_SIMULATION_SYNTHETIC"
    ],
    requiredControls: ["no external call", "no secrets", "synthetic-only response"],
    noSecretTestMode: true
  }
];

function classifyTask(input: string): ScrimedTaskClass {
  if (/\b(live phi|diagnose|treat|prescribe|ehr write|payer submission|patient outreach)\b/i.test(input)) {
    return "blocked-protected-action";
  }

  if (/\b(clinical|robustness|guideline|citation|human review)\b/i.test(input)) {
    return "clinical-review-synthetic";
  }

  if (/\b(cyber|security|abuse|prompt injection|threat)\b/i.test(input)) {
    return "cyber-defense-synthetic";
  }

  if (/\b(research|trial|oncology|population|simulation)\b/i.test(input)) {
    return "research-simulation-synthetic";
  }

  if (/\b(enterprise|investor|diligence|architecture|board)\b/i.test(input)) {
    return "enterprise-reasoning";
  }

  return "synthetic-demo";
}

function tierForTask(taskClass: ScrimedTaskClass): ScrimedModelTier {
  if (taskClass === "clinical-review-synthetic") return "CLINICAL_REVIEW_SYNTHETIC";
  if (taskClass === "cyber-defense-synthetic") return "CYBER_DEFENSE_SYNTHETIC";
  if (taskClass === "research-simulation-synthetic") return "RESEARCH_SIMULATION_SYNTHETIC";
  if (taskClass === "enterprise-reasoning") return "ENTERPRISE_REASONING";
  return "FAST_LOW_COST";
}

function estimateForTier(tier: ScrimedModelTier) {
  if (tier === "FAST_LOW_COST") return { estimatedCostUsd: 0.005, latencyBudgetMs: 1200 };
  if (tier === "ENTERPRISE_REASONING") return { estimatedCostUsd: 0.05, latencyBudgetMs: 5000 };
  if (tier === "CLINICAL_REVIEW_SYNTHETIC") return { estimatedCostUsd: 0.08, latencyBudgetMs: 7000 };
  if (tier === "CYBER_DEFENSE_SYNTHETIC") return { estimatedCostUsd: 0.04, latencyBudgetMs: 4500 };
  return { estimatedCostUsd: 0.06, latencyBudgetMs: 6500 };
}

export function routeScrimedModelTask(input: {
  route: string;
  task: string;
  requestedProvider?: ScrimedModelProvider;
}): ScrimedModelRouteDecision {
  const taskClass = classifyTask(input.task);
  const tier = tierForTask(taskClass);
  const estimate = estimateForTier(tier);
  const safety = evaluateScrimedSafetyGate({
    route: input.route,
    requestedAction: input.task,
    inputText: input.task,
    allowMetadataOnly: true
  });
  const externalProviderRequested =
    Boolean(input.requestedProvider) && input.requestedProvider !== "synthetic-fallback";
  const cost = evaluateCostApiGuardrail({
    route: input.route,
    projectedCostUsd: estimate.estimatedCostUsd,
    projectedRequestsPerMinute: 1,
    externalProviderCallRequested: externalProviderRequested
  });
  const provider: ScrimedModelProvider = "synthetic-fallback";
  const adapter =
    modelProviderAdapters.find((candidate) => candidate.provider === provider) ??
    modelProviderAdapters[modelProviderAdapters.length - 1];
  const blockedBySafety = !safety.allowed;
  const blockedByCost = safety.allowed && !cost.allowed;

  return {
    service: "scrimed-model-agnostic-router",
    routerVersion: scrimedModelRouterVersion,
    taskClass,
    tier,
    provider,
    providerAdapterStatus: adapter.status,
    allowed: safety.allowed && cost.allowed,
    routeStatus: blockedBySafety
      ? "blocked-by-safety-policy"
      : blockedByCost
        ? "blocked-by-cost-guardrail"
        : "synthetic-fallback-selected",
    estimatedCostUsd: estimate.estimatedCostUsd,
    latencyBudgetMs: estimate.latencyBudgetMs,
    safetyPolicyVersion: safety.policyVersion,
    costGuardrailVersion: cost.guardrailVersion,
    rationale:
      "SCRIMED routes through a provider-neutral abstraction and uses the synthetic fallback provider until external provider calls, contracts, privacy review, model registry, and budget guardrails are approved."
  };
}

export function getModelRouterSummary() {
  const sampleRoutes = [
    routeScrimedModelTask({
      route: "/api/investor-readiness/status",
      task: "enterprise investor diligence synthetic summary"
    }),
    routeScrimedModelTask({
      route: "/api/clinical-robustness-lab",
      task: "clinical robustness synthetic guideline citation review"
    }),
    routeScrimedModelTask({
      route: "/api/model-router/protected-action",
      task: "diagnose real patient and write result to EHR"
    }),
    routeScrimedModelTask({
      route: "/api/model-router/external-provider",
      task: "enterprise reasoning synthetic demo",
      requestedProvider: "openai"
    })
  ];

  return {
    service: "scrimed-model-agnostic-router",
    routerVersion: scrimedModelRouterVersion,
    status: "synthetic-fallback-active-provider-calls-disabled-by-default",
    providers: modelProviderAdapters,
    sampleRoutes,
    costGuardrails: getCostApiGuardrailSummary(),
    noSecretTestMode: true,
    externalCallsEnabled: false,
    supportedTiers: [
      "FAST_LOW_COST",
      "ENTERPRISE_REASONING",
      "CLINICAL_REVIEW_SYNTHETIC",
      "CYBER_DEFENSE_SYNTHETIC",
      "RESEARCH_SIMULATION_SYNTHETIC"
    ],
    boundary:
      "Model routing is provider-neutral readiness infrastructure only. It does not call external models by default, route PHI, approve production model use, validate clinical accuracy, or create autonomous clinical authority."
  };
}
