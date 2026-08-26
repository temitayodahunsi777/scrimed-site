import { createClinicalEvidenceHash } from "../clinicalEvidenceControls";
import type {
  AgentResultEnvelope,
  AgentRouteCandidate,
  AgentTaskEnvelope,
  LocalWorkerAdmission
} from "./types";

export const p33PortableAgentContractVersion =
  "scrimed-p33-portable-agent-contract-v1-2026-08-13";
export const p33LocalWorkerPolicyVersion =
  "scrimed-p33-local-worker-policy-v1-2026-08-13";

export const p33AgentPortabilityBoundary =
  "Portable agent contracts route synthetic or public tasks through qualified, capability-scoped candidates. They do not enable provider calls, live PHI, ambient credentials, unrestricted network or filesystem access, hidden model substitution, autonomous clinical action, or self-authorized escalation.";

const riskRank = { low: 0, moderate: 1, high: 2, prohibited: 3 } as const;

function canonical(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

function validateBudgets(envelope: AgentTaskEnvelope) {
  const values = Object.values(envelope.budgets);
  return values.every((value) => Number.isFinite(value) && value > 0) &&
    envelope.budgets.maximumTurns <= 24 &&
    envelope.budgets.maximumDurationMs <= 15 * 60_000 &&
    envelope.budgets.maximumCostUsd <= 25;
}

export function routePortableAgentTask(
  envelope: AgentTaskEnvelope,
  candidates: AgentRouteCandidate[]
): AgentResultEnvelope {
  const safetyFlags: string[] = [];
  if (envelope.riskLevel === "prohibited") safetyFlags.push("PROHIBITED_TASK_RISK");
  if (envelope.dataClassification === "phi-prohibited") safetyFlags.push("PHI_INPUT_PROHIBITED");
  if (!validateBudgets(envelope)) safetyFlags.push("TASK_BUDGET_INVALID_OR_EXCESSIVE");
  if (envelope.riskLevel === "high" && envelope.approvalPolicy !== "qualified-human") {
    safetyFlags.push("HIGH_RISK_REQUIRES_QUALIFIED_HUMAN_POLICY");
  }
  if (envelope.networkDestinations.some((destination) => destination === "*" || destination === "internet")) {
    safetyFlags.push("UNBOUNDED_NETWORK_DESTINATION");
  }
  if (envelope.filesystemRoots.some((root) => root === "/" || root.includes(".."))) {
    safetyFlags.push("UNBOUNDED_FILESYSTEM_SCOPE");
  }

  const eligible = safetyFlags.length
    ? []
    : candidates.filter((candidate) =>
        candidate.available &&
        candidate.featureEnabled &&
        candidate.externalEvidenceVerified &&
        riskRank[candidate.qualifiedRiskCeiling] >= riskRank[envelope.riskLevel] &&
        envelope.requiredCapabilities.every((capability) =>
          candidate.qualifiedCapabilities.includes(capability)
        ) &&
        candidate.locality.includes(envelope.dataLocality) &&
        candidate.estimatedTaskCostUsd <= envelope.budgets.maximumCostUsd
      );

  const ranked = eligible
    .map((candidate) => ({
      candidate,
      score:
        candidate.taskFit * 0.3 +
        candidate.toolReliability * 0.2 +
        candidate.groundedness * 0.25 +
        Math.max(0, 1 - candidate.latencyMs / envelope.budgets.maximumDurationMs) * 0.1 +
        Math.max(0, 1 - candidate.estimatedTaskCostUsd / envelope.budgets.maximumCostUsd) * 0.15
    }))
    .sort((left, right) => right.score - left.score || left.candidate.routeId.localeCompare(right.candidate.routeId));

  const selected = ranked[0]?.candidate ?? null;
  if (!selected) safetyFlags.push("NO_QUALIFIED_ROUTE");
  const humanReviewRequired =
    envelope.approvalPolicy !== "none" ||
    envelope.riskLevel === "moderate" ||
    envelope.riskLevel === "high";
  const status = selected
    ? humanReviewRequired
      ? "review-required" as const
      : "completed" as const
    : safetyFlags.includes("PROHIBITED_TASK_RISK") || safetyFlags.includes("PHI_INPUT_PROHIBITED")
      ? "blocked" as const
      : "safe-refusal" as const;
  return {
    envelopeId: envelope.envelopeId,
    routeId: selected?.routeId ?? null,
    status,
    resultHash: selected
      ? createClinicalEvidenceHash({
          type: "p33-portable-agent-route",
          envelopeId: envelope.envelopeId,
          selectedRoute: selected.routeId,
          reasoningDepth: envelope.reasoningDepth
        })
      : null,
    safetyFlags: canonical(safetyFlags),
    missingInformation: selected ? [] : ["Qualified route satisfying all capability, risk, locality, availability, and budget gates"],
    evidenceReferences: envelope.evidenceRequirements,
    humanReviewRequired,
    routingRationale: selected
      ? [
          "candidate passed capability, risk, locality, evidence, availability, and budget gates",
          "selected by task fit, groundedness, tool reliability, latency, and total task cost",
          `reasoning depth: ${envelope.reasoningDepth}`,
          "provider call remains disabled in the local candidate"
        ]
      : ["no candidate passed every noncompensable gate; safe refusal returned"],
    providerCallExecuted: false
  };
}

export function evaluateLocalWorkerAdmission(input: {
  envelope: AgentTaskEnvelope;
  approvedFilesystemRoots: string[];
  approvedToolIds: string[];
  workloadIdentityPresent: boolean;
  capabilityLeaseActive: boolean;
  sandboxAvailable: boolean;
  resourceLimitsConfigured: boolean;
  killSwitchArmed: boolean;
  networkPolicy: "deny" | "allowlisted" | "open";
  confidentialComputeCapability: LocalWorkerAdmission["confidentialComputeCapability"];
}): LocalWorkerAdmission {
  const reasonCodes: string[] = [];
  if (!input.workloadIdentityPresent) reasonCodes.push("WORKLOAD_IDENTITY_REQUIRED");
  if (!input.capabilityLeaseActive) reasonCodes.push("CAPABILITY_LEASE_INACTIVE");
  if (!input.sandboxAvailable) reasonCodes.push("SANDBOX_REQUIRED");
  if (!input.resourceLimitsConfigured || !validateBudgets(input.envelope)) {
    reasonCodes.push("RESOURCE_LIMITS_REQUIRED");
  }
  if (!input.killSwitchArmed) reasonCodes.push("KILL_SWITCH_NOT_ARMED");
  if (input.networkPolicy === "open") reasonCodes.push("OPEN_NETWORK_POLICY_PROHIBITED");
  if (
    input.envelope.filesystemRoots.some(
      (root) => !input.approvedFilesystemRoots.includes(root)
    )
  ) {
    reasonCodes.push("FILESYSTEM_SCOPE_NOT_APPROVED");
  }
  if (
    input.envelope.toolSchemaIds.some(
      (toolId) => !input.approvedToolIds.includes(toolId)
    )
  ) {
    reasonCodes.push("TOOL_NOT_ALLOWLISTED");
  }
  if (input.envelope.dataClassification !== "synthetic-no-phi" && input.envelope.dataClassification !== "public") {
    reasonCodes.push("LOCAL_WORKER_RESTRICTED_TO_SYNTHETIC_OR_PUBLIC_DATA");
  }
  const decision = reasonCodes.some((reason) =>
    [
      "OPEN_NETWORK_POLICY_PROHIBITED",
      "FILESYSTEM_SCOPE_NOT_APPROVED",
      "TOOL_NOT_ALLOWLISTED",
      "LOCAL_WORKER_RESTRICTED_TO_SYNTHETIC_OR_PUBLIC_DATA"
    ].includes(reason)
  )
    ? "BLOCK" as const
    : reasonCodes.length
      ? "REQUIRE_HUMAN" as const
      : "ALLOW" as const;
  const payload = {
    decision,
    reasonCodes: canonical(reasonCodes),
    sandboxRequired: true as const,
    networkDefault: "deny" as const,
    approvedFilesystemRoots: canonical(input.approvedFilesystemRoots),
    approvedToolIds: canonical(input.approvedToolIds),
    resourceLimitsEnforced: input.resourceLimitsConfigured,
    killSwitchArmed: input.killSwitchArmed,
    confidentialComputeCapability: input.confidentialComputeCapability,
    providerCallExecuted: false as const
  };
  return {
    ...payload,
    admissionHash: createClinicalEvidenceHash({
      type: "p33-local-worker-admission",
      version: p33LocalWorkerPolicyVersion,
      envelope: input.envelope,
      payload
    })
  };
}

export function applyEmergencyRevocation(input: {
  killSwitchActive: boolean;
  activeCapabilityLeaseIds: string[];
  activeTaskEnvelopeIds: string[];
  reason: string;
}) {
  if (!input.killSwitchActive) {
    return {
      status: "monitoring",
      newActionsAllowed: true,
      revokedLeaseIds: [] as string[],
      cancelledTaskIds: [] as string[],
      receiptHash: createClinicalEvidenceHash({ type: "p33-kill-switch-monitoring", input })
    };
  }
  if (!input.reason.trim()) throw new Error("Emergency revocation requires a reason");
  return {
    status: "emergency-revocation-active",
    newActionsAllowed: false,
    revokedLeaseIds: canonical(input.activeCapabilityLeaseIds),
    cancelledTaskIds: canonical(input.activeTaskEnvelopeIds),
    receiptHash: createClinicalEvidenceHash({ type: "p33-emergency-revocation", input })
  };
}

export const p33SyntheticRouteCandidates: AgentRouteCandidate[] = [
  {
    routeId: "route-deterministic-context",
    providerId: "synthetic-fallback",
    modelId: "deterministic-policy-fixture-v1",
    harnessId: "scrimed-context-harness-v1",
    qualifiedCapabilities: ["structured-output", "citation-preservation", "synthetic-context"],
    qualifiedRiskCeiling: "high",
    locality: ["local-only", "approved-region", "public-anywhere"],
    toolReliability: 1,
    groundedness: 1,
    taskFit: 0.92,
    latencyMs: 15,
    estimatedTaskCostUsd: 0,
    cacheEligible: true,
    available: true,
    featureEnabled: true,
    externalEvidenceVerified: true
  },
  {
    routeId: "route-configured-cloud-disabled",
    providerId: "configured-provider",
    modelId: "configured-at-runtime",
    harnessId: "scrimed-provider-harness-v1",
    qualifiedCapabilities: ["structured-output", "tool-calling"],
    qualifiedRiskCeiling: "moderate",
    locality: ["approved-region", "public-anywhere"],
    toolReliability: 0.9,
    groundedness: 0.88,
    taskFit: 0.9,
    latencyMs: 1_200,
    estimatedTaskCostUsd: 0.08,
    cacheEligible: false,
    available: false,
    featureEnabled: false,
    externalEvidenceVerified: false
  }
];

export function createSyntheticAgentTaskEnvelope(): AgentTaskEnvelope {
  return {
    envelopeId: "task-p33-context-compression",
    tenantId: "synthetic-tenant",
    actorId: "agent-commander",
    taskClass: "synthetic-context-compression",
    riskLevel: "high",
    requiredCapabilities: ["structured-output", "citation-preservation", "synthetic-context"],
    toolSchemaIds: ["context-fabric-read", "clinical-extraction-gate"],
    filesystemRoots: ["/workspace/synthetic-fixtures"],
    networkDestinations: [],
    dataLocality: "local-only",
    dataClassification: "synthetic-no-phi",
    approvalPolicy: "qualified-human",
    reasoningDepth: "standard",
    budgets: {
      maximumDurationMs: 30_000,
      maximumInputTokens: 8_000,
      maximumOutputTokens: 2_000,
      maximumCostUsd: 0.25,
      maximumCpuMs: 15_000,
      maximumMemoryBytes: 512 * 1024 * 1024,
      maximumTurns: 6
    },
    evidenceRequirements: ["source-span-citations", "policy-version", "qualified-review"],
    citationRequired: true
  };
}

export function getP33AgentPortabilitySummary() {
  const envelope = createSyntheticAgentTaskEnvelope();
  return {
    contractVersion: p33PortableAgentContractVersion,
    localWorkerPolicyVersion: p33LocalWorkerPolicyVersion,
    envelope,
    routeDecision: routePortableAgentTask(envelope, p33SyntheticRouteCandidates),
    localWorkerAdmission: evaluateLocalWorkerAdmission({
      envelope,
      approvedFilesystemRoots: ["/workspace/synthetic-fixtures"],
      approvedToolIds: ["context-fabric-read", "clinical-extraction-gate"],
      workloadIdentityPresent: true,
      capabilityLeaseActive: true,
      sandboxAvailable: true,
      resourceLimitsConfigured: true,
      killSwitchArmed: true,
      networkPolicy: "deny",
      confidentialComputeCapability: "not-present"
    }),
    emergencyStop: applyEmergencyRevocation({
      killSwitchActive: false,
      activeCapabilityLeaseIds: ["lease-synthetic-p33"],
      activeTaskEnvelopeIds: [envelope.envelopeId],
      reason: "synthetic monitoring fixture"
    }),
    candidates: p33SyntheticRouteCandidates,
    boundary: p33AgentPortabilityBoundary
  };
}
