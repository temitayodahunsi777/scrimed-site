import { createAuditHash } from "./audit";
import { scrimedWorkAgents } from "./agentRegistry";
import { getScrimedWorkFeatureFlags } from "./featureFlags";
import { routeScrimedWorkModel } from "./modelRouter";
import { authorizeToolAccess } from "./toolRegistry";
import type { PlannedStep, ToolCallRecord, WorkAgentRole, WorkSession } from "./types";

const defaultPlan: Array<{ title: string; assignedAgent: WorkAgentRole; dependsOn: string[]; requiresApproval: boolean }> = [
  { title: "Confirm Definition of Done and retained safety boundary", assignedAgent: "safety-policy", dependsOn: [], requiresApproval: false },
  { title: "Retrieve trusted context and citations", assignedAgent: "clinical-context", dependsOn: ["step_1"], requiresApproval: false },
  { title: "Prepare draft artifact from verified evidence", assignedAgent: "artifact-writer", dependsOn: ["step_2"], requiresApproval: true },
  { title: "Run verification checks and loop guard", assignedAgent: "verification", dependsOn: ["step_3"], requiresApproval: false },
  { title: "Queue human review for consequential or high-risk output", assignedAgent: "reviewer", dependsOn: ["step_4"], requiresApproval: true }
];

export function buildAgentPlan(session: WorkSession): PlannedStep[] {
  return defaultPlan.slice(0, Math.min(session.definitionOfDone.maximumSteps, defaultPlan.length)).map((step, index) => {
    const stepId = `step_${index + 1}`;

    return {
      stepId,
      title: step.title,
      assignedAgent: step.assignedAgent,
      dependsOn: step.dependsOn,
      deadlineMs: Math.min(session.definitionOfDone.timeoutMs, 120_000),
      status: index === 0 ? "completed" : "pending",
      requiresApproval: step.requiresApproval || session.riskLevel === "high",
      auditHash: createAuditHash({ sessionId: session.id, stepId, title: step.title })
    };
  });
}

export function buildToolCallPlan(session: WorkSession): ToolCallRecord[] {
  const flags = getScrimedWorkFeatureFlags();
  const relevantTools = [
    { toolId: "context-search", agentRole: "clinical-context" as WorkAgentRole, category: "read-only" as const },
    { toolId: "artifact-draft", agentRole: "artifact-writer" as WorkAgentRole, category: "reversible-write" as const },
    { toolId: "approval-queue", agentRole: "reviewer" as WorkAgentRole, category: "read-only" as const },
    { toolId: "ehr-writeback", agentRole: "interoperability" as WorkAgentRole, category: "clinical" as const },
    { toolId: "payer-submission", agentRole: "revenue-cycle" as WorkAgentRole, category: "financial" as const }
  ];

  return relevantTools.map((tool, index) => {
    const authorization = authorizeToolAccess({
      toolId: tool.toolId,
      agentRole: tool.agentRole,
      consequentialActionsEnabled: flags.consequentialActionsEnabled
    });

    return {
      toolCallId: `tool_call_${index + 1}`,
      toolId: tool.toolId,
      category: tool.category,
      status:
        authorization.decision === "allow"
          ? "planned"
          : authorization.decision === "require_human_approval"
            ? "approval_required"
            : "blocked",
      idempotencyKey: `idem_${createAuditHash({ sessionId: session.id, tool: tool.toolId }).slice(0, 16)}`,
      policyDecision: authorization.decision,
      reason: authorization.reason,
      auditHash: createAuditHash({ sessionId: session.id, tool: tool.toolId, decision: authorization.decision })
    };
  });
}

export function previewOrchestration(session: WorkSession) {
  const modelRoute = routeScrimedWorkModel({
    taskType: session.objective,
    risk: session.riskLevel,
    requiredCapability: session.riskLevel === "high" ? "reasoning" : "balanced",
    dataClassification: session.inputClassification,
    latencyTargetMs: 5_000,
    budgetUsd: session.definitionOfDone.maximumEstimatedCostUsd,
    tenantPolicy: session.definitionOfDone.allowedScope.join(" "),
    reasoningRequirement: session.riskLevel === "high" ? "high" : "medium",
    qualityThreshold: 0.85
  });

  return {
    protocol: "scrimed-internal-agent-envelope-v1",
    plannerPattern: "planner-specialist-verifier",
    multiAgentEnabled: getScrimedWorkFeatureFlags().multiAgentEnabled,
    agents: scrimedWorkAgents.map((agent) => ({
      agentId: agent.agentId,
      role: agent.role,
      leastPrivilegeScope: agent.leastPrivilegeScope
    })),
    plannedSteps: buildAgentPlan(session),
    toolCalls: buildToolCallPlan(session),
    selectedModel: modelRoute,
    envelopeExample: {
      protocolVersion: "scrimed-a2a-envelope-v1",
      messageId: `msg_${createAuditHash({ sessionId: session.id, intent: "verify" }).slice(0, 12)}`,
      sessionId: session.id,
      senderAgent: "work-coordinator",
      recipientAgent: "verification-agent",
      intent: "verify_artifact_against_definition_of_done",
      payload: { metadataOnly: true, noPhi: true },
      requiredCapabilities: ["schema_validation", "citation_check", "policy_check"],
      policyContext: session.definitionOfDone.prohibitedActions,
      correlationId: `corr_${session.id}`,
      traceId: `trace_${session.id}`,
      expiresAt: "2026-07-09T01:00:00.000Z",
      integrity: createAuditHash({ sessionId: session.id, protocol: "scrimed-a2a-envelope-v1" })
    }
  };
}
