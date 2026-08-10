import { createAuditHash } from "./audit";
import { scrimedWorkAgents } from "./agentRegistry";
import type { ActorIdentity } from "./types";

export const scrimedAgentTeamPolicyVersion = "scrimed-agent-teams-v1-2026-08-01";

export type AgentTeamRole =
  | "planner"
  | "researcher"
  | "implementer"
  | "reviewer"
  | "security-reviewer"
  | "claims-evidence-reviewer"
  | "test-executor"
  | "release-verifier";

export type AgentTeamAssignment = {
  teamRole: AgentTeamRole;
  agentId: string;
  mayApproveOwnOutput: false;
};

export type AgentTeamTemplate = {
  templateId: string;
  title: string;
  purpose: string;
  assignments: AgentTeamAssignment[];
  requiredEvidence: string[];
  prohibitedActions: string[];
  maximumDelegationDepth: number;
  maximumRetriesPerStep: number;
  costCeilingUsd: number;
  runtimeCeilingMs: number;
  actionCeiling: number;
  toolAllowlist: string[];
  networkAllowlist: string[];
  safeStopConditions: string[];
  auditTrailRequired: true;
  idempotencyRequired: true;
  circuitBreaker: {
    failureThreshold: number;
    cooldownMs: number;
  };
  untrustedContentPolicy: "data-only-never-instructions";
  independentReviewerIdentityRequired: true;
  outputLaunderingBlocked: true;
  consequentialOutputRequiresIndependentReview: true;
  unresolvedConflictAction: "escalate-to-human";
  humanApprovalGateway: {
    required: true;
    role: ActorIdentity["role"];
    agentMaySatisfyGateway: false;
  };
  syntheticPreparationEnabled: true;
  externalExecutionAllowed: false;
  clinicalAuthorityGranted: false;
  releaseAuthorityGranted: false;
  templateHash: string;
};

type AgentTeamTemplateInput = Omit<AgentTeamTemplate, "templateHash">;

const requiredRoles: AgentTeamRole[] = ["planner", "implementer", "reviewer", "release-verifier"];

export function createAgentTeamTemplate(input: AgentTeamTemplateInput): AgentTeamTemplate {
  const assignments = [...input.assignments].sort((left, right) =>
    left.teamRole.localeCompare(right.teamRole)
  );
  const roleSet = new Set(assignments.map((assignment) => assignment.teamRole));

  for (const requiredRole of requiredRoles) {
    if (!roleSet.has(requiredRole)) {
      throw new Error(`Agent team template requires ${requiredRole}.`);
    }
  }

  for (const assignment of assignments) {
    if (!scrimedWorkAgents.some((agent) => agent.agentId === assignment.agentId)) {
      throw new Error(`Agent team assignment references unknown agent ${assignment.agentId}.`);
    }
    if (assignment.mayApproveOwnOutput !== false) {
      throw new Error("Agent team members cannot approve their own output.");
    }
  }

  const implementer = assignments.find((assignment) => assignment.teamRole === "implementer");
  const reviewer = assignments.find((assignment) => assignment.teamRole === "reviewer");
  const releaseVerifier = assignments.find(
    (assignment) => assignment.teamRole === "release-verifier"
  );

  if (
    !implementer ||
    !reviewer ||
    !releaseVerifier ||
    implementer.agentId === reviewer.agentId ||
    implementer.agentId === releaseVerifier.agentId
  ) {
    throw new Error("Agent team implementation and review identities must be independent.");
  }

  if (
    input.maximumDelegationDepth < 1 ||
    input.maximumDelegationDepth > 3 ||
    input.maximumRetriesPerStep < 0 ||
    input.maximumRetriesPerStep > 2
  ) {
    throw new Error("Agent team delegation or retry budget exceeds the governed bound.");
  }

  if (
    !Number.isFinite(input.costCeilingUsd) ||
    input.costCeilingUsd <= 0 ||
    input.costCeilingUsd > 25 ||
    !Number.isInteger(input.runtimeCeilingMs) ||
    input.runtimeCeilingMs < 1_000 ||
    input.runtimeCeilingMs > 15 * 60 * 1_000 ||
    !Number.isInteger(input.actionCeiling) ||
    input.actionCeiling < 1 ||
    input.actionCeiling > 50 ||
    !Number.isInteger(input.circuitBreaker.failureThreshold) ||
    input.circuitBreaker.failureThreshold < 1 ||
    input.circuitBreaker.failureThreshold > 3 ||
    !Number.isInteger(input.circuitBreaker.cooldownMs) ||
    input.circuitBreaker.cooldownMs < 1_000
  ) {
    throw new Error("Agent team cost, runtime, action, or circuit-breaker bounds are invalid.");
  }

  if (
    input.humanApprovalGateway.required !== true ||
    input.humanApprovalGateway.agentMaySatisfyGateway !== false ||
    input.consequentialOutputRequiresIndependentReview !== true ||
    input.unresolvedConflictAction !== "escalate-to-human" ||
    input.externalExecutionAllowed !== false ||
    input.clinicalAuthorityGranted !== false ||
    input.releaseAuthorityGranted !== false ||
    input.auditTrailRequired !== true ||
    input.idempotencyRequired !== true ||
    input.untrustedContentPolicy !== "data-only-never-instructions" ||
    input.independentReviewerIdentityRequired !== true ||
    input.outputLaunderingBlocked !== true
  ) {
    throw new Error("Agent team template attempted to weaken independent review or retained authority.");
  }

  if (
    !input.requiredEvidence.length ||
    !input.prohibitedActions.length ||
    !input.toolAllowlist.length ||
    !input.safeStopConditions.length
  ) {
    throw new Error(
      "Agent team template requires evidence, tools, stop conditions, and prohibited actions."
    );
  }

  const base = {
    ...input,
    assignments,
    requiredEvidence: [...new Set(input.requiredEvidence)].sort(),
    prohibitedActions: [...new Set(input.prohibitedActions)].sort(),
    toolAllowlist: [...new Set(input.toolAllowlist)].sort(),
    networkAllowlist: [...new Set(input.networkAllowlist)].sort(),
    safeStopConditions: [...new Set(input.safeStopConditions)].sort()
  };

  return {
    ...base,
    templateHash: createAuditHash({
      type: "scrimed-agent-team-template",
      policyVersion: scrimedAgentTeamPolicyVersion,
      base
    })
  };
}

const sharedAssignments = (implementerAgentId: string): AgentTeamAssignment[] => [
  { teamRole: "planner", agentId: "work-coordinator", mayApproveOwnOutput: false },
  { teamRole: "researcher", agentId: "research-agent", mayApproveOwnOutput: false },
  { teamRole: "implementer", agentId: implementerAgentId, mayApproveOwnOutput: false },
  { teamRole: "reviewer", agentId: "reviewer-agent", mayApproveOwnOutput: false },
  { teamRole: "security-reviewer", agentId: "safety-policy-agent", mayApproveOwnOutput: false },
  {
    teamRole: "claims-evidence-reviewer",
    agentId: "verification-agent",
    mayApproveOwnOutput: false
  },
  { teamRole: "test-executor", agentId: "verification-agent", mayApproveOwnOutput: false },
  { teamRole: "release-verifier", agentId: "verification-agent", mayApproveOwnOutput: false }
];

const commonProhibitedActions = [
  "autonomous clinical care",
  "credential or permission expansion",
  "external communication without approval",
  "payer submission",
  "EHR writeback",
  "production deployment",
  "self-approval"
];

const commonEvidence = [
  "acceptance criteria",
  "policy decision",
  "source provenance",
  "test result",
  "independent review disposition"
];

const teamSpecs = [
  ["repository-remediation", "Repository Remediation", "artifact-writer-agent"],
  ["security-analysis", "Security Analysis", "safety-policy-agent"],
  ["regulatory-monitoring", "Regulatory Monitoring", "research-agent"],
  ["investor-intelligence", "Investor Intelligence", "executive-brief-agent"],
  ["partnership-diligence", "Partnership Diligence", "executive-brief-agent"],
  ["healthcare-policy-monitoring", "Healthcare Policy Monitoring", "research-agent"],
  ["evidence-pack-generation", "Evidence Pack Generation", "artifact-writer-agent"],
  ["product-research", "Product Research", "research-agent"],
  ["public-claims-verification", "Public Claims Verification", "artifact-writer-agent"],
  ["synthetic-workflow-testing", "Synthetic Workflow Testing", "interoperability-agent"]
] as const;

export const scrimedAgentTeamTemplates: AgentTeamTemplate[] = teamSpecs.map(
  ([templateId, title, implementerAgentId]) =>
    createAgentTeamTemplate({
      templateId,
      title,
      purpose: `${title} with bounded planning, specialist work, independent evidence review, and human escalation.`,
      assignments: sharedAssignments(implementerAgentId),
      requiredEvidence: commonEvidence,
      prohibitedActions: commonProhibitedActions,
      maximumDelegationDepth: 2,
      maximumRetriesPerStep: 2,
      costCeilingUsd: 5,
      runtimeCeilingMs: 10 * 60 * 1_000,
      actionCeiling: 24,
      toolAllowlist: [
        "artifact-draft",
        "repository-read",
        "synthetic-analysis",
        "test-runner"
      ],
      networkAllowlist: [],
      safeStopConditions: [
        "action ceiling reached",
        "budget exhausted",
        "circuit breaker opened",
        "evidence unavailable",
        "human approval required",
        "nonprogress detected",
        "policy denial"
      ],
      auditTrailRequired: true,
      idempotencyRequired: true,
      circuitBreaker: {
        failureThreshold: 2,
        cooldownMs: 60_000
      },
      untrustedContentPolicy: "data-only-never-instructions",
      independentReviewerIdentityRequired: true,
      outputLaunderingBlocked: true,
      consequentialOutputRequiresIndependentReview: true,
      unresolvedConflictAction: "escalate-to-human",
      humanApprovalGateway: {
        required: true,
        role: "reviewer",
        agentMaySatisfyGateway: false
      },
      syntheticPreparationEnabled: true,
      externalExecutionAllowed: false,
      clinicalAuthorityGranted: false,
      releaseAuthorityGranted: false
    })
);

export function getScrimedAgentTeamSummary() {
  return {
    policyVersion: scrimedAgentTeamPolicyVersion,
    templates: scrimedAgentTeamTemplates,
    templateCount: scrimedAgentTeamTemplates.length,
    independentReviewRequired: true,
    humanConflictEscalationRequired: true,
    boundedCostRuntimeAndActions: true,
    defaultDenyNetwork: scrimedAgentTeamTemplates.every(
      (template) => template.networkAllowlist.length === 0
    ),
    auditAndIdempotencyRequired: true,
    circuitBreakersRequired: true,
    externalExecutionAllowed: false,
    clinicalAuthorityGranted: false,
    releaseAuthorityGranted: false,
    boundary:
      "Agent teams prepare synthetic, evidence-backed work only. They cannot self-approve, expand permissions, contact external parties, deploy, process PHI, or authorize clinical, payer, EHR, migration, or customer-go-live actions."
  };
}
