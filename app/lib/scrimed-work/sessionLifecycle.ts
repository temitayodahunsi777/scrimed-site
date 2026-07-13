import type {
  ActorIdentity,
  ApprovalCheckpoint,
  VerificationResult,
  WorkSession,
  WorkSessionStatus,
  WorkSessionTransitionAction
} from "./types";

export const scrimedWorkLifecyclePolicyVersion = "scrimed-work-lifecycle-v2026-07-13";

export type WorkSessionTransitionDecision = {
  action: WorkSessionTransitionAction;
  fromStatus: WorkSessionStatus;
  targetStatus: WorkSessionStatus;
  decision: "allow" | "deny" | "idempotent_replay_candidate";
  allowed: boolean;
  code:
    | "transition-allowed"
    | "transition-idempotent-replay-candidate"
    | "transition-not-allowed"
    | "terminal-session"
    | "prohibited-risk"
    | "approval-checkpoint-missing"
    | "reviewer-identity-required"
    | "reviewer-role-mismatch"
    | "separation-of-duties-required"
    | "qualified-clinical-reviewer-required"
    | "verification-required"
    | "rollback-unavailable";
  reason: string;
  failedPreconditions: string[];
  requiresHumanApproval: boolean;
  requiredReviewerRole: ApprovalCheckpoint["requiredRole"] | null;
  policyVersion: typeof scrimedWorkLifecyclePolicyVersion;
  decisionHash: string;
};

type TransitionActor = Pick<ActorIdentity, "actorId" | "role">;

export function hasSatisfiedRequiredHumanApproval(session: WorkSession) {
  const approvalRequired = session.riskLevel === "high" || session.definitionOfDone.humanApprovalRequired;

  return (
    !approvalRequired ||
    session.approvalCheckpoints.some((checkpoint) => checkpoint.status === "approved")
  );
}

const terminalStatuses = new Set<WorkSessionStatus>(["completed", "cancelled", "rolled_back"]);

const allowedActions: Record<WorkSessionStatus, WorkSessionTransitionAction[]> = {
  draft: ["plan", "cancel"],
  planning: ["run", "pause", "cancel", "fail"],
  active: ["pause", "cancel", "fail"],
  awaiting_approval: ["approve", "reject", "cancel", "fail"],
  paused: ["resume", "cancel", "fail", "rollback"],
  verifying: ["complete", "reject", "pause", "cancel", "fail"],
  completed: ["rollback"],
  failed: ["rollback", "cancel"],
  cancelled: ["rollback"],
  rolled_back: []
};

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(",")}]`;

  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, entry]) => `${JSON.stringify(key)}:${stableSerialize(entry)}`)
    .join(",")}}`;
}

function lifecycleHash(value: unknown) {
  const serialized = stableSerialize(value);
  let hash = 0x811c9dc5;

  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return `scrimed-work-lifecycle-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function getCurrentWorkSessionStatus(session: Pick<WorkSession, "statusHistory">): WorkSessionStatus {
  return session.statusHistory.at(-1)?.status ?? "draft";
}

function targetForAction(session: WorkSession, action: WorkSessionTransitionAction): WorkSessionStatus {
  if (action === "run") {
    return session.definitionOfDone.humanApprovalRequired || session.riskLevel === "high"
      ? "awaiting_approval"
      : "active";
  }

  const targets: Record<Exclude<WorkSessionTransitionAction, "run">, WorkSessionStatus> = {
    plan: "planning",
    pause: "paused",
    resume: "active",
    approve: "verifying",
    reject: "paused",
    complete: "completed",
    cancel: "cancelled",
    fail: "failed",
    rollback: "rolled_back"
  };

  return targets[action];
}

function decision(
  input: Omit<WorkSessionTransitionDecision, "policyVersion" | "decisionHash">
): WorkSessionTransitionDecision {
  const withPolicy = {
    ...input,
    policyVersion: scrimedWorkLifecyclePolicyVersion
  } satisfies Omit<WorkSessionTransitionDecision, "decisionHash">;

  return { ...withPolicy, decisionHash: lifecycleHash(withPolicy) };
}

export function evaluateWorkSessionTransition(input: {
  session: WorkSession;
  action: WorkSessionTransitionAction;
  actor?: TransitionActor;
  verification?: VerificationResult;
}): WorkSessionTransitionDecision {
  const { session, action } = input;
  const fromStatus = getCurrentWorkSessionStatus(session);
  const targetStatus = targetForAction(session, action);
  const checkpoint = session.approvalCheckpoints.find((item) => item.status === "pending");
  const base = {
    action,
    fromStatus,
    targetStatus,
    requiresHumanApproval: action === "approve" || session.definitionOfDone.humanApprovalRequired,
    requiredReviewerRole: action === "approve" ? checkpoint?.requiredRole ?? null : null
  };

  if (fromStatus === targetStatus && session.statusHistory.at(-1)?.action === action) {
    return decision({
      ...base,
      decision: "idempotent_replay_candidate",
      allowed: true,
      code: "transition-idempotent-replay-candidate",
      reason: "The target status is already current; the durable idempotency ledger must validate the request key before accepting a replay.",
      failedPreconditions: []
    });
  }

  if (session.riskLevel === "prohibited" && !["cancel", "fail"].includes(action)) {
    return decision({
      ...base,
      decision: "deny",
      allowed: false,
      code: "prohibited-risk",
      reason: "Prohibited-risk work can only fail closed or be cancelled.",
      failedPreconditions: ["risk-level-not-prohibited"]
    });
  }

  if (terminalStatuses.has(fromStatus) && action !== "rollback") {
    return decision({
      ...base,
      decision: "deny",
      allowed: false,
      code: "terminal-session",
      reason: "Terminal sessions cannot re-enter active work.",
      failedPreconditions: ["session-not-terminal"]
    });
  }

  if (!allowedActions[fromStatus].includes(action)) {
    return decision({
      ...base,
      decision: "deny",
      allowed: false,
      code: "transition-not-allowed",
      reason: `${action} is not permitted from ${fromStatus}.`,
      failedPreconditions: [`allowed-action-from-${fromStatus}`]
    });
  }

  if (action === "approve") {
    if (!checkpoint) {
      return decision({
        ...base,
        decision: "deny",
        allowed: false,
        code: "approval-checkpoint-missing",
        reason: "No pending approval checkpoint exists for this session.",
        failedPreconditions: ["pending-approval-checkpoint"]
      });
    }

    if (!input.actor) {
      return decision({
        ...base,
        decision: "deny",
        allowed: false,
        code: "reviewer-identity-required",
        reason: "A verified human reviewer identity is required for approval.",
        failedPreconditions: ["verified-reviewer-identity"]
      });
    }

    if (input.actor.actorId === session.actor.actorId) {
      return decision({
        ...base,
        decision: "deny",
        allowed: false,
        code: "separation-of-duties-required",
        reason: "The session initiator cannot approve the same work session.",
        failedPreconditions: ["independent-reviewer"]
      });
    }

    if (checkpoint.requiredRole === "clinician-reviewer" && input.actor.role !== "clinician-reviewer") {
      return decision({
        ...base,
        decision: "deny",
        allowed: false,
        code: "qualified-clinical-reviewer-required",
        reason: "High-risk clinical-support work requires a separately verified clinician-reviewer identity.",
        failedPreconditions: ["qualified-clinician-reviewer"]
      });
    }

    if (input.actor.role !== checkpoint.requiredRole) {
      return decision({
        ...base,
        decision: "deny",
        allowed: false,
        code: "reviewer-role-mismatch",
        reason: `Approval requires the ${checkpoint.requiredRole} role.`,
        failedPreconditions: [`reviewer-role-${checkpoint.requiredRole}`]
      });
    }
  }

  if (action === "complete" && !input.verification?.eligibleForCompletion) {
    return decision({
      ...base,
      decision: "deny",
      allowed: false,
      code: "verification-required",
      reason: "Completion requires a current verification result with every mandatory criterion passing.",
      failedPreconditions: ["verification-eligible-for-completion"]
    });
  }

  if (action === "rollback" && !session.rollbackMetadata.rollbackAvailable) {
    return decision({
      ...base,
      decision: "deny",
      allowed: false,
      code: "rollback-unavailable",
      reason: "The session has no tested rollback path.",
      failedPreconditions: ["tested-rollback-available"]
    });
  }

  return decision({
    ...base,
    decision: "allow",
    allowed: true,
    code: "transition-allowed",
    reason: `${action} is allowed from ${fromStatus} to ${targetStatus} under the lifecycle policy.`,
    failedPreconditions: []
  });
}

export function applyWorkSessionTransition(input: {
  session: WorkSession;
  transition: WorkSessionTransitionDecision;
  reason: string;
  transitionedAt?: string;
}): WorkSession {
  const { session, transition } = input;

  if (!transition.allowed || transition.decision === "idempotent_replay_candidate") return session;

  const checkpointToMutate = session.approvalCheckpoints.find((checkpoint) =>
    transition.action === "approve"
      ? checkpoint.status === "pending"
      : transition.action === "reject" && ["pending", "approved"].includes(checkpoint.status)
  )?.checkpointId;
  const approvalCheckpoints = session.approvalCheckpoints.map((checkpoint) => {
    if (transition.action === "approve" && checkpoint.checkpointId === checkpointToMutate) {
      return {
        ...checkpoint,
        status: "approved" as const,
        scopedApprovalTokenStatus: "issued-metadata-only" as const,
        auditHash: lifecycleHash({ checkpointId: checkpoint.checkpointId, decisionHash: transition.decisionHash, status: "approved" })
      };
    }

    if (transition.action === "reject" && checkpoint.checkpointId === checkpointToMutate) {
      return {
        ...checkpoint,
        status: "rejected" as const,
        scopedApprovalTokenStatus: "blocked" as const,
        auditHash: lifecycleHash({ checkpointId: checkpoint.checkpointId, decisionHash: transition.decisionHash, status: "rejected" })
      };
    }

    return checkpoint;
  });
  const transitionedAt = input.transitionedAt ?? "2026-07-13T00:00:00.000Z";
  const cancellation = transition.action === "cancel";
  const stopPlannedWork = cancellation || transition.action === "rollback" || transition.action === "fail";

  return {
    ...session,
    plannedSteps: stopPlannedWork
      ? session.plannedSteps.map((step) =>
          ["pending", "running"].includes(step.status) ? { ...step, status: "blocked" as const } : step
        )
      : session.plannedSteps,
    approvalCheckpoints,
    statusHistory: [
      ...session.statusHistory,
      {
        status: transition.targetStatus,
        at: transitionedAt,
        reason: input.reason,
        action: transition.action,
        fromStatus: transition.fromStatus,
        lifecycleDecisionHash: transition.decisionHash,
        auditHash: lifecycleHash({
          sessionId: session.id,
          status: transition.targetStatus,
          reason: input.reason,
          decisionHash: transition.decisionHash
        })
      }
    ],
    cancellationState: cancellation
      ? {
          cancellable: false,
          cancelledAt: transitionedAt,
          cancellationReason: input.reason,
          cancellationPropagated: true
        }
      : session.cancellationState,
    updatedAt: transitionedAt
  };
}

export function getWorkSessionLifecycleSnapshot(session: WorkSession) {
  const actor: TransitionActor = { actorId: "independent-synthetic-reviewer", role: "reviewer" };
  const transitions = (Object.keys(targetForActionMap) as WorkSessionTransitionAction[]).map((action) =>
    evaluateWorkSessionTransition({ session, action, actor })
  );

  return {
    sessionId: session.id,
    currentStatus: getCurrentWorkSessionStatus(session),
    policyVersion: scrimedWorkLifecyclePolicyVersion,
    allowedActions: transitions.filter((item) => item.allowed).map((item) => item.action),
    blockedActions: transitions.filter((item) => !item.allowed).map((item) => ({ action: item.action, code: item.code, reason: item.reason })),
    terminal: terminalStatuses.has(getCurrentWorkSessionStatus(session)),
    transitions
  };
}

const targetForActionMap: Record<WorkSessionTransitionAction, true> = {
  plan: true,
  run: true,
  pause: true,
  resume: true,
  approve: true,
  reject: true,
  complete: true,
  cancel: true,
  fail: true,
  rollback: true
};
