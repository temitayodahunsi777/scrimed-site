export const scrimedWorkReviewPreparationPolicyVersion =
  "scrimed-work-review-preparation-v2026-07-15";

export const scrimedWorkReviewPreparationBoundary =
  "SCRIMED Work review preparation creates one tenant-scoped synthetic/no-PHI session and one metadata-only artifact, advances the session only to the independent-review checkpoint, and leaves external distribution, payer submission, EHR writeback, patient outreach, clinical authority, connector activation, certification claims, and customer go-live disabled.";

export type ScrimedWorkReviewPreparationCheckId =
  | "platform-posture"
  | "session-created"
  | "session-planned"
  | "artifact-created"
  | "approval-gate-reached"
  | "self-approval-denied"
  | "authoritative-state-confirmed";

export type ScrimedWorkReviewPreparationCheckStatus =
  | "pending"
  | "pass"
  | "blocked"
  | "fail";

export type ScrimedWorkReviewPreparationCheck = {
  id: ScrimedWorkReviewPreparationCheckId;
  label: string;
  purpose: string;
};

export const scrimedWorkReviewPreparationChecks: ScrimedWorkReviewPreparationCheck[] = [
  {
    id: "platform-posture",
    label: "Protected Store",
    purpose: "Confirm the approved no-PHI durable store is enabled."
  },
  {
    id: "session-created",
    label: "Bounded Session",
    purpose: "Persist one tenant-scoped synthetic work session."
  },
  {
    id: "session-planned",
    label: "Governed Plan",
    purpose: "Record the Definition-of-Done planning transition."
  },
  {
    id: "artifact-created",
    label: "Review Artifact",
    purpose: "Persist one metadata-only internal-review artifact."
  },
  {
    id: "approval-gate-reached",
    label: "Approval Gate",
    purpose: "Pause the session before independent reviewer approval."
  },
  {
    id: "self-approval-denied",
    label: "Separation of Duties",
    purpose: "Prove the session creator cannot approve the same work."
  },
  {
    id: "authoritative-state-confirmed",
    label: "Durable Handoff",
    purpose: "Confirm the authoritative session remains awaiting independent review."
  }
];

export function buildScrimedWorkReviewPreparationPayload(
  workspaceSlug: string,
  suffix: string
) {
  return {
    workspaceSlug,
    tenantId: "resolved-by-protected-membership",
    organizationScope: workspaceSlug,
    workspaceDomain: "operations" as const,
    title: `SCRIMED Work independent review evidence ${suffix}`,
    objective:
      "Prepare bounded synthetic/no-PHI evidence for a separately authenticated reviewer.",
    requestedAutonomy: "recommend" as const,
    riskLevel: "moderate" as const,
    definitionOfDone: {
      goal: "Bind one synthetic artifact to independent AAL2 approval and review evidence.",
      allowedScope: [
        "synthetic metadata",
        "tenant-scoped review preparation",
        "internal-use artifact review",
        "durable audit evidence"
      ],
      prohibitedActions: [
        "live PHI",
        "diagnosis",
        "treatment",
        "prescribing",
        "patient outreach",
        "payer submission",
        "EHR writeback",
        "external distribution"
      ],
      requiredEvidence: [
        "AAL2 tenant operator",
        "independent reviewer approval",
        "reviewer-only queue evidence",
        "mandatory verification result"
      ],
      successCriteria: [
        "session persisted",
        "artifact persisted",
        "self-approval denied",
        "independent review checkpoint reached"
      ],
      stoppingConditions: [
        "PHI detected",
        "authorization denied",
        "durable store unavailable",
        "separation of duties unavailable",
        "timeout"
      ],
      timeoutMs: 180000,
      maximumSteps: 8,
      maximumToolCalls: 8,
      maximumEstimatedCostUsd: 0,
      humanApprovalRequired: true,
      rollbackPlan:
        "Cancel incomplete synthetic preparation, retain append-only audit evidence, and distribute no artifact.",
      verificationChecks: [
        "schema validity",
        "tenant authorization",
        "policy compliance",
        "human approval",
        "artifact review",
        "rollback readiness"
      ]
    }
  };
}

export function isScrimedWorkReviewPreparationReady(input: {
  checks: Array<{ status: ScrimedWorkReviewPreparationCheckStatus }>;
  sessionId: string | null;
  artifactId: string | null;
}) {
  return (
    input.checks.length === scrimedWorkReviewPreparationChecks.length &&
    input.checks.every((check) => check.status === "pass") &&
    typeof input.sessionId === "string" &&
    /^work_session_[a-z0-9_]{8,80}$/.test(input.sessionId) &&
    typeof input.artifactId === "string" &&
    /^artifact_[a-z0-9_]{8,100}$/.test(input.artifactId)
  );
}
