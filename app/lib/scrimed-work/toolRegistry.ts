import { getScrimedWorkFeatureFlags } from "./featureFlags";
import type { ToolCategory, WorkAgentRole } from "./types";

export type ScrimedWorkTool = {
  toolId: string;
  name: string;
  category: ToolCategory;
  description: string;
  allowedAgents: WorkAgentRole[];
  enabled: boolean;
  approvalRequired: boolean;
  tenantIsolationRequired: boolean;
  noPhiByDefault: boolean;
  blockedReason?: string;
};

export function getScrimedWorkTools(): ScrimedWorkTool[] {
  const flags = getScrimedWorkFeatureFlags();

  return [
    {
      toolId: "context-search",
      name: "Context Search",
      category: "read-only",
      description: "Searches synthetic trusted context records with citations and tenant isolation metadata.",
      allowedAgents: ["coordinator", "clinical-context", "interoperability", "research", "verification", "reviewer"],
      enabled: flags.contextEngineEnabled,
      approvalRequired: false,
      tenantIsolationRequired: true,
      noPhiByDefault: true
    },
    {
      toolId: "artifact-draft",
      name: "Artifact Draft",
      category: "reversible-write",
      description: "Creates draft Markdown/JSON artifacts with verification metadata.",
      allowedAgents: ["artifact-writer", "executive-brief", "revenue-cycle", "research", "patient-access"],
      enabled: flags.artifactEngineEnabled,
      approvalRequired: true,
      tenantIsolationRequired: true,
      noPhiByDefault: true
    },
    {
      toolId: "approval-queue",
      name: "Approval Queue",
      category: "read-only",
      description: "Lists pending human approval checkpoints and review reasons.",
      allowedAgents: ["coordinator", "safety-policy", "reviewer", "verification"],
      enabled: true,
      approvalRequired: false,
      tenantIsolationRequired: true,
      noPhiByDefault: true
    },
    {
      toolId: "external-message-send",
      name: "External Message Send",
      category: "external-communication",
      description: "External communication placeholder. Disabled until future authorization.",
      allowedAgents: ["coordinator"],
      enabled: false,
      approvalRequired: true,
      tenantIsolationRequired: true,
      noPhiByDefault: true,
      blockedReason: "External communications are disabled by default and require human review plus production approval."
    },
    {
      toolId: "ehr-writeback",
      name: "EHR Writeback",
      category: "clinical",
      description: "EHR writeback placeholder. Disabled until future connector approval.",
      allowedAgents: ["clinical-context", "interoperability"],
      enabled: false,
      approvalRequired: true,
      tenantIsolationRequired: true,
      noPhiByDefault: true,
      blockedReason: "EHR writeback is not authorized."
    },
    {
      toolId: "payer-submission",
      name: "Payer Submission",
      category: "financial",
      description: "Payer submission placeholder. Disabled until future approval.",
      allowedAgents: ["revenue-cycle"],
      enabled: false,
      approvalRequired: true,
      tenantIsolationRequired: true,
      noPhiByDefault: true,
      blockedReason: "Autonomous payer submission is not authorized."
    },
    {
      toolId: "schedule-job",
      name: "Schedule Job",
      category: "scheduling",
      description: "Scheduled-work registration placeholder. Disabled unless schedules are explicitly enabled.",
      allowedAgents: ["coordinator", "executive-brief"],
      enabled: flags.schedulesEnabled,
      approvalRequired: true,
      tenantIsolationRequired: true,
      noPhiByDefault: true,
      blockedReason: flags.schedulesEnabled ? undefined : "Schedules are disabled by default."
    }
  ];
}

export function authorizeToolAccess(input: {
  toolId: string;
  agentRole: WorkAgentRole;
  consequentialActionsEnabled?: boolean;
}) {
  const tool = getScrimedWorkTools().find((candidate) => candidate.toolId === input.toolId);

  if (!tool) {
    return { decision: "deny" as const, reason: "Unknown tool." };
  }

  if (!tool.allowedAgents.includes(input.agentRole)) {
    return { decision: "deny" as const, reason: "Agent role is not permitted to access this tool." };
  }

  if (!tool.enabled) {
    return { decision: "deny" as const, reason: tool.blockedReason ?? "Tool is disabled by policy." };
  }

  if (
    ["consequential-write", "external-communication", "clinical", "financial", "identity", "scheduling"].includes(tool.category) &&
    !input.consequentialActionsEnabled
  ) {
    return { decision: "require_human_approval" as const, reason: "Consequential tool requires approval and remains disabled by default." };
  }

  return {
    decision: tool.approvalRequired ? ("require_human_approval" as const) : ("allow" as const),
    reason: tool.approvalRequired ? "Tool access is gated by human approval." : "Tool access is read-only and policy-permitted."
  };
}
