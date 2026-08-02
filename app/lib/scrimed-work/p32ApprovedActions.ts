import { createAuditHash } from "./audit";
import {
  evaluateGovernedExecution,
  type CapabilityManifest,
  type ExecutionGrant,
  type GovernedExecutionRequest,
  type ReplayProtectionStore
} from "./governedRuntime";
import type { PolicyDecision } from "./p32Contracts";
import type {
  AgentRiskProfile,
  ContextCoverageManifest,
  EvidenceSynthesisRecord,
  TaskScopedToolContract
} from "./p32GovernanceRecords";
import {
  p32ApprovedActionRegistry,
  type GovernedActionClass
} from "./p32AgentGovernance";

export const scrimedP32ApprovedActionsVersion =
  "scrimed-p32-approved-actions-v1-2026-07-29";

export const scrimedP32ApprovedActionsBoundary =
  "The SCRIMED approved-actions kernel is the shared fail-closed decision path for UI, API, chat, voice, jobs, agents, browsers, and adapters. It cannot grant live PHI access, autonomous care, diagnosis, treatment, prescribing, payer submission, EHR/RCM writeback, model self-promotion, deployment, or clinical activation.";

export type ApprovedActionClass = GovernedActionClass;

export type ApprovedActionChannel =
  | "api"
  | "ui"
  | "chat"
  | "voice"
  | "background-job"
  | "agent"
  | "browser"
  | "integration-adapter";

export type ApprovalChainEntry = {
  approverId: string;
  approverType: "human" | "agent";
  approvalReference: string;
};

export type ApprovedActionRequest = {
  actionId: string;
  actionClass: ApprovedActionClass;
  channel: ApprovedActionChannel;
  action: string;
  tenantId: string;
  actorId: string;
  proposingAgentId: string | null;
  toolContract: TaskScopedToolContract;
  riskProfile: AgentRiskProfile;
  requestedResource: string;
  requestedFields: string[];
  requestedRowFilter: string;
  requestedDestination: string | null;
  contextCoverage: ContextCoverageManifest | null;
  evidenceSynthesis: EvidenceSynthesisRecord | null;
  correctabilitySupported: boolean;
  approvalChain: ApprovalChainEntry[];
  evaluatedAt: string;
  runtime?: {
    manifest: CapabilityManifest;
    request: GovernedExecutionRequest;
    grant?: ExecutionGrant;
    replayStore?: ReplayProtectionStore;
  };
};

export type ApprovedActionDecision = {
  actionId: string;
  actionClass: ApprovedActionClass;
  channel: ApprovedActionChannel;
  decision: PolicyDecision;
  reasonCodes: string[];
  humanApprovalRequired: boolean;
  mutationAuthorized: boolean;
  runtimeDecisionHash: string | null;
  policyVersion: typeof scrimedP32ApprovedActionsVersion;
  auditHash: string;
};

const prohibitedClinicalAndReleaseActions = [
  /\bautonomous[- ]?(?:diagnos|treat|care|triage|ration)/i,
  /\bdiagnos(?:e|is|tic)[- ]?(?:final|signoff|decision|write|execute)?\b/i,
  /\bprescrib(?:e|ing|ed)\b/i,
  /\btreatment[- ]?(?:select|order|execute|decision)/i,
  /\bpayer[- ]?(?:submit|submission|decision|mutation)/i,
  /\bclaim[- ]?(?:submit|submission|mutation|adjustment)/i,
  /\behr[- ]?(?:write|writeback|mutation)/i,
  /\brcm[- ]?(?:write|writeback|mutation)/i,
  /\bstructured[- ]?writeback\b/i,
  /\bunattended[- ]?clinical[- ]?action\b/i,
  /\blive[- ]?(?:self[- ]?learning|phi)\b/i,
  /\bproduction[- ]?(?:deploy|deployment|migration|mutation|activation)\b/i,
  /\bcustomer[- ]?(?:activation|go[- ]?live)\b/i,
  /\bmodel[- ]?(?:self[- ]?promotion|admission|activation)\b/i,
  /\bprivilege[- ]?escalation\b/i
];

const browserBypassActions = [
  /\bbypass[- ]?(?:mfa|authorization|api|captcha|permission)/i,
  /\bsession[- ]?(?:hijack|reuse|impersonat)/i,
  /\bcredential[- ]?(?:share|reuse|extract)/i,
  /\bunrestricted[- ]?(?:browser|cdp|webdriver|websocket)/i
];

function canonical(values: string[]) {
  return [...new Set(values)].sort();
}

function isCurrent(contract: TaskScopedToolContract, evaluatedAt: string) {
  return (
    Number.isFinite(Date.parse(evaluatedAt)) &&
    Date.parse(contract.issuedAt) <= Date.parse(evaluatedAt) &&
    Date.parse(contract.expiresAt) > Date.parse(evaluatedAt) &&
    contract.revocationState === "active"
  );
}

function clinicalEvidenceRequired(request: ApprovedActionRequest) {
  return (
    request.riskProfile.clinicalCriticality !== "low" ||
    request.actionClass === "RECOMMEND" ||
    request.actionClass === "EXECUTE"
  );
}

function hasIndependentHumanApproval(request: ApprovedActionRequest) {
  return request.approvalChain.some(
    (entry) =>
      entry.approverType === "human" &&
      entry.approverId !== request.actorId &&
      entry.approverId !== request.proposingAgentId &&
      Boolean(entry.approvalReference.trim())
  );
}

function scopeReasons(request: ApprovedActionRequest) {
  const reasons: string[] = [];
  const contract = request.toolContract;
  if (contract.tenantId !== request.tenantId) reasons.push("TOOL_CONTRACT_TENANT_MISMATCH");
  if (contract.actorId !== request.actorId) reasons.push("TOOL_CONTRACT_ACTOR_MISMATCH");
  if (!isCurrent(contract, request.evaluatedAt)) reasons.push("TOOL_CONTRACT_EXPIRED_OR_REVOKED");
  if (!contract.permittedResources.includes(request.requestedResource)) {
    reasons.push("RESOURCE_OUTSIDE_TOOL_CONTRACT");
  }
  if (
    !request.requestedFields.length ||
    request.requestedFields.some((field) => !contract.permittedFields.includes(field))
  ) {
    reasons.push("FIELD_SCOPE_EXCEEDS_MINIMUM_NECESSARY");
  }
  if (!contract.rowFilters.includes(request.requestedRowFilter)) {
    reasons.push("ROW_SCOPE_EXCEEDS_MINIMUM_NECESSARY");
  }
  if (!contract.permittedActions.includes(request.action)) {
    reasons.push("ACTION_OUTSIDE_TOOL_CONTRACT");
  }
  if (
    request.requestedDestination &&
    (!contract.permittedDestinations.includes(request.requestedDestination) ||
      !contract.egressPolicy.allowedDestinations.includes(request.requestedDestination))
  ) {
    reasons.push("DESTINATION_NOT_ALLOWLISTED");
  }
  return reasons;
}

function approvalReasons(request: ApprovedActionRequest) {
  const reasons: string[] = [];
  const agentApprovers = request.approvalChain.filter(
    (entry) => entry.approverType === "agent"
  );
  if (
    request.proposingAgentId &&
    request.approvalChain.some((entry) => entry.approverId === request.proposingAgentId)
  ) {
    reasons.push("AGENT_SELF_APPROVAL_PROHIBITED");
  }
  if (request.approvalChain.length > 0 && agentApprovers.length === request.approvalChain.length) {
    reasons.push("MULTI_AGENT_CIRCULAR_APPROVAL_PROHIBITED");
  }
  if (
    /\b(?:privilege|deployment|model[- ]?admission|clinical[- ]?activation)\b/i.test(
      request.action
    ) &&
    agentApprovers.length
  ) {
    reasons.push("AGENT_APPROVAL_AUTHORITY_PROHIBITED");
  }
  return reasons;
}

function evidenceReasons(request: ApprovedActionRequest) {
  if (!clinicalEvidenceRequired(request)) return [];
  const reasons: string[] = [];
  if (!request.contextCoverage) reasons.push("CONTEXT_COVERAGE_MANIFEST_REQUIRED");
  else if (request.contextCoverage.tenantId !== request.tenantId) {
    reasons.push("CONTEXT_COVERAGE_TENANT_MISMATCH");
  } else if (request.contextCoverage.decision === "BLOCK") {
    reasons.push("CONTEXT_COVERAGE_BLOCKED");
  } else if (request.contextCoverage.decision === "REQUIRE_HUMAN") {
    reasons.push("CONTEXT_COVERAGE_REQUIRES_HUMAN");
  }
  if (!request.evidenceSynthesis) reasons.push("EVIDENCE_SYNTHESIS_REQUIRED");
  else if (request.evidenceSynthesis.tenantId !== request.tenantId) {
    reasons.push("EVIDENCE_SYNTHESIS_TENANT_MISMATCH");
  } else if (request.evidenceSynthesis.overallDecision === "BLOCK") {
    reasons.push("EVIDENCE_SYNTHESIS_BLOCKED");
  } else if (request.evidenceSynthesis.overallDecision === "REQUIRE_HUMAN") {
    reasons.push("EVIDENCE_SYNTHESIS_REQUIRES_HUMAN");
  }
  if (
    (request.actionClass === "DRAFT" || request.actionClass === "RECOMMEND") &&
    !request.correctabilitySupported
  ) {
    reasons.push("CORRECTABILITY_REQUIRED");
  }
  return reasons;
}

export function evaluateP32ApprovedAction(
  request: ApprovedActionRequest
): ApprovedActionDecision {
  const registryEntry = p32ApprovedActionRegistry.find(
    (entry) => entry.actionClass === request.actionClass
  );
  const reasons = [
    ...scopeReasons(request),
    ...approvalReasons(request),
    ...evidenceReasons(request)
  ];
  if (!registryEntry) {
    reasons.push("ACTION_CLASS_NOT_REGISTERED");
  } else {
    if (
      !registryEntry.permittedRisk.includes(
        request.riskProfile.calculatedRiskTier
      )
    ) {
      reasons.push("ACTION_CLASS_RISK_NOT_ADMITTED");
    }
    if (
      registryEntry.correctionPathRequired &&
      ["DRAFT", "RECOMMEND", "REQUEST_APPROVAL"].includes(
        request.actionClass
      ) &&
      !request.correctabilitySupported
    ) {
      reasons.push("REGISTERED_CORRECTION_PATH_REQUIRED");
    }
    if (
      registryEntry.independentHumanApprovalRequired &&
      !hasIndependentHumanApproval(request)
    ) {
      reasons.push("REGISTERED_INDEPENDENT_HUMAN_APPROVAL_REQUIRED");
    }
  }
  if (
    request.actionClass === "PROHIBITED" ||
    prohibitedClinicalAndReleaseActions.some((pattern) => pattern.test(request.action))
  ) {
    reasons.push("ACTION_PROHIBITED_BY_SCRIMED_BOUNDARY");
  }
  if (
    request.channel === "browser" &&
    browserBypassActions.some((pattern) => pattern.test(request.action))
  ) {
    reasons.push("BROWSER_AUTHORIZATION_BYPASS_PROHIBITED");
  }
  if (
    request.riskProfile.calculatedRiskTier === "prohibited" ||
    request.riskProfile.independentAssessmentRequired &&
      request.riskProfile.assessedByActorId === request.riskProfile.agentId
  ) {
    reasons.push("INDEPENDENT_RISK_ASSESSMENT_REQUIRED");
  }

  let runtimeDecisionHash: string | null = null;
  if (request.actionClass === "EXECUTE") {
    if (!hasIndependentHumanApproval(request)) {
      reasons.push("INDEPENDENT_HUMAN_APPROVAL_REQUIRED");
    }
    if (!request.runtime) {
      reasons.push("GOVERNED_RUNTIME_DECISION_REQUIRED");
    } else {
      const runtimeDecision = evaluateGovernedExecution({
        manifest: request.runtime.manifest,
        request: request.runtime.request,
        grant: request.runtime.grant,
        replayStore: request.runtime.replayStore,
        evaluatedAt: request.evaluatedAt
      });
      runtimeDecisionHash = runtimeDecision.auditHash;
      if (!runtimeDecision.executionAuthorized) {
        reasons.push(...runtimeDecision.reasonCodes);
        reasons.push("GOVERNED_RUNTIME_EXECUTION_NOT_AUTHORIZED");
      }
      if (
        request.runtime.request.tenantId !== request.tenantId ||
        request.runtime.request.actorId !== request.actorId ||
        request.runtime.request.action !== request.action
      ) {
        reasons.push("RUNTIME_REQUEST_BINDING_MISMATCH");
      }
    }
  }

  const uniqueReasons = canonical(reasons);
  const hardBlockReasons = new Set([
    "ACTION_PROHIBITED_BY_SCRIMED_BOUNDARY",
    "ACTION_CLASS_NOT_REGISTERED",
    "ACTION_CLASS_RISK_NOT_ADMITTED",
    "AGENT_SELF_APPROVAL_PROHIBITED",
    "MULTI_AGENT_CIRCULAR_APPROVAL_PROHIBITED",
    "AGENT_APPROVAL_AUTHORITY_PROHIBITED",
    "BROWSER_AUTHORIZATION_BYPASS_PROHIBITED",
    "INDEPENDENT_RISK_ASSESSMENT_REQUIRED",
    "TOOL_CONTRACT_TENANT_MISMATCH",
    "TOOL_CONTRACT_ACTOR_MISMATCH",
    "TOOL_CONTRACT_EXPIRED_OR_REVOKED",
    "RESOURCE_OUTSIDE_TOOL_CONTRACT",
    "FIELD_SCOPE_EXCEEDS_MINIMUM_NECESSARY",
    "ROW_SCOPE_EXCEEDS_MINIMUM_NECESSARY",
    "ACTION_OUTSIDE_TOOL_CONTRACT",
    "DESTINATION_NOT_ALLOWLISTED",
    "CONTEXT_COVERAGE_TENANT_MISMATCH",
    "CONTEXT_COVERAGE_BLOCKED",
    "EVIDENCE_SYNTHESIS_TENANT_MISMATCH",
    "EVIDENCE_SYNTHESIS_BLOCKED",
    "GOVERNED_RUNTIME_DECISION_REQUIRED",
    "GOVERNED_RUNTIME_EXECUTION_NOT_AUTHORIZED",
    "RUNTIME_REQUEST_BINDING_MISMATCH"
  ]);
  const hardBlocked = uniqueReasons.some((reason) => hardBlockReasons.has(reason));
  const requiresHuman =
    request.actionClass === "REQUEST_APPROVAL" ||
    request.actionClass === "EXECUTE" ||
    request.riskProfile.calculatedRiskTier === "high" ||
    uniqueReasons.some((reason) =>
      [
        "CONTEXT_COVERAGE_REQUIRES_HUMAN",
        "EVIDENCE_SYNTHESIS_REQUIRES_HUMAN",
        "CONTEXT_COVERAGE_MANIFEST_REQUIRED",
        "EVIDENCE_SYNTHESIS_REQUIRED",
        "CORRECTABILITY_REQUIRED",
        "REGISTERED_CORRECTION_PATH_REQUIRED",
        "REGISTERED_INDEPENDENT_HUMAN_APPROVAL_REQUIRED",
        "INDEPENDENT_HUMAN_APPROVAL_REQUIRED"
      ].includes(reason)
    );
  const runtimeAuthorized =
    request.actionClass === "EXECUTE" &&
    request.runtime !== undefined &&
    !uniqueReasons.includes("GOVERNED_RUNTIME_EXECUTION_NOT_AUTHORIZED") &&
    !uniqueReasons.includes("RUNTIME_REQUEST_BINDING_MISMATCH");
  const decision: PolicyDecision = hardBlocked
    ? "BLOCK"
    : requiresHuman && !(runtimeAuthorized && hasIndependentHumanApproval(request))
      ? "REQUIRE_HUMAN"
      : "ALLOW";
  const withoutHash = {
    actionId: request.actionId,
    actionClass: request.actionClass,
    channel: request.channel,
    decision,
    reasonCodes:
      uniqueReasons.length > 0
        ? uniqueReasons
        : [decision === "ALLOW" ? "APPROVED_ACTION_POLICY_ALLOW" : "HUMAN_REVIEW_REQUIRED"],
    humanApprovalRequired: requiresHuman,
    mutationAuthorized: decision === "ALLOW" && request.actionClass === "EXECUTE",
    runtimeDecisionHash,
    policyVersion:
      scrimedP32ApprovedActionsVersion as typeof scrimedP32ApprovedActionsVersion
  };
  return {
    ...withoutHash,
    auditHash: createAuditHash({
      type: "p32-approved-action-decision",
      request: {
        actionId: request.actionId,
        actionClass: request.actionClass,
        channel: request.channel,
        action: request.action,
        tenantId: request.tenantId,
        actorId: request.actorId,
        toolContractHash: request.toolContract.contractHash,
        riskProfileHash: request.riskProfile.profileHash,
        contextManifestHash: request.contextCoverage?.manifestHash ?? null,
        evidenceRecordHash: request.evidenceSynthesis?.recordHash ?? null
      },
      decision: withoutHash
    })
  };
}

export function getP32ApprovedActionsSummary() {
  return {
    version: scrimedP32ApprovedActionsVersion,
    actionClasses: [
      "READ",
      "DRAFT",
      "RECOMMEND",
      "REQUEST_APPROVAL",
      "EXECUTE",
      "PROHIBITED"
    ],
    registryEntryCount: p32ApprovedActionRegistry.length,
    channels: [
      "api",
      "ui",
      "chat",
      "voice",
      "background-job",
      "agent",
      "browser",
      "integration-adapter"
    ],
    voiceAuthorityEqualsTextAuthority: true,
    everyMutationRequiresExecutionGrant: true,
    agentSelfApprovalAllowed: false,
    circularAgentApprovalAllowed: false,
    browserAuthorizationBypassAllowed: false,
    boundary: scrimedP32ApprovedActionsBoundary
  } as const;
}
