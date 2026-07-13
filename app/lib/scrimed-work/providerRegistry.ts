import type { DataClassification, ProviderRoutingClass } from "./types";

export type ScrimedWorkProvider = {
  providerId: string;
  modelId: string;
  label: string;
  routingClass: ProviderRoutingClass;
  capabilities: ProviderRoutingClass[];
  contextLimit: number;
  dataResidency: "us" | "customer-region" | "local-only" | "configurable";
  phiEligible: boolean;
  toolCalling: boolean;
  multimodal: boolean;
  structuredOutput: boolean;
  estimatedInputCostUsdPer1k: number;
  estimatedOutputCostUsdPer1k: number;
  observedLatencyMs: number;
  availability: "available" | "unavailable_missing_secret" | "disabled_by_policy" | "future_adapter";
  healthStatus: "healthy" | "degraded" | "unavailable";
  policyTags: string[];
};

export const scrimedWorkProviderRegistry: ScrimedWorkProvider[] = [
  {
    providerId: "synthetic-fallback",
    modelId: "scrimed-synthetic-no-call",
    label: "SCRIMED synthetic no-call provider",
    routingClass: "balanced",
    capabilities: ["fast", "balanced", "reasoning", "coding", "embedding", "reranking"],
    contextLimit: 32_000,
    dataResidency: "us",
    phiEligible: false,
    toolCalling: false,
    multimodal: false,
    structuredOutput: true,
    estimatedInputCostUsdPer1k: 0,
    estimatedOutputCostUsdPer1k: 0,
    observedLatencyMs: 50,
    availability: "available",
    healthStatus: "healthy",
    policyTags: ["no-external-call", "no-secret-required", "synthetic-only"]
  },
  {
    providerId: "openai-compatible",
    modelId: "configured-openai-compatible-model",
    label: "OpenAI-compatible adapter",
    routingClass: "reasoning",
    capabilities: ["fast", "balanced", "reasoning", "coding", "vision", "voice", "embedding"],
    contextLimit: 128_000,
    dataResidency: "configurable",
    phiEligible: false,
    toolCalling: true,
    multimodal: true,
    structuredOutput: true,
    estimatedInputCostUsdPer1k: 0.005,
    estimatedOutputCostUsdPer1k: 0.02,
    observedLatencyMs: 2_500,
    availability: process.env.SCRIMED_OPENAI_COMPATIBLE_API_KEY ? "disabled_by_policy" : "unavailable_missing_secret",
    healthStatus: "unavailable",
    policyTags: ["requires-contract-review", "requires-privacy-review", "provider-calls-disabled-by-default"]
  },
  {
    providerId: "anthropic-compatible",
    modelId: "configured-anthropic-compatible-model",
    label: "Anthropic-compatible adapter",
    routingClass: "reasoning",
    capabilities: ["balanced", "reasoning", "coding"],
    contextLimit: 200_000,
    dataResidency: "configurable",
    phiEligible: false,
    toolCalling: true,
    multimodal: false,
    structuredOutput: true,
    estimatedInputCostUsdPer1k: 0.006,
    estimatedOutputCostUsdPer1k: 0.025,
    observedLatencyMs: 3_000,
    availability: process.env.SCRIMED_ANTHROPIC_COMPATIBLE_API_KEY ? "disabled_by_policy" : "unavailable_missing_secret",
    healthStatus: "unavailable",
    policyTags: ["requires-contract-review", "requires-privacy-review", "provider-calls-disabled-by-default"]
  },
  {
    providerId: "local-private",
    modelId: "customer-approved-local-private-model",
    label: "Local/private model adapter",
    routingClass: "local-private",
    capabilities: ["fast", "balanced", "reasoning", "vision", "voice", "embedding", "reranking", "local-private"],
    contextLimit: 64_000,
    dataResidency: "local-only",
    phiEligible: true,
    toolCalling: true,
    multimodal: true,
    structuredOutput: true,
    estimatedInputCostUsdPer1k: 0.001,
    estimatedOutputCostUsdPer1k: 0.002,
    observedLatencyMs: 1_800,
    availability: "future_adapter",
    healthStatus: "unavailable",
    policyTags: ["private-inference-roadmap", "customer-vpc-or-edge", "requires-local-deployment"]
  }
];

export function selectProviderCandidates(input: {
  requiredCapability: ProviderRoutingClass;
  dataClassification: DataClassification;
  residencyRequirement?: "us" | "customer-region" | "local-only";
}) {
  return scrimedWorkProviderRegistry.filter((provider) => {
    const capabilityOk = provider.capabilities.includes(input.requiredCapability);
    const residencyOk =
      !input.residencyRequirement ||
      provider.dataResidency === input.residencyRequirement ||
      provider.dataResidency === "configurable";
    const phiOk = input.dataClassification !== "phi-blocked" || provider.phiEligible;

    return capabilityOk && residencyOk && phiOk;
  });
}
