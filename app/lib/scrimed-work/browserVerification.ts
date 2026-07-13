export const scrimedWorkBrowserVerificationVersion = "scrimed-work-browser-verification-v2026-07-13";

export const scrimedWorkBrowserVerificationBoundary =
  "Synthetic metadata only. The verifier uses the active AAL2 browser session without exporting its bearer token, rejects PHI and credentials, performs no clinical or payer action, and cancels every created verification session.";

export type ScrimedWorkBrowserVerificationCheckId =
  | "platform-summary"
  | "unauthenticated-fail-closed"
  | "durable-create"
  | "idempotent-create"
  | "plan-transition"
  | "transition-replay"
  | "invalid-resume-denied"
  | "artifact-evidence"
  | "cancellation-cleanup";

export type ScrimedWorkBrowserVerificationCheckDefinition = {
  id: ScrimedWorkBrowserVerificationCheckId;
  label: string;
  purpose: string;
  mutation: boolean;
};

export type ScrimedWorkBrowserCheckStatus = "pending" | "pass" | "blocked" | "fail";

export const scrimedWorkBrowserVerificationChecks: ScrimedWorkBrowserVerificationCheckDefinition[] = [
  {
    id: "platform-summary",
    label: "Platform Posture",
    purpose: "Confirm the SCRIMED Work route and durable-store posture are deployed.",
    mutation: false
  },
  {
    id: "unauthenticated-fail-closed",
    label: "Unauthenticated Fail-Closed",
    purpose: "Prove that a write without an AAL2 browser session cannot create work.",
    mutation: false
  },
  {
    id: "durable-create",
    label: "Durable Session Create",
    purpose: "Persist one bounded synthetic operations session under tenant scope.",
    mutation: true
  },
  {
    id: "idempotent-create",
    label: "Create Replay",
    purpose: "Prove the same idempotency key reuses the durable create decision.",
    mutation: true
  },
  {
    id: "plan-transition",
    label: "Lifecycle Transition",
    purpose: "Move the synthetic session from draft to planning under the state machine.",
    mutation: true
  },
  {
    id: "transition-replay",
    label: "Transition Replay",
    purpose: "Prove a repeated transition key returns the prior lifecycle decision.",
    mutation: true
  },
  {
    id: "invalid-resume-denied",
    label: "Invalid Transition Denial",
    purpose: "Prove resume from planning is rejected rather than guessed or coerced.",
    mutation: false
  },
  {
    id: "artifact-evidence",
    label: "Artifact Evidence",
    purpose: "Persist metadata for a synthetic executive verification artifact.",
    mutation: true
  },
  {
    id: "cancellation-cleanup",
    label: "Cancellation Cleanup",
    purpose: "Cancel the verification session and preserve its immutable evidence trail.",
    mutation: true
  }
];

export function buildScrimedWorkBrowserVerificationPayload(workspaceSlug: string, suffix: string) {
  return {
    workspaceSlug,
    tenantId: "resolved-by-protected-membership",
    organizationScope: workspaceSlug,
    workspaceDomain: "operations" as const,
    title: `SCRIMED Work browser verification ${suffix}`,
    objective: "Verify a bounded no-PHI durable work lifecycle from the active AAL2 browser session.",
    requestedAutonomy: "recommend" as const,
    riskLevel: "moderate" as const,
    definitionOfDone: {
      goal: "Persist, replay, transition, evidence, and cancel one synthetic SCRIMED Work verification session.",
      allowedScope: ["synthetic metadata", "durable audit evidence", "bounded cancellation cleanup"],
      prohibitedActions: [
        "live PHI",
        "diagnosis",
        "treatment",
        "prescribing",
        "patient outreach",
        "payer submission",
        "EHR writeback"
      ],
      requiredEvidence: ["AAL2 tenant session", "durable lifecycle record", "idempotency evidence"],
      successCriteria: ["session persisted", "replays verified", "invalid transition denied", "session cancelled"],
      stoppingConditions: ["PHI detected", "authorization denied", "durable store unavailable", "timeout"],
      timeoutMs: 120000,
      maximumSteps: 9,
      maximumToolCalls: 9,
      maximumEstimatedCostUsd: 0,
      humanApprovalRequired: true,
      rollbackPlan: "Cancel the synthetic session, preserve append-only evidence, and distribute no artifact.",
      verificationChecks: [
        "schema validity",
        "authorization",
        "tenant isolation",
        "idempotency",
        "lifecycle denial",
        "cancellation"
      ]
    }
  };
}

export function classifyScrimedWorkBrowserResponse(input: {
  actualStatus: number;
  expectedStatuses: number[];
  blockedStatuses?: number[];
}): ScrimedWorkBrowserCheckStatus {
  if (input.expectedStatuses.includes(input.actualStatus)) return "pass";
  if (input.blockedStatuses?.includes(input.actualStatus)) return "blocked";
  return "fail";
}

export function isScrimedWorkBrowserVerificationComplete(
  checks: Array<{ status: ScrimedWorkBrowserCheckStatus }>
) {
  return checks.length === scrimedWorkBrowserVerificationChecks.length && checks.every((check) => check.status === "pass");
}
