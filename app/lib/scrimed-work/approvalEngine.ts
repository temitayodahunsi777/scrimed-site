import { createAuditHash } from "./audit";
import type { ApprovalCheckpoint, WorkSession } from "./types";

export function buildApprovalCheckpoint(input: {
  session: Pick<WorkSession, "id" | "riskLevel" | "workspaceDomain">;
  action: string;
  reason: string;
  requiredRole?: ApprovalCheckpoint["requiredRole"];
}): ApprovalCheckpoint {
  const checkpointId = `approval_${createAuditHash({ sessionId: input.session.id, action: input.action }).slice(0, 16)}`;

  return {
    checkpointId,
    action: input.action,
    requiredRole:
      input.requiredRole ??
      (input.session.riskLevel === "high" && input.session.workspaceDomain === "clinical"
        ? "clinician-reviewer"
        : "reviewer"),
    status: "pending",
    scopedApprovalTokenStatus: "not-issued",
    reason: input.reason,
    auditHash: createAuditHash({ checkpointId, reason: input.reason })
  };
}

export function evaluateApprovalReadiness(session: WorkSession) {
  const pending = session.approvalCheckpoints.filter((checkpoint) => checkpoint.status === "pending");
  const approved = session.approvalCheckpoints.filter((checkpoint) => checkpoint.status === "approved");

  return {
    sessionId: session.id,
    pendingCount: pending.length,
    approvedCount: approved.length,
    humanApprovalRequired: session.approvalCheckpoints.length > 0,
    completionBlocked: session.riskLevel === "high" && approved.length === 0,
    reason:
      session.riskLevel === "high" && approved.length === 0
        ? "High-risk work cannot complete without human approval."
        : "Approval state is ready for the current synthetic boundary."
  };
}
