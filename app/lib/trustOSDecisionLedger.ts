import type { PilotWorkspaceRecord } from "./protectedPilotWorkspace";
import type { TrustDecision, TrustOSDecisionRecord } from "./trustOS";

export type TrustOSReviewEventType =
  | "review-disposition-recorded"
  | "outcome-signal-recorded"
  | "governance-packet-downloaded";

export type TrustOSReviewDisposition =
  | "approved"
  | "rejected"
  | "modified"
  | "escalated"
  | "noted";

export type TrustOSReviewReasonCode =
  | "synthetic-approved"
  | "evidence-gap"
  | "policy-exception"
  | "boundary-violation"
  | "human-judgment"
  | "workflow-completed"
  | "packet-export";

export type TrustOSOutcomeMetrics = {
  timeSavedMinutes?: number;
  overrideAccepted?: boolean;
  escalationResolved?: boolean;
  workflowOutcome?: "synthetic-complete" | "held-for-review" | "denied-as-designed";
  reviewDurationMinutes?: number;
};

export type TrustOSDecisionLedgerRecord = {
  id: string;
  workspaceId: string;
  pilotSessionId: string | null;
  decisionId: string;
  traceId: string;
  policyVersion: string;
  workflow: string;
  decision: TrustDecision;
  confidence: number;
  uncertainty: number;
  decisionRecord: TrustOSDecisionRecord;
  createdBy: string;
  createdAt: string;
};

export type TrustOSReviewEventRecord = {
  id: string;
  workspaceId: string;
  trustOSDecisionId: string;
  actorUserId: string;
  eventType: TrustOSReviewEventType;
  disposition: TrustOSReviewDisposition;
  reasonCode: TrustOSReviewReasonCode;
  notes: string;
  outcomeMetrics: TrustOSOutcomeMetrics;
  createdAt: string;
};

export type TrustOSReviewInput = {
  eventType: Exclude<TrustOSReviewEventType, "governance-packet-downloaded">;
  disposition: Exclude<TrustOSReviewDisposition, "noted">;
  reasonCode: Exclude<TrustOSReviewReasonCode, "packet-export">;
  notes: string;
  outcomeMetrics: TrustOSOutcomeMetrics;
};

export const trustOSDecisionLedgerBoundary =
  "The TrustOS Decision Ledger retains tenant-isolated, metadata-only synthetic pilot and enterprise assessment evidence. It prohibits raw request context, PHI, patient identifiers, live clinical records, and autonomous clinical execution.";

export const trustOSDecisionLedgerNoStoreHeaders = {
  "Cache-Control": "private, no-store",
  Vary: "Authorization",
  "X-SCRIMED-Data-Boundary": "synthetic-metadata-only",
  "X-SCRIMED-Authentication": "aal2-required"
} as const;

const reviewEventTypes: TrustOSReviewInput["eventType"][] = [
  "review-disposition-recorded",
  "outcome-signal-recorded"
];
const dispositions: TrustOSReviewInput["disposition"][] = [
  "approved",
  "rejected",
  "modified",
  "escalated"
];
const reasonCodes: TrustOSReviewInput["reasonCode"][] = [
  "synthetic-approved",
  "evidence-gap",
  "policy-exception",
  "boundary-violation",
  "human-judgment",
  "workflow-completed"
];
const workflowOutcomes: NonNullable<TrustOSOutcomeMetrics["workflowOutcome"]>[] = [
  "synthetic-complete",
  "held-for-review",
  "denied-as-designed"
];
const prohibitedReviewPatterns = [
  /\b(phi|mrn|dob|ssn)\b/i,
  /\bmedical record\b/i,
  /\bpatient identifier\b/i,
  /\bmember id\b/i,
  /\bdate of birth\b/i,
  /\bprotected health information\b/i,
  /\bdiagnos(?:is|ed)\b/i
];

function safeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalBoundedNumber(value: unknown, maximum: number) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const number = Number(value);
  return Number.isInteger(number) && number >= 0 && number <= maximum ? number : null;
}

export function validateTrustOSReviewInput(payload: unknown):
  | { ok: true; review: TrustOSReviewInput }
  | { ok: false; message: string } {
  if (!payload || typeof payload !== "object") {
    return { ok: false, message: "A structured governance review is required." };
  }

  const body = payload as Record<string, unknown>;
  const eventType = safeString(body.eventType) as TrustOSReviewInput["eventType"];
  const disposition = safeString(body.disposition) as TrustOSReviewInput["disposition"];
  const reasonCode = safeString(body.reasonCode) as TrustOSReviewInput["reasonCode"];
  const notes = safeString(body.notes);
  const rawMetrics =
    body.outcomeMetrics && typeof body.outcomeMetrics === "object"
      ? (body.outcomeMetrics as Record<string, unknown>)
      : {};
  const timeSavedMinutes = optionalBoundedNumber(rawMetrics.timeSavedMinutes, 10080);
  const reviewDurationMinutes = optionalBoundedNumber(rawMetrics.reviewDurationMinutes, 1440);
  const workflowOutcome = safeString(rawMetrics.workflowOutcome) as TrustOSOutcomeMetrics["workflowOutcome"];

  if (!reviewEventTypes.includes(eventType)) {
    return { ok: false, message: "Select a supported review or outcome event type." };
  }
  if (!dispositions.includes(disposition)) {
    return { ok: false, message: "Select an accountable reviewer disposition." };
  }
  if (!reasonCodes.includes(reasonCode)) {
    return { ok: false, message: "Select a controlled governance reason code." };
  }
  if (notes.length > 600 || prohibitedReviewPatterns.some((pattern) => pattern.test(notes))) {
    return {
      ok: false,
      message: "Review notes must remain concise, operational, and free of PHI or patient-level clinical content."
    };
  }
  if (timeSavedMinutes === null || reviewDurationMinutes === null) {
    return { ok: false, message: "Outcome durations must be whole, non-negative minutes within the allowed range." };
  }
  if (workflowOutcome && !workflowOutcomes.includes(workflowOutcome)) {
    return { ok: false, message: "Select a supported synthetic workflow outcome." };
  }

  return {
    ok: true,
    review: {
      eventType,
      disposition,
      reasonCode,
      notes,
      outcomeMetrics: {
        ...(timeSavedMinutes === undefined ? {} : { timeSavedMinutes }),
        ...(reviewDurationMinutes === undefined ? {} : { reviewDurationMinutes }),
        ...(typeof rawMetrics.overrideAccepted === "boolean"
          ? { overrideAccepted: rawMetrics.overrideAccepted }
          : {}),
        ...(typeof rawMetrics.escalationResolved === "boolean"
          ? { escalationResolved: rawMetrics.escalationResolved }
          : {}),
        ...(workflowOutcome ? { workflowOutcome } : {})
      }
    }
  };
}

function formatMetrics(metrics: TrustOSOutcomeMetrics) {
  const lines = [
    metrics.timeSavedMinutes === undefined ? null : `- Time saved: ${metrics.timeSavedMinutes} minutes`,
    metrics.reviewDurationMinutes === undefined
      ? null
      : `- Review duration: ${metrics.reviewDurationMinutes} minutes`,
    metrics.overrideAccepted === undefined ? null : `- Override accepted: ${metrics.overrideAccepted}`,
    metrics.escalationResolved === undefined
      ? null
      : `- Escalation resolved: ${metrics.escalationResolved}`,
    metrics.workflowOutcome ? `- Workflow outcome: ${metrics.workflowOutcome}` : null
  ].filter(Boolean);

  return lines.length > 0 ? lines.join("\n") : "- No outcome metrics attached.";
}

export function buildTrustOSGovernancePacket(
  workspace: PilotWorkspaceRecord,
  decision: TrustOSDecisionLedgerRecord,
  reviewEvents: TrustOSReviewEventRecord[]
) {
  const record = decision.decisionRecord;
  const controls = record.controls
    .map(
      (control) =>
        `- ${control.component}: ${control.status} | ${control.reason} | Required action: ${control.requiredAction}`
    )
    .join("\n");
  const evidence = record.evidence
    .map(
      (source) =>
        `- ${source.title} | ${source.owner} | ${source.version} | validated ${source.validationTimestamp}`
    )
    .join("\n");
  const reviews = reviewEvents
    .filter((event) => event.eventType !== "governance-packet-downloaded")
    .map(
      (event) => `### ${event.createdAt}
- Event: ${event.eventType}
- Disposition: ${event.disposition}
- Reason: ${event.reasonCode}
- Reviewer: ${event.actorUserId}
- Notes: ${event.notes || "No operational note attached."}
${formatMetrics(event.outcomeMetrics)}`
    )
    .join("\n\n");

  return `# SCRIMED TrustOS Governance Packet

## Tenant Workspace
- Tenant: ${workspace.tenantName}
- Workspace: ${workspace.name}
- Workspace status: ${workspace.status}

## Decision Record
- Ledger ID: ${decision.id}
- TrustOS decision ID: ${decision.decisionId}
- Clinical Trace ID: ${decision.traceId}
- Policy version: ${decision.policyVersion}
- Workflow: ${decision.workflow}
- Decision: ${decision.decision}
- Confidence: ${decision.confidence}%
- Uncertainty: ${decision.uncertainty}%
- Created: ${decision.createdAt}
- Created by: ${decision.createdBy}

## Decision Summary
${record.summary}

## Control Evidence
${controls || "- No control evidence attached."}

## Evidence Sources
${evidence || "- No registered evidence sources attached."}

## Human Review And Outcome Events
${reviews || "- No human review or outcome events recorded yet."}

## Clinical Trace Capture Boundary
${record.clinicalTrace.captureBoundary}

## Product Boundary
${trustOSDecisionLedgerBoundary}

This packet documents governed synthetic or enterprise assessment evidence. It is not clinical advice, a production authorization, a reimbursement guarantee, or evidence of autonomous clinical execution.
`;
}
