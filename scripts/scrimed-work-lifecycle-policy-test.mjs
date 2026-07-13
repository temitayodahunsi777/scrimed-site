#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  applyWorkSessionTransition,
  evaluateWorkSessionTransition,
  getWorkSessionLifecycleSnapshot
} from "../app/lib/scrimed-work/sessionLifecycle.ts";

function sessionFixture(status = "draft", overrides = {}) {
  const workspaceDomain = overrides.workspaceDomain ?? "operations";
  const riskLevel = overrides.riskLevel ?? "moderate";
  const requiredRole = riskLevel === "high" && workspaceDomain === "clinical" ? "clinician-reviewer" : "reviewer";

  return {
    id: "work_session_lifecycle_fixture",
    tenantId: "synthetic-tenant",
    organizationScope: "synthetic-organization",
    workspaceDomain,
    title: "Lifecycle fixture",
    objective: "Validate governed synthetic lifecycle behavior.",
    actor: {
      actorId: overrides.creatorId ?? "operator-1",
      displayName: "Synthetic operator",
      role: "operator",
      tenantId: "synthetic-tenant"
    },
    inputClassification: "synthetic-no-phi",
    riskLevel,
    requestedAutonomy: "recommend",
    approvedAutonomy: "recommend",
    definitionOfDone: {
      goal: "Validate lifecycle policy",
      allowedScope: ["synthetic metadata"],
      prohibitedActions: ["live PHI"],
      requiredEvidence: ["lifecycle decision"],
      successCriteria: ["policy pass"],
      stoppingConditions: ["policy denial"],
      timeoutMs: 300000,
      maximumSteps: 5,
      maximumToolCalls: 5,
      maximumEstimatedCostUsd: 0.1,
      humanApprovalRequired: overrides.humanApprovalRequired ?? true,
      rollbackPlan: "Restore the prior metadata checkpoint.",
      verificationChecks: ["state transition"]
    },
    sourceContextReferences: [],
    selectedModel: {},
    plannedSteps: [
      {
        stepId: "step-1",
        title: "Synthetic step",
        assignedAgent: "coordinator",
        dependsOn: [],
        deadlineMs: 1000,
        status: "pending",
        requiresApproval: true,
        auditHash: "fixture"
      }
    ],
    toolCalls: [],
    evidence: [],
    approvalCheckpoints: overrides.approvalCheckpoints ?? [
      {
        checkpointId: "approval-1",
        action: "Review synthetic output",
        requiredRole,
        status: "pending",
        scopedApprovalTokenStatus: "not-issued",
        reason: "Independent review required.",
        auditHash: "fixture"
      }
    ],
    artifacts: [],
    valueTelemetry: {},
    statusHistory: [
      {
        status,
        at: "2026-07-13T00:00:00.000Z",
        reason: "Fixture status",
        auditHash: "fixture",
        ...(overrides.lastAction ? { action: overrides.lastAction } : {})
      }
    ],
    cancellationState: {
      cancellable: true,
      cancelledAt: null,
      cancellationReason: null,
      cancellationPropagated: false
    },
    rollbackMetadata: {
      rollbackAvailable: overrides.rollbackAvailable ?? true,
      rollbackPlan: "Restore the prior metadata checkpoint.",
      lastCheckpointId: "checkpoint-1",
      rollbackTested: true
    },
    createdAt: "2026-07-13T00:00:00.000Z",
    updatedAt: "2026-07-13T00:00:00.000Z"
  };
}

const plan = evaluateWorkSessionTransition({ session: sessionFixture("draft"), action: "plan" });
assert.equal(plan.allowed, true);
assert.equal(plan.targetStatus, "planning");

const invalidResume = evaluateWorkSessionTransition({ session: sessionFixture("draft"), action: "resume" });
assert.equal(invalidResume.allowed, false);
assert.equal(invalidResume.code, "transition-not-allowed");

const replayCandidate = evaluateWorkSessionTransition({
  session: sessionFixture("planning", { lastAction: "plan" }),
  action: "plan"
});
assert.equal(replayCandidate.decision, "idempotent_replay_candidate");

const awaitingReview = sessionFixture("awaiting_approval");
const approvedDecision = evaluateWorkSessionTransition({
  session: awaitingReview,
  action: "approve",
  actor: { actorId: "reviewer-2", role: "reviewer" }
});
assert.equal(approvedDecision.allowed, true);
const approvedSession = applyWorkSessionTransition({
  session: awaitingReview,
  transition: approvedDecision,
  reason: "Independent reviewer approved synthetic metadata."
});
assert.equal(approvedSession.statusHistory.at(-1).status, "verifying");
assert.equal(approvedSession.approvalCheckpoints[0].status, "approved");
assert.equal(approvedSession.approvalCheckpoints.filter((item) => item.status === "approved").length, 1);

const selfApproval = evaluateWorkSessionTransition({
  session: awaitingReview,
  action: "approve",
  actor: { actorId: "operator-1", role: "reviewer" }
});
assert.equal(selfApproval.code, "separation-of-duties-required");

const clinicalApproval = evaluateWorkSessionTransition({
  session: sessionFixture("awaiting_approval", { workspaceDomain: "clinical", riskLevel: "high" }),
  action: "approve",
  actor: { actorId: "reviewer-2", role: "reviewer" }
});
assert.equal(clinicalApproval.code, "qualified-clinical-reviewer-required");

const cancelDecision = evaluateWorkSessionTransition({ session: sessionFixture("active"), action: "cancel" });
const cancelled = applyWorkSessionTransition({
  session: sessionFixture("active"),
  transition: cancelDecision,
  reason: "Operator cancelled synthetic work."
});
assert.equal(cancelled.cancellationState.cancellationPropagated, true);
assert.equal(cancelled.plannedSteps[0].status, "blocked");

const verifying = sessionFixture("verifying", {
  approvalCheckpoints: [
    {
      checkpointId: "approval-1",
      action: "Review synthetic output",
      requiredRole: "reviewer",
      status: "approved",
      scopedApprovalTokenStatus: "issued-metadata-only",
      reason: "Independent review completed.",
      auditHash: "fixture"
    }
  ]
});
const blockedCompletion = evaluateWorkSessionTransition({ session: verifying, action: "complete" });
assert.equal(blockedCompletion.code, "verification-required");
const allowedCompletion = evaluateWorkSessionTransition({
  session: verifying,
  action: "complete",
  verification: {
    allPass: true,
    criteriaPassRate: 100,
    failedCriteria: [],
    warnings: [],
    evidence: ["lifecycle-test"],
    recommendedAction: "complete",
    eligibleForCompletion: true
  }
});
assert.equal(allowedCompletion.allowed, true);

const terminalPlan = evaluateWorkSessionTransition({ session: sessionFixture("completed"), action: "plan" });
assert.equal(terminalPlan.code, "terminal-session");

const snapshot = getWorkSessionLifecycleSnapshot(awaitingReview);
assert.equal(snapshot.currentStatus, "awaiting_approval");
assert.ok(snapshot.allowedActions.includes("reject"));
assert.ok(snapshot.blockedActions.some((item) => item.action === "plan"));

console.log("pass SCRIMED Work lifecycle policy behavior test (state, approval, separation, completion, cancellation, replay)");
