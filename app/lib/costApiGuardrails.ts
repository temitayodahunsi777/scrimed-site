export type CostGuardrailDecision = {
  allowed: boolean;
  status: "allowed" | "blocked";
  guardrailVersion: string;
  providerCallsEnabled: boolean;
  costGuardrailsEnabled: boolean;
  maxSyntheticRequestsPerMinute: number;
  route: string;
  projectedCostUsd: number;
  projectedRequestsPerMinute: number;
  suspiciousUsageDetected: boolean;
  reason: string;
};

export const costApiGuardrailVersion = "scrimed-cost-api-guardrails-v2026-06-29";

function envBoolean(name: string, fallback: boolean) {
  const value = process.env[name];

  if (!value) return fallback;
  return value.toLowerCase() === "true";
}

function envNumber(name: string, fallback: number) {
  const value = process.env[name];
  const parsed = value ? Number(value) : NaN;

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getCostGuardrailConfig() {
  return {
    providerCallsEnabled: envBoolean("SCRIMED_AI_PROVIDER_CALLS_ENABLED", false),
    costGuardrailsEnabled: envBoolean("SCRIMED_COST_GUARDRAILS_ENABLED", true),
    maxSyntheticRequestsPerMinute: envNumber("SCRIMED_MAX_SYNTHETIC_REQUESTS_PER_MINUTE", 60),
    maxEstimatedCostUsdPerRequest: envNumber("SCRIMED_MAX_ESTIMATED_AI_COST_USD", 0.25)
  };
}

export function evaluateCostApiGuardrail(input: {
  route: string;
  projectedCostUsd: number;
  projectedRequestsPerMinute?: number;
  externalProviderCallRequested?: boolean;
}): CostGuardrailDecision {
  const config = getCostGuardrailConfig();
  const projectedRequestsPerMinute = input.projectedRequestsPerMinute ?? 1;
  const invalidProjection =
    !Number.isFinite(input.projectedCostUsd) ||
    input.projectedCostUsd < 0 ||
    !Number.isFinite(projectedRequestsPerMinute) ||
    projectedRequestsPerMinute < 0;
  const suspiciousUsageDetected =
    invalidProjection ||
    projectedRequestsPerMinute > config.maxSyntheticRequestsPerMinute ||
    input.projectedCostUsd > config.maxEstimatedCostUsdPerRequest;
  const blockedByProviderKillSwitch =
    Boolean(input.externalProviderCallRequested) && !config.providerCallsEnabled;
  const blocked =
    blockedByProviderKillSwitch ||
    (config.costGuardrailsEnabled && suspiciousUsageDetected);

  return {
    allowed: !blocked,
    status: blocked ? "blocked" : "allowed",
    guardrailVersion: costApiGuardrailVersion,
    providerCallsEnabled: config.providerCallsEnabled,
    costGuardrailsEnabled: config.costGuardrailsEnabled,
    maxSyntheticRequestsPerMinute: config.maxSyntheticRequestsPerMinute,
    route: input.route,
    projectedCostUsd: input.projectedCostUsd,
    projectedRequestsPerMinute,
    suspiciousUsageDetected,
    reason: invalidProjection
      ? "Projected usage metadata is invalid and failed closed."
      : blockedByProviderKillSwitch
      ? "External AI provider calls are disabled by default for SCRIMED."
      : suspiciousUsageDetected
        ? "Projected usage exceeds SCRIMED synthetic request or cost guardrail thresholds."
        : "Projected usage remains inside SCRIMED synthetic no-secret guardrails."
  };
}

export function costGuardrailHeaders(decision?: CostGuardrailDecision) {
  const config = getCostGuardrailConfig();

  return {
    "X-SCRIMED-Cost-Guardrails": costApiGuardrailVersion,
    "X-SCRIMED-AI-Provider-Calls": config.providerCallsEnabled ? "enabled" : "disabled",
    "X-SCRIMED-Cost-Guardrails-Enabled": config.costGuardrailsEnabled ? "true" : "false",
    "X-SCRIMED-Max-Synthetic-Requests-Per-Minute": String(config.maxSyntheticRequestsPerMinute),
    ...(decision
      ? {
          "X-SCRIMED-Cost-Guardrail-Decision": decision.status,
          "X-SCRIMED-Projected-Cost-USD": String(decision.projectedCostUsd)
        }
      : {})
  };
}

export function getCostApiGuardrailSummary() {
  const safeSyntheticDecision = evaluateCostApiGuardrail({
    route: "/api/investor-readiness/status",
    projectedCostUsd: 0.01,
    projectedRequestsPerMinute: 1,
    externalProviderCallRequested: false
  });
  const blockedExternalDecision = evaluateCostApiGuardrail({
    route: "/api/model-router/future-provider",
    projectedCostUsd: 0.01,
    projectedRequestsPerMinute: 1,
    externalProviderCallRequested: true
  });

  return {
    service: "scrimed-cost-api-guardrails",
    version: costApiGuardrailVersion,
    config: getCostGuardrailConfig(),
    safeSyntheticDecision,
    blockedExternalDecision,
    failClosedVerified: safeSyntheticDecision.allowed && !blockedExternalDecision.allowed,
    abuseDetectors: [
      "provider-call kill switch",
      "synthetic requests per minute threshold",
      "estimated per-request cost threshold",
      "suspicious usage placeholder",
      "safe error messages"
    ]
  };
}
