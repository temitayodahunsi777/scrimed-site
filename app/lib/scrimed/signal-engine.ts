import {
  validateSyntheticOperationalSignal,
  type SignalSeverity,
  type SyntheticOperationalSignal,
  type SyntheticTrustOpsEvent
} from "./trustops-schema";

type SignalRule = {
  eventType: string;
  signalId: string;
  severity: SignalSeverity;
  recommendedOwner: string;
  recommendedAction: string;
  reason: string;
};

const syntheticSignalBoundary =
  "Synthetic/demo signal only; requires human review and does not authorize live PHI, clinical action, patient outreach, payer submission, EHR writeback, billing submission, or production connector use.";

export const sampleSyntheticTrustOpsEvents: SyntheticTrustOpsEvent[] = [
  {
    id: "synthetic-event-denied-claim-spike",
    type: "denied_claim_spike",
    affectedWorkflow: "RCM / Denials",
    observedValue: 22,
    threshold: 10,
    unit: "denials per synthetic hour",
    synthetic: true,
    occurredAt: "2026-06-30T09:00:00.000Z"
  },
  {
    id: "synthetic-event-referral-delay",
    type: "referral_delay",
    affectedWorkflow: "Referral Management",
    observedValue: 9,
    threshold: 4,
    unit: "days in synthetic queue",
    synthetic: true,
    occurredAt: "2026-06-30T09:05:00.000Z"
  },
  {
    id: "synthetic-event-prior-auth-stalled",
    type: "prior_auth_stalled",
    affectedWorkflow: "Prior Authorization",
    observedValue: 6,
    threshold: 2,
    unit: "synthetic business days",
    synthetic: true,
    occurredAt: "2026-06-30T09:10:00.000Z"
  },
  {
    id: "synthetic-event-missing-documentation",
    type: "missing_documentation",
    affectedWorkflow: "Clinical Documentation / RCM",
    observedValue: 7,
    threshold: 1,
    unit: "missing packet fields",
    synthetic: true,
    occurredAt: "2026-06-30T09:15:00.000Z"
  },
  {
    id: "synthetic-event-imaging-turnaround-delay",
    type: "imaging_turnaround_delay",
    affectedWorkflow: "Imaging Intelligence",
    observedValue: 48,
    threshold: 24,
    unit: "synthetic hours",
    synthetic: true,
    occurredAt: "2026-06-30T09:20:00.000Z"
  },
  {
    id: "synthetic-event-care-gap-detected",
    type: "care_gap_detected",
    affectedWorkflow: "Population Health",
    observedValue: 14,
    threshold: 3,
    unit: "synthetic care gaps",
    synthetic: true,
    occurredAt: "2026-06-30T09:25:00.000Z"
  },
  {
    id: "synthetic-event-failed-api-sync",
    type: "failed_api_sync",
    affectedWorkflow: "Secure Middleware Gateway",
    observedValue: 5,
    threshold: 1,
    unit: "synthetic sync failures",
    synthetic: true,
    occurredAt: "2026-06-30T09:30:00.000Z"
  },
  {
    id: "synthetic-event-duplicate-patient-context",
    type: "duplicate_patient_context",
    affectedWorkflow: "Patient Journey Memory",
    observedValue: 2,
    threshold: 1,
    unit: "synthetic duplicate contexts",
    synthetic: true,
    occurredAt: "2026-06-30T09:35:00.000Z"
  },
  {
    id: "synthetic-event-low-confidence-agent-output",
    type: "low_confidence_agent_output",
    affectedWorkflow: "Clinical Intelligence",
    observedValue: 42,
    threshold: 70,
    unit: "confidence score",
    synthetic: true,
    occurredAt: "2026-06-30T09:40:00.000Z"
  },
  {
    id: "synthetic-event-compliance-sensitive-task",
    type: "compliance_sensitive_task",
    affectedWorkflow: "Governance / Compliance",
    observedValue: 1,
    threshold: 1,
    unit: "sensitive synthetic task",
    synthetic: true,
    occurredAt: "2026-06-30T09:45:00.000Z"
  }
];

const signalRules: SignalRule[] = [
  {
    eventType: "denied_claim_spike",
    signalId: "denied_claim_spike",
    severity: "high",
    recommendedOwner: "Revenue Cycle Lead",
    recommendedAction: "Open a synthetic denial-pattern investigation packet for manual review.",
    reason: "Synthetic denial volume exceeded the configured threshold and may indicate documentation or coding workflow friction."
  },
  {
    eventType: "referral_delay",
    signalId: "referral_delay",
    severity: "high",
    recommendedOwner: "Referral Operations Lead",
    recommendedAction: "Request human review of delayed synthetic referrals and owner routing.",
    reason: "Synthetic referral queue time exceeded the threshold and could become leakage risk in a governed pilot."
  },
  {
    eventType: "prior_auth_stalled",
    signalId: "prior_auth_stalled",
    severity: "high",
    recommendedOwner: "Prior Authorization Lead",
    recommendedAction: "Queue stalled synthetic prior-auth packets for manual verification.",
    reason: "Synthetic authorization tasks remained unresolved beyond the safe review threshold."
  },
  {
    eventType: "missing_documentation",
    signalId: "missing_documentation",
    severity: "medium",
    recommendedOwner: "Clinical Documentation Lead",
    recommendedAction: "Regenerate the missing synthetic documentation packet for reviewer inspection.",
    reason: "Required synthetic packet fields are missing and should not move forward without validation."
  },
  {
    eventType: "imaging_turnaround_delay",
    signalId: "imaging_turnaround_delay",
    severity: "medium",
    recommendedOwner: "Imaging Operations Lead",
    recommendedAction: "Retry the synthetic imaging-status workflow and route the result to manual review.",
    reason: "Synthetic imaging turnaround exceeded the configured threshold."
  },
  {
    eventType: "care_gap_detected",
    signalId: "care_gap_detected",
    severity: "high",
    recommendedOwner: "Population Health Lead",
    recommendedAction: "Request human review of the synthetic care-gap packet.",
    reason: "Synthetic care-gap signals require review before any patient-facing or outreach-adjacent workflow is considered."
  },
  {
    eventType: "failed_api_sync",
    signalId: "failed_api_sync",
    severity: "medium",
    recommendedOwner: "Platform Reliability Lead",
    recommendedAction: "Re-run synthetic middleware validation and inspect the failed sync trace.",
    reason: "Synthetic middleware sync failures may indicate connector readiness or schema drift issues."
  },
  {
    eventType: "duplicate_patient_context",
    signalId: "duplicate_patient_context",
    severity: "critical",
    recommendedOwner: "Data Governance Lead",
    recommendedAction: "Reconcile duplicate synthetic contexts through manual verification.",
    reason: "Duplicate context signals are safety-sensitive even in synthetic mode and must block automation."
  },
  {
    eventType: "low_confidence_agent_output",
    signalId: "low_confidence_agent_output",
    severity: "critical",
    recommendedOwner: "Clinical QA Lead",
    recommendedAction: "Pause automation and route the synthetic agent output to qualified review.",
    reason: "Low-confidence clinical-adjacent outputs must not continue without reviewer disposition."
  },
  {
    eventType: "compliance_sensitive_task",
    signalId: "compliance_sensitive_task",
    severity: "critical",
    recommendedOwner: "Compliance Lead",
    recommendedAction: "Escalate the synthetic sensitive task to compliance review.",
    reason: "Compliance-sensitive task classification requires explicit human review and retained hard stops."
  }
];

function isTriggered(event: SyntheticTrustOpsEvent) {
  if (event.type === "low_confidence_agent_output") {
    return event.observedValue <= event.threshold;
  }

  return event.observedValue >= event.threshold;
}

export function detectSyntheticOperationalSignals(events = sampleSyntheticTrustOpsEvents): SyntheticOperationalSignal[] {
  return events.flatMap((event) => {
    const rule = signalRules.find((candidate) => candidate.eventType === event.type);

    if (!rule || !event.synthetic || !isTriggered(event)) {
      return [];
    }

    return [
      {
        id: rule.signalId,
        severity: rule.severity,
        affectedWorkflow: event.affectedWorkflow,
        recommendedOwner: rule.recommendedOwner,
        recommendedAction: rule.recommendedAction,
        automationEligibility: "manual-review-required",
        humanReviewRequired: true,
        reason: `${rule.reason} Observed ${event.observedValue} ${event.unit}; threshold ${event.threshold}.`,
        safetyBoundary: syntheticSignalBoundary
      }
    ];
  });
}

export function validateSyntheticSignalSet(signals = detectSyntheticOperationalSignals()) {
  const validations = signals.map(validateSyntheticOperationalSignal);

  return {
    status: validations.every((result) => result.valid) ? "pass" : "fail",
    validations
  };
}
